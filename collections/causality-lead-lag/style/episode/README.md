# Episode layer: Causality & Lead-Lag (Inspector Vulpes + Sergeant Basset)

Collection layer for the shared engine `collections/_episode/` (read its README first). Files are merged by name into every scene build, after the kit and before the scene source.

| File | Gives you |
| --- | --- |
| `65_host.js` | `HOST.duo(ctx, g, o)` (fox = host A, hound = host B), `HOST.foxPose`, `HOST.houndPose`. Thin adapter over the kit's `K.hostPose` / `K.gesturePose` (`kit/46_duo.js`): it feeds `NR.talk / NR.accent / NR.who` and adds reacts, carried props and the shared puddle |
| `66_signs.js` | `SIGN.chapter` (case-file card on two cords), `SIGN.note` (paper clue note + brass-pin leader), `SIGN.stamp` (rubber stamp, `cross` for a cross-out), `SIGN.wrap` |
| `67_street.js` | `SET.street(ctx, g, o)` rainy street with parallax (follows `K.cam`), `SET.room(ctx, g, o)` dark precinct wall in screen space |
| `68_transitions.js` | `wave` = venetian blinds closing / opening, `iris` = brass magnifier iris |
| `template/50_scene.js` | copied by `new_scene.sh`: street set, cork board, two suspects, chalkboard formula, chapter sign, hosts pointing / carrying / reacting |

## What builders call

```js
K.cam = Object.assign({ rot: 0 }, CAM(g));
SET.street(ctx, g, { dim: 0.45, mid: (c) => {/* world-plane props */} });  // then K.applyCam(ctx, 1) and draw objects
K.screen(ctx);
SIGN.chapter(ctx, g, { at, until, lines: [title, subtitle, tagline] });
HOST.duo(ctx, g, {
  point: K.toScreen(wx, wy), pointAmt: hold(g, a, b),         // fox points (finger)
  ppoint: [sx, sy], ppointAmt: hold(g, c, d),                 // hound points (pencil)
  carryL: (c, x, y) => K.tag(c, x - 10, y + 30, "A > B", {}), // item in the fox's paw; carryR / pcarryR / pcarryL too
  reacts: [{ at, kind: "think", dur: 1.6 }],                  // fox: surprise grin worry shrug thumbs(=tip) tip jump spyglass nod think present
  preacts: [{ at, kind: "write", dur: 3 }],                   // hound: surprise flap worry grin think nod shrug tip write jump present
});
```

Other options: `x, y, s` (fox feet and scale, default 280, 1020, 0.95), `hs`, `side` (-1 puts the hound on the left; use x about 1640 for the right corner), `gap`, `holdA` (fox right paw: magnifier / flashlight / pin), `holdBR` / `holdBL` (hound; `holdBL: null` drops the notebook), `stage: "none"`, `sidekick: false` (fox alone), `a` (appear 0..1). Returns screen points `{ fox, hound, pawR, pawL, hpawR, hpawL }`.

## Gotchas

- Host A = fox = the LOWER voice (about 100 Hz). Init with `--host-a low` (checked on causal-forests: A 101 Hz, B 177 Hz).
- Hosts are about 360 px (fox) and 310 px (hound) tall at the default, a third of the frame; both stay fully in frame. Close-ups: s 1.4 - 1.7 with `sidekick: false`.
- The fox has no thumb: `thumbs` is the hat tip. `spyglass` raises the magnifier to the eye (`lensEye`).
- Carrying puts the paw at the side at chest height; draw items small (a tag or pin, not a board) or they cover the face. The hound drops pencil / notebook while carrying.
- `SIGN.chapter` is 250 px tall at `y 190` and lasts 4 to 6 s: do not place objects in the top 460 px during it.
- Red is evidence string only (`K.edge`), amber is the clue or the leader. Signs use ink, grey and amber on paper. `SIGN.stamp` uses `P.bad` (a failed test / spurious link).
- Text never sits on raw night: use the corkboard, chalkboard (`K.slate`), paper or tags; use `SET.street({ dim })` behind busy boards.
- The wave transition draws slats across the whole frame for 0.6 s: keep key content out of the first and last 0.6 s.
