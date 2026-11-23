# Handoff prompt: The World Menu studio (paste everything below into a new Claude Code chat)

---

You are taking over an ongoing project from a previous Claude session. Read this whole prompt before doing anything. Then clone the repo, read its `CLAUDE.md`, `BRAND.md`, `STYLE_BIBLE.md` and `brand/SOCIALS.md`, and continue exactly where the previous session stopped (see "Where we stopped" near the end).

## 1. Who I am and what this is
- I am **Moustapha** (GitHub: **SilverBlue18**). I'm on a Mac (user folder `/Users/moustapha`), timezone Africa/Dakar (UTC+0). I write to you in English, sometimes Italian or French. Keep explanations simple and practical: I'm not a developer.
- I run a new faceless video channel called **The World Menu** (handle **@theworldmenu**) on YouTube (Shorts + long form), TikTok, Instagram Reels and a Facebook Page.
- You make the videos end to end with a Remotion-based studio in my repo: research, fact-check, script, voice (ElevenLabs), visuals, sound effects, captions, render, plus the post texts for every platform.
- **Quality above everything.** I prefer slow and perfect over fast.

## 2. The repo
- **My repo (work only here):** https://github.com/SilverBlue18/the-world-menu-social (private, branch `main`). Clone it: `git clone https://github.com/SilverBlue18/the-world-menu-social` (if it isn't in the session, add it with the repo tool; the Claude GitHub App is installed on my account).
- It started as a copy of the engine from my friend Yasin's private repo `Yasingumus/history-shorts-studio` (a history-shorts studio, brand "The Desk Atlas", @thedeskatlas). **That brand is NOT mine: never use it.** Don't push anything to Yasin's repo. (An old branch `my-channel` exists there from earlier; leave it alone unless I ask.) My copy excludes his finished videos, projects, brand and git history.
- `src/imam/` and `src/salee/` are Yasin's reference projects kept only as **technical templates** for how the engine builds a video (camera, word clock, captions). `src/salee/` is the cleanest. Their content (history topics, desk/parchment look, Arabic captions, music) is not ours.
- Commit and push to `main` of my repo as you go. Commit messages end with the attribution lines your environment asks for. **Never commit API keys, .env files or audio downloaded from YouTube.**

## 3. Restore the studio in a fresh cloud session
The playbook (`CLAUDE.md`, section 0) has the details. In short:
1. `npm ci` (Remotion 4.0.545). Chromium: `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` (set in `remotion.config.ts`).
2. `pip install --break-system-packages faster-whisper numpy scipy pyloudnorm soundfile huggingface_hub transformers torch torchaudio` (torch/torchaudio from **PyPI**, not download.pytorch.org).
3. Models into `bin/` (gitignored), from Hugging Face:
   - `Systran/faster-whisper-small` → `bin/whisper-small-ct2`
   - `Systran/faster-whisper-large-v3` → `bin/whisper-large-v3-ct2` (pronunciation scoring)
   - `jonatasgrosman/wav2vec2-large-xlsr-53-french` → `bin/w2v2-fr` (allow_patterns `*.json`, `*.txt`, `pytorch_model.bin`), used by `tools/align_words_fr.py` for exact word times.
   - Pass decoded numpy audio to faster-whisper (decode with ffmpeg), not a file path: the installed `av` breaks `decode_audio`.
4. Test render: `node scripts/stills.mjs SaleeFlow out/test/f 5 0.4`.
- **Network:** my claude.ai allowed domains include `api.elevenlabs.io`, `huggingface.co`, `*.hf.co`. `download.pytorch.org` was still blocked, which is why we use the French wav2vec2 aligner instead of torchaudio's MMS_FA (`tools/align_words.py` is the old one; don't use it).

