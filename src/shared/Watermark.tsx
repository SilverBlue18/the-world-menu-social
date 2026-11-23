import React from "react";

// The World Menu watermark, in the manner of the reference reel: a small, faded, letter-spaced
// wordmark centred at the very top, between two hairlines. Subtle: it must never pull the eye.
export const Watermark: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const line: React.CSSProperties = { width: 54, height: 1.5, background: "linear-gradient(90deg, rgba(242,223,178,0), rgba(242,223,178,.9), rgba(242,223,178,0))" };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 46, display: "flex", justifyContent: "center", alignItems: "center", gap: 16, opacity: 0.5 * opacity }}>
      <div style={line} />
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 27, letterSpacing: 7, textShadow: "0 1px 4px rgba(0,0,0,.6)", whiteSpace: "nowrap" }}>
        <span style={{ color: "#f2dfb2" }}>theworld</span>
        <span style={{ color: "#e9b45a" }}>menu</span>
      </div>
      <div style={line} />
    </div>
  );
};
