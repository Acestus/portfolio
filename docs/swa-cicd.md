# Portfolio continuous delivery

Build once, test the result, and automatically promote the same retained bytes through development, staging, and production. Each transition records evidence tied to its archive, source commit, producer run, and run attempt.

## Workflows

| Workflow | Trigger and result |
| --- | --- |
| 01 Pre-CI-PullRequest | PR changes qualify and package the current PR head without Azure credentials. |
| 02 Publish-Development | Main pushes qualify once, retain the candidate, and deploy and test it sequentially in development, staging, and production. |
| 03 Post-CD-Development | Repeat read-only development checks after the automatic pipeline succeeds; also available manually. |
| 04 Promote-Staging | Manually redeploy a retained candidate with successful development evidence. |
| 05 Promote-Production | Manually promote a retained candidate with successful staging evidence. |
| 06 Post-CD-Production | Manually repeat read-only live checks against a recorded production deployment. |
| 80 Restore-Production | Manually redeploy a retained candidate with evidence of its earlier successful production deployment. |
| 81 Update-Infrastructure | Manually apply an explicitly configured infrastructure template at a reviewed immutable commit. |

`90 Reusable Hugo/Bun commit stage` (`_Qualify.yaml`) and `91 Reusable verified delivery` (`_Deliver.yaml`) are reusable implementation workflows. The numeric display-name prefixes order the Actions sidebar; triggers and dependencies control execution. Workflow filenames remain stable for callers and provenance checks. Application delivery is serialized through `swa-portfolio-delivery`, including cleanup, checks, and infrastructure. GitHub concurrency does not guarantee FIFO ordering.

## One SWA

Repository variables `SWA_NAME` and `SWA_RESOURCE_GROUP` default to `swa-portfolio-dev-scus-001` and `rg-portfolio-dev`. Keep these shared across environments. Development and staging use SWA named environments `development` and `staging`; PRs use `pr-N`; production uses the default environment. Preview availability is subject to the existing SWA plan and quota. This pipeline does not provision extra SWAs.

Configure GitHub environments `dev`, `stg`, `prd`, and `pull-request`. Automatic promotion requires no required-reviewer or other manual approval rules on `stg` and `prd`; environment restrictions may still block deployments. Each needs Azure OIDC variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`, with an Azure federated credential matching its GitHub environment. The identity needs access to the existing SWA; the infrastructure workflow also needs rights to deploy its selected resource group.

Infrastructure additionally requires `IAC_TEMPLATE` and optionally `IAC_PARAMETERS_FILE`, relative to `Acestus/infra`, plus `RESOURCE_GROUP` (default `rg-portfolio-dev`). Set `IAC_READ_TOKEN` if the default GitHub token cannot read that private repository. No template path is assumed: verify that the reviewed template targets the intended existing resources before selecting it. `iac_commit` must be its full 40-character commit SHA. The input does not select a mutable branch.

## Publish and promote

1. Merge a qualified change to main. `02 Publish-Development` builds and tests once, then deploys the retained candidate to development, staging, and production in sequence. Each deployment must pass live checks and record a receipt before the next starts. A failed job stops promotion.
2. Successful automatic delivery triggers `03 Post-CD-Development` to repeat the development live checks.
3. Manual promotion and restore remain available for retained releases. For a restore, select a still-retained original candidate and a successful earlier production promotion/restore run for those exact bytes. No new build occurs.

Artifacts expire: main candidates are retained for 90 days, PR candidates for 7 days, and intermediate verification artifacts for 7 days. Retention is not an indefinite backup. Rerunning a producer creates a new attempt; use its matching candidate and receipt. A stale attempt cannot substitute for the latest producer identity.

Manual PR deployment also requires `pr_number`; it rejects forks, closed PRs, and candidates whose commit differs from the current PR head. Close cleanup uses trusted workflow code and a validated numeric preview name without checking out or running PR code.

## Checks and limits

Before Azure login, delivery checks workflow provenance, source identity, clean release metadata, pinned acceptance-contract identity, archive SHA-256, canonical safe archive paths, complete file hashes and sizes, and required prior-stage receipts. Azure authentication occurs only after these checks. The deployment action uploads the verified output without rebuilding it.

After deployment, read-only checks compare live release metadata, resume, portfolio, articles, and PDF bytes with the candidate, and require private/unknown paths to remain unavailable. Failed live checks prevent a success receipt. GitHub environment protection rules are configured outside these workflows.

These source changes do not push commits, configure GitHub/Azure settings, deploy, bind custom domains, or change DNS. Verify named-environment quota, existing domain bindings, and independent acceptance requirements before the first production cutover.
