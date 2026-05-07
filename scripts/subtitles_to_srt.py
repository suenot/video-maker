#!/usr/bin/env python3
"""Convert Whisper JSON subtitles to YouTube SRT format."""
import argparse
import json
import os


def format_time(seconds: float) -> str:
    """Format seconds as SRT time: HH:MM:SS,mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def convert(subtitles_path: str, output_path: str):
    with open(subtitles_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    segments = data.get("segments", [])
    lines = []
    idx = 1
    for seg in segments:
        text = seg.get("text", "").strip()
        if not text:
            continue
        start = format_time(seg["start"])
        end = format_time(seg["end"])
        lines.append(str(idx))
        lines.append(f"{start} --> {end}")
        lines.append(text)
        lines.append("")
        idx += 1

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"SRT saved to {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--subtitles", required=True, help="Whisper JSON subtitles")
    parser.add_argument("--output", required=True, help="Output .srt file")
    args = parser.parse_args()
    convert(args.subtitles, args.output)


if __name__ == "__main__":
    main()
