#!/usr/bin/env bash
# strip.sh video start_s count step_frames out.jpg  -> horizontal strip of frames
v=$1; s=$2; n=$3; st=$4; out=$5
ffmpeg -loglevel error -y -ss $s -i $v -vf "select='not(mod(n\,$st))',scale=180:-1,tile=${n}x1" -frames:v 1 $out
