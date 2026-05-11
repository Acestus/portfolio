(ns portfolio.enterprise.pricing)

(defn compute-total [services selections]
  (reduce (fn [acc svc]
            (let [sel (get selections (:name svc))
                  sku (first (filter (fn [s] (= (str (:id s)) (str sel))) (:skus svc)))]
              (+ acc (or (:cost sku) 0))))
          0
          services))

(defn render-ui [data]
  (let [root (.getElementById js/document "spa-root")
        services (:services data)
        selections (atom {})
        make-select (fn [svc]
                      (let [sel (.createElement js/document "select")]
                        (doseq [sk (:skus svc)]
                          (let [opt (.createElement js/document "option")]
                            (set! (.-value opt) (str (:id sk)))
                            (set! (.-textContent opt) (str (:id sk) " — $" (:cost sk) "/mo"))
                            (.appendChild sel opt)))
                        (.addEventListener sel "change"
                                           (fn [_]
                                             (swap! selections assoc (:name svc) (.-value sel))
                                             (js/window.requestAnimationFrame (fn [] (let [e (.getElementById js/document "pricing-total")] (set! (.-textContent e) (str "Total: $" (compute-total services @selections))))))))
                        (swap! selections assoc (:name svc) (.-value sel))
                        sel))
        container (.createElement js/document "div")]
    (set! (.-innerHTML root) "")
    (set! (.-backgroundColor (.-style container)) "#dfefff")
    (doseq [svc services]
      (let [box (.createElement js/document "div")
            title (.createElement js/document "div")]
        (set! (.-textContent title) (:name svc))
        (.appendChild box title)
        (.appendChild box (make-select svc))
        (.appendChild container box)))
    ;; tagging & naming inputs
    (let [tag-inp (.createElement js/document "input")
          tag-lab (.createElement js/document "div")
          name-inp (.createElement js/document "input")
          name-lab (.createElement js/document "div")]
      (set! (.-textContent tag-lab) "Tags (comma separated):")
      (set! (.-placeholder tag-inp) "env:prod,owner:team")
      (set! (.-textContent name-lab) "Naming pattern:")
      (set! (.-placeholder name-inp) "proj-{team}-{resource}")
      (.appendChild container tag-lab)
      (.appendChild container tag-inp)
      (.appendChild container name-lab)
      (.appendChild container name-inp))

    ;; JML & scenario controls
    (let [jml-sel (.createElement js/document "select")
          opt-n (.createElement js/document "option")
          opt-h (.createElement js/document "option")
          opt-t (.createElement js/document "option")
          opt-l (.createElement js/document "option")
          total-div (.createElement js/document "div")]
      (set! (.-value opt-n) "none") (set! (.-textContent opt-n) "none")
      (set! (.-value opt-h) "hire") (set! (.-textContent opt-h) "hire")
      (set! (.-value opt-t) "transfer") (set! (.-textContent opt-t) "transfer")
      (set! (.-value opt-l) "leave") (set! (.-textContent opt-l) "leave")
      (.appendChild jml-sel opt-n) (.appendChild jml-sel opt-h) (.appendChild jml-sel opt-t) (.appendChild jml-sel opt-l)
      (set! (.-id total-div) "pricing-total")
      (.appendChild container jml-sel)
      (.appendChild container total-div)
      (.appendChild root container)
      ;; recompute
      (let [recompute (fn []
                        (let [base (compute-total services @selections)
                              jml (.-value jml-sel)
                              mult (or (get-in data [:jml_impact (keyword jml) :cost_multiplier]) 1.0)
                              adj (* base mult)
                              total (.getElementById js/document "pricing-total")]
                          (set! (.-textContent total) (str "Total: $" base " /mo (adjusted: $" (.toFixed adj 2) ")"))))]
        (.addEventListener jml-sel "change" (fn [_] (recompute)))
        (js/setTimeout recompute 10)))))