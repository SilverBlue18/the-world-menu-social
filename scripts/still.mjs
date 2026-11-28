// Render one or more Remotion stills with the Node API: node scripts/still.mjs <outDir> <id> [id...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [outDir, ...ids] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id });
  const output = path.join(outDir, `${id}.jpg`);
  await renderStill({ serveUrl, composition, output: process.env.PNG ? output.replace(/\.jpg$/, ".png") : output, ...(process.env.PNG ? { imageFormat: "png" } : { imageFormat: "jpeg", jpegQuality: 92 }) });
  console.log("wrote", output);
}
