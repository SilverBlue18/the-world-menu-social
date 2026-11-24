// The World Menu 3D kit: load CC0 Kenney models, animated characters, a procedural chili, sea, sky, camera rig.
// All motion is driven by the Remotion frame (deterministic), never by a clock.
import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { createPortal, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type Look = "A" | "B";   // A = low-poly original colours, B = toy / plasticine

// ---------- loading (outside the canvas, with delayRender so frames never render half-loaded) ----------
export const useModels = (paths: string[]) => {
  const [handle] = useState(() => delayRender("Loading 3D models"));
  const [models, setModels] = useState<Record<string, GLTF> | null>(null);
  useEffect(() => {
    const loader = new GLTFLoader();
    Promise.all(paths.map((p) => loader.loadAsync(staticFile(p)).then((g) => [p, g] as const)))
      .then((entries) => { setModels(Object.fromEntries(entries)); continueRender(handle); })
      .catch((e) => { console.error(e); continueRender(handle); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return models;
};

// ---------- materials per look ----------
const clayCache = new Map<THREE.Material, THREE.Material>();
const toClay = (m: THREE.Material) => {
  if (clayCache.has(m)) return clayCache.get(m)!;
  const s = m as THREE.MeshStandardMaterial;
  const c = new THREE.MeshPhysicalMaterial({
    side: THREE.DoubleSide, map: s.map ?? null, color: s.color ?? new THREE.Color("#fff"), roughness: 0.82, metalness: 0,
    sheen: 0.7, sheenRoughness: 0.6, sheenColor: new THREE.Color("#fff4e6"), clearcoat: 0.08,
  });
  clayCache.set(m, c);
  return c;
};
export const styleObject = (o: THREE.Object3D, look: Look) => {
  o.traverse((n) => {
    const mesh = n as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true; mesh.receiveShadow = true;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mm) => { mm.side = THREE.DoubleSide; });     // leaves are single planes: never show a black back
    if (look === "B") {
      // plasticine: merge vertices + smooth normals so the hard low-poly facets read as soft clay
      if (!mesh.userData.smoothed) {
        const g = mergeVertices(mesh.geometry.clone(), 1e-3); g.computeVertexNormals();
        mesh.geometry = g; mesh.userData.smoothed = true;
      }
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(toClay) : toClay(mesh.material);
    }
  });
};

// a static model, normalised to a target height (or width) in metres
export const Model: React.FC<{ g: GLTF; look: Look; h?: number; w?: number; position?: [number, number, number]; rotation?: [number, number, number] }> = ({
  g, look, h, w, position = [0, 0, 0], rotation = [0, 0, 0],
}) => {
  const obj = useMemo(() => {
    const o = g.scene.clone(true); styleObject(o, look);
    const box = new THREE.Box3().setFromObject(o); const size = box.getSize(new THREE.Vector3());
    const k = h ? h / size.y : w ? w / Math.max(size.x, size.z) : 1;
    o.scale.setScalar(k); o.position.y = -box.min.y * k;
    const wrap = new THREE.Group(); wrap.add(o); return wrap;
  }, [g, look, h, w]);
  return <primitive object={obj} position={position} rotation={rotation} />;
};

// ---------- animated character ----------
export type Step = { at: number; clip: string; once?: boolean; speed?: number };
export const Character: React.FC<{
  g: GLTF; look: Look; t: number; steps: Step[]; h?: number; position?: [number, number, number]; rotY?: number;
  hold?: React.ReactNode; holdOffset?: [number, number, number];
}> = ({ g, look, t, steps, h = 1.0, position = [0, 0, 0], rotY = 0, hold }) => {
  const rig = useMemo(() => {
    const scene = cloneSkinned(g.scene); styleObject(scene, look);
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene, true); const k = h / box.getSize(new THREE.Vector3()).y;   // precise: includes the bones
    scene.scale.setScalar(k);
    const mixer = new THREE.AnimationMixer(scene);
    const actions: Record<string, THREE.AnimationAction> = {};
    for (const c of g.animations) { const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(0); actions[c.name] = a; }
    const hand = scene.getObjectByName("arm-right") ?? null;
    return { scene, mixer, actions, hand, k };
  }, [g, look, h]);
  // which clip is playing, with a 0.25 s cross-fade from the previous one
  let i = 0; while (i < steps.length - 1 && steps[i + 1].at <= t) i++;
  const cur = steps[i], prev = steps[i - 1];
  const fade = Math.min(1, Math.max(0, (t - cur.at) / 0.25));
  for (const a of Object.values(rig.actions)) a.setEffectiveWeight(0);
  const setClip = (s: Step, w: number) => {
    const a = rig.actions[s.clip]; if (!a) return;
    const d = a.getClip().duration, lt = Math.max(0, t - s.at) * (s.speed ?? 1);
    a.time = s.once ? Math.min(lt, d - 1e-3) : lt % d; a.setEffectiveWeight(w);
  };
  setClip(cur, prev ? fade : 1);
  if (prev && fade < 1) setClip(prev, 1 - fade);
  rig.mixer.update(0);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <primitive object={rig.scene} />
      {hold && rig.hand && <HandSlot hand={rig.hand} k={rig.k}>{hold}</HandSlot>}
    </group>
  );
};
// renders children in the coordinate space of the character's right hand
// (a portal keeps the hand inside the skeleton; 1/k undoes the character's scale so props keep their real size)
const HandSlot: React.FC<{ hand: THREE.Object3D; k: number; children: React.ReactNode }> = ({ hand, k, children }) =>
  createPortal(<group scale={1 / k}>{children}</group>, hand);

// ---------- the hero chili (procedural, glossy) ----------
export const Chili: React.FC<{ len?: number; look: Look; position?: [number, number, number]; rotation?: [number, number, number]; glow?: number }> = ({
  len = 0.5, look, position = [0, 0, 0], rotation = [0, 0, 0], glow = 0,
}) => {
  const geo = useMemo(() => {
    const L = len, R = L * 0.12;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05 * L, -0.3 * L, 0), new THREE.Vector3(0.18 * L, -0.65 * L, 0), new THREE.Vector3(0.42 * L, -0.92 * L, 0),
    ]);
    const TS = 60, RS = 24;
    const g = new THREE.TubeGeometry(curve, TS, R, RS, false);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i <= TS; i++) {
      const u = i / TS;
      const r = Math.pow(Math.sin(Math.min(1, u / 0.12) * Math.PI / 2), 0.6) * Math.pow(1 - u, 0.75) * 1.15 + (u < 0.02 ? 0.3 : 0);
      curve.getPointAt(u, c);
      for (let j = 0; j <= RS; j++) {
        const idx = i * (RS + 1) + j; v.fromBufferAttribute(pos, idx); v.sub(c).multiplyScalar(Math.max(0.02, r)).add(c); pos.setXYZ(idx, v.x, v.y, v.z);
      }
    }
    g.computeVertexNormals();
    return g;
  }, [len]);
  const red = look === "A"
    ? <meshPhysicalMaterial color="#d81c12" roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} emissive="#ff3010" emissiveIntensity={glow * 0.6} />
    : <meshPhysicalMaterial color="#e2432f" roughness={0.65} sheen={0.8} sheenColor="#ffd9c8" emissive="#ff3010" emissiveIntensity={glow * 0.5} />;
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} castShadow>{red}</mesh>
      {/* calyx + stem */}
      <mesh position={[0, 0.02 * len, 0]} scale={[1, 0.45, 1]} castShadow>
        <sphereGeometry args={[len * 0.13, 20, 12]} /><meshStandardMaterial color="#3d8b2f" roughness={0.6} />
      </mesh>
      <mesh position={[-0.03 * len, 0.13 * len, 0]} rotation={[0, 0, 0.35]} castShadow>
        <cylinderGeometry args={[len * 0.025, len * 0.035, len * 0.22, 10]} /><meshStandardMaterial color="#4f9a37" roughness={0.6} />
      </mesh>
    </group>
  );
};

