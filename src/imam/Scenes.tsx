import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { clamp, ramp, smooth } from "./lib";
import { Motes, Person, Sea, SharedDefs, ShipSil } from "./figures";

type SP = { u: number; dur: number; t: number };

// slow push-in camera for every illustrated scene (never a static hold)
const Push: React.FC<{ u: number; dur: number; from?: number; to?: number; ox?: number; oy?: number; children: React.ReactNode }> = ({ u, dur, from = 1.0, to = 1.07, ox = 540, oy = 1050, children }) => {
  const s = from + (to - from) * (0.35 * (u / dur) + 0.65 * smooth(u / dur));
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${ox}px ${oy}px` }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <SharedDefs />
        {children}
      </svg>
    </AbsoluteFill>
  );
};

const Stars: React.FC<{ t: number; n?: number; maxY?: number; seed?: number }> = ({ t, n = 70, maxY = 900, seed = 3 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const a = Math.sin(i * 51.7 + seed) * 9999; const h1 = a - Math.floor(a);
      const b = Math.sin(i * 17.3 + seed * 3) * 9999; const h2 = b - Math.floor(b);
      return <circle key={i} cx={h1 * 1080} cy={120 + h2 * (maxY - 120)} r={0.8 + h2 * 1.6} fill="#fff4dc" opacity={0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2 + i))} />;
    })}
  </g>
);

const Sky: React.FC<{ id: string; stops: [number, string][]; h?: number }> = ({ id, stops, h = 1920 }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        {stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}
      </linearGradient>
    </defs>
    <rect x={-200} y={-200} width={1480} height={h + 400} fill={`url(#${id})`} />
  </>
);

// ---------------- 1. storm at sea ----------------
export const StormScene: React.FC<SP> = ({ u, dur, t }) => {
  const flash = Math.max(0, 1 - Math.abs(u - 0.45) / 0.12) * 0.5 + Math.max(0, 1 - Math.abs(u - 0.62) / 0.08) * 0.25;
  return (
    <Push u={u} dur={dur} from={1.0} to={1.08} oy={1150}>
      <Sky id="skyStorm" stops={[[0, "#04060d"], [0.45, "#0e1528"], [0.68, "#1a2440"], [1, "#070b15"]]} />
      <rect x={-200} y={-200} width={1480} height={1700} fill="#9fb4e0" opacity={flash * 0.35} />
      {[0, 1, 2, 3].map((i) => (
        <image key={i} href={staticFile(`imam/tex/storm${i % 3}.png`)} x={-300 + i * 330 + Math.sin(t * 0.3 + i) * 40 - t * 12} y={480 + (i % 2) * 140}
          width={1100} height={720} opacity={0.75} />
      ))}
      <g opacity={0.5}>
        {Array.from({ length: 90 }).map((_, i) => {
          const a = Math.sin(i * 12.3) * 999; const h1 = a - Math.floor(a);
          const y = ((h1 * 1500 + t * 1400) % 1500) + 300;
          const x = (i * 37) % 1200 - 60;
          return <line key={i} x1={x} y1={y} x2={x - 18} y2={y + 60} stroke="#8fa3c8" strokeWidth={2} opacity={0.5} />;
        })}
      </g>
      <Sea t={t} y={1200} colors={["#101a30"]} amp={34} speed={1.3} />
      <ShipSil x={540} y={1215} s={1.05} t={t} rock={6} color="#04060b" />
      <Sea t={t + 0.6} y={1265} colors={["#0b1222", "#070c18", "#04070f"]} amp={30} speed={1.5} />
    </Push>
  );
};

// ---------------- 2. departure from Istanbul at sunset ----------------
const skyline = (() => {
  const H = 1250;
  const parts: string[] = [];
  // big mosque centre
  const dome = (cx: number, r: number, base: number) => `M${cx - r} ${base} A${r} ${r * 0.9} 0 0 1 ${cx + r} ${base} Z`;
  parts.push(`M-100 ${H} L-100 ${H - 40} Q200 ${H - 70} 300 ${H - 60} L1200 ${H - 50} L1200 ${H} Z`);
  parts.push(`M360 ${H - 60} L720 ${H - 60} L720 ${H - 150} L360 ${H - 150} Z`);
  parts.push(dome(540, 150, H - 150));
  parts.push(dome(420, 70, H - 150));
  parts.push(dome(660, 70, H - 150));
  parts.push(`M532 ${H - 285} L548 ${H - 285} L540 ${H - 320} Z`);
  for (const mx of [330, 390, 690, 750]) {
    const mh = mx === 330 || mx === 750 ? 380 : 340;
    parts.push(`M${mx - 9} ${H - 60} L${mx - 9} ${H - mh} L${mx} ${H - mh - 60} L${mx + 9} ${H - mh} L${mx + 9} ${H - 60} Z`);
    parts.push(`M${mx - 14} ${H - mh + 40} L${mx + 14} ${H - mh + 40} L${mx + 14} ${H - mh + 50} L${mx - 14} ${H - mh + 50} Z`);
  }
  // second mosque right
  parts.push(`M860 ${H - 50} L1020 ${H - 50} L1020 ${H - 110} L860 ${H - 110} Z`);
  parts.push(dome(940, 80, H - 110));
  for (const mx of [840, 1040]) parts.push(`M${mx - 7} ${H - 50} L${mx - 7} ${H - 290} L${mx} ${H - 335} L${mx + 7} ${H - 290} L${mx + 7} ${H - 50} Z`);
  // tower left
  parts.push(`M120 ${H - 40} L120 ${H - 230} L190 ${H - 230} L190 ${H - 40} Z`);
  parts.push(`M112 ${H - 230} L155 ${H - 320} L198 ${H - 230} Z`);
  // houses
  for (let i = 0; i < 14; i++) { const x = -60 + i * 85; const hh = 40 + ((i * 37) % 50); if (x > 300 && x < 780) continue; parts.push(`M${x} ${H - 30} L${x + 70} ${H - 30} L${x + 70} ${H - 30 - hh} L${x} ${H - 30 - hh} Z`); }
  return parts.join(" ");
})();

export const IstanbulScene: React.FC<SP> = ({ u, dur, t }) => {
  const sx = (k: number) => 120 + k * 230 + u * 70;
  return (
    <Push u={u} dur={dur} from={1.02} to={1.08} oy={1250}>
      <Sky id="skyIst" stops={[[0, "#0d0817"], [0.3, "#24132e"], [0.5, "#5a2a45"], [0.6, "#b4585a"], [0.65, "#f0a060"], [0.652, "#3a1a2a"], [1, "#0b0610"]]} />
      <Stars t={t} n={40} maxY={700} />
      <circle cx={760} cy={1170} r={420} fill="url(#sunGlow)" opacity={0.75} />
      <circle cx={760} cy={1190} r={64} fill="#ffe6b0" />
      <path d={skyline} fill="#12091a" />
      {/* shimmering sun path on the water */}
      {Array.from({ length: 26 }).map((_, i) => {
        const y = 1268 + i * 16 + i * i * 0.6;
        const w = 30 + i * 7 + Math.sin(t * 3 + i * 1.7) * 18;
        return <rect key={i} x={760 - w / 2 + Math.sin(t * 2 + i) * 10} y={y} width={w} height={3 + i * 0.25} rx={2} fill="#ffc27a" opacity={0.55 - i * 0.017} />;
      })}
      <ShipSil x={sx(1)} y={1440} s={0.62} t={t} rock={1.5} color="#0a0610" seed={1} />
      <ShipSil x={sx(0) + 120} y={1530} s={0.7} t={t} rock={1.5} color="#07040a" seed={3} />
      <Sea t={t} y={1600} colors={["#0d0712"]} amp={10} speed={0.8} />
      <Motes t={t} n={30} seed={2} area={[0, 600, 1080, 900]} />
    </Push>
  );
};

// ---------------- 3. the imam on deck at night ----------------
export const DeckScene: React.FC<SP> = ({ u, dur, t }) => (
  <Push u={u} dur={dur} from={1.0} to={1.07} ox={600} oy={1150}>
    <Sky id="skyDeck" stops={[[0, "#04060e"], [0.5, "#101a33"], [0.66, "#1c2848"], [0.661, "#0b1222"], [1, "#05080f"]]} />
    <Stars t={t} n={90} maxY={1150} seed={7} />
    <circle cx={810} cy={760} r={230} fill="url(#lanternGlow)" opacity={0.25} />
    <circle cx={810} cy={760} r={58} fill="#f6ecd2" />
    <circle cx={826} cy={748} r={52} fill="#101a33" opacity={0.0} />
    {Array.from({ length: 14 }).map((_, i) => (
      <rect key={i} x={810 - (20 + i * 6) / 2 + Math.sin(t * 2 + i) * 8} y={1285 + i * 14} width={20 + i * 6} height={3} fill="#e8dcbc" opacity={0.4 - i * 0.025} />
    ))}
    {/* deck: rail, mast, planks */}
    <path d="M-100 1920 L-100 1430 L1200 1400 L1200 1920 Z" fill="#140c0a" />
    {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={-100 + i * 120} y1={1430 - i * 2.5} x2={-600 + i * 230} y2={1920} stroke="#24170f" strokeWidth={4} />)}
    <rect x={-100} y={1340} width={1300} height={14} fill="#1d120d" />
    {Array.from({ length: 11 }).map((_, i) => <rect key={i} x={-60 + i * 120} y={1340} width={12} height={90} fill="#1d120d" />)}
    <rect x={150} y={300} width={26} height={1140} fill="#0d0807" />
    <line x1={163} y1={420} x2={1200} y2={300} stroke="#0d0807" strokeWidth={4} />
    {/* lantern */}
    <line x1={300} y1={420} x2={300} y2={830} stroke="#0d0807" strokeWidth={3} />
    <circle cx={300} cy={880} r={300} fill="url(#lanternGlow)" opacity={0.55 + 0.05 * Math.sin(t * 9)} />
    <rect x={282} y={830} width={36} height={56} rx={6} fill="#ffdc9a" />
    <Person id="deckImam" x={610} base={1640} h={640} cap="turban" face={1} light={-1} pose="stand" />
    <Motes t={t} n={24} seed={5} area={[200, 700, 500, 700]} />
  </Push>
);

