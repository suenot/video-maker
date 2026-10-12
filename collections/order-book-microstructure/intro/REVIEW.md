# Intro review log

The intro is 20.1 s, 1920x1080, 30 fps, with the song muxed in (`song_20s.m4a`, 152 BPM, -14.0 LUFS, true peak -1.6 dBTP). There is also a silent copy of each render.
Each round comes from snapshots I looked at (`tools/snap.sh`, 9 to 20 frames, `tools/snap_lang.sh` for the other languages).

## Song cut
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

## Story (each sung line has its own picture)
- 0 - 1.6 kilim curtain rolls up on the bazaar tower; 1.6 - 3.4 shutters roll up and awnings drop on eighth notes, top to bottom.
- 3.2 - 4.8 Tikki swings in on a rope and lands on the balcony at the alley on the downbeat; fez tip, abacus flicks, a big breath.
- 6.43 "Hey!": shout with a "!" burst and a punch-in. 7.22 clap, 7.61 "spread": the book slams shut (shake, dust), the ask plaques flip from 101.30.. to 101.26.., the spread tag goes 0.05 -> 0.01 on "tight" with a pinch gesture.
- 9.62 "Depth and flow from left to right": wide, new crates slide into every queue from the left, teal flow arrow.
- 11.22 a market-order cart races through the alley (Tikki hops over it) and takes 2 of the 4 crates at the best ask; Tikki shouts the imbalance "+0.43" ((5 - 2) / (5 + 2) at the best level).
- 12.94 "Every tick": the plaques flash bottom to top. 13.6 "every queue": close-up on the best bid queue, front crates are filled on the beats and our gold crate moves #4 -> #1 while the abacus counts.
- 15.19 the curtain drops and rolls up into the title banner; 16.00 "Order Book and Market Microstructure!" stamped in letter by letter, 17.6 medallions (websocket, candles, imbalance, queue, spread), 18.4 jump, 19.18 fez tip.

## Checks
- `npx hyperframes lint`: 0 errors, 1 warning (the file is large because it is built from the kit by design).
- `npx hyperframes check`: passed; contrast 30/30. The remaining `content_overlap` notes are letters mid-stamp (they grow 1.7x while landing); `#title` is marked `data-layout-allow-overlap`.

## Known weaknesses
- The cart is still small in the medium shot (about 100 px); it reads by motion and the arrow flag.
- In the wide shots the price plaques are about 20 px: context only. The close-ups show the same prices at 40 px.
- The crates keep their counts when the ask ladder re-prices on the slam (the levels re-label rather than re-fill).
- The stall interiors are flat dark arches; they could carry goods textures in episodes.
