import React from "react";
import { AbsoluteFill } from "remotion";
import caps from "./captions.json";
import { clamp } from "./lib";

type Cap = { start: number; end: number; words: { t: string; s: number; e: number }[] };
const CAPS = caps as Cap[];
const CY = 1362; // caption centre: below the hero, above TikTok/Reels/Shorts bottom UI

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CAPS.find((x) => t >= x.start - 0.06 && t < x.end);
  // soft backing band, present whenever captions run
  const bandOn = clamp((t - 0.0) / 0.3) * (1 - clamp((t - 73.2) / 0.5));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: 0, right: 0, top: CY - 190, height: 380, opacity: 0.85 * bandOn,
        background: "radial-gradient(ellipse 62% 50% at 50% 50%, rgba(12,6,0,.55) 0%, rgba(12,6,0,.28) 55%, rgba(12,6,0,0) 100%)",
      }} />
      {c && (() => {
        const fin = clamp((t - (c.start - 0.06)) / 0.14);
        const fout = 1 - clamp((t - (c.end - 0.1)) / 0.1);
        const o = Math.min(fin, fout);
        const y = (1 - fin) * 14;
        return (
          <div style={{
            position: "absolute", left: 90, right: 110, top: CY, transform: `translateY(-50%) translateY(${y}px)`,
            textAlign: "center", opacity: o, fontFamily: "Inter", fontWeight: 800, fontSize: 62, lineHeight: 1.12,
            letterSpacing: -0.5, color: "#f3ead8",
            textShadow: "0 2px 3px rgba(0,0,0,.85), 0 0 18px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.9)",
          }}>
            {c.words.map((w, i) => {
              const active = t >= w.s - 0.04 && t < Math.max(w.e, (c.words[i + 1]?.s ?? c.end) - 0.02);
              const said = t >= w.s - 0.04;
              return (
                <span key={i} style={{ color: active ? "#f2bf5e" : said ? "#f3ead8" : "rgba(243,234,216,.62)" }}>
                  {w.t}{i < c.words.length - 1 ? " " : ""}
                </span>
              );
            })}
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
