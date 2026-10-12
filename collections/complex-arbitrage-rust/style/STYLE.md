# Style bible: "The Arbitrage Crab"

Collection: **Complex Arbitrage in Rust** (ru: Сложный арбитраж на Rust, zh-CN: Rust 复杂套利, zh-TW: Rust 複雜套利).
Six episodes: graph cycles (Bellman-Ford, negative cycles), futures-spot basis, vector/matrix/tensor methods, vine copulas, ML, execution in Rust.

Everything is drawn in code: canvas 2D through the kit in `style/kit/`, and the timeline is HyperFrames + GSAP.
No image or video models are used. The values below are the same as in `kit/05_palette.js` and the kit modules. Change them together.

## 1. The world in one sentence

Captain Ferrous, a rusty-orange crab, sails an iron-riveted ship across a sea where every island is a currency or exchange.
The sea routes between islands are exchange rates, and a profitable cycle is a route the crab can sail for gold.
Slide content is always a **thing in this world**, never a flat slide (the rejected `flat-infographic-cards` and `riso-poster-kinetic` styles read as slideshows).

## 2. Palette (hex)

| Role | Token | Hex |
| --- | --- | --- |
| Ink (all outlines, dark type) | `ink` | `#2b1d16` |
| Secondary ink, hatching | `inkSoft` | `#5a4334` |
| Parchment / cream type | `paper` / `paperShade` | `#f6e8c8` / `#e2cc9c` |
| Crab body / shadow / light / belly | `rust` / `rustDark` / `rustLight` / `belly` | `#e0632a` / `#a8401c` / `#f79a5c` / `#f6b57e` |
| Captain cap | `capNavy` / `capNavyDark` | `#26364f` / `#17223a` |
| Gold, profit | `gold` / `goldDark` / `profit` / `profitGlow` | `#ffc53d` / `#c98a12` / `#ffc93c` / `#fff1a8` |
| Iron hull | `iron` / `ironDark` / `ironLight` / `rivet` | `#526777` / `#33424f` / `#7f96a6` / `#c9d6dd` |
| Wood, sail | `wood` / `woodDark` / `sail` / `sailShade` | `#9a6236` / `#6b3f22` / `#f3e6c6` / `#d9c59a` |
| Sky top / mid / low, sun | `skyTop` / `skyMid` / `skyLow` / `sun` | `#6fc0d6` / `#a9dcdc` / `#fde6b3` / `#ffd166` |
| Sea far / mid / deep, foam | `seaFar` / `seaMid` / `seaDeep` / `foam` | `#5fb3c4` / `#2f8fa8` / `#1d6a86` / `#f7f3e6` |
| Island sand / grass | `sand` / `grass` (+ `Dark`) | `#f2d38d` / `#73b351` |
| Parrot body / dark / light / belly | `parrot` / `parrotDark` / `parrotLight` / `parrotBelly` | `#5fbf4a` / `#3c8a33` / `#9ad97a` / `#ffe08a` |
| Parrot wing tips, beak, crest | `parrotWing` (`parrotWingDark`) / `beak` (`beakDark`) / `crest` | `#2f7fc0` (`#1f5a8c`) / `#efe2c0` (`#c9b98e`) / `#f79a5c` |
| Loss, negative numbers | `loss` | `#d64545` |
| Gain text on paper | (green) | `#2f8a3e` |
| Dark board, chalk | `board` / `chalk` | `#3b2b22` / `#f6f1e3` |
| Currency islands | `BTC` `ETH` `USDT` `SOL` `EUR` `BNB` `USD` | `#f39b2c` `#7b83eb` `#26a17b` `#a25ddc` `#3a6ea5` `#e8b923` `#5b9b4a` |

Rules: one warm hero colour (rust) on a cool sea. Gold means money and the winning path. Never put blue directly into orange in a gradient: it turns grey. Golden hour warms only the lower sky (`sideSky({warm})`).

## 3. Line and texture

| Parameter | Value |
| --- | --- |
| Boil (redraw) rate | **12 drawings per second**: `boilFrame = floor(t * 12)`; vertex jitter = `hash(vertex, seed + frame * 7919)`. At 30 fps export holds alternate 3/2 frames. |
| Boil amplitude | 0.6 - 2.4 world px (small parts 0.6 - 1, bodies 1.4 - 1.8, big waves 2 - 2.4) |
| Outline widths (world px at zoom 1) | hero/crab body 5.5, hull 6, props 3.5 - 4.5, fine detail 2.5 - 3; never thinner than 2 screen px (`K.MIN_PX`) |
| Broken strokes | about 7 % of outline segments skipped (`gap: 0.07`), width varies 0.86 - 1.14x |
| Shading | flat shadow band = shape minus its offset copy (`shade: {dx, dy}`), light from upper-left, shadow lower-right; optional hatching, 9 - 14 px spacing, 18 - 28 % opacity |
| Paper grain | SVG noise overlay, 13 % multiply, steps at 12 fps |
| Vignette | radial, 42 % warm-black at the corners |

