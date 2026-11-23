import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { MapShot } from "./Imam";
import { FPS, ramp } from "./lib";
import { TopCaptions } from "./Short";
import { Watermark } from "../shared/Watermark";

export const FLOW_S = 75;
// The continuous map story on the desk, with Arabic + English captions on top.
export const ImamFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const fadeIn = ramp(t, 0, 0.5);
  const fadeOut = 1 - ramp(t, FLOW_S - 1.4, FLOW_S - 0.1);
  return (
    <AbsoluteFill style={{ background: "#120804", overflow: "hidden" }}>
      <Audio src={staticFile("imam/mix.wav")} />
      <MapShot frame={frame} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,0,.9) 0%, rgba(10,4,0,.6) 24%, rgba(10,4,0,0) 37%)" }} />
      <TopCaptions t={t} />
      <Watermark opacity={ramp(t, 1.0, 1.8)} />
      <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
        <Img src={staticFile(`imam/tex/grain${frame % 12}.png`)} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeIn * fadeOut }} />
    </AbsoluteFill>
  );
};
