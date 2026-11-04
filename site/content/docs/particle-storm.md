---
title: "🌀 Particle Storm — Rust + WASM"
description: "JavaScript is fast, but for tight inner loops updating thousands of particles per frame, Rust's zero-cost abstractions and LLVM-optimized WASM output provide measurably smoother animation. The particle update loop…"
space: "Working examples"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/particle-storm.html"
demo: "/particles.html"
---

**3,000 particles** simulated at 60fps entirely in Rust, compiled to WebAssembly. Gravity wells orbit the center, pulling particles into swirling color trails.



## Why Rust + WASM?



JavaScript is fast, but for tight inner loops updating thousands of particles per frame, Rust's zero-cost abstractions and LLVM-optimized WASM output provide measurably smoother animation. The particle update loop touches 3,000 structs × 4 gravity wells = 12,000 force calculations per frame — perfect for WASM.



## Architecture



The `ParticleSystem` struct owns all state: particles, gravity wells, and the Canvas 2D context (via `web-sys`). JavaScript calls `tick(dt)` and `render()` each frame via `requestAnimationFrame`. No data crosses the JS↔WASM boundary except scalars.



## Interaction



Click/tap anywhere on the canvas to reposition the fourth gravity well as an attractor. The well's hue cycles with time, creating dynamic color shifts in nearby particles. Touch events use `passive: false` to prevent scroll interference on mobile.



## Key Techniques



- **Fade trail** — Drawing a semi-transparent black rect each frame creates the comet-tail effect

- **HSLA coloring** — Particles shift hue toward their nearest gravity well

- **Speed-based brightness** — Faster particles glow brighter

- **Orbital wells** — Wells follow parametric curves for organic motion




## Build



```text
wasm-pack build rust/particles --target web --out-dir ../../resources/public/wasm/particles
```
