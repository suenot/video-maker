# bayesian-neural-networks-trading (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
15-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/bayesian-neural-networks-trading.en.md` ("Epistemic vs Aleatoric: Measuring What a Return Model Doesn't Know", 2026-07-31, suenot).

- Audio: `input/notebooklm-sources/bayesian-neural-networks-trading/en/audio.m4a`, 1473.10 s (24:33.1), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, word timestamps in `words[]`). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: clean white/very light grey background with a thin grey grid, charcoal ink (#2B3038), and a strict two-color code: **magenta (#D63AC8) = epistemic / model ignorance**, **cyan (#22B8D6) = aleatoric / market noise**. Mix of grotesk sans and monospace; LaTeX serif for formulas. Slide titles carry the article heading numbers ("1. H2 —", "5. H2 — ... & 6. H3 — ..."). Keep the magenta/cyan code in every redraw; it is the visual spine of the episode. "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "Sunot" (63.2) = suenot; "Alliatoric" / "a leotoric" = aleatoric; "Garch" = GARCH; "standard belcher for the weights or a mean field Q" (498.0) = a factorized Gaussian / mean-field q; "elbow" = ELBO; "Colbock Liebler Divergence" (529.7) = Kullback-Leibler divergence; "Repair and Maturization trick" (545.3) = reparameterization trick; "GAL and Garamani" (623.0) = Gal and Ghahramani; "t-types" (689.1) = T times; "a lecture Minarian" (887.2) = Lakshminarayanan; "model.aval" (958.2) = model.eval(); "our model's mappage" (1037.4) = our model's map edge (ignorance); "Okay, he'll say" (1062.7) = filler; "epi to alaya abstain ratio" (1118.3) = epi-to-alea ratio; "lured variance" (1285.1) = learned variances; "completely model regimes" (1346.7) = completely novel regimes; "life trading" (1426.2) = live trading; "And credit words do" (1428.8) = credit where it's due; "Blundle" = Blundell; "Kendall Gibbs" = Kendall, Gibbs.

---

## NotebookLM errors / things NOT to reproduce

1. **"Unpublished draft"** (59.7, 393.9, 1198.4): the article is published on the site (2026-07-31). What is true: the article itself says its real-data measurements are TODO and calls the sizing claim unproven. Use "the article flags its own results as not yet measured", not "unpublished".
2. **Slide 1 code snippet is wrong**: `calculate_aleatoric` returns plain MSE `np.mean((y_pred - y_true)**2)` (that is not an aleatoric estimate) and `calculate_epistemic(..., T=10)` uses `model.predict` (no dropout semantics) and T=10 (article: T=30 lower bound, 100 default). The formula labels `Var(e_i)` / `Var(f(x_i, ω))` are not in the article. Redraw with the article's objects: heteroscedastic head `head_logvar` for aleatoric and `mc_predict(..., n_samples=100)` with `model.train()` for epistemic.
3. **Slide 6 says "T parallel stochastic forward passes"**, but the article's trade-off table says MC Dropout passes are *sequential (same model)*; ensembles are the parallel ones. Label it "T stochastic forward passes".
4. **Slide 7 code glitches**: loss is wrapped as `0.5 * precision * (target - mu) ** 2 + 0` / `0.5 * log_var` and `model.train()` appears twice. Correct: `0.5 * precision * (target - mu) ** 2 + 0.5 * log_var` and a single `model.train()  # NOT eval()`.
5. **Slide 13 garbled ACI bullets**: "The stronger optine miscoverage level ..." duplicates bullet 1, and the rescaling box has a stray "(which the model ignorance ACI)". Clean text: ACI "maintains an online miscoverage level α_t with a long-run coverage bound; the stronger option, absorbs model staleness"; Linear rescaling "σ̃ = ασ + β fit on a validation set; weaker static fix, but preserves the epistemic/aleatoric ratio (which ACI's single width does not)".
6. **Calibration framing inverted in narration** (1158.2 to 1191.3): hosts present linear rescaling first as the main tool and ACI as "alternatively". The article: hand calibration off to conformal; ACI is the stronger option; the *only* reason to prefer linear rescaling is that it keeps the epi/alea ratio. Slide 13 has it right (ACI [Recommended]); follow the slide.
7. **Confidence gate described as clipping to zero** (1115.9): the code does not clip to zero at the threshold. When `epi_ratio > max_epi_ratio` (0.5), it multiplies the position by `max(0, 1 - epi_ratio)`, a taper that reaches zero only at ratio >= 1. Animate a taper, not a hard cut.
8. Slide 1 right panel adds "use Bayesian updates" and "improve model architecture" as remedies; not in the article. Harmless but optional; prefer the article's table (reduce position or abstain / widen stops, reduce leverage).

---

## Slide 1: Title. 0.0 to 114.1 (114.1 s)

