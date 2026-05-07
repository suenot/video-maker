#!/usr/bin/env python3
"""Convert PDF pages to PNG images using pdftoppm (poppler)."""
import argparse
import os
import subprocess


def pdf_to_images(pdf_path: str, out_dir: str, dpi: int = 200):
    os.makedirs(out_dir, exist_ok=True)
    # Clean old PNGs to avoid mixing with previous runs
    for f in os.listdir(out_dir):
        if f.endswith(".png"):
            os.remove(os.path.join(out_dir, f))
    base = os.path.join(out_dir, "slide")
    cmd = [
        "pdftoppm",
        "-png",
        "-r", str(dpi),
        pdf_path,
        base,
    ]
    subprocess.run(cmd, check=True)
    # pdftoppm produces files like slide-01.png, slide-02.png ...
    files = sorted(
        [f for f in os.listdir(out_dir) if f.startswith("slide-") and f.endswith(".png")],
        key=lambda x: int(os.path.splitext(x)[0].split("-")[-1])
    )
    # Rename to slide_001.png for easier sorting
    mapping = []
    for i, fname in enumerate(files, start=1):
        new_name = f"slide_{i:03d}.png"
        os.rename(os.path.join(out_dir, fname), os.path.join(out_dir, new_name))
        mapping.append(new_name)
    print(f"Extracted {len(mapping)} slides to {out_dir}")
    return mapping


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--dpi", type=int, default=200)
    args = parser.parse_args()
    pdf_to_images(args.pdf, args.out_dir, dpi=args.dpi)


if __name__ == "__main__":
    main()
