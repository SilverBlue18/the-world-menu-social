import os as _os
def _eleven_key():
    # Key from env or ~/.secrets/elevenlabs_key (never committed, never printed).
    k = _os.environ.get("ELEVENLABS_API_KEY")
    if not k:
        with open(_os.path.expanduser("~/.secrets/elevenlabs_key")) as f: k = f.read().strip()
    return k

"""Salee voice: every line generated separately with prev/next context; lines with foreign names get several spelling variants x seeds."""
import json, os, sys, urllib.request
ROOT = "/home/user/studio/projects/salee"
LINES = [l.strip() for l in open(f"{ROOT}/narration.txt") if l.strip()]
VOICE = "pqHfZKP75CvOlQylNhV4"
def tts(text, prev, nxt, out, seed):
    if os.path.exists(out): return
    body = {"text": text, "model_id": "eleven_multilingual_v2", "previous_text": prev, "next_text": nxt, "seed": seed,
            "voice_settings": {"stability": 0.55, "similarity_boost": 0.75, "style": 0.15, "use_speaker_boost": True, "speed": 1.1}}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"xi-api-key": _eleven_key(), "Content-Type": "application/json"})
    open(out, "wb").write(urllib.request.urlopen(req, timeout=180).read())
VARIANTS = {
    0: [LINES[0], 'In 1639, a Dutch map of Manhattan lists a farm owned by "Antonee duh Turk." Anthony the Turk.'],
    2: [LINES[2], "His father, Yahn Yahnsone, was a privateer from Haarlem.", "His father, Jan Jansoon, was a privateer from Haarlem."],
    3: [LINES[3], "Captured by Barbary corsairs, he became a Muslim, and took a new name: Moorad Rah-eess.", "Captured by Barbary corsairs, he became a Muslim, and took a new name: Murad Rayis."],
    4: [LINES[4], "From Sah-lay, in Morocco, he commanded the feared Sah-lay Rovers.", "From Salay, in Morocco, he commanded the feared Salay Rovers."],
    6: [LINES[6], "Then he crossed the ocean with his wife, Greet-yuh, to a tiny Dutch colony: New Amsterdam. Today, New York.", "Then he crossed the ocean with his wife, Greetya, to a tiny Dutch colony: New Amsterdam. Today, New York."],
}
SEEDS = {k: (11, 29) for k in VARIANTS}
for li, text in enumerate(LINES):
    prev = " ".join(LINES[max(0, li - 2):li]); nxt = LINES[li + 1] if li + 1 < len(LINES) else ""
    variants = VARIANTS.get(li, [text])
    for vi, v in enumerate(variants):
        for seed in SEEDS.get(li, (11,)):
            out = f"{ROOT}/takes/L{li:02d}_v{vi}_s{seed}.mp3"
            tts(v, prev, nxt, out, seed); print("ok", out, flush=True)
