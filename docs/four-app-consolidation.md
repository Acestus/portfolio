# Four-app consolidation — 2026-11-03

## Decision and status

**Required:** the owner approved four retained Azure Static Web Apps, the existing resume content, including the current Michigan and Fabric working-copy edits without altering their originals, public scouting with restricted calendar/private details, and exact independent acceptance revision `ff65bc81321762d5fa1404c02e654ba7d13cabb5` in `Acestus/site-acceptance`.

| Retained app | Canonical domain | Content |
| --- | --- | --- |
| Journal | home.bluegreen.love | Existing journal, private Michigan itinerary, public scouting plan and reader-only calendar |
| Portfolio | portfolio.acestus.com | Portfolio, resume, professional cloud blog, Fabric services |
| History | history.acestus.com | Distinct history and faith/fatherhood topics, combined and topic RSS |
| CRM | Existing Azure hostname | Existing CRM; no application change |

**Observed:** the starting inventory has nine SWAs. Resume, green-lantern and template are not SWAs in that inventory. Other Green Lantern resources exist and are outside this retirement. Source repositories and the shared newsletter API must remain intact. Sources and exact per-file hashes are recorded in this repository's consolidation source manifest. Imported working-copy differences are identified rather than attributed to a clean source commit.

**Proposed:** retire only Michigan, Pack 60, Christian blog, cloud blog and Fabric SWAs after migration qualification, live verification, workflow shutdown and domain/consumer checks. Do not delete resource groups, newsletter backend, identities belonging to other projects, source repositories or unrelated work.

## Source of truth and independent control

The destination repository becomes authoritative for its imported content after cutover. Original repositories retain history and the originals of the owner's uncommitted edits. Edit future content at its destination. No synchronization from retired sites should overwrite it.

Application checks remain with each implementation. The executable acceptance contract remains in the separately owned private `Acestus/site-acceptance` repository. Its exact revision was approved before implementation. Initial execution is operator coordinated; do not present it as a protected, centrally enforced acceptance authority. A shared workflow/platform repository, protected review policy and automatic acceptance attestations remain **Blocked** until separately established. A green application build alone is not independent acceptance.

## Build, provenance and delivery

**Required:** unprivileged PR and main builds, pinned Hugo/actions/dependencies, retained exact archives with source commit, dirty flag, producer run/attempt, acceptance revision and complete file hashes. Verify the archive digest, producer identity, safe archive paths, all file hashes and clean source before obtaining deployment credentials. Deploy the retained package without rebuilding. Production upload is a separate manually dispatched workflow after operator independent qualification. This is a documented operator gate, not automated enforcement of independent approval.

Portfolio retains .NET unit, integration and Playwright checks, its resume PDF/print behavior, architecture article and legacy demonstrations. Journal tests deny unauthorized API requests, verify synthetic ICS parsing and check public/private content boundaries. The personal site verifies all seven posts against original hashes and confirms distinct topic paths and RSS.

Bicep describes narrowly scoped OIDC delivery identities for Journal and History: read and list deployment credentials on the one existing SWA only. No application deletion, DNS, configuration or RBAC permission is granted to those identities. Deployment uses short-lived GitHub OIDC authentication; SWA's returned upload token is masked and not committed. Portfolio retains its existing identity. The newsletter CORS allowlist must add the new professional origin without removing existing origins.

## Privacy and safety

Michigan's revised itinerary and its styles are under `/household/michigan-2026/`, behind Journal's existing `reader` role. Public scouting contains only the planned program; copied calendar dates are removed from its HTML and JavaScript. Copied calendar data, live calendar UI and `/api/*` require reader access. Reader-only responses use `Cache-Control: private, no-store`. The API additionally checks the SWA-injected principal; never expose this handler as a standalone public function, where caller-supplied identity headers would be untrusted.

Move `BAND_ICAL_URL` server-to-server in memory without writing or printing its value; merge existing destination settings. Denial is verified both unsigned and with forged identity headers on the live Azure endpoint. Calendar data is rendered with text nodes. Feed errors withhold URLs and private event data. Feed requests are bounded in time and size. ICS parsing preserves source timezone labels and unfolded/escaped fields; it does not expand recurrence rules. Do not claim general recurrence support or authenticated live reader verification from fixture tests.

**Blocked:** an authenticated human-reader calendar/itinerary walkthrough requires a real authorized session. Automated anonymous-denial and synthetic authenticated-handler tests do not substitute for it. Record this limitation in the release receipt; do not invent human acceptance.

## Acceptance-driven rollout

1. Record the approved acceptance revision and baseline failures before implementation. The initial three resume scenarios pass and the three new migration scenarios fail for absent routes/content.
2. Build each changed destination, run its inner checks and the applicable independent tests. Keep per-attempt evidence and distinguish local checks from live platform authorization checks.
3. Review each repository diff, open separate PRs, pass credential-free CI, merge, and qualify each exact retained main artifact. Record its SHA-256 and source/run identity.
4. Save pre-cutover source/runtime configuration and retain artifacts for rollback; keep private content and settings out of public releases.
5. Deploy exact qualified bytes to the three surviving apps. Verify published source identities, imported content, newsletter preflight, resume regressions and Azure-enforced access denial. Never submit a real test subscription.
6. Inspect old custom domains, DNS, workflows, active runs and consumers. Disable obsolete deployment workflows only after their replacements work. Retire old domains only with explicit accounting; do not claim old URLs redirect without actual DNS and routing verification.
7. Delete only the five approved superseded SWAs after their replacement checks and retirement prerequisites are satisfied. Re-list the subscription and require exactly the four named survivors. Document any DNS or human-reader blocker before deletion rather than fabricating completion.

## Rollback

Redeploy a previously retained, verified package to its surviving app; do not rebuild a tag and assume identical bytes. Restore the previous route policy and managed API package together if needed. Preserve existing private role grants and merged settings. Re-run live privacy and resume checks after rollback. For an old deleted SWA, Azure may assign a different default hostname on recreation, so deletion is not a byte-for-byte reversible operation; validate DNS replacement and retain sources/backups before proceeding. Recovery of private settings uses their approved server-side stores, never this document.

## Release acceptance criteria

- Four named SWAs remain after retirement; CRM remains operational.
- Existing portfolio/resume acceptance and all 21 demonstrations pass; professional posts and $50 Fabric email booking are reachable under Portfolio.
- Five history and two faith posts retain their original content and distinct topic URLs; combined and topic RSS work.
- Journal's prior selected content is retained; the public Pack 60 plan has no copied calendar, secret feed address or private itinerary. Michigan, calendar UI, private assets and API deny anonymous/forged-principal access on both canonical and default Azure hostnames.
- Original Michigan and Fabric working-copy edits remain untouched; their included content is identified by file hash.
- Qualified immutable artifact identities, source PRs, deployment runs, independent test results, domain dispositions and any remaining limitations are recorded. No credential or private calendar content is published as evidence.
