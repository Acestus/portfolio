---
title: "What infrastructure drift detection catches (and misses)"
description: "Make a controlled change, compare declared and observed state, then explain what the drift report cannot prove."
space: "Video production"
date: "2026-11-21"
draft: false
---

## Goal

Show drift as a useful difference signal that needs interpretation, not a complete measure of system health.

## Demonstration sequence

1. Deploy a small resource from a declared template and capture the expected configuration.
2. Change one harmless property outside the template, run the selected drift check, and inspect the reported difference.
3. Restore the declared value and list untracked runtime behavior, external dependencies, and data changes the check does not cover.

## Guardrails and evidence

Use a disposable resource group. A clean drift result means only that the selected comparison found no difference in its supported scope.

Finish with the evidence a viewer can reproduce: the source change, check output, and observable result. Keep the demonstration small enough to rebuild from a clean sample environment.

## Diagram

```mermaid
flowchart TD
  accTitle: What infrastructure drift detection catches (and misses)
  T[Declared template] --> D[Deploy]
  D --> A[Actual resource]
  A -->|manual change| M[Modified property]
  T --> C[Drift comparison]
  M --> C
  C --> R[Reported difference]
  R --> X[Review and reconcile]

  classDef primary fill:#D1FAE5,stroke:#047857,color:#172B4D,stroke-width:2px
  classDef secondary fill:#FCE7F3,stroke:#BE185D,color:#172B4D,stroke-width:2px
  class T,D,A primary
  class M,C,R,X secondary
```

## Recording checklist

- State the question the example answers and identify the synthetic or disposable environment.
- Show the important configuration and one expected result before the walkthrough ends.
- Call out the operational limit that the green check does not cover.
