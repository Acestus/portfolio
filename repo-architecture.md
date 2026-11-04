# Portfolio architecture

This independent public repository owns the Hugo portfolio and canonical resume.
`site/content/resume/index.md` is the resume source; PDF and print views derive
from the generated page. `site/layouts` and `site/static` own the site shell.
`data/projects.json` and `data/articles.json` index preserved demonstrations and
technical articles. `resources/public` retains their existing URLs; 19 compiled
ClojureScript entrypoints are selectively staged so development bundles never
enter the site. Existing committed Rust/WASM binaries are preserved unchanged.

## Commands

Use the SDK in global.json, Hugo 0.164.0, Node 22 and Java 21. Restore npm using
`npm ci`, and .NET using `dotnet restore tests/Portfolio.Tests/Portfolio.Tests.csproj
--locked-mode`. Build that test project, then install the matching browser with
`node tools/Portfolio.Build/bin/Debug/net10.0/.playwright/package/cli.js install chromium`.

`dotnet run --project tools/Portfolio.Build -- build` compiles existing demos,
generates Hugo HTML, renders the resume PDF, validates output and writes hashed
release/file manifests. `--skip-legacy` is local iteration only after current
demos have compiled. `dotnet run --project tools/Portfolio.Build -- serve 1315`
serves exact generated output on loopback. Set PORTFOLIO_ROOT and
PORTFOLIO_TEST_URL to run application tests. CI documents the exact commands.

## Delivery and authority

Test-Portfolio builds and qualifies without cloud privileges on PR and main.
It retains a single site.tar and its hashes for 90 days. Independently reviewed
behavior contracts live in private Acestus/site-acceptance at approved revision
0439dcb52bf850fbec2c75feb164c286452c529f. They import no application internals.
Run them against the exact retained candidate before dispatching deployment,
then again against the live site. Build/test feedback is not human acceptance.

Deploy-Portfolio is manual and main-source only. It accepts a successful main
producer run and the independently verified archive hash. Its unprivileged job
checks repository/event/ref/workflow/run/attempt/source and every file digest
before the Dev job (the existing publicly served app) can request OIDC privileges. It uploads those bytes
to the existing SWA; it does not provision infrastructure. The domain remains
portfolio.acestus.com. Unknown paths return real 404, not a homepage fallback.

Desired infrastructure remains owned by the existing infra/portfolio stack.
Cloud inventory is authoritative for actual state. No Bicep deployment or
resource deletion occurs in application publication. infra/main.bicep is a
legacy alternative and must not be deployed as a duplicate owner. Retirement
of other sites remains separately gated by content, privacy, DNS and consumers.

## Limitations and rollback

The private acceptance suite currently runs through an operator-coordinated
boundary; there is no automated independent acceptance authority. The shared
infra repository has no published Hugo lifecycle, so this first release owns
its application adapter locally. Adoption of an independently published shared
workflow requires a separately reviewed migration; do not claim it is installed.
GitHub settings and Azure OIDC federation must be inspected separately; checked-in
files do not establish protection. OIDC login still acquires an ephemeral SWA
upload token; no secret value belongs in artifacts or Bicep outputs.

Restore by selecting a retained, previously qualified main site artifact,
verifying hashes and provenance, rerunning the approved independent suite, then
explicitly dispatching the same deployment workflow with that run/digest and
verifying the live result. Never rebuild and call it the same release. Missing
or expired artifacts/receipts block restoration. Source reversion, DNS recovery,
data recovery and infrastructure reversal are distinct operations. The initial
live snapshot is a backup for review, not a prior qualified release receipt.
