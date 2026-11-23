import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { MapShot } from "./Imam";
import { clamp, FPS, ramp, smooth } from "./lib";
import { drop, INK, RED, SEPIA } from "./props";
import { TopCaptions } from "./Short";

export const DESK_S = 75;
const PW = 1600, PH = 2600; // desk plane size (plane coords)

// ---------------- objects on the desk ----------------
const shadow = (lift: number) => `0 ${24 + lift * 50}px ${36 + lift * 60}px rgba(0,0,0,${0.55 - lift * 0.1}), 0 3px 6px rgba(0,0,0,.45)`;

const Drop: React.FC<{ t: number; tIn: number; x: number; y: number; r: number; children: React.ReactNode; z?: number }> = ({ t, tIn, x, y, r, children, z }) => {
  if (t < tIn - 0.02) return null;
  const d = drop(t, tIn, 0.5);
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: z, opacity: d.o, transform: `rotate(${r + d.lift * 6}deg) scale(${d.s})`, transformOrigin: "50% 50%" }}>
      {React.Children.map(children, (c) => (React.isValidElement(c) ? React.cloneElement(c as React.ReactElement<{ lift?: number }>, { lift: d.lift }) : c))}
    </div>
  );
};

const Print: React.FC<{ src: string; w: number; ratio: number; cap?: string; lift?: number; tone?: number; capSize?: number }> = ({ src, w, ratio, cap, lift = 0, tone = 0.35, capSize = 34 }) => (
  <div style={{ width: w, padding: 20, paddingBottom: cap ? 74 : 20, background: "#f1e8d4", boxShadow: shadow(lift), position: "relative" }}>
    <Img src={staticFile(src)} style={{ width: w - 40, height: (w - 40) / ratio, objectFit: "cover", display: "block", filter: `sepia(${tone}) contrast(1.04)` }} />
    <div style={{ position: "absolute", left: 20, top: 20, width: w - 40, height: (w - 40) / ratio, boxShadow: "inset 0 0 50px rgba(40,22,8,.35)" }} />
    {cap && <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", fontFamily: "Special Elite", fontSize: capSize, color: "#2a1c11" }}>{cap}</div>}
  </div>
);

const Paper: React.FC<{ w: number; lift?: number; pad?: number; children: React.ReactNode }> = ({ w, lift = 0, pad = 50, children }) => (
  <div style={{ width: w, padding: pad, background: `url(${staticFile("imam/tex/paper.jpg")}) center/cover`, boxShadow: shadow(lift), textAlign: "center", color: INK }}>{children}</div>
);

// a parchment sheet showing the live animated map
const MapSheet: React.FC<{ frame: number; w: number; h: number; k?: number; lift?: number }> = ({ frame, w, h, k = 1, lift = 0 }) => {
  const s = (w / 900) * k;
  return (
    <div style={{ width: w, height: h, position: "relative", overflow: "hidden", boxShadow: shadow(lift), borderRadius: 4, background: "#d8c49a" }}>
      <div style={{ position: "absolute", left: w / 2 - 540 * s, top: h / 2 - 1090 * s, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        <MapShot frame={frame} clean />
      </div>
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(70,40,10,.55), inset 0 0 6px rgba(70,40,10,.6)" }} />
    </div>
  );
};

const BrassCompass: React.FC<{ size: number; spin: number }> = ({ size, spin }) => (
  <svg width={size} height={size} viewBox="-150 -150 300 300" style={{ filter: "drop-shadow(0 24px 20px rgba(0,0,0,.6))", display: "block" }}>
    <defs><radialGradient id="brass" cx="0.4" cy="0.35"><stop offset="0" stopColor="#f6d892" /><stop offset="0.65" stopColor="#b6873a" /><stop offset="1" stopColor="#5e3d12" /></radialGradient></defs>
    <circle r={142} fill="url(#brass)" />
    <circle r={118} fill="#efe4c8" />
    {Array.from({ length: 32 }).map((_, i) => <line key={i} x1={0} y1={-118} x2={0} y2={i % 4 ? -108 : -96} stroke="#2a1c11" strokeWidth={2} transform={`rotate(${i * 11.25})`} />)}
    {["N", "E", "S", "W"].map((l, i) => <text key={l} x={0} y={-74} textAnchor="middle" fontFamily="Playfair Display" fontWeight={900} fontSize={24} fill="#2a1c11" transform={`rotate(${i * 90})`}>{l}</text>)}
    <g transform={`rotate(${spin})`}>
      <path d="M0 -88 L13 0 L0 88 L-13 0 Z" fill="#2a1c11" /><path d="M0 -88 L13 0 L-13 0 Z" fill="#9e2a1f" />
    </g>
    <circle r={8} fill="#b6873a" />
    <ellipse cx={-40} cy={-50} rx={70} ry={36} fill="rgba(255,255,255,.18)" transform="rotate(-30 -40 -50)" />
  </svg>
);

const PocketWatch: React.FC<{ size: number; t: number }> = ({ size, t }) => (
  <svg width={size} height={size * 1.3} viewBox="-150 -230 300 390" style={{ filter: "drop-shadow(0 24px 20px rgba(0,0,0,.6))", display: "block" }}>
    <defs><radialGradient id="gold" cx="0.4" cy="0.35"><stop offset="0" stopColor="#fbe3a0" /><stop offset="0.6" stopColor="#c99a3e" /><stop offset="1" stopColor="#6e4a14" /></radialGradient></defs>
    <path d="M0 -150 C 40 -180 60 -200 30 -228" stroke="#b8893a" strokeWidth={6} fill="none" />
    <circle cx={0} cy={-158} r={18} fill="none" stroke="url(#gold)" strokeWidth={9} />
    <circle r={140} fill="url(#gold)" />
    <circle r={118} fill="#f5eedd" />
    {Array.from({ length: 60 }).map((_, i) => <line key={i} x1={0} y1={-116} x2={0} y2={i % 5 ? -110 : -100} stroke="#2a1c11" strokeWidth={i % 5 ? 1.5 : 3} transform={`rotate(${i * 6})`} />)}
    {["XII", "III", "VI", "IX"].map((l, i) => <text key={l} x={0} y={-74} textAnchor="middle" fontFamily="Playfair Display" fontWeight={700} fontSize={26} fill="#2a1c11" transform={`rotate(${i * 90}) rotate(${-i * 90} 0 -82)`}>{l}</text>)}
    <line x1={0} y1={6} x2={0} y2={-62} stroke="#2a1c11" strokeWidth={7} strokeLinecap="round" />
    <line x1={0} y1={8} x2={0} y2={-96} stroke="#2a1c11" strokeWidth={4} strokeLinecap="round" transform={`rotate(${Math.sin(t * 0.6) * 1.5})`} />
    <line x1={0} y1={14} x2={0} y2={-100} stroke="#9e2a1f" strokeWidth={1.6} transform={`rotate(${(t * 6) % 360 * 6})`} />
    <circle r={7} fill="#2a1c11" />
    <ellipse cx={-45} cy={-55} rx={70} ry={34} fill="rgba(255,255,255,.22)" transform="rotate(-30 -45 -55)" />
  </svg>
);

// wooden writing board (lawh), as used across West Africa to learn Arabic and the Quran
const Lawh: React.FC<{ w: number; t: number; a: number; b: number; lift?: number }> = ({ w, t, a, b, lift = 0 }) => {
  const h = w * 1.5;
  const wr = ramp(t, a, b);
  const L = (n: number) => clamp(wr * 3 - n);
  return (
    <div style={{ width: w, height: h, position: "relative", filter: "drop-shadow(0 28px 26px rgba(0,0,0,.55))" }}>
      <svg width={w} height={h} viewBox="0 0 400 600" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="lawhwood" x1="0" y1="0" x2="1" y2="0.15">
            <stop offset="0" stopColor="#9a6a3a" /><stop offset="0.45" stopColor="#c08a52" /><stop offset="1" stopColor="#8a5a2e" />
          </linearGradient>
          <radialGradient id="lawhwear" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stopColor="#d9a96c" stopOpacity={0.45} /><stop offset="1" stopColor="#d9a96c" stopOpacity={0} /></radialGradient>
        </defs>
        {/* handle with hole */}
        <path d="M150 64 L156 18 Q200 2 244 18 L250 64 Z" fill="url(#lawhwood)" />
        <circle cx={200} cy={34} r={11} fill="#2a1a0e" />
        {/* board: rounded shoulders, gentle taper */}
        <path d="M40 92 Q40 60 80 60 L320 60 Q360 60 360 92 L368 548 Q368 588 328 588 L72 588 Q32 588 32 548 Z" fill="url(#lawhwood)" />
        <path d="M40 92 Q40 60 80 60 L320 60 Q360 60 360 92 L368 548 Q368 588 328 588 L72 588 Q32 588 32 548 Z" fill="url(#lawhwear)" />
        {Array.from({ length: 18 }).map((_, i) => (
          <path key={i} d={`M${50 + i * 17} 70 Q${56 + i * 17 + Math.sin(i * 1.7) * 8} 330 ${46 + i * 17} 580`} stroke="#7a4b24" strokeWidth={1} opacity={0.28} fill="none" />
        ))}
        <path d="M40 92 Q40 60 80 60 L320 60 Q360 60 360 92 L368 548 Q368 588 328 588 L72 588 Q32 588 32 548 Z" fill="none" stroke="#5e3a1c" strokeWidth={3} opacity={0.6} />
        {/* faint ruled guide lines */}
        {[200, 330, 460].map((y) => <line key={y} x1={70} y1={y} x2={330} y2={y} stroke="#5e3a1c" strokeWidth={1.2} opacity={0.25} />)}
      </svg>
      <div style={{ position: "absolute", left: w * 0.12, right: w * 0.12, top: h * 0.17, textAlign: "center", direction: "rtl", fontFamily: "Amiri", fontWeight: 700, color: "#1a0f08", lineHeight: 1.0 }}>
        {["ا ب ت ث", "ج ح خ د", "بِسْمِ ٱللَّٰهِ"].map((line, i) => (
          <div key={i} style={{ fontSize: i === 2 ? w * 0.13 : w * 0.15, height: h * 0.215, display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap",
            clipPath: `inset(-30% 0 -30% ${100 - L(i) * 100}%)` }}>{line}</div>
        ))}
      </div>
    </div>
  );
};

const BookObj: React.FC<{ w: number; lift?: number }> = ({ w, lift = 0 }) => {
  const h = w * 1.36;
  return (
    <div style={{ width: w, height: h, position: "relative", boxShadow: shadow(lift), borderRadius: w * 0.03 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.03, background: "radial-gradient(ellipse at 40% 35%, #6b3a22 0%, #4a2514 55%, #2b130a 100%)", boxShadow: `inset 0 0 ${w * 0.08}px rgba(0,0,0,.6)` }} />
      <div style={{ position: "absolute", right: -10, top: 10, bottom: 10, width: 14, background: "repeating-linear-gradient(180deg,#e9dcc0 0 3px,#cbb994 3px 5px)", borderRadius: 3 }} />
      <div style={{ position: "absolute", inset: w * 0.08, border: `${w * 0.012}px solid #e9b45a`, borderRadius: w * 0.015, opacity: 0.85 }} />
      <svg viewBox="-100 -100 200 200" style={{ position: "absolute", left: w * 0.25, top: h * 0.18, width: w * 0.5, height: w * 0.5 }}>
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-52} y={-52} width={104} height={104} fill="none" stroke="#e9b45a" strokeWidth={3} transform={`rotate(${i * 11.25})`} />)}
        <circle r={34} fill="none" stroke="#e9b45a" strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.6, textAlign: "center", fontFamily: "Amiri", fontWeight: 700, fontSize: w * 0.24, color: "#e9b45a", direction: "rtl" }}>رحلة</div>
    </div>
  );
};

