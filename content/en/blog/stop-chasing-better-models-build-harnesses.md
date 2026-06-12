---
title: "Stop Chasing Better Models, Build Harnesses Instead"
description: "Every AI coding session starts from zero. Here's how I built a persistent context system that makes the AI arrive pre-onboarded — every single time."
date: 2026-06-12
image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800"
minRead: 8
author:
  name: Zafar
  avatar:
    src: https://r2.zafar.dev/img/profile.jpg
    alt: Zafar
---

## Stop Chasing Better Models, Build Harnesses Instead

Six months ago, I was copy-pasting code from ChatGPT into my terminal like everyone else. Then I realized I'd spent more time correcting AI suggestions than I would have saved by writing the code myself. The tool wasn't the problem. The harness was.

### The Onboarding Problem Nobody Talks About

Here's what actually happens when you use an AI coding assistant on a real project. It's Tuesday morning. You open your AI tool to fix a bug in your payment flow. You paste the error. It suggests a fix using `stripe.charges.create()` — but your project migrated to the Payment Intents API two years ago. You correct it. It suggests putting business logic in the controller — but your team uses a service layer pattern. You explain that. It generates a test with Jest — but you use Vitest. You tell it. It names the file `paymentService.ts` — but your convention is `payment.service.ts`.

Twenty minutes in, you've written six messages just teaching it things it should already know. And tomorrow? It forgets all of it. You'll repeat the same onboarding dance from scratch.

This is pair programming with a brilliant developer who has anterograde amnesia.

Every other complaint about AI coding tools traces back to this root cause. "Inconsistent output" — it has no memory of what consistent means for your project. "Doesn't follow conventions" — nobody told it what they are. "Blank prompt problem" — you're compensating for its amnesia every time. "Fear of losing control" — you can't trust someone who forgets everything daily.

### The False Fixes

I tried the obvious things first. Better prompts helped marginally but didn't scale — I was still the bottleneck, crafting the perfect incantation each session. Copilot was faster at the keystroke level but had zero concept of "this project uses the repository pattern" or "we decided against that ORM because of a specific bug." Custom GPTs were brittle, with no filesystem access and no way to enforce process.

Each "solution" hit the same wall: no persistent project context. The AI treats your project as a collection of files rather than a living system with conventions, decisions, and culture.

### The Shift

The breakthrough wasn't finding a better AI model. Models are commodities now — Claude, GPT, Gemini, they're all smart enough. The problem is the interface layer between you and the AI. The AI needs four things that raw chat interfaces don't provide: project rules, file conventions, reusable workflows, and access to your actual tools.

This layer — the infrastructure around the AI, not the AI itself — is what I call the harness. Think of it like a test harness: it doesn't run your tests, it provides the environment, fixtures, and assertions that make tests reliable and repeatable. A development harness does the same for AI agents.

