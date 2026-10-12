# Style bible: "The Block Diner"

Collection: **Onchain & DeFi Quant** (ru: Количественный анализ onchain и DeFi, zh-CN: 链上与 DeFi 量化, zh-TW: 鏈上與 DeFi 量化).
Articles: DEX analytics, AMM pools, MEV and sandwich attacks, prediction-market DEX traders, onchain flows.

Everything is drawn in code: canvas 2D through the kit in `style/kit/` (namespace `DK`), and the timeline is HyperFrames + GSAP.
No image or video models are used. The values below are the same as in `kit/05_palette.js` and the kit modules. Change them together.

## 1. The world in one sentence

Chef Nibbs, a hamster chef-detective with a toque and a magnifying glass, runs a 1950s chain diner where the blockchain is a conveyor chain of lunch trays (blocks), every transaction is an order ticket, the mempool is the ticket rail, and Slyce, a sly sandwich bot, keeps clipping his tickets around other people's orders.
Slide content is always a **thing in this diner**, never a flat slide.

| Concept | Diner object |
| --- | --- |
| Block | lunch tray on the conveyor chain, number plate `#19 204 118`, mustard "sealed" stamp |
| Transaction | order ticket: header colour = sender, ticker, amount, arrow (buy up / sell down), gas = mustard dots |
| Mempool | chrome ticket rail in the dark corner; order on the rail = order of execution |
| Sandwich attack | Slyce's two cherry tickets around the victim's mint ticket; in the tray they become bread / burger / bread |
| Order book | the menu card (asks cherry on top, bids green below, depth bars, spread tag) |
| AMM pool | two-pan balance scale, plaque shows `x · y` live, curve on a placemat |
| Matching / settlement | the order bell DING |

## 2. Palette (hex)

| Role | Token | Hex |
| --- | --- | --- |
| Black plate (outlines, dark type) | `ink` / `inkSoft` | `#1a1216` / `#4a3a40` |
| Cream (menus, tickets, cream type) | `cream` / `creamShade` | `#fbf1dc` / `#ecd9b4` |
| Cherry (hero red) | `cherry` / `cherryDark` / `cherryLight` | `#e23a3f` / `#a8222c` / `#ff7a74` |
| Mint | `mint` / `mintDark` / `mintLight` | `#8fd8c0` / `#4fa995` / `#c6efe2` |
| Chrome | `chrome` / `chromeDark` / `chromeLight` | `#c9d3d8` / `#7d8b93` / `#f4f8fa` |
| Floor tiles | `checkA` / `checkB` | `#f7efe0` / `#1f1a1d` |
| Wall, wainscot / booth vinyl | `wall` / `teal` / `tealDark` | `#f4dcc0` / `#2f8f8a` / `#1d625f` |
| Dark corner (mempool) | `night` / `nightDark` | `#22324a` / `#141f31` |
| Money, gains, bell | `mustard` / `mustardDark` | `#ffc42e` / `#cf8f0a` |
| Hamster | `fur` / `furDark` / `furLight` / `belly`, `nose`, `cheek`, `toque` | `#e8a25e` / `#b56f33` / `#f7c993` / `#fbe3c2`, `#f07f8a`, `#ff9e9a`, `#fffdf8` |
| Sandwich bot | `bread` / `breadDark` / `crust`, `botMetal`, `botEye` | `#e9b56a` / `#b77c35` / `#8c5424`, `#5d6b73`, `#ff4b4b` |
| Bid / ask, gain / loss | `bid` / `ask`, `gain` / `loss` | `#2d8a5a` / `#d1343b`, `#2d8a5a` / `#e23a3f` |
| Chalk board | `board` / `chalk` | `#25302d` / `#f6f3ea` |
| Neon | `neonPink` / `neonMint` | `#ff5d8f` / `#6ff5d2` |
| Tokens | `ETH` `USDC` `WBTC` `DAI` `SOL` `UNI` `LINK` | `#7b83eb` `#2775ca` `#f39b2c` `#f4b731` `#a25ddc` `#ff4fa0` `#2a5ada` |

Rules: cherry + mint + cream carry every frame; mustard means money, the winning path and the bell; red visor = MEV. The dark corner is the only dark area (night blue wash + dot screen).

## 3. Line and texture (comic print, not the crab's broken pen)

