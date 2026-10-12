# asymmetric-garch-crypto-leverage (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = host who asks and summarizes, H2 = expert host), 15-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/asymmetric-garch-crypto-leverage.en.md` (2026-07-11; Part 2 of the GARCH series).

- Audio: `input/notebooklm-sources/asymmetric-garch-crypto-leverage/en/audio.m4a`, 1140.49 s (19:00.5), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has `words[]` with per-word start/end). Timestamps below are segment starts in seconds, accurate to about 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes") to `timeline.json`. `timeline_auto_evensplit.json` is the failed `sync_slides.py` output, reference only.
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: light warm-grey paper (#F1F0EC) with a faint grey grid, dark slate text (#2B333D), teal (#2BB5C8) for data lines and math symbols, green (#3E9A6A, mint fill #DCEBDD) for highlights and takeaways, mustard (#D79B2E) for caveats, warnings and accent shadows under callout boxes. Thin corner-bracket frames around panels. Code in dark navy panels (#26303B) with syntax colors. Formulas are LaTeX-style serif math. Titles switch between a clean grotesk (slides 1 to 5, 7, 13) and a monospace (slides 6, 9 to 12, 14, 15). Small "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper, do not caption verbatim): "Garche" / "E-Garche" / "E-garge" / "Garch Optimizer" = GARCH / EGARCH; "JJR" (493.8) = GJR; "EngelNG Sign-Vias test" / "Sign-Vias" = Engle-Ng sign-bias; "Glouceton, Jaganathan, and Runkel" / "Gloucestershire and Jagannath and Runkel" = Glosten, Jagannathan and Runkle; "new" = ν (nu); "ketosis" (624.0) = kurtosis; "belcher" (575.2) = bell curve; "sine term" / "sine convention" = sign; "Kupiak" = Kupiec; "Christopherson" = Christoffersen; "debold Mariano" = Diebold-Mariano; "SKU-T" = skew-t; "try-accept" = try/except; "Bollarslev" = Bollerslev; "Kevin Shepard" = Kevin Sheppard; "MM article" (24.7) = MarketMaker article; "GARC recursion" = GARCH recursion; "out a sample" = out of sample; "VAR" = VaR. At 35.7 the host reads an internal snapshot ID ("EN761D601D5B34"): do not show it. The hosts read section headings aloud ("testing for asymmetry before you model it", "E-garch modeling log variance with no positivity constraints", "Kupiec and Christoffersen"), which are reliable slide-change markers.

---

## Slide 1: Title + The Leverage Effect. 0.0 to 203.2 (203.2 s)

**Content**
- Upper chart: a grey Gaussian bell curve (peak top center). A teal noisy return series runs in from the left at about 2/3 height, then crashes straight down through the left flank of the bell and below the baseline (jagged spikes). Labels with braces/dots: "Kurtosis Excess" (brace above the last spikes before the drop), "Asymmetrical Shock & "Fat Tail"" (brace to the right of the drop), "Kurtosis Excess" (brace left of the crash spikes below the baseline), "Volatility Spike > Gaussian Model" (dot), "Real-World Event (e.g., Crypto Crash)" (dot at the lowest point), "Gaussian Tail (Theoretical)" braces at both bell tails. Light teal shading under the left tail.
- Title (dark sans): "Asymmetric and Heavy-Tailed GARCH: EGARCH, GJR, and Student-t".
- Subtitle (grey): "Fixing the structural defects of GARCH(1,1) for honest VaR and Expected Shortfall in crypto."
- Thin rule, then section heading: "The Leverage Effect, and Why Crypto Is Messier".
  - "• **The Equity Baseline** (Black, 1976): Bad news lowers equity value, raises leverage, and spikes future volatility more than equally-sized good news."
  - "• **The Crypto Reality:** No corporate balance-sheet leverage. Asymmetry persists via forced liquidations of over-collateralized loans and perp longs."
  - Mustard left bar: "**The Messy Caveat:** Violent up-moves (squeezes, ETF gaps) also spike volatility. Asymmetry must be treated as an empirical question, not a strict law."

Article check: text matches the intro and "The Leverage Effect, and Why Crypto Is Messier". The top diagram is conceptually muddled (a time series drawn over a density, "Kurtosis Excess" used twice). Redraw as two clean visuals: (1) a Gaussian vs a fat-tailed density with visibly more mass in the left tail; (2) a return series with a crash spike that breaks a ±2σ Gaussian band.

**Sub-scenes (slide > 90 s)**
- 1a Cold open: the blurry X-ray 0.0 to 58.4 (X-ray gag: a broken arm is binary, crypto risk is a blur; title reveal at 24.7)
- 1b Two fatal flaws of GARCH(1,1) 58.4 to 107.5 (+5% and −5% squared to the same number; Gaussian bell vs reality; "honest VaR and ES")
- 1c Leverage effect 107.5 to 167.8 (equities: debt/equity seesaw; crypto: liquidation cascade)
- 1d Crypto is messier 167.8 to 203.2 (short squeeze rocket; "treat asymmetry as an empirical question")

**Beats**
- 0.0 "a medical diagnosis ... pure precision"; 6.1 "You break your arm, the X-ray shows that jagged white line" (X-ray of a broken bone); 12.4 "broken or not broken"
- 16.9 "financial risk modeling, especially in the crypto markets ... that X-ray machine is just a complete blur" (X-ray blurs)
- 24.7 "an article titled Asymmetric and Heavy-Tailed GARCH, EGARCH, GJR and Student-t" (title reveal; skip the snapshot ID at 35.7)
- 42.9 "why they fail so spectacularly when things get ugly"; 50.6 "EGARCH, GJR and Student-t distributions can actually keep you from going broke"
- 60.9 "plain old GARCH(1,1) ... two fatal flaws"
- 69.3 "it treats a plus 5% day exactly like a minus 5% day"; 74.0 "Because it just squares the shocks" ((+5)² = (−5)² = 25 animation)
- 76.3 "it assumes normal Gaussian market behavior" (bell curve)
- 87.4 "upgrade those baseline models to actually capture asymmetry and heavy tails"; 96.3 "Honest value at risk, or VaR, and expected shortfall"
- 101.0 "If you're going to survive the left tail ... you need a model that actually believes the left tail exists" (left tail lights up)
- 107.5 "let's start with this concept of asymmetry. The leverage effect and why crypto is messier" (section heading)
- 113.4 "Fischer Black in 1976"; 119.2 "if a company's stock price drops, their debt-to-equity ratio ... rises" (seesaw: equity down, debt/equity up); 130.6 "bad news equals higher volatility"
- 133.7 "crypto doesn't have traditional corporate balance sheets"; 142.5 "a remarkably similar effect through forced liquidations"
- 147.4 "over-collateralized loans get liquidated"; 151.8 "Perpetual futures longs are force closed, funding rates flip" (domino cascade); 156.8 "violently feeds the volatility"
- 166.1 "Bad news hits harder than good news"
- 174.7 "they can violently explode upwards, too"; 178.8 "a massive short squeeze or a leverage-fueled melt-up" (rocket also spikes vol)
- 195.0 "treat asymmetry as an empirical question"; 199.3 "test your data to see if it's there before you model it" (Messy Caveat bar)

## Slide 2: Testing for Asymmetry Before You Model It. 203.2 to 268.4 (65.2 s)

**Content**
- Title: "Testing for Asymmetry Before You Model It"; subtitle "Run the Engle-Ng (1993) sign-bias tests on a fitted symmetric GARCH to prove asymmetry exists before adding parameters."
- Left, bracket header "THEORY & DIAGNOSTIC", corner-bracket frame. Formula: `z_t² = a₀ + a₁·S⁻_{t−1} + a₂·S⁻_{t−1}·ε_{t−1} + a₃·S⁺_{t−1}·ε_{t−1} + u_t` with a₁, a₂, a₃ on mint highlight. Teal leader lines: from S⁻ to "Indicator for negative shocks: 1{ε_{t−1} < 0}" (indicator in teal); a₁ → "Sign-bias"; a₂ → "Negative-size-bias"; a₃ → "Positive-size-bias".
- Right, header "EXECUTION", dark code panel:

```python
import statsmodels.api as sm

def sign_bias_test(symmetric_res):
    z = symmetric_res.std_resid.dropna()
    z2 = (z ** 2).values[1:]
    eps_lag = z.values[:-1]
    neg = (eps_lag < 0).astype(float)
    X = np.column_stack([np.ones_like(eps_lag),
        neg, neg * eps_lag, (1 - neg) * eps_lag])
    ols = sm.OLS(z2, X).fit()
    return ols
```

- Mint box: "TAKEAWAY / A significant joint F-test provides empirical license to proceed to GJR or EGARCH."

Article check: matches (article code also prints coef/t/p and `ols.f_pvalue`; called as `sign_bias_test(models["GARCH-N"])`). S⁺ = 1 − S⁻. If F is insignificant, stay symmetric and save two parameters; significant is "the common outcome for BTC/ETH". On the slide the "Sign-bias" leader is wired near the a₂ position; keep a₁ = sign bias, a₂ = negative size bias, a₃ = positive size bias.

**Beats**
- 203.2 "testing for asymmetry before you model it" (slide in)
- 211.9 "a brilliant little check from 1993 called the Engle-Ng sign-bias test"
- 218.8 "fit a dumb, plain, symmetric GARCH model to your data"; 224.6 "take its squared, standardized residuals"; 227.6 "the leftover errors the model couldn't explain" (z² dots scatter)
- 231.3 "a simple regression of those against the sign and the size of the previous day's actual shock" (formula writes in)
- 236.5 "checking to see if your dumb model systematically missed something based on whether the market went up or down"
- 245.0 "Sign bias, negative size bias, and positive size bias" (three labels pop in order)
- 249.7 "a joint F test on all three"; 253.0 "for BTC and ETH it almost always does" (F-test stamp "significant")
- 264.5 "your empirical license to add complexity" (Takeaway box)

## Slide 3: GJR-GARCH: Asymmetry via a Threshold Term. 268.4 to 413.1 (144.7 s)

**Content**
- Title (in a corner-bracket frame): "GJR-GARCH: Asymmetry via a Threshold Term". Line: "An extension to GARCH allowing negative and positive shocks to have different effects on volatility."
- Big formula: `σ_t² = ω + α·ε²_{t−1} + γ·I_{t−1}·ε²_{t−1} + β·σ²_{t−1}` (the γ I ε² term in green).
- From the γ I term: an upper elbow arrow "Switch ON (I_{t−1} = 1):" → bracket "If ε_{t−1} < 0. / Impact is α + γ."; a lower elbow arrow "Switch OFF (I_{t−1} = 0):" → bracket "If ε_{t−1} ≥ 0. / Impact is α." (A green connector from the end of the formula to the upper bracket is a layout artifact; only γ I ε² switches.)
- Callout box with mustard drop shadow, mustard arrows to both brackets: "**Sign Convention:** γ > 0 means negative shocks raise volatility more. γ = 0 collapses to symmetric GARCH."
- Bottom grey panel "Positivity and Stationarity Constraints", three columns: "**Positivity:** ω > 0, α ≥ 0, α + γ ≥ 0, β ≥ 0. (Note: γ can be negative if α+γ ≥ 0)." | "**Covariance Stationarity:** α + β + 1/2γ < 1" | "**Long-run Variance:** σ̄² = ω/(1 − α − β − 1/2γ)".

Article check: matches (Glosten-Jagannathan-Runkle 1993, aka TGARCH; γ < 0 = rare melt-up regime; the ½ assumes P(z < 0) = ½; with skew-t it becomes P(z < 0)).

**Sub-scenes (slide > 90 s)**
- 3a The tripwire 268.4 to 339.8 (formula; tripwire gag: good news walks past α, bad news trips γ)
- 3b Guardrails 339.8 to 413.1 (positivity rules tick, then stationarity α + β + ½γ < 1)

**Beats**
- 268.4 "Assuming we get that green light, we move to the fixes"; 270.9 "GJR-GARCH ... asymmetry via a threshold term" (slide in)
- 275.9 "developed by Glosten, Jagannathan, and Runkle in 1993"
- 281.1 "all squared shocks are treated equally using a parameter we call alpha" (α ε² term)
- 288.2 "GJR changes the game by adding an indicator variable"; 291.4 "Like a tripwire" (good gag scene: a laser tripwire across the negative side)
- 294.4 "If the shock is positive ... just handled by that standard alpha" (Switch OFF branch)
- 298.0 "if the shock is negative, it trips that mathematical threshold"; 303.9 "activates ... gamma" (Switch ON branch, alarm)
- 307.6 "good news, you just walk right past alpha. Bad news, you trip the wire and the gamma alarm goes off"
- 313.9 "the total impact of bad news becomes alpha plus gamma"
- 319.4 "That gamma parameter is the entire asymmetry story"; 323.2 "If gamma is strictly greater than zero ... downside asymmetry" (Sign Convention box)
- 332.3 "if gamma equals zero? The tripwire vanishes ... collapses right back into a standard symmetric GARCH"
- 339.8 "positivity and stationarity"; 346.4 "you literally cannot have negative volatility"
- 355.5 "Because GJR uses simple addition, we need constraints"
- 365.8 "omega must be strictly greater than zero"; 370.3 "alpha ... greater than or equal to zero"; 373.8 "alpha plus gamma, must also be greater than or equal to zero" (positivity column ticks)
- 390.3 "your persistence has to be bounded"; 394.7 "half the shocks are negative ... alpha plus beta plus one half of gamma must be strictly less than one" (stationarity column)
- 406.1 "If it hits one? Your volatility shocks never decay. The model just breaks"

## Slide 4: EGARCH: Modeling log-Variance, No Positivity Constraints. 413.1 to 557.8 (144.7 s)

**Content**
- Title (bracket frame): "EGARCH: Modeling log-Variance, No Positivity Constraints".
- Left: formula `log σ_t² = ω + β·log σ²_{t−1} + α(|z_{t−1}| − E|z_{t−1}|) + γ·z_{t−1}` (α and γ on mint highlight; underbraces under β log σ², the α(...) term and γ z, with leader lines).
- Three bracketed rows:
  - "**Magnitude Term [α]:** Responds to shock size. Centered so an average shock contributes nothing."
  - "**Sign Term [γ]:** Is linear. A negative z_{t−1} pushes log-variance in the opposite direction from a positive one."
  - "**Constraints:** Because it models log-variance, σ_t² is strictly positive by exponentiation. Stationarity only requires |β| < 1."
- Box with mustard shadow: "**The Sign Convention Trap:** In EGARCH, γ < 0 denotes the leverage effect (the exact opposite of GJR)."
- Right (vertical divider): "The News Impact Curve" chart, axes through the origin, three unlabeled curves meeting at the origin: grey symmetric parabola, teal asymmetric V (left arm much steeper, right arm bending flatter), another grey asymmetric curve. Caption: "Visualizes asymmetry: EGARCH yields an asymmetric exponential V-shape."

Article check: matches (Nelson 1991; E|z| = √(2/π) ≈ 0.7979 for a normal; EGARCH reacts exponentially, so more violently to large shocks, and can give implausibly large forecasts after an outlier day). Wiring glitch: the β log σ² underbrace leader merges into the "Magnitude Term" label; the magnitude term is the α(...) term only. The chart's curves are unlabeled; per the article the three are GARCH-N (symmetric parabola), GJR (parabola with a kink at 0, left arm steeper), EGARCH (exponential V, left arm higher). Curves should not touch zero at the origin: at ε = 0 the variance is still ω + β·σ̄² > 0.

**Sub-scenes (slide > 90 s)**
- 4a The log trick 413.1 to 463.9 (log goes negative, exp brings it back positive; magnitude vs sign terms)
- 4b Sign trap and stationarity 463.9 to 504.2 (γ flips sign vs GJR; exponential reacts violently; |β| < 1)
- 4c News impact curve 504.2 to 557.8 (plot three curves; sanity check of the sign)

**Beats**
- 413.1 "Managing all those rigid inequality constraints ... a massive headache. But there's a workaround"
- 419.9 "EGARCH, modeling log variance with no positivity constraints" (slide in); 424.4 "Nelson's exponential GARCH from 1991"
- 431.7 "Is taking the log just a math cheat code ...?"; 436.0 "It absolutely is a math cheat code" (cheat-code gag)
- 438.5 "A logarithm can drop into negative numbers ... when you exponentiate it back out ... it always turns into a positive number" (log axis dips below 0, exp() arrow maps it back above 0)
- 450.0 "you totally bypass those annoying positivity constraints" (constraint chains fall off)
- 455.6 "a magnitude term for the pure size of the shock and a sign term for the asymmetry" (two underbraces light up)
- 463.9 "a massive trap here for anyone actually coding this"; 468.0 "The sign convention is totally flipped"
- 472.9 "In GJR, a positive gamma meant the leverage effect, but in EGARCH's standard convention, a negative gamma indicates the leverage effect" (Sign Convention Trap box; GJR γ>0 vs EGARCH γ<0 side by side)
- 484.8 "because EGARCH exponentiates the shock ... it reacts much more violently to large outliers than the additive GJR model"
- 496.7 "Much simpler"; 498.2 "beta just needs to be strictly less than one" (|β| < 1)
- 504.2 "the news impact curve from Engle and Ng"; 510.0 "tomorrow's expected variance on the y-axis against today's market shock on the x-axis" (axes draw)
- 517.0 "a symmetric GARCH, you get a perfect U-shape"; 521.1 "A plus 5% shock and a minus 5% shock land at the exact same height" (grey parabola)
- 525.3 "GJR ... a U-shape with a sudden kink right at zero"; 530.8 "The left side is noticeably steeper" (GJR curve)
- 535.2 "EGARCH, you get an asymmetric exponential V-shape" (teal V)
- 540.0 "your visual sanity check"; 546.7 "If the left arm of your EGARCH V-shape is sitting lower than the right arm ... a rare up-volatility regime or you just got the negative sign backwards in your code"

## Slide 5: Heavy Tails: Student-t and Skewed-t Innovations. 557.8 to 687.7 (129.9 s)

**Content**
- Title (bracket frame): "Heavy Tails: Student-t and Skewed-t Innovations".
- Line: "**The Flaw:** A Gaussian 99% VaR uses quantile -2.326. A Student-t true 1% quantile is near -3.36. Gaussian models are blindly optimistic."
- Left chart "The Danger Zone": grey filled Gaussian (tallest, tails drop to zero), a teal and a mustard fat-tailed curve (lower peaks, tails stay above the axis; the mustard right tail is the highest), light mustard shading on the left tail region. Callout with a dot and an arrow to a circle on the left tail: "**Deep Left Tail:** The Gaussian model drops to zero while t-curves retain thick probability mass."
- Right, two boxes with grey headers and mustard shadows:
  - "Standardized Student-t": "• Must be standardized to unit variance. Requires degrees-of-freedom ν > 2." "• Crypto daily returns typically land at ν ≈ 3 to 6 (heavy tails, finite kurtosis)." "• Log-likelihood Jacobian term: −1/2 log σ_t²" (mint highlight).
  - "Hansen's Skewed-t": "• Adds skewness parameter λ ∈ (−1, 1)." "• λ < 0 yields a left-skewed distribution (heavier downside), aligning with crypto crash dynamics." "• Mis-modeling the left tail is uniquely costly due to the asymmetry of position loss vs profit recovery."

Article check and corrections: (1) "Student-t true 1% quantile near −3.36" comes from the article, but −3.365 is the RAW t(5) 1% quantile. A unit-variance (standardized) t(5) has a 1% quantile of about −3.365/√(5/3) ≈ −2.61, only ~12% beyond −2.326. The article's "optimistic by roughly 44%" inherits the same slip. The large gap between t and Gaussian at equal variance shows up in Expected Shortfall and deeper quantiles. On screen, compare shapes (thin vs fat tail) and avoid the "−2.326 vs −3.36" headline, or label it "raw t(5)". (2) "finite kurtosis" for ν ≈ 3 to 6 is wrong for ν ≤ 4: finite variance needs ν > 2, finite kurtosis needs ν > 4 (article: "usually finite kurtosis"). (3) The skew-t chart is backwards: the mustard curve has the heaviest RIGHT tail, while λ < 0 means a heavier LEFT tail. Redraw with the left tail heavier. (4) The last skew-t bullet (loss vs profit recovery) is NotebookLM's own addition, not in the article. Article: standardized t density with (ν − 2) inside; Hansen (1994) skewed-t; λ = 0 recovers t; `dist='t'`, `dist='skewt'`.

**Sub-scenes (slide > 90 s)**
- 5a The Gaussian flaw 557.8 to 599.3 (thin tails, five-sigma events, "fitting the shoulders")
- 5b Student-t 599.3 to 651.5 (ν dial: smaller ν fattens tails; ν > 2, ν > 4 thresholds; standardize to variance 1)
- 5c Hansen's skewed-t 651.5 to 687.7 (λ < 0 bends mass into the left tail)

**Beats**
- 557.8 "GJR and EGARCH fix the direction of the market"; 561.1 "let's talk about heavy tails. Student-t and skewed-t innovations" (slide in)
- 567.4 "What happens when the market completely falls off a cliff?"
- 570.3 "those asymmetry models still fail there if they assume a normal bell curve for the size of the shocks"
- 581.2 "a 99% value at risk uses a quantile of minus 2.326" (quantile line on the Gaussian)
- 588.6 "vastly underprices how often five sigma events happen in crypto"
- 593.5 "fitting your model perfectly to the shoulders of the bell curve, but completely ignoring the extremes" (shoulders glow, tails dark)
- 599.3 "the standardized Student-t distribution"; 603.3 "a degrees of freedom parameter, called nu"; 608.0 "a smaller nu means fatter tails" (ν slider, tails thicken)
- 611.0 "For crypto, nu is typically estimated somewhere between three and six" (ν band 3 to 6)
- 619.0 "Nu must be strictly greater than two for ... finite variance"; 624.0 "If nu drops below four, your kurtosis is actually infinite" (markers at ν = 2 and ν = 4)
- 628.2 "standardize it so the variance equals exactly one"; 633.9 "like recalibrating a scale" (scale gag) (see errors: ν−2 is in the density, not in the Jacobian)
- 651.5 "Student-t ... still symmetrical. What if the left tail is physically heavier ...?"
- 658.8 "Hansen's skewed-t distribution from 1994"; 662.8 "a skewness parameter called lambda, ranging from minus one to one" (λ slider)
- 669.3 "a lambda less than zero creates a left skewed distribution"; 672.9 "The left tail, the crashes, is physically heavier than the right tail melt-ups" (left tail swells)
- 678.1 "recovering from a massive loss requires a disproportionately larger profit" (−50% needs +100%; NotebookLM addition, fine as color)

## Slide 6: Python Implementation. 687.7 to 727.1 (39.4 s)

**Content**
- Title (mono, grid paper, outlined frame): "Python Implementation".
- "Setup and Data": mustard-bracket note "**Crypto Caveat:** Scale daily returns by 100 for numerical conditioning. Annualize by 365 days, not 252." Code panel:

```python
import numpy as np
import yfinance as yf

px = yf.download('BTC-USD', start='2019-01-01')['Close'].dropna()
ret = 100.0 * np.log(px / px.shift(1)).dropna()
```

- "Fitting Four Models" code panel:

```python
from arch import arch_model

def fit(returns, vol, o=0, dist='normal'):
    am = arch_model(returns, mean='Constant', vol=vol, p=1, o=o, q=1, dist=dist)
    return am.fit(disp='off')

models = {
    'GARCH-N':   fit(r, vol='Garch',  o=0, dist='normal'), # Baseline
    'GJR-t':     fit(r, vol='Garch',  o=1, dist='t'),      # Asymmetry + tails
    'EGARCH-t':  fit(r, vol='EGARCH', o=1, dist='t'),      # Log-var asymmetry
    'GJR-skewt': fit(r, vol='Garch',  o=1, dist='skewt'),  # + skew
}
```

- Teal callouts with leaders: "EGARCH Model" and "Student-t Distribution".

Article check: matches the article's setup and the four models. Slide glitches: the "EGARCH Model" leader points at the GJR-t row's `vol='Garch'`, and "Student-t Distribution" points near row 1's `dist='normal'`. Point them at `vol='EGARCH'` (row 3) and `dist='t'` (rows 2 and 3). The setup defines `ret` but the models use `r`. The article uses `r = fetch_returns("BTC-USD")` with start 2019-01-01, end 2025-12-31; `o=1` turns on the GJR term; for EGARCH `o` is the γz term.

**Beats**
- 687.7 "how do we actually build this? The Python implementation" (slide in)
- 690.3 "Kevin Sheppard's arch library" (library chip)
- 698.3 "Numerical hygiene"; 699.8 "scale your daily log returns by 100 to convert them into percentages"; 705.5 "If you feed raw decimals to a GARCH optimizer, it chokes" (optimizer gag)
- 709.3 "annualize by 365 days, not the stock market's 252"; 714.3 "Because crypto never sleeps" (Crypto Caveat note)
- 716.4 "fitting four models for comparison"; 718.7 "a baseline GARCH normal, a GJR with Student-t, an EGARCH with Student-t, and a GJR with Hansen's skewed-t" (the four rows highlight in turn)

## Slide 7: Reading the GJR Fit + Comparing Models by Information Criteria. 727.1 to 786.7 (59.6 s)

**Content**
- Left title: "Reading the GJR Fit (Illustrative BTC Data)". Dark table (mono, numbers teal):
  - header "coef | std err | t | P>|t|"
  - "omega 0.0480 0.017 2.82 0.005"
  - "alpha[1] 0.0620 0.018 3.44 0.001"
  - "gamma[1] 0.0910 0.028 3.25 0.001"
  - "beta[1] 0.8850 0.021 42.1 0.000"
  - "nu 4.30 0.55 7.82 0.000"
  - Elbow connectors to bullets: "• gamma is significant (t > 3). Bad news impact = α + γ = 0.153. Good news impact = α = 0.062. (~2.5x variance asymmetry)." "• nu = 4.3 confirms heavy tails." "• Persistence: α + β + 1/2γ = 0.062 + 0.885 + 0.0455 = 0.993 (highly clustered)." (results in green)
- Right title: "Comparing Models by Information Criteria". Flowchart: "Model Fits Computed" splits to a red box "Log-Likelihood Alone" → "Reject: Always rewards complexity." and a green box "BIC (Bayesian Information Criterion)" → "Accept: Penalizes parameter count."
- Bottom box: "Rule of Thumb for BIC: Improvement > 6 is strong evidence. 1−2 points is noise. If GJR-t beats GARCH-N by 30 but skew-t only adds 1 point, drop the skew."

Article check: numbers match the article's illustrative table (not a real experiment; say "illustrative" on screen). Slide glitch: the bullets print raw LaTeX ("\alpha", "\gamma", "\beta"); render as α, γ, β. Article also: AIC and BIC (BIC penalizes more), neither replaces out-of-sample validation.

**Beats**
- 727.1 "reading the output of a GJR fit"; 730.3 "an illustrative parameter table ... These aren't empirical results" (table slides in with an "illustrative" tag)
- 737.0 "a gamma of 0.091"; 742.3 "greater than zero in GJR, that confirms the downside leverage effect" (gamma row glows)
- 746.6 "Bad news moves volatility roughly two and a half times more than good news" (bars 0.153 vs 0.062)
- 751.0 "an illustrative nu of 4.3, proving the fat tails" (nu row)
- 755.9 "the persistence ... roughly at 0.993, meaning volatility shocks linger" (sum animates)
- 762.5 "to compare these models fairly, we use information criteria" (right flowchart)
- 766.2 "You don't just look at log likelihood, because that always improves when you add parameters" (red branch)
- 771.6 "AIC and BIC to actively penalize complexity" (green branch)
- 778.0 "A BIC improvement of more than six points ... is strong evidence"; 782.3 "only one or two points, it's just statistical noise" (rule-of-thumb box)

## Slide 8: Plotting the News Impact Curve + Side-by-Side Comparison. 786.7 to 816.5 (29.8 s)

**Content**
- Title: "**Plotting** the News Impact Curve".
- Chart (grid; y axis "σ_t²", x axis "Last shock ε_{t−1}"); legend: GARCH-N (light grey), GJR-t (mustard), EGARCH-t (teal). Grey symmetric parabola; mustard GJR curve with a long left arm up to the top left, a small notch just left of 0, and a gentle right arm (much lower than the left); teal EGARCH V with steep arms, its RIGHT arm exits the top first. A callout with a circle on the teal right arm: "**Visual Verification:** If EGARCH's left arm sits above its right, the leverage effect is confirmed and the negative sign convention is verified."
- "A Side-by-Side Comparison of the Four Models" table (mono):
  - "Property | GARCH-N | GJR-t | EGARCH-t | GJR-skewt"
  - "Asymmetry | none | threshold | signed | threshold" (mustard)
  - "Tails | Gaussian | Student-t | Student-t | skewed-t" (teal)
  - "Constraints | yes | yes | none | yes" ("none" green)
  - "Stationarity | α+β < 1 | α+β+1/2γ < 1 | |β| < 1 | α+β+P(z<0)γ < 1"
- Footer: "**Synthesis Insight:** The jump from GARCH-N to GJR-t contains almost all the risk-calibration improvement. Further refinements are often second-order noise."

Article check and **chart error**: the teal EGARCH curve is drawn with its right arm steeper/higher, and the callout circle sits on the right arm. That is the opposite of the leverage effect the callout describes. Redraw EGARCH with the LEFT arm higher (and GJR with a slope change at 0, not a notch). No curve should touch zero at the origin. Article table extra rows to add if space allows: "Skew in innovation: no / no / no / yes (λ)", "Extra params vs baseline: 0 / γ,ν / γ,ν / γ,ν,λ", "Typical crypto verdict: fails VaR backtest / strong, robust / strong, robust / marginal over GJR-t". Article example shocks: ±6%.

**Beats**
- 786.7 "plotting the news impact curve is the payoff?" (chart draws: grey, then mustard, then teal)
- 790.1 "A side-by-side comparison of the four models instantly proves if your asymmetry term is working" (table rows reveal)
- 798.1 "moving from a plain, normal GARCH to a Student-t with asymmetry is where you gain roughly 90% of your risk calibration power" (big arrow from GARCH-N column to GJR-t column; see errors: "90%" is the hosts' number)
- 808.2 "Swapping to EGARCH or adding Hansen's skew-t are often just second-order marginal tweaks" (small arrows to the last two columns)
- 814.7 "Spend your modeling budget wisely" (Synthesis Insight)

## Slide 9: Risk Application: VaR and Expected Shortfall. 816.5 to 873.9 (57.4 s)

**Content**
- Title (mono, boxed): "Risk Application: VaR and Expected Shortfall".
- Left panel "Risk Threshold Graphic": bell curve; a vertical mustard line in the left tail, label "VaR Threshold: −F_z^{-1}" with a circle on top; the area left of it filled green, brace label "Expected Shortfall Integral" (green).
- Right box "From Conditional Distribution to VaR": "▪ Return formula: r_{t+1} = μ_{t+1} + σ_{t+1} z_{t+1}" "▪ VaR formula: VaR_α(t+1) = −(μ_{t+1} + σ_{t+1} F_z^{-1}(1−α))" "▪ VaR is an affine transform of the standardized distribution quantile."
- Right box "Expected Shortfall (ES)": "▪ Captures average loss conditional on breaching VaR. Coherent (subadditive) metric used by Basel." "▪ Formula: ES_α(t+1) = −(μ_{t+1} + σ_{t+1} E[z | z ≤ F_z^{-1}(1−α)])" "▪ The t-distribution tail is fatter. ES reveals the extreme downside Gaussian models actively hide." (formula symbols teal)

Article check: formulas match. The threshold label "−F_z^{-1}" is sloppy: the line sits at the return quantile q = μ + σ·F_z⁻¹(1−α) and VaR = −q. Use "VaR = −(μ + σ·F_z⁻¹(1−α))". Article extras: Gaussian tail mean E[z | z ≤ q] = −φ(q)/(1−α); standardized-t tail mean = −((ν + q²)/(ν − 1))·g_ν(q)/(1−α); ES ≈ CVaR (the objective of the HRP/CVaR pipeline); Basel moved to ES.

**Beats**
- 816.5 "risk application. VaR and expected shortfall" (slide in)
- 820.8 "We model volatility to forecast one day ahead tail risk"
- 825.4 "from the conditional distribution to VaR"; 828.7 "the negative of the expected mean plus the forecasted volatility multiplied by the quantile of the standardized distribution" (VaR formula assembles term by term)
- 838.3 "the real-world impact is huge"; 840.5 "your 99% quantile pushes way out"; 846.0 "from the Gaussian minus 2.33 to something like minus 3.3" (threshold line slides left; see errors re −3.3)
- 852.2 "an honestly larger, safer VaR"
- 855.4 "But VaR is just a threshold"; 858.1 "Expected shortfall goes beyond the breach"; 860.6 "the average loss conditional on breaching that VaR" (green area fills)
- 864.0 "mathematically integrating the conditional tail expectation"
- 867.8 "Because Student-t tails are so much fatter, the expected shortfall gap over a Gaussian model is brutally large" (Gaussian ES vs t ES bars)

## Slide 10: Computing VaR and ES from a Fitted arch Model. 873.9 to 917.4 (43.5 s)

**Content**
- Title (mono, boxed): "Computing VaR and ES from a Fitted arch Model".
- Code panel (with leaders to bullets on the right):

```python
z_q = dist.ppf(1 - alpha)  # Standardized quantile
var = -(μu + sigma * z_q)

# ES via numerical integration
num, _ = scipy.integrate.quad(lambda z: z * pdf(z), -30, z_q)
es_z = num / (1 - alpha)
es = -(mu + sigma * es_z)
```

- Bullets: "▪ Gaussian uses z_q ≈ -2.33." "▪ Student-t (ν ≈ 4.3) pushes it to ≈ -3.3." "▪ Result: Materially larger, honest VaR."
- Mustard-bracket box: "CAVEAT: One Step vs Multi-Step" ("CAVEAT" mustard):
  - "▪ **Mean Reversion**: Variance forecasts revert to unconditional mean. Naive square-root-of-time scaling VaR(h) = √h·VaR(1) is dangerously wrong post-shock."
  - "▪ **Shape Change**: Summing t-distributed daily shocks does not yield a multi-day t-distribution."
  - "▪ **The Honest Route**: Multi-horizon VaR requires simulation of innovation paths, not analytic one-step formulas."

Article check: typo "μu" → "mu". The article passes dist params: `dist.ppf(1 - alpha, dp)`; `integrate.quad(..., -30, z_q, limit=200)`. "≈ −3.3" for t(4.3) repeats the raw-vs-standardized slip (standardized ≈ −2.6; see slide 5). The h-step variance is the sum of per-step forecasts converging to σ̄²; √h scaling only holds when volatility sits at its long-run mean.

**Beats**
- 873.9 "To compute VaR and ES from a fitted arch model ... use the ppf or quantile method" (line 1 highlights)
- 882.3 "for expected shortfall, you use numerical integration across the tail"; 887.4 "works uniformly across normal, Student-t, and skew-t" (integral area sweeps)
- 891.8 "can't I just take my one day VaR and multiply it by the square root of time for a 10-day VaR?" (√10 × VaR appears)
- 899.7 "Absolutely not"; 901.0 "Variance mean reverts" (√h line struck through, curved forecast line bends to σ̄)
- 902.4 "summing daily Student-t shocks through a nonlinear GARCH recursion doesn't yield a multi-day Student-t"
- 910.9 "For multi-step, you must use simulation" (fan of simulated paths); 913.6 "The analytic formulas are exactly for one step ahead only"

## Slide 11: Backtesting VaR: Kupiec and Christoffersen. 917.4 to 955.0 (37.6 s)

**Content**
- Title (mono): "Backtesting VaR: Kupiec and Christoffersen".
- Bracket box: "Evaluate dynamically via walk-forward evaluation (out-of-sample). Never backtest VaR in-sample." (second sentence mustard)
- Flowchart: grey box "Backtest Violations sequence" ("Violations" teal) branches into:
  - grey-blue "Check 1: Rate" → green-outlined box "Kupiec's Unconditional Coverage (LR_uc)" / "Is the violation rate ≈ 1-α? (Did we get 1% breaches on a 99% VaR?)"
  - tan "Check 2: Independence" → mustard-outlined box "Christoffersen's Independence (LR_ind)" / "Are violations independent, or do they cluster? Evaluated via Markov transition counts."
  - both merge into a green box "Conditional Coverage (LR_cc = LR_uc + LR_ind)". Decorative connector lines loop around the panel.
- Bottom box "The Crypto Reality": "GARCH-Normal routinely fails Kupiec. GJR-t and EGARCH-t pass. If t-models fail Christoffersen (bunching during crash weeks), the volatility dynamics are still misspecified."

Article check: matches (Kupiec 1995, LR_uc ~ χ²₁; Christoffersen 1998, LR_ind ~ χ²₁ from transition counts n_ij; LR_cc ~ χ²₂; violation I_t = 1{loss_t > VaR_t}). Overstatement: the article says GJR-t / EGARCH-t "passes or comes close", not a guaranteed pass.

**Beats**
- 917.4 "back testing VaR. Kupiec and Christoffersen" (slide in)
- 921.4 "a walk forward, out of sample evaluation" (out-of-sample box; "never in-sample" stamp)
- 927.9 "The Kupiec unconditional coverage test from 1995 asks, did you get the right rate of violations?"; 933.7 "exactly 1% of the time for a 99% VaR" (violation dots: ~1 in 100 days)
- 937.6 "the Christoffersen independence test from 1998 asks, did those violations bunch together in a crash" (dots cluster in one crash week)
- 944.9 "passing both gives you conditional coverage" (merge box)
- 948.1 "A model can pass Kupiec, but fail Christoffersen"; 951.6 "it blows up exactly when you need it most"

## Slide 12: Ranking Models by Tail Loss, Not Just Pass/Fail. 955.0 to 997.4 (42.4 s)

**Content**
- Title (mono, rule): "Ranking Models by Tail Loss, Not Just Pass/Fail".
- Left: formula `L_τ(r, q) = (τ − 1{r < q})(r − q)` (soft teal glow on r, q, τ). Bracket list:
  - "• **Pinball (Quantile) Loss:** Minimizing this rewards models that are well-calibrated and sharp (not lazily wide)." (green highlights)
  - "• **Expected Shortfall Wrinkle:** ES is not elicitable alone. Evaluate jointly with VaR (Fissler-Ziggel) or compare average breach magnitude to predicted ES." (mustard and cyan highlights)
- Right: "Basel Traffic-Light Claim (Attributed)" / "Over 250 trading days for 99% VaR". Three dial gauges: green arc, needle in green "Green: 0-4 violations / Acceptable model."; yellow arc, needle in yellow "Yellow: 5-9 violations / Scrutiny required."; red arc, needle in red "Red: 10+ violations / Model rejected, capital multipliers rise."

Article check: matches (τ = 1 − α; Diebold-Mariano test on per-day loss differences; ES checked jointly with VaR). The usual spelling is "Fissler-Ziegel"; the article writes "Fissler-Ziggel".

**Beats**
- 955.0 "ranking models by tail loss, not just pass fail" (slide in); 959.7 "pass fail is too binary"
- 961.6 "the strictly consistent pinball quantile loss and the Diebold-Mariano test to rank models" (formula writes in; pinball-machine gag)
- 967.4 "But there's an ES wrinkle"; 969.3 "Expected shortfall isn't elicitable on its own"
- 972.7 "evaluate VaR and ES jointly or manually check if average breach magnitudes match the model"
- 979.3 "the Basel traffic light approach"; 982.2 "Over 250 days, 0 to 4 violations is green, 5 to 9 is yellow, 10 or more is red" (gauges swing in order)
- 987.8 "an attributed claim reflecting regulatory language"; 993.5 "exactly how risk committees actually speak"

## Slide 13: Practical Considerations. 997.4 to 1041.6 (44.2 s)

**Content**
- Title (light grey sans, centered): "Practical Considerations".
- Three outlined columns with boxed headers and corner connector lines:
  - "Data Limits": "Illiquid/Short Samples: With < 500 days, standard errors explode. Symmetric GARCH-t is often the safest ceiling." / "Higher Frequency: Hourly/minute bars are dominated by microstructure. Plain daily-style GARCH fails regardless of asymmetry." (mustard and cyan highlights)
  - "Complexity Traps": "When Extra Parameters Do Not Pay Off." / "The Skew Illusion: Normal to Student-t is a massive gain. Student-t to skew-t is often just marginal noise." / "Add skew only when the BIC clearly demands it."
  - "Architectural Foundation": "These Are the Marginals Everyone Else Builds On." / "You extract these standardized residuals before fitting Copula models for joint crypto crypto risk or DCC-DCC-GARCH." / "Garbage marginals = garbage joint risk."

Article check: "< 500 days" is invented; the article says "a few hundred daily observations" give large standard errors on γ and λ, and "fitting skew-t EGARCH to 200 days is fooling yourself". Duplicated words: "joint crypto crypto risk or DCC-DCC-GARCH" → "Copula models for joint crypto risk, or DCC-GARCH". "Garbage marginals" is NotebookLM's paraphrase (fine). Article also: EGARCH vs GJR is usually a wash on daily data; pick by out-of-sample VaR backtest.

**Beats**
- 997.4 "practical considerations"; 999.8 "When do the extra parameters not pay off?" (slide in)
- 1003.1 "I'm skeptical of over complexity"
- 1005.6 "Illiquid or short samples can't support complex skew-t EGARCH models" (column 1)
- 1010.1 "The skew term, lambda, frequently doesn't justify its cost in BIC"; 1014.0 "EGARCH versus GJR is usually a wash on daily data" (column 2)
- 1019.2 "higher frequencies require completely different tools due to microstructure noise" (column 1 lower half)
- 1023.4 "these daily models are the marginals everyone else builds on" (column 3)
- 1027.5 "the exact building blocks for advanced joint risk copula models like DCC-GARCH and volatility targeting" (see errors: three separate things)
- 1035.9 "If you build joint risk on garbage symmetric Gaussian marginals, your joint VaR will be garbage" (garbage-in gag)

## Slide 14: A Distribution-Free Alternative and Numerical Hygiene. 1041.6 to 1080.4 (38.8 s)

**Content**
- Title (bracket frame): "A Distribution-Free Alternative and Numerical Hygiene".
- Left: shield icon (dark navy with teal checker quarters). Tree list: "A Distribution-Free Alternative" → "Conformal Prediction: Offers finite-sample coverage guarantees without parametric assumptions about tail shape." ("Conformal Prediction" teal) → "Use parametric GARCH-t for the full conditional density (ES), and conformal as a distribution-free cross-check for coverage."
- Right: box with dark header "[ Hygiene Checklist ]", inner bracket title "Numerical and Workflow Hygiene", items with teal check marks "[✓]":
  - "**Scaling:** Always scale returns by 100 for optimizer stability."
  - "**Persistence Limits:** Flag models where \α + +β + 1/2\γγ ≈ 0.999 (near-integrated; long-horizon forecasts break)." (mustard)
  - "**Convergence Fallbacks:** Wrap EGARCH fit() in try/except blocks to fallback on previous window parameters during rolling re-estimation."
  - "**Mean Model:** Default to constant mean; daily crypto returns are swamped by volatility."

Article check: matches the article's hygiene list and conformal section. Garbled formula → "α + β + ½γ above ~0.999 (near-integrated, IGARCH-like)". Article tone: long-horizon variance forecasts "become unreliable. Not necessarily wrong, but flag it" (not "break"). Article also: unscale VaR/ES when reporting in fractional units.

**Beats**
- 1041.6 "What about a distribution-free alternative?" (shield)
- 1044.3 "conformal prediction offers distribution-free prediction intervals"
- 1050.9 "alongside parametric GARCH as a complementary cross-check in production" (tree branch 2)
- 1057.2 "some final numerical and workflow hygiene tips" (checklist)
- 1061.0 "Always scale returns by 100" (✓1); 1062.9 "persistence summing to over 0.999 ... near-integrated" (✓2)
- 1070.4 "try/except blocks ... EGARCH rolling windows can fail to converge" (✓3)
- 1075.2 "don't waste computing power overmodeling the conditional mean" (✓4)

## Slide 15: Summary + References. 1080.4 to 1140.49 (60.1 s)

**Content**
- Two columns (bracket frame).
- Left "Summary" (mono bullets; teal and mustard keywords):
  - "• Plain GARCH(1,1) costs money via optimistic VaR; it ignores asymmetry and Gaussian tails."
  - "• GJR-GARCH captures asymmetry via threshold (\gamma > 0 = downside asymmetry); requires positivity constraints."
  - "• EGARCH captures asymmetry via log-variance (\gamma < 0 = downside asymmetry); avoids positivity constraints. Verified via News Impact Curve."
  - "• Student-t and Skew-t expose the true depth of crypto's left tail, inflating VaR and Expected Shortfall to honest levels." ("honest levels" green highlight)
  - "• Backtest out-of-sample with Kupiec and Christoffersen. Reject models that cluster violations. Add complexity only when BIC and walk-forward VaR demand it."
- Right "References": "Nelson (1991)", "Glosten et al. (1993)", "Bollerslev (1987)", "Hansen (1994)", "Engle & Ng (1993)", "Christoffersen (1998)", "Kupiec (1995)", "Black (1976)", "McNeil et al. (2015)", "Sheppard (arch, 2023)".

Article check: matches the summary and references. Raw LaTeX "\gamma" → γ. Wording: "ignores ... Gaussian tails" → "is symmetric and assumes Gaussian tails".

**Beats**
- 1080.4 "let's summarize" (slide in)
- 1082.2 "Plain GARCH is flawed for risk capital because it ignores asymmetry and fat tails" (bullet 1)
- 1088.2 "GJR-GARCH uses a threshold for bad news" (bullet 2); 1091.4 "EGARCH models log variance" (bullet 3)
- 1093.8 "Upgrading to Student-t or Hansen skew-t honestly prices the left-tail risk" (bullet 4)
- 1099.2 "back-testing out of sample with Kupiec and Christoffersen is absolutely mandatory" (bullet 5)
- 1104.7 "credit the foundational minds referenced in the bibliography"; 1108.4 names read in order (references column ticks down)
- 1120.5 "understanding the shape of the risk, how thick the tail is and whether the news impact is kinked or exponential" (callback: X-ray from the cold open now sharp)
- 1132.9 "Look at your own risk models. Are they telling you the truth about the left tail or just fitting the shoulders?"
- 1138.4 "Thank you for diving deep with us today" (end)

---

## NotebookLM errors and corrections (use the corrected version)

Slides:
1. Slide 1: top diagram mixes a time series with a density and repeats "Kurtosis Excess". Redraw as a Gaussian vs fat-tailed density plus a separate crash series.
2. Slide 4: news-impact mini chart is unlabeled and has a meaningless extra grey curve. Draw the three named curves (left arm higher for GJR and EGARCH), with σ² > 0 at ε = 0. The β-term leader wrongly merges into "Magnitude Term".
3. Slide 5: skew-t curve drawn with the heavier RIGHT tail (λ < 0 means heavier LEFT tail). "ν ≈ 3 to 6 (finite kurtosis)" is wrong for ν ≤ 4. "−3.36" is the raw t(5) quantile, not the standardized one (≈ −2.61); the article has the same slip ("optimistic by roughly 44%"). Loss-vs-recovery bullet is not in the article.
4. Slide 6: callout leaders point at the wrong rows (EGARCH → GJR row; Student-t → normal). Variable `ret` vs `r` mismatch.
5. Slide 7, 14, 15: raw LaTeX leaks ("\alpha", "\gamma", "\α + +β + 1/2\γγ"). Render proper symbols.
6. Slide 8: EGARCH curve drawn with the RIGHT arm higher while the callout says the left arm should be higher (and the circle sits on the right arm). Redraw with the left arm higher. GJR kink drawn as a notch.
7. Slide 9: threshold label "−F_z^{-1}" → VaR = −(μ + σ·F_z⁻¹(1−α)).
8. Slide 10: typo "μu"; "t(4.3) ≈ −3.3" same raw-vs-standardized slip (≈ −2.6 standardized).
9. Slide 11: "GJR-t and EGARCH-t pass" → "pass or come close" (article).
10. Slide 13: "< 500 days" is invented ("a few hundred observations"; "200 days" example). "crypto crypto", "DCC-DCC-GARCH" duplicates.

Narration:
11. 35.7: an internal snapshot ID is read aloud ("EN761D601D5B34"). Do not caption or show it; cut the words if possible.
12. 636.5 "a specific nu minus two scaling factor inside the Jacobian term of the log likelihood": mixed up. The (ν − 2) standardization sits inside the density; the Jacobian term is −½·log σ_t² (as slide 5 shows).
13. 798.1 "where you gain roughly 90% of your risk calibration power": "90%" is the hosts' number. The article says "almost all of the risk-calibration improvement". Don't put 90% on screen.
14. 846.0 "from the Gaussian minus 2.33 to something like minus 3.3": inherits the article's raw-t quantile; for a unit-variance t(4.3) the 1% quantile is ≈ −2.6. Show the VaR line moving left a bit and the ES gap opening a lot more, without a −3.3 label.
15. 1027.5 "advanced joint risk copula models like DCC-GARCH and volatility targeting": these are three different things in the article (copula models, Part 3 DCC-GARCH, Part 4 volatility targeting). Show three separate boxes.
16. 678.1 "recovering from a massive loss requires a disproportionately larger profit": true arithmetic (−50% needs +100%) but not an article claim; fine as color, no article attribution.

## Timing notes

`sync_slides.py` (defaults) degenerated ("showed 8/15 slides, longest held 91%") and fell back to an even split (`timeline_auto_evensplit.json`, about 76 s per slide). The real split is very uneven (slide 1 holds 203 s, slide 8 only 30 s), so the even split is off by up to ~2 minutes (slide 2 at 76 s vs 203.2 s; slide 5 at 304 s vs 557.8 s).

`slide_starts.json` is set by hand. The hosts read the article's section headings aloud and follow the deck 1:1.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title + leverage effect | 0.0 | intro | high |
| 2 Sign-bias test | 203.2 | "Wait, testing for asymmetry before you model it" | high |
| 3 GJR-GARCH | 268.4 | "Assuming we get that green light, we move to the fixes" (GJR named at 270.9) | high |
| 4 EGARCH | 413.1 | "Managing all those rigid inequality constraints ... there's a workaround" (heading read at 419.9) | high |
| 5 Heavy tails | 557.8 | "GJR and EGARCH fix the direction ... let's talk about heavy tails" | high |
| 6 Python implementation | 687.7 | "So how do we actually build this? The Python implementation" | high |
| 7 GJR fit + BIC | 727.1 | "Let's walk through reading the output of a GJR fit" | high |
| 8 NIC plot + comparison table | 786.7 | "And then plotting the news impact curve is the payoff?" | high (short, 30 s) |
| 9 VaR and ES | 816.5 | "Okay, so risk application. VaR and expected shortfall" | high |
| 10 Computing VaR/ES + caveat | 873.9 | "To compute VaR and ES from a fitted arch model" | high (the "−2.33 → −3.3" line at 846 s is on slide 9's time, though its text is on slide 10) |
| 11 Kupiec / Christoffersen | 917.4 | "Okay, now back testing VaR. Kupiec and Christoffersen" | high |
| 12 Pinball loss + Basel | 955.0 | "ranking models by tail loss, not just pass fail" | high |
| 13 Practical considerations | 997.4 | "Let's hit some practical considerations" | high |
| 14 Distribution-free + hygiene | 1041.6 | "What about a distribution-free alternative?" | high |
| 15 Summary + references | 1080.4 | "Okay, let's summarize" | high |
