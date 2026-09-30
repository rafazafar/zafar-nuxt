---
title: "What seven years of scaling systems taught me"
description: "The design choices I return to: clear boundaries, measured database load, and systems the team can maintain."
date: 2025-12-15
image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800"
minRead: 2
tags:
  - Architecture
  - System Design
  - Scaling
  - Lessons Learned
---

Early in my career, I spent weeks designing microservices for a product that had not yet found its market. We had architecture work to show for it, but the product still needed to solve a useful problem.

Over seven years of work on recruitment platforms, fintech products, and travel apps, I kept returning to that lesson. Growth from hundreds to hundreds of thousands of users creates real technical problems. It also makes unnecessary complexity harder to remove.

## Start with a system the team can understand

I usually start with a monolith and clear module boundaries. The product gets a simpler deployment, and the team can focus on user problems. If a module later needs to become a service, a clear boundary makes that change easier.

Planning for growth does not require building every future component now. It requires knowing where responsibilities begin and end.

## Watch the database early

The database has repeatedly been the difficult part of scaling in my projects. Adding application instances is often easier than increasing database capacity.

Reporting queries deserve particular attention. Read replicas can keep analytics work away from the database serving the main application. Plan that separation early when reporting is part of the workload.

Caching also needs a policy. Adding Redis leaves questions about expiry and stale data unanswered. For many read-heavy workloads, I have found that a time-to-live (TTL) policy with background refresh works well.

Connection pools need monitoring too. I have seen production systems fail because they ran out of connections. A pool setting is not something I want to configure once and forget.

<figure class="concept concept--split">
<div class="concept-title">Separate sources of database load</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6 M3 12c0 4 18 4 18 0"/></svg><strong>Reporting</strong><span>Read replicas for analytics.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18 M12 7v5l4 2"/></svg><strong>Repeated reads</strong><span>Cache with an expiry policy.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17v4 M9 12v9 M15 7v14 M21 2v19"/></svg><strong>Connections</strong><span>Monitor pool use and limits.</span></li>
</ol>
<figcaption>These address different pressures. Choose them from the workload you observe.</figcaption>
</figure>

## Decide which work can wait

Before requiring strong consistency everywhere, I ask whether each operation needs an immediate result. That question often reveals work we can handle asynchronously.

At Seekers, we replaced synchronous API calls with an event-driven architecture using message queues. Response times fell by 40%, and reliability improved. That was the result for our workload, not a forecast for every system that adds a queue.

## Leave the reasoning with the team

A design has to make sense to the people who will maintain it. I write ADRs because, six months later, remembering why we made a decision is harder than finding the code.

I also involve the team early. Junior engineers can see a simpler approach that someone with more experience has overlooked. Documentation and runbooks make the system easier to join, especially when its original authors are no longer available.

## Check more than server health

Before a major launch, I want monitoring at three levels:

- Business results: sign-ups, conversions, and effects on revenue.
- Application behavior: response times, error rates, and throughput.
- Infrastructure: CPU use, memory use, and disk I/O.

These measurements answer different questions. A healthy server does not tell me whether users can finish what they came to do.

The systems I value most from those seven years solved their problems reliably and remained understandable after I moved on. That is the standard I try to design for.
