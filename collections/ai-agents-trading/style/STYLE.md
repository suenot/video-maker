# Style bible: "Beepo's Neon Floor"

Collection: **AI Agents for Trading** (ru: AI-агенты в трейдинге, zh-CN: 交易中的 AI 智能体, zh-TW: 交易中的 AI 智慧體).
Episodes: the agentic AI investment revolution, the open-source AI hedge fund (a multi-agent analyst team), the AI4Finance foundation, daily stock-analysis agents, agent harnesses.

Everything is drawn in code: canvas 2D through the kit in `style/kit/`, and the timeline is HyperFrames + GSAP.
No image or video models are used. The values below are the same as in `kit/05_palette.js` and the kit modules. Change them together.

## 1. The world in one sentence

Beepo, a small retro robot with a CRT screen for a face, leads a team of specialist agent-bots on a neon 80s trading floor at night.
Signals travel down floor cables as light pulses, order tickets pass from bot to bot, and the agent loop (observe, decide, act) runs on Beepo's own face screen.
Slide content is always a **thing on this floor** (a monitor, an LED scoreboard, a hologram, a terminal), never a flat slide.

It must never read as the crab world: no paper, no sea, no brown pen line, no daylight. The light here comes from neon and screens.

## 2. Palette (hex)

| Role | Token | Hex |
| --- | --- | --- |
| Outline (all shapes) | `ink` | `#0b0e2b` (deep navy, never black) |
| Seams, secondary lines | `inkSoft` | `#262d66` |
| Room: night / wall / floor | `night` `wall` `wallDark` `floor` `floorFar` | `#07081c` `#141842` `#0d1033` `#100f33` `#1a1450` |
| Neon (light sources only) | `pink` `cyan` `violet` `yellow` `green` `orange` | `#ff3fa4` `#36e6ff` `#9b5cff` `#ffe14d` `#39ff9a` `#ff8a3d` |
| Window sky / striped sun | `skyTop` `skyMid` `skyLow` / `sunTop` `sunLow` | `#1b1050` `#5a1f7a` `#ff6f91` / `#ffe14d` `#ff3fa4` |
| Beepo plastic | `shell` / `shellShade` / `shellDark` | `#e9ebff` / `#a3a8dc` / `#5d63a6` |
| Screens, phosphor | `screen` / `phosphor` | `#04161f` / `#5dffd8` |
| Analyst bot | `analyst` / `analystDark` | `#3fd0ff` / `#1f86b8` |
| Ping's face phosphor | `pingGlow` | `#9ff4ff` |
| Risk bot | `risk` / `riskDark` | `#ffb238` / `#c97a12` |
| Trader bot | `trader` / `traderDark` | `#ff5fae` / `#c42b7f` |
| Gain / loss / profit | `gain` `loss` `profit` | `#39ff9a` `#ff4d6d` `#ffe14d` |
| Order tickets (the only paper) | `paper` / `paperShade` | `#fff4dc` / `#e8cfa0` |

Rules: dark room, light only from neon and screens. Magenta is the room (grid, sign), cyan is data and signals, yellow is money and the hot path, green is gain. Each bot keeps its body colour in every shot.

## 3. Line and texture ("neon cel")

| Parameter | Value |
| --- | --- |
| Boil (redraw) rate | **12 drawings per second**: `boilFrame = floor(t * 12)`, hashed vertex jitter |
| Boil amplitude | gentle: 0.3 - 1.0 world px (plastic and metal, not ink) |
| Outline | chunky, continuous, navy `ink`, 4.5 - 7 px; width breathes 0.94 - 1.06x per boil frame; never under 2 screen px |
| Shading | flat navy **shade band** on the far side (shape minus offset copy) + a coloured **rim band** (neon light) on the near side; optional **halftone dots** (80s print) instead of hatching; optional gloss highlight |
| Neon tube | `K.neon`: wide additive halo + coloured tube + white-hot core; `K.flick` stepped flicker at 12 fps with rare dips |
| Spline handles | capped at 1/3 of a segment, so rounded rects never spike at corners |
| Overlays | CSS scanlines (2 px dark every 5 px, multiply), a slow rolling bright band, a navy vignette |

Smooth (continuous time): camera, positions, text, the rolling band. Boils: every contour. Text never boils.

## 4. Type

| Use | Font | Size at 1080p |
| --- | --- | --- |
| Titles, neon sign, big labels | Russo One 400 | 110 - 128 px (line 2 at 0.86x) |
| Chinese titles | Russo One (Latin) + Noto Sans SC / TC 900 subsets | 128 px, two lines |
| Notes, bullets | Exo 2 500 / 800 | 32 - 48 px |
| Code, tables | IBM Plex Mono 500 / 700 | 24 - 40 px |
| LED tags, tickers, chart titles | Press Start 2P 400 | 18 - 34 px |
| Every number on a board | drawn seven-segment digits `K.seg7` (not a font) | 46 - 120 px |

