// sets/places2.js — Caribbean / Brazil beach, Goa harbour (old + today), Indian chili fields today, blueprint map.
import { E, mood, S, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix, rng, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { chili, chiliPile, chiliPlant, basket, crate, chiliString } from './food.js';
import { GROUND } from './places.js';

export function palm(g, x, y, s = 1, color = '#14201f', t = 0, lean = 0.25) {
  const tx = x + 260 * s * lean, ty = y - 520 * s, sw = Math.sin(t * 0.9 + x) * 6 * s;
  g.strokeStyle = color; g.lineWidth = 22 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 40 * s, y - 300 * s, tx + sw, ty); g.stroke();
  for (let i = 0; i < 7; i++) { const a = -Math.PI + (i / 6) * Math.PI + Math.sin(t + i) * 0.04; const ex = tx + sw + Math.cos(a) * 220 * s, ey = ty + Math.sin(a) * 90 * s + 70 * s;
    g.fillStyle = color; g.beginPath(); g.moveTo(tx + sw, ty); g.quadraticCurveTo((tx + ex) / 2, ey - 90 * s, ex, ey); g.quadraticCurveTo((tx + ex) / 2, ey - 50 * s, tx + sw, ty + 10 * s); g.fill(); }
}
// 2D sailing ship (caravel / carrack). (x, y) = waterline centre, facing +1 right
export function ship2D(g, x, y, s = 1, o = {}) {
  const { color = '#1a1412', sail = '#efe2c4', t = 0, chilies = false, facing = 1 } = o; const bob = Math.sin(t * 1.3) * 6 * s;
  g.save(); g.translate(x, y + bob); g.scale(s * facing, s); g.rotate(Math.sin(t * 1.1) * 0.015);
  poly(g, [[-260, -70], [280, -70], [330, -150], [200, -40], [150, 30], [-200, 30], [-270, -40], [-300, -150]], color);
  g.fillStyle = alpha('#000', 0.3); g.fillRect(-240, -40, 450, 10);
  if (chilies) { for (const cx of [-150, -40, 70]) crate(g, cx, -70, 90, 60, { seed: cx + 99 }); }
  for (const [mx, h] of [[-120, 420], [60, 500], [210, 300]]) { seg(g, [[mx, -70], [mx, -70 - h]], 10, color);
    g.fillStyle = sail; g.beginPath(); g.moveTo(mx - h * 0.33, -70 - h * 0.92); g.quadraticCurveTo(mx + 30, -70 - h * 0.6, mx - h * 0.33, -70 - h * 0.3); g.lineTo(mx + h * 0.33, -70 - h * 0.3); g.quadraticCurveTo(mx + 60, -70 - h * 0.6, mx + h * 0.33, -70 - h * 0.92); g.closePath(); g.fill();
    if (o.cross) { g.strokeStyle = '#b8321e'; g.lineWidth = 12; g.beginPath(); g.moveTo(mx - 30, -70 - h * 0.62); g.lineTo(mx + 50, -70 - h * 0.62); g.moveTo(mx + 10, -70 - h * 0.78); g.lineTo(mx + 10, -70 - h * 0.46); g.stroke(); } }
  g.restore();
}
function sea(g, t, M, y0, h, o = {}) {
  g.fillStyle = linGrad(g, 0, y0, 0, y0 + h, [mix(M.sky[M.sky.length - 1], '#12474F', 0.55), mix('#12474F', M.dark, 0.5)]); g.fillRect(-E.W, y0, E.W * 3, h);
  g.strokeStyle = alpha(M.key, 0.25); g.lineWidth = 3; for (let i = 0; i < 18; i++) { const yy = y0 + 10 + i * i * 2.2, ph = (t * 40 + i * 70) % 160; g.beginPath(); for (let x = -E.W; x < E.W * 2; x += 160) { g.moveTo(x + ph, yy); g.lineTo(x + ph + 50 + i * 3, yy); } g.stroke(); }
}