// ---------- sky dome (vertical gradient) ----------
export const Sky: React.FC<{ top: string; bottom: string }> = ({ top, bottom }) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.15,0.0,1.0); gl_FragColor = vec4(mix(bottom, top, pow(h,0.8)),1.0); }",
  }), [top, bottom]);
  return <mesh material={mat}><sphereGeometry args={[400, 32, 16]} /></mesh>;
};

// ---------- low-poly sea (displaced every frame from t) ----------
export const Sea: React.FC<{ t: number; look: Look; size?: number; color?: string }> = ({ t, look, size = 160, color = "#1f8a9a" }) => {
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(size, size, 90, 90); g.rotateX(-Math.PI / 2); return g; }, [size]);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3], z = base[i * 3 + 2];
    pos.setY(i, Math.sin(x * 0.35 + t * 1.3) * 0.12 + Math.cos(z * 0.42 + t * 1.1) * 0.1 + Math.sin((x + z) * 0.9 + t * 2.2) * 0.04);
  }
  pos.needsUpdate = true; geo.computeVertexNormals();
  return (
    <mesh geometry={geo} receiveShadow>
      {look === "A" ? <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} flatShading />
        : <meshPhysicalMaterial color={color} roughness={0.55} sheen={0.5} sheenColor="#d8fbff" />}
    </mesh>
  );
};

