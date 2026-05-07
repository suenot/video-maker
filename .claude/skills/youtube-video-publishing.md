---
name: youtube-video-publishing
description: Generate YouTube-ready video (H.264/HEVC encoding), metadata (title, description, tags, timestamps), and thumbnail from video source files (audio, slides, subtitles, article markdown).
type: flexible
---

# YouTube Video Publishing Skill

## Goal
For every generated video, produce:
1. **Optimized title** (≤70 chars visible, ≤100 max)
2. **SEO-friendly description** (keywords in first 150 chars, timestamps, links, CTA)
3. **Relevant tags** (5-15 tags mixing broad + niche)
4. **1280×720 thumbnail** from the first slide

## Title Rules
- Front-load the main keyword within the first 40 characters.
- Use numbers, brackets, or colons to add specificity (e.g., "Plateau Analysis: ...").
- Keep it under 70 characters for full visibility in search results.
- Avoid clickbait; match the actual content.

## Description Rules
- **First 2 lines** (≈150 chars) must contain the core keyword and a hook.
- Add **Timestamps** (chapters) at every slide change; text must be the slide title, not subtitle transcript.
- Include a link to the full article/blog post.
- Add **Tags** section with the researched tag list (comma-separated).
- End with a CTA linking to Telegram (`https://t.me/marketmaker_cc`).

### Description template
```
[SEO hook — first 150 chars with core keyword]

🔍 Timestamps / Таймкоды:
0:00 Slide title
...

📖 Read the full article / Полная статья:
https://marketmaker.cc/en/blog/post/...

💬 Discuss / Обсудить:
https://t.me/marketmaker_cc

🔗 Tags:
tag1, tag2, tag3...

👍 Subscribe to our Telegram channel https://t.me/marketmaker_cc for more algorithmic trading content.
```

## Tags Rules
YouTube tags must be **thematic phrases** (2-4 words) that describe viewer intent, not single words or overly specific song/title names.

**Bad tags:** single words (`trading`, `analysis`), other brands (`vevo`, `official`), overly specific names (`stromae papoutai`), generic filler (`pdf`, `course`, `app`).

**Good tags:** thematic phrases (`french cafe music`, `romantic violin music`, `french music for romantic dinner`).

### Tag pipeline
1. Run `research_youtube_tags.py`:
   - **YouTube Suggest API** — real search phrases people type.
   - **yt-dlp** — extract 2-4 word phrases from competitor titles.
   - **Intent-based seed phrases** — manually curated for the topic.
2. Filter:
   - Minimum 2 words, ideally 3.
   - No bad patterns (`pdf`, `course`, `app`, `official`, `vevo`, `explained`, `for beginners`).
   - No purely broad single words (`trading`, `finance`, `optimization` alone).
3. Always include brand tags: `marketmaker`, `marketmaker_cc`.
4. Limit to 15 tags.

## YouTube Studio Category / Type / Level
When uploading, set these fields in YouTube Studio:

- **Category**: `Education` (for all algorithmic-trading explainer videos).
- **Type** (visible when Category = Education):
  - `Concept overview` — explains what something is and why it matters.
  - `How-to` — step-by-step tutorial.
  - `Problem walkthrough` — solves a specific numerical/logic problem.
  - Default: `Concept overview`.
- **Level**: `Advanced` (quantitative trading content assumes prior knowledge).
- **Problems** (Education-only text block):
  - One line per problem: `M:SS Question text?`
  - Auto-generated from the video title (main problem) + slide titles that pass quality filters.
  - Heuristic skips fragments, imperatives, and lines with OCR artifacts (`|`, `_`, `!` inside short words, trailing em-dash).
  - Review manually before upload; rephrase if title is not question-friendly.

## Slide Title Extraction Rules
Timestamps and Problems depend on clean slide titles from OCR (`slides_text.json`). `generate_metadata.py` applies these filters:

1. **Letter-ratio gate**: skip lines that are < 40% letters or > 30% non-letter symbols.
2. **Length gate**: skip lines shorter than 10 characters or with fewer than 2 words.
3. **Fragment gate**: skip lines ending in `—`, `–`, `-`, `:`, or trailing prepositions (`в`, `без`, `into`, `the`, etc.).
4. **OCR-artifact gate**: skip lines containing pipe `|`, underscore ` _ `, garbage words (`ыы`), or words like `Рип!`.
5. **Merge rule**: if a line ends without sentence punctuation and the next line starts lowercase, merge them (fixes RU two-line titles).
6. **ALL CAPS merge**: for EN title slides, merge consecutive ALL CAPS lines until a non-ALL-CAPS line or a line ending in `.!?` appears.
7. **Max length**: truncate to 100 characters.

## Thumbnail Rules
- Resolution: **1280×720** (16:9).
- Source: first slide image (`slide_001.png`).
- Crop/scale to fit; optionally overlay the video title in bold white text with a subtle dark shadow for readability.
- Keep text minimal (≤5 words) and high contrast.

## Inputs
- `subtitles.json` — Whisper output with word-level timestamps.
- `{slug}.srt` — YouTube-ready SRT subtitle file.
- `slides_text.json` — OCR text per slide.
- `article.md` (optional) — source article with YAML frontmatter (`title`, `description`, `tags`).
- `timeline.json` — slide-to-time mapping for chapter timestamps.
- `tags_research.json` — researched tags from `research_youtube_tags.py`.

## Outputs
- `{slug}_metadata.json` — structured metadata (title, description, tags, timestamps, category, type, level, problems).
- `{slug}_metadata.txt` — human-readable copy-paste format.
- `{slug}_thumbnail.png` — 1280×720 PNG.
- `{slug}.srt` — YouTube-ready subtitles.
- `tag_research_{lang}.json` — raw tag research data (trends, competitors, suggestions).

## Video Encoding Rules
- **Resolution & framerate**: 1920×1080 @ 1 fps for slide decks. Slides are static; 1 fps eliminates OOM risks with concat demuxer + PNG slides while keeping full resolution. YouTube accepts 1 fps.
- **Use quality-based encoding** for slide decks:
  - `hevc_videotoolbox -q:v 65` (default) — Apple Silicon hardware HEVC; fast, no OOM risk, ~30× smaller than fixed-rate H.264, accepted by YouTube.
  - `h264_videotoolbox -q:v 65` — Apple Silicon hardware H.264; fastest, but larger than HEVC.
  - `libx264 -crf 23 -preset medium` — best compression ratio, but risks OOM on high-res slide decks. Use only for low-resolution or short videos.
- **Audio**: AAC 192k for voice narration.
- **Container**: MP4 with `-movflags +faststart` for streaming.
- YouTube re-encodes everything on upload; smaller source files upload faster and process quicker.

## Pipeline Integration
Run via `run_pipeline.sh`.
1. **Video generation** (`generate_video.py`) — `hevc_videotoolbox` by default; override with `--codec`.
2. **Subtitles** (`subtitles_to_srt.py`) — convert Whisper JSON to YouTube SRT.
3. **Tag research** (`research_youtube_tags.py`) — pytrends + yt-dlp + YouTube Suggest API.
4. **Metadata generation** (`generate_metadata.py`) — consumes researched tags via `--tags-file`; timestamps use **cleaned slide titles** (OCR filtered + merged); outputs Category, Type, Level, and Problems.
5. **Thumbnail generation** (`generate_thumbnail.py`) — PNG from first slide.
