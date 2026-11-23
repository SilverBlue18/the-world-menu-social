import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { geoMercator } from "d3-geo";
import map from "./mapdata.json";
import capsJson from "../../projects/piment/captions.json";
import { FOCUS_X, FOCUS_Y, FPS, Pt, clamp, makeCamera, partial, ramp, smoothPath, track, win, Cam, backOut } from "../imam/lib";
import { C, EndCard, Grade, HeroCard, MapPin, TitleCard, TwmCaptions, TwmCap, TwmStamp } from "../shared/twm";
import { Watermark } from "../shared/Watermark";

// Video 1, "Le piment" (The World Menu, DOSSIER #01). One continuous camera over a Sahel world map.
export const PIMENT_S = 68.5;
const CAPS = capsJson as unknown as TwmCap[];
const EX = map.EX;
const proj = geoMercator().scale(map.proj.scale).translate(map.proj.translate as [number, number]);
const P = (lon: number, lat: number): Pt => proj([lon, lat]) as Pt;
const PT = map.pts as unknown as Record<string, Pt>;

// ---------- word clock: every beat is pinned to the moment its word is spoken ----------
const norm = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9']/g, "");
const WORDS = CAPS.flatMap((c) => c.words).map((w) => ({ ...w, n: norm(w.t) }));
const wt = (word: string, nth = 1, end = false) => {
  const hits = WORDS.filter((w) => w.n === word);
  if (!hits[nth - 1]) throw new Error(`word not found: ${word} #${nth}`);
  return end ? hits[nth - 1].e : hits[nth - 1].s;
};
export const T = {
  monde: wt("monde"), cepays: wt("ce"), inde: wt("l'inde", 1), et: wt("et", 1), mexique: wt("mexique", 1), labas: wt("labas"), six: wt("six"),
  y1493: wt("1493"), colomb: wt("colomb"), caraibes: wt("caraibes"), pimiento: wt("pimiento"), poivre2: wt("poivre", 2),
  mauvais1: wt("mauvais", 1), mauvais2: wt("mauvais", 2), mais: wt("mais"), rester: wt("rester"), ensuite: wt("ensuite"),
  marins: wt("marins"), portugais: wt("portugais"), goa: wt("goa", 1), seizieme: wt("seizieme"), avant: wt("avant"),
  poivre3: wt("poivre", 3), lepiment: wt("piment", 3), sud: wt("sud"), deux: wt("deux"), siecles: wt("siecles"), nord: wt("nord"),
  goa2: wt("goa", 2), pernambouc: wt("pernambouc"), bresil: wt("bresil"), aujourdhui: wt("aujourd'hui"),
  p1: wt("premier", 1), p2: wt("premier", 2), p3: wt("premier", 3), alors: wt("alors"), brule: wt("brule"),
  remercie: wt("remercie"), mexique2: wt("mexique", 2), mexique2e: wt("mexique", 2, true),
};
const END = T.mexique2e + 0.6;            // end card
const TITLE_OUT = 2.95;                   // the title card (thumbnail) holds ~3 s

