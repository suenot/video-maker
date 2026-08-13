# Native Shorts from a narrated slide deck

The canonical end-to-end workflow is
[`youtube-content-pipeline`](../.agents/skills/youtube-content-pipeline/SKILL.md).
This document is the concise implementation note for the vertical branch.

## Default rule

Generate a separate 1080x1920 image for every scene. Reuse the approved
semantic contract, narration, scene order, and visual style, but compose each
vertical frame natively. Do not crop, blur, letterbox, pad, or shrink the
desktop video into a vertical canvas.

`scripts/make_short.py` is a legacy utility for an explicitly requested excerpt
from existing landscape footage. It is not the default for slide-deck videos.

## Frame set

Use the same roles as desktop:

1. `cover.png` is the cover/opening frame and thumbnail source.
2. `slide_001.png..slide_NNN.png` map one-to-one to the narrated scenes.
3. `endcard.png` is a contact-only end card.

The Shorts end card must not contain `NEXT VIDEO`, an empty video frame, or a
watch-next placeholder. YouTube's native interface handles related-video
navigation separately.

## UI-safe composition

Canvas: `1080x1920`.

- Keep critical text and diagrams inside `x=80..850, y=180..1430`.
- Leave `x=900..1080` clear for like, comment, and share controls.
- Leave `y=1500..1920` clear for captions and bottom UI.
- Keep contact URLs above `y=1430` and left of `x=850`.
- Do not burn a persistent title or subtitles over the contact card.

Create a safe-zone review set before rendering:

```bash
mkdir -p temp/<slug>/qa/shorts-safe
for frame in output/<slug>/slides-shorts/slide_*.png \
             output/<slug>/slides-shorts/cover.png \
             output/<slug>/slides-shorts/endcard.png; do
  test -f "$frame" || continue
  ffmpeg -v error -y -i "$frame" \
    -vf "drawbox=x=900:y=0:w=180:h=1920:color=red@0.25:t=fill,drawbox=x=0:y=1500:w=1080:h=420:color=red@0.25:t=fill" \
    -frames:v 1 "temp/<slug>/qa/shorts-safe/$(basename "$frame")"
done
```

No required word, number, CTA, or contact may intersect the red masks.

## Render

Build the narrated body from the native frames:

```bash
venv/bin/python scripts/generate_video.py \
  --timeline temp/<slug>/timeline.json \
  --slides-dir output/<slug>/slides-shorts \
  --audio input/<slug>/audio_en.m4a \
  --scale-width 1080 --scale-height 1920 \
  --fps 30 \
  --codec libx264 \
  --output output/<slug>/<slug>-short-body.mp4
```

Append the native contact card:

```bash
venv/bin/python scripts/append_endcard.py \
  --video output/<slug>/<slug>-short-body.mp4 \
  --card output/<slug>/slides-shorts/endcard.png \
  --duration 10 --music silent \
  --output output/<slug>/<slug>-short.mp4
```

The card must be exactly 1080x1920. The script preserves the native vertical
canvas instead of converting it to desktop dimensions. Narration plus the
10-second card must stay within YouTube's current Shorts limit. At this version
the limit is 180 seconds; verify the
[official rule](https://support.google.com/youtube/answer/15424877) before
publication.

When desktop and Short use the same audio and timeline, copy the same SRT cues
to separately named files. The last cue ends with narration; the contact card
stays clear.

## Validate

```bash
ffprobe -v error \
  -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels,duration \
  -of json output/<slug>/<slug>-short.mp4
ffmpeg -v error -i output/<slug>/<slug>-short.mp4 -f null -
```

Require 1080x1920 H.264, AAC audio, a clean full decode, exact scene order, and
a complete contact card. Inspect frames at every cut and in the actual Shorts
UI before publication.

## Publish

Publish only after the desktop video is public and its exact URL is present in
the Short metadata. Use a unique Short title, upload as Private, verify the
channel, language, captions, processing, restrictions, duration, and aspect,
then change the existing upload to Public and verify its saved Studio state and
public URL.

Never commit the Short MP4, source audio, generated frames, captions, upload
logs, or browser profile.
