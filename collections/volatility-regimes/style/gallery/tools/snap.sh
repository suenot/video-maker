#!/bin/bash
# usage: tools/snap.sh ["1,3,5.5"] [outdir]
# Rebuilds index.html from kit + src, lints, snapshots (no audio, so straight from index.html)
# and tiles the frames into snapshots/contact-sheet.jpg.
cd "$(dirname "$0")/.." || exit 1
python3 ../kit/tools/build.py . >/dev/null || exit 1
OUT="${2:-$PWD/snapshots}"; mkdir -p "$OUT"; rm -f "$OUT"/frame-*.png
npx hyperframes snapshot . --no-end --at "${1:-1,3,5.5}" -o "$OUT" 2>&1 | grep -E "✗|rror|saved" | head -20
N=$(ls "$OUT"/frame-*.png 2>/dev/null | wc -l | tr -d ' ')
[ "$N" -gt 0 ] && ffmpeg -y -loglevel error -pattern_type glob -i "$OUT/frame-*.png" -vf "scale=960:-1,tile=1x$N:padding=8:color=0x16323a" -frames:v 1 -q:v 3 "$OUT/contact-sheet.jpg"
