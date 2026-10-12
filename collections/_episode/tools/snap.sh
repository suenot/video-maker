#!/bin/bash
# usage: snap.sh [episode_dir] <scene_id> [step_seconds=2.5 | "g1,g2,..." GLOBAL times]
# Builds the scene with the debug strip (time / speaker / word) into scenes/<id>/preview,
# snapshots it every `step` s (or at the given episode-global times) into scenes/<id>/snapshots/,
# and writes scenes/<id>/snapshots/sheet.jpg (6 per row). Then LOOK at it.
set -e
T="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$1/scenes.json" ]; then cd "$1"; shift; fi
[ -f scenes.json ] || { echo "run inside an episode dir or pass it first"; exit 1; }
ID="$1"; ARG="${2:-2.5}"
[ -z "$ID" ] && { echo "usage: snap.sh [episode_dir] <scene_id> [step|g1,g2,...]"; exit 1; }
python3 "$T/build_scene.py" . "$ID" --debug >/dev/null
read SID START END <<<"$(python3 -c "import json;s=[x for x in json.load(open('scenes.json'))['scenes'] if x['id']=='$ID' or x['id'].startswith('${ID}_')][0];print(s['id'],s['start'],s['end'])")"
DIR="scenes/$SID"
if [[ "$ARG" == *,* ]]; then
  AT=$(python3 -c "print(','.join(str(round(float(g)-$START,3)) for g in '$ARG'.split(',')))")
else
  AT=$(python3 -c "
d=$END-$START; s=$ARG; t=0.4; out=[]
while t<d-0.05: out.append(round(t,2)); t+=s
print(','.join(map(str,out)))")
fi
OUT="$PWD/$DIR/snapshots"; mkdir -p "$OUT"; rm -f "$OUT"/frame-*.png "$OUT"/sheet.jpg
for i in 1 2 3; do
  if npx hyperframes snapshot "$DIR/preview" --no-end --timeout 30000 --at "$AT" -o "$OUT" > "$OUT/snap.log" 2>&1; then break; fi
  echo "snapshot failed (try $i), retrying in 30 s"; sleep 30
done
grep -E "✗|rror" "$OUT/snap.log" | head -5 || true
N=$(ls "$OUT"/frame-*.png 2>/dev/null | wc -l | tr -d ' ')
ROWS=$(( (N + 5) / 6 ))
ffmpeg -v error -y -pattern_type glob -i "$OUT/frame-*.png" -vf "scale=320:180,tile=6x${ROWS}:padding=4:color=black" -frames:v 1 "$OUT/sheet.jpg"
echo "$N frames -> $OUT/sheet.jpg"
