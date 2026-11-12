import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var rounds_queue = [
  {
    lane: "🔴 Lane 1 — Urgent",
    id: "INFRA-###",
    title: "Capacity throttling on shared workload",
    status: "active",
    age: "2h",
  },
  {
    lane: "🔵 Lane 2 — Manual",
    id: "INFRA-###",
    title: "API quota mapping for governance review",
    status: "waiting",
    age: "3d",
  },
  {
    lane: "🟢 Lane 3 — Background",
    id: "INFRA-###",
    title: "Monthly platform-retirement review",
    status: "queued",
    age: "1d",
  },
  {
    lane: "🔴 Lane 4 — SDP-Urgent",
    id: "SDP-#####",
    title: "Account lockout — finance lead",
    status: "active",
    age: "45m",
  },
  {
    lane: "🟠 Lane 5 — Approval",
    id: "SDP-#####",
    title: "GitHub Copilot license grant",
    status: "queued",
    age: "4h",
  },
  {
    lane: "🟢 Lane 6 — Background",
    id: "SDP-#####",
    title: "Workspace provisioning request",
    status: "queued",
    age: "2d",
  },
];
var voice_examples = [
  {
    system: "Jira (internal)",
    icon: "🛠",
    worklog:
      "Verified Event Hub namespace has firewall rule for Fabric public IPs; throughput unit at 1, ingress at 80% peak.",
    comment:
      "Pulled the gateway IP allowlist from cap-edm-prd-usw2-001 settings — matches the EH inbound rule, so handshake is wide open. Question is whether the consumer group lag is the real bottleneck.",
  },
  {
    system: "SDP (end-user)",
    icon: "📞",
    worklog:
      "Activated Copilot license on tenant; user signed in successfully and Office app shows the Copilot button.",
    comment:
      "Your Microsoft 365 Copilot license is active. Restart Word/Excel/Outlook — you should see the Copilot button in the ribbon. Reply here if it doesn't show up after a full app restart.",
  },
];
var skills_pipeline = [
  {
    step: "1",
    icon: "🎯",
    name: "ticket-investigator",
    desc: "Clarifying interview → 95% confidence before work starts",
  },
  {
    step: "2",
    icon: "🔍",
    name: "knowledge-clerk",
    desc: "Search precedent — has this been done before?",
  },
  {
    step: "3",
    icon: "🔧",
    name: "domain specialist",
    desc: "PIM / Azure / Fabric / Confluence — uses real CLI",
  },
  {
    step: "4",
    icon: "✍",
    name: "jira-worklog / sdp-worklog",
    desc: "Write WORKLOG + COMMENT entries to markdown",
  },
  {
    step: "5",
    icon: "⚡",
    name: "git push to main",
    desc: "GitHub Actions reconcile to Jira/SDP/Confluence",
  },
  {
    step: "6",
    icon: "📊",
    name: "end-my-day",
    desc: "Aggregate worklogs → Teams standup post",
  },
];
var metrics = [
  { label: "Active Skills", value: "27", color: "#0078d4" },
  { label: "Today's Tickets", value: "6", color: "#00a86b" },
  { label: "Avg Investigation", value: "12m", color: "#7e57c2" },
  { label: "Auto-Reconciled", value: "100%", color: "#b8860b" },
];
var state = squint_core.atom({ tab: "rounds" });
var metrics_panel = function () {
  const panel_1 = core.create_el("div", { class: "metrics-row" });
  for (let G__2 of squint_core.iterable(metrics)) {
    const m_3 = G__2;
    panel_1.appendChild(
      core.create_el(
        "div",
        { class: "metric-card" },
        core.create_el(
          "div",
          {
            class: "metric-value",
            style: `${"color:"}${squint_core.get(m_3, "color") ?? ""}`,
          },
          squint_core.get(m_3, "value"),
        ),
        core.create_el(
          "div",
          { class: "metric-label" },
          squint_core.get(m_3, "label"),
        ),
      ),
    );
  }
  return panel_1;
};
var rounds_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el(
      "h3",
      { class: "panel-title" },
      "🎛 Rounds Board — WIP = 1 per lane",
    ),
  );
  panel_1.appendChild(
    core.create_el(
      "p",
      { class: "panel-sub" },
      "Each lane gets one ticket at a time. Dispatcher picks the next-highest scored item when the active one moves to done or waiting.",
    ),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable([
    "Lane",
    "ID",
    "Title",
    "Status",
    "Age",
  ])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(rounds_queue)) {
    const r_9 = G__8;
    const row_10 = core.create_el("tr", {});
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "font-weight:600" },
        squint_core.get(r_9, "lane"),
      ),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "font-family:monospace" },
        squint_core.get(r_9, "id"),
      ),
    );
    row_10.appendChild(core.create_el("td", {}, squint_core.get(r_9, "title")));
    row_10.appendChild(
      core.create_el(
        "td",
        {
          style: `${"font-weight:600;color:"}${
            (() => {
              const G__45_11 = squint_core.get(r_9, "status");
              switch (G__45_11) {
                case "active":
                  return "#d83b01";

                  break;
                case "waiting":
                  return "#b8860b";

                  break;
                default:
                  return "#605e5c";
              }
            })() ?? ""
          }`,
        },
        squint_core.get(r_9, "status"),
      ),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "color:var(--clr-text-muted)" },
        squint_core.get(r_9, "age"),
      ),
    );
    row_10.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${"▶ Dispatching "}${squint_core.get(r_9, "lane") ?? ""}${" — "}${squint_core.get(r_9, "id") ?? ""}`,
      );
    });
    tbody_7.appendChild(row_10);
  }
  table_2.appendChild(tbody_7);
  panel_1.appendChild(table_2);
  return panel_1;
};
var voice_wall_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "💬 The Voice Wall"),
  );
  panel_1.appendChild(
    core.create_el(
      "p",
      { class: "panel-sub" },
      "WORKLOG is always internal voice (what was done, how I verified it). COMMENT shifts voice by system: Jira = internal investigative voice, SDP = end-user voice (plain language, what to expect, how to verify on their end).",
    ),
  );
  const grid_2 = core.create_el("div", { class: "card-grid" });
  for (let G__3 of squint_core.iterable(voice_examples)) {
    const v_4 = G__3;
    const card_5 = core.create_el("div", {
      class: "panel",
      style: "padding:var(--space-s)",
    });
    card_5.appendChild(
      core.create_el(
        "h4",
        { style: "margin-top:0;color:var(--clr-accent)" },
        `${squint_core.get(v_4, "icon") ?? ""}${" "}${squint_core.get(v_4, "system") ?? ""}`,
      ),
    );
    card_5.appendChild(
      core.create_el(
        "div",
        { style: "font-weight:600;margin-top:0.5rem" },
        "WORKLOG",
      ),
    );
    card_5.appendChild(
      core.create_el(
        "div",
        { style: "color:var(--clr-text-muted);font-style:italic" },
        squint_core.get(v_4, "worklog"),
      ),
    );
    card_5.appendChild(
      core.create_el(
        "div",
        { style: "font-weight:600;margin-top:0.5rem" },
        "COMMENT",
      ),
    );
    card_5.appendChild(
      core.create_el(
        "div",
        { style: "color:var(--clr-text)" },
        squint_core.get(v_4, "comment"),
      ),
    );
    grid_2.appendChild(card_5);
  }
  panel_1.appendChild(grid_2);
  return panel_1;
};
var pipeline_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el(
      "h3",
      { class: "panel-title" },
      "🔁 Skill Pipeline — one ticket",
    ),
  );
  panel_1.appendChild(
    core.create_el(
      "p",
      { class: "panel-sub" },
      "Composable skills — each one does one thing well. Rounds picks the ticket; investigator clarifies; specialists do the work; worklog persists state to disk; CI mirrors it back to the tracker.",
    ),
  );
  const grid_2 = core.create_el("div", { class: "card-grid" });
  for (let G__3 of squint_core.iterable(skills_pipeline)) {
    const s_4 = G__3;
    const card_5 = core.create_el(
      "div",
      { class: "agent-card", style: "cursor:pointer" },
      core.create_el(
        "span",
        { class: "agent-icon" },
        squint_core.get(s_4, "icon"),
      ),
      core.create_el(
        "div",
        { class: "agent-info" },
        core.create_el(
          "div",
          { class: "agent-name" },
          `${squint_core.get(s_4, "step") ?? ""}${". "}${squint_core.get(s_4, "name") ?? ""}`,
        ),
        core.create_el(
          "div",
          { class: "agent-desc" },
          squint_core.get(s_4, "desc"),
        ),
      ),
    );
    card_5.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${squint_core.get(s_4, "icon") ?? ""}${" Step "}${squint_core.get(s_4, "step") ?? ""}${": "}${squint_core.get(s_4, "name") ?? ""}`,
      );
    });
    grid_2.appendChild(card_5);
  }
  panel_1.appendChild(grid_2);
  return panel_1;
};
var sync_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "⚡ Markdown ↔ API Sync"),
  );
  panel_1.appendChild(
    core.create_el(
      "p",
      { class: "panel-sub" },
      "State lives in `issues/{KEY}.md` and `cases/{ID}/case.md`. Push to main → GitHub Actions reconcile to Jira / SDP / Confluence. One direction, file-truth, no webhooks.",
    ),
  );
  panel_1.appendChild(
    core.create_el(
      "pre",
      { class: "code-block" },
      `${"issues/INFRA-###/\n"}${"└── INFRA-### — Capacity throttling.md\n"}${"    ├── Description\n"}${"    ├── Investigation\n"}${"    ├── Actions          ← WORKLOG + COMMENT entries (reverse chrono)\n"}${"    └── Follow-up        ← Status, TODO, flow:waiting reason\n"}${"\n"}${"cases/#####/\n"}${"└── ##### — License Grant.md\n"}${"    ├── Description\n"}${"    ├── Actions\n"}${"    ├── Tasks\n"}${"    ├── Web Links\n"}${"    ├── Approval         ← L1 reviewer state\n"}${"    └── Follow-up\n"}${"\n"}${"git push origin main\n"}${"  └─→ .github/workflows/jira-worklog-sync.yaml\n"}${"  └─→ .github/workflows/sdp-worklog-sync.yaml\n"}${"       reconcile WORKLOG + COMMENT + tags + approvals → API"}`,
    ),
  );
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
var copilotops_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  const tab_body_2 = core.create_el("div", { class: "tab-body" });
  const render_tab_3 = function (tab) {
    tab_body_2.innerHTML = "";
    return tab_body_2.appendChild(
      (() => {
        const G__46_4 = tab;
        switch (G__46_4) {
          case "rounds":
            return rounds_panel();

            break;
          case "voice":
            return voice_wall_panel();

            break;
          case "pipeline":
            return pipeline_panel();

            break;
          case "sync":
            return sync_panel();

            break;
          default:
            throw new Error(`${"No matching clause: "}${G__46_4 ?? ""}`);
        }
      })(),
    );
  };
  container_1.appendChild(
    core.create_el(
      "h1",
      { class: "dashboard-title" },
      "Copilot-Ops Agent Console",
    ),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "Live view of the file-driven AI ops loop — rounds dispatch · voice wall · skill pipeline · markdown↔API sync",
    ),
  );
  container_1.appendChild(metrics_panel());
  const tabs_6 = core.create_el("div", { class: "tab-bar" });
  for (let G__7 of squint_core.iterable([
    ["Rounds Board", "rounds"],
    ["Voice Wall", "voice"],
    ["Skill Pipeline", "pipeline"],
    ["Markdown↔API", "sync"],
  ])) {
    const vec___8_11 = G__7;
    const label_12 = squint_core.nth(vec___8_11, 0, null);
    const key_13 = squint_core.nth(vec___8_11, 1, null);
    tabs_6.appendChild(
      tab_button(
        label_12,
        squint_core._EQ_(
          key_13,
          squint_core.get(squint_core.deref(state), "tab"),
        ),
        function (e) {
          squint_core.swap_BANG_(state, squint_core.assoc, "tab", key_13);
          render_tab_3(key_13);
          for (let G__14 of squint_core.iterable(
            Array.from(tabs_6.querySelectorAll(".tab-btn")),
          )) {
            const b_15 = G__14;
            b_15.classList.remove("active");
          }
          return e.target.classList.add("active");
        },
      ),
    );
  }
  container_1.appendChild(tabs_6);
  container_1.appendChild(tab_body_2);
  render_tab_3("rounds");
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "copilotops",
      "/articles/copilot-ops-console.html",
      "web/modules/portfolio/pro/copilotops.js",
      copilotops_content(),
    ),
  );
};

export { init };
