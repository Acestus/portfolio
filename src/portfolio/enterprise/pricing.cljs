(ns portfolio.enterprise.pricing)

(defn ^:export init []
  (let [root (.getElementById js/document "spa-root")]
    (set! (.-innerHTML root)
          "<h2>Pricing Optimizer (demo)</h2><div id=\"pricing-ui\">Loading mock data...</div>")
    (-> (js/fetch "/static/mock/pricing.json")
        (.then (fn [resp] (.json resp)))
        (.then (fn [data]
                 (let [el (.getElementById js/document "pricing-ui")]
                   (set! (.-innerHTML el) (str "<pre style=\"white-space:pre-wrap;color:#bfefff\">" (js/JSON.stringify data null 2) "</pre>"))))))
    (js/console.log "portfolio.enterprise.pricing initialized")))