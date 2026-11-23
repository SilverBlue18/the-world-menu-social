import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import map from "./mapdata.json";
import capsJson from "./captions.json";
import { FOCUS_X, FOCUS_Y, FPS, Pt, at, clamp, hash, makeCamera, partial, ramp, smoothPath, track, win, Cam } from "../imam/lib";
import { Card, INK, Photo, Pin, RED, SEPIA, Ship, Stamp } from "../imam/props";
import { TopCaptions, Cap } from "../shared/TopCaptions";
import { Watermark } from "../shared/Watermark";

// "Anthony the Turk": Anthony Jansen van Salee, New Amsterdam. House style: one continuous camera over a map on a desk.
export const SALEE_S = 87;
export const SALEE_AUDIO = "salee/mix.wav";
const EX = (map as unknown as { EX: { x0: number; y0: number; x1: number; y1: number } }).EX;
const P = map.pts as unknown as Record<string, Pt>;
const CAPS = capsJson as Cap[];

// ---------- word clock: every visual beat is pinned to the moment its word is spoken ----------
// the first HOOK_N caption groups are the hook; the story's word clock starts after it
const HOOK_N = 2;
const norm = (w: { t: string; s: number }) => ({ ...w, n: w.t.toLowerCase().replace(/[^a-z0-9']/g, "") });
const WORDS = CAPS.slice(HOOK_N).flatMap((c) => c.words).map(norm);
const HWORDS = CAPS.slice(0, HOOK_N).flatMap((c) => c.words).map(norm);
const hwt = (word: string) => { const h = HWORDS.find((w) => w.n === word); if (!h) throw new Error(`hook word not found: ${word}`); return h.s; };
const H = { dutch: hwt("dutch"), pirate: hwt("pirate"), admiral: hwt("admiral"), morocco: hwt("morocco"), and: hwt("and"), son: hwt("son"), america: hwt("america"), first: hwt("first") };
const wt = (word: string, nth = 1) => {
  const hits = WORDS.filter((w) => w.n === word);
  if (!hits[nth - 1]) throw new Error(`word not found: ${word} #${nth}`);
  return hits[nth - 1].s;
};
const T = {
  map: wt("map"), lists: wt("lists"), antoni: wt("antoni"), turck: wt("turck"), in1: wt("in", 1), his1: wt("his", 1),
  father: wt("father"), privateer: wt("privateer"), haarlem: wt("haarlem"), y1609: wt("1609"), south: wt("south"),
  shipwrecked: wt("shipwrecked"), lanzarote: wt("lanzarote"), rescued: wt("rescued"), another: wt("another"), sleyman: wt("sleyman"),
  joined: wt("joined", 1), algiers: wt("algiers", 2), muslim1: wt("muslim", 2), privateer2: wt("privateer", 2), captain: wt("captain"), algiersS: wt("algiers", 1), murad: wt("murad"),
  son1: wt("son", 1), sale: wt("sal", 1), then: wt("then", 2), amsterdam1: wt("amsterdam", 1), with1: wt("with", 1),
  grietje: wt("grietje"), amsterdam2: wt("amsterdam", 2), dutch4: wt("dutch", 3),
  muslim2: wt("muslim", 3), ottoman: wt("ottomans"),
  banished: wt("banished"), given: wt("given"), acres: wt("acres"), brooklyn: wt("brooklyn"), turks: wt("turk's"),
  y1674: wt("1674"), quaker: wt("quaker"), persecuted: wt("persecuted"), fined: wt("fined"),
  under: wt("under"), christians: wt("christians"), jews: wt("jews"), protected: wt("protected"),
  son2: wt("son", 2), written: wt("written"), maps: wt("maps"),
};

// ---------- where things lie on the map ----------
const S = {
  manatus: [690, 1690] as Pt, legend: [700, 2330] as Pt, title: [640, 1400] as Pt,
  jan: [4980, 520] as Pt, suleyman: [3900, 2230] as Pt, murad: [4900, 1760] as Pt, anthony: [4260, 2600] as Pt,
  grietje: [2860, 1000] as Pt, fort: [640, 1450] as Pt, turk: [1420, 1720] as Pt,
  island: [700, 1900] as Pt, quaker: [1460, 2380] as Pt, dhimma: [1450, 1760] as Pt,
  endMap: [560, 1700] as Pt, endLegend: [760, 2420] as Pt,
};
const LZ = P.lanzarote;

// ---------- camera ----------
const camera = makeCamera([
  // the hook: Haarlem, down to Salé, then across the ocean to America
  { t: 0, x: 4900, y: 860, z: 0.66, r: -1 },
  { t: H.pirate, x: 4860, y: 1050, z: 0.62, r: -0.5 },
  { t: H.morocco + 0.1, x: 4430, y: 2170, z: 0.8, r: 0.5 },
  { t: H.and, x: 4380, y: 2200, z: 0.84, r: 0.3 },
  { t: (H.son + H.america) / 2, x: 2450, y: 1800, z: 0.3, r: 0 },
  { t: H.america + 0.15, x: 700, y: 1820, z: 0.78, r: 0 },
  { t: T.in1 + 0.35, x: S.manatus[0] + 10, y: S.manatus[1] - 30, z: 1.06, r: -2 },
  { t: T.map + 0.9, x: S.manatus[0] + 10, y: S.manatus[1], z: 0.98, r: -1 },
  { t: T.lists + 0.45, x: S.legend[0], y: S.legend[1] - 40, z: 1.05, r: 0 },
  { t: T.turck - 0.05, x: S.legend[0], y: S.legend[1] - 10, z: 1.14, r: 0.5 },
  { t: T.turck + 0.45, x: S.title[0], y: S.title[1], z: 1.0, r: 0 },
  { t: T.his1 + 0.45, x: S.title[0], y: S.title[1] - 10, z: 1.05, r: 0.3 },
  { t: T.his1 + 1.35, x: 2750, y: 1250, z: 0.28, r: 0 },
  { t: T.his1 + 2.25, x: S.jan[0], y: S.jan[1] + 110, z: 0.98, r: 0.5 },
  { t: T.y1609 - 0.1, x: S.jan[0] + 10, y: S.jan[1] + 140, z: 1.02, r: 0.3 },
  { t: T.y1609 + 0.6, x: 4930, y: 980, z: 0.74, r: 0 },
  { t: T.shipwrecked - 0.4, x: 4350, y: 1850, z: 0.5, r: 0 },
  { t: T.lanzarote + 0.1, x: LZ[0] + 40, y: LZ[1] - 50, z: 0.9, r: -0.5 },
  { t: T.another - 0.2, x: LZ[0] + 80, y: LZ[1] - 120, z: 0.86, r: 0 },
  { t: T.another + 0.4, x: S.suleyman[0] + 10, y: S.suleyman[1] + 90, z: 0.98, r: 0.5 },
  { t: T.privateer2, x: S.suleyman[0] + 20, y: S.suleyman[1] + 120, z: 0.98, r: 0.3 },
  { t: T.joined - 0.25, x: S.suleyman[0] + 25, y: S.suleyman[1] + 130, z: 1.06, r: 0.1 },
  { t: T.joined + 1.0, x: 4450, y: 2250, z: 0.55, r: 0 },
  { t: T.muslim1 + 0.3, x: S.murad[0], y: S.murad[1] + 30, z: 1.0, r: -0.5 },
  { t: T.son1 - 0.4, x: S.murad[0] - 10, y: S.murad[1] + 40, z: 1.05, r: -0.3 },
  { t: T.son1 + 0.35, x: S.anthony[0], y: S.anthony[1] - 60, z: 0.95, r: -0.4 },
  { t: T.then + 0.1, x: S.anthony[0] + 10, y: S.anthony[1] - 60, z: 0.98, r: -0.2 },
  { t: T.amsterdam1 + 0.3, x: 4640, y: 1500, z: 0.46, r: 0 },
  { t: T.with1 + 0.1, x: 5000, y: 950, z: 0.66, r: 0 },
  { t: T.grietje + 0.1, x: S.grietje[0], y: S.grietje[1] + 40, z: 0.6, r: 0.3 },
  { t: T.grietje + 1.4, x: 2300, y: 1200, z: 0.45, r: 0 },
  { t: T.amsterdam2 + 0.7, x: S.fort[0] + 40, y: S.fort[1] + 50, z: 0.95, r: 0 },
  { t: T.dutch4 - 0.3, x: S.fort[0], y: S.fort[1] + 30, z: 1.03, r: 0.4 },
  { t: T.dutch4 + 0.3, x: S.turk[0], y: S.turk[1], z: 1.0, r: -0.4 },
  { t: T.banished - 1.3, x: S.turk[0] + 10, y: S.turk[1] + 10, z: 1.06, r: -0.2 },
  { t: T.banished - 0.6, x: S.island[0], y: S.island[1] - 10, z: 0.93, r: 0.3 },
  { t: T.brooklyn, x: S.island[0] + 10, y: S.island[1], z: 0.98, r: 0.5 },
  { t: T.y1674 - 0.3, x: S.island[0] + 10, y: S.island[1] + 10, z: 1.03, r: 0.2 },
  { t: T.y1674 + 0.35, x: S.quaker[0], y: S.quaker[1] - 20, z: 1.0, r: -0.3 },
  { t: T.under - 0.3, x: S.quaker[0] + 10, y: S.quaker[1] - 10, z: 1.05, r: 0 },
  { t: T.under + 0.35, x: S.dhimma[0], y: S.dhimma[1], z: 1.0, r: -0.3 },
  { t: T.son2 - 0.4, x: S.dhimma[0] + 10, y: S.dhimma[1] + 10, z: 1.06, r: 0 },
  { t: T.son2 + 0.6, x: 660, y: 2060, z: 0.74, r: 0 },
  { t: SALEE_S, x: 668, y: 2080, z: 0.86, r: 0.4 },
]);
const KICKS = [T.shipwrecked + 0.05, T.banished + 0.05];
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

// ---------- the voyages: Haarlem → Lanzarote (wreck) → Algiers (with Süleyman) → Salé → Amsterdam → New Amsterdam ----------
const legs = [map.rHL, map.rLA, map.r2, map.r3, map.r4].map((r) => track(smoothPath(r as unknown as Pt[], 14)));
const ATL = 4; // the Atlantic crossing, inked in red
const teaserEU = track(smoothPath([...(map.r3 as unknown as Pt[])].reverse(), 14));
const teaserAtl = track(smoothPath(map.teaserAtl as unknown as Pt[], 14));
const LEG_T: [number, number][] = [
  [T.y1609 + 0.1, T.lanzarote + 0.1], [T.joined - 0.2, T.muslim1 + 0.1], [T.son1 - 0.2, T.sale + 0.5], [T.sale + 0.6, T.with1 + 0.1], [T.with1 + 0.2, T.amsterdam2 + 0.9],
];
// trapezoid speed profile: ease in over the first quarter, cruise, ease out over the last quarter
const legEase = (u: number) => {
  const x = clamp(u), A = 0.25, vmax = 1 / (1 - A);
  if (x < A) return (vmax * x * x) / (2 * A);
  if (x > 1 - A) return 1 - (vmax * (1 - x) * (1 - x)) / (2 * A);
  return vmax * (x - A / 2);
};
const legU = (i: number, t: number) => legEase((t - LEG_T[i][0]) / (LEG_T[i][1] - LEG_T[i][0]));
const shipRaw = (t: number): Pt => {
  for (let i = 0; i < legs.length; i++) {
    if (t < LEG_T[i][0]) return i === 0 ? at(legs[0], 0).p : at(legs[i - 1], 1).p;
    if (t <= LEG_T[i][1]) return at(legs[i], legU(i, t)).p;
  }
  return at(legs[legs.length - 1], 1).p;
};
// the wreck: Jan's ship founders off Lanzarote; Süleyman's ship comes in from the east and takes over the voyage
const WRECK = (t: number) => ramp(t, T.shipwrecked - 0.1, T.shipwrecked + 1.4);
const RESCUE_FROM: Pt = [LZ[0] + 520, LZ[1] - 300];
const rescueU = (t: number) => legEase((t - (T.rescued - 0.3)) / 1.6);
const rescuePos = (t: number): Pt => { const u = rescueU(t), e = at(legs[1], 0).p; return [RESCUE_FROM[0] + (e[0] - RESCUE_FROM[0]) * u, RESCUE_FROM[1] + (e[1] - RESCUE_FROM[1]) * u]; };
const SHIP_ON = (t: number) => ramp(t, T.y1609 - 0.4, T.y1609) * (1 - ramp(t, T.amsterdam2 + 1.0, T.amsterdam2 + 1.6));

// ---------- precomputed, smoothed motion (no speed hiccups) ----------
const NF = SALEE_S * FPS + 2;
const gauss = (arr: number[], sigma: number) => {
  const R = Math.ceil(sigma * 3);
  const w = Array.from({ length: 2 * R + 1 }, (_, i) => Math.exp(-((i - R) ** 2) / (2 * sigma * sigma)));
  return arr.map((_, i) => {
    let a = 0, ws = 0;
    for (let k = -R; k <= R; k++) { const j = Math.min(arr.length - 1, Math.max(0, i + k)); a += arr[j] * w[k + R]; ws += w[k + R]; }
    return a / ws;
  });
};
const CAM_RAW = Array.from({ length: NF }, (_, f) => camera(f / FPS));
const CAM_S = {
  x: gauss(CAM_RAW.map((c) => c.x), 7), y: gauss(CAM_RAW.map((c) => c.y), 7),
  lz: gauss(CAM_RAW.map((c) => Math.log(c.z)), 7), r: gauss(CAM_RAW.map((c) => c.r), 7),
};
const SH_RAW = Array.from({ length: NF }, (_, f) => shipRaw(f / FPS));
const SH = { x: gauss(SH_RAW.map((p) => p[0]), 6), y: gauss(SH_RAW.map((p) => p[1]), 6) };
// heading: face the way the ship sails (hold the last direction while it waits in port), turn smoothly
const DIR_RAW: number[] = [];
{ let d = 1; for (let f = 0; f < NF; f++) { const dx = SH.x[Math.min(NF - 1, f + 2)] - SH.x[Math.max(0, f - 2)]; if (Math.abs(dx) > 1.5) d = dx > 0 ? 1 : -1; DIR_RAW.push(d); } }
const DIR = gauss(DIR_RAW, 4);
const sample = (arr: number[], f: number) => { const i = Math.max(0, Math.min(arr.length - 2, Math.floor(f))); const u = f - i; return arr[i] * (1 - u) + arr[i + 1] * u; };
const camFrame = (f: number): Cam => ({ x: sample(CAM_S.x, f), y: sample(CAM_S.y, f), z: Math.exp(sample(CAM_S.lz, f)), r: sample(CAM_S.r, f) });
const shipFrame = (f: number): Pt => [sample(SH.x, f), sample(SH.y, f)];

// ---------- map layer ----------
type Label = { text: string; x: number; y: number; fs: number; kind: "city" | "sea" | "land"; hi?: [number, number]; ls?: number; rot?: number; anchor?: "start" | "middle" | "end" };
const LABELS: Label[] = [
  { text: "ATLANTIC  OCEAN", x: 2500, y: 1950, fs: 120, kind: "sea", ls: 44, rot: -6 },
  { text: "NORTH  AMERICA", x: 700, y: 900, fs: 120, kind: "land", ls: 40 },
  { text: "EUROPE", x: 5600, y: 420, fs: 120, kind: "land", ls: 44 },
  { text: "AFRICA", x: 4950, y: 2950, fs: 150, kind: "land", ls: 56 },
  { text: "MOROCCO", x: 4250, y: 2480, fs: 54, kind: "land", ls: 16 },
  { text: "MEDITERRANEAN", x: 5500, y: 1880, fs: 56, kind: "sea", ls: 18, rot: -4 },
  { text: "Haarlem", x: P.haarlem[0] - 40, y: P.haarlem[1] - 34, fs: 44, kind: "city", hi: [T.haarlem - 0.3, T.south + 0.5], anchor: "end" },
  { text: "Amsterdam", x: P.amsterdam[0] + 40, y: P.amsterdam[1] + 60, fs: 44, kind: "city", hi: [T.amsterdam1 - 0.3, T.then + 0.8], anchor: "start" },
  { text: "Lanzarote", x: LZ[0] - 50, y: LZ[1] + 70, fs: 46, kind: "city", hi: [T.lanzarote - 0.3, T.joined], anchor: "end" },
  { text: "Algiers", x: P.algiers[0] + 10, y: P.algiers[1] + 80, fs: 44, kind: "city", hi: [T.joined, T.son1] },
  { text: "Salé", x: P.sale[0] - 50, y: P.sale[1] + 20, fs: 50, kind: "city", hi: [T.son1, T.amsterdam1], anchor: "end" },
  { text: "New Amsterdam", x: P.newamsterdam[0] + 50, y: P.newamsterdam[1] + 70, fs: 44, kind: "city", hi: [T.amsterdam2 - 0.3, T.dutch4], anchor: "start" },
];

const MapLayer: React.FC<{ t: number }> = ({ t }) => {
  return (
    <svg width={EX.x1 - EX.x0} height={EX.y1 - EX.y0} viewBox={`${EX.x0} ${EX.y0} ${EX.x1 - EX.x0} ${EX.y1 - EX.y0}`} style={{ position: "absolute", left: EX.x0, top: EX.y0 }}>
      <defs>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="14" stroke={SEPIA} strokeWidth="1.6" opacity="0.28" />
        </pattern>
      </defs>
      <path d={map.graticule} fill="none" stroke={SEPIA} strokeWidth={2} opacity={0.32} strokeDasharray="10 8" />
      {[64, 44, 28, 16].map((w, i) => (
        <path key={i} d={map.land} fill="none" stroke={SEPIA} strokeWidth={w} opacity={0.05 + i * 0.03} strokeLinejoin="round" />
      ))}
      <path d={map.land} fill="#b89462" fillOpacity={0.38} />
      <path d={map.land} fill="url(#hatch)" />
      <path d={map.land} fill="none" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" opacity={0.85} />
      {/* the voyage, inked behind the ship, leg by leg */}
      {legs.map((lg, i) => (
        <path key={i} d={partial(lg, legU(i, t))} fill="none" stroke={i === ATL ? RED : INK} strokeWidth={i === ATL ? 9 : 6}
          strokeDasharray={i === ATL ? "26 18" : "16 14"} strokeLinecap="round" opacity={0.8 * (1 - ramp(t, T.dutch4, T.dutch4 + 1.2))} />
      ))}
      {/* the hook's teaser routes: Haarlem → Salé, then Salé → Brooklyn */}
      <path d={partial(teaserEU, ramp(t, H.pirate - 0.1, H.morocco + 0.1))} fill="none" stroke={RED} strokeWidth={11} strokeDasharray="30 20"
        strokeLinecap="round" opacity={0.85 * (1 - ramp(t, T.in1, T.in1 + 1.0))} />
      <path d={partial(teaserAtl, ramp(t, H.son - 0.25, H.america + 0.05))} fill="none" stroke={RED} strokeWidth={13} strokeDasharray="34 22"
        strokeLinecap="round" opacity={0.85 * (1 - ramp(t, T.in1, T.in1 + 1.0))} />
      {LABELS.map((l, i) => {
        const hi = l.hi ? win(t, l.hi[0], l.hi[1], 0.3, 0.6) : 0;
        const fs = l.fs * (1 + hi * 0.4);
        const color = l.kind === "city" ? INK : SEPIA;
        const op = l.kind === "sea" ? 0.55 : l.kind === "land" ? 0.35 : 0.85;
        return (
          <text key={i} x={l.x} y={l.y} fontSize={fs} textAnchor={l.anchor ?? "middle"} fill={color} opacity={op + hi * 0.15}
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

// ---------- small building blocks ----------
const place = (x: number, y: number, child: React.ReactNode, key?: string | number) => (
  <div key={key} style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>{child}</div>
);
const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 38, letterSpacing: 12, color: SEPIA, textAlign: "center" }}>{children}</div>
);
const Rule: React.FC<{ w?: string; c?: string }> = ({ w = "70%", c = INK }) => <div style={{ height: 3, background: c, opacity: 0.55, margin: "22px auto", width: w }} />;
const Big: React.FC<{ fs: number; color?: string; children: React.ReactNode; o?: number }> = ({ fs, color = INK, children, o = 1 }) => (
  <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: fs, lineHeight: 1.02, color, textAlign: "center", opacity: o }}>{children}</div>
);
const Note: React.FC<{ fs?: number; children: React.ReactNode; o?: number }> = ({ fs = 40, children, o = 1 }) => (
  <div style={{ fontFamily: "Special Elite", fontSize: fs, color: SEPIA, textAlign: "center", marginTop: 16, opacity: o }}>{children}</div>
);

// scan with a hand-inked red mark drawn over it
const ArchivalImage: React.FC<{ src: string; ratio: number; children?: React.ReactNode; tone?: number }> = ({ src, ratio, children, tone = 0.15 }) => (
  <div style={{ position: "relative", width: "100%", paddingBottom: `${100 / ratio}%`, overflow: "hidden" }}>
    <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: `sepia(${tone}) contrast(1.04)` }} />
    <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 50px rgba(40,22,8,.35)" }} />
    {children}
  </div>
);

type Obj = { a: number; b: number; render: (t: number, alpha: number) => React.ReactNode };
const OBJECTS: Obj[] = [
  // 1639 Manatus map, the hook
  { a: T.in1 - 0.35, b: T.lists + 0.3, render: (t, al) => (
    <Card t={t} tIn={T.in1 - 0.3} x={S.manatus[0]} y={S.manatus[1]} w={880} rot={-2} alpha={al} bg="white" pad={22}>
      <ArchivalImage src="salee/img/manatus_1639.jpg" ratio={4376 / 3144} />
      <div style={{ fontFamily: "Special Elite", fontSize: 30, color: INK, textAlign: "center", marginTop: 14 }}>“Manatus” · Manhattan, surveyed 1639 · Library of Congress</div>
    </Card>) },
  // the legend line: Nº 22, Bou van Antoni du Turck
  { a: T.lists + 0.05, b: T.turck + 0.35, render: (t, al) => (
    <Card t={t} tIn={T.lists + 0.05} x={S.legend[0]} y={S.legend[1]} w={900} rot={1} alpha={al} bg="white" pad={22}>
      <ArchivalImage src="salee/img/manatus_legend_22.jpg" ratio={425 / 170} tone={0.05}>
        <svg viewBox="0 0 425 170" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* row 22 sits at about y = 77 in this crop */}
          <path d="M14 108 Q200 113 400 106" fill="none" stroke={RED} strokeWidth={4.5} strokeLinecap="round"
            strokeDasharray={400} strokeDashoffset={400 * (1 - ramp(t, T.antoni - 0.15, T.antoni + 0.9))} opacity={0.9} />
          <ellipse cx={212} cy={88} rx={208} ry={23} fill="none" stroke={RED} strokeWidth={3}
            strokeDasharray={1400} strokeDashoffset={1400 * (1 - ramp(t, T.antoni + 0.6, T.turck + 0.2))} opacity={0.75} />
        </svg>
      </ArchivalImage>
    </Card>) },
  // title
  { a: T.turck - 0.05, b: T.his1 + 0.6, render: (t, al) => (
    <Card t={t} tIn={T.turck} x={S.title[0]} y={S.title[1]} w={820} rot={-2.5} alpha={al} pad={50}>
      <div style={{ border: `4px double ${INK}`, padding: "34px 20px", textAlign: "center", color: INK }}>
        <Kicker>A TRUE STORY</Kicker>
        <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 132, lineHeight: 1.0, marginTop: 18 }}>ANTHONY</div>
        <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 150, lineHeight: 1.0, color: RED }}>THE TURK</div>
        <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 64, lineHeight: 1.3, marginTop: 6, direction: "rtl" }}>أنطوني التركي</div>
        <div style={{ fontFamily: "Special Elite", fontSize: 34, marginTop: 12, color: SEPIA, whiteSpace: "nowrap" }}>Salé → New Amsterdam · 1600s</div>
      </div>
    </Card>) },
  // Jan Janszoon of Haarlem, under the Prince's flag
  { a: T.his1 + 2.05, b: T.y1609 + 0.45, render: (t, al) => (
    <Card t={t} tIn={T.his1 + 2.1} x={S.jan[0]} y={S.jan[1]} w={820} rot={1.5} alpha={al}>
      <svg viewBox="0 0 300 60" style={{ width: 230, height: 46, display: "block", margin: "0 auto 18px" }}>
        <rect x={0} y={0} width={300} height={20} fill="#d9782d" /><rect x={0} y={20} width={300} height={20} fill="#f3ead2" /><rect x={0} y={40} width={300} height={20} fill="#2f4f7a" />
        <rect x={0} y={0} width={300} height={60} fill="none" stroke={INK} strokeWidth={3} />
      </svg>
      <Kicker>PRIVATEER · HAARLEM</Kicker>
      <Rule />
      <Big fs={118}>Jan Janszoon</Big>
      <Note o={ramp(t, T.privateer, T.privateer + 0.4)}>licensed to raid Spanish ships</Note>
    </Card>) },
  // Süleyman Reis: the Dutchman who had already become a Muslim corsair
  { a: T.another - 0.1, b: T.joined + 0.25, render: (t, al) => {
    const ar = ramp(t, T.another + 0.3, T.sleyman + 0.3);
    return (
      <Card t={t} tIn={T.another - 0.1} x={S.suleyman[0]} y={S.suleyman[1]} w={860} rot={1.5} alpha={al}>
        <Kicker>CORSAIR OF ALGIERS</Kicker>
        <Rule />
        <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 132, direction: "rtl", lineHeight: 1.3, textAlign: "center", color: INK,
          clipPath: `inset(-20% 0 -20% ${100 - ar * 100}%)` }}>سليمان ريس</div>
        <Big fs={88} o={ramp(t, T.sleyman - 0.15, T.sleyman + 0.2)}>Süleyman Reis</Big>
        <Note fs={36} o={ramp(t, T.another + 0.3, T.another + 0.7)}>Dutch-born Ivan Dirkie de Veenboer</Note>
        <Rule w="60%" />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, fontFamily: "Oswald", fontWeight: 500, fontSize: 30, letterSpacing: 2, color: INK, whiteSpace: "nowrap" }}>
          {([["DUTCH PRIVATEER", T.privateer2], ["CORSAIR CAPTAIN", T.captain], ["ALGIERS", T.algiersS]] as [string, number][]).map(([w, tt], k) => (
            <React.Fragment key={k}>
              {k > 0 && <span style={{ color: RED, opacity: ramp(t, tt - 0.25, tt) }}>→</span>}
              <span style={{ opacity: ramp(t, tt - 0.2, tt + 0.1), color: k === 1 ? RED : INK }}>{w}</span>
            </React.Fragment>
          ))}
        </div>
      </Card>);
  } },
  // Murad Reis
  { a: T.muslim1 - 0.2, b: T.son1 - 0.1, render: (t, al) => {
    const ar = ramp(t, T.muslim1 - 0.1, T.murad + 0.1);
    return (
      <Card t={t} tIn={T.muslim1 - 0.2} x={S.murad[0]} y={S.murad[1]} w={840} rot={-1.5} alpha={al}>
        <Kicker>ALGIERS · c. 1618</Kicker>
        <Rule />
        <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 150, direction: "rtl", lineHeight: 1.3, textAlign: "center", color: INK,
          clipPath: `inset(-20% 0 -20% ${100 - ar * 100}%)` }}>مراد ريس</div>
        <Big fs={92} o={ramp(t, T.murad - 0.1, T.murad + 0.25)}>Murad Reis</Big>
        <Note fs={36} o={ramp(t, T.murad + 0.6, T.murad + 1.0)}>reis · captain</Note>
      </Card>);
  } },
  // Anthony, Jan's son, from Salé
  { a: T.son1 - 0.1, b: T.amsterdam1 + 0.2, render: (t, al) => (
    <Card t={t} tIn={T.son1 - 0.1} x={S.anthony[0]} y={S.anthony[1]} w={860} rot={-1.2} alpha={al}>
      <Kicker>BORN c. 1607</Kicker>
      <Rule />
      <Big fs={84}>Anthony Jansen<br /><span style={{ color: RED }}>van Salee</span></Big>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 26, fontFamily: "Special Elite", fontSize: 34, color: SEPIA }}>
        <span style={{ opacity: ramp(t, T.son1 + 0.4, T.son1 + 0.8) }}>Jansen = Jan's son</span>
        <span style={{ opacity: ramp(t, T.son1 + 0.9, T.son1 + 1.3) }}>van Salee = from Salé</span>
      </div>
    </Card>) },
  // marriage
  { a: T.grietje - 0.45, b: T.grietje + 1.9, render: (t, al) => (
    <Card t={t} tIn={T.grietje - 0.45} x={S.grietje[0]} y={S.grietje[1]} w={1500} rot={1.5} alpha={al} pad={70}>
      <div style={{ transform: "scale(1.35)", transformOrigin: "50% 50%" }}><Kicker>MARRIED · 1629</Kicker></div>
      <Rule />
      <Big fs={150}>Anthony <span style={{ color: RED }}>&amp;</span> Grietje</Big>
      <Note fs={56}>Grietje Reyniers, from Amsterdam</Note>
    </Card>) },
  // New Amsterdam print
  { a: T.amsterdam2 - 0.2, b: T.dutch4 - 0.1, render: (t, al) => (
    <Card t={t} tIn={T.amsterdam2 - 0.2} x={S.fort[0]} y={S.fort[1]} w={900} rot={-2} alpha={al} bg="white" pad={26}>
      <Photo src="salee/img/fort_new_amsterdam_c1626.jpg" ratio={1920 / 1297} caption="“t' Fort Nieuw Amsterdam op de Manhatans”" fs={32} tone={0.3} />
    </Card>) },
  // what "Turk" meant
  { a: T.dutch4 - 0.2, b: T.banished - 0.95, render: (t, al) => (
    <Card t={t} tIn={T.dutch4 - 0.2} x={S.turk[0]} y={S.turk[1]} w={820} rot={1.2} alpha={al} pad={56}>
      <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 190, color: INK, textAlign: "center", lineHeight: 1 }}>
        <span style={{ fontStyle: "italic" }}>Turk</span>
      </div>
      <div style={{ fontFamily: "Special Elite", fontSize: 40, color: SEPIA, textAlign: "center", marginTop: 14 }}>17th-century Dutch, noun:</div>
      <Rule w="60%" />
      <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 92, color: RED, textAlign: "center", opacity: ramp(t, T.muslim2 - 0.1, T.muslim2 + 0.25) }}>any Muslim</div>
      <div style={{ fontFamily: "Special Elite", fontSize: 38, color: SEPIA, textAlign: "center", marginTop: 14, opacity: ramp(t, T.ottoman - 0.1, T.ottoman + 0.3) }}>after the Ottoman Turks ☾</div>
    </Card>) },
  // banished: across the East River, on the same 1639 map
  { a: T.banished - 1.0, b: T.y1674 + 0.2, render: (t, al) => {
    const arrow = ramp(t, T.given, T.acres + 0.4);
    return (
      <Card t={t} tIn={T.banished - 1.0} x={S.island[0]} y={S.island[1]} w={1000} rot={-1.5} alpha={al} bg="white" pad={22}>
        <ArchivalImage src="salee/img/manatus_island.jpg" ratio={1600 / 750} tone={0.1}>
          <svg viewBox="0 0 1600 750" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
            <path d="M520 430 C 470 520, 380 560, 270 585" fill="none" stroke={RED} strokeWidth={12} strokeLinecap="round" strokeDasharray="28 18"
              opacity={0.95 * clamp(arrow * 8)} strokeDashoffset={0} style={{ clipPath: `inset(0 ${(1 - arrow) * 100}% 0 0)` }} />
            {arrow > 0.97 && <path d="M270 585 l40 -34 l6 44 z" fill={RED} />}
            <text x={300} y={680} fontFamily="Oswald" fontWeight={700} fontSize={70} fill={RED} opacity={ramp(t, T.acres - 0.1, T.acres + 0.3)} letterSpacing={6}>200 ACRES</text>
            <text x={60} y={720} fontFamily="Special Elite" fontSize={48} fill={INK} opacity={ramp(t, T.brooklyn - 0.1, T.brooklyn + 0.3)}>today: Brooklyn</text>
            <text x={40} y={110} fontFamily="Playfair Display" fontWeight={900} fontSize={96} fill={RED} opacity={ramp(t, T.turks - 0.25, T.turks + 0.1)}
              transform="rotate(-4 40 110)" style={{ paintOrder: "stroke" }} stroke="rgba(245,236,214,.85)" strokeWidth={10}>“the Turk's farm”</text>
          </svg>
        </ArchivalImage>
        <div style={{ position: "absolute", left: "70%", top: "16%" }}>
          <Stamp t={t} tIn={T.banished} text="BANISHED" sub="FROM MANHATTAN · 1639" fs={92} rot={-9} />
        </div>
      </Card>);
  } },
  // 1674: an English Quaker for the night
  { a: T.y1674 + 0.05, b: T.under + 0.15, render: (t, al) => (
    <Card t={t} tIn={T.y1674 + 0.05} x={S.quaker[0]} y={S.quaker[1]} w={880} rot={-1.2} alpha={al} pad={56}>
      <Kicker>COURT RECORD · MAY 1674</Kicker>
      <Rule />
      <Big fs={96} o={ramp(t, T.y1674 + 0.1, T.y1674 + 0.4)}>An English <span style={{ color: RED, opacity: ramp(t, T.quaker - 0.25, T.quaker + 0.05) }}>Quaker</span></Big>
      <Note fs={40} o={ramp(t, T.quaker + 0.2, T.quaker + 0.5)}>sheltered for one night on Bridge Street</Note>
      <Rule w="50%" />
      <div style={{ fontFamily: "Special Elite", fontSize: 36, color: INK, textAlign: "center", lineHeight: 1.3, opacity: ramp(t, T.persecuted - 0.2, T.persecuted + 0.2) }}>
        Quakers: the “Society of Friends”,<br />a Christian minority banned, fined<br />and jailed across the colonies
      </div>
      <div style={{ position: "absolute", left: "66%", top: "30%" }}>
        <Stamp t={t} tIn={T.fined} text="FINED" sub="NEW ORANGE · 1674" fs={96} rot={-9} />
      </div>
    </Card>) },
  // under Islamic rule: protected minorities
  { a: T.under - 0.05, b: T.son2 - 0.05, render: (t, al) => (
    <Card t={t} tIn={T.under - 0.05} x={S.dhimma[0]} y={S.dhimma[1]} w={860} rot={-1.4} alpha={al} pad={56}>
      <Kicker>UNDER ISLAMIC RULE</Kicker>
      <Rule />
      <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 130, direction: "rtl", lineHeight: 1.25, textAlign: "center", color: INK }}>أهل الذمة</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 40, fontFamily: "Playfair Display", fontWeight: 900, fontSize: 70, color: INK, marginTop: 6 }}>
        <span style={{ opacity: ramp(t, T.christians - 0.2, T.christians + 0.1) }}>Christians</span>
        <span style={{ opacity: ramp(t, T.jews - 0.2, T.jews + 0.1) }}>Jews</span>
      </div>
      <Note fs={38} o={ramp(t, T.protected - 0.2, T.protected + 0.2)}>ahl al-dhimma · “protected peoples”</Note>
    </Card>) },
  // callback: back to the 1639 map, the line that started it all
  { a: T.son2 - 0.1, b: SALEE_S + 1, render: (t, al) => (
    <Card t={t} tIn={T.son2 - 0.1} x={S.endMap[0]} y={S.endMap[1]} w={900} rot={-2.5} alpha={al} bg="white" pad={22}>
      <ArchivalImage src="salee/img/manatus_1639.jpg" ratio={4376 / 3144} />
    </Card>) },
  { a: T.written - 0.2, b: SALEE_S + 1, render: (t, al) => (
    <Card t={t} tIn={T.written - 0.2} x={S.endLegend[0]} y={S.endLegend[1]} w={820} rot={2} alpha={al} bg="white" pad={22}>
      <ArchivalImage src="salee/img/manatus_legend_22.jpg" ratio={425 / 170} tone={0.05}>
        <svg viewBox="0 0 425 170" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d="M14 108 Q200 113 400 106" fill="none" stroke={RED} strokeWidth={4.5} strokeLinecap="round"
            strokeDasharray={400} strokeDashoffset={400 * (1 - ramp(t, T.maps - 0.2, T.maps + 0.9))} opacity={0.9} />
        </svg>
      </ArchivalImage>
    </Card>) },
];

