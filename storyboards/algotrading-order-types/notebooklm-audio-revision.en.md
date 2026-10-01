# Complete narration for the reviewed NotebookLM deck

Create an English Audio Overview in Brief format with one narrator. Use the
selected, corrected PDF as the visual and factual source. Target 145-165 seconds
and approximately 310-350 spoken words. Do not announce slide numbers, read code,
add dialogue, add an introductory conversation, or read source filenames.
Cover every topic below, in precisely this order, so each of the eleven original
NotebookLM pages has a corresponding spoken passage. Do not skip Chase,
post-only, OCO/OTOCO or the final checklist to meet the duration target.

1. Three layers: accepting an order, triggering it, its execution price and the
   actually completed quantity are distinct events. A trigger is not a fill.
2. Market orders seek immediate execution against available liquidity; price
   and complete execution are not guaranteed. A buy limit caps purchase price;
   a sell limit sets a price floor. These are real price constraints, while a
   complete fill is not guaranteed.
3. Explain best ask and best bid and the spread using the illustrative book.
   A crossing limit may take liquidity immediately. Whether an unfilled
   remainder rests depends on time in force and venue rules.
4. IOC versus FOK, using the same illustrative requested 100 and available 60:
   IOC may fill 60 and cancel 40; FOK cancels all 100 in that example. IOC can
   fill zero, some or all. FOK fills the whole quantity immediately only if it
   is available; otherwise it cancels. Neither setting guarantees a fill.
5. Post-only: if accepted under venue rules, it remains passive; a submission
   that would cross may be rejected or canceled. Acceptance is not execution.
6. Stop price is a trigger, not a promised trade price. Stop-market submits a
   market order; liquidity and venue restrictions can prevent full execution.
   Stop-limit submits a limit order and may remain unfilled after a gap.
   Neither stop type guarantees a completed exit.
7. TWAP spreads execution over time; VWAP uses traded volume as a reference.
   Neither promises a better price. Chasing limits amend price to follow the
   market, require a price bound, and may lose queue priority depending on
   venue and amendment rules. Never say every amendment loses priority.
8. Plain OCO links two orders; execution of one cancels the other under venue
   rules. In the explicitly venue-specific Binance Spot OTOCO example, only
   full execution of the working entry order activates the pending OCO pair.
   Partial entry execution does not activate it. Do not apply this rule to
   every bracket implementation or every venue.
9. Exchange-hosted conditions and local virtual conditions have different
   dependencies. Local conditions need the strategy process and connection
   until they submit a real order. Stopping the bot does not automatically
   cancel a linked order already accepted by the exchange. Hosting does not
   guarantee execution.
10. Design for failure: local disconnection, rejected submissions, price
    restrictions, gaps and insufficient liquidity or partial fills can leave
    residual exposure. Explain this before the final checklist.
11. Finish with the complete decision checklist: what triggers the order,
    acceptable price bounds, handling partial fills, immediate-fill/remainder
    cancellation rules, venue support, and what happens if the strategy process
    stops. End with a complete sentence: no promise of profit, a better price,
    or guaranteed execution.

Keep all examples explicitly illustrative. Say F-O-K, T-W-A-P and V-W-A-P
clearly; preserve the technical distinction between OCO and OTOCO. No claims of
universal venue support, profit, guaranteed complete execution or guaranteed
stop prices. Do not reduce time in force to how long an order rests.
