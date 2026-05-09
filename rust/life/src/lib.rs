use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

const CELL_SIZE: u32 = 4;
const GRID_W: u32 = 200;
const GRID_H: u32 = 150;
const W: u32 = GRID_W * CELL_SIZE;
const H: u32 = GRID_H * CELL_SIZE;

#[wasm_bindgen]
pub struct Life {
    cells: Vec<bool>,
    next: Vec<bool>,
    ctx: CanvasRenderingContext2d,
    generation: u32,
    population: u32,
}

fn idx(x: u32, y: u32) -> usize {
    (y * GRID_W + x) as usize
}

#[wasm_bindgen]
impl Life {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement) -> Result<Life, JsValue> {
        let ctx = canvas
            .get_context("2d")?
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()?;
        canvas.set_width(W);
        canvas.set_height(H);

        let total = (GRID_W * GRID_H) as usize;
        let mut cells = vec![false; total];
        let next = vec![false; total];

        // Seed with interesting patterns
        let mut seed: u32 = 0xDEAD_BEEF;
        for i in 0..total {
            seed ^= seed << 13;
            seed ^= seed >> 17;
            seed ^= seed << 5;
            cells[i] = (seed % 4) == 0; // ~25% density
        }

        // Add some classic patterns
        let patterns = [
            // R-pentomino at center
            (GRID_W / 2, GRID_H / 2, vec![(0,1),(1,0),(1,1),(1,2),(2,0)]),
            // Glider gun at top-left
            (5, 5, vec![
                (0,4),(0,5),(1,4),(1,5),
                (10,4),(10,5),(10,6),(11,3),(11,7),(12,2),(12,8),(13,2),(13,8),
                (14,5),(15,3),(15,7),(16,4),(16,5),(16,6),(17,5),
                (20,2),(20,3),(20,4),(21,2),(21,3),(21,4),(22,1),(22,5),
                (24,0),(24,1),(24,5),(24,6),
                (34,2),(34,3),(35,2),(35,3),
            ]),
        ];

        for (ox, oy, pat) in &patterns {
            for (dx, dy) in pat {
                let x = ox + dx;
                let y = oy + dy;
                if x < GRID_W && y < GRID_H {
                    cells[idx(x, y)] = true;
                }
            }
        }

        Ok(Life { cells, next, ctx, generation: 0, population: 0 })
    }

    pub fn tick(&mut self) {
        let mut pop = 0u32;
        for y in 0..GRID_H {
            for x in 0..GRID_W {
                let mut neighbors = 0u8;
                for dy in [GRID_H - 1, 0, 1] {
                    for dx in [GRID_W - 1, 0, 1] {
                        if dx == 0 && dy == 0 { continue; }
                        let nx = (x + dx) % GRID_W;
                        let ny = (y + dy) % GRID_H;
                        if self.cells[idx(nx, ny)] { neighbors += 1; }
                    }
                }
                let i = idx(x, y);
                let alive = if self.cells[i] {
                    neighbors == 2 || neighbors == 3
                } else {
                    neighbors == 3
                };
                self.next[i] = alive;
                if alive { pop += 1; }
            }
        }
        std::mem::swap(&mut self.cells, &mut self.next);
        self.generation += 1;
        self.population = pop;
    }

    pub fn render(&self) {
        self.ctx.set_fill_style_str("#0a0a2a");
        self.ctx.fill_rect(0.0, 0.0, W as f64, H as f64);

        let cs = CELL_SIZE as f64;
        for y in 0..GRID_H {
            for x in 0..GRID_W {
                if self.cells[idx(x, y)] {
                    // Color by neighbor density for visual interest
                    let mut n = 0u8;
                    for dy in [GRID_H - 1, 0, 1] {
                        for dx in [GRID_W - 1, 0, 1] {
                            if dx == 0 && dy == 0 { continue; }
                            if self.cells[idx((x + dx) % GRID_W, (y + dy) % GRID_H)] { n += 1; }
                        }
                    }
                    let color = match n {
                        0..=1 => "#00d4ff",
                        2 => "#00ff41",
                        3 => "#ffaa00",
                        _ => "#ff4444",
                    };
                    self.ctx.set_fill_style_str(color);
                    self.ctx.fill_rect(
                        x as f64 * cs,
                        y as f64 * cs,
                        cs - 1.0,
                        cs - 1.0,
                    );
                }
            }
        }
    }

    pub fn toggle_at(&mut self, canvas_x: f64, canvas_y: f64) {
        let x = (canvas_x / CELL_SIZE as f64) as u32;
        let y = (canvas_y / CELL_SIZE as f64) as u32;
        if x < GRID_W && y < GRID_H {
            let i = idx(x, y);
            self.cells[i] = !self.cells[i];
        }
    }

    pub fn generation(&self) -> u32 { self.generation }
    pub fn population(&self) -> u32 { self.population }

    pub fn width(&self) -> u32 { W }
    pub fn height(&self) -> u32 { H }
}
