#!/usr/bin/env python3
"""Build a controlled Muxy sales deck from verified copy and user screenshots."""

from __future__ import annotations

import argparse
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageFont


W, H = 1920, 1080
NAVY = (10, 18, 38)
INK = (16, 24, 42)
BLUE = (42, 89, 190)
CYAN = (32, 174, 190)
MUTED = (92, 106, 130)
WHITE = (248, 250, 253)
PANEL = (239, 244, 250)
ORANGE = (222, 125, 18)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = (
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    )
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def fit_image(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    x, y, w, h = box
    scale = max(w / image.width, h / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - w) // 2
    top = (resized.height - h) // 2
    return resized.crop((left, top, left + w, top + h))


def draw_wrapped(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, size: int,
                 fill=INK, bold=False, width: int | None = None, spacing: int = 10) -> int:
    fnt = font(size, bold)
    if width is None:
        draw.text(xy, text, font=fnt, fill=fill)
        return size
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        current = ""
        for word in words:
            candidate = f"{current} {word}".strip()
            if draw.textbbox((0, 0), candidate, font=fnt)[2] <= width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = word
        lines.append(current)
    draw.multiline_text(xy, "\n".join(lines), font=fnt, fill=fill, spacing=spacing)
    return len(lines) * (size + spacing)


def base(title: str, subtitle: str = "") -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, W, 12), fill=BLUE)
    draw_wrapped(draw, (100, 72), title, 58, fill=INK, bold=True, width=W - 200, spacing=5)
    if subtitle:
        draw.text((104, 150), subtitle, font=font(28), fill=MUTED)
    return image, draw


def add_card(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str,
             body: str, accent=BLUE) -> None:
    x, y, w, h = box
    draw.rounded_rectangle((x, y, x + w, y + h), radius=24, fill=PANEL, outline=accent, width=5)
    draw.text((x + 30, y + 25), title, font=font(30, True), fill=accent)
    draw_wrapped(draw, (x + 30, y + 85), body, 28, width=w - 60, spacing=8)


