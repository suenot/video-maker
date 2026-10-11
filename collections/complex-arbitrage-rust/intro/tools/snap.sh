#!/bin/bash
# usage: tools/snap.sh "0.5,1,2" [outdir]  -> rebuilds index.html from kit + src, snapshots PNGs
cd "$(dirname "$0")/.." || exit 1
python3 ../style/kit/tools/build.py . >/dev/null || exit 1
OUT="${2:-$PWD/snapshots}"; mkdir -p "$OUT"; rm -f "$OUT"/frame-*.png
npx hyperframes snapshot . --no-end --at "$1" -o "$OUT" 2>&1 | grep -E "✗|rror|Saved|snapshots" | head -40
