(ns portfolio.games.helicopter
  "Cloud Lift — migrate workloads from on-prem data centers to the cloud, one rescue at a time."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]
            [portfolio.games.engine :as eng]))

(def ^:private W 800)
(def ^:private H 500)
(def ^:private GROUND-Y 420)
(def ^:private GRAVITY 350)
(def ^:private THRUST-UP -500)
(def ^:private MOVE-SPEED 200)
(def ^:private MAX-VY 300)
(def ^:private MAX-VX 250)
(def ^:private HELI-W 40)
(def ^:private HELI-H 20)
(def ^:private BASE-X 30)
(def ^:private BASE-W 80)
(def ^:private HOSTAGE-CAPACITY 24)
(def ^:private WORKLOADS-PER-DC 6)
(def ^:private NUM-BUILDINGS 5)
(def ^:private SCROLL-MARGIN 250)

;; Deterministic PRNG
(defn- prng [seed]
  (let [s (bit-xor seed (bit-shift-left seed 13))
        s (bit-xor s (unsigned-bit-shift-right s 17))
        s (bit-xor s (bit-shift-left s 5))
        s (bit-and s 0x7FFFFFFF)]
    [s (/ (double s) 0x7FFFFFFF)]))

(defn- make-buildings [seed]
  (loop [i 0 s seed buildings []]
    (if (>= i NUM-BUILDINGS)
      [buildings s]
      (let [[s1 r1] (prng s)
            bx (+ 300 (* i 220) (* r1 60))
            [hostages s2]
            (loop [j 0 hs [] ss s1]
              (if (>= j WORKLOADS-PER-DC)
                [hs ss]
                (let [[ns r] (prng ss)]
                  (recur (inc j)
                         (conj hs {:state :inside :idx j
                                   :speed (+ 25 (* r 50))})
                         ns))))]
        (recur (inc i) s2
               (conj buildings {:x bx :w 50 :alive true
                                :hostages hostages}))))))

(defn- make-tanks [seed n]
  (loop [i 0 s seed tanks []]
    (if (>= i n)
      [tanks s]
      (let [[s1 r1] (prng s)
            [s2 r2] (prng s1)
            tx (+ 250 (* r1 800))
            dir (if (> r2 0.5) 1 -1)]
        (recur (inc i) s2
               (conj tanks {:x tx :dir dir :speed (+ 20 (* r1 30))
                            :cooldown 0 :alive true}))))))

(defn- make-jets [seed n]
  (loop [i 0 s seed jets []]
    (if (>= i n)
      [jets s]
      (let [[s1 r1] (prng s)
            jy (+ 40 (* r1 100))
            dir (if (> r1 0.5) 1 -1)]
        (recur (inc i) s1
               (conj jets {:x (if (pos? dir) -50 (+ W 50))
                           :y jy :dir dir :speed (+ 120 (* r1 80))
                           :cooldown 0 :alive true}))))))

