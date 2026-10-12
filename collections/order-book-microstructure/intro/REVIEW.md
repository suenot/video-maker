# Intro review log

The intro runs the full song: 71.3 s, 1920x1080, 30 fps, with `song_full.m4a` muxed in (152 BPM, -14.1 LUFS, true peak -1.5 dBTP). There is also a silent copy of each render.
Rounds 0-3 built the first 20 s cut; round 4 onward extends it to the whole song (user decision 2026-10-12, see INTRO_BRIEF.md).
Each round comes from snapshots I looked at (`tools/snap.sh`, 9 to 20 frames, `tools/snap_lang.sh` for the other languages).

## Song (20 s cut, superseded by the full song below)
- `song_raw.mp4` is 74 s. Parakeet word timings put the chorus at raw 7.20 ("Hey!") to about 19.5 ("...microstructure!"), and the verse starts at 19.96 ("Bids on the left").
- librosa tracks 152 BPM. Its beats sit on the off-beat brass (sub-bass onsets are stronger half a beat later), but the sung accents "Hey" 7.20, "Order" 16.72 and "Bids" 19.96 all fall on tracked beats with index 0 mod 4, so those are the downbeats.
- Cut: raw 0.74 - 19.95 (4 instrumental bars + the 8-bar chorus, one continuous take), then raw bar 5.57 - 7.17 as an instrumental tail with a 30 ms crossfade and a 0.8 s fade out, loudnorm (target -15 gives a measured -14.0 LUFS).
- Downbeats in the cut: `0.00, 1.63, 3.23, 4.83, 6.43, 8.01, 9.62, 11.22, 12.82, 14.40, 16.00, 17.60, 19.18`.

## Round 0 (kit gallery)
- Stall arches were full semicircles 400 px tall and spilled over the levels above. `archPts` is now a flattened arch (ry <= 0.4 h).
- City dome finials were long slanted spikes. Domes are now a half-ellipse with a short pole and a ball.
- The ringed tail read as a black blob. The rings are now short bands across a grey tail.

## Round 1 (first intro build)
- The kilim banner was eased twice (inside `kilimBanner` and in the caller) and covered 80 % of the title card. The primitive is now linear and callers ease.
- Title spaces collapsed ("OrderBook&"): the space spans are now no-break spaces.
- The "!" and imbalance bursts covered the ask plaques. They now sit to the upper left of Tikki with the tail pointing at the head.
- The clap brought the paws up over the face. The paws now meet at chest height.
- The cart was 70 px on screen. Scale 0.42 -> 0.6, with bigger stolen crates and longer speed lines.
- The flow arrow was below the frame in the wide shot. The camera key moved down 90 and the arrow up 30.
- Tikki was small in the medium shots. Scale 1.0 -> 1.2 (about 330 px tall on screen).

## Round 2
- Title set: the medallions sat on top of the tower and the bottom right was empty. The bazaar behind the banner is now a faded print (50 % paper wash), the tower moved right, and the five medallions hang from the banner roll on strings at y 660, r 62.
- Tikki entered the frame only at 4.1 s. The swing starts closer (theta0 -1.0 -> -0.82), so the raccoon is on screen from about 3.6 s.

## Round 3
- 1.5 s: closed stalls were dark blobs. They now have roll-up wooden shutters that lift as the awnings drop, on eighth notes.
- 15.5 s: while the curtain was down the frame was empty paper. The kilim pattern was pinned to the top edge (the cloth winds into the roll), and `field: 400` keeps a plain title area with diamond motifs below it, so the full curtain is patterned and the rolled-up banner is plain.
- ru: "Стакан и" crowded the top triangle band. Title size cap 116 -> 106 and the block now centres between the band and the roll. ru, zh-CN and zh-TW all fit with margin.

## Full song (round 4)
- `song_full.m4a` = raw 0.70 - 72.0 (0.71 s of leading silence trimmed, the song ends at 71.42), 0.7 s fade out, loudnorm. Film time = raw - 0.70.
- Sections from parakeet (0 - 44 s) and whisper small.en (43 - 73 s; whisper runs about 0.45 s late, corrected): intro 4 bars, chorus 1 (6.47), verse (19.25), chorus 2 (32.04), an 8-bar instrumental break (44.83), final chorus (57.63, "Order Book" at 67.22).
- 44 measured downbeats (`K.G.BARS`), bar 1.58 - 1.63 s, no drift over the song.

