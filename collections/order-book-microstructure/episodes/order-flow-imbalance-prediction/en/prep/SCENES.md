# order-flow-imbalance-prediction (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
14-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/order-flow-imbalance-prediction.en.md` ("Order Flow Imbalance: The Cont-Kukanov-Stoikov Event Decomposition", 2026-08-17, suenot).

- Audio: `input/notebooklm-sources/order-flow-imbalance-prediction/en/audio.m4a`, 1473.21 s (24:33.2), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, per-word start/end in `words[]`). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `timeline.json` / `slide_starts.json` (manual, see "Timing notes": **the narration does not follow the deck order**, so the timeline has 16 segments for 14 slides and slides 2 and 5 appear out of order).
- Slide PNGs: `slides/slide_001.png` ... `slide_014.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`). Note: the first `pdf_to_images` run wrote a truncated `slide_009.png` (disk contention); it was re-rendered with `pdftoppm -f 9 -l 9` and its OCR redone.

Shared visual language of the deck: warm off-white paper (#F1EFE8) framed by thin grey-blue editorial rules; deep indigo/navy ink (#23214F) for formulas and emphasis, slate grey (#7A8696) secondary bars, green (#2E8B57) = bid / buy, brick red (#C8443A) = ask / sell, mustard (#E3B23C) warning boxes. Grotesk sans titles, serif body text on some slides, IBM Plex Mono-style labels and code. Header "PREMIUM, EDITORIAL QUANTITATIVE RESEARCH REPORT" on slides 3 to 5 and the "Gemini Notebook" watermark: NotebookLM chrome, do not redraw.

The hosts' central metaphor: cancellations and new limit orders are "the ghosts of the market" (30.0, 159.8, 989.0, 1436.6). Good recurring visual: translucent ghost orders that flash in and out of the book and push the mid without a trade.

Transcript quirks (Whisper mis-hearings, do not caption verbatim): "Kant, Kukanov and Stojkov" (255.3) = Cont, Kukanov and Stoikov; "shoe, gold and how is in" (521.9) = Xu, Gould and Howison; "ML, OFI" = MLOFI; "are squared" / "our squared" = R-squared; "best bid mask" (506.2) = best bid and ask; "Lee ready" = Lee-Ready; "OHL CB" (841.0) = OHLCV; "ABI" (923.2) = OBI; "executed by volume and executed cell volume" (947.1) = executed buy volume and executed sell volume; "SKU" (1146.9 to 1160.5) = skew; "redrive" (1215.8) = re-derive; "foundry" (1222.6) = boundary; "waits events by size" (1295.9) = weights events by size; "buyer writing that upward momentum" (804.8) = riding; "imbalance" sometimes heard as "and balance" (1270.1).

---

## Slide 1: Title. 0.0 to 96.8 (96.8 s)

**Content**
- Top-right tab: "[ONLINE] CKS Event Decomposition".
- Title (large grotesk, 3 lines): "Order Flow Imbalance: / The Cont-Kukanov-Stoikov / Decomposition". Serif subtitle: "Turning raw limit order book updates into **signed predictive flow** quantities."
- Right: a horizontal depth profile around a vertical axis: grey bars extending left in the upper rows, dark navy bars extending right in the middle rows, grey bars extending right in the lower rows (stylised order book).
- Bottom mono box: "**Target Audience:** Microstructure Researchers // **System Focus:** Event Decomposition, MLOFI, Signal Extraction".

**NotebookLM error:** "signed *predictive* flow" contradicts the article's framing. OFI is a signed flow quantity; its headline fit is contemporaneous, not predictive. Use "Turning raw book updates into a signed flow quantity" (article description).

**Beats**
- 0.0 "staring at a price chart ... why did it move right at that exact millisecond?"; 12.7 "you didn't even see a massive trade go through" / 16.9 "The volume bars look totally quiet" (price ticks while volume bars stay flat)
- 25.2 "the hidden machinery ... is really about the ghosts of the market" (ghost orders appear in the book); 37.1 "the orders that never actually turned into trades"; 40.5 "flash into the order book and then ... vanish"
- 54.2 "a blueprint for basically catching those ghosts"; 58.5 "take this chaotic, massive stream of raw order book updates and distill it down into a single clean mathematical signal" (stream of updates funnels into one number); 68.2 "order flow imbalance or OFI" (title)
- 82.6 "it fundamentally changes how you view supply, demand, and just how market prices actually form"

## Slide 3: Why Order Flow, Not Trades. 96.8 to 238.4 (141.6 s)

**Content**
- Title "Why Order Flow, Not Trades"; left panel title "The Invisible Iceberg of Market Flow".
- Low-poly iceberg network. Above a horizontal waterline labelled "The Visible Tape": green nodes/edges at left "Market Buys (Consume resting asks)", red nodes at right "Market Sells (Consume resting bids)". Below the waterline, a large grey network: left "Cancellations (Removing support/resistance)", right "New Limit Orders (Adding support/resistance)". Navy callout with an arrow into the submerged mass: "Order-to-Trade Ratio often > 10:1".
- Right bullets: "▪ A continuous limit order book moves via four mechanisms. Only two are actual trades." / "▪ Traditional volume measures miss the invisible majority of price-setting actions. OFI prices all four mechanisms on a single scale."

Article check: matches (four mechanisms; "on most venues the order-to-trade ratio exceeds 10:1, so the invisible part is the large part"; invisible to VWAP, on-balance volume, signed trade flow).

**Sub-scenes** (142 s, split)
- 3a 96.8 to 168.4, four mechanisms: 100.3 "why measure order flow instead of just measuring trades?"; 114.4 "A price change happens through exactly four mechanisms"; 124.8 "a market buy that consumes the resting offers or ... a market sell that consumes the resting bids" (above-water nodes 1, 2); 133.6 "the other two mechanisms are entirely invisible if you're only looking at volume"; 138.1 "a cancellation on the bid" / 143.0 "pulls their limit order and that removes support ... the price to drop without a single share changing hands" (bid level vanishes, mid drops); 152.9 "a new limit order placed on the ask, which just instantly adds resistance"; 157.8 "cancellations and new limit orders. Those are the ghosts"; 161.1 "VWAP or signed trade flow ... completely blind to them".
- 3b 168.4 to 238.4, ratio + analogy: 175.5 "The ratio"; 177.2 "the order to trade ratio is over 10 to one" (1 trade vs 10+ ghost updates counter); 189.2 "like trying to evaluate an elite basketball team by only counting the slam dunks"; 209.8 "a great pump fake by a quarterback" (hosts mix basketball and football; pick one, the pump fake); 219.5 "Cancellations and shifting limit walls are the market's pump fakes"; 223.5 "They force other algorithms to reprice, moving the midpoint completely absent of trades"; 229.5 "OFI's superpower is that it takes all four of those mechanisms ... and prices them on the exact same mathematical scale" (four arrows onto one scale).

## Slide 4: The CKS Event Decomposition. 238.4 to 385.0 (146.6 s)

**Content**
- Title "The CKS Event Decomposition".
- Left, navy serif formulas:
  - `e_n^B = 1{P^b_n > P^b_{n−1}} Q^b_n − 1{P^b_n < P^b_{n−1}} Q^b_{n−1} + 1{P^b_n = P^b_{n−1}} (Q^b_n − Q^b_{n−1})`
  - `OFI_n = e_n^B − e_n^S`
- Right, green decision tree "Bid Side": box "Best bid price transition?" with three branches: "Price Rose" → "Count full new size (+)"; "Price Unchanged" → "Count size change (Δ)"; "Price Dropped" → "Subtract old size (−)".
- Bottom mono text: "The elegance of CKS is completeness. These three indicator branches cover every possible transition of the top of book, mapping every update to exactly one signed number using only two consecutive snapshots."

Article check: matches. Article also gives the ask mirror: `e_n^S = 1{P^a_n < P^a_{n−1}} Q^a_n − 1{P^a_n > P^a_{n−1}} Q^a_{n−1} + 1{P^a_n = P^a_{n−1}} (Q^a_n − Q^a_{n−1})` and interval aggregation `OFI_[T1,T2] = Σ_{n=1..N} (e_n^B − e_n^S)`. Reference: Cont, Kukanov, Stoikov (2014), "The Price Impact of Order Book Events", Journal of Financial Econometrics 12(1), 47-88.

**Sub-scenes** (147 s, split)
- 4a 238.4 to 299.8, the model: 238.4 "how do we actually capture it?"; 251.5 "the foundational CKS model"; 255.3 "a 2014 paper by Cont, Kukanov and Stoikov in the Journal of Financial Econometrics" (citation card); 264.4 "event based order flow imbalance"; 267.1 "bypasses the need for complex trade classification"; 277.3 "All you need are two consecutive snapshots of the best bid and best ask" (two snapshots side by side); 286.8 "I don't need a premium, incredibly expensive message level data feed".
- 4b 299.8 to 385.0, three branches: 299.8 "The core equation is brilliantly simple"; 310.1 "OFI sub n equals e sub n superscript B minus e sub n superscript S" (formula types); 318.7 "a three branch logic system for both the bids and the asks"; 330.2 "the bid side ... branch one"; 334.4 "If the best bid price rises ... count the full size of that new bid as a positive number" (branch 1 lights, +Q_n); 345.3 "Branch two, if the best bid price drops ... take the old size and subtract it" (−Q_{n−1}); 358.3 "branch three. If the price remains unchanged, you simply measure the change in volume"; 364.1 "If the bid size went from 100 shares to 150 shares, your OFI contribution is positive 50" (worked example: 100 → 150 = +50); 371.5 "every single order book update maps to exactly one signed number"; 377.6 "aggregate them over an interval, say like a one minute window, just by summing them up" (Σ).

## Slide 5 (part 1): Price Impact (linear model). 385.0 to 400.3 (15.3 s)

**Content** (slide 5, shown twice in the narration; full content listed here)
- Title "Price Impact and Inverse Depth Scaling".
- Formula: `ΔP_[T1,T2] = α + β · OFI_[T1,T2] + ε`; right text: "Over 10-second to 1-minute intervals, mid-price change is regressed linearly on aggregated OFI."
- Scatter plot: y "Price Impact (β)" 0 to 0.3, x "Average Depth (D)", green and navy dots along a decaying 1/x curve labelled "β ∝ 1/D".
- Right text: "The impact coefficient scales inversely with book depth. The same flow pushes price further in a thin book. This relationship transfers across venues without refitting the level."

Article check: matches (β ∝ 1/D̄, D̄ = average resting volume at best bid and ask; transfers across venues "because it predicts a relationship rather than a number"). The scatter dots are invented illustration; the article says the crypto test of this scaling is still a TODO, so draw a schematic curve without numeric ticks.

**Beats**
- 385.0 "that leads to their linear price impact model"; 388.3 "the change in the mid price over that window equals an alpha constant plus a beta impact coefficient multiplied by your aggregated OFI plus some residual noise" (formula terms appear one by one)

## Slide 2: The Contemporaneous R-Squared Fallacy. 400.3 to 474.7 (74.4 s)

**Content**
- Mono title "The Contemporaneous R-Squared Fallacy".
- Mustard box: "**System Warning:** The headline 50-65% R-squared from the CKS paper is a contemporaneous regression. It decomposes same-interval price moves; it is not a forward-looking forecast."
- Table "The Apples to Oranges Timeline":
  - "Track 1: Contemporaneous": box "OFI (Window k)" → solid navy arrow labelled "50-65% R-squared (Decomposition)" → box "Price Change (Window k)".
  - "Track 2: Predictive" (greyed): box "OFI (Window k)" → dashed grey arrow labelled "1-2% Variance (Forecast)" → box "Price Change (Window k+1)".
- Bottom bordered box: "Comparing contemporaneous fits to daily return models is apples to oranges. Strictly lagged OFI regressions yield legitimate, but much smaller, predictive edges."

**NotebookLM error (flag):** the "1-2% Variance (Forecast)" label on the lagged-OFI arrow is wrong. In the article, 1-2% is the variance "a daily equity return model explains", the thing the 50-65% must NOT be compared against. The article gives no figure for lagged OFI R²; it says "expect a substantially worse fit" and leaves the measurement as a TODO. Redraw Track 2 as "lagged fit: much smaller (not measured here)", and if 1-2% appears at all, put it on a separate reference bar "daily return models: 1-2%".

**Beats**
- 400.3 "the article throws up a massive flashing warning sign about this specific model" (warning box)
- 408.5 "The original paper reports this famous 50 to 65% R squared for US equities" (big 50-65%); 413.9 "sounds like an absolute holy grail ... but it's kind of a trap"
- 423.8 "the 50 to 65% R squared is a contemporaneous measure" / 431.9 "happening at the same time" (Track 1)
- 437.6 "regressing the price change over a specific interval against the order flow over that exact same interval"
- 443.3 "measuring the wind at the exact moment the tree falls just to prove that the wind knocked it over" (gag: wind gauge + falling tree, same frame); 451.8 "They aren't predicting that the tree will fall tomorrow"
- 455.6 "an explanatory decomposition of why the price just moved"
- 459.6 "using lagged OFI to guess the next price move, the R squared drops significantly" (Track 2, window k → k+1, bar shrinks); 469.0 "still a highly valuable signal, but it's much smaller than 60%"

## Slide 5 (part 2): Inverse Depth Scaling. 474.7 to 500.0 (25.3 s)

**Content**: see slide 5 above (β ∝ 1/D chart).

**Beats**
- 474.7 "a really important rule about how different markets react to order flow ... cross sectional scaling"
- 481.4 "The impact coefficient, that beta variable ... scales inversely with depth" (curve draws); 485.7 "the same amount of order flow will push the price much further in a thin illiquid order book than ... a thick, highly liquid one" (same OFI arrow into thin vs thick book, mid moves far vs little)

## Slide 6: Multi-Level Order Flow Imbalance (MLOFI). 500.0 to 617.9 (117.9 s)

**Content**
- Title "Multi-Level Order Flow Imbalance (MLOFI)".
- Left "The Stacked Vector Visual": column vector `[OFI_n^(1); OFI_n^(2); ⋮; OFI_n^(L)]` with a curly brace → `MLOFI_n`.
- Right: bar chart of decaying coefficients β1 (tallest, grey), β2 (grey), then three navy bars decreasing, "...", β_L (small); arrow label "Top of Book dominates (|β1| > |β2| > ... > |βL|)".
- Bottom left: "Xu, Gould, and Howison (2019) extend the identical three-branch formula to L levels. On Nasdaq equities, each additional level adds out-of-sample R-squared up to level 10."
- Bottom right, mustard border: "**Open Question for Crypto:** Crypto books are thinner and churn heavily at depth. Levels 2-5 may add zero edge outside traditional equity structures."

Article check: matches. Article: `ΔP = α + Σ_{ℓ=1..L} β_ℓ · OFI^(ℓ) + ε`; roughly +10-15 percentage points of out-of-sample R² going from 1 level to 5, marginal gains still present at 10; Xu, Gould, Howison (2019), arXiv:1907.06230.

**Sub-scenes** (118 s, split)
- 6a 500.0 to 558.3, the extension: 500.8 "the CKS model is brilliant at tracking the top of the book, but the market isn't just the best bid and ask"; 508.9 "this massive iceberg of resting orders sitting below the surface" (callback to the iceberg); 518.4 "the natural evolution ... in 2019"; 521.9 "Xu, Gould and Howison ... multi-level order flow imbalance or MLOFI"; 531.4 "the exact same three branch mathematical formula ... applied to L levels deep" (branch tree replicates down the book); 539.1 "a distinct OFI signal for level one, a separate signal for level two, level three" (vector stacks); 547.3 "five levels deep".
- 6b 558.3 to 617.9, diminishing returns + crypto: 558.3 "with diminishing returns"; 562.3 "on Nasdaq equities, expanding from just the top level to five levels deep adds roughly 10 to 15 percentage points of out of sample R squared" (R² meter +10-15 pp); 574.6 "the top of the book still dominates the signal" (β1 tallest, β decay); 584.5 "a really interesting open question"; 591.5 "But what about crypto?"; 599.1 "Crypto order books ... are notoriously thinner and the deeper levels churn heavily" (crypto book flickers at depth); 608.3 "levels two through five add absolutely zero predictive value because the signal just gets drowned out by noise" (deeper bars fade to static).

Host additions: 602.8 "churn heavily with spoofing and noise algorithms" and 612.5 "absolutely zero" are stronger than the article ("entirely plausible that levels 2-5 add nothing"). Keep it as a question mark, not a verdict.

## Slide 7: Collapsing Collinearity via PCA. 617.9 to 705.6 (87.7 s)

**Content**
- Title "Collapsing Collinearity via PCA".
- A funnel: 7 navy arrows pour in from the top, label "L-level MLOFI vector (highly correlated layers, >0.8 correlation)"; on the funnel body `OFI^PC1 = w^T · MLOFI`; callout "w is Leading eigenvector of OFI covariance matrix"; a single drop exits labelled "First Principal Component (PC1)".
- Bottom: "**Mechanics:** Adjacent-level OFIs are highly correlated. PCA compresses this into a single, well-conditioned scalar." / "**Literature Result:** Captures >89% of total variance on published equity results. Worth implementing to collapse collinearity."

Article check: matches (correlation above 0.8, PC1 over 89% of variance, "worth doing even if the variance share on your data comes out lower").

**Beats**
- 617.9 "assuming you are in a market where the deep book matters, you now have a new problem"; 623.5 "five levels for bids and five levels for asks ... a massive array of data"
- 634.9 "principal component analysis or PCA, this is a dimensionality reduction technique" (funnel appears)
- 642.2 "adjacent levels in an order book don't move independently"; 646.6 "market making algorithms typically peg their deeper orders to the mid price" (host reasoning, not in article); 652.7 "If the top level gets consumed ... those algorithms instantly pull and reprice their orders at levels two, three and four" (levels move together)
- 663.6 "PCA can collapse those multiple levels into a single scalar value"; 669.7 "the leading eigenvector, that explains the most variance"
- 678.6 "five different boats tied together on a river ... model the underlying current" (gag: 5 boats, one current arrow = PC1)
- 690.9 "the single PCA component captured over 89% of the total variance" (89% gauge); 698.9 "boiled down into one clean usable number"

## Slide 8: Trade Classification: Buy vs. Sell Initiated. 705.6 to 901.0 (195.4 s)

**Content**
- Title "Trade Classification: Buy vs. Sell Initiated".
- Table "Trade Classification Matrix", columns Lee-Ready Algorithm | Bulk Volume Classification (BVC):
  - Input: Tick-level Trade/Quote data | OHLCV Aggregated Bars
  - Logic: Quote Rule (Trade > Mid = Buy), fallback to Tick Rule | `V_t^buy = V_t · Φ(ΔP_t / σ_ΔP)`
  - Constraint: Requires microsecond/tick level data. Reported Accuracy: 72-85% | Relies on the normal CDF for block approximations. Functional without tick data.
- Footer: "**Context:** OFI requires no trade classification. However, testing OFI against legacy flow metrics requires reverse-engineering trade intent."

Article check: matches. Quote rule: side = +1 if P_t > M_t, −1 if P_t < M_t, M_t = (ask + bid)/2. Lee-Ready (1991, J. Finance 46(2) 733-746) = quote rule + tick-rule fallback at the midpoint ("Reported Lee-Ready classification accuracy is 72-85% depending on market and period"). Tick rule: sign of last price change, previous side carried forward on a zero tick. BVC (Easley, Lopez de Prado, O'Hara): Φ = standard normal CDF, σ_ΔP from recent price changes; less accurate than tick-level classification but works on OHLCV. Article's `classify_trades_lee_ready` uses `pd.merge_asof(..., direction="backward")` for the prevailing quote.

**Sub-scenes** (195 s, split into 3)
- 8a 705.6 to 762.3, why classify + quote rule: 705.6 "let's shift gears"; 707.5 "event based OFI, which assumes you have perfect snapshot level data ... What if you don't?"; 715.3 "only standard aggregated data bars or ... need to test OFI against traditional trade metrics"; 723.9 "you have to classify the trades"; 737.7 "the quote rule"; 740.7 "compare it to the prevailing midpoint of the bid ask spread"; 747.1 "higher than the midpoint, you classify it as a buy. If it's lower ... a sell" (trade dots land above/below mid line, colour green/red); 753.5 "willing to pay above the fair value midpoint ... crossing the spread".
- 8b 762.3 to 836.9, Lee-Ready: 763.2 "the quote rule has a glaring weakness"; 766.0 "a trade executes exactly at the midpoint?" (dot exactly on the mid line, grey "?"); 775.4 "the Lee-Ready algorithm"; 778.4 "developed back in 1991"; 782.7 "the quote rule first, but it adds a tick rule fallback"; 794.7 "Imagine the midpoint is exactly $10 and a trade hits at $10" (worked example); 798.6 "looks at the previous price change. Was the last price move an uptick?"; 804.8 uptick → buy; 811.1 "down tick, it labels the trade a sell"; 820.2 "an illustrative accuracy rate of roughly 72 to 85%" (accuracy band); 829.4 "an estimation technique ... inherently noisier than the deterministic event based OFI".
- 8c 836.9 to 901.0, BVC: 836.9 "noisier if you don't even have tick by tick trade data"; 841.0 "only standard OHLCV candles ... bulk volume classification or BVC"; 852.1 "a statistical workaround. It doesn't look at individual trades at all"; 856.7 "estimates the percentage of buying volume inside a candle by looking at the normalized price change" (candle, ΔP/σ arrow); 864.2 "through a standard normal cumulative distribution function" (S-shaped Φ curve); 874.7 "if a price candle rockets upward, the probability that the volume inside it was buyer driven approaches 100%" (point slides to top of Φ); 884.3 "If the candle barely moves ... split 50-50" (point at Φ(0) = 0.5); 894.4 "a blunt instrument, but when aggregated candles are all you have, it's the best tool".

## Slide 9: Diagnostic Matrix: What OFI Is Not. 901.0 to 1007.2 (106.2 s)

**Content**
- Title "Diagnostic Matrix: What OFI Is Not".
- Three columns (the OFI column framed by a thick navy border):
  - "Static Order Book Imbalance (OBI)": Focus: **State**; Description: Resting bids vs. resting asks. Snapshot only.
  - "Order Flow Imbalance (OFI)": Focus: **Journey**; Description: Event tracking and transitions between snapshots.
  - "Trade Imbalance (TI)": Focus: **Execution**; Description: Signed trade flow (volume-weighted).
- Bottom left: Venn diagram, small circle "Trade Imbalance (TI)" inside a big circle "Order Flow Imbalance (OFI)".
- Bottom right: "**Subsumption Insight:** When OFI and Trade Imbalance (TI) are regressed jointly on mid-price changes, TI becomes statistically insignificant. The events that almost became trades carry the same information as those that did."

Article check: subsumption result matches. The last sentence is NotebookLM's paraphrase; the article's reason is "the cancellations OFI sees and TI cannot are what make the difference". Article's third neighbour (also in the narration): the volume-weighted mid is a fair-value estimator, not an imbalance measure, and not Stoikov's micro-price (`M_t + g(I,S)`). The Venn (TI ⊂ OFI) is a loose metaphor for "subsumes"; fine to keep.

**Sub-scenes** (106 s, split)
- 9a 901.0 to 941.9, OBI: 901.0 "all these acronyms floating around now. OFI, MLOFI, PCA, BVC" (acronyms swirl); 907.4 "let's explicitly define what OFI is not"; 916.6 "confusing OFI with static order book imbalance, or OBI"; 923.2 "OBI is just a static snapshot ... total volume of bids ... versus the total volume of asks at one specific moment" (OBI column); 931.2 "It tells you the state of the book"; 933.2 "OFI ... tells you how it got there"; 937.9 "One is the destination, the other is the journey" (Focus: State vs Journey).
- 9b 941.9 to 1007.2, TI + VW mid: 944.2 "OFI is not trade imbalance"; 947.1 "net difference between executed buy volume and executed sell volume" (TI column); 956.6 "a regression using both OFI and traditional trade imbalance"; 964.3 "Trade imbalance was rendered statistically insignificant" (TI coefficient bar collapses to ~0); 977.2 "entirely swallowed up by the signal from the canceled and shifted orders" / 982.5 "OFI completely subsumes it" (Venn: TI circle absorbed); 989.0 "The ghosts dictate the price far more than the actual transactions"; 995.0 "OFI is not the volume-weighted mid ... a fair value pricing estimator".

Host overstatement: 971.1 "traditional volume metrics become mathematically irrelevant" and 1399 "trade imbalance becomes mathematically obsolete" go beyond the article (TI is insignificant *when entered jointly with OFI in that regression*). Caption it as "TI insignificant alongside OFI".

## Slide 10: Implementation Blueprint: The Core Calculator. 1007.2 to 1057.6 (50.4 s)

**Content**
- Title "Implementation Blueprint: The Core Calculator".
- Flow: "OrderBookSnapshot" → "OFICalculator (Maintains state of prev_snapshot)" → "MLOFI Vector".
- Code panel:
  ```python
  def compute_level_ofi(prev_price, curr_price,
      prev_size, curr_size, side):
      if curr_price > prev_price:
          return curr_size
      elif curr_price < prev_price:
          return -prev_size
      else:
          return curr_size - prev_size
  ```
- Right: "The calculator evaluates every level against the three CKS branches. The code showcases data flow (Snapshot → Vector) rather than production-ready optimized C++."

**NotebookLM error (flag):** the slide code is the bid branch only and ignores its `side` argument; applied to the ask side it would have the wrong sign. Article version:
```python
if side == "bid":
    if curr_price > prev_price:
        return curr_size              # new level appeared above
    elif curr_price < prev_price:
        return -prev_size             # old level disappeared
    else:
        return curr_size - prev_size  # same level, size changed
