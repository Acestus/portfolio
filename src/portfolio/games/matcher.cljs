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

(defn- create-style-el []
  (core/create-el "style" {}
".matcher-game{position:relative;width:480px;margin:0 auto;display:flex;gap:12px;font-family:'VT323',monospace}
.matcher-col{flex:1;display:flex;flex-direction:column;gap:10px;padding:8px}
.matcher-item{background:#0b0b16;color:#ffffff;height:52px;display:flex;align-items:center;padding:0 12px;border-radius:6px;font-size:20px;cursor:pointer;user-select:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.matcher-item.selected{outline:2px solid #ffaa00}
.matcher-item.matched{background:#002b07;color:#00ff41}
.match-line{position:absolute;height:4px;background:rgba(0,255,65,0.95);transform-origin:left center;border-radius:2px;transition:transform .35s ease}
.matcher-header{color:#00d4ff;text-align:center;font-size:20px;margin-bottom:8px}
@media (max-width:480px){.matcher-game{width:100%;padding:8px}.matcher-item{font-size:18px;height:48px}}"))

(defn- make-item-el [text cls]
  (core/create-el "div" {:class cls} text))

(defn- draw-connection! [container a b]
  (let [rA (.getBoundingClientRect a)
        rB (.getBoundingClientRect b)
        cR (.getBoundingClientRect container)
        x1 (- (.-right rA) (.-left cR))
        y1 (- (+ (.-top rA) (/ (.-height rA) 2)) (.-top cR))
        x2 (- (.-left rB) (.-left cR))
        y2 (- (+ (.-top rB) (/ (.-height rB) 2)) (.-top cR))
        dx (- x2 x1)
        dy (- y2 y1)
        len (js/Math.hypot dx dy)
        ang (* 180 (/ (js/Math.atan2 dy dx) js/Math.PI))
        line (core/create-el "div" {:class "match-line"})]
    (set! (.-left (.-style line)) (str x1 "px"))
    (set! (.-top (.-style line)) (str (- y1 2) "px"))
    (set! (.-width (.-style line)) (str len "px"))
    ;; start collapsed and animate to full length using scaleX
    (set! (.-transform (.-style line)) (str "rotate(" ang "deg) scaleX(0)"))
    (.appendChild container line)
    (js/requestAnimationFrame
      (fn [] (set! (.-transform (.-style line)) (str "rotate(" ang "deg) scaleX(1)"))))
    line))

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
  (let [wrapper (core/create-el "div" {:class "game-wrapper"})
        style-el (create-style-el)
        header (core/create-el "h1" {:class "matcher-header"} "CAF NAMING PUZZLE")
        container (core/create-el "div" {:class "matcher-game"})
        left-col (core/create-el "div" {:class "matcher-col left-col"})
        right-col (core/create-el "div" {:class "matcher-col right-col"})
        state-atom (atom (initial-state))
        res-els (atom [])
        name-els (atom [])]

    ;; assemble DOM
    (.appendChild wrapper style-el)
    (.appendChild wrapper header)
    (.appendChild container left-col)
    (.appendChild container right-col)
    (.appendChild wrapper container)

    ;; create resource and name items
    (doseq [[i r] (map-indexed vector (:resources @state-atom))]
      (let [el (make-item-el r "matcher-item resource-item")]
        (.addEventListener el "click"
          (fn [_]
            (swap! state-atom assoc :selected-resource i)
            ;; update selected classes
            (doseq [[j e] (map-indexed vector @res-els)]
              (let [res-name (nth (:resources @state-atom) j)
                    matched? (some #(= (:resource %) res-name) (:matched @state-atom))
                    cls (cond
                          matched? "matcher-item matched"
                          (= j i) "matcher-item selected"
                          :else "matcher-item")]
                (set! (.-className e) cls)))))
        (swap! res-els conj el)
        (.appendChild left-col el)))

    (doseq [[i n] (map-indexed vector (:names @state-atom))]
      (let [el (make-item-el n "matcher-item name-item")]
        (.addEventListener el "click"
          (fn [_]
            (let [sel (:selected-resource @state-atom)]
              (when (some? sel)
                (let [res (nth (:resources @state-atom) sel)
                      nam (nth (:names @state-atom) i)]
                  (if (find-pair res nam (:pairs @state-atom))
                    (do
                      ;; mark matched visually
                      (set! (.-className (nth @res-els sel)) "matcher-item matched")
                      (set! (.-className el) "matcher-item matched")
                      ;; draw persistent connection
                      (draw-connection! container (nth @res-els sel) el)
                      ;; update state: matched pairs and score
                      (swap! state-atom #(-> %
                                             (update :matched conj (find-pair res nam (:pairs %)))
                                             (update :score + 200)
                                             (assoc :selected-resource nil))))
                    ;; wrong selection: flash
                    (do (set! (.-className (nth @res-els sel)) "matcher-item")
                        (swap! state-atom update :wrong inc)
                        (swap! state-atom assoc :selected-resource nil))))))))
        (swap! name-els conj el)
        (.appendChild right-col el)))

    ;; mount into page
    (core/mount!
      (ui/page-shell :matcher "/articles/caf-matcher.html" "src/portfolio/games/matcher.cljs" wrapper))))
