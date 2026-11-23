import glob, re, subprocess, difflib, json, unicodedata
import numpy as np
from faster_whisper import WhisperModel
M = WhisperModel("bin/whisper-small-ct2", device="cpu", compute_type="int8")
def load(p):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768
def norm(s):
    s = unicodedata.normalize("NFKD", s.lower()); s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z؀-ۿ ]", "", s).strip()
sim = lambda a, b: difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()
SPEC = {2: ("imam", None, "ar", "عبد الرحمن البغدادي"), 3: ("near", "another", "es", "Mallorca"),
        6: ("says", "i", "pt", "Eu muslim"), 9: ("they're", "west", "pt", "Malês")}
REF = {l: t for l, t in enumerate(open("projects/imam/narration.txt").read().strip().split("\n"))}
rows = []
for f in sorted(glob.glob("projects/imam/takes/*.mp3")):
    li = int(re.search(r"L(\d+)_", f).group(1)); a = load(f)
    segs, _ = M.transcribe(a, language="en", word_timestamps=True)
    ws = [w for s in segs for w in s.words]
    en = " ".join(w.word.strip() for w in ws)
    after, before, lang, expect = SPEC[li]
    names = [norm(w.word) for w in ws]
    try:
        i0 = max(i for i, n in enumerate(names) if n == after) + 1 if li != 9 else names.index("theyre") + 1
    except ValueError: i0 = None
    if i0 is None: rows.append((f, 0, 0, en)); continue
    i1 = len(ws) if before is None else next((i for i in range(i0, len(ws)) if names[i] == before), min(i0 + 2, len(ws)))
    s0, s1 = ws[i0].start - 0.08, ws[i1 - 1].end + 0.08
    seg = a[int(s0 * 16000):int(s1 * 16000)]
    seg = np.concatenate([np.zeros(8000, np.float32), seg, np.zeros(8000, np.float32)])
    fs, _ = M.transcribe(seg, language=lang, beam_size=5)
    foreign = " ".join(s.text.strip() for s in fs)
    rest_ok = sim(re.sub(r'"', "", REF[li]), en)
    rows.append((f, round(sim(foreign, expect), 2), round(rest_ok, 2), foreign, round(len(a) / 16000, 2)))
for r in rows: print(r)
json.dump(rows, open("projects/imam/takes/scores.json", "w"), ensure_ascii=False)
