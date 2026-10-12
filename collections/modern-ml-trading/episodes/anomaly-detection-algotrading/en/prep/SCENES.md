# anomaly-detection-algotrading (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
15-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/anomaly-detection-algotrading.en.md`.

- Audio: `input/notebooklm-sources/anomaly-detection-algotrading/en/audio.m4a`, 878.76 s (14:38.8), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has `words[]` with per-word start/end; use it for frame-exact beats). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: warm off-white paper (#F4F2EC) with a pale teal blueprint grid, slate/charcoal ink (#2B3A42) for text, teal (#3A9BAA) frames with corner brackets, pale teal fills (#D6ECEF) for "mono callout" boxes, mustard/amber (#E2A93B) for drift / caution / "the calm", crimson (#B0202A) for the anomaly itself (spikes, outlier dots, warning triangles). Titles carry the article's heading level as a literal prefix ("H2 —", "H3 —"); keep that as a stylistic tag or drop it. Mix of grotesk sans and monospace. "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "Eugene Siloviev / Soloviev / Solovy have / Sokoloff / Solovyev" = Eugen Soloviev (suenot), "the techs" (100.6, 117.9) = the text, "HBOSS" = HBOS, "Benance" = Binance, "comb before the storm" (474.4) = calm, "praying to false positives" (407.2) = prone to, "20-bit levels" (656.2) = 20 bid levels, "Archive" (835.8) = arXiv, "PIOD" = PyOD, "euro-dollar" = EUR/USD, "db scan and pca" = DBSCAN and PCA, "stage sliding window" = Staged Sliding Window.

---

## Slide 1: Title. 0.0 to 89.3 (89.3 s)

**Content**
- Background: faint teal low-poly network (thin lines, small hollow nodes) drifting across the grid, densest at top right and bottom left.
- Double-framed white panel center: title (2 lines, large light-weight sans) "Anomaly Detection for / Trading Bot Protection"; subtitle "From Z-Score to Transformer: Building / a Cascading Architecture".
- Teal mono strip under the title with corner brackets: "TARGET: Crypto Algo Trading" / "STATUS: Foundation without which algo trading becomes gambling."

**Beats**
- 0.0 "watching a whole week of ... trading profits just completely vanish" / 6.4 "in exactly 30 seconds" (equity curve rising for a week then a cliff; a 30 s stopwatch)
- 11.3 "high-frequency algorithmic crypto trading ... a daily reality"
- 18.5 "your bot got tricked by ... a fake order wall or ... a sudden data glitch from the exchange" (fake wall block, glitching data packet)
- 35.9 "Welcome everyone" / 40.7 "2026 article by Eugen Soloviev" / 45.7 title read aloud "Anomaly Detection for Trading Bot Protection" (title reveal)
- 53.2 to 65.9 disclaimer: "strictly the technical frameworks ... not offering financial advice ... nothing ... a guarantee of returns" (small disclaimer card)
- 68.9 core premise: "without robust anomaly detection, algorithmic trading isn't really trading" / 78.9 "It's essentially just gambling" (STATUS strip types in; dice)
- 81.1 "rolling the dice against flash crashes"; 84.2 "If your bot can't see the traps, it's flying blind in a hurricane"

## Slide 2: H2 — What Counts as an Anomaly in Crypto Trading. 89.3 to 270.6 (181.3 s)

**Content**
- Three equal framed cards with a chart, description and a teal mono "Example:" box each:
  1. **Point Anomalies**: flat grey noisy line with a single tall crimson spike near the left third. Text: "**Isolated** extreme deviations. High risk of fake price entry or margin-destroying slippage." Example: "Candle with 50x average volume, or BTC/USDT spread spiking to 0.5%."
  2. **Collective Anomalies**: grey sawtooth (12 identical tall teeth, sharp rise then vertical drop). Text: "Normal individual events that form a manipulative aggregate. **Note: Spoofing** acts as a signal needing corroboration." Example: "Place-cancel spoofing loops with a 100:1 order-to-trade ratio."
  3. **Contextual Anomalies**: two full periods of a sine wave in amber with amber fill to the zero line, on a dashed grid. Text: "Normal values occurring in the wrong environmental context." Example: "London session trading volumes occurring at 3 AM UTC on a Sunday."

Article check: matches. "Signal needing corroboration" is NotebookLM framing, not in the article (the article plainly calls the 100:1 pattern manipulation); harmless. The article adds "on Binance" for the 0.5% spread and that a bot relying on book depth "will be trading on nonexistent liquidity".

Split into sub-scenes (181 s):
- **2a Point (89.3 to 154.9)**
- **2b Collective (154.9 to 230.8)**
- **2c Contextual (230.8 to 270.6)**

**Beats**
- 89.3 "before we even hunt for these traps ... what actually counts as an anomaly" (slide in)
- 100.6 "breaking anomalies down into three distinct types" (three empty card frames)
- 106.8 "point anomaly" / 110.1 "sudden isolated spike that just deviates violently from the baseline" (draw noise line, spike fires)
- 123.1 "a single candle that suddenly registers 50x the average trading volume" (candle grows to 50x); 128.7 "Wow, 50 times"
- 130.8 "the Binance BTC to USDT spread" / 134.7 "suddenly spikes to 0.5%"
- 137.9 "For a market making bot, that point anomaly is basically a landmine"; 142.7 "enters a fake price, and the slippage just eats the whole margin"
- 154.9 "collective anomalies" / 161.0 "individual events look totally normal ... one by one" / 166.9 "together over time, they form a dangerous pattern"
- 171.0 "The classic example ... spoofing"; 178.7 "Placing a limit order is normal. Cancelling it is normal." / 182.9 "the rhythm betrays the manipulation" (sawtooth teeth draw one by one in rhythm)
- 188.0 "An order to trade ratio of 100 to 1" / 193.5 "100 orders placed and canceled for every one actual trade" (100 ghost orders vs 1 trade counter)
- 203.0 caveat: "These metrics are signals that absolutely require corroboration" / 210.5 "shouldn't use a 100 to 1 ratio to explicitly accuse specific actors"
- 216.8 "your bot still needs to know the signal is there so it stops trading against fake liquidity"
- 223.6 recap: "point anomaly is an explosion. Collective is a suspicious drumbeat"
- 230.8 "Contextual anomalies ... a totally normal numerical value ... in the wrong environment"
- 240.0 "a massive spike in Bitcoin volume" / 242.9 "during the busy London session, totally normal" / 245.9 "at 3am UTC on a Sunday, something is very wrong" (clock flips to SUN 03:00 UTC)
- 252.6 gag: "like wearing a tuxedo to a beach party" (optional cartoon: tuxedo figure on a beach)
- 264.6 "without that context, those anomalies are completely invisible to basic detectors"

## Slide 3: H3 — Noise vs. Anomaly: The Context Problem. 270.6 to 321.4 (50.8 s)

**Content**
- Wide chart split by two teal vertical handles (square end caps) into three zones, one continuous grey series:
  - Left zone: flat high-frequency grey noise. Callout (mono, arrow down into the noise): "**[NOISE]:** Random fluctuations that are part of the normal market regime."
  - Middle zone: the series climbs inside a rising amber band (curved upward channel). Callout: "**[DRIFT]:** A gradual shift in market conditions (e.g., low-volatility night to active morning)."
  - Right zone: series continues at the new higher level inside a pale teal widening cone (dashed lines); a pale grey bell curve rises behind; one thin crimson spike sits at the bell's peak. Crimson-tagged callout: "**[ANOMALY]:** A sudden violation of the expected pattern."
- Teal mono caption box: "**Anomaly** is not just strange data—it is a deviation carrying information. The key challenge for any detector is isolating the dangerous anomaly from harmless noise and persistent market drift without triggering false positives."

Article check: matches section "Noise vs. Anomaly".

**Beats**
- 270.6 "I have to push back ... Isn't this market inherently just noise and chaos?" / 277.0 "How do we stop the bot from freaking out of every tiny blip?" (slide in)
- 280.5 "It is the ultimate context problem"; 283.7 "distinguish between three different phenomena"
- 288.4 "First is noise, just harmless random fluctuations" / 292.6 "Just the wind blowing" / 294.0 "You don't board up the windows for a breeze" (noise zone + label)
- 296.1 "Then you have drift" / 298.9 "persistent gradual shift in the market regimes" / 302.8 "quiet night session to a busy morning one" (amber band draws)
- 309.5 "finally, you have the actual anomaly" / 313.2 "A sudden, dangerous violation" (crimson spike)
- 315.8 "Distinguishing between noise, drift, and anomaly is the whole foundation of the protection layer" (caption box)

## Slide 4: H2 — Simple Methods That Solve 80% of Problems / H3 — Z-Score: Fast Extreme Filter. 321.4 to 413.4 (92.0 s)

**Content**
- Two-line title as above.
- Left framed panel: bell curve, grey fill, vertical axis labelled "Mean" at center; x-axis ticks "-3σ -2σ -1σ Mean +1σ +2σ +3σ" with dashed verticals; a crimson dot on the x-axis just right of +3σ with label (crimson mono) "OUTLIER (Z > 3)" and an arrow. Teal mono tag under the chart: "Normal Distribution (Theoretical)".
  - The deck also prints band percentages ("-17%", "+2.6%", "+2.7%", "15%"): these are NotebookLM garbage. **Do not redraw them.** If bands are labelled, use the correct normal-distribution shares: 34.1% each side within 1σ, 13.6% between 1σ and 2σ, 2.1% between 2σ and 3σ, 0.1% beyond 3σ (68.3 / 95.4 / 99.7 rule).
- Right panel header "DIAGNOSTIC SPEC SHEET" (mono, grey title bar):
  - "LATENCY: < 1 ms"
  - "TRIGGER: Z-Score > 3"
  - "TARGETS: Abnormal volume, Spread monitoring, Futures funding rates."
- Amber caution box: "PRACTICAL LIMITATION: FAT TAILS" / "Crypto markets exhibit **fat-tailed distributions**. By normal distribution, a 6σ event occurs once in a million years; in crypto, it happens monthly." / "Z-score is a **coarse filter**, not a final verdict."

Article check: matches (article: "calculated in microseconds"; Z > 3 = signal to widen spreads or pause quoting). Formula to show if wanted: z = (x − μ_rolling) / σ_rolling.

Split into sub-scenes (92 s):
- **4a Simple methods claim (321.4 to 353.3)**: "80%" big number, simplicity = speed.
- **4b Z-score mechanics and fat tails (353.3 to 413.4)**

**Beats**
- 321.4 "So how do we actually do that?" / 323.4 "my brain just immediately goes to massive neural networks" (giant neural net looms, then shrinks)
- 333.9 "simple methods, basic statistics" / 337.5 "can actually solve 80% of these problems" ("80%" stamp)
- 342.1 "in system design, simplicity equals speed" / 346.9 "The less math your server does, the faster it reacts"
- 350.3 "They start with the Z score as the fastest extreme filter" (title line 2)
- 357.4 "how many standard deviations a specific value is away from a rolling mean" (bell curve draws, σ ticks)
- 363.4 "how far is this price from what's been normal for the last few minutes?"
- 371.5 "In microseconds" (LATENCY line)
- 373.0 "spread monitoring, futures funding rates, and volume" (TARGETS line)
- 377.8 "a Z score above three" / 381.0 "an immediate reflex to pause trading or widen spreads" (outlier dot past +3σ, TRIGGER line)
- 384.8 "But there's a massive catch" / 386.6 "crypto has those crazy, fat tails" (tails of the curve thicken)
- 393.7 "a six sigma event, should take about a million years to happen" / 402.0 "a million year event happens on a Tuesday?" / 405.2 "The article says it happens monthly" (calendar flips monthly)
- 407.2 "the Z score is really prone to false positives" / 411.6 "It's just a coarse filter" (amber box)

## Slide 5: H3 — Level Shift Detector: When the Market Changes Regime. 413.4 to 452.4 (39.0 s)

**Content**
- Grid area with a timeline axis (arrow right, 5 ticks). Two overlapping rectangles: "**Window A** (Historical)" lower-left, with a dashed teal mean line; "**Window B** (Recent)" upper-right, overlapping A slightly, dashed mean line higher. Amber double-headed vertical arrow between the two mean levels labelled "Δ" (amber).
- Box "Mechanism & Application": "Compares averages of two consecutive rolling windows. If the delta exceeds a threshold, a regime shift is flagged minutes before price impact. Applies simultaneously to average trade size, order book depth (first 5 levels), and trades per unit time."
- Mono box "TRIGGER LOGIC:" code:
```
IF (Level_Shift_Count >= 2_Metrics) {
  Activate_Defensive_Mode();
}
```

Article check: matches. Article adds the motivation: market-making profits in stable markets and loses in sharp moves; the detector on volume and volatility warns "minutes before it becomes obvious in the price".

**Beats**
- 413.4 "Which sets up the next tool" / 414.6 "how does the bot know when the baseline has permanently shifted?" / 420.4 "if volume doubles and stays that way, it's not an anomaly anymore"
- 425.8 "That's where the level shift detector comes in" (slide in)
- 428.7 "compares two consecutive rolling windows of time" (Window A slides in, then Window B)
- 431.7 "If the difference between the averages ... hits a threshold" / 435.2 "the regime shifted" (Δ arrow grows, flashes)
- 439.8 "average trade size" / 442.6 "order book depth at five levels, and trades per time unit" (three metric gauges)
- 447.4 "if it triggers on at least two of those metrics, the bot switches to defensive mode" (code types; 2 of 3 gauges light; shield up)

## Slide 6: H3 — Volatility Shift Detector: Sensing the Storm. 452.4 to 483.3 (30.9 s)

**Content**
- Two framed charts side by side (mono captions):
  - "Compression (The Calm)": price line inside glowing amber Bollinger-style bands that start wide, then squeeze tight in the middle (arrows pointing inward: down-right, up-right, left), loosening slightly at the right. Caption: "Abnormally low volatility frequently precedes explosive market moves. Comparing rolling standard deviations flags this tightening."
  - "Expansion (The Storm)": glowing crimson bands; quiet price drifting in narrow bands, then a sharp breakout upward with bands blowing wide (up arrows, one rightward arrow under the base). Caption: "A sharp rise in volatility triggers an immediate parameter reconsideration."
- Bottom bar: "**Mechanism:** Compares rolling standard deviations rather than averages. This catches both the calm before the storm and the the storm itself, warning of regime drift." (deck typo "the the"; fix to "the storm itself")

Article check: matches.

**Beats**
- 452.4 "that covers shifting averages. But what about volatility?" (slide in)
- 458.7 "I assumed high volatility is the danger, but it says low volatility is a warning sign too"
- 465.2 "compares standard deviations instead of averages"
- 469.8 "It catches volatility expansion" (red panel) / 471.7 "But also volatility compression" (amber panel squeezes)
- 474.4 "the eerie calm before the storm?" / 478.0 "It's a coiled spring" / 479.4 "the unnatural quiet right before an explosive move" (amber squeeze, then cut to red explosion)

## Slide 7: H3 — HBOS: Fast Multidimensional Analysis. 483.3 to 528.0 (44.7 s)

**Content**
- Left framed panel: three isometric 3D histograms stacked diagonally ("Feature 1", "Feature 2", "Feature 3"), pale teal bars, each with a peak then a long low right tail ending in a crimson dot; a crimson dashed line links the three tail dots. Label: "Joint Outlier in Low-Density Tails".
- Right panel header (mono) "Histogram-Based Outlier Selection", bullets:
  - "**Use Case:** Monitoring 10+ indicators simultaneously without the computational cost of deep ML."
  - "**Mechanism:** Assumes feature independence. Builds a histogram for each feature. The final anomaly score is the product of **inverse densities** across all histograms."
  - "**Advantage:** Significantly faster than distance-based methods like LOF, making it ideal for high-frequency filtering of multidimensional state vectors."

Article check: matches. Formula if needed: HBOS(x) = Σ_i log(1 / hist_i(x_i)) (equivalent to the log of the product of inverse densities).

**Beats**
- 483.3 "put yourself in the server's shoes" / 485.7 "10 or more of these indicators running ... doesn't that just fry the CPU?" (CPU sweating)
- 495.8 "they introduce HBOS, Histogram-Based Outlier Selection" / 500.0 "fast multi-dimensional analysis" (slide in)
- 505.6 "Most detectors do really heavy math to find geometric distances" (distance lines web, crossed out)
- 510.5 "just assumes all your features ... are independent"
- 516.0 "builds a simple histogram for each feature" (3 histograms rise) / 520.6 "multiplying the inverse densities together" (tail dots light, dashed link)
- 523.3 "No heavy distance math, so it's significantly faster"

## Slide 8: H2 — Machine Learning: When Statistics Aren't Enough / H3 — Isolation Forest: Best Balance for Production. 528.0 to 600.7 (72.7 s)

**Content**
- Title in monospace (two lines).
- Left card: "The Need for ML": "Handles unusual combinations of indicators. Volume + spread + rate of change + order book imbalance together." / "Mechanism": "Ensemble of decision trees randomly partitioning feature space. Fast millisecond inference. No labeled data required."
- Center chart: scatter, axes "Feature A" (x) and "Feature B" (y); dense grey blob of ~600 points left of center, crossed by many fine teal and grey partition lines (vertical and horizontal) concentrated over the blob; one crimson point far right, boxed by only 2 to 3 lines. Labels: "ANOMALY (Isolated quickly)" pointing to the crimson dot, "NORMAL DATA (Requires many partitions)" pointing to the blob.
- Right card: "Explainability (SHAP values)": "Explains why an anomaly triggered (e.g., pinpointing external volume mismatch during the 2021 Tesla BTC rejection or isolating unbalanced quotes in spoofing)." / "Practical Limitation": "False positive risks."

Article check: mostly matches. Article: on Bitcoin data Isolation Forest caught the obvious volatility spike when Tesla rejected BTC payments in 2021 **and** subtler periods when price moves were not supported by volume (pointing to external manipulation); the slide merges these into "external volume mismatch during the Tesla rejection". Use the article's two separate findings. For spoofing, SHAP highlights unbalanced order book quotes **and abnormally high cancellation activity**. "False positive risks" as the limitation is NotebookLM's addition (the article's knob for it is the contamination parameter, slide 12).

**Beats**
- 528.0 "simple methods cover the 80%" / 530.4 "the other 20% when statistics aren't enough" (slide in, title line 1)
- 535.1 "volume and spread look normal individually but anomalous together, you need machine learning" (left card)
- 542.9 "the isolation forest" / 547.2 "the best balance for production" (title line 2)
- 549.4 "an ensemble of decision trees that randomly partition the space" (partition lines start cutting)
- 553.9 "Anomalies are rare, so they get isolated in far fewer splits"
- 557.5 analogy: "normal data is a huge crowd, it takes forever to isolate one person" / 561.3 "an anomaly is a guy standing alone in a field, so you draw a box around him instantly" (2 cuts box the crimson dot vs dozens for the blob)
- 570.5 "Millisecond inference, no labeled data needed, and it gives you SHAP values"
- 575.7 "what are SHAP values?" / 577.8 "They tell you why an anomaly occurred" / 580.8 "You don't just want a red flashing light" (right card, SHAP bar chart)
- 584.8 "detected the 2021 Tesla BTC rejection"
- 592.0 "for spoofing ... triggered by unbalanced quotes and cancellations"

## Slide 9: H3 — LOF: Best Choice for Multi-Exchange Monitoring. 600.7 to 638.6 (37.9 s)

**Content**
- Two framed scatter plots:
  - "High-Density Environment (Binance)": tight round cluster of ~500 overlapping grey dots, crosshair through the center; one glowing crimson dot just outside the right edge of the cluster with a hand-drawn arrow. Caption (mono): "Global thresholds fail here; LOF correctly identifies local outliers by comparing a point's density to its nearest neighbors."
  - "Sparse Environment (Niche Exchange)": ~50 grey dots scattered loosely; one glowing crimson dot near the top right edge with arrow. Caption: "Adapts to local context without generating false positives on low-volume exchanges."
- Bottom box: check icon "**Validation:** 2024 Springer study confirms LOF finds real anomalies with fewest false positives on BTC and Dogecoin." / warning icon "**Limitation:** Quadratic computational complexity. Too slow for tick-level real-time, but ideal for minute aggregates across 100+ exchanges."

Article check: matches (the Springer study compared LOF vs Isolation Forest vs One-Class SVM).

**Beats**
- 600.7 "if the bot is trading on multiple exchanges, like Binance with thousands of trades a second versus some niche exchange with dozens?" (two panels fill: dense vs sparse)
- 610.6 "That's where LOF comes in" / 612.1 "Local outlier factor" (slide in)
- 614.4 "compares a point's local density strictly to its neighbors" (k-nearest-neighbor circles around the crimson dots)
- 617.9 "So it adapts to the neighborhood"
- 620.9 "a 2024 Springer study showing LOF beat other methods on Bitcoin and Dogecoin data" (validation line)
- 627.1 "why not use LOF for everything?" / 630.2 "Computational cost" / 631.8 "quadratic complexity" (n² grid blows up) / 633.6 "too slow for real-time tick data" / 635.5 "ideal for minute aggregates"

## Slide 10: H3 — Autoencoders: Deep Order Book Analysis. 638.6 to 674.8 (36.2 s)

**Content**
- Diagram (left to right): label "Input: 40-D Vector (20 bid / 20 ask)" with ~18 parallel arrow lines entering a tall thin rectangle; lines fan in to a small boxed bottleneck "Latent Representation (Compression)" (small grid of vertical bars inside); fan out to a second tall rectangle labelled "Reconstruction"; output lines go right. A feedback line from output end back under the reconstruction box passes a glowing crimson triangle "Δ". Caption: "High Reconstruction Error = **Anomaly**" (Anomaly in crimson).
- Three mono boxes:
  - "Mechanism:" "Compresses normal data and attempts to reconstruct it. High reconstruction error signals an anomaly."
  - "Architecture:" "Hybrid LSTM Autoencoder + One-Class SVM handles temporal dynamics (last N ticks) and classical ML decision-making."
  - warning icon "Practical Limitation:" "Deep extraction comes at a high computational cost. Real-time inference strictly requires a GPU."

Article check: matches (article: neural net does feature extraction, OC-SVM decides; order book updates hundreds of times per second).

**Beats**
- 638.6 "what's the heavy artillery for reading the deep order book?" / 644.7 "Autoencoders" (slide in)
- 645.7 "learns to compress and reconstruct normal data" (data flows through bottleneck)
- 650.2 "A high reconstruction error equals an anomaly" / 653.1 "it doesn't know how to rebuild a crash" (Δ glows red)
- 656.2 "a 40-dimensional vector ... 20 bid levels and 20 ask levels" (order book ladder 20+20 collapses into the input vector)
- 661.2 "an x-ray 20 layers deep into the order book"
- 664.1 "a hybrid LSTM autoencoder and a one-class SVM"
- 669.2 "you absolutely need a GPU for that computational cost" (GPU card icon)

## Slide 11: H2 — Cascading Architecture: Putting It All Together. 674.8 to 735.7 (60.9 s)

**Content**
- Four stacked mono boxes, each narrower than the one above, joined by teal down-arrows; frame colors: teal, amber, magenta/crimson, grey:
  - "Layer 1 — Fast Path (< 1 ms)" / "Tools: Z-Score (volume/spread/price). Persistence check." / "Response: Immediate trading pause. Protects against flash crashes & API errors."
  - "Layer 2 — Near Real-Time (1–100 ms)" / "Tools: Isolation Forest + Level/Volatility Shift Detectors." / "Response: Triggers mode switch & parameter adjustment (parallel thread)."
  - "Layer 3 — Background Analysis (1–60 seconds)" / "Tools: LOF (multi-exchange) + LSTM Autoencoder (order books)." / "Response: Tralerts & strategy parameter adjustments." (deck typo "Tralerts" → **"Alerts"**)
  - "Layer 4 — Batch Analysis (Hourly/Daily)" / "Tools: DBSCAN (wash trading) + PCA (cross-exchange correlation)." / "Response: Reports, model updates & threshold recalibration."
- Side box (bottom right): "**Core Principle:** Graceful Degradation. Independent protection layers ensure fault tolerance—if Layer 3 fails, Layers 1 & 2 maintain defense."

Article check: matches, with omissions: Layer 1 also has hard limits and runs in the bot's main loop with no external dependencies; Layer 3 also runs seasonal-decomposition residual analysis; Layer 4 also does full model retraining.

**Beats**
- 674.8 "We've got Z-scores, Isolation Forests, LOF, autoencoders on GPUs. How do you unify all this without crashing the system?"
- 684.2 "A cascading architecture" / 686.2 "Four independent protection layers ... fault tolerance and graceful degradation" (slide in, empty 4 layers)
- 690.9 "If layer three dies, layers one and two just keep working" (Layer 3 greys out, 1 and 2 stay lit; side box)
- 696.6 "Layer one. The fast path under one millisecond" / 700.0 "Z-score and hard limits" / 703.9 "immediate trading pause" / 706.1 "Fast and dumb"
- 707.1 "Layer two. Near real time. One to 100 milliseconds" / 711.3 "Isolation forest, level and volatility shifts" / 714.8 "adjusts parameters instead of pausing"
- 717.3 "Layer three. Background analysis. One to 60 seconds" / 721.1 "LOF and the LSTM autoencoder" / 724.0 "Sends out alerts"
- 725.7 "layer four. Batch analysis. Hourly or daily" / 729.6 "DBSCAN and PCA to retrain models and recalibrate thresholds" / 734.2 "So it's self-tuning" (loop arrow from L4 back up to L1)

## Slide 12: H2 — Practical Recommendations. 735.7 to 774.9 (39.2 s)

**Content**
- 2x2 grid of teal mono cards (header bar + body):
  - "START SIMPLE": "Implement **Z-Score + Level/Volatility Shift** first. This covers the majority of loss scenarios due to abnormal market conditions before GPU clusters are needed."
  - "CONTAMINATION PARAMETER": "The most critical **Isolation Forest** hyperparameter. Use **0.01–0.05** range. Too low = missed anomalies; Too high = false positives paralyze trading."
  - "ADAPTIVE THRESHOLDS": "Combat regime drift and non-stationary data. Use **EWMA** (Exponentially Weighted Moving Average) to update thresholds, or periodically retrain models."
  - "DATA & INCIDENT TESTING": "Log all anomalies to build supervised datasets. Test systems against real historic data errors and API incidents (e.g., May 2021 flash crash, FTX liquidation cascade, LUNA collapse)."

Article check: matches (article: "can be implemented in a day"; contamination 0.01 to 0.05 "depending on the pair and exchange").

**Beats**
- 735.7 "For the listener trying to build this ... practical recommendations" (slide in)
- 740.7 "start simple" / 742.9 "Z-score and shifts take a day to build" (card 1; "1 day" stamp)
- 745.4 "set your contamination parameter very carefully" / 749.0 "between .01 and .05" / 752.1 "expect 1 to 5% of data to be anomalous" (slider 0.01 to 0.05; card 2)
- 756.4 "adaptive EWMA thresholds to fight regime drift" (card 3, threshold line bends to follow data)
- 761.0 "Log absolutely everything and test on real incidents" / 765.7 "the May 2021 flash crash, FTX and Luna" (card 4, three incident tapes)
- 771.7 "If you can't catch the past, you can't catch the future"

## Slide 13: H2 — What's Next. 774.9 to 824.7 (49.8 s)

**Content**
- Three wide teal mono cards, each with a stat box on the right:
  1. "Transformer Models for Order Books" / "Use Case: Limit Order Book (LOB) anomaly detection. Outperforms RF, LSTM, CNN." Stat box: "Staged Sliding Window Transformer + OC-SVM (315M records) | Accuracy: 0.93 / F1: 0.91 | AUC-ROC: 0.95"
  2. "GANs (Generative Adversarial Networks)" / "Use Case: Synthetic anomaly generation to solve critical label scarcity by generating realistic manipulation scenarios." Stat box: "Accuracy: 94.7% / Latency: < 3 ms / Throughput: 150,000 TPS"
  3. "Change Point Detection (CPD)" / "Use Case: Identifying exact moments statistical properties change." Stat box: "Goal: Automating structural regime shifts (e.g., mean-reversion to trend-following)."

**NotebookLM error (card 1 and audio 780.7):** the deck and hosts merge two separate results. Article: (a) Transformer autoencoder + OC-SVM on Limit Order Book data significantly outperforms previous approaches **for spoofing detection**; (b) a separate **Staged Sliding Window Transformer** on high-frequency **EUR/USD** data (315 million records) reached accuracy 0.93, F1 0.91, AUC-ROC 0.95, beating Random Forest, LSTM and CNN. Redraw as two lines: "Transformer AE + OC-SVM on LOB: best spoofing detection" and "Staged Sliding Window Transformer, EUR/USD, 315M records: Acc 0.93 · F1 0.91 · AUC-ROC 0.95".
**Audio error (795.3):** "A 95% success rate" misreads AUC-ROC 0.95; AUC is a ranking metric, not a success rate. Do not caption it as "95% success".

**Beats**
- 774.9 "So what's next? What's on the bleeding edge?" / 777.4 "Three areas" (slide in, 3 empty cards)
- 778.4 "First, transformers" / 780.7 "a staged sliding window transformer ... on high frequency EUR/USD data" / 786.2 "315 million records, hit .93 accuracy, .91 F1, and a .95 AUC ROC" (stats count up)
- 799.0 "GANs" / 802.2 "create synthetic anomalies to solve label scarcity" (generator vs discriminator cartoon) / 805.0 "94.7% accuracy with latency under 3 milliseconds" / 809.5 "a throughput of 150,000 transactions per second"
- 813.5 "AI dreaming up fake crashes to train bots"
- 818.1 "Change point detection, or CPD" / 820.5 "the exact mathematical boundary of a structural regime shift" (vertical line drops on a series where mean/variance change)

## Slide 14: Closing statement. 824.7 to 832.1 (7.4 s)

**Content**
- Single large mono quote in a teal box with heavy black corner brackets: "Anomalies are not an optional feature." / "It is the foundation without which algo trading becomes gambling. And the sooner you build it, the fewer expensive lessons the market will need teach you." (deck drops "to": use "will need to teach you", as in the article)

**Beats**
- 824.7 "to sum this all up, anomaly detection isn't a nice to have" / 828.4 "It's the absolute foundation of algo trading" (quote types in; short slide, consider holding it a few seconds into slide 15's narration or merging)

## Slide 15: H2 — References / H2 — Citation. 832.1 to 878.42 (46.3 s)

**Content**
- Left "H2 — References" (mono numbered list):
  1. Anomaly detection in cryptocurrency markets using Isolation Forest
  2. LOF: Identifying local outliers in high dimensional space
  3. Isolation Forest for Anomaly Detection (Sklearn Documentation)
  4. PyOD: A Comprehensive Python Toolbox for Outlier Detection
  5. Transformer-based models for Limit Order Book anomaly detection
  6. Ethical Issues and Market Manipulation in Cryptocurrency
- Vertical divider; right "H2 — Citation" teal box with bibtex:
```
@software{soloviov2026anomalydetectionalgotrading,
  author = {Soloviov, Eugen},
  title = {Anomaly Detection for Trading Bot Protection: From Z-Score to Transformer},
  year = {2026},
  url = {https://marketmaker.cc/en/blog/post/anomaly-detection-algotrading},
  version = {0.1.0},
  description = {Which anomaly detection methods actually work in crypto algo trading, how to build a cascading protection architecture, and why this is the foundation without which algo trading becomes gambling.}
}
```
Article check: matches (sources: MDPI Mathematics, arXiv 2004.09051, scikit-learn, PyOD GitHub, arXiv 2403.04561, Springer).

**Beats**
- 832.1 "the article cites six major references" / 835.8 "including MDPI, Springer, arXiv, Scikit-learn, and PyOD" (list types in)
- 842.5 "today we analyzed Eugen Soloviev's 2026 article" / 847.9 full title read aloud (citation box)
- 852.5 "the numerical claims we discussed rely on that unverified source article" (small disclaimer) / 860.0 "No financial advice here"
- 862.8 final thought: 864.9 "Next time you see a flash crash on a chart" / 867.2 "was that just a random market panic" / 870.1 "or a contextual anomaly that a machine learning model saw brewing in the order book 60 seconds beforehand?" (callback to opening chart cliff; detector lights 60 s before it)
- 876.6 "Thanks for diving in with us" / 877.9 "See you next time" (end card)

---

## Timing notes

`sync_slides.py` (defaults) degenerated ("showed 8/15 slides, longest held 66%") and fell back to an even 58.6 s split (saved as `timeline_auto_evensplit.json`); wrong from slide 2 on (slide 2 auto 58.6 s vs real 89.3 s, slide 3 auto 117 s vs real 270.6 s).

`slide_starts.json` is set by hand from the transcript; the deck follows the article's section order 1:1. Confidence: high = topic sentence names the slide, medium = topic transition without a named heading.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | intro | high |
| 2 Anomaly types | 89.3 | "before we even hunt for these traps ... what actually counts as an anomaly" | high |
| 3 Noise vs anomaly | 270.6 | "But I have to push back ... Isn't this market inherently just noise" | high |
| 4 Simple methods / Z-score | 321.4 | "So how do we actually do that?" (80% claim at 333.9, Z-score at 350.3) | medium (321.4 to 350.3 could stay on slide 3) |
| 5 Level shift | 413.4 | "Which sets up the next tool" (named at 425.8) | high |
| 6 Volatility shift | 452.4 | "that covers shifting averages. But what about volatility?" | high |
| 7 HBOS | 483.3 | "put yourself in the server's shoes ... 10 or more indicators" (named 495.8) | high |
| 8 ML / Isolation Forest | 528.0 | "simple methods cover the 80% ... the other 20%" | high |
| 9 LOF | 600.7 | "what if the bot is trading on multiple exchanges" (named 610.6) | high |
| 10 Autoencoders | 638.6 | "what's the heavy artillery for reading the deep order book?" | high |
| 11 Cascade | 674.8 | "Which brings up a huge engineering question" (named 684.2) | high |
| 12 Recommendations | 735.7 | "practical recommendations from the trenches" | high |
| 13 What's next | 774.9 | "So what's next?" | high |
| 14 Closing quote | 824.7 | "to sum this all up, anomaly detection isn't a nice to have" | medium (only 7.4 s) |
| 15 References/Citation | 832.1 | "the article cites six major references" | high |

## NotebookLM errors summary

1. Slide 4: bell-curve band percentages (-17%, +2.6%, +2.7%, 15%) are nonsense; use 34.1 / 13.6 / 2.1 / 0.1% or no labels.
2. Slide 13 + audio 780.7: merges "Transformer AE + OC-SVM on LOB (spoofing)" with "Staged Sliding Window Transformer on EUR/USD, 315M records (0.93 / 0.91 / 0.95)"; split them.
3. Audio 795.3: "A 95% success rate" misreads AUC-ROC 0.95.
4. Slide 8: merges the Tesla 2021 volatility spike with the separate "price moves unsupported by volume" finding.
5. Slide 11: typo "Tralerts" = "Alerts"; Slide 6: "the the"; Slide 14: "will need teach" = "will need to teach".
6. Slide 2 "Spoofing acts as a signal needing corroboration" and Slide 8 limitation "False positive risks" are NotebookLM framing, not in the article (harmless).
