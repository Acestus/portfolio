use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, ImageData};

const W: u32 = 640;
const H: u32 = 480;

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
    fn norm(self) -> Vec3 { let l = self.len(); Vec3::new(self.x / l, self.y / l, self.z / l) }
    fn sub(self, o: Vec3) -> Vec3 { Vec3::new(self.x - o.x, self.y - o.y, self.z - o.z) }
    fn add(self, o: Vec3) -> Vec3 { Vec3::new(self.x + o.x, self.y + o.y, self.z + o.z) }
    fn scale(self, s: f64) -> Vec3 { Vec3::new(self.x * s, self.y * s, self.z * s) }
    fn reflect(self, n: Vec3) -> Vec3 { self.sub(n.scale(2.0 * self.dot(n))) }
}

struct Sphere {
    center: Vec3,
    radius: f64,
    color: Vec3,
    specular: f64,
    reflective: f64,
}

struct Light {
    pos: Vec3,
    intensity: f64,
}

fn intersect_sphere(origin: Vec3, dir: Vec3, sphere: &Sphere) -> Option<f64> {
    let oc = origin.sub(sphere.center);
    let a = dir.dot(dir);
    let b = 2.0 * oc.dot(dir);
    let c = oc.dot(oc) - sphere.radius * sphere.radius;
    let disc = b * b - 4.0 * a * c;
    if disc < 0.0 {
        return None;
    }
    let t = (-b - disc.sqrt()) / (2.0 * a);
    if t > 0.001 { Some(t) } else { None }
}

fn trace(
    origin: Vec3,
    dir: Vec3,
    spheres: &[Sphere],
    lights: &[Light],
    depth: u32,
) -> Vec3 {
    let mut closest_t = f64::MAX;
    let mut hit_sphere: Option<&Sphere> = None;

    for s in spheres {
        if let Some(t) = intersect_sphere(origin, dir, s) {
            if t < closest_t {
                closest_t = t;
                hit_sphere = Some(s);
            }
        }
    }

    let sky = match hit_sphere {
        None => {
            // Gradient sky
            let t = 0.5 * (dir.norm().y + 1.0);
            return Vec3::new(0.05, 0.05, 0.12).scale(1.0 - t).add(Vec3::new(0.1, 0.15, 0.3).scale(t));
        }
        Some(s) => s,
    };

    let hit_point = origin.add(dir.scale(closest_t));
    let normal = hit_point.sub(sky.center).norm();

    // Lighting
    let mut diffuse = 0.05; // ambient
    let mut spec = 0.0;
    for light in lights {
        let to_light = light.pos.sub(hit_point).norm();
        // Shadow check
        let mut in_shadow = false;
        for s in spheres {
            if intersect_sphere(hit_point.add(normal.scale(0.001)), to_light, s).is_some() {
                in_shadow = true;
                break;
            }
        }
        if !in_shadow {
            let ndl = normal.dot(to_light).max(0.0);
            diffuse += light.intensity * ndl;
            // Specular
            let refl = to_light.scale(-1.0).reflect(normal);
            let rdv = refl.dot(dir.scale(-1.0)).max(0.0);
            spec += light.intensity * rdv.powf(sky.specular);
        }
    }

    let mut color = Vec3::new(
        (sky.color.x * diffuse + spec).min(1.0),
        (sky.color.y * diffuse + spec).min(1.0),
        (sky.color.z * diffuse + spec).min(1.0),
    );

    // Reflection
    if sky.reflective > 0.0 && depth < 3 {
        let refl_dir = dir.reflect(normal);
        let refl_color = trace(hit_point.add(normal.scale(0.001)), refl_dir, spheres, lights, depth + 1);
        color = color.scale(1.0 - sky.reflective).add(refl_color.scale(sky.reflective));
    }

    color
}

#[wasm_bindgen]
pub struct Raytracer {
    ctx: CanvasRenderingContext2d,
    buf: Vec<u8>,
    spheres: Vec<Sphere>,
    lights: Vec<Light>,
    camera_angle: f64,
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

        let spheres = vec![
            // Ground plane approximated as huge sphere
            Sphere { center: Vec3::new(0.0, -1001.0, 0.0), radius: 1000.0, color: Vec3::new(0.3, 0.3, 0.35), specular: 10.0, reflective: 0.15 },
            // Main spheres
            Sphere { center: Vec3::new(0.0, 0.0, 4.0), radius: 1.0, color: Vec3::new(0.0, 0.47, 0.83), specular: 80.0, reflective: 0.4 },
            Sphere { center: Vec3::new(2.0, -0.5, 3.5), radius: 0.5, color: Vec3::new(0.0, 1.0, 0.25), specular: 200.0, reflective: 0.6 },
            Sphere { center: Vec3::new(-1.8, -0.3, 3.0), radius: 0.7, color: Vec3::new(0.83, 0.0, 0.2), specular: 50.0, reflective: 0.2 },
            Sphere { center: Vec3::new(0.8, -0.7, 2.0), radius: 0.3, color: Vec3::new(1.0, 0.85, 0.0), specular: 120.0, reflective: 0.5 },
        ];

        let lights = vec![
            Light { pos: Vec3::new(5.0, 5.0, -2.0), intensity: 0.7 },
            Light { pos: Vec3::new(-3.0, 3.0, 0.0), intensity: 0.4 },
        ];

        Ok(Raytracer { ctx, buf, spheres, lights, camera_angle: 0.0 })
    }

    pub fn render_frame(&mut self, time: f64) {
        self.camera_angle = time * 0.15;
        let cam_x = 4.0 * self.camera_angle.sin();
        let cam_z = 4.0 * self.camera_angle.cos();
        let origin = Vec3::new(cam_x, 1.0, cam_z);
        let look_at = Vec3::new(0.0, -0.2, 3.0);
        let forward = look_at.sub(origin).norm();
        let right = Vec3::new(0.0, 1.0, 0.0).sub(forward.scale(forward.dot(Vec3::new(0.0, 1.0, 0.0)))).norm();
        // Proper cross product for up
        let up = Vec3::new(
            forward.y * right.z - forward.z * right.y,
            forward.z * right.x - forward.x * right.z,
            forward.x * right.y - forward.y * right.x,
        );

        let fov = 1.2;
        let aspect = W as f64 / H as f64;

        for y in 0..H {
            for x in 0..W {
                let px = (2.0 * (x as f64 + 0.5) / W as f64 - 1.0) * aspect * fov;
                let py = (1.0 - 2.0 * (y as f64 + 0.5) / H as f64) * fov;

                let dir = forward.add(right.scale(px)).add(up.scale(py)).norm();
                let color = trace(origin, dir, &self.spheres, &self.lights, 0);

                let idx = ((y * W + x) * 4) as usize;
                self.buf[idx]     = (color.x.min(1.0) * 255.0) as u8;
                self.buf[idx + 1] = (color.y.min(1.0) * 255.0) as u8;
                self.buf[idx + 2] = (color.z.min(1.0) * 255.0) as u8;
                self.buf[idx + 3] = 255;
            }
        }

        if let Ok(img) = ImageData::new_with_u8_clamped_array_and_sh(Clamped(&self.buf), W, H) {
            let _ = self.ctx.put_image_data(&img, 0.0, 0.0);
        }
    }
}
