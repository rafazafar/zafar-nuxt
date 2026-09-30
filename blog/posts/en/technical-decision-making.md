---
title: "How I make technical decisions I can live with"
description: "A few questions about time, reversibility, and the team that will maintain the result."
date: 2025-11-28
image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"
minRead: 3
tags:
  - Leadership
  - Decision Making
  - Engineering
  - Best Practices
---

Some of the technical decisions I regret looked sensible on the day I made them. I understood the technology. I had given less thought to the work it would create for the team a year later.

As an engineer becomes more senior, these choices take up more of the job. A database, framework, or architecture decision can affect everyone who works on the product. I use a few questions to give those decisions more structure.

## Look beyond the first release

For a significant choice, I consider three points in time.

<figure class="concept concept--horizon">
<div class="concept-title">One decision, three time horizons</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18 M12 7v5l4 2"/></svg><strong>3 months</strong><span>Learning and migration.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 3a3 3 0 1 0 0 6 3 3 0 1 0 0-6 M2 21v-4a6 6 0 0 1 12 0v4 M17 4a3 3 0 0 1 0 6 M17 13a5 5 0 0 1 5 5v3"/></svg><strong>1 year</strong><span>Operations and team adoption.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 7a9 9 0 0 0-16 3 M4 3v7h7 M4 17a9 9 0 0 0 16-3 M20 21v-7h-7"/></svg><strong>3 years</strong><span>Scale, debt, and lasting benefits.</span></li>
</ol>
<figcaption>Consider the cost of operating the choice as well as the cost of introducing it.</figcaption>
</figure>

At three months, I expect learning costs and some disruption. After a year, I want to know who operates the system and whether the team has adopted it. At three years, I ask whether the choice leaves us with useful capabilities or difficult debt.

This exercise has stopped me from choosing a new technology simply because I wanted to use it.

## Ask how hard it will be to change course

I find Jeff Bezos's distinction between Type 1 and Type 2 decisions useful: some decisions are hard to reverse, while others allow a quick experiment.

Database migrations, core architecture choices, and dependence on a vendor often belong in the first group. Libraries with close alternatives, internal tools, and UI choices made before much code exists can be easier to change.

The scale of the commitment matters. I would not treat replacing a mature application's UI framework as a quick reversal. But if React and Vue both meet the needs of a new project, weeks of comparison may teach us less than building with one of them.

## Use your team's constraints

I have made the “Netflix uses microservices, so we should too” argument. It ignores the difference between an organization with thousands of engineers and a team of five.

I now look at the team's existing skills, the learning curve, the documentation, and whether we can hire people to maintain the result. A technically attractive choice can still be a poor fit for the people who must run it.

Research also needs a stopping point. I set a decision deadline, then make the best call the available evidence supports. Otherwise, another comparison can become a way to avoid choosing.

## Write down what you decided

For significant choices, I use a short architecture decision record:

1. Context: the problem we need to solve.
2. Decision: the approach we chose.
3. Consequences: the benefits and costs we accept.
4. Status: accepted, deprecated, or superseded.

Six months later, this is often more useful than the discussion everyone remembers differently.

I ask stakeholders for input before the decision is final. I also record uncertainty and the conditions that would make us reconsider. “We are trying this because…” leaves room to learn without pretending we know the outcome.

## Correct a decision when the evidence changes

When a choice turns out poorly, I try to acknowledge it quickly. We examine why it failed without assigning blame, change course, and record what we learned.

That record gives the next decision a better starting point. Experience is useful only if the team can still find it.
