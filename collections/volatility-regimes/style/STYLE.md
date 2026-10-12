# Style bible: "Siggy the Surf Turtle"

Collection: **Volatility Modeling & Regimes** (ru: Моделирование волатильности и режимы рынка, zh-CN: 波动率建模与市场状态, zh-TW: 波動率建模與市場狀態).
Episodes cover GARCH and asymmetric GARCH (the leverage effect: drops raise volatility more than rises), volatility clustering, regime switching (calm vs storm, hidden Markov models) and realized volatility.

Everything is drawn in code: canvas 2D through the kit in `style/kit/`, and the timeline is HyperFrames + GSAP.
No image or video models are used. The values below are the same as in `kit/05_palette.js` and the kit modules. Change them together.

## 1. The world in one sentence

Siggy, a laid-back surfer sea turtle in coral sunglasses, surfs a sunset beach where **wave height is volatility**.
Calm regime = glassy little waves under a striped sunset; storm regime = big waves that come in sets (big waves follow big waves), a bruised purple sky and rain.
A lighthouse on the point shows the current regime: turquoise beam = calm, coral beam = storm. Siggy reads the surf-report board (the GARCH forecast) and picks the right board: the cream longboard for calm, the coral gun for storm.
Slide content is always a **thing on this beach**, never a flat slide.

How it differs from the sibling worlds: crab = nautical ink cartoon, owl = sepia, robot = neon 80s, mouse = 50s mid-century poster, raccoon = bazaar, hamster = 50s diner.
This one is a **60s surf poster pulled by hand**: flat colour screens printed slightly off register, brush outlines in deep teal (never black), halftone dots instead of hatching, banded (stepped) sunset skies, woodgrain and tiki carving.

## 2. Palette (hex)

| Role | Token | Hex |
| --- | --- | --- |
| Ink (all outlines, dark type) | `ink` / `inkSoft` | `#16323a` / `#2f5a5c` |
| Poster paper, light type | `cream` / `creamShade` | `#fbeed3` / `#ecd3a6` |
| Sunset sky bands (top to horizon) | `sky0..sky4` | `#e8566a` `#f27d58` `#f7a24c` `#f9c562` `#fde3a0` |
| Storm sky bands | `storm0..storm4` | `#3b3561` `#54497a` `#6f5f8f` `#8f7aa0` `#b59bab` |
| Sun / sun ring | `sun` / `sunRing` | `#ffd86b` / `#ffb84d` |
| Ocean light / main / mid / deep / night, foam | `seaLight` `sea` `seaMid` `seaDeep` `seaNight` `foam` | `#7fd8cf` `#2bb0a8` `#1d8d8e` `#145a63` `#0f4250` `#fff6e2` |
| Storm sea | `stormSea` / `stormDeep` | `#2d6d7a` / `#183f4f` |
| Sand, wet sand | `sand` / `sandDark` / `sandWet` | `#f2c98a` / `#d9a35f` / `#c99a62` |
| Siggy skin | `skin` / `skinDark` / `skinLight` | `#7cc49a` / `#4f9a78` / `#b3e2c0` |
| Siggy shell, plastron | `shell` / `shellDark` / `shellLight` / `belly` | `#b5763a` / `#8a5427` / `#e0a65c` / `#f3dca0` |
| Sunglasses | `shades` / `shadesFrame` / `shadesShine` | `#16323a` / `#f2675a` / `#7fd8cf` |
| Tiki wood | `wood` / `woodDark` / `woodLight` / `woodNight` | `#a8693a` / `#6e4224` / `#cf9256` / `#4a2c18` |
| Lighthouse beam calm / storm | `beamCalm` / `beamStorm` | `#9ff0e2` / `#ff7a5c` |
| **Calm regime** | `calm` | `#2bb0a8` (turquoise) |
| **Storm regime** | `storm` | `#e8566a` (coral) |
| **Volatility, sigma, forecast** | `sigma` / `sigmaGlow` | `#f6b93b` / `#ffe7a3` (mustard) |
| Up / down returns | `up` / `down` | `#3a9a5b` / `#d9483b` |
| Surf-report board, chalk | `slate` / `chalk` | `#24434a` / `#fbeed3` |
| Categorical series | `A[0..5]` | `#2bb0a8` `#e8566a` `#f6b93b` `#7a6bb0` `#f27d58` `#3a9a5b` |

