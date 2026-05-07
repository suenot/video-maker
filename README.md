# Video Maker

Automated pipeline for generating YouTube videos from audio narration and PDF slide decks. Produces MP4 video with synchronized slides, SRT subtitles, YouTube metadata, and thumbnails.

## What It Does

Given an audio file (narration) and a PDF slide deck, the pipeline:

1. **Converts PDF to images** — each slide becomes a PNG via `pdftoppm` (Poppler)
2. **Extracts text from slides** — OCR via Tesseract to get slide content
3. **Transcribes audio** — speech-to-text via OpenAI Whisper with word-level timestamps
4. **Generates SRT subtitles** — Whisper segments converted to YouTube-ready SRT format
5. **Synchronizes slides with audio** — matches transcription text to slide OCR text using word overlap + bigram scoring to determine when each slide should appear
6. **Generates video** — assembles slides + audio into MP4 using FFmpeg with hardware-accelerated encoding (HEVC/H.264 via VideoToolbox on macOS)
7. **Researches YouTube tags** — combines YouTube Suggest API, competitor title analysis (via yt-dlp), and intent-based phrases
8. **Generates metadata** — title, description with timestamps, tags, category, problems (for YouTube Education)
9. **Generates thumbnail** — 1280×720 PNG from the first slide

## Requirements

- Python 3.9+
- [FFmpeg](https://ffmpeg.org/) with VideoToolbox support (default on macOS)
- [Poppler](https://poppler.freedesktop.org/) (`pdftoppm` command) — `brew install poppler`
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) — `brew install tesseract`
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (optional, for tag research)

### Python Dependencies

```bash
python -m venv venv
source venv/bin/activate
pip install openai-whisper pillow pytesseract
```

Optional (for tag research via Google Trends):
```bash
pip install pytrends
```

## Project Structure

```
video_maker/
├── scripts/
│   ├── run_pipeline.sh          # Main pipeline runner
│   ├── pdf_to_images.py         # PDF → PNG slide images
│   ├── extract_pdf_text.py      # OCR text extraction from slide images
│   ├── extract_subtitles.py     # Audio → Whisper JSON transcription
│   ├── subtitles_to_srt.py      # Whisper JSON → SRT subtitles
│   ├── sync_slides.py           # Build slide-to-time mapping
│   ├── generate_video.py        # Slides + audio → MP4
│   ├── research_youtube_tags.py # YouTube tag research
│   ├── generate_metadata.py     # Generate YouTube metadata
│   └── generate_thumbnail.py    # Generate 1280×720 thumbnail
├── input/                       # Source files (audio, PDF slides)
├── output/                      # Final video, metadata, subtitles, thumbnail
├── temp/                        # Intermediate files (slide images, OCR, timeline)
└── venv/                        # Python virtual environment
```

## Usage

### Run Full Pipeline

```bash
bash scripts/run_pipeline.sh en   # English version
bash scripts/run_pipeline.sh ru   # Russian version
```

### Run Individual Steps

Each script can be run independently:

```bash
# 1. Convert PDF to images
python scripts/pdf_to_images.py --pdf input/slides.pdf --out-dir temp/slides --dpi 200

# 2. Extract text from slide images (OCR)
python scripts/extract_pdf_text.py --images-dir temp/slides --output temp/slides_text.json --lang eng

# 3. Transcribe audio with Whisper
python scripts/extract_subtitles.py --audio input/audio.m4a --output temp/subtitles.json --model base --language en

# 4. Convert subtitles to SRT
python scripts/subtitles_to_srt.py --subtitles temp/subtitles.json --output output/video.srt

# 5. Sync slides with audio timeline
python scripts/sync_slides.py --subtitles temp/subtitles.json --slides-text temp/slides_text.json --output temp/timeline.json

# 6. Generate video
python scripts/generate_video.py --timeline temp/timeline.json --slides-dir temp/slides --audio input/audio.m4a --output output/video.mp4

# 7. Research YouTube tags
python scripts/research_youtube_tags.py --seed-keywords "keyword1,keyword2" --lang en --max-tags 15 --output temp/tags.json

# 8. Generate metadata
python scripts/generate_metadata.py --subtitles temp/subtitles.json --slides-text temp/slides_text.json --timeline temp/timeline.json --output-json output/metadata.json --output-txt output/metadata.txt --lang en --tags-file temp/tags.json

# 9. Generate thumbnail
python scripts/generate_thumbnail.py --slides-dir temp/slides --output output/thumbnail.png
```

## Video Encoding

The pipeline supports three codecs:

| Codec | Speed | File Size | Notes |
|---|---|---|---|
| `hevc_videotoolbox` | Fast (GPU) | Smallest | Default. Apple Silicon HEVC hardware encoding |
| `h264_videotoolbox` | Fastest (GPU) | Medium | Apple Silicon H.264 hardware encoding |
| `libx264` | Slow (CPU) | Small | Best compression, but may OOM on large slides |

Default: `hevc_videotoolbox` at 1920×1080 resolution, 1 fps (optimal for static slide content).

## Slide Synchronization Algorithm

The `sync_slides.py` uses a greedy forward-matching algorithm:
- Slides advance monotonically (never go back)
- Each transcription segment is scored against the current slide and `look_ahead` upcoming slides
- A slide transition occurs only when the next slide's score exceeds the current by `advance_ratio` (default 1.3×) **and** the current slide has been shown for at least `min_duration` seconds (default 5s)
- Scoring uses word overlap + bigram matching between transcription text and OCR slide text

## Input File Structure

```
input/<slug>/
├── audio_en.m4a      # English narration
├── audio_ru.m4a      # Russian narration (optional)
├── slides_en.pdf     # English slide deck
├── slides_ru.pdf     # Russian slide deck (optional)
└── article_ru.md     # Article with YAML frontmatter (optional)
```

## Output Files

| File | Description |
|---|---|
| `<slug>.mp4` | Final video (slides + audio) |
| `<slug>.srt` | YouTube-ready SRT subtitles |
| `<slug>_metadata.json` | Structured metadata (title, description, tags, timestamps) |
| `<slug>_metadata.txt` | Human-readable metadata for YouTube Studio |
| `<slug>_thumbnail.png` | 1280×720 thumbnail image |

## Related Projects

- [video_youtube_prepare](../video_youtube_prepare/) — metadata preparation for already-made videos

## License

MIT
