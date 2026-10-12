# Intro review log

The intro is 31.0 s, 1920x1080, 30 fps: the whole short song (`song_short_raw.mp4`, trimmed only of its 2.6 s of trailing silence, 0.8 s fade, loudnorm to -13.9 LUFS, peak -2.9 dBFS, saved as `song_short.m4a`). There is also a silent copy of each render.
The marketmaker.cc logo sits on a cream sticker in the top-right corner for the whole film (48 px margin, 96 px tall, one hop on the first downbeat).
Each round comes from snapshots I looked at (`tools/snap.sh`, `tools/sheet.sh`, `tools/snap_lang.sh`), plus full-resolution frames.

## Song
- `lyrics_short.srt` is coarse, so the timing uses whisper word times (`npx hyperframes transcribe`) and a librosa beat track: 161.5 BPM, with the downbeats measured into `K.G.BARS`.
- Sung lines: 3.37 "Ride the calm", 4.85 "ride the storm", 6.34 "Every regime has its form", 9.29 "Measure the swell and read the sea", 12.24 "Volatility Modeling and Regimes". From 15.16 s to the end it is instrumental, and the film uses that stretch for three more topics before the title card on the ending (25.47 - 31.0).
- An earlier 20 s cut of the long song (`song_20s.m4a`) was replaced when the brief changed to the short song. Rounds 1 - 3 below were made on that cut; the scenes carried over and were retimed.

## Round 1 (first full build)
- The kit test frame showed that the clouds read as wire scallops. They are now stacked 60s print lozenges.
- The hero wave was a shapeless blob. It is now a wave that breaks left, with offset face bands, a tube shadow, a foam lip with fingers and whitewater.
- Siggy was small in the wide sea shots. Scale 1.1 -> 1.3, board 400 px.
- The board's "tiny gauge" lay flat on the deck and was about 25 px, too small to read. It now stands on a stalk at the nose, and the camera pushes in to 1.55x on "gauge" (3.39 s), when Siggy looks down and taps it.
- The calm sea was empty. Added a far island with palms on the horizon, and gulls.

## Round 2
- Chart: the second calm band still had storm-sized bars, because GARCH persistence (0.92) kept sigma high. Calm now forgets fast (beta 0.5, storm 0.7), so the bands and the sigma envelope agree.
- Distribution card: two baselines were drawn (the card axis and my own). It now uses the card's axis.
- Siggy in the chart corner was cut off and tiny. Scale 1.25, and he rises higher, pointing up-right.
- Title: the striped sun sat too low, and its stripes were hidden under the horizon. Raised by 70 px.
- `check` reported a transient overlap between title line 1 letters and line 2 while letters drop. The line gap is now 28 px. The title container is `data-layout-allow-overlap`, because the letters cross lines mid-flight by design.
- Explainer gallery (`style/gallery`): fixed corner loops on rounded cards (even point spacing now lives in `K.roundPts` / `K.rectPts`), the band edges of `K.bands`, formula sub/superscript stacking, and the menu board shape.

## Round 3 (languages, transitions)
- ru: "Моделирование волатильности" fits at about 108 px (the fit measures the real Lobster width, max 1700 px). zh-CN / zh-TW: one line in Noto Sans 900 at 140 px with the same teal stroke and shadow. All four title cards keep the medals clear of the text.
- Dial iris (9.15 - 9.38 s): the inside was empty cream, because the chart card popped only on the downbeat. The card now starts growing with the iris.
- Lint: 0 errors (1 warning: the file is large, because it is built from the kit by design). Check: passed, contrast 26/26 AA.

## Round 4 (short song, 31 s)
- Retimed every beat to the new grid. Sea set: surf in, shaka (1.93), gauge tap (2.67 - 3.04), "Ride the calm" (3.37), storm bank and "!" (4.11), "ride the storm" flip (4.85).
- New scenes for the instrumental: hidden states (12.24 - 18.09: calm and storm buoys, transition currents 0.03 / 0.10, self-loops 0.97 / 0.90, four state switches, and the sky, sea and beam follow the live state), the leverage effect (18.09 - 21.06: a -12 % drop and a +12 % rise give σ 2.9 against σ 1.0, GJR-GARCH), and a cluster ride (21.06 - 25.47: three big waves in a row, then calm returns on 23.99).
- HMM: the two cross currents crossed each other and Siggy covered the "0.03" ticket. The currents now arc above and below, and Siggy rides on the outer side of whichever buoy is live.
- Leverage: the sigma area fill bulged below the axis (a smoothed polygon). Area fills and their halftone are straight polygons now.
- Logo: the title moved down to start at y 168 so that line 1 never runs under the sticker; the medals moved to y 548.
- Check: passed, contrast 31/31 AA. One info remains: a title letter's descender briefly crosses line 2 while the letters drop (the title is `data-layout-allow-overlap`).

## Round 5 (lead review)
- 25 s was a blank orange sky (the tilt into the title took 1.5 beats up and 0.7 s back down). Both sky tilts now take 0.9 beat, rise only to y -200, and the next set starts 340 px above its rest and lands in 0.35 - 0.4 s, so the turtle and the title stay in frame through the cut.
- 7 s and 13 s were nearly empty: the chart only started painting on the downbeat, and the hidden-state buoys popped after a long camera descent. The chart now paints from inside the dial iris and finishes 0.9 s after the downbeat. The buoys pop 0.2 s into the scene.
- Regression from the sidekick work: the new seagull co-host was named `K.gull`, which overwrote the flying-gull silhouette of `30_world.js`, so lifeguard gulls stood in the sky. The co-host is now `K.gully`.

## Known weaknesses
- Siggy's head is a front view that only slides features for `turn`, so profile turns are suggested, not drawn.
- The second big set ("big waves follow big waves") stands up at the right edge for only about one second before the dial iris.
- The forecast beach uses a half-storm palette (storm 0.55), so its sky reads a little muddy compared with the pure sunset and storm sets.
- One lint warning remains: the file is large, because it is built from the kit by design.
