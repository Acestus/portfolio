(ns portfolio.pro.pricing
  "Pricing & Cost Optimizer — Azure + Fabric + AI Foundry FinOps with RI/SP toggle."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

;; ---------------------------------------------------------------------------
;; Mock data — Build 2026 refresh: Fabric SKUs + AI Foundry + RI/SP toggle
;; ---------------------------------------------------------------------------

(def ^:private services
  [{:name "Compute"   :icon "⚙"
    :skus [{:id "B2s"      :spec "2 vCPU · 4 GB"     :cost 30  :ri 0.65 :sp 0.72}
           {:id "D4s_v5"   :spec "4 vCPU · 16 GB"    :cost 140 :ri 0.62 :sp 0.70}
           {:id "D8s_v5"   :spec "8 vCPU · 32 GB"    :cost 280 :ri 0.62 :sp 0.70}
           {:id "E16s_v5"  :spec "16 vCPU · 128 GB"  :cost 580 :ri 0.58 :sp 0.66}]}
   {:name "Storage"   :icon "💾"
    :skus [{:id "LRS-Hot"      :spec "Block blob · Hot"     :cost 18 :ri 1.0  :sp 1.0}
           {:id "ZRS-Hot"      :spec "Zone-redundant · Hot" :cost 36 :ri 1.0  :sp 1.0}
           {:id "LRS-Cool"     :spec "Cool tier"             :cost 10 :ri 1.0  :sp 1.0}
           {:id "GRS-Archive"  :spec "Geo-redundant Archive" :cost 3  :ri 1.0  :sp 1.0}]}
   {:name "Database"  :icon "🗄"
    :skus [{:id "Basic-5DTU"    :spec "5 DTU · 2 GB"       :cost 5   :ri 0.75 :sp 0.80}
           {:id "S1-20DTU"      :spec "20 DTU · 250 GB"    :cost 30  :ri 0.70 :sp 0.78}
           {:id "P1-125DTU"     :spec "125 DTU · 500 GB"   :cost 465 :ri 0.55 :sp 0.63}
           {:id "Serverless-GP" :spec "GP-Flex auto-pause" :cost 55  :ri 1.0  :sp 1.0}]}
   {:name "Network"   :icon "🌐"
    :skus [{:id "Basic-LB"    :spec "Basic Load Balancer"  :cost 0   :ri 1.0 :sp 1.0}
           {:id "Standard-LB" :spec "Standard LB · zonal"  :cost 22  :ri 1.0 :sp 1.0}
           {:id "App-GW-v2"   :spec "WAF v2 · 2 capacity"  :cost 175 :ri 1.0 :sp 1.0}
           {:id "Front-Door"  :spec "Standard tier"         :cost 330 :ri 1.0 :sp 1.0}]}
   {:name "Fabric"    :icon "🧵"
    :skus [{:id "F2"   :spec "2 CU · ~$262/mo"   :cost 262   :ri 0.59 :sp 0.69}
           {:id "F8"   :spec "8 CU · ~$1,051/mo" :cost 1051  :ri 0.59 :sp 0.69}
           {:id "F32"  :spec "32 CU · ~$4,203/mo" :cost 4203 :ri 0.59 :sp 0.69}
           {:id "F64"  :spec "64 CU · ~$8,406/mo" :cost 8406 :ri 0.59 :sp 0.69}]}
   {:name "AI Foundry" :icon "🤖"
    :skus [{:id "gpt-4o-mini" :spec "$0.15 in / $0.60 out per 1M tok" :cost 45   :ri 1.0 :sp 1.0}
           {:id "gpt-4o"      :spec "$2.50 in / $10.00 out per 1M tok" :cost 320  :ri 1.0 :sp 1.0}
           {:id "o1"          :spec "$15 in / $60 out per 1M tok"      :cost 1850 :ri 1.0 :sp 1.0}
           {:id "embed-3-lg"  :spec "$0.13 per 1M tok · 3072 dim"      :cost 22   :ri 1.0 :sp 1.0}]}])

(def ^:private commitments
  [{:id "payg"  :label "Pay-As-You-Go" :icon "💳" :desc "On-demand list price — no commitment"}
   {:id "ri1"   :label "RI 1-Year"     :icon "📅" :desc "1-year reservation — ~30–45% off compute"}
   {:id "ri3"   :label "RI 3-Year"     :icon "📆" :desc "3-year reservation — up to 72% off"}
   {:id "sp"    :label "Savings Plan"  :icon "💹" :desc "Flexible 1-yr commit on $/hr spend"}])

(def ^:private required-tags
  [{:key "CostCenter"   :purpose "Cost allocation & chargeback"  :default "Inherited from subscription"}
   {:key "Environment"  :purpose "dev / tst / stg / prd"          :default "Subscription naming"}
   {:key "Owner"        :purpose "Team or individual"             :default "Creator (event-driven)"}
   {:key "Project"      :purpose "Workload or initiative"         :default "—"}
   {:key "BuildEvent"   :purpose "MS Build 2026 tag for tracking" :default "false"}])

(def ^:private naming-examples
  [{:type "Function App" :pattern "func-{project}-{env}-{region}-{instance}" :example "func-copilot-prd-usw2-001"}
   {:type "Storage"      :pattern "st{project}{env}{region}{instance}"        :example "stcopilotprdusw2001"}
   {:type "Key Vault"    :pattern "kv-{project}-{env}-{region}-{instance}"    :example "kv-copilot-prd-usw2-001"}
   {:type "Fabric Cap"   :pattern "cap-{domain}-{env}-{region}-{instance}"    :example "cap-edm-prd-usw2-001"}
   {:type "AI Foundry"   :pattern "oai-{project}-{env}-{region}-{instance}"   :example "oai-copilot-prd-usw2-001"}
   {:type "App Service"  :pattern "app-{project}-{env}-{region}-{instance}"   :example "app-portfolio-prd-usw2-001"}])

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
         :commitment "payg"
         :tag-values {"CostCenter" "" "Environment" "dev" "Owner" "" "Project" "" "BuildEvent" "true"}}))

