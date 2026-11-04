---
title: "Pricing & Cost Optimizer — Fabric, AI Foundry, and Commitment Terms"
description: "The Microsoft Build 2026 refresh turns the demo into a FinOps planning surface for Azure, Microsoft Fabric, and AI Foundry. The SPA now compares six SKU categories, applies commitment-term discounts per eligible SKU,…"
space: "Cloud & operations"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/pricing-optimizer.html"
demo: "/pricing.html"
---

> The Microsoft Build 2026 refresh turns the demo into a FinOps planning surface for Azure, Microsoft Fabric, and AI Foundry. The SPA now compares six SKU categories, applies commitment-term discounts per eligible SKU, models joiner-mover-leaver workforce changes, and keeps governance visible through required tags, modify policies, and CAF naming examples that make costs attributable before resources reach production.



- **6** — SKU Categories

- **30–72%** — RI Savings Range

- **F2–F64** — Fabric Capacity SKUs

- **$0.15/1M** — GPT-4o-mini Input



Select SKUs→ Apply Term→ Model JML→ Validate Tags→ CAF Names



## 1. Azure SKU Selection and Right-Sizing



The optimizer starts with the practical FinOps question: which SKU is big enough for the workload without buying idle capacity? The refreshed SPA groups selections into Compute, Storage, Database, Network, Microsoft Fabric, and AI Foundry. Each selected SKU contributes a list-price monthly value, then the commitment selector recomputes the total with per-SKU factors.



Discounts are deliberately SKU-aware. Compute, database, and Fabric capacity can benefit from reservations or savings plans, while storage and network examples remain at pay-as-you-go because the modeled SKUs do not use the same RI/SP mechanics. This makes the demo closer to a real optimization workflow than a flat percentage calculator.



| Category | Example SKUs | Modeled Monthly Range | Optimization Lever |
| --- | --- | --- | --- |
| Compute | B2s, D4s\_v5, D8s\_v5, E16s\_v5 | $30–$580 | Right-size vCPU/RAM, then reserve stable baseline |
| Storage | LRS-Hot, ZRS-Hot, LRS-Cool, GRS-Archive | $3–$36 | Move cold data to cool/archive and choose redundancy intentionally |
| Database | Basic-5DTU, S1-20DTU, P1-125DTU, Serverless-GP | $5–$465 | Use serverless for intermittent workloads; reserve steady DTU/vCore usage |
| Network | Basic-LB, Standard-LB, App-GW-v2, Front Door | $0–$330 | Match ingress pattern to availability and security requirements |
| Fabric | F2, F8, F32, F64 | $262–$8,406 | Size by Capacity Units, concurrency, and smoothing behavior |
| AI Foundry | GPT-4o-mini, GPT-4o, o1, embedding-3-large | $22–$1,850 example workload | Route requests by task complexity and token volume |



> The key behavior in the SPA is recomputation: changing a SKU, commitment term, or JML scenario immediately updates list price, committed cost, monthly savings, and adjusted workforce-impact cost.



### Discount Factors Used by the Demo



```text
Pay-As-You-Go: factor 1.00 for every SKU
RI 1-Year:      per-SKU RI factor, usually 0.55–0.75 for eligible compute/database/Fabric
RI 3-Year:      RI factor minus 0.20, floored at 0.28 to show up-to-72% savings
Savings Plan:   per-SKU SP factor, usually 0.63–0.72 for eligible workloads
```



## 2. Fabric Capacity SKUs (F2 through F64, with smoothing notes)



Microsoft Fabric capacity is modeled as a first-class cost category because Fabric is often the largest single line item in a data platform. The SPA includes F2, F8, F32, and F64 choices and labels them with approximate monthly capacity costs. These examples represent the reserved compute pool that backs notebooks, pipelines, lakehouses, warehouses, semantic models, and reports.



Fabric planning is not just list price. Capacity Units (CUs), interactive concurrency, Spark environment sizing, and smoothing behavior all determine whether users experience steady throughput or HTTP 430 capacity exhaustion. A right-sized Fabric environment allows bursty work, but repeated overconsumption creates CU debt that must drain before new work can start.



| Fabric SKU | Capacity Units | Approx. PAYG / Month | RI 1-Year Factor | Best Fit |
| --- | --- | --- | --- | --- |
| F2 | 2 CUs | ~$262 | 0.59 | Small dev/test, proof of concept, scheduled light workloads |
| F8 | 8 CUs | ~$1,051 | 0.59 | Team workspace, light production reporting, limited notebook use |
| F32 | 32 CUs | ~$4,203 | 0.59 | Production data engineering and BI with moderate concurrency |
| F64 | 64 CUs | ~$8,406 | 0.59 | Enterprise semantic models, high concurrency, larger Spark jobs |



