---
title: "Space Invaders — Defending Against Misconfigurations"
description: "Classic space invaders reskinned with Azure security threats as enemies. The SPA turns governance failures into a readable threat catalog, then implements the game loop with a compact ClojureScript state machine:…"
space: "Working examples"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/space-invaders.html"
demo: "/invaders.html"
---

> Classic space invaders reskinned with Azure security threats as enemies. The SPA turns governance failures into a readable threat catalog, then implements the game loop with a compact ClojureScript state machine: invader grid generation, bullet lists, collision reduction, timed movement, and cooldown-gated firing.



- **32** — Invaders

- **5** — Threat Types

- **3** — Power-up Types

- **Keyboard + Touch** — Control Design



Threat Catalog→ 4×8 Spawn Grid→ Bullet Update→ AABB Hit Test→ Threat Neutralized



## Security Threat Model



The enemy roster is the best part of the theme. Instead of anonymous aliens, each invader is a recognizable cloud failure mode: Open Port, Public Blob, No MFA, No NSG, and No Backup. In real Azure estates, these categories map directly to preventable incidents: widened attack surface, data exposure, weak identity posture, flat networks, and poor recoverability.



| Threat | Azure Interpretation | Why It Fits The Arcade Metaphor |
| --- | --- | --- |
| Open Port | Unnecessary inbound exposure | Fast-moving, obvious perimeter weakness |
| Public Blob | Data exposed outside intended boundary | High-visibility target with immediate risk |
| No MFA | Weak identity protection | Small control gap with outsized blast radius |
| No NSG | Missing network segmentation | Lets threats advance unchecked |
| No Backup | Poor resilience and recovery posture | Turns a single hit into a lasting outage |



## Game Mechanics



The implementation generates 32 invaders from nested row and column loops. Each invader carries position, size, color, label, and an `:alive` flag, which means there is no need for object mutation or removal from the array mid-frame. The game simply keeps the full vector and flips state when a threat is cleared.



Movement is intentionally chunky, like the original arcade game. Every 0.8 seconds, living invaders shift horizontally by 20 pixels. Player motion is analog by comparison: each frame computes left or right velocity from held keys and clamps the ship to the canvas width. Firing is controlled by a 0.2 second cooldown so the pace feels deliberate instead of spammy.



```text
[invaders2 bullets2 score-add]
(reduce
  (fn [[invs buls sc] bullet]
    (if-let [hit (first (filter #(and (:alive %) (aabb? bullet %)) invs))]
      [(mapv #(if (= % hit) (assoc % :alive false) %) invs)
       buls
       (+ sc 50)]
      [invs (conj buls bullet) sc]))
  [invaders [] 0]
  bullets)
```



## Power-up System



The current demo defines three power-up types—Sentinel, WAF, and Defender—even though the core build focuses on shooting and collision rather than drop collection. That is still meaningful. It shows the state model already has room for deeper mechanics such as temporary shielding, wider projectiles, or threat suppression zones.



From a design standpoint, that is a good portfolio choice: ship the stable loop first, expose the extension points in code, and let the article explain where the architecture can grow without pretending unfinished features are already live.



## Real-World Parallels



The metaphor works because platform teams really do spend large amounts of time eliminating repeated, low-creativity defects. Space Invaders captures that pattern: threats arrive in waves, the operator acts with limited bandwidth, and success depends on clearing classes of misconfiguration before they become systemic.



Technically, the SPA mirrors that discipline. Threats are data, not hard-coded render branches. Scoring is derived from events, not from UI state. Victory is computed by checking whether every invader is no longer alive. That same mindset—make controls declarative, measure outcomes, keep state obvious—is exactly what makes cloud governance scalable.
