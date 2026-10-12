# causal-forests-treatment-effects-trading (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
15-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/causal-forests-treatment-effects-trading.en.md`.

- Audio: `input/notebooklm-sources/causal-forests-treatment-effects-trading/en/audio.m4a`, 778.77 s (12:58.8), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has a `words[]` array with per-word start/end; use it for frame-exact beats). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: warm off-white paper with a faint square grid, charcoal ink (#2B3038-ish) for lines, text and dark table headers (slate #5A6672 header bars on slide 2), teal/cyan accent (#2BB3C8-ish) for "treated / observed / W = 1 / the good estimate", amber/mustard accent (#E0A030-ish) for "control / counterfactual / 0 / caveat", deep red for crossed-out things (slide 14 only). Titles mix a grotesk sans and a serif; code and some bullet lists in monospace. The hosts' "H2 / H3" heading levels are printed on the slides themselves ("H2 — ...", "H3 — ..."). Small "Gemini Notebook" watermark bottom right on every slide (do not redraw).

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "MEW sub X" (50.8) = mu(x), "tau sub X" = tau(x), "Ate" = ATE, "Cate" = CATE, "complex force" (163.8) = causal forest, "Force is a straight line" (183.1) = "Forcing a straight line", "I-split sample / I-E-S-T sample" (252.7) = I_split / I_est, "nimen orthogonality" (362.0) = Neyman orthogonality, "CAT relative to the interval width" (425.2) = CATE, "econ ML" (439.4) = EconML, "Rosenbaum gamma" fine, "SUTFA" (562.5, 577.8, 583.4) = SUTVA, "0-25 BIPs" (600.6) = 0-to-25 bps, "R score" = R-score / RScorer, "angered walk forward" (655.0) = anchored walk-forward, "deflated sharp ratio" (674.0) = Deflated Sharpe Ratio, "back test" = backtest, "Susan Athe" (744.2) = Susan Athey, "Chernozukov" = Chernozhukov.

---

## Slide 1: Title. 0.0 to 108.6 (108.6 s)

**Content**
- Left, large serif title (4 lines, charcoal): "Causal Forests for / Heterogeneous / Treatment Effects / in Trading".
- Subtitle (grey sans): "Estimating τ(x) over μ(x): Honest splitting, adaptive kernels, and calibration tests for real signal heterogeneity." (τ(x) and μ(x) in bold math).
- Mono byline table (two rows, thin rules): "Author: | suenot", "Date: | 2026-08-01".
- Right, technical diagram: a left-to-right binary tree. "Start Node: N, p=..." with caption "Honest Partition I₁" on the far left; it branches into 2 level-1 nodes ("Node 2: N₂, p=..." with captions "Honest Partition I₁, I₂" and "Adaptive Kernel K(x, xᵢ)"), each branches into 2 more, then into ~8 leaf boxes ("Node 1.2", "Node 2.1", ...) with small captions like "Heterogeneity: τ(x) = μ̂(x, 1) − μ̂(x, 0)", "Local Centering", "Kernel Weights W(x)", "Calibration: H₀: τ(x) = τ₀". Top label "Node Splitting Criteria: MSE(Yᵢ, Ȳ_leaf)" (see NotebookLM errors: wrong). Bottom label "Forest Aggregation" with "(1/B) Σ τ_b(x)". All leaf arrows converge into one dark filled rectangle (right of center). From it: a solid teal arrow up-right to a teal box "Observed Reality Yᵢ(1) / Observed Outcome μ(x, 1) / Actual Treatment Data", and a dashed amber arrow down-right to an amber box "Unobserved Counterfactual Yᵢ(0) / Counterfactual Outcome μ(x, 0) / Control/Untreated Estimate". The node labels are garbled AI text; redraw a clean, smaller tree (3 levels), keep the observed (teal, solid) vs counterfactual (amber, dashed) fork.

Article check: title, author, date 2026-08-01 match frontmatter.

### 1a. Cold open: the X-ray. 0.0 to 24.5
- 0.0 "If you break your arm, then X-ray gives you a simple binary answer" / 3.4 "It's broken" / 4.1 "The white line is right there" (gag: clean X-ray with a white crack line)
- 7.1 "when you try to diagnose what a massive trading event actually did to a specific crypto asset" / 13.7 "the X-ray machine is completely useless" (X-ray screen fills with noisy price chart)
- 15.6 "murky, chaotic mess" / 19.2 "noise on top of noise"
- 20.7 "the math that, you know, fixes the X-ray machine" (screen snaps into focus)

### 1b. Title reveal and mu(x) vs tau(x). 24.5 to 70.1
- 24.5 "Welcome back to another deep dive"
- 32.5 title read aloud: "Causal Forests for Heterogeneous Treatment Effects and Trading" (title types in; byline)
- 42.1 "almost every predictive model you encounter in finance is just trying to guess a future outcome"; 48.7 "Predicting the conditional mean" / 50.8 "mu sub x" (μ(x) appears)
- 54.3 "hunting a completely different beast"; 59.0 "isolate a conditional average treatment effect or tau sub x" (τ(x) replaces μ(x), subtitle)
- 65.8 "the real difference between predicting a return and estimating an effect?"

### 1c. Two universes: the counterfactual. 70.1 to 108.6
- 70.1 "reality versus a counterfactual"
- 73.7 "what will the price be tomorrow?" (plain prediction)
- 80.0 "the difference between two potential outcomes for the exact same unit"; 87.4 "Like parallel universes"
- 90.5 "Universe A, a specific event happened" (teal solid arrow to "Observed Reality Yᵢ(1)")
- 93.2 "Universe B, the counterfactual, where it didn't" (amber dashed arrow to "Unobserved Counterfactual Yᵢ(0)")
- 96.2 "The difference is your treatment effect" (τ = Y(1) − Y(0))
- 98.6 "we only ever get to live in one of those universes"; 101.3 "we never see the counterfactual" (amber box fades to ghost)
- 103.9 "that missing counterfactual is the entire problem"; 107.0 "You have to infer it"

## Slide 2: H2 From Average to Heterogeneous Effects. 108.6 to 194.1 (85.5 s)

**Content**
- Title "H2 — From Average to Heterogeneous Effects".
- Top row: three cards, each with a slate header bar, an "Estimand:" row and a description row:
  1. "Standard ML": `μ(x) = E[Y | X = x]`; "Every backtest estimates a conditional mean."
  2. "H3 — The Average Treatment Effect": `τ_ATE = E[Yᵢ(1) − Yᵢ(0)]` (the "1" teal, the "0" amber); "Useless for trading. If an event pushes half the universe up and half down, ATE is zero but opportunity is maximal."
  3. "H3 — The Conditional Average Treatment Effect": `τ(x) = E[Yᵢ(1) − Yᵢ(0) | Xᵢ = x]` (1 teal, 0 amber); "The expected return impact of this event on this asset relative to the missing counterfactual."
- Bottom: wide table. Left cell header "H3 — Why Not Just Use Linear Interaction Models?", body formula `Yᵢ = α + βWᵢ + γWᵢ·Xᵢ + δXᵢ + εᵢ`. Two more columns "Linear Assumption" / "Trading Reality", three rows:
  - Linear / Convex (e.g., funding flip sensitivity to leverage)
  - Additive / Multiplicative (e.g., depth interacts with market cap)
  - Static / Gated (e.g., volatility regime gates everything else)
- Footer row: "Conclusion: Causal forests adaptively partition without imposing shape constraints."

Article check: all three estimands, the saturated regression, and the convex / multiplicative / gated examples match sections "From Average to Heterogeneous Effects" and "Why Not Just Use Linear Interaction Models?". The "Linear / Additive / Static" left column is the deck's own framing (the article only says the interaction is assumed linear); harmless.

**Beats**
- 108.6 "Which moves us from looking at average effects to heterogeneous effects" (slide in, Standard ML card already known from 1b)
- 113.7 "start at the bottom with the average treatment effect, the ATE"; 120.4 "a binary treatment like a trading event firing ... across all units, what was the average impact?" (ATE card)
- 133.7 "if an event pushes half the crypto universe up and half down, the average is zero" (gag: half the coins go up, half go down, average bar flat at 0)
- 142.3 "You don't trade the average"
- 145.3 "the conditional average treatment effect, the CATE"; 149.6 "We condition on specific characteristics"; 152.2 "a coin with a specific market cap, volatility, and book depth" (CATE card)
- 157.1 "expected return impact of this specific event on this specific asset"
- 163.8 "why do we need a causal forest for this? ... saturated regression ... linear interaction models?" (formula types in)
- 170.9 "relationships in markets are rarely linear"; 174.2 "a coin's sensitivity to a funding flip"; 178.2 "It's convex in leverage, not linear" (row 1)
- 183.1 "Forcing a straight line on a messy reality" (straight line over a curved scatter)
- 186.6 "Causal forests partition the covariate space adaptively"; 190.0 "let the heterogeneity structure organically fall out of the data" (conclusion footer)

## Slide 3: H2 Causal Forests: The Algorithm / H3 Causal Trees. 194.1 to 237.9 (43.8 s)

**Content**
- Title "H2 — Causal Forests: The Algorithm"; subtitle "H3 — Causal Trees".
- Center formula: `Δ(split) = n_L · τ̂_L² + n_R · τ̂_R² − n · τ̂²_parent`.
- Teal callout box (left): "Sample sizes in the left child, right child, and parent." with teal leader lines to n_L, n_R, n.
- Amber callout box (top right): "Node-level effect estimates: τ̂_node = Ȳ_treated − Ȳ_control" with amber leader lines to the three τ̂ terms.
- Grey callout box (right): "Between-group variance of treatment effects." with a grey leader line to the minus sign / whole expression.
- Small tree below: "Parent Node" with two arrows to "Left Child" and "Right Child".
- Bottom framed box: "**Core Mechanism:** A causal tree maximizes treatment-effect variance across children, rather than minimizing squared prediction error. A split is good when the two children disagree about the effect. Covariates that strongly predict Y but are orthogonal to treatment W are completely ignored."

Article check: formula, τ̂_node and the "never selected" claim match section "Causal Trees".

**Beats**
- 194.1 "moving into the algorithm itself, the causal forests, let's start with causal trees" (slide in)
- 199.3 "how does the causal tree actually work?"
- 203.0 "at each node, the algorithm isn't trying to minimize squared prediction error like a normal decision tree" (cross out "min MSE")
- 212.6 "the split score maximizes the variance of the estimated treatment effect across the children" (formula)
- 218.9 "it's actively looking for disagreements in how assets react?" (left child τ̂ small, right child τ̂ large, children "argue")
- 223.8 "If a covariate predicts the outcome perfectly but has nothing to do with how the treatment acts"; 231.7 "It will simply never be selected for a split" (that covariate greyed out)
- 234.4 "It only cares about effect heterogeneity"

## Slide 4: H3 Honest Estimation. 237.9 to 270.4 (32.5 s)

**Content**
- Title "H3 — Honest Estimation".
- Top box "Full Training Data", thick dark elbow arrows to two subsets:
  - Left grey box "Subset: I_split", arrow down to an empty 7-node binary tree (hollow circles). Label "1. Build the tree structure." Grey callout: "Chooses split variables and points. Evaluates structural splits only."
  - Right teal/amber split-colored box "Subset: I_est", teal and amber arrows down into the same tree shape, now filled with dots: blue/teal dots and amber dots dropping down the edges (teal edges on one side, amber on the other); the 4 leaves show small bell curves (teal, amber, teal, amber). Legend: blue dot "Observed/Treated", amber dot "Unobserved Counterfactual/Control" (see NotebookLM errors). Label "2. Estimate leaf effects." Teal/amber callout: "Drops into the frozen tree to calculate actual leaf values."
- Bottom framed box "Why Honesty Matters:":
  - "**Prevents Cheating**: Without honesty, extreme leaves capture noise in the training sample and report it as signal (similar to probability of backtest overfitting)."
  - "**Result**: Asymptotic unbiasedness E[τ̂(x) | Xᵢ = x] = τ(x) + o(1)"
  - "**Trade-off**: Sample efficiency drops by half. Data used to build structure cannot be used to fill it."

Article check: matches section "Honest Estimation" (I_split / I_est, frozen tree, PBO analogy, o(1) result, half the data).

**Beats**
- 237.9 "there's this concept of honest estimation" (slide in)
- 241.4 "like tasting the soup with the same spoon you use to stir it"; 245.0 "You need a fresh spoon" (gag: two spoons)
- 248.6 "You must use disjoint samples"; 250.9 "you literally split your data in half" (Full Training Data splits)
- 252.7 "one sample, the I_split sample, builds the tree structure" (left tree draws)
- 259.0 "a completely separate sample, the I_est sample, estimates the leaf effects" (dots drop into right tree, bell curves grow)
- 263.4 "keep it from cheating"; 265.6 "prevents the tree from carving out leaves based on pure noise in the training set"

## Slide 5: H3 From Trees to Forests / H3 Asymptotic Theory. 270.4 to 332.1 (61.7 s)

**Content**
- Two halves split by a vertical rule.
- Left title "H3 — From Trees to Forests". Formula `τ̂(x) = Σ_{i=1}^{n} αᵢ(x) · Yᵢ`. Illustration: a cluster of overlapping translucent triangles (trees) in charcoal, teal and amber with topographic contour lines over them (kernel density look). Bullets under it:
  - "A Causal Forest is a locally adaptive kernel estimator."
  - "- Aggregates B causal trees on subsample s < n."
  - "- Weights αᵢ(x) are driven by leaf co-occurrence frequency."
  - "- It learns its own definition of "similar" using only covariates that matter for effect heterogeneity, not hand-scaled Euclidean distance."
- Right title "H3 — Asymptotic Theory". Two-row table:
  - "Estimator is consistent:" | `τ̂(x) →ᵖ τ(x)`
  - "Asymptotically normal:" | `(τ̂(x) − τ(x)) / σ̂(x) →ᵈ N(0, 1)`
- Grey box "**Crucial Distinction**": "Asymptotic pointwise intervals are for the CATE, driven by the infinitesimal jackknife. These are strictly different from finite-sample marginal conformal intervals used for predicting outcomes. *Different estimand, different guarantees.*"

Article check: matches "From Trees to Forests" and "Asymptotic Theory" (Athey, Tibshirani and Wager 2019 GRF view; Wager and Athey 2018 consistency and normality; infinitesimal jackknife). The article also gives the explicit weight formula `αᵢ(x) = (1/B) Σ_b 1(Xᵢ ∈ L_b(x)) / |L_b(x)|`; optional for redraw.

**Beats**
- 270.4 "how do we go from trees to forests? Is it just averaging?" (slide in, many small trees)
- 276.2 "the generalized random forest view"; 281.6 "It acts as a locally adaptive kernel estimator" (contours appear)
- 284.7 "adaptive leaf co-occurrence weights"; 290.1 "what makes two observations similar based on how often they land in the same leaf across the forest" (two points light up together in leaf after leaf, weight counter rises)
- 297.6 "it learns its own definition of similarity"
- 300.4 "That brings us to the asymptotic theory" (right half)
- 306.6 "asymptotic, point-wise CATE intervals"; 312.8 "an interval around the effect itself" (interval bar around τ̂)
- 316.6 "a totally different estimate and guarantee from the finite sample marginal conformal outcome intervals" (Crucial Distinction box)
- 325.0 "conformal predicts the total outcome, not the isolated effect"; 329.8 "They are not interchangeable"

## Slide 6: H2 The Double Machine Learning Connection. 332.1 to 384.9 (52.8 s)

**Content**
- Title "H2 — The Double Machine Learning Connection".
- Column headers: "Inputs" (over the model boxes), "Residualization Engine", "Causal Engine".
- Top row: rounded box "Outcomes (Y, X)" -> thick box "Outcome Model m̂(X) = E[Y | X]" -> circle "−" -> box `Ỹ = Y − m̂` -> elbow arrow into the engine.
- Bottom row: rounded box "Treatments (W, X)" -> thick box "Propensity Model ê(X) = E[W | X]" -> circle "−" -> box `W̃ = W − ê` -> elbow arrow into the engine.
- Right: triple-framed box "Causal Forest Engine".
- Bullets: "Required when treatment is not randomly assigned." / "- Relies on cross-fitting to estimate m̂ and ê." / "- **Neyman Orthogonality**: Nuisance-estimation error enters only as a product." / "- m̂ and ê can converge slowly at n^(−1/4), but τ̃ still converges cleanly at n^(−1/2)." (should be τ̂, see errors)

Article check: matches section "The Double Machine Learning Connection".

**Beats**
- 332.1 "here's a massive real-world problem"; 334.7 "In markets, treatment isn't randomly assigned" (slide in, footer line first)
- 338.1 "A coin doesn't just randomly flip its funding rate"; 340.5 "highly conditional on market state"
- 344.9 "That's the double machine learning connection. DML"
- 348.6 "residualization"; 350.5 "cross-fitting"
- 353.0 "cross-fit an outcome model and a propensity model" (two model boxes), 357.0 "run the causal forest on the residuals" (minus circles, Ỹ, W̃, flow into engine)
- 359.4 "Just on the surprises"
- 362.0 "Neyman orthogonality"; 367.1 "The N to the negative one-fourth thing"
- 370.0 "nuisance models ... converge at a slower n^(−1/4) rate, while the actual treatment effect estimate still converges at the faster n^(−1/2) rate" (two speedometers / two runners)
- 381.5 "a huge mathematical safety net"

## Slide 7: H2 Trading Application: Event Impact Heterogeneity. 384.9 to 439.4 (54.5 s)

**Content**
- Title "H2 — Trading Application: Event Impact Heterogeneity".
- Timeline bar: dark charcoal segment "Pre-event Window" (caption mono "Fitting the market model."), a thin amber sliver, a vertical tick, a thin teal sliver, then teal segment "Outcome Window" (caption mono "Abnormal Cumulative Return (CAR) Yᵢ"). Under the tick: bold mono "Event Timestamp" / "Treatment Wᵢ Fired".
- Horizontal rule, then two mono columns:
  - "H3 — Setup": "**Units:** Coin-event observations." / "**Treatment Wᵢ:** Binary indicator (1 = funding-rate flip / listing / cascade, 0 = matched non-event)." / "**Outcome Yᵢ:** Abnormal CAR over event window. Pre-fitted on market model to strip out market-wide moves. (Raw returns are invalid here)." / "**Modifiers Xᵢ:** Market cap, realized vol, funding history, book depth." / "**Confounders Wᵢ:** Regime variables shifting probability and returns." (notation clash, see errors)
  - "H3 — The Trading Signal": "**Position Size:** Scaled by |τ̂| relative to interval width." / "**Edge Ratio:** e = |τ̂|/w" / "**Absolute No-Trade Filter:** Do not trade if the interval straddles zero." / "**Construction:** Market-neutral by balancing long and short legs."

Article check: matches "Setup" and "The Trading Signal"; the article adds a fifth modifier, open-interest-to-cap ratio, and calls the listing a "spot listing" and the cascade one "crossing the supercritical threshold".

**Beats**
- 384.9 "the trading application from the article, the event impact heterogeneity" (slide in)
- 390.0 "a perpetual futures coin universe"; 393.1 "the units are coin event observations"
- 395.9 "the treatment is just a binary event indicator" (event tick fires)
- 399.5 "the outcome isn't raw returns"; 403.0 "raw returns would just absorb the whole market moving" (whole market line rises; gag: false effect)
- 409.4 "The outcome is the abnormal cumulative return, or CAR"; 413.0 "Measured after a pre-event market model" (pre-event window fits a line, outcome window shows the abnormal gap)
- 415.2 "effect modifiers, the X variables, and confounders, the W variables" (Setup column)
- 422.4 "how does this actually become a trading signal?"; 425.2 "inverse width sizing based on the CATE relative to the interval width" (Signal column)
- 430.3 "if the interval is super wide, you shrink the position" (wide bar, small position; narrow bar, big position)
- 433.6 "only trade when the interval doesn't straddle zero" (interval crossing 0 turns grey, "no trade")

## Slide 8: H2 Python Implementation with EconML. 439.4 to 459.6 (20.2 s)

**Content**
- Serif title "H2 — Python Implementation with EconML".
- Code panel (light box, mono), exactly as on the slide:

```python
def fit_causal_forest(Y, T, X, W, n_estimators=1000):
    cf = CausalForestDML(
        model_y=GradientBoostingRegressor(...),
        model_t=GradientBoostingClassifier(...),
        criterion='het',   # heterogeneity-based splitting
        honest=True,       # honest estimation
        inference=True,    # infinitesimal-jackknife intervals
        cv=5,              # cross-fitting folds for DML
    )
    cf.fit(Y=Y, T=T, X=X, W=W)
    return cf
