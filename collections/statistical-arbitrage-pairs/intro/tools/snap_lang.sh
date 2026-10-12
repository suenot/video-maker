#!/bin/bash
# usage: tools/snap_lang.sh <lang> "<title>" "17.2,18.5" -> snapshots/lang-<lang>/
# Same as snap.sh, but bakes the title + language into the defaults of the preview copy
# (snapshot has no --variables flag; render uses --variables, see render_all.sh).
cd "$(dirname "$0")/.." || exit 1
python3 ../style/kit/tools/build.py . >/dev/null || exit 1
D="preview_$1"; mkdir -p "$D" && ln -sfn ../assets "$D/assets" && cp -f hyperframes.json meta.json "$D/"
LANG_ID="$1" TITLE="$2" OUTD="$D" python3 - <<'PY'
import os, re, json
s = open('index.html', encoding='utf-8').read()
s = re.sub(r'<audio id="song"[^>]*></audio>', '', s)
s = s.replace('"default":"Statistical Arbitrage|& Pairs Trading"', '"default":' + json.dumps(os.environ['TITLE'], ensure_ascii=False))
s = s.replace('"default":"en"', '"default":"' + os.environ['LANG_ID'] + '"')
s = s.replace('title: "Statistical Arbitrage|& Pairs Trading", lang: "en"', 'title: ' + json.dumps(os.environ['TITLE'], ensure_ascii=False) + ', lang: "' + os.environ['LANG_ID'] + '"')
open(os.path.join(os.environ['OUTD'], 'index.html'), 'w', encoding='utf-8').write(s)
PY
OUT="$PWD/snapshots/lang-$1"; mkdir -p "$OUT"; rm -f "$OUT"/frame-*.png
npx hyperframes snapshot "$D" --no-end --at "$3" -o "$OUT" 2>&1 | grep -E "✗|rror|saved" | head -5
