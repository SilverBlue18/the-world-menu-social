// cast.js — one outfit per recurring character. Signature colour = identity; keep it identical in every shot.
// Food is the hero of every shot: the red chili (#d93a2b pod, green stem) is drawn by sets/food.js, never worn.
export const TOI = { top: 'hoodie', color: '#F2B134', head: 'none' };                       // "tu", the viewer: brand mustard
export const COLOMB = { top: 'suit', color: '#8a5ad6', head: 'none' };                      // Christophe Colomb: royal purple coat
export const MARIN = { top: 'tshirt', color: '#3a6ea5', head: 'capBack', headColor: '#3a6ea5' }; // Portuguese sailor: blue
export const CUISINIERE = { top: 'dress', color: '#f29ac0', head: 'bun' };                  // cook / vendor in Goa: pink sari
export const PAYSAN = { top: 'none', head: 'headband', headColor: '#3fb950' };              // ancient Mexican farmer: green headband
export const CAST = [TOI, COLOMB, MARIN, CUISINIERE, PAYSAN];
