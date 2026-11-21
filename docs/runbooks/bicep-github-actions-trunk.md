# Trunk PR and deployment runbook

Open this file in Neovim:

~~~fish
nvim docs/runbooks/bicep-github-actions-trunk.md
~~~

Each command below is complete and can run by itself in fish. Successful checks print PASS.

## Check before merge

~~~fish
test (curl -sS -o /dev/null -w '%{http_code}' https://acestus.com/videos/playback-sample/) = 200; and echo 'PASS: sample is currently published'; or echo 'FAIL: sample status was not 200'
test (curl -sS -o /dev/null -w '%{http_code}' https://acestus.com/docs/bicep-github-actions-trunk/) = 404; and echo 'PASS: guide is not published yet'; or echo 'FAIL: guide already returned 200'
~~~

## Merge and watch

~~~fish
gh pr view --web
gh pr merge --auto --squash
gh pr checks --watch
gh run watch (gh run list --repo Acestus/portfolio --branch main --workflow '02 Publish-Development' --limit 1 --json databaseId --jq '.[0].databaseId') --repo Acestus/portfolio --exit-status
gh run view (gh run list --repo Acestus/portfolio --branch main --workflow '02 Publish-Development' --limit 1 --json databaseId --jq '.[0].databaseId') --repo Acestus/portfolio --web
~~~

The main-branch run builds once, promotes the retained site through development, staging, and production, and checks the deployed release.

## Check after deployment

~~~fish
test (curl -sS -o /dev/null -w '%{http_code}' https://acestus.com/videos/playback-sample/) = 404; and echo 'PASS: removed sample returns 404'; or echo 'FAIL: sample did not return 404'
test (curl -sS -o /dev/null -w '%{http_code}' https://acestus.com/docs/bicep-github-actions-trunk/) = 200; and echo 'PASS: guide returns 200'; or echo 'FAIL: guide did not return 200'
curl -fsSL -H 'Cache-Control: no-cache' https://acestus.com/docs/bicep-github-actions-trunk/ | string match -q '*ACCEPTANCE-ID: BICEP-TRUNK-2026-11*'; and echo 'PASS: acceptance marker is published'; or echo 'FAIL: acceptance marker is missing'
~~~