**Content**
- Top band: a black horizontal line (input signal) enters a triangle labelled "The Prism" and splits into two waves: a high-frequency jagged cyan wave labelled "Aleatoric Uncertainty (Market Noise)" with `Var(ε_i)`, and a slower large-amplitude magenta sine-like wave labelled "Epistemic Uncertainty (Model Ignorance)" with `Var(f(x_i, ω))` (drop these two labels, error 2).
- Title (bold dark sans): "Epistemic vs Aleatoric: Measuring What a Return Model Doesn't Know". Subtitle: "MC Dropout and deep ensembles split uncertainty into model ignorance and market noise — and those two deserve different position sizes."
- Flow: "RETURN MODEL (BASE)" -> "UNCERTAINTY DECOMPOSITION" -> splits into cyan "ALEATORIC COMPONENT (CYAN)" -> "Var_market" -> cyan box "POSITION SIZING" and magenta "EPISTEMIC COMPONENT (MAGENTA)" -> "Var_model" -> magenta box "POSITION SIZING". Between them: `σ²_total = σ²_aleatoric + σ²_epistemic`.
- Code strip (fix per error 2): `def calculate_aleatoric(y_pred, y_true): loss = np.mean((y_pred - y_true)**2)  # Data-dependent return loss` | `def calculate_epistemic(model, x, T=10): y_preds = [model.predict(x) for _ in range(T)]  # Monte Carlo Dropout variance; return np.var(y_preds)`.
- Right table: "MARKET NOISE (ALEATORIC) - CYAN" chart: Return vs Time, noisy cyan line inside a constant-width cyan band, label "Inherent System Variance, Irreducible"; bullets "Causes: Latent variables, observation noise, chaotic dynamics." / "Solution: Model cannot fix, account for in risk budget." / "Position Sizing Implication: Wider stop-losses, adjust for volatility." | "MODEL IGNORANCE (EPISTEMIC) - MAGENTA" chart: Model Output f(x) vs Feature Space X, several magenta curves fanning out from one point inside a widening magenta cone, label "Lack of Data/Knowledge, Reducible"; bullets "Causes: Limited training data, model bias, insufficient capacity." / "Solution: Collect more data, improve model architecture, use ensembles." / "Position Sizing Implication: Reduce exposure, conservative allocation, use Bayesian updates."
- Footer mono: "Author: suenot | Date: 2026-07-31 | Tags: bayesian, uncertainty, neural-network, risk, position-sizing".

**Sub-scenes and beats**
- 1a Rainstorm vs edge of the map (0.0 to 52.9): 0.0 "Picture this scenario"; 1.8 "driving down a highway in the middle of a massive rainstorm" (car, rain, wipers); 6.6 "roads are slick, visibility is just terrible"; 15.0 "you are still on a road you know, you've driven it a hundred times"; 19.0 "driving completely off the edge of your GPS map entirely" (GPS map edge, car drives into black); 23.5 "no idea if there's a paved road or like a cliff ahead"; 32.4 "one of those situations is environmental noise (cyan), the other is your own absolute ignorance (magenta)"; 43.5 "almost every single standard position sizing model just treats those two scenarios as if they are the exact same thing".
- 1b Title and thesis (52.9 to 114.1): 57.9 article "from July 31st, 2026" by suenot (error 1: do not say unpublished); 66.6 title read "Epistemic versus Aleatoric, measuring what a return model doesn't know" (title reveal, prism splits the beam); 75.0 "typical position sizing rules ... Kelly criterion, conformal prediction or volatility targeting with GARCH" (three chips); 84.6 "they all collapse uncertainty down into a single number" (chips funnel into one number); 88.2 "take the rainstorm and the edge of the map, blend them together"; 95.5 "mathematically convenient ... practically dangerous"; 101.6 "unpack this mathematical split" / 105.3 "estimate these two different components using neural networks" / 109.6 "asymmetric position sizing" (agenda: split, estimate, size).

## Slide 2: 1. H2 The Thesis: Two Uncertainties Demand Two Responses. 114.1 to 257.2 (143.1 s)

**Content**
- Two-column table; magenta bar over the left column, cyan bar over the right.
  - Header: "Epistemic" (magenta) | "Aleatoric" (cyan)
  - "Source: `Limited data / model`" | "Source: `Inherent noise in data`"
  - "Reducible?: `Yes` (more data helps)" | "Reducible?: `No`"
  - "Trading action: **Reduce position or abstain**" | "Trading action: **Widen stops, reduce leverage**"
  - "Signal: `I haven't seen this regime`" | "Signal: `This market is noisy right now`"
- Dark footer bar: "Standard rules (`Kelly`, `Conformal`, GARCH) treat uncertainty as one number. But market noise is priced; model ignorance is an **unknown unknown** with no risk premium."

Article check: table matches the article exactly.

**Sub-scenes and beats**
- 2a Aleatoric (114.1 to 170.0): 114.1 "Let's start with the thesis"; 121.0 "the rainstorm first ... aleatoric uncertainty" (cyan column lights); 127.2 "the inherent noise in the data itself" (Source); 131.9 "a known unknown"; 136.4 "this market is noisy right now" (Signal); 141.1 "cannot be reduced just by gathering more data" (Reducible: No; data pile grows, rain unchanged); 153.5 "standard risk management ... widen your stops, ... reduce your leverage" (Trading action); 160.5 "compensated by a risk premium" (coin drops into the cyan column).
- 2b Epistemic (170.0 to 229.5): 170.0 "the edge of the map, which we call epistemic uncertainty" (magenta column lights); 176.2 "limited data or maybe just a flawed model architecture" (Source); 181.1 "an unknown unknown"; 187.2 "I have never seen this type of market regime before" (Signal); 191.3 "this uncertainty actually can be reduced" / 195.9 "more data covering that specific weird market regime ... its ignorance shrinks" (Reducible: Yes; the magenta fog shrinks as data dots fill in); 214.6 "aggressively reduce the position or just abstain" (Trading action); 220.2 "no risk premium attached to being wrong about your own parameters" / 224.4 "the market doesn't magically pay you just because your neural network is confused" (footer bar).
- 2c Conflation mistakes (229.5 to 257.2): 234.6 "one combined total variance number ... two very specific mistakes"; 241.4 "over trade in unfamiliar regimes ... ignoring its own epistemic ignorance" (car speeding off the map edge); 247.2 "under trade in familiar but noisy regimes, over penalizing the standard aleatoric risk" (car crawling on a known rainy road).