// ---------- beach (Caribbean 1493 / Brazil) ----------
export function beach(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = GROUND(), CX = E.W / 2, hz = GY - 330;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, CX - 240, hz - 640, 60, '#fffbe8', M.key, 5); FX.clouds(g, { y: hz - 700, h: 260, color: '#ffffff', a: 0.25, seed: 7 }); });
  layer(g, cam, 0.3, (g) => { sea(g, t, M, hz, 500); if (o.ship) ship2D(g, CX + 240, hz + 40, 0.28, { color: mix(M.dark, M.sky[1], 0.3), t, cross: true }); });
  layer(g, cam, 0.6, (g) => { for (const [x, s] of [[-80, 1], [E.W - 40, 1.15], [E.W - 260, 0.8]]) palm(g, x, GY - 40, s, shade(M.dark, -0.2), t, x < CX ? 0.3 : -0.3);
    if (o.hut !== false) { const hx = 110; poly(g, [[hx - 170, GY - 220], [hx + 170, GY - 220], [hx, GY - 380]], shade('#8a6a3a', -0.35)); g.fillStyle = shade(M.dark, 0.05); g.fillRect(hx - 130, GY - 220, 260, 180); } });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 70, 0, GY + 700, [mix('#E6C79C', M.floor, 0.35), shade(mix('#E6C79C', M.dark, 0.6), -0.3)]); g.fillRect(-E.W, GY - 70, E.W * 3, E.H * 2);
    g.fillStyle = alpha('#ffffff', 0.25); g.fillRect(-E.W, GY - 74, E.W * 3, 6); FX.pool(g, CX, GY + 30, 520, 80, M.key, 0.25);
    if (o.bush !== false) chiliPlant(g, CX + 360, GY + 10, 1.2, { seed: 44, t, leaf: M.grass, pods: 8 }); });
  return { GY, CX, M };
}

// ---------- Goa harbour (16th c.) / today's port ----------
export function goaHarbour(g, t, cam, o = {}) {
  const today = !!o.today, M = mood(o.mood || (today ? 'night' : 'dusk')), GY = GROUND(), CX = E.W / 2, hz = GY - 420;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); if (!today) FX.sun(g, CX + 280, hz - 120, 70, '#fff0d0', M.key, 5); else FX.stars(g, t, { count: 90 }); });
  layer(g, cam, 0.3, (g) => { sea(g, t, M, hz, 420);
    if (!today) { ship2D(g, CX - 280, hz + 150, 0.62, { color: shade(M.dark, -0.2), t, cross: true, chilies: true }); if (o.palms !== false) for (const x of [E.W - 60, E.W + 120]) palm(g, x, hz + 60, 0.7, shade(M.dark, -0.1), t, -0.3); }
    else { const c = shade(M.dark, -0.15); g.fillStyle = c; poly(g, [[-200, hz + 120], [760, hz + 120], [800, hz + 30], [-200, hz + 30]], c); for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) { g.fillStyle = ['#b8321e', '#2a6a7a', '#c89a3a', '#5a3a2a'][(i + j) % 4]; g.fillRect(-120 + i * 110, hz - 20 - j * 52, 104, 48); }
      seg(g, [[880, GY - 60], [880, hz - 520], [480, hz - 470]], 16, shade(M.dark, -0.2)); seg(g, [[560, hz - 476], [560, hz - 160]], 3, '#ddd'); circle(g, 870, hz - 520, 8, '#ff4a3a'); glow(g, 870, hz - 520, 50, '#ff4a3a', 0.6); }
  });
  layer(g, cam, 0.65, (g) => {                                      // warehouse with lanterns
    const wx = today ? E.W - 330 : E.W - 380; g.fillStyle = shade(M.wall, -0.2); g.fillRect(wx, GY - 640, 600, 600); poly(g, [[wx - 40, GY - 640], [wx + 640, GY - 640], [wx + 300, GY - 780]], shade(M.wall, -0.45));
    FX.door(g, { x: wx + 90, y: GY - 40, w: 200, h: 320, color: shade(M.wall, -0.5), open: 0.6, light: M.practical });
    for (const lx of [wx + 40, wx + 340]) { rr(g, lx, GY - 420, 26, 40, 6); g.fillStyle = '#ffe2a0'; g.fill(); glow(g, lx + 13, GY - 400, 150, M.practical, 0.6); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 700, [shade(today ? '#4a4a50' : '#6a5038', -0.2), shade(M.dark, -0.3)]); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2);
    g.strokeStyle = alpha('#000', 0.3); g.lineWidth = 3; for (let x = -E.W; x < E.W * 2; x += 90) { g.beginPath(); g.moveTo(x, GY - 40); g.lineTo(x - 40, GY + 700); g.stroke(); }
    FX.pool(g, CX + 200, GY + 20, 480, 70, M.practical, 0.25);
    if (!today) { crate(g, CX + 300, GY + 20, 170, 110, { seed: 61 }); basket(g, CX + 120, GY + 40, 150, 76, { seed: 62 }); } });
  return { GY, CX, M };
}

