# Generation log

## Visual source

All fresh illustrations were generated with `imagegen`, using the four approved comic frames in `../comic-storyboard/frames/` as visual references. The shared direction was:

> Warm cream paper, pale sage wavy border, cocoa-brown hand-drawn outlines, cyan data flow, amber highlights, coral exceptions, simple white workers and rounded industrial diagrams. Flat editorial comic. No readable lettering. Leave the left 40% quiet for deterministic explanatory copy.

## Scene art

| Scenes | Source |
| --- | --- |
| 01, 02, 04, 06–09, 11–14 | New scene-specific illustrations generated from the shared direction. |
| 03 | Approved `01-attribution.png`. |
| 05 | Approved `02-feedback-orchestration.png`. |
| 10 | Approved `03-measurement-observability.png`. |
| 15 | Approved `04-proof-and-finale.png`. |

## Production transformation

`render_comic_frames.py` crops/upscales every base to 1920×1080 and renders two stable JPEG endpoints:

- `start`: title plus one premise, slightly quieter visual treatment;
- `end`: title plus the three explanatory claims / metrics from `scene-manifest.json`.

This separation is intentional: generated image text is never relied on for the video. The exact English copy, numbers and titles remain editable and reproducible from the manifest.
