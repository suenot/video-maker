#!/usr/bin/env python3
"""Cut a vertical 1080x1920 YouTube Short out of a finished landscape video + SRT.

The local ffmpeg is built without libass/freetype, so `subtitles`, `ass` and
`drawtext` are all unavailable. Subtitles are therefore rasterised with Pillow
into a transparent PNG sequence and composited with a plain `overlay` filter.
"""
import argparse
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
MARGIN = 72                # left/right safe area for text
SUB_BOTTOM = 1600          # bottom edge of the subtitle block (above Shorts UI)
TITLE_TOP = 150
STROKE = 5
BOX_ALPHA = 150
MAX_SUB_LINES = 3          # longer cues are shrunk, not allowed to eat the slide
MAX_TITLE_LINES = 3
MIN_SIZE = 46              # floor for the auto-shrink

# (path, ttc face index). First entry that renders every glyph wins.
FONTS = {
    "ru": [
        ("/System/Library/Fonts/Supplemental/Arial Black.ttf", 0),
        ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 0),
        ("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", 0),
    ],
    "en": [
        ("/System/Library/Fonts/Supplemental/Arial Black.ttf", 0),
        ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 0),
        ("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", 0),
    ],
    # Hiragino Sans GB face 2 is W6 (bold); W3 at index 0 is too light for phones
    "zh": [
        ("/System/Library/Fonts/Hiragino Sans GB.ttc", 2),
        ("/System/Library/Fonts/STHeiti Medium.ttc", 1),
        ("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", 0),
    ],
}

NOTDEF = "\uFFFF"     # noncharacter: FreeType always maps it to glyph 0
ZERO_WIDTH = "\u200b\u200c\u200d\ufeff\u00ad"
NO_BREAK_BEFORE = "。，、．！？：；）〕］｝」』〉》”’,.!?:;)]}%…"
NO_BREAK_AFTER = "（〔［｛「『〈《“‘([{"


# ---------------------------------------------------------------- timestamps

def parse_timestamp(value: str) -> float:
    """Accept SS(.mmm), MM:SS(.mmm) or HH:MM:SS(.mmm)."""
    parts = str(value).strip().replace(",", ".").split(":")
    if len(parts) > 3:
        raise ValueError(f"Bad timestamp: {value}")
    seconds = 0.0
    for part in parts:
        seconds = seconds * 60 + float(part)
    return seconds


# ---------------------------------------------------------------------- srt

def parse_srt(path: str):
    """Return [(start, end, text)] with the cue text flattened to one line."""
    with open(path, "r", encoding="utf-8-sig") as f:
        raw = f.read()

    cues = []
    for block in raw.replace("\r\n", "\n").strip().split("\n\n"):
        lines = [ln for ln in block.split("\n") if ln.strip()]
        if len(lines) < 2:
            continue
        if "-->" in lines[0]:
            time_line, text_lines = lines[0], lines[1:]
        elif "-->" in lines[1]:
            time_line, text_lines = lines[1], lines[2:]
        else:
            continue
        start_s, _, end_s = time_line.partition("-->")
        try:
            start = parse_timestamp(start_s)
            end = parse_timestamp(end_s)
        except ValueError:
            continue
        text = " ".join(ln.strip() for ln in text_lines).strip()
        text = "".join(ch for ch in text if ch not in ZERO_WIDTH)
        if text:
            cues.append((start, end, text))
    return cues


def clip_cues(cues, start: float, end: float):
    """Re-base cues against `start` and drop everything outside the segment."""
    out = []
    for cue_start, cue_end, text in cues:
        s = max(cue_start, start) - start
        e = min(cue_end, end) - start
        if e - s > 0.05:
            out.append((s, e, text))
    return out


# -------------------------------------------------------------------- fonts

