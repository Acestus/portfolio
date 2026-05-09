(ns portfolio.core
  "Shared utilities — pure functions, DOM helpers, state management.")

(defn by-id
  "Get a DOM element by ID."
  [id]
  (.getElementById js/document id))

(defn create-el
  "Create a DOM element with optional attrs and children."
  [tag attrs & children]
  (let [el (.createElement js/document tag)]
    (doseq [[k v] attrs]
      (if (= k :class)
        (set! (.-className el) v)
        (.setAttribute el (name k) v)))
    (doseq [child children]
      (cond
        (string? child) (.appendChild el (.createTextNode js/document child))
        (some? child)   (.appendChild el child)))
    el))

(defn mount!
  "Clear the app root and mount an element."
  [el]
  (let [root (by-id "app")]
    (set! (.-innerHTML root) "")
    (.appendChild root el)))

(defn now
  "Current timestamp in milliseconds."
  []
  (.now js/Date))

(defn toast!
  "Show a brief toast notification that auto-dismisses."
  [text]
  (let [el (create-el "div" {:class "click-toast"} text)]
    (.appendChild (.-body js/document) el)
    (js/setTimeout #(when (.-parentNode el) (.removeChild (.-parentNode el) el)) 2500)))
