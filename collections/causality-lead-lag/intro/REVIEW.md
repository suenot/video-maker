# Intro review log

The intro runs the full song: 64.5 s, 1920x1080, 30 fps, with `song_full.m4a` muxed in (song_raw.mp4 minus 0.20 s of lead silence, 0.9 s fade at the end, gain + limiter to -13.9 LUFS integrated, -1.5 dBFS peak). There is also a silent copy of each render.
Tempo is a steady 120 BPM (bar 2.0 s). Downbeats were measured with librosa for bars 0-23 (`K.G.BARS`, 1.82 ... 47.84 s) and extrapolate after that (librosa's own beat track drifted after 48 s, but the onsets stay on the 0.5 s grid).
`lyrics.srt` was off by up to 4 s; word timings come from `npx hyperframes transcribe` (parakeet) and are listed in `src/10_setup.js`.

## Outline (second by second)

| Time | Line | Picture |
| --- | --- | --- |
| 0 - 1.8 | intro | crane down from the moon through the rain; lightning |
| 1.8 - 3.8 | intro | the lamp flickers on: the fox under it; he lifts his hat brim, sly eyes |
| 3.84 | "Lead and lag" | two paw trails stamp across the wet road, one print a beat: A (amber) leads, B (blue) half a beat behind; "!" |
| 5.84 | "step by step" | magnifier out, the fox walks after the prints |
| 7.83 - 11.8 | "Follow the trail that the markets left" | camera trucks and pushes in; lightning at 9.83; the trails trace two price lines, B's jump two prints after A's |
| 11.85 | "Find the cause" | crouch, push in: Δt bracket between the two jumps, tag "Δt = 2" |
| 14.82 / 15.77 | "test it twice" | two green check stamps |
| 15.82 | "Causality and Lead-Lag in Markets" | spinning newspaper lands: "A → B", lagged price photo |
| 17.82 | | pull back: the fox reads it at his desk (blinds, rain, desk lamp); he peeks over the paper |
| 19.82 | "A detective fox" | paper drops, smirk, hat tip |
| 21.84 | "with a magnifying glass" | lens up to his eye: the giant amber eye, a blink |
| 23.33 | | iris through the lens |
| 23.83 | "Follows the footprints of prices that pass" | the city from above: A and B trails follow the same streets, B two beats late; price tags at the turns; the top-down fox follows |
| 27.83 | "Who moved first" | lineup, lights clank on; BTC steps forward (1) |
| 29.85 | "and who followed behind" | ETH steps forward (2), tag "+2"; two eyes glow in the shadow on the right; "!" |
| 31.84 | "Correlation's a clue" | whip pan to the cork board: clue card, dots, fit line |
| 33.84 | "but not proof, keep in mind" | "≠" stamp slams; head shake; paw taps temple |
| 35.84 | "Lead and lag" | BTC and ETH mugshots pinned |
| 37.86 | "step by step" | red string BTC → ETH, tag "lag 2" |
| 39.85 | "Follow the trail" | SOL pinned, ETH → SOL "lag 1", BTC → SOL dim |
| 43.85 | "Find the cause and test it" | lights out, flashlight sweeps the dark corner |
| 45.85 | | hidden mugshot "?" in the beam; "!" |
| 47.84 | "Causality and lead-lag in markets" | lights back; Z → BTC and Z → ETH strings glow amber |
| 49.84 | | push in: the BTC → ETH string snaps (spurious link) |
| 51.84 | break | lightning: the confounder is unmasked, Z |
| 52.84 | | venetian blinds close and open on the street |
| 53.84 | "find the cause and test it twice" | the fox holds up the case file; two stamps |
| 55.84 | "Causality and Lead-Lag in Markets!" | the marquee plate unfolds, title letters drop in, hop |
| 57.84 | | six case badges (causal graph, Granger, transfer entropy, lead-lag, confounder, causal forest) |
| 59.84 / 61.84 | outro | hat tip; wink |
| 63.84 | end | the lamp goes out; the marquee stays lit |

## Round 1 (first build, street only)
- The two trails did not read as lead-lag: the jumps were 84 px squashed to 52 px. The jump is now 150 px, and each trail has a faint price line through its prints. Prints are placed on the line's vertices (`K.trail` spaced them by arc length, which put them off the line at the jumps).
- Fire escapes were diagonal strokes that read as the letter Z (a confounder spoiler). They are now platforms with ladders.
- Road reflections were stacked rectangles that read as a dashed column. They are now soft ellipses.
- The moon was off screen (parallax maths). Moved so the opening crane starts on it.
- The opening lightning washed the frame grey (0.8). Now 0.35 at 1.0 s.

## Round 2 (all scenes)
- Office: the fox was fully hidden by the newspaper, so the "peek" did nothing. The fox sits higher and the paper lowers 330 px: hat and sly eyes over the page.
- Map: the trails were tiny and the camera lost them. The camera now rides between A's newest print and the fox, prints are 1.25x, roads are lighter with lane dashes (the blocks used to read as blobs), and the top-down fox has a grey brim, amber band and a light pool (it was a black dot).
- Board: the Z → BTC / Z → ETH strings were drawn under the darkness mask and invisible. The lights now come back at 47.84 for the strings; Z stays masked until the lightning at 51.84.
- Title: the case file slid down but stayed on screen under the badges. It now drops out of frame.

## Round 3 (pacing, 1 fps contact sheet)
- 7.5 - 11.5 s were four near-identical frames. Added a push-in at 9.83 (z 1.18, lower) and a lightning flash on that downbeat.
- 36 - 52 s: mugshots were small at z 0.66 - 0.78 and the string cut was hard to see. Nodes are 1.1 - 1.25x, tags 38 - 40 px, and the camera now pushes in on the snap (49.84, z 1.0), then swings to Z for the unmask.
- 57 - 64 s: a static hold. The camera now drifts (x +40, z 1.04) under the marquee chase, hat tip and wink.
- `check`: the title spans are under `#vig` / `#grain` (transparent overlays); `#title` is marked `data-layout-allow-occlusion`. Lint 0 errors; contrast 27/27 AA.

## Known weaknesses
- The fox walk is a simple two-leg swing with a body bob; it reads, but has no heel-toe.
- The top-down fox on the map is small and partly covers the "101" price tag at one moment.
- The title plate covers the lamp head on the title set, so the lamp cone seems to start under the plate.
- One lint warning remains: the file is large, because it is built from the kit by design.
