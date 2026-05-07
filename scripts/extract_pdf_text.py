#!/usr/bin/env python3
"""Extract text from slide images using OCR (pytesseract)."""
import argparse
import json
import os

from PIL import Image
import pytesseract


def extract_text_from_images(images_dir: str, lang: str = "eng+rus") -> list:
    files = sorted(
        [f for f in os.listdir(images_dir) if f.startswith("slide_") and f.endswith(".png")],
        key=lambda x: int(os.path.splitext(x)[0].split("_")[-1]),
    )
    pages = []
    for fname in files:
        path = os.path.join(images_dir, fname)
        try:
            img = Image.open(path)
            text = pytesseract.image_to_string(img, lang=lang)
        except Exception as e:
            print(f"Warning: failed to OCR {fname}: {e}")
            text = ""
        num = int(os.path.splitext(fname)[0].split("_")[-1])
        pages.append({"page": num, "text": text.strip()})
    pages.sort(key=lambda x: x["page"])
    return pages


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--images-dir", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--lang", default="eng+rus")
    args = parser.parse_args()

    pages = extract_text_from_images(args.images_dir, lang=args.lang)
    data = {"pages": pages}
    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"OCR extracted text from {len(pages)} slides to {args.output}")


if __name__ == "__main__":
    main()
