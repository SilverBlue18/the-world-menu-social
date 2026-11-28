// Ketchup 2D, round 3 (user: "illustrations + not enough motion"). Same food-poster style, but every object ENTERS (pop with
// overshoot, staggered), every scene has LIFE inside (wiggle, sway, fall, crack, pulse, glint, drip) and more DETAIL
// (wooden table with grain, cast shadows, props, sparkles, stars, clouds, birds). t = seconds since the scene started.
import React from "react";
import { K, Grain } from "./Hero";

const G = { gold: "#E8B04A", goldDk: "#C98E2E", goldLt: "#F5D27A", wood: "#8A5A3B", woodDk: "#5E3B26", woodLt: "#B07A52",
  shell: "#B9B2A4", shellDk: "#857D6E", shellLt: "#E3DED3", sea: "#2E5E66", seaDk: "#1F454C", seaLt: "#4C7F86", sky: "#DCE4E2" };
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const backOut = (x: number, s = 1.9) => { x = clamp(x); const c = s + 1; return 1 + c * (x - 1) ** 3 + s * (x - 1) ** 2; };
const easeOut = (x: number) => 1 - (1 - clamp(x)) ** 3;
// pop an element in around its own anchor (cx, cy), starting at `at` seconds
const Pop: React.FC<{ t: number; at?: number; cx: number; cy: number; d?: number; children: React.ReactNode; from?: number }> = ({ t, at = 0, cx, cy, d = 0.45, children, from = 0 }) => {
  const k = backOut((t - at) / d); if (t < at) return null;
  return <g transform={`translate(${cx} ${cy + (1 - easeOut((t - at) / d)) * from}) scale(${Math.max(0, k)}) translate(${-cx} ${-cy})`}>{children}</g>;
};
const Frame: React.FC<{ bg: string; id: string; children: React.ReactNode; halo?: string; t: number }> = ({ bg, id, children, halo, t }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <rect width="1080" height="1920" fill={bg} />
    {halo && <g transform={`rotate(${t * 6} 540 1250)`}>
      <circle cx="540" cy="1250" r="500" fill={halo} opacity="0.35" />
      {[...Array(16)].map((_, i) => <path key={i} d={`M540 1250 L${540 + 900 * Math.cos(i * Math.PI / 8)} ${1250 + 900 * Math.sin(i * Math.PI / 8)} L${540 + 900 * Math.cos(i * Math.PI / 8 + 0.09)} ${1250 + 900 * Math.sin(i * Math.PI / 8 + 0.09)} Z`} fill={K.cream} opacity="0.05" />)}
      {[580, 660, 740].map((r) => <circle key={r} cx="540" cy="1250" r={r} fill="none" stroke={K.cream} strokeOpacity="0.12" strokeWidth="3" />)}
    </g>}
    {children}
    <Grain id={id} />
  </svg>
);
const Table: React.FC<{ y?: number; c?: string; dk?: string; lt?: string }> = ({ y = 1600, c = G.wood, dk = G.woodDk, lt = G.woodLt }) => (
  <g>
    <rect x="0" y={y} width="1080" height={1920 - y} fill={c} />
    <rect x="0" y={y} width="1080" height="16" fill={lt} />
    {[0, 1, 2].map((i) => <rect key={i} x="0" y={y + 110 + i * 120} width="1080" height="6" fill={dk} opacity="0.6" />)}
    {[[120, 60], [480, 170], [820, 90], [300, 290], [700, 330]].map(([x, dy], i) => <path key={i} d={`M${x} ${y + dy} q60 -18 120 0 q60 18 120 0`} stroke={dk} strokeWidth="5" fill="none" opacity="0.45" />)}
  </g>
);
const Sparkle: React.FC<{ x: number; y: number; t: number; ph?: number; s?: number; c?: string }> = ({ x, y, t, ph = 0, s = 1, c = K.cream }) => {
  const k = 0.4 + 0.6 * Math.abs(Math.sin(t * 2.4 + ph));
  return <path d="M0 -26 L7 -7 L26 0 L7 7 L0 26 L-7 7 L-26 0 L-7 -7 Z" fill={c} opacity={k} transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * k)})`} />;
};

// ================= HOOK: ketchup squeezed onto fries =================
const Fry: React.FC<{ x: number; y: number; r: number; h?: number }> = ({ x, y, r, h = 300 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-22} y={-h} width={44} height={h} rx={8} fill={G.gold} /><rect x={6} y={-h} width={16} height={h} rx={6} fill={G.goldDk} /><rect x={-16} y={-h + 10} width={8} height={h - 30} rx={4} fill={G.goldLt} />
    <rect x={-22} y={-h} width={44} height={20} rx={8} fill={G.goldDk} opacity="0.5" />
  </g>
);
const FRIES: [number, number, number][] = [[-150, -10, 340], [-90, -4, 380], [-30, 3, 400], [30, 8, 370], [90, 14, 350], [140, 20, 320], [-120, 12, 300], [60, -12, 330], [0, -8, 360]];
export const Hook2: React.FC<{ t: number }> = ({ t }) => {
  const pourT = clamp((t - 0.55) / 0.7), squeeze = Math.sin(clamp((t - 0.5) / 1.4) * Math.PI) * 0.08;
  return (
    <Frame bg={K.olive} id="h2" halo={K.oliveLt} t={t}>
      <Table y={1640} />
      <ellipse cx="540" cy="1650" rx="300" ry="36" fill={G.woodDk} opacity="0.7" />
      <Pop t={t} at={0} cx={540} cy={1640} from={120}>
        <g transform="translate(540 1270)">
          {FRIES.map(([fx, r, h], i) => { const k = backOut((t - 0.05 - i * 0.04) / 0.4); return <g key={i} transform={`translate(0 ${(1 - clamp(k)) * 260})`}><Fry x={fx} y={40} r={r + Math.sin(t * 2 + i) * 1.2} h={h} /></g>; })}
          <path d="M-230 0 L230 0 L180 380 L-180 380 Z" fill={K.cream} /><path d="M60 0 L230 0 L180 380 L40 380 Z" fill={K.creamDk} />
          {[-170, -90, -10, 70, 150].map((sx) => <path key={sx} d={`M${sx} 0 L${sx + 40} 0 L${sx * 0.78 + 30} 380 L${sx * 0.78} 380 Z`} fill={K.tomato} />)}
          <rect x={-240} y={-16} width={480} height={30} rx={10} fill={K.cream} />
        </g>
      </Pop>
      {/* the pour: stream wobbles, then a blob grows with droplets */}
      {pourT > 0 && <path d={`M556 930 C ${556 + Math.sin(t * 9) * 10} 1010 ${546 + Math.sin(t * 7) * 8} 1090 548 ${930 + 270 * pourT}`} stroke={K.tomato} strokeWidth="34" fill="none" strokeLinecap="round" />}
      {pourT > 0.95 && <g transform={`translate(555 1250) scale(${backOut((t - 1.2) / 0.35)})`}>
        <path d="M-90 10 C-90 -60 90 -70 90 0 C70 40 -50 50 -90 10 Z" fill={K.tomato} /><path d="M-50 -14 C-30 -36 10 -38 30 -30" stroke={K.tomatoLt} strokeWidth="10" fill="none" strokeLinecap="round" />
        {[[-120, -30], [120, -50], [-60, -90], [80, -100]].map(([dx, dy], i) => { const p = clamp((t - 1.2) / 0.5); return <circle key={i} cx={dx * p} cy={dy * p + 60 * p * p} r={10 * (1 - p * 0.5)} fill={K.tomato} opacity={1 - p * 0.3} />; })}
      </g>}
      <g transform={`translate(${600 + (1 - easeOut(t / 0.45)) * 500} ${780 - (1 - easeOut(t / 0.45)) * 300}) rotate(160) scale(${1 + squeeze} ${1 - squeeze})`}>
        <rect x={-110} y={-220} width={220} height={400} rx={70} fill={K.tomato} /><rect x={30} y={-220} width={80} height={400} rx={40} fill={K.tomatoDk} />
        <rect x={-80} y={-190} width={26} height={330} rx={13} fill={K.tomatoLt} />
        <rect x={-70} y={-80} width={140} height={110} rx={14} fill={K.cream} /><rect x={-50} y={-56} width={100} height={14} rx={7} fill={K.olive} /><rect x={-40} y={-30} width={80} height={10} rx={5} fill={K.creamDk} />
        <rect x={-90} y={180} width={180} height={70} rx={20} fill={K.cream} /><path d="M-40 250 L40 250 L12 330 L-12 330 Z" fill={K.cream} /><path d="M10 250 L40 250 L12 330 Z" fill={K.creamDk} />
      </g>
      {[[250, 1050, 0], [830, 1180, 1.3], [300, 1420, 2.1]].map(([x, y, ph], i) => <Sparkle key={i} x={x} y={y} t={t} ph={ph} />)}
    </Frame>
  );
};

// ================= JAR of fermenting fish (kê-tsiap) =================
const FishHead: React.FC<{ x: number; y: number; r: number; s?: number }> = ({ x, y, r, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M0 0 C40 -60 150 -70 220 -20 C250 0 250 20 220 40 C150 90 40 70 0 20 Z" fill="#C7D0CE" />
    <path d="M0 10 C50 50 150 70 220 40 C250 25 250 10 240 2 C190 40 90 40 0 10 Z" fill="#8E9B98" />
    <path d="M30 -18 C80 -50 160 -52 205 -22" stroke="#EEF2F1" strokeWidth="10" fill="none" strokeLinecap="round" />
    {[0, 1, 2, 3].map((i) => [0, 1].map((j) => <path key={`${i}${j}`} d={`M${50 + i * 36} ${-12 + j * 30} q14 14 0 28`} stroke="#8E9B98" strokeWidth="4" fill="none" opacity="0.7" />))}
    <path d="M150 -26 Q170 6 150 44" stroke="#8E9B98" strokeWidth="6" fill="none" />
    <circle cx="188" cy="-2" r="15" fill={K.cream} /><circle cx="190" cy="-2" r="9" fill={K.ink} /><circle cx="186" cy="-6" r="3" fill="#fff" />
  </g>
);
const FishTail: React.FC<{ x: number; y: number; r: number; s?: number }> = ({ x, y, r, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M0 0 C-30 -10 -60 -60 -90 -70 C-70 -30 -70 30 -90 70 C-60 60 -30 10 0 0 Z" fill="#C7D0CE" />
    <path d="M0 0 C-30 10 -60 60 -90 70 C-76 40 -74 20 -72 8 Z" fill="#8E9B98" />
  </g>
);
const JAR_BODY = "M330 760 C250 820 205 960 215 1120 C226 1300 300 1440 400 1500 L680 1500 C780 1440 854 1300 865 1120 C875 960 830 820 750 760 Z";
const JarShape: React.FC<{ gray?: boolean; id: string }> = ({ gray, id }) => {
  const c = gray ? { b: "#6F6A64", d: "#5A5550", l: "#8C8780", band: "#4E4A46", bandDk: "#3C3936" } : { b: K.clay, d: K.clayDk, l: K.clayLt, band: K.olive, bandDk: K.oliveDk };
  return (
    <g>
      <defs><clipPath id={id}><path d={JAR_BODY} /></clipPath></defs>
      <path d={JAR_BODY} fill={c.b} />
      <g clipPath={`url(#${id})`}>
        <path d="M560 700 C760 760 900 1000 880 1200 C860 1400 760 1500 640 1540 L1000 1600 L1000 700 Z" fill={c.d} />
        <path d="M300 860 C250 980 250 1180 300 1330" stroke={c.l} strokeWidth="34" fill="none" strokeLinecap="round" />
        <path d="M200 900 C330 950 750 950 880 900 L880 1010 C750 1060 330 1060 200 1010 Z" fill={c.band} />
        <path d="M200 1010 C330 1060 750 1060 880 1010" stroke={c.bandDk} strokeWidth="10" fill="none" />
        {!gray && [0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${250 + i * 95} 1030 q12 50 0 70 q-12 -20 0 -70`} fill={c.band} />)}
        {!gray && [0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${255 + i * 100} 960 q25 -30 50 0 q25 30 50 0`} stroke={K.cream} strokeWidth="7" fill="none" strokeLinecap="round" />)}
        {[1180, 1300, 1400].map((y) => <path key={y} d={`M200 ${y} C330 ${y + 40} 750 ${y + 40} 880 ${y}`} stroke={c.d} strokeWidth="6" fill="none" opacity="0.5" />)}
      </g>
      <ellipse cx="540" cy="760" rx="232" ry="44" fill={c.d} />
      {gray && <ellipse cx="540" cy="768" rx="200" ry="30" fill="#1A1918" />}
      <path d="M308 760 C340 724 740 724 772 760" stroke={c.l} strokeWidth="14" fill="none" strokeLinecap="round" />
    </g>
  );
};
export const Jar2: React.FC<{ t: number }> = ({ t }) => {
  const w = (ph: number) => Math.sin(t * 5 + ph) * 7;
  return (
    <Frame bg={K.tomato} id="j2" halo={K.tomatoLt} t={t}>
      <Table y={1640} c={K.tomatoDk} dk="#7E1222" lt="#C42A3E" />
      <g transform="translate(0 130)">
        <Pop t={t} at={0} cx={540} cy={1500} from={160}>
          <ellipse cx="540" cy="1520" rx="390" ry="50" fill="#7E1222" opacity="0.8" />
          <FishTail x={430} y={720} r={-110 + w(0)} s={1.05} /><FishHead x={560} y={760} r={-70 + w(1)} s={0.95} />
          <FishHead x={420} y={790} r={-115 + w(2)} s={0.85} /><FishTail x={680} y={740} r={-60 + w(3)} s={0.9} />
          <JarShape id="jc2" />
        </Pop>
        {/* salt pinches falling into the jar */}
        {[...Array(10)].map((_, i) => { const p = ((t * 0.9 + i * 0.1) % 1); return <rect key={i} x={500 + (i % 5) * 18 + Math.sin(i) * 20} y={420 + p * 330} width={10} height={10} fill={K.cream} opacity={t > 0.4 ? 1 - p * 0.6 : 0} transform={`rotate(45 ${505 + (i % 5) * 18} ${425 + p * 330})`} />; })}
        {[0, 1, 2, 3, 4, 5].map((i) => { const p = ((t * 0.55 + i * 0.17) % 1); return <circle key={i} cx={470 + i * 30 + Math.sin(i * 7 + t * 2) * 12} cy={700 - p * 300} r={6 + (i % 3) * 4} fill="none" stroke={K.cream} strokeWidth="4" opacity={1 - p} />; })}
      </g>
      <Pop t={t} at={0.3} cx={180} cy={1620}><g transform="translate(180 1620)"><path d="M-110 0 C-110 -90 110 -90 110 0 Z" fill={K.cream} /><path d="M20 -66 C80 -56 110 -30 110 0 L30 0 Z" fill={K.creamDk} />{[[-50, -50], [-10, -64], [30, -52], [-30, -30], [10, -36]].map(([x, y], i) => <rect key={i} x={x} y={y} width="14" height="14" fill="#fff" transform={`rotate(45 ${x} ${y})`} />)}</g></Pop>
      {[[880, 1100, 0], [190, 1000, 1.7]].map(([x, y, ph], i) => <Sparkle key={i} x={x} y={y} t={t} ph={ph} />)}
    </Frame>
  );
};
export const JarEmpty2: React.FC<{ t: number }> = ({ t }) => {
  const rattle = t < 0.8 ? Math.sin(t * 60) * 6 * (1 - t / 0.8) : 0;
  return (
    <Frame bg={K.charcoal} id="je2" t={t}>
      <Table y={1660} c="#3A3A3A" dk="#242424" lt="#4A4A4A" />
      <g transform={`translate(${rattle} 150) rotate(${rattle * 0.3} 540 1500)`}>
        <ellipse cx="540" cy="1520" rx="390" ry="50" fill="#1A1A1A" />
        <JarShape gray id="jg2" />
      </g>
      {/* dust puffs from the empty mouth */}
      {[0, 1, 2, 3, 4].map((i) => { const p = clamp((t - 0.1 - i * 0.12) / 1.4); return <circle key={i} cx={540 + (i - 2) * 60 * p} cy={880 - p * 260} r={30 + p * 50} fill={K.creamDk} opacity={0.25 * (1 - p)} />; })}
      {/* the missing fish: a dashed outline drifting away */}
      <g transform={`translate(${540 + t * 60} ${700 - t * 40}) rotate(-12)`} opacity={clamp(1 - t / 3)}>
        <path d="M-120 0 C-60 -70 60 -70 110 0 C60 70 -60 70 -120 0 Z M110 0 L170 -46 L170 46 Z" fill="none" stroke={K.cream} strokeWidth="6" strokeDasharray="16 12" />
      </g>
    </Frame>
  );
};

