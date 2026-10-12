# Intro review log

The intro runs the full length of the short song: 29.6 s, 1920x1080, 30 fps, with `song_short.m4a` muxed. Each language also has a silent copy. The marketmaker.cc logo sits top-right for the whole intro.

`song_short.m4a` is cut from `song_raw.mp4` on downbeats of one grid (20 ms edge fades, fade-out from 28.4 s, loudnorm -14 LUFS, measured -13.7 LUFS / -2.0 dBTP):
raw 0 - 18.858 s (instrumental intro + full chorus) + raw 43.876 - 50.130 s (instrumental break) + raw 59.512 - 64.0 s (final "Marketmaker!" + ending).
The regenerated `song_short_raw.mp4` came out 61 s long again, so it is not used.

An earlier 64 s full-song cut (commit 36c987f) also had verse 1, chorus 2 and the final chorus (exchange panorama, regime colour shift, whip-pan close-ups, eight-arm order book, juggled candles, school of takers, the balance on Otto's head, surfing the price wave, spread formula, quote() code). Those scenes are in git history as recipes for episodes.
Each round comes from the 1 frame/s contact sheet (`tools/snap.sh` + `tools/sheet.sh`) plus full-resolution frames that I looked at.

## Timing
- Beat grid: librosa beat tracking drifted in places (ska off-beat skank), so the tempo comes from a grid search of the percussive onset envelope (best period 0.3909 s, 153.5 BPM). The sung phrase starts confirm it: "Marketmaker" at 15.64 / 40.72 / 59.52 s are exactly 16 and 12 bars apart, and "Buy low" starts at bar 4 (6.35 s; lyrics.srt says 6.4 s).
- Word timings: `npx hyperframes transcribe` (Parakeet) caught most lines but missed the first "Buy low, sell high" and the break; lyrics.srt windows filled the gaps. Every sung line starts on an even bar, so each line has its own 2-bar picture (see `src/10_setup.js`, `src/70_render.js`).
- The break (18.9 - 25.1 s in the short cut) shows the breadth of the channel: Alligator + fractals + AO, Lorenz attractor, manifold.

## Round 1 (first full build)
- 0 - 3.5 s were almost empty water. The camera now starts with the surface in frame, towers pop from bar 1, and a school of fish traders leads the eye down to the reef.
- A tall brain-coral tower sat right behind Otto's left quote card in every reef shot. Mid-layer towers moved out of the centre (x 160 -> -140, -420 -> -520).
- Order book shot: the arm tips wrapped over the card digits. Cards are now held by their inner edge (dx +/-70), arms reach to +/-450.
- Alligator shot: the pointing arm stretched diagonally across the chart. Otto now points from the board's right edge at the height of the newest candle; the candles draw within 1 bar, so the board is never half empty for long.
- Surf shot: Otto was too small (s 0.52 -> 0.66) and the clam surfboard grew with him.

## Round 2
- Lorenz attractor was seen edge-on (thin sliver). Yaw now starts at -0.25 rad with pitch 0.15 and scale 1.3, so the butterfly reads at once.
- Title: the eight-card fan crowded Otto's face and the bottom edge. The fan is wider and flatter (r 600, ry 300) and Otto sits lower.

## Round 3 (languages)
- ru / zh-CN / zh-TW subtitles fit the pill (Cyrillic at 1120 px fit; CJK at 66 px from the Noto subsets). "Marketmaker" stays the brand title in all languages.
- Title: an orbiting fish ring crossed Otto's face and the front-layer bubbles drew over the subtitle. The ring is gone (traffic swims behind instead) and the title shot has no front bubbles.
- `lint`: 0 errors (1 warning: the file is large because the kit is inlined by design). `check`: passed, 11/11 contrast checks.

## Round 4 (short song + logo)
- Retimed to the 29.6 s cut: bars 0 - 12 unchanged, the break scenes moved to bars 12 - 16, the title card to bar 16 ("Marketmaker!"), wink on the last note (bar 18).
- Logo: a cream pill with a navy outline (mark + "marketmaker.cc", 92 px tall, 48 px margin), one hop on the first downbeat. The raised ask card in "Buy low, sell high" and its up-arrow went under the logo; they now stop at local y -440. The title plate moved down (cy 292 -> 345) and narrowed (1480 -> 1300) to clear the logo corner.
- `lint` 0 errors, `check` passed (48/48 contrast).

## Known weaknesses
- The first 2 s are water + a fish school before the reef appears: intentional build-up, but the least dense part of the film.
- When Otto reaches across his body (order book, juggling) an arm can pass in front of his face for a few frames.
- The Alligator board gets 1.5 bars, so the AO histogram is readable for under a second.
