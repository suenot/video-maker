# Episode layer: Greenhouse Lab (Professor Strix + Pico)

Collection layer for the episode engine (`collections/_episode/README.md`). Kit namespace `LK` (`K` in scenes). Host A = Professor Strix (owl, explainer, lower voice), host B = Pico (hummingbird, curious co-host, higher voice). Check by pitch at init: `init_episode.py ... --host-a low` (owl voice about 104 Hz, hummingbird about 178 Hz in the smoke-test episode).

| File | What builders call |
| --- | --- |
| `65_host.js` | `HOST.duo(ctx, g, o)` (adapter over `K.duo`, kit `46_duo.js`), `HOST.owlPose` / `HOST.picoPose` |
| `66_signs.js` | `SIGN.chapter` (brass deco plaque on rods), `SIGN.note` (catalogue card, brass pin leader), `SIGN.stamp` (oxblood rubber stamp), `SIGN.wrap` |
| `67_lab.js` | `LAB.draw(ctx, g, o)` greenhouse backdrop (wall, windows, shelves, pipe, bench, floor, lamps, ferns), `LAB.BENCH_Y` 720, `LAB.FLOOR_Y` 985 |
| `68_transitions.js` | `TR`: "wave" = leaf curtain with a brass edge (covered colour dark leaf green), "iris" = brass deco iris |
| `template/50_scene.js` | scene template (plate, tag, chalkboard, chapter sign, duo with point / carry / reacts) |

## HOST.duo options

Same as the crab layer: `x, y, s, side, point, pointAmt, ppoint, ppointAmt, reacts, preacts, carryR/carryL, a`, plus `stage`, `hideB`, `birdDx/birdDy`, `carryPoseR/L`, `carryAmt`. Defaults: owl feet (380, 1010), s 0.95 (owl 410 px, Pico about 310 px). Bottom-right: `side: -1, x: 1540`. Close-ups s 1.3 - 1.6 on jokes and caveats.

- Reaction kinds, owl (`reacts`): surprise, grin, worry, shrug, thumbs, jump, magnifier, nod, think. Pico (`preacts`): surprise, nod, think, write, flip, worry, flap, grin.
- Returns `{ owl, bird, owlHead, birdHead, handR, handL, free }`; `free` is the rect left for content on the other side.

## Gotchas

- The set is a world: call `LAB.draw` after `K.cam = ...`, then draw the explainer objects with `K.applyCam(ctx, 1)`, then `K.screen(ctx)` for signs and the hosts. Pass `stage: "none"` to `HOST.duo` with `LAB` (the lab has its own bench and floor). Without `LAB`, the default stage is a bench strip.
- Explainer objects go on the bench top (`LAB.BENCH_Y`, y 720) or above it, in the part of the frame the hosts do not own (x above about 900 when the hosts are bottom-left). Chart plate about 800 x 380 at (1290, 400), chalkboard under it at y 690.
- `carryR/L` items are drawn upright in screen px under the glove, at the fist; draw them extending upward (a flask at y + 60, a seed at y - 20). The carrying glove is held at owl-local (+-175, -270); only one reaction plays at a time.
- When the owl points while one glove carries, the free glove points (the arm may cross the body).
- Pico lifts 130 px while the owl points, so the arm passes under; give him `ppoint` to turn him to a target.
- Camera pushes: the hosts stay in screen space, so a camera push does not scale them; give them `s` explicitly.
- Text on a plate is Oswald / IBM Plex Mono (K.FONT); the chapter sign shrinks a long line to fit 1500 px. Chinese needs the CJK subsets (`kit/tools/fetch_fonts.py --cjk-text`).
- Kit additions for the episode layer (additive in `style/kit/46_duo.js`): `holdAR`, `carryPoseR/L`, `carryAmt`, `hopA`, `squashA`, `birdDx/birdDy`, `hideB`, `poseOnly`, owl kinds worry / jump / magnifier, Pico kinds worry / flap / grin, and `handR/handL/free` in the return value.
