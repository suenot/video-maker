# Shorts frame specification

Generate deterministic vector-style diagrams with Pillow at **1080 × 1920**.
Use the exact `visible.headline`, `visible.subhead`, and `visible.labels` for each
language and scene in [`narration-manifest.json`](narration-manifest.json). Do not
invent or translate on-image copy. Follow the eight scene meanings in
[`semantic-scenes.md`](semantic-scenes.md).

Use the desktop blue-and-cream palette and symbol meanings. Put **all critical
text and diagrams inside `x=80..850, y=180..1430`**. Leave the right side and
bottom area quiet for Shorts interface controls and captions. Put the title at
`y≈190`, subhead below it, and one large diagram panel at `y≈475..1370`.
Stack comparisons vertically. Use wide labels that can be read on a phone.

The order book stays consistent across the buy scenes: asks are 3 at 101,
4 at 102, and 3 at 104; best bid 100. Market's illustrative average is 102.3;
limit fills seven and may rest three; crossing post-only may be canceled or
rejected. The sell-stop example has a trigger at 99 and next bid at 96. IOC
fills seven and cancels three; FOK fills zero. These quantities must never be
drawn as a promise of real-venue execution.

Export exactly `slide_001.png` through `slide_008.png` in scene order, plus a
separate `cover.png` and a contact-only `endcard.png`.
