(ns portfolio.games.engine
  "Shared game engine — canvas, game loop, input, sprites."
  (:require [portfolio.core :as core]))

;; ---------------------------------------------------------------------------
;; Canvas setup
;; ---------------------------------------------------------------------------

(defn create-canvas
  "Create an auto-scaling canvas that fits the viewport."
  [width height]
  (let [canvas (core/create-el "canvas" {:class "game-canvas"
                                          :width (str width)
                                          :height (str height)})]
    canvas))

(defn ctx [canvas] (.getContext canvas "2d"))

;; ---------------------------------------------------------------------------
;; Game loop
;; ---------------------------------------------------------------------------

(defn game-loop
  "Start a requestAnimationFrame loop. `state` is an atom.
   `update-fn` receives state and dt (seconds), returns new state.
   `render-fn` receives canvas context and state."
  [canvas state update-fn render-fn]
  (let [context (ctx canvas)
        last-t  (atom (core/now))]
    (letfn [(tick []
              (let [now-t  (core/now)
                    dt     (/ (- now-t @last-t) 1000.0)]
                (reset! last-t now-t)
                (swap! state update-fn dt)
                (render-fn context @state)
                (.requestAnimationFrame js/window tick)))]
      (tick))))

;; ---------------------------------------------------------------------------
;; Input — keyboard + touch
;; ---------------------------------------------------------------------------

(def keys-down (atom #{}))

(defn init-keyboard! []
  (.addEventListener js/window "keydown"
    (fn [e] (swap! keys-down conj (.-code e))))
  (.addEventListener js/window "keyup"
    (fn [e] (swap! keys-down disj (.-code e)))))

(defn key-held? [code] (contains? @keys-down code))

(defn init-touch!
  "Add virtual d-pad touch controls for mobile. Returns a touch-state atom
   with :left :right :up :action keys."
  [container]
  (let [touch-state (atom {:left false :right false :up false :action false})
        dpad        (core/create-el "div" {:class "touch-controls"})
        btn         (fn [label cls key]
                      (let [b (core/create-el "button" {:class (str "touch-btn " cls)} label)]
                        (.addEventListener b "touchstart"
                          (fn [e] (.preventDefault e) (swap! touch-state assoc key true))
                          #js {:passive false})
                        (.addEventListener b "touchend"
                          (fn [e] (.preventDefault e) (swap! touch-state assoc key false))
                          #js {:passive false})
                        ;; Desktop mouse support: mousedown/up and mouseleave
                        (.addEventListener b "mousedown"
                          (fn [e] (.preventDefault e) (swap! touch-state assoc key true)))
                        (.addEventListener b "mouseup"
                          (fn [e] (.preventDefault e) (swap! touch-state assoc key false)))
                        (.addEventListener b "mouseleave"
                          (fn [e] (.preventDefault e) (swap! touch-state assoc key false)))
                        ;; Support click as a short tap (useful for action/shoot button)
                        (.addEventListener b "click"
                          (fn [e] (.preventDefault e) (swap! touch-state assoc key true) (js/setTimeout #(swap! touch-state assoc key false) 120)))
                        b))]
    (.appendChild dpad (btn "◀" "t-left" :left))
    (.appendChild dpad (btn "▶" "t-right" :right))
    (.appendChild dpad (btn "▲" "t-up" :up))
    (.appendChild dpad (btn "●" "t-action" :action))
    (.appendChild container dpad)
    touch-state))

;; ---------------------------------------------------------------------------
;; Drawing helpers
;; ---------------------------------------------------------------------------

(defn clear! [ctx w h]
  (set! (.-fillStyle ctx) "#0a0a2a")
  (.fillRect ctx 0 0 w h))

(defn draw-text! [ctx text x y & {:keys [color font align]
                                    :or {color "#00ff41" font "16px 'Press Start 2P'" align "left"}}]
  (set! (.-fillStyle ctx) color)
  (set! (.-font ctx) font)
  (set! (.-textAlign ctx) align)
  (.fillText ctx text x y))

(defn draw-rect! [ctx x y w h color]
  (set! (.-fillStyle ctx) color)
  (.fillRect ctx x y w h))

;; ---------------------------------------------------------------------------
;; Collision
;; ---------------------------------------------------------------------------

(defn aabb?
  "Axis-aligned bounding box collision."
  [{ax :x ay :y aw :w ah :h} {bx :x by :y bw :w bh :h}]
  (and (< ax (+ bx bw))
       (< bx (+ ax aw))
       (< ay (+ by bh))
       (< by (+ ay ah))))

;; ---------------------------------------------------------------------------
;; Score
;; ---------------------------------------------------------------------------

(defn draw-hud! [ctx state w]
  (draw-text! ctx (str "SCORE: " (:score state 0)) 10 30
              :color "#ffaa00" :font "14px 'Press Start 2P'")
  (draw-text! ctx (str "LIVES: " (:lives state 3)) (- w 10) 30
              :color "#ff0040" :font "14px 'Press Start 2P'" :align "right"))
