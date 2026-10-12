#!/bin/bash
# Renders the four language versions with the song, plus silent copies (audio stripped).
cd "$(dirname "$0")/.." || exit 1
python3 ../style/kit/tools/build.py . >/dev/null || exit 1
mkdir -p renders
render() { # lang title
  for try in 1 2 3; do
    npx hyperframes render --quality high --variables "{\"lang\":\"$1\",\"title\":\"$2\"}" --output "renders/intro_$1.mp4" && break
    echo "render $1 failed (try $try), retrying in 60 s"; sleep 60
  done
  ffmpeg -v error -y -i "renders/intro_$1.mp4" -an -c:v copy "renders/intro_$1_silent.mp4"
}
render en "Order Book &|Market Microstructure"
render ru "Стакан и|микроструктура рынка"
render zh-CN "订单簿与市场微观结构"
render zh-TW "訂單簿與市場微觀結構"
ls -la renders
