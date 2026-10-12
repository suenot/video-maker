# automl-systematic-trading (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
11-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/automl-systematic-trading.en.md` (2026-07-30, suenot).

- Audio: `input/notebooklm-sources/automl-systematic-trading/en/audio.m4a`, 1393.24 s (23:13.2), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, word timestamps in `words[]`). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_011.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: technical-blueprint look. Warm off-white paper (#F1EFE8), charcoal ink (#2B2E33) for frames, tables and mono text, cyan/teal accent (#2BB3C8) for "AutoML / the machine's side", mustard/amber (#C9921E) for budget and caution, red (#C8202A) for critical warnings (thick red left bar on warning boxes). Mono font for headings with markdown level prefixes "H2 —", "H3 —" (keep the prefixes only if the series style uses them). Formulas in LaTeX serif italic. "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "Classic and possible task" (6.5, 8.5, said twice) = "classic impossible task"; "TS Fresh" = tsfresh; "feature tools" = Featuretools; "Benjamini-Yekitele" = Benjamini-Yekutieli; "Flammel" = FLAML; "a tool for Microsoft" (588.1) = from Microsoft; "Aptuna" = Optuna; "tree structured parson estimators" = Tree-structured Parzen Estimators; "rock" (259.7) = ROC (roc_auc); "portrayed sharp ratio" (282.5) = per-trade Sharpe ratio; "sharp" = Sharpe throughout; "find a VAS search space" (807.0) = define a NAS search space; "breath" = breadth; "NF equals N divided by CF" (956.7) = N_eff = N / C_f; "alpha facti" (1032.0) = alpha factory; "peaking" (1193.1) = peeking.

---

## NotebookLM errors / things NOT to reproduce

1. **Slide 2 objective box attributes the lottery result to roc_auc.** It says "Optimizing roc_auc crowned a sub-5% exposure lottery in 56% of 600 seeds". The article says a *naive per-trade Sharpe* crowns the sub-5%-exposure lottery in 56% of 600 seeds (in-sample Sharpe 21, out of sample 0.13); roc_auc is the separate "don't optimize a proxy" point. Narration (282.5) gets it right. Redraw: "A naive per-trade Sharpe crowned a sub-5% exposure lottery in 56% of 600 seeds: in-sample Sharpe 21, out-of-sample 0.13."
2. **Slide 5 left panel "Traditional Search Grid (Optuna/TPE)"** draws a uniform dot grid. TPE is not grid search; it concentrates samples near good past results. Redraw as adaptive sampling (dots clustering toward a hot spot), or label it "Where to sample next? (Optuna/TPE)".
3. **Slide 6 search-space box** lists cell types {LSTM, GRU, Transformer, Linear} and omits Temporal Conv; article: {LSTM, GRU, Temporal Conv, Transformer block, Linear}, layers [1, 8], lookback {20, 60, 120, 252} (narration 819.7 includes temporal convolution). The tree diagram has an invented "Pooling" node and typo "Nozmalization" twice; redraw as LayerChoice (cell) -> optional skip (InputChoice) -> LayerChoice (head) -> output, per the article code. "sample-efficient samplers are mandatory" overstates the article ("genuinely pay for themselves"); prefer "pay for themselves".
4. **Slide 7 typos**: "alphs", "cor-elated". Redraw "1,000,000 correlated alphas do not compound."
5. **Slide 9 diagram** repeats "6 templates" 7 times and "5 windows" 6 times. Correct structure: 6 templates (momentum, mean_reversion, vol_surprise, price_vol_divergence, volatility_rank, high_low_range) x 5 windows (5, 10, 20, 60, 120) = 30 configurations.
6. **Slide 10 headers** are truncated "⚠ WAR" (WARNING cut off) and pillar 3 has "PBO's PBO's null". Redraw with a full "WARNING" or just a warning icon.
7. **Slide 1 decorative diagram** has garbled labels ("COWERGENCE_POINT", "BATA_SOURCE", "Q_SCORE: 9.82", "WARN: Overfit"). Redraw cleanly; do not show a fake quality score.
8. **"Exponentially"** (narration 1340.6 and slide 11 footer: "AutoML raises the trial count exponentially"): the article says "by orders of magnitude". Use that wording.
9. **FDR wording** (437.4): "no more than 5% of your winning features are false positives". Benjamini-Yekutieli controls the *expected* share of false discoveries at 5%. If a caption is needed, say "expected false-discovery share <= 5%".
10. **"marked as TODO in the code"** (1085.2): the article has a TODO note in its text, not in the script; the report is labeled schematic. Minor; the slide's "Real-data IC/DSR/PBO results are TODO" is fine.
11. Slide 3 heading "800+ Features" is the article's own heading; the body (and narration) says ~794. Show "~794" in the diagram.

---

## Slide 1: Title. 0.0 to 112.1 (112.1 s)

**Content**
- Left third, large dark sans: "AutoML for / Systematic / Trading / Pipelines". Grey subtitle: "Feature generation, budget-aware search, the WorldQuant alpha factory, and the statistical debt of automation."
- Right two thirds, blueprint diagram (registration crosshairs, faint construction lines): ~45 inputs on the far right labelled DATA_SOURCE_A1 ... (with "⋮" gaps) fan out via a tangle of charcoal, cyan and amber lines into four module boxes in a column: a gear icon box "FEATURE_ENG_MODULE [CYAN: ALG]" (cyan), a grid icon box "SEARCH_SPACE [AMBER: COMPUTE]", a dense chip-matrix box (red tag "WARN: Overfit"), and an amber CPU chip box. Lines converge through two vertical bars "CONVERGENCE_POINT_1 [FLOW: 90%]" into a dark arrow-shaped box pointing left "ALPHA_SIGNAL_OUTPUT [Q_SCORE: 9.82]" (see error 7).

**Sub-scenes and beats**
- 1a Haystack (0.0 to 37.2): 0.0 "find a needle in a haystack"; 6.5 "classic impossible task"; 10.3 "you've built an AI robot to help you search"; 15.2 "instead of carefully picking through your existing haystack, the robot just starts generating like a million new haystacks every single second" (haystacks multiply); 26.6 "how do you possibly know what is a real needle and what is just a random piece of straw that ... happens to look perfectly sharp?" (straw glints like a needle).
- 1b Title and mission (37.2 to 112.1): 37.2 "welcome to the deep dive"; 39.4 "a lone quant carefully crafting a single mathematical model" / 48.1 "artisan approach" (quant at a desk); 50.6 title read "AutoML for Systematic Trading Pipelines" (title types in at ~54.0); 57.0 "hand that entire process over to the machines"; 70.3 "do the work of a whole floor of researchers in minutes"; 78.4 "a brutal mathematical debt" (debt meter appears); 81.0 "every time your machine generates a new haystack, it increases the probability ... straw that just looks like a needle"; 91.7 mission: "automated feature generation, budget-aware model search, formulaic alpha factories" (three icons) / 100.2 "the guardrails"; 103.4 "survive the massive explosion in trial counts"; 109.3 "the trial count is where the danger lives" (trial counter starts ticking; keep it as a running motif through the episode).

## Slide 2: H2 What AutoML Automates. 112.1 to 309.6 (197.5 s)

**Content**
- Header bar "H2 — What AutoML Automates".
- Table, 3 columns: (stage) | "Manual Approach" (cyan underline) | "AutoML Approach" (cyan underline). AutoML column has key terms in cyan:
  - Feature engineering | Domain expert crafts indicators | Automated extraction (tsfresh, Featuretools)
  - Feature selection | Correlation analysis, intuition | Statistical hypothesis testing, SHAP
  - Model selection | Try 2-3 models | Search over dozens of learners
  - Hyperparameter tuning | Grid search, manual tweaking | Bayesian / cost-frugal search (Optuna, FLAML)
  - Architecture design | Fixed neural network topology | Neural Architecture Search (NAS)
  - Ensemble construction | Manual stacking | Automated ensemble selection
- Red box (pink fill) "THE OBJECTIVE FUNCTION IMPERATIVE": "The AutoML scorer must optimize the financial objective (e.g., Sharpe), not a proxy classification metric like roc_auc." Bullet (red numbers): "Optimizing roc_auc crowned a **sub-5%** exposure lottery in **56%** of **600** seeds, yielding an in-sample **Sharpe** of **21** that collapsed to **0.13** out of sample." (fix per error 1)

Article check: table matches the article exactly.

**Sub-scenes and beats**
- 2a Six stages (112.1 to 226.3): 112.1 "let's unpack this"; 119.6 "six specific stages of automation"; 125.0 row 1 "feature engineering"; 134.5 "away from human domain experts crafting indicators based on their gut intuition ... toward automated statistical extraction"; 147.3 row 2 "feature selection"; 150.2 "simple correlation analysis to ... rigorous hypothesis testing"; 164.3 row 3 "model selection" / 167.1 "two or three of their favorite models ... dozens of different learners"; 178.0 row 4 "hyperparameter tuning" / 180.9 "manual painstaking grid search to ... cost frugal search"; 186.1 "aware of how expensive its own processing power is" / 193.1 "It budgets its time"; 198.0 row 5 "architecture design" / 201.0 "fixed neural network topologies to neural architecture search" / 206.5 "invents its own internal wiring"; 213.8 row 6 "ensemble construction" / 216.9 "manual stacking to automated selection"; 224.6 "handing over the keys" (each row: manual cell dims, AutoML cell lights cyan).
- 2b Objective-function trap (226.3 to 309.6): 227.4 "the objective function trap" (red box slides in); 238.3 "the machine is entirely literal ... optimize exactly what you tell it ... and absolutely nothing else"; 251.4 "you must optimize a financial objective ... cannot just use a standard proxy classification metric"; 259.7 "accuracy or ROC"; 268.4 cake gag: "grade the cake purely on its height" / 274.9 "a 10 foot tower of raw, inedible flour" (cartoon tower of flour); 282.5 "a naive per-trade Sharpe ratio ... crown this ... sub 5% exposure lottery strategy" (bullet with 56% of 600 seeds); 292.3 "genius on your in sample data" (Sharpe 21) / 297.2 "completely collapses out of sample" (0.13); 303.2 "wire this specific financial metric into the AutoML score from the very first step".

## Slide 3: H2 Automated Feature Engineering / H3 tsfresh. 309.6 to 474.3 (164.7 s)

**Content**
- "H2 — Automated Feature Engineering"; "H3 — tsfresh: From One Price Series to 800+ Features".
- "Explosion Diagram": box "BTC 1h OHLCV (rolling 24-bar window)" -> arrow -> cyan 3D box "63 Characterization Methods" with cyan list "Statistical moments, Autocorrelation, Fourier coefficients, Complexity measures, Nonlinear features" -> a cyan fan of ~45 lines exploding into a tall column of dots, with a curly brace "~794 distinct features" -> arrow -> box "Target: 4-hour forward-return".
- Red warning box (thick red left bar): red mono `select_features(..., fdr_level=0.05)` + "Benjamini-Yekutieli False Discovery Rate (FDR) is controlled at 0.05 across the ~794 tests." Bold red line: "CRITICAL WARNING: FDR control here is separate from the model-search multiplicity. Both must be paid."

Article check: 63 methods, ~794 features, 24-bar window on btc_1h, 4-bar (4-hour) forward return, `fdr_level=0.05`, Benjamini-Yekutieli all match. Article also lists "Change quantiles and range counts" as a sixth family.

**Sub-scenes and beats**
- 3a Explosion (309.6 to 395.0): 313.5 "automated feature engineering"; 316.6 "raw price data like open, high, low, close is the exact same for everyone ... the way you engineer features ... is where the actual alpha lives"; 325.3 "a tool called tsfresh"; 333.0 "instead of a human saying, let's look at a 50 day moving average"; 340.8 "63 distinct characterization methods" (box fills); 346.8 "approximately 794 features" (fan explodes, counter rolls to ~794); 351.1 "794 features from a single line of price data?"; 365.0 "rolling 24 bar Bitcoin one hour data series" (input box); 372.9 "predict a four hour forward return target" (target box); 384.4 "aren't most of them going to be pure random noise?" (most dots flicker grey); 391.6 "how do we stop the model from hallucinating an edge?"
- 3b FDR (395.0 to 474.3): 397.7 "Benjamini-Yekutieli false discovery rate, or FDR" / 408.4 "at a 0.05 level" (code chip types in); 416.1 analogy "test 794 different medications to see if they cure a cold" (rows of pill bottles); 421.2 "a few of them will look like they work" (a few glow); 429.3 "adjusts your threshold for success ... ran 794 tests simultaneously" (threshold bar rises); 437.4 "no more than 5% ... false positives" (see error 9); 452.6 "crucial caveat"; 456.4 "does not cover the model search that happens later"; 464.8 "two completely separate multiplicities ... two separate mathematical debts and both have to be paid" (two debt invoices; CRITICAL WARNING line).

## Slide 4: H3 Featuretools: Deep Feature Synthesis. 474.3 to 579.8 (105.5 s)

**Content**
- "H3 — Featuretools: Deep Feature Synthesis". Left label "Relational Stacking Diagram".
- Three small table icons stacked on the left: "candles", "orderbook", "funding" (each a header + 3x4 grid). ~15 lines run from them into a cyan double-framed box labelled above "max_depth=2", titled "Deep Feature Synthesis (DFS)", containing stacked primitive cards "mean" + "cum_mean" and "diff" + "trend".
- Arrows out to a table "Relational Multi-Table Features" (placeholder cells feature_1, cum_mean1, feature_2, feature_n, feature_nn, ...). Redraw with plausible names, e.g. `MEAN(orderbook.spread)`, `STD(funding.rate)`, `TREND(candles.close)`, `DIFF(MEAN(orderbook.depth))`.
- Amber "System Alert" box: amber chip `time_index="timestamp"` + "The load-bearing parameter. This declaration locks aggregations point-in-time." / "⚠ Omitting or misconfiguring this causes DFS to silently build features out of future data, creating fatal future-leakage."

Article check: matches (tables candles/orderbook/funding, `max_depth=2`, time_index load-bearing). Article primitives: agg mean, std, max, min, skew, trend; trans percentile, diff, cum_mean.

**Beats**
- 474.3 "tsfresh is handling a single time series"; 479.3 "order books, ... funding rates, on-chain metrics ... all interacting at once" (tables appear)
- 487.5 "Featuretools"; 491.6 "relational deep feature synthesis or DFS"; 497.7 "automatically composes primitive operations across multiple related tables" (lines flow into DFS, primitive cards stack)
- 503.2 "max depth equals two"; 508.7 "if deeper is smarter, why cap it at two?"; 512.7 "combinatorics explosion"; 516.8 "rolling mean of the standard deviation of the percentile change ..." (show depth 3+ nesting blow up), 524.6 "explodes into the millions" (counter spins out of frame); 531.2 "max depth equals two keeps the search space vast, but computationally tractable" (lid clamps at depth 2)
- 538.6 "how does the machine know what data was actually available to you at a specific millisecond in the past?"; 546.3 "a load bearing parameter"; 548.6 "time index" (amber chip); 554.2 "strictly point in time"; 556.6 "DFS will happily build features out of future data" / 561.0 "peek ahead to tomorrow's prices to predict today's trade" (a feature reaches across a "NOW" line to the future); 565.2 "devastating look ahead bias" / 569.7 "entirely fictional"

## Slide 5: H2 Budget-Aware AutoML: FLAML. 579.8 to 722.9 (143.1 s)

**Content**
- "H2 — Budget-Aware AutoML: FLAML". Vertical divider.
- Left "Traditional Search Grid (Optuna/TPE)": 19x16 dot grid (see error 2). Caption "Focuses on which sampler to use based on eval-cost crossover."
- Right "Cost-Frugal Optimization (FLAML)": "Compute Budget: 300 seconds", a horizontal bar ~80% filled amber, caption "Resource Allocation Gauge". Below: amber box "Evaluate fast models first (LightGBM)" -> arrow -> amber box "Escalate to expensive models only when marginal gain justifies time spend (CatBoost)".
- Bottom config panel (mono): "time_budget: 300" / "split_type: time (with 5 folds)" / "metric: Custom sqrt(252) Sharpe scorer". Overlapping red box: "CRITICAL WARNING: `get_output_from_log` retrieves the configuration log. Log length = exact trial count needed for statistical deflation."

Article check: matches the article code (time_budget 300, split_type time, n_splits 5, sqrt(252) Sharpe scorer, estimators lgbm/xgboost/rf/extra_tree/catboost, log file `flaml_trading.log`). Article extra (optional on screen): Sobol ~2,830 cfg/s vs TPE ~154 cfg/s when backtests are nearly free.

**Sub-scenes and beats**
- 5a Where vs what can I afford (579.8 to 649.1): 581.3 "my laptop is going to literally melt" (cartoon laptop melting); 588.1 "budget aware AutoML and a tool from Microsoft called FLAML"; 597.9 "Optuna or tree structured Parzen estimators ... TPE"; 604.6 "Think of TPE like a detective ... guess where a criminal is hiding based on past clues" / 611.8 "where should I sample next?" (detective with magnifier over the sampling panel); 616.4 "FLAML asks ... What can I afford to sample?" (wallet/budget gauge); 622.0 "cost frugal budgeting"; 628.3 "a strict 300 second budget" (gauge "300 s"); 632.3 "a time split with five folds to prevent future leakage" (5 time folds); 635.6 "custom square root 252 Sharpe score" (config panel lines type in).
- 5b Spending the budget and the log (649.1 to 722.9): 649.1 "prioritizes cheap to evaluate models early" (many quick LightGBM ticks drain the gauge slowly); 655.4 "only spend its precious compute budget on expensive complex models when ... the marginal gain justifies the time" (one big CatBoost block); 668.1 "keeps a configuration log of this entire trajectory"; 679.9 "That log contains your exact trial count"; 684.5 lottery analogy: "buy one ticket and you win the jackpot, you look like a genius" / 691.3 "buy 10 million tickets and win once ... you just exhausted the probability space" (ticket pile); 699.1 "deflation ... subtract the cost of those 10 million tickets from your final winnings"; 704.8 "the FLAML configuration log is ... your receipt" (log scroll becomes a receipt; red warning box); 712.9 "exact trial count ... to execute your statistical deflation later" / 718.1 "cannot accurately price the search you just ran".

## Slide 6: H2 Neural Architecture Search for Trading Models. 722.9 to 864.2 (141.3 s)

**Content**
- "H2 — Neural Architecture Search for Trading Models"; "H3 — NAS Search Space for Trading".
- "Neural Topology Search Tree": cyan "InputChoice" box branches to four cyan boxes "LayerChoice: LSTM", "LayerChoice: GRU", "LayerChoice: Transformer", "LayerChoice: Linear", all converging into small boxes "Pooling", "Nozmalization" x2 -> "Output Dense" -> grey "Final Architecture" (fix per error 3).
- Right box "Search Space:" bullets "Cell types: {LSTM, GRU, Transformer, Linear}" (add Temporal Conv), "Layers: [1, 8]", "Lookback window: {20, 60, 120, 252}".
- Bottom left amber box "Evaluation Cost Context": "NAS sits at the extreme expensive end of eval-cost, where sample-efficient samplers are mandatory."
- Bottom right box "Skepticism / Caveat" (red header): "The third-party **EXAMM performance claim** (outperforming DJI/S&P 500 via evolved RNNs) is an **unreplicated best-of-search figure with no deflation reported**." (red bold)

Article check: EXAMM = Evolutionary eXploration of Augmenting Memory Models; bear 2022 and bull 2023 markets; simple long-short strategies; arXiv 2410.17212. Full article search space also has hidden dims {32, 64, 128, 256}, attention heads {2, 4, 8}, dropout [0.0, 0.5], skip {True, False}, norm {BatchNorm, LayerNorm, None}, activation {ReLU, GELU, SiLU, Mish}.

**Sub-scenes and beats**
- 6a NAS and EXAMM (722.9 to 796.7): 722.9 "FLAML helps you pick the right model type on a budget"; 729.1 "invent the internal wiring of the model itself"; 733.1 "neural architecture search or NAS"; 741.8 "Instead of just tuning the dials, the hyperparameters of a fixed model" (dials on a fixed box) / 746.8 "NAS automates the design of the network topology itself" (box rewires); 750.8 "a pretty wild third-party claim"; 754.6 "RNNs evolved via EXAMM ... outperformed the Dow Jones and the S&P 500 in both the 2022 and 2023 markets" (claim card with bear/bull icons); 769.6 "a massive point of caution"; 775.3 "unreplicated, best-of-search figure from a third-party paper" (card gets "UNREPLICATED" stamp); 785.6 "no reported statistical deflation" / 789.4 "an illustration ... not a guaranteed robust edge".
- 6b Search space and cost (796.7 to 864.2): 801.2 "Microsoft's NNI, Neural Network Intelligence"; 807.0 "define a NAS search space"; 810.1 "searches over different cell types" / 812.8 "building blocks of the AI's memory"; 819.7 "LSTM ..., GRU, temporal convolution layers, transformer blocks" (cell boxes pop in order); 830.3 "number of layers, typically from one to eight" (layer slider 1..8); 834.9 "different look-back windows" / 839.7 "20 periods. 60. 120." (window chips; 252 appears too); 842.8 "unbelievable computing power"; 849.1 "NAS lives at the extreme, expensive end of the evaluation cost axis" (cost axis, NAS marker far right; amber box); 857.0 "finish the search before the market regime completely changes".

## Slide 7: H2 The WorldQuant Alpha Factory / H3 Philosophy and Its Correction. 864.2 to 988.9 (124.7 s)

**Content**
- "H2 — The WorldQuant Alpha Factory Approach"; "H3 — Philosophy: Exponential Alpha Generation, and Its Correction".
- Big LaTeX formula: `IR ≈ IC · √BR`. Arrow from BR to a box: "**The Illusion:** Misconceiving BR (Breadth) as the generated trial count. **The Reality:** BR counts independent bets."
- Teal-filled panel with amber-bordered tab "The Correction": big formula `N_eff = N / C_f`. "**Example:** Crypto correlation factor C_f ≈ 3" / "**Result:** 10 correlated signals ≈ 3.3 independent bets". Amber box: "**Takeaway:** Breadth comes from decorrelation. 1,000,000 correlated alphas do not compound." (fix typos, error 4)

Article check: formula and C_f ≈ 3 -> 10 signals ≈ 3.3 match. Article adds: WorldQuant (Igor Tulchinsky) set a 1,000,000-alpha target in 2010 and hit it in 2016.

**Sub-scenes and beats**
- 7a Fundamental law (864.2 to 925.5): 869.1 "scale this up to an industrial level" / 872.1 "The Alpha Factory" (factory building with conveyor of alphas); 874.7 "pioneered by WorldQuant, which historically generated millions of predictive signals"; 881.3 "fundamental law of active management"; 889.1 "IR approximately IC times the square root of BR" (formula writes term by term); 896.1 "information ratio, ... risk-adjusted return"; 900.7 "information coefficient or predictive skill"; 904.8 "times the square root of your breadth"; 910.0 "my automated Alpha Factory generates 2 million alphas, my breadth is 2 million" (BR balloon inflates to 2,000,000); 921.1 "practically infinite?"
- 7b Correction (925.5 to 988.9): 925.5 "a fatal misunderstanding"; 930.5 "BR is not your generated trial count" / 933.7 "BR is the number of independent bets" (Illusion/Reality box; balloon pops); 938.4 "built from the exact same mathematical operators applied to the exact same raw price data ... highly correlated"; 954.4 "a crucial correction"; 956.7 "N_eff = N / C_f" (correction panel); 964.3 "N is your total signals and C_f is the correlation factor"; 968.4 "crypto correlation factor where C_f approximates 3, 10 generated signals are actually only worth about 3.3 independent bets" (10 dots merge into 3.3); 978.2 "does not scale ... just because your computer generated a million slight variations of the same idea" (takeaway box).

## Slide 8: H3 The 101 Formulaic Alphas / H3 LLM-Enhanced Alpha Discovery. 988.9 to 1048.9 (60.0 s)

**Content**
- Header "H3 — The 101 Formulaic Alphas / H3 — LLM-Enhanced Alpha Discovery".
- "Grammar Synthesis" bracket over two stacked card columns: "Operators" (cyan-bordered cells: rank, delta, ts_rank, stddev, correlation) and "Fields" (close, volume, vwap, returns, adv20). Dense crossing arrows from every operator to every field. Bracket below points to a box: "Example: Alpha#42: (rank(vwap - close) / rank(vwap + close))".
- Amber-bordered box "LLM Role in the Alpha Factory": "LLMs are not used for text-signal extraction here. They are utilized to write the formula/hypothesis—translating cross-domain papers into testable mathematical expressions."

Article check: operators/fields match the article (article also has signedpower). Paper: "101 Formulaic Alphas", Kakushadze, arXiv 1601.00991 (2016). Article also gives Alpha#1 and Alpha#7 (optional).

**Beats**
- 988.9 "what exactly is the machine generating"; 992.6 "a famous 2016 paper called 101 Formulaic Alphas"
- 1001.7 "treats alphas like a composable grammar" / 1005.1 "like language"; 1007.2 "rank, delta, and standard deviation ... applied to data fields" (operator cards, field cards, arrows draw); 1015.7 "a machine can perfectly enumerate and test all possible combinations" (combinatorial arrows flash); Alpha#42 assembles from rank, vwap, close
- 1022.4 "large language models ... thrown into this mix"; 1025.9 "aren't just reading news articles to gauge whether the market feels happy or sad" (news-sentiment icon crossed out); 1032.0 "LLMs are used to write the mathematical formulas themselves"; 1038.2 "translate complex academic papers into this testable hypothesis grammar"; 1043.5 "new operator combinations that a simple brute force search might miss" (LLM box)

## Slide 9: H3 Building Your Own Mini Alpha Factory. 1048.9 to 1111.6 (62.7 s)

**Content**
- "H3 — Building Your Own Mini Alpha Factory".
- Left: column of "6 templates" boxes x7 and "5 windows" boxes x6 with crossing arrows (error 5; redraw as 6 named templates x windows 5, 10, 20, 60, 120) -> funnel "30-Trial Sweep", caption "Calculates IC, turnover, and Sharpe" -> arrow -> dark terminal panel: red "SCHEMATIC", "(illustrative format only, not a measurement)", body "Real-data IC/DSR/PBO results are TODO."
- Red warning box: "⚠ CRUCIAL WARNING: A raw Sharpe from a 30-configuration sweep is not a result—it is merely the maximum of 30 draws."

Article check: matches. Article extra: on 1,000 zero-edge strategies the best annualized Sharpe averages 1.63 and the naive test declares a discovery 100% of the time; the honest deliverable is how many alphas survive deflation.

**Beats**
- 1048.9 "a Python script so you can build your own mini alpha factory"; 1053.6 "six templates over five time windows, resulting in a 30 trial sweep" (6x5 grid fills, 30 cells into the funnel)
- 1063.9 "if I run this script ... and the top result spits out a massive Sharpe ratio, have I struck gold?" (gold nugget); 1073.8 "Emphatically no" (nugget turns to straw)
- 1080.3 "explicitly schematic" (red SCHEMATIC header); 1085.2 "IC, the deflated Sharpe ratio, and the probability of backtest overfitting ... marked as TODO"
- 1095.7 "picking the top result from 30 trials without adjusting ... is just an illusion of the best draw"; 1102.9 "not a demonstrated edge. It is simply the maximum of 30 random draws" (30 dice rolled, highest one highlighted; warning box)

## Slide 10: H2 Guardrails: What You Already Owe. 1111.6 to 1258.1 (146.5 s)

**Content**
- "H2 — Guardrails: What You Already Owe". Centered "5-Pillar Constraint Layout".
- Five tall cards, each with a pink header block "⚠ WAR[NING]" (error 6) with an amber (pillar 3: red) left stripe, a bold title, body text, and a scrollbar-like stripe on the right (amber; pillar 3 red):
  1. "1. Price the Search": "Use the Deflated Sharpe Ratio (DSR) to strictly track the trial count bar."
  2. "2. Validate Temporally": "Enforce Purging and Embargo to prevent data leakage."
  3. "3. Score the Procedure": "Measure Probability of Backtest Overfitting (PBO). Critical note: PBO's null is 0.5 (a coin flip), not 1."
  4. "4. Watch for Illusions": "Use plateau analysis on noise-dominated search surfaces."
  5. "5. Constrain the Space": "Enforce hard caps on depth, features, and turnover to regularize before deflating."

Article check: matches the five article guardrails (article title for 4: "Watch for peaks that are not there"; 5 also lists minimum leaf samples, estimator counts, a turnover penalty).

**Sub-scenes and beats**
- 10a Debt wall, pillars 1 and 2 (1111.6 to 1200.9): 1111.6 "the most sobering part ... the guardrails, what you already owe"; 1118.0 "a mini factory of 30 trials"; 1124.1 "AutoML runs tens of thousands of trials" / 1127.9 "an absolute wall of statistical debt" (trial counter from slide 1 slams to tens of thousands, debt wall); 1132.1 "five mandatory guardrails" (five empty pillars); 1137.1 pillar 1 "price the search" / 1140.2 "deflated Sharpe ratio or DSR" / 1143.8 "your massive trial count has moved the statistical goalposts" (goalposts slide back); 1157.8 pillar 2 "validate temporally"; 1163.7 "purging and embargo"; 1175.0 "in finance, data leaks backward"; 1178.2 "train your model on Wednesday's volatility, it might subtly contain ripples from Tuesday's price action"; 1185.4 "Purging actively removes those overlapping data points" (overlapping bars deleted at the train/test seam); 1188.9 "An embargo ... a deliberate dead zone of time" (hatched gap between train and test).
- 10b Pillars 3 to 5 (1200.9 to 1258.1): 1200.9 pillar 3 "score the procedure"; 1204.2 "probability of backtest overfitting, or PBO"; 1210.5 "the PBO null hypothesis is 0.5" / 1215.2 "a literal coin flip" (coin flips) / 1219.0 "It's not 1.0"; 1221.0 "A 0.5 doesn't mean it's half-overfit. It means its success is entirely up to chance"; 1227.4 pillar 4 "watch for plateaus"; 1230.2 "a surface that is fundamentally dominated by noise ... a faster AutoML algorithm just means you find sharper illusions faster" (spiky noise surface, a fast searcher finds a sharp spike); 1243.0 pillar 5 "constrain the search upfront"; 1246.0 "feature budgets and capped network depths before you even hit run"; 1250.9 "cheaper to constrain the search space than to try and mathematically deflate an infinite search space later".

## Slide 11: H2 Conclusion. 1258.1 to 1393.24 (135.1 s)

**Content**
- "H2 — Conclusion". Vertical divider.
- Left "Architectural Value": cyan-dot timeline: "tsfresh / Featuretools for feature generation", "FLAML for budget optimization", "Operator grammar for enumerable alpha construction".
- Right "The Final Reality Check": dark terminal box with red border: red "Empirical Results" "(based on tens of thousands of backtests across five majors):" / "- DSR = **0.00** at **~37,000** trials." / "- PBO = **0.264** and **0.327**." / "- Outcome: **No robust edge demonstrated**." (numbers red)
- Footer: "AutoML raises the trial count exponentially. Whatever it finds owes a proportionally massive deflation. The useful output of an alpha factory is solely its survival rate after that deflation." (use "by orders of magnitude", error 8)

Article check: DSR 0.00 at ~37,000 trials, PBO 0.264 and 0.327, five majors, "no robust edge": match the article's Honest Negative reference.

**Sub-scenes and beats**
- 11a Value vs reality (1258.1 to 1351.8): 1258.1 "tsfresh and Featuretools are genuinely incredible for generating features" (left 1); 1267.5 "FLAML is excellent for budget-aware searches" (left 2) / "formulaic alphas offer a really powerful grammar-based approach" (left 3); 1278.4 "the hard truth remains"; 1280.9 "WorldQuant's breadth argument only mathematically functions if the signals are truly uncorrelated"; 1289.6 "Generating millions of alphas is computationally easy. Proving they are independent bets is the deeply difficult part"; 1296.2 "a brutally honest negative conclusion"; 1313.3 "tens of thousands of backtests across five major assets" (terminal box opens); 1318.1 "a deflated Sharpe ratio of 0.00 at approximately 37,000 trials" (big 0.00); 1325.0 "A DSR of absolute zero?"; 1332.2 "PBOs of 0.264 and 0.327"; 1337.3 "no robust edge" (red outcome line); 1340.6 "AutoML raises trial counts ..." / 1343.2 "owes a correspondingly massive statistical deflation" (footer).
- 11b Outro (1351.8 to 1393.24): 1354.3 "If an automated factory can essentially enumerate every possible mathematical trading formula"; 1360.9 "the true advantage ... shifted away from finding the formula"; 1367.4 "the most ruthless skeptical infrastructure to discard the fake ones" (callback: robot from 1a now sorting straw from needles, discarding almost everything); 1376.3 "The edge is no longer in generation. The edge is in rigorous mathematical skepticism" (title card line); 1383.5 "review the source article, AutoML for Systematic Trading Pipelines" (article card); 1391.5 "Thanks for joining us" (end card).

---

## Timing notes

`sync_slides.py` (default params) degenerated ("showed 9/11 slides, longest held 76%") and fell back to an even 126.7 s split. Wrong for most slides (e.g. slide 2 auto 127 s vs real 112.1 s, slide 3 auto 253 s vs 309.6 s, slide 8 auto 886 s vs 988.9 s, slide 9 auto 1013 s vs 1048.9 s).

`slide_starts.json` is set by hand from topic changes in the transcript (hosts do not read headings aloud in this episode; the deck order matches the article 1:1):

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | intro | high |
| 2 What AutoML Automates | 112.1 | "OK, let's unpack this ... What exactly is being automated here?" | high |
| 3 tsfresh | 309.6 | "assuming we avoid the objective function trap, let's talk about the data itself. Automated feature engineering" | high |
| 4 Featuretools | 474.3 | "So tsfresh is handling a single time series ... order books, funding rates, on-chain metrics" | high |
| 5 FLAML | 579.8 | "my laptop is going to literally melt ... How do you even afford this search?" (571.9 is the Featuretools wrap-up sentence) | medium |
| 6 NAS | 722.9 | "So FLAML helps you pick the right model type on a budget. But what if you want the AI to go even further?" | high |
| 7 WorldQuant / breadth | 864.2 | "Now, let's scale this up to an industrial level. The Alpha Factory" | high |
| 8 101 Formulaic Alphas / LLM | 988.9 | "So what exactly is the machine generating in these factories?" | high |
| 9 Mini Alpha Factory | 1048.9 | "the article actually provides a Python script so you can build your own mini alpha factory" | high |
| 10 Guardrails | 1111.6 | "brings us perfectly to the most sobering part of the article, the guardrails" | high |
| 11 Conclusion | 1258.1 | "So looking at the whole picture, the honest summary here" | high |

Long slides split into sub-scenes: 1, 2, 3, 5, 6, 7, 10, 11 (2 parts each).
