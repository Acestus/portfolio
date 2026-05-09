(ns portfolio.games.invaders
  "Misconfiguration Space Invaders — shoot down security threats."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]
            [portfolio.games.engine :as eng]))

(def ^:private W 480)
(def ^:private H 400)

(def ^:private threat-types
  [{:icon "🔓" :label "Open Port"     :color "#ff0040"}
   {:icon "📂" :label "Public Blob"   :color "#ff6600"}
   {:icon "🔑" :label "No MFA"        :color "#ff3366"}
   {:icon "🌐" :label "No NSG"        :color "#cc0066"}
   {:icon "💾" :label "No Backup"     :color "#ff4444"}])

(def ^:private powerup-types
  [{:icon "🛡" :label "Sentinel"  :color "#00d4ff"}
   {:icon "🔥" :label "WAF"       :color "#00ff41"}
   {:icon "🔒" :label "Defender"  :color "#ffaa00"}])

(defn- spawn-invaders []
  (vec
    (for [row (range 4) col (range 8)]
      (let [threat (nth threat-types (mod (+ row col) (count threat-types)))]
        (merge threat
               {:x (+ 30 (* col 52))
                :y (+ 40 (* row 40))
                :w 24 :h 24
                :alive true
                :dir 1})))))

(defn- initial-state []
  {:player    {:x (- (/ W 2) 16) :y (- H 40) :w 32 :h 16}
   :bullets   []
   :invaders  (spawn-invaders)
   :powerups  []
   :score     0
   :lives     3
   :phase     :playing
   :move-timer 0
   :shoot-cooldown 0
   :invader-dir 1})

(defn- fire-bullet [state]
  (let [p (:player state)]
    (update state :bullets conj
            {:x (+ (:x p) 14) :y (:y p) :w 4 :h 10})))

(defn- update-game [state dt touch]
  (if (not= :playing (:phase state))
    state
    (let [ts    @touch
          left  (or (eng/key-held? "ArrowLeft") (eng/key-held? "KeyA") (:left ts))
          right (or (eng/key-held? "ArrowRight") (eng/key-held? "KeyD") (:right ts))
          shoot (or (eng/key-held? "Space") (eng/key-held? "ArrowUp") (:up ts) (:action ts))
          dx     (cond left -200 right 200 :else 0)
          player (-> (:player state)
                     (update :x #(max 0 (min (- W 32) (+ % (* dx dt))))))
          ;; bullets
          bullets (->> (:bullets state)
                       (map #(update % :y - (* 400 dt)))
                       (filter #(> (:y %) -10))
                       vec)
          ;; move invaders
          mt (+ (:move-timer state) dt)
          cur-invaders (:invaders state)
          cur-dir (or (:invader-dir state) 1)
          [invaders mt2 new-dir]
          (if (> mt 0.8)
            (let [alive (filter :alive cur-invaders)
                  min-x (apply min (map :x alive))
                  max-x (apply max (map #(+ (:x %) (:w %)) alive))
                  hit-edge (or (< (+ min-x (* cur-dir 20)) 0)
                               (> (+ max-x (* cur-dir 20)) W))
                  next-dir (if hit-edge (- cur-dir) cur-dir)
                  moved (mapv (fn [inv]
                                (if (:alive inv)
                                  (cond-> (update inv :x + (* next-dir 20))
                                    hit-edge (update :y + 12))
                                  inv))
                              cur-invaders)]
              [moved 0 next-dir])
            [cur-invaders mt cur-dir])
          ;; bullet-invader collision
          [invaders2 bullets2 score-add]
          (reduce
            (fn [[invs buls sc] bullet]
              (if-let [hit (first (filter #(and (:alive %) (eng/aabb? bullet %)) invs))]
                [(mapv #(if (= % hit) (assoc % :alive false) %) invs)
                 buls
                 (+ sc 50)]
                [invs (conj buls bullet) sc]))
            [invaders [] 0]
            bullets)
          ;; shoot cooldown
          cd (- (:shoot-cooldown state) dt)
          [state2 cd2] (if (and shoot (< cd 0))
                         [(fire-bullet {:player player :bullets bullets2
                                        :invaders invaders2 :score (+ (:score state) score-add)
                                        :lives (:lives state) :phase :playing
                                        :move-timer mt2 :shoot-cooldown 0.2
                                        :powerups (:powerups state)
                                        :invader-dir new-dir})
                          0.2]
                         [{:player player :bullets bullets2
                           :invaders invaders2 :score (+ (:score state) score-add)
                           :lives (:lives state) :phase :playing
                           :move-timer mt2 :shoot-cooldown cd
                           :powerups (:powerups state)
                           :invader-dir new-dir}
                          cd])
          ;; check win
          all-dead (every? #(not (:alive %)) (:invaders state2))]
      (if all-dead
        (assoc state2 :phase :win)
        state2))))

(defn- render-game [ctx state]
  (eng/clear! ctx W H)
  ;; invaders
  (doseq [inv (:invaders state)]
    (when (:alive inv)
      (eng/draw-text! ctx (:icon inv) (:x inv) (+ (:y inv) 20)
                      :font "20px serif" :color (:color inv))))
  ;; player
  (let [p (:player state)]
    (eng/draw-rect! ctx (:x p) (:y p) (:w p) (:h p) "#00ff41")
    (eng/draw-rect! ctx (+ (:x p) 13) (- (:y p) 6) 6 6 "#00d4ff"))
  ;; bullets
  (doseq [b (:bullets state)]
    (eng/draw-rect! ctx (:x b) (:y b) (:w b) (:h b) "#00d4ff"))
  ;; HUD
  (eng/draw-hud! ctx state W)
  ;; Win
  (when (= :win (:phase state))
    (eng/draw-text! ctx "THREATS NEUTRALIZED!" (/ W 2) (/ H 2)
                    :color "#00ff41" :font "16px 'Press Start 2P'" :align "center")))

(defn init []
  (eng/init-keyboard!)
  (let [canvas  (eng/create-canvas W H)
        wrapper (core/create-el "div" {:class "game-wrapper"})
        state   (atom (initial-state))
        touch   (eng/init-touch! wrapper)]
    (.appendChild wrapper canvas)
    (core/mount!
      (ui/page-shell :invaders "/articles/space-invaders.html" "src/portfolio/games/invaders.cljs" wrapper))
    (eng/game-loop canvas state #(update-game %1 %2 touch) render-game)))