## 4. ElevenLabs (my own account)
- **Never ask me to paste the key in chat.** (I once pasted a key by mistake; I was told to revoke it.)
- The key is in a file on my Mac: `/Users/moustapha/Desktop/studio-secrets/elevenlabs_key.txt`. That folder is connected to the chat through the Claude desktop app (device tools `mcp__remote-devices__*`). Stage it with the device-stage tool, then `mkdir -p ~/.secrets && cp <staged> ~/.secrets/elevenlabs_key && chmod 600`. Scripts read `ELEVENLABS_API_KEY` or `~/.secrets/elevenlabs_key`. Never print it, never commit it.
- If the folder isn't connected in the new chat, ask me to add `Desktop/studio-secrets` via **+ → Add folder** in the Claude desktop app. If I need to rewrite the key file, the clipboard method works: copy the key, then in Terminal `pbpaste | tr -d ' \n\r' > ~/Desktop/studio-secrets/elevenlabs_key.txt` (TextEdit didn't work for me).
- My key is a restricted key with Text to Speech + Voices + Models permissions. `/v1/user` calls fail (no user_read); that's fine.
- My plan isn't Creator tier: **use `output_format=mp3_44100_128`** (192 kbps is refused).
- **Narrator: "David Tyserre – Documentary Narrator", voice_id `iKX6IXB415Hh5bn2eNhP`** (native French, calm, wise). Model `eleven_multilingual_v2`; stability 0.55, similarity 0.75, style 0.15, speaker boost on, **speed 1.1**. (Earlier I picked Bill `pqHfZKP75CvOlQylNhV4`, then switched to David Tyserre. David Tyserre is final.)
- **Never time-stretch or speed up the voice afterwards.** If a video is too long, propose sentences to cut.

