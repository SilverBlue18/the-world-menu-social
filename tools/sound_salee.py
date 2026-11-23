"""Score + SFX for 'Anthony the Turk' (house style: calm, synthesized, every sound on a visual event).
Writes public/salee/music.wav and sfx.wav; then run: python3 tools/mix_imam.py -12 -13 /home/user/studio/public/salee/"""
import json, re
import numpy as np
import soundfile as sf
# reuse the instruments of the house sound kit
_src = open("/home/user/studio/tools/sound_imam.py").read()
exec(_src.split("# ---------------- score ----------------")[0])
exec("def slide" + _src.split("def slide")[1].split("sfx = np.zeros")[0])
ROOT = "/home/user/studio/public/salee"
DUR = 87.0; N = int(SR * DUR)
caps = json.load(open("/home/user/studio/src/salee/captions.json"))
HOOK_N = 2  # the first caption groups are the hook; the story's word clock starts after it
WORDS = [(re.sub(r"[^a-z0-9']", "", w["t"].lower()), w["s"]) for c in caps[HOOK_N:] for w in c["words"]]
HW = {re.sub(r"[^a-z0-9']", "", w["t"].lower()): w["s"] for c in caps[:HOOK_N] for w in c["words"]}
def wt(word, nth=1): return [s for n, s in WORDS if n == word][nth - 1]
def place(buf, x, t, gain=1.0, pan=0.0):
    i = T(t)
    if i >= len(buf) or i < 0: return
    x = x[: len(buf) - i]; l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buf[i:i + len(x), 0] += x * gain * l * 1.414; buf[i:i + len(x), 1] += x * gain * r * 1.414
W = {k: wt(*v) if isinstance(v, tuple) else wt(v) for k, v in {
    "lists": "lists", "antoni": "antoni", "turck": "turck", "in1": ("in", 1), "his1": ("his", 1), "father": "father",
    "truce": "1609", "south": "south", "shipwrecked": "shipwrecked", "rescued": "rescued", "sleyman": "sleyman",
    "joined": ("joined", 1), "muslim1": ("muslim", 2), "corsairs": "corsairs", "captain": "captain", "murad": "murad", "son1": ("son", 1), "sale": "sal",
    "then": ("then", 2), "amsterdam1": ("amsterdam", 1), "with1": ("with", 1), "grietje": "grietje", "amsterdam2": ("amsterdam", 2),
    "dutch4": ("dutch", 3), "banished": "banished", "given": "given", "turks": "turk's",
    "y1674": "1674", "quaker": "quaker", "persecuted": "persecuted", "fined": "fined",
    "under": "under", "christians": "christians", "son2": ("son", 2), "written": "written", "maps": "maps"}.items()}

# ---------------- score: D minor world, a Moroccan (hijaz) colour for Algiers and Salé ----------------
music = np.zeros((N, 2))
D2 = 38
def chord(notes, start, dur, gain, bright=900, pan=0.0, a=2.0, r=3.0):
    place(music, reverb(pad([hz(m) for m in notes], dur, bright, a, r), 3, 0.35, seed=start), start, gain, pan)
def motif(start, notes, step=0.36, gain=0.3, pan=-0.2, bright=0.6, dur=2.0):
    for i, m in enumerate(notes):
        if m is None: continue
        place(music, reverb(pluck(hz(m), dur, bright), 1.8, 0.3, seed=i), start + i * step, gain, pan)
