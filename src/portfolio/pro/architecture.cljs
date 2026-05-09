(ns portfolio.pro.architecture
  "Architecture Studio — Interactive C4 model + ADR browser.
   Inspired by Martin Fowler's emphasis on communication, evolutionary
   architecture, and making architectural decisions explicit."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

;; ---------------------------------------------------------------------------
;; C4 Model Data — mirrors the real Acestus Azure estate
;; ---------------------------------------------------------------------------

(def ^:private c4-context
  {:name "Acestus Platform"
   :desc "Cloud-native analytics & governance platform on Azure"
   :actors
   [{:id :user       :label "Platform Engineer" :desc "Deploys IaC, manages workspaces, activates PIM roles"}
    {:id :analyst    :label "Data Analyst"       :desc "Queries Gold-layer lakehouses, builds Power BI reports"}
    {:id :security   :label "Security Admin"     :desc "Reviews Azure Policy compliance, manages Entra ID"}]
   :systems
   [{:id :fabric     :label "Microsoft Fabric"    :desc "Medallion pipeline — Bronze → Silver → Gold"  :color "#6a0dad"}
    {:id :azure      :label "Azure Platform"      :desc "IaC via Bicep AVM, Deployment Stacks, Policy" :color "#0078d4"}
    {:id :m365       :label "M365 / Copilot"      :desc "Copilot agents, Teams, SharePoint governance"  :color "#d83b01"}
    {:id :monitoring :label "Observability"        :desc "Event Hub → Eventhouse real-time log pipeline" :color "#00a86b"}]})

(def ^:private c4-containers
  {:fabric
   [{:id :eventhouse :label "Eventhouse"        :tech "KQL Database"       :desc "Hot-path streaming analytics with update policies"}
    {:id :lakehouse  :label "Lakehouse (Bronze)" :tech "Delta Lake"        :desc "Raw ingestion from Event Hub via Eventstream"}
    {:id :silver     :label "Lakehouse (Silver)" :tech "Spark Notebooks"   :desc "Cleansed, deduplicated, SCD Type-2 dimensions"}
    {:id :gold       :label "Lakehouse (Gold)"   :tech "Spark Notebooks"   :desc "Business-ready star schemas, aggregate tables"}
    {:id :semantic   :label "Semantic Model"     :tech "Power BI Dataset"  :desc "DAX measures, row-level security, incremental refresh"}]
   :azure
   [{:id :bicep      :label "Bicep Modules"     :tech "AVM + Registry"    :desc "Versioned modules: networking, compute, data, identity"}
    {:id :stacks     :label "Deployment Stacks"  :tech "ARM Deployment"    :desc "Deny-settings, action-on-unmanage for drift protection"}
    {:id :policy     :label "Azure Policy"       :tech "Policy-as-Code"   :desc "Custom + built-in policies, exemptions, remediation"}
    {:id :keyvault   :label "Key Vault"          :tech "RBAC"             :desc "Secrets, certificates, managed identity access"}
    {:id :functions  :label "Azure Functions"     :tech "Clojure on JVM"  :desc "Serverless API — ring handler on Azure Functions runtime"}]
   :m365
   [{:id :copilot    :label "Copilot Agents"     :tech "Declarative"      :desc "Confluence search, sprint planner, meeting recap"}
    {:id :teams      :label "Teams Governance"    :tech "PowerShell + Graph" :desc "Team lifecycle, naming policy, retention labels"}
    {:id :sharepoint :label "SharePoint"          :tech "PnP PowerShell"  :desc "Hub sites, document libraries, content types"}]
   :monitoring
   [{:id :eventhub   :label "Event Hub"          :tech "Kafka-compatible" :desc "Namespace with partitioned topics for log ingestion"}
    {:id :eventstream :label "Eventstream"        :tech "Fabric Real-Time" :desc "No-code routing from Event Hub to Eventhouse/Lakehouse"}
    {:id :kql-dash   :label "KQL Dashboards"      :tech "Real-Time Intelligence" :desc "Live operational dashboards with auto-refresh"}]})

(def ^:private adrs
  [{:id "ADR-001" :title "Use Bicep AVM over raw ARM templates"
    :status "Accepted" :date "2024-09"
    :context "Team spent excessive time writing boilerplate ARM JSON. Microsoft's Azure Verified Modules provide tested, well-documented Bicep modules with consistent interfaces."
    :decision "Adopt AVM modules from the Bicep public registry (br:mcr.microsoft.com/bicep) as the primary IaC building blocks. Wrap in thin composition modules per workload."
    :consequences ["Faster onboarding — engineers learn one module interface" "Automatic security baselines from Microsoft" "Version pinning required — breaking changes between AVM versions" "Custom resources still need raw Bicep"]}
   {:id "ADR-002" :title "Deployment Stacks for drift protection"
    :status "Accepted" :date "2024-10"
    :context "Resources modified outside IaC pipelines caused silent drift. Traditional deployments don't prevent manual changes."
    :decision "Use Azure Deployment Stacks with deny-settings (denyWriteAndDelete) and actionOnUnmanage=deleteResources for all production resource groups."
    :consequences ["Zero manual drift in production" "Engineers must go through IaC pipeline for all changes" "Break-glass PIM activation needed for emergency fixes" "Deployment stack updates are slightly slower than raw deployments"]}
   {:id "ADR-003" :title "Medallion architecture for Fabric pipelines"
    :status "Accepted" :date "2024-11"
    :context "Ad-hoc data pipelines led to inconsistent data quality. Analysts couldn't trust numbers across reports."
    :decision "Implement Bronze → Silver → Gold medallion pattern. Bronze is raw/append-only, Silver is cleansed/deduplicated, Gold is business-ready star schemas."
    :consequences ["Clear data lineage and quality gates" "Analysts only query Gold layer" "Increased storage from multi-layer approach" "Reprocessing requires replaying from Bronze"]}
   {:id "ADR-004" :title "ClojureScript for portfolio frontend"
    :status "Accepted" :date "2025-01"
    :context "Portfolio needs interactive SPAs. Team expertise is in Clojure. Rich Hickey's philosophy of simplicity and data-orientation aligns with our values."
    :decision "Use ClojureScript with shadow-cljs for all portfolio SPAs. Vanilla DOM manipulation (no React). SCI for in-browser REPL evaluation."
    :consequences ["Consistent language across backend and frontend" "Smaller community than React/Vue — fewer library options" "shadow-cljs provides excellent JS interop" "Functional approach produces simpler, more testable code"]}
   {:id "ADR-005" :title "Event Hub for centralized log ingestion"
    :status "Accepted" :date "2024-12"
    :context "Logs scattered across Log Analytics workspaces, storage accounts, and Application Insights. No unified real-time view."
    :decision "Route all infrastructure and application logs through a central Event Hub namespace. Use Fabric Eventstream to fan-out to Eventhouse (hot) and Lakehouse (cold)."
    :consequences ["Single ingestion point simplifies monitoring" "Real-time KQL queries via Eventhouse" "Event Hub becomes a critical path — needs geo-redundancy" "Cost savings by replacing per-resource Log Analytics with centralized pipeline"]}
   {:id "ADR-006" :title "Azure Policy for governance at scale"
    :status "Accepted" :date "2024-09"
    :context "Multiple subscriptions with inconsistent tagging, naming, and security configurations. Manual audits don't scale."
    :decision "Implement Azure Policy as code. Custom policies for CAF naming, required tags, and allowed SKUs. Assign at management group level with exemptions for exceptions."
    :consequences ["Consistent governance across all subscriptions" "New resources automatically validated" "Policy conflicts require careful initiative design" "Exemption workflow needed for legitimate exceptions"]}
   {:id "ADR-007" :title "Evolutionary architecture with fitness functions"
    :status "Proposed" :date "2025-05"
    :context "Architecture decisions made early become constraints later. Martin Fowler and Neal Ford advocate for evolutionary architecture — decisions that support incremental change."
    :decision "Treat architecture as evolutionary. Define fitness functions (automated checks) for key architectural characteristics: deployment frequency, policy compliance rate, data freshness SLA, cost per workload."
    :consequences ["Architecture evolves with business needs" "Fitness functions catch architectural drift early" "Requires investment in measurement infrastructure" "Team must accept that today's decisions will be revisited"]}])

;; ---------------------------------------------------------------------------
;; C4 Rendering
;; ---------------------------------------------------------------------------

(defn- c4-actor-el [{:keys [label desc]}]
  (core/create-el "div" {:class "c4-actor"}
    (core/create-el "div" {:class "c4-actor-icon"} "👤")
    (core/create-el "div" {:class "c4-actor-label"} label)
    (core/create-el "div" {:class "c4-actor-desc"} desc)))

(defn- c4-system-el [{:keys [label desc color]} on-click]
  (let [el (core/create-el "div" {:class "c4-system"
                                   :style (str "border-color:" color)}
             (core/create-el "div" {:class "c4-system-label" :style (str "color:" color)} label)
             (core/create-el "div" {:class "c4-system-desc"} desc)
             (core/create-el "div" {:class "c4-drill-hint"} "▶ Click to explore containers"))]
    (.addEventListener el "click" on-click)
    el))

(defn- c4-container-el [{:keys [label tech desc]}]
  (core/create-el "div" {:class "c4-container"}
    (core/create-el "div" {:class "c4-container-label"} label)
    (core/create-el "div" {:class "c4-container-tech"} tech)
    (core/create-el "div" {:class "c4-container-desc"} desc)))

(defn- render-c4-context [state render!]
  (let [panel (core/create-el "div" {:class "c4-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "c4-level-title"} "System Context"))
    (.appendChild panel (core/create-el "p" {:class "c4-level-desc"}
      "\"Architecture is about the important stuff. Whatever that is.\" — Martin Fowler"))
    (let [actors-row (core/create-el "div" {:class "c4-actors-row"})]
      (doseq [a (:actors c4-context)]
        (.appendChild actors-row (c4-actor-el a)))
      (.appendChild panel actors-row))
    (let [systems-row (core/create-el "div" {:class "c4-systems-row"})]
      (doseq [s (:systems c4-context)]
        (.appendChild systems-row
          (c4-system-el s
            (fn [_]
              (swap! state assoc :c4-drill (:id s))
              (render!)))))
      (.appendChild panel systems-row))
    panel))

(defn- render-c4-containers [state render!]
  (let [system-id (:c4-drill @state)
        containers (get c4-containers system-id [])
        sys (first (filter #(= (:id %) system-id) (:systems c4-context)))
        panel (core/create-el "div" {:class "c4-panel"})]
    (.appendChild panel
      (let [back (core/create-el "button" {:class "c4-back-btn"} "← Back to Context")]
        (.addEventListener back "click"
          (fn [_]
            (swap! state dissoc :c4-drill)
            (render!)))
        back))
    (.appendChild panel (core/create-el "h3" {:class "c4-level-title"}
      (str "Containers — " (:label sys))))
    (.appendChild panel (core/create-el "p" {:class "c4-level-desc"} (:desc sys)))
    (let [grid (core/create-el "div" {:class "c4-containers-grid"})]
      (doseq [c containers]
        (.appendChild grid (c4-container-el c)))
      (.appendChild panel grid))
    panel))

;; ---------------------------------------------------------------------------
;; ADR Rendering
;; ---------------------------------------------------------------------------

(defn- status-badge [status]
  (let [cls (case status
              "Accepted" "adr-status-accepted"
              "Proposed" "adr-status-proposed"
              "Deprecated" "adr-status-deprecated"
              "adr-status-default")]
    (core/create-el "span" {:class (str "adr-status " cls)} status)))

(defn- adr-list-item [{:keys [id title status]} selected? on-click]
  (let [el (core/create-el "div" {:class (str "adr-list-item" (when selected? " selected"))}
             (core/create-el "div" {:class "adr-item-header"}
               (core/create-el "span" {:class "adr-id"} id)
               (status-badge status))
             (core/create-el "div" {:class "adr-item-title"} title))]
    (.addEventListener el "click" on-click)
    el))

(defn- adr-detail [{:keys [id title status date context decision consequences]}]
  (let [panel (core/create-el "div" {:class "adr-detail"})]
    (.appendChild panel (core/create-el "div" {:class "adr-detail-header"}
                          (core/create-el "span" {:class "adr-id-large"} id)
                          (status-badge status)
                          (core/create-el "span" {:class "adr-date"} date)))
    (.appendChild panel (core/create-el "h3" {:class "adr-detail-title"} title))
    (.appendChild panel (core/create-el "h4" {:class "adr-section-heading"} "Context"))
    (.appendChild panel (core/create-el "p" {:class "adr-section-body"} context))
    (.appendChild panel (core/create-el "h4" {:class "adr-section-heading"} "Decision"))
    (.appendChild panel (core/create-el "p" {:class "adr-section-body"} decision))
    (.appendChild panel (core/create-el "h4" {:class "adr-section-heading"} "Consequences"))
    (let [ul (core/create-el "ul" {:class "adr-consequences"})]
      (doseq [c consequences]
        (.appendChild ul (core/create-el "li" {} c)))
      (.appendChild panel ul))
    panel))

(defn- render-adr-browser [state render!]
  (let [selected-id (:adr-selected @state)
        selected-adr (first (filter #(= (:id %) selected-id) adrs))
        panel (core/create-el "div" {:class "adr-browser"})]
    (let [list-panel (core/create-el "div" {:class "adr-list"})]
      (.appendChild list-panel (core/create-el "h3" {:class "adr-list-heading"} "Architecture Decisions"))
      (.appendChild list-panel (core/create-el "p" {:class "adr-fowler-quote"}
        "\"The primary goal of architecture documentation is communication.\" — Martin Fowler"))
      (doseq [adr adrs]
        (.appendChild list-panel
          (adr-list-item adr (= (:id adr) selected-id)
            (fn [_]
              (swap! state assoc :adr-selected (:id adr))
              (render!)))))
      (.appendChild panel list-panel))
    (let [detail-panel (core/create-el "div" {:class "adr-detail-panel"})]
      (if selected-adr
        (.appendChild detail-panel (adr-detail selected-adr))
        (.appendChild detail-panel
          (core/create-el "div" {:class "adr-placeholder"}
            (core/create-el "p" {:class "adr-placeholder-text"}
              "Select a decision to view its context, rationale, and consequences.")
            (core/create-el "p" {:class "adr-placeholder-quote"}
              "\"Any fool can write code that a computer can understand. Good programmers write code that humans can understand.\" — Martin Fowler"))))
      (.appendChild panel detail-panel))
    panel))

;; ---------------------------------------------------------------------------
;; Main Layout
;; ---------------------------------------------------------------------------

(defn- architecture-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})
        tab-body  (core/create-el "div" {:class "tab-body"})
        state     (atom {:tab :c4 :adr-selected "ADR-001"})
        render!   (fn render! []
                    (set! (.-innerHTML tab-body) "")
                    (let [tab (:tab @state)]
                      (.appendChild tab-body
                        (case tab
                          :c4  (if (:c4-drill @state)
                                 (render-c4-containers state render!)
                                 (render-c4-context state render!))
                          :adr (render-adr-browser state render!)))))]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "Architecture Studio"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "Evolutionary architecture — C4 models and decision records"))
    (let [metrics (core/create-el "div" {:class "metrics-row"})]
      (doseq [[label value color]
              [["Systems"    "4"  "#0078d4"]
               ["Containers" "18" "#6a0dad"]
               ["ADRs"       "7"  "#00a86b"]
               ["Accepted"   "6"  "#b8860b"]]]
        (.appendChild metrics
          (core/create-el "div" {:class "metric-card"}
            (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
            (core/create-el "div" {:class "metric-label"} label))))
      (.appendChild container metrics))
    (let [tabs (core/create-el "div" {:class "tab-bar"})]
      (doseq [[label key] [["C4 Model" :c4] ["Decision Records" :adr]]]
        (let [btn (core/create-el "button"
                    {:class (str "tab-btn" (when (= key (:tab @state)) " active"))} label)]
          (.addEventListener btn "click"
            (fn [_]
              (swap! state assoc :tab key)
              (render!)
              (let [btns (.querySelectorAll tabs ".tab-btn")]
                (doseq [b (array-seq btns)]
                  (.remove (.-classList b) "active")))
              (.add (.-classList btn) "active")))
          (.appendChild tabs btn)))
      (.appendChild container tabs))
    (.appendChild container tab-body)
    (render!)
    container))

(defn init []
  (core/mount!
    (ui/page-shell :architecture "/articles/architecture-studio.html"
                   "src/portfolio/pro/architecture.cljs"
                   (architecture-content))))
