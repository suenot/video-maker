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
| `45_cohost.js` | the talking duo for episodes: `ping` (Ping, host B: kind `cohost`), `hostPose(t, o)` (loudness-driven `speak` mouth, listening look + nods, gestures on accents, acts `point` `nod` `surprise` `think` `shrug` `cheer` `wave` `worry` `grin`, look-at, pointing, props), `duo(ctx, t, o)` (both hosts big in screen space with layouts `left` / `right` / `split` / `center`, neon pads, laser pointer; returns the `free` rect for props), `stage`, `toLocal`, `HOST_GEST`; plus in `40_robot.js`: `viseme(talk, t, seed)`, `VISEMES`, `hands`, `hoverLift` |
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

`style/gallery/` is an 18-second project: every explainer primitive on boards A and B (snapshot at 2.5 s and 5.5 s), then the hosts: C (7.8 s) Beepo talks and laser-points while Ping listens, D (10.2 / 11.7 s) Ping talks, thinks, gets surprised and points while Beepo listens holding a ticket, E (14.5 s) Ping gestures, F (17.5 s) Beepo gestures, viseme mouths and Ping at 180 / 260 / 400 px. Rebuild and snapshot it after kit changes to catch regressions.

## The hosts in an episode (Beepo = host A, Ping = host B)

Host A is the explainer (the lower NotebookLM voice), host B the curious co-host (the higher voice). Everything is driven per frame by numbers, so any narration source works:

```js
/* in screen space, after the world and the props */
K.screen(ctx);
const d = K.duo(ctx, t, {
  layout: "left",                       /* duo bottom-left, props in d.free (right) */
  talkA: NR.talk(t, "a"), talkB: NR.talk(t, "b"), who: NR.who(t),   /* 0..1 loudness */
  accentA: NR.accent(t, "a"), accentB: NR.accent(t, "b"),            /* gesture / nod pulses */
  pointA: [1530, 330], pointAmtA: K.ss(cue - 0.3, cue, t), beamA: true,
  actsB: [{ at: cue2, kind: "surprise", dur: 1.2 }],
  holdA: { R: (c, ang) => K.ticket(c, 30, -10, 0.7, { sym: "NVDA" }) },
});
```

`style/episode/65_host.js` wires the shared narration engine (`_episode/lib/60_narration.js`) into this for you: `HOST.duo(ctx, g, { reacts, preacts, point, pointAmt, ppoint, ppointAmt, layout })` (same option names as the crab collection), `HOST.beepoPose(g)` and `HOST.pingPose(g)` for solo shots.

- Size: `duo` defaults to Beepo s 1.25 (about 370 px feet to head top, 430 with the antenna) and Ping at 0.82 of that. Never go below s 1 in explainer scenes (300 px).
- Mouths: `mouth: "speak"` + `talk` 0..1 gives the viseme mouth (closed / e / a / o / u from `K.viseme`); `vis: K.VISEMES.o` forces a shape. The antenna bulb and the chest meter follow the voice too.
- Listening: the silent host looks at the talker, leans in and nods on the talker's accents. Do not add your own nods unless a beat asks for one.
- Pointing: `pointA` / `pointB` in screen px; the nearer arm reaches, the eyes follow, `beam` adds the neon laser line (pink from Beepo, cyan from Ping). Point at the thing being explained when it appears.
- Carrying props: `holdA` / `holdB` take `{ R | L: "ticket" | "lens" | "shield" | "baton" | fn(ctx, ang, st) }`; the function draws any kit prop at the hand.

## Rules the kit relies on

- **Pure function of time.** Draw everything in `render(t)` from `t` alone. No `Math.random`, `Date.now`, `performance.now`; no state carried between frames (`K.faceRect` is written and read in the same frame).
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions and text read `t`.
- **Appear parameter.** Every explainer takes `a` 0..1 and pops with a back ease; feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)`.
- **Retime to music** with `K.G.BPM` and `K.G.BARS` (measured downbeats) before any `K.at` call. Never hard-code seconds in a scene.
- **Localised text** lives in DOM elements fed by HyperFrames variables; the canvas holds tickers, numbers and icons only.
- **DOM text goes above the overlays** (`#scan`, `#roll`, `#vig`), or `check` flags it as occluded.
- **Face dive.** Give Beepo `screen: fn` (and `noScan: true`) with the next scene drawn at `w / 1920` scale, zoom the camera into the face in log space, then draw the scene full frame at the matching scale (see `intro/src/70_render.js`).
