# Remotion video production specification

Status: proposed, not implemented. Last reviewed: 2026-11-20.

## Purpose

Add a repeatable way to produce narrated, animated explainers for acestus.com and YouTube. The initial visual target is clean 2D motion graphics: typography, diagrams, grids, highlights, and animated comparisons, inspired by the supplied A Life Engineered reference. Support science and physics explainers with plots, arrows, equations, and time-based motion. Develop an original visual identity; do not assume either reference channel uses Remotion.

Codex should be able to create and revise scenes from a script and storyboard. The author retains control of narration, technical accuracy, pacing, and final approval. A first implementation should produce a short sample, not attempt to automate an entire channel.

## Existing project constraints

- Hugo renders `site/content` and `site/layouts`; Bun 1.3.14 builds the existing browser assets. `.build` and `public` are generated. The .NET build orchestrator and delivery pipeline produce and promote one site artifact.
- An existing article embeds YouTube using Hugo's `youtube` shortcode. The Particle Storm page links to an MP4 on the production Azure Storage static website and uses a site-hosted thumbnail. See [sample storage](sample-data-storage.md).
- Video storage is separate from the Static Web App. The production `$web` container is public; staging and production `videos` containers are private. The development account is documented as needing provisioning. Verify current Azure state before use.
- `web/build.ts` enforces a fixed inventory of browser demos. Video authoring must not add a demo entry or alter the existing site build, its release manifest, or promotion behavior.

## Scope and decisions

1. Create a standalone `video/` project in this repository, with its own `package.json`, Bun lockfile, TypeScript configuration, and pinned, matching Remotion package versions. Use the repository's Bun version and Remotion's Bun runtime (`remotionb`). Commit source and the lockfile. Do not add React or Remotion to the site's browser bundle.
2. Render locally on demand. Normal `bun run build`, site tests, and deployments must not install video dependencies or render video. Do not add cloud rendering, automatic uploads, or a public rendering service in the first phase.
3. Output a 1920 × 1080, 30 fps H.264 MP4 as the default. Composition duration is explicitly defined in frames. Provide a lower-resolution preview and a still-frame export for thumbnails or review. Audio is optional for the first example; the workflow must support a supplied narration track and deliberate synchronization.
4. Publish only after human review. Support either a YouTube embed in a Hugo article or an explicitly published Azure static-website video linked from a page. The initial implementation must not upload, overwrite existing video, or modify infrastructure.

## Proposed layout

```text
video/
  package.json              # independently pinned dependencies and scripts
  bun.lock
  tsconfig.json
  src/index.ts              # registerRoot entry point
  src/Root.tsx              # composition registry
  src/theme/                # typography, palette, spacing and timing tokens
  src/components/           # reusable diagram and text primitives
  src/compositions/
    TeamCuts.tsx            # first, original sample
  public/                   # small, licensed source assets only
  README.md                 # setup, authoring, render and review instructions
  out/                      # generated, ignored
```

The implementation should add `video/out/` to `.gitignore`. Do not commit rendered videos, raw recordings, credentials, or unlicensed reference assets. Decide separately how to store any large source media; don't silently introduce Git LFS or an external service. Record asset sources and usage rights in `video/README.md` or a checked-in asset manifest.

## Authoring and visual requirements

- Register a `TeamCuts` composition that compares two ways of reducing a fictional workforce, using original labels and a distinct palette. Establish context, show both approaches sequentially, and finish on a readable comparison. Target 20–30 seconds. Do not imply that this illustrative example represents real employee data.
- Build reusable, parameterized primitives for headings, labels, a grid of squares, highlight outlines, and scene transitions. A physics scene should later be able to reuse typography and timing alongside SVG plots, arrows, and equations; do not build a physics simulation in the first milestone.
- Drive animation from Remotion's frame and fps APIs, with deterministic scene data. Avoid wall-clock time, unseeded randomness, CSS animations, and browser `requestAnimationFrame` as sources of animation timing so preview and render agree.
- Keep text inside a consistent safe margin, use readable contrast and font sizes at 1080p, and hold each explanatory state long enough to read. Use licensed, locally available fonts or a documented fallback; avoid network-dependent assets in renders.
- Organize each video as scenes with explicit frame boundaries. Support changes to copy, colors, timing, and diagram data without rewriting the composition. Validate any external props and fail clearly for invalid input.
- If narration is supplied, align scene events to the recording, avoid clipping, and review the mix. Supply a transcript or captions with published narrated videos; do not claim an automatic captioning feature exists in this phase.

