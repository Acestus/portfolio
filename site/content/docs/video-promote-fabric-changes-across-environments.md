---
title: "Promoting Fabric changes safely across environments"
description: "Follow one source-controlled Fabric change through development, staging, and production with retained evidence."
space: "Video production"
date: "2026-11-21"
draft: false
---

## Goal

Show a controlled promotion path where each environment receives the same reviewed release and has its own verification.

## Demonstration sequence

1. Create a small definition change and capture its source commit and validation results.
2. Publish to Development, verify it, then promote the retained artifact to Staging and Production with explicit approvals.
3. Compare the release identity and stage receipts; demonstrate a stop when evidence is missing or stale.

## Guardrails and evidence

Never rebuild different bytes per environment and call them the same release. Keep workspace access, connections, and live data outside the claim made by a definition deployment.

Finish with the evidence a viewer can reproduce: the source change, check output, and observable result. Keep the demonstration small enough to rebuild from a clean sample environment.

## Diagram

```mermaid
flowchart TD
  accTitle: Promoting Fabric changes safely across environments
  P[Reviewed change] --> A[Build retained artifact]
  A --> D[Development]
  D -->|verified receipt| S[Staging]
  S -->|approval and receipt| R[Production]
  R --> V[Live verification]

  classDef primary fill:#EEF2FF,stroke:#4338CA,color:#172B4D,stroke-width:2px
  classDef secondary fill:#FEF9C3,stroke:#A16207,color:#172B4D,stroke-width:2px
  class P,A,D,S,R primary
  class V secondary
```

## Recording checklist

- State the question the example answers and identify the synthetic or disposable environment.
- Show the important configuration and one expected result before the walkthrough ends.
- Call out the operational limit that the green check does not cover.
