use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

const W: f64 = 800.0;
const H: f64 = 600.0;
const NUM_PARTICLES: usize = 3000;
const NUM_WELLS: usize = 4;
const BURST_DURATION: f64 = 3.0; // seconds particles ignore gravity and radiate outward on tap

struct Particle {
    x: f64,
    y: f64,
    vx: f64,
    vy: f64,
    hue: f64,
    life: f64,
}

struct GravityWell {
    x: f64,
    y: f64,
    strength: f64,
    hue: f64,
}

struct Ripple {
    x: f64,
    y: f64,
    age: f64,
    duration: f64,
    max_radius: f64,
}

#[wasm_bindgen]
pub struct ParticleSystem {
    particles: Vec<Particle>,
    wells: Vec<GravityWell>,
    ctx: CanvasRenderingContext2d,
    time: f64,
    seed: u32,
    burst_timer: f64, // when > 0, ignore gravity wells and radiate outward
    ripples: Vec<Ripple>,
}

fn pseudo_random(seed: &mut u32) -> f64 {
    *seed ^= *seed << 13;
    *seed ^= *seed >> 17;
    *seed ^= *seed << 5;
    (*seed as f64) / u32::MAX as f64
}

#[wasm_bindgen]
impl ParticleSystem {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement) -> Result<ParticleSystem, JsValue> {
        let ctx = canvas
            .get_context("2d")?
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()?;
        canvas.set_width(W as u32);
        canvas.set_height(H as u32);

        let mut seed: u32 = 42;
        let mut particles = Vec::with_capacity(NUM_PARTICLES);
        for _ in 0..NUM_PARTICLES {
            particles.push(Particle {
                x: pseudo_random(&mut seed) * W,
                y: pseudo_random(&mut seed) * H,
                vx: (pseudo_random(&mut seed) - 0.5) * 2.0,
                vy: (pseudo_random(&mut seed) - 0.5) * 2.0,
                hue: pseudo_random(&mut seed) * 360.0,
                life: pseudo_random(&mut seed),
            });
        }

        let wells = vec![
            GravityWell { x: W * 0.25, y: H * 0.25, strength: 80.0, hue: 190.0 },
            GravityWell { x: W * 0.75, y: H * 0.25, strength: 60.0, hue: 320.0 },
            GravityWell { x: W * 0.5,  y: H * 0.75, strength: 100.0, hue: 50.0 },
            GravityWell { x: W * 0.5,  y: H * 0.4,  strength: -40.0, hue: 130.0 },
        ];

