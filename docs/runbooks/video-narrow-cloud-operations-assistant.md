# A narrow AI assistant for cloud operations — video runbook

Use this runbook to prepare the demonstration and verify its published guide. The three key points below are drawn from the portfolio documentation.

## Three key points

1. Choose one bounded, read-only or reversible task and reject out-of-scope inputs.
2. Validate tool arguments, apply least privilege, and require approval for changes.
3. Record the request, tool call, validation, and outcome in an audit trail.

## Check before merge

Run one line at a time in fish. The first three curl checks test one documented point each. Every line uses a literal URL and works without shell variables from previous commands.

~~~fish
curl -fsSL https://acestus.com/docs/video-narrow-cloud-operations-assistant/ | python3 -c 'import html,re,sys; body=re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(sys.stdin.read()))).lower(); check="read-only or reversible task"; sys.exit(not body.strip() or "(eval):5: parse error near" in body or check not in body)'; and echo 'PASS: point 1 is present and the eval error is absent'; or echo 'FAIL: point 1 is missing, the page is unavailable, or the eval error is present'
curl -fsSL https://acestus.com/docs/video-narrow-cloud-operations-assistant/ | python3 -c 'import html,re,sys; body=re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(sys.stdin.read()))).lower(); check="schema validation"; sys.exit(not body.strip() or "(eval):5: parse error near" in body or check not in body)'; and echo 'PASS: point 2 is present and the eval error is absent'; or echo 'FAIL: point 2 is missing, the page is unavailable, or the eval error is present'
curl -fsSL https://acestus.com/docs/video-narrow-cloud-operations-assistant/ | python3 -c 'import html,re,sys; body=re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(sys.stdin.read()))).lower(); check="audit entry"; sys.exit(not body.strip() or "(eval):5: parse error near" in body or check not in body)'; and echo 'PASS: point 3 is present and the eval error is absent'; or echo 'FAIL: point 3 is missing, the page is unavailable, or the eval error is present'
gh pr view --web
gh pr merge --auto --squash
gh pr checks --watch
gh run watch (gh run list --repo Acestus/portfolio --branch main --workflow '02 Publish-Development' --limit 1 --json databaseId --jq '.[0].databaseId') --repo Acestus/portfolio --exit-status
gh run view (gh run list --repo Acestus/portfolio --branch main --workflow '02 Publish-Development' --limit 1 --json databaseId --jq '.[0].databaseId') --repo Acestus/portfolio --web
~~~

Each curl check requires a non-empty guide response, its topic-specific point, and no eval parse-error text. The main release builds once and deploys the retained site through Development, Staging, and Production; each stage checks the guide against its retained candidate. The post-deployment workflow repeats the check against the selected Development release.
