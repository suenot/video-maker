# Style bible: "Tikki's Bazaar"

Collection: **Order Book & Market Microstructure** (ru: Стакан и микроструктура рынка, zh-CN: 订单簿与市场微观结构, zh-TW: 訂單簿與市場微觀結構).
Episodes: CCXT Pro websocket order books, candle construction beyond time bars, order flow imbalance prediction, queue position, spreads.

Everything is drawn in code: canvas 2D through the kit in `style/kit/`, and the timeline is HyperFrames + GSAP.
No image or video models are used. The values below are the same as in `kit/05_palette.js` and the kit modules. Change them together.

## 1. The world in one sentence

Tikki, a quick-witted raccoon merchant in a crimson fez, runs a bazaar whose market stalls are stacked into a tower: that tower is the order book.
Sellers' stalls (red awnings) are stacked above, buyers' stalls (green awnings) below, and the spread is the narrow alley between them.
Each resting limit order is a crate queued on a stall counter, a market order is a hand cart that races through the alley, and Tikki reads the stacks on an abacus and shouts the imbalance.
Slide content is always a **thing in this bazaar**, never a flat slide.

## 2. Art direction (how it differs from the crab's nautical world)

| | Crab (complex arbitrage) | Bazaar (this collection) |
| --- | --- | --- |
| Look | sunny cartoon, pen line | folk block print, woodcut |
| Line | broken pen stroke, round curves | solid knotty line, chiselled (low-tension) curves, paper nicks |
| Colour | rust hero on a cool sea | terracotta, saffron and teal on cream paper |
| Shading | pen hatching | carved gouge slivers, flat shadow band, ink-starved specks |
| Print | none | colour block offset from the key line (misregistration `K.REG`) |
| Sky | soft gradient | flat bands with carved wavy borders, a rosette sun |
| Fonts | Rubik, JetBrains Mono, Noto Sans | Yeseva One, Fira Sans Condensed, PT Mono, Noto Serif |
| Transitions | spyglass iris, wave wipe | kilim curtain roll-up / drop, roll-up stall shutters |

## 3. Palette (hex)

| Role | Token | Hex |
| --- | --- | --- |
| Woodcut ink (outlines, dark type) | `ink` / `inkSoft` | `#1f1720` / `#4a3340` |
| Print paper | `paper` / `paperShade` | `#f3e3c3` / `#dcc39a` |
| Terracotta | `terra` / `terraDark` / `terraLight` | `#c4583a` / `#8f3a26` / `#e08a64` |
| Saffron | `saffron` / `saffronDark` / `saffronLight` | `#f0a830` / `#c47b12` / `#f8cf7a` |
| Teal | `teal` / `tealDark` / `tealLight` | `#1f7a74` / `#13504c` / `#4fa69c` |
| Indigo (ask stall interiors, alley) | `indigo` / `indigoDark` | `#2e3a6e` / `#1d2650` |
| Bids (buyers, below) | `bid` / `bidDark` / `bidLight` | `#2f9460` / `#1f6a43` / `#8fd0a0` |
| Asks (sellers, above) | `ask` / `askDark` / `askLight` | `#c23b32` / `#8a2420` / `#f08e7c` |
| Raccoon fur / mask / muzzle | `fur` `furDark` `furLight` / `mask` / `muzzle` | `#8c8597` `#5d566a` `#c9c3cf` / `#2a2230` / `#f6efe4` |
| Fez, vest | `fez` / `fezDark`, `vest` / `vestTrim` | `#a82a3a` / `#6f1726`, `#1f7a74` / `#f0a830` |
| Wood, brass, plaster | `wood` / `woodDark` / `woodLight`, `brass`, `plaster` | `#a8693a` / `#6e4123` / `#cf9460`, `#d9a441`, `#ead2a6` |
| Crates (orders) | `crate` / `crateDark` | `#c98d4e` / `#8e5a2a` |
| Gold: our own order, money | `gold` / `goldDark` / `goldGlow` | `#e9b63c` / `#a8781a` / `#fff0b0` |
| Tiles (formulas) | `tile` / `cobalt` | `#f4f1ea` / `#2a4fa0` |
| Sky bands, city | `skyTop` `skyMid` `skyLow`, `cityFar` `cityMid` | `#e9a94f` `#f3c777` `#f8e2b0`, `#d99a6c` `#2f7f78` |

Rules: red always means asks / sellers / down, green always means bids / buyers / up. Gold is reserved for our own order (the starred crate) and money. Teal is the neutral "flow" colour (arrows, vests). Never use red or green as decoration.

