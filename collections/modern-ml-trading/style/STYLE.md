# Style bible: "Professor Strix's Greenhouse Lab"

Collection: **Modern ML for Trading** (ru: Современный ML для трейдинга, zh-CN: 交易中的现代机器学习, zh-TW: 交易中的現代機器學習).
Episodes cover anomaly detection, AutoML, Bayesian neural networks, conformal prediction, diffusion models and more.

Everything is drawn in code: canvas 2D through the kit in `style/kit/`, with a HyperFrames + GSAP timeline.
No image or video models are used. The values below are the same as in `kit/05_palette.js` and the kit modules. Change them together.

## 1. The world in one sentence

Professor Strix, an owl scientist in round brass spectacles and a lab coat, grows trading models like plants in a cosy 1930s greenhouse laboratory.
A data seed goes into a pot, a model grows out of it, overfit branches get pruned, and every fold is a flask on the bench.
Slide content is always a **thing in this lab** (a plate, a flask, a gauge, a plant), never a flat slide.

How it differs from the crab kit (`complex-arbitrage-rust`): warm sepia paper instead of a blue sea, bottle-green ink instead of brown, a continuous dip-pen brush instead of broken strokes, halftone stipple instead of hatching, art-deco brass frames, a rubber-hose character with pie-cut eyes and white gloves, condensed Oswald titles, and a film-print layer (flicker and scratches).

## 2. Palette (hex)

| Role | Token | Hex |
| --- | --- | --- |
| Ink (all outlines) | `ink` / `inkSoft` | `#1f2620` / `#4a5446` |
| Paper, cards, cream type | `paper` / `paperShade` | `#f4e9d0` / `#dcc9a2` |
| Wallpaper, wainscot | `wall` / `wallDark` / `wallLine` | `#e3cf9f` / `#c7ae7a` / `#b89a62` |
| Wood (bench, easel) | `wood` / `woodDark` / `woodLight` | `#8b5a34` / `#5e3a20` / `#b07a4a` |
| Brass (frames, gauges, pipes) | `brass` / `brassDark` / `brassLight` | `#c9963a` / `#8a6322` / `#f0cf7a` |
| Green glass (hero material) | `glass` / `glassDark` / `glassDeep` / `glassHi` | `#8fcfb0` / `#4f9a7a` / `#2f6b56` / `#e6fff2` |
| Greenhouse panes | `pane` / `paneDark` | `#cfe3c4` / `#9fc4a4` |
| Plants | `leaf` / `leafDark` / `leafLight` / `stem` | `#5c9a3c` / `#3c6e28` / `#9ccc6a` / `#4c7a2e` |
| Pots | `pot` / `potDark` | `#b5603a` / `#7e3c22` |
| Owl feathers / facial disc | `owl` / `owlDark` / `disc` | `#8a5d3b` / `#5f3c24` / `#ecd3a8` |
| Lab coat, gloves | `coat` / `glove` | `#f7f1e2` / `#fffdf6` |
| Beak, feet | `beak` | `#e8a33a` |
| Data meaning | `train` / `test` / `good` / `bad` / `band` / `data` | `#5c9a3c` / `#e0a33a` / `#3f8f4e` / `#a8322c` / `#8fcfb0` / `#2f6b56` |
| Chalkboard | `board` / `chalk` | `#24332b` / `#eef0e2` |

Rules: green means a model that generalises (train fold, smooth fit, ticks). Amber means out of sample (test fold). Oxblood means overfit or rejected. Brass is the frame and the instrument, never data. The only glows are lamps, the data seed, a validated flask and the spotlight.

## 3. Line and texture

