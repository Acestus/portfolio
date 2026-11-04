---
title: "🔮 Raytracer — Rust + WASM"
description: "For each pixel, a ray is cast from the camera through the image plane into the scene. The ray tests intersection against every sphere. At the hit point, we compute lighting (diffuse + specular) from two point lights,…"
space: "Working examples"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/raytracer.html"
demo: "/raytracer.html"
---

A real-time ray tracer rendering a 640×480 scene with **5 spheres**, **reflections**, **shadows**, and an orbiting camera — all computed per-pixel in Rust, compiled to WASM.



## How Ray Tracing Works



For each pixel, a ray is cast from the camera through the image plane into the scene. The ray tests intersection against every sphere. At the hit point, we compute lighting (diffuse + specular) from two point lights, check shadows, and recursively trace reflected rays up to 3 bounces deep.



## Scene



| Object | Color | Specular | Reflective |
| --- | --- | --- | --- |
| Ground plane | Gray | 10 | 15% |
| Azure sphere | Blue | 80 | 40% |
| Green sphere | Green | 200 | 60% |
| Red sphere | Red | 50 | 20% |
| Gold sphere | Yellow | 120 | 50% |



## Performance



At 640×480 = 307,200 pixels per frame, each requiring sphere intersections, shadow rays, and reflection bounces, this is a *lot* of math. Rust compiles to tight WASM that typically achieves 3-8 fps depending on device — impressive for a brute-force per-pixel raytracer running in a browser tab.



## Implementation Details



- `Vec3` — minimal vector math (dot, normalize, reflect, scale)

- `ImageData` — pixel buffer written directly to canvas via `put_image_data`

- `Clamped<&[u8]>` — zero-copy buffer transfer from Rust to Canvas API

- Camera orbits the scene using `sin/cos` of elapsed time




## Build



```text
wasm-pack build rust/raytracer --target web --out-dir ../../resources/public/wasm/raytracer
```