What stays smooth (continuous time, never stepped): camera, ship travel, text layout, title letters.
What boils: every contour, ropes, paper edges. Text never boils.

## 4. Type

| Use | Font | Weight | Size at 1080p |
| --- | --- | --- | --- |
| Title (banner) | Rubik | 900 | 100 - 124 px line 1, 0.82x line 2 (accent line in rust with 7 px ink stroke) |
| Title, Chinese | Rubik (Latin) + Noto Sans SC / TC (glyphs) | 900 | 150 px, one line |
| Labels, notice text | Rubik | 500 / 800 | 36 - 48 px on screen |
| Numbers, rates, code, tables | JetBrains Mono | 500 / 700 | 28 - 56 px on screen |

All fonts are local woff2 in `kit/fonts/` (Latin, Latin-ext, Cyrillic, Cyrillic-ext). CJK fonts are Google Fonts `text=` subsets that hold only the glyphs in use. When an episode needs new Chinese glyphs, run `python3 style/kit/tools/fetch_fonts.py --cjk-text "<all Chinese text>"` again.
The minimum readable size of text on screen is 24 px. In zoomed-out chart shots, world sizes must be multiplied by `1 / zoom`. For example, rate tags are 46 world px, which is 29 px on screen at zoom 0.63.
Cyrillic runs about 7 % wider than Latin in Rubik 900, so the title fit uses 1840 / chars instead of 1980 / chars.

## 5. Captain Ferrous (the crab)

| Part | Value (scale 1, local px) |
| --- | --- |
| Body | 132 x 84, domed back, flatter belly; centre 62 above the feet |
| Eyes | on stalks at x = +/-44, 82 above body centre, r 18 white, pupil 8.5, highlight 3 |
| Cap | navy captain's cap with a gold cog badge, sits between the stalks |
| Arms | two-bone IK, 36 + 34, shoulders at body sides; claws 1.05x, big upper pincer |
| Legs | 3 per side, knee arches above the hip, feet at 60 - 94 px out; tucked under the body in the air |
| Head-to-frame | close shots: body 180 - 220 px wide on 1080p; chart shots: at least 60 px |

Animation rules, as lessons from the rejected stiff `paper-cut-stopmotion` puppet:
- Squash and stretch with volume kept (`squash`: x * (1 + s/2), y / that). Squash 0.1 on every beat while idle and 0.35 - 0.4 on landings.
- Anticipation before every big action: crouch 0.3 s before a jump, and squash before raising the spyglass.
- Claws are IK targets, so a pose is "where the claw goes". Never rotate the arm segments by hand.
- Blinks are seeded at about 1 per 1.9 s (`K.blinkAt`) and forced open during surprise.
- Expressions: `mouth` smile, grin, open, o; `brow` -1..1.5; `eyeUp` for eye pops; and a `!` mark for discoveries.
- Always something alive: a beat bounce, a claw sway, stalk wobble, the boil.

### Pip the parrot (first mate, episode co-host)

| Part | Value (scale 1, local px) |
| --- | --- |
| Body | 76 x 104 egg, leaf green `parrot` with a pale-gold belly, navy neckerchief matching the cap |
| Head | r 36 at (0, -138), pale macaw face patches, eyes r 11, three `crest` feathers that wobble |
| Beak | bone `beak`, hooked; the lower mandible drops with `talk` |
| Wings / tail | `parrotDark` wings with `parrotWing` blue tips (raise 0..1 per side), two long tail feathers (crest orange, wing blue) |
| Size | about 0.8x the crab; stands on `K.perch` (a post with a cross bar) |

In episodes the crab is host A (the narrator who explains) and the parrot is host B (the curious one). `talk` (0..1) drives both mouths from the narration loudness. Gestures come on stressed words. The listener looks at the talker and nods.

## 6. Camera

- There is one virtual camera `{x, y, z, rot}` per set, keyed with a monotone Hermite spline (`K.mkTrack`) so it never overshoots.
- **Side set** (horizon at y 560 - 640): sky parallax 0.4, far sea 0.7, ship plane 1.0. Push-ins are at most 1.2x over 4 s.
- **Chart set** (sea seen from above): zoom 0.6 shows the whole archipelago, 0.75 - 0.8 a triangle, and 1.8 - 2.3 a close-up on the ship.
- Transitions are diegetic: the **spyglass iris** goes into the chart (brass ring 22 px), and a **wave wipe** goes back to the side set. Never use a plain crossfade.
- Do not cut a camera move on a non-beat. Moves start and land on beats or accents.

