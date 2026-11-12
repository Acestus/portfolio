# Portfolio — canonical acestus.com source

Hugo renders the site; Bun builds the browser JavaScript. Portfolio is the canonical replacement for the former Clojure website. Deployment and DNS cutover are separate operational steps.

## Build and verify

Use .NET 10 (global.json), Hugo extended 0.164.0 and Bun 1.3.14. Restore the locked .NET projects and install their matching Playwright Chromium before building.

```sh
dotnet restore tools/Portfolio.Build/Portfolio.Build.csproj --locked-mode
dotnet restore tests/Portfolio.Tests/Portfolio.Tests.csproj --locked-mode
bun test web/tests
bun run build
dotnet test tests/Portfolio.Tests/Portfolio.Tests.csproj
```

The build renders the resume PDF with Chromium. Browser tests additionally require a running generated-site server and `PORTFOLIO_TEST_URL`; see the qualification workflow for the complete automated sequence.

The nine delivery workflows build once, retain a checked release archive, and promote those same bytes through named environments on one existing Azure Static Web App. See [delivery configuration](docs/swa-cicd.md), [architecture](repo-architecture.md), and [migration details](docs/hugo-bun-migration.md).
