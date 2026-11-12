import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
var create_canvas = function (width, height) {
  const canvas_1 = core.create_el("canvas", {
    class: "game-canvas",
    width: `${width ?? ""}`,
    height: `${height ?? ""}`,
  });
  return canvas_1;
};
var ctx = function (canvas) {
  return canvas.getContext("2d");
};
var game_loop = function (canvas, state, update_fn, render_fn) {
  const context_1 = ctx(canvas);
  const last_t_2 = squint_core.atom(core.now());
  const tick_3 = function () {
    const now_t_4 = core.now();
    const dt_5 = (now_t_4 - squint_core.deref(last_t_2)) / 1000;
    squint_core.reset_BANG_(last_t_2, now_t_4);
    squint_core.swap_BANG_(state, update_fn, dt_5);
    render_fn(context_1, squint_core.deref(state));
    return window.requestAnimationFrame(tick_3);
  };
  return tick_3();
};
var keys_down = squint_core.atom(new Set([]));
var init_keyboard_BANG_ = function () {
  window.addEventListener("keydown", function (e) {
    return squint_core.swap_BANG_(keys_down, squint_core.conj, e.code);
  });
  return window.addEventListener("keyup", function (e) {
    return squint_core.swap_BANG_(keys_down, squint_core.disj, e.code);
  });
};
var key_held_QMARK_ = function (code) {
  return squint_core.contains_QMARK_(squint_core.deref(keys_down), code);
};
var init_touch_BANG_ = function (container) {
  const touch_state_1 = squint_core.atom({
    left: false,
    right: false,
    up: false,
    action: false,
  });
  const dpad_2 = core.create_el("div", { class: "touch-controls" });
  const btn_3 = function (label, cls, key) {
    const b_4 = core.create_el(
      "button",
      { class: `${"touch-btn "}${cls ?? ""}` },
      label,
    );
    b_4.addEventListener(
      "touchstart",
      function (e) {
        e.preventDefault();
        return squint_core.swap_BANG_(
          touch_state_1,
          squint_core.assoc,
          key,
          true,
        );
      },
      { passive: false },
    );
    b_4.addEventListener(
      "touchend",
      function (e) {
        e.preventDefault();
        return squint_core.swap_BANG_(
          touch_state_1,
          squint_core.assoc,
          key,
          false,
        );
      },
      { passive: false },
    );
    b_4.addEventListener("mousedown", function (e) {
      e.preventDefault();
      return squint_core.swap_BANG_(
        touch_state_1,
        squint_core.assoc,
        key,
        true,
      );
    });
    b_4.addEventListener("mouseup", function (e) {
      e.preventDefault();
      return squint_core.swap_BANG_(
        touch_state_1,
        squint_core.assoc,
        key,
        false,
      );
    });
    b_4.addEventListener("mouseleave", function (e) {
      e.preventDefault();
      return squint_core.swap_BANG_(
        touch_state_1,
        squint_core.assoc,
        key,
        false,
      );
    });
    b_4.addEventListener("click", function (e) {
      e.preventDefault();
      squint_core.swap_BANG_(touch_state_1, squint_core.assoc, key, true);
      return setTimeout(function () {
        return squint_core.swap_BANG_(
          touch_state_1,
          squint_core.assoc,
          key,
          false,
        );
      }, 120);
    });
    return b_4;
  };
  dpad_2.appendChild(btn_3("◀", "t-left", "left"));
  dpad_2.appendChild(btn_3("▶", "t-right", "right"));
  dpad_2.appendChild(btn_3("▲", "t-up", "up"));
  dpad_2.appendChild(btn_3("●", "t-action", "action"));
  container.appendChild(dpad_2);
  return touch_state_1;
};
var clear_BANG_ = function (ctx, w, h) {
  ctx.fillStyle = "#0a0a2a";
  return ctx.fillRect(0, 0, w, h);
};
var draw_text_BANG_ = /* @__PURE__ */ (() => {
  const impl13_1 = function (ctx, text, x, y, p__14) {
    const map___2_4 = p__14;
    const map___2_5 =
      map___2_4 == null
        ? map___2_4
        : squint_core.seq_to_map_for_destructuring(map___2_4);
    const color_6 = squint_core.get(map___2_5, "color", "#00ff41");
    const font_7 = squint_core.get(map___2_5, "font", "16px 'Press Start 2P'");
    const align_8 = squint_core.get(map___2_5, "align", "left");
    ctx.fillStyle = color_6;
    ctx.font = font_7;
    ctx.textAlign = align_8;
    return ctx.fillText(text, x, y);
  };
  const f7 = function (arg8, arg9, arg10, arg11, ...rest12) {
    const self__23064__auto___9 = this;
    return impl13_1.call(
      self__23064__auto___9,
      arg8,
      arg9,
      arg10,
      arg11,
      rest12.length === 0 ? null : rest12,
    );
  };
  f7["squint$lang$variadic"] = impl13_1;
  return f7;
})();
var draw_rect_BANG_ = function (ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  return ctx.fillRect(x, y, w, h);
};
var aabb_QMARK_ = function (p__15, p__16) {
  const map___1_5 = p__15;
  const map___1_6 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_5))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_5))
      ? map___1_5
      : squint_core.seq_to_map_for_destructuring(map___1_5)
    : map___1_5;
  const ax_7 = squint_core.get(map___1_6, "x");
  const ay_8 = squint_core.get(map___1_6, "y");
  const aw_9 = squint_core.get(map___1_6, "w");
  const ah_10 = squint_core.get(map___1_6, "h");
  const map___3_11 = p__16;
  const map___3_12 = squint_core.truth_(
    squint_core.sequential_QMARK_(map___3_11),
  )
    ? squint_core.truth_(squint_core.vector_QMARK_(map___3_11))
      ? map___3_11
      : squint_core.seq_to_map_for_destructuring(map___3_11)
    : map___3_11;
  const bx_13 = squint_core.get(map___3_12, "x");
  const by_14 = squint_core.get(map___3_12, "y");
  const bw_15 = squint_core.get(map___3_12, "w");
  const bh_16 = squint_core.get(map___3_12, "h");
  if (ax_7 < bx_13 + bw_15) {
    if (bx_13 < ax_7 + aw_9) {
      if (ay_8 < by_14 + bh_16) {
        return by_14 < ay_8 + ah_10;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
};
var draw_hud_BANG_ = function (ctx, state, w) {
  draw_text_BANG_(
    ctx,
    `${"SCORE: "}${squint_core.get(state, "score", 0) ?? ""}`,
    10,
    30,
    "color",
    "#ffaa00",
    "font",
    "14px 'Press Start 2P'",
  );
  return draw_text_BANG_(
    ctx,
    `${"LIVES: "}${squint_core.get(state, "lives", 3) ?? ""}`,
    w - 10,
    30,
    "color",
    "#ff0040",
    "font",
    "14px 'Press Start 2P'",
    "align",
    "right",
  );
};

export {
  key_held_QMARK_,
  clear_BANG_,
  keys_down,
  create_canvas,
  init_keyboard_BANG_,
  game_loop,
  init_touch_BANG_,
  draw_rect_BANG_,
  draw_hud_BANG_,
  ctx,
  draw_text_BANG_,
  aabb_QMARK_,
};
