use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, ImageData};

const W: u32 = 320;
const H: u32 = 240;

// --- Maze ---

const MAZE_N: usize = 25;
const MAZE_CELLS: usize = MAZE_N * MAZE_N;
const CELL_SZ: f64 = 2.0;

// --- Elevated road geometry ---

const FLOOR_Y: f64 = -2.0;
const ELEVATION_H: f64 = 4.0;
const SLAB_H: f64 = 0.3;
const ROAD_Y: f64 = FLOOR_Y + ELEVATION_H;

// --- Vector math ---

#[derive(Clone, Copy)]
struct Vec3 { x: f64, y: f64, z: f64 }

impl Vec3 {
    fn new(x: f64, y: f64, z: f64) -> Self { Vec3 { x, y, z } }
    fn dot(self, o: Vec3) -> f64 { self.x*o.x + self.y*o.y + self.z*o.z }
    fn len(self) -> f64 { self.dot(self).sqrt() }
    fn norm(self) -> Vec3 {
        let l = self.len();
        if l < 1e-12 { Vec3::new(0.0,1.0,0.0) } else { Vec3::new(self.x/l, self.y/l, self.z/l) }
    }
    fn sub(self, o: Vec3) -> Vec3 { Vec3::new(self.x-o.x, self.y-o.y, self.z-o.z) }
    fn add(self, o: Vec3) -> Vec3 { Vec3::new(self.x+o.x, self.y+o.y, self.z+o.z) }
    fn scale(self, s: f64) -> Vec3 { Vec3::new(self.x*s, self.y*s, self.z*s) }

    fn cross(self, o: Vec3) -> Vec3 {
        Vec3::new(self.y*o.z - self.z*o.y, self.z*o.x - self.x*o.z, self.x*o.y - self.y*o.x)
    }
    fn lerp(self, o: Vec3, t: f64) -> Vec3 { self.scale(1.0 - t).add(o.scale(t)) }
}

// --- Primitives ---

#[derive(Clone, Copy)]
struct Sphere { center: Vec3, radius: f64, color: Vec3 }

#[derive(Clone, Copy)]
struct Capsule { a: Vec3, b: Vec3, radius: f64, color: Vec3 }

struct Light { pos: Vec3, intensity: f64 }

// --- Hit result ---

#[derive(Clone, Copy)]
struct Hit { t: f64, normal: Vec3, color: Vec3 }

// --- Ray-sphere ---

fn hit_sphere(origin: Vec3, dir: Vec3, s: &Sphere) -> Option<Hit> {
    let oc = origin.sub(s.center);
    let a = dir.dot(dir);
    let b = 2.0 * oc.dot(dir);
    let c = oc.dot(oc) - s.radius * s.radius;
    let disc = b*b - 4.0*a*c;
    if disc < 0.0 { return None; }
    let sq = disc.sqrt();
    let t1 = (-b - sq) / (2.0*a);
    let t = if t1 > 0.001 { t1 } else {
        let t2 = (-b + sq) / (2.0*a);
        if t2 > 0.001 { t2 } else { return None; }
    };
    let p = origin.add(dir.scale(t));
    Some(Hit { t, normal: p.sub(s.center).norm(), color: s.color })
}

// --- Ray-capsule ---

fn hit_capsule(origin: Vec3, dir: Vec3, cap: &Capsule) -> Option<Hit> {
    let ba = cap.b.sub(cap.a);
    let oa = origin.sub(cap.a);
    let baba = ba.dot(ba);
    let bard = ba.dot(dir);
    let baoa = ba.dot(oa);
    let rdrd = dir.dot(dir);
    let rdoa = dir.dot(oa);
    let oaoa = oa.dot(oa);
    let r2 = cap.radius * cap.radius;

    let a = rdrd - bard*bard/baba;
    let b = rdoa - baoa*bard/baba;
    let c = oaoa - baoa*baoa/baba - r2;

    let mut best_t = f64::MAX;
    let mut best_n = Vec3::new(0.0,1.0,0.0);

    let disc = b*b - a*c;
    if disc >= 0.0 {
        let sq = disc.sqrt();
        for &sign in &[-1.0_f64, 1.0] {
            let t = (-b + sign*sq) / a;
            if t > 0.001 && t < best_t {
                let y = baoa + t * bard;
                if y > 0.0 && y < baba {
                    best_t = t;
                    let p = origin.add(dir.scale(t));
                    let proj = cap.a.add(ba.scale(y / baba));
                    best_n = p.sub(proj).norm();
                }
            }
        }
    }

    for center in &[cap.a, cap.b] {
        let oc = origin.sub(*center);
        let a2 = dir.dot(dir);
        let b2 = 2.0 * oc.dot(dir);
        let c2 = oc.dot(oc) - r2;
        let d2 = b2*b2 - 4.0*a2*c2;
        if d2 >= 0.0 {
            let t = (-b2 - d2.sqrt()) / (2.0*a2);
            if t > 0.001 && t < best_t {
                best_t = t;
                best_n = origin.add(dir.scale(t)).sub(*center).norm();
            }
        }
    }

    if best_t < f64::MAX {
        Some(Hit { t: best_t, normal: best_n, color: cap.color })
    } else { None }
}