## Developer interface

Implement and document these scripts in `video/package.json`, confirming exact flags against the pinned version:

| Script | Outcome |
| --- | --- |
| `bun run studio` | Open local Remotion Studio to preview and scrub compositions. |
| `bun run render:sample` | Render `TeamCuts` to `video/out/team-cuts.mp4` at the default dimensions and frame rate. |
| `bun run render:preview` | Render a smaller preview to a distinct filename. |
| `bun run still:sample` | Export a representative frame to `video/out/team-cuts.png`. |
| `bun run check` | Type-check the project and run focused tests, if added. |

Run these from `video/` after `bun install --frozen-lockfile`. The README must cover first-time browser setup, supported operating systems, the actual commands, where output goes, and troubleshooting. Remotion normally downloads Chrome Headless Shell for rendering; make this prerequisite explicit and do not assume the Playwright browser installed for the site is interchangeable. Check the pinned release's runtime requirements on the target machine.

## Publishing workflow

1. Review the MP4 from beginning to end for accuracy, pacing, legibility, narration sync, audio, and rights to all assets. Inspect the thumbnail at small size. Check playback and metadata with a media player or `ffprobe`.
2. For YouTube, upload using the creator's normal workflow and add an article using the existing Hugo shortcode and the actual video ID. Include a transcript or captions and a text summary.
3. For a self-hosted video, first verify the chosen account, endpoint, public access, destination, MIME type (`video/mp4`), and overwrite behavior. Publish deliberately to the production static website only when ready for public access. Link from a Hugo page using a descriptive label and a site-hosted thumbnail with meaningful alt text. Public assets must contain no private information. Follow [sample storage](sample-data-storage.md) and use Azure identity-based access; do not place keys or SAS tokens in source or public URLs.
4. Run the existing site build and relevant checks when adding a page or thumbnail. Site deployment and video publication are separate operations; a newly deployed page must not refer to an unavailable video. Because the same site artifact is promoted through environments, any hard-coded production URL is visible in all environments, as with Particle Storm.

## Verification and acceptance

- A clean checkout can install video dependencies with the committed lockfile, launch Studio, and render the sample and still with the documented commands.
- The resulting MP4 is 1920 × 1080, 30 fps, H.264, 20–30 seconds, and plays through without missing assets or broken frames. If audio is included, verify its presence and synchronization; silence is acceptable for the first sample if documented.
- Sample demonstrates animated labels, a repeated grid, a clear highlight, and a comparison with readable final state. Review opening, midpoint, and final stills as well as motion in the full video.
- Re-rendering with the same inputs preserves scene content and timing; bit-identical encoded files across machines are not required.
- Existing site build and tests continue to run without video dependencies or a video render. No generated MP4 or secret appears in Git or the site release artifact.
- If a publishing example is added, verify the actual deployed page, video access, and captions/transcript separately; this is not required to accept the local authoring milestone.

## Implementation sequence

1. Confirm the local machine meets the selected Remotion version's prerequisites and check license eligibility. Scaffold the isolated Bun project, pin versions, and commit the lockfile.
2. Add theme tokens, reusable components, and the `TeamCuts` composition. Add scripts and author documentation.
3. Render and review the sample, preview, and still. Correct visual and timing defects, and run the existing site checks appropriate to changed files.
4. Once the sample is approved, choose a real article or topic, write its script and storyboard, and produce the first narrated explainer. Choose YouTube or Azure hosting per video; provision or change infrastructure through the separately managed infrastructure repository only when needed.

## References and licensing

- [Remotion setup and system requirements](https://www.remotion.dev/docs), [Bun support](https://www.remotion.dev/docs/bun), [rendering](https://www.remotion.dev/docs/render), and [coding-agent workflow](https://www.remotion.dev/docs/ai/coding-agents).
- Remotion is source-available under its own license, not OSI open source. Its [license FAQ](https://www.remotion.dev/docs/license/faq) says individuals can qualify for free use, including commercial use; verify current terms and eligibility before implementation or any organizational use. Rendering and license-key requirements can change with the selected version.
- Manim is a possible later addition for mathematical scenes, but is not a dependency or a requirement of this implementation.
