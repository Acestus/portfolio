(ns portfolio.games.breakout
  "Tech Breakout — brick-breaker themed with Azure services."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]
            [portfolio.games.engine :as eng]))

(def ^:private W 480)
(def ^:private H 400)

(def ^:private brick-labels
  ["Functions" "Storage" "KeyVault" "VNET" "AKS"
   "Sentinel" "Fabric" "EventHub" "APIM" "Entra"
   "Monitor" "Bicep" "DevOps" "Policy" "DNS"
   "Firewall" "CDN" "SQL" "Cosmos" "Redis"])

(def ^:private brick-colors
  ["#00d4ff" "#00ff41" "#ffaa00" "#ff0040" "#cc66ff"
   "#00d4ff" "#00ff41" "#ffaa00" "#ff0040" "#cc66ff"
   "#00d4ff" "#00ff41" "#ffaa00" "#ff0040" "#cc66ff"
   "#00d4ff" "#00ff41" "#ffaa00" "#ff0040" "#cc66ff"])

(defn- make-bricks []
  (vec
    (for [row (range 4) col (range 5)]
      (let [idx (+ (* row 5) col)]
        {:x (+ 15 (* col 94))
         :y (+ 50 (* row 30))
         :w 84 :h 22
         :label (nth brick-labels idx)
         :color (nth brick-colors idx)
         :alive true}))))

(defn- initial-state []
  {:paddle {:x (- (/ W 2) 40) :y (- H 30) :w 80 :h 12}
   :ball   {:x (/ W 2) :y (- H 50) :w 10 :h 10 :vx 150 :vy -200}
   :bricks (make-bricks)
   :score  0
   :lives  3
   :phase  :playing})

(defn- update-game [state dt touch]
  (if (not= :playing (:phase state))
    state
    (let [ts    @touch
          left  (or (eng/key-held? "ArrowLeft") (eng/key-held? "KeyA") (:left ts))
          right (or (eng/key-held? "ArrowRight") (eng/key-held? "KeyD") (:right ts))
          dx    (cond left -300 right 300 :else 0)
          paddle (update (:paddle state) :x
                         #(max 0 (min (- W 80) (+ % (* dx dt)))))
          ball   (:ball state)
          bx     (+ (:x ball) (* (:vx ball) dt))
          by     (+ (:y ball) (* (:vy ball) dt))
          ;; wall bounce
          [bx vx] (cond
                     (< bx 0)       [0 (abs (:vx ball))]
                     (> bx (- W 10)) [(- W 10) (- (abs (:vx ball)))]
                     :else           [bx (:vx ball)])
          [by vy] (if (< by 0)
                    [0 (abs (:vy ball))]
                    [by (:vy ball)])
          ;; paddle bounce
          ball-rect {:x bx :y by :w 10 :h 10}
          [by vy] (if (eng/aabb? ball-rect paddle)
                    [(- (:y paddle) 10)
                     (- (abs vy))]
                    [by vy])
          ;; brick collision
          [bricks score-add vy2]
          (reduce
            (fn [[bs sc v] brick]
              (if (and (:alive brick) (eng/aabb? {:x bx :y by :w 10 :h 10} brick))
                [(mapv #(if (= % brick) (assoc % :alive false) %) bs)
                 (+ sc 100)
                 (- v)]
                [bs sc v]))
            [(:bricks state) 0 vy]
            (:bricks state))
          ;; bottom out
          [lives by vy2 phase]
          (if (> by H)
            [(dec (:lives state)) (- H 50) (- (abs vy2)) (if (<= (:lives state) 1) :lose :playing)]
            [(:lives state) by vy2 :playing])
          ;; check win
          all-dead (every? #(not (:alive %)) bricks)
          phase (if all-dead :win phase)]
      {:paddle paddle
       :ball   {:x bx :y by :w 10 :h 10 :vx vx :vy vy2}
       :bricks bricks
       :score  (+ (:score state) score-add)
       :lives  lives
       :phase  phase})))

(defn- render-game [ctx state]
  (eng/clear! ctx W H)
  ;; bricks
  (doseq [b (:bricks state)]
    (when (:alive b)
      (eng/draw-rect! ctx (:x b) (:y b) (:w b) (:h b) (:color b))
      (eng/draw-text! ctx (:label b) (+ (:x b) 4) (+ (:y b) 16)
                      :color "#0a0a2a" :font "10px 'Press Start 2P'")))
  ;; paddle
  (let [p (:paddle state)]
    (eng/draw-rect! ctx (:x p) (:y p) (:w p) (:h p) "#00ff41"))
  ;; ball
  (let [b (:ball state)]
    (eng/draw-rect! ctx (:x b) (:y b) (:w b) (:h b) "#ffffff"))
  ;; HUD
  (eng/draw-hud! ctx state W)
  ;; end screens
  (when (= :win (:phase state))
    (eng/draw-text! ctx "ALL BRICKS CLEARED!" (/ W 2) (/ H 2)
                    :color "#00ff41" :font "16px 'Press Start 2P'" :align "center"))
  (when (= :lose (:phase state))
    (eng/draw-text! ctx "GAME OVER" (/ W 2) (/ H 2)
                    :color "#ff0040" :font "20px 'Press Start 2P'" :align "center")))

(defn init []
  (eng/init-keyboard!)
  (let [canvas  (eng/create-canvas W H)
        wrapper (core/create-el "div" {:class "game-wrapper"})
        state   (atom (initial-state))
        touch   (eng/init-touch! wrapper)]
    (.appendChild wrapper canvas)
    (core/mount!
      (ui/page-shell :breakout "/articles/tech-breakout.html" "src/portfolio/games/breakout.cljs" wrapper))
    (eng/game-loop canvas state #(update-game %1 %2 touch) render-game)))
