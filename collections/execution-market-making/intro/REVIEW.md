# Intro review log

The intro is 19.8 s, 1920x1080, 30 fps, with the song muxed in (`song_20s.m4a`, about 129 BPM, -14.1 LUFS integrated). There is also a silent copy of each render.
Each round comes from snapshots I looked at (`tools/snap.sh` + `tools/sheet.sh`, 4 to 24 frames, plus full-resolution 2x2 stacks).

## Song cut

`lyrics.srt` was off by about 11 s (it puts the chorus at 3.6 s; the vocals start at 15.1 s). I transcribed `song_raw.mp4` with `hyperframes transcribe` (parakeet) for word times, beat-tracked it with librosa (129.2 BPM) and found the downbeat phase from low-band onset strength (beat index mod 4 = 0 is strongest in every section).
Structure of the raw song: 0-14.8 instrumental, 14.8-29.5 chorus, 29.5-36.8 verse ("Down at the station ... wagons ... slice ... quote both sides"), 36.8-50.9 chorus, then outro.
The verse is the story of this collection, so the cut is verse-first and ends on the sung title:

```
ffmpeg -i song_raw.mp4 -filter_complex "[0:a]atrim=11.19:14.81,asetpts=PTS-STARTPTS[a];[0:a]atrim=29.49:40.50,asetpts=PTS-STARTPTS[b];[0:a]atrim=47.86:53.0,asetpts=PTS-STARTPTS,afade=t=out:st=4.2:d=0.9[c];[a][b]acrossfade=d=0.03:c1=tri:c2=tri[ab];[ab][c]acrossfade=d=0.03:c1=tri:c2=tri,loudnorm=I=-14:TP=-1.5:LRA=11[o]" -map "[o]" -ar 48000 -c:a aac -b:a 192k song_20s.m4a
```

2 bars of the intro turnaround, then the 4-bar verse plus "Choo choo, keep the slippage low", then "Execution and Market Making, on deck!" with a 0.9 s fade. All three splices are on downbeats. The re-measured downbeats of the cut are in `src/10_setup.js` (`K.G.BARS`).

## Round 1 (first build)
- The first snapshot was blank (cream only). Cause: the sky halftone looped over an 8000 px box, about 300 000 dots per frame, and the page never finished a frame. `K.halftone` now clips its lattice to the visible screen box.
- No hills, no horizon glow: the parallax layers were offset by `cam * p`, so with the camera at y 600 a layer at p 0.45 put the horizon off screen. `K.applyCam` now anchors parallax at `K.REF` (960, 540), so backgrounds use world numbers. Rule added to STYLE.md.
- Train shot: train and mascot too small (wagons about 110 px, the mouse in the cab about 60 px). Train scale 1.0 -> 1.2, camera z 0.82 -> 0.98.
- Mesas (volume profile) were too far apart at parallax 0.55; only 3 showed at once and the U shape did not read. They are now at parallax 0.3 and 215 apart, so the whole U is visible for most of the shot.

## Round 2
- The crate split into 8 tall slabs (70 x 380) that looked like planks falling on the clock tower. It now splits into a 4 x 2 grid of blocks (`K.crate` gained `rows`), and the pieces turn into 1 250 crates in flight.
- The bridge shot (z 0.86) showed one tiny wagon and an empty half frame. Camera z 1.08, wagons leave 0.14 s earlier, so 3 wagons and the ripple are on screen at "price won't slide".
- The watch covered the mouth in the opening close-up. The left glove moved down to the chest.
- BID / ASK lettering touched the booth counter; moved 38 px down. The quote-set sun sat right behind the mouse's head as a halo; moved up and made smaller.

## Round 3
- Title roundel 3 (Almgren-Chriss) read as a clock (a line and a dot in a circle). It now has axes, a convex frontier and the chosen point in tomato.
- Hat tip: the IK arm cannot reach the cap (about 70 px reach), so the glove landed on the eye. It is now a wave beside the head while the cap lifts and tips.
- The bridge truss was hidden under the track ballast; the bridge is now drawn after the track. A poplar behind the mouse's head read as a feather on the cap; the poplar row moved 240 px.
- `lint`: 0 errors (1 warning: file size, by design, the kit is inlined). `check`: passed, contrast 22/22 WCAG AA.

## Second by second
| Time | Lyric | Picture |
| --- | --- | --- |
| 0.0-1.8 | (band) | close on Mr. Tick, the pocket watch opens; the giant "10 000" crate fills the right half |
| 1.83 | | he looks up, "!", ears flick; the camera pulls back to show the crate's size |
| 3.6 | "Down at the station where the clockwork turns" | tilt to the clock tower; the minute hand jumps on every beat, gears spin, stars pop; he checks his watch against it |
| 5.43 | "A big order splits into little wagons in turns" | wide yard; whistle; cut lines split the crate 4 x 2 on "splits", the 8 pieces hop onto 8 clockwork wagons a quarter beat apart; tag "8 x 1 250" |
| 7.24 | "Slice it with care so the price won't slide" | whip pan to the bridge; wagons leave a quarter beat apart, each makes a small ripple in the price pond; the flap board moves one tick, 100.00 -> 100.01; thumbs-up |
| 8.66-9.38 | | departure-board wipe |
| 9.08 | "Quote both sides and let the spread provide" | BID booth 99.98 and ASK booth 100.02 flip in as he points to each; coins from both windows land at his feet; "+0.04" |
| 10.4-11.2 | | steam wipe |
| 10.91 | "Choo choo, keep the slippage low" | the train with the 8 wagons crosses the volume-profile valley; whistle and big puffs on each "choo"; the slippage gauge pops, swings toward tomato and settles low on "low"; thumbs-up |
| 14.16-14.88 | | departure-board wipe |
| 14.58 | "Execution and Market Making, on deck!" | the enamel sign drops; the title flips in letter by letter; 4 episode roundels (TWAP, VWAP, Almgren-Chriss, market making) pop on half beats; whistle on "on deck!"; cap tip and wave on "all aboard"; fade |

## Known weaknesses
- The wide yard shot (5.4-7.2 s) shows the mouse at about 230 px; the slicing reads, but the mouse is small there.
- In the train shot the mascot is visible only through the cab window (head, shoulders, whistle).
- Ripples in the price pond are small by design ("won't slide"), so they read best in motion, not in stills.
- The CJK title uses the 900 weight subset (Noto Sans SC / TC) next to Jost 800 for Latin.
- One lint warning remains: the file is large, because it is built from the kit by design.
