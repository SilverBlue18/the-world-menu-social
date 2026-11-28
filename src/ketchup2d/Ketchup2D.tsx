// "Ketchup" — ENGLISH pilot, 2D version (code-drawn food illustrations instead of footage);, brand v2 "Fresh editorial", built to the shorts-autopilot rules:
// hook card at frame 1 (no captions under it), then 3-6 word caption groups at the TOP (spoken word in tomato, French line
// under), graphics on the footage in the middle, bottom 480 px + right 150 px kept clear for the app UI, frame changes every beat.
// Every timed element reads src/ketchup/beats_en.json; the sound reads the same file.
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import beats from "./beats_2d.json";
import { ART } from "./Art";
import groupsJson from "../../projects/ketchup_en/groups.json";
import { B2, ClocheB, Wordmark } from "../brand/BrandV2";
import { backOut, clamp, easeOut } from "../imam/lib";

const FPS = 30;
export const KETCHUP_2D_S = beats.duration;
type Word = { t: string; s: number; e: number };
type Group = { start: number; end: number; en: string; words: Word[] };
const GROUPS = groupsJson as Group[];
type Scene = { t: number; art?: string; split?: string[]; zoom?: number[] };
const SCENES = beats.scenes as Scene[];
const win = (t: number, a: number, b: number, fi = 0.12, fo = 0.2) => clamp((t - a) / fi) * clamp((b - t) / fo);
const pop = (t: number, a: number, d = 0.35) => backOut(clamp((t - a) / d), 1.7);
const shadow = "0 3px 6px rgba(0,0,0,.9), 0 0 26px rgba(0,0,0,.55)";

