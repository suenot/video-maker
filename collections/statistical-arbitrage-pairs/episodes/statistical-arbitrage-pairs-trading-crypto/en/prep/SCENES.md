# statistical-arbitrage-pairs-trading-crypto (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host who brings analogies and pushback, H2 = expert host), 13-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/statistical-arbitrage-pairs-trading-crypto.en.md` (2026-03-19, suenot).

- Audio: `input/notebooklm-sources/statistical-arbitrage-pairs-trading-crypto/en/audio.m4a`, 1705.32 s (28:25.3), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has `words[]` with per-word start/end). Timestamps below are segment starts in seconds, accurate to about 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes") to `timeline.json`. `timeline_auto_evensplit.json` is the failed `sync_slides.py` output, reference only.
- Slide PNGs: `slides/slide_001.png` ... `slide_013.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: dark navy-black "cyber HUD" background with faint circuit-board traces and binary digits in the corners, glowing neon titles (cyan #5FD3F3, slide 10 amber #F2B24C). Content sits in "monitor windows" (metal bezel, three macOS dots top left, a notch tab on top). Palette: cyan/teal = the spread, signal, neutral; green #6EF07A = correct / cointegration / good; magenta/pink = the bad series / correlation trap; amber/orange = warnings, "claim unverified" tags, thresholds; red = stop-loss, hazards. Body text in condensed sans; code in mono with syntax colors. Many slides carry amber "[Claim Unverified]" / asterisk tags: keep that idea as a small amber badge. Small "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper, do not caption verbatim): "Kelman Filter" (46.3) / "Coleman filter" (1392.2) = Kalman filter; "peristrating" (177.6) = pairs trading; "Lackard" (214.3) = laggard; "Vax" = VAX; "Gathef Gottzman and Roan Horst" (252.6) = Gatev, Goetzmann and Rouwenhorst; "Peter Mueller" = Peter Muller; "angle granger" / "Engel Granger" = Engle-Granger; "ordinary lease squares" (464.3) = ordinary least squares; "Dickie Fuller" = Dickey-Fuller; "Johansson" = Johansen; "Ornstein-Ulembach" (533.8) = Ornstein-Uhlenbeck; "sharp ratio" (1324.5) = Sharpe ratio; "Paris trading" (1379.6) = pairs trading; "life markets" (1350.1) = live markets; "It all ends up fast" (1298.0) = it all adds up fast; "preying" (1190.3) = praying; "date 10" (1183.7) = day 10; "filter pie" = filterpy; "Jupiter notebook" = Jupyter notebook; "CCXT" = ccxt. Hosts do not read headings aloud; boundaries come from topic transitions.

---

## Slide 1: Title. 0.0 to 111.6 (111.6 s)

**Content**
- Framed oscilloscope chart (upper 55% of the slide): cyan axes with arrowheads (up, right), a cyan horizontal zero line, two noisy cyan spread series oscillating around it plus one smooth cyan sine. A glowing amber horizontal threshold line above zero, labelled "+2σ" (amber) with a small amber arrow pointing at a spike that pokes through the line.
- Title (glowing white bold, 2 lines): "Building a Statistical Arbitrage / Engine for Crypto Markets".
- Subtitle (mono, light grey): "An engineering blueprint for market-neutral pairs trading, from cointegration theory to adaptive Kalman filter implementation."
- Amber-bordered warning bar at the bottom (mono, small): "SYSTEM WARNING: All historical performance figures, expected returns, and latency benchmarks presented in this document are extracted directly from source literature and represent unverified claims. Do not apply as investment advice. Primary-fact review required prior to deployment."
- Decor: circuit traces left and right, HUD progress bars in the top corners, binary digits top right, a bar meter on the lower left.

Article check: title paraphrases the article title "Statistical Arbitrage and Pairs Trading in Crypto Markets: From Cointegration to the Kalman Filter" (the narration reads the real title at 41.0).

**Beats**
- 0.0 "a hedge fund making like 50 million dollars in a single year, not by predicting where the market is going, but by just completely ignoring it" ($50M counter ticks up while a price arrow spins randomly)
- 16.2 "traditional trading is entirely directional"
- 20.2 "strip away the story and just rely entirely on statistics"; 28.5 "the signal inside all that noise" (noisy line, a clean signal emerges = the chart)
- 34.1 "a deep dive into this highly technical, really engineering-oriented 2026 article"
- 41.0 title read aloud: "Statistical Arbitrage and Pairs Trading in Crypto Markets, from Cointegration to the Kalman Filter" (title reveal)
- 49.9 "decode all this intimidating math, the trading strategies, and the Python architecture"
- 73.2 "a very vital piece of housekeeping"; 80.0 "purely an exploration of the concepts ... in this specific 2026 article"
- 85.9 "any historical returns, market figures ... entirely unverified, illustrative claims" (SYSTEM WARNING bar blinks in)
- 99.0 "We are not giving you financial or investment advice"; 102.7 "the underlying math is very real, but applying it to live markets is honestly incredibly dangerous"

## Slide 2: The Lineage of Market-Neutral Trading. 111.6 to 311.2 (199.6 s)

**Content**
- Title: "The" (white) "Lineage" (cyan) "of" (white) "Market-Neutral Trading" (cyan).
- Top band: a long horizontal pipe/conduit running left to right: left end grey with a classical bank-building icon and two gears; middle section purple with flowing binary digits and light streaks; right section teal with flowing document icons and arrows; it ends in a glowing green rounded box holding a Bitcoin "B" inside a hexagon of six connected cubes (blockchain network).
- Three panels hang from the pipe on cables (grey, purple, teal/green), each with a colored progress-bar header:
  - Grey panel "1987: The Genesis Lab": "• Nunzio Tartaglia (former Jesuit priest, physics PhD) forms an automated trading lab at Morgan Stanley." "• Powered by VAX clusters, they pioneer market-neutral pairs trading (e.g., Coke vs. Pepsi) and generate tens of millions before shutting down in 1989." "• Alumni (David Shaw, Peter Muller, Robert Frey) later seed the most legendary quant funds in existence." Illustration: retro computer terminal labelled "VAX" with cables, and a mini chart "Coke vs. Pepsi" with a red and a blue line diverging and rejoining.
  - Purple panel "2006: Academic Formalization": "• Gatev, Goetzmann, and Rouwenhorst publish "Pairs Trading: Performance of a Relative-Value Arbitrage Rule."" "• Demonstrates a consistent ~11% annual return rule (1962-2002) on U.S. equities." ("~11% annual return" amber). Small bell curve with "11%" in its middle, and an amber bracket tag with a warning triangle and magnifier: "[Claim Requires Verification]". "• Proves a critical anomaly: broad markets may be efficient, but specific pairs of assets systematically deviate from equilibrium." with a small zigzag up-arrow chart.
  - Teal/green panel "2026: The Crypto Frontier": "• A target-rich environment Tartaglia would have envied." "• Features: Fragmented liquidity, immature microstructure, 24/7 execution, and perpetual futures funding rates." "• The Catch: Requires massive architectural adaptation to survive overnight 20% drops and intra-block funding flips." Illustration: two trading screens (candles, order book, bar chart) with red warning triangles.

Article check: matches section 1. Nuance: the article says the team was assembled in the mid-1980s; 1987 to 1988 were the best years ($50M in one year); the desk shut in 1989 after two losing years. Shaw founded D.E. Shaw & Co., Muller founded PDT Partners (inside Morgan Stanley), Frey went to Renaissance. Gatev et al.: ~11% per year, 1962 to 2002. The crypto "catch" quotes the article intro ("BTC can drop 20% overnight and the funding rate can flip within a single block").

**Sub-scenes (slide > 90 s)**
- 2a Tartaglia's lab 111.6 to 179.0 (grey panel; priest-to-physicist gag, "secret science lab inside a bank", VAX clusters)
- 2b Coke vs Pepsi 179.0 to 241.3 (the core trade: buy the laggard, short the leader, wait for snap back; $50M in 1987)
- 2c Diaspora and academia 241.3 to 279.3 (alumni names fly out of the pipe; 2006 paper, 11% over 40 years)
- 2d The crypto frontier 279.3 to 311.2 (stock market closes at 4 pm vs crypto never sleeps; teal panel)

**Beats**
- 111.6 "rewind the clock a bit"; 120.0 "we aren't starting in Silicon Valley or some modern crypto Discord server" (pipe draws from the right end back to the left)
- 125.6 "Morgan Stanley in 1987 ... a guy named Nunzio Tartaglia" (grey panel)
- 135.8 "a former Jesuit priest"; 140.2 "who eventually earned a PhD in physics" (gag: collar swaps to lab coat)
- 148.9 "assemble a team of mathematicians, physicists, computer scientists"
- 158.5 "a secret science lab hidden inside an investment bank"; 165.0 "state of the art VAX server clusters" (VAX terminal)
- 171.4 "the core idea ... was disarmingly simple. It's pairs trading"
- 179.9 "Coke and Pepsi"; 185.2 "the exact same sugary water ... just in different colored cans" (two cans)
- 190.1 "their stock prices move in tandem"; 200.3 "sometimes they temporarily detach"
- 210.5 "Coke might suddenly drop on some weird rumor while Pepsi stays flat"
- 214.3 "buy the laggard, which is Coke, and short sell the leader, Pepsi"; 219.4 "you don't care if the whole stock market crashes"
- 222.1 "wait for the relationship ... to snap back to normal"; 226.7 "Once they converge, you lock in a profit"; 229.0 "completely market neutral"
- 230.8 "this specific desk made $50 million in 1987 alone"
- 241.3 "the desk was eventually shut down after a few lean years" (1989 stamp)
- 246.8 "Members of that team went on to found massive quantitative funds"; 250.3 "David Shaw, Peter Muller" (alumni names)
- 252.6 "by 2006 ... Gatev, Goetzmann and Rouwenhorst"; 258.4 "roughly 11% annual returns on U.S. equities over like a 40-year period" (purple panel, 11% bell)
- 266.0 "challenged the entire efficient market hypothesis"; 270.0 "specific localized pairs of assets systematically drift out of equilibrium"
- 282.5 "a stock market that politely closes at 4 p.m. every day"
- 288.9 "How does any of this map onto the crypto market of 2026?"; 292.8 "crypto never sleeps"; 294.7 "liquidity is wildly fragmented across dozens of exchanges"; 298.1 "crazy perpetual futures contracts" (teal panel)
- 301.5 "that chaotic, fragmented environment is precisely why quantitative traders are drawn to it"; 308.0 "Inefficiencies breed opportunity"

## Slide 3: The Fundamental Math: Correlation Is a Trap. 311.2 to 452.2 (141.0 s)

**Content**
- Title (cyan glow): "The Fundamental Math: Correlation Is a Trap".
- Left panel (red glowing border, red X badge top right): heading "The Correlation Illusion" (red).
  - "• **Correlation** measures the linear relationship between the returns of two assets (e.g., BTC and ETH at 0.85)."
  - "• **The Trap**: Two assets can have perfectly correlated increments but permanently diverge in price. Trading based on correlation guarantees opening positions waiting for a convergence that mathematically never arrives."
  - Chart (axes "Price" / "Time"): cyan and magenta zigzag random walks that move together for the first half, then fan apart (cyan climbs to the top right with a teal shaded area, magenta falls to the bottom right with a magenta shaded area). Y-axis tick labels on the slide are garbled (900, 280, 960, 950 ... −70, 100): draw no numbers.
- Right panel (green glowing border, green check badge): heading "Cointegration as the True Signal" (green).
  - "• Cointegration is a property of price series, not returns."
  - "• If non-stationary series X(t) and Y(t) are cointegrated, their linear combination is stationary (mean-reverting)."
  - "• Even if both assets rocket to the moon or collapse, their difference—properly scaled—snaps back."
  - "The Equation: S(t) = Y(t) − β · X(t)" (big green, italic math), below "(β = Hedge Ratio | S(t) = Spread)".
  - Top chart (Price / Time): a green and an orange noisy series wandering together, with bundles of thin green "rubber band" lines tying peaks of one to the other. Bottom chart: "Spread S(t)" (y axis) oscillating around a "0" line between two dashed bands, over "Time".

Article check: matches section 2 ("BTC and ETH are correlated with a coefficient of 0.85"; S(t) = Y(t) − β·X(t); β = hedge ratio, S = spread). Overstatement: "guarantees ... never arrives". Article: two random walks with correlated increments can diverge forever, so the convergence you expect may never come. Redraw as "can wait for a convergence that never comes".

**Sub-scenes (slide > 90 s)**
- 3a Correlation and the dog walk 311.2 to 406.8 (left panel; H1's dog analogy: walking in step, but one goes north and one goes south)
- 3b Cointegration = the leash 406.8 to 452.2 (right panel; dog on a leash, spread snaps back)

**Beats**
- 311.2 "your mathematical foundation has to be flawless"; 316.4 "a massive flashing warning sign" (slide in, red X flashes)
- 321.6 "The absolute number one trap that amateur algorithmic traders fall into is relying on correlation"
- 333.4 "If Bitcoin and Ethereum go up together 85% of the time, aren't they highly correlated?" (see errors: the article's figure is a correlation coefficient of 0.85)
- 340.8 "correlation measures the linear relationship between the daily returns of two assets, not their actual ... prices"
- 350.5 "a near perfect correlation in their daily percentage movements, but ... prices can just drift apart forever" (the two walks fan apart)
- 362.1 dog analogy: "I'm walking my dog in an open field"; 365.0 "I take a step, the dog takes a step ... highly correlated" (man and dog step in sync)
- 372.1 "if I'm walking due north and the dog is walking due south, the distance between us is growing infinitely larger" (they walk apart; good gag scene)
- 385.1 "the random walk divergence trap"; 390.6 "you open a trade expecting the distance ... to shrink back down"
- 398.3 "you run out of money waiting for a convergence that mathematically never had to happen"
- 406.8 "what is the actual mathematical bedrock?"; 413.2 "Cointegration" (right panel lights up, green check)
- 418.7 "a property of the price series itself"; 421.9 "a specific mathematical combination of their prices, which we call the spread, that reliably reverts to a mean" (equation S(t) = Y(t) − β·X(t) writes in)
- 435.9 "cointegration means my dog is actually on a leash" (leash appears); 443.9 "the leash can stretch, but ... we have to snap back together" (spread chart oscillates in band)
- 450.2 "The leash is the perfect metaphor"

## Slide 4: Statistical Verification and Spread Normalization. 452.2 to 622.5 (170.3 s)

**Content**
- Title (cyan glow): "Statistical Verification and Spread Normalization".
- 2×2 grid of monitor windows:
  - Top left (blue) "Engle-Granger Test (1987)": "• Validates two-variable cointegration." "• **Step 1:** OLS regression to find β and residuals ε(t)." "• **Step 2:** Augmented Dickey-Fuller (ADF) test on residuals." "• **Requirement:** Reject null hypothesis (p-value < 0.05). Requires specific Monte Carlo-derived critical values, not standard ADF tables." Formula (large, light blue italic): "Y(t) = α + β · X(t) + ε(t)".
  - Top right (blue) "Johansen Test": "• Used for multi-variable systems (e.g., BTC/ETH/SOL portfolios)." "• Leverages Vector Autoregression (VAR) models." "• Extracts all cointegration relationships via trace and maximum eigenvalue statistics." Network illustration: glowing circular nodes "BTC", "ETH", "SOL", an Ethereum-logo node and a Solana-logo node, plus small unlabeled dots, linked by thin glowing lines (constellation).
  - Bottom left (green) "Ornstein-Uhlenbeck (OU) Process": formula "dS(t) = θ(μ − S(t))dt + σ dW(t)". "• Models spread dynamics." "• **Key Metric:** Half-Life of mean reversion = ln(2) / θ." "• **Crypto Target:** 1 to 30 days. Shorter is by fees; longer exposes the system to structural regime change." Mini chart: green damped oscillation spiking at the start and settling onto a dashed mean line.
  - Bottom right (purple) "Z-Score Normalization": formula "z(t) = (S(t) − μ̂) / σ̂". "• Translates raw spread into actionable standard deviations." "• Sets the threshold triggers (e.g., Enter at |z| > 2.0, Exit at |z| < 0.5)." Bell curve (cyan-to-magenta gradient fill) with vertical lines at "-2.0" and "+2.0" and a dashed center line.

Article check: matches section 2 (Engle-Granger 1987, Nobel 2003; p < 0.05; Monte Carlo critical values, statsmodels `coint()`; Johansen: VAR, trace and max-eigenvalue; OU params; t½ = ln(2)/θ; 1 to 30 days; z thresholds 2.0 / 0.5). Glitches: (1) Johansen network shows ETH and SOL twice (text node and logo node): redraw as three nodes BTC, ETH, SOL, fully connected. (2) "Shorter is by fees" is garbled: use "Shorter: commissions eat the profit. Longer: risk of structural regime change." Extra article detail for animation: θ is estimated by regression ΔS(t) = a + b·S(t−1) + ε(t), θ = −b, t½ = −ln(2)/b; example "t½ = 5 days" vs "t½ = 200 days = half a year waiting".

**Sub-scenes (slide > 90 s)**
- 4a Engle-Granger 452.2 to 508.4 (top left; step 1 OLS = hedge ratio scale, step 2 ADF on leftovers)
- 4b Johansen 508.4 to 526.5 (top right; three-asset leash)
- 4c OU process and half-life 526.5 to 597.2 (bottom left; θ, σ, μ dials; half-life 1 to 30 days; fees vs 200-day wait)
- 4d Z-score 597.2 to 622.5 (bottom right; enter 2.0, exit 0.5)

**Beats**
- 452.2 "to mathematically prove that leash exists, quants rely on ... the Engle-Granger two step test" (top left window opens)
- 461.3 "Step one is figuring out how long the leash is"; 464.3 "an ordinary least squares or OLS regression" (regression line through a scatter)
- 467.5 "the optimal hedge ratio ... how much of asset A equals asset B to create a perfectly balanced scale" (balance scale with β weights)
- 481.0 "Step two is stress testing that spread using an augmented Dickey-Fuller or ADF test"
- 488.1 "looks at the leftovers, the residuals ... and checks if they are stationary"; 493.2 "they don't wander off into infinity"
- 498.7 "If the ADF test confirms stationarity, you have mathematically proven ... cointegration" (p < 0.05 stamp)
- 504.4 "standard ADF critical values don't work here" (strike out "ADF table", show "Monte Carlo")
- 508.4 "the Johansen test ... more than two variables"; 514.3 "a hidden leash connecting Bitcoin, Ethereum and Solana all at once" (three nodes connected by leashes)
- 526.5 "whether you are trading two assets or 10 ... you have to model how they move"; 533.8 "the Ornstein-Uhlenbeck or OU process" (bottom left)
- 542.7 "theta, which is the speed of mean reversion, sigma, which is the volatility, and mu, the long-term mean" (symbols highlight in turn)
- 554.2 "the single most important metric in pairs trading, which is the half-life"; 560.4 "the natural log of two and dividing it by your theta" (ln(2)/θ)
- 565.5 "how many days it typically takes for that stretched leash to snap halfway back"
- 572.6 "the sweet spot ... between one and 30 days"
- 580.5 "if it snaps back in an hour, the exchange fees will just completely eat your profit"; 586.2 "if the half-life is 200 days, you are tying up your capital for six months"
- 597.2 "convert your current spread into a Z-score" (bottom right); 605.1 "how many standard deviations the spread is stretched away from its historical mean"
- 611.4 "trigger an entry when the Z-score hits 2.0 ... an exit when it relaxes back down to 0.5" (lines at ±2.0 light up)

## Slide 5: Sourcing Viable Materials in Crypto Markets. 622.5 to 744.4 (121.9 s)

**Content**
- Title (cyan glow): "Sourcing Viable Materials in Crypto Markets".
- Three monitor windows across the top:
  - "The BTC-ETH Classic": "Highly liquid, but cointegration structurally breaks depending on market narratives (e.g., 2024 ETF flows)." "Requires continuous rolling-window monitoring; cannot be traded blindly."
  - "Sector Pairs (Highest Stability)" (center, taller): "• **L1 Blockchains**: SOL/AVAX, NEAR/APT (High liquidity, 3-10 day half-life)." "• **DeFi Protocols**: AAVE/COMP, UNI/SUSHI (Medium liquidity, 5-15 day half-life)." "• **L2 Solutions**: ARB/OP, MATIC/MANTA (High spread volatility)." "• **Memecoins**: Unpredictable structural risk. Not recommended." (category names in cyan)
  - "Spot vs. Perpetual Futures (Basis)": "The exact same asset across two markets. The spread (funding rate) is stationary by definition, making it the most mathematically reliable pair."
- Glowing pipes run from the three windows down into a large green wireframe funnel (three arrows into its mouth), which drops into a green-bordered box "The Golden Selection Funnel" (green heading, progress-bar decoration): "1. Stable cointegration over a historical window >6 months." "2. Daily volume >$10M per asset." "3. Reasonable half-life between 1 and 30 days."

Article check: sector table and the three selection criteria match section 3. **Error**: the stationary series in a basis trade is the basis (perp price − spot price), not the funding rate; funding is the mechanism that pulls the basis back toward zero. Redraw: "The basis (perp − spot) is stationary by design: the funding mechanism pulls it back to zero." The article calls basis trading "one of the most reliable forms of stat arb", not "the most". "(Highest Stability)" is NotebookLM framing; the article says intra-sector pairs "often exhibit stable cointegration". BTC/ETH per article: 2023 sideways market cointegrated (p < 0.01); 2024 to 2025 divergence (BTC rallied on ETF flows, ETH lagged) broke it; early 2026, after the ETH ETF launch, it stabilized again. Memecoin row in the article: DOGE/SHIB "Unpredictable but fun (not recommended)".

**Sub-scenes (slide > 90 s)**
- 5a BTC-ETH comes and goes 622.5 to 668.1 (left window; leash snaps in 2024-2025 and reattaches in 2026)
- 5b Memecoins vs sector pairs 668.1 to 712.9 (center window; Elon tweet gag)
- 5c Golden rules and basis pairs 712.9 to 744.4 (funnel, then right window)

**Beats**
- 622.5 "we've built the mathematical engine"; 627.7 "Now what kind of fuel are we putting into this machine?" (pipes start flowing)
- 635.3 "the obvious first choice is Bitcoin and Ethereum"; 643.3 "Their cointegration comes and goes"
- 645.4 "During a quiet sideways market, they move in lockstep"
- 649.1 "during the massive Bitcoin ETF flows across 2024 and 2025, Bitcoin surged independently while Ethereum just lagged" (BTC line rockets, ETH lags)
- 658.1 "The mathematical leash completely broke"; 662.1 "It only reestablished itself in 2026" (leash reattaches)
- 664.8 "you really can't just set this up and walk away"
- 668.1 "What about ... meme coins? Doge and Shib"; 679.6 "Oh, absolutely not"
- 691.1 "It vaporizes completely based on ... a single viral social media post"; 696.7 "Elon Musk tweets and the math is ruined" (gag: a tweet bubble snips the leash)
- 700.1 "sector pairs that share fundamental technological overlap"; 704.7 "Layer 1 blockchains, pairing Solana against Avalanche"; 710.3 "DeFi lending protocols like Aave against Compound"
- 712.9 "three golden rules" (funnel lights); 716.9 "stable cointegration ... more than six months"; 721.8 "daily trading volume of over $10 million"; 730.2 "that manageable half-life" (rules tick 1, 2, 3)
- 733.5 "a fascinating subcategory ... basis pairs"; 737.7 "a single asset on the spot market against its own perpetual future" (right window)

## Slide 6: Three Distinct Execution Architectures. 744.4 to 931.2 (186.8 s)

**Content**
- Title (cyan glow): "Three Distinct Execution Architectures".
- One wide monitor window with a cyan-ruled table, header "Strategy | Mechanics | Target Return | Primary Risk":
  - "**Basis Trading (Spot vs. Perp)**" | "Buy spot asset, open short on the perpetual future." | "~11% up to 110% annualized, derived purely from 8-hour funding rates." + amber "✱ [Claim Unverified]" | "Funding rates flipping negative; short position liquidations during aggressive price rallies."
  - "**Cross-Exchange Arbitrage**" | "Exploit CEX/DEX price discrepancies (e.g., Binance at $87,150 vs Bybit at $87,175). Requires pre-funded balances on both sides." | "Net spread must exceed total taker fees (~0.08%). Requires 1-100ms API latency to compete." amber ✱ | "Speed and execution latency. Spread vanishes before execution."
  - "**Pairs Trading with Leverage**" | "Calculate β. Short Asset Y and Long Asset X · β at +2z. Reverse at -2z." | "30-60% annual using 3x leverage, averaging 2-4 trades per month per pair." amber ✱ | "Correlation breakdowns during macro market crashes."

Article check (section 4): basis: 0.01% per 8 h → ~0.03% per day → ~11% per year; bull market 0.05 to 0.1% per 8 h → 55 to 110%; March 2026 average ~0.015% per 8 h. Cross-exchange: Binance $87,150, Bybit $87,175, spread $25 (0.029%); fees Binance ~0.05% taker with discount + Bybit ~0.03% VIP = ~0.08%, so the spread must exceed 0.08% (the $25 example is NOT profitable). Latency: 10 to 100 ms without colocation, ~1 ms optimized, retail 100 to 500 ms. Pairs: SOL/AVAX, β = 1.3, z > +2 short SOL / long AVAX × β, z < −2 reverse, exit |z| < 0.5 or 30-day timeout, 3x leverage, 3 to 6% per trade, 2 to 4 trades per month, 30 to 60% per year before commissions and slippage. **Slide error**: Binance vs Bybit is CEX vs CEX, not "CEX/DEX"; redraw "Exploit cross-exchange price gaps".

**Sub-scenes (slide > 90 s)**
- 6a Basis trading 744.4 to 837.0 (row 1; collect funding every 8 h, then the negative-funding and liquidation catch)
- 6b Cross-exchange 837.0 to 902.0 (row 2; $25 gap eaten by fees, home Wi-Fi vs colocated server race)
- 6c Pairs with leverage 902.0 to 931.2 (row 3; SOL/AVAX, β 1.3, 30 to 60%)

**Beats**
- 744.4 "the three practical trading approaches"; 750.2 "Approach A is this basis trading" (row 1 highlights)
- 753.8 "buy one actual Bitcoin on the spot market"; 756.9 "short one Bitcoin on the perpetual futures market, you are perfectly hedged"
- 764.6 "If Bitcoin goes to a million dollars or drops to zero, your net position doesn't change" (gag: price rockets and crashes, net line flat)
- 768.8 "you collect the exchange's funding rate every eight hours" (coin drops every 8 h)
- 772.3 "an illustrative 2026 claim of ... 0.015% every single eight-hour window"; 779.4 "annualizes to around 11%" (see errors: 0.015% → ~16%; 11% is the 0.01% case)
- 784.7 "The exchange's own mechanism is basically doing the mean reversion work for you"
- 789.2 "isn't this essentially free money?"; 801.8 "funding rates are variable and they can go violently negative"
- 812.0 "The short positions have to start paying the long positions"; 815.5 "your account is bleeding money every eight hours"
- 822.0 "your short futures position could get automatically liquidated ... before you ... move collateral over from your spot account"
- 837.0 "Approach B is cross-exchange arbitrage" (row 2); 839.8 "Bitcoin is briefly $25 more expensive on Binance than it is on Bybit. You buy on Bybit, sell on Binance" (see errors: direction swapped)
- 849.8 "the source throws cold water ... by breaking down the fees"; 853.9 "Taker fees ... 0.05% on Binance and 0.03% on Bybit" ($25 gap shrinks to nothing)
- 863.2 "And then you have latency"; 868.9 "standard Python scripts from your home Wi-Fi ... 100 to 500 millisecond delay"
- 879.2 "institutional quantitative funds have their servers physically co-located"; 886.0 "one millisecond latency" (race gag: snail vs rocket)
- 889.2 "By the time your script even registers that a price spread exists, the institutional supercomputers have already executed"
- 902.0 "approach C is the core strategy. Pairs trading with leverage" (row 3)
- 908.2 "Solana and Avalanche"; 910.1 "the hedge ratio is 1.3"; 913.1 "When the Z score spikes above 2, we execute"
- 916.8 "We short Solana and we go long on Avalanche, multiplied by that 1.3 ratio"; 921.7 "apply some leverage and wait for the snapback"
- 924.8 "an illustrative annualized return claim of 30% to 60%" (amber ✱ badge)

## Slide 7: Adaptive Architecture: The Kalman Filter. 931.2 to 1090.7 (159.5 s)

**Content**
- Title (cyan glow): "Adaptive Architecture: The Kalman Filter".
- Left top window "The Non-Stationary Problem": "Crypto narratives shift violently (DeFi → NFTs → AI). Estimating β via historical OLS fails as underlying relationships change." "Rolling OLS forces an impossible choice: a short window creates extreme noise, while a long window guarantees massive lag."
- Left bottom window "The State-Space Solution": "The Kalman filter optimally estimates a hidden state (the true α and β) from noisy market observations without hard data truncation."
  - "Observation: Y(t) = α(t) + β(t) · X(t) + ε(t),  ε(t) ~ N(0, R)"
  - "State: [α(t+1), β(t+1)]ᵀ = [α(t), β(t)]ᵀ + w(t),  w(t) ~ N(0, Q)"
  - "Tuning the Machine:" (cyan) "Ratio of state noise (Q) to observation noise (R) dictates adaptivity. Volatile Altcoins: delta = 1e-3.  Stable Pairs: delta = 1e-5."
- Right: large chart window (ticked axes, no numbers): a grey smooth wave "Hidden Trend (True Beta)" (label with arrow), a red staircase "Rolling OLS" (label with arrow) that lags the grey wave by a step, and a glowing cyan smooth curve "Kalman Filter" (label with arrow) hugging the grey wave.

Article check: matches section 5 (observation/state equations, R and Q roles, Q/R ratio, delta 1e-3 for memecoins/small-cap alts, 1e-5 for BTC/ETH and SOL/AVAX). Glitch: the state equation has a stray garbled "w(·)" under the matrix: render clean. Article code details if needed: `KalmanFilter(dim_x=2, dim_z=1)`, x0 = [0, 0], F = I, P = 1000·I, Q = delta·I, R = obs_noise; each step H = [1, X(t)], predict, update with Y(t); spread = Y − α − β·X. "Kalman uses all past observations with exponentially decaying weights".

**Sub-scenes (slide > 90 s)**
- 7a The non-stationary problem 931.2 to 991.0 (narratives drift; static hedge ratio fails; rolling OLS = rear-view mirror with a delay)
- 7b The Kalman filter 991.0 to 1043.6 (state-space; GPS analogy; hidden state, two noises)
- 7c Tuning delta 1043.6 to 1090.7 (Q/R dial: 1e-3 altcoins "adapt fast", 1e-5 BTC/ETH "trust history")

**Beats**
- 931.2 "that return hinges on an enormous assumption"; 938.0 "That the underlying market narrative never changes"
- 942.2 "In crypto, narratives shift at lightning speed"; 945.1 "AI tokens surge, then DeFi comes back, then Layer 2s take over" (narrative labels flip on a carousel)
- 949.8 "The fundamental relationship between two assets is always drifting" (grey true-beta wave appears)
- 953.6 "a static permanent hedge ratio ... will inevitably fail" (flat line diverges from the wave)
- 962.8 "rolling OLS ... a sliding window of the last 30 days" (red staircase draws)
- 972.8 "drive a car down a winding mountain road while only looking in a rearview mirror that has a 5 second delay" (good gag scene)
- 987.7 "Rolling windows are backward looking and slow to adapt"
- 991.0 "The elegant modern solution to this problem is the Kalman filter" (cyan curve draws)
- 995.7 "originally developed for aerospace engineering ... to track the trajectories of rockets" (rocket gag; not in the article, fine as color)
- 1001.7 "doesn't use a fixed window"; 1004.0 "a state space model" (equations write in)
- 1007.5 "the Kalman filter is like a modern GPS system that is constantly recalculating your route" (GPS gag)
- 1021.0 "the true relationship ... is a hidden state that is constantly drifting"
- 1032.6 "Observation noise ... and state noise"; 1043.6 "the Q and R matrices ... the ratio between them is everything" (dial)
- 1050.6 "highly volatile altcoins ... delta ... 1 times 10 to the negative 3"; 1062.2 "adapt to new prices quickly"
- 1076.3 "a historically stable pair, like Bitcoin and Ethereum ... 10 to the negative 5"; 1084.7 "trust the historical relationship"

## Slide 8: Execution Logic: Signal Generation and Filtering. 1090.7 to 1199.8 (109.1 s)

**Content**
- Title (cyan glow): "Execution Logic: Signal Generation and Filtering".
- Large chart window: a glowing cyan sine-like spread across the width. Horizontal lines: "+4σ" (red, red warning triangles at both ends), "+2σ" (cyan), "0" (cyan, small hollow circle markers at every zero crossing), "−2σ" (cyan), "−4σ" (red, warning triangle at the right). Green hollow DOWN arrows above the curve at the points where it falls back through +2σ after a peak (3 of them); green hollow UP arrows below the curve where it rises back through −2σ after a trough (2 of them). The curve never touches ±4σ.
- Three windows below:
  - "The Baseline Engine": "• **Entry**: Trigger at |z| > 2.0. Spread has deviated enough to justify capital deployment." "• **Exit**: Trigger at |z| < 0.5. Spread has reverted to the mean to lock in profit."
  - "Advanced System Filters": "• **Momentum**: Do not blindly enter at z=2 if the spread is violently accelerating. Wait for the z-score to mathematically reverse direction." "• **Volatility Scaling**: Dynamically raise entry thresholds during panics." "• **Cointegration Check**: Suspend trading if rolling ADF test p-value > 0.1."
  - "The Time-Based Stop": "• Forcibly close position if open longer than 2× the calculated half-life without mean reversion. The cointegration structure has likely failed."

Article check: matches section 6 (`generate_signals(lookback=60, entry_z=2.0, exit_z=0.5, stop_z=4.0)`; z > +2 → short spread = short Y / long X; z < −2 → long spread; stop |z| > 4; momentum, volatility and cointegration filters (p > 0.1 pause); time exit at 2× half-life). The arrows on the chart are drawn at the "reversal" entry, which is the momentum-filter version of the entry.

**Sub-scenes (slide > 90 s)**
- 8a Entry and momentum filter 1090.7 to 1141.1 (falling-knife gag)
- 8b Other filters and the time stop 1141.1 to 1199.8 (5-day half-life, day 10, leash snapped, cut the loss)

**Beats**
- 1090.7 "the Kalman filter gives our algorithm this beautifully smooth, dynamically adapting Z-score"; 1100.0 "know exactly when to enter and exit"
- 1104.8 "This brings us to the signals"; 1107.0 "entering at a Z-score of 2.0 ... strict filters on top of that, like a momentum filter" (curve crosses +2σ)
- 1114.3 "a Z-score of 2.0 tells you the leash is stretched. It does not tell you if the leash is about to stretch to 5.0"
- 1122.9 "wait until the spread actually stops widening and physically begins reversing ... before it sends the buy order" (green arrow appears at the turn)
- 1133.5 "not trying to catch a falling knife"; 1137.6 "wait for it to hit the floor and bounce before you grab it" (gag)
- 1141.1 "a volatility filter which automatically widens your entry thresholds if the broader market is in a panic" (±2σ lines move outward)
- 1149.4 "a cointegration filter ... a continuous background check"
- 1160.1 "Time-based exits"; 1162.7 "open for longer than twice the expected half-life, you force close it, even at a loss" (timer)
- 1173.5 "Throwing in the towel is a required survival skill"
- 1179.5 "your math predicted the spread would revert in five days and you are sitting there on day 10" (calendar 5 → 10)
- 1188.5 "The leash snapped"; 1190.3 "Holding onto that position and praying ... It's just gambling"; 1197.0 "You cut the loss and free up the capital"

## Slide 9: Rigorous Validation: Walk-Forward Analysis. 1199.8 to 1345.2 (145.4 s)

**Content**
- Title (cyan glow): "Rigorous Validation: Walk-Forward Analysis".
- Left top window "The Overfitting Trap": "Standard 'train on all / test on all' backtesting generates wildly optimistic, functionally useless results for statistical arbitrage." "The Walk-Forward Protocol forces the system to estimate parameters on the past and trade only on unseen future data."
- Left middle window "The Friction Reality Model": "An average pairs round-trip requires 4 total trades." "• Maker/Taker Fees: 0.02% to 0.075%" "• Bid/Ask Spread: 0.01% - 0.05%" "• Slippage Impact: Modeled as k · √(size/ADV)" "Net Result: (cyan) Minimum ~0.3% to 0.5% cost per round trip. Target profit must exceed this threshold for positive expected value."
- Left bottom amber-bordered box: "Baseline Target Benchmarks" (amber) "[Claims Unverified]" / "Sharpe Ratio > 1.5 | Max Drawdown < 15% | Calmar Ratio > 2.0".
- Right chart window "Walk-Forward Stepping Stones": four staggered rows descending left to right. Each row is a dark-blue bar "Train (180d)" with a small left-pointing arrow inside it, ending in a teal block "Test (30d)"; teal elbow arrows run from each Test block down to the next row's Test block. X axis "Jan Feb Mar Apr May Jun Jul Aug Sep Oct" and an arrow "TIME →".

Article check: matches section 7 (train 180 d, test 30 d, step 30 d; cost table maker 0.02%, taker 0.05 to 0.075%, slippage 0.01 to 0.1%, funding ±0.01%/8h, bid-ask 0.01 to 0.05%; 4 trades per round trip; total ~0.3 to 0.5%; average profit per trade must exceed 0.5%; square-root impact k·√(size/ADV), linear model k·(size/ADV) with k ≈ 0.1 top-10, 0.3 to 0.5 alts; benchmarks Sharpe > 1.5, max DD < 15%, Calmar > 2.0, profit factor > 1.5). The chart is schematic, not to scale (180 d drawn as ~4 months, rows shift ~1.5 months instead of 30 d). When redrawing, step each row by exactly one Test width. "Minimum ~0.3%" should be "about 0.3 to 0.5%".

**Sub-scenes (slide > 90 s)**
- 9a Overfitting 1199.8 to 1259.4 (perfect key for yesterday's lock gag)
- 9b Walk-forward 1259.4 to 1287.0 (stepping stones animate row by row)
- 9c Costs and benchmarks 1287.0 to 1345.2 (cost stack 0.3 to 0.5%; a 0.2% target bleeds to zero; Sharpe/DD/Calmar)

**Beats**
- 1199.8 "the ultimate reality check for any quant. Backtesting"
- 1211.9 "traditional backtesting ... tuning your parameters until they perfectly capture every price movement ... is totally useless"
- 1223.2 "the danger of overfitting"; 1226.0 "a model that perfectly predicted the past with 100% accuracy"
- 1233.5 "it will fail catastrophically the second it encounters new unseen data"
- 1246.1 "filing a perfect key to fit a lock that existed yesterday"; 1253.9 "The lock you face tomorrow is going to have completely different tumblers" (good gag scene)
- 1259.4 "serious developers use walk forward analysis"
- 1264.5 "train your model on a strict window, say 180 days" (Train bar 1); 1270.8 "lock the parameters and then you test it on the next 30 days of unseen data" (Test 1)
- 1277.2 "step the whole process forward by 30 days and repeat" (rows 2 to 4 step in)
- 1287.0 "brutally account for transaction costs"; 1291.5 "maker and taker exchange fees, bid ask spreads, slippage ... funding rates" (cost bars stack)
- 1300.3 "roughly 0.3% to 0.5% in total transaction friction"
- 1308.1 "only targeting a 0.2% profit per trade ... slowly bleed your account to absolute zero"
- 1319.1 "unverified benchmark metrics"; 1324.5 "a Sharpe ratio over 1.5"; 1329.7 "a maximum drawdown strictly under 15%"; 1337.0 "a Calmar ratio over 2.0" (amber box fills)
- 1339.9 "illustrative 2026 targets from the text. Absolutely not guaranteed results"

## Slide 10: Structural Vulnerabilities and Real-World Failure Modes. 1345.2 to 1500.4 (155.2 s)

**Content**
- Title (AMBER glow, the only non-cyan title): "Structural Vulnerabilities and Real-World Failure Modes". The palette switches to amber, orange and red.
- One monitor window with three amber-bordered cards:
  - "Catastrophic Slippage" + amber warning triangle. Illustration: a big cracked orange block with an arrow inside, pushing (orange arrow) into a thin order-book ladder of small bars beside a dashed vertical line. "**The Threat:** A $50K order on a $5M ADV altcoin moves the price by 0.2-0.5%. Pairs trading doubles this friction. Mid-price backtests ignore this." "**The Mitigation:** Deploy limit orders (maker fees), execute via TWAP/VWAP, and strictly cap sizing at 1-2% of Average Daily Volume."
  - "Funding Rate Reversals" + warning triangle. Illustration: bar chart with 5 green positive bars (rising to a peak), a curved orange arrow arcing down, then 5 red negative bars. "**The Threat:** Basis trading exposes the system to negative funding. In Dec 2022, longs paid shorts -0.02% per 8h (a $60 daily bleed per $100K position)." "**The Mitigation:** Real-time systemic monitoring and cross-exchange funding rate arbitrage routing."
  - "Crisis Correlation Breakdowns". Illustration: a glowing orange chain with the middle link shattering into shards, plus decorative pseudo-formulas ("f(z) = ∂²/∂x₁ (σ)²", "f(z) = [...σ]²") that are gibberish (do not redraw). "**The Threat:** The Achilles heel of stat arb. During macro crashes, correlations spike to 1 (all assets drop), but cointegration breaks (spreads blow out to 10σ and never return). Picking up pennies in front of a steamroller." "**The Mitigation:** Hard 4σ stop-losses, strict leverage limits (2-3x max), VIX-based capital scaling, and portfolio diversification (10-20 pairs)."

Article check (section 8): slippage, $5M ADV / $50K / 0.2 to 0.5%, doubled on two legs, maker orders, TWAP/VWAP, max 1 to 2% of ADV: match. **Error**: "In Dec 2022, longs paid shorts −0.02% per 8h". With negative funding SHORTS pay LONGS; that is why the long spot + short perp position was paying. Redraw: "Dec 2022: BTC funding −0.02% per 8h. The short perp pays: ~$60/day per $100K." "Correlations spike to 1" is an exaggeration: the article says correlations intensify (everything falls together) while cointegration breaks and the spread "can fly to 10σ and never return". Crashes listed in the article: March 2020, May 2021, November 2022, August 2024. Capital tiers (narrated at 1486 s, not on any slide): basis from $50K, cross-exchange from $100K, 10-pair portfolio from $200K, institutional from $1M.

**Sub-scenes (slide > 90 s)**
- 10a Slippage 1345.2 to 1394.0 (card 1; $50K order eats the book, double slippage)
- 10b Funding reversal 1394.0 to 1417.3 (card 2; Dec 2022, $60/day)
- 10c Crisis breakdown 1417.3 to 1484.6 (card 3; everything crashes, spread to 10σ, steamroller gag, mitigations)
- 10d Capital requirements 1484.6 to 1500.4 ($50K to $200K, add a small caption; no slide content)

**Beats**
- 1345.2 "the article transitions into real world problems"; 1350.1 "theory always breaks down in live markets" (title turns amber)
- 1352.0 "Let's look at slippage"; 1356.4 "In a Python backtest, you execute instantly at the perfect mid price"
- 1363.0 "a $50,000 market order on a smaller altcoin that only processes a few million dollars in daily volume" (block hits the ladder)
- 1375.4 "Your order eats through the order book, pushing the price in the worst possible direction" (bars get eaten)
- 1379.6 "because this is pairs trading, you are suffering that slippage on two different assets"; 1385.6 "double slippage"
- 1387.9 "can instantly vaporize whatever tiny theoretical margin your Kalman filter just identified"
- 1394.0 "funding rate risks"; 1396.7 "a terrifying historical example from December 2022" (card 2)
- 1401.0 "Traders who thought they were completely safely hedged ... paying $60 a day per $100,000"; 1413.3 "funding rates went violently negative during a bear market panic" (green bars flip red)
- 1417.3 "the absolute worst case scenario is a correlation breakdown during a macro crisis"; 1421.6 "March 2020, May 2021, August 2024" (dates stamp)
- 1426.6 "correlations across the entire market go to 1.0"; 1432.0 "Everything crashes simultaneously"
- 1437.7 "the spreads between them, the cointegration we rely on, can blow up violently"; 1444.7 "widen out to 10 standard deviations and simply never return" (chain link shatters)
- 1449.0 "picking up pennies in front of a steamroller" (good gag scene); 1459.9 "tiny, consistent ... profits for six months and then one unforeseen macroeconomic event completely flattens you"
- 1468.9 "defense over offense"; 1472.9 "Strict hard-coded stop losses, capping leverage at a maximum of 2x or 3x, diversifying across ... 10 to 20 different pairs" (mitigation lines tick)
- 1482.3 "So one broken leash doesn't wipe you out"
- 1486.5 "requires significant capital"; 1491.6 "50,000 to $200,000 of working capital"

## Slide 11: System Blueprint: Verification & Walk-Forward Logic. 1500.4 to 1545.2 (44.8 s)

**Content**
- Title (cyan glow): "System Blueprint: Verification & Walk-Forward Logic".
- One large terminal window (black, mono, syntax colors: comments green, keywords blue, function names orange, numbers orange). A big diagonal orange stencil watermark across the code: "INSTRUCTIONAL CODE ONLY - / REQUIRES HUMAN REVIEW & FACT CHECKING". Blinking white block cursor at the bottom left. Code exactly:

```python
# 1. Cointegration Pipeline
import statsmodels.tsa.stattools as ts
def test_coint(y, x):
    # OLS for hedge ratio
    beta = calculate_hedge_ratio(y, x)
    # ADF test on the spread
    spread = y - beta * x
    p_value = ts.adfuller(spread)[1]
    # Calculate half-life via secondary regression
    return p_value, beta, half_life

