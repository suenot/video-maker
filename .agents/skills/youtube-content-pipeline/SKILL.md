---
name: youtube-content-pipeline
description: Build and publish a complete YouTube content package from NotebookLM or other narration-and-slide sources. Use when creating, restyling, rebuilding, validating, or publishing desktop videos and native Shorts, including slide generation, corrected narration, timelines, subtitles, metadata, YouTube Studio delivery, blog embedding, and post-publish checks.
---

# YouTube content pipeline

Treat this file as the versioned source of truth for the end-to-end video flow.
Use the stage-specific READMEs only for CLI details.

Before producing artifacts, read [artifact-contract.md](references/artifact-contract.md).
Before rendering or publishing, read [qa-and-publishing.md](references/qa-and-publishing.md).

## 1. Resolve the requested scope

Do only the stage the user requested, plus its required validation:

- For style exploration, render one representative slide in each requested design and show a contact sheet. Do not expand this into several different slides.
- For a full deck, generate every desktop slide and every native vertical slide, but do not assemble or upload unless requested.
- For a rebuild, reuse the approved sources and frames; do not silently replace narration, style, or copy.
- For publishing, deliver the already approved files. Publishing is not permission to redesign or rewrite them.

Record the requested scope and approvals in `storyboards/<slug>/production-manifest.json`.
Before final generation, require the manifest to name the slug and language.
Require channel and contacts only for metadata/end-card or publication scope;
require article paths only for article scope; require a desktop next-video
target only when that block was requested. Store `null` with
`state: not_in_scope` for optional stages instead of inventing values. Mark the
desktop URL as pending when the task stops before publication.

## 2. Locate and freeze the sources

Find the original NotebookLM audio and slide PDF under `input/<slug>/` and the
corresponding Gaia artifacts under `/Users/suenot/projects/sdvg/gaia/output/`.
Compare hashes when duplicate candidates exist. Record the selected paths,
hashes, language, duration, page count, and source run in the production
manifest.

Treat a NotebookLM PDF with raster pages or a baked watermark as a semantic and
timing reference, never as clean production art. Do not crop or paint over its
watermark and call it a redesigned slide.

Keep generated audio, PDF, PNG, MP4, SRT, contact sheets, and temporary files in
ignored `input/`, `output/`, or `temp/` paths. Never commit video or audio files.
Commit only reusable code, prompts, manifests, and factual/style specifications.

## 3. Audit facts and narration before visual generation

Create `storyboards/<slug>/product-facts.md` from current primary sources.
Recheck mutable facts such as stars, pricing, product status, commands, and API
support immediately before final copy. Keep identity standards, event kinds,
membership concepts, and protocol features separate when the source does.

Transcribe the source audio and inspect:

- every technical claim and number;
- names and pronunciation;
- scene boundaries;
- the first hook and complete final sentence;
- truncated or hallucinated phrases.

Prefer the original NotebookLM audio when it passes. If it fails, create a
manifest-backed replacement with `scripts/build_variant_narration.py`. Store
caption copy in `narration`; use `spoken_narration` only for TTS phonetics. The
SRT must retain the correct written spelling.

## 4. Select and prove the style

Search `/Users/suenot/projects/sdvg/youtube_styles/style-library/*/manifest.json`
and its GitHub reference catalog. Use the selected style's reusable visual
contract, source references, palette, layout, and negative constraints instead
of reconstructing it from memory. Separate visual style from example semantics:
never copy Buzz-specific text, objects, or relationships from a sample manifest
into an unrelated video's scene prompt.

For Ink Theater, read the source contract at:

`/Users/suenot/projects/sdvg/higgsfield-auto/cmdop-video-flow/vendor/openmontage/skills/creative/ink-theater.md`

Render a representative information-dense slide first. Present variants as
different designs of the same slide. Generate the whole deck only after the
style is selected or when the user explicitly skips that gate.

Use `google-omni-motion-prompt` only for an optional motion-reference branch.
It does not replace native slide generation or the final renderer.

## 5. Write semantic scene contracts

For every frame, define:

- exact visible text;
- one-sentence thesis;
- required relationships, order, and labels;
- forbidden claims, symbols, and extra text;
- aspect-specific layout notes.

Use one contract for meaning and separate layout prompts for 16:9 and 9:16.
Never ask an image model to rediscover technical meaning from a screenshot.

Use this role mapping by default:

1. `cover.png`: cover and thumbnail; not part of the narrated timeline.
2. `slide_001.png..slide_NNN.png`: one frame for each narration scene, in exact order.
3. `endcard.png`: silent end card.

If the cover must appear inside the video, mark that decision explicitly. It
may replace the opening seconds but must not shift narration or subtitles.

