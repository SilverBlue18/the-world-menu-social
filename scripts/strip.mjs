// Motion check: one strip per scene of the Ketchup2D video (frames at +0.1, +0.4, +0.8, +1.4, +2.2 s into each scene)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path"; import fs from "node:fs";
const [id, outDir, beatsPath] = process.argv.slice(2);
const beats = JSON.parse(fs.readFileSync(beatsPath, "utf8")); fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id });
for (const [i, s] of beats.scenes.entries()) {
  const end = beats.scenes[i + 1]?.t ?? beats.duration;
  for (const [j, dt] of [0.1, 0.4, 0.8, 1.4, 2.2].entries()) {
    const t = Math.min(s.t + dt, end - 0.05);
    await renderStill({ serveUrl, composition, output: path.join(outDir, `s${String(i).padStart(2, "0")}_${j}.jpg`), frame: Math.round(t * 30), imageFormat: "jpeg", jpegQuality: 70, scale: 0.25 });
  }
}
console.log("done");