## 4. Line and texture

| Parameter | Value |
| --- | --- |
| Boil (redraw) rate | **12 drawings per second**: `boilFrame = floor(t * 12)`; vertex jitter = `hash(vertex, seed + frame * 7919)` |
| Boil amplitude | 0.5 - 1.4 world px (smaller than the crab: a print is stiffer than a pen) |
| Outline widths (world px at zoom 1) | hero raccoon body 6, tower 6, stalls 4.5 - 5, props 3.5 - 4.5, fine detail 2.5 - 3; never thinner than 2.2 screen px (`K.MIN_PX`) |
| Curve tension `k` | 0.55 default (chiselled); 0 - 0.2 for planks, crates, arrows; 0.8 - 1 only for round things (eyes, coins, sun) |
| Knotty width | each segment 0.8 - 1.3x (fixed per seed) x 0.94 - 1.06 (boils) |
| Nicks | ~10 % of segments get a short paper-coloured chip across the line (`nicks`) |
| Misregistration | colour fill offset by `K.REG = [3.5, 2.5]` world px from the key line |
| Shading | flat shadow band (`shade`), carved gouge slivers (`gouge`), ink-starved specks (`specks`) |
| Textile patterns | `stripes` (awnings), `zigzag` (carts, rugs), `dots` (vest, sun), `diamonds` (alley, ground) |
| Paper grain | SVG noise overlay, 16 % multiply, steps at 12 fps; vignette 40 % aubergine at the corners |

What stays smooth (continuous time, never stepped): camera, crate travel, cart travel, text layout, title letters.
What boils: every contour, ropes, cloth edges. Text never boils.

## 5. Type

| Use | Font | Weight | Size at 1080p |
| --- | --- | --- | --- |
| Title (kilim banner) | Yeseva One | 400 | line 1 up to 114 px, line 2 up to 106 px; line 1 ink with a teal offset shadow, line 2 terracotta with a 5 px ink stroke and a saffron offset shadow |
| Title, Chinese | Yeseva One (Latin) + Noto Serif SC / TC 900 | 900 | 124 px, one line |
| Labels, prices on plaques, numbers on signs | Fira Sans Condensed | 600 / 800 | 34 - 60 px world |
| Code, tables of numbers, formulas | PT Mono | 400 | 21 - 54 px |

All fonts are local woff2 in `kit/fonts/` (Latin, Latin-ext, Cyrillic, Cyrillic-ext). CJK fonts are Google Fonts `text=` subsets that hold only the glyphs in use; run `python3 style/kit/tools/fetch_fonts.py --cjk-text "<all Chinese text>"` when an episode needs more glyphs.
Title fit: `1.0 * WIDE / chars` with WIDE 2760 (Latin) or 2580 (Cyrillic), capped at 106 px. The minimum readable size on screen is 24 px; in wide tower shots (zoom 0.5 - 0.6) the plaques are context only.

## 6. Tikki (the raccoon)

| Part | Value (scale 1, local px) |
| --- | --- |
| Body | 112 x 124 pear, centre y -96; cream belly; teal vest with saffron dot embroidery |
| Head | 156 x 124, centre y -210, jagged cheek ruff (woodcut tufts), ears at x +/-54 |
| Mask | bandit mask with eyes at x +/-30, r 15; light brow patches above (they lift with `brow`) |
| Fez | crimson, 70 tall, saffron band, ink tassel on a cord (secondary motion `tassel`) |
| Arms | two-bone IK 36 + 34 from shoulders (+/-50, -134); black paws: `open`, `fist`, `point`, `pinch` |
| Tail | ringed, 150 long, curls up to the right; sways (`tail`) |
| Prop | abacus in the left paw; 4 rods x 5 beads, red/green rows; `beads[r]` 0..1 slides them |
| Size on screen | medium shots 280 - 360 px tall; title card ~470 px tall |

Animation rules:
- Squash and stretch with volume kept. 0.07 on every beat while idle; 0.35 - 0.42 on landings.
- Anticipation before every big action: crouch before a jump, a big breath (stretch, mouth "o") before a shout.
- Paws are IK targets: a pose is "where the paw goes". Never rotate arm segments by hand.
- Secondary motion: the fez tassel lags and swings past (driven by speed or `lean`), the tail sways, ears flick on surprise.
- Blinks are seeded at about 1 per 1.8 s (`K.blinkAt`) and forced open during surprise and shouts.
- Expressions: `mouth` smile, smirk, grin, open, shout, o; `brow` -1..1.5; `eyeUp`; `!` mark; jagged speech burst `K.shout` with "!" or an arrow + number.
- Signature gestures: tipping the fez, flicking abacus beads, the clap that slams the book shut, the "tight" pinch, pointing along the flow.

