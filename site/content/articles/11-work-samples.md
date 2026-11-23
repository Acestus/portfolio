---
title: "A few examples of my work"
date: 2026-11-22
draft: false
icon: "💻"
tags: ["contract-work", "work-samples", "infrastructure"]
summary: "Examples of my work in CI/CD, infrastructure as code, logs and observability, and software."
---

The ultimate measure of an engineer is their work. Here are a few examples that are representative of the work I like to do.

My website is [Acestus](https://acestus.com/). It brings together my technical work, writing, and portfolio.

I made a [video showing CI/CD with infrastructure as code](https://acestus.com/videos/cicd-with-iac/). I enjoy making a small change, creating or running a test, confirming the result, and then moving forward with evidence. That feedback loop is deeply satisfying to me.

{{< video-link "cicd-with-iac" >}}

I also wrote about [how I like to do logs and observability](https://acestus.com/logs.html). For me, logs are useful when they help someone understand what a system is doing and give them a way to investigate when something goes wrong.

And here is my [portfolio](https://acestus.com/portfolio/). I love taking in complex material, organizing it, and figuring out how the pieces connect. These examples show some of the ways I put that into practice: infrastructure, delivery, observability, and working software.

## Supporting visual

```mermaid
flowchart TD
  accTitle: How the work samples connect infrastructure, delivery, and operations
  A[Infrastructure] --> B[CI/CD and automation]
  B --> C[Working software]
  C --> D[Logs and observability]
  D --> E[Understand and improve the system]

  classDef delivery fill:#DBEAFE,stroke:#2563EB,color:#172B4D,stroke-width:2px
  classDef operations fill:#FFEDD5,stroke:#C2410C,color:#172B4D,stroke-width:2px
  class A,B,C delivery
  class D,E operations
```

## Video walkthrough

{{< video-link "work-samples" >}}