All fonts are local woff2 in `kit/fonts/` (Latin, Latin-ext, Cyrillic, Cyrillic-ext). CJK fonts are Google Fonts `text=` subsets; re-run `python3 style/kit/tools/fetch_fonts.py --cjk-text "<all Chinese text>"` when an episode needs new glyphs.
Minimum readable text on screen is 24 px (18 px only for Press Start 2P axis labels). The DOM title uses a 2 px neon stroke plus a soft glow; a tight bright glow fails the contrast check.

## 5. Beepo (the mascot) and the team

| Part | Value (scale 1, local px, feet on y = 0) |
| --- | --- |
| Legs | coil springs 44 tall (compress with squash, stretch in the air), rubber boots 50 x 20 |
| Torso | rounded box 124 x 100, chest panel: 3 LEDs + a bar meter (`chest` 0..1) |
| Head | CRT box 176 x 134 on an accordion neck, ear dials; screen 132 x 92 |
| Face (phosphor pixels) | eyes `dot` `happy` `wide` `heart` `dollar` `x`, blink; mouths `smile` `open` `o` `flat` `talk` (waveform, `talk` = amplitude); cheeks; or any pixel icon (`faceIcon`) or a custom drawing (`screen`) |
| Antenna | coil spring + bulb that lights on beats (`bulb`), wobbles more with squash |
| Arms | two-bone IK rubber hoses 46 + 44, mitt hand with a two-finger clamp; props `ticket` `lens` `shield` `baton` |
| Team kinds | `analyst` (cyan, dome head, dish antenna, magnifier), `risk` (amber, box head with helmet stripe, beacon, shield), `trader` (magenta, headset with mic, throws tickets) |

Animation rules:
- Squash and stretch with volume kept; coil legs make every landing read. Squash 0.08 per beat while idle, 0.3 - 0.5 on landings (`land()` damped rebound).
- Anticipation before every big action: crouch 0.25 - 0.3 s before a hop.
- Hands are IK targets: a pose is "where the hand goes".
- Blinks seeded about 1 per 2.1 s (`K.blinkAt`), forced open on surprise. Sleeping bots: `blink: 1`.
- Always alive: beat bounce, antenna wobble, bulb on the beat, waveform mouth while singing, the boil.
- `K.faceRect` gives the screen-space quad of the face screen: use it to dive into the face (the signature transition).

## 5b. Ping, the co-host (host B), and the talking duo

Episodes are two-voice conversations. **Beepo = host A**, the explainer (the lower voice). **Ping = host B**, the curious co-host (the higher voice): the cyan analyst promoted to the mic. Ping must read as a different character at a glance, even at 180 px:

| Part | Ping (kind `cohost`) | Beepo (kind `lead`) |
| --- | --- | --- |
| Silhouette | dome head + dish antenna, **hovers** on a cyan jet (no legs), floor glow pool | box CRT head + coil spring antenna, coil legs and boots |
| Face | **round** glowing eyes with pupils and highlights, line brows always on, round mouth with a pink tongue; ice-cyan phosphor `#9ff4ff` | square pixel eyes, pixel brows when `brow` is set, pixel mouth; mint phosphor `#5dffd8` |
| Accessory | pink bow tie | none (the antenna bulb is the signature) |
| Size | 0.82 of Beepo in `K.duo` | Beepo s 1.25: about 370 px to the head top |
| Laser pointer | cyan | pink |

Acting (all from `K.hostPose`, driven by per-frame loudness):
- **Talking**: `speak` mouth (closed / e / a / o / u visemes about 8 per second, opening = loudness), antenna bulb and chest meter follow the voice, a gesture on each stressed word (hand up, palms out, hand to chest, sweep), brows lift on some.
- **Listening**: look at the talker, lean in, tilt the head, nod on the talker's stressed words. A listener never freezes.
- **Gestures** for both hosts: `point`, `nod`, `surprise` (wide eyes, "!", hop, hands up), `think` (mitt to the chin, look up, "?" bubble), `shrug`, `cheer`, `wave`, `worry`, `grin`.
- **Idle**: breathing squash, slow sway, drifting look, seeded blinks (forever, not only for the first 30 s), Ping's hover bob.

Placement (`K.duo`):
- `left` (default): the duo bottom-left, Beepo on the inside next to the props (he explains and points), Ping on the outside. `right` mirrors it. `split` puts Beepo at the left edge and Ping at the right edge with the props between them. `center` is for conversation beats with no props.
- Neon floor pads under both (pink for Beepo, cyan for Ping) ground them on any set.
- `duo` returns `free`, the rect left for explainer props: at most two props in focus there.
- The hosts are storytellers, never tiny in a corner: Beepo at s 1 or more in explainer scenes.

