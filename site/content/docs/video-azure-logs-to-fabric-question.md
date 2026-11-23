---
title: "From Azure logs to a Fabric operations question"
description: "Trace synthetic Azure telemetry into Fabric and answer one focused operations question."
space: "Video production"
date: "2026-11-21"
draft: false
---

## Goal

Connect collection, ingestion, transformation, and query results while making the architecture and cost visible.

## Demonstration sequence

1. Generate a small synthetic operational event set and state the question it should answer.
2. Show the ingestion path, schema normalization, and one query or dashboard with an expected result.
3. List the services, retention choices, refresh cadence, and rough cost drivers that make the design operational.

## Guardrails and evidence

Use generated logs with no tenant, IP, user, or customer identifiers. Do not claim a dashboard provides alerting or freshness beyond what the pipeline proves.

Finish with the evidence a viewer can reproduce: the source change, check output, and observable result. Keep the demonstration small enough to rebuild from a clean sample environment.

## Diagram

```mermaid
flowchart TD
  accTitle: From Azure logs to a Fabric operations question
  A@{ icon: "azure:monitor", form: "rounded", label: "Azure Monitor", pos: "t", h: 32 } --> L[Log source]
  L --> I@{ icon: "azure:event-hub", form: "rounded", label: "Event Hubs ingestion", pos: "t", h: 32 }
  I --> F[Fabric transform]
  F --> Q[Operations query]
  Q --> D[Dashboard answer]
  D --> E[Freshness and cost evidence]

  classDef primary fill:#CFFAFE,stroke:#0E7490,color:#172B4D,stroke-width:2px
  classDef secondary fill:#FFEDD5,stroke:#C2410C,color:#172B4D,stroke-width:2px
  class A,L,I,F primary
  class Q,D,E secondary
```

## Recording checklist

- State the question the example answers and identify the synthetic or disposable environment.
- Show the important configuration and one expected result before the walkthrough ends.
- Call out the operational limit that the green check does not cover.
