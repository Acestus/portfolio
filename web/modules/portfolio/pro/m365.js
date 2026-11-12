import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
import * as str from "../../../runtime/string.js";
import * as clojure_DOT_string from "../../../runtime/string.js";
var jml_workflows = [
  {
    id: "onboard",
    label: "Onboard",
    icon: "🟢",
    color: "#00a86b",
    steps: [
      "HR submits new hire in HRIS",
      "Lifecycle Workflow triggers (Entra ID Governance)",
      "Classify NEW_HIRE → Service Bus topic",
      "Entra Provisioning → SCIM/Guest/Cloud",
      "AD sync (~40 min) → Entra ID sync",
      "Assign security groups · M365 license",
      "Intune enrolls device · Conditional Access applies",
    ],
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: "🔄",
    color: "#0078d4",
    steps: [
      "HRIS fires CHANGE event",
      "Lifecycle Workflow classifies change type",
      "Service Bus → provisioning function",
      "Review current access (access reviews)",
      "Revoke old groups · assign new groups",
      "Update access packages · reassign Intune policy",
    ],
  },
  {
    id: "offboard",
    label: "Offboard",
    icon: "🔴",
    color: "#ff0040",
    steps: [
      "HRIS fires TERMINATION event",
      "Lifecycle Workflow triggers offboarding",
      "Disable Entra ID sign-in · revoke sessions",
      "Remove group memberships",
      "Reclaim licenses ($30/user/mo Copilot)",
      "Convert mailbox · archive OneDrive · wipe device",
    ],
  },
];
var entra_groups = [
  {
    name: "SG-Eng-Azure-Contributor",
    members: 42,
    type: "Security",
    roles: ["Azure VM Admin", "Fabric Reader", "Key Vault Secrets User"],
  },
  {
    name: "SG-HR-M365-Users",
    members: 18,
    type: "Security",
    roles: ["M365 HR Portal", "Copilot User"],
  },
  {
    name: "SG-Infra-PIM-Eligible",
    members: 8,
    type: "PIM-Eligible",
    roles: ["Global Reader", "Security Admin", "Intune Admin"],
  },
  {
    name: "SG-Finance-Reports",
    members: 15,
    type: "Security",
    roles: ["Power BI Pro", "Fabric Viewer", "Cost Management Reader"],
  },
  {
    name: "SG-All-Employees",
    members: 260,
    type: "Dynamic",
    roles: ["M365 User", "Copilot Chat", "Teams Standard"],
  },
];
var access_packages = [
  {
    title: "Engineer",
    icon: "⚙",
    packages: [
      "dev-basic",
      "storage-reader",
      "fabric-contributor",
      "github-member",
    ],
  },
  {
    title: "Manager",
    icon: "📊",
    packages: [
      "management-reports",
      "cost-reader",
      "power-bi-pro",
      "planner-admin",
    ],
  },
  {
    title: "HR",
    icon: "👥",
    packages: [
      "hr-onboard",
      "hr-reports",
      "people-admin",
      "lifecycle-workflows",
    ],
  },
  {
    title: "Security Admin",
    icon: "🛡",
    packages: [
      "sentinel-operator",
      "defender-admin",
      "pim-eligible",
      "conditional-access",
    ],
  },
];
var copilot_agents = [
  {
    name: "Confluence Cloud",
    desc: "Search and summarize Confluence pages from M365 Copilot chat",
    icon: "📚",
    url: "https://m365.cloud.microsoft/chat/?titleId=P_7c69ad60-9565-29c7-8bd9-d83f454ee238",
  },
  {
    name: "Project Planner",
    desc: "Interview-driven project scoping — 95% understanding before building",
    icon: "📋",
    url: "https://m365.cloud.microsoft/chat/?titleId=T_d9cda51e-3f77-e62c-7ee6-ad679bac42ce",
  },
  {
    name: "Teams Meetings",
    desc: "Recap transcripts, extract action items, search past meetings",
    icon: "🎤",
    url: "https://m365.cloud.microsoft/chat/?titleId=T_807e00ed-cace-ba5f-04e1-12afb68fba24",
  },
];
var intune_policies = [
  {
    name: "Windows Compliance",
    platform: "Windows",
    status: "Compliant",
    devices: 182,
    pct: 96,
  },
  {
    name: "macOS Encryption",
    platform: "macOS",
    status: "Compliant",
    devices: 34,
    pct: 100,
  },
  {
    name: "iOS MDM Profile",
    platform: "iOS",
    status: "Warning",
    devices: 78,
    pct: 89,
  },
  {
    name: "Conditional Access MFA",
    platform: "All",
    status: "Compliant",
    devices: 294,
    pct: 98,
  },
];
var state = squint_core.atom({ "active-workflow": 0, "active-step": 0 });
var metrics_panel = function () {
  const panel_1 = core.create_el("div", { class: "metrics-row" });
  for (let G__2 of squint_core.iterable([
    ["Entra Groups", `${squint_core.count(entra_groups) ?? ""}`, "#0078d4"],
    [
      "Access Packages",
      `${
        squint_core.reduce(
          squint_core._PLUS_,
          squint_core.map(function (_PERCENT_1) {
            return squint_core.count(squint_core.get(_PERCENT_1, "packages"));
          }, access_packages),
        ) ?? ""
      }`,
      "#00a86b",
    ],
    ["Copilot Agents", `${squint_core.count(copilot_agents) ?? ""}`, "#8b008b"],
    [
      "Intune Policies",
      `${squint_core.count(intune_policies) ?? ""}`,
      "#b8860b",
    ],
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
var workflow_steps = function (wf) {
  const flow_1 = core.create_el("div", {
    class: "pipeline-flow",
    style: "flex-wrap:wrap;justify-content:flex-start",
  });
  for (let G__2 of squint_core.iterable(
    squint_core.map_indexed(squint_core.vector, squint_core.get(wf, "steps")),
  )) {
    const vec___3_6 = G__2;
    const i_7 = squint_core.nth(vec___3_6, 0, null);
    const step_8 = squint_core.nth(vec___3_6, 1, null);
    if (i_7 > 0) {
      flow_1.appendChild(core.create_el("div", { class: "flow-arrow" }, "→"));
    }
    const card_9 = core.create_el(
      "div",
      {
        class: "stage-card",
        style: `${"border-left:4px solid "}${squint_core.get(wf, "color") ?? ""}`,
      },
      core.create_el(
        "div",
        { class: "stage-header" },
        core.create_el("span", { class: "stage-icon" }, `${i_7 + 1}`),
        core.create_el("span", { class: "stage-label" }, step_8),
      ),
    );
    card_9.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${squint_core.get(wf, "icon") ?? ""}${" "}${squint_core.get(wf, "label") ?? ""}${" step "}${i_7 + 1}${": "}${step_8 ?? ""}`,
      );
    });
    flow_1.appendChild(card_9);
  }
  return flow_1;
};
var workflow_section = function () {
  const section_1 = core.create_el("div", {});
  const step_container_2 = core.create_el("div", { class: "event-log" });
  section_1.appendChild(
    core.create_el("h3", { class: "log-title" }, "👤 JML Lifecycle Workflows"),
  );
  const bar_3 = core.create_el("div", { class: "filter-bar" });
  for (let G__4 of squint_core.iterable(
    squint_core.map_indexed(squint_core.vector, jml_workflows),
  )) {
    const vec___5_8 = G__4;
    const i_9 = squint_core.nth(vec___5_8, 0, null);
    const wf_10 = squint_core.nth(vec___5_8, 1, null);
    const btn_11 = core.create_el(
      "button",
      {
        class: `filter-btn${(squint_core._EQ_(i_9, squint_core.get(squint_core.deref(state), "active-workflow")) ? " active" : null) ?? ""}`,
      },
      `${squint_core.get(wf_10, "icon") ?? ""}${" "}${squint_core.get(wf_10, "label") ?? ""}`,
    );
    btn_11.addEventListener("click", function (_) {
      squint_core.swap_BANG_(
        state,
        squint_core.assoc,
        "active-workflow",
        i_9,
        "active-step",
        0,
      );
      step_container_2.innerHTML = "";
      step_container_2.appendChild(
        workflow_steps(squint_core.nth(jml_workflows, i_9)),
      );
      for (let G__12 of squint_core.iterable(
        Array.from(bar_3.querySelectorAll(".filter-btn")),
      )) {
        const b_13 = G__12;
        b_13.classList.remove("active");
      }
      return btn_11.classList.add("active");
    });
    bar_3.appendChild(btn_11);
  }
  section_1.appendChild(bar_3);
  step_container_2.appendChild(
    workflow_steps(squint_core.first(jml_workflows)),
  );
  section_1.appendChild(step_container_2);
  return section_1;
};
var groups_section = function () {
  const section_1 = core.create_el("div", {});
  section_1.appendChild(
    core.create_el("h3", { class: "log-title" }, "🔐 Entra ID Security Groups"),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable([
    "Group",
    "Type",
    "Members",
    "Roles",
  ])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(entra_groups)) {
    const g_9 = G__8;
    const row_10 = core.create_el("tr", {});
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "font-family:monospace;font-weight:600" },
        squint_core.get(g_9, "name"),
      ),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        {},
        (() => {
          const badge_11 = core.create_el(
            "span",
            {
              class: "effect-badge",
              style: `${"background:"}${
                (() => {
                  const G__43_12 = squint_core.get(g_9, "type");
                  switch (G__43_12) {
                    case "PIM-Eligible":
                      return "#ff0040";

                      break;
                    case "Dynamic":
                      return "#ffaa00";

                      break;
                    default:
                      return "#0078d4";
                  }
                })() ?? ""
              }`,
            },
            squint_core.get(g_9, "type"),
          );
          return badge_11;
        })(),
      ),
    );
    row_10.appendChild(
      core.create_el("td", {}, `${squint_core.get(g_9, "members") ?? ""}`),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "color:var(--clr-text-muted);font-size:0.85em" },
        str.join(", ", squint_core.get(g_9, "roles")),
      ),
    );
    row_10.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${"🔐 "}${squint_core.get(g_9, "name") ?? ""}${" — "}${squint_core.get(g_9, "members") ?? ""}${" members"}`,
      );
    });
    tbody_7.appendChild(row_10);
  }
  table_2.appendChild(tbody_7);
  section_1.appendChild(table_2);
  return section_1;
};
var access_section = function () {
  const section_1 = core.create_el("div", {});
  section_1.appendChild(
    core.create_el("h3", { class: "log-title" }, "📦 Access Packages by Role"),
  );
  const grid_2 = core.create_el("div", {
    class: "pipeline-flow",
    style: "flex-direction:column;align-items:stretch",
  });
  for (let G__3 of squint_core.iterable(access_packages)) {
    const ap_4 = G__3;
    const card_5 = core.create_el(
      "div",
      { class: "stage-card" },
      core.create_el(
        "div",
        { class: "stage-header" },
        core.create_el(
          "span",
          { class: "stage-icon" },
          squint_core.get(ap_4, "icon"),
        ),
        core.create_el(
          "span",
          { class: "stage-label" },
          squint_core.get(ap_4, "title"),
        ),
      ),
      core.create_el(
        "p",
        { class: "stage-desc" },
        str.join(" · ", squint_core.get(ap_4, "packages")),
      ),
    );
    card_5.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${squint_core.get(ap_4, "icon") ?? ""}${" "}${squint_core.get(ap_4, "title") ?? ""}${": "}${squint_core.count(squint_core.get(ap_4, "packages")) ?? ""}${" packages"}`,
      );
    });
    grid_2.appendChild(card_5);
  }
  section_1.appendChild(grid_2);
  return section_1;
};
var agents_section = function () {
  const section_1 = core.create_el("div", {});
  section_1.appendChild(
    core.create_el("h3", { class: "log-title" }, "🤖 M365 Copilot Agents"),
  );
  const grid_2 = core.create_el("div", {
    class: "pipeline-flow",
    style: "flex-direction:column;align-items:stretch",
  });
  for (let G__3 of squint_core.iterable(copilot_agents)) {
    const agent_4 = G__3;
    const card_5 = core.create_el(
      "a",
      {
        class: "stage-card",
        href: squint_core.get(agent_4, "url"),
        target: "_blank",
        rel: "noopener noreferrer",
        style: "text-decoration:none;color:inherit;cursor:pointer",
      },
      core.create_el(
        "div",
        { class: "stage-header" },
        core.create_el(
          "span",
          { class: "stage-icon" },
          squint_core.get(agent_4, "icon"),
        ),
        core.create_el(
          "span",
          { class: "stage-label" },
          squint_core.get(agent_4, "name"),
        ),
      ),
      core.create_el(
        "p",
        { class: "stage-desc" },
        squint_core.get(agent_4, "desc"),
      ),
    );
    grid_2.appendChild(card_5);
  }
  section_1.appendChild(grid_2);
  return section_1;
};
var intune_section = function () {
  const section_1 = core.create_el("div", {});
  section_1.appendChild(
    core.create_el("h3", { class: "log-title" }, "📱 Intune Device Compliance"),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable([
    "Policy",
    "Platform",
    "Devices",
    "Compliance",
  ])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(intune_policies)) {
    const p_9 = G__8;
    const row_10 = core.create_el("tr", {});
    const bar_container_11 = core.create_el("div", { class: "compliance-bar" });
    const bar_fill_12 = core.create_el("div", {
      class: "compliance-fill",
      style: `${"width:"}${squint_core.get(p_9, "pct") ?? ""}${"%;background:"}${(squint_core.get(p_9, "pct") >= 95 ? "#00a86b" : squint_core.get(p_9, "pct") >= 85 ? "#ffaa00" : "else" ? "#ff0040" : null) ?? ""}`,
    });
    bar_container_11.appendChild(bar_fill_12);
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "font-weight:600" },
        squint_core.get(p_9, "name"),
      ),
    );
    row_10.appendChild(
      core.create_el("td", {}, squint_core.get(p_9, "platform")),
    );
    row_10.appendChild(
      core.create_el("td", {}, `${squint_core.get(p_9, "devices") ?? ""}`),
    );
    const td_13 = core.create_el("td", {});
    td_13.appendChild(bar_container_11);
    td_13.appendChild(
      core.create_el(
        "span",
        { style: "margin-left:0.5em;font-size:0.85em" },
        `${squint_core.get(p_9, "pct") ?? ""}${"%"}`,
      ),
    );
    row_10.appendChild(td_13);
    row_10.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${"📱 "}${squint_core.get(p_9, "name") ?? ""}${" — "}${squint_core.get(p_9, "pct") ?? ""}${"% across "}${squint_core.get(p_9, "devices") ?? ""}${" devices"}`,
      );
    });
    tbody_7.appendChild(row_10);
  }
  table_2.appendChild(tbody_7);
  section_1.appendChild(table_2);
  return section_1;
};
var m365_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  container_1.appendChild(
    core.create_el("h1", { class: "dashboard-title" }, "M365 Administration"),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "Entra ID governance, Intune compliance, JML lifecycle workflows, and Copilot agents",
    ),
  );
  container_1.appendChild(metrics_panel());
  container_1.appendChild(workflow_section());
  container_1.appendChild(groups_section());
  container_1.appendChild(access_section());
  container_1.appendChild(intune_section());
  container_1.appendChild(agents_section());
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "m365",
      "/articles/m365-admin.html",
      "web/modules/portfolio/pro/m365.js",
      m365_content(),
    ),
  );
};

export { init };
