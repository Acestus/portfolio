---
title: "Troubleshooting the dependencies behind a data center migration"
date: 2026-11-22
draft: false
icon: "🧩"
tags: ["contract-work", "troubleshooting", "cloud-migration"]
summary: "How I helped map identity, LDAP, Group Policy, and DNS responsibilities to Azure services during a customer migration."
---

One support engagement involved helping a customer move out of its data center and into Azure.

The customer needed to retire its on-premises environment, including its domain controllers, which supported several important services. Domain controllers are complicated because they provide more than one function. They handled identity, LDAP bindings, Group Policy, DNS, and other dependencies.

I worked through those responsibilities one at a time. I helped move application authentication from LDAP and legacy integrations to MSAL, SAML, and Microsoft Entra ID. I replaced Group Policy with Azure Policy and Intune configuration management where appropriate. I also set up a virtual network and private DNS zone in Azure and moved the customer’s DNS responsibilities into Azure.

I was not the only person involved. Only one other person at the company had sufficient Azure access, and he helped me carry out the work. He understood the existing on-premises technology, while I was brought in because of my knowledge of Azure and Microsoft cloud technologies. I developed the plan and direction, and we worked through the migration together.

After approximately six months, the customer was able to shut down its data center and domain controllers. The services remained available, and the business continued operating normally.

For me, troubleshooting a complicated environment starts with understanding what the system is responsible for. A domain controller can look like one thing on a diagram, but it may be carrying several separate dependencies. I try to identify them, handle them one at a time, and make sure each responsibility has a place to go before retiring the old system.

## Supporting visual

```mermaid
flowchart TD
  accTitle: Trace domain controller responsibilities to Azure replacements
  A[Inventory domain controller responsibilities] --> B[Identity and LDAP]
  A --> C[Group Policy]
  A --> D[DNS]
  B --> E[MSAL SAML and Entra ID]
  C --> F[Azure Policy and Intune]
  D --> G[Azure virtual network and private DNS]
  E --> H[Verify services remain available]
  F --> H
  G --> H
  H --> I[Retire data center]

  classDef source fill:#DBEAFE,stroke:#2563EB,color:#172B4D,stroke-width:2px
  classDef outcome fill:#FFEDD5,stroke:#C2410C,color:#172B4D,stroke-width:2px
  class A,B,C,D,E,F,G source
  class H,I outcome
```
