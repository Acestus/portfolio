---
title: "Platform Engineering Console — Self-Service Provisioning"
description: "The Microsoft Build 2026 refresh reframes the console as a self-service provisioning surface for Microsoft Fabric workspaces. The SPA demonstrates how an infrastructure team can offer safe paved roads: workspace…"
space: "Architecture & delivery"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/platform-console.html"
demo: "/platform.html"
---

> The Microsoft Build 2026 refresh reframes the console as a self-service provisioning surface for Microsoft Fabric workspaces. The SPA demonstrates how an infrastructure team can offer safe paved roads: workspace tiers, request intake, PIM-controlled production access, GitOps provisioning, backlog flow, and handoff documentation that let application and data teams move quickly without unmanaged portal click-ops.



- **Sandbox / Dev / Prod** — Workspace Tiers

- **PIM-Gated** — Production Access

- **GitOps** — Provisioned Workspaces

- **Self-Service** — Backlog Intake



Request→ Approve→ Provision→ Hand-Off→ Govern



## 1. The Three-Tier Workspace Model



The console models Fabric onboarding as a tiered service instead of a one-off administrator task. Sandbox, Dev, and Prod have different permissions, gates, and expectations. That split matters because the right answer for experimentation is not the right answer for production reporting.



Sandbox workspaces give engineers a safe place to learn, run notebooks, and use synthetic data. Dev workspaces integrate team work behind a repository. Prod workspaces are deployment targets that serve downstream consumers and should not be edited manually.



| Tier | Capabilities | Access Model | Promotion Gate |
| --- | --- | --- | --- |
| Sandbox | Personal experimentation, mock data, notebook learning, isolated repos | Contributor for the assigned engineer; no production sources | No promotion by default; useful work graduates by pull request |
| Dev | Shared integration, Git-connected workspace, lakehouses, pipelines, team testing | Team contributors with code review expectations | Pull request review, naming checks, successful pipeline run |
| Prod | Curated semantic models, reports, scheduled pipelines, downstream consumption | Read-mostly humans; automation deploys through scoped identity | Approval gate plus parameterized deployment from the repository |



> The scaling move is not adding more administrators. It is making each tier repeatable: same naming, same artifact layout, same gates, and the same handoff pattern for every onboarded team.



## 2. Self-Service Onboarding



Self-service starts with a structured request. A team describes the workload, expected source systems, row volume, refresh schedule, users, and downstream consumers. The platform team turns that request into a standard workspace plan rather than inventing a new topology each time.



The handoff is automated where possible and explicit where human judgment is needed. Intake captures enough detail to choose the domain name, environment set, Git repository, parameter files, security groups, and whether a sandbox is needed before the team touches production-bound assets.



| Step | Owner | Output |
| --- | --- | --- |
| Request | Application or data team | Workload summary, source systems, users, schedule, and compliance notes |
| Scope | Platform team | CAF-aligned domain name, tier decision, access groups, and backlog item |
| Automate | Platform automation | Workspace, lakehouses, repository structure, parameters, and deployment hooks |
| Hand-Off | Joint | Runbook page, support boundary, next steps, and validation checklist |



### Onboarding Contract



```text
request:
  workload: "<domain-or-product-name>"
  team: "<application-team-or-data-team>"
  sources: ["<source-system>"]
  refresh: "<hourly|daily|weekly>"
  environments: ["sandbox", "dev", "prod"]
  downstream_consumers: ["<report-or-api-consumer>"]
  documentation_owner: "<role-label>"
```



## 3. PIM-Gated Production Access



Production access is not a permanent entitlement in the model shown by the SPA. Users can be eligible for elevated roles while remaining inactive by default. When a deployment, incident, or operational task requires write access, the role is activated with a duration and justification.



This keeps least privilege operationally realistic. Reader assignments support normal observation. Contributor or administrator paths are time-bound and auditable. The console's PIM tab represents that distinction by showing role, scope, duration, and justification together.



| State | Meaning | Operational Use | Risk Control |
| --- | --- | --- | --- |
| Eligible | User can request activation but has no standing write access | Prepared for deployments and emergency response | Reduces attack surface between tasks |
| Active | Role is temporarily enabled after justification | Pipeline deploy, secret rotation, incident fix | Time-bound session with audit trail |
| Permanent Reader | Default observation role for most users | Validate reports, inspect run status, review outputs | Separates visibility from mutation |



> PIM is a guardrail, not a speed bump. The goal is to make safe access fast: pre-approved eligibility, short activation windows, clear justification, and no shared production identities.