// ---------------- 4. the encounter on the dock (Rio, Sugarloaf behind) ----------------
const sugarloaf = "M-100 1215 L-100 1150 Q60 1100 180 1130 Q300 1060 420 1120 Q520 1140 600 1150 Q640 1150 660 1110 Q700 880 790 860 Q860 850 890 980 Q905 1060 950 1110 Q1040 1120 1200 1100 L1200 1215 Z";
export const DockScene: React.FC<SP & { joke?: boolean }> = ({ u, dur, t, joke }) => {
  const walk = joke ? 1 : clamp(u / 2.0);
  const mx = joke ? 430 : 120 + smooth(walk) * 310;
  const says = !joke && u > 2.05;
  return (
    <Push u={u} dur={dur} from={1.0} to={1.06} ox={560} oy={1300}>
      <Sky id="skyDock" stops={[[0, "#120a20"], [0.34, "#2c1734"], [0.52, "#73354a"], [0.62, "#e08a58"], [0.633, "#3b1d2c"], [1, "#0c0610"]]} />
      <Stars t={t} n={30} maxY={600} seed={11} />
      <circle cx={340} cy={1150} r={360} fill="url(#sunGlow)" opacity={0.55} />
      <path d={sugarloaf} fill="#2a1630" />
      <path d="M-100 1215 L1200 1215 L1200 1250 L-100 1250 Z" fill="#1b0e1e" />
      {Array.from({ length: 18 }).map((_, i) => (
        <rect key={i} x={340 - (24 + i * 9) / 2 + Math.sin(t * 2.2 + i) * 10} y={1230 + i * 13} width={24 + i * 9} height={3} fill="#ffb37a" opacity={0.5 - i * 0.025} />
      ))}
      <ShipSil x={880} y={1300} s={0.5} t={t} rock={1} color="#140a18" seed={4} lantern />
      {/* dock */}
      <path d="M-100 1920 L-100 1560 L1200 1520 L1200 1920 Z" fill="#1a0f0b" />
      {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={-100} y1={1580 + i * 42 + i * i * 3} x2={1200} y2={1540 + i * 42 + i * i * 3} stroke="#0e0806" strokeWidth={5} />)}
      {[60, 980].map((x) => <rect key={x} x={x} y={1440} width={30} height={160} fill="#120a08" />)}
      <Person id="male" x={mx} base={1640} h={540} cap="kufi" robe="#a99c86" face={1} light={-1}
        pose={joke ? "stand" : says ? "point" : "walk"} phase={u * 1.6} glow={0.8} />
      <Person id="dockImam" x={760} base={1650} h={570} cap="turban" face={-1} light={-1} pose={joke ? "shrug" : "stand"} />
      {joke && (
        <g opacity={ramp(u, 0.25, 0.5)} transform={`translate(840 ${880 - ramp(u, 0.25, 0.6) * 14})`}>
          <path d="M-70 -60 Q-70 -110 -20 -110 L60 -110 Q110 -110 110 -60 Q110 -10 60 -10 L10 -10 L-20 25 L-15 -10 Q-70 -10 -70 -60 Z" fill="#f3e6c8" />
          <text x={20} y={-38} textAnchor="middle" fontFamily="Playfair Display" fontWeight={900} fontSize={84} fill="#1b1020">?</text>
        </g>
      )}
      <Motes t={t} n={26} seed={9} area={[0, 900, 1080, 700]} />
    </Push>
  );
};

