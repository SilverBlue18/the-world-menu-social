// Style frames for the NEW real-food format (pilot: ketchup). Real stock footage underneath, animated graphics on top:
// 1) hook headline, 2) century countdown (year counter + timeline + route tag), 3) then-vs-now split screen.
// In the video these elements move (counter rolls, timeline fills, split slides open); here they are frozen frames.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Watermark } from "../shared/Watermark";

const C = { mustard: "#F2B134", red: "#E0412B", cream: "#F7EBD3", night: "#0A2E33", ink: "#111" };
const shade = (top: number, bottom: number) => ({ position: "absolute" as const, inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,${top}) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, rgba(0,0,0,${bottom}) 100%)` });

const Caption: React.FC<{ fr: React.ReactNode; en: string }> = ({ fr, en }) => (
  <div style={{ position: "absolute", left: 80, right: 150, top: 1120, textAlign: "center" }}>
    <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 50, lineHeight: 1.15, color: "#fff", textShadow: "0 3px 10px rgba(0,0,0,.85)" }}>{fr}</div>
    <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 31, color: "#f2e6cc", marginTop: 12, textShadow: "0 2px 8px rgba(0,0,0,.85)" }}>{en}</div>
  </div>
);

// 1 — hook: a white "news" card with the shocking claim over the real close-up
export const KetchupHook: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Img src={staticFile("ketchup/frames/hook.jpg")} style={{ width: 1080, height: 1920, objectFit: "cover", transform: "scale(1.08)" }} />
    <div style={shade(0.35, 0.55)} />
    <div style={{ position: "absolute", left: 70, right: 70, top: 300, background: "#fff", borderRadius: 22, padding: "34px 40px", transform: "rotate(-2deg)", boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}>
      <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 76, lineHeight: 1.05, color: C.ink, textTransform: "uppercase" }}>
        Le premier ketchup<br />n'avait <span style={{ color: C.red }}>aucune tomate</span>
      </div>
    </div>
    <Caption fr={<>c'était du <span style={{ color: C.mustard }}>poisson</span> fermenté.</>} en="It was fermented fish." />
    <Watermark />
  </AbsoluteFill>
);

// 2 — century countdown: the year rolls, the timeline fills, a route tag says where we are
const STOPS = [["-300", 0.0], ["1700", 0.45], ["1812", 0.72], ["1876", 1.0]] as const;
export const KetchupCountdown: React.FC = () => {
  const now = 0.45;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img src={staticFile("ketchup/frames/ship.jpg")} style={{ width: 1080, height: 1920, objectFit: "cover", filter: "saturate(.85) contrast(1.05)" }} />
      <div style={shade(0.6, 0.55)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", fontFamily: "Oswald", fontWeight: 700, fontSize: 210, lineHeight: 1, color: C.mustard, textShadow: "0 6px 30px rgba(0,0,0,.7)", letterSpacing: 4 }}>1700</div>
      <div style={{ position: "absolute", left: 110, right: 150, top: 520, height: 10, borderRadius: 5, background: "rgba(255,255,255,.25)" }}>
        <div style={{ width: `${now * 100}%`, height: "100%", borderRadius: 5, background: C.mustard }} />
        {STOPS.map(([y, p]) => (
          <div key={y} style={{ position: "absolute", left: `${p * 100}%`, top: -13, transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: p <= now ? C.mustard : "rgba(255,255,255,.35)", border: "5px solid #000", margin: "0 auto" }} />
            <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 30, color: p <= now ? "#fff" : "rgba(255,255,255,.6)", marginTop: 8 }}>{y}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, display: "flex", justifyContent: "center" }}>
        <div style={{ background: C.mustard, color: C.night, fontFamily: "Inter", fontWeight: 800, fontSize: 36, padding: "14px 30px", borderRadius: 40, letterSpacing: 2 }}>ASIE &nbsp;→&nbsp; ANGLETERRE</div>
      </div>
      <Caption fr={<>des marchands anglais la <span style={{ color: C.mustard }}>goûtent</span> en Asie…</>} en="English merchants taste it in Asia…" />
      <Watermark />
    </AbsoluteFill>
  );
};

// 3 — then vs now: the split slides open on the reveal
export const KetchupSplit: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 540, height: 1920, overflow: "hidden" }}>
      <Img src={staticFile("ketchup/frames/fish.jpg")} style={{ width: 1080, height: 1920, objectFit: "cover", marginLeft: -270, filter: "sepia(.55) saturate(.8) contrast(1.05)" }} />
    </div>
    <div style={{ position: "absolute", left: 540, top: 0, width: 540, height: 1920, overflow: "hidden" }}>
      <Img src={staticFile("ketchup/frames/bottle.jpg")} style={{ width: 1080, height: 1920, objectFit: "cover", marginLeft: -270 }} />
    </div>
    <div style={shade(0.55, 0.55)} />
    <div style={{ position: "absolute", left: 532, top: 0, width: 16, height: 1920, background: C.mustard, boxShadow: "0 0 30px rgba(242,177,52,.7)" }} />
    {[["1700", "POISSON", 0], ["2026", "TOMATE", 540]].map(([y, w, x]) => (
      <div key={y as string} style={{ position: "absolute", left: x as number, width: 540, top: 300, textAlign: "center" }}>
        <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 120, color: "#fff", lineHeight: 1, textShadow: "0 4px 20px rgba(0,0,0,.8)" }}>{y}</div>
        <div style={{ display: "inline-block", marginTop: 18, background: x ? C.red : "#6b4a2b", color: "#fff", fontFamily: "Inter", fontWeight: 800, fontSize: 38, padding: "10px 26px", borderRadius: 12, letterSpacing: 3 }}>{w}</div>
      </div>
    ))}
    <Caption fr={<>Le poisson a disparu… mais le <span style={{ color: C.mustard }}>nom</span> est resté.</>} en="The fish is gone… but the name stayed." />
    <Watermark />
  </AbsoluteFill>
);
