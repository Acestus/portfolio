# Bicep guide deployment check

The main release workflow builds once and deploys the same site to development, staging, and production. Each stage's live check requests only `/docs/bicep-github-actions-trunk/` and compares its bytes with that stage's retained candidate.

Run one line at a time in fish. The commands infer the pull request from the current Git branch.

~~~fish
gh pr view --web
gh pr merge --auto --squash
gh pr checks --watch
gh run watch (gh run list --repo Acestus/portfolio --branch main --workflow '02 Publish-Development' --limit 1 --json databaseId --jq '.[0].databaseId') --repo Acestus/portfolio --exit-status
gh run view (gh run list --repo Acestus/portfolio --branch main --workflow '02 Publish-Development' --limit 1 --json databaseId --jq '.[0].databaseId') --repo Acestus/portfolio --web
~~~

A successful run means the guide check passed in all three deployment stages. The automatic post-deployment workflow repeats the guide check against the selected development release.
