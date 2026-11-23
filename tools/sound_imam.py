"""Synthesized score + SFX for 'The Lost Imam'. Writes public/imam/music.wav, sfx.wav, mix.wav (48 kHz stereo)."""
import json, subprocess, sys
import numpy as np
from scipy import signal
import soundfile as sf

SR = 48000
DUR = 75.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
ROOT = "/home/user/studio/public/imam"

def T(s): return int(s * SR)
def env_adsr(n, a, d, s, r, sl=0.7):
    e = np.ones(n) * sl
    A, D, R = int(a * SR), int(d * SR), int(r * SR)
    A = min(A, n); e[:A] = np.linspace(0, 1, A)
    D = min(D, n - A); e[A:A + D] = np.linspace(1, sl, D)
    if R > 0 and R < n: e[-R:] *= np.linspace(1, 0, R)
    return e
def lp(x, fc, order=2): b, a = signal.butter(order, fc / (SR / 2), "low"); return signal.lfilter(b, a, x)
def hp(x, fc, order=2): b, a = signal.butter(order, fc / (SR / 2), "high"); return signal.lfilter(b, a, x)
def bp(x, lo, hi, order=2): b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band"); return signal.lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)
_WP = json.load(open("/home/user/studio/src/imam/warp.json"))
_NEW = np.array([p[0] for p in _WP]); _OLD = np.array([p[1] for p in _WP])
def remap(t):  # layout (old) time -> voice v4 time
    return float(np.interp(t, _OLD, _NEW)) if t > 0 else t
def place(buf, x, t, gain=1.0, pan=0.0):
    i = T(remap(t))
    if i >= len(buf): return
    x = x[: len(buf) - i]
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    if x.ndim == 1:
        buf[i:i + len(x), 0] += x * gain * l * 1.414
        buf[i:i + len(x), 1] += x * gain * r * 1.414
    else:
        buf[i:i + len(x)] += x * gain
def reverb(x, secs=2.5, mix=0.3, seed=0):
    n = int(secs * SR); r = np.random.default_rng(int(seed * 1000))
    ir = r.standard_normal(n) * np.exp(-np.linspace(0, 7, n)); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    wet = signal.fftconvolve(x, ir)[: len(x)]
    return x * (1 - mix) + wet * mix
def hz(note):  # midi → Hz
    return 440 * 2 ** ((note - 69) / 12)

# ---------------- instruments ----------------
def pad(freqs, dur, bright=900, a=2.5, r=3.0):
    n = T(dur); t = np.arange(n) / SR; out = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            ph = rng.uniform(0, 1)
            saw = 2 * ((t * ff + ph) % 1) - 1
            out += saw * (1 + 0.15 * np.sin(2 * np.pi * 0.2 * t + ph * 6))
    out = lp(out, bright, 2) / (len(freqs) * 3)
    return out * env_adsr(n, a, 1.0, 0.9, r, 0.9)
def drone(f, dur, a=3, r=4):
    n = T(dur); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2 * t + 0.3) + 0.25 * np.sin(2 * np.pi * f * 3.01 * t)
    x *= 1 + 0.2 * np.sin(2 * np.pi * 0.13 * t)
    return x * env_adsr(n, a, 1, 1, r, 1) * 0.5
def pluck(f, dur=2.2, bright=0.5):
    # Karplus-Strong, oud-like
    n = T(dur); L = int(SR / f)
    buf = lp(rng.uniform(-1, 1, L), 2500 + 4000 * bright, 1)
    out = np.zeros(n); y = np.concatenate([buf, np.zeros(n)])
    for i in range(L, n + L - 1):
        y[i] = 0.4985 * (y[i - L] + y[i - L + 1])
        if i - L >= n - 1: break
    out = y[L:L + n]
    out = out * np.exp(-np.linspace(0, 3.2, n))
    return hp(out, 90) * 0.9
def timpani(f=55, dur=2.5, g=1.0):
    n = T(dur); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t * (1 + 0.04 * np.exp(-t * 8))) * np.exp(-t * 2.2)
    x += lp(noise(n), 400) * np.exp(-t * 18) * 0.5
    return x * g
