#!/bin/bash
# Renders the intro in en, ru, zh-CN, zh-TW (song muxed) plus silent copies into renders/.
# Retries each language up to 3 times (renders share the CPU with other projects).
cd "$(dirname "$0")/.." || exit 1
python3 ../style/kit/tools/build.py . >/dev/null || exit 1
mkdir -p renders
render() { # lang title
  for try in 1 2 3; do
    npx hyperframes render --quality high --quiet --variables "{\"title\":\"$2\",\"lang\":\"$1\"}" --output "renders/intro_$1.mp4" && break
    echo "retry $1 ($try)"; sleep 30
  done
  ffmpeg -y -loglevel error -i "renders/intro_$1.mp4" -an -c:v copy "renders/intro_$1_silent.mp4" && echo "done $1"
}
render en "Execution &|Market Making"
render ru "Исполнение и|маркетмейкинг"
render zh-CN "执行与做市"
render zh-TW "執行與造市"
