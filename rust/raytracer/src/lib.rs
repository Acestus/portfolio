use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, ImageData};

const W: u32 = 640;
const H: u32 = 480;

// --- Vector math ---

#[derive(Clone, Copy)]
struct Vec3 {
    x: f64,
    y: f64,
    z: f64,
}

impl Vec3 {
    fn new(x: f64, y: f64, z: f64) -> Self { Vec3 { x, y, z } }
    fn dot(self, o: Vec3) -> f64 { self.x * o.x + self.y * o.y + self.z * o.z }
    fn len(self) -> f64 { self.dot(self).sqrt() }
    fn norm(self) -> Vec3 {
        let l = self.len();
        if l < 1e-12 { return Vec3::new(0.0, 1.0, 0.0); }
        Vec3::new(self.x / l, self.y / l, self.z / l)
    }
    fn sub(self, o: Vec3) -> Vec3 { Vec3::new(self.x - o.x, self.y - o.y, self.z - o.z) }
    fn add(self, o: Vec3) -> Vec3 { Vec3::new(self.x + o.x, self.y + o.y, self.z + o.z) }
    fn scale(self, s: f64) -> Vec3 { Vec3::new(self.x * s, self.y * s, self.z * s) }
    fn reflect(self, n: Vec3) -> Vec3 { self.sub(n.scale(2.0 * self.dot(n))) }
    fn cross(self, o: Vec3) -> Vec3 {
        Vec3::new(
            self.y * o.z - self.z * o.y,
            self.z * o.x - self.x * o.z,
            self.x * o.y - self.y * o.x,
        )
    }
    fn lerp(self, o: Vec3, t: f64) -> Vec3 { self.scale(1.0 - t).add(o.scale(t)) }
}

// --- Scene objects ---

#[derive(Clone, Copy)]
struct Sphere {
    center: Vec3,
    radius: f64,
    color: Vec3,
    specular: f64,
    reflective: f64,
}

struct Light {
    base_pos: Vec3,
    color: Vec3,
    intensity: f64,
    orbit_radius: f64,
    orbit_speed: f64,
}

impl Light {
    fn pos_at(&self, t: f64) -> Vec3 {
        Vec3::new(
            self.base_pos.x + self.orbit_radius * (t * self.orbit_speed).cos(),
            self.base_pos.y,
            self.base_pos.z + self.orbit_radius * (t * self.orbit_speed).sin(),
        )
    }
}

// --- Starfield (procedural, seeded hash) ---

fn hash_star(x: u32, y: u32) -> f64 {
    let mut h = x.wrapping_mul(374761393).wrapping_add(y.wrapping_mul(668265263));
    h = (h ^ (h >> 13)).wrapping_mul(1274126177);
    h ^= h >> 16;
    (h & 0xFFFF) as f64 / 65535.0
}

fn starfield(dir: Vec3) -> Vec3 {
    // Spherical UV for consistent stars
    let u = (dir.z.atan2(dir.x) * 800.0) as u32;
    let v = (dir.y.asin() * 800.0) as u32;
    let h = hash_star(u, v);
    if h > 0.992 {
        let brightness = ((h - 0.992) / 0.008).powf(0.5);
        let tint = hash_star(u.wrapping_add(1), v);
        // Warm or cool star colors
        if tint > 0.5 {
            Vec3::new(brightness, brightness * 0.9, brightness * 0.7)
        } else {
            Vec3::new(brightness * 0.7, brightness * 0.85, brightness)
        }
    } else {
        // Deep space background — dark purple/blue gradient
        let t = 0.5 * (dir.y + 1.0);
        Vec3::new(0.01, 0.005, 0.03).lerp(Vec3::new(0.03, 0.02, 0.08), t)
    }
}

// --- Checkerboard infinite plane (y = floor_y) ---

fn intersect_floor(origin: Vec3, dir: Vec3, floor_y: f64) -> Option<f64> {
    if dir.y.abs() < 1e-8 { return None; }
    let t = (floor_y - origin.y) / dir.y;
    if t > 0.001 { Some(t) } else { None }
}

