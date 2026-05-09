(ns portfolio.hub
  "Portfolio hub — grid of all SPAs."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]))

(def ^:private apps
  [{:category "🕹 Retro Arcade"
    :items [{:title "Cloud Platformer"      :href "/platformer.html" :icon "🏔"  :desc "Navigate cloud infrastructure in 8-bit glory"}
            {:title "Space Invaders"        :href "/invaders.html"   :icon "👾"  :desc "Defend against security misconfigurations"}
            {:title "CAF Naming Puzzle"     :href "/matcher.html"    :icon "🧩"  :desc "Match resources to CAF-compliant names"}
            {:title "Tech Breakout"         :href "/breakout.html"   :icon "🧱"  :desc "Smash through tech-themed bricks"}
            {:title "Choplifter"           :href "/helicopter.html" :icon "🚁"  :desc "Rescue hostages from enemy territory"}]}
   {:category "📊 Professional"
    :items [{:title "Fabric Pipeline"       :href "/fabric.html"     :icon "💎"  :desc "Medallion architecture — Bronze → Silver → Gold"}
            {:title "Policy Dashboard"      :href "/policy.html"     :icon "🛡"  :desc "Azure Policy governance at scale"}
            {:title "Log Pipeline"          :href "/logs.html"       :icon "📡"  :desc "Real-time Event Hub → Eventhouse flow"}
            {:title "IaC Pipeline"          :href "/iac.html"        :icon "🏗"  :desc "Bicep AVM → Deployment Stacks"}
            {:title "Platform Console"      :href "/platform.html"   :icon "🎛"  :desc "Platform engineering workspace provisioning"}
            {:title "Clojure REPL"          :href "/repl.html"       :icon "λ"   :desc "Live ClojureScript in your browser"}
            {:title "Architecture Studio"  :href "/architecture.html" :icon "🏛" :desc "C4 models and architecture decision records"}
            {:title "The Agentic Web"     :href "/agentic.html"      :icon "🦞" :desc "How OpenClaw is the HTTP of AI agents"}]}
   {:category "🦀 Rust + WASM"
    :items [{:title "Particle Storm"        :href "/particles.html"  :icon "🌀"  :desc "3,000 particles with orbiting gravity wells"}
            {:title "Raytracer"             :href "/raytracer.html"  :icon "🔮"  :desc "Real-time ray-traced scene with reflections"}
            {:title "Game of Life"          :href "/life.html"       :icon "🧬"  :desc "Massive Conway grid at 60fps"}]}])

(defn- card [item]
  (core/create-el "a" {:class "hub-card" :href (:href item)}
    (core/create-el "span" {:class "hub-icon"} (:icon item))
    (core/create-el "span" {:class "hub-title"} (:title item))
    (core/create-el "span" {:class "hub-desc"} (:desc item))))

(defn- category-section [{:keys [category items]}]
  (let [section (core/create-el "section" {:class "hub-category"})]
    (.appendChild section (core/create-el "h2" {:class "hub-category-title"} category))
    (let [grid (core/create-el "div" {:class "hub-grid"})]
      (doseq [item items]
        (.appendChild grid (card item)))
      (.appendChild section grid))
    section))

(defn- hub-content []
  (let [container (core/create-el "div" {:class "hub-container"})]
    (.appendChild container
      (core/create-el "h1" {:class "hub-heading"} "Portfolio"))
    (.appendChild container
      (core/create-el "p" {:class "hub-intro"}
        "Interactive demos showcasing Azure, Fabric, Clojure, and cloud platform engineering."))
    (doseq [cat apps]
      (.appendChild container (category-section cat)))
    container))

(defn init []
  (core/mount!
    (ui/page-shell :hub "/articles/hub.html" "" (hub-content))))