## Slide 3: 2. H3 The Decomposition. 257.2 to 391.5 (134.3 s)

**Content**
- Two boxed panels.
  - Left formula: `p(y | x, D) = ∫ p(y | x, θ) p(θ | D) dθ`; magenta bracket under the integrand; magenta text "Uncertainty over model parameters θ. Integrates over the distribution rather than using a single θ*. Shrinks as dataset D grows." (deck duplicates "rather"; drop the duplicate).
  - Right formula: `p(y | x, θ) = N(y; μ_θ(x), σ²_θ(x))`; cyan bracket under `σ²_θ(x)`; cyan text "The heteroscedastic Gaussian head. Emits input-dependent conditional variance."
- Grey note bar: "**Note**: This NN head estimates the exact same object as a live GARCH(1,1) conditional forecast—but GARCH cannot provide the Epistemic term."

Article check: formulas match the article.

**Sub-scenes and beats**
- 3a Epistemic integral (257.2 to 317.0): 257.2 "the decomposition"; 266.2 "in standard machine learning, you usually just hunt for a single best set of parameters" (one weight value θ*); 273.9 "in a Bayesian approach ... capture the uncertainty over the model parameters"; 279.0 "maintain a whole distribution of possible parameters" (θ* blurs into a distribution); 286.5 "a whole landscape of possible weight configurations" (3D landscape); 293.7 "average over that entire landscape ... the predictive posterior" (left formula writes; ∫ sweeps); 307.1 "the spread or ... the disagreement ... that is your epistemic uncertainty" (magenta bracket).
- 3b Aleatoric head and GARCH (317.0 to 391.5): 317.0 "the aleatoric side, the rainstorm"; 320.2 "a heteroscedastic Gaussian variance head" (right formula); 328.7 "an output layer that predicts the noise level for every single data point" / 338.6 "doesn't just guess a mean return ... also emits a specific conditional variance" (network with two output heads μ and σ²; cyan bracket); 346.1 "Doesn't a standard GARCH model already do exactly this?"; 353.5 "GARCH 1-1 ... estimates conditional variance perfectly well"; 358.2 "high overnight volatilities and calm midday hours" (intraday variance curve); 369.6 "a different estimator of the exact same mathematical object that GARCH estimates"; 380.1 "tells you absolutely nothing about the model's epistemic ignorance" / 386.0 "It only sees the rainstorm" / 387.8 "You need this Bayesian decomposition to actually see the edge of the map" (Note bar).

## Slide 4: 3. H2 Where This Sits Relative to What's Already Published. 391.5 to 461.1 (69.6 s)

**Content**
- Dark header banner: "Keep conformal on top for coverage. Buy the Bayesian decomposition to know *why* the interval widened."
- Two columns with crop-mark style lines:
  - "Conformal Prediction": bullets "Provides finite-sample coverage guarantees." / "Provides inverse-width sizing and edge-ratio no-trade filters." Dashed box "**Constraint:** Gives you a guarantee but only one number (not decomposable)."
  - "Bayesian Networks (This Deck)": bullet "Provides Variance Decomposition (**Epistemic** (magenta) vs. **Aleatoric** (cyan))." Dashed box "**Constraint:** No finite-sample coverage guarantee (intervals are only as good as the approximate posterior)."
- Footer mono: "Temporal Fusion Transformers (TFT) emit quantiles directly, but pinball-loss quantiles are not automatically calibrated out of sample."

Article check: matches.

**Beats**
- 391.5 "contextualizes where this ... sits, relative to what's already out there" (slide in; avoid the word "unpublished", error 1); 397.6 "previous posts on conformal prediction and temporal fusion transformers" (two post cards)
- 412.2 "conformal prediction ... a finite sample coverage guarantee" / 417.2 "If it says it's 95% confident, you can trust that math" (95% shield on the left)
- 420.7 "only provides one single number ... the interval width" / 425.0 "not decomposable" / 428.7 "can't tell you why the interval suddenly got wider" (interval bar widens with a "?")
- 431.5 "Bayesian methods ... give you that underlying why" (bar splits into magenta + cyan segments); 439.7 "no strict coverage guarantees"; 443.8 "only as reliable as your approximation"
- 447.9 "keep conformal prediction layered on top of this Bayesian decomposition" / 454.9 "the why from the Bayes side and the mathematical safety net from the conformal side" (conformal shield stacks on top of the split bar; header banner)

## Slide 5: 4. H2 Method 1: Variational Inference (Bayes by Backprop). 461.1 to 617.0 (155.9 s)

