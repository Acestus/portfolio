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
  (eng/draw-text! ctx "CAF NAMING PUZZLE" (/ W 2) 30
                  :color "#00d4ff" :font "16px 'Press Start 2P'" :align "center")
  (eng/draw-text! ctx (str "TIME: " (int (:timer state))) (- W 10) 30
                  :color (if (< (:timer state) 10) "#ff0040" "#ffaa00")
                  :font "12px 'Press Start 2P'" :align "right")
  (eng/draw-text! ctx (str "SCORE: " (:score state)) 10 30
                  :color "#ffaa00" :font "12px 'Press Start 2P'")
  ;; resources column
  (eng/draw-text! ctx "RESOURCE" 20 70 :color "#00d4ff" :font "10px 'Press Start 2P'")
  (doseq [[i r] (map-indexed vector (:resources state))]
    (let [matched (some #(= r (:resource %)) (:matched state))
          selected (= r (:selected-resource state))
          color (cond matched "#00ff41" selected "#ffaa00" :else "#ffffff")]
      (eng/draw-text! ctx r 20 (+ 100 (* i 30)) :color color :font "11px 'VT323'")))
  ;; names column
  (eng/draw-text! ctx "CAF NAME" 260 70 :color "#00d4ff" :font "10px 'Press Start 2P'")
  (doseq [[i n] (map-indexed vector (:names state))]
    (let [matched (some #(= n (:caf %)) (:matched state))
          color (if matched "#00ff41" "#ffffff")]
      (eng/draw-text! ctx n 260 (+ 100 (* i 30)) :color color :font "11px 'VT323'")))
  ;; Win / lose
  (when (= :win (:phase state))
    (eng/draw-text! ctx "ALL MATCHED!" (/ W 2) (/ H 2)
                    :color "#00ff41" :font "20px 'Press Start 2P'" :align "center"))
  (when (= :timeout (:phase state))
    (eng/draw-text! ctx "TIME'S UP!" (/ W 2) (/ H 2)
                    :color "#ff0040" :font "20px 'Press Start 2P'" :align "center")))

(defn- update-game [state dt]
  (if (not= :playing (:phase state))
    ;; still update connection timers even when paused/won
    (let [conns (->> (:connections state)
                     (map #(update % :elapsed + dt))
                     (filter #(<= (:elapsed %) (:duration %)))
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
                     (filter #(<= (:elapsed %) (:duration %)))
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
