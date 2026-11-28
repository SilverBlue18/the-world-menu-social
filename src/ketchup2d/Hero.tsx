// Ketchup 2D, attempt 2 (code only, user request): no little people. Editorial "food poster" illustrations: one big hero
// object per beat, three tones per surface (base / shadow / light) with one consistent light from the top-left, fine paper
// grain, plus a real-coastline map for the journeys. Built as SVG so Remotion can animate every part.
import React from "react";
// @ts-ignore  plain JS data module (Natural Earth 1:50m, public domain)
import { COUNTRIES } from "./geo.js";

export const K = {
  tomato: "#D7263D", tomatoDk: "#A3192C", tomatoLt: "#EE5266", olive: "#3E5F3A", oliveDk: "#2A4227", oliveLt: "#5F8355",
  cream: "#F6F1E7", creamDk: "#E4D8C2", charcoal: "#2B2B2B", ink: "#1E1E1E",
  clay: "#B0673C", clayDk: "#7E4526", clayLt: "#D18A5A", silver: "#C7D0CE", silverDk: "#8E9B98", silverLt: "#EEF2F1",
};

// fine paper grain over everything (flat colours + texture = printed-poster feel)
export const Grain: React.FC<{ id: string; a?: number }> = ({ id, a = 0.22 }) => (
  <>
    <filter id={id} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -0.45" /></filter>
    <rect x="-400" y="-400" width="1880" height="2720" filter={`url(#${id})`} opacity={a} style={{ mixBlendMode: "multiply" }} />
  </>
);

// ---------- hero 1: a glazed fermentation jar packed with fish (kê-tsiap) ----------
const FishHead: React.FC<{ x: number; y: number; r: number; s?: number }> = ({ x, y, r, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M0 0 C40 -60 150 -70 220 -20 C250 0 250 20 220 40 C150 90 40 70 0 20 Z" fill={K.silver} />
    <path d="M0 10 C50 50 150 70 220 40 C250 25 250 10 240 2 C190 40 90 40 0 10 Z" fill={K.silverDk} />
    <path d="M30 -18 C80 -50 160 -52 205 -22" stroke={K.silverLt} strokeWidth="10" fill="none" strokeLinecap="round" />
    {[0, 1, 2, 3].map((i) => [0, 1].map((j) => <path key={`${i}${j}`} d={`M${50 + i * 36} ${-12 + j * 30} q14 14 0 28`} stroke={K.silverDk} strokeWidth="4" fill="none" opacity="0.7" />))}
    <path d="M150 -26 Q170 6 150 44" stroke={K.silverDk} strokeWidth="6" fill="none" />
    <circle cx="188" cy="-2" r="15" fill={K.cream} /><circle cx="190" cy="-2" r="9" fill={K.ink} /><circle cx="186" cy="-6" r="3" fill="#fff" />
    <path d="M232 26 Q240 32 230 38" stroke={K.ink} strokeWidth="4" fill="none" strokeLinecap="round" />
  </g>
);
const FishTail: React.FC<{ x: number; y: number; r: number; s?: number }> = ({ x, y, r, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M0 0 C-30 -10 -60 -60 -90 -70 C-70 -30 -70 30 -90 70 C-60 60 -30 10 0 0 Z" fill={K.silver} />
    <path d="M0 0 C-30 10 -60 60 -90 70 C-76 40 -74 20 -72 8 Z" fill={K.silverDk} />
    {[-40, -15, 10, 35].map((v) => <path key={v} d={`M-10 0 L-80 ${v * 1.4}`} stroke={K.silverDk} strokeWidth="3" opacity="0.6" />)}
  </g>
);
export const JarHero: React.FC<{ t?: number }> = ({ t = 0 }) => {
  const body = "M330 760 C250 820 205 960 215 1120 C226 1300 300 1440 400 1500 L680 1500 C780 1440 854 1300 865 1120 C875 960 830 820 750 760 Z";
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs><clipPath id="jarclip"><path d={body} /></clipPath></defs>
      <rect width="1080" height="1920" fill={K.tomato} />
      <circle cx="540" cy="1060" r="520" fill={K.tomatoLt} opacity="0.35" />
      {[600, 680, 760].map((r) => <circle key={r} cx="540" cy="1060" r={r} fill="none" stroke={K.cream} strokeOpacity="0.12" strokeWidth="3" />)}
      <ellipse cx="540" cy="1520" rx="390" ry="56" fill={K.tomatoDk} />
      {/* fish packed in the jar mouth */}
      <FishTail x={430} y={720} r={-110} s={1.05} />
      <FishHead x={560} y={760} r={-70} s={0.95} />
      <FishHead x={420} y={790} r={-115} s={0.85} />
      <FishTail x={680} y={740} r={-60} s={0.9} />
      {/* jar body: base, shadow side, light side */}
      <path d={body} fill={K.clay} />
      <g clipPath="url(#jarclip)">
        <path d="M560 700 C760 760 900 1000 880 1200 C860 1400 760 1500 640 1540 L1000 1600 L1000 700 Z" fill={K.clayDk} />
        <path d="M300 860 C250 980 250 1180 300 1330" stroke={K.clayLt} strokeWidth="34" fill="none" strokeLinecap="round" />
        <path d="M200 900 C330 950 750 950 880 900 L880 1010 C750 1060 330 1060 200 1010 Z" fill={K.olive} />
        <path d="M200 1010 C330 1060 750 1060 880 1010" stroke={K.oliveDk} strokeWidth="10" fill="none" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${250 + i * 95} 1030 q12 50 0 70 q-12 -20 0 -70`} fill={K.olive} />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${255 + i * 100} 960 q25 -30 50 0 q25 30 50 0`} stroke={K.cream} strokeWidth="7" fill="none" strokeLinecap="round" />)}
        <path d="M200 1300 C330 1340 750 1340 880 1300" stroke={K.clayDk} strokeWidth="8" fill="none" opacity="0.6" />
      </g>
      {/* rim */}
      <ellipse cx="540" cy="760" rx="232" ry="44" fill={K.clayDk} />
      <path d="M308 760 C340 724 740 724 772 760" stroke={K.clayLt} strokeWidth="14" fill="none" strokeLinecap="round" />
      {/* salt crystals + fermentation bubbles */}
      {[[200, 1490, 14], [880, 1480, 10], [150, 1530, 8], [930, 1520, 12], [300, 1540, 7], [790, 1545, 8]].map(([x, y, s], i) => (
        <rect key={i} x={x} y={y} width={s} height={s} fill={K.cream} transform={`rotate(45 ${x} ${y})`} />))}
      {[0, 1, 2, 3, 4].map((i) => { const p = ((t * 0.5 + i * 0.21) % 1); return <circle key={i} cx={470 + i * 34 + Math.sin(i * 7 + t * 2) * 10} cy={700 - p * 260} r={6 + (i % 3) * 3} fill="none" stroke={K.cream} strokeWidth="4" opacity={1 - p} />; })}
      <Grain id="gj" />
    </svg>
  );
};

