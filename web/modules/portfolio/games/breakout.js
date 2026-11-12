import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
import * as eng from "./engine.js";
import * as portfolio_DOT_games_DOT_engine from "./engine.js";
var W = 480;
var H = 400;
var brick_labels = [
  "Functions",
  "Storage",
  "KeyVault",
  "VNET",
  "AKS",
  "Sentinel",
  "Fabric",
  "EventHub",
  "APIM",
  "Entra",
  "Monitor",
  "Bicep",
  "DevOps",
  "Policy",
  "DNS",
  "Firewall",
  "CDN",
  "SQL",
  "Cosmos",
  "Redis",
];
var brick_colors = [
  "#00d4ff",
  "#00ff41",
  "#ffaa00",
  "#ff0040",
  "#cc66ff",
  "#00d4ff",
  "#00ff41",
  "#ffaa00",
  "#ff0040",
  "#cc66ff",
  "#00d4ff",
  "#00ff41",
  "#ffaa00",
  "#ff0040",
  "#cc66ff",
  "#00d4ff",
  "#00ff41",
  "#ffaa00",
  "#ff0040",
  "#cc66ff",
];
var make_bricks = function () {
  return squint_core.vec(
    squint_core.lazy(function* () {
      for (let G__1 of squint_core.iterable(squint_core.range(4))) {
        const row_2 = G__1;
        for (let G__3 of squint_core.iterable(squint_core.range(5))) {
          const col_4 = G__3;
          yield yield* (function* () {
            const idx_5 = row_2 * 5 + col_4;
            return {
              x: 15 + col_4 * 94,
              y: 50 + row_2 * 30,
              w: 84,
              h: 22,
              label: squint_core.nth(brick_labels, idx_5),
              color: squint_core.nth(brick_colors, idx_5),
              alive: true,
            };
          })();
        }
      }
      return null;
    }),
  );
};
var initial_state = function () {
  return {
    paddle: { x: W / 2 - 40, y: H - 30, w: 80, h: 12 },
    ball: { x: W / 2, y: H - 50, w: 10, h: 10, vx: 150, vy: -200 },
    bricks: make_bricks(),
    score: 0,
    lives: 3,
    phase: "playing",
  };
};
var update_game = function (state, dt, touch) {
  if (!("playing" === squint_core.get(state, "phase"))) {
    return state;
  } else {
    const ts_16 = squint_core.deref(touch);
    const left_17 = (() => {
      const or_18_19 = eng.key_held_QMARK_("ArrowLeft");
      if (squint_core.truth_(or_18_19)) {
        return or_18_19;
      } else {
        const or_20_21 = eng.key_held_QMARK_("KeyA");
        if (squint_core.truth_(or_20_21)) {
          return or_20_21;
        } else {
          return squint_core.get(ts_16, "left");
        }
      }
    })();
    const right_22 = (() => {
      const or_23_24 = eng.key_held_QMARK_("ArrowRight");
      if (squint_core.truth_(or_23_24)) {
        return or_23_24;
      } else {
        const or_25_26 = eng.key_held_QMARK_("KeyD");
        if (squint_core.truth_(or_25_26)) {
          return or_25_26;
        } else {
          return squint_core.get(ts_16, "right");
        }
      }
    })();
    const dx_27 = squint_core.truth_(left_17)
      ? -300
      : squint_core.truth_(right_22)
        ? 300
        : "else"
          ? 0
          : null;
    const paddle_28 = squint_core.update(
      squint_core.get(state, "paddle"),
      "x",
      function (_PERCENT_1) {
        return squint_core.max(
          0,
          squint_core.min(W - 80, _PERCENT_1 + dx_27 * dt),
        );
      },
    );
    const ball_29 = squint_core.get(state, "ball");
    const bx_30 =
      squint_core.get(ball_29, "x") + squint_core.get(ball_29, "vx") * dt;
    const by_31 =
      squint_core.get(ball_29, "y") + squint_core.get(ball_29, "vy") * dt;
    const vec___1_32 =
      bx_30 < 0
        ? [0, squint_core.abs(squint_core.get(ball_29, "vx"))]
        : bx_30 > W - 10
          ? [W - 10, -squint_core.abs(squint_core.get(ball_29, "vx"))]
          : "else"
            ? [bx_30, squint_core.get(ball_29, "vx")]
            : null;
    const bx_33 = squint_core.nth(vec___1_32, 0, null);
    const vx_34 = squint_core.nth(vec___1_32, 1, null);
    const vec___4_35 =
      by_31 < 0
        ? [0, squint_core.abs(squint_core.get(ball_29, "vy"))]
        : [by_31, squint_core.get(ball_29, "vy")];
    const by_36 = squint_core.nth(vec___4_35, 0, null);
    const vy_37 = squint_core.nth(vec___4_35, 1, null);
    const ball_rect_38 = { x: bx_33, y: by_36, w: 10, h: 10 };
    const vec___7_39 = squint_core.truth_(
      eng.aabb_QMARK_(ball_rect_38, paddle_28),
    )
      ? [squint_core.get(paddle_28, "y") - 10, -squint_core.abs(vy_37)]
      : [by_36, vy_37];
    const by_40 = squint_core.nth(vec___7_39, 0, null);
    const vy_41 = squint_core.nth(vec___7_39, 1, null);
    const vec___10_42 = squint_core.reduce(
      function (p__20, brick) {
        const vec___43_46 = p__20;
        const bs_47 = squint_core.nth(vec___43_46, 0, null);
        const sc_48 = squint_core.nth(vec___43_46, 1, null);
        const v_49 = squint_core.nth(vec___43_46, 2, null);
        if (
          squint_core.truth_(
            (() => {
              const and_50_51 = squint_core.get(brick, "alive");
              if (squint_core.truth_(and_50_51)) {
                return eng.aabb_QMARK_(
                  { x: bx_33, y: by_40, w: 10, h: 10 },
                  brick,
                );
              } else {
                return and_50_51;
              }
            })(),
          )
        ) {
          return [
            squint_core.mapv(function (_PERCENT_1) {
              if (squint_core._EQ_(_PERCENT_1, brick)) {
                return squint_core.assoc(_PERCENT_1, "alive", false);
              } else {
                return _PERCENT_1;
              }
            }, bs_47),
            sc_48 + 100,
            -v_49,
          ];
        } else {
          return [bs_47, sc_48, v_49];
        }
      },
      [squint_core.get(state, "bricks"), 0, vy_41],
      squint_core.get(state, "bricks"),
    );
    const bricks_52 = squint_core.nth(vec___10_42, 0, null);
    const score_add_53 = squint_core.nth(vec___10_42, 1, null);
    const vy2_54 = squint_core.nth(vec___10_42, 2, null);
    const vec___13_55 =
      by_40 > H
        ? [
            squint_core.get(state, "lives") - 1,
            H - 50,
            -squint_core.abs(vy2_54),
            squint_core.get(state, "lives") <= 1 ? "lose" : "playing",
          ]
        : [squint_core.get(state, "lives"), by_40, vy2_54, "playing"];
    const lives_56 = squint_core.nth(vec___13_55, 0, null);
    const by_57 = squint_core.nth(vec___13_55, 1, null);
    const vy2_58 = squint_core.nth(vec___13_55, 2, null);
    const phase_59 = squint_core.nth(vec___13_55, 3, null);
    const all_dead_60 = squint_core.every_QMARK_(function (_PERCENT_1) {
      return squint_core.not(squint_core.get(_PERCENT_1, "alive"));
    }, bricks_52);
    const phase_61 = all_dead_60 ? "win" : phase_59;
    return {
      paddle: paddle_28,
      ball: { x: bx_33, y: by_57, w: 10, h: 10, vx: vx_34, vy: vy2_58 },
      bricks: bricks_52,
      score: squint_core.get(state, "score") + score_add_53,
      lives: lives_56,
      phase: phase_61,
    };
  }
};
var render_game = function (ctx, state) {
  eng.clear_BANG_(ctx, W, H);
  for (let G__1 of squint_core.iterable(squint_core.get(state, "bricks"))) {
    const b_2 = G__1;
    if (squint_core.truth_(squint_core.get(b_2, "alive"))) {
      eng.draw_rect_BANG_(
        ctx,
        squint_core.get(b_2, "x"),
        squint_core.get(b_2, "y"),
        squint_core.get(b_2, "w"),
        squint_core.get(b_2, "h"),
        squint_core.get(b_2, "color"),
      );
      eng.draw_text_BANG_(
        ctx,
        squint_core.get(b_2, "label"),
        squint_core.get(b_2, "x") + 4,
        squint_core.get(b_2, "y") + 16,
        "color",
        "#0a0a2a",
        "font",
        "10px 'Press Start 2P'",
      );
    }
  }
  const p_3 = squint_core.get(state, "paddle");
  eng.draw_rect_BANG_(
    ctx,
    squint_core.get(p_3, "x"),
    squint_core.get(p_3, "y"),
    squint_core.get(p_3, "w"),
    squint_core.get(p_3, "h"),
    "#00ff41",
  );
  const b_4 = squint_core.get(state, "ball");
  eng.draw_rect_BANG_(
    ctx,
    squint_core.get(b_4, "x"),
    squint_core.get(b_4, "y"),
    squint_core.get(b_4, "w"),
    squint_core.get(b_4, "h"),
    "#ffffff",
  );
  eng.draw_hud_BANG_(ctx, state, W);
  if ("win" === squint_core.get(state, "phase")) {
    eng.draw_text_BANG_(
      ctx,
      "ALL BRICKS CLEARED!",
      W / 2,
      H / 2,
      "color",
      "#00ff41",
      "font",
      "16px 'Press Start 2P'",
      "align",
      "center",
    );
  }
  if ("lose" === squint_core.get(state, "phase")) {
    return eng.draw_text_BANG_(
      ctx,
      "GAME OVER",
      W / 2,
      H / 2,
      "color",
      "#ff0040",
      "font",
      "20px 'Press Start 2P'",
      "align",
      "center",
    );
  }
};
var init = function () {
  eng.init_keyboard_BANG_();
  const canvas_1 = eng.create_canvas(W, H);
  const wrapper_2 = core.create_el("div", { class: "game-wrapper" });
  const controls_3 = core.create_el("div", {
    class: "touch-controls-container",
  });
  const state_4 = squint_core.atom(initial_state());
  const touch_5 = eng.init_touch_BANG_(controls_3);
  wrapper_2.appendChild(canvas_1);
  wrapper_2.appendChild(controls_3);
  core.mount_BANG_(
    ui.page_shell(
      "breakout",
      "/articles/tech-breakout.html",
      "web/modules/portfolio/games/breakout.js",
      wrapper_2,
    ),
  );
  return eng.game_loop(
    canvas_1,
    state_4,
    function (_PERCENT_1, _PERCENT_2) {
      return update_game(_PERCENT_1, _PERCENT_2, touch_5);
    },
    render_game,
  );
};

export { init };
