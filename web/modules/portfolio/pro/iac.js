import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var pipeline_steps = [
  {
    id: "push",
    label: "git push main",
    icon: "📤",
    color: "#ADD8E6",
    detail: "Trunk-based delivery — no feature branches",
  },
  {
    id: "oidc",
    label: "OIDC Federation",
    icon: "🔑",
    color: "#E0FFFF",
    detail: "Workload identity — no stored secrets",
  },
  {
    id: "whatif",
    label: "Bicep what-if",
    icon: "🔍",
    color: "#FFF8DC",
    detail: "Preview changes before deployment",
  },
  {
    id: "avm",
    label: "AVM Modules",
    icon: "📦",
    color: "#90EE90",
    detail: "Azure Verified Modules from public registry",
  },
  {
    id: "stack",
    label: "Deployment Stack",
    icon: "🏗",
    color: "#FFB6C1",
    detail: "Lifecycle-managed resource groups",
  },
  {
    id: "azure",
    label: "Azure Resources",
    icon: "☁",
    color: "#ADD8E6",
    detail: "Idempotent, drift-free infrastructure",
  },
];
var what_if_output = [
  {
    resource: "func-coresec-dev-usw2-001",
    type: "Microsoft.Web/sites",
    change: "modify",
    detail: "Update appSettings",
  },
  {
    resource: "st-coresec-dev-usw2-001",
    type: "Microsoft.Storage/storageAccounts",
    change: "no-change",
    detail: "",
  },
  {
    resource: "kv-coresec-dev-usw2-001",
    type: "Microsoft.KeyVault/vaults",
    change: "no-change",
    detail: "",
  },
  {
    resource: "umi-coresec-dev-usw2-ctl",
    type: "Microsoft.ManagedIdentity/userAssignedIdentities",
    change: "no-change",
    detail: "",
  },
  {
    resource: "evh-coresec-dev-usw2-001",
    type: "Microsoft.EventHub/namespaces",
    change: "create",
    detail: "New Event Hub namespace",
  },
];
var change_colors = {
  create: "#00a86b",
  modify: "#ffaa00",
  delete: "#ff0040",
  "no-change": "#888888",
};
var step_card = function (p__31, active) {
  const map___1_3 = p__31;
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const label_5 = squint_core.get(map___1_4, "label");
  const icon_6 = squint_core.get(map___1_4, "icon");
  const color_7 = squint_core.get(map___1_4, "color");
  const detail_8 = squint_core.get(map___1_4, "detail");
  const el_9 = core.create_el(
    "div",
    {
      class: `stage-card${(squint_core.truth_(active) ? " active" : null) ?? ""}`,
      style: `${"border-left: 4px solid "}${color_7 ?? ""}`,
    },
    core.create_el(
      "div",
      { class: "stage-header" },
      core.create_el("span", { class: "stage-icon" }, icon_6),
      core.create_el("span", { class: "stage-label" }, label_5),
    ),
    core.create_el("p", { class: "stage-desc" }, detail_8),
  );
  el_9.addEventListener("click", function (_) {
    el_9.classList.toggle("expanded");
    return core.toast_BANG_(
      `${icon_6 ?? ""}${" "}${label_5 ?? ""}${" — "}${detail_8 ?? ""}`,
    );
  });
  return el_9;
};
var what_if_panel = function () {
  const panel_1 = core.create_el("div", { class: "whatif-panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "whatif-title" }, "🔍 What-If Preview"),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable([
    "Resource",
    "Type",
    "Change",
    "Detail",
  ])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(what_if_output)) {
    const r_9 = G__8;
    const row_10 = core.create_el("tr", {});
    const change_badge_11 = core.create_el(
      "span",
      {
        class: "effect-badge",
        style: `${"background:"}${squint_core.get(change_colors, squint_core.get(r_9, "change")) ?? ""}`,
      },
      squint_core.name(squint_core.get(r_9, "change")),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        { class: "resource-name" },
        squint_core.get(r_9, "resource"),
      ),
    );
    row_10.appendChild(core.create_el("td", {}, squint_core.get(r_9, "type")));
    const td_12 = core.create_el("td", {});
    td_12.appendChild(change_badge_11);
    row_10.appendChild(td_12);
    row_10.appendChild(
      core.create_el("td", {}, squint_core.get(r_9, "detail")),
    );
    row_10.addEventListener("click", function (_) {
      for (let G__13 of squint_core.iterable(
        Array.from(tbody_7.querySelectorAll(".row-selected")),
      )) {
        const el_14 = G__13;
        el_14.classList.remove("row-selected");
      }
      row_10.classList.add("row-selected");
      return core.toast_BANG_(
        `${
          (() => {
            const G__32_15 = squint_core.get(r_9, "change");
            switch (G__32_15) {
              case "create":
                return "🟢";

                break;
              case "modify":
                return "🟡";

                break;
              case "delete":
                return "🔴";

                break;
              default:
                return "⚪";
            }
          })() ?? ""
        }${" "}${squint_core.get(r_9, "resource") ?? ""}${" → "}${squint_core.name(squint_core.get(r_9, "change"))}${(squint_core.truth_(squint_core.seq(squint_core.get(r_9, "detail"))) ? `${" — "}${squint_core.get(r_9, "detail") ?? ""}` : null) ?? ""}`,
      );
    });
    tbody_7.appendChild(row_10);
  }
  table_2.appendChild(tbody_7);
  panel_1.appendChild(table_2);
  return panel_1;
};
var naming_panel = function () {
  const panel_1 = core.create_el("div", { class: "naming-panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "naming-title" }, "📐 CAF Naming Convention"),
  );
  panel_1.appendChild(
    core.create_el(
      "pre",
      { class: "kql-code" },
      `${"{type}-{project}-{env}-{region}-{instance}\n"}${"│       │        │      │        │\n"}${"│       │        │      │        └─ 001, 002, ctl, dat\n"}${"│       │        │      └─ usw2 (West US 2)\n"}${"│       │        └─ dev, stg, prd\n"}${"│       └─ coresec, coredata, coremgmt\n"}${"└─ func, st, kv, umi, evh, rg"}`,
    ),
  );
  return panel_1;
};
var farley_principles = [
  {
    icon: "🔄",
    title: "Work in Small Batches",
    desc: "Small incremental changes reduce risk and increase feedback frequency. Every commit is a potential release.",
  },
  {
    icon: "⚡",
    title: "Automate Everything",
    desc: "Manual steps introduce errors and slow delivery. Build, test, deploy — all automated, all the time.",
  },
  {
    icon: "🎯",
    title: "Build Quality In",
    desc: "Quality isn't tested at the end — it's designed in from the start. Shift left on testing, peer review every change.",
  },
  {
    icon: "📡",
    title: "Fast Feedback Loops",
    desc: "Know within minutes if something is wrong. Short feedback loops enable quick responses to problems.",
  },
  {
    icon: "🚀",
    title: "Always Deployable",
    desc: "The main branch is always in a deployable state. Done means deployed, not just coded.",
  },
  {
    icon: "🗄",
    title: "Version Everything",
    desc: "Code, infrastructure, config, docs — everything required to build and deploy lives in version control.",
  },
  {
    icon: "🔬",
    title: "Relentless Improvement",
    desc: "Continuous Delivery is about improving processes step by step. There is always something to optimize.",
  },
  {
    icon: "🤝",
    title: "Collaborative Culture",
    desc: "Break down silos between dev, ops, testers, and business. Cross-functional teams deliver value together.",
  },
];
var cicd_philosophy_panel = function () {
  const panel_1 = core.create_el("div", { class: "whatif-panel" });
  const quote_el_2 = core.create_el(
    "blockquote",
    {
      style:
        "border-left:3px solid #0078d4;padding-left:0.75rem;color:#605e5c;font-style:italic;margin-block:0.5rem 1rem;font-size:var(--step--1)",
    },
    '"The ability to get changes into production safely and quickly in a sustainable way." — Dave Farley',
  );
  panel_1.appendChild(
    core.create_el(
      "h3",
      { class: "whatif-title" },
      "📖 CI/CD Philosophy — Dave Farley",
    ),
  );
  panel_1.appendChild(quote_el_2);
  const grid_3 = core.create_el("div", {
    style:
      "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:var(--space-s)",
  });
  for (let G__4 of squint_core.iterable(farley_principles)) {
    const map___5_7 = G__4;
    const map___5_8 = squint_core.truth_(
      squint_core.sequential_QMARK_(map___5_7),
    )
      ? squint_core.truth_(squint_core.vector_QMARK_(map___5_7))
        ? map___5_7
        : squint_core.seq_to_map_for_destructuring(map___5_7)
      : map___5_7;
    const icon_9 = squint_core.get(map___5_8, "icon");
    const title_10 = squint_core.get(map___5_8, "title");
    const desc_11 = squint_core.get(map___5_8, "desc");
    const card_12 = core.create_el(
      "div",
      { class: "agent-card" },
      core.create_el("span", { class: "agent-icon" }, icon_9),
      core.create_el(
        "div",
        {},
        core.create_el("div", { class: "agent-name" }, title_10),
        core.create_el("div", { class: "agent-desc" }, desc_11),
      ),
    );
    card_12.addEventListener("click", function (_) {
      return core.toast_BANG_(`${icon_9 ?? ""}${" "}${title_10 ?? ""}`);
    });
    grid_3.appendChild(card_12);
  }
  panel_1.appendChild(grid_3);
  return panel_1;
};
var iac_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  const state_2 = squint_core.atom({ "active-step": 0 });
  container_1.appendChild(
    core.create_el(
      "h1",
      { class: "dashboard-title" },
      "IaC Deployment Pipeline",
    ),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "GitHub Actions → OIDC → Bicep AVM → Deployment Stacks — trunk-based, zero secrets",
    ),
  );
  const metrics_3 = core.create_el("div", { class: "metrics-row" });
  for (let G__4 of squint_core.iterable([
    ["Bicep Stacks", "8", "#0078d4"],
    ["AVM Modules", "12", "#00a86b"],
    ["Drift Detected", "0", "#00a86b"],
    ["Deploy Cadence", "Daily", "#b8860b"],
  ])) {
    const vec___5_8 = G__4;
    const label_9 = squint_core.nth(vec___5_8, 0, null);
    const value_10 = squint_core.nth(vec___5_8, 1, null);
    const color_11 = squint_core.nth(vec___5_8, 2, null);
    metrics_3.appendChild(
      core.create_el(
        "div",
        { class: "metric-card" },
        core.create_el(
          "div",
          { class: "metric-value", style: `${"color:"}${color_11 ?? ""}` },
          value_10,
        ),
        core.create_el("div", { class: "metric-label" }, label_9),
      ),
    );
  }
  container_1.appendChild(metrics_3);
  const flow_12 = core.create_el("div", { class: "pipeline-flow" });
  for (let G__13 of squint_core.iterable(
    squint_core.map_indexed(squint_core.vector, pipeline_steps),
  )) {
    const vec___14_17 = G__13;
    const i_18 = squint_core.nth(vec___14_17, 0, null);
    const step_19 = squint_core.nth(vec___14_17, 1, null);
    if (i_18 > 0) {
      flow_12.appendChild(core.create_el("div", { class: "flow-arrow" }, "→"));
    }
    flow_12.appendChild(step_card(step_19, i_18 === 0));
  }
  container_1.appendChild(flow_12);
  setInterval(function () {
    squint_core.swap_BANG_(
      state_2,
      squint_core.update,
      "active-step",
      function (_PERCENT_1) {
        return squint_core.mod(
          _PERCENT_1 + 1,
          squint_core.count(pipeline_steps),
        );
      },
    );
    const flow_20 = container_1.querySelector(".pipeline-flow");
    if (squint_core.truth_(flow_20)) {
      const new_flow_21 = core.create_el("div", { class: "pipeline-flow" });
      for (let G__22 of squint_core.iterable(
        squint_core.map_indexed(squint_core.vector, pipeline_steps),
      )) {
        const vec___23_26 = G__22;
        const i_27 = squint_core.nth(vec___23_26, 0, null);
        const step_28 = squint_core.nth(vec___23_26, 1, null);
        if (i_27 > 0) {
          new_flow_21.appendChild(
            core.create_el("div", { class: "flow-arrow" }, "→"),
          );
        }
        new_flow_21.appendChild(
          step_card(
            step_28,
            squint_core._EQ_(
              i_27,
              squint_core.get(squint_core.deref(state_2), "active-step"),
            ),
          ),
        );
      }
      return flow_20.parentNode.replaceChild(new_flow_21, flow_20);
    }
  }, 2000);
  container_1.appendChild(what_if_panel());
  container_1.appendChild(naming_panel());
  container_1.appendChild(cicd_philosophy_panel());
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "iac",
      "/articles/iac-pipeline.html",
      "web/modules/portfolio/pro/iac.js",
      iac_content(),
    ),
  );
};

export { init };
