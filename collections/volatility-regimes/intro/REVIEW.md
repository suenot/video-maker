# Intro review log

The intro is 20.1 s, 1920x1080, 30 fps, with the song muxed in (`song_20s.m4a`, 161.5 BPM, about -14 LUFS). There is also a silent copy of each render.
Each round comes from snapshots I looked at (`tools/snap.sh`, `tools/sheet.sh`, `tools/snap_lang.sh`), plus full-resolution frames.

## Song cut
- `lyrics.srt` is coarse and partly wrong in timing, so the cut uses whisper word times (`npx hyperframes transcribe`) and a librosa beat track (161.5 BPM, downbeats every 4 beats from 0.81 s in the raw song).
- The chorus runs from raw 6.87 s ("Ride the calm") to 18.5 s (end of "...and Regimes!"), and the next verse begins at 18.64 s. The cut is raw 0.45 - 18.50 (4 instrumental bars and the whole chorus), spliced in phase into raw 2.02 - 4.03 (instrumental), with a 30 ms crossfade, a 0.85 s fade out and loudnorm I = -14. It measures -13.9 LUFS, peak -2.4 dBFS.
- The sung title line lands at 15.39 s, so the title card (15.39 - 20.1) shows while the song sings the title.

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

## Known weaknesses
- Siggy's head is a front view that only slides features for `turn`, so profile turns are suggested, not drawn.
- The second big set ("big waves follow big waves") stands up at the right edge for only about one second before the dial iris.
- The forecast beach uses a half-storm palette (storm 0.55), so its sky reads a little muddy compared with the pure sunset and storm sets.
- One lint warning remains: the file is large, because it is built from the kit by design.
