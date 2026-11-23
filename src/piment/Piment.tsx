import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import land50 from "world-atlas/land-50m.json";
import capsJson from "../../projects/piment/captions.json";
import { FPS, backOut, clamp, easeOut, makeWarp, ramp, win } from "../imam/lib";
import { C, EndCard, TwmCaptions, TwmCap } from "../shared/twm";
import { Watermark } from "../shared/Watermark";

// Video 1, "Le piment". Look "A + B": the food as a cut-out hero on bold colour fields (A) and the logo's Earth as the stage (B).
// One continuous shot: the globe is always on screen (big, or shrunk to a chip) and the colour field slides between scenes.
export const PIMENT_S = 68.5;
const CAPS = capsJson as unknown as TwmCap[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LAND = feature(land50 as any, (land50 as any).objects.land) as any;
const GRAT = geoGraticule10();

// ---------- word clock ----------
const norm = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9']/g, "");
const WORDS = CAPS.flatMap((c) => c.words).map((w) => ({ ...w, n: norm(w.t) }));
const wt = (word: string, nth = 1, end = false) => {
  const hits = WORDS.filter((w) => w.n === word);
  if (!hits[nth - 1]) throw new Error(`word not found: ${word} #${nth}`);
  return end ? hits[nth - 1].e : hits[nth - 1].s;
};
export const T = {
  monde: wt("monde"), cinq: wt("cinq"), ans1: wt("ans", 1), cepays: wt("ce"), inde: wt("l'inde", 1), et: wt("et", 1), mexique: wt("mexique", 1),
  labas: wt("labas"), six: wt("six"), y1493: wt("1493"), colomb: wt("colomb"), caraibes: wt("caraibes"), ilcroit: wt("croit"),
  poivre1: wt("poivre", 1), pimiento: wt("pimiento"), poivre2: wt("poivre", 2), mauvais1: wt("mauvais", 1), mauvais2: wt("mauvais", 2), mais: wt("mais"),
  rester: wt("rester"), ensuite: wt("ensuite"), marins: wt("marins"), portugais: wt("portugais"), goa: wt("goa", 1), seizieme: wt("seizieme"),
  avant: wt("avant"), poivre3: wt("poivre", 3), noir: wt("noir"), lepiment: wt("piment", 3), sud: wt("sud"), deux: wt("deux"), siecles: wt("siecles"),
  nord: wt("nord"), agoa: wt("goa", 2), pernambouc: wt("pernambouc"), bresil: wt("bresil"), aujourdhui: wt("aujourd'hui"),
  p1: wt("premier", 1), p2: wt("premier", 2), p3: wt("premier", 3), alors: wt("alors"), brule: wt("brule"), remercie: wt("remercie"),
  mexique2: wt("mexique", 2), mexique2e: wt("mexique", 2, true),
};
const END = T.mexique2e + 0.6;
const TITLE_OUT = 2.95;

// ---------- places and routes (lon, lat) ----------
type LL = [number, number];
const PL = { mexico: [-97.6, 19.0] as LL, caribbean: [-71.2, 19.0] as LL, spain: [-6.9, 37.2] as LL, lisbon: [-9.14, 38.72] as LL, goa: [73.83, 15.5] as LL,
  india: [79, 21.5] as LL, south: [77.6, 10.8] as LL, north: [77.2, 28.6] as LL, pernambuco: [-34.9, -8.05] as LL };
const densify = (pts: LL[]) => {
  const out: LL[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) { const f = geoInterpolate(pts[i - 1], pts[i]); for (let k = 1; k <= 30; k++) out.push(f(k / 30) as LL); }
  const cum = [0]; for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + geoDistance(out[i - 1], out[i]));
  return { pts: out, cum, len: cum[cum.length - 1] };
};
type Route = ReturnType<typeof densify>;
const headOf = (r: Route, u: number): { line: LL[]; head: LL } => {
  const L = clamp(u) * r.len; let i = 1;
  while (i < r.pts.length - 1 && r.cum[i] < L) i++;
  const f = (L - r.cum[i - 1]) / (r.cum[i] - r.cum[i - 1] || 1);
  const head = geoInterpolate(r.pts[i - 1], r.pts[i])(clamp(f)) as LL;
  return { line: [...r.pts.slice(0, i), head], head };
};
const legEase = (u: number) => {
  const x = clamp(u), A = 0.25, vmax = 1 / (1 - A);
  if (x < A) return (vmax * x * x) / (2 * A);
  if (x > 1 - A) return 1 - (vmax * (1 - x) * (1 - x)) / (2 * A);
  return vmax * (x - A / 2);
};
const ROUTES = [
  { r: densify([PL.spain, [-15.6, 28.2], [-35, 23.5], [-55, 20.5], PL.caribbean]), a: T.y1493 + 0.1, b: T.caraibes + 0.05 },
  { r: densify([PL.lisbon, [-17, 27], [-18.5, 14], [-10, 2], [8, -12], [15, -30], [20, -36], [30, -33], [40, -17], [42, -4], [55, 8], PL.goa]), a: T.portugais, b: T.goa },
  { r: densify([PL.south, [78.2, 16], [78.4, 22], PL.north]), a: T.deux - 0.1, b: T.nord + 0.05 },
  { r: densify([PL.pernambuco, [-10, -22], [20, -36], [40, -17], [55, 8], PL.goa]), a: T.pernambouc + 0.25, b: T.aujourdhui + 0.6 },
];
const routeU = (i: number, t: number) => legEase((t - ROUTES[i].a) / (ROUTES[i].b - ROUTES[i].a));