def boom(dur=4.0):
    n = T(dur); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * (38 + 30 * np.exp(-t * 3)) * t) * np.exp(-t * 1.1)
    x += lp(noise(n), 180) * np.exp(-t * 1.5) * 0.8
    return x

# ---------------- SFX ----------------
def thunder(dur=5.0):
    n = T(dur); t = np.arange(n) / SR
    crack = hp(noise(n), 1500) * np.exp(-t * 30) * 0.9
    rumble = lp(noise(n), 160, 2) * (np.exp(-t * 0.8) * (1 + 0.6 * np.sin(2 * np.pi * 1.3 * t))) * 3.0
    mid = bp(noise(n), 150, 900) * np.exp(-t * 2.5) * 0.7
    return reverb(crack + rumble + mid, 3, 0.4)
def wind(dur, gain=1.0):
    n = T(dur); t = np.arange(n) / SR
    x = noise(n)
    sweep = 500 + 350 * np.sin(2 * np.pi * 0.11 * t) + 200 * np.sin(2 * np.pi * 0.31 * t)
    out = np.zeros(n); blk = 2400
    for i in range(0, n, blk):
        f = sweep[i]; out[i:i + blk] = bp(x[max(0, i - 4000):i + blk], f * 0.6, f * 1.6)[-min(blk, n - i):]
    return out * env_adsr(n, 0.8, 0.5, 1, 1.5, 1) * gain
def rain(dur):
    n = T(dur)
    x = hp(noise(n), 2500) * 0.25
    drops = np.zeros(n); idx = rng.integers(0, n, int(dur * 300)); drops[idx] = rng.uniform(0.2, 1, len(idx))
    drops = bp(drops, 2000, 7000) * 0.6
    return (x + drops) * env_adsr(n, 0.6, 0.5, 1, 1.2, 1)
def waves(dur):
    n = T(dur); t = np.arange(n) / SR
    x = lp(noise(n), 700, 2)
    am = 0.55 + 0.45 * np.sin(2 * np.pi * 0.16 * t) ** 2
    return x * am * env_adsr(n, 2, 1, 1, 2.5, 1) * 1.6
def whoosh(dur=1.1, up=True):
    n = T(dur); t = np.arange(n) / SR
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    x = noise(n); out = np.zeros(n); blk = 1200
    for i in range(0, n, blk):
        u = i / n; f = 300 + (2200 if up else 1200) * (u if up else 1 - u)
        out[i:i + blk] = bp(x[max(0, i - 3000):i + blk], f * 0.7, f * 1.5)[-min(blk, n - i):]
    return reverb(out * e * 1.4, 1.2, 0.25)
def paper(dur=0.45):
    n = T(dur); t = np.arange(n) / SR
    x = bp(noise(n), 1500, 6000) * np.exp(-t * 9) * (1 + 0.6 * np.sin(2 * np.pi * 37 * t))
    thump = lp(noise(n), 250) * np.exp(-t * 35) * 2.2
    return x * 0.8 + thump
def stamp():
    n = T(0.6); t = np.arange(n) / SR
    x = lp(noise(n), 300) * np.exp(-t * 28) * 3 + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 25) * 1.5 + bp(noise(n), 1000, 4000) * np.exp(-t * 60) * 0.6
    return reverb(x, 0.8, 0.2)
def pen(dur):
    n = T(dur); t = np.arange(n) / SR
    strokes = (np.sin(2 * np.pi * 5.5 * t) > -0.2).astype(float) * (0.6 + 0.4 * np.sin(2 * np.pi * 2.1 * t))
    return bp(noise(n), 2500, 8000) * lp(strokes, 30) * 0.5 * env_adsr(n, 0.05, 0.1, 1, 0.15, 1)
def chime(f=1320, dur=3.0):
    n = T(dur); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (1.6 + k)) / k for k in (1, 2.76, 5.4))
    return reverb(x * 0.35, 2.5, 0.45)
