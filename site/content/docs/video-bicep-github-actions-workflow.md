---
title: "Infrastructure as code with Bicep and GitHub Actions"
description: "Walk through pull-request validation, federated identity, and an understandable Azure deployment workflow."
space: "Video production"
date: "2026-11-21"
draft: false
---

## Goal

Show how one reviewed Bicep change moves from validation to an authenticated deployment with useful evidence.

## Demonstration sequence

1. Make a small, safe resource change and run Bicep lint/build plus a what-if preview in the pull request.
2. Merge a short-lived branch through the trunk workflow and use GitHub OIDC to obtain Azure access without a stored password.
3. Check the deployed resource and the release run; explain rollback and the limits of the acceptance check.

## Guardrails and evidence

Use a disposable resource group and least-privilege identity. Never paste tokens, tenant data, or production subscription identifiers into the recording.

Finish with the evidence a viewer can reproduce: the source change, check output, and observable result. Keep the demonstration small enough to rebuild from a clean sample environment.

## Diagram

```mermaid
flowchart TD
  accTitle: Infrastructure as code with Bicep and GitHub Actions
  B[Bicep change] --> P[Pull request]
  P --> V[Lint build and what-if]
  V --> M[Merge to main]
  M --> O[OIDC federation]
  O --> D[Azure deployment]
  D --> A[Acceptance check]

  classDef primary fill:#DBEAFE,stroke:#2563EB,color:#172B4D,stroke-width:2px
  classDef secondary fill:#FFEDD5,stroke:#C2410C,color:#172B4D,stroke-width:2px
  class B,P,M,O,D primary
  class V,A secondary
```

## Recording checklist

- State the question the example answers and identify the synthetic or disposable environment.
- Show the important configuration and one expected result before the walkthrough ends.
- Call out the operational limit that the green check does not cover.

## Demo video

[Watch the IaC deployment walkthrough](/videos/iac-deployment/).
