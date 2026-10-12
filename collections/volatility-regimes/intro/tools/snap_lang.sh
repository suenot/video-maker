#!/bin/bash
# usage: tools/snap_lang.sh <lang> "<title>" "16,19" -> snapshots/<lang>/ (title card check per language)
# Same as snap.sh, but bakes the language into the preview copy's variable defaults.
cd "$(dirname "$0")/.." || exit 1
python3 ../style/kit/tools/build.py . >/dev/null || exit 1
mkdir -p preview && ln -sfn ../assets preview/assets && cp -f hyperframes.json meta.json preview/
LANG_ID="$1" TITLE="$2" python3 - <<'PY'
import os, re
s = open('index.html', encoding='utf-8').read()
s = re.sub(r'<audio id="song"[^>]*></audio>', '', s)
s = s.replace('"default":"Volatility Modeling|&amp; Regimes"', '"default":"%s"' % os.environ["TITLE"]).replace('"default":"en"', '"default":"%s"' % os.environ["LANG_ID"])
s = s.replace('{ title: "Volatility Modeling|& Regimes", lang: "en" }', '{ title: "%s", lang: "%s" }' % (os.environ["TITLE"], os.environ["LANG_ID"]))
open('preview/index.html', 'w', encoding='utf-8').write(s)
PY
OUT="$PWD/snapshots/$1"; mkdir -p "$OUT"; rm -f "$OUT"/frame-*.png
npx hyperframes snapshot preview --no-end --at "$3" -o "$OUT" 2>&1 | grep -E "✗|rror|saved" | head -20
