(ns portfolio.pro.agentic
  "Agentic Web — How MCP/OpenClaw is the HTTP of AI agents.
   Inspired by Peter Steinberger's vision of open agentic protocols."
  (:require [clojure.string :as str]
            [portfolio.core :as core]
            [portfolio.components :as ui]))

;; === Data: Internet vs Agentic protocol stacks ===

(def ^:private internet-stack
  [{:layer "Application"  :protocols ["HTTP" "SMTP" "FTP" "DNS"]        :color "#0078d4" :era "1991–"  :desc "Rules for exchanging documents, email, files — the verbs of the web"}
   {:layer "Presentation" :protocols ["HTML" "CSS" "JSON" "XML"]        :color "#106ebe" :era "1993–"  :desc "How data is structured and rendered — the shared vocabulary"}
   {:layer "Session"      :protocols ["TLS/SSL" "Cookies" "OAuth"]      :color "#005a9e" :era "1995–"  :desc "Identity, trust, and persistent connections"}
   {:layer "Transport"    :protocols ["TCP" "UDP" "WebSocket"]          :color "#004578" :era "1983–"  :desc "Reliable delivery of packets between endpoints"}
   {:layer "Network"      :protocols ["IP" "ICMP" "BGP"]               :color "#003356" :era "1974–"  :desc "Addressing and routing across networks"}])

(def ^:private agentic-stack
  [{:layer "Application"  :protocols ["OpenClaw" "AutoGPT" "CrewAI"]    :color "#00a86b" :era "2025–"  :desc "Autonomous agents that act on your behalf — browse, message, automate workflows"}
   {:layer "Presentation" :protocols ["MCP" "Tool Schemas" "A2A"]       :color "#00875a" :era "2024–"  :desc "Model Context Protocol — the shared language for agent↔tool communication"}
   {:layer "Session"      :protocols ["OAuth" "API Keys" "OIDC"]        :color "#006644" :era "2024–"  :desc "Agent identity, permission scoping, audit trails — who acts and what they can do"}
   {:layer "Transport"    :protocols ["HTTPS" "SSE" "WebSocket"]        :color "#004d33" :era "2024–"  :desc "Carrying agent messages reliably — same TCP/IP the web already uses"}
   {:layer "Network"      :protocols ["TCP/IP" "DNS" "CDN"]             :color "#003322" :era "1974–"  :desc "The same internet infrastructure — agents ride on existing rails"}])

(def ^:private parallels
  [{:internet "HTTP defined how browsers talk to servers"
    :agentic  "MCP defines how agents talk to tools"
    :insight  "Both are request/response protocols with a shared vocabulary of actions"}
   {:internet "HTML gave us a universal document format"
    :agentic  "Tool schemas give agents a universal capability format"
    :insight  "Both create interoperability — any client works with any server"}
   {:internet "URLs made every resource addressable"
    :agentic  "MCP endpoints make every tool discoverable"
    :insight  "Addressability enables composition — link anything to anything"}
   {:internet "Browsers became the universal client"
    :agentic  "OpenClaw is becoming the universal agent"
    :insight  "One client that can talk to any server using the open protocol"}
   {:internet "Open standards prevented vendor lock-in"
    :agentic  "Open-source agents prevent AI platform lock-in"
    :insight  "Steinberger insisted OpenClaw stays open — same pattern as the web"}])

