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
    npx hyperframes render --quality high --output "$out" --variables "{\"title\":\"$title\",\"lang\":\"$lang\"}" > "renders/render_${lang}.log" 2>&1 && break
    sleep 60
  done
  ffmpeg -v error -y -i "$out" -an -c:v copy "renders/intro_${lang}_silent.mp4"
  echo "$lang $?" >> renders/batch.txt
}
: > renders/batch.txt
render en "AI Agents|for Trading"
render ru "AI-агенты|в трейдинге"
render zh-CN "交易中的|AI 智能体"
render zh-TW "交易中的|AI 智慧體"
