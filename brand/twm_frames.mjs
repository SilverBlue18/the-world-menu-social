// Style frames for The World Menu shorts (1080x1920), Sahel palette. For approval before the Remotion template.
// node brand/twm_frames.mjs -> brand/twm/frames/*.html (render with chromium at 1080x1920)
import { geoMercator, geoPath, geoGraticule10, geoInterpolate } from "d3-geo";
import * as topo from "topojson-client";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(".");
const OUT = `${ROOT}/brand/twm/frames`;
mkdirSync(OUT, { recursive: true });
const F = `file://${ROOT}/public/fonts/`;
const ICON = `file://${ROOT}/brand/twm/v4_badge_tilt22.svg`;
const C = { sea: "#12474F", land: "#E6C79C", coast: "#7A4E2A", red: "#C0392B", night: "#0A2E33", cream: "#F7EBD3", mustard: "#F2B134" };
const W = 1080, H = 1920;
const world = JSON.parse(readFileSync(`${ROOT}/node_modules/world-atlas/land-50m.json`));
const land = topo.feature(world, world.objects.land);

const css = `
@font-face{font-family:PF;src:url(${F}playfair-display-latin-900-normal.woff2)}
@font-face{font-family:OS;src:url(${F}oswald-latin-500-normal.woff2)}
@font-face{font-family:OS7;src:url(${F}oswald-latin-700-normal.woff2)}
@font-face{font-family:IN8;src:url(${F}inter-latin-800-normal.woff2)}
@font-face{font-family:IN6;src:url(${F}inter-latin-600-normal.woff2)}
@font-face{font-family:SE;src:url(${F}special-elite-latin-400-normal.woff2)}
*{margin:0;padding:0;box-sizing:border-box}body{width:${W}px;height:${H}px;overflow:hidden;position:relative;background:${C.sea}}
.abs{position:absolute}`;

function map({ center, scale, focus = [528, 1090], routes = [], pins = [], labels = [] }) {
  const pr = geoMercator().center(center).scale(scale).translate(focus);
  const p = geoPath(pr);
  const line = (a, b) => { const f = geoInterpolate(a, b); return p({ type: "LineString", coordinates: Array.from({ length: 81 }, (_, i) => f(i / 80)) }); };
  return `<svg class="abs" style="inset:0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><filter id="glow"><feGaussianBlur stdDeviation="10"/></filter></defs>
  <rect width="${W}" height="${H}" fill="${C.sea}"/>
  <path d="${p(geoGraticule10())}" fill="none" stroke="${C.cream}" stroke-opacity=".07" stroke-width="2"/>
  <path d="${p(land)}" fill="${C.coast}" opacity=".35" filter="url(#glow)"/>
  <path d="${p(land)}" fill="${C.land}" stroke="${C.coast}" stroke-width="3" stroke-linejoin="round"/>
  ${routes.map(([a, b, drawn = 1]) => `<path d="${line(a, b)}" fill="none" stroke="${C.red}" stroke-width="9" stroke-linecap="round" stroke-dasharray="3 22" pathLength="1000" style="stroke-dashoffset:0" opacity="${drawn}"/>`).join("")}
  ${pins.map(([ll, big]) => { const [x, y] = pr(ll); return `<circle cx="${x}" cy="${y}" r="${big ? 20 : 13}" fill="${C.red}" stroke="${C.cream}" stroke-width="${big ? 7 : 5}"/>`; }).join("")}
  ${labels.map(([ll, t, dx = 26, dy = 10]) => { const [x, y] = pr(ll); return `<text x="${x + dx}" y="${y + dy}" font-family="SE" font-size="40" fill="${C.night}" stroke="${C.land}" stroke-width="8" paint-order="stroke">${t}</text>`; }).join("")}
  </svg>`;
}

