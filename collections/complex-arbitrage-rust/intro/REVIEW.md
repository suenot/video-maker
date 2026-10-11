# Intro review log

The intro is 20.0 s, 1920x1080, 30 fps, silent. It runs on a beat grid at 120 BPM (1 bar = 2 s).
Each round comes from snapshots I looked at (`tools/snap.sh`, 12 to 17 frames, plus full-resolution crops).

## Round 1 (first build)
- Opening: the ship and crab were too small in a frame of mostly sky. Ship 1.3 -> 1.6, crab 1.0 -> 1.15.
- The clouds were rows of identical bumps and read like lettering. They are now cumulus clouds drawn as the outline of a union of 5 circles.
- Smoke puffs drifted across the crab's face like a thought bubble. They now drift up and right, behind the sail. The helm wheel moved behind the crab.
- Eye-pop frame (3.0 s): a seeded blink closed the eyes during the surprise. Blinks are now forced open there.
- Chart view at zoom 0.6: the coin tickers were about 17 px and the rate tags about 19 px, so they could not be read. Coin r is now 62 -> 88 and tags 30 -> 46 world px (about 28 px on screen).
- The "418.6" tag sat on top of the "3 270" tag. Tags now have a per-edge label position (BTC-SOL at u = 0.72).
- The ship in the chart view was too small to see the crab. Ship 0.42 -> 0.6, and the end close-up zoom 1.8 -> 2.3.
- The wave wipe read as a river line. It is now a 260 px wave wall with a deep-water shade, a foam crest and spray.
- The jump legs stretched into long bars. Legs now tuck under the body in the air.

## Round 2
- The legs still looked like spider legs when splayed. I reduced the knee and foot spread, and the knee now arches above the hip.
- The jump was too high and the crab overlapped the banner. Hop height 150 -> 85.
- "in Rust" letters bounced with a stagger and looked uneven in stills. The whole line now hops together on the accent (6 px).
- Hat tip: the claw covered the eye. The claw target moved to the cap brim.
- The golden-hour sky went grey, because blue mixed with orange. Only the lower sky is warmed now (rule added to STYLE.md).

## Round 3 (language variants)
- ru: "Сложный арбитраж" nearly touched the rolled ends of the banner. Cyrillic now fits at 1840 / chars (about 115 px).
- zh-CN / zh-TW: "Rust" was set in Noto Sans. Rubik is now first in the stack, with CJK glyphs falling back to Noto Sans SC / TC 900.
- `check`: canvas edge and title-overlap infos are intentional (full-bleed art, letters dropping mid-flight). The canvas is marked `data-layout-allow-overflow` and the title `data-layout-allow-overlap`. Lint has 0 errors; contrast passes 22/22.

## Known weaknesses
- The crab's legs are simple 3-point limbs: readable, but less refined than the body and claws.
- At 13 s the cargo plank shows "ETH" while the gain line still says "+0.46 %", because the gain updates only when the ship reaches USDT. This is correct but subtle.
- The title-card crab is about 220 px wide. It is charming, but secondary to the banner.
- The timing follows a 120 BPM grid, not the real song yet. To retime, set `K.G.BPM` / `K.G.OFFSET` in `src/10_setup.js`.
- Two lint warnings remain: the file is large (it is built from the kit, by design), and there is an audio file without an element (the song is muxed later, and another agent owns `song_*`).