// ---------- camera ----------
// K(lon, lat, zoom, roll, up): up = keep the place in the upper half so a hero card can sit below it
const K = (t: number, lon: number, lat: number, z: number, r = 0, up = false) => {
  const [x, y] = P(lon, lat);
  return { t, x, y: y + (up ? 300 / z : 0), z, r };
};
const camera = makeCamera([
  K(0, -26, 17, 0.235, -0.8),
  K(4.7, -14, 16, 0.25, 0),
  K(T.cepays + 0.1, 18, 17, 0.22, 0),
  K(T.inde + 0.05, 79, 20, 0.6, 0.5),
  K(T.et + 0.35, 79.5, 20, 0.66, 0.3),
  K((T.et + T.mexique) / 2 + 0.2, -8, 20, 0.17, 0),
  K(T.mexique + 0.1, -97.6, 19.5, 0.62, -0.5),
  K(T.labas + 0.3, -97.6, 19.5, 0.7, -0.5),
  K(T.six - 0.15, -97.6, 19.2, 0.84, -0.8, true),
  K(T.y1493 - 0.2, -97.2, 19.2, 0.9, -0.4, true),
  K(T.y1493 + 0.55, -45, 26, 0.3, 0),
  K(T.colomb + 0.2, -55, 24, 0.36, 0.2),
  K(T.caraibes + 0.1, -71.2, 19.2, 0.7, 0.4, true),
  K(T.mauvais1 - 0.2, -71.4, 19.2, 0.8, 0.8, true),
  K(T.mais, -71.4, 19.4, 0.84, 0.6, true),
  K(T.rester + 0.6, -40, 30, 0.3, 0),
  K(T.ensuite + 0.45, -9.2, 38.6, 0.62, -0.3),
  K(T.portugais + 0.1, -9.2, 37.5, 0.56, -0.2),
  K(T.portugais + 1.3, 25, 0, 0.22, 0),
  K(T.goa - 0.9, 30, 2, 0.21, 0),
  K(T.goa + 0.1, 73.8, 15.5, 0.62, 0.4, true),
  K(T.avant - 0.2, 74.3, 15.8, 0.72, 0.6, true),
  K(T.poivre3 - 0.3, 76.8, 12.5, 0.66, 0.2, true),
  K(T.lepiment + 0.2, 77.6, 13, 0.6, 0),
  K(T.sud + 0.1, 77.8, 14.5, 0.62, -0.2),
  K(T.deux, 77.8, 18.5, 0.52, 0),
  K(T.nord + 0.15, 77.4, 22.5, 0.56, 0.3),
  K(T.goa2 + 0.3, 55, 12, 0.3, 0),
  K((T.goa2 + T.pernambouc) / 2 + 0.6, 10, -8, 0.17, 0),
  K(T.pernambouc + 0.1, -35.4, -8.2, 0.6, -0.4, true),
  K(T.bresil + 0.3, -35.6, -8.2, 0.68, -0.6, true),
  K(T.aujourdhui + 0.5, 22, 4, 0.19, 0),
  K(T.p1 - 0.2, 79, 21, 0.52, 0.3, true),
  K(T.alors - 0.3, 79, 21, 0.6, 0.6, true),
  K(T.brule + 0.2, 79, 21.5, 0.68, 0.2),
  K(T.remercie + 0.05, 79, 21, 0.72, 0),
  K((T.remercie + T.mexique2) / 2 + 0.1, -10, 20, 0.17, 0),
  K(T.mexique2 + 0.1, -97.6, 19.5, 0.62, -0.4, true),
  K(PIMENT_S, -97.6, 19.8, 0.72, -0.8, true),
]);
const handheld = (t: number) => ({
  x: Math.sin(t * 1.31) * 2.4 + Math.sin(t * 2.87 + 1.3) * 1.3,
  y: Math.cos(t * 1.07) * 2.0 + Math.sin(t * 2.41 + 0.4) * 1.2,
  r: Math.sin(t * 0.93) * 0.12,
});

// precomputed, Gaussian-smoothed camera (σ 7 frames): no jumps, no dead stops
const NF = Math.ceil(PIMENT_S * FPS) + 2;
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
const CAM_S = { x: gauss(CAM_RAW.map((c) => c.x), 7), y: gauss(CAM_RAW.map((c) => c.y), 7), lz: gauss(CAM_RAW.map((c) => Math.log(c.z)), 7), r: gauss(CAM_RAW.map((c) => c.r), 7) };
const sample = (arr: number[], f: number) => { const i = Math.max(0, Math.min(arr.length - 2, Math.floor(f))); const u = f - i; return arr[i] * (1 - u) + arr[i + 1] * u; };
const camFrame = (f: number): Cam => ({ x: sample(CAM_S.x, f), y: sample(CAM_S.y, f), z: Math.exp(sample(CAM_S.lz, f)), r: sample(CAM_S.r, f) });

// ---------- routes ----------
const legEase = (u: number) => {
  const x = clamp(u), A = 0.25, vmax = 1 / (1 - A);
  if (x < A) return (vmax * x * x) / (2 * A);
  if (x > 1 - A) return 1 - (vmax * (1 - x) * (1 - x)) / (2 * A);
  return vmax * (x - A / 2);
};
const tr = (k: string) => track(smoothPath(map[k as keyof typeof map] as unknown as Pt[], 14));
const ROUTES = [
  { tk: tr("rCol"), a: T.y1493 + 0.05, b: T.caraibes + 0.05 },
  { tk: tr("rBack"), a: T.mais + 0.1, b: T.ensuite + 0.35 },
  { tk: tr("rPort"), a: T.portugais, b: T.goa },
  { tk: tr("rIndia"), a: T.deux, b: T.nord + 0.05 },
  { tk: tr("rPern"), a: T.pernambouc + 0.2, b: T.p1 - 0.3 },
];

