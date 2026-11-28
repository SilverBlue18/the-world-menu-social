// Map moments for the 2D ketchup video (user, 2026-11-28: "the map was a good idea when we talk about travel").
// Real Natural Earth coastlines, flat brand colours: olive sea with a dot grid, cream land with a soft drop shadow,
// tomato for the places in the story, a dashed route that draws itself with a little ship riding its head.
// The camera {lon, lat, scale} is animated per scene. Rings crossing the antimeridian and Antarctica are skipped
// (they caused the stray horizontal bands in the first test).
import React from "react";
// @ts-ignore  plain JS data module
import { COUNTRIES } from "./geo.js";
import { K, Grain } from "./Hero";

type View = { lon: number; lat: number; scale: number };
const D2R = Math.PI / 180;
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + Math.max(-80, Math.min(80, lat)) * D2R / 2)) / D2R;
const proj = (v: View) => (lon: number, lat: number): [number, number] => [540 + (lon - v.lon) * v.scale, 1260 - (merc(lat) - merc(v.lat)) * v.scale];
const RINGS = (COUNTRIES as { n: string; r: number[][][] }[]).filter((c) => c.n !== "Antarctica")
  .flatMap((c) => c.r.filter((ring) => ring.every((p, i) => i === 0 || Math.abs(p[0] - ring[i - 1][0]) < 180)).map((ring) => ({ n: c.n, ring })));
const pathFor = (P: (a: number, b: number) => [number, number], only?: string[]) => {
  let d = "";
  for (const { n, ring } of RINGS) {
    if (only && !only.includes(n)) continue;
    ring.forEach(([lo, la], i) => { const [x, y] = P(lo, la); d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); });
    d += "Z";
  }
  return d;
};
const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const lerpV = (a: View, b: View, k: number): View => ({ lon: a.lon + (b.lon - a.lon) * k, lat: a.lat + (b.lat - a.lat) * k, scale: a.scale * Math.pow(b.scale / a.scale, k) });

const MiniShip: React.FC<{ x: number; y: number; ang: number }> = ({ x, y, ang }) => (
  <g transform={`translate(${x} ${y}) rotate(${(Math.cos(ang) < 0 ? 180 : 0)}) scale(${Math.cos(ang) < 0 ? -1 : 1} 1)`}>
    <g transform={Math.cos(ang) < 0 ? "scale(-1 1)" : ""}>
      <path d="M-38 0 L38 0 L28 16 L-28 16 Z" fill={K.charcoal} /><rect x={-3} y={-58} width={6} height={58} fill={K.charcoal} />
      <path d="M3 -54 Q32 -32 3 -6 Z" fill={K.cream} stroke={K.charcoal} strokeWidth="3" /><path d="M-3 -50 Q-28 -30 -3 -10 Z" fill={K.cream} stroke={K.charcoal} strokeWidth="3" />
    </g>
  </g>
);

