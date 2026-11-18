---
title: "The Portfolio Delivery Pipeline: GitHub Actions, Evidence, and Azure Static Web Apps"
date: 2026-11-18
draft: false
tags: ["github-actions", "cicd", "azure-static-web-apps", "oidc", "release-engineering"]
summary: "How the acestus.com portfolio qualifies a change once, retains the exact tested bytes, and promotes that release through Development, Staging, and Production."
---

A portfolio site is easy to deploy badly. A push can compile, upload whatever happens to be in the workspace, and leave the operator guessing which commit actually reached Azure. The Acestus portfolio takes the opposite approach: qualify a precise source revision, package the tested site once, identify that archive with a SHA-256 digest, and carry the same bytes through the release stages.

The repository's GitHub Actions are organized as a small delivery system rather than one oversized deployment script. Public pull requests receive automated qualification. Changes merged to `main` publish to Development. Staging and Production are deliberate, manually selected promotions that require evidence from the earlier stage.

## The workflow map

```text
Pull request
  └─ Pre-CI-PR
       └─ _Qualify (preview build, tests, retained candidate)

Push to main
  └─ Publish-Development
       ├─ _Qualify (build, browser checks, site.tar, SHA-256)
       └─ _Deliver (verify → deploy Development → live checks → receipt)
             └─ Post-CD-Dev (read-only checks in a separate run)

Manual promotion
  ├─ Promote-Staging  → _Deliver (verify Development evidence → deploy Staging)
  ├─ Promote-Production → _Deliver (verify Staging evidence → deploy Production)
  ├─ Post-CD-Prod  → _Deliver (repeat read-only Production checks)
  └─ Restore-Production → _Deliver (redeploy a retained, previously successful release)
```

`_Qualify.yaml` and `_Deliver.yaml` are reusable workflows. The caller workflows define when an operation is allowed and pass a narrow contract: the delivery stage, operation, source run, archive digest, and—where required—evidence from a previous stage.

## Qualification is the build boundary

The reusable qualification workflow checks the repository before Azure authentication is involved. It restores the locked .NET projects, installs the pinned Bun and Hugo versions, runs release-policy tests, executes the browser-side tests, builds the Hugo/Bun site, serves the generated site locally, and runs the Playwright-based portfolio tests.

It then packages the candidate as `artifacts/site.tar` and calculates its SHA-256 digest. The archive, digest, release metadata, and file inventory are uploaded as one retained candidate. The workflow does not ask a later deployment job to rebuild the site.

That distinction matters. A deployment should publish the bytes that were tested—not a new build produced later with a potentially different toolchain, dependency cache, timestamp, or source state.

| Qualification output | Why it matters |
| --- | --- |
| `site.tar` | The exact site bytes that downstream stages may deploy |
| SHA-256 digest | A compact identity for the candidate archive |
| Release metadata | Source, workflow, and package provenance |
| File inventory and hashes | Detection of missing, extra, or modified files |
| Test evidence | Results from local serving, browser checks, and release-policy tests |

## Pull requests: test, do not publish

`Pre-CI-PR` runs for opened, synchronized, and reopened pull requests targeting `main`. It calls `_Qualify` with `preview: true`, which checks out the pull request head revision and exercises the candidate without Azure credentials.

This is intentionally a trust boundary. Pull-request code is untrusted input, so the PR workflow builds and tests it, but it does not receive cloud deployment credentials. The candidate artifact is short-lived—useful for qualification, not an unreviewed production release.

The repository previously had a `Deploy-PullRequest` workflow for deploying PR candidates to named Static Web App environments such as `pr-<number>`. That workflow has been removed. Pull requests now qualify the proposed change; `Publish-Development` is the deployment path after the change reaches `main`.

## Main: publish Development

`Publish-Development` runs on pushes to `main`:

1. `_Qualify` builds and tests the commit.
2. The caller passes the resulting `source_run_id` and `archive_sha256` to `_Deliver`.
3. `_Deliver` verifies the producer run, archive identity, release metadata, and safe file paths.
4. Azure login occurs only after those checks succeed.
5. The verified archive is uploaded to the Development environment of the existing Static Web App.
6. Live checks compare the deployed release with the candidate.
7. A receipt records the successful release evidence.

`Post-CD-Dev` is triggered after a successful `Publish-Development` run. It downloads the exact retained candidate and repeats read-only checks against the live Development endpoint. It can also be started manually when the operator already has the source run ID and digest.

