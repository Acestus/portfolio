(ns portfolio.pro.agentic
  "Agentic Web — How OpenClaw and modern APIs are building the next internet.
   Inspired by Peter Steinberger's vision: APIs and CLIs over proprietary protocols."
  (:require [clojure.string :as str]
            [portfolio.core :as core]
            [portfolio.components :as ui]))

;; === Data: Internet vs Agentic architecture stacks ===

(def ^:private internet-stack
  [{:layer "Application"  :protocols ["HTTP" "SMTP" "FTP" "DNS"]        :color "#0078d4" :era "1991–"  :desc "Rules for exchanging documents, email, files — the verbs of the web"}
   {:layer "Presentation" :protocols ["HTML" "CSS" "JSON" "XML"]        :color "#106ebe" :era "1993–"  :desc "How data is structured and rendered — the shared vocabulary"}
   {:layer "Session"      :protocols ["TLS/SSL" "Cookies" "OAuth"]      :color "#005a9e" :era "1995–"  :desc "Identity, trust, and persistent connections"}
   {:layer "Transport"    :protocols ["TCP" "UDP" "WebSocket"]          :color "#004578" :era "1983–"  :desc "Reliable delivery of packets between endpoints"}
   {:layer "Network"      :protocols ["IP" "ICMP" "BGP"]               :color "#003356" :era "1974–"  :desc "Addressing and routing across networks"}])

(def ^:private agentic-stack
  [{:layer "Agent"        :protocols ["OpenClaw" "Cursor" "Copilot"]    :color "#00a86b" :era "2025–"  :desc "Autonomous agents that reason, plan, and act — composing APIs like developers do"}
   {:layer "Interface"    :protocols ["REST" "GraphQL" "CLI" "gRPC"]    :color "#00875a" :era "2000–"  :desc "The same APIs humans use — agents call them directly, no translation layer needed"}
   {:layer "Auth"         :protocols ["OAuth 2.0" "API Keys" "OIDC"]    :color "#006644" :era "2012–"  :desc "Standard auth — agents authenticate like any other client, with scoped permissions"}
   {:layer "Transport"    :protocols ["HTTPS" "SSE" "WebSocket"]        :color "#004d33" :era "2000–"  :desc "The same web transport — agents are just another HTTP client"}
   {:layer "Network"      :protocols ["TCP/IP" "DNS" "CDN"]             :color "#003322" :era "1974–"  :desc "The same internet infrastructure — no new protocol required"}])

(def ^:private parallels
  [{:internet "HTTP gave us a universal API for document exchange"
    :agentic  "REST/GraphQL give agents the same universal API surface"
    :insight  "Agents don't need a new protocol — they need to use the APIs we already have"}
   {:internet "curl made HTTP composable from the command line"
    :agentic  "CLI tools make every service composable for agents"
    :insight  "The Unix philosophy: small tools, stdin/stdout, pipes — agents thrive on this"}
   {:internet "Browsers became the universal client for humans"
    :agentic  "OpenClaw is becoming the universal client for AI"
    :insight  "One client that wields APIs and CLIs like a skilled developer would"}
   {:internet "URLs made every resource addressable"
    :agentic  "API endpoints make every capability callable"
    :insight  "Addressability enables composition — no proprietary wrappers needed"}
   {:internet "Open standards prevented vendor lock-in"
    :agentic  "Open-source agents + standard APIs prevent AI lock-in"
    :insight  "Steinberger's bet: APIs are the stable interface, not bespoke agent protocols"}])

(def ^:private timeline
  [{:year "1974" :event "TCP/IP"           :side :internet :desc "Vint Cerf & Bob Kahn design the packet protocol"}
   {:year "1991" :event "HTTP + HTML"      :side :internet :desc "Tim Berners-Lee publishes the first web page"}
   {:year "1993" :event "Mosaic"           :side :internet :desc "The first graphical browser — the web goes visual"}
   {:year "2000" :event "REST"             :side :internet :desc "Roy Fielding's dissertation — the web as an API platform"}
   {:year "2015" :event "GraphQL"          :side :internet :desc "Facebook open-sources GraphQL — query what you need"}
   {:year "2025" :event "OpenClaw"         :side :agentic  :desc "Steinberger's open-source agent — calls APIs and CLIs directly"}
   {:year "2026" :event "API-First Agents" :side :agentic  :desc "The industry converges: agents as API consumers, not protocol inventors"}
   {:year "202X" :event "Agent Web"        :side :agentic  :desc "Agents compose APIs like developers — the agentic web emerges"}])