I built mine with [OpenCode](https://opencode.ai), an open-source AI coding agent that runs in your terminal. It has 173k GitHub stars and, more importantly, it was designed from the ground up for exactly this kind of structured AI interaction. Not as a chatbot bolted onto an editor, but as a composable system of agents, skills, and integrations.

### Building the Harness

The harness has four layers. Each one solves a specific part of the onboarding problem.

#### Layer 1: Context — Teaching the AI Your Project's Personality

The foundation is an `AGENTS.md` file committed to your project root. This isn't a README — it's a briefing document for the AI. It contains your conventions, architecture decisions, test commands, directory structure, and the reasoning behind your choices.

```markdown
# AGENTS.md

## Development Commands
- `bun dev` - Start development server
- `bun lint` - Run ESLint
- `bun typecheck` - Run TypeScript type checking

## Architecture
- `app/pages/` - File-based routing
- `app/components/` - Vue components, organized with `landing/` subfolder
- `content/` - Content collections managed by Nuxt Content
- Always follow existing patterns in neighboring files before creating new ones
```

OpenCode reads this file at the start of every session. The AI arrives already knowing your project. No more explaining that you use Vitest, not Jest. No more correcting file naming conventions. The context persists because it lives in git, not in the AI's ephemeral memory.

The key insight: AGENTS.md is reviewed in pull requests. When your conventions change, you update it in a PR. The AI adapts automatically. Try doing that with "the prompt I used last time."

#### Layer 2: Specialization — Agents as Roles, Skills as Playbooks

Not every task needs the same AI behavior. Sometimes you want full-access coding. Sometimes you want read-only analysis. OpenCode handles this with agents and skills.

**Agents** are roles. The `build` agent has write permissions for implementation work. The `plan` agent is read-only — it analyzes code and suggests changes without touching anything. You switch between them with the Tab key. You can create custom agents too, like a `security-auditor` that can read everything but write nothing.

**Skills** are reusable workflows defined in `SKILL.md` files. They encode process discipline that humans skip under pressure. A TDD skill enforces red-green-refactor even when you're rushing. A debugging skill prevents the AI from proposing fixes before understanding the root cause. A code review skill checks your diff against your team's actual conventions.

```
.opencode/skills/
  test-driven-development/SKILL.md
  systematic-debugging/SKILL.md
  code-review/SKILL.md
  brainstorming/SKILL.md
```

These are discovered automatically from your project or global config. The critical thing about skills is that they enforce the process you already believe in but don't always follow. You know you should write the test first. The skill makes the AI do it, even when you're tempted to skip.

#### Layer 3: Integration — Connecting to Your Real Tools

Without external integrations, the AI is a smart stranger. With them, it becomes a team member with access to your monitoring, docs, and codebase. OpenCode uses the Model Context Protocol (MCP) to connect to external tools.

```json
{
  "mcp": {
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "oauth": {}
    },
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

Now when a Sentry alert fires, the AI can pull the full stack trace directly — not your paraphrased version. When it needs to look up documentation, it fetches current docs via Context7 instead of hallucinating from training data. You can connect GitHub code search, internal APIs, databases — anything that speaks MCP.

#### Layer 4: Governance — Trust the Harness, Not the AI

This is what makes it safe to give an AI write access to your codebase. Permissions in OpenCode are fine-grained: you control what each agent can do, down to individual bash commands.

```json
{
  "agent": {
    "build": {
      "permission": {
        "edit": "allow",
        "bash": {
          "git push": "ask",
          "npm test": "allow",
          "rm *": "deny"
        }
      }
    }
  }
}
```

The `build` agent can edit files and run tests, but asks before pushing to git and can never run destructive commands. The `plan` agent is fully read-only. You're not trusting the AI — you're trusting the harness.

### The New Monday Morning

Here's what this looks like in practice. A Sentry alert fires at 9 AM: `TypeError in /api/checkout, line 142`.

**9:01** — You open OpenCode and switch to the `plan` agent (read-only). Ask it to investigate. The plan agent uses the Sentry MCP to pull the full stack trace, reads the relevant source files, checks AGENTS.md for error handling conventions. It returns: "Missing null check on `user.address` after the migration in PR #847. Fix should go in `validateCheckout()`."

**9:05** — Switch to the `build` agent. The TDD skill activates. It writes a failing test that reproduces the null address case. Test fails (red). Then implements the fix. Test passes (green). Then refactors. Runs `bun lint` and `bun typecheck` — both pass.

**9:12** — The code review skill compares the diff against your team's conventions. Flags one issue: error message doesn't match the pattern in AGENTS.md. Quick fix.

**9:15** — Commit with a clean conventional commit message. Review, approve, push.

Total time: 15 minutes. Without the harness: 45 to 90 minutes of context-switching, manual debugging, test-writing-you'll-skip, and self-review.

### What This Doesn't Fix

Let me be honest about the parts the harness doesn't solve. Raw AI chat is still better for open-ended brainstorming where you don't want constraints. The harness adds overhead — you need to write and maintain AGENTS.md and skill files. For one-off scripts or throwaway prototypes, the setup cost isn't worth it.

And the AI still makes mistakes. The harness doesn't make it infallible. It makes it *informed*. There's a big difference. An informed AI that knows your project makes mistakes you can catch in code review. An uninformed AI makes mistakes you can't predict because they come from wrong assumptions about your codebase.

### The Real Takeaway

The AI isn't the bottleneck. The context gap is.

Raw AI models are commodities. The real leverage is in the system you build around the model — project context files, reusable workflows, tool integrations, permission guardrails. That's the moat. Not which model you use, but how well you've taught it your world.

This reframes AI from "magic autocomplete" to "junior engineer you onboard once." The harness is the onboarding document. And unlike a human, the AI re-reads it every single session.

Stop chasing better models. Start building harnesses.