const MapBase: React.FC<{ v: View; hi: string[]; id: string; children?: (P: (a: number, b: number) => [number, number]) => React.ReactNode }> = ({ v, hi, id, children }) => {
  const P = proj(v);
  const land = pathFor(P);
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs><pattern id={`dot${id}`} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="2.4" fill={K.cream} opacity="0.14" /></pattern></defs>
      <rect width="1080" height="1920" fill={K.olive} /><rect width="1080" height="1920" fill={`url(#dot${id})`} />
      <path d={land} fill={K.oliveDk} transform="translate(7 11)" />
      <path d={land} fill={K.cream} stroke={K.creamDk} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={pathFor(P, hi)} fill={K.tomato} stroke={K.tomatoDk} strokeWidth="2" strokeLinejoin="round" />
      {children?.(P)}
      <Grain id={`g${id}`} a={0.16} />
    </svg>
  );
};
const Pin: React.FC<{ x: number; y: number; t: number; label: string; side?: 1 | -1 }> = ({ x, y, t, label, side = 1 }) => {
  const k = Math.min(1, t / 0.35), pulse = (t * 1.2) % 1;
  return (
    <g>
      <circle cx={x} cy={y} r={20 + pulse * 70} fill="none" stroke={K.charcoal} strokeWidth="6" opacity={1 - pulse} />
      <g transform={`translate(${x} ${y}) scale(${k})`}><path d="M0 0 C-34 -46 -34 -88 0 -88 C34 -88 34 -46 0 0 Z" fill={K.charcoal} stroke={K.cream} strokeWidth="6" /><circle cx="0" cy="-58" r="12" fill={K.cream} /></g>
      <text x={x + side * 46} y={y - 40} textAnchor={side > 0 ? "start" : "end"} fontFamily="Inter" fontWeight="800" fontSize="40" letterSpacing="4" fill={K.charcoal} stroke={K.cream} strokeWidth="10" paintOrder="stroke" opacity={k}>{label}</text>
    </g>
  );
};
// route along lon/lat waypoints, drawn to fraction p; returns the svg + the head position
const Route: React.FC<{ P: (a: number, b: number) => [number, number]; pts: [number, number][]; p: number }> = ({ P, pts, p }) => {
  const xy = pts.map(([a, b]) => P(a, b));
  const L = [0]; for (let i = 1; i < xy.length; i++) L.push(L[i - 1] + Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]));
  const target = L[L.length - 1] * Math.max(0, Math.min(1, p)); let n = 1; while (n < xy.length - 1 && L[n] < target) n++;
  const k = L[n] > L[n - 1] ? (target - L[n - 1]) / (L[n] - L[n - 1]) : 0;
  const head: [number, number] = [xy[n - 1][0] + (xy[n][0] - xy[n - 1][0]) * k, xy[n - 1][1] + (xy[n][1] - xy[n - 1][1]) * k];
  const ang = Math.atan2(xy[n][1] - xy[n - 1][1], xy[n][0] - xy[n - 1][0]);
  const d = xy.slice(0, n).map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("") + `L${head[0].toFixed(1)} ${head[1].toFixed(1)}`;
  return (
    <g>
      <path d={d} fill="none" stroke={K.charcoal} strokeOpacity="0.25" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" transform="translate(4 6)" />
      <path d={d} fill="none" stroke={K.tomato} strokeWidth="10" strokeDasharray="26 18" strokeLinecap="round" strokeLinejoin="round" />
      {p > 0.02 && p < 0.99 && <MiniShip x={head[0]} y={head[1] - 6} ang={ang} />}
    </g>
  );
};

// 1. "In southern China": the world slides and zooms onto China; a pin drops on the south coast
export const ArtMapChina: React.FC<{ t: number }> = ({ t }) => {
  const v = lerpV({ lon: 60, lat: 25, scale: 4.2 }, { lon: 112, lat: 26, scale: 12 }, ease(t / 1.4));
  return <MapBase v={v} hi={["China"]} id="mc">{(P) => { const [x, y] = P(113.3, 23.1); return t > 1.0 ? <Pin x={x} y={y} t={t - 1.0} label="SOUTHERN CHINA" side={-1} /> : null; }}</MapBase>;
};
// 2. "English merchants tasted it in Asia ... and wanted it back home": the route draws from Asia round Africa to England
const ROUTE_EAST_WEST: [number, number][] = [[113.3, 23.1], [104, 2], [95, -6], [75, -8], [55, -20], [35, -33], [18, -36], [10, -20], [-5, 0], [-18, 15], [-15, 35], [-9, 44], [-5, 49], [-1, 51]];
export const ArtMapRoute: React.FC<{ t: number }> = ({ t }) => {
  const v = lerpV({ lon: 75, lat: 10, scale: 5.6 }, { lon: 40, lat: 12, scale: 5.0 }, ease(t / 2.6));
  return (
    <MapBase v={v} hi={["China", "United Kingdom"]} id="mr">{(P) => {
      const [ex, ey] = P(-1, 51), [sx, sy] = P(113.3, 23.1);
      return (<><Route P={P} pts={ROUTE_EAST_WEST} p={ease(t / 2.5)} />
        <circle cx={sx} cy={sy} r="16" fill={K.tomato} stroke={K.cream} strokeWidth="6" />
        {t > 2.3 && <Pin x={ex} y={ey} t={t - 2.3} label="ENGLAND" side={-1} />}</>);
    }}</MapBase>
  );
};
// 3. "a Philadelphia scientist": the camera crosses the Atlantic and drops a pin on Philadelphia
export const ArtMapPhilly: React.FC<{ t: number }> = ({ t }) => {
  const v = lerpV({ lon: -20, lat: 45, scale: 5.0 }, { lon: -72, lat: 40, scale: 9.5 }, ease(t / 1.1));
  return <MapBase v={v} hi={["United States of America"]} id="mp">{(P) => { const [x, y] = P(-75.16, 39.95); return t > 0.7 ? <Pin x={x} y={y} t={t - 0.7} label="PHILADELPHIA" side={1} /> : null; }}</MapBase>;
};
