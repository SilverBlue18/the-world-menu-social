# Set each caption group's start/end from its aligned words, then report sync quality against audio onsets.
import json, sys, numpy as np, soundfile as sf
cap_path, wav = sys.argv[1], sys.argv[2]
c = json.load(open(cap_path))
for i, g in enumerate(c):
    g["start"] = round(g["words"][0]["s"] - 0.12, 3)
for i, g in enumerate(c):
    nxt = c[i + 1]["start"] if i + 1 < len(c) else g["words"][-1]["e"] + 1.2
    g["end"] = round(min(nxt, g["words"][-1]["e"] + 1.2), 3)
json.dump(c, open(cap_path, "w"), ensure_ascii=False, indent=1)
a, sr = sf.read(wav, dtype="float32", always_2d=True); a = a.mean(1); hop = int(sr * 0.005)
e = np.array([np.sqrt(np.mean(a[i:i + 2 * hop] ** 2) + 1e-12) for i in range(0, len(a) - 2 * hop, hop)])
q = 20 * np.log10(e / e.max() + 1e-9) < -42
ons, run = [], 0
for i, x in enumerate(q):
    if x: run += 1
    else:
        if run * 0.005 >= 0.10: ons.append(i * 0.005)
        run = 0
ws = [w for g in c for w in g["words"]]
err = np.array([min(ws, key=lambda w: abs(w["s"] - o))["s"] - o for o in ons])
bad = [w["t"] for w in ws if q[min(len(q) - 1, int(w["s"] / 0.005) + 6)] and q[min(len(q) - 1, int(w["s"] / 0.005) + 12)]]
print(f"{len(ws)} words, {len(c)} groups; onset check n={len(err)}: median |err| {np.median(abs(err))*1000:.0f} ms, 90% {np.percentile(abs(err),90)*1000:.0f} ms, max {abs(err).max()*1000:.0f} ms; words starting in silence: {bad}")
print("monotonic:", all(x["s"] <= y["s"] for x, y in zip(ws, ws[1:])))
