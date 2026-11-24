// shots/03_spread.js — act 3: Portuguese ships carry the chili to Goa; before it, black pepper; south → north; Pernambuco (s015–s023).
import { E, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, text, rr, seg, circle, poly, linGrad, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { kitchen, mexField } from '../sets/places.js';
import { beach, goaHarbour, ship2D, worldMap, route, pin, ROUTE, P } from '../sets/places2.js';
import { chili, crate, basket, peppercorn, pepperPile, chiliPlant } from '../sets/food.js';
import { BR, pill, bigNum, chiliInHand } from '../sets/brand.js';
import { MARIN, CUISINIERE } from '../cast.js';

const INK = { top: 'none' };
const carry = { ...POSES.holdFront, eF: [24, -160], hF: [40, -200], eB: [18, -162], hB: [34, -202] };

// s015 — Lisbon quay, golden: the sailor carries a crate of chilies toward the carrack
registerShot('s015', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.05 * ease.inOut(t / info.dur), x: -50 + 60 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = goaHarbour(g, t, cam, { mood: 'golden', palms: false });
  const x = lerp(CX - 380, CX + 120, ease.inOut(prog(t, 0.2, 3.6))), ph = t * Math.PI * 2 * 0.9;
  const walking = t > 0.2 && t < 3.6;
  const wp = walking ? walkPose(ph) : POSES.stand;
  const marin = { x, y: GY + 50, s: 2.0, facing: 1, outfit: MARIN, pose: { ...wp, eF: carry.eF, hF: carry.hF, eB: carry.eB, hB: carry.hB, head: [wp.head[0], wp.head[1]] }, expr: 'determined', rim: { color: M.rim, dir: [0.5, -1], w: 5 }, blink: (t % 3.3) > 3.2 };
  layer(g, cam, 1, (g) => {
    for (const [sx, f] of [[CX + 360, -1], [CX - 520, 1]]) drawFigure(g, { x: sx, y: GY + 30, s: 1.7, facing: f, outfit: INK, pose: breathe(POSES.crossArms, t, 1, sx), expr: 'neutral', rim: { color: M.rim, dir: [0.5, -1] } });
    drawFigure(g, marin); crate(g, x + 80, GY + 50 - 200 * 2.0 + 120, 150, 95, { seed: 81 });
  });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
} });

// s016 — map: the route draws from Lisbon down the coast of Africa, a chili riding its head
registerShot('s016', { draw(g, t, info) {
  const z = 1.08 - 0.05 * t; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2 - 60);
  worldMap(g, t); pin(g, t, -9.1, 38.7, 'LISBONNE', { at: 0, labelSide: -1 });
  const { head, ang } = route(g, ROUTE, 0.62 * ease.inOut(prog(t, 0.05, info.dur)));
  chili(g, head[0], head[1], 80, ang - Math.PI / 2, { glowA: 0.35 });
  text(g, 'AFRIQUE', ...P(18, 6), { size: 50, color: BR.cream, alpha: 0.75, spacing: 6 });
  g.restore();
} });

// s017 — Goa harbour at dusk: the sailor hands a basket of chilies to the cook
registerShot('s017', { draw(g, t, info) {
  const cam = { z: 1.06 + 0.06 * ease.inOut(t / info.dur), x: 20 };
  const { GY, CX, M } = goaHarbour(g, t, cam, { mood: 'dusk' });
  const k = ease.inOut(prog(t, 0.6, 1.6)), rim = { color: M.rim, dir: [0.6, -1], w: 5 };
  const give = { ...POSES.holdFront, eF: [30, -150], hF: [62, -160], eB: [24, -150], hB: [56, -162] };
  const marin = { x: CX - 230, y: GY + 50, s: 2.0, facing: 1, outfit: MARIN, pose: breathe(posesAt(t, [[0, POSES.relaxed], [0.5, give], [1.8, POSES.relaxed]]), t), expr: 'smile', rim };
  const cook = { x: CX + 210, y: GY + 50, s: 2.0, facing: -1, outfit: CUISINIERE, pose: breathe(posesAt(t, [[0, POSES.relaxed], [0.9, give]]), t, 1, 2), expr: t > 1.5 ? 'happy' : 'surprised', rim };
  layer(g, cam, 1, (g) => { drawFigure(g, marin); drawFigure(g, cook); basket(g, lerp(CX - 100, CX + 90, k), GY + 50 - 320, 170, 80, { seed: 91 }); });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
  pill(g, t, 'GOA · INDE', CX, E.H * 0.14, { at: 0.55 });
  bigNum(g, t, 'XVIe SIÈCLE', CX, E.H * 0.23, { at: 2.3, size: 104 });
} });

