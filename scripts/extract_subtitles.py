#!/usr/bin/env python3
"""Transcribe audio with Whisper and output JSON with word-level timings."""
import argparse
import json
import os
import whisper


def transcribe(audio_path: str, model_size: str = "base", language: str = None) -> dict:
    model = whisper.load_model(model_size)
    result = model.transcribe(audio_path, language=language, word_timestamps=True)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--model", default="base")
    parser.add_argument("--language", default=None, help="e.g. ru, en")
    args = parser.parse_args()

    print(f"Loading Whisper model {args.model}...")
    result = transcribe(args.audio, model_size=args.model, language=args.language)

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"Saved subtitles to {args.output}")


if __name__ == "__main__":
    main()
