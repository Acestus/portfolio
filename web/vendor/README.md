# Browser REPL interpreter

`repl.js` is the existing production browser bundle for the intentional ClojureScript/SCI REPL demo. Its original commit and SHA-256 are pinned in `data/javascript-migration.json`. Bun packages it at the same `/js/repl/main.js` URL; no Java, Clojure CLI, Shadow CLJS, or Maven is invoked by the site build.

This is an explicit retained interpreter, not the source for the other demos. All other application entry points are maintained as JavaScript under `web/modules/portfolio/`. The old `src/portfolio/` tree is historical reference for existing technical article source links and this retained interpreter.

The interpreter includes ClojureScript and SCI runtime code under their upstream Eclipse Public License terms. Retain the reference sources and license notices when distributing it. The collection/string helpers in `web/runtime/` were copied from Squint 0.16.213 and carry their upstream LICENSE; the compiler was used once for migration and is not a project dependency.
