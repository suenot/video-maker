#!/usr/bin/env python3
"""Build Seedance first/last-frame prompts and sequential storyboard sheets."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).parent
MANIFEST = ROOT / "continuity-manifest.json"
ANCHORS = ROOT / "anchors"
PROMPTS = ROOT / "prompts"
SHEETS = ROOT / "storyboard-sheet"
INK = (57, 47, 43)
PAPER = (250, 244, 230)
CYAN = (77, 184, 205)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in paths:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def anchor_filename(anchor: dict) -> str:
    return f"K{int(anchor['id'][1:]):02d}-{anchor['slug']}.png"


def prompt_for(scene: dict, start: dict, end: dict) -> str:
    return f"""# Scene {scene['id']:02d}: {start['id']} → {end['id']}

## Upload contract

- First frame: `../anchors/{anchor_filename(start)}`
- Last frame: `../anchors/{anchor_filename(end)}`
- Duration: {scene['duration']}
- Format: 16:9

## Seedance prompt

Single unbroken {scene['duration']} editorial-comic motion-design shot. Begin by matching the first-frame reference exactly: same cream paper world, sage contour border, cocoa linework, cyan data, amber value, coral exceptions, isometric camera height and object placement. {scene['beat']} Camera: {scene['camera']} Timing: {scene['timing']} Land precisely on the last-frame reference by the final moment. Preserve the same workshop geography, white worker characters, object ownership and lighting logic throughout. No cuts, no montage, no camera teleport, no text, no letters, no numerals, no logos, no subtitles, no watermark, no new unrelated objects.

## Continuity handoff

When this take is accepted, extract its actual final frame. That extracted frame replaces planned `{end['id']}` as the first-frame input of the next scene.
"""


def anchor_overview(anchors: list[dict]) -> None:
    thumb_w, thumb_h = 480, 270
    cols = 4
    header = 82
    sheet = Image.new("RGB", (cols * thumb_w, header + 4 * thumb_h), PAPER)
    draw = ImageDraw.Draw(sheet)
    draw.text((30, 25), "CONTINUOUS ANCHOR CHAIN  K0 → K15", font=font(32, True), fill=INK)
    for index, anchor in enumerate(anchors):
        image = Image.open(ANCHORS / anchor_filename(anchor)).convert("RGB")
        image = image.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x, y = (index % cols) * thumb_w, header + (index // cols) * thumb_h
        sheet.paste(image, (x, y))
        draw.rounded_rectangle((x + 14, y + 14, x + 74, y + 52), radius=12, fill=(255, 248, 235))
        draw.text((x + 25, y + 22), anchor["id"], font=font(17, True), fill=INK)
    sheet.save(SHEETS / "anchor-chain-overview.jpg", quality=95)


def pair_overview(scenes: list[dict], by_id: dict[str, dict]) -> None:
    card_w, card_h = 640, 180
    cols = 3
    rows = 5
    header = 82
    sheet = Image.new("RGB", (cols * card_w, header + rows * card_h), PAPER)
    draw = ImageDraw.Draw(sheet)
    draw.text((30, 25), "SEEDANCE PAIRS — EACH END IS THE NEXT START", font=font(30, True), fill=INK)
    for index, scene in enumerate(scenes):
        start, end = by_id[scene["start"]], by_id[scene["end"]]
        x, y = (index % cols) * card_w, header + (index // cols) * card_h
        for offset, anchor in ((0, start), (320, end)):
            image = Image.open(ANCHORS / anchor_filename(anchor)).convert("RGB")
            image = image.resize((320, 180), Image.Resampling.LANCZOS)
            sheet.paste(image, (x + offset, y))
        draw.rounded_rectangle((x + 14, y + 12, x + 154, y + 45), radius=10, fill=(255, 248, 235))
        draw.text((x + 24, y + 18), f"S{scene['id']:02d}: {scene['start']} → {scene['end']}", font=font(14, True), fill=INK)
        draw.line((x + 303, y + 89, x + 337, y + 89), fill=CYAN, width=4)
        draw.polygon(((x + 337, y + 89), (x + 327, y + 82), (x + 327, y + 96)), fill=CYAN)
    sheet.save(SHEETS / "scene-pairs-overview.jpg", quality=95)


def main() -> None:
    data = json.loads(MANIFEST.read_text())
    PROMPTS.mkdir(exist_ok=True)
    SHEETS.mkdir(exist_ok=True)
    by_id = {anchor["id"]: anchor for anchor in data["anchors"]}
    for scene in data["scenes"]:
        start, end = by_id[scene["start"]], by_id[scene["end"]]
        filename = f"{scene['id']:02d}-{scene['start'].lower()}-to-{scene['end'].lower()}.md"
        (PROMPTS / filename).write_text(prompt_for(scene, start, end))
    anchor_overview(data["anchors"])
    pair_overview(data["scenes"], by_id)


if __name__ == "__main__":
    main()
