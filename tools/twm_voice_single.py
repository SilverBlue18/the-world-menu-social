"""TWM voice in ONE continuous take (no chunk joins, natural pauses kept). Fixes what the user heard in the chunked
ketchup voice: odd tone where chunks met, pauses shortened by the assembler. Never time-stretches.
  python3 tools/twm_voice_single.py takes    <slug>   # one ElevenLabs take of the WHOLE script per seed (cached)
  python3 tools/twm_voice_single.py score    <slug>   # Whisper word check vs the script + expressiveness -> best take
  python3 tools/twm_voice_single.py assemble <slug>   # trim, level -22 LUFS, lead 0.4 s / tail 1.2 s -> public/<slug>/voice.wav
Reads projects/<slug>/narration.txt and voice_cfg.json: {"voice", "settings", "lang", "seeds", "say": {"kê-tsiap": "kaychiap"}}.
"say" = TTS spellings for single words (the script/captions keep the real spelling). Key: env ELEVENLABS_API_KEY."""
import sys, os, json, re, glob, hashlib, difflib, subprocess, unicodedata, urllib.request
import numpy as np

cmd, slug = sys.argv[1], sys.argv[2]
R = f"projects/{slug}"; T = f"{R}/takes_single"; PUB = f"public/{slug}"; SR = 48000
os.makedirs(T, exist_ok=True); os.makedirs(PUB, exist_ok=True)
LINES = [l.strip() for l in open(f"{R}/narration.txt", encoding="utf-8") if l.strip()]
CFG = json.load(open(f"{R}/voice_cfg.json"))
SAY = CFG.get("say", {})
SCRIPT = " ".join(LINES)
TTS_TEXT = SCRIPT
for k, v in SAY.items(): TTS_TEXT = TTS_TEXT.replace(k, v)
H = hashlib.sha1((TTS_TEXT + json.dumps(CFG.get("settings"), sort_keys=True)).encode()).hexdigest()[:8]

def norm(w):
    w = unicodedata.normalize("NFKD", w.lower()); w = "".join(c for c in w if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", w)
def load(p, sr):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()

if cmd == "takes":
    key = os.environ["ELEVENLABS_API_KEY"]
    for s in CFG.get("seeds", [11, 29, 47]):
        out = f"{T}/full_{H}_s{s}.mp3"
        if os.path.exists(out): print("cached", out); continue
        body = {"text": TTS_TEXT, "model_id": CFG.get("model", "eleven_multilingual_v2"), "seed": s, "voice_settings": CFG["settings"]}
        if CFG.get("lang"): body["language_code"] = CFG["lang"]
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{CFG['voice']}?output_format=mp3_44100_128",
                                     data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"})
        open(out, "wb").write(urllib.request.urlopen(req, timeout=300).read()); print("take", out, len(TTS_TEXT), "chars", flush=True)

elif cmd == "score":
    from faster_whisper import WhisperModel
    M = WhisperModel(os.environ.get("TWM_WHISPER", "small"), device="cpu", compute_type="int8", cpu_threads=4)
    want = [norm(SAY.get(w.strip(".,:;?!"), w)) for w in SCRIPT.split()]
    res = {}
    for f in sorted(glob.glob(f"{T}/full_{H}_s*.mp3")):
        a = load(f, 16000)
        heard = [norm(w.word) for s in M.transcribe(a, language=CFG.get("lang", "en"), beam_size=5)[0] for w in (s.words or [])] if False else \
                [norm(x) for x in " ".join(s.text for s in M.transcribe(a, language=CFG.get("lang", "en"), beam_size=5)[0]).split()]
        acc = difflib.SequenceMatcher(None, want, heard, autojunk=False).ratio()
        fr = a[: len(a) // 800 * 800].reshape(-1, 800); db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-6); db = db[db > db.max() - 35]
        res[os.path.basename(f)] = dict(acc=round(acc, 3), expr=round(float(db.std()), 2), dur=round(len(a) / 16000, 2))
        print(os.path.basename(f), res[os.path.basename(f)], flush=True)
    top = max(v["acc"] for v in res.values())
    best = max((k for k, v in res.items() if v["acc"] >= top - 0.02), key=lambda k: res[k]["expr"])
    json.dump({"scores": res, "best": best}, open(f"{T}/scores.json", "w"), indent=1); print("chosen:", best)

elif cmd == "assemble":
    import soundfile as sf, pyloudnorm as pyln
    best = CFG.get("pick_single") or json.load(open(f"{T}/scores.json"))["best"]
    x = load(f"{T}/{best}", SR)
    e = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, "same")); nz = np.where(e > 10 ** (-45 / 20))[0]
    y = x[max(0, nz[0] - 240): min(len(x), nz[-1] + 960)].copy(); y[:240] *= np.linspace(0, 1, 240); y[-960:] *= np.linspace(1, 0, 960)
    y = y * 10 ** ((-22.0 - pyln.Meter(SR, block_size=0.4).integrated_loudness(y)) / 20)
    v = np.concatenate([np.zeros(int(0.4 * SR), np.float32), y.astype(np.float32), np.zeros(int(1.2 * SR), np.float32)])
    sf.write(f"{PUB}/voice.wav", v, SR, subtype="PCM_24")
    # line starts from Whisper word times (first word of each narration line)
    from faster_whisper import WhisperModel
    M = WhisperModel(os.environ.get("TWM_WHISPER", "small"), device="cpu", compute_type="int8", cpu_threads=4)
    hw = [(norm(w.word), w.start) for s in M.transcribe(f"{PUB}/voice.wav", language=CFG.get("lang", "en"), word_timestamps=True)[0] for w in s.words]
    sw = [(li, norm(SAY.get(w.strip(".,:;?!"), w))) for li, l in enumerate(LINES) for w in l.split()]
    m = {}
    for blk in difflib.SequenceMatcher(None, [w for _, w in sw], [w for w, _ in hw], autojunk=False).get_matching_blocks():
        for k in range(blk.size): m[blk.a + k] = hw[blk.b + k][1]
    starts, i = [], 0
    for li, l in enumerate(LINES):
        n = len(l.split()); ts = [m[j] for j in range(i, i + n) if j in m]; starts.append(round(ts[0] if ts else (starts[-1] + 1 if starts else 0.4), 3)); i += n
    json.dump({"order": [best], "line_starts": starts, "duration": round(len(v) / SR, 3)}, open(f"{R}/voice_lines.json", "w"), indent=1)
    print("voice", round(len(v) / SR, 2), "s; line starts", starts)
