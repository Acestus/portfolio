---
title: "Agentic Web — Skills, MCP, and the New Operator Loop"
description: "Microsoft Build 2026 reframes the agentic web around a practical loop: the user states intent, the agent selects a reusable skill, MCP exposes a trustworthy tool surface, an action is proposed, and the operator…"
space: "Architecture & delivery"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/agentic-web.html"
demo: "/agentic.html"
---

> Microsoft Build 2026 reframes the agentic web around a practical loop: the user states intent, the agent selects a reusable skill, MCP exposes a trustworthy tool surface, an action is proposed, and the operator verifies the result. This article refreshes the SPA's API-first thesis with Microsoft Foundry, GitHub Copilot, Azure, Fabric, and markdown-driven state patterns from the platform team's own automation system.



- **27** — Custom Skills

- **MCP** — Server Tool Surface

- **API + CLI** — Tool-Calling Agents

- **Human Gate** — Operator-in-the-Loop



Intent→ Skill→ Tool→ Action→ Verify



## 1. From Chat to Agentic



The important shift is not better prompt engineering. The shift is moving from chat as a text box to chat as a control plane. A useful agent reads the user's intent, chooses the correct capability, gathers evidence, calls a tool, and returns a verifiable result. The prompt matters, but the tool contract matters more.



The reference pattern is intentionally boring: HTTP triggers, scheduled jobs, Python or PowerShell scripts, API calls, and structured responses. A model adds judgment at the language layer: triage, summarization, prioritization, and routing. Deterministic code still owns identity, authorization, state changes, retries, and audit logging.



That split is the 90/10 rule in practice. Ninety percent of the workflow is reliable automation. Ten percent is model-assisted judgment that helps decide which deterministic path to take next. The agent should not become the business process; it should make the business process easier to operate.



> **Build 2026 lens:** the new operator loop is not "let the model do everything." It is "let the model pick the next safe tool, show the evidence, then let the operator approve irreversible work."



### From Search Box to Workbench



| Old Chat Pattern | Agentic Pattern | Why It Matters |
| --- | --- | --- |
| Ask for a summary | Ask for an outcome | The agent can gather context and produce a proposed action |
| Prompt tuning | Tool contract design | Typed inputs and scoped permissions beat clever wording |
| Copy output manually | Call APIs and CLIs | Work moves through existing operational interfaces |
| Trust the answer | Verify the evidence | Markdown, diffs, logs, and citations make results inspectable |



## 2. The Model Context Protocol (MCP)



MCP gives agents a standard way to discover tools, understand schemas, and invoke operations without every client inventing a custom adapter. It does not replace APIs. It packages APIs, CLIs, documentation, and local context into a predictable tool surface that agent clients can reason over.



That is why MCP fits the SPA's original thesis: agents should use the interfaces developers already trust. Azure CLI, GitHub CLI, Fabric REST APIs, Graph API, and documentation search remain the underlying source of truth. MCP makes those capabilities discoverable and composable for the model.



| MCP Server | Tool Surface | Typical Agent Use | Safety Posture |
| --- | --- | --- | --- |
| Microsoft Learn / Docs | Grounded documentation retrieval and citations | Validate whether a service supports a feature before planning work | Read-only; preferred for current product facts |
| Azure MCP | Subscriptions, resource groups, RBAC, monitor, storage, compute, policy, deployment helpers | Inspect Azure resources, generate CLI commands, review health, explain deployment options | Read-first; mutations require scoped roles and operator approval |
| Microsoft Fabric MCP | Workspaces, items, folders, definitions, capacities, roles, notebooks, pipelines | List workspace artifacts, verify pipeline schedules, inspect item definitions | Read-first; item updates and role grants are explicit actions |
| GitHub MCP | Repositories, issues, pull requests, code search, file contents, reviews | Review PRs, locate implementation patterns, connect code to work items | Branch and PR workflow keeps changes reviewable |
| Local Shell / CLI | `az`, `gh`, Python scripts, test runners, linters | Run the same commands a platform engineer would run | Terminal output is visible; destructive commands stay gated |



The practical design rule is simple: expose the smallest useful tool surface. A read-only inventory tool can run autonomously. A role assignment, deletion, status transition, or outbound message must stop at a confirmation boundary with a plain-language summary of what will change.



## 3. Skills as Reusable Capabilities



Skills are the reusable unit above tools. A tool says, "I can call this endpoint." A skill says, "Here is the job, the decision policy, the evidence to gather, the voice to use, and the safe stopping points." The platform team uses skills for dispatching work, investigating tickets, logging time, reviewing PRs, deploying Fabric pipelines, updating documentation, and closing the day.



The most important skill rule is one job per skill. A dispatcher should dispatch. A worklog skill should log work. An investigator should gather context and propose a plan only after evidence supports it. Small skills can chain together, but each one remains understandable, testable, and replaceable.



### Sample Skill Structure



