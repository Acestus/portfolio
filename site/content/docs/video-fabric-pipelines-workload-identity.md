---
title: "Scheduling Fabric pipelines with workload identity"
description: "Explain a scheduled trigger that calls a Fabric API using workload identity and least privilege."
space: "Video production"
date: "2026-11-21"
draft: false
---

## Goal

Make the scheduler, identity, API request, and pipeline outcome visible as separate operational responsibilities.

## Demonstration sequence

1. Define a schedule and a bounded pipeline with generated input data.
2. Acquire a short-lived token through an approved workload identity and call the documented API; inspect the response and run status.
3. Compare managed scheduling and external orchestration choices, including monitoring, retries, and ownership.

## Guardrails and evidence

Do not embed client secrets in notebooks or logs. Confirm the currently supported identity flow and API permissions in the target tenant before recording.

Finish with the evidence a viewer can reproduce: the source change, check output, and observable result. Keep the demonstration small enough to rebuild from a clean sample environment.

## Diagram

```mermaid
flowchart LR
  S[Schedule] --> W[Workload identity]
  W --> T[Short-lived token]
  T --> A[Fabric API]
  A --> P[Pipeline run]
  P --> M[Status and alert]
```

## Recording checklist

- State the question the example answers and identify the synthetic or disposable environment.
- Show the important configuration and one expected result before the walkthrough ends.
- Call out the operational limit that the green check does not cover.
