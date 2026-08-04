#!/usr/bin/env python3
"""Append a branded YouTube end screen to a finished video.

The card contains a clear social follow action and one recommendation for the
next video.  It is intentionally generated locally so every delivered MP4 has
the same closing experience, regardless of the source deck.
"""

import argparse
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


W, H = 1920, 1080
BG = "#0C111B"
PANEL = "#151E2D"
ACCENT = "#62D9FF"
TEXT = "#F6F8FC"
MUTED = "#AAB7C8"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"
    return ImageFont.truetype(path, size)


def centered(draw: ImageDraw.ImageDraw, text: str, y: int, face, fill: str):
    box = draw.textbbox((0, 0), text, font=face)
    draw.text(((W - (box[2] - box[0])) / 2, y), text, font=face, fill=fill)


def make_card(path: Path, follow: str, socials: str, watch_next: str):
    image = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((120, 96, W - 120, H - 96), radius=42, fill=PANEL)
    draw.rounded_rectangle((760, 184, 1160, 192), radius=4, fill=ACCENT)
    centered(draw, "FOLLOW FOR MORE", 238, font(38, True), ACCENT)
    centered(draw, follow, 302, font(78, True), TEXT)
    centered(draw, socials, 412, font(31), MUTED)
    draw.line((260, 542, W - 260, 542), fill="#31435D", width=2)
    centered(draw, "WATCH NEXT", 614, font(34, True), ACCENT)
    centered(draw, watch_next, 680, font(54, True), TEXT)
    centered(draw, "A practical next step, selected by suenot", 765, font(30), MUTED)
    image.save(path, "PNG", optimize=True)


def run(cmd: list[str]):
    print(" ".join(cmd))
    subprocess.run(cmd, check=True)


def append(video: Path, output: Path, follow: str, socials: str,
           watch_next: str, duration: float):
    if not video.is_file():
        raise FileNotFoundError(video)
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="yt-endcard-") as temp:
        card = Path(temp) / "endcard.png"
        clip = Path(temp) / "endcard.mp4"
        make_card(card, follow, socials, watch_next)
        run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(card),
            "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
            "-t", str(duration), "-r", "30", "-c:v", "h264_videotoolbox",
            "-allow_sw", "1", "-q:v", "68", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
            str(clip),
        ])
        run([
            "ffmpeg", "-y", "-i", str(video), "-i", str(clip),
            "-filter_complex", "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]",
            "-map", "[v]", "-map", "[a]", "-c:v", "h264_videotoolbox",
            "-allow_sw", "1", "-q:v", "68", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
            str(output),
        ])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--follow", default="@suenot")
    parser.add_argument(
        "--socials",
        default="X @suenot  |  Telegram @suenot_dev  |  Discord",
    )
    parser.add_argument("--watch-next", required=True)
    parser.add_argument("--duration", type=float, default=10.0)
    args = parser.parse_args()
    append(Path(args.video), Path(args.output), args.follow, args.socials,
           args.watch_next, args.duration)


if __name__ == "__main__":
    main()
