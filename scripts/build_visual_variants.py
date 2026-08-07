#!/usr/bin/env python3
"""Build exact-text 16:9 slide variants around generated source art."""
import argparse
import json
from pathlib import Path
from typing import Iterable, Sequence

from PIL import Image, ImageDraw, ImageFont, ImageOps


WIDTH, HEIGHT = 1920, 1080
RESAMPLE = getattr(Image, "Resampling", Image).LANCZOS
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
FONT_SERIF_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
FONT_MONO = "/System/Library/Fonts/Menlo.ttc"


PALETTES = {
    "midnight": {
        "panel": (2, 8, 14, 236),
        "text": (242, 248, 247, 255),
        "muted": (166, 190, 191, 255),
        "accent": (41, 224, 224, 255),
        "secondary": (255, 183, 77, 255),
        "warning": (255, 96, 76, 255),
        "chip": (9, 37, 45, 230),
        "line": (47, 111, 119, 255),
    },
    "warm-editorial": {
        "panel": (249, 238, 211, 244),
        "text": (58, 43, 34, 255),
        "muted": (104, 84, 66, 255),
        "accent": (22, 105, 96, 255),
        "secondary": (174, 116, 53, 255),
        "warning": (190, 75, 51, 255),
        "chip": (226, 213, 177, 245),
        "line": (152, 127, 91, 255),
    },
}


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def fit_art(path: Path) -> Image.Image:
    with Image.open(path) as source:
        return ImageOps.fit(source.convert("RGB"), (WIDTH, HEIGHT), method=RESAMPLE)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, typeface: ImageFont.FreeTypeFont,
              max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        current = ""
        for word in words:
            trial = f"{current} {word}".strip()
            if draw.textbbox((0, 0), trial, font=typeface)[2] <= max_width:
                current = trial
            else:
                if current:
                    lines.append(current)
                current = word
        lines.append(current)
    return lines


def draw_lines(draw: ImageDraw.ImageDraw, xy: tuple[int, int], lines: Iterable[str],
               typeface: ImageFont.FreeTypeFont, fill: tuple[int, ...],
               spacing: int) -> int:
    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=typeface, fill=fill)
        bbox = draw.textbbox((x, y), line or "Ag", font=typeface)
        y += bbox[3] - bbox[1] + spacing
    return y


def add_left_panel(canvas: Image.Image, style: str, width: int = 970) -> None:
    palette = PALETTES[style]
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    if style == "midnight":
        draw.rectangle((0, 0, width, HEIGHT), fill=palette["panel"])
        for i in range(220):
            alpha = int(236 * (1 - i / 220))
            draw.line((width + i, 0, width + i, HEIGHT), fill=(2, 8, 14, alpha))
    else:
        draw.rounded_rectangle(
            (38, 38, width, HEIGHT - 38), radius=34,
            fill=palette["panel"], outline=palette["line"], width=3,
        )
    canvas.alpha_composite(overlay)


def draw_tags(draw: ImageDraw.ImageDraw, tags: Sequence[str], style: str,
              x: int, y: int, max_width: int = 840) -> int:
    palette = PALETTES[style]
    typeface = font(FONT_BOLD, 24)
    cursor_x = x
    for tag in tags:
        bbox = draw.textbbox((0, 0), tag, font=typeface)
        chip_w = bbox[2] + 34
        if cursor_x + chip_w > x + max_width:
            cursor_x = x
            y += 52
        draw.rounded_rectangle(
            (cursor_x, y, cursor_x + chip_w, y + 38), radius=19,
            fill=palette["chip"], outline=palette["line"], width=2,
        )
        draw.text((cursor_x + 17, y + 7), tag, font=typeface,
                  fill=palette["accent"])
        cursor_x += chip_w + 12
    return y + 42


def draw_cover(art_path: Path, style: str, cover: dict) -> Image.Image:
    canvas = fit_art(art_path).convert("RGBA")
    add_left_panel(canvas, style, width=1080)
    draw = ImageDraw.Draw(canvas)
    palette = PALETTES[style]
    title_font = font(FONT_BLACK if style == "midnight" else FONT_SERIF_BOLD, 126)
    subtitle_font = font(FONT_BOLD, 42)
    small_font = font(FONT_BOLD, 24)
    draw.rectangle((84, 74, 280, 82), fill=palette["accent"])
    draw.text((84, 105), cover["eyebrow"], font=small_font,
              fill=palette["accent"])
    draw.text((78, 190), cover["title"], font=title_font, fill=palette["text"])
    subtitle = wrap_text(draw, cover["subtitle"], subtitle_font, 820)
    y = draw_lines(draw, (84, 360), subtitle, subtitle_font, palette["text"], 10)
    draw.text((84, y + 42), cover["footer"], font=font(FONT_REGULAR, 32),
              fill=palette["muted"])
    draw.text((84, 958), "30-DAY FIELD REPORT", font=small_font,
              fill=palette["secondary"])
    draw.text((1740, 988), "00", font=font(FONT_MONO, 24), fill=palette["muted"])
    return canvas.convert("RGB")


