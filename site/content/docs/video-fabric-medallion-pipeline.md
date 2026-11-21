---
title: "A Fabric medallion pipeline from raw data to a useful report"
description: "Build a small Bronze, Silver, and Gold data flow from generated records to a validated report."
space: "Video production"
date: "2026-11-21"
draft: false
---

## Goal

Explain how a modest medallion pipeline turns raw input into a report that answers one explicit question.

## Demonstration sequence

1. Generate a compact synthetic source file and load it unchanged to Bronze with an ingestion timestamp.
2. Normalize types, reject or quarantine invalid rows in Silver, then aggregate one business question in Gold.
3. Check row counts, null handling, and a known expected result before presenting the report.

## Guardrails and evidence

Label generated data clearly. A successful pipeline run proves execution, not that transformations are analytically correct; retain a small expected-output check.

Finish with the evidence a viewer can reproduce: the source change, check output, and observable result. Keep the demonstration small enough to rebuild from a clean sample environment.

## Diagram

```mermaid
flowchart TD
  accTitle: A Fabric medallion pipeline from raw data to a useful report
  X[Generated source] --> B[Bronze raw]
  B --> S[Silver validated]
  S --> G[Gold aggregate]
  G --> R[Report]
  R --> Q[Expected result check]

  classDef endpoint fill:#E8F0FE,stroke:#1A73C7,color:#172B4D,stroke-width:2px
  classDef bronze fill:#F5DEB3,stroke:#CD7F32,color:#172B4D,stroke-width:2px
  classDef silver fill:#E8E8E8,stroke:#808080,color:#172B4D,stroke-width:2px
  classDef gold fill:#FFF8DC,stroke:#DAA520,color:#172B4D,stroke-width:2px
  class X,R,Q endpoint
  class B bronze
  class S silver
  class G gold
  linkStyle 0 stroke:#CD7F32,stroke-width:2px
  linkStyle 1 stroke:#808080,stroke-width:2px
  linkStyle 2 stroke:#DAA520,stroke-width:2px
  linkStyle 3,4 stroke:#1A73C7,stroke-width:2px
```

## Recording checklist

- State the question the example answers and identify the synthetic or disposable environment.
- Show the important configuration and one expected result before the walkthrough ends.
- Call out the operational limit that the green check does not cover.
