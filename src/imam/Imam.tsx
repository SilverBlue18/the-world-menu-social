import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import map from "./mapdata.json";
import warpPairs from "./warp.json";
import {
  FOCUS_X, FOCUS_Y, FPS, Pt, at, clamp, hash, makeWarp, makeEase, makeCamera, partial, ramp, smoothPath, track, win, Cam,
} from "./lib";
import { Book, Card, Compass, Figure, GOLD, INK, Photo, Pin, RED, SEPIA, Ship, Stamp } from "./props";
const EX = (map as unknown as { EX: { x0: number; y0: number; x1: number; y1: number } }).EX;

export const DURATION_S = 75;
export const AUDIO = "imam/voice.mp3";
const WARP = makeWarp(warpPairs as number[][]);
const P = map.pts as unknown as Record<string, Pt>;

// ================= camera =================
const camera = makeCamera([
  { t: 0, x: 1720, y: 2230, z: 1.75, r: -2.5 },
  { t: 2.3, x: 1630, y: 2390, z: 1.45, r: -1.5 },
  { t: 4.7, x: 1080, y: 3260, z: 0.95, r: 0 },
  { t: 6.9, x: 1060, y: 3240, z: 1.0, r: 0.3 },
  { t: 7.95, x: 2750, y: 1950, z: 0.3, r: 0 },
  { t: 8.95, x: 4330, y: 690, z: 0.95, r: 1 },
  { t: 9.95, x: 4760, y: 920, z: 0.7, r: 0.5 },
  { t: 10.9, x: 4690, y: 1040, z: 0.78, r: 0 },
  { t: 11.7, x: 4510, y: 1260, z: 1.15, r: -0.5 },
  { t: 12.9, x: 4480, y: 1300, z: 1.22, r: -0.8 },
  { t: 14.3, x: 3500, y: 2480, z: 0.27, r: 0 },
  { t: 15.2, x: 3600, y: 2300, z: 0.3, r: 0 },
  { t: 16.3, x: 3860, y: 1120, z: 0.95, r: 0.6 },
  { t: 19.3, x: 3800, y: 1100, z: 1.02, r: 0.2 },
  { t: 20.4, x: 3090, y: 730, z: 1.25, r: -1 },
  { t: 21.3, x: 3010, y: 770, z: 1.2, r: -1.5 },
  { t: 22.4, x: 1840, y: 2040, z: 1.05, r: 0 },
  { t: 23.25, x: 1640, y: 2400, z: 0.82, r: 1.5 },
  { t: 24.5, x: 1565, y: 2490, z: 0.8, r: 3 },
  { t: 25.5, x: 1540, y: 2560, z: 0.8, r: 2 },
  { t: 27.2, x: 1060, y: 3540, z: 1.0, r: 0 },
  { t: 28.4, x: 960, y: 3660, z: 1.08, r: 0 },
  { t: 30.0, x: 975, y: 3650, z: 1.12, r: 0.4 },
  { t: 31.5, x: 1060, y: 3720, z: 1.08, r: 0.6 },
  { t: 32.4, x: 1240, y: 3880, z: 1.02, r: 0.4 },
  { t: 33.5, x: 1270, y: 3900, z: 1.05, r: 0.2 },
  { t: 35.3, x: 1780, y: 3960, z: 1.0, r: -0.4 },
  { t: 38.3, x: 1760, y: 3975, z: 1.05, r: -0.2 },
  { t: 40.5, x: 1800, y: 4000, z: 1.02, r: 0.2 },
  { t: 41.5, x: 2560, y: 4150, z: 1.0, r: 0.4 },
  { t: 44.5, x: 2580, y: 4140, z: 1.05, r: 0 },
  { t: 45.4, x: 2700, y: 3480, z: 1.0, r: -0.4 },
  { t: 46.4, x: 2600, y: 3300, z: 0.8, r: 0 },
  { t: 47.7, x: 2200, y: 2980, z: 0.36, r: 0 },
  { t: 49.4, x: 2120, y: 3010, z: 0.39, r: 0 },
  { t: 50.7, x: 1410, y: 3290, z: 0.9, r: 0.4 },
  { t: 52.0, x: 1415, y: 3320, z: 0.93, r: 0.6 },
  { t: 53.0, x: 1420, y: 3540, z: 0.96, r: 0.4 },
  { t: 54.3, x: 1430, y: 3560, z: 1.0, r: 0.6 },
  { t: 55.5, x: 1060, y: 3960, z: 0.85, r: 0 },
  { t: 57.6, x: 1000, y: 3920, z: 0.95, r: -0.4 },
  { t: 58.8, x: 1560, y: 3570, z: 0.86, r: 0 },
  { t: 61.8, x: 1570, y: 3550, z: 0.92, r: 0.3 },
  { t: 63.0, x: 1480, y: 3050, z: 0.75, r: 0 },
  { t: 64.8, x: 1700, y: 2800, z: 0.6, r: -0.5 },
  { t: 66.2, x: 1900, y: 3000, z: 0.82, r: 0 },
  { t: 72, x: 1900, y: 2990, z: 1.3, r: 0.6 },
]);
// impact kicks (stamp slams): screen-space shake decaying over ~7 frames
const KICKS = [11.66, 51.06];
const handheld = (t: number) => ({
  x: Math.sin(t * 1.31) * 2.4 + Math.sin(t * 2.87 + 1.3) * 1.3,
  y: Math.cos(t * 1.07) * 2.0 + Math.sin(t * 2.41 + 0.4) * 1.2,
  r: Math.sin(t * 0.93) * 0.12,
});
const kick = (t: number) => {
  let k = 0;
  for (const kt of KICKS) {
    const f = (t - kt) * FPS;
    if (f >= 0 && f < 8) k += (f % 2 === 0 ? 1 : -1) * 7 * (1 - f / 8);
  }
  return k;
};
const camRaw = (t: number): Cam => camera(t);

