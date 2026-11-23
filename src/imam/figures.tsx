import React from "react";

// Shared palette for the illustrated scenes (dark plum/navy with warm gold light, like the reference short)
export const NIGHT = { ink: "#07040b", ink2: "#130b1c", plum: "#2a1838", navy: "#0d1426", gold: "#f2bf5e", warm: "#ffcf8a", cream: "#f3e6c8" };

export type Pose = "stand" | "walk" | "bow" | "point" | "sit" | "shrug";
// Elegant robed silhouette with warm rim light. (x, base) = feet. h = standing height.
export const Person: React.FC<{
  x: number; base: number; h: number; pose?: Pose; face?: 1 | -1; cap?: "turban" | "kufi" | "fez" | "none"; robe?: string; light?: 1 | -1;
  phase?: number; bow?: number; id: string; glow?: number;
}> = ({ x, base, h, pose = "stand", face = 1, cap = "none", robe = NIGHT.ink, light = 1, phase = 0, bow = 0, id, glow = 1 }) => {
  const f = face;
  const light2 = robe === NIGHT.ink ? "#3a2a3a" : "#e9dfca";
  const headR = h * 0.062;
  const bob = pose === "walk" ? Math.abs(Math.sin(phase * Math.PI)) * h * 0.01 : 0;
  const sway = pose === "walk" ? Math.sin(phase * Math.PI * 2) * h * 0.018 : 0;
  let body = "", arm = "", head: [number, number] = [x, 0], extra: React.ReactNode = null, tilt = 0;
  if (pose === "sit") {
    // kneeling, seen from behind/side: wide base, tapered back, rounded shoulders
    const by = base, sy = base - h * 0.4;
    body = `M${x - h * 0.22} ${by} Q${x - h * 0.24} ${by - h * 0.08} ${x - h * 0.14} ${by - h * 0.12}
      Q${x - h * 0.15} ${sy + h * 0.1} ${x - h * 0.11} ${sy + h * 0.02} Q${x} ${sy - h * 0.04} ${x + h * 0.11} ${sy + h * 0.02}
      Q${x + h * 0.15} ${sy + h * 0.1} ${x + h * 0.14} ${by - h * 0.12} Q${x + h * 0.24} ${by - h * 0.08} ${x + h * 0.22} ${by} Z`;
    head = [x, sy - h * 0.06];
  } else if (pose === "bow") {
    const a = (bow * 78 * Math.PI) / 180;
    const hipY = base - h * 0.48;
    // skirt/legs
    const skirt = `M${x - h * 0.11} ${base} Q${x - h * 0.085} ${hipY + h * 0.22} ${x - h * 0.075} ${hipY} Q${x} ${hipY - h * 0.03} ${x + h * 0.075} ${hipY} Q${x + h * 0.085} ${hipY + h * 0.22} ${x + h * 0.11} ${base} Z`;
    // torso: rounded capsule from hip, rotated by a
    const L = h * 0.3, w = h * 0.078;
    const tor = `M${-w} 0 L${-w * 0.95} ${-L + w} Q${-w} ${-L - w * 0.2} 0 ${-L - w * 0.25} Q${w} ${-L - w * 0.2} ${w * 0.95} ${-L + w} L${w} 0 Z`;
    const deg = (a * 180) / Math.PI * f;
    body = skirt;
    extra = <path d={tor} transform={`translate(${x} ${hipY + h * 0.02}) rotate(${deg})`} fill={`url(#lit-${id})`} />;
    const sx = x + Math.sin(a) * L * f, sy = hipY + h * 0.02 - Math.cos(a) * L;
    head = [sx + Math.sin(a) * h * 0.055 * f, sy - Math.cos(a) * h * 0.055];
    tilt = deg;
    const sh: [number, number] = [x + Math.sin(a) * L * 0.85 * f, hipY - Math.cos(a) * L * 0.85];
    const knee: [number, number] = [x + h * 0.04 * f, base - h * 0.25];
    arm = `M${sh[0]} ${sh[1]} Q${(sh[0] + knee[0]) / 2 + h * 0.03 * f} ${(sh[1] + knee[1]) / 2} ${knee[0]} ${knee[1]}`;
  } else {
    const sy = base - h * 0.8 - bob;
    const sw = h * 0.115, hw = h * 0.175;
    body = `M${x - hw + sway} ${base} Q${x - hw * 0.92} ${base - h * 0.4} ${x - sw * 1.02} ${sy + h * 0.07}
      Q${x - sw * 0.95} ${sy - h * 0.005} ${x - sw * 0.35} ${sy - h * 0.012} L${x + sw * 0.35} ${sy - h * 0.012}
      Q${x + sw * 0.95} ${sy - h * 0.005} ${x + sw * 1.02} ${sy + h * 0.07} Q${x + hw * 0.92} ${base - h * 0.4} ${x + hw + sway} ${base}
      Q${x + sway * 0.5} ${base + h * 0.015} ${x - hw + sway} ${base} Z`;
    head = [x + f * h * 0.004, sy - h * 0.072];
    const sh: [number, number] = [x + f * sw * 0.8, sy + h * 0.04];
    let hand: [number, number], el: [number, number];
    if (pose === "point") { hand = [x + f * h * 0.36, sy + h * 0.03]; el = [x + f * h * 0.2, sy + h * 0.1]; }
    else if (pose === "shrug") { hand = [x + f * h * 0.2, sy + h * 0.12]; el = [x + f * h * 0.2, sy + h * 0.26]; }
    else if (pose === "walk") { hand = [x + f * sw * 0.9 + Math.sin(phase * Math.PI * 2) * h * 0.06, sy + h * 0.36]; el = [x + f * sw * 1.15, sy + h * 0.2]; }
    else { hand = [x + f * sw * 0.95, sy + h * 0.38]; el = [x + f * sw * 1.2, sy + h * 0.2]; }
    arm = `M${sh[0]} ${sh[1]} Q${el[0]} ${el[1]} ${hand[0]} ${hand[1]}`;
    // jubba edge / fold lines for detail
    extra = (
      <g opacity={0.55}>
        <path d={`M${x + f * sw * 0.15} ${sy + h * 0.02} Q${x + f * sw * 0.3} ${base - h * 0.4} ${x + f * hw * 0.35 + sway} ${base - h * 0.01}`} stroke={light2} strokeWidth={h * 0.004} fill="none" opacity={0.5} />
        <path d={`M${x - sw * 0.9} ${base - h * 0.5} L${x + sw * 0.9} ${base - h * 0.5}`} stroke={light2} strokeWidth={h * 0.006} opacity={0.35} />
      </g>
    );
    if (pose === "point" || pose === "shrug") extra = <>{extra}<circle cx={hand[0]} cy={hand[1]} r={h * 0.018} fill="#2a1a12" /></>;
  }
  const hx = head[0], hy = head[1];
  return (
    <g>
      <defs>
        <linearGradient id={`lit-${id}`} x1={light > 0 ? "0" : "1"} y1="0" x2={light > 0 ? "1" : "0"} y2="0">
          <stop offset="0" stopColor={robe} />
          <stop offset="0.8" stopColor={robe} />
          <stop offset="1" stopColor={NIGHT.warm} stopOpacity={0.5 * glow} />
        </linearGradient>
        <radialGradient id={`halo-${id}`}>
          <stop offset="0" stopColor={NIGHT.warm} stopOpacity={0.22 * glow} />
          <stop offset="1" stopColor={NIGHT.warm} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={base - h * 0.45} rx={h * 0.45} ry={h * 0.6} fill={`url(#halo-${id})`} />
      <ellipse cx={x} cy={base + h * 0.008} rx={h * 0.22} ry={h * 0.022} fill="#000" opacity={0.45} />
      <path d={body} fill={`url(#lit-${id})`} />
      {extra}
      <path d={arm} stroke={`url(#lit-${id})`} strokeWidth={h * 0.072} strokeLinecap="round" fill="none" />
      <g transform={`rotate(${tilt} ${hx} ${hy})`}>
        <ellipse cx={hx} cy={hy} rx={headR * 0.92} ry={headR} fill={NIGHT.ink2} />
        <path d={`M${hx + light * headR * 0.15} ${hy - headR * 0.97} A${headR * 0.92} ${headR} 0 0 ${light > 0 ? 1 : 0} ${hx + light * headR * 0.15} ${hy + headR * 0.97}`}
          stroke={NIGHT.warm} strokeOpacity={0.5 * glow} strokeWidth={h * 0.006} fill="none" />
        {cap === "turban" && (
          <g>
            <path d={`M${hx - headR * 1.2} ${hy - headR * 0.35} Q${hx - headR * 1.35} ${hy - headR * 1.45} ${hx} ${hy - headR * 1.55} Q${hx + headR * 1.35} ${hy - headR * 1.45} ${hx + headR * 1.2} ${hy - headR * 0.35} Q${hx} ${hy - headR * 0.1} ${hx - headR * 1.2} ${hy - headR * 0.35} Z`} fill="#ebdfc6" />
            <path d={`M${hx - headR * 1.1} ${hy - headR * 0.7} Q${hx} ${hy - headR * 0.35} ${hx + headR * 1.15} ${hy - headR * 1.05}`} stroke="#bba886" strokeWidth={h * 0.005} fill="none" />
            <path d={`M${hx - headR * 1.0} ${hy - headR * 1.05} Q${hx} ${hy - headR * 0.75} ${hx + headR * 1.0} ${hy - headR * 1.35}`} stroke="#bba886" strokeWidth={h * 0.004} fill="none" />
            <ellipse cx={hx} cy={hy - headR * 1.6} rx={headR * 0.38} ry={headR * 0.22} fill="#9e2a1f" />
          </g>
        )}
        {cap === "kufi" && <path d={`M${hx - headR * 0.95} ${hy - headR * 0.25} Q${hx} ${hy - headR * 1.6} ${hx + headR * 0.95} ${hy - headR * 0.25} Q${hx} ${hy - headR * 0.4} ${hx - headR * 0.95} ${hy - headR * 0.25} Z`} fill="#efe6d2" />}
        {cap === "fez" && <path d={`M${hx - headR * 0.8} ${hy - headR * 0.4} L${hx - headR * 0.6} ${hy - headR * 1.7} L${hx + headR * 0.6} ${hy - headR * 1.7} L${hx + headR * 0.8} ${hy - headR * 0.4} Z`} fill="#9e2a1f" />}
      </g>
    </g>
  );
};

