#!/bin/bash
# usage: tools/render_scene.sh <scene_id> [more ids...]
# Builds (no debug strip), lints, and renders each scene SILENT to renders/scenes/<id>.mp4
# (1920x1080, 30 fps, H.264 CRF 18). Retries 3x (other agents render in parallel; load failures happen).
cd "$(dirname "$0")/.."
mkdir -p renders/scenes
for ID in "$@"; do
  python3 tools/build_scene.py "$ID" || exit 1
  DIR=$(ls -d scenes/${ID}* | head -1); SID=$(basename "$DIR")
  npx hyperframes lint "$DIR" 2>&1 | grep -E "error|✗" | head -5
  for i in 1 2 3; do
    if npx hyperframes render "$DIR" --fps 30 --crf 18 --workers "${WORKERS:-4}" --quiet --output "$PWD/renders/scenes/$SID.mp4" > "renders/scenes/$SID.log" 2>&1; then
      echo "$SID ok: $(ffprobe -v error -show_entries format=duration -of csv=p=0 renders/scenes/$SID.mp4) s"; break
    fi
    echo "$SID render failed (try $i): $(tail -3 renders/scenes/$SID.log | tr '\n' ' ')"; sleep 60
  done
done
