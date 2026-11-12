# Portfolio continuous delivery

Build once, test the result, and promote the same retained bytes. Each transition records evidence tied to its archive, source commit, producer run, and run attempt. This follows the deployment-pipeline approach: fast feedback and reproducible releases with explicit production decisions.

## Workflows

| Workflow | Trigger and result |
| --- | --- |
| Test-PullRequest | PR changes qualify and package the current PR head without Azure credentials. |
| Deploy-PullRequest | Manual deployment of a successful current same-repository PR candidate to `pr-N`; trusted PR-close cleanup removes that preview. |
| Publish-Development | Main pushes qualify once, retain the candidate, deploy development, and check the live release. |
| Test-Development | Automatically run read-only live checks in a separate Actions run after Publish-Development succeeds; also available manually. |
| Promote-Staging | Manually deploy the retained candidate with successful development evidence. |
| Promote-Production | Manually deploy that candidate with successful staging evidence. |
| Test-Production | Manually repeat read-only live checks against a recorded production deployment. |
| Restore-Production | Manually redeploy a retained candidate with evidence of its earlier successful production deployment. |
| Update-Infrastructure | Manually apply an explicitly configured infrastructure template at a reviewed immutable commit. |

`_Qualify` and `_Deliver` are reusable implementation workflows. Application delivery is serialized through `swa-portfolio-delivery`, including cleanup, checks, and infrastructure. GitHub concurrency does not guarantee FIFO ordering.

## One SWA

Repository variables `SWA_NAME` and `SWA_RESOURCE_GROUP` default to `swa-portfolio-dev-scus-001` and `rg-portfolio-dev`. Keep these shared across environments. Development and staging use SWA named environments `development` and `staging`; PRs use `pr-N`; production uses the default environment. Preview availability is subject to the existing SWA plan and quota. This pipeline does not provision extra SWAs.

Configure GitHub environments `dev`, `stg`, `prd`, and `pull-request`. Apply required reviewers and deployment restrictions to staging and production as appropriate. Each needs Azure OIDC variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`, with an Azure federated credential matching its GitHub environment. The identity needs access to the existing SWA; the infrastructure workflow also needs rights to deploy its selected resource group.

Infrastructure additionally requires `IAC_TEMPLATE` and optionally `IAC_PARAMETERS_FILE`, relative to `Acestus/infra`, plus `RESOURCE_GROUP` (default `rg-portfolio-dev`). Set `IAC_READ_TOKEN` if the default GitHub token cannot read that private repository. No template path is assumed: verify that the reviewed template targets the intended existing resources before selecting it. `iac_commit` must be its full 40-character commit SHA. The input does not select a mutable branch.

## Publish and promote

1. Merge a qualified change to main. `Publish-Development` builds, runs browser checks, and uploads `portfolio-site-attempt-N` containing `site.tar`, its SHA-256, and release inventories.
   Successful publication triggers a separate `Test-Development` workflow run, which resolves the exact retained candidate from that publish run and repeats live checks. Failed publications do not trigger tests. Deployment verification remains part of publication.
2. Record that producer run ID and the archive SHA-256 from its output. Use those as `source_run_id` and `archive_sha256` when promoting to staging.
3. Promote production with the same producer and digest, and supply the successful staging run as `evidence_run_id`.
4. For a restore, select a still-retained original candidate and a successful earlier production promotion/restore run for those exact bytes. No new build occurs.

Artifacts expire: main candidates are retained for 90 days, PR candidates for 7 days, and intermediate verification artifacts for 7 days. Retention is not an indefinite backup. Rerunning a producer creates a new attempt; use its matching candidate and receipt. A stale attempt cannot substitute for the latest producer identity.

Manual PR deployment also requires `pr_number`; it rejects forks, closed PRs, and candidates whose commit differs from the current PR head. Close cleanup uses trusted workflow code and a validated numeric preview name without checking out or running PR code.

## Checks and limits

Before Azure login, delivery checks workflow provenance, source identity, clean release metadata, pinned acceptance-contract identity, archive SHA-256, canonical safe archive paths, complete file hashes and sizes, and required prior-stage receipts. Azure authentication occurs only after these checks. The deployment action uploads the verified output without rebuilding it.

After deployment, read-only checks compare live release metadata, resume, portfolio, articles, and PDF bytes with the candidate, and require private/unknown paths to remain unavailable. Failed live checks prevent a success receipt. Configure GitHub environment approval rules before the first promotion; YAML cannot install those protection rules.

These source changes do not push commits, configure GitHub/Azure settings, deploy, bind custom domains, or change DNS. Verify named-environment quota, existing domain bindings, and independent acceptance requirements before the first production cutover.