fn floor_color(hit: Vec3) -> (Vec3, f64) {
    let ix = (hit.x.floor() as i32).rem_euclid(2);
    let iz = (hit.z.floor() as i32).rem_euclid(2);
    if (ix + iz) % 2 == 0 {
        (Vec3::new(0.08, 0.06, 0.12), 0.7) // dark tile, very reflective
    } else {
        (Vec3::new(0.25, 0.2, 0.35), 0.5) // lighter tile
    }
}

// --- Ray-sphere intersection ---

fn intersect_sphere(origin: Vec3, dir: Vec3, sphere: &Sphere) -> Option<f64> {
    let oc = origin.sub(sphere.center);
    let a = dir.dot(dir);
    let b = 2.0 * oc.dot(dir);
    let c = oc.dot(oc) - sphere.radius * sphere.radius;
    let disc = b * b - 4.0 * a * c;
    if disc < 0.0 { return None; }
    let sq = disc.sqrt();
    let t1 = (-b - sq) / (2.0 * a);
    if t1 > 0.001 { return Some(t1); }
    let t2 = (-b + sq) / (2.0 * a);
    if t2 > 0.001 { Some(t2) } else { None }
}

// --- Trace ---

const FLOOR_Y: f64 = -2.0;
const MAX_DEPTH: u32 = 3;

fn trace(
    origin: Vec3,
    dir: Vec3,
    spheres: &[Sphere],
    lights: &[Light],
    time: f64,
    depth: u32,
) -> Vec3 {
    let mut closest_t = f64::MAX;
    let mut hit_idx: Option<usize> = None;
    let mut hit_floor = false;

    for (i, s) in spheres.iter().enumerate() {
        if let Some(t) = intersect_sphere(origin, dir, s) {
            if t < closest_t {
                closest_t = t;
                hit_idx = Some(i);
                hit_floor = false;
            }
        }
    }

    // Floor
    if let Some(t) = intersect_floor(origin, dir, FLOOR_Y) {
        if t < closest_t {
            closest_t = t;
            hit_idx = None;
            hit_floor = true;
        }
    }

    if !hit_floor && hit_idx.is_none() {
        return starfield(dir.norm());
    }

    let hit_point = origin.add(dir.scale(closest_t));

    let (normal, base_color, specular_exp, reflective) = if hit_floor {
        let (fc, refl) = floor_color(hit_point);
        (Vec3::new(0.0, 1.0, 0.0), fc, 30.0, refl)
    } else {
        let s = &spheres[hit_idx.unwrap()];
        let n = hit_point.sub(s.center).norm();
        (n, s.color, s.specular, s.reflective)
    };

    // Lighting with colored lights
    let mut diffuse = Vec3::new(0.02, 0.02, 0.03); // dim ambient
    let mut spec = Vec3::new(0.0, 0.0, 0.0);

    for light in lights {
        let lp = light.pos_at(time);
        let to_light = lp.sub(hit_point);
        let light_dist = to_light.len();
        let to_light_n = to_light.scale(1.0 / light_dist);

        // Shadow check
        let shadow_origin = hit_point.add(normal.scale(0.001));
        let mut in_shadow = false;
        for s in spheres {
            if let Some(st) = intersect_sphere(shadow_origin, to_light_n, s) {
                if st < light_dist {
                    in_shadow = true;
                    break;
                }
            }
        }

        if !in_shadow {
            let ndl = normal.dot(to_light_n).max(0.0);
            let attenuation = light.intensity / (1.0 + light_dist * 0.02);
            diffuse = diffuse.add(light.color.scale(ndl * attenuation));

            // Blinn-Phong specular
            let half = to_light_n.sub(dir.norm()).norm();
            let ndh = normal.dot(half).max(0.0);
            spec = spec.add(light.color.scale(ndh.powf(specular_exp) * attenuation));
        }
    }

    let mut color = Vec3::new(
        (base_color.x * diffuse.x + spec.x).min(1.0),
        (base_color.y * diffuse.y + spec.y).min(1.0),
        (base_color.z * diffuse.z + spec.z).min(1.0),
    );

    // Reflection
    if reflective > 0.0 && depth < MAX_DEPTH {
        let refl_dir = dir.reflect(normal);
        let refl_origin = hit_point.add(normal.scale(0.001));
        let refl_color = trace(refl_origin, refl_dir, spheres, lights, time, depth + 1);
        color = color.scale(1.0 - reflective).add(refl_color.scale(reflective));
    }

    // Rim glow on spheres (Mind's Eye edge lighting)
    if hit_idx.is_some() {
        let rim = 1.0 - normal.dot(dir.scale(-1.0).norm()).max(0.0);
        let rim = rim.powf(3.0) * 0.4;
        color = color.add(Vec3::new(0.2, 0.4, 1.0).scale(rim));
    }

    color
}

