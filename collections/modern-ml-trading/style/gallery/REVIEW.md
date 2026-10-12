# Gallery review log: sidekick + duo (2026-10-12)

Snapshots at 5.1, 5.6, 6.6, 7, 9.5, 10.6, 11.6 and 13 s (`npx hyperframes snapshot --at ...`).

## Round 1
- Pico hovered 285 px from the owl and faced him: the needle beak speared the owl's head in every listening frame. Fix: Pico at `x + 370 * s`, `y - 230 * s`.
- Owl "tap the temple" talking gesture put the glove over his own spectacles. Fix: finger up beside the head (`x -190, y -330`).
- Owl point at the plate: the arm ran behind Pico and the glove hid under the clipboard. Fix: Pico lifts while the owl points (see round 2).
- Owl "think" fist covered the beak; moved under the chin (`62, -215`).
- Listening brow 0.35 read as a frown on the owl; dropped (look + tilt + nod carry listening).
- Gallery window behind the plate peeked out as an odd arch; removed from the duo page.

## Round 2
- Lift 80 still let the clipboard sit on the owl's arm line. Fix: lift 130 * s and clamp the owl's reach to 185, so the pointing glove ends clear of Pico.
- Checked: both pointing at the plate peak, beak gaps visible on talk peaks for both hosts, listener eyes on the talker, surprise / think / write reactions, Pico gesture sheet readable at 0.72 scale (about 180 px). No overlaps with the plate or the caption.
- Intro rebuilt with the new kit: lint 0 errors, snapshot at 12 s unchanged (owl `talk` / `nod` default to 0).