**Content**
- ELBO formula: `L(φ) = E_{q_φ(θ)}[log p(D | θ)] − KL(q_φ(θ) || p(θ))`; magenta brackets: under the first term "Pushes q_φ toward explaining the data.", under the KL term "Keeps q_φ near the prior."
- Box "Reparameterization Trick": `θ = μ + σ ⊙ ε (where ε ~ N(0, I))` / "Replaces intractable posterior with factorized Gaussian `q_φ(θ) = ∏_j N(θ_j; μ_j, σ_j²)`."
- Right grey panel "Costs / Trade-offs": "Doubles parameter count." / "Raises gradient variance." / "Mean-field assumption ignores weight correlations, tending to *underestimate* **epistemic** (magenta) uncertainty."

Article check: matches (Blundell et al., 2015).

**Sub-scenes and beats**
- 5a ELBO tug of war (461.1 to 557.2): 461.1 "how do we actually compute this ... three distinct methods" (three method cards, 1 highlighted); 467.3 "variational inference ... Bayes by Backprop"; 475.0 "places a prior distribution over its weights"; 479.1 "checking every single possible weight combination ... computationally intractable"; 490.0 "variational inference offers a shortcut ... a simpler tractable approximation" / 498.0 "a factorized Gaussian ... mean field q" (complex posterior blob replaced by a simple ellipse); 507.9 "we can't measure the difference directly"; 513.0 "the evidence lower bound or the ELBO" (formula writes); 518.6 "Think of the ELBO as a tug of war" (rope: left team = data-fit term, right = KL anchor); 522.5 "a metric is pulling your model to perfectly explain the data" (first bracket); 527.3 "a penalty term ... Kullback-Leibler divergence ... acts like an anchor" / 534.4 "stay conservative and close to your original prior" (second bracket); 539.3 "letting those two sides fight until they balance out"; 545.3 "the reparameterization trick" / 549.8 "separates out the random noise generation from the weights themselves" / 553.4 "cleanly back propagate" (box: ε sampled, θ = μ + σ ⊙ ε).
- 5b Costs and mean-field flaw (557.2 to 617.0): 559.0 "let's look at the costs"; 562.1 "learn a mean and a variance for every single weight ... doubling the parameter count" (each weight splits into μ, σ; cost bullet 1); 573.9 "high gradient variance making training really unstable" (bullet 2); 580.5 "the mean field assumption"; 587.3 "assumes all the network weights act entirely independently" (correlation lines between weights cut); 592.2 "tends to severely underestimate your epistemic uncertainty" (magenta fog shrinks falsely; bullet 3); 599.4 "defeats the entire purpose"; 609.2 "what is a cheaper, better shortcut?"

## Slide 6: 5. H2 Method 2: MC Dropout & 6. H3 Predictive Statistics. 617.0 to 737.8 (120.8 s)

**Content**
- Top: box `x` -> rounded "Single Network" container with three curved arrows: "T parallel stochastic forward passes (dropout active)" (fix wording, error 3) -> "Predictions" (small node-graph icon). Callout: "Dropout stays ON at test time to sample the implicit posterior (deep Gaussian process)."
- Bottom panel "The Law of Total Variance", three columns:
  - "Predictive mean": `ȳ = (1/T) Σ_{t=1..T} ŷ_t`
  - "Epistemic (Disagreement between passes)" magenta: `σ²_epi = (1/T) Σ (ŷ_t − ȳ)²`
  - "Aleatoric (Mean of predicted noise)" cyan: `σ²_alea = (1/T) Σ σ̂_t²`

Article check: formulas match. Gal & Ghahramani (2016).

**Sub-scenes and beats**
- 6a Blindfolded board (617.0 to 684.3): 617.0 "Method 2, Monte Carlo dropout"; 623.0 "Gal and Ghahramani back in 2016"; 631.5 "standard dropout, which randomly turns off different neurons during training"; 640.4 "leave that dropout function still active at test time" (switch flips ON); 646.7 analogy "a board of directors ... randomly blindfold half the room" (boardroom, random blindfolds); 655.8 "exact same answer every single time ... predictable"; 661.5 "answers swing wildly ... high epistemic uncertainty" (answers scatter, magenta); 670.4 "a whole distribution over different subnetworks" (three passes, different dropped nodes); 676.2 "approximate variational inference ... in a deep Gaussian process" (callout).
- 6b Law of total variance (684.3 to 737.8): 687.5 "run it through your network T times" (pass counter); 691.8 "a slightly different prediction on each" (dots ŷ_1..ŷ_T on a number line); 698.0 "the law of total variance"; 701.7 "predictive mean is just the simple average" (ȳ marker; column 1); 705.8 "epistemic ... the disagreement between those passes ... variance of those conditional means" (spread of dots, magenta; column 2); 719.0 "your epistemic variance spikes ... off the edge of the map"; 724.2 "aleatoric ... the mean of the predicted noise ... average them together" (each dot has a cyan noise bar; column 3); 732.2 "variance of the conditional mean from the mean of the conditional variance".

## Slide 7: 7. H3 PyTorch Implementation & 8. H3 Choosing the Number of Forward Passes. 737.8 to 882.3 (144.5 s)

**Content**
- Left code (mono, fix per error 4):
  - `# 1. Architecture` / `self.head_mu = nn.Linear(hidden_dim, 1)` / `self.head_logvar = nn.Linear(hidden_dim, 1)`
  - `# 2. Heteroscedastic Loss` / `0.5 * precision * (target - mu) ** 2 + 0.5 * log_var` (log_var cyan)
  - `# 3. MC Predict Loop` / `model.train()  # Explicitly active` (magenta) / `for _ in range(n_samples):` / `    mu, log_var = model(x)`
