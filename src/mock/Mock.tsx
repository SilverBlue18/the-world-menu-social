import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import mapdata from "../imam/mapdata.json";

type P = { opt: 1 | 2 | 3 | 4; scene: "A" | "B" };
const AR_A = "خرجت المدينة كلها تتفرّج… حتى الإمبراطور.";
const EN_A = "The whole city comes to stare. Even the emperor.";
const AR_B = "وعلى متنها إمامُ البحرية:";
const EN_B = "On board is the navy's imam:";

// deterministic jagged edge for torn paper
const torn = (seed: number, n = 40, amp = 1.6) => {
  const r = (i: number) => { const s = Math.sin(i * 91.7 + seed * 13.1) * 43758.5; return s - Math.floor(s); };
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${r(i) * amp}%`);
  for (let i = 0; i <= n; i++) pts.push(`${100 - r(i + 50) * amp}% ${(i / n) * 100}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - r(i + 100) * amp}%`);
  for (let i = n; i >= 0; i--) pts.push(`${r(i + 150) * amp}% ${(i / n) * 100}%`);
  return `polygon(${pts.join(",")})`;
};

// ---------------- Option 1: archive collage ----------------
const Halftone: React.FC<{ src: string; w: number; h: number; style?: React.CSSProperties; clip?: string }> = ({ src, w, h, style, clip }) => (
  <div style={{ position: "absolute", width: w, height: h, clipPath: clip, ...style }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.35) brightness(1.05)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(0,0,0,.55) 1.1px, transparent 1.6px) 0 0/5px 5px", mixBlendMode: "multiply", opacity: 0.55 }} />
    <div style={{ position: "absolute", inset: 0, background: "#d9cdb2", mixBlendMode: "multiply", opacity: 0.55 }} />
  </div>
);
const Tape: React.FC<{ x: number; y: number; r: number; w?: number }> = ({ x, y, r, w = 150 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 44, background: "rgba(236,226,196,.75)", transform: `rotate(${r}deg)`, boxShadow: "0 2px 4px rgba(0,0,0,.15)" }} />
);
const CollageCaption: React.FC<{ ar: string; en: string }> = ({ ar, en }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: 230, textAlign: "center" }}>
    <div style={{ display: "inline-block", background: "#f1e9d6", padding: "10px 26px", clipPath: torn(3, 30, 3), transform: "rotate(-1deg)" }}>
      <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 56, color: "#151210", direction: "rtl" }}>{ar}</div>
    </div>
    <div style={{ marginTop: 10 }}>
      <span style={{ background: "#151210", color: "#f1e9d6", fontFamily: "Inter", fontWeight: 800, fontSize: 42, padding: "6px 14px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", lineHeight: 1.55 }}>{en}</span>
    </div>
  </div>
);
const Opt1: React.FC<{ scene: "A" | "B" }> = ({ scene }) => (
  <AbsoluteFill style={{ background: "#d8ccb0" }}>
    <Img src={staticFile("mock/newsprint.jpg")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
    {scene === "A" ? (
      <>
        <Halftone src="imam/img/rio.jpg" w={980} h={630} clip={torn(1, 50, 1.4)} style={{ left: 50, top: 600, transform: "rotate(-2.5deg)", boxShadow: "0 10px 30px rgba(0,0,0,.35)" }} />
        <div style={{ position: "absolute", left: 60, top: 1215, background: "#151210", color: "#f1e9d6", fontFamily: "Oswald", fontWeight: 700, fontSize: 52, padding: "4px 22px", transform: "rotate(-2.5deg)", letterSpacing: 2, whiteSpace: "nowrap" }}>RIO DE JANEIRO, 1862</div>
        <Halftone src="imam/img/pedro2.jpg" w={380} h={500} clip={torn(7, 40, 2)} style={{ left: 650, top: 1060, transform: "rotate(5deg)" }} />
        <Tape x={700} y={1040} r={-8} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={840} cy={1310} rx={175} ry={220} fill="none" stroke="#c4271b" strokeWidth={9} transform="rotate(8 840 1310)" strokeLinecap="round" strokeDasharray="1300 60" />
          <path d="M470 1560 Q560 1610 630 1530" stroke="#c4271b" strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d="M630 1530 L602 1528 M630 1530 L622 1556" stroke="#c4271b" strokeWidth={8} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: 110, top: 1540, fontFamily: "Special Elite", fontSize: 44, color: "#c4271b", transform: "rotate(-4deg)" }}>Emperor Pedro II</div>
        <CollageCaption ar={AR_A} en={EN_A} />
      </>
    ) : (
      <>
        <div style={{ position: "absolute", left: 60, top: 640, width: 960, height: 760, background: "#efe6cf", clipPath: torn(11, 50, 1.2), transform: "rotate(1.5deg)", boxShadow: "0 10px 30px rgba(0,0,0,.3)" }} />
        <div style={{ position: "absolute", left: 80, right: 80, top: 700, textAlign: "center", transform: "rotate(1.5deg)" }}>
          <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 40, letterSpacing: 14, color: "#c4271b" }}>IMAM · OTTOMAN NAVY</div>
          <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 150, color: "#151210", lineHeight: 1.4, marginTop: 10 }}>عبد الرحمن البغدادي</div>
          <div style={{ height: 8, background: "#151210", margin: "14px 60px" }} />
          <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 104, color: "#151210", lineHeight: 1.0, letterSpacing: 1 }}>ABDURRAHMAN<br />AL‑BAGHDADI</div>
        </div>
        <div style={{ position: "absolute", left: 420, top: 1440, border: "7px solid #c4271b", color: "#c4271b", fontFamily: "Oswald", fontWeight: 700, fontSize: 44, whiteSpace: "nowrap", padding: "6px 20px", transform: "rotate(-9deg)", mixBlendMode: "multiply" }}>BAGHDAD · DAMASCUS</div>
        <Tape x={110} y={620} r={-12} />
        <Tape x={830} y={640} r={10} />
        <CollageCaption ar={AR_B} en={EN_B} />
      </>
    )}
  </AbsoluteFill>
);

// ---------------- Option 2: 19th-century engraving ----------------
const PageFrame: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <rect x={44} y={44} width={992} height={1832} fill="none" stroke="#2a1d14" strokeWidth={5} />
    <rect x={60} y={60} width={960} height={1800} fill="none" stroke="#2a1d14" strokeWidth={1.6} />
    {[[60, 60], [1020, 60], [60, 1860], [1020, 1860]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        <circle r={16} fill="#efe3c6" stroke="#2a1d14" strokeWidth={2} />
        <path d="M-8 0 L0 -8 L8 0 L0 8 Z" fill="#9e2a1f" />
      </g>
    ))}
  </svg>
);
const EngrCaption: React.FC<{ ar: string; en: string }> = ({ ar, en }) => (
  <div style={{ position: "absolute", left: 100, right: 100, top: 210, textAlign: "center", color: "#1f1610" }}>
    <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 58, direction: "rtl", lineHeight: 1.4 }}>{ar}</div>
    <div style={{ fontFamily: "Playfair Display", fontWeight: 700, fontSize: 46, lineHeight: 1.15, marginTop: 4 }}>{en}</div>
    <svg width={420} height={30} style={{ marginTop: 16 }}><path d="M0 15 L170 15 M250 15 L420 15" stroke="#1f1610" strokeWidth={2} /><path d="M190 15 L210 5 L230 15 L210 25 Z" fill="#9e2a1f" /></svg>
  </div>
);
const Opt2: React.FC<{ scene: "A" | "B" }> = ({ scene }) => (
  <AbsoluteFill style={{ background: "#ece0c2" }}>
    <Img src={staticFile("imam/tex/paper.jpg")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.9 }} />
    <PageFrame />
    {scene === "A" ? (
      <>
        <div style={{ position: "absolute", left: 110, top: 620, width: 860, border: "3px solid #1f1610", padding: 10, background: "#efe3c6" }}>
          <Img src={staticFile("mock/rio_engr.jpg")} style={{ width: "100%", display: "block" }} />
          <div style={{ fontFamily: "Playfair Display", fontStyle: "italic", fontSize: 32, textAlign: "center", color: "#1f1610", marginTop: 8 }}>Rio de Janeiro, 1862</div>
        </div>
        <div style={{ position: "absolute", left: 560, top: 1210, width: 380, height: 480, borderRadius: "50%", overflow: "hidden", border: "6px double #1f1610", boxShadow: "0 0 0 10px #efe3c6, 0 0 0 13px #1f1610" }}>
          <Img src={staticFile("mock/pedro_engr.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
        </div>
        <div style={{ position: "absolute", left: 120, top: 1420, width: 420, fontFamily: "Playfair Display", fontWeight: 900, fontSize: 64, color: "#1f1610", lineHeight: 1.05 }}>
          DOM<br />PEDRO II<div style={{ fontWeight: 400, fontStyle: "italic", fontSize: 34, marginTop: 10, color: "#9e2a1f" }}>Emperor of Brazil</div>
        </div>
        <EngrCaption ar={AR_A} en={EN_A} />
      </>
    ) : (
      <>
        <div style={{ position: "absolute", left: 100, right: 100, top: 650, textAlign: "center", color: "#1f1610" }}>
          <div style={{ fontFamily: "Playfair Display", fontStyle: "italic", fontSize: 40, color: "#9e2a1f" }}>The Imam of the Ottoman Navy</div>
          <svg width={600} height={40} style={{ margin: "18px 0" }}><path d="M0 20 Q150 0 300 20 Q450 40 600 20" stroke="#1f1610" strokeWidth={2} fill="none" /><circle cx={300} cy={20} r={6} fill="#9e2a1f" /></svg>
          <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 168, lineHeight: 1.3 }}>عبد الرحمن البغدادي</div>
          <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 92, lineHeight: 1.0, letterSpacing: 2, marginTop: 6 }}>ABDURRAHMAN<br />AL-BAGHDADI</div>
          <div style={{ width: 640, margin: "40px auto 0", border: "3px solid #1f1610", padding: 8 }}>
            <Img src={staticFile("mock/rio_engr.jpg")} style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} />
          </div>
        </div>
        <EngrCaption ar={AR_B} en={EN_B} />
      </>
    )}
  </AbsoluteFill>
);

// ---------------- Option 3: Ottoman identity (Iznik + ebru) ----------------
const IZ = { cobalt: "#143c7a", turq: "#1f8a8c", coral: "#c0463a", cream: "#f3ead6", gold: "#c9a24a" };
const StarTile: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <pattern id={id} width={60} height={60} patternUnits="userSpaceOnUse">
      <rect width={60} height={60} fill={IZ.cream} />
      <path d="M30 6 L36 24 L54 30 L36 36 L30 54 L24 36 L6 30 L24 24 Z" fill={IZ.cobalt} />
      <rect x={22} y={22} width={16} height={16} transform="rotate(45 30 30)" fill={IZ.turq} />
      <circle cx={30} cy={30} r={4} fill={IZ.coral} />
      {[[0, 0], [60, 0], [0, 60], [60, 60]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill={IZ.turq} />)}
    </pattern>
  </defs>
);
const IznikCaption: React.FC<{ ar: string; en: string }> = ({ ar, en }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: 215, textAlign: "center" }}>
    <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 60, color: IZ.cobalt, direction: "rtl", lineHeight: 1.4 }}>{ar}</div>
    <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 44, color: "#1c1a18", lineHeight: 1.2, marginTop: 4 }}>{en}</div>
  </div>
);
const Opt3: React.FC<{ scene: "A" | "B" }> = ({ scene }) => (
  <AbsoluteFill style={{ background: IZ.cream }}>
    <Img src={staticFile("mock/ebru.jpg")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
    <div style={{ position: "absolute", left: 50, right: 50, top: 170, bottom: 230, background: IZ.cream, borderRadius: 18, boxShadow: "0 12px 40px rgba(0,0,0,.25)" }} />
    {scene === "A" ? (
      <>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <StarTile id="iz" />
          {/* mihrab-arch frame with tile border */}
          <path d="M190 1560 L190 900 Q190 650 540 600 Q890 650 890 900 L890 1560 Z" fill="url(#iz)" />
          <path d="M230 1525 L230 915 Q230 700 540 655 Q850 700 850 915 L850 1525 Z" fill={IZ.gold} />
          <clipPath id="arch"><path d="M244 1512 L244 920 Q244 712 540 668 Q836 712 836 920 L836 1512 Z" /></clipPath>
          <image href={staticFile("imam/img/pedro2.jpg")} x={244} y={668} width={592} height={844} preserveAspectRatio="xMidYMin slice" clipPath="url(#arch)" />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1580, textAlign: "center" }}>
          <span style={{ background: IZ.cobalt, color: IZ.cream, fontFamily: "Oswald", fontWeight: 500, fontSize: 40, letterSpacing: 10, padding: "10px 30px", borderRadius: 40 }}>EMPEROR PEDRO II · 1865</span>
        </div>
        <IznikCaption ar={AR_A} en={EN_A} />
      </>
    ) : (
      <>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(540 1040)">
            {Array.from({ length: 16 }).map((_, i) => (
              <path key={i} d="M0 -360 L40 -60 L0 0 L-40 -60 Z" fill={i % 2 ? IZ.turq : IZ.cobalt} opacity={0.14} transform={`rotate(${i * 22.5})`} />
            ))}
            <circle r={300} fill="none" stroke={IZ.gold} strokeWidth={4} />
            <circle r={318} fill="none" stroke={IZ.gold} strokeWidth={1.5} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 80, right: 80, top: 800, textAlign: "center" }}>
          <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 176, color: IZ.cobalt, lineHeight: 1.25, textShadow: `0 3px 0 ${IZ.gold}` }}>عبد الرحمن البغدادي</div>
          <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 62, color: IZ.coral, marginTop: 10, whiteSpace: "nowrap" }}>Abdurrahman al‑Baghdadi</div>
          <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 36, letterSpacing: 12, color: IZ.turq, marginTop: 24 }}>IMAM · OTTOMAN NAVY</div>
        </div>
        <IznikCaption ar={AR_B} en={EN_B} />
      </>
    )}
  </AbsoluteFill>
);

// ---------------- Option 4: tabletop diorama ----------------
const Print: React.FC<{ src: string; x: number; y: number; w: number; h: number; r: number; cap?: string }> = ({ src, x, y, w, h, r, cap }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, padding: 18, paddingBottom: cap ? 60 : 18, background: "#f1e8d4", transform: `rotate(${r}deg)`, boxShadow: "0 30px 40px rgba(0,0,0,.55), 0 4px 8px rgba(0,0,0,.4)" }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: h, objectFit: "cover", filter: "sepia(.45) contrast(1.05)" }} />
    {cap && <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", fontFamily: "Special Elite", fontSize: 34, color: "#2a1c11" }}>{cap}</div>}
  </div>
);
const DeskCaption: React.FC<{ ar: string; en: string }> = ({ ar, en }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: 220, textAlign: "center" }}>
    <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 60, color: "#f4e3bc", direction: "rtl", lineHeight: 1.4, textShadow: "0 2px 6px rgba(0,0,0,.9)" }}>{ar}</div>
    <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 45, color: "#fff7ea", lineHeight: 1.2, marginTop: 4, textShadow: "0 2px 6px rgba(0,0,0,.9)" }}>{en}</div>
  </div>
);
const Compass: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <svg width={300 * s} height={300 * s} viewBox="-150 -150 300 300" style={{ position: "absolute", left: x, top: y, filter: "drop-shadow(0 20px 18px rgba(0,0,0,.6))" }}>
    <defs><radialGradient id="brass"><stop offset="0" stopColor="#f0cf86" /><stop offset="0.7" stopColor="#b6873a" /><stop offset="1" stopColor="#6e4a1a" /></radialGradient></defs>
    <circle r={140} fill="url(#brass)" />
    <circle r={116} fill="#efe4c8" />
    {Array.from({ length: 32 }).map((_, i) => <line key={i} x1={0} y1={-116} x2={0} y2={i % 4 ? -106 : -96} stroke="#2a1c11" strokeWidth={2} transform={`rotate(${i * 11.25})`} />)}
    <path d="M0 -92 L14 0 L0 92 L-14 0 Z" fill="#2a1c11" /><path d="M0 -92 L14 0 L-14 0 Z" fill="#9e2a1f" />
    <circle r={110} fill="rgba(255,255,255,.12)" />
  </svg>
);
const Opt4: React.FC<{ scene: "A" | "B" }> = ({ scene }) => (
  <AbsoluteFill style={{ background: "#1a0d06", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -260, top: -200, width: 1600, height: 2600, transform: "perspective(2200px) rotateX(24deg)", transformOrigin: "50% 60%" }}>
      <Img src={staticFile("mock/wood.jpg")} style={{ position: "absolute", inset: 0, width: 1600, height: 2600 }} />
      <Img src={staticFile("imam/tex/parchment.jpg")} style={{ position: "absolute", left: 330, top: 700, width: 980, height: 1250, objectFit: "cover", transform: "rotate(-3deg)", boxShadow: "0 30px 50px rgba(0,0,0,.6)", filter: "sepia(.2)" }} />
      <svg width={980} height={1250} viewBox="150 2650 1500 1900" style={{ position: "absolute", left: 330, top: 700, transform: "rotate(-3deg)", opacity: 0.85 }}>
        <path d={mapdata.land} fill="#b89462" fillOpacity={0.35} stroke="#2a1c11" strokeWidth={6} />
      </svg>
      {scene === "A" ? (
        <>
          <Print src="imam/img/rio.jpg" x={360} y={820} w={760} h={480} r={-6} cap="Rio de Janeiro · 1862" />
          <Print src="imam/img/pedro2.jpg" x={820} y={1330} w={400} h={510} r={7} cap="Pedro II · 1865" />
          <Compass x={300} y={1500} s={1.1} />
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: 420, top: 900, width: 800, padding: 46, background: "#f1e8d4", transform: "rotate(-3deg)", boxShadow: "0 30px 50px rgba(0,0,0,.6)", textAlign: "center" }}>
            <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 36, letterSpacing: 10, color: "#6b4a2b" }}>IMAM · OTTOMAN NAVY</div>
            <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 120, color: "#2a1c11", lineHeight: 1.35 }}>عبد الرحمن البغدادي</div>
            <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 56, color: "#2a1c11", whiteSpace: "nowrap" }}>Abdurrahman al‑Baghdadi</div>
          </div>
          <Compass x={1050} y={1500} s={0.9} />
        </>
      )}
    </div>
    {/* lamp light + depth falloff */}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 45% 60%, rgba(255,200,120,.28) 0%, rgba(255,200,120,0) 70%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 62%, rgba(0,0,0,0) 40%, rgba(10,4,0,.85) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,0,.9) 0%, rgba(10,4,0,.55) 26%, rgba(10,4,0,0) 38%)" }} />
    <DeskCaption ar={scene === "A" ? AR_A : AR_B} en={scene === "A" ? EN_A : EN_B} />
  </AbsoluteFill>
);

export const Mock: React.FC<P> = ({ opt, scene }) =>
  opt === 1 ? <Opt1 scene={scene} /> : opt === 2 ? <Opt2 scene={scene} /> : opt === 3 ? <Opt3 scene={scene} /> : <Opt4 scene={scene} />;