// layered animated sea
export const Sea: React.FC<{ t: number; y: number; w?: number; colors: string[]; amp?: number; speed?: number }> = ({ t, y, w = 1300, colors, amp = 18, speed = 1 }) => (
  <g>
    {colors.map((c, i) => {
      const yy = y + i * 70;
      const A = amp * (1 + i * 0.35);
      const pts: string[] = [];
      for (let x = -120; x <= w; x += 30) {
        const v = Math.sin(x * 0.012 + t * speed * (1.2 + i * 0.3) + i) * A + Math.sin(x * 0.031 - t * speed * 1.7 + i * 2) * A * 0.35;
        pts.push(`${x},${(yy + v).toFixed(1)}`);
      }
      return <path key={i} d={`M-120 2400 L${pts.join(" L")} L${w} 2400 Z`} fill={c} />;
    })}
  </g>
);

// side-view steamship silhouette (bigger, for illustrated scenes)
export const ShipSil: React.FC<{ x: number; y: number; s: number; t: number; rock?: number; lantern?: boolean; color?: string; seed?: number }> = ({ x, y, s, t, rock = 3, lantern = true, color = NIGHT.ink, seed = 0 }) => {
  const ang = Math.sin(t * 1.3 + seed) * rock;
  const bob = Math.sin(t * 1.9 + seed) * 6 * s;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${ang}) scale(${s})`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const ph = (t * 0.35 + i * 0.2 + seed * 0.13) % 1;
        return <circle key={i} cx={20 - ph * 160} cy={-150 - ph * 70} r={14 + ph * 34} fill="#2a2530" opacity={(1 - ph) * 0.5} />;
      })}
      <line x1={-120} y1={-10} x2={-120} y2={-250} stroke={color} strokeWidth={7} />
      <line x1={-20} y1={-10} x2={-20} y2={-280} stroke={color} strokeWidth={7} />
      <line x1={100} y1={-10} x2={100} y2={-235} stroke={color} strokeWidth={7} />
      {[-120, -20, 100].map((mx, i) => (
        <g key={i}>
          <line x1={mx - 55} y1={-215 + i * 4} x2={mx + 55} y2={-215 + i * 4} stroke={color} strokeWidth={5} />
          <line x1={mx - 45} y1={-150 + i * 4} x2={mx + 45} y2={-150 + i * 4} stroke={color} strokeWidth={5} />
        </g>
      ))}
      <path d="M-200 -5 L-120 -250 L-20 -280 L100 -235 L210 -10" stroke={color} strokeWidth={2.5} fill="none" opacity={0.8} />
      <rect x={8} y={-120} width={30} height={115} fill={color} />
      <path d="M-230 -20 L230 -28 L200 40 Q0 62 -200 40 Z" fill={color} />
      {lantern && (
        <g>
          <circle cx={150} cy={-40} r={60} fill="url(#lanternGlow)" />
          <circle cx={150} cy={-40} r={7} fill="#ffe3a8" />
        </g>
      )}
      {[...Array(7)].map((_, i) => <rect key={i} x={-170 + i * 50} y={2} width={14} height={9} fill="#ffcf8a" opacity={0.55} />)}
    </g>
  );
};

export const SharedDefs: React.FC = () => (
  <defs>
    <radialGradient id="lanternGlow">
      <stop offset="0" stopColor="#ffd890" stopOpacity={0.9} />
      <stop offset="1" stopColor="#ffd890" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="sunGlow">
      <stop offset="0" stopColor="#fff2cf" stopOpacity={1} />
      <stop offset="0.25" stopColor="#ffd38a" stopOpacity={0.8} />
      <stop offset="1" stopColor="#ff9d5a" stopOpacity={0} />
    </radialGradient>
  </defs>
);

// dust / ember particles drifting up through light
export const Motes: React.FC<{ t: number; n?: number; seed?: number; color?: string; area?: [number, number, number, number] }> = ({ t, n = 40, seed = 1, color = "#ffd890", area = [0, 500, 1080, 1500] }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const r1 = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
      const h1 = r1 - Math.floor(r1);
      const r2 = Math.sin(i * 93.989 + seed * 47.11) * 24634.6345;
      const h2 = r2 - Math.floor(r2);
      const x = area[0] + h1 * area[2] + Math.sin(t * 0.6 + i) * 14;
      const y = area[1] + ((h2 * area[3] - t * (14 + h1 * 18)) % area[3] + area[3]) % area[3];
      return <circle key={i} cx={x} cy={y} r={1.5 + h2 * 2.5} fill={color} opacity={0.18 + h1 * 0.35} />;
    })}
  </g>
);
