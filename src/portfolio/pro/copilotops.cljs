(ns portfolio.pro.copilotops
  "Copilot-Ops Agent Console — file-driven AI ops with markdown↔API sync, voice wall, kanban rounds."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

;; ---------------------------------------------------------------------------
;; Data
;; ---------------------------------------------------------------------------

(def ^:private rounds-queue
  [{:lane "🔴 Lane 1 — Urgent"    :id "INFRA-###" :title "Capacity throttling on shared workload" :status "active"  :age "2h"}
   {:lane "🔵 Lane 2 — Manual"    :id "INFRA-###" :title "API quota mapping for governance review" :status "waiting" :age "3d"}
   {:lane "🟢 Lane 3 — Background" :id "INFRA-###" :title "Monthly platform-retirement review"     :status "queued"  :age "1d"}
   {:lane "🔴 Lane 4 — SDP-Urgent" :id "SDP-#####" :title "Account lockout — finance lead"         :status "active"  :age "45m"}
   {:lane "🟠 Lane 5 — Approval"  :id "SDP-#####" :title "GitHub Copilot license grant"             :status "queued"  :age "4h"}
   {:lane "🟢 Lane 6 — Background" :id "SDP-#####" :title "Workspace provisioning request"          :status "queued"  :age "2d"}])

(def ^:private voice-examples
  [{:system "Jira (internal)"
    :icon   "🛠"
    :worklog "Verified Event Hub namespace has firewall rule for Fabric public IPs; throughput unit at 1, ingress at 80% peak."
    :comment "Pulled the gateway IP allowlist from cap-edm-prd-usw2-001 settings — matches the EH inbound rule, so handshake is wide open. Question is whether the consumer group lag is the real bottleneck."}
   {:system "SDP (end-user)"
    :icon   "📞"
    :worklog "Activated Copilot license on tenant; user signed in successfully and Office app shows the Copilot button."
    :comment "Your Microsoft 365 Copilot license is active. Restart Word/Excel/Outlook — you should see the Copilot button in the ribbon. Reply here if it doesn't show up after a full app restart."}])

(def ^:private skills-pipeline
  [{:step "1" :icon "🎯" :name "ticket-investigator"      :desc "Clarifying interview → 95% confidence before work starts"}
   {:step "2" :icon "🔍" :name "knowledge-clerk"          :desc "Search precedent — has this been done before?"}
   {:step "3" :icon "🔧" :name "domain specialist"        :desc "PIM / Azure / Fabric / Confluence — uses real CLI"}
   {:step "4" :icon "✍" :name "jira-worklog / sdp-worklog" :desc "Write WORKLOG + COMMENT entries to markdown"}
   {:step "5" :icon "⚡" :name "git push to main"          :desc "GitHub Actions reconcile to Jira/SDP/Confluence"}
   {:step "6" :icon "📊" :name "end-my-day"               :desc "Aggregate worklogs → Teams standup post"}])

(def ^:private metrics
  [{:label "Active Skills"      :value "27" :color "#0078d4"}
   {:label "Today's Tickets"    :value "6"  :color "#00a86b"}
   {:label "Avg Investigation"  :value "12m" :color "#7e57c2"}
   {:label "Auto-Reconciled"    :value "100%" :color "#b8860b"}])

;; ---------------------------------------------------------------------------
;; State
;; ---------------------------------------------------------------------------

(def ^:private state (atom {:tab :rounds}))

;; ---------------------------------------------------------------------------
;; Components
;; ---------------------------------------------------------------------------

(defn- metrics-panel []
  (let [panel (core/create-el "div" {:class "metrics-row"})]
    (doseq [m metrics]
      (.appendChild panel
        (core/create-el "div" {:class "metric-card"}
          (core/create-el "div" {:class "metric-value" :style (str "color:" (:color m))} (:value m))
          (core/create-el "div" {:class "metric-label"} (:label m)))))
    panel))

(defn- rounds-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "🎛 Rounds Board — WIP = 1 per lane"))
    (.appendChild panel (core/create-el "p" {:class "panel-sub"}
      "Each lane gets one ticket at a time. Dispatcher picks the next-highest scored item when the active one moves to done or waiting."))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["Lane" "ID" "Title" "Status" "Age"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [r rounds-queue]
          (let [row (core/create-el "tr" {})]
            (.appendChild row (core/create-el "td" {:style "font-weight:600"} (:lane r)))
            (.appendChild row (core/create-el "td" {:style "font-family:monospace"} (:id r)))
            (.appendChild row (core/create-el "td" {} (:title r)))
            (.appendChild row
              (core/create-el "td"
                {:style (str "font-weight:600;color:"
                             (case (:status r) "active" "#d83b01" "waiting" "#b8860b" "#605e5c"))}
                (:status r)))
            (.appendChild row (core/create-el "td" {:style "color:var(--clr-text-muted)"} (:age r)))
            (.addEventListener row "click"
              (fn [_] (core/toast! (str "▶ Dispatching " (:lane r) " — " (:id r)))))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild panel table))
    panel))

