# Style bible: "Inspector Vulpes"

Collection: **Causality & Lead-Lag in Markets** (ru: Причинность и lead-lag на рынках, zh-CN: 市场中的因果关系与领先滞后, zh-TW: 市場中的因果關係與領先落後).
Episodes cover causal forests and treatment effects, Granger causality, transfer entropy, lead-lag between assets and exchanges, confounders, and correlation vs causation.

Everything is drawn in code: canvas 2D through the kit in `style/kit/`, and the timeline is HyperFrames + GSAP.
No image or video models are used. The values below are the same as in `kit/05_palette.js` and the kit modules. Change them together.

## 1. The world in one sentence

Inspector Vulpes, a trench-coat detective fox, works a rainy film-noir city at night: assets are suspects, price moves are paw-print trails on wet asphalt, and a causal link is red string pinned between mugshots on a cork board.
He follows two trails to see who moved first (lead-lag), tests the link twice (Granger, transfer entropy), and finds the hidden confounder in the shadows.
Slide content is always a **thing in this world** (a case file, a chalkboard, a projected chart, a clue card), never a flat slide.

## 2. Palette (hex)

| Role | Token | Hex |
| --- | --- | --- |
| Ink (outlines, solid noir shadows) | `ink` / `inkSoft` | `#0b0a12` / `#2a2840` |
| Night sky top / mid / low, moon | `night` / `nightMid` / `nightLow` / `moon` | `#0f1024` / `#1b1d3d` / `#2e3262` / `#e8ebf5` |
| Buildings | `bldg` / `bldgDark` / `bldgLight` | `#1d1f38` / `#121326` / `#33375e` |
| Street, puddles, rain, fog | `street` / `streetLight` / `puddle` / `rain` / `fog` | `#171930` / `#262a4c` / `#353c74` / `#aab4e6` / `#5d6494` |
| Greys | `grey` / `greyLight` / `greyDark` | `#8b8fa8` / `#c4c7d8` / `#55597a` |
| **The one warm accent**: lamp light, clues, the leader | `amber` / `amberDeep` / `amberGlow` / `amberDim` | `#ffb43f` / `#d8801a` / `#ffe3a0` / `#9a5c1c` |
| Fox fur / shadow / cream mask | `fur` / `furDark` / `cream` | `#d9823f` / `#8f4824` / `#f2e8d2` |
| Trench coat, fedora | `coat` / `coatDark` / `hat` / `hatDark` | `#8d8062` / `#5b5240` / `#34354a` / `#1c1c2a` |
| Brass (magnifier, badges) | `brass` / `brassDark` | `#c9a24a` / `#8a6a24` |
| Evidence string (a causal link only) | `string` / `stringDark` | `#d23a3c` / `#8a1e24` |
| Cork board | `cork` / `corkDark` / `corkLight` | `#8a6a48` / `#5e4630` / `#a8855c` |
| Paper (case files, photos, tags) | `paper` / `paperShade` | `#ece6d4` / `#c7bea6` |
| Chalkboard | `board` / `chalk` | `#1e2a26` / `#eef0f6` |
| Test passed / failed | `good` / `bad` | `#8fd18f` / `#e05a5a` |
| Suspects: A leads, B lags, C, D, Z = confounder | `A` `B` `C` `D` `Z` | `#ffb43f` `#7fb6d0` `#a7c48a` `#d99ab8` `#9d86d6` |

Rules: the frame is mostly indigo, black and grey. Amber is the only warm light, and it always means "the clue" or "the leader" (lamp pools, the A trail, a hot string, the title marquee). Red appears only as evidence string. Never fill large areas with fox orange or amber; they are accents on a cool night.

## 3. Line and texture

