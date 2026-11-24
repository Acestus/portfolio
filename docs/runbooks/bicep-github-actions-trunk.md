# Bicep guide deployment check

The main release workflow builds once and deploys the same site to development, staging, and production. Each stage's live check requests only `/docs/bicep-github-actions-trunk/` and compares its bytes with that stage's retained candidate.

Run one line at a time in fish. The commands infer the pull request from the current Git branch.

~~~fish
python3 -c 'import subprocess; result = subprocess.run(["curl", "-fsSL", "https://acestus.com/docs/bicep-github-actions-trunk/"], capture_output=True, text=True); ok = result.returncode == 0 and bool(result.stdout) and "(eval):5: parse error near" not in result.stdout; print("PASS: guide is available and the eval parse error is absent" if ok else "FAIL: guide is unavailable, empty, or contains the eval parse error"); raise SystemExit(0 if ok else 1)'
gh pr view --web
gh pr merge --auto --squash
gh pr checks --watch
gh run watch "$(gh run list --repo Acestus/portfolio --branch main --workflow '02 Publish-Development' --limit 1 --json databaseId --jq '.[0].databaseId')" --repo Acestus/portfolio --exit-status
gh run view "$(gh run list --repo Acestus/portfolio --branch main --workflow '02 Publish-Development' --limit 1 --json databaseId --jq '.[0].databaseId')" --repo Acestus/portfolio --web
~~~

A successful run means the guide check passed in all three deployment stages. The automatic post-deployment workflow repeats the guide check against the selected development release.
