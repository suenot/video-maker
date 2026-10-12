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
| `40_mouse.js` | `mouse(ctx, x, y, s, pose)` with squash/stretch, IK arms (`ik2`), blink, mouths incl. whistle, cheek puff, ear flick, tail, cap tip, props (`pocketWatch`, `whistle`, flag, thumb, point, any `hand.draw` prop), `!` / `?`; talking mouth `talk` 0..1 + `viseme`, head `nod` / `tilt`; `talkMouth`, `viseme(t, talk, seed)`, `lookAt(from, to)`, `blinkAt` (any length of t) |
| `42_pigeon.js` | `pigeon(ctx, x, y, s, pose)`: Dash, the telegraph clerk (host B). 3/4 view (`face` ±1), squash/stretch, IK wings with feather hands (`open`, `point`, `ticket`, `tape`, any `draw` prop), talking beak (`talk` + `viseme`), head bob (`peck`), `nod`, `head` tilt, blink, `look`, `brow`, `!` / `?`; props `ticket`, `tape`, `wingHand`; landmarks `pigeon.HEAD`, `SHOULDER`, `REACH`, `H` |
| `44_hosts.js` | the two hosts acting together: `mousePose(t, o)`, `pigeonPose(t, o)` build poses from loudness, listening, accents, scripted gestures, a pointing target and a carried prop; `duo(ctx, t, o)` places both large on a platform piece and returns their screen anchors; `gestEnv` |
| `50_explainer.js` | `flap` / `flapChar`, `board`, `plaque`, `poster`, `tickets`, `teletype`, `stop` / `route` / `routePoint`, `tag`, `sign`, `popS` |
| `fonts/` | local woff2 (Jost, IBM Plex Mono, CJK subsets) + `fonts.css`; refresh with `tools/fetch_fonts.py` |
| `assets/logo.svg` | marketmaker.cc logo (`currentColor`); `build.py` inlines it at a `<!--__LOGO__-->` marker in the shell (see `intro/tools/shell.html`, `#logo`) |
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

`style/gallery/` is a 14-second project: 0-6 s every explainer primitive, 6-10 s the duo (talking, listening, pointing at a poster), 10-14 s the host sheet (mouths and every gesture). Rebuild and snapshot it after you change the kit, to catch regressions.

## Hosts: Mr. Tick (A) and Dash (B)

Episodes are two-voice conversations. Host A, the explainer (lower voice), is Mr. Tick. Host B, the curious co-host (higher voice), is Dash. Draw them with `K.duo` in screen space after `K.screen(ctx)`:

```js
K.screen(ctx);
const H = K.duo(ctx, t, {
  layout: "left",                   // "left" | "right" | "flank"
  s: 1.15,                          // Mr. Tick 345 px tall, Dash ~285 px
  a: { talk: NR.talk(t, "a"), accents: ACC.a, nodAt: ACC.b,      // loudness 0..1 per frame, stressed-syllable times
       point: [1290, 470], pointAmt: K.ss(at(2), at(2) + 0.3, t),
       gest: [{ at: 12.4, kind: "surprise", dur: 0.8 }] },
  b: { talk: NR.talk(t, "b"), accents: ACC.b, nodAt: ACC.a,
       gest: [{ at: 15, kind: "think", dur: 2 }, { at: 19, kind: "ticket", label: "No 7" }] },
});
// H.a.hand / H.b.hand / H.a.head are screen points to hang tags or props on
```

- **Talking.** `talk` is the loudness of the host's own voice this frame (0..1). It opens the mouth or beak and adds a small bounce. Mouth shapes (`a`, `e`, `o`, `m`) change about 8 times a second from a seeded hash, or set `viseme` yourself.
- **Listening** is automatic in `K.duo`: when one host talks, the other turns to look at them, leans in and nods on the talker's `nodAt` times (a slow nod when there are none). Set `speaker` to override who talks.
- **Gestures** (`gest: [{ at, kind, dur }]`): both hosts do `point`, `nod`, `surprise`, `think`, `shrug`, `wave`, `grin` and `worry`. Mr. Tick also does `thumbs`, `watch` and `whistle`. Dash also does `flap`, `tape` (unrolls telegraph tape) and `ticket` (shows a ticket, `label`).
- **Pointing at content.** `point: [x, y]` is a screen point. The nearer hand aims at it and the eyes follow. Dash raises his wing over Mr. Tick's head (`pointUp`).
- **Carrying a prop.** Pass `carry: { draw(ctx, x, y, ang), side }` (`side` +1 right hand, -1 left hand; the default is the outer hand). It is drawn at the outer hand in rig space (scale 1), for example `(c, x, y) => K.ticket(c, x, y - 20, 0, 1.4, { label: "VWAP" }, 5)`.
- **Layouts.** In `left` Mr. Tick stands at x 470 with Dash on the outer side at about x 180, which leaves x 700-1880 for the explainer. `right` mirrors this. `flank` puts the hosts at both edges, with the prop between them. The feet are at y 1000. Never shrink the hosts below s 0.9 in explainer scenes.
- **Without `K.duo`.** Call `K.mouse(ctx, x, y, s, K.mousePose(t, { x, y, s, talk, listen, toward }))` and `K.pigeon(ctx, x, y, s, K.pigeonPose(t, { x, y, s, talk, listen, face }))` yourself.

## Rules the kit relies on

- **Pure function of time.** Draw everything inside `render(t)` from `t` alone. No `Math.random`, `Date.now` or `performance.now`, and no state carried between frames.
- **Boil vs smooth.** Contours read `K.bf` (12 fps). Camera, positions, flaps and text read `t` directly.
- **Appear parameter.** Explainers take `a` from 0 to 1 and pop with a back ease. Feed it `K.inv(at(bar, beat), at(bar, beat) + 0.4, t)`.
- **Retime to music** by setting `K.G.BPM` and `K.G.BARS` before any `K.at` call. Never hard-code seconds in a scene.
- **Parallax** layers are laid out in world numbers: `applyCam(ctx, p)` is anchored at `K.REF`.
- **Scenes draw on any context.** Write scene functions as `draw(c, t)` so a transition can render both sides into offscreen buffers (see `flapWipe` / `steamWipe` in `intro/src/70_render.js`).
- **Localised text** belongs in DOM elements fed by HyperFrames variables. The canvas world holds tickers, numbers and icons only.
