import * as squint_core from "../../runtime/core.js";
import * as core from "./core.js";
import * as portfolio_DOT_core from "./core.js";
import * as ui from "./components.js";
import * as portfolio_DOT_components from "./components.js";
import * as str from "../../runtime/string.js";
import * as clojure_DOT_string from "../../runtime/string.js";
var apps = [
  {
    category: "🕹 Retro Arcade",
    items: [
      {
        title: "Cloud Platformer",
        href: "/platformer.html",
        icon: "🏔",
        desc: "Navigate cloud infrastructure in 8-bit glory",
      },
      {
        title: "Space Invaders",
        href: "/invaders.html",
        icon: "👾",
        desc: "Defend against security misconfigurations",
      },
      {
        title: "CAF Naming Puzzle",
        href: "/matcher.html",
        icon: "🧩",
        desc: "Match resources to CAF-compliant names",
      },
      {
        title: "Tech Breakout",
        href: "/breakout.html",
        icon: "🧱",
        desc: "Smash through tech-themed bricks",
      },
      {
        title: "Cloud Lift",
        href: "/helicopter.html",
        icon: "☁️",
        desc: "Migrate workloads to the cloud, one rescue at a time",
      },
    ],
  },
  {
    category: "🆕 Microsoft Build 2026",
    items: [
      {
        title: "Workflow Toolkit",
        href: "/workflow.html",
        icon: "🧰",
        desc: "File-driven AI ops — open source on GitHub",
      },
      {
        title: "Copilot-Ops Console",
        href: "/copilotops.html",
        icon: "🤖",
        desc: "Rounds · voice wall · markdown↔API sync",
      },
      {
        title: "Fabric Capacity Tuner",
        href: "/fabriccap.html",
        icon: "🧵",
        desc: "Size F-SKUs · simulate 430 throttling · cut waste",
      },
      {
        title: "Pricing Optimizer",
        href: "/pricing.html",
        icon: "💰",
        desc: "Azure · Fabric · AI Foundry FinOps with RI/SP",
      },
    ],
  },
  {
    category: "📊 Professional",
    items: [
      {
        title: "Fabric Pipeline",
        href: "/fabric.html",
        icon: "💎",
        desc: "Medallion architecture — Bronze → Silver → Gold",
      },
      {
        title: "M365 Administration",
        href: "/m365.html",
        icon: "🛠",
        desc: "Entra, Intune, JML workflows and access packages",
      },
      {
        title: "Policy Dashboard",
        href: "/policy.html",
        icon: "🛡",
        desc: "Azure Policy governance at scale",
      },
      {
        title: "Log Pipeline",
        href: "/logs.html",
        icon: "📡",
        desc: "Real-time Event Hub → Eventhouse flow",
      },
      {
        title: "IaC Pipeline",
        href: "/iac.html",
        icon: "🏗",
        desc: "Bicep AVM → Deployment Stacks",
      },
      {
        title: "Platform Console",
        href: "/platform.html",
        icon: "🎛",
        desc: "Platform engineering workspace provisioning",
      },
      {
        title: "Clojure REPL",
        href: "/repl.html",
        icon: "λ",
        desc: "Live ClojureScript in your browser",
      },
      {
        title: "Architecture Studio",
        href: "/architecture.html",
        icon: "🏛",
        desc: "C4 models and architecture decision records",
      },
      {
        title: "The Agentic Web",
        href: "/agentic.html",
        icon: "🦞",
        desc: "How OpenClaw is the HTTP of AI agents",
      },
      {
        title: "Incident Triage: AD/SQL/VM",
        href: "/articles/ad-gpo-fundamentals.html",
        icon: "🏢",
        desc: "Sub-5-min SRE triage: GPO scope, dual-IP DNS, delegation, SQL AG failover, Hyper-V",
      },
    ],
  },
  {
    category: "🦀 Rust + WASM",
    items: [
      {
        title: "Particle Storm",
        href: "/particles.html",
        icon: "🌀",
        desc: "3,000 particles with orbiting gravity wells",
      },
      {
        title: "Raytracer",
        href: "/raytracer.html",
        icon: "🔮",
        desc: "Real-time ray-traced scene with reflections",
      },
      {
        title: "Game of Life",
        href: "/life.html",
        icon: "🧬",
        desc: "Massive Conway grid at 60fps",
      },
    ],
  },
];
var card = function (item) {
  const id_1 = str.replace(
    str.lower_case(squint_core.get(item, "title")),
    " ",
    "-",
  );
  return core.create_el(
    "a",
    { class: "hub-card", href: squint_core.get(item, "href"), "data-id": id_1 },
    core.create_el(
      "span",
      { class: "hub-icon" },
      squint_core.get(item, "icon"),
    ),
    core.create_el(
      "span",
      { class: "hub-title" },
      squint_core.get(item, "title"),
    ),
    core.create_el(
      "span",
      { class: "hub-desc" },
      squint_core.get(item, "desc"),
    ),
  );
};
var category_section = function (p__6) {
  const map___1_3 = p__6;
  const map___1_4 = squint_core.truth_(squint_core.sequential_QMARK_(map___1_3))
    ? squint_core.truth_(squint_core.vector_QMARK_(map___1_3))
      ? map___1_3
      : squint_core.seq_to_map_for_destructuring(map___1_3)
    : map___1_3;
  const category_5 = squint_core.get(map___1_4, "category");
  const items_6 = squint_core.get(map___1_4, "items");
  const section_7 = core.create_el("section", { class: "hub-category" });
  section_7.appendChild(
    core.create_el("h2", { class: "hub-category-title" }, category_5),
  );
  const grid_8 = core.create_el("div", { class: "hub-grid" });
  for (let G__9 of squint_core.iterable(items_6)) {
    const item_10 = G__9;
    grid_8.appendChild(card(item_10));
  }
  section_7.appendChild(grid_8);
  return section_7;
};
var hub_content = function () {
  const container_1 = core.create_el("div", { class: "hub-container" });
  container_1.appendChild(
    core.create_el("h1", { class: "hub-heading" }, "Portfolio"),
  );
  container_1.appendChild(
    core.create_el(
      "p",
      { class: "hub-intro" },
      "Interactive demos showcasing Azure, Fabric, Clojure, and cloud platform engineering.",
    ),
  );
  for (let G__2 of squint_core.iterable(apps)) {
    const cat_3 = G__2;
    container_1.appendChild(category_section(cat_3));
  }
  return container_1;
};
var init = function () {
  return core.mount_BANG_(
    ui.page_shell("hub", "/articles/hub.html", "", hub_content()),
  );
};

export { init };
