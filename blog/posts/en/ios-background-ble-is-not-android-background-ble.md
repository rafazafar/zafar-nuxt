---
title: "iOS Won't Poll Your BLE Device Like Android Can"
description: "A field-tested look at Core Bluetooth restoration, Android foreground services, and why locked-screen reconnect promises need evidence."
date: 2026-07-04
image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop"
minRead: 4
---

In one locked-screen iOS test, I power-cycled a wearable after roughly 25 minutes. The phone did not reconnect or publish while it stayed locked. After I unlocked it, the app recovered and messages resumed.

The broker was an obvious suspect at first. Perhaps MQTT had a stale connection, or the WebSocket needed a better retry policy. But publishing resumed as soon as BLE samples returned. The long delay was earlier in the path.

That result changed how I described automatic reconnect. The product wanted the same behavior on Android and iOS. The operating systems gave us different ways to attempt it.

## Find the boundary before changing the retry loop

The workflow had a wearable connected to a phone over BLE, a publishing path from the phone to a broker, and a viewer consuming the live data.

When the viewer stopped receiving samples, I needed to separate those stages. In other iOS background cases, reconnect took tens of seconds to about a minute. In the longer locked-screen run, it did not recover until unlock.

Adding MQTT timers would not have solved the BLE wake delay. It would have added code around a different part of the system.

## Android gives the app more control over ongoing work

For unattended monitoring, Android provides a foreground service with a persistent notification. A bounded wake lock and a native BLE runtime can support reconnect work while the app is in the background.

This still needs testing. Doze, App Standby, runtime BLE permissions, foreground-service restrictions, device vendor policies, and user battery settings all affect the result.

The design also needs to distinguish paused slots, unbound sensors, and intentional disconnections. A service should not keep trying to reconnect a device the user deliberately stopped.

Under the tested service and battery-policy conditions, Android gave us a practical way to keep attempting a connection when a wearable returned after a long absence.

<figure class="concept concept--split">
<div class="concept-title">Who controls background reconnect?</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 7a9 9 0 0 0-16 3 M4 3v7h7 M4 17a9 9 0 0 0 16-3 M20 21v-7h-7"/></svg><strong>Android</strong><span>A foreground service can run reconnect work under tested device policy.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18 M12 7v5l4 2"/></svg><strong>iOS</strong><span>Core Bluetooth delivers events; the OS controls wake timing and runtime.</span></li>
</ol>
<figcaption>Both need device tests. An Android result cannot establish iOS locked-screen behavior.</figcaption>
</figure>

## iOS controls when background work runs

Core Bluetooth background mode is event-driven. With `bluetooth-central`, the app can receive Bluetooth events in the background. State preservation and restoration can retain central-manager state and pending connection work.

That does not give the app a permanent process or a polling interval it can enforce while the screen is off.

Background scanning also differs from foreground scanning. Duplicate advertisements can be combined, and scan intervals can increase when scanning apps are in the background. The system controls suspension, wake timing, relaunch eligibility, and the execution time it grants.

Restoration has limits too. A force-quit app, a reboot, or certain Bluetooth states can affect whether the system relaunches the app. These belong in the operating procedure and the test plan.

For our locked-screen workflow, I treated recovery as best-effort unless the product could tolerate the observed delays and uncertainty.

## A Live Activity changes the user experience too

Apple's [Core Bluetooth documentation](https://developer.apple.com/documentation/corebluetooth) describes foreground-like Bluetooth privileges for an app with an instantiated Bluetooth manager and an active Live Activity.

That deserves investigation for a product that wants a Live Activity. It also introduces a visible surface on the Lock Screen or Dynamic Island. Activities have duration limits, users can dismiss them, and the system controls their presentation.

For quiet monitoring, that is a product choice as well as an implementation choice. I would use it as a main reconnect strategy only if the product explicitly wanted the activity and testing supported the required behavior.

## Make restoration complete before calling the slot healthy

The iOS implementation still needs careful work. Create `CBCentralManager` with a restoration identifier and handle `centralManager(_:willRestoreState:)`. Reattach delegates to restored peripherals. If restored state is incomplete, rediscover services and subscribe again.

For a known peripheral, prefer a pending `connect` request where possible. If scanning is necessary, use service UUID filters. After the system wakes the app, keep the MQTT recovery path short.

These steps use the mechanisms iOS provides. Measure the delay that remains, and document the conditions in which it occurs.

## Turn the timeline into a useful requirement

For every reconnect case, record:

1. When the wearable becomes available.
2. When the OS delivers a BLE event.
3. When the app reconnects and subscribes.
4. When samples resume.
5. When the broker receives the next publish.

The measurements let us discuss a specific delay instead of one broad reconnect problem.

If the requirement is unattended reconnect within a few seconds while the phone stays locked overnight, I would favor Android under a tested device policy. If the product requires iOS, its operating procedure may need the app in the foreground, the screen on, and Auto-Lock disabled. Alternatively, it must accept best-effort recovery while locked. Neither choice should be presented as a guarantee without the corresponding tests.

Flutter can share UI, state, and domain logic across platforms. The BLE abstraction still needs to expose the background limits so the product team can choose a workflow that matches them.

This article is part of a series on realtime wearable monitoring. The companion pieces cover [designing telemetry around unreliable local infrastructure](/blog/realtime-telemetry-unreliable-local-infrastructure) and [building a BLE reconnect soak tester](/blog/building-a-ble-reconnect-soak-tester).