```
  (Numbers 1000 and 5, and `True`, in teal; comments in amber.)
- Annotations with thin leader lines: left bracket on model_y/model_t lines: "Double Machine Learning predictive inputs."; right, from `honest=True`: "Crucial for asymptotic unbiasedness."; from `cv=5`: "Orthogonal residualization folds."
- Italic footer: "Note: Presented as an illustrative workflow architecture, not a measured empirical result."

Article check: the slide is an abridged version of the article's code. The article's full call also has `GradientBoostingRegressor(n_estimators=200, max_depth=5, learning_rate=0.05)`, the same for the classifier, `n_estimators=n_estimators`, `min_samples_leaf=20`, `max_depth=None`, `random_state=42`, plus imports (`from econml.dml import CausalForestDML`). The slide drops `n_estimators=n_estimators`, so its `n_estimators=1000` argument is never used; when redrawing add that line back.

**Beats**
- 439.4 "the article provides Python implementation with EconML"; 442.6 "the CausalForestDML" (slide in, code types)
- 444.3 "I need to issue a massive caveat to you listening"
- 450.8 "This code and the 95% interval they show are strictly an illustrative workflow"; 455.6 "It is not a measured result" (footer note stamps in)
- 457.1 "just a tutorial, essentially"

## Slide 9: H3 Interpreting the CATE Surface. 459.6 to 505.3 (45.7 s)

**Content**
- Title "H3 — Interpreting the CATE Surface".
- Framed 2x2 layout:
  - Top left code chip: `summarize_cate(cf, X, feature_names)`.
  - Top right: amber warning triangle + "Feature Importance Shift": "**Heterogeneity importance ≠ outcome importance.** A covariate can perfectly predict asset returns but score absolute zero for **effect heterogeneity**. Causal forests rank variables purely by how much they drive the difference in effect."
  - Bottom left code chip: `plot_cate_by_feature(cf, X, feature_idx)`.
  - Bottom right: amber warning triangle + "Marginal Plot Traps": "Holding other covariates at the median for 1D marginal plots can force you into regions of covariate space with zero actual support. Read these purely as mathematical descriptions of the fitted surface, not as valid causal dose-response curves."

Article check: matches the `summarize_cate` comment and "Interpreting the CATE Surface". Article signature is `plot_cate_by_feature(cf, X, feature_idx, n_points=50)`.

**Beats**
- 459.6 "a massive trap in there regarding feature importance" (slide in, top row)
- 463.7 "normally feature importance tells you what drives the return"; 466.9 "in a causal forest, it ranks covariates by how much they drive effect heterogeneity" (two bar charts side by side: outcome importance vs heterogeneity importance, ranks reshuffle)
- 472.4 "Not outcome importance"
- 475.0 "A feature can completely drive baseline returns, but score absolute zero here" (tall bar on the left chart, zero bar on the right)
- 483.5 "interpreting the CATE surface has traps too" (bottom row)
- 487.7 "marginal effect plots"; 491.1 "Holding covariates at their median can place you in a region of covariate space with zero support" (point lands in an empty corner of a scatter)
- 496.4 "Like a Frankenstein asset that doesn't actually exist in the market" (gag: stitched-together coin)
- 500.9 "descriptions of a fitted surface, not causal dose response curves"

## Slide 10: H2 Key Assumptions and Diagnostics (1 and 2). 505.3 to 562.5 (57.2 s)

**Content**
- Serif title "H2 — Key Assumptions and Diagnostics"; subtitle "Violate these and you get confident, precise, wrong effects."
- Framed 2x3 table:
  - Row 1: "H3 — 1. Unconfoundedness (Selection on Observables)" | formula `Y(0), Y(1) ⊥ W | X, W` (0 amber, 1 teal, ⊥ and first W teal, last X, W bold) + "Risk: Fails instantly for market-reaction events driven by unobserved flows." | "**Diagnostic: Rosenbaum Γ sensitivity analysis.** How large must Γ shift treatment odds before the estimated effect flips? (A design breaking at Γ=1.1 is not a finding)."
  - Row 2: "H3 — 2. Overlap (Positivity)" | `0 < P(W = 1 | X = x) < 1  ∀x` (W = 1 teal) + "Every unit needs positive probability in both arms." | "**Diagnostic: Check propensity scores and trim.** Retain 0.05 < p < 0.95. Always report the retained fraction as trimming redefines the target population."

Article check: matches sections 1 and 2 (Γ = 1.1, 0.05 / 0.95 trimming, retention report).

**Beats**
- 505.3 "what does this all mean if our data is flawed?"; 508.0 "the key assumptions and diagnostics" (slide in)
- 510.5 "Number one, unconfoundedness"; 512.7 "selection on observables" (row 1)
- 515.3 "treatment assignment is independent of potential outcomes given the covariates"; 519.9 "no hidden variable driving both the event and the return" (hidden U figure behind a curtain with arrows to W and Y)
- 524.3 "Rosenbaum gamma sensitivity analysis"; 528.0 "how large an unobserved flow must be to flip the estimated effect sign" (Γ dial turns, effect sign flips at 1.1)
- 534.5 "If a tiny flow flips your alpha, you have a problem"
- 538.0 "Assumption two, overlap or positivity" (row 2); 542.3 "positive probability of appearing in both arms, treated and untreated" (two overlapping propensity histograms)
- 547.7 "propensity trimming"; 550.7 "chop off the extremes" (cut below 0.05 and above 0.95)
- 552.1 "report retention rates"; 556.0 "trimming literally redefines the population you're trading"; 560.1 "You aren't trading the whole market anymore"

## Slide 11: H3 3. SUTVA. 562.5 to 586.6 (24.1 s)

**Content**
- Serif title "H3 — 3. SUTVA (Stable Unit Treatment Value Assumption)".
- Left panel: a 2x2 grid of thin lines with 4 hollow teal-rimmed circles at the corners and one filled teal circle "Perp 1" in the center. Header "Contagion" above the top edge. Three thick dark arrows with teal cores radiate from Perp 1 to: top right "Correlated Pair", bottom left "Market Maker Inventory", bottom right "Shared Collateral". Top-left circle unlabeled.
- Right panel: formula `Yᵢ = Yᵢ(Wᵢ)` (Wᵢ teal). "**Definition:** No interference between units. One unit's treatment must not affect another's outcome."
- Bottom panel: "**The Crypto Reality:** This is the weakest assumption in the crypto universe. A liquidation cascade in one perpetual swap propagates directly through shared collateral pools into correlated pairs. This is interference by definition." / "**Mitigation:** Clustering standard errors by correlation group partially addresses the mathematical fallout, but nothing fully resolves the structural violation."

Article check: matches section 3 (shared collateral, market-maker inventory, correlated pairs, clustered SEs).

**Beats**
- 562.5 "Assumption three, SUTVA, the stable unit treatment value assumption" (slide in)
- 567.5 "no interference between units" (formula, definition)
- 571.1 "Wait, in crypto? Everything is correlated"; 573.7 "If someone gets liquidated, the whole market tanks"
- 577.8 "SUTVA is incredibly vulnerable here"; 580.0 "Crypto liquidation cascade propagates through shared collateral" (Perp 1 pulses, arrows fire to the three neighbors)
- 583.4 "it threatens SUTVA entirely"

## Slide 12: H2 Beyond Binary Treatments. 586.6 to 607.8 (21.2 s)

**Content**
- Serif title "H2 — Beyond Binary Treatments".
- Big formula: `Yᵢ = τ(Xᵢ) · Tᵢ + g(Xᵢ, Wᵢ) + εᵢ`.
- Teal arrow from top right to Tᵢ: "Magnitude of the shock (e.g., funding-rate change in basis points), not just occurrence." ("Magnitude of the shock" in teal).
- Teal elbow arrow up to τ: "The CATE becomes a per-basis-point effect." ("per-basis-point" in teal).
- Bottom two-column box:
  - "**Code Transition** (Regressor for Continuous)": `model_t=GradientBoostingRegressor  # Replaces Classifier` / `discrete_treatment=False`
  - "**Estimation Execution Code**": `cf_continuous.effect(X_test, T0=0, T1=25)` / "Result: Estimates the specific impact of a continuous 0-to-25 bps shift."