## 7. Timing (beat grid)

- The theme song is a sea shanty at about 126 BPM: a beat is 0.476 s and a bar (4 beats) is 1.906 s. Write times as `K.at(bar, beat)`.
- Retime to a real song by setting `K.G.BPM` and `K.G.BARS` (the list of measured downbeat times). Measured downbeats are better than one `OFFSET`, because a song cut from several takes drifts at each splice. Bars past the list extrapolate at BPM.
- The intro runs the full length of a short song (20 - 30 s; here `song_short.m4a`, 31.5 s: silence trimmed, 1.2 s fade, two-pass loudnorm -14 LUFS). It is 120 BPM, so bar n starts at `0.35 + n * 2.0` s. Measure the tempo from repeated sung lines (whisper word times) when the beat tracker drifts. Each sung line gets its own picture: "cycle flows" is the glowing loop, "graph and matrix" is rates flying into a matrix, "futures, spot and copula sea" is two ships on one swell, and "sail with me" is the title hit. The title card holds through the instrumental outro.
- **Logo:** the marketmaker.cc logo (`kit/assets/marketmaker-logo.svg`, inlined by `build.py` at the `<!--__LOGO__-->` marker) sits top-right for the whole intro. It is a 96 px paper plate with a 4 px ink border, 48 px from the edges. It makes one small bounce on the first downbeat and is otherwise static. Keep action, the sun, the matrix and the banner below y 160 or left of x 1380.
- Pops (islands, tags, medallions) land on beats, with a back-ease overshoot of 0.35 - 0.45 s. Staggers are 1/2 or 1/4 beat.
- Determinism: no `Math.random`, `Date.now` or `performance.now`, and no infinite repeats. Seeded `mulberry` / `hash` only.

## 8. Explainer elements in this world (for episodes)

| Slide content | Draw it as | Kit call |
| --- | --- | --- |
| Graph node (asset, exchange) | island with a currency coin on a pole; hot = glow | `K.node` |
| Graph edge, weight | sea route: ink rope + dashed light that flows; tag with the rate; hot = gold + arrow; dim = 35 % | `K.edge`, `K.tag` |
| Negative cycle / arbitrage loop | the hot cycle; the ship sails it (`K.edgePoint` gives position and heading); coin splash on arrival | `K.edgePoint`, `K.goldBit` |
| Big number, running total | wooden plank sign on a post; bump-scale 12 % when it changes | `K.plank` |
| Table (order book, pairs) | torn parchment ledger; header in Rubik 800 rust; highlight row in gold | `K.ledger` |
| Formula | slate board in a wood frame, chalk JetBrains Mono, written letter by letter; key term in gold | `K.slate` |
| Chart (time series, basis, bars) | painted on a sail-cloth that billows; lines draw left to right; bars grow with back ease | `K.sailChart` |
| Bullets, agenda | harbour notice board; each bullet is a coin and pops on its own beat | `K.notice` |
| Code (Rust) | the captain's logbook; keywords rust-dark, numbers blue, strings green; typed out | `K.logbook` |
| Matrix / tensor | a grid of crates or coins (stack height = value); reuse `K.coin` / `K.goldBit` | compose |
| Distribution / copula | sand dunes or wave heights on the chart sea; contours as foam lines | compose with `K.line` |
| Episode title | unrolling ribbon banner with DOM text | `K.banner` |

Layout rules for explainer shots:
- Keep at most 2 explainer objects in frame at once, plus the crab reacting (pointing with an IK claw, the spyglass, a thumbs-up claw).
- Text sits on paper or slate, never on raw sea. Contrast is AA or better (ink on paper about 14:1, chalk on board about 12:1).
- Leave a 64 px safe margin. The plank, ledger and slate stay fully inside the frame when they are read.
- The numbers on screen must be the numbers from the script. The drawing never invents data.

## 9. Do / don't

Do:
- build a world with a camera, and move through it;
- let the crab react to every reveal;
- put pops on beats and smooth camera moves between them;
- use gold only for money and the winning path.

Don't:
- use flat slide cards, type-slam posters or stiff paper puppets (all rejected);
- boil the text, or let the camera judder at 12 fps;
- use photo textures, gradients as decoration or neon glow (only the sun, a hot route and a lighthouse beam glow);
- put more than about 8 edges with tags in one shot (tags start to collide);
- put language-specific words in the drawn world (tickers, numbers and icons only), so one render path serves en, ru, zh-CN and zh-TW. Localised text lives in DOM variables.
