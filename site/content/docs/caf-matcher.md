---
title: "CAF Naming — The Convention That Scales"
description: "The Microsoft Build 2026 refresh turns the CAF matcher from a simple puzzle explainer into a governance article about naming that scales. The SPA teaches the same muscle memory platform teams need in production:…"
space: "Architecture & delivery"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/caf-matcher.html"
demo: "/matcher.html"
---

> The Microsoft Build 2026 refresh turns the CAF matcher from a simple puzzle explainer into a governance article about naming that scales. The SPA teaches the same muscle memory platform teams need in production: choose the resource type, match the CAF pattern, validate the name before provisioning, and keep Azure and Microsoft Fabric artifacts consistent enough for ownership, cost attribution, and automation.



- **{type}-{project}-{env}-{region}-{instance}** — Core Azure CAF Pattern

- **PR-Gated** — Names Validated Before Merge

- **Azure Naming Tool** — Standardize and Automate

- `lh_<domain>_<layer>` — Fabric Pattern



Choose Type→ Match Pattern→ Validate→ Provision→ Govern



## Why Naming Conventions Matter



Cloud sprawl starts as a readability problem. If a resource name does not reveal type, workload, environment, and region, every incident, cleanup, and cost review begins with a manual lookup. CAF-aligned naming converts the name itself into operational metadata.



The matcher game reinforces that pattern by asking players to connect resource types to compliant names. In production, the same matching happens in pull requests, deployment pipelines, inventory exports, and chargeback reviews.



Consistent naming improves ownership, cost attribution, and governance. A resource named `func-coredata-prd-usw2-001` immediately reads as an example project code for a production Function App in West US 2. A name like `app-final-v2` does not.



## The CAF Pattern Explained



The Azure resource convention used by the demo follows a hyphenated Cloud Adoption Framework pattern:



```text
{type}-{project}-{env}-{region}-{instance}
func-project-dev-usw2-001
kv-coremon-prd-usw2-001   # coremon is an example project code
umi-coredata-dev-usw2-ctl  # ctl marks a control-plane identity
```



| Component | Purpose | Allowed / Example Values | Governance Notes |
| --- | --- | --- | --- |
| `type` | Resource-type abbreviation | `rg`, `func`, `kv`, `st`, `vnet` | Comes from the canonical abbreviation table. |
| `project` | Workload or platform short code | `project`, `coremon`, `coredata`, `coresec` | Real-looking values here are example project codes only. |
| `env` | Deployment environment | `dev`, `stg`, `prd`, `sbx` | Map subscription names to generic scopes such as Production, Dev, and Sandbox. |
| `region` | Azure location code | `usw2` for West US 2, `eus` for East US | Keep the code short and stable. |
| `instance` | Sequence or purpose suffix | `001`, `002`, `ctl`, `dat` | Use numeric instances for multiples and purpose suffixes for identities. |



## Resource-Type Abbreviations



The canonical table keeps names predictable across subscriptions. It is grounded in the Microsoft CAF abbreviation guidance and extended with common deployment, identity, data, analytics, network, monitoring, and Fabric-adjacent resource types used by modern Azure platforms.



