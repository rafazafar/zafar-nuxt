---
title: "iOS Won't Poll Your BLE Device Like Android Can"
description: "A field-tested look at Core Bluetooth restoration, Android foreground services, and why locked-screen reconnect promises need evidence."
date: 2026-07-04
image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop"
minRead: 8
author:
  name: Zafar
  avatar:
    src: https://r2.zafar.dev/img/profile.jpg
    alt: Zafar
---

# iOS Background BLE Is Not Android Background BLE

One of the easier mistakes to make in mobile engineering is to treat background execution as a product requirement rather than an operating-system negotiation.

That mistake becomes expensive when the product depends on Bluetooth Low Energy. A realtime monitoring app can have perfectly reasonable product language like "the device should reconnect automatically," but Android and iOS do not give you the same tools to implement that sentence.

Android's model is direct: you can run a foreground service, hold a bounded wake lock, keep a native BLE runtime alive, and retry connection work in a controlled loop. You still have to respect Doze, App Standby, runtime BLE permissions, foreground-service restrictions, OEM kill policies, and user battery settings. But the runtime model is recognizable: your app has a visible long-running responsibility, and Android gives you mechanisms to keep doing that work under tested device policy.

On iOS, the model is different. Core Bluetooth background mode is event-driven. It can wake your app for important Bluetooth events, preserve and restore central-manager state, and continue monitoring some pending connection work. It does not give you a permanent background process. It does not let you poll every few seconds while the phone is locked with the screen off. It does not let you make iOS behave like Android with a different retry loop.

That distinction changes both engineering strategy and product language.

## The Shape Of The Problem

The monitoring workflow I was working on had three moving parts:

- A phone connected to a wearable sensor over BLE.
- A realtime publishing path from the phone to a message broker.
- A viewer or downstream service consuming the live data.

When samples stopped appearing downstream, it was tempting to blame the transport layer. Maybe MQTT was stale. Maybe the WebSocket had not recovered. Maybe the broker client needed a more aggressive reconnect policy.

That was not the real boundary.

In locked-screen iOS tests, the publishing path resumed as soon as BLE samples resumed. The delay was upstream: iOS decided when the app got enough runtime to process Bluetooth events and reconnect. In one long locked-screen run, the wearable was power-cycled after roughly 25 minutes and did not reconnect or publish while the phone remained locked; after unlock, the app recovered and messages resumed. In other background cases, reconnect could be delayed by tens of seconds to about a minute. The message broker was not the primary cause of the missing data.

This matters because debugging the wrong layer leads to worse code. You can add more MQTT reconnect logic, more timers, and more state machines, and still not fix the locked-screen BLE behavior. The result is a larger app with the same platform limit.

## What Android Lets You Build

Android is not effortless, but it is more explicit for unattended monitoring.

A reliable Android approach usually includes:

- A foreground service for long-running monitoring work.
- A persistent notification that tells the user monitoring is active.
- BLE reconnect logic in native code or a well-controlled runtime layer.
- Battery optimization guidance for devices used in clinical or operational workflows.
- Clear handling for paused slots, unbound sensors, and intentionally disconnected devices.

The important point is not that Android always reconnects instantly. It is that Android lets the app own more of the reconnect loop under the tested foreground-service and battery-policy conditions. If the wearable goes away for twenty minutes and comes back, the app has a credible way to keep trying in the background.

That makes Android the more practical choice for unattended monitoring in controlled deployments, especially when the user expects the phone to sit locked while the wearable continues to operate.

## What iOS Actually Promises

iOS offers useful Core Bluetooth mechanisms, but they are not equivalent to a foreground service.

For central-mode BLE apps, the relevant mechanisms are:

- `bluetooth-central` background mode.
- State preservation and restoration through a restore identifier.
- Restoration callbacks for known central managers and peripherals.
- Pending connection requests that iOS may continue tracking.
- Event delivery when iOS decides the app should be woken.

Those are valuable tools. They are also bounded tools.