// --- Gamma correction ---

fn gamma(v: f64) -> u8 {
    (v.max(0.0).min(1.0).powf(1.0 / 2.2) * 255.0) as u8
}

// --- WASM interface ---

#[wasm_bindgen]
pub struct Raytracer {
    ctx: CanvasRenderingContext2d,
    buf: Vec<u8>,
    lights: Vec<Light>,
    camera_speed: f64,
    camera_height_offset: f64,
}

#[wasm_bindgen]
impl Raytracer {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement) -> Result<Raytracer, JsValue> {
        let ctx = canvas
            .get_context("2d")?
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()?;
        canvas.set_width(W);
        canvas.set_height(H);

        let buf = vec![0u8; (W * H * 4) as usize];

        // Colored orbiting lights — Mind's Eye dramatic lighting
        let lights = vec![
            Light { base_pos: Vec3::new(5.0, 6.0, 0.0),  color: Vec3::new(0.6, 0.8, 1.0),  intensity: 1.2, orbit_radius: 4.0, orbit_speed: 0.3 },
            Light { base_pos: Vec3::new(-3.0, 4.0, 2.0), color: Vec3::new(1.0, 0.4, 0.8),  intensity: 0.8, orbit_radius: 3.0, orbit_speed: -0.5 },
            Light { base_pos: Vec3::new(0.0, 8.0, -2.0), color: Vec3::new(1.0, 0.95, 0.6), intensity: 0.6, orbit_radius: 2.0, orbit_speed: 0.7 },
        ];

