---
title: "Purpose-Built AI: A Field Toolkit for Engineering Operations"
date: 2026-07-11T00:00:00Z
draft: false
tags: ["ai", "sre", "operations", "architecture"]
summary: "General-purpose AI assistants have an infinite goal space and no defensible perimeter. The fix: build AI that does one thing, for one domain, with a defined scope."
---

General-purpose AI assistants have an infinite goal space. Give one the instruction "answer whatever the user asks" and you've created a system with no defensible perimeter — every question is a new attack surface, every novel request a potential failure mode. You can't patch your way to safety when the boundary is everywhere.

The fix is simple to describe: build AI that does one thing, for one domain, with a defined scope.

This is a field implementation of that idea.

---

**The Substrate**

The toolkit lives in a git repository. Every Jira ticket and SDP case has a markdown file. Every action — worklog, comment, investigation finding, stakeholder nudge — is written to that file before anything touches an external system. CI/CD syncs the file state on push. The markdown is the source of truth. Jira and SDP are render targets.

Every AI action is reversible, visible, and auditable. There's no hidden state evaporating when you close a tab. The human approves the file; the system transmits it. That sequence is the crumple zone.

---

**A Dispatch Table, Not a Chatbot**

The toolkit is a set of narrow skills, each with a defined scope:

- **Clerk** — institutional memory retrieval. Searches issue files, case files, Confluence, and reference repos. Cites sources. Never synthesizes. If it finds nothing, it says so: this is new ground.
- **Rounds** — kanban station management. Claims one lane, works one ticket, manages all paperwork without touching anything outside that ticket's scope.
- **Ticket Investigator** — structured problem decomposition. Runs a six-dimension confidence interview. Won't proceed below 95%.
- **Confluence Writer** — documentation only. Drafts to file, publishes on operator approval.

Eleven dispatch situations. Eleven named skills. No open-ended improvisation.

---

**Calibrated Autonomy**

Every ticket carries an agentic score (1–5) set at intake — a pre-classification of how much human involvement the work requires. Score-1 tickets run to completion without human checkpoints. Score-5 tickets are context-only: the AI reads, summarizes, and steps back. A constraint:technician label caps autonomy regardless of score.
