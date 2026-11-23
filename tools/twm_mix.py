"""The World Menu mixer. NO MUSIC: voice + SFX + ambience only.
Usage: python3 tools/twm_mix.py <slug> [--sfx -13] [--amb -24] [--mp3]
Reads public/<slug>/voice.wav, sfx.wav and (optional) amb.wav; writes public/<slug>/mix.wav (48 kHz, 24-bit stereo).
- SFX sit about 13 LU under the voice, ambience about 24 LU under; both are ducked smoothly while the voice speaks.
- Master at -14 LUFS with a look-ahead peak limiter at -1.5 dBFS.
- Prints the loudness of every 3 s window (should stay within about 2 dB while the voice runs)."""
import argparse, os
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal
from scipy.ndimage import maximum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument("slug"); ap.add_argument("--sfx", type=float, default=-13.0); ap.add_argument("--amb", type=float, default=-24.0)
ap.add_argument("--duck-sfx", type=float, default=3.0); ap.add_argument("--duck-amb", type=float, default=6.0)
ap.add_argument("--mp3", action="store_true", help="also write out/<slug>/<slug>_audio.mp3 for review")
a = ap.parse_args()
R = os.path.join(ROOT, "public", a.slug)

def stereo(x): return np.stack([x, x], 1) if x.ndim == 1 else x
v, sr = sf.read(os.path.join(R, "voice.wav")); v = stereo(v)
s, sr2 = sf.read(os.path.join(R, "sfx.wav")); s = stereo(s); assert sr == sr2 == 48000
amb_p = os.path.join(R, "amb.wav")
m = stereo(sf.read(amb_p)[0]) if os.path.exists(amb_p) else np.zeros_like(s)
N = max(len(s), len(v))
pad = lambda x: np.pad(x, ((0, N - len(x)), (0, 0)))
v, s, m = pad(v), pad(s), pad(m)

meter = pyln.Meter(sr)
Lv = meter.integrated_loudness(v)
def to(x, target):
    L = meter.integrated_loudness(x)
    return x if not np.isfinite(L) else x * 10 ** ((target - L) / 20)
s = to(s, Lv + a.sfx); m = to(m, Lv + a.amb)

# ducking: smooth voice-activity envelope (fast attack, slow release) -> gain reduction on SFX and ambience
env = maximum_filter1d(np.abs(v).max(1), size=int(0.02 * sr))
env_db = 20 * np.log10(np.maximum(env, 1e-6))
active = np.clip((env_db - (env_db.max() - 40)) / 12, 0, 1)          # 0 = silence, 1 = voice clearly present
b, a_ = signal.butter(1, 4 / (sr / 2)); active = np.clip(signal.filtfilt(b, a_, maximum_filter1d(active, int(0.25 * sr))), 0, 1)
s = s * (10 ** (-a.duck_sfx * active / 20))[:, None]
m = m * (10 ** (-a.duck_amb * active / 20))[:, None]

mix = to(v + s + m, -14.0)
lim = 10 ** (-1.5 / 20); la = int(0.005 * sr)                        # 5 ms look-ahead
for it in range(3):
    peak = maximum_filter1d(np.abs(mix).max(1), size=2 * la + 1)
    g = np.minimum(1.0, lim / np.maximum(peak, 1e-9))
    b, a_ = signal.butter(1, 30 / (sr / 2)); g = np.minimum(g, signal.filtfilt(b, a_, g))
    mix = mix * g[:, None]
    if it == 0: mix = to(mix, -14.0)
mix = np.clip(mix, -lim, lim)
sf.write(os.path.join(R, "mix.wav"), mix.astype(np.float32), sr, subtype="PCM_24")

print(f"voice {Lv:.1f} LUFS | mix {meter.integrated_loudness(mix):.2f} LUFS | peak {20*np.log10(np.abs(mix).max()):.2f} dBFS")
win = 3 * sr; rows = []
for i in range(0, N - win + 1, win):
    L = meter.integrated_loudness(mix[i:i + win]) if np.abs(mix[i:i + win]).max() > 1e-4 else -99
    rows.append(L); print(f"  {i/sr:5.1f}-{(i+win)/sr:5.1f}s  {L:6.1f} LUFS")
if a.mp3:
    import subprocess
    os.makedirs(os.path.join(ROOT, "out", a.slug), exist_ok=True)
    mp3 = os.path.join(ROOT, "out", a.slug, f"{a.slug}_audio.mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(R, "mix.wav"), "-c:a", "libmp3lame", "-b:a", "256k", mp3], check=True)
    print("mp3:", mp3)
