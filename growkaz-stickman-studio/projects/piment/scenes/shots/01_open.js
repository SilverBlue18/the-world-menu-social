// shots/01_open.js — act 1: the hook in an Indian market, India, then Mexico (s001–s007).
import { E, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { GROUND, indiaMarket, kitchen, mexField, fieldForeground } from '../sets/places.js';
import { chili, chiliPile, basket, chiliPlant } from '../sets/food.js';
import { BR, pill, bigNum, countNum, chiliInHand } from '../sets/brand.js';
import { TOI, CUISINIERE, PAYSAN } from '../cast.js';

const holdUp = { ...POSES.cheer, eB: [-7, -136], hB: [-9, -100], eF: [26, -200], hF: [40, -242] };

// s001 — hook + title: market wide, TOI raises one chili. Title doubles as the thumbnail.
registerShot('s001', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.07 * ease.inOut(t / info.dur), x: 10 - 20 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = indiaMarket(g, t, cam);
  const fig = { x: CX, y: GY + 30, s: 2.2, facing: 1, outfit: TOI, pose: breathe(posesAt(t, [[0, POSES.relaxed], [0.5, holdUp]]), t), expr: t > 0.6 ? 'happy' : 'smile', rim: { color: M.rim, dir: [0, -1], w: 5 }, blink: (t % 3.1) > 3.0 };
  layer(g, cam, 1, (g) => { FX.pool(g, CX, GY + 14, 220, 40, M.key, 0.35); drawFigure(g, fig); chiliInHand(g, fig, 120, -2.75, { glowA: 0.35 * ease.out(prog(t, 0.5, 1)) }); });
  blurLayer(g, 12, (g) => { basket(g, 40, E.H + 120, 420, 200, { seed: 8, dark: 0.35 }); basket(g, E.W - 20, E.H + 160, 380, 200, { seed: 9, dark: 0.35 }); }, cam, 1.6);
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.4 });
  // title (no captions on this shot)
  const a = ease.out(prog(t, 0.15, 0.6));
  g.save(); g.globalAlpha *= a;
  text(g, 'LE PIMENT', CX, E.H * 0.17, { size: 74, color: BR.cream, spacing: 10, glow: 20, glowColor: 'rgba(0,0,0,.6)' });
  g.restore();
  bigNum(g, t, 'PAS INDIEN ?!', CX, E.H * 0.25, { at: 0.9, size: 128, color: BR.mustard });
  text(g, 'NOT INDIAN?!', CX, E.H * 0.31, { size: 44, font: FONTS.ui, weight: 900, color: BR.cream, alpha: ease.out(prog(t, 1.2, 1.6)), spacing: 4 });
} });

// s002 — giant face: shocked, "500 ANS"
registerShot('s002', { draw(g, t, info) {
  const M = mood('golden');
  blurLayer(g, 14, (g) => indiaMarket(g, t, { z: 1.5, x: 60, y: -260 })); veil(g, '#120a10', 0.38);
  const r = 330 * (1 + 0.04 * t), cx = E.W / 2, cy = E.H * 0.47;
  bigFace(g, cx, cy, r, { outfit: TOI, expr: t < 0.5 ? 'surprised' : 'shocked', rimColor: M.rim, rimSide: -1, blink: (t % 2.7) > 2.6, look: [0.3, -0.1] });
  chili(g, cx + r * 0.95, cy + r * 0.35, 260, -2.75 + Math.sin(t * 2) * 0.04, { glowA: 0.3 });
  countNum(g, t, 0, 500, cx, E.H * 0.165, { at: 1.25, dur: 0.6, suffix: ' ANS', size: 150 });
  text(g, '500 YEARS', cx, E.H * 0.222, { size: 40, font: FONTS.ui, weight: 900, color: BR.cream, alpha: ease.out(prog(t, 1.8, 2.1)), spacing: 4 });
} });

