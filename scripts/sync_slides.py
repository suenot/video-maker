#!/usr/bin/env python3
"""Build timeline mapping audio timestamps to slide images.

Rules:
- Slides never repeat (monotonically non-decreasing index).
- First slide is always slide 0 (first page of PDF).
- Advance to next slide only when next slide scores clearly higher
  and current slide has been shown for at least min_duration.
"""
import argparse
import json
import re


def normalize(text: str) -> set:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return set(text.split())


def ngrams(words: list, n: int = 2) -> set:
    return set(" ".join(words[i:i + n]) for i in range(len(words) - n + 1))


def score_slide(text: str, slide_words: set, slide_bigrams: set) -> float:
    words = text.lower()
    words = re.sub(r"[^\w\s]", " ", words).split()
    if not words:
        return 0.0
    wset = set(words)
    bg = ngrams(words, 2)
    return len(wset & slide_words) + len(bg & slide_bigrams) * 2.0


def build_timeline(subtitles: dict, slides: list, min_duration: float = 5.0,
                   advance_ratio: float = 1.3, look_ahead: int = 3):
    segments = subtitles.get("segments", [])
    slide_words = [normalize(s["text"]) for s in slides]
    slide_bigrams = [ngrams(list(normalize(s["text"]))) for s in slides]
    segments = sorted(segments, key=lambda x: x["start"])

    timeline = []
    current_slide = 0
    current_slide_start = 0.0

    for seg in segments:
        t0, t1 = seg["start"], seg["end"]
        txt = seg.get("text", "")

        # compute scores for current and upcoming slides
        scores = {}
        for idx in range(current_slide, min(len(slides), current_slide + look_ahead + 1)):
            scores[idx] = score_slide(txt, slide_words[idx], slide_bigrams[idx])

        best = current_slide
        best_score = scores.get(current_slide, 0.0)

        # consider advancing only if min_duration met
        time_on_current = t0 - current_slide_start
        if time_on_current >= min_duration:
            for idx in range(current_slide + 1, min(len(slides), current_slide + look_ahead + 1)):
                sc = scores.get(idx, 0.0)
                # advance if next slide is clearly better
                if sc > best_score * advance_ratio and sc > best_score + 1.0:
                    best = idx
                    best_score = sc

        if best != current_slide:
            # close previous slide segment
            timeline.append({"start": current_slide_start, "end": t0, "slide": current_slide})
            current_slide = best
            current_slide_start = t0

    # close final slide
    if segments:
        timeline.append({"start": current_slide_start, "end": segments[-1]["end"], "slide": current_slide})

    # Ensure full audio coverage
    if timeline:
        timeline[-1]["end"] = max(timeline[-1]["end"], segments[-1]["end"])

    return timeline



def even_timeline(slides, total):
    """PURE: give every slide an equal share of `total` seconds."""
    n = len(slides)
    step = total / n if n else total
    return [{"slide": i, "start": round(i * step, 3),
             "end": round(total if i == n - 1 else (i + 1) * step, 3)}
            for i in range(n)]


def manual_timeline(slide_starts, slide_count, total):
    """PURE: build a complete timeline from one start time per slide."""
    if len(slide_starts) != slide_count:
        raise ValueError(
            f"Expected {slide_count} slide start times, got {len(slide_starts)}"
        )
    if not slide_starts:
        raise ValueError("At least one slide start time is required")
    if total <= 0:
        raise ValueError("Subtitle duration must be positive")

    starts = [float(start) for start in slide_starts]
    if starts[0] != 0.0:
        raise ValueError("The first slide must start at 0 seconds")
    if any(right <= left for left, right in zip(starts, starts[1:])):
        raise ValueError("Slide start times must be strictly increasing")
    if starts[-1] >= total:
        raise ValueError("The final slide must start before the subtitles end")

    return [
        {
            "slide": index,
            "start": start,
            "end": starts[index + 1] if index + 1 < slide_count else total,
        }
        for index, start in enumerate(starts)
    ]


def subtitle_duration(subtitles):
    """PURE: return the final subtitle timestamp."""
    return max(
        (float(segment["end"]) for segment in subtitles.get("segments", [])),
        default=0.0,
    )


def timeline_quality(timeline, slides):
    """PURE: (fraction of slides shown, share held by the longest segment)."""
    if not timeline:
        return 0.0, 1.0
    total = max(seg["end"] for seg in timeline)
    if total <= 0:
        return 0.0, 1.0
    longest = max(seg["end"] - seg["start"] for seg in timeline)
    return len(timeline) / max(1, len(slides)), longest / total


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--subtitles", required=True)
    parser.add_argument("--slides-text", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--min-duration", type=float, default=5.0,
                        help="Minimum seconds to show a slide before advancing")
    parser.add_argument("--advance-ratio", type=float, default=1.3,
                        help="Score ratio required to advance to next slide")
    parser.add_argument("--look-ahead", type=int, default=3,
                        help="How many upcoming slides to evaluate")
    parser.add_argument(
        "--slide-starts",
        help="JSON array with one start time per slide; bypasses OCR matching",
    )
    parser.add_argument("--min-coverage", type=float, default=0.7,
                        help="Fraction of slides that must appear before the "
                             "matched timeline is trusted")
    parser.add_argument("--max-share", type=float, default=0.35,
                        help="Longest a single slide may hold the screen, as a "
                             "fraction of the runtime")
    args = parser.parse_args()

    with open(args.subtitles, "r", encoding="utf-8") as f:
        subs = json.load(f)
    with open(args.slides_text, "r", encoding="utf-8") as f:
        slides_data = json.load(f)
    slides = slides_data["pages"]

    if args.slide_starts:
        with open(args.slide_starts, "r", encoding="utf-8") as f:
            starts = json.load(f)
        timeline = manual_timeline(
            starts, len(slides), subtitle_duration(subs)
        )
    else:
        timeline = build_timeline(subs, slides,
                                  min_duration=args.min_duration,
                                  advance_ratio=args.advance_ratio,
                                  look_ahead=args.look_ahead)

        # Matching narration to slide text degenerates whenever the deck says more
        # than the narration does — a Brief audio over a ten-slide deck leaves one
        # slide parked on screen for most of the run. An even split is not clever,
        # but a viewer cannot tell it from intent, and a frozen slide they can.
        coverage, worst = timeline_quality(timeline, slides)
        if coverage < args.min_coverage or worst > args.max_share:
            total = max((seg["end"] for seg in timeline), default=0.0)
            if not total:
                total = subtitle_duration(subs)
            print(f"sync degenerated (showed {len(timeline)}/{len(slides)} slides, "
                  f"longest held {worst:.0%}); falling back to an even split")
            timeline = even_timeline(slides, total)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump({"timeline": timeline, "slide_count": len(slides)}, f, ensure_ascii=False, indent=2)
    print(f"Timeline saved to {args.output} ({len(timeline)} segments)")


if __name__ == "__main__":
    main()
