# Intro review log

The intro is 20.5 s, 1920x1080, 30 fps, with the song muxed in (`song_20s.m4a`, about 113 BPM, -14 LUFS). There is also a silent copy of each render.
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

## Known weaknesses
- The wide pull-back (3-5 s) still leaves Beepo small in a big room. This is intentional, to reveal the floor.
- The loop scene (10.7-14.5 s) has quiet sides. It holds one diagram on purpose, but a slow camera drift would help.
- Ticket text in the pipeline shot is about 24 px; it is context, not information.
- One lint warning remains: the file is large, because it is built from the kit by design.
