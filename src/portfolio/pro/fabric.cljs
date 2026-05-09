(ns portfolio.pro.fabric
  "Fabric Medallion Pipeline — animated Bronze → Silver → Gold flow."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

;; ---------------------------------------------------------------------------
;; Mock telemetry data
;; ---------------------------------------------------------------------------

(def ^:private pipeline-stages
  [{:id :source    :label "Event Hub"       :color "#ADD8E6" :icon "📡" :desc "Transaction events from microservices"}
   {:id :stream    :label "Eventstream"     :color "#E0FFFF" :icon "🌊" :desc "Real-time ingestion into Fabric"}
   {:id :bronze    :label "Bronze"          :color "#F5DEB3" :icon "🥉" :desc "Raw landing — append-only, schema-on-read"}
   {:id :silver    :label "Silver"          :color "#E8E8E8" :icon "🥈" :desc "Parsed, deduplicated, typed columns"}
   {:id :gold      :label "Gold"            :color "#FFF8DC" :icon "🥇" :desc "Aggregated hourly/daily rollups in Delta"}
   {:id :semantic  :label "Semantic Model"  :color "#FFB6C1" :icon "📊" :desc "DAX measures + TMDL definitions for Power BI"}])

(def ^:private mock-events
  [{:ts "2026-05-09T08:00:01Z" :type "transaction_raw"   :records 1247  :status "ingested"}
   {:ts "2026-05-09T08:00:05Z" :type "update_policy"     :records 1247  :status "parsed"}
   {:ts "2026-05-09T08:00:30Z" :type "notebook_tfm_gld"  :records 1247  :status "aggregated"}
   {:ts "2026-05-09T08:01:00Z" :type "semantic_refresh"  :records 12    :status "published"}])

;; ---------------------------------------------------------------------------
;; Rendering
;; ---------------------------------------------------------------------------

(defn- stage-card [{:keys [label color icon desc]} active]
  (let [cls (str "stage-card" (when active " active"))]
    (core/create-el "div" {:class cls :style (str "border-left: 4px solid " color)}
      (core/create-el "div" {:class "stage-header"}
        (core/create-el "span" {:class "stage-icon"} icon)
        (core/create-el "span" {:class "stage-label"} label))
      (core/create-el "p" {:class "stage-desc"} desc))))

(defn- arrow []
  (core/create-el "div" {:class "flow-arrow"} "→"))

(defn- pipeline-flow [active-idx]
  (let [container (core/create-el "div" {:class "pipeline-flow"})]
    (doseq [[i stage] (map-indexed vector pipeline-stages)]
      (when (pos? i) (.appendChild container (arrow)))
      (.appendChild container (stage-card stage (= i active-idx))))
    container))

(defn- event-log [events]
  (let [log (core/create-el "div" {:class "event-log"})
        title (core/create-el "h3" {:class "log-title"} "📋 Pipeline Activity")]
    (.appendChild log title)
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["Timestamp" "Operation" "Records" "Status"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [evt events]
          (let [row (core/create-el "tr" {})]
            (doseq [v [(:ts evt) (:type evt) (str (:records evt)) (:status evt)]]
              (.appendChild row (core/create-el "td" {} v)))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild log table))
    log))

(defn- metrics-panel []
  (let [panel (core/create-el "div" {:class "metrics-row"})]
    (doseq [[label value color] [["Events/hour" "12,470" "#0078d4"]
                                  ["Avg latency" "< 5s" "#00a86b"]
                                  ["Gold tables" "2" "#b8860b"]
                                  ["DAX measures" "14" "#8b008b"]]]
      (.appendChild panel
        (core/create-el "div" {:class "metric-card"}
          (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
          (core/create-el "div" {:class "metric-label"} label))))
    panel))

(defn- fabric-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})
        state     (atom {:active-stage 0})]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "Fabric Medallion Pipeline"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "Real-time transaction log pipeline — Event Hub → Eventhouse → Lakehouse → Semantic Model"))
    (.appendChild container (metrics-panel))
    (.appendChild container (pipeline-flow 0))
    (.appendChild container (event-log mock-events))
    ;; animate active stage
    (js/setInterval
      (fn []
        (swap! state update :active-stage #(mod (inc %) (count pipeline-stages)))
        (let [flow (.querySelector container ".pipeline-flow")]
          (when flow
            (let [parent (.-parentNode flow)]
              (.replaceChild parent (pipeline-flow (:active-stage @state)) flow)))))
      2000)
    container))

(defn init []
  (core/mount!
    (ui/page-shell :fabric "/articles/fabric-pipeline.html" "src/portfolio/pro/fabric.cljs"
                   (fabric-content))))
