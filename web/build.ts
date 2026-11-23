import { mkdir, readFile, rm } from "node:fs/promises";
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
    "The reviewed inventory of browser entry points must remain complete.",
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
  await bundle(source, path.join(output, name), "main.js");
}
for (const name of ["site", "docs", "nav"]) {
  await bundle(
    path.join(root, `web/shell/${name}.js`),
    name === "nav" ? path.join(assets, "js") : assets,
    `${name}.js`,
  );
}
console.log(`Built ${expected.length} browser entries and three shell scripts with Bun.`);

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
