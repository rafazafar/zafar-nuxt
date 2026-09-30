---
title: "Designing Realtime Telemetry When Local Infrastructure Disappears"
description: "BLE, MQTT5, local brokers, and product decisions for systems where the network path is allowed to go away."
date: 2026-07-03
image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop"
minRead: 4
---

The local machine that received live telemetry could be turned off for hours. That was an allowed use of the system.

In this monitoring project, the machine might host a broker and monitoring services during the day, then shut down overnight. Phones and wearable sensors could keep running. When the machine returned, users expected monitoring to recover cleanly.

The transport was only part of the problem. We also had to decide what the system should promise during the gap.

## Decide what an outage means

“Phones publish over MQTT and viewers subscribe” describes the normal path. It leaves several product decisions open.

Can the system lose packets? Should the phone store data while disconnected? Will delayed data still be useful? How will the viewer tell a current sample from an old one? Who owns identity, sessions, and patient context when the local authority is unavailable?

Cloud access raises another question: does it change who controls the session, or just how messages travel?

If the team leaves these questions unanswered, the implementation will still choose a behavior. A retry loop or cache can make a policy decision without anyone recognizing it as one.

## Restore live monitoring before adding full replay

For this kind of live monitoring, I prefer to make recovery work first. When infrastructure returns, the phone should reconnect and visibly resume current telemetry.

<figure class="concept concept--split">
<div class="concept-title">Two different recovery promises</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17v4 M9 12v9 M15 7v14 M21 2v19"/></svg><strong>Resume live data</strong><span>Reconnect and show current samples again.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6 M3 12c0 4 18 4 18 0"/></svg><strong>Replay history</strong><span>Store, order, deduplicate, and label older samples.</span></li>
</ol>
<figcaption>Restoring the live stream does not recover the data missed during an outage.</figcaption>
</figure>

Backfill can be useful, but it needs its own requirements. Recorded time must take precedence over arrival time. Reconnects need deduplication. The system needs clear session ownership, storage limits, and limits on battery and memory use.

The viewer must also show that replayed data is old. A delayed value must not look like a current measurement, and the team must agree on what delayed data means operationally.

A small diagnostic buffer and lossless overnight replay are different features. Agree on which one the product needs before building either.

## Make the MQTT contract explicit

MQTT gives phones, local services, cloud services, and viewers a shared messaging model. To use it consistently, the clients need to agree on topics, identifiers, payloads, QoS, retained messages, protocol version, and failure behavior.

For this deployment, I preferred MQTT5 over secure WebSockets (WSS). The same contract had to pass through local and cloud routes that suited HTTPS-style traffic better than separate MQTT/TLS ports. Native mobile applications can use MQTT over TLS TCP in other deployments. Here, one transport requirement reduced accidental variation.

A client that could not connect with MQTT5 needed to fail visibly. Quietly falling back to MQTT 3.1.1 would have added another set of session behavior, reason codes, properties, and broker settings to support.

The sanitized topic structure was deliberately plain:

```text
monitoring/{facility_id}/{room_id}/{device_id}/hrm
monitoring/{facility_id}/{room_id}/{device_id}/device
```

Facility, room, and device identifiers are shared concepts. Their meaning belongs in the contract, so every application does not need to infer it independently.

## Keep deployment choices in one place

Some installations need local-only operation. Others need local infrastructure with cloud access. Smaller installations may have no central local machine.

I separate the responsibilities that change between those profiles:

- Authentication and actor identity.
- Session and assignment authority.
- Telemetry transport.
- Session feeds for viewers.
- Patient-context storage and data residency.
- Admin read and write sources.

Select the implementations when composing the application. A screen that needs a session feed should use that interface without checking the deployment profile itself. This keeps deployment policy from spreading through screens and services.

## Show the state the user is actually in

The UI needs names for live data, last-known data, a disconnected device, an unavailable broker, an offline viewer, delayed replay, and intentionally paused monitoring.

Those states can share code, but they mean different things to a user. A stale heart-rate value must not look current. An intentional pause must not look like a failed reconnect. A server outage must not look like a wearable disconnection.

This ties observability to interface design. The runtime has to identify the state before the UI can explain it.

## Keep the evidence close to the implementation

For systems used around health workflows, I want architecture decisions near the code and requirements linked to implementation and tests. External libraries, SDKs, OS APIs, and cloud services need to be tracked as dependencies. Known platform limits need documentation, and release decisions need test evidence.

These habits support later review. They do not replace regulatory, clinical, security, or privacy review.

Short ADRs and product requirement notes helped us more than long documents written afterward. They brought unanswered questions into view while we could still change the design cheaply.

Before promising live-only operation, bounded recovery, or lossless history, decide which result the users need. Make the same explicit decision about unattended mobile operation and whether patient context may cross a cloud boundary. Each answer changes the code we should build.

This article is part of a series on realtime wearable monitoring. The companion pieces cover [why iOS background BLE is not Android background BLE](/blog/ios-background-ble-is-not-android-background-ble) and [building a BLE reconnect soak tester](/blog/building-a-ble-reconnect-soak-tester).