// ---------- map layer (sizes in screen pixels: k = 1/zoom) ----------
type Lab = { text: string; at: Pt; on: [number, number]; dx?: number; dy?: number; anchor?: "start" | "middle" | "end" };
const CITY: Lab[] = [
  { text: "Mexique", at: PT.mexico, on: [T.mexique - 0.1, 999], dx: 30, dy: 14 },
  { text: "Caraïbes", at: PT.caribbean, on: [T.caraibes - 0.1, T.ensuite + 1], dx: 30, dy: 14 },
  { text: "Lisbonne", at: PT.lisbon, on: [T.ensuite - 0.2, T.goa + 1.5], dx: -30, dy: -18, anchor: "end" },
  { text: "Goa", at: PT.goa, on: [T.goa - 0.1, 999], dx: -30, dy: 14, anchor: "end" },
  { text: "Sud", at: PT.southIndia, on: [T.sud - 0.1, T.goa2], dx: 30, dy: 14 },
  { text: "Nord", at: PT.northIndia, on: [T.nord - 0.1, T.goa2], dx: 30, dy: 14 },
  { text: "Pernambouc", at: PT.pernambuco, on: [T.pernambouc - 0.1, T.alors], dx: -30, dy: 50, anchor: "end" },
];
const REGION: { text: string; ll: [number, number]; fs: number; sea?: boolean; ls?: number; rot?: number }[] = [
  { text: "AMÉRIQUE", ll: [-88, 38], fs: 150, ls: 40 }, { text: "OCÉAN ATLANTIQUE", ll: [-40, 12], fs: 120, sea: true, ls: 36, rot: -4 },
  { text: "EUROPE", ll: [15, 50], fs: 130, ls: 40 }, { text: "AFRIQUE", ll: [20, 8], fs: 170, ls: 50 },
  { text: "INDE", ll: [77.5, 26], fs: 120, ls: 40 }, { text: "OCÉAN INDIEN", ll: [70, -12], fs: 120, sea: true, ls: 36 },
  { text: "BRÉSIL", ll: [-50, -10], fs: 130, ls: 40 }, { text: "MEXIQUE", ll: [-103, 25.5], fs: 60, ls: 16 },
];
const PINS: { at: Pt; on: [number, number]; pulse: number[]; big?: boolean }[] = [
  { at: PT.india, on: [T.inde - 0.15, T.et + 1.0], pulse: [T.inde] , big: true },
  { at: PT.mexico, on: [T.mexique - 0.1, 999], pulse: [T.mexique, T.mexique2], big: true },
  { at: PT.caribbean, on: [T.caraibes - 0.15, T.goa + 1], pulse: [T.caraibes] },
  { at: PT.lisbon, on: [T.ensuite - 0.1, T.goa + 1.5], pulse: [T.ensuite + 0.3] },
  { at: PT.goa, on: [T.goa - 0.15, 999], pulse: [T.goa, T.goa2] , big: true },
  { at: PT.southIndia, on: [T.sud - 0.1, T.goa2], pulse: [T.sud] },
  { at: PT.northIndia, on: [T.nord - 0.05, T.goa2], pulse: [T.nord] },
  { at: PT.pernambuco, on: [T.pernambouc - 0.15, T.alors], pulse: [T.pernambouc] },
];
const pulseAt = (t: number, ts: number[]) => { for (const p of ts) { const u = (t - p) / 0.9; if (u >= 0 && u < 1) return u; } return 0; };

