# Last30Days visual variants

Three generated visual directions, including a corrected Russian audit:

- `midnight` — dark computational theater: precise geometry, cyan data paths,
  amber signals, coral failures.
- `warm-editorial` — warm narrative explainer with a recurring field-research
  robot and physical engineering metaphors.
- `threeblue` — Russian mathematical blackboard direction based on local
  `youtube_styles/backend/data/3blue1brown` references: pure black, serif
  typography, thin constructions, cyan/yellow/red proof marks.

The original nine-slide deck is not aligned to the narration: after 00:15 the
audio covers Polymarket, Jaccard deduplication and open bugs, while the deck
continues through unrelated BYOC, fallback and cost-guard slides. The English
variants therefore use five audio-aligned scenes plus a 3.54-second opening
cover. The Russian variant uses six scenes, a corrected script, and a separate
15-second YouTube end screen. Its snapshot was checked on 2026-08-07:
v3.18.4, 57,597 stars, two-stage clustering, free-first fallback, and open
limitations #887/#818.

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

## Build the Russian 3Blue1Brown variant

```bash
venv/bin/python3 scripts/build_visual_variants.py \
  --manifest storyboards/last30days-research-agent/variant-manifest.json \
  --build-root build/last30days-research-agent \
  --preview-root storyboards/last30days-research-agent/previews \
  --styles threeblue

venv/bin/python3 scripts/build_variant_narration.py \
  --manifest storyboards/last30days-research-agent/variant-manifest.json \
  --style threeblue \
  --build-root build/last30days-research-agent \
  --audio-output input/last30days-research-agent/audio_threeblue_ru.m4a \
  --srt-output output/last30days-research-agent/last30days-research-agent_threeblue_ru.srt

venv/bin/python3 scripts/generate_video.py \
  --timeline build/last30days-research-agent/threeblue/timeline.json \
  --slides-dir build/last30days-research-agent/threeblue/slides \
  --cover build/last30days-research-agent/threeblue/cover.png \
  --cover-duration 3.54 \
  --audio input/last30days-research-agent/audio_threeblue_ru.m4a \
  --output build/last30days-research-agent/threeblue/base_ru.mp4 \
  --fps 30 --scale-width 1920 --scale-height 1080 \
  --codec h264_videotoolbox

venv/bin/python3 scripts/append_endcard.py \
  --video build/last30days-research-agent/threeblue/base_ru.mp4 \
  --output output/last30days-research-agent/last30days-research-agent_threeblue_ru.mp4 \
  --card build/last30days-research-agent/threeblue/endcard.png \
  --music generated --duration 15
```

The end screen leaves two 640x360 regions for YouTube cards and keeps the
bottom player-control area visually quiet. The music bed is synthesized
locally and contains no external samples.
