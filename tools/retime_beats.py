"""Move every time in a beats JSON from an old voice to a new voice of the SAME script, word by word (piecewise-linear
on the word start times), so graphics keep landing on their spoken words after a re-record.
usage: python3 tools/retime_beats.py <beats.json> <old groups.json> <new groups.json>"""
import json, sys
import numpy as np
bp, op, np_ = sys.argv[1:4]
old = [w["s"] for g in json.load(open(op)) for w in g["words"]]; new = [w["s"] for g in json.load(open(np_)) for w in g["words"]]
assert len(old) == len(new)
xo, xn = np.array([0.0] + old), np.array([0.0] + new)
def f(x):
    if x >= xo[-1]: return round(float(x - xo[-1] + xn[-1]), 3)
    return round(float(np.interp(x, xo, xn)), 3)
TIME_KEYS = {"t", "in", "out", "endCard", "captionsFrom", "voiceEnd"}
def walk(o, key=None):
    if isinstance(o, dict): return {k: (f(v) if k in TIME_KEYS and isinstance(v, (int, float)) else walk(v, k)) for k, v in o.items()}
    if isinstance(o, list):
        if key == "stops": return [[s[0], f(s[1])] for s in o]
        return [walk(v, key) for v in o]
    return o
B = json.load(open(bp)); B2 = walk(B); B2["duration"] = round(B2["endCard"] + 4.1, 2)
json.dump(B2, open(bp, "w"), ensure_ascii=False, indent=1); print("retimed", bp, "duration", B2["duration"])
