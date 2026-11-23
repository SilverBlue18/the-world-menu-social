// New-look concept frames for The World Menu (food at the centre). Render with:
// node scripts/stills.mjs ConceptA1 out/concepts/A1_ 0 1   (ids: ConceptA1 A2 B1 B2 C1 C2)
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate, geoMercator } from "d3-geo";
import { feature } from "topojson-client";
import landTopo from "world-atlas/land-110m.json";
import { C } from "../shared/twm";
import { Watermark } from "../shared/Watermark";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LAND = feature(landTopo as any, (landTopo as any).objects.land) as any;
const MEX: [number, number] = [-98, 19.5], LIS: [number, number] = [-9.1, 38.7], GOA: [number, number] = [73.8, 15.5];
const HAB = "concepts/hab_basket.png"; // USDA ARS photo (public domain), background removed

// ---------- shared bits ----------
const Caps: React.FC<{ fr: React.ReactNode; en: string; top?: number; dark?: boolean }> = ({ fr, en, top = 250, dark = true }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top, textAlign: "center" }}>
    <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 58, lineHeight: 1.18, color: "#fff", letterSpacing: -0.5, textShadow: dark ? "0 3px 14px rgba(0,0,0,.55)" : "none" }}>{fr}</div>
    <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 36, lineHeight: 1.3, color: "rgba(255,255,255,.78)", marginTop: 18, textShadow: dark ? "0 2px 8px rgba(0,0,0,.5)" : "none" }}>{en}</div>
  </div>
);
const Hi: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = C.mustard }) => <span style={{ color: c }}>{children}</span>;

const Globe: React.FC<{ size: number; rotate: [number, number]; route?: [number, number][]; pins?: { ll: [number, number]; big?: boolean; label?: string; left?: boolean }[]; sea?: string; land?: string; ring?: boolean; glow?: string }> = ({
  size, rotate, route = [], pins = [], sea = C.sea, land = C.land, ring = true, glow = "rgba(242,177,52,.35)",
}) => {
  const r = size / 2 - 8;
  const pr = geoOrthographic().scale(r).translate([size / 2, size / 2]).rotate([-rotate[0], -rotate[1]]).clipAngle(90);
  const p = geoPath(pr);
  const line = route.length > 1 ? route.slice(1).map((b, i) => { const f = geoInterpolate(route[i], b); return Array.from({ length: 41 }, (_, k) => f(k / 40)); }).flat() : [];
  return (
    <svg width={size} height={size} style={{ overflow: "visible", filter: `drop-shadow(0 0 60px ${glow})` }}>
      <defs>
        <radialGradient id={`gs${size}`} cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#fff" stopOpacity=".25" /><stop offset=".55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".45" /></radialGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill={sea} />
      <path d={p(geoGraticule10()) ?? ""} fill="none" stroke="#fff" strokeOpacity={0.08} strokeWidth={1.5} />
      <path d={p(LAND) ?? ""} fill={land} stroke={C.coast} strokeWidth={1.5} />
      {line.length > 1 && <path d={p({ type: "LineString", coordinates: line }) ?? ""} fill="none" stroke={C.red} strokeWidth={size / 90} strokeLinecap="round" strokeDasharray={`2 ${size / 40}`} />}
      {pins.map((q, i) => { const xy = pr(q.ll); if (!xy) return null; return (
        <g key={i}>
          <circle cx={xy[0]} cy={xy[1]} r={q.big ? size / 45 : size / 70} fill={C.red} stroke={C.cream} strokeWidth={size / 180} />
          {q.label && <text x={xy[0] + (q.left ? -1 : 1) * size / 30} y={xy[1] + size / 90} textAnchor={q.left ? "end" : "start"} fontFamily="Oswald" fontWeight={500} fontSize={size / 17} letterSpacing={2} fill="#fff" stroke={C.night} strokeWidth={size / 110} style={{ paintOrder: "stroke" }}>{q.label}</text>}
        </g>); })}
      <circle cx={size / 2} cy={size / 2} r={r} fill={`url(#gs${size})`} />
      {ring && <circle cx={size / 2} cy={size / 2} r={r + 5} fill="none" stroke={C.cream} strokeOpacity={0.5} strokeWidth={3} />}
    </svg>
  );
};

