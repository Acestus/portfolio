---
title: "Workflow Toolkit — File-Driven AI Ops"
description: "File-driven operations beat yet another SaaS dashboard because the operator keeps ownership of the truth: tickets, time, follow-ups, approvals, and standup notes are durable markdown files that can be searched,…"
space: "Architecture & delivery"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/workflow-toolkit.html"
demo: "/workflow.html"
---

> File-driven operations beat yet another SaaS dashboard because the operator keeps ownership of the truth: tickets, time, follow-ups, approvals, and standup notes are durable markdown files that can be searched, diffed, reviewed, committed, and replayed. Workflow Toolkit turns that local source of truth into AI-assisted operations by letting skills act on files first, then letting CI reconcile clean changes back to the systems of record.



- **27** — Copilot Skills

- **19** — Instruction Files

- **12** — GitHub Workflows

- **80** — Python Scripts



Capture→ Markdown→ AI Round→ Voice Wall→ CI Sync→ Standup



The daily loop is intentionally narrow. It does not try to become a replacement for Jira, ServiceDesk Plus, Confluence, or GitHub. It creates a local operating layer that can understand all of them at once. The operator sees the day as a sequence of file transitions, while the external tools receive only the reconciled updates they already understand.



| Stage | Artifact | AI Role | Human Checkpoint |
| --- | --- | --- | --- |
| Capture | Planner note and incoming queue files | Collect candidates and summarize context | Confirm what deserves attention today |
| Markdown | Issue and case files | Normalize work into structured sections | Review the exact text that will sync |
| AI Round | Active lane item | Investigate, draft next actions, and gather evidence | Accept, redirect, or stop the proposed path |
| Voice Wall | Action entries | Separate internal notes from requester-facing updates | Verify the right audience receives the right language |
| CI Sync | Committed diff | Run deterministic reconciliation scripts | Inspect workflow status and retry safely if needed |
| Standup | Daily closeout summary | Turn committed work into a concise status narrative | Edit the final message before sharing |



## 1. The File-Driven Mental Model



Workflow Toolkit starts with a small refusal: the operational source of truth does not have to live inside a browser tab. Browser SaaS tools remain the official systems of record, but the working state lives in a repository. A Jira issue is represented by an **issue file**. A ServiceDesk Plus request is represented by a **case file**. A daily plan is represented by a planner note. The operator edits those files with the same tools used for code.



That shift matters for AI operations. An agent can reason over a markdown file without screen scraping, hidden modal state, or a brittle browser session. It can propose a worklog, add a follow-up, update a flow label, or prepare a standup summary in a form that a human can review before anything touches an external API.



The pattern is deliberately boring: capture the work, encode it as text, commit it, and let automation reconcile it. The boring part is the feature. Text has history. Git has review. CI has repeatability. Markdown has enough structure to be parsed by scripts and enough flexibility to be useful during messy investigations.



```text
workflow-toolkit/
├── .github/
│   ├── skills/                 # Copilot skill definitions
│   ├── instructions/           # File-pattern-scoped AI rules
│   └── workflows/              # Sync, smoke test, and scheduled jobs
├── issues/                     # Jira-backed markdown files
├── cases/                      # ServiceDesk Plus-backed markdown files
├── planner/                    # Daily notes, timers, and standup drafts
├── confluence/                 # Publishable documentation drafts
├── scripts/                    # CLI tools for APIs and reconciliation
└── assets/                     # Diagrams, generated context, and references
```



The repository boundary also gives the operator a clean trust boundary. AI can draft file changes. Git shows the diff. GitHub Actions turns accepted changes into API calls. If a run fails, the markdown remains intact and the next run can pick up from the same durable state.



### Example Markdown File Layout



| Path | Purpose | Synced To | Typical Entries |
| --- | --- | --- | --- |
| `issues/INFRA-###/INFRA-###.md` | Engineering ticket source file | Jira REST API | Description, investigation, actions, worklogs, internal comments |
| `cases/#####/##### - Request.md` | End-user support case file | ServiceDesk Plus API | Clerk card, tasks, web links, approvals, end-user comments |
| `planner/MM-DD.org` | Daily plan and time ledger | Local standup summary | Focus blocks, timers, active lane list, end-of-day notes |
| `confluence/page-title.md` | Long-form documentation draft | Confluence publishing script | Runbooks, architecture notes, implementation articles |



