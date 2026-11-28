// sets/map.js — detailed brand map (real Natural Earth 1:50m coastlines + borders), Mercator, camera {lon, lat, zoom}.
// Look: deep teal sea with shallow-water glow along the coasts, sand land with a soft drop shadow, thin borders,
// highlighted countries, Oswald labels, glowing red route with a little ship carrying the chili.
import { E, clamp, lerp, alpha, mix, circle, ring, seg, text, glow, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { COUNTRIES } from './_geo.js';
import { chili } from './food.js';
import { ship2D } from './places2.js';

const SEA = ['#0d424a', '#0A2E33'], LAND = ['#ecd3ab', '#dcbb8c'], TERRE = '#7A4E2A', CREAM = '#F7EBD3';
const D2R = Math.PI / 180, merc = (lat) => Math.log(Math.tan(Math.PI / 4 + clamp(lat, -80, 80) * D2R / 2)) / D2R;
for (const c of COUNTRIES) c.bb = c.r.map(r => { let a = 1e9, b = -1e9, d = 1e9, e = -1e9; for (const [x, y] of r) { a = Math.min(a, x); b = Math.max(b, x); d = Math.min(d, y); e = Math.max(e, y); } return [a, b, d, e]; });

export function makeProj(view) {
  const k = view.zoom * E.W / 60, y0 = merc(view.lat), cy = E.H * (view.cy ?? 0.45);
  const P = (lon, lat) => [E.W / 2 + (lon - view.lon) * k, cy - (merc(lat) - y0) * k];
  const halfW = E.W / 2 / k + 2, lonMin = view.lon - halfW, lonMax = view.lon + halfW;
  P.k = k; P.visible = (bb) => bb[1] >= lonMin && bb[0] <= lonMax; return P;
}
function landPath(P, filter) {
  const p = new Path2D();
  for (const c of COUNTRIES) { if (filter && !filter(c)) continue; c.r.forEach((r, i) => { if (!P.visible(c.bb[i])) return; r.forEach(([lo, la], j) => { const [x, y] = P(lo, la); j ? p.lineTo(x, y) : p.moveTo(x, y); }); p.closePath(); }); }
  return p;
}

// draws the whole map for this frame; returns the projection
export function drawMap(g, t, view, o = {}) {
  const P = makeProj(view), { highlight = {}, labels = [], seaLabels = [] } = o;
  g.fillStyle = (() => { const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, SEA[0]); gr.addColorStop(1, SEA[1]); return gr; })(); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  glow(g, E.W / 2, E.H * 0.42, E.W * 0.9, '#1f6a72', 0.25);
  // graticule
  g.strokeStyle = alpha(CREAM, 0.06); g.lineWidth = 1.2;
  for (let lo = -180; lo <= 180; lo += 10) { const [x] = P(lo, 0); if (x < -50 || x > E.W + 50) continue; g.beginPath(); g.moveTo(x, -E.H); g.lineTo(x, E.H * 2); g.stroke(); }
  for (let la = -70; la <= 70; la += 10) { const [, y] = P(0, la); if (y < -50 || y > E.H + 50) continue; g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
  const land = landPath(P);
  // shallow water glow along the coasts
  g.save(); g.lineJoin = 'round'; for (const [w, a] of [[46, 0.05], [28, 0.07], [14, 0.1]]) { g.strokeStyle = alpha('#5fb4b0', a); g.lineWidth = w; g.stroke(land); } g.restore();
  // drop shadow + land
  g.save(); g.translate(5, 9); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill(land); g.restore();
  const lg = g.createLinearGradient(0, 0, E.W * 0.4, E.H); lg.addColorStop(0, LAND[0]); lg.addColorStop(1, LAND[1]); g.fillStyle = lg; g.fill(land);
  // highlighted countries
  for (const [name, h] of Object.entries(highlight)) { if (h.a <= 0) continue; const p = landPath(P, c => c.n === name); g.save(); g.globalAlpha = h.a; g.fillStyle = h.color; g.fill(p); g.lineWidth = 4; g.strokeStyle = mix(h.color, '#000', 0.35); g.stroke(p); g.restore(); }
  // inner light along the north-west edges (relief feel)
  g.save(); g.clip(land); g.translate(-4, -6); g.strokeStyle = alpha('#fff6e2', 0.45); g.lineWidth = 4; g.stroke(land); g.restore();
  // borders + coastline
  g.save(); g.lineJoin = 'round'; g.strokeStyle = alpha(TERRE, 0.45); g.lineWidth = 1.6; g.setLineDash([6, 5]); g.stroke(land); g.setLineDash([]); g.strokeStyle = alpha(mix(TERRE, '#000', 0.2), 0.9); g.lineWidth = 2.6; g.stroke(land); g.restore();
  for (const s of seaLabels) { const [x, y] = P(s.lon, s.lat); text(g, s.str, x, y, { size: s.size || 34, font: 'Oswald', weight: 500, color: alpha(CREAM, s.a ?? 0.55), spacing: 10, italic: false }); }
  for (const l of labels) { const [x, y] = P(l.lon, l.lat); text(g, l.str, x, y, { size: l.size || 40, font: 'Oswald', weight: 700, color: l.color || mix(TERRE, '#000', 0.25), spacing: 4, alpha: l.a ?? 1 }); }
  return P;
}

// smooth route through lon/lat waypoints (Catmull-Rom), drawn to fraction p; returns {head, ang}
export function routeOn(g, P, pts, p, o = {}) {
  const xy = pts.map(([a, b]) => P(a, b)), S = [];
  for (let i = 0; i < xy.length - 1; i++) { const p0 = xy[Math.max(0, i - 1)], p1 = xy[i], p2 = xy[i + 1], p3 = xy[Math.min(xy.length - 1, i + 2)];
    for (let k = 0; k < 12; k++) { const u = k / 12, u2 = u * u, u3 = u2 * u; S.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3), 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]); } }
  S.push(xy[xy.length - 1]);
  const L = [0]; for (let i = 1; i < S.length; i++) L.push(L[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
  const target = L[L.length - 1] * clamp(p); let n = 1; while (n < S.length - 1 && L[n] < target) n++;
  const k = L[n] > L[n - 1] ? (target - L[n - 1]) / (L[n] - L[n - 1]) : 0, head = [lerp(S[n - 1][0], S[n][0], k), lerp(S[n - 1][1], S[n][1], k)], ang = Math.atan2(S[n][1] - S[n - 1][1], S[n][0] - S[n - 1][0]);
  const draw = (w, col, dash) => { g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.lineWidth = w; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(...S[0]); for (let i = 1; i < n; i++) g.lineTo(...S[i]); g.lineTo(...head); g.stroke(); g.restore(); };
  draw(18, 'rgba(192,57,43,.25)'); draw(7, '#C0392B', [18, 14]); draw(2.5, alpha('#ffd0b0', 0.8), [18, 14]);
  return { head, ang };
}
// the chili's little ship at the head of the route
export function routeShip(g, t, head, ang, s = 0.16) {
  const f = Math.cos(ang) >= 0 ? 1 : -1; glow(g, head[0], head[1], 120, '#F2B134', 0.35);
  ship2D(g, head[0], head[1] + 6, s, { color: '#1a1412', sail: '#F7EBD3', t, cross: true, facing: f });
  chili(g, head[0] + 10, head[1] - 150 * s * 6.2, 64, -2.7 + Math.sin(t * 3) * 0.1, { glowA: 0.4 });
}
export function mapPin(g, t, P, lon, lat, label, o = {}) {
  const { at = 0, side = 1, size = 46 } = o; const k = clamp((t - at) / 0.3); if (k <= 0) return; const [x, y] = P(lon, lat);
  FX.rings(g, x, y, t, { count: 2, r0: 12, r1: 70, color: '#F2B134', a: 0.7 * k, w: 3 });
  g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#C0392B'; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-26, -34, -26, -62, 0, -62); g.bezierCurveTo(26, -62, 26, -34, 0, 0); g.fill(); circle(g, 0, -42, 9, CREAM); g.restore();
  if (label) text(g, label, x + side * 34, y - 40, { size, font: 'Oswald', weight: 700, align: side > 0 ? 'left' : 'right', color: CREAM, alpha: k, stroke: 8, strokeColor: 'rgba(10,46,51,.85)', spacing: 3 });
}
