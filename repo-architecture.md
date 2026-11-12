# Portfolio architecture

Portfolio owns the canonical Hugo source for acestus.com. `site/content` holds authored Markdown, `site/layouts` the templates, and `site/static` static assets. Hugo mounts generated assets from `.build`; `public` is disposable output.

Bun compiles `web/entries` and `web/modules/portfolio` into the existing demo URLs. `web/shell` contains the site navigation scripts. The browser Clojure REPL remains a reviewed, hash-checked browser asset; it needs no Clojure or JVM build tool. Original Clojure sources remain as historical references, not build inputs.

`tools/Portfolio.Build` orchestrates Bun, Hugo, resume PDF/Word-compatible downloads, output verification, and release manifests. `tests/Portfolio.Tests` checks output and browser behavior. Python release scripts inspect untrusted retained archives before Azure authentication. The independently versioned acceptance contract remains pinned in release metadata.

The delivery pipeline uses one existing SWA with production plus named development, staging, and PR environments. GitHub environments supply approvals and Azure OIDC identity. Promotion verifies producer identity, archive SHA-256, a complete file inventory, and prior-stage receipts. No promotion rebuilds the site.

Infrastructure belongs to `Acestus/infra`. Select an explicitly configured template and reviewed full commit SHA; the pipeline does not assume an unverified template path. Legacy local infrastructure files are not the pipeline's deployment source. See [delivery operations](docs/swa-cicd.md).