// ---------- keyed, smoothed channels ----------
const NF = Math.ceil(PIMENT_S * FPS) + 2;
const gauss = (arr: number[], sigma: number) => {
  const R = Math.ceil(sigma * 3);
  const w = Array.from({ length: 2 * R + 1 }, (_, i) => Math.exp(-((i - R) ** 2) / (2 * sigma * sigma)));
  return arr.map((_, i) => { let a = 0, ws = 0; for (let k = -R; k <= R; k++) { const j = Math.min(arr.length - 1, Math.max(0, i + k)); a += arr[j] * w[k + R]; ws += w[k + R]; } return a / ws; });
};
const sample = (arr: number[], f: number) => { const i = Math.max(0, Math.min(arr.length - 2, Math.floor(f))); const u = f - i; return arr[i] * (1 - u) + arr[i + 1] * u; };
// keys: [t, ...values]; logIdx = channels interpolated in log space (sizes)
const channels = (keys: number[][], logIdx: number[] = [], sigma = 6) => {
  const nc = keys[0].length - 1;
  return Array.from({ length: nc }, (_, c) => {
    const isLog = logIdx.includes(c);
    const warp = makeWarp(keys.map((k) => [k[0], isLog ? Math.log(k[c + 1]) : k[c + 1]]));
    const raw = Array.from({ length: NF }, (_, f) => warp(f / FPS));
    const sm = gauss(raw, sigma);
    return (f: number) => (isLog ? Math.exp(sample(sm, f)) : sample(sm, f));
  });
};

