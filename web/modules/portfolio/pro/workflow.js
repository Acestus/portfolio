import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var skills = [
  {
    icon: "🌅",
    name: "start-my-day",
    desc: "Pull active tickets, draft daily standup, open the kanban board",
  },
  {
    icon: "🌙",
    name: "end-my-day",
    desc: "Stop timers, generate worklog summary, post to Teams",
  },
  {
    icon: "🔁",
    name: "rounds",
    desc: "Kanban station rotation — one ticket per lane, round-robin focus",
  },
  {
    icon: "🎯",
    name: "ticket-investigator",
    desc: "Structured Jira investigation — clarify, gather, synthesize, plan",
  },
  {
    icon: "📞",
    name: "sdp-investigator",
    desc: "Same workflow for ServiceDesk Plus — end-user-voice answers",
  },
  {
    icon: "📋",
    name: "phoenix-backlog",
    desc: "Create scored Jira items + Confluence backlog rows",
  },
  {
    icon: "🗂",
    name: "jira-dispatcher",
    desc: "WIP = 6 lanes — auto-assign next-best ticket to today's calendar",
  },
  {
    icon: "✍",
    name: "jira-worklog",
    desc: "Markdown → Jira sync on every push to main",
  },
  {
    icon: "📡",
    name: "waiting-ticket-followup",
    desc: "Group flow:waiting tickets by stakeholder · draft follow-ups",
  },
  {
    icon: "📚",
    name: "confluence-writer",
    desc: "Author full Confluence articles with PlantUML diagrams",
  },
  {
    icon: "🔍",
    name: "knowledge-clerk",
    desc: "Internal RAG — find precedent before doing anything new",
  },
  {
    icon: "🛡",
    name: "pim-runbook",
    desc: "Azure PIM activation + runbook updates",
  },
];
var flow_stages = [
  {
    icon: "📥",
    label: "Capture",
    desc: "Voice/Slack/email → SDP or Jira via skill",
  },
  {
    icon: "📁",
    label: "Markdown",
    desc: "issues/{KEY}.md or cases/{ID}/case.md — state lives here",
  },
  {
    icon: "🤖",
    label: "AI Round",
    desc: "rounds skill orchestrates investigation + work",
  },
  {
    icon: "💬",
    label: "Voice Wall",
    desc: "Jira COMMENT = internal voice · SDP COMMENT = end-user voice",
  },
  {
    icon: "⚡",
    label: "CI Sync",
    desc: "Push to main → GitHub Actions reconciles fields, tags, approvals",
  },
  {
    icon: "📊",
    label: "Standup",
    desc: "end-my-day extracts worklog & posts to Teams",
  },
];
var lanes = [
  {
    tag: "🔴",
    name: "Lane 1 — Urgent",
    system: "Jira",
    wip: 1,
    example: "INFRA — Sev1 production outage",
  },
  {
    tag: "🔵",
    name: "Lane 2 — Manual",
    system: "Jira",
    wip: 1,
    example: "INFRA — Manual SOP work",
  },
  {
    tag: "🟢",
    name: "Lane 3 — Background",
    system: "Jira",
    wip: 1,
    example: "INFRA — Long-running automation",
  },
  {
    tag: "🔴",
    name: "Lane 4 — SDP-Urgent",
    system: "SDP",
    wip: 1,
    example: "Access blocked / account locked",
  },
  {
    tag: "🟠",
    name: "Lane 5 — SDP-Approval",
    system: "SDP",
    wip: 1,
    example: "License grant / new account",
  },
  {
    tag: "🟢",
    name: "Lane 6 — SDP-Background",
    system: "SDP",
    wip: 1,
    example: "Hardware refresh / batch onboard",
  },
];
var repo_stats = [
  { label: "Skills", value: "27", color: "#0078d4" },
  { label: "Instructions", value: "19", color: "#7e57c2" },
  { label: "Workflows", value: "12", color: "#00a86b" },
  { label: "Scripts", value: "80", color: "#b8860b" },
  { label: "Lanes", value: "6", color: "#d83b01" },
  { label: "License", value: "MIT", color: "#5c2d91" },
];
var state = squint_core.atom({ tab: "skills" });
var metrics_panel = function () {
  const panel_1 = core.create_el("div", { class: "metrics-row" });
  for (let G__2 of squint_core.iterable(repo_stats)) {
    const s_3 = G__2;
    panel_1.appendChild(
      core.create_el(
        "div",
        { class: "metric-card" },
        core.create_el(
          "div",
          {
            class: "metric-value",
            style: `${"color:"}${squint_core.get(s_3, "color") ?? ""}`,
          },
          squint_core.get(s_3, "value"),
        ),
        core.create_el(
          "div",
          { class: "metric-label" },
          squint_core.get(s_3, "label"),
        ),
      ),
    );
  }
  return panel_1;
};
var skill_card = function (s) {
  const card_1 = core.create_el(
    "div",
    { class: "agent-card" },
    core.create_el("span", { class: "agent-icon" }, squint_core.get(s, "icon")),
    core.create_el(
      "div",
      { class: "agent-info" },
      core.create_el(
        "div",
        { class: "agent-name" },
        squint_core.get(s, "name"),
      ),
      core.create_el(
        "div",
        { class: "agent-desc" },
        squint_core.get(s, "desc"),
      ),
    ),
  );
  card_1.addEventListener("click", function (_) {
    return core.toast_BANG_(
      `${squint_core.get(s, "icon") ?? ""}${" "}${squint_core.get(s, "name") ?? ""}${" — "}${squint_core.get(s, "desc") ?? ""}`,
    );
  });
  return card_1;
};
var skills_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el(
      "h3",
      { class: "panel-title" },
      "🧰 Copilot Skills (sampling)",
    ),
  );
  const grid_2 = core.create_el("div", { class: "card-grid" });
  for (let G__3 of squint_core.iterable(skills)) {
    const s_4 = G__3;
    grid_2.appendChild(skill_card(s_4));
  }
  panel_1.appendChild(grid_2);
  return panel_1;
};
var flow_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "🔄 Daily Flow"),
  );
  const flow_2 = core.create_el("div", { class: "flow" });
  for (let G__3 of squint_core.iterable(
    squint_core.map_indexed(squint_core.vector, flow_stages),
  )) {
    const vec___4_7 = G__3;
    const i_8 = squint_core.nth(vec___4_7, 0, null);
    const s_9 = squint_core.nth(vec___4_7, 1, null);
    if (i_8 > 0) {
      flow_2.appendChild(core.create_el("span", { class: "arrow" }, "→"));
    }
    const pill_10 = core.create_el(
      "div",
      { class: "pill", style: "cursor:pointer" },
      `${squint_core.get(s_9, "icon") ?? ""}${" "}${squint_core.get(s_9, "label") ?? ""}`,
    );
    pill_10.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${squint_core.get(s_9, "icon") ?? ""}${" "}${squint_core.get(s_9, "label") ?? ""}${" — "}${squint_core.get(s_9, "desc") ?? ""}`,
      );
    });
    flow_2.appendChild(pill_10);
  }
  panel_1.appendChild(flow_2);
  const desc_11 = core.create_el("div", {
    class: "panel-sub",
    style: "margin-top:1rem",
  });
  desc_11.appendChild(
    core.create_el(
      "p",
      {},
      "State lives in markdown — push to main triggers GitHub Actions that reconcile to Jira/SDP. No webhooks, no message bus, no orchestrator. Just files + CI.",
    ),
  );
  panel_1.appendChild(desc_11);
  return panel_1;
};
var lane_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el(
      "h3",
      { class: "panel-title" },
      "🎛 Kanban Flow — 6 Lanes, WIP = 1 each",
    ),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable([
    "",
    "Lane",
    "System",
    "WIP",
    "Example Work",
  ])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(lanes)) {
    const l_9 = G__8;
    const row_10 = core.create_el("tr", {});
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "font-size:1.5rem;text-align:center" },
        squint_core.get(l_9, "tag"),
      ),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "font-weight:600" },
        squint_core.get(l_9, "name"),
      ),
    );
    row_10.appendChild(
      core.create_el("td", {}, squint_core.get(l_9, "system")),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "text-align:center" },
        `${squint_core.get(l_9, "wip") ?? ""}`,
      ),
    );
    row_10.appendChild(
      core.create_el(
        "td",
        { style: "color:var(--clr-text-muted)" },
        squint_core.get(l_9, "example"),
      ),
    );
    row_10.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${squint_core.get(l_9, "tag") ?? ""}${" "}${squint_core.get(l_9, "name") ?? ""}${" — "}${squint_core.get(l_9, "example") ?? ""}`,
      );
    });
    tbody_7.appendChild(row_10);
  }
  table_2.appendChild(tbody_7);
  panel_1.appendChild(table_2);
  return panel_1;
};
var stats_panel = function () {
  const panel_1 = core.create_el("div", { class: "panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "panel-title" }, "📦 Repo Anatomy"),
  );
  panel_1.appendChild(
    core.create_el(
      "p",
      { class: "panel-sub" },
      "Open-source workflow toolkit — Copilot CLI skills + instructions + scripts + GitHub Actions. Bring your own .env, drop into any new repo.",
    ),
  );
  const tree_2 = core.create_el(
    "pre",
    {
      class: "code-block",
      style: "background:#0a0a2a;color:#9cdcfe;padding:1rem;border-radius:6px",
    },
    `${"workflow-toolkit/\n"}${"├── .github/skills/         (27 skills · daily routines + specialists)\n"}${"├── .github/instructions/   (19 file-pattern-scoped rules)\n"}${"├── .github/workflows/      (12 CI sync jobs · Jira, SDP, Confluence)\n"}${"├── scripts/                (80 Python/PowerShell/Babashka tools)\n"}${"├── .env.example            (Jira · Confluence · SDP · Azure · GitHub · Teams)\n"}${"├── CONTRIBUTING.md         (skill / instruction / script guidelines)\n"}${"└── README.md               (mental model + daily workflow + skill ref)\n"}`,
  );
  panel_1.appendChild(tree_2);
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
var workflow_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  const tab_body_2 = core.create_el("div", { class: "tab-body" });
  const render_tab_3 = function (tab) {
    tab_body_2.innerHTML = "";
    return tab_body_2.appendChild(
      (() => {
        const G__44_4 = tab;
        switch (G__44_4) {
          case "skills":
            return skills_panel();

            break;
          case "flow":
            return flow_panel();

            break;
          case "lanes":
            return lane_panel();

            break;
          case "stats":
            return stats_panel();

            break;
          default:
            throw new Error(`${"No matching clause: "}${G__44_4 ?? ""}`);
        }
      })(),
    );
  };
  container_1.appendChild(
    core.create_el("h1", { class: "dashboard-title" }, "Workflow Toolkit"),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "File-driven AI-assisted ops — open source on GitHub at acestus/workflow-toolkit",
    ),
  );
  container_1.appendChild(metrics_panel());
  const tabs_6 = core.create_el("div", { class: "tab-bar" });
  for (let G__7 of squint_core.iterable([
    ["Skills", "skills"],
    ["Daily Flow", "flow"],
    ["Lane Board", "lanes"],
    ["Repo Stats", "stats"],
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
  render_tab_3("skills");
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "workflow",
      "/articles/workflow-toolkit.html",
      "web/modules/portfolio/pro/workflow.js",
      workflow_content(),
    ),
  );
};

export { init };