// ================= voyage tracks =================
const actualToCV = (map.routeActual as unknown as Pt[]).slice(0, 12);
const wander: Pt[] = [[1790, 2160], [1813, 2268], [1758, 2197], [1676, 2162], [1588, 2163], [1505, 2169], [1419, 2178], [1337, 2215], [1285, 2288], [1263, 2372], [1244, 2452], [1228, 2539], [1246, 2626], [1306, 2693], [1380, 2738], [1451, 2781], [1530, 2819], [1545, 3060], [1490, 3350], [1310, 3660], [1090, 3850], [940, 3890]];
const voyagePts = smoothPath([...actualToCV, ...wander], 14);
const voyage = track(voyagePts);
const nearestU = (p: Pt) => {
  let best = 0, bd = 1e12;
  voyagePts.forEach((q, i) => {
    const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
    if (d < bd) { bd = d; best = i; }
  });
  return voyage.cum[best] / voyage.len;
};
const uMal = nearestU([P.mallorca[0], P.mallorca[1] + 40]);
const uCV = nearestU([1828, 2030]);
const uLost0 = nearestU([1813, 2268]);
const uLost1 = nearestU([1545, 3060]);
// one smooth progress curve for the whole voyage (eases out of Istanbul, into Rio)
const VOY_KEYS: number[][] = [[13.6, 0], [20.2, uMal], [22.6, uCV], [25.9, uLost1], [28.4, 1]];
const voyageEase = makeEase(VOY_KEYS);
const voyageU = (t: number) => (t <= VOY_KEYS[0][0] ? 0 : t >= 28.4 ? 1 : clamp(voyageEase(t)));
const planned = track(smoothPath([...(map.routeActual as unknown as Pt[]).slice(0, 12), ...(map.routePlanned as unknown as Pt[]).slice(1)], 12));
const coastal = track(smoothPath(map.coastal as Pt[], 14));
const slaveArc = track(smoothPath([[3114, 2450], [2700, 2500], [2100, 2700], [1550, 3050], [1170, 3360]], 20));
const exitTrack = track(smoothPath([[940, 3890], [1080, 3975], [1350, 4130], [1700, 4320], [2100, 4560]], 16));
const homeTrack = track(smoothPath([[1300, 3140], [1500, 2900], [1800, 2500], [2150, 2050], [2500, 1550], [2700, 1150]], 16));

// ================= map layer =================
type Label = { text: string; x: number; y: number; fs: number; kind: "city" | "sea" | "land"; hi?: [number, number]; ls?: number; rot?: number };
const LABELS: Label[] = [
  { text: "ATLANTIC  OCEAN", x: 1700, y: 1450, fs: 110, kind: "sea", ls: 40, rot: -8 },
  { text: "MEDITERRANEAN", x: 3700, y: 930, fs: 64, kind: "sea", ls: 22, rot: -6 },
  { text: "AFRICA", x: 3700, y: 2300, fs: 170, kind: "land", ls: 60 },
  { text: "BRAZIL", x: 560, y: 3050, fs: 120, kind: "land", ls: 40 },
  { text: "EUROPE", x: 3500, y: 380, fs: 110, kind: "land", ls: 40 },
  { text: "INDIAN  OCEAN", x: 5100, y: 3400, fs: 90, kind: "sea", ls: 30, rot: -10 },
  { text: "Istanbul", x: P.istanbul[0], y: P.istanbul[1] - 70, fs: 46, kind: "city", hi: [8.6, 12] },
  { text: "Basra", x: P.basra[0], y: P.basra[1] - 70, fs: 46, kind: "city", hi: [9.85, 12] },
  { text: "Mallorca", x: P.mallorca[0], y: P.mallorca[1] - 80, fs: 44, kind: "city", hi: [20.3, 21.8] },
  { text: "Cádiz", x: P.cadiz[0] - 20, y: P.cadiz[1] - 64, fs: 36, kind: "city" },
  { text: "Cape Verde", x: P.capeverde[0], y: P.capeverde[1] - 90, fs: 44, kind: "city", hi: [21.9, 23.4] },
  { text: "Rio de Janeiro", x: P.rio[0] - 30, y: P.rio[1] + 80, fs: 40, kind: "city" },
  { text: "Salvador", x: P.salvador[0] - 200, y: P.salvador[1] + 10, fs: 40, kind: "city", hi: [50.2, 53] },
  { text: "BIGHT OF BENIN", x: 3130, y: 2640, fs: 70, kind: "city", hi: [46.3, 50.6], ls: 6 },
  { text: "Recife", x: P.recife[0] - 170, y: P.recife[1] + 10, fs: 40, kind: "city" },
];

