# The World Menu voice pipeline (French), one command per step:
#   python3 tools/twm_voice.py takes    <slug>   # ElevenLabs takes per line (prev/next text, several seeds)
#   python3 tools/twm_voice.py score    <slug>   # Whisper large-v3 (fr) vs the script -> pick best take per line
#   python3 tools/twm_voice.py assemble <slug>   # trim, cap pauses, level each line to -22 LUFS, add gaps -> public/<slug>/voice.wav
# Reads projects/<slug>/narration.txt (one line per narration line) and optional projects/<slug>/voice_cfg.json:
#   {"gaps": {"0": 0.6, ...}, "seeds": [11, 29], "extra_seeds": {"5": [47]}, "spell": {"5": "texte phonétique"}}
# Never time-stretches the voice. Key: env ELEVENLABS_API_KEY or ~/.secrets/elevenlabs_key (never printed).
import sys, os, json, glob, re, subprocess, difflib, unicodedata, urllib.request
import numpy as np

VOICE = "iKX6IXB415Hh5bn2eNhP"  # David Tyserre (native French narrator)
SETTINGS = {"stability": 0.55, "similarity_boost": 0.75, "style": 0.15, "use_speaker_boost": True, "speed": 1.1}
SR = 48000

cmd, slug = sys.argv[1], sys.argv[2]
ROOT = f"projects/{slug}"; TAKES = f"{ROOT}/takes"; PUB = f"public/{slug}"
os.makedirs(TAKES, exist_ok=True); os.makedirs(PUB, exist_ok=True)
LINES = [l.strip() for l in open(f"{ROOT}/narration.txt", encoding="utf-8") if l.strip()]
CFG = json.load(open(f"{ROOT}/voice_cfg.json")) if os.path.exists(f"{ROOT}/voice_cfg.json") else {}

def key():
    k = os.environ.get("ELEVENLABS_API_KEY")
    if not k:
        with open(os.path.expanduser("~/.secrets/elevenlabs_key")) as f: k = f.read().strip()
    return k

def tts(text, prev, nxt, seed, out):
    body = {"text": text, "model_id": "eleven_multilingual_v2", "language_code": "fr", "previous_text": prev, "next_text": nxt,
            "seed": seed, "voice_settings": SETTINGS}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": key(), "Content-Type": "application/json"})
    try:
        data = urllib.request.urlopen(req, timeout=180).read()
    except urllib.error.HTTPError as e:
        if e.code == 400 and "language_code" in body:  # model may not accept language_code
            body.pop("language_code"); req.data = json.dumps(body).encode(); data = urllib.request.urlopen(req, timeout=180).read()
        else: raise
    open(out, "wb").write(data)

def load(p, sr):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def norm(s):
    s = unicodedata.normalize("NFKD", s.lower()); s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]", " ", s).split()

if cmd == "takes":
    seeds = CFG.get("seeds", [11, 29])
    only = set(int(x) for x in sys.argv[3:]) if len(sys.argv) > 3 else None
    for i, line in enumerate(LINES):
        if only is not None and i not in only: continue
        text = CFG.get("spell", {}).get(str(i), line)
        prev = " ".join(LINES[max(0, i - 2):i]); nxt = " ".join(LINES[i + 1:i + 2])
        for s in seeds + CFG.get("extra_seeds", {}).get(str(i), []):
            out = f"{TAKES}/L{i:02d}_s{s}.mp3"
            if os.path.exists(out): continue
            tts(text, prev, nxt, s, out); print("take", os.path.basename(out), flush=True)

elif cmd == "score":
    from faster_whisper import WhisperModel
    M = WhisperModel("bin/whisper-large-v3-ct2", device="cpu", compute_type="int8", cpu_threads=4)
    res = {}
    for f in sorted(glob.glob(f"{TAKES}/L*_s*.mp3")):
        li = int(re.search(r"L(\d+)_", f).group(1)); a = load(f, 16000)
        hyp = " ".join(s.text for s in M.transcribe(a, language="fr", beam_size=5)[0]).strip()
        sim = difflib.SequenceMatcher(None, norm(hyp), norm(LINES[li])).ratio()
        res[os.path.basename(f)] = dict(line=li, score=round(sim, 3), dur=round(len(a) / 16000, 2), heard=hyp)
        print(f"{os.path.basename(f):<14} {sim:.3f} {len(a)/16000:5.2f}s | {hyp}", flush=True)
    best = {}
    for k, v in res.items():
        li = v["line"]
        # best score; on a tie (within 0.01) prefer the shorter take
        if li not in best or v["score"] > res[best[li]]["score"] + 0.01 or (abs(v["score"] - res[best[li]]["score"]) <= 0.01 and v["dur"] < res[best[li]]["dur"]):
            best[li] = k
    json.dump({"scores": res, "order": [best[i] for i in range(len(LINES))]}, open(f"{TAKES}/scores.json", "w"), indent=1, ensure_ascii=False)
    print("\nchosen:"); [print(i, best[i], res[best[i]]["score"], res[best[i]]["heard"]) for i in range(len(LINES))]

elif cmd == "assemble":
    import soundfile as sf, pyloudnorm as pyln
    order = CFG.get("order") or json.load(open(f"{TAKES}/scores.json"))["order"]
    gaps = {int(k): v for k, v in CFG.get("gaps", {}).items()}
    def trim(x, thr_db=-45):
        e = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, "same")); nz = np.where(e > 10 ** (thr_db / 20))[0]
        a, b = max(0, nz[0] - 240), min(len(x), nz[-1] + 960); y = x[a:b].copy()
        f = 240; y[:f] *= np.linspace(0, 1, f); y[-f * 4:] *= np.linspace(1, 0, f * 4); return y
    def squeeze(x, cap=0.4):
        e = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, "same")); q = e < 10 ** (-45 / 20)
        out = []; i = 0; n = len(x)
        while i < n:
            j = i
            while j < n and q[j] == q[i]: j += 1
            if q[i] and (j - i) > cap * SR and i > 0 and j < n:
                h = int(cap * SR) // 2; a = x[i:i + h].copy(); b = x[j - h:j].copy()
                a[-120:] *= np.linspace(1, 0, 120); b[:120] *= np.linspace(0, 1, 120); out += [a, b]
            else: out.append(x[i:j])
            i = j
        return np.concatenate(out)
    meter = pyln.Meter(SR, block_size=0.4)
    t = 0.4; out = [np.zeros(int(0.4 * SR), np.float32)]; starts = []
    for i, k in enumerate(order):
        y = squeeze(trim(load(f"{TAKES}/{k}", SR)))
        y = y * 10 ** ((-22.0 - meter.integrated_loudness(y)) / 20)
        starts.append(round(t, 3)); out.append(y.astype(np.float32)); t += len(y) / SR
        g = gaps.get(i, 0.45) if i < len(order) - 1 else 1.2
        out.append(np.zeros(int(g * SR), np.float32)); t += g
    v = np.concatenate(out)
    sf.write(f"{PUB}/voice.wav", v, SR, subtype="PCM_24")
    json.dump({"order": order, "line_starts": starts, "duration": round(len(v) / SR, 3)}, open(f"{ROOT}/voice_lines.json", "w"), indent=1)
    print("voice", round(len(v) / SR, 2), "s; line starts", starts)
