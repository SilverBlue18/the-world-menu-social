import json, sys, wave
import numpy as np
from faster_whisper import WhisperModel
wav, model_dir = sys.argv[1], sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else None
with wave.open(wav, "rb") as w:
    audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
model = WhisperModel(model_dir, device="cpu", compute_type="int8")
segments, _ = model.transcribe(audio, language=lang, word_timestamps=True, vad_filter=True)
print(json.dumps([{"text": w.word.strip(), "startMs": round(w.start * 1000), "endMs": round(w.end * 1000)}
                  for s in segments for w in (s.words or []) if w.word.strip()]))
