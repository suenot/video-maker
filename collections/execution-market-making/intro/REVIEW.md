# Intro review log

**Current version: short song, 27.1 s** (brief UPDATE 3), 1920x1080, 30 fps, `song_short.m4a` (-13.9 LUFS), marketmaker.cc logo top-right for the whole intro (UPDATE 2). There is also a silent copy of each render.
History below: the first 20 s cut, then a 60 s full-song version (stopped mid-render when the brief changed). The short version reuses scenes from both.

## Short song cut
No `song_short_raw.mp4` existed, so I trimmed `song_raw.mp4` myself on measured downbeats (the 2-bar intro turnaround, then the verse and the whole second chorus, which ends on the sung title and runs into "All aboard the market train"):

```
ffmpeg -i song_raw.mp4 -filter_complex "[0:a]atrim=11.19:14.81,asetpts=PTS-STARTPTS[a];[0:a]atrim=29.49:53.0,asetpts=PTS-STARTPTS,afade=t=out:st=22.3:d=1.2[b];[a][b]acrossfade=d=0.03:c1=tri:c2=tri,loudnorm=I=-14:TP=-1.5:LRA=11[o]" -map "[o]" -vn -ar 48000 -c:a aac -b:a 192k song_short.m4a
```

Downbeats re-measured on the cut (`K.G.BARS`, 15 bars), word times from `hyperframes transcribe` on the cut; both in `src/10_setup.js`.

## Short version: second by second
| Time | Lyric | Picture |
| --- | --- | --- |
| 0.0 | (band) | close on Mr. Tick, pocket watch opens; giant "10 000" crate; logo bounces once |
| 1.83 | | he looks up, "!", the camera pulls back to show the crate's size |
| 3.6 | "Down at the station where the clockwork turns" | the tower clock ticks on every beat, gears spin, he checks his watch |
| 5.4 | "A big order splits into little wagons" | wide yard; the crate splits 4 x 2 on "splits", 8 pieces hop onto 8 wagons, "8 x 1 250" |
| 7.2 | "Slice it with care so the price won't slide" | whip pan to the bridge; wagons leave a quarter beat apart, tiny ripples, price flap 100.00 -> 100.01 only, thumbs-up |
| 9.1 | "Quote both sides and let the spread provide" | split-flap wipe to the BID / ASK booths; coins land, "+0.04" |
| 10.9 | "Choo choo, keep the slippage low" | steam wipe to the train crossing the volume-profile valley; whistle puffs on each "choo"; the slippage gauge swings and settles low on "low"; thumbs-up |
| 14.6 | "Buy the bid and sell the ask just so" | tunnel to the order book (a departure board): his quote tab slides into the best bid on "bid", the best ask on "ask"; on "just so" both fill, coins, "+0.04" |
| 18.3 | "Mind your inventory, keep it all in check" | steam wipe to the freight balance: 3 crates land, the beam tips, flap +1 +2 +3; he flings two to the cash pan (coins), level on "check", stars |
| 21.9 | "Execution and Market Making, on deck!" | split-flap wipe to the title: the enamel sign drops, letters flip in, 4 episode roundels; whistle on "on deck" |
| 25.0 | "All aboard the market train" | the train pulls in, he waves the flag, the line signal turns teal, cap tip as the song fades (25.9-27.1) |

## Short version: rounds
- Round 1 (27-frame sheet, 1 per second): every second shows a different beat or action; no empty frames. The title sign (1480 wide) reached under the logo plate; the sign is now 1160 wide at x 840 and the title fit width is 1030 px. The slippage gauge in the train shot rose into the logo corner; moved down 60 px. The arriving train first appeared only 0.3 s before the end; it now enters from x -950 so it is visible from "All aboard".
- Round 2 (full-resolution stack of 0.5 s and 23.5 s): the logo plate (cream, charcoal key line and offset shadow, 100 px tall) reads on the cream sky and on the teal sign side; text 38 px Jost 700. Contrast 27/27 AA in `check`.
- Round 3 (renders): 27.1 s each, -13.9 LUFS; title frames checked in en, ru ("ИСПОЛНЕНИЕ И / МАРКЕТМЕЙКИНГ" fits the narrower sign), zh-CN and zh-TW; the logo never overlaps the sign, gauge or boards. Contact sheet from the en render at 1 frame/s: no empty or static frames. `lint` 0 errors (1 warning: file size, the kit is inlined), `check` passed.

## Known weaknesses (short version)
- In the train shot Mr. Tick is visible only through the cab window.
- The order-book quote tabs and the balance flap are small next to the mouse; they read in motion.
- The cab (inside the locomotive) and the series departure board from the 60 s version are not in the short cut; they are kept in `intro/extra/` for episodes.
- The CJK title uses the 900 weight (Noto Sans SC / TC) next to Jost 800.

