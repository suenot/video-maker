# Intro review log

The intro is 20.1 s, 1920x1080, 30 fps, with the song muxed in (`song_20s.m4a`). There is also a silent copy of each render (`tools/render_all.sh`).

## Song cut

- `song_raw.mp4` ("The Spread Trade Shuffle", ragtime, 28.9 s) has no `lyrics.srt`. I transcribed it with whisper.cpp (medium.en, word timestamps). The vocals start at once, and each sung line is 2 bars:
  0.1 "Two stocks walk into a chart, ha!" / 3.3 "Dancing close then drifting apart." / 6.4 "Buy the cheap one, short the rich," / 9.7 "Spread's the tune we're trading with." / 12.8 "Trade the spread, trade the spread," / 16.1 "Distance says these two should wed." / 19.2 "Cointegration rings the bell," / 22.5 "Kalman's filter knows it well." The band stops at 25.3, and "well" is held to 28.5.
- librosa beat tracking gives 150 BPM. Line starts fall on beats 0, 8, 16 and so on, and the low band is strongest on that phase, so those beats are the downbeats.
- Cut: 0 - 6.57 (lines 1-2) + 12.97 - 26.6 (lines 5-8, ending on the held "well"), spliced on downbeats with a 30 ms crossfade, a 0.85 s fade out, and loudnorm. Result: 20.17 s, -13.8 LUFS integrated. Re-tracking the cut gives an even beat across the splice. Measured grid: `BARS = [0.12, 1.74, 3.36, 4.97, 6.56, 8.13, 9.73, 11.33, 12.91, 14.55, 16.14, 17.74, 19.33]`.

## Story (one picture per sung line)

- 0.0 - 3.36 "Two stocks walk into a chart, ha!": an iris opens on the curtain, the curtain parts on the downbeat, and the two penguins tap in from the right wing (spring slack) in front of the screen, where two price lines are drawing. On "ha!" (2.94) Dan turns to the camera, winks and lifts his bowler, and the penguins throw jazz hands.
- 3.36 - 6.56 "Dancing close then drifting apart": they sway together, then slide apart on bar 3. The spring stretches and turns gold, the prices diverge on the screen, the z-meter climbs to +2.10, a hang tag reads `d = 2.1σ`, and Dan pops a gold "!" (6.17).
- 6.56 - 9.73 "Trade the spread, trade the spread": Dan winds up and throws two gold tags, `−1 ▼` onto the top-hat (rich) penguin and `+1 ▲` onto the boater (cheap) penguin. On the second "trade the spread" he flips a gold coin (his bet on the reversion) and catches it on beat 4.
- 9.73 - 12.91 "Distance says these two should wed": Dan cues with both arms, the spring snaps the partners back, and they collide (squash, recoil) and hug. A gold heart pops up, the needle swings back through −0.7 to 0, and coins rain on bar 7 while Dan holds out his hat.
- 12.91 - 16.14 "Cointegration rings the bell": the camera pushes toward Dan, who strikes the desk bell three times (gold ring lines). The screen rolls down a new reel showing the spread reverting inside the ±2σ bands, and the tip jar on the piano fills. Everyone bows, and an iris closes on Dan.
- 16.14 - 20.1 "Kalman's filter knows it well": an iris opens on the title set. The marquee lights up and its bulbs chase on the beat. The title letters drop in on eighths (DOM text, per language), with Dan's "ta-da" and the penguins' jazz hands. On "knows it well" (17.74) Dan tips his hat with a wink. The film ends on a closing iris around his face.

## Round 1 (first build, 13 snapshots)

- The spring stretched across the whole stage while the penguins walked in from opposite wings. They now enter together from the right.
- The piano was almost hidden by the left curtain, and the cat was squeezed against it. The curtains now open wider (inner edge 150 / 1770), and the act is re-laid out (piano 300, cat 525, bell 680, penguins 1040 / 1250 -> 830 / 1580).
- The penguin flippers rotated inward (sign bug), so the jazz hands never showed. Fixed.
- A compressed spring with 10 coils read as a grey block. It now has 8 coils with a smaller radius, and the partners stand further apart at rest.
- The z-meter labels were about 18 px. The gauge is now r 118, and its labels and readout are 24 - 28 px.
- The camera push for the bell moved 260 px left, so the curtain filled a quarter of the frame. It now moves 120 px.
- Falling coins covered the penguins' faces during the bell. The rain is now drawn behind the cast, settles at y 920, and lasts 0.9 s.

## Round 2

- Close-up crops: the piano keys sat at the cat's head height, so his gloves "played" at his face. The piano is now smaller (0.66) and Dan larger (1.05). His left glove plays the keys, and his right glove swings the beat toward the act (a showman playing sideways).
- The `d = 0.0σ` tag sat on the hugging penguins. It now fades out during the snap.
- `check`: the title spans counted as occluded by the transparent projector canvas `#fx`. The occlusion is intentional (the iris must cover the title), so the title nodes carry `data-layout-allow-occlusion`. Contrast reports 0/0 checks after that (it skips allowed-occlusion text). Before the flag it was 33/33 AA: paper and gold on the ink marquee.

## Round 3 (1 frame/s contact sheet, language variants)

- The marquee had long bars sticking out past its corners. The cause was Catmull-Rom overshoot: `roundPts` put a long straight edge between tightly packed corner points. `roundPts` now subdivides its edges (kit fix; it also tidies the piano panels, cuffs and the ticket).
- In the title, "Trading" touched the marquee's inner rule. The marquee is now 350 px tall, the text block sits 14 px higher, and the base size is 118 px (auto-fit per line).
- During the hat tip the glove covered the winking eye. The glove target moved up to the brim.
- ru / zh-CN / zh-TW titles checked with `tools/snap_lang.sh`: the Cyrillic two-line title fits through auto-fit, and the Chinese single line is set in Noto Serif SC / TC 900 at 132 px.

## Known weaknesses

- The cat is front-facing only: "turn" shifts his features but never shows a true profile. At the piano he plays with one hand.
- The penguins' far flipper reads as a flat black blade when held straight out.
- The compressed spring between the hugging penguins is a small grey bundle, partly hidden by their bodies.
- The coin rain is generic physics: one bounce, then the coins settle flat. They do not land in the hat.
- One lint warning remains: the file is large, because it is built from the kit by design.
