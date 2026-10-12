# Style bible: "The Coral Exchange"

Collection: **marketmaker-general**, the channel-wide Marketmaker style for articles outside collections (algo investor skills, attractors and chaos in markets, Bill Williams indicators, complex manifolds in algorithmic trading, and anything else).
Title card: **Marketmaker**, subtitle "Algorithmic Trading Explained" (ru: "Алготрейдинг простыми словами", zh-CN: "算法交易讲解", zh-TW: "演算法交易講解").

Everything is drawn in code: canvas 2D through the kit in `style/kit/`, the timeline is HyperFrames + GSAP.
No image or video models are used. The values below are the same as in `kit/05_palette.js` and the kit modules. Change them together.

## 1. The world in one sentence

Under the sea, a coral reef is a stock exchange: coral towers carry ticker strips, clam shells are trading desks, fish are the traders, and **Otto**, a cheerful octopus with round sunshine glasses and a blue bow tie, is the market maker who quotes a bid with one arm and an ask with another.
Slide content is always a **reef screen** (a rounded card with a coloured tab) or a **thing in this world** (cards in Otto's arms, a balance on his head, a price wave he surfs), never a flat slide.

How it differs from the other collections: crab = nautical surface cartoon with broken ink; owl = sepia; robot = neon 80s; mouse = 50s poster; raccoon = bazaar; cat and penguins = B&W vaudeville; hamster = 50s diner; turtle = surf poster; fox = noir. This one is a **bright flat-vector modern editorial cartoon**: saturated coral pink, ocean blue and sunshine yellow, clean continuous navy outlines, flat shadow bands, halftone dots, soft grain.

## 2. Palette (hex)

| Role | Token | Hex |
| --- | --- | --- |
| Outline, dark type (navy, never black) | `ink` / `inkSoft` | `#14204a` / `#3a4a7a` |
| Cards, boards, light type | `cream` / `creamShade` | `#fff6e6` / `#f3dfc0` |
| Otto skin / shadow / light / suckers | `octo` / `octoDark` / `octoLight` / `sucker` | `#ff6f91` / `#d94a74` / `#ffa3b8` / `#ffd9e1` |
| Glasses | `glasses` / `lens` | `#ffd23f` / `#c9f1ff` |
| Water (top to deep), light rays | `surface` `shallow` `mid` `deep` / `ray` | `#5cc6ec` `#1f8fd0` `#1460a8` `#0b3d7a` / `#b8f0ff` |
| Reef | `sand` `coral` `fan` `brain` `kelp` `rock` `shell` | `#ffd89a` `#ff7a59` `#b07cff` `#ffb340` `#19b39b` `#5a6fa8` `#ffe3ec` |
| Fish traders | `fishY` `fishT` `fishO` `fishB` | `#ffd23f` `#21c7c0` `#ff9442` `#5b7cff` |
| **Bid / buy side** | `bid` / `bidDark` | `#1fb5ff` / `#0b84c6` |
| **Ask / sell side** | `ask` / `askDark` | `#ff5c7a` / `#d93556` |
| Up / down candles, gains / losses | `up` / `down` | `#22c58b` / `#ff5c5c` |
| The spread, the key term, highlights | `sun` | `#ffd23f` |
| Chaos, volatility, attractors | `lilac` | `#9b7bff` |
| Alligator jaw / teeth / lips | `jaw` `teeth` `lips` | `#3d6bff` `#ff4f6d` `#22c58b` |
| Dark glass board (formula, code, attractor) | `board` / `chalk` / `grid` | `#0e2a5c` / `#f2f8ff` / `#2c5a9e` |

Rules: **blue always means bid/buy, coral-red always means ask/sell, sunshine always means the spread** (or the one thing to look at). Green/red are only for candles and P&L. Lilac only for chaos/volatility. Water is drawn as 6 flat bands, never a smooth gradient.

## 3. Line and texture

| Parameter | Value |
| --- | --- |
| Boil rate | 12 drawings per second (`boilFrame = floor(t * 12)`), soft: amplitude 0.3 - 1.0 world px (bodies 0.7 - 0.9, small parts 0.3 - 0.5) |
| Outlines | continuous (never broken), navy `#14204a`, width breathes 0.96 - 1.04x per boil frame |
| Outline widths (world px) | Otto head 6, arms 5.5, cards/panels 5 - 6, small parts 3 - 4; never under 2 screen px (`K.MIN_PX`) |
| Shading | flat shadow band (`shade`), flat highlight band (`hi`), halftone dots that grow toward the dark side (`dots`), flat sticker drop shadow (`drop`) |
| Grain | SVG noise, 10 % soft-light, steps at 12 fps |
| Vignette | radial, 38 % deep navy at the corners |
| Rounded everything | cards use `K.rrectPts` (straight edges, `sharp`), radius 18 - 28 |

What stays smooth (continuous time): camera, swimming, text layout, title letters. What boils: every contour. Text never boils.

## 4. Type

| Use | Font | Weight | Size at 1080p |
| --- | --- | --- | --- |
| Title "Marketmaker" | Unbounded | 900 | fit to 1240 px, max 150 px; coral offset shadow 0.05 em |
| Subtitle (on a navy pill) | Manrope (CJK: Noto Sans SC / TC 900) | 800 | fit to 1120 px, max 58 px (CJK 66 px) |
| Labels, bullets, panel tabs | Manrope | 600 / 800 | 30 - 44 px |
| Numbers, prices, code, tables | Roboto Mono | 500 / 700 | 26 - 58 px |

All fonts are local woff2 in `kit/fonts/` (Latin, Latin-ext, Cyrillic, Cyrillic-ext); CJK are Google Fonts `text=` subsets. New Chinese glyphs: `python3 style/kit/tools/fetch_fonts.py --cjk-text "<all Chinese text>"`.
Minimum readable size on screen is 24 px (multiply world sizes by the camera zoom).

## 5. Otto, the octopus market maker

| Part | Value (scale 1, local px; arm tips rest on y = 0) |
| --- | --- |
| Head | tall dome 272 x ~260, centre (0, -250), light spots, top highlight, blush cheeks |
| Eyes | r 31 x 33 at x = +/-52, y -236; pupils r 14; eyelids in skin colour for blinks |
| Glasses | round sunshine rims r 42 (navy outline 15 + yellow 8), bridge, temples; `glint` flash |
| Bow tie | bid-blue with a sunshine knot at y -121 (the market maker dresses for work) |
| Arms | 8, roots at y -128 from x -100 to 100; tapered 56 -> 13 px; suckers on the inner side; tip curl |
| Rest pose | a relaxed fan on the floor, outer tips curled outward (`K.OCTO_REST`) |
| On-screen size | close-ups head >= 260 px wide; wide shots >= 90 px |

Animation rules:
- Arms are IK-like: a pose is **where each tip goes** (`arms[i] = {x, y, bend, curl, card}`); the arm curve, taper and suckers follow. Never draw a straight stiff arm.
- Held things (cards, props) are drawn after the head, with the tip wrapping over them.
- Squash and stretch keeps volume (head only); 0.07 on every beat while idle, 0.3 - 0.38 on landings; stretch -0.25 to -0.35 on take-off.
- Anticipation: crouch (squash) before hops; cards pop with back-ease overshoot.
- Blinks seeded about 1 per 2.1 s (`K.blinkAt`); wink for jokes; `exclaim` "!" for discoveries.
- **Colour shift**: Otto changes skin with the market (`K.SKIN.calm/chaos/bull/bear`, `K.skinMix`). Use it for regimes.
- Singing / narration: `talk` 0..1 opens the mouth (driven by 8th notes in the intro, by the voice envelope in episodes).
- Always something alive: idle arm sway (`wave`), beat bob, blinks, the boil.

## 5b. Puff, the pufferfish intern (host B, the co-host)

Episodes are two-voice conversations: **Otto = host A** (the explainer, lower voice), **Puff = host B** (the curious co-host, higher voice).

| Part | Value (scale 1, local px, origin at the body centre) |
| --- | --- |
| Body | 216 x 200 sunshine-yellow `#ffcf4a` ball, cream belly, orange spots, halftone shading |
| Eyes | r 27 at x = +/-40, y -24; big pupils with highlights; eyelids; thick brows (`browTilt` for thinking) |
| Fins | pectoral fins on two-bone IK (40 + 38) ending in a fan blade; tail fan and dorsal fin wag |
| Puff-up | `puff` 0..1: body 1.45x, 18 cream spines grow from 10 to 40 px, eyes widen, mouth "o" |
| Intern badge | bid-blue lanyard with a cream badge and a coral star (no words) |
| On-screen size | 180 - 400 px tall; in the duo it floats beside Otto's head |

Acting: surprise = puff up + "!"; think = fin to chin, one brow up, a "?" thought bubble; point = a fin toward the target and a lean; worry = wobbly mouth, brows down; listening = look at the speaker and nod on their loudness.
Talking mouths for both hosts come from `K.talkMouth`: the loudness opens the mouth, and `K.viseme` picks m / a / o / e / u per syllable.

## 6. Camera and transitions

- One virtual camera `{x, y, z, rot}` per shot, keyed with a monotone spline (`K.mkTrack`), never overshooting.
- Reef set: sand at y ~1000, Otto's desk at (960, 945). Parallax: far towers 0.35, mid towers and kelp 0.65, traffic fish 0.8, set 1.0, front bubbles 1.25.
- Diegetic transitions only: **bubble curtain** (a wall of foam bubbles rising, full cover on the downbeat) and **ink cloud** (Otto inks; good before abstract/maths content). Panel flips (scaleX) between two boards. Camera cuts land on downbeats; whip pans with foam streaks.

## 7. Timing (beat grid)

- Theme song "Eight Arms on the Book": ska at ~153.5 BPM, beat 0.3909 s, bar 1.5636 s, first downbeat 0.095 s. `K.G.BARS` holds the measured downbeats; write times as `K.at(bar, beat)`. The intro uses a 29.6 s downbeat cut (intro + chorus, break, final hook).
- Every sung line starts on an even bar (see `intro/src/10_setup.js`); each line gets its own picture.
- Pops land on beats with a 0.3 - 0.45 s back ease; staggers are 1/2 or 1/4 beat (the eight-arm fan staggers 0.03 s).
- Determinism: no `Math.random`, `Date.now`, `performance.now`; seeded `mulberry` / `hash` only.

## 8. Explainer elements (for episodes)

| Slide content | Draw it as | Kit call |
| --- | --- | --- |
| Bid / ask / price quote | rounded colour card with an arrow and mono price, held by an arm or a fish | `K.card` |
| Big number, running P&L | number in a sunshine (or green) bubble; bump on change | `K.badge` |
| Price chart, candles, MAs, indicators | reef screen with candles, overlay lines, fractal arrows, buy/sell marks, histogram sub-panel | `K.chart` + `K.genCandles`, `K.sma`, `K.alligator`, `K.ao`, `K.fractals` |
| Chaos, phase space | Lorenz attractor on a dark board, colour ramp lilac -> sunshine, glowing head; returns the head point for Otto to trace | `K.attractor` |
| Manifold, surface, loss landscape | wireframe surface coloured by height (bid blue -> sunshine -> ask coral) with a white path | `K.manifold` |
| Formula | dark glass board, mono, typed letter by letter, key line in sunshine | `K.formula` |
| Table | cream reef screen, header strip, sunshine highlight row | `K.table` |
| Bullets, agenda | reef screen of bubble bullets that pop on beats | `K.bullets` |
| Code | dark code card, keywords coral, numbers sunshine, strings mint | `K.code` |
| Order book | ladder: asks coral above, bids blue below, size bars, the spread band in sunshine | `K.book` |
| Title | wavy cream plate with a coral rim + DOM text | `K.titlePlate` |
| Inventory / balance | a beam balanced on Otto's head with coin pans (see intro SC12) | compose |
| Trades | fish swim up, take a card, swim off carrying it (intro SC3/SC11) | `K.fish({card})` |
| Price path as a story | the price wave Otto surfs on a clam board (intro SC17) | compose |

Layout rules: at most 2 explainer objects plus Otto in frame; text only on cards/boards (AA contrast: navy on cream ~14:1, chalk on board ~12:1); 64 px safe margin; numbers on screen are the numbers in the script. Otto stands right of a board (`SIDE` place) and points with one arm; keep his face clear of arms and fish.

## 9. Do / don't

Do: build shots inside the reef and move the camera; let Otto react to every reveal (glint, wink, colour shift); keep bid blue / ask coral / spread sunshine consistent; land moves on downbeats.
Logo: the marketmaker.cc mark (`kit/assets/logo.svg`, inlined by `build.py` at `<!--__LOGO__-->`) sits top-right in a cream pill with a navy outline, 92 px tall, 48 px margin, the whole intro. Keep action and title plates out of that corner.

Don't: flat slide cards without the world; smooth gradients for water; black outlines; broken sketchy strokes (that is the crab); neon glow (only light rays, the spread glow and the attractor head glow); language-specific words in the drawn world of the intro (numbers and icons only). Localised text lives in DOM variables.
