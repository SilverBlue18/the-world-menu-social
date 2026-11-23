# Precise word timings for captions: CTC forced alignment (torchaudio MMS_FA) of the known caption
# text against the final voice. Replaces Whisper's approximate word times in captions JSON.
# usage: python3 tools/align_words.py public/imam/voice.wav src/imam/captions2.json
import sys, json, re, torch, torchaudio
from torchaudio.pipelines import MMS_FA as bundle
wav_path, cap_path = sys.argv[1], sys.argv[2]
SPOKEN = {"1609": "sixteen oh nine", "1618": "sixteen eighteen", "1639": "sixteen thirty nine", "1625": "sixteen twenty five", "1674": "sixteen seventy four", "1835": "eighteen thirty five", "1862": "eighteen sixty two", "1869": "eighteen sixty nine", "1866": "eighteen sixty six"}
def norm(w):
    w = w.lower().replace("ê", "e").replace("é", "e").replace("á", "a").replace("ã", "a").replace("ç", "c").replace("-", " ").replace("’", "'")
    w = re.sub(r"[^a-z0-9' ]", "", w)
    out = []
    for p in w.split():
        out += SPOKEN.get(p, p).split() if p.isdigit() else [p.strip("'")]
    return [p for p in out if p]
caps = json.load(open(cap_path))
words = [w for g in caps for w in g["words"]]
toks, owner = [], []
for i, w in enumerate(words):
    for p in norm(w["t"]):
        toks.append(p); owner.append(i)
import soundfile as sf
_a, sr = sf.read(wav_path, dtype="float32", always_2d=True)
wav = torch.from_numpy(_a.T.copy())
wav = torchaudio.functional.resample(wav.mean(0, keepdim=True), sr, bundle.sample_rate)
model = bundle.get_model(); tokenizer = bundle.get_tokenizer(); aligner = bundle.get_aligner()
with torch.inference_mode():
    emission, _ = model(wav)
    spans = aligner(emission[0], tokenizer(toks))
ratio = wav.shape[1] / emission.shape[1] / bundle.sample_rate
st = {}; en = {}
for k, sp in enumerate(spans):
    i = owner[k]; a = sp[0].start * ratio; b = sp[-1].end * ratio
    st[i] = min(st.get(i, 1e9), a); en[i] = max(en.get(i, 0), b)
# snap: a word that follows a pause starts exactly where the sound starts (CTC can put short words late)
import numpy as np
mono = _a.mean(1); hop = int(sr * 0.005)
env = np.array([np.sqrt(np.mean(mono[i:i + 2 * hop] ** 2) + 1e-12) for i in range(0, len(mono) - 2 * hop, hop)])
db = 20 * np.log10(env / env.max() + 1e-9); quiet = db < -42
onsets, run = [], 0
for i, q in enumerate(quiet):
    if q: run += 1
    else:
        if run * 0.005 >= 0.08: onsets.append(i * 0.005)
        run = 0
for i in range(len(words)):
    prev_end = en[i - 1] if i else 0.0
    cand = [o for o in onsets if prev_end - 0.02 <= o <= st[i] + 0.03 and st[i] - o < 0.4]
    if cand: st[i] = cand[-1] if cand[-1] <= st[i] else min(st[i], cand[0])
old = [(w["s"], w["e"]) for w in words]
for i, w in enumerate(words):
    w["s"], w["e"] = round(st[i], 3), round(en[i], 3)
d = [abs(w["s"] - o[0]) for w, o in zip(words, old)]
print(f"{len(words)} words aligned; shift vs old: mean {sum(d)/len(d)*1000:.0f} ms, max {max(d)*1000:.0f} ms")
for w, o in zip(words, old):
    if abs(w["s"] - o[0]) > 0.12: print(f"  {w['t']:<16} old {o[0]:6.2f} -> new {w['s']:6.2f}")
json.dump(caps, open(cap_path, "w"), ensure_ascii=False, indent=1)