// --- Bounding sphere test (discriminant only, no sqrt) ---

fn ray_hits_bound(origin: Vec3, dir: Vec3, center: Vec3, radius: f64) -> bool {
    let oc = origin.sub(center);
    let b = oc.dot(dir);
    let c = oc.dot(oc) - radius * radius;
    if c < 0.0 { return true; } // origin inside sphere
    if b > 0.0 { return false; } // sphere behind ray
    b * b >= c
}

// --- Ground plane ---

fn hit_ground(origin: Vec3, dir: Vec3) -> Option<Hit> {
    if dir.y.abs() < 1e-8 { return None; }
    let t = (FLOOR_Y - origin.y) / dir.y;
    if t < 0.001 { return None; }
    let p = origin.add(dir.scale(t));
    let ix = (p.x * 0.5).floor() as i32;
    let iz = (p.z * 0.5).floor() as i32;
    let v = ((ix.wrapping_mul(374761393) ^ iz.wrapping_mul(668265263)) as u32 & 0xFF) as f64 / 255.0;
    let g = 0.35 + 0.06 * v;
    let color = Vec3::new(g * 0.75, g, g * 0.55);
    Some(Hit { t, normal: Vec3::new(0.0, 1.0, 0.0), color })
}

// --- Road surface (top) ---

fn hit_road_top(origin: Vec3, dir: Vec3, maze: &[bool; MAZE_CELLS]) -> Option<Hit> {
    if dir.y.abs() < 1e-8 { return None; }
    let t = (ROAD_Y - origin.y) / dir.y;
    if t < 0.001 { return None; }
    let p = origin.add(dir.scale(t));
    let half = (MAZE_N as f64) * CELL_SZ * 0.5;
    let gx = ((p.x + half) / CELL_SZ).floor() as i32;
    let gz = ((p.z + half) / CELL_SZ).floor() as i32;
    if gx < 0 || gx >= MAZE_N as i32 || gz < 0 || gz >= MAZE_N as i32 { return None; }
    if !maze[(gz as usize) * MAZE_N + (gx as usize)] { return None; }
    let color = Vec3::new(0.82, 0.76, 0.65);
    Some(Hit { t, normal: Vec3::new(0.0, 1.0, 0.0), color })
}

// --- Daylight sky ---

fn smoothstep(a: f64, b: f64, x: f64) -> f64 {
    let t = ((x - a) / (b - a)).max(0.0).min(1.0);
    t * t * (3.0 - 2.0 * t)
}

fn daylight_sky(dir: Vec3, time: f64) -> Vec3 {
    let d = dir.norm();
    let t = (d.y * 0.5 + 0.5).max(0.0).min(1.0);
    // Base gradient sky
    let base = Vec3::new(0.75, 0.82, 0.88).lerp(Vec3::new(0.35, 0.55, 0.92), t);

    // Procedural cloud layer using low-frequency sin waves (cheap noise)
    let u = (d.x * 8.0 + time * 0.15).sin() * 0.5 + 0.5;
    let v = (d.z * 6.0 - time * 0.12).cos() * 0.5 + 0.5;
    let mut cloud_raw = u * v;
    // Add another octave for variation
    cloud_raw = cloud_raw * 0.7 + ((d.x * 18.0 + d.z * 12.0 + time * 0.3).sin() * 0.5 + 0.5) * 0.3;
    let cloud_density = smoothstep(0.45, 0.8, cloud_raw.powf(1.2));

    // Cloud color (slightly bluish white) and blend over sky
    let cloud_col = Vec3::new(0.95, 0.96, 0.98);
    base.lerp(cloud_col, cloud_density * 0.85)
}