## 4. Backlog Management



The provisioning console fits into a flow-based backlog model. Requests enter a queue, are pulled into active work when capacity exists, move to waiting when blocked by approvals or external dependencies, and finish as done only when the workspace and documentation are usable.



This model prevents platform intake from becoming an invisible pile of favors. Each request has a state, a constraint, and a next action. Waiting work does not consume the active work-in-progress slot, but it stays visible so follow-up does not rely on memory.



| Flow State | Provisioning Meaning | Typical Exit Condition |
| --- | --- | --- |
| `flow:queue` | Request is named, scored, and ready to be pulled | Capacity opens in the correct lane |
| `flow:active` | Workspace automation or access setup is underway | Artifacts are created or a blocker is found |
| `flow:waiting` | Blocked on approval, requester data, or external dependency | Missing input arrives or decision is made |
| `flow:done` | Workspace, access, runbook, and handoff are complete | Requester confirms usable landing zone |



### Queue Discipline



```text
Identified → Named & Scored → Queued → Active → Waiting or Done

Rule of thumb:
- Pull only when capacity exists.
- Keep one active item per lane.
- Move blocked work to waiting with an explicit next action.
- Finish by documenting how the team operates the workspace.
```



## 5. GitOps Provisioning



Workspace creation should be reproducible. The article refresh emphasizes that infrastructure as code creates the workspace and related scaffolding; the portal is the observation surface, not the source of truth. Git holds the desired state, and automation applies it consistently.



That pattern aligns with Microsoft Fabric Git integration and Azure deployment practice: code is reviewable, parameterized, and reversible. A failed experiment can be deleted and recreated. A production change can be tied to a pull request and commit SHA.



### Bicep Workspace Provisioning Snippet



```text
param workspaceName string = 'ws_<domain>_prd'
param capacityId string = '/subscriptions/<subscription-id>/resourceGroups/<rg-name>/providers/Microsoft.Fabric/capacities/<capacity-name>'
param adminGroupObjectId string = '<entra-group-object-id>'

resource fabricWorkspace 'Microsoft.Fabric/workspaces@2023-11-01' = {
  name: workspaceName
  location: 'westus2'
  properties: {
    capacityId: capacityId
    description: 'Production Fabric workspace for <domain> workload'
  }
  tags: {
    Environment: 'prd'
    Owner: 'platform-team'
    Provisioning: 'gitops'
  }
}

resource workspaceAdmin 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(fabricWorkspace.id, adminGroupObjectId, 'Fabric Workspace Admin')
  scope: fabricWorkspace
  properties: {
    principalId: adminGroupObjectId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '<role-definition-id>')
    principalType: 'Group'
  }
}
```



> This is the platform bottleneck escape hatch: requesters get self-service, but the platform team keeps control of the templates, gates, naming rules, and audit trail.



## 6. Handoff Documentation



Every provisioned workspace needs a runbook page. The page records what was created, why it exists, who owns it, how code is deployed, how access is requested, what data is synthetic versus production-bound, and where to go when a pipeline fails.



Handoff documentation is what turns an automation event into an operating model. Without it, the team has a workspace but not a platform product. With it, future support requests can start from a shared source of truth.



| Runbook Section | What It Captures | Why It Matters |
| --- | --- | --- |
| Workspace Inventory | Workspace names, tiers, lakehouses, pipelines, and repository paths | Prevents discovery work during incidents |
| Access Model | Reader groups, contributor groups, PIM roles, and approval path | Sets expectations before production support starts |
| Deployment Path | Branch, pull request gate, pipeline, environment parameters | Makes Git the operational source of truth |
| Support Boundary | What the platform team owns and what the workload team owns | Reduces handoff ambiguity and ticket ping-pong |



### References



- [Microsoft Fabric overview](https://learn.microsoft.com/fabric/get-started/microsoft-fabric-overview)

- [Medallion lakehouse architecture in OneLake](https://learn.microsoft.com/fabric/onelake/onelake-medallion-lakehouse-architecture)

- [Microsoft Fabric Git integration](https://learn.microsoft.com/fabric/cicd/git-integration/intro-to-git-integration)

- [Microsoft Fabric deployment pipelines](https://learn.microsoft.com/fabric/cicd/deployment-pipelines/intro-to-deployment-pipelines)

- [CAF resource naming guidance](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming)

- [Microsoft Entra Privileged Identity Management](https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-configure)
