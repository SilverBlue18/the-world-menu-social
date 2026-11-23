"""Sound design for video 1 'Le piment' (The World Menu), v2: real recorded effects (Mixkit, screened non-tonal), layered,
with a shared room for depth. NO MUSIC: only noise-based effects and natural ambience.
Every effect is pinned to a spoken word with the word clock (projects/piment/captions.json), matching src/piment/Piment.tsx.
Writes two stems: public/piment/amb.wav (ambience bed) and public/piment/sfx.wav (events). Then: python3 tools/twm_mix.py piment"""
import os, sys
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from sfx_lib import word_clock
from sfx_samples import SR, load, cut, fit, eq, width, space, put, fade

SLUG = "piment"
DUR = 68.5
N = int(DUR * SR)
wt = word_clock(os.path.join(ROOT, "projects", SLUG, "captions.json"))
amb = np.zeros((N, 2))
fx = np.zeros((N, 2))

# ---------------- layered building blocks ----------------
def whoosh_in(t_arrive, size="big", gain=1.0, pan=0.0):
    """A camera move that lands on `t_arrive`: air body + a fast top layer, peaking on the word."""
    if size == "big":    # globe spins across the world
        body = space(eq(load(2604), hp=60), 0.15); top = eq(load(1492), hp=300)
        put(fx, body, t_arrive - 1.15, 0.75 * gain, pan); put(fx, top, t_arrive - 0.55, 0.55 * gain, -pan)
    elif size == "mid":  # globe grows / turns
        body = space(eq(load(2607), hp=80), 0.15); top = eq(load(2625), hp=400, lp=12000)
        put(fx, body, t_arrive - 0.75, 0.7 * gain, pan); put(fx, top, t_arrive - 0.45, 0.35 * gain, -pan * 0.5)
    else:                # small morph (globe <-> chip)
        put(fx, space(eq(load(2605), hp=120), 0.12), t_arrive - 0.5, 0.5 * gain, pan)

def pin(t, gain=1.0, pan=0.0):
    """A place lights up on the globe: a soft knock + a dry click, tight."""
    put(fx, space(eq(cut(load(2151), 0.3), lp=6000), 0.2), t - 0.01, 0.55 * gain, pan)
    put(fx, eq(cut(load(1117), 0.15), hp=900), t, 0.35 * gain, pan)

def pop(t, gain=1.0, pan=0.0):
    """Food arrives on screen: an air swish, a round pop, a light body hit."""
    put(fx, eq(cut(load(2380), 0.5), hp=500), t - 0.18, 0.45 * gain, pan)
    put(fx, space(eq(load(2358), hp=150), 0.15), t - 0.02, 0.7 * gain, pan)
    put(fx, space(eq(cut(load(2150), 0.35), lp=3500), 0.2), t, 0.45 * gain, pan)

def slam(t, gain=1.0, pan=0.0):
    """A red banner slams in: a punchy impact with weight and a short room tail."""
    put(fx, eq(cut(load(1464), 0.35), hp=600), t - 0.16, 0.45 * gain, pan)
    put(fx, space(load(2655), 0.22), t - 0.02, 0.85 * gain, pan)
    put(fx, space(eq(cut(load(2155), 0.6), lp=2500), 0.2), t, 0.5 * gain, pan)

def tick(t, gain=1.0, pan=0.0):
    """A row slides in: short swish + typewriter-soft click + a small knock."""
    put(fx, eq(cut(load(1530), 0.35), hp=800), t - 0.16, 0.4 * gain, pan)
    put(fx, eq(load(1125), hp=600), t, 0.5 * gain, pan)
    put(fx, space(eq(cut(load(2151), 0.25), lp=4000), 0.2), t, 0.35 * gain, pan)

def pencil(t, dur, gain=1.0, pan=0.0):
    """A route being drawn: pencil on paper, looped smoothly to the duration."""
    put(fx, space(eq(fit(load(3194), dur, 0.25), hp=1200), 0.1), t, 0.55 * gain, pan)

# ---------------- ambience bed (low, natural, non-melodic) ----------------
put(amb, eq(fit(load(2427), DUR), hp=150, lp=9000), 0.0, 0.55)                        # a soft breeze keeps the silence alive
sea1 = wt("1493") - 0.5;  put(amb, eq(fit(load(1187), wt("croit") + 0.8 - sea1), hp=80), sea1, 0.9, 0.15)      # wooden ship at sea (Columbus)
sea2 = wt("ensuite") + 0.2; put(amb, eq(fit(load(1187), wt("goa", 1) + 1.2 - sea2), hp=80), sea2, 0.9, -0.15)  # Portuguese ships round Africa
put(amb, eq(fit(load(1196), wt("goa", 1) + 1.2 - sea2), hp=100, lp=7000), sea2, 0.45, 0.25)

