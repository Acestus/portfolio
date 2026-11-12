import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
import * as eng from "./engine.js";
import * as portfolio_DOT_games_DOT_engine from "./engine.js";
var W = 480;
var H = 400;
var threat_types = [
  { icon: "🔓", label: "Open Port", color: "#ff0040" },
  { icon: "📂", label: "Public Blob", color: "#ff6600" },
  { icon: "🔑", label: "No MFA", color: "#ff3366" },
  { icon: "🌐", label: "No NSG", color: "#cc0066" },
  { icon: "💾", label: "No Backup", color: "#ff4444" },
];
var powerup_types = [
  { icon: "🛡", label: "Sentinel", color: "#00d4ff" },
  { icon: "🔥", label: "WAF", color: "#00ff41" },
  { icon: "🔒", label: "Defender", color: "#ffaa00" },
];
var spawn_invaders = function () {
  return squint_core.vec(
    squint_core.lazy(function* () {
      for (let G__1 of squint_core.iterable(squint_core.range(4))) {
        const row_2 = G__1;
        for (let G__3 of squint_core.iterable(squint_core.range(8))) {
          const col_4 = G__3;
          yield yield* (function* () {
            const threat_5 = squint_core.nth(
              threat_types,
              squint_core.mod(row_2 + col_4, squint_core.count(threat_types)),
            );
            return squint_core.merge(threat_5, {
              x: 30 + col_4 * 52,
              y: 40 + row_2 * 40,
              w: 24,
              h: 24,
              alive: true,
              dir: 1,
            });
          })();
        }
      }
      return null;
    }),
  );
};
var initial_state = function () {
  return {
    powerups: [],
    bullets: [],
    "move-timer": 0,
    "shoot-cooldown": 0,
    phase: "playing",
    invaders: spawn_invaders(),
    score: 0,
    player: { x: W / 2 - 16, y: H - 40, w: 32, h: 16 },
    "invader-dir": 1,
    lives: 3,
  };
};
var fire_bullet = function (state) {
  const p_1 = squint_core.get(state, "player");
  return squint_core.update(state, "bullets", squint_core.conj, {
    x: squint_core.get(p_1, "x") + 14,
    y: squint_core.get(p_1, "y"),
    w: 4,
    h: 10,
  });
};
var update_game = function (state, dt, touch) {
  if (!("playing" === squint_core.get(state, "phase"))) {
    return state;
  } else {
    const ts_10 = squint_core.deref(touch);
    const left_11 = (() => {
      const or_12_13 = eng.key_held_QMARK_("ArrowLeft");
      if (squint_core.truth_(or_12_13)) {
        return or_12_13;
      } else {
        const or_14_15 = eng.key_held_QMARK_("KeyA");
        if (squint_core.truth_(or_14_15)) {
          return or_14_15;
        } else {
          return squint_core.get(ts_10, "left");
        }
      }
    })();
    const right_16 = (() => {
      const or_17_18 = eng.key_held_QMARK_("ArrowRight");
      if (squint_core.truth_(or_17_18)) {
        return or_17_18;
      } else {
        const or_19_20 = eng.key_held_QMARK_("KeyD");
        if (squint_core.truth_(or_19_20)) {
          return or_19_20;
        } else {
          return squint_core.get(ts_10, "right");
        }
      }
    })();
    const shoot_21 = (() => {
      const or_22_23 = eng.key_held_QMARK_("Space");
      if (squint_core.truth_(or_22_23)) {
        return or_22_23;
      } else {
        const or_24_25 = eng.key_held_QMARK_("ArrowUp");
        if (squint_core.truth_(or_24_25)) {
          return or_24_25;
        } else {
          const or_26_27 = squint_core.get(ts_10, "up");
          if (squint_core.truth_(or_26_27)) {
            return or_26_27;
          } else {
            return squint_core.get(ts_10, "action");
          }
        }
      }
    })();
    const dx_28 = squint_core.truth_(left_11)
      ? -200
      : squint_core.truth_(right_16)
        ? 200
        : "else"
          ? 0
          : null;
    const player_29 = squint_core.update(
      squint_core.get(state, "player"),
      "x",
      function (_PERCENT_1) {
        return squint_core.max(
          0,
          squint_core.min(W - 32, _PERCENT_1 + dx_28 * dt),
        );
      },
    );
    const bullets_30 = squint_core.vec(
      squint_core.filter(
        function (_PERCENT_1) {
          return squint_core.get(_PERCENT_1, "y") > -10;
        },
        squint_core.map(
          function (_PERCENT_1) {
            return squint_core.update(_PERCENT_1, "y", squint_core._, 400 * dt);
          },
          squint_core.get(state, "bullets"),
        ),
      ),
    );
    const mt_31 = squint_core.get(state, "move-timer") + dt;
    const cur_invaders_32 = squint_core.get(state, "invaders");
    const cur_dir_33 = (() => {
      const or_34_35 = squint_core.get(state, "invader-dir");
      if (squint_core.truth_(or_34_35)) {
        return or_34_35;
      } else {
        return 1;
      }
    })();
    const vec___1_36 =
      mt_31 > 0.8
        ? (() => {
            const alive_37 = squint_core.filter("alive", cur_invaders_32);
            const min_x_38 = squint_core.apply(
              squint_core.min,
              squint_core.map("x", alive_37),
            );
            const max_x_39 = squint_core.apply(
              squint_core.max,
              squint_core.map(function (_PERCENT_1) {
                return (
                  squint_core.get(_PERCENT_1, "x") +
                  squint_core.get(_PERCENT_1, "w")
                );
              }, alive_37),
            );
            const hit_edge_40 =
              min_x_38 + cur_dir_33 * 20 < 0 || max_x_39 + cur_dir_33 * 20 > W;
            const next_dir_41 = hit_edge_40 ? -cur_dir_33 : cur_dir_33;
            const moved_42 = squint_core.mapv(function (inv) {
              if (squint_core.truth_(squint_core.get(inv, "alive"))) {
                const G__18_43 = squint_core.update(
                  inv,
                  "x",
                  squint_core._PLUS_,
                  next_dir_41 * 20,
                );
                if (hit_edge_40) {
                  return squint_core.update(
                    G__18_43,
                    "y",
                    squint_core._PLUS_,
                    12,
                  );
                } else {
                  return G__18_43;
                }
              } else {
                return inv;
              }
            }, cur_invaders_32);
            return [moved_42, 0, next_dir_41];
          })()
        : [cur_invaders_32, mt_31, cur_dir_33];
    const invaders_44 = squint_core.nth(vec___1_36, 0, null);
    const mt2_45 = squint_core.nth(vec___1_36, 1, null);
    const new_dir_46 = squint_core.nth(vec___1_36, 2, null);
    const vec___4_47 = squint_core.reduce(
      function (p__19, bullet) {
        const vec___48_51 = p__19;
        const invs_52 = squint_core.nth(vec___48_51, 0, null);
        const buls_53 = squint_core.nth(vec___48_51, 1, null);
        const sc_54 = squint_core.nth(vec___48_51, 2, null);
        const temp__23171__auto___55 = squint_core.first(
          squint_core.filter(function (_PERCENT_1) {
            const and_56_57 = squint_core.get(_PERCENT_1, "alive");
            if (squint_core.truth_(and_56_57)) {
              return eng.aabb_QMARK_(bullet, _PERCENT_1);
            } else {
              return and_56_57;
            }
          }, invs_52),
        );
        if (squint_core.truth_(temp__23171__auto___55)) {
          const hit_58 = temp__23171__auto___55;
          return [
            squint_core.mapv(function (_PERCENT_1) {
              if (squint_core._EQ_(_PERCENT_1, hit_58)) {
                return squint_core.assoc(_PERCENT_1, "alive", false);
              } else {
                return _PERCENT_1;
              }
            }, invs_52),
            buls_53,
            sc_54 + 50,
          ];
        } else {
          return [invs_52, squint_core.conj(buls_53, bullet), sc_54];
        }
      },
      [invaders_44, [], 0],
      bullets_30,
    );
    const invaders2_59 = squint_core.nth(vec___4_47, 0, null);
    const bullets2_60 = squint_core.nth(vec___4_47, 1, null);
    const score_add_61 = squint_core.nth(vec___4_47, 2, null);
    const cd_62 = squint_core.get(state, "shoot-cooldown") - dt;
    const vec___7_63 = squint_core.truth_(
      squint_core.truth_(shoot_21) ? cd_62 < 0 : shoot_21,
    )
      ? [
          fire_bullet({
            powerups: squint_core.get(state, "powerups"),
            bullets: bullets2_60,
            "move-timer": mt2_45,
            "shoot-cooldown": 0.2,
            phase: "playing",
            invaders: invaders2_59,
            score: squint_core.get(state, "score") + score_add_61,
            player: player_29,
            "invader-dir": new_dir_46,
            lives: squint_core.get(state, "lives"),
          }),
          0.2,
        ]
      : [
          {
            powerups: squint_core.get(state, "powerups"),
            bullets: bullets2_60,
            "move-timer": mt2_45,
            "shoot-cooldown": cd_62,
            phase: "playing",
            invaders: invaders2_59,
            score: squint_core.get(state, "score") + score_add_61,
            player: player_29,
            "invader-dir": new_dir_46,
            lives: squint_core.get(state, "lives"),
          },
          cd_62,
        ];
    const state2_64 = squint_core.nth(vec___7_63, 0, null);
    const cd2_65 = squint_core.nth(vec___7_63, 1, null);
    const all_dead_66 = squint_core.every_QMARK_(
      function (_PERCENT_1) {
        return squint_core.not(squint_core.get(_PERCENT_1, "alive"));
      },
      squint_core.get(state2_64, "invaders"),
    );
    if (all_dead_66) {
      return squint_core.assoc(state2_64, "phase", "win");
    } else {
      return state2_64;
    }
  }
};
var render_game = function (ctx, state) {
  eng.clear_BANG_(ctx, W, H);
  for (let G__1 of squint_core.iterable(squint_core.get(state, "invaders"))) {
    const inv_2 = G__1;
    if (squint_core.truth_(squint_core.get(inv_2, "alive"))) {
      eng.draw_text_BANG_(
        ctx,
        squint_core.get(inv_2, "icon"),
        squint_core.get(inv_2, "x"),
        squint_core.get(inv_2, "y") + 20,
        "font",
        "20px serif",
        "color",
        squint_core.get(inv_2, "color"),
      );
    }
  }
  const p_3 = squint_core.get(state, "player");
  eng.draw_rect_BANG_(
    ctx,
    squint_core.get(p_3, "x"),
    squint_core.get(p_3, "y"),
    squint_core.get(p_3, "w"),
    squint_core.get(p_3, "h"),
    "#00ff41",
  );
  eng.draw_rect_BANG_(
    ctx,
    squint_core.get(p_3, "x") + 13,
    squint_core.get(p_3, "y") - 6,
    6,
    6,
    "#00d4ff",
  );
  for (let G__4 of squint_core.iterable(squint_core.get(state, "bullets"))) {
    const b_5 = G__4;
    eng.draw_rect_BANG_(
      ctx,
      squint_core.get(b_5, "x"),
      squint_core.get(b_5, "y"),
      squint_core.get(b_5, "w"),
      squint_core.get(b_5, "h"),
      "#00d4ff",
    );
  }
  eng.draw_hud_BANG_(ctx, state, W);
  if ("win" === squint_core.get(state, "phase")) {
    return eng.draw_text_BANG_(
      ctx,
      "THREATS NEUTRALIZED!",
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
};
var init = function () {
  eng.init_keyboard_BANG_();
  const canvas_1 = eng.create_canvas(W, H);
  const wrapper_2 = core.create_el("div", { class: "game-wrapper" });
  const state_3 = squint_core.atom(initial_state());
  wrapper_2.appendChild(canvas_1);
  const touch_4 = eng.init_touch_BANG_(wrapper_2);
  core.mount_BANG_(
    ui.page_shell(
      "invaders",
      "/articles/space-invaders.html",
      "web/modules/portfolio/games/invaders.js",
      wrapper_2,
    ),
  );
  return eng.game_loop(
    canvas_1,
    state_3,
    function (_PERCENT_1, _PERCENT_2) {
      return update_game(_PERCENT_1, _PERCENT_2, touch_4);
    },
    render_game,
  );
};

export { init };
