// Ketchup 2D: the food-poster illustrations (one big hero per beat, no people, no map). Flat fills in 3 tones per surface,
// one light from the top-left, fine paper grain. Heroes sit in the lower-middle (y ≈ 950–1700) so the animated graphics
// (years, labels, cards at y 700–1000) and the top captions stay readable. Each takes t = seconds since the scene started.
import React from "react";
import { K, Grain, JarHero } from "./Hero";

const F: React.FC<{ bg: string; id: string; children: React.ReactNode; halo?: string }> = ({ bg, id, children, halo }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <rect width="1080" height="1920" fill={bg} />
    {halo && <><circle cx="540" cy="1250" r="500" fill={halo} opacity="0.35" />{[580, 660, 740].map((r) => <circle key={r} cx="540" cy="1250" r={r} fill="none" stroke={K.cream} strokeOpacity="0.12" strokeWidth="3" />)}</>}
    {children}
    <Grain id={id} />
  </svg>
);
const G = { gold: "#E8B04A", goldDk: "#C98E2E", goldLt: "#F5D27A", wood: "#8A5A3B", woodDk: "#5E3B26", woodLt: "#B07A52", shell: "#B9B2A4", shellDk: "#857D6E", shellLt: "#E3DED3", sea: "#2E5E66", seaDk: "#1F454C", seaLt: "#4C7F86" };

// ---------- fries + ketchup ----------
const Fry: React.FC<{ x: number; y: number; r: number; h?: number }> = ({ x, y, r, h = 300 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-22} y={-h} width={44} height={h} rx={8} fill={G.gold} /><rect x={6} y={-h} width={16} height={h} rx={6} fill={G.goldDk} /><rect x={-16} y={-h + 10} width={8} height={h - 30} rx={4} fill={G.goldLt} />
  </g>
);
const FriesCup: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[[-150, -10, 340], [-90, -4, 380], [-30, 3, 400], [30, 8, 370], [90, 14, 350], [140, 20, 320], [-120, 12, 300], [60, -12, 330], [0, -8, 360]].map(([fx, r, h], i) => <Fry key={i} x={fx} y={40} r={r} h={h} />)}
    <path d="M-230 0 L230 0 L180 380 L-180 380 Z" fill={K.cream} />
    <path d="M60 0 L230 0 L180 380 L40 380 Z" fill={K.creamDk} />
    {[-170, -90, -10, 70, 150].map((sx) => <path key={sx} d={`M${sx} 0 L${sx + 40} 0 L${sx * 0.78 + 30} 380 L${sx * 0.78} 380 Z`} fill={K.tomato} />)}
    <rect x={-240} y={-16} width={480} height={30} rx={10} fill={K.cream} />
  </g>
);
export const ArtHook: React.FC<{ t: number }> = ({ t }) => {
  const pour = Math.min(1, t / 0.8);
  return (
    <F bg={K.olive} id="gh" halo={K.oliveLt}>
      <ellipse cx="540" cy="1700" rx="300" ry="40" fill={K.oliveDk} />
      <FriesCup x={540} y={1300} s={1} />
      <path d={`M560 ${930} C ${560} ${1000} ${545} ${1080} ${548} ${930 + 240 * pour}`} stroke={K.tomato} strokeWidth="34" fill="none" strokeLinecap="round" />
      {pour > 0.9 && <path d="M470 1260 C470 1190 640 1180 640 1250 C620 1290 500 1300 470 1260 Z" fill={K.tomato} />}
      {pour > 0.9 && <path d="M500 1236 C520 1214 560 1212 580 1220" stroke={K.tomatoLt} strokeWidth="10" fill="none" strokeLinecap="round" />}
      <g transform="translate(600 780) rotate(160)">
        <rect x={-110} y={-220} width={220} height={400} rx={70} fill={K.tomato} /><rect x={30} y={-220} width={80} height={400} rx={40} fill={K.tomatoDk} />
        <rect x={-80} y={-190} width={26} height={330} rx={13} fill={K.tomatoLt} />
        <rect x={-90} y={180} width={180} height={70} rx={20} fill={K.cream} /><path d="M-40 250 L40 250 L12 330 L-12 330 Z" fill={K.cream} /><path d="M10 250 L40 250 L12 330 Z" fill={K.creamDk} />
      </g>
    </F>
  );
};
export const ArtDip: React.FC<{ t: number }> = ({ t }) => {
  const dip = Math.sin(Math.min(1, t / 1.2) * Math.PI) * 120;
  return (
    <F bg={K.olive} id="gd" halo={K.oliveLt}>
      <g transform="translate(540 1450) scale(1.3) translate(-540 -1450)"><ellipse cx="540" cy="1560" rx="330" ry="50" fill={K.oliveDk} />
      <path d="M300 1380 L780 1380 L740 1540 L340 1540 Z" fill="#9AA6A1" /><path d="M300 1380 L780 1380 L770 1420 L310 1420 Z" fill="#C7D0CE" />
      <ellipse cx="540" cy="1390" rx="230" ry="40" fill={K.tomatoDk} /><ellipse cx="520" cy="1385" rx="200" ry="32" fill={K.tomato} /><path d="M420 1378 Q470 1366 520 1370" stroke={K.tomatoLt} strokeWidth="10" fill="none" strokeLinecap="round" />
      <g transform={`translate(560 ${1120 + dip}) rotate(14)`}><rect x={-26} y={-420} width={52} height={420} rx={10} fill={G.gold} /><rect x={8} y={-420} width={18} height={420} rx={6} fill={G.goldDk} /><rect x={-20} y={-410} width={9} height={380} rx={4} fill={G.goldLt} /><rect x={-26} y={-60} width={52} height={60} rx={10} fill={K.tomato} opacity={t > 0.9 ? 1 : 0} /></g>
      {[[200, 1600, -30], [880, 1620, 25], [760, 1660, -60]].map(([x, y, r], i) => <Fry key={i} x={x} y={y} r={r} h={180} />)}</g>
    </F>
  );
};