// globe: [t, x, y, size, lon, lat]. CHIP = small disc above the bottom UI zone; BIG = the stage; CLOSE = zoomed on India
const CHIP = [190, 1418, 170], BIG = [540, 1220, 1020], CLOSE = [540, 1250, 3000];
const G = (t: number, p: number[], lon: number, lat: number) => [t, p[0], p[1], p[2], lon, lat];
const GLOBE = channels([
  G(0, CHIP, 79, 18), G(T.cepays - 0.2, CHIP, 79, 18),
  G(T.inde + 0.05, BIG, 79, 20), G(T.et + 0.25, BIG, 74, 20),
  G(T.mexique + 0.05, BIG, -97, 19), G(T.labas + 0.15, BIG, -97, 19),
  G(T.labas + 0.95, CHIP, -97, 19), G(T.y1493 - 0.45, CHIP, -97, 19),
  G(T.y1493 + 0.35, BIG, -38, 25), G(T.caraibes + 0.1, BIG, -55, 22), G(T.ilcroit, BIG, -58, 22),
  G(T.ilcroit + 0.8, CHIP, -71, 19), G(T.rester + 0.2, CHIP, -71, 19),
  G(T.ensuite + 0.4, BIG, -9, 34), G(T.portugais + 0.4, BIG, -6, 25), G(T.portugais + 2.4, BIG, 14, -12), G(T.goa - 0.6, BIG, 50, 5), G(T.goa + 0.2, BIG, 66, 14),
  G(T.seizieme + 0.8, BIG, 70, 16),
  G(T.avant + 0.6, CHIP, 78, 20), G(T.noir + 0.6, CHIP, 78, 20),
  G(T.lepiment + 0.5, CLOSE, 78, 19), G(T.nord + 0.3, CLOSE, 78, 20.5),
  G(T.agoa + 0.4, BIG, 45, 6), G((T.agoa + T.pernambouc) / 2 + 0.3, BIG, 5, -6), G(T.pernambouc + 0.1, BIG, -32, -8), G(T.bresil + 0.2, BIG, -28, -8),
  G(T.aujourdhui + 0.5, BIG, 30, 4), G(T.p1 - 0.8, CHIP, 78, 21), G(T.remercie - 0.35, CHIP, 78, 21),
  G(T.remercie + 0.15, BIG, 10, 18), G(T.mexique2 + 0.05, BIG, -97, 19), G(PIMENT_S, BIG, -99, 19),
], [2]);

// red chili (the hero): [t, x, y, width, rot, opacity, follow-route weight]
const CHILI = channels([
  [0, 540, 1080, 760, -8, 1, 0], [T.cepays - 0.2, 540, 1080, 780, -4, 1, 0],
  [T.inde + 0.1, 830, 760, 260, 20, 1, 0], [T.mexique + 0.1, 790, 760, 260, 8, 1, 0],
  [T.labas + 0.4, 650, 900, 220, 0, 0, 0], [T.caraibes - 0.4, 650, 900, 220, 0, 0, 0],
  [T.caraibes + 0.1, 700, 1000, 200, 14, 1, 0], [T.ilcroit + 0.6, 330, 1080, 470, -12, 1, 0], [T.rester + 0.2, 330, 1080, 470, -8, 1, 0],
  [T.ensuite + 0.5, 540, 1000, 190, 10, 1, 1], [T.goa + 0.3, 540, 1000, 190, 10, 1, 1],
  [T.avant + 0.5, 540, 1000, 190, 0, 0, 1], [T.lepiment - 0.2, 540, 1000, 190, 0, 0, 1],
  [T.lepiment + 0.4, 540, 1000, 170, 8, 1, 1], [T.nord + 0.2, 540, 1000, 170, 8, 1, 1],
  [T.agoa + 0.5, 540, 1000, 170, 8, 1, 1], [T.pernambouc + 0.6, 540, 1000, 170, 8, 1, 1],
  [T.aujourdhui + 0.6, 540, 1000, 170, 8, 1, 1], [T.p1 - 0.7, 800, 1120, 290, -28, 1, 0], [T.alors - 0.2, 800, 1120, 290, -24, 1, 0],
  [T.alors + 0.6, 540, 1080, 800, -10, 1, 0], [T.remercie - 0.2, 540, 1080, 820, -6, 1, 0],
  [T.remercie + 0.4, 760, 820, 230, 16, 1, 0], [PIMENT_S, 760, 820, 230, 12, 1, 0],
], [2], 5);
// which route the chili follows when "follow" > 0
const followRoute = (t: number) => (t < T.avant + 0.5 ? 1 : t < T.agoa ? 2 : 3);

