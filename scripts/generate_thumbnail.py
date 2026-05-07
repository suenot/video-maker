#!/usr/bin/env python3
"""Generate YouTube thumbnail (1280x720) from the first slide."""
import argparse
import os
from PIL import Image, ImageDraw, ImageFont


def generate_thumbnail(slides_dir: str, output_path: str, title: str = None):
    slide_path = os.path.join(slides_dir, "slide_001.png")
    if not os.path.exists(slide_path):
        raise FileNotFoundError(f"First slide not found: {slide_path}")

    img = Image.open(slide_path)

    # Resize to fit 1280x720 while maintaining aspect ratio, then crop center
    target_w, target_h = 1280, 720
    img_ratio = img.width / img.height
    target_ratio = target_w / target_h

    if img_ratio > target_ratio:
        # Image is wider: fit height, crop width
        new_h = target_h
        new_w = int(new_h * img_ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)
        left = (new_w - target_w) // 2
        img = img.crop((left, 0, left + target_w, target_h))
    else:
        # Image is taller: fit width, crop height
        new_w = target_w
        new_h = int(new_w / img_ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)
        top = (new_h - target_h) // 2
        img = img.crop((0, top, target_w, top + target_h))

    # Optionally overlay title text
    if title:
        draw = ImageDraw.Draw(img)
        # Try to load a font; fallback to default
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        except Exception:
            font = ImageFont.load_default()

        # Simple text shadow + white text
        margin = 40
        max_width = target_w - 2 * margin
        words = title.split()
        lines = []
        current_line = ""
        for word in words:
            test = current_line + " " + word if current_line else word
            bbox = draw.textbbox((0, 0), test, font=font)
            if bbox[2] <= max_width:
                current_line = test
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)

        line_h = draw.textbbox((0, 0), "Ay", font=font)[3] - draw.textbbox((0, 0), "Ay", font=font)[1]
        y = target_h - margin - len(lines) * (line_h + 10)
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font)
            x = (target_w - (bbox[2] - bbox[0])) // 2
            draw.text((x + 2, y + 2), line, font=font, fill=(0, 0, 0, 180))
            draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))
            y += line_h + 10

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Thumbnail saved to {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slides-dir", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--title", default=None)
    args = parser.parse_args()
    generate_thumbnail(args.slides_dir, args.output, title=args.title)


if __name__ == "__main__":
    main()