else:  # ask side
    if curr_price < prev_price:
        return curr_size              # new level appeared below
    elif curr_price > prev_price:
        return -prev_size             # old level disappeared
    else:
        return curr_size - prev_size  # same level, size changed
```
then per level `ofi[level] = e_buy - e_sell`; `OFICalculator(n_levels=5)`; `update()` returns `None` on the first snapshot. `OrderBookSnapshot` fields: timestamp, bid_prices (best at index 0, descending), ask_prices (best at 0, ascending), bid_sizes, ask_sizes.

**Beats**
- 1007.2 "Let's talk implementation ... sample Python code"; 1012.0 to 1041.0 disclaimer "purely instructional ... not production ready" (one small "instructional" tag; hosts' "don't try this at home")
- 1042.9 "structured very cleanly"; 1047.0 "First, there's a core calculator" (flow boxes); 1049.1 "implements the three branch logic for L levels deep, constantly spitting out new MLOFI vectors as snapshots arrive" (snapshot in, vector out, repeat)

## Slide 11: Implementation Blueprint: Aggregation & Normalization. 1057.6 to 1128.6 (71.0 s)

**Content**
- Title "Implementation Blueprint: Aggregation & Normalization".
- Flow: "MLOFI Vector Stream" → "OFIAggregator (Fixed Time Windows)" → "OFISignal (Rolling Z-Score)"; the aggregator emits a code chip `{ 'delta_mid': X, 'mlofi': Y }`.
- Box with mustard "◆!" and navy top bar: "**System Warning:** Note what the aggregator emits: **mlofi** and **delta_mid** over the SAME window. This is the contemporaneous fit."
- Footer: "To achieve a predictive fit, window k's OFI must be paired with window k+1's delta_mid. Normalization uses a rolling z-score, but converting to a predicted return requires fitting a venue-specific beta."

Article check: matches. Defaults: `OFIAggregator(window_seconds=10.0, n_levels=5)`; flush emits window_start, window_end, n_updates, mid_open, mid_close, delta_mid, ofi_level1, ofi_total, mlofi; `OFISignal(lookback=100)`, z-score only once ≥ 20 windows are stored, sigma floored at 1e-10, computed on `ofi_level1`.

**Beats**
- 1057.6 "that raw data feeds into an aggregator class"; 1060.9 "group those rapid fire updates into fixed time windows" (vectors drop into window buckets)
- 1066.1 "vital to notice what it outputs ... aggregated MLOFI alongside the delta mid price over that same window" (warning box; callback to slide 2 Track 1); 1073.9 "reinforcing that contemporaneous trap"
- 1082.4 "the normalization step ... a rolling z-score" (bell curve, z marker)
- 1093.4 "a very deliberate specific note ... The code stops at the z-score" / 1098.7 "deliberately does not try to convert that z-score into a predicted return"
- 1105.2 "you need a fitted beta coefficient"; 1113.3 "It changes based on the trading venue, the liquidity of the asset, and the current volatility regime"; 1121.2 "A generic hard-coded beta would fail disastrously"

## Slide 12: Production Integration: Where OFI Plugs In. 1128.6 to 1253.9 (125.3 s)

**Content**
- Title "Production Integration: Where OFI Plugs In".
- "Layer 1: Market Making (Fair Value Modeling)": formula `P^fair = P^mid + γ_flow · OFI_z − γ_inv · q`; text "OFI serves as a predictive skew term answering "where is price going?", complementing the inventory term which answers "what can we afford to hold?". High |OFI_z| acts as an adverse-selection trigger."
- "Layer 2: Execution (Tactics Layer)": gauge icon "Fill Probability (p)"; formula `p* = δ / (I + δ)`; text "OFI is an input to the tactics layer's fill-probability estimate. Crucially, the tactics layer should not re-derive urgency from its own view, avoiding competing controllers."

**NotebookLM error (flag):** the execution formula is printed `p* = δ/(I + δ)`. Article: `p* = δ/(Π + δ)` with `Π = s + f_t − f_m` (spread + taker fee − maker fee, the maker "prize"). Redraw with Π and show its definition. Rest matches (article: large |OFI_z| is "a reasonable adverse-selection trigger for the defensive responses (widen, shrink, pull one side)"; links to Avellaneda-Stoikov and child-order execution tactics).

**Sub-scenes** (125 s, split)
- 12a 1128.6 to 1186.5, market making: 1131.0 "They fit the beta"; 1135.6 "Where do they actually plug this into their systems?"; 1138.6 "market making and execution tactics" (two layers); 1146.9 "OFI acts as a predictive skew on fair value" (formula; fair-value marker shifts off mid); 1151.1 "Market makers track their inventory skew"; 1160.5 "inventory skew tells the algorithm what it can afford to hold"; 1166.4 "OFI tells the algorithm where the broader market is actively trying to push the price"; 1170.5 "an early warning radar, like an adverse selection trigger" (radar sweep); 1175.7 "If the OFI suddenly spikes ... pull its passive quotes or widen its spread" (quotes pull back as OFI_z spikes).
- 12b 1186.5 to 1253.9, execution: 1188.7 "trying to buy a million shares optimally"; 1194.3 "OFI is fed into the fill probability estimate" (gauge p); 1198.4 "post a passive limit order and wait to earn the spread, or ... cross the spread"; 1208.1 "explicit break even arithmetic" (p* = δ/(Π+δ)); 1215.8 "the lower level execution tactics layer should never try to re-derive market urgency from its own OFI readings"; 1224.0 "a catastrophic feedback loop" / 1238.0 "two controllers fighting each other" (two steering wheels tug-of-war); 1242.9 "The chain of command has to remain clean"; 1244.3 "The tactics layer should just execute the break even math based on the inputs the top level provides".

## Slide 13: Practical Limitations & Market Decay. 1253.9 to 1362.5 (108.6 s)

**Content**
- Title "Practical Limitations & Market Decay"; three panels:
  - "Risk Modules 1 / Signal Decay": decaying curve, y "Signal Strength", x "Milliseconds to Seconds". "Predictive content decays rapidly. Aggregation windows are bets on the horizon."
  - "Module 2 / Recalibration": network icon "Nasdaq" → dashed arrow broken by a lightning bolt → network icon "Crypto". "β moves intraday with depth. Fits from one asset class will not transfer untouched to another."
  - "Module 3 / Manipulation (Spoofing)": bars "Bid" (tall green bar crossed out with a red ✕, a small green bar) | "Ask" (red bars). "The model is blind to intent. It weights by size alone. A spoofer placing/canceling size injects directly into the signal at full weight by construction."

Article check: matches (article: β moves intraday, with depth, and around scheduled events; detection heuristics: cancel rates, order lifetimes, wall behaviour as price approaches).

**Sub-scenes** (109 s, split)
- 13a 1253.9 to 1290.1, decay: 1253.9 "an honest accounting of the real world friction ... this isn't a magic money printer"; 1267.4 "signal half life"; 1270.1 "decays incredibly fast" / 1275.3 "milliseconds to seconds in highly liquid instruments" (decay curve); 1280.2 "You cannot run a static backtest, find a profitable beta and walk away"; 1284.8 "continuous rolling recalibration".
- 13b 1290.1 to 1362.5, spoofing: 1290.1 "the biggest vulnerability ... is manipulation"; 1295.9 "the CKS model weights events by size alone with absolutely no notion of intent"; 1302.7 "blast a massive limit order into the book just to immediately cancel it a millisecond later" (ghost wall appears, OFI spikes, wall vanishes); 1313.6 "the foundational model is highly spoofable"; 1319.5 "inject fake momentum directly into your OFI signal, tricking your systems into moving their fair value"; 1335.5 "It requires external detection heuristics"; 1344.0 "abnormal cancel rates, suspicious order lifetimes and wall behavior where a massive order consistently disappears the exact millisecond the price gets near it" (three filter icons); 1355.4 "filter the raw OFI through those heuristic layers" (filter strips the spike).

## Slide 14: System Blueprint: Core Axioms. 1362.5 to 1473.2 (110.7 s)

**Content**
- Mono title "System Blueprint: Core Axioms". Six bracketed items:
  1. **Event Decomposition**: OFI maps transitions (price/size), not resting snapshot states.
  2. **Contemporaneous R-Squared**: 50-65% explains same-interval moves. It is not a forward forecast.
  3. **PCA Compression**: Multi-level OFI adds edge, but extreme collinearity requires PCA reduction.
  4. **Subsumption**: OFI subsumes Trade Imbalance. Cancellations are the missing matter.
  5. **Intent Blindness**: Size-weighting creates inherent vulnerabilities to spoofing.
  6. **Empirical Validation Needed**: Literature metrics cited are equities-based. Lagged specifications must be tested on proprietary book data.
- Footer: "Reference: Cont, Kukanov & Stoikov (2014) | Xu, Gould & Howison (2019)".

Article check: matches the article's six Key Takeaways, except item 3 "adds edge" overstates (article: the incremental-R² result is from Nasdaq equities, "Whether depth still helps on a crypto book is untested here"). Use "Multi-level OFI adds levels; PCA collapses them". Article takeaway 6 also says "check whether the edge survives fees and the spread". Further reading list in the article adds Kolm, Turiel, Westray (2023) "Deep Order Flow Imbalance", Lee & Ready (1991), Easley, Lopez de Prado, O'Hara (2012) "Flow Toxicity and Liquidity in a High-Frequency World".

**Sub-scenes** (111 s, split)
- 14a 1362.5 to 1422.3, recap: 1367.8 "order flow imbalance is fundamentally an event decomposition, not a static snapshot" (axiom 1); 1378.5 "the headline R squared figures are contemporaneous explanatory metrics, not forward looking forecasts" (axiom 2); 1385.8 "MLOFI utilizes principal component analysis to collapse the highly correlated deeper levels" (axiom 3); 1394.4 "traditional trade imbalance becomes mathematically obsolete" (axiom 4; caption per the flag on slide 9); 1403.9 "inherently blind to intent, making it highly vulnerable to spoofing" (axiom 5); 1410.8 "every single number and parameter ... must be rigorously measured and fitted on your own proprietary data before ever touching real capital" (axiom 6).
- 14b 1422.3 to 1473.2, outro: 1422.5 to 1436.6 review / no-investment-advice boilerplate (tiny line); 1436.6 "we started this deep dive by talking about the ghosts of the market" (ghosts return); 1452.1 "If quantitative pricing models are purely mechanical and are so easily manipulated by the ghosts of canceled orders, are modern markets actually pricing the fundamental value of an asset?" / 1463.5 "Or are they simply pricing the illusions created by competing algorithms?"; 1470.3 "Thanks for joining us"; 1472.2 "See you next time" (end card).

---

## Timing notes

`sync_slides.py` (default params) degenerated ("showed 9/14 slides, longest held 89%") and fell back to an even 105.2 s split (saved as `timeline_auto_evensplit.json`).

**The narration does not follow the deck order.** The deck puts "The Contemporaneous R-Squared Fallacy" (slide 2) right after the title, but the hosts only reach it at 400.3, after the CKS formula and the linear price-impact model, and then return to slide 5's depth-scaling half at 474.7. `timeline.json` is therefore a list of 16 narration-ordered segments, each with an explicit `slide` index (0-based, as in the reference format); `slide_starts.json` holds the 16 monotonic segment starts in the same order (segment i shows `timeline[i].slide`, it is NOT indexed by slide). Since every frame is redrawn in code, scene builders should follow the segment order.

| Seg | Slide | Start | Cue | Confidence |
|---|---|---|---|---|
| 0 | 1 Title | 0.0 | cold open (ghosts) | high |
| 1 | 3 Why order flow | 96.8 | "a perfect segue into our first core concept ... why measure order flow instead of just measuring trades?" | high |
| 2 | 4 CKS decomposition | 238.4 | "how do we actually capture it? ... that brings us to the foundational CKS model" | high |
| 3 | 5 Price impact (formula half) | 385.0 | "that leads to their linear price impact model" | high |
| 4 | 2 R-squared fallacy | 400.3 | "the article throws up a massive flashing warning sign about this specific model" | high |
| 5 | 5 Depth scaling half | 474.7 | "a really important rule ... cross sectional scaling" | high |
| 6 | 6 MLOFI | 500.0 | "The CKS model is brilliant at tracking the top of the book, but ..." | high |
| 7 | 7 PCA | 617.9 | "assuming you are in a market where the deep book matters, you now have a new problem" | high (PCA named at 634.9) |
| 8 | 8 Trade classification | 705.6 | "let's shift gears for a second" | high |
| 9 | 9 What OFI is not | 901.0 | "So we have all these acronyms floating around now" | high |
| 10 | 10 Core calculator | 1007.2 | "Let's talk about implementation" | high |
| 11 | 11 Aggregation & normalization | 1057.6 | "Then that raw data feeds into an aggregator class" | medium-high (calculator and aggregator described back to back) |
| 12 | 12 Where OFI plugs in | 1128.6 | "So let's say a quantitative desk does that. They fit the beta ... Where do they actually plug this in" | high |
| 13 | 13 Limitations | 1253.9 | "before anyone listening tries to build an OFI model, we need an honest accounting of the real world friction" | high |
| 14 | 14 Core axioms | 1362.5 | "if we're pulling this all together, synthesizing this entire deep dive" | high |
| 15 | 14 Core axioms (outro) | 1422.3 | review boilerplate + ghosts callback, same slide | high |

Segment 15 repeats slide 14 only to mark the outro sub-scene; merge it with 14 if a builder prefers one entry per slide visit. Sub-scenes for segments over ~90 s are listed per slide above: 3 (2), 4 (2), 6 (2), 8 (3), 9 (2), 12 (2), 13 (2), 14 (2).