- Right heavy-bordered pink box: "**THE GOTCHA:** Calling `model.eval()` inside `mc_predict` silently disables dropout. Every pass returns identical values. **σ_epi** (magenta) collapses to exactly zero, reverting the system to plain Kelly on **aleatoric variance** (cyan) without erroring."
- "Pass Counts (T)": "T = 30: stable mean lower bound" / "T = 100: workable default" / "T = 500+: diminishing returns (unless tail quantiles needed)".

Article check: matches article code (MCDropoutNet, hidden_dim 128, dropout_p 0.1, AdamW lr 1e-3, 200 epochs). Article adds: "Assert that `epistemic_var > 0` in your inference path."

**Sub-scenes and beats**
- 7a Code and loss (737.8 to 783.5): 737.8 "exact PyTorch code ... MCDropoutNet"; 746.5 "two distinct linear heads" / 750.2 "head mu outputs the predicted return" / 753.9 "head logvar outputs the log of the aleatoric variance" (two heads light, μ white, logvar cyan); 759.2 "the loss function binding those heads" / 763.0 "heteroscedastic ... self-regulating"; 766.7 "one part ... demands a tiny variance" (first term) / 770.8 "another part explicitly punishes the model if the variance gets too small" (second term); 775.6 "fights itself until it balances exactly at the true conditional noise level" (seesaw settles).
- 7b The gotcha (783.5 to 837.9): 786.4 "a major operational catch"; 797.4 "a silent killer waiting for you"; 800.9 "Every basic PyTorch tutorial tells you to call model.eval" (tutorial card); 807.0 "it disables the dropout layer entirely" / 810.5 "the blindfolds come off" (callback to board: all blindfolds removed); 814.2 "every single one of your T forward passes will return the exact same identical prediction" (dots stack on one point); 819.2 "epistemic variance collapses to zero" (σ_epi gauge drops to 0); 821.8 "won't throw a single error code" (green "OK" with no error, ominous); 824.7 "silently revert to plain Kelly sizing based only on aleatoric variance"; 831.9 "You absolutely must keep model.train() active" (magenta line glows; gotcha box).
- 7c Pass counts (837.9 to 882.3): 840.4 "choose your number of forward passes, T"; 848.2 "30 passes is your minimum lower bound"; 852.0 "100 passes is the recommended workable default"; 855.3 "anything above 500 ... heavily diminishing returns" / 859.7 "unless ... deep tail quantiles" (curve of stability vs T, marks at 30/100/500); 865.0 "the actual hardware latency ... 100 sequential passes before executing a live trade ... totally unmeasured" (stopwatch with "?", TODO tag); 878.8 "test that latency on your own target hardware".

## Slide 8: 9. H2 Method 3: Deep Ensembles. 882.3 to 923.1 (40.8 s)

**Content**
- `X` box branches to three rounded boxes with magenta drop-shadows: "Network 1 (Seed A)", "Network 2 (Seed B)", "Network M (Seed X)" (each with a tiny MLP icon) -> "Aggregation Node". Formula: `p(y | x) ≈ (1/M) Σ_{m=1..M} p(y | x, θ*_m)`.
- Bold bullets: "Not formally Bayesian, but consistently beats principled methods on uncertainty calibration benchmarks." / "Disagreement between independent members is the explicit epistemic estimate." / "Distinct from standard aggregation (like regime detection) because the inter-member spread is the uncertainty estimator."

Article check: matches (Lakshminarayanan et al., 2017).

**Beats**
- 882.3 "which naturally sets up method three"; 885.0 "Deep ensembles"; 887.2 "proposed by Lakshminarayanan and colleagues in 2017"
- 890.6 "If running 100 sequential passes ... is too slow"; 896.2 "train M completely independent networks from scratch and aggregate them" (three networks build, arrows to aggregation, formula)
- 902.2 "totally brute force, but the benefit is striking"; 905.7 "aren't formally Bayesian ... consistently beat the more mathematically principled Bayesian methods on uncertainty calibration benchmarks" (bullet 1, small leaderboard)
- 917.1 "the disagreement between the entirely separate ensemble members becomes your epistemic estimate" (three outputs spread, magenta halo; bullet 2)

## Slide 9: 10. H3 Ensemble Implementation. 923.1 to 973.9 (50.8 s)

**Content**
- Code (mono):
```
def __init__(self...):
  for seed in range(n_models):
    torch.manual_seed(seed)  # different init
def fit(self...):
  for seed, model in enumerate(self.models):
    torch.manual_seed(1000 + seed) # different shuffle
def predict(self, x):
  for model in self.models:
    model.eval() # Correct here
```
- Box with arrows to the seed lines and to `model.eval()`: "Diversity requires independent training. Skipping the distinct fit() loop yields σ²_epi = 0 (identical members) or pure noise."
- Heavy box "STATE CONTRAST EXECUTION RULE:" "In Deep Ensembles, model.eval() IS correct during inference." / "The stochasticity comes from independent training seeds and shuffles (magenta underline), not live dropout masks (cyan underline)."

**Beats**
- 923.1 "a strict requirement for diversity" / 928.6 "from independent training histories"; 932.1 "you can't just copy the same model"
- 935.6 "different initialization seeds for the weights" (`manual_seed(seed)` line glows) and 938.1 "different random shuffle orders" (`1000 + seed` line glows)
- 942.1 "construct M identical models ... train them the exact same way ... exact same predictions ... zero epistemic variance" (three clones, outputs overlap, σ²_epi = 0; diversity box)
- 952.0 "contrast this directly with the MC dropout pitfall"; 958.2 "for deep ensembles, calling model.eval() is actually correct" (green check next to `model.eval()`, vs red X callback to slide 7)
- 965.7 "the random disagreement comes from the independent training histories ... not from live dropout masks" (rule box)

