# Bazaar kit

This is a reusable code-only drawing kit for the "Order Book & Market Microstructure" collection. The style rules are in `../STYLE.md`.
It uses plain browser JS with no modules. Each file attaches to the global `BK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`.
The architecture is the same as the crab kit (`complex-arbitrage-rust/style/kit`), so scenes port between collections; the drawing layer is different.

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack` (monotone Hermite keys), the beat grid `G.BPM` (152), `G.BARS`, `at(bar, beat)`, `pulse(t, everyBeats)`, and the boil clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `BK.P` colours and `BK.FONT` stacks (the only place they are defined) |
| `10_ink.js` | camera `begin` / `applyCam` / `toScreen`; woodcut `shape` (misregistered colour block + pattern + shade band + gouge + specks + knotty key line), `line`, `dot`, `gouge`, `pattern` (stripes, zigzag, dots, diamonds), `specks`, `text` (never boils), `glow`; point generators `ellipsePts`, `blobPts`, `rectPts`, `archPts` |
| `30_world.js` | `sky` (flat bands + `sunRosette`), `city` (domes, towers, arches), `bunting`, `lantern`, `lanternString`, `crate`, `stall` (shutter, awning, plaque with flip / ping, crate queue), `slotX`, `tower` (the whole book from data), `coin`, `sparkle`, `cart`, `rug` (kilim with roll) |
| `40_raccoon.js` | `raccoon(ctx, x, y, s, pose)` with squash/stretch, two-bone IK paws (`ik2`), paw poses, blink, mouths, brows, mask, fez + tassel, ringed tail, `!`; `abacus`; `blinkAt(t, seed)` |
| `50_explainer.js` | slide content as bazaar objects: `tag`, `shout`, `arrow`, `depthHills`, `signboard`, `rugTable`, `tileBoard`, `scrollChart` (line, bar, candle), `priceList`, `codeScroll`, `kilimBanner` |
| `fonts/` | local woff2 (Yeseva One, Fira Sans Condensed, PT Mono, Noto Serif SC/TC subsets) plus `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `vendor/gsap.min.js` | GSAP 3.14.2 (local, no CDN) |

## Using the kit in an episode

1. Create the project: `npx hyperframes init episodes/<slug>/video --non-interactive --example=blank`.
2. Copy `intro/tools/shell.html` to `<project>/tools/shell.html`. Change `data-duration`, drop the title variables if you do not need them, and keep the `/*__FONTS__*/` and `/*__SCRIPT__*/` markers, the canvas, `#grain`, `#vig` and `#preload`.
3. Write scenes in `<project>/src/NN_*.js`. They are concatenated after the kit in name order, inside one IIFE. A minimal scene:

   ```js
   const K = BK, P = K.P, at = K.at, DUR = 60;
   const ctx = document.getElementById("cv").getContext("2d");
   const cam = K.mkTrack([[0, { x: 0, y: 0, z: 0.55 }], [at(4), { x: -200, y: 100, z: 1 }]]);
   function render(t) {
     K.begin(ctx, t, Object.assign({ rot: 0 }, cam(t)));
     K.screen(ctx); K.sky(ctx, -20, -20, 1940, 1100);
     K.applyCam(ctx, 1);
     K.tower(ctx, 0, 0, { asks: [{ p: "101.26", q: 4 }], bids: [{ p: "101.25", q: 5 }], gap: 90 });
     K.tileBoard(ctx, 900, -300, 640, 160, ["spread = ask - bid"], { a: K.inv(at(1), at(1) + 0.4, t), write: K.inv(at(1), at(2), t) });
     K.raccoon(ctx, -800, 100, 1.2, { blink: K.blinkAt(t, 1), squash: 0.07 * K.pulse(t, 1), hold: "abacus" });
   }
   const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
   Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
   TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
   render(0);
   window.__timelines["main"] = TL;
   ```

4. Build, then check: `python3 style/kit/tools/build.py <project>` and `cd <project> && npx hyperframes lint && npx hyperframes check`.
5. Snapshot and look at the frames (`intro/tools/snap.sh`; `intro/tools/snap_lang.sh` for other languages). Render with `npx hyperframes render --quality high --variables '{"lang":"ru","title":"..."}' --output renders/x.mp4` (`intro/tools/render_all.sh` does all four).

`style/gallery/` is a 6-second project that shows the world (0 - 3 s) and every explainer primitive (3 - 6 s). Rebuild and snapshot it (`style/gallery/tools/snap.sh "2,5.5"`) after you change the kit.

## Rules the kit relies on

- **Pure function of time.** Draw everything inside `render(t)` from `t` alone. No `Math.random`, `Date.now` or `performance.now`, and no state carried between frames.
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions and text read `t` directly. To freeze a story moment but keep the ink alive, call `K.begin` with the clock and draw with a fixed story time (see `intro/src/70_render.js`, title set).
- **Appear parameter.** Every explainer takes `a` from 0 to 1 and pops with a back ease. Feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)` so pops land on the beat.
- **Retime to music** by setting `K.G.BPM` and `K.G.BARS` (measured downbeats) before any `K.at` call.
- **Localised text** belongs in DOM elements fed by HyperFrames variables. The canvas world holds prices, numbers and icons only.