// ---------- India today: red carpets of drying chilies ----------
export function indiaFields(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, CX - 200, GY - 900, 64, '#fff3dc', M.key, 5); });
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: GY - 420, amp: 80, freq: 0.003, seed: 9, color: mix(M.sky[1], M.dark, 0.6) }); for (const x of [-60, 300, 760, 1150]) FX.tree(g, x, GY - 400, 1.1, mix(M.sky[1], M.dark, 0.75)); FX.fog(g, GY - 480, 160, M.fog, 0.3); });
  layer(g, cam, 0.7, (g) => { g.fillStyle = shade(mix('#E6C79C', M.floor, 0.5), -0.15); g.fillRect(-E.W, GY - 420, E.W * 3, E.H * 2);
    const r = rng(14);
    for (let row = 0; row < 7; row++) { const y = GY - 400 + row * row * 9 + row * 30, h = 18 + row * 9; for (let i = -3; i < 9; i++) { const x = i * 220 + (row % 2) * 110 - 80 + r() * 20; g.fillStyle = mix('#c0281a', '#5a1008', 0.25 + r() * 0.3); g.beginPath(); g.ellipse(x, y, 90 + row * 6, h, 0, 0, Math.PI * 2); g.fill();
      if (row > 3) for (let k = 0; k < 10; k++) chili(g, x + (r() - 0.5) * 150, y + (r() - 0.5) * h, 14 + row * 3, r() * 6.28, { dark: 0.2 }); } }
    FX.crowd(g, t, { x: 60, y: GY - 330, w: 900, rows: 1, rowH: 30, size: 2, color: shade(M.dark, -0.1), seed: 51 }); });
  layer(g, cam, 0.95, (g) => { chiliPile(g, CX - 260, GY + 120, 520, 220, { seed: 71, len: 64 }); chiliPile(g, CX + 330, GY + 160, 460, 200, { seed: 72, len: 60 }); FX.pool(g, CX, GY + 60, 600, 90, M.key, 0.2); });
  return { GY, CX, M };
}