```text
# SKILL.md
---
name: ticket-investigator
description: Start a structured investigation on a work item.
allowed-tools:
  - bash
  - grep
  - view
  - scripts/context_bundle.py
  - scripts/set_flow.py
---

## Purpose
Gather evidence before proposing a plan.

## Inputs
- Work item key, sanitized as INFRA-### in public examples
- Current markdown case file
- Operator goal or blocking question

## Workflow
1. Load the context bundle.
2. Ask only clarifying questions needed to reach confidence.
3. Gather evidence with read-only tools first.
4. Propose a plan with risks, commands, and rollback notes.
5. Stop for operator approval before destructive actions.

## Safety
- Never expose secrets or tokens.
- Never close or delete without explicit confirmation.
- Record decisions in markdown so the diff is reviewable.
```



That structure turns a general-purpose model into an operational teammate. The skill constrains the work, the tool surface provides capabilities, and the markdown file holds the durable state. When the operator says "next ticket," the router can choose a dispatcher skill; when a ticket is active, an investigator skill can gather evidence; when work is done, a worklog skill can update the source-of-truth file.



## 4. Tool-Calling, Verified



Tool-calling agents are powerful because they can do more than write prose. They can query systems, run tests, fetch documentation, open pull requests, update markdown, or call a workflow. They are also risky for the same reason. Verification is the boundary that makes the pattern usable.



The platform team's safe default is read, summarize, and propose. Read-only tools can run with high autonomy. Write tools require the agent to show the intended change, the target system, the reason, and the verification step. The operator approves the action or asks for a narrower plan.



| Operation | Agent Autonomy | Required Verification |
| --- | --- | --- |
| Search documentation or code | Autonomous | Cite source pages, file paths, or command output |
| List cloud resources | Autonomous when read-only | Show subscription or workspace scope before conclusions |
| Edit markdown state | Agent may draft | Diff is inspected and committed through git |
| Create ticket or send message | Requires confirmation | Show recipient, body, and links before sending |
| Delete, close, grant, deploy | Human-directed | Explicit approval, rollback path, and post-action validation |



This is also the answer to prompt injection. Untrusted text may influence what the model says, but it must not silently decide what the system does. External input is treated like user input in any secure application: validate it, scope it, and keep privileged effects behind deterministic checks.



## 5. The Operator-in-the-Loop Model



The operator loop is event-driven rather than fully sequential. Safe background agents can investigate, summarize, and prepare changes while the human focuses on the highest-priority station. When an agent reaches a decision point, it pops up with evidence and choices. The operator can accept, reject, narrow scope, or take over interactively.



Autopilot is appropriate for safe operations: indexing documentation, reading logs, grouping stale tickets, drafting follow-ups, or running tests. Irreversible work stays human-gated: access grants, production deployments, deletion, ticket closure, external messages, or anything that changes customer-visible state.



### Autonomy Bands



| Band | Agent Behavior | Good Fit | Stop Condition |
| --- | --- | --- | --- |
| Full autonomy | Runs read-only discovery and safe edits to completion | Documentation refresh, stale-ticket grouping, code search | Posts summary and evidence |
| Work then ask | Investigates freely, pauses at decision points | Pipeline triage, RBAC analysis, PR review | Multiple valid paths or write action needed |
| Context only | Loads facts and waits | Production incident, sensitive access, ambiguous request | Operator chooses next command |
| Manual control | Agent assists with commands and explanation only | Irreversible operations or high-risk remediation | Human executes or explicitly delegates |



> **Operator rule:** the agent can select tools, but the operator owns accountability. A good agent makes the next action obvious, reversible when possible, and auditable when not.



## 6. Why Markdown-Driven State Wins for Agents



Agents need durable state they can read, diff, cite, and update without hiding decisions inside a chat transcript. Markdown files are a surprisingly strong substrate: they are human-readable, git-tracked, mergeable, searchable, and easy for tools to parse. A work item becomes a file with description, investigation, actions, follow-up, and flow labels.



That gives the operator three advantages. First, the current state is visible without opening a proprietary UI. Second, every change has a git diff and commit history. Third, CI/CD can reconcile the file to downstream systems through APIs, making the markdown file the source of truth rather than a stale note.



### File-Driven Agent State



```text
issues/INFRA-###.md
├── Description       # What the work is and why it matters
├── Investigation     # Evidence, commands, findings, links
├── Actions           # Reverse-chronological WORKLOG and COMMENT entries
└── Follow-up         # Current status and concrete next steps

flow:queue → flow:active → flow:waiting → flow:done

commit + push → GitHub Actions → API sync → verified downstream state
```



The same pattern works for service requests, approvals, backlog items, and operational runbooks. The agent can plan against the file, update the file, and prove what changed. The human can review the diff. The pipeline can push only the approved state to the target system. That is the operator loop in durable form.



### Why It Beats Hidden State



| Requirement | Markdown State | Chat-Only State |
| --- | --- | --- |
| Auditability | Git commits, diffs, authorship, timestamps | Transcript fragments and memory heuristics |
| Recovery | Clone repo, inspect file, rerun sync | Reconstruct context from conversation |
| Agent grounding | Stable files with explicit sections | Implicit memory and stale summaries |
| Human review | Standard PR or commit review | Scrollback inspection |
| System sync | CI/CD parses structured lines and fields | Manual copy-paste or custom session store |