// --- Maze generation ---

fn generate_maze() -> ([bool; MAZE_CELLS], Vec<(usize, usize)>) {
    let mut grid = [false; MAZE_CELLS];
    let mut stack: Vec<(usize, usize)> = Vec::with_capacity(64);
    let mut seed: u32 = 55013;

    grid[1 * MAZE_N + 1] = true;
    stack.push((1, 1));

    while let Some(&(cx, cy)) = stack.last() {
        let dirs: [(i32, i32); 4] = [(2, 0), (-2, 0), (0, 2), (0, -2)];
        let mut nbrs = [(0usize, 0usize); 4];
        let mut count = 0usize;
        for &(dx, dy) in &dirs {
            let nx = cx as i32 + dx;
            let ny = cy as i32 + dy;
            if nx > 0 && nx < MAZE_N as i32 - 1 && ny > 0 && ny < MAZE_N as i32 - 1
                && !grid[ny as usize * MAZE_N + nx as usize]
            {
                nbrs[count] = (nx as usize, ny as usize);
                count += 1;
            }
        }
        if count == 0 {
            stack.pop();
        } else {
            seed = seed.wrapping_mul(1103515245).wrapping_add(12345);
            let pick = ((seed >> 16) as usize) % count;
            let (nx, ny) = nbrs[pick];
            grid[((cy + ny) / 2) * MAZE_N + (cx + nx) / 2] = true;
            grid[ny * MAZE_N + nx] = true;
            stack.push((nx, ny));
        }
    }

    let si = 1 * MAZE_N + 1;
    let gi = (MAZE_N - 2) * MAZE_N + (MAZE_N - 2);
    let mut visited = [false; MAZE_CELLS];
    let mut par = [u16::MAX; MAZE_CELLS];
    let mut queue = std::collections::VecDeque::with_capacity(MAZE_CELLS);
    visited[si] = true;
    queue.push_back(si);

    while let Some(ci) = queue.pop_front() {
        if ci == gi { break; }
        let cx = ci % MAZE_N;
        let cy = ci / MAZE_N;
        for &(dx, dy) in &[(0i32, 1i32), (0, -1), (1, 0), (-1, 0)] {
            let nx = cx as i32 + dx;
            let ny = cy as i32 + dy;
            if nx >= 0 && nx < MAZE_N as i32 && ny >= 0 && ny < MAZE_N as i32 {
                let ni = ny as usize * MAZE_N + nx as usize;
                if grid[ni] && !visited[ni] {
                    visited[ni] = true;
                    par[ni] = ci as u16;
                    queue.push_back(ni);
                }
            }
        }
    }

    let mut path = Vec::with_capacity(64);
    let mut ci = gi;
    while ci != si {
        path.push((ci % MAZE_N, ci / MAZE_N));
        if par[ci] == u16::MAX { break; }
        ci = par[ci] as usize;
    }
    path.push((1, 1));
    path.reverse();
    (grid, path)
}

fn maze_to_world(gx: usize, gz: usize) -> (f64, f64) {
    let half = (MAZE_N as f64) * CELL_SZ * 0.5;
    (gx as f64 * CELL_SZ - half + CELL_SZ * 0.5,
     gz as f64 * CELL_SZ - half + CELL_SZ * 0.5)
}

fn path_pos(path: &[(usize, usize)], t: f64) -> (f64, f64, f64) {
    if path.len() < 2 { return (0.0, 0.0, 0.0); }
    let n = path.len() as f64;
    let t_wrap = ((t % n) + n) % n;
    let i = t_wrap.floor() as usize;
    let f = t_wrap - t_wrap.floor();
    let (x0, z0) = maze_to_world(path[i % path.len()].0, path[i % path.len()].1);
    let (x1, z1) = maze_to_world(path[(i + 1) % path.len()].0, path[(i + 1) % path.len()].1);
    let dx = x1 - x0;
    let dz = z1 - z0;
    let facing = dz.atan2(dx);
    (x0 + dx * f, z0 + dz * f, facing)
}

// --- Ripple overlay for taps (Minds Eye neon) ---

struct Ripple {
    x: f64,
    y: f64,
    age: f64,
    duration: f64,
    max_radius: f64,
}

