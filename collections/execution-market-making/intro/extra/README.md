# Extra scenes (not in the build)

Scenes written for the 60 s full-song version and dropped when the intro moved to the 27 s short song:

- `45_cab.js`: inside the locomotive cab, whistle cord, slippage gauge on the dashboard ("Choo choo, keep the slippage low").
- `48_series.js`: the hall departure board listing the collection (TWAP · VWAP, POV, ALMGREN-CHRISS, BID / ASK).

They read the intro globals (`T`, `ICONS`, `ROUND_C`). To reuse one, move it back into `src/`, add its timing fields to `T` and a cut in `70_render.js`.
