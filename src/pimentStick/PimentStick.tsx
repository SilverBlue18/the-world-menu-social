// "Le piment" — stickman version (GrowKaz Stickman Studio render) with The World Menu overlays:
// FR/EN captions at the bottom (spoken word in mustard), watermark, brand end card. Audio = voice + recorded SFX + ambience (no music).
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import capsJson from "../../projects/piment/captions.json";
import { EndCard, TwmCaptions, TwmCap } from "../shared/twm";
import { Watermark } from "../shared/Watermark";

const CAPS = capsJson as unknown as TwmCap[];
export const STICK_S = 69.0;
const TITLE_OUT = 2.8;   // s001 title card (thumbnail): no captions
const END = 64.9;        // end card over the cast line-up (s029)
// Social safe zone (TikTok / Reels / Shorts): keep text between y 260 and 1420 and away from the right-side buttons.
const SAFE_CAP_TOP = 1085;

export const PimentStick: React.FC<{ video?: string }> = ({ video = "piment_stick/stick.mp4" }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: "#0A2E33" }}>
      <OffthreadVideo src={staticFile(video)} muted style={{ width: 1080, height: 1920 }} />
      <Audio src={staticFile("piment_stick/mix.wav")} />
      {/* soft shade behind the bottom captions */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, height: 960, opacity: t > TITLE_OUT && t < END ? 1 : 0,
        background: "linear-gradient(180deg, rgba(6,20,22,0) 0%, rgba(6,20,22,.6) 22%, rgba(6,20,22,.6) 50%, rgba(6,20,22,.3) 100%)" }} />
      <TwmCaptions t={t} caps={CAPS} showFrom={TITLE_OUT + 0.1} top={SAFE_CAP_TOP} compact />
      <Watermark />
      <EndCard t={t} tIn={END} teaser="Demain : un autre plat, une autre histoire vraie." />
    </AbsoluteFill>
  );
};