// --- Scene with rider bounding sphere ---

struct Scene {
    rider_spheres: Vec<Sphere>,
    rider_capsules: Vec<Capsule>,
    rider_center: Vec3,
    rider_bound: f64,
    pillars: Vec<Capsule>,
    maze: [bool; MAZE_CELLS],
}

impl Scene {
    fn closest_hit(&self, origin: Vec3, dir: Vec3) -> Option<Hit> {
        let mut best: Option<Hit> = None;
        let mut check = |h: Hit| {
            if best.is_none() || h.t < best.unwrap().t { best = Some(h); }
        };

        if ray_hits_bound(origin, dir, self.rider_center, self.rider_bound) {
            for s in &self.rider_spheres {
                if let Some(h) = hit_sphere(origin, dir, s) { check(h); }
            }
            for c in &self.rider_capsules {
                if let Some(h) = hit_capsule(origin, dir, c) { check(h); }
            }
        }

        for c in &self.pillars {
            if let Some(h) = hit_capsule(origin, dir, c) { check(h); }
        }

        if let Some(h) = hit_ground(origin, dir) { check(h); }
        if let Some(h) = hit_road_top(origin, dir, &self.maze) { check(h); }
        best
    }

    // Shadow rays — simplified: skip walls and road_bottom
    fn any_hit(&self, origin: Vec3, dir: Vec3, max_t: f64) -> bool {
        if ray_hits_bound(origin, dir, self.rider_center, self.rider_bound) {
            for s in &self.rider_spheres {
                if let Some(h) = hit_sphere(origin, dir, s) { if h.t < max_t { return true; } }
            }
            for c in &self.rider_capsules {
                if let Some(h) = hit_capsule(origin, dir, c) { if h.t < max_t { return true; } }
            }
        }
        for c in &self.pillars {
            if let Some(h) = hit_capsule(origin, dir, c) { if h.t < max_t { return true; } }
        }
        if let Some(h) = hit_road_top(origin, dir, &self.maze) { if h.t < max_t { return true; } }
        false
    }
}

// --- Trace ---

fn trace(origin: Vec3, dir: Vec3, scene: &Scene, light: &Light, time: f64) -> Vec3 {
    let hit = match scene.closest_hit(origin, dir) {
        Some(h) => h,
        None => return daylight_sky(dir, time),
    };

    let p = origin.add(dir.scale(hit.t));
    let n = hit.normal;

    // Ambient
    let mut lum = 0.25_f64;

    let to_l = light.pos.sub(p);
    let ld = to_l.len();
    let ln = to_l.scale(1.0 / ld);

    if !scene.any_hit(p.add(n.scale(0.002)), ln, ld) {
        let ndl = n.dot(ln).max(0.0);
        let att = light.intensity / (1.0 + ld * 0.012);
        lum += ndl * att;
    }

    Vec3::new(
        (hit.color.x * lum).min(1.0),
        (hit.color.y * lum).min(1.0),
        (hit.color.z * lum).min(1.0),
    )
}

fn gamma(v: f64) -> u8 { (v.max(0.0).min(1.0).powf(1.0/2.2) * 255.0) as u8 }

// pseudo-scatter generator (deterministic-ish) for knockdown
// dx,dz are the knock direction (screen-normalized) mapped to world; pieces scatter opposite the tap
fn scatter_vec(idx: usize, collapse: f64, time: f64, dx: f64, dz: f64) -> Vec3 {
    let id = idx as f64;
    let px = (id * 12.9898 + time * 8.0).sin();
    let py = (id * 78.233 + time * 7.0).cos();
    let pz = (id * 37.719 + time * 9.0).sin();
    let strength = collapse * 1.6; // global strength
    // bias pieces away from the tap (opposite direction), with downward impulse
    let bias_x = -dx * strength * 0.9;
    let bias_z = -dz * strength * 0.9;
    Vec3::new(px * strength + bias_x, -collapse * 0.9 + py * strength * 0.5, pz * strength + bias_z)
}

// --- Unicyclist builder ---