// s018 — before the chili: a dim old kitchen, the cook grinds on a stone
registerShot('s018', { draw(g, t, info) {
  const cam = { z: 1.1 + 0.05 * ease.inOut(t / info.dur), x: -120, y: 40 };
  const { GY, CX, M } = kitchen(g, t, cam, { old: true });
  const grind = { ...POSES.kneel, eF: [40, -96], hF: [70 + Math.sin(t * 6) * 18, -60], eB: [30, -98], hB: [60 + Math.sin(t * 6) * 18, -62] };
  const fan = { ...POSES.kneel, eF: [36, -130], hF: [40 + Math.sin(t * 14) * 8, -160] };
  const cook = { x: CX - 120, y: GY + 60, s: 2.1, facing: 1, outfit: CUISINIERE, pose: posesAt(t, [[0, grind], [1.9, fan]]), expr: t > 2.0 ? 'surprised' : 'neutral', rim: { color: M.rim, dir: [1, -0.4], w: 5 }, blink: (t % 3.3) > 3.2 };
  layer(g, cam, 1, (g) => { rr(g, CX + 10, GY + 10, 220, 50, 10); g.fillStyle = '#5a5048'; g.fill(); pepperPile(g, CX + 120, GY + 14, 120, 30, { seed: 5, rad: 9 }); drawFigure(g, cook); });
  veil(g, '#0a1a1c', 0.15);
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(200,180,150,.25)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
} });

// s019 — macro: black peppercorns pour into a brass bowl. "AVANT : POIVRE NOIR"
registerShot('s019', { draw(g, t, info) {
  blurLayer(g, 16, (g) => kitchen(g, t, { z: 1.6, x: 200, y: -100 }, { old: true })); veil(g, '#0a1a1c', 0.45);
  const cx = E.W / 2, by = E.H * 0.58, z = 1 + 0.05 * t;
  g.save(); g.translate(cx, by); g.scale(z, z); g.translate(-cx, -by);
  for (let i = 0; i < 26; i++) { const ph = (t * 1.6 + i / 26) % 1, x = cx - 40 + Math.sin(i * 7.1) * 50, y = by - 900 + ph * 820; if (t < info.dur - 0.3) peppercorn(g, x, y, 16 + (i % 3) * 3); }
  const fill = ease.out(prog(t, 0, info.dur));
  g.fillStyle = linGrad(g, cx - 360, 0, cx + 360, 0, ['#8a5a1a', '#e0b050', '#9a6a22']); g.beginPath(); g.ellipse(cx, by, 360, 90, 0, 0, Math.PI); g.lineTo(cx - 360, by); g.fill();
  g.beginPath(); g.moveTo(cx - 360, by); g.quadraticCurveTo(cx, by + 330, cx + 360, by); g.fill();
  pepperPile(g, cx, by + 10, 640, 70 + fill * 120, { seed: 8, rad: 22 });
  g.restore();
  pill(g, t, 'AVANT : POIVRE NOIR', cx, E.H * 0.16, { at: 0.95, size: 52 });
} });

// s020 — map zoom on India: the chili lands in the SOUTH
registerShot('s020', { draw(g, t, info) {
  const z = lerp(2.2, 2.8, ease.inOut(t / info.dur)), [fx, fy] = P(78, 20);
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(z, z); g.translate(-fx, -fy);
  worldMap(g, t, { highlightIndia: ease.out(prog(t, 0, 0.6)) });
  const [sx, sy] = P(76.5, 10.5);
  for (let i = 0; i < 6; i++) { const k = ease.outBack(prog(t, 1.9 + i * 0.07, 2.3 + i * 0.07)); if (k > 0) chiliPlant(g, sx - 40 + (i % 3) * 30, sy + 10 + Math.floor(i / 3) * 22, 0.1 * k, { seed: i, t, leaf: '#3a6a34', pods: 3 }); }
  g.restore();
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(z, z); g.translate(-fx, -fy); pinScaled(g, t, sx, sy, z); g.restore();
  pill(g, t, 'SUD', E.W / 2, E.H * 0.14, { at: 1.95 });
} });
function pinScaled(g, t, x, y, z) { const k = clamp((t - 1.9) / 0.3); if (k <= 0) return; FX.rings(g, x, y, t, { count: 2, r0: 4, r1: 26, color: BR.mustard, a: 0.6 * k, w: 1 }); circle(g, x, y, 6 * k, BR.red); }