const MapLayer: React.FC<{ t: number; ghost?: boolean }> = ({ t, ghost }) => {
  const plannedU = ramp(t, 13.2, 14.9);
  const plannedO = 1 - ramp(t, 15.6, 16.6);
  const vu = voyageU(t);
  const coastU = ramp(t, 58.6, 61.6);
  const arcU = ramp(t, 46.5, 48.9);
  const arcO = 1 - ramp(t, 50.0, 50.8);
  return (
    <svg width={EX.x1 - EX.x0} height={EX.y1 - EX.y0} viewBox={`${EX.x0} ${EX.y0} ${EX.x1 - EX.x0} ${EX.y1 - EX.y0}`} style={{ position: "absolute", left: EX.x0, top: EX.y0 }}>
      <defs>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="14" stroke={SEPIA} strokeWidth="1.6" opacity="0.28" />
        </pattern>
      </defs>
      <path d={map.graticule} fill="none" stroke={SEPIA} strokeWidth={2} opacity={0.32} strokeDasharray="10 8" />
      {!ghost && [64, 44, 28, 16].map((w, i) => (
        <path key={i} d={map.land} fill="none" stroke={SEPIA} strokeWidth={w} opacity={0.05 + i * 0.03} strokeLinejoin="round" />
      ))}
      <path d={map.land} fill="#b89462" fillOpacity={0.38} />
      {!ghost && <path d={map.land} fill="url(#hatch)" />}
      <path d={map.land} fill="none" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" opacity={0.85} />
      {/* planned route around Africa */}
      <path d={partial(planned, plannedU)} fill="none" stroke={RED} strokeWidth={14} strokeDasharray="34 26" strokeLinecap="round" opacity={0.85 * plannedO} />
      {/* actual voyage, drawn behind the ship */}
      <path d={partial(voyage, vu)} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="16 14" strokeLinecap="round" opacity={0.8 * (1 - ramp(t, 63.6, 65.0))} />
      {/* slave-trade arc West Africa → Bahia */}
      <path d={partial(slaveArc, arcU)} fill="none" stroke={RED} strokeWidth={22} strokeDasharray="56 30" opacity={0.9 * arcO} strokeLinecap="round" />
      {arcU > 0.98 && (() => {
        const { p, ang } = at(slaveArc, 1);
        return <path d="M20 0 L-80 -46 L-80 46 Z" fill={RED} opacity={arcO * ramp(t, 48.8, 49)} transform={`translate(${p[0]} ${p[1]}) rotate(${(ang * 180) / Math.PI})`} />;
      })()}
      {/* coastal teaching route */}
      <path d={partial(coastal, coastU)} fill="none" stroke={GOLD} strokeWidth={10} strokeLinecap="round" opacity={0.95 * (1 - ramp(t, 62.6, 63.8))} />
      {/* labels */}
      {LABELS.map((l, i) => {
        const hi = l.hi ? win(t, l.hi[0], l.hi[1], 0.3, 0.6) : 0;
        const fs = l.fs * (1 + hi * 0.45);
        const color = l.kind === "city" ? INK : SEPIA;
        const op = l.kind === "sea" ? 0.55 : l.kind === "land" ? 0.35 : 0.85;
        return (
          <text key={i} x={l.x} y={l.y} fontSize={fs} textAnchor="middle" fill={color} opacity={op + hi * 0.15}
            fontFamily={l.kind === "city" ? "Special Elite" : "Playfair Display"} fontWeight={l.kind === "land" ? 700 : 400}
            letterSpacing={l.ls ?? 2} transform={l.rot ? `rotate(${l.rot} ${l.x} ${l.y})` : undefined}
            style={{ paintOrder: "stroke" }} stroke={l.kind === "city" ? "rgba(232,214,176,.85)" : "none"} strokeWidth={l.kind === "city" ? 10 : 0}>
            {l.text}
          </text>
        );
      })}
    </svg>
  );
};

