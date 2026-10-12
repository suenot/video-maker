# Intro review log

The intro runs the full song: 28.9 s, 1920x1080, 30 fps, with `song_full.m4a` muxed in (all of `song_raw.mp4`, 0.55 s fade at the end, loudnorm, -13.7 LUFS integrated). There is also a silent copy of each render (`tools/render_all.sh`, run through `collections/tools/heavy_slot.sh`). The marketmaker.cc logo sits top-right for the whole film.
Rounds 1-3 were done on a first 20 s cut (lines 1-2 + 5-8). The user then asked for intros to run the full song, so round 4 rebuilt the timing for all 8 lines.

## Song

- `song_raw.mp4` ("The Spread Trade Shuffle", ragtime, 28.9 s) has no `lyrics.srt`. I transcribed it with whisper.cpp (medium.en, word timestamps). Each sung line is 2 bars, and the vocals start at once. The band stops at 25.3 s, and "well" is held to 28.5 s.
- librosa beat tracking gives 150 BPM. Line starts fall on beats 0, 8, 16 and so on, and the low band is strongest on that phase, so those beats are the downbeats. Grid: `BARS = [0.12, 1.74, 3.36, 4.97, 6.57, 8.16, 9.78, 11.37, 12.97, 14.56, 16.16, 17.75, 19.34, 20.97, 22.57, 24.16]`.

## Story (one picture per sung line)

- 0.0 - 3.36 "Two stocks walk into a chart, ha!": an iris opens on the curtain, the curtain parts on the downbeat, and the two penguins tap in from the right wing in front of the screen, where two price lines are drawing. On "ha!" (2.94) Dan turns to the camera, winks and lifts his bowler, and the penguins throw jazz hands.
- 3.36 - 6.57 "Dancing close then drifting apart": they sway together, then slide apart. The spring stretches and turns gold, the prices diverge, the z-meter climbs to +2.10, a tag reads `d = 2.1σ`, and Dan pops a gold "!".
- 6.57 - 9.78 "Buy the cheap one, short the rich": Dan winds up and throws `+1 ▲` onto the boater (cheap) penguin on "buy the cheap one", then `−1 ▼` onto the top-hat (rich) penguin on "short the rich".
- 9.78 - 12.97 "Spread's the tune we're trading with": back at the piano. The camera leans toward the screen, a spread reel rolls down with ±2σ gold bands and draws up to the +2 entry (gold mark), and the stretched spring hums notes.
- 12.97 - 16.16 "Trade the spread, trade the spread": one gold coin flip on each line (Dan's bet on the reversion), caught with a wink.
- 16.16 - 19.34 "Distance says these two should wed": the spring snaps the partners back. They collide (squash, recoil) and hug, a gold heart pops up, the needle swings through −0.7 back to 0, and coins rain while Dan holds out his hat.
- 19.34 - 22.57 "Cointegration rings the bell": three bell strikes (gold ring lines). The spread reel finishes its reversion to the exit mark, and the tip jar fills. Everyone bows, and an iris closes onto Dan's face down to 60 px.
- 22.57 - 28.9 "Kalman's filter knows it well": the title iris opens from the same 60 px, on Dan's face in the title set (a match cut). The marquee lights up, its bulbs chase on the beat, and the title letters drop in on eighths. Dan tips his hat on "knows it well" (24.16). On the held "well" (25.76) everyone hops in a finale, and a last iris closes on Dan's wink.

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

## Round 4 (full song, logo)

- Retimed to all 8 lines (see the story above). The 20 s cut's "trade the spread" tags moved to "buy the cheap one / short the rich" in the order sung (buy first). "Spread's the tune" got its own picture (the spread reel and the humming spring), and "trade the spread" became two coin flips.
- The spread reel now draws in two parts: up to the +2 entry during "spread's the tune", then the reversion from the snap to the bell. It matches the spring and the z-meter at every moment.
- 1 fps contact sheet: the frame at 22.5 s was fully black between the closing and opening irises. The irises now meet at a 60 px circle on Dan's face, as a cat-to-cat match cut.
- The logo plate is top-right (100 px, 48 px margin), above `#fx` so the iris never covers it. It does one small hop when the curtain opens. The title marquee moved down (top edge at y 175) so it never touches the plate, and the act's z-meter and screen stay clear of it, even during the camera push.

## Known weaknesses

- The cat is front-facing only: "turn" shifts his features but never shows a true profile. At the piano he plays with one hand.
- The penguins' far flipper reads as a flat black blade when held straight out.
- The compressed spring between the hugging penguins is a small grey bundle, partly hidden by their bodies.
- The partners hold their stretched pose for about 9 s (6.6 - 16.2 s). Tap feet, the humming spring and the coin flips keep it alive, but it is the longest static stretch.
- The coin rain is generic physics: one bounce, then the coins settle flat. They do not land in the hat.
- One lint warning remains: the file is large, because it is built from the kit by design.
