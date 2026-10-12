# Intro review log

**Current version: the short song (user decision, UPDATE 3).** The intro runs the full length of a 24.3 s song, 1920x1080, 30 fps. The audio is `song_short.m4a`: the instrumental intro (raw 0.10-5.84) plus the second chorus with the song's own ending (raw 40.08-58.6), with a 30 ms crossfade on the downbeat, a 1 s fade and loudnorm (-13.5 LUFS). Every render also has a silent copy.
The marketmaker.cc logo (UPDATE 2) sits top-right for the whole intro.
The 58.5 s full-song build (verse and chorus-2 scenes) was made and then dropped by the same user decision. Its scenes live in `intro/extra/` for episodes.
The 20 s rounds below are kept as history; the full-song rounds follow them.
Each round comes from snapshots I looked at (`tools/snap.sh`, 9 to 20 frames, plus full-resolution frames and crops).

## Song cut
- `lyrics.srt` is coarse and its newest line runs about one window early. Whisper could not hear the vocoder chorus, but it did hear the verse ("floor" 23.9 s, "every take" 27.7 s), which fixed the 2-bar line grid.
- Chroma cross-similarity puts the second chorus 34.25 s after the first (5.83 -> 40.08, similarity 0.97). The second chorus runs into the song's natural ending, so the cut is one intro bar (raw 3.58-5.83) plus 40.08-58.3 with a 30 ms crossfade, a 0.8 s fade out and loudnorm. Integrated loudness is -14.0 LUFS.
- Measured downbeats in the cut: `BARS = [0.08, 2.24, 4.34, 6.46, 8.59, 10.70, 12.84, 14.95, 17.09, 19.21]`.

## Round 1 (first build)
- Wide shots (z 0.84): the robots were small under a large empty wall. Wide zoom is now 0.95 and the camera sits lower; the S3 truck is at z 0.9.
- The pneumatic tube crossed both scoreboards. The boards moved left (x 2600) and the tube right (x 3200).
- Beepo was cut by the left edge in the ticket shot and overlapped the analyst's lens. Beepo lands at x 1600; the team moved right.
- The floor-cable risers ran behind Beepo's close-up and read as bars. They now start under the left end of the wall chart.
- The hop at 2.5 s cut Beepo's head. A camera key follows the hop up (z 1.5) before the pull-back.
- Sleeping team bots had "x" eyes, which read as broken or dead. They now have closed eyes until the signal wakes them.
- Tickets were too small to read (0.8). They are now 1.0.

## Round 2 (kit fixes from the gallery)
- Rounded rectangles grew spikes at their corners: Catmull-Rom handles overshot next to short corner segments. Handles are now capped at 1/3 of a segment (`K.segs`), which also fixed the hologram and window frames.
- Seven-segment digits had broken slants ("0" looked like "[]", "1" was offset). They are rebuilt from hexagonal segments, and the ghost segments are fainter.
- The pixel icons read as LED dots, and the "brain" read as a blob. The cell gap is smaller. The eye, bolt, team, globe and harness icons were redrawn, and "decide" uses a fork icon.
- Loop ring: it was small and sat high, leaving the bottom empty. R 290 -> 350, pods 92 -> 108, centre lower.
- The CRT power-off band went white for too long. The flash now appears only when the image is nearly a line.

## Round 3 (check, languages, 1 fps sheet)
- `check`: the title spans were "occluded" by the scanline and vignette overlays. The title DOM now sits above the overlays.
- `check` contrast: the last "g" of "Trading" was at 2.4:1, because its descender touched the inner neon tube and the glow was too tight and bright. The sign is now 360 tall, the text sits 12 px higher, and the glow is a 2 px neon stroke plus a soft halo. Contrast passes 18/18, layout has 0 issues, lint has 0 errors.
- ru / zh-CN / zh-TW titles were checked at 19.5 s. All fit inside the sign, and the CJK subsets render (Chinese is set on two lines: "交易中的 | AI 智能体").
- 1 fps contact sheet (`snapshots/contact-sheet.jpg`): no empty frames, and every sung line has its own picture.

