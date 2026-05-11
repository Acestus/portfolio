(ns portfolio.enterprise.m365)

(defn ^:export init []
  (let [root (.getElementById js/document "spa-root")]
    (set! (.-innerHTML root)
          "<h2>M365 Administration (demo)</h2><div id=\"m365-ui\">Loading mock data...</div>")
    (-> (js/fetch "/static/mock/m365.json")
        (.then (fn [resp] (.json resp)))
        (.then (fn [data]
                 (let [el (.getElementById js/document "m365-ui")]
                   (set! (.-innerHTML el) (str "<pre style=\"white-space:pre-wrap;color:#bfefff\">" (js/JSON.stringify data null 2) "</pre>"))))))
    (js/console.log "portfolio.enterprise.m365 initialized")))