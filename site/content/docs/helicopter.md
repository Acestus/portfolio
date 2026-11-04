---
title: "🚁 Choplifter — Rescue Mission"
description: "TL;DR: A homage to the classic 1982 Choplifter by Broderbund. Fly your helicopter into enemy territory, land near buildings to rescue hostages, and fly them back to base — while dodging tanks and jets. Built in…"
space: "Working examples"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/helicopter.html"
demo: "/helicopter.html"
---

> **TL;DR:** A homage to the classic 1982 Choplifter by Broderbund. Fly your helicopter into enemy territory, land near buildings to rescue hostages, and fly them back to base — while dodging tanks and jets. Built in ClojureScript with HTML5 Canvas.



## 1. How to Play



- **Move:** Arrow keys or `WASD`

- **Shoot:** `Space`

- **Mobile:** Tap left/right half to move, top half to ascend, double-tap to shoot

- **Land** near buildings — hostages will run out and board your helicopter

- **Capacity:** You can carry up to 8 hostages at a time

- **Return** to the green `H` base pad on the left to drop off hostages

- **Win** by rescuing all hostages

- **Avoid** enemy tanks and jets — one hit and you're down!




## 2. Game Architecture



Pure functional state management — the entire game state is a single immutable map updated each frame:



- **Physics:** Gravity at 350 px/s², thrust at -500 px/s², horizontal speed 200 px/s

- **Camera:** Smooth-follow camera pans with the helicopter across the world

- **Hostages:** State machine per hostage: `:inside` → `:running` → `:boarding` → `:boarded` → dropped at base

- **Enemies:** Tanks patrol and fire when you're nearby, jets strafe across the screen

- **Collision:** AABB rectangle overlap for all entities

- **PRNG:** Deterministic xorshift for reproducible level generation




## 3. Visual Style



Retro arcade aesthetic with neon glow effects: cyan helicopter with animated rotor blur, green ground line with glow, orange hostage sprites, red enemy vehicles with shadow glow, and explosion particles. Parallax mountains scroll in the background.



## 4. Original Choplifter



Choplifter was designed by Dan Gorlin and published by Broderbund Software in 1982 for the Apple II. It pioneered the rescue-mission genre and was later ported to nearly every platform. The core loop — fly in, land, load passengers, fly home — remains one of gaming's most satisfying gameplay patterns.
