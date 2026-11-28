// The World Menu: brand v2 "Fresh editorial" (chosen 2026-11-28). Tomato red + olive + cream + charcoal,
// Playfair Display (Menu, titles) + Inter (everything else). The mark: a plate seen from above that is also a globe.
import React from "react";
import { AbsoluteFill } from "remotion";

export const B2 = { tomato: "#D7263D", olive: "#3E5F3A", cream: "#F6F1E7", charcoal: "#2B2B2B", white: "#FFFFFF", sage: "#A9B89A" };

// plate-globe mark, drawn in a 200x200 box
export const Mark: React.FC<{ size: number; dark?: boolean }> = ({ size, dark }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="96" fill={dark ? B2.charcoal : B2.cream} />
    <circle cx="100" cy="100" r="84" fill={B2.white} stroke={B2.charcoal} strokeWidth="5" />
    <circle cx="100" cy="100" r="66" fill="none" stroke={B2.charcoal} strokeOpacity=".12" strokeWidth="2" />
    <g fill="none" stroke={B2.olive} strokeWidth="4.5" strokeLinecap="round" strokeDasharray="9 8">
      <ellipse cx="100" cy="100" rx="56" ry="56" />
      <ellipse cx="100" cy="100" rx="24" ry="56" />
      <path d="M44 100 H156" />
    </g>
    <path d="M70 70 Q100 40 128 66" fill="none" stroke={B2.tomato} strokeWidth="5" strokeLinecap="round" />
    <circle cx="128" cy="66" r="11" fill={B2.tomato} />
    <circle cx="70" cy="70" r="6" fill={B2.charcoal} />
  </svg>
);
export const Wordmark: React.FC<{ scale?: number; light?: boolean; stacked?: boolean }> = ({ scale = 1, light, stacked }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: stacked ? "center" : "flex-start", lineHeight: 1 }}>
    <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 30 * scale, letterSpacing: 10 * scale, color: light ? B2.cream : B2.charcoal }}>THE WORLD</div>
    <div style={{ fontFamily: "Playfair Display", fontWeight: 900, fontSize: 92 * scale, color: B2.tomato, marginTop: 4 * scale, letterSpacing: -1 * scale }}>Menu</div>
  </div>
);

const Swatch: React.FC<{ c: string; name: string; role: string }> = ({ c, name, role }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
    <div style={{ width: 84, height: 84, borderRadius: 18, background: c, border: c === B2.cream || c === B2.white ? `2px solid ${B2.charcoal}22` : undefined }} />
    <div style={{ fontFamily: "Inter" }}>
      <div style={{ fontWeight: 800, fontSize: 26, color: B2.charcoal }}>{name}</div>
      <div style={{ fontWeight: 400, fontSize: 21, color: "#6b6b6b" }}>{c} · {role}</div>
    </div>
  </div>
);

