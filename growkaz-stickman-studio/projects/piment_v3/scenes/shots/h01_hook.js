// shots/h01_hook.js — STYLE V3 TEST (0–10.2 s of "Le piment"): ONE continuous camera, no cuts.
// India market wide → push into TOI's face ("500 ANS" stamp) → pull back ("INDE" stamp) → the hero chili leaps from
// his hand and flies west, leaving the mustard TRAIL (series motif), over the ocean → lands in the farmer's hand in
// Mexico ("MEXIQUE" stamp). Every event is keyed to a spoken word (EV below) and the camera is Gaussian-smoothed.
import { E, registerShot, ease, prog, key, clamp, lerp, glow, alpha, mix, shade, text, rr, seg, backdrop, linGrad, layer, blurLayer, mood, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { indiaMarket, mexField, GROUND } from '../sets/places.js';
import { ship2D } from '../sets/places2.js';
import { chili, chiliPlant } from '../sets/food.js';
import { BR } from '../sets/brand.js';
import { TOI, CUISINIERE, PAYSAN } from '../cast.js';

// ---- one event list: every timed thing hangs on a spoken word (projects/piment/captions.json) ----
export const EV = {
  titleOut: 2.45, hook: 0.9,
  decouvert: 3.24, cinq: 4.14, ans: 4.66,
  cePays: 5.645, inde: 6.58,
  et: 7.46, piment: 7.84, launch: 8.05, vient: 8.62, mexique: 8.94, land: 9.0,
};
const FOCUS_Y = 0.2;                    // all stamps + title sit at the same spot: y = 0.2·H (safe zone)
const L0 = 200;                         // hero chili length in the world (px at zoom 1)

// ---------- smoothed camera (key frames → Gaussian average: no dead stops, no jumps) ----------
const CAM_KEYS = [                      // [t, [x, y, zoom]]
  [0.0, [0, -50, 1.04]],
  [2.55, [0, -60, 1.12]],
  [3.35, [12, -205, 2.25]],             // push into TOI's face on "découvert"
  [5.35, [12, -215, 2.4]],
  [6.15, [0, -50, 1.06]],                // pull back on "Ce pays, c'est l'Inde"
  [7.5, [-10, -60, 1.1]],
  [8.05, [-30, -65, 1.12]],
];
const rawCam = (t) => key(t, CAM_KEYS, ease.inOut);
function camAt(t, sigma = 0.16) {
  let x = 0, y = 0, lz = 0, w = 0;
  for (let k = -10; k <= 10; k++) { const dt = (k / 10) * 2.5 * sigma, ww = Math.exp(-0.5 * (dt / sigma) ** 2), c = rawCam(t + dt); x += c[0] * ww; y += c[1] * ww; lz += Math.log(c[2]) * ww; w += ww; }
  return { x: x / w, y: y / w, z: Math.exp(lz / w) };
}
// world → screen for depth-1 layers (characters)
const toScreen = (cam, wx, wy) => [(wx - E.W / 2 - cam.x) * cam.z + E.W / 2, (wy - E.H / 2 - cam.y) * cam.z + E.H / 2];

// ---------- the whip pan between places (pixels of travel), drives parallax + blur ----------
const PAN = 2700, PAN_A = EV.launch - 0.05, PAN_B = EV.land + 0.05;
const panAt = (t) => PAN * ease.inOut(prog(t, PAN_A, PAN_B));
const panSpeed = (t) => (panAt(t + 1 / 60) - panAt(t - 1 / 60)) * 30;      // px/s

// ---------- cast in the market ----------
const GY = () => GROUND();
const showChili = { ...POSES.talk, eF: [30, -156], hF: [46, -196] };
const raiseChili = { ...POSES.cheer, eB: [-7, -136], hB: [-9, -100], eF: [24, -214], hF: [34, -258] };
const afterThrow = { ...POSES.point, eF: [-30, -196], hF: [-62, -224] };
function toiAt(t) {
  const pose = breathe(posesAt(t, [[0, showChili], [EV.et, raiseChili], [EV.launch + 0.02, afterThrow]], 0.3), t, 1, 1);
  const expr = t < EV.decouvert - 0.15 ? (t < 0.5 ? 'smile' : 'happy') : t < EV.cePays ? (t < EV.decouvert + 0.25 ? 'surprised' : 'shocked') : t < EV.launch ? 'happy' : 'surprised';
  return { x: 540, y: GY() + 10, s: 3.1, facing: 1, outfit: TOI, pose, expr, rim: { color: '#ffe4b0', dir: [0.4, -1], w: 5 }, blink: (t % 3.3) > 3.2 && t < EV.decouvert };
}
function cookAt(t) {
  const wave = { ...POSES.cheer, eB: [-7, -136], hB: [-9, -100], eF: [22, -206], hF: [30 + Math.sin(t * 9) * 10, -246] };
  const pose = breathe(posesAt(t, [[0, POSES.crossArms], [EV.inde - 0.1, wave], [EV.launch + 0.2, afterThrow]], 0.3), t, 1, 4);
  return { x: 860, y: GY() + 40, s: 2.7, facing: -1, outfit: CUISINIERE, pose, expr: t > EV.inde - 0.1 ? 'happy' : 'smile', rim: { color: '#ffe4b0', dir: [-0.5, -1], w: 5 }, blink: (t % 3.9) > 3.8 };
}
const handWorld = (fig) => { const h = fig.pose.hF, f = fig.facing ?? 1; return [fig.x + h[0] * fig.s * f, fig.y + (h[1] + 6) * fig.s]; };

// ---------- Mexico: the farmer catches the chili ----------
const catchUp = { ...POSES.reach, eF: [32, -176], hF: [62, -200] };
const proud = { ...POSES.talk, eF: [30, -160], hF: [52, -196] };
function farmerAt(t) {
  const pose = breathe(posesAt(t, [[0, POSES.relaxed], [EV.vient, catchUp], [EV.land + 0.08, proud]], 0.25), t, 1, 7);
  return { x: 450, y: GY() + 30, s: 3.0, facing: 1, outfit: PAYSAN, pose, expr: t < EV.land ? 'surprised' : 'happy', rim: { color: '#ffe4b0', dir: [0.6, -1], w: 5 }, blink: (t % 3.6) > 3.5 };
}
const MEX_CAM = { x: 0, y: -25, z: 1.06 };
const mexCam = (t) => ({ x: MEX_CAM.x + (PAN - panAt(t)), y: MEX_CAM.y - 20 * ease.out(prog(t, EV.land, 10.2)), z: MEX_CAM.z + 0.04 * ease.inOut(prog(t, EV.land, 10.2)) });

// ---------- the hero chili: in TOI's hand → flight → in the farmer's hand ----------
const ROT_HAND = -2.6;
function chiliScreen(t) {
  if (t <= EV.launch) {                                   // in TOI's hand (wiggles on "piment ?")
    const cam = camAt(t), [hx, hy] = toScreen(cam, ...handWorld(toiAt(t))), wig = Math.sin(t * 38) * 0.12 * clamp(1 - Math.abs(t - EV.piment - 0.1) / 0.2);
    return { x: hx, y: hy, rot: ROT_HAND + wig, len: L0 * cam.z };
  }
  const cA = camAt(EV.launch), [ax, ay] = toScreen(cA, ...handWorld(toiAt(EV.launch)));
  const mc = mexCam(EV.land), [bx, by] = toScreen(mc, ...handWorld(farmerAt(EV.land)));
  if (t >= EV.land) { const c = mexCam(t), [hx, hy] = toScreen(c, ...handWorld(farmerAt(t))); return { x: hx, y: hy, rot: ROT_HAND, len: L0 * c.z }; }
  const u = prog(t, EV.launch, EV.land), e = ease.inOut(u);
  const apex = [520, 520];                                // the chili rises to the middle of the frame, big
  const x = (1 - e) ** 2 * ax + 2 * (1 - e) * e * apex[0] + e * e * bx, y = (1 - e) ** 2 * ay + 2 * (1 - e) * e * apex[1] + e * e * by;
  return { x, y, rot: ROT_HAND + Math.PI * 4 * ease.inOut(u), len: lerp(L0 * cA.z, L0 * mc.z, e) * (1 + 0.75 * Math.sin(Math.PI * u)) };
}

// ---------- sets ----------
function marketScene(g, t, cam) {
  indiaMarket(g, t, cam);
  layer(g, cam, 1, (g) => { FX.pool(g, 540, GY() + 14, 300, 50, '#ffd08a', 0.35); drawFigure(g, cookAt(t)); drawFigure(g, toiAt(t)); });
}
function oceanScene(g, t, cam) {
  const M = mood('golden'), gy = GY();
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, 540, gy - 520, 64, '#fff3dc', M.key, 5); FX.clouds(g, { y: gy - 1150, h: 300, color: '#ffe7c7', a: 0.16, seed: 9 }); });
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, gy - 200, 0, gy + 900, ['#5a9a92', '#2a6a6a', '#12474F']); g.fillRect(-E.W, gy - 200, E.W * 3, E.H * 2);
    for (let k = 0; k < 14; k++) { const yy = gy - 190 + k * k * 7; g.strokeStyle = alpha('#ffe2b0', 0.18 - k * 0.01); g.lineWidth = 2 + k * 0.3; g.beginPath(); for (let x = -E.W; x <= E.W * 2; x += 30) g.lineTo(x, yy + Math.sin(x * 0.02 + t * 3 + k) * (2 + k)); g.stroke(); }
    FX.pool(g, 540, gy - 180, 500, 40, M.key, 0.3);
    ship2D(g, 820, gy - 170, 0.22, { t, facing: -1, color: '#1a1412' });
  });
}
function mexicoScene(g, t, cam) {
  mexField(g, t, cam, { sunX: 160 });
  layer(g, cam, 1, (g) => { FX.pool(g, 470, GY() + 30, 320, 50, '#ffd08a', 0.3); chiliPlant(g, 760, GY() + 40, 1.9, { seed: 5, t, leaf: '#3a5a34', pods: 6 }); drawFigure(g, farmerAt(t)); });
  layer(g, cam, 1.35, (g) => chiliPlant(g, 1010, GY() + 330, 2.6, { seed: 11, t, leaf: '#2c4a2a', pods: 4, dark: 0.35 }));
}

