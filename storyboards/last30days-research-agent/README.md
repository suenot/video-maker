# Last30Days visual variants

Two generated visual directions for the existing English narration:

- `midnight` — dark computational theater: precise geometry, cyan data paths,
  amber signals, coral failures.
- `warm-editorial` — warm narrative explainer with a recurring field-research
  robot and physical engineering metaphors.

The original nine-slide deck is not aligned to the narration: after 00:15 the
audio covers Polymarket, Jaccard deduplication and open bugs, while the deck
continues through unrelated BYOC, fallback and cost-guard slides. The variants
therefore use five audio-aligned scenes plus a 3.54-second opening cover.

All generated art is text-free. Exact titles, formulas, issue numbers and status
labels are rendered by `scripts/build_visual_variants.py`; the single source of
truth is `variant-manifest.json`.

## Build slides

```bash
venv/bin/python3 scripts/build_visual_variants.py \
  --manifest storyboards/last30days-research-agent/variant-manifest.json \
  --build-root build/last30days-research-agent \
  --preview-root storyboards/last30days-research-agent/previews
```

## Build videos

```bash
for style in midnight warm-editorial; do
  venv/bin/python3 scripts/generate_video.py \
    --timeline "build/last30days-research-agent/$style/timeline.json" \
    --slides-dir "build/last30days-research-agent/$style/slides" \
    --cover "build/last30days-research-agent/$style/cover.png" \
    --cover-duration 3.54 \
    --audio input/last30days-research-agent/audio_en.m4a \
    --output "output/last30days-research-agent/last30days-research-agent_${style}.mp4" \
    --fps 30 --scale-width 1920 --scale-height 1080 \
    --codec h264_videotoolbox
done
```

The cover replaces the first 3.54 seconds of scene one. It does not extend the
runtime and does not shift the audio or subtitles.
