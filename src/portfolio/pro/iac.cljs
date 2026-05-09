(ns portfolio.pro.iac
  "IaC Deployment Pipeline — GitHub Actions → OIDC → Bicep AVM → Deployment Stacks."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

(def ^:private pipeline-steps
  [{:id :push     :label "git push main"       :icon "📤" :color "#ADD8E6" :detail "Trunk-based delivery — no feature branches"}
   {:id :oidc     :label "OIDC Federation"      :icon "🔑" :color "#E0FFFF" :detail "Workload identity — no stored secrets"}
   {:id :whatif   :label "Bicep what-if"        :icon "🔍" :color "#FFF8DC" :detail "Preview changes before deployment"}
   {:id :avm      :label "AVM Modules"          :icon "📦" :color "#90EE90" :detail "Azure Verified Modules from public registry"}
   {:id :stack    :label "Deployment Stack"      :icon "🏗" :color "#FFB6C1" :detail "Lifecycle-managed resource groups"}
   {:id :azure    :label "Azure Resources"       :icon "☁" :color "#ADD8E6" :detail "Idempotent, drift-free infrastructure"}])

(def ^:private what-if-output
  [{:resource "func-skpad-dev-usw2-001"  :type "Microsoft.Web/sites"                :change :modify :detail "Update appSettings"}
   {:resource "st-skpad-dev-usw2-001"    :type "Microsoft.Storage/storageAccounts"   :change :no-change :detail ""}
   {:resource "kv-skpad-dev-usw2-001"    :type "Microsoft.KeyVault/vaults"           :change :no-change :detail ""}
   {:resource "umi-skpad-dev-usw2-ctl"   :type "Microsoft.ManagedIdentity/userAssignedIdentities" :change :no-change :detail ""}
   {:resource "evh-skpad-dev-usw2-001"   :type "Microsoft.EventHub/namespaces"      :change :create :detail "New Event Hub namespace"}])

(def ^:private change-colors
  {:create    "#00a86b"
   :modify    "#ffaa00"
   :delete    "#ff0040"
   :no-change "#888888"})

(defn- step-card [{:keys [label icon color detail]} active]
  (core/create-el "div" {:class (str "stage-card" (when active " active"))
                          :style (str "border-left: 4px solid " color)}
    (core/create-el "div" {:class "stage-header"}
      (core/create-el "span" {:class "stage-icon"} icon)
      (core/create-el "span" {:class "stage-label"} label))
    (core/create-el "p" {:class "stage-desc"} detail)))

(defn- what-if-panel []
  (let [panel (core/create-el "div" {:class "whatif-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "whatif-title"} "🔍 What-If Preview"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["Resource" "Type" "Change" "Detail"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [r what-if-output]
          (let [row (core/create-el "tr" {})
                change-badge (core/create-el "span"
                               {:class "effect-badge"
                                :style (str "background:" (get change-colors (:change r)))}
                               (name (:change r)))]
            (.appendChild row (core/create-el "td" {:class "resource-name"} (:resource r)))
            (.appendChild row (core/create-el "td" {} (:type r)))
            (let [td (core/create-el "td" {})]
              (.appendChild td change-badge)
              (.appendChild row td))
            (.appendChild row (core/create-el "td" {} (:detail r)))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild panel table))
    panel))

(defn- naming-panel []
  (let [panel (core/create-el "div" {:class "naming-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "naming-title"} "📐 CAF Naming Convention"))
    (.appendChild panel
      (core/create-el "pre" {:class "kql-code"}
        (str "{type}-{project}-{env}-{region}-{instance}\n"
             "│       │        │      │        │\n"
             "│       │        │      │        └─ 001, 002, ctl, dat\n"
             "│       │        │      └─ usw2 (West US 2)\n"
             "│       │        └─ dev, stg, prd\n"
             "│       └─ skpad, skpedm, skpmgt\n"
             "└─ func, st, kv, umi, evh, rg")))
    panel))

(defn- iac-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})
        state     (atom {:active-step 0})]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "IaC Deployment Pipeline"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "GitHub Actions → OIDC → Bicep AVM → Deployment Stacks — trunk-based, zero secrets"))
    (let [metrics (core/create-el "div" {:class "metrics-row"})]
      (doseq [[label value color] [["Bicep Stacks" "8" "#0078d4"]
                                    ["AVM Modules" "12" "#00a86b"]
                                    ["Drift Detected" "0" "#00a86b"]
                                    ["Deploy Cadence" "Daily" "#b8860b"]]]
        (.appendChild metrics
          (core/create-el "div" {:class "metric-card"}
            (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
            (core/create-el "div" {:class "metric-label"} label))))
      (.appendChild container metrics))
    ;; pipeline flow
    (let [flow (core/create-el "div" {:class "pipeline-flow"})]
      (doseq [[i step] (map-indexed vector pipeline-steps)]
        (when (pos? i) (.appendChild flow (core/create-el "div" {:class "flow-arrow"} "→")))
        (.appendChild flow (step-card step (= i 0))))
      (.appendChild container flow))
    ;; animate steps
    (js/setInterval
      (fn []
        (swap! state update :active-step #(mod (inc %) (count pipeline-steps)))
        (let [flow (.querySelector container ".pipeline-flow")]
          (when flow
            (let [new-flow (core/create-el "div" {:class "pipeline-flow"})]
              (doseq [[i step] (map-indexed vector pipeline-steps)]
                (when (pos? i) (.appendChild new-flow (core/create-el "div" {:class "flow-arrow"} "→")))
                (.appendChild new-flow (step-card step (= i (:active-step @state)))))
              (.replaceChild (.-parentNode flow) new-flow flow)))))
      2000)
    (.appendChild container (what-if-panel))
    (.appendChild container (naming-panel))
    container))

(defn init []
  (core/mount!
    (ui/page-shell :iac "/articles/iac-pipeline.html" "src/portfolio/pro/iac.cljs"
                   (iac-content))))
