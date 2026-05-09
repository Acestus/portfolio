---
description: "Core coding principles for ClojureScript SPAs. Applies Rich Hickey's philosophy: simplicity, immutability, small pure functions, data-oriented design."
applyTo: "src/**/*.cljs"
---

# ClojureScript Coding Guidelines

## Core Principles (Rich Hickey Philosophy)

1. **Simple over easy** — Prefer decomplected solutions. Avoid interleaving concerns.
2. **Data over objects** — Use plain maps and vectors. Avoid stateful constructs unless necessary.
3. **Pure functions** — Default to pure functions. Isolate side effects at the edges.
4. **Small functions** — Each function does one thing. 10–15 lines max.
5. **Immutability first** — Use atoms only when mutation is required (game state, UI state).

## Naming

- Namespaces: `portfolio.{category}.{name}` (e.g., `portfolio.games.platformer`)
- Functions: lowercase-kebab-case, verb-first (e.g., `update-player`, `render-hud`)
- Private functions: prefix with `-` via `defn-`
- Constants: `def ^:private` with descriptive names
- Predicates: end with `?` (e.g., `key-held?`, `alive?`)

## Structure

- `def` and `defonce` at top of namespace
- `defn-` (private) before `defn` (public)
- Public `init` function as the entry point for each SPA
- Group related functions with comment banners: `;; --- Section ---`

## State Management

- One atom per SPA for app state
- `swap!` with pure update functions — never `reset!` with computed values
- Game state: `{:player {} :score 0 :phase :playing}`
- Dashboard state: `{:filter :all :active-tab :default}`

## DOM Interaction

- Use `portfolio.core/create-el` for element creation
- Use `portfolio.core/mount!` for root mounting
- Minimize direct DOM mutation — prefer rebuilding sections

## Anti-Patterns

- No `js/eval` or dynamic code construction
- No `def` inside functions
- No deeply nested `let` blocks (3 levels max)
- No string concatenation for HTML — use `create-el`
