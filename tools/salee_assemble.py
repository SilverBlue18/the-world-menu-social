import subprocess, json, numpy as np, soundfile as sf
SR = 48000; ROOT = "projects/salee"
# take used for each narration line, in order (line 0 = the hook)
ORDER = ["H01_s47", "P01_v0_s29", "L02_v1_s29", "Q03_v0_s11", "Q04_v0_s47", "S05b_s29", "P05_v0_s11", "M04_v0_s29", "P07_v1_s11",
         "N07_v0_s29", "N09_v0_s29", "Q10_v0_s11", "N13_v0_s29", "L14_v0_s11"]
# pause after each line. 1: the title card holds (~2.7 s, like The Lost Imam). 6-8: Salé, Amsterdam, Grietje, New Amsterdam get room to breathe.
GAP = [0.6, 1.9, 0.32, 0.4, 0.4, 0.45, 0.6, 0.7, 0.7, 0.45, 0.45, 0.5, 0.6]
CAP = {0: 0.55}
LINES = [l.strip() for l in open(f"{ROOT}/narration.txt") if l.strip()]
assert len(LINES) == len(ORDER), (len(LINES), len(ORDER))
def load(p):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def squeeze(x, cap):
    # shorten internal pauses longer than `cap` seconds (keeps 60 ms of each edge of the silence)
    e = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, "same")); q = e < 10 ** (-45 / 20)
    out = []; i = 0; n = len(x)
    while i < n:
        if q[i]:
            j = i
            while j < n and q[j]: j += 1
            L = j - i
            if L > cap * SR and i > 0 and j < n:
                keep = int(cap * SR); h = keep // 2
                a = x[i:i + h].copy(); b = x[j - h:j].copy()
                a[-120:] *= np.linspace(1, 0, 120); b[:120] *= np.linspace(0, 1, 120)
                out += [a, b]
            else: out.append(x[i:j])
            i = j
        else:
            j = i
            while j < n and not q[j]: j += 1
            out.append(x[i:j]); i = j
    return np.concatenate(out)
def trim(x, thr_db=-45):
    e = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, "same")); nz = np.where(e > 10 ** (thr_db / 20))[0]
    a, b = max(0, nz[0] - 240), min(len(x), nz[-1] + 960); y = x[a:b].copy()
    f = 240; y[:f] *= np.linspace(0, 1, f); y[-f * 4:] *= np.linspace(1, 0, f * 4); return y
out = [np.zeros(int(0.30 * SR), np.float32)]; starts = []
t = 0.30
for i in range(len(LINES)):
    y = squeeze(trim(load(f"{ROOT}/takes/{ORDER[i]}.mp3")), CAP.get(i, 0.4))
    import pyloudnorm as pyln
    L = pyln.Meter(SR, block_size=0.4).integrated_loudness(y)
    y = y * 10 ** ((-22.0 - L) / 20)  # every line at the same loudness
    starts.append(round(t, 3)); out.append(y); t += len(y) / SR
    g = GAP[i] if i < len(GAP) else 0.8; out.append(np.zeros(int(g * SR), np.float32)); t += g
v = np.concatenate(out)
sf.write("public/salee/voice_raw.wav", v, SR, subtype="PCM_24")
json.dump({"line_starts": starts, "duration": round(len(v) / SR, 3)}, open(f"{ROOT}/voice_lines.json", "w"), indent=1)
print("duration", round(len(v) / SR, 2), starts)
