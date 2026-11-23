import { geoOrthographic, geoMercator, geoPath, geoGraticule10 } from "d3-geo";
import * as topo from "topojson-client";
import { readFileSync, writeFileSync } from "fs";
const w = JSON.parse(readFileSync("node_modules/world-atlas/land-50m.json"));
const land = topo.feature(w, w.objects.land);
const out = {};
const ortho = geoOrthographic().rotate([20, -25]).scale(300).translate([300, 300]).clipAngle(90);
const p = geoPath(ortho);
out.globeLand = p(land); out.globeGrat = p(geoGraticule10()); out.globeSphere = p({ type: "Sphere" });
// Mercator strip for banner: Atlantic + Med + Indian
const merc = geoMercator().center([10, 25]).scale(560).translate([1280, 720]);
const pm = geoPath(merc);
out.bannerLand = pm(land); out.bannerGrat = pm(geoGraticule10());
const pt = (lon, lat) => merc([lon, lat]);
out.bannerPts = { istanbul: pt(29, 41), rio: pt(-43.2, -22.9), cadiz: pt(-6.3, 36.5), london: pt(-0.1, 51.5), alexandria: pt(29.9, 31.2), lisbon: pt(-9.1, 38.7) };
writeFileSync("brand/geo.json", JSON.stringify(out));
console.log(Object.keys(out), out.globeLand.length);
