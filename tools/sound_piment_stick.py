"""Sound design for 'Le piment' — STICKMAN version (growkaz-stickman-studio/projects/piment, 29 shots, 69 s).
NO MUSIC: only recorded, screened non-tonal effects (sfx_lib/mixkit APPROVED) and natural ambience, layered and pinned
to the spoken words (word clock from projects/piment/captions.json) and to the shot cuts (story/shots.json).
Writes public/piment_stick/amb.wav + sfx.wav. Then: python3 tools/twm_mix.py piment_stick --amb -22"""
import json, os, sys
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from sfx_lib import word_clock
from sfx_samples import SR, load, cut, fit, eq, space, put

SLUG = "piment_stick"
SHOTS = json.load(open(os.path.join(ROOT, "growkaz-stickman-studio/projects/piment/story/shots.json")))["shots"]
DUR = SHOTS[-1]["end"]
N = int(DUR * SR)
S = {s["id"]: s["start"] for s in SHOTS}
wt = word_clock(os.path.join(ROOT, "projects", "piment", "captions.json"))
amb = np.zeros((N, 2)); fx = np.zeros((N, 2))
rnd = np.random.default_rng(7)

# ---------- layered building blocks ----------
def whoosh(t, size="mid", g=1.0, pan=0.0):
    """A cut/whip that lands on t."""
    if size == "big":
        put(fx, space(eq(load(2604), hp=60), 0.15), t - 1.0, 0.7 * g, pan); put(fx, eq(load(1492), hp=300), t - 0.5, 0.5 * g, -pan)
    elif size == "mid":
        put(fx, space(eq(load(2607), hp=80), 0.15), t - 0.7, 0.65 * g, pan); put(fx, eq(load(2625), hp=400, lp=12000), t - 0.42, 0.3 * g, -pan * 0.5)
    else:
        put(fx, space(eq(load(2605), hp=120), 0.12), t - 0.45, 0.45 * g, pan)
def pin(t, g=1.0, pan=0.0):
    put(fx, space(eq(cut(load(2151), 0.3), lp=6000), 0.2), t - 0.01, 0.55 * g, pan); put(fx, eq(cut(load(1117), 0.15), hp=900), t, 0.35 * g, pan)
def pop(t, g=1.0, pan=0.0):
    put(fx, eq(cut(load(2380), 0.5), hp=500), t - 0.18, 0.4 * g, pan)
    put(fx, space(eq(load(2358), hp=150), 0.15), t - 0.02, 0.65 * g, pan)
    put(fx, space(eq(cut(load(2150), 0.35), lp=3500), 0.2), t, 0.4 * g, pan)
def slam(t, g=1.0, pan=0.0):
    put(fx, eq(cut(load(1464), 0.35), hp=600), t - 0.16, 0.45 * g, pan)
    put(fx, space(load(2655), 0.22), t - 0.02, 0.85 * g, pan)
    put(fx, space(eq(cut(load(2155), 0.6), lp=2500), 0.2), t, 0.5 * g, pan)
def tick(t, g=1.0, pan=0.0):
    put(fx, eq(load(1125), hp=600), t, 0.45 * g, pan)
def counter(t0, t1, g=1.0):
    """A number counting up: soft clicks that speed up, ending on a pop."""
    n = 9
    for k in range(n):
        u = (k / (n - 1)) ** 0.7; tick(t0 + (t1 - t0) * u, 0.55 * g, (k % 2 - 0.5) * 0.3)
def pencil(t, dur, g=1.0, pan=0.0):
    put(fx, space(eq(fit(load(3194), dur, 0.25), hp=1200), 0.1), t, 0.5 * g, pan)
def crunch(t, g=1.0, pan=0.0):
    put(fx, space(eq(cut(load(2244), 0.6), hp=200), 0.1), t, 0.8 * g, pan)
def knock(t, g=1.0, pan=0.0):
    put(fx, space(eq(cut(load(2182), 0.25), lp=3000), 0.2), t, 0.3 * g, pan)
