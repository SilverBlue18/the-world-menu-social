// sets/food.js — the hero food of "Le piment": red chili pods, chili plants, baskets, crates, black peppercorns.
// Food keeps its true colours (red pod, green calyx, black pepper) in every style: it is the star of each shot.
import { E, rng, clamp, lerp, alpha, shade, mix, seg, circle, rr, poly, linGrad, radGrad, glow } from '/engine/core.js';

export const CHILI = { pod: '#d8321f', podDark: '#8e1a10', podLight: '#ff7a55', calyx: '#3f8a3a', stem: '#2f6a2c', pepper: '#2a201c', pepperLight: '#6b5a50' };

// one chili pod. (x, y) = stem end, pointing along `rot` (0 = hanging down). len in logical px.
export function chili(g, x, y, len = 110, rot = 0, o = {}) {
  const { color = CHILI.pod, curve = 0.32, fat = 0.24, glowA = 0, a = 1, dark = 0 } = o;
  const L = len, w = L * fat;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot);
  if (glowA > 0) glow(g, 0, L * 0.5, L * 1.1, color, glowA);
  const body = () => {
    g.beginPath(); g.moveTo(-w / 2, L * 0.06);
    g.bezierCurveTo(-w * 0.62, L * 0.45, -w * 0.1, L * 0.86, w * curve * 2.2, L);         // left side down to the tip
    g.bezierCurveTo(w * 0.42, L * 0.8, w * 0.66, L * 0.42, w / 2, L * 0.06);              // right side back up
    g.quadraticCurveTo(0, -L * 0.02, -w / 2, L * 0.06); g.closePath();
  };
  const base = dark ? mix(color, '#000000', dark) : color;
  body(); g.fillStyle = linGrad(g, -w / 2, 0, w / 2, 0, [shade(base, 0.12), base, mix(base, CHILI.podDark, 0.6)]); g.fill();
  g.save(); body(); g.clip();                                                               // glossy highlight streak
  g.strokeStyle = alpha(mix(CHILI.podLight, '#ffffff', 0.35), 0.75 * (1 - dark)); g.lineWidth = w * 0.16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-w * 0.22, L * 0.16); g.bezierCurveTo(-w * 0.3, L * 0.42, -w * 0.12, L * 0.62, w * 0.05, L * 0.74); g.stroke();
  g.restore();
  // calyx (green cap) + stem
  const cal = dark ? mix(CHILI.calyx, '#000000', dark) : CHILI.calyx;
  g.fillStyle = cal; g.beginPath(); g.ellipse(0, L * 0.06, w * 0.6, w * 0.26, 0, 0, Math.PI * 2); g.fill();
  for (const dx of [-0.42, 0, 0.42]) poly(g, [[w * dx - w * 0.14, L * 0.07], [w * dx + w * 0.14, L * 0.07], [w * dx * 1.1, L * 0.16]], cal);
  seg(g, [[0, L * 0.04], [w * 0.1, -L * 0.1], [w * 0.38, -L * 0.17]], Math.max(2, w * 0.18), dark ? mix(CHILI.stem, '#000', dark) : CHILI.stem);
  g.restore();
}

// a heap of chilies (mound), drawn back to front. (x, y) = centre of the base.
export function chiliPile(g, x, y, w, h, o = {}) {
  const { seed = 5, len = 70, count = Math.round((w * h) / (len * len * 0.28)), dark = 0 } = o; const r = rng(seed);
  const items = [];
  for (let i = 0; i < count; i++) { const u = r() * 2 - 1, top = Math.sqrt(Math.max(0, 1 - u * u)); const v = r(); items.push({ px: x + u * w / 2, py: y - v * top * h, rot: r() * Math.PI * 2, L: len * (0.75 + r() * 0.5), d: v }); }
  items.sort((a, b) => a.py - b.py);
  g.fillStyle = mix(CHILI.podDark, '#000', 0.4 + dark * 0.3); g.beginPath(); g.ellipse(x, y, w / 2, h * 0.16, 0, Math.PI, 0); g.fill();
  for (const it of items) chili(g, it.px - Math.sin(it.rot) * it.L * 0.5, it.py - Math.cos(it.rot) * it.L * 0.5, it.L, it.rot, { dark: dark + (1 - it.d) * 0.25, curve: 0.2 + (it.d * 0.3) });
}

// woven basket full of chilies. (x, y) = bottom centre
export function basket(g, x, y, w = 220, h = 110, o = {}) {
  const { color = '#7a5232', fill = true, seed = 7, dark = 0 } = o;
  const c = mix(color, '#000', dark);
  if (fill) chiliPile(g, x, y - h * 0.86, w * 0.92, h * 0.75, { seed, len: Math.max(30, w * 0.24), dark });
  poly(g, [[x - w / 2, y - h], [x + w / 2, y - h], [x + w * 0.38, y], [x - w * 0.38, y]], c);
  g.strokeStyle = alpha(shade(c, -0.45), 0.8); g.lineWidth = 3;
  for (let i = 1; i < 5; i++) { const yy = y - h + (h * i) / 5, k = lerp(0.5, 0.38, i / 5); g.beginPath(); g.moveTo(x - w * k, yy); g.lineTo(x + w * k, yy); g.stroke(); }
  rr(g, x - w / 2 - 6, y - h - 8, w + 12, 16, 8); g.fillStyle = shade(c, 0.12); g.fill();
}