# the hook: low drone, a hijaz pluck run toward Morocco, a soft hit on "admiral", a rising swell across the ocean
place(music, drone(hz(D2), W["in1"] + 1.0, a=0.4, r=1.5), 0.0, 0.3)
chord([51, 58, 62, 66], 0.1, HW["son"] + 0.3, 0.2, 900)               # Eb/D hijaz colour under the hook
motif(HW["pirate"], [62, 63, 66, 67, 69], step=0.28, gain=0.26)
place(music, reverb(timpani(hz(D2 - 12) * 2, 2.5, 0.6), 2, 0.3), HW["admiral"], 0.5)
chord([50, 57, 62, 66, 69], HW["son"] - 0.1, 3.4, 0.24, 1500, a=1.2, r=1.5)  # D major swell: Brooklyn
chord([50, 57, 62, 65], W["in1"] - 0.3, W["his1"] - W["in1"] + 0.6, 0.2, 700)  # Dm: the map, a mystery
chord([53, 60, 65, 69], W["his1"] - 0.2, W["truce"] - W["his1"] + 0.3, 0.28, 1300)  # F: the Dutch father
chord([50, 57, 62, 65], W["truce"] - 0.1, W["shipwrecked"] - W["truce"] + 0.2, 0.26, 900)  # Dm: 1609, sailing south
chord([45, 52, 57, 60], W["shipwrecked"] - 0.1, W["rescued"] - W["shipwrecked"] + 0.4, 0.3, 600)  # Am low: the wreck
chord([51, 58, 62, 66], W["rescued"] - 0.1, W["son1"] - W["rescued"] + 0.2, 0.30, 1000)  # Eb (hijaz): rescued, Algiers
# Salé → Amsterdam → the ocean → New Amsterdam: two long, overlapping chords instead of four short ones (no rapid changes)
chord([50, 57, 62, 66], W["son1"] - 0.2, W["with1"] - W["son1"] + 1.2, 0.30, 1100, a=1.5, r=2.2)   # D with F#: Salé, Amsterdam
chord([53, 60, 65, 69], W["with1"] - 0.4, W["dutch4"] - W["with1"] + 1.0, 0.29, 1300, a=1.8, r=2.2)  # F: the crossing, Grietje, New Amsterdam
chord([50, 57, 62, 65], W["dutch4"] - 0.1, 6.6, 0.28, 900)           # Dm: "the Turk"
chord([45, 52, 57, 60], W["banished"] - 0.6, 4.4, 0.32, 700)         # Am low: banished
chord([53, 60, 65, 69], W["turks"] - 0.3, 4.2, 0.30, 1300)           # F: the farm, prosperity
chord([48, 55, 60, 63], W["y1674"] - 0.1, W["under"] - W["y1674"] + 0.2, 0.28, 900)            # Cm: the persecuted Quaker
chord([50, 57, 62, 66], W["under"] - 0.1, W["son2"] - W["under"] + 0.2, 0.30, 1200)           # D (hijaz colour): protected minorities
chord([50, 57, 62, 66, 69], W["son2"] - 0.1, 87 - W["son2"], 0.34, 1500, a=1.5, r=4.5)  # D major: the ending
place(music, drone(hz(D2), 87 - 46, a=4, r=6), 46.0, 0.3)
for tt, g in [(W["shipwrecked"], 0.8), (W["banished"], 0.9), (W["son2"], 0.5)]:
    place(music, reverb(timpani(hz(D2 - 12) * 2, 2.5, g), 2, 0.3), tt, 0.55)
HIJAZ = [62, 63, 66, 67, 69, 70, 72, 74]
motif(W["corsairs"] - 0.1, [62, 63, 66, 67, 66, 63, 62], gain=0.24)
motif(W["joined"] - 0.1, [62, 63, 66, 67, 66, 63, 62])                                    # oud, Algiers
motif(W["son1"] + 0.2, [69, 70, 72, 70, 69, 67, 66], step=0.3)       # oud, Salé
motif(W["under"] + 0.2, [62, 63, 66, 67, 69, 67, 66], step=0.4, gain=0.24)  # oud: Islamic rule
motif(W["with1"] + 0.2, [65, 67, 69, 72, None, 70, 69, 67], step=0.45, gain=0.24, bright=0.9, dur=1.4)  # brighter pluck: the crossing
motif(W["son2"] + 0.4, [62, 66, 69, 74], step=0.6, gain=0.26)
place(music, boom(), W["banished"], 0.32)
music = np.stack([reverb(music[:, 0], 1.5, 0.12, seed=1), reverb(music[:, 1], 1.5, 0.12, seed=2)], 1)
music[: T(0.3)] *= np.linspace(0, 1, T(0.3))[:, None]
music[-T(2.5):] *= np.linspace(1, 0, T(2.5))[:, None]

