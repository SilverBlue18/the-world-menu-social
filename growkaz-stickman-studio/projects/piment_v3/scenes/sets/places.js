// sets/places.js — the locations of "Le piment" (9:16). Each set draws the world and returns { GY, CX, M }.
// Characters go on layer depth 1 at GY. Bottom ~28% of the frame stays calm for the FR/EN captions.
import { E, mood, layer, blurLayer, backdrop, rr, seg, circle, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, noise } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { chili, chiliPile, chiliPlant, basket, crate, chiliString, pepperPile } from './food.js';

export const GROUND = () => E.H * 0.68;

// ---------- Mexico: chili field at sunset (also used, recoloured, for the Indian countryside) ----------
export function mexField(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => {
    backdrop(g, M.sky);
    FX.sun(g, CX + (o.sunX ?? 210), GY - (o.sunH ?? 520), 58, '#fff3dc', M.key, 5);
    FX.godRays(g, CX + (o.sunX ?? 210), GY - (o.sunH ?? 520), { angle: Math.PI / 2 + 0.25, spread: 1.6, len: 1500, color: M.key, a: 0.07, t });
    FX.clouds(g, { y: GY - 1250, h: 300, color: '#ffe7c7', a: 0.14, seed: 4 });
  });
  layer(g, cam, 0.25, (g) => {                                      // far mountains (Puebla / Oaxaca sierra)
    FX.hills(g, { y: GY - 300, amp: 260, freq: 0.0022, seed: 2, color: mix(M.sky[1], M.dark, 0.55) });
    FX.fog(g, GY - 260, 200, M.fog, 0.25);
  });
  layer(g, cam, 0.45, (g) => {
    FX.hills(g, { y: GY - 150, amp: 120, freq: 0.004, seed: 6, color: mix(M.sky[1], M.dark, 0.75) });
    if (o.cactus !== false) for (const [x, h] of [[-260, 150], [1290, 190], [80, 110]]) { const c = shade(M.dark, -0.1); seg(g, [[x, GY - 120], [x, GY - 120 - h]], 22, c); seg(g, [[x, GY - 170], [x - 34, GY - 180], [x - 34, GY - 220]], 14, c); seg(g, [[x, GY - 150 - h * 0.3], [x + 30, GY - 160 - h * 0.3], [x + 30, GY - 200 - h * 0.3]], 14, c); }
  });
  layer(g, cam, 0.7, (g) => {                                       // far rows of plants
    g.fillStyle = linGrad(g, 0, GY - 120, 0, GY, [shade(M.grass, -0.45), shade(M.floor, -0.2)]); g.fillRect(-E.W, GY - 110, E.W * 3, E.H);
    for (let row = 0; row < 3; row++) for (let i = -10; i < 22; i++) chiliPlant(g, i * 95 + (row % 2) * 45, GY - 90 + row * 30, 0.32 + row * 0.08, { seed: i * 7 + row, t, dark: 0.55 - row * 0.12, leaf: M.grass, pods: 3 });
  });
  layer(g, cam, 0.9, (g) => {                                       // soil
    g.fillStyle = linGrad(g, 0, GY - 10, 0, GY + 700, [shade(M.floor, -0.05), shade(M.dark, -0.3)]); g.fillRect(-E.W, GY - 10, E.W * 3, E.H * 2);
    g.strokeStyle = alpha('#000', 0.22); g.lineWidth = 3; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(-E.W, GY + 20 + k * k * 9); g.lineTo(E.W * 2, GY + 20 + k * k * 9); g.stroke(); }
    FX.pool(g, CX + 120, GY + 40, 520, 70, M.key, 0.22);
  });
  return { GY, CX, M };
}
// near-row plants in front of / beside characters (call after drawing the figures for depth)
export function fieldForeground(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = GROUND();
  layer(g, cam, 1, (g) => { for (const [x, s, sd] of o.plants || [[120, 1.4, 1], [960, 1.5, 2]]) chiliPlant(g, x, GY + 30, s, { seed: sd, t, leaf: M.grass, pods: 8 }); });
  if (o.blurFg !== false) blurLayer(g, 10, (g) => { for (const [x, s, sd] of [[-40, 2.6, 11], [1120, 2.8, 12]]) chiliPlant(g, x, GY + 640, s, { seed: sd, t, leaf: shade(M.grass, -0.4), pods: 5, dark: 0.3 }); }, cam, 1.6);
}

