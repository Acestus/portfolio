# Hugo and Bun migration

Portfolio is the canonical source selected for acestus.com. This change prepares the replacement; it does not change production DNS or deploy an application.

Eighteen browser demos and the shared site scripts now build from maintained JavaScript using Bun. Squint was used once to convert the former ClojureScript sources; it is not a project or CI dependency. The minimal runtime is vendored with its license under `web/runtime`. `data/javascript-migration.json` records original source hashes and provenance. Original build configurations and diagnostic scripts are archived under `docs/migration/original-build`; `src/portfolio` preserves historical sources linked from older articles.

The intentional browser Clojure REPL is retained verbatim under `web/vendor`, with a checked SHA-256. Its browser interpreter remains functional without installing Clojure, Java, npm, or shadow-cljs in the site build. See the vendor README for provenance.

The former website's six post URLs redirect to canonical Hugo articles. Four missing articles were migrated to Markdown; the two existing authored replacements remain authoritative. `data/website-migration.json` records the mapping. The legacy photo, contact card, health endpoint, and Word-compatible resume download remain available. The PDF and Word-compatible download derive from the generated resume page.

Browser verification covers all demo pages, REPL evaluation, platform tabs, representative game controls, mobile navigation, and search. Migration fixtures check legacy redirects and downloads. Live Azure routing and the eventual apex DNS cutover still require operational verification after deployment.
