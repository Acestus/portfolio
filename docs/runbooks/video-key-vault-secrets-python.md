# Azure Key Vault secrets in a Python application — video runbook

Use this runbook to prepare the demonstration and verify its published guide. The three key points below are drawn from the portfolio documentation.

## Three key points

1. Use a dummy secret and grant the demo identity only the required permission.
2. Distinguish local developer credentials from deployed managed identity.
3. Verify allowed and denied access without printing the secret.

## Check before merge

Run one line at a time in fish. Each command is standalone and uses a literal URL; none depends on a variable set by another line.

~~~fish
curl -fsSL https://acestus.com/docs/video-key-vault-secrets-python/ | python3 -c 'import html,re,sys; body=re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(sys.stdin.read()))).lower(); checks=["non-sensitive value","managed identity","denied access"]; sys.exit(not body.strip() or "(eval):5: parse error near" in body or not all(check in body for check in checks))'; and echo 'PASS: all three documented points are present and the eval parse error is absent'; or echo 'FAIL: the guide is unavailable, incomplete, or contains the eval parse error'
gh pr view --web
gh pr merge --auto --squash
gh pr checks --watch
gh run watch (gh run list --repo Acestus/portfolio --branch main --workflow '02 Publish-Development' --limit 1 --json databaseId --jq '.[0].databaseId') --repo Acestus/portfolio --exit-status
gh run view (gh run list --repo Acestus/portfolio --branch main --workflow '02 Publish-Development' --limit 1 --json databaseId --jq '.[0].databaseId') --repo Acestus/portfolio --web
~~~

The curl check requires a non-empty guide response, all three topic-specific points, and no eval parse-error text. The main release builds once and deploys the retained site through Development, Staging, and Production; each stage checks the guide against its retained candidate. The post-deployment workflow repeats the check against the selected Development release.
