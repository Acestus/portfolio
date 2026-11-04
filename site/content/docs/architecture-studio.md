---
title: "Architecture Studio — C4, ADRs, and Diagrams as Code"
description: "The Microsoft Build 2026 refresh positions the Architecture Studio as a practical engineering surface for communicating cloud architecture. The SPA renders an interactive C4 model, lets viewers drill from system…"
space: "Architecture & delivery"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/architecture-studio.html"
demo: "/architecture.html"
---

> The Microsoft Build 2026 refresh positions the Architecture Studio as a practical engineering surface for communicating cloud architecture. The SPA renders an interactive C4 model, lets viewers drill from system context into containers, and pairs those diagrams with Architecture Decision Records that explain why the platform chose patterns such as medallion lakehouses, one shared Eventstream per workspace, and code-owned documentation.



- **4** — C4 Model Layers

- **ADR** — ADRs as Markdown

- **PUML + MMD** — Diagrams as Code

- **API** — Confluence-Synced



Decide→ Diagram→ Review→ Publish→ Maintain



## 1. Why C4



The C4 model gives architects a shared zoom lens. Instead of one overloaded drawing trying to satisfy executives, developers, security reviewers, and operators at once, C4 splits the conversation into Context, Container, Component, and Code. Each level answers a different question without forcing readers to decode implementation detail before they understand the system boundary.



The SPA currently demonstrates the first two zoom levels. The System Context view shows platform actors and neighboring systems. Clicking a system drills into its containers: Eventhouse, Lakehouse layers, Bicep modules, Deployment Stacks, Key Vault, Azure Functions, Copilot agents, and KQL dashboards. That mirrors the reference architecture style used for Fabric, the monitoring platform, the certificate automation, and the security platform.



| C4 Level | Question Answered | Typical Audience | SPA Mapping |
| --- | --- | --- | --- |
| Context | Who uses the system and what external systems does it depend on? | Everyone | Actors plus Fabric, Azure, M365, and observability systems |
| Container | What deployable or runnable units make up the system? | Architects and engineers | Lakehouses, Eventhouse, Eventstream, Functions, Key Vault, policy, dashboards |
| Component | What internal parts collaborate inside one container? | Developers and maintainers | Planned drill-down for notebooks, functions, update policies, and adapters |
| Code | Which classes, modules, schemas, or functions implement the behavior? | Implementers | Linked source files, KQL functions, PySpark notebooks, Bicep modules |



### C4 vs Traditional UML



| Dimension | C4 Model | Traditional UML |
| --- | --- | --- |
| Primary goal | Architecture communication through progressive abstraction | Precise software modeling with many diagram types |
| Entry point | Start with the system context and zoom inward only when needed | Choose among class, sequence, deployment, component, activity, and other diagrams |
| Cloud fit | Natural for products, platforms, services, lakehouses, functions, and pipelines | Useful for detailed object and interaction design, but often too detailed for platform overviews |
| Maintenance | Works well as diagrams-as-code alongside ADRs and IaC | Often maintained in modeling tools detached from the delivery repository |



## 2. Architecture Decision Records (ADRs) as Markdown



Architecture diagrams show shape. ADRs show intent. The Studio pairs the C4 browser with decision records so a viewer can ask why a pattern exists, who benefits, what trade-offs were accepted, and what would justify changing the decision later.



The reference ADR style is intentionally lightweight: title, status, context, decision, and consequences. Markdown keeps the format readable in Git, reviewable in pull requests, and publishable to Confluence without converting the source of truth into a screenshot or slide deck.



### Sample ADR Header



```text
# ADR-008 — One Shared Eventstream per Fabric Workspace

Status: Accepted
Date: 2026-05-29

## Context
A Fabric workspace can receive events from multiple Event Hub sources. Creating one Eventstream per source multiplies idle capacity burn before real throughput becomes the limiting factor.

## Decision
Use exactly one shared Eventstream per workspace, named es_{workspace}_{env}. Add new sources to that stream and route by eventType, source, or another explicit payload field.

## Consequences
- Lower idle Capacity Unit baseline
- Simpler routing and fewer objects to operate
- KQL update policies handle downstream classification
- A second Eventstream requires a documented exception
```



> ADRs are not meeting notes. They are durable contracts: what we decided, why the decision was reasonable at the time, and what consequences the team accepted.



## 3. Diagrams as Code (PlantUML + Mermaid)



The Build 2026 refresh keeps diagram source text front and center. PlantUML is best for C4-style system structure, component boundaries, and sequence flows. Mermaid is excellent for simple flowcharts, dependency chains, and documentation embedded directly in Markdown. Both formats let engineers review architecture changes with the same workflow used for application code.



This matters because the source documents use PlantUML-backed architecture diagrams for Fabric, the notification pipeline, the monitoring platform, and certificate automation. A diagram change can travel with a Bicep module, notebook, KQL function, or ADR change instead of arriving later as a stale export.



### PlantUML Context Snippet



