# Episode layer: statistical-arbitrage-pairs (the vaudeville house)

Collection layer for the cartoon-episode engine (`collections/_episode/README.md`). Model: the crab layer. Hosts: **Dapper Dan** (cat, host A, the explainer, the lower voice, ~105 Hz) and **Skip** (boater penguin, host B, the curious co-host, ~174 Hz). Look: 1920s B&W film, gold is the only hue.

| File | Gives you |
| --- | --- |
| `65_host.js` | `HOST.duo(ctx, g, o)`, `HOST.catPose / penguinPose (danPose / skipPose)`. Same options as the crab layer, see the header of the file |
| `66_signs.js` | `SIGN.chapter` (silent-film intertitle, drops open like an iris), `SIGN.note` (paper card + pin + leader arrow, `ink: true` for a dark card), `SIGN.stamp` (rubber stamp, `gold`, `cross`), `SIGN.wrap` |
| `67_house.js` | `HOUSE.back` (wallpaper, wainscot, floor, spots), `HOUSE.front` (valance, curtains, proscenium, footlights), `HOUSE.set` |
| `68_transitions.js` | `TR` = the film iris for scenes.json `wave` and `iris` (cut = nothing). Also makes the shell black, hides the warm vignette, greys the grain and preloads the kit fonts |
| `template/50_scene.js` | what `new_scene.sh` copies |
| `smoke_scene_example.js.txt`, `smoke_frame.jpg` | the smoke test (s03a, 311-359 s) and one frame of it: chapter, chart on the cinema screen, note, stamp, penguin tag, side -1 with big hosts |

## What a builder calls (one frame)

```js
K.cam = Object.assign({ rot: 0 }, CAM(g)); K.applyCam(ctx, 1);
HOUSE.back(ctx, g, { spots: [[1250, 560]] });          // world
K.screenChart(...); K.intertitle(...); K.easel(...);   // props (kit 50_explainer: intertitle, easel, playbill, screenChart, ticket, hangTag, typewriter, marquee; 30_stage: gauge, spring, coin, coinRain, bell)
HOUSE.front(ctx, g);                                   // curtains in front of the props
K.screen(ctx);
SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: [...] });
HOST.duo(ctx, g, { point: K.toScreen(x, y), pointAmt: hold(g, a, b), carryR: (c, x, y, g) => K.coin(c, x + 24, y, 34),
                   pcarryR: (c, x, y) => K.hangTag(c, x + 66, y + 4, "0.85", { size: 34, gold: true }),
                   reacts: [{ at, kind: "surprise" }], preacts: [{ at, kind: "think" }] });
K.film(ctx, g);                                        // LAST: projector flicker, scratches, dust, burnt corners
```

## Gotchas

- Hosts: default s 1.1 (cat 363 px, penguin 356 px). Bottom-left x 330, `side: -1` mirrors to the bottom-right (x 1590). `HOST.duo` returns `free` (the rect left for props), `gloveR/L`, `tipR/L` (device px). Penguin scale is `s * 1.2`: at s 1.5 the penguin is 490 px and covers a lot; use s 1.5+ only for close-ups.
- Without `reacts` the layer still acts: every ~12 s each host does a small unprompted gesture (`auto: false` switches it off). It skips big gestures while a host points or carries. Stressed words flick the talker's glove / flipper; the listener nods on them.
- Gestures: Dan `point present nod surprise think shrug grin wave`; Skip `point nod surprise think shrug flap grin`. Do not stack `think` on a glove that carries a prop.
- `carry*` draws at the glove (`carryR/L`) or at the flipper tip (`pcarryR/L`) in screen px and raises that limb to hold it. Pointing with the same hand wins over carrying.
- Every `*.js` in this folder is concatenated into every scene: keep examples as `.txt`.
- Only 2 props in focus. Text only on cards (paper, ink, screen). Text >= 28 px on screen: kit sizes are world px, so mind the camera zoom.
- Gold only for money and the signal (spring strain, +/-2 sigma bands, position tags, coins). `SIGN.chapter` sets line 2 in gold (`goldLine: -1` to turn that off).
- Add `K.film(ctx, g)` as the last call of `draw`. The iris transition is drawn by the runtime after `draw` and covers it.
- First use of a font on canvas used to fall back to Arial for a frame; `68_transitions.js` preloads Playfair, Oswald, IBM Plex Mono and the CJK subsets. CJK glyphs only exist for the strings the kit's `fetch_fonts.py --cjk-text` was run with.
- The engine shell is shared and crab-coloured; this layer fixes it from `68_transitions.js` (background, vignette, grain). Do not edit the shell.
- scenes.json `out: "wave"` gives an iris here, so every slide change is an iris. Keep key content out of the first and last 0.7 s of such a scene.