// ---------- India: spice market street at golden hour ----------
export function indiaMarket(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, CX, GY - 620, 70, '#fff3dc', M.key, 6); FX.godRays(g, CX, GY - 620, { spread: 2.2, len: 1600, color: M.key, a: 0.08, t }); });
  layer(g, cam, 0.3, (g) => {                                       // far end of the street: domes + buildings
    const c = mix(M.sky[1], M.dark, 0.6);
    FX.skyline(g, { x: -E.W, y: GY - 300, w: E.W * 3, minH: 120, maxH: 380, color: c, windowColor: alpha(M.practical, 0.6), lit: 0.12, seed: 21 });
    for (const [x, r] of [[CX - 120, 90], [CX + 260, 60]]) { circle(g, x, GY - 430 - r * 0.2, r, c); g.fillStyle = c; g.fillRect(x - r, GY - 430, r * 2, 140); seg(g, [[x, GY - 430 - r * 1.2], [x, GY - 430 - r * 1.6]], 6, c); }
    FX.fog(g, GY - 380, 260, M.fog, 0.35);
  });
  layer(g, cam, 0.55, (g) => {                                      // crowd in the light
    FX.crowd(g, t, { x: -300, y: GY - 210, w: E.W + 600, rows: 4, rowH: 30, size: 2.2, color: mix(M.dark, M.sky[1], 0.25), seed: 31 });
  });
  layer(g, cam, 0.75, (g) => {                                      // side buildings + awnings + stalls, both sides
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? -E.W : E.W - 170, w = E.W + 170;
      g.fillStyle = linGrad(g, 0, 0, 0, GY, [shade(M.wall, -0.45), shade(M.wall, -0.25)]); g.fillRect(side < 0 ? -E.W : E.W - 170, -E.H, w, E.H + GY);
      const ax = side < 0 ? 170 : E.W - 170;
      for (let k = 0; k < 3; k++) { const ay = GY - 640 + k * 210; const cols = ['#c0392b', '#e0a030', '#2a7a6a']; const aw = 300; const sx = side < 0 ? ax - aw + 120 : ax - 120;
        poly(g, [[sx, ay], [sx + aw, ay], [sx + aw + side * 60, ay + 70], [sx + side * 60, ay + 70]], cols[(k + (side > 0 ? 1 : 0)) % 3]);
        for (let s = 0; s < 6; s++) { g.fillStyle = alpha('#ffffff', 0.18); g.fillRect(sx + s * 50, ay, 22, 70); } g.fillStyle = alpha('#000', 0.3); g.fillRect(sx, ay + 64, aw + 60, 8);
        if (k === 2) for (let s = 0; s < 4; s++) chiliString(g, (side < 0 ? 40 : E.W - 260) + s * 60, ay + 90, 7, 44, { t, seed: s + k + side, dark: 0.15 }); }
    }
  });
  layer(g, cam, 0.9, (g) => {                                       // street + chili stalls
    g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 700, [shade(M.floor, 0.05), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY - 20, E.W * 3, E.H * 2);
    FX.pool(g, CX, GY + 20, 620, 90, M.key, 0.3);
    for (const [x, w, sd] of [[60, 260, 1], [E.W - 60, 280, 2]]) { rr(g, x - w / 2 - 10, GY - 120, w + 20, 120, 8); g.fillStyle = shade(M.dark, 0.05); g.fill(); chiliPile(g, x, GY - 120, w, 150, { seed: sd, len: 54 }); }
    basket(g, 250, GY + 10, 180, 90, { seed: 3, dark: 0.1 }); basket(g, E.W - 250, GY + 14, 170, 86, { seed: 4, dark: 0.1 });
  });
  return { GY, CX, M };
}

