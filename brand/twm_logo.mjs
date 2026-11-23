// The World Menu logo builder: "fork + Earth" family, Sahel palette.
// node brand/twm_logo.mjs  -> brand/twm/*.svg (+ html for chromium screenshots)
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate } from "d3-geo";
import * as topo from "topojson-client";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(".");
const OUT = `${ROOT}/brand/twm`;
mkdirSync(OUT, { recursive: true });
const FONTS = `file://${ROOT}/public/fonts/`;

export const C = {
  sea: "#12474F", seaDeep: "#0C353B", land: "#E6C79C", coast: "#7A4E2A",
  red: "#C0392B", night: "#0A2E33", cream: "#F7EBD3", mustard: "#F2B134",
};

const world = JSON.parse(readFileSync(`${ROOT}/node_modules/world-atlas/land-50m.json`));
const land = topo.feature(world, world.objects.land);
const DAKAR = [-17.45, 14.69];
const ORIGINS = { americas: [-60, -5], asia: [100, 15] };

// Globe centred on West Africa so Senegal sits near the middle.
function globe(cx, cy, r, rot = [12, -8]) {
  const pr = geoOrthographic().rotate(rot).scale(r).translate([cx, cy]).clipAngle(90).precision(0.2);
  const p = geoPath(pr);
  const routePts = (a, b, n = 60) => {
    const f = geoInterpolate(a, b);
    return Array.from({ length: n + 1 }, (_, i) => f(i / n));
  };
  const route = p({ type: "LineString", coordinates: routePts(ORIGINS.americas, DAKAR) });
  return { sphere: p({ type: "Sphere" }), land: p(land), grat: p(geoGraticule10()), route, dakar: pr(DAKAR) };
}

// A clean fork pointing up. (x, y) = centre of the crown base (where tines meet). s = scale.
function fork(x, y, s = 1, handle = 300) {
  const tw = 19 * s, gap = 14 * s, n = 4, W = n * tw + (n - 1) * gap, tl = 210 * s;
  let tines = "";
  for (let i = 0; i < n; i++) {
    const tx = x - W / 2 + i * (tw + gap);
    tines += `<path d="M${tx} ${y + 4 * s} L${tx} ${y - tl + tw} Q${tx} ${y - tl} ${tx + tw / 2} ${y - tl - 6 * s} Q${tx + tw} ${y - tl} ${tx + tw} ${y - tl + tw} L${tx + tw} ${y + 4 * s} Z"/>`;
  }
  const h = W / 2, L = handle * s;
  const crown = `<path d="M${x - h} ${y} L${x + h} ${y} C${x + h} ${y + 48 * s} ${x + 24 * s} ${y + 62 * s} ${x + 14 * s} ${y + 92 * s}
    L${x + 12 * s} ${y + 130 * s} C${x + 27 * s} ${y + 130 * s + L * 0.3} ${x + 28 * s} ${y + 130 * s + L * 0.75} ${x + 22 * s} ${y + 130 * s + L}
    Q${x} ${y + 150 * s + L} ${x - 22 * s} ${y + 130 * s + L} C${x - 28 * s} ${y + 130 * s + L * 0.75} ${x - 27 * s} ${y + 130 * s + L * 0.3} ${x - 12 * s} ${y + 130 * s}
    L${x - 14 * s} ${y + 92 * s} C${x - 24 * s} ${y + 62 * s} ${x - h} ${y + 48 * s} ${x - h} ${y} Z"/>`;
  return tines + crown;
}

const defs = (id) => `
  <radialGradient id="${id}shade" cx="38%" cy="32%" r="75%">
    <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
  <filter id="${id}sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>`;

function globeLayer(g, id, { sea = C.sea, landFill = C.land, coast = C.coast, grat = true, route = true } = {}) {
  return `
  <path d="${g.sphere}" fill="${sea}"/>
  ${grat ? `<path d="${g.grat}" fill="none" stroke="${C.cream}" stroke-opacity=".10" stroke-width="1.5"/>` : ""}
  <path d="${g.land}" fill="${landFill}" stroke="${coast}" stroke-width="1.4" stroke-linejoin="round"/>
  ${route ? `<path d="${g.route}" fill="none" stroke="${C.red}" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 13"/>
  <circle cx="${g.dakar[0]}" cy="${g.dakar[1]}" r="11" fill="${C.red}" stroke="${C.cream}" stroke-width="4"/>` : ""}
  <path d="${g.sphere}" fill="url(#${id}shade)"/>
  <path d="${g.sphere}" fill="none" stroke="${C.night}" stroke-opacity=".55" stroke-width="3"/>`;
}

