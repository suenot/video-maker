# End card review log

Each round: snapshots at key times (en / ru / zh-TW), looked at frame by frame,
critique, fix, re-snapshot. Final sheet: `snapshots/contact-sheet.jpg`.

## Round 1 (first build, 6 s frame in en)

- Contacts wrapped into three rows; the Facebook chip fell off the bottom of the
  frame. Fix: two-row layout that picks the split with the narrowest wider row
  and shrinks the chip gap to fit.
- Sign row 1 "label + youtube.com/" collided for 简体中文, 繁體中文 and Русский
  (the right-aligned URL ran into the label). Fix: the language moved to a tab
  on the top edge of each sign (ink, coral on the highlighted one); row 1 is now
  play glyph + `youtube.com/`, row 2 the handle (auto-fit 40 -> 32 px).
- Arm-tip "grips" drawn over the signs read as pink blobs. Fix: removed; arm
  tips now end 44 px behind the inner sign edge, so Otto holds the signs from
  behind.

## Round 2 (ru + zh-TW at 2 s and 6 s, full 14-frame sheet in en)

- Second chip row was cramped edge to edge (gap shrunk to ~16 px) while row 1
  had spare room. Fix: reordered contacts for balanced rows (web, email, X,
  Discord / Telegram, Telegram RU, GitHub, Facebook).
- "Подписаться" touched the dashed subscribe circle. Fix: circle r 110 -> 116,
  label fit width 1.7 r -> 1.8 r.
- The ink-cloud intro shrank toward the frame centre and read as a dark rock
  floating mid-water at 0.6 s; 0.9 s was an empty beat (only Otto on screen).
  Fix: the cloud now retreats into Otto (centre at his body), quadratic shrink;
  the whole entrance moved ~0.25 s earlier (header 0.5 s, signs 0.8 s,
  chips 1.2 s, slots 1.5 s).

## Round 3 (0.1-0.85 s intro strip, then lint/check)

- Ink now clears from the edges inward and is sucked back into Otto by 0.7 s;
  the logo and headline arrive while he lands. Accepted.
- YouTube slots: dashed frame and circle are static from 2.4 s; no fish, bubbles
  or rays-heavy motion cross them (fish are confined to the top-right water,
  bubbles to x < 1110). Accepted.
- CJK: headline, tab labels and slot labels render in the local Noto Sans SC/TC
  subsets (no tofu) in zh-CN and zh-TW. All text is >= 32 px.
- `npx hyperframes lint`: 0 errors (1 warning: file size, the kit is inlined, same
  as every collection intro). `npx hyperframes check`: passed.

## Round 4 (rendered mp4s)

- All four renders: 19.000 s, H.264 1920x1080 30 fps yuv420p, AAC 48 kHz stereo,
  -15.9 LUFS integrated. Frames pulled at 0.3 / 0.8 / 1.5 / 3 / 9 / 18.7 s (en)
  and 8 s (ru, zh-CN, zh-TW).
- Highlight follows `lang` in every render (English / Русский / 简体中文 / 繁體中文
  sign turns sun-yellow with a coral tab); headline and slot labels localized.
- During the chip pop-in (about 1.2-1.9 s) the back-ease overshoot briefly lets
  a chip's text touch its neighbour. Transient (under 0.2 s), left as is.
- "Подписаться" at the 32 px floor nearly fills the subscribe circle; it stays
  inside the dashed ring and is covered by the YouTube subscribe element anyway.
- The renderer's auto-worker calibration flags frame 0 as a "small frame" (it is
  a solid ink cloud) and drops to one worker; output is correct, ~2.5 min each.

## Round 5 (websites added on request)

- Added `www.marketmaker.cc` and `www.listingapis.com` as two large cream pills
  with globe glyphs, right-aligned in the header row (38 px, pop in at 0.6 s,
  globe nods every 5.5 s). The `marketmaker.cc` chip left the contacts panel
  so the site isn't listed twice.
- The fish lane moved from the header row (now taken by the pills) to the water
  right of the headline banner (x > 1380, y ~200), above the slot board.
- With 7 chips the first split put the two Telegram chips on different rows.
  Reordered: both Telegrams, email, X / Discord, GitHub, Facebook (rows 1568 /
  1542 px).
- Checked en at 1 s / 8 s, ru at 3.4 s and zh-CN at 8 s. lint: 0 errors. check: passed.