// colour field: [t, inner rgb, outer rgb]
type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const RED = { a: hex("#E2492F"), b: hex("#7E150E") }, NIGHT = { a: hex("#17565F"), b: hex("#0A2E33") }, TEAL = { a: hex("#2C7F83"), b: hex("#0B3439") };
const GREEN = { a: hex("#3E7B4C"), b: hex("#122D1C") }, OCHRE = { a: hex("#C98A2B"), b: hex("#5E360A") }, GOLD = { a: hex("#DFA13A"), b: hex("#7A4A0E") };
const FIELD: { t: number; c: { a: RGB; b: RGB } }[] = [
  { t: 0, c: RED }, { t: T.cepays - 0.3, c: RED }, { t: T.inde, c: NIGHT }, { t: T.labas + 0.2, c: NIGHT },
  { t: T.labas + 0.9, c: TEAL }, { t: T.y1493 - 0.3, c: TEAL }, { t: T.y1493 + 0.3, c: NIGHT }, { t: T.ilcroit, c: NIGHT },
  { t: T.ilcroit + 0.7, c: GREEN }, { t: T.rester + 0.3, c: GREEN }, { t: T.ensuite + 0.3, c: NIGHT }, { t: T.seizieme + 0.6, c: NIGHT },
  { t: T.avant + 0.5, c: OCHRE }, { t: T.noir + 0.6, c: OCHRE }, { t: T.lepiment + 0.4, c: NIGHT }, { t: T.aujourdhui + 0.4, c: NIGHT },
  { t: T.p1 - 0.7, c: GOLD }, { t: T.alors - 0.2, c: GOLD }, { t: T.alors + 0.5, c: RED }, { t: T.remercie - 0.2, c: RED },
  { t: T.remercie + 0.4, c: NIGHT }, { t: PIMENT_S, c: NIGHT },
];
const fieldAt = (t: number) => {
  let i = 0; while (i < FIELD.length - 2 && FIELD[i + 1].t <= t) i++;
  const A = FIELD[i], B = FIELD[i + 1], u = ramp(t, A.t, B.t);
  const mix = (p: RGB, q: RGB) => p.map((v, k) => Math.round(v + (q[k] - v) * u)).join(",");
  return { a: mix(A.c.a, B.c.a), b: mix(A.c.b, B.c.b) };
};

// ---------- globe ----------
type Pin = { ll: LL; on: [number, number]; label?: string; left?: boolean; pulse?: number; big?: boolean };
const PINS: Pin[] = [
  { ll: PL.india, on: [T.inde - 0.15, T.mexique - 0.3], label: "INDE", pulse: T.inde, big: true },
  { ll: PL.mexico, on: [T.mexique - 0.1, T.y1493], label: "MEXIQUE", pulse: T.mexique, big: true },
  { ll: PL.spain, on: [T.y1493, T.ilcroit + 0.5], label: "ESPAGNE" },
  { ll: PL.caribbean, on: [T.caraibes - 0.15, T.ilcroit + 0.5], label: "CARAÏBES", pulse: T.caraibes, left: true },
  { ll: PL.lisbon, on: [T.ensuite - 0.1, T.avant], label: "LISBONNE", pulse: T.ensuite + 0.4, left: true },
  { ll: PL.goa, on: [T.goa - 0.15, END], label: "GOA", pulse: T.goa, left: true, big: true },
  { ll: PL.south, on: [T.sud - 0.15, T.agoa + 0.3], label: "SUD", pulse: T.sud },
  { ll: PL.north, on: [T.nord - 0.1, T.agoa + 0.3], label: "NORD", pulse: T.nord },
  { ll: PL.pernambuco, on: [T.pernambouc - 0.15, T.aujourdhui + 0.5], label: "PERNAMBOUC", pulse: T.pernambouc, left: true, big: true },
  { ll: PL.mexico, on: [T.mexique2 - 0.15, END + 0.4], label: "MEXIQUE", pulse: T.mexique2, big: true },
];
const makeProj = (f: number) => {
  const [x, y, size, lon, lat] = GLOBE.map((c) => c(f));
  return { x, y, size, lon, lat, pr: geoOrthographic().scale(size / 2).translate([x, y]).rotate([-lon, -lat]).clipAngle(90) };
};
const visible = (ll: LL, lon: number, lat: number) => geoDistance(ll, [lon, lat]) < Math.PI / 2 - 0.05;

