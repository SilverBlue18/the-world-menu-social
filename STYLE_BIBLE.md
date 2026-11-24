# House Style: "Map on the Desk" history shorts (channel: The World Menu, @theworldmenu)

> **Superseded for The World Menu (2026-11-24):** the look, palette, fonts, captions and sound below are the old template's. The current look and sound are in `BRAND.md` ("Video look v2: A + B" and "Sound"). This file is kept only for the technical rules that still apply: one continuous camera, Gaussian-smoothed motion, safe zones, QA steps.


This is the approved look of the channel. "The Lost Imam" (`src/imam/`, `out/imam/The_Lost_Imam_FINAL.mp4`) is the reference video: new videos must look, move and sound like it. The topic is **history in general**, not only Islamic history.

## Format
- Vertical 1080×1920, 30 fps, H.264 CRF 15 (`--x264-preset slow`), AAC 256k at 48 kHz, `+faststart`.
- Length: 60–80 s. The voice sets the length exactly.
- One file is used for YouTube Shorts, TikTok and Instagram Reels.

## The world (what's on screen)
- **ONE continuous camera** over one big world. **No scene cuts**: the user found cuts annoying and distracting.
- **The world is an antique map** on parchment, lying on a **dark wooden desk**:
  - Desk: `public/mock/wood.jpg`, tiled at `3200px 5200px`.
  - The parchment sheet has a deep drop shadow and an inset edge burn.
  - The map is a d3-geo Mercator projection of world-atlas `land-50m`, built by `tools/build_map.mjs` (W 6000 × H 4840). The crop and region change per story.
- **Map palette** (from `src/imam/props.tsx`):

  | Name | Hex | Use |
  |---|---|---|
  | INK | `#2a1c11` | Coastlines (4.5 px, opacity .85), main text |
  | SEPIA | `#6b4a2b` | Graticule (dashed 10/8, opacity .32), hatching, subtitles |
  | RED | `#9e2a1f` | Planned route (dashed 34/26), dramatic accents, title word |
  | GOLD | `#e9b45a` | Highlighted words in captions, special route |
  | PAPER | `#efe5cf` | Cards and prints |
  | Land fill | `#b89462` | Land, at opacity .38, plus 35° hatch and a soft sepia coastal glow (strokes 64/44/28/16) |

  The actual voyage is an INK dashed line (16/14) that draws itself behind the ship.
- **Fonts** (in `public/fonts`):
  - Playfair Display 900: titles and big words.
  - Special Elite: city labels, dates, typewriter notes.
  - Oswald 500: letter-spaced small caps tags.
  - Amiri 700: Arabic.
  - Inter 800: English captions.
- **Objects in the world:** real archival photos, portraits, quotes and title cards are dropped onto the map as physical prints/cards at the place where the story happens. They have a shadow and a slight rotation, and they stay there. **ONE hero at a time**: everything else dims (dark layer `#160d05` at .42).
- **Ships:** engraved sailing-ship icons follow the route. They must never pass under or through other objects (such as the compass): route them **around** objects.
- **Never** use stickman or silhouette figures, and never use images that don't match the place being talked about (for example, no Hagia Sophia while the narration is about Brazil). Use only real public-domain archival images: Library of Congress first (curl UA), then Wikimedia.

## Grade ("desk lamp")
- Multiply `#2a1608` at .18.
- Warm screen pool: `radial-gradient(ellipse 72% 46% at 45% 58%, rgba(255,196,120,.24) → 0 at 72%)`.
- Vignette: `radial-gradient(ellipse 85% 62% at 50% 58%, 0 at 42% → rgba(10,4,0,.8))`.
- Film grain overlay at .09 (`public/imam/tex/grain0-11`).
- Top darkening for the captions: `linear-gradient(180deg, rgba(10,4,0,.9) 0%, .6 24%, 0 37%)`.
- Fade in from black over 0.5 s and fade out over the last 1.4 s.

## Camera
- Monotone cubic Hermite keys `{t,x,y,z,r}`; zoom is interpolated in log space. Every frame is precomputed and **Gaussian-smoothed (σ 7 frames camera, σ 6 ships)**. There are no dead stops and no jumps.
- Focus point on screen: **(528, 1090)**. This keeps the hero below the top captions and above the platform UI (y > 1500) and the right-side icons.
- Pattern: wide establishing shot → glide along the route → push in on each object as the narrator says it → pull back to travel. Slight rotation (±3°) for life.
- Ship speed follows `makeEase` (zero velocity at both ends) along one continuous path.