| Parameter | Value |
| --- | --- |
| Boil rate | **12 drawings per second**: `boilFrame = floor(t * 12)`; vertex jitter from `hash(vertex, seed + frame * 7919)` |
| Boil amplitude | 0.4 - 1.6 world px (small parts 0.4 - 0.8, bodies 1 - 1.3, clouds 1.4) |
| **Noir brush line** | every outline is a filled ribbon, not a pen stroke. On closed shapes the side that faces lower-right (away from the lamp) is up to 2.2x heavier (`0.62 + 1.55 * max(0, n · (0.6, 0.8))`). Open lines taper at both ends (`taper: false` keeps limbs and string even). About 5 % dry-brush breaks. |
| Outline widths (world px at zoom 1) | fox 5 - 6, props 3.5 - 5, fine detail 2.5 - 3; never thinner than 2 screen px (`K.MIN_PX`) |
| Shading | solid dark shadow band = shape minus its offset copy (`shade: {dx, dy}`), light from upper-left; dry-brush hatching only on cloth (coat, 12 px, 18 %) |
| Light | additive cones and pools (`K.cone`, `K.pool`), venetian-blind stripes across rooms (`K.blindLight`), lightning (`K.flash`) |
| Rain | screen-space streaks on continuous time (not boiled), two layers; ripples on the floor |
| Film grain | neutral grey SVG noise, 16 % overlay, steps at 12 fps |
| Vignette | radial, 62 % indigo-black at the corners |

What stays smooth (continuous time): camera, rain, walking positions, text layout, title letters.
What boils: every contour, string, paper edges. Text never boils.

## 4. Type

| Use | Font | Weight | Size at 1080p |
| --- | --- | --- | --- |
| Title (marquee) | Yanone Kaffeesatz (condensed pulp sans), cream line + amber line, 3 px ink stroke, 7/8 px hard drop shadow | 700 | up to 124 px line 1, 0.86x line 2 |
| Title, Chinese | Yanone (Latin) + Noto Serif SC / TC (glyphs) | 700 / 900 | up to 108 px |
| Labels, notepad, titles on cards | Yanone Kaffeesatz | 500 / 700 | 32 - 50 px on screen |
| Numbers, tickers, code, tables (typewriter) | Cousine | 400 / 700 | 26 - 56 px on screen |

All fonts are local woff2 in `kit/fonts/` (Latin, Latin-ext, Cyrillic, Cyrillic-ext). CJK fonts are Google Fonts `text=` subsets; for new Chinese glyphs run `python3 style/kit/tools/fetch_fonts.py --cjk-text "<all Chinese text>"`.
Title fit: Yanone 700 runs about 0.43 em per Latin glyph and 0.47 em per Cyrillic glyph; the plate gives 1380 px of line width.
Minimum readable text on screen: 24 px (multiply world sizes by 1 / zoom in wide shots).

## 5. Inspector Vulpes (the fox)

| Part | Value (scale 1, local px, feet at y 0) |
| --- | --- |
| Height | about 380 to the fedora crown; head centre y -276 |
| Coat | khaki trench, shoulders y -206 (+/-56), hem y -62 (+/-80), belt y -125 with brass buckle, popped collar, red tie |
| Head | wide cheeks with fluff points, cream heart-shaped mask, black nose; `turn` slides features for a pseudo 3/4 view |
| Eyes | almond, amber iris with slit pupil, half-lidded by default (`lid` 0.25 - 0.35 = sly) |
| Ears | outside the fedora brim, black inside |
| Fedora | charcoal, pinched crown, black band; `hatTip` / `hatLift` |
| Tail | bushy, from under the coat on his left, cream tip, sways |
| Arms | two-bone IK 62 + 58, coat sleeves, dark paws; props: `magnifier`, `flashlight`, `pin` |
| Head-to-frame | close shots 1.4 - 1.7 scale; street shots 1.0 - 1.1; never under 0.6 |

Animation rules:
- Squash and stretch with volume kept; 0.06 - 0.08 beat bounce while idle, 0.25 on landings and crouches.
- Anticipation before big actions (crouch before looking down, squash before the newspaper drops).
- Paws are IK targets: a pose is "where the paw goes". Never rotate the arm bones by hand.
- Expressions: `mouth` smirk (default), smile, grin, open, o, flat; `brow`, `browTilt` (skeptical), `eyeUp` (surprise), `exclaim` (amber "!"), `lensEye` (the giant eye in the magnifier), a wink.
- Blinks are seeded (`K.blinkAt`) and forced open during surprises.
- Something is always alive: beat bounce, tail sway, the boil, rain.