        Ok(Raytracer { ctx, buf, lights, camera_speed: 0.12, camera_height_offset: 0.0 })
    }

    /// Build the animated scene for a given time
    fn build_scene(&self, time: f64) -> Vec<Sphere> {
        let t = time;

        // Central chrome orb — slowly pulsing
        let pulse = 1.0 + 0.15 * (t * 0.8).sin();
        let main = Sphere {
            center: Vec3::new(0.0, 0.5 * (t * 0.3).sin(), 0.0),
            radius: 1.2 * pulse,
            color: Vec3::new(0.85, 0.85, 0.9), // chrome
            specular: 300.0,
            reflective: 0.85,
        };

        // Orbiting satellites — 4 spheres in different orbital planes
        let sat1 = Sphere {
            center: Vec3::new(
                3.0 * (t * 0.4).cos(),
                1.0 + 0.8 * (t * 0.6).sin(),
                3.0 * (t * 0.4).sin(),
            ),
            radius: 0.5 + 0.1 * (t * 1.2).sin(),
            color: Vec3::new(0.0, 0.6, 1.0), // cyan-blue
            specular: 200.0,
            reflective: 0.7,
        };

        let sat2 = Sphere {
            center: Vec3::new(
                2.5 * (t * 0.55 + 2.0).cos(),
                -0.5 + 1.2 * (t * 0.35).sin(),
                2.5 * (t * 0.55 + 2.0).sin(),
            ),
            radius: 0.4 + 0.08 * (t * 1.5).cos(),
            color: Vec3::new(1.0, 0.2, 0.5), // magenta
            specular: 150.0,
            reflective: 0.75,
        };

        let sat3 = Sphere {
            center: Vec3::new(
                4.0 * (t * 0.25 + 4.0).cos(),
                0.3 + 0.5 * (t * 0.9).cos(),
                4.0 * (t * 0.25 + 4.0).sin(),
            ),
            radius: 0.7,
            color: Vec3::new(1.0, 0.85, 0.0), // gold
            specular: 250.0,
            reflective: 0.8,
        };

        let sat4 = Sphere {
            center: Vec3::new(
                1.8 * (t * 0.7 + 1.0).sin(),
                1.5 + 0.4 * (t * 0.45).cos(),
                1.8 * (t * 0.7 + 1.0).cos(),
            ),
            radius: 0.3,
            color: Vec3::new(0.2, 1.0, 0.4), // emerald
            specular: 180.0,
            reflective: 0.9,
        };

        // Tiny orbiting moons around the main sphere
        let moon1 = Sphere {
            center: Vec3::new(
                1.8 * (t * 1.2).cos(),
                0.5 * (t * 0.3).sin() + 0.4 * (t * 1.8).sin(),
                1.8 * (t * 1.2).sin(),
            ),
            radius: 0.15,
            color: Vec3::new(0.9, 0.9, 1.0),
            specular: 400.0,
            reflective: 0.95,
        };

        let moon2 = Sphere {
            center: Vec3::new(
                2.0 * (t * -0.9 + 3.14).cos(),
                0.5 * (t * 0.3).sin() + 0.6 * (t * 1.1 + 1.0).cos(),
                2.0 * (t * -0.9 + 3.14).sin(),
            ),
            radius: 0.12,
            color: Vec3::new(1.0, 0.7, 0.9),
            specular: 400.0,
            reflective: 0.95,
        };

        vec![main, sat1, sat2, sat3, sat4, moon1, moon2]
    }

    pub fn render_frame(&mut self, time: f64) {
        let spheres = self.build_scene(time);

        // Sweeping camera — figure-8 path, slowly rising and falling
        let cam_angle = time * self.camera_speed;
        let cam_r = 7.0 + 2.0 * (time * 0.08).sin();
        let cam_y = 2.5 + 1.5 * (time * 0.1).sin() + self.camera_height_offset;
        let origin = Vec3::new(
            cam_r * cam_angle.sin(),
            cam_y,
            cam_r * cam_angle.cos(),
        );
        let look_at = Vec3::new(
            0.5 * (time * 0.05).sin(),
            0.3 * (time * 0.07).cos(),
            0.0,
        );

        let forward = look_at.sub(origin).norm();
        let world_up = Vec3::new(0.0, 1.0, 0.0);
        let right = forward.cross(world_up).norm();
        let up = right.cross(forward);

        let fov = 1.0;
        let aspect = W as f64 / H as f64;

        for y in 0..H {
            for x in 0..W {
                let px = (2.0 * (x as f64 + 0.5) / W as f64 - 1.0) * aspect * fov;
                let py = (1.0 - 2.0 * (y as f64 + 0.5) / H as f64) * fov;

                let dir = forward.add(right.scale(px)).add(up.scale(py)).norm();
                let color = trace(origin, dir, &spheres, &self.lights, time, 0);

                let idx = ((y * W + x) * 4) as usize;
                self.buf[idx]     = gamma(color.x);
                self.buf[idx + 1] = gamma(color.y);
                self.buf[idx + 2] = gamma(color.z);
                self.buf[idx + 3] = 255;
            }
        }

        if let Ok(img) = ImageData::new_with_u8_clamped_array_and_sh(Clamped(&self.buf), W, H) {
            let _ = self.ctx.put_image_data(&img, 0.0, 0.0);
        }
    }

    /// Click to shift camera height — gives the user control
    pub fn nudge_camera(&mut self, direction: f64) {
        self.camera_height_offset += direction * 0.5;
        self.camera_height_offset = self.camera_height_offset.clamp(-3.0, 6.0);
    }

    /// Change camera orbit speed
    pub fn set_speed(&mut self, speed: f64) {
        self.camera_speed = speed.clamp(0.02, 0.5);
    }
}