Article check: matches "Beyond Binary Treatments" (`effects_25bp = cf_continuous.effect(X_test, T0=0, T1=25)`).

**Beats**
- 586.6 "beyond binary treatments" (slide in); 589.7 "Does this only work for on-off events?"
- 592.2 "it extends to continuous treatments using the same DML machinery" (switch toggles into a slider)
- 596.2 "The effect, tau of x, becomes a per basis point effect" (τ arrow)
- 600.6 "the 0-to-25 bps example in the text for funding rate changes" (slider 0 to 25 bps, effect scales)
- 605.0 "You just measure the sensitivity to the magnitude"

## Slide 13: H2 Practical Considerations. 607.8 to 652.7 (44.9 s)

**Content**
- Serif title "H2 — Practical Considerations".
- Top framed panel "H3 — Is the Heterogeneity Real?": formula `Yᵢ − m̂ = α₀(Wᵢ − ê) + α₁(Wᵢ − ê)(τ̂ − τ̄) + εᵢ` (m̂, ê, τ̂, τ̄ in teal). Teal elbow arrow to α₀: "Average effect (Calibration null)." Teal elbow arrow to α₁: "Calibration slope. α₁=0 means no heterogeneity. α₁=1 is perfect calibration. If >0 but <1, trade the ranking, not the magnitudes." Footer line: "**EconML RScorer:** Compare candidate CATE models against a constant-effect baseline on a validation split."
- Bottom left "H3 — Sample Size": chart, y axis "Median Interval Width", x axis "Sample Size (N)", teal curve decaying like 1/sqrt(N), dashed amber horizontal line labelled "Intended Trade Effect Size" with an arrow; the curve crosses the dashed line at about 15% of the x range.
- Bottom right text: "CATE requires significantly more data than outcome models (both arms must populate every leaf)." / "Usable n is entirely empirical based on interval width dropping below trade thresholds."