const Globe: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const { x, y, size, lon, lat, pr } = makeProj(f);
  const p = geoPath(pr);
  const r = size / 2;
  const chip = clamp((420 - size) / 250);               // 1 when the globe is a chip
  const k = clamp(size / 1020, 0.35, 1.6);                // stroke scale
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <radialGradient id="gsea" cx="50%" cy="45%" r="55%"><stop offset="0" stopColor="#1B6670" /><stop offset="1" stopColor={C.sea} /></radialGradient>
        <radialGradient id="gshade" cx="36%" cy="30%" r="78%"><stop offset="0" stopColor="#fff" stopOpacity=".22" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".5" /></radialGradient>
        <radialGradient id="gglow"><stop offset=".85" stopColor={C.mustard} stopOpacity=".28" /><stop offset="1" stopColor={C.mustard} stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 1.12} fill="url(#gglow)" opacity={1 - chip} />
      <circle cx={x} cy={y} r={r} fill="url(#gsea)" />
      <path d={p(GRAT) ?? ""} fill="none" stroke="#fff" strokeOpacity={0.08} strokeWidth={1.5} />
      <path d={p(LAND) ?? ""} fill={C.land} stroke={C.coast} strokeWidth={Math.max(1, 2.2 * k)} strokeLinejoin="round" />
      {ROUTES.map((R, i) => {
        const u = routeU(i, t);
        if (u <= 0) return null;
        const fade = i === 3 ? 1 - ramp(t, T.p1 - 1.0, T.p1 - 0.4) : i === 2 ? 1 - ramp(t, T.agoa, T.agoa + 0.5) : 1;
        return <path key={i} d={p({ type: "LineString", coordinates: headOf(R.r, u).line }) ?? ""} fill="none" stroke={C.red} strokeWidth={10 * Math.min(k, 1)}
          strokeLinecap="round" strokeDasharray={`2 22`} opacity={fade} />;
      })}
      {PINS.map((q, i) => {
        const on = win(t, q.on[0], q.on[1], 0.25, 0.35) * (1 - chip);
        if (on <= 0.01 || !visible(q.ll, lon, lat)) return null;
        const [px, py] = pr(q.ll)!;
        const pu = q.pulse !== undefined ? clamp((t - q.pulse) / 0.9) : 1;
        const pop = 1 + (1 - backOut(clamp((t - q.on[0]) / 0.4), 2.2)) * 0.8;
        const rr = (q.big ? 18 : 13) * pop;
        return (
          <g key={i} opacity={on}>
            {pu < 1 && <circle cx={px} cy={py} r={rr * (1.2 + pu * 3)} fill="none" stroke={C.mustard} strokeWidth={5} opacity={1 - pu} />}
            <circle cx={px} cy={py} r={rr} fill={C.red} stroke={C.cream} strokeWidth={6} />
            {q.label && <text x={px + (q.left ? -1 : 1) * 34} y={py + 16} textAnchor={q.left ? "end" : "start"} fontFamily="Oswald" fontWeight={700}
              fontSize={52} letterSpacing={3} fill="#fff" stroke={C.night} strokeWidth={10} style={{ paintOrder: "stroke" }}>{q.label}</text>}
          </g>
        );
      })}
      <circle cx={x} cy={y} r={r} fill="url(#gshade)" />
      <circle cx={x} cy={y} r={r + 4} fill="none" stroke={C.cream} strokeOpacity={0.45 + 0.3 * chip} strokeWidth={3 + 2 * chip} />
    </svg>
  );
};

