import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import caps from "./captions2.json";
import { MapShot } from "./Imam";
import { clamp, FPS, ramp, smooth } from "./lib";
import { DeckScene, DockScene, IstanbulScene, PrayerScene, StormScene, TeachScene } from "./Scenes";

export const SHORT_S = 75;
type Shot = { a: number; b: number; kind: "map" | "storm" | "istanbul" | "deck" | "dock" | "joke" | "prayer" | "teach"; zoom?: [number, number] };
// one shot per caption line, cuts land on the first word of each line
const SHOTS: Shot[] = [
  { a: 0.0, b: 3.5, kind: "storm" },
  { a: 3.5, b: 7.46, kind: "map", zoom: [1.0, 1.04] },
  { a: 7.46, b: 11.28, kind: "istanbul" },
  { a: 11.28, b: 15.04, kind: "map", zoom: [1.0, 0.97] },
  { a: 15.04, b: 17.62, kind: "deck" },
  { a: 17.62, b: 20.16, kind: "map", zoom: [1.0, 1.05] },
  { a: 20.16, b: 23.82, kind: "map", zoom: [1.0, 1.0] },
  { a: 23.82, b: 27.3, kind: "map", zoom: [1.25, 1.18] },
  { a: 27.3, b: 31.24, kind: "map", zoom: [1.0, 1.0] },
  { a: 31.24, b: 34.96, kind: "map", zoom: [1.0, 1.05] },
  { a: 34.96, b: 38.7, kind: "dock" },
  { a: 38.7, b: 42.34, kind: "map", zoom: [1.05, 1.1] },
  { a: 42.34, b: 44.22, kind: "joke" },
  { a: 44.22, b: 48.48, kind: "prayer" },
  { a: 48.48, b: 50.76, kind: "map", zoom: [1.05, 1.0] },
  { a: 50.76, b: 52.96, kind: "map", zoom: [1.0, 1.0] },
  { a: 52.96, b: 57.62, kind: "map", zoom: [1.0, 1.06] },
  { a: 57.62, b: 61.24, kind: "map", zoom: [1.05, 1.0] },
  { a: 61.24, b: 65.24, kind: "teach" },
  { a: 65.24, b: 68.58, kind: "map", zoom: [1.0, 1.0] },
  { a: 68.58, b: SHORT_S, kind: "map", zoom: [1.0, 1.04] },
];
const XF = 7 / FPS; // crossfade length

const ShotView: React.FC<{ s: Shot; frame: number }> = ({ s, frame }) => {
  const t = frame / FPS;
  const u = t - s.a, dur = s.b - s.a;
  const p = { u, dur, t };
  switch (s.kind) {
    case "storm": return <StormScene {...p} />;
    case "istanbul": return <IstanbulScene {...p} />;
    case "deck": return <DeckScene {...p} />;
    case "dock": return <DockScene {...p} />;
    case "joke": return <DockScene {...p} joke />;
    case "prayer": return <PrayerScene {...p} />;
    case "teach": return <TeachScene {...p} />;
    default: {
      const [z0, z1] = s.zoom ?? [1, 1];
      const z = z0 + (z1 - z0) * smooth(u / dur);
      return (
        <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "540px 1090px" }}>
          <MapShot frame={frame} />
        </AbsoluteFill>
      );
    }
  }
};

type Cap = { start: number; end: number; ar: string; tag: string; words: { t: string; s: number; e: number }[] };
const CAPS = caps as Cap[];
export const TopCaptions: React.FC<{ t: number }> = ({ t }) => {
  const c = CAPS.find((x) => t >= x.start - 0.05 && t < x.end);
  if (!c) return null;
  const fin = clamp((t - (c.start - 0.05)) / 0.18);
  const fout = 1 - clamp((t - (c.end - 0.12)) / 0.12);
  const o = Math.min(fin, fout);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 250, textAlign: "center", opacity: o, transform: `translateY(${(1 - fin) * 10}px)` }}>
      <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 64, lineHeight: 1.45, direction: "rtl", color: "#f2dfb2",
        textShadow: "0 2px 4px rgba(0,0,0,.9), 0 0 22px rgba(0,0,0,.6)" }}>{c.ar}</div>
      <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 47, lineHeight: 1.18, color: "#f6efe2", marginTop: 6, letterSpacing: -0.3,
        textShadow: "0 2px 4px rgba(0,0,0,.9), 0 0 18px rgba(0,0,0,.6)" }}>
        {c.words.map((w, i) => {
          // lights up green exactly while the word is spoken (forced-aligned times; 40 ms lead feels in sync)
          const next = c.words[i + 1]?.s ?? c.end;
          const until = next - w.e < 0.3 ? next - 0.02 : w.e + 0.12;
          const active = t >= w.s - 0.04 && t < until;
          return <span key={i} style={{ color: active ? "#7be36a" : "#f6efe2", textShadow: active ? "0 2px 4px rgba(0,0,0,.9), 0 0 16px rgba(110,220,90,.45)" : undefined }}>{w.t}{i < c.words.length - 1 ? " " : ""}</span>;
        })}
      </div>
      {c.tag && (
        <div style={{ fontFamily: "Oswald", fontWeight: 500, fontSize: 25, letterSpacing: 7, color: "#e9c27a", opacity: 0.8 * ramp(t, c.start + 0.25, c.start + 0.6), marginTop: 22,
          textShadow: "0 1px 3px rgba(0,0,0,.9)" }}>{c.tag}</div>
      )}
    </div>
  );
};

export const ImamShort: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const i = SHOTS.findIndex((s) => t >= s.a && t < s.b);
  const cur = SHOTS[Math.max(0, i)];
  const prev = i > 0 ? SHOTS[i - 1] : null;
  const xf = prev ? clamp((t - cur.a) / XF) : 1;
  const fadeIn = ramp(t, 0, 0.5);
  const fadeOut = 1 - ramp(t, SHORT_S - 1.4, SHORT_S - 0.1);
  return (
    <AbsoluteFill style={{ background: "#07040b", overflow: "hidden" }}>
      <Audio src={staticFile("imam/mix.wav")} />
      {prev && xf < 1 && <AbsoluteFill><ShotView s={prev} frame={frame} /></AbsoluteFill>}
      <AbsoluteFill style={{ opacity: xf, transform: `scale(${1.03 - 0.03 * smooth(xf)})`, transformOrigin: "540px 1000px" }}>
        <ShotView s={cur} frame={frame} />
      </AbsoluteFill>
      {/* top shade so the captions always read */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,3,10,.82) 0%, rgba(6,3,10,.55) 22%, rgba(6,3,10,0) 36%)" }} />
      <TopCaptions t={t} />
      <AbsoluteFill style={{ opacity: 0.1, mixBlendMode: "overlay" }}>
        <Img src={staticFile(`imam/tex/grain${frame % 12}.png`)} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeIn * fadeOut }} />
    </AbsoluteFill>
  );
};
