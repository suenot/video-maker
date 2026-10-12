# Neon floor kit (Beepo)

This is a reusable code-only drawing kit for the "AI Agents for Trading" collection. The style rules are in `../STYLE.md`.
It uses plain browser JS with no modules. Each file attaches to the global `AK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`.
The architecture matches the crab kit (`complex-arbitrage-rust/style/kit`), so the two are interchangeable in tooling; the art direction is its own.

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack` (monotone Hermite keys), the beat grid `G.BPM`, `G.BARS`, `at(bar, beat)`, `pulse(t, everyBeats)`, the boil clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `AK.P` colours and `AK.FONT` stacks (the only place they are defined) |
| `10_ink.js` | `begin(ctx, t, cam)`, `applyCam(ctx, parallax)`, `toScreen`; `shape` (fill + shade band + neon rim band + halftone dots + gloss + boiled navy outline), `line`, `dot`, `halftone`, `neon` (tube with halo and core), `flick` (stepped neon flicker), `text` (never boils, optional glow), `glow`, `rgba`; point generators `rrPts` (rounded rect), `ellipsePts`, `blobPts`, `rectPts` |
| `20_pixel.js` | `ICONS` + `pix(ctx, name, x, y, cell, color)` pixel icons (eye, fork, bolt, brain, check, cross, up, down, heart, gear, lens, shield, chat, coin, rocket, branch, chart, team, globe, clock, play, harness, dollar); `seg7` / `seg7W` seven-segment digits |
| `30_world.js` | `wall`, `floorGrid` (scrolling synthwave grid), `skyWindow` (striped sun + skyline, `dusk` 0..1), `wallScreen` (bezel monitor with a draw callback), `desk`, `cable` + `polyAt` (signal pulses), `ticket`, `ledTape`, `sparks`, `confetti` |
| `40_robot.js` | `robot(ctx, x, y, s, pose)` for `lead` / `analyst` / `risk` / `trader`; `beepo` shortcut; coil legs, IK hose arms (`ik2`, `hose`, `mitt`, `coil`), CRT face with eyes / mouths / icons / custom screen, antenna bulb, props; `blinkAt`; `K.faceRect` (screen quad of the face, for dives) |
| `50_explainer.js` | `node`, `edge` / `edgePoint` / `tag`, `scoreboard`, `termTable` (+ `termWindow`), `holo`, `monitorChart` + `plot` (line / bar / candle), `taskBoard`, `terminal`, `loopRing`, `neonSign`, `popS` |
| `fonts/` | local woff2 (Russo One, Exo 2, IBM Plex Mono, Press Start 2P, CJK subsets) + `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `vendor/gsap.min.js` | GSAP 3.14.2 (local, no CDN) |
| `logo.svg` | the marketmaker.cc mark (`fill="currentColor"`); `tools/build.py` inlines it at `<!--__LOGO__-->` in a shell |

## Using the kit in an episode

1. Create the project: `npx hyperframes init episodes/<slug>/video --non-interactive --example=blank`.
2. Copy `intro/tools/shell.html` to `<project>/tools/shell.html`. Change `data-duration`, drop the title variables if you do not need them, and keep the `/*__FONTS__*/` and `/*__SCRIPT__*/` markers, the canvas, the `#scan`, `#roll`, `#vig` overlays (before any DOM text) and `#preload`.
3. Write scenes in `<project>/src/NN_*.js`. They are concatenated after the kit in name order, inside one IIFE. A minimal scene:

   ```js
   const K = AK, P = K.P, at = K.at, DUR = 60;
   const ctx = document.getElementById("cv").getContext("2d");
   const cam = K.mkTrack([[0, { x: 960, y: 540, z: 1 }], [at(4), { x: 1200, y: 620, z: 0.9 }]]);
   function render(t) {
     K.begin(ctx, t, Object.assign({ rot: 0 }, cam(t)));
     K.applyCam(ctx, 1);
     K.wall(ctx, -600, 2600, -600, 700); K.floorGrid(ctx, -600, 2600, 700, 900, { scroll: t * 0.5 });
     K.monitorChart(ctx, 700, 380, 760, 380, [{ kind: "candle", data: [[1, 3, 0.5, 2.5], [2.5, 4, 2, 3.6]] }], { a: K.inv(at(0, 1), at(0, 1) + 0.4, t), title: "NVDA" });
     K.beepo(ctx, 1400, 1040, 1, { blink: K.blinkAt(t, 1), squash: 0.08 * K.pulse(t, 1), mouth: "talk", talk: K.pulse(t, 1) });
   }
   const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
   Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
   TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
   render(0);
   window.__timelines["main"] = TL;
   ```

4. Build, then check: `python3 style/kit/tools/build.py <project>` and `cd <project> && npx hyperframes lint && npx hyperframes check`.
5. Snapshot and look at the frames (`intro/tools/snap.sh`). Render with `npx hyperframes render --quality high --output renders/x.mp4` (`intro/tools/render_all.sh` shows the per-language loop).

`style/gallery/` is a 6-second project with every explainer primitive on two boards (snapshot at 2.5 s and 5.5 s). Rebuild and snapshot it after kit changes to catch regressions.

## Rules the kit relies on

- **Pure function of time.** Draw everything in `render(t)` from `t` alone. No `Math.random`, `Date.now`, `performance.now`; no state carried between frames (`K.faceRect` is written and read in the same frame).
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions and text read `t`.
- **Appear parameter.** Every explainer takes `a` 0..1 and pops with a back ease; feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)`.
- **Retime to music** with `K.G.BPM` and `K.G.BARS` (measured downbeats) before any `K.at` call. Never hard-code seconds in a scene.
- **Localised text** lives in DOM elements fed by HyperFrames variables; the canvas holds tickers, numbers and icons only.
- **DOM text goes above the overlays** (`#scan`, `#roll`, `#vig`), or `check` flags it as occluded.
- **Face dive.** Give Beepo `screen: fn` (and `noScan: true`) with the next scene drawn at `w / 1920` scale, zoom the camera into the face in log space, then draw the scene full frame at the matching scale (see `intro/src/70_render.js`).
