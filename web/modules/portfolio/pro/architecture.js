import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var c4_context = {
  name: "Acestus Platform",
  desc: "Cloud-native analytics & governance platform on Azure",
  actors: [
    {
      id: "user",
      label: "Platform Engineer",
      desc: "Deploys IaC, manages workspaces, activates PIM roles",
    },
    {
      id: "analyst",
      label: "Data Analyst",
      desc: "Queries Gold-layer lakehouses, builds Power BI reports",
    },
    {
      id: "security",
      label: "Security Admin",
      desc: "Reviews Azure Policy compliance, manages Entra ID",
    },
  ],
  systems: [
    {
      id: "fabric",
      label: "Microsoft Fabric",
      desc: "Medallion pipeline — Bronze → Silver → Gold",
      color: "#6a0dad",
    },
    {
      id: "azure",
      label: "Azure Platform",
      desc: "IaC via Bicep AVM, Deployment Stacks, Policy",
      color: "#0078d4",
    },
    {
      id: "m365",
      label: "M365 / Copilot",
      desc: "Copilot agents, Teams, SharePoint governance",
      color: "#d83b01",
    },
    {
      id: "monitoring",
      label: "Observability",
      desc: "Event Hub → Eventhouse real-time log pipeline",
      color: "#00a86b",
    },
  ],
};
var c4_containers = {
  fabric: [
    {
      id: "eventhouse",
      label: "Eventhouse",
      tech: "KQL Database",
      desc: "Hot-path streaming analytics with update policies",
    },
    {
      id: "lakehouse",
      label: "Lakehouse (Bronze)",
      tech: "Delta Lake",
      desc: "Raw ingestion from Event Hub via Eventstream",
    },
    {
      id: "silver",
      label: "Lakehouse (Silver)",
      tech: "Spark Notebooks",
      desc: "Cleansed, deduplicated, SCD Type-2 dimensions",
    },
    {
      id: "gold",
      label: "Lakehouse (Gold)",
      tech: "Spark Notebooks",
      desc: "Business-ready star schemas, aggregate tables",
    },
    {
      id: "semantic",
      label: "Semantic Model",
      tech: "Power BI Dataset",
      desc: "DAX measures, row-level security, incremental refresh",
    },
  ],
  azure: [
    {
      id: "bicep",
      label: "Bicep Modules",
      tech: "AVM + Registry",
      desc: "Versioned modules: networking, compute, data, identity",
    },
    {
      id: "stacks",
      label: "Deployment Stacks",
      tech: "ARM Deployment",
      desc: "Deny-settings, action-on-unmanage for drift protection",
    },
    {
      id: "policy",
      label: "Azure Policy",
      tech: "Policy-as-Code",
      desc: "Custom + built-in policies, exemptions, remediation",
    },
    {
      id: "keyvault",
      label: "Key Vault",
      tech: "RBAC",
      desc: "Secrets, certificates, managed identity access",
    },
    {
      id: "functions",
      label: "Azure Functions",
      tech: "Clojure on JVM",
      desc: "Serverless API — ring handler on Azure Functions runtime",
    },
  ],
  m365: [
    {
      id: "copilot",
      label: "Copilot Agents",
      tech: "Declarative",
      desc: "Confluence search, sprint planner, meeting recap",
    },
    {
      id: "teams",
      label: "Teams Governance",
      tech: "PowerShell + Graph",
      desc: "Team lifecycle, naming policy, retention labels",
    },
    {
      id: "sharepoint",
      label: "SharePoint",
      tech: "PnP PowerShell",
      desc: "Hub sites, document libraries, content types",
    },
  ],
  monitoring: [
    {
      id: "eventhub",
      label: "Event Hub",
      tech: "Kafka-compatible",
      desc: "Namespace with partitioned topics for log ingestion",
    },
    {
      id: "eventstream",
      label: "Eventstream",
      tech: "Fabric Real-Time",
      desc: "No-code routing from Event Hub to Eventhouse/Lakehouse",
    },
    {
      id: "kql-dash",
      label: "KQL Dashboards",
      tech: "Real-Time Intelligence",
      desc: "Live operational dashboards with auto-refresh",
    },
  ],
};
var adrs = [
  {
    id: "ADR-001",
    title: "Use Bicep AVM over raw ARM templates",
    status: "Accepted",
    date: "2024-09",
    context:
      "Team spent excessive time writing boilerplate ARM JSON. Microsoft's Azure Verified Modules provide tested, well-documented Bicep modules with consistent interfaces.",
    decision:
      "Adopt AVM modules from the Bicep public registry (br:mcr.microsoft.com/bicep) as the primary IaC building blocks. Wrap in thin composition modules per workload.",
    consequences: [
      "Faster onboarding — engineers learn one module interface",
      "Automatic security baselines from Microsoft",
      "Version pinning required — breaking changes between AVM versions",
      "Custom resources still need raw Bicep",
    ],
  },
  {
    id: "ADR-002",
    title: "Deployment Stacks for drift protection",
    status: "Accepted",
    date: "2024-10",
    context:
      "Resources modified outside IaC pipelines caused silent drift. Traditional deployments don't prevent manual changes.",
    decision:
      "Use Azure Deployment Stacks with deny-settings (denyWriteAndDelete) and actionOnUnmanage=deleteResources for all production resource groups.",
    consequences: [
      "Zero manual drift in production",
      "Engineers must go through IaC pipeline for all changes",
      "Break-glass PIM activation needed for emergency fixes",
      "Deployment stack updates are slightly slower than raw deployments",
    ],
  },
  {
    id: "ADR-003",
    title: "Medallion architecture for Fabric pipelines",
    status: "Accepted",
    date: "2024-11",
    context:
      "Ad-hoc data pipelines led to inconsistent data quality. Analysts couldn't trust numbers across reports.",
    decision:
      "Implement Bronze → Silver → Gold medallion pattern. Bronze is raw/append-only, Silver is cleansed/deduplicated, Gold is business-ready star schemas.",
    consequences: [
      "Clear data lineage and quality gates",
      "Analysts only query Gold layer",
      "Increased storage from multi-layer approach",
      "Reprocessing requires replaying from Bronze",
    ],
  },
  {
    id: "ADR-004",
    title: "ClojureScript for portfolio frontend",
    status: "Accepted",
    date: "2025-01",
    context:
      "Portfolio needs interactive SPAs. Team expertise is in Clojure. Rich Hickey's philosophy of simplicity and data-orientation aligns with our values.",
    decision:
      "Use ClojureScript with shadow-cljs for all portfolio SPAs. Vanilla DOM manipulation (no React). SCI for in-browser REPL evaluation.",
    consequences: [
      "Consistent language across backend and frontend",
      "Smaller community than React/Vue — fewer library options",
      "shadow-cljs provides excellent JS interop",
      "Functional approach produces simpler, more testable code",
    ],
  },
  {
    id: "ADR-005",
    title: "Event Hub for centralized log ingestion",
    status: "Accepted",
    date: "2024-12",
    context:
      "Logs scattered across Log Analytics workspaces, storage accounts, and Application Insights. No unified real-time view.",
    decision:
      "Route all infrastructure and application logs through a central Event Hub namespace. Use Fabric Eventstream to fan-out to Eventhouse (hot) and Lakehouse (cold).",
    consequences: [
      "Single ingestion point simplifies monitoring",
      "Real-time KQL queries via Eventhouse",
      "Event Hub becomes a critical path — needs geo-redundancy",
      "Cost savings by replacing per-resource Log Analytics with centralized pipeline",
    ],
  },
  {
    id: "ADR-006",
    title: "Azure Policy for governance at scale",
    status: "Accepted",
    date: "2024-09",
    context:
      "Multiple subscriptions with inconsistent tagging, naming, and security configurations. Manual audits don't scale.",
    decision:
      "Implement Azure Policy as code. Custom policies for CAF naming, required tags, and allowed SKUs. Assign at management group level with exemptions for exceptions.",
    consequences: [
      "Consistent governance across all subscriptions",
      "New resources automatically validated",
      "Policy conflicts require careful initiative design",
      "Exemption workflow needed for legitimate exceptions",
    ],
  },
  {
    id: "ADR-007",
    title: "Evolutionary architecture with fitness functions",
    status: "Proposed",
    date: "2025-05",
    context:
      "Architecture decisions made early become constraints later. Martin Fowler and Neal Ford advocate for evolutionary architecture — decisions that support incremental change.",
    decision:
      "Treat architecture as evolutionary. Define fitness functions (automated checks) for key architectural characteristics: deployment frequency, policy compliance rate, data freshness SLA, cost per workload.",
    consequences: [
      "Architecture evolves with business needs",
      "Fitness functions catch architectural drift early",
      "Requires investment in measurement infrastructure",
      "Team must accept that today's decisions will be revisited",
    ],
  },
];
var c4_actor_el = function (p__34) {
  const map___1_3 = p__34;
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const label_5 = squint_core.get(map___1_4, "label");
  const desc_6 = squint_core.get(map___1_4, "desc");
  return core.create_el(
    "div",
    { class: "c4-actor" },
    core.create_el("div", { class: "c4-actor-icon" }, "👤"),
    core.create_el("div", { class: "c4-actor-label" }, label_5),
    core.create_el("div", { class: "c4-actor-desc" }, desc_6),
  );
};
var c4_system_el = function (p__35, on_click) {
  const map___1_3 = p__35;
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const label_5 = squint_core.get(map___1_4, "label");
  const desc_6 = squint_core.get(map___1_4, "desc");
  const color_7 = squint_core.get(map___1_4, "color");
  const el_8 = core.create_el(
    "div",
    { class: "c4-system", style: `${"border-color:"}${color_7 ?? ""}` },
    core.create_el(
      "div",
      { class: "c4-system-label", style: `${"color:"}${color_7 ?? ""}` },
      label_5,
    ),
    core.create_el("div", { class: "c4-system-desc" }, desc_6),
    core.create_el(
      "div",
      { class: "c4-drill-hint" },
      "▶ Click to explore containers",
    ),
  );
  el_8.addEventListener("click", on_click);
  return el_8;
};
var c4_container_el = function (p__36) {
  const map___1_3 = p__36;
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const label_5 = squint_core.get(map___1_4, "label");
  const tech_6 = squint_core.get(map___1_4, "tech");
  const desc_7 = squint_core.get(map___1_4, "desc");
  return core.create_el(
    "div",
    { class: "c4-container" },
    core.create_el("div", { class: "c4-container-label" }, label_5),
    core.create_el("div", { class: "c4-container-tech" }, tech_6),
    core.create_el("div", { class: "c4-container-desc" }, desc_7),
  );
};
var render_c4_context = function (state, render_BANG_) {
  const panel_1 = core.create_el("div", { class: "c4-panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "c4-level-title" }, "System Context"),
  );
  panel_1.appendChild(
    core.create_el(
      "p",
      { class: "c4-level-desc" },
      '"Architecture is about the important stuff. Whatever that is." — Martin Fowler',
    ),
  );
  const actors_row_2 = core.create_el("div", { class: "c4-actors-row" });
  for (let G__3 of squint_core.iterable(
    squint_core.get(c4_context, "actors"),
  )) {
    const a_4 = G__3;
    actors_row_2.appendChild(c4_actor_el(a_4));
  }
  panel_1.appendChild(actors_row_2);
  const systems_row_5 = core.create_el("div", { class: "c4-systems-row" });
  for (let G__6 of squint_core.iterable(
    squint_core.get(c4_context, "systems"),
  )) {
    const s_7 = G__6;
    systems_row_5.appendChild(
      c4_system_el(s_7, function (_) {
        squint_core.swap_BANG_(
          state,
          squint_core.assoc,
          "c4-drill",
          squint_core.get(s_7, "id"),
        );
        return render_BANG_();
      }),
    );
  }
  panel_1.appendChild(systems_row_5);
  return panel_1;
};
var render_c4_containers = function (state, render_BANG_) {
  const system_id_1 = squint_core.get(squint_core.deref(state), "c4-drill");
  const containers_2 = squint_core.get(c4_containers, system_id_1, []);
  const sys_3 = squint_core.first(
    squint_core.filter(
      function (_PERCENT_1) {
        return squint_core._EQ_(squint_core.get(_PERCENT_1, "id"), system_id_1);
      },
      squint_core.get(c4_context, "systems"),
    ),
  );
  const panel_4 = core.create_el("div", { class: "c4-panel" });
  panel_4.appendChild(
    (() => {
      const back_5 = core.create_el(
        "button",
        { class: "c4-back-btn" },
        "← Back to Context",
      );
      back_5.addEventListener("click", function (_) {
        squint_core.swap_BANG_(state, squint_core.dissoc, "c4-drill");
        return render_BANG_();
      });
      return back_5;
    })(),
  );
  panel_4.appendChild(
    core.create_el(
      "h3",
      { class: "c4-level-title" },
      `${"Containers — "}${squint_core.get(sys_3, "label") ?? ""}`,
    ),
  );
  panel_4.appendChild(
    core.create_el(
      "p",
      { class: "c4-level-desc" },
      squint_core.get(sys_3, "desc"),
    ),
  );
  const grid_6 = core.create_el("div", { class: "c4-containers-grid" });
  for (let G__7 of squint_core.iterable(containers_2)) {
    const c_8 = G__7;
    grid_6.appendChild(c4_container_el(c_8));
  }
  panel_4.appendChild(grid_6);
  return panel_4;
};
var status_badge = function (status) {
  const cls_1 = (() => {
    const G__37_2 = status;
    switch (G__37_2) {
      case "Accepted":
        return "adr-status-accepted";

        break;
      case "Proposed":
        return "adr-status-proposed";

        break;
      case "Deprecated":
        return "adr-status-deprecated";

        break;
      default:
        return "adr-status-default";
    }
  })();
  return core.create_el(
    "span",
    { class: `${"adr-status "}${cls_1 ?? ""}` },
    status,
  );
};
var adr_list_item = function (p__38, selected_QMARK_, on_click) {
  const map___1_3 = p__38;
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const id_5 = squint_core.get(map___1_4, "id");
  const title_6 = squint_core.get(map___1_4, "title");
  const status_7 = squint_core.get(map___1_4, "status");
  const el_8 = core.create_el(
    "div",
    {
      class: `adr-list-item${(squint_core.truth_(selected_QMARK_) ? " selected" : null) ?? ""}`,
    },
    core.create_el(
      "div",
      { class: "adr-item-header" },
      core.create_el("span", { class: "adr-id" }, id_5),
      status_badge(status_7),
    ),
    core.create_el("div", { class: "adr-item-title" }, title_6),
  );
  el_8.addEventListener("click", on_click);
  return el_8;
};
var adr_detail = function (p__39) {
  const map___1_3 = p__39;
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const id_5 = squint_core.get(map___1_4, "id");
  const title_6 = squint_core.get(map___1_4, "title");
  const status_7 = squint_core.get(map___1_4, "status");
  const date_8 = squint_core.get(map___1_4, "date");
  const context_9 = squint_core.get(map___1_4, "context");
  const decision_10 = squint_core.get(map___1_4, "decision");
  const consequences_11 = squint_core.get(map___1_4, "consequences");
  const panel_12 = core.create_el("div", { class: "adr-detail" });
  panel_12.appendChild(
    core.create_el(
      "div",
      { class: "adr-detail-header" },
      core.create_el("span", { class: "adr-id-large" }, id_5),
      status_badge(status_7),
      core.create_el("span", { class: "adr-date" }, date_8),
    ),
  );
  panel_12.appendChild(
    core.create_el("h3", { class: "adr-detail-title" }, title_6),
  );
  panel_12.appendChild(
    core.create_el("h4", { class: "adr-section-heading" }, "Context"),
  );
  panel_12.appendChild(
    core.create_el("p", { class: "adr-section-body" }, context_9),
  );
  panel_12.appendChild(
    core.create_el("h4", { class: "adr-section-heading" }, "Decision"),
  );
  panel_12.appendChild(
    core.create_el("p", { class: "adr-section-body" }, decision_10),
  );
  panel_12.appendChild(
    core.create_el("h4", { class: "adr-section-heading" }, "Consequences"),
  );
  const ul_13 = core.create_el("ul", { class: "adr-consequences" });
  for (let G__14 of squint_core.iterable(consequences_11)) {
    const c_15 = G__14;
    ul_13.appendChild(core.create_el("li", {}, c_15));
  }
  panel_12.appendChild(ul_13);
  return panel_12;
};
var render_adr_browser = function (state, render_BANG_) {
  const selected_id_1 = squint_core.get(
    squint_core.deref(state),
    "adr-selected",
  );
  const selected_adr_2 = squint_core.first(
    squint_core.filter(function (_PERCENT_1) {
      return squint_core._EQ_(squint_core.get(_PERCENT_1, "id"), selected_id_1);
    }, adrs),
  );
  const panel_3 = core.create_el("div", { class: "adr-browser" });
  const list_panel_4 = core.create_el("div", { class: "adr-list" });
  list_panel_4.appendChild(
    core.create_el(
      "h3",
      { class: "adr-list-heading" },
      "Architecture Decisions",
    ),
  );
  list_panel_4.appendChild(
    core.create_el(
      "p",
      { class: "adr-fowler-quote" },
      '"The primary goal of architecture documentation is communication." — Martin Fowler',
    ),
  );
  for (let G__5 of squint_core.iterable(adrs)) {
    const adr_6 = G__5;
    list_panel_4.appendChild(
      adr_list_item(
        adr_6,
        squint_core._EQ_(squint_core.get(adr_6, "id"), selected_id_1),
        function (_) {
          squint_core.swap_BANG_(
            state,
            squint_core.assoc,
            "adr-selected",
            squint_core.get(adr_6, "id"),
          );
          return render_BANG_();
        },
      ),
    );
  }
  panel_3.appendChild(list_panel_4);
  const detail_panel_7 = core.create_el("div", { class: "adr-detail-panel" });
  if (squint_core.truth_(selected_adr_2)) {
    detail_panel_7.appendChild(adr_detail(selected_adr_2));
  } else {
    detail_panel_7.appendChild(
      core.create_el(
        "div",
        { class: "adr-placeholder" },
        core.create_el(
          "p",
          { class: "adr-placeholder-text" },
          "Select a decision to view its context, rationale, and consequences.",
        ),
        core.create_el(
          "p",
          { class: "adr-placeholder-quote" },
          '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
        ),
      ),
    );
  }
  panel_3.appendChild(detail_panel_7);
  return panel_3;
};
var architecture_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  const tab_body_2 = core.create_el("div", { class: "tab-body" });
  const state_3 = squint_core.atom({ tab: "c4", "adr-selected": "ADR-001" });
  const render_BANG__4 = function render_BANG_() {
    tab_body_2.innerHTML = "";
    const tab_5 = squint_core.get(squint_core.deref(state_3), "tab");
    return tab_body_2.appendChild(
      (() => {
        const G__40_6 = tab_5;
        switch (G__40_6) {
          case "c4":
            if (
              squint_core.truth_(
                squint_core.get(squint_core.deref(state_3), "c4-drill"),
              )
            ) {
              return render_c4_containers(state_3, render_BANG_);
            } else {
              return render_c4_context(state_3, render_BANG_);
            }

            break;
          case "adr":
            return render_adr_browser(state_3, render_BANG_);

            break;
          default:
            throw new Error(`${"No matching clause: "}${G__40_6 ?? ""}`);
        }
      })(),
    );
  };
  container_1.appendChild(
    core.create_el("h1", { class: "dashboard-title" }, "Architecture Studio"),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "Evolutionary architecture — C4 models and decision records",
    ),
  );
  const metrics_8 = core.create_el("div", { class: "metrics-row" });
  for (let G__9 of squint_core.iterable([
    ["Systems", "4", "#0078d4"],
    ["Containers", "18", "#6a0dad"],
    ["ADRs", "7", "#00a86b"],
    ["Accepted", "6", "#b8860b"],
  ])) {
    const vec___10_13 = G__9;
    const label_14 = squint_core.nth(vec___10_13, 0, null);
    const value_15 = squint_core.nth(vec___10_13, 1, null);
    const color_16 = squint_core.nth(vec___10_13, 2, null);
    metrics_8.appendChild(
      core.create_el(
        "div",
        { class: "metric-card" },
        core.create_el(
          "div",
          { class: "metric-value", style: `${"color:"}${color_16 ?? ""}` },
          value_15,
        ),
        core.create_el("div", { class: "metric-label" }, label_14),
      ),
    );
  }
  container_1.appendChild(metrics_8);
  const tabs_17 = core.create_el("div", { class: "tab-bar" });
  for (let G__18 of squint_core.iterable([
    ["C4 Model", "c4"],
    ["Decision Records", "adr"],
  ])) {
    const vec___19_22 = G__18;
    const label_23 = squint_core.nth(vec___19_22, 0, null);
    const key_24 = squint_core.nth(vec___19_22, 1, null);
    const btn_25 = core.create_el(
      "button",
      {
        class: `tab-btn${(squint_core._EQ_(key_24, squint_core.get(squint_core.deref(state_3), "tab")) ? " active" : null) ?? ""}`,
      },
      label_23,
    );
    btn_25.addEventListener("click", function (_) {
      squint_core.swap_BANG_(state_3, squint_core.assoc, "tab", key_24);
      render_BANG__4();
      const btns_26 = tabs_17.querySelectorAll(".tab-btn");
      for (let G__27 of squint_core.iterable(Array.from(btns_26))) {
        const b_28 = G__27;
        b_28.classList.remove("active");
      }
      return btn_25.classList.add("active");
    });
    tabs_17.appendChild(btn_25);
  }
  container_1.appendChild(tabs_17);
  container_1.appendChild(tab_body_2);
  render_BANG__4();
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "architecture",
      "/articles/architecture-studio.html",
      "web/modules/portfolio/pro/architecture.js",
      architecture_content(),
    ),
  );
};

export { init };
