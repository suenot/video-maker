# Episode layer: Execution & Market Making (Mr. Tick + Dash)

The collection layer for the shared episode engine (`collections/_episode/README.md`). It is merged into every scene build by file name, after the kit (`SK`, aliased `K`). Host A (the explainer, the lower voice) is Mr. Tick, host B is Dash.

| File | Gives you |
| --- | --- |
| `65_host.js` | `HOST.duo(ctx, g, o)`, `HOST.tickPose`, `HOST.dashPose` |
| `66_signs.js` | `SIGN.chapter`, `SIGN.note`, `SIGN.stamp`, `SIGN.wrap` (also preloads the webfonts) |
| `67_station.js` | `STATION.draw(ctx, g, o)`, the clockwork-station backdrop with parallax; `STATION.toScreen` |
| `68_transitions.js` | `TR`: "wave" is the steam wipe (cream), "iris" is the railway-tunnel portal |
| `template/50_scene.js` | the scene starter that `new_scene.sh` copies |

Full option lists are in the header of each file. A scene calls them in this order: `K.cam = ...; STATION.draw(...)`, explainer objects (kit `K.plaque`, `K.poster`, `K.board`, `K.flap`, `K.teletype`, `K.tickets`, `K.crate`, `K.wagon`, `K.pond`, `K.gauge`, `K.booth`...), then `K.screen(ctx)`, the `SIGN.*` calls, and last `HOST.duo(...)`. End with `RUN(draw);`.

## What builders call

```js
HOST.duo(ctx, g, {
  point: STATION.toScreen(1310, 335), pointAmt: hold(g, B.formula, B.formula + 3),   // Mr. Tick, nearer hand
  ppoint: [x, y], ppointAmt: ...,                                                    // Dash points over Mr. Tick's head
  carryR: (c, x, y) => K.tag(c, x, y - 34, "VWAP", { size: 34 }),                    // prop in Mr. Tick's hand
  pcarryL: (c, x, y) => K.ticket ... ,                                                // prop in Dash's wing
  reacts:  [{ at, kind: "think", dur: 1.6 }],     // Mr. Tick: surprise grin worry shrug thumbs watch whistle wave nod think point
  preacts: [{ at, kind: "ticket", label: "No 7" }], // Dash: surprise flap worry grin think shrug wave nod tape ticket point
  side: 1,        // 1 bottom-left (default), -1 bottom-right; x, y, s, layout, stage, a (appear) as in the header
});
```

Mouths, listening, nods and the beat gestures on stressed words come from the sync data by themselves. The returned object has `a` / `b` (kit anchors), `handR` / `handL` (Mr. Tick's palms in screen px, to start a thrown prop), `head`, `free` (a rect for content).

## Scene props available

`K` (kit), `P`, `SCENE`, `NR`, `HOST`, `SIGN`, `STATION`, `TR`, `ctx`, `DUR`, `pop`, `span`, `hold`, `RUN`, plus `K.cam` for the camera (set it every frame before `STATION.draw`).

## Gotchas

- **Scale units differ from the crab.** `s` is the kit scale: the default 1.2 makes Mr. Tick 360 px and Dash about 300 px, about 33 % of the frame with the platform. Do not copy the crab's 1.55.
- **One prop per host.** The kit carries it in the outer hand (the one away from the partner). `carryR` / `carryL` choose the hand. A `reacts` gesture that uses the same hand (`think`, `thumbs`, `watch`) wins over the carry, so do not overlap them. Pointing and carrying with the same hand also conflict.
- **Pointing hand.** The hand nearer to the target is used. In `layout: "left"` Dash is on the outer (left) side, so both hosts point right over each other without crossing.
- **Dash's pointing** needs the target well above and to the right (`pointUp` 0.9 clears Mr. Tick's ears). A target at the height of the hosts makes the wing point into Mr. Tick.
- **The platform** is a short strip under the hosts (about 700 px wide). With `side: -1` it sits bottom-right. Use `stage: "none"` when your scene has its own ground.
- **The sky is not a text carrier.** Text goes on `K.plaque`, `K.board`, `K.poster`, `SIGN.note`. `SIGN.chapter` keeps its top edge at y 176 so it clears the logo corner.
- **Fonts.** Canvas text loads webfonts lazily. `66_signs.js` preloads all faces, and `RUN` re-renders when they are ready. Snapshots of the very first frame may still show a fallback face if fonts take longer than the 30 s snapshot timeout allows.
- **Transitions** keep the first and last 0.6 s free of key content. "wave" covers with solid cream, so a scene that ends on a wave should not end on a cream-on-cream sign.
- **Determinism.** Everything here is a pure function of `g`. Use `K.hash` / `K.mulberry` for noise.
- **The hosts' gestures change with the transcript.** If you re-run `build_sync.py`, accents (and with them the gestures) change.
