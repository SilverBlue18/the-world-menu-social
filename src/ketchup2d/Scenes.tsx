// Ketchup in FLAT ILLUSTRATED 2D (mentor feedback 2026-11-28: no real footage). Editorial vector scenes in the brand palette
// (tomato, olive, cream, charcoal + a few warm/cool supporting tones). Every scene is drawn on a 1080x1920 stage and takes a
// camera {x, y, z} so the camera can move inside it. Flat fills only: no gradients, no textures (brand rule: keep it flat).
import React from "react";

export const P = {
  tomato: "#D7263D", tomatoDk: "#A81B2E", olive: "#3E5F3A", oliveDk: "#2B4429", oliveLt: "#6E8F5A",
  cream: "#F6F1E7", sand: "#E6DCC8", charcoal: "#2B2B2B", sea: "#2E5E66", seaDk: "#1F454C", sky: "#F3D9B1",
  wood: "#8A5A3B", woodDk: "#5E3B26", skin1: "#8D5A3B", skin2: "#E2B48C", gold: "#E8B04A", mud: "#6B5A3E",
};
export type Cam = { x?: number; y?: number; z?: number };
export const Stage: React.FC<{ cam?: Cam; bg: string; children: React.ReactNode }> = ({ cam = {}, bg, children }) => {
  const z = cam.z ?? 1, x = cam.x ?? 0, y = cam.y ?? 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, background: bg }}>
      <g transform={`translate(540 960) scale(${z}) translate(${-540 - x} ${-960 - y})`}>{children}</g>
    </svg>
  );
};

// ---------- reusable flat props ----------
export const Person: React.FC<{ x: number; y: number; s?: number; skin?: string; shirt?: string; hat?: "cone" | "tricorn" | "cap" | "none"; flip?: boolean; arm?: number; hair?: string }> =
  ({ x, y, s = 1, skin = P.skin1, shirt = P.olive, hat = "none", flip, arm = 0, hair = P.charcoal }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <rect x={-46} y={-330} width={92} height={190} rx={40} fill={shirt} />
    <rect x={-40} y={-150} width={34} height={150} rx={14} fill={P.charcoal} /><rect x={6} y={-150} width={34} height={150} rx={14} fill={P.charcoal} />
    <g transform={`rotate(${arm} 40 -300)`}><rect x={30} y={-310} width={28} height={130} rx={14} fill={shirt} /><circle cx={44} cy={-178} r={16} fill={skin} /></g>
    <rect x={-58} y={-310} width={28} height={130} rx={14} fill={shirt} /><circle cx={-44} cy={-178} r={16} fill={skin} />
    <rect x={-14} y={-360} width={28} height={36} rx={8} fill={skin} />
    <circle cx={0} cy={-400} r={52} fill={skin} />
    {hat === "none" && <path d="M-52 -408 Q-50 -462 0 -460 Q50 -462 52 -408 Q30 -432 0 -430 Q-30 -432 -52 -408 Z" fill={hair} />}
    {hat === "cone" && <path d="M-110 -414 L0 -500 L110 -414 Z" fill={P.gold} />}
    {hat === "tricorn" && <path d="M-80 -430 Q0 -500 80 -430 Q40 -446 0 -442 Q-40 -446 -80 -430 Z" fill={P.charcoal} />}
    {hat === "cap" && <path d="M-54 -420 Q0 -476 54 -420 L70 -412 L-54 -412 Z" fill={P.cream} />}
    <circle cx={18} cy={-404} r={5} fill={P.charcoal} /><path d="M10 -378 Q22 -370 32 -380" stroke={P.charcoal} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);
