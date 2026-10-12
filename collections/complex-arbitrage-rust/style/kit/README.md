# Arbitrage Crab kit

This is a reusable code-only drawing kit for the "Complex Arbitrage in Rust" collection. The style rules are in `../STYLE.md`.
It uses plain browser JS with no modules. Each file attaches to the global `CK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`.

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack` (monotone Hermite keys), the beat grid `G.BPM`, `G.OFFSET`, `at(bar, beat)`, `pulse(t, everyBeats)`, and the boil clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `CK.P` colours and `CK.FONT` stacks (the only place they are defined) |
| `10_ink.js` | frame setup `begin(ctx, t, cam)`, the camera `applyCam(ctx, parallax)`, `toScreen`; `shape` (fill + shade band + hatch + boiled broken outline), `line`, `dot`, `hatch`, `text` (never boils), `glow`, and the point generators `ellipsePts`, `blobPts`, `rectPts` |
| `30_world.js` | side set: `sideSky`, `sideSea`, `waveRow`, `cloud`, `farIsland`, `gull`; chart set: `chartSea`, `island`, `palm`, `lighthouse`; `ship` (iron, riveted, funnel, sail with cog, helm; it carries the crab via a callback), `miniShip` (with wake), `coin`, `goldBit`, `coinPile`, `sparkle`, `cog` |
| `40_crab.js` | `crab(ctx, x, y, s, pose)` with squash/stretch, a `talk` mouth (0..1, narration sync), two-bone IK claws (`ik2`), blink, mouths, brows, eye pop, cap tip, hop with tucked legs, spyglass, `!`; `blinkAt(t, seed)`; `K.lens` (screen point of the spyglass, for iris transitions) |
| `42_parrot.js` | `parrot(ctx, x, y, s, pose)` (Pip, the first mate: `talk`, `wingL/R`, `head` tilt, blink, `!`) and `perch` |
| `50_explainer.js` | slide content as world objects: `node`, `edge` (optional `arrow` on plain routes) / `edgePoint` / `tag`, `plank`, `ledger`, `slate`, `sailChart`, `notice`, `logbook`, `banner` |
| `fonts/` | local woff2 (Rubik, JetBrains Mono, CJK subsets) plus `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `vendor/gsap.min.js` | GSAP 3.14.2 (local, no CDN) |

## Using the kit in an episode

1. Create the project: `npx hyperframes init episodes/<slug>/video --non-interactive --example=blank`.
2. Copy `intro/tools/shell.html` to `<project>/tools/shell.html`. Change `data-duration`, drop the title variables if you do not need them, and keep the `/*__FONTS__*/` and `/*__SCRIPT__*/` markers, the canvas, `#grain`, `#vig` and `#preload`.
3. Write scenes in `<project>/src/NN_*.js`. They are concatenated after the kit in name order, inside one IIFE, so `const` names are shared across your files. A minimal scene:

   ```js
   const K = CK, P = K.P, at = K.at, DUR = 60;
   const ctx = document.getElementById("cv").getContext("2d");
   const cam = K.mkTrack([[0, { x: 960, y: 540, z: 1 }], [at(4), { x: 1300, y: 700, z: 0.8 }]]);
   function render(t) {
     K.begin(ctx, t, Object.assign({ rot: 0 }, cam(t)));
     K.applyCam(ctx, 1);
     K.chartSea(ctx);
     K.node(ctx, 300, 900, 0.9, { label: "USDT", color: P.USDT, a: K.inv(at(0, 1), at(0, 1) + 0.45, t) });
     K.slate(ctx, 1300, 400, 700, 200, ["w = -ln(rate)"], { a: K.inv(at(1), at(1) + 0.4, t), write: K.inv(at(1), at(2), t) });
     K.crab(ctx, 1600, 1000, 1, { blink: K.blinkAt(t, 1), squash: 0.1 * K.pulse(t, 1) });
   }
   const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
   Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
   TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
   render(0);
   window.__timelines["main"] = TL;
   ```

4. Build, then check: `python3 style/kit/tools/build.py <project>` and `cd <project> && npx hyperframes lint && npx hyperframes check`.
5. Snapshot and look at the frames (`intro/tools/snap.sh` shows the loop). Render with `npx hyperframes render --quality high --output renders/x.mp4`.

`style/gallery/` is a 6-second project that shows every explainer primitive. Rebuild and snapshot it after you change the kit, to catch regressions.

## Rules the kit relies on

- **Pure function of time.** Draw everything inside `render(t)` from `t` alone. No `Math.random`, `Date.now` or `performance.now`, and no state carried between frames (`K.lens` is written and read inside the same frame).
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions and text read `t` directly.
- **Appear parameter.** Every explainer takes `a` from 0 to 1 and pops with a back ease. Feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)` so pops land on the beat.
- **Retime to music** by setting `K.G.BPM` and `K.G.BARS` (measured downbeats) before any `K.at` call. Never hard-code seconds in a scene.
- **Localised text** belongs in DOM elements fed by HyperFrames variables. The canvas world holds tickers, numbers and icons only.
- Long episodes: split the film into scene functions (`drawScene3(t)`), and select by time in `render`. Use diegetic transitions (iris, wave wipe) as in `intro/src/70_render.js`.
