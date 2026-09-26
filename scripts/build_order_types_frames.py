#!/usr/bin/env python3
"""Render the order-types storyboard from its narration manifest.

Usage: video_maker/.venv/bin/python video_maker/scripts/build_order_types_frames.py
The output is deterministic and uses only Pillow vector drawing and local fonts.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "storyboards/algotrading-order-types/narration-manifest.json"
OUT = ROOT / "output/algotrading-order-types"
FONT_CHOICES = (
    (Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
     Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")),
    (Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
     Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")),
)
try:
    FONT, BOLD = next((regular, bold) for regular, bold in FONT_CHOICES
                      if regular.is_file() and bold.is_file())
except StopIteration as exc:
    raise RuntimeError("Arial or DejaVu Sans fonts are required to render order-type frames") from exc

NAVY = "#082744"
BLUE = "#123F67"
MID = "#2672A1"
LIGHT = "#CDE9F5"
CREAM = "#FBF6E9"
WHITE = "#FFFDF7"
AMBER = "#FFCF79"
GREEN = "#6CD2AC"
RED = "#F5A69B"


def font(size: int, bold: bool = False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)


def fitted(draw, text, max_width, start, minimum=22, bold=False):
    for size in range(start, minimum - 1, -1):
        f = font(size, bold)
        if draw.textbbox((0, 0), text, font=f)[2] <= max_width:
            return f
    return font(minimum, bold)


def txt(draw, xy, value, size, fill=WHITE, width=None, bold=False, anchor=None):
    f = fitted(draw, value, width, size, bold=bold) if width else font(size, bold)
    draw.text(xy, value, font=f, fill=fill, anchor=anchor)


def rr(draw, box, fill, radius=28, outline=None, width=3):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def base(size, vertical):
    image = Image.new("RGB", size, NAVY)
    draw = ImageDraw.Draw(image)
    w, h = size
    # Quiet linear technical grid. It is deliberately faint behind the diagrams.
    step = 120 if vertical else 144
    for x in range(0, w, step):
        draw.line((x, 0, x, h), fill="#103551", width=1)
    for y in range(0, h, step):
        draw.line((0, y, w, y), fill="#103551", width=1)
    draw.rectangle((0, 0, 18 if vertical else 22, h), fill=MID)
    return image, draw


def text_header(draw, scene, vertical):
    v = scene["visible"]
    x = 80 if vertical else 120
    width = 770 if vertical else 1590
    y = 190 if vertical else 91
    txt(draw, (x, y), v["headline"], 61 if vertical else 76, CREAM, width, True)
    txt(draw, (x, y + (100 if vertical else 103)), v["subhead"],
        37 if vertical else 40, LIGHT, width)
    line_y = y + (173 if vertical else 171)
    draw.line((x, line_y, x + width, line_y), fill=MID, width=4)


def geometry(vertical):
    if vertical:
        return 80, 475, 770, 895
    return 120, 350, 1680, 615


def panel(draw, box, color=BLUE):
    rr(draw, box, color, 26, MID, 3)


def pill(draw, box, label, color, vertical, text_color=NAVY):
    rr(draw, box, color, 24)
    txt(draw, ((box[0] + box[2]) // 2, (box[1] + box[3]) // 2), label,
        34 if vertical else 37, text_color, box[2] - box[0] - 24, True, "mm")


def scene_hook(draw, labels, vertical):
    x, y, w, h = geometry(vertical)
    panel(draw, (x, y, x + w, y + h))
    cy = y + (360 if vertical else 255)
    draw.line((x + 85, cy, x + w - 75, cy), fill=LIGHT, width=6)
    draw.line((x + 150, cy - 110, x + w - 150, cy + 125), fill=RED, width=14)
    draw.ellipse((x + w - 172, cy + 105, x + w - 127, cy + 150), fill=RED)
    pill(draw, (x + 70, y + 67, x + (w // 2) - 20, y + 158), labels[0], AMBER, vertical)
    pill(draw, (x + (w // 2) + 20, y + 67, x + w - 70, y + 158), labels[1], RED, vertical)
    pill(draw, (x + 70, y + h - 157, x + w - 70, y + h - 65), labels[2], CREAM, vertical)


def book_rows(draw, labels, vertical, market=False):
    x, y, w, h = geometry(vertical)
    panel(draw, (x, y, x + w, y + h))
    left = x + 48
    right = x + w - 48
    header_h = 94 if vertical else 75
    pill(draw, (left, y + 45, right, y + 45 + header_h), labels[0] if not market else labels[3],
         AMBER if not market else GREEN, vertical)
    row_y = y + (174 if vertical else 148)
    row_h = 125 if vertical else 104
    gap = 24 if vertical else 17
    for i, label in enumerate(labels[1:4] if not market else labels[:3]):
        top = row_y + i * (row_h + gap)
        rr(draw, (left, top, right, top + row_h), "#1B5075", 22)
        fill = GREEN if market else CREAM
        rr(draw, (left + 14, top + 13, left + (w - 96) * [0.30, 0.46, 0.30][i], top + row_h - 13),
           fill, 16)
        txt(draw, (right - 25, top + row_h // 2), label, 45 if vertical else 44,
            WHITE, w - 230, True, "rm")
    bottom_label = labels[4] if market else labels[4]
    pill(draw, (left, y + h - (170 if vertical else 125), right,
                y + h - (57 if vertical else 32)), bottom_label,
         CREAM if market else LIGHT, vertical)


def scene_limit(draw, labels, vertical):
    x, y, w, h = geometry(vertical)
    panel(draw, (x, y, x + w, y + h))
    if vertical:
        boxes = [(x + 40, y + 78, x + w - 40, y + 350),
                 (x + 40, y + 386, x + w - 40, y + 658)]
    else:
        boxes = [(x + 52, y + 65, x + w // 2 - 15, y + h - 132),
                 (x + w // 2 + 15, y + 65, x + w - 52, y + h - 132)]
    for box, label, color in zip(boxes, labels[:2], (GREEN, AMBER)):
        rr(draw, box, color, 28)
        txt(draw, ((box[0] + box[2]) // 2, (box[1] + box[3]) // 2), label,
            54 if vertical else 58, NAVY, box[2] - box[0] - 30, True, "mm")
    pill(draw, (x + 40, y + h - 114, x + w - 40, y + h - 35), labels[2], CREAM, vertical)


def scene_post_only(draw, labels, vertical):
    x, y, w, h = geometry(vertical)
    panel(draw, (x, y, x + w, y + h))
    left, right = x + 42, x + w - 42
    rows = [
        (labels[0], AMBER, y + 62),
        (labels[1], LIGHT, y + (230 if vertical else 215)),
        (labels[2], RED, y + (405 if vertical else 374)),
    ]
    row_h = 125 if vertical else 104
    for label, color, top in rows:
        pill(draw, (left, top, right, top + row_h), label, color, vertical)
    pill(draw, (left, y + h - (195 if vertical else 134), right,
                y + h - (55 if vertical else 30)), labels[3], GREEN, vertical)


def scene_stop(draw, labels, vertical):
    x, y, w, h = geometry(vertical)
    panel(draw, (x, y, x + w, y + h))
    left, right = x + 43, x + w - 43
    if vertical:
        sections = [(y + 65, y + 330), (y + 405, y + 670)]
    else:
        sections = [(y + 63, y + 280), (y + 333, y + 550)]
    for i, (top, bottom) in enumerate(sections):
        rr(draw, (left, top, right, bottom), "#1B5075", 24)
        txt(draw, (left + 28, top + 32), labels[i * 2], 43 if vertical else 51,
            CREAM, w - 135, True)
        pill(draw, (left + 25, bottom - 115, right - 25, bottom - 26),
             labels[i * 2 + 1], RED if i == 0 else GREEN, vertical)


def scene_tif(draw, labels, vertical):
    x, y, w, h = geometry(vertical)
    panel(draw, (x, y, x + w, y + h))
    if vertical:
        boxes = [(x + 44, y + 112, x + w - 44, y + 380),
                 (x + 44, y + 450, x + w - 44, y + 718)]
    else:
        boxes = [(x + 54, y + 95, x + w - 54, y + 290),
                 (x + 54, y + 330, x + w - 54, y + 525)]
    for i, box in enumerate(boxes):
        rr(draw, box, GREEN if i == 0 else RED, 28)
        txt(draw, ((box[0] + box[2]) // 2, (box[1] + box[3]) // 2), labels[i],
            52 if vertical else 64, NAVY, box[2] - box[0] - 35, True, "mm")


def scene_takeaway(draw, labels, vertical):
    x, y, w, h = geometry(vertical)
    panel(draw, (x, y, x + w, y + h))
    if vertical:
        boxes = [(x + 42, y + 64 + i * 187, x + w - 42, y + 221 + i * 187)
                 for i in range(4)]
    else:
        boxes = [(x + 55 + (i % 2) * (w // 2),
                  y + 69 + (i // 2) * 250,
                  x + w // 2 - 20 + (i % 2) * (w // 2),
                  y + 275 + (i // 2) * 250) for i in range(4)]
    for i, (box, label) in enumerate(zip(boxes, labels)):
        rr(draw, box, "#1B5075", 25, MID, 3)
        draw.ellipse((box[0] + 25, box[1] + 25, box[0] + 83, box[1] + 83),
                     fill=[AMBER, LIGHT, GREEN, RED][i])
        txt(draw, (box[0] + 106, (box[1] + box[3]) // 2), label,
            48 if vertical else 57, CREAM, box[2] - box[0] - 130, True, "lm")


SCENES = {
    "hook": scene_hook,
    "book": lambda d, l, v: book_rows(d, l, v),
    "market": lambda d, l, v: book_rows(d, l, v, True),
    "limit": scene_limit,
    "post_only": scene_post_only,
    "stop": scene_stop,
    "tif": scene_tif,
    "takeaway": scene_takeaway,
}


def render_scene(scene, size, vertical):
    image, draw = base(size, vertical)
    text_header(draw, scene, vertical)
    SCENES[scene["id"]](draw, scene["visible"]["labels"], vertical)
    return image


def render_cover(scenes, size, vertical):
    image, draw = base(size, vertical)
    x, y, w, h = geometry(vertical)
    # Cover uses the hook copy but a different large gap motif from slide 001.
    headline = scenes[0]["visible"]["headline"]
    subhead = scenes[0]["visible"]["subhead"]
    txt(draw, (x, 240 if vertical else 120), headline,
        82 if vertical else 112, CREAM, w, True)
    txt(draw, (x, 360 if vertical else 270), subhead,
        42 if vertical else 51, LIGHT, w)
    top = 605 if vertical else 455
    draw.line((x + 70, top, x + w - 70, top), fill=AMBER, width=18)
    draw.line((x + 70, top + 260 if vertical else top + 190,
               x + w - 70, top + 260 if vertical else top + 190), fill=RED, width=18)
    draw.line((x + w - 120, top + 20, x + w - 120,
               top + 235 if vertical else top + 170), fill=CREAM, width=8)
    for i, label in enumerate(scenes[0]["visible"]["labels"][:2]):
        pill(draw, (x + 60, top - 85 + i * (260 if vertical else 190),
                    x + w - 185, top - 2 + i * (260 if vertical else 190)),
             label, AMBER if i == 0 else RED, vertical)
    return image


def render_endcard(size, vertical):
    image, draw = base(size, vertical)
    x = 80 if vertical else 120
    y = 810 if vertical else 520
    width = 770 if vertical else 1680
    txt(draw, (x, y), "marketmaker.cc", 91 if vertical else 132,
        CREAM, width, True)
    draw.line((x, y + 153 if vertical else y + 175,
               x + width, y + 153 if vertical else y + 175), fill=MID, width=5)
    return image


def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    expected_ids = list(SCENES)
    for lang in ("en", "ru"):
        scenes = manifest["styles"][lang]["scenes"]
        if [scene["id"] for scene in scenes] != expected_ids:
            raise ValueError(f"Unexpected {lang} scene order")
        for format_name, size, vertical in (
            ("slides-desktop", (1920, 1080), False),
            ("slides-shorts", (1080, 1920), True),
        ):
            folder = OUT / lang / format_name
            folder.mkdir(parents=True, exist_ok=True)
            for index, scene in enumerate(scenes, 1):
                render_scene(scene, size, vertical).save(folder / f"slide_{index:03d}.png")
            render_cover(scenes, size, vertical).save(folder / "cover.png")
            render_endcard(size, vertical).save(folder / "endcard.png")
            print(f"Rendered {folder}: 8 scenes, cover, endcard")


if __name__ == "__main__":
    main()