// ================= world (everything that lives on the map) =================
const place = (x: number, y: number, child: React.ReactNode, key?: string | number) => (
  <div key={key} style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>{child}</div>
);
const centered = (child: React.ReactNode) => (
  <div style={{ position: "absolute", transform: "translate(-50%,-50%)" }}>{child}</div>
);

const Storm: React.FC<{ t: number; x: number; y: number; on: number; scale?: number; seed?: number }> = ({ t, x, y, on, scale = 1, seed = 0 }) => {
  if (on <= 0.01) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const a = t * (0.25 + i * 0.07) + seed + i * 2.1;
        const r = 120 * scale;
        return place(x + Math.cos(a) * r - 450 * scale, y + Math.sin(a) * r * 0.6 - 300 * scale,
          <Img src={staticFile(`imam/tex/storm${i}.png`)} style={{ width: 900 * scale, height: 600 * scale, opacity: on * 0.85, position: "absolute" }} />, i);
      })}
      {/* rain */}
      {place(x - 380 * scale, y - 260 * scale,
        <svg width={760 * scale} height={520 * scale} style={{ position: "absolute", opacity: on * 0.55 }}>
          {Array.from({ length: 70 }).map((_, i) => {
            const rx = hash(i + seed * 10) * 760 * scale;
            const ry = ((hash(i * 3.3 + seed) * 520 + t * 900) % 520) * scale;
            return <line key={i} x1={rx} y1={ry} x2={rx - 14 * scale} y2={ry + 40 * scale} stroke="#3d3a40" strokeWidth={2.4 * scale} />;
          })}
        </svg>, "rain")}
    </>
  );
};

