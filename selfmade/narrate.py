"""Synthesize narration with edge-tts and recover per-word timings.

The word timings are the reason this stage exists: they let text land on the
word it belongs to, and they set each scene's exact duration. A scene with no
word timings is a failed scene, not an empty one, so every failure mode below
(empty result, network stall, transient error) raises instead of returning a
silently-wrong `[]`.
"""

import asyncio
import json
import os
import subprocess
import time
from pathlib import Path

import edge_tts

TICKS_PER_SECOND = 10_000_000  # edge-tts reports offsets in 100ns ticks

# A scene's narration can run up to ~130s of audio; this must comfortably
# exceed real synthesis time without being so tight a slow-but-working scene
# fails.
SYNTHESIS_TIMEOUT_SECONDS = 180
MAX_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = 5  # multiplied by attempt number


async def _stream(text, voice, out_path):
    communicate = edge_tts.Communicate(text, voice, boundary="WordBoundary")
    words = []
    with open(out_path, "wb") as f:
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

    # edge-tts has emitted WordBoundary events in arrival order in practice,
    # but that's not a guarantee - sort explicitly and verify monotonicity so
    # a future out-of-order revision can't silently corrupt frame placement.
    words.sort(key=lambda w: w["start"])
    for prev, cur in zip(words, words[1:]):
        assert cur["start"] >= prev["start"], (
            f"word timings out of order after sort: {prev['word']!r}@{prev['start']} "
            f"then {cur['word']!r}@{cur['start']}"
        )

    if not words:
        # This exact failure happened for real: edge-tts 7.2.8 defaults to
        # boundary='SentenceBoundary', which emits zero WordBoundary events,
        # so synthesis "succeeds" with audio but no word timings at all.
        excerpt = text[:80] + ("..." if len(text) > 80 else "")
        raise RuntimeError(
            f"no WordBoundary events produced for voice {voice!r} "
            f"(text excerpt: {excerpt!r}); audio was written but has no word "
            f"timings, which downstream code needs for every frame count"
        )
    return words


async def _synthesize_once(text, voice, tmp_path, timeout):
    return await asyncio.wait_for(_stream(text, voice, tmp_path), timeout=timeout)


def synthesize(
    text,
    voice,
    out_mp3,
    timeout=SYNTHESIS_TIMEOUT_SECONDS,
    attempts=MAX_ATTEMPTS,
):
    """Write narration audio and return [{word, start, end}] in seconds.

    Streams to a temp file next to `out_mp3` and only moves it into place
    once a complete, non-empty result is obtained, so a stalled or aborted
    attempt never leaves a partial mp3 at the destination. Retries transient
    network errors, timeouts, and the empty-WordBoundary failure with
    backoff; raises on final failure.
    """
    out_mp3 = Path(out_mp3)
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = out_mp3.with_name(out_mp3.name + ".tmp")

    last_error = None
    for attempt in range(1, attempts + 1):
        try:
            words = asyncio.run(_synthesize_once(text, voice, tmp_path, timeout))
        except Exception as exc:  # network errors, timeouts, empty-result RuntimeError
            last_error = exc
            tmp_path.unlink(missing_ok=True)
            if attempt < attempts:
                time.sleep(RETRY_BACKOFF_SECONDS * attempt)
            continue

        os.replace(tmp_path, out_mp3)
        return words

    raise RuntimeError(
        f"synthesize failed after {attempts} attempts for voice {voice!r}: {last_error}"
    ) from last_error


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