## 2. Skills as Composable Units



The toolkit treats AI skills as small operational units, not as one giant autonomous agent. Each skill has one job, a trigger phrase, a scope, and a set of file conventions it is allowed to touch. The operator chains skills together during the day: start the day, dispatch work, investigate a ticket, log time, publish a document, follow up on stale items, then close out.



This design keeps agency legible. A skill such as `ticket-investigator` is not responsible for the whole workday; it performs structured discovery for one ticket. A skill such as `jira-worklog` does not decide what to build; it records what happened in a parseable format. A skill such as `end-my-day` does not investigate tickets; it stops timers, summarizes outcomes, and prepares the handoff.



| Category | Representative Skills | Operational Role |
| --- | --- | --- |
| Day orchestration | `start-my-day`, `end-my-day`, `rounds` | Open and close the workday, rotate active stations, keep the operator oriented. |
| Jira workflow | `jira-router`, `jira-dispatcher`, `jira-worklog`, `ticket-investigator`, `phoenix-backlog` | Route ticket intent, enforce lane WIP, create backlog items, investigate, and log internal work. |
| ServiceDesk Plus workflow | `sdp-router`, `sdp-dispatcher`, `sdp-rounds`, `sdp-worklog`, `sdp-investigator`, `sdp-backlog` | Mirror the Jira model for end-user requests, approvals, tasks, and visible requester updates. |
| Knowledge and writing | `knowledge-clerk`, `confluence-writer`, `confluence-updater`, `editorial-assistant` | Find precedent, write documentation, update existing pages, and review prose. |
| Cloud operations | `azure-investigator`, `aws-investigator`, `pim-runbook`, `fabric-deploy` | Gather cloud evidence, inspect identity and RBAC, verify privileged access, and support deployment workflows. |
| Review and reporting | `pr-reviewer`, `pr-daily-summary`, `weekly-summary`, `waiting-ticket-followup`, `outbox-refresh` | Review changes, summarize delivery, and keep stakeholders informed when work is waiting. |



The skill catalog is intentionally composable. The operator remains the scheduler and final reviewer. Skills make repeated actions reliable: they know the file layout, the voice conventions, the API scripts, and the correct handoff points. The result is an AI operations layer that feels less like chat roulette and more like a toolbelt.



## 3. The 6-Lane Kanban Flow



Workflow Toolkit uses a six-lane board with a hard WIP limit of one active item per lane. The first three lanes cover engineering project work. The second three lanes cover ServiceDesk Plus support work. This makes different kinds of work visible without letting them collapse into one overloaded queue.



Every item carries exactly one flow label: `flow:queue`, `flow:active`, `flow:waiting`, or `flow:done`. Only `flow:active` consumes the WIP slot. Waiting work is still tracked and followed up, but it does not block the operator from pulling the next eligible item into that lane.



| Lane | System | Name | Typical Work | WIP Cap |
| --- | --- | --- | --- | --- |
| 1 | Jira | 🔴 Urgent | Production incidents, security work, SLA-bound defects | 1 |
| 2 | Jira | 🔵 Manual | Work requiring human judgment, stakeholder coordination, or privileged approval | 1 |
| 3 | Jira | 🟢 Background | Automation, cleanup, documentation, and tasks suitable for high autonomy | 1 |
| 4 | SDP | 🔴 SDP-Urgent | End-user issues that block business operations or production workflows | 1 |
| 5 | SDP | 🟠 SDP-Approval | Requests waiting on stakeholder approval, budget, or access sign-off | 1 |
| 6 | SDP | 🟢 SDP-Background | Routine access grants, configuration requests, and non-urgent support tasks | 1 |



