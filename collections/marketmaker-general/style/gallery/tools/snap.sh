#!/bin/bash
# usage: tools/snap.sh "0.5,1,2" [outdir]  (rebuild from kit + src, then snapshot)
cd "$(dirname "$0")/.." || exit 1
python3 ../kit/tools/build.py . >/dev/null || exit 1
OUT="${2:-$PWD/snapshots}"; mkdir -p "$OUT"; rm -f "$OUT"/frame-*.png
npx hyperframes snapshot . --no-end --at "$1" -o "$OUT" 2>&1 | grep -E "✗|rror|saved" | head -20
