import React from "react";
import { clamp, ramp } from "../imam/lib";

export type Cap = { start: number; end: number; ar: string; tag: string; words: { t: string; s: number; e: number }[] };

// House-style captions: Arabic line, English line with the spoken word lit up green, optional fact tag.
export const TopCaptions: React.FC<{ t: number; caps: Cap[] }> = ({ t, caps }) => {
  const c = caps.find((x) => t >= x.start - 0.05 && t < x.end);
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
