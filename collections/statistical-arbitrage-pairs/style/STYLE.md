# Style bible: "The Spread Trade Shuffle"

Collection: **Statistical Arbitrage & Pairs Trading** (ru: Статистический арбитраж и парный трейдинг, zh-CN: 统计套利与配对交易, zh-TW: 統計套利與配對交易).
Episodes: pairs trading in crypto, cointegration, z-score of the spread, the distance approach, copulas, funding-rate arbitrage across exchanges.

Everything is drawn in code: canvas 2D through the kit in `style/kit/`, and the timeline is HyperFrames + GSAP.
No image or video models are used. The values below are the same as in `kit/05_palette.js` and the kit modules. Change them together.

## 1. The world in one sentence

A 1920s vaudeville house, shot on black-and-white film. **Dapper Dan**, a ragtime cat in a bowler hat and bow tie, plays the upright piano and MCs the show.
The act is two tap-dancing penguins (a pair of assets) tied waist to waist by a spring (the spread). They drift apart, the z-meter on the proscenium swings to +/-2, Dan bets on the reversion, the spring snaps them back, and coins rain.
Slide content is always a **prop of the show** (an intertitle card, an easel, a playbill, the cinema screen), never a flat slide.

How it differs from the sibling worlds: the crab is sunny, saturated and nautical; the owl is sepia and botanical. This one is **monochrome silver film with exactly one accent colour, gold**.

## 2. Palette (hex)

| Role | Token | Hex |
| --- | --- | --- |
| Ink: outlines, black fur, penguin backs | `ink` | `#141312` |
| Stage black, deep shadow | `g1` | `#2b2926` |
| Dark grey: curtains, piano panels | `g2` | `#4a4743` |
| Mid grey: floor, wainscot | `g3` | `#6e6a64` |
| Light grey: backdrop, metal | `g4` | `#9a958d` |
| Pale grey: paper shade, spats | `g5` | `#c8c3b8` |
| "White": gloves, bellies, cards, type on dark | `paper` | `#ece7da` |
| Highlights on black shapes | `shine` | `#fbf8f0` |
| **The one accent**: money, the z-score zones, a stretched spring, the winning trade | `gold` / `goldLight` / `goldDark` / `goldGlow` | `#e9b43a` / `#ffd76a` / `#a77818` / `#fff0b8` |

Rules: everything is a grey of nitrate film. Gold appears only where money or the signal is: coins, the z-meter's |z| >= 2 zones and needle hub, a spring under strain (strain > 0.6), the +/-2 sigma bands, position tags, the tip jar, the heart of the reunited pair, and the title's second line. Never colour a character or a set piece gold for decoration.

## 3. Line and texture (1920s studio ink)

| Parameter | Value |
| --- | --- |
| Boil (redraw) rate | **12 drawings per second**: `boilFrame = floor(t * 12)`; vertex jitter = `hash(vertex, seed + frame * 7919)` |
| Boil amplitude | small: 0.3 - 1.1 world px. The ink trembles, it does not scribble (the crab boils 0.6 - 2.4 with broken strokes) |
| Outlines | continuous and even (no broken gaps), hero 5.5, props 4 - 6, fine 2.5 - 3.5 world px; never thinner than 2 screen px (`K.MIN_PX`) |
| Open lines | **brush ribbons** (`K.brush`): filled, tapered at both ends, width wobbles 0.94 - 1.06 per boil frame |
| Limbs | **rubber hose** (`K.hose`): even-width tube with an ink casing |
| Shading | flat shadow band (`shade: {dx, dy}`) plus the white **shine** crescent on black shapes (`shine: {dx, dy, s, a}`); no hatching |
| Projector (`K.film`) | exposure flicker +/-5 % per film frame, 0 - 3 vertical scratches that live 3 - 6 frames, dust specks and hairs, gate weave up to 1.6 px, burnt-corner vignette 60 % |
| Grain | CSS SVG fractal noise, 22 % overlay, steps at 12 fps |
| Transitions | the **iris** (`K.iris`): black frame with a round hole, in and out. Never a plain crossfade |