const MapLayer: React.FC<{ t: number; z: number }> = ({ t, z }) => {
  const k = 1 / z;
  const heat = win(t, T.brule - 0.3, T.remercie + 0.4, 0.4, 0.5);
  const [ix, iy] = PT.india;
  return (
    <svg width={EX.x1 - EX.x0} height={EX.y1 - EX.y0} viewBox={`${EX.x0} ${EX.y0} ${EX.x1 - EX.x0} ${EX.y1 - EX.y0}`} style={{ position: "absolute", left: EX.x0, top: EX.y0 }}>
      <defs>
        <radialGradient id="heat"><stop offset="0" stopColor="#ff5a1f" stopOpacity={0.55} /><stop offset="0.5" stopColor={C.red} stopOpacity={0.35} /><stop offset="1" stopColor={C.red} stopOpacity={0} /></radialGradient>
      </defs>
      <path d={map.graticule} fill="none" stroke={C.cream} strokeOpacity={0.07} strokeWidth={2 * k} />
      {[30, 20, 12].map((w, i) => <path key={i} d={map.land} fill="none" stroke={C.coast} strokeWidth={w * k} strokeOpacity={0.1 + i * 0.05} strokeLinejoin="round" />)}
      <path d={map.land} fill={C.land} stroke={C.coast} strokeWidth={3 * k} strokeLinejoin="round" />
      {REGION.map((r, i) => { const [x, y] = P(...r.ll); return (
        <text key={i} x={x} y={y} fontSize={r.fs} textAnchor="middle" fontFamily="Playfair Display" fontWeight={700} letterSpacing={r.ls ?? 10}
          fill={r.sea ? C.cream : C.coast} opacity={r.sea ? 0.22 : 0.4} transform={r.rot ? `rotate(${r.rot} ${x} ${y})` : undefined}>{r.text}</text>); })}
      {heat > 0.001 && <circle cx={ix} cy={iy} r={900 * (1 + 0.06 * Math.sin(t * 9))} fill="url(#heat)" opacity={heat} style={{ mixBlendMode: "multiply" }} />}
      {ROUTES.map((r, i) => {
        const u = legEase((t - r.a) / (r.b - r.a));
        if (u <= 0) return null;
        return <path key={i} d={partial(r.tk, u)} fill="none" stroke={C.red} strokeWidth={9 * k} strokeLinecap="round" strokeDasharray={`${3 * k} ${22 * k}`} opacity={0.95} />;
      })}
      {/* "≈ 200 ans" along the route inside India */}
      {(() => { const [x, y] = P(80.2, 19.5); const o = win(t, T.siecles - 0.1, T.goa2, 0.3, 0.4); return o > 0 && (
        <text x={x} y={y} fontSize={46 * k} fontFamily="Oswald" fontWeight={700} letterSpacing={4 * k} fill={C.mustard} opacity={o}
          stroke={C.night} strokeWidth={8 * k} style={{ paintOrder: "stroke" }}>≈ 200 ANS</text>); })()}
      {PINS.map((p, i) => <MapPin key={i} x={p.at[0]} y={p.at[1]} k={k} big={p.big} on={win(t, p.on[0], p.on[1], 0.25, 0.4)} pulse={pulseAt(t, p.pulse)} />)}
      {CITY.map((l, i) => { const o = win(t, l.on[0], l.on[1], 0.3, 0.4); return o > 0.001 && (
        <text key={i} x={l.at[0] + (l.dx ?? 30) * k} y={l.at[1] + (l.dy ?? 14) * k} fontSize={40 * k} fontFamily="Special Elite" textAnchor={l.anchor ?? "start"}
          fill={C.night} stroke={C.land} strokeWidth={8 * k} style={{ paintOrder: "stroke" }} opacity={o}>{l.text}</text>); })}
    </svg>
  );
};

// ---------- hero objects (screen space, one at a time) ----------
const HEROES: [number, number][] = [
  [T.six - 0.04, T.y1493 - 0.05], [T.colomb - 0.04, T.mais - 0.05], [T.mais, T.ensuite - 0.1], [T.goa + 0.3, T.avant + 0.2],
  [T.poivre3 - 0.1, T.sud - 0.35], [T.pernambouc + 0.35, T.aujourdhui + 0.2], [T.p1 - 0.75, T.alors - 0.1],
];
const heroOn = (t: number) => Math.max(...HEROES.map(([a, b]) => win(t, a, b + 0.3, 0.35, 0.5)));

const Note: React.FC<{ t: number; a: number; b: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, a, b, children, style }) => (
  <span style={{ display: "inline-block", clipPath: `inset(-30% ${100 - clamp((t - a) / (b - a)) * 100}% -30% 0)`, ...style }}>{children}</span>
);

