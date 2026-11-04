# Resume migration provenance

The repository owner approved use of the existing resume-azure content on
2026-11-03. Source: `Acestus/resume-azure` commit
`75160c40a7f0944e519f9e7ef6b4d3b395788fbd`,
`src/app/app.component.html` (SHA-256 `968ca3f151e59413da8da023f0118216a123975d61dcf3afd085729f36e14d31`).

`site/content/resume/index.md` is now the proposed canonical resume source.
Experience dates, employers, role titles, education and contact details retain
the existing source claims; no later employment or credentials were invented.
The PDF is rendered from the same generated resume page. The dead external Blob
PDF link and third-party HTTP stylesheet are removed. Resume HTML is not copied
as a raw Angular document or exposed with private repository history.

Legacy demos and articles retain their paths via Hugo static mounts. The former
home is available at `/legacy.html`. A custom 404 returns status 404 rather than
disguising missing pages as the homepage. No legacy app resource is deleted here.
