import React from "react";
import { Img, staticFile } from "remotion";
import { backOut, clamp, easeOut, hash } from "./lib";

export const INK = "#2a1c11";
export const SEPIA = "#6b4a2b";
export const RED = "#9e2a1f";
export const GOLD = "#e9b45a";
export const PAPER = "#efe5cf";

// ---------- steam corvette, side view, ink on parchment ----------
// Drawn in a 220x160 box; waterline at y=120. Smoke puffs animate with t.
export const Ship: React.FC<{ t: number; size?: number; rock?: number; seed?: number; opacity?: number; steam?: boolean }> = ({
  t, size = 140, rock = 3, seed = 0, opacity = 1, steam = true,
}) => {
  const ang = Math.sin(t * 1.7 + seed) * rock + Math.sin(t * 3.1 + seed * 2) * rock * 0.35;
  const bob = Math.sin(t * 2.2 + seed) * 2;
  return (
    <svg viewBox="0 0 220 160" width={size} height={(size * 160) / 220} style={{ overflow: "visible", opacity }}>
      <g transform={`translate(0 ${bob}) rotate(${ang} 110 120)`}>
        {/* smoke */}
        {steam && [0, 1, 2, 3].map((i) => {
          const ph = (t * 0.6 + i * 0.25 + seed * 0.1) % 1;
          return (
            <circle key={i} cx={124 - ph * 70} cy={44 - ph * 34} r={6 + ph * 14} fill={SEPIA}
              opacity={(1 - ph) * 0.35} />
          );
        })}
        {/* masts */}
        <line x1={62} y1={118} x2={62} y2={18} stroke={INK} strokeWidth={3} />
        <line x1={102} y1={118} x2={102} y2={10} stroke={INK} strokeWidth={3} />
        <line x1={150} y1={118} x2={150} y2={22} stroke={INK} strokeWidth={3} />
        {/* furled-ish sails */}
        {[[62, 28, 40], [102, 20, 46], [150, 32, 38]].map(([x, y, w], i) => (
          <g key={i}>
            <path d={`M${x - w / 2} ${y} Q${x} ${y + 6} ${x + w / 2} ${y} L${x + w / 2 - 4} ${y + 30} Q${x} ${y + 38} ${x - w / 2 + 4} ${y + 30} Z`}
              fill="#e8dcc0" stroke={INK} strokeWidth={2.2} />
            <path d={`M${x - w / 2 + 4} ${y + 40} Q${x} ${y + 46} ${x + w / 2 - 4} ${y + 40} L${x + w / 2 - 7} ${y + 66} Q${x} ${y + 72} ${x - w / 2 + 7} ${y + 66} Z`}
              fill="#e8dcc0" stroke={INK} strokeWidth={2.2} />
          </g>
        ))}
        {/* rigging */}
        <path d="M18 112 L62 18 M62 18 L102 10 M102 10 L150 22 M150 22 L204 108" stroke={INK} strokeWidth={1.2} fill="none" opacity={0.8} />
        {/* funnel */}
        {steam && <rect x={116} y={58} width={13} height={56} fill={INK} />}
        {/* hull */}
        <path d="M10 104 L210 100 L196 130 Q110 140 26 130 Z" fill={INK} />
        <path d="M22 112 L200 109" stroke="#d9c8a2" strokeWidth={3} strokeDasharray="7 6" />
        {/* water strokes */}
        <path d="M-8 134 q12 -6 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" stroke={SEPIA} strokeWidth={2.4} fill="none" opacity={0.7} />
      </g>
    </svg>
  );
};

// ---------- glowing pin ----------
export const Pin: React.FC<{ t: number; on: number; pulse?: number; size?: number }> = ({ t, on, pulse = 0, size = 26 }) => {
  if (on <= 0.001) return null;
  const ring = (t * 0.8) % 1;
  return (
    <svg width={size * 8} height={size * 8} viewBox="-100 -100 200 200"
      style={{ position: "absolute", left: -size * 4, top: -size * 4, overflow: "visible", opacity: on }}>
      <defs>
        <radialGradient id="pinGlow">
          <stop offset="0" stopColor="#fff3cf" stopOpacity={1} />
          <stop offset="0.25" stopColor={GOLD} stopOpacity={0.9} />
          <stop offset="1" stopColor={GOLD} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={70 + pulse * 25} fill="url(#pinGlow)" opacity={0.55 + pulse * 0.35} />
      <circle r={12 + ring * 60} fill="none" stroke={GOLD} strokeWidth={3} opacity={(1 - ring) * 0.7} />
      <circle r={13} fill="#fff6dc" stroke={INK} strokeWidth={4} />
    </svg>
  );
};