// s003 — "Ce pays, c'est l'Inde." kitchen wide, the cook stirs a red curry
registerShot('s003', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.06 * ease.inOut(t / info.dur), x: -40 + 30 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = kitchen(g, t, cam);
  const stir = { ...POSES.holdFront, eF: [30, -150], hF: [56 + Math.sin(t * 5) * 10, -150 + Math.cos(t * 5) * 6] };
  const cook = { x: CX - 200, y: GY + 40, s: 2.0, facing: -1, outfit: CUISINIERE, pose: breathe(stir, t, 1, 4), expr: 'happy', rim: { color: M.rim, dir: [1, -0.4], w: 5 }, blink: (t % 3.4) > 3.3 };
  layer(g, cam, 1, (g) => { drawFigure(g, cook); seg2(g, cook); basket(g, CX + 260, GY + 30, 260, 120, { seed: 12 }); });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
  pill(g, t, 'INDE', CX, E.H * 0.17, { at: 1.05 });
} });
function seg2(g, cook) {   // the wooden spoon in the pot
  const s = cook.s, h = cook.pose.hF; const hx = cook.x + h[0] * s * cook.facing, hy = cook.y + h[1] * s;
  g.strokeStyle = '#8a5a32'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx - 70, hy + 60); g.stroke();
}

// s004 — "Et le piment ?" macro: one chili turning on dark
registerShot('s004', { draw(g, t, info) {
  const M = mood('void'); g.fillStyle = M.sky[0]; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  glow(g, E.W / 2, E.H * 0.42, 700, '#c0392b', 0.28);
  chili(g, E.W / 2 - 40, E.H * 0.25, 640, -0.35 + 0.18 * Math.sin(t * 1.4), { glowA: 0.25 });
  bigNum(g, t, '?', E.W * 0.74, E.H * 0.22, { at: 0.35, size: 260 });
  FX.dust(g, t, { count: 30, color: '#ffd0b0', a: 0.3 });
} });

// s005 — "Il vient du Mexique." chili field wide at sunset
registerShot('s005', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * ease.inOut(t / info.dur), x: -60 * ease.inOut(t / info.dur) };
  const { CX } = mexField(g, t, cam);
  fieldForeground(g, t, cam, { plants: [[180, 1.3, 1], [520, 1.0, 3], [900, 1.4, 2]] });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
  pill(g, t, 'MEXIQUE', CX, E.H * 0.17, { at: 0.55 });
} });

// s006 — farmer picks chilies into a basket
registerShot('s006', { draw(g, t, info) {
  const cam = { z: 1.06 + 0.06 * ease.inOut(t / info.dur), x: 40 };
  const { GY, CX, M } = mexField(g, t, cam);
  const pick = posesAt(t, [[0, POSES.crouch], [0.7, { ...POSES.crouch, eF: [40, -110], hF: [70, -120] }], [1.3, POSES.crouch], [1.9, { ...POSES.crouch, eF: [40, -110], hF: [70, -120] }]]);
  const fig = { x: CX - 170, y: GY + 60, s: 2.3, facing: 1, outfit: PAYSAN, pose: breathe(pick, t, 1, 7), expr: 'smile', rim: { color: M.rim, dir: [0.6, -1], w: 5 }, blink: (t % 3.7) > 3.6 };
  layer(g, cam, 1, (g) => {
    chiliPlant(g, CX + 120, GY + 40, 1.6, { seed: 21, t, leaf: M.grass, pods: 9 });
    drawFigure(g, fig); chiliInHand(g, fig, 70, -1.2);
    basket(g, CX - 330, GY + 40, 200, 100, { seed: 5 });
  });
  fieldForeground(g, t, cam, { plants: [] });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });

// s007 — "six mille ans": gold counter over the sunset field, a plant grows seed → fruit
registerShot('s007', { draw(g, t, info) {
  blurLayer(g, 10, (g) => mexField(g, t, { z: 1.2, x: 0, y: -100 })); veil(g, '#0c0806', 0.45);
  const GY = GROUND(), CX = E.W / 2, gr = ease.out(prog(t, 0.1, 1.6));
  g.save(); g.translate(CX, GY + 80); g.scale(gr * 2.2, gr * 2.2); chiliPlant(g, 0, 0, 1, { seed: 33, t, leaf: '#2f5a2c', pods: Math.round(gr * 9) }); g.restore();
  countNum(g, t, 0, 6000, CX, E.H * 0.165, { at: 0.1, dur: 1.3, suffix: ' ANS', size: 150 });
  text(g, '6,000 YEARS', CX, E.H * 0.222, { size: 40, font: FONTS.ui, weight: 900, color: BR.cream, alpha: ease.out(prog(t, 1.4, 1.7)), spacing: 4 });
} });