type Obj = { a: number; b: number; hero: boolean; keep?: number; render: (t: number, alpha: number) => React.ReactNode };
const OBJECTS: Obj[] = [
  // title
  { a: 4.75, b: 7.45, hero: true, render: (t, al) => (
    <Card t={t} tIn={4.75} x={1060} y={3200} w={800} rot={-2} alpha={al} pad={50}>
      <div style={{ border: `4px double ${INK}`, padding: "34px 20px", textAlign: "center", color: INK }}>
        <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 40, letterSpacing: 18, color: SEPIA }}>A TRUE STORY</div>
        <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 132, lineHeight: 1.0, marginTop: 18 }}>THE LOST</div>
        <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 168, lineHeight: 1.0, color: RED }}>IMAM</div>
        <div style={{ fontFamily: "Special Elite", fontSize: 34, marginTop: 22, color: SEPIA, whiteSpace: "nowrap" }}>Istanbul → Rio de Janeiro · 1860s</div>
      </div>
    </Card>) },
  // imam register card
  { a: 15.35, b: 19.95, hero: true, render: (t, al) => {
    const ar = ramp(t, 17.45, 18.9);
    return (
      <Card t={t} tIn={15.35} x={3860} y={1110} w={840} rot={1.5} alpha={al}>
        <div style={{ textAlign: "center", color: INK }}>
          <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 38, letterSpacing: 10, color: SEPIA }}>IMAM · OTTOMAN NAVY</div>
          <div style={{ height: 3, background: INK, opacity: 0.6, margin: "22px 30px" }} />
          <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 112, direction: "rtl", lineHeight: 1.35,
            clipPath: `inset(-20% 0 -20% ${100 - ar * 100}%)` }}>عبد الرحمن البغدادي</div>
          <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 68, lineHeight: 1.08, marginTop: 6,
            opacity: ramp(t, 17.5, 17.9) }}>Abdurrahman<br />al‑Baghdadi</div>

        </div>
      </Card>);
  } },
  // Rio naval dock photo
  { a: 28.1, b: 32.0, hero: true, keep: 41, render: (t, al) => (
    <Card t={t} tIn={28.1} x={960} y={3640} w={800} rot={-3} alpha={al} bg="white" pad={30}>
      <Photo src="imam/img/rio.jpg" ratio={1430 / 923} caption="Rio de Janeiro · 1862" fs={40} />
    </Card>) },
  // Pedro II
  { a: 32.15, b: 33.9, hero: true, keep: 41, render: (t, al) => (
    <Card t={t} tIn={32.15} x={1290} y={3900} w={500} rot={4} alpha={al} bg="white" pad={26}>
      <Photo src="imam/img/pedro2.jpg" ratio={0.78} caption="Emperor Pedro II · 1865" fs={36} />
    </Card>) },
  // Eu Muslim
  { a: 35.3, b: 41.1, hero: true, render: (t, al) => (
    <Card t={t} tIn={35.3} x={1770} y={3960} w={820} rot={-1.5} alpha={al} pad={56}>
      <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 178, lineHeight: 1.02, color: INK, textAlign: "center" }}>
        <span style={{ opacity: ramp(t, 36.1, 36.3) }}>“Eu</span><br />
        <span style={{ opacity: ramp(t, 36.45, 36.65) }}>Muslim.”</span>
      </div>
      <div style={{ height: 6, background: RED, margin: "30px auto 0", width: `${ramp(t, 37.7, 38.5) * 70}%`, opacity: 0.85 }} />
    </Card>) },
  // noon prayer
  { a: 41.3, b: 45.0, hero: true, render: (t, al) => {
    const bow = ramp(t, 43.35, 43.85) * (1 - ramp(t, 44.7, 45.1));
    const dockIn = (i: number) => ramp(t, 42.5 + i * 0.13, 42.75 + i * 0.13);
    return (
      <Card t={t} tIn={41.3} x={2560} y={4140} w={860} rot={1.2} alpha={al} pad={40}>
        <div style={{ textAlign: "center", color: INK }}>
          <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 150, lineHeight: 1.1 }}>الظهر</div>
          <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 40, letterSpacing: 16, color: SEPIA, marginTop: -4 }}>DHUHR</div>
        </div>
        <svg viewBox="0 20 780 280" style={{ width: "100%", marginTop: 30, overflow: "visible" }}>
          {/* ship deck (left) */}
          <path d="M10 210 L360 210 L330 262 Q190 278 40 262 Z" fill={INK} />
          <line x1={115} y1={210} x2={115} y2={20} stroke={INK} strokeWidth={4} opacity={0.6} />
          <line x1={205} y1={210} x2={205} y2={30} stroke={INK} strokeWidth={4} opacity={0.6} />
          {/* water */}
          <path d="M0 284 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke={SEPIA} strokeWidth={3} fill="none" />
          {/* dock (right) */}
          <rect x={420} y={204} width={360} height={14} fill={INK} />
          {[440, 520, 600, 680, 760].map((x) => <rect key={x} x={x} y={218} width={10} height={70} fill={INK} />)}
          {[70, 160, 250].map((x, i) => <Figure key={i} x={x} base={210} h={140} bow={bow} face={1} cap />)}
          {[470, 560, 650, 740].map((x, i) => (
            <g key={i} opacity={dockIn(i)}><Figure x={x} base={204} h={140} bow={bow} face={1} /></g>
          ))}
        </svg>
      </Card>);
  } },
  // Malês
  { a: 45.2, b: 46.7, hero: true, render: (t, al) => (
    <Card t={t} tIn={45.2} x={2700} y={3470} w={800} rot={-2} alpha={al} pad={46}>
      <div style={{ textAlign: "center", color: INK }}>
        <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 170, lineHeight: 1 }}>Malês</div>
        <div style={{ fontFamily: "Special Elite", fontSize: 40, marginTop: 20, color: SEPIA }}>from Yoruba <i>imale</i></div>
      </div>
    </Card>) },
  // Earle painting
  { a: 52.4, b: 54.6, hero: true, render: (t, al) => (
    <Card t={t} tIn={52.4} x={1430} y={3560} w={780} rot={2.5} alpha={al} bg="white" pad={28}>
      <Photo src="imam/img/earle_rio.jpg" ratio={736 / 641} caption="Rio de Janeiro, c. 1822 · Augustus Earle" fs={34} tone={0.25} />
    </Card>) },
  // teaching
  { a: 58.4, b: 62.3, hero: true, render: (t, al) => {
    const wr = ramp(t, 59.4, 61.4);
    return (
      <Card t={t} tIn={58.4} x={1600} y={3560} w={860} rot={-1.5} alpha={al} pad={50}>
        <div style={{ textAlign: "center", color: INK }}>
          <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 150, direction: "rtl", lineHeight: 1.3, whiteSpace: "nowrap",
            clipPath: `inset(-20% 0 -20% ${100 - wr * 100}%)` }}>ا ب ت ث ج</div>
          <div style={{ height: 3, background: INK, opacity: 0.5, margin: "18px 40px" }} />
          <div style={{ fontFamily: "Special Elite", fontSize: 44, color: SEPIA }}>c. 1866 – 1869</div>
        </div>
      </Card>);
  } },
  // book
  { a: 65.7, b: 73, hero: true, render: (t, al) => (
    <Card t={t} tIn={65.7} x={1900} y={2990} w={520} rot={-4} alpha={al} bg="none">
      <Book w={520} />
    </Card>) },
];