Article check: matches "Is the Heterogeneity Real?" (BLP, Chernozhukov et al. 2018) and "Sample Size". The chart is illustrative, no measured data (article TODO).

**Beats**
- 607.8 "practical considerations"; 610.2 "Is the heterogeneity actually real?" (slide in)
- 612.1 "the best linear predictor test, the BLP test" (formula)
- 618.0 "alpha zero, which tests ... the average effect" (α₀ arrow)
- 623.0 "alpha one, which tests the calibration slope"; 626.8 "does the forest actually rank magnitudes correctly in reality?" (α₁ dial: 0 / between / 1)
- 631.5 "the R score to compare the model against a constant effect baseline" (RScorer line; flat baseline vs forest)
- 635.8 "if you can't beat the constant effect?" / 637.7 "There's no heterogeneity worth trading" / 639.6 "Brutal."
- 640.2 "What about sample size?"; 642.2 "Causal forests are data hungry" (bottom row)
- 645.2 "empirical testing for sample size interval widths"; 648.3 "plot the interval width against n until it drops below your intended effect size" (curve draws, crosses dashed line)

## Slide 14: H3 Walk-Forward, With Two Wrinkles / H3 Costs. 652.7 to 698.4 (45.7 s)

**Content**
- Serif title "H3 — Walk-Forward, With Two Wrinkles".
- Left panel "Walk-Forward Validation": two overlapping rounded boxes "Event t" (upper left) and "Event t+1" (lower right), their overlap shaded grey and crossed out with a big red X. Bullets: "Anchored walk-forward must pass Deflated Sharpe Ratio (DSR) and Probability of Backtest Overfitting (PBO) gates." / "**Wrinkle 1**: Purge overlapping event windows to prevent out-of-sample contamination." / "**Wrinkle 2**: Redraw honest splits (I_split / I_est) at every refit to avoid structural leakage."
- Right panel "H3 — Costs": framed equation "Signal Edge |τ̂|  −  Expected Half-Spread". Bullets: "**The Catch:** Short event shelf life." / "Unlike continuous signals that pay the spread once and hold, **event** signals pay the spread every event." / "Costs must be amortized over a fixed, short holding period."

