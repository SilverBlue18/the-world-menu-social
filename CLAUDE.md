# The World Menu studio: playbook for Claude

**Channel name: The World Menu** (handle `@theworldmenu` on YouTube, TikTok, Instagram and a Facebook Page).

### Channel concept (The World Menu)
- **Niche:** surprising truths about food: where a food or recipe really comes from, what it does, and who eats the most of it today.
- **Shorts (daily):** one food, one shocking true fact, 45–70 s. Each short is built as a self-contained module.
- **Long form (weekly or every two weeks):** 4–6 related shorts packaged as a list, ranking, countdown or tier list, 8–12 min (e.g. "5 Fruits You Didn't Know Could Be Poisonous"). Add an intro hook, short bridges with a running ranking, bonus facts, a final verdict and a comment question.
- **Language: French**, for a Senegalese / West African francophone audience. Narration, captions, on-screen text and post texts in French. Voice: **Bill speaking French** (the user's choice; see `BRAND.md`). Second caption line: to be decided (none, English, or Wolof only if a native speaker checks it).
- **Audience angle:** mix world food truths with West African and Senegalese foods (thiéboudienne, yassa, mafé, bissap, café Touba, baobab, fonio, peanuts, rice) so viewers see their own plate in the stories.
- **Look:** a new food-themed look is still to be designed. Until then the map-on-desk house style below is the technical reference only.
- **Voice:** Bill (`pqHfZKP75CvOlQylNhV4`) speaking French, speed 1.1; score takes in French; address the viewer with "tu". **Captions:** French + English (see `BRAND.md`).
- **NO MUSIC, EVER** (the user's halal rule): no melodies, chords, pads, instruments or beats. Only voice + sound effects + non-melodic ambience. This overrides every music instruction below.
- The rest of this playbook (fact-checking, shocking hook, voice pipeline, QA) applies, except where `BRAND.md` says otherwise.

The user runs **The World Menu**, a food-truths channel on YouTube (Shorts + long form), TikTok, Instagram Reels and Facebook Reels. They paste a topic, transcript, article or story into the chat, and **Claude makes the whole video**: script, voice, visuals, sound and the final MP4, plus the post texts.

**Quality above everything.** The user explicitly prefers slow and perfect over fast.

The look is fixed: read **`STYLE_BIBLE.md`** before anything else. Reference videos:
- "The Lost Imam" (`src/imam/`).
- **"Anthony the Turk" (`src/salee/`)**: the cleanest template to copy. It is built directly on voice word times, with no warp.

## 0. Fresh cloud session? Restore the studio first
1. `npm ci` (Remotion 4.0.545). Chromium is at `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` (set in `remotion.config.ts`).
2. `pip install faster-whisper numpy scipy pyloudnorm soundfile` if missing.
3. Download the Whisper models if `bin/` is missing them:
   - `python3 -c "from huggingface_hub import snapshot_download as s; s('Systran/faster-whisper-small', local_dir='bin/whisper-small-ct2')"`
   - The same for `Systran/faster-whisper-large-v3` into `bin/whisper-large-v3-ct2`, which is needed for Dutch and other non-English sources and for pronunciation scoring.
   - Pass decoded audio (numpy) to `transcribe()`, not a file path: the installed `av` version breaks path decoding.
   - Also `pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu` for forced alignment.
4. Check that the ElevenLabs key works: a request to api.elevenlabs.io with `xi-api-key: proxy-injected`. If it fails, read it from the user's connected folder `studio-secrets/elevenlabs_key.txt` (stage it, copy to `~/.secrets/elevenlabs_key`, chmod 600, send it as the `xi-api-key` header from scripts). **Never print the key, never commit it, never ask for it in chat.**

## 1. From story to script
- **The hook must always be SHOCKING** (the user's standing rule). The first line, under 3 s, has to make people stop scrolling: the craziest true contrast in the story (famous descendants, an impossible journey, an identity twist). Write 4–5 hook options and let the user pick before voicing. Shocking, but never false: check the hook against the sources (e.g. "first known Muslim landowner" yes, "first Muslim in America" no).
- **Fact-check.** Use only claims supported by a solid source: an article by historians, archives, academic work. YouTube and podcast sources often dramatize. List every claim you leave out, with the reason, in `projects/<slug>/RESEARCH.md`, and tell the user.
- Write the narration at 150–185 words for 60–80 s. Use short sentences, one idea per line, and a payoff at the end.
- Note the source in a final tag line (for example `SOURCE: …`).
- Write `projects/<slug>/SCRIPT.md`, `narration.txt` and `BEATS.md`. The beat table has: time → narration → the one hero object → on-screen text → map place.
- Make a list of foreign names and words and their languages, for pronunciation.
- Show the user the script and beat table. If they asked for full autopilot, continue.

## 2. Voice
- Use Bill, with the Salee pipeline (best so far):
  1. `tools/salee_takes.py`: one TTS call per line, with previous_text/next_text. Lines with foreign names get spelling variants × seeds 11/29.
  2. `tools/salee_score.py`: Whisper large-v3 transcribes each take in English **and** in the name's own language (nl/tr/fr/ar/pt...). Pick the highest score.
  3. `tools/salee_assemble.py`: trim each line, cap internal pauses at 0.3 s, level every line to −22 LUFS, then add the gaps between lines.
  4. **NEVER time-stretch or speed up the voice afterwards** (rubberband, atempo and the like). The user heard it immediately as an echo or "AI" sound. Use the voice exactly as ElevenLabs generates it (speed 1.1). If it's too long, propose sentences to cut and let the user choose.
  5. Send the user the audio preview (voice + mix as MP3) **in the chat** before rendering. They approve the audio first.
  6. Then render a **preview** first (`--scale 0.5 --crf 23 --x264-preset veryfast`, plus audio) and send it in the chat. Do the full-quality render only after the user approves the preview.
- **Music:** NOT USED on this channel (see top). Old note from the template, ignore: never stack short chord changes (under ~3 s each) during fast sequences of events; use one or two long, overlapping chords (attack 1.5 s or more). The user hears rapid pad changes as "weird".
- **Word clock pitfall:** every time narration changes, re-check the nth occurrence of common words ("then", "and", "muslim", "dutch") in both `Salee.tsx` and `sound_<slug>.py`; a new sentence shifts the counts.
- **Pacing:** the title card ("A TRUE STORY / <TITLE>") must stay on screen about 2.5–3 s, as in The Lost Imam, because it doubles as the thumbnail. Give life events (birth, marriage, voyages) breathing room: 1–1.3 s gaps and slower ship legs. Don't rush them.
- Get word timings with `scripts/transcribe.sh` (faster-whisper small) for the rough text. Then **always** run `tools/align_words.py` on the captions JSON for exact word times, because the green highlight must hit each word. Needs `pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu`.

## 3. Visuals: copy `src/imam/` to `src/<slug>/` and adapt
- `tools/build_map.mjs`: set the projection and crop for the region of the story. Add the places and routes.
- **Word clock** (see `src/salee/Salee.tsx`): `wt("word", nth)` returns the aligned time of a spoken word. Pin every card drop, stamp, pen stroke, camera key and ship leg to it, so visuals land exactly on the word. `tools/sound_salee.py` uses the same word clock for the SFX.
- `Imam.tsx`: change the camera keys, routes, ship (or train/caravan/army icon, if the story is on land), labels and OBJECTS (cards and prints). Time everything to the voice word times; use `makeWarp` only if retiming an old layout.
- Get archival images from the Library of Congress first, then Wikimedia. Use only public domain, and only images that match the place and time being narrated.
- Captions: build `captions2.json` (sentence groups with Arabic translation, a tag and word times), then use `TopCaptions` in a `MapFlow.tsx`-style composition. Register it in `src/Composition.tsx`.
- Always include `<Watermark />` from `src/shared/Watermark.tsx` (subtle `theworldmenu` wordmark centred at the top).
- Keep the desk, parchment, palette, fonts, grade, grain and top caption layout **identical**.

## 4. Sound
- Copy `tools/sound_imam.py` to `tools/sound_<slug>.py`. Place SFX at the object and camera event times. Do NOT generate any music (no `music.wav`); SFX and ambience only.
- Keep the opening calm.
- Then run `python3 tools/mix_imam.py -12 -13 /home/user/studio/public/<slug>/` to get −14 LUFS. Check every 3 s window: they should be even, within about 2 dB.

## 5. QA and render
- Do the full QA from STYLE_BIBLE.md.
- Render, then mux:
  - `npx remotion render src/index.ts <Comp> out/<slug>/video.mp4 --codec h264 --crf 15 --x264-preset slow --concurrency 4 --muted`
  - Then ffmpeg the mix in as AAC 256k with `+faststart`.
  - A full render takes 40–75 minutes here. Run it in the background and tell the user.
- Don't commit source audio from YouTube (`projects/*/source.wav`) or intermediate stems (see `.gitignore`).
- Send the MP4 with `SendUserFile` and write `projects/<slug>/POST.md`: titles, descriptions, hashtags and sources for YouTube, TikTok, Instagram and Facebook (Facebook usually gets the Instagram caption by crosspost, but write a Facebook version too: slightly longer, 2–3 hashtags).

## 6. Save and deliver (never compress the final video: the user wants original quality)
- Send the original MP4 in the chat with `SendUserFile` (display "attach") so the user can download it.
- Store it byte-for-byte in this repo with Git LFS (already set up in `.gitattributes` for `finals/**/*.mp4`): copy it to `finals/<slug>/<Name>_FINAL.mp4`, add a `SHA256` file, commit and push. The user downloads it from GitHub with "Download raw file". (The chat file card may fail to download large files.)
- Google Drive uploads from a cloud session are capped at about 3 MB, so only small text files (post texts, docs) go in the Drive folder "History Shorts".
- Commit and push code, docs and the project folder.

## Things the user has rejected (don't do again)
- Scene cuts or slide switching: use one continuous camera only.
- Stickman or silhouette figures.
- Copying the colors of reference videos.
- Images that don't match the narrated place.
- A loud storm at the start.
- Ships moving through or under objects.
- Mispronounced foreign words.

## Pending
- Brand kit for The World Menu is in `BRAND.md` and `brand/twm/kit/` (logo, profile pictures, lockups, banners). Bios still to be written. Never use the old "The Desk Atlas" brand (another channel).
