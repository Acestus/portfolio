import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const entries: Record<string, string> = JSON.parse(
  await readFile(path.join(root, "web/entries.json"), "utf8"),
);
const expected = [
  "hub",
  "platformer",
  "invaders",
  "matcher",
  "breakout",
  "helicopter",
  "fabric",
  "policy",
  "logs",
  "iac",
  "platform",
  "repl",
  "architecture",
  "agentic",
  "pricing",
  "m365",
  "workflow",
  "copilotops",
  "fabriccap",
];
if (
  Object.keys(entries).length !== expected.length ||
  expected.some((name) => !entries[name])
) {
  throw new Error(
    "The reviewed inventory of 19 demo entry points must remain complete.",
  );
}
const output = path.join(root, ".build/browser-js");
const assets = path.join(root, ".build/browser-assets");
await rm(output, { recursive: true, force: true });
await rm(assets, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const [name, entry] of Object.entries(entries)) {
  const source = path.resolve(root, entry);
  if (!source.startsWith(path.join(root, "web") + path.sep))
    throw new Error("Entry escapes the browser source root.");
  if (name === "repl") {
    // The intentional SCI interpreter is a frozen browser asset, not a build tool.
    const provenance = JSON.parse(await readFile(path.join(root, "data/javascript-migration.json"), "utf8"));
    const bytes = await readFile(source);
    const sha256 = new Bun.CryptoHasher("sha256").update(bytes).digest("hex");
    if (sha256 !== provenance.repl.sha256) throw new Error("Retained interpreter differs from its reviewed source hash.");
    await mkdir(path.join(output, name), { recursive: true });
    await writeFile(path.join(output, name, "main.js"), bytes);
  } else {
    await bundle(source, path.join(output, name), "main.js");
  }
}
for (const name of ["site", "docs", "nav"]) {
  await bundle(
    path.join(root, `web/shell/${name}.js`),
    name === "nav" ? path.join(assets, "js") : assets,
    `${name}.js`,
  );
}
console.log(
  `Built 18 demos and three shell scripts with Bun; retained the reviewed browser REPL unchanged. No Clojure/JVM compiler.`,
);

async function bundle(source: string, outdir: string, filename: string) {
  const result = await Bun.build({
    entrypoints: [source],
    outdir,
    naming: filename,
    target: "browser",
    format: "iife",
    minify: true,
    sourcemap: "none",
  });
  if (!result.success)
    throw new AggregateError(result.logs, `Browser build failed: ${source}`);
}
