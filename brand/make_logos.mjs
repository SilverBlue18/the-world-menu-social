import { createRequire } from "module"; const { chromium } = createRequire(import.meta.url)("playwright");
import { readFileSync, writeFileSync } from "fs";
import { geoOrthographic, geoPath, geoInterpolate } from "d3-geo";
const geo = JSON.parse(readFileSync("geo.json"));
const F = "file:///home/user/studio/public/fonts/";
const T = "file:///home/user/studio/public/";
const INK = "#2a1c11", SEPIA = "#6b4a2b", RED = "#9e2a1f", GOLD = "#e9b45a", PAPER = "#efe5cf";
const css = `
@font-face{font-family:PF;src:url(${F}playfair-display-latin-900-normal.woff2)}
@font-face{font-family:PF7;src:url(${F}playfair-display-latin-700-normal.woff2)}
@font-face{font-family:SE;src:url(${F}special-elite-latin-400-normal.woff2)}
@font-face{font-family:OS;src:url(${F}oswald-latin-500-normal.woff2)}
*{margin:0;padding:0}body{width:1080px;height:1080px;overflow:hidden}
.wood{position:absolute;inset:0;background:url(${T}mock/wood.jpg) center/1600px auto}
.lamp{position:absolute;inset:0;background:radial-gradient(circle at 45% 40%,rgba(255,196,120,.28),rgba(0,0,0,0) 60%),radial-gradient(circle at 50% 50%,rgba(0,0,0,0) 45%,rgba(10,4,0,.75) 100%)}
.grain{position:absolute;inset:0;background:url(${T}imam/tex/grain0.png);opacity:.10;mix-blend-mode:overlay}
.disc{position:absolute;left:90px;top:90px;width:900px;height:900px;border-radius:50%;background:url(${T}imam/tex/parchment.jpg) center/1400px;box-shadow:0 30px 70px rgba(0,0,0,.7), inset 0 0 120px rgba(90,55,20,.6), inset 0 0 14px rgba(70,40,10,.8)}
`;
// compass rose
const rose = (cx, cy, R) => {
  let s = "";
  const pt = (a, r) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const star = (n, r1, r2, rot, fillA, fillB, sw) => {
    for (let i = 0; i < n; i++) {
      const a = rot + (i * 2 * Math.PI) / n, h = Math.PI / n;
      const t = pt(a, r1), l = pt(a - h, r2), r = pt(a + h, r2);
      s += `<path d="M${cx},${cy}L${l}L${t}Z" fill="${fillA}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      s += `<path d="M${cx},${cy}L${t}L${r}Z" fill="${fillB}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    }
  };
  star(8, R * 0.62, R * 0.16, Math.PI / 8, PAPER, "#c9ad80", 3);
  star(4, R, R * 0.2, 0, INK, PAPER, 4);
  // red north
  const t = pt(0, R), l = pt(-Math.PI / 4, R * 0.2), r = pt(Math.PI / 4, R * 0.2);
  s += `<path d="M${cx},${cy}L${l}L${t}Z" fill="${RED}" stroke="${INK}" stroke-width="4"/><path d="M${cx},${cy}L${t}L${r}Z" fill="#c2463a" stroke="${INK}" stroke-width="4"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R * 0.07}" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>`;
  return s;
};
const rings = (cx, cy, r) => {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="${cx}" cy="${cy}" r="${r - 26}" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
  for (let i = 0; i < 72; i++) { const a = (i * Math.PI) / 36, L = i % 9 === 0 ? 26 : i % 3 === 0 ? 16 : 9;
    s += `<line x1="${cx + (r - 26) * Math.sin(a)}" y1="${cy - (r - 26) * Math.cos(a)}" x2="${cx + (r - 26 + L) * Math.sin(a)}" y2="${cy - (r - 26 + L) * Math.cos(a)}" stroke="${INK}" stroke-width="2.5"/>`; }
  return s;
};
const hatch = `<pattern id="h" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="9" stroke="${SEPIA}" stroke-width="2" opacity=".45"/></pattern>`;
const A = `<div class="wood"></div><div class="disc"></div>
<svg width="1080" height="1080" style="position:absolute;inset:0">${rings(540, 540, 410)}${rose(540, 540, 330)}
<text x="540" y="104" text-anchor="middle" font-family="PF" font-size="0"></text></svg><div class="lamp"></div><div class="grain"></div>`;
// wax seal
const blob = (() => { let d = ""; for (let i = 0; i <= 64; i++) { const a = (i / 64) * 2 * Math.PI; const r = 430 + 18 * Math.sin(a * 5 + 1) + 12 * Math.sin(a * 9 + 2) + 8 * Math.sin(a * 13); d += (i ? "L" : "M") + (540 + r * Math.cos(a)).toFixed(1) + "," + (540 + r * Math.sin(a)).toFixed(1); } return d + "Z"; })();
const B = `<div class="wood"></div>
<svg width="1080" height="1080" style="position:absolute;inset:0"><defs>
<radialGradient id="wax" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#c0392b"/><stop offset=".55" stop-color="#8e1f16"/><stop offset="1" stop-color="#4a0c07"/></radialGradient>
<radialGradient id="well" cx="55%" cy="60%" r="70%"><stop offset="0" stop-color="#9a2318"/><stop offset="1" stop-color="#6d150e"/></radialGradient>
<filter id="emb"><feGaussianBlur in="SourceAlpha" stdDeviation="3"/><feOffset dx="-4" dy="-4" result="hi"/><feGaussianBlur in="SourceAlpha" stdDeviation="3"/><feOffset dx="5" dy="5" result="lo"/>
<feFlood flood-color="#ff8a70" flood-opacity=".55"/><feComposite in2="hi" operator="in" result="h2"/><feFlood flood-color="#2a0402" flood-opacity=".8"/><feComposite in2="lo" operator="in" result="l2"/>
<feMerge><feMergeNode in="l2"/><feMergeNode in="h2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="sh"><feDropShadow dx="0" dy="26" stdDeviation="26" flood-color="#000" flood-opacity=".7"/></filter></defs>
<path d="${blob}" fill="url(#wax)" filter="url(#sh)"/>
<circle cx="540" cy="540" r="330" fill="url(#well)" filter="url(#emb)"/>
<g filter="url(#emb)" fill="#8a1c13" stroke="#5c0f09" stroke-width="2">
<circle cx="540" cy="540" r="300" fill="none" stroke="#b33a2c" stroke-width="7"/>
<circle cx="540" cy="540" r="282" fill="none" stroke="#b33a2c" stroke-width="3"/>
<text x="540" y="625" text-anchor="middle" font-family="PF" font-size="250" fill="#a8291d" stroke="#5c0f09" stroke-width="3">DA</text>
<text x="540" y="368" text-anchor="middle" font-family="OS" font-size="38" letter-spacing="14" fill="#b33a2c" stroke="none">THE DESK</text>
<text x="540" y="745" text-anchor="middle" font-family="OS" font-size="38" letter-spacing="14" fill="#b33a2c" stroke="none">ATLAS</text>
</g></svg><div class="lamp" style="opacity:.8"></div><div class="grain"></div>`;
// globe with route
const ortho = geoOrthographic().rotate([20, -25]).scale(300).translate([300, 300]).clipAngle(90);
const interp = geoInterpolate([29, 41], [-43.2, -22.9]);
let rt = ""; for (let i = 0; i <= 60; i++) { const p = ortho(interp(i / 60)); if (p) rt += (rt ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }
const C = `<div class="wood"></div><div class="disc"></div>
<svg width="1080" height="1080" style="position:absolute;inset:0"><defs>${hatch}</defs>${rings(540, 540, 410)}
<g transform="translate(540 540) scale(1.0) translate(-300 -300)">
<path d="${geo.globeSphere}" fill="#e6d3ad" stroke="${INK}" stroke-width="5"/>
<path d="${geo.globeGrat}" fill="none" stroke="${SEPIA}" stroke-width="1.6" opacity=".45" stroke-dasharray="6 5"/>
<path d="${geo.globeLand}" fill="#b89462" fill-opacity=".55" stroke="${INK}" stroke-width="2.4"/>
<path d="${geo.globeLand}" fill="url(#h)"/>
<path d="${rt}" fill="none" stroke="${RED}" stroke-width="9" stroke-dasharray="22 14" stroke-linecap="round"/>
<circle cx="${ortho([29, 41])[0]}" cy="${ortho([29, 41])[1]}" r="11" fill="${RED}" stroke="${INK}" stroke-width="3"/>
<circle cx="${ortho([-43.2, -22.9])[0]}" cy="${ortho([-43.2, -22.9])[1]}" r="11" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>
</g></svg><div class="lamp"></div><div class="grain"></div>`;

import * as topo from "topojson-client";
const wl = JSON.parse(readFileSync("../node_modules/world-atlas/land-50m.json"));
const land = topo.feature(wl, wl.objects.land);
const { geoGraticule10 } = await import("d3-geo");
const o2 = geoOrthographic().rotate([20, -25]).scale(372).translate([540, 540]).clipAngle(90);
const p2 = geoPath(o2);
let rt2 = ""; for (let i = 0; i <= 80; i++) { const p = o2(interp(i / 80)); if (p) rt2 += (rt2 ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }
const disc2 = `.disc{left:40px;top:40px;width:1000px;height:1000px}`;
const FINAL = `<div class="wood"></div><div class="disc"></div>
<svg width="1080" height="1080" style="position:absolute;inset:0"><defs>${hatch}</defs>${rings(540, 540, 465)}
<path d="${p2({type:"Sphere"})}" fill="#e6d3ad" stroke="${INK}" stroke-width="6"/>
<path d="${p2(geoGraticule10())}" fill="none" stroke="${SEPIA}" stroke-width="2" opacity=".45" stroke-dasharray="7 6"/>
<path d="${p2(land)}" fill="#b89462" fill-opacity=".6" stroke="${INK}" stroke-width="3"/>
<path d="${p2(land)}" fill="url(#h)"/>
<path d="${rt2}" fill="none" stroke="${RED}" stroke-width="13" stroke-dasharray="28 16" stroke-linecap="round"/>
<circle cx="${o2([29, 41])[0]}" cy="${o2([29, 41])[1]}" r="15" fill="${RED}" stroke="${INK}" stroke-width="4"/>
<circle cx="${o2([-43.2, -22.9])[0]}" cy="${o2([-43.2, -22.9])[1]}" r="15" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>
</svg><div class="lamp" style="opacity:.7"></div><div class="grain"></div>`;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
for (const [n, body] of Object.entries({ FINAL: FINAL })) {
  const st = n === "FINAL" ? css + disc2 : css;
  writeFileSync(`logo_${n}.html`, `<!doctype html><html><head><meta charset="utf-8"><style>${st}</style></head><body>${body}</body></html>`);
  await page.goto(`file:///home/user/studio/brand/logo_${n}.html`); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  await page.screenshot({ path: `logo_${n}.png` });
}
await browser.close();
