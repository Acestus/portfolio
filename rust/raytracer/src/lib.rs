use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, ImageData};

const W: u32 = 320;
const H: u32 = 240;

// --- Maze ---

const MAZE_N: usize = 15;
const MAZE_CELLS: usize = MAZE_N * MAZE_N;
const CELL_SZ: f64 = 2.0;

// --- Aqueduct geometry ---

const FLOOR_Y: f64 = -2.0;
const AQUEDUCT_H: f64 = 4.0;
const SLAB_H: f64 = 0.3;
const ROAD_Y: f64 = FLOOR_Y + AQUEDUCT_H;

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
    fn reflect(self, n: Vec3) -> Vec3 { self.sub(n.scale(2.0 * self.dot(n))) }
    fn cross(self, o: Vec3) -> Vec3 {
        Vec3::new(self.y*o.z - self.z*o.y, self.z*o.x - self.x*o.z, self.x*o.y - self.y*o.x)
    }
    fn lerp(self, o: Vec3, t: f64) -> Vec3 { self.scale(1.0 - t).add(o.scale(t)) }
}

// --- Primitives ---

#[derive(Clone, Copy)]
struct Sphere { center: Vec3, radius: f64, color: Vec3, specular: f64, reflective: f64 }

#[derive(Clone, Copy)]
struct Capsule { a: Vec3, b: Vec3, radius: f64, color: Vec3, specular: f64, reflective: f64 }

struct Light { base_pos: Vec3, color: Vec3, intensity: f64, orbit_radius: f64, orbit_speed: f64 }

impl Light {
    fn pos_at(&self, t: f64) -> Vec3 {
        Vec3::new(
            self.base_pos.x + self.orbit_radius * (t * self.orbit_speed).cos(),
            self.base_pos.y,
            self.base_pos.z + self.orbit_radius * (t * self.orbit_speed).sin(),
        )
    }
}

// --- Hit result ---

#[derive(Clone, Copy)]
struct Hit { t: f64, normal: Vec3, color: Vec3, specular: f64, reflective: f64 }

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
    Some(Hit { t, normal: p.sub(s.center).norm(), color: s.color, specular: s.specular, reflective: s.reflective })
}

// --- Ray-capsule (sphere-swept segment) ---

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
        Some(Hit { t: best_t, normal: best_n, color: cap.color, specular: cap.specular, reflective: cap.reflective })
    } else { None }
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
    Some(Hit { t, normal: Vec3::new(0.0, 1.0, 0.0), color, specular: 5.0, reflective: 0.02 })
}

// --- Aqueduct road surface (top) ---

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
    Some(Hit { t, normal: Vec3::new(0.0, 1.0, 0.0), color, specular: 20.0, reflective: 0.08 })
}

// --- Aqueduct road underside ---

fn hit_road_bottom(origin: Vec3, dir: Vec3, maze: &[bool; MAZE_CELLS]) -> Option<Hit> {
    if dir.y <= 0.0 { return None; }
    let bottom = ROAD_Y - SLAB_H;
    let t = (bottom - origin.y) / dir.y;
    if t < 0.001 { return None; }
    let p = origin.add(dir.scale(t));
    let half = (MAZE_N as f64) * CELL_SZ * 0.5;
    let gx = ((p.x + half) / CELL_SZ).floor() as i32;
    let gz = ((p.z + half) / CELL_SZ).floor() as i32;
    if gx < 0 || gx >= MAZE_N as i32 || gz < 0 || gz >= MAZE_N as i32 { return None; }
    if !maze[(gz as usize) * MAZE_N + (gx as usize)] { return None; }
    let color = Vec3::new(0.7, 0.64, 0.55);
    Some(Hit { t, normal: Vec3::new(0.0, -1.0, 0.0), color, specular: 10.0, reflective: 0.03 })
}

// --- Aqueduct side walls ---

