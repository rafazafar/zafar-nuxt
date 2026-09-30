---
title: "Building a BLE Reconnect Soak Tester"
description: "A practical testing approach for mobile apps that need evidence for Bluetooth reconnect behavior instead of another hopeful demo."
date: 2026-07-02
image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop"
minRead: 4
---

A short Bluetooth demo can be reassuring. The app connects, data appears, and the sensor reconnects after a power cycle. Then someone locks the phone and leaves it alone for twenty minutes.

That is the test I care about. Add a broker restart, Low Power Mode, or a battery policy that stops background work, and the result may be very different from the demo.

For products that depend on BLE, I like to build a separate soak tester. It gives me a controlled place to leave the system running, interrupt it, and measure what happens next.

## Keep the tester focused

The product app has onboarding, permissions, names, patient context, alerts, and settings to manage. Those features matter, but they make a reconnect failure harder to isolate.

The tester needs a smaller set of controls: bind known peripherals, connect or disconnect each slot, publish a simple telemetry stream, pause reconnect work, and export events. Connection state and broker state should be visible throughout the run.

The product app still needs testing. The separate tool makes repeated reliability experiments easier to set up and compare.

## Use a repeatable peripheral

I used a second phone running nRF Connect as a mock heart-rate device. It advertised a known service, accepted connections, and replayed characteristic updates in a loop. That let me exercise scanning, authorization, connection, reconnect, and publishing without needing scarce sensor hardware for every run.

I could stop the advertiser, change its data, restart the macro loop, or repeat a scripted case. That removed some uncertainty about what the peripheral was doing.

Real sensors are still necessary for firmware compatibility tests. The mock lets me work through dozens of controlled cases first.

## Give each slot its own state

A monitoring app can have several bound devices. One global BLE status cannot describe them all.

For each slot, I need to distinguish unconfigured, bound but disconnected, connecting, connected and publishing, intentionally paused, and failed with a visible reason. A “pause all” control must preserve those differences.

If slot 1 reconnects and slot 3 does not, the export must retain both results.

## Record the path back to a sample

Missing data in a viewer can start at several points. The peripheral may not advertise. The phone may not scan or wake. The app may connect without subscribing again. Samples may resume while publishing fails. The broker or viewer connection may be stale.

<figure class="concept concept--timeline">
<div class="concept-title">Measure each recovery boundary</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17v4 M9 12v9 M15 7v14 M21 2v19"/></svg><strong>Peripheral available</strong><span>Record the return of advertising.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 7a9 9 0 0 0-16 3 M4 3v7h7 M4 17a9 9 0 0 0 16-3 M20 21v-7h-7"/></svg><strong>Connected and subscribed</strong><span>Separate connection from GATT setup.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18 M12 7v5l4 2"/></svg><strong>First sample</strong><span>Record when sensor data resumes.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9z"/></svg><strong>First publish</strong><span>Measure broker recovery separately.</span></li>
</ol>
<figcaption>Use the same case ID and slot for the timeline. A gap between events identifies where to investigate.</figcaption>
</figure>

At minimum, I record when a peripheral is selected or bound, when a connection attempt starts, and when it connects. I also record service discovery, notification subscription, the first sample after reconnect, broker connection, the first publish, and the disconnect reason when available.

JSON or CSV is enough. Each record needs a case, slot, event, and timestamp:

```json
{
  "caseId": "ios-locked-power-cycle-025m",
  "slot": 3,
  "event": "first_publish_after_reconnect",
  "elapsedMs": 61240,
  "condition": "locked_screen_after_peripheral_power_cycle"
}
```

One long iOS test made the result clear. The wearable returned, but samples and publishes did not resume while the phone stayed locked. Unlocking brought the app back to the fast path. Once BLE samples resumed, publishing resumed too.

That timeline helped separate the Bluetooth wake delay from broker recovery. Without it, the report would have said little more than “reconnect is unreliable.”

## Make long runs easy to read

The test screen should show current slot state, last sample time, last publish time, broker readiness, and reconnect attempts. Pause, resume, and export controls need to be easy to find.

Give every run a case ID and a clear condition label. After several runs, an unlabeled screenshot is difficult to match to an export. Case IDs let me compare foreground use, background use, locked screens, Low Power Mode, broker restarts, sensor power cycles, and long idle periods.

## Keep platform results separate

Android may continue reconnect work through a foreground service and a bounded wake lock. Results still depend on permissions, battery policy, device vendor behavior, and user settings. On iOS, event delivery can be delayed while the phone is locked with the screen off.

I use a separate result for each platform and condition:

- Foreground operation.
- Background operation with the screen on.
- Background operation with the screen locked.
- Short and long peripheral outages.
- Broker outage followed by recovery.
- Force-quit app.
- Device reboot.

Each result needs a measured delay or a clear failure state. Success on one platform does not fill in the other platform's row.

## Use the results in the product description

“Auto reconnect is supported” leaves too much unsaid. The test evidence allows more useful statements: reconnect continued under the tested Android foreground-service conditions; iOS foreground recovery used the fast path; locked-screen iOS recovery was delayed or absent until user interaction.

In the failures we observed, MQTT resumed with BLE samples, which put the main delay upstream of the broker. For unattended operation, those results supported Android under controlled device policy. An iOS workflow could require the app to stay in the foreground, depending on its needs.

A soak tester earns its place when it gives engineering, product, and operations enough evidence to make that choice. Leave it running through the states a short demo never reaches.

This article is part of a series on realtime wearable monitoring. The companion pieces cover [why iOS background BLE is not Android background BLE](/blog/ios-background-ble-is-not-android-background-ble) and [designing telemetry around unreliable local infrastructure](/blog/realtime-telemetry-unreliable-local-infrastructure).