## Slide 10: 11. H3 Trade-offs: MC Dropout vs Deep Ensembles. 973.9 to 1032.9 (59.0 s)

**Content**
- Table "[Dimension] | [MC Dropout] | [Deep Ensembles]":
  - Training cost | 1x (single model) | Mx (M models)
  - Inference cost | T forward passes | M forward passes
  - Memory | 1x parameters | Mx parameters
  - Uncertainty quality | Tends to underestimate epistemic | Better calibrated overall (magenta)
  - Ease of implementation | Trivial (flip a flag) | Trivial (train M models) (magenta)
  - Parallelism | Sequential passes (same model) | Embarrassingly parallel
- Tabbed box "The Pragmatic Hybrid": "Train a small ensemble (M = 3-5) where each member also uses MC Dropout to capture both inter-model disagreement (magenta) and intra-model stochasticity (cyan)."

Article check: matches.

**Beats**
- 973.9 "quick head-to-head comparison"; 977.7 "MC dropout is incredibly cheap on memory" / 981.1 "1x training cost" / 984.9 "trivial to implement" (MC column fills)
- 988.8 "Inference requires those sequential T passes"; 992.6 "tends to underestimate epistemic uncertainty"
- 996.6 "Deep ensembles ... cost M times as much to train" / 1000.0 "M times as much memory"; 1002.4 "M embarrassingly parallel passes ... fantastic for low latency"; 1008.4 "much better calibrated uncertainty overall" (ensemble column fills)
- 1011.9 "a pragmatic hybrid"; 1016.3 "a small ensemble, maybe three to five independent models" / 1019.9 "each ... also use MC dropout internally"; 1025.3 "broad diversity of different weight initializations and the local stochasticity of the dropout masks" (hybrid box: 3 networks each with flickering dropout)

## Slide 11: 12. H2 The Payoff: Asymmetric Sizing. 1032.9 to 1141.6 (108.7 s)

**Content**
- "Standard Gaussian Kelly: f* = μ / σ² (quarter-Kelly fraction)"
- Big: "**New Denominator:** `σ²_eff = σ²_alea + λ · σ²_epi, (λ > 1)`" (alea cyan, epi magenta, λ bold)
- "**Rationale:** Aleatoric noise earns a premium. Epistemic variance correlates with a broken μ estimate, compounding sizing error. Penalize it superlinearly."
- Code panel:
```
def uncertainty_adjusted_position_size(...):
    effective_var = aleatoric_std ** 2 + lam * epistemic_std ** 2
    position = (pred_mean / effective_var) * base_kelly_fraction

    # The Confidence Gate
    epi_ratio = epistemic_std / (aleatoric_std + 1e-8)
    if epi_ratio > max_epi_ratio:
        position *= max(0.0, 1.0 - epi_ratio)
```
- Callout from "# The Confidence Gate": "Detects a state total-uncertainty gating cannot: a calm-but-unfamiliar regime."

Article check: matches article code (defaults lam = 2.0, max_epi_ratio = 0.5, base_kelly_fraction = 0.25, clip to ±max_position).

**Sub-scenes and beats**
- 11a New denominator (1032.9 to 1081.9): 1032.9 "we have our decomposition"; 1040.0 "Now for the payoff. Asymmetric sizing"; 1044.6 "the classic Gaussian Kelly fraction ... mu divided by ... sigma squared" (f* = μ/σ² writes); 1053.8 "a quarter-Kelly fraction ... baseline"; 1058.1 "changing the denominator" (σ² lifts out); 1063.8 "swaps it for an effective variance"; 1069.4 "your aleatoric noise (cyan) plus your epistemic ignorance (magenta) multiplied by a heavy penalty factor ... lambda" (new denominator assembles term by term); 1077.7 "hypothesized to be strictly greater than one" (λ > 1).
- 11b Why λ > 1 and the gate (1081.9 to 1141.6): 1087.3 "epistemic variance carries zero risk premium"; 1094.9 "if your model is deeply confused about its own parameters, its estimate of the mean return ... the numerator ... is highly likely to be completely wrong too" (numerator μ wobbles while magenta grows); 1105.0 "The error compounds" / 1106.4 "highly confident in a bad guess"; 1109.8 "penalize it super linearly" (rationale line); 1112.4 "a confidence gate" (code panel); 1118.3 "the epi-to-alea ... ratio" (gauge epi/alea); 1125.4 "cuts exposure specifically when the model is more confused about its internal parameters than the outside market is noisy" (position bar tapers as the ratio passes 0.5, reaching 0 at 1.0; see error 7); 1132.9 "a precision scalpel that a standard total variance gate simply cannot replicate" / 1138.0 "doesn't know why the risk is high" (callout: calm-but-unfamiliar regime: small total bar, but mostly magenta).

## Slide 12: 13. H2 Calibration: Hand This Off. 1141.6 to 1191.3 (49.7 s)