fn build_unicyclist(rider_s: &mut Vec<Sphere>, rider_c: &mut Vec<Capsule>, bx: f64, bz: f64, ground_y: f64, time: f64, phase: f64, fall: f64, fall_dx: f64, fall_dz: f64, hue: usize, facing: f64) -> (Vec3, f64) {
    let s = 3.0;
    let pedal_speed = 2.5;
    let pa = -time * pedal_speed + phase;
    let (fc, fs) = (facing.cos(), facing.sin());

    let wheel_r = 0.45 * s;
    let tube_r = 0.07 * s;
    let wy = ground_y + wheel_r + tube_r;

    // compute bob and fall-derived offsets early so wheel/parts can use them
    let bob = 0.06 * s * (time * 4.0 + phase).sin();
    // fall < 0: collapsing (0 -> 1), fall > 0: reassembling/levitating (0 -> 1)
    let collapse = if fall < 0.0 { (-fall).min(1.0) } else { 0.0 };
    let reassemble = if fall > 0.0 { fall.min(1.0) } else { 0.0 };
    // vertical offset for collapse / levitation
    let collapse_offset = -0.8 * s * collapse; // sink down when collapsed
    let levitate_offset = 0.6 * s * reassemble; // reduced levitation peak when reassembling
    let extra_y = collapse_offset + levitate_offset;
    // lateral offset based on tap direction (fall_dx, fall_dz are normalized screen coords mapped to world)
    let lateral_strength = 1.6 * s; // how far rider moves horizontally when knocked
    // invert: tap on right (positive fall_dx) should push rider left (negative world x)
    let lat_x = -fall_dx * lateral_strength * collapse; // only during collapse
    let lat_z = -fall_dz * lateral_strength * collapse;

    // Wheel segments — wheel plane contains forward and up directions
    let n_segs: usize = 10;
    let tau = std::f64::consts::TAU;
    let spin = time * pedal_speed;
    for i in 0..n_segs {
        let a0 = (i as f64) * tau / (n_segs as f64) + spin;
        let a1 = ((i + 1) as f64) * tau / (n_segs as f64) + spin;
        let rc0 = wheel_r * a0.cos();
        let rs0 = wheel_r * a0.sin();
        let rc1 = wheel_r * a1.cos();
        let rs1 = wheel_r * a1.sin();
        rider_c.push(Capsule {
            a: Vec3::new(bx + lat_x + fc * rc0, wy + rs0 + extra_y, bz + lat_z + fs * rc0),
            b: Vec3::new(bx + lat_x + fc * rc1, wy + rs1 + extra_y, bz + lat_z + fs * rc1),
            radius: tube_r,
            color: Vec3::new(0.75, 0.75, 0.8),
        });
    }

    // Spokes
    let n_spk = 2;
    for i in 0..n_spk {
        let a = (i as f64) * tau / (n_spk as f64) + spin;
        let rc = wheel_r * a.cos();
        let rs = wheel_r * a.sin();
        rider_c.push(Capsule {
            a: Vec3::new(bx + lat_x, wy + extra_y, bz + lat_z),
            b: Vec3::new(bx + lat_x + fc * rc, wy + rs + extra_y, bz + lat_z + fs * rc),
            radius: 0.02 * s, color: Vec3::new(0.8, 0.8, 0.85),
        });
    }

    // Hub
    rider_s.push(Sphere { center: Vec3::new(bx + lat_x, wy + extra_y, bz + lat_z), radius: 0.1 * s,
        color: Vec3::new(0.85, 0.85, 0.9) });

    // Seat post (vertical — no rotation needed)

    // Seat — spans perpendicular to facing (along right vector)
    let seat_hw = 0.1 * s;

    let colors = [
        Vec3::new(0.0, 0.5, 0.9), Vec3::new(0.9, 0.2, 0.4), Vec3::new(0.0, 0.8, 0.4),
        Vec3::new(0.9, 0.7, 0.0), Vec3::new(0.7, 0.3, 0.9),
    ];
    let bc = colors[hue % colors.len()];
    let bob = 0.06 * s * (time * 4.0 + phase).sin();

    // fall < 0: collapsing (0 -> 1), fall > 0: reassembling/levitating (0 -> 1)
    let collapse = if fall < 0.0 { (-fall).min(1.0) } else { 0.0 };
    let reassemble = if fall > 0.0 { fall.min(1.0) } else { 0.0 };

    // vertical offset for collapse / levitation
    let collapse_offset = -0.8 * s * collapse; // sink down when collapsed
    let levitate_offset = 0.6 * s * reassemble; // reduced levitation peak when reassembling
    let extra_y = collapse_offset + levitate_offset;

    // lateral offset based on tap direction (fall_dx, fall_dz are normalized screen coords mapped to world)
    let lateral_strength = 1.6 * s; // how far rider moves horizontally when knocked
    // invert: tap on right should push rider left
    let lat_x = -fall_dx * lateral_strength * collapse; // only during collapse
    let lat_z = -fall_dz * lateral_strength * collapse;

    // Seat post and seat (apply collapse/levitate offset)
    let seat_y = wy + 0.9 * s + extra_y;
    rider_c.push(Capsule { a: Vec3::new(bx, wy + 0.15 * s + extra_y, bz), b: Vec3::new(bx, seat_y, bz),
        radius: 0.04 * s, color: Vec3::new(0.7, 0.7, 0.75) });
    rider_c.push(Capsule {
        a: Vec3::new(bx + fs * seat_hw, seat_y + 0.05 * s, bz - fc * seat_hw),
        b: Vec3::new(bx - fs * seat_hw, seat_y + 0.05 * s, bz + fc * seat_hw),
        radius: 0.06 * s, color: Vec3::new(0.3, 0.3, 0.35) });

    // Torso (vertical)
    let hip_y = seat_y + 0.25 * s;
    let sh_y = hip_y + 0.55 * s;
    rider_c.push(Capsule {
        a: Vec3::new(bx, hip_y + bob, bz), b: Vec3::new(bx, sh_y + bob, bz),
        radius: 0.14 * s, color: bc });

    // Head
    rider_s.push(Sphere { center: Vec3::new(bx, sh_y + 0.32 * s + bob, bz),
        radius: 0.16 * s, color: Vec3::new(0.9, 0.75, 0.65) });

    // After building parts, apply per-part scatter offsets when collapsing
    let mut part_idx = 0usize;
    for s in rider_s.iter_mut() {
        if collapse > 0.0 {
            let off = scatter_vec(part_idx, collapse, time, fall_dx, fall_dz);
            s.center = s.center.add(off);
        }
        part_idx += 1;
    }
    for c in rider_c.iter_mut() {
        if collapse > 0.0 {
            let off = scatter_vec(part_idx, collapse, time, fall_dx, fall_dz);
            c.a = c.a.add(off);
            c.b = c.b.add(off);
        }
        part_idx += 1;
    }

    // Pedal crank radius
    let cr = 0.25 * s;

    // Right leg — pedal offset in facing direction, leg offset along right
    let rpx = cr * pa.cos(); // forward offset
    let rpy = cr * pa.sin(); // vertical offset
    let (rpx_w, rpz_w) = (fc * rpx, fs * rpx); // world forward offset
    let leg_side = 0.08 * s;
    let (rsx, rsz) = (-fs * leg_side, fc * leg_side); // right offset

    let rf_x = bx + lat_x + rpx_w;
    let rf_z = bz + lat_z + rpz_w;
    let rf_y = wy + rpy + extra_y;
    let rk_x = bx + lat_x + fc * 0.12 * s * pa.cos();
    let rk_z = bz + lat_z + fs * 0.12 * s * pa.cos();
    let rk_y = (rf_y + hip_y + bob) * 0.5 + 0.1 * s;

    rider_c.push(Capsule {
        a: Vec3::new(bx - fc * 0.06 * s + rsx, hip_y + bob, bz - fs * 0.06 * s + rsz),
        b: Vec3::new(rk_x + rsx, rk_y, rk_z + rsz), radius: 0.06 * s, color: bc });
    rider_c.push(Capsule {
        a: Vec3::new(rk_x + rsx, rk_y, rk_z + rsz),
        b: Vec3::new(rf_x + rsx, rf_y, rf_z + rsz), radius: 0.05 * s, color: bc });

    // Left leg — opposite pedal, opposite side
    let lf_x = bx + lat_x - rpx_w;
    let lf_z = bz + lat_z - rpz_w;
    let lf_y = wy - rpy + extra_y;
    let lk_x = bx + lat_x - fc * 0.12 * s * pa.cos();
    let lk_z = bz + lat_z - fs * 0.12 * s * pa.cos();
    let lk_y = (lf_y + hip_y + bob) * 0.5 + 0.1 * s;

    rider_c.push(Capsule {
        a: Vec3::new(bx + fc * 0.06 * s - rsx, hip_y + bob, bz + fs * 0.06 * s - rsz),
        b: Vec3::new(lk_x - rsx, lk_y, lk_z - rsz), radius: 0.06 * s, color: bc });
    rider_c.push(Capsule {
        a: Vec3::new(lk_x - rsx, lk_y, lk_z - rsz),
        b: Vec3::new(lf_x - rsx, lf_y, lf_z - rsz), radius: 0.05 * s, color: bc });

    // Arms — swing for balance, offset to each side
    let arm_side = 0.16 * s;
    let sw = 0.12 * s * (time * 3.0 + phase).sin();
    let (asx, asz) = (-fs * arm_side, fc * arm_side); // right offset
    let (swx, swz) = (fc * sw, fs * sw); // forward swing

    // Right arm: shoulder → elbow → hand
    rider_c.push(Capsule {
        a: Vec3::new(bx + asx, sh_y - 0.05 * s + bob, bz + asz),
        b: Vec3::new(bx + asx + swx, sh_y - 0.3 * s + bob, bz + asz + swz),
        radius: 0.045 * s, color: bc });

    // Left arm
    rider_c.push(Capsule {
        a: Vec3::new(bx - asx, sh_y - 0.05 * s + bob, bz - asz),
        b: Vec3::new(bx - asx - swx, sh_y - 0.3 * s + bob, bz - asz - swz),
        radius: 0.045 * s, color: bc });

    let center_y = (wy + sh_y + 0.32 * s + bob) * 0.5;
    let bound = (sh_y + 0.32 * s + bob - (wy - wheel_r)) * 0.5 + 1.0;
    (Vec3::new(bx, center_y, bz), bound)
}

