// shots/03_spread.js — act 3: Portuguese ships carry the chili to Goa; before it, black pepper; south → north; Pernambuco (s015–s023).
import { E, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, text, rr, seg, circle, poly, linGrad, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { kitchen, mexField } from '../sets/places.js';
import { beach, goaHarbour, ship2D } from '../sets/places2.js';
import { drawMap, routeOn, routeShip, mapPin } from '../sets/map.js';
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

// s016 — real map: the route draws from Lisbon down the coast of Africa, a little ship carrying the chili at its head
const SEA_ROUTE = [[-9.14, 38.7], [-12, 36], [-17, 28], [-20, 18], [-19, 10], [-14, 3], [-5, 1], [5, -3], [8, -12], [11, -22], [14, -32], [18.5, -36.5], [25, -36], [33, -32], [38, -25], [42, -17], [44, -8], [48, 0], [55, 8], [63, 13], [73.8, 15.5]];
registerShot('s016', { draw(g, t, info) {
  const p = ease.inOut(prog(t, 0, info.dur)), view = { lon: lerp(2, 12, p), lat: lerp(20, -6, p), zoom: lerp(1.05, 0.98, p) };
  const P = drawMap(g, t, view, { highlight: { Portugal: { color: '#C0392B', a: 0.85 } },
    labels: [{ str: 'AFRIQUE', lon: 20, lat: 6, size: 64 }, { str: 'EUROPE', lon: 12, lat: 47, size: 40, a: 0.8 }, { str: 'ARABIE', lon: 45, lat: 23, size: 34, a: 0.7 }],
    seaLabels: [{ str: 'OCÉAN ATLANTIQUE', lon: -2, lat: -16, size: 34 }, { str: 'OCÉAN INDIEN', lon: 66, lat: -10, size: 34 }] });
  mapPin(g, t, P, -9.14, 38.7, 'LISBONNE', { at: 0, side: -1 });
  const { head, ang } = routeOn(g, P, SEA_ROUTE, lerp(0.02, 0.52, ease.inOut(prog(t, 0.05, info.dur))));
  routeShip(g, t, head, ang);
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
  pill(g, t, 'GOA · INDE', CX, E.H * 0.17, { at: 0.55 });
  bigNum(g, t, 'XVIe SIÈCLE', CX, E.H * 0.245, { at: 2.3, size: 104 });
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

// s019 — macro: black peppercorns pour from a jute sack into a heavy brass bowl. "AVANT : POIVRE NOIR"
registerShot('s019', { draw(g, t, info) {
  blurLayer(g, 18, (g) => kitchen(g, t, { z: 1.7, x: 260, y: -60 }, { old: true })); veil(g, '#120c08', 0.35);
  const cx = E.W / 2 - 20, ty = E.H * 0.5, by = E.H * 0.53, z = 1.02 + 0.05 * t;
  g.save(); g.translate(cx, by); g.scale(z, z); g.translate(-cx, -by);
  // wooden table top in perspective
  g.fillStyle = linGrad(g, 0, ty, 0, E.H, ['#6a4428', '#3a2414', '#1c120a']); g.beginPath(); g.moveTo(-200, ty); g.lineTo(E.W + 200, ty); g.lineTo(E.W + 900, E.H + 200); g.lineTo(-900, E.H + 200); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 3; for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(cx + i * 150, ty); g.lineTo(cx + i * 420, E.H + 200); g.stroke(); }
  g.fillStyle = 'rgba(255,220,160,.12)'; g.fillRect(-200, ty, E.W + 400, 6);
  FX.pool(g, cx, by + 260, 560, 120, '#ffcf8a', 0.3);
  // pepper vine sprig on the table (green clusters = fresh pepper)
  pepperVine(g, cx - 330, by + 330, t);
  // scattered corns with contact shadows
  const r = rngLocal(17); for (let i = 0; i < 34; i++) { const x = cx - 420 + r() * 840, y = by + 300 + r() * 330, rad = 11 + r() * 5; g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 4, y + rad * 0.7, rad, rad * 0.35, 0, 0, 7); g.fill(); peppercorn(g, x, y, rad); }
  // wooden spoon
  g.save(); g.translate(cx + 300, by + 470); g.rotate(-0.35); g.fillStyle = '#8a5a32'; g.beginPath(); g.ellipse(0, 0, 70, 44, 0, 0, 7); g.fill(); g.fillRect(60, -10, 260, 20); g.fillStyle = '#5a3a1e'; g.beginPath(); g.ellipse(0, 0, 54, 32, 0, 0, 7); g.fill(); pepperPile(g, 0, 18, 90, 34, { seed: 9, rad: 9 }); g.restore();
  // brass bowl
  brassBowl(g, cx, by, 300, t, ease.out(prog(t, 0, info.dur)));
  // jute sack + hand pouring from the top right
  const pour = t < info.dur - 0.25, sx = cx + 250, sy = E.H * 0.17;
  for (let i = 0; i < 46 && pour; i++) { const sp = 1.1 + ((i * 37) % 10) / 14, ph = (t * sp + ((i * 0.618) % 1)) % 1, x = lerp(sx - 80, cx + 10, ph) + Math.sin(i * 5.3) * (10 + 70 * ph), y = sy + 60 + ph * ph * (by - sy - 30); peppercorn(g, x, y, 12 + (i % 4) * 2); }
  g.save(); g.translate(sx, sy); g.rotate(-0.9 + Math.sin(t * 2) * 0.04);
  g.fillStyle = '#b08a5a'; g.beginPath(); g.moveTo(-90, -60); g.lineTo(110, -80); g.lineTo(140, 120); g.quadraticCurveTo(10, 160, -110, 110); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(80,50,20,.45)'; g.lineWidth = 3; for (let i = -80; i < 130; i += 14) { g.beginPath(); g.moveTo(i, -70); g.lineTo(i + 20, 130); g.stroke(); } for (let j = -50; j < 130; j += 14) { g.beginPath(); g.moveTo(-100, j); g.lineTo(130, j - 10); g.stroke(); }
  g.fillStyle = '#4a2e14'; g.beginPath(); g.ellipse(-100, 30, 22, 80, 0.1, 0, 7); g.fill(); pepperPile(g, -96, 60, 30, 50, { seed: 3, rad: 10 });
  g.restore();
  seg(g, [[sx + 60, sy - 70], [sx + 150, sy - 130]], 60, '#0a1a1c'); for (let f = 0; f < 4; f++) seg(g, [[sx + 40 + f * 4, sy - 100 + f * 18], [sx + 8 + f * 6, sy - 60 + f * 16]], 20, '#0a1a1c'); seg(g, [[sx + 170, sy - 140], [E.W + 160, sy - 330]], 104, '#f29ac0'); seg(g, [[sx + 175, sy - 150], [E.W + 160, sy - 340]], 14, 'rgba(255,230,240,.35)');
  g.restore();
  pill(g, t, 'AVANT : POIVRE NOIR', E.W / 2 - 60, E.H * 0.155, { at: 0.95, size: 52 });
} });
function rngLocal(seed) { return () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }
function brassBowl(g, cx, cy, R, t, fill) {
  const ry = R * 0.27, H = R * 0.85;
  g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(cx + 20, cy + H + 10, R * 0.7, R * 0.12, 0, 0, 7); g.fill();
  const body = () => { g.beginPath(); g.moveTo(cx - R, cy); g.bezierCurveTo(cx - R, cy + H * 0.75, cx - R * 0.55, cy + H, cx, cy + H); g.bezierCurveTo(cx + R * 0.55, cy + H, cx + R, cy + H * 0.75, cx + R, cy); g.ellipse(cx, cy, R, ry, 0, 0, Math.PI, false); g.closePath(); };
  body(); g.fillStyle = linGrad(g, cx - R, 0, cx + R, 0, [[0, '#5a3a10'], [0.18, '#b8862a'], [0.32, '#f6d47a'], [0.4, '#d8a640'], [0.7, '#8a5a18'], [0.9, '#5a3a10'], [1, '#3a2408']]); g.fill();
  g.save(); body(); g.clip(); g.fillStyle = 'rgba(255,250,220,.55)'; g.fillRect(cx - R * 0.42, cy, R * 0.07, H); g.fillStyle = 'rgba(255,240,200,.25)'; g.fillRect(cx - R * 0.3, cy, R * 0.03, H);
  for (let i = 1; i < 4; i++) { g.strokeStyle = 'rgba(60,30,5,.35)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy + H * 0.18 * i, R * (1 - 0.04 * i * i), ry * 0.8, 0, 0.1, Math.PI - 0.1); g.stroke(); }
  g.restore();
  g.fillStyle = '#26160a'; g.beginPath(); g.ellipse(cx, cy, R * 0.94, ry * 0.84, 0, 0, 7); g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, cy, R * 0.94, ry * 0.84, 0, 0, Math.PI * 2); g.rect(cx - R * 1.3, cy - R * 1.2, R * 2.6, R * 1.2 + 1); g.clip();
  pepperPile(g, cx, cy + ry * 0.55, R * 1.75, ry * 0.6 + fill * R * 0.45, { seed: 8, rad: 17 }); g.restore();
  g.strokeStyle = '#f2cf72'; g.lineWidth = 12; g.beginPath(); g.ellipse(cx, cy, R, ry, 0, 0, 7); g.stroke();
  g.strokeStyle = 'rgba(255,250,220,.8)'; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, cy - 3, R * 0.99, ry * 0.97, 0, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
  glow(g, cx - R * 0.35, cy + H * 0.35, 120, '#fff2c0', 0.25);
}
function pepperVine(g, x, y, t) {
  seg(g, [[x - 160, y + 60], [x, y], [x + 120, y - 40]], 7, '#3a5a24');
  for (const [lx, ly, a] of [[-110, 40, -0.6], [-30, 0, 0.5], [70, -30, -0.4]]) { g.save(); g.translate(x + lx, y + ly); g.rotate(a); g.fillStyle = '#2f6a2c'; g.beginPath(); g.ellipse(0, -40, 34, 60, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 15); g.lineTo(0, -95); g.stroke(); g.restore(); }
  for (const [sx, sy] of [[-60, 20], [40, -14]]) for (let i = 0; i < 12; i++) { circle(g, x + sx + Math.sin(i) * 8, y + sy + i * 9, 7, i % 3 ? '#3f7a2a' : '#7a2a18'); circle(g, x + sx + Math.sin(i) * 8 - 2, y + sy + i * 9 - 2, 2, 'rgba(255,255,220,.5)'); }
}

// s020 — real map zoomed on India: GOA, then the chili lands in the SOUTH
registerShot('s020', { draw(g, t, info) {
  const p = ease.inOut(t / info.dur), view = { lon: lerp(79, 78, p), lat: lerp(20, 17, p), zoom: lerp(2.05, 2.4, p) };
  const P = drawMap(g, t, view, { highlight: { India: { color: '#F2B134', a: 0.6 * ease.out(prog(t, 0, 0.5)) } },
    labels: [{ str: 'INDE', lon: 78.5, lat: 23, size: 80 }, { str: 'PAKISTAN', lon: 68, lat: 28, size: 30, a: 0.7 }],
    seaLabels: [{ str: 'MER', lon: 70.3, lat: 16.5, size: 30 }, { str: 'D’ARABIE', lon: 70.3, lat: 15.3, size: 30 }, { str: 'OCÉAN INDIEN', lon: 79, lat: 3, size: 34 }, { str: 'GOLFE DU', lon: 86.5, lat: 16, size: 26 }, { str: 'BENGALE', lon: 86.5, lat: 14.8, size: 26 }] });
  mapPin(g, t, P, 73.8, 15.5, 'GOA', { at: 0.1, side: -1, size: 40 });
  const [sx, sy] = P(76.6, 10.2);
  for (let i = 0; i < 7; i++) { const k = ease.outBack(prog(t, 1.95 + i * 0.06, 2.35 + i * 0.06)); if (k > 0) { const a = i * 0.9; chili(g, sx + Math.cos(a) * 46, sy + Math.sin(a) * 30 - 10, 46 * k, a + 1, { glowA: 0.3 }); } }
  mapPin(g, t, P, 76.6, 10.2, 'SUD', { at: 1.95, side: 1, size: 56 });
} });

// s021 — two centuries: a farmer walks north with a basket while sun and moon sweep the sky
registerShot('s021', { draw(g, t, info) {
  const p = t / info.dur, cam = { z: 1.04, x: lerp(-40, 40, p) };
  const sunA = Math.PI * (1 - ((t * 0.9) % 1));
  const { GY, CX, M } = mexField(g, t, cam, { cactus: false, sunX: Math.cos(sunA) * 520, sunH: 300 + Math.sin(sunA) * 700 });
  const x = lerp(CX - 380, CX + 300, p), wp = walkPose(t * Math.PI * 2 * 0.9);
  const fig = { x, y: GY + 50, s: 2.0, facing: 1, outfit: INK, pose: { ...wp, eF: [20, -196], hF: [16, -236], eB: [-14, -196], hB: [-10, -236] }, expr: 'determined', rim: { color: M.rim, dir: [0.4, -1], w: 5 } };
  layer(g, cam, 1, (g) => { drawFigure(g, fig); basket(g, x + 6, GY + 50 - 236 * 2.0, 150, 60, { seed: 101 }); });
  countUp(g, t, CX);
  pill(g, t, 'NORD ➜', E.W * 0.7, E.H * 0.25, { at: 2.45 });
} });
function countUp(g, t, CX) { const v = Math.round(ease.out(prog(t, 1.0, 1.9)) * 2); bigNum(g, t, `${v} SIÈCLES`, CX, E.H * 0.165, { at: 1.0, size: 120 }); }

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
  const { GY, CX, M } = beach(g, t, cam, { mood: 'golden', ship: true, hut: false, bush: false, cargo: true });
  const lift = POSES.holdFront;
  const m = { x: CX - 20, y: GY + 60, s: 1.9, facing: 1, outfit: MARIN, pose: breathe(lift, t), expr: 'determined', rim: { color: M.rim, dir: [-0.4, -1], w: 5 } };
  layer(g, cam, 1, (g) => { drawFigure(g, m); crate(g, m.x + 74, m.y - 152 * 1.9 + 62, 130, 80, { seed: 141 }); });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
  pill(g, t, 'PERNAMBOUC · BRÉSIL', CX, E.H * 0.17, { at: 2.1, size: 48 });
} });
