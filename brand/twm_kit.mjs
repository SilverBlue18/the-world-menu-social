// The World Menu brand kit: profile pictures, lockups, YouTube banner, Facebook cover.
// Run after brand/twm_logo.mjs:  node brand/twm_kit.mjs  -> brand/twm/kit/*.html, then render with chromium (see render list printed).
import { geoMercator, geoPath, geoGraticule10, geoInterpolate } from "d3-geo";
import * as topo from "topojson-client";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(".");
const KIT = `${ROOT}/brand/twm/kit`;
mkdirSync(KIT, { recursive: true });
const F = `file://${ROOT}/public/fonts/`;
const ICON = `file://${ROOT}/brand/twm/v4_badge_tilt22.svg`;
const C = { sea: "#12474F", land: "#E6C79C", coast: "#7A4E2A", red: "#C0392B", night: "#0A2E33", cream: "#F7EBD3", mustard: "#F2B134" };
const TAGLINE = "L'histoire de ce qu'on mange";

const css = `
@font-face{font-family:PF;src:url(${F}playfair-display-latin-900-normal.woff2)}
@font-face{font-family:PF7;src:url(${F}playfair-display-latin-700-normal.woff2)}
@font-face{font-family:OS;src:url(${F}oswald-latin-500-normal.woff2)}
@font-face{font-family:IN6;src:url(${F}inter-latin-600-normal.woff2)}
*{margin:0;padding:0;box-sizing:border-box}html,body{overflow:hidden}`;

// Lockup block: icon + name + tagline. Font sizes are set so the block width stays inside its box.
const lockup = ({ icon = 300, name = 96, tag = 30, ink = C.cream, accent = C.mustard, tagInk = C.land, dir = "row" }) => `
<div class="lock" style="display:flex;flex-direction:${dir};align-items:center;gap:${dir === "row" ? icon * 0.12 : icon * 0.08}px;${dir === "row" ? "" : "text-align:center"}">
  <img src="${ICON}" style="width:${icon}px;height:${icon}px;border-radius:50%;box-shadow:0 ${icon * 0.04}px ${icon * 0.12}px rgba(0,0,0,.35)">
  <div style="display:flex;flex-direction:column;align-items:${dir === "row" ? "flex-start" : "center"};gap:${name * 0.12}px">
    <div style="font-family:OS;font-size:${name * 0.34}px;letter-spacing:${name * 0.09}px;color:${accent};line-height:1">THE WORLD</div>
    <div style="font-family:PF;font-size:${name}px;line-height:.9;color:${ink};letter-spacing:${name * 0.01}px">Menu</div>
    <div style="font-family:IN6;font-size:${tag}px;color:${tagInk};letter-spacing:${tag * 0.04}px;margin-top:${name * 0.08}px">${TAGLINE}</div>
  </div>
</div>`;