// ---------------- 5. the noon prayer, ship and dock together ----------------
export const PrayerScene: React.FC<SP> = ({ u, dur, t }) => {
  const bow = ramp(u, 2.45, 2.95);
  const dockIn = (i: number) => ramp(u, 1.5 + i * 0.16, 1.85 + i * 0.16);
  return (
    <Push u={u} dur={dur} from={1.0} to={1.06} oy={1350}>
      <Sky id="skyNoon" stops={[[0, "#1a0f24"], [0.25, "#4a2440"], [0.5, "#c8784a"], [0.64, "#f2b46a"], [0.645, "#5a2e30"], [1, "#140a10"]]} />
      <g transform={`rotate(${t * 4} 540 760)`} opacity={0.18}>
        {Array.from({ length: 18 }).map((_, i) => (
          <path key={i} d="M540 760 L520 -400 L560 -400 Z" fill="#ffe2a8" transform={`rotate(${i * 20} 540 760)`} />
        ))}
      </g>
      <circle cx={540} cy={760} r={480} fill="url(#sunGlow)" opacity={0.85} />
      <circle cx={540} cy={760} r={70} fill="#fff1cc" />
      <Sea t={t} y={1240} colors={["#4a2430", "#2c141e"]} amp={8} speed={0.6} />
      {/* ship deck left */}
      <path d="M-120 1452 L520 1440 L470 1560 Q180 1600 -120 1580 Z" fill="#120a0e" />
      <rect x={-120} y={1395} width={640} height={10} fill="#120a0e" />
      {[0, 120, 240, 360, 480].map((x) => <rect key={x} x={x} y={1395} width={9} height={50} fill="#120a0e" />)}
      <rect x={380} y={700} width={16} height={760} fill="#120a0e" />
      {/* dock right */}
      <rect x={560} y={1440} width={640} height={18} fill="#120a0e" />
      {[600, 720, 840, 960, 1080].map((x) => <rect key={x} x={x} y={1458} width={16} height={180} fill="#120a0e" />)}
      <Person id="p1" x={55} base={1442} h={250} cap="turban" pose="bow" bow={bow} face={1} light={-1} />
      <Person id="p2" x={185} base={1442} h={245} cap="fez" pose="bow" bow={bow} face={1} light={-1} />
      <Person id="p3" x={315} base={1442} h={245} cap="fez" pose="bow" bow={bow} face={1} light={-1} />
      {[625, 750, 875, 1000].map((x, i) => (
        <g key={i} opacity={dockIn(i)}>
          <Person id={`d${i}`} x={x} base={1440} h={245} cap="kufi" robe="#a99c86" pose="bow" bow={bow} face={1} light={-1} glow={0.7} />
        </g>
      ))}
      <Motes t={t} n={30} seed={13} area={[0, 600, 1080, 800]} />
    </Push>
  );
};

