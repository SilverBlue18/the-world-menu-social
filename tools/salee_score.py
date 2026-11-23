import glob, re, subprocess, difflib, unicodedata, json
import numpy as np
from faster_whisper import WhisperModel
M = WhisperModel("bin/whisper-large-v3-ct2", device="cpu", compute_type="int8", cpu_threads=4)
ROOT = "projects/salee"
LINES = [l.strip() for l in open(f"{ROOT}/narration.txt") if l.strip()]
def load(p):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768
def norm(s):
    s = unicodedata.normalize("NFKD", s.lower()); s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z ]", "", s).strip()
def best_window(hay, needle):
    h, n = norm(hay), norm(needle); L = len(n); best = 0
    for i in range(0, max(1, len(h) - L + 1)):
        for d in (-2, 0, 2):
            best = max(best, difflib.SequenceMatcher(None, h[i:i + L + d], n).ratio())
    return best
SPEC = {0: ("nl", "Antoni de Turck"), 2: ("nl", "Jan Janszoon"), 3: ("tr", "Murad Reis"), 4: ("fr", "Salé"), 6: ("nl", "Grietje")}
res = {}
for f in sorted(glob.glob(f"{ROOT}/takes/*.mp3")):
    li = int(re.search(r"L(\d+)_", f).group(1)); a = load(f)
    en = " ".join(s.text for s in M.transcribe(a, language="en", beam_size=5)[0])
    en_sim = difflib.SequenceMatcher(None, norm(en), norm(LINES[li].replace("1639", "sixteen thirty nine").replace("1625", "sixteen twenty five"))).ratio()
    score = en_sim; name_sim = None; nat = ""
    if li in SPEC:
        lang, name = SPEC[li]
        nat = " ".join(s.text for s in M.transcribe(a, language=lang, beam_size=5)[0])
        name_sim = max(best_window(nat, name), best_window(en, name) * 0.9)
        score = 0.4 * en_sim + 0.6 * name_sim
    dur = len(a) / 16000
    res[f] = dict(line=li, score=round(score, 3), en_sim=round(en_sim, 3), name_sim=name_sim and round(name_sim, 3), dur=round(dur, 2), en=en.strip(), nat=nat.strip())
    print(f.split("/")[-1], res[f]["score"], res[f]["en_sim"], res[f]["name_sim"], "|", en.strip()[:90], "|", nat.strip()[:60], flush=True)
json.dump(res, open(f"{ROOT}/takes/scores.json", "w"), indent=1, ensure_ascii=False)