// Grade: warm light, vignette, top darkening for captions.
const grade = `
<div class="abs" style="inset:0;background:radial-gradient(ellipse 75% 50% at 50% 57%, rgba(255,214,150,.10), rgba(255,214,150,0) 70%)"></div>
<div class="abs" style="inset:0;background:radial-gradient(ellipse 90% 65% at 50% 57%, rgba(10,46,51,0) 45%, rgba(10,46,51,.72))"></div>
<div class="abs" style="left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(10,46,51,.96) 0%, rgba(10,46,51,.85) 26%, rgba(10,46,51,.55) 36%, rgba(10,46,51,0) 50%)"></div>`;

const watermark = `<div class="abs" style="left:0;right:0;top:46px;display:flex;justify-content:center;align-items:center;gap:16px;opacity:.55">
  <div style="width:54px;height:1.5px;background:linear-gradient(90deg,rgba(247,235,211,0),rgba(247,235,211,.9),rgba(247,235,211,0))"></div>
  <div style="font-family:IN6;font-size:27px;letter-spacing:7px;text-shadow:0 1px 4px rgba(0,0,0,.6)"><span style="color:${C.cream}">theworld</span><span style="color:${C.mustard}">menu</span></div>
  <div style="width:54px;height:1.5px;background:linear-gradient(90deg,rgba(247,235,211,0),rgba(247,235,211,.9),rgba(247,235,211,0))"></div></div>`;

// Top captions: French (active word in mustard) + English below + optional tag line.
function captions(fr, active, en, tag) {
  const frHtml = fr.split(" ").map((w, i) => i === active
    ? `<span style="color:${C.mustard};text-shadow:0 0 18px rgba(242,177,52,.55),0 2px 6px rgba(0,0,0,.7)">${w}</span>`
    : `<span>${w}</span>`).join(" ");
  return `<div class="abs" style="left:-80px;right:-80px;top:170px;height:${tag ? 470 : 400}px;background:radial-gradient(ellipse 60% 55% at 50% 50%, rgba(10,46,51,.82), rgba(10,46,51,.55) 60%, rgba(10,46,51,0) 100%)"></div>
  <div class="abs" style="left:70px;right:70px;top:250px;text-align:center">
    <div style="font-family:IN8;font-size:58px;line-height:1.18;color:${C.cream};text-shadow:0 2px 8px rgba(0,0,0,.75)">${frHtml}</div>
    <div style="font-family:IN6;font-size:36px;line-height:1.3;color:${C.land};opacity:.88;margin-top:20px;text-shadow:0 2px 6px rgba(0,0,0,.7)">${en}</div>
    ${tag ? `<div style="font-family:OS;font-size:30px;letter-spacing:6px;color:${C.mustard};margin-top:26px;text-shadow:0 2px 8px rgba(0,0,0,.9)">${tag}</div>` : ""}
  </div>`;
}

const stamp = (txt, x, y, rot = -8, size = 1) => `<div class="abs" style="left:${x}px;top:${y}px;transform:rotate(${rot}deg) scale(${size});transform-origin:left top;
  border:6px solid ${C.red};border-radius:10px;padding:10px 24px;font-family:OS7;font-size:44px;letter-spacing:6px;color:${C.red};
  background:rgba(247,235,211,.86);box-shadow:0 10px 30px rgba(0,0,0,.35);mix-blend-mode:normal">${txt}</div>`;

const card = ({ x, y, w, h, rot, caption, sub }) => `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);
  background:${C.cream};padding:18px 18px 22px;border-radius:6px;box-shadow:0 26px 60px rgba(0,0,0,.5),0 4px 10px rgba(0,0,0,.3)">
  <div style="height:${h}px;border-radius:3px;background:repeating-linear-gradient(135deg,#d9c6a2 0 18px,#cfbb95 18px 36px);display:flex;align-items:center;justify-content:center;
    font-family:IN6;font-size:28px;color:${C.coast};text-align:center;padding:20px">image d'archive<br>(domaine public)</div>
  <div style="font-family:SE;font-size:34px;color:${C.night};margin-top:14px;text-align:center">${caption}</div>
  ${sub ? `<div style="font-family:OS;font-size:24px;letter-spacing:4px;color:${C.coast};text-align:center;margin-top:4px">${sub}</div>` : ""}</div>`;

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;