def bed(sample, t0, t1, g, pan=0.0, hp=80, lp=None, target=None):
    put(target if target is not None else amb, eq(fit(load(sample), t1 - t0 + 0.8), hp=hp, lp=lp), t0 - 0.4, g, pan)

# ---------- ambience (natural, non-melodic) ----------
bed(2427, 0, DUR, 0.45, hp=150, lp=9000)                                   # breeze under everything
bed(121, S["s001"], S["s003"], 0.25, 0.3, hp=300)                          # market stalls frying, far
bed(123, S["s003"], S["s004"], 0.5, -0.2, hp=200)                          # the curry pot
for a, b in (("s005", "s008"), ("s021", "s022"), ("s028", None)):          # fields: wind
    bed(2658, S[a], S[b] if b else DUR, 0.55, 0.0, hp=120)
bed(1187, S["s008"], S["s009"], 0.9, 0.15)                                 # Columbus's ship
bed(1204, S["s009"], S["s014"], 0.7, -0.1)                                 # Caribbean shore
bed(123, S["s014"], S["s015"], 0.22, 0.2, hp=300)                          # kitchen today
bed(1187, S["s015"], S["s016"], 0.75, -0.15); bed(1196, S["s015"], S["s016"], 0.35, 0.2, hp=100, lp=7000)
bed(1196, S["s017"], S["s018"], 0.45, 0.1, hp=100, lp=7000)                # Goa harbour
bed(121, S["s022"], S["s023"], 0.22, -0.2, hp=300)                         # Goa market
bed(1204, S["s023"], S["s024"], 0.7, 0.1)                                  # Brazilian coast
bed(2658, S["s024"], S["s025"], 0.4, 0.0, hp=150)
bed(123, S["s025"], S["s026"], 0.3, 0.2, hp=250)
bed(1196, S["s026"], S["s027"], 0.4, -0.1, hp=100, lp=7000)
bed(123, S["s027"], S["s028"], 0.18, 0.0, hp=250)

# ---------- events (shot cuts + spoken words) ----------
whoosh(0.35, "small", 0.8)                                                  # title arrives
slam(S["s001"] + 0.9, 0.7)                                                  # "PAS INDIEN ?!"
counter(wt("cinq") - 0.1, wt("ans", 1)); pop(wt("ans", 1), 0.9)             # 500 ANS
whoosh(S["s003"], "mid", 1.0, 0.3); pin(wt("l'inde", 1), 1.0, 0.1)          # kitchen, "INDE"
put(fx, eq(cut(load(1464), 0.4), hp=500), S["s004"] - 0.05, 0.4); pop(S["s004"] + 0.35, 0.8, 0.3)   # the chili + "?"
whoosh(S["s005"], "big", 1.0, -0.4); pin(wt("mexique", 1), 1.0, -0.2)      # to Mexico
for k, tt in enumerate((0.75, 1.9)): knock(S["s006"] + tt, 0.9, 0.2)       # picking pods
whoosh(S["s007"], "small", 0.8); counter(S["s007"] + 0.1, S["s007"] + 1.4); slam(S["s007"] + 1.45, 0.6)   # 6 000 ANS
whoosh(S["s008"], "mid", 0.9, 0.2); pop(wt("1493"), 0.9)                    # the caravel, "1493"
pop(S["s009"] + 0.55, 0.6, 0.3); crunch(S["s009"] + 0.95, 1.0, -0.2); pin(S["s009"] + 0.75, 0.8, 0.2)   # hand-over, bite, CARAÏBES
pop(S["s010"] + 0.3, 0.7, 0.3); put(fx, space(load(1809), 0.15), wt("poivre", 1) - 0.05, 0.45, 0.2)       # pepper thought bubble
put(fx, eq(cut(load(2380), 0.5), hp=500), S["s011"] + 0.1, 0.45); put(fx, space(eq(load(2369), hp=900), 0.12), wt("pimiento") - 0.02, 0.6)   # tag, writing
whoosh(S["s012"], "small", 0.8); pop(S["s012"] + 0.12, 0.7)                 # "= ?"
put(fx, space(eq(load(1481), hp=200), 0.2), S["s013"] - 0.35, 0.6)          # freeze
slam(wt("mauvais", 1) - 0.03, 1.0, -0.15); slam(wt("mauvais", 2) - 0.03, 1.05, 0.15)
whoosh(S["s014"], "small", 0.7); put(fx, space(load(1809), 0.15), S["s014"] + 0.5, 0.55, -0.2)            # the PIMENT jar
whoosh(S["s015"], "big", 1.0, 0.3)
for k in range(6): knock(S["s015"] + 0.5 + k * 0.56, 0.7, -0.1 + k * 0.05)  # steps on the wooden quay
whoosh(S["s016"], "mid", 0.9, -0.2); pin(S["s016"] + 0.05, 0.9, -0.3); pencil(S["s016"] + 0.1, S["s017"] - S["s016"] - 0.1, 0.8)
pin(wt("goa", 1), 1.0, 0.2); knock(S["s017"] + 1.1, 1.0, 0.1); pop(wt("seizieme") - 0.1, 0.6)              # GOA, basket, XVIe
whoosh(S["s018"], "small", 0.7)
for k in range(5): knock(S["s018"] + 0.2 + k * 0.38, 0.6, 0.15)             # grinding stone
put(fx, eq(cut(load(1530), 1.6), hp=400), S["s019"] + 0.1, 0.35, 0.2)      # sack sliding
for k in range(70):                                                         # peppercorns rattling into the brass bowl
    tt = S["s019"] + 0.15 + rnd.random() * (S["s020"] - S["s019"] - 0.5)
    put(fx, eq(cut(load(1117), 0.08), hp=1500), tt, 0.08 + rnd.random() * 0.12, rnd.uniform(-0.4, 0.4))
