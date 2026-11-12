import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var pipeline_stages = [
  {
    id: "source",
    label: "Event Hub",
    color: "#ADD8E6",
    icon: "📡",
    desc: "Transaction events from microservices",
  },
  {
    id: "stream",
    label: "Eventstream",
    color: "#E0FFFF",
    icon: "🌊",
    desc: "Real-time ingestion into Fabric",
  },
  {
    id: "bronze",
    label: "Bronze",
    color: "#F5DEB3",
    icon: "🥉",
    desc: "Raw landing — append-only, schema-on-read",
  },
  {
    id: "silver",
    label: "Silver",
    color: "#E8E8E8",
    icon: "🥈",
    desc: "Parsed, deduplicated, typed columns",
  },
  {
    id: "gold",
    label: "Gold",
    color: "#FFF8DC",
    icon: "🥇",
    desc: "Aggregated hourly/daily rollups in Delta",
  },
  {
    id: "semantic",
    label: "Semantic Model",
    color: "#FFB6C1",
    icon: "📊",
    desc: "DAX measures + TMDL definitions for Power BI",
  },
];
var mock_events = [
  {
    ts: "2026-05-09T08:00:01Z",
    type: "transaction_raw",
    records: 1247,
    status: "ingested",
  },
  {
    ts: "2026-05-09T08:00:05Z",
    type: "update_policy",
    records: 1247,
    status: "parsed",
  },
  {
    ts: "2026-05-09T08:00:30Z",
    type: "notebook_tfm_gld",
    records: 1247,
    status: "aggregated",
  },
  {
    ts: "2026-05-09T08:01:00Z",
    type: "semantic_refresh",
    records: 12,
    status: "published",
  },
];
var stage_card = function (p__28, active) {
  const map___1_3 = p__28;
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const label_5 = squint_core.get(map___1_4, "label");
  const color_6 = squint_core.get(map___1_4, "color");
  const icon_7 = squint_core.get(map___1_4, "icon");
  const desc_8 = squint_core.get(map___1_4, "desc");
  const cls_9 = `stage-card${(squint_core.truth_(active) ? " active" : null) ?? ""}`;
  const el_10 = core.create_el(
    "div",
    { class: cls_9, style: `${"border-left: 4px solid "}${color_6 ?? ""}` },
    core.create_el(
      "div",
      { class: "stage-header" },
      core.create_el("span", { class: "stage-icon" }, icon_7),
      core.create_el("span", { class: "stage-label" }, label_5),
    ),
    core.create_el("p", { class: "stage-desc" }, desc_8),
  );
  el_10.addEventListener("click", function (_) {
    return core.toast_BANG_(
      `${icon_7 ?? ""}${" "}${label_5 ?? ""}${" — "}${desc_8 ?? ""}`,
    );
  });
  return el_10;
};
var arrow = function () {
  return core.create_el("div", { class: "flow-arrow" }, "→");
};
var pipeline_flow = function (active_idx) {
  const container_1 = core.create_el("div", { class: "pipeline-flow" });
  for (let G__2 of squint_core.iterable(
    squint_core.map_indexed(squint_core.vector, pipeline_stages),
  )) {
    const vec___3_6 = G__2;
    const i_7 = squint_core.nth(vec___3_6, 0, null);
    const stage_8 = squint_core.nth(vec___3_6, 1, null);
    if (i_7 > 0) {
      container_1.appendChild(arrow());
    }
    container_1.appendChild(
      stage_card(stage_8, squint_core._EQ_(i_7, active_idx)),
    );
  }
  return container_1;
};
var event_log = function (events) {
  const log_1 = core.create_el("div", { class: "event-log" });
  const title_2 = core.create_el(
    "h3",
    { class: "log-title" },
    "📋 Pipeline Activity",
  );
  log_1.appendChild(title_2);
  const table_3 = core.create_el("table", { class: "log-table" });
  const thead_4 = core.create_el("thead", {});
  const hrow_5 = core.create_el("tr", {});
  for (let G__6 of squint_core.iterable([
    "Timestamp",
    "Operation",
    "Records",
    "Status",
  ])) {
    const h_7 = G__6;
    hrow_5.appendChild(core.create_el("th", {}, h_7));
  }
  thead_4.appendChild(hrow_5);
  table_3.appendChild(thead_4);
  const tbody_8 = core.create_el("tbody", {});
  for (let G__9 of squint_core.iterable(events)) {
    const evt_10 = G__9;
    const row_11 = core.create_el("tr", {});
    for (let G__12 of squint_core.iterable([
      squint_core.get(evt_10, "ts"),
      squint_core.get(evt_10, "type"),
      `${squint_core.get(evt_10, "records") ?? ""}`,
      squint_core.get(evt_10, "status"),
    ])) {
      const v_13 = G__12;
      row_11.appendChild(core.create_el("td", {}, v_13));
    }
    tbody_8.appendChild(row_11);
  }
  table_3.appendChild(tbody_8);
  log_1.appendChild(table_3);
  return log_1;
};
var metrics_panel = function () {
  const panel_1 = core.create_el("div", { class: "metrics-row" });
  for (let G__2 of squint_core.iterable([
    ["Events/hour", "12,470", "#0078d4"],
    ["Avg latency", "< 5s", "#00a86b"],
    ["Gold tables", "2", "#b8860b"],
    ["DAX measures", "14", "#8b008b"],
  ])) {
    const vec___3_6 = G__2;
    const label_7 = squint_core.nth(vec___3_6, 0, null);
    const value_8 = squint_core.nth(vec___3_6, 1, null);
    const color_9 = squint_core.nth(vec___3_6, 2, null);
    panel_1.appendChild(
      core.create_el(
        "div",
        { class: "metric-card" },
        core.create_el(
          "div",
          { class: "metric-value", style: `${"color:"}${color_9 ?? ""}` },
          value_8,
        ),
        core.create_el("div", { class: "metric-label" }, label_7),
      ),
    );
  }
  return panel_1;
};
var fabric_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  const state_2 = squint_core.atom({ "active-stage": 0 });
  container_1.appendChild(
    core.create_el(
      "h1",
      { class: "dashboard-title" },
      "Fabric Medallion Pipeline",
    ),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "Real-time transaction log pipeline — Event Hub → Eventhouse → Lakehouse → Semantic Model",
    ),
  );
  container_1.appendChild(metrics_panel());
  container_1.appendChild(pipeline_flow(0));
  container_1.appendChild(event_log(mock_events));
  setInterval(function () {
    squint_core.swap_BANG_(
      state_2,
      squint_core.update,
      "active-stage",
      function (_PERCENT_1) {
        return squint_core.mod(
          _PERCENT_1 + 1,
          squint_core.count(pipeline_stages),
        );
      },
    );
    const flow_3 = container_1.querySelector(".pipeline-flow");
    if (squint_core.truth_(flow_3)) {
      const parent_4 = flow_3.parentNode;
      return parent_4.replaceChild(
        pipeline_flow(
          squint_core.get(squint_core.deref(state_2), "active-stage"),
        ),
        flow_3,
      );
    }
  }, 2000);
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "fabric",
      "/articles/fabric-pipeline.html",
      "web/modules/portfolio/pro/fabric.js",
      fabric_content(),
    ),
  );
};

export { init };