Rules: turquoise always means calm and coral always means storm, everywhere (bands, beam, boards, medals). Mustard is reserved for sigma / the forecast.
The regime is one number, `storm` from 0 to 1, and every world call takes it (`K.sky`, `K.ocean`, `K.surfWave`, `K.cloud`), so a flip recolours and reshapes the whole world in one tween. Skies are flat colour bands with wavy edges (`K.bands`), never smooth gradients.

## 3. Line and texture (screen print)

| Parameter | Value |
| --- | --- |
| Wobble (redraw) rate | **12 drawings per second**: `K.bf = floor(t * 12)`; vertex jitter = `hash(vertex, seed + frame * 7919)`. |
| Wobble amplitude | 0.3 - 1.4 world px (softer than a pen boil: this is a print, not a sketch) |
| Outline | a **brush ribbon** (`K.brush`): one filled polygon whose width swells about 32 % along the path and tapers at open ends; no gaps. Widths: Siggy 5 - 6, props 4 - 6, fine detail 2.5 - 3.5; never thinner than 2 screen px (`K.MIN_PX`). |
| Off-register colour | every fill is shifted by about `K.REG` (3.2, 2.4) world px against its outline, varied per seed, so a sliver of paper shows on one side. Small parts (`reg: false`) print on register. |
| Shading | flat shadow band = shape minus its offset copy, either solid or **halftone dots** (`shade: {dots: true}`); light from the upper left. Whole-shape dot screens with `dots: {...}`. No hatching. |
| Highlights | `shine`: one cream brush arc at the upper left of a shape (shell, head, waves) |
| Wood | `K.woodgrain`: wavy grain lines with knots, clipped to the shape |
| Paper grain | SVG noise overlay, 16 % multiply, steps at 12 fps |
| Vignette | radial, 38 % deep teal at the corners |

What stays smooth (continuous time): camera, Siggy's travel, the regime tween, text layout, title letters.
What wobbles: every contour, foam, wood, paint edges. Text never wobbles.

## 4. Type

| Use | Font | Weight | Size at 1080p |
| --- | --- | --- | --- |
| Title line 1 (poster script) | Lobster | 400 | fit to 1700 px, max 150 px; cream fill, 10 px teal stroke, solid teal drop shadow (8, 10) |
| Title line 2 (caps) | Nunito | 900 | fit, max 74 px, uppercase, tracking 0.09 em, teal fill with cream stroke |
| Title, Chinese | Noto Sans SC / TC (glyph subsets) | 900 | max 140 px, one line |
| Labels, headings, bullets | Nunito | 600 / 800 / 900 | 36 - 48 px on screen |
| Numbers, formulas, code, tables | Fira Mono (Latin, Cyrillic, Greek) | 500 / 700 | 28 - 60 px on screen |

All fonts are local woff2 in `kit/fonts/` (Latin, Latin-ext, Cyrillic, Cyrillic-ext; Greek for Fira Mono, so σ α β ω ε render in formulas). Lobster has no CJK; Chinese titles fall back to the Noto subsets. When an episode needs new Chinese glyphs, run `python3 style/kit/tools/fetch_fonts.py --cjk-text "<all Chinese text>"` again.
Minimum readable text on screen is 24 px; in zoomed-out shots multiply world sizes by `1 / zoom`.
Formulas use a tiny markup, `K.formula`: `σ^2_t = ω + α·ε^2_{t-1} + β·σ^2_{t-1}` (`^` superscript, `_` subscript, `{}` groups); a subscript stacks under its superscript.

## 5. Siggy (the turtle)

| Part | Value (scale 1, local px) |
| --- | --- |
| Overall | feet on y = 0, about 250 tall, stands upright like a cartoon surfer |
| Shell | brown rim (78 x 74) behind a cream plastron (54 x 62) with segment lines; halftone shadow lower right |
| Head | 50 x 42 on a stretchy neck (`neck` 0..1), head plates in skinDark, coral cheeks |
| Sunglasses | coral frame, dark teal lenses with a turquoise shine stripe. `shades` 0 = on the eyes; > 0 slides them down the snout so the eyes peek over (surprise, reading); < 0 pushes them up on the head |
| Front flippers | two-bone IK 40 + 38, paddle flippers; a pose is "where the flipper tip goes" |
| Back flippers | stubby two-bone IK legs 34 + 34 to `footL` / `footR`; they tuck in a hop |
| Head-to-frame | close shots: Siggy 300 - 360 px tall on 1080p; wide/explainer shots at least 160 px |

