# s02b_flight_map review (244.5 - 298.9)

The scene opens on a cut from s02a. I checked the cut on the renders: the last frame of s02a and the first frame of s02b match, with the same camera, islands, routes, tags and duo.

## Round 1 (full sheet, 2.5 s step)
- The R(i, j) boards on the right sat over the triangle once the camera moved, and the ETH island ended up right behind the parrot. I reframed the camera ({1260, 720, 0.66}). The boards are now screen-space: the header plank is at the top centre, the slate is on the right, and the product plank is under the slate.
- The "> 1" plank in the middle of the loop collided with the three rate tags. I moved it to the board column as "R × R × R / > 1", with "> 1" in gold.
- The flight arcs bent inward and crossed the routes. They now bulge outward and are bolder (ink under paper).

## Round 2
- The parrot hovered over the coin flags, hiding "BTC" and "USDT". Its landing spots are now beside each flag on the outside of the loop.
- The coins in the parrot's feet were invisible. The pile is now drawn 1.7x.
- The rate tags shrank to 24 px when the camera pulled back. They now grow from 36 to 39 world px (28 px or more on screen). The ETH->BTC tag slides to lu 0.37 so the tags no longer touch.
- The "j" tag was hidden behind the USDT coin pile. I moved the pile below and right of USDT and draw the tag on top.

## Round 3
- 279.5 to 289 s was a dead span: about 8 s with nothing changing. I added a slow push-in (z 0.66 to 0.72) on "multiply", a "?" sign above the parrot on "what does that look like in practice?", and a think reaction.
- With lu 0.64, the BTC->USDT tag was covered by the USDT coin. It now stays at lu 0.5.
- I rendered the scene and checked the cut frames against s02a and s02c.

## Known weaknesses
- The parrot flies facing the viewer (the rig has no side view), so the flapping wings read as a "hover" rather than as flight.
- The R(i, j) demo coin is labelled "1" for one unit. This is good for clarity, but small next to the islands.