// ---------- precomputed, smoothed motion in viewer time (removes every speed hiccup) ----------
const shipRaw = (tOld: number, side: number): Pt => {
  const off: Pt = [side * 26, side * 34];
  const p = tOld < 55.2 ? at(voyage, voyageU(tOld)).p : at(exitTrack, ramp(tOld, 55.2, 58.8)).p;
  return [p[0] + off[0], p[1] + off[1]];
};
const NF = DURATION_S * FPS + 2;
const gauss = (arr: number[], sigma: number) => {
  const R = Math.ceil(sigma * 3);
  const w = Array.from({ length: 2 * R + 1 }, (_, i) => Math.exp(-((i - R) ** 2) / (2 * sigma * sigma)));
  return arr.map((_, i) => {
    let a = 0, ws = 0;
    for (let k = -R; k <= R; k++) {
      const j = Math.min(arr.length - 1, Math.max(0, i + k));
      a += arr[j] * w[k + R]; ws += w[k + R];
    }
    return a / ws;
  });
};
const OLD_T = Array.from({ length: NF }, (_, f) => WARP(f / FPS));
const CAM_RAW = OLD_T.map((t) => camRaw(t));
const CAM_S = {
  x: gauss(CAM_RAW.map((c) => c.x), 7), y: gauss(CAM_RAW.map((c) => c.y), 7),
  lz: gauss(CAM_RAW.map((c) => Math.log(c.z)), 7), r: gauss(CAM_RAW.map((c) => c.r), 7),
};
const SH = [0, 1].map((side) => {
  const raw = OLD_T.map((t, f) => shipRaw(side ? WARP(f / FPS - 0.3) : t, side));
  return { x: gauss(raw.map((p) => p[0]), 6), y: gauss(raw.map((p) => p[1]), 6) };
});
const sample = (arr: number[], f: number) => {
  const i = Math.max(0, Math.min(arr.length - 2, Math.floor(f)));
  const u = f - i;
  return arr[i] * (1 - u) + arr[i + 1] * u;
};
const camFrame = (f: number): Cam => ({ x: sample(CAM_S.x, f), y: sample(CAM_S.y, f), z: Math.exp(sample(CAM_S.lz, f)), r: sample(CAM_S.r, f) });
const shipFrame = (side: number, f: number): Pt => [sample(SH[side].x, f), sample(SH[side].y, f)];

