# How I would build FedRAMP controls into Azure delivery

I would use Bicep to define the Azure environment, Azure Policy to measure and enforce its guardrails, and GitHub Actions to record how changes move from pull request to production. For every control we implement, I want to be able to answer three questions: What did we require? What is running now? Where is the evidence that it works?

This is a proposed operating model. I use FedRAMP Rev5 Moderate as a working example. Before adopting it, I would confirm the applicable baseline, path, agency requirements, and deadlines with the system owner and assessment team. Azure Policy results support an assessment. FedRAMP certification of a cloud offering and an agency’s authorization decision have their own scope and evidence requirements. [FedRAMP Rev5 packages](https://www.fedramp.gov/2026/agencies/use/packages/rev5/) · [Rev5 transition deadlines](https://www.fedramp.gov/2026/providers/updating/deadlines/rev5/)

## 1. Define the boundary and who owns each control

I would start by documenting the subscriptions, services, regions, identities, data flows, and external dependencies that support the system. I would review the repository, runners, deployment identities, and evidence store as part of that exercise because they can affect the production environment or handle its data. For each Azure service, I would verify the relevant offering, cloud, service, and region against Microsoft’s published scope and the provider’s responsibility matrix. [Microsoft FedRAMP offering](https://learn.microsoft.com/en-us/compliance/regulatory/offering-fedramp) · [Azure services in audit scope](https://learn.microsoft.com/en-us/azure/azure-government/compliance/azure-services-in-fedramp-auditscope)

I would keep a control matrix alongside the code. Each row would identify the control and requirement, applicable scope, inherited or shared responsibilities, implementation owner, automated and manual evidence, and review cadence. I would use Microsoft’s FedRAMP Moderate initiative to start the mapping and review each match against the system’s actual requirements. Some controls need evidence from access reviews, incident exercises, recovery tests, or other operating procedures. [Azure Policy FedRAMP Moderate mapping](https://learn.microsoft.com/en-us/azure/governance/policy/samples/fedramp-moderate)

## 2. Put desired state and guardrails in Git

| Responsibility | How I would implement it |
| --- | --- |
| Infrastructure as code | Use Bicep modules to provision secure defaults, including approved logging destinations, network settings, and identities. Use the same reviewed modules in development, staging, and production, with environment parameters in source control. |
| Policy as code | Version definitions, initiatives, assignments, parameters, and exemptions. Start with built-ins where they fit and write custom definitions for gaps. Assign at the narrowest practical scope, using a management group for rules shared across its subscriptions. Record built-in IDs and versions where supported. |
| Delivery | Use short-lived branches and merge through reviewed pull requests. Use federated Azure identities with separate permissions for policy administration, workload deployment, remediation, and evidence collection. Keep production approval and deployment records with the release. |

In a pull request, I would run Bicep build and lint, validate the deployment inputs, and review the Azure what-if result. Then I would deploy known-good and deliberately misconfigured resources into a disposable scope. I would verify that the former can deploy and that the latter produce the expected finding or denial. For existing resources, I would trigger or wait for a policy evaluation and confirm results before promoting. I would start with audit or non-enforcing assignments to understand impact, then enable enforcement in a pilot scope before broadening it. [Azure Policy as code](https://learn.microsoft.com/azure/governance/policy/concepts/policy-as-code) · [Safe policy deployment](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/policy-safe-deployment-practices)

## 3. Remediate drift and verify the fix

I would use `Audit` or `AuditIfNotExists` to surface findings, `Deny` to block new or updated resources that violate a tested rule, and `Modify` or `DeployIfNotExists` where Azure Policy can safely correct a property or deploy a related resource. For existing resources, I would explicitly run a scoped remediation task for the applicable `Modify` or `DeployIfNotExists` policy. The assignment’s managed identity would receive only the roles it needs at the relevant scopes. For changes with operational impact, such as disabling an existing public endpoint, I would use a reviewed Bicep change and plan the cutover with the workload owner. [Azure Policy remediation](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/remediate-resources) · [Policy compliance states](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/compliance-states)

### Example: Missing diagnostic settings

1. The Bicep module configures diagnostic settings to send the required log categories to the approved workspace. A `DeployIfNotExists` assignment checks the relevant resource types and destination within the system boundary.
2. Policy finds an existing resource without the expected settings. I review the finding and target scope, then run a remediation task on a pilot resource using the assignment’s managed identity.
3. I wait for policy reevaluation and query the destination for a known event from that resource. I record the policy result and the observed event. The assignment shows the setting exists. The event shows that the reporting path works.
4. If the resource came from an older template, I update the Bicep module or parameters so the next release preserves the fix. I retain the finding, task result, and verification evidence with the linked change record.

## 4. Keep exceptions and evidence reviewable

- **Exceptions.** Record the affected resources and policy references, reason, compensating control, owner, approval, and expiry. Review exemptions before expiry. Track unresolved weaknesses in the Plan of Action and Milestones (POA&M) when the applicable process requires it. Keep the Azure exemption and the risk decision linked so both can be reviewed.
- **Evidence.** For each material change, retain the commit, approved pull request, deployment and policy assignment IDs, scope, and timestamped policy results. For remediation, retain the original finding, task outcome, reevaluation, and a functional check where applicable. Store evidence in an approved location with access controls and retention aligned to the monitoring plan.
- **Continuous monitoring.** Reconcile policy results against the in-scope inventory. Investigate stale evaluations, failed remediations, out-of-scope resources that should be covered, and exemptions nearing expiry. Keep the System Security Plan and control matrix aligned with what is deployed. Review boundary and control changes through the applicable significant change process. [FedRAMP Continuous Monitoring Playbook](https://www.fedramp.gov/resources/documents/Continuous_Monitoring_Playbook.pdf) · [FedRAMP significant change notification](https://www.fedramp.gov/2026/providers/rev5/rules/significant-change-notification/)

I would start with one control and one resource type. The first milestone is a complete record from the requirement to the reviewed change, a detected failure, a verified fix, and evidence that someone else can reproduce. Then I would reuse that workflow for the rest of the baseline.
