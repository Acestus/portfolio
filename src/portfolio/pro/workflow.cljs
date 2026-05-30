(ns portfolio.pro.workflow
  "Workflow Toolkit — file-driven AI-assisted ops pipeline."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

;; ---------------------------------------------------------------------------
;; Data — sanitized highlights from the open-sourced toolkit
;; ---------------------------------------------------------------------------

(def ^:private skills
  [{:icon "🌅" :name "start-my-day"        :desc "Pull active tickets, draft daily standup, open the kanban board"}
   {:icon "🌙" :name "end-my-day"          :desc "Stop timers, generate worklog summary, post to Teams"}
   {:icon "🔁" :name "rounds"              :desc "Kanban station rotation — one ticket per lane, round-robin focus"}
   {:icon "🎯" :name "ticket-investigator" :desc "Structured Jira investigation — clarify, gather, synthesize, plan"}
   {:icon "📞" :name "sdp-investigator"    :desc "Same workflow for ServiceDesk Plus — end-user-voice answers"}
   {:icon "📋" :name "phoenix-backlog"     :desc "Create scored Jira items + Confluence backlog rows"}
   {:icon "🗂" :name "jira-dispatcher"     :desc "WIP = 6 lanes — auto-assign next-best ticket to today's calendar"}
   {:icon "✍" :name "jira-worklog"         :desc "Markdown → Jira sync on every push to main"}
   {:icon "📡" :name "waiting-ticket-followup" :desc "Group flow:waiting tickets by stakeholder · draft follow-ups"}
   {:icon "📚" :name "confluence-writer"   :desc "Author full Confluence articles with PlantUML diagrams"}
   {:icon "🔍" :name "knowledge-clerk"     :desc "Internal RAG — find precedent before doing anything new"}
   {:icon "🛡" :name "pim-runbook"         :desc "Azure PIM activation + runbook updates"}])

(def ^:private flow-stages
  [{:icon "📥" :label "Capture"   :desc "Voice/Slack/email → SDP or Jira via skill"}
   {:icon "📁" :label "Markdown"  :desc "issues/{KEY}.md or cases/{ID}/case.md — state lives here"}
   {:icon "🤖" :label "AI Round"  :desc "rounds skill orchestrates investigation + work"}
   {:icon "💬" :label "Voice Wall" :desc "Jira COMMENT = internal voice · SDP COMMENT = end-user voice"}
   {:icon "⚡" :label "CI Sync"   :desc "Push to main → GitHub Actions reconciles fields, tags, approvals"}
   {:icon "📊" :label "Standup"   :desc "end-my-day extracts worklog & posts to Teams"}])

(def ^:private lanes
  [{:tag "🔴" :name "Lane 1 — Urgent"        :system "Jira" :wip 1 :example "INFRA — Sev1 production outage"}
   {:tag "🔵" :name "Lane 2 — Manual"        :system "Jira" :wip 1 :example "INFRA — Manual SOP work"}
   {:tag "🟢" :name "Lane 3 — Background"    :system "Jira" :wip 1 :example "INFRA — Long-running automation"}
   {:tag "🔴" :name "Lane 4 — SDP-Urgent"    :system "SDP"  :wip 1 :example "Access blocked / account locked"}
   {:tag "🟠" :name "Lane 5 — SDP-Approval"  :system "SDP"  :wip 1 :example "License grant / new account"}
   {:tag "🟢" :name "Lane 6 — SDP-Background" :system "SDP" :wip 1 :example "Hardware refresh / batch onboard"}])

(def ^:private repo-stats
  [{:label "Skills"        :value "27" :color "#0078d4"}
   {:label "Instructions"  :value "19" :color "#7e57c2"}
   {:label "Workflows"     :value "12" :color "#00a86b"}
   {:label "Scripts"       :value "80" :color "#b8860b"}
   {:label "Lanes"         :value "6"  :color "#d83b01"}
   {:label "License"       :value "MIT" :color "#5c2d91"}])

;; ---------------------------------------------------------------------------
;; State
;; ---------------------------------------------------------------------------

(def ^:private state (atom {:tab :skills}))

;; ---------------------------------------------------------------------------
;; Components
;; ---------------------------------------------------------------------------

(defn- metrics-panel []
  (let [panel (core/create-el "div" {:class "metrics-row"})]
    (doseq [s repo-stats]
      (.appendChild panel
        (core/create-el "div" {:class "metric-card"}
          (core/create-el "div" {:class "metric-value" :style (str "color:" (:color s))} (:value s))
          (core/create-el "div" {:class "metric-label"} (:label s)))))
    panel))

(defn- skill-card [s]
  (let [card (core/create-el "div" {:class "agent-card"}
               (core/create-el "span" {:class "agent-icon"} (:icon s))
               (core/create-el "div" {:class "agent-info"}
                 (core/create-el "div" {:class "agent-name"} (:name s))
                 (core/create-el "div" {:class "agent-desc"} (:desc s))))]
    (.addEventListener card "click"
      (fn [_] (core/toast! (str (:icon s) " " (:name s) " — " (:desc s)))))
    card))

(defn- skills-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "🧰 Copilot Skills (sampling)"))
    (let [grid (core/create-el "div" {:class "card-grid"})]
      (doseq [s skills] (.appendChild grid (skill-card s)))
      (.appendChild panel grid))
    panel))

