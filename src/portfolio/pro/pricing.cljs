(ns portfolio.pro.pricing
  "Pricing & Cost Optimizer — SKU selection, tagging, naming, cost impact."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

;; ---------------------------------------------------------------------------
;; Mock data — inspired by real Azure governance patterns
;; ---------------------------------------------------------------------------

(def ^:private services
  [{:name "Compute"   :icon "⚙"  :skus [{:id "B2s"   :vcpu 2  :ram "4 GB"   :cost 30}
                                          {:id "D4s_v5" :vcpu 4  :ram "16 GB"  :cost 140}
                                          {:id "D8s_v5" :vcpu 8  :ram "32 GB"  :cost 280}
                                          {:id "E16s_v5" :vcpu 16 :ram "128 GB" :cost 580}]}
   {:name "Storage"   :icon "💾"  :skus [{:id "LRS-Hot"      :tier "Hot"       :cost 18}
                                          {:id "ZRS-Hot"      :tier "Hot (ZRS)" :cost 36}
                                          {:id "LRS-Cool"     :tier "Cool"      :cost 10}
                                          {:id "GRS-Archive"  :tier "Archive"   :cost 3}]}
   {:name "Database"  :icon "🗄"  :skus [{:id "Basic-5DTU"    :tier "Basic"    :cost 5}
                                          {:id "S1-20DTU"      :tier "Standard" :cost 30}
                                          {:id "P1-125DTU"     :tier "Premium"  :cost 465}
                                          {:id "Serverless-GP" :tier "GP-Flex"  :cost 55}]}
   {:name "Network"   :icon "🌐"  :skus [{:id "Basic-LB"    :tier "Basic"     :cost 0}
                                          {:id "Standard-LB" :tier "Standard"  :cost 22}
                                          {:id "App-GW-v2"   :tier "App GW"    :cost 175}
                                          {:id "Front-Door"  :tier "Front Door" :cost 330}]}])

(def ^:private required-tags
  [{:key "CostCenter"   :purpose "Cost allocation"             :default "Inherited from subscription"}
   {:key "Environment"  :purpose "dev / tst / stg / prd"       :default "Based on subscription naming"}
   {:key "Owner"        :purpose "Team or individual"           :default "Creator (event-driven)"}
   {:key "Project"      :purpose "Project or workload name"     :default "—"}])

(def ^:private naming-examples
  [{:type "Function App" :pattern "func-{project}-{env}-{region}" :example "func-skpcerts-prd-scus"}
   {:type "Storage"      :pattern "st{project}{env}{region}{uid}"  :example "stskpcertsprdscus001"}
   {:type "Key Vault"    :pattern "kv-{project}-{env}-{region}"    :example "kv-skpcerts-prd-scus"}
   {:type "SQL Server"   :pattern "sql-{project}-{env}-{region}"   :example "sql-edm-prd-scus-001"}
   {:type "App Service"  :pattern "app-{project}-{env}-{region}"   :example "app-website-prd-scus"}])

(def ^:private jml-scenarios
  [{:id "hire"     :label "New Hire"     :icon "🟢" :multiplier 1.15 :desc "+15% — onboarding licenses, provisioning"}
   {:id "transfer" :label "Transfer"     :icon "🔄" :multiplier 1.05 :desc "+5% — role change, access reconfig"}
   {:id "steady"   :label "Steady State" :icon "⚡" :multiplier 1.0  :desc "Baseline — no JML event"}
   {:id "leave"    :label "Offboard"     :icon "🔴" :multiplier 0.6  :desc "−40% — license reclaim, deprovision"}])

;; ---------------------------------------------------------------------------
;; State
;; ---------------------------------------------------------------------------

(def ^:private state
  (atom {:selections (into {} (map (fn [svc] [(:name svc) (-> svc :skus first)]) services))
         :scenario   "steady"
         :tag-values {"CostCenter" "" "Environment" "dev" "Owner" "" "Project" ""}}))

(defn- compute-total []
  (let [{:keys [selections scenario]} @state
        base (reduce + (map :cost (vals selections)))
        mult (:multiplier (first (filter #(= (:id %) scenario) jml-scenarios)))]
    {:base base :adjusted (* base mult) :multiplier mult}))

;; ---------------------------------------------------------------------------
;; Components
;; ---------------------------------------------------------------------------

(defn- metrics-panel []
  (let [{:keys [base adjusted multiplier]} (compute-total)
        panel (core/create-el "div" {:class "metrics-row"})]
    (doseq [[label value color] [["Monthly Base"    (str "$" base)                   "#0078d4"]
                                  ["JML Adjusted"   (str "$" (.toFixed adjusted 2))   "#00a86b"]
                                  ["Multiplier"     (str multiplier "×")              "#b8860b"]
                                  ["Services"       (str (count services))             "#8b008b"]]]
      (.appendChild panel
        (core/create-el "div" {:class "metric-card"}
          (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
          (core/create-el "div" {:class "metric-label"} label))))
    panel))

(defn- sku-selector [svc on-change]
  (let [card (core/create-el "div" {:class "stage-card"}
               (core/create-el "div" {:class "stage-header"}
                 (core/create-el "span" {:class "stage-icon"} (:icon svc))
                 (core/create-el "span" {:class "stage-label"} (:name svc))))]
    (let [grid (core/create-el "div" {:class "sku-grid"})]
      (doseq [sku (:skus svc)]
        (let [selected? (= sku (get (:selections @state) (:name svc)))
              btn (core/create-el "button"
                    {:class (str "filter-btn" (when selected? " active"))}
                    (str (:id sku) " — $" (:cost sku) "/mo"))]
          (.addEventListener btn "click"
            (fn [_]
              (swap! state assoc-in [:selections (:name svc)] sku)
              ;; update active button in this grid
              (doseq [b (array-seq (.querySelectorAll grid ".filter-btn"))]
                (.remove (.-classList b) "active"))
              (.add (.-classList btn) "active")
              (on-change)
              (core/toast! (str (:icon svc) " " (:name svc) " → " (:id sku) " ($" (:cost sku) "/mo)"))))
          (.appendChild grid btn)))
      (.appendChild card grid))
    card))

(defn- sku-section [on-change]
  (let [section (core/create-el "div" {})]
    (.appendChild section (core/create-el "h3" {:class "log-title"} "💰 SKU Selection"))
    (let [grid (core/create-el "div" {:class "pipeline-flow" :style "flex-direction:column;align-items:stretch"})]
      (doseq [svc services]
        (.appendChild grid (sku-selector svc on-change)))
      (.appendChild section grid))
    section))

(defn- jml-section [on-change]
  (let [section (core/create-el "div" {})]
    (.appendChild section (core/create-el "h3" {:class "log-title"} "👤 JML Cost Impact"))
    (let [bar (core/create-el "div" {:class "filter-bar"})]
      (doseq [sc jml-scenarios]
        (let [btn (core/create-el "button"
                    {:class (str "filter-btn" (when (= (:id sc) (:scenario @state)) " active"))}
                    (str (:icon sc) " " (:label sc)))]
          (.addEventListener btn "click"
            (fn [_]
              (swap! state assoc :scenario (:id sc))
              (doseq [b (array-seq (.querySelectorAll bar ".filter-btn"))]
                (.remove (.-classList b) "active"))
              (.add (.-classList btn) "active")
              (on-change)
              (core/toast! (str (:icon sc) " " (:label sc) " — " (:desc sc)))))
          (.appendChild bar btn)))
      (.appendChild section bar))
    section))

(defn- tag-table []
  (let [section (core/create-el "div" {})]
    (.appendChild section (core/create-el "h3" {:class "log-title"} "🏷 Required Tags (Modify Policy)"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["Tag" "Purpose" "Default Value"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [tag required-tags]
          (let [row (core/create-el "tr" {})]
            (.appendChild row (core/create-el "td" {:style "font-family:monospace;font-weight:600"} (:key tag)))
            (.appendChild row (core/create-el "td" {} (:purpose tag)))
            (.appendChild row (core/create-el "td" {:style "color:var(--clr-text-muted)"} (:default tag)))
            (.addEventListener row "click"
              (fn [_] (core/toast! (str "🏷 " (:key tag) " — " (:purpose tag)))))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild section table))
    section))

(defn- naming-table []
  (let [section (core/create-el "div" {})]
    (.appendChild section (core/create-el "h3" {:class "log-title"} "📐 CAF Naming Convention"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["Resource Type" "Pattern" "Example"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [n naming-examples]
          (let [row (core/create-el "tr" {})]
            (.appendChild row (core/create-el "td" {} (:type n)))
            (.appendChild row (core/create-el "td" {:style "font-family:monospace"} (:pattern n)))
            (.appendChild row (core/create-el "td" {:style "font-family:monospace;color:var(--clr-accent)"} (:example n)))
            (.addEventListener row "click"
              (fn [_] (core/toast! (str "📐 " (:type n) " → " (:example n)))))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild section table))
    section))

;; ---------------------------------------------------------------------------
;; Main
;; ---------------------------------------------------------------------------

(defn- pricing-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})
        metrics-slot (atom nil)
        refresh! (fn []
                   (when-let [old @metrics-slot]
                     (let [parent (.-parentNode old)
                           fresh (metrics-panel)]
                       (.replaceChild parent fresh old)
                       (reset! metrics-slot fresh))))]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "Pricing & Cost Optimizer"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "SKU selection, CAF tagging & naming standards, and JML lifecycle cost impacts"))
    (let [m (metrics-panel)]
      (reset! metrics-slot m)
      (.appendChild container m))
    (.appendChild container (sku-section refresh!))
    (.appendChild container (jml-section refresh!))
    (.appendChild container (tag-table))
    (.appendChild container (naming-table))
    container))

(defn init []
  (core/mount!
    (ui/page-shell :pricing "/articles/pricing-optimizer.html" "src/portfolio/pro/pricing.cljs"
                   (pricing-content))))
