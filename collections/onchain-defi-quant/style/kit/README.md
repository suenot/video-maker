# Block Diner kit

This is a reusable code-only drawing kit for the "Onchain & DeFi Quant" collection. The style rules are in `../STYLE.md`.
It uses plain browser JS with no modules. Each file attaches to the global `DK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`. The architecture (core, beat grid, boil, build) matches the crab kit; the drawing layer is different (brush ribbons, Ben-Day dots, off-register fills).

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack`, the beat grid `G.BPM`, `G.BARS`, `at(bar, beat)`, `pulse`, and the boil clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `DK.P` colours and `DK.FONT` stacks (the only place they are defined) |
| `10_ink.js` | `begin`, camera `applyCam` / `toScreen`; `shape` (off-register fill + shadow band with Ben-Day dots + `shine` + brush outline), `line` (tapered), `rule` (constant width), `dot`, `dotFill` / `dotPattern`, `text` (never boils, optional `drop` shadow), `glow`; point generators `ellipsePts`, `blobPts`, `rectPts`, `roundRectPts`; `samplePath` |
| `30_world.js` | diner set: `wall`, `chromeBar`, `booth`, `formica`, `passWindow`, `window`, `lamp`, `checkerFloor` (perspective, follows the camera), `counter`, `stool`, `conveyor`, `block` (tray), `trayItem`, `chainIcon`, `ticket`, `ticketRail`, `bell`, `plate`, `breadSlice`, `burger` (with `bite`), `coffee`, `steam`, `coin`, `sparkle`, `burst`, `speedLines` |
| `40_hamster.js` | `hamster(ctx, x, y, s, pose)` (Chef Nibbs), `ik2`, `limb`, `paw`, `magnifier` (writes `K.lens`), `blinkAt` |
| `45_bot.js` | `sandwichBot(ctx, x, y, s, pose)` (Slyce, the MEV bot) |
| `50_explainer.js` | `node`, `edge` / `edgePoint` / `tag`, `register`, `menu`, `chalkboard`, `placemat`, `letterBoard`, `receipt`, `ammScale`, `neonSign` |
| `fonts/` | local woff2 (Lobster, Nunito, Anonymous Pro, CJK subsets) plus `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `vendor/gsap.min.js` | GSAP 3.14.2 (local, no CDN) |

## Using the kit in an episode

1. `npx hyperframes init episodes/<slug>/video --non-interactive --example=blank`.
2. Copy `intro/tools/shell.html` to `<project>/tools/shell.html`; change `data-duration`, drop the title variables if unused, keep the `/*__FONTS__*/` and `/*__SCRIPT__*/` markers, the canvas, `#grain`, `#vig` and `#preload`.
3. Write scenes in `<project>/src/NN_*.js` (concatenated after the kit, inside one IIFE). Minimal scene:

   ```js
   const K = DK, P = K.P, at = K.at, DUR = 60;
   const ctx = document.getElementById("cv").getContext("2d");
   const cam = K.mkTrack([[0, { x: 960, y: 540, z: 1 }], [at(4), { x: 1100, y: 520, z: 1.1 }]]);
   function render(t) {
     K.begin(ctx, t, Object.assign({ rot: 0 }, cam(t)));
     K.applyCam(ctx, 1);
     K.booth(ctx, -200, 2200, -200, 760, 5); K.formica(ctx, -200, 2200, 760, 120, 7);
     K.menu(ctx, 1200, 440, [260, 190], [["USDC", "ETH"], ["2 008", "2.5"], ["2 004", "3.0"]], { a: K.inv(at(0, 1), at(0, 1) + 0.4, t), rowColors: [null, P.ask, P.bid] });
     K.hamster(ctx, 600, 810, 1.8, { blink: K.blinkAt(t, 1), squash: 0.08 * K.pulse(t, 1), hold: "magnifier", magAng: -20, pawR: { x: 100, y: -150 } });
   }
   const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
   Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
   TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
   render(0);
   window.__timelines["main"] = TL;
   ```

4. Build and check: `python3 style/kit/tools/build.py <project>` then `cd <project> && npx hyperframes lint && npx hyperframes check`.
5. Snapshot (`intro/tools/snap.sh "1,2,3"`), look at the frames, render with `npx hyperframes render --quality high --output renders/x.mp4`.

`style/gallery/` is a 6-second project: 0-4.8 s every explainer primitive, 4.8-6 s a character + set sheet. Rebuild and snapshot it (`--at 4.5` and `--at 5.3`) after any kit change.

## Rules the kit relies on

- **Pure function of time.** Everything inside `render(t)` from `t` alone; no `Math.random`, `Date.now`, `performance.now`, no state between frames (`K.lens`, `K.ammPans` are written and read in the same frame).
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions and text read `t`.
- **Appear parameter.** Every explainer takes `a` 0..1 and pops with a back ease; feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)`.
- **Retime to music** with `K.G.BPM` and `K.G.BARS` before any `K.at` call. Never hard-code seconds in a scene.
- **Localised text** lives in DOM elements fed by HyperFrames variables; the canvas holds tickers, numbers and icons only.
- **Lens zoom**: draw the world, then clip to `K.lens` and draw it again with a camera of `z * 1.6` centred so the lens point stays fixed (see `drawDiner` in the intro). Leave the character holding the glass out of the second pass.
