import fs from "node:fs";
import { geoMercator, geoPath, geoGraticule } from "d3-geo";
import { feature } from "topojson-client";
const topo = JSON.parse(fs.readFileSync("node_modules/world-atlas/land-50m.json", "utf8"));
const land = feature(topo, topo.objects.land);
const W = 6000;
const bounds = { type: "Feature", geometry: { type: "MultiPoint", coordinates: [[-82, 20], [22, 60]] } };
const proj = geoMercator().fitWidth(W, bounds);
const [[, y0], [, y1]] = geoPath(proj).bounds(bounds);
const H = Math.ceil(y1 - y0);
proj.translate([proj.translate()[0], proj.translate()[1] - y0]);
const EX = { x0: -2600, y0: -3200, x1: 8600, y1: 6600 };
proj.clipExtent([[EX.x0, EX.y0], [EX.x1, EX.y1]]);
const path = geoPath(proj);
const grat = geoGraticule().step([10, 10]).extent([[-150, -20], [80, 85]])();
const P = (lon, lat) => proj([lon, lat]).map((v) => Math.round(v * 10) / 10);
const places = {
  haarlem: [4.64, 52.38], amsterdam: [4.9, 52.37], algiers: [3.06, 36.75], sale: [-6.8, 34.04], lanzarote: [-13.6, 29.0],
  newamsterdam: [-74.01, 40.70], brooklyn: [-73.95, 40.65], cartagena: [-0.98, 37.6],
};
const pts = Object.fromEntries(Object.entries(places).map(([k, v]) => [k, P(...v)]));
const route = (arr) => arr.map((p) => P(...p));
const out = {
  W, H, EX, land: path(land), graticule: path(grat), pts,
  r1: route([[4.5, 52.42], [3.2, 52.2], [1.6, 51.1], [0.2, 50.3], [-3, 49.7], [-6, 48.5], [-9.6, 44.2], [-10.2, 40], [-9.6, 37.2], [-7.4, 36.3], [-5.6, 35.95], [-3, 36.35], [0, 36.7], [3.06, 36.85]]),
  r2: route([[3.06, 36.85], [0.4, 36.6], [-2.8, 36.2], [-5.6, 35.95], [-6.6, 35.3], [-6.85, 34.15]]),
  r3: route([[-6.85, 34.15], [-9.4, 35.6], [-10.4, 38.5], [-10.1, 42.5], [-7.6, 45.6], [-5.2, 48.4], [-2, 49.9], [1.4, 51.05], [3.4, 52.15], [4.9, 52.4]]),
  rHL: route([[4.5, 52.42], [3.2, 52.2], [1.6, 51.1], [0.2, 50.3], [-3, 49.7], [-6, 48.5], [-9.6, 44.2], [-10.4, 40], [-10.4, 36.5], [-10.2, 33], [-12.2, 30.2], [-13.55, 29.25]]),
  rLA: route([[-13.55, 29.25], [-11.8, 31.2], [-9.9, 34.2], [-7.6, 35.9], [-5.6, 35.95], [-3, 36.35], [0, 36.7], [3.06, 36.85]]),
  teaserAtl: route([[-6.85, 34.15], [-14, 34.6], [-26, 35.6], [-40, 37.2], [-54, 38.8], [-66, 40.0], [-74.01, 40.62]]),
  r4: route([[4.9, 52.4], [3.3, 52.2], [1.4, 51.0], [-1.5, 50.2], [-6, 49.4], [-15, 47.8], [-28, 45.4], [-42, 43.2], [-56, 41.6], [-66, 40.7], [-71, 40.3], [-74.01, 40.62]]),
};
fs.mkdirSync("src/salee", { recursive: true });
fs.writeFileSync("src/salee/mapdata.json", JSON.stringify(out));
console.log(W, H, JSON.stringify(pts));
