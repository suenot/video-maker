# attractors-algotrading (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts: H1 = curious host who opens with the funnel, H2 = explainer), 15-slide NotebookLM deck.
Article: `marketmaker-cc-landing/src/content/blog/attractors-algotrading.en.md` ("Attractors in HFT: When Mathematics Meets the Market", 2025-05-30, 20 references).

- Audio: `input/notebooklm-sources/attractors-algotrading/en/audio.m4a`, 1418.04 s (23:38.0), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has `words[]`). Timestamps below are segment starts, accurate to ~0.5 s.
- Timing: `slide_starts.json` (index = slide number - 1) and `timeline.json`. See "Timing notes".
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed; regenerate with `pdf_to_images.py --dpi 200`).

Deck visual language: warm off-white paper (#F1EFE8-ish) with faint grey construction lines/arcs, navy ink (#23365A) for lines, arrows and mono body text, burnt orange (#C8642B) for the attractor / mean / highlights, a dark slate (#3A3F47) for header bars. Grotesk sans titles numbered like the article's H2s ("1. ...", "2. ..."); body text mostly monospace. Bottom boxes are thin navy rectangles with bold mono lead-ins ("The Trading Reality:", "The Butterfly Effect:"). "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper/host mis-readings, fix in captions): "face-face" (175.8) = phase space; "Algalator" (815.3, 836.6) = Algoter; "GoldSeek" = Goldseek; "trade help robot" (1002.0) = TradeHelp robot; "Johansson test" (1027.8) = Johansen test; "PA / PB" = P_A / P_B; "Plain Devil's Advocate" (1076.0) = play devil's advocate; "the tech states" (929.5) = the text states; "in illusion" (1132.8) = an illusion; "to space" (361.7) = of space. At 81.6 the host reads an internal source filename ("MMArticleAttractors-Algotrading-...") aloud: never put that on screen.

---

## Slide 1: Title. 0.0 to 101.2 (101.2 s)

**Content**
- Right: title (3 lines, heavy sans) "Attractors in HFT: / When Mathematics / Meets the Market"; subtitle "How the concept of attractors and cointegration helps build market-neutral strategies and understand market dynamics."
- Left: big navy wireframe funnel (hyperboloid mesh) with an orange ball near the rim and an orange spiral trajectory winding down into the narrow throat; garbled limit labels around it ("lim x→x*", "lim x→x* (u|s_j = A^∞)", "lim x→x* (attractor)").
- The funnel's right lip flares into a field of flow lines/arrows that run into a candlestick price chart (green/black candles, volume bars below) with a grey "Resistance" band, grey "Support" band and an orange "Mean-reversion" curve; axis tick labels are garbled.
- Mono bracket box bottom right: "Author: suenot / Date: 2025-05-30 / Tags: [attractors, cointegration, HFT, algorithmic trading, mathematics]".

Fixes: the `lim` formulas and chart tick labels are meaningless AI artefacts; redraw only `lim t→∞ x(t) ∈ A` (or no formula). Article tags also include market, strategies, fractals, chaos.

**Beats**
- 0.0 "you take a marble ... drop it into a plastic funnel" (ball appears at rim)
- 5.3 "flick it hard around the rim so it circles wildly"; 10.7 "or drop it gently near the middle"
- 13.0 "spiraling tighter and tighter until it hits the exact center" (spiral down)
- 23.3 "That center point is an attractor"; 26.7 "a point of convergence for every possible path"
- 33.1 "financial markets work in a similar way ... asset prices" (funnel morphs into chart, as in the slide)
- 49.0 "Welcome to today's Deep Dive"; 54.3 "where pure mathematics and chaos theory crash right into high-frequency algorithmic trading"
- 66.7 "Abstract physics and Wall Street servers"
- 73.8 "a single highly detailed source" (title + author box; skip the filename read at 81.6)
- 90.2 "the exact same math that explains a draining bathtub or the butterfly effect"

## Slide 2: 1. What is an Attractor and Why Does a Trader Need It? 101.2 to 267.6 (166.4 s)

**Content**
- Title "1. What is an Attractor and Why Does a Trader Need It?"
- Left column header "Left (Physical World)" (NotebookLM left its layout note in the header: redraw as "Physical World"): pendulum from a ceiling bar, two navy bobs at the extremes with curved double arrows toward the center, dashed damped swing arcs converging to an orange bob at the lowest point.
- Right column header "(Mathematical/Market)": square phase portrait with axes; ~12 navy trajectories start at grey dots around the edge and spiral into an orange blob at the center.
- Under left: "**The Metaphor:** It is a point or region that "pulls" the system like a magnet—just like water draining to a plughole or a pendulum stopping at its lowest point."
- Under right: "**Definition:** An attractor is a compact subset of the phase space of a dynamical system, to which all trajectories from a certain neighborhood tend as time approaches infinity."
- Bottom box: "**The Trading Reality:** In financial markets, attractors are specific prices or recurring patterns the market repeatedly returns to. Equilibrium price acts as an attractor, explaining why asset prices oscillate around specific levels rather than flying off to infinity."

Article check: matches section "What is an Attractor" verbatim.

**Beats**
- 101.2 "start with that fundamental concept"; 109.0 "what an attractor does in a physical space"
- 117.2 "think of a pendulum swinging"; 120.7 "if there's friction ... it eventually comes to a dead stop at its lowest point" (pendulum damps to orange bob)
- 128.7 "That lowest resting point is its attractor"
- 131.3 "a bathtub"; 134.1 "the water drains and always goes to the plug hole"; 138.2 "no matter how many random swirls" (optional bathtub vortex gag)
- 144.7 "human behavior has attractors"; 149.2 "ingrained daily habits"
- 168.5 definition read aloud: 175.8 "a compact subset of the phase space ... as time approaches infinity" (definition text types out)
- 186.1 "I need a translation for that before my brain melts"
- 191.4 "mapping every possible state ... all the prices, volumes, and momentum"; 198.6 "That map is the phase space" (phase-portrait axes draw)
- 203.3 "the specific neighborhood on that map where the system inevitably ends up" (trajectories spiral in)
- 219.6 "almost like a gravitational field"
- 222.7 "in financial markets ... this attractor is an equilibrium price"; 231.4 "bounce around wildly on a given Tuesday, but ... pulled back" (bottom box)
- 237.7 caveat: 243.2 "Treating market equilibrium as an attractor is a conceptual claim made by the article"; 253.4 "not a physical law guaranteeing a price must revert"; 256.9 "Treating it as a physical certainty is basically how hedge funds blow up"; 263.5 "a lens to view probability ... not a crystal ball"

## Slide 3: 2. Theoretical Foundations: From Simple to Complex. 267.6 to 447.0 (179.4 s), split

**Content**
- Title "2. Theoretical Foundations: From Simple to Complex"
- Three columns separated by thin vertical rules:
  1. "Point Attractor": 8 navy arrows radiating inward to an orange dot. Mono: "The system settles at a single point (e.g., a stopping pendulum)." Italic: "Market Analogy: The fair value of an asset calculated from fundamentals."
  2. "Limit Cycle": a tilted navy ellipse with 4 arrowheads circulating. Mono: "The system moves cyclically along a closed trajectory without settling." Italic: "Market Analogy: Seasonal price fluctuations or technical support/resistance levels."
  3. "Strange / Fractal Attractor": Lorenz butterfly (two lobes, navy and orange interleaved strands). Mono: "Aperiodic trajectories remain within a bounded fractal space, revealing hidden order in chaotic behavior." (slide has a duplicated "order order" typo)
- Bottom box: "**The Butterfly Effect:** Discovered by Edward Lorenz. Represents sensitive dependence on initial conditions. In markets, tiny local events or data fluctuations can trigger unpredictable, massive price jumps."

Article check: matches. Lorenz equations are not in the article; for an animated butterfly use the standard Lorenz system (sigma 10, rho 28, beta 8/3) as decoration only. The rounding anecdote (.506127 to .506, 398.4) and Brazil/Texas tornado (408.1) are historically accurate Lorenz lore but not from the article.

### 3a Point attractor and limit cycle. 267.6 to 339.4
- 267.6 "what do these mathematical magnets actually look like?"
- 284.2 "the simplest form ... a point attractor, like the pendulum coming to a dead stop" (column 1: arrows converge)
- 290.7 "an asset's fundamental fair value"
- 305.5 "the second type, the limit cycle"; 308.8 "moves cyclically along a closed trajectory" (column 2: dot orbits the ellipse)
- 316.0 "heating oil prices ... up every winter and down every summer"
- 325.6 "support and resistance ... a $10 floor and a $15 ceiling" (illustrative numbers from the host, fine to show as an example)
- 334.4 "still bounded ... but it's in constant motion"
### 3b Strange attractors and the butterfly effect. 339.4 to 447.0
- 339.4 "the third and most complex type, strange attractors" (column 3: Lorenz trace draws itself)
- 353.3 "Strange attractors are fractal"; 356.2 "aperiodic ... never repeats the exact same path twice"; 361.7 "remains completely within a bounded region of space"
- 370.5 "hidden, highly complex order inside behavior that looks completely random"
- 376.9 "the Lorenz attractor"; 381.0 "Edward Lorenz, the meteorologist who essentially founded chaos theory"; 384.4 "the butterfly effect" (bottom box)
- 391.7 "a microscopic change in the starting data, like rounding .506127 to .506" (two Lorenz traces from nearly equal starts diverge)
- 408.1 "a butterfly flapping its wings in Brazil ... a tornado in Texas"
- 420.8 "minor local events triggering massive, totally unpredictable global market jumps"
- 431.9 "bounded by strange attractors, but the exact path ... is fiercely sensitive"

## Slide 4: 3. Attractors in Financial Markets. 447.0 to 604.0 (157.0 s)

**Content**
- Title "3. Attractors in Financial Markets"
- Lead: "**Conceptual Claim:** The market's tendency to revert to an equilibrium state is an attractor analogy, not a guaranteed proof of reversion."
- Top row: a timescale ruler labelled "Microseconds" / "Minute" with tick marks (garbled labels "10", "min") and a grey zoom cone into a box where a green stepped line (falling) and an orange stepped line (rising) converge onto a navy horizontal arrow, orange double arrows marking the shrinking gap. Text: "**High-Frequency Scale:** Motivated by arbitrage. Driven by the "Law of One Price"—identical assets must trade at the same price across different markets, creating immediate attractors to close arbitrage gaps."
- Divider line.
- Bottom row: two damped sinusoids (navy and orange, out of phase) converging toward a flat axis over years 2013 ... 2019. Text: "**Low-Frequency Scale:** Motivated by economic theories implying equilibrium relationships. Examples: The permanent income model (consumption vs. income) or money demand models (money, income, prices, interest rates)."
- Centered box: "**Mechanics of Equilibrium** / Equilibrium exists at a price where: / [Number of Market Orders] ≤ [Number of Limit Orders] / This state actively pulls the current price toward itself."

Article check: matches. Fix the garbled ruler labels: use "microseconds" for HF and "years" for LF; the 2013-2019 dates are decorative.

**Beats**
- 447.0 "how do these attractors actually function mechanically ... across different timeframes?"
- 458.4 "a very clear distinction between high frequency and low frequency"
- 468.4 "At the high frequency level ... driven by the law of one price"; 476.9 "identical assets should trade at the exact same price across different exchanges" (two stepped prices)
- 483.2 "algorithms instantly buy the cheaper one and sell the expensive one"; 489.4 "physically snaps the prices back together" (lines converge)
- 494.3 "the law of one price is the attractor, and the algorithms are the force enforcing it"
- 501.6 "at a low frequency level, like months or years" (bottom row)
- 514.9 "the permanent income model"; 517.5 "consumer spending is based on expected long-term average income"
- 527.7 "money demand models ... money supply, national income, prices, and interest rates"
- 537.6 trader quote: 542.6 "the price always moves toward an equilibrium state, and there are many of them"
- 556.9 "the number of market orders is less than or equal to the number of limit orders" (Mechanics box)
- 566.2 tug of war: 568.1 "Market orders are aggressive"; 573.5 "limit orders are passive"; 580.2 "aggressive buyers chew through the available sellers, the price goes up"; 583.7 "a massive wall of limit orders" (order-book wall animation); 593.8 "momentum just dies against that wall"
- 597.6 "The price finds a resting place ... acts as the attractor"

## Slide 5: 4. Cointegration as a Practical Manifestation of Attractors. 604.0 to 799.9 (195.9 s), split

**Content**
- Title "4. Cointegration as a Practical Manifestation of Attractors"
- Top-left chart "Asset Prices": two rising noisy lines, navy "Asset A" above, dark grey "Asset B" below, roughly parallel.
- Bottom-left chart "Stationary Spread": a navy noisy line oscillating between two orange horizontal bounds with an orange center line; labels "Spread" and "Mean / The Attractor".
- Right mono text:
  - "**Definition:** Cointegration describes a long-term relationship where two or more asset prices share common stochastic trends and move together."
  - "**Key Distinction:** Stationarity vs. Mere Correlation. Cointegrated prices are linked by a stationary spread—it does not grow or fall without bound, but continuously fluctuates around a mean."
  - Boxed "**The Math:**  Spread = P_A − γ*P_B / Where: P_A, P_B = Asset Prices / γ = Cointegration coefficient"
  - "**The Mechanism:** The mean of this stationary spread IS the attractor. Deviations from this mean create actionable trading opportunities."

Article check: matches (Spread = P_A − γ·P_B; stationary = constant mean, limited variance).

### 5a Cointegration vs correlation. 604.0 to 712.8
- 604.0 "how do we actually measure this pull between assets"; 614.5 "Cointegration is the mathematical cornerstone"
- 618.4 "a long-term relationship between two or more asset prices"; 622.9 "share common stochastic trends" (Asset A/B chart draws)
- 631.8 "a stochastic trend is basically a random walk with drift"
- 645.8 "isn't that just correlation?"
- 659.0 analogy: "two stray dogs walking down the same street" (two dogs side by side); 669.0 "one might eventually chase a squirrel, the other might fall asleep ... drift endlessly far apart"
- 681.2 "cointegration is like a dog owner walking their dog on a leash"; 691.5 "The leash represents the spread" (key cartoon: owner = A, dog = B, leash = spread)
- 699.6 "a stationary spread ... constant mean and a limited variance"; 703.9 "the leash snaps it back to the owner"
### 5b The spread formula and the trade idea. 712.8 to 799.9
- 715.9 "an exact mathematical equation for this stationary leash"; 725.1 "spread equals P_A minus gamma times P_B" (formula box)
- 740.6 "gamma is the cointegration coefficient"; 750.2 "the exact hedge ratio that balances the two assets"
- 759.5 "If stock B is inherently twice as volatile as stock A, gamma ... smooths that out"
- 767.3 "I'm looking at one single line, the spread" (two price lines collapse into the spread chart)
- 773.8 "like a heart monitor ticking back and forth across a flat center line"; 779.9 "That flat center line is the attractor" (orange mean line, label)
- 785.5 "If that spread ... gets way too large ... buy the underperforming asset and sell the outperforming one"; 794.7 "expecting ... spread to snap back to its mean"

## Slide 6: 5. Application in Algorithmic Trading. 799.9 to 881.6 (81.7 s)

**Content**
- Title "5. Application in Algorithmic Trading"
- Lead: "The Algorithmic Advantage: Algorithms efficiently monitor massive data streams, identify complex mathematical patterns, and execute at speeds humans cannot match."
- Flow diagram: three "Market Feeds" boxes (navy tab accents) with elbow arrows into a thick-framed "AI & Machine Learning Engine" box, which outputs to two boxes:
  - "Algoter / Goldseek": "Leverages ML and real-time data analysis to anticipate market dynamics, staying ahead of volatility."
  - "Next-Gen AI": "Utilizes reinforcement learning to adjust strategies on the fly and recognize new market regimes before formation."
- Right orange-framed card "Market-Neutral Assertion": "Pairs Trading is a premier attractor-based strategy. It profits in uptrends, downtrends, or sideways markets by betting strictly on the convergence of a temporarily weakened asset correlation."

Article check: matches. Algoter/Goldseek claims are the company's marketing (source 2); the hosts flag them as unverified (830.8). "It profits in" on the card overstates the article ("allows traders to profit in almost any market condition"): redraw as "aims to profit".

**Beats**
- 803.0 "impossible for a human in real time"; 810.4 "It's definitely machines" (feeds into engine)
- 815.3 "a quantitative trading company called Algoter and their flagship product Goldseek" (Algoter box)
- 821.5 "combine machine learning and real-time data to actually anticipate rather than react"
- 830.8 "dated article claims that require verification" (stamp "claim, unverified" on the box)
- 853.3 "pairs trading as a primary application"; 856.6 "market neutral ... profit in uptrends, downtrends, or sideways markets" (orange card)
- 863.8 "a strategy goal, not a promise"
- 868.3 "holding both a long and short position simultaneously"; 877.3 "absolutely does not mean it is immune to losses"
- Note: the "Next-Gen AI / reinforcement learning" box is never narrated here; give it a quiet fade.

## Slide 7: 6. Practical Trading Strategies (steps 1-2). 881.6 to 943.5 (61.9 s)

**Content**
- Title "6. Practical Trading Strategies"; top-right mono "**Case Study Pair:** VSYDP and NKHP (cointegrated stocks)"
- Wide spread chart: navy noisy line around an orange solid "Mean" line, orange dashed "+2 SD" and "-2 SD" bands; left ~half shaded grey "Calibration Zone", right half "Live Execution Zone". The line touches ±2 SD a few times.
- "**Step 1: Parameter Determination**": "Use the first half of observations to calibrate." / "Calculate the exact cointegration coefficient γ." / "Determine the average spread level (identifying the attractor)."
- "**Step 2: Signal Generation**": "Establish standard deviation (SD) thresholds around the mean." / "Trigger Logic: Generate a trading signal strictly when the spread deviates by 2 standard deviations in either direction."

Article check: matches steps 1-2 (VSYDP/NKHP from habr source 4, first half for parameters, 2 SD).

**Beats**
- 881.6 "walk through the actual mechanics of a real trade"
- 886.1 "an illustrative pair of stocks ... VSYDP and NKHP" (tickers top-right)
- 899.1 "look in the rear view mirror"; 901.0 "use the first half of your historical observations" (grey Calibration Zone fills)
- 906.9 "calculate gamma"; 911.8 "the historical average spread level"; 915.6 "That average is your attractor" (Mean line)
- 919.9 "the market is incredibly noisy ... can't execute every time the spread twitches a single cent"
- 929.5 "a two standard deviation signal threshold" (±2 SD bands slide out)
- 934.7 "two standard deviations away ... the mathematical alarm bells ring"; 941.1 "The leash is stretched too far"

## Slide 8: 6. Practical Trading Strategies (Continued). 943.5 to 1016.7 (73.2 s)

**Content**
- Title "6. Practical Trading Strategies (Continued)"
- Left flowchart: dark circle "Trigger Active" branching up and down:
  - Up: "Upper Threshold Breach (+2 SD)" → green "Sell Asset A, Buy Asset B" → "Converge to Mean → EXIT"
  - Down: "Lower Threshold Breach (-2 SD)" → green "Buy Asset A, Sell Asset B" → "Converge to Mean → EXIT", but a thick red horizontal line strikes through the arrow and exit box; caption "Structural Break / Stop-Loss Active".
- Right text "**Step 3: Trade Execution**": "Lower Threshold Breach: Buy Asset A, Sell Asset B." / "Upper Threshold Breach: Sell Asset A, Buy Asset B." / "Sizing: Execute strictly at a 1:γ hedge ratio." / "Exit: Close the position exactly upon mean-reversion (return to the attractor)." (Buy/Sell words green, "mean-reversion" orange)
- "**Step 4: Risk Management**": "Action: Implement a hard stop-loss." / "Why: To protect capital if the relationship undergoes a structural break and the spread begins trending boundlessly instead of reverting."
- Small "**Automation Note:** Automated bots like TradeHelp offer Cointegration Scoring to manage these processes programmatically."

Article check: matches (article states only the lower-threshold case explicitly; the upper case is the "do the opposite" mirror). Article: TradeHelp's Cointegration Scoring uses the Johansen test for baskets of two or more securities; the host's "presumably manage these breaks" (1009.5) is speculation, do not show.

**Beats**
- 943.5 "step three, execution"; 945.9 "the spread falls completely below the lower threshold" (lower branch lights)
- 951.0 "buy stock A and sell stock B"; 956.8 "a one to gamma hedge ratio" (1:γ)
- 962.2 "for every one share of A you buy, you're shorting exactly gamma shares of B"
- 966.7 "hold ... until the spread reverts back to the mean"; 971.8 "close both legs" (EXIT)
- 974.9 "step four is risk"; 979.3 "What if the dog breaks the leash and just runs away entirely?" (leash snaps gag)
- 984.0 "a structural break stop loss"; 990.7 "one gets bought out or goes bankrupt, the math breaks permanently" (red strike line)
- 1000.5 "You have to cut the cord immediately"
- 1002.0 "the TradeHelp robot ... cointegration scoring"; 1011.8 "a product claim pending verification" (automation note)

## Slide 9: 7. Advanced Methods and Multidimensional Attractors. 1016.7 to 1076.0 (59.3 s)

**Content**
- Title "7. Advanced Methods and Multidimensional Attractors"
- Left: isometric 3D grid box; an orange tilted plane (hyperplane) in the middle with orange x/y/vertical axes; six navy balls on sticks around it, each with an arrow pointing to a single point on the plane. Garbled math labels on the plane ("m_s = x_0(ω)", "|−φ|", "∇δ"): do not redraw.
- Right mono:
  - "**The Johansen Test:** Expands strategy logic from simple A/B pairs to multidimensional systems."
  - "**Multi-Asset Baskets:** Several assets are bundled to simultaneously tend toward a common, complex attractor." (slide typo "simultaneoously")
  - "**Calculation Dynamics:** Cointegration weights (the basket composition) mathematically factor in both capital allocation and individual asset volatility."
  - "**Benefits vs. Guarantees:** These multidimensional bases lack a pronounced trend. This reduces individual arbitrage risks and increases the probability of mean reversion and profit, though it is never a guarantee."

Article check: matches. The article also contrasts high-frequency (arbitrage, technical) vs low-frequency (economic, can persist for years) cointegration in this section; the hosts skip it.

**Beats**
- 1018.8 "Why limit this to just two stocks?"; 1020.6 "a whole basket of assets" (balls appear)
- 1027.8 "the Johansen test"; 1030.8 "several assets all gravitate toward a common, highly complex attractor" (arrows converge onto plane point)
- 1039.3 "weights that account for both the amount of money deployed and the volatility of each security"
- 1053.4 "reduces your arbitrage risks and ... increases the probability of the basis ... returning to the mean"
- 1062.8 "distinguish this possible benefit from a guaranteed outcome"
- 1068.1 "a basket of 10 stocks ... introduces massive computational complexity" (host example)

## Slide 10: 8. Limitations and Risks of Attractor-Based Strategies. 1076.0 to 1165.6 (89.6 s)

**Content**
- Title "8. Limitations and Risks of Attractor-Based Strategies"
- Three orange-framed cards, each with an icon panel (corner brackets), a dark header bar, and text:
  1. Icon: an orange arrow along a "t" axis that forks into an up arrow and a down arrow, labelled "μ(t)". Header "Risk 1: Moving Equilibria & Drift". "**Concept:** The mean value shifts to a new position, causing the spread to trend boundlessly." Dark sub-box: "**Mitigation:** Strict rules to exit when the core mean-reversion premise becomes invalid."
  2. Icon: a cracked orange "β" glyph with shards flying off. Header "Risk 2: CAPM-Beta Hedge / Model Risk". "**Concept:** Market-neutrality assumes the CAPM model is valid and beta correctly estimates systematic risk. If false, the hedge fails spectacularly during market regime shifts."
  3. Icon: an orange butterfly on crosshair axes with concentric ripple arcs, labels "δ", "ε". Header "Risk 3: Butterfly Sensitivity". "**Concept:** Sensitive dependence on initial conditions. Minute changes in input data or the model structure can drastically alter forecasts, breaking long-term predictability."

Article check: matches the three risks.

**Beats**
- 1076.0 "play devil's advocate"; 1079.6 "This math sounds bulletproof in theory. Where does it actually fail?"
- 1084.7 "The first major risk ... is drift" (card 1)
- 1089.2 "moving equilibria"; 1093.8 "the mean itself starts trending permanently"; 1097.4 "The attractor has literally shifted" (orange mean line tilts away, spread follows)
- 1101.5 "blindly betting on the old attractor, your losses will compound endlessly"
- 1106.6 "model risk"; 1108.2 "the CAPM model, the capital asset pricing model" (card 2)
- 1123.7 "beta measures how much a stock reacts to the overall market"; 1137.3 "an external shock hits ... both your long and short positions plummet simultaneously" (β cracks)
- 1145.4 "we can't forget the butterfly" (card 3)
- 1152.6 "a slightly delayed quote, a rounded fractional penny, can completely wreck a long-term forecast"
- 1162.6 "The math is fiercely unforgiving"

## Slide 11: 9. Technical Aspects of Implementation. 1165.6 to 1254.2 (88.6 s)

**Content**
- Title "9. Technical Aspects of Implementation"; top-right mono "**Core Languages:** R or Python utilized for underlying statistical mathematics."
- Four boxes left to right joined by thick dark arrows (orange outline):
  1. "1. Data Collection System": "Ingests real-time quotes and historical data for backtesting."
  2. "2. Statistical Analysis Module": "Calculates cointegration, identifies attractors, and generates signals."
  3. "3. Risk Management System": "Controls position sizing, enforces stop-losses, and monitors portfolio risk."
  4. "4. Order Execution Module": "Automates the placement and management of trades."
- A brace under all four merges into a down arrow pointing at orange mono "**The HFT Imperative: Low Latency.**" + "Speed of reaction is absolutely critical to exploit and capture narrower spreads profitably before they close."
- Small orange arrow-burst icon bottom left.

Article check: matches.

**Beats**
- 1165.6 "demands absolute precision and speed, which requires a heavy technology stack"; 1171.2 "cannot run these attractor models on a laptop in your living room"
- 1180.7 "R or Python" (top-right note)
- 1191.2 "four critical real-time modules"
- 1197.7 "First, a data collection module" (box 1); 1203.4 "Second, a statistical analysis module" (box 2); 1212.5 "Third, a ruthless risk management system" (box 3); 1220.1 "fourth, an automated order execution module" (box 4)
- 1223.3 "the text heavily emphasizes latency"; 1226.2 "lags ... by even 20 milliseconds, the trade is just dead" (host example)
- 1234.0 "ultra-low latency is oxygen"; 1237.3 "the narrower the spreads you can profitably capture" (HFT Imperative)
- 1242.9 "other algorithms will spot the deviation ... before your order even arrives" (race gag: slow order arrives after the spread closed)

## Slide 12: 10. Conclusion: The Future of Attractors in Trading. 1254.2 to 1313.6 (59.4 s)

**Content**
- Title "10. Conclusion: The Future of Attractors in Trading"
- Top illustration: a navy grid vector field (small arrows) on the left whose streamlines flow right, narrowing and then fanning into a candlestick chart (navy and orange candles) with navy and orange price lines.
- Four orange-topped cards (2x2), each with a small icon:
  - "**The Tool:** Cointegration serves as the practical embodiment of attractors, mapping how spreads move toward equilibrium." (icon: two crossing curves)
  - "**The Future:** AI and machine learning will continually uncover hidden attractors, learning and adapting dynamically via market feedback." (icon: small neural net with feedback arrow)
  - "**The Reality Check:** Markets are complex adaptive systems. Attractors are not static—they shift, vanish, and spawn anew." (icon: Lorenz butterfly)
  - "**Final Verdict:** Attractors in HFT are not a magic formula for guaranteed profit. They demand skilful application, continuous model improvement, and healthy mathematical skepticism." (icons: scales, magnifier with "?")

Article check: matches the conclusion. Article says AI "opens up new opportunities", not "will continually uncover": soften "will" to "can".

**Beats**
- 1254.2 "let's synthesize everything"; 1257.2 "simple points ... or deeply complex fractal strange attractors ... powerful tools" (The Tool)
- 1268.3 "they are a conceptual framework"; 1270.4 "not magic formulas for guaranteed profit" (Final Verdict)
- 1277.9 "Machine learning and AI open up entirely new doors for finding hidden attractors" (The Future)
- 1289.9 "Financial markets are complex adaptive systems"; 1300.1 "attractors themselves shift, drift, disappear entirely and pop up in entirely new places" (Reality Check; attractor dot jumps around)
- 1305.7 "constant skepticism and relentless daily adaptation"

## Slide 13: 11. Citation. 1313.6 to 1351.1 (37.5 s)

**Content**
- Title "11. Citation"
- Grey code box (mono): `@article{soloviov2025attractorsalgotrading,` / `author = {Soloviov, Eugen},` / `title = {Attractors in HFT: When Mathematics Meets the Market},` / `year = {2025},` / `url = {https://marketmaker.cc/en/blog/post/attractors-algotrading},` / `version = {0.1.0},` / `description = {How the concept of attractors and cointegration helps build market-neutral strategies and understand market dynamics.}` / `}`

Fixes: slide typo "coitegration" in description: use "cointegration". Narration errors: 1323.8 author read as "Solovyev Eugene" (correct: Soloviov, Eugen) and title read as "When Mathematics **Beats** the Market" (correct: Meets); 1331.3 URL read without "/post/". Show the correct citation text, not the narration. The article's own bibtex source has a stray `},n  title` line break bug; the slide shows the clean version, which is what to redraw.

**Beats**
- 1313.6 "to dive into the raw math ... the exact metadata from the source"
- 1320.4 "a Bibtex entry" (code box types out); 1323.8 author, title, year 2025, URL, version 0.1.0, description read aloud field by field (highlight each line as read: author ~1324.5, title ~1326, year ~1330, url ~1331.3, version ~1340.0, description ~1342)

## Slide 14: 12. References. 1351.1 to 1362.4 (11.3 s)

**Content**
- Title "12. References"; mono underlined list 1-10: smart-lab.ru/blog/816882.php; (a second "2." line duplicating smart-lab.ru/blog/816882.php); algoter.com/алгоритмическая-торговля/объяснение-алгоритмической-торговли/?lang=ru; keldysh.ru/comma/html/ds/attractors.html; habr.com/ru/articles/344674/; ig.com/de/trading-strategien/pairs-trading-erklart-190520; hudsonthames.org/an-introduction-to-cointegration/; ru.wikipedia.org/wiki/Аттрактор; mql5.com/ru/articles/15332; utmagazine.ru/posts/6789-parnyy-treyding-para-akciy-korrelyaciya-kointegraciya-spreda-investicionnyy-portfel; mql5.com/ru/forum/434802.

Fixes: the deck numbers the list wrongly (extra duplicated smart-lab line labelled "2."). Article order: 1 smart-lab 816882, 2 algoter, 3 keldysh, 4 habr 344674, 5 ig.com, 6 hudsonthames, 7 ru.wikipedia Аттрактор, 8 mql5 articles 15332, 9 utmagazine 6789, 10 mql5 forum 434802. If shown at all, a fast scroll is enough.

**Beats**
- 1351.1 "heavily grounded in external literature"; 1357.3 "exactly 20 external references ... from Wikipedia definitions of chaos theory to highly academic papers on time series cointegration" (count-up "20")

## Slide 15: 12. References (Cont.) + outro. 1362.4 to 1418.04 (55.6 s)

**Content**
- Title "12. References (Cont.)"; mono list 11-20: ru.wikipedia.org/wiki/Алгоритмическая_торговля; ya.ru/neuruum/... (article: ya.ru/neurum/c/nauka-i-obrazovanie/q/chto_takoe_attraktor_i_chem_on_otlichaetsya_41ce2642); rusforexclub.com/articles/17-pair-trading/104-vvedenie-v-kointegratsiyu (article URL continues "-vremennykh-ryadov"); en.wikipedia.org/wiki/Pairs_trade; faculty.washington.edu/ezivot/econ584/notes/cointegration.pdf; ya.ru/neurum/c/ekonomika-i-finansi/q/kak_attraktory_ispolzuyutsya_v_modelirovanii_d0a7f160; smart-lab.ru/blog/1145333.php; robotcraft.ru/Article/Details/skoring-s-kointegraciej; perm.hse.ru/mirror/pubs/share/974309871.pdf; utmagazine.ru/posts/6820-kointegracionnyy-podhod-k-parnomu-treydingu.
- Bottom box: "NotebookLM presentation compiled strictly from the provided source snapshot. Pending human editorial, primary-source, and mathematical review. No guaranteed returns or investment advice provided."

Fixes: ref 12 typo "neuruum" (article: "neurum"); ref 13 truncated. Do not mention NotebookLM on screen; keep only "Not investment advice."

**Beats**
- 1367.3 "any source errors in those provided references are retained exactly"
- 1374.1 "you have officially survived a deep dive into the chaotic fractal math"
- 1381.6 final thought: 1389.3 "If next generation AI systems all learn to spot the exact same hidden strange attractors at the exact same millisecond"; 1394.3 "will ... millions of algorithms trading on them simultaneously cause those attractors to instantly vanish or mutate?" (many bots converge on the orange point, it dissolves)
- 1404.4 "faster and faster machines to chase mathematical ghosts?"
- 1411.5 "Think about that next time you look at a stock chart"; 1413.8 "Keep learning, keep questioning" (end)

---

## Timing notes

`sync_slides.py` not used; boundaries set by hand. The hosts follow the deck in order and mostly announce each section topic.

| Start | Slide | Cue | Confidence |
|---|---|---|---|
| 0.0 | 1 | funnel cold open + title | high |
| 101.2 | 2 | "Let's actually start with that fundamental concept" | high |
| 267.6 | 3 | "what do these mathematical magnets actually look like?" | high |
| 447.0 | 4 | "how do these attractors actually function ... across different timeframes?" | high |
| 604.0 | 5 | "how do we actually measure this pull ... cointegration" | high |
| 799.9 | 6 | "who is actually executing these math heavy strategies?" | high |
| 881.6 | 7 | "walk through the actual mechanics of a real trade" | high |
| 943.5 | 8 | "Let's talk step three, execution" | high |
| 1016.7 | 9 | "Why limit this to just two stocks?" | high |
| 1076.0 | 10 | "play devil's advocate ... where does it fail" | high |
| 1165.6 | 11 | "requires a heavy technology stack" | medium-high (could start at 1175.8 "what kind of tech stack") |
| 1254.2 | 12 | "let's synthesize everything" | high |
| 1313.6 | 13 | "the exact metadata from the source ... Bibtex" | high |
| 1351.1 | 14 | "heavily grounded in external literature" | medium (references never read item by item) |
| 1362.4 | 15 | second half of references, then outro | low (no audible cue; the split between 14 and 15 is arbitrary, the outro could also return to slide 12) |