const Heroes: React.FC<{ t: number }> = ({ t }) => {
  const statRow = (label: string, at: number, i: number) => {
    const u = clamp((t - at + 0.12) / 0.4);
    return (
      <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 18, opacity: clamp(u * 2), transform: `translateX(${(1 - backOut(u, 1.4)) * -60}px)`, marginTop: i ? 14 : 0 }}>
        <span style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 84, color: C.red, width: 120, textAlign: "right" }}>1<sup style={{ fontSize: 40 }}>er</sup></span>
        <span style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 50, letterSpacing: 4, color: C.night }}>{label}</span>
      </div>
    );
  };
  const boardIn = clamp((t - (T.p1 - 0.75)) / 0.55);
  const boardOut = ramp(t, T.alors - 0.1, T.alors + 0.35);
  return (
    <>
      {/* Mexico: ~6,000 years of cultivation */}
      <HeroCard t={t} tIn={T.six - 0.04} tOut={T.y1493 - 0.05} x={540} y={1230} w={640} rot={-2} src="piment/img/codex_cultivo.jpg" ratio={1261 / 841}
        caption="Cultiver la terre, Mexique" sub="CODEX DE FLORENCE · 1577" />
      {t > T.six - 0.1 && t < T.y1493 + 0.5 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 830, textAlign: "center", fontFamily: "Oswald", fontWeight: 700, fontSize: 92, letterSpacing: 8,
          color: C.mustard, textShadow: "0 4px 18px rgba(0,0,0,.8)", opacity: ramp(t, T.six, T.six + 0.3) * (1 - ramp(t, T.y1493 - 0.05, T.y1493 + 0.4)),
          transform: `scale(${1 + (1 - backOut(clamp((t - T.six) / 0.45), 1.5)) * 0.3})` }}>≈ 6 000 ANS</div>
      )}
      {/* Columbus, 1493: "pimiento" -> two stamps */}
      <HeroCard t={t} tIn={T.colomb - 0.04} tOut={T.mais - 0.05} x={470} y={1215} w={400} rot={2} src="piment/img/colomb.jpg" ratio={0.83}
        caption="Christophe Colomb" sub="PORTRAIT PRÉSUMÉ · 1519">
        {t > T.pimiento - 0.1 && (
          <div style={{ position: "absolute", right: -230, top: 26, transform: "rotate(5deg)", background: C.cream, padding: "16px 26px", borderRadius: 4,
            boxShadow: "0 14px 30px rgba(0,0,0,.45)", fontFamily: "Special Elite", fontSize: 46, color: C.night, whiteSpace: "nowrap",
            opacity: ramp(t, T.pimiento - 0.1, T.pimiento + 0.05) }}>
            <Note t={t} a={T.pimiento} b={T.pimiento + 0.7}>« pimiento »</Note><br />
            <Note t={t} a={T.poivre2 - 0.05} b={T.poivre2 + 0.35} style={{ color: C.red }}>= poivre</Note>
          </div>
        )}
        <div style={{ position: "absolute", left: "42%", top: "34%" }}><TwmStamp t={t} tIn={T.mauvais1 - 0.03} text="MAUVAIS PAYS" fs={46} rot={-10} /></div>
        <div style={{ position: "absolute", left: "48%", top: "64%" }}><TwmStamp t={t} tIn={T.mauvais2 - 0.03} text="MAUVAIS NOM" fs={46} rot={6} /></div>
      </HeroCard>
      {/* the name stuck: a German herbal of 1543 still calls it "Indian pepper" */}
      <HeroCard t={t} tIn={T.mais} tOut={T.ensuite - 0.1} x={540} y={1200} w={360} rot={-2.5} src="piment/img/fuchs.jpg" ratio={1074 / 1890} tone={0.05}
        caption="« Poivre indien »" sub="LEONHART FUCHS · 1543" />
      {/* Goa */}
      <HeroCard t={t} tIn={T.goa + 0.3} tOut={T.avant + 0.2} x={540} y={1210} w={720} rot={-1.5} src="piment/img/goa.jpg" ratio={1600 / 757} tone={0.1}
        caption="Le marché de Goa" sub="GRAVURE · LINSCHOTEN · 1596" />
      {/* black pepper, South India */}
      <HeroCard t={t} tIn={T.poivre3 - 0.1} tOut={T.sud - 0.35} x={540} y={1210} w={680} rot={1.8} src="piment/img/poivre.jpg" ratio={1600 / 982}
        caption="Récolte du poivre noir, Inde du Sud" sub="LIVRE DES MERVEILLES · v. 1410" />
      {/* Pernambuco */}
      <HeroCard t={t} tIn={T.pernambouc + 0.35} tOut={T.aujourdhui + 0.2} x={540} y={1215} w={640} rot={-2} src="piment/img/pernambuco.jpg" ratio={1600 / 1298} tone={0.08}
        caption="Pernambouc, Brésil" sub="CARTE HOLLANDAISE · 1647" />
      {/* today: India, three times first */}
      {boardIn > 0 && boardOut < 1 && (
        <div style={{ position: "absolute", left: 540 - 330, top: 1200, width: 660, opacity: clamp(boardIn * 3) * (1 - boardOut),
          transform: `translate(0,-50%) rotate(${-1.5 + (1 - boardIn) * 6}deg) scale(${1 + (1 - backOut(boardIn, 1.2)) * 0.2})` }}>
          <div style={{ background: C.cream, borderRadius: 6, padding: "30px 40px 26px", boxShadow: "0 30px 70px rgba(0,0,0,.5), 0 4px 10px rgba(0,0,0,.3)" }}>
            <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 30, letterSpacing: 8, color: C.coast, textAlign: "center" }}>AUJOURD'HUI · L'INDE</div>
            <div style={{ height: 3, background: C.coast, opacity: 0.4, margin: "16px auto 20px", width: "70%" }} />
            {statRow("PRODUCTEUR", T.p1, 0)}{statRow("CONSOMMATEUR", T.p2, 1)}{statRow("EXPORTATEUR", T.p3, 2)}
            <div style={{ fontFamily: "Special Elite", fontSize: 26, color: C.coast, textAlign: "center", marginTop: 20, opacity: ramp(t, T.p3 + 0.4, T.p3 + 0.8) }}>de piment au monde · Spices Board of India</div>
          </div>
        </div>
      )}
      {/* back to Mexico */}
      <div style={{ position: "absolute", left: 540, top: 1190 }}>
        <TwmStamp t={t} tIn={T.mexique2e + 0.05} text="MERCI, MEXIQUE" fs={56} rot={-7} o={1 - ramp(t, END - 0.2, END + 0.4)} />
      </div>
    </>
  );
};

