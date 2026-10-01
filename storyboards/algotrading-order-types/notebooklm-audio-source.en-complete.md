# Full narration: order types EN v3

An order trigger, execution price and completed fill are different events. Exchange acceptance is not completed execution.

Market orders seek immediate liquidity. Their price and complete fill are not guaranteed. Buy limits cap purchase price; sell limits set a minimum sale price. Limits constrain price, without guaranteeing a fill.

In the illustrative book, best ask is 100 and best bid is 99.99: the spread is 0.01. Crossing limits can take liquidity immediately. Whether a remainder rests depends on time in force and venue rules.

Request 100 units with only 60 immediately available. IOC may fill 60 and cancel 40. FOK cancels all 100 in this example. Generally, IOC can fill zero, some or all and cancels the remainder. FOK immediately fills the entire requested quantity only if available, otherwise it cancels everything.

An accepted post-only order stays passive under venue rules. A crossing submission may be rejected or canceled. Acceptance is not execution.

Stop prices trigger subsequent orders, without promising execution prices. Stop-market faces liquidity and venue restrictions. Stop-limit may remain unfilled after a gap. Neither guarantees a completed exit.

TWAP spreads execution over time. VWAP uses traded volume as a reference. Neither promises better prices. Chasing limits follow the market within a price bound. Amendments may lose queue priority depending on venue and amendment rules.

Plain OCO links two orders; execution of one cancels the other under venue rules. In Binance Spot OTOCO specifically, only full working-entry execution activates the pending OCO pair. Partial entry execution does not activate it.

Exchange-hosted conditions run at the venue. Local conditions need the strategy process and connection until real-order submission. Stopping the bot does not automatically cancel already accepted exchange orders. Hosting does not guarantee execution.

Disconnection, rejection, price restrictions, gaps, low liquidity and partial fills can leave unhedged exposure.

Check triggers, acceptable price bounds, partial-fill handling, immediate-fill and remainder-cancellation rules, venue support, and consequences of strategy disconnection. There is no promise of profit, better prices or guaranteed execution.
