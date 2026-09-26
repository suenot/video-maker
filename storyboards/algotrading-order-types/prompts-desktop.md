# Desktop frame specification

Generate deterministic vector-style diagrams with Pillow at **1920 × 1080**.
Use the exact `visible.headline`, `visible.subhead`, and `visible.labels` for each
language and scene in [`narration-manifest.json`](narration-manifest.json). Do not
invent or translate on-image copy. No photos, faces, exchange marks, currency
symbols, chart axes, or implied guaranteed execution.

Palette: navy `#082744` background, blue `#123F67` panels, cream `#FBF6E9`
type, light blue `#CDE9F5` secondary type, amber for selected limits, green for
possible fills, and coral for rejected or gap outcomes. Keep large type and
high contrast. The drawings in [`semantic-scenes.md`](semantic-scenes.md) govern
each scene's meaning.

Layout: title near `(120, 91)`, subhead below it, divider at `y=262`, primary
diagram in `x=120..1800, y=350..965`. Use a consistent frame across all eight
scenes. Keep the weighted average, partial remainder, crossed post-only order,
trigger gap, and IOC/FOK results visually distinct.

Export exactly `slide_001.png` through `slide_008.png` in scene order, plus a
separate `cover.png` and a contact-only `endcard.png`. The cover uses the hook
wording but a different composition; it does not replace scene 001.