        Ok(ParticleSystem { particles, wells, ctx, time: 0.0, seed, burst_timer: 0.0, ripples: Vec::new() })
    }

    pub fn tick(&mut self, dt: f64) {
        self.time += dt;

        // Orbit gravity wells slowly (use dynamic count so new wells behave)
        let n_wells = if self.wells.len() == 0 { 1 } else { self.wells.len() } as f64;
        for (i, well) in self.wells.iter_mut().enumerate() {
            let angle = self.time * 0.3 + (i as f64) * std::f64::consts::TAU / n_wells;
            let cx = W * 0.5;
            let cy = H * 0.5;
            let r = 120.0 + 60.0 * ((self.time * 0.1 + i as f64).sin());
            well.x = cx + r * angle.cos();
            well.y = cy + r * angle.sin();
        }

        // Decrease burst timer if active
        if self.burst_timer > 0.0 {
            self.burst_timer -= dt;
            if self.burst_timer < 0.0 { self.burst_timer = 0.0; }
        }

        // Update ripples (expanding circles) and remove finished ones
        for r in self.ripples.iter_mut() {
            r.age += dt;
        }
        self.ripples.retain(|r| r.age < r.duration);

        for p in self.particles.iter_mut() {
            if self.burst_timer <= 0.0 {
                // Gravity from wells
                for well in &self.wells {
                    let dx = well.x - p.x;
                    let dy = well.y - p.y;
                    let dist_sq = dx * dx + dy * dy + 100.0;
                    let force = well.strength / dist_sq;
                    p.vx += dx * force * dt;
                    p.vy += dy * force * dt;
                }
            } else {
                // During burst, lightly preserve outward velocity (no well forces)
                p.vx *= 0.995;
                p.vy *= 0.995;
            }

            // Damping
            p.vx *= 0.998;
            p.vy *= 0.998;

            p.x += p.vx;
            p.y += p.vy;

            // Wrap
            if p.x < 0.0 { p.x += W; }
            if p.x > W { p.x -= W; }
            if p.y < 0.0 { p.y += H; }
            if p.y > H { p.y -= H; }

            // Color shift towards nearest well (still update hue)
            let mut min_dist = f64::MAX;
            let mut nearest_hue = p.hue;
            for well in &self.wells {
                let dx = well.x - p.x;
                let dy = well.y - p.y;
                let d = dx * dx + dy * dy;
                if d < min_dist {
                    min_dist = d;
                    nearest_hue = well.hue;
                }
            }
            p.hue += (nearest_hue - p.hue) * 0.01;

            // Speed-based life for brightness
            p.life = (p.vx * p.vx + p.vy * p.vy).sqrt().min(3.0) / 3.0;
        }
    }

    pub fn render(&self) {
        // Fade trail
        self.ctx.set_global_alpha(0.08);
        self.ctx.set_fill_style_str("black");
        self.ctx.fill_rect(0.0, 0.0, W, H);

        self.ctx.set_global_alpha(1.0);
        for p in &self.particles {
            let alpha = 0.3 + p.life * 0.7;
            let size = 1.0 + p.life * 2.0;
            let color = format!("hsla({:.0}, 90%, {:.0}%, {:.2})", p.hue, 50.0 + p.life * 30.0, alpha);
            self.ctx.set_fill_style_str(&color);
            self.ctx.fill_rect(p.x, p.y, size, size);
        }

        // Draw wells as glowing circles
        for well in &self.wells {
            let r = (well.strength.abs() * 0.15).max(4.0);
            self.ctx.begin_path();
            let _ = self.ctx.arc(well.x, well.y, r, 0.0, std::f64::consts::TAU);
            let color = format!("hsla({:.0}, 100%, 70%, 0.6)", well.hue);
            self.ctx.set_fill_style_str(&color);
            self.ctx.fill();
        }

        // Draw retro neon green ripples emitted on tap
        for rip in &self.ripples {
            let t = (rip.age / rip.duration).min(1.0);
            let r = rip.max_radius * t;
            let alpha = f64::max(1.0 - t, 0.0);
            for i in 0..3 {
                let ring_r = r * (1.0 + i as f64 * 0.12);
                let lw = 8.0 / (i as f64 + 1.0);
                self.ctx.begin_path();
                let _ = self.ctx.arc(rip.x, rip.y, ring_r, 0.0, std::f64::consts::TAU);
                let color = format!("rgba(0,255,65,{:.3})", alpha * (1.0 - i as f64 * 0.25));
                self.ctx.set_stroke_style_str(&color);
                self.ctx.set_line_width(lw);
                self.ctx.stroke();
            }
        }
    }

    pub fn add_well_at(&mut self, x: f64, y: f64) {
        // Trigger burst and add a retro neon green ripple at tap location.
        self.burst_timer = BURST_DURATION;
        // Add ripple
        self.ripples.push(Ripple { x, y, age: 0.0, duration: 1.2, max_radius: 420.0 });
        // Apply outward impulse to particles from tap point
        for p in self.particles.iter_mut() {
            let dx = p.x - x;
            let dy = p.y - y;
            let dist = (dx*dx + dy*dy).sqrt() + 0.0001;
            let nx = dx / dist;
            let ny = dy / dist;
            let force = 60.0 / (1.0 + dist*0.02);
            p.vx += nx * force;
            p.vy += ny * force;
            p.hue = (p.hue + 60.0) % 360.0;
        }
    }
}
