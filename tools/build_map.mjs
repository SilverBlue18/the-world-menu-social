import fs from "node:fs";
import { geoMercator, geoPath, geoGraticule } from "d3-geo";
import { feature } from "topojson-client";
const topo = JSON.parse(fs.readFileSync("node_modules/world-atlas/land-50m.json", "utf8"));
const land = feature(topo, topo.objects.land);
const W = 6000;
const bounds = { type: "Feature", geometry: { type: "MultiPoint", coordinates: [[-62, -40], [64, 50]] } };
const proj = geoMercator().fitWidth(W, bounds);
const [[, y0], [, y1]] = geoPath(proj).bounds(bounds);
const H = Math.ceil(y1 - y0);
proj.translate([proj.translate()[0], proj.translate()[1] - y0]);
// extended extent: the map continues well past anything the camera sees, so no edge is ever visible
const EX = { x0: -1500, y0: -2600, x1: 7500, y1: 6400 };
proj.clipExtent([[EX.x0, EX.y0], [EX.x1, EX.y1]]);
const path = geoPath(proj);
const grat = geoGraticule().step([10, 10]).extent([[-100, -70], [100, 80]])();
const P = (lon, lat) => proj([lon, lat]).map((v) => Math.round(v * 10) / 10);
const places = {
  istanbul: [28.98, 41.01], basra: [47.8, 30.5], mallorca: [2.9, 39.6], cadiz: [-6.29, 36.53],
  gibraltar: [-5.6, 35.95], capeverde: [-23.6, 15.1], rio: [-43.17, -22.9], salvador: [-38.5, -12.97],
  recife: [-34.88, -8.05], suez: [32.55, 29.97], capetown: [18.42, -33.92], lagos: [3.4, 6.45], damascus: [36.3, 33.5],
};
const pts = Object.fromEntries(Object.entries(places).map(([k, v]) => [k, P(...v)]));
// sea route as lon/lat waypoints -> projected
const route = (arr) => arr.map((p) => P(...p));
const out = {
  W, H, EX, land: path(land), graticule: path(grat), pts,
  routeActual: route([[28.98, 41.01], [26.5, 40.2], [25.5, 37.5], [20, 36.3], [11.5, 37.6], [2.9, 39.0], [-2.5, 36.4], [-6.29, 36.53],
    [-9.5, 33], [-15, 25], [-20.5, 17], [-23.6, 15.1], [-28, 9], [-31, 0], [-33.5, -9], [-37, -17], [-43.17, -22.9]]),
  routePlanned: route([[-23.6, 15.1], [-17, 5], [-5, -5], [5, -18], [12, -30], [18.42, -35.2], [26, -36], [35, -30], [41, -22], [44, -12],
    [51, -3], [56, 8], [58, 18], [57, 24], [53, 26.5], [49.5, 29], [47.8, 30.5]]),
  coastal: route([[-43.17, -22.9], [-40.5, -21.5], [-39.3, -17.5], [-38.5, -12.97], [-37, -10.5], [-34.88, -8.05]]),
  // lat/lon labels
  latLabels: [-30, -20, -10, 0, 10, 20, 30, 40].map((lat) => ({ lat, y: P(0, lat)[1] })),
};
fs.writeFileSync("src/imam/mapdata.json", JSON.stringify(out));
console.log(W, H, JSON.stringify(pts));
