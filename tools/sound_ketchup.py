"""Sound for the ketchup pilot (new real-food format). NO MUSIC: recorded non-tonal SFX (sfx_lib/mixkit APPROVED) + natural
ambience, all read from the SAME event list as the video (src/ketchup/beats.json).
Writes public/ketchup/amb.wav + sfx.wav. Then: python3 tools/twm_mix.py ketchup --amb -22"""
import json, os, sys
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from sfx_samples import SR, load, cut, fit, eq, space, put

B = json.load(open(os.path.join(ROOT, "src", "ketchup", "beats.json")))
DUR = B["duration"]; N = int(DUR * SR)
amb = np.zeros((N, 2)); fx = np.zeros((N, 2))

def whoosh(t, size="mid", g=1.0, pan=0.0):
    if size == "big":
        put(fx, space(eq(load(2604), hp=60), 0.15), t - 1.0, 0.7 * g, pan); put(fx, eq(load(1492), hp=300), t - 0.5, 0.5 * g, -pan)
    elif size == "mid":
        put(fx, space(eq(load(2607), hp=80), 0.15), t - 0.7, 0.6 * g, pan); put(fx, eq(load(2625), hp=400, lp=12000), t - 0.42, 0.28 * g, -pan * 0.5)
    else:
        put(fx, space(eq(load(2605), hp=120), 0.12), t - 0.45, 0.45 * g, pan)
def pop(t, g=1.0, pan=0.0):
    put(fx, eq(cut(load(2380), 0.5), hp=500), t - 0.18, 0.35 * g, pan); put(fx, space(eq(load(2358), hp=150), 0.15), t - 0.02, 0.6 * g, pan)
def slam(t, g=1.0, pan=0.0):
    put(fx, eq(cut(load(1464), 0.35), hp=600), t - 0.14, 0.4 * g, pan); put(fx, space(load(2655), 0.2), t, 0.7 * g, pan)
def tick(t, g=1.0, pan=0.0): put(fx, eq(load(1125), hp=600), t, 0.42 * g, pan)
def roll(t0, dur=0.7, g=1.0):
    for k in range(8): tick(t0 + dur * (k / 7) ** 0.7, 0.5 * g, (k % 2 - 0.5) * 0.3)
def bed(sample, t0, t1, g, pan=0.0, hp=80, lp=None):
    put(amb, eq(fit(load(sample), t1 - t0 + 0.8), hp=hp, lp=lp), t0 - 0.4, g, pan)

S = B["scenes"]; ends = [s["t"] for s in S[1:]] + [B["voiceEnd"]]
AMB = {"hook": (123, 0.35), "fishsauce": (121, 0.3), "boat": (1204, 0.6), "ship": (1187, 0.7), "mushrooms": (123, 0.45),
       "walnuts": (123, 0.2), "oysters": (1204, 0.3), "tomatoes": (2427, 0.5), "bottle": (123, 0.2), "dip": (123, 0.3)}
bed(2427, 0, DUR, 0.3, hp=150, lp=9000)                                  # soft air under everything
for i, s in enumerate(S):
    name = s.get("clip") or s["split"][1]
    smp, g = AMB.get(name, (2427, 0.3)); bed(smp, s["t"], ends[i], g, hp=200)
    if i: whoosh(s["t"], "big" if s.get("split") or i in (2, 8) else ("small" if ends[i] - s["t"] < 1.2 else "mid"), 0.8, 0.3 if i % 2 else -0.3)

slam(B["headline"]["in"] + 0.05, 0.9)                                     # the headline card
for y_t, _ in [(y[0], y[1]) for y in B["years"]]: roll(y_t - 0.05); slam(y_t + 0.68, 0.5)
for g in B["tags"]: pop(g["t"], 0.7)
for g in B["labels"]: pop(g["t"], 0.85)
for w in B["bigWord"]: slam(w["t"], 0.8)
put(fx, eq(load(2369), hp=900), B["strike"]["t"] + 0.35, 0.5)             # the red strike through POISSON
put(fx, space(eq(cut(load(2155), 0.6), lp=2500), 0.2), S[10]["t"] + 0.05, 0.5)   # the split opening
pop(B["ask"]["t"], 0.7)
pop(B["endCard"] + 0.05, 0.6); pop(B["endCard"] + 0.95, 0.75)

f = int(1.2 * SR)
for b in (amb, fx): b[-f:] *= np.linspace(1, 0, f)[:, None]
out = os.path.join(ROOT, "public", "ketchup"); os.makedirs(out, exist_ok=True)
sf.write(os.path.join(out, "amb.wav"), amb.astype(np.float32), SR, subtype="FLOAT")
sf.write(os.path.join(out, "sfx.wav"), fx.astype(np.float32), SR, subtype="FLOAT")
print("wrote public/ketchup amb.wav + sfx.wav", DUR, "s")
