#!/usr/bin/env python3
"""Create deterministic, readable thumbnail variants over a generated background."""

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


W, H = 1280, 720


def face(size: int, bold: bool = True):
    path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"
    return ImageFont.truetype(path, size)


def wrap(draw, text, font_obj, limit):
    words, lines, current = text.split(), [], ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textlength(candidate, font=font_obj) <= limit or not current:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def render(background: Path, output: Path, headline: str, subhead: str):
    base = Image.open(background).convert("RGB")
    base = ImageOps.fit(base, (W, H), method=Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.rounded_rectangle((38, 36, 735, 684), radius=30, fill=(5, 10, 20, 220))
    draw.rounded_rectangle((76, 80, 248, 92), radius=6, fill=(96, 217, 255, 255))
    draw.text((76, 122), "SUENOT / AI SYSTEMS", font=face(23), fill="#9BAFC5")
    headline_font = face(75)
    lines = wrap(draw, headline.upper(), headline_font, 590)
    y = 198
    for line in lines:
        draw.text((76, y), line, font=headline_font, fill="white", stroke_width=1,
                  stroke_fill="#08101B")
        y += 86
    draw.text((76, min(y + 16, 560)), subhead, font=face(29, False), fill="#C7D6E8")
    draw.text((76, 624), "@suenot", font=face(28), fill="#62D9FF")
    Image.alpha_composite(base.convert("RGBA"), layer).convert("RGB").save(output, "PNG", optimize=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--background", required=True)
    parser.add_argument("--variants", required=True, help="JSON list of {headline, subhead}")
    parser.add_argument("--out-dir", required=True)
    args = parser.parse_args()
    variants = json.loads(Path(args.variants).read_text(encoding="utf-8"))
    if isinstance(variants, dict):
        variants = variants.get("thumbnail_variants", [])
    if len(variants) != 3:
        raise ValueError("exactly three variants are required")
    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for index, variant in enumerate(variants, start=1):
        render(Path(args.background), out / f"thumbnail_ab_{index}.png",
               variant["headline"], variant["subhead"])


if __name__ == "__main__":
    main()
