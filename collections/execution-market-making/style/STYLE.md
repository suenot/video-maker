# Style bible: "The Clockwork Station"

Collection: **Execution & Market Making** (ru: Исполнение и маркетмейкинг, zh-CN: 执行与做市, zh-TW: 執行與造市).
Episodes: TWAP / VWAP / POV execution algorithms, Almgren-Chriss optimal execution (impact vs risk), child-order tactics, market-making quotes.

Everything is drawn in code: canvas 2D through the kit in `style/kit/` (namespace `SK`), and the timeline is HyperFrames + GSAP.
No image or video models are used. The values below are the same as in `kit/05_palette.js` and the kit modules. Change them together.

## 1. The world in one sentence

Mr. Tick, a tidy stationmaster mouse with a pocket watch, a whistle and a cap, runs a clockwork railway station where a giant parent order is a freight crate that gets split into small wagons (child orders) and dispatched on a timetable, so it barely splashes the price pond (market impact).
Quotes are ticket booths (bid and ask), the volume profile is the valley the train crosses, and slippage is a dial by the line.
Slide content is always a **thing in this world**, never a flat slide.

## 2. Look: 1950s screen-print travel poster

It must not look like the Arbitrage Crab. The crab world is a sunny, outlined, hatched nautical cartoon; this world is a mid-century poster.

| | Crab (complex-arbitrage-rust) | Station (this collection) |
| --- | --- | --- |
| Line | thick boiled ink, 7 % broken | thin, clean charcoal key line (2 - 3.5 px), never broken |
| Fill | flat + hatching | flat colour plate printed **out of register** (`K.REG` 3.2 px) |
| Tone | cross-hatching | **halftone dots** (rotated 15 deg screen) |
| Shapes | organic blobs | geometry first: rectangles, rounded rects, triangles, arcs, pills |
| Palette | many saturated hues | four inks + one accent |
| Type | Rubik (rounded) | Jost (geometric, Futura-like), IBM Plex Mono |

## 3. Palette (hex)

| Role | Token | Hex |
| --- | --- | --- |
| Key line, dark type, boards | `ink` / `inkSoft` | `#2a2a2e` / `#4d4b52` |
| Paper, light type | `cream` / `creamShade` / `creamDeep` | `#f3e6c8` / `#e0cfa6` / `#cdb88a` |
| Mustard (money, crates, the sun) | `mustard` / `mustardDark` / `mustardLight` | `#e2a42b` / `#b07a12` / `#f3c95f` |
| Teal (the world, bid, "good") | `teal` / `tealDark` / `tealLight` / `tealPale` | `#2a7b78` / `#1b5654` / `#5fa79c` / `#a7d0c3` |
| Accent (impact, loss, ask) | `tomato` / `tomatoDark` / `tomatoLight` | `#d65a3a` / `#a23e26` / `#ec8a6c` |
| Sky | `sky` / `skyHigh` | `#f1dfb5` / `#e9d3a0` |
| Mouse fur, ears | `fur` / `furDark` / `furLight` / `earPink` | `#b4aa9c` / `#8a8073` / `#d8d0c2` / `#ec9a86` |
| Pigeon feathers, beak, legs | `pigeon` / `pigeonDark` / `pigeonLight` / `beak` / `leg` / `iris` | `#8e98a6` / `#66707e` / `#bcc3cc` / `#e2a42b` / `#ec8a6c` / `#e2a42b` |
| Inside a mouth or beak | `mouthIn` | `#6e2a1c` |
| Steel (wheels, rails) | `steel` / `steelDark` / `steelLight` | `#5c6168` / `#3c4046` / `#8b9097` |

Rules: tomato is rare. It means impact, cost, the ask side or a warning zone, never decoration (exceptions: the tower roof and the cowcatcher, both small). Mustard means money and the chosen schedule. Teal is the world.

## 4. Line and texture

| Parameter | Value |
| --- | --- |
| Boil rate | **12 drawings per second**: `bf = floor(t * 12)`; vertex jitter = `hash(vertex, seed + bf * 7919)` |
| Boil amplitude | gentle: 0.3 - 1.0 world px (ink on paper, not a pencil test) |
| Key line | 2 - 3.5 px world, solid, round joins; never thinner than 1.6 screen px (`K.MIN_PX`) |
| Misregistration | colour plate offset `K.regOf(seed)`: fixed direction per object, 3.2 px, plus 0.5 px drift per boil frame |
| Shadow | flat band = shape minus its offset copy (`shade: {dx, dy}`), light from upper-left |
| Halftone | `tone: {gap 8 - 12, r, r2, dir, alpha 0.2 - 0.6}`; dots are clipped to the visible screen, so big skies stay cheap |
| Paper grain | SVG noise overlay, 16 % multiply, steps at 12 fps; vignette 34 % at the corners |

