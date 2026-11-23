"""The World Menu sound-effects library. NO MUSIC: no pitched tones, chords, bells or melodies, only noise-based
effects and natural ambience (the channel's halal rule). 48 kHz. Shared by tools/sound_<slug>.py scripts."""
import json
import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(7)

def T(s): return int(s * SR)
def env_adsr(n, a, d, s, r, sl=0.7):
    e = np.ones(n) * sl
    A, D, R = int(a * SR), int(d * SR), int(r * SR)
    A = min(A, n); e[:A] = np.linspace(0, 1, A)
    D = min(D, n - A); e[A:A + D] = np.linspace(1, sl, D)
    if 0 < R < n: e[-R:] *= np.linspace(1, 0, R)
    return e
def lp(x, fc, order=2): b, a = signal.butter(order, fc / (SR / 2), "low"); return signal.lfilter(b, a, x)
def hp(x, fc, order=2): b, a = signal.butter(order, fc / (SR / 2), "high"); return signal.lfilter(b, a, x)
def bp(x, lo, hi, order=2): b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band"); return signal.lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)
def reverb(x, secs=1.2, mix=0.25):
    n = int(secs * SR); ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n)); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    return x * (1 - mix) + signal.fftconvolve(x, ir)[: len(x)] * mix

def place(buf, x, t, gain=1.0, pan=0.0):
    i = T(t)
    if i >= len(buf) or i < 0: return
    x = x[: len(buf) - i]; l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buf[i:i + len(x), 0] += x * gain * l * 1.414; buf[i:i + len(x), 1] += x * gain * r * 1.414

# ---- ambience ----
def wind(dur, gain=1.0):
    n = T(dur); t = np.arange(n) / SR; x = noise(n)
    sweep = 500 + 350 * np.sin(2 * np.pi * 0.11 * t) + 200 * np.sin(2 * np.pi * 0.31 * t)
    out = np.zeros(n); blk = 2400
    for i in range(0, n, blk):
        f = sweep[i]; out[i:i + blk] = bp(x[max(0, i - 4000):i + blk], f * 0.6, f * 1.6)[-min(blk, n - i):]
    return out * env_adsr(n, 0.8, 0.5, 1, 1.5, 1) * gain
def waves(dur):
    n = T(dur); t = np.arange(n) / SR
    am = 0.55 + 0.45 * np.sin(2 * np.pi * 0.16 * t) ** 2
    return lp(noise(n), 700, 2) * am * env_adsr(n, 2, 1, 1, 2.5, 1) * 1.6
def room(dur):
    """Very soft paper-room tone, keeps the silence alive."""
    n = T(dur); return lp(hp(noise(n), 80), 1800) * 0.25 * env_adsr(n, 1.0, 0.1, 1, 1.5, 1)
def creak(dur=1.4):
    """Wooden ship creak: filtered noise bursts with a slow friction envelope (unpitched)."""
    n = T(dur); t = np.arange(n) / SR
    fr = (np.sin(2 * np.pi * 7 * t) > 0.3).astype(float) * np.sin(np.pi * np.clip(t / dur, 0, 1))
    return bp(noise(n), 250, 1100) * lp(fr, 40) * 0.9

# ---- events ----
def whoosh(dur=1.1, up=True):
    n = T(dur); t = np.arange(n) / SR; e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    x = noise(n); out = np.zeros(n); blk = 1200
    for i in range(0, n, blk):
        u = i / n; f = 300 + (2200 if up else 1200) * (u if up else 1 - u)
        out[i:i + blk] = bp(x[max(0, i - 3000):i + blk], f * 0.7, f * 1.5)[-min(blk, n - i):]
    return reverb(out * e * 1.4, 1.2, 0.25)
def paper(dur=0.45):
    n = T(dur); t = np.arange(n) / SR
    x = bp(noise(n), 1500, 6000) * np.exp(-t * 9) * (1 + 0.6 * np.sin(2 * np.pi * 37 * t))
    return x * 0.8 + lp(noise(n), 250) * np.exp(-t * 35) * 2.2
def stamp():
    n = T(0.6); t = np.arange(n) / SR
    x = lp(noise(n), 300) * np.exp(-t * 28) * 3.4 + bp(noise(n), 1000, 4000) * np.exp(-t * 60) * 0.6
    return reverb(x, 0.8, 0.2)
def pen(dur):
    n = T(dur); t = np.arange(n) / SR
    strokes = (np.sin(2 * np.pi * 5.5 * t) > -0.2).astype(float) * (0.6 + 0.4 * np.sin(2 * np.pi * 2.1 * t))
    return bp(noise(n), 2500, 8000) * lp(strokes, 30) * 0.5 * env_adsr(n, 0.05, 0.1, 1, 0.15, 1)
def slide(dur=0.45):
    n = T(dur); t = np.arange(n) / SR
    return bp(noise(n), 900, 5000) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5 * 0.5
def pin():
    """A map pin pressed into paper: short soft knock (unpitched)."""
    n = T(0.25); t = np.arange(n) / SR
    return lp(noise(n), 900) * np.exp(-t * 55) * 2.0 + bp(noise(n), 2000, 6000) * np.exp(-t * 120) * 0.5
def tick():
    n = T(0.05); t = np.arange(n) / SR; return bp(noise(n), 3000, 9000) * np.exp(-t * 300) * 0.6
def sizzle(dur=2.2):
    """Food hitting a hot pan: crackle + hiss."""
    n = T(dur); hiss = hp(noise(n), 3000) * 0.35
    pops = np.zeros(n); idx = rng.integers(0, n, int(dur * 220)); pops[idx] = rng.uniform(0.3, 1, len(idx))
    pops = bp(pops, 1500, 9000) * 1.2
    return (hiss + pops) * env_adsr(n, 0.05, 0.3, 0.8, 0.9, 1)
def grind(dur=0.9):
    """Pepper mill grinding: dense rough crunch."""
    n = T(dur); t = np.arange(n) / SR
    am = (np.sin(2 * np.pi * 14 * t) > 0).astype(float)
    return bp(noise(n), 700, 4500) * lp(am, 60) * 0.8 * env_adsr(n, 0.05, 0.1, 1, 0.2, 1)

# ---- word clock ----
def word_clock(captions_path):
    words = [w for g in json.load(open(captions_path, encoding="utf-8")) for w in g["words"]]
    import unicodedata, re
    def n(s):
        s = unicodedata.normalize("NFKD", s.lower()); s = "".join(c for c in s if not unicodedata.combining(c))
        return re.sub(r"[^a-z0-9']", "", s)
    def wt(word, nth=1, end=False):
        k = 0
        for w in words:
            if n(w["t"]) == n(word):
                k += 1
                if k == nth: return w["e"] if end else w["s"]
        raise KeyError(f"{word} #{nth} not in captions")
    return wt
