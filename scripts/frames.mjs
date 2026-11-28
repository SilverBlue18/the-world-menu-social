// QC stills of a video composition at given seconds: node scripts/frames.mjs <compId> <outDir> <t1,t2,...> [scale]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [id, outDir, ts, scale = "0.5"] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id });
for (const t of ts.split(",").map(Number)) {
  const output = path.join(outDir, `${id}_${t.toFixed(2)}.jpg`);
  await renderStill({ serveUrl, composition, output, frame: Math.round(t * composition.fps), imageFormat: "jpeg", jpegQuality: 85, scale: parseFloat(scale) });
  console.log("wrote", output);
}