// ---------- jars ----------
export const ArtJar: React.FC<{ t: number }> = ({ t }) => <div style={{ position: "absolute", inset: 0, background: K.tomato, overflow: "hidden" }}><div style={{ position: "absolute", inset: 0, transform: "translateY(120px)" }}><JarHero t={t} /></div></div>;
export const ArtJarEmpty: React.FC<{ t: number }> = ({ t }) => (
  <F bg={K.charcoal} id="ge">
    <g transform="translate(0 140)" opacity="0.95">
      <ellipse cx="540" cy="1520" rx="390" ry="56" fill={K.ink} />
      <path d="M330 760 C250 820 205 960 215 1120 C226 1300 300 1440 400 1500 L680 1500 C780 1440 854 1300 865 1120 C875 960 830 820 750 760 Z" fill="#6F6A64" />
      <path d="M560 760 C760 800 900 1000 870 1200 C850 1380 760 1480 680 1500 L700 760 Z" fill="#5A5550" />
      <path d="M300 860 C250 980 250 1180 300 1330" stroke="#8C8780" strokeWidth="34" fill="none" strokeLinecap="round" />
      <path d="M205 900 C330 950 750 950 875 900 L878 1010 C750 1060 330 1060 202 1010 Z" fill="#4E4A46" />
      <ellipse cx="540" cy="760" rx="232" ry="44" fill="#3C3936" /><ellipse cx="540" cy="768" rx="200" ry="30" fill="#1A1918" />
      <path d="M308 760 C340 724 740 724 772 760" stroke="#8C8780" strokeWidth="14" fill="none" strokeLinecap="round" />
    </g>
    {[0, 1, 2].map((i) => { const p = (t * 0.35 + i * 0.33) % 1; return <path key={i} d={`M${470 + i * 70} ${880 - p * 200} q-20 -40 0 -80`} stroke={K.creamDk} strokeOpacity={0.35 * (1 - p)} strokeWidth="8" fill="none" strokeLinecap="round" />; })}
  </F>
);