const S = 1080, CX = 540;
const wrap = (body, bg, id) => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
<defs>${defs(id)}</defs><rect width="${S}" height="${S}" fill="${bg}"/>${body}</svg>`;

const V = {};

// 1. Classic: Earth impaled on a cream fork, teal background.
{
  const g = globe(CX, 360, 215);
  V.v1_classic = wrap(`
  <g fill="${C.cream}">${fork(CX, 660, 1.0, 230)}</g>
  <ellipse cx="${CX}" cy="585" rx="120" ry="18" fill="#000" opacity=".35" filter="url(#v1sh)"/>
  ${globeLayer(g, "v1")}`, C.night, "v1");
}

// 2. Tilted with a bite out of the Earth, sand background.
{
  const g = globe(0, -120, 210);
  V.v2_bite = wrap(`
  <defs><mask id="bite"><rect x="-400" y="-400" width="800" height="800" fill="#fff"/>
    <circle cx="172" cy="-262" r="56" fill="#000"/><circle cx="214" cy="-188" r="50" fill="#000"/><circle cx="118" cy="-316" r="46" fill="#000"/></mask></defs>
  <g transform="translate(575 545) rotate(-22)">
    <g fill="${C.coast}">${fork(0, 180, 1.0, 220)}</g>
    <g mask="url(#bite)">${globeLayer(g, "v2")}</g>
  </g>`, C.land, "v2");
}

// 3. Twirl: the route wraps the Earth like spaghetti on a fork.
{
  const g = globe(CX, 360, 215);
  let twirl = "";
  for (let i = 0; i < 3; i++) {
    const y = 470 + i * 36, rx = 232 - i * 22;
    twirl += `<path d="M${CX - rx} ${y - 30} Q${CX} ${y + 46} ${CX + rx} ${y - 30}" fill="none" stroke="${C.mustard}" stroke-width="15" stroke-linecap="round"/>`;
  }
  V.v3_twirl = wrap(`
  <g fill="${C.cream}">${fork(CX, 660, 1.0, 230)}</g>
  ${globeLayer(g, "v3", { route: true })}
  ${twirl}`, C.sea, "v3");
}

// 4. Badge: sand medallion with a fine teal ring and compass ticks.
{
  const g = globe(CX, 385, 180);
  let ticks = "";
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, big = i % 12 === 0;
    const r1 = 420, r2 = big ? 392 : 406;
    ticks += `<line x1="${CX + r1 * Math.sin(a)}" y1="${540 - r1 * Math.cos(a)}" x2="${CX + r2 * Math.sin(a)}" y2="${540 - r2 * Math.cos(a)}" stroke="${C.sea}" stroke-width="${big ? 6 : 3}" stroke-linecap="round"/>`;
  }
  V.v4_badge = wrap(`
  <circle cx="${CX}" cy="540" r="470" fill="${C.land}"/>
  <circle cx="${CX}" cy="540" r="440" fill="none" stroke="${C.sea}" stroke-width="10"/>
  ${ticks}
  <g fill="${C.sea}">${fork(CX, 640, 0.86, 200)}</g>
  ${globeLayer(g, "v4")}`, C.sea, "v4");
}

// 4b. Badge, tilted like "Bite" (several angles to compare).
for (const ang of [-14, -22, -30]) {
  const g = globe(0, -120, 180);
  let ticks = "";
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, big = i % 12 === 0;
    const r1 = 420, r2 = big ? 392 : 406;
    ticks += `<line x1="${CX + r1 * Math.sin(a)}" y1="${540 - r1 * Math.cos(a)}" x2="${CX + r2 * Math.sin(a)}" y2="${540 - r2 * Math.cos(a)}" stroke="${C.sea}" stroke-width="${big ? 6 : 3}" stroke-linecap="round"/>`;
  }
  V[`v4_badge_tilt${-ang}`] = wrap(`
  <circle cx="${CX}" cy="540" r="470" fill="${C.land}"/>
  <circle cx="${CX}" cy="540" r="440" fill="none" stroke="${C.sea}" stroke-width="10"/>
  ${ticks}
  <g transform="translate(${CX} 495) rotate(${ang})">
    <g fill="${C.sea}">${fork(0, 150, 0.86, 150)}</g>
    ${globeLayer(g, "v4t" + -ang)}
  </g>`, C.sea, "v4t" + -ang);
}

// 5. Negative space: the fork is cut out of the Earth.
{
  const g = globe(CX, 540, 330);
  V.v5_cutout = wrap(`
  <defs><mask id="cut"><rect width="${S}" height="${S}" fill="#fff"/><g fill="#000">${fork(CX, 470, 0.95, 150)}</g></mask></defs>
  <g mask="url(#cut)">${globeLayer(g, "v5", { route: false })}</g>`, C.land, "v5");
}

// 6. Bold flat icon: mustard background, flat teal Earth, no shading. Best at tiny sizes.
{
  const g = globe(CX, 360, 215);
  V.v6_flat = wrap(`
  <g fill="${C.sea}">${fork(CX, 660, 1.0, 230)}</g>
  <path d="${g.sphere}" fill="${C.sea}"/>
  <path d="${g.land}" fill="${C.cream}"/>
  <circle cx="${g.dakar[0]}" cy="${g.dakar[1]}" r="13" fill="${C.red}"/>`, C.mustard, "v6");
}

for (const [k, svg] of Object.entries(V)) writeFileSync(`${OUT}/${k}.svg`, svg);

// Contact sheet: each icon as a square and as a round profile preview, plus a tiny 64px preview.
const keys = process.env.ONLY ? Object.keys(V).filter(k => k.startsWith(process.env.ONLY)) : Object.keys(V);
const cards = keys.map((k, i) => `
  <div class="card"><div class="n">${k.replace(/^v\d_/, "").replace(/_/g, " ")}</div>
    <div class="row"><img class="sq" src="${k}.svg"><img class="rd" src="${k}.svg"><img class="tiny" src="${k}.svg"></div></div>`).join("");
writeFileSync(`${OUT}/sheet.html`, `<!doctype html><html><head><style>
@font-face{font-family:IN;src:url(${FONTS}inter-latin-600-normal.woff2)}
body{margin:0;background:#ece7dd;font-family:IN;width:1800px;padding:30px;box-sizing:border-box}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:26px}
.card{background:#fff;border-radius:18px;padding:22px}.n{font-size:28px;color:#0A2E33;margin-bottom:14px;text-transform:capitalize}
.row{display:flex;align-items:center;gap:26px}.sq{width:300px;height:300px;border-radius:10px}
.rd{width:240px;height:240px;border-radius:50%}.tiny{width:64px;height:64px;border-radius:50%}
</style></head><body><div class="grid">${cards}</div></body></html>`);
console.log("wrote", Object.keys(V).length, "logos");