| Parameter | Value |
| --- | --- |
| Boil rate | **12 drawings per second** (`K.bf = floor(t * 12)`), vertex jitter by `hash(vertex, seed + frame * 7919)` |
| Boil amplitude | 0.4 - 1.1 world px (smaller than the crab: rubber-hose lines are clean) |
| Line | continuous brush ribbon (`K.brush`, `K.ring`): width swells 0.78 - 1.22x along the path, open ends taper to 30 %, round pen caps; **no gaps** |
| Outline widths | owl body 5.5, props 3.5 - 5, fine detail 2.2 - 3; never under 2.2 screen px (`K.MIN_PX`) |
| Shading | flat shadow band (`shade`) plus halftone stipple inside the band (`dots`), cream rim light on the upper-left (`rim`) |
| Film layer | multiply grain 16 %, sepia flicker 2 - 7 % stepped at 12 fps, 0 - 2 hairline scratches per drawing, oval vignette 55 % |

What stays smooth (continuous time): camera, owl travel, arm IK targets, text and title letters.
What boils: every contour, stems, glass outlines, paper edges. Text never boils.

## 4. Type

| Use | Font | Weight | Size at 1080p |
| --- | --- | --- | --- |
| Title (marquee) | Oswald, uppercase, tracked 0.06 - 0.12 em | 700 / 600 | line 1 up to 118 px, line 2 0.72x in brass |
| Title, Chinese | Noto Serif SC / TC (glyphs) | 900 | 122 px, one line |
| Labels, notes, bullets | Alegreya Sans | 500 / 800 | 32 - 44 px |
| Numbers, code, tables | IBM Plex Mono | 500 / 600 | 26 - 52 px |

All fonts are local woff2 in `kit/fonts/` (Latin, Latin-ext, Cyrillic, Cyrillic-ext); CJK fonts are Google Fonts `text=` subsets. For new Chinese glyphs run `python3 style/kit/tools/fetch_fonts.py --cjk-text "<all Chinese text>"`.
Minimum on-screen text is 24 px; at camera zoom z multiply world sizes by 1 / z.

## 5. Professor Strix (the owl)

| Part | Value (scale 1, local px, feet at y = 0) |
| --- | --- |
| Height | about 430 (tufts included); head 256 x 208, wider than tall |
| Body | feathered egg 200 x 224 under a cream lab coat (bell to the hem, open V, brass buttons, pocket with two pencils) |
| Face | heart-shaped tan disc with a feathered V between the eyes, pie-cut pupils, brass round spectacles, small amber beak, blush |
| Arms | two-bone IK (74 + 70) drawn as one rubber hose in coat colour; past full reach the arm **stretches** (hose thins) |
| Hands | white four-finger gloves: `open`, `point`, `fist`, `thumb`, `hold` (+ a prop callback drawn in the hand frame) |
| Head-to-frame | close shots: owl 1.1 - 1.3 scale (about 520 px tall); wide shots at least 0.6 |

Animation rules:
- Rubber-hose bounce: squash 0.07 on every beat while idle; 0.25 - 0.45 on punches and landings, damped cosine; volume kept.
- Anticipation before every big action: crouch 0.2 s before a leap, arm wind-up before a toss, shears open before the snip.
- Hands are IK targets: a pose is "where the glove goes". Keys are `[time, x, y, hand, hold]` and ease between keys.
- Signature owl moves: head swivel (`yaw` 180 to 0 with back-ease overshoot; a 360 spin on landings), head tilt when curious, tufts perk on surprise.
- Blinks seeded about every 2.1 s (`K.blinkAt`), forced open during surprise; `wink` for the sign-off.
- Expressions: `mouth` closed, smile, grin, open, o; `brow` -1..1.5; `eyeUp` eye pop; brass `!` for discoveries.

## 6. Camera

- One virtual camera `{x, y, z}` keyed with a monotone Hermite spline (`K.mkTrack`): no overshoot.
- One long set: wall at parallax 0.9, bench and props at 1.0, foreground ferns at 1.25.
- Close stations at z 1.0; the title wide at z 0.9; opening push from 1.12.
- Transitions are diegetic: the **brass deco iris** (opens on the lab), the **truck** along the bench with the owl walking, and the **leap** (owl jumps to the next station while the camera follows). No crossfades.
- Moves start and land on beats.

## 7. Timing (beat grid)

