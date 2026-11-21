---
title: "A secure, repeatable VM patching workflow"
description: "Plan a VM maintenance cycle with explicit coverage, exceptions, and guest-level verification."
space: "Video production"
date: "2026-11-21"
draft: false
---

## Goal

Explain how an inventory, maintenance policy, assignment, and actual installation status work together.

## Demonstration sequence

1. Define a fictional target inventory, maintenance window, patch classifications, and reboot behavior.
2. Preview scope, handle a named exception with an expiry, and apply the schedule to one disposable VM.
3. Inspect guest patch status and maintenance results; show how failed or unreported machines remain visible.

## Guardrails and evidence

A schedule assignment is not proof that updates installed. Keep exception owners and review dates explicit, and do not patch production during a demo.

Finish with the evidence a viewer can reproduce: the source change, check output, and observable result. Keep the demonstration small enough to rebuild from a clean sample environment.

## Diagram

```mermaid
flowchart TD
  accTitle: A secure, repeatable VM patching workflow
  I[Reviewed inventory] --> S[Scope validation]
  P[Patch policy] --> A[Assignment]
  S --> A
  A --> W[Maintenance window]
  W --> G@{ icon: "azure:virtual-machine", form: "rounded", label: "VM guest installation", pos: "t", h: 32 }
  G --> V[Result verification]
  V --> E[Exceptions and follow-up]

  classDef primary fill:#F1F5F9,stroke:#475569,color:#172B4D,stroke-width:2px
  classDef secondary fill:#FEF9C3,stroke:#A16207,color:#172B4D,stroke-width:2px
  class I,P,A,W,G primary
  class S,V,E secondary
```

## Recording checklist

- State the question the example answers and identify the synthetic or disposable environment.
- Show the important configuration and one expected result before the walkthrough ends.
- Call out the operational limit that the green check does not cover.