// ---------- boats ----------
export const ArtJunk: React.FC<{ t: number }> = ({ t }) => {
  const bob = Math.sin(t * 1.4) * 10;
  return (
    <F bg={K.cream} id="gk">
      <circle cx="230" cy="760" r="110" fill={K.tomato} />
      <rect x="0" y="1260" width="1080" height="660" fill={G.sea} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-80 + ((t * 40 + i * 260) % 1300)} ${1330 + i * 120} q60 -26 120 0 q60 26 120 0`} stroke={G.seaLt} strokeWidth="10" fill="none" strokeLinecap="round" />)}
      <g transform={`translate(540 ${1300 + bob})`}>
        <path d="M-380 -40 Q-420 -110 -400 -150 L-300 -60 L300 -60 L420 -170 Q440 -100 380 -40 Q200 70 -200 70 Q-330 40 -380 -40 Z" fill={G.woodDk} />
        <path d="M-300 -60 L300 -60 L280 -20 L-290 -20 Z" fill={G.wood} />
        <rect x={-10} y={-640} width={20} height={590} fill={G.woodDk} /><rect x={180} y={-470} width={16} height={420} fill={G.woodDk} />
        <path d="M0 -620 Q-230 -520 -240 -90 L0 -90 Z" fill={K.tomato} /><path d="M0 -620 Q-100 -520 -110 -90 L0 -90 Z" fill={K.tomatoDk} />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${-20 - i * 6} ${-560 + i * 84} L${-232 + Math.max(0, 5 - i) * 2} ${-520 + i * 86}`} stroke={K.cream} strokeOpacity="0.7" strokeWidth="6" />)}
        <path d="M188 -450 Q40 -380 30 -90 L188 -90 Z" fill={K.tomatoLt} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M180 ${-410 + i * 80} L${44 + i * 3} ${-370 + i * 80}`} stroke={K.cream} strokeOpacity="0.7" strokeWidth="5" />)}
        <path d="M12 -640 L90 -620 L12 -600 Z" fill={K.olive} />
      </g>
      <rect x="0" y="1440" width="1080" height="480" fill={G.seaDk} opacity="0.55" />
    </F>
  );
};
export const ArtShip: React.FC<{ t: number; night?: boolean }> = ({ t, night }) => {
  const bob = Math.sin(t * 1.1) * 12;
  const sail = night ? K.creamDk : K.cream;
  return (
    <F bg={night ? K.charcoal : "#DCE4E2"} id={night ? "gs2" : "gs1"}>
      {night ? <circle cx="250" cy="720" r="90" fill={K.cream} /> : <circle cx="250" cy="720" r="110" fill="#F5F7F6" />}
      <rect x="0" y="1300" width="1080" height="620" fill={night ? G.seaDk : G.sea} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-80 + ((t * 50 + i * 300) % 1300)} ${1360 + i * 110} q60 -26 120 0 q60 26 120 0`} stroke={G.seaLt} strokeWidth="10" fill="none" strokeLinecap="round" />)}
      <g transform={`translate(560 ${1330 + bob}) rotate(${Math.sin(t * 0.9) * 1.5})`}>
        <path d="M-420 -60 L420 -60 L330 90 L-340 90 Z" fill={G.woodDk} /><path d="M-420 -60 L420 -60 L400 -20 L-405 -20 Z" fill={G.wood} />
        {[-250, -120, 10, 140, 270].map((x) => <rect key={x} x={x} y={-6} width={36} height={30} rx={4} fill={K.charcoal} />)}
        <path d="M380 -60 L470 -160" stroke={G.woodDk} strokeWidth="14" />
        {[[-210, -560], [10, -740], [220, -520]].map(([mx, top], i) => (
          <g key={i}><rect x={mx - 9} y={top} width={18} height={-top - 60} fill={G.woodDk} />
            {[0, 1, 2].map((k) => { const y0 = top + 40 + k * ((-top - 140) / 3), h = (-top - 200) / 3, w = 150 - k * 0 + (i === 1 ? 30 : 0);
              return <g key={k}><path d={`M${mx - w} ${y0} Q${mx} ${y0 - 20} ${mx + w} ${y0} L${mx + w - 10} ${y0 + h} Q${mx} ${y0 + h + 30} ${mx - w + 10} ${y0 + h} Z`} fill={sail} /><path d={`M${mx + 10} ${y0 - 8} Q${mx + w * 0.6} ${y0 - 6} ${mx + w} ${y0} L${mx + w - 10} ${y0 + h} Q${mx + w * 0.5} ${y0 + h + 22} ${mx + 10} ${y0 + h + 28} Z`} fill={K.creamDk} opacity="0.8" /></g>; })}
            <path d={`M${mx + 9} ${top} L${mx + 80} ${top + 18} L${mx + 9} ${top + 36} Z`} fill={K.tomato} /></g>))}
      </g>
      <rect x="0" y="1450" width="1080" height="470" fill={G.seaDk} opacity="0.5" />
    </F>
  );
};

