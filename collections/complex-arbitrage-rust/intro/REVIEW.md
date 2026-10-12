# Intro review log

The intro now runs the full song: 64.2 s, 1920x1080, 30 fps, with `song_full.m4a` muxed in (the whole `song_raw.mp4`, end fade from 62.4 s, two-pass loudnorm to -14.0 LUFS). There is also a silent copy of each render. Rounds 1-4 below are the earlier 20 s cut; rounds 5-7 are the full-song version.
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

## Round 4 (retimed to the real song)
- The beat grid now uses the measured downbeats (`K.G.BARS`), so every pop and transition lands on the song.
- Each sung line got its own picture:
  - 4.43 s, "cycle flows": the loop routes draw first, the loop glows on beat 3, and the ship sails one lap that pays +0.46 %.
  - 8.24 s, "graph and matrix": every route's rate flies out of the map into a 5x5 rate matrix. At 10.38 s ("the Rust-crab knows") the crab pops up and the three loop cells glow.
  - 12.05 s, "futures, spot and copula sea": an iris closes on our ship and opens on two ships, ours (spot, cog sail) and an hourglass ship (futures). A gold basis rope with "+0.8 %" joins them, and at 13.96 s one swell lifts both ships.
  - 15.86 s, "sail with me!": the banner unrolls on the downbeat.
- Bug: the first build was all blank, because `T` was used before its definition in `10_setup.js`. Moved; the console error now also prints on the canvas.
- Matrix shot: the ETH island sat under the matrix board. The camera now goes to z 0.42, with the triangle in the left half.

## Round 5 (full song: structure)
- Beat grid: librosa drifted through the verse, because the accordion off-beats confuse it. The tempo comes from line starts in the whisper (medium.en) word timings instead. The same chorus lines sit 22.9 s = 12 bars apart, so the bar is 1.9067 s (125.9 BPM). Downbeats are at 0.60 + n x 1.9067 s (`K.G.BARS`, 35 bars).
- Sung lines, from whisper:
  - verse: "A crab sails out" 5.9, "Through markets wide" 9.9, "Three ports in a loop" 13.7, "Haul in the spread" 17.6;
  - chorus: 21.4 / 23.3 / 25.3 / 29.1;
  - instrumental break: 32.8 - 44.1;
  - chorus 2: 44.3 / 46.2 / 48.1 / 51.9; "Haul" 53.9, "Heave ho" 58.8, "Graph" 60.2, "Futures!" 62.3, fade.
- New beats:
  - cap tip with a wink, and a spark running along the hull rivets ("Rust-iron ship");
  - coin flags pop on the horizon islands ("markets wide");
  - the spyglass moves to "Three ports", and the lap pays out on "catch!";
  - the crab beckons and winks on "sail with me!";
  - a break of accordion jig, then a sail-cloth basis chart (futures converge to spot), then a dusk logbook typing a Rust Bellman-Ford cycle finder;
  - chorus 2 is a fast lap (+0.92 %), the matrix stacks into a tensor, and two ships at sunset;
  - the title lands on the last "sail with me!" (52.1 s); then a net of coins is hauled on every beat, dumped, and followed by jump, snap with medallions, cap tip and wave to the end.
- Kit, additive only (an episode builder uses it): `st.wink`, and measured downbeats in `K.G.BARS`. Scene code stays in `intro/src`.

## Round 6
- At the 7 s push-in the crab was cut off at the left. The side camera gained `toX`, so a push-in also recentres.
- The rivet sparks were too small to see. Each spark is now 34 px with a glow.
- The horizon coins were tiny. Radius 38 -> 48.
- The accordion covered the crab's face. It now sits in front of the belly, with zigzag dark bellows so it reads as an accordion and not a box.
- The sail chart covered the crab's eyes. Chart 1060 x 480, raised to y 285.
- The net was hard to see. It is 1.4x larger and further right.

## Round 7
- At zoom 0.92 the opening showed the canvas edge. Side zoom is never below 1.0 now.

## Known weaknesses
- The crab's legs are simple 3-point limbs: readable, but less refined than the body and claws.
- In the matrix shot the map tags are about 19 px. They are context only; the matrix shows the same numbers at 26 px.
- The title-card crab is about 220 px wide. It is charming, but secondary to the banner.
- One lint warning remains: the file is large, because it is built from the kit by design.
- 52-58 s: the title card is dense (banner, net, coins). The banner never moves after it unrolls.