// ================= SHIPS =================
const Clouds: React.FC<{ t: number; c?: string; y?: number }> = ({ t, c = "#fff", y = 560 }) => (
  <g opacity="0.85">{[[100, 0, 1], [620, 80, 0.8], [960, -40, 1.1]].map(([x, dy, s], i) => { const xx = ((x + t * 25 * (1 + i * 0.3)) % 1400) - 200; return (
    <g key={i} transform={`translate(${xx} ${y + dy}) scale(${s})`}><ellipse cx="0" cy="0" rx="120" ry="40" fill={c} /><ellipse cx="-60" cy="-24" rx="60" ry="40" fill={c} /><ellipse cx="40" cy="-34" rx="70" ry="48" fill={c} /></g>); })}</g>
);
const Birds: React.FC<{ t: number; c?: string }> = ({ t, c = K.charcoal }) => (
  <g>{[[0, 0], [70, 30], [-60, 40]].map(([dx, dy], i) => { const f = Math.sin(t * 9 + i) * 14; const x = ((200 + t * 70 + dx) % 1300) - 100, y = 700 + dy + Math.sin(t + i) * 20;
    return <path key={i} d={`M${x - 30} ${y + f * 0.4} Q${x - 14} ${y - f} ${x} ${y} Q${x + 14} ${y - f} ${x + 30} ${y + f * 0.4}`} stroke={c} strokeWidth="6" fill="none" strokeLinecap="round" />; })}</g>
);
const Sea: React.FC<{ t: number; y: number; night?: boolean }> = ({ t, y, night }) => (
  <g>
    <rect x="0" y={y} width="1080" height={1920 - y} fill={night ? G.seaDk : G.sea} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-200 + ((t * (40 + i * 12) + i * 260) % 1500)} ${y + 50 + i * 110} q60 -26 120 0 q60 26 120 0 q60 -26 120 0`} stroke={G.seaLt} strokeWidth="10" fill="none" strokeLinecap="round" opacity={0.8 - i * 0.1} />)}
  </g>
);
const Flag: React.FC<{ x: number; y: number; t: number; c?: string }> = ({ x, y, t, c = K.tomato }) => {
  const w = Math.sin(t * 6 + x) * 8;
  return <path d={`M${x} ${y} Q${x + 40} ${y - 6 + w} ${x + 84} ${y + 4 + w} L${x + 84} ${y + 30 + w} Q${x + 40} ${y + 22 + w} ${x} ${y + 36} Z`} fill={c} />;
};
export const Junk2: React.FC<{ t: number }> = ({ t }) => {
  const bob = Math.sin(t * 1.4) * 10, br = 1 + Math.sin(t * 2.2) * 0.03;
  return (
    <Frame bg={K.cream} id="k2" t={t}>
      <circle cx="230" cy="760" r="110" fill={K.tomato} /><circle cx="230" cy="760" r={140 + Math.sin(t * 2) * 6} fill="none" stroke={K.tomato} strokeOpacity="0.3" strokeWidth="8" />
      <Clouds t={t} c={K.creamDk} y={600} /><Birds t={t} />
      <path d="M0 1260 L160 1160 L300 1230 L480 1120 L640 1220 L820 1150 L1080 1240 L1080 1270 L0 1270 Z" fill={K.oliveLt} opacity="0.6" />
      <Sea t={t} y={1260} />
      <g transform={`translate(${540 + (1 - easeOut(t / 0.8)) * -600} ${1300 + bob}) rotate(${Math.sin(t * 1.2) * 2})`}>
        <path d="M-380 -40 Q-420 -110 -400 -150 L-300 -60 L300 -60 L420 -170 Q440 -100 380 -40 Q200 70 -200 70 Q-330 40 -380 -40 Z" fill={G.woodDk} />
        <path d="M-300 -60 L300 -60 L280 -20 L-290 -20 Z" fill={G.wood} />{[-200, -80, 40, 160].map((x) => <rect key={x} x={x} y={-10} width="60" height="10" fill={G.woodLt} />)}
        <rect x={-10} y={-640} width={20} height={590} fill={G.woodDk} /><rect x={180} y={-470} width={16} height={420} fill={G.woodDk} />
        <g transform={`translate(0 -90) scale(${br} 1) translate(0 90)`}>
          <path d="M0 -620 Q-230 -520 -240 -90 L0 -90 Z" fill={K.tomato} /><path d="M0 -620 Q-100 -520 -110 -90 L0 -90 Z" fill={K.tomatoDk} />
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${-20 - i * 6} ${-560 + i * 84} L${-232 + Math.max(0, 5 - i) * 2} ${-520 + i * 86}`} stroke={K.cream} strokeOpacity="0.7" strokeWidth="6" />)}
          <path d="M188 -450 Q40 -380 30 -90 L188 -90 Z" fill={K.tomatoLt} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M180 ${-410 + i * 80} L${44 + i * 3} ${-370 + i * 80}`} stroke={K.cream} strokeOpacity="0.7" strokeWidth="5" />)}
        </g>
        <Flag x={12} y={-640} t={t} c={K.olive} />
        {/* jars stacked on deck: the cargo */}
        {[-220, -150, 240].map((x, i) => <g key={i} transform={`translate(${x} -60)`}><path d="M-26 0 Q-36 -40 -20 -70 L20 -70 Q36 -40 26 0 Z" fill={K.clay} /><rect x="-22" y="-80" width="44" height="12" rx="4" fill={K.clayDk} /></g>)}
      </g>
      <rect x="0" y="1440" width="1080" height="480" fill={G.seaDk} opacity="0.55" />
    </Frame>
  );
};
export const Ship2: React.FC<{ t: number; night?: boolean }> = ({ t, night }) => {
  const bob = Math.sin(t * 1.1) * 12, br = 1 + Math.sin(t * 2) * 0.035;
  const sail = night ? K.creamDk : K.cream;
  return (
    <Frame bg={night ? K.charcoal : G.sky} id={night ? "s2n" : "s2d"} t={t}>
      {night ? <>{[...Array(26)].map((_, i) => <circle key={i} cx={(i * 397) % 1080} cy={180 + ((i * 263) % 900)} r={2 + (i % 3)} fill={K.cream} opacity={0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + i))} />)}
        <circle cx="250" cy="720" r="90" fill={K.cream} /><circle cx="250" cy="720" r="130" fill={K.cream} opacity="0.08" /></>
        : <><circle cx="250" cy="720" r="110" fill="#F5F7F6" /><Clouds t={t} /><Birds t={t} /></>}
      <Sea t={t} y={1300} night={night} />
      <g transform={`translate(${560 + (night ? 0 : (1 - easeOut(t / 0.8)) * 700)} ${1330 + bob}) rotate(${Math.sin(t * 0.9) * 1.8})`}>
        <path d="M-420 -60 L420 -60 L330 90 L-340 90 Z" fill={G.woodDk} /><path d="M-420 -60 L420 -60 L400 -20 L-405 -20 Z" fill={G.wood} />
        <path d="M-330 40 L320 40" stroke={K.tomato} strokeWidth="10" />
        {[-250, -120, 10, 140, 270].map((x) => <rect key={x} x={x} y={-6} width={36} height={30} rx={4} fill={night ? "#E8B04A" : K.charcoal} opacity={night ? 0.6 + 0.4 * Math.abs(Math.sin(t * 3 + x)) : 1} />)}
        <path d="M380 -60 L470 -160" stroke={G.woodDk} strokeWidth="14" />
        {[[-210, -560], [10, -740], [220, -520]].map(([mx, top], i) => (
          <g key={i}><rect x={mx - 9} y={top} width={18} height={-top - 60} fill={G.woodDk} />
            <g transform={`translate(${mx} 0) scale(${br} 1) translate(${-mx} 0)`}>
              {[0, 1, 2].map((k) => { const y0 = top + 40 + k * ((-top - 140) / 3), h = (-top - 200) / 3, w = 150 + (i === 1 ? 30 : 0);
                return <g key={k}><path d={`M${mx - w} ${y0} Q${mx} ${y0 - 20} ${mx + w} ${y0} L${mx + w - 10} ${y0 + h} Q${mx} ${y0 + h + 30} ${mx - w + 10} ${y0 + h} Z`} fill={sail} /><path d={`M${mx + 10} ${y0 - 8} Q${mx + w * 0.6} ${y0 - 6} ${mx + w} ${y0} L${mx + w - 10} ${y0 + h} Q${mx + w * 0.5} ${y0 + h + 22} ${mx + 10} ${y0 + h + 28} Z`} fill={K.creamDk} opacity="0.8" /></g>; })}
            </g>
            <Flag x={mx + 9} y={top} t={t + i} /></g>))}
        {night && <><circle cx="-380" cy="-110" r="16" fill="#E8B04A" /><circle cx="-380" cy="-110" r={44 + Math.sin(t * 7) * 5} fill="#E8B04A" opacity="0.2" /></>}
      </g>
      <rect x="0" y="1450" width="1080" height="470" fill={G.seaDk} opacity="0.5" />
    </Frame>
  );
};

// ================= the improvised ketchups =================
const Mush: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M-50 0 C-56 -120 -40 -200 -30 -220 L30 -220 C40 -200 56 -120 50 0 Z" fill={K.cream} /><path d="M10 -220 L30 -220 C40 -200 56 -120 50 0 L14 0 Z" fill={K.creamDk} />
    <path d="M-200 -200 C-190 -360 190 -360 200 -200 C120 -170 -120 -170 -200 -200 Z" fill={G.wood} />
    <path d="M30 -330 C120 -320 190 -280 200 -200 C150 -185 90 -178 40 -176 Z" fill={G.woodDk} />
    <path d="M-150 -250 C-120 -300 -60 -320 -10 -322" stroke={G.woodLt} strokeWidth="16" fill="none" strokeLinecap="round" />
    {[[-90, -270], [60, -290], [-20, -240]].map(([dx, dy], i) => <ellipse key={i} cx={dx} cy={dy} rx="14" ry="9" fill={G.woodLt} opacity="0.6" />)}
    <path d="M-190 -196 C-120 -175 120 -175 190 -196 C120 -160 -120 -160 -190 -196 Z" fill="#D9C9A8" />
    {[-150, -100, -50, 0, 50, 100, 150].map((gx) => <path key={gx} d={`M${gx} -186 L${gx * 0.4} -168`} stroke={G.woodLt} strokeWidth="4" />)}
  </g>
);
export const Mushrooms2: React.FC<{ t: number }> = ({ t }) => (
  <Frame bg={K.cream} id="m2" t={t}>
    <Table y={1640} />
    <g transform="translate(540 1640) scale(1.3) translate(-540 -1640)">
      {[[380, 1640, 0.95, -8, 0], [700, 1650, 1.2, 6, 0.12], [540, 1690, 0.7, -2, 0.24]].map(([x, y, s, r, at], i) => (
        <Pop key={i} t={t} at={at} cx={x} cy={y} from={200}><ellipse cx={x} cy={y + 4} rx={170 * s} ry={20} fill={G.woodDk} opacity="0.5" /><Mush x={x} y={y} s={s} r={r + Math.sin(t * 2 + i) * 2} /></Pop>))}
    </g>
    {[0, 1, 2, 3, 4, 5].map((i) => { const p = ((t * 0.3 + i * 0.16) % 1); return <circle key={i} cx={240 + i * 120 + Math.sin(t + i) * 20} cy={1300 - p * 500} r={5} fill={G.woodLt} opacity={0.6 * (1 - p)} />; })}
  </Frame>
);
const WalnutWhole: React.FC = () => (
  <g><ellipse cx="0" cy="0" rx="150" ry="125" fill={G.woodLt} /><path d="M0 -125 C-20 -40 -20 40 0 125" stroke={G.wood} strokeWidth="8" fill="none" />
    <path d="M20 -120 C110 -110 160 -20 140 50 C120 110 60 128 10 124 Z" fill={G.wood} />
    {[[-80, -40], [-60, 40], [70, -60], [90, 30], [-20, -80], [30, 80]].map(([px, py], i) => <path key={i} d={`M${px - 20} ${py} q20 -16 40 0`} stroke={G.woodDk} strokeWidth="6" fill="none" strokeLinecap="round" />)}
    <path d="M-110 -40 C-100 -80 -60 -104 -20 -112" stroke="#D3A57A" strokeWidth="12" fill="none" strokeLinecap="round" /></g>
);
const WalnutHalf: React.FC = () => (
  <g><ellipse cx="0" cy="0" rx="150" ry="125" fill={G.woodDk} /><ellipse cx="0" cy="0" rx="126" ry="102" fill="#C69A6A" />
    <path d="M-90 -30 C-60 -90 -10 -60 0 -10 C10 -60 60 -90 90 -30 C110 30 60 80 0 40 C-60 80 -110 30 -90 -30 Z" fill="#9E6B3F" /><path d="M0 -10 L0 60" stroke="#7A4E2A" strokeWidth="8" /></g>
);
export const Walnuts2: React.FC<{ t: number }> = ({ t }) => {
  const crack = easeOut((t - 0.45) / 0.35);
  return (
    <Frame bg={K.olive} id="w2" halo={K.oliveLt} t={t}>
      <Table y={1660} />
      <g transform="translate(540 1520) scale(1.3) translate(-540 -1520)">
        <Pop t={t} at={0} cx={360} cy={1460}><g transform={`translate(360 1460) rotate(-12)`}><WalnutWhole /></g></Pop>
        {/* the cracking walnut: whole, then it splits into two halves */}
        {t < 0.45 ? <Pop t={t} at={0.1} cx={700} cy={1430}><g transform="translate(700 1430) scale(1.2)"><WalnutWhole /></g></Pop>
          : <><g transform={`translate(${700 - crack * 70} ${1430 + crack * 20}) rotate(${-crack * 18}) scale(1.2)`}><WalnutHalf /></g>
              <g transform={`translate(${700 + crack * 90} ${1430 + crack * 10}) rotate(${crack * 22}) scale(1.05)`}><WalnutWhole /></g>
              {[[-1, -1], [1, -1.3], [0.4, -1.6], [-0.7, -1.4]].map(([dx, dy], i) => { const p = clamp((t - 0.45) / 0.6); return <path key={i} d="M-24 0 C-18 -24 18 -24 24 0 C12 -10 -12 -10 -24 0 Z" fill={G.woodDk} transform={`translate(${700 + dx * 200 * p} ${1360 + dy * 160 * p + 300 * p * p}) rotate(${p * 300 * dx})`} opacity={1 - p * 0.3} />; })}</>}
        <Pop t={t} at={0.22} cx={560} cy={1610}><g transform={`translate(560 1610) rotate(${20 + t * 6}) scale(0.75)`}><WalnutWhole /></g></Pop>
      </g>
    </Frame>
  );
};
const Oyster: React.FC<{ s?: number; r?: number; pearl?: boolean; open?: number }> = ({ s = 1, r = 0, pearl, open = 1 }) => (
  <g transform={`rotate(${r}) scale(${s})`}>
    <path d="M-200 0 C-210 -110 -80 -150 20 -140 C150 -130 220 -60 200 20 C180 100 60 130 -60 120 C-160 110 -196 60 -200 0 Z" fill={G.shellDk} />
    <g transform={`scale(${0.4 + 0.6 * open})`}>
      <path d="M-170 0 C-176 -90 -70 -124 20 -116 C130 -106 186 -50 170 16 C150 84 50 104 -50 96 C-140 88 -166 50 -170 0 Z" fill={G.shellLt} />
      <path d="M-120 0 C-110 -60 -20 -80 40 -70 C110 -56 130 0 100 40 C60 80 -60 80 -100 50 C-116 36 -122 20 -120 0 Z" fill="#D9D2C4" />
      <path d="M-60 -10 C-30 -40 30 -40 60 -10" stroke={G.shell} strokeWidth="8" fill="none" strokeLinecap="round" />
      {pearl && <><circle cx="10" cy="10" r="26" fill="#FBF8F2" /><circle cx="2" cy="2" r="8" fill="#fff" /></>}
    </g>
  </g>
);
export const Oysters2: React.FC<{ t: number }> = ({ t }) => (
  <Frame bg={K.charcoal} id="o2" t={t}>
    <Table y={1660} c="#3A3A3A" dk="#242424" lt="#4A4A4A" />
    <Pop t={t} at={0} cx={540} cy={1430} from={150}>
      <g transform="translate(540 1430) scale(1.25) translate(-540 -1430)">
        <ellipse cx="540" cy="1450" rx="440" ry="200" fill="#1F1F1F" opacity="0.6" />
        <ellipse cx="540" cy="1430" rx="440" ry="200" fill="#9AA6A1" /><ellipse cx="540" cy="1410" rx="400" ry="170" fill="#C7D0CE" />
        {[[320, 1380, -14], [760, 1370, 12], [540, 1480, 0], [400, 1520, 20], [700, 1520, -18]].map(([x, y, r], i) => (
          <Pop key={i} t={t} at={0.15 + i * 0.1} cx={x} cy={y}><g transform={`translate(${x} ${y})`}><Oyster s={0.62} r={r} pearl={i === 2} open={easeOut((t - 0.3 - i * 0.1) / 0.4)} /></g></Pop>))}
        <Pop t={t} at={0.8} cx={540} cy={1340}><circle cx="540" cy="1340" r="70" fill={K.tomato} /><path d="M500 1320 Q520 1300 550 1300" stroke={K.tomatoLt} strokeWidth="10" fill="none" strokeLinecap="round" /></Pop>
      </g>
    </Pop>
    {[[200, 1250, 0], [880, 1260, 1], [930, 1560, 2], [150, 1560, 3]].map(([x, y, ph], i) => <Sparkle key={i} x={x} y={y} t={t} ph={ph} />)}
  </Frame>
);

// ================= tomatoes =================
const Tomato: React.FC<{ s?: number; heart?: boolean; green?: boolean }> = ({ s = 1, heart, green }) => {
  const base = green ? "#8FB44E" : K.tomato, dk = green ? "#6E8F3A" : K.tomatoDk, lt = green ? "#B5D27A" : K.tomatoLt;
  return (
    <g transform={`scale(${s})`}>
      {heart ? <path d="M0 160 C-200 40 -230 -110 -120 -150 C-60 -172 -16 -130 0 -96 C16 -130 60 -172 120 -150 C230 -110 200 40 0 160 Z" fill={base} /> : <ellipse cx="0" cy="0" rx="170" ry="150" fill={base} />}
      {heart ? <path d="M0 160 C120 90 190 0 150 -100 C190 -60 200 40 0 160 Z" fill={dk} /> : <path d="M30 -148 C140 -130 190 -40 160 50 C130 130 40 152 -20 148 C80 120 140 40 120 -50 C110 -100 70 -136 30 -148 Z" fill={dk} />}
      <path d={heart ? "M-150 -80 C-140 -120 -100 -140 -60 -130" : "M-120 -60 C-100 -110 -50 -134 -10 -138"} stroke={lt} strokeWidth="18" fill="none" strokeLinecap="round" />
      {!heart && <circle cx="-70" cy="-30" r="10" fill="#fff" opacity="0.5" />}
      <path d="M0 -140 L-50 -170 L-20 -130 L-70 -120 L-14 -116 L-30 -76 L0 -108 L30 -76 L14 -116 L70 -120 L20 -130 L50 -170 Z" fill={K.olive} transform={heart ? "translate(0 30)" : ""} />
      <rect x="-6" y={heart ? -150 : -180} width="12" height="44" rx="6" fill={K.oliveDk} />
    </g>
  );
};
export const Tomatoes2: React.FC<{ t: number }> = ({ t }) => {
  const sway = Math.sin(t * 1.6) * 3;
  return (
    <Frame bg={K.cream} id="t2" t={t}>
      <Table y={1700} />
      <g transform={`rotate(${sway} 540 820)`}>
        <path d="M540 700 C520 900 560 1060 520 1240 M520 980 C400 1020 360 1080 330 1180 M528 1060 C660 1090 720 1160 760 1270" stroke={K.oliveDk} strokeWidth="16" fill="none" strokeLinecap="round" />
        {[[300, 980, 30], [740, 1030, -40], [450, 880, -20], [600, 800, 25]].map(([x, y, r], i) => <path key={i} d="M0 0 C40 -60 120 -60 160 0 C120 40 40 40 0 0 Z M10 0 L150 0" fill={K.olive} stroke={K.oliveDk} strokeWidth="4" transform={`translate(${x} ${y}) rotate(${r + Math.sin(t * 2 + i) * 6})`} />)}
        {[[330, 1340, 0.95, false, 0.1], [760, 1420, 1.05, false, 0.25], [520, 1540, 0.85, true, 0.4]].map(([x, y, s, gr, at], i) => (
          <g key={i} transform={`translate(${x} ${y - (1 - easeOut((t - (at as number)) / 0.5)) * 500})`} opacity={t > (at as number) ? 1 : 0}><Tomato s={s as number} green={gr as boolean} /></g>))}
      </g>
      {[[200, 1200, 0], [880, 1250, 1.4]].map(([x, y, ph], i) => <Sparkle key={i} x={x} y={y} t={t} ph={ph} c={K.olive} />)}
    </Frame>
  );
};
export const LoveApple2: React.FC<{ t: number }> = ({ t }) => {
  const beat = 1 + 0.07 * Math.max(0, Math.sin(t * 7)) * (Math.sin(t * 3.5) > 0 ? 1 : 0.4);
  return (
    <Frame bg={K.tomato} id="l2" halo={K.tomatoLt} t={t}>
      <Table y={1700} c={K.tomatoDk} dk="#7E1222" lt="#C42A3E" />
      <ellipse cx="540" cy="1690" rx="300" ry="40" fill="#7E1222" />
      <Pop t={t} at={0} cx={540} cy={1330}><g transform={`translate(540 1330) scale(${1.6 * beat})`}><Tomato heart /></g></Pop>
      <g fill={K.cream}>{[...Array(7)].map((_, i) => { const p = ((t * 0.4 + i * 0.14) % 1); return <path key={i} d="M0 18 C-30 0 -30 -20 -14 -24 C-6 -26 -2 -20 0 -16 C2 -20 6 -26 14 -24 C30 -20 30 0 0 18 Z" opacity={0.9 * (1 - p)} transform={`translate(${200 + (i * 113) % 700 + Math.sin(t * 2 + i) * 20} ${1500 - p * 700}) scale(${1.2 + (i % 3) * 0.5})`} />; })}</g>
    </Frame>
  );
};

// ================= the clear glass bottle =================
export const Glass: React.FC<{ fill?: number; t: number; id: string }> = ({ fill = 1, t, id }) => {
  const SH = "M-60 -560 L60 -560 L60 -470 C60 -400 150 -360 150 -260 L150 0 L-150 0 L-150 -260 C-150 -360 -60 -400 -60 -470 Z";
  const glint = ((t * 0.6) % 1.6) - 0.3;
  return (
    <g>
      <clipPath id={id}><path d={SH} /></clipPath>
      <path d={SH} fill="#E9F1F0" opacity="0.3" />
      <g clipPath={`url(#${id})`}>
        <rect x="-160" y={-470 * fill} width="320" height={470 * fill + 10} fill={K.tomato} /><rect x="40" y={-470 * fill} width="120" height={470 * fill + 10} fill={K.tomatoDk} />
        <path d={`M-160 ${-470 * fill} q40 ${-8 + Math.sin(t * 5) * 6} 80 0 q40 ${8 - Math.sin(t * 5) * 6} 80 0 q40 -8 80 0 q40 8 80 0 v20 h-320 Z`} fill={K.tomatoLt} opacity="0.6" />
        {[0, 1, 2].map((i) => { const p = ((t * 0.5 + i * 0.33) % 1); return <circle key={i} cx={-70 + i * 60} cy={-20 - p * 420 * fill} r={6 + i * 2} fill={K.tomatoLt} opacity={fill > 0.3 ? 0.7 * (1 - p) : 0} />; })}
        <rect x={-300 + glint * 600} y="-700" width="70" height="900" fill="#fff" opacity="0.35" transform={`rotate(20 ${-265 + glint * 600} -250)`} />
      </g>
      {[-100, 0, 100].map((fx) => <path key={fx} d={`M${fx} -300 L${fx} -10`} stroke="#fff" strokeOpacity="0.18" strokeWidth="4" />)}
      <path d="M-110 -280 C-120 -200 -118 -100 -110 -30" stroke="#fff" strokeOpacity="0.7" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d={SH} fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="6" />
      <rect x="-110" y="-230" width="220" height="130" rx="10" fill={K.cream} /><rect x="-90" y="-200" width="180" height="16" rx="8" fill={K.olive} /><rect x="-70" y="-160" width="140" height="12" rx="6" fill={K.creamDk} /><rect x="-50" y="-134" width="100" height="10" rx="5" fill={K.creamDk} />
    </g>
  );
};
export const Bottle2: React.FC<{ t: number }> = ({ t }) => {
  const capK = backOut((t - 1.3) / 0.35);
  return (
    <Frame bg={K.charcoal} id="b2" t={t}>
      <Table y={1640} c="#3A3A3A" dk="#242424" lt="#4A4A4A" />
      <ellipse cx="540" cy="1650" rx="300" ry="40" fill="#151515" />
      <Pop t={t} at={0} cx={540} cy={1640} from={120}><g transform="translate(540 1640) scale(1.25)"><Glass fill={clamp(0.15 + t / 1.2)} t={t} id="gl2" />
        {t > 1.3 && <g transform={`translate(0 ${-585 - (1 - clamp(capK)) * 140}) scale(${capK})`}><rect x="-70" y="-26" width="140" height="60" rx="12" fill={K.ink} /><rect x="-70" y="-26" width="40" height="60" rx="10" fill="#4A4A4A" /></g>}</g></Pop>
      {/* pouring stream filling the bottle before the cap goes on */}
      {t < 1.3 && <path d={`M540 300 L540 ${940 - 300 * clamp(t / 1.2)}`} stroke={K.tomato} strokeWidth="26" strokeLinecap="round" opacity={clamp(1.3 - t)} />}
      {[[240, 1200, 0], [850, 1100, 1.2]].map(([x, y, ph], i) => <Sparkle key={i} x={x} y={y} t={t} ph={ph} />)}
    </Frame>
  );
};
export const SplitRight2: React.FC<{ t: number }> = ({ t }) => (
  <Frame bg={K.cream} id="sr2" t={t}><Table y={1660} /><ellipse cx="540" cy="1650" rx="300" ry="40" fill={G.woodDk} opacity="0.5" /><g transform="translate(540 1650) scale(1.1)"><Glass t={t} id="gls" /><g transform="translate(0 -585)"><rect x="-70" y="-26" width="140" height="60" rx="12" fill={K.ink} /></g></g></Frame>
);
export const SplitLeft2: React.FC<{ t: number }> = ({ t }) => (
  <Frame bg={K.tomato} id="sl2" t={t}>
    <Table y={1660} c={K.tomatoDk} dk="#7E1222" lt="#C42A3E" />
    <g transform="translate(540 1500) scale(0.85) translate(-540 -1350)">
      <FishTail x={430} y={720} r={-110 + Math.sin(t * 5) * 7} s={1.05} /><FishHead x={560} y={760} r={-70 + Math.sin(t * 5 + 1) * 7} s={0.95} /><JarShape id="jsl" />
    </g>
  </Frame>
);