// s021 — two centuries: a farmer walks north with a basket while sun and moon sweep the sky
registerShot('s021', { draw(g, t, info) {
  const p = t / info.dur, cam = { z: 1.04, x: lerp(-40, 40, p) };
  const sunA = Math.PI * (1 - ((t * 0.9) % 1));
  const { GY, CX, M } = mexField(g, t, cam, { cactus: false, sunX: Math.cos(sunA) * 520, sunH: 300 + Math.sin(sunA) * 700 });
  const x = lerp(CX - 380, CX + 300, p), wp = walkPose(t * Math.PI * 2 * 0.9);
  const fig = { x, y: GY + 50, s: 2.0, facing: 1, outfit: INK, pose: { ...wp, eF: [20, -196], hF: [16, -236], eB: [-14, -196], hB: [-10, -236] }, expr: 'determined', rim: { color: M.rim, dir: [0.4, -1], w: 5 } };
  layer(g, cam, 1, (g) => { drawFigure(g, fig); basket(g, x + 6, GY + 50 - 236 * 2.0, 150, 60, { seed: 101 }); });
  countUp(g, t, CX);
  pill(g, t, 'NORD ➜', E.W * 0.74, E.H * 0.25, { at: 2.45 });
} });
function countUp(g, t, CX) { const v = Math.round(ease.out(prog(t, 1.0, 1.9)) * 2); bigNum(g, t, `${v} SIÈCLES`, CX, E.H * 0.14, { at: 1.0, size: 120 }); }

// s022 — Goa market: the crate's painted sign "POIVRE DE PERNAMBOUC"
registerShot('s022', { draw(g, t, info) {
  const cam = { z: 1.14 + 0.05 * ease.inOut(t / info.dur), x: 120, y: 40 };
  const { GY, CX, M } = goaHarbour(g, t, cam, { mood: 'dusk' });
  const rim = { color: M.rim, dir: [0.6, -1], w: 5 };
  const cook = { x: CX + 230, y: GY + 40, s: 2.0, facing: -1, outfit: CUISINIERE, pose: breathe(posesAt(t, [[0, POSES.relaxed], [1.8, POSES.point]]), t), expr: 'happy', rim, blink: (t % 3.0) > 2.9 };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: CX - 330, y: GY + 40, s: 1.9, facing: 1, outfit: INK, pose: breathe(POSES.think, t, 1, 5), expr: 'thinking', rim });
    crate(g, CX - 20, GY + 50, 300, 170, { seed: 111 }); drawFigure(g, cook);
    const k = ease.outBack(prog(t, 1.85, 2.3)); if (k > 0) { g.save(); g.translate(CX - 20, GY - 290); g.scale(k, k); g.rotate(-0.04);
      seg(g, [[0, 60], [0, 200]], 10, '#4a3020'); rr(g, -250, -70, 500, 140, 10); g.fillStyle = '#efe2c4'; g.fill();
      text(g, '« POIVRE DE', 0, -24, { size: 46, font: FONTS.serif, weight: 900, italic: true, color: BR.red }); text(g, 'PERNAMBOUC »', 0, 32, { size: 46, font: FONTS.serif, weight: 900, italic: true, color: BR.red }); g.restore(); }
  });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
} });

// s023 — the Brazilian coast (Pernambuco), a Portuguese ship offshore
registerShot('s023', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.06 * ease.inOut(t / info.dur), x: 60 - 80 * ease.inOut(t / info.dur) };
  const { GY, CX } = beach(g, t, cam, { mood: 'golden', ship: true, hut: false, bush: false });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
  pill(g, t, 'PERNAMBOUC · BRÉSIL', CX, E.H * 0.16, { at: 2.1, size: 48 });
} });
