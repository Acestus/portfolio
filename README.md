# Portfolio — acestus.com

Interactive portfolio showcasing Azure, Microsoft Fabric, Clojure, Rust+WASM, and cloud platform engineering. Refreshed for **Microsoft Build 2026** with new SPAs and deep-dive articles on file-driven AI ops, Fabric capacity tuning, and FinOps across Azure + Fabric + AI Foundry.

## 21 SPAs

### Retro Arcade Games (80's theme)
1. **Cloud Platformer** — Navigate cloud infrastructure in 8-bit glory
2. **Space Invaders** — Defend against security misconfigurations
3. **CAF Naming Puzzle** — Match resources to CAF-compliant names
4. **Tech Breakout** — Smash through tech-themed bricks
5. **Cloud Lift** — Migrate workloads to the cloud, one rescue at a time

### 🆕 Microsoft Build 2026
6. **Workflow Toolkit** — File-driven AI ops · open source at `acestus/workflow-toolkit`
7. **Copilot-Ops Console** — Rounds · voice wall · markdown↔API sync
8. **Fabric Capacity Tuner** — Size F2–F64 · simulate 430 throttling · cut waste
9. **Pricing Optimizer** — Azure · Fabric · AI Foundry FinOps with RI / Savings Plans

### Professional Dashboards (Enterprise theme)
10. **Fabric Pipeline** — Medallion architecture: Bronze → Silver → Gold
11. **M365 Administration** — Entra, Intune, JML workflows, access packages, Copilot governance
12. **Policy Dashboard** — Azure Policy at scale: modify, audit, deny, DINE
13. **Log Pipeline** — Real-time Event Hub → Eventstream → Eventhouse → KQL
14. **IaC Pipeline** — Bicep AVM → OIDC → Deployment Stacks, trunk-based
15. **Platform Console** — Self-service workspace provisioning, PIM-gated access
16. **Clojure REPL** — Live in-browser ClojureScript evaluation (SCI)
17. **Architecture Studio** — C4 models, ADRs, diagrams-as-code (PlantUML + Mermaid)
18. **The Agentic Web** — MCP servers, skills, and the operator-in-the-loop model

### Rust + WASM Demos
19. **Particle Storm** — Thousands of particles with gravity wells and color trails
20. **Raytracer** — Real-time progressive ray-traced scene in your browser
21. **Game of Life** — Massive Conway grid at 60fps showing WASM performance

## Articles

Every Pro SPA is paired with a long-form article (250–320 lines) grounded in production patterns: Fabric medallion architecture, IaC with AVM and OIDC, KQL log pipelines, agentic skills, file-driven AI ops, and more. All articles are sanitized — no internal IDs, names, or tenants.

## Tech Stack

- **ClojureScript** + shadow-cljs (21-build monorepo)
- **Rust** + wasm-pack (wasm32-unknown-unknown)
- **SCI** (Small Clojure Interpreter) for the REPL
- **Azure Static Web Apps** for hosting
- **Bicep AVM** for infrastructure (CAF naming, Deployment Stacks)
- **GitHub Actions** with OIDC federated identity (no long-lived secrets)

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
wasm-pack build rust/life       --target web --out-dir ../../resources/public/wasm/life
```

## Build

```bash
npm run release
```

## Architecture

Each SPA is a separate shadow-cljs build targeting its own HTML entry point. Shared code lives in `portfolio.core` and `portfolio.components`. Games share `portfolio.games.engine` for canvas, input, and game loop. Rust demos compile to WASM and load via ES module imports. CSS uses custom properties, fluid type with `clamp()`, logical properties, and `prefers-reduced-motion` support.

## Microsoft Build 2026

Visiting Build in person on **2026-05-30**. The four MS Build 2026 SPAs are the live talk track:

1. **Workflow Toolkit** — proof that file-driven AI ops generalizes beyond a single operator
2. **Copilot-Ops Console** — what the rounds model looks like when you watch it work
3. **Fabric Capacity Tuner** — practical CU sizing and 430-throttling remediation
4. **Pricing Optimizer** — full FinOps across Azure + Fabric + AI Foundry with RI / Savings Plans

The open-source workflow toolkit referenced on this site lives at **[acestus/workflow-toolkit](https://github.com/Acestus/workflow-toolkit)**.