def ticks(dur, rate=14):
    n = T(dur); out = np.zeros(n); k = int(SR / rate); click = bp(noise(400), 2000, 6000) * np.exp(-np.arange(400) / 60)
    for i in range(0, n - 400, k + rng.integers(-k // 4, k // 4)): out[i:i + 400] += click * rng.uniform(0.4, 1)
    return out * 0.6
def bookthud():
    n = T(1.2); t = np.arange(n) / SR
    return reverb(lp(noise(n), 200) * np.exp(-t * 14) * 3.5 + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 12) * 1.5, 1.5, 0.3)

# ---------------- score ----------------
music = np.zeros((N, 2))
D2, A2 = 38, 45
# hijaz on D: D Eb F# G A Bb C D
HIJAZ = [62, 63, 66, 67, 69, 70, 72, 74]
def chord(notes, start, dur, gain, bright=900, pan=0.0, a=2.5, r=3.0):
    x = reverb(pad([hz(m) for m in notes], dur, bright, a, r), 3, 0.35, seed=start)
    place(music, x, start, gain, pan)
place(music, drone(hz(D2), 7.6, a=0.5, r=2.0), 0.0, 0.55)
place(music, drone(hz(D2), 21.5, a=2.0, r=3.5), 7.0, 0.42)
chord([50, 57, 62, 65], 7.2, 8.6, 0.30, 800)           # Dm
chord([51, 58, 62, 66], 15.2, 5.4, 0.30, 900)          # Eb (hijaz colour)
chord([50, 57, 62, 66], 20.2, 8.4, 0.32, 1100)         # D (major 3rd, hijaz tension) under storms
chord([46, 53, 58, 62], 28.4, 7.0, 0.30, 1300)         # Bb — arrival in Rio, warmer
chord([48, 55, 60, 64], 35.0, 6.4, 0.26, 1200)         # C
chord([50, 57, 62, 65, 69], 41.0, 4.6, 0.30, 1500)     # Dm add9 — prayer
chord([46, 53, 58, 61], 45.4, 5.0, 0.30, 800)          # Bbm — Malês, darker
chord([45, 52, 57, 60], 50.2, 4.8, 0.32, 700)          # Am low — revolt / hidden
chord([46, 53, 58, 62], 54.8, 7.6, 0.30, 1200)         # Bb — imam stays
chord([43, 50, 55, 58], 62.2, 3.8, 0.28, 900)          # Gm — vanishes
chord([50, 57, 62, 66, 69], 65.6, 6.4, 0.34, 1400, a=1.5, r=4.5)  # D (picardy) — the book
place(music, drone(hz(D2), 27, a=4, r=6), 45.0, 0.36)
# timpani pulses under the storms and the flight
for tt, g in [(7.4, 0.5), (11.62, 0.7), (13.2, 0.5), (19.95, 0.9), (21.45, 0.9), (22.9, 0.5), (23.9, 0.4), (51.0, 0.9)]:
    place(music, reverb(timpani(hz(D2 - 12) * 2, 2.5, g), 2, 0.3), tt, 0.55)
# oud motif (hijaz), sparse
def motif(start, notes, step=0.36, gain=0.32, pan=-0.2):
    for i, m in enumerate(notes):
        if m is None: continue
        place(music, reverb(pluck(hz(m), 2.0, 0.6), 1.8, 0.3, seed=i), start + i * step, gain, pan)
motif(8.0, [62, 63, 66, 67, 66, 63, 62, None, 69, 67, 66, 63, 62])
motif(29.0, [74, 72, 70, 69, None, 67, 66, 67])
motif(55.4, [62, 66, 67, 69, None, 70, 69, 67, 66, 63, 62], step=0.42, gain=0.30)
motif(66.0, [69, 70, 72, 74], step=0.6, gain=0.28)
place(music, boom(), 53.5, 0.35)
music = np.stack([reverb(music[:, 0], 1.5, 0.12, seed=1), reverb(music[:, 1], 1.5, 0.12, seed=2)], 1)
music[: T(0.3)] *= np.linspace(0, 1, T(0.3))[:, None]
music[-T(2.5):] *= np.linspace(1, 0, T(2.5))[:, None]

# ---------------- SFX track (continuous map version; layout times are remapped to the voice) ----------------
def placeN(buf, x, t, gain=1.0, pan=0.0):
    i = T(t)
    if i >= len(buf): return
    x = x[: len(buf) - i]
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buf[i:i + len(x), 0] += x * gain * l * 1.414
    buf[i:i + len(x), 1] += x * gain * r * 1.414
def slide(dur=0.45):
    n = T(dur); t = np.arange(n) / SR
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return bp(noise(n), 900, 5000) * e * 0.5
def clink():
    n = T(1.2); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(2350, 9), (3710, 12), (5230, 16)]) * 0.25
    return reverb(x + lp(noise(n), 400) * np.exp(-t * 40) * 1.2, 0.8, 0.2)
