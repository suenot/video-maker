# Intro review log

The intro runs the full song: 64.0 s, 1920x1080, 30 fps, with `song_full.m4a` muxed (song_raw.mp4 0 - 64.0 s, fade-out from 62.8 s, loudnorm to -14 LUFS). Each language also has a silent copy.
Each round comes from the 1 frame/s contact sheet (`tools/snap.sh` + `tools/sheet.sh`) plus full-resolution frames that I looked at.

## Timing
- Beat grid: librosa beat tracking drifted in places (ska off-beat skank), so the tempo comes from a grid search of the percussive onset envelope (best period 0.3909 s, 153.5 BPM). The sung phrase starts confirm it: "Marketmaker" at 15.64 / 40.72 / 59.52 s are exactly 16 and 12 bars apart, and "Buy low" starts at bar 4 (6.35 s; lyrics.srt says 6.4 s).
- Word timings: `npx hyperframes transcribe` (Parakeet) caught most lines but missed the first "Buy low, sell high" and the break; lyrics.srt windows filled the gaps. Every sung line starts on an even bar, so each line has its own 2-bar picture (see `src/10_setup.js`, `src/70_render.js`).
- The 43.9 - 50.1 s stretch is an instrumental break: it shows the breadth of the channel (Alligator + fractals + AO, Lorenz attractor, manifold).

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

## Known weaknesses
- The first 2 s are water + a fish school before the reef appears: intentional build-up, but the least dense part of the film.
- When Otto reaches across his body (order book, juggling) an arm can pass in front of his face for a few frames.
- The formula and code boards type out over 1.5 bars, so their first half second shows only a few characters.
- Fish card-takes are on beats, but with 8 takes in 2 bars (SC11) they read as a flurry rather than individual trades.