// ---------- the trail: where the chili has been, pinned to the world (streams behind it) ----------
function trail(g, t) {
  if (t < EV.launch) return;
  const fade = 1 - prog(t, EV.land + 0.4, EV.land + 1.1); if (fade <= 0) return;
  const pts = []; for (let k = 0; k <= 40; k++) { const tt = Math.max(EV.launch, t - k * 0.03); const c = chiliScreen(tt); pts.push([c.x + (panAt(t) - panAt(tt)), c.y]); if (tt === EV.launch) break; }
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const path = () => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); };
  g.globalAlpha *= fade; g.globalCompositeOperation = 'lighter';
  path(); g.strokeStyle = alpha(BR.mustard, 0.22); g.lineWidth = 46; g.stroke();
  g.globalCompositeOperation = 'source-over';
  path(); g.strokeStyle = BR.mustard; g.lineWidth = 12; g.setLineDash([30, 22]); g.lineDashOffset = -t * 220; g.stroke();
  g.restore();
}

// ---------- the stamp: the series motif for places and dates (always same spot, same look) ----------
function stamp(g, t, str, at, out, o = {}) {
  const { sub = null, color = BR.mustard, size = 96, rot = -0.07, y = E.H * FOCUS_Y } = o;
  const p = prog(t, at, at + 0.2), a = clamp((t - at) / 0.06) * clamp((out - t) / 0.25); if (a <= 0) return;
  const sc = 1 + 0.9 * (1 - ease.out(p)) + 0.06 * Math.sin(clamp((t - at - 0.2) / 0.3) * Math.PI);
  g.save(); g.translate(E.W / 2, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha *= a;
  g.font = `700 ${size}px "${FONTS.title}"`; if ('letterSpacing' in g) g.letterSpacing = '6px';
  const w = g.measureText(str).width + 110, h = size * (sub ? 1.95 : 1.5);
  rr(g, -w / 2 + 8, -h / 2 + 10, w, h, 22); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
  rr(g, -w / 2, -h / 2, w, h, 22); g.fillStyle = 'rgba(10,46,51,.92)'; g.fill();
  rr(g, -w / 2, -h / 2, w, h, 22); g.strokeStyle = color; g.lineWidth = 7; g.stroke();
  rr(g, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 14); g.strokeStyle = alpha(color, 0.55); g.lineWidth = 2.5; g.stroke();
  text(g, str, 0, sub ? -size * 0.2 : 4, { size, color, spacing: 6, glow: 18, glowColor: alpha(color, 0.5) });
  if (sub) text(g, sub, 0, size * 0.58, { size: size * 0.34, font: FONTS.ui, weight: 800, color: BR.cream, spacing: 5 });
  g.restore();
  if (p < 1) for (let i = 0; i < 10; i++) { const an = (i / 10) * Math.PI * 2, d = 140 + 260 * ease.out(p); FX.sparkle(g, E.W / 2 + Math.cos(an) * d * 1.4, y + Math.sin(an) * d * 0.5, 16 * (1 - p), BR.mustard, 0.9 * (1 - p)); }
}

registerShot('h01', { draw(g, t, info) {
  const v = Math.abs(panSpeed(t)), blur = clamp(v / 260, 0, 16);
  const P = panAt(t) / PAN;                                       // 0 market … 1 Mexico
  const wM = 1 - prog(P, 0.22, 0.4), wO = prog(P, 0.22, 0.4) * (1 - prog(P, 0.6, 0.78)), wX = prog(P, 0.6, 0.78);
  const cam = camAt(t);
  if (wM > 0) blurLayer(g, blur, (gg) => marketScene(gg, t, { ...cam, x: cam.x - panAt(t) }));
  if (wO > 0) { g.save(); g.globalAlpha = wO; blurLayer(g, blur * 0.45, (gg) => oceanScene(gg, t, { x: PAN * 0.5 - panAt(t), y: -40, z: 1.05 })); g.restore(); }
  if (wX > 0) { g.save(); g.globalAlpha = wX; blurLayer(g, blur, (gg) => mexicoScene(gg, t, mexCam(t))); g.restore(); }

  if (v > 300) FX.speedLines(g, t, { cx: 540, cy: 620, count: 70, color: '#fff1d6', a: clamp(v / 4000, 0, 0.5), inner: 330 });
  trail(g, t);
  const c = chiliScreen(t), flying = t > EV.launch && t < EV.land;
  const glowA = 0.12 + 0.4 * ease.out(prog(t, EV.et, EV.piment)) * (1 - prog(t, EV.land, EV.land + 0.8)) + (flying ? 0.2 : 0);
  if (t >= EV.land) { const imp = 1 - prog(t, EV.land, EV.land + 0.5); if (imp > 0) FX.rings(g, c.x, c.y, (t - EV.land) * 1.6, { count: 2, r0: 30, r1: 220, color: BR.mustard, a: imp, w: 5 }); }
  chili(g, c.x, c.y, c.len, c.rot, { glowA });

  // title (clean cover frame) + stamps, all at the same spot
  const ta = ease.out(prog(t, 0.1, 0.5)) * (1 - prog(t, EV.titleOut, EV.titleOut + 0.3));
  if (ta > 0) {
    text(g, 'LE PIMENT', 540, E.H * 0.16, { size: 80, color: BR.cream, spacing: 12, glow: 20, glowColor: 'rgba(0,0,0,.6)', alpha: ta });
    g.save(); g.globalAlpha *= ta; stamp(g, t, 'PAS INDIEN ?!', EV.hook, 99, { y: E.H * 0.235, size: 104, sub: 'NOT INDIAN?!', color: BR.mustard }); g.restore();
  }
  const n = Math.round(500 * ease.out(prog(t, EV.cinq, EV.ans)));
  stamp(g, t, `${n} ANS`, EV.cinq - 0.05, EV.cePays - 0.1, { sub: 'IL Y A · YEARS AGO' });
  stamp(g, t, 'INDE', EV.inde, EV.launch + 0.15, { sub: 'INDIA', rot: 0.05 });
  stamp(g, t, 'MEXIQUE', EV.mexique, 10.4, { sub: 'MEXICO', rot: -0.05 });
  FX.dust(g, t, { count: 45, color: '#ffe2bd', a: 0.35 });
} });