The lanes also create a practical autonomy model. Background work can be delegated aggressively. Manual work can ask for direction at decision points. Urgent work can remain under tight operator control. The same file-driven pattern supports all three modes because the handoff artifact is always the same: a markdown diff.



## 4. The Voice Wall



One of the most important conventions in the toolkit is the voice wall. The same work can need two different narratives. Engineering systems need an internal investigative voice: what was tested, what failed, what evidence supports the conclusion, and what should happen next. End-user systems need a plain-language service voice: what changed, what the requester can verify, and who owns the next action.



The toolkit encodes that difference directly in file rules. Jira `COMMENT:` lines are written in internal voice. ServiceDesk Plus `COMMENT:` lines are written in end-user voice. `WORKLOG:` lines remain internal time records in both systems. This prevents accidental leakage of investigation notes into requester-facing updates while still preserving useful technical context for the platform team.



| Line Type | Jira Issue File | SDP Case File | Reason |
| --- | --- | --- | --- |
| `WORKLOG:` | Internal time summary | Internal time summary | Time accounting should be concise, searchable, and auditable. |
| `COMMENT:` | Internal investigative update | End-user-facing update | The audience changes, so the language must change. |
| `TODO:` | Engineering next step | Requester or technician next step | Follow-up should be explicit and assigned to the right audience. |
| Clerk card | Optional context summary | Primary requester context | Support cases benefit from a structured lede, status, next, and links block. |



The voice wall is a small example of why instructions matter. The AI assistant is not just told to be helpful; it is given file-pattern-scoped writing rules. That lets the operator use natural language while the repository enforces the difference between engineering memory and customer communication.



## 5. Markdown → API Sync



The sync path is one-directional for writes: markdown first, API second. The operator updates files and pushes to `main`. GitHub Actions detects changed issue or case files. Reconciliation scripts parse the structured sections, calculate what has not been synced yet, and call the appropriate REST APIs.



For Jira, the workflows post worklogs, comments, and flow-label changes. For ServiceDesk Plus, the workflows can reconcile descriptions, tasks, tags, links, approval blocks, and worklog entries. The scripts use idempotent markers such as hashes and changed-file scopes so a rerun does not duplicate entries.



```text
Operator edits markdown
        ↓
git commit && git push origin main
        ↓
GitHub Actions detects changed paths
        ↓
Python reconciliation scripts parse structured sections
        ↓
Jira and ServiceDesk Plus APIs receive approved updates
        ↓
Planner and standup summaries reflect the durable file state
```



This design makes failures safer. If an API token expires, a workflow times out, or an external service returns a transient error, the accepted work remains in the repository. The next CI run can retry from the same files. The operator does not have to reconstruct a lost browser form or remember which comments were already posted.



## 6. Why Open Source



Workflow Toolkit began as a personal operating system for the platform team: a way to coordinate engineering tickets, support requests, follow-ups, documentation, privileged access checks, and end-of-day reporting without losing context. Open sourcing it turns that personal system into a pattern others can fork, strip down, and adapt.



The public repository at [github.com/Acestus/workflow-toolkit](https://github.com/Acestus/workflow-toolkit) packages the core idea without company-internal identifiers. Bring your own Jira project, your own support portal, your own GitHub secrets, and your own instruction files. The architecture does not require a specific organization chart. It requires a repo, a CLI, a few APIs, and a willingness to treat markdown as operational infrastructure.



> **Build 2026 visibility:** Microsoft Build is the right audience for this pattern because it sits at the intersection of Copilot extensibility, GitHub-native automation, IT operations, and responsible human-in-the-loop AI. The demo is not about replacing operators. It is about giving operators a durable, reviewable, open-source control plane for AI-assisted work.



Open source also gives the project a better feedback loop. Teams can compare lane models, contribute new skills, improve sync scripts, and share safer instruction patterns. A personal toolkit becomes a community catalog of practical AI ops patterns: small skills, clear files, visible diffs, API reconciliation, and a human operator who always has the final say.



That is the Build 2026 story in one sentence: AI becomes safer when its working memory is inspectable, versioned, and owned by the people doing the work.
