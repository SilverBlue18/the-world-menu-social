// usage: node scripts/stills.mjs <compId> <outPrefix> <sec,sec,...> [scale]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [comp, prefix, secs, scale = "0.5"] = process.argv.slice(2);
const chrome = !fs.existsSync("/opt/pw-browsers") ? undefined : fs.readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium-")).map((d) => `/opt/pw-browsers/${d}/chrome-linux64/chrome`).find((p) => fs.existsSync(p));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = process.env.TWM_GL ? { gl: process.env.TWM_GL } : {};
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable: chrome, chromiumOptions });
fs.mkdirSync(path.dirname(prefix), { recursive: true });
for (const s of secs.split(",")) {
  const frame = Math.round(parseFloat(s) * 30);
  const output = `${prefix}${String(frame).padStart(4, "0")}.jpg`;
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 85, scale: parseFloat(scale), browserExecutable: chrome, chromiumOptions, timeoutInMilliseconds: 120000 });
  console.log(output);
}
