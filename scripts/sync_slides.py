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
    args = parser.parse_args()

    with open(args.subtitles, "r", encoding="utf-8") as f:
        subs = json.load(f)
    with open(args.slides_text, "r", encoding="utf-8") as f:
        slides_data = json.load(f)
    slides = slides_data["pages"]

    timeline = build_timeline(subs, slides,
                               min_duration=args.min_duration,
                               advance_ratio=args.advance_ratio,
                               look_ahead=args.look_ahead)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump({"timeline": timeline, "slide_count": len(slides)}, f, ensure_ascii=False, indent=2)
    print(f"Timeline saved to {args.output} ({len(timeline)} segments)")


if __name__ == "__main__":
    main()