**Content**
- Heavy box "Core Warning: Do NOT roll your own Gaussian-quantile reliability check on fat-tailed return residuals for a nominal 95% interval." Two arrows down to:
  - "Adaptive Conformal Inference (ACI)" cyan "[Recommended]": bullets per error 5 cleanup.
  - "Linear Rescaling (Post-hoc)": "σ̃ = ασ + β fit on a validation set." / "Weaker static fix, but explicitly preserves the Epistemic/Aleatoric ratio (which ACI's single width does not)."

Article check: Gibbs & Candes (2021) for ACI. Follow the slide's ordering (ACI recommended); see error 6 for the narration.

**Beats**
- 1141.6 "all of this relies entirely on calibration"; 1147.6 "a nominal 95% confidence interval ... should contain the true market outcome approximately 95% of the time" (100 outcomes, ~95 inside the band)
- 1158.2 "strongly advises against trying to build your own custom reliability check" (warning box; DIY tool crossed out) / 1163.3 "hand this off to established calibration tools"
- 1166.7 "linear rescaling" / 1169.5 "preserves that delicate epistemic to aleatoric ratio" (right box: magenta/cyan bar scales uniformly, ratio kept)
- 1176.3 "adaptive conformal inference or ACI"; 1181.5 "dynamically maintains an online miscoverage target" (α_t needle adjusting); 1185.9 "relies on a single interval width so it doesn't preserve the internal ratio" (bar becomes one grey segment). Show ACI as the [Recommended] one.

## Slide 13: 14. H2 What Has To Be Measured Before This Publishes. 1191.3 to 1264.1 (72.8 s)

**Content**
- Header "TODO / Pending Validation"; five rows with empty checkboxes:
  1. "**Dataset/Target:** Define instrument, bar size, features, target."
  2. "**The Split Ratio:** Track epi (magenta)/alea (cyan) fraction across named calm vs. volatile windows. (Hypothesis: The ratio spikes *before* realized volatility)."
  3. "**Coverage vs Conformal:** Head-to-head out-of-sample coverage of MC Dropout against split-conformal intervals."
  4. "**Does λ buy PnL?:** Sweep the epistemic penalty on validation vs a λ=1 baseline. (An honest negative is a valid result)."
  5. "**Inference Cost:** Measure latency at T on target hardware."
- Bold footer: "All evaluation must run under strictly disciplined Walk-Forward Optimization. A λ tuned on the full sample is not a result."

Article check: matches the article's five TODOs.

**Beats**
- 1191.3 "a necessary reality check"; 1196.7 "there is no proven trading edge demonstrated here yet" (avoid "unpublished", error 1)
- 1208.4 "five critical things that must be measured on real financial data"
- 1215.6 row 1 "data set and target specifications"
- 1219.2 row 2 "the split itself" / 1223.7 "the epistemic ratio actually spikes before realized market volatility does" (mini chart: magenta ratio line peaks, cyan realized vol peaks later)
- 1229.9 row 3 "coverage versus conformal ... MC dropout intervals against rigorous split conformal intervals"
- 1240.2 row 4 "does that lambda penalty actually buy you anything?" / 1243.4 "sweep ... via strict walk forward tuning" (footer)
- 1251.7 row 5 "inference cost and latency at T passes on target hardware"
- 1258.1 "None of these five elements have measured results ... explicitly marked as TODO" (all five boxes stay empty, stamp "TODO")

## Slide 14: 15. H2 Practical Tips for Production. 1264.1 to 1326.4 (62.3 s)

**Content**
- Six cards on a grid background:
  1. "Warm-up prior": "Initialize variational mean from pre-trained deterministic network (halves convergence time)."
  2. "Watch variance collapse": "Learned σ_j can drift to zero, reverting BNN to deterministic. Add KL annealing if needed."
  3. "Rolling recalibration": "Retrain on walk-forward windows or use ACI online. Fixed fits decay."
  4. "Ensemble diversity": "Different seeds/shuffles per member. The fit() loop initialization is mandatory."
  5. "Log the decomposition": "Store epi/alea separately to answer *why* a sizer cut exposure post-trade."
  6. "Uncertainty as a feature": "Test rolling epistemic statistics as predictive features for drawdowns."

Article check: matches the six tips (article: "typically halves").

**Beats**
- 1264.1 "rapid fire practical tips"; 1273.6 tip 1 "warm up your Bayesian prior using a standard pre-trained deterministic network" / 1279.2 "halves your convergence time" (clock halves)
- 1281.8 tip 2 "monitor for variance collapse ... learned variances just silently drift to zero" (σ_j bars sink)
- 1290.3 tip 3 "recalibrate on a rolling basis ... non-stationary" (rolling windows)
- 1295.6 tip 4 "diversity matters ... log your initialization seeds"
- 1303.1 tip 5 "logging the decomposition itself in your production database" / 1307.5 "When your sizing algorithm cuts your market exposure ... Was it market noise or model ignorance?" (log row with cyan and magenta columns)
- 1314.1 tip 6 "uncertainty output as a predictive feature" / 1319.5 "spikes in epistemic uncertainty might be highly predictive of impending drawdowns" (magenta spike then equity drawdown, marked "unmeasured")

## Slide 15: 16. H2 Limitations and Honest Caveats & 17. H2 Conclusion. 1326.4 to 1473.10 (146.7 s)

