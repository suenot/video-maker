# Intro review log

## Full-song version (57.3 s, current)
The user asked for the intro to run the whole generated song. `song_full.m4a` = `song_raw.mp4` 1.95 - 59.2 s (leading silence trimmed, the song stops at 59.0), 0.5 s fade, loudnorm I = -14.6 target, measured -14.0 LUFS.
Word times from whisper on the whole file and on 14-16 s segments: chorus 1 "Fit it right" 19.2 (raw), verse "An owl in a lab" 30.2, "Grows" 32.5, "Train it" 35.4, "No peeking" 37.9, chorus 2 "right" 41.6, "Trees" 45.2, outro after about 50 s. The 133 BPM grid fitted earlier holds over the whole song (32 downbeats).
The 20 s material is reused, shifted 6 bars later; the new beats are the dark lab with lamps, a train-accuracy gauge, two swing dances, the bloom bow, station D (nursery pot fed with feature pellets, the walk-forward plate with a brass shutter and a feather duster), the second-chorus prune / ticks / growth, and the marquee on the final chorus.

### Round F1 (first full build, 57 frames at 1 fps)
- Station D sat too close to the garden: the net-vine pot showed in the nursery shots and the nursery pot showed in the title wide. D moved +550 px; bench and wall extended.
- The gauge readout was 23 px. The readout now has a minimum of 26 px and a wider box.
### Round F2
- The walk-forward windows were so wide that the shutter covered only a thin strip of the future. Train 0.36 -> 0.28, test 0.12 -> 0.10, steps 0.13 -> 0.11, at most 3 steps: the shutter now covers the last third.
- Dust specks looked like data points. They are now pale sepia blobs that vanish under the duster.
### Round F3 (gates)
- `lint` 0 errors (1 size warning by design); `check` passed, contrast 18/18 AA, 2 layout infos (title letters mid-drop).
- Known weaknesses: 0 - 3.6 s is a slow, dark opening (by design, the lamps come on with the band); the cover-eyes pose shows the gloves beside the eyes rather than over them; the net-vine tendrils stay thin in the wide shot.

## 20 s version (superseded)

The intro is 19.9 s, 1920x1080, 30 fps, with the song muxed in (`song_20s.m4a` = `song_raw.mp4` 12.78 - 32.63 s, one take, 133 BPM, about -14 LUFS). There is also a silent copy of each render.
Each round comes from snapshots I looked at (`tools/snap.sh`, 12 to 24 frames, plus full-resolution frames).

## Song cut
- `lyrics.srt` windows were coarse and misplaced (they put the chorus at 3.8 s; the first 19 s are instrumental). I located the lines with whisper on 16 s segments: "Fit it right" 19.2, "Validate" 23.2, "Trees and nets" 25.2, "Modern ML for Trading" 27.0, "An owl in a lab" 30.2 (raw time).
- librosa beat tracking jumped between 89 and 136 BPM (swung eighths). A grid fit over 5.5 - 48 s gives 133.0 BPM; the downbeat phase is confirmed by the big hit at 20.02 ("RIGHT") and "show" at 29.04, both on the grid.
- Cut: 12.78 - 32.63 s as one slice (3 bars instrumental + chorus + the "owl in a lab" line), 0.8 s fade out, loudnorm I = -14, TP = -1.5. Measured I = -14.3 LUFS.

## Round 1 (first build)
- The owl was too small and read as a cat: round head, pointed ears. Head is now wider than tall (256 x 208), the facial disc is a heart with a feathered V between the eyes, and the tufts are two-pronged feathers. Scale 1.0 -> 1.22 in the lab, 1.06 on the title set.
- The title-set sunburst was drawn in screen space over the owl and the bench and washed the frame with grey wedges. Removed; the spotlight glow went 0.75 -> 0.5.
- Station B flasks and ticks were still in frame on the title set. Station C moved 3400 -> 4050, and the bench and wall extend to 5600.
- The tree leaves overlapped (0.9 on 0.1) and the canopy touched the marquee. Branch spread ratio is now a parameter (`ratio` 2.1), levelH 92 -> 86, leaf numbers 30 -> 36 px.
- The foreground ferns covered the episode medals. Ferns now stay on stations A and B only.
- The raised seed hid behind the marquee bulbs. The seed is held at chest height (r 24 -> 32).

## Round 2
- The snip arm jumped back to rest in one frame after the cut. The shears now ease in (0.3 s) and out (0.4 s) of the vine.
- Rubber-hose arms clamped at full reach, so the shears never reached the vine. Arms now stretch past full reach and the hose thins.
- Station B: only one or two ticks were seen before the camera left. Flasks now pop on sixteenths while we arrive (10.49 s) and the ticks land on eighths from 11.07 s, all five before the leap at 12.20 s. The magnifier gag runs until the ticks start.

## Round 3 (language variants, gates)
- ru "Современный ML / для трейдинга", zh-CN and zh-TW single line: all fit the marquee glass with margin. CJK title 104 -> 122 px.
- `lint`: 0 errors, 1 warning (`composition_file_too_large`, by design: the kit is inlined). `check` passed: runtime 0, layout 1 info (title letters overlap mid-drop, marked `data-layout-allow-overlap`), contrast 18/18 AA.

## Known weaknesses
- The net-vine tendrils are thin at the title zoom; they read as a texture rather than a diagram.
- During the 10 s truck the left half of the frame is wall only for about half a second.
- The owl's coat hides the legs, so walking reads mostly through the bob and the feet.
- The watering-can arm stretches far (rubber hose by design), which some viewers may read as odd.
