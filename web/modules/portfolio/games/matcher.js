import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
import * as eng from "./engine.js";
import * as portfolio_DOT_games_DOT_engine from "./engine.js";
var W = 480;
var H = 400;
var caf_pairs = [
  {
    resource: "Function App",
    caf: "func-project-dev-scus-001",
    prefix: "func",
  },
  { resource: "Storage Account", caf: "st-project-dev-scus-001", prefix: "st" },
  { resource: "Key Vault", caf: "kv-project-dev-scus-001", prefix: "kv" },
  {
    resource: "Virtual Network",
    caf: "vnet-project-dev-scus-001",
    prefix: "vnet",
  },
  { resource: "Resource Group", caf: "rg-project-dev-scus-001", prefix: "rg" },
  {
    resource: "App Service Plan",
    caf: "asp-project-dev-scus-001",
    prefix: "asp",
  },
  {
    resource: "Managed Identity",
    caf: "umi-project-dev-scus-ctl",
    prefix: "umi",
  },
  { resource: "Event Hub", caf: "evh-project-dev-scus-001", prefix: "evh" },
  {
    resource: "Container Registry",
    caf: "cr-project-dev-scus-001",
    prefix: "cr",
  },
  {
    resource: "App Insights",
    caf: "appi-project-dev-scus-001",
    prefix: "appi",
  },
  {
    resource: "Static Web App",
    caf: "stapp-project-dev-scus-001",
    prefix: "stapp",
  },
  {
    resource: "Deployment Stack",
    caf: "stack-project-dev-scus-001",
    prefix: "stack",
  },
];
var shuffle_vec = function (v) {
  return squint_core.vec(
    squint_core.sort_by(function (_) {
      return Math.random();
    }, v),
  );
};
var pick_round = function (n) {
  const pairs_1 = squint_core.take(n, shuffle_vec(caf_pairs));
  const resources_2 = shuffle_vec(squint_core.mapv("resource", pairs_1));
  const names_3 = shuffle_vec(squint_core.mapv("caf", pairs_1));
  return {
    pairs: pairs_1,
    resources: resources_2,
    names: names_3,
    "selected-resource": null,
    matched: [],
    wrong: 0,
  };
};
var initial_state = function () {
  return squint_core.merge(pick_round(5), {
    score: 0,
    round: 1,
    phase: "playing",
    timer: 30,
    connections: [],
  });
};
var find_pair = function (resource, caf_name, pairs) {
  return squint_core.some(function (_PERCENT_1) {
    if (
      squint_core._EQ_(squint_core.get(_PERCENT_1, "resource"), resource) &&
      squint_core._EQ_(squint_core.get(_PERCENT_1, "caf"), caf_name)
    ) {
      return _PERCENT_1;
    }
  }, pairs);
};
var create_style_el = function () {
  return core.create_el(
    "style",
    {},
    ".matcher-game{position:relative;width:480px;margin:0 auto;display:flex;gap:12px;font-family:'VT323',monospace}\n.matcher-col{flex:1;display:flex;flex-direction:column;gap:10px;padding:8px}\n.matcher-item{background:#0b0b16;color:#ffffff;height:52px;display:flex;align-items:center;padding:0 12px;border-radius:6px;font-size:20px;cursor:pointer;user-select:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.matcher-item.selected{outline:2px solid #ffaa00}\n.matcher-item.matched{background:#002b07;color:#00ff41}\n.match-line{position:absolute;height:4px;background:rgba(0,255,65,0.95);transform-origin:left center;border-radius:2px;transition:transform .35s ease}\n.matcher-header{color:#00d4ff;text-align:center;font-size:20px;margin-bottom:8px}\n@media (max-width:480px){.matcher-game{width:100%;padding:8px}.matcher-item{font-size:18px;height:48px}}",
  );
};
var make_item_el = function (text, cls) {
  return core.create_el("div", { class: cls }, text);
};
var draw_connection_BANG_ = function (container, a, b) {
  const rA_1 = a.getBoundingClientRect();
  const rB_2 = b.getBoundingClientRect();
  const cR_3 = container.getBoundingClientRect();
  const x1_4 = rA_1.right - cR_3.left;
  const y1_5 = rA_1.top + rA_1.height / 2 - cR_3.top;
  const x2_6 = rB_2.left - cR_3.left;
  const y2_7 = rB_2.top + rB_2.height / 2 - cR_3.top;
  const dx_8 = x2_6 - x1_4;
  const dy_9 = y2_7 - y1_5;
  const len_10 = Math.hypot(dx_8, dy_9);
  const ang_11 = 180 * (Math.atan2(dy_9, dx_8) / Math.PI);
  const line_12 = core.create_el("div", { class: "match-line" });
  line_12.style.left = `${x1_4}px`;
  line_12.style.top = `${y1_5 - 2}px`;
  line_12.style.width = `${len_10 ?? ""}px`;
  line_12.style.transform = `${"rotate("}${ang_11}${"deg) scaleX(0)"}`;
  container.appendChild(line_12);
  requestAnimationFrame(function () {
    return (line_12.style.transform = `${"rotate("}${ang_11}${"deg) scaleX(1)"}`);
  });
  return line_12;
};
var update_game = function (state, dt) {
  if (!("playing" === squint_core.get(state, "phase"))) {
    const conns_1 = squint_core.vec(
      squint_core.filter(
        function (_PERCENT_1) {
          const or_2_3 = squint_core.get(_PERCENT_1, "persist");
          if (squint_core.truth_(or_2_3)) {
            return or_2_3;
          } else {
            return (
              squint_core.get(_PERCENT_1, "elapsed") <=
              squint_core.get(_PERCENT_1, "duration")
            );
          }
        },
        squint_core.map(
          function (_PERCENT_1) {
            return squint_core.update(
              _PERCENT_1,
              "elapsed",
              squint_core._PLUS_,
              dt,
            );
          },
          squint_core.get(state, "connections"),
        ),
      ),
    );
    return squint_core.assoc(state, "connections", conns_1);
  } else {
    const new_timer_4 = squint_core.get(state, "timer") - dt;
    const base_state_5 =
      new_timer_4 <= 0
        ? squint_core.assoc(state, "phase", "timeout", "timer", 0)
        : squint_core._EQ_(
              squint_core.count(squint_core.get(state, "matched")),
              squint_core.count(squint_core.get(state, "resources")),
            )
          ? squint_core.assoc(state, "phase", "win")
          : "else"
            ? squint_core.assoc(state, "timer", new_timer_4)
            : null;
    const conns_6 = squint_core.vec(
      squint_core.filter(
        function (_PERCENT_1) {
          const or_7_8 = squint_core.get(_PERCENT_1, "persist");
          if (squint_core.truth_(or_7_8)) {
            return or_7_8;
          } else {
            return (
              squint_core.get(_PERCENT_1, "elapsed") <=
              squint_core.get(_PERCENT_1, "duration")
            );
          }
        },
        squint_core.map(
          function (_PERCENT_1) {
            return squint_core.update(
              _PERCENT_1,
              "elapsed",
              squint_core._PLUS_,
              dt,
            );
          },
          squint_core.get(base_state_5, "connections"),
        ),
      ),
    );
    return squint_core.assoc(base_state_5, "connections", conns_6);
  }
};
var setup_click_handlers_BANG_ = function (canvas, state) {
  return canvas.addEventListener("click", function (e) {
    const rect_1 = canvas.getBoundingClientRect();
    const scale_x_2 = W / rect_1.width;
    const scale_y_3 = H / rect_1.height;
    const mx_4 = (e.clientX - rect_1.left) * scale_x_2;
    const my_5 = (e.clientY - rect_1.top) * scale_y_3;
    const s_6 = squint_core.deref(state);
    if ("playing" === squint_core.get(s_6, "phase")) {
      if (mx_4 < 240) {
        const idx_7 = ((my_5 - 86) / 30) | 0;
        if (
          idx_7 >= 0 &&
          idx_7 < squint_core.count(squint_core.get(s_6, "resources"))
        ) {
          squint_core.swap_BANG_(
            state,
            squint_core.assoc,
            "selected-resource",
            squint_core.nth(squint_core.get(s_6, "resources"), idx_7),
          );
        }
      }
      if (mx_4 >= 240) {
        const idx_8 = ((my_5 - 86) / 30) | 0;
        if (
          squint_core.truth_(
            idx_8 >= 0 &&
              idx_8 < squint_core.count(squint_core.get(s_6, "names")) &&
              squint_core.get(squint_core.deref(state), "selected-resource"),
          )
        ) {
          const res_9 = squint_core.get(
            squint_core.deref(state),
            "selected-resource",
          );
          const nam_10 = squint_core.nth(
            squint_core.get(squint_core.deref(state), "names"),
            idx_8,
          );
          if (
            squint_core.truth_(
              find_pair(
                res_9,
                nam_10,
                squint_core.get(squint_core.deref(state), "pairs"),
              ),
            )
          ) {
            const pair_11 = find_pair(
              res_9,
              nam_10,
              squint_core.get(squint_core.deref(state), "pairs"),
            );
            const res_idx_12 = squint_core
              .get(squint_core.deref(state), "resources")
              .indexOf(res_9);
            const name_idx_13 = idx_8;
            const conn_14 = {
              x1: 20,
              y1: 100 + res_idx_12 * 30,
              x2: 260,
              y2: 100 + name_idx_13 * 30,
              elapsed: 0,
              duration: 1.2,
            };
            return squint_core.swap_BANG_(state, function (_PERCENT_1) {
              return squint_core.assoc(
                squint_core.update(
                  squint_core.update(
                    squint_core.update(
                      _PERCENT_1,
                      "matched",
                      squint_core.conj,
                      pair_11,
                    ),
                    "score",
                    squint_core._PLUS_,
                    200,
                  ),
                  "connections",
                  squint_core.conj,
                  conn_14,
                ),
                "selected-resource",
                null,
              );
            });
          } else {
            return squint_core.swap_BANG_(state, function (_PERCENT_1) {
              return squint_core.assoc(
                squint_core.update(_PERCENT_1, "wrong", squint_core.inc),
                "selected-resource",
                null,
              );
            });
          }
        }
      }
    }
  });
};
var init = function () {
  const wrapper_1 = core.create_el("div", { class: "game-wrapper" });
  const style_el_2 = create_style_el();
  const header_3 = core.create_el(
    "h1",
    { class: "matcher-header" },
    "CAF NAMING PUZZLE",
  );
  const container_4 = core.create_el("div", { class: "matcher-game" });
  const left_col_5 = core.create_el("div", { class: "matcher-col left-col" });
  const right_col_6 = core.create_el("div", { class: "matcher-col right-col" });
  const state_atom_7 = squint_core.atom(initial_state());
  const res_els_8 = squint_core.atom([]);
  const name_els_9 = squint_core.atom([]);
  wrapper_1.appendChild(style_el_2);
  wrapper_1.appendChild(header_3);
  container_4.appendChild(left_col_5);
  container_4.appendChild(right_col_6);
  wrapper_1.appendChild(container_4);
  for (let G__10 of squint_core.iterable(
    squint_core.map_indexed(
      squint_core.vector,
      squint_core.get(squint_core.deref(state_atom_7), "resources"),
    ),
  )) {
    const vec___11_14 = G__10;
    const i_15 = squint_core.nth(vec___11_14, 0, null);
    const r_16 = squint_core.nth(vec___11_14, 1, null);
    const el_17 = make_item_el(r_16, "matcher-item resource-item");
    el_17.addEventListener("click", function (_) {
      squint_core.swap_BANG_(
        state_atom_7,
        squint_core.assoc,
        "selected-resource",
        i_15,
      );
      for (let G__18 of squint_core.iterable(
        squint_core.map_indexed(
          squint_core.vector,
          squint_core.deref(res_els_8),
        ),
      )) {
        const vec___19_22 = G__18;
        const j_23 = squint_core.nth(vec___19_22, 0, null);
        const e_24 = squint_core.nth(vec___19_22, 1, null);
        const res_name_25 = squint_core.nth(
          squint_core.get(squint_core.deref(state_atom_7), "resources"),
          j_23,
        );
        const matched_QMARK__26 = squint_core.some(
          function (_PERCENT_1) {
            return squint_core._EQ_(
              squint_core.get(_PERCENT_1, "resource"),
              res_name_25,
            );
          },
          squint_core.get(squint_core.deref(state_atom_7), "matched"),
        );
        const cls_27 = squint_core.truth_(matched_QMARK__26)
          ? "matcher-item matched"
          : squint_core._EQ_(j_23, i_15)
            ? "matcher-item selected"
            : "else"
              ? "matcher-item"
              : null;
        e_24.className = cls_27;
      }
      return null;
    });
    squint_core.swap_BANG_(res_els_8, squint_core.conj, el_17);
    left_col_5.appendChild(el_17);
  }
  for (let G__28 of squint_core.iterable(
    squint_core.map_indexed(
      squint_core.vector,
      squint_core.get(squint_core.deref(state_atom_7), "names"),
    ),
  )) {
    const vec___29_32 = G__28;
    const i_33 = squint_core.nth(vec___29_32, 0, null);
    const n_34 = squint_core.nth(vec___29_32, 1, null);
    const el_35 = make_item_el(n_34, "matcher-item name-item");
    el_35.addEventListener("click", function (_) {
      const sel_36 = squint_core.get(
        squint_core.deref(state_atom_7),
        "selected-resource",
      );
      if (!(sel_36 == null)) {
        const res_37 = squint_core.nth(
          squint_core.get(squint_core.deref(state_atom_7), "resources"),
          sel_36,
        );
        const nam_38 = squint_core.nth(
          squint_core.get(squint_core.deref(state_atom_7), "names"),
          i_33,
        );
        if (
          squint_core.truth_(
            find_pair(
              res_37,
              nam_38,
              squint_core.get(squint_core.deref(state_atom_7), "pairs"),
            ),
          )
        ) {
          squint_core.nth(squint_core.deref(res_els_8), sel_36).className =
            "matcher-item matched";
          el_35.className = "matcher-item matched";
          draw_connection_BANG_(
            container_4,
            squint_core.nth(squint_core.deref(res_els_8), sel_36),
            el_35,
          );
          return squint_core.swap_BANG_(state_atom_7, function (_PERCENT_1) {
            return squint_core.assoc(
              squint_core.update(
                squint_core.update(
                  _PERCENT_1,
                  "matched",
                  squint_core.conj,
                  find_pair(
                    res_37,
                    nam_38,
                    squint_core.get(_PERCENT_1, "pairs"),
                  ),
                ),
                "score",
                squint_core._PLUS_,
                200,
              ),
              "selected-resource",
              null,
            );
          });
        } else {
          const res_name_39 = squint_core.nth(
            squint_core.get(squint_core.deref(state_atom_7), "resources"),
            sel_36,
          );
          const was_matched_QMARK__40 = squint_core.some(
            function (_PERCENT_1) {
              return squint_core._EQ_(
                squint_core.get(_PERCENT_1, "resource"),
                res_name_39,
              );
            },
            squint_core.get(squint_core.deref(state_atom_7), "matched"),
          );
          squint_core.nth(squint_core.deref(res_els_8), sel_36).className =
            squint_core.truth_(was_matched_QMARK__40)
              ? "matcher-item matched"
              : "matcher-item";
          squint_core.swap_BANG_(
            state_atom_7,
            squint_core.update,
            "wrong",
            squint_core.inc,
          );
          return squint_core.swap_BANG_(
            state_atom_7,
            squint_core.assoc,
            "selected-resource",
            null,
          );
        }
      }
    });
    squint_core.swap_BANG_(name_els_9, squint_core.conj, el_35);
    right_col_6.appendChild(el_35);
  }
  return core.mount_BANG_(
    ui.page_shell(
      "matcher",
      "/articles/caf-matcher.html",
      "web/modules/portfolio/games/matcher.js",
      wrapper_1,
    ),
  );
};

export { init };
