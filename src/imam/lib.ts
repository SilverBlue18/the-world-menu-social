// Shared math: timing, easing, camera spline, path sampling.
export const FPS = 30;
export const W_OUT = 1080;
export const H_OUT = 1920;
// The point on screen that the camera "looks at": slightly above centre, inside the TikTok/Reels/Shorts safe zone.
export const FOCUS_X = 528;
export const FOCUS_Y = 1090;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t: number) => Math.pow(clamp(t), 3);
export const backOut = (t: number, s = 1.4) => {
  const x = clamp(t) - 1;
  return x * x * ((s + 1) * x + s) + 1;
};
// 0→1 between a and b (seconds), smoothed
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
// window: fades in over [a, a+fi], out over [b-fo, b]
export const win = (t: number, a: number, b: number, fi = 0.35, fo = 0.45) =>
  Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b));

// ---------- camera ----------
export type CamKey = { t: number; x: number; y: number; z: number; r?: number };
export type Cam = { x: number; y: number; z: number; r: number };

// Monotone cubic Hermite (Fritsch–Carlson) per channel: smooth velocity, no overshoot, never a dead stop between keys.
const hermite = (ts: number[], vs: number[], t: number, zeroEnds = false) => {
  const n = ts.length;
  if (t <= ts[0]) return vs[0];
  if (t >= ts[n - 1]) return vs[n - 1];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m: number[] = new Array(n).fill(0);
  m[0] = zeroEnds ? 0 : d[0];
  m[n - 1] = zeroEnds ? 0 : d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * (ts[i + 1] - ts[i]) + (ts[i] - ts[i - 1]);
      const w2 = (ts[i + 1] - ts[i]) + 2 * (ts[i] - ts[i - 1]);
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  let i = 0;
  while (t > ts[i + 1]) i++;
  const h = ts[i + 1] - ts[i];
  const s = (t - ts[i]) / h;
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * vs[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * vs[i + 1] + (s3 - s2) * h * m[i + 1];
};

// smooth monotone time warp: new (voice v4) time -> old (layout) time
// eased spline through (t, v) keys: zero velocity at both ends, smooth everywhere between
export const makeEase = (pairs: number[][]) => {
  const ts = pairs.map((p) => p[0]);
  const vs = pairs.map((p) => p[1]);
  return (t: number) => hermite(ts, vs, t, true);
};

export const makeWarp = (pairs: number[][]) => {
  const ts = pairs.map((p) => p[0]);
  const vs = pairs.map((p) => p[1]);
  return (t: number) => hermite(ts, vs, t);
};

export const makeCamera = (keys: CamKey[]) => {
  const ts = keys.map((k) => k.t);
  const xs = keys.map((k) => k.x);
  const ys = keys.map((k) => k.y);
  const zs = keys.map((k) => Math.log(k.z));
  const rs = keys.map((k) => k.r ?? 0);
  return (t: number): Cam => ({
    x: hermite(ts, xs, t),
    y: hermite(ts, ys, t),
    z: Math.exp(hermite(ts, zs, t)),
    r: hermite(ts, rs, t),
  });
};

// ---------- polylines ----------
export type Pt = [number, number];
// Catmull-Rom smoothing → dense polyline
export const smoothPath = (pts: Pt[], seg = 16): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < seg; j++) {
      const t = j / seg, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
export type Track = { pts: Pt[]; cum: number[]; len: number };
export const track = (pts: Pt[]): Track => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1] };
};
export const at = (tr: Track, u: number): { p: Pt; ang: number } => {
  const L = clamp(u) * tr.len;
  let i = 1;
  while (i < tr.cum.length - 1 && tr.cum[i] < L) i++;
  const a = tr.pts[i - 1], b = tr.pts[i];
  const seg = tr.cum[i] - tr.cum[i - 1] || 1;
  const f = (L - tr.cum[i - 1]) / seg;
  return { p: [lerp(a[0], b[0], f), lerp(a[1], b[1], f)], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
};
export const partial = (tr: Track, u: number): string => {
  const L = clamp(u) * tr.len;
  const out: string[] = [];
  for (let i = 0; i < tr.pts.length; i++) {
    if (tr.cum[i] > L) {
      const { p } = at(tr, u);
      out.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`);
      break;
    }
    out.push(`${tr.pts[i][0].toFixed(1)},${tr.pts[i][1].toFixed(1)}`);
  }
  return out.length > 1 ? "M" + out.join("L") : "";
};

// deterministic noise
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
