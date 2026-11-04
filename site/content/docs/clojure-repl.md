---
title: "ClojureScript REPL Playground"
description: "Live in-browser ClojureScript evaluation powered by SCI (Small Clojure Interpreter). No server is required; code is evaluated locally in the browser, examples are injected into the editor, and Ctrl+Enter runs forms…"
space: "Working examples"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/clojure-repl.html"
demo: "/repl.html"
---

> Live in-browser ClojureScript evaluation powered by SCI (Small Clojure Interpreter). No server is required; code is evaluated locally in the browser, examples are injected into the editor, and Ctrl+Enter runs forms instantly. The page is both a technical demo and a small tribute to the Clojure community's bias toward simplicity, data, and composability.



- **6** — Examples

- **SCI** — Evaluator

- **Ctrl+Enter** — Run Shortcut

- **Zero** — Backend Dependency



Example Snippet→ Textarea Editor→ SCI Eval→ History Append→ Output Pane



## 1. Why Clojure



Rich Hickey's distinction between simple and easy matters here. Clojure is not always the easiest language in the moment, but it is unusually good at making systems simple: data is explicit, mutation is controlled, values are composable, and complexity is harder to hide behind classes and framework ceremony.



That philosophy shows up even in this tiny REPL. Examples focus on map/filter, persistent vectors, threading macros, destructuring, recursion, and atoms. In other words, the demo teaches the language through ideas that scale beyond syntax.



## 2. SCI — Small Clojure Interpreter



SCI is the technical trick that makes the page possible. Instead of sending code to a server-side runtime, the browser hosts an interpreter configured with an allowed namespace surface. The source initializes an SCI context once and reuses it for each evaluation, which keeps the interaction immediate while avoiding the complexity of standing up a remote REPL service.



```text
(def sci-ctx
  (sci/init {:namespaces {'user {'println println}}}))

(defn evaluate [code]
  (try
    {:ok true :value (pr-str (sci/eval-string* sci-ctx code))}
    (catch :default e
      {:ok false :value (str 'Error: ' (.-message e))})))
```



That restricted model is part of why the demo feels safe and portable. It is not pretending to be a full development environment; it is a focused in-browser evaluator with a clear trust boundary.



## 3. This Website Runs Clojure



The page is also a quiet statement about the broader stack: Clojure is not confined to toy REPLs or back-office batch jobs. The ecosystem comfortably spans browser code, build tooling, serverless functions, and cloud workflows. In that sense the playground is less a gimmick than a visible endpoint of a larger Clojure-first approach.



That is why the portfolio framing matters. A live REPL on a personal site says something stronger than a static code screenshot: the language is part of the operating model, not just a side hobby.



## 4. ClojureScript for the Browser



The surrounding site uses shadow-cljs with multiple independent browser builds, one per SPA. That is a nice fit for portfolio architecture because each demo has a separate entry point and compiled artifact, while still sharing utility namespaces. The REPL itself is just one build among many, not a special snowflake.



Interaction is delightfully direct: buttons inject sample programs into the textarea, the Evaluate button runs the current buffer, Clear resets editor and history, and Ctrl+Enter or Cmd+Enter triggers evaluation from the keyboard. Those are small touches, but they make the page feel like a real tool instead of a static showcase.



## 5. The Clojure Community



The final section is about culture. Clojure's community has long valued careful reasoning, durable abstractions, and generosity in teaching. Libraries like SCI are a perfect example: they enable creative experiences without abandoning the language's core values around data and explicitness.



This playground feels like a love letter because it is one. It turns a browser tab into a tiny space for exploration, which is exactly what a good REPL has always been.
