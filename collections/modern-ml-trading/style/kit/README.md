# Greenhouse Lab kit

This is a reusable code-only drawing kit for the "Modern ML for Trading" collection. The style rules are in `../STYLE.md`.
It uses plain browser JS with no modules. Each file attaches to the global `LK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`.
The architecture matches the crab kit (`complex-arbitrage-rust/style/kit`), so the two kits can be learned once; the art direction is its own.

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack`, the beat grid `G.BPM`, `G.BARS`, `at(bar, beat)`, `pulse`, `beatIndex`, and the boil clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `LK.P` colours and `LK.FONT` stacks (the only place they are defined) |
| `10_ink.js` | `begin`, camera `applyCam(ctx, parallax)`, `toScreen`; the dip-pen `brush` (open lines) and `ring` (closed contours), `stipple` halftone, `shape` (fill + shade band + dots + rim + boiled outline), `line`, `dot`, `hose` (rubber-hose limb), `text`, `glow`; point generators `ellipsePts`, `blobPts`, `rectPts`, `rrectPts`, `sample` |
| `30_world.js` | set: `labWall` (deco wallpaper, wainscot), `archWindow`, `pipe`, `bench`, `shelf`, `lamp`; props: `pot`, `leaf`, `seed`, `flask`, `beaker`, `shears`, `magnifier`, `wateringCan`; effects: `sparkle`, `medal`, `sunburst`, `puff`, `check`, `cross` |
| `40_owl.js` | `owl(ctx, x, y, s, pose)` with squash/stretch, head `yaw` swivel and `tilt`, pie-cut eyes, blink / wink, brows, beak mouths, tufts, rubber-hose IK arms that stretch, gloves (`glove`) with props via `hold`; `blinkAt(t, seed)` |
| `50_explainer.js` | `decoFrame`, `plate` + `plateMap`, `tube` / `tubePoint`, `tag`, `gauge`, `card`, `board`, `packets`, `typewriter`, `treePlant`, `netVine`, `marquee` |
| `fonts/` | local woff2 (Oswald, Alegreya Sans, IBM Plex Mono, Noto Serif SC/TC subsets) plus `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `assets/logo.svg` | marketmaker.cc mark (`fill="currentColor"`), inlined by `build.py` at `<!--__LOGO__-->` |
| `vendor/gsap.min.js` | GSAP 3.14.2 (local, no CDN) |

## Using the kit in an episode

1. Create the project: `npx hyperframes init episodes/<slug>/video --non-interactive --example=blank`.
2. Copy `intro/tools/shell.html` to `<project>/tools/shell.html`. Change `data-duration`, drop the title variables if you do not need them, and keep the `/*__FONTS__*/`, `/*__SCRIPT__*/` and `<!--__LOGO__-->` markers, the canvas, `#grain`, `#flick`, `#vig`, `#logo` and `#preload`.
3. Write scenes in `<project>/src/NN_*.js`. They are concatenated after the kit in name order inside one IIFE. A minimal scene:

   ```js
   const K = LK, P = K.P, at = K.at, DUR = 60;
   const ctx = document.getElementById("cv").getContext("2d");
   const cam = K.mkTrack([[0, { x: 960, y: 540, z: 1 }], [at(4), { x: 1300, y: 600, z: 0.9 }]]);
   function render(t) {
     K.begin(ctx, t, Object.assign({ rot: 0 }, cam(t)));
     K.applyCam(ctx, 0.9); K.labWall(ctx, -400, 2800, { dado: 560 });
     K.applyCam(ctx, 1); K.bench(ctx, -400, 2800, 780);
     K.plate(ctx, 800, 360, 680, 430, [{ data: [0.2, 0.4, 0.35, 0.7], color: P.leaf }], { a: K.inv(at(1), at(1) + 0.4, t), draw: K.inv(at(1), at(2), t) });
     K.owl(ctx, 1400, 780, 1.2, { blink: K.blinkAt(t, 1), squash: 0.07 * K.pulse(t, 1), wingR: { x: 150, y: -300, hand: "point" } });
   }
   const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
   Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
   TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
   render(0);
   window.__timelines["main"] = TL;
   ```

4. Build, then check: `python3 style/kit/tools/build.py <project>` and `cd <project> && npx hyperframes lint && npx hyperframes check`.
5. Snapshot and look at the frames (`intro/tools/snap.sh "0.5,1.5,..."`). Render with `npx hyperframes render --quality high --output renders/x.mp4`.

`style/gallery/` is a 4-second project that shows every explainer primitive and the owl. Rebuild and snapshot it after you change the kit.

## Rules the kit relies on

- **Pure function of time.** Draw everything inside `render(t)` from `t` alone. No `Math.random`, `Date.now` or `performance.now`, and no state carried between frames.
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions, IK targets and text read `t` directly.
- **Appear parameter.** Every explainer takes `a` from 0 to 1 and pops with a back ease; feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)`.
- **Retime to music** by setting `K.G.BPM` and `K.G.BARS` (measured downbeats) before any `K.at` call. Never hard-code seconds in a scene.
- **Owl arms are targets.** Key `[time, x, y, hand, hold]` in owl-local space (see `intro/src/30_owl.js` `armAt`); the IK and the rubber-hose stretch do the rest.
- **Localised text** belongs in DOM elements fed by HyperFrames variables. The canvas world holds numbers, icons and code only.
