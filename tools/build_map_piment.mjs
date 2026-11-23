// Map data for 'Le piment': Mercator world from Mexico to India, Sahel look. node tools/build_map_piment.mjs
import fs from "node:fs";
import { geoMercator, geoPath, geoGraticule } from "d3-geo";
import { feature } from "topojson-client";
const topo = JSON.parse(fs.readFileSync("node_modules/world-atlas/land-50m.json", "utf8"));
const land = feature(topo, topo.objects.land);
const W = 6000;                                   // 200° of longitude -> 30 map px per degree
const bounds = { type: "Feature", geometry: { type: "MultiPoint", coordinates: [[-108, -20], [92, 50]] } };
const proj = geoMercator().fitWidth(W, bounds);
const [[, y0]] = geoPath(proj).bounds(bounds);
proj.translate([proj.translate()[0], proj.translate()[1] - y0]);
const EX = { x0: -4200, y0: -2600, x1: 10400, y1: 6400 };     // far larger than the camera ever sees
proj.clipExtent([[EX.x0, EX.y0], [EX.x1, EX.y1]]);
const path = geoPath(proj);
const grat = geoGraticule().step([10, 10]).extent([[-180, -75], [180, 80]])();
const P = (lon, lat) => proj([lon, lat]).map((v) => Math.round(v * 10) / 10);
const places = {
  mexico: [-97.6, 19.0],      // central-east Mexico (Puebla / Veracruz), where chili was domesticated
  caribbean: [-71.2, 19.0],   // Hispaniola: Columbus's second voyage, 1493 (Chanca's letter)
  palos: [-6.9, 37.2], lisbon: [-9.14, 38.72],
  goa: [73.83, 15.5], southIndia: [77.6, 10.8], northIndia: [77.2, 28.6], india: [79.0, 21.5],
  pernambuco: [-34.9, -8.05], cape: [18.5, -34.4],
};
const pts = Object.fromEntries(Object.entries(places).map(([k, v]) => [k, P(...v)]));
const route = (arr) => arr.map((p) => P(...p));
const out = {
  W, EX, proj: { scale: proj.scale(), translate: proj.translate() }, land: path(land), graticule: path(grat), pts,
  // Columbus, 1493: Spain -> Canaries -> Hispaniola
  rCol: route([[-6.9, 37.0], [-10.5, 33.5], [-15.6, 28.2], [-30, 24.5], [-48, 21.5], [-62, 19.6], [-71.2, 19.2]]),
  // back across the Atlantic to Iberia (via the Azores)
  rBack: route([[-71.2, 19.4], [-62, 25.5], [-48, 32.5], [-28.5, 38.2], [-18, 39.2], [-9.4, 38.75]]),
  // Portuguese sea road: Lisbon -> along Africa -> Cape of Good Hope -> East Africa -> Goa
  rPort: route([[-9.4, 38.6], [-14, 30], [-18.5, 21], [-19.5, 12], [-14.5, 4], [-4, 0.5], [6, -5], [10, -17], [15, -30], [19.5, -36.2], [27, -34.6],
    [35.5, -25], [40.8, -15], [40.2, -6.5], [46, 1.5], [55, 8.5], [65, 13.5], [73.5, 15.4]]),
  // inside India: from the south to the north
  rIndia: route([[77.6, 10.8], [77.9, 14.5], [78.4, 18.5], [78.3, 22.5], [77.6, 25.8], [77.2, 28.5]]),
  // Pernambuco -> Cape -> Goa (the "pepper of Pernambuco")
  rPern: route([[-34.6, -8.1], [-25, -16], [-8, -27], [8, -33.5], [19.5, -36.4], [27, -34.8], [35.5, -25.2], [41, -15], [40.4, -6.4], [46, 1.6], [55, 8.6], [65, 13.6], [73.4, 15.6]]),
};
fs.mkdirSync("src/piment", { recursive: true });
fs.writeFileSync("src/piment/mapdata.json", JSON.stringify(out));
console.log(JSON.stringify(pts));
