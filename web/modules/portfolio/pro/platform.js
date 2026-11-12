import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var workspaces = [
  {
    name: "ws_ad_dev",
    env: "dev",
    status: "Active",
    "git-sync": true,
    items: 12,
  },
  {
    name: "ws_ad_stg",
    env: "stg",
    status: "Active",
    "git-sync": true,
    items: 12,
  },
  {
    name: "ws_ad_prd",
    env: "prd",
    status: "Active",
    "git-sync": true,
    items: 12,
  },
  {
    name: "ws_edm_dev",
    env: "dev",
    status: "Active",
    "git-sync": true,
    items: 8,
  },
  {
    name: "ws_edm_prd",
    env: "prd",
    status: "Active",
    "git-sync": true,
    items: 8,
  },
  {
    name: "ws_logs_dev",
    env: "dev",
    status: "Active",
    "git-sync": true,
    items: 6,
  },
];
var copilot_agents = [
  {
    name: "Confluence Search",
    desc: "Search infrastructure knowledge base by topic, tag, or keyword",
    icon: "🔍",
  },
  {
    name: "Sprint Planner",
    desc: "Draft sprint plans from backlog items and team capacity",
    icon: "📋",
  },
  {
    name: "Meeting Recap",
    desc: "Summarize Teams meetings with action items and decisions",
    icon: "📝",
  },
];
var pim_roles = [
  {
    role: "Fabric Admin",
    scope: "ws_ad_prd",
    duration: "8 hours",
    justification: "Pipeline deploy",
  },
  {
    role: "Key Vault Officer",
    scope: "kv-coresec-prd",
    duration: "4 hours",
    justification: "Secret rotation",
  },
  {
    role: "Contributor",
    scope: "rg-coresec-prd",
    duration: "8 hours",
    justification: "Stack deployment",
  },
];
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
var workspace_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "🏗 Fabric Workspaces"),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable([
    "Workspace",
    "Env",
    "Status",
    "Git Sync",
    "Items",
  ])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(workspaces)) {
    const ws_9 = G__8;
    const row_10 = core.create_el("tr", {});
    for (let G__11 of squint_core.iterable([
      squint_core.get(ws_9, "name"),
      squint_core.get(ws_9, "env"),
      squint_core.get(ws_9, "status"),
      squint_core.truth_(squint_core.get(ws_9, "git-sync")) ? "✅" : "❌",
      `${squint_core.get(ws_9, "items") ?? ""}`,
    ])) {
      const v_12 = G__11;
      row_10.appendChild(core.create_el("td", {}, v_12));
    }
    tbody_7.appendChild(row_10);
  }
  table_2.appendChild(tbody_7);
  panel_1.appendChild(table_2);
  return panel_1;
};
var agents_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "🤖 M365 Copilot Agents"),
  );
  for (let G__2 of squint_core.iterable(copilot_agents)) {
    const agent_3 = G__2;
    const card_4 = core.create_el(
      "div",
      { class: "agent-card" },
      core.create_el(
        "span",
        { class: "agent-icon" },
        squint_core.get(agent_3, "icon"),
      ),
      core.create_el(
        "div",
        { class: "agent-info" },
        core.create_el(
          "div",
          { class: "agent-name" },
          squint_core.get(agent_3, "name"),
        ),
        core.create_el(
          "div",
          { class: "agent-desc" },
          squint_core.get(agent_3, "desc"),
        ),
      ),
    );
    card_4.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${squint_core.get(agent_3, "icon") ?? ""}${" "}${squint_core.get(agent_3, "name") ?? ""}${" — "}${squint_core.get(agent_3, "desc") ?? ""}`,
      );
    });
    panel_1.appendChild(card_4);
  }
  return panel_1;
};
var pim_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el(
      "h3",
      { class: "panel-title" },
      "🔐 PIM — Just-in-Time Access",
    ),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable([
    "Role",
    "Scope",
    "Duration",
    "Justification",
  ])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(pim_roles)) {
    const r_9 = G__8;
    const row_10 = core.create_el("tr", {});
    for (let G__11 of squint_core.iterable([
      squint_core.get(r_9, "role"),
      squint_core.get(r_9, "scope"),
      squint_core.get(r_9, "duration"),
      squint_core.get(r_9, "justification"),
    ])) {
      const v_12 = G__11;
      row_10.appendChild(core.create_el("td", {}, v_12));
    }
    row_10.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${"🔐 Activating "}${squint_core.get(r_9, "role") ?? ""}${" on "}${squint_core.get(r_9, "scope") ?? ""}${" for "}${squint_core.get(r_9, "duration") ?? ""}`,
      );
    });
    tbody_7.appendChild(row_10);
  }
  table_2.appendChild(tbody_7);
  panel_1.appendChild(table_2);
  return panel_1;
};
var platform_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  const tab_body_2 = core.create_el("div", { class: "tab-body" });
  const state_3 = squint_core.atom({ tab: "workspaces" });
  const render_tab_4 = function (tab) {
    tab_body_2.innerHTML = "";
    return tab_body_2.appendChild(
      (() => {
        const G__33_5 = tab;
        switch (G__33_5) {
          case "workspaces":
            return workspace_panel();

            break;
          case "agents":
            return agents_panel();

            break;
          case "pim":
            return pim_panel();

            break;
          default:
            throw new Error(`${"No matching clause: "}${G__33_5 ?? ""}`);
        }
      })(),
    );
  };
  container_1.appendChild(
    core.create_el(
      "h1",
      { class: "dashboard-title" },
      "Platform Engineering Console",
    ),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "Workspace provisioning, Copilot agents, and PIM role activation",
    ),
  );
  const metrics_7 = core.create_el("div", { class: "metrics-row" });
  for (let G__8 of squint_core.iterable([
    ["Workspaces", "6", "#0078d4"],
    ["Copilot Agents", "3", "#8b008b"],
    ["Onboarded Teams", "4", "#00a86b"],
    ["PIM Activations/wk", "12", "#b8860b"],
  ])) {
    const vec___9_12 = G__8;
    const label_13 = squint_core.nth(vec___9_12, 0, null);
    const value_14 = squint_core.nth(vec___9_12, 1, null);
    const color_15 = squint_core.nth(vec___9_12, 2, null);
    metrics_7.appendChild(
      core.create_el(
        "div",
        { class: "metric-card" },
        core.create_el(
          "div",
          { class: "metric-value", style: `${"color:"}${color_15 ?? ""}` },
          value_14,
        ),
        core.create_el("div", { class: "metric-label" }, label_13),
      ),
    );
  }
  container_1.appendChild(metrics_7);
  const tabs_16 = core.create_el("div", { class: "tab-bar" });
  for (let G__17 of squint_core.iterable([
    ["Workspaces", "workspaces"],
    ["Copilot Agents", "agents"],
    ["PIM Access", "pim"],
  ])) {
    const vec___18_21 = G__17;
    const label_22 = squint_core.nth(vec___18_21, 0, null);
    const key_23 = squint_core.nth(vec___18_21, 1, null);
    tabs_16.appendChild(
      tab_button(
        label_22,
        squint_core._EQ_(
          key_23,
          squint_core.get(squint_core.deref(state_3), "tab"),
        ),
        function (event) {
          squint_core.reset_BANG_(state_3, { tab: key_23 });
          render_tab_4(key_23);
          const btns_24 = tabs_16.querySelectorAll(".tab-btn");
          for (let G__25 of squint_core.iterable(Array.from(btns_24))) {
            const b_26 = G__25;
            b_26.classList.remove("active");
          }
          return event.currentTarget.classList.add("active");
        },
      ),
    );
  }
  container_1.appendChild(tabs_16);
  container_1.appendChild(tab_body_2);
  render_tab_4("workspaces");
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "platform",
      "/articles/platform-console.html",
      "web/modules/portfolio/pro/platform.js",
      platform_content(),
    ),
  );
};

export { init };
