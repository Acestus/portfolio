import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
import * as eng from "./engine.js";
import * as portfolio_DOT_games_DOT_engine from "./engine.js";
var W = 480;
var H = 320;
var platforms = [
  { x: 0, y: 280, w: 480, h: 40, color: "#1a1a4a" },
  { x: 60, y: 220, w: 80, h: 12, color: "#00d4ff" },
  { x: 200, y: 180, w: 80, h: 12, color: "#00ff41" },
  { x: 340, y: 140, w: 80, h: 12, color: "#ffaa00" },
  { x: 140, y: 100, w: 80, h: 12, color: "#ff0040" },
  { x: 300, y: 60, w: 100, h: 12, color: "#00d4ff" },
];
var collectibles = [
  { x: 90, y: 200, w: 16, h: 16, icon: "⚡", collected: false },
  { x: 230, y: 160, w: 16, h: 16, icon: "☁", collected: false },
  { x: 370, y: 120, w: 16, h: 16, icon: "🔒", collected: false },
  { x: 170, y: 80, w: 16, h: 16, icon: "⚙", collected: false },
  { x: 340, y: 40, w: 16, h: 16, icon: "★", collected: false },
];
var initial_state = function () {
  return {
    player: { x: 40, y: 240, w: 20, h: 24, vx: 0, vy: 0, grounded: false },
    platforms: platforms,
    collectibles: collectibles,
    score: 0,
    lives: 3,
    phase: "playing",
  };
};
var apply_gravity = function (player, dt) {
  return squint_core.update(player, "vy", squint_core._PLUS_, 600 * dt);
};
var apply_input = function (player, touch_state) {
  const left_1 = (() => {
    const or_2_3 = eng.key_held_QMARK_("ArrowLeft");
    if (squint_core.truth_(or_2_3)) {
      return or_2_3;
    } else {
      return squint_core.get(squint_core.deref(touch_state), "left");
    }
  })();
  const right_4 = (() => {
    const or_5_6 = eng.key_held_QMARK_("ArrowRight");
    if (squint_core.truth_(or_5_6)) {
      return or_5_6;
    } else {
      return squint_core.get(squint_core.deref(touch_state), "right");
    }
  })();
  const jump_7 = (() => {
    const or_8_9 = eng.key_held_QMARK_("ArrowUp");
    if (squint_core.truth_(or_8_9)) {
      return or_8_9;
    } else {
      const or_10_11 = eng.key_held_QMARK_("Space");
      if (squint_core.truth_(or_10_11)) {
        return or_10_11;
      } else {
        return squint_core.get(squint_core.deref(touch_state), "up");
      }
    }
  })();
  const vx_12 = squint_core.truth_(left_1)
    ? -160
    : squint_core.truth_(right_4)
      ? 160
      : "else"
        ? 0
        : null;
  const vy_13 = squint_core.truth_(
    squint_core.truth_(jump_7) ? squint_core.get(player, "grounded") : jump_7,
  )
    ? -320
    : squint_core.get(player, "vy");
  return squint_core.assoc(player, "vx", vx_12, "vy", vy_13);
};
var move_player = function (player, dt) {
  return squint_core.assoc(
    squint_core.update(
      squint_core.update(
        player,
        "x",
        squint_core._PLUS_,
        squint_core.get(player, "vx") * dt,
      ),
      "y",
      squint_core._PLUS_,
      squint_core.get(player, "vy") * dt,
    ),
    "grounded",
    false,
  );
};
var collide_platforms = function (player, plats) {
  return squint_core.reduce(
    function (p, plat) {
      if (
        squint_core.truth_(
          (() => {
            const and_1_2 = eng.aabb_QMARK_(p, plat);
            if (squint_core.truth_(and_1_2)) {
              if (squint_core.get(p, "vy") > 0) {
                return (
                  squint_core.get(p, "y") - squint_core.get(p, "vy") * 0.017 <
                  squint_core.get(plat, "y")
                );
              } else {
                return false;
              }
            } else {
              return and_1_2;
            }
          })(),
        )
      ) {
        return squint_core.assoc(
          p,
          "y",
          squint_core.get(plat, "y") - squint_core.get(p, "h"),
          "vy",
          0,
          "grounded",
          true,
        );
      } else {
        return p;
      }
    },
    player,
    plats,
  );
};
var collect_items = function (state) {
  const player_1 = squint_core.get(state, "player");
  return squint_core.reduce_kv(
    function (s, idx, item) {
      if (
        squint_core.truth_(
          squint_core.not(squint_core.get(item, "collected")) &&
            eng.aabb_QMARK_(player_1, item),
        )
      ) {
        return squint_core.update(
          squint_core.assoc_in(s, ["collectibles", idx, "collected"], true),
          "score",
          squint_core._PLUS_,
          100,
        );
      } else {
        return s;
      }
    },
    state,
    squint_core.vec(squint_core.get(state, "collectibles")),
  );
};
var clamp_bounds = function (player) {
  const G__17_1 = squint_core.update(player, "x", function (_PERCENT_1) {
    return squint_core.max(
      0,
      squint_core.min(W - squint_core.get(player, "w"), _PERCENT_1),
    );
  });
  if (squint_core.get(player, "y") > H - 20) {
    return squint_core.assoc(G__17_1, "y", 240, "vy", 0);
  } else {
    return G__17_1;
  }
};
var update_game = function (state, dt, touch_state) {
  if (!("playing" === squint_core.get(state, "phase"))) {
    return state;
  } else {
    const all_collected_1 = squint_core.every_QMARK_(
      "collected",
      squint_core.get(state, "collectibles"),
    );
    if (all_collected_1) {
      return squint_core.assoc(state, "phase", "win");
    } else {
      return collect_items(
        squint_core.update(state, "player", function (_PERCENT_1) {
          return clamp_bounds(
            collide_platforms(
              move_player(
                apply_gravity(apply_input(_PERCENT_1, touch_state), dt),
                dt,
              ),
              squint_core.get(state, "platforms"),
            ),
          );
        }),
      );
    }
  }
};
var render_game = function (ctx, state) {
  eng.clear_BANG_(ctx, W, H);
  for (let G__1 of squint_core.iterable(squint_core.get(state, "platforms"))) {
    const p_2 = G__1;
    eng.draw_rect_BANG_(
      ctx,
      squint_core.get(p_2, "x"),
      squint_core.get(p_2, "y"),
      squint_core.get(p_2, "w"),
      squint_core.get(p_2, "h"),
      squint_core.get(p_2, "color"),
    );
  }
  for (let G__3 of squint_core.iterable(
    squint_core.get(state, "collectibles"),
  )) {
    const c_4 = G__3;
    if (squint_core.truth_(squint_core.get(c_4, "collected"))) {
    } else {
      eng.draw_text_BANG_(
        ctx,
        squint_core.get(c_4, "icon"),
        squint_core.get(c_4, "x"),
        squint_core.get(c_4, "y") + 14,
        "font",
        "16px serif",
        "color",
        "#ffaa00",
      );
    }
  }
  const p_5 = squint_core.get(state, "player");
  eng.draw_rect_BANG_(
    ctx,
    squint_core.get(p_5, "x"),
    squint_core.get(p_5, "y"),
    squint_core.get(p_5, "w"),
    squint_core.get(p_5, "h"),
    "#00ff41",
  );
  eng.draw_hud_BANG_(ctx, state, W);
  if ("win" === squint_core.get(state, "phase")) {
    eng.draw_text_BANG_(
      ctx,
      "LEVEL COMPLETE!",
      W / 2,
      H / 2,
      "color",
      "#00ff41",
      "font",
      "20px 'Press Start 2P'",
      "align",
      "center",
    );
    return eng.draw_text_BANG_(
      ctx,
      `${"SCORE: "}${squint_core.get(state, "score") ?? ""}`,
      W / 2,
      H / 2 + 40,
      "color",
      "#ffaa00",
      "font",
      "14px 'Press Start 2P'",
      "align",
      "center",
    );
  }
};
var init = function () {
  eng.init_keyboard_BANG_();
  const canvas_1 = eng.create_canvas(W, H);
  const wrapper_2 = core.create_el("div", { class: "game-wrapper" });
  const state_3 = squint_core.atom(initial_state());
  const touch_st_4 = squint_core.atom({
    left: false,
    right: false,
    up: false,
    action: false,
  });
  wrapper_2.appendChild(canvas_1);
  const touch_5 = eng.init_touch_BANG_(wrapper_2);
  squint_core.reset_BANG_(touch_st_4, squint_core.deref(touch_5));
  squint_core.add_watch(touch_5, "sync", function (_, __6, __7, new$) {
    return squint_core.reset_BANG_(touch_st_4, new$);
  });
  core.mount_BANG_(
    ui.page_shell(
      "platformer",
      "/articles/cloud-platformer.html",
      "web/modules/portfolio/games/platformer.js",
      wrapper_2,
    ),
  );
  return eng.game_loop(
    canvas_1,
    state_3,
    function (s, dt) {
      return update_game(s, dt, touch_st_4);
    },
    render_game,
  );
};

export { init };
