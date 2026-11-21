# Portfolio — canonical acestus.com source

Hugo renders the site; Bun builds the browser JavaScript. Portfolio is the canonical replacement for the former Clojure website. Deployment and DNS cutover are separate operational steps.

## Build and verify

Use .NET 11 (global.json), Hugo extended 0.164.0 and Bun 1.3.14. Restore the locked .NET projects and install their matching Playwright Chromium before building.

```sh
dotnet restore tools/Portfolio.Build/Portfolio.Build.csproj --locked-mode
dotnet restore tests/Portfolio.Tests/Portfolio.Tests.csproj --locked-mode
bun test web/tests
bun run build
dotnet test tests/Portfolio.Tests/Portfolio.Tests.csproj
```

The build renders the resume PDF with Chromium. Browser tests additionally require a running generated-site server and `PORTFOLIO_TEST_URL`; see the qualification workflow for the complete automated sequence.

The delivery workflows build once, retain a checked release archive, and deploy those same bytes to separate development, staging, and production Azure Static Web Apps. See [delivery configuration](docs/swa-cicd.md), [architecture](repo-architecture.md), and [migration details](docs/hugo-bun-migration.md).

Sample data storage targets and identity-based upload instructions are documented in [sample data storage](docs/sample-data-storage.md).