// ---------- hero 2: the journey map (real coastlines), Mercator ----------
const D2R = Math.PI / 180, merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + Math.max(-80, Math.min(80, lat)) * D2R / 2)) / D2R;
export const mapProj = (view: { lon: number; lat: number; scale: number }) => (lon: number, lat: number) =>
  [540 + (lon - view.lon) * view.scale, 980 - (merc(lat) - merc(view.lat)) * view.scale] as [number, number];
const pathFor = (P: (a: number, b: number) => [number, number], filter?: (n: string) => boolean) => {
  let d = "";
  for (const c of COUNTRIES as { n: string; r: number[][][] }[]) {
    if (filter && !filter(c.n)) continue;
    for (const ring of c.r) { ring.forEach(([lo, la], i) => { const [x, y] = P(lo, la); d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }); d += "Z"; }
  }
  return d;
};
export const MapHero: React.FC<{ view?: { lon: number; lat: number; scale: number }; route?: [number, number][]; progress?: number; t?: number }> = ({ view = { lon: 50, lat: 20, scale: 6.2 }, route = [[113.3, 23.1], [104, 1.3], [80, -5], [55, -20], [20, -36], [-10, 10], [-12, 40], [-2.5, 51]], progress = 0.62 }) => {
  const P = mapProj(view);
  const land = pathFor(P), hiCN = pathFor(P, (n) => n === "China"), hiUK = pathFor(P, (n) => n === "United Kingdom");
  const pts = route.map(([a, b]) => P(a, b));
  const seg = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("");
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="2.2" fill={K.cream} opacity="0.13" /></pattern></defs>
      <rect width="1080" height="1920" fill={K.olive} />
      <rect width="1080" height="1920" fill="url(#dots)" />
      <path d={land} fill={K.oliveDk} transform="translate(8 12)" />
      <path d={land} fill={K.cream} stroke={K.creamDk} strokeWidth="2" strokeLinejoin="round" />
      <path d={hiCN} fill={K.tomato} /><path d={hiUK} fill={K.tomato} />
      <path d={seg} fill="none" stroke={K.charcoal} strokeWidth="9" strokeDasharray="22 16" strokeLinecap="round" pathLength={1000} strokeDashoffset={0}
        style={{ strokeDasharray: `22 16`, clipPath: undefined }} opacity="0.85" />
      <path d={seg} fill="none" stroke={K.tomato} strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray={`${progress} 1`} />
      {[pts[0], pts[pts.length - 1]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="22" fill={K.tomato} stroke={K.cream} strokeWidth="7" /></g>)}
      <g fontFamily="Inter" fontWeight="800" fontSize="34" letterSpacing="4">
        <text x={pts[0][0] - 30} y={pts[0][1] + 70} fill={K.charcoal} textAnchor="end">CHINA</text>
        <text x={pts[pts.length - 1][0] + 36} y={pts[pts.length - 1][1] - 26} fill={K.charcoal}>ENGLAND</text>
      </g>
      <Grain id="gm" a={0.18} />
    </svg>
  );
};

const Cap: React.FC<{ a: string; hl: string; b: string; fr: string; dark?: boolean }> = ({ a, hl, b, fr }) => (
  <div style={{ position: "absolute", left: 70, right: 150, top: 250, textAlign: "center", fontFamily: "Inter" }}>
    <div style={{ fontWeight: 800, fontSize: 68, lineHeight: 1.08, color: "#fff", textShadow: "0 3px 8px rgba(0,0,0,.45)" }}>{a}<span style={{ color: K.cream, background: K.charcoal, padding: "0 10px", borderRadius: 8 }}>{hl}</span>{b}</div>
    <div style={{ fontWeight: 600, fontSize: 34, color: K.cream, marginTop: 14, textShadow: "0 2px 6px rgba(0,0,0,.5)" }}>{fr}</div>
  </div>
);
export const Frame2B_Jar: React.FC = () => (<div style={{ position: "absolute", inset: 0 }}><JarHero t={0.4} /><Cap a="people fermented " hl="fish" b="" fr="on faisait fermenter du poisson" /></div>);
export const Frame2B_Map: React.FC = () => (<div style={{ position: "absolute", inset: 0 }}><MapHero /><Cap a="English merchants tasted it in " hl="Asia" b="" fr="des marchands anglais la goûtent en Asie" /></div>);
