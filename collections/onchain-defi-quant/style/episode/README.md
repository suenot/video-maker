# Episode layer: Onchain & DeFi Quant (The Block Diner)

Collection layer for the shared episode engine (`collections/_episode/`). The kit namespace is `DK` (builders see it as `K`). Host A = Chef Nibbs (hamster, lower voice, `--host-a low`), host B = Bizzy (bee waitress on skates, higher voice). Slyce (the sandwich bot) is the villain and is never a host.

| File | What it gives scene code |
| --- | --- |
| `65_host.js` | `HOST.duo(ctx, g, o)`, `HOST.nibbsPose`, `HOST.bizzyPose` (same API as the crab layer) |
| `66_signs.js` | `SIGN.chapter` (neon sign), `SIGN.note` (order ticket), `SIGN.stamp` (rubber stamp), `SIGN.wrap` |
| `67_diner.js` | `SET.diner(ctx, g, o)`: wall, windows, lamps, counter, checker floor (world space) |
| `68_transitions.js` | `TR`: `wave` = kitchen swing doors, `iris` = chrome porthole, `cut` |
| `template/50_scene.js` | what `new_scene.sh` copies |

## What a builder calls

```js
K.cam = Object.assign({ rot: 0 }, CAM(g)); K.applyCam(ctx, 1);
SET.diner(ctx, g, { dark: 0, belt: null });          // the room; counter top is y 620, floor 860+
K.chalkboard(...); K.menu(...); K.ticket(...);       // explainer objects (kit 30/50)
K.screen(ctx);
SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: [title, subtitle, tagline] });
HOST.duo(ctx, g, { point: K.toScreen(x, y), pointAmt: hold(g, a, b), carryL: (c, x, y) => K.coin(c, x, y - 30, 34, {...}),
                   reacts: [{ at, kind: "think" }], preacts: [{ at, kind: "surprise" }] });
```

`HOST.duo` options and reaction kinds are documented at the top of `65_host.js`. Differences from the crab:
- `s` is the kit scale. Default 0.9 gives Nibbs about 385 px (about 33 % of the frame); 1.3 is a close-up; never go below 0.7 for more than a few seconds.
- `x` is Nibbs' feet (default 300, bottom-left). Bizzy stands `430 * s` px away (`side` +1 right, -1 left). Bottom-right corner: `side: -1, x: 1620`.
- Reactions: `surprise grin worry think nod shrug thumbs jump cheer tip spyglass` for Nibbs; `surprise grin worry think nod cheer flap shrug write twirl` for Bizzy.
- Carry: `carryR/carryL` (Nibbs paws), `pcarryR/pcarryL` (Bizzy hands, `pcarryL` puts the pad away). The callback gets the paw tip: draw the item above it (`y - 30`).
- Pointing: Nibbs' paw reaches only about 90 px, so a far target reads weakly. For far targets use `magnifier: true` (the glass aims at the point), or have Bizzy `ppoint` (pencil). The host leans into the point.
- `bizzy: false` shows Nibbs alone, `a` pops the duo in from below, `stage: "none"` hides the floor shadows.
- Returned anchors: `mascot`, `sidekick`, `clawR`, `clawL`, `handR`, `handL`, `head`, `bhead` (screen px), for throwing a coin from a paw.

## Scene props available (kit)

`K.node` (token coin), `K.edge` / `K.tag`, `K.register`, `K.menu` (order book), `K.chalkboard` (formula), `K.placemat` (chart), `K.letterBoard` (bullets), `K.receipt` (code), `K.ammScale`, `K.stopwatch`, `K.block` / `K.conveyor` / `K.ticket` / `K.ticketRail`, `K.burst`, `K.sparkle`, `K.speedLines`, `K.coin`, `K.burger`, `K.coffee`. See `../STYLE.md` section 8 for the slide-content to prop mapping.

## Gotchas

- Text carriers only: signs, tickets, the chalkboard, the register, the menu. Never text on the raw wall. Minimum 28 px on screen.
- The checker floor reads `K.cam.x` for its vanishing point, so call `SET.diner` after setting `K.cam`.
- The counter and the floor are in world space, but the hosts are in screen space and stand at feet y 1040. With a camera push-in the room grows and the hosts do not: keep `z` at or below 1.2.
- `SET.diner` paints from x -700 to 4000 by default. Widen `x0/x1` for long pans. It draws a lot of shapes, so do not call it twice per frame.
- `TR.wave` (swing doors) covers the whole frame at the cut: keep key content out of the first and last 0.6 s.
- `SIGN.chapter` sits at y 250 by default and wraps long titles (`maxW` 1300); give it 5 to 6 s.
- Hands: Bizzy's left hand holds the order pad. `pcarryL` and `ppoint` to the left remove the pad.
