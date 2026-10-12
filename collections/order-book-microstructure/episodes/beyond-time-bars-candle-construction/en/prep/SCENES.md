# beyond-time-bars-candle-construction (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
14-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/beyond-time-bars-candle-construction.en.md` (title "Bar Types and Aggregation Methods for Algorithmic Trading", 2026-03-22, suenot / Eugen Soloviov).

- Audio: `input/notebooklm-sources/beyond-time-bars-candle-construction/en/audio.m4a`, 1407.45 s (23:27.5), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, per-word start/end in `words[]`). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_014.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: cream/off-white blueprint paper with a faint fine grid, navy ink (#1F2A3A) lines and text, teal/cyan accent (#2BB3C8), amber (#E0A030), green (#3FA34D) for up/buy, red (#E04848) for down/sell. Monospace labels everywhere, light grotesk titles, corner-bracket "frame" marks around each panel, dark navy header bars on slides 6 to 9. A small "Pending Primary/Editorial Review" tag bottom right on most slides and the "Gemini Notebook" watermark: both are NotebookLM chrome, do not redraw.

The hosts read NotebookLM's review boilerplate aloud (63.4 to 89.3, 1378.2): "illustrations from the text, pending human editorial, mathematical, and primary source review ... not investment advice". Keep it as one short on-screen line at most.

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "Haikin Ashi" / "high kanashi" (1323.8) = Heikin-Ashi, "shelling point" = Schelling point, "Qsum" = CUSUM, "Vib" = VIB, "mint ticks and max ticks" (886.5) = `min_ticks` / `max_ticks`, "100-bit coin" = 100 BTC, "end unit" (526.5) = N units, "end lines" (731.8) = N lines, "last and closed base bars" (1045.6) = last N closed base bars, "last 61 minute bars" (1050.4, 1071.1, 1229.6) = last 60 one-minute bars, "237 PM" (1071.1) = 2:37 PM, "market shop" (611.3) = market chop, "aggressive by volume minus aggressive cell volume" (992.4) = aggressive buy volume minus aggressive sell volume, "Binance ag trades" (1005.5) = Binance aggTrades, "TIC" (1266.0) = tick, "rank" (1273.7) = Renko, "positioning Q or PIQ" (1310.1) = position-in-queue (PIQ) triggers, "Eugene Solofyoff" (1372.8) = Eugen Soloviov, "MLFIN lab" = mlfinlab.

---

## Slide 1: TL;DR. 0.0 to 168.1 (168.1 s)

**Content**
- Left: mono label "OHLCV ARCHITECTURAL DISSOLUTION". Four isometric candlesticks (green; green body split into stacked green/amber/red blocks; red; red/green) "explode" into coloured leader lines (cyan, amber, green, red, navy) that route into a column grid labelled "RIGID 17x3 DATA MATRIX (51 GEOMETRIC BLOCKS)": 4 columns of small isometric cubes, 17 rows. Column 1 is numbered 01..17 (the slide skips 12); columns 2 to 4 carry garbled codes (013, 014, A21, 7x0 ...). Treat the cell labels as decorative noise and redraw a clean 17 × 3 grid (rows = bar types, columns = Calendar / Rolling / Adaptive).
- Right: title "H2 — TL;DR" and five bordered boxes:
  1. "Candle construction is governed by two independent axes: bar **type** and **aggregation method**."
  2. "17 base bar types: time, tick, volume, dollar, Renko, range, volatility, Heikin-Ashi, Kagi, Line Break, P&F, tick imbalance (TIB), volume imbalance (VIB), run, CUSUM, entropy, delta."
  3. "3 aggregation methods: calendar-aligned, rolling window, adaptive rolling."
  4. "17 × 3 = 51 combinations. Most systems use only 1 (calendar time bars). The other 50 are untapped."
  5. "**Recommendation:** Use combinations in layers— rolling time for signals, calendar for structure, information-driven for microstructure."

Article check: all five boxes match the article TL;DR.

**Sub-scenes** (168 s, split)
- 1a 0.0 to 103.5, cold open + source: 0.0 "Imagine buying ... a million dollar high-performance sports car"; 5.4 "leave it in first gear for its entire life"; 10.8 "because you didn't know the other gears even existed" (gearbox gag: only gear 1 used); 16.1 "most algorithmic traders ... rely on standard, time-based candlestick charts"; 30.8 "51 different ways to view market reality" (counter to 51); 41.7 "how the underlying architecture of a candlestick is actually built"; 55.0 article title read aloud "Bar Types and Aggregation Methods for Algorithmic Trading" (title card); 63.4 to 84.9 review boilerplate (one small "illustrations, not investment advice" line); 89.3 "every candlestick chart you see on an exchange UI is built exactly the same way".
- 1b 103.5 to 168.1, TL;DR: 103.5 "a high-level TLDR"; 112.0 "they conflate two entirely independent decisions"; 118.7 "this article separates them into two distinct axes" (box 1); 125.0 "the base bar type, and there are 17 of them" (box 2; 17 rows drop in); 131.5 "the aggregation method, and there are three" (box 3; 3 columns); 136.6 "17 ... multiplied by three ... equals 51 total combinations" (box 4; grid fills, counter 51); 145.1 "most people just use one, calendar-aligned time bars" (one cell lit) / 149.3 "That leaves 50 combinations completely untapped" (other 50 dim); 151.6 "an ice cream parlor with 51 flavors, but the entire world just stubbornly eats vanilla" (gag); 159.0 "use multiple combinations in layered architectures" (box 5).

## Slide 2: Two Axes of Candle Construction. 168.1 to 201.2 (33.1 s)

**Content**
- Title "H2 — Two Axes of Candle Construction".
- Left, two bracketed question boxes: "How do you decide when a new bar closes? (Time, N trades, Price movement, Information arrival)." / "How do you compose base bars into higher timeframes? (Calendar boundaries, Rolling N bars, Volatility adaptive)."
- Center: a matrix chart. Y-axis "Y-Axis" = bar types (one row each), X-axis "X-Axis", caption "**Axis 2:** Aggregation Method (3 Methods)", three column ticks "Calendar Boundaries 'CAB'", "Rolling N Bars 'NB'", "Volatility Adaptive 'VA'".
- Highlighted cells with dashed callouts: cyan cell bottom-left (Time × Calendar) → "The Standard 1-Hour Candle"; amber cell (Tick × Calendar) → "Calendar-aligned tick bars"; green cell (Volume × Rolling) → "Rolling volume bars"; red cell (Delta × Adaptive) → "Adaptive delta bars".

**NotebookLM errors (flag):** the Y-axis labels are garbage and duplicated: Time, Tick, Volume, Range, Renko, Kagi, Point & Figure, "Volumen", Delta, Information Arrival, "Hyrometrole", "Lao_Kaga", Range, Volume, Tick, Time; and the grid has about 12 columns instead of 3. Redraw with the real 17 rows (Time, Tick, Volume, Dollar, Renko, Range, Volatility, Heikin-Ashi, Kagi, Line Break, P&F, TIB, VIB, Run, CUSUM, Entropy, Delta) and exactly 3 columns (Calendar, Rolling, Adaptive). The "CAB / NB / VA" abbreviations are not in the article; drop them. The four highlighted examples are correct (article: calendar-aligned tick bars = aggregate tick bars closed between 14:00 and 14:59; rolling volume bars = last 24 volume bars; adaptive delta bars = volatility-driven window over delta bars; standard 1-hour candle = time bars + calendar alignment).

**Beats**
- 168.1 "Let's really explore these two axes of candle construction" (slide in)
- 171.7 "axis one ... what kind of atomic base bar are you building? And what is this specific mathematical rule that causes it to close?" (left box 1, Y-axis rows)
- 183.2 "Axis two takes those closed base bars and asks, how do you aggregate them into a higher time frame?" (box 2, X-axis)
- 189.7 "you can completely mix and match them"; 193.7 "rolling volume bars or ... adaptive delta bars" (green cell, red cell light up)

## Slide 3: 1. Time Bars / 2–4. Activity-Based Bars. 201.2 to 509.6 (308.4 s)

**Content**
- Left header "H2 — 1. Time Bars (Standard)", panel "1. Time Bars": a sine-wave price line with candlesticks under evenly spaced vertical time gridlines; cyan callout "Uneven information: 200 trades (quiet) vs. 50,000 trades (spikes)."; dark terminal box: "Cold Start: Restart at 14:37:05 → first valid 1h candle at 16:00:00 (82m 55s dead time)".
- Right header "H2 — 2–4. Activity-Based Bars":
  - "H3 — 2. Tick Bars": a timeline of trade dots grouped by brackets of equal count; "Bar closes after N trades. Equal opinions."; small icon: 6 dots → arrow → 3 squares.
  - "H3 — 3. Volume Bars": a block headed "100 BTC" made of 10 × 7 cyan cells, one cell labelled "1 BTC"; "Bar closes after base-asset units."
  - "H3 — 4. Dollar Bars": a balance scale, left pan "10 ETH at $1,000" "= $10,000", right pan (red) "2.5 ETH at $4,000" "= $10,000", balanced; "Bar closes after USD/USDT notional units. Robust to price regime shifts."
- Bottom left "H3 — Terminal dashboard": garbled table (headers "Acceipt Wenk N Sdlrt %", rows Tick / Volume / Dollar with mixed numbers). **NotebookLM error: unreadable duplicate of the threshold table; drop it.**
- Bottom right "H3 — Choosing the Threshold", table "Illustrative BTCUSDT Thresholds": Tick | 1,000 trades = ~1m | 50,000 trades = ~1h; Volume | 100 BTC = ~2-3m | 2,400 BTC = ~1h; Dollar | $1M = ~1m | $50M = ~1h.

Article check: matches. Article threshold table also has bars/day: Tick 1,000 trades ~1,400/day (~1m), 50,000 trades ~28/day (~1h); Volume 100 BTC ~600/day (~2-3m), 2,400 BTC ~25/day (~1h); Dollar $1M ~1,400/day (~1m), $50M ~28/day (~1h); "During a rally or crash, activity-based bars will produce 5-10x more bars than usual". Article: time bars' crowd value = a Schelling point; tick-bar returns closer to normally distributed; Lopez de Prado (2018) recommends dollar bars as the default. Cold-start code: wait = (60 − minute)·60 − second + 3600 s; restart 14:37:05 → 16:00:00 = 82 min 55 s (verified).

**Sub-scenes** (308 s, split into 4)
- 3a 201.2 to 314.2, time bars: 201.2 "dive into axis one, starting with the absolute standard. Number one, time bars"; 211.2 "A bar closes when a specific amount of time has passed, like ... one hour"; 218.9 "uneven information density"; 224.3 "a quiet 200 trade hour during a sleepy Asian session ... the exact same as a frantic 50,000 trade hour during a major macroeconomic announcement" (two equal-width candles, one with 200 dots, one with 50,000); 239.9 "a data diet that oscillates wildly between starving and overstuffed"; 249.6 "the cold start problem"; 255.3 "restart ... at 14:37 and 5 seconds" (clock); 261.8 "wait time for the rest of that partial hour plus one full hour" (timeline: partial 14:37:05 to 15:00, full 15:00 to 16:00); 270.1 "82 minutes and 55 seconds just for your first valid hourly candle" (counter); 282.7 "Aren't time boundaries still incredibly valuable ... a Schelling point for crowd behavior?"; 296.4 "the Schelling point is their main, perhaps only real value"; 304.4 "where the support and resistance lines are being drawn".
- 3b 314.2 to 382.2, tick bars: 314.2 "a shift in philosophy ... activity-based bars"; 329.7 "number two, tick bars"; 333.6 "A tick bar forms after exactly N trades" (dots bracket into bars); 343.6 "If the market is moving fast, tick bars print rapidly. If it's slow, they take hours"; 348.5 "This equalizes the opinions in the market"; 356.4 "closer to a normal, statistically sound distribution"; 363.5 "strictly requires a raw granular trade stream"; 371.0 "A $1 retail trade isn't the same as a million-dollar institutional block trade" (setup for volume bars).
- 3c 382.2 to 458.7, volume and dollar bars: 382.2 "number three, volume bars"; 393.6 "we count the physical amount traded"; 398.0 "a single 100 BTC trade contributes 100 times more ... than a 1 BTC trade" (100 BTC block vs 1 BTC cell); 414.2 "what if Bitcoin's price goes from $10,000 to $70,000?" (host's example; the slide uses ETH $1,000 to $4,000 from the article, use the article's ETH scale); 430.3 "number four, dollar bars"; 434.0 "a fixed USD or USDT notional"; 442.0 "Marcos Lopez de Prado actually recommends dollar bars as the default" (balance scale balances at $10,000); 451.7 "normalizes for both the trade count and the dramatic price level shifts".
- 3d 458.7 to 509.6, thresholds: 461.0 "How do we actually pick the threshold"; 467.6 "illustrative BTCUSDT thresholds"; 472.4 "roughly equivalent to a one-minute time bar ... 1,000 trades or 100 BTC or $1 million" (table column 1 fills; note 100 BTC is ~2-3m in the table, not ~1m); 490.1 "regime sensitivity"; 497.3 "during a massive market crash or a huge breakout, these bars will form 5 to 10 times faster than usual" (bar ticks speed up).

Host correction: at 472.4 to 486.2 the host lumps "1,000 trades or 100 BTC or $1 million" as all ~1 minute; the table says 100 BTC ≈ 2-3 minutes.

## Slide 4: 5–7. Price-Based Bars. 509.6 to 616.4 (106.8 s)

**Content**
- Title "H2 — 5—7. Price-Based Bars", tagline "Samples only when price moves enough to matter, ignoring the clock entirely."
- Three rows, each: a noisy price line → arrow → resulting bars → black code pill → caption:
  - "H3 — 5. Renko Bars": equal-size dark bricks stepping up and down; pill `diff = price - last_close`; "Forms only when closing price moves by fixed N units. Tracks direction only." (plus a long right arrow).
  - "H3 — 6. Range Bars": a row of candlesticks with equal bodies and wicks; pill `high - low >= range_size`; "Preserves the full OHLCV structure within a fixed range."
  - "H3 — 7. Volatility Bars": candles of varying size (small, growing to a big one mid-row, shrinking); pill `threshold = avg_range * atr_multiplier`; "Dynamic boxes scaling with an ATR-adaptive threshold."

Article check: matches (article defaults: `range_size = 20.0`, `atr_multiplier = 1.0`).

**Sub-scenes** (107 s, split)
- 4a 509.6 to 557.7, Renko: 509.6 "what if a trader only cares about actual price movement"; 519.0 "price-based bars"; 523.0 "First up here is Renko bars"; 526.5 "only when the closing price moves by a fixed N units" (bricks form); 534.4 "chops around sideways ... for three days, no new bricks form at all" (flat chop, no bricks); 540.4 "a perfect, ruthless filter for sideways noise"; 543.9 "a huge danger with Renko if you are backtesting algorithmic stop losses" / 551.4 "It hides the extremes of the price action" (a wick spike through a stop line vanishes in the Renko view).
- 4b 557.7 to 616.4, range + volatility: 557.7 "number six, range bars"; 560.5 "a fixed high-low range, but they preserve the full open, high, low and close structure, including the wicks"; 567.6 "much safer and much more realistic for backtesting"; 579.5 "number seven, volatility bars"; 585.9 "an ATR adaptive threshold. ATR stands for Average True Range"; 593.2 "think of it like a rubber band" (rubber band gag); 596.1 "In calm, boring markets, the rubber band is tight" / 601.5 "in highly volatile markets, the band stretches" (box size scales with ATR).

## Slide 5: 8. Heikin-Ashi / 9–11. Japanese Reversal Charts. 616.4 to 761.7 (145.3 s)

**Content**
- Left "H2 — 8. Heikin-Ashi (Smoothed Transformation)", panel "H3 — 8. Heikin-Ashi": two black formula boxes `HA Close = (Open + High + Low + Close) / 4` and `HA Open = (Prev HA Open + Prev HA Close) / 2`. Red warning with a red triangle: "**Warning:** Heikin-Ashi is a transformation, not a base bar. It results in a loss of exact prices. Never use HA close for order execution."
- Right "H2 — 9–11. Japanese Reversal Charts", tagline "Act as macro trend filters discarding time entirely."
  - "H3 — 9. Kagi Charts": a thin line, a step up into a thick line rising, then a thin line falling; "Yang/thick vs yin/thin lines based on support/resistance breaks."
  - "H3 — 10. Line Break Charts": dark boxes stepping up and down with bracket marks on the breakout boxes; "Draws a new bar only if close exceeds high/low of N=3 lookback."
  - "H3 — 11. Point & Figure Charts": columns of X and O; "X's (rising), O's (falling) with a 3-box reversal rule."

Article check: formulas match; article adds HA High = max(High, HA Open, HA Close), HA Low = min(Low, HA Open, HA Close); in the comparison matrix HA is "Trend confirmation (synthetic prices!)". Kagi: thick = yang = demand (breaks a previous high), thin = yin = supply (breaks a previous low). Line Break default `line_count = 3` (Three Line Break). P&F default `box_size = 10.0`, `reversal_boxes = 3`.
**NotebookLM drawing error:** the slide's P&F grid mixes X and O inside the same column. Each P&F column must be all X (rising) or all O (falling), switching only after a 3-box reversal. Redraw clean alternating columns.

**Sub-scenes** (145 s, split)
- 5a 616.4 to 694.7, Heikin-Ashi: 616.4 "number eight ... Heikin-Ashi ... a smoothed transformation"; 626.4 "Heikin-Ashi is not actually a base bar type" / 630.7 "a mathematical transformation applied on top of other existing bars"; 646.8 "The Heikin-Ashi close is the average of the regular open, high, low, and close" (HA Close formula types); 654.1 "the Heikin-Ashi open is the average of the previous Heikin-Ashi open and the previous Heikin-Ashi close" (HA Open formula); 662.2 "these aren't real prices at all"; 667.9 "An asset might never have actually traded at a Heikin-Ashi open price"; 676.6 "Heikin-Ashi prices are entirely synthetic" (warning box); 683.1 "never ... use them for actual order placement or simulating exact profit and loss in a backtest"; 689.4 "only use them for signal generation".
- 5b 694.7 to 761.7, Japanese charts: 694.7 "the Japanese reversal charts ... completely discard the concept of time"; 702.1 "Number nine is Kagi charts"; 704.3 "vertical lines that only change direction on a specified reversal amount"; 712.1 "Yang, which is a thick line when breaking previous highs, or Yin, which is a thin line when breaking previous lows" (line thickens/thins); 723.0 "line break charts. Number 10"; 726.4 "a new line only when the closing price exceeds the high or low of the previous N lines, typically a three line break"; 741.3 "number 11, point and figure"; 746.0 "columns of Xs for rising prices and Os for falling" / 750.7 "a three box reversal to switch columns"; 754.3 "highly effective for macro trend filtering".

## Slide 6: 12–14. Information-Driven Bars. 761.7 to 917.6 (155.9 s)

**Content**
- Dark header bar "H2 — 12–14. Information-Driven Bars".
- "H3 — 12. Tick Imbalance Bars (TIB)": a trade-stream arrow splits into an upper track "Buy = +1" (green ticks) and a lower track "Sell = -1" (red ticks); both merge into a counter strip "Cumulative theta (θ)".
- "H3 — 13. Volume Imbalance Bars (VIB)": a balance scale; left pan "TIB (Tick Imbalance)" with a pyramid of equal cyan/amber coins; right pan "VIB (Volume Imbalance)" with green blocks "100 BTC buy = +100" and red blocks labelled "50 BTE sell = -20" (garbled); the right pan is heavier. Caption "Measures Net Signed Volume Imbalance vs. Net Tick Count."
- "H3 — 14. Run Bars": a timeline with a green run of 5 boxes "Run Length = 5" and a red run of 3 boxes "Run Length = 3"; "Contrasts Net Imbalance (buys minus sells) against Run Bars (maximum consecutive run length of either)."
- Bottom "H3 — The Explosion Problem": a vertical arrow "EWMA Expected Threshold" pushes into a pipe loop labelled "exploding bar generation"; the flow slams into a yellow/black-striped clamp/vice labelled "min_ticks / max_ticks limits".

**NotebookLM error:** VIB red block label is garbled ("50 BTE sell = -20"); correct is "50 BTC sell = −50" (signed volume, so −50, not −20).
Article numbers for the explosion problem: without bounds `expected_ticks: 1000 → 5000 → 25000 → 125000 → ∞`; with bounds `max(min_ticks, min(max_ticks, new_expected_ticks))`, floor `min_ticks = 100`, ceiling `max_ticks = 50000`; `expected_ticks_init = 1000`, `ewma_window = 100`. TIB uses the tick rule (+1 buyer-initiated, −1 seller-initiated) and samples when |θ| exceeds the dynamic threshold. Run bars: longest consecutive run of buys or sells; detects informed traders splitting orders.

**Sub-scenes** (156 s, split)
- 6a 761.7 to 848.5, TIB + VIB: 761.7 "we are entering the advanced machine learning zone"; 767.7 "information driven bars ... sampling the market only when new, significant information arrives"; 776.0 "what information am I still missing?" / 779.5 "You're missing intent"; 782.9 "who exactly crossed the spread"; 786.8 "number 12, tick imbalance bars"; 797.2 "the tick rule to assign a sign of plus one for a buy or minus one for a sell" (ticks split green/red); 806.0 "the bar closes when the cumulative theta ... exceeds a dynamic EWMA threshold" (θ counter fills to a moving hurdle line); 813.5 "exponentially weighted moving average" / 817.6 "a hurdle that moves"; 824.4 "number 13, volume imbalance bars"; 830.3 "weighted by signed volume" / 833.8 "a 100 Bitcoin aggressive buy is plus 100" (scale tips); 841.4 "large informed institutional orders that might be deliberately split into smaller trades".
- 6b 848.5 to 917.6, explosion + runs: 848.5 "a serious mathematical danger"; 851.7 "the explosion problem"; 859.2 "a positive feedback loop"; 866.4 "makes the algorithm wait longer ... the accumulated imbalance ... even larger" / 872.6 "the threshold just explodes to infinity and your chart stops printing entirely" (counter 1000 → 5000 → 25000 → 125000 → ∞); 881.3 "clamping the EWMA threshold with strict min_ticks and max_ticks bounds" (vice clamps at 100 and 50000); 889.2 "a hard roof and a hard floor"; 900.4 "number 14, run bars"; 904.6 "the maximum length of consecutive buys or consecutive sells" (run 5 green, run 3 red); 913.2 "designed to detect algorithmic order splitting".

## Slide 7: 15. CUSUM / 16. Entropy / 17. Delta Bars. 917.6 to 1012.4 (94.8 s)

**Content**
- Dark header bar with three titles "H2 — 15. CUSUM Filter Bars | H2 — 16. Entropy Bars | H2 — 17. Delta Bars (Order Flow)".
- CUSUM panel: a wiggly line labelled "Cumulative Sum of Log-Returns" between two horizontal cyan threshold lines and a black zero line; where the line crosses the upper threshold a red vertical drop marks "Sampling". Caption "Triggers on cumulative sum of log-returns off 1m OHLCV. No raw tick data required. Advantage over Bollinger Bands: requires a full magnitude run, no repeated triggers on hovering."
- Entropy panel: black formula box `Σ −p log₂(p)`; histogram of ~12 blue bars (dark to light) with a horizontal threshold line across. Caption "Samples when information purity crosses threshold. Applied over a 10-bin return distribution. High theoretical purity."
- Delta panel: bars with values: green 10, 38, 50, 73, 104, 176, 137; red −10, −15, −22, −23, −18, −20, −21; a last blue bar; a navy cumulative line rising then falling. Caption "Aggressive buy volume minus sell volume. Requires trade-level side classification (is_buyer_maker)."
- Footer: "These methods sample exactly when the market indicates a **structural or physical shift**."

Article check: CUSUM matches (symmetric CUSUM filter, Lopez de Prado 2018 ch. 2.5; works on 1m OHLCV; full threshold run before triggering vs Bollinger repeated triggers; CUSUM events feed the triple-barrier method). Entropy: Shannon entropy of intra-bar returns, `n_bins = 10`, `entropy_threshold = 2.0`, `min_trades = 50` ("information purity" is slide wording; article: sample when entropy exceeds a threshold, "most theoretically pure"). Delta: Delta = Buy Volume − Sell Volume by aggressor side, `side = -1 if is_buyer_maker else 1` (Binance aggTrades). The delta bar heights are illustrative.

**Beats**
- 917.6 "number 15, CUSUM filter bars"; 920.6 "cumulative sum"; 923.1 "tracks cumulative returns to determine when to sample a bar" (line hits threshold, red "Sampling" drop)
- 926.8 "CUSUM can be applied directly to standard one minute OHLCV data" / 937.0 "you don't need gigabytes of granular tick data"
- 944.2 "number 16. Entropy bars"; 950.9 "Shannon entropy" (formula); 953.7 "like a surprise meter" (gauge gag); 959.8 "entropy of intra-bar returns using a specific number of bins and a minimum trade count" (10-bin histogram); 966.7 "normal predictable chop, entropy is low"; 971.0 "a massive unexpected block order hits" / 974.7 "The entropy spikes"; 977.0 "close a bar when enough surprising information has entered"
- 984.8 "rounding out all 17 base bars, number 17, delta bars"; 992.4 "cumulative delta, which is aggressive buy volume minus aggressive sell volume" (bars grow, cumulative line); 999.5 "strictly requires trade level side classification"; 1005.5 "Binance aggTrades ... who crossed the spread"; 1012.4 "That is all 17 base bar types on axis one" (17 rows complete, transition)

## Slide 8: Method A Calendar-Aligned / Method B Rolling Window. 1012.4 to 1086.1 (73.7 s)

**Content**
- Top dark header "H2 — Method A: Calendar-Aligned Aggregation": a long row of dark base-bar squares; a vertical navy/amber blade cuts the row at "00:00". Callouts: "[Wall clock alignment]", "[Crowd-aligned boundaries]", "[Essential for PIQ triggers]", "[Suffers from "cold start" wait time.]" ("cold start" in red).
- Bottom dark header "H2 — Method B: Rolling Window Aggregation": the same row with a bracket labelled "deque[OHLCV]" around a window of bars, ghost dashed windows offset to the right (the window slides). Callouts: "[Always valid after warmup (no cold start)]" ("Always" in green), "[Guarantees backtest/live parity]", "[Introduces phase shift (e.g., closing at :37).]" ("phase shift" in teal).

Article check: matches. Method A: the 1-hour candle covers 14:00:00 to 14:59:59; PIQ = position-in-queue triggers (link to the queue-position article). Method B: rolling 1h = last 60 closed 1m bars, updated every minute; "one rule: if buffer not full: skip"; "Rolling candles close at :37 if you started at :37, not at :00".

**Beats**
- 1015.2 "Now we pivot to axis two, aggregation methods"; 1023.2 "There are three methods here"
- 1025.0 "Method A is calendar aligned aggregation"; 1027.9 "aligning with the wall clock. 14:00 to 14:59" (blade drops at the hour)
- 1033.0 "prone to the cold start problem, but it is the ultimate Schelling point for seeing the exact same support and resistance levels"
- 1042.7 "Method B is rolling window aggregation"; 1045.6 "you just take the last N closed base bars" / 1050.4 "always holds the last 60 one-minute bars in memory" (deque window slides one bar per tick)
- 1054.6 "completely eliminates the cold start problem ... after the initial warm up"; 1060.5 "perfect parity between your historical backtest and your live trading"
- 1068.3 "The phase shift"; 1071.1 "a rolling hourly candle ... might actually close at 2:37 PM instead of 3 PM" (clock shows :37 vs :00); 1078.5 "you lose your alignment with the crowd"

## Slide 9: Method C Adaptive / Combinations / Hybrid Engine / Time-Volume Hybrid. 1086.1 to 1155.9 (69.8 s)

**Content**
- Top left dark header "H2 — Method C: Adaptive Rolling Aggregation": row of bars labelled T-30, T-15, T, T+15, T+30; upper bracket "[wider in calm]" with outward arrows, lower bracket "[narrower in volatility]" with inward arrows; a gauge "ATR measure" from LOW VOL (teal) to HIGH VOL (amber) whose needle feeds "ATR_window_size".
- Top right "H3 — Combination Examples" table: 1 | **Rolling Volume Bars** | = last 24 volume bars; 2 | **Adaptive Delta** | = adaptive flow window; 3 | **Hybrid Time** | = dual-state tracking.
- Bottom left "H3 — Hybrid Engine: Calendar + Rolling": "DATA FEED (OHLCV)" splits into "Calendar structure" (bar row HH:MM:00 to HH:MM:00) and "Rolling signals" (dashed boxes around "deque[OHLCV]"); "Negligible memory overhead maintaining parallel states."
- Bottom right "H3 — Time-Volume Hybrid: Calendar with Volume Splits": volume histogram with time ticks 00:00 / 01:00 / 02:00, a "VOLUME CLUSTER" of green/red stacked cells, dotted line "vol_threshold", a red vertical line "force close early on vol_threshold" before 02:00, the rest shaded.
- Footer: "These **hybrid structures ensure seamless transitions** between structured market time and dynamic **volatility regimes**."

Article check: matches. Article combination table (6 base types × 3 methods): Time (standard exchange candles / always-valid HTF, no cold start / vol-adaptive timeframe); Volume ("all volume bars this hour" / last 24 volume bars / wider window in calm markets); Dollar; Tick Imbalance; Delta (hourly net order flow / rolling delta snapshot / adaptive flow window); Renko. Hybrid engine memory = "two deque buffers per timeframe per symbol". Time-volume hybrid: close at the calendar boundary OR when volume exceeds the threshold.

**Beats**
- 1086.1 "That leads to method C. Adaptive rolling aggregation"; 1092.2 "the window size itself adapts to an ATR volatility measure" (gauge); 1100.0 "In calm markets, the window widens" / 1104.3 "in volatile markets, it narrows for a much faster reaction time" (bracket breathes with needle)
- 1110.5 "the article gives some combination examples"; 1115.2 "a rolling window of volume bars or an adaptive window of dollar bars" (table rows)
- 1123.2 "a hybrid engine combining calendar and rolling ... both simultaneously for negligible memory overhead" (feed splits in two); 1133.4 "calendar aligned bars to map out macro market structure, and ... rolling closed base bars for generating your mathematical signals"
- 1142.1 "the time volume hybrid, calendar with volume splits"; 1147.6 "stays calendar aligned ... but it force closes early if a massive volume spike threshold is exceeded" (red line drops at the cluster)

## Slide 10: Practical Aggregation: Cascading Preload. 1155.9 to 1257.1 (101.2 s)

**Content**
- Title "H2 — Practical Aggregation: Cascading Preload".
- Left: a tall block "1 Day" with arrows to a stack of ten "1-hour" blocks (isometric, teal tops); one 1-hour block fans out to stacks of "1-minute" blocks ("1-minute", "1-minute", "⋮" ... "1-minute"); an arrow up from the hour stack labelled "OHLCV Composability".
- Top right "H3 — Multi-Exchange Limits" table: Exchange | Max Candles per REST Request: Binance | 1,000 candles; OKX | 300 candles.
- Bottom right "H3 — Aggregation Consistency Check": terminal window: `> validate_aggregation(native_1m, computed_1h)` / `Checking sum(volume)... OK` / `Checking high/low boundaries... OK` / `Checking close vs. open... OK`; bracket `tolerance_pct = 0.001`; "**Engineering mandate:** If consistency check fails, compute higher timeframes directly from native 1-minute data."

Article check: Binance ~1000 candles per REST request, OKX caps at 300; article table also lists Bybit 1,000 and Gate.io 1,000 (and intervals: Binance 1m–1M, Bybit 1–720/D/W/M, OKX 1m–1M, Gate.io 10s–30d). Cascade for a rolling 1W candle: 6 completed 1D (REST `/klines?interval=1d`) + 23 completed 1h + N completed 1m; each new closed 1m candle updates the chain; 1D high = max of 24 1h highs = max of 1440 1m highs. `validate_aggregation(candle_htf, candles_ltf, tolerance_pct=0.001)` compares with relative error `abs(a − b) / max(|a|, |b|) < tolerance_pct`, i.e. a **0.1%** relative tolerance.

**Host error (flag):** 1237.5 says "a strict 0.01% tolerance check", 1243.2 to 1246.2 corrects to "0.001%". Both are wrong: `tolerance_pct = 0.001` is used as a fraction, so the tolerance is 0.1%. Show `tolerance_pct = 0.001` (0.1%) on screen; do not caption "0.001%".
Host wording: 1179.3 "Binance might allow a thousand candles per request, while OKX restricts you to just 300" matches. 1167.2 "a rolling window of a thousand one hour candles" is the host's example.

**Sub-scenes** (101 s, split)
- 10a 1155.9 to 1219.9, cascade: 1155.9 "a very practical API issue ... cascading preload"; 1167.2 "a rolling window of a thousand one hour candles ... What if the exchange API simply won't give you that much data"; 1176.2 "multi-exchange REST limits" / 1179.3 "Binance ... a thousand candles per request, while OKX restricts you to just 300" (table); 1193.1 "Think of it like building a pyramid" (pyramid of blocks: minutes at base, hours, day, week capstone); 1195.3 "OHLCV data is mathematically composable"; 1203.4 "the thousands of base stones, the one minute candles"; 1207.0 "rolling one hour candles from those one minute candles. Then ... one day candles from the one hour candles, and one week candles from the one day candles" (layers stack); 1215.8 "the high of the week is simply the max high of all those underlying minutes".
- 10b 1219.9 to 1257.1, consistency check: 1220.4 "a strict warning ... the aggregation consistency check"; 1224.9 "Exchange REST data for a one hour candle might not perfectly match your own rolling data built from 60 one-minute candles"; 1233.1 "validate your aggregated higher time frame candle against the lower time frame data" (terminal lines print OK, OK, OK); 1237.5 to 1251.4 tolerance (show 0.1%, see flag); 1251.4 "build it yourself to ensure your backtest math isn't corrupted" (mandate box).

## Slide 11: Comparison Matrix. 1257.1 to 1289.7 (32.6 s)

**Content**
- Dark header "H2 — Comparison Matrix".
- "H3 — Axis 1: Base Bar Types" table with columns [Category] [Category] [Base Bar] [Trigger] [Tick Data Required] [Best For] and 13 rows grouped Activity / Price / Information / Stats/Flow.
- "H3 — Axis 2: Aggregation Methods" table [Method] [Alignment] [Cold Start] [Phase Shift] [Best For]: Calendar | Wall clock | Partial bar risk | None (crowd-aligned) | Market structure, PIQ; Rolling | N bars | None (after warmup) | Yes (shifted from :00) | Indicators, signals; Adaptive | Volatility-driven N | After ATR calibration | Yes | Vol-adaptive strategies.

**NotebookLM error (flag):** the Axis 1 table is mangled: duplicated "[Category]" header, columns shifted (the "Trigger" column holds Yes/No, the "Tick Data Required" column holds "OHLCV" for every row), the Time row's "Best For" says "N trades", the Heikin-Ashi, Kagi, Line Break and P&F rows are missing (13 of 17 rows), typo "Volatiity". Redraw Axis 1 from the article:

| # | Bar Type | Trigger | Tick Data Required | Best For |
|---|---|---|---|---|
| 1 | Time | Fixed interval | No | Market structure, crowd behavior |
| 2 | Tick | N trades | Yes | ML features, equal-opinion sampling |
| 3 | Volume | N units traded | Yes | Normalized activity analysis |
| 4 | Dollar | $N notional | Yes | Cross-asset comparison |
| 5 | Renko | Price ± N units | No | Trend following, noise filtering |
| 6 | Range | High-Low ≥ N | Yes | Breakout detection |
| 7 | Volatility | Adaptive range | Yes | Regime-adaptive analysis |
| 8 | Heikin-Ashi | Transformation | No | Trend confirmation (synthetic prices!) |
| 9 | Kagi | Price reversal | No | Supply/demand structure |
| 10 | Line Break | N-line breakout | No | Macro trend filter |
| 11 | Point & Figure | Box + reversal | No | Support/resistance mapping |
| 12 | TIB | Tick imbalance | Yes | Informed flow detection |
| 13 | VIB | Volume imbalance | Yes | Large order detection |
| 14 | Run | Run length | Yes | Order splitting detection |
| 15 | CUSUM | Cumulative return | No (1m closes) | Structural break events |
| 16 | Entropy | Shannon entropy | Yes | ML research, feature purity |
| 17 | Delta | Order flow delta | Yes (aggTrades) | Aggressor flow analysis |

Axis 2 on the slide is correct (article "Best For" for Calendar also lists S/R).

**Beats**
- 1257.1 "the comparison matrix to bring this all together"; 1260.3 "For axis one, the base bar types"
- 1262.7 "The main dividing line for a developer is data requirements. Tick versus OHLCV" (highlight the Tick Data Required column)
- 1268.3 "volume, dollar, imbalance and delta strictly require granular tick data" (Yes cells light); 1273.7 "Others like time, Renko, and CUSUM do not" (No cells light)
- 1276.8 "for axis two ... calendar phase alignment, which sees what the crowd sees, versus rolling cold start elimination" (Axis 2 table)

## Slide 12: Practical Recommendations. 1289.7 to 1336.4 (46.7 s)

**Content**
- Title "H2 — Practical Recommendations"; mono subtitle "The marketmaker.cc multi-layered framework. Implementation constrained by 1m OHLCV vs. tick data availability."
- A server-rack drawing of 4 units (each with a label plate, small cyan/amber/green status LEDs and a red or green square), top to bottom:
  - "Trend Filter" → "Heikin-Ashi transformation or Line Break over daily closes. Aligns signals with macro direction."
  - "Microstructure Flow" → "Dollar/VIB + rolling, or Delta + calendar. Requires tick/aggTrades data. Detects informed flow and order splitting."
  - "Market Structure" → "Hybrid calendar time bars. Tracks crowd behavior, support/resistance levels, and PIQ."
  - "Base Signals" → "Rolling time bars. No new data needed. Fixes the cold start problem for perfect backtest parity."

Article check (marketmaker.cc layered approach): Layer 1 signals = rolling aggregation of time bars (no cold start, perfect backtest parity); Layer 2 market structure = calendar-aligned time bars (S/R, hourly close analysis, PIQ triggers); Layer 3 microstructure = VIB + delta bars from the raw trade stream; Layer 4 trend filter = Heikin-Ashi on rolling bars, or Line Break on **4h** calendar closes. Small mismatches to fix on redraw: the slide says "Line Break over daily closes" (the article's generic rec #8 says Line Break/Kagi over daily calendar bars, but the marketmaker.cc layer says 4h), "Hybrid calendar time bars" (article: calendar-aligned time bars) and "Dollar/VIB + rolling, or Delta + calendar" (mixes the generic recs #4 to #6 into layer 3; the layer itself is VIB + delta). Article's generic list worth a secondary visual: 1m-only data → 1 rolling time bars, 2 hybrid rolling + calendar, 3 CUSUM; tick data → 4 dollar bars + rolling (literature default), 5 VIB + rolling, 6 delta + calendar; filters → 7 HA over rolling volume bars, 8 Line Break/Kagi over daily calendar bars.

**Beats**
- 1289.7 "the ultimate practical recommendations"; 1292.8 "a four layer architecture" (rack outline)
- 1298.0 "Layer one is for rolling signals using a rolling window on one minute time bars to avoid the cold start entirely" (Base Signals unit lights)
- 1305.3 "Layer two is for calendar market structure ... PIQ triggers" (Market Structure unit)
- 1313.9 "Layer three dives into microstructure flow ... volume imbalance and delta bars to detect those informed institutional orders" (Microstructure unit)
- 1323.8 "layer four is for trend filters, overlaying Heikin-Ashi or line break transformations on higher timeframes" (Trend Filter unit)

## Slide 13: Conclusion. 1336.4 to 1352.9 (16.5 s)

**Content**
- Title "H2 — Conclusion". Center: a glowing cyan cube "Base Bar" inside nested navy brackets, a label "Aggregation" across the top bracket; caption "The Atomic Unit: The Closed **Base Bar**." ("Base Bar" in teal).
- Four boxes with amber bullets: "Candle construction requires two distinct decisions: **What defines the bar? How is it aggregated?**" / "The standard Binance candle is just **one cell** in a 51-cell matrix." / "The **true edge in quantitative systems** lies in mapping and tapping the remaining 50 combinations." / "**Scale further via backtest granularity controls and Parquet caches.**"

Article check: matches the conclusion ("just one cell in a 17×3 matrix", "The atomic unit — the closed base bar — remains the foundation. Everything else is aggregation"; links to the adaptive drill-down backtest and aggregated Parquet cache articles). "The true edge ... lies in" is NotebookLM's framing; the article says the other 50 "are available to anyone willing to implement them".

**Beats**
- 1336.4 "candle construction isn't a single choice" (two question boxes)
- 1340.5 "The atomic unit of your data is the closed base bar" (cube glows); 1344.4 "Everything else is just aggregation math on top of that" (brackets close around it)
- 1347.2 "a 17 by three matrix, giving you 51 different ways to view the market" (grid callback)

## Slide 14: Useful Links / Citation. 1352.9 to 1407.5 (54.6 s)

**Content**
- "H2 — Useful Links": ▪ Lopez de Prado — Advances in Financial Machine Learning ▪ Easley et al. — The Volume Clock ▪ mlfinlab — Python library for information-driven bars ▪ Binance — Historical Data ▪ Apache Parquet — Storage format.
- "H2 — Citation", mono bracketed box: `@article{soloviov2026bartypes, author = {Soloviov, Eugen}, title = {Bar Types and Aggregation Methods for Algorithmic Trading}, year = {2026}, url = {https://marketmaker.cc/en/blog/post/beyond-time-bars-candle-construction} }`
- Bottom box (NotebookLM boilerplate, drop): "Target-channel duplicates and external identities remain unchecked. All mutable data, Chinese translations (if applicable), and, and financial statements require primary-source validation. No investment advice."

Article check: links match (Lopez de Prado 2018; Easley, Lopez de Prado, O'Hara 2012 "The Volume Clock: Insights into the High Frequency Paradigm"; mlfinlab docs link points to mlfinpy.readthedocs.io; data.binance.vision; parquet.apache.org). The article's bibtex also has a `description` field.

**Beats**
- 1352.9 "some fantastic useful links"; 1357.1 "Marcos Lopez de Prado's machine learning text"; 1361.0 "the mlfinlab Python library"; 1367.4 "Apache Parquet" (links tick in)
- 1372.8 "the 2026 article by author Eugen Soloviov" (citation box)
- 1388.7 "going back to that sports car stuck in first gear" (callback: gearbox shifts through gears); 1392.0 "a clock that completely ignores the reality of market volume and information flow, what other invisible defaults in your workflow are costing you an edge?"
- 1406.0 "Thanks for diving deep with us" (end card)

---

## Timing notes

`sync_slides.py` (default params) degenerated ("showed 8/14 slides, longest held 82%") and fell back to an even 100.5 s split (saved as `timeline_auto_evensplit.json`). Wrong almost everywhere: slide 3 alone runs 308 s, slides 2, 11, 13 are 17 to 33 s.

`slide_starts.json` is set by hand; the hosts walk the bar types by number ("number one, time bars" ... "number 17, delta bars") and announce each aggregation method, which makes the boundaries reliable.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 TL;DR | 0.0 | cold open (TL;DR proper at 103.5) | high |
| 2 Two axes | 168.1 | "Let's really explore these two axes of candle construction" | high |
| 3 Time + activity bars | 201.2 | "dive into axis one, starting with the absolute standard. Number one, time bars" | high |
| 4 Price-based bars | 509.6 | "we've covered time and we've covered activity, but what if a trader only cares about actual price movement" | high (named at 519.0) |
| 5 Heikin-Ashi + Japanese | 616.4 | "moving on to number eight, we need to talk about Heikin-Ashi" | high |
| 6 Information-driven | 761.7 | "take a breath because we are entering the advanced machine learning zone" | high |
| 7 CUSUM / entropy / delta | 917.6 | "Which brings us to number 15. CUSUM filter bars" | high |
| 8 Method A / B | 1012.4 | "That is all 17 base bar types on axis one. Now we pivot to axis two" | high |
| 9 Method C + hybrids | 1086.1 | "That leads to method C. Adaptive rolling aggregation" | high |
| 10 Cascading preload | 1155.9 | "building these massive rolling windows introduces a very practical API issue ... cascading preload" | high |
| 11 Comparison matrix | 1257.1 | "Let's look at the comparison matrix to bring this all together" | high |
| 12 Recommendations | 1289.7 | "Which brings us to the ultimate practical recommendations" | high |
| 13 Conclusion | 1336.4 | "In conclusion, candle construction isn't a single choice" | high |
| 14 Links / Citation | 1352.9 | "The article also provides some fantastic useful links" | high |

Slides longer than ~90 s are split into sub-scenes above: 1 (2), 3 (4), 4 (2), 5 (2), 6 (2), 10 (2). Slide 7 (95 s) runs as one scene with three panel beats (CUSUM 917.6, entropy 944.2, delta 984.8).