fn hit_aqueduct_walls(origin: Vec3, dir: Vec3, maze: &[bool; MAZE_CELLS]) -> Option<Hit> {
    let half = (MAZE_N as f64) * CELL_SZ * 0.5;
    let slab_bottom = ROAD_Y - SLAB_H;
    let stone = Vec3::new(0.75, 0.68, 0.58);
    let mut best_t = f64::MAX;
    let mut best_hit: Option<Hit> = None;

    // X-aligned boundaries
    if dir.x.abs() > 1e-8 {
        for gx in 0..=MAZE_N {
            let wall_x = gx as f64 * CELL_SZ - half;
            let t = (wall_x - origin.x) / dir.x;
            if t < 0.001 || t >= best_t { continue; }
            let p = origin.add(dir.scale(t));
            if p.y < slab_bottom || p.y > ROAD_Y { continue; }
            let gz = ((p.z + half) / CELL_SZ).floor() as i32;
            if gz < 0 || gz >= MAZE_N as i32 { continue; }
            let left = if gx > 0 { maze[gz as usize * MAZE_N + (gx - 1)] } else { false };
            let right = if gx < MAZE_N { maze[gz as usize * MAZE_N + gx] } else { false };
            if left != right {
                let nx = if dir.x > 0.0 { -1.0 } else { 1.0 };
                best_t = t;
                best_hit = Some(Hit { t, normal: Vec3::new(nx, 0.0, 0.0), color: stone, specular: 15.0, reflective: 0.05 });
            }
        }
    }

    // Z-aligned boundaries
    if dir.z.abs() > 1e-8 {
        for gz in 0..=MAZE_N {
            let wall_z = gz as f64 * CELL_SZ - half;
            let t = (wall_z - origin.z) / dir.z;
            if t < 0.001 || t >= best_t { continue; }
            let p = origin.add(dir.scale(t));
            if p.y < slab_bottom || p.y > ROAD_Y { continue; }
            let gx = ((p.x + half) / CELL_SZ).floor() as i32;
            if gx < 0 || gx >= MAZE_N as i32 { continue; }
            let front = if gz > 0 { maze[(gz - 1) as usize * MAZE_N + gx as usize] } else { false };
            let back = if (gz as usize) < MAZE_N { maze[gz as usize * MAZE_N + gx as usize] } else { false };
            if front != back {
                let nz = if dir.z > 0.0 { -1.0 } else { 1.0 };
                best_t = t;
                best_hit = Some(Hit { t, normal: Vec3::new(0.0, 0.0, nz), color: stone, specular: 15.0, reflective: 0.05 });
            }
        }
    }

    best_hit
}

// --- Daylight sky ---