const page = (w, h, bg, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}
body{width:${w}px;height:${h}px;background:${bg};position:relative}</style></head><body>${body}</body></html>`;

// World map background (Mercator, Sahel palette) with routes converging on Dakar.
function mapSVG(w, h, { center = [5, 18], scale, dakarAt } = {}) {
  const world = JSON.parse(readFileSync(`${ROOT}/node_modules/world-atlas/land-50m.json`));
  const land = topo.feature(world, world.objects.land);
  const pr = geoMercator().center(center).scale(scale).translate(dakarAt ?? [w / 2, h / 2]);
  const p = geoPath(pr);
  const DAKAR = [-17.45, 14.69];
  const pairs = [[[-99, 19.4], [-9.1, 38.7]], [[-9.1, 38.7], [-17.45, 14.69]], [[39, 9], [44, 15]], [[44, 15], [12.3, 45.4]], [[78, 20], [-0.1, 51.5]], [[105, 14], [-60, -8]], [[-60, -8], [8, 6]], [[118, 32], [139.7, 35.7]]];
  const from = pairs.map((p) => p[0]);
  const routes = pairs.map(([a, b]) => {
    const f = geoInterpolate(a, b);
    return p({ type: "LineString", coordinates: Array.from({ length: 81 }, (_, i) => f(i / 80)) });
  });
  const d = null;
  const starts = [...new Set(pairs.flat().map((x) => x.join()))].map((k) => pr(k.split(",").map(Number)));
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;inset:0">
  <rect width="${w}" height="${h}" fill="${C.sea}"/>
  <path d="${p(geoGraticule10())}" fill="none" stroke="${C.cream}" stroke-opacity=".07" stroke-width="2"/>
  <path d="${p(land)}" fill="${C.land}" stroke="${C.coast}" stroke-width="2.2" stroke-linejoin="round"/>
  ${routes.map((r) => `<path d="${r}" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 14" opacity=".9"/>`).join("")}
  ${starts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="${C.red}" stroke="${C.cream}" stroke-width="4"/>`).join("")}

  </svg>`;
}
const shade = (x = "50%", y = "50%", rx = 34, ry = 30) => `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 85% 80% at 50% 50%, rgba(10,46,51,0) 55%, rgba(10,46,51,.55))"></div>
<div style="position:absolute;inset:0;background:radial-gradient(ellipse ${rx}% ${ry}% at ${x} ${y}, rgba(10,46,51,.88), rgba(10,46,51,.55) 55%, rgba(10,46,51,0) 100%)"></div>`;

const pages = {};

// Profile pictures (icon only, round-safe).
for (const s of [1080, 800, 400]) pages[`TheWorldMenu_profile_${s}`] = [s, s, page(s, s, C.sea, `<img src="${ICON}" style="width:${s}px;height:${s}px">`)];

// Lockups.
pages.TheWorldMenu_lockup_horizontal_dark = [1800, 600, page(1800, 600, C.night, `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${lockup({ icon: 380, name: 170, tag: 40 })}</div>`)];
pages.TheWorldMenu_lockup_horizontal_light = [1800, 600, page(1800, 600, C.cream, `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${lockup({ icon: 380, name: 170, tag: 40, ink: C.sea, accent: C.red, tagInk: C.coast })}</div>`)];
pages.TheWorldMenu_lockup_stacked_dark = [1200, 1200, page(1200, 1200, C.night, `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${lockup({ icon: 460, name: 150, tag: 38, dir: "column" })}</div>`)];

// YouTube banner 2560x1440. Safe area (all devices) = 1546x423 centred.
pages.TheWorldMenu_youtube_banner_2560x1440 = [2560, 1440, page(2560, 1440, C.sea, `
  ${mapSVG(2560, 1440, { center: [20, 22], scale: 520, dakarAt: [1280, 760] })}
  ${shade("50%", "50%", 30, 32)}
  <div style="position:absolute;left:${(2560 - 1546) / 2}px;top:${(1440 - 423) / 2}px;width:1546px;height:423px;display:flex;align-items:center;justify-content:center">
    ${lockup({ icon: 360, name: 150, tag: 36 })}
  </div>`)];

// Facebook cover 1640x624 (keep content in the central ~1200x450 for mobile crops).
pages.TheWorldMenu_facebook_cover_1640x624 = [1640, 624, page(1640, 624, C.sea, `
  ${mapSVG(1640, 624, { center: [20, 22], scale: 300, dakarAt: [820, 330] })}
  ${shade("50%", "50%", 38, 62)}
  <div style="position:absolute;left:220px;top:87px;width:1200px;height:450px;display:flex;align-items:center;justify-content:center">
    ${lockup({ icon: 300, name: 124, tag: 30 })}
  </div>`)];

// Small watermark icon for videos (transparent background).
pages.TheWorldMenu_watermark_icon_256 = [256, 256, page(256, 256, "transparent", `<img src="${ICON}" style="width:256px;height:256px;opacity:.9">`)];

for (const [k, [w, h, html]] of Object.entries(pages)) writeFileSync(`${KIT}/${k}.html`, html);
writeFileSync(`${KIT}/render_list.txt`, Object.entries(pages).map(([k, [w, h]]) => `${k} ${w} ${h}`).join("\n"));
console.log(Object.keys(pages).length, "pages");
