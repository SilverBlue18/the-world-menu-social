# Frame QA: black/white frames, frozen spans, sudden jumps. usage: qa.py video.mp4
import subprocess, sys, numpy as np
v = sys.argv[1]
w, h = 135, 240
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", v, "-vf", f"scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
mean = fr.mean((1, 2)); diff = np.abs(np.diff(fr, axis=0)).mean((1, 2))
print("frames", len(fr))
for i, m in enumerate(mean):
    if (m < 8 and 3 < i < len(fr) - 45) or m > 235: print(f"  {'black' if m < 8 else 'white'} frame {i} ({i/30:.2f}s) mean {m:.1f}")
run = 0
for i, d in enumerate(diff):
    run = run + 1 if d < 0.15 else 0
    if run == 12: print(f"  frozen span starting {(i-11)/30:.2f}s")
med = np.median(diff)
for i, d in enumerate(diff):
    if d > max(12, med * 8): print(f"  jump at {i/30:.2f}s diff {d:.1f} (median {med:.2f})")
print("median frame diff", round(float(med), 2))
