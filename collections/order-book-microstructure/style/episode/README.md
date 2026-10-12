# Episode layer: Order Book Bazaar (Tikki + Gekko)

Collection layer for the episode engine (`collections/_episode/README.md`). The files are merged by name with `_episode/lib` and concatenated after the kit, so a scene sees `K` (= `BK`), `P`, `NR`, `HOST`, `SIGN`, `SET`, `TR`, `RUN`, `pop`, `span`, `hold`.

| File | What it gives a scene builder |
| --- | --- |
| `65_host.js` | `HOST.duo(ctx, g, o)`, same API as the crab layer. Tikki (raccoon, host A, explainer, lower voice) + Gekko (gecko, host B, curious, higher voice). Mouths, listening, nods and paw gestures on stressed words are automatic from the sync data. `HOST.tikkiPose` / `HOST.gekkoPose` for solo shots |
| `66_signs.js` | `SIGN.chapter` (kilim banner unrolling from a beam), `SIGN.note` (paper tag with a leader string), `SIGN.stamp` (rubber stamp, optional cross-out), `SIGN.wrap` |
| `67_set.js` | `SET.bazaar(ctx, g, { pan })` street backdrop (sky, skyline parallax, bunting, lanterns, floor at y 680); `SET.plaster(ctx, g)` counting-room wall for boards, tables and code |
| `68_transitions.js` | the collection's own transitions: `wave` = kilim curtain drops / rolls up, `iris` = round window in a terra ring. Same `TR` API as the engine |
| `template/50_scene.js` | what `new_scene.sh` copies: plaster set, tile board, note, chapter, hosts pointing, carrying and reacting |

## What a builder calls

```js
HOST.duo(ctx, g, {
  x: 300, y: 1010, s: 1.0, side: 1,           // side -1 and x ~1590: bottom-right corner
  point: [sx, sy], pointAmt: hold(g, B.a, B.a + 3),      // Tikki; ppoint / ppointAmt for Gekko
  reacts: [{ at: B.a, kind: "think", dur: 1.6 }],         // surprise grin worry shrug thumbs cheer jump nod think explain
  preacts: [{ at: B.b, kind: "surprise", dur: 1.2 }],     // Gekko: + flap
  carryR: (c, x, y, g, s) => K.tag(c, x, y - 34 * s, "0.01", { size: 40 }),  // prop in Tikki's right paw
  carryBR: ..., carryBL: ..., carryB: "crate" | "ledger",  // Gekko's paws / belly hug
  sidekick: false, rug: false, a: pop(g, B.in, 0.6),       // Tikki alone, no kilim, pop-in
});
```

It returns `{ A, B, clawR, clawL, bR, bL }`: `A.head` / `B.head` are screen points for tags and shouts, the paw points start a thrown item.

## Gotchas

- **Scale is not the crab's.** Default `s` is 1.0 (Tikki about 330 px, 30 % of the frame; Gekko about 285 px). The crab layer's 1.55 would make Tikki half the frame. Close-ups are `s` 1.8 - 2.2.
- **Host A = the lower voice.** Run `init_episode.py --host-a low`. The curious NotebookLM host is usually the higher voice and often talks MORE words, so the default `more` picks the wrong one.
- Tikki keeps the abacus in his left paw (beads flick on his stressed words). `carryL` replaces it; `hold: null` removes it. While the abacus is held he points and gestures with the right paw (`carryR` blocks that gesture hand too).
- Props are drawn on top of the hosts at the paw: draw them with the bottom centre at `(x, y)` and scale by the 5th argument `s`.
- Arms are short (Tikki reach 70 px, Gekko 58): a pointing paw does not reach far, the pose (lean + eyes) carries the point. Put the host on the side of the object.
- Gekko's `carryB` hugs the prop at the belly and never lifts; for a raised prop use `carryBR` / `carryBL`.
- The bazaar set puts the skyline above the hosts' heads (horizon 640). Do not move the horizon below about 680, the hosts' heads then sit on busy houses.
- Text carriers: tile board (formulas, mono), rug table, price list, code scroll, signboard, paper tags. Fonts: Yeseva One titles, Fira Sans Condensed labels, PT Mono code (text never boils, min 28 px).
- Keep key content out of the first and last 0.6 s next to `wave` / `iris`.

Smoke test: `episodes/ccxt-pro-websocket-orderbook-methods/en` (host A = low), scene `s03a_2_watchorderbookforsymbols_bulk_subscription` holds the template.
