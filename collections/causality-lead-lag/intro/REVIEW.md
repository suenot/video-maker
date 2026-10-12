# Intro review log

**Current cut (UPDATE 3): the intro runs the full short song**, 33.2 s, 1920x1080, 30 fps, `song_short.m4a` muxed (song_short_raw.mp4 cut at 33.2 s, 0.9 s fade, gain + limiter: -14.0 LUFS integrated, -1.8 dBFS peak), plus silent copies. The marketmaker.cc logo sits on an ink plaque with an amber hairline in the top-right corner (48 px margin, 96 px tall) for the whole intro, with one bounce on the first downbeat.
Tempo is about 123.8 BPM (bar 1.94 s); downbeats measured with librosa (`K.G.BARS`, 0.16 ... 31.15 s). `lyrics_short.srt` was coarse; word timings come from whisper small.en + parakeet via `npx hyperframes transcribe`.

## Outline (short cut, second by second)

| Time | Line | Picture |
| --- | --- | --- |
| 0 - 2.1 | instrumental | crane down from the moon through the rain; lightning |
| 2.09 - 4.0 | instrumental | the lamp flickers on: the fox under it; hat brim up, sly eyes |
| 4.04 | instrumental | spinning newspaper lands: "A → B" headline, lagged price photo |
| 5.0 - 5.97 | instrumental | pull back: the fox at his desk (blinds, rain, desk lamp); paper drops, hat tip |
| 6.94 | instrumental | magnifier up to his eye: the giant amber eye, a blink |
| 7.42 | | iris through the lens onto the street |
| 7.92 | "Lead and lag," | two paw trails stamp across the wet road on eighth notes: A (amber) leads, B (blue) follows; "!" |
| 9.87 | "step by step," | magnifier out, he walks after the prints; the trails trace two price lines |
| 10.83 | | push in: Δt bracket between the two jumps, tag "Δt = 2" |
| 11.80 | "Follow the trail that the markets left," | lightning cut to the city from above: A and B trails follow the same streets, B two beats late, price tags at the turns, the top-down fox follows |
| 15.67 | "Find the cause" | lightning cut to the cork board: BTC and ETH mugshots pinned, red string BTC → ETH, tag "lag 2" |
| 17.58 / 18.31 | "and test it twice," | two green check stamps; the fox nods twice |
| 19.53 | "Causality" | lights out; the flashlight sweeps the dark corner |
| 20.5 | | hidden mugshot "?" in the beam; "!" |
| 21.46 | "and Lead-" | lights back; Z → BTC and Z → ETH strings glow amber |
| 22.43 | | lightning: the BTC → ETH string snaps (spurious), the confounder is unmasked: Z |
| 22.9 | | venetian blinds close and open on the street |
| 23.38 | "-Lag in Markets!" | the marquee plate unfolds, title letters drop in, the fox hops |
| 25.33 | | six case badges (causal graph, Granger, transfer entropy, lead-lag, confounder, causal forest) |
| 27.26 / 29.21 | outro | hat tip; wink |
| 31.15 | end | the lamp goes out; the marquee stays lit |

## Round 4 (short song + logo)
- Retimed every scene to the short song's grid; the 4-bar instrumental now carries the opening and the office (newspaper, lens eye). The lineup and the clue card were dropped (no lines for them); the street trails, map, board and title keep their pictures.
- Scene changes on downbeats are hidden in lightning flashes (map, board) or diegetic (iris, blinds).
- Title plate covered the logo plaque; the plate moved down to y 170 - 430, badges to y 560, the fox lower.
- `check` flagged the title spans as occluded by the vignette; `#title` now sits above `#vig` / `#grain`. Lint 0 errors, check passes, contrast 5/5 AA.

The rounds below are from the first, full-song (64.5 s) build, which was superseded.

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