// ---------- food cut-outs and kinetic type ----------
const Food: React.FC<{ src: string; x: number; y: number; w: number; rot?: number; o?: number; shadow?: number; bright?: number }> = ({ src, x, y, w, rot = 0, o = 1, shadow = 1, bright = 1 }) => (
  o <= 0.005 ? null : (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, opacity: o, transform: `translate(0,-50%) rotate(${rot}deg)` }}>
      <Img src={staticFile(src)} style={{ width: "100%", display: "block", filter: `drop-shadow(0 ${30 * shadow}px ${40 * shadow}px rgba(0,0,0,.5)) saturate(1.1) contrast(1.05) brightness(${bright})` }} />
    </div>
  )
);
// pop-in / fly-out for secondary foods and words
const popIn = (t: number, a: number, b: number) => {
  const u = clamp((t - a) / 0.55), out = ramp(t, b - 0.35, b + 0.1);
  return { o: clamp(u * 2.5) * (1 - out), s: (0.6 + 0.4 * backOut(u, 1.5)) * (1 - 0.15 * out), dy: (1 - easeOut(u)) * 160 - out * 120 };
};
const Big: React.FC<{ t: number; a: number; b: number; y: number; children: React.ReactNode; fs?: number; color?: string; font?: string; ls?: number }> = ({
  t, a, b, y, children, fs = 150, color = C.mustard, font = "Oswald", ls = 4,
}) => {
  const p = popIn(t, a, b);
  if (p.o <= 0.005) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: p.o, transform: `translateY(${p.dy * 0.3}px) scale(${p.s})`, whiteSpace: "nowrap",
      fontFamily: font, fontWeight: font === "Oswald" ? 700 : 900, fontSize: fs, letterSpacing: ls, lineHeight: 1, color, textShadow: "0 10px 40px rgba(0,0,0,.45)" }}>{children}</div>
  );
};
const Pill: React.FC<{ t: number; a: number; b: number; x: number; y: number; children: React.ReactNode; bg?: string; color?: string }> = ({ t, a, b, x, y, children, bg = C.mustard, color = C.night }) => {
  const p = popIn(t, a, b);
  if (p.o <= 0.005) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${p.s})`, opacity: p.o, background: bg, color, fontFamily: "Oswald", fontWeight: 700,
      fontSize: 44, letterSpacing: 4, padding: "12px 30px", borderRadius: 14, whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(0,0,0,.35)" }}>{children}</div>
  );
};
// red banner that slams in ("MAUVAIS PAYS")
const Slam: React.FC<{ t: number; a: number; b: number; y: number; rot: number; children: React.ReactNode }> = ({ t, a, b, y, rot, children }) => {
  if (t < a - 0.02 || t > b + 0.4) return null;
  const u = clamp((t - a) / 0.14), out = ramp(t, b - 0.2, b + 0.3);
  return (
    <div style={{ position: "absolute", left: -40, right: -40, top: y, transform: `translateY(-50%) rotate(${rot}deg) scale(${1 + (1 - u) * 0.9})`, opacity: clamp(u * 2) * (1 - out),
      background: C.red, color: C.cream, textAlign: "center", fontFamily: "Oswald", fontWeight: 700, fontSize: 96, letterSpacing: 8, padding: "14px 0",
      boxShadow: "0 18px 40px rgba(0,0,0,.45)" }}>{children}</div>
  );
};
const ChipLabel: React.FC<{ t: number; chip: number }> = ({ t, chip }) => {
  const items: [number, number, string, string][] = [
    [T.labas + 0.8, T.y1493 - 0.3, "MEXIQUE", "là où tout commence"], [T.ilcroit + 0.7, T.rester + 0.2, "CARAÏBES", "1493"],
    [T.avant + 0.5, T.noir + 0.5, "INDE", "avant le piment"], [T.p1 - 0.6, T.remercie - 0.35, "INDE", "aujourd'hui"],
  ];
  return (
    <>
      {items.map(([a, b, l, s], i) => {
        const o = win(t, a, b, 0.3, 0.3) * chip;
        if (o <= 0.01) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 300, top: 1418, transform: `translate(${(1 - o) * -30}px,-50%)`, opacity: o }}>
            <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 50, letterSpacing: 4, color: "#fff", lineHeight: 1, textShadow: "0 3px 10px rgba(0,0,0,.5)" }}>{l}</div>
            <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 28, color: C.mustard, marginTop: 6 }}>{s}</div>
          </div>
        );
      })}
    </>
  );
};

const STARS = Array.from({ length: 70 }, (_, i) => ({ x: ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1, y: ((Math.sin(i * 78.233) * 12345.678) % 1 + 1) % 1, r: 1 + ((i * 7) % 3) * 0.6 }));

export const PimentFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const fld = fieldAt(t);
  const gsize = GLOBE[2](frame);
  const chip = clamp((420 - gsize) / 250);
  const [cx0, cy0, cw, crot, co, cfollow] = CHILI.map((c) => c(frame));
  // the chili rides the head of the active route on the globe
  let cx = cx0, cy = cy0;
  if (cfollow > 0.001) {
    const ri = followRoute(t), { lon, lat, pr } = makeProj(frame);
    const head = headOf(ROUTES[ri].r, routeU(ri, t)).head;
    if (visible(head, lon, lat)) { const [hx, hy] = pr(head)!; cx = cx0 + (hx + 40 - cx0) * cfollow; cy = cy0 + (hy - 110 - cy0) * cfollow; }
  }
  const bob = Math.sin(t * 2.2) * 6;
  const fadeIn = ramp(t, 0, 0.5), fadeOut = 1 - ramp(t, PIMENT_S - 1.4, PIMENT_S - 0.1);
  const titleO = 1 - ramp(t, TITLE_OUT - 0.1, TITLE_OUT + 0.35);
  const heat = win(t, T.brule - 0.3, T.remercie, 0.4, 0.4);
  const heap = popIn(t, T.six - 0.35, T.y1493 - 0.2);
  const pep1 = popIn(t, T.poivre1 - 0.2, T.mais + 0.2);
  const pep2 = popIn(t, T.avant + 0.3, T.lepiment + 0.1);
  const counter = Math.round(500 * easeOut(clamp((t - T.cinq) / (T.ans1 - T.cinq + 0.2))));
  return (
    <AbsoluteFill style={{ background: `rgb(${fld.b})`, overflow: "hidden" }}>
      <Audio src={staticFile("piment/mix.wav")} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 62% at 50% 60%, rgb(${fld.a}) 0%, rgb(${fld.b}) 78%)` }} />
      <AbsoluteFill style={{ background: "repeating-radial-gradient(circle at 50% 62%, rgba(255,255,255,.03) 0 2px, transparent 2px 46px)", opacity: chip }} />
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 1 - chip }}>
        {STARS.map((s, i) => <circle key={i} cx={s.x * 1080} cy={s.y * 1920} r={s.r} fill="#fff" opacity={0.25 + 0.25 * Math.sin(t * 1.5 + i)} />)}
      </svg>

      {/* big numbers sit behind the food */}
      {t > T.cinq - 0.1 && t < T.cepays + 0.3 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontFamily: "Oswald", fontWeight: 700, fontSize: 230, lineHeight: 1, color: C.mustard,
          opacity: ramp(t, T.cinq - 0.1, T.cinq + 0.15) * (1 - ramp(t, T.cepays - 0.3, T.cepays + 0.2)), textShadow: "0 10px 40px rgba(0,0,0,.4)" }}>
          {counter}<span style={{ fontSize: 80, letterSpacing: 10 }}> ANS</span>
        </div>
      )}
      <Big t={t} a={T.six - 0.05} b={T.y1493 - 0.2} y={640} fs={220}>6 000<span style={{ fontSize: 80, letterSpacing: 12 }}> ANS</span></Big>

      <Globe t={t} f={frame} />
      <ChipLabel t={t} chip={chip} />

      {/* secondary foods */}
      <Food src="food/dried_heap.png" x={560} y={1170 + heap.dy} w={720 * heap.s} rot={-3} o={heap.o} />
      <Food src="food/peppercorns.png" x={790} y={1110 + pep1.dy} w={430 * pep1.s} rot={6} o={pep1.o} />
      <Food src="food/peppercorns.png" x={540} y={1080 + pep2.dy} w={600 * pep2.s} rot={-4} o={pep2.o} />
      {/* the hero chili */}
      {heat > 0.01 && <div style={{ position: "absolute", left: cx - 520, top: cy - 520, width: 1040, height: 1040, borderRadius: "50%", opacity: heat * (0.75 + 0.25 * Math.sin(t * 8)),
        background: "radial-gradient(circle, rgba(255,140,40,.75), rgba(255,80,20,.3) 45%, rgba(255,60,0,0) 70%)" }} />}
      <Food src="food/red_chili.png" x={cx} y={cy + bob} w={cw} rot={crot + Math.sin(t * 1.3) * 1.5} o={co} shadow={clamp(cw / 600, 0.4, 1)} bright={1 + heat * 0.15} />

      {/* kinetic words */}
      <Pill t={t} a={T.y1493} b={T.ilcroit + 0.3} x={540} y={720}>1493 · COLOMB</Pill>
      <Big t={t} a={T.pimiento} b={T.mais} y={760} fs={84} color={C.cream} ls={5}><span style={{ color: C.mustard }}>« PIMIENTO »</span> <span style={{ opacity: ramp(t, T.poivre2 - 0.05, T.poivre2 + 0.2) }}>= POIVRE ?</span></Big>
      <Slam t={t} a={T.mauvais1 - 0.03} b={T.ensuite} y={1300} rot={-4}>MAUVAIS PAYS</Slam>
      <Slam t={t} a={T.mauvais2 - 0.03} b={T.ensuite} y={1440} rot={3}>MAUVAIS NOM</Slam>
      <Pill t={t} a={T.seizieme - 0.1} b={T.avant + 0.3} x={540} y={720}>DÉBUT DU XVIe SIÈCLE</Pill>
      <Big t={t} a={T.avant + 0.2} b={T.lepiment} y={690} fs={76} color={C.night} ls={8}>AVANT : <span style={{ color: "#fff" }}>LE POIVRE NOIR</span></Big>
      <Pill t={t} a={T.siecles - 0.1} b={T.agoa + 0.2} x={760} y={1060}>2 SIÈCLES</Pill>
      <Pill t={t} a={T.pernambouc - 0.1} b={T.aujourdhui + 0.3} x={540} y={720} bg={C.cream}>« POIVRE DE PERNAMBOUC »</Pill>
      {/* today: three times first */}
      {[T.p1, T.p2, T.p3].map((at, i) => {
        const p = popIn(t, at - 0.12, T.alors + 0.2);
        if (p.o <= 0.005) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 80, top: 960 + i * 118, opacity: p.o, transform: `translateX(${(1 - p.s) * -300}px)`, display: "flex", alignItems: "baseline", gap: 22 }}>
            <span style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 100, color: C.night }}>1<sup style={{ fontSize: 46 }}>er</sup></span>
            <span style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 64, letterSpacing: 4, color: "#fff", textShadow: "0 4px 14px rgba(0,0,0,.35)" }}>{["PRODUCTEUR", "CONSOMMATEUR", "EXPORTATEUR"][i]}</span>
          </div>
        );
      })}
      <Big t={t} a={T.mexique2e + 0.02} b={END + 0.3} y={720} fs={120} color={C.cream} font="Playfair Display" ls={0}>Merci, <span style={{ color: C.mustard }}>Mexique</span></Big>

      {/* title / thumbnail */}
      {titleO > 0.001 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", opacity: titleO }}>
          <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 36, letterSpacing: 12, color: C.mustard }}>LE PIMENT</div>
          <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 176, lineHeight: 0.95, color: "#fff", marginTop: 18, textShadow: "0 8px 30px rgba(0,0,0,.35)",
            transform: `scale(${1.06 - 0.06 * easeOut(t / 1.2)})` }}>PAS<br />INDIEN<span style={{ color: C.mustard }}>?!</span></div>
          <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 38, color: "rgba(255,255,255,.88)", marginTop: 20 }}>Chili peppers aren't Indian</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 820, background: "linear-gradient(180deg, rgba(0,0,0,.6), rgba(0,0,0,.3) 50%, rgba(0,0,0,0))" }} />
      <TwmCaptions t={t} caps={CAPS} showFrom={TITLE_OUT + 0.1} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 95% 70% at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45))" }} />
      <Watermark opacity={ramp(t, 1.0, 1.8)} />
      <EndCard t={t} tIn={END} teaser="Demain : un autre plat, une autre histoire vraie." />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeIn * fadeOut }} />
    </AbsoluteFill>
  );
};
