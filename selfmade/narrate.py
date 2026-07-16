"""Synthesize narration with edge-tts and recover per-word timings.

The word timings are the reason this stage exists: they let text land on the
word it belongs to, and they set each scene's exact duration.
"""

import asyncio
import json
import subprocess
from pathlib import Path

import edge_tts

TICKS_PER_SECOND = 10_000_000  # edge-tts reports offsets in 100ns ticks


async def _stream(text, voice, out_mp3):
    communicate = edge_tts.Communicate(text, voice, boundary="WordBoundary")
    words = []
    with open(out_mp3, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / TICKS_PER_SECOND
                words.append({
                    "word": chunk["text"],
                    "start": start,
                    "end": start + chunk["duration"] / TICKS_PER_SECOND,
                })
    return words


def synthesize(text, voice, out_mp3):
    """Write narration audio and return [{word, start, end}] in seconds."""
    out_mp3 = Path(out_mp3)
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    return asyncio.run(_stream(text, voice, out_mp3))


def probe_duration(path):
    """Exact audio duration in seconds, measured rather than guessed."""
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def narrate_script(script, out_dir):
    """Narrate every scene. Returns {scene_id: {duration, words}}."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    timings = {}
    for scene in script["scenes"]:
        mp3 = out_dir / f"{scene['id']}.mp3"
        words = synthesize(scene["narration"], script["voice"], mp3)
        timings[scene["id"]] = {"duration": probe_duration(mp3), "words": words}
        print(f"  {scene['id']}: {timings[scene['id']]['duration']:.2f}s, {len(words)} words")

    (out_dir / "timings.json").write_text(json.dumps(timings, indent=2))
    return timings