## 5b. Sergeant Basset (the co-host) and the duo

Episodes are told by two hosts: **host A = Inspector Vulpes** (the explainer, lower voice) and **host B = Sergeant Basset** (the curious one who writes things down and asks, higher voice). Watson to the inspector.

| Part | Value (scale 1, local px, feet at y 0) |
| --- | --- |
| Height | about 330 to the cap crown (0.87x the fox); head centre y -254; stocky, wide |
| Coat | navy police coat (`P.uniform` / `uniformDark` / `uniformLight`), brass buttons, black belt with brass buckle, shoulder badge, cream chest blaze |
| Head | tan basset (`P.hound`, `houndDark`, `houndLight`), white blaze, heavy jowls, big black nose |
| Eyes | droopy, lids at 0.42 by default, bags under them; `eyeUp` opens them round and lifts the ears |
| Ears | long, dark (`P.houndEar`), swing with motion (`ears`) |
| Cap | navy peaked police cap with a brass badge; `capTip` |
| Arms | two-bone IK 50 + 48; left paw holds the spiral notebook upright (by its bottom edge, never over the face), right paw the pencil; `write` scribbles |
| Legs and tail | stubby legs, big paws, wagging tail with a cream tip |

Talking (both hosts): one loudness value per frame (0 - 1, from the narration sync) drives `pose.talk`. `K.speech` turns it into viseme-ish shapes (A open, O round, E wide, M closed) that change about 7 times a second, seeded and deterministic; `pose.viseme` forces a shape. Mouth interior `P.mouthIn` with a `P.tongue` when wide open. Below talk 0.06 the normal expression mouth returns.

Listening: the silent host looks at the speaker, leans in a little, tilts the head and nods on the speaker's stressed syllables (`otherAccent`). The fox never stands frozen while the hound talks, and the reverse.

Gestures (`K.gesturePose`): point (the fox shows a finger; the hound points with the pencil), nod, surprise (`!`, eyes round), think (paw to chin, the hound gets a `?`), present (open paws), shrug, tip (hat / cap), write (hound only). Beat gestures fire on accents while talking, so a long sentence never reads as a static mouth.

Duo placement (`K.duo`, screen space, after `K.screen`):
- Hosts are large: fox scale 1.2 - 1.3 (about 460 - 500 px tall), hound at the same scale; never under 300 px tall in a duo shot.
- Default: fox feet at (360, 1060), hound to his right at 330 * scale; mirror with `side: -1` when the explainer object is on the left.
- Hosts sit in the lower third and stand on one shared puddle of lamplight; the explainer object takes the upper two thirds and the free side.
- The listener is drawn first, the speaker on top. Pointing targets are screen points on the object being explained; props (`propA` / `propB`) are kit objects held up at the paw.
- Keep both hosts fully in frame while they talk; cut-ins to one host use the solo rigs at 1.4 - 1.7.

## 6. Sets and camera

- **Street** (side view): curb y 760, sky in screen space, moon parallax 0.15, clouds 0.25, far skyline 0.45, near buildings 0.8, street plane 1.0. Lamps throw amber cones and pools; road reflections wobble.
- **Office**: back wall with stripes, window with venetian blinds (`K.blindsWindow`) showing the city and rain, desk, desk lamp, moonlight stripes over everything (`K.blindLight`).
- **City map** (from above): dark roof blocks on a lighter road grid with lane dashes, lamp glows at crossings, the fox seen from above (fedora + tail).
- **Lineup** and **cork board**: overhead cones, dark corners, flashlight beams cut through a darkness mask.
- One virtual camera `{x, y, z, rot}` per set, keyed with monotone Hermite splines (`K.mkTrack`), never overshooting.
- Transitions are diegetic: the **spinning newspaper** (camera rot + zoom), the **magnifier iris** (brass ring), a **lightning cut** on the downbeat, **venetian blinds** closing and opening, and lights that clank on. Never a plain crossfade.