// ---------- paper card with drop-in physics ----------
export const drop = (t: number, tIn: number, dur = 0.55) => {
  const u = clamp((t - tIn) / dur);
  return { u, s: 1 + (1 - backOut(u, 1.2)) * 0.22, o: clamp(u * 3), lift: 1 - easeOut(u) };
};

export const Card: React.FC<{
  t: number; tIn: number; x: number; y: number; w: number; rot?: number; bg?: "paper" | "white" | "none";
  children: React.ReactNode; pad?: number; alpha?: number;
}> = ({ t, tIn, x, y, w, rot = 0, bg = "paper", children, pad = 44, alpha = 1 }) => {
  if (t < tIn - 0.05) return null;
  const d = drop(t, tIn);
  const shadow = 10 + d.lift * 60;
  return (
    <div style={{
      position: "absolute", left: x - w / 2, top: y, width: w,
      transform: `translate(0, -50%) rotate(${rot + d.lift * 7}deg) scale(${d.s})`,
      transformOrigin: "50% 50%", opacity: d.o * alpha,
    }}>
      <div style={{
        position: "relative", padding: bg === "none" ? 0 : pad,
        background: bg === "none" ? "transparent" : `url(${staticFile("imam/tex/paper.jpg")}) center/cover`,
        boxShadow: bg === "none" ? "none" : `0 ${shadow * 0.6}px ${shadow * 1.4}px rgba(25,14,4,${0.45 + d.lift * 0.15}), 0 2px 4px rgba(25,14,4,.35)`,
      }}>
        {children}
      </div>
    </div>
  );
};

export const Photo: React.FC<{ src: string; ratio: number; caption?: string; fs?: number; tone?: number }> = ({
  src, ratio, caption, fs = 40, tone = 0.55,
}) => (
  <div>
    <div style={{ position: "relative", width: "100%", paddingBottom: `${100 / ratio}%`, overflow: "hidden", background: "#222" }}>
      <Img src={staticFile(src)} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        filter: `sepia(${tone}) contrast(1.06) brightness(0.97)`,
      }} />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(40,22,8,.45)" }} />
    </div>
    {caption && (
      <div style={{ fontFamily: "Special Elite", fontSize: fs, color: INK, marginTop: 22, textAlign: "center", lineHeight: 1.15 }}>
        {caption}
      </div>
    )}
  </div>
);

// ---------- rubber stamp ----------
export const Stamp: React.FC<{ t: number; tIn: number; text: string; sub?: string; fs?: number; rot?: number; color?: string }> = ({
  t, tIn, text, sub, fs = 120, rot = -9, color = RED,
}) => {
  if (t < tIn) return null;
  const u = clamp((t - tIn) / 0.16);
  const s = 1 + (1 - u) * 1.3;
  const o = clamp(u * 2) * 0.92;
  return (
    <div style={{
      transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: o, position: "absolute",
      border: `${fs * 0.07}px solid ${color}`, padding: `${fs * 0.12}px ${fs * 0.3}px`, color, textAlign: "center",
      fontFamily: "Oswald", fontWeight: 700, letterSpacing: fs * 0.04, whiteSpace: "nowrap", mixBlendMode: "multiply",
      boxShadow: `inset 0 0 0 ${fs * 0.03}px ${color}`, lineHeight: 1,
    }}>
      <div style={{ fontSize: fs }}>{text}</div>
      {sub && <div style={{ fontSize: fs * 0.32, marginTop: fs * 0.1, letterSpacing: fs * 0.03 }}>{sub}</div>}
    </div>
  );
};

// ---------- compass rose ----------
export const Compass: React.FC<{ spin: number; size: number }> = ({ spin, size }) => (
  <svg viewBox="-110 -110 220 220" width={size} height={size} style={{ overflow: "visible" }}>
    <circle r={100} fill="none" stroke={INK} strokeWidth={3} />
    <circle r={92} fill="none" stroke={INK} strokeWidth={1.2} />
    {Array.from({ length: 64 }).map((_, i) => {
      const a = (i / 64) * Math.PI * 2;
      const l = i % 8 === 0 ? 14 : i % 4 === 0 ? 9 : 5;
      return <line key={i} x1={Math.cos(a) * 92} y1={Math.sin(a) * 92} x2={Math.cos(a) * (92 - l)} y2={Math.sin(a) * (92 - l)} stroke={INK} strokeWidth={1.4} />;
    })}
    <g transform={`rotate(${spin})`}>
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 -84 L13 -13 L0 0 Z" fill={a === 0 ? RED : INK} />
          <path d="M0 -84 L-13 -13 L0 0 Z" fill={a === 0 ? "#c9564a" : "#7b6040"} />
        </g>
      ))}
      {[45, 135, 225, 315].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 -55 L8 -8 L0 0 Z" fill={INK} />
          <path d="M0 -55 L-8 -8 L0 0 Z" fill="#9c845f" />
        </g>
      ))}
    </g>
    <circle r={7} fill={PAPER} stroke={INK} strokeWidth={3} />
  </svg>
);

