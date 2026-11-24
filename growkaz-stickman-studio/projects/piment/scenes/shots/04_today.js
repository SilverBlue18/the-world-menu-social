// shots/04_today.js — act 4: India today (1st producer, consumer, exporter), the burning mouth, thank Mexico, end (s024–s029).
import { E, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, text, rr, seg, circle, poly, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { kitchen, mexField, fieldForeground } from '../sets/places.js';
import { goaHarbour, indiaFields } from '../sets/places2.js';
import { chili, chiliPile } from '../sets/food.js';
import { BR, pill, bigNum, chiliInHand } from '../sets/brand.js';
import { TOI, COLOMB, MARIN, CUISINIERE, PAYSAN, CAST } from '../cast.js';

const INK = { top: 'none' };
const holdUp = { ...POSES.cheer, eB: [-7, -136], hB: [-9, -100], eF: [26, -200], hF: [40, -242] };
function first(g, t, word, at, y = E.H * 0.15) { bigNum(g, t, '1er', E.W / 2, y, { at, size: 140 }); pill(g, t, word, E.W / 2, y + 130, { at: at + 0.15, size: 56 }); }

// s024 — today's Indian fields: red carpets of drying chilies, workers raking. "1er PRODUCTEUR"
registerShot('s024', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.08 * ease.inOut(t / info.dur), y: -30 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = indiaFields(g, t, cam);
  const rake = { ...POSES.reach, eF: [34, -150], hF: [62 + Math.sin(t * 3) * 14, -110] };
  layer(g, cam, 1, (g) => { const w = { x: CX + 300, y: GY - 40, s: 1.5, facing: -1, outfit: INK, pose: breathe(rake, t, 1, 2), expr: 'smile', rim: { color: M.rim, dir: [-0.4, -1], w: 4 } }; drawFigure(g, w);
    seg(g, [[w.x - 62 * 1.5 - Math.sin(t * 3) * 21, w.y - 110 * 1.5], [w.x - 190 - Math.sin(t * 3) * 21, w.y + 10]], 6, '#6a4a2a'); });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
  first(g, t, 'PRODUCTEUR', 1.6);
} });

// s025 — TOI at a family table in India, plates of red curry. "1er CONSOMMATEUR"
registerShot('s025', { draw(g, t, info) {
  const cam = { z: 1.12, x: 30 + 30 * t / info.dur, y: 80 };
  const { GY, CX, M } = kitchen(g, t, cam);
  const rim = { color: M.rim, dir: [0.3, -1], w: 5 }, top = GY - 150;
  const eat = (ph) => ({ ...POSES.sit, eF: [24, -130], hF: [40 + Math.sin(t * 6 + ph) * 6, -150 - Math.abs(Math.sin(t * 3 + ph)) * 30] });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: CX - 260, y: GY + 40, s: 1.8, facing: 1, outfit: TOI, pose: eat(0), expr: 'happy', rim, shadow: false });
    drawFigure(g, { x: CX + 260, y: GY + 40, s: 1.8, facing: -1, outfit: CUISINIERE, pose: eat(2), expr: 'smile', rim, shadow: false, blink: (t % 3) > 2.9 });
    drawFigure(g, { x: CX + 40, y: GY + 40, s: 1.8, facing: -1, outfit: { top: 'none', kid: true }, pose: eat(4), expr: 'joy', rim, shadow: false });
    rr(g, CX - 330, top + 60, 660, 26, 10); g.fillStyle = '#3a2418'; g.fill(); g.fillRect(CX - 300, top + 80, 20, 110); g.fillRect(CX + 280, top + 80, 20, 110);
    for (const dx of [-170, 0, 170]) { g.fillStyle = '#d8d0c0'; g.beginPath(); g.ellipse(CX + dx, top + 58, 70, 16, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#b8321e'; g.beginPath(); g.ellipse(CX + dx, top + 54, 50, 10, 0, 0, Math.PI * 2); g.fill(); chili(g, CX + dx + 20, top + 44, 34, -1.3); }
  });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
  first(g, t, 'CONSOMMATEUR', 0.2);
} });

// s026 — port today: sacks of chilies swung onto a cargo ship. "1er EXPORTATEUR", then the three titles stack
registerShot('s026', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.04 * ease.inOut(t / info.dur), x: -60 };
  const { GY, CX, M } = goaHarbour(g, t, cam, { today: true });
  layer(g, cam, 0.3, (g) => { const sw = Math.sin(t * 1.4) * 30, hx = 560 + sw, hy = GROUNDY() - 420 - 160;
    for (let i = 0; i < 6; i++) { rr(g, hx - 90 + (i % 3) * 60, hy + Math.floor(i / 3) * 56, 58, 54, 14); g.fillStyle = i % 2 ? '#b8321e' : '#a02a18'; g.fill(); } });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 2 + (i % 2); j++) { rr(g, CX - 380 + i * 120, GY - 30 - j * 64, 112, 62, 18); g.fillStyle = (i + j) % 2 ? '#b8321e' : '#9a2616'; g.fill(); chili(g, CX - 330 + i * 120, GY - 74 - j * 64, 30, 1.2); } });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.25 });
  if (t < 2.0) first(g, t, 'EXPORTATEUR', 0.19);
  else { const a = ease.out(prog(t, 2.0, 2.4)); bigNum(g, t, '1er ×3', E.W / 2, E.H * 0.12, { at: 2.0, size: 130 });
    ['PRODUCTEUR', 'CONSOMMATEUR', 'EXPORTATEUR'].forEach((w, i) => pill(g, t, w, E.W / 2, E.H * 0.2 + i * 100, { at: 2.1 + i * 0.12, size: 48 })); }
} });
const GROUNDY = () => E.H * 0.68;