// ---------- the improvised ketchups ----------
const Mush: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M-50 0 C-56 -120 -40 -200 -30 -220 L30 -220 C40 -200 56 -120 50 0 Z" fill={K.cream} /><path d="M10 -220 L30 -220 C40 -200 56 -120 50 0 L14 0 Z" fill={K.creamDk} />
    <path d="M-200 -200 C-190 -360 190 -360 200 -200 C120 -170 -120 -170 -200 -200 Z" fill={G.wood} />
    <path d="M30 -330 C120 -320 190 -280 200 -200 C150 -185 90 -178 40 -176 Z" fill={G.woodDk} />
    <path d="M-150 -250 C-120 -300 -60 -320 -10 -322" stroke={G.woodLt} strokeWidth="16" fill="none" strokeLinecap="round" />
    <path d="M-190 -196 C-120 -175 120 -175 190 -196 C120 -160 -120 -160 -190 -196 Z" fill="#D9C9A8" />
    {[-150, -100, -50, 0, 50, 100, 150].map((gx) => <path key={gx} d={`M${gx} -186 L${gx * 0.4} -168`} stroke={G.woodLt} strokeWidth="4" />)}
  </g>
);
export const ArtMushrooms: React.FC<{ t: number }> = ({ t }) => (
  <F bg={K.cream} id="gmu">
    <ellipse cx="540" cy="1650" rx="420" ry="54" fill={K.creamDk} />
    <g transform="translate(540 1600) scale(1.35) translate(-540 -1600)"><Mush x={380} y={1640} s={0.95} r={-8} /><Mush x={700} y={1650} s={1.2} r={6} /><Mush x={540} y={1690} s={0.7} r={-2} /></g>
    {[0, 1, 2, 3].map((i) => <circle key={i} cx={260 + i * 190} cy={1100 - ((t * 60 + i * 50) % 120)} r={5} fill={G.woodLt} opacity="0.5" />)}
  </F>
);
const Walnut: React.FC<{ x: number; y: number; s?: number; half?: boolean; r?: number }> = ({ x, y, s = 1, half, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <ellipse cx="0" cy="0" rx="150" ry="125" fill={half ? G.woodDk : G.woodLt} />
    {half ? (<><ellipse cx="0" cy="0" rx="126" ry="102" fill="#C69A6A" />
      <path d="M-90 -30 C-60 -90 -10 -60 0 -10 C10 -60 60 -90 90 -30 C110 30 60 80 0 40 C-60 80 -110 30 -90 -30 Z" fill="#9E6B3F" />
      <path d="M0 -10 L0 60" stroke="#7A4E2A" strokeWidth="8" /></>)
      : (<><path d="M0 -125 C-20 -40 -20 40 0 125" stroke={G.wood} strokeWidth="8" fill="none" />
        <path d="M20 -120 C110 -110 160 -20 140 50 C120 110 60 128 10 124 Z" fill={G.wood} />
        {[[-80, -40], [-60, 40], [70, -60], [90, 30], [-20, -80], [30, 80]].map(([px, py], i) => <path key={i} d={`M${px - 20} ${py} q20 -16 40 0`} stroke={G.woodDk} strokeWidth="6" fill="none" strokeLinecap="round" />)}
        <path d="M-110 -40 C-100 -80 -60 -104 -20 -112" stroke="#D3A57A" strokeWidth="12" fill="none" strokeLinecap="round" /></>)}
  </g>
);
export const ArtWalnuts: React.FC<{ t: number }> = ({ t }) => (
  <F bg={K.olive} id="gw" halo={K.oliveLt}>
    <ellipse cx="540" cy="1640" rx="420" ry="54" fill={K.oliveDk} />
    <g transform="translate(540 1520) scale(1.35) translate(-540 -1520)"><Walnut x={360} y={1460} s={1.05} r={-12} /><Walnut x={700} y={1430} s={1.2} half r={8} /><Walnut x={560} y={1610} s={0.75} r={20 + t * 4} /></g>
    {[[240, 1640, 30], [860, 1630, -20], [800, 1660, 60]].map(([x, y, r], i) => <path key={i} d="M-40 0 C-30 -40 30 -40 40 0 C20 -16 -20 -16 -40 0 Z" fill={G.woodDk} transform={`translate(${x} ${y}) rotate(${r})`} />)}
  </F>
);
const Oyster: React.FC<{ x: number; y: number; s?: number; r?: number; pearl?: boolean }> = ({ x, y, s = 1, r = 0, pearl }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M-200 0 C-210 -110 -80 -150 20 -140 C150 -130 220 -60 200 20 C180 100 60 130 -60 120 C-160 110 -196 60 -200 0 Z" fill={G.shellDk} />
    <path d="M-170 0 C-176 -90 -70 -124 20 -116 C130 -106 186 -50 170 16 C150 84 50 104 -50 96 C-140 88 -166 50 -170 0 Z" fill={G.shellLt} />
    <path d="M-120 0 C-110 -60 -20 -80 40 -70 C110 -56 130 0 100 40 C60 80 -60 80 -100 50 C-116 36 -122 20 -120 0 Z" fill="#D9D2C4" />
    <path d="M-60 -10 C-30 -40 30 -40 60 -10" stroke={G.shell} strokeWidth="8" fill="none" strokeLinecap="round" />
    {pearl && <><circle cx="10" cy="10" r="26" fill="#FBF8F2" /><circle cx="2" cy="2" r="8" fill="#fff" /></>}
  </g>
);
export const ArtOysters: React.FC<{ t: number }> = ({ t }) => (
  <F bg={K.charcoal} id="go">
    <g transform="translate(540 1430) scale(1.25) translate(-540 -1430)"><ellipse cx="540" cy="1430" rx="440" ry="200" fill="#9AA6A1" /><ellipse cx="540" cy="1410" rx="400" ry="170" fill="#C7D0CE" />
    {[[320, 1380, -14], [760, 1370, 12], [540, 1480, 0], [400, 1520, 20], [700, 1520, -18]].map(([x, y, r], i) => <Oyster key={i} x={x} y={y} s={0.62} r={r} pearl={i === 2} />)}
    <circle cx="540" cy="1340" r="70" fill={K.tomato} /><path d="M500 1320 Q520 1300 550 1300" stroke={K.tomatoLt} strokeWidth="10" fill="none" strokeLinecap="round" /></g>
    {[[200, 1250], [880, 1260], [930, 1560]].map(([x, y], i) => <path key={i} d="M0 -26 L8 -8 L26 0 L8 8 L0 26 L-8 8 L-26 0 L-8 -8 Z" fill={K.cream} opacity={0.4 + 0.4 * Math.abs(Math.sin(t * 2 + i))} transform={`translate(${x} ${y})`} />)}
  </F>
);

// ---------- tomatoes ----------
const Tomato: React.FC<{ x: number; y: number; s?: number; r?: number; heart?: boolean; green?: boolean }> = ({ x, y, s = 1, r = 0, heart, green }) => {
  const base = green ? "#8FB44E" : K.tomato, dk = green ? "#6E8F3A" : K.tomatoDk, lt = green ? "#B5D27A" : K.tomatoLt;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {heart ? <path d="M0 160 C-200 40 -230 -110 -120 -150 C-60 -172 -16 -130 0 -96 C16 -130 60 -172 120 -150 C230 -110 200 40 0 160 Z" fill={base} />
        : <ellipse cx="0" cy="0" rx="170" ry="150" fill={base} />}
      {heart ? <path d="M0 160 C120 90 190 0 150 -100 C190 -60 200 40 0 160 Z" fill={dk} /> : <path d="M30 -148 C140 -130 190 -40 160 50 C130 130 40 152 -20 148 C80 120 140 40 120 -50 C110 -100 70 -136 30 -148 Z" fill={dk} />}
      <path d={heart ? "M-150 -80 C-140 -120 -100 -140 -60 -130" : "M-120 -60 C-100 -110 -50 -134 -10 -138"} stroke={lt} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M0 -140 L-50 -170 L-20 -130 L-70 -120 L-14 -116 L-30 -76 L0 -108 L30 -76 L14 -116 L70 -120 L20 -130 L50 -170 Z" fill={K.olive} transform={heart ? "translate(0 30)" : ""} />
      <rect x="-6" y={heart ? -150 : -180} width="12" height="44" rx="6" fill={K.oliveDk} />
    </g>
  );
};
export const ArtTomatoes: React.FC<{ t: number }> = ({ t }) => (
  <F bg={K.cream} id="gt">
    <path d="M540 820 C520 980 560 1100 520 1260 M520 1000 C400 1040 360 1100 330 1200 M528 1080 C660 1110 720 1180 760 1290" stroke={K.oliveDk} strokeWidth="16" fill="none" strokeLinecap="round" />
    {[[300, 1000, 30], [740, 1050, -40], [450, 900, -20]].map(([x, y, r], i) => <path key={i} d="M0 0 C40 -60 120 -60 160 0 C120 40 40 40 0 0 Z" fill={K.olive} transform={`translate(${x} ${y}) rotate(${r + Math.sin(t * 1.5 + i) * 3})`} />)}
    <Tomato x={330} y={1340} s={0.95} r={-6} /><Tomato x={760} y={1420} s={1.05} r={8} /><Tomato x={520} y={1540} s={0.85} green r={3} />
  </F>
);
export const ArtLoveApple: React.FC<{ t: number }> = ({ t }) => (
  <F bg={K.tomato} id="gl" halo={K.tomatoLt}>
    <ellipse cx="540" cy="1640" rx="300" ry="44" fill={K.tomatoDk} />
    <g transform={`translate(0 ${Math.sin(t * 2) * 8})`}><g transform="translate(540 1330) scale(1.6)"><g transform="translate(-540 -1330)"><Tomato x={540} y={1330} s={1} heart /></g></g></g>
    <g fill={K.cream} opacity="0.85">{[[260, 1180], [820, 1230], [300, 1500], [800, 1520]].map(([x, y], i) => <path key={i} d="M0 18 C-30 0 -30 -20 -14 -24 C-6 -26 -2 -20 0 -16 C2 -20 6 -26 14 -24 C30 -20 30 0 0 18 Z" transform={`translate(${x} ${y - ((t * 30 + i * 20) % 60)}) scale(1.6)`} />)}</g>
  </F>
);

