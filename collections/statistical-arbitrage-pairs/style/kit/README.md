# Vaudeville kit

A reusable code-only drawing kit for the "Statistical Arbitrage & Pairs Trading" collection. The style rules are in `../STYLE.md`.
It uses plain browser JS with no modules. Each file attaches to the global `VK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`.
The architecture matches the crab kit (`complex-arbitrage-rust/style/kit`): core / palette / ink / world / mascot / explainer, beat grid with measured `K.G.BARS`, and `build.py`.

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack`, the beat grid `G.BPM`, `G.BARS`, `at(bar, beat)`, `pulse`, `beatIndex`, and the boil clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `VK.P` (the grey ladder + gold) and `VK.FONT` stacks (the only place they are defined) |
| `10_ink.js` | `begin(ctx, t, cam)` (also sets the film gate weave), `applyCam(ctx, parallax)`, `screen`, `toScreen`; `shape` (fill + shade band + shine crescent + even ink outline), `brush` (tapered ribbon), `line`, `hose` (rubber-hose limb), `dot`, `text` (never boils), `glow`, `twinkle`; point generators `ellipsePts`, `blobPts`, `rectPts`, `roundPts` |
| `20_film.js` | the projector: `film(ctx, t)` (flicker, scratches, dust, hairs, vignette), `iris(ctx, cx, cy, r)`, `irisT` |
| `30_stage.js` | the house: `backdrop`, `floor`, `footlights`, `curtain`, `valance`, `proscenium`, `bulbs`, `spot`, `piano` (keys, sheet music, tip jar), `stool`, `gauge` (the z-meter), `spring` (the spread), `coin`, `coinRain`, `bell`, `note` |
| `40_cat.js` | `cat(ctx, x, y, s, pose)` (Dapper Dan) with squash/stretch, IK gloves (`ik2`), pie-cut eyes (`pieEye`), wink, mouths, bowler (`bowler`), hat in hand, tail, `!`; `glove`; `blinkAt(t, seed)` |
| `45_penguin.js` | `penguin(ctx, x, y, s, pose)` (top hat = rich, boater = cheap), tap shoes, flippers, gold heart; `penguinWaist` (spring anchor) |
| `50_explainer.js` | slide content as props: `intertitle`, `easel`, `playbill`, `screenChart`, `ticket`, `hangTag`, `typewriter`, `marquee` |
| `fonts/` | local woff2 (Playfair Display, Oswald, IBM Plex Mono, Noto Serif SC/TC subsets) plus `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `vendor/gsap.min.js` | GSAP 3.14.2 (local, no CDN) |

## Using the kit in an episode

1. Create the project: `npx hyperframes init episodes/<slug>/video --non-interactive --example=blank`.
2. Copy `intro/tools/shell.html` to `<project>/tools/shell.html`. Change `data-duration`, drop the title variables if you do not need them, and keep the `/*__FONTS__*/` and `/*__SCRIPT__*/` markers, both canvases (`#cv` for the scene, `#fx` for the projector), `#grain` and `#preload`.
3. Write scenes in `<project>/src/NN_*.js`. They are concatenated after the kit in name order, inside one IIFE. A minimal scene:

   ```js
   const K = VK, P = K.P, at = K.at, DUR = 60;
   const ctx = document.getElementById("cv").getContext("2d"), fx = document.getElementById("fx").getContext("2d");
   function render(t) {
     K.begin(ctx, t, { x: 960, y: 540, z: 1 }); K.applyCam(ctx, 1);
     K.backdrop(ctx); K.floor(ctx);
     K.intertitle(ctx, 960, 360, 900, 260, ["z = (S − μ) / σ"], { a: K.inv(at(1), at(1) + 0.4, t), write: K.inv(at(1), at(2), t) });
     K.cat(ctx, 520, 990, 1, { blink: K.blinkAt(t, 1), squash: 0.07 * K.pulse(t, 1) });
     K.curtain(ctx, -1, 1); K.curtain(ctx, 1, 1);
     K.begin(fx, t, K.cam); fx.clearRect(0, 0, 1920, 1080); K.film(fx, t);
   }
   const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
   Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
   TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
   render(0);
   window.__timelines["main"] = TL;
   ```

4. Build, then check: `python3 style/kit/tools/build.py <project>` and `cd <project> && npx hyperframes lint && npx hyperframes check`.
5. Snapshot and look at the frames (`intro/tools/snap.sh`, `intro/tools/snap_lang.sh` for a title in another language). Render with `intro/tools/render_all.sh` as a model.

`style/gallery/` is a 6-second project that shows every explainer primitive on the stage. Rebuild and snapshot it after you change the kit.

## Rules the kit relies on

- **Pure function of time.** Draw everything inside `render(t)` from `t` alone. No `Math.random`, `Date.now` or `performance.now`, no state carried between frames.
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions and text read `t` directly. The film weave is per boil frame and applies to everything.
- **Appear parameter.** Every explainer takes `a` from 0 to 1 and pops with a back ease. Feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)`.
- **Retime to music** with `K.G.BPM` and `K.G.BARS` before any `K.at` call. Never hard-code seconds in a scene.
- **One accent.** Only gold may carry hue, and only for money and the signal.
- **Localised text** belongs in DOM elements fed by HyperFrames variables. The canvas holds numbers, symbols and icons only. DOM text above `#fx` would escape the iris, so the title sits between `#cv` and `#fx` and carries `data-layout-allow-occlusion`.
- `K.roundPts` subdivides its straight edges; Catmull-Rom smoothing overshoots when a long edge sits between tightly packed points, so give long shapes evenly spaced points.
