#!/usr/bin/env bash
# usage: scripts/tts.sh <voice_id> <text-file> <out.mp3>   (key injected by proxy)
set -e
python3 - "$2" > /tmp/tts_body.json <<'PY'
import json,sys
print(json.dumps({"text": open(sys.argv[1]).read().strip(), "model_id": "eleven_multilingual_v2",
  "voice_settings": {"stability": 0.55, "similarity_boost": 0.75, "style": 0.15, "use_speaker_boost": True, "speed": float(__import__("os").environ.get("TTS_SPEED","1.0"))}}))
PY
curl -sS -f -m 120 "https://api.elevenlabs.io/v1/text-to-speech/$1?output_format=mp3_44100_128" \
  -H "xi-api-key: proxy-injected" -H "Content-Type: application/json" --data @/tmp/tts_body.json -o "$3"
echo "wrote $3"