// ---------------- scenes ----------------
type Cam = [number, number, number, number]; // scale, x, y, rot  (screen-space, around 540,1150)
type Scene = { a: number; b: number; cam: [Cam, Cam]; desk: [number, number]; render: (t: number, frame: number) => React.ReactNode };
const at = (x: number, y: number, r: number, child: React.ReactNode, z?: number) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${r}deg)`, zIndex: z }}>{child}</div>
);

const NameCard: React.FC<{ t: number; lift?: number }> = ({ t, lift = 0 }) => {
  const ar = ramp(t, 17.7, 19.0);
  return (
    <Paper w={820} lift={lift}>
      <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 40, letterSpacing: 12, color: SEPIA }}>IMAM · OTTOMAN NAVY</div>
      <div style={{ height: 3, background: INK, opacity: 0.55, margin: "22px 30px" }} />
      <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 132, direction: "rtl", lineHeight: 1.35, clipPath: `inset(-20% 0 -20% ${100 - ar * 100}%)` }}>عبد الرحمن البغدادي</div>
      <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 56, lineHeight: 1.1, opacity: ramp(t, 17.8, 18.2), whiteSpace: "nowrap" }}>Abdurrahman al‑Baghdadi</div>
    </Paper>
  );
};
const Quote: React.FC<{ t: number; lift?: number; mark?: boolean }> = ({ t, lift = 0, mark }) => (
  <Paper w={800} lift={lift} pad={64}>
    <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 176, lineHeight: 1.02 }}>
      <span style={{ opacity: ramp(t, 38.62, 38.8) }}>“Eu</span><br />
      <span style={{ opacity: ramp(t, 39.0, 39.2) }}>Muslim.”</span>
    </div>
    <div style={{ height: 6, background: RED, margin: "30px auto 0", width: `${ramp(t, 40.4, 41.3) * 70}%`, opacity: 0.85 }} />
    {mark && (
      <svg width={160} height={200} viewBox="0 0 160 200" style={{ position: "absolute", right: -40, top: -60, overflow: "visible" }}>
        <path d="M40 60 Q40 10 85 10 Q130 10 130 55 Q130 90 92 105 Q80 112 80 140" stroke="#7a6a58" strokeWidth={11} fill="none" strokeLinecap="round"
          strokeDasharray={260} strokeDashoffset={260 * (1 - ramp(t, 42.55, 43.1))} />
        <circle cx={80} cy={178} r={9} fill="#7a6a58" opacity={ramp(t, 43.1, 43.2)} />
      </svg>
    )}
  </Paper>
);

const SCENES: Scene[] = [
  { a: 0, b: 3.5, desk: [0, 0], cam: [[1.1, 0, 30, -1.5], [1.2, -10, 10, -1]], render: (t) => (
    <>
      {at(300, 1500, 7, <div style={{ width: 760, height: 520, background: "#d9c59c", boxShadow: shadow(0), opacity: 0.9 }} />)}
      {at(1020, 1580, 0, <BrassCompass size={300} spin={20 + Math.sin(t * 2) * 8} />)}
      {at(400, 760, -4, <Print src="desk/img/storm_sail.jpg" w={800} ratio={1711 / 1800} cap="A ship in a storm · 1869" />)}
    </>) },
  { a: 3.5, b: 7.46, desk: [-120, 60], cam: [[1.0, 0, 0, 0], [1.05, 0, -10, 0.5]], render: (t, f) => (
    <>
      {at(340, 640, -2, <MapSheet frame={f} w={920} h={1180} />)}
      <Drop t={t} tIn={4.75} x={560} y={1480} r={4}><Paper w={600} pad={40}>
        <div style={{ border: `4px double ${INK}`, padding: "26px 12px" }}>
          <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 32, letterSpacing: 14, color: SEPIA }}>A TRUE STORY</div>
          <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 104, lineHeight: 1.0, marginTop: 10 }}>THE LOST</div>
          <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 132, lineHeight: 1.0, color: RED }}>IMAM</div>
        </div>
      </Paper></Drop>
    </>) },
  { a: 7.46, b: 11.28, desk: [140, -40], cam: [[1.02, 0, 0, 1], [1.1, 10, -20, 1.5]], render: (t) => (
    <>
      {at(330, 700, -3, <Print src="desk/img/frigate.jpg" w={860} ratio={1536 / 1307} tone={0.15} />)}
      <Drop t={t} tIn={8.75} x={640} y={1400} r={6}><Print src="desk/img/bosphorus_c.jpg" w={540} ratio={738 / 711} cap="The Bosphorus, Istanbul" capSize={30} /></Drop>
    </>) },
  { a: 11.28, b: 15.04, desk: [60, 120], cam: [[1.0, 0, 0, 0], [0.97, 0, 0, -0.5]], render: (t, f) => (
    <>{at(300, 620, 1, <MapSheet frame={f} w={980} h={1300} />)}</>) },
  { a: 15.04, b: 17.62, desk: [-60, -100], cam: [[1.08, 0, 40, -1], [1.16, 0, 20, -0.6]], render: () => (
    <>
      {at(1060, 1640, 0, <BrassCompass size={280} spin={12} />)}
      {at(330, 760, -2, <Print src="desk/img/frigate.jpg" w={880} ratio={1536 / 1307} tone={0.15} />)}
    </>) },
  { a: 17.62, b: 20.16, desk: [-60, -100], cam: [[1.05, 0, 30, -1], [1.1, 0, 20, -0.8]], render: (t) => (
    <>
      {at(1060, 1640, 0, <BrassCompass size={280} spin={12} />)}
      {at(330, 760, -2, <Print src="desk/img/frigate.jpg" w={880} ratio={1536 / 1307} tone={0.15} />)}
      <Drop t={t} tIn={17.5} x={390} y={980} r={-3}><NameCard t={t} /></Drop>
    </>) },
  { a: 20.16, b: 22.34, desk: [100, 40], cam: [[1.05, 0, 0, 1], [1.1, 0, 0, 1.5]], render: (t, f) => (
    <>{at(320, 680, 2, <MapSheet frame={f} w={960} h={1240} />)}</>) },
  { a: 22.34, b: 23.82, desk: [100, 40], cam: [[1.3, -20, 60, -1], [1.36, -20, 60, -1.5]], render: (t, f) => (
    <>{at(320, 680, 2, <MapSheet frame={f} w={960} h={1240} />)}</>) },
  { a: 23.82, b: 27.3, desk: [-140, 80], cam: [[1.0, 0, 0, 0], [1.06, 0, -10, 0.5]], render: (t, f) => (
    <>
      {at(300, 600, -1, <MapSheet frame={f} w={940} h={1220} />)}
      {at(960, 1500, 0, <BrassCompass size={330} spin={t * 160 + Math.sin(t * 3) * 70} />)}
    </>) },
  { a: 27.3, b: 31.24, desk: [40, -60], cam: [[1.0, 0, 0, 0], [1.05, 0, 0, -0.6]], render: (t, f) => (
    <>
      {at(330, 620, 1, <MapSheet frame={f} w={940} h={1220} />)}
      <Drop t={t} tIn={29.72} x={420} y={1250} r={-4}><Print src="imam/img/rio.jpg" w={820} ratio={1430 / 923} cap="Rio de Janeiro · 1862" /></Drop>
    </>) },
  { a: 31.24, b: 34.96, desk: [40, -60], cam: [[1.08, 0, -60, -0.5], [1.14, -10, -80, -0.3]], render: (t) => (
    <>
      {at(330, 900, -4, <Print src="imam/img/rio.jpg" w={820} ratio={1430 / 923} cap="Rio de Janeiro · 1862" />)}
      <Drop t={t} tIn={33.84} x={660} y={1190} r={6}><Print src="imam/img/pedro2.jpg" w={460} ratio={0.75} cap="Emperor Pedro II · 1865" capSize={28} /></Drop>
    </>) },
  { a: 34.96, b: 38.7, desk: [-100, 20], cam: [[1.02, 0, 0, 1], [1.1, 0, -20, 1.5]], render: () => (
    <>
      {at(1000, 1650, 0, <BrassCompass size={260} spin={40} />)}
      {at(360, 820, 3, <Print src="desk/img/bahia_c.jpg" w={880} ratio={1352 / 1038} tone={0.1} cap="Salvador da Bahia · 1862" />)}
    </>) },
  { a: 38.7, b: 42.34, desk: [-100, 20], cam: [[1.05, 0, 0, -0.5], [1.12, 0, -10, -0.8]], render: (t) => (
    <>
      {at(250, 1500, 9, <Print src="desk/img/bahia_c.jpg" w={560} ratio={1352 / 1038} tone={0.1} />)}
      <Drop t={t} tIn={38.55} x={370} y={860} r={-2}><Quote t={t} /></Drop>
    </>) },
  { a: 42.34, b: 44.22, desk: [-100, 20], cam: [[1.32, -30, 120, -1.5], [1.36, -30, 120, -1.8]], render: (t) => (
    <>
      {at(250, 1500, 9, <Print src="desk/img/bahia_c.jpg" w={560} ratio={1352 / 1038} tone={0.1} />)}
      {at(370, 860, -2, <Quote t={t} mark />)}
    </>) },
  { a: 44.22, b: 48.48, desk: [120, 80], cam: [[1.0, 0, 0, 0.5], [1.07, 0, -10, 1]], render: (t) => (
    <>
      {at(330, 700, -3, <Print src="desk/img/prayer_c.jpg" w={820} ratio={729 / 718} cap="Hagia Sophia, Istanbul" />)}
      <Drop t={t} tIn={44.95} x={960} y={1470} r={8}><PocketWatch size={330} t={t} /></Drop>
      <Drop t={t} tIn={45.75} x={330} y={1640} r={-5}><Paper w={420} pad={26}>
        <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 96, lineHeight: 1.15 }}>الظهر</div>
        <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 30, letterSpacing: 12, color: SEPIA }}>DHUHR · NOON</div>
      </Paper></Drop>
    </>) },
  { a: 48.48, b: 49.64, desk: [-40, -80], cam: [[1.1, 0, 60, -1], [1.14, 0, 60, -1.2]], render: (t) => (
    <>
      <Drop t={t} tIn={48.45} x={430} y={950} r={-2}><Paper w={760} pad={54}>
        <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 176, lineHeight: 1 }}>Malês</div>
        <div style={{ fontFamily: "Special Elite", fontSize: 40, marginTop: 18, color: SEPIA }}>from Yoruba <i>imale</i> — “Muslim”</div>
      </Paper></Drop>
    </>) },
  { a: 49.64, b: 52.96, desk: [80, 100], cam: [[1.0, 0, 0, 0.5], [1.04, 0, 0, 0.8]], render: (t, f) => (
    <>
      {at(320, 600, 1, <MapSheet frame={f} w={960} h={1180} k={0.85} />)}
      <Drop t={t} tIn={50.72} x={500} y={1470} r={5}><Print src="desk/img/valongo.jpg" w={660} ratio={1536 / 1113} tone={0.2} cap="Slave market, Rio · Debret, 1834" capSize={28} /></Drop>
    </>) },
  { a: 52.96, b: 57.62, desk: [80, 100], cam: [[1.08, 0, 0, -0.5], [1.12, 0, -20, -0.8]], render: (t, f) => (
    <>
      {at(320, 600, 1, <MapSheet frame={f} w={960} h={1180} />)}
      <Drop t={t} tIn={55.38} x={430} y={1340} r={-3}><Print src="imam/img/earle_rio.jpg" w={700} ratio={736 / 641} tone={0.15} cap="Rio de Janeiro, c. 1822 · Augustus Earle" capSize={26} /></Drop>
    </>) },
  { a: 57.62, b: 61.24, desk: [-80, 40], cam: [[1.0, 0, 0, 0], [1.05, 0, 0, 0.5]], render: (t, f) => (
    <>{at(320, 620, -1, <MapSheet frame={f} w={960} h={1240} />)}</>) },
  { a: 61.24, b: 65.24, desk: [60, -120], cam: [[1.02, 0, 0, 1], [1.1, 0, -20, 1.4]], render: (t) => (
    <>
      {at(1000, 1450, 22, <div style={{ width: 22, height: 360, background: "linear-gradient(90deg,#6b4a22,#a07a40,#6b4a22)", borderRadius: 6, boxShadow: shadow(0) }} />)}
      {at(500, 600, -3, <Lawh w={560} t={t} a={62.2} b={65.0} />)}
    </>) },
  { a: 65.24, b: 68.58, desk: [100, 60], cam: [[1.0, 0, 0, 0], [0.97, 0, 0, -0.5]], render: (t, f) => (
    <>{at(320, 640, 1, <MapSheet frame={f} w={960} h={1240} k={0.9} />)}</>) },
  { a: 68.58, b: DESK_S, desk: [-40, 40], cam: [[1.0, 0, 0, -1], [1.28, 0, -40, -0.5]], render: (t) => (
    <>
      {at(1060, 1640, 0, <BrassCompass size={260} spin={30} />)}
      {at(230, 1650, -10, <Print src="imam/img/pedro2.jpg" w={360} ratio={0.75} />)}
      <Drop t={t} tIn={68.7} x={520} y={880} r={-4}><BookObj w={600} /></Drop>
    </>) },
];

const XF = 7 / FPS;
const SceneView: React.FC<{ s: Scene; t: number; frame: number }> = ({ s, t, frame }) => {
  const u = clamp((t - s.a) / (s.b - s.a));
  const e = 0.35 * u + 0.65 * smooth(u);
  const c = s.cam[0].map((v, i) => v + (s.cam[1][i] - v) * e);
  return (
    <AbsoluteFill style={{ transform: `translate(${c[1]}px, ${c[2] + 60}px) rotate(${c[3]}deg) scale(${c[0]})`, transformOrigin: "540px 1150px" }}>
      <div style={{ position: "absolute", left: -260, top: -200, width: PW, height: PH, transform: "perspective(2400px) rotateX(20deg)", transformOrigin: "50% 60%" }}>
        <Img src={staticFile("mock/wood.jpg")} style={{ position: "absolute", left: -300 + s.desk[0], top: -300 + s.desk[1], width: PW + 600, height: PH + 600 }} />
        {s.render(t, frame)}
      </div>
    </AbsoluteFill>
  );
};

export const ImamDesk: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const i = SCENES.findIndex((s) => t >= s.a && t < s.b);
  const cur = SCENES[Math.max(0, i)];
  const prev = i > 0 ? SCENES[i - 1] : null;
  const xf = prev ? clamp((t - cur.a) / XF) : 1;
  const flicker = Math.max(...[0.12, 0.42].map((ft) => { const f = (t - ft) * FPS; return f >= 0 && f < 6 ? 1 - f / 6 : 0; }));
  const dim = Math.max(ramp(t, 56.4, 57.3) * (1 - ramp(t, 57.62, 58.2)), 0);
  const fadeIn = ramp(t, 0, 0.5);
  const fadeOut = 1 - ramp(t, DESK_S - 1.4, DESK_S - 0.1);
  return (
    <AbsoluteFill style={{ background: "#120804", overflow: "hidden" }}>
      <Audio src={staticFile("imam/mix.wav")} />
      {prev && xf < 1 && <SceneView s={prev} t={t} frame={frame} />}
      <AbsoluteFill style={{ opacity: xf }}><SceneView s={cur} t={t} frame={frame} /></AbsoluteFill>
      {/* desk lamp light, falloff, caption shade */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 72% 46% at 42% 58%, rgba(255,196,120,.26) 0%, rgba(255,196,120,0) 72%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 62% at 50% 60%, rgba(0,0,0,0) 42%, rgba(10,4,0,.82) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 50% 32% at 50% 58%, rgba(0,0,0,0) 30%, rgba(4,2,0,.92) 100%)", opacity: dim }} />
      <AbsoluteFill style={{ background: "#cfe0ff", opacity: flicker * 0.12, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,0,.9) 0%, rgba(10,4,0,.6) 24%, rgba(10,4,0,0) 37%)" }} />
      <TopCaptions t={t} />
      <AbsoluteFill style={{ opacity: 0.08, mixBlendMode: "overlay" }}>
        <Img src={staticFile(`imam/tex/grain${frame % 12}.png`)} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeIn * fadeOut }} />
    </AbsoluteFill>
  );
};
