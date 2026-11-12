import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var skus = [
  { id: "F2", cu: 2, price: 262, concurrent: 5, smoothing: "Background only" },
  {
    id: "F8",
    cu: 8,
    price: 1051,
    concurrent: 10,
    smoothing: "Background + Interactive 5min",
  },
  {
    id: "F16",
    cu: 16,
    price: 2102,
    concurrent: 15,
    smoothing: "Background + Interactive 5min",
  },
  {
    id: "F32",
    cu: 32,
    price: 4203,
    concurrent: 25,
    smoothing: "Background + Interactive 5min",
  },
  {
    id: "F64",
    cu: 64,
    price: 8406,
    concurrent: 40,
    smoothing: "Full smoothing (24hr)",
  },
  {
    id: "F128",
    cu: 128,
    price: 16812,
    concurrent: 60,
    smoothing: "Full smoothing (24hr)",
  },
  {
    id: "F256",
    cu: 256,
    price: 33624,
    concurrent: 90,
    smoothing: "Full smoothing (24hr)",
  },
];
var workloads = [
  {
    icon: "🧵",
    name: "Notebook (PySpark)",
    cu: 4,
    pattern: "Bursty",
    tip: "Each cell triggers a Spark job — interactive multiplier 1×",
  },
  {
    icon: "🔄",
    name: "Data Pipeline",
    cu: 2,
    pattern: "Scheduled",
    tip: "ELT orchestration — runs in background, smoothing applies",
  },
  {
    icon: "📊",
    name: "DirectLake Report",
    cu: 1,
    pattern: "On-query",
    tip: "Sub-second response — counts only on render",
  },
  {
    icon: "🗄",
    name: "Warehouse Query",
    cu: 3,
    pattern: "Interactive",
    tip: "T-SQL endpoint — counts immediately, no smoothing",
  },
  {
    icon: "⚡",
    name: "Eventstream",
    cu: 1.5,
    pattern: "Continuous",
    tip: "Always-on streaming — predictable steady-state",
  },
  {
    icon: "🤖",
    name: "ML Model Training",
    cu: 8,
    pattern: "Batch",
    tip: "Heavy Spark — schedule overnight if possible",
  },
];
var mitigations = [
  {
    icon: "📅",
    title: "Move heavy jobs to overnight",
    desc: "Background workloads smooth over 24h; schedule notebooks + ETL to run 00:00–06:00 to spread CU peaks",
    impact: "Often eliminates 430s entirely on F32–F64 capacities",
  },
  {
    icon: "🔀",
    title: "Split workspaces by domain",
    desc: "Bind each business domain to its own capacity (ws_loanetl_brz on cap-edm-prd, ws_marketing on cap-mkt-prd) so a runaway notebook doesn't starve everyone",
    impact: "Blast radius shrinks from 'whole tenant' to 'one team'",
  },
  {
    icon: "🪣",
    title: "Use DirectLake instead of Import",
    desc: "Import mode reloads on every refresh — DirectLake reads OneLake parquet on-query, near-zero refresh CU",
    impact: "Reports drop from peaks of 8–12 CU to <1 CU each",
  },
  {
    icon: "⏸",
    title: "Pause non-prod capacities",
    desc: "F-SKUs bill per second — `az fabric capacity suspend` on dev/stg outside business hours",
    impact: "60–70% monthly savings on non-prod",
  },
  {
    icon: "📈",
    title: "Right-size with capacity metrics app",
    desc: "Install the Microsoft Fabric Capacity Metrics app, look at peak smoothed % over 7d — if always <40%, downsize",
    impact: "F64 → F32 saves $4,200/mo if utilization supports it",
  },
];
var symptoms = [
  {
    code: "429",
    name: "Too Many Requests",
    meaning: "Tenant-level API rate limit — independent of capacity sizing",
  },
  {
    code: "430",
    name: "Capacity Throttled",
    meaning:
      "Your CU smoothed-usage exceeded 100% — workloads are queued/rejected",
  },
  {
    code: "503",
    name: "Capacity Unavailable",
    meaning: "Capacity paused, deleted, or in a fault state",
  },
];
var state = squint_core.atom({
  sku: squint_core.first(skus),
  selected: squint_core.set(
    squint_core.map("name", squint_core.take(3, workloads)),
  ),
  concurrent: 3,
  tab: "sizing",
});
var workload_by_name = function (n) {
  return squint_core.first(
    squint_core.filter(function (_PERCENT_1) {
      return squint_core._EQ_(n, squint_core.get(_PERCENT_1, "name"));
    }, workloads),
  );
};
var total_cu = function () {
  const picked_1 = squint_core.map(
    workload_by_name,
    squint_core.get(squint_core.deref(state), "selected"),
  );
  const mult_2 = squint_core.get(squint_core.deref(state), "concurrent");
  return (
    mult_2 *
    squint_core.reduce(squint_core._PLUS_, squint_core.map("cu", picked_1))
  );
};
var utilization = function () {
  const cu_1 = total_cu();
  const cap_2 = squint_core.get(
    squint_core.get(squint_core.deref(state), "sku"),
    "cu",
  );
  if (cap_2 === 0) {
    return 0;
  } else {
    return (100 * cu_1) / cap_2;
  }
};
var throttle_status = function () {
  const u_1 = utilization();
  if (u_1 < 50) {
    return { label: "Healthy", color: "#00a86b", icon: "✅" };
  } else {
    if (u_1 < 80) {
      return { label: "Watch", color: "#b8860b", icon: "⚠" };
    } else {
      if (u_1 < 100) {
        return { label: "Smoothing", color: "#d83b01", icon: "🟠" };
      } else {
        if ("else") {
          return { label: "430 Throttle", color: "#a4262c", icon: "🛑" };
        } else {
          return null;
        }
      }
    }
  }
};
var fmt_money = function (n) {
  return `${"$"}${n.toLocaleString() ?? ""}`;
};
var metrics_panel = function () {
  const cu_1 = total_cu();
  const cap_2 = squint_core.get(
    squint_core.get(squint_core.deref(state), "sku"),
    "cu",
  );
  const util_3 = utilization();
  const st_4 = throttle_status();
  const panel_5 = core.create_el("div", { class: "metrics-row" });
  for (let G__6 of squint_core.iterable([
    [
      "SKU",
      squint_core.get(squint_core.get(squint_core.deref(state), "sku"), "id"),
      "#0078d4",
    ],
    [
      "Monthly Cost",
      fmt_money(
        squint_core.get(
          squint_core.get(squint_core.deref(state), "sku"),
          "price",
        ),
      ),
      "#7e57c2",
    ],
    ["Total CU Need", `${cu_1.toFixed(1) ?? ""}${" CU"}`, "#b8860b"],
    ["Capacity", `${cap_2 ?? ""}${" CU"}`, "#605e5c"],
    [
      "Utilization",
      `${util_3.toFixed(0) ?? ""}${"%"}`,
      squint_core.get(st_4, "color"),
    ],
    [
      "Status",
      `${squint_core.get(st_4, "icon") ?? ""}${" "}${squint_core.get(st_4, "label") ?? ""}`,
      squint_core.get(st_4, "color"),
    ],
  ])) {
    const vec___7_10 = G__6;
    const label_11 = squint_core.nth(vec___7_10, 0, null);
    const value_12 = squint_core.nth(vec___7_10, 1, null);
    const color_13 = squint_core.nth(vec___7_10, 2, null);
    panel_5.appendChild(
      core.create_el(
        "div",
        { class: "metric-card" },
        core.create_el(
          "div",
          { class: "metric-value", style: `${"color:"}${color_13 ?? ""}` },
          value_12,
        ),
        core.create_el("div", { class: "metric-label" }, label_11),
      ),
    );
  }
  return panel_5;
};
var sku_section = function (on_change) {
  const section_1 = core.create_el("div", { class: "panel" });
  section_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "🧵 Pick a Fabric SKU"),
  );
  section_1.appendChild(
    core.create_el(
      "p",
      { class: "panel-sub" },
      "F-SKUs are sized in Capacity Units (CU). 1 CU ≈ 1 vCore. Bigger SKUs get longer smoothing windows.",
    ),
  );
  const bar_2 = core.create_el("div", { class: "filter-bar" });
  for (let G__3 of squint_core.iterable(skus)) {
    const sku_4 = G__3;
    const active_QMARK__5 = squint_core._EQ_(
      sku_4,
      squint_core.get(squint_core.deref(state), "sku"),
    );
    const btn_6 = core.create_el(
      "button",
      {
        class: `filter-btn${(active_QMARK__5 ? " active" : null) ?? ""}`,
        title: squint_core.get(sku_4, "smoothing"),
      },
      `${squint_core.get(sku_4, "id") ?? ""}${" · "}${fmt_money(squint_core.get(sku_4, "price")) ?? ""}${"/mo"}`,
    );
    btn_6.addEventListener("click", function (_) {
      squint_core.swap_BANG_(state, squint_core.assoc, "sku", sku_4);
      for (let G__7 of squint_core.iterable(
        Array.from(bar_2.querySelectorAll(".filter-btn")),
      )) {
        const b_8 = G__7;
        b_8.classList.remove("active");
      }
      btn_6.classList.add("active");
      on_change();
      return core.toast_BANG_(
        `${"🧵 "}${squint_core.get(sku_4, "id") ?? ""}${" — "}${squint_core.get(sku_4, "smoothing") ?? ""}`,
      );
    });
    bar_2.appendChild(btn_6);
  }
  section_1.appendChild(bar_2);
  return section_1;
};
var workload_section = function (on_change) {
  const section_1 = core.create_el("div", { class: "panel" });
  section_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "📦 Workload Mix"),
  );
  section_1.appendChild(
    core.create_el(
      "p",
      { class: "panel-sub" },
      "Toggle the workloads running on this capacity. Each one consumes CU per concurrent execution.",
    ),
  );
  const grid_2 = core.create_el("div", { class: "card-grid" });
  for (let G__3 of squint_core.iterable(workloads)) {
    const w_4 = G__3;
    const active_QMARK__5 = squint_core.contains_QMARK_(
      squint_core.get(squint_core.deref(state), "selected"),
      squint_core.get(w_4, "name"),
    );
    const card_6 = core.create_el(
      "div",
      {
        class: `agent-card${(active_QMARK__5 ? " active" : null) ?? ""}`,
        style: `${"cursor:pointer;"}${(active_QMARK__5 ? "border:2px solid var(--clr-accent)" : null) ?? ""}`,
      },
      core.create_el(
        "span",
        { class: "agent-icon" },
        squint_core.get(w_4, "icon"),
      ),
      core.create_el(
        "div",
        { class: "agent-info" },
        core.create_el(
          "div",
          { class: "agent-name" },
          squint_core.get(w_4, "name"),
        ),
        core.create_el(
          "div",
          { class: "agent-desc" },
          `${squint_core.get(w_4, "cu") ?? ""}${" CU · "}${squint_core.get(w_4, "pattern") ?? ""}${" · "}${squint_core.get(w_4, "tip") ?? ""}`,
        ),
      ),
    );
    card_6.addEventListener("click", function (_) {
      squint_core.swap_BANG_(
        state,
        squint_core.update,
        "selected",
        function (s) {
          if (squint_core.contains_QMARK_(s, squint_core.get(w_4, "name"))) {
            return squint_core.disj(s, squint_core.get(w_4, "name"));
          } else {
            return squint_core.conj(s, squint_core.get(w_4, "name"));
          }
        },
      );
      on_change();
      return core.toast_BANG_(
        `${squint_core.get(w_4, "icon") ?? ""}${" "}${(active_QMARK__5 ? "removed" : "added") ?? ""}${" — "}${squint_core.get(w_4, "name") ?? ""}`,
      );
    });
    grid_2.appendChild(card_6);
  }
  section_1.appendChild(grid_2);
  return section_1;
};
var concurrency_section = function (on_change) {
  const section_1 = core.create_el("div", { class: "panel" });
  section_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "👥 Concurrent Users"),
  );
  section_1.appendChild(
    core.create_el(
      "p",
      { class: "panel-sub" },
      "Each active user triggers one execution of the workload mix. Smoothing window absorbs short bursts, sustained load → 430.",
    ),
  );
  const bar_2 = core.create_el("div", { class: "filter-bar" });
  for (let G__3 of squint_core.iterable([1, 3, 5, 10, 20, 50])) {
    const n_4 = G__3;
    const active_QMARK__5 = squint_core._EQ_(
      n_4,
      squint_core.get(squint_core.deref(state), "concurrent"),
    );
    const btn_6 = core.create_el(
      "button",
      { class: `filter-btn${(active_QMARK__5 ? " active" : null) ?? ""}` },
      `${n_4 ?? ""}${" user"}${(n_4 === 1 ? "" : "s") ?? ""}`,
    );
    btn_6.addEventListener("click", function (_) {
      squint_core.swap_BANG_(state, squint_core.assoc, "concurrent", n_4);
      for (let G__7 of squint_core.iterable(
        Array.from(bar_2.querySelectorAll(".filter-btn")),
      )) {
        const b_8 = G__7;
        b_8.classList.remove("active");
      }
      btn_6.classList.add("active");
      on_change();
      return core.toast_BANG_(
        `${"👥 "}${n_4 ?? ""}${" concurrent user"}${(n_4 === 1 ? "" : "s") ?? ""}`,
      );
    });
    bar_2.appendChild(btn_6);
  }
  section_1.appendChild(bar_2);
  return section_1;
};
var mitigation_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "🧯 Mitigations"),
  );
  const grid_2 = core.create_el("div", { class: "card-grid" });
  for (let G__3 of squint_core.iterable(mitigations)) {
    const m_4 = G__3;
    const card_5 = core.create_el(
      "div",
      { class: "agent-card", style: "cursor:pointer" },
      core.create_el(
        "span",
        { class: "agent-icon" },
        squint_core.get(m_4, "icon"),
      ),
      core.create_el(
        "div",
        { class: "agent-info" },
        core.create_el(
          "div",
          { class: "agent-name" },
          squint_core.get(m_4, "title"),
        ),
        core.create_el(
          "div",
          { class: "agent-desc" },
          squint_core.get(m_4, "desc"),
        ),
        core.create_el(
          "div",
          {
            style: "color:var(--clr-accent);margin-top:0.3rem;font-weight:600",
          },
          squint_core.get(m_4, "impact"),
        ),
      ),
    );
    card_5.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${squint_core.get(m_4, "icon") ?? ""}${" "}${squint_core.get(m_4, "title") ?? ""}${" — "}${squint_core.get(m_4, "impact") ?? ""}`,
      );
    });
    grid_2.appendChild(card_5);
  }
  panel_1.appendChild(grid_2);
  return panel_1;
};
var symptoms_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "🩺 HTTP Status Decoder"),
  );
  panel_1.appendChild(
    core.create_el(
      "p",
      { class: "panel-sub" },
      "When Fabric APIs reject calls, the status code tells you exactly what failed.",
    ),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable(["Code", "Name", "Meaning"])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(symptoms)) {
    const s_9 = G__8;
    const row_10 = core.create_el("tr", {});
    row_10.appendChild(
      core.create_el(
        "td",
        {
          style:
            "font-family:monospace;font-weight:700;font-size:1.1rem;color:var(--clr-accent)",
        },
        squint_core.get(s_9, "code"),
      ),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "font-weight:600" },
        squint_core.get(s_9, "name"),
      ),
    );
    row_10.appendChild(
      core.create_el("td", {}, squint_core.get(s_9, "meaning")),
    );
    row_10.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${squint_core.get(s_9, "code") ?? ""}${" — "}${squint_core.get(s_9, "meaning") ?? ""}`,
      );
    });
    tbody_7.appendChild(row_10);
  }
  table_2.appendChild(tbody_7);
  panel_1.appendChild(table_2);
  return panel_1;
};
var tab_button = function (label, active, on_click) {
  const btn_1 = core.create_el(
    "button",
    {
      class: `tab-btn${(squint_core.truth_(active) ? " active" : null) ?? ""}`,
    },
    label,
  );
  btn_1.addEventListener("click", on_click);
  return btn_1;
};
var fabriccap_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  const metrics_slot_2 = squint_core.atom(null);
  const sizing_body_3 = squint_core.atom(null);
  const tab_body_4 = core.create_el("div", { class: "tab-body" });
  const refresh_BANG__5 = function () {
    const temp__23233__auto___6 = squint_core.deref(metrics_slot_2);
    if (squint_core.truth_(temp__23233__auto___6)) {
      const old_7 = temp__23233__auto___6;
      const p_8 = old_7.parentNode;
      const fresh_9 = metrics_panel();
      p_8.replaceChild(fresh_9, old_7);
      return squint_core.reset_BANG_(metrics_slot_2, fresh_9);
    }
  };
  const sizing_panel_10 = function () {
    const wrap_11 = core.create_el("div", {});
    wrap_11.appendChild(sku_section(refresh_BANG__5));
    wrap_11.appendChild(workload_section(refresh_BANG__5));
    wrap_11.appendChild(concurrency_section(refresh_BANG__5));
    return wrap_11;
  };
  const render_tab_12 = function (tab) {
    tab_body_4.innerHTML = "";
    return tab_body_4.appendChild(
      (() => {
        const G__47_13 = tab;
        switch (G__47_13) {
          case "sizing":
            const p_15 = sizing_panel_10();
            squint_core.reset_BANG_(sizing_body_3, p_15);
            return p_15;

            break;
          case "mitigations":
            return mitigation_panel();

            break;
          case "symptoms":
            return symptoms_panel();

            break;
          default:
            throw new Error(`${"No matching clause: "}${G__47_13 ?? ""}`);
        }
      })(),
    );
  };
  container_1.appendChild(
    core.create_el("h1", { class: "dashboard-title" }, "Fabric Capacity Tuner"),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "Size Microsoft Fabric capacity — model CU usage, simulate 430 throttling, and tune for cost",
    ),
  );
  const m_16 = metrics_panel();
  squint_core.reset_BANG_(metrics_slot_2, m_16);
  container_1.appendChild(m_16);
  const tabs_17 = core.create_el("div", { class: "tab-bar" });
  for (let G__18 of squint_core.iterable([
    ["Sizing", "sizing"],
    ["Mitigations", "mitigations"],
    ["HTTP Codes", "symptoms"],
  ])) {
    const vec___19_22 = G__18;
    const label_23 = squint_core.nth(vec___19_22, 0, null);
    const key_24 = squint_core.nth(vec___19_22, 1, null);
    tabs_17.appendChild(
      tab_button(
        label_23,
        squint_core._EQ_(
          key_24,
          squint_core.get(squint_core.deref(state), "tab"),
        ),
        function (e) {
          squint_core.swap_BANG_(state, squint_core.assoc, "tab", key_24);
          render_tab_12(key_24);
          for (let G__25 of squint_core.iterable(
            Array.from(tabs_17.querySelectorAll(".tab-btn")),
          )) {
            const b_26 = G__25;
            b_26.classList.remove("active");
          }
          return e.target.classList.add("active");
        },
      ),
    );
  }
  container_1.appendChild(tabs_17);
  container_1.appendChild(tab_body_4);
  render_tab_12("sizing");
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "fabriccap",
      "/articles/fabric-capacity-tuner.html",
      "web/modules/portfolio/pro/fabriccap.js",
      fabriccap_content(),
    ),
  );
};

export { init };