(def ^:private timeline
  [{:year "1974" :event "TCP/IP"       :side :internet :desc "Vint Cerf & Bob Kahn design the packet protocol"}
   {:year "1991" :event "HTTP + HTML"  :side :internet :desc "Tim Berners-Lee publishes the first web page"}
   {:year "1993" :event "Mosaic"       :side :internet :desc "The first graphical browser — the web goes visual"}
   {:year "1995" :event "SSL / CSS"    :side :internet :desc "Security and styling make the web trustworthy and beautiful"}
   {:year "2024" :event "MCP"          :side :agentic  :desc "Anthropic publishes Model Context Protocol — HTTP for agents"}
   {:year "2025" :event "OpenClaw"     :side :agentic  :desc "Steinberger's agent goes viral — Mosaic moment for AI agents"}
   {:year "2026" :event "Open Foundation" :side :agentic :desc "OpenClaw stays open-source, stewarded by a non-profit foundation"}
   {:year "202X" :event "Agent Web"    :side :agentic  :desc "Agents compose like web pages — the agentic web emerges"}])

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
    ;; Internet column
    (let [col (core/create-el "div" {})]
      (.appendChild col (core/create-el "h3" {:class "whatif-title" :style "border-left-color:#0078d4"}
                          "🌐 Internet Protocol Stack"))
      (doseq [layer internet-stack]
        (.appendChild col (stack-layer layer :internet)))
      (.appendChild panel col))
    ;; Agentic column
    (let [col (core/create-el "div" {})]
      (.appendChild col (core/create-el "h3" {:class "whatif-title" :style "border-left-color:#00a86b"}
                          "🤖 Agentic Protocol Stack"))
      (doseq [layer agentic-stack]
        (.appendChild col (stack-layer layer :agentic)))
      (.appendChild panel col))
    panel))

(defn- parallels-panel []
  (let [panel (core/create-el "div" {:class "whatif-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "whatif-title"} "🔗 The Parallel"))
    (.appendChild panel (core/create-el "blockquote"
                          {:style "border-left:3px solid #0078d4;padding-left:0.75rem;color:#605e5c;font-style:italic;margin-block:0.5rem 1rem;font-size:var(--step--1)"}
                          "\"The lobster is loose, and it's not going back into the tank.\" — Peter Steinberger"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["🌐 Internet" "🤖 Agentic AI" "💡 Pattern"]]
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
      ;; vertical line
      (let [line (core/create-el "div"
                   {:style "position:absolute;left:1rem;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,#0078d4 50%,#00a86b 50%)"})]
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

(defn- steinberger-quote-panel []
  (let [panel (core/create-el "div" {:class "kql-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "kql-title"} "🦞 The OpenClaw Thesis"))
    (.appendChild panel
      (core/create-el "div" {:style "font-size:var(--step-0);line-height:1.8;color:#323130"}
        (core/create-el "p" {:style "margin-block-end:var(--space-m)"}
          "Just as HTTP gave us a universal protocol for document exchange, MCP gives agents a universal protocol for tool use. Just as HTML made documents interoperable across any browser, tool schemas make capabilities interoperable across any agent.")
        (core/create-el "p" {:style "margin-block-end:var(--space-m)"}
          "Peter Steinberger's OpenClaw is to agentic AI what Mosaic was to the web — the first client that makes the protocol tangible. It runs locally, works with any LLM, and keeps data private.")
        (core/create-el "p" {}
          "The internet wasn't built by one company. It was built by open standards — TCP/IP, HTTP, HTML, CSS — that anyone could implement. The agentic web follows the same pattern: MCP is open, OpenClaw is open-source, and the foundation is non-profit. History doesn't repeat, but it rhymes.")))
    panel))

(defn- agentic-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "The Agentic Web"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "How MCP and OpenClaw are building the next internet — the same way HTTP, HTML, and TCP built the first one"))
    ;; metrics
    (let [metrics (core/create-el "div" {:class "metrics-row"})]
      (doseq [[label value color] [["Open Protocols"  "MCP + A2A" "#00a86b"]
                                    ["Agent Framework" "OpenClaw"  "#0078d4"]
                                    ["LLM Backends"    "Any"       "#b8860b"]
                                    ["Data Privacy"    "Local"     "#00a86b"]]]
        (.appendChild metrics
          (core/create-el "div" {:class "metric-card"}
            (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
            (core/create-el "div" {:class "metric-label"} label))))
      (.appendChild container metrics))
    (.appendChild container (protocol-stacks))
    (.appendChild container (parallels-panel))
    (.appendChild container (timeline-panel))
    (.appendChild container (steinberger-quote-panel))
    container))

(defn init []
  (core/mount!
    (ui/page-shell :agentic "/articles/agentic-web.html" "src/portfolio/pro/agentic.cljs"
                   (agentic-content))))
