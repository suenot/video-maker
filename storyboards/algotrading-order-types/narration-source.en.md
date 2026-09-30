# Three layers of order execution

An order trigger, an execution price and a completed fill are three different
things. Choosing an order means deciding which constraints matter and which
failures the strategy must handle. Prices and quantities in examples are
illustrative.

## Exchange orders

A market order seeks immediate execution against available liquidity. Its
price and complete execution are not guaranteed: liquidity and exchange price
bands can limit the fill. A buy limit sets the maximum acceptable price; a sell
limit sets the minimum. A crossing limit can take liquidity immediately; an
unfilled remainder may rest where the venue rules allow.

IOC means immediate or cancel: execute the available portion now and cancel
the rest. FOK means fill or kill: execute the full quantity immediately or
cancel. Post-only keeps an accepted order passive under the venue's rules; a
crossing submission may be rejected or canceled. Time-in-force options vary by
venue and instrument.

## Stop orders

A stop price is a trigger, not a promised execution price. Once triggered, a
stop-market submits a market order; it can execute at a worse price, partially
fill or fail to fill under the venue's liquidity and price restrictions. A
stop-limit submits a limit order and can remain unfilled after a price gap.
Neither type guarantees a completed exit. This is the central comparison.

## Execution algorithms

TWAP spreads execution over time. VWAP uses traded volume as an execution
reference. Both control a schedule or benchmark; neither promises a better
price. Chasing limit orders can lose queue priority when amended and need an
acceptable-price bound. These tools can run at the venue or in the trading
system; Bybit offers venue-hosted TWAP and Chase Limit.

## Linked orders and local conditions

OCO and bracket-style orders can be hosted by the exchange or managed locally.
Binance Spot provides native OCO and OTOCO order lists. A locally managed
virtual condition depends on the strategy process and connectivity until it
submits a real order. Stopping the bot can prevent a local condition from
submitting; it does not automatically cancel a linked order already accepted
and hosted by the exchange.

## Decision checklist

For each order, identify its trigger, acceptable price, partial-fill behavior,
time in force, venue support, and dependence on the strategy process. Design
for the failure case as well as the expected execution. There is no promise of
profit, a better price or guaranteed execution.