| Category | Resource | Provider / Scope | Abbreviation | Example Name |
| --- | --- | --- | --- | --- |
| Management | Resource group | Microsoft.Resources/resourceGroups | `rg` | `rg-coremon-dev` |
| Management | Management group | Tenant scope | `mg` | `mg-platform-prd` |
| Management | Deployment stack | Microsoft.Resources/deploymentStacks | `stack` | `stack-coredata-prd-usw2-001` |
| Identity | User-assigned managed identity | Microsoft.ManagedIdentity/userAssignedIdentities | `umi` | `umi-coredata-dev-usw2-ctl` |
| Identity | Key Vault | Microsoft.KeyVault/vaults | `kv` | `kv-coremon-prd-usw2-001` |
| Identity | Federated credential | Child of managed identity | `fc` | `fc-org-repo-main` |
| Compute | Virtual machine | Microsoft.Compute/virtualMachines | `vm` | `vm-build-dev-usw2-001` |
| Compute | Virtual machine scale set | Microsoft.Compute/virtualMachineScaleSets | `vmss` | `vmss-api-prd-usw2-001` |
| Compute | Availability set | Microsoft.Compute/availabilitySets | `avail` | `avail-api-prd-usw2-001` |
| Compute | Managed disk | Microsoft.Compute/disks | `disk` | `disk-api-prd-usw2-001` |
| Web | Function App | Microsoft.Web/sites | `func` | `func-coresec-dev-usw2-001` |
| Web | App Service app | Microsoft.Web/sites | `app` | `app-portal-prd-usw2-001` |
| Web | App Service plan | Microsoft.Web/serverfarms | `asp` | `asp-portal-prd-usw2-001` |
| Web | Static Web App | Microsoft.Web/staticSites | `stapp` | `stapp-portfolio-prd-usw2-001` |
| Containers | Container registry | Microsoft.ContainerRegistry/registries | `cr` | `crplatformdevusw2001` |
| Containers | Azure Kubernetes Service | Microsoft.ContainerService/managedClusters | `aks` | `aks-app-prd-usw2-001` |
| Containers | Container Apps environment | Microsoft.App/managedEnvironments | `cae` | `cae-app-prd-usw2-001` |
| Containers | Container App | Microsoft.App/containerApps | `ca` | `ca-api-prd-usw2-001` |
| Storage | Storage account | Microsoft.Storage/storageAccounts | `st` | `stprojectdevusw2001` |
| Storage | Blob container | Storage child resource | `blob` | `blob-raw-ingest` |
| Storage | File share | Storage child resource | `share` | `share-app-prd` |
| Database | Azure SQL server | Microsoft.Sql/servers | `sql` | `sql-data-prd-usw2-001` |
| Database | Azure SQL database | Microsoft.Sql/servers/databases | `sqldb` | `sqldb-sales-prd-usw2-001` |
| Database | Cosmos DB account | Microsoft.DocumentDB/databaseAccounts | `cosmos` | `cosmos-app-prd-usw2-001` |
| Database | PostgreSQL flexible server | Microsoft.DBforPostgreSQL/flexibleServers | `psql` | `psql-app-prd-usw2-001` |
| Database | Redis cache | Microsoft.Cache/Redis | `redis` | `redis-app-prd-usw2-001` |
| Network | Virtual network | Microsoft.Network/virtualNetworks | `vnet` | `vnet-hub-prd-usw2-001` |
| Network | Subnet | Microsoft.Network/virtualNetworks/subnets | `snet` | `snet-app-prd-usw2-001` |
| Network | Network security group | Microsoft.Network/networkSecurityGroups | `nsg` | `nsg-app-prd-usw2-001` |
| Network | Route table | Microsoft.Network/routeTables | `rt` | `rt-app-prd-usw2-001` |
| Network | Public IP address | Microsoft.Network/publicIPAddresses | `pip` | `pip-app-prd-usw2-001` |
| Network | Load balancer | Microsoft.Network/loadBalancers | `lb` | `lb-app-prd-usw2-001` |
| Network | Application Gateway | Microsoft.Network/applicationGateways | `agw` | `agw-app-prd-usw2-001` |
| Network | Azure Firewall | Microsoft.Network/azureFirewalls | `afw` | `afw-hub-prd-usw2-001` |
| Network | Private endpoint | Microsoft.Network/privateEndpoints | `pep` | `pep-kv-prd-usw2-001` |
| Integration | Event Hubs namespace | Microsoft.EventHub/namespaces | `evhns` | `evhns-coremon-dev-usw2-001` |
| Integration | Event hub | Microsoft.EventHub/namespaces/eventhubs | `evh` | `activitylogs` |
| Integration | Service Bus namespace | Microsoft.ServiceBus/namespaces | `sbns` | `sbns-app-prd-usw2-001` |
| Integration | Service Bus queue | Service Bus child resource | `sbq` | `sbq-orders-prd` |
| Integration | Logic App | Microsoft.Logic/workflows | `logic` | `logic-ops-prd-usw2-001` |
| Data | Data Factory | Microsoft.DataFactory/factories | `adf` | `adf-data-prd-usw2-001` |
| Data | Data Explorer cluster | Microsoft.Kusto/clusters | `dec` | `dec-logs-prd-usw2-001` |
| Data | Data Explorer database | Microsoft.Kusto/clusters/databases | `dedb` | `dedb-logs-prd-usw2-001` |
| AI | Azure AI Search | Microsoft.Search/searchServices | `srch` | `srch-docs-prd-usw2-001` |
| AI | Azure OpenAI Service | Microsoft.CognitiveServices/accounts | `oai` | `oai-copilot-prd-usw2-001` |
| AI | Foundry account | Microsoft.CognitiveServices/accounts | `aif` | `aif-agents-prd-usw2-001` |
| AI | Machine Learning workspace | Microsoft.MachineLearningServices/workspaces | `mlw` | `mlw-models-prd-usw2-001` |
| Monitoring | Application Insights | Microsoft.Insights/components | `appi` | `appi-coremon-dev-usw2-001` |
| Monitoring | Log Analytics workspace | Microsoft.OperationalInsights/workspaces | `log` | `log-platform-prd-usw2-001` |
| Monitoring | Action group | Microsoft.Insights/actionGroups | `ag` | `ag-platform-prd-usw2-001` |
| Monitoring | Managed Grafana | Microsoft.Dashboard/grafana | `amg` | `amg-coremon-dev-usw2-001` |
| Analytics | Fabric capacity | Microsoft.Fabric/capacities | `cap` | `cap-data-prd-usw2-001` |