// ============ A. "LE PLAT STAR": the food as a giant cut-out hero on a bold colour field, kinetic type, globe chip ============
const BgA: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 58%, ${from} 0%, ${to} 75%)` }} />
    <AbsoluteFill style={{ background: "repeating-radial-gradient(circle at 50% 62%, rgba(255,255,255,.035) 0 2px, transparent 2px 46px)" }} />
  </>
);
const FoodHero: React.FC<{ w: number; x: number; y: number; rot?: number }> = ({ w, x, y, rot = 0 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, transform: `rotate(${rot}deg)` }}>
    <div style={{ position: "absolute", left: "8%", right: "8%", bottom: -30, height: 80, background: "radial-gradient(ellipse at center, rgba(0,0,0,.55), rgba(0,0,0,0) 70%)" }} />
    <Img src={staticFile(HAB)} style={{ width: "100%", filter: "drop-shadow(0 30px 40px rgba(0,0,0,.45)) saturate(1.1) contrast(1.05)" }} />
  </div>
);
const Chip: React.FC<{ x: number; y: number; label: string; sub: string; rotate: [number, number]; pin: [number, number] }> = ({ x, y, label, sub, rotate, pin }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 18, background: "rgba(10,46,51,.88)", borderRadius: 120, padding: "12px 34px 12px 12px", boxShadow: "0 14px 40px rgba(0,0,0,.35)" }}>
    <Globe size={120} rotate={rotate} pins={[{ ll: pin, big: true }]} ring={false} glow="rgba(0,0,0,0)" />
    <div>
      <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 46, letterSpacing: 3, color: "#fff", lineHeight: 1 }}>{label}</div>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: C.mustard, marginTop: 6 }}>{sub}</div>
    </div>
  </div>
);
export const ConceptA1: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <BgA from="#E2492F" to="#7E150E" />
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 34, letterSpacing: 10, color: C.mustard }}>LE PIMENT</div>
      <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 168, lineHeight: 0.95, color: "#fff", marginTop: 20, textTransform: "uppercase", textShadow: "0 8px 30px rgba(0,0,0,.35)" }}>
        Pas<br />indien<Hi>?!</Hi>
      </div>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 36, color: "rgba(255,255,255,.85)", marginTop: 18 }}>Chili peppers aren't Indian</div>
    </div>
    <FoodHero w={1000} x={560} y={940} rot={-4} />
    <Watermark />
  </AbsoluteFill>
);
export const ConceptA2: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <BgA from="#1E6A72" to="#0A2E33" />
    <Caps fr={<>Là-bas, on le cultive depuis environ <Hi>six mille</Hi> ans.</>} en="There, people have grown it for about six thousand years." />
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: "Oswald", fontWeight: 700, fontSize: 250, lineHeight: 1, color: C.mustard, textShadow: "0 10px 40px rgba(0,0,0,.4)" }}>6 000</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 890, textAlign: "center", fontFamily: "Oswald", fontWeight: 500, fontSize: 60, letterSpacing: 24, color: "#fff" }}>ANS</div>
    <FoodHero w={820} x={540} y={1010} rot={3} />
    <Chip x={250} y={1530} label="MEXIQUE" sub="là où tout commence" rotate={[-80, 15]} pin={MEX} />
    <Watermark />
  </AbsoluteFill>
);

// ============ B. "LE GLOBE À LA FOURCHETTE": the brand's Earth is the stage; the food travels round it ============
const BgB: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 70% at 50% 70%, #17565F 0%, ${C.night} 70%)` }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 20% 30%, rgba(255,255,255,.5) 0 1.5px, transparent 2px), radial-gradient(circle at 75% 18%, rgba(255,255,255,.4) 0 1.5px, transparent 2px), radial-gradient(circle at 85% 45%, rgba(255,255,255,.35) 0 1.2px, transparent 2px), radial-gradient(circle at 12% 60%, rgba(255,255,255,.35) 0 1.2px, transparent 2px), radial-gradient(circle at 60% 35%, rgba(255,255,255,.3) 0 1px, transparent 2px)" }} />
  </>
);
export const ConceptB1: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <BgB />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}>
      <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 38, letterSpacing: 14, color: C.mustard }}>L'HISTOIRE DU PIMENT</div>
      <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 118, lineHeight: 1.02, color: C.cream, marginTop: 22 }}>Il a fait le<br />tour du <Hi>monde</Hi></div>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 36, color: C.land, marginTop: 22 }}>It went around the world</div>
    </div>
    <div style={{ position: "absolute", left: 90, top: 860 }}>
      <Globe size={900} rotate={[-20, 22]} route={[MEX, [-40, 25], LIS, [-15, 5], [18, -34], [45, -10], GOA]} pins={[{ ll: MEX, big: true, label: "MEXIQUE" }, { ll: LIS, label: "LISBONNE" }]} />
    </div>
    <div style={{ position: "absolute", left: 560, top: 820, width: 430, transform: "rotate(14deg)" }}>
      <Img src={staticFile(HAB)} style={{ width: "100%", filter: "drop-shadow(0 30px 40px rgba(0,0,0,.6))" }} />
    </div>
    <Watermark />
  </AbsoluteFill>
);
export const ConceptB2: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <BgB />
    <Caps fr={<>Le long des côtes d'Afrique… jusqu'à <Hi>Goa</Hi>, en Inde.</>} en="Along the coasts of Africa… all the way to Goa, India." />
    <div style={{ position: "absolute", left: -260, top: 700 }}>
      <Globe size={1500} rotate={[40, 0]} route={[LIS, [-18, 20], [-12, 3], [10, -20], [19, -35], [35, -25], [42, -10], [52, 8], GOA]} pins={[{ ll: LIS, label: "LISBONNE" }, { ll: GOA, big: true, label: "GOA", left: true }]} />
    </div>
    <div style={{ position: "absolute", left: 560, top: 980, width: 300, transform: "rotate(-18deg)" }}>
      <Img src={staticFile(HAB)} style={{ width: "100%", filter: "drop-shadow(0 24px 30px rgba(0,0,0,.6))" }} />
    </div>
    <div style={{ position: "absolute", left: 90, top: 1490, background: C.mustard, color: C.night, fontFamily: "Oswald", fontWeight: 700, fontSize: 44, letterSpacing: 4, padding: "14px 30px", borderRadius: 14 }}>1500 → 1510</div>
    <Watermark />
  </AbsoluteFill>
);