# ---------------- events, pinned to the words ----------------
# hook: the chili is on screen; "cinq cents ans" ticks up
put(fx, space(eq(cut(load(1464), 0.5), hp=500), 0.15), wt("cinq") - 0.2, 0.35)
# "Ce pays, c'est l'Inde." : the chip grows into the globe and turns to India
whoosh_in(wt("l'inde", 1), "mid", 1.0, 0.3); pin(wt("l'inde", 1), 1.0, 0.1)
# "Il vient du Mexique." : the globe spins west across the Atlantic
whoosh_in(wt("mexique", 1), "big", 1.0, -0.4); pin(wt("mexique", 1) + 0.02, 1.0, -0.2)
# "Là-bas" : globe to chip; "six mille ans" : the dried-chili heap and "6 000 ANS" pop in
whoosh_in(wt("labas") + 0.6, "small", 0.9, -0.2)
pop(wt("six") - 0.05, 1.1)
# "En 1493" : the globe grows over the Atlantic; the route draws Spain -> Caribbean
whoosh_in(wt("1493") + 0.3, "mid", 0.9, 0.2)
pencil(wt("1493") + 0.1, wt("caraibes") - wt("1493"), 0.8, 0.1)
pin(wt("caraibes"), 1.0, -0.3)
# "Il croit avoir trouvé le poivre des Indes" : globe back to the chip; chili + the bowl of pepper slide in
whoosh_in(wt("croit") + 0.45, "small", 0.9, 0.2)
pop(wt("poivre", 1) - 0.2, 0.9, 0.3)
# « pimiento » : the word is written
put(fx, space(eq(load(2369), hp=900), 0.12), wt("pimiento") - 0.02, 0.6)
pop(wt("poivre", 2) - 0.05, 0.55, 0.2)                      # "= POIVRE ?"
# "Mauvais pays, mauvais nom." : two red banners slam in
slam(wt("mauvais", 1) - 0.03, 1.0, -0.15)
slam(wt("mauvais", 2) - 0.03, 1.05, 0.15)
# "Ensuite" : the globe grows and turns to Lisbon
whoosh_in(wt("ensuite") + 0.4, "mid", 1.0, 0.3)
pin(wt("ensuite") + 0.4, 0.8, -0.2)
# "marins portugais ... jusqu'à Goa" : the route draws round Africa, the chili riding its head
pencil(wt("portugais"), wt("goa", 1) - wt("portugais"), 0.75, -0.1)
whoosh_in(wt("goa", 1) - 0.1, "small", 0.7, 0.3)
pin(wt("goa", 1), 1.1, 0.2)
pop(wt("seizieme") - 0.1, 0.5)                              # "DÉBUT DU XVIe SIÈCLE" pill
# "Avant ça" : globe to the chip; the bowl of black pepper pops in; spice on "noir"
whoosh_in(wt("avant") + 0.5, "small", 0.9)
pop(wt("avant") + 0.3, 1.0)
put(fx, space(load(1809), 0.15), wt("noir") - 0.1, 0.55, 0.15)
# "Le piment s'installe" : the globe zooms in on India; pin south, the route grows north, pin north
whoosh_in(wt("piment", 3) + 0.5, "mid", 0.9, -0.2)
pin(wt("sud"), 1.0, 0.1)
pencil(wt("deux") - 0.1, wt("nord") - wt("deux") + 0.2, 0.8)
pop(wt("siecles") - 0.1, 0.5, 0.3)                          # "2 SIÈCLES" pill
pin(wt("nord") + 0.02, 1.0, -0.1)
# « poivre de Pernambouc » : the globe spins to Brazil; the name pops up
whoosh_in(wt("pernambouc"), "big", 0.95, -0.3)
pin(wt("pernambouc") + 0.02, 1.0, -0.2)
pop(wt("pernambouc") - 0.1, 0.45, 0.2)
# "Aujourd'hui" : the route runs back to India; the globe shrinks to the chip
whoosh_in(wt("aujourd'hui") + 0.8, "big", 0.8, 0.3)
whoosh_in(wt("premier", 1) - 0.7, "small", 0.8)
# three "premier" : three rows slide in
for k in (1, 2, 3):
    tick(wt("premier", k) - 0.05, 1.0, (k - 2) * 0.25)
# "Alors" : the chili fills the screen; "te brûle la bouche" : it sizzles
whoosh_in(wt("alors") + 0.55, "small", 0.9)
put(fx, space(eq(fit(load(123), 2.4), hp=200), 0.1), wt("brule") - 0.15, 0.75)
# "remercie le Mexique." : the globe swings back to Mexico; "Merci, Mexique" lands
whoosh_in(wt("mexique", 2), "big", 1.0, -0.3)
pin(wt("mexique", 2) + 0.02, 1.0, -0.2)
slam(wt("mexique", 2, end=True) + 0.05, 0.6)
# end card: badge rises, subscribe pill pops
endc = wt("mexique", 2, end=True) + 0.6
whoosh_in(endc + 0.4, "small", 0.8)
pop(endc + 0.95, 0.8)

# gentle fade at the very end
f = int(1.4 * SR)
for b in (amb, fx):
    b[-f:] *= np.linspace(1, 0, f)[:, None]
out = os.path.join(ROOT, "public", SLUG)
sf.write(os.path.join(out, "amb.wav"), amb.astype(np.float32), SR, subtype="FLOAT")
sf.write(os.path.join(out, "sfx.wav"), fx.astype(np.float32), SR, subtype="FLOAT")
print("wrote amb.wav + sfx.wav", DUR, "s")