(def ^:private api-vs-protocol
  [{:aspect "Integration cost"  :api "Zero — use existing endpoints"     :protocol "High — build adapters for each tool server"}
   {:aspect "Auth model"        :api "Standard OAuth/OIDC/API keys"      :protocol "Custom auth per protocol implementation"}
   {:aspect "Debugging"         :api "curl, Postman, browser devtools"   :protocol "Specialized protocol inspectors"}
   {:aspect "Ecosystem"         :api "Millions of REST/GraphQL APIs"     :protocol "Only tools that implement the protocol"}
   {:aspect "CLI composability" :api "Pipe stdout → agent → API call"    :protocol "Requires protocol-specific adapters"}
   {:aspect "Maturity"          :api "25+ years of battle-tested infra"  :protocol "Months old, rapidly changing specs"}])

;; === Rendering ===

(defn- stack-layer [{:keys [layer protocols color desc]} side]
  (let [el (core/create-el "div" {:class "agent-card"
                                   :style (str "border-left:4px solid " color ";cursor:pointer")}
             (core/create-el "div" {}
               (core/create-el "div" {:class "agent-name" :style (str "color:" color)} layer)
               (core/create-el "div" {:class "agent-desc"}
                 (core/create-el "span" {:style "font-weight:600"} (str/join " · " protocols)))
               (core/create-el "div" {:class "agent-desc"} desc)))]
    (.addEventListener el "click"
      (fn [_] (core/toast! (str (if (= side :internet) "🌐" "🤖") " " layer " → " (first protocols)))))
    el))

(defn- protocol-stacks []
  (let [panel (core/create-el "div" {:style "display:grid;grid-template-columns:1fr 1fr;gap:var(--space-m)"})]
    (let [col (core/create-el "div" {})]
      (.appendChild col (core/create-el "h3" {:class "whatif-title" :style "border-left-color:#0078d4"}
                          "🌐 Internet Stack"))
      (doseq [layer internet-stack]
        (.appendChild col (stack-layer layer :internet)))
      (.appendChild panel col))
    (let [col (core/create-el "div" {})]
      (.appendChild col (core/create-el "h3" {:class "whatif-title" :style "border-left-color:#00a86b"}
                          "🤖 Agentic Stack"))
      (doseq [layer agentic-stack]
        (.appendChild col (stack-layer layer :agentic)))
      (.appendChild panel col))
    panel))

