#!/bin/bash
# Renders the intro in en, ru, zh-CN, zh-TW (song muxed) plus silent copies into renders/.
# Languages render one after another inside the global slot limiter (collections/tools/heavy_slot.sh); 3 retries each.
cd "$(dirname "$0")/.." || exit 1
python3 ../style/kit/tools/build.py . >/dev/null || exit 1
mkdir -p renders
render() { # lang subtitle
  for try in 1 2 3; do
    ../../tools/heavy_slot.sh render npx hyperframes render --quality high --quiet --variables "{\"title\":\"Marketmaker\",\"subtitle\":\"$2\",\"lang\":\"$1\"}" --output "renders/intro_$1.mp4" && break
    echo "retry $1 ($try)"; sleep 30
  done
  ffmpeg -y -loglevel error -i "renders/intro_$1.mp4" -an -c:v copy "renders/intro_$1_silent.mp4" && echo "done $1"
}
for L in ${LANGS:-en ru zh-CN zh-TW}; do
  case $L in
    en) render en "Algorithmic Trading Explained" ;;
    ru) render ru "Алготрейдинг простыми словами" ;;
    zh-CN) render zh-CN "算法交易讲解" ;;
    zh-TW) render zh-TW "演算法交易講解" ;;
  esac
done
