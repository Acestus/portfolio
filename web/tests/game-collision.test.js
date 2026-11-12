import { describe, expect, test } from "bun:test";
import { aabb_QMARK_ as overlaps } from "../modules/portfolio/games/engine.js";

describe("retained game collision behavior", () => {
  test("overlapping bodies collide in either order", () => {
    const player = { x: 10, y: 20, w: 16, h: 16 };
    const enemy = { x: 20, y: 28, w: 16, h: 16 };
    expect(overlaps(player, enemy)).toBe(true);
    expect(overlaps(enemy, player)).toBe(true);
  });
  test("separated or edge-touching bodies do not collide", () => {
    const player = { x: 0, y: 0, w: 10, h: 10 };
    expect(overlaps(player, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
    expect(overlaps(player, { x: 0, y: 10, w: 10, h: 10 })).toBe(false);
    expect(overlaps(player, { x: 100, y: 100, w: 10, h: 10 })).toBe(false);
  });
});
