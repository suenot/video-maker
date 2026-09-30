# Order types in algorithmic trading: NotebookLM production brief

Use this brief together with `algotrading-order-types.en.md`. The article is the topic source; the corrections below take precedence where its wording is too absolute. Produce an English educational video for the Marketmaker channel. Use the article's practical scope, without reading code listings aloud.

## Story

Start with the cost of choosing the wrong order: a stop trigger is reached, yet the resulting order may execute at another price or not fill. Organize the explanation in three layers:

1. Exchange orders and execution constraints: market, limit, stop-market, stop-limit, trailing stop, iceberg, time in force (GTC/IOC/FOK and GTD where supported), and post-only.
2. Execution algorithms: TWAP, VWAP, chasing limit orders, and time-based scheduling. Explain what the algorithm controls and what it cannot guarantee.
3. Linked and strategy-side orders: OCO and brackets may be venue-native or managed by the trading system; virtual and synthetic orders may be local instructions that must be submitted later. Distinguish where each condition is evaluated and which system must remain running.

Use one simple illustrative order book to compare market, limit, IOC, FOK, and post-only. Then use a separate price-gap example for stop-market versus stop-limit. Finish with a short decision checklist: trigger, acceptable price, partial fill, time in force, venue support, and what happens if the strategy process fails.

## Factual guardrails

- A market or stop-market order prioritizes immediacy but does not guarantee a particular price or full execution. Venue price bands and liquidity matter.
- A limit order sets a purchase ceiling or sale floor. A crossing limit can execute immediately as a taker; it may fill partially, rest, or remain unfilled.
- A stop price triggers submission of the next order. It is not a promised execution price. A stop-limit can remain unfilled after a gap.
- Post-only is passive only if accepted under venue rules. A crossing order may be rejected or canceled. Do not say it is guaranteed to enter the book.
- IOC may fill the available part and cancel the remainder; FOK requires the whole amount immediately or cancels. Do not present GTC as the universal default.
- Fee rates, maker rebates, trailing-stop and iceberg support, and order adjustment behavior vary by venue, instrument, account tier, and date. Do not quote fixed Binance fee rates.
- TWAP and VWAP are execution schedules or benchmarks, not promises of a better price. Chasing can lose queue position and must respect a price limit.
- Venue-hosted execution tools exist: Bybit offers TWAP and Chase Limit. Do not reuse the article's table as a universal statement that exchanges never support these tools. GTC/GTD and linked-order availability also depend on the venue and instrument.
- A virtual or synthetic order exists in the strategy system until a real order is sent. It adds process and connectivity risk.
- OCO and brackets are not necessarily local: Binance Spot supports native OCO and OTOCO order lists. A bot outage affects locally evaluated conditions; do not imply that it cancels an already accepted exchange-hosted order list.
- Do not claim that post-only is mandatory for every market maker, that pegged orders are always first in queue, or that virtual orders are required above a fixed order count.

Keep numbers clearly illustrative. Name venue-specific behavior as venue-specific, and avoid profit or execution guarantees.
