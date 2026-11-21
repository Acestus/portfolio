(eval):5: parse error near `end'
(eval):5: parse error near `end'
# Trunk PR and deployment runbook

Open the runbook in Neovim:

~~~sh
nvim docs/runbooks/bicep-github-actions-trunk.md
~~~

This PR publishes the Bicep delivery guide and removes the playback sample. The repository's existing pull-request and main-branch workflows do the validation and deployment.

## 1. Check the current live behavior

Run before merging. The sample page should exist and the new guide should not:

~~~sh
VIDEO_URL="https://acestus.com/videos/playback-sample/"
GUIDE_URL="https://acestus.com/docs/bicep-github-actions-trunk/"

test "$(curl --silent --show-error --output /dev/null \
  --write-out '%{http_code}' "$VIDEO_URL")" = 200
test "$(curl --silent --show-error --output /dev/null \
  --write-out '%{http_code}' "$GUIDE_URL")" = 404
~~~

## 2. Auto-merge the pull request

~~~sh
PR_NUMBER=46

gh pr checks "$PR_NUMBER" --watch
gh pr merge "$PR_NUMBER" --auto --squash
gh pr view "$PR_NUMBER" --web
~~~

## 3. Watch the main-branch CI/CD run

~~~sh
MERGE_SHA=$(gh pr view "$PR_NUMBER" --json mergeCommit --jq '.mergeCommit.oid')
RUN_ID=$(gh run list --commit "$MERGE_SHA" \
  --workflow "02 Publish-Development" \
  --json databaseId --jq '.[0].databaseId')

gh run watch "$RUN_ID" --exit-status
gh run view "$RUN_ID" --web
~~~

The run qualifies the site, deploys the retained release through the configured environments, and runs the live release checks.

## 4. Confirm the change with curl

Run after the production job succeeds. The removed sample must be 404; the new guide must be live and contain its acceptance marker:

~~~sh
test "$(curl --silent --show-error --output /dev/null \
  --write-out '%{http_code}' "$VIDEO_URL")" = 404
test "$(curl --silent --show-error --output /dev/null \
  --write-out '%{http_code}' "$GUIDE_URL")" = 200

curl --fail --silent --show-error --location \
  --header 'Cache-Control: no-cache' "$GUIDE_URL" |
  grep --fixed-strings --quiet 'ACCEPTANCE-ID: BICEP-TRUNK-2026-11'
~~~

