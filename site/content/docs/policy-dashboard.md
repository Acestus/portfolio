---
title: "Azure Policy at Scale — Modify, Audit, Deny, Remediate"
description: "The Microsoft Build 2026 refresh frames the SPA as an Azure governance operations dashboard. It shows how a platform team manages 29 active assignments across modify, audit, deny, and DeployIfNotExists effects; uses…"
space: "Cloud & operations"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/policy-dashboard.html"
demo: "/policy.html"
---

> The Microsoft Build 2026 refresh frames the SPA as an Azure governance operations dashboard. It shows how a platform team manages 29 active assignments across modify, audit, deny, and DeployIfNotExists effects; uses non-blocking tag governance as the default pattern; runs remediation tasks to back-fill drift; and protects production changes through time-bound Privileged Identity Management rather than standing administrator access.



- **29** — Assignments

- **Modify-First** — Default Governance

- **Tags** — Cost & Owner Signals

- **Drift** — Remediation Queue



Define→ Assign→ Evaluate→ Remediate→ Audit



## 1. Effects: Audit vs Modify vs Deny vs DeployIfNotExists



Azure Policy effect choice is the architecture decision behind every governance rule. The SPA intentionally exposes effect next to scope and compliance because an enterprise policy program cannot be judged by assignment count alone. A safe rollout usually starts with audit, graduates routine metadata to modify, reserves deny for high-confidence guardrails, and uses DeployIfNotExists when missing platform plumbing must be deployed after evaluation.



This effect model mirrors the operating runbook mindset: identify the failing control, check identity and scope, remediate the resource or assignment, then document the outcome. Policy is not a static catalog. It is a closed-loop system that needs owners, evidence, escalation paths, and a clear line between non-blocking hygiene and hard safety boundaries.



| Effect | Behavior | Best Use Case | Operational Watchout |
| --- | --- | --- | --- |
| Audit | Records non-compliance without blocking create or update operations | Discovery, baseline measurement, pilot rollout, and standards that still need evidence | Must feed a review queue or it becomes background noise |
| Modify | Adds, replaces, or normalizes fields during a deployment or remediation task | Tags, inherited metadata, diagnostic defaults, and safe resource properties | Requires a managed identity and clear documentation of what was changed |
| Deny | Rejects non-compliant requests before deployment completes | Public exposure, disallowed locations, weak encryption, and other hard guardrails | Can block delivery if exemptions and migration windows are not ready |
| DeployIfNotExists | Checks for a related resource or setting and deploys it when missing | Monitoring agents, diagnostic settings, flow logs, and required platform attachments | More moving parts: assignment identity, role grants, templates, and remediation status |



### Assignment Categories Shown in the Dashboard



| Category | Sanitized Count | Primary Effect | Example Control |
| --- | --- | --- | --- |
| Tagging and ownership | 8 | Modify | Apply CostCenter, Environment, Owner, and Project tags from subscription or resource group context |
| Security baseline | 7 | Deny / Audit | Require secure transfer, TLS posture, soft delete, and restricted public access |
| Monitoring and diagnostics | 6 | DeployIfNotExists | Deploy diagnostic settings, agents, or flow logs where they are missing |
| Network governance | 4 | Audit / Deny | Flag missing private endpoint patterns or prevent unsafe ingress defaults |
| Cost and platform standards | 4 | Audit / Modify | Check CAF naming, required metadata, and environment classification |



## 2. The Tagging Governance Pattern (modify-effect, non-blocking)



The most important design choice in the refreshed article is the modify-first tagging pattern. Required tags are governance inputs: they connect resources to owners, budget centers, environments, projects, and incident routing. Blocking every deployment that misses a tag creates friction; modifying safe metadata in-flight makes the paved road easier to use while still improving reporting quality.



The dashboard treats tag governance as a platform service. A policy assignment can inherit a default from the resource group, normalize casing, or add a placeholder value that routes back to a remediation queue. That keeps delivery moving, but it also makes drift visible. The owner still needs to clean up inaccurate values; policy simply prevents missing metadata from becoming invisible technical debt.



```text
// Modify-effect policy rule sketch for required ownership metadata
{
  "if": {
    "allOf": [
      { "field": "type", "notEquals": "Microsoft.Resources/subscriptions/resourceGroups" },
      { "field": "tags['CostCenter']", "exists": false }
    ]
  },
  "then": {
    "effect": "modify",
    "details": {
      "roleDefinitionIds": [
        "/providers/Microsoft.Authorization/roleDefinitions/<tag-contributor-role-id>"
      ],
      "operations": [
        {
          "operation": "add",
          "field": "tags['CostCenter']",
          "value": "[resourceGroup().tags['CostCenter']]"
        }
      ]
    }
  }
}
```



> The public pattern is the point: inherit safe metadata when possible, avoid logging sensitive values, and use placeholders for tenant IDs, subscription IDs, role definition IDs, and assignment identifiers in external documentation.



## 3. Policy as Code (Bicep policy definitions, deployment via stacks)



At scale, a policy definition should not be a portal-only artifact. The article positions policy as code: definitions, initiatives, assignments, parameters, and managed identities are reviewed, deployed, and versioned through infrastructure stacks. That gives policy changes the same discipline as any other production control: pull request review, environment parameters, repeatable deployment, and rollback history.



Bicep is a natural fit for the definition and assignment layer. A stack can publish a custom policy definition, assign it at a management group or subscription scope, grant the assignment identity only the permissions needed for remediation, and expose environment-specific parameters without embedding tenant-specific IDs in the source. That makes the dashboard's numbers reproducible without leaking implementation details.



