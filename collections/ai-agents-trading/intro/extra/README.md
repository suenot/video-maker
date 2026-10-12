# Extra scenes (not built into the intro)

These scenes come from the 58.5 s full-song build of the Beepo intro. They were dropped when the intro moved to a short song. Each is complete, and each can be reused for episodes.

- `60_verse.js`: one continuous take along the night floor. Neon wall signs ignite one per beat, the analyst reads the LED tape and an order book, the trader writes a plan that the risk bot checks (check / check / cross), and Beepo's tools and memory feed a bet into the tube.
- `65_chorus2.js`: the agent network (pods pop on beats, then the hot path runs), the end of the trading day (desks, equity curve, the 16:00 bell), and the observe / decide / act ring on the floor with a bot on each pad.

They rely on the intro globals (`K`, `P`, `at`, `BEAT`, `ctx`, `pulseB`, `hopArc`, `land`, `TAPE`, `HORIZON`). To use one, copy it into a project's `src/` and call its `drawVerse(t)` / `drawNet(t)` / `drawEOD(t)` / `drawRing(t)` from `render(t)`.
