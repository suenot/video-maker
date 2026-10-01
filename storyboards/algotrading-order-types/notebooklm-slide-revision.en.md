# NotebookLM slide-deck revision

Generate a corrected English Slide Deck from the notebook's selected corrected
order-types source. This is the original NotebookLM slide-and-audio flow: the
PDF pages themselves will be extracted and used in the video. Create 11 concise
16:9 pages matching the source's three categories and final checklist. Preserve
the educational diagrams, labels and explanations; do not generate decorative
posters. Use large readable text and one clear teaching point per page.

Apply these corrections to the previous deck:

- The three categories are exchange orders, execution algorithms, and linked or
  locally managed conditions. Do not draw an inheritance hierarchy implying that
  TWAP, VWAP or every linked order inherits a stop trigger.
- A buy limit caps the acceptable purchase price; a sell limit sets a price
  floor. These are price constraints, while a completed fill is not guaranteed.
  Do not use a blanket "Guarantee Level: None" that erases those constraints.
- A crossing limit can fill immediately; whether its remainder rests depends
  on time in force and venue rules. Do not promise that every limit order rests.
- Any book example must be labeled illustrative. Sort asks from lowest to
  highest and bids from highest to lowest, with the best prices clearly marked.
- Compare IOC and FOK using the same illustrative liquidity: requested 100,
  available 60. IOC can fill 60 and cancels 40; FOK fills 0 and cancels 100.
  Separately state that IOC can fill zero, some or all, and FOK can fill all when
  the full amount is immediately available. Never imply IOC is always partial.
- A stop price triggers the following order; it is not the execution price.
  Neither stop-market nor stop-limit guarantees a completed exit. A stop-limit
  can remain unfilled after a gap; market execution depends on liquidity and
  venue price restrictions.
- Post-only is passive if accepted under venue rules; a crossing submission may
  be rejected or canceled. Acceptance and execution are distinct.
- TWAP and VWAP control a schedule or benchmark without promising a better
  price. Chasing may lose queue priority depending on venue/amendment rules;
  do not state that every amendment universally loses priority.
- Plain OCO links two orders: execution of one cancels the other under venue
  rules. Do not conflate plain OCO with an entry plus two exit orders. Label an
  entry/bracket or OTOCO example separately if shown. Exchange-hosted linked
  orders and local virtual conditions have different process dependencies;
  hosting does not guarantee execution.
- The final checklist asks about trigger, price bound, partial fill, time in
  force, venue support, and strategy-process failure. Keep these as distinct
  questions; time in force does not guarantee execution.

Use illustrative numbers only. No profit guarantees, fixed fee rates, QR codes,
invented commands, URLs or logos. All explanatory text must be English.
