// The World Menu: shared look for every short (Sahel palette, BRAND.md). Captions, hero cards, stamps, pins, title and end cards, grade.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { backOut, clamp, easeOut, ramp } from "../imam/lib";

export const C = { sea: "#12474F", land: "#E6C79C", coast: "#7A4E2A", red: "#C0392B", night: "#0A2E33", cream: "#F7EBD3", mustard: "#F2B134" };

// ---------- captions: French on top (spoken word in mustard), English below ----------
export type TwmCap = { start: number; end: number; en: string; tag?: string; words: { t: string; s: number; e: number }[] };
export const TwmCaptions: React.FC<{ t: number; caps: TwmCap[]; showFrom?: number }> = ({ t, caps, showFrom = 0 }) => {
  const i = caps.findIndex((x, k) => {
    const next = caps[k + 1]?.start ?? Infinity;
    const until = Math.min(next - 0.08, x.end + 0.9);
    return t >= x.start - 0.05 && t < until;
  });
  if (i < 0) return null;
  const c = caps[i];
  const until = Math.min((caps[i + 1]?.start ?? Infinity) - 0.08, c.end + 0.9);
  const fin = clamp((t - (c.start - 0.05)) / 0.18);
  const fout = 1 - clamp((t - (until - 0.12)) / 0.12);
  const o = Math.min(fin, fout) * ramp(t, showFrom, showFrom + 0.3);
  if (o <= 0.001) return null;
  const chars = c.words.map((w) => w.t).join(" ").length;
  const fs = chars > 95 ? 50 : chars > 72 ? 54 : 58;
  return (
    <>
      <div style={{ position: "absolute", left: -80, right: -80, top: 140, height: 640, opacity: o,
        background: "radial-gradient(ellipse 58% 46% at 50% 50%, rgba(0,0,0,.5), rgba(0,0,0,.3) 55%, rgba(0,0,0,0) 100%)" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 250, textAlign: "center", opacity: o, transform: `translateY(${(1 - fin) * 10}px)` }}>
        <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: fs, lineHeight: 1.18, color: C.cream, letterSpacing: -0.3, textShadow: "0 2px 8px rgba(0,0,0,.75)" }}>
          {c.words.map((w, k) => {
            const next = c.words[k + 1]?.s ?? c.end;
            const end = next - w.e < 0.3 ? next - 0.02 : w.e + 0.12;
            const active = t >= w.s - 0.04 && t < end;
            return (
              <span key={k} style={active ? { color: C.mustard, textShadow: "0 0 18px rgba(242,177,52,.55), 0 2px 6px rgba(0,0,0,.7)" } : undefined}>
                {w.t}{k < c.words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 36, lineHeight: 1.3, color: C.land, opacity: 0.88, marginTop: 20, textShadow: "0 2px 6px rgba(0,0,0,.7)" }}>{c.en}</div>
        {c.tag && (
          <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 30, letterSpacing: 6, color: C.mustard, marginTop: 24, textShadow: "0 2px 8px rgba(0,0,0,.9)",
            opacity: ramp(t, c.start + 0.25, c.start + 0.6) }}>{c.tag}</div>
        )}
      </div>
    </>
  );
};

// ---------- hero card: a public-domain print on a cream card, dropped on the map ----------
export const HeroCard: React.FC<{
  t: number; tIn: number; tOut: number; x: number; y: number; w: number; rot?: number;
  src: string; ratio: number; caption: string; sub?: string; children?: React.ReactNode; tone?: number;
}> = ({ t, tIn, tOut, x, y, w, rot = 0, src, ratio, caption, sub, children, tone = 0.12 }) => {
  if (t < tIn - 0.02 || t > tOut + 0.5) return null;
  const u = clamp((t - tIn) / 0.55);
  const s = 1 + (1 - backOut(u, 1.2)) * 0.22;
  const lift = 1 - easeOut(u);
  const out = ramp(t, tOut, tOut + 0.45);
  const o = clamp(u * 3) * (1 - out);
  const shadow = 26 + lift * 40;
  const drift = Math.sin(t * 0.6 + x) * 3;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, opacity: o,
      transform: `translate(0, calc(-50% + ${drift - out * 30}px)) rotate(${rot + lift * 7}deg) scale(${s * (1 - out * 0.04)})` }}>
      <div style={{ background: C.cream, padding: "18px 18px 22px", borderRadius: 6, position: "relative",
        boxShadow: `0 ${shadow}px ${shadow * 2.2}px rgba(0,0,0,.5), 0 4px 10px rgba(0,0,0,.3)` }}>
        <div style={{ position: "relative", width: "100%", paddingBottom: `${100 / ratio}%`, overflow: "hidden", borderRadius: 3 }}>
          <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: `sepia(${tone}) contrast(1.03)` }} />
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 40px rgba(60,35,10,.28)" }} />
        </div>
        <div style={{ fontFamily: "Special Elite", fontSize: 34, color: C.night, marginTop: 14, textAlign: "center", lineHeight: 1.15 }}>{caption}</div>
        {sub && <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 24, letterSpacing: 4, color: C.coast, textAlign: "center", marginTop: 6 }}>{sub}</div>}
        {children}
      </div>
    </div>
  );
};