What stays smooth (continuous time): camera, positions, text. What boils: every contour, ropes, springs, paper edges. Text never boils. The gate weave shifts the whole picture (camera and screen space) by the same amount.

## 4. Type

| Use | Font | Weight | Size at 1080p |
| --- | --- | --- | --- |
| Marquee title, act names, card titles | Playfair Display | 900 | 118 px line 1, 0.86x line 2 (gold with 6 px ink stroke); auto-fit to the marquee |
| Title, Chinese | Playfair Display (Latin) + Noto Serif SC / TC (glyphs) | 900 | 132 px, one line |
| Labels, bullets, table headers | Oswald | 500 / 700 | 32 - 48 px |
| Numbers, z-scores, formulas, code, tables | IBM Plex Mono | 500 / 700 | 26 - 56 px |

All fonts are local woff2 in `kit/fonts/` (Latin, Latin-ext, Cyrillic, Cyrillic-ext; Playfair has no Cyrillic-ext). The CJK fonts are Google Fonts `text=` subsets with only the glyphs in use. When an episode needs more Chinese glyphs, run `python3 style/kit/tools/fetch_fonts.py --cjk-text "<all Chinese text>"` again.
Minimum readable size on screen: 24 px (multiply world sizes by the camera zoom).

## 5. Cast

### Dapper Dan, the cat (`K.cat`)

| Part | Value (scale 1, local px; feet on y = 0, 330 px tall) |
| --- | --- |
| Head | 148 x 132 black oval with shine, white peanut muzzle, pie-cut eyes 34 x 54 set close together, white brows, black nose, white whiskers (brush) |
| Hat | black bowler with grey band and shine; `hatTip`, `hatLift`, `hatInHand` |
| Body | black pear, white shirt front with two studs, white bow tie at the collar |
| Arms | rubber hose, two-bone IK 52 + 50 to white four-finger gloves (`open` 0 fist .. 1 spread, `rot`) |
| Legs | rubber hose, IK 44 + 44, black shoes with white spats |
| Tail | S-curve hose that sways all the time |

### The partners, two penguins (`K.penguin`)

| Part | Value (scale 1, 270 px tall) |
| --- | --- |
| Body | black egg with shine, white belly, white spectacle mask with pie-cut eyes, grey beak (`beak` shut/open) |
| Hats | `top` = the RICH leg (sell it, tag -1), `boater` = the CHEAP leg (buy it, tag +1) |
| Flippers | `flipL/flipR` degrees out from the side (0 hanging, 90 out, 150 jazz hands) |
| Feet | tap shoes with white spats, `tapL/tapR` lift 0..1 on the beat |
| Spring anchor | `K.penguinWaist(x, y, s, side, pose)` |

Animation rules:
- Squash and stretch with volume kept: 0.07 - 0.08 on every beat, 0.3 - 0.4 on landings and the hit.
- Anticipation before every big action: crouch before a hop, wind-up before a throw, a hand lifts before each bell strike.
- Gloves and flippers are posed by target, never by rotating segments by hand.
- Blinks are seeded (`K.blinkAt`, about 1 per 1.8 s) and forced open during a surprise; Dan winks at the audience on the "ha!" and on the title.
- Expressions: cat `mouth` smile, sly, grin, open, o; `brow`; `eyeUp`; `wink`; the gold `!` for discoveries. Penguins: worried looks at each other while the spread is open, a gold heart when they reunite.
- Something is always alive: tap feet, a swaying tail, the swinging hand, the boil, bulbs chasing on the beat.

## 6. Camera and sets

