# IOC and FOK: illustrative liquidity example

Time in force controls what an order can execute immediately and what happens to the remainder. It does not guarantee a fill. IOC means Immediate Or Cancel; FOK means Fill Or Kill.

Use one explicitly illustrative scenario for both: request100 units, with only60 immediately available at acceptable order parameters. IOC may execute60 and cancel the remaining40. FOK executes zero and cancels the entire100 in this scenario, because the full requested quantity is unavailable.

Generally, IOC can immediately execute zero, some or all and cancels the remainder. FOK immediately executes the entire requested quantity only if available under the order parameters; otherwise it cancels the whole order. FOK does not promise a full fill: it can produce no fill at all. Venue support and rules must be checked. No profit or execution guarantee is implied.