| Parameter | Value |
| --- | --- |
| Boil | 12 drawings per second (`floor(t * 12)`), vertex jitter 0.4 - 1.6 world px |
| Outline | **brush ribbon**: one filled polygon whose width swells 0.78 - 1.22x along the path (seeded noise); open strokes taper at both ends; `K.rule` = constant width (rails, axes, chrome). No gaps. |
| Widths (world px, zoom 1) | characters 5 - 6, props 4 - 5, details 2.5 - 3.5; never thinner than 2 screen px |
| Off-register print | colour fill offset `K.MISREG = [-2.5, 2]` from the black plate (off for chrome, small dots and text) |
| Shading | flat shadow band (shape minus offset copy) + **Ben-Day dot screen** in the band (`shade.dots`), light from upper-left |
| Gloss | `shine`: short white tapered stroke inside the upper-left of enamel, chrome and glass |
| Chrome | hard light/dark bands (`K.chromeBar`), never a soft gradient |
| Grain | SVG noise, 10 % multiply, steps at 12 fps; vignette 38 % at the corners |

Smooth (continuous time): camera, conveyor travel, text, title letters. Boils: every contour. Text never boils.

## 4. Type

| Use | Font | Weight | Size at 1080p |
| --- | --- | --- | --- |
| Title line 1, menu titles, letter-board heading | Lobster (diner sign script) | 400 | 132 px title (fit to 1250 px), 44 - 66 px headings |
| Title line 2, labels, bullets | Nunito | 800 / 900 | 104 px title line 2, 36 - 48 px labels |
| Chinese title | Nunito (Latin) + Noto Sans SC / TC 900 (glyphs) | 900 | up to 150 px, one line |
| Tickets, prices, tables, code | Anonymous Pro | 400 / 700 | 26 - 60 px |

Local woff2 in `kit/fonts/` (latin, latin-ext, cyrillic, cyrillic-ext). CJK fonts are `text=` subsets; refresh with `python3 style/kit/tools/fetch_fonts.py --cjk-text "<all Chinese text>"`.
Title DOM: line 1 cream with a 9 px ink stroke and a hard ink drop shadow; line 2 mint with an 8 px stroke. The fit is measured per frame (`fitSize`), so Cyrillic needs no hand-tuned factor.

## 5. Characters

**Chef Nibbs** (`K.hamster`, scale 1, feet at y 0): one egg body 156 x 184 with cheek pouches (`cheeks` 0..1 puffs them), round ears, big glossy eyes, pink nose + boiled whiskers, buck tooth, mint apron, cherry bow tie, pleated toque. Arms two-bone IK 36 + 32 to `pawL` / `pawR`. Magnifier in either paw (`hold: "magnifier"`, `magHand: "L"`), `magAng`, `magS`; writes `K.lens` (screen centre + radius) for lens-zoom shots and flashes.
Expressions: `mouth` smile, grin, open, o, smirk, frown; `brow` -1 (angry, slanted in) .. 1.5; `wink`; `eyeUp`; `exclaim`; `sweat`; `toqueTip` / `toqueLift`.

**Slyce** (`K.sandwichBot`): club-sandwich wedge with lettuce / tomato / cheese layers, olive toothpick antenna, black visor with one scanning red eye (`look`, `glow`), crooked grin, rubber-hose chrome legs and arms, white gloves, bread slices in hand (`sliceL/R`), `walk`, `shock` (caught: wide eye, "o" mouth).

**Bizzy** (`K.bee`, co-host / host B, higher voice): a bubbly bee waitress on cherry roller skates. Big round head with lashes and a cherry waitress cap, bobble antennae, mustard-and-ink striped body with a cream apron, buzzing wings, IK arms with white gloves, an order pad she scribbles on while listening, a pencil she holds out to point. Expressions: `talk`, `mouth` smile, grin, open, o, worry; `brow`; `head` tilt; `exclaim`; `think` ("?" bubble); `wink`.
Slyce stays the villain and is never a host.

Talking and listening (`55_hosts.js`): both mouths take a 0-1 loudness per frame and step through "ah / ee / oo / mm" shapes at 10 Hz (`K.talkMouth`); the talker gesticulates with the free paw/arm, the listener looks at the talker and nods on a slow rhythm. `K.duo` stages both large (Nibbs about 430 px, Bizzy about 420 px at `s` 1); never shrink them into a corner.

