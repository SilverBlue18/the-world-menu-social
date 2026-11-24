// 3D look test for "Le piment": a chili field in Mexico and Columbus on his ship, in two looks (A low-poly, B plasticine).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { CameraRig, Character, Chili, ChiliPlant, Look, Model, Sea, Sky, useModels } from "./kit";
import { C } from "../shared/twm";
import { Watermark } from "../shared/Watermark";

const M = {
  farmer: "3d/chars/character-male-f.glb", columbus: "3d/chars/character-male-b.glb", sailor: "3d/chars/character-male-a.glb",
  bush: "3d/nature/plant_bushDetailed.glb", bushS: "3d/nature/plant_bushSmall.glb", row: "3d/nature/crops_dirtDoubleRow.glb",
  cactus: "3d/nature/cactus_tall.glb", cactusS: "3d/nature/cactus_short.glb", palm: "3d/nature/tree_palmDetailedTall.glb",
  rock: "3d/nature/rock_largeB.glb", rock2: "3d/nature/rock_largeD.glb", tent: "3d/nature/tent_smallOpen.glb",
  ship: "3d/pirate/ship-large.glb", palmP: "3d/pirate/palm-detailed-bend.glb", patch: "3d/pirate/patch-sand-foliage.glb",
  barrel: "3d/pirate/barrel.glb", crate: "3d/pirate/crate.glb",
};

const Caption: React.FC<{ fr: React.ReactNode; en: string }> = ({ fr, en }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: "linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.2) 55%, rgba(0,0,0,0))" }} />
    <div style={{ position: "absolute", left: 70, right: 70, top: 250, textAlign: "center" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 58, lineHeight: 1.18, color: "#fff", textShadow: "0 3px 14px rgba(0,0,0,.6)" }}>{fr}</div>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 36, color: "rgba(255,255,255,.82)", marginTop: 18, textShadow: "0 2px 8px rgba(0,0,0,.6)" }}>{en}</div>
    </div>
  </>
);
const Hi: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: C.mustard }}>{children}</span>;

const Lights: React.FC<{ look: Look; warm?: boolean }> = ({ look, warm }) => (
  look === "A" ? (
    <>
      <hemisphereLight args={[warm ? "#ffe9c4" : "#dff2ff", "#7a5a3a", 0.9]} />
      <directionalLight position={[6, 10, 5]} intensity={2.6} color={warm ? "#fff0d6" : "#ffffff"} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0004} />
    </>
  ) : (
    <>
      <hemisphereLight args={["#fff3e4", "#c9a98a", 1.5]} />
      <directionalLight position={[4, 9, 7]} intensity={1.5} color="#fff6ea" castShadow
        shadow-mapSize={[2048, 2048]} shadow-radius={8} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0004} />
      <directionalLight position={[-6, 4, -3]} intensity={0.5} color="#ffd9c0" />
    </>
  )
);

// ---------------- scene 1: the chili field (Mexico, ~6,000 years ago) ----------------
const Field: React.FC<{ look: Look; t: number; m: Record<string, any> }> = ({ look, t, m }) => {
  const rows: React.ReactNode[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
    const x = -4.2 + c * 1.4 + (r % 2) * 0.35, z = -1.6 - r * 1.5;
    if (Math.abs(x) < 0.9 && r === 0) continue;
    rows.push(
      <ChiliPlant key={`${r}-${c}`} look={look} h={0.75 + ((r * 7 + c) % 3) * 0.08} seed={r * 7 + c + 1} position={[x, 0, z]} />,
    );
  }
  const picked = t > 3.1;
  return (
    <>
      <Sky top={look === "A" ? "#5fb6e8" : "#f3c9a4"} bottom={look === "A" ? "#fde7b8" : "#fff1dc"} />
      <fog attach="fog" args={[look === "A" ? "#f6dfb4" : "#f8e2cc", 14, 48]} />
      <Lights look={look} warm />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[60, 64]} />
        <meshStandardMaterial color={look === "A" ? "#c99a5b" : "#dcae7c"} roughness={1} /></mesh>
      {[-3, -1.5, 0, 1.5, 3].map((x) => <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x * 1.4 / 1.5, 0.01, -4.6]} receiveShadow>
        <planeGeometry args={[0.9, 8]} /><meshStandardMaterial color={look === "A" ? "#8a5a33" : "#a77650"} roughness={1} /></mesh>)}
      {rows}
      {/* the farmer: picks a chili from the bush, then shows it */}
      <Character g={m[M.farmer]} look={look} t={t} h={1.15} position={[0.15, 0, 0.4]} rotY={-0.25}
        steps={[{ at: 0, clip: "idle" }, { at: 2.4, clip: "pick-up", once: true, speed: 0.6 }, { at: 3.1, clip: "holding-right" }, { at: 5.6, clip: "emote-yes", speed: 0.8 }]}
        hold={picked ? <Chili look={look} len={0.46} position={[0.02, -0.34, 0.22]} rotation={[0.9, 0.2, 2.7]} glow={t > 5.4 ? 0.4 : 0} /> : null} />
      <ChiliPlant look={look} h={0.95} seed={99} position={[-0.8, 0, -0.1]} chilis={7} />
      {/* backdrop: cacti, rocks, a hut */}
      <Model g={m[M.cactus]} look={look} h={2.4} position={[-6.5, 0, -9]} />
      <Model g={m[M.cactusS]} look={look} h={1.2} position={[5.8, 0, -7]} />
      <Model g={m[M.rock]} look={look} h={3.5} position={[8, 0, -16]} />
      <Model g={m[M.rock2]} look={look} h={4.5} position={[-10, 0, -18]} />
      <Model g={m[M.tent]} look={look} h={2.2} position={[4.6, 0, -11]} rotation={[0, -0.6, 0]} />
      <Model g={m[M.palm]} look={look} h={4.5} position={[-4.8, 0, -13]} />
      <CameraRig t={t} keys={[
        { t: 0, pos: [0.4, 6.5, 13], look: [0, 0.4, -3], fov: 38 },
        { t: 2.3, pos: [0.6, 2.4, 5.2], look: [0, 0.8, -0.5], fov: 34 },
        { t: 5.2, pos: [0.9, 2.0, 5.6], look: [0.1, 1.0, -0.2], fov: 32 },
        { t: 8, pos: [0.7, 1.85, 4.9], look: [0.1, 1.0, 0.0], fov: 31 },
      ]} />
    </>
  );
};