# 2. Kalman Filter Instantiation
from filterpy.kalman import KalmanFilter
kf = KalmanFilter(dim_x=2, dim_z=1)
kf.Q = np.eye(2) * delta  # State noise matrix

# 3. Simulation Loop
for t in range(len(data)):
    kf.predict()
    kf.update(price_y[t])
    alpha, beta = kf.x[0], kf.x[1]
    # Track P&L minus modeled fee and slippage rates
```

Article check: **code bugs** vs the article's section 9 code. (1) `half_life` is returned but never computed. (2) The spread omits the intercept: article uses OLS with a constant, `spread = y - alpha - beta * x`, plus `coint(y, x)` for the Engle-Granger p-value. (3) The Kalman loop never sets `kf.H = np.array([[1.0, prices_x[t]]])` before `update`, which is what makes the state equal to [α, β]. Article indexing is `kf.x[0, 0]`, `kf.x[1, 0]`. If code is shown on screen, use a short excerpt of the article's `test_cointegration` and `PairsBacktester.run` instead (`fee_rate=0.001`, `slippage_rate=0.0005`, `lookback=60`, `kalman_delta=1e-4`).

**Beats**
- 1500.4 "we have covered the history, the math, the triggers and the brutal reality checks"
- 1506.3 "the final section of the article provides an end to end Python implementation blueprint" (terminal opens, code types in)
- 1515.3 "using the ccxt library to ... pull live data across different exchanges" (ccxt chip)
- 1519.0 "statsmodels to run the Engle-Granger and ADF tests" (block 1 highlights)
- 1523.5 "filterpy to build the Kalman filter" (block 2); 1528.0 "wrapping inside a walk forward backtester class" (block 3)
- 1530.5 "We must be incredibly explicit about this code"; 1533.5 "purely instructional"; 1536.4 "a conceptual skeleton" (stencil stamps down)
- 1540.8 "Under no circumstances is this production ready software"

## Slide 12: System Blueprint: Live Execution Skeleton. 1545.2 to 1600.8 (55.6 s)

**Content**
- Title (cyan glow): "System Blueprint: Live Execution Skeleton".
- Terminal window, same style, diagonal orange stencil "INSTRUCTIONAL SKELETON / NOT PRODUCTION READY - NO RETRIES". Code exactly:

```python
# 1. Data Intake & State Persistence
import ccxt, asyncio
async def update_tick():
    # Fetch order book / ticker data async
    price_y = exchange.fetch_ticker(symbol_y)['last']
    # Maintain self.kf Kalman state continuously
    self.kf.update(price_y)

