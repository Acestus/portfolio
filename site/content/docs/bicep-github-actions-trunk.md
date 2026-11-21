(eval):5: parse error near `end'
(eval):5: parse error near `end'
---
title: "Bicep and GitHub Actions with Trunk-Based Delivery"
description: "A hands-on Bicep workflow that validates pull requests and deploys from main with GitHub OIDC, plus curl acceptance checks."
space: "Architecture & delivery"
date: "2026-11-21"
draft: false
---

This guide pairs a small Bicep deployment with short-lived branches. Pull requests compile Bicep without Azure credentials. After merge, GitHub Actions signs in to Azure with OIDC, previews the change, applies it to an isolated demo resource group, and confirms the public page marker with curl.

## The exercise

The Azure demo deploys a Storage static website containing synthetic HTML and a version marker. Start at v1, then change the Bicep tag and page to v2 on a short-lived feature branch. The pull request checks the template; the main workflow performs OIDC login, what-if, deployment, upload, and the live curl assertion.

The static site is public by design, so use generated content only. The workflow identity is scoped to a GitHub environment and Azure resource group/storage account. No client secret is stored in GitHub.

[Open the complete Neovim runbook on GitHub](https://github.com/Acestus/portfolio/blob/main/docs/runbooks/bicep-github-actions-trunk.md)

## Trunk and feedback loop

~~~text
main
  └── short-lived feature branch
        ├── edit the Bicep template and served page
        ├── prove v2 is absent before deployment
        ├── open a pull request and wait for validation
        └── squash merge to main
              └── OIDC login → what-if → deploy → curl marker check
~~~

The acceptance assertion is intentionally small:

~~~sh
curl --fail --silent --show-error --location \
  --header 'Cache-Control: no-cache' "$SITE_URL" |
  grep --fixed-strings --quiet 'change-marker: v2'
~~~

Run it against v1 before the change: the v2 assertion must fail. After deployment, the v2 assertion must pass and the v1 assertion must fail.

## Identity and safety

The PR validation job has no Azure permissions. Only the main deployment job uses the demo GitHub environment and requests an OIDC token. The Azure federated credential must match the repository's exact subject. New repositories created after July 15, 2026 use immutable subjects containing owner and repository IDs. Restrict the environment to main.

Do not put credentials or personal data in the sample website. The Azure lab is isolated from acestus.com; the portfolio has its own release workflow.

## Acestus deployment acceptance

This change also removes the playback test video from the site. Before deployment, its URL should return 200 and this page should return 404. After the PR reaches production, expect the sample URL to return 404 and this page to return 200.

The acceptance marker is ACCEPTANCE-ID: BICEP-TRUNK-2026-11. The portfolio release check verifies the guide bytes and requires 404 responses from the removed page and media files.

## References

- [Deploy Bicep with GitHub Actions](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deploy-github-actions)
- [GitHub Actions OIDC in Azure](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-azure)
- [Azure Storage static website hosting](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)