// s027 — giant face: TOI bites a chili, eyes watering, steam, red glow
registerShot('s027', { draw(g, t, info) {
  const M = mood('interiorWarm');
  blurLayer(g, 14, (g) => kitchen(g, t, { z: 1.5, x: -120, y: -200 })); veil(g, '#0a1a1c', 0.35);
  const hot = ease.out(prog(t, 1.9, 2.6)), [sx, sy] = [Math.sin(t * 40) * 6 * hot, Math.cos(t * 37) * 6 * hot];
  if (hot > 0) glow(g, E.W / 2, E.H * 0.5, 900, '#ff3a1a', 0.35 * hot);
  const r = 330 * (1 + 0.04 * t), cx = E.W / 2 + sx, cy = E.H * 0.48 + sy;
  bigFace(g, cx, cy, r, { outfit: TOI, expr: hot > 0.3 ? 'cry' : 'happy', rimColor: hot > 0 ? '#ff7a3a' : M.rim, rimSide: -1, blink: (t % 2.6) > 2.5 });
  if (t < 2.0) chili(g, cx + r * 0.2, cy + r * 0.42, 300, -1.75, { glowA: 0.25 }); else chili(g, cx + r * 0.45, cy + r * 0.42, 220, -1.75, { glowA: 0.4 });
  if (hot > 0) { for (const side of [-1, 1]) for (let i = 0; i < 4; i++) { const k = (t * 0.9 + i / 4) % 1; circle(g, cx + side * (r * 1.05 + k * 60), cy - r * 0.2 - k * 360, 30 + k * 50, alpha('#fff4ea', 0.35 * (1 - k) * hot)); }
    for (let i = 0; i < 3; i++) { const k = (t * 1.5 + i / 3) % 1; circle(g, cx - r * 0.28 + (i % 2) * r * 0.56, cy + r * 0.05 + k * r * 0.9, 14, alpha('#9fd8ff', 0.8 * (1 - k))); } }
} });

// s028 — Mexican field at sunset: TOI raises a chili toward the farmer, who waves. "MERCI, MEXIQUE"
registerShot('s028', { draw(g, t, info) {
  const cam = { z: 1.06 + 0.04 * ease.inOut(t / info.dur), x: -10 };
  const { GY, CX, M } = mexField(g, t, cam, { mood: 'dusk' });
  const rim = { color: M.rim, dir: [0.3, -1], w: 5 };
  const toi = { x: CX - 220, y: GY + 50, s: 2.0, facing: 1, outfit: TOI, pose: breathe(posesAt(t, [[0, POSES.relaxed], [0.3, holdUp]]), t), expr: 'joy', rim };
  const pay = { x: CX + 230, y: GY + 50, s: 2.0, facing: -1, outfit: PAYSAN, pose: breathe(posesAt(t, [[0, POSES.relaxed], [0.5, { ...POSES.wave, hF: [36 + Math.sin(t * 9) * 10, -236] }]]), t, 1, 3), expr: 'happy', rim };
  layer(g, cam, 1, (g) => { drawFigure(g, pay); drawFigure(g, toi); chiliInHand(g, toi, 110, -2.75, { glowA: 0.35 }); });
  fieldForeground(g, t, cam, { mood: 'dusk', plants: [] });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
  bigNum(g, t, 'MERCI,', E.W / 2, E.H * 0.12, { at: 0.12, size: 120 });
  bigNum(g, t, 'MEXIQUE', E.W / 2, E.H * 0.2, { at: 0.7, size: 140 });
} });

// s029 — end: the whole cast lined up in the field, each with a chili (logo + "Abonne-toi" are added on top in Remotion)
registerShot('s029', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.04 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = mexField(g, t, cam, { mood: 'dusk', sunH: 380 });
  veil(g, '#0A2E33', 0.25);
  const n = CAST.length, gap = 200;
  layer(g, cam, 1, (g) => CAST.forEach((of, i) => { const k = ease.out(prog(t, 0.2 + i * 0.1, 0.7 + i * 0.1)); const f = { x: CX + (i - (n - 1) / 2) * gap, y: GY + 60 + (1 - k) * 40, s: 1.45, facing: i < n / 2 ? 1 : -1, outfit: of, pose: breathe(holdUp, t, 1, i), expr: 'smile', alpha: k, rim: { color: M.rim, dir: [0, -1], w: 4 } }; drawFigure(g, f); if (k > 0.5) chiliInHand(g, f, 90, -2.75); }));
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
} });
