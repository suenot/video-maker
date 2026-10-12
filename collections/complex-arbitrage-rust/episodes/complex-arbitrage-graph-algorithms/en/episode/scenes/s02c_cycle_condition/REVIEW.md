# s02c_cycle_condition review (298.9 - 344.9)

The scene opens on a cut from s02b. I checked it on the renders: the camera, triangle, tags and boards all match. It ends with the wave out.

## Round 1
- The scene threw `Cannot read properties of undefined (reading 'replace')` from 323 s onward, and every frame after that was blank sea. The cause was a negative modulo on the archipelago colour index (i < 0). Fixed.
- The formula typing matches the words: "R(i1, i2)" on 300.3 to 302.2, "×" on "times", "R(i2, i3)" on 303.4 to 304.9, "…" on "dot dot dot", "R(ik, i1)" on 307.1 to 309.3, and a gold "> 1" on "greater than one" (309.7 to 310.3). Each term lights its leg of the loop.

## Round 2
- The × tokens on every route made an unreadable carpet. Now only about half the routes carry one.
- The archipelago faded to translucent near the CPU, which gave ghostly double outlines. The CPU now has an 820-unit clearing instead, and everything is drawn opaque.
- The original triangle was lost in the crowd. A gold glow now marks it while zoomed out.

## Round 3
- The "more than you started with" coin pile was a messy scatter. It is now a tower of coins that grows from 3 to 12 next to BTC, with sparkles.
- 311 to 317 s had no change. A gold mini ship now sails the loop on "your magical flight path".
- In the CPU push-in, the engine, the gauge in the red, the sweat, the smoke, the "CPU" plate flash and the steam burst on "highly inefficient" all read. The crab shakes his head (a lean oscillation).

## Known weaknesses
- The weights queue on the chute but do not visibly drop into the hopper.
- The zoomed-out archipelago is busy by design ("thousands of assets"). Its × tokens are about 29 px.
