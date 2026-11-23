import numpy as np, soundfile as sf, pyloudnorm as pyln, sys
R = sys.argv[3] if len(sys.argv) > 3 else "/home/user/studio/public/imam/"
MUS_REL = float(sys.argv[1]) if len(sys.argv) > 1 else -12
SFX_REL = float(sys.argv[2]) if len(sys.argv) > 2 else -10
v, sr = sf.read(R + "voice.wav"); m, _ = sf.read(R + "music.wav"); s, _ = sf.read(R + "sfx.wav")
N = len(m); v = np.pad(v, (0, max(0, N - len(v))))[:N]; v2 = np.stack([v, v], 1)
meter = pyln.Meter(sr)
Lv = meter.integrated_loudness(v2)
g = lambda x, target: x * 10 ** ((target - meter.integrated_loudness(x)) / 20)
m = g(m, Lv + MUS_REL); s = g(s, Lv + SFX_REL)
mix = v2 + m + s
mix = g(mix, -14.0)
# look-ahead peak limiter at -1.5 dBFS
from scipy.ndimage import maximum_filter1d
from scipy import signal
lim = 10 ** (-1.5 / 20)
for _ in range(2):
    peak = maximum_filter1d(np.abs(mix).max(1), size=int(0.006 * sr))
    gain = np.minimum(1.0, lim / np.maximum(peak, 1e-9))
    b_, a_ = signal.butter(1, 8 / (sr / 2))
    gain = np.minimum(gain, signal.filtfilt(b_, a_, gain))
    mix = mix * gain[:, None]
    mix = g(mix, -14.0) if _ == 0 else mix
sf.write(R + "mix.wav", mix.astype(np.float32), sr, subtype="PCM_24")
print("LUFS", round(meter.integrated_loudness(mix), 2), "peak", round(np.abs(mix).max(), 3))
