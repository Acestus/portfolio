# ADR-004: ClojureScript for portfolio frontend

**Status:** Accepted  
**Date:** 2025-01

## Context

Portfolio needs interactive SPAs. Team expertise is in Clojure. Rich Hickey's philosophy of simplicity and data-orientation aligns with our values.

## Decision

Use ClojureScript with shadow-cljs for all portfolio SPAs. Vanilla DOM manipulation (no React). SCI for in-browser REPL evaluation.

## Consequences

- Consistent language across backend and frontend
- Smaller community than React/Vue — fewer library options
- shadow-cljs provides excellent JS interop
- Functional approach produces simpler, more testable code