export const Jar: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = P.mud }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-70 0 Q-96 -90 -60 -170 L60 -170 Q96 -90 70 0 Z" fill={c} /><rect x={-66} y={-196} width={132} height={30} rx={10} fill={P.woodDk} />
    <path d="M-62 -120 Q0 -100 62 -120" stroke={P.cream} strokeOpacity={0.35} strokeWidth={6} fill="none" />
  </g>
);
export const Fish: React.FC<{ x: number; y: number; s?: number; r?: number; c?: string }> = ({ x, y, s = 1, r = 0, c = "#C9D3CF" }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M-60 0 Q-10 -36 50 0 Q-10 36 -60 0 Z" fill={c} /><path d="M50 0 L84 -24 L84 24 Z" fill={c} /><circle cx={-34} cy={-6} r={5} fill={P.charcoal} />
  </g>
);
export const Ship: React.FC<{ x: number; y: number; s?: number; flag?: string }> = ({ x, y, s = 1, flag = P.tomato }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-260 0 L260 0 L200 90 L-200 90 Z" fill={P.woodDk} /><rect x={-200} y={-10} width={400} height={16} fill={P.wood} />
    <rect x={-8} y={-420} width={16} height={420} fill={P.woodDk} /><rect x={-150} y={-300} width={12} height={300} fill={P.woodDk} /><rect x={140} y={-260} width={12} height={260} fill={P.woodDk} />
    <path d="M-4 -400 Q110 -300 -4 -170 Z" fill={P.cream} /><path d="M-4 -400 Q-120 -300 -4 -170 Z" fill={P.sand} />
    <path d="M-146 -280 Q-60 -210 -146 -120 Z" fill={P.cream} /><path d="M146 -240 Q220 -180 146 -110 Z" fill={P.cream} />
    <path d="M8 -420 L90 -400 L8 -380 Z" fill={flag} />
  </g>
);
export const Mushroom: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-16} y={-60} width={32} height={60} rx={12} fill={P.cream} /><path d="M-60 -56 Q0 -130 60 -56 Z" fill={P.wood} /></g>
);

// ---------- scene 1: southern China harbour, fish fermenting in jars (kê-tsiap) ----------
export const SceneChina: React.FC<{ cam?: Cam; t?: number }> = ({ cam, t = 0 }) => (
  <Stage cam={cam} bg={P.sky}>
    <circle cx={760} cy={520} r={130} fill={P.cream} />
    <path d="M-200 820 L120 560 L360 760 L560 540 L860 800 L1280 600 L1280 900 L-200 900 Z" fill={P.oliveLt} />
    <path d="M-200 880 L200 700 L460 860 L760 700 L1280 860 L1280 960 L-200 960 Z" fill={P.olive} />
    <rect x={-200} y={940} width={1480} height={260} fill={P.sea} />
    {[0, 1, 2].map((i) => <path key={i} d={`M${-100 + i * 420 + ((t * 30) % 60)} ${1010 + i * 50} q40 -18 80 0 q40 18 80 0`} stroke={P.cream} strokeOpacity={0.4} strokeWidth={6} fill="none" />)}
    <g transform={`translate(800 ${980 + Math.sin(t * 1.3) * 6})`}><path d="M-130 0 L130 0 L100 46 L-100 46 Z" fill={P.woodDk} /><rect x={-6} y={-200} width={12} height={200} fill={P.woodDk} /><path d="M6 -190 L120 -60 L6 -60 Z" fill={P.tomato} /></g>
    <rect x={-200} y={1180} width={1480} height={800} fill={P.wood} />
    {[...Array(9)].map((_, i) => <rect key={i} x={-200 + i * 170} y={1180} width={8} height={800} fill={P.woodDk} />)}
    <Person x={300} y={1600} s={1.05} skin={P.skin1} shirt={P.sea} hat="cone" arm={-30 + Math.sin(t * 3) * 10} />
    <Jar x={560} y={1640} s={1.15} /><Jar x={790} y={1660} s={1.3} c="#7A6346" /><Jar x={980} y={1620} s={0.9} />
    <Fish x={560} y={1440} r={-20} /><Fish x={420} y={1500} s={0.8} r={12} />
    <g opacity={0.9}><Fish x={170} y={1780} s={0.9} r={4} /><Fish x={260} y={1820} s={0.8} r={-8} /><Fish x={120} y={1850} s={0.85} r={10} /></g>
  </Stage>
);

