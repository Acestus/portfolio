---
title: "Infrastructure as Code — AVM, OIDC, and Deployment Stacks"
description: "Microsoft Build 2026 refresh of the IaC pipeline behind the SPA: a trunk-based GitHub Actions path where Bicep composes Azure Verified Modules, authenticates through OIDC federated identity, deploys with Azure…"
space: "Architecture & delivery"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/iac-pipeline.html"
demo: "/iac.html"
---

> Microsoft Build 2026 refresh of the IaC pipeline behind the SPA: a trunk-based GitHub Actions path where Bicep composes Azure Verified Modules, authenticates through OIDC federated identity, deploys with Azure Deployment Stacks, and continuously checks for drift. The pattern treats the repository as desired state, the pipeline as the only production writer, and Azure as the runtime source of truth that must be reconciled back to code.



- **AVM-First** — Use verified public registry modules before custom resources

- **OIDC** — Federated GitHub-to-Azure authentication with no static secrets

- **Stacks** — Lifecycle-managed deployments with explicit ownership

- **Trunk** — Short-lived feature branches, PR gates, main as production



Author→ PR Gate→ Plan→ Apply→ Drift Check



## 1. Azure Verified Modules (AVM) as the Building Blocks



The platform team standardizes Azure infrastructure on [Bicep modules](https://learn.microsoft.com/azure/azure-resource-manager/bicep/modules) from the [public module registry](https://learn.microsoft.com/azure/azure-resource-manager/bicep/modules#public-module-registry), especially Azure Verified Modules. AVM provides reviewed module contracts for common Azure resource types, so stack authors compose resource groups, identities, storage, networking, and platform services instead of hand-writing every ARM resource block.



This does not remove engineering judgment. Teams still decide naming, RBAC boundaries, tags, diagnostics, network posture, and lifecycle scope. AVM simply moves the low-level resource shape to a maintained baseline and lets the local stack focus on the platform pattern.



```text
targetScope = 'resourceGroup'

param project string = 'skpapp'
param environment string = 'prd'
param location string = 'westus2'
param regionCode string = 'usw2'

var storageName = 'st${project}${environment}${regionCode}001'
var keyVaultName = 'kv-${project}-${environment}-${regionCode}-001'
var controlIdentityName = 'umi-${project}-${environment}-${regionCode}-ctl'

module controlIdentity 'br/public:avm/res/managed-identity/user-assigned-identity:0.4.0' = {
  name: 'umi-control'
  params: {
    name: controlIdentityName
    location: location
  }
}

module storage 'br/public:avm/res/storage/storage-account:0.25.0' = {
  name: 'storage'
  params: {
    name: storageName
    location: location
    skuName: 'Standard_LRS'
    publicNetworkAccess: 'Disabled'
  }
}

module keyVault 'br/public:avm/res/key-vault/vault:0.12.1' = {
  name: 'key-vault'
  params: {
    name: keyVaultName
    location: location
    enablePurgeProtection: true
  }
}
```



> **Build 2026 takeaway:** AVM-first is a governance accelerator. It makes reusable infrastructure boring in the best way: reviewed module inputs, consistent outputs, and less custom code to audit.



## 2. The Dual UMI Pattern (control-plane vs data-plane managed identities)



The SPA calls out two suffixes that matter: `ctl` and `dat`. A control-plane user-assigned managed identity deploys and updates infrastructure. A separate data-plane user-assigned managed identity is granted runtime access to Key Vault, Storage, Event Hubs, databases, and other workload services.



That separation prevents the deployment identity from becoming a universal runtime credential. It also makes reviews easier: control-plane RBAC answers “what can create or modify resources,” while data-plane RBAC answers “what can read or write workload data.”



| Identity | CAF Name | Primary Scope | Typical Permissions |
| --- | --- | --- | --- |
| Control-plane UMI | `umi-{project}-{env}-{region}-ctl` | Resource group or deployment stack | Deploy Bicep, assign managed identity to resources, configure diagnostics |
| Data-plane UMI | `umi-{project}-{env}-{region}-dat` | Service-specific data plane | Read Key Vault secrets, write blobs, publish Event Hub messages |
| Human access | Time-bound PIM role | Emergency or break-glass only | Minimum permissions, documented follow-up PR required |



## 3. OIDC Federated Identity (no long-lived secrets in GitHub Actions)



GitHub Actions authenticates to Azure with [OpenID Connect federation](https://learn.microsoft.com/azure/developer/github/connect-from-azure). The job requests a short-lived token, Microsoft Entra ID validates the federated credential for the repository and environment, and `azure/login` receives an Azure access token. No client secret is stored in GitHub, copied into a runner, or rotated by hand.



The variables in this excerpt are non-secret identifiers: client ID, tenant ID, and subscription ID. Real tenant IDs and subscriptions are intentionally represented here with Microsoft Learn-style placeholders.



```text
name: Deploy Bicep Stack

on:
  workflow_dispatch:
  pull_request:
    paths:
      - 'stacks-bicep/**'
      - '.github/workflows/deploy-bicep-stack.yaml'

permissions:
  id-token: write
  contents: read
  pull-requests: write

jobs:
  plan:
    runs-on: ubuntu-latest
    environment: Production
    steps:
      - uses: actions/checkout@v4

      - name: Azure login with OIDC
        uses: azure/login@v2
        with:
          client-id: ${{ vars.AZURE_CLIENT_ID }}
          tenant-id: ${{ vars.AZURE_TENANT_ID }} # 00000000-0000-0000-0000-000000000000
          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }} # Production / Connectivity / Identity

      - name: What-if
        run: |
          az deployment group what-if \
            --resource-group rg-skpapp-prd-usw2-001 \
            --template-file stacks-bicep/skpapp/main.bicep \
            --parameters stacks-bicep/skpapp/prd/main.prd.bicepparam
```



## 4. Deployment Stacks (vs traditional ARM deployments; deny-settings)



Traditional ARM or Bicep deployments apply a template to a scope, but lifecycle ownership can be ambiguous after the deployment finishes. [Azure Deployment Stacks](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deployment-stacks) add a management layer around that deployment: Azure knows which resources belong to the stack, what should happen when resources disappear from the template, and whether unmanaged changes should be denied.



Deny settings are the sharp edge. They can block deletes or updates outside the stack, which makes production safer when used deliberately. The design goal is not to make emergencies impossible; it is to make out-of-band changes visible, time-bound, and followed by a PR so desired state catches up to reality.



| Capability | Traditional Deployment | Deployment Stack |
| --- | --- | --- |
| Resource ownership | Implicit in deployment history | Explicit stack membership |
| Delete behavior | Resources can remain orphaned | Delete or detach behavior is configured |
| Drift controls | Detected by what-if or external checks | Can combine what-if with deny settings |
| Production guardrails | Usually policy, RBAC, and process | Policy, RBAC, process, plus stack-level deny settings |



```text
az stack group create \
  --name stk-skpapp-prd-usw2-001 \
  --resource-group rg-skpapp-prd-usw2-001 \
  --template-file stacks-bicep/skpapp/main.bicep \
  --parameters stacks-bicep/skpapp/prd/main.prd.bicepparam \
  --deny-settings-mode denyDelete \
  --action-on-unmanage detachAll \
  --yes
```



## 5. Trunk-Based CI/CD (main = production; feature branches via PR)



The delivery model is trunk-based. Engineers create short-lived feature branches, open pull requests, run validation, and merge through protected gates. The main branch represents production-ready desired state. If a bad change lands, the rollback path is a git revert rather than a hand-built undo script.



This is especially important for infrastructure. Portal edits, local `az` commands, and workspace clickops all create configuration drift. The governance pattern is simple: exploration can happen in dev, but production writes come from CI/CD using federated identity.



| Stage | Signal | Purpose |
| --- | --- | --- |
| Author | Bicep, parameters, README, and tests changed together | Keep infrastructure, documentation, and validation aligned |
| PR Gate | Build, lint, what-if, and review | Catch syntax, policy, and blast-radius issues before merge |
| Plan | `az deployment group what-if` | Show create, modify, delete, and no-change effects |
| Apply | `az stack group create` | Reconcile Azure to the approved desired state |
| Drift Check | Scheduled what-if or stack audit | Find manual change before it becomes an incident |



## 6. Modules, Stacks, and Composition (how main.bicep references AVM)



A stack folder contains the composition root: `main.bicep`, environment-specific `main.{env}.bicepparam` files, and optional dashboards or runbooks. The root Bicep file should read like a platform bill of materials. It wires AVM modules together, passes shared tags and naming variables, and exposes only the outputs that downstream workloads actually need.



The pattern keeps local modules rare. If a resource type exists in AVM, use the public registry reference first. If a custom wrapper is necessary, it should encode a platform standard that AVM does not cover, not repackage a single resource for convenience.



### CAF Naming Table



| Resource | Prefix | CAF Pattern | Sanitized Example |
| --- | --- | --- | --- |
| Resource group | `rg-` | `rg-{project}-{env}-{region}-{instance}` | `rg-skpapp-prd-usw2-001` |
| Function App | `func-` | `func-{project}-{env}-{region}-{instance}` | `func-skpapp-prd-usw2-001` |
| Key Vault | `kv-` | `kv-{project}-{env}-{region}-{instance}` | `kv-skpapp-prd-usw2-001` |
| Managed identity | `umi-` | `umi-{project}-{env}-{region}-{purpose}` | `umi-skpapp-prd-usw2-ctl` |
| Storage account | `st` | `st{project}{env}{region}{instance}` | `stskpappprdusw2001` |
| Virtual network | `vnet-` | `vnet-{project}-{env}-{region}-{instance}` | `vnet-skpapp-prd-usw2-001` |
| Address space | n/a | Documented in params | `10.0.0.0/16` |



> **Sanitized operating model:** the platform team promotes the same stack pattern across Production, Connectivity, and Identity subscriptions. Incident references use `INFRA-###`, tenant IDs use Microsoft documentation placeholders, and network examples use `10.0.0.0/16`.