(defn- init-state []
  (let [s 42
        [buildings s1] (make-buildings s)
        [tanks s2] (make-tanks s1 3)
        [jets s3] (make-jets s2 2)]
    {:heli-x 60 :heli-y 300 :heli-vx 0 :heli-vy 0
     :facing :right
     :landed false
     :onboard 0
     :rescued 0
     :total-hostages (* NUM-BUILDINGS WORKLOADS-PER-DC)
     :lost 0
     :buildings buildings
     :tanks tanks
     :jets jets
     :bullets []
     :enemy-bullets []
     :explosions []
     :particles []
     :camera-x 0
     :seed s3
     :best 0
     :state :title
     :dead-timer 0
     :level 1
     :keys #{}}))

(defn- rect-overlap? [ax ay aw ah bx by bw bh]
  (and (< ax (+ bx bw)) (< bx (+ ax aw))
       (< ay (+ by bh)) (< by (+ ay ah))))

(defn- update-hostage-release [state]
  ;; When cloud is near a building, workloads run out spread apart
  (let [hx (:heli-x state)
        hy (:heli-y state)]
    (reduce-kv
      (fn [st bi bldg]
        (if (not (:alive bldg)) st
          (let [bx (:x bldg)
                bw (:w bldg)
                near (and (> hx (- bx 100)) (< hx (+ bx bw 100))
                          (< hy (+ GROUND-Y 40)))]
            (if (not near) st
              (let [hostages (:hostages bldg)
                    released (mapv (fn [h]
                                    (if (= (:state h) :inside)
                                      (let [idx (or (:idx h) 0)
                                            spread (* (- idx 2.5) 10)]
                                        (assoc h :state :running
                                               :x (+ bx (/ bw 2) spread)
                                               :y GROUND-Y
                                               :target-x hx))
                                      h))
                                   hostages)]
                (assoc-in st [:buildings bi :hostages] released))))))
      state (:buildings state))))

(defn- update-hostages [state dt]
  (let [hx (:heli-x state)
        hy (:heli-y state)
        landed (:landed state)]
    (reduce-kv
      (fn [st bi bldg]
        (let [hostages
              (mapv
                (fn [h]
                  (case (:state h)
                    :running
                    (let [speed (or (:speed h) 40)
                          dx (* (if (< (:x h) hx) 1 -1) speed dt)
                          nx (+ (:x h) dx)
                          close-enough (and (< (js/Math.abs (- nx hx)) 15)
                                            (< hy (- GROUND-Y 10)))]
                      (if close-enough
                        (assoc h :state :boarding)
                        (assoc h :x nx)))
                    :at-base (assoc h :state :safe)
                    h))
                (:hostages bldg))
              boarding (count (filter #(= (:state %) :boarding) hostages))
              hostages (mapv (fn [h] (if (= (:state h) :boarding) (assoc h :state :boarded) h)) hostages)
              new-onboard (min HOSTAGE-CAPACITY (+ (:onboard st) boarding))]
          (-> st
              (assoc-in [:buildings bi :hostages] hostages)
              (assoc :onboard new-onboard))))
      state (:buildings state))))

(defn- update-unload [state]
  ;; When landed at base and carrying hostages
  (if (and (:landed state)
           (< (:heli-x state) (+ BASE-X BASE-W 20))
           (pos? (:onboard state)))
    (-> state
        (update :rescued + (:onboard state))
        (assoc :onboard 0))
    state))

(defn- update-tanks [state dt]
  (let [hx (:heli-x state) hy (:heli-y state)]
    (assoc state :tanks
      (mapv (fn [t]
              (if (not (:alive t)) t
                (let [nx (+ (:x t) (* (:dir t) (:speed t) dt))
                      ;; Bounce at world edges
                      [nx dir] (cond
                                 (> nx 1450) [(- 1450 1) -1]
                                 (< nx 100)  [101 1]
                                 :else       [nx (:dir t)])
                      cd (- (:cooldown t) dt)
                      ;; Fire when cooldown expires and heli nearby
                      fire? (and (<= cd 0) (< (js/Math.abs (- hx nx)) 300) (< hy (- GROUND-Y 30)))
                      new-cd (if fire? (+ 1.5 (* (js/Math.random) 1.5)) (max 0 cd))]
                  (assoc t :x nx :dir dir :cooldown new-cd
                         :fired fire?))))
            (:tanks state)))))

(defn- update-jets [state dt]
  (let [hx (:heli-x state) hy (:heli-y state)]
    (assoc state :jets
      (mapv (fn [j]
              (if (not (:alive j)) j
                (let [nx (+ (:x j) (* (:dir j) (:speed j) dt))
                      cd (- (:cooldown j) dt)
                      fire? (and (<= cd 0) (< (js/Math.abs (- hx nx)) 200))
                      new-cd (if fire? (+ 2.0 (* (js/Math.random) 1.0)) (max 0 cd))
                      ;; Wrap around
                      nx (cond (> nx (+ W 80)) -60
                               (< nx -80) (+ W 60)
                               :else nx)]
                  (assoc j :x nx :cooldown new-cd :fired fire?))))
            (:jets state)))))

(defn- spawn-enemy-bullets [state]
  (let [hx (:heli-x state) hy (:heli-y state)
        tank-shots (for [t (:tanks state) :when (and (:alive t) (:fired t))]
                     {:x (:x t) :y (- GROUND-Y 10)
                      :vx (* 0.6 (- hx (:x t))) :vy (* 0.6 (- hy (- GROUND-Y 10)))
                      :life 2.0})
        jet-shots (for [j (:jets state) :when (and (:alive j) (:fired j))]
                    {:x (:x j) :y (+ (:y j) 10)
                     :vx 0 :vy 150
                     :life 2.0})]
    (update state :enemy-bullets into (concat tank-shots jet-shots))))

(defn- update-bullets [state dt]
  (-> state
      (update :bullets
              (fn [bs]
                (filterv #(> (:life %) 0)
                         (mapv (fn [b]
                                 (-> b
                                     (update :x + (* (:vx b) dt))
                                     (update :y + (* (:vy b) dt))
                                     (update :life - dt)))
                               bs))))
      (update :enemy-bullets
              (fn [bs]
                (filterv #(> (:life %) 0)
                         (mapv (fn [b]
                                 (-> b
                                     (update :x + (* (:vx b) dt))
                                     (update :y + (* (:vy b) dt))
                                     (update :life - dt)))
                               bs))))))

(defn- check-collisions [state]
  (let [hx (:heli-x state) hy (:heli-y state)
        ;; Player bullets hit tanks
        state (reduce
                (fn [st bi]
                  (let [b (nth (:bullets st) bi nil)]
                    (if (nil? b) st
                      (let [hit-tank (first (keep-indexed
                                              (fn [ti t]
                                                (when (and (:alive t)
                                                           (< (js/Math.abs (- (:x b) (:x t))) 20)
                                                           (< (js/Math.abs (- (:y b) GROUND-Y)) 25))
                                                  ti))
                                              (:tanks st)))]
                        (if hit-tank
                          (-> st
                              (assoc-in [:tanks hit-tank :alive] false)
                              (assoc-in [:bullets bi :life] 0)
                              (update :explosions conj {:x (:x b) :y GROUND-Y :life 0.8}))
                          st)))))
                state (range (count (:bullets state))))
        ;; Player bullets hit jets
        state (reduce
                (fn [st bi]
                  (let [b (nth (:bullets st) bi nil)]
                    (if (or (nil? b) (<= (:life b) 0)) st
                      (let [hit-jet (first (keep-indexed
                                             (fn [ji j]
                                               (when (and (:alive j)
                                                          (< (js/Math.abs (- (:x b) (:x j))) 25)
                                                          (< (js/Math.abs (- (:y b) (:y j))) 15))
                                                 ji))
                                             (:jets st)))]
                        (if hit-jet
                          (-> st
                              (assoc-in [:jets hit-jet :alive] false)
                              (assoc-in [:bullets bi :life] 0)
                              (update :explosions conj {:x (:x b) :y (:y (nth (:jets st) hit-jet)) :life 0.8}))
                          st)))))
                state (range (count (:bullets state))))
        ;; Enemy bullets hit heli
        hit-by-enemy (some (fn [b]
                             (rect-overlap? (- hx (/ HELI-W 2)) (- hy (/ HELI-H 2)) HELI-W HELI-H
                                            (- (:x b) 3) (- (:y b) 3) 6 6))
                           (:enemy-bullets state))
        ;; Enemy bullets kill running hostages
        state (reduce-kv
                (fn [st bi bldg]
                  (let [hostages (mapv (fn [h]
                                         (if (not= (:state h) :running) h
                                           (if (some (fn [b]
                                                       (< (js/Math.abs (- (:x h) (:x b))) 8))
                                                     (:enemy-bullets st))
                                             (assoc h :state :dead)
                                             h)))
                                       (:hostages bldg))
                        newly-dead (count (filter (fn [[new-h old-h]]
                                                        (and (= (:state new-h) :dead)
                                                             (not= (:state old-h) :dead)))
                                                      (map vector hostages (:hostages bldg))))]
                    (-> st
                        (assoc-in [:buildings bi :hostages] hostages)
                        (update :lost + newly-dead))))
                state (:buildings state))]
    (if hit-by-enemy
      (-> state (assoc :state :dead)
          (update :best #(max % (:rescued state)))
          (update :explosions conj {:x hx :y hy :life 1.2}))
      state)))

(defn- update-explosions [state dt]
  (update state :explosions
          (fn [exs] (filterv #(> (:life %) 0)
                             (mapv #(update % :life - dt) exs)))))

(defn- update-particles [state dt]
  (update state :particles
          (fn [ps] (filterv #(> (:life %) 0)
                            (mapv (fn [p] (-> p
                                              (update :x + (* (:vx p) dt))
                                              (update :y + (* (:vy p) dt))
                                              (update :life - dt)))
                                  ps)))))

(defn- add-rotor-particles [state]
  (if (or (:landed state) (not= (:state state) :playing)) state
    (let [hx (:heli-x state) hy (:heli-y state)]
      (update state :particles conj
              {:x (+ hx (- (* 20 (js/Math.random)) 10))
               :y (- hy 12)
               :vx (- (* 40 (js/Math.random)) 20)
               :vy (- -20 (* 30 (js/Math.random)))
               :life 0.3}))))

(defn- fire-bullet [state]
  (let [dir (if (= (:facing state) :right) 1 -1)
        hx (:heli-x state) hy (:heli-y state)]
    (update state :bullets conj
            {:x (+ hx (* dir 25)) :y hy
             :vx (* dir 400) :vy 0 :life 1.5})))

(defn- check-win [state]
  (if (and (>= (:rescued state) (:total-hostages state))
           (= (:state state) :playing))
    (-> state (assoc :state :won)
        (update :best #(max % (:rescued state))))
    state))

(defn- update-game [state dt touch]
  (case (:state state)
    :playing
    (let [ts (if (nil? touch) {:left false :right false :up false :action false} @touch)
          touch-set (cond-> #{}
                      (:left ts) (conj :left)
                      (:right ts) (conj :right)
                      (:up ts) (conj :up)
                      (:action ts) (conj :shoot))
          keys (into (:keys state) touch-set)

          thrusting (or (contains? keys :up) (contains? keys :space))
          move-left (contains? keys :left)
          move-right (contains? keys :right)
          shooting (contains? keys :shoot)

          ;; Horizontal movement
          ax (cond move-left -1 move-right 1 :else 0)
          facing (cond move-left :left move-right :right :else (:facing state))
          vx (+ (:heli-vx state) (* ax MOVE-SPEED dt))
          vx (* vx (if (zero? ax) 0.95 1.0))
          vx (max (- MAX-VX) (min MAX-VX vx))

          ;; Vertical
          vy (+ (:heli-vy state) (* (if thrusting THRUST-UP GRAVITY) dt))
          vy (max (- MAX-VY) (min MAX-VY vy))

          nx (+ (:heli-x state) (* vx dt))
          ny (+ (:heli-y state) (* vy dt))

          ;; Ground landing
          on-ground (>= ny (- GROUND-Y (/ HELI-H 2)))

          ;; Building roof landing
          on-building (and (not on-ground)
                          (pos? vy)
                          (some (fn [b]
                                  (and (:alive b)
                                       (>= nx (- (:x b) 4))
                                       (<= nx (+ (:x b) (:w b) 4))
                                       (>= ny (- GROUND-Y 40 (/ HELI-H 2)))
                                       (<= (- ny (/ HELI-H 2)) (- GROUND-Y 38))))
                                (:buildings state)))
          roof-y (- GROUND-Y 40 (/ HELI-H 2))
          landed (or on-ground on-building)
          ny (cond on-ground (- GROUND-Y (/ HELI-H 2))
                   on-building roof-y
                   :else ny)
          vy (if landed 0 vy)
          vx (if landed (* vx 0.9) vx)

          ;; Ceiling
          ny (max 15 ny)
          vy (if (<= ny 15) (max 0 vy) vy)

          ;; Keep in world
          nx (max 10 (min 1550 nx))

          ;; Camera follows heli
          cam-target (- nx (/ W 2))
          cam-target (max 0 cam-target)
          cam (+ (:camera-x state) (* (- cam-target (:camera-x state)) 3 dt))]

      (-> state
          (assoc :heli-x nx :heli-y ny :heli-vx vx :heli-vy vy
                 :landed landed :facing facing :camera-x cam)
          (update-hostage-release)
          (update-hostages dt)
          (update-unload)
          (update-tanks dt)
          (update-jets dt)
          (spawn-enemy-bullets)
          (update-bullets dt)
          (check-collisions)
          (update-explosions dt)
          (update-particles dt)
          (add-rotor-particles)
          (check-win)))
    :dead
    (-> state
        (update-explosions dt)
        (update-particles dt))
    state))

;; --- Drawing ---

(defn- draw-mountains [ctx cam-x]
  (set! (.-fillStyle ctx) "#0d0d30")
  (.beginPath ctx)
  (.moveTo ctx 0 GROUND-Y)
  (doseq [i (range 0 (+ W 40) 40)]
    (let [wx (+ i (* cam-x 0.3))
          my (- GROUND-Y 30 (* 25 (.sin js/Math (* wx 0.008)))
                (* 15 (.cos js/Math (* wx 0.013))))]
      (.lineTo ctx i my)))
  (.lineTo ctx W GROUND-Y)
  (.closePath ctx)
  (.fill ctx))

(defn- draw-ground [ctx]
  (set! (.-fillStyle ctx) "#1a1a3a")
  (.fillRect ctx 0 GROUND-Y W (- H GROUND-Y))
  (set! (.-strokeStyle ctx) "#00ff41")
  (set! (.-lineWidth ctx) 1)
  (set! (.-shadowColor ctx) "#00ff41")
  (set! (.-shadowBlur ctx) 4)
  (.beginPath ctx)
  (.moveTo ctx 0 GROUND-Y)
  (.lineTo ctx W GROUND-Y)
  (.stroke ctx)
  (set! (.-shadowBlur ctx) 0))

(defn- draw-base [ctx cam-x]
  (let [bx (- BASE-X cam-x)]
    ;; Cloud landing zone
    (set! (.-fillStyle ctx) "#00b4d8")
    (set! (.-shadowColor ctx) "#00b4d8")
    (set! (.-shadowBlur ctx) 8)
    (.fillRect ctx bx (- GROUND-Y 3) BASE-W 3)
    ;; Cloud icon
    (set! (.-font ctx) "14px 'Press Start 2P', monospace")
    (set! (.-textAlign ctx) "center")
    (.fillText ctx "☁" (+ bx (/ BASE-W 2)) (+ GROUND-Y 18))
    (set! (.-textAlign ctx) "left")
    (set! (.-shadowBlur ctx) 0)
    (set! (.-fillStyle ctx) "#00b4d8")))

(defn- draw-buildings [ctx buildings cam-x]
  (doseq [b buildings]
    (when (:alive b)
      (let [bx (- (:x b) cam-x)
            bw (:w b)]
        ;; Data center body
        (set! (.-fillStyle ctx) "#2a3a4a")
        (.fillRect ctx bx (- GROUND-Y 40) bw 40)
        ;; Server rack lines
        (set! (.-strokeStyle ctx) "#4a5a6a")
        (set! (.-lineWidth ctx) 1)
        (doseq [ry [(- GROUND-Y 35) (- GROUND-Y 27) (- GROUND-Y 19) (- GROUND-Y 11)]]
          (.beginPath ctx)
          (.moveTo ctx (+ bx 4) ry)
          (.lineTo ctx (+ bx bw -4) ry)
          (.stroke ctx))
        ;; Status LEDs — one per workload, green if inside, dark if gone
        (let [hostages (:hostages b)
              n (count hostages)]
          (doseq [i (range n)]
            (let [h (nth hostages i)
                  row (quot i 3)
                  col (rem i 3)
                  lx (+ bx 6 (* col 14))
                  ly (- GROUND-Y 33 (* row -8))]
              (set! (.-fillStyle ctx) (if (= (:state h) :inside) "#00ff41" "#1a2a1a"))
              (.fillRect ctx lx ly 3 2))))
        ;; "DC" label
        (set! (.-fillStyle ctx) "#6a7a8a")
        (set! (.-font ctx) "6px 'Press Start 2P', monospace")
        (set! (.-textAlign ctx) "center")
        (.fillText ctx "DC" (+ bx (/ bw 2)) (- GROUND-Y 2))
        (set! (.-textAlign ctx) "left")
        ;; Workloads running out (little people with waving arms)
        (doseq [h (:hostages b)]
          (when (= (:state h) :running)
            (let [hx (- (:x h) cam-x)
                  t (* (js/Date.now) 0.008)
                  arm-angle (* 0.6 (.sin js/Math (+ t (* hx 0.1))))]
              ;; Body
              (set! (.-fillStyle ctx) "#0078d4")
              (.fillRect ctx (- hx 3) (- GROUND-Y 14) 6 10)
              ;; Head
              (set! (.-fillStyle ctx) "#ffcc88")
              (.beginPath ctx)
              (.arc ctx hx (- GROUND-Y 18) 4 0 (* 2 js/Math.PI))
              (.fill ctx)
              ;; Left arm waving
              (set! (.-strokeStyle ctx) "#0078d4")
              (set! (.-lineWidth ctx) 2)
              (.beginPath ctx)
              (.moveTo ctx (- hx 3) (- GROUND-Y 12))
              (.lineTo ctx (- hx 8) (- GROUND-Y (+ 16 (* 6 arm-angle))))
              (.stroke ctx)
              ;; Right arm waving
              (.beginPath ctx)
              (.moveTo ctx (+ hx 3) (- GROUND-Y 12))
              (.lineTo ctx (+ hx 8) (- GROUND-Y (+ 16 (* 6 (- arm-angle)))))
              (.stroke ctx)
              ;; Legs
              (.beginPath ctx)
              (.moveTo ctx (- hx 1) (- GROUND-Y 4))
              (.lineTo ctx (- hx 4) GROUND-Y)
              (.stroke ctx)
              (.beginPath ctx)
              (.moveTo ctx (+ hx 1) (- GROUND-Y 4))
              (.lineTo ctx (+ hx 4) GROUND-Y)
              (.stroke ctx))))))))

(defn- draw-tanks [ctx tanks cam-x]
  (doseq [t tanks]
    (when (:alive t)
      (let [tx (- (:x t) cam-x)]
        (set! (.-fillStyle ctx) "#ff4444")
        (set! (.-shadowColor ctx) "#ff4444")
        (set! (.-shadowBlur ctx) 4)
        ;; Firewall body
        (.fillRect ctx (- tx 15) (- GROUND-Y 12) 30 12)
        ;; Shield icon
        (set! (.-fillStyle ctx) "#ff8866")
        (.fillRect ctx (- tx 6) (- GROUND-Y 18) 12 8)
        ;; Antenna
        (.fillRect ctx (- tx 1) (- GROUND-Y 24) 2 8)
        (set! (.-shadowBlur ctx) 0)))))

(defn- draw-jets [ctx jets cam-x]
  (doseq [j jets]
    (when (:alive j)
      (let [jx (- (:x j) cam-x)
            jy (:y j)
            d (:dir j)]
        (set! (.-fillStyle ctx) "#ff0040")
        (set! (.-shadowColor ctx) "#ff0040")
        (set! (.-shadowBlur ctx) 6)
        ;; Outage drone body
        (.fillRect ctx (- jx 14) (- jy 4) 28 8)
        ;; Rotors
        (.fillRect ctx (- jx 18) (- jy 8) 8 16)
        (.fillRect ctx (+ jx 10) (- jy 8) 8 16)
        ;; Warning light
        (set! (.-fillStyle ctx) "#ff4466")
        (.fillRect ctx (+ jx (* d 10)) (- jy 2) 4 4)
        (set! (.-shadowBlur ctx) 0)))))

(defn- draw-helicopter [ctx state]
  (let [hx (- (:heli-x state) (:camera-x state))
        hy (:heli-y state)
        facing (:facing state)
        dir (if (= facing :right) 1 -1)
        landed (:landed state)
        moving (> (js/Math.abs (:heli-vx state)) 15)
        bob (if landed 0 (* 1.5 (.sin js/Math (* (js/Date.now) 0.003))))]
    (set! (.-fillStyle ctx) "#ffffff")
    (set! (.-shadowColor ctx) "#88ccff")
    (set! (.-shadowBlur ctx) 15)
    (if (and landed (not moving))
      ;; Front-facing cloud — round and symmetrical with face
      (do
        (.beginPath ctx)
        (.arc ctx hx (+ hy bob) 18 0 (* 2 js/Math.PI))
        (.fill ctx)
        (.beginPath ctx)
        (.arc ctx (- hx 13) (+ hy bob 6) 11 0 (* 2 js/Math.PI))
        (.fill ctx)
        (.beginPath ctx)
        (.arc ctx (+ hx 13) (+ hy bob 6) 11 0 (* 2 js/Math.PI))
        (.fill ctx)
        (.beginPath ctx)
        (.arc ctx hx (+ hy bob -12) 11 0 (* 2 js/Math.PI))
        (.fill ctx)
        ;; Eyes
        (set! (.-fillStyle ctx) "#334455")
        (.beginPath ctx)
        (.arc ctx (- hx 5) (+ hy bob -1) 2.5 0 (* 2 js/Math.PI))
        (.fill ctx)
        (.beginPath ctx)
        (.arc ctx (+ hx 5) (+ hy bob -1) 2.5 0 (* 2 js/Math.PI))
        (.fill ctx)
        ;; Smile
        (set! (.-strokeStyle ctx) "#334455")
        (set! (.-lineWidth ctx) 1.5)
        (.beginPath ctx)
        (.arc ctx hx (+ hy bob 2) 4 0.2 2.9)
        (.stroke ctx))
      ;; Profile cloud — elongated with direction arrow
      (do
        (.beginPath ctx)
        (.arc ctx hx (+ hy bob) 16 0 (* 2 js/Math.PI))
        (.fill ctx)
        (.beginPath ctx)
        (.arc ctx (+ hx (* dir 12)) (+ hy bob 2) 13 0 (* 2 js/Math.PI))
        (.fill ctx)
        (.beginPath ctx)
        (.arc ctx (- hx (* dir 10)) (+ hy bob 4) 11 0 (* 2 js/Math.PI))
        (.fill ctx)
        (.beginPath ctx)
        (.arc ctx (+ hx (* dir 4)) (+ hy bob -10) 10 0 (* 2 js/Math.PI))
        (.fill ctx)
        ;; Highlight
        (set! (.-fillStyle ctx) "rgba(200,230,255,0.6)")
        (.beginPath ctx)
        (.arc ctx (- hx (* dir 2)) (+ hy bob -4) 8 0 (* 2 js/Math.PI))
        (.fill ctx)
        ;; Direction arrow
        (set! (.-fillStyle ctx) "#0078d4")
        (.beginPath ctx)
        (.moveTo ctx (+ hx (* dir 24)) (+ hy bob 4))
        (.lineTo ctx (+ hx (* dir 30)) (+ hy bob))
        (.lineTo ctx (+ hx (* dir 24)) (+ hy bob -4))
        (.closePath ctx)
        (.fill ctx)))
    (set! (.-shadowBlur ctx) 0)
    ;; Onboard count
    (when (pos? (:onboard state))
      (set! (.-fillStyle ctx) "#0078d4")
      (set! (.-font ctx) "8px 'Press Start 2P', monospace")
      (set! (.-textAlign ctx) "center")
      (.fillText ctx (str (:onboard state)) hx (+ hy bob 26))
      (set! (.-textAlign ctx) "left"))))

(defn- draw-bullets [ctx bullets enemy-bullets cam-x]
  ;; Player bullets
  (set! (.-fillStyle ctx) "#00ff41")
  (set! (.-shadowColor ctx) "#00ff41")
  (set! (.-shadowBlur ctx) 4)
  (doseq [b bullets]
    (.fillRect ctx (- (:x b) cam-x 2) (- (:y b) 1) 6 3))
  ;; Enemy bullets
  (set! (.-fillStyle ctx) "#ff4444")
  (set! (.-shadowColor ctx) "#ff4444")
  (doseq [b enemy-bullets]
    (.fillRect ctx (- (:x b) cam-x 2) (- (:y b) 2) 4 4))
  (set! (.-shadowBlur ctx) 0))

(defn- draw-explosions [ctx explosions cam-x]
  (doseq [e explosions]
    (let [r (* 20 (- 1 (:life e)))
          alpha (min 1 (* 2 (:life e)))]
      (set! (.-fillStyle ctx) (str "rgba(255,100,0," alpha ")"))
      (set! (.-shadowColor ctx) "#ff6600")
      (set! (.-shadowBlur ctx) 10)
      (.beginPath ctx)
      (.arc ctx (- (:x e) cam-x) (:y e) r 0 (* 2 js/Math.PI))
      (.fill ctx)))
  (set! (.-shadowBlur ctx) 0))

(defn- draw-particles [ctx particles cam-x]
  (doseq [p particles]
    (let [alpha (min 1.0 (* 3 (:life p)))]
      (set! (.-fillStyle ctx) (str "rgba(0,212,255," alpha ")"))
      (.fillRect ctx (- (:x p) cam-x) (:y p) 2 2))))

(defn- draw-hud [ctx state]
  (set! (.-font ctx) "14px 'Press Start 2P', monospace")
  ;; Migrated
  (set! (.-fillStyle ctx) "#00b4d8")
  (.fillText ctx (str "MIGRATED " (:rescued state) "/" (:total-hostages state)) 15 28)
  ;; In transit
  (set! (.-fillStyle ctx) "#0078d4")
  (.fillText ctx (str "IN TRANSIT " (:onboard state) "/" HOSTAGE-CAPACITY) 15 50)
  ;; Lost
  (when (pos? (:lost state))
    (set! (.-fillStyle ctx) "#ff4444")
    (.fillText ctx (str "DROPPED " (:lost state)) 15 72))
  ;; Best
  (when (pos? (:best state))
    (set! (.-fillStyle ctx) "#888")
    (.fillText ctx (str "BEST " (:best state)) (- W 200) 28)))

(defn- draw-overlay [ctx state title subtitle color]
  (set! (.-fillStyle ctx) "rgba(0,0,0,0.6)")
  (.fillRect ctx 0 0 W H)
  (set! (.-fillStyle ctx) color)
  (set! (.-font ctx) "24px 'Press Start 2P', monospace")
  (set! (.-textAlign ctx) "center")
  (.fillText ctx title (/ W 2) (- (/ H 2) 30))
  (set! (.-font ctx) "11px 'Press Start 2P', monospace")
  (set! (.-fillStyle ctx) "#00ff41")
  (.fillText ctx subtitle (/ W 2) (+ (/ H 2) 10))
  (set! (.-fillStyle ctx) "#888")
  (set! (.-font ctx) "10px 'Press Start 2P', monospace")
  (.fillText ctx "ARROWS/WASD MOVE · SPACE SHOOT · TAP/CLICK" (/ W 2) (+ (/ H 2) 40))
  (set! (.-textAlign ctx) "left"))

(defn- draw! [ctx state]
  (.save ctx)
  (let [cam (:camera-x state)]
    ;; Sky
    (set! (.-fillStyle ctx) "#0a0a2a")
    (.fillRect ctx 0 0 W H)

    ;; Stars
    (set! (.-fillStyle ctx) "rgba(255,255,255,0.3)")
    (doseq [i (range 40)]
      (let [sx (mod (+ (* i 37) (* cam 0.1)) W)
            sy (mod (* i 23) (- GROUND-Y 60))]
        (.fillRect ctx sx sy 1 1)))

    (draw-mountains ctx cam)
    (draw-ground ctx)
    (draw-base ctx cam)
    (draw-buildings ctx (:buildings state) cam)
    (draw-tanks ctx (:tanks state) cam)
    (draw-jets ctx (:jets state) cam)
    (draw-particles ctx (:particles state) cam)
    (draw-bullets ctx (:bullets state) (:enemy-bullets state) cam)
    (draw-explosions ctx (:explosions state) cam)
    (draw-helicopter ctx state)
    (draw-hud ctx state)

    (case (:state state)
      :title (draw-overlay ctx state "CLOUD LIFT"
                           "MIGRATE WORKLOADS · FLY THEM TO THE CLOUD" "#00b4d8")
      :dead (draw-overlay ctx state "OUTAGE!"
                          (str "MIGRATED: " (:rescued state) "  [SPACE] TO RETRY") "#ff4444")
      :won (draw-overlay ctx state "MIGRATION COMPLETE!"
                         (str "ALL " (:total-hostages state) " WORKLOADS IN THE CLOUD!") "#00b4d8")
      nil))
  (.restore ctx))

;; --- Init ---

(defn init []
  (let [state (atom (init-state))
        canvas (core/create-el "canvas" {:width (str W) :height (str H) :class "game-canvas"})
        ctx (.getContext canvas "2d")

        set-key! (fn [k v]
                   (case (:state @state)
                     :title (when v
                              (reset! state (assoc (init-state) :state :playing :best (:best @state))))
                     (:dead :won) (when v
                                    (reset! state (assoc (init-state) :state :playing :best (:best @state))))
                     :playing (if v
                                (do (swap! state update :keys conj k)
                                    (when (= k :shoot)
                                      (swap! state fire-bullet)))
                                (swap! state update :keys disj k))
                     nil))]

    ;; Keyboard
    (let [code-map {"ArrowUp" :up "ArrowDown" :down "ArrowLeft" :left "ArrowRight" :right
                    "KeyW" :up "KeyS" :down "KeyA" :left "KeyD" :right
                    "Space" :shoot}]
      (.addEventListener js/document "keydown"
        (fn [e]
          (when-let [k (get code-map (.-code e))]
            (.preventDefault e)
            (case (:state @state)
              (:dead :won :title)
              (reset! state (assoc (init-state) :state :playing :best (:best @state)))
              (set-key! k true)))))
      (.addEventListener js/document "keyup"
        (fn [e]
          (when-let [k (get code-map (.-code e))]
            (.preventDefault e)
            (set-key! k false)))))

    ;; Touch: left half = fly left, right half = fly right, double tap = shoot
    (let [touch-start (atom nil)]
      (.addEventListener canvas "touchstart"
        (fn [e]
          (.preventDefault e)
          (let [t (aget (.-touches e) 0)
                rect (.getBoundingClientRect canvas)
                tx (- (.-clientX t) (.-left rect))
                ty (- (.-clientY t) (.-top rect))
                now (js/Date.now)]
            ;; Double tap detection for shooting
            (when (and @touch-start (< (- now @touch-start) 300))
              (set-key! :shoot true)
              (js/setTimeout #(swap! state update :keys disj :shoot) 100))
            (reset! touch-start now)
            ;; Movement
            (if (< tx (/ W 2))
              (set-key! :left true)
              (set-key! :right true))
            (when (< ty (/ H 2))
              (set-key! :up true))))
        #js {:passive false})
      (.addEventListener canvas "touchend"
        (fn [e]
          (.preventDefault e)
          (swap! state assoc :keys #{}))
        #js {:passive false})
      (.addEventListener canvas "touchcancel"
        (fn [_] (swap! state assoc :keys #{}))))

    ;; Mouse
    (.addEventListener canvas "mousedown"
      (fn [e]
        (.preventDefault e)
        (let [rect (.getBoundingClientRect canvas)
              mx (- (.-clientX e) (.-left rect))]
          (case (:state @state)
            :title (reset! state (assoc (init-state) :state :playing :best (:best @state)))
            (:dead :won) (reset! state (assoc (init-state) :state :playing :best (:best @state)))
            :playing (do (set-key! :up true)
                         (if (< mx (/ W 2))
                           (set-key! :left true)
                           (set-key! :right true)))
            nil))))
    (.addEventListener canvas "mouseup" (fn [_] (swap! state assoc :keys #{})))

    ;; Game loop: use shared engine loop and on-screen touch controls
    (eng/init-keyboard!)
    (let [wrapper (core/create-el "div" {:class "game-wrapper"})
          touch   (eng/init-touch! wrapper)]
      (.appendChild wrapper (core/create-el "h1"
                              {:style "font-family:'Press Start 2P',monospace;color:#00b4d8;font-size:var(--step-2);text-align:center"}
                              "☁️ Cloud Lift"))
      (.appendChild wrapper (core/create-el "p"
                              {:style "color:#888;text-align:center;margin-block-end:var(--space-m)"}
                              "Fly to data centers · Pick up workloads · Deliver them to the cloud · Avoid outages"))
      (.appendChild wrapper canvas)

      (core/mount!
        (ui/page-shell :helicopter "/articles/helicopter.html" "src/portfolio/games/helicopter.cljs" wrapper))

      (eng/game-loop canvas state (fn [s dt] (update-game s dt touch)) draw!))))
