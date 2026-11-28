// "Le ketchup" — pilot of the NEW real-food format: real stock footage (Pexels) underneath, animated graphics on top.
// Hook card (A) → century countdown with rolling year + timeline (C) → then-vs-now split (B) → question → end card.
// Every timed element reads src/ketchup/beats.json (the sound reads the same file). Captions: FR + EN in the safe zone.
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import beats from "./beats.json";
import capsJson from "../../projects/ketchup/captions.json";
import { EndCard, TwmCaptions, TwmCap } from "../shared/twm";
import { Watermark } from "../shared/Watermark";
import { backOut, clamp, easeOut } from "../imam/lib";

const FPS = 30;
export const KETCHUP_S = beats.duration;
const CAPS = capsJson as unknown as TwmCap[];
const K = { mustard: "#F2B134", red: "#E0412B", cream: "#F7EBD3", night: "#0A2E33", ink: "#111", brown: "#6b4a2b" };
const SAFE_CAP_TOP = 1085;
type Scene = { t: number; clip?: string; split?: string[]; from: number | number[]; zoom?: number[]; gray?: boolean };
const SCENES = beats.scenes as Scene[];
const win = (t: number, a: number, b: number, fi = 0.15, fo = 0.2) => clamp((t - a) / fi) * clamp((b - t) / fo);
const pop = (t: number, a: number, d = 0.35) => backOut(clamp((t - a) / d), 1.7);

// ---------- footage ----------
const Clip: React.FC<{ name: string; from: number; dur: number; zoom: number[]; gray?: boolean; t0: number }> = ({ name, from, dur, zoom, gray, t0 }) => {
  const f = useCurrentFrame(); const u = clamp(f / (dur * FPS));
  const punch = 1 + 0.12 * (1 - easeOut(clamp(f / 8)));                 // quick zoom-punch on every cut
  const s = (zoom[0] + (zoom[1] - zoom[0]) * u) * punch;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <OffthreadVideo src={staticFile(`ketchup/clips/${name}.mp4`)} startFrom={Math.round(from * FPS)} muted
        style={{ width: 1080, height: 1920, objectFit: "cover", transform: `scale(${s})`, filter: gray ? "grayscale(.85) contrast(1.1) brightness(.8)" : "saturate(1.08) contrast(1.04)" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: t0 > 0 ? 0.35 * (1 - clamp(f / 4)) : 0 }} />
    </AbsoluteFill>
  );
};
const Split: React.FC<{ names: string[]; from: number[]; dur: number }> = ({ names, from }) => {
  const f = useCurrentFrame(); const t = f / FPS; const open = easeOut(clamp(t / 0.45));
  const half = (i: number) => (
    <div style={{ position: "absolute", top: 0, left: i ? 540 : 0, width: 540, height: 1920, overflow: "hidden", transform: `translateX(${(i ? 1 : -1) * (1 - open) * 540}px)` }}>
      <OffthreadVideo src={staticFile(`ketchup/clips/${names[i]}.mp4`)} startFrom={Math.round(from[i] * FPS)} muted
        style={{ width: 1080, height: 1920, objectFit: "cover", marginLeft: -270, filter: i ? "saturate(1.1)" : "sepia(.55) saturate(.8) contrast(1.05)" }} />
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {half(0)}{half(1)}
      <div style={{ position: "absolute", left: 532, top: 0, width: 16, height: 1920, background: K.mustard, boxShadow: "0 0 30px rgba(242,177,52,.7)", opacity: open }} />
      {beats.splitLabels.map(([y, w], i) => {
        const k = pop(t, 0.35 + i * 0.25);
        return (
          <div key={y} style={{ position: "absolute", left: i * 540, width: 540, top: 300, textAlign: "center", opacity: clamp(k * 3), transform: `scale(${0.6 + 0.4 * k})` }}>
            <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 120, color: "#fff", lineHeight: 1, textShadow: "0 4px 20px rgba(0,0,0,.8)" }}>{y}</div>
            <div style={{ display: "inline-block", marginTop: 18, background: i ? K.red : K.brown, color: "#fff", fontFamily: "Inter", fontWeight: 800, fontSize: 38, padding: "10px 26px", borderRadius: 12, letterSpacing: 3 }}>{w}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- graphics ----------
const Headline: React.FC<{ t: number }> = ({ t }) => {
  const k = pop(t, beats.headline.in, 0.4), a = clamp((beats.headline.out - t) / 0.25);
  if (t < beats.headline.in || a <= 0) return null;
  const tom = clamp((t - 1.68) / 0.25);                                     // "aucune tomate" lights up on the word
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 300, background: "#fff", borderRadius: 22, padding: "34px 40px", opacity: a,
      transform: `rotate(-2deg) scale(${0.5 + 0.5 * k})`, boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}>
      <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 76, lineHeight: 1.05, color: K.ink, textTransform: "uppercase" }}>
        Le premier ketchup<br />n'avait <span style={{ color: tom > 0.5 ? K.red : K.ink, display: "inline-block", transform: `scale(${1 + 0.12 * Math.sin(Math.PI * tom)})` }}>aucune tomate</span>
      </div>
    </div>
  );
};
const Timeline: React.FC<{ t: number }> = ({ t }) => {
  const { in: tin, out, stops } = beats.timeline; const a = win(t, tin, out, 0.3, 0.3); if (a <= 0) return null;
  let p = 0; stops.forEach(([, ts], i) => { p = Math.max(p, (i / (stops.length - 1)) * easeOut(clamp((t - (ts as number)) / 0.6)) + (i ? 0 : 0)); });
  // the rolling year
  const Y = beats.years as number[][]; let year: number | null = null;
  for (let i = 0; i < Y.length; i++) if (t >= Y[i][0]) { const prev = i ? Y[i - 1][1] : Y[0][1] - 300; year = Math.round(prev + (Y[i][1] - prev) * easeOut(clamp((t - Y[i][0]) / 0.7))); }
  const bump = Y.reduce((m, [ts]) => Math.max(m, 1 - clamp((t - ts) / 0.35)), 0) * (year ? 1 : 0);
  const big = beats.bigWord[0], bw = win(t, big.t, big.out, 0.1, 0.2), bk = pop(t, big.t);
  return (
    <div style={{ opacity: a }}>
      {year && <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: "Oswald", fontWeight: 700, fontSize: 210, lineHeight: 1, color: K.mustard,
        textShadow: "0 6px 30px rgba(0,0,0,.7)", letterSpacing: 4, transform: `scale(${1 + 0.1 * bump})` }}>{year}</div>}
      {bw > 0 && !year && <div style={{ position: "absolute", left: 0, right: 0, top: 285, textAlign: "center", fontFamily: "Oswald", fontWeight: 700, fontSize: 150, color: K.mustard,
        textShadow: "0 6px 30px rgba(0,0,0,.7)", opacity: bw, transform: `scale(${0.5 + 0.5 * bk})` }}>{big.text}</div>}
      <div style={{ position: "absolute", left: 110, right: 150, top: 510, height: 10, borderRadius: 5, background: "rgba(255,255,255,.25)" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 5, background: K.mustard }} />
        {stops.map(([y, ts], i) => { const on = t >= (ts as number); const k = on ? pop(t, ts as number, 0.3) : 0; return (
          <div key={y as string} style={{ position: "absolute", left: `${(i / (stops.length - 1)) * 100}%`, top: -13, transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: on ? K.mustard : "rgba(255,255,255,.35)", border: "5px solid #000", margin: "0 auto", transform: `scale(${1 + 0.4 * Math.sin(Math.PI * clamp(k))})` }} />
            <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 28, color: on ? "#fff" : "rgba(255,255,255,.6)", marginTop: 8, textShadow: "0 2px 8px rgba(0,0,0,.8)" }}>{y}</div>
          </div>); })}
      </div>
    </div>
  );
};
const Tag: React.FC<{ t: number; at: number; out: number; text: string; top?: number; red?: boolean; big?: boolean }> = ({ t, at, out, text, top = 640, red, big }) => {
  const a = win(t, at, out, 0.08, 0.2); if (a <= 0) return null; const k = pop(t, at, 0.3);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ background: red ? K.red : K.mustard, color: red ? "#fff" : K.night, fontFamily: big ? "Oswald" : "Inter", fontWeight: big ? 700 : 800, fontSize: big ? 110 : 36,
        padding: big ? "6px 44px" : "14px 30px", borderRadius: big ? 20 : 40, letterSpacing: 2, transform: `scale(${0.4 + 0.6 * k}) rotate(${big ? -3 : 0}deg)`, boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>{text}</div>
    </div>
  );
};
const Strike: React.FC<{ t: number }> = ({ t }) => {
  const s = beats.strike, a = win(t, s.t, s.out, 0.08, 0.2); if (a <= 0) return null;
  const k = pop(t, s.t, 0.3), line = easeOut(clamp((t - s.t - 0.35) / 0.3));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 660, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ position: "relative", fontFamily: "Oswald", fontWeight: 700, fontSize: 150, color: K.cream, textShadow: "0 6px 30px rgba(0,0,0,.7)", transform: `scale(${0.5 + 0.5 * k})` }}>
        {s.text}
        <div style={{ position: "absolute", left: -20, top: "52%", height: 16, width: `calc(${line * 100}% + 40px)`, background: K.red, borderRadius: 8, transform: "rotate(-6deg)" }} />
      </div>
    </div>
  );
};

