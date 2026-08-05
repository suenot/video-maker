#!/usr/bin/env python3
"""Render deterministic start/end 16:9 frames over comic-style scene art."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont


W, H = 1920, 1080
PAPER = (255, 248, 235, 246)
PAPER_SOLID = (255, 248, 235, 255)
INK = (57, 47, 43, 255)
MINT = (188, 224, 214, 255)
CYAN = (77, 184, 205, 255)
AMBER = (238, 172, 79, 255)
CORAL = (225, 111, 98, 255)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


FONT_SECTION = font(22, True)
FONT_TITLE = font(48, True)
FONT_START = font(31, True)
FONT_BULLET = font(27, False)
FONT_SCENE = font(20, True)


def cover(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    scale = max(W / image.width, H / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    x = (resized.width - W) // 2
    y = (resized.height - H) // 2
    return resized.crop((x, y, x + W, y + H)).convert("RGBA")


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: tuple[int, int, int, int], radius: int = 22) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def wrap(draw: ImageDraw.ImageDraw, value: str, font_: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = value.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if draw.textlength(candidate, font=font_) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_text_lines(draw: ImageDraw.ImageDraw, lines: list[str], x: int, y: int, font_: ImageFont.ImageFont, fill: tuple[int, int, int, int], leading: int) -> int:
    for line in lines:
        draw.text((x, y), line, font=font_, fill=fill)
        y += leading
    return y


def render(scene: dict, art: Image.Image, is_end: bool) -> Image.Image:
    canvas = cover(art)
    if not is_end:
        canvas = ImageEnhance.Brightness(canvas).enhance(0.86)
        canvas = ImageEnhance.Color(canvas).enhance(0.84)

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Top title band keeps the explanatory copy consistent across all scenes.
    rounded(draw, (48, 40, 1872, 192), PAPER, 28)
    draw.rectangle((48, 153, 1872, 192), fill=(255, 248, 235, 246))
    draw.text((84, 70), scene["section"], font=FONT_SECTION, fill=CYAN)
    draw.text((84, 100), scene["title"], font=FONT_TITLE, fill=INK)
    scene_label = f"SCENE {scene['id']:02d}"
    label_w = draw.textlength(scene_label, font=FONT_SCENE)
    rounded(draw, (1784 - int(label_w), 76, 1812, 119), MINT, 18)
    draw.text((1798 - int(label_w), 87), scene_label, font=FONT_SCENE, fill=INK)

    # Caption panel on the reserved left side. Start is deliberately restrained;
    # end gives the full spoken visual explanation without generated lettering.
    if is_end:
        rounded(draw, (50, 228, 770, 1008), PAPER, 30)
        draw.rectangle((50, 228, 69, 1008), fill=CYAN)
        y = 276
        for index, bullet in enumerate(scene["bullets"]):
            dot = CORAL if index == 0 else (AMBER if index == 1 else CYAN)
            draw.ellipse((100, y + 11, 117, y + 28), fill=dot)
            lines = wrap(draw, bullet, FONT_BULLET, 595)
            y = draw_text_lines(draw, lines, 140, y, FONT_BULLET, INK, 38) + 37
        footer = "END FRAME · FULL EXPLANATION"
        draw.text((100, 948), footer, font=FONT_SCENE, fill=CYAN)
    else:
        rounded(draw, (50, 720, 770, 984), PAPER_SOLID, 30)
        draw.rectangle((50, 720, 69, 984), fill=CORAL)
        draw.text((100, 760), "START FRAME", font=FONT_SCENE, fill=CORAL)
        lines = wrap(draw, scene["start"], FONT_START, 590)
        draw_text_lines(draw, lines, 100, 798, FONT_START, INK, 42)

    # A consistent line-and-dot visual cue deliberately gives Seedance a simple
    # direction of motion from a quiet premise into a complete explained state.
    draw.line((820, 1005, 1835, 1005), fill=(255, 248, 235, 215), width=4)
    for x, color in ((860, CYAN), (1175, AMBER), (1490, CORAL), (1805, MINT)):
        draw.ellipse((x - 10, 995, x + 10, 1015), fill=color)

    return Image.alpha_composite(canvas, overlay).convert("RGB")


def contact_sheet(frame_paths: list[Path], destination: Path, label: str) -> None:
    thumb_w, thumb_h = 384, 216
    cols, rows = 5, 3
    sheet = Image.new("RGB", (cols * thumb_w, rows * thumb_h + 62), (250, 244, 230))
    draw = ImageDraw.Draw(sheet)
    draw.text((28, 17), label, font=font(28, True), fill=INK[:3])
    for index, path in enumerate(frame_paths):
        image = Image.open(path).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = (index % cols) * thumb_w
        y = 62 + (index // cols) * thumb_h
        sheet.paste(image, (x, y))
        draw.rectangle((x + 12, y + 12, x + 64, y + 44), fill=(255, 248, 235))
        draw.text((x + 24, y + 18), f"{index + 1:02d}", font=font(17, True), fill=INK[:3])
    sheet.save(destination, quality=95)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--bases-dir", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--contact-sheets-dir", type=Path)
    args = parser.parse_args()

    payload = json.loads(args.manifest.read_text())
    args.out_dir.mkdir(parents=True, exist_ok=True)
    start_paths: list[Path] = []
    end_paths: list[Path] = []
    for scene in payload["scenes"]:
        name = f"{scene['id']:02d}-{scene['slug']}"
        base_path = args.bases_dir / f"{name}.png"
        if not base_path.exists():
            raise FileNotFoundError(f"Missing base illustration: {base_path}")
        art = Image.open(base_path)
        start_path = args.out_dir / f"{name}-start.jpg"
        end_path = args.out_dir / f"{name}-end.jpg"
        render(scene, art, False).save(start_path, format="JPEG", quality=95, subsampling=0, optimize=True)
        render(scene, art, True).save(end_path, format="JPEG", quality=95, subsampling=0, optimize=True)
        start_paths.append(start_path)
        end_paths.append(end_path)

    if args.contact_sheets_dir:
        args.contact_sheets_dir.mkdir(parents=True, exist_ok=True)
        contact_sheet(start_paths, args.contact_sheets_dir / "start-frames-overview.jpg", "COMIC EXPLAINER — START FRAMES")
        contact_sheet(end_paths, args.contact_sheets_dir / "end-frames-overview.jpg", "COMIC EXPLAINER — END FRAMES")


if __name__ == "__main__":
    main()