// a small storm: drifting cloud textures and slanted rain, for the wreck off Lanzarote
const Storm: React.FC<{ t: number; x: number; y: number; on: number; scale?: number }> = ({ t, x, y, on, scale = 1 }) => {
  if (on <= 0.01) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const a = t * (0.25 + i * 0.07) + i * 2.1, r = 120 * scale;
        return place(x + Math.cos(a) * r - 450 * scale, y + Math.sin(a) * r * 0.6 - 300 * scale,
          <Img src={staticFile(`imam/tex/storm${i}.png`)} style={{ width: 900 * scale, height: 600 * scale, opacity: on * 0.85, position: "absolute" }} />, "st" + i);
      })}
      {place(x - 380 * scale, y - 260 * scale,
        <svg width={760 * scale} height={520 * scale} style={{ position: "absolute", opacity: on * 0.55 }}>
          {Array.from({ length: 70 }).map((_, i) => {
            const rx = hash(i + 3) * 760 * scale, ry = ((hash(i * 3.3 + 1) * 520 + t * 900) % 520) * scale;
            return <line key={i} x1={rx} y1={ry} x2={rx - 14 * scale} y2={ry + 40 * scale} stroke="#3d3a40" strokeWidth={2.4 * scale} />;
          })}
        </svg>, "rain")}
    </>
  );
};