// ---------- the clear glass bottle ----------
export const GlassBottle: React.FC<{ x: number; y: number; s?: number; fill?: number }> = ({ x, y, s = 1, fill = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 -560 L60 -560 L60 -470 C60 -400 150 -360 150 -260 L150 0 L-150 0 L-150 -260 C-150 -360 -60 -400 -60 -470 Z" fill="#E9F1F0" opacity="0.35" />
    <clipPath id={`bf${x}`}><path d="M-60 -560 L60 -560 L60 -470 C60 -400 150 -360 150 -260 L150 0 L-150 0 L-150 -260 C-150 -360 -60 -400 -60 -470 Z" /></clipPath>
    <g clipPath={`url(#bf${x})`}><rect x="-160" y={-470 * fill} width="320" height={470 * fill + 10} fill={K.tomato} /><rect x="40" y={-470 * fill} width="120" height={470 * fill + 10} fill={K.tomatoDk} /></g>
    {[-100, 0, 100].map((fx) => <path key={fx} d={`M${fx} -300 L${fx} -10`} stroke="#fff" strokeOpacity="0.18" strokeWidth="4" />)}
    <path d="M-110 -280 C-120 -200 -118 -100 -110 -30" stroke="#fff" strokeOpacity="0.7" strokeWidth="16" fill="none" strokeLinecap="round" />
    <path d="M-60 -560 L60 -560 L60 -470 C60 -400 150 -360 150 -260 L150 0 L-150 0 L-150 -260 C-150 -360 -60 -400 -60 -470 Z" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="6" />
    <rect x="-70" y="-610" width="140" height="60" rx="12" fill={K.charcoal} /><rect x="-70" y="-610" width="40" height="60" rx="10" fill="#4A4A4A" />
    <rect x="-110" y="-230" width="220" height="130" rx="10" fill={K.cream} /><rect x="-90" y="-200" width="180" height="16" rx="8" fill={K.olive} /><rect x="-70" y="-160" width="140" height="12" rx="6" fill={K.creamDk} /><rect x="-50" y="-134" width="100" height="10" rx="5" fill={K.creamDk} />
  </g>
);
export const ArtBottle: React.FC<{ t: number }> = ({ t }) => (
  <F bg={K.charcoal} id="gb">
    <ellipse cx="540" cy="1640" rx="300" ry="44" fill={K.ink} />
    <rect x="0" y="1520" width="1080" height="400" fill="#3A3A3A" />
    <GlassBottle x={540} y={1640} s={1.25} fill={Math.min(1, 0.2 + t / 1.2)} />
  </F>
);

// ---------- the split: fish jar (then) vs glass bottle (now) ----------
export const ArtSplitLeft: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, background: K.tomato, overflow: "hidden" }}><div style={{ position: "absolute", inset: 0, transform: "translate(0px, 220px) scale(0.85)" }}><JarHero t={t} /></div></div>
);
export const ArtSplitRight: React.FC<{ t: number }> = ({ t }) => (
  <F bg={K.cream} id="gsr"><ellipse cx="540" cy="1640" rx="300" ry="44" fill={K.creamDk} /><GlassBottle x={540} y={1640} s={1.1} /></F>
);

