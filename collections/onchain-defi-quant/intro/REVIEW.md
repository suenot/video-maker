# Intro review log

The intro runs the whole song: 30.8 s, 1920x1080, 30 fps, with `song_full.m4a` muxed in (the uncut "The Sandwich Gambit", about 150 BPM, loudnorm -14). Renders: `renders/intro_{en,ru,zh-CN,zh-TW}.mp4` plus `_silent` copies. The marketmaker.cc logo plate sits top-right for the whole film.
Rounds 1-3 below were done on the first 20.9 s cut; round 4 is the full-length version.
Each round comes from snapshots I looked at (`tools/snap.sh`, 10 to 19 frames) and the 1 fps sheet `snapshots/contact-sheet.jpg`.

## Song cut
- No `lyrics.srt`. Whisper (small.en) on `song_raw.mp4` gave the words: "Order book at level two / bids and asks in plain view / MEV lurks in the mempool dark / sandwich attacks leave their mark / Read the book, read the book / Microstructure off the hook / ... rings the matching bell / Latency knows it well", then an instrumental outro.
- librosa: about 150 BPM; sung lines start on downbeats every 2 bars (whisper runs 0.1 - 0.2 s early). "MEV" has a half-beat pickup at raw 6.41 s.
- The song has no instrumental intro, so the cut borrows one bar of the outro: raw 25.60 - 27.18, then raw 6.39 - 25.75 (from the "MEV" pickup to the end of "well"), 30 ms crossfade on the beat, 0.6 s fade, loudnorm I=-14 TP=-1.5. Result: 21.0 s file, composition 20.9 s, -13.7 LUFS.
- Measured downbeats in the cut: `BARS = [0.16, 1.76, 3.37, 4.97, 6.52, 8.15, 9.75, 11.35, 12.96, 14.56, 16.18, 17.79, 19.37, 20.97]`.

## Round 1 (kit gallery + first full build)
- Gallery: the conveyor links read as piano keys. They are now open oval chain rings over solid plates.
- Gallery: the toque was so big it hid the ears and forehead. Toque 0.86x and higher; ears moved out.
- Ticket stamp overlapped the ticker; smaller and lower.
- Opening: Nibbs showed only his eyes above a 300 px counter, and at 0.3 s his hidden body peeked out below the counter. He is now higher (feet 880, scale 1.6) and clipped above the counter top.
- Mempool: the rail sat at body height, so Slyce hid every ticket. The conveyor and rail moved up (belt 340, rail 470).
- Chomp burst covered Slyce's face; it is smaller and sits up-right of the tray.
- Title: spaces collapsed in the per-letter spans ("Onchain&DeFi"). Spaces are now NBSP.
- Doors: a 4-point door outline curved into a bulge (spline). Doors are now dense rectangles with the porthole centred.

## Round 2
- 3 s: Slyce's visor was hidden behind the counter top, so "lurks in the dark" had no red eye. He now peeks 45 px higher; the corner wash is darker and bluer.
- 5.4 s: the magnifier glass covered the front-run ticket, the key beat of the lyric. Rail and tickets moved 80 px right, Nibbs stops 100 px further left.
- Menu shot: the glass handle crossed Nibbs's face. Menu moved right of him; the paw height and lens angle are solved per row so the glass sits on the row being read.
- AMM shot: the glass covered the placemat and Nibbs was cut by the frame edge. The kit gained a left-paw magnifier (`magHand: "L"`), the glass now points down-left, and the scale / placemat / bell were re-spaced.
- Title: after the catch the glass stayed over episode plate 5; it now swings back up.

## Round 3 (check, languages, 1 fps sheet)
- `npx hyperframes lint`: 0 errors, 1 warning (file size, by design: the kit is inlined). `check`: layout 0 issues, contrast 17/17 AA, runtime 0 errors.
- ru / zh-CN / zh-TW titles checked at 19.8 s: all fit inside the neon tube (title size is measured per frame against 1250 px); CJK subsets render.
- 1 fps sheet: every second has a clear subject; no empty frames; moves land on downbeats (pan 1.76, front clip 4.97, sandwich 6.52, menu 8.15, whip 11.35, trade 12.96, DING 14.56, sign 16.18, plates 17.79, catch 19.37).

## Round 4 (full song + logo, per brief UPDATE 2/3)
- Song: no cut any more. `song_full.m4a` = `song_raw.mp4` audio, 0.5 s tail fade, loudnorm. Downbeats `BARS = [0.12, 1.81, 3.41, 5.02, 6.59, 8.20, 9.82, 11.40, 12.98, 14.61, 16.21, 17.81, 19.39, 21.01, 22.62, 24.22, 25.80, 27.38, 28.98, 30.58]`. The old story moved 3 bars later.
- New pictures for the lines the cut had dropped: 0.12 "Order book at level two" = a level-2 menu card on the counter with L1/L2 tags; 3.41 "bids and asks in plain view" = depth bars grow, Nibbs presents the book with both paws; 22.62 "Latency knows it well" = whip pan to two order rails and a stopwatch, Slyce zips his ticket to the finish (4 ms), the victim's ticket crawls in (120 ms). The title card now plays over the 5 s instrumental outro.
- Logo: DOM plate top-right (cream, ink border, cherry mark, Nunito 900 wordmark), inlined from `style/kit/assets/marketmaker-logo.svg` by `build.py`, one bounce on the first downbeat. The neon sign shrank to 1220 px and moved down so its top clears the plate.
- Episode plates: coin radius 50 -> 70, plates 1.0x, spacing 186 px.
- Fixes from the snapshots: the race tags were hidden behind Nibbs (moved left of the finish post); his glass covered the finish and, on the title card, his own toque and the plates. On the race and title he now holds it up-right in the other paw.
- `lint` 0 errors (file-size warning), `check` passed: contrast 27/27, layout 0 issues.

## Known weaknesses
- In the dark corner the magnified wall inside the glass is a plain dark disc for about a second before the tickets slide under it.
- The bread slices stand upright around the burger, so the "sandwich" reads a little like a hot dog bun at small size.
- Episode plates are small (r 50) next to the big sign; they are icons, not readable labels.
- At 19.0 s, while Nibbs steps to the bell, the glass dips below the counter edge for a few frames.
- On the title card the magnifier is partly cut by the right frame edge.
- One lint warning remains: the file is large because the kit is inlined by design.