// brand board for approval: logos, avatar, palette, type, caption sample
export const BrandV2Board: React.FC = () => (
  <AbsoluteFill style={{ background: B2.cream, padding: 70, fontFamily: "Inter" }}>
    <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 34, background: B2.white, borderRadius: 30, padding: "40px 54px" }}>
        <Mark size={190} /><Wordmark scale={1.05} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, background: B2.charcoal, borderRadius: 30, padding: "34px 54px" }}>
        <Mark size={150} dark /><Wordmark scale={0.75} light stacked />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 230, height: 230, borderRadius: "50%", background: B2.olive, display: "flex", alignItems: "center", justifyContent: "center" }}><Mark size={190} /></div>
        <div style={{ fontSize: 20, color: "#6b6b6b" }}>profile picture</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 70, marginTop: 64 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "26px 40px" }}>
        <Swatch c={B2.tomato} name="Tomato" role="highlight, key words" />
        <Swatch c={B2.olive} name="Olive" role="routes, tags, dates" />
        <Swatch c={B2.cream} name="Cream" role="paper, cards" />
        <Swatch c={B2.charcoal} name="Charcoal" role="text, outlines" />
      </div>
      <div style={{ flex: 1, background: "#3d3127", borderRadius: 26, padding: "34px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 52, color: "#fff", lineHeight: 1.1 }}>Fish, not <span style={{ color: "#ff5a6e" }}>tomato.</span></div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 28, color: B2.cream, opacity: 0.85, marginTop: 10 }}>Du poisson, pas de la tomate.</div>
        <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
          <span style={{ background: B2.olive, color: B2.cream, fontWeight: 800, fontSize: 24, padding: "8px 20px", borderRadius: 30, letterSpacing: 3 }}>1700 · ASIA</span>
          <span style={{ background: B2.cream, color: B2.charcoal, fontFamily: "Playfair Display", fontWeight: 900, fontSize: 30, padding: "4px 20px", borderRadius: 10 }}>Heinz, 1876</span>
        </div>
      </div>
    </div>
    <div style={{ marginTop: 40, fontSize: 22, color: "#6b6b6b" }}>Type: Playfair Display 900 for titles and "Menu" · Inter 600/800 for captions, tags and labels</div>
  </AbsoluteFill>
);

// ---------- logo alternatives (round 2) ----------
const T = B2.tomato, O = B2.olive, CR = B2.cream, CH = B2.charcoal;
const M1 = () => (   // 1 tomato-globe: a tomato with meridians and a green calyx
  <svg width="220" height="220" viewBox="0 0 200 200"><circle cx="100" cy="110" r="70" fill={T} />
    <g fill="none" stroke={CR} strokeWidth="4" strokeOpacity=".9"><ellipse cx="100" cy="110" rx="30" ry="70" /><path d="M30 110 H170" /><path d="M42 75 Q100 92 158 75" /><path d="M42 145 Q100 128 158 145" /></g>
    <path d="M100 40 l-22 -10 l14 16 l-26 6 l26 6 l-4 18 l12 -14 l12 14 l-4 -18 l26 -6 l-26 -6 l14 -16 z" fill={O} /><path d="M100 40 q4 -16 16 -22" stroke={O} strokeWidth="6" fill="none" strokeLinecap="round" /></svg>);
const M2 = () => (   // 2 fork-globe: a fork whose tines are the meridians of a globe
  <svg width="220" height="220" viewBox="0 0 200 200"><circle cx="100" cy="80" r="58" fill="none" stroke={CH} strokeWidth="7" />
    <g stroke={O} strokeWidth="7" strokeLinecap="round"><path d="M76 40 V100" /><path d="M92 30 V100" /><path d="M108 30 V100" /><path d="M124 40 V100" /></g>
    <path d="M72 100 Q100 122 128 100" fill={O} /><rect x="93" y="112" width="14" height="76" rx="7" fill={CH} /><circle cx="150" cy="44" r="10" fill={T} /></svg>);
const M3 = () => (   // 3 cloche: the world served under a dome
  <svg width="220" height="220" viewBox="0 0 200 200"><path d="M28 140 Q28 54 100 54 Q172 54 172 140 Z" fill={T} />
    <g fill="none" stroke={CR} strokeWidth="4"><path d="M100 54 V140" /><path d="M64 64 Q52 100 54 140" /><path d="M136 64 Q148 100 146 140" /><path d="M34 104 H166" /></g>
    <circle cx="100" cy="46" r="10" fill={CH} /><rect x="14" y="140" width="172" height="12" rx="6" fill={CH} /><rect x="40" y="158" width="120" height="8" rx="4" fill={O} /></svg>);
const M4 = () => (   // 4 monogram: WM in Playfair inside a plate ring
  <svg width="220" height="220" viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill={CR} stroke={CH} strokeWidth="6" /><circle cx="100" cy="100" r="72" fill="none" stroke={O} strokeWidth="3" strokeDasharray="8 7" />
    <text x="100" y="121" textAnchor="middle" fontFamily="Playfair Display" fontWeight="900" fontSize="58" fill={T}>WM</text></svg>);
const M5 = () => (   // 5 bowl-globe: a bowl whose steam forms the top half of a globe
  <svg width="220" height="220" viewBox="0 0 200 200"><path d="M24 104 Q24 176 100 176 Q176 176 176 104 Z" fill={O} /><rect x="16" y="98" width="168" height="12" rx="6" fill={CH} />
    <g fill="none" stroke={T} strokeWidth="6" strokeLinecap="round"><path d="M40 92 Q40 30 100 30 Q160 30 160 92" /><path d="M72 92 Q70 44 100 30 Q130 44 128 92" /><path d="M100 30 V92" /><path d="M48 62 H152" /></g></svg>);
const M6 = () => (   // 6 spoon-globe: a spoon carrying a tiny world
  <svg width="220" height="220" viewBox="0 0 200 200"><ellipse cx="100" cy="72" rx="52" ry="60" fill={CH} /><rect x="92" y="126" width="16" height="66" rx="8" fill={CH} />
    <circle cx="100" cy="70" r="36" fill={T} /><g fill="none" stroke={CR} strokeWidth="3.5"><ellipse cx="100" cy="70" rx="15" ry="36" /><path d="M64 70 H136" /></g><circle cx="134" cy="34" r="9" fill={O} /></svg>);
const OPTS: [string, React.FC][] = [["1 · Tomato globe", M1], ["2 · Fork globe", M2], ["3 · Cloche", M3], ["4 · WM monogram", M4], ["5 · Bowl globe", M5], ["6 · Spoon globe", M6]];
export const LogoOptions: React.FC = () => (
  <AbsoluteFill style={{ background: B2.cream, padding: 50, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 30 }}>
    {OPTS.map(([name, Mk]) => (
      <div key={name} style={{ background: B2.white, borderRadius: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Mk /><Wordmark scale={0.62} /></div>
        <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 26, color: B2.charcoal, marginTop: 4 }}>{name}</div>
      </div>
    ))}
  </AbsoluteFill>
);

// ---------- the chosen mark: CLOCHE (round 3), icon-only for profile pictures ----------
export const Cloche: React.FC<{ size: number; dome?: string; lines?: string; base?: string; plate?: string }> = ({ size, dome = T, lines = CR, base = CH, plate = O }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <path d="M30 138 Q30 52 100 52 Q170 52 170 138 Z" fill={dome} />
    <g fill="none" stroke={lines} strokeWidth="5" strokeLinecap="round"><path d="M100 52 V138" /><path d="M66 62 Q54 98 56 138" /><path d="M134 62 Q146 98 144 138" /><path d="M36 102 H164" /></g>
    <circle cx="100" cy="42" r="11" fill={base} />
    <rect x="16" y="138" width="168" height="14" rx="7" fill={base} />
    <rect x="44" y="158" width="112" height="9" rx="4.5" fill={plate} />
  </svg>
);
const AV: { name: string; bg: string; props: Parameters<typeof Cloche>[0] }[] = [
  { name: "A · cream", bg: CR, props: { size: 0 } },
  { name: "B · olive", bg: O, props: { size: 0, base: CR, plate: CR } },
  { name: "C · tomato", bg: T, props: { size: 0, dome: CR, lines: T, base: CH, plate: CH } },
  { name: "D · charcoal", bg: CH, props: { size: 0, base: CR, plate: O } },
];
const Avatar: React.FC<{ d: number; i: number }> = ({ d, i }) => (
  <div style={{ width: d, height: d, borderRadius: "50%", background: AV[i].bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,.08)" }}>
    <div style={{ marginTop: d * 0.02 }}><Cloche {...AV[i].props} size={d * 0.78} /></div>
  </div>
);
// how the icon reads at Instagram sizes: profile header (~170 px), feed/comments (~64 px), stories ring (~110 px), tiny (~36 px)
export const ClocheAvatars: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", padding: 50, fontFamily: "Inter" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 30 }}>
      {AV.map((a, i) => (
        <div key={a.name} style={{ background: "#fafafa", borderRadius: 24, padding: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <Avatar d={300} i={i} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 22 }}>
            <div style={{ padding: 4, borderRadius: "50%", background: `conic-gradient(#f9ce34, #ee2a7b, #6228d7, #f9ce34)` }}><div style={{ padding: 3, borderRadius: "50%", background: "#fff" }}><Avatar d={110} i={i} /></div></div>
            <Avatar d={64} i={i} /><Avatar d={36} i={i} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 28, color: CH }}>{a.name}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 26, background: "#fafafa", borderRadius: 24, padding: "26px 34px" }}>
      <Avatar d={170} i={1} />
      <div>
        <div style={{ fontWeight: 800, fontSize: 34, color: "#111" }}>thew0rldmenu</div>
        <div style={{ fontWeight: 600, fontSize: 26, color: "#111", marginTop: 6 }}>The World Menu · true stories behind the food you eat</div>
        <div style={{ fontSize: 24, color: "#555", marginTop: 6 }}>Mock-up of the Instagram profile header (option B)</div>
      </div>
    </div>
  </AbsoluteFill>
);

// ---------- final brand exports (chosen 2026-11-28: cloche mark, profile picture on TOMATO) ----------
const clocheOnTomato = { dome: CR, lines: T, base: CH, plate: CH };
export const ProfilePic: React.FC = () => (
  <AbsoluteFill style={{ background: T, alignItems: "center", justifyContent: "center" }}><div style={{ marginTop: 20 }}><Cloche size={840} {...clocheOnTomato} /></div></AbsoluteFill>
);
export const LogoLight: React.FC = () => (
  <AbsoluteFill style={{ background: CR, alignItems: "center", justifyContent: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 50 }}><Cloche size={340} /><Wordmark scale={1.9} /></div>
  </AbsoluteFill>
);
export const LogoDark: React.FC = () => (
  <AbsoluteFill style={{ background: CH, alignItems: "center", justifyContent: "center", gap: 30 }}>
    <Cloche size={420} base={CR} plate={O} /><Wordmark scale={1.7} light stacked />
  </AbsoluteFill>
);
