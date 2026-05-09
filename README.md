# Portfolio — acestus.com

Interactive portfolio showcasing Azure, Fabric, Clojure, and cloud platform engineering.

## 10 SPAs

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

## Tech Stack

- **ClojureScript** + shadow-cljs (multi-build)
- **SCI** (Small Clojure Interpreter) for the REPL
- **Azure Static Web Apps** for hosting
- **Bicep** for infrastructure
- **GitHub Actions** for CI/CD

## Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Build

```bash
npm run release
```

## Architecture

Each SPA is a separate shadow-cljs build targeting its own HTML entry point.
Shared code lives in `portfolio.core` and `portfolio.components`.
Games share `portfolio.games.engine` for canvas, input, and game loop.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