## Captions (top, `TopCaptions` in `src/imam/Short.tsx`)
- Arabic line: Amiri 64 px, `#f2dfb2`.
- English line: Inter 800, 47 px, cream, with the **active spoken word lit up GREEN** (`#7be36a`, soft green glow).
- Optional Oswald tag line for facts: dates, places, sources (for example `MALÊ REVOLT · SALVADOR, BAHIA · 1835`).
- Position y ≈ 250–800, inside the safe zone.
- Caption groups are sentences (start, end, ar, tag, words) in `captions2.json`. Word times come from **forced alignment**: run `python3 tools/align_words.py <voice.wav> <captions.json>`. It aligns the known text against the voice (CTC, torchaudio MMS_FA) and snaps each word to the audio onset after a pause. Target: median error under 25 ms, max under 60 ms. Whisper times alone are 0.1–0.45 s off, so never use them for highlighting.
- The second language is **Arabic by default**. It can change per story if the user asks.

## Voice
- ElevenLabs **"David Tyserre"**, voice_id `iKX6IXB415Hh5bn2eNhP`, model `eleven_multilingual_v2`.
- Settings: stability .55, similarity .75, style .15, speaker boost on, **speed 1.1** (`TTS_SPEED=1.1 scripts/tts.sh`). The API key is injected by the proxy (`xi-api-key: proxy-injected`).
- Foreign words must sound native:
  1. Generate several takes of the line with `previous_text`/`next_text` and seeds (`tools/takes.py`).
  2. Score them with faster-whisper in the word's own language (`tools/score_takes.py`).
  3. Splice the best take in at a silence (`tools/splice_voice.py`).
  4. Spell words phonetically where needed (for example "Malés").
- Tone: calm documentary storyteller. The hook is in the first 2 seconds.

## Sound (`tools/sound_imam.py` + `tools/mix_imam.py`)
- Everything is synthesized, with no stock audio:
  - Music: warm pads plus a plucked oud-like motif (Karplus-Strong, a regional mode, e.g. Hijaz for Middle East) and soft timpani on big moments.
  - SFX on every visual event: paper drops for cards, whooshes for camera flights, pen scratch, stamps, chimes, book thud, ticks for the clock or compass, waves, wind and rain.
- **Calm opening. No loud storm.** Storms stay low-passed and soft.
- Mix:
  - Music −12 dB and SFX −13 dB relative to the voice, with ducking under the voice.
  - Master at **−14 LUFS**, look-ahead limiter at −1.5 dBFS. Keep it even: about −15 to −18 dB in every 3 s window.

## QA before delivery
1. Check stills of every beat (`scripts/stills.mjs`) and contact sheets (`scripts/sheet.py`).
2. Run `scripts/qa.py`: no black or frozen frames. The only allowed jumps are intended flashes.
3. Run the numeric motion analysis of camera and ship (no speed jumps).
4. Check that each key visual lands within 0.3 s of its spoken word.
5. Check that captions never wrap badly and nothing sits in the bottom 420 px or under the right-side icons.

## Watermark
- `src/shared/Watermark.tsx` follows the reference reel: a small, faded, letter-spaced wordmark centred at the **very top** (y≈46), between two hairlines.
- Text: `theworld` in cream plus `menu` in gold, Inter 600 27 px, at opacity .5. It should never pull the eye.
- It fades in at 1.0 to 1.8 s and goes on every video.

## Map extent
- The map must **never show an edge**. `tools/build_map.mjs` outputs `EX`, an extent far larger than the camera ever sees. The parchment (`tex/parchment_big.jpg`) and coastlines fill all of `EX`.
- Check this by computing the camera's visible world rectangle over all frames (see `extent.tsx` in the Lost Imam history).

## Brand
- Logo: an orthographic globe in map style (parchment, hatched land, ink coastlines) with a red dashed route, a red start dot and a gold end dot, framed in a compass ring on a wooden desk.
- Source: `brand/make_logos.mjs`. Banner: `brand/make_banner.mjs`.