What stays smooth (continuous time): camera, train travel, text, flap flips. What boils: every contour.

## 5. Type

| Use | Font | Weight | Size at 1080p |
| --- | --- | --- | --- |
| Title (enamel sign) | Jost, uppercase, tracking 0.04 em | 800 | fit to 1300 px face, max 112 px; line 1 cream, line 2 mustard |
| Title, Chinese | Jost + Noto Sans SC / TC 900 | 800/900 | 150 px, one line, tracking 0.12 em |
| Labels (BID / ASK, poster titles) | Jost | 700 / 800 | 36 - 64 px |
| Numbers, flaps, tables, code | IBM Plex Mono | 500 / 700 | 26 - 110 px |

Fonts are local woff2 in `kit/fonts/` (Latin, Latin-ext, Cyrillic, Cyrillic-ext; CJK as `text=` subsets). New Chinese glyphs: `python3 style/kit/tools/fetch_fonts.py --cjk-text "<all Chinese text>"`.
Minimum text on screen: 24 px (multiply world sizes by zoom).

## 6. Mr. Tick (the mouse)

| Part | Value (scale 1, local px; feet on y = 0) |
| --- | --- |
| Height | 300 incl. ears; head r ~ 60 at y -206; coat -48 .. -150 |
| Ears | r 44, pink inner r 28, flick with `ear` |
| Eyes | 13 x 17 ovals, pupils follow `look`, `eyeUp` pops, seeded blinks (`K.blinkAt`) |
| Arms | two-bone IK 36 + 34 from the coat's shoulders; white mitten gloves |
| Props | pocket watch on a chain (lid opens), whistle (cheeks `puff`), signal flag, thumbs-up, point |
| Cap | teal stationmaster cap, mustard band, star badge; `hatTip`, `hatLift` |
| On screen | close: 330 - 470 px tall; wide: at least 220 px; in the loco cab: head and shoulders |

Animation rules (lessons carried over from the crab):
- Squash and stretch keep volume; 0.06 on every beat, 0.25 - 0.3 on surprises and landings.
- Anticipation: a 0.15 s squash before the look-up, a hop before the spread pops.
- Hands are IK targets ("where the glove goes"). The arm reaches about 70 px from the shoulder: a target above the cap is not reachable, so wave beside the head instead.
- Something is always alive: beat bob, tail sway, ear flick, whiskers, boil.

### 6b. Dash (the pigeon telegraph clerk, host B)

Dash is a cheeky, curious pigeon who works the station telegraph and the ticket window. He asks the questions. Mr. Tick explains.

| Part | Value (scale 1, local px; feet on y = 0) |
| --- | --- |
| Height | 260 incl. eyeshade; head r ~ 44 at y -204; body -30 .. -170 |
| View | 3/4. The beak points to the `face` side (always towards Mr. Tick or towards the content he points at) |
| Costume | mustard waistcoat, cream shirt and string tie, teal neck sheen, translucent green eyeshade, tomato sleeve garters, a pencil behind the head |
| Eyes | cream with a mustard iris; the far eye is smaller; pupils follow `look`; seeded blinks |
| Beak | mustard with a cream cere; the lower mandible hinges open with `talk` |
| Wings | two-bone IK 34 + 32 from the shoulders, with three feather "fingers" (`open`; `point` extends the middle one) |
| Props | telegraph `tape` (dots and dashes, unrolls to the floor) and a railway `ticket` (`label`) |
| Idle | pigeon head bob (`peck`: a quick thrust and a slow return), breathing squash |

### 6c. The hosts on screen

- Hosts are storytellers. In explainer scenes Mr. Tick is at least 300 px tall (`K.duo` default s 1.15 makes him 345 px and Dash 285 px). Never show them tiny in a corner.
- They stand together on a piece of platform at the bottom-left (`layout: "left"`), with Dash on the outer side so Mr. Tick's pointing hand faces the content. Use `right` to mirror this, or `flank` with the explainer prop between them.
- The talker's mouth follows the loudness of their voice. The listener looks at the talker, leans in and nods on the talker's stressed words. Somebody always reacts.
- Pointing is the main link between a host and an explainer element. Use a gesture (`surprise`, `think`, `shrug`, `nod`) on every reveal.
- `!` means surprise and `?` means thinking, for both hosts. Both marks are language-neutral.

