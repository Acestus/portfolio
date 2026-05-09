(ns portfolio.pro.policy
  "Azure Policy Governance Dashboard — interactive policy tree."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

(def ^:private policies
  [{:name "Require resource tags"           :effect :deny    :scope "Tenant Root"      :compliance 94}
   {:name "Deploy AMA on VMs"              :effect :dine    :scope "All Subscriptions" :compliance 87}
   {:name "Enforce TLS 1.2 on storage"     :effect :deny    :scope "All Subscriptions" :compliance 100}
   {:name "Append diagnostic settings"     :effect :modify  :scope "All Subscriptions" :compliance 92}
   {:name "Allowed VM SKUs"                :effect :deny    :scope "Corp-530-EDM"      :compliance 100}
   {:name "Key Vault soft-delete required" :effect :deny    :scope "All Subscriptions" :compliance 100}
   {:name "Public network access denied"   :effect :deny    :scope "All Subscriptions" :compliance 78}
   {:name "Enforce private endpoints"      :effect :audit   :scope "Corp-520-AppDev"   :compliance 65}
   {:name "Auto-tag cost center"           :effect :modify  :scope "Tenant Root"       :compliance 96}
   {:name "Deploy NSG flow logs"           :effect :dine    :scope "Connectivity"      :compliance 88}])

(def ^:private effect-colors
  {:deny   "#ff0040"
   :modify "#ffaa00"
   :audit  "#0078d4"
   :dine   "#00a86b"})

(def ^:private effect-labels
  {:deny "Deny" :modify "Modify" :audit "Audit" :dine "DeployIfNotExists"})

(defn- effect-badge [effect]
  (core/create-el "span" {:class "effect-badge"
                           :style (str "background:" (get effect-colors effect "#888"))}
    (get effect-labels effect "Unknown")))

(defn- compliance-bar [pct]
  (let [container (core/create-el "div" {:class "compliance-bar"})
        fill      (core/create-el "div" {:class "compliance-fill"
                                          :style (str "width:" pct "%;background:"
                                                      (cond (>= pct 90) "#00a86b"
                                                            (>= pct 70) "#ffaa00"
                                                            :else "#ff0040"))})]
    (.appendChild container fill)
    container))

(defn- policy-row [policy]
  (let [row (core/create-el "div" {:class "policy-row"})]
    (.appendChild row (core/create-el "div" {:class "policy-name"} (:name policy)))
    (.appendChild row (effect-badge (:effect policy)))
    (.appendChild row (core/create-el "div" {:class "policy-scope"} (:scope policy)))
    (.appendChild row (compliance-bar (:compliance policy)))
    (.appendChild row (core/create-el "div" {:class "policy-pct"} (str (:compliance policy) "%")))
    row))

(defn- summary-cards []
  (let [panel (core/create-el "div" {:class "metrics-row"})]
    (doseq [[label value color] [["Total Policies" "10" "#0078d4"]
                                  ["Compliant" "6" "#00a86b"]
                                  ["Needs Remediation" "3" "#ffaa00"]
                                  ["Critical" "1" "#ff0040"]]]
      (.appendChild panel
        (core/create-el "div" {:class "metric-card"}
          (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
          (core/create-el "div" {:class "metric-label"} label))))
    panel))

(defn- filter-bar [state container]
  (let [bar (core/create-el "div" {:class "filter-bar"})]
    (doseq [effect [:all :deny :modify :audit :dine]]
      (let [label (if (= effect :all) "All" (get effect-labels effect))
            btn (core/create-el "button"
                  {:class (str "filter-btn" (when (= effect (:filter @state)) " active"))}
                  label)]
        (.addEventListener btn "click"
          (fn [_]
            (swap! state assoc :filter effect)
            (let [list (.querySelector container ".policy-list")]
              (set! (.-innerHTML list) "")
              (doseq [p (if (= effect :all) policies (filter #(= (:effect %) effect) policies))]
                (.appendChild list (policy-row p))))))
        (.appendChild bar btn)))
    bar))

(defn- policy-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})
        state     (atom {:filter :all})]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "Azure Policy Governance"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "Tenant-wide policy assignments — deny, modify, audit, and deploy-if-not-exists"))
    (.appendChild container (summary-cards))
    (.appendChild container (filter-bar state container))
    (let [list (core/create-el "div" {:class "policy-list"})]
      (doseq [p policies]
        (.appendChild list (policy-row p)))
      (.appendChild container list))
    container))

(defn init []
  (core/mount!
    (ui/page-shell :policy "/articles/policy-dashboard.html" "src/portfolio/pro/policy.cljs"
                   (policy-content))))