## Special Cases



Not every Azure service can use the hyphenated pattern exactly. CAF is a convention, but Azure resource-name rules still win.



| Resource | Rule | Pattern | Example |
| --- | --- | --- | --- |
| Storage account | Lowercase letters and numbers only; no hyphens; 3–24 characters; globally unique. | `st{project}{env}{region}{instance}` | `stprojectdevusw2001` |
| Container registry | Usually no hyphens; globally unique; keep compact. | `cr{project}{env}{region}{instance}` | `crplatformdevusw2001` |
| Key Vault | Globally unique DNS name; hyphens allowed; plan for soft-delete and purge protection. | `kv-{project}-{env}-{region}-{instance}` | `kv-project-prd-usw2-001` |
| Resource group | Often uses short form because region and instance are implied by contained resources. | `rg-{project}-{env}` | `rg-coremon-dev` |
| Managed identity | Purpose suffix can be clearer than a number. | `umi-{project}-{env}-{region}-{purpose}` | `umi-coredata-dev-usw2-dat` |
| Event hub entity | Child resource inside a namespace; descriptive names can be better than repeating CAF. | `{stream-name}` | `activitylogs` |



## Fabric Artifact Naming



Microsoft Fabric artifacts use a different but complementary convention. Instead of hyphenated Azure resource names, Fabric workspace items use underscore-delimited prefixes that make the artifact type, domain, and medallion layer visible in the workspace list. Common wildcard patterns include `lh_*_brz`, `lh_*_slv`, `lh_*_gld`, and `nb_*_dq_*`.



| Artifact | Prefix / Pattern | Example | Usage |
| --- | --- | --- | --- |
| Workspace | `ws_<domain>_<env>` | `ws_sales_prd` | Domain and environment boundary. |
| Lakehouse | `lh_<domain>_<layer>` | `lh_sales_brz` | Bronze, Silver, and Gold storage. |
| Pipeline | `pl_<function>_<source>_<domain>_<layer>` | `pl_ing_salesforce_sales_brz` | Ingestion, transformation, orchestration. |
| Notebook | `nb_<purpose>_<domain>_<desc>` | `nb_dq_sales_validation` | Data quality, analytics, utility. |
| Warehouse | `dw_<domain>_<layer>` | `dw_sales_gld` | Gold-layer SQL consumption. |
| Semantic Model | `sm_<domain>_<purpose>` | `sm_sales_performance` | Power BI model layer. |
| Report | `rpt_<domain>_<purpose>` | `rpt_sales_dashboard` | Published analytical report. |
| Dataflow | `df_<purpose>_<domain>_<layer>` | `df_clean_sales_slv` | Low-code transformation artifact. |
| Environment | `env_<domain>_spark` | `env_sales_spark` | Runtime and library configuration. |



```text
Bronze: lh_sales_brz, pl_ing_erp_sales_brz, nb_dq_sales_brz
Silver: lh_sales_slv, pl_tfm_sales_brz_slv, nb_dq_sales_slv
Gold:   lh_sales_gld, dw_sales_gld, sm_sales_performance, rpt_sales_dashboard
```



## Enforcement at the PR Gate



Naming conventions work when they are checked before resources exist. The PR gate should validate IaC names with the Azure Naming Tool, run the Bicep linter, and fail the build when a resource cannot be traced to the expected pattern.



> **Azure Naming Tool callout:** Use the Azure Naming Tool to standardize and automate name generation. Pair it with source-controlled naming rules so reviewers see the same result the pipeline enforces.



```text
Pull request opens
  → bicep build / bicep linter
  → naming-rule validation
  → storage and key-vault special-case checks
  → policy-as-code and deployment preview
  → merge only when names are compliant
```



This is the operational lesson behind the SPA. The game rewards correct matches immediately; the platform should do the same by catching drift in code review rather than after deployment.