## 7. Camera and transitions

- One camera `{x, y, z}` per set, keyed with `K.mkTrack` (monotone, no overshoot).
- Parallax layers use `K.applyCam(ctx, p)`. A layer moves `p` times as far as the camera, measured from `K.REF` (960, 540), so backgrounds are laid out in world numbers.
- Transitions are diegetic and land on downbeats:
  - **departure-board wipe**: the frame becomes an 8 x 4 split-flap board and flips left to right (`flapWipe` in `intro/src/70_render.js`);
  - **steam wipe**: a wall of puffs rolls across, the next set behind it;
  - **railway tunnel**: an arch with a brick ring closes to black on the old set and opens on the new one;
  - **whip pan** with cream speed lines inside one world.
  Never a crossfade.

## 8. Timing (beat grid)

- The theme song is big-band swing at about 129 BPM: a beat is 0.464 s and a bar is about 1.84 s. Write times as `K.at(bar, beat)`.
- The intro runs the whole short song (`song_short.m4a`, 27.1 s, brief UPDATE 3). Its grid is 15 measured downbeats (`K.G.BARS` in `intro/src/10_setup.js`): bars 0-1 instrumental, 2-5 verse, 6-13 chorus, 14 outro.
- Sung lines start about 1.4 beats after the bar line, so the illustrating action goes on the word (word times from `hyperframes transcribe`), and camera moves and wipes go on the bar line.
- A meaningful change every 2-4 s: each sung line (2 bars in the chorus, 1 bar in the verse) gets its own set or event.
- Determinism: no `Math.random`, `Date.now` or `performance.now`; seeded `hash` / `mulberry` only.

## 9. Explainer elements in this world (for episodes)

| Slide content | Draw it as | Kit call |
| --- | --- | --- |
| Big number (order size, price, P&L) | split-flap display; only changed characters flip | `K.flap` |
| Table (schedule, order book, fills) | departure board; mustard header, highlighted row in teal | `K.board` |
| Formula | enamel sign with screws, written letter by letter; key line in mustard | `K.plaque` |
| Chart (volume profile, price, frontier) | framed travel poster; bars grow, lines draw left to right | `K.poster` |
| Bullets, agenda | row of tickets with numbered stubs, each pops on its beat | `K.tickets` |
| Code (Python / Rust) | teletype paper tape, typed out, keywords teal, numbers tomato | `K.teletype` |
| Graph (venues, routes) | rail map: stops and coloured lines; trains run along `K.routePoint` | `K.stop`, `K.route` |
| Small number | luggage tag | `K.tag` |
| Parent / child orders | crate split into a grid (`slices`, `rows`) onto wagons | `K.crate`, `K.wagon` |
| Market impact | the price pond: splash for a big order, ripples for slices | `K.pond`, `K.splash`, `K.ripple` |
| Slippage, participation rate | dial gauge with teal / mustard / tomato zones | `K.gauge` |
| Bid / ask, quotes | two ticket booths with flap prices | `K.booth` + `K.flap` |
| Time, schedule | tower clock (hands tick on beats), pocket watch | `K.clockFace`, `K.clockTower`, `K.pocketWatch` |
| Episode title | hanging enamel sign; DOM text flips in like flaps | `K.sign` |

Layout rules: at most 2 explainer objects in frame plus Mr. Tick reacting; text sits on boards, signs or paper, never on raw sky; 64 px safe margin; numbers on screen must be the script's numbers.

## 10. Logo

The marketmaker.cc logo (`kit/assets/logo.svg`, `fill="currentColor"`) sits top-right on every frame: 48 px margin, 100 px tall cream plate with a charcoal key line and a 5 px offset shadow (a printed sticker), the mark at 72 px plus the wordmark in Jost 700 38 px. It is a DOM overlay above the canvas, grain and vignette. `build.py` inlines the SVG at the `<!--__LOGO__-->` marker so CSS `color` tints it. One small bounce in the first half second, then static. Keep big signs, gauges and boards out of the 1450-1872 x 48-160 corner.

## 11. Do / don't

Do: move through a world; let the mouse react to every reveal; put pops on beats and smooth camera between them; keep tomato for impact and the ask side.
Don't: flat slide cards; thick broken ink or hatching (that is the crab); neon glow or gradients as decoration; language-specific words in the drawn world (tickers like BID / ASK, numbers and icons only), so one render path serves en, ru, zh-CN and zh-TW.