// ================= the dip =================
export const Dip2: React.FC<{ t: number }> = ({ t }) => {
  const dipP = Math.sin(clamp(t / 1.3) * Math.PI), dip = dipP * 150, ring = clamp((t - 0.55) / 0.6);
  return (
    <Frame bg={K.olive} id="d2" halo={K.oliveLt} t={t}>
      <Table y={1680} />
      <g transform="translate(540 1450) scale(1.3) translate(-540 -1450)">
        <ellipse cx="540" cy="1560" rx="330" ry="50" fill={G.woodDk} opacity="0.5" />
        <Pop t={t} at={0} cx={540} cy={1450}>
          <path d="M300 1380 L780 1380 L740 1540 L340 1540 Z" fill="#9AA6A1" /><path d="M300 1380 L780 1380 L770 1420 L310 1420 Z" fill="#C7D0CE" />
          <ellipse cx="540" cy="1390" rx="230" ry="40" fill={K.tomatoDk} /><ellipse cx="520" cy="1385" rx="200" ry="32" fill={K.tomato} /><path d="M420 1378 Q470 1366 520 1370" stroke={K.tomatoLt} strokeWidth="10" fill="none" strokeLinecap="round" />
          {ring > 0 && ring < 1 && <ellipse cx="560" cy="1386" rx={40 + ring * 140} ry={8 + ring * 22} fill="none" stroke={K.tomatoLt} strokeWidth="6" opacity={1 - ring} />}
        </Pop>
        <g transform={`translate(560 ${1120 + dip}) rotate(14)`}><rect x={-26} y={-420} width={52} height={420} rx={10} fill={G.gold} /><rect x={8} y={-420} width={18} height={420} rx={6} fill={G.goldDk} /><rect x={-20} y={-410} width={9} height={380} rx={4} fill={G.goldLt} />
          {t > 0.7 && <><rect x={-26} y={-70} width={52} height={70} rx={10} fill={K.tomato} /><path d={`M-6 0 Q0 ${30 + (t * 40 % 40)} 6 0`} fill={K.tomato} /></>}</g>
        {[[200, 1600, -30, 0.1], [880, 1620, 25, 0.2], [760, 1660, -60, 0.3]].map(([x, y, r, at], i) => <Pop key={i} t={t} at={at} cx={x} cy={y}><Fry x={x} y={y} r={r} h={180} /></Pop>)}
      </g>
      {[[230, 1150, 0], [860, 1100, 1.3]].map(([x, y, ph], i) => <Sparkle key={i} x={x} y={y} t={t} ph={ph} />)}
    </Frame>
  );
};

export const ART2: Record<string, React.FC<{ t: number }>> = {
  hook: Hook2, jar: Jar2, junk: Junk2, ship: Ship2, shipNight: (p) => <Ship2 {...p} night />, jarEmpty: JarEmpty2,
  mushrooms: Mushrooms2, walnuts: Walnuts2, oysters: Oysters2, tomatoes: Tomatoes2, loveApple: LoveApple2,
  bottle: Bottle2, dip: Dip2, splitLeft: SplitLeft2, splitRight: SplitRight2,
};
