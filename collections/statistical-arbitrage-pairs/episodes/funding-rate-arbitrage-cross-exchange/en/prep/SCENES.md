# funding-rate-arbitrage-cross-exchange (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host who asks and pushes back, H2 = expert host), 15-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/funding-rate-arbitrage-cross-exchange.en.md` (2026-03-05, suenot).

- Audio: `input/notebooklm-sources/funding-rate-arbitrage-cross-exchange/en/audio.m4a`, 1340.65 s (22:20.7), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has `words[]` with per-word start/end). Timestamps below are segment starts in seconds, accurate to about 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`. `timeline_auto_evensplit.json` is the failed `sync_slides.py` output, kept for reference only.
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: dark slate/navy background (#1F2530 to #2A303A) with a faint blueprint grid (thin lighter lines, some heavier guide lines), white or light-grey grotesk titles (slides 1 to 4 bold white, slides 5 to 11 light grey thin, slides 12 to 15 monospace), monospace body text. Accents: cobalt blue (#3B5FC0) = the long / hedge side, "good", optimal; orange (#E07A2E) = the short / target side, warnings, risk; mustard yellow appears once (Binance bar on slide 2). Dark near-black cards (#1A1D22) with thin grey borders for panels and terminals. Small "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper, do not caption verbatim): "detode" (60.4) = decode; "along on Binance" (477.8, 532.4) = a long; "innacadly long" (754.6) = naked long (unhedged); "web trackets" (1155.8) = WebSockets; "Bright." (1189.0) = Right; "an API library ... like CCXT" (785.2) = ccxt (ccxt.pro in the article); "DYDX" = dYdX. Hosts do NOT read headings aloud in this episode, boundaries come from topic transitions.

---

## Slide 1: Title. 0.0 to 115.3 (115.3 s)

**Content**
- Title (very large, wide bold white grotesk, 2 lines centered): "Funding Rate Arbitrage / Across Exchanges".
- Subtitle (mono, grey, 2 lines): "A structural blueprint for extracting / profit from cross-venue rate discrepancies."
- Background chart filling the slide over the grid: a cobalt-blue line starting lower left and climbing to the upper right (small plateau around 3/4 width), an orange line starting mid-left and falling to the lower right. They cross about 1/3 of the way across. No axes, no numbers. (Read as two venues' funding rates diverging.)
- Tag row (mono, blue square brackets): "[Algo Trading]  [Market Making]  [Delta-Neutral]".
- Footer (mono, small grey): "Editorial draft. Data and calculations are strictly illustrative."

**Sub-scenes (slide > 90 s)**
- 1a Cold open 0.0 to 52.0: neutral position teaser. Visual: a balance scale or a flat delta needle staying at 0 while a price line crashes 20% and then rockets.
- 1b Title reveal 52.0 to 70.8: article title read aloud, title + subtitle animate in, the two lines draw and cross.
- 1c Ground rules 70.8 to 115.3: disclaimer card (illustrative gross scenarios, not advice), list of excluded frictions pops in one by one.

**Beats**
- 0.0 "hold a completely neutral position"; 7.4 "genuinely market neutral"
- 11.1 "do not care if the market crashes 20% or rockets to all time highs" (price line plunges, then rockets; neutral needle stays still)
- 17.0 "mathematically generate a 6% monthly return" (number pops; see errors: article figure is ~6.75% ROC per month, gross)
- 30.7 "the invisible plumbing of crypto exchanges" (pipes between exchange boxes)
- 40.6 "how much mechanical inefficiency exists under the hood"
- 52.0 title read aloud "Funding Rate Arbitrage Across Exchanges, How to Profit from Rate Differences" (title reveal)
- 60.4 mission: decode how traders exploit structural rate differences "without taking any directional stance"
- 79.1 "an editorial exploration of this article's claims"; 82.5 "This is not financial advice"
- 88.7 "every profit calculation, every APR ... strictly an illustrative gross scenario"
- 102.7 "trading fees or market slippage, margin liquidations"; 106.4 "venue basis risks"; 108.5 "counterparty risk too" (tick a list of 5 frictions)
- 109.5 "Nothing we say here is a guaranteed risk-free or live rate"

## Slide 2: The Structural Divergence. 115.3 to 174.9 (59.6 s)

**Content**
- Title (bold white): "The Structural Divergence".
- Outlined text box: "Funding rate arbitrage extracts profit from structural divergences between venues without predicting market direction. Someone pays more, someone pays less; arbitrageurs capture the difference."
- Two cards side by side with a white circle "VS" (black bold text) between them:
  - Left card: top bar half mustard yellow / half grey; rows "Binance Environment" (bold) / "ETHUSDT" (mono) / "Pays 0.01%" (mono, large).
  - Right card: top bar half orange / half black; rows "Bybit Environment" / "ETHUSDT" / "Pays 0.035%".
- Full-width cobalt banner (bold white): "Result: A 3.5x rate difference for the exact same asset."

Article check: matches the article's opening (ETHUSDT 0.01% Binance vs 0.035% Bybit, 3.5x). Narration never mentions 0.035% (it uses 0.04% later in the worked example on slide 5); keep 0.035% here as on the slide.

**Beats**
- 115.3 "let's unpack this foundation" (slide in)
- 119.2 "funding rates exist to anchor the perpetual futures contract to the spot price" (anchor/rope from PERP to SPOT)
- 127.0 "why would that funding rate differ for the exact same asset at the exact same second" (cards slide in, VS pops)
- 138.7 "the exchanges themselves just have completely different structural DNA"
- 145.7 thermostat analogy: "think of the funding rate like a thermostat for an exchange's internal order book" (good gag: each exchange is a room with a thermostat)
- 150.4 "too many people pile into a room wanting the price to go up" / 155.9 "the room gets too hot"
- 156.9 "cranks the thermostat ... making the longs pay the shorts" (arrow of coins from LONG crowd to SHORT crowd)
- 164.6 "cools the room down"
- 168.2 "Binance's room is filled with a totally different demographic than OKX's room" (two rooms at different temperatures; reveal "3.5x" banner here)

## Slide 3: The Four Drivers of Divergence. 174.9 to 308.6 (133.7 s)

**Content**
- Title (bold white): "The Four Drivers of Divergence".
- Four equal outlined columns, each with a cobalt line icon, a numbered bold heading, and centered body text:
  1. Icon: pie chart with one white slice and a person badge. "1. Trader Composition" / "Retail dominance (e.g., Binance, heavily skewed long) vs. Professional participants (e.g., Bybit/OKX)." (exchange names in mono)
  2. Icon: curly braces around "x − Σ / + ÷ = / x + Σ". "2. Calculation Formulas" / "Variations in premium index weights, interest rate baselines, and averaging periods across exchanges."
  3. Icon: filled jagged area chart (W shape) with a dashed vertical midline. "3. Liquidity Variance" / "Lower liquidity environments lead to volatile spot/futures premiums, causing wider funding fluctuations."
  4. Icon: clock face (hands at ~4:00) with a dashed blue arc on the right half of the rim. "4. Payment Intervals" / "Standard payments (every 8 hours) vs. Accelerated payments (hourly on platforms like dYdX or specific Bybit pairs)."

Article check: matches the four bullets of "Why Funding Rates Differ". Standard 8 h times per article: 00:00, 08:00, 16:00 UTC.

**Sub-scenes (slide > 90 s)**
- 3a Trader composition 174.9 to 210.1 (column 1 lights up)
- 3b Calculation formulas 210.1 to 257.6 (column 2)
- 3c Liquidity 257.6 to 284.7 (column 3; whale splash on a thin book)
- 3d Payment intervals 284.7 to 308.6 (column 4; clock ticks 3 times a day vs 24 times)

**Beats**
- 174.9 "four main causes for this divergence" (four empty columns appear)
- 178.9 "trader composition is a huge one"; 181.0 "Binance is historically swarmed by retail traders"; 184.1 "retail notoriously leans long"
- 188.6 "OKX and Bybit ... a higher concentration of institutional or professional participants who might be hedging"
- 202.9 "crank their respective thermostats to completely different temperatures"
- 213.2 "literally using different math to calculate that thermostat temperature"; 218.0 "the premium index"
- 225.1 "the premium index basically measures the deviation between the perpetual contract price and the underlying spot ... price" (formula icon animates)
- 235.7 Binance "one specific algorithm and time weighting mechanism"; 245.5 Bybit "a totally different averaging period" (see errors re "spot liquidity weights")
- 251.0 "same problem using different mathematical recipes"
- 257.6 "liquidity must act as a massive shock absorber"; 262.8 "Lower liquidity basically means more volatile premiums"
- 265.6 "a single whale throwing around a massive market order is going to violently skew that premium index" (whale gag)
- 272.7 "on a highly liquid venue ... that exact same order would just get easily absorbed"
- 284.7 "payment frequency"; 291.0 "the standard eight hour funding clock ... midnight, 8am and 4pm UTC" (clock pings 00/08/16)
- 298.8 "dYdX or specific ... pairs on Bybit ... pay out funding every single hour"

## Slide 4: Spread Behavior Across Market Phases. 308.6 to 352.0 (43.4 s)

**Content**
- Title (bold white): "Spread Behavior Across Market Phases".
- Table, mono, 6 columns, header row bold: "Market Phase | Binance | Bybit | OKX | dYdX | Spread"
  - "Calm | 0.01% | 0.012% | 0.009% | 0.01% | ~0.003%" (Spread cell light steel blue)
  - "Bullish | 0.03% | 0.05% | 0.025% | 0.04% | ~0.025%" (Spread cell mid steel blue)
  - "Extreme Bullish | 0.1% | 0.2% | 0.08% | 0.15% | ~0.12%" (Spread cell bright orange, the highlight)
  - "Bearish | -0.02% | -0.01% | -0.025% | -0.015% | ~0.015%" (Spread cell steel blue)
- Bottom outlined box: "**Key Insight:** Volatility breeds opportunity. Spreads widen significantly during extreme market phases."

Article check: identical to the article table (article labels "Bullish trend" / "Bearish trend"). Spread = max minus min of the four venues in each row; all four values check out. Article adds: 0.025% per 8 h = 0.075% per day = $75/day = ~$2,250/month on $100K.

**Beats**
- 308.6 "the inefficiencies really scale with the market's overall enthusiasm" (table frame draws)
- 313.5 "a calm sideways market where Binance might be paying ... 0.01%"; 321.5 "Bybit is at a positive 0.012%"; 326.3 "The spread is just 0.003%" (Calm row fills)
- 328.8 "barely worth the electricity to run the bot" (gag: tiny coin vs a big power bill)
- 333.6 "in a blistering bull market"; 337.0 "Binance retail goes absolutely crazy, driving their rate to maybe 0.1%"; 342.3 "Bybit might spike to 0.2%"
- 345.6 "Suddenly you have a massive 0.12% spread" (orange cell flashes; see errors: 0.12% is Bybit vs OKX)
- 349.0 "that spread? That is the entire game here" (Key Insight box)

## Slide 5: The Mirror Position Mechanism. 352.0 to 421.8 (69.8 s)

**Content**
- Title (light grey thin): "The Mirror Position Mechanism".
- Center: vertical dotted white line, label above it (mono, 2 lines) "Neutral / Price Risk".
- Left: orange-outlined box shaped as a block arrow pointing right toward the center line. Header bar (brown-orange tint) "Side A (Target Exchange - Bybit)"; body "Open SHORT" (SHORT in orange); "**Action:** Receive 0.04% (every 8h)."
- Right: cobalt-outlined box shaped as a block arrow pointing left toward the center line. Header bar (blue tint) "Side B (Hedge Exchange - Binance)"; body "Open LONG" (LONG in blue); "**Action:** Pay 0.01% (every 8h)."
- Two hollow grey down arrows from each side into a white-outlined box "The Net Result": "**Price Risk:** Neutralized." / "**Net Spread Captured:** 0.03% per 8 hours (0.09% per day)."
- Orange warning line under it with a triangle icon: "WARNING: Gross scenario before fees, slippage, and margin costs."

Article check: matches the article example (Bybit 0.04% short, Binance 0.01% long, net 0.03% per 8 h, 0.09% per day, ~2.7% per month).

**Beats**
- 352.0 "That brings us to the basic arbitrage mechanics" (slide in)
- 358.2 "Because the asset is exactly the same, you just open perfectly mirrored positions" (two block arrows slide toward the center)
- 364.0 "simultaneously long and short the exact same size on two different exchanges"; 369.3 "completely price neutral" (center line label glows)
- 372.3 "receive funding on one exchange and you pay a lower funding rate on the other"
- 376.5 "the article's illustrative example using ETH-USDT"
- 384.1 "Binance funding rate is positive 0.01%. Longs are paying shorts" (Side B fills)
- 390.1 "over on Bybit, the room is way hotter. The rate is positive 0.04%" (Side A fills)
- 401.5 "open a short position on Bybit ... receive that 0.04%"; 408.3 "just to hedge my price risk, I open a long position on Binance ... pay the 0.01%"
- 417.0 "netting the 0.03% difference every eight hours" (Net Result box, coins drip 3 times per day)

## Slide 6: Calculating Potential Yield. 421.8 to 457.0 (35.2 s)

**Content**
- Title (light grey thin): "Calculating Potential Yield".
- Box with grey header "Logic Block"; body (mono): "Daily PnL = (Short Rate - Long Rate) × Payments per Day × Position Size".
- Hollow grey down arrow.
- Terminal box, header "Calculated Output ($100K Position)", black body, mono lines with ">" prompts:
  - "> Input Spread : 0.03%"
  - "> Frequency    : 3x daily payments"
  - "> Gross Daily  : $90"
  - "> Gross Monthly: ~$2,700 (30 days)"
- Footer (grey sans): "Illustrative calculations derived from article claim scenarios only. Not guaranteed or risk-free returns."

Article check: correct (0.0003 × 3 × 100,000 = $90/day, × 30 = $2,700). Article function: `funding_arbitrage_pnl(rate_short_exchange, rate_long_exchange, position_size, payments_per_day=3, days=30)` returns `spread * payments_per_day * position_size * days`.

**Beats**
- 421.8 "three payouts a day equals 0.09% daily" (formula types in)
- 428.1 "On a $100,000 position ... a gross profit of $2,700 a month" (terminal lines print one by one; $2,700 last)
- 434.6 "Which sounds amazing"
- 436.1 "a snippet of Python code ... funding_arbitrage_pnl" (show the function name as a code chip)
- 448.9 "takes the receive rate, subtracts the pay rate, and just multiplies it by the position size, the payments per day, and the holding days"

## Slide 7: Pitfalls Part I: Execution Frictions. 457.0 to 640.8 (183.8 s)

**Content**
- Title (light grey thin): "Pitfalls Part I: Execution Frictions".
- Three tall dark cards, each with an orange-outlined mono header tab:
  - "Friction 1: Price Divergence": "**Risk:** Venues trade at different prices (0.01%-1% variance). Asynchronous execution execution instantly erases funding profits." "**Engineered Fix:** Colocated servers, low-latency API execution."
  - "Friction 2: Rate Reversals": "**Risk:** Spreads can compress or flip, forcing the trader to pay on both sides." "**Engineered Fix:** Real-time monitoring and auto-close triggers."
  - "Friction 3: Trading Commissions": "**Risk:** 4 orders required (open/close x2). Total commissions heavily impact breakeven time." "**Breakeven Math:**" fraction "Time = Total Commissions / (Spread × Payments per Day)". "**Example:** Taker fees (0.20% total) require >2.2 days holding to break even on a 0.03% spread."

Article check: breakeven formula and 2.22 days correct (0.20% / (0.03% × 3)). Article also gives the maker case: 4 × 0.02% = 0.08% → 0.89 days. **Slide typo**: "Asynchronous execution execution" → redraw as "Asynchronous execution instantly erases funding profits." The "0.01%-1%" range merges two article figures: normally 0.01-0.05%, up to 0.5-1% in volatile moments; redraw as "usually 0.01-0.05%, up to 0.5-1% in volatility". Article `should_close(current_spread, entry_spread, min_spread=0.0001, trading_costs=0.0005)`: close if spread < 0.01% or < 0.05% costs.

**Sub-scenes (slide > 90 s)** (the narration covers the cards in order 1, 3, 2)
- 7a Price divergence 457.0 to 521.8 (card 1)
- 7b Commissions and breakeven 521.8 to 605.9 (card 3)
- 7c Rate reversals and `should_close` 605.9 to 640.8 (card 2)

**Beats**
- 457.0 "this is exactly where the illusion of free money violently shatters" (glass shatter gag)
- 470.0 "deconstruct the risks here, starting with the execution illusion"
- 477.8 "open a short on Bybit and a long on Binance, the data has to physically travel" (two packets racing to two servers)
- 483.9 "The price of Ethereum on these two platforms is not perfectly identical"; 487.5 "usually ... a tiny fraction of a percent"
- 491.8 "during high volatility ... the price divergence ... can blow up to 0.5% or even a full 1%"
- 506.2 "If you do not get filled on both sides at the exact same millisecond, you suffer slippage"
- 514.7 "a tiny bit of slippage will just instantly wipe out weeks of potential funding profit"
- 521.8 "let's say my execution is absolutely flawless"; 526.2 "trading commissions"
- 532.4 "open a long, open a short ... close that long and close that short"; 538.5 "four separate trips" (4 order tickets stack up)
- 551.8 "only maker orders ... 0.02% per trade"; 562.8 "across four legs, that's 0.08%"
- 576.6 "taker fees ... around 0.05% per trade"; 580.7 "0.20% in total round-trip commissions"
- 586.3 "break-even time for this exact taker fee scenario"; 594.9 "hold that position for over 2.2 days" (fraction animates, result 2.2 d)
- 605.9 "the funding rate isn't fixed"; 607.7 "12 hours later ... the spread collapses, or worse, it reverses"; 614.1 "paying on both exchanges"
- 617.1 "forced to close the position before my 2.2-day break-even" / 620.6 "lose money on the so-called risk-free arbitrage"
- 623.9 "a Python function called should_close"; 631.0 "constantly monitor the live spread"; 634.1 "falls below a minimum trading cost threshold ... automatically eject you"

## Slide 8: Pitfalls Part II: Margin & Liquidation. 640.8 to 770.1 (129.3 s)

**Content**
- Title (light grey thin): "Pitfalls Part II: Margin & Liquidation".
- Left illustration (redraw as a simple line drawing): a riveted metal sign "$100K Exposure" sitting on a stone beam that is cracking in the middle (shards flying) between two Greek columns. Left column: an orange zigzag arrow plunging down past it, a dashed orange line on the ground, label box (orange outline) "Unrealized Losses / (Requires Maintenance Margin)". Right column: a steel vault/safe with a padlock and gears on top of it, dashed blue line, label box (blue outline) "Locked Profits / (Cannot Offset)".
- Right text (mono):
  - "**The Collateral Trap:** Mirrored positions cannot share margin across different exchanges."
  - "**Capital Inefficiency:** A $100K position at 5x leverage requires $40K total locked collateral ($20K per exchange). Article estimated ROC: ~6.75% per month."
  - "**Liquidation Risk:** As the underlying asset price swings, one exchange generates deep unrealized losses requiring margin maintenance, while the offsetting profit remains trapped on the other exchange."
- Box "Protocol Solutions" with checkbox rows: "Maintain minimum 2x margin reserve." / "Implement strict margin level alerts." / "Execute automated inter-exchange rebalancing transfers."

Article check: matches (ROC = $2,700 / $40,000 = 6.75% per month; at 10x collateral drops to $20K and ROC rises to 13.5%, with more liquidation risk). The 15% ETH spike in the narration is the hosts' own scenario, not from the article.

**Sub-scenes (slide > 90 s)**
- 8a Capital locked 640.8 to 690.5 ($20K + $20K buckets, ROC 6.75%)
- 8b Asymmetric liquidation story 690.5 to 770.1 (ETH +15%, Bybit short liquidated, hedge gone, naked long)

**Beats**
- 640.8 "capital efficiency ... the part of the article that genuinely terrified me"
- 655.1 "if I have a $100,000 position, how much of my actual cash is tied up?"; 662.7 "The article assumes 5x leverage"
- 665.8 "$20,000 of collateral on the Binance side"; 673.4 "another $20,000 ... on the Bybit side"; 676.8 "$40,000 in total" (two buckets fill)
- 680.0 "$2,700 monthly profit on $40,000 ... ROC of 6.75% per month"
- 697.1 "split into two entirely separate buckets that cannot talk to each other" (wall between buckets)
- 702.9 "Asymmetrical liquidation ... the absolute silent killer"
- 712.0 "Ethereum suddenly spikes 15% in an hour"; 716.8 "Your long position on Binance is highly profitable"; 721.4 "your short position on Bybit is severely underwater"
- 728.0 "Your net P&L is zero"; 729.8 "Bybit's risk engine does not care about your Binance account"
- 738.2 "Bybit issues a margin call"; 744.8 "they liquidate you"; 745.9 "moving funds on chain can take minutes, which is an eternity" (slow transfer truck gag)
- 751.0 "the moment Bybit liquidates your short, your hedge is totally destroyed"; 754.6 "now naked long on Binance at the exact top" (beam breaks)
- 765.3 "you can't just set this and forget it. You need a hyper-vigilant automated system" (Protocol Solutions checkboxes tick)

## Slide 9: Data Infrastructure: The Monitoring System. 770.1 to 821.2 (51.1 s)

**Content**
- Title (light grey thin): "Data Infrastructure: The Monitoring System".
- Left column: three outlined step boxes with grey down arrows between them, caption under each:
  - "1. Fetch (Async)" / "Query APIs across all target exchanges simultaneously."
  - "2. Group" / "Aggregate all rate snapshots by symbol (e.g., ETHUSDT)."
  - "3. Calculate" (grey arrow from this box right into the terminal) / "Sort rates to identify the lowest (Long target) and highest (Short target) to derive the Spread."
- Right: box "Scanner Output", black terminal body, "Terminal" header and a dashed rule. Rows (Long text in blue, Short text in orange):
  - "ETHUSDT | Long: Binance (0.010%) | Short: Bybit (0.040%) | Spread: 0.030% | APR: 32.9%"
  - "BTCUSDT | Long: OKX (0.008%) | Short: Binance (0.020%) | Spread: 0.012% | APR: 13.1%"
  - "SOLUSDT | Long: Binance (0.015%) | Short: dYdX (0.055%) | Spread: 0.040% | APR: 43.8%"

Article check: values match the article sample output; APR = spread × 3 × 365 (0.03% → 32.9%). **Layout glitch**: the slide prints "Spread" twice per row; redraw it once. The article's 4th row (and the one the hosts quote) is missing: "ARBUSDT | Long: Bybit (0.005%) | Short: OKX (0.030%) | Spread: 0.025% | APR: 27.4%". Add it so the 805 s beat has something to land on. Article class: `FundingMonitor` (ccxt.pro, `fetch_funding_rate`, `asyncio.gather`), snapshots `FundingSnapshot(exchange, symbol, rate, next_funding_time, timestamp)`.

**Beats**
- 770.1 "which leads to the next section"; 773.0 "monitoring all this data in real time"
- 776.8 "a serious data collection engine capable of parallel processing"
- 780.5 "a funding monitor script utilizing asynchronous libraries" (step 1 box)
- 789.2 "pings multiple exchange APIs concurrently" (fan-out lines to exchange icons)
- 792.9 "grabs the current rates, calculates the time until the next payout"; 796.4 "groups everything by the trading symbol" (step 2)
- 798.4 "calculates the spread to rank the highest payer against the lowest receiver" (step 3, terminal rows print)
- 805.9 "an ARB-USDT spread between Bybit and OKX"; 810.0 "a theoretical 27.4% APR" (ARB row highlight)
- 815.0 "snapshot illustrative examples, not live trading advice"

## Slide 10: Execution & Lifecycle Management. 821.2 to 948.8 (127.6 s)

**Content**
- Title (light grey thin): "Execution & Lifecycle Management".
- Full-width outlined header bar (mono): "Phase 1: Entry (Simultaneous Opening)". Below it 3 dark boxes left to right with grey arrows:
  - "1. Check price spread immediately before execution." → "2. Reject if divergence > max slippage allowance." → "3. Fire async Market Buy + Market Sell simultaneously."
- Header bar: "Phase 2: Continuous Monitoring (Closing Conditions)". Below it a loop:
  - Left box "Trigger A: Funding spread contracts below minimum profitability threshold." → arrow right into the center.
  - Center box (orange outline, dark brown fill): "System Action:" (orange) "Upon any trigger, fire async Market Orders to auto-close both legs immediately."
  - Right box "Trigger B: Total unrealized loss (Price Divergence) exceeds safety limits." → arrow left into the center.
  - Bottom center box "Trigger C: Margin balance on either venue falls below safe levels."
  - Elbow arrows: from Trigger B down and left into Trigger C; from Trigger C left and up into Trigger A (a cycle around the center).

Article check: matches `execute_arbitrage(..., max_slippage_pct=0.05)` (price spread = |long ask − short bid| / long ask, abort if larger; `asyncio.gather` of market buy + market sell) and `monitor_and_manage(..., min_spread=0.0001, max_unrealized_loss_pct=2.0, check_interval=60)`. Note: the article's code fetches balances but only auto-closes on spread and unrealized loss; margin is a prose rule ("rebalance or close").

**Sub-scenes (slide > 90 s)**
- 10a Entry guard 821.2 to 859.4 (Phase 1 row)
- 10b The 60-second sleep critique 859.4 to 920.1 (hosts' own critique; show a sleeping bot vs a 10 s flash crash)
- 10c Event-driven monitoring 920.1 to 948.8 (Phase 2 loop, three triggers)

**Beats**
- 821.2 "The spotting of the spread is only half a battle"; 826.1 "you have to capture it instantly"
- 833.8 "an execute_arbitrage function ... the need for speed and strict parameters"
- 843.3 "checks the price spread between the ask on one exchange and the bid on the other against a max_slippage_pct limit" (box 1, box 2)
- 852.8 "If the depth isn't there, or the prices have diverged ... the script aborts" (red X on box 2 path)
- 859.4 "I have to push back heavily on the article's code examples"; 868.3 "a basic while true loop with a sleep interval of 60 seconds"
- 877.9 "goes to sleep for a full minute" (bot with Zzz); 881.9 "a 10 second flash crash"; 887.0 "a 60 second sleep timer is financial suicide"
- 895.8 "The article's code is strictly illustrative"; 901.6 "check spread, check margin, execute loop"
- 920.1 "Real continuous position management systems don't poll"; 924.1 "They use event driven websocket streams"; 926.2 "reacting in milliseconds"
- 930.6 "constantly monitor three things"; 933.0 "the funding rate spread (A), your margin balances (C) and price divergence limits (B)" (triggers light up in spoken order)

## Slide 11: Advanced Variants: Spot-Perp Carry. 948.8 to 1042.1 (93.3 s)

**Content**
- Title (light grey thin): "Advanced Variants: Spot-Perp Carry".
- Outlined box (mono): "Mechanic: Hold Spot (no funding) + Short Perpetual (receives funding) executed on a single exchange."
- Comparison table (mono): blank corner | "Cross-Exchange" (steel grey-blue header) | "Spot-Perp Carry" (cobalt header).
  - "Margin Risk" | "High, bifurcated across venues." | "Zero cross-exchange risk, simplified collateral."
  - "Viability Phase" | "Always viable, regardless of market direction." | "Only functions when funding is positive (longs pay shorts)." ("longs pay shorts" tinted tan)
  - "Market Environment" | "Opportunistic spikes across all phases." | "Typically viable ~70% of the time during bull cycles."
  - "Economics" | "Requires overcoming 4x order fees." | "Overcomes Spot Fee + Perp Fee vs. Daily Income."

Article check: mostly matches. **Overstatement**: "Always viable, regardless of market direction" for cross-exchange; correct version: "Works in any market direction, but only while a cross-venue spread exists that beats costs." Article example for spot-perp: `spot_perp_carry(0.0003)`, spot fee 0.1%, perp fee 0.05%, fees (0.1% + 0.05%) × 2 = 0.3%, daily 0.09%, monthly 2.7%, annualized 32.9%, breakeven 3.3 days.

**Sub-scenes (slide > 90 s, borderline)**
- 11a Mechanic 948.8 to 1002.2 (one exchange, buy spot + short perp, unified account)
- 11b The catch 1002.2 to 1042.1 (only positive funding, ~70% in bull markets)

**Beats**
- 948.8 "the article introduces in its advanced variant section"; 954.0 "spot perp arbitrage, which is a major risk reducer"
- 963.2 "instead of two exchanges, you do everything on one"; 967.7 "You buy spot Ethereum"; 972.3 "on that exact same ... account, you short the Ethereum perpetual future" (two legs inside one box)
- 978.6 "the cross exchange liquidation nightmare just evaporates" (wall between buckets dissolves)
- 987.0 "unrealized profit from your spot holdings instantly offsets the margin requirements" (see errors: depends on account margin mode)
- 1006.1 "it has a massive disadvantage"; 1008.3 "It only works when the funding rate is positive"
- 1012.5 "if ... the funding rate goes negative, shorts start paying longs"; 1022.5 "you would be paying the funding fee"
- 1031.2 "positive funding environments occur roughly 70% of the time during extended bull markets" (70% gauge)
- 1039.4 "a powerful strategy when the sun is shining" (sun icon)

## Slide 12: Multi-Venue Routing & Predictive Modeling. 1042.1 to 1147.0 (104.9 s)

**Content**
- Title (mono, white): "Multi-Venue Routing & Predictive Modeling". Finer grid background.
- Left half "Multi-Exchange Rotation" (mono): hub-and-spoke diagram: big grey circle "Execution Engine" in the center, five grey circles around it "VENUE A" (top), "VENUE B" (right), "VENUE C" (bottom right), "VENUE D" (bottom left), "VENUE E" (left). Paired two-way arrows between the engine and each venue; curved two-way arrows between neighbors around the pentagon (A-B, B-C, C-D, D-E, E-A).
  - Text: "Scan 5+ venues concurrently → Find maximum spread → Validate liquidity and depth → Execute." / "System continuously rescans and rotates capital as spreads shift across the market."
- Vertical divider.
- Right half "Rate Prediction (Front-Running)" (mono):
  - "PREMIUM INDEX UPDATE": orange bar with dense tick marks in 4 segments labelled "1 Minute" ×4, then a grey continuation.
  - Diagonal grey arrows from the minute segments down to "FUNDING INTERVAL PAYMENT": cobalt bar with 4 segments labelled "8 Hours" ×4.
  - "**The Math:** Funding = f(Premium Index)." / "**The Advantage:** The Premium Index updates every minute, while funding intervals are typically 8 hours." / "**The Execution:** Predictive systems calculate the next funding rate before payment, allowing early entry before the spread attracts competing arbitrageurs."

Article check: matches `find_best_pair(rates, min_spread=0.0002)` (5-step algorithm: collect, max spread, check liquidity/depth, open if > threshold, rescan and rotate) and `predict_next_funding`. **Wording**: "Front-Running" is a misnomer (front-running means trading ahead of known client orders); the article only says "predict". Redraw heading as "Rate Prediction". Use the article's formula: Binance `FR = clamp(Premium − Interest, −0.05%, +0.05%) + Interest`, Interest = 0.01% per 8 h. The minute ticks and 8 h segments are schematic (not to scale).

**Sub-scenes (slide > 90 s)**
- 12a Multi-exchange rotation 1042.1 to 1071.7 (left half)
- 12b Funding prediction 1071.7 to 1147.0 (right half; clamp formula; "hour 7, minute 59")

**Beats**
- 1042.1 "making the strategy more complex"; 1046.2 "multi-exchange arbitrage"; 1048.9 "a logic flow called find_best_pair"
- 1054.8 "Instead of just staring at Binance and Bybit, a sophisticated algorithm scans five or more exchanges concurrently" (venues light up)
- 1062.7 "dynamically rotates capital, closing positions on a narrowing spread, and instantly deploying ... to a widening spread" (capital token hops between venue pairs)
- 1071.7 "my absolute favorite nuance"; 1075.9 "Predicting the funding rate before it officially happens"
- 1083.4 "locked at the eight hour mark, but the math ... is updating continuously"
- 1089.6 "The premium index is calculated every single minute" (orange ticks run)
- 1094.3 "exchanges apply a clamping formula"; 1100.2 "prevents the final rate from exceeding certain upper or lower bounds" (show clamp band ±0.05%)
- 1113.5 "if we are at hour seven, minute 59 ... knows with near absolute mathematical certainty" (clock at 7:59)
- 1129.5 "If the premium index hits the clamp early in the eight hour window ... mathematically impossible for the final average to drop below a certain threshold"
- 1138.1 "it front runs the eight hour clock"; 1140.0 "opens positions and locks in the spread before slower arbitrageurs catch on"

## Slide 13: Institutional-Grade Infrastructure. 1147.0 to 1263.4 (116.4 s)

**Content**
- Title (mono, white): "Institutional-Grade Infrastructure".
- "Technical Specifications Matrix" table: "Component | Minimum | Optimal" (Optimal header cobalt):
  - "Server | Cloud VPS | Colocated near exchanges"
  - "Latency | < 500ms | < 50ms"
  - "Data Feed | REST API Polling | WebSocket Streaming"
- "Economics of Scale (Illustrative 5x Leverage, 0.03% Spread)": a wedge bar thickening left to right in three segments (grey → mid blue → deep cobalt) separated by white ticks. Labels under the segments:
  - "$10K Capital: ~$675/mo (May not justify infrastructure costs)."
  - "$50K Capital: ~$3,375/mo (Optimal starting tier)."
  - "$200K Capital: ~$13,500/mo (Institutional tier)."
- Box: "Insight: Return on Capital (ROC) remains constant, but absolute profit must scale to justify fixed latency and infrastructure costs."

Article check: numbers match the article (positions $25K / $125K / $500K at 5x, ROC ~6.75% each). The article table also has: API keys 2 exchanges / 5+ exchanges; Capital per exchange $10K each / $50K+ each; Monitoring "Logs + alerts" / "Dashboard + auto-rebalancing". **NotebookLM additions**: tier labels "Optimal starting tier" and "Institutional tier" are not in the article; drop them or keep only "$10K: may not justify infrastructure costs" (which is the article's point).

**Sub-scenes (slide > 90 s)**
- 13a Tech stack 1147.0 to 1209.7 (matrix rows: VPS/REST/<500 ms vs colocated/WebSocket/<50 ms)
- 13b Economics of scale 1209.7 to 1263.4 (wedge bar; $675 vs server bill)

**Beats**
- 1147.0 "let's get real"; 1155.8 "executing via WebSockets in milliseconds"; 1159.3 "you cannot run this on a dusty old laptop over public Wi-Fi" (gag)
- 1167.3 "minimum versus optimal tech stacks"
- 1171.9 "a cloud virtual private server or VPS, utilizing basic REST APIs" (Minimum column); 1181.8 "under 500 milliseconds"
- 1184.6 "still dangerously slow if a flash crash happens"
- 1189.7 "the optimal setup ... requires co-located servers"; 1198.7 "the exact same geographic data center as the exchange's matching engine"; 1204.2 "sub 50 millisecond latency"; 1206.6 "WebSocket data streaming, redundant connections" (Optimal column)
- 1209.7 "the brutal economics of scale"; 1214.9 "comparing a $10,000 stack to a $200,000 stack"
- 1220.9 "the theoretical return on capital, that 6.75% ... might be identical regardless of your stack size"
- 1232.4 "On $10,000 of capital ... only about $675 a month" (small segment pulses)
- 1241.7 "premium monthly fees for a co-located server, your data subscriptions, API limits"; 1251.9 "operating at a massive loss" (see errors: overstatement)
- 1254.6 "cannot cover the heavy infrastructure overhead"; 1261.5 "You need massive scale"

## Slide 14: Summary: The Arbitrage Reality. 1263.4 to 1334.0 (70.6 s)

**Content**
- Title (mono, white): "Summary: The Arbitrage Reality".
- White-outlined black box: "The Reality: Funding rate arbitrage is a pure, structural, delta-neutral strategy. It eliminates price prediction entirely, replacing it with a demand for intense technical engineering."
- "Takeaway Dashboard" (grey header) 2×2 grid:
  - "1. Speed" / "Simultaneous execution across venues is non-negotiable."
  - "2. Infrastructure" / "Requires real-time, multi-venue data streams."
  - "3. Risk Control" / "Demands margin isolation and ruthless auto-close algorithms."
  - "4. Capital" / "Scale is strictly required to offset fixed latency/server costs."
- Cobalt banner: "Spreads are ephemeral. The system's only job is to automatically find and extract them before they vanish."

Article check: matches the article conclusion (article order: Infrastructure, Execution speed, Risk management, Capital).

**Beats**
- 1263.4 "To synthesize this whole reality check"; 1266.7 "a structural delta neutral strategy" (Reality box)
- 1271.1 "the barrier to entry is entirely technological and capital based"
- 1276.2 "blistering execution speed (1), hyper-vigilant risk management (3) ... robust institutional grade infrastructure (2)" (tiles light in spoken order; 4 Capital already implied)
- 1288.1 "these spreads aren't static"; 1290.7 "They widen violently during market volatility, but they vanish almost entirely when the market goes calm" (banner)
- 1296.6 closing thought: "what happens as more and more sophisticated algorithms enter the space?"
- 1315.7 "Does ... everyone building these hyper-fast, co-located arbitrage bots eventually squeeze these structural profits down to zero?" (spread line shrinking toward 0)
- 1323.5 "an arms race where the prize just keeps shrinking"; 1326.7 "a fascinating paradox of efficient markets"; 1330.2 "The better the bots get, the less money there is to make"

## Slide 15: Sources & Literature. 1334.0 to 1340.65 (6.7 s)

**Content**
- Title (mono, white): "Sources & Literature".
- "Primary Source:" (grey) "Soloviov, E. (2026). 'Funding Rate Arbitrage Across Exchanges: How to Profit from Rate Differences'. MarketMaker.cc."
- "Protocol References:" (grey), list with dashes: "Binance – Funding Rate History & Introduction" / "Bybit – Understanding Funding Rates" / "dYdX – Perpetual Funding Rate Mechanism" / "Coinglass – Funding Rate Monitor".
- Footer (mono, small grey): "Disclaimer: This deck is an editorial draft. Sample code is illustrative and not production-ready. Financial figures are gross theoretical scenarios before fees/slippage. This document does not constitute investment advice. _" (blinking cursor).

Article check: matches the article's Useful Links and citation.

**Beats**
- 1334.0 "Thank you for joining us on this deep dive" (slide in)
- 1336.1 "Keep questioning how the mechanics of these markets actually work under the hood" (end card)

---

## NotebookLM errors and corrections (use the corrected version)

Slides:
1. Slide 7: typo "Asynchronous execution execution" → "Asynchronous execution instantly erases funding profits."; "(0.01%-1% variance)" → "usually 0.01-0.05%, up to 0.5-1% in volatile moments".
2. Slide 9: "Spread" duplicated in every terminal row (draw once); the ARBUSDT row from the article is missing (add: Long Bybit 0.005%, Short OKX 0.030%, Spread 0.025%, APR 27.4%).
3. Slide 11: "Always viable, regardless of market direction" (cross-exchange) is an overstatement → "works in any market direction, but only while a cross-venue spread beats costs".
4. Slide 12: "Front-Running" is the wrong term → "Rate Prediction". Timeline bars are schematic.
5. Slide 13: tier labels "Optimal starting tier" / "Institutional tier" are invented; the article only says $10K "may not justify infrastructure costs and time".

Narration:
6. 345.6 "Suddenly you have a massive 0.12% spread" after naming Binance 0.1% and Bybit 0.2%: Binance vs Bybit is 0.10%. The 0.12% is the widest cross-venue spread in that row (Bybit 0.2% vs OKX 0.08%). On screen, show 0.12% coming from Bybit vs OKX.
7. 17.0 "a 6% monthly return": the article figure is ~6.75% ROC per month, gross, at 5x leverage, before fees and slippage.
8. 245.5 "Bybit ... assigns different weights to the underlying spot liquidity": not in the article. The article only says Bybit/OKX use the premium index and interest rate "with different weights and averaging periods". Do not draw "spot liquidity weights".
9. 987.0 "unrealized profit from your spot holdings instantly offsets the margin requirements": the article only says "everything on one exchange, simpler margin management". Spot profit offsetting perp margin needs a unified/portfolio margin account mode. Keep the visual as "one account, simpler collateral".
10. 1113.5 to 1138.1 "near absolute mathematical certainty", "front runs": hosts' exaggeration. The article says the premium updates every minute vs every 8 h, so the next rate can be predicted minutes or hours before payment. Captions can keep the words, but on-screen text says "predict".
11. 1251.9 "You are operating at a massive loss" at $10K: the article says the absolute profit "may not justify infrastructure costs and time", not a loss. Show it as "$675/mo vs fixed costs", without a loss figure.
12. 188.6 to 196.7 "professional participants ... which naturally leans short": the article says only that Bybit/OKX have more professional participants and a different long/short balance. Don't label their crowd "short".
13. 868.3 "a sleep interval of 60 seconds": correct (`check_interval=60` in `monitor_and_manage`); the 60 s sleep critique is the hosts' own commentary.

## Timing notes

`sync_slides.py` (defaults) degenerated ("showed 9/15 slides, longest held 57%") and fell back to an even split (`timeline_auto_evensplit.json`, about 89 s per slide). That split is wrong almost everywhere (slide 2 would start at 89 s, slide 8 at 625 s vs the real 640.8 s, slide 11 at 894 s vs 948.8 s).

`slide_starts.json` is set by hand from topic transitions. The deck order matches the narration order 1:1. Inside slide 7 the narration covers card 1, card 3, then card 2.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | intro | high |
| 2 Structural Divergence | 115.3 | "So, keeping that in mind, let's unpack this foundation" (end of disclaimer) | high |
| 3 Four Drivers | 174.9 | "four main causes for this divergence" | high |
| 4 Spread table | 308.6 | "the inefficiencies really scale with the market's overall enthusiasm" (then the calm/bull example) | high |
| 5 Mirror Position | 352.0 | "That brings us to the basic arbitrage mechanics" | high |
| 6 Potential Yield | 421.8 | "if we run the theoretical math on that, three payouts a day" | medium (could start at 417.0 "netting the 0.03%", which also fits slide 5) |
| 7 Execution Frictions | 457.0 | "this is exactly where the illusion of free money violently shatters" | high |
| 8 Margin & Liquidation | 640.8 | "the fees are bad, but I really want to talk about capital efficiency" | high |
| 9 Monitoring System | 770.1 | "which leads to the next section ... monitoring all this data in real time" | high |
| 10 Execution & Lifecycle | 821.2 | "The spotting of the spread is only half a battle" | high |
| 11 Spot-Perp Carry | 948.8 | "that is exactly what the article introduces in its advanced variant section" | high |
| 12 Multi-Venue & Prediction | 1042.1 | "What about going the other direction, making the strategy more complex?" | high |
| 13 Infrastructure | 1147.0 | "Okay, let's get real for a second" | high |
| 14 Summary | 1263.4 | "To synthesize this whole reality check" | high |
| 15 Sources | 1334.0 | not discussed; placed on the sign-off "Thank you for joining us" | low (6.7 s; the closing "arms race" thought 1296.6 to 1334.0 stays on slide 14) |
