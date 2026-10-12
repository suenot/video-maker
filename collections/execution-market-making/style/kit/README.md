# Clockwork Station kit

A reusable code-only drawing kit for the "Execution & Market Making" collection. The style rules are in `../STYLE.md`.
It uses plain browser JS with no modules. Each file attaches to the global `SK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`.
The architecture is the same as the Arbitrage Crab kit (`complex-arbitrage-rust/style/kit/`); the drawing layer, world, mascot and fonts are this collection's own.

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack` (monotone Hermite keys), beat grid `G.BPM`, `G.BARS`, `at(bar, beat)`, `pulse`, boil clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `SK.P` colours and `SK.FONT` stacks (the only place they are defined) |
| `10_print.js` | `begin`, camera `applyCam(ctx, parallax)` (relative to `K.REF`), `toScreen`; screen-print `shape` (out-of-register colour plate + shade band + halftone + key line), `line`, `dot`, `halftone`, `star`, `rays`, `text` (never boils); point generators `ellipsePts`, `rrectPts`, `rectPts`, `polyPts`, `arcPts`, `blobPts` |
| `30_world.js` | `sky`, `cloud`, `hills`; `gear`, `clockFace`, `clockTower`; `platform`, `track`, `lampPost`; `wheel`, `crate` (grid slicing), `wagon`, `loco` (cab callback), `puff`; `pond`, `ripple`, `splash`; `coin`, `booth`, `gauge` |
| `40_mouse.js` | `mouse(ctx, x, y, s, pose)` with squash/stretch, IK arms (`ik2`), blink, mouths incl. whistle, cheek puff, ear flick, tail, cap tip, props (`pocketWatch`, `whistle`, flag, thumb, point), `!`; `blinkAt` |
| `50_explainer.js` | `flap` / `flapChar`, `board`, `plaque`, `poster`, `tickets`, `teletype`, `stop` / `route` / `routePoint`, `tag`, `sign`, `popS` |
| `fonts/` | local woff2 (Jost, IBM Plex Mono, CJK subsets) + `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `vendor/gsap.min.js` | GSAP 3.14.2 (local, no CDN) |

## Using the kit in an episode

1. Create the project: `npx hyperframes init episodes/<slug>/video --non-interactive --example=blank`.
2. Copy `intro/tools/shell.html` to `<project>/tools/shell.html`. Change `data-duration`, drop the title variables and audio if you do not need them, and keep the `/*__FONTS__*/` and `/*__SCRIPT__*/` markers, the canvas, `#grain`, `#vig` and `#preload`.
3. Write scenes in `<project>/src/NN_*.js`. They are concatenated after the kit in name order, inside one IIFE, so `const` names are shared across your files. A minimal scene:

   ```js
   const K = SK, P = K.P, at = K.at, DUR = 60;
   const ctx = document.getElementById("cv").getContext("2d");
   const cam = K.mkTrack([[0, { x: 960, y: 540, z: 1 }], [at(4), { x: 1300, y: 600, z: 0.85 }]]);
   function render(t) {
     K.begin(ctx, t, Object.assign({ rot: 0 }, cam(t)));
     K.applyCam(ctx, 0.3); K.sky(ctx, { horizon: 780, sun: [1500, 250] });
     K.applyCam(ctx, 1);
     K.track(ctx, -500, 3000, 900);
     K.plaque(ctx, 200, 120, 760, 200, ["x(t) = X·(1 - t/T)"], { a: K.inv(at(1), at(1) + 0.4, t), write: K.inv(at(1), at(2), t) });
     K.mouse(ctx, 1500, 900, 1.2, { blink: K.blinkAt(t, 1), squash: 0.06 * K.pulse(t, 1, 6), handR: { x: 100, y: -200, hold: "point" } });
   }
   const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
   Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
   TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
   render(0);
   window.__timelines["main"] = TL;
   ```

4. Build, then check: `python3 style/kit/tools/build.py <project>` and `cd <project> && npx hyperframes lint && npx hyperframes check`.
5. Snapshot and look at the frames (`intro/tools/snap.sh "1,2,3"`, then `intro/tools/sheet.sh`). Render with `npx hyperframes render --quality high --output renders/x.mp4`.

`style/gallery/` is a 6-second project that shows every explainer primitive and both mouse poses. Rebuild and snapshot it after you change the kit, to catch regressions.

## Rules the kit relies on

- **Pure function of time.** Draw everything inside `render(t)` from `t` alone. No `Math.random`, `Date.now` or `performance.now`, and no state carried between frames.
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions, flaps and text read `t` directly.
- **Appear parameter.** Explainers take `a` from 0 to 1 and pop with a back ease. Feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)`.
- **Retime to music** by setting `K.G.BPM` and `K.G.BARS` before any `K.at` call. Never hard-code seconds in a scene.
- **Parallax** layers are laid out in world numbers: `applyCam(ctx, p)` is anchored at `K.REF`.
- **Scenes draw on any context.** Write scene functions as `draw(c, t)` so a transition can render both sides into offscreen buffers (see `flapWipe` / `steamWipe` in `intro/src/70_render.js`).
- **Localised text** belongs in DOM elements fed by HyperFrames variables. The canvas world holds tickers, numbers and icons only.
