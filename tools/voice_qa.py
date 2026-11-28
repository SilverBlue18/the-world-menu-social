"""Listen-check a finished TWM voice the way a viewer hears it, BEFORE the video is built (user rule, 2026-11-28).
Flags: (1) script words Whisper did not hear as written (mispronounced / split names, e.g. "kê-tsiap" -> "K. Tsiap"),
(2) pauses that feel wrong: > 1.0 s inside the narration, or < 0.08 s across a sentence end (rushed),
(3) sudden loudness jumps (> 6 dB between neighbouring 0.5 s windows while speaking, e.g. at a take join).
usage: python3 tools/voice_qa.py <slug> [--lang en]   (reads projects/<slug>/narration.txt + voice_cfg.json "say", public/<slug>/voice.wav)
Exit code 1 when something is flagged, so it can gate a render."""
import sys, os, json, re, difflib, unicodedata, subprocess
import numpy as np
from faster_whisper import WhisperModel

slug = sys.argv[1]; lang = sys.argv[sys.argv.index("--lang") + 1] if "--lang" in sys.argv else "en"
R = f"projects/{slug}"; CFG = json.load(open(f"{R}/voice_cfg.json")) if os.path.exists(f"{R}/voice_cfg.json") else {}
SAY = CFG.get("say", {})
words = [w for l in open(f"{R}/narration.txt", encoding="utf-8") if l.strip() for w in l.split()]
def norm(w):
    w = unicodedata.normalize("NFKD", w.lower()); w = "".join(c for c in w if not unicodedata.combining(c)); return re.sub(r"[^a-z0-9]", "", w)
M = WhisperModel(os.environ.get("TWM_WHISPER", "small"), device="cpu", compute_type="int8", cpu_threads=4)
hw = [(w.word.strip(), w.start, w.end) for s in M.transcribe(f"public/{slug}/voice.wav", language=lang, word_timestamps=True, beam_size=5)[0] for w in s.words]
want = [norm(SAY.get(w.strip(".,:;?!"), w)) for w in words]; got = [norm(w) for w, _, _ in hw]
flags = []
sm = difflib.SequenceMatcher(None, want, got, autojunk=False)
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op != "equal":
        t = hw[b0][1] if b0 < len(hw) else hw[-1][2]
        ok = [norm(x) for w in words[a0:a1] for x in CFG.get("heard_ok", {}).get(w.strip(".,:;?!"), [])]
        if ok and norm("".join(w for w, _, _ in hw[b0:b1])) in ok: continue   # the intended pronunciation, just spelled differently
        flags.append((t, "WORD", f"script '{' '.join(words[a0:a1])}' heard as '{' '.join(w for w, _, _ in hw[b0:b1])}'"))
for (w1, s1, e1), (w2, s2, e2) in zip(hw, hw[1:]):
    gap = s2 - e1
    if gap > 1.0: flags.append((e1, "PAUSE", f"{gap:.2f}s silence after '{w1}'"))
    if w1[-1:] in ".?!" and gap < 0.08: flags.append((e1, "RUSHED", f"no breath after '{w1}' ({gap:.2f}s)"))
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", f"public/{slug}/voice.wav", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.float32)
wdb = [20 * np.log10(np.sqrt((a[int(s * 16000):max(int(e * 16000), int(s * 16000) + 160)] ** 2).mean()) + 1e-7) for _, s, e in hw]
for i in range(len(hw)):                       # a word much louder/quieter than the words around it (typical at a take join)
    near = wdb[max(0, i - 4):i] + wdb[i + 1:i + 5]
    if len(near) >= 4 and abs(wdb[i] - float(np.median(near))) > 9: flags.append((hw[i][1], "LEVEL", f"'{hw[i][0]}' is {wdb[i] - float(np.median(near)):+.1f} dB vs its neighbours"))
for t, kind, msg in sorted(flags): print(f"{int(t // 60)}:{t % 60:05.2f}  {kind:<6} {msg}")
print(f"{len(flags)} flag(s); word match {sm.ratio():.3f}; {len(hw)} words heard / {len(words)} in script")
sys.exit(1 if flags else 0)