const World: React.FC<{ t: number; ship: Pt; dir: number }> = ({ t, ship, dir }) => {
  // the current hero sits above a dim layer; the previous one fades out underneath it
  const dim = Math.max(...OBJECTS.map((o) => win(t, o.a + 0.05, o.b, 0.45, 0.5)));
  const wreck = WRECK(t);
  // Jan's ship founders off Lanzarote; from the rescue on, the ship on the route is Süleyman's
  const janO = SHIP_ON(t) * (t < T.rescued + 1.3 ? 1 - ramp(t, T.shipwrecked + 0.5, T.rescued + 0.2) : 1) * (t >= T.rescued + 1.3 ? 1 : 1);
  const rescueOn = t > T.rescued - 0.4 && t < T.rescued + 1.45;
  const mainO = t < T.rescued + 1.3 ? janO : SHIP_ON(t);
  const rp = rescuePos(t);
  return (
    <>
      <MapLayer t={t} />
      {place(P.haarlem[0], P.haarlem[1], <Pin t={t} on={Math.max(win(t, 0.2, H.son), win(t, T.his1 + 2.0, T.south + 1.0))} pulse={win(t, T.haarlem - 0.1, T.haarlem + 0.5, 0.1, 0.4)} />, "pH")}
      {place(LZ[0], LZ[1], <Pin t={t} on={win(t, T.shipwrecked - 0.4, T.joined + 1.0)} pulse={win(t, T.lanzarote, T.lanzarote + 0.6, 0.1, 0.4)} size={22} />, "pLz")}
      {place(P.algiers[0], P.algiers[1], <Pin t={t} on={win(t, T.joined - 0.2, T.son1 + 0.4)} pulse={win(t, T.algiers, T.algiers + 0.6, 0.1, 0.4)} />, "pA")}
      {place(P.sale[0], P.sale[1], <Pin t={t} on={Math.max(win(t, H.admiral - 0.3, T.in1), win(t, T.son1 - 0.3, T.with1 + 0.5))} pulse={win(t, T.sale, T.sale + 0.6, 0.1, 0.4)} />, "pS")}
      {place(P.amsterdam[0], P.amsterdam[1], <Pin t={t} on={win(t, T.amsterdam1 - 0.3, T.grietje + 1)} pulse={win(t, T.amsterdam1, T.amsterdam1 + 0.6, 0.1, 0.4)} size={22} />, "pAm")}
      {place(P.newamsterdam[0], P.newamsterdam[1], <Pin t={t} on={Math.max(win(t, H.america - 0.3, T.lists), ramp(t, T.amsterdam2 - 0.4, T.amsterdam2))} pulse={win(t, T.amsterdam2, T.amsterdam2 + 0.7, 0.1, 0.4)} />, "pNY")}
      {/* hook: the admiral of Salé */}
      {place(P.sale[0] + 330, P.sale[1] - 170, (
        <div style={{ opacity: 1 - ramp(t, H.son + 0.2, H.son + 0.8) }}>
          <Stamp t={t} tIn={H.admiral} text="ADMIRAL" sub="SALÉ · MOROCCO" fs={118} rot={-8} />
        </div>
      ), "adm")}
      {/* hook: the first known Muslim landowner */}
      {place(P.newamsterdam[0] + 330, P.newamsterdam[1] + 200, (
        <div style={{ opacity: 1 - ramp(t, T.in1 - 0.4, T.in1 + 0.2) }}>
          <Stamp t={t} tIn={H.first} text="THE FIRST" sub="KNOWN MUSLIM LANDOWNER" fs={104} rot={-7} />
        </div>
      ), "first")}
      {/* 1609: the truce with Spain ends the raiding */}
      {place(P.haarlem[0] - 260, P.haarlem[1] + 260, (
        <div style={{ opacity: 1 - ramp(t, T.lanzarote - 0.5, T.lanzarote + 0.3) }}>
          <Stamp t={t} tIn={T.y1609} text="TRUCE · 1609" sub="SPAIN & THE DUTCH REPUBLIC" fs={92} rot={-6} />
        </div>
      ), "truce")}
      {/* the storm off Lanzarote */}
      <Storm t={t} x={LZ[0] + 20} y={LZ[1] - 40} on={win(t, T.shipwrecked - 0.7, T.another + 0.4, 0.6, 0.9)} scale={0.85} />
      {/* the ship on the route (Jan's, then Süleyman's), with the wreck: heavy rolling, listing, going under */}
      {mainO > 0.01 && place(ship[0], ship[1] + wreck * 26 * (t < T.rescued + 1.3 ? 1 : 0), (
        <div style={{ position: "absolute", transform: `translate(-50%,-62%) scaleX(${dir}) rotate(${(t < T.rescued + 1.3 ? wreck : 0) * 24}deg)` }}>
          <Ship t={t} size={170} rock={3 + 9 * win(t, T.shipwrecked - 0.6, T.rescued + 0.5)} seed={1.3} opacity={mainO} steam={false} />
        </div>
      ), "ship")}
      {/* Süleyman's ship comes in from the east */}
      {rescueOn && place(rp[0], rp[1], (
        <div style={{ position: "absolute", transform: "translate(-50%,-62%) scaleX(-1)" }}>
          <Ship t={t} size={190} rock={4} seed={4.1} opacity={ramp(t, T.rescued - 0.4, T.rescued - 0.1)} steam={false} />
        </div>
      ), "rescue")}
      <div style={{ position: "absolute", left: EX.x0, top: EX.y0, width: EX.x1 - EX.x0, height: EX.y1 - EX.y0, background: "#160d05", opacity: dim * 0.42 }} />
      {/* a card that hands over to the next one keeps fading on the same layer: no pop when the hero changes */}
      {OBJECTS.filter((o) => t >= o.a - 0.1 && t < o.b + 0.6).map((o, i) => <React.Fragment key={"h" + i}>{o.render(t, Math.max(0, 1 - 0.15 * ramp(t, o.b - 0.5, o.b) - 0.85 * ramp(t, o.b - 0.5, o.b + 0.6)))}</React.Fragment>)}
    </>
  );
};

