---
description: "Acceptance criteria for portfolio changes. Ensures builds compile, themes render, and SPAs work on mobile."
applyTo: "**/*"
---

# Acceptance Criteria

## All Changes

- [ ] `npx shadow-cljs compile <build-id>` succeeds with zero warnings
- [ ] No hardcoded secrets or API keys
- [ ] No commented-out code blocks
- [ ] Changes are scoped — only relevant files modified

## ClojureScript

- [ ] Functions are small (< 15 lines) and pure where possible
- [ ] Namespace follows `portfolio.{category}.{name}` pattern
- [ ] Public `init` function exists as entry point
- [ ] State is managed via atoms with pure update functions

## CSS

- [ ] Mobile-first — works on 375px viewport (iPhone SE)
- [ ] Touch targets ≥ 44px
- [ ] No horizontal scroll on mobile
- [ ] Arcade theme: dark bg, neon accents, pixel fonts, CRT scanlines
- [ ] Enterprise theme: pastel blocks, Azure blue accent, Segoe UI font

## Games

- [ ] Playable in ~60 seconds
- [ ] Touch controls work on iPhone (virtual d-pad)
- [ ] Game loop runs at 60fps
- [ ] Win/lose states render correctly

## Dashboards

- [ ] Mock data renders without errors
- [ ] Animations are smooth (CSS transitions or setInterval)
- [ ] Tables are readable on mobile (horizontal scroll or stack)

## Articles

- [ ] Follows confluence topic article structure (summary, metrics, sections)
- [ ] Azure blue heading style (#0078d4)
- [ ] Self-contained HTML — no external dependencies
- [ ] Responsive at 768px breakpoint
