(ns portfolio.components
  "Shared UI components — nav, footer, links."
  (:require [portfolio.core :as core]))

(def ^:private source-base "https://github.com/Acestus/portfolio")

(defn nav-bar
  "Top navigation bar. `active` is the current page keyword."
  [active]
  (let [links [{:key :hub         :label "Portfolio"  :href "https://portfolio.acestus.com"}
               {:key :helicopter  :label "Cloud Lift" :href "/helicopter.html"}
               {:key :platformer  :label "Platformer" :href "/platformer.html"}
               {:key :invaders    :label "Invaders"   :href "/invaders.html"}
               {:key :matcher     :label "CAF Puzzle"  :href "/matcher.html"}
               {:key :breakout    :label "Breakout"   :href "/breakout.html"}
               {:key :fabric      :label "Fabric"     :href "/fabric.html"}
               {:key :policy      :label "Policy"     :href "/policy.html"}
               {:key :logs        :label "Logs"       :href "/logs.html"}
               {:key :iac         :label "IaC"        :href "/iac.html"}
               {:key :platform    :label "Platform"   :href "/platform.html"}
               {:key :repl        :label "REPL"       :href "/repl.html"}
               {:key :architecture :label "Arch"       :href "/architecture.html"}
               {:key :agentic      :label "Agentic"    :href "/agentic.html"}
               {:key :particles    :label "Particles"  :href "/particles.html"}
               {:key :raytracer    :label "Raytracer"  :href "/raytracer.html"}
               {:key :life         :label "Life"       :href "/life.html"}]
        nav (core/create-el "nav" {:class "site-nav" :role "navigation"})
        home (core/create-el "a" {:class "site-name" :href "https://func-website-dev-scus-001.azurewebsites.net"} "acestus.com")]
    (.appendChild nav home)
    (let [menu (core/create-el "div" {:class "nav-links"})]
      (doseq [{:keys [key label href]} links]
        (let [cls (if (= key active) "nav-link active" "nav-link")]
          (.appendChild menu (core/create-el "a" {:class cls :href href} label))))
      (.appendChild nav menu))
    (let [toggle (core/create-el "button" {:class "nav-toggle" :aria-label "Menu"} "☰")]
      (.addEventListener toggle "click"
        (fn [_]
          (let [links (.querySelector nav ".nav-links")]
            (.toggle (.-classList links) "open"))))
      (.appendChild nav toggle))
    nav))

(defn footer
  "Site footer."
  []
  (core/create-el "footer" {:class "site-footer"}
    (core/create-el "p" {} "acestus.com — William Weeks-Balconi")))

(defn action-links
  "Article + source code link bar."
  [article-path source-path]
  (let [bar (core/create-el "div" {:class "action-links"})]
    (.appendChild bar
      (core/create-el "a" {:class "action-btn" :href article-path} "📄 Read Article"))
    (.appendChild bar
      (core/create-el "a" {:class "action-btn"
                           :href (str source-base "/tree/main/" source-path)
                           :target "_blank"
                           :rel "noopener noreferrer"}
        "⌨ Source Code"))
    bar))

(defn page-shell
  "Assemble a full page: nav + content + action-links + footer."
  [active-key article-path source-path content-el]
  (let [shell (core/create-el "div" {:class "page-shell"})]
    (.appendChild shell (nav-bar active-key))
    (let [main (core/create-el "main" {:class "main-content"})]
      (.appendChild main content-el)
      (.appendChild main (action-links article-path source-path))
      (.appendChild shell main))
    (.appendChild shell (footer))
    shell))
