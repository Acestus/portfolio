---
title: "Tech Breakout — Smashing Through Azure Services"
description: "Brick-breaker where bricks are Azure services and the paddle stands in for a delivery pipeline keeping the platform alive. The implementation is a clean example of small-game physics in ClojureScript: explicit ball…"
space: "Working examples"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/tech-breakout.html"
demo: "/breakout.html"
---

> Brick-breaker where bricks are Azure services and the paddle stands in for a delivery pipeline keeping the platform alive. The implementation is a clean example of small-game physics in ClojureScript: explicit ball velocity, wall and paddle bounce rules, brick collision reduction, and a data-driven 4×5 service grid rendered entirely on canvas.



- **20** — Azure Services

- **4** — Rows

- **Ball** — Physics State

- **AABB** — Collision Detection



Move Paddle→ Advance Ball→ Wall / Paddle Bounce→ Brick Hit→ Score / Win State



## Game Design



Breakout is structurally perfect for platform storytelling because it already models sustained throughput. A paddle repeatedly catches work, redirects it upward, and gradually clears a backlog. Here the backlog is a service catalog: Functions, Storage, Key Vault, VNET, AKS, Sentinel, Fabric, Event Hub, APIM, Entra, Monitor, Bicep, DevOps, Policy, DNS, Firewall, CDN, SQL, Cosmos, and Redis.



Each brick is a small map containing position, dimensions, label, color, and an `:alive` flag. That means the render loop can stay simple: iterate the vector and draw only live bricks. There is no DOM diffing, no sprite graph, and no asset pipeline—just pure state and immediate-mode rendering.



## Azure Service Taxonomy



The service set is intentionally broad. It spans runtime, identity, networking, governance, data, edge, and observability. That variety makes the board feel like a miniature cloud platform rather than a single workload demo. It also reinforces that platform engineering is about orchestration across domains, not heroics inside one service.



| Category | Examples In The Board | Operational Meaning |
| --- | --- | --- |
| Compute | Functions, AKS | Where workloads execute |
| Data | SQL, Cosmos, Redis, Storage | Persistence and low-latency state |
| Security & Governance | Sentinel, Policy, KeyVault, Entra | Control plane and trust boundaries |
| Networking & Edge | VNET, Firewall, CDN, DNS, APIM | Connectivity, ingress, and traffic control |
| Platform Tooling | Bicep, DevOps, Fabric, Monitor, EventHub | Delivery, telemetry, and data movement |



## Physics Engine



The physics are intentionally straightforward and therefore easy to explain. The ball stores `:x`, `:y`, `:vx`, and `:vy`. Every frame advances position by velocity times delta time, then checks wall constraints, then paddle collision, then brick overlap. When a collision occurs, the vertical velocity flips sign.



```text
[bricks score-add vy2]
(reduce
  (fn [[bs sc v] brick]
    (if (and (:alive brick) (aabb? {:x bx :y by :w 10 :h 10} brick))
      [(mapv #(if (= % brick) (assoc % :alive false) %) bs)
       (+ sc 100)
       (- v)]
      [bs sc v]))
  [(:bricks state) 0 vy]
  (:bricks state))
```



That reduction is a nice example of functional game logic. The code does not mutate a brick in place. It derives a new brick vector, a new score increment, and a new velocity from the same pass. The result is compact, predictable, and very easy to debug.



## ClojureScript Canvas



Like the other arcade demos, Breakout rides on a shared engine that owns canvas creation, keyboard state, drawing helpers, and the requestAnimationFrame loop. The game namespace only defines the rules specific to paddle motion and collisions. That separation is exactly what you want in a portfolio codebase: shared primitives in one place, showcase behavior in another.



The canvas choice also keeps latency low. Labels are drawn directly inside each brick, HUD text comes from a single helper, and the win or game-over overlays are just additional draw calls. No component hierarchy is needed because the scene is fully recomputed every frame from the current state atom.
