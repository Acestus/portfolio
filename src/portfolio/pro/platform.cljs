(ns portfolio.pro.platform
  "Platform Engineering Console — workspace provisioning, Copilot agents, PIM/RBAC."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

(def ^:private workspaces
  [{:name "ws_ad_dev"   :env "dev" :status "Active"  :git-sync true  :items 12}
   {:name "ws_ad_stg"   :env "stg" :status "Active"  :git-sync true  :items 12}
   {:name "ws_ad_prd"   :env "prd" :status "Active"  :git-sync true  :items 12}
   {:name "ws_edm_dev"  :env "dev" :status "Active"  :git-sync true  :items 8}
   {:name "ws_edm_prd"  :env "prd" :status "Active"  :git-sync true  :items 8}
   {:name "ws_logs_dev" :env "dev" :status "Active"  :git-sync true  :items 6}])

(def ^:private copilot-agents
  [{:name "Confluence Search"   :desc "Search infrastructure knowledge base by topic, tag, or keyword" :icon "🔍"}
   {:name "Sprint Planner"      :desc "Draft sprint plans from backlog items and team capacity"        :icon "📋"}
   {:name "Meeting Recap"       :desc "Summarize Teams meetings with action items and decisions"       :icon "📝"}])

(def ^:private pim-roles
  [{:role "Fabric Admin"        :scope "ws_ad_prd"   :duration "8 hours" :justification "Pipeline deploy"}
   {:role "Key Vault Officer"   :scope "kv-skpad-prd" :duration "4 hours" :justification "Secret rotation"}
   {:role "Contributor"         :scope "rg-skpad-prd" :duration "8 hours" :justification "Stack deployment"}])

(defn- tab-button [label active on-click]
  (let [btn (core/create-el "button"
              {:class (str "tab-btn" (when active " active"))} label)]
    (.addEventListener btn "click" on-click)
    btn))

(defn- workspace-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "🏗 Fabric Workspaces"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["Workspace" "Env" "Status" "Git Sync" "Items"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [ws workspaces]
          (let [row (core/create-el "tr" {})]
            (doseq [v [(:name ws) (:env ws) (:status ws)
                        (if (:git-sync ws) "✅" "❌") (str (:items ws))]]
              (.appendChild row (core/create-el "td" {} v)))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild panel table))
    panel))

(defn- agents-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "🤖 M365 Copilot Agents"))
    (doseq [agent copilot-agents]
      (.appendChild panel
        (core/create-el "div" {:class "agent-card"}
          (core/create-el "span" {:class "agent-icon"} (:icon agent))
          (core/create-el "div" {:class "agent-info"}
            (core/create-el "div" {:class "agent-name"} (:name agent))
            (core/create-el "div" {:class "agent-desc"} (:desc agent))))))
    panel))

(defn- pim-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "🔐 PIM — Just-in-Time Access"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["Role" "Scope" "Duration" "Justification"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [r pim-roles]
          (let [row (core/create-el "tr" {})]
            (doseq [v [(:role r) (:scope r) (:duration r) (:justification r)]]
              (.appendChild row (core/create-el "td" {} v)))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild panel table))
    panel))

(defn- platform-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})
        tab-body  (core/create-el "div" {:class "tab-body"})
        state     (atom {:tab :workspaces})
        render-tab (fn [tab]
                     (set! (.-innerHTML tab-body) "")
                     (.appendChild tab-body
                       (case tab
                         :workspaces (workspace-panel)
                         :agents     (agents-panel)
                         :pim        (pim-panel))))]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "Platform Engineering Console"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "Workspace provisioning, Copilot agents, and PIM role activation"))
    (let [metrics (core/create-el "div" {:class "metrics-row"})]
      (doseq [[label value color] [["Workspaces" "6" "#0078d4"]
                                    ["Copilot Agents" "3" "#8b008b"]
                                    ["Onboarded Teams" "4" "#00a86b"]
                                    ["PIM Activations/wk" "12" "#b8860b"]]]
        (.appendChild metrics
          (core/create-el "div" {:class "metric-card"}
            (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
            (core/create-el "div" {:class "metric-label"} label))))
      (.appendChild container metrics))
    (let [tabs (core/create-el "div" {:class "tab-bar"})]
      (doseq [[label key] [["Workspaces" :workspaces] ["Copilot Agents" :agents] ["PIM Access" :pim]]]
        (.appendChild tabs
          (tab-button label (= key (:tab @state))
            (fn [_]
              (reset! state {:tab key})
              (render-tab key)
              (let [btns (.querySelectorAll tabs ".tab-btn")]
                (doseq [b (array-seq btns)]
                  (.remove (.-classList b) "active"))
                (.. (js/event) -target -classList (add "active")))))))
      (.appendChild container tabs))
    (.appendChild container tab-body)
    (render-tab :workspaces)
    container))

(defn init []
  (core/mount!
    (ui/page-shell :platform "/articles/platform-console.html" "src/portfolio/pro/platform.cljs"
                   (platform-content))))