// ---------- India: home kitchen (warm interior, window, fire) ----------
export function kitchen(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = GROUND(), CX = E.W / 2, wall = shade(M.wall, -0.25), wallD = shade(M.wall, -0.55);
  const old = !!o.old;                                              // "before the chili": no chilies anywhere
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [wallD, wall, shade(wall, 0.05)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H + GY);
    const wx = CX + 120, wy = GY - 980, ww = 380, wh = 460;                        // arched window with a hot sky
    g.save(); g.beginPath(); g.moveTo(wx, wy + wh); g.lineTo(wx, wy + ww / 2); g.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); g.lineTo(wx + ww, wy + wh); g.closePath(); g.clip();
    g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, M.sky); g.fillRect(wx, wy, ww, wh); FX.sun(g, wx + ww * 0.6, wy + wh * 0.62, 40, '#fff3dc', M.key, 3);
    FX.skyline(g, { x: wx - 20, y: wy + wh, w: ww + 40, minH: 40, maxH: 130, color: mix(M.sky[0], wallD, 0.6), lit: 0, seed: 3 }); g.restore();
    g.strokeStyle = wallD; g.lineWidth = 12; seg(g, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 10, wallD); seg(g, [[wx, wy + wh * 0.55], [wx + ww, wy + wh * 0.55]], 10, wallD);
    glow(g, wx + ww / 2, wy + wh / 2, 520, M.key, 0.22);
    FX.godRays(g, wx + ww / 2, wy + wh * 0.5, { angle: Math.PI * 0.62, spread: 0.5, len: 1300, color: M.key, a: 0.08, t });
    rr(g, wx - 30, wy + wh, ww + 60, 22, 6); g.fillStyle = shade(wallD, 0.1); g.fill();             // sill
    if (!old) for (let i = 0; i < 7; i++) chili(g, wx + 20 + i * 50, wy + wh - 16, 46, 1.45 + (i % 2) * 0.2);
    else for (let i = 0; i < 3; i++) { rr(g, wx + 40 + i * 110, wy + wh - 50, 60, 50, 10); g.fillStyle = mix('#8a6a4a', wallD, 0.3); g.fill(); }
    for (let i = 0; i < 5; i++) { const sx = CX - 470 + i * 90; rr(g, sx, GY - 760, 66, 86, 12); g.fillStyle = mix(['#b07a4a', '#8a5a3a', '#c09060'][i % 3], wallD, 0.35); g.fill(); }        // shelf of clay jars
    rr(g, CX - 490, GY - 674, 470, 14, 4); g.fillStyle = wallD; g.fill();
    if (!old) chiliString(g, CX - 420, GY - 640, 9, 52, { t, seed: 6 });
  });
  layer(g, cam, 0.85, (g) => {                                      // floor, counter, stove with pot
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 700, [shade(M.floor, 0.04), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2);
    FX.counter(g, { x: CX - 650, y: GY - 30, w: 480, h: 220, color: shade(M.dark, 0.08), top: shade(M.wall, -0.1), doors: 3 });
    const px = CX - 410, py = GY - 250;                                            // fire + pot
    glow(g, px, py + 30, 260, '#ff8a3a', 0.55); for (let i = 0; i < 4; i++) { const fh = 50 + Math.sin(t * 9 + i * 2) * 14; poly(g, [[px - 50 + i * 30, py + 30], [px - 36 + i * 30, py + 30 - fh], [px - 22 + i * 30, py + 30]], i % 2 ? '#ffb04a' : '#ff6a2a'); }
    g.fillStyle = shade(M.dark, -0.3); g.beginPath(); g.ellipse(px, py - 10, 120, 26, 0, 0, Math.PI * 2); g.fill(); rr(g, px - 120, py - 90, 240, 90, 30); g.fill();
    g.fillStyle = old ? '#7a5a2a' : '#b8321e'; g.beginPath(); g.ellipse(px, py - 88, 110, 22, 0, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 4; i++) { const k = (t * 0.4 + i / 4) % 1; circle(g, px - 40 + i * 26 + Math.sin(t * 2 + i) * 14, py - 130 - k * 260, 18 + k * 30, alpha('#fff2e0', 0.12 * (1 - k))); }
    FX.pool(g, CX + 280, GY + 20, 420, 70, M.key, 0.25);
  });
  return { GY, CX, M };
}
