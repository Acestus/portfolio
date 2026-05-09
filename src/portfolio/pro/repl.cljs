(ns portfolio.pro.repl
  "ClojureScript REPL Playground — in-browser SCI evaluator."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]
            [sci.core :as sci]))

(def ^:private examples
  [";; Map and filter\n(filter odd? (map #(* % %) (range 1 11)))"
   ";; Persistent data structures\n(let [v [1 2 3]\n      v2 (conj v 4)]\n  {:original v :updated v2})"
   ";; Threading macro\n(->> (range 1 20)\n     (filter even?)\n     (map #(* % 3))\n     (reduce +))"
   ";; Destructuring\n(let [{:keys [name role]} {:name \"William\" :role \"Platform Engineer\"}]\n  (str name \" — \" role))"
   ";; Recursive Fibonacci\n(defn fib [n]\n  (if (<= n 1) n\n    (+ (fib (- n 1)) (fib (- n 2)))))\n(mapv fib (range 12))"
   ";; Atoms — mutable state\n(let [counter (atom 0)]\n  (dotimes [_ 5] (swap! counter inc))\n  @counter)"])

(def ^:private sci-ctx
  (sci/init {:namespaces {'user {'println println}}}))

(defn- evaluate [code]
  (try
    (let [result (sci/eval-string* sci-ctx code)]
      {:ok true :value (pr-str result)})
    (catch :default e
      {:ok false :value (str "Error: " (.-message e))})))

(defn- repl-content []
  (let [container (core/create-el "div" {:class "repl-container"})
        editor    (core/create-el "textarea" {:class "repl-editor"
                                               :spellcheck "false"
                                               :placeholder ";; Type ClojureScript here..."})
        output    (core/create-el "pre" {:class "repl-output"})
        history   (atom [])
        run-btn   (core/create-el "button" {:class "repl-run-btn"} "▶ Evaluate")
        clear-btn (core/create-el "button" {:class "repl-clear-btn"} "Clear")]

    (.appendChild container (core/create-el "h1" {:class "repl-title"} "λ ClojureScript REPL"))
    (.appendChild container (core/create-el "p" {:class "repl-subtitle"}
      "Live ClojureScript evaluation powered by SCI — no server needed"))

    ;; example buttons
    (let [examples-bar (core/create-el "div" {:class "examples-bar"})]
      (.appendChild examples-bar (core/create-el "span" {:class "examples-label"} "Examples:"))
      (doseq [[i ex] (map-indexed vector examples)]
        (let [btn (core/create-el "button" {:class "example-btn"} (str "#" (inc i)))]
          (.addEventListener btn "click" (fn [_] (set! (.-value editor) ex)))
          (.appendChild examples-bar btn)))
      (.appendChild container examples-bar))

    ;; editor
    (.appendChild container editor)

    ;; buttons
    (let [btn-bar (core/create-el "div" {:class "repl-btn-bar"})]
      (.addEventListener run-btn "click"
        (fn [_]
          (let [code (.-value editor)
                result (evaluate code)
                line (str "user=> " (first (.split code "\n")) "\n"
                          (if (:ok result) (:value result) (:value result)))]
            (swap! history conj line)
            (set! (.-textContent output) (clojure.string/join "\n\n" @history))
            (set! (.-scrollTop output) (.-scrollHeight output)))))
      (.addEventListener clear-btn "click"
        (fn [_]
          (reset! history [])
          (set! (.-textContent output) "")
          (set! (.-value editor) "")))
      ;; Ctrl+Enter to evaluate
      (.addEventListener editor "keydown"
        (fn [e]
          (when (and (or (.-ctrlKey e) (.-metaKey e)) (= (.-key e) "Enter"))
            (.preventDefault e)
            (.click run-btn))))
      (.appendChild btn-bar run-btn)
      (.appendChild btn-bar clear-btn)
      (.appendChild container btn-bar))

    ;; output
    (.appendChild container (core/create-el "div" {:class "repl-output-label"} "Output"))
    (.appendChild container output)

    container))

(defn init []
  (core/mount!
    (ui/page-shell :repl "/articles/clojure-repl.html" "src/portfolio/pro/repl.cljs"
                   (repl-content))))