Animation rules:
- Squash with volume kept; 0.07 - 0.1 beat bounce while idle, 0.3 - 0.35 on landings, -0.2 to -0.3 stretch on pop-ups and jumps.
- Anticipation before every big action (bell: raise 0.4 s, slam on the downbeat; menu slap: wind-up 0.4 s).
- Paws are IK targets; a pose is "where the paw goes". To aim the glass at a row, solve paw height + angle (see `intro/src/30_table.js`, `nibbsTable`).
- Blinks seeded about one per 2.1 s (`K.blinkAt`), forced open on surprise. Whiskers twitch, antenna sways: something is always alive.

## 6. Camera and transitions

- One virtual camera `{x, y, z, rot}` per set, keyed with `K.mkTrack` (monotone Hermite, no overshoot). Push-ins at most 1.2x over a phrase. Shakes only on impacts (chomp, DING), 0.3 s, seeded.
- Diegetic transitions only: **lens zoom** (the world re-drawn 1.6 - 1.7x inside the magnifier glass), **menu slap** (a card flies from the paw into the camera and becomes the next set), **whip pan** with cream/ink streaks, **kitchen swing doors** (shut with a back ease, open on the next set). Never a plain crossfade.
- Moves start and land on beats.

## 7. Timing

- Theme song "The Sandwich Gambit", vaudeville revival, about 150 BPM (beat 0.40 s, bar 1.60 s). Write times as `K.at(bar, beat)`.
- The intro uses the whole 30.8 s song; measured downbeats `BARS = [0.12, 1.81, 3.41, 5.02, 6.59, 8.20, 9.82, 11.40, 12.98, 14.61, 16.21, 17.81, 19.39, 21.01, 22.62, 24.22, 25.80, 27.38, 28.98, 30.58]`.
- The marketmaker.cc logo plate (DOM, top-right, 48 px margin, 96 px tall) is on screen the whole film; keep titles and key action out of the top-right 400 x 160 px.
- Pops land on beats with a back ease of 0.35 - 0.45 s; staggers 1/2 or 1/4 beat. No `Math.random`, `Date.now`, `performance.now`.

## 8. Explainer elements (for episodes)

| Slide content | Draw it as | Kit call |
| --- | --- | --- |
| Token / graph node | coin on a diner plate stand; hot = mustard glow | `K.node` |
| Edge, flow, route | sauce drizzle (cherry; hot = mustard + arrow), drips flow along it, number on a ticket stub | `K.edge`, `K.edgePoint`, `K.tag` |
| Block, block contents | lunch tray on the chain; items = tickets, coins, food | `K.block`, `K.conveyor`, `K.trayItem` |
| Transaction / pending tx | order ticket, optional rubber stamp (`stamp: {text, a}`) | `K.ticket`, `K.ticketRail` |
| Big number | cash register display; `bump` when it changes | `K.register` |
| Table, order book | menu card with depth bars, row colours, highlight | `K.menu` |
| Formula | chalk menu board on an A-frame, written letter by letter | `K.chalkboard` |
| Chart (series, bars, x-y curve) | scalloped paper placemat with checker border; `kind: "xy"` + `marker` | `K.placemat` |
| Bullets, agenda | felt letter board, each bullet pops on its beat | `K.letterBoard` |
| Code (Solidity / Python / Rust) | register receipt tape, typed out | `K.receipt` |
| AMM pool | balance scale, coin stacks per pan, live plaque | `K.ammScale` (`K.ammPans` = pan screen points) |
| Latency, timing | chrome stopwatch, `sweep` in laps | `K.stopwatch` |
| Impact, reveal | comic burst, speed lines, sparkle | `K.burst`, `K.speedLines`, `K.sparkle` |
| Title | neon sign with marquee bulbs + DOM text | `K.neonSign` |

Layout rules: at most 2 explainer objects plus a character in frame; text sits on cream, chalk or the register screen, never on raw wall; 64 px safe margin; numbers on screen are the script's numbers; the drawn world holds tickers, numbers and icons only (localised words live in DOM variables).

## 9. Do / don't

Do: move a camera through the diner; let Nibbs react to every reveal and Slyce sneak around it; put pops on beats; keep cherry + mint + cream in every frame.
Don't: flat slide cards; soft gradients as decoration (only lamp light, neon and the dark corner wash); blue-orange crab or sepia/neon-80s looks of the other collections; boiling text; more than about 8 tagged edges per shot.
