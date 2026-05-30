(ns portfolio.pro.fabriccap
  "Fabric Capacity Tuner — CU usage simulator with smoothing, 430 throttling, and SKU sizing."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

;; ---------------------------------------------------------------------------
;; Data
;; ---------------------------------------------------------------------------

(def ^:private skus
  [{:id "F2"    :cu 2    :price 262    :concurrent 5  :smoothing "Background only"}
   {:id "F8"   :cu 8    :price 1051   :concurrent 10 :smoothing "Background + Interactive 5min"}
   {:id "F16"  :cu 16   :price 2102   :concurrent 15 :smoothing "Background + Interactive 5min"}
   {:id "F32"  :cu 32   :price 4203   :concurrent 25 :smoothing "Background + Interactive 5min"}
   {:id "F64"  :cu 64   :price 8406   :concurrent 40 :smoothing "Full smoothing (24hr)"}
   {:id "F128" :cu 128  :price 16812  :concurrent 60 :smoothing "Full smoothing (24hr)"}
   {:id "F256" :cu 256  :price 33624  :concurrent 90 :smoothing "Full smoothing (24hr)"}])

(def ^:private workloads
  [{:icon "🧵" :name "Notebook (PySpark)"   :cu 4   :pattern "Bursty"     :tip "Each cell triggers a Spark job — interactive multiplier 1×"}
   {:icon "🔄" :name "Data Pipeline"        :cu 2   :pattern "Scheduled"  :tip "ELT orchestration — runs in background, smoothing applies"}
   {:icon "📊" :name "DirectLake Report"    :cu 1   :pattern "On-query"   :tip "Sub-second response — counts only on render"}
   {:icon "🗄" :name "Warehouse Query"      :cu 3   :pattern "Interactive" :tip "T-SQL endpoint — counts immediately, no smoothing"}
   {:icon "⚡" :name "Eventstream"          :cu 1.5 :pattern "Continuous" :tip "Always-on streaming — predictable steady-state"}
   {:icon "🤖" :name "ML Model Training"    :cu 8   :pattern "Batch"      :tip "Heavy Spark — schedule overnight if possible"}])

(def ^:private mitigations
  [{:icon "📅" :title "Move heavy jobs to overnight"
    :desc "Background workloads smooth over 24h; schedule notebooks + ETL to run 00:00–06:00 to spread CU peaks"
    :impact "Often eliminates 430s entirely on F32–F64 capacities"}
   {:icon "🔀" :title "Split workspaces by domain"
    :desc "Bind each business domain to its own capacity (ws_loanetl_brz on cap-edm-prd, ws_marketing on cap-mkt-prd) so a runaway notebook doesn't starve everyone"
    :impact "Blast radius shrinks from 'whole tenant' to 'one team'"}
   {:icon "🪣" :title "Use DirectLake instead of Import"
    :desc "Import mode reloads on every refresh — DirectLake reads OneLake parquet on-query, near-zero refresh CU"
    :impact "Reports drop from peaks of 8–12 CU to <1 CU each"}
   {:icon "⏸" :title "Pause non-prod capacities"
    :desc "F-SKUs bill per second — `az fabric capacity suspend` on dev/stg outside business hours"
    :impact "60–70% monthly savings on non-prod"}
   {:icon "📈" :title "Right-size with capacity metrics app"
    :desc "Install the Microsoft Fabric Capacity Metrics app, look at peak smoothed % over 7d — if always <40%, downsize"
    :impact "F64 → F32 saves $4,200/mo if utilization supports it"}])

(def ^:private symptoms
  [{:code "429" :name "Too Many Requests" :meaning "Tenant-level API rate limit — independent of capacity sizing"}
   {:code "430" :name "Capacity Throttled" :meaning "Your CU smoothed-usage exceeded 100% — workloads are queued/rejected"}
   {:code "503" :name "Capacity Unavailable" :meaning "Capacity paused, deleted, or in a fault state"}])

;; ---------------------------------------------------------------------------
;; State
;; ---------------------------------------------------------------------------

(def ^:private state
  (atom {:sku        (first skus)
         :selected   (set (map :name (take 3 workloads)))
         :concurrent 3
         :tab        :sizing}))

(defn- workload-by-name [n] (first (filter #(= n (:name %)) workloads)))

(defn- total-cu []
  (let [picked (map workload-by-name (:selected @state))
        mult   (:concurrent @state)]
    (* mult (reduce + (map :cu picked)))))

(defn- utilization []
  (let [cu (total-cu)
        cap (:cu (:sku @state))]
    (if (zero? cap) 0 (/ (* 100.0 cu) cap))))

(defn- throttle-status []
  (let [u (utilization)]
    (cond
      (< u 50)  {:label "Healthy"      :color "#00a86b" :icon "✅"}
      (< u 80)  {:label "Watch"        :color "#b8860b" :icon "⚠"}
      (< u 100) {:label "Smoothing"    :color "#d83b01" :icon "🟠"}
      :else     {:label "430 Throttle" :color "#a4262c" :icon "🛑"})))

;; ---------------------------------------------------------------------------
;; Components
;; ---------------------------------------------------------------------------

(defn- fmt-money [n] (str "$" (.toLocaleString n)))

(defn- metrics-panel []
  (let [cu (total-cu)
        cap (:cu (:sku @state))
        util (utilization)
        st (throttle-status)
        panel (core/create-el "div" {:class "metrics-row"})]
    (doseq [[label value color]
            [["SKU"            (:id (:sku @state))                    "#0078d4"]
             ["Monthly Cost"   (fmt-money (:price (:sku @state)))     "#7e57c2"]
             ["Total CU Need"  (str (.toFixed cu 1) " CU")             "#b8860b"]
             ["Capacity"       (str cap " CU")                          "#605e5c"]
             ["Utilization"    (str (.toFixed util 0) "%")              (:color st)]
             ["Status"         (str (:icon st) " " (:label st))         (:color st)]]]
      (.appendChild panel
        (core/create-el "div" {:class "metric-card"}
          (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
          (core/create-el "div" {:class "metric-label"} label))))
    panel))

(defn- sku-section [on-change]
  (let [section (core/create-el "div" {:class "panel"})]
    (.appendChild section (core/create-el "h3" {:class "panel-title"} "🧵 Pick a Fabric SKU"))
    (.appendChild section (core/create-el "p" {:class "panel-sub"}
      "F-SKUs are sized in Capacity Units (CU). 1 CU ≈ 1 vCore. Bigger SKUs get longer smoothing windows."))
    (let [bar (core/create-el "div" {:class "filter-bar"})]
      (doseq [sku skus]
        (let [active? (= sku (:sku @state))
              btn (core/create-el "button"
                    {:class (str "filter-btn" (when active? " active"))
                     :title (:smoothing sku)}
                    (str (:id sku) " · " (fmt-money (:price sku)) "/mo"))]
          (.addEventListener btn "click"
            (fn [_]
              (swap! state assoc :sku sku)
              (doseq [b (array-seq (.querySelectorAll bar ".filter-btn"))]
                (.remove (.-classList b) "active"))
              (.add (.-classList btn) "active")
              (on-change)
              (core/toast! (str "🧵 " (:id sku) " — " (:smoothing sku)))))
          (.appendChild bar btn)))
      (.appendChild section bar))
    section))

(defn- workload-section [on-change]
  (let [section (core/create-el "div" {:class "panel"})]
    (.appendChild section (core/create-el "h3" {:class "panel-title"} "📦 Workload Mix"))
    (.appendChild section (core/create-el "p" {:class "panel-sub"}
      "Toggle the workloads running on this capacity. Each one consumes CU per concurrent execution."))
    (let [grid (core/create-el "div" {:class "card-grid"})]
      (doseq [w workloads]
        (let [active? (contains? (:selected @state) (:name w))
              card (core/create-el "div"
                     {:class (str "agent-card" (when active? " active"))
                      :style (str "cursor:pointer;"
                                  (when active? "border:2px solid var(--clr-accent)"))}
                     (core/create-el "span" {:class "agent-icon"} (:icon w))
                     (core/create-el "div" {:class "agent-info"}
                       (core/create-el "div" {:class "agent-name"} (:name w))
                       (core/create-el "div" {:class "agent-desc"}
                         (str (:cu w) " CU · " (:pattern w) " · " (:tip w)))))]
          (.addEventListener card "click"
            (fn [_]
              (swap! state update :selected
                     (fn [s] (if (contains? s (:name w)) (disj s (:name w)) (conj s (:name w)))))
              (on-change)
              (core/toast! (str (:icon w) " " (if active? "removed" "added") " — " (:name w)))))
          (.appendChild grid card)))
      (.appendChild section grid))
    section))

(defn- concurrency-section [on-change]
  (let [section (core/create-el "div" {:class "panel"})]
    (.appendChild section (core/create-el "h3" {:class "panel-title"} "👥 Concurrent Users"))
    (.appendChild section (core/create-el "p" {:class "panel-sub"}
      "Each active user triggers one execution of the workload mix. Smoothing window absorbs short bursts, sustained load → 430."))
    (let [bar (core/create-el "div" {:class "filter-bar"})]
      (doseq [n [1 3 5 10 20 50]]
        (let [active? (= n (:concurrent @state))
              btn (core/create-el "button"
                    {:class (str "filter-btn" (when active? " active"))}
                    (str n " user" (if (= n 1) "" "s")))]
          (.addEventListener btn "click"
            (fn [_]
              (swap! state assoc :concurrent n)
              (doseq [b (array-seq (.querySelectorAll bar ".filter-btn"))]
                (.remove (.-classList b) "active"))
              (.add (.-classList btn) "active")
              (on-change)
              (core/toast! (str "👥 " n " concurrent user" (if (= n 1) "" "s")))))
          (.appendChild bar btn)))
      (.appendChild section bar))
    section))

(defn- mitigation-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "🧯 Mitigations"))
    (let [grid (core/create-el "div" {:class "card-grid"})]
      (doseq [m mitigations]
        (let [card (core/create-el "div" {:class "agent-card" :style "cursor:pointer"}
                     (core/create-el "span" {:class "agent-icon"} (:icon m))
                     (core/create-el "div" {:class "agent-info"}
                       (core/create-el "div" {:class "agent-name"} (:title m))
                       (core/create-el "div" {:class "agent-desc"} (:desc m))
                       (core/create-el "div" {:style "color:var(--clr-accent);margin-top:0.3rem;font-weight:600"} (:impact m))))]
          (.addEventListener card "click"
            (fn [_] (core/toast! (str (:icon m) " " (:title m) " — " (:impact m)))))
          (.appendChild grid card)))
      (.appendChild panel grid))
    panel))

(defn- symptoms-panel []
  (let [panel (core/create-el "div" {:class "panel"})]
    (.appendChild panel (core/create-el "h3" {:class "panel-title"} "🩺 HTTP Status Decoder"))
    (.appendChild panel (core/create-el "p" {:class "panel-sub"}
      "When Fabric APIs reject calls, the status code tells you exactly what failed."))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["Code" "Name" "Meaning"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [s symptoms]
          (let [row (core/create-el "tr" {})]
            (.appendChild row (core/create-el "td" {:style "font-family:monospace;font-weight:700;font-size:1.1rem;color:var(--clr-accent)"} (:code s)))
            (.appendChild row (core/create-el "td" {:style "font-weight:600"} (:name s)))
            (.appendChild row (core/create-el "td" {} (:meaning s)))
            (.addEventListener row "click"
              (fn [_] (core/toast! (str (:code s) " — " (:meaning s)))))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild panel table))
    panel))

(defn- tab-button [label active on-click]
  (let [btn (core/create-el "button" {:class (str "tab-btn" (when active " active"))} label)]
    (.addEventListener btn "click" on-click)
    btn))

(defn- fabriccap-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})
        metrics-slot (atom nil)
        sizing-body (atom nil)
        tab-body  (core/create-el "div" {:class "tab-body"})
        refresh! (fn []
                   (when-let [old @metrics-slot]
                     (let [p (.-parentNode old) fresh (metrics-panel)]
                       (.replaceChild p fresh old)
                       (reset! metrics-slot fresh))))
        sizing-panel (fn []
                       (let [wrap (core/create-el "div" {})]
                         (.appendChild wrap (sku-section refresh!))
                         (.appendChild wrap (workload-section refresh!))
                         (.appendChild wrap (concurrency-section refresh!))
                         wrap))
        render-tab (fn [tab]
                     (set! (.-innerHTML tab-body) "")
                     (.appendChild tab-body
                       (case tab
                         :sizing       (let [p (sizing-panel)] (reset! sizing-body p) p)
                         :mitigations  (mitigation-panel)
                         :symptoms     (symptoms-panel))))]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "Fabric Capacity Tuner"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "Size Microsoft Fabric capacity — model CU usage, simulate 430 throttling, and tune for cost"))
    (let [m (metrics-panel)]
      (reset! metrics-slot m)
      (.appendChild container m))
    (let [tabs (core/create-el "div" {:class "tab-bar"})]
      (doseq [[label key] [["Sizing" :sizing] ["Mitigations" :mitigations] ["HTTP Codes" :symptoms]]]
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
    (render-tab :sizing)
    container))

(defn init []
  (core/mount!
    (ui/page-shell :fabriccap "/articles/fabric-capacity-tuner.html" "src/portfolio/pro/fabriccap.cljs"
                   (fabriccap-content))))
