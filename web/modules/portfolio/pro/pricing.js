import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var services = [
  {
    name: "Compute",
    icon: "⚙",
    skus: [
      { id: "B2s", spec: "2 vCPU · 4 GB", cost: 30, ri: 0.65, sp: 0.72 },
      { id: "D4s_v5", spec: "4 vCPU · 16 GB", cost: 140, ri: 0.62, sp: 0.7 },
      { id: "D8s_v5", spec: "8 vCPU · 32 GB", cost: 280, ri: 0.62, sp: 0.7 },
      {
        id: "E16s_v5",
        spec: "16 vCPU · 128 GB",
        cost: 580,
        ri: 0.58,
        sp: 0.66,
      },
    ],
  },
  {
    name: "Storage",
    icon: "💾",
    skus: [
      { id: "LRS-Hot", spec: "Block blob · Hot", cost: 18, ri: 1, sp: 1 },
      { id: "ZRS-Hot", spec: "Zone-redundant · Hot", cost: 36, ri: 1, sp: 1 },
      { id: "LRS-Cool", spec: "Cool tier", cost: 10, ri: 1, sp: 1 },
      {
        id: "GRS-Archive",
        spec: "Geo-redundant Archive",
        cost: 3,
        ri: 1,
        sp: 1,
      },
    ],
  },
  {
    name: "Database",
    icon: "🗄",
    skus: [
      { id: "Basic-5DTU", spec: "5 DTU · 2 GB", cost: 5, ri: 0.75, sp: 0.8 },
      { id: "S1-20DTU", spec: "20 DTU · 250 GB", cost: 30, ri: 0.7, sp: 0.78 },
      {
        id: "P1-125DTU",
        spec: "125 DTU · 500 GB",
        cost: 465,
        ri: 0.55,
        sp: 0.63,
      },
      {
        id: "Serverless-GP",
        spec: "GP-Flex auto-pause",
        cost: 55,
        ri: 1,
        sp: 1,
      },
    ],
  },
  {
    name: "Network",
    icon: "🌐",
    skus: [
      { id: "Basic-LB", spec: "Basic Load Balancer", cost: 0, ri: 1, sp: 1 },
      {
        id: "Standard-LB",
        spec: "Standard LB · zonal",
        cost: 22,
        ri: 1,
        sp: 1,
      },
      { id: "App-GW-v2", spec: "WAF v2 · 2 capacity", cost: 175, ri: 1, sp: 1 },
      { id: "Front-Door", spec: "Standard tier", cost: 330, ri: 1, sp: 1 },
    ],
  },
  {
    name: "Fabric",
    icon: "🧵",
    skus: [
      { id: "F2", spec: "2 CU · ~$262/mo", cost: 262, ri: 0.59, sp: 0.69 },
      { id: "F8", spec: "8 CU · ~$1,051/mo", cost: 1051, ri: 0.59, sp: 0.69 },
      { id: "F32", spec: "32 CU · ~$4,203/mo", cost: 4203, ri: 0.59, sp: 0.69 },
      { id: "F64", spec: "64 CU · ~$8,406/mo", cost: 8406, ri: 0.59, sp: 0.69 },
    ],
  },
  {
    name: "AI Foundry",
    icon: "🤖",
    skus: [
      {
        id: "gpt-4o-mini",
        spec: "$0.15 in / $0.60 out per 1M tok",
        cost: 45,
        ri: 1,
        sp: 1,
      },
      {
        id: "gpt-4o",
        spec: "$2.50 in / $10.00 out per 1M tok",
        cost: 320,
        ri: 1,
        sp: 1,
      },
      {
        id: "o1",
        spec: "$15 in / $60 out per 1M tok",
        cost: 1850,
        ri: 1,
        sp: 1,
      },
      {
        id: "embed-3-lg",
        spec: "$0.13 per 1M tok · 3072 dim",
        cost: 22,
        ri: 1,
        sp: 1,
      },
    ],
  },
];
var commitments = [
  {
    id: "payg",
    label: "Pay-As-You-Go",
    icon: "💳",
    desc: "On-demand list price — no commitment",
  },
  {
    id: "ri1",
    label: "RI 1-Year",
    icon: "📅",
    desc: "1-year reservation — ~30–45% off compute",
  },
  {
    id: "ri3",
    label: "RI 3-Year",
    icon: "📆",
    desc: "3-year reservation — up to 72% off",
  },
  {
    id: "sp",
    label: "Savings Plan",
    icon: "💹",
    desc: "Flexible 1-yr commit on $/hr spend",
  },
];
var required_tags = [
  {
    key: "CostCenter",
    purpose: "Cost allocation & chargeback",
    default: "Inherited from subscription",
  },
  {
    key: "Environment",
    purpose: "dev / tst / stg / prd",
    default: "Subscription naming",
  },
  {
    key: "Owner",
    purpose: "Team or individual",
    default: "Creator (event-driven)",
  },
  { key: "Project", purpose: "Workload or initiative", default: "—" },
  {
    key: "BuildEvent",
    purpose: "MS Build 2026 tag for tracking",
    default: "false",
  },
];
var naming_examples = [
  {
    type: "Function App",
    pattern: "func-{project}-{env}-{region}-{instance}",
    example: "func-copilot-prd-usw2-001",
  },
  {
    type: "Storage",
    pattern: "st{project}{env}{region}{instance}",
    example: "stcopilotprdusw2001",
  },
  {
    type: "Key Vault",
    pattern: "kv-{project}-{env}-{region}-{instance}",
    example: "kv-copilot-prd-usw2-001",
  },
  {
    type: "Fabric Cap",
    pattern: "cap-{domain}-{env}-{region}-{instance}",
    example: "cap-edm-prd-usw2-001",
  },
  {
    type: "AI Foundry",
    pattern: "oai-{project}-{env}-{region}-{instance}",
    example: "oai-copilot-prd-usw2-001",
  },
  {
    type: "App Service",
    pattern: "app-{project}-{env}-{region}-{instance}",
    example: "app-portfolio-prd-usw2-001",
  },
];
var jml_scenarios = [
  {
    id: "hire",
    label: "New Hire",
    icon: "🟢",
    multiplier: 1.15,
    desc: "+15% — onboarding licenses, provisioning",
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: "🔄",
    multiplier: 1.05,
    desc: "+5% — role change, access reconfig",
  },
  {
    id: "steady",
    label: "Steady State",
    icon: "⚡",
    multiplier: 1,
    desc: "Baseline — no JML event",
  },
  {
    id: "leave",
    label: "Offboard",
    icon: "🔴",
    multiplier: 0.6,
    desc: "−40% — license reclaim, deprovision",
  },
];
var state = squint_core.atom({
  selections: squint_core.into(
    {},
    squint_core.map(function (svc) {
      return [
        squint_core.get(svc, "name"),
        squint_core.first(squint_core.get(svc, "skus")),
      ];
    }, services),
  ),
  scenario: "steady",
  commitment: "payg",
  "tag-values": {
    CostCenter: "",
    Environment: "dev",
    Owner: "",
    Project: "",
    BuildEvent: "true",
  },
});
var discount_factor = function (sku, commitment) {
  const G__42_1 = commitment;
  switch (G__42_1) {
    case "ri1":
      return squint_core.get(sku, "ri", 1);

      break;
    case "ri3":
      return squint_core.max(0.28, squint_core.get(sku, "ri", 1) - 0.2);

      break;
    case "sp":
      return squint_core.get(sku, "sp", 1);

      break;
    default:
      return 1;
  }
};
var compute_total = function () {
  const map___1_3 = squint_core.deref(state);
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const selections_5 = squint_core.get(map___1_4, "selections");
  const scenario_6 = squint_core.get(map___1_4, "scenario");
  const commitment_7 = squint_core.get(map___1_4, "commitment");
  const base_8 = squint_core.reduce(
    squint_core._PLUS_,
    squint_core.map("cost", squint_core.vals(selections_5)),
  );
  const committed_9 = squint_core.reduce(
    squint_core._PLUS_,
    squint_core.map(function (_PERCENT_1) {
      return (
        squint_core.get(_PERCENT_1, "cost") *
        discount_factor(_PERCENT_1, commitment_7)
      );
    }, squint_core.vals(selections_5)),
  );
  const mult_10 = squint_core.get(
    squint_core.first(
      squint_core.filter(function (_PERCENT_1) {
        return squint_core._EQ_(squint_core.get(_PERCENT_1, "id"), scenario_6);
      }, jml_scenarios),
    ),
    "multiplier",
  );
  const savings_11 = base_8 - committed_9;
  return {
    base: base_8,
    committed: committed_9,
    adjusted: committed_9 * mult_10,
    multiplier: mult_10,
    savings: savings_11,
  };
};
var fmt_money = function (n) {
  return `${"$"}${Math.round(n).toLocaleString() ?? ""}`;
};
var metrics_panel = function () {
  const map___1_3 = compute_total();
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const base_5 = squint_core.get(map___1_4, "base");
  const committed_6 = squint_core.get(map___1_4, "committed");
  const adjusted_7 = squint_core.get(map___1_4, "adjusted");
  const multiplier_8 = squint_core.get(map___1_4, "multiplier");
  const savings_9 = squint_core.get(map___1_4, "savings");
  const panel_10 = core.create_el("div", { class: "metrics-row" });
  for (let G__11 of squint_core.iterable([
    ["List Price", fmt_money(base_5), "#0078d4"],
    ["After Commit", fmt_money(committed_6), "#00a86b"],
    ["Monthly Savings", fmt_money(savings_9), "#7e57c2"],
    ["JML Adjusted", fmt_money(adjusted_7), "#b8860b"],
    ["JML Multiplier", `${multiplier_8 ?? ""}${"×"}`, "#d83b01"],
  ])) {
    const vec___12_15 = G__11;
    const label_16 = squint_core.nth(vec___12_15, 0, null);
    const value_17 = squint_core.nth(vec___12_15, 1, null);
    const color_18 = squint_core.nth(vec___12_15, 2, null);
    panel_10.appendChild(
      core.create_el(
        "div",
        { class: "metric-card" },
        core.create_el(
          "div",
          { class: "metric-value", style: `${"color:"}${color_18 ?? ""}` },
          value_17,
        ),
        core.create_el("div", { class: "metric-label" }, label_16),
      ),
    );
  }
  return panel_10;
};
var sku_selector = function (svc, on_change) {
  const card_1 = core.create_el(
    "div",
    { class: "stage-card" },
    core.create_el(
      "div",
      { class: "stage-header" },
      core.create_el(
        "span",
        { class: "stage-icon" },
        squint_core.get(svc, "icon"),
      ),
      core.create_el(
        "span",
        { class: "stage-label" },
        squint_core.get(svc, "name"),
      ),
    ),
  );
  const grid_2 = core.create_el("div", { class: "sku-grid" });
  for (let G__3 of squint_core.iterable(squint_core.get(svc, "skus"))) {
    const sku_4 = G__3;
    const selected_QMARK__5 = squint_core._EQ_(
      sku_4,
      squint_core.get(
        squint_core.get(squint_core.deref(state), "selections"),
        squint_core.get(svc, "name"),
      ),
    );
    const btn_6 = core.create_el(
      "button",
      {
        class: `filter-btn${(selected_QMARK__5 ? " active" : null) ?? ""}`,
        title: squint_core.get(sku_4, "spec"),
      },
      `${squint_core.get(sku_4, "id") ?? ""}${" — $"}${squint_core.get(sku_4, "cost").toLocaleString() ?? ""}${"/mo"}`,
    );
    btn_6.addEventListener("click", function (_) {
      squint_core.swap_BANG_(
        state,
        squint_core.assoc_in,
        ["selections", squint_core.get(svc, "name")],
        sku_4,
      );
      for (let G__7 of squint_core.iterable(
        Array.from(grid_2.querySelectorAll(".filter-btn")),
      )) {
        const b_8 = G__7;
        b_8.classList.remove("active");
      }
      btn_6.classList.add("active");
      on_change();
      return core.toast_BANG_(
        `${squint_core.get(svc, "icon") ?? ""}${" "}${squint_core.get(svc, "name") ?? ""}${" → "}${squint_core.get(sku_4, "id") ?? ""}${" · "}${squint_core.get(sku_4, "spec") ?? ""}`,
      );
    });
    grid_2.appendChild(btn_6);
  }
  card_1.appendChild(grid_2);
  return card_1;
};
var sku_section = function (on_change) {
  const section_1 = core.create_el("div", {});
  section_1.appendChild(
    core.create_el("h3", { class: "log-title" }, "💰 SKU Selection"),
  );
  const grid_2 = core.create_el("div", {
    class: "pipeline-flow",
    style: "flex-direction:column;align-items:stretch",
  });
  for (let G__3 of squint_core.iterable(services)) {
    const svc_4 = G__3;
    grid_2.appendChild(sku_selector(svc_4, on_change));
  }
  section_1.appendChild(grid_2);
  return section_1;
};
var commitment_section = function (on_change) {
  const section_1 = core.create_el("div", {});
  section_1.appendChild(
    core.create_el("h3", { class: "log-title" }, "💳 Commitment Term"),
  );
  section_1.appendChild(
    core.create_el(
      "p",
      { class: "panel-sub" },
      "Reserved Instances and Savings Plans apply automatically to eligible SKUs (Compute, Database, Fabric).",
    ),
  );
  const bar_2 = core.create_el("div", { class: "filter-bar" });
  for (let G__3 of squint_core.iterable(commitments)) {
    const c_4 = G__3;
    const btn_5 = core.create_el(
      "button",
      {
        class: `filter-btn${(squint_core._EQ_(squint_core.get(c_4, "id"), squint_core.get(squint_core.deref(state), "commitment")) ? " active" : null) ?? ""}`,
        title: squint_core.get(c_4, "desc"),
      },
      `${squint_core.get(c_4, "icon") ?? ""}${" "}${squint_core.get(c_4, "label") ?? ""}`,
    );
    btn_5.addEventListener("click", function (_) {
      squint_core.swap_BANG_(
        state,
        squint_core.assoc,
        "commitment",
        squint_core.get(c_4, "id"),
      );
      for (let G__6 of squint_core.iterable(
        Array.from(bar_2.querySelectorAll(".filter-btn")),
      )) {
        const b_7 = G__6;
        b_7.classList.remove("active");
      }
      btn_5.classList.add("active");
      on_change();
      return core.toast_BANG_(
        `${squint_core.get(c_4, "icon") ?? ""}${" "}${squint_core.get(c_4, "label") ?? ""}${" — "}${squint_core.get(c_4, "desc") ?? ""}`,
      );
    });
    bar_2.appendChild(btn_5);
  }
  section_1.appendChild(bar_2);
  return section_1;
};
var jml_section = function (on_change) {
  const section_1 = core.create_el("div", {});
  section_1.appendChild(
    core.create_el("h3", { class: "log-title" }, "👤 JML Cost Impact"),
  );
  const bar_2 = core.create_el("div", { class: "filter-bar" });
  for (let G__3 of squint_core.iterable(jml_scenarios)) {
    const sc_4 = G__3;
    const btn_5 = core.create_el(
      "button",
      {
        class: `filter-btn${(squint_core._EQ_(squint_core.get(sc_4, "id"), squint_core.get(squint_core.deref(state), "scenario")) ? " active" : null) ?? ""}`,
      },
      `${squint_core.get(sc_4, "icon") ?? ""}${" "}${squint_core.get(sc_4, "label") ?? ""}`,
    );
    btn_5.addEventListener("click", function (_) {
      squint_core.swap_BANG_(
        state,
        squint_core.assoc,
        "scenario",
        squint_core.get(sc_4, "id"),
      );
      for (let G__6 of squint_core.iterable(
        Array.from(bar_2.querySelectorAll(".filter-btn")),
      )) {
        const b_7 = G__6;
        b_7.classList.remove("active");
      }
      btn_5.classList.add("active");
      on_change();
      return core.toast_BANG_(
        `${squint_core.get(sc_4, "icon") ?? ""}${" "}${squint_core.get(sc_4, "label") ?? ""}${" — "}${squint_core.get(sc_4, "desc") ?? ""}`,
      );
    });
    bar_2.appendChild(btn_5);
  }
  section_1.appendChild(bar_2);
  return section_1;
};
var tag_table = function () {
  const section_1 = core.create_el("div", {});
  section_1.appendChild(
    core.create_el(
      "h3",
      { class: "log-title" },
      "🏷 Required Tags (Modify Policy)",
    ),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable(["Tag", "Purpose", "Default Value"])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(required_tags)) {
    const tag_9 = G__8;
    const row_10 = core.create_el("tr", {});
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "font-family:monospace;font-weight:600" },
        squint_core.get(tag_9, "key"),
      ),
    );
    row_10.appendChild(
      core.create_el("td", {}, squint_core.get(tag_9, "purpose")),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "color:var(--clr-text-muted)" },
        squint_core.get(tag_9, "default"),
      ),
    );
    row_10.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${"🏷 "}${squint_core.get(tag_9, "key") ?? ""}${" — "}${squint_core.get(tag_9, "purpose") ?? ""}`,
      );
    });
    tbody_7.appendChild(row_10);
  }
  table_2.appendChild(tbody_7);
  section_1.appendChild(table_2);
  return section_1;
};
var naming_table = function () {
  const section_1 = core.create_el("div", {});
  section_1.appendChild(
    core.create_el("h3", { class: "log-title" }, "📐 CAF Naming Convention"),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable([
    "Resource Type",
    "Pattern",
    "Example",
  ])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(naming_examples)) {
    const n_9 = G__8;
    const row_10 = core.create_el("tr", {});
    row_10.appendChild(core.create_el("td", {}, squint_core.get(n_9, "type")));
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "font-family:monospace" },
        squint_core.get(n_9, "pattern"),
      ),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "font-family:monospace;color:var(--clr-accent)" },
        squint_core.get(n_9, "example"),
      ),
    );
    row_10.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${"📐 "}${squint_core.get(n_9, "type") ?? ""}${" → "}${squint_core.get(n_9, "example") ?? ""}`,
      );
    });
    tbody_7.appendChild(row_10);
  }
  table_2.appendChild(tbody_7);
  section_1.appendChild(table_2);
  return section_1;
};
var pricing_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  const metrics_slot_2 = squint_core.atom(null);
  const refresh_BANG__3 = function () {
    const temp__23233__auto___4 = squint_core.deref(metrics_slot_2);
    if (squint_core.truth_(temp__23233__auto___4)) {
      const old_5 = temp__23233__auto___4;
      const parent_6 = old_5.parentNode;
      const fresh_7 = metrics_panel();
      parent_6.replaceChild(fresh_7, old_5);
      return squint_core.reset_BANG_(metrics_slot_2, fresh_7);
    }
  };
  container_1.appendChild(
    core.create_el(
      "h1",
      { class: "dashboard-title" },
      "Pricing & Cost Optimizer",
    ),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "Azure · Fabric · AI Foundry — SKU selection, commitment terms, CAF governance, JML lifecycle",
    ),
  );
  const m_8 = metrics_panel();
  squint_core.reset_BANG_(metrics_slot_2, m_8);
  container_1.appendChild(m_8);
  container_1.appendChild(sku_section(refresh_BANG__3));
  container_1.appendChild(commitment_section(refresh_BANG__3));
  container_1.appendChild(jml_section(refresh_BANG__3));
  container_1.appendChild(tag_table());
  container_1.appendChild(naming_table());
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "pricing",
      "/articles/pricing-optimizer.html",
      "web/modules/portfolio/pro/pricing.js",
      pricing_content(),
    ),
  );
};

export { init };
