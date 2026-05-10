(ns portfolio.games.matcher
  "CAF Naming Puzzle — match Azure resources to CAF-compliant names."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]
            [portfolio.games.engine :as eng]))

(def ^:private W 480)
(def ^:private H 400)

(def ^:private caf-pairs
  [{:resource "Function App"      :caf "func-project-dev-usw2-001"  :prefix "func"}
   {:resource "Storage Account"   :caf "st-project-dev-usw2-001"    :prefix "st"}
   {:resource "Key Vault"         :caf "kv-project-dev-usw2-001"    :prefix "kv"}
   {:resource "Virtual Network"   :caf "vnet-project-dev-usw2-001"  :prefix "vnet"}
   {:resource "Resource Group"    :caf "rg-project-dev-usw2-001"    :prefix "rg"}
   {:resource "App Service Plan"  :caf "asp-project-dev-usw2-001"   :prefix "asp"}
   {:resource "Managed Identity"  :caf "umi-project-dev-usw2-ctl"   :prefix "umi"}
   {:resource "Event Hub"         :caf "evh-project-dev-usw2-001"   :prefix "evh"}
   {:resource "Container Registry" :caf "cr-project-dev-usw2-001"   :prefix "cr"}
   {:resource "App Insights"      :caf "appi-project-dev-usw2-001"  :prefix "appi"}
   {:resource "Static Web App"    :caf "stapp-project-dev-usw2-001" :prefix "stapp"}
   {:resource "Deployment Stack"  :caf "stack-project-dev-usw2-001" :prefix "stack"}])

(defn- shuffle-vec [v]
  (vec (sort-by (fn [_] (js/Math.random)) v)))

(defn- pick-round [n]
  (let [pairs (take n (shuffle-vec caf-pairs))
        resources (shuffle-vec (mapv :resource pairs))
        names     (shuffle-vec (mapv :caf pairs))]
    {:pairs pairs :resources resources :names names
     :selected-resource nil :matched [] :wrong 0}))

(defn- initial-state []
  (merge (pick-round 5)
         {:score 0 :round 1 :phase :playing :timer 30.0 :connections []}))

(defn- find-pair [resource caf-name pairs]
  (some #(when (and (= (:resource %) resource)
                    (= (:caf %) caf-name)) %) pairs))