## Full song (60 s, superseded): grid and words
- `ffmpeg -i song_raw.mp4 -t 60.3 -vn -af "afade=t=out:st=59.3:d=1.0,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k song_full.m4a`
- 33 measured downbeats from 0.33 s (129.2 BPM, low-band onset phase), word times from `hyperframes transcribe` (parakeet); both are in `src/10_setup.js`.
- Structure: 0-14.8 instrumental (8 bars), 14.8 chorus 1, 29.5 verse, 36.8 chorus 2, 50.9 outro ("All aboard the market train / Market making on the line / Yeah, we got it cleared / And on the deck!").

## Full song: second by second
| Time | Lyric | Picture |
| --- | --- | --- |
| 0.0 | (band) | dawn over the yard, the sun comes up, Mr. Tick walks onto the platform |
| 3.9 | | push in to his pocket watch; the giant "10 000" crate behind |
| 7.5 | | he looks up, "!", ears flick; pull back to show the crate's size |
| 9.4 | | the timetable board flips in row by row: 8 departures of 1 250; he points, the highlighted row ticks on each beat |
| 14.0 | | whistle up, cheeks fill |
| 14.8 | "Choo choo, keep the slippage low" | steam wipe into the locomotive cab: he pulls the whistle cord on both "choo"s (steam past the porthole, the cab shakes), taps the slippage gauge until it settles low on "low", thumbs-up |
| 18.5 | "Buy the bid and sell the ask just so" | board wipe to the order book (a departure board): his mouse-badge quote tab slides into the best bid on "bid", the best ask on "ask"; on "just so" both rows fill, coins fly, "+0.04" |
| 22.2 | "Mind your inventory, keep it all in check" | tunnel to a freight balance: 3 crates land in the left pan, the beam tips, inventory flap +1 +2 +3; he flings two crates to the cash pan (they become coins), the beam comes level on "check", stars, thumbs-up |
| 25.8 | "Execution and Market Making, on deck!" | board wipe to the hall's departure board: TWAP · VWAP, POV, ALMGREN-CHRISS, BID / ASK flip in on the words with their icons and platform numbers; whistle on "on deck" |
| 29.5 | "Down at the station where the clockwork turns" | tunnel back to the yard: the tower clock ticks on every beat |
| 31.3 | "A big order splits into little wagons" | the crate splits 4 x 2, 8 pieces hop onto 8 wagons, "8 x 1 250" |
| 33.2 | "Slice it with care so the price won't slide" | whip pan to the bridge: wagons leave a quarter beat apart, tiny ripples, the price flap moves 100.00 -> 100.01 only |
| 35.0 | "Quote both sides and let the spread provide" | board wipe to the BID / ASK booths, coins, "+0.04" |
| 36.8 | "Choo choo, keep the slippage low" | steam wipe to the train crossing the volume-profile valley; slippage gauge settles low |
| 40.5 | "Buy the bid and sell the ask just so" | tunnel to the afternoon order book (prices moved up), same quoting, running total "+0.08" |
| 44.2 | "Mind your inventory, keep it all in check" | steam wipe to the balance again, level on "check" |
| 47.9 | "Execution and Market Making, on deck!" | board wipe to the title: the enamel sign drops, letters flip in; whistle on "on deck" |
| 50.9 | "All aboard the market train" | the train pulls into the station, he waves the flag |
| 52.9 | "Market making on the line" | four episode roundels pop on half beats |
| 55.6 | "Yeah, we got it cleared" | the line signal turns from tomato to teal, stars, thumbs-up |
| 58.3 | "And on the deck!" | last whistle, cap tip and wave; the song fades out |

## Full song: round 1
- Structure check on a 40-frame sheet (every 1.5 s): every sung line has its own set or event, nothing static for more than about 3 s.
- Balance scene was too small (the mouse on the pivot about 300 px, crates about 100 px) with empty sky: camera z 1.0 -> 1.1-1.16.
- The inventory flap sat over a cloud and, in the first layout, over the mouse's ears; moved to the upper left, clouds moved.
- Chorus 2 order book was a copy of chorus 1: it is now the afternoon book (prices about 0.10 higher) and the tag is the running total, +0.08.
- The mouse is bigger in the yard (scale 1.2 -> 1.45): about 360 px in the dawn wide shot and about 320 px in the wide split shot.

## Song cut (20 s version, superseded)

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

## Known weaknesses (20 s)
- The wide yard shot (5.4-7.2 s) shows the mouse at about 230 px; the slicing reads, but the mouse is small there.
- In the train shot the mascot is visible only through the cab window (head, shoulders, whistle).
- Ripples in the price pond are small by design ("won't slide"), so they read best in motion, not in stills.
- The CJK title uses the 900 weight subset (Noto Sans SC / TC) next to Jost 800 for Latin.
- One lint warning remains: the file is large, because it is built from the kit by design.
