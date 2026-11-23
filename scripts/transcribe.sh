#!/usr/bin/env bash
# usage: scripts/transcribe.sh <audio-or-video> [lang]  -> writes <name>.words.json next to it
set -e
cd "$(dirname "$0")/.."
in="$1"; lang="${2:-}"; base="${in%.*}"; wav="$(mktemp --suffix .wav)"
ffmpeg -loglevel error -y -i "$in" -ac 1 -ar 16000 -c:a pcm_s16le "$wav"
python3 -I scripts/transcribe_fw.py "$wav" bin/whisper-small-ct2 $lang > "$base.words.json"
rm -f "$wav"; echo "wrote $base.words.json"
