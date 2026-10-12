# Surf Turtle kit

This is a reusable code-only drawing kit for the "Volatility Modeling & Regimes" collection. The style rules are in `../STYLE.md`.
It uses plain browser JS with no modules. Each file attaches to the global `VK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`.

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack` (monotone Hermite keys), the beat grid `G.BPM`, `G.BARS`, `at(bar, beat)`, `pulse(t, everyBeats)`, `barAt`, and the wobble clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `VK.P` colours (calm / storm / sigma roles), `VK.FONT` stacks, `VK.mix` (the only place they are defined) |
| `10_print.js` | frame setup `begin(ctx, t, cam)`, the camera `applyCam(ctx, parallax)`, `toScreen`; screen-print `shape` (off-register fill + halftone or solid shade band + brush outline), `brush`, `line`, `dot`, `halftone`, `woodgrain`, `bands` (stepped sky), `text` (never wobbles, optional poster drop shadow), `glow`; point generators `ellipsePts`, `blobPts`, `rectPts`, `roundPts`, `evenPts`, `polyPts` |
| `30_world.js` | `sky` (banded sunset or storm, striped `retroSun`, lozenge `cloud`s), `rain`, `ocean` (wave rows, `vol` = wave height), `waveRow`, `surfWave` (the curling hero wave), `spray`, `beach`, `palm`, `farIsle`, `lighthouse` (beam = regime), `gull`, `surfboard` (long / gun, with the tiny gauge), `gauge` |
| `40_turtle.js` | `turtle(ctx, x, y, s, pose)`: Siggy (host A) with squash/stretch, two-bone IK flippers and legs (`ik2`), sunglasses that slide (`shades`), blinks, brows, mouths, `talk` + `viseme`, `nod`, neck stretch, `!`, `think`; `blinkAt(t, seed)`; shared `viseme`, `talkMouth`, `thinkMark`, `lookToward` |
| `42_gull.js` | `gully(ctx, x, y, s, pose)` (not `gull`, which is the flying bird silhouette in 30_world): Gully the seagull lifeguard (host B): `face`, `talk` beak, IK wings (`wingL/R`) and legs, blink, brows, `nod`, `whistle`, `binos`, `puff`, `!`, `?`; `lifeguardStand` |
| `45_hosts.js` | both hosts together: `hostPose(who, t, {talk, other, face, gesture})` (idle, talking, listening), `turtleGesture` / `gullGesture(kind, u, opt)`, `duo(ctx, t, opt)` (both hosts big on sand, pointing at screen targets, holding props) |
| `50_explainer.js` | slide content as beach objects: `forecastBoard` + `formula` markup, `tikiSign`, `posterChart` (regime bands), `hump`, `tideTable`, `menuBoard`, `postcard`, `buoy`, `current` / `loopCurrent` / `tag`, `medal` + `ICON`, `posterFrame`, `tikiFace`, `starfish` |
| `fonts/` | local woff2 (Lobster, Nunito, Fira Mono with Greek, CJK subsets) plus `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `vendor/gsap.min.js` | GSAP 3.14.2 (local, no CDN) |

## Using the kit in an episode

1. Create the project: `npx hyperframes init episodes/<slug>/video --non-interactive --example=blank`.
2. Copy `intro/tools/shell.html` to `<project>/tools/shell.html`. Change `data-duration`, drop the title variables if you do not need them, and keep the `/*__FONTS__*/` and `/*__SCRIPT__*/` markers, the canvas, `#grain`, `#vig` and `#preload`.
3. Write scenes in `<project>/src/NN_*.js`. They are concatenated after the kit in name order, inside one IIFE, so `const` names are shared across your files. A minimal scene:

   ```js
   const K = VK, P = K.P, at = K.at, DUR = 60;
   const ctx = document.getElementById("cv").getContext("2d");
   const cam = K.mkTrack([[0, { x: 960, y: 540, z: 1 }], [at(4), { x: 1100, y: 600, z: 1.2 }]]);
   function render(t) {
     K.begin(ctx, t, Object.assign({ rot: 0 }, cam(t)));
     K.applyCam(ctx, 1);
     const storm = K.inv(at(2), at(2) + 0.4, t);              /* the regime flips on bar 2 */
     K.sky(ctx, 560, { storm });
     K.ocean(ctx, 560, { storm });
     K.forecastBoard(ctx, 700, 330, 1100, 290, ["σ^2_t = ω + α·ε^2_{t-1} + β·σ^2_{t-1}"], { a: K.inv(at(0, 1), at(0, 1) + 0.4, t), write: K.inv(at(1), at(2), t), hi: /σ/ });
     K.turtle(ctx, 1500, 1000, 1.1, { blink: K.blinkAt(t, 1), squash: 0.07 * K.pulse(t, 1), flipL: { x: -170, y: -280 }, shades: 18, look: [-1, -0.6] });
   }
   const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
   Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
   TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
   render(0);
   window.__timelines["main"] = TL;
   ```

4. Build, then check: `python3 style/kit/tools/build.py <project>` and `cd <project> && npx hyperframes lint && npx hyperframes check`.
5. Snapshot and look at the frames (`intro/tools/snap.sh` shows the loop, `tools/sheet.sh` tiles a contact sheet, `tools/snap_lang.sh` checks a language). Render with `npx hyperframes render --quality high --output renders/x.mp4` (`intro/tools/render_all.sh` does all four languages).

`style/gallery/` is a 6-second project that shows every explainer primitive. Rebuild and snapshot it after you change the kit, to catch regressions.

## Hosts in an episode

```js
/* per frame: talkA / talkB = each voice's loudness 0..1 from the narration sync */
K.duo(ctx, g, { x: 380, y: 1010, s: 1.3, side: 1, talkA, talkB,
  pointA: board ? [900, 380] : null, pointAmt: K.inv(B.formula, B.formula + 0.4, g),      /* screen point */
  gestureB: { kind: "binos", u: K.inv(B.storm - 0.5, B.storm + 1.5, g) } });             /* u runs 0 -> 1 */
```

Gestures are envelopes: pass `u` running from 0 to 1 over the gesture (the pose goes out and back by itself). `style/gallery` pages 4 - 6 show the duo talking, listening and pointing, and every gesture.

## Rules the kit relies on

- **Pure function of time.** Draw everything inside `render(t)` from `t` alone. No `Math.random`, `Date.now` or `performance.now`, and no state carried between frames (`K.gaugePt` is written and read inside the same frame).
- **Wobble vs smooth.** Contours read `K.bf` (12 fps). Camera, positions, the regime tween and text read `t` directly.
- **One regime number.** Pass `storm` (0..1) to every world call; tween it on the downbeat where the regime flips.
- **Appear parameter.** Every explainer takes `a` from 0 to 1 and pops with a back ease. Feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)` so pops land on the beat.
- **Retime to music** by setting `K.G.BPM` and `K.G.BARS` (measured downbeats) before any `K.at` call. Never hard-code seconds in a scene.
- **Localised text** belongs in DOM elements fed by HyperFrames variables. The canvas world holds numbers, Greek symbols and icons only.