// ============ C. "PLEIN CADRE": full-bleed food photography, editorial type, a fact strip and a mini-map ============
const MiniMap: React.FC<{ w: number; h: number; center: [number, number]; scale: number; route: [number, number][]; pin: [number, number] }> = ({ w, h, center, scale, route, pin }) => {
  const pr = geoMercator().center(center).scale(scale).translate([w / 2, h / 2]);
  const p = geoPath(pr);
  const xy = pr(pin)!;
  const line = route.slice(1).map((b, i) => { const f = geoInterpolate(route[i], b); return Array.from({ length: 41 }, (_, k) => f(k / 40)); }).flat();
  return (
    <svg width={w} height={h} style={{ borderRadius: 26, overflow: "hidden", display: "block" }}>
      <rect width={w} height={h} fill={C.sea} />
      <path d={p(LAND) ?? ""} fill={C.land} stroke={C.coast} strokeWidth={1.5} />
      <path d={p({ type: "LineString", coordinates: line }) ?? ""} fill="none" stroke={C.red} strokeWidth={5} strokeLinecap="round" strokeDasharray="2 12" />
      <circle cx={xy[0]} cy={xy[1]} r={11} fill={C.red} stroke={C.cream} strokeWidth={4} />
    </svg>
  );
};
const Photo: React.FC<{ zoom: number; ox: number; oy: number }> = ({ zoom, ox, oy }) => (
  <AbsoluteFill>
    <Img src={staticFile("concepts/raw/habanero.jpg")} style={{ position: "absolute", height: 1920 * zoom, left: ox, top: oy, filter: "saturate(1.15) contrast(1.06)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,20,22,.9) 0%, rgba(8,20,22,.55) 30%, rgba(8,20,22,0) 48%, rgba(8,20,22,0) 62%, rgba(8,20,22,.85) 88%)" }} />
  </AbsoluteFill>
);
const Fact: React.FC<{ k: string; v: string; hi?: boolean }> = ({ k, v, hi }) => (
  <div style={{ flex: 1, textAlign: "center" }}>
    <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 4, color: "rgba(255,255,255,.65)" }}>{k}</div>
    <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 52, color: hi ? C.mustard : "#fff", marginTop: 4 }}>{v}</div>
  </div>
);
export const ConceptC1: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
    <Photo zoom={1} ox={-1000} oy={0} />
    <div style={{ position: "absolute", left: 70, right: 70, top: 250 }}>
      <div style={{ display: "inline-block", fontFamily: "Inter", fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.night, background: C.mustard, padding: "8px 18px", borderRadius: 8 }}>HISTOIRE VRAIE · #01</div>
      <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 132, lineHeight: 1, color: "#fff", marginTop: 28 }}>Le piment<br />n'est pas<br /><Hi>indien.</Hi></div>
    </div>
    <div style={{ position: "absolute", left: 70, right: 70, top: 1340, fontFamily: "Inter", fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,.9)" }}>Chili peppers aren't Indian.</div>
    <Watermark />
  </AbsoluteFill>
);
export const ConceptC2: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
    <Photo zoom={1.25} ox={-1450} oy={-260} />
    <Caps fr={<>En 1493, Christophe Colomb le <Hi>goûte</Hi> aux Caraïbes.</>} en="In 1493, Christopher Columbus tastes it in the Caribbean." />
    <div style={{ position: "absolute", left: 60, right: 60, top: 1080, display: "flex", gap: 24, alignItems: "stretch" }}>
      <MiniMap w={330} h={330} center={[-38, 26]} scale={210} route={[[-6.9, 37], [-16, 28], [-45, 22], [-71, 19]]} pin={[-71, 19]} />
      <div style={{ flex: 1, background: "rgba(10,46,51,.82)", borderRadius: 26, padding: "26px 10px", display: "flex", flexDirection: "column", justifyContent: "space-around", backdropFilter: "blur(6px)" }}>
        <div style={{ display: "flex" }}><Fact k="ORIGINE" v="MEXIQUE" /><Fact k="ÂGE" v="6 000 ANS" hi /></div>
        <div style={{ height: 2, background: "rgba(255,255,255,.12)", margin: "0 30px" }} />
        <div style={{ display: "flex" }}><Fact k="EUROPE" v="1493" hi /><Fact k="INDE" v="~1510" /></div>
      </div>
    </div>
    <Watermark />
  </AbsoluteFill>
);
