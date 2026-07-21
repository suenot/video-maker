#!/usr/bin/env bash
set -euo pipefail

# Usage: ./run_pipeline.sh <ru|en> [slug]
#   slug defaults to plateau-analysis-overfitting.
#   Override YouTube tag seeds with the SEED_KEYWORDS env var.

LANG="${1:-}"
if [[ -z "$LANG" ]]; then
    echo "Usage: $0 <ru|en> [slug]"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
VENV_PYTHON="$PROJECT_DIR/venv/bin/python3"

SLUG="${2:-plateau-analysis-overfitting}"
TEMP_DIR="$PROJECT_DIR/temp/${SLUG}_${LANG}"
OUT_DIR="$PROJECT_DIR/output/$SLUG"
mkdir -p "$TEMP_DIR" "$OUT_DIR"

if [[ "$LANG" == "ru" ]]; then
    AUDIO="$PROJECT_DIR/input/$SLUG/audio_ru.m4a"
    PDF="$PROJECT_DIR/input/$SLUG/slides_ru.pdf"
    OCR_LANG="rus"
    WHISPER_LANG="ru"
    MODEL="base"
    OUT_NAME="${SLUG}_ru.mp4"
    ARTICLE="$PROJECT_DIR/input/$SLUG/article_ru.md"
elif [[ "$LANG" == "en" ]]; then
    AUDIO="$PROJECT_DIR/input/$SLUG/audio_en.m4a"
    PDF="$PROJECT_DIR/input/$SLUG/slides_en.pdf"
    OCR_LANG="eng"
    WHISPER_LANG="en"
    MODEL="base"
    OUT_NAME="${SLUG}.mp4"
    ARTICLE="$PROJECT_DIR/../notebooklm/${SLUG}.en.md"
elif [[ "$LANG" == "zh" ]]; then
    # Simplified Chinese, for the @marketmaker-zh channel. tesseract needs the
    # chi_sim traineddata; Whisper's own code for Mandarin is "zh".
    AUDIO="$PROJECT_DIR/input/$SLUG/audio_zh.m4a"
    PDF="$PROJECT_DIR/input/$SLUG/slides_zh.pdf"
    OCR_LANG="chi_sim"
    WHISPER_LANG="zh"
    MODEL="base"
    OUT_NAME="${SLUG}_zh.mp4"
    ARTICLE="$PROJECT_DIR/input/$SLUG/article_zh.md"
else
    echo "Unknown language: $LANG"
    exit 1
fi

echo "=== Step 1: PDF to images ==="
"$VENV_PYTHON" "$SCRIPT_DIR/pdf_to_images.py" \
    --pdf "$PDF" \
    --out-dir "$TEMP_DIR/slides" \
    --dpi 200

echo "=== Step 2: OCR text from slides ==="
"$VENV_PYTHON" "$SCRIPT_DIR/extract_pdf_text.py" \
    --images-dir "$TEMP_DIR/slides" \
    --output "$TEMP_DIR/slides_text.json" \
    --lang "$OCR_LANG"

echo "=== Step 3: Extract subtitles (Whisper) ==="
"$VENV_PYTHON" "$SCRIPT_DIR/extract_subtitles.py" \
    --audio "$AUDIO" \
    --output "$TEMP_DIR/subtitles.json" \
    --model "$MODEL" \
    --language "$WHISPER_LANG"

echo "=== Step 3.5: Convert subtitles to SRT ==="
"$VENV_PYTHON" "$SCRIPT_DIR/subtitles_to_srt.py" \
    --subtitles "$TEMP_DIR/subtitles.json" \
    --output "$OUT_DIR/${OUT_NAME%.mp4}.srt"

echo "=== Step 4: Sync slides with audio ==="
"$VENV_PYTHON" "$SCRIPT_DIR/sync_slides.py" \
    --subtitles "$TEMP_DIR/subtitles.json" \
    --slides-text "$TEMP_DIR/slides_text.json" \
    --output "$TEMP_DIR/timeline.json" \
    --min-duration 5.0 \
    --advance-ratio 1.3 \
    --look-ahead 3

echo "=== Step 5: Generate video ==="
"$VENV_PYTHON" "$SCRIPT_DIR/generate_video.py" \
    --timeline "$TEMP_DIR/timeline.json" \
    --slides-dir "$TEMP_DIR/slides" \
    --audio "$AUDIO" \
    --output "$OUT_DIR/$OUT_NAME"

echo "=== Step 5.5: Research YouTube tags ==="
SEED_KEYWORDS="${SEED_KEYWORDS:-overfitting backtest,optuna trading,backtest overfitting,trading strategy optimization,algorithmic trading}"
"$VENV_PYTHON" "$SCRIPT_DIR/research_youtube_tags.py" \
    --seed-keywords "$SEED_KEYWORDS" \
    --lang "$LANG" \
    --max-tags 15 \
    --output "$TEMP_DIR/tags_research.json"

echo "=== Step 6: Generate metadata ==="
META_ARGS=(
    --subtitles "$TEMP_DIR/subtitles.json"
    --slides-text "$TEMP_DIR/slides_text.json"
    --timeline "$TEMP_DIR/timeline.json"
    --output-json "$OUT_DIR/${OUT_NAME%.mp4}_metadata.json"
    --output-txt "$OUT_DIR/${OUT_NAME%.mp4}_metadata.txt"
    --lang "$LANG"
    --tags-file "$TEMP_DIR/tags_research.json"
    --category "Education"
    --type "Concept overview"
    --level "Advanced"
)
if [[ -n "${ARTICLE:-}" ]]; then
    META_ARGS+=(--article "$ARTICLE")
fi
"$VENV_PYTHON" "$SCRIPT_DIR/generate_metadata.py" "${META_ARGS[@]}"

echo "=== Step 7: Generate thumbnail ==="
"$VENV_PYTHON" "$SCRIPT_DIR/generate_thumbnail.py" \
    --slides-dir "$TEMP_DIR/slides" \
    --output "$OUT_DIR/${OUT_NAME%.mp4}_thumbnail.png"

echo "=== Done: $OUT_DIR/$OUT_NAME ==="
