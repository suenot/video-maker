#!/usr/bin/env python3
"""Turn someone else's YouTube video into a single NotebookLM-ready markdown source.

Downloads the video with yt-dlp, flattens YouTube's rolling auto-captions into
prose, recovers the slide deck with an ffmpeg scene-change filter, OCRs the
surviving slides and interleaves everything into one `source.md`.

Research input only: the source video is read, never re-uploaded, re-cut or
translated. Anything quoted downstream gets attributed.
"""
import argparse
import glob
import json
import os
import re
import shutil
import subprocess

from PIL import Image

CUE_RE = re.compile(r"^(\d+:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d+:\d{2}:\d{2}\.\d{3})")
TAG_RE = re.compile(r"<[^>]*>")
PTS_RE = re.compile(r"\bpts_time:([0-9.]+)")
ID_RE = re.compile(r"([0-9A-Za-z_-]{11})")

PARAGRAPH_SECONDS = 30     # transcript is regrouped into ~30 s blocks
ROLLING_WINDOW = 4         # how far back to look for a repeated caption line
DEDUP_SIZE = (64, 36)      # frames are compared at this size, in grayscale
DEDUP_CROP = 0.92          # bottom 8% is dropped: progress bars live there
MIN_SCENE_RATE = 1 / 30.0  # scene frames per second below which sampling takes over


# ---------------------------------------------------------------- timestamps

def parse_timestamp(value: str) -> float:
    """Accept SS(.mmm), MM:SS(.mmm) or HH:MM:SS(.mmm)."""
    seconds = 0.0
    for part in str(value).strip().replace(",", ".").split(":"):
        seconds = seconds * 60 + float(part)
    return seconds


def format_timestamp(seconds: float) -> str:
    """Format seconds as MM:SS, or H:MM:SS past the hour."""
    total = int(seconds)
    hours, minutes, secs = total // 3600, (total % 3600) // 60, total % 60
    return f"{hours}:{minutes:02d}:{secs:02d}" if hours else f"{minutes:02d}:{secs:02d}"


# ------------------------------------------------------------------ download

def extract_video_id(value: str) -> str:
    """Pull the 11-char id out of a URL, or pass a bare id through."""
    value = value.strip()
    if re.fullmatch(r"[0-9A-Za-z_-]{11}", value):
        return value
    for pattern in (r"[?&]v=([0-9A-Za-z_-]{11})", r"/(?:shorts|embed|live|v)/([0-9A-Za-z_-]{11})",
                    r"youtu\.be/([0-9A-Za-z_-]{11})"):
        match = re.search(pattern, value)
        if match:
            return match.group(1)
    raise ValueError(f"Cannot find a video id in: {value}")


def download(url: str, work_dir: str):
    """Fetch video + captions + metadata. Already-downloaded files are kept."""
    os.makedirs(work_dir, exist_ok=True)
    cmd = [
        "yt-dlp",
        "-f", "bestvideo[height<=1080]+bestaudio/best",
        "--merge-output-format", "mp4",
        "--write-auto-subs",
        "--write-subs",
        "--sub-langs", "en.*",
        "--sub-format", "vtt",
        "--write-info-json",
        "--no-overwrites",
        "--no-progress",
        "-o", os.path.join(work_dir, "%(id)s.%(ext)s"),
        url,
    ]
    subprocess.run(cmd, check=True)


def pick_vtt(work_dir: str, video_id: str) -> str:
    """Prefer the plain `en` track, then the original-language one."""
    candidates = sorted(glob.glob(os.path.join(work_dir, f"{video_id}.en*.vtt")))
    for suffix in (".en.vtt", ".en-orig.vtt"):
        for path in candidates:
            if path.endswith(suffix):
                return path
    return candidates[0] if candidates else ""


def load_info(work_dir: str, video_id: str) -> dict:
    path = os.path.join(work_dir, f"{video_id}.info.json")
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------- transcript