// ---------- praying figures (ink silhouettes in robes) ----------
// bow: 0 standing → 1 bowing (ruku)
export const Figure: React.FC<{ x: number; base: number; h: number; bow: number; face?: 1 | -1; cap?: boolean }> = ({ x, base, h, bow, face = 1, cap }) => {
  const hipY = base - h * 0.46;
  const a = (bow * 82 * Math.PI) / 180;
  const dx = Math.sin(a) * face, dy = -Math.cos(a);
  const torso = h * 0.34;
  const sh = [x + dx * torso, hipY + dy * torso];
  const head = [sh[0] + dx * h * 0.21, sh[1] + dy * h * 0.21];
  const knee = [x + face * h * 0.05, base - h * 0.24];
  const hand = bow > 0.5 ? knee : [sh[0] + face * h * 0.02 * (1 - bow), sh[1] + h * 0.3 * (1 - bow) + bow * h * 0.12];
  return (
    <g fill={INK} stroke={INK} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x - h * 0.12} ${base} L${x + h * 0.12} ${base} L${x + h * 0.075} ${hipY} L${x - h * 0.075} ${hipY} Z`} strokeWidth={h * 0.03} />
      <line x1={x} y1={hipY + h * 0.03} x2={sh[0]} y2={sh[1]} strokeWidth={h * 0.14} />
      <line x1={sh[0]} y1={sh[1]} x2={hand[0]} y2={hand[1]} strokeWidth={h * 0.07} />
      <circle cx={head[0]} cy={head[1]} r={h * 0.1} stroke="none" />
      {cap && <path d={`M${head[0] - h * 0.1} ${head[1] - h * 0.03} Q${head[0]} ${head[1] - h * 0.2} ${head[0] + h * 0.1} ${head[1] - h * 0.03} Z`} transform={`rotate(${(a * 180) / Math.PI * face} ${head[0]} ${head[1]})`} stroke="none" fill={RED} />}
    </g>
  );
};

// ---------- leather book ----------
export const Book: React.FC<{ w: number }> = ({ w }) => {
  const h = w * 1.36;
  return (
    <div style={{ width: w, height: h, position: "relative", transform: "perspective(1800px) rotateX(18deg)", transformOrigin: "50% 60%" }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: w * 0.03,
        background: "radial-gradient(ellipse at 40% 35%, #6b3a22 0%, #4a2514 55%, #2b130a 100%)",
        boxShadow: `0 ${w * 0.08}px ${w * 0.16}px rgba(20,10,3,.65), inset 0 0 ${w * 0.08}px rgba(0,0,0,.6)`,
      }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: w * 0.06, background: "linear-gradient(90deg,#24100a,#5a2e1a,#24100a)", borderRadius: `${w * 0.03}px 0 0 ${w * 0.03}px` }} />
      <div style={{ position: "absolute", inset: w * 0.09, border: `${w * 0.012}px solid ${GOLD}`, opacity: 0.85, borderRadius: w * 0.015 }} />
      <div style={{ position: "absolute", inset: w * 0.125, border: `${w * 0.005}px solid ${GOLD}`, opacity: 0.7 }} />
      <svg viewBox="-100 -100 200 200" style={{ position: "absolute", left: w * 0.22, top: h * 0.2, width: w * 0.56, height: w * 0.56 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={-52} y={-52} width={104} height={104} fill="none" stroke={GOLD} strokeWidth={3} transform={`rotate(${i * 11.25})`} opacity={0.9} />
        ))}
        <circle r={34} fill="none" stroke={GOLD} strokeWidth={3} />
      </svg>
      <div style={{
        position: "absolute", left: 0, right: 0, top: h * 0.62, textAlign: "center", direction: "rtl",
        fontFamily: "Amiri", fontWeight: 700, fontSize: w * 0.26, color: GOLD, textShadow: "0 2px 0 rgba(0,0,0,.5)",
      }}>
        رحلة
      </div>
    </div>
  );
};

export const jitter = (seed: number, amp: number) => (hash(seed) - 0.5) * amp;
