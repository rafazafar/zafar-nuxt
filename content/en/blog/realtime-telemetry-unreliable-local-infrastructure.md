---
title: "Designing Realtime Telemetry When Local Infrastructure Disappears"
description: "BLE, MQTT5, local brokers, and product decisions for systems where the network path is allowed to go away."
date: 2026-07-03
image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop"
minRead: 9
author:
  name: Zafar
  avatar:
    src: https://r2.zafar.dev/img/profile.jpg
    alt: Zafar
---

# Designing Realtime Telemetry Around Unreliable Local Infrastructure

The first uncomfortable requirement was simple: the local machine that received live telemetry might be turned off for hours, and that was allowed.

Realtime systems are often described as if the infrastructure is always there and the only interesting question is how fast messages move through it.

That is not always the real problem.

In one health-adjacent monitoring project, the difficult constraint was not only that wearable devices produced live data. It was that parts of the local infrastructure could be unavailable by design. A local machine might host a broker and monitoring services during the day, then be powered down overnight. Phones and sensors could keep operating. Users still expected the system to recover cleanly when the local infrastructure returned.

This kind of environment forces a useful discipline: you have to separate engineering problems from policy decisions.

## The Architecture Sentence Is Not Enough

It is easy to say: "phones publish telemetry over MQTT and viewers subscribe."

That sentence hides the hard parts:

- What happens when the broker is offline?
- Is packet loss acceptable?
- Should the phone buffer data while disconnected?
- If buffered data arrives late, is it still clinically or operationally useful?
- How should viewers distinguish live data from delayed data?
- Which system owns identity, session state, and patient context?
- Does cloud access change the authority model or only the transport path?

These are not implementation details. They are product and safety decisions.

If the team does not answer them explicitly, engineers will answer them accidentally through code. A retry loop here, a local cache there, a hidden fallback somewhere else. That is how systems become hard to reason about.

## Reconnect First, Backfill Second

For live monitoring, reconnect reliability is often more valuable than ambitious backfill.

That sounds counterintuitive. Data loss feels bad, so the instinct is to buffer everything. But full backfill has real complexity:

- You need recorded-time ordering, not receive-time ordering.
- You need deduplication across reconnects.
- You need clear session ownership when the local authority was offline.
- You need limits for storage, battery, and memory.
- You need UI that does not confuse stale data with live monitoring.
- You need risk language around what delayed data means.

If the product is primarily live monitoring, the first promise should be simpler: when infrastructure returns, the phone reconnects and live telemetry resumes visibly and predictably.

Backfill can still be valuable, but it should be an explicit feature with explicit limits. "Small bounded diagnostic buffer" and "full overnight lossless replay" are not the same requirement.

## MQTT Is A Contract, Not Just A Library

MQTT works well for this shape of system because it gives mobile apps, local services, cloud services, and viewers a shared messaging model. But the library choice is less important than the contract.

The contract needs to define:

- Topic structure.
- Identifier meaning.
- Payload shape.
- QoS expectations.
- Retained-message policy.
- Protocol version.
- Failure behavior when a client cannot satisfy the contract.

For this deployment shape, I prefer making MQTT5 over secure WebSockets the explicit platform requirement. WSS made sense because the same contract had to work through local and cloud-facing network paths that were friendlier to HTTPS-style routing than raw MQTT/TLS ports. Native mobile can absolutely use MQTT over TLS TCP in other deployments; the important choice here was to avoid supporting multiple transport personalities accidentally.

If a client cannot complete an MQTT5 connection, it should fail visibly rather than quietly falling back to MQTT 3.1.1 and creating a second compatibility surface. Silent downgrade is where subtle differences in session behavior, reason codes, properties, and broker configuration become production mysteries.

A sanitized topic contract looked roughly like this:

```text
monitoring/{facility_id}/{room_id}/{device_id}/hrm
monitoring/{facility_id}/{room_id}/{device_id}/device
```

That naming is not clever. That is the point. Device, room, and facility identifiers are shared concepts, so they belong in a shared contract rather than being rediscovered independently by every app.

That sounds strict, but strictness at the wire-contract boundary keeps the rest of the system honest. A monitor app, a viewer app, and a backend service can evolve independently only if they agree on what crosses the network.

## Keep Deployment Profiles Out Of Feature Code

The other big design pressure is deployment variation.

Some environments want local-only operation. Some want local infrastructure with cloud access. Some smaller deployments may not have a central local machine at all. Those profiles should not leak into every screen and service class.

The pattern I like is to define seams around responsibilities:

- Authentication and actor identity.
- Runtime authority for sessions and assignments.
- Telemetry transport.
- Viewer-facing session feeds.
- Patient-context storage and residency.
- Admin-facing read/write sources.

Application code should depend on those seams, not on raw profile checks. Profile selection should happen at composition time. If a screen needs a session feed, it should not care whether that feed is local, cloud-routed, or bridged.

This is not abstraction for its own sake. It prevents deployment policy from becoming a scattered conditional across the codebase.

## Degraded State Is A Product Feature

When infrastructure disappears, silence is dangerous.

The system needs to distinguish:

- Live data.
- Last known data.
- Disconnected device.
- Broker unavailable.
- Viewer offline.
- Data delayed or replayed after reconnect.
- Monitoring intentionally paused.

Those states may share implementation paths, but they should not collapse into the same user experience. A stale heart-rate value and a live heart-rate value are not equivalent. A paused slot and a failed reconnect are not equivalent. A local server outage and a wearable disconnection are not equivalent.

The engineering lesson is that observability and UX are connected. If the runtime cannot name the state, the UI cannot explain it. If the UI cannot explain it, users invent their own interpretation.

## Compliance Changes The Engineering Shape

Even when you are not writing final regulatory submissions, health-adjacent systems benefit from compliance-aware engineering habits:

- Record architecture decisions close to the code.
- Keep requirements traceable to implementation and tests.
- Treat external libraries, SDKs, OS APIs, and cloud services as managed dependencies.
- Document known platform limits instead of burying them in comments.
- Make release readiness depend on evidence, not only feature completion.

This does not mean turning every commit into paperwork. It means leaving enough evidence that future engineers can understand why the system behaves the way it does. It is engineering evidence hygiene, not a substitute for formal regulatory, clinical, security, or privacy review.

In practice, lightweight architecture decision records and product requirement notes were more useful than long retrospective documents. They forced unresolved policy decisions into the open before implementation made them expensive.

## The Main Lesson

The hard part of realtime telemetry is not always the realtime transport. Sometimes the hard part is deciding what the system is allowed to promise when the environment is unreliable.

Should it promise live monitoring only? Should it promise bounded recovery? Should it promise lossless history? Should it recommend one mobile platform over another for unattended operation? Should patient context ever cross a cloud boundary? Each answer changes the architecture.

The most valuable engineering work was making those questions explicit, then building the code around the answers instead of hiding ambiguity behind retries and caches.

That is the difference between a demo that moves data and a platform that can be operated, reviewed, and maintained.

This article is part of a short series on realtime wearable monitoring. The companion pieces cover [why iOS background BLE is not Android background BLE](/blog/ios-background-ble-is-not-android-background-ble) and [building a BLE reconnect soak tester](/blog/building-a-ble-reconnect-soak-tester).
