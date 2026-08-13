# QA and publishing gates

Read this reference before rendering or uploading.

## Source and narration QA

Record source hashes and media properties:

```bash
shasum -a 256 input/<slug>/audio_en.m4a input/<slug>/slides_en.pdf
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,sample_rate,channels \
  -of json input/<slug>/audio_en.m4a
pdfinfo input/<slug>/slides_en.pdf
```

Transcribe the entire source. Review the hook, every technical scene, numbers,
names, and the last sentence. Compare the SRT to the approved written copy.
When pronunciation guidance is required, keep the correct spelling in
`narration` and put phonetic wording only in `spoken_narration`.

If a claim can change, verify it against a current primary source and record the
date. Do not convert approximate, conditional, self-hosted, or additional-cost
claims into absolutes.

## Frame QA

Create contact sheets for both aspects and inspect every frame at full size.
OCR each frame and compare it to the scene's exact visible text. Regenerate a
frame when text is missing, duplicated, misspelled, or invented; do not repair
meaning with an overlay unless overlays are part of the approved visual system.

Check for:

- NotebookLM, Gemini, or other unwanted watermarks;
- unsupported logos and fake product UI;
- wrong arrow direction or reordered architecture;
- tiny qualifiers, status notices, cost caveats, and contact URLs;
- extra image-model text;
- inconsistent character, palette, or visual metaphor.

Generate Shorts safe-zone overlays:

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

No required word, number, CTA, or contact may intersect either red mask. Then
inspect the final Short in an actual YouTube Shorts UI preview when available.

Create the upload thumbnail from the approved desktop cover. The existing
thumbnail tool expects `slide_001.png`, so stage `cover.png` in a temporary
thumbnail-only directory; never overwrite a narrated frame:

```bash
mkdir -p temp/<slug>/thumbnail-source
cp output/<slug>/slides-desktop/cover.png temp/<slug>/thumbnail-source/slide_001.png
venv/bin/python scripts/generate_thumbnail.py \
  --slides-dir temp/<slug>/thumbnail-source \
  --output output/<slug>/<slug>_thumbnail.png
```

## Timeline QA

Require all narrated slides exactly once, a zero start, a final end equal to
the narration duration, and contiguous boundaries:

```bash
jq -e '
  . as $root |
  $root.timeline[0].start == 0 and
  ([$root.timeline[].slide] == [range(0; $root.slide_count)]) and
  all(range(0; ($root.timeline | length) - 1);
      . as $index |
      $root.timeline[$index].end == $root.timeline[$index + 1].start)
' temp/<slug>/timeline.json
```

If this check fails, supply explicit `SLIDE_STARTS`; do not accept a partial
deck or an even split without reviewing every boundary.

## Render QA

Render the narrated body from its native frames:

```bash
venv/bin/python scripts/generate_video.py \
  --timeline temp/<slug>/timeline.json \
  --slides-dir output/<slug>/slides-desktop \
  --audio input/<slug>/audio_en.m4a \
  --scale-width 1920 --scale-height 1080 \
  --fps 30 \
  --codec libx264 \
  --output output/<slug>/<slug>-desktop-body.mp4
```

Use the same command with `slides-shorts`, `1080`, and `1920` for the native
Short body. Before rendering, verify that narration plus end card is no longer
than the [current official YouTube Shorts limit](https://support.google.com/youtube/answer/15424877).
At this version the limit is 180 seconds. Append the aspect-matched card:

```bash
venv/bin/python scripts/append_endcard.py \
  --video output/<slug>/<slug>-desktop-body.mp4 \
  --card output/<slug>/slides-desktop/endcard.png \
  --duration 10 --music silent \
  --output output/<slug>/<slug>-desktop.mp4
```

Repeat with the vertical body and vertical contact-only card. Never pass a
desktop card to the vertical render.

If both aspects use one approved audio track and timeline, copy the same SRT
cues into separately named desktop and Short files. Keep the last cue at or
before the narration end; the end card has no subtitle cue.

Validate both outputs:

```bash
for video in output/<slug>/<slug>-desktop.mp4 output/<slug>/<slug>-short.mp4; do
  ffprobe -v error \
    -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels,duration \
    -of json "$video"
  ffmpeg -v error -i "$video" -f null -
done
```

Expected final delivery is H.264 video, AAC 48 kHz audio, `1920x1080` desktop,
and `1080x1920` Short. Inspect frames at every cut and near both end-card edges.
Allow less than one frame of A/V tail difference.

## Metadata

Create separate metadata JSON files. The Short title must not be a normalized
substring duplicate of the desktop title. Desktop chapters must start at
`0:00`, contain at least three entries, and keep every chapter at least ten
seconds. Group short scenes rather than publishing invalid chapter intervals.

Keep an article URL out of descriptions until the production route returns a
successful response. Add the exact desktop YouTube URL to Short metadata only
after desktop publication succeeds.

## YouTube delivery

Use the publisher's persistent profile and explicit target channel. Never
commit the profile, cookies, debug screenshots, upload logs, or media.

Upload desktop first as Private:

```bash
cd /Users/suenot/projects/trading/marketmaker/video_youtube_publish
venv/bin/python publish.py \
  --video ../video_maker/output/<slug>/<slug>-desktop.mp4 \
  --metadata ../video_maker/output/<slug>/<slug>-desktop_metadata.json \
  --thumbnail ../video_maker/output/<slug>/<slug>_thumbnail.png \
  --channel-handle @<channel> \
  --visibility private --debug
```

Do not pass `--allow-duplicate`. After any failure following file selection,
inspect Studio before retrying. A nonzero result may leave a valid draft.

For the captured `VIDEO_ID`:

1. Verify the active channel, title, description, duration, 16:9 aspect, and
   restrictions in Studio.
2. Upload the approved SRT with `upload_subtitles.py` and set the language with
   `edit_details.py` when supported by the current UI.
3. Wait for processing and checks.
4. Change the existing video to Public with `schedule_video.py --publish-now`.
5. Reopen Studio and confirm the saved Public state.
6. Verify the public watch URL or oEmbed response and exact title.

Then inject the desktop URL into the Short metadata and repeat the sequence for
the native Short. Omit a custom Short thumbnail unless the channel workflow has
been verified to accept it. Confirm the upload appears in Studio's Shorts tab.

## Article and production smoke test

After desktop publication, put its exact URL in both language variants of the
matching article, remove draft state, build the site, deploy through the
project's documented procedure, and verify both production routes. Do not infer
permission to publish an unrelated article or video.

Record the two YouTube IDs, public URLs, article routes, visibility, caption
status, and smoke-test result in the production manifest and content CRM.
