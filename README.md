# William Weeks-Balconi — portfolio and resume

A Hugo site at https://acestus.com with the canonical resume, a generated
PDF, interactive cloud demonstrations and technical writing. Existing demo and
article URLs are preserved. The public knowledge base lives at `/docs/`, including
the supplied engineering delivery architecture; the public Pack 60 plan lives at
`/scouting/`. Its private calendar remains on Journal.

Read [repo-architecture.md](repo-architecture.md) first for boundaries, commands,
provenance, deployment, rollback and current limitations. Resume content lives in
`site/content/resume/index.md`; edit it once to update both website and PDF.
`docs/resume-migration.md` records the approved legacy source.

The PR/main workflow builds and tests without Azure privileges. Publication is a
separate manual operation using the exact retained main artifact after independent
verification. This repository does not contain the independent acceptance contract
or automatically approve its own behavior. No other Azure apps are deleted here.
