---
title: "How I'm Getting the Best Results from AI Lately"
date: 2026-06-02T15:52:15Z
draft: false
tags: ["ai", "workflow", "claude"]
summary: "The most success I'm having with AI lately is using it as a thinking partner, not just a generator — five steps that make the difference."
---

The most success I'm having with AI lately is using Claude Opus as a thinking partner, not just a generator.

1. I start with intent: I want to do this, and I want you to interview me until you're 95% confident. That forces the conversation out of guesswork and into clarity.
2. I point to prior documentation to manage context. If there's already a good source of truth, I want the model anchored to that instead of rebuilding the world from scratch.
3. Then I ask: What lack of clarity or blind spots are missing? That's where the real value shows up — assumptions, constraints, and gaps I hadn't named yet.
4. After that, I ask for suggestions for each gap, so the model turns uncertainty into action.
5. And then: Do it.

That workflow works because it treats AI like a partner for better thinking, not a shortcut for skipping it.

## From initial intent to an informed decision

```mermaid
flowchart TD
  accTitle: From initial intent to an informed decision
  n0["💬 State intent"] --> n1
  n1["❔ Interview for clarity"] --> n2
  n2["📚 Ground in prior documentation"] --> n3
  n3["🔍 Identify gaps"] --> n4
  n4["💡 Choose suggestions"] --> n5
  n5["▶ Act"]
  classDef process fill:#E0E7FF,stroke:#4338CA,color:#172B4D,stroke-width:2px
  classDef result fill:#ECFCCB,stroke:#4D7C0F,color:#172B4D,stroke-width:2px
  class n0,n1,n2,n3,n4 process
  class n5 result
```
