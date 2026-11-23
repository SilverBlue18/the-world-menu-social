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
- **Never use music of any kind**: no melodies, chords, pads, instruments, beats or musical stingers.
- Sound = the voice + **sound effects and natural ambience only**: paper, whoosh, stamp, pen, map unfold, pins, cooking sounds (sizzle, pouring, chopping, boiling), market crowd, sea and wind, footsteps, coins.
- Ambience stays low and non-melodic; effects land on the visual events.

## Video look (style frames, `brand/twm/frames/`, built by `brand/twm_frames.mjs`)
- World map in the Sahel palette (Mercator, graticule, soft coastal glow), one continuous camera; red dotted routes and red pins (cream ring) for places; place labels in Special Elite.
- Top captions: French in Inter 800 58 px cream, spoken word in mustard with a soft glow; English below in Inter 600 36 px sand; optional Oswald tag line in mustard. A soft dark ellipse always sits behind the caption block so it reads over land.
- Opening/thumbnail: "UNE HISTOIRE VRAIE" (Oswald) + title in Playfair 900 with one key word in mustard + English subtitle + red "DOSSIER #NN" stamp.
- Hero objects: public-domain archival prints on cream cards (Special Elite caption + Oswald source line), slight rotation, deep shadow.
- End card: badge + lockup + mustard "Abonne-toi" pill + teaser of the next video.
- Watermark: "theworld" cream + "menu" mustard, top centre.
- Social bios and setup: `brand/SOCIALS.md`.