- The theme is electro-swing at 133 BPM, and the intro runs the full song (57.3 s): beat 0.451 s, bar 1.804 s. Write times as `K.at(bar, beat)`.
- Intro grid: the whole song (song_raw 1.95 - 59.2 s), 32 measured downbeats from `K.G.BARS = [0.021, 1.825, ...]` at 1.80443 s per bar (see `intro/src/10_setup.js`).
- Each sung line has its own picture: "Fit it RIGHT" is the snip (18.07; the second chorus prunes wild twigs on 39.72), "Validate every little bit" is ticks on eighths, "Trees and nets" is the two plants growing, "Modern ML for Trading" is the plants blooming (first chorus) and the marquee drop (45.13, final chorus), "steal the show" is a spotlight bow, "an owl in a lab with a data seed" is the raised glowing seed, "grows a little model on features to feed" is feature pellets thrown into a nursery pot, "train it, test it, walk it forward" is train/test windows stepping on beats, "no peeking at the future" is a brass shutter and covered eyes, "keep the backtest clean" is a feather duster. Instrumental bars get the lamps flickering on, a train-accuracy gauge creeping into the red, and swing dances.
- Pops land on beats with a back-ease overshoot of 0.35 - 0.45 s; staggers are 1/2 or 1/4 beat; marquee bulbs chase on eighths.
- Determinism: no `Math.random`, `Date.now` or `performance.now`. Seeded `hash` / `mulberry` only.

## 8. Explainer elements in this world (for episodes)

| Slide content | Draw it as | Kit call |
| --- | --- | --- |
| Time series, fit, forecast | botanical plate: graph paper in a brass deco frame; lines draw left to right; `band` for uncertainty | `K.plate`, `K.plateMap` |
| Bars, histogram, distribution | the same plate with `kind: "bar"` / `"area"` | `K.plate` |
| Scatter, data points | plate with `kind: "scatter"`, points pop on sixteenths | `K.plate` |
| Overfit vs good fit | a vine through every point vs a smooth vine; prune with `K.shears` | compose (intro `20_lab.js`) |
| Cross-validation, folds | flasks with train (green) and test (amber) layers + fold strips | `K.flask`, `K.check`, `K.cross` |
| Graph node / edge, pipeline | flask joined by glass tubes with flowing bubbles | `K.flask`, `K.tube` |
| Big number, metric | brass gauge with green/amber/red zones and a chalk readout | `K.gauge` |
| Small label, number | paper tag on a string | `K.tag` |
| Table | catalogue index card, header in Oswald green, highlight row in glass green | `K.card` |
| Formula | green chalkboard in a brass deco frame, written letter by letter | `K.board` |
| Bullets, agenda | seed-packet rack, one packet per item, each on its own beat | `K.packets` |
| Code (Python) | typewriter page on a platen; keywords green, numbers copper, strings oxblood | `K.typewriter` |
| Decision tree, boosting | potted tree, each level a split, leaves carry values | `K.treePlant` |
| Neural network | vine of bud-neurons joined by tendrils; `pulse` sends activation through | `K.netVine` |
| Episode title | art-deco marquee with chasing bulbs + DOM text | `K.marquee` |
| Data, a dataset | the data seed (green capsule engraved with candles) | `K.seed` |

Layout rules for explainer shots:
- At most 2 explainer objects in frame, plus the owl reacting (pointing glove, magnifier, thumbs-up, finger wag).
- Text sits on paper, card, chalkboard or the marquee glass; contrast AA or better.
- Keep a 64 px safe margin; plates, cards and boards stay fully in frame while read.
- Numbers on screen are the script's numbers. The drawing never invents data.

## 9. Do / don't

Do: move through one lab with a camera; let the owl react to every reveal; land pops on beats; use green for generalisation, amber for out-of-sample, oxblood for overfit.
Don't: draw flat slide cards; boil text; let the camera step at 12 fps; use neon or decorative gradients; put language-specific words in the drawn world (numbers, icons and code only), so one render path serves en, ru, zh-CN and zh-TW.