const World: React.FC<{ t: number; ghost?: boolean; sh1: Pt; sh2: Pt; clean?: boolean }> = ({ t, ghost, sh1, sh2, clean }) => {
  // ships
  const ship1 = { p: sh1 }, ship2 = { p: sh2 };
  const stormRock = 3 + 9 * Math.max(win(t, 19.8, 21.6), win(t, 21.4, 23.6), win(t, 23.1, 25.8) * 0.6);
  const shipO = 1 - ramp(t, 57.8, 58.8);
  const shipSize = 150;
  const home = ramp(t, 62.4, 66.0) * 0.55;
  const homeP = at(homeTrack, home).p;
  const dim = Math.max(...OBJECTS.map((o) => (o.hero ? win(t, o.a + 0.05, o.b, 0.45, 0.5) : 0)));
  return (
    <>
      <MapLayer t={t} ghost={ghost} />
      {!ghost && (
        <>
          {/* pins */}
          {place(P.istanbul[0], P.istanbul[1], <Pin t={t} on={win(t, 8.5, 15.8)} pulse={win(t, 9.0, 9.6, 0.1, 0.4)} />, "pI")}
          {place(P.basra[0], P.basra[1], <Pin t={t} on={win(t, 9.85, 15.8)} pulse={win(t, 9.9, 10.5, 0.1, 0.4)} />, "pB")}
          {place(P.rio[0], P.rio[1], <Pin t={t} on={Math.max(win(t, 3.0, 7.6), ramp(t, 28.0, 28.3) * (1 - ramp(t, 63.6, 64.6)))}
            pulse={Math.max(win(t, 56.9, 58.2, 0.15, 0.6), win(t, 3.2, 4.2, 0.2, 0.5))} />, "pR")}
          {place(P.salvador[0], P.salvador[1], <Pin t={t} on={Math.max(win(t, 50.0, 54.5), ramp(t, 60.0, 60.3) * (1 - ramp(t, 62.8, 63.8)))} size={22} />, "pS")}
          {place(P.recife[0], P.recife[1], <Pin t={t} on={ramp(t, 61.2, 61.5) * (1 - ramp(t, 62.8, 63.8))} size={22} />, "pRe")}
          {place(P.lagos[0], P.lagos[1], <Pin t={t} on={win(t, 46.4, 52)} size={22} />, "pL")}
          {/* Suez stamp */}
          {place(P.suez[0], P.suez[1], (
            <>
              {t > 11.62 && (
                <svg width={260} height={260} viewBox="-130 -130 260 260" style={{ position: "absolute", left: -130, top: -130, overflow: "visible", opacity: 1 - ramp(t, 15.3, 16) }}>
                  <path d="M-80 -80 L80 80 M80 -80 L-80 80" stroke={RED} strokeWidth={26} strokeLinecap="round"
                    strokeDasharray={240} strokeDashoffset={240 * (1 - ramp(t, 11.62, 11.85))} />
                </svg>
              )}
              <div style={{ position: "absolute", left: -150, top: 230, opacity: 1 - ramp(t, 15.3, 16) }}>
                <Stamp t={t} tIn={11.9} text="SUEZ CANAL" sub="OPENS 1869" fs={74} rot={-7} />
              </div>
            </>
          ), "suez")}
          {/* hook ship in the storm */}
          <Storm t={t} x={1700} y={2080} on={0.8 * (1 - ramp(t, 2.0, 3.6))} scale={1.1} seed={0.5} />
          {t < 5.5 && place(1760 - t * 30, 2290 + t * 12, centered(<Ship t={t} size={190} rock={12} seed={1} opacity={1 - ramp(t, 4.4, 5.2)} />), "hook")}
          {/* voyage ships */}
          {t > 7.0 && place(ship2.p[0], ship2.p[1], centered(<Ship t={t} size={shipSize} rock={stormRock} seed={2.2} opacity={shipO * ramp(t, 7.2, 7.8)} />), "s2")}
          {t > 7.0 && place(ship1.p[0], ship1.p[1], centered(<Ship t={t} size={shipSize} rock={stormRock} seed={0.7} opacity={(t < 55 ? 1 : shipO) * ramp(t, 7.2, 7.8)} />), "s1")}
          {/* homeward ship */}
          {t > 62.3 && t < 66 && place(homeP[0], homeP[1], centered(<Ship t={t} size={230} rock={3} seed={5} opacity={ramp(t, 62.3, 62.8) * (1 - ramp(t, 63.8, 65.2))} />), "home")}
          <Storm t={t} x={P.mallorca[0]} y={P.mallorca[1]} on={win(t, 19.7, 21.9, 0.5, 0.7)} scale={0.9} seed={3} />
          <Storm t={t} x={P.capeverde[0] - 40} y={P.capeverde[1] + 80} on={win(t, 21.4, 24.0, 0.5, 0.9)} scale={1.0} seed={7} />
          {/* lost at sea compass */}
          {place(1560, 2480, centered(
            <div style={{ opacity: win(t, 23.1, 25.9, 0.4, 0.6) * 0.9 }}>
              <Compass size={300} spin={t * 140 + Math.sin(t * 3) * 60} />
            </div>), "compass")}
          {/* 1835 stamp */}
          {place(1460, 3290, (
            <div style={{ opacity: 1 - ramp(t, 54.3, 55.2) }}>
              <Stamp t={t} tIn={51.0} text="1835" sub="SALVADOR · BAHIA" fs={140} rot={-8} />
            </div>
          ), "st1835")}
          {/* objects that are no longer the hero sit under the dim layer */}
          {!clean && OBJECTS.filter((o) => t >= o.b && t < (o.keep ?? o.b + 0.6) + 0.6).map((o, i) => <React.Fragment key={"p" + i}>{o.render(t, o.keep ? 0.85 * (1 - ramp(t, o.keep, o.keep + 0.6)) : Math.max(0, 0.15 - 0.15 * ramp(t, o.b, o.b + 0.6)))}</React.Fragment>)}
          {/* dim everything except the current hero */}
          <div style={{ position: "absolute", left: EX.x0, top: EX.y0, width: EX.x1 - EX.x0, height: EX.y1 - EX.y0, background: "#160d05", opacity: clean ? 0 : dim * 0.42 }} />
          {!clean && OBJECTS.filter((o) => t >= o.a - 0.1 && t < o.b).map((o, i) => <React.Fragment key={"h" + i}>{o.render(t, 1 - 0.15 * ramp(t, o.b - 0.5, o.b) - (o.keep ? 0 : 0.85 * ramp(t, o.b - 0.5, o.b + 0.6)))}</React.Fragment>)}
        </>
      )}
    </>
  );
};

// soft parallax clouds above the world
const CLOUDS: { x: number; y: number; s: number; i: number }[] = [
  { x: 2300, y: 1500, s: 1.4, i: 0 }, { x: 3500, y: 850, s: 1.1, i: 1 }, { x: 1300, y: 2950, s: 1.3, i: 2 }, { x: 2100, y: 3700, s: 1.6, i: 3 },
  { x: 4600, y: 1700, s: 1.2, i: 1 }, { x: 2950, y: 2400, s: 1.5, i: 0 }, { x: 1800, y: 2000, s: 1.0, i: 2 }, { x: 1150, y: 4300, s: 1.3, i: 3 },
  { x: 3900, y: 2700, s: 1.8, i: 0 }, { x: 600, y: 3600, s: 1.1, i: 1 }, { x: 2600, y: 4500, s: 1.4, i: 2 },
];