## Round 4 (full song)
- The 20 s title moved to the ending. On chorus 1 the banner now only teases: it drops to banner height over the world, the title is stamped on "Order Book", and it rolls back up on the verse downbeat.
- New pictures for every line: depth hills (bids left, asks up high), two ask levels drop from the sky with a flag, price-time arrival numbers plus a newcomer, a sell cart that fills our crate and pays Tikki a coin; chorus 2 at dusk (lantern rope pulled tight, second flow wave, tick chart scroll, plaque ripple + coin fountain); the break at night (dance, OFI tile board, candle scroll, CCXT code scroll); the final chorus at dawn.
- Tikki's acting was split into reusable gestures (inhale, shout, clap, pinch, point, hop over a cart, dance, point at a world point) so each chorus repeats the language without repeating the shot.

## Round 5
- Dusk was a flat brown wash over the sky. It is now a night palette for sky, city and ground (mixed by `duskAt`), with stars and a cream moon rosette; the lantern-lit tower keeps its day colours.
- Price-time number tags overlapped at 28 px; now 22 px.
- The code scroll text was 24 px on screen; now 30 world px on a 1000 px scroll with the camera at 0.98.
- The OFI board, tick chart and code finished writing after their windows closed. Writing now ends a beat before each board leaves.
- 1 fps contact sheet (71 frames) checked: no empty frames, a new picture every 2 - 4 s.

## Story (full song)
- 0 - 6.5 intro: curtain rolls up, shutters open on eighth notes, Tikki swings in on a rope (3.3), lands on the balcony on the downbeat (4.9), fez tip, abacus, a big breath.
- 6.5 - 19.2 chorus 1: "Hey!" shout, clap slams the book (0.05 -> 0.01), crates flow in, a buy cart takes 2 crates, "+0.43" imbalance shout, plaques tick, our crate #4 -> #1, title tease banner.
- 19.2 - 32 verse: depth hills, levels drop from the sky, price-time queue 1..7, a sell cart fills our crate, coin to Tikki.
- 32 - 44.8 chorus 2 (dusk): shout, rope pulled tight, second flow wave and taller hills, tick chart, coin fountain.
- 44.8 - 57.6 break (night): dance, OFI = Δbid − Δask with (5 − 2) / (5 + 2) = +0.43, candles, CCXT `watch_order_book` code.
- 57.6 - 71.3 final chorus (dawn): shout, clap, pinch, flow, ticks; 66.4 curtain drops, 67.2 title stamped, 68.8 medallions, 69.6 jump, 70.4 fez tip.

## Story (first 20 s cut, kept for reference)
- 0 - 1.6 kilim curtain rolls up on the bazaar tower; 1.6 - 3.4 shutters roll up and awnings drop on eighth notes, top to bottom.
- 3.2 - 4.8 Tikki swings in on a rope and lands on the balcony at the alley on the downbeat; fez tip, abacus flicks, a big breath.
- 6.43 "Hey!": shout with a "!" burst and a punch-in. 7.22 clap, 7.61 "spread": the book slams shut (shake, dust), the ask plaques flip from 101.30.. to 101.26.., the spread tag goes 0.05 -> 0.01 on "tight" with a pinch gesture.
- 9.62 "Depth and flow from left to right": wide, new crates slide into every queue from the left, teal flow arrow.
- 11.22 a market-order cart races through the alley (Tikki hops over it) and takes 2 of the 4 crates at the best ask; Tikki shouts the imbalance "+0.43" ((5 - 2) / (5 + 2) at the best level).
- 12.94 "Every tick": the plaques flash bottom to top. 13.6 "every queue": close-up on the best bid queue, front crates are filled on the beats and our gold crate moves #4 -> #1 while the abacus counts.
- 15.19 the curtain drops and rolls up into the title banner; 16.00 "Order Book and Market Microstructure!" stamped in letter by letter, 17.6 medallions (websocket, candles, imbalance, queue, spread), 18.4 jump, 19.18 fez tip.

## Checks
- `npx hyperframes lint`: 0 errors, 1 warning (the file is large because it is built from the kit by design).
- `npx hyperframes check` (full song): passed. The remaining `content_overlap` notes are letters mid-stamp (they grow 1.7x while landing); `#title` is marked `data-layout-allow-overlap`.

## Known weaknesses
- The cart is still small in the medium shot (about 100 px); it reads by motion and the arrow flag.
- In the wide shots the price plaques are about 20 px: context only. The close-ups show the same prices at 40 px.
- The crates keep their counts when the ask ladder re-prices on the slam (the levels re-label rather than re-fill).
- The stall interiors are flat dark arches; they could carry goods textures in episodes.