// ---------- camera rig: keyed position + look-at, smooth ----------
export type CamKey = { t: number; pos: [number, number, number]; look: [number, number, number]; fov?: number };
const ss = (x: number) => { const u = Math.min(1, Math.max(0, x)); return u * u * (3 - 2 * u); };
export const CameraRig: React.FC<{ t: number; keys: CamKey[] }> = ({ t, keys }) => {
  const { camera } = useThree();
  let i = 0; while (i < keys.length - 2 && keys[i + 1].t <= t) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const u = b.t > a.t ? ss((t - a.t) / (b.t - a.t)) : 1;
  const lerp3 = (p: number[], q: number[]) => p.map((v, k) => v + (q[k] - v) * u) as [number, number, number];
  const P = lerp3(a.pos, b.pos), L = lerp3(a.look, b.look);
  camera.position.set(...P); camera.lookAt(...L);
  const pc = camera as THREE.PerspectiveCamera;
  const fov = (a.fov ?? 32) + ((b.fov ?? 32) - (a.fov ?? 32)) * u;
  if (pc.fov !== fov) { pc.fov = fov; pc.updateProjectionMatrix(); }
  return null;
};

// ---------- a chili plant: soft low-poly leaves with red chilis hanging ----------
export const ChiliPlant: React.FC<{ look: Look; h?: number; seed?: number; position?: [number, number, number]; chilis?: number }> = ({ look, h = 0.7, seed = 1, position = [0, 0, 0], chilis = 5 }) => {
  const rnd = (k: number) => { const x = Math.sin(seed * 91.7 + k * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const leaf = look === "A" ? <meshStandardMaterial color="#3f9b46" roughness={0.7} flatShading /> : <meshPhysicalMaterial color="#6cb766" roughness={0.8} sheen={0.6} sheenColor="#eaffd9" />;
  return (
    <group position={position} rotation={[0, rnd(0) * 6.28, 0]}>
      <mesh position={[0, h * 0.3, 0]} castShadow><cylinderGeometry args={[h * 0.025, h * 0.04, h * 0.6, 6]} /><meshStandardMaterial color="#5d7d36" roughness={0.8} /></mesh>
      {Array.from({ length: 7 }, (_, k) => {
        const a = k * 0.9 + rnd(k) * 0.5, r = h * (0.12 + rnd(k + 9) * 0.16), y = h * (0.45 + rnd(k + 3) * 0.4);
        return <mesh key={k} position={[Math.cos(a) * r, y, Math.sin(a) * r]} scale={[1, 0.75, 1]} castShadow>
          <icosahedronGeometry args={[h * (0.17 + rnd(k + 5) * 0.06), look === "A" ? 0 : 2]} />{leaf}</mesh>;
      })}
      {Array.from({ length: chilis }, (_, k) => {
        const a = k * 1.3 + rnd(k + 20), r = h * 0.26;
        return <Chili key={"c" + k} look={look} len={h * 0.32} position={[Math.cos(a) * r, h * (0.62 + rnd(k + 30) * 0.18), Math.sin(a) * r]} rotation={[0, -a, 0.15 + rnd(k) * 0.3]} />;
      })}
    </group>
  );
};
