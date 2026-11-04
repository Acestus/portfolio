# Professional apex cutover

**Required:** the owner requested `https://acestus.com/` as the professional home with `/articles/`, `/portfolio/` and `/resume/`. Exact independent executable revision `1e7e3513b69dd326cb8dbd49b258311f79db2ad9` was approved before implementation.

**Proposed:** reuse the existing Portfolio SWA; do not create another app. Articles combines the seven professional posts and curated technical articles, retaining static article URLs. The project showcase moves to `/portfolio/`. Old `/projects/`, `/writing/`, `/cloud/` and individual cloud-post paths redirect explicitly, with both trailing-slash forms. Existing Fabric services and all demonstration HTML paths remain available. Newsletter subscriptions remain in the cloud topic; both the new apex and existing subdomain must be accepted by the existing backend's CORS policy.

**Observed before cutover:** the apex A record points to `40.119.12.24`, serving an existing professional homepage with `/blog`, `/contact`, `/portfolio` and `/static/contact.vcf` links. Keep that DNS target until the replacement is qualified and the SWA apex binding is ready. Preserve useful old contact and download entry points rather than deleting unrelated backing resources. The existing Portfolio binding remains available during cutover; no server-side host-only redirect is claimed.

**Required rollout:** qualify the exact retained main package on the current subdomain; add and validate apex ownership with a TXT record; update only the apex website A record (or supported ALIAS) to the SWA target; verify TLS, canonical URLs, navigation, old path redirects, PDF/print, newsletter preflight and all approved checks on the actual apex. Preserve MX, mail-related TXT, NS and unrelated subdomains. Save old DNS values and the previous qualified archive for rollback. DNS authorization and an authenticated provider session are separate from application deployment.

**Rollback:** restore the old apex A value `40.119.12.24` if apex routing fails, or redeploy a previously retained qualified archive if application content fails. Record actual domain-validation and live-verification results; do not mark a pending DNS operation complete.

**Observed preservation:** the old contact page has a `mailto:jump@hey.com` link and no form action. `/contact/` keeps that email and the existing public `/static/contact.vcf` download. The old `/blog` entry redirected to a retired hostname; its replacement redirects into the unified articles index.

**Required release contract:** `3bf4b14349a55933189fa104251423a19de078c1` corrects only redirect-header representation: relative and absolute headers must resolve to the exact same-origin destination. Core implementation began after approval of `1e7e351`; the owner approved this corrected executable release revision before release qualification. Do not claim approval from elapsed time or from application CI.