pop(wt("noir") - 0.05, 0.8)
whoosh(S["s020"], "mid", 0.9, 0.2); pin(S["s020"] + 0.12, 0.8, -0.2); pin(wt("sud"), 1.0, 0.1)
for k in range(4): pop(wt("sud") + 0.1 + k * 0.08, 0.25, (k - 1.5) * 0.2)
counter(wt("deux"), wt("siecles") + 0.4); pop(wt("siecles") + 0.45, 0.7); pin(wt("nord"), 0.9, 0.3)
put(fx, eq(cut(load(2380), 0.5), hp=500), wt("poivre", 4) - 0.15, 0.45); pop(wt("poivre", 4), 0.7)          # the painted sign
whoosh(S["s023"], "big", 1.0, -0.3); pin(wt("bresil"), 1.0, 0.2)
whoosh(S["s024"], "small", 0.7)
for k in (1, 2, 3): slam(wt("premier", k) - 0.03, 0.75, (k - 2) * 0.25)     # 1er x3
crunch(S["s025"] + 0.6, 0.5, 0.2)
for k in range(3): tick(S["s026"] + 2.05 + k * 0.12, 1.2, (k - 1) * 0.3)
crunch(S["s027"] + 1.75, 1.2); put(fx, space(eq(fit(load(123), 2.0), hp=200), 0.1), wt("brule") - 0.1, 0.7)   # bite + sizzle
whoosh(S["s028"], "big", 1.0, -0.3); pop(S["s028"] + 0.12, 0.7); slam(wt("mexique", 2), 0.8)
whoosh(S["s029"] + 0.1, "small", 0.8)
for k in range(5): pop(S["s029"] + 0.25 + k * 0.1, 0.25, (k - 2) * 0.2)     # the cast pops up
pop(S["s029"] + 0.9, 0.7); pop(S["s029"] + 1.5, 0.8)                        # end card: logo, "Abonne-toi" pill

f = int(1.6 * SR)
for b in (amb, fx): b[-f:] *= np.linspace(1, 0, f)[:, None]
out = os.path.join(ROOT, "public", SLUG); os.makedirs(out, exist_ok=True)
sf.write(os.path.join(out, "amb.wav"), amb.astype(np.float32), SR, subtype="FLOAT")
sf.write(os.path.join(out, "sfx.wav"), fx.astype(np.float32), SR, subtype="FLOAT")
print("wrote amb.wav + sfx.wav", DUR, "s")