Animation rules:
- Squash and stretch with volume kept (`squash`). 0.07 bounce on every beat while idle, 0.3 crouch before a big action, stretch (-0.2) on surprise.
- Anticipation: crouch before the ride, the shades slide before the eye pop, a head shake ("nah") before grabbing the other board.
- Blinks are seeded about once per 2.1 s (`K.blinkAt`), only visible when the shades move; brows are always visible above the shades, so expressions read even with the shades on.
- Mouths: `smile`, `grin`, `open`, `o`, `flat`, `wow`; `exclaim` pops a mustard "!".
- Always something alive: beat bounce, balancing flippers, board bob, the wobble.
- On a board: `surfer(x, y, ang, s, pose, gauge)` in the intro, or `K.surfboard` + `K.turtle` with `lean = board angle`. The board carries the **tiny volatility gauge** on a stalk at the nose (`gauge` 0..1); after drawing, `K.gaugePt` holds its screen point for dial transitions.

## 5b. Gully (the sidekick, host B)

Gully is a seagull lifeguard and Siggy's co-host in episodes. Siggy (host A, the lower voice) explains; Gully (host B, the higher voice) asks, doubts, spots the wave coming.

| Part | Value (scale 1, local px) |
| --- | --- |
| Overall | feet on y = 0, about 230 tall (0.9 of Siggy), 3/4 view toward `face` (+1 right, -1 left) |
| Body | plump white teardrop (50 x 60) with a grey mantle and tail, halftone shadow |
| Head | white, 1.15x, two eyes on the face side, orange beak (upper + lower mandible, coral spot) that opens with `talk` |
| Lifeguard kit | coral cap with a cream cross and brim, a whistle on a turquoise cord, binoculars on a strap |
| Wings | two-bone IK 36 + 32 with a fan of three broad primaries (dark tips); folded at the sides by default |
| Legs | thin orange two-bone IK to webbed feet; they tuck in a hop |
| Stand | `K.lifeguardStand` lifts him so both heads sit at about the same height |

Gestures (`K.gullGesture(kind, u)`): `point` (a "presenting" wing aimed at the target, kept at shoulder height so it never crosses the beak), `nod`, `surprise` (feathers puff, eyes pop, hop, "!"), `think` (wing to the beak, "?" bubble), `whistle` (whistle in the beak, sound lines: a call to attention, use on warnings), `binos` (binoculars to the eyes: spotting the next wave or a regime change), `flap`, `worry`.
Siggy's gestures (`K.turtleGesture`): `point` (the flipper on the target's side), `nod`, `surprise`, `think` (flipper to the chin, "?"), `shaka`, `thumbs`, `shrug`, `worry`.

Talking and listening (both hosts):
- `talk` 0..1 is the narration loudness of that host's voice per frame. The mouth opens with it, and the shape follows a viseme (`a`, `o`, `e`, `m`), chosen per 1/8 s from the loudness by `K.viseme` (seeded, seek-safe) unless a scene passes one.
- `K.hostPose(who, t, {talk, other, face, gesture})` adds the idle bob, blinks, the free limb rising on loud syllables and the head bob; when the other host talks, the listener looks at the speaker and nods on their loud syllables.
- `K.duo(ctx, t, {x, y, s, side, talkA, talkB, pointA, pointB, gestureA, gestureB, holdA})` puts both hosts big on a patch of sand in screen space: Siggy at s 1.3 is about 325 px tall, Gully on his stand beside him. Each host faces the partner, or the thing it points at. Use `side: -1` with x about 1600 for the bottom-right corner, and keep explainer objects in the rest of the frame.

## 6. Camera and transitions

- One virtual camera `{x, y, z, rot}` per set, keyed with a monotone Hermite track (`K.mkTrack`), never overshooting. Push-ins are at most 1.6x, onto a reason (the gauge, the board).
- Camera shake only on a regime flip: a 7 px decaying wobble.
- Diegetic transitions, never a plain crossfade:
  - **dial iris**: the board's gauge face grows into the next set, ringed by the turquoise / mustard / coral dial arc;
  - **poster roll-up**: a full-frame poster rolls up like a blind onto the beach;
  - **sky tilt**: the camera tilts up into a clearing sky and cuts on a downbeat to another set that starts in the same sky.