// ---------------- scene 2: Columbus tastes it (Caribbean, 1493) ----------------
const Ship: React.FC<{ look: Look; t: number; m: Record<string, any> }> = ({ look, t, m }) => {
  const roll = Math.sin(t * 1.1) * 0.03, bob = Math.sin(t * 1.3) * 0.06;
  return (
    <>
      <Sky top={look === "A" ? "#3b9be0" : "#9fd3e8"} bottom={look === "A" ? "#d8f1ff" : "#fff1de"} />
      <fog attach="fog" args={[look === "A" ? "#cfeefc" : "#f6ead8", 20, 80]} />
      <Lights look={look} />
      <Sea t={t} look={look} color={look === "A" ? "#1d93a8" : "#5fb8bd"} />
      <group position={[0, -0.25 + bob, 0]} rotation={[roll, 0.5, roll * 0.5]}>
        <Model g={m[M.ship]} look={look} w={6} />
        <Character g={m[M.columbus]} look={look} t={t} h={0.85} position={[0.2, 1.15, 1.2]} rotY={-0.4}
          steps={[{ at: 0, clip: "holding-right" }, { at: 1.6, clip: "interact-right", speed: 0.7 }, { at: 3.0, clip: "emote-no", speed: 0.9 }]}
          hold={<Chili look={look} len={0.24} position={[0, -0.27, 0.07]} rotation={[0.3, 0, 2.9]} />} />
        <Model g={m[M.barrel]} look={look} h={0.45} position={[-0.9, 1.15, 1.6]} />
        <Model g={m[M.crate]} look={look} h={0.4} position={[1.0, 1.15, 0.6]} />
      </group>
      {/* the island */}
      <group position={[-9, -0.2, -14]}>
        <Model g={m[M.patch]} look={look} w={9} />
        <Model g={m[M.palmP]} look={look} h={4} position={[0.5, 0.1, 0]} />
        <Model g={m[M.palmP]} look={look} h={3.2} position={[-2, 0.1, 1]} rotation={[0, 2, 0]} />
      </group>
      <CameraRig t={t} keys={[{ t: 0, pos: [7.5, 3.8, 11], look: [0, 1.7, 0], fov: 34 }, { t: 4, pos: [6.2, 3.3, 9], look: [0, 1.8, 0.3], fov: 32 }]} />
    </>
  );
};

export const PimentTest3D: React.FC<{ look: Look; scene: "field" | "ship" }> = ({ look, scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const m = useModels(Object.values(M));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {m && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
          camera={{ fov: 34, near: 0.1, far: 800, position: [0, 3, 8] }}
          style={look === "B" ? { filter: "saturate(.92) contrast(.96)" } : undefined}>
          {scene === "field" ? <Field look={look} t={t} m={m} /> : <Ship look={look} t={t} m={m} />}
        </ThreeCanvas>
      )}
      {scene === "field"
        ? <Caption fr={<>Là-bas, on le cultive depuis environ <Hi>six mille</Hi> ans.</>} en="There, people have grown it for about six thousand years." />
        : <Caption fr={<>En 1493, Christophe Colomb le <Hi>goûte</Hi> aux Caraïbes.</>} en="In 1493, Christopher Columbus tastes it in the Caribbean." />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 95% 70% at 50% 55%, rgba(0,0,0,0) 60%, rgba(0,0,0,.35))" }} />
      <Watermark />
    </AbsoluteFill>
  );
};