export const KetchupShort: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const ends = SCENES.map((s, i) => (SCENES[i + 1]?.t ?? beats.duration));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map((s, i) => {
        const dur = ends[i] - s.t, from = Math.round(s.t * FPS), d = Math.round(dur * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            {s.split ? <Split names={s.split} from={s.from as number[]} dur={dur} />
              : <Clip name={s.clip!} from={s.from as number} dur={dur} zoom={s.zoom ?? [1, 1.06]} gray={s.gray} t0={s.t} />}
          </Sequence>
        );
      })}
      {/* top + bottom shade so graphics and captions always read */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 52%, rgba(0,0,0,.55) 78%, rgba(0,0,0,.35) 100%)" }} />
      <Headline t={t} />
      <Timeline t={t} />
      {beats.tags.map((g) => <Tag key={g.text} t={t} at={g.t} out={g.out} text={g.text} />)}
      <Strike t={t} />
      {beats.labels.map((g) => <Tag key={g.text} t={t} at={g.t} out={g.out} text={g.text} top={700} big red={(g as { red?: boolean }).red} />)}
      <Tag t={t} at={beats.ask.t} out={beats.endCard} text={beats.ask.text} top={420} />
      <TwmCaptions t={t} caps={CAPS} showFrom={beats.captionsFrom} top={SAFE_CAP_TOP} compact />
      <Watermark />
      <EndCard t={t} tIn={beats.endCard} teaser="Demain : un autre plat, une autre histoire vraie." />
      <Audio src={staticFile("ketchup/mix.wav")} />
    </AbsoluteFill>
  );
};
