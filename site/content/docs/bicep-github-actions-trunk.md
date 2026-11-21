(eval):5: parse error near `end'
(eval):5: parse error near `end'
---
title: "Bicep and GitHub Actions with Trunk-Based Delivery"
description: "How short-lived pull requests, federated identity, and a verified main-branch release fit together."
space: "Architecture & delivery"
date: "2026-11-21"
draft: false
---

The infrastructure pipeline already uses Bicep and GitHub Actions. This guide summarizes the delivery path: validate a short-lived pull request, merge to main, then deploy the retained release through the configured environments with federated identity.

## Trunk workflow

~~~text
short-lived branch → pull-request validation → merge to main
  → build once → deploy and verify development → staging → production
~~~

Pull-request validation checks the proposed change without deploying it. The main-branch workflow builds the site once, retains the exact output, and promotes those same bytes through the release stages. Azure access uses GitHub's federated identity instead of a stored client secret.

The existing [Infrastructure as Code guide](/docs/iac-pipeline/) explains the Bicep, OIDC, and deployment design in more detail.

## Verify a site change

For the change that accompanies this guide, the playback sample page should disappear and this page should become available. A curl check can confirm both responses after deployment:

~~~sh
curl --silent --show-error --output /dev/null \
  --write-out '%{http_code}\n' \
  https://acestus.com/videos/playback-sample/

curl --fail --silent --show-error --location \
  https://acestus.com/docs/bicep-github-actions-trunk/ |
  grep --fixed-strings 'ACCEPTANCE-ID: BICEP-TRUNK-2026-11'
~~~

The portfolio's post-deployment job checks the exact published guide and requires real 404 responses for the removed sample page and media.