(defn- discount-factor [sku commitment]
  (case commitment
    "ri1" (:ri sku 1.0)
    "ri3" (max 0.28 (- (:ri sku 1.0) 0.20))
    "sp"  (:sp sku 1.0)
    1.0))

(defn- compute-total []
  (let [{:keys [selections scenario commitment]} @state
        base     (reduce + (map :cost (vals selections)))
        committed (reduce + (map #(* (:cost %) (discount-factor % commitment)) (vals selections)))
        mult     (:multiplier (first (filter #(= (:id %) scenario) jml-scenarios)))
        savings  (- base committed)]
    {:base base :committed committed :adjusted (* committed mult) :multiplier mult :savings savings}))

;; ---------------------------------------------------------------------------
;; Components
;; ---------------------------------------------------------------------------

(defn- fmt-money [n]
  (str "$" (.toLocaleString (.round js/Math n))))

(defn- metrics-panel []
  (let [{:keys [base committed adjusted multiplier savings]} (compute-total)
        panel (core/create-el "div" {:class "metrics-row"})]
    (doseq [[label value color] [["List Price"       (fmt-money base)     "#0078d4"]
                                  ["After Commit"    (fmt-money committed) "#00a86b"]
                                  ["Monthly Savings" (fmt-money savings)   "#7e57c2"]
                                  ["JML Adjusted"    (fmt-money adjusted)  "#b8860b"]
                                  ["JML Multiplier"  (str multiplier "×")  "#d83b01"]]]
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
                    {:class (str "filter-btn" (when selected? " active"))
                     :title (:spec sku)}
                    (str (:id sku) " — $" (.toLocaleString (:cost sku)) "/mo"))]
          (.addEventListener btn "click"
            (fn [_]
              (swap! state assoc-in [:selections (:name svc)] sku)
              (doseq [b (array-seq (.querySelectorAll grid ".filter-btn"))]
                (.remove (.-classList b) "active"))
              (.add (.-classList btn) "active")
              (on-change)
              (core/toast! (str (:icon svc) " " (:name svc) " → " (:id sku)
                                " · " (:spec sku)))))
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

(defn- commitment-section [on-change]
  (let [section (core/create-el "div" {})]
    (.appendChild section (core/create-el "h3" {:class "log-title"} "💳 Commitment Term"))
    (.appendChild section (core/create-el "p" {:class "panel-sub"}
      "Reserved Instances and Savings Plans apply automatically to eligible SKUs (Compute, Database, Fabric)."))
    (let [bar (core/create-el "div" {:class "filter-bar"})]
      (doseq [c commitments]
        (let [btn (core/create-el "button"
                    {:class (str "filter-btn" (when (= (:id c) (:commitment @state)) " active"))
                     :title (:desc c)}
                    (str (:icon c) " " (:label c)))]
          (.addEventListener btn "click"
            (fn [_]
              (swap! state assoc :commitment (:id c))
              (doseq [b (array-seq (.querySelectorAll bar ".filter-btn"))]
                (.remove (.-classList b) "active"))
              (.add (.-classList btn) "active")
              (on-change)
              (core/toast! (str (:icon c) " " (:label c) " — " (:desc c)))))
          (.appendChild bar btn)))
      (.appendChild section bar))
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
      "Azure · Fabric · AI Foundry — SKU selection, commitment terms, CAF governance, JML lifecycle"))
    (let [m (metrics-panel)]
      (reset! metrics-slot m)
      (.appendChild container m))
    (.appendChild container (sku-section refresh!))
    (.appendChild container (commitment-section refresh!))
    (.appendChild container (jml-section refresh!))
    (.appendChild container (tag-table))
    (.appendChild container (naming-table))
    container))

(defn init []
  (core/mount!
    (ui/page-shell :pricing "/articles/pricing-optimizer.html" "src/portfolio/pro/pricing.cljs"
                   (pricing-content))))