(defn- render-game [ctx state]
  (eng/clear! ctx W H)
  ;; Title
  (eng/draw-text! ctx "CAF NAMING PUZZLE" (/ W 2) 30
                  :color "#00d4ff" :font "26px 'Press Start 2P'" :align "center")
  ;; Timer / score
  (eng/draw-text! ctx (str "TIME: " (int (:timer state))) (- W 10) 36
                  :color (if (< (:timer state) 10) "#ff0040" "#ffaa00")
                  :font "15px 'Press Start 2P'" :align "right")
  (eng/draw-text! ctx (str "SCORE: " (:score state)) 10 36
                  :color "#ffaa00" :font "15px 'Press Start 2P'")
  ;; resources column (larger font for readability)
  (eng/draw-text! ctx "RESOURCE" 20 82 :color "#00d4ff" :font "14px 'Press Start 2P'")
  (doseq [[i r] (map-indexed vector (:resources state))]
    (let [matched (some #(= r (:resource %)) (:matched state))
          selected (= r (:selected-resource state))
          color (cond matched "#00ff41" selected "#ffaa00" :else "#ffffff")
          y (+ 110 (* i 52))]
      ;; set canvas font to measure text width accurately and draw
      (set! (.-font ctx) "22px 'VT323'")
      (eng/draw-text! ctx r 20 y :color color :font "22px 'VT323'")))
  ;; names column (larger font)
  (eng/draw-text! ctx "CAF NAME" 260 82 :color "#00d4ff" :font "14px 'Press Start 2P'")
  (doseq [[i n] (map-indexed vector (:names state))]
    (let [matched (some #(= n (:caf %)) (:matched state))
          color (if matched "#00ff41" "#ffffff")
          y (+ 110 (* i 52))]
      (eng/draw-text! ctx n 260 y :color color :font "20px 'VT323'")))

  ;; Draw connections: persistent lines start from end of resource text
  (doseq [c (:connections state)]
    (let [{:keys [res-idx name-idx elapsed duration persist]} c
          res-text (nth (:resources state) res-idx)
          name-text (nth (:names state) name-idx)
          ;; measure resource text width
          _ (set! (.-font ctx) "22px 'VT323'")
          res-w (.-width (.measureText ctx res-text))
          x1 (+ 20 res-w 6)
          y1 (+ 110 (* res-idx 52))
          x2 260
          y2 (+ 110 (* name-idx 52))
          prog (min 1 (if (and duration (> duration 0)) (/ elapsed duration) 1))
          x-mid (+ x1 (* (- x2 x1) prog))
          y-mid (+ y1 (* (- y2 y1) prog))
          alpha (if persist 0.95 (+ 0.15 (* 0.85 prog)))]
      ;; draw line (animated if not yet fully progressed)
      (set! (.-strokeStyle ctx) (str "rgba(0,255,65," alpha ")"))
      (set! (.-lineWidth ctx) (* 2 (+ 0.5 prog)))
      (.beginPath ctx)
      (.moveTo ctx x1 y1)
      (.lineTo ctx (if persist x2 x-mid) (if persist y2 y-mid))
      (.stroke ctx)
      ;; draw pulsing dot for animation; if persistent and fully drawn, draw a fixed dot at target
      (if (and persist (>= prog 1))
        (do (set! (.-fillStyle ctx) "rgba(0,255,65,0.9)")
            (.beginPath ctx)
            (.arc ctx x2 y2 4 0 (* 2 js/Math.PI))
            (.fill ctx))
        (do (set! (.-fillStyle ctx) (str "rgba(0,255,65," (+ 0.3 (* 0.7 (/ (js/Math.sin (* 6.28 prog)) 2))) ")"))
            (.beginPath ctx)
            (.arc ctx x-mid y-mid (+ 2 (* 4 prog)) 0 (* 2 js/Math.PI))
            (.fill ctx)))))

  ;; Win animation: pulsing green rings
  (when (= :win (:phase state))
    (let [t (* 0.002 (js/Date.now))
          r1 (+ 20 (* 30 (js/Math.abs (.sin js/Math t))))]
      (set! (.-strokeStyle ctx) "rgba(0,255,65,0.9)")
      (set! (.-lineWidth ctx) 3)
      (.beginPath ctx)
      (.arc ctx (/ W 2) (/ H 2) r1 0 (* 2 js/Math.PI))
      (.stroke ctx)
      (eng/draw-text! ctx "ALL MATCHED!" (/ W 2) (/ H 2)
                      :color "#00ff41" :font "26px 'Press Start 2P'" :align "center")))

  ;; Timeout message
  (when (= :timeout (:phase state))
    (eng/draw-text! ctx "TIME'S UP!" (/ W 2) (/ H 2)
                    :color "#ff0040" :font "22px 'Press Start 2P'" :align "center"))
  )

(defn- update-game [state dt]
  (if (not= :playing (:phase state))
    ;; still update connection timers even when paused/won; keep persistent lines
    (let [conns (->> (:connections state)
                     (map #(update % :elapsed + dt))
                     (filter #(or (:persist %) (<= (:elapsed %) (:duration %))))
                     vec)]
      (assoc state :connections conns))
    (let [new-timer (- (:timer state) dt)
          base-state
          (cond
            (<= new-timer 0)
            (assoc state :phase :timeout :timer 0)

            (= (count (:matched state)) (count (:resources state)))
            (assoc state :phase :win)

            :else
            (assoc state :timer new-timer))
          conns (->> (:connections base-state)
                     (map #(update % :elapsed + dt))
                     (filter #(or (:persist %) (<= (:elapsed %) (:duration %))))
                     vec)]
      (assoc base-state :connections conns))))

(defn- setup-click-handlers! [canvas state]
  (.addEventListener canvas "click"
    (fn [e]
      (let [rect (.getBoundingClientRect canvas)
            scale-x (/ W (.-width rect))
            scale-y (/ H (.-height rect))
            mx (* (- (.-clientX e) (.-left rect)) scale-x)
            my (* (- (.-clientY e) (.-top rect)) scale-y)
            s @state]
        (when (= :playing (:phase s))
          ;; resource column click (x < 240)
          (when (< mx 240)
            (let [idx (int (/ (- my 86) 30))]
              (when (and (>= idx 0) (< idx (count (:resources s))))
                (swap! state assoc :selected-resource (nth (:resources s) idx)))))
          ;; name column click (x >= 240)
          (when (>= mx 240)
            (let [idx (int (/ (- my 86) 30))]
              (when (and (>= idx 0) (< idx (count (:names s)))
                         (:selected-resource @state))
                (let [res (:selected-resource @state)
                      nam (nth (:names @state) idx)]
                  (if (find-pair res nam (:pairs @state))
                    (let [pair (find-pair res nam (:pairs @state))
                          res-idx (.indexOf (:resources @state) res)
                          name-idx idx
                          conn {:x1 20 :y1 (+ 100 (* res-idx 30))
                                :x2 260 :y2 (+ 100 (* name-idx 30))
                                :elapsed 0 :duration 1.2}]
                      (swap! state #(-> %
                                        (update :matched conj pair)
                                        (update :score + 200)
                                        (update :connections conj conn)
                                        (assoc :selected-resource nil))))
                    (swap! state #(-> %
                                      (update :wrong inc)
                                      (assoc :selected-resource nil)))))))))))))

(defn init []
  (let [canvas  (eng/create-canvas W H)
        wrapper (core/create-el "div" {:class "game-wrapper"})
        state   (atom (initial-state))]
    (.appendChild wrapper canvas)
    (setup-click-handlers! canvas state)
    (core/mount!
      (ui/page-shell :matcher "/articles/caf-matcher.html" "src/portfolio/games/matcher.cljs" wrapper))
    (eng/game-loop canvas state update-game render-game)))