The separate test run makes the evidence visible and reusable without confusing a post-deployment check with the publication itself.

## Promotion carries evidence forward

Staging and Production do not rebuild the site. Their manual workflows require the original Development publish run and its archive digest. `_Deliver` downloads the retained candidate, verifies its identity, and checks the evidence required for the requested transition.

| Operation | Required evidence | Effect |
| --- | --- | --- |
| Development publish | Qualified candidate | Deploy to Development and record a receipt |
| Development test | Successful Development publish | Repeat live checks without changing the site |
| Staging promote | Development candidate and digest | Deploy the same bytes to Staging |
| Production promote | Same candidate plus successful Staging evidence | Deploy the same bytes to Production |
| Production test | Successful Production evidence | Repeat live checks without publishing |
| Production restore | Retained candidate plus prior successful Production evidence | Redeploy known-good bytes |

A run ID by itself is not enough. GitHub Actions runs can be rerun, so the release identity includes the run attempt, source revision, archive digest, and receipts. A stale successful attempt must not silently qualify a newer failed attempt.

## One Static Web App, named environments

The delivery model uses one existing Azure Static Web App with named deployment environments rather than provisioning a new SWA for every stage. Repository or environment variables provide the resource name and resource groups; the documented defaults are `swa-portfolio-dev-scus-001` and `rg-portfolio-dev`.

The logical delivery stages map as follows:

| Pipeline stage | Static Web App target |
| --- | --- |
| Development | Named `development` environment |
| Staging | Named `staging` environment |
| Production | The default production environment |
| Pull request | No longer deployed; PR qualification only |

The deployment action uploads the already-extracted candidate with `skip_app_build: true`. That prevents Azure's deployment step from silently becoming a second build system.

## OIDC and least privilege

The delivery jobs use GitHub Actions OIDC to authenticate to Azure. They request `id-token: write` only on jobs that need cloud access; qualification retains only repository and Actions permissions. Environment-scoped identities and protection rules provide the approval boundary for Development, Staging, and Production.

Before authentication, the delivery workflow validates the source run, archive digest, producer attempt, required prior-stage receipt, release metadata, and archive paths. The order is deliberate: reject an unknown or mismatched candidate before presenting any cloud credential to the job.

The deployment lock, `swa-portfolio-delivery`, serializes publication, promotion, testing, cleanup, and infrastructure operations. It prevents concurrent operations from racing the same Static Web App, although the lock does not promise FIFO ordering.

## Infrastructure is a separate operation

`Update-Infrastructure` is manually dispatched with a target stage, a full reviewed commit from `Acestus/infra`, and an explicitly configured template. It checks out that immutable infrastructure revision and applies it to the selected resource group.

This separation keeps application delivery and infrastructure mutation visible as different operations. Publishing a tested site should not implicitly change the resource topology, and an infrastructure update should not be mistaken for an application release.

## Retention is part of the release design

Main-branch candidates are retained for 90 days. Intermediate verified artifacts are retained for seven days, and pull-request qualification artifacts are retained for seven days. Retention supports promotion and recovery, but it is not an indefinite backup strategy.

A restore can only work while the selected candidate and its evidence remain available. If an artifact expires, the safe response is to stop and qualify a new release—not to rebuild a replacement and describe it as the original release.

## The operating rule

The most important rule in this repository is simple:

> Build once. Test the retained bytes. Promote by evidence. Deploy only the candidate you can identify.

That rule turns a collection of YAML files into a release process. GitHub Actions supplies the orchestration, Azure Static Web Apps supplies the hosting environments, and the archive digest plus receipts connect the two without asking trust to fill in the gaps.

## References

- [Portfolio repository](https://github.com/Acestus/portfolio)
- [GitHub Actions](https://github.com/Acestus/portfolio/actions)
- [Portfolio delivery configuration](https://github.com/Acestus/portfolio/blob/main/docs/swa-cicd.md)
- [GitHub Actions workflow directory](https://github.com/Acestus/portfolio/tree/main/.github/workflows)
- [Azure Static Web Apps deployment environments](https://learn.microsoft.com/azure/static-web-apps/deploy-preview)
- [GitHub Actions OIDC with Azure](https://learn.microsoft.com/azure/developer/github/connect-from-azure)