**Content**
- Left "Honest Caveats" with warning triangles:
  - "Approximations aren't ground truth; no coverage guarantees."
  - "Novel regimes break calibration (out-of-distribution inputs yield out-of-distribution uncertainty)."
  - "Crucial Failure Mode: A flexible aleatoric head can absorb epistemic signal, quietly collapsing σ_epi (magenta) and defeating the split."
  - "λ is a free parameter requiring walk-forward justification."
- Right "Conclusion": "Conformal gives coverage. Kelly gives sizing. Bayesian splitting tells you *why* an interval is wide." / "Market noise is compensated risk. Model ignorance is not. The sizing denominator must reflect this." / "Both MC Dropout and Ensembles feed the same asymmetric sizing: σ²_alea + λ σ²_epi." / "Empirical measurements remain the strict price of publication."
- Footer: "References: Blundell 2015, Gal 2016, Lakshminarayanan 2017, Kendall 2017, Gibbs 2021, Kelly 1956"

Article check: matches the article's caveats, conclusion and reference list.

**Sub-scenes and beats**
- 15a Caveats (1326.4 to 1392.6): 1326.4 "limitations and caveats"; 1331.8 caveat 1 "approximate posteriors are still approximate ... no mathematical guarantees"; 1343.9 caveat 2 "calibration tends to degrade rapidly in completely novel regimes ... out-of-distribution inputs" (band snaps); 1354.6 caveat 3 "the most dangerous failure mode ... a highly flexible aleatoric head can actually absorb the epistemic signal" / 1363.3 "the network basically gets lazy" / 1365.0 "explain away its own internal confusion by just falsely claiming the data itself is noisy" (magenta bar drains into the cyan bar, cyan grows, magenta goes to 0) / 1375.5 "silently breaks the entire decomposition"; 1379.9 caveat 4 "lambda is a free parameter" / 1385.8 "not justified by rigorous walk forward validation ... massive overfitting" (λ knob cranked, red).
- 15b Conclusion (1392.6 to 1440.6): 1392.6 "what does this actually mean for a quantitative trading desk?"; 1396.9 "splitting predictive variance answers why a risk interval is wide" (conclusion 1); 1403.2 "Market noise is compensated risk. Your model's ignorance is not" (conclusion 2: coin to cyan, nothing to magenta); 1407.8 "MC dropout makes getting the split nearly computationally free"; 1411.7 "deep ensembles costs significantly more memory, but calibrates better" / 1417.0 "both ... feed that new asymmetric denominator" (conclusion 3, formula); 1421.9 "whether a super linear lambda penalty actually pays off in live trading remains an unmeasured hypothesis" (conclusion 4); 1428.8 "credit where it's due ... Blundell, Gal, Lakshminarayanan, Kendall, Gibbs, and ... Kelly" (references footer, names pop in order).
- 15c Outro (1440.6 to 1473.10): 1444.3 "one final provocative thought"; 1451.6 "driving off the edge of the map" (callback to 1a); 1454.8 "If a model specific ignorance metric reliably spikes right before a major market crash" (magenta spike, crash candle after); 1460.3 "is the model actually ignorant or has it organically learned a completely new type of leading indicator?" (magenta line morphs into an indicator line, "?"); 1471.4 "Thanks for joining us" (end card).

---

## Timing notes

`sync_slides.py` (default params) degenerated ("showed 8/15 slides, longest held 81%") and fell back to an even 98.2 s split. Wrong for nearly every slide (e.g. slide 3 auto 196 s vs real 257.2 s, slide 6 auto 491 s vs 617.0 s, slide 11 auto 982 s vs 1032.9 s, slide 15 auto 1375 s vs 1326.4 s).

`slide_starts.json` is set by hand from topic changes in the transcript (hosts do not read headings aloud; the deck follows the article's section order 1:1):

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | intro | high |
| 2 Thesis | 114.1 | "Let's start with the thesis itself" | high |
| 3 Decomposition | 257.2 | "Which brings us directly to the decomposition" | high |
| 4 Where This Sits | 391.5 | "that perfectly contextualizes where this ... draft sits, relative to what's already out there" | high |
| 5 VI / Bayes by Backprop | 461.1 | "So how do we actually compute this Bayesian decomposition? The article outlines three distinct methods" | high |
| 6 MC Dropout + predictive stats | 617.0 | "This is where the article pivots to Method 2, Monte Carlo dropout" | high |
| 7 PyTorch + forward passes | 737.8 | "To see this in practice, the article provides exact PyTorch code" | high |
| 8 Deep Ensembles | 882.3 | "which naturally sets up method three. Deep ensembles" (latency remark before it stays on slide 7) | high |
| 9 Ensemble Implementation | 923.1 | "But if you go this route, the ensemble implementation has a strict requirement for diversity" | high |
| 10 Trade-offs | 973.9 | "Let's do a quick head-to-head comparison" | high |
| 11 Asymmetric Sizing | 1032.9 | "All right, so we have our decomposition ... Now for the payoff" | high |
| 12 Calibration | 1141.6 | "Now, all of this relies entirely on calibration" | high |
| 13 What Has To Be Measured | 1191.3 | "This brings us to a necessary reality check" | high |
| 14 Practical Tips | 1264.1 | "for engineers looking to put this architecture into production anyway ... rapid fire practical tips" | high |
| 15 Caveats + Conclusion | 1326.4 | "But we have to be honest about the limitations and caveats" | high |

Long slides split into sub-scenes: 1 (2), 2 (3), 3 (2), 5 (2), 6 (2), 7 (3), 11 (2), 15 (3).