(defn- voice-wall-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "💬 The Voice Wall"))
    (.appendChild panel (core/create-el "p" {:class "panel-sub"}
      "WORKLOG is always internal voice (what was done, how I verified it). COMMENT shifts voice by system: Jira = internal investigative voice, SDP = end-user voice (plain language, what to expect, how to verify on their end)."))
    (let [grid (core/create-el "div" {:class "card-grid"})]
      (doseq [v voice-examples]
        (let [card (core/create-el "div" {:class "panel"
                                          :style "padding:var(--space-s)"})]
          (.appendChild card
            (core/create-el "h4" {:style "margin-top:0;color:var(--clr-accent)"}
              (str (:icon v) " " (:system v))))
          (.appendChild card (core/create-el "div" {:style "font-weight:600;margin-top:0.5rem"} "WORKLOG"))
          (.appendChild card (core/create-el "div" {:style "color:var(--clr-text-muted);font-style:italic"} (:worklog v)))
          (.appendChild card (core/create-el "div" {:style "font-weight:600;margin-top:0.5rem"} "COMMENT"))
          (.appendChild card (core/create-el "div" {:style "color:var(--clr-text)"} (:comment v)))
          (.appendChild grid card)))
      (.appendChild panel grid))
    panel))

(defn- pipeline-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "🔁 Skill Pipeline — one ticket"))
    (.appendChild panel (core/create-el "p" {:class "panel-sub"}
      "Composable skills — each one does one thing well. Rounds picks the ticket; investigator clarifies; specialists do the work; worklog persists state to disk; CI mirrors it back to the tracker."))
    (let [grid (core/create-el "div" {:class "card-grid"})]
      (doseq [s skills-pipeline]
        (let [card (core/create-el "div" {:class "agent-card" :style "cursor:pointer"}
                     (core/create-el "span" {:class "agent-icon"} (:icon s))
                     (core/create-el "div" {:class "agent-info"}
                       (core/create-el "div" {:class "agent-name"} (str (:step s) ". " (:name s)))
                       (core/create-el "div" {:class "agent-desc"} (:desc s))))]
          (.addEventListener card "click"
            (fn [_] (core/toast! (str (:icon s) " Step " (:step s) ": " (:name s)))))
          (.appendChild grid card)))
      (.appendChild panel grid))
    panel))

(defn- sync-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "⚡ Markdown ↔ API Sync"))
    (.appendChild panel (core/create-el "p" {:class "panel-sub"}
      "State lives in `issues/{KEY}.md` and `cases/{ID}/case.md`. Push to main → GitHub Actions reconcile to Jira / SDP / Confluence. One direction, file-truth, no webhooks."))
    (.appendChild panel
      (core/create-el "pre" {:class "code-block"}
        (str "issues/INFRA-###/\n"
             "└── INFRA-### — Capacity throttling.md\n"
             "    ├── Description\n"
             "    ├── Investigation\n"
             "    ├── Actions          ← WORKLOG + COMMENT entries (reverse chrono)\n"
             "    └── Follow-up        ← Status, TODO, flow:waiting reason\n"
             "\n"
             "cases/#####/\n"
             "└── ##### — License Grant.md\n"
             "    ├── Description\n"
             "    ├── Actions\n"
             "    ├── Tasks\n"
             "    ├── Web Links\n"
             "    ├── Approval         ← L1 reviewer state\n"
             "    └── Follow-up\n"
             "\n"
             "git push origin main\n"
             "  └─→ .github/workflows/jira-worklog-sync.yaml\n"
             "  └─→ .github/workflows/sdp-worklog-sync.yaml\n"
             "       reconcile WORKLOG + COMMENT + tags + approvals → API")))
    panel))

(defn- tab-button [label active on-click]
  (let [btn (core/create-el "button" {:class (str "tab-btn" (when active " active"))} label)]
    (.addEventListener btn "click" on-click)
    btn))

(defn- copilotops-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})
        tab-body  (core/create-el "div" {:class "tab-body"})
        render-tab (fn [tab]
                     (set! (.-innerHTML tab-body) "")
                     (.appendChild tab-body
                       (case tab
                         :rounds   (rounds-panel)
                         :voice    (voice-wall-panel)
                         :pipeline (pipeline-panel)
                         :sync     (sync-panel))))]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "Copilot-Ops Agent Console"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "Live view of the file-driven AI ops loop — rounds dispatch · voice wall · skill pipeline · markdown↔API sync"))
    (.appendChild container (metrics-panel))
    (let [tabs (core/create-el "div" {:class "tab-bar"})]
      (doseq [[label key] [["Rounds Board" :rounds] ["Voice Wall" :voice]
                            ["Skill Pipeline" :pipeline] ["Markdown↔API" :sync]]]
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
    (render-tab :rounds)
    container))

(defn init []
  (core/mount!
    (ui/page-shell :copilotops "/articles/copilot-ops-console.html" "src/portfolio/pro/copilotops.cljs"
                   (copilotops-content))))