const MEX = [-99, 19.4], LIS = [-9.14, 38.72], DKR = [-17.45, 14.69], BRA = [-38.5, -12.97];
const frames = {
  // 1. Opening / thumbnail: wide map, title card, stamp.
  "1_ouverture": page(`
    ${map({ center: [-30, 18], scale: 520, routes: [[MEX, LIS, .35], [BRA, DKR, .35]], pins: [[DKR, true]], labels: [[DKR, "Dakar"]] })}
    ${grade}${watermark}
    <div class="abs" style="left:0;right:0;top:300px;text-align:center">
      <div style="font-family:OS;font-size:40px;letter-spacing:14px;color:${C.mustard}">UNE HISTOIRE VRAIE</div>
      <div style="font-family:PF;font-size:122px;line-height:1.0;color:${C.cream};margin-top:26px;text-shadow:0 6px 24px rgba(0,0,0,.6)">Le piment<br>n'est pas<br><span style="color:${C.mustard}">africain</span></div>
      <div style="font-family:IN6;font-size:38px;color:${C.land};margin-top:30px;opacity:.9">Chili peppers aren't African</div>
    </div>
    ${stamp("DOSSIER #01", 560, 1330, -9)}`),
  // 2. Middle of the story: zoomed route, hero card, captions with active word.
  "2_histoire": page(`
    ${map({ center: [-52, 24], scale: 600, focus: [528, 1150], routes: [[MEX, LIS, 1], [LIS, DKR, .9]], pins: [[MEX, false], [LIS, false], [DKR, true]], labels: [[MEX, "Mexique", 10, 64], [LIS, "Lisbonne", -190, -26], [DKR, "Dakar", -150, 60]] })}
    ${grade}${watermark}
    ${captions("Il a traversé l'Atlantique sur des bateaux portugais.", 3, "It crossed the Atlantic on Portuguese ships.", "AMÉRIQUES → EUROPE → AFRIQUE · XVIe SIÈCLE")}
    <div class="abs" style="inset:0;background:rgba(22,13,5,.0)"></div>
    ${card({ x: 250, y: 1180, w: 400, h: 300, rot: 3, caption: "Piments, Amériques", sub: "GRAVURE · XVIe s." })}`),
  // 3. End card: lockup + follow + next episode hook.
  "3_fin": page(`
    ${map({ center: [-17.45, 14.69], scale: 1500, pins: [[DKR, true]] })}
    <div class="abs" style="inset:0;background:rgba(10,46,51,.82)"></div>${watermark}
    <div class="abs" style="left:0;right:0;top:430px;display:flex;flex-direction:column;align-items:center;gap:28px">
      <img src="${ICON}" style="width:420px;height:420px;border-radius:50%;box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <div style="font-family:OS;font-size:46px;letter-spacing:14px;color:${C.mustard}">THE WORLD</div>
      <div style="font-family:PF;font-size:150px;line-height:.9;color:${C.cream}">Menu</div>
      <div style="font-family:IN6;font-size:40px;color:${C.land}">L'histoire de ce qu'on mange</div>
      <div style="margin-top:50px;font-family:IN8;font-size:50px;color:${C.night};background:${C.mustard};padding:22px 46px;border-radius:60px">Abonne-toi pour le prochain plat</div>
      <div style="font-family:IN6;font-size:34px;color:${C.cream};opacity:.85;margin-top:8px">Demain : d'où vient vraiment l'arachide du mafé ?</div>
    </div>`),
};
for (const [k, html] of Object.entries(frames)) writeFileSync(`${OUT}/${k}.html`, html);
console.log(Object.keys(frames));