## 7. Camera and sets

- One world camera `{x, y, z}` keyed with a monotone Hermite spline (`K.mkTrack`), plus additive accents (punch-in on a shout, shake on a slam).
- **Tower set**: the tower is 1100 wide, levels 150 high, the bid half stands on the ground at y 865, the alley sits on top of it at `YB0 = 115`. Wide 0.5 - 0.62 (whole book), medium 0.85 - 1.0 (Tikki on the balcony + best levels), close 1.2 - 1.5 (one queue).
- Background parallax: sky fixed, far city 0.3, near city 0.5, world 1.0.
- Transitions are diegetic: the **kilim curtain** rolls up to open a scene and drops to close one (it can stop part-way and become a title banner); stalls open by rolling up their **shutters** as the awnings drop. Never use a plain crossfade.
- Camera moves start and land on beats.

## 8. Timing (beat grid)

- The theme song is a Balkan brass band at 152 BPM: a beat is 0.395 s and a bar is 1.58 s. Write times as `K.at(bar, beat)`.
- The intro's measured downbeats: `BARS = [0.00, 1.63, 3.23, 4.83, 6.43, 8.01, 9.62, 11.22, 12.82, 14.40, 16.00, 17.60, 19.18]` (beat tracking + the sung "Hey", "Order", "Bids" onsets; librosa's tracker locks onto the off-beat brass, so trust the vocal accents for phase).
- Pops (stalls, crates, tags, medallions) land on beats with a back-ease overshoot of 0.3 - 0.4 s. Staggers are 1/2 or 1/4 beat.
- Determinism: no `Math.random`, `Date.now` or `performance.now`, no infinite repeats. Seeded `mulberry` / `hash` only.

## 9. Explainer elements in this world (for episodes)

| Slide content | Draw it as | Kit call |
| --- | --- | --- |
| Order book (levels, sizes) | the stall tower; plaques = prices, crates = resting orders; best levels glow | `K.tower`, `K.stall` |
| One limit order, queue position | a crate in a queue (front = left); our order is the gold crate with a star; position tag `#n` | `K.crate`, `K.slotX`, `K.tag` |
| Market order, trade | hand cart racing through the alley, taking crates | `K.cart` |
| Price change, tick | the plaque flips over (`flip`, `price2`); `ping` flashes a level | `K.stall` opts |
| Spread | the alley height + a tag hanging in it | `K.tower({gap})`, `K.tag` |
| Depth chart | two terraced hills, green bids left, red asks right | `K.depthHills` |
| Imbalance, signal | jagged speech burst with an up/down arrow and the number | `K.shout` |
| Flow, direction | carved arrow ribbon | `K.arrow` |
| Big number | carved wooden sign on two chains | `K.signboard` |
| Table | table woven into a kilim | `K.rugTable` |
| Formula | glazed tile panel, cobalt letters written in | `K.tileBoard` |
| Chart (line, bars, candles) | painted on a hanging textile scroll | `K.scrollChart` |
| Bullets, agenda | merchant's price board, coin bullets | `K.priceList` |
| Code (Python / JS, CCXT) | paper scroll with wooden handles, typed out | `K.codeScroll` |
| Episode title | kilim banner dropping from a beam (`field` keeps a plain title area) | `K.kilimBanner` |

Layout rules for explainer shots:
- At most 2 explainer objects in frame at once, plus Tikki reacting (pointing, the abacus, a shout).
- Text sits on paper, tile, wood or the dark price board, never on the patterned sky. Contrast AA or better.
- Leave a 64 px safe margin; boards stay fully inside the frame while they are read.
- The numbers on screen must be the numbers from the script. The drawing never invents data.

## 10. Do / don't

Do: build the book as a place and move through it; let Tikki react to every reveal; keep red = sellers and green = buyers everywhere; put pops on beats and smooth camera moves between them.
Don't: draw flat slide cards; boil text or let the camera judder at 12 fps; use red/green decoratively; put language-specific words in the drawn world (prices, numbers, `#n`, arrows and icons only), so one render path serves en, ru, zh-CN and zh-TW. Localised text lives in DOM variables.
