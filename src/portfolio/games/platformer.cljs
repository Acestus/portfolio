(ns portfolio.games.platformer
  "Cloud Platformer — navigate cloud infrastructure, collect Azure icons."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]
            [portfolio.games.engine :as eng]))

(def ^:private W 480)
(def ^:private H 320)

(def ^:private platforms
  [{:x 0   :y 280 :w 480 :h 40 :color "#1a1a4a"}
   {:x 60  :y 220 :w 80  :h 12 :color "#00d4ff"}
   {:x 200 :y 180 :w 80  :h 12 :color "#00ff41"}
   {:x 340 :y 140 :w 80  :h 12 :color "#ffaa00"}
   {:x 140 :y 100 :w 80  :h 12 :color "#ff0040"}
   {:x 300 :y 60  :w 100 :h 12 :color "#00d4ff"}])

(def ^:private collectibles
  [{:x 90  :y 200 :w 16 :h 16 :icon "⚡" :collected false}
   {:x 230 :y 160 :w 16 :h 16 :icon "☁" :collected false}
   {:x 370 :y 120 :w 16 :h 16 :icon "🔒" :collected false}
   {:x 170 :y 80  :w 16 :h 16 :icon "⚙" :collected false}
   {:x 340 :y 40  :w 16 :h 16 :icon "★" :collected false}])

(defn- initial-state []
  {:player {:x 40 :y 240 :w 20 :h 24 :vx 0 :vy 0 :grounded false}
   :platforms platforms
   :collectibles collectibles
   :score 0
   :lives 3
   :phase :playing})

(defn- apply-gravity [player dt]
  (update player :vy + (* 600 dt)))

(defn- apply-input [player touch-state]
  (let [left  (or (eng/key-held? "ArrowLeft")  (:left @touch-state))
        right (or (eng/key-held? "ArrowRight") (:right @touch-state))
        jump  (or (eng/key-held? "ArrowUp")    (eng/key-held? "Space") (:up @touch-state))
        vx    (cond left -160 right 160 :else 0)
        vy    (if (and jump (:grounded player)) -320 (:vy player))]
    (assoc player :vx vx :vy vy)))

(defn- move-player [player dt]
  (-> player
      (update :x + (* (:vx player) dt))
      (update :y + (* (:vy player) dt))
      (assoc :grounded false)))

(defn- collide-platforms [player plats]
  (reduce
    (fn [p plat]
      (if (and (eng/aabb? p plat)
               (> (:vy p) 0)
               (< (- (:y p) (* (:vy p) 0.017)) (:y plat)))
        (assoc p :y (- (:y plat) (:h p)) :vy 0 :grounded true)
        p))
    player plats))

(defn- collect-items [state]
  (let [player (:player state)]
    (reduce-kv
      (fn [s idx item]
        (if (and (not (:collected item)) (eng/aabb? player item))
          (-> s
              (assoc-in [:collectibles idx :collected] true)
              (update :score + 100))
          s))
      state
      (vec (:collectibles state)))))

(defn- clamp-bounds [player]
  (-> player
      (update :x #(max 0 (min (- W (:w player)) %)))
      (cond-> (> (:y player) (- H 20)) (assoc :y 240 :vy 0))))

(defn- update-game [state dt touch-state]
  (if (not= :playing (:phase state))
    state
    (let [all-collected (every? :collected (:collectibles state))]
      (if all-collected
        (assoc state :phase :win)
        (-> state
            (update :player #(-> %
                                 (apply-input touch-state)
                                 (apply-gravity dt)
                                 (move-player dt)
                                 (collide-platforms (:platforms state))
                                 clamp-bounds))
            collect-items)))))

(defn- render-game [ctx state]
  (eng/clear! ctx W H)
  ;; platforms
  (doseq [p (:platforms state)]
    (eng/draw-rect! ctx (:x p) (:y p) (:w p) (:h p) (:color p)))
  ;; collectibles
  (doseq [c (:collectibles state)]
    (when-not (:collected c)
      (eng/draw-text! ctx (:icon c) (:x c) (+ (:y c) 14)
                      :font "16px serif" :color "#ffaa00")))
  ;; player
  (let [p (:player state)]
    (eng/draw-rect! ctx (:x p) (:y p) (:w p) (:h p) "#00ff41"))
  ;; HUD
  (eng/draw-hud! ctx state W)
  ;; Win screen
  (when (= :win (:phase state))
    (eng/draw-text! ctx "LEVEL COMPLETE!" (/ W 2) (/ H 2)
                    :color "#00ff41" :font "20px 'Press Start 2P'" :align "center")
    (eng/draw-text! ctx (str "SCORE: " (:score state)) (/ W 2) (+ (/ H 2) 40)
                    :color "#ffaa00" :font "14px 'Press Start 2P'" :align "center")))

(defn init []
  (eng/init-keyboard!)
  (let [canvas   (eng/create-canvas W H)
        wrapper  (core/create-el "div" {:class "game-wrapper"})
        state    (atom (initial-state))
        touch-st (atom {:left false :right false :up false :action false})]
    (.appendChild wrapper canvas)
    (let [touch (eng/init-touch! wrapper)]
      (reset! touch-st @touch)
      (add-watch touch :sync (fn [_ _ _ new] (reset! touch-st new))))
    (core/mount!
      (ui/page-shell :platformer "/articles/cloud-platformer.html" "src/portfolio/games/platformer.cljs" wrapper))
    (eng/game-loop canvas state
      (fn [s dt] (update-game s dt touch-st))
      render-game)))
