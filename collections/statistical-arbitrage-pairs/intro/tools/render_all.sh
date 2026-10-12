#!/bin/bash
# Renders the full-length intro (28.9 s) in en, ru, zh-CN, zh-TW (song muxed) plus silent copies into renders/.
# Retries each language up to 3 times. Each render runs in a machine-wide slot
# (collections/tools/heavy_slot.sh, max 3 renders at once).
cd "$(dirname "$0")/.." || exit 1
python3 ../style/kit/tools/build.py . >/dev/null || exit 1
mkdir -p renders
render() { # lang title
  for try in 1 2 3; do
    ../../tools/heavy_slot.sh render npx hyperframes render --quality high --quiet --variables "{\"title\":\"$2\",\"lang\":\"$1\"}" --output "renders/intro_$1.mp4" && break
    echo "retry $1 ($try)"; sleep 30
  done
  ffmpeg -y -loglevel error -i "renders/intro_$1.mp4" -an -c:v copy "renders/intro_$1_silent.mp4" && echo "done $1"
}
render en "Statistical Arbitrage|& Pairs Trading"
render ru "Статистический арбитраж|и парный трейдинг"
render zh-CN "统计套利与配对交易"
render zh-TW "統計套利與配對交易"
