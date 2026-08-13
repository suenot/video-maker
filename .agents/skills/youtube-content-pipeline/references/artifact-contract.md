# Artifact contract

Read this reference before creating or rebuilding a video package.

## Tracked production files

Store reusable decisions under `storyboards/<slug>/`:

```text
storyboards/<slug>/
├── production-manifest.json
├── product-facts.md
├── narration-source.md
├── narration-manifest.json       # only when narration is synthesized
├── semantic-scenes.md
├── prompts-desktop.md
└── prompts-shorts.md
```

Do not store generated media in this directory. Approved hero art may live in a
website's normal public-assets directory when the website requires it, but it
is not a substitute for the ignored production outputs.

## Ignored media layout

```text
input/<slug>/
├── audio_<lang>.m4a
└── slides_<lang>.pdf

output/<slug>/
├── slides-desktop/slide_001.png ... slide_NNN.png
├── slides-desktop/cover.png
├── slides-desktop/endcard.png
├── slides-shorts/slide_001.png ... slide_NNN.png
├── slides-shorts/cover.png
├── slides-shorts/endcard.png
├── <slug>-desktop.mp4
├── <slug>-short.mp4
├── <slug>-desktop.srt
├── <slug>-short.srt
├── <slug>_thumbnail.png
├── <slug>-desktop_metadata.json
└── <slug>-short_metadata.json

temp/<slug>/
├── source-slides/
├── subtitles.json
├── slides_text.json
├── timeline.json
├── slide-starts.json
├── contact-sheet-desktop.png
├── contact-sheet-shorts.png
└── qa/
```

Never force-add these media paths to Git. Browser profiles, cookies, debug
screenshots, local databases, and upload logs also remain untracked.

Create `<slug>_thumbnail.png` as an upload-ready 1280x720 derivative of the
approved desktop `cover.png`. Do not use the first narrated frame as an
implicit cover.

## Production manifest

Use one manifest as the state and provenance source of truth:

```json
{
  "schema_version": 1,
  "slug": "example-video",
  "language": "en",
  "scope": "full-deck-and-publish",
  "status": "sources_frozen",
  "publication": {
    "channel_handle": "@example",
    "contacts": ["https://example.com/contact"],
    "article_en": {"value": null, "state": "not_in_scope"},
    "article_ru": {"value": null, "state": "not_in_scope"},
    "desktop_next_video": {"value": null, "state": "not_in_scope"},
    "desktop_url_state": "pending"
  },
  "sources": {
    "audio": {"path": "input/example-video/audio_en.m4a", "sha256": "..."},
    "slides": {"path": "input/example-video/slides_en.pdf", "sha256": "..."},
    "gaia_run": "/absolute/path/to/original/run"
  },
  "style": {
    "library_id": "buzz-hook-slide",
    "style_id": "05-ink-theater",
    "manifest": "/absolute/path/to/style/manifest.json",
    "approved_sample": "temp/example-video/style-proof.png"
  },
  "scenes": {
    "cover": "cover.png",
    "narrated": ["slide_001.png", "slide_002.png"],
    "endcard": "endcard.png",
    "endcard_duration": 10.0
  },
  "artifacts": {
    "desktop_slides": "output/example-video/slides-desktop",
    "shorts_slides": "output/example-video/slides-shorts",
    "audio": "input/example-video/audio_en.m4a",
    "timeline": "temp/example-video/timeline.json",
    "desktop_video": "output/example-video/example-video-desktop.mp4",
    "short_video": "output/example-video/example-video-short.mp4"
  },
  "approvals": {
    "style": null,
    "frames": null,
    "render": null,
    "publish": null
  },
  "youtube": {
    "channel_handle": null,
    "desktop_id": null,
    "desktop_url": null,
    "short_id": null,
    "short_url": null
  }
}
```

Use status values that reflect real progress, for example `sources_frozen`,
`style_approved`, `frames_approved`, `render_approved`, and `published`. Do not
mark an approval or published state based only on a command's exit code.

## Scene and aspect invariants

- `cover.png` is a cover/thumbnail by default and does not consume narration.
- Narrated slides map one-to-one to timeline scenes in ascending order.
- Narrated filenames use the renderer's exact `slide_001.png` convention.
- The end card begins after narration and is intentionally silent unless its
  audio bed is explicitly approved.
- Desktop and Short directories contain the same semantic scene roles, but
  their images are generated independently.
- Visible copy is exact, appears once unless the scene contract says otherwise,
  and contains no image-model filler text.
- A Short end card has contacts only. A desktop end card may reserve a clean
  16:9 area for a YouTube end-screen element.

## Shorts geometry

Canvas: `1080x1920`.

- Critical content: `x=80..850`, `y=180..1430`.
- Keep `x=900..1080` clear for right-side controls.
- Keep `y=1500..1920` clear for captions and bottom UI.
- Put the headline near the top and the main metaphor in the middle.
- Keep long contact URLs above `y=1430` and left of `x=850`.
- Do not reserve space for a next-video card.
