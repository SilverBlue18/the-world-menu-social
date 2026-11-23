import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const FONTS: Record<string, string[]> = {
  Inter: ["400", "600", "800"],
  "Playfair Display": ["400", "700", "900"],
  "JetBrains Mono": ["400"],
  "Special Elite": ["400"],
  Oswald: ["500", "700"],
  Amiri: ["400", "700"],
};
const file = (fam: string, w: string) =>
  `fonts/${fam.toLowerCase().replace(/ /g, "-")}-${fam === "Amiri" ? "arabic" : "latin"}-${w}-normal.woff2`;

let done = false;
export const loadStudioFonts = () => {
  if (done) return;
  done = true;
  for (const [fam, ws] of Object.entries(FONTS))
    for (const w of ws) loadFont({ family: fam, url: staticFile(file(fam, w)), weight: w, format: "woff2" });
};
