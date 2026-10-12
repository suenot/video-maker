# Review log: complex-arbitrage-graph-algorithms (en) episode

Per-scene QA logs from the scene builders are in `scenes/<id>/REVIEW.md` (s01c, s01d, s02a, s02b, s02c, three rounds each). This file covers the framework, s01a, s01b and the assembled preview.

Preview: `renders/preview_en.mp4` (git-ignored), 375.8 s. It is the 31.5 s intro, a 0.6 s wave wipe, then scenes s01a-s02c (audio 0-344.9 s). Loudness is -14.5 LUFS integrated, H.264 + AAC, 1920x1080, 30 fps. The contact sheet is `preview_sheet.jpg`.

## Framework checks
- Template smoke test: the build, `snap.sh` and the debug strip work. Mouths open only for the current speaker, and `NR.cue` resolves the words.
- Diarization: two clean pitch clusters (102 Hz / 179 Hz), with a near-equal word split. I spot-read the first 45 phrases, and turn changes match the dialogue. Phrases are now also split at `. ? !`, which fixes merged turns such as "should be. But then ...". One-word interjections ("Right.", "No, not at all.") are sometimes given to the wrong host.
- `K.blinkAt` used to stop blinking after about 24 s. It now works at any t, and the intro's output is unchanged for t < 24.
- Scene durations after render all match `scenes.json` to the millisecond, so the concat cannot drift against the audio.
- Boundary continuity: I checked last/first frames of every pair from the renders.
  - s01a to s01b: iris, ink at the cut.
  - s01b to s01c, s02a to s02b, s02b to s02c: cut, and the frames are identical.
  - s01c to s01d, s01d to s02a: wave, the frame is fully covered at the cut.

## s01a (0-62.3)
- **Round 1:**
  - The hull was cut by the front waves, and the crab was off frame at zoom 1.14. The ship is now anchored in screen space whatever the pan or zoom.
  - The lagoon buoys stayed on screen into the crypto storm and cluttered the crab. The lagoon now fades out between "chaotic" and "fragmented".
  - The institution searchlights were invisible (alpha 0.22). They are stronger now, and a gold ruler line runs through every tag on "perfectly aligned".
  - The sun was too visible at the end. Storm is 0.72 to 0.75.
- **Round 2:** 0-30 s was static for too long.
  - The ship now sails in during 0-3.2 s.
  - The "100.00" tags pop one by one on "stock market".
  - The camera pushes onto the clockwork on "law of physics".
  - A lamp on the engine sweeps the lagoon on "omniscient machines".
- **Round 3 (render):**
  - The glitch slices, the gear popping off, the fog over the platforms, the muddy tint and the spyglass at the gold glint all land on their words.
  - The iris closes on the glint.

## s01b (62.3-103.2)
- **Round 1:**
  - The "Author suenot" line appeared only 1.2 s before the scroll flew away. The whole byline now appears on "published", and the name and date are underlined when they are spoken.
  - Title word pops overshot into their neighbours ("ArbitrageDetection:"). The overshoot is now 1.3.
  - The quote tags of the small islands were cut at the top edge and only 24 px on screen. They now sit below-right of each island at 44 px.
- **Round 2:**
  - The last frame matches s01c's first frame: two BTC islands with seeds 61 and 67, camera {1100, 600, 0.8}, no tags.
  - The hero quotes 61 970 / 62 060 and the "≠" bracket are readable. "“risk-free profit”" is followed by a red "?" stamp.
- **Round 3 (render, preview):**
  - The tilt-down from the side set to the chart set reads as one move.
  - The sea-blue frame between them lasts about 0.5 s.

## Preview round (whole cut, frames from the mp4)
- The cuts are invisible, readability is 28 px or more everywhere I checked (formula board, callouts, R(...) tags, "< 1 ms"), and the hosts react on every reveal.
- **Known weakness 1:** in s02a-s02c, the parrot's perch covers the left edge of the ETH island. All three scenes share that layout, so fixing it needs a coordinated move of ETH, or a smaller duo, in all three scenes.
- **Known weakness 2:** the zoomed-out archipelago shots (s01c, s02c) have tickers of about 13 px. They read as icons and are not meant to be read.
- **Known weakness 3:** the right 40 % of some s01d frames is empty sea.