// ---------- 2D art (replaces the footage; same zoom-punch + flash on every cut) ----------
const Clip: React.FC<{ name: string; dur: number; zoom: number[]; first: boolean }> = ({ name, dur, zoom, first }) => {
  const f = useCurrentFrame(); const u = clamp(f / (dur * FPS)); const A = ART[name];
  const punch = first ? 1 : 1 + 0.1 * (1 - easeOut(clamp(f / 8)));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${(zoom[0] + (zoom[1] - zoom[0]) * u) * punch})` }}><A t={f / FPS} /></AbsoluteFill>
      {!first && <AbsoluteFill style={{ background: B2.cream, opacity: 0.3 * (1 - clamp(f / 4)) }} />}
    </AbsoluteFill>
  );
};
const Split: React.FC<{ names: string[] }> = ({ names }) => {
  const t = useCurrentFrame() / FPS; const open = easeOut(clamp(t / 0.45));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {[0, 1].map((i) => { const A = ART[names[i]]; return (
        <div key={i} style={{ position: "absolute", top: 0, left: i ? 540 : 0, width: 540, height: 1920, overflow: "hidden", transform: `translateX(${(i ? 1 : -1) * (1 - open) * 540}px)` }}>
          <div style={{ position: "absolute", left: -270, top: 0, width: 1080, height: 1920 }}><A t={t} /></div>
        </div>); })}
      <div style={{ position: "absolute", left: 533, top: 0, width: 14, height: 1920, background: B2.cream, opacity: open }} />
      {beats.splitLabels.map(([y, w], i) => { const k = pop(t, 0.35 + i * 0.25); return (
        <div key={y} style={{ position: "absolute", left: i * 540, width: 540, top: 760, textAlign: "center", opacity: clamp(k * 3), transform: `scale(${0.6 + 0.4 * k})` }}>
          <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 104, color: "#fff", lineHeight: 1, textShadow: shadow }}>{y}</div>
          <div style={{ display: "inline-block", marginTop: 16, background: i ? B2.tomato : B2.olive, color: B2.cream, fontFamily: "Inter", fontWeight: 800, fontSize: 40, padding: "10px 28px", borderRadius: 40, letterSpacing: 3 }}>{w}</div>
        </div>); })}
    </AbsoluteFill>
  );
};

// ---------- captions: 3-6 word groups at the top, spoken word in tomato, French line under ----------
const TopCaptions: React.FC<{ t: number }> = ({ t }) => {
  if (t < beats.captionsFrom || t > beats.endCard) return null;
  const i = GROUPS.findIndex((g, k) => t >= g.start - 0.06 && t < (GROUPS[k + 1]?.start ?? g.end + 0.6) - 0.02);
  if (i < 0) return null;
  const g = GROUPS[i], fin = clamp((t - (g.start - 0.06)) / 0.12);
  return (
    <div style={{ position: "absolute", left: 70, right: 150, top: 250, textAlign: "center", opacity: fin, transform: `translateY(${(1 - fin) * 12}px)` }}>
      <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 68, lineHeight: 1.08, color: "#fff", letterSpacing: -0.8, textShadow: shadow }}>
        {g.words.map((w, k) => { const on = t >= w.s - 0.04 && t < (g.words[k + 1]?.s ?? g.end + 0.5); return (
          <React.Fragment key={k}><span style={{ color: on ? "#FF4A5F" : "#fff" }}>{w.t}</span>{k < g.words.length - 1 ? " " : ""}</React.Fragment>); })}
      </div>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 34, color: B2.cream, marginTop: 12, textShadow: shadow, opacity: 0.92 }}>{g.en}</div>
    </div>
  );
};

// ---------- graphics (middle of the frame) ----------
const HookCard: React.FC<{ t: number }> = ({ t }) => {
  const h = beats.hookCard, a = clamp((h.out - t) / 0.2); if (t > h.out) return null; const k = pop(t, h.in, 0.4);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ background: B2.cream, borderRadius: 22, padding: "26px 46px", transform: `rotate(-2deg) scale(${0.55 + 0.45 * k})`, boxShadow: "0 18px 50px rgba(0,0,0,.45)", textAlign: "center" }}>
        <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 108, lineHeight: 0.98, color: B2.charcoal }}>{h.text[0]}</div>
        <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 108, lineHeight: 0.98, color: B2.tomato }}>{h.text[1]}</div>
      </div>
    </div>
  );
};
const Pill: React.FC<{ t: number; at: number; out: number; text: string; top: number; red?: boolean; big?: boolean }> = ({ t, at, out, text, top, red, big }) => {
  const a = win(t, at, out); if (a <= 0) return null; const k = pop(t, at, 0.3);
  return (
    <div style={{ position: "absolute", left: 0, right: 150, top, display: "flex", justifyContent: "center", opacity: a, paddingLeft: 150 }}>
      <div style={{ background: red ? B2.tomato : B2.olive, color: B2.cream, fontFamily: "Inter", fontWeight: 800, fontSize: big ? 84 : 38, padding: big ? "10px 40px" : "12px 30px",
        borderRadius: big ? 18 : 40, letterSpacing: big ? 4 : 3, transform: `scale(${0.4 + 0.6 * k}) rotate(${big ? -2 : 0}deg)`, boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>{text}</div>
    </div>
  );
};
const Year: React.FC<{ t: number }> = ({ t }) => {
  const y = beats.years.find((v) => t >= v.t - 0.05 && t < v.out); if (!y) return null;
  const k = pop(t, y.t, 0.4), a = win(t, y.t, y.out, 0.1, 0.25), line = easeOut(clamp((t - y.t - 0.15) / 0.4));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: a }}>
      <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 210, lineHeight: 1, color: "#fff", textShadow: shadow, transform: `scale(${0.7 + 0.3 * k})` }}>{y.year}</div>
      <div style={{ margin: "10px auto 0", width: 300 * line, height: 12, borderRadius: 6, background: B2.tomato }} />
    </div>
  );
};

// the century timeline (format C): fills stop by stop on the spoken dates; sits just under the captions
const Timeline: React.FC<{ t: number }> = ({ t }) => {
  const tl = beats.timeline, a = win(t, tl.in, tl.out, 0.3, 0.3); if (a <= 0) return null;
  const n = tl.stops.length - 1; let p = 0;
  tl.stops.forEach(([, ts], i) => { if (i && t >= (ts as number)) p = Math.max(p, ((i - 1) + easeOut(clamp((t - (ts as number)) / 0.6))) / n); });
  return (
    <div style={{ position: "absolute", left: 110, right: 190, top: 560, height: 10, opacity: a }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 5, background: "rgba(246,241,231,.35)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${p * 100}%`, borderRadius: 5, background: B2.tomato }} />
      {tl.stops.map(([y, ts], i) => { const on = t >= (ts as number); const k = on ? pop(t, ts as number, 0.3) : 0; return (
        <div key={y as string} style={{ position: "absolute", left: `${(i / n) * 100}%`, top: -14, transform: "translateX(-50%)", textAlign: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: 19, background: on ? B2.tomato : B2.cream, border: `5px solid ${on ? B2.cream : "rgba(43,43,43,.6)"}`, margin: "0 auto", transform: `scale(${1 + 0.35 * Math.sin(Math.PI * clamp(k))})` }} />
          <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 26, letterSpacing: 1, color: on ? "#fff" : "rgba(255,255,255,.65)", marginTop: 8, textShadow: shadow }}>{y}</div>
        </div>); })}
    </div>
  );
};
const BigWord: React.FC<{ t: number }> = ({ t }) => (
  <>{beats.bigWord.map((b) => { const a = win(t, b.t, b.out); if (a <= 0) return null; const k = pop(t, b.t); const long = b.text.length > 10;
    return <div key={b.t} style={{ position: "absolute", left: 40, right: 40, top: long ? 800 : 760, textAlign: "center", opacity: a, fontFamily: "Playfair Display", fontWeight: 900, fontSize: long ? 104 : 150, color: B2.cream, textShadow: shadow, transform: `scale(${0.5 + 0.5 * k})` }}>{b.text}</div>; })}</>
);
const Strike: React.FC<{ t: number }> = ({ t }) => {
  const s = beats.strike, a = win(t, s.t, s.out); if (a <= 0) return null;
  const k = pop(t, s.t, 0.3), line = easeOut(clamp((t - s.t - 0.3) / 0.3));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ position: "relative", fontFamily: "Playfair Display", fontWeight: 900, fontSize: 190, color: B2.cream, textShadow: shadow, transform: `scale(${0.5 + 0.5 * k})` }}>
        {s.text}<div style={{ position: "absolute", left: -20, top: "52%", height: 18, width: `calc(${line * 100}% + 40px)`, background: B2.tomato, borderRadius: 9, transform: "rotate(-6deg)" }} />
      </div>
    </div>
  );
};
const NameCard: React.FC<{ t: number }> = ({ t }) => {
  const n = beats.nameCard, a = win(t, n.t, n.out); if (a <= 0) return null; const k = pop(t, n.t, 0.4);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 720, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ background: B2.cream, borderRadius: 20, padding: "22px 40px", textAlign: "center", transform: `rotate(-1.5deg) scale(${0.6 + 0.4 * k})`, boxShadow: "0 16px 40px rgba(0,0,0,.45)" }}>
        <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 84, color: B2.charcoal, lineHeight: 1 }}>{n.name}</div>
        <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 30, color: B2.olive, letterSpacing: 6, marginTop: 10 }}>{n.sub}</div>
      </div>
    </div>
  );
};
const Counter: React.FC<{ t: number }> = ({ t }) => {
  const c = beats.counter, a = win(t, c.t, c.out); if (a <= 0) return null;
  const v = Math.round(c.to * easeOut(clamp((t - c.t) / c.dur))), k = pop(t, c.t + c.dur, 0.3);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 980, textAlign: "center", opacity: a }}>
      <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 120, color: "#fff", textShadow: shadow, transform: `scale(${1 + 0.08 * Math.sin(Math.PI * clamp(k))})` }}>{v.toLocaleString("en-US")}</div>
      <div style={{ display: "inline-block", background: B2.tomato, color: B2.cream, fontFamily: "Inter", fontWeight: 800, fontSize: 38, padding: "8px 26px", borderRadius: 40, letterSpacing: 4 }}>{c.suffix}</div>
    </div>
  );
};
const Watermark2: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, opacity: 0.75 * clamp((t - 0.8) / 0.6) * (t > beats.endCard ? 0 : 1) }}>
    <div style={{ width: 46, height: 46, borderRadius: "50%", background: B2.tomato, display: "flex", alignItems: "center", justifyContent: "center" }}><ClocheB size={38} /></div>
    <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 25, letterSpacing: 6, color: B2.cream, textShadow: "0 1px 4px rgba(0,0,0,.7)" }}>THE WORLD MENU</div>
  </div>
);
const EndCard2: React.FC<{ t: number }> = ({ t }) => {
  const t0 = beats.endCard; if (t < t0 - 0.05) return null;
  const a = clamp((t - t0) / 0.5), k = pop(t, t0 + 0.1, 0.5), p = pop(t, t0 + 0.9, 0.45);
  return (
    <AbsoluteFill style={{ background: B2.cream, opacity: a, alignItems: "center", paddingTop: 380 }}>
      <div style={{ width: 360, height: 360, borderRadius: "50%", background: B2.tomato, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.7 + 0.3 * k})` }}><ClocheB size={300} /></div>
      <div style={{ marginTop: 40 }}><Wordmark scale={1.6} stacked /></div>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 38, color: B2.charcoal, marginTop: 24 }}>True stories behind the food you eat</div>
      <div style={{ marginTop: 50, background: B2.tomato, color: B2.cream, fontFamily: "Inter", fontWeight: 800, fontSize: 50, padding: "22px 48px", borderRadius: 60, opacity: clamp(p * 3), transform: `scale(${0.7 + 0.3 * p})` }}>Follow for the next dish</div>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 30, color: B2.olive, marginTop: 18, opacity: clamp((t - t0 - 1.3) / 0.4) }}>Abonne-toi pour le prochain plat</div>
    </AbsoluteFill>
  );
};

export const Ketchup2D: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ends = SCENES.map((s, i) => SCENES[i + 1]?.t ?? beats.duration);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={Math.round((ends[i] - s.t) * FPS)}>
          {s.split ? <Split names={s.split} /> : <Clip name={s.art!} dur={ends[i] - s.t} zoom={s.zoom ?? [1, 1.06]} first={i === 0} />}
        </Sequence>
      ))}
      {/* top shade for the captions; light centre so the food stays the hero */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.4) 24%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 70%, rgba(0,0,0,.25) 100%)" }} />
      <HookCard t={t} />
      <TopCaptions t={t} />
      <Timeline t={t} />
      <Year t={t} />
      <BigWord t={t} />
      <Strike t={t} />
      <NameCard t={t} />
      {beats.tags.map((g) => <Pill key={g.text} t={t} at={g.t} out={g.out} text={g.text} top={1180} />)}
      {beats.labels.map((g) => <Pill key={g.text} t={t} at={g.t} out={g.out} text={g.text} top={800 + ((g as { dy?: number }).dy ?? 0)} big red={(g as { red?: boolean }).red} />)}
      {"glass" in beats && <Pill t={t} at={(beats as any).glass.t} out={(beats as any).glass.out} text={(beats as any).glass.text} top={800} big />}
      <Counter t={t} />
      <Watermark2 t={t} />
      <EndCard2 t={t} />
      <Audio src={staticFile("ketchup_en/mix.wav")} />
    </AbsoluteFill>
  );
};
