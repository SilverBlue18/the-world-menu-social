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

# hook: the title card's red "DOSSIER #01" stamp lands softly (calm opening)
place(fx, stamp(), wt("monde") - 0.05, 0.35)
# "Ce pays, c'est l'Inde." : camera to India, pin
whoosh_to(wt("l'inde", 1), 1.1, 0.8, 0.3)
place(fx, pin(), wt("l'inde", 1), 1.0, 0.3)
# "Il vient du Mexique." : the big flight across the map, India -> Mexico, pin
whoosh_to(wt("mexique", 1), 1.6, 1.1, -0.4)
place(fx, pin(), wt("mexique", 1) + 0.02, 1.0, -0.3)
# "six mille ans" : archival chili card drops
place(fx, paper(), wt("six") - 0.04, 1.0)
# "En 1493, Christophe Colomb" : ship creak, Columbus portrait card
place(fx, creak(1.6), wt("1493") - 0.1, 0.7, 0.25)
place(fx, paper(), wt("colomb") - 0.04, 1.0)
# « pimiento » : pen writes the name
place(fx, pen(0.8), wt("pimiento") - 0.02, 0.9)
# "Mauvais pays, mauvais nom." : two stamps
place(fx, stamp(), wt("mauvais", 1) - 0.03, 0.8, -0.1)
place(fx, stamp(), wt("mauvais", 2) - 0.03, 0.85, 0.1)
# "marins portugais ... jusqu'à Goa" : the route draws itself down Africa and round to India
pen_a = wt("portugais"); place(fx, pen(wt("goa", 1) - pen_a), pen_a, 0.55, -0.1)
place(fx, creak(1.4), wt("marins") - 0.1, 0.5, -0.25)
place(fx, pin(), wt("goa", 1), 1.0, 0.2)
# "le poivre noir" : black-pepper card + a pepper mill
place(fx, paper(), wt("poivre", 3) - 0.1, 0.9)
place(fx, grind(0.9), wt("noir") - 0.05, 0.8, 0.15)
# "d'abord dans le sud ... deux siècles pour atteindre le nord" : pin south, pen route north, pin north
place(fx, pin(), wt("sud"), 0.9)
pen_b = wt("deux"); place(fx, pen(wt("nord") - pen_b + 0.2), pen_b, 0.6)
place(fx, pin(), wt("nord") + 0.02, 0.9)
# « poivre de Pernambouc » ... Brésil : whoosh to Brazil, card drops
whoosh_to(wt("pernambouc"), 1.2, 0.85, -0.3)
place(fx, paper(), wt("bresil") - 0.04, 0.9, -0.2)
# three "premier" : three counters slide in, each with a tick
for k in (1, 2, 3):
    place(fx, slide(0.4), wt("premier", k) - 0.12, 0.9, (k - 2) * 0.25)
    place(fx, tick(), wt("premier", k), 1.0, (k - 2) * 0.25)
# "te brûle la bouche" : sizzle
place(fx, sizzle(2.0), wt("brule") - 0.1, 0.8)
# "remercie le Mexique." : whoosh back to Mexico, soft final stamp
whoosh_to(wt("mexique", 2), 1.3, 0.9, -0.3)
place(fx, stamp(), wt("mexique", 2, end=True) + 0.05, 0.55)
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
