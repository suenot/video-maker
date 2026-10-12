# s01c_four_hop_cycle review log (103.2 - 141.9)

## Round 1 (16 frames, every 2.5 s)
- The hot cycle and the plain outer routes overlapped. Plain routes are now straight (bend 0) and the hot cycle bulges outward (bend -70).
- The USDT / SOL / ETH islands glowed before the ship arrived. The glow now starts at hop start + 1.3 s, which is when the ship lands.
- The coin pile floated on the water left of BTC. It now sits on the BTC island sand.
- The ship was hard to see at zoom 0.7. Its scale went 0.55 -> 0.68.
- "Hidden money" locked random single edges, which read as noise. The scene now finds a real triangle cycle in the archipelago (up and right, clear of the hosts), makes it hot, and gives its islands glow and sparkles.
- Archipelago islands overlapped each other. Placement now keeps a minimum gap of 520 world px.

## Round 2 (12 frames at the key beats)
- The parrot covered the BUY tag. The BUY / SELL tags moved above the islands.
- The formula slate was an empty board for a moment while zooming out, because text was drawn only at a > 0.9. The text now fades with the slate.
- The crab now points at the formula slate after writing it (thumbs on "math", then point).

## Round 3 (6 frames: opening, X, magic, math typing, zoom-out, spotlight + wave out)
- Checked: the X lands on "No, not at all", every hop lands on its coin word, the formula types in sync with "math" and is 56 px on a slate, and the spotlight shows the hosts stepping forward on "set the stage". OK.
- Known: the archipelago tickers are about 13 px at zoom 0.27. They are icons, not text to read.
- Render check (1161 frames, 38.7 s, one frame every 3 s): OK. The slate is empty for about 0.15 s before the formula starts typing on "math", which is acceptable.
