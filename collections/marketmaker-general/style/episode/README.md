# Episode layer: marketmaker-general (Otto + Puff, Coral Exchange)

Files (concatenated after the kit, see `collections/_episode/README.md`):
- `65_host.js`: `HOST.duo(ctx, g, o)`, thin adapter over the kit's `K.duo` (Otto = host A, Puff = host B).
- `66_signs.js`: `SIGN.chapter / note / stamp` (cream cards, coral tab, kelp ropes).
- `67_reef.js`: `REEF.draw(ctx, g, o)` backdrop (ocean, rays, bubbles, parallax coral and kelp, sand).
- `68_transitions.js`: replaces the engine `TR`: "wave" = coral tide wall with a bubble curtain, "iris" = brass porthole to deep navy.
- `template/50_scene.js`: scene template (REEF, bullets, chapter sign, duo with point/carry/react).

## What a builder calls
`REEF.draw` first, then `K.applyCam` + world/explainer objects, then `K.screen`, signs, `HOST.duo` last.
`HOST.duo` options match the crab layer (`x y s side point pointAmt ppoint ppointAmt reacts preacts carryR/carryL a`), plus `corner`, `skin`, `stage`, `puff`.
- Defaults: `s 0.9` (Otto about 380 px tall), bottom-left, **Puff on the left edge side, Otto's pointing arm free to the right**. Bottom-right: `corner: "right"` (side 1, x 1220). The duo column is about 640 px wide: keep boards out of it (bottom-left: content x from 1000).
- `reacts` (Otto): surprise grin worry shrug thumbs jump spyglass nod think wave cheer. `preacts` (Puff): surprise flap worry grin think nod shrug wave. Crab kinds are mapped to the nearest Otto/Puff act (worry = shrug, jump = surprise). One act per host at a time: the strongest wins; a raised point suppresses grin/nod/shrug.
- `carryL/carryR`: fn(ctx, x, y, g) drawn at Otto's outer arm tip (the arm away from Puff). Draw centred on x, y; the tip wraps over it.
- Returns screen points `{otto, puff, head, tips, handR, handL, outer, inner}` (arm tips are `[x, y]`).
- Mouths and gestures come from `NR.talk / NR.who / NR.accent`; the quiet host looks at the speaker and nods.

## Gotchas
- `REEF.draw` clears the canvas first: the kit's `K.ocean` leaves a strip at the right edge uncovered, and the wave transition then bleeds into later frames. Any other backdrop must clear too.
- The kit panel tab title is 30 px; for 28 px+ text on screen use `size >= 40` in `K.bullets`.
- Voices: host A = the explainer. In bill-williams that is the HIGHER voice (174 Hz, more words); check each episode by median F0 in `data/sync.json` hosts, not by "lower = mascot".
- No `Math.random`; the reef uses kit hashes only.
