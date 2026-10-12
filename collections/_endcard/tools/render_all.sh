#!/bin/bash
# Renders renders/endcard_{en,ru,zh-CN,zh-TW}.mp4 (1920x1080, 30 fps, H.264 + AAC 48 kHz stereo).
# Retries each language up to 3 times (renders share the CPU with other projects).
# LANGS="ru" tools/render_all.sh renders one language.
cd "$(dirname "$0")/.." || exit 1
python3 ../marketmaker-general/style/kit/tools/build.py . >/dev/null || exit 1
mkdir -p renders
for L in ${LANGS:-en ru zh-CN zh-TW}; do
  for try in 1 2 3; do
    npx hyperframes render --quality high --fps 30 --quiet --variables "{\"lang\":\"$L\"}" --output "renders/raw_$L.mp4" && break
    echo "retry $L ($try)"; sleep 30
  done
  # normalise the container for concat: 30 fps CFR, yuv420p, AAC 48 kHz stereo
  ffmpeg -y -loglevel error -i "renders/raw_$L.mp4" -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
    -movflags +faststart "renders/endcard_$L.mp4" && rm -f "renders/raw_$L.mp4" && echo "done $L"
done