(defn- api-comparison-panel []
  (let [panel (core/create-el "div" {:class "whatif-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "whatif-title"} "⚡ APIs vs Bespoke Protocols"))
    (.appendChild panel (core/create-el "blockquote"
                          {:style "border-left:3px solid #00a86b;padding-left:0.75rem;color:#605e5c;font-style:italic;margin-block:0.5rem 1rem;font-size:var(--step--1)"}
                          "\"Why invent a new protocol when every service already has an API? Agents should call APIs — the same way developers do.\" — Peter Steinberger"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["" "📡 Direct API / CLI" "📦 Bespoke Protocol"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [{:keys [aspect api protocol]} api-vs-protocol]
          (let [row (core/create-el "tr" {})]
            (.appendChild row (core/create-el "td" {:style "font-weight:600"} aspect))
            (.appendChild row (core/create-el "td" {:style "color:#00a86b"} api))
            (.appendChild row (core/create-el "td" {:style "color:#888"} protocol))
            (.addEventListener row "click"
              (fn [_]
                (doseq [el (array-seq (.querySelectorAll tbody ".row-selected"))]
                  (.remove (.-classList el) "row-selected"))
                (.add (.-classList row) "row-selected")
                (core/toast! (str "⚡ " aspect " — API wins"))))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild panel table))
    panel))

(defn- parallels-panel []
  (let [panel (core/create-el "div" {:class "whatif-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "whatif-title"} "🔗 The Parallel"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["🌐 Internet" "🤖 Agentic AI" "💡 Insight"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [{:keys [internet agentic insight]} parallels]
          (let [row (core/create-el "tr" {})]
            (.appendChild row (core/create-el "td" {} internet))
            (.appendChild row (core/create-el "td" {} agentic))
            (.appendChild row (core/create-el "td" {:style "font-style:italic;color:#605e5c"} insight))
            (.addEventListener row "click"
              (fn [_]
                (doseq [el (array-seq (.querySelectorAll tbody ".row-selected"))]
                  (.remove (.-classList el) "row-selected"))
                (.add (.-classList row) "row-selected")
                (core/toast! (str "💡 " insight))))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild panel table))
    panel))

(defn- timeline-panel []
  (let [panel (core/create-el "div" {:class "naming-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "naming-title"} "📅 Convergent Evolution"))
    (let [rail (core/create-el "div"
                 {:style "display:flex;flex-direction:column;gap:var(--space-2xs);position:relative;padding-left:var(--space-xl)"})]
      (let [line (core/create-el "div"
                   {:style "position:absolute;left:1rem;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,#0078d4 62%,#00a86b 62%)"})]
        (.appendChild rail line))
      (doseq [{:keys [year event side desc]} timeline]
        (let [color (if (= side :internet) "#0078d4" "#00a86b")
              dot (core/create-el "div"
                    {:style (str "position:absolute;left:0.65rem;width:12px;height:12px;border-radius:50%;background:" color ";border:2px solid #fff")})
              entry (core/create-el "div" {:class "agent-card" :style (str "border-left:3px solid " color ";position:relative")}
                      (core/create-el "div" {}
                        (core/create-el "div" {:class "agent-name"}
                          (core/create-el "span" {:style (str "color:" color ";margin-right:0.5rem")} year)
                          event)
                        (core/create-el "div" {:class "agent-desc"} desc)))]
          (.addEventListener entry "click"
            (fn [_] (core/toast! (str (if (= side :internet) "🌐" "🤖") " " year " — " event))))
          (.appendChild entry dot)
          (.appendChild rail entry)))
      (.appendChild panel rail))
    panel))

(defn- thesis-panel []
  (let [panel (core/create-el "div" {:class "kql-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "kql-title"} "🦞 The OpenClaw Thesis"))
    (.appendChild panel
      (core/create-el "div" {:style "font-size:var(--step-0);line-height:1.8;color:#323130"}
        (core/create-el "p" {:style "margin-block-end:var(--space-m)"}
          "Peter Steinberger's insight: agents don't need a new protocol — they need to be great API consumers. Every service already exposes REST endpoints, GraphQL schemas, and CLI tools. The agent's job is to read docs, authenticate, call APIs, and compose results — exactly what a senior developer does, at machine speed.")
        (core/create-el "p" {:style "margin-block-end:var(--space-m)"}
          "OpenClaw embodies this philosophy. It calls APIs directly over HTTPS, shells out to CLIs via subprocess, reads man pages and --help output, and composes tools the Unix way. No middleware protocol, no adapter servers — just the APIs as they already exist.")
        (core/create-el "p" {}
          "The internet was built on open, simple interfaces: HTTP, HTML, CSS. The agentic web will be built on the same foundation — REST APIs, CLI tools, and OAuth. The best interface for an agent is the same interface a developer would use.")))
    panel))

(defn- cli-demo-panel []
  (let [panel (core/create-el "div" {:class "kql-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "kql-title"} "🖥️ Agent as Developer"))
    (.appendChild panel
      (core/create-el "pre" {:class "kql-code"}
        (str "# OpenClaw: thinking like a developer\n"
             "$ az group list --output json          # REST API via CLI\n"
             "$ curl -H \"Authorization: Bearer $TOK\" \\\n"
             "    https://graph.microsoft.com/v1.0/me # Direct API call\n"
             "$ gh pr list --json number,title        # GitHub CLI\n"
             "$ kubectl get pods -o json              # K8s API via CLI\n"
             "$ fabric pipeline run --workspace prod  # Fabric CLI\n\n"
             "# No protocol adapters. No middleware.\n"
             "# Just APIs and CLIs — the same tools you'd use.")))
    panel))

(defn- agentic-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "The Agentic Web"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "How OpenClaw and modern APIs are building the next internet — agents as API consumers, not protocol inventors"))
    (let [metrics (core/create-el "div" {:class "metrics-row"})]
      (doseq [[label value color] [["Interface"       "REST + CLI" "#00a86b"]
                                    ["Agent"           "OpenClaw"   "#0078d4"]
                                    ["LLM Backends"    "Any"        "#b8860b"]
                                    ["Data Privacy"    "Local"      "#00a86b"]]]
        (.appendChild metrics
          (core/create-el "div" {:class "metric-card"}
            (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
            (core/create-el "div" {:class "metric-label"} label))))
      (.appendChild container metrics))
    (.appendChild container (protocol-stacks))
    (.appendChild container (api-comparison-panel))
    (.appendChild container (cli-demo-panel))
    (.appendChild container (parallels-panel))
    (.appendChild container (timeline-panel))
    (.appendChild container (thesis-panel))
    container))

(defn init []
  (core/mount!
    (ui/page-shell :agentic "/articles/agentic-web.html" "src/portfolio/pro/agentic.cljs"
                   (agentic-content))))
