# Noir fox kit

This is a reusable code-only drawing kit for the "Causality & Lead-Lag in Markets" collection. The style rules are in `../STYLE.md`.
It uses plain browser JS with no modules. Each file attaches to the global `CK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`.

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack` (monotone Hermite keys), the beat grid `G.BPM`, `G.BARS`, `at(bar, beat)`, `pulse(t, everyBeats)`, and the boil clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `CK.P` colours and `CK.FONT` stacks (the only place they are defined) |
| `10_ink.js` | frame setup `begin(ctx, t, cam)`, the camera `applyCam(ctx, parallax)`, `toScreen`; `shape` (fill + shadow band + hatch + boiled **noir brush** outline), `line` (`taper: false` for even width), `dot`, `hatch`, `text` (never boils), `glow`, and the point generators `ellipsePts`, `blobPts`, `rectPts` |
| `30_world.js` | street set: `nightSky`, `moon`, `skyline` (far / near), `street` (wet road + reflections), `lamp`, `cone`, `pool`, `brickWall`, `rain` (screen space), `ripples`, `puddle`, `fog`, `flash`; office: `blindsWindow`, `blindLight`, `desk`, `deskLamp`; people and props: `suspect`, `limb2`, `lineupWall`, `newspaper` |
| `40_fox.js` | `fox(ctx, x, y, s, pose)` with squash/stretch, two-bone IK paws (`ik2`), blink, lids, brows, mouths, head turn, hat tip, tail, walk cycle, `!`, props (`magnifier`, `flashlight`, `pin`), the giant lens eye (`lensEye`); `blinkAt(t, seed)`; `K.lensPt` / `K.lensR` (screen point and radius of the lens, for iris transitions) |
| `50_explainer.js` | slide content as noir objects: `paw`, `trail`, `pin`, `corkboard`, `node`, `edge` / `edgePoint` / `tag`, `plank`, `ledger`, `slate`, `screenChart` (= `sailChart`), `notice`, `logbook`, `scatter`, `banner`, `magnify` |
| `fonts/` | local woff2 (Yanone Kaffeesatz, Cousine, Noto Serif SC / TC subsets) plus `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `vendor/gsap.min.js` | GSAP 3.14.2 (local, no CDN) |

## Using the kit in an episode

1. Create the project: `npx hyperframes init episodes/<slug>/video --non-interactive --example=blank`.
2. Copy `intro/tools/shell.html` to `<project>/tools/shell.html`. Change `data-duration`, drop the title variables if you do not need them, and keep the `/*__FONTS__*/` and `/*__SCRIPT__*/` markers, the canvas, `#grain`, `#vig` and `#preload`.
3. Write scenes in `<project>/src/NN_*.js`. They are concatenated after the kit in name order, inside one IIFE, so `const` names are shared across your files. A minimal scene:

   ```js
   const K = CK, P = K.P, at = K.at, DUR = 60;
   const ctx = document.getElementById("cv").getContext("2d");
   const cam = K.mkTrack([[0, { x: 960, y: 540, z: 1 }], [at(4), { x: 1300, y: 600, z: 0.85 }]]);
   function render(t) {
     K.begin(ctx, t, Object.assign({ rot: 0 }, cam(t)));
     K.applyCam(ctx, 1);
     K.corkboard(ctx, 960, 540, 1700, 900);
     K.node(ctx, 600, 260, 1, { label: "BTC", color: P.A, a: K.inv(at(0, 1), at(0, 1) + 0.4, t) });
     K.node(ctx, 1300, 300, 1, { label: "ETH", color: P.B, a: K.inv(at(0, 2), at(0, 2) + 0.4, t) });
     K.edge(ctx, [600, 260], [1300, 300], { p: K.inv(at(1), at(1, 2), t), label: "lag 2", sag: 70 });
     K.slate(ctx, 1400, 800, 700, 180, ["F = 9.4,  p < .01"], { a: K.inv(at(2), at(2) + 0.4, t), write: K.inv(at(2), at(3), t) });
     K.screen(ctx);
     K.fox(ctx, 260, 1180, 1.3, { blink: K.blinkAt(t, 1), squash: 0.07 * K.pulse(t, 1), hold: "magnifier", pawR: { x: 150, y: -280, rot: -30 } });
     K.rain(ctx, t);
   }
   const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
   Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
   TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
   render(0);
   window.__timelines["main"] = TL;
   ```

4. Build, then check: `python3 style/kit/tools/build.py <project>` and `cd <project> && npx hyperframes lint && npx hyperframes check`.
5. Snapshot and look at the frames (`intro/tools/snap.sh` shows the loop). Render with `npx hyperframes render --quality high --output renders/x.mp4` (`intro/tools/render_all.sh` renders all four languages).

`style/gallery/` is a 6-second project that shows every explainer primitive (two pages). Rebuild and snapshot it after you change the kit, to catch regressions.

## Rules the kit relies on

- **Pure function of time.** Draw everything inside `render(t)` from `t` alone. No `Math.random`, `Date.now` or `performance.now`, and no state carried between frames (`K.lensPt` is written and read inside the same frame).
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions, rain and text read `t` directly.
- **Appear parameter.** Every explainer takes `a` from 0 to 1 and pops with a back ease. Feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)` so pops land on the beat.
- **Retime to music** by setting `K.G.BPM` and `K.G.BARS` (measured downbeats) before any `K.at` call. Never hard-code seconds in a scene.
- **Light is the storyteller.** Reveal with a lamp, flashlight beam (darkness mask with a cone cut out, see `intro/src/50_board.js`), lightning or the marquee, not with fades.
- **Localised text** belongs in DOM elements fed by HyperFrames variables. The canvas world holds tickers, numbers and symbols only.
- Long episodes: split the film into scene functions and select by time in `render`; use the diegetic transitions in `intro/src/70_render.js` (newspaper spin, magnifier iris, whip pan, venetian blinds).
