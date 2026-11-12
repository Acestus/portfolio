import * as squint_core from "../../../runtime/core.js";
import * as core from "./../core.js";
import * as portfolio_DOT_core from "./../core.js";
import * as ui from "./../components.js";
import * as portfolio_DOT_components from "./../components.js";
var policies = [
  {
    name: "Require resource tags",
    effect: "deny",
    scope: "Tenant Root",
    compliance: 94,
  },
  {
    name: "Deploy AMA on VMs",
    effect: "dine",
    scope: "All Subscriptions",
    compliance: 87,
  },
  {
    name: "Enforce TLS 1.2 on storage",
    effect: "deny",
    scope: "All Subscriptions",
    compliance: 100,
  },
  {
    name: "Append diagnostic settings",
    effect: "modify",
    scope: "All Subscriptions",
    compliance: 92,
  },
  {
    name: "Allowed VM SKUs",
    effect: "deny",
    scope: "Corp-530-EDM",
    compliance: 100,
  },
  {
    name: "Key Vault soft-delete required",
    effect: "deny",
    scope: "All Subscriptions",
    compliance: 100,
  },
  {
    name: "Public network access denied",
    effect: "deny",
    scope: "All Subscriptions",
    compliance: 78,
  },
  {
    name: "Enforce private endpoints",
    effect: "audit",
    scope: "Corp-520-AppDev",
    compliance: 65,
  },
  {
    name: "Auto-tag cost center",
    effect: "modify",
    scope: "Tenant Root",
    compliance: 96,
  },
  {
    name: "Deploy NSG flow logs",
    effect: "dine",
    scope: "Connectivity",
    compliance: 88,
  },
];
var effect_colors = {
  deny: "#ff0040",
  modify: "#ffaa00",
  audit: "#0078d4",
  dine: "#00a86b",
};
var effect_labels = {
  deny: "Deny",
  modify: "Modify",
  audit: "Audit",
  dine: "DeployIfNotExists",
};
var effect_badge = function (effect) {
  return core.create_el(
    "span",
    {
      class: "effect-badge",
      style: `${"background:"}${squint_core.get(effect_colors, effect, "#888") ?? ""}`,
    },
    squint_core.get(effect_labels, effect, "Unknown"),
  );
};
var compliance_bar = function (pct) {
  const container_1 = core.create_el("div", { class: "compliance-bar" });
  const fill_2 = core.create_el("div", {
    class: "compliance-fill",
    style: `${"width:"}${pct ?? ""}${"%;background:"}${(pct >= 90 ? "#00a86b" : pct >= 70 ? "#ffaa00" : "else" ? "#ff0040" : null) ?? ""}`,
  });
  container_1.appendChild(fill_2);
  return container_1;
};
var policy_row = function (policy) {
  const row_1 = core.create_el("div", { class: "policy-row" });
  row_1.appendChild(
    core.create_el(
      "div",
      { class: "policy-name" },
      squint_core.get(policy, "name"),
    ),
  );
  row_1.appendChild(effect_badge(squint_core.get(policy, "effect")));
  row_1.appendChild(
    core.create_el(
      "div",
      { class: "policy-scope" },
      squint_core.get(policy, "scope"),
    ),
  );
  row_1.appendChild(compliance_bar(squint_core.get(policy, "compliance")));
  row_1.appendChild(
    core.create_el(
      "div",
      { class: "policy-pct" },
      `${squint_core.get(policy, "compliance") ?? ""}${"%"}`,
    ),
  );
  row_1.addEventListener("click", function (_) {
    row_1.classList.toggle("policy-expanded");
    return core.toast_BANG_(
      `${(squint_core.get(policy, "compliance") >= 90 ? "✅ " : "⚠️ ") ?? ""}${squint_core.get(policy, "name") ?? ""}${" — "}${squint_core.get(policy, "compliance") ?? ""}${"% compliant across "}${squint_core.get(policy, "scope") ?? ""}`,
    );
  });
  return row_1;
};
var summary_cards = function () {
  const panel_1 = core.create_el("div", { class: "metrics-row" });
  for (let G__2 of squint_core.iterable([
    ["Total Policies", "10", "#0078d4"],
    ["Compliant", "6", "#00a86b"],
    ["Needs Remediation", "3", "#ffaa00"],
    ["Critical", "1", "#ff0040"],
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
var filter_bar = function (state, container) {
  const bar_1 = core.create_el("div", { class: "filter-bar" });
  for (let G__2 of squint_core.iterable([
    "all",
    "deny",
    "modify",
    "audit",
    "dine",
  ])) {
    const effect_3 = G__2;
    const label_4 =
      effect_3 === "all" ? "All" : squint_core.get(effect_labels, effect_3);
    const btn_5 = core.create_el(
      "button",
      {
        class: `filter-btn${(squint_core._EQ_(effect_3, squint_core.get(squint_core.deref(state), "filter")) ? " active" : null) ?? ""}`,
      },
      label_4,
    );
    btn_5.addEventListener("click", function (_) {
      squint_core.swap_BANG_(state, squint_core.assoc, "filter", effect_3);
      const list_6 = container.querySelector(".policy-list");
      list_6.innerHTML = "";
      for (let G__7 of squint_core.iterable(
        effect_3 === "all"
          ? policies
          : squint_core.filter(function (_PERCENT_1) {
              return squint_core._EQ_(
                squint_core.get(_PERCENT_1, "effect"),
                effect_3,
              );
            }, policies),
      )) {
        const p_8 = G__7;
        list_6.appendChild(policy_row(p_8));
      }
      return null;
    });
    bar_1.appendChild(btn_5);
  }
  return bar_1;
};
var policy_content = function () {
  const container_1 = core.create_el("div", { class: "dashboard-container" });
  const state_2 = squint_core.atom({ filter: "all" });
  container_1.appendChild(
    core.create_el(
      "h1",
      { class: "dashboard-title" },
      "Azure Policy Governance",
    ),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "dashboard-subtitle" },
      "Tenant-wide policy assignments — deny, modify, audit, and deploy-if-not-exists",
    ),
  );
  container_1.appendChild(summary_cards());
  container_1.appendChild(filter_bar(state_2, container_1));
  const list_3 = core.create_el("div", { class: "policy-list" });
  for (let G__4 of squint_core.iterable(policies)) {
    const p_5 = G__4;
    list_3.appendChild(policy_row(p_5));
  }
  container_1.appendChild(list_3);
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell(
      "policy",
      "/articles/policy-dashboard.html",
      "web/modules/portfolio/pro/policy.js",
      policy_content(),
    ),
  );
};

export { init };
