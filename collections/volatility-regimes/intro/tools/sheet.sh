#!/bin/bash
# usage: tools/sheet.sh [cols] [out]  -> tiles snapshots/frame-*.png (in time order) into a contact sheet
cd "$(dirname "$0")/.." || exit 1
COLS="${1:-6}"; OUT="${2:-snapshots/contact-sheet.jpg}"
N=$(ls snapshots/frame-*.png | wc -l | tr -d ' '); ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -y -loglevel error -pattern_type glob -i 'snapshots/frame-*.png' -vf "scale=400:-1,tile=${COLS}x${ROWS}:padding=4:color=0x2a2a2e" -frames:v 1 -q:v 3 "$OUT" && echo "$OUT ($N frames)"
