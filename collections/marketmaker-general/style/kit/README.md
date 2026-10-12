# Coral Exchange kit (marketmaker-general)

A reusable code-only drawing kit for the channel-wide Marketmaker style. The style rules are in `../STYLE.md`.
Plain browser JS, no modules. Each file attaches to the global `MK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`.
The architecture is the same as the crab kit (`complex-arbitrage-rust/style/kit/`); the art direction, world, mascot and primitives are new.

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack`, the beat grid `G.BPM`, `G.BARS`, `at(bar, beat)`, `pulse`, `beatIndex`, and the boil clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `MK.P` colours and `MK.FONT` stacks (the only place they are defined) |
| `10_ink.js` | camera `begin` / `applyCam(ctx, parallax)` / `screen` / `toScreen`; `shape` (flat fill + `shade` band + `hi` highlight + halftone `dots` + sticker `drop` + clean navy outline), `line`, `tube`, `dot`, `halftone`, `text` (never boils), `glow`; point generators `ellipsePts`, `blobPts`, `rrectPts` (sharp-edged rounded rects), `rectPts` |
| `30_world.js` | `ocean` (flat bands), `rays`, `surface`, `sun`, `bubble` / `bubbles` / `bubbleBurst`, `sand`, `kelp`, `coralBranch`, `coralFan`, `brainCoral`, `rock`, `starfish`, `tower` (coral exchange tower with ticker strip), `clamDesk` (`part: back/front`), `fish` (4 species, can carry a card), `card` (bid / ask / up / down / sun / plain), `coin`, `sparkle`, `inkCloud`, `mix` |
| `40_octo.js` | `octo(ctx, x, y, s, pose)`: Otto with 8 tapered sucker arms posed by tip targets, held cards/props, squash, hop, blink/wink, mouths, brows, glasses glint, `!`, skin colour shift; `OCTO_REST`, `octoTips` (world tips after a draw), `blinkAt`, `SKIN`, `skinMix` |
| `50_explainer.js` | `panel`, `chart` (+ `genCandles`, `sma`, `alligator`, `ao`, `fractals`), `attractor`, `manifold`, `formula`, `table`, `bullets`, `code`, `book`, `badge`, `titlePlate`, `popS` |
| `fonts/` | Unbounded 700/900, Manrope 600/800, Roboto Mono 500/700 (Latin + Cyrillic), Noto Sans SC/TC 900 subsets; `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `vendor/gsap.min.js` | GSAP 3.14.2 (local, no CDN) |

## Using the kit in an episode

1. Create the project: `npx hyperframes init <collection>/episodes/<slug>/video --non-interactive --example=blank`.
2. Copy `intro/tools/shell.html` to `<project>/tools/shell.html`. Change `data-duration` and the audio, keep the `/*__FONTS__*/` and `/*__SCRIPT__*/` markers, the canvas, `#grain`, `#vig`, `#preload` (and `#title` if you use the DOM title).
3. Write scenes in `<project>/src/NN_*.js`. They are concatenated after the kit in name order, inside one IIFE, so `const` names are shared across your files. Minimal scene:

   ```js
   const K = MK, P = K.P, at = K.at, DUR = 60;
   const ctx = document.getElementById("cv").getContext("2d");
   function render(t) {
     K.begin(ctx, t, { x: 960, y: 540, z: 1 });
     K.ocean(ctx, { depth: 0.5 }); K.rays(ctx);
     K.applyCam(ctx, 1);
     K.sand(ctx, 1000);
     K.chart(ctx, 800, 480, 1200, 760, { a: K.inv(at(1), at(1) + 0.4, t), candles: K.genCandles(40, 3, 100, 1.2, 0.05), draw: K.inv(at(1), at(3), t), title: "BTC 1h" });
     K.octo(ctx, 1590, 1000, 0.74, { blink: K.blinkAt(t, 1), talk: voice(t), arms: [null, null, { x: -260, y: -420, bend: -40 }, null, null, null, null, null] });
   }
   const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
   Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
   TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
   render(0);
   window.__timelines["main"] = TL;
   ```

4. Build and check: `python3 <collection>/style/kit/tools/build.py <project>`, then `npx hyperframes lint && npx hyperframes check` in the project.
5. Snapshot and look (`intro/tools/snap.sh`, `intro/tools/sheet.sh`). Render with `npx hyperframes render --quality high --output renders/x.mp4`.

`style/gallery/` is a 6-second project showing every explainer primitive. Rebuild and snapshot it (`style/gallery/tools/snap.sh "4.5"`) after kit changes.

## Rules the kit relies on

- **Pure function of time.** Draw everything in `render(t)` from `t` alone. No `Math.random`, `Date.now`, `performance.now`; no state across frames (`K.octoTips` is written and read in the same frame).
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions and text read `t`.
- **Appear parameter.** Every explainer takes `a` 0..1 and pops with a back ease; feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)`.
- **Retime to music** by setting `K.G.BPM` and `K.G.BARS` before any `K.at` call. Never hard-code seconds in a scene.
- **Colour semantics**: `bid` blue = buy side, `ask` coral = sell side, `sun` = the spread / the highlight, `lilac` = chaos.
- Long episodes: one function per scene, picked by time in `render`; bubble curtain or ink cloud between scenes (see `intro/src/20_reef.js`, `70_render.js`).