## Full song: timing
- The beat grid was measured over the whole song with librosa. Kick energy marks the downbeats, and each bar is measured, because the verse drifts: its bars run about 2.17 s, against 2.11 s in the chorus. Around 32-33 s the tracker skipped, and that bar is taken as measured (33.48).
- Whisper hears the verse words but not the vocoder chorus. Verse lines start on bars 10, 12, 14 and 16 ("floor" at 23.8 s, "every" at 27.6 s, "memory" at 36.1 s). The chorus lines are two bars each, and chroma similarity places them (the two choruses are 16 bars apart).
- Story beats: intro and boot with a hello wave; chorus 1 (signals, ticket line, face loop, first neon sign while the team hops in); verse as one continuous take (neon signs ignite, the analyst reads the tape and the order book, the trader plans while risk checks and crosses out TSLA, Beepo's tools and memory and the bet); chorus 2 (agent network, end of day at the 16:00 bell, the loop ring on the floor); final title card with the tag, medallions and confetti. Cuts are a face dive, CRT off/on, and a CRT signal tear (`glitch`).

## Full song: round 1
- Verse walk: the four bots were 260 px apart and overlapped mid-hop. The spacing is now 380 px.
- Verse stations at z 1.1 left large empty walls, with the tape and order book small at the top. The stations are now at z 1.3, and the tape, order book, plan board and terminal moved down next to the bots.
- Beepo's terminal overlapped his head, and the tube clipped the terminal. The terminal moved up (y 400) and left, and the tube is at x 7650.
- Ring: the risk bot at the ring centre hid the analyst on the back pad. It now stands in front of the ring, between the front pads.

## Full song: round 2 (fixes the known weaknesses of the 20 s cut)
- Beepo was small in the wide pull-back. The pull-back now ends at z 1.12 instead of 0.95, and the wall chart sits lower.
- The loop scene had quiet sides. The left side now has an `agent.log` terminal that types one call per step (observe / decide / act), and the right side a PnL board that ticks on "act".
- The boot was static for 5.7 s. Beepo now waves hello on the vocoder intro bar, with a camera push-in.

## Full song: round 3
- The analyst's magnifier covered its own face while reading the tape. The lens is now raised up and to the left.
- The ring's step icons were too small to read. Their scale is now 1.15 (1.5 when lit).
- `check`: lint has 0 errors, runtime 0, layout 0 issues, motion 0, and contrast 18/18. The 1 fps sheet (`snapshots/contact-sheet.jpg`, 58 frames) shows a new picture every 2-4 s, and no empty frames except the two short CRT power-off blacks (18.1-18.5 s and 52.3-52.7 s).

## Short song (24.3 s) + logo
- Grid: `BARS = [1.21, 3.48, 5.74, 7.83, 9.96, 12.07, 14.21, 16.32, 18.46, 20.57, 22.68]`, measured on `song_short.m4a`. The chorus lines land on bars 2 / 4 / 6 / 8, and the tag on bar 9, so the chorus-1 story maps one to one. The title card is on "AI Agents for Trading, here they come!" (18.46), and the medallions and confetti come on the tag (20.57).
- Logo: the marketmaker.cc mark (inlined from `style/kit/logo.svg` by `build.py`) plus the "marketmaker.cc" wordmark on a navy plate with a cyan rim, 96 px tall, 48 px margin, top-right, above every overlay. It bounces once on the first downbeat.
- The neon sign overlapped the logo. The sign is now 1180 wide and centred at x 880, with the title DOM and medallions shifted with it. The clock and PnL boards on the floor moved down 40 px, so the logo never covers them in a held shot.
- 1 fps sheet (24 frames): there are no empty frames except the CRT power-off line at 18.0-18.5 s. `check` passes, with contrast 23/23 including the logo wordmark.

## Known weaknesses
- The wide pull-back (7-9 s) still shows Beepo at about 280 px tall; the floor reveal needs the width.
- The title sign sits left of centre (to clear the logo), while Beepo stands at the centre.
- Loudness is -13.5 LUFS, single-pass loudnorm on a short clip.
- Ticket text in the pipeline shot is about 24 px; it is context, not information.
- One lint warning remains: the file is large, because it is built from the kit by design.
