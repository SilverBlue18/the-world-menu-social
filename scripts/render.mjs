// Render a composition with the Node API (the CLI's browser crashes on some Macs; the API works).
// usage: node scripts/render.mjs <compId> <out.mp4> [preview|final] [concurrency]
//   preview: scale 0.5, CRF 23, veryfast, AAC 192k        final: scale 1, CRF 15, slow, AAC 256k
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [comp, out, mode = "preview", conc = "6"] = process.argv.slice(2);
const final = mode === "final";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp });
fs.mkdirSync(path.dirname(out), { recursive: true });
let last = -1;
await renderMedia({
  serveUrl, composition, codec: "h264", outputLocation: out, concurrency: parseInt(conc),
  scale: final ? 1 : 0.5, crf: final ? 15 : 23, x264Preset: final ? "slow" : "veryfast",
  audioCodec: "aac", audioBitrate: final ? "256k" : "192k", imageFormat: "jpeg", jpegQuality: final ? 95 : 85,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; console.log(`${Math.round(progress * 100)}%`); } },
});
console.log("done", out);
