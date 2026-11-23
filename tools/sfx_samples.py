"""Recorded sound effects for The World Menu (NO MUSIC). Samples live in sfx_lib/<source>/<id>.wav (48 kHz stereo).
Every sample in APPROVED was screened for musical/tonal content (tools: narrow sustained spectral peaks); see sfx_lib/README.md.
Mixkit Sound Effects Free License: free for commercial use in videos, no attribution required; do not redistribute the files on their own."""
import os
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, "sfx_lib", "mixkit")

# id -> what it is (only non-tonal sounds; rejected: 772 1109 1468 1799 2299 2925 2933 2934 3005 3135)
APPROVED = {
    1489: "air woosh", 1490: "fast whoosh", 1492: "cinematic fast whoosh", 2604: "deep air woosh", 2605: "quick air woosh",
    2607: "fast air woosh", 2625: "fast air zoom", 2632: "whoosh wind sweep", 167: "long sweeping air swoosh", 1481: "cinematic swoosh",
    1464: "quick swoosh accent", 2358: "long pop", 2364: "hard pop click", 2150: "impact of a blow", 2151: "soft quick punch",
    2155: "strong punch", 2655: "fast impact blow", 2182: "wood hard hit", 1117: "classic click", 1125: "typewriter soft click",
    3194: "writing pencil", 2369: "writing scribble", 1530: "paper slide", 2380: "paper quick movement", 1809: "spice jar open",
    2244: "crunchy chew", 121: "frying eggs", 123: "frying fish", 1187: "wooden ship on the sea", 1196: "sea waves loop",
    1204: "gentle sea wave", 2427: "breeze through trees", 2658: "wind ambience",
}

_cache = {}
def load(i, norm=True):
    """Stereo float array, trimmed of leading silence, peak-normalised to -1 dBFS."""
    if i not in APPROVED: raise KeyError(f"{i} is not an approved (non-tonal) sample")
    if i in _cache: return _cache[i].copy()
    wav = os.path.join(LIB, f"{i}.wav")
    if not os.path.exists(wav):   # only the small .mp3 originals are committed; decode once
        import subprocess
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(LIB, f"{i}.mp3"), "-ar", str(SR), "-ac", "2", wav], check=True)
    x, sr = sf.read(wav, always_2d=True)
    assert sr == SR
    if x.shape[1] == 1: x = np.repeat(x, 2, 1)
    env = np.abs(x).max(1); thr = env.max() * 0.02
    start = max(0, int(np.argmax(env > thr)) - int(0.004 * SR))
    x = x[start:]
    if norm: x = x / (np.abs(x).max() + 1e-9) * 0.89
    _cache[i] = x
    return x.copy()

def fade(x, fi=0.005, fo=0.05):
    x = x.copy(); a, b = int(fi * SR), int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b and b < len(x): x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x
def cut(x, dur, fo=0.08): return fade(x[: int(dur * SR)], 0.003, fo)
def fit(x, dur, xf=0.4):
    """Loop/crossfade an ambience to `dur` seconds."""
    n = int(dur * SR); X = int(xf * SR)
    if len(x) >= n: return fade(x[:n], 0.3, 0.6)
    out = x.copy()
    while len(out) < n:
        r = np.linspace(0, 1, X)[:, None]
        out = np.concatenate([out[:-X], out[-X:] * (1 - r) + x[:X] * r, x[X:]])
    return fade(out[:n], 0.3, 0.6)
def eq(x, hp=None, lp=None):
    if hp: b, a = signal.butter(2, hp / (SR / 2), "high"); x = signal.lfilter(b, a, x, axis=0)
    if lp: b, a = signal.butter(2, lp / (SR / 2), "low"); x = signal.lfilter(b, a, x, axis=0)
    return x
def width(x, w=1.0):
    """Stereo width: 0 = mono, 1 = as is, >1 = wider."""
    m = (x[:, 0] + x[:, 1]) / 2; s = (x[:, 0] - x[:, 1]) / 2 * w
    return np.stack([m + s, m - s], 1)

_rng = np.random.default_rng(11)
def _ir(secs, decay, bright):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = _rng.standard_normal((n, 2)) * np.exp(-t * decay)[:, None]
    b, a = signal.butter(1, bright / (SR / 2), "low"); ir = signal.lfilter(b, a, ir, axis=0)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]   # pre-delay
    return ir / np.sqrt((ir ** 2).sum(0))
ROOM = _ir(0.9, 7.5, 6500)        # small warm room: gives every effect the same space (depth)
def space(x, wet=0.18, ir=ROOM):
    y = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x) + len(ir) - 1] for c in (0, 1)], 1)
    dry = np.pad(x, ((0, len(y) - len(x)), (0, 0)))
    return dry * (1 - wet) + y * wet * 2.2

def put(buf, x, t, gain=1.0, pan=0.0):
    """Mix stereo `x` into `buf` at time t (s), with gain and equal-power balance."""
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    if i >= len(buf): return
    x = x[: len(buf) - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:i + len(x), 0] += x[:, 0] * l; buf[i:i + len(x), 1] += x[:, 1] * r
