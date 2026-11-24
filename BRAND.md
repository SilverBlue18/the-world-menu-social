# The World Menu: brand (work in progress)

Channel: **The World Menu** (@theworldmenu). Language: French, for a general French-speaking audience worldwide. Topic mix: ~80% world food stories, ~20% West African / Senegalese.
Visual world: a **geographic world map** (the Earth), one continuous camera, food stories travelling across it.

## Palette: "Sahel" (chosen by the user, 2026-11-23)
| Name | Hex | Use |
|---|---|---|
| Mer (sea) | `#12474F` | Ocean / background |
| Sable (land) | `#E6C79C` | Land fill |
| Terre (coast) | `#7A4E2A` | Coastlines, borders, small labels |
| Rouge route | `#C0392B` | Routes, place dots, accents |
| Nuit (caption band) | `#0A2E33` | Darkening band behind the top captions |
| Crème (text) | `#F7EBD3` | Caption text, light text |
| Moutarde (highlight) | `#F2B134` | The spoken word in captions, key numbers |

## Logo (chosen 2026-11-23)
**Badge, tilted 22°**: a sand medallion with a teal ring and compass ticks; the Earth (West Africa facing, red route to Dakar) speared on a teal fork, tilted 22°.
- Master: `brand/twm/v4_badge_tilt22.svg` (built by `brand/twm_logo.mjs`).
- Profile icons never carry text. The name lives only in the lockups.

## Typography
- Name: "THE WORLD" in Oswald 500 (letter-spaced, mustard/red) above "Menu" in Playfair Display 900 (cream/teal).
- Tagline: "L'histoire de ce qu'on mange", Inter 600.

## Brand kit (`brand/twm/kit/`, built by `brand/twm_kit.mjs`)
- `TheWorldMenu_profile_1080/800/400.png`: profile picture, all platforms (round-safe).
- `TheWorldMenu_youtube_banner_2560x1440.png`: lockup inside the 1546×423 all-device safe area; Dakar visible with routes from the world.
- `TheWorldMenu_facebook_cover_1640x624.png`
- `TheWorldMenu_lockup_horizontal_dark.png`, `..._light.png`, `TheWorldMenu_lockup_stacked_dark.png`: name lockups (end cards, thumbnails, docs).
- `TheWorldMenu_watermark_icon_256.png`: transparent icon for video corners.

## Voice and writing (chosen 2026-11-23)
- Narrator: **David Tyserre – Documentary Narrator** (ElevenLabs voice_id `iKX6IXB415Hh5bn2eNhP`, native French, calm and wise), chosen by the user 2026-11-23. Model `eleven_multilingual_v2`; stability .55, similarity .75, style .15, speaker boost on, **speed 1.1**. (Bill was chosen first, then replaced by this voice.)
- Run every line through the takes + Whisper-scoring pipeline in French and pick the cleanest take. Never time-stretch.
- Address the viewer with **"tu"** ("Tu manges ça tous les jours… mais tu sais d'où ça vient ?").
- Captions: **French on top, English below** (spoken French word highlighted in mustard `#F2B134`).

## Sound: NO MUSIC (user's firm rule, halal)
- **Never use music of any kind**: no melodies, chords, pads, instruments, beats, bells or musical stingers.
- Sound = the voice + **real recorded sound effects and natural ambience** (approved 2026-11-24, "premium" sound): layered whooshes, pops, punches/impacts, clicks, pencil, paper, cooking sounds (frying, spice jar), sea, wooden ship, wind, breeze.
- Library: `sfx_lib/mixkit/` + `tools/sfx_samples.py`. Only ids in `APPROVED` (each screened for tonal/musical content). Synthesized effects (`tools/sfx_lib.py`) sounded cheap: use them only for the word clock.
- Build every effect from 2–3 layers (body + top + transient), put them in the shared room (`space()`), spread them in stereo, and pin them to words with `word_clock`. Reference: `tools/sound_piment.py`.
- Mix with `tools/twm_mix.py <slug> --amb -22`: SFX −13 LU and ambience −22 LU under the voice, ducked; master −14 LUFS, limiter −1.5 dBFS.

## Video look v3: GrowKaz Stickman, "Sahel" style (approved 2026-11-24, replaces v2)
Stick figures with rim light in moody flat-shaded sets, graded with the custom "sahel" style (teal shadows, sand light, mustard numbers, red accents; copy in `growkaz-stickman-studio/projects/piment/story/style_sahel.js.txt`). Main character: mustard `#F2B134` hoodie. Food is the hero of every shot. Maps use real Natural Earth coastlines in brand colours. On-screen text in Oswald/Inter. FR/EN captions at the bottom. Reference: video 1 `finals/piment/Le_Piment_Stickman_FINAL.mp4`.

## Video look v2: "A + B" (superseded) (approved 2026-11-24; the first map/parchment look was rejected)
The food is the star. One continuous shot, no hard cuts. Reference: `src/piment/Piment.tsx`; concept frames: `src/concepts/Concepts.tsx`.
- **A, the food on colour:** a big cut-out food photo (public domain / CC0, background removed with `rembg`) on a bold radial colour field (red, teal, green, ochre, gold, night). Bold kinetic type: Oswald 700 for big words and numbers ("PAS INDIEN ?!", "6 000 ANS"), mustard pills for dates/places, red slam banners for punchlines.
- **B, the globe stage:** the orthographic Earth from the logo (Sahel colours, cream ring, soft mustard glow, stars behind). It spins to each place; red pins with a mustard pulse and Oswald labels; red dotted routes draw themselves; the hero food rides the head of the route.
- **Continuity:** the globe never disappears: it grows into the stage (B) or shrinks into a small chip with the place name (A, bottom left above the UI zone). The colour field slides between scenes. All motion is keyed and Gaussian-smoothed.
- **Captions:** French on top (Inter 800, spoken word in mustard), English below (Inter 600); a soft black shade behind them; hidden during the 3 s opening title, which doubles as the thumbnail.
- **Never again:** parchment maps, archival prints on cards, rubber stamps, typewriter labels (too close to the other channel, "too historic").
- **End card:** badge + lockup + mustard "Abonne-toi pour le prochain plat" pill + a teaser for the next video. Watermark at the top centre.
- **Food photos:** Wikimedia Commons CC0 / public domain first (use the cached `/thumb/…/1920px-` URLs: originals get rate-limited); record sources in `public/food/SOURCES.md`.
- Social bios and setup: `brand/SOCIALS.md`.