fn daylight_sky(dir: Vec3) -> Vec3 {
    let d = dir.norm();
    let t = (d.y * 0.5 + 0.5).max(0.0).min(1.0);
    Vec3::new(0.75, 0.82, 0.88).lerp(Vec3::new(0.35, 0.55, 0.92), t)
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

    // BFS for solution path
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

fn path_pos(path: &[(usize, usize)], t: f64) -> (f64, f64) {
    if path.len() < 2 { return (0.0, 0.0); }
    let n = path.len() as f64;
    let t_wrap = ((t % n) + n) % n;
    let i = t_wrap.floor() as usize;
    let f = t_wrap - t_wrap.floor();
    let (x0, z0) = maze_to_world(path[i % path.len()].0, path[i % path.len()].1);
    let (x1, z1) = maze_to_world(path[(i + 1) % path.len()].0, path[(i + 1) % path.len()].1);
    (x0 + (x1 - x0) * f, z0 + (z1 - z0) * f)
}

// --- Scene ---

struct Scene { spheres: Vec<Sphere>, capsules: Vec<Capsule>, maze: [bool; MAZE_CELLS] }

impl Scene {
    fn closest_hit(&self, origin: Vec3, dir: Vec3) -> Option<Hit> {
        let mut best: Option<Hit> = None;
        let mut check = |h: Hit| {
            if best.is_none() || h.t < best.unwrap().t { best = Some(h); }
        };
        for s in &self.spheres {
            if let Some(h) = hit_sphere(origin, dir, s) { check(h); }
        }
        for c in &self.capsules {
            if let Some(h) = hit_capsule(origin, dir, c) { check(h); }
        }
        if let Some(h) = hit_ground(origin, dir) { check(h); }
        if let Some(h) = hit_road_top(origin, dir, &self.maze) { check(h); }
        if let Some(h) = hit_road_bottom(origin, dir, &self.maze) { check(h); }
        if let Some(h) = hit_aqueduct_walls(origin, dir, &self.maze) { check(h); }
        best
    }

    fn any_hit(&self, origin: Vec3, dir: Vec3, max_t: f64) -> bool {
        for s in &self.spheres {
            if let Some(h) = hit_sphere(origin, dir, s) { if h.t < max_t { return true; } }
        }
        for c in &self.capsules {
            if let Some(h) = hit_capsule(origin, dir, c) { if h.t < max_t { return true; } }
        }
        if let Some(h) = hit_road_top(origin, dir, &self.maze) { if h.t < max_t { return true; } }
        if let Some(h) = hit_road_bottom(origin, dir, &self.maze) { if h.t < max_t { return true; } }
        if let Some(h) = hit_aqueduct_walls(origin, dir, &self.maze) { if h.t < max_t { return true; } }
        false
    }
}

// --- Trace ---

const MAX_DEPTH: u32 = 1;

fn trace(origin: Vec3, dir: Vec3, scene: &Scene, lights: &[Light], time: f64, depth: u32) -> Vec3 {
    let hit = match scene.closest_hit(origin, dir) {
        Some(h) => h,
        None => return daylight_sky(dir),
    };

    let p = origin.add(dir.scale(hit.t));
    let n = hit.normal;

    let mut diffuse = Vec3::new(0.15, 0.15, 0.18);
    let mut spec = Vec3::new(0.0, 0.0, 0.0);

    for light in lights {
        let lp = light.pos_at(time);
        let to_l = lp.sub(p);
        let ld = to_l.len();
        let ln = to_l.scale(1.0/ld);

        if scene.any_hit(p.add(n.scale(0.002)), ln, ld) { continue; }

        let ndl = n.dot(ln).max(0.0);
        let att = light.intensity / (1.0 + ld * 0.012);
        diffuse = diffuse.add(light.color.scale(ndl * att));

        let half = ln.sub(dir.norm()).norm();
        let ndh = n.dot(half).max(0.0);
        spec = spec.add(light.color.scale(ndh.powf(hit.specular) * att));
    }

    let mut color = Vec3::new(
        (hit.color.x * diffuse.x + spec.x).min(1.0),
        (hit.color.y * diffuse.y + spec.y).min(1.0),
        (hit.color.z * diffuse.z + spec.z).min(1.0),
    );

    if hit.reflective > 0.0 && depth < MAX_DEPTH {
        let rc = trace(p.add(n.scale(0.002)), dir.reflect(n), scene, lights, time, depth+1);
        color = color.scale(1.0 - hit.reflective).add(rc.scale(hit.reflective));
    }

    let rim = (1.0 - n.dot(dir.scale(-1.0).norm()).max(0.0)).powf(3.0) * 0.08;
    color = color.add(Vec3::new(0.4, 0.5, 0.7).scale(rim));
    color
}

fn gamma(v: f64) -> u8 { (v.max(0.0).min(1.0).powf(1.0/2.2) * 255.0) as u8 }

// --- Unicyclist builder ---

fn build_unicyclist(scene: &mut Scene, bx: f64, bz: f64, ground_y: f64, time: f64, phase: f64, hue: usize) {
    let s = 3.0;
    let pedal_speed = 2.5;
    let pa = time * pedal_speed + phase;

    let wheel_r = 0.45 * s;
    let tube_r = 0.07 * s;
    let wy = ground_y + wheel_r + tube_r;

    let n_segs: usize = 24;
    let tau = std::f64::consts::TAU;
    let spin = time * pedal_speed;
    for i in 0..n_segs {
        let a0 = (i as f64) * tau / (n_segs as f64) + spin;
        let a1 = ((i + 1) as f64) * tau / (n_segs as f64) + spin;
        scene.capsules.push(Capsule {
            a: Vec3::new(bx + wheel_r * a0.cos(), wy + wheel_r * a0.sin(), bz),
            b: Vec3::new(bx + wheel_r * a1.cos(), wy + wheel_r * a1.sin(), bz),
            radius: tube_r,
            color: Vec3::new(0.75, 0.75, 0.8), specular: 200.0, reflective: 0.6,
        });
    }

    let n_spk = 4;
    for i in 0..n_spk {
        let a = (i as f64) * tau / (n_spk as f64) + spin;
        scene.capsules.push(Capsule {
            a: Vec3::new(bx, wy, bz),
            b: Vec3::new(bx + wheel_r * a.cos(), wy + wheel_r * a.sin(), bz),
            radius: 0.02 * s, color: Vec3::new(0.8, 0.8, 0.85), specular: 150.0, reflective: 0.5,
        });
    }

    scene.spheres.push(Sphere { center: Vec3::new(bx, wy, bz), radius: 0.1 * s,
        color: Vec3::new(0.85, 0.85, 0.9), specular: 300.0, reflective: 0.7 });

    let seat_y = wy + 0.9 * s;
    scene.capsules.push(Capsule { a: Vec3::new(bx, wy + 0.15 * s, bz), b: Vec3::new(bx, seat_y, bz),
        radius: 0.04 * s, color: Vec3::new(0.7, 0.7, 0.75), specular: 100.0, reflective: 0.5 });

    scene.capsules.push(Capsule {
        a: Vec3::new(bx - 0.1 * s, seat_y + 0.05 * s, bz),
        b: Vec3::new(bx + 0.1 * s, seat_y + 0.05 * s, bz),
        radius: 0.06 * s, color: Vec3::new(0.3, 0.3, 0.35), specular: 50.0, reflective: 0.3 });

    let colors = [
        Vec3::new(0.0, 0.5, 0.9), Vec3::new(0.9, 0.2, 0.4), Vec3::new(0.0, 0.8, 0.4),
        Vec3::new(0.9, 0.7, 0.0), Vec3::new(0.7, 0.3, 0.9),
    ];
    let bc = colors[hue % colors.len()];
    let bob = 0.06 * s * (time * 4.0 + phase).sin();

    let hip_y = seat_y + 0.25 * s;
    let sh_y = hip_y + 0.55 * s;
    scene.capsules.push(Capsule {
        a: Vec3::new(bx, hip_y + bob, bz), b: Vec3::new(bx, sh_y + bob, bz),
        radius: 0.14 * s, color: bc, specular: 80.0, reflective: 0.4 });

    scene.spheres.push(Sphere { center: Vec3::new(bx, sh_y + 0.32 * s + bob, bz),
        radius: 0.16 * s, color: Vec3::new(0.9, 0.75, 0.65), specular: 60.0, reflective: 0.2 });

    let cr = 0.25 * s;
    let rf_x = bx + cr * pa.cos();
    let rf_y = wy + cr * pa.sin();
    let rk_x = bx + 0.12 * s * pa.cos();
    let rk_y = (rf_y + hip_y + bob) * 0.5 + 0.1 * s;

    scene.capsules.push(Capsule { a: Vec3::new(bx - 0.06 * s, hip_y + bob, bz + 0.08 * s),
        b: Vec3::new(rk_x, rk_y, bz + 0.08 * s), radius: 0.06 * s, color: bc, specular: 60.0, reflective: 0.3 });
    scene.capsules.push(Capsule { a: Vec3::new(rk_x, rk_y, bz + 0.08 * s),
        b: Vec3::new(rf_x, rf_y, bz + 0.08 * s), radius: 0.05 * s, color: bc, specular: 60.0, reflective: 0.3 });

    let lf_x = bx - cr * pa.cos();
    let lf_y = wy - cr * pa.sin();
    let lk_x = bx - 0.12 * s * pa.cos();
    let lk_y = (lf_y + hip_y + bob) * 0.5 + 0.1 * s;

    scene.capsules.push(Capsule { a: Vec3::new(bx + 0.06 * s, hip_y + bob, bz - 0.08 * s),
        b: Vec3::new(lk_x, lk_y, bz - 0.08 * s), radius: 0.06 * s, color: bc, specular: 60.0, reflective: 0.3 });
    scene.capsules.push(Capsule { a: Vec3::new(lk_x, lk_y, bz - 0.08 * s),
        b: Vec3::new(lf_x, lf_y, bz - 0.08 * s), radius: 0.05 * s, color: bc, specular: 60.0, reflective: 0.3 });

    let sw = 0.1 * s * (time * 3.0 + phase).sin();
    scene.capsules.push(Capsule { a: Vec3::new(bx, sh_y - 0.05 * s + bob, bz + 0.16 * s),
        b: Vec3::new(bx + 0.25 * s + sw, sh_y - 0.3 * s + bob, bz + 0.1 * s), radius: 0.045 * s, color: bc, specular: 60.0, reflective: 0.3 });
    scene.capsules.push(Capsule { a: Vec3::new(bx, sh_y - 0.05 * s + bob, bz - 0.16 * s),
        b: Vec3::new(bx + 0.25 * s - sw, sh_y - 0.3 * s + bob, bz - 0.1 * s), radius: 0.045 * s, color: bc, specular: 60.0, reflective: 0.3 });
}

// --- WASM ---

#[wasm_bindgen]
pub struct Raytracer {
    ctx: CanvasRenderingContext2d,
    buf: Vec<u8>,
    lights: Vec<Light>,
    camera_speed: f64,
    camera_height_offset: f64,
    maze_grid: [bool; MAZE_CELLS],
    maze_path: Vec<(usize, usize)>,
}

#[wasm_bindgen]
impl Raytracer {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement) -> Result<Raytracer, JsValue> {
        let ctx = canvas.get_context("2d")?.unwrap().dyn_into::<CanvasRenderingContext2d>()?;
        canvas.set_width(W);
        canvas.set_height(H);

        let lights = vec![
            Light { base_pos: Vec3::new(10.0, 20.0, 8.0), color: Vec3::new(1.0, 0.97, 0.9), intensity: 2.2, orbit_radius: 0.0, orbit_speed: 0.0 },
            Light { base_pos: Vec3::new(-6.0, 15.0, -5.0), color: Vec3::new(0.6, 0.7, 1.0), intensity: 0.8, orbit_radius: 0.0, orbit_speed: 0.0 },
        ];

        let (maze_grid, maze_path) = generate_maze();

        Ok(Raytracer { ctx, buf: vec![0u8; (W*H*4) as usize], lights, camera_speed: 0.1, camera_height_offset: 0.0, maze_grid, maze_path })
    }

    fn build_scene(&self, time: f64) -> Scene {
        let mut scene = Scene {
            spheres: Vec::with_capacity(20),
            capsules: Vec::with_capacity(160),
            maze: self.maze_grid,
        };

        // Stone pillars under the aqueduct at corridor cell centers
        for gy in (1..MAZE_N).step_by(2) {
            for gx in (1..MAZE_N).step_by(2) {
                if self.maze_grid[gy * MAZE_N + gx] {
                    let (wx, wz) = maze_to_world(gx, gy);
                    scene.capsules.push(Capsule {
                        a: Vec3::new(wx, FLOOR_Y, wz),
                        b: Vec3::new(wx, ROAD_Y - SLAB_H, wz),
                        radius: 0.35,
                        color: Vec3::new(0.78, 0.72, 0.6), specular: 20.0, reflective: 0.05,
                    });
                }
            }
        }

        // Single cyclist following the maze solution path
        let speed = 3.5;
        let t = time * speed;
        let (px, pz) = path_pos(&self.maze_path, t);
        build_unicyclist(&mut scene, px, pz, ROAD_Y, time, 0.0, 0);

        scene
    }

    pub fn render_frame(&mut self, time: f64) {
        let scene = self.build_scene(time);

        let ca = time * self.camera_speed;
        let cr = 24.0 + 4.0 * (time * 0.05).sin();
        let cy = 14.0 + 5.0 * (time * 0.07).sin() + self.camera_height_offset;
        let origin = Vec3::new(cr * ca.sin(), cy, cr * ca.cos());
        let (lx, lz) = path_pos(&self.maze_path, time * 3.5);
        let look_at = Vec3::new(lx, ROAD_Y + 2.0, lz);

        let forward = look_at.sub(origin).norm();
        let right = forward.cross(Vec3::new(0.0, 1.0, 0.0)).norm();
        let up = right.cross(forward);
        let fov = 0.9;
        let aspect = W as f64 / H as f64;

        for y in 0..H {
            for x in 0..W {
                let mut color = Vec3::new(0.0, 0.0, 0.0);
                for sy in 0..2u32 {
                    for sx in 0..2u32 {
                        let px = (2.0 * (x as f64 + 0.25 + 0.5 * sx as f64) / W as f64 - 1.0) * aspect * fov;
                        let py = (1.0 - 2.0 * (y as f64 + 0.25 + 0.5 * sy as f64) / H as f64) * fov;
                        let dir = forward.add(right.scale(px)).add(up.scale(py)).norm();
                        color = color.add(trace(origin, dir, &scene, &self.lights, time, 0));
                    }
                }
                color = color.scale(0.25);
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
    }

    pub fn nudge_camera(&mut self, direction: f64) {
        self.camera_height_offset += direction * 0.5;
        self.camera_height_offset = self.camera_height_offset.clamp(-5.0, 12.0);
    }

    pub fn set_speed(&mut self, speed: f64) {
        self.camera_speed = speed.clamp(0.02, 0.5);
    }
}
