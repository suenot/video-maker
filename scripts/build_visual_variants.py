#!/usr/bin/env python3
"""Build exact-text 16:9 slide variants around generated source art."""
import argparse
import json
import math
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
FONT_STIX = "/System/Library/Fonts/Supplemental/STIXTwoText.ttf"
FONT_STIX_BOLD = "/System/Library/Fonts/Supplemental/STIXGeneralBol.otf"


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
    "threeblue": {
        "panel": (0, 0, 0, 246),
        "text": (255, 255, 255, 255),
        "muted": (154, 154, 154, 255),
        "accent": (88, 196, 221, 255),
        "secondary": (255, 255, 0, 255),
        "positive": (131, 193, 103, 255),
        "warning": (252, 98, 85, 255),
        "chip": (18, 18, 18, 238),
        "line": (88, 196, 221, 255),
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
    if style in {"midnight", "threeblue"}:
        draw.rectangle((0, 0, width, HEIGHT), fill=palette["panel"])
        for i in range(220):
            alpha = int(236 * (1 - i / 220))
            panel_rgb = palette["panel"][:3]
            draw.line((width + i, 0, width + i, HEIGHT), fill=(*panel_rgb, alpha))
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
        if style == "threeblue":
            draw.line((cursor_x, y + 5, cursor_x, y + 35),
                      fill=palette["accent"], width=4)
            draw.text((cursor_x + 14, y + 7), tag, font=typeface,
                      fill=palette["text"])
        else:
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
    if style == "threeblue":
        title_font = font(FONT_STIX_BOLD, 104)
        subtitle_font = font(FONT_STIX, 38)
        small_font = font(FONT_BOLD, 23)
        draw.line((84, 74, 318, 74), fill=palette["accent"], width=5)
        draw.text((84, 102), cover["eyebrow"], font=small_font,
                  fill=palette["accent"])
        title_lines = cover["title"].split("\n")
        for line_index, line in enumerate(title_lines):
            draw.text((78, 176 + line_index * 112), line, font=title_font,
                      fill=palette["text"])
        subtitle = wrap_text(draw, cover["subtitle"], subtitle_font, 830)
        subtitle_y = 176 + len(title_lines) * 112 + 30
        y = draw_lines(draw, (84, subtitle_y), subtitle, subtitle_font,
                       palette["text"], 9)
        if cover.get("badge"):
            draw.text((84, y + 40), cover["badge"], font=font(FONT_BOLD, 26),
                      fill=palette["secondary"])
        draw.text((84, 944), cover["footer"], font=font(FONT_STIX, 27),
                  fill=palette["muted"])
        draw.text((84, 1002), "ПРОВЕРЕНО ПО КОДУ", font=small_font,
                  fill=palette["accent"])
        draw.text((1740, 1002), "00", font=font(FONT_MONO, 22),
                  fill=palette["muted"])
        return canvas.convert("RGB")

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
    if style == "threeblue":
        title_font = font(FONT_STIX_BOLD, 58)
        body_font = font(FONT_STIX, 30)
    else:
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
        formula_y = 696 if scene.get("hero") else max(y + 48, 596)
        for line in scene["formula"]:
            if style == "threeblue":
                formula_lines = wrap_text(draw, line, mono_font, 805)
                draw.line((x, formula_y + 3, x, formula_y + 43),
                          fill=palette["secondary"], width=4)
                formula_y = draw_lines(
                    draw, (x + 18, formula_y), formula_lines, mono_font,
                    palette["text"], 7,
                ) + 18
            else:
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
            if style == "threeblue":
                draw.line((x, issue_y + 4, x, issue_y + 70),
                          fill=palette["warning"], width=5)
                draw.text((x + 20, issue_y), issue, font=font(FONT_STIX_BOLD, 42),
                          fill=palette["warning"])
                wrapped_label = wrap_text(draw, label, small_font, 650)
                draw_lines(draw, (x + 160, issue_y + 13), wrapped_label,
                           small_font, palette["text"], 4)
            else:
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

    footer = "АУДИТ КОДА · 07.08.2026" if style == "threeblue" else "SOURCE-CODE AUDIT"
    draw.text((x, 1012), footer, font=small_font, fill=palette["muted"])
    draw.text((1740, 1012), f"{index:02d}", font=font(FONT_MONO, 22),
              fill=palette["muted"])
    return canvas.convert("RGB")


def draw_endcard(art_path: Path, style: str, spec: dict) -> Image.Image:
    canvas = fit_art(art_path).convert("RGBA")
    draw = ImageDraw.Draw(canvas)
    palette = PALETTES[style]
    title_face = font(FONT_STIX_BOLD if style == "threeblue" else FONT_BLACK, 62)
    label_face = font(FONT_BOLD, 22)
    cta_face = font(FONT_STIX_BOLD if style == "threeblue" else FONT_BLACK, 37)

    title = spec["title"]
    title_box = draw.textbbox((0, 0), title, font=title_face)
    draw.text(((WIDTH - (title_box[2] - title_box[0])) / 2, 78), title,
              font=title_face, fill=palette["text"])
    draw.text((96, 250), spec["left_label"], font=label_face,
              fill=palette["accent"])
    right_box = draw.textbbox((0, 0), spec["right_label"], font=label_face)
    draw.text((1824 - (right_box[2] - right_box[0]), 250), spec["right_label"],
              font=label_face, fill=palette["secondary"])
    cta_box = draw.textbbox((0, 0), spec["cta"], font=cta_face)
    draw.text(((WIDTH - (cta_box[2] - cta_box[0])) / 2, 754), spec["cta"],
              font=cta_face, fill=palette["text"])
    footer_face = font(FONT_STIX if style == "threeblue" else FONT_REGULAR, 27)
    footer_box = draw.textbbox((0, 0), spec["footer"], font=footer_face)
    draw.text(((WIDTH - (footer_box[2] - footer_box[0])) / 2, 824), spec["footer"],
              font=footer_face, fill=palette["muted"])
    return canvas.convert("RGB")


def save_contact_sheet(images: Sequence[Image.Image], path: Path) -> None:
    thumb_w, thumb_h = 640, 360
    rows = math.ceil(len(images) / 3)
    sheet = Image.new("RGB", (thumb_w * 3, thumb_h * rows), "black")
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
        style_spec = manifest["styles"][style]
        art_dir = storyboard_dir / style_spec["art_dir"]
        cover_spec = style_spec.get("cover", manifest["cover"])
        scenes = style_spec.get("scenes", manifest["scenes"])
        out_dir = build_root / style
        slides_dir = out_dir / "slides"
        slides_dir.mkdir(parents=True, exist_ok=True)

        first_art = art_dir / scenes[0]["art"]
        cover = draw_cover(first_art, style, cover_spec)
        cover.save(out_dir / "cover.png", "PNG", optimize=True)
        cover.resize((1280, 720), RESAMPLE).save(out_dir / "thumbnail.png", "PNG", optimize=True)

        rendered = [cover]
        timeline = []
        for index, scene in enumerate(scenes, start=1):
            art_path = art_dir / scene["art"]
            if not art_path.exists():
                raise FileNotFoundError(f"Missing source art: {art_path}")
            slide = draw_scene(art_path, style, scene, index)
            slide.save(slides_dir / f"slide_{index:03d}.png", "PNG", optimize=True)
            rendered.append(slide)
            if "start" in scene and "end" in scene:
                timeline.append({"slide": index - 1, "start": scene["start"], "end": scene["end"]})

        if len(timeline) == len(scenes):
            (out_dir / "timeline.json").write_text(
                json.dumps({"timeline": timeline, "slide_count": len(timeline)}, indent=2) + "\n",
                encoding="utf-8",
            )
        endcard_spec = style_spec.get("endcard")
        if endcard_spec:
            endcard = draw_endcard(art_dir / endcard_spec["art"], style, endcard_spec)
            endcard.save(out_dir / "endcard.png", "PNG", optimize=True)
        save_contact_sheet(rendered, preview_root / f"{style}-sheet.jpg")
        print(f"Built {style}: {out_dir}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--build-root", type=Path, required=True)
    parser.add_argument("--preview-root", type=Path, required=True)
    parser.add_argument("--styles", nargs="+")
    args = parser.parse_args()
    styles = args.styles
    if not styles:
        styles = list(json.loads(args.manifest.read_text(encoding="utf-8"))["styles"])
    build(args.manifest, args.build_root, args.preview_root, styles)


if __name__ == "__main__":
    main()