def parse_vtt(path: str):
    """Return [(start_seconds, line)] with the rolling-caption repeats removed.

    YouTube auto-captions scroll: every cue repeats the tail of the previous one
    and paints the new words in with inline `<00:00:01.234><c>` timing tags. The
    tags are stripped and any line already emitted in the last few lines is
    dropped, which leaves each spoken line exactly once.
    """
    with open(path, "r", encoding="utf-8-sig") as f:
        raw = f.read().replace("\r\n", "\n")

    lines = []
    for block in raw.split("\n\n"):
        rows = [row for row in block.split("\n") if row.strip()]
        if not rows:
            continue
        match = next((CUE_RE.match(row) for row in rows if CUE_RE.match(row)), None)
        if not match:
            continue
        start = parse_timestamp(match.group(1))
        for row in rows:
            if CUE_RE.match(row):
                continue
            text = " ".join(TAG_RE.sub("", row).split())
            text = text.replace("&nbsp;", " ").replace("&amp;", "&")
            if not text:
                continue
            if any(text == prev for _, prev in lines[-ROLLING_WINDOW:]):
                continue
            lines.append((start, text))
    return lines


def transcribe(video_path: str, model_size: str):
    """Whisper fallback for videos with no captions at all."""
    import whisper

    print(f"No captions found, loading Whisper model {model_size}...")
    model = whisper.load_model(model_size)
    result = model.transcribe(video_path, language="en")
    return [(seg["start"], seg["text"].strip()) for seg in result.get("segments", [])
            if seg.get("text", "").strip()]


def group_lines(lines, span: int = PARAGRAPH_SECONDS):
    """Merge caption lines into ~`span`-second paragraphs."""
    blocks = []
    start, buffer = None, []
    for moment, text in lines:
        if start is None:
            start = moment
        if buffer and moment - start >= span:
            blocks.append((start, " ".join(buffer)))
            start, buffer = moment, []
        buffer.append(text)
    if buffer:
        blocks.append((start, " ".join(buffer)))
    return blocks


# -------------------------------------------------------------------- slides

def extract_frames(video_path: str, raw_dir: str, video_filter: str):
    """Run one ffmpeg pass and return [(seconds, path)] read off the showinfo log."""
    if os.path.isdir(raw_dir):
        shutil.rmtree(raw_dir)
    os.makedirs(raw_dir)

    cmd = [
        "ffmpeg", "-hide_banner", "-nostdin", "-y",
        "-i", video_path,
        "-vf", f"{video_filter},showinfo",
        "-vsync", "vfr",
        os.path.join(raw_dir, "frame_%04d.png"),
    ]
    proc = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True)
    stamps = [float(m) for m in PTS_RE.findall(proc.stderr.decode("utf-8", "replace"))]

    paths = sorted(glob.glob(os.path.join(raw_dir, "frame_*.png")))
    if len(stamps) != len(paths):
        print(f"Warning: {len(stamps)} showinfo timestamps for {len(paths)} frames")
    return list(zip(stamps, paths))


def slide_candidates(video_path: str, raw_dir: str, threshold: float,
                     sample_fps: float, duration: float):
    """Scene changes when the deck has hard cuts, a uniform sample when it does not.

    The monitored channels render dark decks, and ffmpeg's `scene` score is an
    absolute difference: two completely unrelated near-black slides score around
    0.02, so the usual 0.25 threshold returns a single frame for a ten-minute
    deck. When the filter comes back that empty the deck is recovered by
    sampling instead, and the perceptual dedup below does the discriminating.
    """
    frames = extract_frames(video_path, raw_dir,
                            f"select='eq(n,0)+gt(scene,{threshold})'")
    if not duration or len(frames) >= duration * MIN_SCENE_RATE:
        return frames, f"scene>{threshold}"

    print(f"Only {len(frames)} scene changes in {format_timestamp(duration)} — "
          f"dark deck, sampling at {sample_fps} fps instead")
    return extract_frames(video_path, raw_dir, f"fps={sample_fps}"), f"sampled at {sample_fps} fps"


