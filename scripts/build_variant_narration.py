#!/usr/bin/env python3
"""Synthesize a manifest-backed narration, exact timeline, and punctuated SRT."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from selfmade import narrate  # noqa: E402


TOKEN_RE = re.compile(r"[\w]+(?:[.,][\w]+)*", flags=re.UNICODE)


def caption_chunks(text: str, max_words: int = 11) -> list[str]:
    """Split exact source copy into readable cues without losing punctuation."""
    clauses = re.split(r"(?<=[.!?;,])\s+", text.strip())
    chunks: list[str] = []
    current = ""
    for clause in clauses:
        words = clause.split()
        if len(words) > max_words:
            if current:
                chunks.append(current)
                current = ""
            part_count = (len(words) + max_words - 1) // max_words
            part_size = (len(words) + part_count - 1) // part_count
            parts = [
                " ".join(words[index:index + part_size])
                for index in range(0, len(words), part_size)
            ]
            chunks.extend(parts[:-1])
            words = parts[-1].split()
        clause = " ".join(words)
        if not clause:
            continue
        candidate = f"{current} {clause}".strip()
        if current and len(candidate.split()) > max_words:
            chunks.append(current)
            current = clause
        else:
            current = candidate
    if current:
        chunks.append(current)
    balanced: list[str] = []
    index = 0
    while index < len(chunks):
        chunk = chunks[index]
        word_count = len(chunk.split())
        if word_count < 4 and index + 1 < len(chunks):
            following = chunks[index + 1]
            if word_count + len(following.split()) <= max_words + 3:
                balanced.append(f"{chunk} {following}")
                index += 2
                continue
        if word_count < 4 and balanced:
            if len(balanced[-1].split()) + word_count <= max_words + 3:
                balanced[-1] = f"{balanced[-1]} {chunk}"
                index += 1
                continue
        balanced.append(chunk)
        index += 1
    return balanced


def build_timeline(durations: list[float], total_duration: float | None = None) -> list[dict]:
    if not durations or any(duration <= 0 for duration in durations):
        raise ValueError("Scene durations must be positive")
    measured_total = sum(durations)
    target_total = total_duration if total_duration is not None else measured_total
    if target_total <= 0:
        raise ValueError("Total duration must be positive")
    scale = target_total / measured_total
    cursor = 0.0
    timeline = []
    for index, duration in enumerate(durations):
        end = target_total if index == len(durations) - 1 else cursor + duration * scale
        timeline.append({"slide": index, "start": round(cursor, 6), "end": round(end, 6)})
        cursor = end
    return timeline


def _timestamp(seconds: float) -> str:
    millis = max(0, round(seconds * 1000))
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def cues_for_scene(text: str, words: list[dict], start: float,
                   source_duration: float, target_duration: float) -> list[dict]:
    chunks = caption_chunks(text)
    if not chunks:
        return []
    if not words:
        raise ValueError("Word timings are required for every narrated scene")

    weights = [max(1, len(TOKEN_RE.findall(chunk))) for chunk in chunks]
    total_weight = sum(weights)
    source_scale = target_duration / source_duration
    boundaries = [0]
    cumulative = 0
    for weight in weights[:-1]:
        cumulative += weight
        boundaries.append(round(cumulative / total_weight * len(words)))
    boundaries.append(len(words))

    cues = []
    for index, chunk in enumerate(chunks):
        left = min(boundaries[index], len(words) - 1)
        right = max(left + 1, min(boundaries[index + 1], len(words)))
        cue_start = start + float(words[left]["start"]) * source_scale
        cue_end = start + float(words[right - 1]["end"]) * source_scale
        if index + 1 < len(chunks):
            next_left = min(boundaries[index + 1], len(words) - 1)
            next_start = start + float(words[next_left]["start"]) * source_scale
            cue_end = min(cue_end, max(cue_start + 0.2, next_start - 0.04))
        else:
            cue_end = min(start + target_duration, max(cue_end, cue_start + 0.4))
        cues.append({"start": cue_start, "end": cue_end, "text": chunk})
    return cues


def render_srt(scenes: list[dict], timings: list[dict], timeline: list[dict]) -> str:
    cues = []
    for scene, timing, row in zip(scenes, timings, timeline):
        cues.extend(cues_for_scene(
            scene["narration"], timing["words"], float(row["start"]),
            float(timing["duration"]), float(row["end"]) - float(row["start"]),
        ))
    blocks = []
    for index, cue in enumerate(cues, start=1):
        blocks.append(
            f"{index}\n{_timestamp(cue['start'])} --> {_timestamp(cue['end'])}\n{cue['text']}"
        )
    return "\n\n".join(blocks) + "\n"


def _concat_quote(path: Path) -> str:
    return str(path.resolve()).replace("'", "'\\''")


def synthesize_variant(manifest_path: Path, style: str, build_root: Path,
                       audio_output: Path, srt_output: Path,
                       voice_override: str | None = None) -> None:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    style_spec = manifest["styles"][style]
    scenes = style_spec["scenes"]
    voice = voice_override or style_spec["voice"]
    rate = style_spec.get("rate", "+0%")
    work_dir = build_root / style / "narration"
    work_dir.mkdir(parents=True, exist_ok=True)

    timing_rows = []
    audio_parts = []
    for index, scene in enumerate(scenes, start=1):
        part = work_dir / f"{index:02d}-{scene['id']}.mp3"
        words = narrate.synthesize(scene["narration"], voice, part, rate=rate)
        duration = narrate.probe_duration(part)
        timing_rows.append({"duration": duration, "words": words})
        audio_parts.append(part)
        print(f"  {scene['id']}: {duration:.2f}s, {len(words)} word boundaries")

    audio_output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as concat_file:
        for part in audio_parts:
            concat_file.write(f"file '{_concat_quote(part)}'\n")
        concat_path = Path(concat_file.name)
    try:
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_path),
            "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart", str(audio_output),
        ], check=True)
    finally:
        concat_path.unlink(missing_ok=True)

    total_duration = narrate.probe_duration(audio_output)
    timeline = build_timeline(
        [float(row["duration"]) for row in timing_rows], total_duration,
    )
    style_dir = build_root / style
    (style_dir / "timeline.json").write_text(
        json.dumps({"timeline": timeline, "slide_count": len(timeline)}, indent=2) + "\n",
        encoding="utf-8",
    )
    (work_dir / "timings.json").write_text(
        json.dumps(timing_rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    srt_output.parent.mkdir(parents=True, exist_ok=True)
    srt_output.write_text(render_srt(scenes, timing_rows, timeline), encoding="utf-8")
    print(f"Narration: {audio_output} ({total_duration:.2f}s)")
    print(f"Timeline: {style_dir / 'timeline.json'}")
    print(f"Subtitles: {srt_output}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--style", required=True)
    parser.add_argument("--build-root", type=Path, required=True)
    parser.add_argument("--audio-output", type=Path, required=True)
    parser.add_argument("--srt-output", type=Path, required=True)
    parser.add_argument("--voice")
    args = parser.parse_args()
    synthesize_variant(
        args.manifest, args.style, args.build_root, args.audio_output,
        args.srt_output, args.voice,
    )


if __name__ == "__main__":
    main()