Background scanning behaves differently from foreground scanning. Duplicate advertisements are coalesced. Scan intervals can become longer when scanner apps are backgrounded. The system controls wake timing, app suspension, relaunch eligibility, and how much background execution time your app receives.

State restoration also has hard caveats. If the user force-quits the app, or if the device goes through certain Bluetooth or reboot states, iOS may not relaunch the app for restoration. A robust design has to treat those as operational states, not edge cases a retry loop can erase.

The consequence is simple: iOS background BLE should be treated as best-effort for locked, screen-off operation unless your product can tolerate the delay and uncertainty.

## The Live Activity Temptation

Newer iOS behavior around Live Activities can make Bluetooth background privileges look more promising. In some iOS versions, an app with an active Live Activity and an instantiated Bluetooth manager may get more foreground-like Bluetooth behavior in the background.

That does not make Live Activities a clean reliability primitive.

Live Activities are user-visible system UI. They appear on the Lock Screen or Dynamic Island. They have duration limits. Users can dismiss them. The system controls presentation. Updates can surface in ways that are not appropriate for a quiet health-adjacent monitoring workflow.

If your background reliability mechanism creates visible system-managed UI that staff do not understand, you may have traded one failure mode for another. For this kind of monitoring app, I would not use Live Activities as the main reconnect strategy unless the product explicitly wants that visible activity surface.

## A Better Engineering Goal

The realistic goal is not "make iOS behave like Android."

The better goal is:

- Use Core Bluetooth restoration correctly.
- Prefer pending connections to known peripherals when possible.
- Use service UUID filters when scanning is unavoidable.
- Reattach delegates and resubscribe after restoration.
- Keep MQTT publish recovery short after iOS wakes the app.
- Measure BLE wake time separately from broker publish time.
- Document residual delay as a platform constraint, not an app defect.

That last point is not a cop-out. It is what lets the team make honest product decisions.

In practice, the implementation details worth checking are concrete: create the `CBCentralManager` with a restoration identifier, handle `centralManager(_:willRestoreState:)`, reattach delegates to restored peripherals, rediscover services when restored state is incomplete, and resubscribe before declaring the slot healthy. For known peripherals, a pending `connect` request is a stronger primitive than hoping repeated background scans will fire on your preferred schedule.

For example, if the workflow requires unattended reconnect within a few seconds while the phone is locked overnight, Android should be the recommended platform. If iOS is required, the operational guidance may need to be screen-on, foregrounded, Auto-Lock disabled, or "best-effort while locked."

Those are product decisions, not just engineering details.

## The Debugging Lesson

The most useful debugging move was separating the pipeline into timing boundaries:

- When did the wearable become available again?
- When did the OS deliver a BLE event?
- When did the app reconnect and resubscribe?
- When did samples resume?
- When did the broker receive the next publish?

Without that separation, every outage looks like one vague reconnect problem. With it, you can say where the time is actually going.

That distinction changes the conversation with product managers and clients. Instead of promising "we will improve reconnect," you can say: "Android can own this retry loop. iOS can use restoration and pending connections, but locked-screen timing remains OS-controlled. Here is the measured range, and here is the workflow recommendation."

That is a much more useful answer.

## Takeaway

Cross-platform does not mean platform-identical.

Flutter can share a lot of UI, state, and domain logic across iOS and Android. BLE background execution is not one of the areas where you get identical behavior for free. The right abstraction is not one that hides the difference. It is one that exposes the difference early enough that the product can make a safe decision.

For realtime monitoring, that usually means treating Android as the stronger unattended platform, treating iOS locked-screen reconnect as best-effort, and designing tests that prove which layer is actually responsible for delay.

This article is part of a short series on realtime wearable monitoring. The companion pieces cover [designing telemetry around unreliable local infrastructure](/blog/realtime-telemetry-unreliable-local-infrastructure) and [building a BLE reconnect soak tester](/blog/building-a-ble-reconnect-soak-tester).