def fingerprint(path: str) -> bytes:
    """Downscaled grayscale copy, progress-bar strip cropped off."""
    with Image.open(path) as img:
        img = img.convert("L")
        width, height = img.size
        img = img.crop((0, 0, width, int(height * DEDUP_CROP)))
        return img.resize(DEDUP_SIZE, Image.BILINEAR).tobytes()


def frame_distance(a: bytes, b: bytes) -> float:
    """Mean absolute difference, 0 (identical) to 255."""
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)


def group_frames(frames, threshold: float):
    """Group consecutive frames showing the same slide.

    Every frame is compared against the first frame of the open group, so a
    talking-head corner or a creeping progress bar never opens a new one, while
    a deck that builds up in steps splits into one group per step.
    """
    groups, anchor = [], None
    for moment, path in frames:
        current = fingerprint(path)
        if anchor is None or frame_distance(anchor, current) >= threshold:
            groups.append([(moment, path)])
            anchor = current
        else:
            groups[-1].append((moment, path))
    return groups


def pick_slides(groups):
    """One frame per group: the middle one, which is past the transition-in."""
    return [(group[0][0], group[len(group) // 2][1]) for group in groups]


def collect_slides(frames, slides_dir: str):
    """Move the survivors into `slides_dir` renumbered from 1."""
    if os.path.isdir(slides_dir):
        shutil.rmtree(slides_dir)
    os.makedirs(slides_dir)

    slides = []
    for index, (moment, path) in enumerate(frames, start=1):
        name = f"slide_{index:03d}.png"
        shutil.move(path, os.path.join(slides_dir, name))
        slides.append({"index": index, "time": moment, "name": name, "text": ""})
    return slides


# ----------------------------------------------------------------------- ocr

def clean_ocr(text: str) -> str:
    """Collapse whitespace and drop the single-character noise tesseract emits."""
    rows = []
    for row in text.splitlines():
        row = " ".join(row.split())
        if len(row) < 2 or not any(ch.isalnum() for ch in row):
            continue
        rows.append(row)
    return "\n".join(rows)


def ocr_slides(slides, slides_dir: str, lang: str) -> bool:
    """OCR every slide in place. Returns False when tesseract is unavailable."""
    if not shutil.which("tesseract"):
        print("Warning: tesseract not found, slides will be listed without their text")
        return False
    try:
        import pytesseract
    except ImportError:
        print("Warning: pytesseract not installed, slides will be listed without their text")
        return False

    for slide in slides:
        path = os.path.join(slides_dir, slide["name"])
        try:
            with Image.open(path) as img:
                slide["text"] = clean_ocr(pytesseract.image_to_string(img, lang=lang))
        except Exception as e:
            print(f"Warning: failed to OCR {slide['name']}: {e}")
    return True


# ------------------------------------------------------------------ source.md

def build_source_md(info: dict, blocks, slides, meta: dict) -> str:
    out = ["---"]
    out.append(f"source_url: {info.get('webpage_url', '')}")
    out.append(f"title: {json.dumps(info.get('title', ''), ensure_ascii=False)}")
    out.append(f"channel: {json.dumps(info.get('channel') or info.get('uploader', ''), ensure_ascii=False)}")
    upload = str(info.get("upload_date") or "")
    if len(upload) == 8:
        upload = f"{upload[:4]}-{upload[4:6]}-{upload[6:]}"
    out.append(f"upload_date: {upload}")
    out.append(f"duration: {format_timestamp(info.get('duration') or 0)}")
    for key, value in meta.items():
        out.append(f"{key}: {value}")
    out.append("usage: reference material only — not for republication, re-upload or translation")
    out.append("---")
    out.append("")
    out.append("> **Reference material.** This is a third-party video captured as research")
    out.append("> input. The transcript and the deck below are to be read, not republished;")
    out.append("> anything quoted must be attributed to the source above.")
    out.append("")
    out.append("## Transcript and slides")
    out.append("")

    timeline = [(moment, "text", text) for moment, text in blocks]
    timeline += [(slide["time"], "slide", slide) for slide in slides]
    timeline.sort(key=lambda item: (item[0], item[1] == "text"))

    for moment, kind, payload in timeline:
        stamp = format_timestamp(moment)
        if kind == "text":
            out.append(f"**[{stamp}]** {payload}")
            out.append("")
        else:
            out.append(f"### [{stamp}] Slide {payload['index']:02d}")
            out.append("")
            out.append(f"![Slide {payload['index']:02d}](slides/{payload['name']})")
            out.append("")
            if payload["text"]:
                out.append("Text on slide:")
                out.append("")
                out.append("```text")
                out.append(payload["text"])
                out.append("```")
                out.append("")
    return "\n".join(out).rstrip() + "\n"


# ---------------------------------------------------------------------- main

def ingest(video: str, out_dir: str, scene_threshold: float, dedup_threshold: float,
           sample_fps: float, whisper_model: str, ocr_lang: str, keep_video: bool) -> str:
    video_id = extract_video_id(video)
    url = video if video.startswith("http") else f"https://youtu.be/{video_id}"
    work_dir = os.path.join(out_dir, video_id)

    download(url, work_dir)
    info = load_info(work_dir, video_id)
    video_path = os.path.join(work_dir, f"{video_id}.mp4")
    if not os.path.exists(video_path):
        raise SystemExit(f"yt-dlp produced no {video_path}")

    vtt_path = pick_vtt(work_dir, video_id)
    if vtt_path:
        lines = parse_vtt(vtt_path)
        source = f"youtube-captions ({os.path.basename(vtt_path).split('.')[-2]})"
        print(f"Transcript: {len(lines)} lines from {os.path.basename(vtt_path)}")
    else:
        lines = transcribe(video_path, whisper_model)
        source = f"whisper ({whisper_model})"
        print(f"Transcript: {len(lines)} segments from Whisper")
    blocks = group_lines(lines)

    raw_dir = os.path.join(work_dir, "frames_raw")
    slides_dir = os.path.join(work_dir, "slides")
    frames, how = slide_candidates(video_path, raw_dir, scene_threshold, sample_fps,
                                   info.get("duration") or 0)
    kept = pick_slides(group_frames(frames, dedup_threshold))
    print(f"Slides: {len(frames)} candidate frames -> {len(kept)} after dedup")
    slides = collect_slides(kept, slides_dir)
    shutil.rmtree(raw_dir, ignore_errors=True)

    has_ocr = ocr_slides(slides, slides_dir, ocr_lang)

    words = sum(len(text.split()) for _, text in blocks)
    meta = {
        "transcript": source,
        "transcript_words": words,
        "slides": f"{len(slides)} kept of {len(frames)} candidate frames ({how})",
        "slide_text": f"tesseract ({ocr_lang})" if has_ocr else "none — read the PNGs",
    }
    source_md = os.path.join(work_dir, "source.md")
    with open(source_md, "w", encoding="utf-8") as f:
        f.write(build_source_md(info, blocks, slides, meta))

    if not keep_video:
        os.remove(video_path)
    print(f"Wrote {source_md} ({words} transcript words, {len(slides)} slides)")
    return source_md


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("video", help="YouTube video id or URL")
    parser.add_argument("--out-dir", default="ingest")
    parser.add_argument("--scene-threshold", type=float, default=0.25,
                        help="ffmpeg scene score above which a frame is a new slide")
    parser.add_argument("--dedup-threshold", type=float, default=4.0,
                        help="mean pixel difference below which two frames are the same slide")
    parser.add_argument("--sample-fps", type=float, default=0.5,
                        help="sampling rate used when the deck has no detectable scene cuts")
    parser.add_argument("--keep-video", action="store_true", help="do not delete the source mp4")
    parser.add_argument("--whisper-model", default="large-v3-turbo",
                        help="only used when the video has no captions")
    parser.add_argument("--ocr-lang", default="eng")
    args = parser.parse_args()

    ingest(args.video, args.out_dir, args.scene_threshold, args.dedup_threshold,
           args.sample_fps, args.whisper_model, args.ocr_lang, args.keep_video)


if __name__ == "__main__":
    main()