### Capacity Tuning Pattern



The reference pattern for notebook authors is to keep interactive Spark sessions smaller, use dynamic allocation, and reserve large environments for scheduled training or batch runs. High Concurrency mode can let multiple notebooks share a single Spark session instead of each consuming a separate capacity allocation.



```text
# Fabric interactive notebook posture
spark.sql.shuffle.partitions = 8
spark.dynamicAllocation.enabled = true
minExecutors = 1
maxExecutors = 3

# Operational rule
# Use small interactive environments during the day.
# Run large ML or batch jobs through scheduled pipelines.
```



> Smoothing is a buffer, not free capacity. If a workload repeatedly consumes more CUs than the SKU can sustain, Fabric can throttle new sessions until the debt drains. The optimizer highlights this by making F-SKU selection visible next to commitment-term savings.



## 3. AI Foundry Model Pricing



The refreshed SPA includes AI Foundry model choices because model routing is now a core cost optimization decision. A small classification task should not pay reasoning-model prices; a complex planning or code-assist task may justify a higher-priced model if it reduces retries, manual review, or failed automation.



The demo uses public per-1M-token rates for representative OpenAI models available through Azure AI Foundry style deployments. The example monthly costs in the SPA are workload estimates, not platform minimums: actual charges depend on input tokens, output tokens, cache behavior, region, and whether deployments are pay-as-you-go or provisioned.



| Model | Input Price | Output Price | Use When | Cost Note |
| --- | --- | --- | --- | --- |
| GPT-4o-mini | $0.15 / 1M tokens | $0.60 / 1M tokens | High-volume chat, extraction, classification, lightweight agents | Default low-cost model in the SPA |
| GPT-4o | $2.50 / 1M tokens | $10.00 / 1M tokens | Multimodal reasoning, higher quality generation, complex summarization | Use where quality saves downstream labor |
| o1 | $15.00 / 1M tokens | $60.00 / 1M tokens | Deep reasoning, planning, hard technical analysis | Route sparingly; expensive output tokens dominate |
| text-embedding-3-large | $0.13 / 1M tokens | Input only | Vector search, retrieval augmentation, semantic matching | Control cost by chunk size and re-index cadence |



### Routing Pattern



```text
if task == "embedding":
    model = "text-embedding-3-large"
elif task in ["classification", "draft", "extract"]:
    model = "gpt-4o-mini"
elif task in ["analysis", "multimodal", "high-quality-writeup"]:
    model = "gpt-4o"
else:
    model = "o1"  # only for explicitly justified reasoning workloads
```



## 4. Commitment Terms: RI vs Savings Plans



The commitment selector is the biggest behavioral change from the older article. The SPA now lets the viewer compare Pay-As-You-Go, RI 1-Year, RI 3-Year, and Savings Plan. The result is not a generic discount; each SKU carries its own reservation and savings-plan factor.



Reserved Instances are strongest when the workload shape is stable: always-on compute, steady database capacity, and known Fabric capacity. Savings Plans are better when the hourly spend is predictable but the exact SKU or instance family changes over time. Pay-as-you-go remains the correct choice for experiments, short-lived environments, and workloads that may be deleted soon.



| Term | How the SPA Treats It | Best Use | Avoid When |
| --- | --- | --- | --- |
| Pay-As-You-Go | No discount; factor 1.00 | New workloads, temporary environments, unknown demand | Stable baseline has months of history |
| RI 1-Year | Applies SKU RI factors such as 0.55–0.75 | Predictable compute, database, or Fabric usage for the next fiscal year | Roadmap may migrate or retire the service |
| RI 3-Year | Shows deeper savings, floored at 0.28 | Mature production platforms with durable demand | Architecture, region, or capacity size is still changing |
| Savings Plan | Applies flexible hourly-spend factors such as 0.63–0.72 | Steady spend with changing SKUs or instance families | Spend level is volatile or dominated by non-eligible services |



> The practical workflow is: run PAYG until usage stabilizes, reserve the predictable floor, keep burst capacity flexible, and revisit commitments when JML, region moves, or platform migrations change the baseline.



## 5. JML Cost Impact (joiner-mover-leaver workforce changes)