const CLOUDS: { x: number; y: number; s: number; i: number }[] = [
  { x: 2600, y: 1300, s: 1.6, i: 0 }, { x: 3500, y: 800, s: 1.3, i: 1 }, { x: 1700, y: 1700, s: 1.4, i: 2 }, { x: 3900, y: 1700, s: 1.2, i: 3 },
  { x: 4700, y: 1200, s: 1.1, i: 1 }, { x: 2200, y: 2300, s: 1.5, i: 0 }, { x: 1200, y: 1000, s: 1.2, i: 2 }, { x: 3200, y: 2500, s: 1.4, i: 3 },
  { x: 5400, y: 2300, s: 1.3, i: 0 }, { x: 800, y: 2700, s: 1.2, i: 1 },
];
const worldTransform = (c: Cam, extra = { x: 0, y: 0, r: 0 }) =>
  `translate(${FOCUS_X + extra.x}px, ${FOCUS_Y + extra.y}px) rotate(${c.r + extra.r}deg) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`;

export const SaleeMap: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / FPS;
  const c = camFrame(frame);
  const hh = handheld(t);
  const k = kick(t);
  const extra = { x: hh.x + k, y: hh.y - k * 0.4, r: hh.r };
  const cloudPar = 1.35;
  return (
    <AbsoluteFill style={{ background: "#120b05", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: worldTransform(c, extra) }}>
        <div style={{ position: "absolute", left: EX.x0 - 3000, top: EX.y0 - 3000, width: EX.x1 - EX.x0 + 6000, height: EX.y1 - EX.y0 + 6000,
          backgroundImage: `url(${staticFile("mock/wood.jpg")})`, backgroundSize: "3200px 5200px", backgroundRepeat: "repeat" }} />
        <Img src={staticFile("imam/tex/parchment_big.jpg")} style={{ position: "absolute", left: EX.x0, top: EX.y0, width: EX.x1 - EX.x0, height: EX.y1 - EX.y0 }} />
        <World t={t} ship={shipFrame(frame)} dir={sample(DIR, frame)} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: worldTransform({ ...c, z: c.z * cloudPar }, extra) }}>
        {CLOUDS.map((cl, i) => (
          <Img key={i} src={staticFile(`imam/tex/cloud${cl.i}.png`)} style={{
            position: "absolute", left: cl.x - 450 * cl.s, top: cl.y - 300 * cl.s, width: 900 * cl.s, height: 600 * cl.s,
            opacity: 0.3 * (1 - clamp((c.z - 0.6) / 0.5)) + 0.06, transform: `translate(${Math.sin(t * 0.07 + i) * 60}px, 0)`,
          }} />
        ))}
      </div>
      {/* desk-lamp grade */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 35% 25%, rgba(255,214,150,.20) 0%, rgba(255,214,150,0) 55%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 45%, rgba(10,5,0,.72) 100%)" }} />
      <AbsoluteFill style={{ background: "#2a1608", opacity: 0.18, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 72% 46% at 45% 58%, rgba(255,196,120,.24) 0%, rgba(255,196,120,0) 72%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 62% at 50% 58%, rgba(0,0,0,0) 42%, rgba(10,4,0,.8) 100%)" }} />
    </AbsoluteFill>
  );
};

export const SaleeFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const fadeIn = ramp(t, 0, 0.5);
  const fadeOut = 1 - ramp(t, SALEE_S - 1.4, SALEE_S - 0.1);
  return (
    <AbsoluteFill style={{ background: "#120804", overflow: "hidden" }}>
      <Audio src={staticFile(SALEE_AUDIO)} />
      <SaleeMap frame={frame} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,0,.9) 0%, rgba(10,4,0,.6) 24%, rgba(10,4,0,0) 37%)" }} />
      <TopCaptions t={t} caps={CAPS} />
      <Watermark opacity={ramp(t, 1.0, 1.8)} />
      <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
        <Img src={staticFile(`imam/tex/grain${frame % 12}.png`)} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeIn * fadeOut }} />
    </AbsoluteFill>
  );
};

// --- debug helpers for motion QA ---
export const __salee = { camFrame, shipFrame, T, NF };