## 7. Timing (beat grid)

- The theme is a jazz-noir spy song at about 123.8 BPM (short cut): a bar is 1.94 s. Write times as `K.at(bar, beat)`.
- The intro's grid is the measured downbeats `K.G.BARS = [0.16, 2.09, 4.04, ..., 31.15]` (librosa).
- The marketmaker.cc logo (`kit/brand/logo.svg`, inlined by `build.py` at `<!--__LOGO__-->`) sits top-right on an ink plaque with an amber hairline, 48 px margin, 96 px tall; keep action and titles clear of it.
- Each sung line gets its own picture (see `intro/src/10_setup.js` for the word timings and `intro/REVIEW.md` for the outline).
- Pops land on beats with a back-ease overshoot of 0.3 - 0.45 s; paw prints stamp one per beat (street) or one per eighth (map).
- Determinism: no `Math.random`, `Date.now` or `performance.now`, no infinite repeats. Seeded `mulberry` / `hash` only.

## 8. Explainer elements in this world (for episodes)

| Slide content | Draw it as | Kit call |
| --- | --- | --- |
| Asset, exchange, variable (graph node) | suspect mugshot polaroid pinned to the cork board; ticker in the strip; hot = amber frame; hidden = black silhouette with glowing eyes (confounder) | `K.node` |
| Causal link, weight, lag | red string with a direction arrow; tag with the lag; hot = amber glow; dim; cut = snapped (spurious link) | `K.edge`, `K.edgePoint`, `K.tag` |
| Lead-lag between two series | two paw-print trails, the follower's prints shifted by the lag; a Δt bracket | `K.paw`, `K.trail` |
| Board / canvas for a graph | cork board in a dark frame | `K.corkboard`, `K.pin` |
| Big number | evidence placard (tent card) | `K.plank` |
| Table | typed sheet clipped in a manila case file; highlight row in amber marker | `K.ledger` |
| Formula, test statistic | precinct chalkboard, written letter by letter | `K.slate` |
| Chart (time series, cross-correlation by lag, bars) | projected on a pull-down screen; `lagMark` bracket | `K.screenChart` (alias `K.sailChart`) |
| Correlation scatter | index clue card; fit line; "≠" rubber stamp for "not causation" | `K.scatter` |
| Bullets, agenda | the fox's spiral notepad, paw-print bullets | `K.notice` |
| Code (Python) | typewriter page | `K.logbook` |
| Zoom on a detail | magnifying glass over the scene | `K.magnify` |
| Episode title | art-deco marquee plate with chasing bulbs; DOM text on top | `K.banner` |
| Lineup / comparison of assets | full-body suspects with ticker badges in front of the height chart | `K.suspect`, `K.lineupWall` |
| Headline / key finding | spinning newspaper front page | `K.newspaper` |

Layout rules for explainer shots:
- At most 2 explainer objects in frame plus the fox reacting (magnifier, flashlight, finger tap, hat tip).
- Text sits on paper, board or tags, never on raw night. Contrast AA or better (ink on paper about 15:1, chalk on board about 13:1).
- 64 px safe margin; readable objects stay fully in frame while they are read.
- The numbers on screen must be the numbers from the script.

## 9. Do / don't

Do:
- keep the frame dark and cool; let one amber light lead the eye;
- make every reveal a light event (lamp, flashlight, lightning, marquee);
- land pops on beats and keep the camera smooth between them;
- let the fox react to every clue.

Don't:
- use flat slide cards or type-slam posters;
- boil text, or step the camera or rain at 12 fps;
- add a second warm colour, neon glow, or gradients as decoration (only light cones, pools, glows and the sky);
- use red for anything except evidence string (and `bad` for a failed test / cut string);
- put language-specific words in the drawn world (tickers, numbers, symbols only). Localised text lives in DOM variables.