JML modeling connects cloud spend to workforce lifecycle events. A joiner can trigger compute, storage, model access, workspace permissions, and license assignment. A mover can shift costs between cost centers or elevate access to higher-cost platforms. A leaver should reduce cost when licenses, per-user resources, and access paths are reclaimed.



The SPA applies scenario multipliers after commitment discounts, making it clear that lifecycle automation affects the adjusted monthly total. This order matters: a reserved baseline can still waste money if offboarding does not release licenses or if movers retain access to old workspaces.



| Scenario | SPA Multiplier | Cost Motion | Governance Check |
| --- | --- | --- | --- |
| New Hire | 1.15× | +15% for onboarding, licenses, provisioning, data access | Owner, Project, CostCenter tags populated at creation |
| Transfer | 1.05× | +5% for role change, duplicated access, temporary overlap | Cost center and access reviews updated with the move |
| Steady State | 1.00× | Baseline monthly operating cost | Budget and Advisor reviews catch drift |
| Offboard | 0.60× | −40% for license reclaim and resource deprovisioning | Disable access, delete personal resources, transfer ownership |



### JML Control Loop



```text
Joiner  → provision least-privilege access + default tags + budget owner
Mover   → change cost center + remove stale role assignments
Leaver  → reclaim licenses + delete user-scoped resources + transfer ownership
Review  → compare adjusted forecast to actual spend monthly
```



## 6. CAF Naming & Tag Governance



The final part of the SPA keeps governance in the same screen as cost. Required tags make charges attributable, and CAF naming makes resources understandable in search, billing exports, and incident response. The demo shows both Azure resource naming patterns and Fabric artifact naming patterns.



Governance is intentionally non-blocking where possible. Modify-effect policies add missing required tags during creation or remediation instead of denying deployments. Deny policies are reserved for hard safety boundaries such as public exposure or disallowed regions.



| Required Tag | Purpose | Default / Source | Cost Management Use |
| --- | --- | --- | --- |
| `CostCenter` | Cost allocation and chargeback | Inherited from subscription | Group spend by budget owner |
| `Environment` | dev / tst / stg / prd classification | Subscription naming | Separate production from non-production burn |
| `Owner` | Team or person accountable | Creator or resource group owner | Route alerts and cleanup actions |
| `Project` | Workload or initiative | Deployment parameter | Forecast project-level run cost |
| `BuildEvent` | Microsoft Build 2026 demo tracking | false unless explicitly set | Measure campaign/demo resources separately |



### CAF Naming Examples



| Resource Type | Pattern | Example |
| --- | --- | --- |
| Function App | `func-{project}-{env}-{region}-{instance}` | `func-copilot-prd-usw2-001` |
| Storage Account | `st{project}{env}{region}{instance}` | `stcopilotprdusw2001` |
| Key Vault | `kv-{project}-{env}-{region}-{instance}` | `kv-copilot-prd-usw2-001` |
| Fabric Capacity | `cap-{domain}-{env}-{region}-{instance}` | `cap-data-prd-usw2-001` |
| AI Foundry | `oai-{project}-{env}-{region}-{instance}` | `oai-copilot-prd-usw2-001` |
| App Service | `app-{project}-{env}-{region}-{instance}` | `app-portfolio-prd-usw2-001` |



### Fabric Artifact Naming



| Artifact | Prefix / Pattern | Example | Usage |
| --- | --- | --- | --- |
| Workspace | `ws_<domain>_<env>` | `ws_sales_prd` | Domain and environment boundary |
| Lakehouse | `lh_<domain>_<layer>` | `lh_sales_brz` | Bronze, Silver, Gold storage |
| Pipeline | `pl_<function>_<source>_<domain>_<layer>` | `pl_ing_salesforce_sales_brz` | Ingestion and orchestration |
| Notebook | `nb_<purpose>_<domain>_<desc>` | `nb_dq_sales_validation` | Data quality, analytics, utility |
| Semantic Model | `sm_<domain>_<purpose>` | `sm_sales_performance` | Power BI model layer |



### Modify Policy Sketch



```text
{
  "if": {
    "field": "tags['CostCenter']",
    "exists": false
  },
  "then": {
    "effect": "modify",
    "details": {
      "operations": [
        { "operation": "add", "field": "tags['CostCenter']", "value": "Production" }
      ]
    }
  }
}
```



> Use placeholders in documentation and examples: subscription scopes such as `Production` or `Connectivity hub`, tenant identifiers from docs.microsoft.com examples, and network examples like `10.0.0.0/16`. Public CAF patterns and Microsoft Learn links can remain exact.
