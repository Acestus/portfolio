import * as squint_core from "../../../runtime/core.js";
import * as str from "../../../runtime/string.js";
import * as clojure_DOT_string from "../../../runtime/string.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var internet_stack = [
  {
    layer: "Application",
    protocols: ["HTTP", "SMTP", "FTP", "DNS"],
    color: "#0078d4",
    era: "1991–",
    desc: "Rules for exchanging documents, email, files — the verbs of the web",
  },
  {
    layer: "Presentation",
    protocols: ["HTML", "CSS", "JSON", "XML"],
    color: "#106ebe",
    era: "1993–",
    desc: "How data is structured and rendered — the shared vocabulary",
  },
  {
    layer: "Session",
    protocols: ["TLS/SSL", "Cookies", "OAuth"],
    color: "#005a9e",
    era: "1995–",
    desc: "Identity, trust, and persistent connections",
  },
  {
    layer: "Transport",
    protocols: ["TCP", "UDP", "WebSocket"],
    color: "#004578",
    era: "1983–",
    desc: "Reliable delivery of packets between endpoints",
  },
  {
    layer: "Network",
    protocols: ["IP", "ICMP", "BGP"],
    color: "#003356",
    era: "1974–",
    desc: "Addressing and routing across networks",
  },
];
var agentic_stack = [
  {
    layer: "Agent",
    protocols: ["OpenClaw", "Cursor", "Copilot"],
    color: "#00a86b",
    era: "2025–",
    desc: "Autonomous agents that reason, plan, and act — composing APIs like developers do",
  },
  {
    layer: "Interface",
    protocols: ["REST", "GraphQL", "CLI", "gRPC"],
    color: "#00875a",
    era: "2000–",
    desc: "The same APIs humans use — agents call them directly, no translation layer needed",
  },
  {
    layer: "Auth",
    protocols: ["OAuth 2.0", "API Keys", "OIDC"],
    color: "#006644",
    era: "2012–",
    desc: "Standard auth — agents authenticate like any other client, with scoped permissions",
  },
  {
    layer: "Transport",
    protocols: ["HTTPS", "SSE", "WebSocket"],
    color: "#004d33",
    era: "2000–",
    desc: "The same web transport — agents are just another HTTP client",
  },
  {
    layer: "Network",
    protocols: ["TCP/IP", "DNS", "CDN"],
    color: "#003322",
    era: "1974–",
    desc: "The same internet infrastructure — no new protocol required",
  },
];
var parallels = [
  {
    internet: "HTTP gave us a universal API for document exchange",
    agentic: "REST/GraphQL give agents the same universal API surface",
    insight:
      "Agents don't need a new protocol — they need to use the APIs we already have",
  },
  {
    internet: "curl made HTTP composable from the command line",
    agentic: "CLI tools make every service composable for agents",
    insight:
      "The Unix philosophy: small tools, stdin/stdout, pipes — agents thrive on this",
  },
  {
    internet: "Browsers became the universal client for humans",
    agentic: "OpenClaw is becoming the universal client for AI",
    insight:
      "One client that wields APIs and CLIs like a skilled developer would",
  },
  {
    internet: "URLs made every resource addressable",
    agentic: "API endpoints make every capability callable",
    insight:
      "Addressability enables composition — no proprietary wrappers needed",
  },
  {
    internet: "Open standards prevented vendor lock-in",
    agentic: "Open-source agents + standard APIs prevent AI lock-in",
    insight:
      "Steinberger's bet: APIs are the stable interface, not bespoke agent protocols",
  },
];
var timeline = [
  {
    year: "1974",
    event: "TCP/IP",
    side: "internet",
    desc: "Vint Cerf & Bob Kahn design the packet protocol",
  },
  {
    year: "1991",
    event: "HTTP + HTML",
    side: "internet",
    desc: "Tim Berners-Lee publishes the first web page",
  },
  {
    year: "1993",
    event: "Mosaic",
    side: "internet",
    desc: "The first graphical browser — the web goes visual",
  },
  {
    year: "2000",
    event: "REST",
    side: "internet",
    desc: "Roy Fielding's dissertation — the web as an API platform",
  },
  {
    year: "2015",
    event: "GraphQL",
    side: "internet",
    desc: "Facebook open-sources GraphQL — query what you need",
  },
  {
    year: "2025",
    event: "OpenClaw",
    side: "agentic",
    desc: "Steinberger's open-source agent — calls APIs and CLIs directly",
  },
  {
    year: "2026",
    event: "API-First Agents",
    side: "agentic",
    desc: "The industry converges: agents as API consumers, not protocol inventors",
  },
  {
    year: "202X",
    event: "Agent Web",
    side: "agentic",
    desc: "Agents compose APIs like developers — the agentic web emerges",
  },
];
var api_vs_protocol = [
  {
    aspect: "Integration cost",
    api: "Zero — use existing endpoints",
    protocol: "High — build adapters for each tool server",
  },
  {
    aspect: "Auth model",
    api: "Standard OAuth/OIDC/API keys",
    protocol: "Custom auth per protocol implementation",
  },
  {
    aspect: "Debugging",
    api: "curl, Postman, browser devtools",
    protocol: "Specialized protocol inspectors",
  },
  {
    aspect: "Ecosystem",
    api: "Millions of REST/GraphQL APIs",
    protocol: "Only tools that implement the protocol",
  },
  {
    aspect: "CLI composability",
    api: "Pipe stdout → agent → API call",
    protocol: "Requires protocol-specific adapters",
  },
  {
    aspect: "Maturity",
    api: "25+ years of battle-tested infra",
    protocol: "Months old, rapidly changing specs",
  },
];
var stack_layer = function (p__41, side) {
  const map___1_3 = p__41;
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const layer_5 = squint_core.get(map___1_4, "layer");
  const protocols_6 = squint_core.get(map___1_4, "protocols");
  const color_7 = squint_core.get(map___1_4, "color");
  const desc_8 = squint_core.get(map___1_4, "desc");
  const el_9 = core.create_el(
    "div",
    {
      class: "agent-card",
      style: `${"border-left:4px solid "}${color_7 ?? ""}${";cursor:pointer"}`,
    },
    core.create_el(
      "div",
      {},
      core.create_el(
        "div",
        { class: "agent-name", style: `${"color:"}${color_7 ?? ""}` },
        layer_5,
      ),
      core.create_el(
        "div",
        { class: "agent-desc" },
        core.create_el(
          "span",
          { style: "font-weight:600" },
          str.join(" · ", protocols_6),
        ),
      ),
      core.create_el("div", { class: "agent-desc" }, desc_8),
    ),
  );
  el_9.addEventListener("click", function (_) {
    return core.toast_BANG_(
      `${(side === "internet" ? "🌐" : "🤖") ?? ""}${" "}${layer_5 ?? ""}${" → "}${squint_core.first(protocols_6) ?? ""}`,
    );
  });
  return el_9;
};
var protocol_stacks = function () {
  const panel_1 = core.create_el("div", {
    style: "display:grid;grid-template-columns:1fr 1fr;gap:var(--space-m)",
  });
  const col_2 = core.create_el("div", {});
  col_2.appendChild(
    core.create_el(
      "h3",
      { class: "whatif-title", style: "border-left-color:#0078d4" },
      "🌐 Internet Stack",
    ),
  );
  for (let G__3 of squint_core.iterable(internet_stack)) {
    const layer_4 = G__3;
    col_2.appendChild(stack_layer(layer_4, "internet"));
  }
  panel_1.appendChild(col_2);
  const col_5 = core.create_el("div", {});
  col_5.appendChild(
    core.create_el(
      "h3",
      { class: "whatif-title", style: "border-left-color:#00a86b" },
      "🤖 Agentic Stack",
    ),
  );
  for (let G__6 of squint_core.iterable(agentic_stack)) {
    const layer_7 = G__6;
    col_5.appendChild(stack_layer(layer_7, "agentic"));
  }
  panel_1.appendChild(col_5);
  return panel_1;
};
var api_comparison_panel = function () {
  const panel_1 = core.create_el("div", { class: "whatif-panel" });
  panel_1.appendChild(
    core.create_el(
      "h3",
      { class: "whatif-title" },
      "⚡ APIs vs Bespoke Protocols",
    ),
  );
  panel_1.appendChild(
    core.create_el(
      "blockquote",
      {
        style:
          "border-left:3px solid #00a86b;padding-left:0.75rem;color:#605e5c;font-style:italic;margin-block:0.5rem 1rem;font-size:var(--step--1)",
      },
      '"Why invent a new protocol when every service already has an API? Agents should call APIs — the same way developers do." — Peter Steinberger',
    ),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable([
    "",
    "📡 Direct API / CLI",
    "📦 Bespoke Protocol",
  ])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(api_vs_protocol)) {
    const map___9_11 = G__8;
    const map___9_12 = squint_core.truth_(
      squint_core.sequential_QMARK_(map___9_11),
    )
      ? squint_core.truth_(squint_core.vector_QMARK_(map___9_11))
        ? map___9_11
        : squint_core.seq_to_map_for_destructuring(map___9_11)
      : map___9_11;
    const aspect_13 = squint_core.get(map___9_12, "aspect");
    const api_14 = squint_core.get(map___9_12, "api");
    const protocol_15 = squint_core.get(map___9_12, "protocol");
    const row_16 = core.create_el("tr", {});
    row_16.appendChild(
      core.create_el("td", { style: "font-weight:600" }, aspect_13),
    );
    row_16.appendChild(
      core.create_el("td", { style: "color:#00a86b" }, api_14),
    );
    row_16.appendChild(
      core.create_el("td", { style: "color:#888" }, protocol_15),
    );
    row_16.addEventListener("click", function (_) {
      for (let G__17 of squint_core.iterable(
        Array.from(tbody_7.querySelectorAll(".row-selected")),
      )) {
        const el_18 = G__17;
        el_18.classList.remove("row-selected");
      }
      row_16.classList.add("row-selected");
      return core.toast_BANG_(`${"⚡ "}${aspect_13 ?? ""}${" — API wins"}`);
    });
    tbody_7.appendChild(row_16);
  }
  table_2.appendChild(tbody_7);
  panel_1.appendChild(table_2);
  return panel_1;
};
var parallels_panel = function () {
  const panel_1 = core.create_el("div", { class: "whatif-panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "whatif-title" }, "🔗 The Parallel"),
  );
  const table_2 = core.create_el("table", { class: "log-table" });
  const thead_3 = core.create_el("thead", {});
  const hrow_4 = core.create_el("tr", {});
  for (let G__5 of squint_core.iterable([
    "🌐 Internet",
    "🤖 Agentic AI",
    "💡 Insight",
  ])) {
    const h_6 = G__5;
    hrow_4.appendChild(core.create_el("th", {}, h_6));
  }
  thead_3.appendChild(hrow_4);
  table_2.appendChild(thead_3);
  const tbody_7 = core.create_el("tbody", {});
  for (let G__8 of squint_core.iterable(parallels)) {
    const map___9_11 = G__8;
    const map___9_12 = squint_core.truth_(
      squint_core.sequential_QMARK_(map___9_11),
    )
      ? squint_core.truth_(squint_core.vector_QMARK_(map___9_11))
        ? map___9_11
        : squint_core.seq_to_map_for_destructuring(map___9_11)
      : map___9_11;
    const internet_13 = squint_core.get(map___9_12, "internet");
    const agentic_14 = squint_core.get(map___9_12, "agentic");
    const insight_15 = squint_core.get(map___9_12, "insight");
    const row_16 = core.create_el("tr", {});
    row_16.appendChild(core.create_el("td", {}, internet_13));
    row_16.appendChild(core.create_el("td", {}, agentic_14));
    row_16.appendChild(
      core.create_el(
        "td",
        { style: "font-style:italic;color:#605e5c" },
        insight_15,
      ),
    );
    row_16.addEventListener("click", function (_) {
      for (let G__17 of squint_core.iterable(
        Array.from(tbody_7.querySelectorAll(".row-selected")),
      )) {
        const el_18 = G__17;
        el_18.classList.remove("row-selected");
      }
      row_16.classList.add("row-selected");
      return core.toast_BANG_(`${"💡 "}${insight_15 ?? ""}`);
    });
    tbody_7.appendChild(row_16);
  }
  table_2.appendChild(tbody_7);
  panel_1.appendChild(table_2);
  return panel_1;
};
var timeline_panel = function () {
  const panel_1 = core.create_el("div", { class: "naming-panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "naming-title" }, "📅 Convergent Evolution"),
  );
  const rail_2 = core.create_el("div", {
    style:
      "display:flex;flex-direction:column;gap:var(--space-2xs);position:relative;padding-left:var(--space-xl)",
  });
  const line_3 = core.create_el("div", {
    style:
      "position:absolute;left:1rem;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,#0078d4 62%,#00a86b 62%)",
  });
  rail_2.appendChild(line_3);
  for (let G__4 of squint_core.iterable(timeline)) {
    const map___5_7 = G__4;
    const map___5_8 = squint_core.truth_(
      squint_core.sequential_QMARK_(map___5_7),
    )
      ? squint_core.truth_(squint_core.vector_QMARK_(map___5_7))
        ? map___5_7
        : squint_core.seq_to_map_for_destructuring(map___5_7)
      : map___5_7;
    const year_9 = squint_core.get(map___5_8, "year");
    const event_10 = squint_core.get(map___5_8, "event");
    const side_11 = squint_core.get(map___5_8, "side");
    const desc_12 = squint_core.get(map___5_8, "desc");
    const color_13 = side_11 === "internet" ? "#0078d4" : "#00a86b";
    const dot_14 = core.create_el("div", {
      style: `${"position:absolute;left:0.65rem;width:12px;height:12px;border-radius:50%;background:"}${color_13 ?? ""}${";border:2px solid #fff"}`,
    });
    const entry_15 = core.create_el(
      "div",
      {
        class: "agent-card",
        style: `${"border-left:3px solid "}${color_13 ?? ""}${";position:relative"}`,
      },
      core.create_el(
        "div",
        {},
        core.create_el(
          "div",
          { class: "agent-name" },
          core.create_el(
            "span",
            { style: `${"color:"}${color_13 ?? ""}${";margin-right:0.5rem"}` },
            year_9,
          ),
          event_10,
        ),
        core.create_el("div", { class: "agent-desc" }, desc_12),
      ),
    );
    entry_15.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${(side_11 === "internet" ? "🌐" : "🤖") ?? ""}${" "}${year_9 ?? ""}${" — "}${event_10 ?? ""}`,
      );
    });
    entry_15.appendChild(dot_14);
    rail_2.appendChild(entry_15);
  }
  panel_1.appendChild(rail_2);
  return panel_1;
};
var thesis_panel = function () {
  const panel_1 = core.create_el("div", { class: "kql-panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "kql-title" }, "🦞 The OpenClaw Thesis"),
  );
  panel_1.appendChild(
    core.create_el(
      "div",
      { style: "font-size:var(--step-0);line-height:1.8;color:#323130" },
      core.create_el(
        "p",
        { style: "margin-block-end:var(--space-m)" },
        "Peter Steinberger's insight: agents don't need a new protocol — they need to be great API consumers. Every service already exposes REST endpoints, GraphQL schemas, and CLI tools. The agent's job is to read docs, authenticate, call APIs, and compose results — exactly what a senior developer does, at machine speed.",
      ),
      core.create_el(
        "p",
        { style: "margin-block-end:var(--space-m)" },
        "OpenClaw embodies this philosophy. It calls APIs directly over HTTPS, shells out to CLIs via subprocess, reads man pages and --help output, and composes tools the Unix way. No middleware protocol, no adapter servers — just the APIs as they already exist.",
      ),
      core.create_el(
        "p",
        {},
        "The internet was built on open, simple interfaces: HTTP, HTML, CSS. The agentic web will be built on the same foundation — REST APIs, CLI tools, and OAuth. The best interface for an agent is the same interface a developer would use.",
      ),
    ),
  );
  return panel_1;
};
var cli_demo_panel = function () {
  const panel_1 = core.create_el("div", { class: "kql-panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "kql-title" }, "🖥️ Agent as Developer"),
  );
  panel_1.appendChild(
    core.create_el(
      "pre",
      { class: "kql-code" },
      `${"# OpenClaw: thinking like a developer\n"}${"$ az group list --output json          # REST API via CLI\n"}${'$ curl -H "Authorization: Bearer $TOK" \\\n'}${"    https://graph.microsoft.com/v1.0/me # Direct API call\n"}${"$ gh pr list --json number,title        # GitHub CLI\n"}${"$ kubectl get pods -o json              # K8s API via CLI\n"}${"$ fabric pipeline run --workspace prod  # Fabric CLI\n\n"}${"# No protocol adapters. No middleware.\n"}${"# Just APIs and CLIs — the same tools you'd use."}`,
    ),
  );
  return panel_1;
};
var agentic_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  container_1.appendChild(
    core.create_el("h1", { class: "dashboard-title" }, "The Agentic Web"),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "How OpenClaw and modern APIs are building the next internet — agents as API consumers, not protocol inventors",
    ),
  );
  const metrics_2 = core.create_el("div", { class: "metrics-row" });
  for (let G__3 of squint_core.iterable([
    ["Interface", "REST + CLI", "#00a86b"],
    ["Agent", "OpenClaw", "#0078d4"],
    ["LLM Backends", "Any", "#b8860b"],
    ["Data Privacy", "Local", "#00a86b"],
  ])) {
    const vec___4_7 = G__3;
    const label_8 = squint_core.nth(vec___4_7, 0, null);
    const value_9 = squint_core.nth(vec___4_7, 1, null);
    const color_10 = squint_core.nth(vec___4_7, 2, null);
    metrics_2.appendChild(
      core.create_el(
        "div",
        { class: "metric-card" },
        core.create_el(
          "div",
          { class: "metric-value", style: `${"color:"}${color_10 ?? ""}` },
          value_9,
        ),
        core.create_el("div", { class: "metric-label" }, label_8),
      ),
    );
  }
  container_1.appendChild(metrics_2);
  container_1.appendChild(protocol_stacks());
  container_1.appendChild(api_comparison_panel());
  container_1.appendChild(cli_demo_panel());
  container_1.appendChild(parallels_panel());
  container_1.appendChild(timeline_panel());
  container_1.appendChild(thesis_panel());
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "agentic",
      "/articles/agentic-web.html",
      "web/modules/portfolio/pro/agentic.js",
      agentic_content(),
    ),
  );
};

export { init };