// ---------- blueprint world map (Iberia, Africa, Arabia, India) ----------
const AFRICA = [[-17,21],[-17,14.7],[-12,8],[-8,4.5],[0,5.5],[9,4],[9,-1],[13,-6],[12,-17],[15,-27],[18,-34.5],[20,-35],[26,-34],[32,-28],[35,-24],[40,-15],[40,-10],[39,-5],[43,0],[51,11],[43,12],[39,16],[35,23],[33,31],[30,31],[20,32],[11,33],[10,37],[0,36],[-6,36],[-10,30],[-13,27]];
const IBERIA = [[-9,43.5],[-9,37],[-6,36.5],[-2,36.7],[0,39],[3,42],[3,44],[-2,43.5]];
const EUROPE = [[3,44],[6,43],[10,44],[13,45.5],[16,41],[18,40],[20,42],[24,38],[27,41],[30,46],[40,47],[50,47],[50,52],[-5,52],[-5,48],[-2,46]];
const ARABIA = [[35,28],[39,22],[43,13],[45,13],[52,16],[56,22],[56,26],[50,30],[48,30],[44,37],[36,37],[34,32]];
const ASIA = [[48,30],[52,28],[57,26],[62,25],[67,25],[68,24],[70,28],[74,34],[78,35],[81,30],[88,27],[92,26],[92,22],[100,16],[100,48],[50,48],[50,40],[44,37]];
const INDIA = [[68,24],[72,21],[73,17],[75,12],[77,8],[80,10],[80,15],[84,19],[87,22],[89,22],[88,27],[81,30],[78,35],[74,34],[70,28]];
const SA = [[-35,-6],[-35,-9],[-39,-15],[-41,-22],[-48,-26],[-55,-34],[-60,-38],[-60,10],[-50,5],[-45,-1]];
export const ROUTE = [[-9.1,38.7],[-14,30],[-20,18],[-18,6],[-8,0],[4,-8],[8,-20],[13,-32],[19,-37],[27,-36],[36,-30],[42,-22],[45,-12],[48,-2],[55,6],[64,12],[73.8,15.5]];
export const P = (lon, lat) => [60 + ((lon + 40) / 135) * 960, 330 + ((48 - lat) / 92) * 1180];
const polyLL = (g, pts, fill, stroke) => { g.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 3; g.stroke(); } };
export function worldMap(g, t, o = {}) {
  const ui = S().ui; g.fillStyle = ui.bpBg; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.strokeStyle = alpha(ui.blueprint, 0.07); g.lineWidth = 1; for (let lo = -40; lo <= 100; lo += 10) { const [x] = P(lo, 0); g.beginPath(); g.moveTo(x, -E.H); g.lineTo(x, E.H * 2); g.stroke(); } for (let la = -60; la <= 60; la += 10) { const [, y] = P(0, la); g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
  const land = alpha(ui.blueprint, 0.13), edge = alpha(ui.blueprint, 0.75);
  for (const c of [EUROPE, ASIA, AFRICA, IBERIA, ARABIA, INDIA, SA]) polyLL(g, c, land, edge);
  if (o.highlightIndia) polyLL(g, INDIA, alpha(ui.gold, 0.18 * o.highlightIndia), alpha(ui.gold, o.highlightIndia));
}
// dotted route drawn up to fraction p; returns head position + angle
export function route(g, pts, p, o = {}) {
  const { color = '#C0392B', w = 8 } = o; const xy = pts.map(([a, b]) => P(a, b)); const L = []; let tot = 0; for (let i = 1; i < xy.length; i++) { const d = Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]); L.push(d); tot += d; }
  let rem = tot * p, head = xy[0], ang = 0; g.save(); g.setLineDash([2, 18]); g.lineCap = 'round'; g.strokeStyle = color; g.lineWidth = w; g.beginPath(); g.moveTo(...xy[0]);
  for (let i = 1; i < xy.length && rem > 0; i++) { const k = Math.min(1, rem / L[i - 1]); head = [xy[i - 1][0] + (xy[i][0] - xy[i - 1][0]) * k, xy[i - 1][1] + (xy[i][1] - xy[i - 1][1]) * k]; ang = Math.atan2(xy[i][1] - xy[i - 1][1], xy[i][0] - xy[i - 1][0]); g.lineTo(...head); rem -= L[i - 1]; }
  g.stroke(); g.restore(); return { head, ang };
}
export function pin(g, t, lon, lat, label, o = {}) {
  const { at = 0, color = '#C0392B', labelSide = 1 } = o; const k = Math.max(0, Math.min(1, (t - at) / 0.3)); if (k <= 0) return; const [x, y] = P(lon, lat);
  FX.rings(g, x, y, t, { count: 2, r0: 10, r1: 60, color: '#F2B134', a: 0.6 * k }); circle(g, x, y, 14 * k, color); ring(g, x, y, 14 * k, 4, '#F7EBD3');
  if (label) text(g, label, x + labelSide * 30, y - 34, { size: 46, align: labelSide > 0 ? 'left' : 'right', color: '#F7EBD3', alpha: k, stroke: 8, strokeColor: 'rgba(0,0,0,.6)', spacing: 2 });
}
