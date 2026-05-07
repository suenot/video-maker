#!/usr/bin/env python3
"""Generate MP4 from audio + slide images + timeline using ffmpeg."""
import argparse
import json
import os
import subprocess
import tempfile


def generate(timeline_path: str, slides_dir: str, audio_path: str, output_path: str,
             fps: int = 30, scale_width: int = 1920, codec: str = "libx264"):
    with open(timeline_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    timeline = data["timeline"]

    if not timeline:
        raise ValueError("Empty timeline")

    concat_lines = []
    for item in timeline:
        slide_idx = item["slide"] + 1
        img = os.path.join(slides_dir, f"slide_{slide_idx:03d}.png")
        if not os.path.exists(img):
            raise FileNotFoundError(f"Missing slide image: {img}")
        duration = item["end"] - item["start"]
        if duration <= 0:
            continue
        concat_lines.append(f"file '{os.path.abspath(img)}'")
        concat_lines.append(f"duration {duration:.6f}")

    last_img = os.path.join(slides_dir, f"slide_{timeline[-1]['slide'] + 1:03d}.png")
    concat_lines.append(f"file '{os.path.abspath(last_img)}'")

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write("\n".join(concat_lines))
        concat_file = f.name

    try:
        silent_video = output_path + ".silent.mp4"
        vf = f"fps={fps},format=yuv420p,scale={scale_width}:-2:force_original_aspect_ratio=decrease"

        if codec == "libx264":
            # Best compression/quality ratio for slides; CPU-bound
            cmd1 = [
                "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file,
                "-vf", vf + ",scale=trunc(iw/2)*2:trunc(ih/2)*2",
                "-c:v", "libx264", "-preset", "medium", "-crf", "23",
                "-movflags", "+faststart",
                "-an", silent_video,
            ]
        elif codec == "h264_videotoolbox":
            # Fast hardware H.264; larger files than libx264 CRF
            cmd1 = [
                "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file,
                "-vf", vf,
                "-c:v", "h264_videotoolbox", "-q:v", "65", "-allow_sw", "1",
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
    parser.add_argument(
        "--codec", default="hevc_videotoolbox",
        choices=["libx264", "h264_videotoolbox", "hevc_videotoolbox"],
        help="Video codec. hevc_videotoolbox=fast hardware HEVC (default), h264_videotoolbox=fast hardware H.264, libx264=best compression but CPU-heavy"
    )
    args = parser.parse_args()
    generate(args.timeline, args.slides_dir, args.audio, args.output,
             fps=args.fps, scale_width=args.scale_width, codec=args.codec)


if __name__ == "__main__":
    main()