## 5. The channel (all decided with me)
- **Name:** The World Menu · **Handle:** @theworldmenu (checked free on YouTube; TikTok and Instagram couldn't be checked; fallback `@theworldmenu.fr` or `@theworldmenu_`).
- **Niche:** surprising true stories about food: where a food or recipe really comes from, how it travelled, what it does, and who eats the most of it today.
- **Shorts (daily):** one food, one shocking true fact, ~45–70 s, each a self-contained module.
- **Long form (weekly or every two weeks):** 4–6 related shorts compiled into a list, countdown, ranking or tier list, 8–12 min (e.g. "5 fruits you didn't know could be poisonous"), with an intro hook, short bridges with a running ranking, bonus facts, a final verdict and a comment question.
- **Language:** French, for a **general French-speaking audience worldwide**. **Topic mix: ~80% world food stories, ~20% West African / Senegalese.** Never frame the channel, bios or titles as Senegal-only (I explicitly asked to make it more general).
- **Address the viewer with "tu".**
- **Captions:** French on top (spoken word highlighted in mustard), English translation below.
- **NO MUSIC, EVER (my halal rule).** No melodies, chords, pads, instruments, beats, bells or musical stingers. Only the voice + sound effects + non-melodic natural ambience (paper, whoosh, stamp, pen, pins, waves, wind, cooking sounds like sizzling or grinding). This overrides every music instruction in the old template docs.
- **Hooks must be SHOCKING but true.** Write 4–5 hook options and let me pick before voicing. Fact-check everything against solid sources (academic papers, historians, archives, serious outlets). Record rejected or disputed claims, with reasons, in `projects/<slug>/RESEARCH.md` and tell me.

## 6. Brand (all in the repo: `BRAND.md`, `brand/twm/`, `brand/SOCIALS.md`)
- **Palette "Sahel":** sea `#12474F`, land `#E6C79C`, coast `#7A4E2A`, route red `#C0392B`, night `#0A2E33`, cream `#F7EBD3`, mustard `#F2B134` (highlight).
- **Logo:** "Badge tilted 22°": a sand medallion with a teal ring and compass ticks; the Earth (real d3 orthographic map, West Africa facing, small red route) speared on a teal fork, tilted 22°. Master: `brand/twm/v4_badge_tilt22.svg`, built by `brand/twm_logo.mjs`. **Profile icons never carry text** (I complained when text went over the edges).
- **Type:** "THE WORLD" in Oswald 500 (letter-spaced, mustard) above "Menu" in Playfair Display 900; tagline **"L'histoire de ce qu'on mange"** in Inter 600. Captions in Inter 800 (FR) / Inter 600 (EN). Labels in Special Elite.
- **Kit** (`brand/twm/kit/`, built by `brand/twm_kit.mjs`, rendered with headless Chromium): profile 1080/800/400, YouTube banner 2560×1440 (lockup inside the 1546×423 safe area; world map with routes between many countries, **not** converging on Dakar), Facebook cover 1640×624, horizontal and stacked lockups, transparent 256 px watermark icon. A copy of the kit and `TheWorldMenu_SOCIALS.md` is on my Mac in `Desktop/studio-secrets/TheWorldMenu_kit/`.
- **Video watermark:** `src/shared/Watermark.tsx`: "theworld" cream + "menu" mustard, small, top centre.
- **Bios/setup for each platform:** `brand/SOCIALS.md` (general/worldwide wording).
- **Video look (style frames approved as a direction; built by `brand/twm_frames.mjs`, PNGs in `brand/twm/frames/`):**
  - A **real world map in the Sahel palette** (Mercator, faint graticule, soft coastal glow), with **one continuous camera** (no scene cuts), red dotted routes, red pins with a cream ring, place labels in Special Elite.
  - A soft dark ellipse always sits behind the top caption block so it reads over land; top darkening gradient; vignette.
  - **Opening/thumbnail card:** "UNE HISTOIRE VRAIE" (Oswald, mustard), title in Playfair 900 with one key word in mustard, an English subtitle, and a red **"DOSSIER #NN"** stamp.
  - **Hero objects:** public-domain archival prints on cream cards (Special Elite caption + Oswald source line), slight rotation, deep shadow; one hero at a time. Images: Library of Congress first, then Wikimedia, public domain only, matching the place/era.
  - **End card:** badge + lockup + a mustard "Abonne-toi pour le prochain plat" pill + a teaser for the next video.
- Things I rejected along the way (don't propose again): copying Yasin's look or brand; a Senegal-only focus; music of any kind; the "platter/big shared plate" visual concept (I want the **geographic world map**); text spilling outside the logo circle; my earlier logo sketches that weren't high quality.
- From the old template, still valid: no scene cuts or slide switching, no stickman or silhouette figures, no images that don't match the narrated place, no loud storm at the start, ships never moving through or under objects, no mispronounced foreign words.

## 7. Workflow for every video (my approval steps)
1. I give a topic, story or article (or you propose topics as options).
2. You research and fact-check, write `projects/<slug>/RESEARCH.md`, and give me **4–5 shocking hook options**; I pick one.
3. You write the French script (150–185 words, 60–80 s, short lines, "tu", a punchline at the end) plus the English translation, and `SCRIPT.md`/`BEATS.md` (time → narration → hero object → on-screen text → map place).
4. Voice with `tools/twm_voice.py` (see below), then sound effects. **Send me the audio (voice + SFX mix, MP3) in the chat for approval.**
5. Build the visuals, then render a **low-resolution preview** (`--scale 0.5 --crf 23 --x264-preset veryfast` + audio) and send it to me.
6. Only after my OK: the final render (H.264 CRF 15 `--x264-preset slow`, AAC 256k, `+faststart`; 40–75 min, so run it in the background and tell me), full QA, `POST.md` with titles, descriptions, hashtags and sources for YouTube, TikTok, Instagram and Facebook (Facebook slightly longer, 2–3 hashtags). Send the MP4 uncompressed (display "attach") and store it in `finals/<slug>/<Name>_FINAL.mp4` via Git LFS with a SHA256 file.

### Tools built in this session (in the repo)
- `tools/twm_voice.py <takes|score|assemble> <slug>`: reads `projects/<slug>/narration.txt` (one line per narration line) and optional `voice_cfg.json` (`seeds`, `extra_seeds`, `gaps`, `spell`, `order`). **takes**: one ElevenLabs call per line with previous/next text, several seeds. **score**: Whisper large-v3 in French vs the script; picks the best take (number-vs-word mismatches like "500"/"cinq cents" lower the score slightly and are fine). **assemble**: trim, cap pauses at 0.4 s, each line at −22 LUFS, gaps, writes `public/<slug>/voice.wav` + `projects/<slug>/voice_lines.json`.
- `tools/align_words_fr.py <voice> <captions.json>`: exact word times (French wav2vec2 CTC forced alignment, onset snapping; words without letters like "1493" are placed between their neighbours). Target: the highlighted word hits the spoken word.
- `tools/sfx_lib.py`: a **music-free** SFX library (wind, waves, room tone, creak, whoosh, paper, stamp, pen, slide, pin, tick, sizzle, grind) plus `word_clock(captions.json)` → `wt(word, nth, end=False)` to pin effects (and visuals) to spoken words. The old `tools/sound_imam.py`/`mix_imam.py` contain music; don't use them as they are. A new mixer is still needed (voice + SFX only, SFX about −13 dB under the voice with ducking, master −14 LUFS, look-ahead limiter −1.5 dBFS, even loudness in every 3 s window).

## 8. Where we stopped: video 1 "Le piment" (slug `piment`)
- Topic chosen by me: the chili pepper. **Hook chosen:** "Le pays qui mange le plus de piment au monde… ne l'a découvert qu'il y a cinq cents ans."
- **Done and pushed (commit "Video 1 (piment) WIP …"):**
  - `projects/piment/RESEARCH.md`: sources (PNAS 2007 Perry & Flannery; PNAS 2014 Kraft/Gepts, UC Davis; JSTOR Daily; Britannica; Collingham "Curry" via Time/Dawn; National Geographic/Brian Dott for China 1591; ICAR/Spices Board for India #1 producer/consumer/exporter) and claims left out (Korea/kimchi dating is disputed; Thailand claim too thin; world-share percentages conflict).
  - `projects/piment/narration.txt` (15 lines, 167 words, French) and `english.txt` (line-by-line translation).
  - `projects/piment/voice_cfg.json`, `takes/` (33 David Tyserre takes) + `takes/scores.json` (chosen take per line, all clean).
  - `public/piment/voice.wav`: assembled voice, **65.25 s**; line starts in `projects/piment/voice_lines.json`.
  - `projects/piment/captions.json`: 15 sentence groups, each with `en`, `start`, `end` and `words` [{t, s, e}], aligned to the voice.
- **Next steps:**
  1. Write `tools/sound_piment.py` with `sfx_lib` + the word clock. Planned sound beats: soft room tone/wind at the start (calm); pin + whoosh on "l'Inde"; a big whoosh across the map + pin on "Mexique"; paper drop on "six mille ans"; waves + creak + paper on "1493 … Colomb"; pen scratch on « pimiento »; two stamps on "Mauvais pays, mauvais nom"; waves + pen (route drawing) on "marins portugais"; pin on "Goa"; paper + grind on "poivre noir"; pen (route south→north) on "deux siècles"; whoosh + paper on "Pernambouc"; three ticks or slides on the three "premier"; **sizzle** on "brûle la bouche"; whoosh back to Mexico + soft stamp on the last line; end card.
  2. Write a music-free mixer (`tools/twm_mix.py`), render `public/piment/mix.wav`, and **send me an MP3 of voice + SFX for approval.**
  3. Build the Remotion composition `src/piment/` from the `src/salee/` patterns, in the new look: Sahel map (projection covering Mexico, the Caribbean, Atlantic, West Africa, Lisbon, India/Goa, Brazil/Pernambuco), camera keys and routes pinned to the word clock, title card + "DOSSIER #01" stamp, archival cards (public domain: e.g. early chili engravings, a Columbus portrait, Goa map/print), French/English top captions with the mustard word highlight, watermark, end card. Register it in `src/Composition.tsx`.
  4. Stills QA, then the preview render → send to me → final render + `POST.md` after my OK.
- Later: a reusable template for every short, a template for long-form compilations (tier list / ranking board), and updating `STYLE_BIBLE.md` so it fully describes the new look (right now `BRAND.md` overrides it).

## 9. How to work with me
- Before starting, say in one sentence what you're about to do; keep step-by-step narration short.
- Ask with multiple-choice pop-ups when I need to choose (topics, hooks, colours, voices…), with your recommendation first.
- Show visual options as real rendered images (headless Chromium), not rough sketches; I care about quality.
- Things only I can do (claude.ai settings, adding folders in the desktop app, uploading to social accounts, revoking keys): give me short numbered steps.
- Never use or mention The Desk Atlas brand for my channel. No music. Facts must be true.

---
