# Le piment — stickman bible (The World Menu, video 1, 9:16)

**Logline:** the country that eats the most chili on Earth only met it 500 years ago — the chili's trip from a Mexican field, via Columbus's mistake and Portuguese ships, into every Indian kitchen.
**Tone:** wonder + playful surprise, documentary. "Tu" = the viewer, played by the mustard-hoodie hero. Facts only from `projects/piment/RESEARCH.md`.
**Hero of every shot = the food:** red chili pods (in hands, on plants, in crates on ships, in baskets in Goa), black peppercorns as "before".

## Cast (one signature colour each)
| id | role | outfit | signature | main expressions |
|---|---|---|---|---|
| TOI | "tu", today's eater, opens and closes the story | mustard hoodie | `#F2B134` (brand) | shocked, awe, happy, sweating "cry" |
| COLOMB | Christophe Colomb, 1493 | purple coat | `#8a5ad6` | thinking, smirk, confused |
| MARIN | Portuguese sailor | blue tee + cap | `#3a6ea5` | determined, smile |
| CUISINIERE | cook / vendor in Goa | pink sari + bun | `#f29ac0` | happy, surprised |
| PAYSAN | ancient farmer, Mexico | green headband | `#3fb950` | smile, determined |
Background people (Taíno host, market crowd, sailors) are plain ink.

## Locations
| set | mood | key light | props / layers |
|---|---|---|---|
| indiaMarket | golden | low sun at the end of the street | chili mountains in baskets, spice sacks, awnings, crowd, hanging chili strings fg (blurred) |
| kitchen | interiorWarm | window + cooking fire | clay pots, pan of red curry, grinding stone, peppercorn jar, steam |
| mexField | golden / dusk | setting sun behind hills | rows of chili plants with red pods, stone hoe, mountains, dust |
| sea (3D) | dusk | sun on the horizon | caravel / carrack with chili crates, waves, gulls |
| beach | day | high sun | palms, Taíno hut, chili bush, Columbus's boat on the sand |
| blueprint | void | — | navy grid map: Lisbon → African coast → Goa; India south → north |
| goaHarbour | dusk | lantern + sunset | ship at the quay, chili baskets, palms, warehouse |
| chiliFieldsToday | day | sun | red drying carpets of chilies, trucks, sacks |

## Motifs
- **The chili glows** with a soft red halo whenever it changes hands (field → ship → kitchen → plate).
- **Black peppercorn** = "the old heat"; shown grey-black, always next to the chili for comparison.
- **Gold numbers** for every number said (500 ANS, 6 000 ANS, 1493, XVIe SIÈCLE, 2 SIÈCLES, 1er ×3).
- Freeze-frame once: "Mauvais pays, mauvais nom" (Columbus frozen, coral crosses).

## Sound plan
**NO MUSIC (channel rule).** Voice + recorded SFX + natural ambience only: market murmur, field wind, sea and wooden ship, kitchen sizzle, harbour. Use the channel's screened recorded library (`sfx_lib/mixkit`, APPROVED list) instead of tonal synth sounds (no ding / shimmer / stinger / riser / powerup).

## Overlays (done in Remotion on top of the stickman render)
French captions on top with the spoken word in mustard + English below (`TwmCaptions`), `Watermark` at the top centre, end card "Abonne-toi pour le prochain plat". Stickman scenes keep the bottom ~28% of the frame free for captions.

## Custom style
The brand style "sahel" lives in engine/styles.js (studio, not in Git). A copy is in story/style_sahel.js.txt: paste it into STYLES after a plugin update.

## Brand fonts in the studio
engine/player.js also loads Oswald 500/700 and Inter 600/800 from node_modules/@fontsource/brand/ (copied from public/fonts). Re-add after a plugin update.