### Policy-as-Code Deployment Shape



```text
targetScope = 'managementGroup'

param assignmentScope string = '/providers/Microsoft.Management/managementGroups/<mg-name>'
param requiredTags array = [ 'CostCenter', 'Environment', 'Owner', 'Project' ]

resource tagPolicy 'Microsoft.Authorization/policyDefinitions@2023-04-01' = {
  name: 'modify-required-tags'
  properties: {
    policyType: 'Custom'
    mode: 'Indexed'
    displayName: 'Modify required resource tags'
    metadata: { category: 'Tag Governance' }
    parameters: { requiredTags: { type: 'Array' } }
    policyRule: loadJsonContent('policyRules/modify-required-tags.json')
  }
}

resource assignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'tag-governance-modify'
  scope: managementGroup('<mg-name>')
  identity: { type: 'SystemAssigned' }
  properties: {
    displayName: 'Tag governance — modify required tags'
    policyDefinitionId: tagPolicy.id
    parameters: { requiredTags: { value: requiredTags } }
    enforcementMode: 'Default'
  }
}
```



Deployment stacks add lifecycle clarity. They make it easier to understand which environment owns the current assignment, whether a change is idempotent, and how to remove a deprecated assignment without leaving orphaned definitions or unmanaged role grants behind.



## 4. Exemptions: When and Why (request, approve, time-box)



Exemptions are not exceptions to governance; they are governed records that explain why a resource or scope is temporarily outside the standard. A healthy exemption flow starts with a request, captures business justification, assigns an approver role, records an expiration date, and keeps the remediation owner visible. The article uses role labels instead of named owners so the public version demonstrates the pattern without exposing internal accountability data.



Use exemptions when a control is correct but immediate enforcement would create unacceptable business risk: legacy migration windows, vendor constraints, emergency incident response, or platform dependencies that are being remediated in phases. Avoid permanent exemptions. If an exemption never expires, the policy is either too broad, the exception is actually a standard, or the owning team needs a migration plan.



| Exemption Scenario | Requester | Approver | Time Box | Evidence Required |
| --- | --- | --- | --- | --- |
| Legacy workload migration | Application owner role | Platform governance role | 30–90 days | Migration ticket, target design, and review date |
| Emergency incident response | Incident commander role | Security operations role | Hours to days | Incident number, impact statement, and post-incident cleanup notes |
| Vendor limitation | Service owner role | Architecture review role | One renewal cycle | Vendor documentation and compensating control |
| Staged deny rollout | Subscription owner role | Cloud platform role | Until rollout milestone | Audit results, communication plan, and enforcement date |



## 5. Remediation Tasks (back-filling non-compliant resources)



Modify and DeployIfNotExists policies only change new or updated resources automatically. Existing resources need remediation tasks to back-fill the estate. That is why the SPA's compliance score should be read as an operations queue: identify the non-compliant set, verify the assignment identity has the required role, run remediation in a controlled scope, and monitor completion before escalating residual failures.



The runbook pattern applies here too. Start with the failing control, check permissions, confirm the target scope, execute the repair, then document what changed. If a remediation task fails, common causes include missing managed identity permissions, resources locked by deployment policy, unsupported resource types, or stale exemptions that need review.



### Remediation Control Loop



```text
Evaluate    → query compliance state by assignment and scope
Authorize   → verify assignment identity has the minimum remediation role
Remediate   → create remediation task for the targeted policy assignment
Monitor     → track succeeded, failed, and skipped resources
Document    → record outcome, residual risk, and next review date
```



For public examples, use generic assignment names such as `tag-governance-modify`, placeholder scopes such as `/subscriptions/<subscription-id>`, and role labels instead of named exemption owners. Microsoft Learn URLs can remain exact because they are public documentation references.



## 6. JIT Access via PIM (eligible vs active assignments, time-bound elevation)



Policy operations sometimes require elevated access: creating a remediation task, changing an assignment, or approving a short-lived exemption. The refreshed article connects those tasks to just-in-time access through Microsoft Entra Privileged Identity Management. Eligible assignment means a user or group can request access; active assignment means the access is currently usable and will expire automatically after the approved duration.



The public pattern is intentionally generic. A production operations group is eligible for the minimum role needed, activates through My Access or the Azure PIM portal, enters a ticket-backed justification, waits for propagation, completes the operation, and lets access expire. The same pattern works for emergency changes and planned maintenance: no standing human access, time-bound elevation, and a written trail of why the access was used.



| PIM State | Meaning | Used For | Governance Requirement |
| --- | --- | --- | --- |
| Eligible | The role can be activated, but it is not currently granting access | Prepared operators, break-glass groups, and approval-based access packages | Membership review, MFA, and clear activation policy |
| Active | The role is currently effective for a bounded duration | Policy assignment updates, remediation tasks, incident repair, and verification | Ticket justification, shortest practical duration, and activity logging |
| Expired | The activation window ended automatically | Normal post-change state | No manual cleanup required unless early deactivation is needed |
| Denied or missing | The principal has no eligible assignment or approval failed | Troubleshooting access requests | Route to the access owner role; do not bypass PIM with standing permissions |



> The article deliberately avoids tenant IDs, group object IDs, named users, and workspace identifiers. Use placeholders like `<tenant-id>`, `<group-id>`, `<workspace-id>`, and `<ticket-id>` when documenting the public Build 2026 pattern.