def tick():
    n = T(0.05); t = np.arange(n) / SR
    return bp(noise(n), 3000, 9000) * np.exp(-t * 300) * 0.6
sfx = np.zeros((N, 2))
# calm opening: soft rain + distant rumble under the voice
placeN(sfx, rain(4.5), 0.0, 0.14, -0.1)
placeN(sfx, wind(5.0, 1.0), 0.0, 0.16, 0.2)
placeN(sfx, lp(thunder(), 700), 0.35, 0.16, -0.2)
place(sfx, waves(21.0), 7.2, 0.22, 0.0)
# storms on the voyage: wind + distant thunder, never loud
place(sfx, wind(5.5, 1.0), 19.6, 0.2, -0.3)
place(sfx, rain(5.0), 19.8, 0.14, 0.2)
place(sfx, lp(thunder(), 900), 20.05, 0.18, 0.3)
place(sfx, lp(thunder(), 900), 21.5, 0.16, -0.3)
place(sfx, ticks(2.6, 14), 23.1, 0.3, 0.2)
# camera glides
for tt, up, g in [(7.0, True, 0.45), (12.9, False, 0.35), (15.4, True, 0.3), (21.6, True, 0.4), (34.6, True, 0.28),
                  (40.7, True, 0.28), (44.9, True, 0.28), (46.4, False, 0.32), (49.8, True, 0.3), (54.6, True, 0.28), (58.2, True, 0.25),
                  (62.4, False, 0.3), (65.3, True, 0.25)]:
    place(sfx, whoosh(1.2, up), tt, g, rng.uniform(-0.3, 0.3))
# cards and prints landing on the map
for tt in [4.75, 15.35, 28.1, 32.15, 35.3, 41.3, 45.2, 52.4, 58.4]:
    place(sfx, paper(), tt + 0.1, 0.55, rng.uniform(-0.2, 0.2))
place(sfx, bookthud(), 65.85, 0.6)
place(sfx, pen(0.35), 11.62, 0.5)
place(sfx, stamp(), 11.9, 0.6)
place(sfx, stamp(), 51.0, 0.65)
place(sfx, pen(1.4), 17.45, 0.45)
place(sfx, pen(0.8), 37.7, 0.4)
place(sfx, pen(2.0), 59.4, 0.45)
for tt, f in [(9.0, 1320), (9.9, 1480), (28.0, 1175), (56.9, 1320)]:
    place(sfx, chime(f), tt, 0.22)

# ---------------- mix ----------------
voice, vsr = sf.read(ROOT + "/voice.wav")
if voice.ndim > 1: voice = voice.mean(1)
assert vsr == SR, vsr
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
# ducking envelope from voice
env = np.abs(voice); env = lp(env, 6, 1); env /= env.max() + 1e-9
duck = 1 - 0.55 * np.clip(env * 4, 0, 1)
duck = lp(duck, 3, 1)
music *= duck[:, None]
sfx *= (1 - 0.25 * np.clip(env * 4, 0, 1))[:, None]
def norm_rms(x, target_db):
    rms = np.sqrt((x ** 2).mean()) + 1e-9
    return x * (10 ** (target_db / 20) / rms)
music = norm_rms(music, -27)
sfx = norm_rms(sfx, -29)
vo = np.stack([voice, voice], 1)
mix = vo + music + sfx
sf.write(ROOT + "/music.wav", music.astype(np.float32), SR)
sf.write(ROOT + "/sfx.wav", sfx.astype(np.float32), SR)
sf.write(ROOT + "/mix_raw.wav", mix.astype(np.float32), SR)
print("written", mix.shape)