- Moves start and land on beats.

## 7. Timing (beat grid)

- The theme song is 60s surf rock at **161.5 BPM**: a beat is 0.372 s and a bar 1.486 s. Write times as `K.at(bar, beat)`.
- The intro's measured downbeats: `BARS = [0.35, 1.88, 3.39, 4.90, 6.41, 7.89, 9.38, 10.89, 12.40, 13.89, 15.39, 16.86, 18.35, 19.84]`.
- Each sung line gets its own picture: 6.41 "Ride the calm" = carving glassy waves; 7.89 "ride the storm" = the regime flip (beam turns coral, the wave stands up, a second set follows); 9.38 "Every regime has its form" = returns over regime bands and two distributions; 12.40 "Measure the swell and read the sea" = the GARCH board and the forecast dial; 15.39 "Volatility Modeling and Regimes!" = the title.
- Pops land on beats with a back ease of 0.3 - 0.45 s; staggers are 1/2 or 1/4 beat.
- Determinism: no `Math.random`, `Date.now` or `performance.now`. Seeded `mulberry` / `hash` only (data series included).

## 8. Explainer elements on this beach (for episodes)

| Slide content | Draw it as | Kit call |
| --- | --- | --- |
| Formula (GARCH, EGARCH, GJR, HMM) | surf-report board: slate paint in a bamboo frame with a tiki face, chalk Fira Mono written glyph by glyph; key symbol in mustard (`hi: /σ/`) | `K.forecastBoard`, `K.formula` |
| Big number | carved tiki sign on a post, cream panel | `K.tikiSign` |
| Volatility reading, risk level | the dial: turquoise / mustard / coral arcs | `K.gauge` |
| Time series, returns, sigma | surf-poster card with a sunset header; regime bands shaded behind (`bands: [{from, to, regime}]`); returns as `zig` bars, sigma as a mustard line | `K.posterChart` |
| Distribution (calm vs storm, fat tails) | a dune / hump on the card baseline (`fat` for heavy tails) | `K.hump` |
| Table (parameters, regime stats) | tide table in a wood frame, turquoise header, mustard highlight row | `K.tideTable` |
| Bullets, agenda | surf-shop menu painted on a surfboard; each bullet is a starfish and pops on its beat | `K.menuBoard` |
| Code (Python, arch / hmmlearn) | surf-wax postcard with a regime-stripe header, typed out | `K.postcard` |
| HMM state, graph node | a buoy bobbing on the water with an icon (sun = calm, storm cloud = storm) | `K.buoy`, `K.ICON` |
| Transition probability, edge | an ocean current (foam arrow) with a probability ticket; self-loop for "stay" | `K.current`, `K.loopCurrent`, `K.tag` |
| Regime label | medal with `K.ICON.sun` / `K.ICON.storm` (never the words) | `K.medal` |
| Episode icon | life-ring medal: `garch`, `leverage`, `cluster`, `regimes`, `realized` | `K.medal`, `K.ICON` |
| Volatility itself | wave height: `K.ocean({vol})`, `K.surfWave(h)` | world |
| Regime flip | `storm` 0 to 1 + lighthouse beam colour + flash | world |
| Episode title | DOM letters on the banded sunset (Lobster + Nunito caps) | intro `50_title.js` |

Layout rules: at most 2 explainer objects in frame plus Siggy reacting (pointing with an IK flipper, reading with the shades slid down, swapping boards). Text sits on cream, slate or wood, never on raw water. Keep a 64 px safe margin. Numbers on screen are the numbers from the script; the drawing never invents data.

## 9. Do / don't

Do: build a beach with a camera and move through it; let Siggy react to every reveal; make volatility visible as wave height; keep calm turquoise and storm coral everywhere.
Don't: draw flat slide cards, black outlines, smooth gradient skies, hatching (that is the crab's), neon glow (only the sun, the beam and the forecast glow); boil the text; put language-specific words in the drawn world (numbers, Greek symbols and icons only; localised text lives in DOM variables).
