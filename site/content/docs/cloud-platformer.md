---
title: "Cloud Platformer — Navigating Azure Infrastructure"
description: "Retro 8-bit game where you collect Azure resource icons across cloud platforms. Under the hood it is a compact ClojureScript canvas game: a single atom holds world state, requestAnimationFrame drives updates, and a…"
space: "Working examples"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/cloud-platformer.html"
demo: "/platformer.html"
---

> Retro 8-bit game where you collect Azure resource icons across cloud platforms. Under the hood it is a compact ClojureScript canvas game: a single atom holds world state, requestAnimationFrame drives updates, and a shared engine handles keyboard, touch, HUD rendering, and AABB collision tests.



- **5** — Platforms

- **5** — Collectibles

- **60fps** — Canvas Loop Target

- **Touch** — Optimized Controls



Input→ State Atom→ Physics Update→ Collision Checks→ Canvas Render



## Game Design



The level is intentionally small and legible: a 480×320 canvas, six static platforms, and one player rectangle with explicit velocity, grounded state, and collectible progress. The design goal is not procedural complexity; it is teaching motion through infrastructure. Each jump is a tiny routing exercise across the cloud topology.



Movement is deterministic and frame-rate aware. The update loop applies input, then gravity, then motion, then platform collision resolution. Gravity is expressed in pixels per second squared, horizontal velocity snaps to fixed left/right values, and jump impulse only fires while the player is grounded. That keeps the rules arcade-simple while still feeling responsive on desktop and mobile.



```text
(-> state
    (update :player #(-> %
                         (apply-input touch-state)
                         (apply-gravity dt)
                         (move-player dt)
                         (collide-platforms (:platforms state))
                         clamp-bounds))
    collect-items)
```



## Azure Resource Icons



The collectibles are emoji-backed resource markers rather than sprite sheets: ⚡, ☁, 🔒, ⚙, and ★. That is a clever tradeoff for a portfolio game. It avoids asset loading, keeps the build self-contained, and still communicates compute, cloud, security, operations, and completion semantics instantly.



| Icon | Infrastructure Reading | Why It Works In-Game |
| --- | --- | --- |
| ⚡ | Compute or execution trigger | Placed early to teach the first jump rhythm |
| ☁ | Core cloud landing zone | Signals the middle of the route |
| 🔒 | Security control or protected service | Adds meaning to higher-risk jumps |
| ⚙ | Operations and configuration | Connects gameplay to platform engineering |
| ★ | Goal state or production-ready completion | Acts as the last reward and win trigger |



Collection is done with the same axis-aligned bounding box test used for platforms. When player and item rectangles overlap, the item is marked `:collected true` and score increments by 100. The win condition is simply `every? :collected`, which makes the game state machine very easy to reason about.



## ClojureScript Game Engine



The strongest architectural choice is reuse. This page sits on top of a shared engine namespace that creates canvases, keeps a `keys-down` atom, exposes `aabb?` for collision detection, and provides a generic `game-loop` wrapper over `requestAnimationFrame`. The game code stays focused on platforming rules instead of browser plumbing.



That separation also makes the SPA portfolio coherent. Platformer, Invaders, Matcher, and Breakout all inherit the same rendering and timing model, so each article can talk about different mechanics without hiding the common implementation discipline underneath.



## Canvas & Input System



Keyboard support uses browser keydown/keyup listeners and a set-backed atom. Touch support is implemented as a virtual d-pad appended beside the canvas. Each button updates a touch-state atom on `touchstart` and `touchend`, letting the game treat touch and keyboard as equivalent input channels.



That detail matters: it means the platformer is not just visually responsive at the 768px breakpoint; the interaction model is mobile-aware too. Combined with canvas bounds clamping and a lightweight HUD, the game remains readable even when embedded in a portfolio page rather than a dedicated fullscreen shell.