// --- WASM ---

#[wasm_bindgen]
pub struct Raytracer {
    ctx: CanvasRenderingContext2d,
    buf: Vec<u8>,
    light: Light,
    maze_grid: [bool; MAZE_CELLS],
    maze_path: Vec<(usize, usize)>,
    knocked_time: f64,
    // normalized screen tap vector (-1..1), set by JS on tap
    knock_sx: f64,
    knock_sy: f64,
    // store paused path parameter when knocked to freeze motion
    knocked_path_t: f64,
    // ripple overlay for Minds Eye effect (pixel coords)
    ripples: Vec<Ripple>,
}

#[wasm_bindgen]
impl Raytracer {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement) -> Result<Raytracer, JsValue> {
        let ctx = canvas.get_context("2d")?.unwrap().dyn_into::<CanvasRenderingContext2d>()?;
        canvas.set_width(W);
        canvas.set_height(H);

        let light = Light { pos: Vec3::new(10.0, 20.0, 8.0), intensity: 2.5 };
        let (maze_grid, maze_path) = generate_maze();

        Ok(Raytracer { ctx, buf: vec![0u8; (W*H*4) as usize], light, maze_grid, maze_path, knocked_time: -1.0, knock_sx: 0.0, knock_sy: 0.0, knocked_path_t: -1.0, ripples: Vec::new() })
    }

    // Called from JS on canvas tap to knock the rider over
    pub fn tap(&mut self, t: f64, sx: f64, sy: f64, cx: f64, cy: f64) {
        // record time and normalized screen tap vector
        self.knocked_time = t;
        self.knock_sx = sx;
        self.knock_sy = sy;
        // pause path traversal at current parameter so rider stops moving
        let speed = 3.5;
        self.knocked_path_t = t * speed;
        // add Minds Eye neon ripple at canvas pixel coords
        self.ripples.push(Ripple { x: cx, y: cy, age: 0.0, duration: 1.2, max_radius: 220.0 });
    }

    fn build_scene(&mut self, time: f64) -> Scene {
        let mut rider_spheres = Vec::with_capacity(4);
        let mut rider_capsules = Vec::with_capacity(30);
        let mut pillars = Vec::with_capacity(16);

        // Stone pillars
        for gy in (1..MAZE_N).step_by(6) {
            for gx in (1..MAZE_N).step_by(6) {
                if self.maze_grid[gy * MAZE_N + gx] {
                    let (wx, wz) = maze_to_world(gx, gy);
                    pillars.push(Capsule {
                        a: Vec3::new(wx, FLOOR_Y, wz),
                        b: Vec3::new(wx, ROAD_Y - SLAB_H, wz),
                        radius: 0.35,
                        color: Vec3::new(0.78, 0.72, 0.6),
                    });
                }
            }
        }

        let speed = 3.5;
        // freeze path traversal while knocked (until reassembled)
        let mut dtk = f64::MAX;
        if self.knocked_time >= 0.0 { dtk = time - self.knocked_time; }
        let mut t_param = time * speed;
        if self.knocked_time >= 0.0 && dtk < 2.0 {
            t_param = self.knocked_path_t;
        }
        let (px, pz, facing) = path_pos(&self.maze_path, t_param);

        // compute fall state based on recent taps (knock over -> reassemble back -> done)
        let mut fall = 0.0;
        if self.knocked_time >= 0.0 {
            if dtk < 0.8 {
                // collapsing: fall ranges from 0 to -1
                fall = - (dtk / 0.8);
            } else if dtk < 2.0 {
                // reassembling: 0 -> 1
                fall = (dtk - 0.8) / (2.0 - 0.8);
            } else {
                // done
                fall = 0.0;
                self.knocked_time = -1.0;
            }
        }

        // place a goal flag at the maze end
        if let Some(&(gx, gz)) = self.maze_path.last() {
            let (wx, wz) = maze_to_world(gx, gz);
            // pole (5x bigger)
            pillars.push(Capsule { a: Vec3::new(wx, FLOOR_Y, wz), b: Vec3::new(wx, ROAD_Y + 6.0, wz), radius: 0.2, color: Vec3::new(0.2, 0.2, 0.2) });
            // flag cloth as a larger horizontal capsule (scaled)
            pillars.push(Capsule { a: Vec3::new(wx, ROAD_Y + 6.0, wz), b: Vec3::new(wx + 2.5, ROAD_Y + 5.0, wz), radius: 0.4, color: Vec3::new(0.9, 0.1, 0.1) });
        }

        let (center, bound) = build_unicyclist(&mut rider_spheres, &mut rider_capsules, px, pz, ROAD_Y, time, 0.0, fall, self.knock_sx, self.knock_sy, 0, facing);

        Scene { rider_spheres, rider_capsules, rider_center: center, rider_bound: bound, pillars, maze: self.maze_grid }
    }

    pub fn render_frame(&mut self, time: f64) {
        let scene = self.build_scene(time);

        let speed = 3.5;
        let (rx, rz, _) = path_pos(&self.maze_path, time * speed);

        let ca = time * 0.3;
        let cr = 12.0;
        let cy = ROAD_Y + 8.0 + 2.0 * (time * 0.1).sin();
        let origin = Vec3::new(rx + cr * ca.sin(), cy, rz + cr * ca.cos());
        let look_at = Vec3::new(rx, ROAD_Y + 3.0, rz);

        let forward = look_at.sub(origin).norm();
        let right = forward.cross(Vec3::new(0.0, 1.0, 0.0)).norm();
        let up = right.cross(forward);
        let fov = 0.9;
        let aspect = W as f64 / H as f64;

        for y in 0..H {
            for x in 0..W {
                let px = (2.0 * (x as f64 + 0.5) / W as f64 - 1.0) * aspect * fov;
                let py = (1.0 - 2.0 * (y as f64 + 0.5) / H as f64) * fov;
                let dir = forward.add(right.scale(px)).add(up.scale(py)).norm();
                let color = trace(origin, dir, &scene, &self.light, time);
                let idx = ((y * W + x) * 4) as usize;
                self.buf[idx]   = gamma(color.x);
                self.buf[idx + 1] = gamma(color.y);
                self.buf[idx + 2] = gamma(color.z);
                self.buf[idx + 3] = 255;
            }
        }

        if let Ok(img) = ImageData::new_with_u8_clamped_array_and_sh(Clamped(&self.buf), W, H) {
            let _ = self.ctx.put_image_data(&img, 0.0, 0.0);
        }

        // Update and draw neon ripples (Minds Eye style) on top of the raster image
        for r in self.ripples.iter_mut() { r.age += 1.0/60.0; }
        self.ripples.retain(|r| r.age < r.duration);
        for rip in &self.ripples {
            let t = (rip.age / rip.duration).min(1.0);
            let r_px = rip.max_radius * t;
            let alpha = f64::max(1.0 - t, 0.0);
            for i in 0..3 {
                let ring_r = r_px * (1.0 + i as f64 * 0.12);
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
}