def build(sidebar_path: Path, remote_path: Path, output: Path) -> None:
    sidebar = Image.open(sidebar_path).convert("RGB")
    # Keep the real Muxy project rail while excluding the private terminal transcript.
    rail = sidebar.crop((0, 0, min(620, sidebar.width), sidebar.height))
    remote = Image.open(remote_path).convert("RGB")

    slides: list[Image.Image] = []

    image, draw = base("Several projects. Several AI agents. One focus problem.",
                       "Juggling four or more active projects turns the terminal into a chaotic pile of windows and tabs.")
    draw.rounded_rectangle((100, 290, 1820, 890), radius=36, fill=NAVY)
    for index, label in enumerate(("Claude Code", "Codex", "another harness")):
        x = 180 + index * 530
        draw.rounded_rectangle((x, 420, x + 420, 700), radius=20, fill=(26, 39, 70), outline=(75, 105, 170), width=4)
        draw.text((x + 30, 470), label, font=font(34, True), fill=WHITE)
        draw.text((x + 30, 545), "project context", font=font(28), fill=(173, 190, 221))
        draw.text((x + 30, 610), "session running...", font=font(28), fill=(173, 190, 221))
    draw.text((180, 790), "Switching windows should not mean rebuilding your mental map.", font=font(32), fill=(216, 225, 242))
    slides.append(image)

    image, draw = base("Separate today's active work from parked projects.",
                       "Muxy keeps the work you are doing now visible and the rest easy to resume.")
    rail_view = fit_image(rail, (120, 260, 460, 700))
    image.paste(rail_view, (120, 260))
    draw.rounded_rectangle((660, 290, 1780, 780), radius=28, fill=PANEL, outline=BLUE, width=5)
    draw.text((730, 350), "Active", font=font(42, True), fill=BLUE)
    draw.text((1230, 350), "Parked", font=font(42, True), fill=MUTED)
    draw.line((1170, 340, 1170, 700), fill=(185, 196, 214), width=3)
    for y, label in zip((450, 540, 630), ("current build", "agent session", "review branch")):
        draw.rounded_rectangle((720, y, 1080, y + 55), radius=16, fill=(220, 231, 249))
        draw.text((750, y + 10), label, font=font(25), fill=INK)
    for y, label in zip((450, 540, 630), ("next experiment", "paused feature", "later project")):
        draw.rounded_rectangle((1270, y, 1620, y + 55), radius=16, fill=(220, 224, 231))
        draw.text((1300, y + 10), label, font=font(25), fill=MUTED)
    slides.append(image)

    image, draw = base("One workspace for many harness sessions.",
                       "Switch tasks without losing the context of the day.")
    add_card(draw, (120, 300, 500, 430), "Project A", "Claude Code\nactive work", BLUE)
    add_card(draw, (710, 300, 500, 430), "Project B", "Codex\nactive work", CYAN)
    add_card(draw, (1300, 300, 500, 430), "Project C", "another harness\nparked for later", ORANGE)
    draw.line((620, 515, 700, 515), fill=MUTED, width=5)
    draw.line((1210, 515, 1290, 515), fill=MUTED, width=5)
    draw.text((450, 850), "The point is not more features. The point is less workspace friction.", font=font(34, True), fill=INK)
    slides.append(image)

    image, draw = base("Remote project? Same project-oriented workspace.",
                       "Open a configured SSH host or a local Ubuntu Docker environment from the same place.")
    remote_view = fit_image(remote, (120, 320, 920, 250))
    image.paste(remote_view, (120, 320))
    add_card(draw, (1120, 290, 660, 420), "You configure", "SSH host\nLocal Ubuntu Docker\nHarness account", ORANGE)
    draw.text((140, 700), "Muxy organizes and launches the workspace.", font=font(36, True), fill=BLUE)
    draw.text((140, 765), "The server, container, account, and agent are yours.", font=font(30), fill=MUTED)
    slides.append(image)

    image, draw = base("Muxy organizes and launches workspaces.",
                       "It is the organization layer around your terminal-based work.")
    add_card(draw, (130, 310, 760, 410), "Muxy provides", "Workspace organization\nLightweight native terminal\nProject navigation", BLUE)
    add_card(draw, (1030, 310, 760, 410), "You bring", "The AI agent\nThe remote server or Docker environment\nThe harness accounts", MUTED)
    draw.rounded_rectangle((710, 825, 1210, 920), radius=28, fill=ORANGE)
    draw.text((790, 850), "macOS only", font=font(36, True), fill=WHITE)
    slides.append(image)

    image, draw = base("A lightweight native terminal for Mac developers.",
                       "If your work is spread across projects and agents, the workspace itself becomes part of the system.")
    draw.rounded_rectangle((170, 320, 1750, 760), radius=38, fill=NAVY)
    draw.text((270, 430), "ACTIVE PROJECTS", font=font(35, True), fill=(103, 220, 222))
    draw.text((270, 520), "PARKED PROJECTS", font=font(35, True), fill=(174, 190, 224))
    draw.text((270, 610), "REMOTE WORKSPACES", font=font(35, True), fill=(242, 189, 90))
    draw.text((270, 855), "macOS only. Lightweight. Focused on getting you back to the right project.", font=font(32, True), fill=INK)
    slides.append(image)

    image, draw = base("Keep every coding project within reach.",
                       "Muxy for Mac")
    draw.rounded_rectangle((240, 350, 1680, 720), radius=42, fill=NAVY)
    draw.text((420, 470), "If you work across multiple coding projects on a Mac,", font=font(43, True), fill=WHITE)
    draw.text((650, 560), "try Muxy.", font=font(64, True), fill=(103, 220, 222))
    draw.text((660, 850), "github.com/muxy-app/muxy", font=font(32), fill=BLUE)
    slides.append(image)

    output.parent.mkdir(parents=True, exist_ok=True)
    pdf = fitz.open()
    for slide in slides:
        page = pdf.new_page(width=W, height=H)
        page.insert_image(page.rect, stream=_png_bytes(slide))
    pdf.save(output)
    print(f"created {output} ({len(slides)} slides)")


def _png_bytes(image: Image.Image) -> bytes:
    from io import BytesIO

    buffer = BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sidebar", type=Path, required=True)
    parser.add_argument("--remote", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    build(args.sidebar, args.remote, args.output)


if __name__ == "__main__":
    main()