# ---------------- SFX: every card, stamp, pen stroke and camera flight ----------------
sfx = np.zeros((N, 2))
place(sfx, waves(22.0), W["south"] - 0.8, 0.2, 0.0)
# the shipwreck off Lanzarote: wind, rain, a low-passed roll of thunder (soft, never loud)
place(sfx, wind(4.0, 1.0), W["shipwrecked"] - 0.4, 0.2, -0.2)
place(sfx, rain(3.6), W["shipwrecked"] - 0.2, 0.14, 0.2)
place(sfx, lp(thunder(), 900), W["shipwrecked"] + 0.1, 0.18, 0.3)
place(sfx, wind(4.0, 1.0), W["with1"], 0.12, -0.2)
cards = [W["in1"] - 0.3, W["lists"] + 0.05, W["turck"], W["his1"] + 2.1, W["sleyman"] - 0.4, W["joined"] + 0.3, W["son1"] - 0.1,
         W["grietje"] - 0.45, W["amsterdam2"] - 0.2, W["dutch4"] - 0.2, W["banished"] - 1.1,
         W["y1674"] + 0.05, W["under"] - 0.05, W["son2"] - 0.1, W["written"] - 0.2]
for tt in cards: place(sfx, paper(), tt + 0.08, 0.55, rng.uniform(-0.2, 0.2))
for tt in [HW["admiral"], HW["first"], W["truce"], W["banished"], W["fined"]]: place(sfx, stamp(), tt, 0.62)
# hook: route drawing, the ocean crossing, Brooklyn
place(sfx, pen(1.6), HW["pirate"] - 0.1, 0.4)
place(sfx, whoosh(1.0, True), 0.0, 0.25)
place(sfx, whoosh(1.6, True), HW["son"] - 0.3, 0.5)
place(sfx, waves(3.0), HW["son"] - 0.2, 0.18)
place(sfx, chime(1320), HW["america"] + 0.05, 0.22)
for tt, d in [(W["antoni"] - 0.15, 1.05), (W["antoni"] + 0.6, 0.6), (W["muslim1"] + 0.1, 1.7), (W["given"], 1.4), (W["turks"] - 0.25, 0.6), (W["sleyman"] - 0.25, 0.9), (W["maps"] - 0.2, 1.1)]:
    place(sfx, pen(d), tt, 0.45)
for tt, up, g in [(W["lists"] + 0.05, True, 0.25), (W["turck"] + 0.2, True, 0.22), (W["his1"] + 0.45, True, 0.45), (W["south"] - 0.4, False, 0.3), (W["rescued"] - 0.3, False, 0.3),
                  (W["sleyman"] - 0.5, True, 0.25), (W["joined"], True, 0.28), (W["son1"] - 0.3, True, 0.25), (W["then"] + 0.1, True, 0.32), (W["with1"] - 0.1, True, 0.42),
                  (W["grietje"] + 0.5, False, 0.3), (W["dutch4"] - 0.2, True, 0.22), (W["banished"] - 1.0, False, 0.25),
                  (W["y1674"] + 0.0, True, 0.22), (W["under"] - 0.05, True, 0.22), (W["son2"] - 0.1, False, 0.3)]:
    place(sfx, whoosh(1.2, up), tt, g, rng.uniform(-0.3, 0.3))
for tt, f in [(W["turck"] + 0.25, 1320), (W["amsterdam2"] + 0.1, 1175), (W["maps"] + 0.6, 1320)]:
    place(sfx, chime(f), tt, 0.2)

# ---------------- duck under the voice, write stems ----------------
voice, vsr = sf.read(ROOT + "/voice.wav")
if voice.ndim > 1: voice = voice.mean(1)
assert vsr == SR, vsr
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
env = np.abs(voice); env = lp(env, 6, 1); env /= env.max() + 1e-9
music *= lp(1 - 0.55 * np.clip(env * 4, 0, 1), 3, 1)[:, None]
sfx *= (1 - 0.25 * np.clip(env * 4, 0, 1))[:, None]
sf.write(ROOT + "/music.wav", music.astype(np.float32), SR)
sf.write(ROOT + "/sfx.wav", sfx.astype(np.float32), SR)
print("stems written", N / SR)