def _glyph_bits(font, ch: str) -> bytes:
    size = font.size * 3
    img = Image.new("L", (size, size), 0)
    ImageDraw.Draw(img).text((size // 4, size // 4), ch, font=font, fill=255)
    return img.tobytes()


def missing_glyphs(font, text: str):
    """Characters the font renders as notdef (tofu) or as nothing at all."""
    notdef = _glyph_bits(font, NOTDEF)
    missing = []
    for ch in dict.fromkeys(text):
        if ch.isspace():
            continue
        bits = _glyph_bits(font, ch)
        if not any(bits) or bits == notdef:
            missing.append(ch)
    return missing


def pick_face(lang: str, text: str, override: str = None, index: int = 0):
    """Return the first (path, face) that renders `text` without tofu, or abort."""
    candidates = [(override, index)] if override else FONTS.get(lang, FONTS["en"])
    tried = []
    for path, idx in candidates:
        if not os.path.exists(path):
            tried.append(f"{path}: not installed")
            continue
        font = ImageFont.truetype(path, 64, index=idx)
        missing = missing_glyphs(font, text)
        if not missing:
            print(f"Font for '{lang}': {path} (face {idx}) -> {font.getname()}")
            return path, idx
        tried.append(f"{path}[{idx}] cannot render: {''.join(missing[:20])}")
    raise SystemExit(
        f"No font can render the {lang} text without tofu boxes.\n  "
        + "\n  ".join(tried)
        + "\nPass --font /path/to/font.ttf (and --font-index) with a face that covers these glyphs."
    )


class Face:
    """One font file/face, memoised per pixel size."""

    def __init__(self, path: str, index: int):
        self.path, self.index = path, index
        self._sizes = {}

    def at(self, size: int):
        if size not in self._sizes:
            self._sizes[size] = ImageFont.truetype(self.path, size, index=self.index)
        return self._sizes[size]


# ------------------------------------------------------------------ wrapping

def is_cjk(ch: str) -> bool:
    code = ord(ch)
    return (0x3000 <= code <= 0x303F or 0x3400 <= code <= 0x4DBF
            or 0x4E00 <= code <= 0x9FFF or 0xF900 <= code <= 0xFAFF
            or 0xFF00 <= code <= 0xFF65 or 0x20000 <= code <= 0x2FA1F)


def has_cjk(text: str) -> bool:
    return any(is_cjk(ch) for ch in text)


def _width(font, text: str) -> float:
    return font.getlength(text)


def wrap_latin(text: str, font, max_width: float):
    lines, current = [], ""
    for word in text.split():
        probe = f"{current} {word}".strip()
        if current and _width(font, probe) > max_width:
            lines.append(current)
            current = word
        else:
            current = probe
    if current:
        lines.append(current)
    return lines or [""]


def _cjk_tokens(text: str):
    """CJK characters become single tokens; latin runs stay glued together."""
    tokens, buf = [], ""
    for ch in text:
        if is_cjk(ch) or ch.isspace():
            if buf:
                tokens.append(buf)
                buf = ""
            if not ch.isspace():
                tokens.append(ch)
        else:
            buf += ch
    if buf:
        tokens.append(buf)
    return tokens


def wrap_cjk(text: str, font, max_width: float):
    lines, current = [], ""
    for token in _cjk_tokens(text):
        sep = " " if (current and not is_cjk(token[0])
                      and not is_cjk(current[-1])) else ""
        probe = current + sep + token
        if not current:
            current = token
        elif _width(font, probe) <= max_width:
            current = probe
        elif token[0] in NO_BREAK_BEFORE or current[-1] in NO_BREAK_AFTER:
            current = probe          # let the line overflow rather than orphan punctuation
        else:
            lines.append(current)
            current = token
    if current:
        lines.append(current)
    return lines or [""]


def wrap(text: str, font, max_width: float, lang: str):
    if lang == "zh" or has_cjk(text):
        return wrap_cjk(text, font, max_width)
    return wrap_latin(text, font, max_width)


def fit(text: str, face: "Face", size: int, max_width: float, lang: str, max_lines: int):
    """Wrap `text`, shrinking the type until it fits `max_lines` (or hits MIN_SIZE)."""
    while True:
        font = face.at(size)
        lines = wrap(text, font, max_width, lang)
        if len(lines) <= max_lines or size <= MIN_SIZE:
            return lines, font
        size = max(MIN_SIZE, size - 4)


# ------------------------------------------------------------------ drawing

def draw_block(img, lines, font, top: float, box_alpha: int = BOX_ALPHA):
    draw = ImageDraw.Draw(img)
    ascent, descent = font.getmetrics()
    line_h = ascent + descent
    gap = int(line_h * 0.18)
    widths = [_width(font, line) for line in lines]
    block_h = len(lines) * line_h + (len(lines) - 1) * gap

    pad_x, pad_y = 34, 24
    half = max(widths) / 2 + STROKE + pad_x
    draw.rounded_rectangle(
        [W / 2 - half, top - pad_y, W / 2 + half, top + block_h + pad_y],
        radius=32, fill=(0, 0, 0, box_alpha),
    )

    y = top
    for line, width in zip(lines, widths):
        draw.text(((W - width) / 2, y), line, font=font, fill=(255, 255, 255, 255),
                  stroke_width=STROKE, stroke_fill=(0, 0, 0, 235))
        y += line_h + gap
    return block_h


def block_height(lines, font) -> float:
    ascent, descent = font.getmetrics()
    line_h = ascent + descent
    return len(lines) * line_h + (len(lines) - 1) * int(line_h * 0.18)


def render_layer(sub, title):
    """`sub` and `title` are (lines, font) pairs; either may be None."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if title:
        draw_block(img, title[0], title[1], TITLE_TOP, box_alpha=175)
    if sub:
        draw_block(img, sub[0], sub[1], SUB_BOTTOM - block_height(*sub))
    return img


def render_sequence(cues, duration: float, sub_fps: int, title, temp_dir: str) -> int:
    """Write one PNG per subtitle frame, hard-linking repeats of the same layer."""
    n_frames = int(math.ceil(duration * sub_fps)) + 1
    cache = {}
    for i in range(n_frames):
        t = (i + 0.5) / sub_fps
        key = None
        for idx, (start, end, _, _) in enumerate(cues):
            if start <= t < end:
                key = idx
                break
        path = os.path.join(temp_dir, f"sub_{i:05d}.png")
        if key in cache:
            os.link(cache[key], path)
            continue
        sub = (cues[key][2], cues[key][3]) if key is not None else None
        render_layer(sub, title).save(path)
        cache[key] = path
    print(f"Rendered {len(cache)} unique subtitle layers over {n_frames} frames")
    return n_frames


# -------------------------------------------------------------------- ffmpeg

def probe(video_path: str) -> dict:
    cmd = ["ffprobe", "-v", "error", "-show_streams", "-show_format",
           "-of", "json", video_path]
    out = subprocess.run(cmd, check=True, capture_output=True, text=True).stdout
    return json.loads(out)


def build_filter(fps: int) -> str:
    return (
        f"[0:v]fps={fps},split=2[bg][fg];"
        f"[bg]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
        f"boxblur=luma_radius=24:luma_power=2:chroma_radius=12:chroma_power=1,"
        f"eq=brightness=-0.12:saturation=0.85[bgblur];"
        f"[fg]scale={W}:-2[fgv];"
        f"[bgblur][fgv]overlay=(W-w)/2:(H-h)/2[stage];"
        f"[stage][1:v]overlay=0:0:eof_action=repeat:format=auto,format=yuv420p[vout]"
    )


def encode(video_path: str, temp_dir: str, start: float, duration: float,
           output_path: str, sub_fps: int, fps: int, codec: str, has_audio: bool):
    cmd = [
        "ffmpeg", "-y",
        "-ss", f"{start:.3f}", "-t", f"{duration:.3f}", "-i", video_path,
        "-framerate", str(sub_fps), "-start_number", "0",
        "-c:v", "png", "-i", os.path.join(temp_dir, "sub_%05d.png"),
        "-filter_complex", build_filter(fps),
        "-map", "[vout]",
    ]
    if has_audio:
        cmd += ["-map", "0:a:0", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    else:
        cmd += ["-an"]

    if codec == "libx264":
        cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "20", "-profile:v", "high"]
    else:
        cmd += ["-c:v", "h264_videotoolbox", "-b:v", "8M", "-allow_sw", "1"]

    cmd += ["-r", str(fps), "-pix_fmt", "yuv420p", "-t", f"{duration:.3f}",
            "-movflags", "+faststart", output_path]
    print("Encoding short...")
    subprocess.run(cmd, check=True)


# ---------------------------------------------------------------------- main

def make_short(video_path: str, srt_path: str, start: float, end: float, lang: str,
               output_path: str, title: str = None, font_override: str = None,
               font_index: int = 0, sub_size: int = 72, title_size: int = 82,
               sub_fps: int = 10, fps: int = 30, codec: str = "libx264",
               keep_temp: bool = False):
    info = probe(video_path)
    source_duration = float(info["format"]["duration"])
    has_audio = any(s["codec_type"] == "audio" for s in info["streams"])

    if end is None or end > source_duration:
        end = source_duration
    if end <= start:
        raise SystemExit(f"--end ({end}) must be greater than --start ({start})")
    duration = end - start
    if duration > 180:
        print(f"WARNING: {duration:.1f}s exceeds the 180s YouTube Shorts limit", file=sys.stderr)

    cues = clip_cues(parse_srt(srt_path), start, end)
    if not cues:
        print(f"WARNING: no subtitle cues between {start:.1f}s and {end:.1f}s", file=sys.stderr)

    max_width = W - 2 * MARGIN
    all_text = "".join(text for _, _, text in cues) + (title or "")
    face = Face(*pick_face(lang, all_text, font_override, font_index))

    laid_out = [(s, e) + fit(text, face, sub_size, max_width, lang, MAX_SUB_LINES)
                for s, e, text in cues]
    title_block = fit(title, face, title_size, max_width, lang, MAX_TITLE_LINES) if title else None

    temp_dir = tempfile.mkdtemp(prefix="short_", dir=os.path.dirname(os.path.abspath(output_path)))
    try:
        render_sequence(laid_out, duration, sub_fps, title_block, temp_dir)
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        encode(video_path, temp_dir, start, duration, output_path,
               sub_fps, fps, codec, has_audio)
    finally:
        if keep_temp:
            print(f"Temp frames kept in {temp_dir}")
        else:
            shutil.rmtree(temp_dir, ignore_errors=True)

    result = probe(output_path)
    stream = next(s for s in result["streams"] if s["codec_type"] == "video")
    print(f"Done: {output_path} "
          f"({stream['width']}x{stream['height']}, {float(result['format']['duration']):.2f}s)")


def main():
    parser = argparse.ArgumentParser(
        description="Render a vertical 1080x1920 Short from a finished landscape video + SRT")
    parser.add_argument("--video", required=True, help="Finished 16:9 mp4")
    parser.add_argument("--srt", required=True, help="SRT for that video")
    parser.add_argument("--start", default="0", help="Segment start (SS.s or MM:SS)")
    parser.add_argument("--end", default=None, help="Segment end (SS.s or MM:SS)")
    parser.add_argument("--lang", default="en", choices=["ru", "zh", "en"])
    parser.add_argument("--out", required=True, help="Output mp4")
    parser.add_argument("--title", default=None, help="Hook line pinned at the top")
    parser.add_argument("--font", default=None, help="Override font file")
    parser.add_argument("--font-index", type=int, default=0, help="Face index inside a .ttc")
    parser.add_argument("--sub-size", type=int, default=72, help="Subtitle font size in px")
    parser.add_argument("--title-size", type=int, default=82, help="Title font size in px")
    parser.add_argument("--sub-fps", type=int, default=10,
                        help="Frame rate of the subtitle PNG sequence")
    parser.add_argument("--fps", type=int, default=30, help="Output frame rate")
    parser.add_argument("--codec", default="libx264",
                        choices=["libx264", "h264_videotoolbox"],
                        help="libx264=best quality (default), h264_videotoolbox=fast hardware")
    parser.add_argument("--keep-temp", action="store_true", help="Keep the subtitle PNGs")
    args = parser.parse_args()

    make_short(
        args.video, args.srt,
        parse_timestamp(args.start),
        parse_timestamp(args.end) if args.end is not None else None,
        args.lang, args.out, title=args.title, font_override=args.font,
        font_index=args.font_index, sub_size=args.sub_size, title_size=args.title_size,
        sub_fps=args.sub_fps, fps=args.fps, codec=args.codec, keep_temp=args.keep_temp,
    )


if __name__ == "__main__":
    main()