// ---------- scene 2: 1700s English kitchen, faking it with mushrooms, walnuts, oysters ----------
export const SceneKitchen: React.FC<{ cam?: Cam; t?: number }> = ({ cam, t = 0 }) => (
  <Stage cam={cam} bg={P.sand}>
    <rect x={-200} y={0} width={1480} height={1260} fill={P.sand} />
    <rect x={120} y={260} width={360} height={460} rx={8} fill={P.sea} /><rect x={290} y={260} width={20} height={460} fill={P.sand} /><rect x={120} y={480} width={360} height={20} fill={P.sand} />
    <circle cx={390} cy={360} r={40} fill={P.cream} />
    {[0, 1, 2].map((i) => <rect key={i} x={620} y={300 + i * 150} width={420} height={18} fill={P.woodDk} />)}
    {[0, 1, 2, 3].map((i) => <Jar key={i} x={680 + i * 100} y={300} s={0.45} c={[P.tomato, P.olive, P.mud, P.wood][i]} />)}
    {[0, 1, 2].map((i) => <Mushroom key={i} x={700 + i * 110} y={450} s={0.8} />)}
    <rect x={-200} y={1260} width={1480} height={800} fill={P.woodDk} />
    <rect x={60} y={1180} width={960} height={90} rx={10} fill={P.wood} />
    <Person x={540} y={1260} s={1.0} skin={P.skin2} shirt={P.tomato} hat="cap" arm={-40 + Math.sin(t * 4) * 12} hair={P.wood} />
    <g transform="translate(830 1180)"><path d="M-110 0 Q-110 -140 0 -150 Q110 -140 110 0 Z" fill={P.charcoal} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-40 + i * 40} -170 q${-14} ${-30 - (t * 40 % 30)} 0 ${-70}`} stroke={P.cream} strokeOpacity={0.5} strokeWidth={8} fill="none" strokeLinecap="round" />)}</g>
    <Mushroom x={200} y={1180} s={1.1} /><Mushroom x={290} y={1180} s={0.8} />
    <g transform="translate(260 1150)"><ellipse cx={0} cy={0} rx={60} ry={34} fill="#9AA6A1" /><ellipse cx={0} cy={-4} rx={38} ry={20} fill={P.cream} /></g>
  </Stage>
);

// style-frame previews with the caption treatment on top
const Cap: React.FC<{ a: string; hl: string; b: string; fr: string }> = ({ a, hl, b, fr }) => (
  <div style={{ position: "absolute", left: 70, right: 150, top: 250, textAlign: "center", fontFamily: "Inter" }}>
    <div style={{ fontWeight: 800, fontSize: 68, lineHeight: 1.08, color: "#fff", textShadow: "0 3px 6px rgba(0,0,0,.55), 0 0 26px rgba(0,0,0,.35)" }}>{a}<span style={{ color: "#FF4A5F" }}>{hl}</span>{b}</div>
    <div style={{ fontWeight: 600, fontSize: 34, color: P.cream, marginTop: 12, textShadow: "0 2px 6px rgba(0,0,0,.6)" }}>{fr}</div>
  </div>
);
export const Frame2D_China: React.FC = () => (
  <div style={{ position: "absolute", inset: 0 }}><SceneChina cam={{ z: 1.0 }} t={0.6} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 30%)" }} />
    <Cap a="people fermented " hl="fish" b="" fr="on faisait fermenter du poisson" /></div>
);
export const Frame2D_Kitchen: React.FC = () => (
  <div style={{ position: "absolute", inset: 0 }}><SceneKitchen cam={{ z: 1.0 }} t={0.6} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 30%)" }} />
    <Cap a="So they " hl="faked" b=" it." fr="Alors ils trichent." /></div>
);
