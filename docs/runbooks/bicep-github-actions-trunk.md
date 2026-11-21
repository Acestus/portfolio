(eval):5: parse error near `end'
(eval):5: parse error near `end'
# Trunk PR and deployment runbook

Open this file in Neovim:

~~~fish
nvim docs/runbooks/bicep-github-actions-trunk.md
~~~

Each command below is a complete fish command, so it can be run on its own with the current-line keymap. Replace PR number 46 when following another pull request.

## Check before merge

~~~fish
test (curl -sS -o /dev/null -w '%{http_code}' https://acestus.com/videos/playback-sample/) = 200
test (curl -sS -o /dev/null -w '%{http_code}' https://acestus.com/docs/bicep-github-actions-trunk/) = 404
~~~

## Merge and watch

~~~fish
gh pr view 46 --web
gh pr merge 46 --auto --squash
gh pr checks 46 --watch
gh run watch (gh run list --repo Acestus/portfolio --commit (gh pr view 46 --json mergeCommit --jq '.mergeCommit.oid') --workflow '02 Publish-Development' --json databaseId --jq '.[0].databaseId') --repo Acestus/portfolio --exit-status
gh run view (gh run list --repo Acestus/portfolio --commit (gh pr view 46 --json mergeCommit --jq '.mergeCommit.oid') --workflow '02 Publish-Development' --json databaseId --jq '.[0].databaseId') --repo Acestus/portfolio --web
~~~

The main-branch run builds once, promotes the retained site through development, staging, and production, and checks the deployed release.

## Check after deployment

~~~fish
test (curl -sS -o /dev/null -w '%{http_code}' https://acestus.com/videos/playback-sample/) = 404
test (curl -sS -o /dev/null -w '%{http_code}' https://acestus.com/docs/bicep-github-actions-trunk/) = 200
curl -fsSL -H 'Cache-Control: no-cache' https://acestus.com/docs/bicep-github-actions-trunk/ | string match -q '*ACCEPTANCE-ID: BICEP-TRUNK-2026-11*'
~~~
