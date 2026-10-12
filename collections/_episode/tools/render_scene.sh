#!/bin/bash
# usage: render_scene.sh [episode_dir] <scene_id> [more ids...]
# Builds (no debug strip), lints and renders each scene SILENT to renders/scenes/<id>.mp4
# (1920x1080, 30 fps, H.264 CRF 18), one after another, each inside a global render slot
# (collections/tools/heavy_slot.sh render: max 3 renders machine-wide). Retries 3x.
T="$(cd "$(dirname "$0")" && pwd)"; SLOT="$T/../../tools/heavy_slot.sh"
if [ -f "$1/scenes.json" ]; then cd "$1"; shift; fi
[ -f scenes.json ] || { echo "run inside an episode dir or pass it first"; exit 1; }
mkdir -p renders/scenes
for ID in "$@"; do
  python3 "$T/build_scene.py" . "$ID" || exit 1
  SID=$(python3 -c "import json;print([x for x in json.load(open('scenes.json'))['scenes'] if x['id']=='$ID' or x['id'].startswith('${ID}_')][0]['id'])")
  npx hyperframes lint "scenes/$SID" 2>&1 | grep -E "error|✗" | head -5
  for i in 1 2 3; do
    if "$SLOT" render npx hyperframes render "scenes/$SID" --fps 30 --crf 18 --workers "${WORKERS:-3}" --quiet --output "$PWD/renders/scenes/$SID.mp4" > "renders/scenes/$SID.log" 2>&1; then
      echo "$SID ok: $(ffprobe -v error -show_entries format=duration -of csv=p=0 renders/scenes/$SID.mp4) s"; break
    fi
    echo "$SID render failed (try $i): $(tail -3 renders/scenes/$SID.log | tr '\n' ' ')"; sleep 60
  done
done