def draw_scene(art_path: Path, style: str, scene: dict, index: int) -> Image.Image:
    canvas = fit_art(art_path).convert("RGBA")
    add_left_panel(canvas, style)
    draw = ImageDraw.Draw(canvas)
    palette = PALETTES[style]
    x = 78 if style == "midnight" else 82
    title_font = font(FONT_BLACK if style == "midnight" else FONT_SERIF_BOLD, 66)
    body_font = font(FONT_REGULAR, 31)
    mono_font = font(FONT_MONO, 26)
    small_font = font(FONT_BOLD, 22)

    draw.rectangle((x, 58, x + 120, 66), fill=palette["accent"])
    draw.text((x, 88), scene["eyebrow"], font=small_font, fill=palette["accent"])
    y = draw_lines(draw, (x, 142), scene["title"].split("\n"), title_font,
                   palette["text"], 6)
    subtitle_lines = wrap_text(draw, scene["subtitle"], body_font, 780)
    y = draw_lines(draw, (x, y + 28), subtitle_lines, body_font,
                   palette["muted"], 9)

    if scene.get("hero"):
        draw.text((x, 748), scene["hero"], font=font(FONT_BLACK, 142),
                  fill=palette["secondary"])
    if scene.get("formula"):
        formula_y = 696 if scene.get("hero") else max(y + 48, 620)
        for line in scene["formula"]:
            draw.rounded_rectangle((x, formula_y, 914, formula_y + 58), radius=12,
                                   fill=palette["chip"], outline=palette["line"], width=2)
            draw.text((x + 18, formula_y + 13), line, font=mono_font,
                      fill=palette["text"])
            formula_y += 70
    if scene.get("tags"):
        draw_tags(draw, scene["tags"], style, x, 892)
    if scene.get("issues"):
        issue_y = 654
        for issue, label in scene["issues"]:
            draw.rounded_rectangle((x, issue_y, 914, issue_y + 92), radius=16,
                                   fill=palette["chip"], outline=palette["warning"], width=3)
            draw.text((x + 20, issue_y + 17), issue, font=font(FONT_BLACK, 42),
                      fill=palette["warning"])
            draw.text((x + 170, issue_y + 29), label, font=small_font,
                      fill=palette["text"])
            issue_y += 110
        draw.text((x, 900), scene["footer"], font=small_font,
                  fill=palette["warning"])
    if scene.get("quote"):
        quote_y = max(650, y + 52)
        draw.line((x, quote_y, x, quote_y + 168), fill=palette["secondary"], width=8)
        draw_lines(draw, (x + 28, quote_y + 6), scene["quote"].split("\n"),
                   font(FONT_SERIF_BOLD, 43), palette["text"], 12)

    draw.text((x, 1012), "SOURCE-CODE AUDIT", font=small_font, fill=palette["muted"])
    draw.text((1740, 1012), f"{index:02d}", font=font(FONT_MONO, 22),
              fill=palette["muted"])
    return canvas.convert("RGB")


def save_contact_sheet(images: Sequence[Image.Image], path: Path) -> None:
    thumb_w, thumb_h = 640, 360
    sheet = Image.new("RGB", (thumb_w * 3, thumb_h * 2), "white")
    for index, image in enumerate(images):
        sheet.paste(image.resize((thumb_w, thumb_h), RESAMPLE),
                    ((index % 3) * thumb_w, (index // 3) * thumb_h))
    path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(path, "JPEG", quality=90, optimize=True)


def build(manifest_path: Path, build_root: Path, preview_root: Path,
          styles: Sequence[str]) -> None:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    storyboard_dir = manifest_path.parent
    for style in styles:
        if style not in manifest["styles"]:
            raise ValueError(f"Unknown style: {style}")
        art_dir = storyboard_dir / manifest["styles"][style]["art_dir"]
        out_dir = build_root / style
        slides_dir = out_dir / "slides"
        slides_dir.mkdir(parents=True, exist_ok=True)

        first_art = art_dir / manifest["scenes"][0]["art"]
        cover = draw_cover(first_art, style, manifest["cover"])
        cover.save(out_dir / "cover.png", "PNG", optimize=True)
        cover.resize((1280, 720), RESAMPLE).save(out_dir / "thumbnail.png", "PNG", optimize=True)

        rendered = [cover]
        timeline = []
        for index, scene in enumerate(manifest["scenes"], start=1):
            art_path = art_dir / scene["art"]
            if not art_path.exists():
                raise FileNotFoundError(f"Missing source art: {art_path}")
            slide = draw_scene(art_path, style, scene, index)
            slide.save(slides_dir / f"slide_{index:03d}.png", "PNG", optimize=True)
            rendered.append(slide)
            timeline.append({"slide": index - 1, "start": scene["start"], "end": scene["end"]})

        (out_dir / "timeline.json").write_text(
            json.dumps({"timeline": timeline, "slide_count": len(timeline)}, indent=2) + "\n",
            encoding="utf-8",
        )
        save_contact_sheet(rendered, preview_root / f"{style}-sheet.jpg")
        print(f"Built {style}: {out_dir}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--build-root", type=Path, required=True)
    parser.add_argument("--preview-root", type=Path, required=True)
    parser.add_argument("--styles", nargs="+", default=["midnight", "warm-editorial"])
    args = parser.parse_args()
    build(args.manifest, args.build_root, args.preview_root, args.styles)


if __name__ == "__main__":
    main()
