# Order-types narration facts

Verified against primary venue documentation on 2026-09-30. The article supplies
the topic; the language-specific Gaia briefs override its absolute claims.
Prices, quantities and spreads in the video are illustrative. No current fee
schedule or live profitability claim is in scope.

| Claim | Production constraint | Primary source |
| --- | --- | --- |
| Market orders prioritize immediacy; crossing limits can be takers | Do not promise an execution price or full fill. Venue price bands can expire the remainder. | [Binance Spot glossary](https://developers.binance.com/en/docs/products/spot/faqs/spot_glossary), [Binance execution price-range rule](https://www.binance.com/en/support/faq/detail/5a2456e912e24b81bc21ca5447d4f6a2) |
| Stop trigger and execution price differ | Distinguish the trigger from the market or limit order submitted afterward. A stop-limit can remain unfilled. | [Binance Spot glossary](https://developers.binance.com/en/docs/products/spot/faqs/spot_glossary) |
| IOC cancels the unfilled remainder; FOK requires immediate full execution | Neither is a universal default. Binance Spot lists GTC/IOC/FOK; GTD support must be venue-specific. | [Binance Spot glossary](https://developers.binance.com/en/docs/products/spot/faqs/spot_glossary) |
| Post-only avoids immediate taker execution | Bybit cancels a crossing post-only order. Do not guarantee that every submission rests in the book. | [Bybit post-only orders](https://www.bybit.com/en/help-center/article/Post-Only-Order) |
| OCO and brackets may be exchange-hosted | Binance Spot has native OCO and OTOCO. Discuss strategy-process risk only for locally managed conditions. | [Binance Spot glossary](https://developers.binance.com/en/docs/products/spot/faqs/spot_glossary) |
| TWAP/VWAP control execution schedules or benchmarks | Do not promise a better price or profit. Bybit provides a venue-hosted TWAP tool. | [Bybit TWAP](https://www.bybit.com/en/help-center/article/Introduction-to-TWAP-Strategy), [IBKR VWAP](https://www.interactivebrokers.com/docs/general/order-types/algorithmic-orders/ib-algorithms/vwap) |
| Chasing limits is not exclusively a client-side feature | Bybit documents Chase Limit. Queue priority and amendment behavior remain venue-specific. | [Bybit available order types](https://www.bybit.com/en/help-center/article/Types-of-Orders-Available-on-Bybit?category=top) |

Review the generated narration for these distinctions before final visual
generation. Do not repeat the article's universal native-support table.
