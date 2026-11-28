"""Word timings for TWM captions without a forced-alignment model: faster-whisper word timestamps on the final voice,
matched to the SCRIPT words (narration.txt) so captions always show the exact script text.
usage: TWM_WHISPER=small python3 tools/twm_words.py <slug>   ->  projects/<slug>/captions.json (TwmCap format)"""
import json, os, re, sys, difflib, unicodedata
from faster_whisper import WhisperModel

slug = sys.argv[1]; R = f"projects/{slug}"
lines = [l.strip() for l in open(f"{R}/narration.txt", encoding="utf-8") if l.strip()]
en = [l.strip() for l in open(f"{R}/english.txt", encoding="utf-8") if l.strip()] if os.path.exists(f"{R}/english.txt") else []
en += [""] * (len(lines) - len(en))
starts = json.load(open(f"{R}/voice_lines.json"))["line_starts"]
norm = lambda w: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", w.lower()).encode("ascii", "ignore").decode())
M = WhisperModel(os.environ.get("TWM_WHISPER", "small"), device="cpu", compute_type="int8", cpu_threads=4)
segs, _ = M.transcribe(f"public/{slug}/voice.wav", language=os.environ.get("TWM_LANG", "fr"), word_timestamps=True, vad_filter=False)
hw = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
sw = [(li, w) for li, l in enumerate(lines) for w in l.split()]
a, b = [norm(w) for _, w in sw], [norm(w[0]) for w in hw]
times = [None] * len(sw)
for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
    for k in range(blk.size): times[blk.a + k] = (hw[blk.b + k][1], hw[blk.b + k][2])
# fill gaps by interpolation inside each line
for i in range(len(sw)):
    if times[i] is None:
        j = i
        while j < len(sw) and times[j] is None: j += 1
        t0 = times[i - 1][1] if i > 0 and times[i - 1] else starts[sw[i][0]]
        t1 = times[j][0] if j < len(sw) else t0 + 0.3 * (j - i)
        n = j - i
        for k in range(n): times[i + k] = (t0 + (t1 - t0) * k / n, t0 + (t1 - t0) * (k + 1) / n)
caps = []
for li, l in enumerate(lines):
    ws = [{"t": w, "s": round(times[i][0], 3), "e": round(times[i][1], 3)} for i, (lj, w) in enumerate(sw) if lj == li]
    for k, w in enumerate(ws):                     # a line never starts before its own audio
        if w["s"] < starts[li]: w["s"] = round(starts[li] + 0.12 * k, 3); w["e"] = max(w["e"], w["s"] + 0.1)
    caps.append({"start": ws[0]["s"], "end": ws[-1]["e"], "en": en[li], "words": ws})
json.dump(caps, open(f"{R}/captions.json", "w"), ensure_ascii=False, indent=1)
matched = sum(1 for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks() for _ in range(blk.size))
print(f"{matched}/{len(sw)} script words matched to the audio; wrote {R}/captions.json")
for c in caps: print(round(c["start"], 2), round(c["end"], 2), " ".join(w["t"] for w in c["words"])[:70])