const worldTransform = (c: Cam, extra = { x: 0, y: 0, r: 0 }) =>
  `translate(${FOCUS_X + extra.x}px, ${FOCUS_Y + extra.y}px) rotate(${c.r + extra.r}deg) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`;

export const PimentFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const c = camFrame(frame);
  const hh = handheld(t);
  const fadeIn = ramp(t, 0, 0.5);
  const fadeOut = 1 - ramp(t, PIMENT_S - 1.4, PIMENT_S - 0.1);
  const titleO = 1 - ramp(t, TITLE_OUT - 0.1, TITLE_OUT + 0.35);
  return (
    <AbsoluteFill style={{ background: C.sea, overflow: "hidden" }}>
      <Audio src={staticFile("piment/mix.wav")} />
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: worldTransform(c, { x: hh.x, y: hh.y, r: hh.r }) }}>
        <MapLayer t={t} z={c.z} />
      </div>
      <Grade frame={frame} />
      <AbsoluteFill style={{ background: C.night, opacity: heroOn(t) * 0.38 }} />
      <Heroes t={t} />
      {titleO > 0.001 && (
        <>
          <TitleCard o={titleO} t={t} en="Chili peppers aren't Indian" lines={<>Le piment<br />n'est pas<br /><span style={{ color: C.mustard }}>indien</span></>} />
          <div style={{ position: "absolute", left: 760, top: 1290, opacity: titleO }}><TwmStamp t={t} tIn={T.monde - 0.05} text="DOSSIER #01" fs={44} rot={-9} /></div>
        </>
      )}
      <TwmCaptions t={t} caps={CAPS} showFrom={TITLE_OUT + 0.1} />
      <Watermark opacity={ramp(t, 1.0, 1.8)} />
      <EndCard t={t} tIn={END} teaser="Demain : un autre plat, une autre histoire vraie." />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeIn * fadeOut }} />
    </AbsoluteFill>
  );
};

export const __piment = { camFrame, T, NF };
