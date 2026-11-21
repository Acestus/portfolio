---
title: "Automated acceptance tests for a web workflow"
description: "Use Playwright to turn one web user story into a repeatable local feedback loop and CI check."
space: "Video production"
date: "2026-11-21"
draft: false
---

## Goal

Show an acceptance test that verifies an observable user outcome instead of only checking that a page loaded.

## Demonstration sequence

1. Choose a small workflow and identify the user-visible state change that counts as success.
2. Write a Playwright test using stable accessible locators and a deterministic fixture; run it locally while changing the behavior.
3. Run the same focused test in CI and inspect screenshots or traces when the expected outcome fails.

## Guardrails and evidence

Avoid brittle sleeps and live external services. Keep test data synthetic and make the acceptance condition explicit enough to fail meaningfully.

Finish with the evidence a viewer can reproduce: the source change, check output, and observable result. Keep the demonstration small enough to rebuild from a clean sample environment.

## Diagram

```mermaid
flowchart TD
  accTitle: Automated acceptance tests for a web workflow
  U[User story] --> A[Accessible test steps]
  A --> L[Local Playwright run]
  L -->|pass| C[CI browser check]
  L -->|fail| D[Trace and fix]
  D --> L
  C --> R[Release evidence]

  classDef primary fill:#EDE9FE,stroke:#6D28D9,color:#172B4D,stroke-width:2px
  classDef secondary fill:#FEF3C7,stroke:#B45309,color:#172B4D,stroke-width:2px
  class U,A,L primary
  class C,D,R secondary
```

## Recording checklist

- State the question the example answers and identify the synthetic or disposable environment.
- Show the important configuration and one expected result before the walkthrough ends.
- Call out the operational limit that the green check does not cover.
