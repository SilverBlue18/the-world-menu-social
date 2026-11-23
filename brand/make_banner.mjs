import { createRequire } from "module"; const { chromium } = createRequire(import.meta.url)("playwright");
import { readFileSync, writeFileSync } from "fs";
import { geoMercator, geoPath, geoGraticule10, geoInterpolate } from "d3-geo";
import * as topo from "topojson-client";
const wl = JSON.parse(readFileSync("../node_modules/world-atlas/land-50m.json"));
const land = topo.feature(wl, wl.objects.land);
const F = "file:///home/user/studio/public/fonts/", T = "file:///home/user/studio/public/";
const INK = "#2a1c11", SEPIA = "#6b4a2b", RED = "#9e2a1f", GOLD = "#e9b45a";
// banner 2560x1440; parchment sheet spans full width x 760 tall, centred
const merc = geoMercator().center([-5, 22]).scale(1150).translate([1280, 720]);
const p = geoPath(merc);
const I = geoInterpolate([29, 41], [-43.2, -22.9]);
let rt = ""; for (let i = 0; i <= 120; i++) { const q = merc(I(i / 120)); rt += (rt ? "L" : "M") + q[0].toFixed(1) + "," + q[1].toFixed(1); }
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:PF;src:url(${F}playfair-display-latin-900-normal.woff2)}
@font-face{font-family:SE;src:url(${F}special-elite-latin-400-normal.woff2)}
@font-face{font-family:OS;src:url(${F}oswald-latin-500-normal.woff2)}
*{margin:0;padding:0}body{width:2560px;height:1440px;overflow:hidden;position:relative;background:#120b05}
.wood{position:absolute;inset:0;background:url(${T}mock/wood.jpg) center/2600px auto}
.sheet{position:absolute;left:-60px;right:-60px;top:330px;height:780px;background:url(${T}imam/tex/parchment.jpg) center/2800px;box-shadow:0 40px 90px rgba(0,0,0,.75),inset 0 0 200px rgba(90,55,20,.55),inset 0 0 16px rgba(70,40,10,.7);transform:rotate(-0.6deg);overflow:hidden}
.lamp{position:absolute;inset:0;background:radial-gradient(ellipse 60% 55% at 50% 50%,rgba(255,196,120,.22),rgba(0,0,0,0) 70%),radial-gradient(ellipse 80% 75% at 50% 50%,rgba(0,0,0,0) 50%,rgba(10,4,0,.75) 100%)}
.grain{position:absolute;inset:0;background:url(${T}imam/tex/grain0.png);opacity:.10;mix-blend-mode:overlay}
.title{position:absolute;left:0;right:0;top:560px;text-align:center}
.t1{font-family:PF;font-size:150px;color:${INK};letter-spacing:6px;line-height:1}
.t2{font-family:SE;font-size:46px;color:${SEPIA};margin-top:26px}
.tag{font-family:OS;font-size:34px;letter-spacing:16px;color:${RED};margin-bottom:22px}
.plate{display:inline-block;padding:34px 80px 38px;background:rgba(239,229,207,.82);box-shadow:0 0 60px 30px rgba(239,229,207,.75)}
</style></head><body><div class="wood"></div><div class="sheet"><svg width="2680" height="780" style="position:absolute;left:0;top:0">
<defs><pattern id="h" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="12" stroke="${SEPIA}" stroke-width="2" opacity=".35"/></pattern></defs>
<g transform="translate(60 -330)">
<path d="${p(geoGraticule10())}" fill="none" stroke="${SEPIA}" stroke-width="2" opacity=".35" stroke-dasharray="10 8"/>
<path d="${p(land)}" fill="#b89462" fill-opacity=".38" stroke="${INK}" stroke-width="3.5" opacity=".9"/>
<path d="${p(land)}" fill="url(#h)"/>
<path d="${rt}" fill="none" stroke="${RED}" stroke-width="10" stroke-dasharray="30 20" stroke-linecap="round" opacity=".85"/>
<circle cx="${merc([29,41])[0]}" cy="${merc([29,41])[1]}" r="13" fill="${RED}" stroke="${INK}" stroke-width="4"/>
<circle cx="${merc([-43.2,-22.9])[0]}" cy="${merc([-43.2,-22.9])[1]}" r="13" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>
</g></svg></div>
<div class="title"><div class="plate"><div class="tag">FORGOTTEN HISTORY</div><div class="t1">THE DESK ATLAS</div><div class="t2">True stories, followed across the map</div></div></div>
<div class="lamp"></div><div class="grain"></div></body></html>`;
writeFileSync("banner.html", html);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" });
const pg = await b.newPage({ viewport: { width: 2560, height: 1440 } });
await pg.goto("file:///home/user/studio/brand/banner.html"); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(500);
await pg.screenshot({ path: "TheDeskAtlas_youtube_banner_2560x1440.png" }); await b.close();
