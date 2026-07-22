#!/usr/bin/env python3
"""Strip the NotebookLM watermark from a slide deck PDF.

Wraps Albonire/notebooklm-watermark-remover (MIT). That tool looks for pixels
*darker* than their surroundings, which is right for NotebookLM's light decks
and blind to its dark ones — where the mark is light grey on near-black and
every page comes back untouched while the tool reports it patched.

Rather than fork its heuristics, hand them the picture they expect: invert a
dark region before cleaning and invert the result back.

    python clean_slides.py slides_en.pdf [-o slides_en_clean.pdf]

Exit 0 on success, 1 when the deck could not be processed. The caller should
treat failure as "use the original deck" — a watermark is cosmetic, a missing
deck is not.
"""
import argparse
import os
import shutil
import sys
from pathlib import Path

import cv2
import numpy as np

# The upstream tool is a script, not a package; point at a checkout.
REMOVER_DIR = Path(os.environ.get(
    "NBLM_REMOVER_DIR",
    Path.home() / "projects/sdvg/notebooklm-watermark-remover"))

# A region this dark on average is a dark-theme slide.
DARK_MEAN = 110


def _load_remover():
    if not (REMOVER_DIR / "remover.py").is_file():
        raise SystemExit(
            f"remover.py not found under {REMOVER_DIR}. Clone "
            "https://github.com/Albonire/notebooklm-watermark-remover or set "
            "NBLM_REMOVER_DIR.")
    sys.path.insert(0, str(REMOVER_DIR))
    import remover  # noqa: E402
    return remover


def build_remover(remover_mod, padding=12, dilate=2, threshold=12):
    class DualPolarityRemover(remover_mod.WatermarkRemover):
        """Clean light-on-dark marks as well as the dark-on-light ones."""

        @staticmethod
        def _is_dark(roi_bgr):
            return float(cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2GRAY).mean()) < DARK_MEAN

        def _clean_watermark_in_roi(self, roi_bgr):
            if not self._is_dark(roi_bgr):
                return super()._clean_watermark_in_roi(roi_bgr)
            # Inversion is lossless for uint8, so the only thing it changes is
            # which side of the contrast the detector sees.
            flipped = np.subtract(255, roi_bgr, dtype=np.int16).astype(np.uint8)
            cleaned = super()._clean_watermark_in_roi(flipped)
            if cleaned is None:
                return None
            return np.subtract(255, cleaned, dtype=np.int16).astype(np.uint8)

    # The stock thresholds leave a ghost of the wordmark's antialiased edges on
    # dark slides, which a 1fps render holds on screen for seconds. Widen the
    # mask a little; the region is a corner of background, so over-reaching
    # costs nothing.
    cfg = remover_mod.WatermarkConfig()
    cfg.watermark_padding = padding
    cfg.dilate_iterations = dilate
    cfg.pixel_threshold = threshold
    return DualPolarityRemover(cfg)


def clean(pdf_in: Path, pdf_out: Path) -> bool:
    remover_mod = _load_remover()
    engine = build_remover(remover_mod)
    tmp = pdf_out.with_suffix(".tmp.pdf")
    ok = engine.process_pdf(str(pdf_in), str(tmp))
    if not ok or not tmp.is_file():
        if tmp.exists():
            tmp.unlink()
        return False
    shutil.move(str(tmp), str(pdf_out))
    return True


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("pdf")
    p.add_argument("-o", "--output", default="",
                   help="defaults to <name>_clean.pdf next to the input")
    args = p.parse_args(argv)

    src = Path(args.pdf).expanduser()
    if not src.is_file():
        print(f"not a file: {src}", file=sys.stderr)
        return 1
    dst = Path(args.output).expanduser() if args.output else \
        src.with_name(f"{src.stem}_clean.pdf")
    if not clean(src, dst):
        print(f"could not clean {src}", file=sys.stderr)
        return 1
    print(dst)
    return 0


if __name__ == "__main__":
    sys.exit(main())