Article check: matches "Walk-Forward, With Two Wrinkles" and "Costs".

**Beats**
- 652.7 "And evaluating this over time?"; 655.0 "The anchored walk-forward"; 656.6 "two massive wrinkles" (slide in)
- 660.2 "purging overlapping event windows so folds don't share observations" (overlap shades, red X)
- 667.0 "Redrawing the honest splits, your I_split and I_est samples at every refit"; 672.0 "If you don't, you leak data" (split shuffles each refit)
- 674.0 "deflated Sharpe ratio, the DSR, and probability of backtest overfitting PBO gates" (two gates)
- 682.0 "Which brings us to costs" (right panel)
- 684.7 "Expected half spread execution costs must be subtracted" (equation)
- 687.6 "this CATE signal has a very short event shelf life" (timer)
- 694.4 "The edge must survive paying the spread on every single event" (toll booth gag: each event pays)

## Slide 15: H2 Conclusion / H2 References. 698.4 to 778.77 (80.4 s)

**Content**
- Two serif titles: "H2 — Conclusion" (left), "H2 — References" (right).
- Left panel bullets: "**Causal forests** answer: "how much did this event move this asset relative to the counterfactual"." / "Requires unique machinery: heterogeneity-maximizing splits, honest estimation, adaptive weights, infinitesimal-jackknife intervals." / "Assumptions must be rigidly tested, not asserted: Unconfoundedness, Overlap, SUTVA." ("Causal forests", "infinitesimal-jackknife", and the three assumptions in teal.)
- Right panel: "Athey & Imbens (2016)" / "Wager & Athey (2018)" / "Athey, Tibshirani & Wager (2019)" / "Chernozhukov et al. (2018)" / "Battocchi et al. (2019)".
- Full-width amber box: "**Editorial Flag / Source Claim Note:** The source article explicitly lacks measured real CATE distributions, diagnostic results, and live PnL. Every number is a placeholder. This represents a methodological tutorial framework, not a validated trading finding pending a published 'honest negative'. (Stale publication-sequencing comment preserved)."

