#!/usr/bin/env python3
"""Append a branded YouTube end screen to a finished video.

The card contains a clear social follow action and one recommendation for the
next video.  It is intentionally generated locally so every delivered MP4 has
the same closing experience, regardless of the source deck.
"""

import argparse
import math
import struct
import subprocess
import tempfile
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


W, H = 1920, 1080
SHORT_W, SHORT_H = 1080, 1920
SUPPORTED_CARD_SIZES = {(W, H), (SHORT_W, SHORT_H)}
BG = "#0C111B"
PANEL = "#151E2D"
ACCENT = "#62D9FF"
TEXT = "#F6F8FC"
MUTED = "#AAB7C8"
LEFT_VIDEO_ZONE = (96, 294, 736, 654)
RIGHT_VIDEO_ZONE = (1184, 294, 1824, 654)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"
    return ImageFont.truetype(path, size)


def centered(draw: ImageDraw.ImageDraw, text: str, y: int, face, fill: str):
    box = draw.textbbox((0, 0), text, font=face)
    draw.text(((W - (box[2] - box[0])) / 2, y), text, font=face, fill=fill)


def centered_wrapped(draw: ImageDraw.ImageDraw, text: str, y: int,
                     face, fill: str, max_width: int = 1420, spacing: int = 10):
    words, lines, line = text.split(), [], ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if draw.textlength(candidate, font=face) <= max_width or not line:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    block = "\n".join(lines)
    box = draw.multiline_textbbox((0, 0), block, font=face, spacing=spacing,
                                  align="center")
    draw.multiline_text(((W - (box[2] - box[0])) / 2, y), block, font=face,
                        fill=fill, spacing=spacing, align="center")


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
    centered_wrapped(draw, watch_next, 665, font(48, True), TEXT)
    centered(draw, "A practical next step, selected by suenot", 835, font(30), MUTED)
    image.save(path, "PNG", optimize=True)


def validate_card(path: Path) -> tuple[int, int]:
    if not path.is_file():
        raise FileNotFoundError(path)
    with Image.open(path) as image:
        size = image.size
    if size not in SUPPORTED_CARD_SIZES:
        supported = " or ".join(
            f"{width}x{height}"
            for width, height in sorted(SUPPORTED_CARD_SIZES)
        )
        raise ValueError(
            f"End card must be {supported}, got {size[0]}x{size[1]}"
        )
    return size


def write_music_bed(path: Path, duration: float, sample_rate: int = 48000) -> None:
    """Write a quiet original chord bed with no external samples."""
    if duration <= 0:
        raise ValueError("Music duration must be positive")
    chords = [
        (261.63, 329.63, 392.00, 493.88),  # Cmaj9
        (220.00, 261.63, 329.63, 392.00),  # Am7
        (174.61, 220.00, 261.63, 329.63),  # Fmaj7
        (196.00, 246.94, 293.66, 440.00),  # Gsus2
    ]
    frame_count = round(duration * sample_rate)
    segment = duration / len(chords)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(sample_rate)
        frames = bytearray()
        for index in range(frame_count):
            t = index / sample_rate
            chord_index = min(len(chords) - 1, int(t / segment))
            chord = chords[chord_index]
            local_t = t - chord_index * segment
            step = int(local_t * 2.0) % len(chord)
            step_phase = (local_t * 2.0) % 1.0
            pluck_env = math.exp(-4.2 * step_phase)
            fade_in = min(1.0, t / 0.7)
            fade_out = min(1.0, max(0.0, duration - t) / 2.0)
            envelope = fade_in * fade_out

            left_pad = sum(
                math.sin(2 * math.pi * frequency * t + voice_index * 0.17)
                for voice_index, frequency in enumerate(chord)
            ) / len(chord)
            right_pad = sum(
                math.sin(2 * math.pi * frequency * t - voice_index * 0.13)
                for voice_index, frequency in enumerate(chord)
            ) / len(chord)
            pluck = math.sin(2 * math.pi * chord[step] * 2 * t) * pluck_env
            left = envelope * (0.034 * left_pad + 0.012 * pluck * (0.8 if step % 2 else 1.0))
            right = envelope * (0.034 * right_pad + 0.012 * pluck * (1.0 if step % 2 else 0.8))
            left_i = max(-32767, min(32767, round(left * 32767)))
            right_i = max(-32767, min(32767, round(right * 32767)))
            frames.extend(struct.pack("<hh", left_i, right_i))
        output.writeframes(frames)


def run(cmd: list[str]):
    print(" ".join(cmd))
    subprocess.run(cmd, check=True)


def append(video: Path, output: Path, follow: str, socials: str,
           watch_next: str | None, duration: float,
           card_path: Path | None = None, music: str = "silent"):
    if not video.is_file():
        raise FileNotFoundError(video)
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="yt-endcard-") as temp:
        temp_dir = Path(temp)
        card = card_path or temp_dir / "endcard.png"
        clip = Path(temp) / "endcard.mp4"
        if card_path:
            output_width, output_height = validate_card(card)
        else:
            if not watch_next:
                raise ValueError("watch_next is required when card_path is not set")
            make_card(card, follow, socials, watch_next)
            output_width, output_height = W, H

        clip_cmd = ["ffmpeg", "-y", "-loop", "1", "-i", str(card)]
        if music == "generated":
            music_path = temp_dir / "music-bed.wav"
            write_music_bed(music_path, duration)
            clip_cmd.extend(["-i", str(music_path)])
        elif music == "silent":
            clip_cmd.extend(["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"])
        else:
            raise ValueError(f"Unknown music mode: {music}")
        clip_cmd.extend([
            "-t", str(duration), "-r", "30", "-c:v", "h264_videotoolbox",
            "-allow_sw", "1", "-q:v", "68", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
            str(clip),
        ])
        run(clip_cmd)
        run([
            "ffmpeg", "-y", "-i", str(video), "-i", str(clip),
            "-filter_complex", (
                f"[0:v]scale={output_width}:{output_height}:"
                "force_original_aspect_ratio=decrease,"
                f"pad={output_width}:{output_height}:(ow-iw)/2:(oh-ih)/2,"
                "setsar=1[v0];"
                "[1:v]setsar=1[v1];"
                "[0:a]aresample=48000,aformat=channel_layouts=stereo[a0];"
                "[1:a]aresample=48000,aformat=channel_layouts=stereo[a1];"
                "[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]"
            ),
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
    parser.add_argument("--watch-next")
    parser.add_argument("--card", type=Path,
                        help="Pre-rendered 1920x1080 or 1080x1920 end-screen card")
    parser.add_argument("--music", choices=["silent", "generated"], default="silent")
    parser.add_argument("--duration", type=float, default=10.0)
    args = parser.parse_args()
    if not args.card and not args.watch_next:
        parser.error("--watch-next is required unless --card is supplied")
    append(Path(args.video), Path(args.output), args.follow, args.socials,
           args.watch_next, args.duration, args.card, args.music)


if __name__ == "__main__":
    main()
