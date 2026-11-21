---
title: "Configuration management versus rebuilding the image"
description: "Compare applying a small server change after provisioning with producing a new immutable machine image."
space: "Video production"
date: "2026-11-21"
draft: false
---

## Goal

Help teams reason about repeatability, recovery, and operational overhead for a routine configuration change.

## Demonstration sequence

1. Define one simple change, such as a package version or service setting, and write down the recovery goal.
2. Walk through a configuration-management run that converges a test server, then a rebuilt image deployment with the same change.
3. Compare auditability, time to recover, drift, rollout safety, and the owner's ongoing maintenance burden.

## Guardrails and evidence

Use disposable virtual machines and a harmless package or setting. Do not suggest either method guarantees security without a patch and verification process.

Finish with the evidence a viewer can reproduce: the source change, check output, and observable result. Keep the demonstration small enough to rebuild from a clean sample environment.

## Diagram

```mermaid
flowchart TD
  accTitle: Configuration management versus rebuilding the image
  C[Configuration change] --> M[Configuration management]
  M --> H[Existing host converges]
  C --> I[Build new image]
  I --> N[Replace with tested host]
  H --> V[Verify and recover]
  N --> V

  classDef primary fill:#CCFBF1,stroke:#0F766E,color:#172B4D,stroke-width:2px
  classDef secondary fill:#FFE4E6,stroke:#BE123C,color:#172B4D,stroke-width:2px
  class C,M,H primary
  class I,N secondary
```

## Recording checklist

- State the question the example answers and identify the synthetic or disposable environment.
- Show the important configuration and one expected result before the walkthrough ends.
- Call out the operational limit that the green check does not cover.
