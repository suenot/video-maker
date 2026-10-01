# Reviewed slide narration: order types EN v3

These notes transcribe the reviewed NotebookLM deck in its eleven-page order.
They preserve its technical claims and explain the diagram relationships for
an Audio Overview. Prices and quantities are illustrative.

## 1. Three layers of order execution

An order trigger, its execution price and the completed fill are different
mechanical events. Acceptance by an exchange does not mean completed execution.

## 2. Market and limit orders

A market order seeks immediate execution against available liquidity. Neither
its execution price nor a complete fill is guaranteed; liquidity and exchange
price restrictions may limit execution. A buy limit caps the acceptable
purchase price; a sell limit sets a minimum acceptable sale price. Limit orders
impose price constraints, while a complete fill is not guaranteed.

## 3. Inside the order book

The illustrative best ask is 100.00 and the best bid is 99.99, so the spread is
0.01. The best ask is the lowest asking price and the best bid the highest
bidding price. A crossing limit order can take liquidity immediately. Whether
an unfilled remainder rests depends on time in force and the venue's rules.

## 4. IOC and FOK

The same example requests 100 units with 60 immediately available. IOC may
execute 60 and cancel the remaining 40. FOK fills zero and cancels all 100 in
that example. More generally, IOC can fill zero, some or all immediately and
cancels what remains. FOK immediately fills the entire quantity only when it
is available; otherwise it cancels the whole order. Neither guarantees a fill.

## 5. Post-only

Under the venue's rules an accepted post-only order remains passive. A
submission that would cross existing liquidity may be rejected or canceled.
Acceptance and execution are distinct events.

## 6. Stop orders

A stop price is a trigger, not a promised execution price. Stop-market submits
a market order after activation: execution can occur at a worse price, be
partial, or fail because of liquidity or venue restrictions. Stop-limit
submits a limit order and can remain unfilled after a price gap. Neither
guarantees a completed exit.

## 7. Execution algorithms

TWAP spreads execution over time. VWAP uses traded volume as an execution
reference. A schedule or benchmark does not promise a better price. Chasing
limits automatically amend price to follow the market and require an
acceptable-price bound. Amending may lose queue priority depending on the
venue and the type of amendment; it is not a universal outcome.

## 8. Linked orders

Plain OCO links two orders: execution of one cancels the other under venue
rules. The diagram's separate Binance Spot OTOCO example is venue-specific.
Its working entry order must be fully filled before the pending OCO pair is
activated. Partial entry execution does not activate that pair. This rule
does not define all bracket implementations or all exchanges.

## 9. Exchange-hosted and local conditions

Exchange-hosted OCOs and condition lists are managed by the venue. Local
virtual conditions depend on the strategy process and its connection until
they submit a real order. Stopping the bot prevents further local submission,
but does not automatically cancel linked orders already accepted by the
exchange. Hosting does not guarantee execution.

## 10. Failure cases

Local disconnection or rejected submission can stop an order from reaching
the book. Price restrictions can prevent market execution; a gap can leave a
limit behind. Insufficient liquidity and partial fills may leave residual,
unhedged exposure. Strategy logic must handle each failure and dependency.

## 11. Order selection checklist

Ask what triggers the order; what maximum or minimum price is acceptable;
how partial fills are handled; what may fill immediately and when the
remainder is canceled; whether the venue supports the parameters; and what
happens if the local strategy disconnects. Time in force does not guarantee
execution. There is no promise of profit, a better price or guaranteed execution.
