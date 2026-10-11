#!/bin/bash
# usage: tools/snap.sh "0.5,1,2" [outdir]
# Rebuilds index.html from kit + src, then snapshots an audio-free copy
# (snapshot of a page with audio can time out; render always uses index.html).
cd "$(dirname "$0")/.." || exit 1
python3 ../style/kit/tools/build.py . >/dev/null || exit 1
mkdir -p preview && ln -sfn ../assets preview/assets && cp -f hyperframes.json meta.json preview/
python3 - <<'PY'
import re
s = open('index.html', encoding='utf-8').read()
open('preview/index.html', 'w', encoding='utf-8').write(re.sub(r'<audio id="song"[^>]*></audio>', '', s))
PY
OUT="${2:-$PWD/snapshots}"; mkdir -p "$OUT"; rm -f "$OUT"/frame-*.png
npx hyperframes snapshot preview --no-end --at "$1" -o "$OUT" 2>&1 | grep -E "✗|rror|saved" | head -20
