---
title: "What happens when a dependency fails?"
description: "Circuit breakers, resource isolation, and recovery paths that keep an outage from stopping everything."
date: 2025-10-15
image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800"
minRead: 3
tags:
  - Resilience
  - Reliability
  - Architecture
  - DevOps
---

At AXA, a third-party API outage gave us a useful test of our design. Circuit breakers stopped repeated calls to the failing service, and the application fell back to cached data. Other systems went down; ours continued with reduced functionality.

That experience shaped how I think about reliability. I want to know what a user can still do when a dependency fails, and how we will tell that recovery has worked.

## Name the failures you expect

The failures I have encountered fall into three broad groups. Infrastructure failures include crashed servers, network partitions, broken disks, and data center outages. Software failures include memory leaks, infinite loops, resource exhaustion, and deployment bugs. Dependencies add their own failures: unavailable APIs, database connection problems, failed caches, and broker outages.

Each needs a response. A retry policy alone cannot cover all of them.

## Stop repeated calls to a failing service

A circuit breaker temporarily blocks calls after failures reach a threshold. Set that threshold from observed behavior, and include a half-open state to test recovery. Give callers a fallback or a visible error.

<figure class="concept concept--flow">
<div class="concept-title">A circuit breaker tests recovery</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17v4 M9 12v9 M15 7v14 M21 2v19"/></svg><strong>Closed</strong><span>Requests pass through.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4v16 M17 4v16"/></svg><strong>Open</strong><span>Calls stop after the failure threshold.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 7a9 9 0 0 0-16 3 M4 3v7h7 M4 17a9 9 0 0 0 16-3 M20 21v-7h-7"/></svg><strong>Half-open</strong><span>Limited calls test the dependency.</span></li>
</ol>
<figcaption>After a recovery test: close on success, reopen on failure. Provide a fallback while open.</figcaption>
</figure>

Bulkheads address a related problem: one failure consuming resources that other work needs. Separate thread pools for critical and non-critical operations, isolate resources between service areas, and set rate limits per tenant or endpoint. The name comes from the partitions in a ship's hull.

## Put limits on waiting and retrying

Set explicit timeouts. Make retry counts and delays part of the design. This example shows the intended policy; the actual options depend on the API client:

```javascript
// Bad: No timeout, infinite retries
const result = await callExternalAPI();

// Good: Explicit timeout with exponential backoff
const result = await callExternalAPI({
  timeout: 5000,
  retries: 3,
  backoff: 'exponential'
});
```

Use exponential backoff and jitter so clients do not all retry together. Check whether an operation is idempotent before repeating it. Do not retry a client error without considering its cause; the response and API contract should determine whether a retry makes sense.

## Choose the fallback before the outage

I have used several forms of reduced service. A product listing can work without recommendations. Analytics can show cached results with a last-updated time. In a checkout workflow, orders can enter a manual review queue when fraud scoring is unavailable, if that is the agreed policy.

These choices affect users and operations. The team needs to agree on them before an incident forces a decision.

## Test the failure paths

I start failure testing with one instance during low traffic. Then I add network latency and resource exhaustion. Wider tests, such as an availability zone failure, come after the smaller cases are understood.

Chaos Monkey is one way to terminate instances deliberately. Toxiproxy or custom middleware can introduce delays, packet loss, timeouts, and error responses. Load tests help find breaking points, check scaling policies, expose resource leaks, and test circuit-breaker thresholds.

The useful result is evidence of how the system behaves under stress.

## Measure the effect on users

Track availability and error rates, P50/P95/P99 latency, and resource saturation, including connection pools. Track failed transactions and revenue effects as well.

An alert that payment success has fallen below 99% tells the team about a user problem. CPU above 80% provides diagnostic context, but on its own it does not say whether payments are failing.

## Practice as a team

After an incident, record the timeline, causes, lessons, and changes. Keep the discussion focused on the system instead of the person who happened to trigger the failure.

Scheduled game days give people practice with the response process. They also expose missing monitoring and incomplete runbooks before the next outage.

The next useful reliability question is concrete: if this dependency stops responding, what happens to the request already in progress? Follow that request through the timeout, fallback, alert, and recovery path.