## 6. Camera and transitions

- One virtual camera `{x, y, z, rot}` keyed with a monotone Hermite spline (`K.mkTrack`); zoom rushes are interpolated in log space.
- Floor set: horizon y 700, wide shots at z 0.9 - 0.95, close-ups at z 1.5 - 2.2.
- Diegetic transitions only: **CRT power-on** (a bright line opens to the frame), **CRT power-off** (squeeze to a line, then a dot), and the **face dive** (zoom into Beepo's screen; whatever it shows becomes the next scene). No crossfades.
- Camera moves start and land on beats.

## 7. Timing (beat grid)

- The theme is 80s synth-funk with vocoder at about 113 BPM: a beat is 0.531 s and a bar is 2.12 s. Write times as `K.at(bar, beat)`.
- The intro runs the full length of the short song (`song_short.m4a`, 24.3 s). Its grid is `BARS = [1.21, 3.48, 5.74, 7.83, 9.96, 12.07, 14.21, 16.32, 18.46, 20.57, 22.68]`, measured per bar (Gemini songs drift a little).
- Each sung line (two bars) has its own picture: "Beep boop, the signals run" = Beepo sings and the cables light with pulses; "Agents trade till the day is done" = the ticket pipeline while dusk falls and the clock runs to 16:00; "Observe, decide, then act again" = the loop ring inside Beepo's face; "AI Agents for Trading" = the neon sign title. The 58 s build's verse and chorus-2 scenes (neon signs, tape + order book, plan and check, tools and memory, the agent network, the 16:00 bell, the floor ring) are in `intro/extra/` for episodes.
- A third diegetic cut exists for fast scene changes: the **CRT signal tear** (`glitch` in `intro/src/70_render.js`), with horizontal bands shifted for 0.2 s either side of a downbeat.
- Pops land on beats with a back ease (0.3 - 0.4 s). Staggers are 1/2 or 1/4 beat.
- Determinism: no `Math.random`, `Date.now`, `performance.now`; seeded `hash` / `mulberry` only.

## 7b. The marketmaker.cc logo

Top-right on every intro frame: the mark from `kit/logo.svg` (inlined by `build.py` at `<!--__LOGO__-->`) plus the "marketmaker.cc" wordmark in Exo 2 800 at 36 px. It sits on a navy plate (`rgba(7,8,28,.78)`) with a cyan rim and glow, 96 px tall, 48 px from the edges, and above all overlays. It bounces once on the first downbeat and is otherwise static. Keep scene content out of the area x > 1440, y < 160.

## 8. Explainer elements in this world (for episodes)

| Slide content | Draw it as | Kit call |
| --- | --- | --- |
| Graph node (agent, tool, data source) | agent pod: round server with a neon ring, pixel icon + label | `K.node` |
| Graph edge, message, weight | neon cable with travelling signal pulses; LED chip label; hot = yellow, dim = 35 % | `K.edge`, `K.edgePoint`, `K.tag` |
| Big number, running total | seven-segment scoreboard in a bolted bezel; bump-scale 12 % on change | `K.scoreboard`, `K.seg7` |
| Table | green-screen terminal window; header magenta; highlight row inverted green | `K.termTable` |
| Formula | hologram panel projected from a floor emitter, typed letter by letter | `K.holo` |
| Chart (line, bar, candles) | CRT monitor; candles grow from the mid, lines draw left to right with a glow head | `K.monitorChart`, `K.plot` |
| Bullets, agenda | task board; each bullet a lit pixel icon on its own beat; done = green check | `K.taskBoard` |
| Code (Python) | retro terminal, typed out with a blinking block cursor | `K.terminal` |
| Agent loop, pipeline cycle | ring of pods with a running light | `K.loopRing` |
| Order, decision, hand-off | paper order ticket with ticker, arrow, qty and a stamp | `K.ticket` |
| Market feed | LED ticker tape | `K.ledTape` |
| Episode title | neon tube sign with DOM text | `K.neonSign` |

Layout rules for explainer shots: at most 2 explainer objects plus Beepo reacting; text sits on a screen, a board or a ticket, never on the raw wall; keep a 64 px safe margin; numbers on screen are the script's numbers.

## 9. Do / don't

Do: move a camera through the floor; let Beepo react to every reveal; light things on beats; use yellow only for money and the hot path.
Don't: flat slide cards; daylight; paper or sea textures; boiled text; more than about 8 labelled cables in one shot; language-specific words in the drawn world (tickers, numbers and icons only; localised text lives in DOM variables).
