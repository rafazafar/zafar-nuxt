---
title: "Building a BLE Reconnect Soak Tester"
description: "A practical testing approach for mobile apps that need evidence for Bluetooth reconnect behavior instead of another hopeful demo."
date: 2026-07-02
image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop"
minRead: 7
author:
  name: Zafar
  avatar:
    src: https://r2.zafar.dev/img/profile.jpg
    alt: Zafar
---

# Building a BLE Reconnect Soak Tester

Bluetooth reconnect behavior is one of those features that looks fine in a short demo and then fails in the conditions users actually care about.

The app connects. Data appears. You turn the peripheral off and on. It reconnects. Everyone feels good.

Then the phone locks. The screen turns off. The wearable disappears for twenty minutes. The broker restarts. The app is backgrounded. Low Power Mode is on. A battery policy kills something. The user returns later and asks why monitoring stopped.

That is why I like building a separate soak tester for BLE-heavy products.

## Why A Separate Tester Helps

You can test reconnect behavior inside the main app, but the main app is full of product concerns: onboarding, permissions, naming, patient context, alerts, settings, and UI state. Those are important, but they make reliability testing harder to isolate.

A soak tester can be narrower:

- Bind one or more known peripherals.
- Connect and disconnect slots independently.
- Publish a simple telemetry stream.
- Pause and resume reconnect behavior deliberately.
- Show connection and broker state plainly.
- Export timing and event data for analysis.

The goal is not to replace the product app. The goal is to create a controlled harness where reconnect behavior is easy to provoke, observe, and measure.

## Use Mock Devices When Real Devices Are Annoying

Real sensors are necessary eventually, but mock BLE peripherals are useful early.

For testing, I used a second phone running nRF Connect as a mock heart-rate device. The mock advertised a known service, accepted connections, and replayed characteristic updates in a loop. That made it possible to test the mobile app's scanning, authorization, connection, reconnect, and publish paths without depending on scarce hardware for every run.

The useful thing about a mock peripheral is repeatability. You can power the advertiser off, change advertising data, restart the macro loop, or run scripted scenarios without wondering whether the real device firmware is doing something undocumented.

Mocks do not prove firmware compatibility, but they let you run dozens of controlled scenarios before pulling scarce hardware back onto the bench.

## Test Slots, Not Just A Single Connection

A monitoring app often needs to handle more than one bound device. That means the test harness should not treat BLE as one global connection state.

Each slot needs its own lifecycle:

- Not configured.
- Bound but disconnected.
- Connecting.
- Connected and publishing.
- Paused intentionally.
- Failed with a visible reason.

Bulk controls are useful, but only if individual slots still remain understandable. "Pause all" should not erase the difference between a slot that is intentionally paused and a slot that failed to reconnect.

This model also makes test results easier to read. If slot 1 reconnects and slot 3 does not, you want the export to preserve that fact.

## Measure The Boundaries Separately

When downstream data stops, the cause can be anywhere in the chain:

- The peripheral is not advertising.
- The phone did not scan or wake.
- The app did not reconnect.
- The app reconnected but did not resubscribe.
- Samples resumed but publish failed.
- The broker connection was stale.
- The viewer was disconnected.

A useful soak tester records enough events to separate those cases.

At minimum, I want timestamps for:

- Peripheral selected or bound.
- Connect attempt started.
- Connected.
- Services discovered.
- Notifications subscribed.
- First sample received after reconnect.
- Broker connected.
- First publish after reconnect.
- Disconnect reason, when available.

Without this timeline, every issue becomes "reconnect is flaky." With it, you can tell whether the delay is BLE wake timing, GATT setup, broker recovery, or application state.

A useful export can be boring JSON or CSV. The important part is that each row names the case, slot, event, and timestamp:

```json
{
  "caseId": "ios-locked-power-cycle-025m",
  "slot": 3,
  "event": "first_publish_after_reconnect",
  "elapsedMs": 61240,
  "condition": "locked_screen_after_peripheral_power_cycle"
}
```

In one long locked-screen iOS case, the test showed the key product fact: after the wearable came back, no samples or publishes resumed while the phone stayed locked. Unlocking returned the app to the fast path. That result was more useful than another vague "iOS background reconnect is flaky" note because it separated BLE wake behavior from broker recovery.

## Design For Long, Boring Runs

Soak testing is supposed to be boring. The app should sit there, keep running, and produce evidence.

That changes the UI design. You do not need a beautiful product surface. You need a dense operational surface:

- Current slot state.
- Last sample time.
- Last publish time.
- Broker readiness.
- Reconnect attempts.
- Pause/resume controls.
- Export controls.
- Clear labels for test condition and case ID.

The case ID matters more than it seems. Once you run multiple scenarios, screenshots and logs become hard to connect. A case ID lets you compare exports across conditions like foreground, background, locked screen, Low Power Mode, broker restart, peripheral power cycle, and long idle periods.

## Separate Platform Claims

Do not let one platform's success become a cross-platform claim.

Android and iOS have different background execution models. Android may continue reconnect work through a foreground service and bounded wake lock, subject to battery policy, permissions, OEM behavior, and user settings. iOS may defer Bluetooth event delivery while locked and screen-off. A soak tester should make that difference visible rather than hiding it behind one green checkmark.

For a serious report, I want a matrix like:

- App in foreground.
- App backgrounded, screen on.
- App backgrounded, screen locked.
- Peripheral off for a short interval.
- Peripheral off for a long interval.
- Broker unavailable, then restored.
- App force-quit.
- Device rebooted.

Each platform gets its own result. Each result needs a measured delay or a clear failure state.

## The Product Value

The output of a soak tester is not just engineering confidence. It is better product language.

Instead of saying "auto reconnect is supported," you can say:

- In these tested Android foreground-service conditions, reconnect continued in the background.
- In these tested iOS foreground conditions, reconnect returned to the fast path.
- In locked-screen iOS conditions, reconnect was best-effort and could be delayed or absent until user interaction.
- In the observed failures, MQTT resumed when BLE samples resumed, so the delay was not primarily broker recovery.
- For unattended monitoring, the workflow should prefer Android under controlled device policy, or keep iOS foregrounded depending on the operational requirement.

That is the kind of specificity that prevents support issues later.

## Takeaway

BLE reconnect reliability is not a feature you can infer from a successful connection demo. You have to test the ugly states: locked phones, missing peripherals, stale brokers, long waits, and platform-specific background behavior.

A focused soak tester gives you a place to do that without dragging the full product through every experiment. It turns "seems flaky" into measured behavior, and measured behavior is what lets engineering, product, and operations make a defensible decision.

This article is part of a short series on realtime wearable monitoring. The companion pieces cover [why iOS background BLE is not Android background BLE](/blog/ios-background-ble-is-not-android-background-ble) and [designing telemetry around unreliable local infrastructure](/blog/realtime-telemetry-unreliable-local-infrastructure).