# 2. Z-Score Warmup & Signal
    if len(spread_history) > 60:
        z_score = (current_spread - rolling_mean) / rolling_std
        if abs(z_score) > 2.0:
            execute_trade(z_score)


# 3. Execution Routing
def execute_trade(z_score):
    size_y = position_limit / price_y
    size_x = (position_limit * beta) / price_x
    # Dispatch corresponding long/short maker/taker orders
```

- Red-bordered alert box at the bottom with a red warning triangle: "Missing Production Elements Required for Deployment:" (red) "Websocket ingestion (REST is too slow), API retry loops, rate-limit handling, and real-time balance reconciliation." (white)

Article check: paraphrases `LivePairsTrader` (warm-up: skip while fewer than 60 spreads; window 60; entry_z 2.0; exit_z 0.5; `size_y = position_size / price_y`, `size_x = position_size * beta / price_x`; `run_loop(interval_seconds=60)`). Skeleton issues: no exit branch (the article closes when the z-score returns inside ±0.5), and the Kalman update lacks `predict()` and `H = [1, price_x]`. The article's own TODO list: "retry logic, monitoring, alerts, balance reconciliation". Narration adds partial-fill / unbalanced-leg handling (not on the slide, fine to show as a 5th missing item).

**Beats**
- 1545.2 "the live pairs trader async loop ... missing all the boring, but totally mission critical plumbing" (terminal opens)
- 1553.7 "what happens if the Binance API drops your connection mid trade? There is no retry logic" (connection cable unplugs)
- 1559.5 "a partial fill on your Solana order, but your Avalanche order fills completely"; 1564.6 "You're left totally exposed" (one leg full, one half)
- 1566.9 "no error handling for unbalanced legs"; 1569.7 "no background balance reconciliation" (alert box items tick)
- 1572.6 "paste your API keys into this instructional script and walk away ... guaranteed to blow up your account" (gag: bomb fuse)
- 1579.5 "Building the mathematical logic is maybe 20% of the actual job"; 1583.7 "The remaining 80% is the grueling software engineering" (see errors: slide 13 says 10/90, neither is in the article)
- 1588.4 "fails safely when an exchange inevitably goes down for unannounced maintenance"
- 1594.4 "requires intense human review and primary fact checking"

## Slide 13: The Reality of the Infrastructure. 1600.8 to 1705.32 (104.5 s)

**Content**
- Title (cyan glow): "The Reality of the Infrastructure".
- One window with three columns and a banner:
  - Left "The Engineering Chasm" (cyan): "Understanding cointegration theory is only 10% of the battle. The remaining 90% is grueling infrastructure engineering: **async data processing, friction modeling, and risk containment.**"
  - Center chart: axes "Price Spread" (vertical) and "Time"; a blue cone/funnel narrowing from left to right toward a thin zero line, a green noisy spread inside it whose swings shrink with the cone. Five big glowing white-blue arrows press down from the top, label "Institutional Capital Flows".
  - Right "The Closing Window" (cyan): "Crypto currently possesses inefficiencies (fragmented liquidity, basis funding) that were arbitraged to absolute zero decades ago on traditional equities markets." "However, margins are rapidly compressing. Total arbitrage capital on crypto exchanges reportedly grew by 215% in 2025." Amber box with warning triangle: "[Unverified Source Claim]".
  - Bottom banner (blue glowing border): "FINAL SYSTEM MAXIM:" (green) "The only strategy guaranteed to work is strict risk management." (white)

Article check: conclusion matches ("the window is closing", "arbitrage capital ... grew by 215% in 2025" by estimates, "the only strategy that's guaranteed to work is risk management"). **Invented numbers**: the "10% / 90%" split (slide) and "20% / 80%" split (narration, 1579.5) are not in the article and contradict each other. The article says only that "between 'I know what cointegration is' and 'I have a consistently working strategy' lies a chasm of engineering details: proper data processing, correct walk-forward backtesting, a realistic slippage model, real-time monitoring." Drop the percentages and draw the chasm.

**Sub-scenes (slide > 90 s)**
- 13a Engineering chasm and closing window 1600.8 to 1663.7 (left column, cone chart with arrows, 215%, maxim banner)
- 13b Outro question 1663.7 to 1705.32 (story vs statistics callback; "the Jesuit physicist of 2030")

**Beats**
- 1600.8 "what is the ultimate takeaway?"; 1604.9 "not some magical holy grail ... It is an engineering discipline"
- 1613.2 "a massive chasm between knowing how to calculate an augmented Dickey-Fuller test in a Jupyter notebook and actually maintaining a live, robust, profitable infrastructure" (chasm gag: notebook on one cliff, server rack on the other)
- 1624.1 "a generational window of opportunity ... fragmented liquidity and unique mechanics"
- 1632.9 "the window is rapidly closing"; 1638.2 "arbitrage capital ... grew by 215% in 2025 alone" (215% counter + amber tag)
- 1646.8 "The server hardware is getting faster, the latency is dropping ... inefficiencies are being systematically squeezed out" (arrows press, cone narrows)
- 1655.4 "The steamrollers are getting faster and the pennies are getting smaller" (callback gag)
- 1658.6 "The only truly guaranteed strategy ... is flawless risk management" (maxim banner)
- 1663.7 "nothing discussed today was financial advice"
- 1670.2 "traditional investing is like reading a story, but algorithmic trading strips the narrative away" (callback to the cold open)
- 1678.5 "if the institutional supercomputers ... succeed in arbitraging all of these crypto inefficiencies completely down to zero"; 1687.3 "what new wild undiscovered frontier will the Jesuit physicist of the year 2030 be turning their servers toward next?"
- 1698.0 "the market is a living system. It will always find a new inefficiency"; 1702.6 "Something for you to ponder. Until next time."

---

## NotebookLM errors and corrections (use the corrected version)

Slides:
1. Slide 3: "Trading based on correlation guarantees ... a convergence that mathematically never arrives" → "can leave you waiting for a convergence that never comes". Garbled y-axis numbers: draw no numbers.
2. Slide 4: Johansen network duplicates ETH and SOL (draw 3 nodes). OU bullet garbled "Shorter is by fees" → "Shorter: commissions eat the profit; longer: regime-change risk". Kalman/OU formulas otherwise correct.
3. Slide 5: "The spread (funding rate) is stationary" is wrong. The basis (perp − spot) is stationary; funding is what pulls it back. "Most mathematically reliable" → "one of the most reliable". "(Highest Stability)" is NotebookLM framing.
4. Slide 6: "CEX/DEX price discrepancies" with a Binance vs Bybit example (both CEX) → "cross-exchange price gaps". The $25 (0.029%) example is below the ~0.08% fee hurdle, i.e. not profitable.
5. Slide 7: garbled glyph in the state equation; render `[α(t+1), β(t+1)]ᵀ = [α(t), β(t)]ᵀ + w(t)` clean.
6. Slide 9: walk-forward chart not to scale (step must equal the 30 d test window); "Minimum ~0.3%" → "about 0.3 to 0.5%".
7. Slide 10: "In Dec 2022, longs paid shorts −0.02% per 8h" is backwards: with negative funding shorts pay longs, so the short perp paid ~$60/day per $100K. "Correlations spike to 1" → "correlations intensify". Decorative pseudo-formulas are gibberish.
8. Slide 11: code is not runnable: `half_life` never computed, spread without intercept, Kalman loop never sets `H = [1, x_t]`. Use the article's code if code is shown.
9. Slide 12: skeleton lacks the exit branch (|z| < 0.5) and the Kalman predict/H steps.
10. Slide 13: "10% / 90%" is invented (narration says "20% / 80%", also invented). The article says only "a chasm of engineering details".

Narration:
11. 333.4 "If Bitcoin and Ethereum go up together 85% of the time": the article's 0.85 is a correlation coefficient of returns, not "85% of the time". On screen show "ρ = 0.85".
12. 772.3 to 779.4 "0.015% every eight-hour window ... annualizes to around 11%": wrong. 0.015% × 3 × 365 ≈ 16.4%. The ~11% figure is for the average 0.01% per 8 h; 0.015% is the article's March 2026 average. Show "0.01%/8h → ~11%/yr" and, separately, "Mar 2026 avg ~0.015%/8h".
13. 839.8 "Bitcoin is briefly $25 more expensive on Binance than it is on Bybit. You buy on Bybit, sell on Binance": direction swapped. Article: Binance $87,150, Bybit $87,175, so buy on Binance and sell on Bybit. Draw the article's direction.
14. 125.6 "Morgan Stanley in 1987": the article dates the team to the mid-1980s; 1987 to 1988 were the best years ($50M in 1987). Fine as "1987: the breakout year".
15. 962.8 "a sliding window of the last 30 days" and 995.7 "originally developed ... to track the trajectories of rockets": not in the article (hosts' color). Don't put "30 days" on screen as an article figure.
16. 1291.5 "hourly funding rates": the article's cost table uses funding ±0.01% per 8 h.
17. 1426.6 "correlations across the entire market go to 1.0": exaggeration, same fix as slide 10. The narration's crisis list omits November 2022 (the article lists March 2020, May 2021, November 2022, August 2024).
18. 1638.2 "institutional arbitrage capital ... grew by 215%": the article says "the volume of arbitrage capital on crypto exchanges grew by 215% in 2025" (by estimates), not "institutional".

## Timing notes

`sync_slides.py` (defaults) degenerated ("showed 7/13 slides, longest held 91%") and fell back to an even split (`timeline_auto_evensplit.json`, about 131 s per slide). It is off by up to two minutes (slide 3 would start at 262 s vs the real 311.2 s; slide 6 at 656 s vs 744.4 s; slide 11 at 1312 s vs 1500.4 s).

`slide_starts.json` is set by hand from topic transitions. The deck follows the narration 1:1 (article sections 1 to 9 and the conclusion).

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | intro | high |
| 2 Lineage | 111.6 | "So to understand where this wild quantitative crypto strategy even comes from, we ... need to rewind the clock" | high |
| 3 Correlation trap | 311.2 | "But to survive that chaos, your mathematical foundation has to be flawless" (correlation named at 321.6) | medium (could be 316.4 "massive flashing warning sign"; 311 to 321 is a bridge sentence) |
| 4 Verification & normalization | 452.2 | "to mathematically prove that leash exists, quants rely on ... the Engle-Granger two step test" | high |
| 5 Sourcing pairs | 622.5 | "Okay, so we've built the mathematical engine ... what kind of fuel" | high |
| 6 Three architectures | 744.4 | "it leads right into the three practical trading approaches" (basis pairs 733.5 to 744.4 stays on slide 5's right window) | high |
| 7 Kalman filter | 931.2 | "But, and this is a massive but, that return hinges on an enormous assumption" (narrative shifts → static hedge ratio) | medium (alternative 953.6 "a static permanent hedge ratio ... will inevitably fail"; 931 to 953 is the bridge) |
| 8 Signals & filters | 1090.7 | "the Kalman filter gives our algorithm this beautifully smooth ... Z-score, but ... when to enter and exit" | high |
| 9 Walk-forward | 1199.8 | "the ultimate reality check for any quant. Backtesting" | high |
| 10 Failure modes | 1345.2 | "as the article transitions into real world problems" | high |
| 11 Code: verification | 1500.4 | "So we have covered the history, the math ... the final section ... Python implementation blueprint" | high |
| 12 Code: live skeleton | 1545.2 | "If you just look at the live pairs trader async loop they provide" | high |
| 13 Infrastructure reality | 1600.8 | "So after digging through all of this, what is the ultimate takeaway?" | high |
