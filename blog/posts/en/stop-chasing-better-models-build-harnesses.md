---
title: "Stop Chasing Better Models, Build Harnesses Instead"
description: "How I use project rules, workflows, tools, and permissions to reduce repeated explanations in AI coding sessions."
date: 2026-06-12
image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800"
minRead: 5
---

Six months before writing this, I was copying code from ChatGPT into my terminal. I eventually noticed that correcting its suggestions was taking more time than I expected to save.

Many corrections had little to do with the task. I was explaining the project again: which test runner we used, where business logic belonged, and how files should be named. I wanted those details to survive the end of a chat.

## The repeated briefing

Consider a payment bug. The assistant suggests `stripe.charges.create()`, but the project moved to Payment Intents two years ago. Then it puts business logic in a controller instead of the service layer. It writes Jest tests for a Vitest project and names the file `paymentService.ts` instead of `payment.service.ts`.

Twenty minutes and six messages later, the assistant knows enough to begin. The next session needs the same explanations.

Missing context helps explain inconsistent output, ignored conventions, and the effort of starting from a blank prompt. It also makes delegation uncomfortable: the assistant may be working from assumptions you have not noticed yet.

## What I tried first

Better prompts helped, but I still had to prepare them each time. In the setup I used, Copilot made typing faster without retaining the architecture decisions I needed. Custom GPTs were awkward for this work because I lacked the filesystem access and process controls I wanted.

I needed a place for project rules, file conventions, reusable workflows, and access to the tools I actually used. I call that surrounding system a harness.

I built mine with [OpenCode](https://opencode.ai), an open-source terminal coding agent. Its agents, skills, and integrations suited the structure I wanted. The useful question for me was how well the setup carried project knowledge into the next task.

## Put project context in version control

An `AGENTS.md` file in the repository gives the assistant a briefing it can read each session. Mine includes conventions, architecture choices, test commands, directories, and the reasons behind important rules.

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

Because the file lives in Git, the team can review a convention change in a pull request. The next session can read the updated rule. I no longer have to find the prompt where I last explained it.

<figure class="concept concept--layers">
<div class="concept-title">The context around a coding task</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 3h7l5 5v13H7z M14 3v6h5 M10 13h6 M10 17h6"/></svg><strong>Project briefing</strong><span>Conventions and decisions in AGENTS.md.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 3a3 3 0 1 0 0 6 3 3 0 1 0 0-6 M2 21v-4a6 6 0 0 1 12 0v4 M17 4a3 3 0 0 1 0 6 M17 13a5 5 0 0 1 5 5v3"/></svg><strong>Roles and workflows</strong><span>Agents set roles; skills describe the process.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9z"/></svg><strong>Tool access</strong><span>Read traces, documentation, and source.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6z M8 12l3 3 5-6"/></svg><strong>Permissions</strong><span>Control actions and review the result.</span></li>
</ol>
<figcaption>Keep these layers with the project so each session can use them again.</figcaption>
</figure>

## Separate roles from workflows

An agent defines a role and its permissions. I use implementation access for build work and restricted access for analysis. OpenCode provides build and plan roles, with a Tab shortcut to switch in the terminal interface. Custom roles can narrow access further, such as an auditor that only reads the repository.

A skill describes a repeatable process in a `SKILL.md` file. A test-driven workflow asks for a failing test before implementation. A debugging workflow asks the assistant to establish the cause before proposing a fix. A review workflow checks the diff against team conventions.

```
.opencode/skills/
  test-driven-development/SKILL.md
  systematic-debugging/SKILL.md
  code-review/SKILL.md
  brainstorming/SKILL.md
```

Project and global skill directories make these instructions available to the agent. They help it follow a process, but written instructions alone cannot enforce every step. I still check the test results and the diff.

## Connect the tools that hold the evidence

Through Model Context Protocol (MCP), the agent can use external tools. This example connects a Sentry service and Context7:

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

That lets the assistant read the actual stack trace instead of my shortened description. It can also retrieve documentation when it needs it. GitHub search, internal APIs, and databases can be connected through compatible servers.

Tool access improves the evidence available to the assistant. It still has to choose the relevant evidence and interpret it correctly.

## Set permissions around the work

I want editing and routine tests to be easy, while pushes require review. The configuration used for this example expresses that policy:

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

This is a version-specific example, so check the [OpenCode permissions documentation](https://opencode.ai/docs/permissions/) against your installation. The listed rules permit edits and `npm test`, ask before matching `git push` commands, and deny commands matching `rm *`.

That last rule is not a general ban on destructive actions. Other commands can also remove or overwrite files. Likewise, a plan role should not be assumed to be fully read-only without checking its effective permissions. Access controls need review in the same way code does.

## What a working session can look like

Suppose Sentry reports `TypeError in /api/checkout, line 142` at 9 AM. A possible sequence is:

1. At 9:01, investigate in the restricted role. Read the trace, source, and project rules. Identify a missing check for `user.address` after a migration, such as the example PR #847.
2. At 9:05, switch to implementation. Write a failing test for the null address, apply the fix in `validateCheckout()`, and run the test again. Then refactor and run `bun lint` and `bun typecheck`.
3. At 9:12, review the diff. Correct an error message that does not follow the project rule.
4. At 9:15, review the commit and approve the push.

This is an illustrative fifteen-minute workflow, not a benchmark. Comparing it with a 45-to-90-minute manual session only makes sense as an example of where repeated context work can go. Actual savings need measurement on real tasks.

## Keep the setup proportionate

The harness takes maintenance. Someone has to update the project briefing and skills. For a throwaway script, that cost may exceed the benefit. For open-ended brainstorming, I still find ordinary chat useful.

The assistant also continues to make mistakes. Context reduces mistakes caused by incorrect assumptions about the project; it does not remove the need for tests and review.

I would start with the corrections you keep repeating. Put the stable ones in a short project briefing, give the assistant the tools it needs, and check the result. That is a more useful first improvement than changing models without changing what the next model knows.
