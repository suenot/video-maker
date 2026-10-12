# Volatility Regimes episode layer (Siggy the surf turtle + Gully the seagull)

Files here are merged by name with `collections/_episode/lib` (same name = replaces the engine file). Read `collections/_episode/README.md` first.

| File | What it gives a builder |
| --- | --- |
| `65_host.js` | `HOST.duo(ctx, g, o)`: Siggy (host A, explainer) + Gully on his lifeguard stand (host B) on a sand patch, screen space. Same options as the crab layer: `x y s side point pointAmt ppoint ppointAmt reacts preacts carryR carryL a`, plus `gap`, `stage` (`beach` / `stand` / `none`), `gully:false`. `HOST.siggyPose` / `HOST.gullyPose` give the raw poses |
| `66_signs.js` | `SIGN.chapter` (surf poster unrolling from a dowel), `SIGN.note` (cream card + leader arrow), `SIGN.stamp` (rubber stamp, optional cross-out) |
| `67_beach.js` | `BEACH.world(ctx, g, {storm, vol, horizon, lighthouse, flash, ...})` sunset/storm beach backdrop; `BEACH.storm(g, [[g0, v0], ...])` smooth regime tween; `BEACH.board` carrier panel |
| `68_transitions.js` | `TR`: `wave` = surf-poster wipe (coral, orange, yellow, cream, sea screens), `iris` = gauge-ring dial iris |
| `template/50_scene.js` | scene starting point (chapter sign, forecast board, regime flip, duo) |

## Calls

- `reacts` (Siggy): `surprise grin worry shrug thumbs shaka jump cheer think nod spyglass`. `preacts` (Gully): `surprise flap worry grin think nod whistle binos`. `{at, kind, dur}` in global seconds, `dur` default 1.6. Use `whistle` on warnings and `binos` for "spotting" the next regime change.
- `point` / `ppoint` take a SCREEN point (`K.toScreen(wx, wy)` for world objects). Siggy stretches the nearer flipper along shoulder to target; Gully shows a wing.
- `carryR` / `carryL` are `(ctx, x, y, g) => draw` at the flipper tip (`K.tag`, `K.medal`, `K.postcard`...). Draw props about 30 px above y so they sit on the paddle.
- Returned `{A, B, flipR, flipL, feetA, feetB}` are screen points (heads, flipper tips, feet).
- Regime: pass one `storm` 0..1 to `BEACH.world` and every kit call; turquoise = calm, coral = storm; flip it with `BEACH.storm`.

## Gotchas

- Hosts take about 1000 px of width in a bottom corner at s 1.55 (Siggy ~390 px tall; Gully's stand puts him at Siggy's head height). Content goes in the rest; with `side: -1, x: 1590` Gully ends up at x about 1200.
- Siggy at the left points over Gully for content on the right. Use `side: -1` (hosts bottom-right) when the content is left, or point with `ppoint` (Gully is closer).
- Gully's `binos` / `whistle` poses cover the beak by design; keep them for short beats.
- Signs and `HOST.duo` call `K.screen`; draw world objects first. Lobster/Nunito/Fira Mono are preloaded in `66_signs.js` (canvas text does not trigger webfont loading).
- Transition halves meet on a full turquoise frame (`wave`) or deep teal (`iris`). Keep key content out of the first and last 0.6 s.
- Text on canvas: numbers, Greek symbols, icons and the SCENES.md strings only; text sits on cream, slate or wood.