// wooden crate with chilies peeking over the top. (x, y) = bottom centre
export function crate(g, x, y, w = 200, h = 130, o = {}) {
  const { color = '#6a4428', seed = 9, dark = 0, label = null, labelColor = '#f7ebd3' } = o; const c = mix(color, '#000', dark);
  chiliPile(g, x, y - h + 6, w * 0.95, h * 0.5, { seed, len: Math.max(30, w * 0.22), dark });
  g.fillStyle = c; g.fillRect(x - w / 2, y - h, w, h);
  g.strokeStyle = shade(c, -0.4); g.lineWidth = 4; for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(x - w / 2, y - h + (h * i) / 3); g.lineTo(x + w / 2, y - h + (h * i) / 3); g.stroke(); }
  g.fillStyle = shade(c, 0.12); g.fillRect(x - w / 2, y - h, w, 10);
  if (label) { g.save(); g.fillStyle = labelColor; g.font = `700 ${h * 0.2}px Fredoka`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, x, y - h * 0.45); g.restore(); }
}

// chili plant: dark leaves (silhouette) + glowing red pods. (x, y) = ground point
export function chiliPlant(g, x, y, s = 1, o = {}) {
  const { seed = 3, leaf = '#20381f', t = 0, pods = 6, dark = 0, sway = 1 } = o; const r = rng(seed);
  const lc = mix(leaf, '#000', dark), H = 230 * s, sw = Math.sin(t * 1.3 + seed) * 4 * s * sway;
  seg(g, [[x, y], [x + sw * 0.5, y - H * 0.5], [x + sw, y - H]], 7 * s, shade(lc, -0.2));
  const leaves = [];
  for (let i = 0; i < 16; i++) { const k = 0.25 + r() * 0.75, side = r() < 0.5 ? -1 : 1; leaves.push([x + sw * k + side * (20 + r() * 60) * s * k, y - H * k, (40 + r() * 30) * s, side * (0.5 + r() * 0.8)]); }
  for (const [lx, ly, L, a] of leaves) { g.save(); g.translate(lx, ly); g.rotate(a); g.fillStyle = lc; g.beginPath(); g.ellipse(0, 0, L * 0.5, L * 0.2, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
  for (let i = 0; i < pods; i++) { const k = 0.3 + r() * 0.6, side = r() < 0.5 ? -1 : 1, px = x + sw * k + side * (14 + r() * 50) * s, py = y - H * k; chili(g, px, py, (52 + r() * 26) * s, side * (0.1 + r() * 0.35), { dark: dark * 0.6 }); }
}

// black peppercorns — the "old heat" in India
export function peppercorn(g, x, y, rad, o = {}) {
  const { dark = 0 } = o; circle(g, x, y, rad, mix(CHILI.pepper, '#000', dark));
  g.strokeStyle = alpha('#000', 0.45); g.lineWidth = Math.max(1, rad * 0.12); for (const k of [0.35, 0.7]) { g.beginPath(); g.arc(x + rad * 0.1, y, rad * k, 0.4, 2.6); g.stroke(); }
  circle(g, x - rad * 0.35, y - rad * 0.35, rad * 0.25, alpha(CHILI.pepperLight, 0.8 * (1 - dark)));
}
export function pepperPile(g, x, y, w, h, o = {}) {
  const { seed = 4, rad = 12 } = o; const r = rng(seed); const n = Math.round((w * h) / (rad * rad * 2.2)); const pts = [];
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, v = r() * Math.sqrt(Math.max(0, 1 - u * u)); pts.push([x + u * w / 2, y - v * h, rad * (0.8 + r() * 0.4)]); }
  pts.sort((a, b) => a[1] - b[1]).forEach(([px, py, pr]) => peppercorn(g, px, py, pr));
}

// string of chilies hanging (market / kitchen decoration). from (x, y) downward
export function chiliString(g, x, y, n = 10, len = 60, o = {}) {
  const { t = 0, seed = 2, dark = 0 } = o; const r = rng(seed); seg(g, [[x, y - 30], [x, y + n * len * 0.42]], 2, '#3a2a1a');
  for (let i = 0; i < n; i++) { const yy = y + i * len * 0.42, side = i % 2 ? 1 : -1; chili(g, x, yy, len * (0.85 + r() * 0.3), side * (0.35 + r() * 0.25) + Math.sin(t * 1.2 + i) * 0.04, { dark }); }
}