(defn- flow-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "🔄 Daily Flow"))
    (let [flow (core/create-el "div" {:class "flow"})]
      (doseq [[i s] (map-indexed vector flow-stages)]
        (when (pos? i)
          (.appendChild flow (core/create-el "span" {:class "arrow"} "→")))
        (let [pill (core/create-el "div" {:class "pill" :style "cursor:pointer"}
                     (str (:icon s) " " (:label s)))]
          (.addEventListener pill "click"
            (fn [_] (core/toast! (str (:icon s) " " (:label s) " — " (:desc s)))))
          (.appendChild flow pill)))
      (.appendChild panel flow))
    (let [desc (core/create-el "div" {:class "panel-sub" :style "margin-top:1rem"})]
      (.appendChild desc (core/create-el "p" {}
        "State lives in markdown — push to main triggers GitHub Actions that reconcile to Jira/SDP. No webhooks, no message bus, no orchestrator. Just files + CI."))
      (.appendChild panel desc))
    panel))

(defn- lane-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "🎛 Kanban Flow — 6 Lanes, WIP = 1 each"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["" "Lane" "System" "WIP" "Example Work"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [l lanes]
          (let [row (core/create-el "tr" {})]
            (.appendChild row (core/create-el "td" {:style "font-size:1.5rem;text-align:center"} (:tag l)))
            (.appendChild row (core/create-el "td" {:style "font-weight:600"} (:name l)))
            (.appendChild row (core/create-el "td" {} (:system l)))
            (.appendChild row (core/create-el "td" {:style "text-align:center"} (str (:wip l))))
            (.appendChild row (core/create-el "td" {:style "color:var(--clr-text-muted)"} (:example l)))
            (.addEventListener row "click"
              (fn [_] (core/toast! (str (:tag l) " " (:name l) " — " (:example l)))))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild panel table))
    panel))

(defn- stats-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "📦 Repo Anatomy"))
    (.appendChild panel (core/create-el "p" {:class "panel-sub"}
      "Open-source workflow toolkit — Copilot CLI skills + instructions + scripts + GitHub Actions. Bring your own .env, drop into any new repo."))
    (let [tree (core/create-el "pre"
                 {:class "code-block"
                  :style "background:#0a0a2a;color:#9cdcfe;padding:1rem;border-radius:6px"}
                 (str "workflow-toolkit/\n"
                      "├── .github/skills/         (27 skills · daily routines + specialists)\n"
                      "├── .github/instructions/   (19 file-pattern-scoped rules)\n"
                      "├── .github/workflows/      (12 CI sync jobs · Jira, SDP, Confluence)\n"
                      "├── scripts/                (80 Python/PowerShell/Babashka tools)\n"
                      "├── .env.example            (Jira · Confluence · SDP · Azure · GitHub · Teams)\n"
                      "├── CONTRIBUTING.md         (skill / instruction / script guidelines)\n"
                      "└── README.md               (mental model + daily workflow + skill ref)\n"))]
      (.appendChild panel tree))
    panel))

(defn- tab-button [label active on-click]
  (let [btn (core/create-el "button"
              {:class (str "tab-btn" (when active " active"))} label)]
    (.addEventListener btn "click" on-click)
    btn))

(defn- workflow-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})
        tab-body  (core/create-el "div" {:class "tab-body"})
        render-tab (fn [tab]
                     (set! (.-innerHTML tab-body) "")
                     (.appendChild tab-body
                       (case tab
                         :skills (skills-panel)
                         :flow   (flow-panel)
                         :lanes  (lane-panel)
                         :stats  (stats-panel))))]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "Workflow Toolkit"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "File-driven AI-assisted ops — open source on GitHub at acestus/workflow-toolkit"))
    (.appendChild container (metrics-panel))
    (let [tabs (core/create-el "div" {:class "tab-bar"})]
      (doseq [[label key] [["Skills" :skills] ["Daily Flow" :flow] ["Lane Board" :lanes] ["Repo Stats" :stats]]]
        (.appendChild tabs
          (tab-button label (= key (:tab @state))
            (fn [e]
              (swap! state assoc :tab key)
              (render-tab key)
              (doseq [b (array-seq (.querySelectorAll tabs ".tab-btn"))]
                (.remove (.-classList b) "active"))
              (.. e -target -classList (add "active"))))))
      (.appendChild container tabs))
    (.appendChild container tab-body)
    (render-tab :skills)
    container))

(defn init []
  (core/mount!
    (ui/page-shell :workflow "/articles/workflow-toolkit.html" "src/portfolio/pro/workflow.cljs"
                   (workflow-content))))
