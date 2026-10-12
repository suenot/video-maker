#!/bin/bash
# Renders the intro in en / ru / zh-CN / zh-TW (song muxed) plus silent copies.
# Retries each language up to 3 times (other agents render in parallel).
cd "$(dirname "$0")/.." || exit 1
python3 ../style/kit/tools/build.py . >/dev/null || exit 1
mkdir -p renders
render() {
  local lang="$1" title="$2"
  local out="renders/intro_${lang}.mp4"
  for try in 1 2 3; do
    ../../tools/heavy_slot.sh render npx hyperframes render --quality high --output "$out" --variables "{\"title\":\"$title\",\"lang\":\"$lang\"}" > "renders/render_${lang}.log" 2>&1 && break
    sleep 60
  done
  ffmpeg -v error -y -i "$out" -an -c:v copy "renders/intro_${lang}_silent.mp4"
  echo "$lang $?" >> renders/batch.txt
}
: > renders/batch.txt
render en "Causality & Lead-Lag|in Markets"
render ru "Причинность и lead-lag|на рынках"
render zh-CN "市场中的|因果关系与领先滞后"
render zh-TW "市場中的|因果關係與領先落後"
