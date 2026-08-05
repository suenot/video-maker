# Comic production frames

This directory turns the approved warm-comic direction into a complete 15-scene asset pack for later image-to-video work.

- `bases/` contains the clean, text-free scene illustrations.
- `frames/` contains the 1920×1080 delivery pairs: `*-start.jpg` and `*-end.jpg`.
- `scene-manifest.json` is the single source of truth for the exact English visual copy.
- `render_comic_frames.py` applies that copy deterministically, so generated-image lettering never becomes a production dependency.

Seedance / Higgsfield is intentionally out of scope at this stage. For every scene, pass the corresponding `start` and `end` files as the two visual anchors when the animation phase is approved.