export const ART: Record<string, React.FC<{ t: number }>> = {
  hook: ArtHook, jar: ArtJar, junk: ArtJunk, ship: ArtShip, shipNight: (p) => <ArtShip {...p} night />, jarEmpty: ArtJarEmpty,
  mushrooms: ArtMushrooms, walnuts: ArtWalnuts, oysters: ArtOysters, tomatoes: ArtTomatoes, loveApple: ArtLoveApple,
  bottle: ArtBottle, dip: ArtDip, splitLeft: ArtSplitLeft, splitRight: ArtSplitRight,
};

// QC board: every illustration at t = 1 s, 0.3 scale
export const ArtBoard: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", display: "grid", gridTemplateColumns: "repeat(5, 324px)", gridAutoRows: "576px" }}>
    {Object.entries(ART).map(([k, A]) => (
      <div key={k} style={{ position: "relative", width: 324, height: 576, overflow: "hidden", border: "2px solid #fff" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "scale(0.3)", transformOrigin: "0 0" }}><A t={1} /></div>
        <div style={{ position: "absolute", left: 6, top: 6, background: "#000", color: "#fff", fontFamily: "Inter", fontWeight: 800, fontSize: 20, padding: "2px 8px" }}>{k}</div>
      </div>
    ))}
  </div>
);