// ---------- rubber stamp (red ink on a cream label) ----------
export const TwmStamp: React.FC<{ t: number; tIn: number; text: string; fs?: number; rot?: number; bg?: boolean; o?: number }> = ({ t, tIn, text, fs = 44, rot = -8, bg = true, o = 1 }) => {
  if (t < tIn) return null;
  const u = clamp((t - tIn) / 0.16);
  const s = 1 + (1 - u) * 1.2;
  return (
    <div style={{ position: "absolute", transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: clamp(u * 2) * o,
      border: `${fs * 0.14}px solid ${C.red}`, borderRadius: fs * 0.22, padding: `${fs * 0.22}px ${fs * 0.55}px`, fontFamily: "Oswald", fontWeight: 700,
      fontSize: fs, letterSpacing: fs * 0.14, color: C.red, whiteSpace: "nowrap", lineHeight: 1,
      background: bg ? "rgba(247,235,211,.88)" : "transparent", boxShadow: bg ? "0 10px 30px rgba(0,0,0,.35)" : "none" }}>{text}</div>
  );
};

// ---------- map pin (screen-constant size: pass 1/zoom as k) ----------
export const MapPin: React.FC<{ x: number; y: number; k: number; on: number; pulse?: number; big?: boolean }> = ({ x, y, k, on, pulse = 0, big }) => {
  if (on <= 0.001) return null;
  const r = (big ? 20 : 14) * k, sw = (big ? 7 : 5) * k;
  const pop = 1 + (1 - backOut(clamp(on), 2)) * 0.6;
  return (
    <g opacity={on}>
      {pulse > 0 && <circle cx={x} cy={y} r={r * (1.2 + pulse * 2.6)} fill="none" stroke={C.red} strokeWidth={4 * k} opacity={(1 - pulse) * 0.8} />}
      <circle cx={x} cy={y} r={r * pop} fill={C.red} stroke={C.cream} strokeWidth={sw} />
    </g>
  );
};

// ---------- opening / thumbnail title ----------
export const TitleCard: React.FC<{ o: number; t: number; lines: React.ReactNode; en: string }> = ({ o, t, lines, en }) => (
  <>
  <div style={{ position: "absolute", left: -120, right: -120, top: 160, height: 860, opacity: o,
    background: "radial-gradient(ellipse 52% 46% at 50% 50%, rgba(10,46,51,.86), rgba(10,46,51,.6) 55%, rgba(10,46,51,0) 100%)" }} />
  <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: o }}>
    <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 40, letterSpacing: 14, color: C.mustard, opacity: ramp(t, 0.1, 0.5) }}>UNE HISTOIRE VRAIE</div>
    <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 122, lineHeight: 1.0, color: C.cream, marginTop: 26, textShadow: "0 6px 24px rgba(0,0,0,.6)",
      transform: `scale(${1.04 - 0.04 * easeOut(t / 3)})` }}>{lines}</div>
    <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 38, color: C.land, marginTop: 30, opacity: 0.9, textShadow: "0 2px 8px rgba(0,0,0,.8)" }}>{en}</div>
  </div>
  </>
);

// ---------- end card ----------
export const EndCard: React.FC<{ t: number; tIn: number; teaser: string }> = ({ t, tIn, teaser }) => {
  if (t < tIn - 0.05) return null;
  const a = ramp(t, tIn, tIn + 0.6);
  const badge = clamp((t - tIn) / 0.6);
  const pill = clamp((t - tIn - 0.9) / 0.5);
  return (
    <>
      <AbsoluteFill style={{ background: "rgba(10,46,51,.84)", opacity: a }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 430, display: "flex", flexDirection: "column", alignItems: "center", gap: 28, opacity: a }}>
        <Img src={staticFile("brand/twm_badge.svg")} style={{ width: 420, height: 420, borderRadius: "50%", boxShadow: "0 20px 60px rgba(0,0,0,.5)",
          transform: `translateY(${(1 - easeOut(badge)) * 60}px) scale(${0.9 + 0.1 * backOut(badge, 1.3)})` }} />
        <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 46, letterSpacing: 14, color: C.mustard }}>THE WORLD</div>
        <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 150, lineHeight: 0.9, color: C.cream }}>Menu</div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 40, color: C.land }}>L'histoire de ce qu'on mange</div>
        <div style={{ marginTop: 50, fontFamily: "Inter", fontWeight: 800, fontSize: 50, color: C.night, background: C.mustard, padding: "22px 46px", borderRadius: 60,
          opacity: clamp(pill * 3), transform: `scale(${1 + (1 - backOut(pill, 1.6)) * 0.25})` }}>Abonne-toi pour le prochain plat</div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 34, color: C.cream, opacity: 0.85 * ramp(t, tIn + 1.3, tIn + 1.8), marginTop: 8 }}>{teaser}</div>
      </div>
    </>
  );
};

// ---------- grade: warm light, vignette, top darkening for the captions, grain ----------
export const Grade: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 50% at 50% 57%, rgba(255,214,150,.10), rgba(255,214,150,0) 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 65% at 50% 57%, rgba(10,46,51,0) 45%, rgba(10,46,51,.72))" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 900,
      background: "linear-gradient(180deg, rgba(10,46,51,.96) 0%, rgba(10,46,51,.85) 26%, rgba(10,46,51,.55) 36%, rgba(10,46,51,0) 50%)" }} />
    <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: "overlay" }}>
      <Img src={staticFile(`imam/tex/grain${frame % 12}.png`)} style={{ width: 1080, height: 1920 }} />
    </AbsoluteFill>
  </>
);
