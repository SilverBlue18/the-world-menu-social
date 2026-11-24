// sets/brand.js — The World Menu on-screen graphics for the stickman video (mustard pills, gold numbers, slams).
import { E, ease, prog, clamp, rr, text, measure, alpha, glow, seg, FONTS } from '/engine/core.js';
import { drawFigure } from '/engine/rig2d.js';
import { chili } from './food.js';

export const BR = { mustard: '#F2B134', red: '#C0392B', cream: '#F7EBD3', night: '#0A2E33', sea: '#12474F' };

// mustard place pill ("INDE", "GOA"): pops in at `at` (s into the shot), fades before `out`
export function pill(g, t, str, x, y, o = {}) {
  const { at = 0, out = 99, size = 54, bg = BR.mustard, color = BR.night } = o;
  const k = ease.outBack(prog(t, at, at + 0.35)), a = clamp((out - t) / 0.25) * clamp((t - at) / 0.1); if (a <= 0) return;
  const w = measure(g, str, size, FONTS.ui, 900) + size * 1.1, h = size * 1.55;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(k, k);
  rr(g, -w / 2 + 6, -h / 2 + 8, w, h, h / 2); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.fillStyle = bg; g.fill();
  text(g, str, 0, 2, { size, font: FONTS.ui, weight: 900, color, spacing: 2 }); g.restore();
}
// big glowing number / word ("500 ANS", "6 000 ANS", "1493")
export function bigNum(g, t, str, x, y, o = {}) {
  const { at = 0, out = 99, size = 150, color = BR.mustard, sub = null } = o;
  const k = ease.outBack(prog(t, at, at + 0.4)), a = clamp((out - t) / 0.25) * clamp((t - at) / 0.12); if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(k, k);
  text(g, str, 0, 0, { size, color, glow: 34, glowColor: alpha(color, 0.65), stroke: size * 0.06, strokeColor: 'rgba(0,0,0,.55)', spacing: 2 });
  if (sub) text(g, sub, 0, size * 0.72, { size: size * 0.32, color: BR.cream, font: FONTS.ui, weight: 900, spacing: 4 });
  g.restore();
}
// counting number: counts from `from` to `to` between at and at+dur, French thousands space
export function countNum(g, t, from, to, x, y, o = {}) {
  const { at = 0, dur = 0.8, suffix = '', ...rest } = o; const v = Math.round(from + (to - from) * ease.out(prog(t, at, at + dur)));
  const s = v.toLocaleString('fr-FR').replace(/ | /g, ' ') + suffix; bigNum(g, t, s, x, y, { at, ...rest });
}
// red slam banner with a strike ("MAUVAIS PAYS")
export function slam(g, t, str, x, y, o = {}) {
  const { at = 0, size = 92, rot = -0.06, cross = true } = o; const p = prog(t, at, at + 0.18); if (p <= 0) return;
  const sc = 1 + 0.6 * (1 - ease.out(p)); const w = measure(g, str, size) + 60, h = size * 1.35;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha *= ease.out(p);
  rr(g, -w / 2, -h / 2, w, h, 14); g.fillStyle = BR.red; g.fill();
  text(g, str, 0, 4, { size, color: BR.cream, spacing: 3 });
  if (cross) { const q = ease.out(prog(t, at + 0.25, at + 0.5)); if (q > 0) seg(g, [[-w / 2 - 10, 0], [-w / 2 - 10 + (w + 20) * q, 0]], 12, BR.cream); }
  g.restore();
}
// a chili held in a figure's near hand. fig = the same object passed to drawFigure
export function chiliInHand(g, fig, len = 90, rot = -2.6, o = {}) {
  const p = fig.pose, s = (fig.s ?? 1) * (fig.outfit?.kid ? 0.72 : 1), f = fig.facing ?? 1, h = o.hand === 'B' ? p.hB : p.hF;
  const hx = fig.x + h[0] * s * f, hy = fig.y + h[1] * s;
  chili(g, hx, hy + 6 * s, len * s, f > 0 ? rot : -rot, { glowA: o.glowA ?? 0.12, ...o });
}
