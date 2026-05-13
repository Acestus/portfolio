(ns portfolio.components
  "Shared UI components — footer, links. Nav is handled by /js/nav.js."
  (:require [portfolio.core :as core]))

(def ^:private source-base "https://github.com/Acestus/portfolio")

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
  "Assemble a full page: content + action-links + footer.
   Nav is injected by /js/nav.js (included in every HTML page)."
  [_active-key article-path source-path content-el]
  (let [shell (core/create-el "div" {:class "page-shell"})]
    ;; nav.js will prepend the nav into this .page-shell
    (let [main (core/create-el "main" {:class "main-content"})]
      (.appendChild main content-el)
      (.appendChild main (action-links article-path source-path))
      (.appendChild shell main))
    (.appendChild shell (footer))
    shell))
