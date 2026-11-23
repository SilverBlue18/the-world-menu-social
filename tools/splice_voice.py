import json, subprocess, numpy as np, soundfile as sf
SR = 48000
def load(p):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()
old = load("public/imam/voice_v3.mp3")
W = json.load(open("src/imam/words.json"))
starts = [w["startMs"] / 1000 for w in W]; ends = [w["endMs"] / 1000 for w in W]
def idx(t): return min(range(len(starts)), key=lambda i: abs(starts[i] - t))
# (line start, next line start, take)
REPL = [(15.06, 19.90, "L2_v2_s11"), (19.90, 25.56, "L3_v1_s11"), (33.40, 39.12, "L6_v0_s11"), (45.24, 54.56, "L9_v2_s29")]
def trim(x, thr_db=-42):
    e = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, "same")); thr = 10 ** (thr_db / 20)
    nz = np.where(e > thr)[0]; a, b = max(0, nz[0] - 480), min(len(x), nz[-1] + 1200)
    return x[a:b]
def rms_env(x):
    return np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, "same"))
pieces = []; cur = 0.0; anchors = [(0.0, 0.0)]; newt = 0.0
for ls, nls, take in REPL:
    i0 = idx(ls); i1 = idx(nls)
    prev_end = ends[i0 - 1]; last_end = ends[i1 - 1]
    # cut points: quietest 10 ms inside the gaps
    def quiet(a, b):
        seg = rms_env(old[int(a * SR):int(b * SR)]); return a + int(np.argmin(seg)) / SR
    cA = quiet(prev_end + 0.02, ls - 0.02); cB = quiet(last_end + 0.02, nls - 0.02)
    # copy original up to cA
    pieces.append(old[int(cur * SR):int(cA * SR)]); newt += cA - cur
    anchors.append((cA, newt))
    t = trim(load(f"projects/imam/takes/{take}.mp3"))
    lead = np.zeros(int((ls - cA) * SR), np.float32); tail = np.zeros(int((cB - last_end) * SR), np.float32)
    # match loudness of take to original line
    o = old[int(ls * SR):int(last_end * SR)]
    t = t * (np.sqrt((o ** 2).mean()) / (np.sqrt((t ** 2).mean()) + 1e-9))
    new = np.concatenate([lead, t, tail])
    fade = int(0.01 * SR); new[:fade] *= np.linspace(0, 1, fade); new[-fade:] *= np.linspace(1, 0, fade)
    pieces.append(new); newt += len(new) / SR; cur = cB
    anchors.append((cB, newt))
    print(take, f"old {cB - cA:.2f}s new {len(new)/SR:.2f}s")
pieces.append(old[int(cur * SR):]); newt += (len(old) / SR) - cur
anchors.append((len(old) / SR, newt))
v = np.concatenate(pieces)
sf.write("public/imam/voice_v4.wav", v, SR)
json.dump(anchors, open("projects/imam/coarse_anchors.json", "w"))
print("old", len(old) / SR, "new", len(v) / SR)
