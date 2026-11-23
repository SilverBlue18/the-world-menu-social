# Precise word timings for FRENCH captions: CTC forced alignment with a French wav2vec2 model
# (jonatasgrosman/wav2vec2-large-xlsr-53-french, downloaded from Hugging Face into bin/w2v2-fr).
# Same job and output as tools/align_words.py (MMS_FA), which needs download.pytorch.org.
# usage: python3 tools/align_words_fr.py <voice.wav|mp3> <captions.json>
# captions.json: list of groups, each with "words": [{"t": "mot", "s": start, "e": end}, ...]
import sys, json, re, subprocess, unicodedata
import numpy as np, torch, torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

MODEL = "bin/w2v2-fr"
wav_path, cap_path = sys.argv[1], sys.argv[2]

NUM = {"0": "zéro", "1": "un", "2": "deux", "3": "trois", "4": "quatre", "5": "cinq", "6": "six", "7": "sept", "8": "huit", "9": "neuf", "10": "dix"}

proc = Wav2Vec2Processor.from_pretrained(MODEL)
model = Wav2Vec2ForCTC.from_pretrained(MODEL).eval()
vocab = proc.tokenizer.get_vocab()
blank = proc.tokenizer.pad_token_id
sep = vocab.get("|")

def norm(w):
    w = w.lower().replace("’", "'").replace("œ", "oe").replace("æ", "ae").replace("-", " ")
    out = []
    for p in w.split():
        p = NUM.get(p, p)
        chars = []
        for ch in p:
            if ch in vocab: chars.append(ch)
            else:
                base = unicodedata.normalize("NFD", ch)[0]
                if base in vocab: chars.append(base)
        if chars: out.append("".join(chars))
    return out

caps = json.load(open(cap_path))
words = [w for g in caps for w in g["words"]]
toks, owner = [], []
for i, w in enumerate(words):
    for p in norm(w["t"]):
        if toks and sep is not None: toks.append("|"); owner.append(-1)
        for ch in p: toks.append(ch); owner.append(i)

# 16 kHz mono via ffmpeg (handles wav and mp3)
a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", wav_path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                                 capture_output=True, check=True).stdout, np.float32)
with torch.inference_mode():
    inp = proc(a, sampling_rate=16000, return_tensors="pt").input_values
    logp = torch.log_softmax(model(inp).logits, dim=-1)
ids = torch.tensor([[vocab[t] for t in toks]], dtype=torch.int32)
ali, _ = torchaudio.functional.forced_align(logp, ids, blank=blank)
ali = ali[0].tolist()
ratio = len(a) / 16000 / logp.shape[1]

# map frames to token indices
st, en = {}, {}
k = -1; prev = blank
for f, tok in enumerate(ali):
    if tok != blank and (tok != prev or prev == blank):
        k += 1
    if tok != blank and 0 <= k < len(owner) and owner[k] >= 0:
        i = owner[k]; t0 = f * ratio; t1 = (f + 1) * ratio
        st[i] = min(st.get(i, 1e9), t0); en[i] = max(en.get(i, 0), t1)
    prev = tok

# snap words that follow a pause to the audio onset (same rule as align_words.py)
hop = 80
env = np.array([np.sqrt(np.mean(a[j:j + 2 * hop] ** 2) + 1e-12) for j in range(0, len(a) - 2 * hop, hop)])
db = 20 * np.log10(env / env.max() + 1e-9); quiet = db < -42
onsets, run = [], 0
for j, q in enumerate(quiet):
    if q: run += 1
    else:
        if run * 0.005 >= 0.08: onsets.append(j * 0.005)
        run = 0
for i in range(len(words)):
    if i not in st: continue
    prev_end = en.get(i - 1, 0.0)
    cand = [o for o in onsets if prev_end - 0.02 <= o <= st[i] + 0.03 and st[i] - o < 0.4]
    if cand: st[i] = cand[-1] if cand[-1] <= st[i] else min(st[i], cand[0])

# words with no letters (e.g. "1493"): place them between their aligned neighbours
for i in range(len(words)):
    if i in st: continue
    a = en.get(i - 1, 0.0) + 0.04
    nxt = next((st[j] for j in range(i + 1, len(words)) if j in st), a + 0.6)
    st[i], en[i] = a, max(a + 0.1, nxt - 0.04)
old = [(w.get("s", 0), w.get("e", 0)) for w in words]
missing = 0
for i, w in enumerate(words):
    if i in st: w["s"], w["e"] = round(st[i], 3), round(en[i], 3)
    else: missing += 1
    if not any(ch.isalpha() for ch in w["t"]): missing += 1
d = [abs(w["s"] - o[0]) for w, o in zip(words, old)]
print(f"{len(words)} words aligned ({missing} without letters placed between neighbours); shift vs old: mean {sum(d)/len(d)*1000:.0f} ms, max {max(d)*1000:.0f} ms")
json.dump(caps, open(cap_path, "w"), ensure_ascii=False, indent=1)
