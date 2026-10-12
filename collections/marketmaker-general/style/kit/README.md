# Coral Exchange kit (marketmaker-general)

A reusable code-only drawing kit for the channel-wide Marketmaker style. The style rules are in `../STYLE.md`.
Plain browser JS, no modules. Each file attaches to the global `MK` namespace, and `tools/build.py` inlines the files into one HyperFrames `index.html`.
The architecture is the same as the crab kit (`complex-arbitrage-rust/style/kit/`); the art direction, world, mascot and primitives are new.

| File | What it gives you |
| --- | --- |
| `00_core.js` | `clamp lerp inv ss tw E.*` eases, `mulberry` / `hash` / `fbm` seeded noise, `mkSpline` / `mkTrack`, the beat grid `G.BPM`, `G.BARS`, `at(bar, beat)`, `pulse`, `beatIndex`, and the boil clock `boilFrame(t)` at 12 fps |
| `05_palette.js` | `MK.P` colours and `MK.FONT` stacks (the only place they are defined) |
| `10_ink.js` | `ik2` two-bone IK; camera `begin` / `applyCam(ctx, parallax)` / `screen` / `toScreen`; `shape` (flat fill + `shade` band + `hi` highlight + halftone `dots` + sticker `drop` + clean navy outline), `line`, `tube`, `dot`, `halftone`, `text` (never boils), `glow`; point generators `ellipsePts`, `blobPts`, `rrectPts` (sharp-edged rounded rects), `rectPts` |
| `30_world.js` | `ocean` (flat bands), `rays`, `surface`, `sun`, `bubble` / `bubbles` / `bubbleBurst`, `sand`, `kelp`, `coralBranch`, `coralFan`, `brainCoral`, `rock`, `starfish`, `tower` (coral exchange tower with ticker strip), `clamDesk` (`part: back/front`), `fish` (4 species, can carry a card), `card` (bid / ask / up / down / sun / plain), `coin`, `sparkle`, `inkCloud`, `mix` |
| `40_octo.js` | `octo(ctx, x, y, s, pose)`: Otto with 8 tapered sucker arms posed by tip targets, held cards/props, squash, hop, blink/wink, mouths, brows, glasses glint, `!`, skin colour shift; `OCTO_REST`, `octoTips` (world tips after a draw), `blinkAt`, `SKIN`, `skinMix` |
| `41_talk.js` | `viseme(t, talk, seed)` (one viseme-ish shape per syllable: m / a / o / e / u) and `talkMouth` (both hosts' talking mouths, opening scales with loudness) |
| `42_puffer.js` | `puffer(ctx, x, y, s, pose)`: Puff, the pufferfish intern (host B): puff-up, spines, IK pectoral fins, look-at, blink, brows, mouths, `!`, thought bubble; `PUFF_SKIN`, `pufferEyes` |
| `45_duo.js` | `duo(ctx, t, opt)`: both hosts placed and acted from narration loudness (talking, listening, point, surprise, think, grin, nod, shrug, wave, carry); `duoStage` |
| `50_explainer.js` | `panel`, `chart` (+ `genCandles`, `sma`, `alligator`, `ao`, `fractals`), `attractor`, `manifold`, `formula`, `table`, `bullets`, `code`, `book`, `badge`, `titlePlate`, `popS` |
| `assets/logo.svg` | the marketmaker.cc mark (`fill="currentColor"`); `build.py` inlines it where a shell has `<!--__LOGO__-->` |
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

## Otto (the octopus) API, for cameos and episodes

The rig is self-contained in `40_octo.js` and needs only `00_core`, `05_palette`, `10_ink` and `K.card` from `30_world`. Copy those files (or load this kit) to use Otto in another project, such as an end card.

```js
K.begin(ctx, t, cam); K.applyCam(ctx, 1);
K.octo(ctx, x, y, s, {
  blink: K.blinkAt(t, 5),            // 0..1, seeded blinks; wink: 0..1 closes the viewer-left eye
  squash: 0.07 * K.pulse(t, 1, 6),   // -1..1, volume kept (head only); hop: px lift (resting arms trail)
  lean: 0,                           // degrees around the arm base
  look: [0.3, -0.2],                 // pupils, -1..1
  mouth: "smile",                    // "smile" | "grin" | "open" | "o" | "flat"; talk: 0..1 (narration) overrides
  brow: 0.3,                         // -1..1.5
  glint: 0,                          // 0..1 light flash across the glasses
  exclaim: 0,                        // 0..1 "!" pop
  skin: K.SKIN.calm,                 // calm | chaos | bull | bear, or K.skinMix(a, b, u)
  wave: 1,                           // idle arm sway
  arms: [null, { x: -330, y: -330, bend: -30, card: { kind: "bid", text: "99.98", s: 0.9 } }, null, null, null, null,
         { x: 330, y: -330, bend: 30, card: { kind: "ask", text: "100.02", s: 0.9 } }, null],
});
const tips = K.octoTips; // world positions of the 8 arm tips after the draw
```

- Local space: arm tips rest on y = 0, head centre at (0, -250), head top at about -400; at scale 1 Otto is about 600 px wide with resting arms and 420 px tall.
- `arms[i]` (0 = far left .. 7 = far right) is `null` for the resting fan or a tip target `{ x, y, bend, curl, card, prop, wrap }` in local space. `card` takes `K.card` options plus `dx`, `dy`, `s`, `a` (pop). `prop(ctx, x, y, ang)` draws anything at the tip; `wrap: true` curls the tip over it.
- Arms on the left side (0 - 3) should reach left/up, arms 4 - 7 right/up, so they do not cross the face.
- Pose blending in the intro: `armTrack(t, i, [[t0, target, dur], ...])` and `fanArms(t, t0, opt)` in `intro/src/30_verse.js` (copy them; they are scene helpers, not kit API).
- Determinism: everything comes from `t` and seeds; `seed` in the pose changes the boil pattern for a second Otto in one frame.

## Puff (the sidekick) API

```js
K.puffer(ctx, x, y, s, {
  talk: loudnessB, viseme: undefined,  // 0..1 loudness; viseme optional (auto per syllable)
  puff: 0,                             // 0..1 inflate (surprise): body 1.45x, spines out
  wide: 0, blink: K.blinkAt(t, 23),    // eyes pop / blink
  look: [0, 0], lookAt: [lx, ly],      // pupils, or a local point to look at
  brow: 0, browTilt: 0,                // browTilt 1 = one brow up (thinking)
  mouth: "smile",                      // "smile" | "grin" | "o" | "flat" | "worry"
  finL: { x: -150, y: 30 }, finR: null,// pectoral fin tip targets (IK); null = idle flap
  exclaim: 0, think: 0,                // "!" pop; thought bubbles with "?"
  bob: 0, lean: 0, squash: 0,          // float offset, tilt, squash/stretch (volume kept)
});
```

Local origin is the body centre; at scale 1 the body is 216 x 200 px (about 250 px with fins and tail). Keep Puff at s 0.8 - 1.6 so it reads at 180 - 400 px.

## Duo: both hosts from narration

```js
K.screen(ctx);
const d = K.duo(ctx, g, {
  x: 1340, y: 1010, s: 0.95, side: 1,      // Otto's base point; Puff floats at x + side * 380 * s, up 300 * s
  talkA: NR.talk(g, "A"), talkB: NR.talk(g, "B"),  // loudness per voice; the louder one speaks, the other listens
  actA: { kind: "point", u: hold(g, b1, b2) }, pointA: [sx, sy], pointAmtA: hold(g, b1, b2),
  actB: { kind: "surprise", u: hold(g, b3, b3 + 1) },
  propA: (c, x, y, ang) => K.card(c, x, y - 40, 0.9, { kind: "ask", text: "100.02" }),
});
// d.A.head, d.B, d.tips: anchor leaders, sparkles or props to the hosts
```

- Listening is automatic: the quiet host looks at the speaker and nods on the speaker's loudness.
- Talking hands are automatic: Otto's outer arm (away from Puff) lifts and opens while he speaks; Puff's fins flap with its speech.
- Acting kinds: A `point surprise think grin nod shrug wave carry`; B `point surprise think grin nod shrug wave worry`. Feed `u` from an envelope (`hold(t, t0, t1)`), so poses blend in and out.
- Layout: the duo owns a column about 640 px wide (`side: 1` at x about 1340 = bottom-right; `side: -1` at x about 580 = bottom-left). Otto is about 400 px tall at s 0.95; never go under s 0.75 in explainer scenes. Keep boards out of that column, so the think bubble and pointing arm stay clear.

## Rules the kit relies on

- **Pure function of time.** Draw everything in `render(t)` from `t` alone. No `Math.random`, `Date.now`, `performance.now`; no state across frames (`K.octoTips` is written and read in the same frame).
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions and text read `t`.
- **Appear parameter.** Every explainer takes `a` 0..1 and pops with a back ease; feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)`.
- **Retime to music** by setting `K.G.BPM` and `K.G.BARS` before any `K.at` call. Never hard-code seconds in a scene.
- **Colour semantics**: `bid` blue = buy side, `ask` coral = sell side, `sun` = the spread / the highlight, `lilac` = chaos.
- Long episodes: one function per scene, picked by time in `render`; bubble curtain or ink cloud between scenes (see `intro/src/20_reef.js`, `70_render.js`).
