import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
import * as eng from "./engine.js";
import * as portfolio_DOT_games_DOT_engine from "./engine.js";
var W = 800;
var H = 500;
var GROUND_Y = 420;
var GRAVITY = 350;
var THRUST_UP = -500;
var MOVE_SPEED = 200;
var MAX_VY = 300;
var MAX_VX = 250;
var HELI_W = 40;
var HELI_H = 20;
var BASE_X = 30;
var BASE_W = 80;
var HOSTAGE_CAPACITY = 24;
var WORKLOADS_PER_DC = 6;
var NUM_BUILDINGS = 5;
var SCROLL_MARGIN = 250;
var prng = function (seed) {
  const s_1 = seed ^ (seed << 13);
  const s_2 = s_1 ^ (s_1 >>> 17);
  const s_3 = s_2 ^ (s_2 << 5);
  const s_4 = s_3 & 2147483647;
  return [s_4, squint_core.double$(s_4) / 2147483647];
};
var make_buildings = function (seed) {
  let i_1 = 0;
  let s_2 = seed;
  let buildings_3 = [];
  while (true) {
    if (i_1 >= NUM_BUILDINGS) {
      return [buildings_3, s_2];
    } else {
      const vec___4_10 = prng(s_2);
      const s1_11 = squint_core.nth(vec___4_10, 0, null);
      const r1_12 = squint_core.nth(vec___4_10, 1, null);
      const bx_13 = 300 + i_1 * 220 + r1_12 * 60;
      const vec___7_14 = (() => {
        let j_15 = 0;
        let hs_16 = [];
        let ss_17 = s1_11;
        while (true) {
          if (j_15 >= WORKLOADS_PER_DC) {
            return [hs_16, ss_17];
          } else {
            const vec___18_21 = prng(ss_17);
            const ns_22 = squint_core.nth(vec___18_21, 0, null);
            const r_23 = squint_core.nth(vec___18_21, 1, null);
            let G__24 = j_15 + 1;
            let G__25 = squint_core.conj(hs_16, {
              state: "inside",
              idx: j_15,
              speed: 25 + r_23 * 50,
            });
            let G__26 = ns_22;
            j_15 = G__24;
            hs_16 = G__25;
            ss_17 = G__26;
            continue;
          }
          break;
        }
      })();
      const hostages_27 = squint_core.nth(vec___7_14, 0, null);
      const s2_28 = squint_core.nth(vec___7_14, 1, null);
      let G__29 = i_1 + 1;
      let G__30 = s2_28;
      let G__31 = squint_core.conj(buildings_3, {
        x: bx_13,
        w: 50,
        alive: true,
        hostages: hostages_27,
      });
      i_1 = G__29;
      s_2 = G__30;
      buildings_3 = G__31;
      continue;
    }
    break;
  }
};
var make_tanks = function (seed, n) {
  let i_1 = 0;
  let s_2 = seed;
  let tanks_3 = [];
  while (true) {
    if (i_1 >= n) {
      return [tanks_3, s_2];
    } else {
      const vec___4_10 = prng(s_2);
      const s1_11 = squint_core.nth(vec___4_10, 0, null);
      const r1_12 = squint_core.nth(vec___4_10, 1, null);
      const vec___7_13 = prng(s1_11);
      const s2_14 = squint_core.nth(vec___7_13, 0, null);
      const r2_15 = squint_core.nth(vec___7_13, 1, null);
      const tx_16 = 250 + r1_12 * 800;
      const dir_17 = r2_15 > 0.5 ? 1 : -1;
      let G__18 = i_1 + 1;
      let G__19 = s2_14;
      let G__20 = squint_core.conj(tanks_3, {
        x: tx_16,
        dir: dir_17,
        speed: 20 + r1_12 * 30,
        cooldown: 0,
        alive: true,
      });
      i_1 = G__18;
      s_2 = G__19;
      tanks_3 = G__20;
      continue;
    }
    break;
  }
};
var make_jets = function (seed, n) {
  let i_1 = 0;
  let s_2 = seed;
  let jets_3 = [];
  while (true) {
    if (i_1 >= n) {
      return [jets_3, s_2];
    } else {
      const vec___4_7 = prng(s_2);
      const s1_8 = squint_core.nth(vec___4_7, 0, null);
      const r1_9 = squint_core.nth(vec___4_7, 1, null);
      const jy_10 = 40 + r1_9 * 100;
      const dir_11 = r1_9 > 0.5 ? 1 : -1;
      let G__12 = i_1 + 1;
      let G__13 = s1_8;
      let G__14 = squint_core.conj(jets_3, {
        x: dir_11 > 0 ? -50 : W + 50,
        y: jy_10,
        dir: dir_11,
        speed: 120 + r1_9 * 80,
        cooldown: 0,
        alive: true,
      });
      i_1 = G__12;
      s_2 = G__13;
      jets_3 = G__14;
      continue;
    }
    break;
  }
};
var init_state = function () {
  const s_10 = 42;
  const vec___1_11 = make_buildings(s_10);
  const buildings_12 = squint_core.nth(vec___1_11, 0, null);
  const s1_13 = squint_core.nth(vec___1_11, 1, null);
  const vec___4_14 = make_tanks(s1_13, 3);
  const tanks_15 = squint_core.nth(vec___4_14, 0, null);
  const s2_16 = squint_core.nth(vec___4_14, 1, null);
  const vec___7_17 = make_jets(s2_16, 2);
  const jets_18 = squint_core.nth(vec___7_17, 0, null);
  const s3_19 = squint_core.nth(vec___7_17, 1, null);
  return {
    bullets: [],
    "heli-x": 60,
    "enemy-bullets": [],
    landed: false,
    tanks: tanks_15,
    "heli-vy": 0,
    buildings: buildings_12,
    jets: jets_18,
    lost: 0,
    facing: "right",
    "camera-x": 0,
    state: "title",
    seed: s3_19,
    level: 1,
    "heli-vx": 0,
    explosions: [],
    onboard: 0,
    keys: new Set([]),
    "dead-timer": 0,
    "last-shot": 0,
    rescued: 0,
    best: 0,
    particles: [],
    "total-hostages": NUM_BUILDINGS * WORKLOADS_PER_DC,
    "heli-y": 300,
  };
};
var rect_overlap_QMARK_ = function (ax, ay, aw, ah, bx, by, bw, bh) {
  if (ax < bx + bw) {
    if (bx < ax + aw) {
      if (ay < by + bh) {
        return by < ay + ah;
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
var update_hostage_release = function (state) {
  const hx_1 = squint_core.get(state, "heli-x");
  const hy_2 = squint_core.get(state, "heli-y");
  return squint_core.reduce_kv(
    function (st, bi, bldg) {
      if (squint_core.not(squint_core.get(bldg, "alive"))) {
        return st;
      } else {
        const bx_3 = squint_core.get(bldg, "x");
        const bw_4 = squint_core.get(bldg, "w");
        const near_5 =
          hx_1 > bx_3 - 100 && hx_1 < bx_3 + bw_4 + 100 && hy_2 < GROUND_Y + 40;
        if (!near_5) {
          return st;
        } else {
          const hostages_6 = squint_core.get(bldg, "hostages");
          const released_7 = squint_core.mapv(function (h) {
            if (squint_core.get(h, "state") === "inside") {
              const idx_8 = (() => {
                const or_9_10 = squint_core.get(h, "idx");
                if (squint_core.truth_(or_9_10)) {
                  return or_9_10;
                } else {
                  return 0;
                }
              })();
              const spread_11 = (idx_8 - 2.5) * 10;
              return squint_core.assoc(
                h,
                "state",
                "running",
                "x",
                bx_3 + bw_4 / 2 + spread_11,
                "y",
                GROUND_Y,
                "target-x",
                hx_1,
              );
            } else {
              return h;
            }
          }, hostages_6);
          return squint_core.assoc_in(
            st,
            ["buildings", bi, "hostages"],
            released_7,
          );
        }
      }
    },
    state,
    squint_core.get(state, "buildings"),
  );
};
var update_hostages = function (state, dt) {
  const hx_1 = squint_core.get(state, "heli-x");
  const hy_2 = squint_core.get(state, "heli-y");
  const landed_3 = squint_core.get(state, "landed");
  return squint_core.reduce_kv(
    function (st, bi, bldg) {
      const hostages_4 = squint_core.mapv(
        function (h) {
          const G__21_5 = squint_core.get(h, "state");
          switch (G__21_5) {
            case "running":
              const base_speed_7 = (() => {
                const or_8_9 = squint_core.get(h, "speed");
                if (squint_core.truth_(or_8_9)) {
                  return or_8_9;
                } else {
                  return 40;
                }
              })();
              const speed_10 = base_speed_7;
              const dx_11 =
                (squint_core.get(h, "x") < hx_1 ? 1 : -1) * speed_10 * dt;
              const nx_12 = squint_core.get(h, "x") + dx_11;
              const close_enough_13 =
                Math.abs(nx_12 - hx_1) < 40 && hy_2 < GROUND_Y - 5;
              if (close_enough_13) {
                return squint_core.assoc(h, "state", "boarding");
              } else {
                return squint_core.assoc(h, "x", nx_12);
              }

              break;
            case "at-base":
              return squint_core.assoc(h, "state", "safe");

              break;
            default:
              return h;
          }
        },
        squint_core.get(bldg, "hostages"),
      );
      const boarding_14 = squint_core.count(
        squint_core.filter(function (_PERCENT_1) {
          return squint_core.get(_PERCENT_1, "state") === "boarding";
        }, hostages_4),
      );
      const hostages_15 = squint_core.mapv(function (h) {
        if (squint_core.get(h, "state") === "boarding") {
          return squint_core.assoc(h, "state", "boarded");
        } else {
          return h;
        }
      }, hostages_4);
      const new_onboard_16 = squint_core.min(
        HOSTAGE_CAPACITY,
        squint_core.get(st, "onboard") + boarding_14,
      );
      return squint_core.assoc(
        squint_core.assoc_in(st, ["buildings", bi, "hostages"], hostages_15),
        "onboard",
        new_onboard_16,
      );
    },
    state,
    squint_core.get(state, "buildings"),
  );
};
var update_unload = function (state) {
  if (
    squint_core.truth_(
      (() => {
        const and_1_2 = squint_core.get(state, "landed");
        if (squint_core.truth_(and_1_2)) {
          if (squint_core.get(state, "heli-x") < BASE_X + BASE_W + 20) {
            return squint_core.get(state, "onboard") > 0;
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
      squint_core.update(
        state,
        "rescued",
        squint_core._PLUS_,
        squint_core.get(state, "onboard"),
      ),
      "onboard",
      0,
    );
  } else {
    return state;
  }
};
var update_tanks = function (state, dt) {
  const hx_1 = squint_core.get(state, "heli-x");
  const hy_2 = squint_core.get(state, "heli-y");
  return squint_core.assoc(
    state,
    "tanks",
    squint_core.mapv(
      function (t) {
        if (squint_core.not(squint_core.get(t, "alive"))) {
          return t;
        } else {
          const nx_6 =
            squint_core.get(t, "x") +
            squint_core.get(t, "dir") * squint_core.get(t, "speed") * dt;
          const vec___3_7 =
            nx_6 > 1450
              ? [1450 - 1, -1]
              : nx_6 < 100
                ? [101, 1]
                : "else"
                  ? [nx_6, squint_core.get(t, "dir")]
                  : null;
          const nx_8 = squint_core.nth(vec___3_7, 0, null);
          const dir_9 = squint_core.nth(vec___3_7, 1, null);
          const cd_10 = squint_core.get(t, "cooldown") - dt;
          const fire_QMARK__11 =
            cd_10 <= 0 && Math.abs(hx_1 - nx_8) < 300 && hy_2 < GROUND_Y - 30;
          const new_cd_12 = fire_QMARK__11
            ? 1.5 + Math.random() * 1.5
            : squint_core.max(0, cd_10);
          return squint_core.assoc(
            t,
            "x",
            nx_8,
            "dir",
            dir_9,
            "cooldown",
            new_cd_12,
            "fired",
            fire_QMARK__11,
          );
        }
      },
      squint_core.get(state, "tanks"),
    ),
  );
};
var update_jets = function (state, dt) {
  const hx_1 = squint_core.get(state, "heli-x");
  const hy_2 = squint_core.get(state, "heli-y");
  return squint_core.assoc(
    state,
    "jets",
    squint_core.mapv(
      function (j) {
        if (squint_core.not(squint_core.get(j, "alive"))) {
          return j;
        } else {
          const nx_3 =
            squint_core.get(j, "x") +
            squint_core.get(j, "dir") * squint_core.get(j, "speed") * dt;
          const cd_4 = squint_core.get(j, "cooldown") - dt;
          const fire_QMARK__5 = cd_4 <= 0 && Math.abs(hx_1 - nx_3) < 200;
          const new_cd_6 = fire_QMARK__5
            ? 2 + Math.random() * 1
            : squint_core.max(0, cd_4);
          const nx_7 =
            nx_3 > W + 80 ? -60 : nx_3 < -80 ? W + 60 : "else" ? nx_3 : null;
          return squint_core.assoc(
            j,
            "x",
            nx_7,
            "cooldown",
            new_cd_6,
            "fired",
            fire_QMARK__5,
          );
        }
      },
      squint_core.get(state, "jets"),
    ),
  );
};
var spawn_enemy_bullets = function (state) {
  const hx_1 = squint_core.get(state, "heli-x");
  const hy_2 = squint_core.get(state, "heli-y");
  const tank_shots_3 = squint_core.lazy(function* () {
    for (let G__4 of squint_core.iterable(squint_core.get(state, "tanks"))) {
      const t_5 = G__4;
      if (
        squint_core.truth_(
          yield* (function* () {
            const and_6_7 = squint_core.get(t_5, "alive");
            if (squint_core.truth_(and_6_7)) {
              return squint_core.get(t_5, "fired");
            } else {
              return and_6_7;
            }
          })(),
        )
      ) {
        yield {
          x: squint_core.get(t_5, "x"),
          y: GROUND_Y - 10,
          vx: 0.6 * (hx_1 - squint_core.get(t_5, "x")),
          vy: 0.6 * (hy_2 - (GROUND_Y - 10)),
          life: 2,
        };
      }
    }
    return null;
  });
  const jet_shots_8 = squint_core.lazy(function* () {
    for (let G__9 of squint_core.iterable(squint_core.get(state, "jets"))) {
      const j_10 = G__9;
      if (
        squint_core.truth_(
          yield* (function* () {
            const and_11_12 = squint_core.get(j_10, "alive");
            if (squint_core.truth_(and_11_12)) {
              return squint_core.get(j_10, "fired");
            } else {
              return and_11_12;
            }
          })(),
        )
      ) {
        yield {
          x: squint_core.get(j_10, "x"),
          y: squint_core.get(j_10, "y") + 10,
          vx: 0,
          vy: 150,
          life: 2,
        };
      }
    }
    return null;
  });
  return squint_core.update(
    state,
    "enemy-bullets",
    squint_core.into,
    squint_core.concat(tank_shots_3, jet_shots_8),
  );
};
var update_bullets = function (state, dt) {
  return squint_core.update(
    squint_core.update(state, "bullets", function (bs) {
      return squint_core.filterv(
        function (_PERCENT_1) {
          return squint_core.get(_PERCENT_1, "life") > 0;
        },
        squint_core.mapv(function (b) {
          return squint_core.update(
            squint_core.update(
              squint_core.update(
                b,
                "x",
                squint_core._PLUS_,
                squint_core.get(b, "vx") * dt,
              ),
              "y",
              squint_core._PLUS_,
              squint_core.get(b, "vy") * dt,
            ),
            "life",
            squint_core._,
            dt,
          );
        }, bs),
      );
    }),
    "enemy-bullets",
    function (bs) {
      return squint_core.filterv(
        function (_PERCENT_1) {
          return squint_core.get(_PERCENT_1, "life") > 0;
        },
        squint_core.mapv(function (b) {
          return squint_core.update(
            squint_core.update(
              squint_core.update(
                b,
                "x",
                squint_core._PLUS_,
                squint_core.get(b, "vx") * dt,
              ),
              "y",
              squint_core._PLUS_,
              squint_core.get(b, "vy") * dt,
            ),
            "life",
            squint_core._,
            dt,
          );
        }, bs),
      );
    },
  );
};
var check_collisions = function (state) {
  const hx_1 = squint_core.get(state, "heli-x");
  const hy_2 = squint_core.get(state, "heli-y");
  const state_3 = squint_core.reduce(
    function (st, bi) {
      const b_4 = squint_core.nth(squint_core.get(st, "bullets"), bi, null);
      if (b_4 == null) {
        return st;
      } else {
        const hit_tank_5 = squint_core.first(
          squint_core.keep_indexed(
            function (ti, t) {
              if (
                squint_core.truth_(
                  (() => {
                    const and_6_7 = squint_core.get(t, "alive");
                    if (squint_core.truth_(and_6_7)) {
                      if (
                        Math.abs(
                          squint_core.get(b_4, "x") - squint_core.get(t, "x"),
                        ) < 20
                      ) {
                        return (
                          Math.abs(squint_core.get(b_4, "y") - GROUND_Y) < 25
                        );
                      } else {
                        return false;
                      }
                    } else {
                      return and_6_7;
                    }
                  })(),
                )
              ) {
                return ti;
              }
            },
            squint_core.get(st, "tanks"),
          ),
        );
        if (squint_core.truth_(hit_tank_5)) {
          return squint_core.update(
            squint_core.assoc_in(
              squint_core.assoc_in(st, ["tanks", hit_tank_5, "alive"], false),
              ["bullets", bi, "life"],
              0,
            ),
            "explosions",
            squint_core.conj,
            { x: squint_core.get(b_4, "x"), y: GROUND_Y, life: 0.8 },
          );
        } else {
          return st;
        }
      }
    },
    state,
    squint_core.range(squint_core.count(squint_core.get(state, "bullets"))),
  );
  const state_8 = squint_core.reduce(
    function (st, bi) {
      const b_9 = squint_core.nth(squint_core.get(st, "bullets"), bi, null);
      if (b_9 == null || squint_core.get(b_9, "life") <= 0) {
        return st;
      } else {
        const hit_jet_10 = squint_core.first(
          squint_core.keep_indexed(
            function (ji, j) {
              if (
                squint_core.truth_(
                  (() => {
                    const and_11_12 = squint_core.get(j, "alive");
                    if (squint_core.truth_(and_11_12)) {
                      if (
                        Math.abs(
                          squint_core.get(b_9, "x") - squint_core.get(j, "x"),
                        ) < 25
                      ) {
                        return (
                          Math.abs(
                            squint_core.get(b_9, "y") - squint_core.get(j, "y"),
                          ) < 15
                        );
                      } else {
                        return false;
                      }
                    } else {
                      return and_11_12;
                    }
                  })(),
                )
              ) {
                return ji;
              }
            },
            squint_core.get(st, "jets"),
          ),
        );
        if (squint_core.truth_(hit_jet_10)) {
          return squint_core.update(
            squint_core.assoc_in(
              squint_core.assoc_in(st, ["jets", hit_jet_10, "alive"], false),
              ["bullets", bi, "life"],
              0,
            ),
            "explosions",
            squint_core.conj,
            {
              x: squint_core.get(b_9, "x"),
              y: squint_core.get(
                squint_core.nth(squint_core.get(st, "jets"), hit_jet_10),
                "y",
              ),
              life: 0.8,
            },
          );
        } else {
          return st;
        }
      }
    },
    state_3,
    squint_core.range(squint_core.count(squint_core.get(state_3, "bullets"))),
  );
  const hit_by_enemy_13 = squint_core.some(
    function (b) {
      return rect_overlap_QMARK_(
        hx_1 - HELI_W / 2,
        hy_2 - HELI_H / 2,
        HELI_W,
        HELI_H,
        squint_core.get(b, "x") - 3,
        squint_core.get(b, "y") - 3,
        6,
        6,
      );
    },
    squint_core.get(state_8, "enemy-bullets"),
  );
  const state_14 = squint_core.reduce_kv(
    function (st, bi, bldg) {
      return squint_core.assoc_in(
        st,
        ["buildings", bi, "hostages"],
        squint_core.get(bldg, "hostages"),
      );
    },
    state_8,
    squint_core.get(state_8, "buildings"),
  );
  if (squint_core.truth_(hit_by_enemy_13)) {
    return squint_core.assoc(
      init_state(),
      "state",
      "playing",
      "best",
      squint_core.get(state_14, "best"),
    );
  } else {
    return state_14;
  }
};
var update_explosions = function (state, dt) {
  return squint_core.update(state, "explosions", function (exs) {
    return squint_core.filterv(
      function (_PERCENT_1) {
        return squint_core.get(_PERCENT_1, "life") > 0;
      },
      squint_core.mapv(function (_PERCENT_1) {
        return squint_core.update(_PERCENT_1, "life", squint_core._, dt);
      }, exs),
    );
  });
};
var update_particles = function (state, dt) {
  return squint_core.update(state, "particles", function (ps) {
    return squint_core.filterv(
      function (_PERCENT_1) {
        return squint_core.get(_PERCENT_1, "life") > 0;
      },
      squint_core.mapv(function (p) {
        return squint_core.update(
          squint_core.update(
            squint_core.update(
              p,
              "x",
              squint_core._PLUS_,
              squint_core.get(p, "vx") * dt,
            ),
            "y",
            squint_core._PLUS_,
            squint_core.get(p, "vy") * dt,
          ),
          "life",
          squint_core._,
          dt,
        );
      }, ps),
    );
  });
};
var add_rotor_particles = function (state) {
  if (
    squint_core.truth_(
      (() => {
        const or_1_2 = squint_core.get(state, "landed");
        if (squint_core.truth_(or_1_2)) {
          return or_1_2;
        } else {
          return !(squint_core.get(state, "state") === "playing");
        }
      })(),
    )
  ) {
    return state;
  } else {
    const hx_3 = squint_core.get(state, "heli-x");
    const hy_4 = squint_core.get(state, "heli-y");
    return squint_core.update(state, "particles", squint_core.conj, {
      x: hx_3 + (20 * Math.random() - 10),
      y: hy_4 - 12,
      vx: 40 * Math.random() - 20,
      vy: -20 - 30 * Math.random(),
      life: 0.3,
    });
  }
};
var fire_bullet = function (state) {
  const hx_1 = squint_core.get(state, "heli-x");
  const hy_2 = squint_core.get(state, "heli-y");
  const vx_3 = squint_core.get(state, "heli-vx");
  const vy_4 = squint_core.get(state, "heli-vy");
  const abs_vx_5 = Math.abs(vx_3);
  const abs_vy_6 = Math.abs(vy_4);
  const speed_7 = 420;
  const dir_x_8 = abs_vx_5 > abs_vy_6 ? (vx_3 > 0 ? 1 : -1) : 0;
  const dir_y_9 = abs_vy_6 >= abs_vx_5 ? (vy_4 > 0 ? 1 : -1) : 0;
  const dir_x_10 =
    dir_x_8 === 0 && dir_y_9 === 0
      ? squint_core.get(state, "facing") === "right"
        ? 1
        : -1
      : dir_x_8;
  const vx_b_11 = dir_x_10 * speed_7;
  const vy_b_12 = dir_y_9 * speed_7;
  const x_start_13 = hx_1 + (!(dir_x_10 === 0) ? dir_x_10 * 25 : 0);
  const y_start_14 = hy_2 + (!(dir_y_9 === 0) ? dir_y_9 * 12 : 0);
  return squint_core.update(state, "bullets", squint_core.conj, {
    x: x_start_13,
    y: y_start_14,
    vx: vx_b_11,
    vy: vy_b_12,
    life: 1.5,
  });
};
var check_win = function (state) {
  if (
    squint_core.get(state, "rescued") >=
      squint_core.get(state, "total-hostages") &&
    squint_core.get(state, "state") === "playing"
  ) {
    return squint_core.update(
      squint_core.assoc(state, "state", "won"),
      "best",
      function (_PERCENT_1) {
        return squint_core.max(_PERCENT_1, squint_core.get(state, "rescued"));
      },
    );
  } else {
    return state;
  }
};
var update_game = function (state, dt, touch) {
  const G__22_1 = squint_core.get(state, "state");
  switch (G__22_1) {
    case "playing":
      const ts_3 =
        touch == null
          ? { left: false, right: false, up: false, action: false }
          : squint_core.deref(touch);
      const touch_set_4 = (() => {
        const G__23_5 = new Set([]);
        const G__23_6 = squint_core.truth_(squint_core.get(ts_3, "left"))
          ? squint_core.conj(G__23_5, "left")
          : G__23_5;
        const G__23_7 = squint_core.truth_(squint_core.get(ts_3, "right"))
          ? squint_core.conj(G__23_6, "right")
          : G__23_6;
        const G__23_8 = squint_core.truth_(squint_core.get(ts_3, "up"))
          ? squint_core.conj(G__23_7, "up")
          : G__23_7;
        if (squint_core.truth_(squint_core.get(ts_3, "action"))) {
          return squint_core.conj(G__23_8, "shoot");
        } else {
          return G__23_8;
        }
      })();
      const keys_9 = squint_core.into(
        squint_core.get(state, "keys"),
        touch_set_4,
      );
      const thrusting_10 =
        squint_core.contains_QMARK_(keys_9, "up") ||
        squint_core.contains_QMARK_(keys_9, "space");
      const move_left_11 = squint_core.contains_QMARK_(keys_9, "left");
      const move_right_12 = squint_core.contains_QMARK_(keys_9, "right");
      const shooting_13 = squint_core.contains_QMARK_(keys_9, "shoot");
      const ax_14 = move_left_11 ? -1 : move_right_12 ? 1 : "else" ? 0 : null;
      const facing_15 = move_left_11
        ? "left"
        : move_right_12
          ? "right"
          : "else"
            ? squint_core.get(state, "facing")
            : null;
      const vx_16 = squint_core.get(state, "heli-vx") + ax_14 * MOVE_SPEED * dt;
      const vx_17 = vx_16 * (ax_14 === 0 ? 0.95 : 1);
      const vx_18 = squint_core.max(-MAX_VX, squint_core.min(MAX_VX, vx_17));
      const vy_19 =
        squint_core.get(state, "heli-vy") +
        (thrusting_10 ? THRUST_UP : GRAVITY) * dt;
      const vy_20 = squint_core.max(-MAX_VY, squint_core.min(MAX_VY, vy_19));
      const nx_21 = squint_core.get(state, "heli-x") + vx_18 * dt;
      const ny_22 = squint_core.get(state, "heli-y") + vy_20 * dt;
      const on_ground_23 = ny_22 >= GROUND_Y - HELI_H / 2;
      const on_building_24 =
        !on_ground_23 &&
        vy_20 > 0 &&
        squint_core.some(
          function (b) {
            const and_25_26 = squint_core.get(b, "alive");
            if (squint_core.truth_(and_25_26)) {
              if (nx_21 >= squint_core.get(b, "x") - 4) {
                if (
                  nx_21 <=
                  squint_core.get(b, "x") + squint_core.get(b, "w") + 4
                ) {
                  if (ny_22 >= GROUND_Y - 40 - HELI_H / 2) {
                    return ny_22 - HELI_H / 2 <= GROUND_Y - 38;
                  } else {
                    return false;
                  }
                } else {
                  return false;
                }
              } else {
                return false;
              }
            } else {
              return and_25_26;
            }
          },
          squint_core.get(state, "buildings"),
        );
      const roof_y_27 = GROUND_Y - 40 - HELI_H / 2;
      const landed_28 = on_ground_23 ? on_ground_23 : on_building_24;
      const ny_29 = on_ground_23
        ? GROUND_Y - HELI_H / 2
        : squint_core.truth_(on_building_24)
          ? roof_y_27
          : "else"
            ? ny_22
            : null;
      const vy_30 = squint_core.truth_(landed_28) ? 0 : vy_20;
      const vx_31 = squint_core.truth_(landed_28) ? vx_18 * 0.9 : vx_18;
      const ny_32 = squint_core.max(15, ny_29);
      const vy_33 = ny_32 <= 15 ? squint_core.max(0, vy_30) : vy_30;
      const nx_34 = squint_core.max(10, squint_core.min(1550, nx_21));
      const cam_target_35 = nx_34 - W / 2;
      const cam_target_36 = squint_core.max(0, cam_target_35);
      const cam_37 =
        squint_core.get(state, "camera-x") +
        (cam_target_36 - squint_core.get(state, "camera-x")) * 3 * dt;
      const last_shot_rem_38 = squint_core.max(
        0,
        squint_core.get(state, "last-shot") - dt,
      );
      const base_st_39 = squint_core.assoc(
        state,
        "heli-x",
        nx_34,
        "heli-y",
        ny_32,
        "heli-vx",
        vx_31,
        "heli-vy",
        vy_33,
        "landed",
        landed_28,
        "facing",
        facing_15,
        "camera-x",
        cam_37,
      );
      const st_40 = check_win(
        add_rotor_particles(
          update_particles(
            update_explosions(
              check_collisions(
                update_bullets(
                  spawn_enemy_bullets(
                    update_jets(
                      update_tanks(
                        update_unload(
                          update_hostages(
                            update_hostage_release(base_st_39),
                            dt,
                          ),
                        ),
                        dt,
                      ),
                      dt,
                    ),
                  ),
                  dt,
                ),
              ),
              dt,
            ),
            dt,
          ),
        ),
      );
      if (
        squint_core.truth_(shooting_13 ? last_shot_rem_38 <= 0 : shooting_13)
      ) {
        return squint_core.assoc(fire_bullet(st_40), "last-shot", 0.25);
      } else {
        if ("else") {
          return squint_core.assoc(st_40, "last-shot", last_shot_rem_38);
        } else {
          return null;
        }
      }

      break;
    case "dead":
      const ts_41 =
        touch == null
          ? { left: false, right: false, up: false, action: false }
          : squint_core.deref(touch);
      const any_touch_42 = squint_core.some(
        squint_core.true_QMARK_,
        squint_core.vals(ts_41),
      );
      if (squint_core.truth_(any_touch_42)) {
        return squint_core.assoc(
          init_state(),
          "state",
          "playing",
          "best",
          squint_core.get(state, "best"),
        );
      } else {
        return update_particles(update_explosions(state, dt), dt);
      }

      break;
    default:
      return state;
  }
};
var draw_mountains = function (ctx, cam_x) {
  ctx.fillStyle = "#0d0d30";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let G__1 of squint_core.iterable(squint_core.range(0, W + 40, 40))) {
    const i_2 = G__1;
    const wx_3 = i_2 + cam_x * 0.3;
    const my_4 =
      GROUND_Y - 30 - 25 * Math.sin(wx_3 * 0.008) - 15 * Math.cos(wx_3 * 0.013);
    ctx.lineTo(i_2, my_4);
  }
  ctx.lineTo(W, GROUND_Y);
  ctx.closePath();
  return ctx.fill();
};
var draw_ground = function (ctx) {
  ctx.fillStyle = "#1a1a3a";
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.strokeStyle = "#00ff41";
  ctx.lineWidth = 1;
  ctx.shadowColor = "#00ff41";
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(W, GROUND_Y);
  ctx.stroke();
  return (ctx.shadowBlur = 0);
};
var draw_base = function (ctx, cam_x) {
  const bx_1 = BASE_X - cam_x;
  ctx.fillStyle = "#00b4d8";
  ctx.shadowColor = "#00b4d8";
  ctx.shadowBlur = 8;
  ctx.fillRect(bx_1, GROUND_Y - 3, BASE_W, 3);
  ctx.font = "14px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText("☁", bx_1 + BASE_W / 2, GROUND_Y + 18);
  ctx.textAlign = "left";
  ctx.shadowBlur = 0;
  return (ctx.fillStyle = "#00b4d8");
};
var draw_buildings = function (ctx, buildings, cam_x) {
  for (let G__1 of squint_core.iterable(buildings)) {
    const b_2 = G__1;
    if (squint_core.truth_(squint_core.get(b_2, "alive"))) {
      const bx_3 = squint_core.get(b_2, "x") - cam_x;
      const bw_4 = squint_core.get(b_2, "w");
      ctx.fillStyle = "#2a3a4a";
      ctx.fillRect(bx_3, GROUND_Y - 40, bw_4, 40);
      ctx.strokeStyle = "#4a5a6a";
      ctx.lineWidth = 1;
      for (let G__5 of squint_core.iterable([
        GROUND_Y - 35,
        GROUND_Y - 27,
        GROUND_Y - 19,
        GROUND_Y - 11,
      ])) {
        const ry_6 = G__5;
        ctx.beginPath();
        ctx.moveTo(bx_3 + 4, ry_6);
        ctx.lineTo(bx_3 + bw_4 + -4, ry_6);
        ctx.stroke();
      }
      const hostages_7 = squint_core.get(b_2, "hostages");
      const n_8 = squint_core.count(hostages_7);
      for (let G__9 of squint_core.iterable(squint_core.range(n_8))) {
        const i_10 = G__9;
        const h_11 = squint_core.nth(hostages_7, i_10);
        const row_12 = squint_core.quot(i_10, 3);
        const col_13 = squint_core.rem(i_10, 3);
        const lx_14 = bx_3 + 6 + col_13 * 14;
        const ly_15 = GROUND_Y - 33 - row_12 * -8;
        ctx.fillStyle =
          squint_core.get(h_11, "state") === "inside" ? "#00ff41" : "#1a2a1a";
        ctx.fillRect(lx_14, ly_15, 3, 2);
      }
      ctx.fillStyle = "#6a7a8a";
      ctx.font = "6px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText("DC", bx_3 + bw_4 / 2, GROUND_Y - 2);
      ctx.textAlign = "left";
      for (let G__16 of squint_core.iterable(
        squint_core.get(b_2, "hostages"),
      )) {
        const h_17 = G__16;
        if (squint_core.get(h_17, "state") === "running") {
          const hx_18 = squint_core.get(h_17, "x") - cam_x;
          const t_19 = Date.now() * 0.008;
          const arm_angle_20 = 0.6 * Math.sin(t_19 + hx_18 * 0.1);
          ctx.fillStyle = "#0078d4";
          ctx.fillRect(hx_18 - 3, GROUND_Y - 14, 6, 10);
          ctx.fillStyle = "#ffcc88";
          ctx.beginPath();
          ctx.arc(hx_18, GROUND_Y - 18, 4, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = "#0078d4";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(hx_18 - 3, GROUND_Y - 12);
          ctx.lineTo(hx_18 - 8, GROUND_Y - (16 + 6 * arm_angle_20));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(hx_18 + 3, GROUND_Y - 12);
          ctx.lineTo(hx_18 + 8, GROUND_Y - (16 + 6 * -arm_angle_20));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(hx_18 - 1, GROUND_Y - 4);
          ctx.lineTo(hx_18 - 4, GROUND_Y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(hx_18 + 1, GROUND_Y - 4);
          ctx.lineTo(hx_18 + 4, GROUND_Y);
          ctx.stroke();
        }
      }
    }
  }
  return null;
};
var draw_tanks = function (ctx, tanks, cam_x) {
  for (let G__1 of squint_core.iterable(tanks)) {
    const t_2 = G__1;
    if (squint_core.truth_(squint_core.get(t_2, "alive"))) {
      const tx_3 = squint_core.get(t_2, "x") - cam_x;
      ctx.fillStyle = "#ff4444";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 4;
      ctx.fillRect(tx_3 - 15, GROUND_Y - 12, 30, 12);
      ctx.fillStyle = "#ff8866";
      ctx.fillRect(tx_3 - 6, GROUND_Y - 18, 12, 8);
      ctx.fillRect(tx_3 - 1, GROUND_Y - 24, 2, 8);
      ctx.shadowBlur = 0;
    }
  }
  return null;
};
var draw_jets = function (ctx, jets, cam_x) {
  for (let G__1 of squint_core.iterable(jets)) {
    const j_2 = G__1;
    if (squint_core.truth_(squint_core.get(j_2, "alive"))) {
      const jx_3 = squint_core.get(j_2, "x") - cam_x;
      const jy_4 = squint_core.get(j_2, "y");
      const d_5 = squint_core.get(j_2, "dir");
      ctx.fillStyle = "#ff0040";
      ctx.shadowColor = "#ff0040";
      ctx.shadowBlur = 6;
      ctx.fillRect(jx_3 - 14, jy_4 - 4, 28, 8);
      ctx.fillRect(jx_3 - 18, jy_4 - 8, 8, 16);
      ctx.fillRect(jx_3 + 10, jy_4 - 8, 8, 16);
      ctx.fillStyle = "#ff4466";
      ctx.fillRect(jx_3 + d_5 * 10, jy_4 - 2, 4, 4);
      ctx.shadowBlur = 0;
    }
  }
  return null;
};
var draw_helicopter = function (ctx, state) {
  const hx_1 =
    squint_core.get(state, "heli-x") - squint_core.get(state, "camera-x");
  const hy_2 = squint_core.get(state, "heli-y");
  const facing_3 = squint_core.get(state, "facing");
  const dir_4 = facing_3 === "right" ? 1 : -1;
  const landed_5 = squint_core.get(state, "landed");
  const moving_6 = Math.abs(squint_core.get(state, "heli-vx")) > 15;
  const bob_7 = squint_core.truth_(landed_5)
    ? 0
    : 1.5 * Math.sin(Date.now() * 0.003);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#88ccff";
  ctx.shadowBlur = 15;
  if (squint_core.truth_(squint_core.truth_(landed_5) ? !moving_6 : landed_5)) {
    ctx.beginPath();
    ctx.arc(hx_1, hy_2 + bob_7, 18, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx_1 - 13, hy_2 + bob_7 + 6, 11, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx_1 + 13, hy_2 + bob_7 + 6, 11, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx_1, hy_2 + bob_7 + -12, 11, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "#334455";
    ctx.beginPath();
    ctx.arc(hx_1 - 5, hy_2 + bob_7 + -1, 2.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx_1 + 5, hy_2 + bob_7 + -1, 2.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#334455";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx_1, hy_2 + bob_7 + 2, 4, 0.2, 2.9);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(hx_1, hy_2 + bob_7, 16, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx_1 + dir_4 * 12, hy_2 + bob_7 + 2, 13, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx_1 - dir_4 * 10, hy_2 + bob_7 + 4, 11, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx_1 + dir_4 * 4, hy_2 + bob_7 + -10, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "rgba(200,230,255,0.6)";
    ctx.beginPath();
    ctx.arc(hx_1 - dir_4 * 2, hy_2 + bob_7 + -4, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "#0078d4";
    ctx.beginPath();
    ctx.moveTo(hx_1 + dir_4 * 24, hy_2 + bob_7 + 4);
    ctx.lineTo(hx_1 + dir_4 * 30, hy_2 + bob_7);
    ctx.lineTo(hx_1 + dir_4 * 24, hy_2 + bob_7 + -4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  if (squint_core.get(state, "onboard") > 0) {
    ctx.fillStyle = "#0078d4";
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `${squint_core.get(state, "onboard") ?? ""}`,
      hx_1,
      hy_2 + bob_7 + 26,
    );
    return (ctx.textAlign = "left");
  }
};
var draw_bullets = function (ctx, bullets, enemy_bullets, cam_x) {
  ctx.fillStyle = "#00ff41";
  ctx.shadowColor = "#00ff41";
  ctx.shadowBlur = 4;
  for (let G__1 of squint_core.iterable(bullets)) {
    const b_2 = G__1;
    ctx.fillRect(
      squint_core.get(b_2, "x") - cam_x - 2,
      squint_core.get(b_2, "y") - 1,
      6,
      3,
    );
  }
  ctx.fillStyle = "#ff4444";
  ctx.shadowColor = "#ff4444";
  for (let G__3 of squint_core.iterable(enemy_bullets)) {
    const b_4 = G__3;
    ctx.fillRect(
      squint_core.get(b_4, "x") - cam_x - 2,
      squint_core.get(b_4, "y") - 2,
      4,
      4,
    );
  }
  return (ctx.shadowBlur = 0);
};
var draw_explosions = function (ctx, explosions, cam_x) {
  for (let G__1 of squint_core.iterable(explosions)) {
    const e_2 = G__1;
    const r_3 = 20 * (1 - squint_core.get(e_2, "life"));
    const alpha_4 = squint_core.min(1, 2 * squint_core.get(e_2, "life"));
    ctx.fillStyle = `${"rgba(255,100,0,"}${alpha_4 ?? ""}${")"}`;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
      squint_core.get(e_2, "x") - cam_x,
      squint_core.get(e_2, "y"),
      r_3,
      0,
      2 * Math.PI,
    );
    ctx.fill();
  }
  return (ctx.shadowBlur = 0);
};
var draw_particles = function (ctx, particles, cam_x) {
  for (let G__1 of squint_core.iterable(particles)) {
    const p_2 = G__1;
    const alpha_3 = squint_core.min(1, 3 * squint_core.get(p_2, "life"));
    ctx.fillStyle = `${"rgba(0,212,255,"}${alpha_3 ?? ""}${")"}`;
    ctx.fillRect(
      squint_core.get(p_2, "x") - cam_x,
      squint_core.get(p_2, "y"),
      2,
      2,
    );
  }
  return null;
};
var draw_hud = function (ctx, state) {
  ctx.font = "14px 'Press Start 2P', monospace";
  ctx.fillStyle = "#00b4d8";
  ctx.fillText(
    `${"MIGRATED "}${squint_core.get(state, "rescued") ?? ""}${"/"}${squint_core.get(state, "total-hostages") ?? ""}`,
    15,
    28,
  );
  ctx.fillStyle = "#0078d4";
  ctx.fillText(
    `${"IN TRANSIT "}${squint_core.get(state, "onboard") ?? ""}${"/"}${HOSTAGE_CAPACITY ?? ""}`,
    15,
    50,
  );
  if (squint_core.get(state, "best") > 0) {
    ctx.fillStyle = "#888";
    return ctx.fillText(
      `${"BEST "}${squint_core.get(state, "best") ?? ""}`,
      W - 200,
      28,
    );
  }
};
var draw_overlay = function (ctx, state, title, subtitle, color) {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = color;
  ctx.font = "24px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText(title, W / 2, H / 2 - 30);
  ctx.font = "11px 'Press Start 2P', monospace";
  ctx.fillStyle = "#00ff41";
  ctx.fillText(subtitle, W / 2, H / 2 + 10);
  ctx.fillStyle = "#888";
  ctx.font = "10px 'Press Start 2P', monospace";
  ctx.fillText("ARROWS/WASD MOVE · SPACE SHOOT · TAP/CLICK", W / 2, H / 2 + 40);
  return (ctx.textAlign = "left");
};
var draw_BANG_ = function (ctx, state) {
  ctx.save();
  const cam_1 = squint_core.get(state, "camera-x");
  ctx.fillStyle = "#0a0a2a";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  for (let G__2 of squint_core.iterable(squint_core.range(40))) {
    const i_3 = G__2;
    const sx_4 = squint_core.mod(i_3 * 37 + cam_1 * 0.1, W);
    const sy_5 = squint_core.mod(i_3 * 23, GROUND_Y - 60);
    ctx.fillRect(sx_4, sy_5, 1, 1);
  }
  draw_mountains(ctx, cam_1);
  draw_ground(ctx);
  draw_base(ctx, cam_1);
  draw_buildings(ctx, squint_core.get(state, "buildings"), cam_1);
  draw_tanks(ctx, squint_core.get(state, "tanks"), cam_1);
  draw_jets(ctx, squint_core.get(state, "jets"), cam_1);
  draw_particles(ctx, squint_core.get(state, "particles"), cam_1);
  draw_bullets(
    ctx,
    squint_core.get(state, "bullets"),
    squint_core.get(state, "enemy-bullets"),
    cam_1,
  );
  draw_explosions(ctx, squint_core.get(state, "explosions"), cam_1);
  draw_helicopter(ctx, state);
  draw_hud(ctx, state);
  const G__24_6 = squint_core.get(state, "state");
  switch (G__24_6) {
    case "title":
      draw_overlay(
        ctx,
        state,
        "CLOUD LIFT",
        "MIGRATE WORKLOADS · FLY THEM TO THE CLOUD",
        "#00b4d8",
      );

      break;
    case "dead":
      draw_overlay(
        ctx,
        state,
        "OUTAGE!",
        `${"MIGRATED: "}${squint_core.get(state, "rescued") ?? ""}${"  [SPACE] TO RETRY"}`,
        "#ff4444",
      );

      break;
    case "won":
      draw_overlay(
        ctx,
        state,
        "MIGRATION COMPLETE!",
        `${"ALL "}${squint_core.get(state, "total-hostages") ?? ""}${" WORKLOADS IN THE CLOUD!"}`,
        "#00b4d8",
      );

      break;
  }
  return ctx.restore();
};
var init = function () {
  const state_1 = squint_core.atom(init_state());
  const canvas_2 = core.create_el("canvas", {
    width: `${W ?? ""}`,
    height: `${H ?? ""}`,
    class: "game-canvas",
  });
  const ctx_3 = canvas_2.getContext("2d");
  const set_key_BANG__4 = function (k, v) {
    const G__25_5 = squint_core.get(squint_core.deref(state_1), "state");
    switch (G__25_5) {
      case "title":
        if (squint_core.truth_(v)) {
          return squint_core.reset_BANG_(
            state_1,
            squint_core.assoc(
              init_state(),
              "state",
              "playing",
              "best",
              squint_core.get(squint_core.deref(state_1), "best"),
            ),
          );
        }

        break;
      case "dead":
        if (squint_core.truth_(v)) {
          return squint_core.reset_BANG_(
            state_1,
            squint_core.assoc(
              init_state(),
              "state",
              "playing",
              "best",
              squint_core.get(squint_core.deref(state_1), "best"),
            ),
          );
        }

        break;
      case "won":
        if (squint_core.truth_(v)) {
          return squint_core.reset_BANG_(
            state_1,
            squint_core.assoc(
              init_state(),
              "state",
              "playing",
              "best",
              squint_core.get(squint_core.deref(state_1), "best"),
            ),
          );
        }

        break;
      case "playing":
        if (squint_core.truth_(v)) {
          return squint_core.swap_BANG_(
            state_1,
            squint_core.update,
            "keys",
            squint_core.conj,
            k,
          );
        } else {
          return squint_core.swap_BANG_(
            state_1,
            squint_core.update,
            "keys",
            squint_core.disj,
            k,
          );
        }

        break;
    }
  };
  const code_map_7 = {
    Space: "shoot",
    ArrowUp: "up",
    ArrowDown: "down",
    KeyA: "left",
    ArrowRight: "right",
    ArrowLeft: "left",
    KeyW: "up",
    KeyD: "right",
    KeyS: "down",
  };
  document.addEventListener("keydown", function (e) {
    const temp__23233__auto___8 = code_map_7[e.code];
    if (squint_core.truth_(temp__23233__auto___8)) {
      const k_9 = temp__23233__auto___8;
      e.preventDefault();
      const G__26_10 = squint_core.get(squint_core.deref(state_1), "state");
      switch (G__26_10) {
        case "dead":
          return squint_core.reset_BANG_(
            state_1,
            squint_core.assoc(
              init_state(),
              "state",
              "playing",
              "best",
              squint_core.get(squint_core.deref(state_1), "best"),
            ),
          );

          break;
        case "won":
          return squint_core.reset_BANG_(
            state_1,
            squint_core.assoc(
              init_state(),
              "state",
              "playing",
              "best",
              squint_core.get(squint_core.deref(state_1), "best"),
            ),
          );

          break;
        case "title":
          return squint_core.reset_BANG_(
            state_1,
            squint_core.assoc(
              init_state(),
              "state",
              "playing",
              "best",
              squint_core.get(squint_core.deref(state_1), "best"),
            ),
          );

          break;
        default:
          return set_key_BANG__4(k_9, true);
      }
    }
  });
  document.addEventListener("keyup", function (e) {
    const temp__23233__auto___12 = code_map_7[e.code];
    if (squint_core.truth_(temp__23233__auto___12)) {
      const k_13 = temp__23233__auto___12;
      e.preventDefault();
      return set_key_BANG__4(k_13, false);
    }
  });
  const touch_start_14 = squint_core.atom(null);
  canvas_2.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault();
      const t_15 = e.touches[0];
      const rect_16 = canvas_2.getBoundingClientRect();
      const tx_17 = t_15.clientX - rect_16.left;
      const ty_18 = t_15.clientY - rect_16.top;
      const now_19 = Date.now();
      if (
        squint_core.truth_(
          (() => {
            const and_20_21 = squint_core.deref(touch_start_14);
            if (squint_core.truth_(and_20_21)) {
              return now_19 - squint_core.deref(touch_start_14) < 300;
            } else {
              return and_20_21;
            }
          })(),
        )
      ) {
        set_key_BANG__4("shoot", true);
        setTimeout(function () {
          return squint_core.swap_BANG_(
            state_1,
            squint_core.update,
            "keys",
            squint_core.disj,
            "shoot",
          );
        }, 100);
      }
      squint_core.reset_BANG_(touch_start_14, now_19);
      if (tx_17 < W / 2) {
        set_key_BANG__4("left", true);
      } else {
        set_key_BANG__4("right", true);
      }
      if (ty_18 < H / 2) {
        return set_key_BANG__4("up", true);
      }
    },
    { passive: false },
  );
  canvas_2.addEventListener(
    "touchend",
    function (e) {
      e.preventDefault();
      return squint_core.swap_BANG_(
        state_1,
        squint_core.assoc,
        "keys",
        new Set([]),
      );
    },
    { passive: false },
  );
  canvas_2.addEventListener("touchcancel", function (_) {
    return squint_core.swap_BANG_(
      state_1,
      squint_core.assoc,
      "keys",
      new Set([]),
    );
  });
  canvas_2.addEventListener("mousedown", function (e) {
    e.preventDefault();
    const rect_22 = canvas_2.getBoundingClientRect();
    const mx_23 = e.clientX - rect_22.left;
    const G__27_24 = squint_core.get(squint_core.deref(state_1), "state");
    switch (G__27_24) {
      case "title":
        return squint_core.reset_BANG_(
          state_1,
          squint_core.assoc(
            init_state(),
            "state",
            "playing",
            "best",
            squint_core.get(squint_core.deref(state_1), "best"),
          ),
        );

        break;
      case "dead":
        return squint_core.reset_BANG_(
          state_1,
          squint_core.assoc(
            init_state(),
            "state",
            "playing",
            "best",
            squint_core.get(squint_core.deref(state_1), "best"),
          ),
        );

        break;
      case "won":
        return squint_core.reset_BANG_(
          state_1,
          squint_core.assoc(
            init_state(),
            "state",
            "playing",
            "best",
            squint_core.get(squint_core.deref(state_1), "best"),
          ),
        );

        break;
      case "playing":
        set_key_BANG__4("up", true);
        if (mx_23 < W / 2) {
          return set_key_BANG__4("left", true);
        } else {
          return set_key_BANG__4("right", true);
        }

        break;
    }
  });
  canvas_2.addEventListener("mouseup", function (_) {
    return squint_core.swap_BANG_(
      state_1,
      squint_core.assoc,
      "keys",
      new Set([]),
    );
  });
  eng.init_keyboard_BANG_();
  const wrapper_26 = core.create_el("div", { class: "game-wrapper" });
  const controls_27 = core.create_el("div", {
    class: "touch-controls-container",
  });
  const touch_28 = eng.init_touch_BANG_(controls_27);
  wrapper_26.appendChild(
    core.create_el(
      "h1",
      {
        style:
          "font-family:'Press Start 2P',monospace;color:#00b4d8;font-size:var(--step-2);text-align:center",
      },
      "☁️ Cloud Lift",
    ),
  );
  wrapper_26.appendChild(
    core.create_el(
      "p",
      { style: "color:#888;text-align:center;margin-block-end:var(--space-m)" },
      "Fly to data centers · Pick up workloads · Deliver them to the cloud · Avoid outages",
    ),
  );
  wrapper_26.appendChild(canvas_2);
  wrapper_26.appendChild(controls_27);
  core.mount_BANG_(
    ui.page_shell(
      "helicopter",
      "/articles/helicopter.html",
      "web/modules/portfolio/games/helicopter.js",
      wrapper_26,
    ),
  );
  return eng.game_loop(
    canvas_2,
    state_1,
    function (s, dt) {
      return update_game(s, dt, touch_28);
    },
    draw_BANG_,
  );
};

export { init };