// ---------------- 6. teaching by lamplight ----------------
export const TeachScene: React.FC<SP> = ({ u, dur, t }) => {
  const wr = ramp(u, 0.9, 3.0);
  return (
    <Push u={u} dur={dur} from={1.0} to={1.06} ox={520} oy={1150}>
      <Sky id="skyRoom" stops={[[0, "#0b0610"], [0.5, "#1c1022"], [1, "#0a050b"]]} />
      {/* arched window */}
      <path d="M760 560 L760 980 L1000 980 L1000 560 A120 120 0 0 0 760 560 Z" fill="#14203c" />
      <circle cx={905} cy={640} r={34} fill="#f6ecd2" />
      <circle cx={922} cy={630} r={30} fill="#14203c" />
      <path d="M760 560 L760 980 L1000 980 L1000 560 A120 120 0 0 0 760 560 Z" fill="none" stroke="#2a1830" strokeWidth={16} />
      <line x1={880} y1={450} x2={880} y2={980} stroke="#2a1830" strokeWidth={8} />
      {/* lamp glow */}
      <circle cx={150} cy={1220} r={520} fill="url(#lanternGlow)" opacity={0.42 + 0.04 * Math.sin(t * 8)} />
      {/* board */}
      <rect x={140} y={740} width={560} height={400} rx={10} fill="#141a18" stroke="#3a2416" strokeWidth={18} />
      <foreignObject x={150} y={760} width={540} height={360}>
        <div style={{ width: 540, height: 360, display: "flex", alignItems: "center", justifyContent: "center", direction: "rtl",
          fontFamily: "Amiri", fontWeight: 700, fontSize: 96, color: "#efe4c8", whiteSpace: "nowrap",
          clipPath: `inset(-20% 0 -20% ${100 - wr * 100}%)`, textShadow: "0 0 18px rgba(255,230,180,.25)" }}>
          ا ب ت ث ج
        </div>
      </foreignObject>
      <rect x={130} y={1140} width={22} height={260} fill="#2a180f" transform="rotate(8 141 1140)" />
      <rect x={690} y={1140} width={22} height={260} fill="#2a180f" transform="rotate(-8 701 1140)" />
      {/* floor + lamp */}
      <rect x={-100} y={1480} width={1300} height={600} fill="#120a0c" />
      <ellipse cx={150} cy={1470} rx={60} ry={16} fill="#3a2416" />
      <path d="M120 1460 Q150 1420 180 1460 Z" fill="#c98a3a" />
      <path d={`M150 ${1420} Q${140 + Math.sin(t * 9) * 4} 1395 150 1370 Q${160 + Math.sin(t * 7) * 4} 1395 150 1420 Z`} fill="#ffd27a" />
      <Person id="teacher" x={850} base={1500} h={560} cap="turban" pose="point" face={-1} light={-1} />
      {[300, 520, 740].map((x, i) => (
        <Person key={i} id={`st${i}`} x={x} base={1760} h={430} cap="kufi" robe="#a99c86" pose="sit" face={1} light={-1} glow={0.7} />
      ))}
      <Motes t={t} n={22} seed={17} area={[0, 800, 700, 700]} />
    </Push>
  );
};