Article check: conclusion matches; references list omits article ref 5 (Chernozhukov, Demirer, Duflo, Fernandez-Val 2018, the BLP paper). The parenthetical "(Stale publication-sequencing comment preserved)" is internal editorial metadata, drop it when redrawing.

**Beats**
- 698.4 "in conclusion, causal forests isolate the true impact of an event relative to a missing counterfactual" (slide in, bullet 1; callback to the two universes)
- 705.4 "Using some incredibly rigorous math" (bullet 2)
- 708.3 "Massive reality check from the source text"; 710.7 "The article explicitly lacks real CATE diagnostic and PnL results" (amber box)
- 715.5 "Every single TODO remains unmeasured"; 717.8 "Absolutely no causal trading edge may be claimed from this text"
- 720.9 to 736.8 editorial-flag segment about a "stale publication sequencing comment" (see NotebookLM errors; recommend trimming or covering with a neutral "part of a larger research series" card)
- 737.4 "part of a larger ongoing research pipeline"; 740.4 "heavy academic lifting"
- 744.2 "Susan Athey, Guido Imbens, Stefan Wager, and Victor Chernozhukov" (references list ticks in)
- 752.0 final thought: "if machine learning can definitively tell you that an event impacts one specific asset wildly differently ... but the sheer cost of crossing the spread eats the entire advantage" (callback to the spread toll)
- 768.3 "is the true alpha in the prediction or in the execution?"
- 772.0 "Is finding the heterogeneity only 10% of the battle?"; 775.9 "Think about it"
- 777.0 "Thanks for joining us on this deep dive" (end card)

