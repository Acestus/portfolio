(ns portfolio.enterprise.m365)

(defn render-ui [data]
  (let [root (.getElementById js/document "spa-root")
        job-titles (js/Object.keys (clj->js (:job_titles data)))
        container (.createElement js/document "div")
        sel (.createElement js/document "select")
        out (.createElement js/document "div")]
    (doseq [jt job-titles]
      (let [o (.createElement js/document "option")]
        (set! (.-value o) jt) (set! (.-textContent o) jt) (.appendChild sel o)))
    (.appendChild container sel)
    (.appendChild container out)

    ;; workflows
    (let [wf-div (.createElement js/document "div")]
      (set! (.-textContent wf-div) "JML Workflows")
      (doseq [k (js/Object.keys (clj->js (:jml_workflows data)))]
        (let [b (.createElement js/document "button")]
          (set! (.-textContent b) k)
          (.addEventListener b "click" (fn [_]
                                          (js/alert (str "Workflow " k " steps:\n" (.-steps (aget (clj->js (:jml_workflows data)) k)))) ) )
          (.appendChild wf-div b))))
    (.appendChild container wf-div)

    ;; group mapping view
    (let [groups (.keys js/Object (clj->js (:entra_groups data)))
          gdiv (.createElement js/document "div")]
      (set! (.-textContent gdiv) "Entra groups (roles):")
      (doseq [g (js/Array.from groups)]
        (let [p (.createElement js/document "p")]
          (set! (.-textContent p) (str g ": " (.-roles (aget (clj->js (:entra_groups data)) g))))
          (.appendChild gdiv p)))
      (.appendChild container gdiv))

    (.appendChild root container)

    (let [update (fn []
                   (let [jt (.-value sel)
                         cfg (aget (clj->js (:job_titles data)) jt)]
                     (set! (.-innerHTML out) (str "Access packages: <pre>" (js/JSON.stringify (.-access_packages cfg) null 2) "</pre>"))))]
      (.addEventListener sel "change" (fn [_] (update)))
      (js/setTimeout update 10))
)

(defn ^:export init []
  (-> (js/fetch "/static/mock/m365.json")
      (.then (fn [resp] (.json resp)))
      (.then (fn [data] (render-ui data)))))