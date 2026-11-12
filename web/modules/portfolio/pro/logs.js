import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var pipeline_nodes = [
  { id: "apps", label: "Clojure Functions", color: "#FFB6C1", icon: "λ" },
  { id: "eventhub", label: "Event Hub", color: "#ADD8E6", icon: "📡" },
  { id: "stream", label: "Eventstream", color: "#E0FFFF", icon: "🌊" },
  { id: "raw", label: "transaction_raw", color: "#F5DEB3", icon: "📥" },
  { id: "parsed", label: "transaction_parsed", color: "#E8E8E8", icon: "⚙" },
  { id: "gold", label: "Gold Lakehouse", color: "#FFF8DC", icon: "🥇" },
];
var utc_ts = function () {
  const d_1 = new Date();
  const pad2_2 = function (_PERCENT_1) {
    if (_PERCENT_1 < 10) {
      return `0${_PERCENT_1 ?? ""}`;
    } else {
      return `${_PERCENT_1 ?? ""}`;
    }
  };
  const pad3_3 = function (_PERCENT_1) {
    if (_PERCENT_1 < 10) {
      return `00${_PERCENT_1 ?? ""}`;
    } else {
      if (_PERCENT_1 < 100) {
        return `0${_PERCENT_1 ?? ""}`;
      } else {
        if ("else") {
          return `${_PERCENT_1 ?? ""}`;
        } else {
          return null;
        }
      }
    }
  };
  return `${pad2_2(d_1.getUTCHours()) ?? ""}${":"}${pad2_2(d_1.getUTCMinutes()) ?? ""}${":"}${pad2_2(d_1.getUTCSeconds()) ?? ""}${"."}${pad3_3(d_1.getUTCMilliseconds()) ?? ""}`;
};
var sample_logs = [
  { level: "INFO", app: "svc-orders", msg: "POST /api/orders → 201 (42ms)" },
  {
    level: "INFO",
    app: "svc-payments",
    msg: "Payment processed txn=a8f3 amount=149.99",
  },
  {
    level: "WARN",
    app: "svc-orders",
    msg: "Retry #2 for downstream notification",
  },
  {
    level: "INFO",
    app: "svc-inventory",
    msg: "Stock decremented sku=WDG-4401 qty=1",
  },
  {
    level: "ERROR",
    app: "svc-shipping",
    msg: "Address validation timeout after 5000ms",
  },
  { level: "INFO", app: "svc-orders", msg: "POST /api/orders → 201 (38ms)" },
  {
    level: "INFO",
    app: "svc-payments",
    msg: "Payment processed txn=b2c1 amount=89.50",
  },
  {
    level: "INFO",
    app: "svc-orders",
    msg: "GET /api/orders/a8f3 → 200 (12ms)",
  },
];
var kql_panel = function () {
  const panel_1 = core.create_el("div", { class: "kql-panel" });
  panel_1.appendChild(
    core.create_el("h3", { class: "kql-title" }, "KQL Update Policy"),
  );
  panel_1.appendChild(
    core.create_el(
      "pre",
      { class: "kql-code" },
      `${".create-or-alter function TransformRawLogs() {\n"}${"  transaction_raw\n"}${"  | extend parsed_ts = todatetime(raw_timestamp)\n"}${"  | extend app_name = extract('app=([\\\\w-]+)', 1, raw_message)\n"}${"  | extend log_level = extract('level=(\\\\w+)', 1, raw_message)\n"}${"  | extend http_status = toint(extract('→ (\\\\d+)', 1, raw_message))\n"}${"  | project parsed_ts, app_name, log_level, http_status, raw_message\n"}${"}"}`,
    ),
  );
  return panel_1;
};
var log_stream = function (logs) {
  const container_1 = core.create_el("div", { class: "log-stream" });
  const title_2 = core.create_el(
    "h3",
    { class: "log-title" },
    "📡 Live Log Stream",
  );
  container_1.appendChild(title_2);
  const stream_3 = core.create_el("div", { class: "stream-body" });
  for (let G__4 of squint_core.iterable(logs)) {
    const log_5 = G__4;
    const level_cls_6 = (() => {
      const G__29_7 = squint_core.get(log_5, "level");
      switch (G__29_7) {
        case "ERROR":
          return "log-error";

          break;
        case "WARN":
          return "log-warn";

          break;
        default:
          return "log-info";
      }
    })();
    stream_3.appendChild(
      (() => {
        const line_9 = core.create_el(
          "div",
          { class: `${"log-line "}${level_cls_6 ?? ""}` },
          core.create_el("span", { class: "log-ts" }, utc_ts()),
          core.create_el(
            "span",
            { class: "log-level" },
            squint_core.get(log_5, "level"),
          ),
          core.create_el(
            "span",
            { class: "log-app" },
            squint_core.get(log_5, "app"),
          ),
          core.create_el(
            "span",
            { class: "log-msg" },
            squint_core.get(log_5, "msg"),
          ),
        );
        line_9.addEventListener("click", function (_) {
          for (let G__10 of squint_core.iterable(
            Array.from(stream_3.querySelectorAll(".log-selected")),
          )) {
            const el_11 = G__10;
            el_11.classList.remove("log-selected");
          }
          line_9.classList.add("log-selected");
          return core.toast_BANG_(
            `${"📋 "}${squint_core.get(log_5, "app") ?? ""}${" ["}${squint_core.get(log_5, "level") ?? ""}${"] "}${squint_core.get(log_5, "msg") ?? ""}`,
          );
        });
        return line_9;
      })(),
    );
  }
  container_1.appendChild(stream_3);
  return container_1;
};
var flow_diagram = function () {
  const flow_1 = core.create_el("div", { class: "pipeline-flow" });
  for (let G__2 of squint_core.iterable(
    squint_core.map_indexed(squint_core.vector, pipeline_nodes),
  )) {
    const vec___3_6 = G__2;
    const i_7 = squint_core.nth(vec___3_6, 0, null);
    const node_8 = squint_core.nth(vec___3_6, 1, null);
    if (i_7 > 0) {
      flow_1.appendChild(core.create_el("div", { class: "flow-arrow" }, "→"));
    }
    const card_9 = core.create_el(
      "div",
      {
        class: "stage-card",
        style: `${"border-left: 4px solid "}${squint_core.get(node_8, "color") ?? ""}`,
      },
      core.create_el(
        "div",
        { class: "stage-header" },
        core.create_el(
          "span",
          { class: "stage-icon" },
          squint_core.get(node_8, "icon"),
        ),
        core.create_el(
          "span",
          { class: "stage-label" },
          squint_core.get(node_8, "label"),
        ),
      ),
    );
    card_9.addEventListener("click", function (_) {
      return core.toast_BANG_(
        `${squint_core.get(node_8, "icon") ?? ""}${" "}${squint_core.get(node_8, "label") ?? ""}${" — stage "}${i_7 + 1}${" of "}${squint_core.count(pipeline_nodes) ?? ""}`,
      );
    });
    flow_1.appendChild(card_9);
  }
  return flow_1;
};
var logs_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  container_1.appendChild(
    core.create_el(
      "h1",
      { class: "dashboard-title" },
      "Real-Time Log Pipeline",
    ),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "Clojure Functions → Event Hub → Eventstream → Eventhouse (KQL) → Gold Lakehouse",
    ),
  );
  const metrics_2 = core.create_el("div", { class: "metrics-row" });
  for (let G__3 of squint_core.iterable([
    ["Events/sec", "247", "#0078d4"],
    ["Parse latency", "< 2s", "#00a86b"],
    ["Error rate", "0.3%", "#ff0040"],
    ["KQL tables", "2", "#b8860b"],
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
  container_1.appendChild(flow_diagram());
  container_1.appendChild(kql_panel());
  container_1.appendChild(log_stream(sample_logs));
  setInterval(function () {
    const body_11 = container_1.querySelector(".stream-body");
    if (squint_core.truth_(body_11)) {
      const new_log_12 = squint_core.rand_nth(sample_logs);
      const level_cls_13 = (() => {
        const G__30_14 = squint_core.get(new_log_12, "level");
        switch (G__30_14) {
          case "ERROR":
            return "log-error";

            break;
          case "WARN":
            return "log-warn";

            break;
          default:
            return "log-info";
        }
      })();
      const line_16 = core.create_el(
        "div",
        { class: `${"log-line "}${level_cls_13 ?? ""}${" log-new"}` },
        core.create_el("span", { class: "log-ts" }, utc_ts()),
        core.create_el(
          "span",
          { class: "log-level" },
          squint_core.get(new_log_12, "level"),
        ),
        core.create_el(
          "span",
          { class: "log-app" },
          squint_core.get(new_log_12, "app"),
        ),
        core.create_el(
          "span",
          { class: "log-msg" },
          squint_core.get(new_log_12, "msg"),
        ),
      );
      body_11.insertBefore(line_16, body_11.firstChild);
      if (body_11.childElementCount > 15) {
        return body_11.removeChild(body_11.lastChild);
      }
    }
  }, 1500);
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "logs",
      "/articles/log-pipeline.html",
      "web/modules/portfolio/pro/logs.js",
      logs_content(),
    ),
  );
};

export { init };