```text
@startuml
!include <C4/C4_Context>

title Fabric Real-Time Architecture — Sanitized Example

Person(engineer, "Platform Engineer", "Reviews capacity, routing, and incident paths")
System_Boundary(workspace, "Fabric Workspace") {
  System(eventstream, "Shared Eventstream", "Fans in Event Hub sources")
  System(eventhouse, "Eventhouse", "Hot KQL analytics and update policies")
  System(lakehouse, "Lakehouse", "Delta tables for historical analytics")
}
System_Ext(eventhub, "Event Hub Namespace", "Generic event ingress")

Rel(engineer, eventhouse, "Queries alerts and trends")
Rel(eventhub, eventstream, "Sends events")
Rel(eventstream, eventhouse, "Routes raw events")
Rel(eventstream, lakehouse, "Persists cold path")
@enduml
```



### Mermaid Flow Snippet



```text
flowchart LR
  Decide[Decide in ADR] --> Diagram[Update PlantUML or Mermaid]
  Diagram --> Review[Pull request review]
  Review --> Publish[Confluence API publish]
  Publish --> Maintain[Keep architecture living]
```



## 4. The Eventstream Topology Decision



The clearest ADR walkthrough in the reference set is the Eventstream topology decision. The design question was whether a Fabric workspace should create one Eventstream per Event Hub source or one shared Eventstream that fans in multiple sources. The accepted answer: one shared Eventstream per workspace.



The reason is operational and economic. Each active Eventstream has an idle Capacity Unit floor. On a constrained capacity, many nearly idle streams can consume a meaningful share of the SKU before actual event volume arrives. Because Fabric Eventstream can accept multiple Event Hub sources and route into multiple KQL tables or destinations, the additional streams mostly add baseline burn and operational surface area.



| Decision Area | Chosen Pattern | Rationale |
| --- | --- | --- |
| Topology | One Eventstream per workspace | Minimizes idle CU floor and object sprawl |
| Naming | `es_{workspace}_{env}` | Predictable, environment-aware, and easy to locate |
| Routing | Route by `eventType`, `source`, or explicit payload field | Keeps fan-in deterministic and avoids implicit naming assumptions |
| Classification | KQL update policies after raw landing | Separates ingestion from Silver and Gold shaping |
| Exception path | Second Eventstream only for throughput, compliance, or partition limits | Forces architectural justification before capacity is spent |



### Sanitized Topology



```text
Event Hub namespace
  ├─ source-a-events
  ├─ source-b-events
  └─ source-c-events
        ↓
Fabric Eventstream: es_platform_dev
        ↓ route by source / eventType
Eventhouse raw tables
        ↓ KQL update policies
Classified alert actions + lakehouse history
```



## 5. Confluence Publishing (Markdown → Confluence via API)



The reference workflow treats Markdown as the authoring source and Confluence as the publishing surface. Architecture pages carry metadata, diagrams, tables, and code snippets in Git. A publishing script renders the Markdown, preserves PlantUML or Mermaid blocks, and updates Confluence through the API so the public-facing collaboration page reflects reviewed source.



This pattern gives engineers the benefits of code review while still meeting stakeholders where they already read documentation. Product owners, operations teams, and auditors see the polished Confluence page. Engineers maintain the Markdown, diagram source, and ADRs beside the implementation.



### Publishing Shape



```text
Markdown article
  ├─ front matter: version, tags, status
  ├─ C4 / PlantUML diagrams
  ├─ ADR sections
  ├─ implementation tables
  └─ footer references
        ↓ sanitize and render
Confluence API update
        ↓
Reviewed architecture page with stable links
```



> Sanitization is part of the publishing contract. Internal project codes become role- or platform-level descriptions, real tenant and subscription identifiers become placeholders, hostnames become generic examples, and individual names become roles.



## 6. The Living Architecture Pattern



The living architecture pattern is the core lesson across the Fabric, monitoring, notification, and certificate automation references. Architecture stays current when the diagram, decision, and implementation travel together. A Fabric notebook structure change updates the C4 container diagram. A topology change creates or amends an ADR. A pipeline change updates the publishing source and Confluence page in the same review cycle.



The SPA makes that pattern tangible. ClojureScript data renders the interactive C4 model. Markdown ADRs explain accepted trade-offs. PlantUML and Mermaid examples show how static diagrams can remain diffable. The result is not just a portfolio demo; it is a model for keeping platform architecture understandable after the original launch meeting ends.



| Architecture Asset | Source of Truth | Review Mechanism | Why It Stays Current |
| --- | --- | --- | --- |
| C4 model | ClojureScript data and diagram source | Code review | Changes are made where engineers work |
| ADR | Markdown | Pull request plus architecture review | Decision text changes with the system |
| Fabric topology | Git-synced workspace artifacts and IaC | Environment promotion | Artifacts, parameters, and docs share names and lifecycle |
| Confluence page | Rendered Markdown via API | Publish job output | Stakeholder docs are regenerated from reviewed content |
