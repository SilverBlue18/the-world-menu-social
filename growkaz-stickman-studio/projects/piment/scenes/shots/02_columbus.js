// shots/02_columbus.js — act 2: Columbus meets the chili and gives it the wrong name (s008–s014).
import { E, registerShot, mood, S, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, text, rr, seg, circle, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { kitchen } from '../sets/places.js';
import { beach } from '../sets/places2.js';
import { chili, peppercorn, pepperPile } from '../sets/food.js';
import { BR, pill, bigNum, slam, chiliInHand } from '../sets/brand.js';
import { TOI, COLOMB } from '../cast.js';

const TAINO = { top: 'none' };
const bite = { ...POSES.think, eF: [28, -150], hF: [34, -196] };
const offer = { ...POSES.reach, eF: [30, -150], hF: [60, -160] };

// s008 — 3D: Columbus's caravel on a dusk sea, chili baskets on deck. "1493"
registerShot('s008', {
  kind: '3d',
  init(T) {
    const M = mood('dusk'); const { THREE } = T;
    const st = T.stage({ mood: 'dusk', fov: 50, fog: [40, 160], fogColor: '#1d5a62', keyPos: [10, 9, 12], keyIntensity: 2.8, ambient: 2.0 });
    const seaM = T.mat('#1f6670', { roughness: 0.3, metalness: 0.15 }); const seaP = T.ground(400, 400, '#1f6670'); seaP.material = seaM; st.add(seaP);
    const ship = new THREE.Group(); const wood = '#6a4a32', sail = '#efe2c4';
    ship.add(T.box(7, 1.4, 2.4, wood, 0, 0.5, 0), T.box(2.2, 1.0, 2.2, wood, -3.2, 1.6, 0), T.box(1.6, 0.6, 1.6, wood, 3.4, 1.4, 0));
    const bow = T.cone(1.2, 2.2, wood, 4.6, 0.6, 0, 4); bow.rotation.z = -Math.PI / 2; ship.add(bow);
    for (const [x, h] of [[-1.6, 5], [0.8, 6], [2.9, 3.6]]) { ship.add(T.cyl(0.08, 0.1, h, wood, x, 1.2 + h / 2, 0)); const s = T.plane(h * 0.62, h * 0.5, T.basic(sail, { side: THREE.DoubleSide }), x + 0.05, 1.2 + h * 0.62, 0); s.rotation.y = Math.PI / 2 - 0.25; ship.add(s);
      const cr = T.plane(h * 0.3, 0.12, T.basic('#b8321e', { side: THREE.DoubleSide }), x + 0.08, 1.2 + h * 0.66, 0.03); cr.rotation.y = Math.PI / 2 - 0.25; ship.add(cr); const cr2 = T.plane(0.12, h * 0.3, T.basic('#b8321e', { side: THREE.DoubleSide }), x + 0.08, 1.2 + h * 0.66, 0.03); cr2.rotation.y = Math.PI / 2 - 0.25; ship.add(cr2); }
    for (const [x, z] of [[-0.6, 0.6], [0.3, -0.5], [1.4, 0.5]]) { ship.add(T.cyl(0.32, 0.26, 0.4, '#7a5232', x, 1.42, z)); for (let k = 0; k < 7; k++) { const c = T.cone(0.06, 0.32, '#d8321f', x + Math.cos(k) * 0.16, 1.68, z + Math.sin(k) * 0.16, 6); c.rotation.z = Math.PI / 2 + k; ship.add(c); } }
    const col = T.figure3D(COLOMB, { rim: M.rim, pose: POSES.point, s: 1.25 }); col.position.set(2.2, 1.2, 0.4); ship.add(col);
    st.add(ship);
    const sunM = T.basic('#fff0c8'); st.add(T.sphere(3, sunM, -60, 6, -90));
    return { stage: st, ship };
  },
  draw(s, t, info, T) {
    s.ship.position.y = Math.sin(t * 1.4) * 0.12; s.ship.rotation.z = Math.sin(t * 1.1) * 0.025; s.ship.rotation.x = Math.sin(t * 0.9) * 0.02;
    T.orbit(s.stage.camera, t, { target: [0.5, 3.4, 0], radius: [22, 18.5], height: [2.6, 2.0], from: -0.45, to: 0.1, dur: info.dur });
  },
  overlay(g, t) { bigNum(g, t, '1493', E.W / 2, E.H * 0.17, { at: 0.33, size: 170 }); },
});

// s009 — beach: a Taino host hands Columbus a chili, he bites. "CARAÏBES"
registerShot('s009', { draw(g, t, info) {
  const cam = { z: 1.08 + 0.05 * ease.inOut(t / info.dur), x: -20 };
  const { GY, CX, M } = beach(g, t, cam, { mood: 'day' });
  const given = t > 0.55, rim = { color: M.rim, dir: [0.3, -1], w: 5 };
  const col = { x: CX - 190, y: GY + 40, s: 2.0, facing: 1, outfit: COLOMB, pose: breathe(posesAt(t, [[0, POSES.relaxed], [0.45, offer], [0.9, bite]]), t), expr: t > 1.1 ? 'surprised' : 'smile', rim, blink: (t % 3.2) > 3.1 };
  const tai = { x: CX + 170, y: GY + 40, s: 2.0, facing: -1, outfit: TAINO, pose: breathe(posesAt(t, [[0, offer], [0.7, POSES.relaxed]]), t, 1, 3), expr: 'smile', rim };
  layer(g, cam, 1, (g) => { drawFigure(g, tai); drawFigure(g, col); if (given) chiliInHand(g, col, 70, t > 0.9 ? -1.57 : -2.6); else chiliInHand(g, tai, 70, -2.6); });
  if (t > 1.0 && t < 1.6) FX.rings(g, CX - 120, GY - 410, t - 1.0, { count: 2, r0: 20, r1: 90, color: '#ffffff', a: 0.6 });
  FX.dust(g, t, { count: 30, color: '#fff6e0', a: 0.3 });
  pill(g, t, 'CARAÏBES', CX, E.H * 0.17, { at: 0.75 });
} });

// s010 — giant face Columbus thinking, bubble full of black peppercorns
registerShot('s010', { draw(g, t, info) {
  const M = mood('day');
  blurLayer(g, 14, (g) => beach(g, t, { z: 1.5, x: -160, y: -200 }, { mood: 'day' })); veil(g, '#0a1a1c', 0.4);
  const r = 320 * (1 + 0.03 * t), cx = E.W / 2 - 60, cy = E.H * 0.52;
  bigFace(g, cx, cy, r, { outfit: COLOMB, expr: t < 0.8 ? 'thinking' : 'smirk', rimColor: M.rim, rimSide: 1, look: [0.5, -0.6], blink: (t % 2.9) > 2.8 });
  const k = ease.outBack(prog(t, 0.3, 0.8)); if (k > 0) {
    g.save(); g.translate(E.W * 0.72, E.H * 0.2); g.scale(k, k);
    for (const [dx, dy, rr2] of [[-170, 210, 22], [-130, 160, 34]]) circle(g, dx, dy, rr2, BR.cream);
    g.fillStyle = BR.cream; g.beginPath(); g.ellipse(0, 0, 230, 150, 0, 0, Math.PI * 2); g.fill();
    pepperPile(g, 0, 80, 300, 150, { seed: 3, rad: 20 });
    g.restore(); }
} });

// s011 — insert: a paper tag "PIMIENTO" is tied to the chili
registerShot('s011', { draw(g, t, info) {
  blurLayer(g, 16, (g) => beach(g, t, { z: 1.8, x: 200, y: -100 }, { mood: 'day' })); veil(g, '#0a1a1c', 0.45);
  const cx = E.W / 2, cy = E.H * 0.38, z = 1 + 0.05 * t;
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  chili(g, cx - 330, cy - 40, 720, -1.42, { glowA: 0.2 });
  const sw = Math.sin(t * 2.2) * 0.08 * (1 - prog(t, 0, 2)), tx = cx - 230, ty = cy - 30;
  seg(g, [[tx, ty], [tx + 30, ty + 170]], 4, '#d9c9a0');
  g.save(); g.translate(tx + 30, ty + 170); g.rotate(sw - 0.1); rr(g, -150, 0, 300, 140, 14); g.fillStyle = '#efe2c4'; g.fill(); circle(g, 0, 20, 9, '#8a7a5a');
  const word = 'PIMIENTO', n = Math.floor(clamp((t - 1.5) / 0.6) * word.length + 0.001);
  text(g, word.slice(0, n), 0, 82, { size: 62, font: FONTS.serif, weight: 900, italic: true, color: '#3a2a1a' }); g.restore();
  g.restore();
} });

// s012 — blueprint: chili vs peppercorn, "= POIVRE ?"
registerShot('s012', { draw(g, t, info) {
  UI.blueprint(g, {}); const z = 1 + 0.04 * t; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const y = E.H * 0.42;
  chili(g, E.W * 0.26, y - 300, 520, 0.12, { glowA: 0.15 });
  peppercorn(g, E.W * 0.76, y, 110);
  text(g, 'PIMIENTO', E.W * 0.26, y - 380, { size: 52, color: BR.cream, spacing: 4 });
  text(g, 'POIVRE', E.W * 0.76, y - 190, { size: 52, color: BR.cream, spacing: 4 });
  bigNum(g, t, '= ?', E.W / 2, y + 380, { at: 0.12, size: 150 });
  g.restore();
} });

// s013 — FREEZE: Columbus frozen mid-bite, "MAUVAIS PAYS" / "MAUVAIS NOM"
registerShot('s013', { draw(g, t, info) {
  const cam = { z: 1.12 + 0.03 * t, x: -60, r: -0.02 + 0.01 * t };
  const { GY, CX, M } = beach(g, 0.4, cam, { mood: 'day' });
  const col = { x: CX - 90, y: GY + 40, s: 2.2, facing: 1, outfit: COLOMB, pose: bite, expr: 'confused', rim: { color: M.rim, dir: [0.3, -1], w: 5 } };
  layer(g, cam, 1, (g) => { drawFigure(g, col); chiliInHand(g, col, 70, -1.57); });
  FX.drops(g, t, { count: 50, color: '#d8ecff', rMax: 9, drift: 3 });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(60,140,170,.4)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  slam(g, t, 'MAUVAIS PAYS', E.W / 2, E.H * 0.17, { at: 0.13 });
  slam(g, t, 'MAUVAIS NOM', E.W / 2, E.H * 0.265, { at: 1.08, rot: 0.05 });
} });

// s014 — today: TOI reads a spice jar "PIMENT", shrugs with a smile
registerShot('s014', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * ease.inOut(t / info.dur), x: 120, y: 60 };
  const { GY, CX, M } = kitchen(g, t, cam);
  const hold = { ...POSES.holdFront, eF: [26, -150], hF: [46, -170] };
  const fig = { x: CX + 90, y: GY + 40, s: 2.1, facing: -1, outfit: TOI, pose: breathe(posesAt(t, [[0, hold], [1.0, POSES.shrug]]), t), expr: t > 1.0 ? 'smirk' : 'thinking', rim: { color: M.rim, dir: [-0.3, -1], w: 5 }, blink: (t % 3.1) > 3.0 };
  layer(g, cam, 1, (g) => {
    drawFigure(g, fig);
    const jx = CX - 160, jy = GY - 330;                     // the jar on the counter-side shelf, big and readable
    rr(g, jx - 95, jy - 230, 190, 230, 30); g.fillStyle = 'rgba(220,240,240,.22)'; g.fill();
    g.save(); rr(g, jx - 95, jy - 230, 190, 230, 30); g.clip(); for (let i = 0; i < 9; i++) chili(g, jx - 70 + (i % 3) * 60, jy - 200 + Math.floor(i / 3) * 62, 70, 0.4 + i, { dark: 0.1 }); g.restore();
    rr(g, jx - 100, jy - 260, 200, 36, 10); g.fillStyle = '#3a2a1a'; g.fill();
    rr(g, jx - 80, jy - 150, 160, 64, 8); g.fillStyle = BR.cream; g.fill(); text(g, 'PIMENT', jx, jy - 116, { size: 40, color: BR.red, spacing: 2 });
  });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });
