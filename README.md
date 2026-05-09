# Portfolio — acestus.com

Interactive portfolio showcasing Azure, Fabric, Clojure, Rust+WASM, and cloud platform engineering.

## 16 SPAs

### Retro Arcade Games (80's theme)
1. **Cloud Platformer** — Navigate cloud infrastructure in 8-bit glory
2. **Space Invaders** — Defend against security misconfigurations
3. **CAF Naming Puzzle** — Match resources to CAF-compliant names
4. **Tech Breakout** — Smash through Azure-themed bricks

### Professional Dashboards (Enterprise theme)
5. **Fabric Medallion Pipeline** — Bronze → Silver → Gold with DAX/TMDL
6. **Azure Policy Governance** — Policy tree with deny/modify/audit/DINE
7. **Real-Time Log Pipeline** — Event Hub → Eventhouse → KQL
8. **IaC Deployment Pipeline** — GitHub Actions → OIDC → Bicep AVM → Deployment Stacks
9. **Platform Engineering Console** — Workspace provisioning, Copilot agents, PIM
10. **ClojureScript REPL** — Live in-browser evaluation powered by SCI
11. **Architecture Studio** — Interactive C4 models and ADR browser (Fowler-inspired)
12. **The Agentic Web** — How MCP/OpenClaw is the HTTP of AI agents (Steinberger-inspired)

### Rust + WASM Demos
13. **Particle Storm** — Thousands of particles with gravity wells and color trails
14. **Raytracer** — Real-time progressive ray-traced scene in your browser
15. **Game of Life** — Massive Conway grid at 60fps showing WASM performance

## Tech Stack

- **ClojureScript** + shadow-cljs (multi-build)
- **Rust** + wasm-pack (wasm32-unknown-unknown)
- **SCI** (Small Clojure Interpreter) for the REPL
- **Azure Static Web Apps** for hosting
- **Bicep** for infrastructure (CAF naming)
- **GitHub Actions** for CI/CD (OIDC, trunk-based)

## Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Rust WASM builds

```bash
cd rust && cargo build --target wasm32-unknown-unknown
wasm-pack build rust/particles --target web --out-dir ../../resources/public/wasm/particles
wasm-pack build rust/raytracer --target web --out-dir ../../resources/public/wasm/raytracer
wasm-pack build rust/life --target web --out-dir ../../resources/public/wasm/life
```

## Build

```bash
npm run release
```

## Architecture

Each SPA is a separate shadow-cljs build targeting its own HTML entry point.
Shared code lives in `portfolio.core` and `portfolio.components`.
Games share `portfolio.games.engine` for canvas, input, and game loop.
Rust demos compile to WASM and load via ES module imports.
CSS follows Kevin Powell's modern approach: custom properties, fluid type
with `clamp()`, logical properties, and `prefers-reduced-motion` support.
