#!/bin/bash
# usage: tools/snap.sh "0.5,1,2" [outdir] [variables-json]
# Rebuilds index.html from kit + src, then snapshots an audio-free copy
# (snapshot of a page with audio can time out; render always uses index.html).
cd "$(dirname "$0")/.." || exit 1
python3 ../marketmaker-general/style/kit/tools/build.py . >/dev/null || exit 1
mkdir -p preview && ln -sfn ../assets preview/assets && cp -f hyperframes.json meta.json preview/
python3 - "$3" <<'PY'
import re, sys, json
s = open('index.html', encoding='utf-8').read()
s = re.sub(r'<audio id="bed"[^>]*></audio>', '', s)
if len(sys.argv) > 1 and sys.argv[1]:
    # bake variable defaults so a language can be previewed without the renderer
    v = json.loads(sys.argv[1])
    m = re.search(r"data-composition-variables='([^']*)'", s)
    arr = json.loads(m.group(1))
    for a in arr:
        if a["id"] in v: a["default"] = v[a["id"]]
    s = s.replace(m.group(0), "data-composition-variables='" + json.dumps(arr, ensure_ascii=False) + "'")
open('preview/index.html', 'w', encoding='utf-8').write(s)
PY
OUT="${2:-$PWD/snapshots}"; mkdir -p "$OUT"; rm -f "$OUT"/frame-*.png
npx hyperframes snapshot preview --no-end --at "$1" -o "$OUT" 2>&1 | grep -E "✗|rror|saved" | head -20