---

## NotebookLM errors and corrections

1. **Slide 1 diagram, "Node Splitting Criteria: MSE(Yᵢ, Ȳ_leaf)"**: wrong. That is the ordinary regression-tree criterion, which the article (and slide 3) explicitly says causal trees do not use. Use `Δ(split) = n_L·τ̂_L² + n_R·τ̂_R² − n·τ̂²_parent` (maximize treatment-effect variance) or drop the label. The rest of the tree's node labels are garbled AI text ("Celibration", "Heteregoeit", random node numbers); redraw a clean small tree.
2. **Slide 4 legend, "Observed/Treated" vs "Unobserved Counterfactual/Control"**: conflates control units with the unobserved counterfactual. In honest estimation the I_est sample contains observed treated (W = 1) and observed control (W = 0) units; τ̂_node = Ȳ_treated − Ȳ_control. Label the dots "Treated (W = 1)" and "Control (W = 0)", both observed.
3. **Slide 6, "τ̃ still converges cleanly at n^(−1/2)"**: should be τ̂ (the estimator), as in the article. Tilde is reserved for residuals Ỹ, W̃.
4. **Slide 7, "Confounders Wᵢ"**: same symbol as the treatment Wᵢ. The article uses bold vector **W**ᵢ for confounders; draw it bold (or rename to Zᵢ on screen) so it does not collide with the treatment. The slide also drops the article's fifth modifier "open-interest-to-cap ratio".
5. **Slide 8 code**: abridged; the `n_estimators=1000` parameter is never passed to `CausalForestDML` on the slide. Use the article's version with `n_estimators=n_estimators`, `min_samples_leaf=20`, `max_depth=None`, `random_state=42`, and GBM params `n_estimators=200, max_depth=5, learning_rate=0.05`.
6. **Slide 13, α₀ labelled "Calibration null"** (narration 618.0 "tests the calibration of the average effect, that's your null"): misleading. In the article α₀ is the average effect ("is there anything here at all?"); the null of no heterogeneity is α₁ = 0. Label α₀ "Average effect".
7. **Narration 720.9 to 736.8 (stale sequencing comment)**: misattributed quote. The actual stale comment in the source is an HTML comment saying the companion DML article (`double-ml-causal-trading`) must be published before this one and that both drafts carried date 2026-03-30. The quoted words "the quantitative versions ... all transfer unchanged" are ordinary body text in "Costs" pointing to other posts, not a sequencing comment. This is internal editorial chatter, not viewer content: trim it from the cut or cover it with a neutral "part of a larger research series" card; do not put the quote on screen. Likewise drop "(Stale publication-sequencing comment preserved)" from slide 15.
8. **Slide 15 references**: omits Chernozhukov, Demirer, Duflo, Fernandez-Val (2018), "Generic Machine Learning Inference on Heterogeneous Treatment Effects", the source of the BLP test on slide 13. Add it if the references card has room.
9. Minor, keep as is: narration 450.8 "the 95% interval they show" refers to `alpha=0.05` in `effect_interval`; no interval value is reported anywhere in the article (all numbers are placeholders, see TODOs). Do not render any numeric CATE, interval, R-score or PnL as if measured.

