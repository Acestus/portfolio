(ns portfolio.pro.logs
  "Real-Time Log Pipeline — Event Hub → Eventhouse → KQL."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

(def ^:private pipeline-nodes
  [{:id :apps      :label "Spring Boot Apps"  :color "#FFB6C1" :icon "☕"}
   {:id :eventhub  :label "Event Hub"         :color "#ADD8E6" :icon "📡"}
   {:id :stream    :label "Eventstream"       :color "#E0FFFF" :icon "🌊"}
   {:id :raw       :label "transaction_raw"   :color "#F5DEB3" :icon "📥"}
   {:id :parsed    :label "transaction_parsed" :color "#E8E8E8" :icon "⚙"}
   {:id :gold      :label "Gold Lakehouse"    :color "#FFF8DC" :icon "🥇"}])

(def ^:private sample-logs
  [{:ts "08:33:01.247" :level "INFO"  :app "svc-orders"   :msg "POST /api/orders → 201 (42ms)"}
   {:ts "08:33:01.312" :level "INFO"  :app "svc-payments" :msg "Payment processed txn=a8f3 amount=149.99"}
   {:ts "08:33:01.489" :level "WARN"  :app "svc-orders"   :msg "Retry #2 for downstream notification"}
   {:ts "08:33:02.001" :level "INFO"  :app "svc-inventory" :msg "Stock decremented sku=WDG-4401 qty=1"}
   {:ts "08:33:02.118" :level "ERROR" :app "svc-shipping" :msg "Address validation timeout after 5000ms"}
   {:ts "08:33:02.220" :level "INFO"  :app "svc-orders"   :msg "POST /api/orders → 201 (38ms)"}
   {:ts "08:33:02.445" :level "INFO"  :app "svc-payments" :msg "Payment processed txn=b2c1 amount=89.50"}
   {:ts "08:33:03.001" :level "INFO"  :app "svc-orders"   :msg "GET /api/orders/a8f3 → 200 (12ms)"}])

(defn- kql-panel []
  (let [panel (core/create-el "div" {:class "kql-panel"})]
    (.appendChild panel (core/create-el "h3" {:class "kql-title"} "KQL Update Policy"))
    (.appendChild panel
      (core/create-el "pre" {:class "kql-code"}
        (str ".create-or-alter function TransformRawLogs() {\n"
             "  transaction_raw\n"
             "  | extend parsed_ts = todatetime(raw_timestamp)\n"
             "  | extend app_name = extract('app=([\\\\w-]+)', 1, raw_message)\n"
             "  | extend log_level = extract('level=(\\\\w+)', 1, raw_message)\n"
             "  | extend http_status = toint(extract('→ (\\\\d+)', 1, raw_message))\n"
             "  | project parsed_ts, app_name, log_level, http_status, raw_message\n"
             "}")))
    panel))

(defn- log-stream [logs]
  (let [container (core/create-el "div" {:class "log-stream"})
        title     (core/create-el "h3" {:class "log-title"} "📡 Live Log Stream")]
    (.appendChild container title)
    (let [stream (core/create-el "div" {:class "stream-body"})]
      (doseq [log logs]
        (let [level-cls (case (:level log) "ERROR" "log-error" "WARN" "log-warn" "log-info")]
          (.appendChild stream
            (core/create-el "div" {:class (str "log-line " level-cls)}
              (core/create-el "span" {:class "log-ts"} (:ts log))
              (core/create-el "span" {:class "log-level"} (:level log))
              (core/create-el "span" {:class "log-app"} (:app log))
              (core/create-el "span" {:class "log-msg"} (:msg log))))))
      (.appendChild container stream))
    container))

(defn- flow-diagram []
  (let [flow (core/create-el "div" {:class "pipeline-flow"})]
    (doseq [[i node] (map-indexed vector pipeline-nodes)]
      (when (pos? i)
        (.appendChild flow (core/create-el "div" {:class "flow-arrow"} "→")))
      (.appendChild flow
        (core/create-el "div" {:class "stage-card"
                                :style (str "border-left: 4px solid " (:color node))}
          (core/create-el "div" {:class "stage-header"}
            (core/create-el "span" {:class "stage-icon"} (:icon node))
            (core/create-el "span" {:class "stage-label"} (:label node))))))
    flow))

(defn- logs-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "Real-Time Log Pipeline"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "Spring Boot → Event Hub → Eventstream → Eventhouse (KQL) → Gold Lakehouse"))
    (let [metrics (core/create-el "div" {:class "metrics-row"})]
      (doseq [[label value color] [["Events/sec" "247" "#0078d4"]
                                    ["Parse latency" "< 2s" "#00a86b"]
                                    ["Error rate" "0.3%" "#ff0040"]
                                    ["KQL tables" "2" "#b8860b"]]]
        (.appendChild metrics
          (core/create-el "div" {:class "metric-card"}
            (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
            (core/create-el "div" {:class "metric-label"} label))))
      (.appendChild container metrics))
    (.appendChild container (flow-diagram))
    (.appendChild container (kql-panel))
    (.appendChild container (log-stream sample-logs))
    ;; animate new log entries
    (js/setInterval
      (fn []
        (let [body (.querySelector container ".stream-body")]
          (when body
            (let [new-log (rand-nth sample-logs)
                  level-cls (case (:level new-log) "ERROR" "log-error" "WARN" "log-warn" "log-info")
                  line (core/create-el "div" {:class (str "log-line " level-cls " log-new")}
                         (core/create-el "span" {:class "log-ts"} (:ts new-log))
                         (core/create-el "span" {:class "log-level"} (:level new-log))
                         (core/create-el "span" {:class "log-app"} (:app new-log))
                         (core/create-el "span" {:class "log-msg"} (:msg new-log)))]
              (.insertBefore body line (.-firstChild body))
              (when (> (.-childElementCount body) 15)
                (.removeChild body (.-lastChild body)))))))
      1500)
    container))

(defn init []
  (core/mount!
    (ui/page-shell :logs "/articles/log-pipeline.html" "src/portfolio/pro/logs.cljs"
                   (logs-content))))