## 6. Generate two native frame sets

Generate desktop frames at 1920x1080 and Shorts frames at 1080x1920 from the
same semantic contracts. Generate the vertical compositions independently.
Never derive Shorts by cropping, blurring, padding, letterboxing, or shrinking
the desktop video into a vertical canvas.

Desktop end card:

- contacts;
- a clean 16:9 `NEXT VIDEO` placement area when requested;
- no unverified command or URL.

Shorts end card:

- contacts only;
- no `NEXT VIDEO` frame, placeholder, or watch-next block;
- no subtitles or pinned title over the contacts.

Keep critical Shorts content inside `x=80..850, y=180..1430`. Leave
`x=900..1080` and `y=1500..1920` visually quiet for YouTube controls and
captions.

## 7. Build an exact timeline

The timeline must contain every narrated scene exactly once, in order, without
gaps or overlaps. Do not accept partial OCR coverage merely because it reaches
a numeric threshold.

When OCR matching misses a slide, write a JSON array with one start timestamp
per slide, beginning with `0`, then build only the timeline:

```bash
venv/bin/python scripts/sync_slides.py \
  --subtitles temp/<slug>/subtitles.json \
  --slides-text temp/<slug>/slides_text.json \
  --slide-starts temp/<slug>/slide-starts.json \
  --output temp/<slug>/timeline.json
```

Do not rerun `run_pipeline.sh` after restyling: it converts and renders the
NotebookLM PDF again. Render the approved native frame directories directly.

For corrected narration, use the exact timeline emitted by
`scripts/build_variant_narration.py`. Append the silent end card after the
narrated duration; do not shift the scene boundaries.

## 8. Render desktop and Short separately

Use `scripts/generate_video.py` with the approved audio, timeline, and matching
native frame directory. Pass `--scale-width 1920 --scale-height 1080` for
desktop and `--scale-width 1080 --scale-height 1920` for Shorts. Use H.264/AAC
at 30 fps for final YouTube delivery unless a user-approved target requires
otherwise.

Append a pre-rendered end card with `scripts/append_endcard.py --card`. The card
must match the video's native dimensions. Keep its duration explicit, normally
10 seconds, and validate the final audio/video tail.

Do not use `scripts/make_short.py` for a native deck. It remains a legacy tool
only for an explicitly requested cut from existing landscape footage.

Before building a Short, require narration duration plus end-card duration to
fit the current official YouTube limit. At this skill version the limit is 180
seconds; recheck the official rule before publication. If it exceeds the
current limit, make a self-contained topic-sized Short instead of speeding up
or truncating the full narration. Stop and propose independent ideas from the
approved scene contracts. After the user selects one, create a separate Short
narration manifest, audio, timeline, and SRT for that idea; do not choose it
silently.

When desktop and Short use the same audio and timeline, their SRT cue text and
timestamps are identical. Produce two named copies for separate upload records;
neither file may extend into the silent end card.

## 9. Pass all QA gates

Follow [qa-and-publishing.md](references/qa-and-publishing.md). Required gates:

- contact-sheet review of every desktop and vertical frame;
- OCR comparison against exact visible text;
- watermark, invented-copy, and prohibited-claim scan;
- Shorts safe-zone overlay review;
- timeline count/order/coverage checks;
- Whisper spot checks of technical scenes and the final sentence;
- full decode plus `ffprobe` validation of resolution, codecs, duration, and A/V tail.

Do not publish a render with a failed gate. Fix the source contract or source
artifact, regenerate only the affected stage, then rerun downstream checks.

## 10. Publish private first, then verify public state

Use `/Users/suenot/projects/trading/marketmaker/video_youtube_publish` and pass
the target channel explicitly. Upload desktop first as Private. Capture the
exact `VIDEO_ID`; verify title, channel, duration, aspect, processing,
restrictions, language, and captions before changing visibility.

Use separate metadata files and non-overlapping titles for desktop and Short.
After desktop is public and its public URL passes a smoke test, put that exact
URL in the Short description. Then repeat the private-first flow for the Short.
Do not use `--allow-duplicate`, and never blindly retry after file selection;
inspect Studio for a draft or existing upload first.

Treat the publisher exit code as one signal, not proof. Confirm the retained
Studio state and public oEmbed/watch URL after visibility changes.

## 11. Close the content loop

Update the matching English and Russian article drafts with the exact desktop
video URL. Publish and deploy the articles only after the video is final, then
smoke-test the production routes. Record the desktop video, its Shorts, their
ideas, URLs, and article relationship in the content CRM when that project is
in scope.

Finish by committing and pushing code, prompts, manifests, and documentation.
Never add generated video/audio or browser profiles to Git.
