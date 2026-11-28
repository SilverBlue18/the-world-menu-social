"""Sound for the STYLE V3 TEST (first 10.2 s of 'Le piment', growkaz-stickman-studio/projects/piment_v3, shot h01).
NO MUSIC: recorded non-tonal SFX (sfx_lib/mixkit APPROVED) + natural ambience, pinned to the same event times as the
visuals (EV in scenes/shots/h01_hook.js) and to the spoken words. Writes public/piment_v3/{voice,amb,sfx}.wav.
Then: python3 tools/twm_mix.py piment_v3 --amb -22"""
import os, sys
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from sfx_samples import SR, load, cut, fit, eq, space, put

DUR = 10.2
N = int(DUR * SR)
# same event list as the visuals (h01_hook.js → EV)
EV = dict(hook=0.9, decouvert=3.24, cinq=4.14, ans=4.66, cePays=5.645, inde=6.58, et=7.46, piment=7.84,
          launch=8.05, mexique=8.94, land=9.0)
amb = np.zeros((N, 2)); fx = np.zeros((N, 2))

def whoosh(t, size="mid", g=1.0, pan=0.0):
    if size == "big":
        put(fx, space(eq(load(2604), hp=60), 0.15), t - 1.0, 0.7 * g, pan); put(fx, eq(load(1492), hp=300), t - 0.5, 0.5 * g, -pan)
    elif size == "mid":
        put(fx, space(eq(load(2607), hp=80), 0.15), t - 0.7, 0.65 * g, pan); put(fx, eq(load(2625), hp=400, lp=12000), t - 0.42, 0.3 * g, -pan * 0.5)
    else:
        put(fx, space(eq(load(2605), hp=120), 0.12), t - 0.45, 0.45 * g, pan)
def stamp(t, g=1.0, pan=0.0):          # the series stamp: a soft thump + paper slap
    put(fx, eq(cut(load(1464), 0.35), hp=600), t - 0.12, 0.35 * g, pan)
    put(fx, space(load(2655), 0.2), t, 0.6 * g, pan)
    put(fx, space(eq(cut(load(2150), 0.35), lp=3500), 0.2), t + 0.01, 0.35 * g, pan)
def tick(t, g=1.0, pan=0.0): put(fx, eq(load(1125), hp=600), t, 0.45 * g, pan)
def pop(t, g=1.0, pan=0.0):
    put(fx, eq(cut(load(2380), 0.5), hp=500), t - 0.18, 0.4 * g, pan); put(fx, space(eq(load(2358), hp=150), 0.15), t - 0.02, 0.65 * g, pan)
def bed(sample, t0, t1, g, pan=0.0, hp=80, lp=None):
    put(amb, eq(fit(load(sample), t1 - t0 + 0.8), hp=hp, lp=lp), t0 - 0.4, g, pan)

# ambience: one continuous journey (market → sea → field), crossfaded under the whip
bed(2427, 0, DUR, 0.4, hp=150, lp=9000)                 # breeze under everything
bed(121, 0, EV["launch"] + 0.3, 0.32, 0.2, hp=300)      # market stalls frying
bed(1204, EV["launch"] + 0.1, EV["land"] - 0.1, 0.45)   # open sea, under the flight
bed(2658, EV["land"] - 0.3, DUR, 0.5, hp=120)           # Mexican field: wind

whoosh(0.35, "small", 0.7)
stamp(EV["hook"] + 0.05, 0.9)                           # "PAS INDIEN ?!"
whoosh(EV["decouvert"] + 0.05, "mid", 0.8, 0.2)         # push into the face
for k in range(8): tick(EV["cinq"] + (EV["ans"] - EV["cinq"]) * (k / 7) ** 0.7, 0.5, (k % 2 - 0.5) * 0.3)
stamp(EV["ans"] + 0.02, 1.0)                            # "500 ANS"
whoosh(EV["cePays"] + 0.45, "mid", 0.7, -0.2)           # pull back
stamp(EV["inde"] + 0.02, 1.0, 0.1)                      # "INDE"
for k in range(3): tick(EV["piment"] + 0.05 + k * 0.07, 0.8, (k - 1) * 0.3)   # the chili wiggles
whoosh(EV["launch"] + 0.45, "big", 1.0, -0.4)           # the leap west
stamp(EV["mexique"] + 0.02, 1.0, -0.1)                  # "MEXIQUE"
pop(EV["land"] + 0.02, 0.8)                             # caught

f = int(0.6 * SR)
for b in (amb, fx): b[-f:] *= np.linspace(1, 0, f)[:, None]
out = os.path.join(ROOT, "public", "piment_v3"); os.makedirs(out, exist_ok=True)
v, sr = sf.read(os.path.join(ROOT, "public", "piment", "voice.wav")); assert sr == SR
v = v[:N]; v[-f:] *= np.linspace(1, 0, f)[:, None] if v.ndim == 2 else np.linspace(1, 0, f)
sf.write(os.path.join(out, "voice.wav"), v.astype(np.float32), SR, subtype="FLOAT")
sf.write(os.path.join(out, "amb.wav"), amb.astype(np.float32), SR, subtype="FLOAT")
sf.write(os.path.join(out, "sfx.wav"), fx.astype(np.float32), SR, subtype="FLOAT")
print("wrote public/piment_v3 voice/amb/sfx", DUR, "s")
