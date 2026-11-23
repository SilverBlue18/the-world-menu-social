"""Sound effects for video 1 'Le piment' (The World Menu). NO MUSIC: only noise-based effects and natural ambience.
Every effect is pinned to a spoken word with the word clock (projects/piment/captions.json).
Writes two stems: public/piment/amb.wav (ambience bed) and public/piment/sfx.wav (events).
Then mix: python3 tools/twm_mix.py piment"""
import os, sys
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from sfx_lib import SR, T, place, wind, waves, room, creak, whoosh, paper, stamp, pen, slide, pin, tick, sizzle, grind, word_clock, lp

SLUG = "piment"
DUR = 68.5                      # voice ends at 63.93 s; ~4.5 s of end card
N = T(DUR)
wt = word_clock(os.path.join(ROOT, "projects", SLUG, "captions.json"))

amb = np.zeros((N, 2))
fx = np.zeros((N, 2))

# ---------------- ambience bed (low, non-melodic) ----------------
place(amb, room(DUR), 0.0, 1.0)                                   # soft paper-room tone under everything
place(amb, wind(11.0, 0.55), 0.0, 1.0, -0.15)                     # calm opening: a gentle wind over the map
sea1 = wt("1493") - 0.6; place(amb, waves(wt("mauvais", 1) - sea1 + 1.5), sea1, 0.9, 0.2)          # Columbus in the Caribbean
sea2 = wt("marins") - 0.5; place(amb, waves(wt("goa", 1) - sea2 + 2.0), sea2, 1.0, -0.2)            # Portuguese sailors along Africa
place(amb, wind(DUR - wt("remercie") + 0.5, 0.4), wt("remercie") - 0.5, 1.0, 0.1)                   # quiet air under the end card

# ---------------- events ----------------
def whoosh_to(t_arrive, dur=1.1, gain=1.0, pan=0.0):
    """A whoosh that peaks on the arrival word (the camera lands as the word is spoken)."""
    place(fx, whoosh(dur), t_arrive - dur * 0.55, gain, pan)

def pop(t, gain=0.9, pan=0.0):
    """Food or a word pops onto the screen: a short slide plus a soft knock."""
    place(fx, slide(0.35), t - 0.12, gain * 0.8, pan); place(fx, pin(), t + 0.05, gain * 0.7, pan)
def morph(t, gain=0.5, pan=0.0):
    """The globe grows into the stage or shrinks into the chip: a soft, short whoosh."""
    place(fx, whoosh(0.8), t - 0.45, gain, pan)

# hook: the red chili and the title are already there; the count "500 ANS" ticks up
place(fx, slide(0.5), wt("cinq") - 0.15, 0.5)
# "Ce pays, c'est l'Inde." : the chip grows into the globe, turns to India, pin
whoosh_to(wt("l'inde", 1), 1.1, 0.8, 0.3)
place(fx, pin(), wt("l'inde", 1), 1.0, 0.3)
# "Il vient du Mexique." : the globe spins west across the Atlantic, pin
whoosh_to(wt("mexique", 1), 1.6, 1.1, -0.4)
place(fx, pin(), wt("mexique", 1) + 0.02, 1.0, -0.3)
# "Là-bas" : the globe shrinks to the chip; "six mille ans" : the dried-chili heap and "6 000 ANS" pop in
morph(wt("labas") + 0.55, 0.45)
pop(wt("six") - 0.05, 1.0)
# "En 1493, Christophe Colomb" : the globe grows over the Atlantic, ship creak, the route draws to the Caribbean
morph(wt("1493"), 0.55, 0.2)
place(fx, creak(1.6), wt("1493") - 0.1, 0.7, 0.25)
place(fx, pin(), wt("caraibes"), 0.9, -0.3)
# "Il croit avoir trouvé le poivre des Indes" : globe back to the chip, the chili and the pepper bowl slide in
morph(wt("croit") + 0.35, 0.45)
pop(wt("poivre", 1) - 0.2, 0.8, 0.3)
# « pimiento » : pen writes the name
place(fx, pen(0.8), wt("pimiento") - 0.02, 0.9)
# "Mauvais pays, mauvais nom." : two red banners slam in
place(fx, stamp(), wt("mauvais", 1) - 0.03, 0.8, -0.1)
place(fx, stamp(), wt("mauvais", 2) - 0.03, 0.85, 0.1)
# "Ensuite" : the globe grows and turns to Lisbon
whoosh_to(wt("ensuite") + 0.4, 1.4, 0.7, 0.3)
# "marins portugais ... jusqu'à Goa" : the route draws itself round Africa, the chili riding its head
pen_a = wt("portugais"); place(fx, pen(wt("goa", 1) - pen_a), pen_a, 0.55, -0.1)
place(fx, creak(1.4), wt("marins") - 0.1, 0.5, -0.25)
place(fx, pin(), wt("goa", 1), 1.0, 0.2)
# "Avant ça" : globe to the chip, the bowl of black pepper pops in; a pepper mill on "noir"
morph(wt("avant") + 0.3, 0.45)
pop(wt("avant") + 0.3, 0.9)
place(fx, grind(0.9), wt("noir") - 0.05, 0.8, 0.15)
# "Le piment s'installe" : the globe zooms in on India; pin south, the route grows north, pin north
morph(wt("piment", 3) + 0.3, 0.5)
place(fx, pin(), wt("sud"), 0.9)
pen_b = wt("deux"); place(fx, pen(wt("nord") - pen_b + 0.2), pen_b, 0.6)
place(fx, pin(), wt("nord") + 0.02, 0.9)
# « poivre de Pernambouc » : the globe spins to Brazil, pin, the name pops up
whoosh_to(wt("pernambouc"), 1.2, 0.85, -0.3)
place(fx, pin(), wt("pernambouc") + 0.02, 0.9, -0.2)
# "Aujourd'hui" : the route runs back to India, the globe shrinks to the chip
whoosh_to(wt("aujourd'hui") + 0.8, 1.6, 0.7, 0.3)
morph(wt("premier", 1) - 0.8, 0.45)
# three "premier" : three rows slide in, each with a tick
for k in (1, 2, 3):
    place(fx, slide(0.4), wt("premier", k) - 0.12, 0.9, (k - 2) * 0.25)
    place(fx, tick(), wt("premier", k), 1.0, (k - 2) * 0.25)
# "Alors" : the chili fills the screen again; "te brûle la bouche" : sizzle
place(fx, slide(0.5), wt("alors") + 0.1, 0.6)
place(fx, sizzle(2.0), wt("brule") - 0.1, 0.8)
# "remercie le Mexique." : whoosh back to Mexico, pin, soft thump for "Merci, Mexique"
whoosh_to(wt("mexique", 2), 1.3, 0.9, -0.3)
place(fx, pin(), wt("mexique", 2) + 0.02, 0.8, -0.3)
place(fx, stamp(), wt("mexique", 2, end=True) + 0.05, 0.45)
# end card: badge slides in, subscribe pill drops
endc = wt("mexique", 2, end=True) + 0.6
place(fx, slide(0.5), endc, 0.7)
place(fx, paper(0.4), endc + 0.9, 0.6)

# gentle fade at the very end
fade = T(1.4)
for b in (amb, fx):
    b[-fade:] *= np.linspace(1, 0, fade)[:, None]

out = os.path.join(ROOT, "public", SLUG)
sf.write(os.path.join(out, "amb.wav"), amb.astype(np.float32), SR, subtype="FLOAT")
sf.write(os.path.join(out, "sfx.wav"), fx.astype(np.float32), SR, subtype="FLOAT")
print("wrote amb.wav + sfx.wav", DUR, "s")
