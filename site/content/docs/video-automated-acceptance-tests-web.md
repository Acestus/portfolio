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

## Acceptance test architecture

The acceptance test expresses expected behavior through a domain-specific language (DSL). The DSL delegates browser interactions to a system driver such as Playwright. If a scenario needs an external dependency, a separate driver can configure or inspect its stub.

```mermaid
flowchart TD
  accTitle: Acceptance test architecture with a DSL and separate drivers for the system and external systems
  T(Acceptance Test) --- D(DSL)
  D --- S(System Drivers)
  D --- X(External System Drivers)
  S --- A(System)
  X --- E(External Systems)

  classDef test fill:#FFE08A,stroke:#92400E,color:#172B4D,stroke-width:2px
  classDef language fill:#B5EAF5,stroke:#0E7490,color:#172B4D,stroke-width:2px
  classDef driver fill:#E5E7EB,stroke:#475569,color:#172B4D,stroke-width:2px
  classDef system fill:#DCD6FA,stroke:#6D28D9,color:#172B4D,stroke-width:2px
  class T test
  class D language
  class S,X driver
  class A,E system
  style E stroke-dasharray:5 4
```

Adapted from [Valentina Jemuović’s acceptance test architecture in Optivem Journal](https://journal.optivem.com/p/spec-driven-development-make-specs).

## Recording checklist

- State the question the example answers and identify the synthetic or disposable environment.
- Show the important configuration and one expected result before the walkthrough ends.
- Call out the operational limit that the green check does not cover.

## Demo video

{{< video-link "automated-acceptance-tests-web" >}}