---

## Timing notes

`sync_slides.py` was not usable for this episode (it degenerates into an even split on these decks, as in the reference episode). `slide_starts.json` is set by hand from the transcript. The hosts mostly paraphrase the section headings rather than reading "H2 / H3" aloud, but every slide maps 1:1 to an article section in order, so the topic changes are unambiguous.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | intro (X-ray cold open, title read at 32.5, counterfactual at 70 to 108) | high |
| 2 Average to heterogeneous | 108.6 | "Which moves us from looking at average effects to heterogeneous effects" | high (alternative 42.1 "almost every predictive model ... conditional mean" introduces μ(x) from the Standard ML card, but the title slide subtitle "τ(x) over μ(x)" and the observed/counterfactual fork cover 42 to 108 better) |
| 3 Causal trees | 194.1 | "moving into the algorithm itself, the causal forests, let's start with causal trees" | high |
| 4 Honest estimation | 237.9 | "there's this concept of honest estimation" | high |
| 5 Trees to forests / asymptotics | 270.4 | "how do we go from trees to forests?" | high |
| 6 DML | 332.1 | "here's a massive real-world problem. In markets, treatment isn't randomly assigned" | medium-high (DML named at 344.9; the slide's footer "Required when treatment is not randomly assigned" justifies the earlier cut) |
| 7 Trading application | 384.9 | "the trading application from the article, the event impact heterogeneity" | high |
| 8 EconML code | 439.4 | "the article provides Python implementation with EconML" | high |
| 9 CATE surface | 459.6 | "a massive trap in there regarding feature importance" | medium-high (feature importance belongs to `summarize_cate` on slide 9; could be argued to stay on slide 8 until 483.5 "interpreting the CATE surface", but then slide 8 would carry content not on it) |
| 10 Assumptions 1-2 | 505.3 | "what does this all mean if our data is flawed? Let's look at the key assumptions" | high |
| 11 SUTVA | 562.5 | "Assumption three, SUTVA" | high |
| 12 Beyond binary | 586.6 | "let's talk about beyond binary treatments" | high |
| 13 Practical considerations | 607.8 | "Okay, practical considerations" | high |
| 14 Walk-forward / costs | 652.7 | "And evaluating this over time? The anchored walk-forward" | high |
| 15 Conclusion / references | 698.4 | "so in conclusion" | high |

Overall confidence: high. Weakest boundaries: 6 (332.1 vs 344.9) and 9 (459.6 vs 483.5); both are within one sentence-pair of the alternative and can be nudged without affecting neighbours.

Slide 1 is the only slide over 90 s (108.6 s); it is split into sub-scenes 1a / 1b / 1c above. Slide 15 (80.4 s) contains the editorial-flag segment (720.9 to 736.8) that is a trimming candidate.
