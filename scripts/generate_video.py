#!/usr/bin/env python3
"""Generate MP4 from audio + slide images + timeline using ffmpeg."""
import argparse
import json
import os
import subprocess
import tempfile
from typing import List, Optional, Tuple


def _build_segments(timeline: list, slides_dir: str,
                    cover_path: Optional[str] = None,
                    cover_duration: float = 0.0) -> List[Tuple[str, float]]:
    """Resolve timeline rows into image/duration pairs.

    A cover replaces the beginning of the first timeline segment. It never
    extends the runtime or shifts audio/subtitles.
    """
    if not timeline:
        raise ValueError("Empty timeline")
    if cover_duration < 0:
        raise ValueError("Cover duration cannot be negative")
    if cover_path and cover_duration <= 0:
        raise ValueError("Cover duration must be positive when a cover is set")
    if cover_duration and not cover_path:
        raise ValueError("Cover path is required when cover duration is set")

    timeline_end = float(timeline[-1]["end"])
    if cover_path:
        if not os.path.exists(cover_path):
            raise FileNotFoundError(f"Missing cover image: {cover_path}")
        if cover_duration >= timeline_end:
            raise ValueError("Cover duration must be shorter than the timeline")

    segments: List[Tuple[str, float]] = []
    if cover_path:
        segments.append((os.path.abspath(cover_path), cover_duration))

    for item in timeline:
        slide_idx = item["slide"] + 1
        img = os.path.join(slides_dir, f"slide_{slide_idx:03d}.png")
        if not os.path.exists(img):
            raise FileNotFoundError(f"Missing slide image: {img}")
        start = max(float(item["start"]), cover_duration if cover_path else 0.0)
        end = float(item["end"])
        duration = end - start
        if duration > 0:
            segments.append((os.path.abspath(img), duration))

    if not segments:
        raise ValueError("Timeline produced no positive-duration segments")
    return segments


def _concat_quote(path: str) -> str:
    return path.replace("'", "'\\''")


def generate(timeline_path: str, slides_dir: str, audio_path: str, output_path: str,
             fps: int = 30, scale_width: int = 1920, scale_height: int = 1080,
             codec: str = "libx264", cover_path: Optional[str] = None,
             cover_duration: float = 0.0):
    with open(timeline_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    timeline = data["timeline"]

    segments = _build_segments(
        timeline, slides_dir, cover_path=cover_path,
        cover_duration=cover_duration,
    )
    total_duration = sum(duration for _, duration in segments)
    concat_lines = []
    for img, duration in segments:
        concat_lines.append(f"file '{_concat_quote(img)}'")
        concat_lines.append(f"duration {duration:.6f}")
    concat_lines.append(f"file '{_concat_quote(segments[-1][0])}'")

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write("\n".join(concat_lines))
        concat_file = f.name

    try:
        silent_video = output_path + ".silent.mp4"
        vf = (
            f"fps={fps},scale={scale_width}:{scale_height}:"
            "force_original_aspect_ratio=decrease,"
            f"pad={scale_width}:{scale_height}:(ow-iw)/2:(oh-ih)/2:color=black,"
            "format=yuv420p"
        )

        if codec == "libx264":
            # Best compression/quality ratio for slides; CPU-bound
            cmd1 = [
                "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file,
                "-vf", vf,
                "-c:v", "libx264", "-preset", "medium", "-crf", "23",
                "-t", f"{total_duration:.6f}",
                "-movflags", "+faststart",
                "-an", silent_video,
            ]
        elif codec == "h264_videotoolbox":
            # Fast hardware H.264; larger files than libx264 CRF
            cmd1 = [
                "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file,
                "-vf", vf,
                "-c:v", "h264_videotoolbox", "-q:v", "65", "-allow_sw", "1",
                "-t", f"{total_duration:.6f}",
                "-movflags", "+faststart",
                "-an", silent_video,
            ]
        elif codec == "hevc_videotoolbox":
            # Fast hardware HEVC; smaller than h264_videotoolbox, accepted by YouTube
            cmd1 = [
                "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file,
                "-vf", vf,
                "-c:v", "hevc_videotoolbox", "-q:v", "65", "-allow_sw", "1",
                "-tag:v", "hvc1",  # required for macOS/Apple playback compatibility
                "-t", f"{total_duration:.6f}",
                "-movflags", "+faststart",
                "-an", silent_video,
            ]
        else:
            raise ValueError(f"Unknown codec: {codec}")

        print(f"Building silent video with {codec}...")
        subprocess.run(cmd1, check=True)

        cmd2 = [
            "ffmpeg", "-y", "-i", silent_video, "-i", audio_path,
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart",
            "-shortest", output_path,
        ]
        print("Muxing audio...")
        subprocess.run(cmd2, check=True)
        print(f"Done: {output_path}")
    finally:
        os.unlink(concat_file)
        if os.path.exists(silent_video):
            os.unlink(silent_video)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--timeline", required=True)
    parser.add_argument("--slides-dir", required=True)
    parser.add_argument("--audio", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--fps", type=int, default=1)
    parser.add_argument("--scale-width", type=int, default=1920)
    parser.add_argument("--scale-height", type=int, default=1080)
    parser.add_argument(
        "--cover",
        help="Optional opening cover image. It replaces the start of the first slide.",
    )
    parser.add_argument(
        "--cover-duration", type=float, default=0.0,
        help="Seconds to show --cover without extending the timeline.",
    )
    parser.add_argument(
        "--codec", default="hevc_videotoolbox",
        choices=["libx264", "h264_videotoolbox", "hevc_videotoolbox"],
        help="Video codec. hevc_videotoolbox=fast hardware HEVC (default), h264_videotoolbox=fast hardware H.264, libx264=best compression but CPU-heavy"
    )
    args = parser.parse_args()
    generate(args.timeline, args.slides_dir, args.audio, args.output,
             fps=args.fps, scale_width=args.scale_width,
             scale_height=args.scale_height, codec=args.codec,
             cover_path=args.cover, cover_duration=args.cover_duration)


if __name__ == "__main__":
    main()