- One virtual camera `{x, y, z, rot}`; moves are eased tweens or `K.mkTrack` (monotone Hermite, no overshoot), at most 1.1x push over a bar.
- **The stage set**: backdrop and wainscot up to `FLOOR_Y = 800`, boards to the vanishing point (960, -900), valance and curtains and proscenium in front, footlights along the lip at y 1110. Cast feet at y 965 - 1000.
- Layout of the act: piano upstage left (x 300), Dan at x 525, the bell on a stand at x 680, penguins centred near x 1150 (together 1040 / 1250, fully apart 830 / 1580), z-meter on the valance at (1000, 200), the cinema screen at (1200, 425).
- Transitions are the iris. Cut or iris only on a downbeat.

## 7. Timing (beat grid)

- The theme is ragtime at **150 BPM**: beat 0.40 s, bar 1.60 s. Write times as `K.at(bar, beat)`.
- Retime to a song by setting `K.G.BPM` and `K.G.BARS` (measured downbeats).
- The intro's grid is `BARS = [0.12, 1.74, 3.36, 4.97, 6.56, 8.13, 9.73, 11.33, 12.91, 14.55, 16.14, 17.74, 19.33]`. Each sung line is two bars and gets its own picture (see `intro/REVIEW.md`).
- Pops land on beats with a back ease (0.35 - 0.45 s); staggers are 1/2 or 1/4 beat; bulbs chase one step per beat.
- Determinism: no `Math.random`, `Date.now` or `performance.now`, no infinite repeats. Seeded `mulberry` / `hash` only.

## 8. Explainer elements in this world (for episodes)

| Slide content | Draw it as | Kit call |
| --- | --- | --- |
| Formula, key statement | silent-film intertitle: black card, double white rule, corner curls, written letter by letter; key term in gold | `K.intertitle` |
| Bullets, agenda | act card on an easel; bullets are ink twinkles (gold for the money item), each pops on its own beat | `K.easel` |
| Table (pairs, betas, p-values) | theatre playbill with a double rule header; highlighted row in gold | `K.playbill` |
| Chart, time series | picture on the cinema screen with a roller; lines draw left to right; `bands` for mean and +/-2 sigma (gold), `spread` shades between two series, `marks` for entries/exits with hang tags | `K.screenChart` |
| z-score | the proscenium z-meter, needle + readout, gold zones beyond +/-2 | `K.gauge` |
| Spread, hedge ratio | the spring between the two penguins; strain tints it gold | `K.spring` + `K.penguin` |
| Big number, P&L | admission ticket (gold for money) | `K.ticket` |
| Small number, price, position | hang tag on a string | `K.hangTag` |
| Code | typewriter page on a platen roller; numbers in dark gold | `K.typewriter` |
| Profit | coins (spin, rain, settle on the floor), the tip jar on the piano | `K.coin`, `K.coinRain`, `K.piano({jar})` |
| A confirmed signal (cointegration test passes) | the desk bell rings | `K.bell` |
| Exchanges (funding-rate arbitrage) | two stages / two pianos side by side, or two partners on separate spotlights | compose |
| Copula, joint distribution | the pair's footprints on the floor boards as a scatter; contour lines in chalk on the floor | compose with `K.line` |
| Episode title | marquee with chasing bulbs, DOM text | `K.marquee` |

Layout rules for explainer shots:
- At most 2 explainer props in frame, plus Dan reacting (pointing glove, a wink, the bell).
- Text sits on paper, a card or the screen, never on the raw backdrop. Contrast: ink on paper about 15:1, paper on ink card about 15:1, ink on gold about 9:1.
- 64 px safe margin; props being read stay fully inside the frame.
- The numbers on screen must be the numbers from the script. The drawing never invents data.

## 9. Do / don't

Do: move the camera through the house; let Dan and the partners react to every reveal; put pops on beats; use gold only for money and the signal; use the iris.
Don't: use any second hue; boil text; use flat slide cards; use more than 2 props in a shot; put language-specific words in the drawn world (tickers, numbers, symbols and icons only). Localised text lives in DOM variables.