const worldTransform = (c: Cam, extra = { x: 0, y: 0, r: 0 }) =>
  `translate(${FOCUS_X + extra.x}px, ${FOCUS_Y + extra.y}px) rotate(${c.r + extra.r}deg) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`;

// The map 'footage': the continuous world, camera and grade, used as shots inside the multi-scene short.
export const MapShot: React.FC<{ frame: number; clean?: boolean }> = ({ frame, clean }) => {
  const tNew = frame / FPS;
  const t = WARP(tNew);
  const c = camFrame(frame);
  const hh = handheld(t);
  const k = kick(t);
  const extra = { x: hh.x + k, y: hh.y - k * 0.4, r: hh.r };
  const flash = Math.max(
    ...[0.12, 0.42, 20.05, 20.2, 21.5, 21.62].map((ft) => {
      const f = (t - ft) * FPS;
      return f >= 0 && f < 6 ? (1 - f / 6) * (ft === 0.42 || ft === 20.2 || ft === 21.62 ? 0.35 : 0.6) : 0;
    }),
  );
  const cloudPar = 1.35;
  return (
    <AbsoluteFill style={{ background: "#120b05", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: worldTransform(c, extra) }}>
        {/* the wooden desk the map lies on */}
        <div style={{ position: "absolute", left: -5000, top: -5000, width: map.W + 10000, height: map.H + 10000,
          backgroundImage: `url(${staticFile("mock/wood.jpg")})`, backgroundSize: "3200px 5200px", backgroundRepeat: "repeat" }} />
        {/* one big parchment sheet, far larger than anything the camera sees: no map edge is ever in frame */}
        <Img src={staticFile("imam/tex/parchment_big.jpg")} style={{ position: "absolute", left: EX.x0, top: EX.y0, width: EX.x1 - EX.x0, height: EX.y1 - EX.y0 }} />
        <World t={t} sh1={shipFrame(0, frame)} sh2={shipFrame(1, frame)} clean={clean} />
      </div>
      {/* parallax clouds (closer to the lens than the map) */}
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: worldTransform({ ...c, z: c.z * cloudPar }, extra) }}>
        {CLOUDS.map((cl, i) => (
          <Img key={i} src={staticFile(`imam/tex/cloud${cl.i}.png`)} style={{
            position: "absolute", left: cl.x / 1 - 450 * cl.s + (c.x * (cloudPar - 1)) / cloudPar * 0 , top: cl.y - 300 * cl.s,
            width: 900 * cl.s, height: 600 * cl.s, opacity: 0.3 * (1 - clamp((c.z - 0.6) / 0.5)) + 0.06,
            transform: `translate(${Math.sin(t * 0.07 + i) * 60}px, 0)`,
          }} />
        ))}
      </div>
      {!clean && (
        <>
      {/* light & grade */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 35% 25%, rgba(255,214,150,.20) 0%, rgba(255,214,150,0) 55%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 45%, rgba(10,5,0,.72) 100%)" }} />
      {/* "hidden": light closes in */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 52% 45%, rgba(0,0,0,0) 20%, rgba(8,4,0,.9) 70%)", opacity: win(t, 53.5, 55.4, 0.5, 0.9) }} />
      <AbsoluteFill style={{ background: "#fff8ea", opacity: flash * 0.6, mixBlendMode: "screen" }} />
      {/* night grade: darker, cooler shadows, warm pool of light on the hero (matches the illustrated scenes) */}
      {/* desk-lamp grade: warm pool of light, soft falloff */}
      <AbsoluteFill style={{ background: "#2a1608", opacity: 0.18, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 72% 46% at 45% 58%, rgba(255,196,120,.24) 0%, rgba(255,196,120,0) 72%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 62% at 50% 58%, rgba(0,0,0,0) 42%, rgba(10,4,0,.8) 100%)" }} />
        </>
      )}
      {clean && <AbsoluteFill style={{ background: "#fff8ea", opacity: flash * 0.25, mixBlendMode: "screen" }} />}
    </AbsoluteFill>
  );
};

// --- debug helpers for motion QA (not used in render) ---
export const __debug = (tNew: number) => {
  const f = tNew * FPS;
  return { t: WARP(tNew), c: camFrame(f), ship: shipFrame(0, f) };
};
export const __voy = { len: voyage.len, uMal, uCV, uLost0, uLost1 };

export const __ships = (tNew: number) => { const f = tNew * FPS; return [shipFrame(0, f), shipFrame(1, f)]; };
