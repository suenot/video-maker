# almgren-chriss-optimal-execution (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
14-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/almgren-chriss-optimal-execution.en.md` ("Almgren-Chriss Without the Hand-Waving: Optimal Execution You Can Implement in an Afternoon", 2026-07-14, suenot).

- Audio: `input/notebooklm-sources/almgren-chriss-optimal-execution/en/audio.m4a`, 1568.32 s (26:08.3), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, per-word start/end in `words[]`). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`. Narration follows the deck order.
- Slide PNGs: `slides/slide_001.png` ... `slide_014.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: cream paper (#F2EFE6) with a faint square grid, slate-navy text (#2E3B4E), steel blue (#3D63A8) for formulas, curves and boxes, plum/magenta (#8E3B6A) accent for the "second" curve and fixes, amber (#E8B04A) callout boxes with diagonal hatching for warnings. IBM Plex Sans titles, IBM Plex Mono for labels/code, LaTeX serif math. "Gemini Notebook" watermark (do not redraw).

The hosts' running metaphors: permanent impact = draining a swimming pool (255.0, 511.6, 1137.7, 1172.9); λ = a thermostat vs TWAP = a metronome (581.7, 968.2). NotebookLM boilerplate read aloud at 97.4 to 117.6 and 883.9 ("unverified claims ... pending primary source review"): one short tag on screen at most.

Transcript quirks (Whisper mis-hearings, do not caption verbatim): "Suanad" (46.8) = suenot; "Almgren-Kris" / "Almgren-Krist" / "Almgren-Chris" = Almgren-Chriss; "Huberman and Stanzel" / "Stansel" = Huberman and Stanzl; "cinch" (611.6) = sinh; "ADA" / "EDA" = η (eta); "Kama" (1135.1) = γ (gamma); "COPPA" (1312.3) = κ (kappa); "big aggressive cells" (328.7) / "taker cells" (1149.8) = sells; "eaten to the liquidity" (370.1) = eating into; "two distant roots" (1078.4) = two distinct routes; "ag trades" (1190.1) = aggTrades; "Ava Zahava Wong" / "Obidwa and Wang" = Obizhaeva and Wang; "Gatherl" / "Gatharall" = Gatheral; "Nevmiy Vaka" = Nevmyvaka; "crashing a zero" (82.0) = crashing to zero; "absolute variance squared, well, sigma squared" (640.9) = σ².

---

## Slide 1: Title. 0.0 to 120.7 (120.7 s)

**Content**
- Title "Almgren-Chriss Without the Hand-Waving"; subtitle "Optimal Execution You Can Implement in an Afternoon".
- Left text: "A complete, reproducible derivation of the Almgren-Chriss model, bridging dense academic literature with production-ready engineering. This document provides the closed-form trajectory, the efficient frontier, and strict calibration methodologies for Binance data. Shown as a conditional liquidation calculation, not a return forecast."
- Box "DATA DICTIONARY & VARIABLES" (mono): `v_t = trading_rate (units/time)`, `Q_t = remaining_inventory (units)`, `T = total_time (sec)`, `σ = volatility (price_stdev/time)`, `η = temp_impact_coeff (price/unit/time)`, `γ = perm_impact_coeff (price/unit)`, `λ = risk_aversion_parameter`. Blue/plum arrows from labels "η" and "Q_t" point into it.
- Box "METADATA CONFIGURATION" (JSON): `'type': 'conditional_liquidation_model'`, `'_chad'`, `'not_included': 'return_forecasts'`, `'tags': ['execution', 'almgren-chriss', 'market impact', 'twap', 'quant', 'python', 'crypto'], 'crypto']`, `'author': 'suenot'`, `'source_date': '2026-07-14'`.
- Amber footer: "WARNING: This is a conditional liquidation calculation. Market conditions may vary. Not a financial forecast."

**NotebookLM errors (flag):** the metadata box is junk (stray `'_chad'` key, duplicated `'crypto'`, broken bracket): drop it. The dictionary uses notation that differs from the article (Q_t, T in seconds, continuous v_t); the article and slides 2 to 14 use X, T in hours, N, τ = T/N, x_k, n_k. Use the article notation. Reference year: the article cites Almgren & Chriss (2001), Journal of Risk 3(2), 5-39.

**Beats**
- 0.0 "a math formula ... pristine precision"; 8.4 "Like engineering a bridge ... it just spits out an exact undeniable answer" (clean blueprint bridge)
- 22.0 "we desperately want financial markets to be deterministic"; 29.2 "the actual world of institutional trading and market impact"; 34.0 "that pristine mathematical landscape is just completely covered in mud" (blueprint splattered with mud)
- 46.8 "a really fascinating article by a researcher who goes by the name suenot"; 52.5 "titled, Almgren-Chriss Without the Hand Waving" (title reveal)
- 56.3 "how massive whales ... execute giant trades without completely destroying the market"
- 68.2 "what the Almgren-Chriss model actually is"; 75.2 "a conditional liquidation calculation"; 78.2 "completely blind to the future. It is not a return forecast" (crossed-out crystal ball); 87.1 "given a specific set of market conditions, how do you sell or buy a massive position as efficiently as possible?"
- 97.4 to 117.6 review boilerplate (tiny tag)

## Slide 2: 1. The setup: what the model actually assumes. 120.7 to 416.4 (295.7 s)

**Content**
- Title "1. The setup: what the model actually assumes".
- Three-column table:
  - "**Arithmetic Zero-Drift Walk**": "The unperturbed price follows:" `S_k = S_{k−1} + σ√τ ξ_k − τ g(n_k/τ)`; "Arithmetic keeps algebra linear-quadratic; zero drift avoids fitting intraday noise. Uses i.i.d. normal shocks."
  - "**Linear Permanent Impact**": `g(v) = γv`; "Trading shifts the price permanently, and it never decays. Linear impact is the only arbitrage-free choice; non-linear models permit price manipulation."
  - "**Linear Instantaneous Temporary Impact**": `S̃_k = S_{k−1} − h(n_k/τ)`, where `h(v) = ε sgn(v) + ηv`; "Includes half-spread/fees (ε). Assumes the limit order book fully replenishes before the next child order."
- Right, dark-header box "Data Dictionary: State Variables": X : Total inventory (BTC); T : Total horizon time (hours); τ : Interval length (T/N) (hours); N : Number of intervals; x_k : Remaining inventory at step k; n_k : Child order size (x_{k−1} − x_k); S : Price in dollars per BTC.

Article check: matches. σ is absolute volatility ($ per unit time^½, not percent); no drift because "your alpha estimate over 4 hours is almost always noise"; Huberman and Stanzl (2004, Econometrica 72(4) 1247-1275): nonlinear **permanent** impact admits round-trip strategies with positive expected profit (price manipulation). ε = half the bid-ask spread plus fees.

**Sub-scenes** (296 s, split into 4)
- 2a 120.7 to 182.9, variables: 120.7 "let's jump straight into the setup"; 128.9 "a massive bag of inventory. We'll call it X, measured in BTC" (bag labelled X); 134.8 "a hard deadline ... T measured in hours" (clock); 139.3 "chop that time up into ... N intervals" / 144.6 "each interval lasts ... tau" (timeline ticks); 150.6 worked mini-example "four hours ... every single hour ... T is four ... N is four ... tau is one" (T = 4, N = 4, τ = 1 h); 164.4 "your remaining inventory at any given moment is called x_k" (bag shrinks); 169.9 "the actual chunk ... your child trade, is n_k"; 177.3 "the price of the asset is S".
- 2b 182.9 to 245.9, assumption 1: 187.2 "this one makes three massive ones" (three columns outline); 194.7 "the unperturbed price follows an arithmetic zero drift walk with i.i.d. normal shocks" (formula); 207.2 "the price bounces around randomly, like dust particles in the air" (Brownian dust); 211.9 "The crucial part here is the zero drift"; 227.8 "Over a short horizon ... your alpha estimate ... is almost always just statistical noise"; 237.9 "setting the natural drift to zero is actually the most honest default".
- 2c 245.9 to 361.0, assumption 2: 245.9 "permanent market impact"; 248.9 "linear and non-decaying"; 255.0 "draining a swimming pool. Every single bucket ... permanently lowers the overall water level" (pool gag); 262.8 "Every unit of Bitcoin you sell pushes the market price down proportionally and it never recovers"; 272.3 "gamma defined in dollars per Bitcoin squared"; 279.4 "Why is it strictly linear? ... a cascading crash?"; 291.3 "the exact question researchers Huberman and Stanzl asked"; 298.4 "if you assume a non-linear permanent impact, your model accidentally allows for infinite money glitches" (ATM gag at 313.2); 317.1 "buying and selling the exact same amount in different chunk sizes would leave the price in a different place"; 328.7 "manipulate the price down with big aggressive sells and buy it back up slowly with small buys" (round trip ends higher: free money); 342.2 "the math absolutely must assume permanent impact is linear to stay arbitrage free".
- 2d 361.0 to 416.4, assumption 3: 361.0 "temporary impact"; 364.9 "linear, instantaneous temporary impact"; 370.1 "the toll you pay just to cross the bid ask spread and eat into the liquidity" (toll booth); 380.9 "epsilon ... half the bid ask spread plus your exchange fees"; 386.7 "eta, measured in dollar hours per Bitcoin squared ... how steeply the cost rises as you demand more liquidity faster"; 396.4 "the really critical word here is instantaneous"; 403.1 "the book instantly and completely refills with new orders before your next trade" (book refills between slices); 412.4 "The market completely forgets your temporary impact by the next time step".

## Slide 3: 2. Cost and variance of a trajectory. 416.4 to 565.3 (148.9 s)

**Content**
- Title "2. Cost and variance of a trajectory".
- Panel "Expected Implementation Shortfall": `E[C] = ½γX² + εX + (η̃/τ) Σ_{k=1..N} n_k²` with braces underneath:
  - plum box under ½γX²: "**Permanent Cost:** Completely schedule-independent. This toll remains identical under linear assumptions regardless of execution path."
  - under εX: "**Spread:** Half the bid-ask spread plus fees."
  - under the sum: "**Temporary Cost:** Punishes fast trading. Discretization correction: η̃ = η − γτ/2."
- Panel "Inventory-weighted Variance": `V[C] = σ²τ Σ_{k=1..N} x_k²`; brace: "**Risk Accumulation:** Variance is weighted by remaining inventory (x_k), not trade size (n_k). This dynamic forces urgency to front-load schedules."

Article check: matches exactly (temporary term minimized by n_k = X/N, i.e. TWAP; variance term minimized by immediate liquidation).

**Sub-scenes** (149 s, split)
- 3a 416.4 to 513.2, cost: 416.4 "taking those three physical realities ... zero natural drift, a linear permanent pool drain and an instantly refilling temporary toll booth" (recap icons); 425.9 "derives the actual cost and variance of a trading trajectory"; 430.4 "sum up all your fills and subtract them from the price when you started ... expected implementation shortfall"; 436.8 "E of C and ... V of C" (both formulas appear); 444.1 "the tilde eta correction"; 452.2 "eta minus gamma times tau divided by two" (η̃ appears); 456.8 "we aren't trading continuously ... discrete time steps" / 465.4 "We trade, we wait, we trade, we wait" (stepped timeline); 474.3 "As your time steps get smaller ... the correction practically vanishes"; 484.7 "The permanent cost portion ... is simply 0.5 times gamma times your total inventory squared"; 492.4 "Do you see what's missing there? ... no time variable" (plum brace); 497.9 "Permanent impact is totally schedule independent"; 506.5 "Fast, slow, big chunks, small chunks ... The pool drops the same amount" (three schedules, same pool level).
- 3b 513.2 to 565.3, variance: 513.2 "your entire optimization problem shrinks"; 517.6 "temporary costs, which want you to trade as slowly and evenly as possible ... and your variance risk" (tug of war); 528.0 "Variance is inventory weighted, not trade weighted" (V formula, x_k highlighted); 538.4 "you hold the risk on what's left in your pocket"; 544.5 "If you have 100 Bitcoin and you sell 10 ... your risk is entirely tied to ... the 90 you are still ... holding" (100 → 90 bag, risk aura on the 90); 557.0 "why urgency forces you to front load trades".

## Slide 4: 3. The closed form: sinh, cosh, and the urgency parameter. 565.3 to 709.0 (143.7 s)

**Content**
- Title "3. The closed form: sinh, cosh, and the urgency parameter".
- Left "The Difference Equations" bullets: "Objective: Minimize `U = E[C] + λV[C]`"; "Interior points yield a second-difference equation: `(x_{j−1} − 2x_j + x_{j+1}) / τ² = κ̃² x_j`"; "Boundary conditions: `x_0 = X, x_N = 0`"; "Closed-form holdings: `x_j = X [sinh(κ(T − t_j)) / sinh(κT)]`"; "Closed-form child trades: `n_j = [2 sinh(κτ/2) / sinh(κT)] cosh(κ(T − t_{j−1/2})) X`".
- Right "The Urgency Parameter": "Discrete relation small-τ approx: `κ ≈ √(λσ²/η)`"; "Urgency (κ) compresses risk aversion, volatility, and liquidity into a single rate (1/time)."; "Characteristic time (θ = 1/κ): The optimal timescale to hold risk to save impact cost. Independent of deadline T and size X."
- Box "Data Dictionary: Parameters": σ : Absolute volatility ($/BTC/√h); ε : Spread/fees ($/BTC); η : Temporary impact (·h/BTC²) (implied by rate convention) with amber ⚠ "Dimensional ambiguity: rate convention verified."; γ : Permanent impact ($/BTC²); λ : Risk aversion (inverse dollars, 1/$).

Article check: matches. Exact discrete κ solves `(2/τ²)(cosh(κτ) − 1) = κ̃²` with `κ̃² = λσ²/η̃`. **Unit fix:** η's unit is printed "(·h/BTC²)" with the dollar sign missing; use **$·h/BTC²** and drop the ⚠ boilerplate.

**Host error (flag):** 575.1 calls λ "the magic urgency parameter". λ is risk aversion (1/$); the urgency parameter is κ = √(λσ²/η). Label λ "risk aversion dial" on screen.

**Sub-scenes** (144 s, split)
- 4a 565.3 to 629.8, objective + sinh path: 565.3 "an objective function. U equals E of C plus lambda times V of C" (formula); 574.2 "Lambda ... measured strictly in inverse dollars ... your risk aversion dial" / 581.7 "lambda acts like a thermostat" (thermostat dial); 584.5 "find the cheapest path given your specific fear of volatility"; 592.0 "a second difference equation with boundary conditions"; 596.3 "start with X inventory ... end with zero inventory at deadline T" (endpoints pinned); 602.3 "the optimal path ... isn't a straight line. It curves"; 611.6 "hyperbolic sine ... and hyperbolic cosine ... to determine your remaining holdings and your child trades" (x_j and n_j formulas; curve draws); 621.6 "press hard initially when your risk is highest and smoothly ease up as your bag gets smaller".
- 4b 629.8 to 709.0, κ and θ: 629.8 "compresses down into one ... variable, which we call kappa"; 636.9 "the small tau approximation. Kappa is roughly the square root of ... lambda times sigma squared, divided by ... eta" (κ formula); 650.7 "the reciprocal theta equals one over kappa"; 657.8 "the characteristic time of the trade"; 662.9 "the intrinsic half life of your specific liquidation"; 673.6 "it dictates whether your deadline even matters"; 680.1 "if ... theta is much, much smaller than your deadline T, the deadline is totally irrelevant" (θ ≪ T: curve hits ~0 early); 696.4 "if theta is much larger than T, your deadline strictly binds you" (θ ≫ T: near-straight line).

## Slide 5: 4. The risk-neutral limit is TWAP. 709.0 to 798.5 (89.5 s)

**Content**
- Title "4. The risk-neutral limit is TWAP". Three charts, Inventory (x(t)) vs Time (t), 0 to T, y from 0 to X:
  - "λ → 0": straight line from X to 0 at T. Caption: "As λ → 0, κ → 0. The hyperbolic sine degenerates (sinh(z) → z). Trajectory becomes a straight line: x(t) → X(T−t)/T. TWAP is the exact mathematical optimum for a risk-neutral trader. The deadline T strictly binds."
  - "κT ≈ 1": two convex decaying curves (blue and plum). Caption: "κT interpolates behavior between TWAP and immediate liquidation."
  - "λ → ∞": drops from X to ~0 inside the first interval, then flat. Caption: "High-risk-aversion limit. Dump entire inventory in the first interval. When θ ≪ T, the model executes on its intrinsic timescale θ. The deadline T becomes irrelevant."
- Bottom "Execution Spectrum Slider" with ticks: λ → 0 "TWAP (Risk-Neutral)" | κT ≈ 1 "Interpolation (Optimal Execution)" | λ → 1 | "Immediate Liquidation (High Risk Aversion)" λ → ∞.

**NotebookLM errors (flag):** the "λ → 1" tick is meaningless (λ carries units of 1/$; nothing happens at λ = 1). Put the slider on κT: 0 (TWAP) → ~1 → ≫ 1 (immediate liquidation). All three curves must end exactly at 0 at t = T (x_N = 0); the slide's lines stop slightly above zero. The middle panel's two curves are unlabeled; label them with κT values (for example κT = 1 and κT = 2.4, the worked example).

**Beats**
- 709.0 "the extreme edges of this model"; 712.9 "infinite risk aversion ... terrified of holding the asset for even one second"; 721.7 "You just dump everything instantly ... in the very first interval" (right panel); 726.3 "You eat the massive temporary cost"
- 731.2 "what if you have zero risk aversion?"; 739.8 "If we dial lambda all the way to zero, that elegant hyperbolic sine curve entirely flattens out" / 746.5 "a perfectly straight line" (sinh(z) → z morph, left panel); 754.9 "A time-weighted average price. TWAP"
- 758.3 "TWAP isn't just a lazy simple rule of thumb"; 764.3 "TWAP is the mathematically exact, provable optimum for a trader who has absolutely zero risk aversion"
- 773.1 "Every single time an institution fires off a TWAP algorithm ... I do not care about the variance of my shortfall"; 782.5 "an absolutely wild stance ... a massive chunk of daily volume over eight hours in a highly volatile crypto asset" (article: "liquidating 5% of daily volume over 8 hours in an asset doing 4% daily vol")

## Slide 6: 5. The efficient frontier of execution. 798.5 to 876.9 (78.4 s)

**Content**
- Title "5. The efficient frontier of execution".
- Left panel "Efficient Frontier": y "Expected Cost (E)", x "Variance (V) [Strictly Variance, not Standard Deviation]"; a convex decreasing blue curve with a grey tangent line at one point, arrow label `λ = −dE/dV`. Caption: "Steeply diminishing returns: Less variance always costs more expected shortfall."
- Right table "3 Ways to Select Risk (λ)":
  1. **Marginal Cost Reasoning**: Walk the frontier. Ask: "Do I pay ΔE dollars to remove Δstd dollars of shortfall standard deviation?" The knee of the curve is usually obvious within a factor of 2.
  2. **Risk Budget**: Fix a maximum acceptable variance (e.g., 1-day 1-sigma residual < 15 bps). Take the cheapest trajectory. The Lagrange multiplier of this constraint is λ.
  3. **Characteristic Time Target**: Pick θ directly (e.g., "90-minute half-life") and algebraically back out `λ = η/(σ^2 θ^2)`.

Article check: matches (article phrases the risk budget as a maximum shortfall std: "one-day 1-sigma of the residual position must stay under 15 bps of notional"; frontier "in direct analogy to Markowitz"; sweep `lam` over `np.logspace(-8, -4, 50)` and plot E against √V).

**Beats**
- 798.5 "the efficient frontier of execution"; 805.0 "expected cost, E, on one axis, against your variance, V" (axes, curve draws)
- 815.1 "Do not confuse variance V with standard deviation. Variance is measured in dollars squared" (axis subtitle flashes)
- 822.6 "your urgency parameter, lambda, is literally the negative slope ... the derivative of E with respect to V" (tangent slides along curve; again λ is risk aversion, see slide 4 flag)
- 832.8 "three practical ways"; 837.0 "walk the curve looking at marginal cost" (row 1); 848.1 "a risk budget ... a maximum standard deviation of X dollars ... the absolute cheapest trajectory that stays under that risk ceiling" (row 2; horizontal ceiling line); 860.9 "characteristic time targeting ... my ideal half-life for this trade is two hours ... the math backs out ... lambda" (row 3; host says 2 h, slide/article example is 90 min)

## Slide 7: The 100 BTC Worked Example. 876.9 to 972.2 (95.3 s)

**Content**
- Title "The 100 BTC Worked Example".
- Six notched parameter chips: `X = 100 BTC` | `S₀ = $100,000/BTC` | `T = 4 hours` | `σ = $600 /BTC/√h` | `η = 1.0 $·h/BTC²` | `λ = 1e-6 1/$`.
- Bar "Derived Metrics: κ = 0.6 h⁻¹, κT = 2.4, θ ≈ 1.7 h".
- Table (blank) | Optimal AC Trajectory | TWAP: First-Hour Trade Size 46.2 BTC | 25 BTC; Temporary Cost $3,290 | $2,500; Shortfall Std Dev $53,000 | $69,300.
- Amber box: "**Synthesis:** The model prices the insurance. For an extra **~0.8 bps** of expected cost (**$790**) on a $10M notional, the schedule cuts shortfall risk by **23%**. (Note: All numerical claims are attributed to the source article pending independent recalculation)."

Verified by recomputation (continuous AC formulas): κ = √(1e-6 · 600² / 1.0) = 0.6 h⁻¹, κT = 2.4, θ = 1.67 h; first-hour sale X(1 − sinh(1.8)/sinh(2.4)) = 46.18 BTC; temporary cost $3,290.75 vs $2,500 (TWAP: η X²/T); shortfall std $52,998 vs $69,282 (TWAP: σX√(T/3)); extra cost $790.75 = 0.79 bps of $10M; risk cut 23.5%. All slide numbers are correct. σ = $600/√h ≈ 3% daily vol ($600·√24 ≈ $2,939 on $100k).

**Host error (flag):** 949.8 "you pay an extra **eight** basis points". Wrong: **0.8 bps** ($790 on $10M); the other host corrects it at 962.8 ("Less than one basis point of cost to wipe out nearly a quarter of your risk"). Show 0.8 bps only.

**Beats**
- 876.9 "a fantastic concrete worked example"; 883.9 "unverified claims" (tiny tag)
- 887.7 "liquidating 100 Bitcoin" (chip 1); 891.6 "$100,000 per BTC"; 895.1 "a hard deadline of four hours"; 898.1 "Sigma, is $600 per square root hour"; 902.9 "eta, is 1.0"; 906.3 "Lambda, is set to 1e-6" (chips pop one per beat)
- 910.8 "the optimal Almgren-Chriss strategy tells you to aggressively sell 46.2 Bitcoin in the very first hour" (AC bar 46.2) / 919.8 "TWAP, you'd only sell 25" (TWAP bar 25)
- 926.0 "your temporary impact cost ... $3,290 compared to just $2,500" (cost row); 937.0 "But listen to what happens to the risk"; 939.7 "$53,000 compared to $69,300" (risk row; risk bar shrinks)
- 947.5 "is it worth it?"; 949.8 cost/risk verdict (show 0.8 bps, 23%); 962.8 "Less than one basis point of cost to wipe out nearly a quarter of your risk"; 968.2 "the power of a thermostat over a metronome" (thermostat vs metronome gag callback)

## Slide 8: Python Trajectory Inputs & Outputs. 972.2 to 988.8 (16.6 s)

**Content**
- Mono title "Python Trajectory Inputs & Outputs".
- Code window tab "almgren_chriss.py":
  ```python
  def almgren_chriss(X, T, N, sigma, eta, gamma, lam):
      tau = T / N
      eta_t = eta - 0.5 * gamma * tau
      kappa_t2 = lam * sigma**2 / eta_t
      kappa = np.arccosh(0.5 * kappa_t2 * tau**2 + 1) / tau
      t = np.arange(N + 1) * tau
      x = X * np.sinh(kappa * (T - t)) / np.sinh(kappa * T)
      n = x[:-1] - x[1:]
      E = 0.5 * gamma * X**2 + (eta_t / tau) * np.sum(n**2)
      V = sigma**2 * tau * np.sum(x[1:]**2)
      return x, n, E, V

  x, n, E, V = almgren_chriss(X=100, T=4, N=48, sigma=600,
                              eta=1.0, gamma=0.3, lam=1e-6)
  ```
- Right: box "Input: lam swept over np.logspace(-8, -4, 50)" branching into four boxes "x (holdings trajectory)", "n (child trades)", "E (Expected Cost)", "V (Variance)". Amber: "The trajectory math fits in 10 lines of code; the true engineering challenge lies entirely in parameter calibration."

Article check: code matches the article (article adds the docstring "Optimal liquidation trajectory (discrete AC 2001).", comments `# tilde-eta`, `# tilde-kappa^2`, `# child order sizes`, `import numpy as np`, and `print(f"first-hour qty: {n[:12].sum():.1f} BTC, " f"E=${E:,.0f}, std=${np.sqrt(V):,.0f}")`). Note: the code's E includes the permanent ½γX² = $1,500 (γ = 0.3), so E printed by the script is not the temporary-only $3,290 of slide 7.

**Beats**
- 972.2 "the Python script to generate this trajectory is only about 10 lines of code" (code types in fast)
- 979.5 "You input those parameters, it spits out the schedule, and if you sweep different values of lambda, it literally draws that entire efficient frontier curve" (logspace sweep → frontier from slide 6 redraws)

## Slide 9: 6. Calibration Pipeline & 7. σ: The Easy One. 988.8 to 1074.7 (85.9 s)

**Content**
- Mono title "6. Calibration Pipeline & 7. σ: The Easy One".
- Top: box "Binance Data" (gear icon) branching into three rows: "σ (Volatility) -> The easy one" (highlighted blue), "η (Temporary Impact) -> From book depth & trades", "γ (Permanent Impact) -> From signed taker flow".
- Box "σ Calibration Schematic": "**Method:** Absolute volatility per root-hour via mid-price returns." / "**Data Source:** Binance 1-minute kline bars (REST API)." / amber hatched "**Crucial Detail:** Must use **1-minute bars or slower.** Finer sampling introduces microstructure noise (bid-ask bounce) which artificially biases realized variance upward." / "**Reliability:** High. Volatility is the single parameter you can expect to measure cleanly."

Article check: matches. Article code: `kl = requests.get(f"{B}/klines", params=dict(symbol=sym, interval="1m", limit=1000)).json(); close = np.array([float(k[4]) for k in kl]); sigma = np.diff(close).std() * np.sqrt(60)  # $/sqrt(h)` (uses 1m close prices).

**Beats**
- 988.8 "the hardest, messiest part of this entire endeavor. Calibration"; 998.2 "The Python formula is trivial"; 1001.2 "finding accurate numbers for eta, gamma, and sigma in the real world from messy Binance data ... is exactly where most implementations completely fail" (Binance Data box fans out to three rows); 1011.9 "Garbage in, garbage out"
- 1020.9 "Let's start with sigma, the volatility"; 1023.5 "dollars per Bitcoin per square root hour, is thankfully the easy one"; 1029.0 "one minute price differences"
- 1034.0 "Why not one second?"; 1039.5 "Because of microstructure noise"; 1044.2 "the last traded price bounce rapidly between the bid and the ask ... buy, sell, buy, sell" (price ping-pongs between bid and ask lines); 1053.5 "bid ask bounce"; 1055.1 "this bouncing makes the asset look insanely volatile. But it's an illusion" / 1061.6 "The true mid price isn't moving" (mid line flat); 1063.7 "step back to one minute windows ... the true absolute sigma" (zoom out, bounce averages away)

## Slide 10: 8. η: Temporary impact from the book and trades. 1074.7 to 1132.1 (57.4 s)

**Content**
- Mono title "8. η: Temporary impact from the book and trades".
- Left "Route A: Walk the L2 Book": • Mechanism: Compute the cost of a hypothetical marketable sweep from depth snapshots (VWAP of consumed levels minus mid). • Equation: Fit `cost(q) ≈ ε + η_inst q`. • Conversion: Must assume a book replenishment time Δt_r (10-60s for BTCUSDT). `η ≈ η_inst Δt_r`.
- Right "Route B: Regressed Realized Slippage": • Mechanism: Bucket aggressive (taker) flow into 1-minute bins. Regress taker-side VWAP minus open-mid against taker volume rate. • Synthesis: Route B measures what the market actually charged aggressors. Route A measures what the resting book would charge right now. Trust B for absolute level, A for intraday shape.
- Center amber hatched box overlapping the left text (layout bug): "**Dimensional Tracking Warning:** Route A relies entirely on the full-replenishment assumption to convert instantaneous impact into the ·h/BTC² rate convention required by the model". Redraw without the overlap and with the unit $·h/BTC².

Article check: matches ("When they disagree by a factor of 3, believe B for the level and A for the intraday shape"). Article code for Route A: depth `limit=5000`, probe sizes `np.linspace(0.5, 50, 40)` BTC, `eps, eta_inst = np.polyfit(sizes, cost, 1)[::-1]`, `eta = eta_inst * (30 / 3600)  # 30s refresh -> $*h/BTC`.

**Beats**
- 1074.7 "What about eta, the temporary impact"; 1078.4 "two distinct routes"
- 1081.1 "Route A is highly theoretical"; 1083.2 "a snapshot of the level two order book and you simulate sweeping it" (sweep animation eats levels); 1091.0 "eta requires a rate"; 1094.1 "multiply that sweep cost by an assumed order book replenishment time"; 1098.7 "the book refills every 10 to 60 seconds" (refill timer). "But that's an assumption" (warning box)
- 1107.6 "Route B is empirically grounded"; 1109.5 "look at realized taker slippage"; 1116.1 "taker side VWAP, subtract the open mid price and regress that against the taker volume rate" (scatter + fit line)
- 1124.3 "Route A measures what the passive limit orders threaten to charge you right now. Route B measures what the market actually charged aggressive takers in the past" (two routes side by side)

## Slide 11: 9. γ: Permanent impact via Kyle-style regression. 1132.1 to 1213.6 (81.5 s)

**Content**
- Mono title "9. γ: Permanent impact via Kyle-style regression".
- Left "\gamma Regression Mechanism" (raw LaTeX leak; render "γ Regression Mechanism"): "**Formula:** `ΔS_5m = γ Q_net + noise`"; "`Q_net = taker buys − taker sells`"; "**Sampling Horizon:** Regress mid-price changes on signed net taker flow over 5-minute windows." Step chart: level flat in window t, steps up at "t+1 window" and stays. "**The Non-Reversion Check:** You must verify the impact does not revert one window later. Only the non-reverting component is truly "permanent"."
- Right "Binance REST Extraction" code:
  ```python
  tr = requests.get(f"{B}/aggTrades",
     params=dict(symbol=sym, limit=1000)).json()
  df = pd.DataFrame(dict(t=[t["T"] for t in tr],
                         p=[float(t["p"]) for t in tr],
                         q=[float(t["q"]) * (-1 if t["m"] else 1) for t in tr]))
  df["bin"] = df.t // 300_000 # 5-min bins
  g = df.groupby("bin").agg(dp=("p", lambda s: s.iloc[-1] - s.iloc[0]), qn=("q", "sum"))
  gamma = np.polyfit(g.qn, g.dp, 1)[0]
  ```
- Amber ⚠ box: "**Warning:** A single aggTrades page is insufficient for production. You must use historical dumps and regress on thousands of bins."

**NotebookLM error (flag):** the slide's code drops the `if`: it prints `(-1  t["m"] else 1)`, which is a syntax error. Correct (article): `(-1 if t["m"] else 1)` (`m` = buyer is maker, i.e. a taker sell). Note the article's toy code regresses the change in trade price per bin, not mid; fine for a sketch. Historical dumps: data.binance.vision.

**Beats**
- 1132.1 "the final boss. Gamma, permanent impact"; 1137.7 "How do we measure the water permanently leaving the pool?" (pool callback)
- 1141.1 "a Kyle style regression"; 1144.0 "five minute windows ... regress the mid price changes against the signed net taker flow" (formula; scatter of ΔS vs Q_net); 1149.8 "did taker buys or taker sells dominate"
- 1159.1 "a non-reversion check"; 1162.6 "look at the next several windows to ensure the price impact didn't just bounce right back" (step stays vs step that reverts; article: one window later); 1167.6 "If I slam the market down and five minutes later it fully recovers, that wasn't permanent impact" / 1172.9 "The water wasn't drained. It just splashed and settled" (pool gag)
- 1180.4 "a standard Binance REST endpoint over a weekend"; 1190.1 "a single aggTrades page ... is woefully insufficient" (warning box)
- 1201.2 "declare this loud and clear"; 1206.4 "An ordinary least squares or OLS regression for gamma should never be presented as causal" (bridge into slide 12)

## Slide 12: 10. Why crypto calibration is noisy. 1213.6 to 1331.0 (117.4 s)

**Content**
- Mono title "10. Why crypto calibration is noisy". Four boxes:
  1. **Endogeneity**: "Flow responds to price. OLS γ is not causal; it absorbs momentum trader reactions. Note weak R-squared and day-to-day coefficient drift."
  2. **Concave Impact**: "Real impact is empirically square-root, not linear." Plum highlight "Fix: Calibrate parameters specifically at the participation rates you intend to trade."
  3. **Fragmentation / Perp Leadership**: "BTCUSDT spot is just one venue. Perpetual futures often lead price discovery, injecting structural noise into spot regressions."
  4. **Regime Dependence**: "Impact roughly doubles when vol doubles. Asia session η does not match US open." Plum "Fix: Fit weekly, per session."
- Bottom box: "**The Saving Grace:** The cost function is flat near the optimum. `κ ∝ √(1/η)`, so a 2x error in η moves κ by only √2. Precision is required for pre-trade estimates; robustness suffices for the actual schedule."

Article check: matches. Article numbers: γ regression R² "a few percent", coefficient moves "by a factor of 2-5 between days"; endogeneity fix = use your own fills (exogenous by construction); Almgren, Thum, Hauptmann, Li (2005, Risk 18(7) 58-62): exponent near 0.6; "Getting η right to within a factor of 2 and λ right to within an order of magnitude already captures most of the available improvement over TWAP".

**Sub-scenes** (117 s, split)
- 12a 1213.6 to 1264.6, endogeneity + concavity: 1213.6 "four structural reasons why crypto calibration specifically is a nightmare of noise" (four boxes outline); 1219.6 "First is endogeneity"; 1223.3 "flow responds to price just as much"; 1226.8 "Momentum traders buy specifically because the price went up" (arrow price → flow loops back); 1230.1 "A naive OLS regression ... wrongly attributes the price jump to your impact"; 1234.6 "Second is concave impact"; 1243.8 "real world impact isn't perfectly linear. It's actually concave ... closer to a square root curve" (√ curve vs straight line); 1255.1 "fit a straight line to a curve ... eta and gamma become completely dependent on the average size of the trades in your ... sample" (line slope changes with sample range).
- 12b 1264.6 to 1331.0, fragmentation, regime, saving grace: 1264.6 "Third is venue fragmentation"; 1273.2 "Price discovery in crypto often leads on perpetual futures" (perp venue moves first, spot follows); 1286.3 "fourth is regime dependence and coefficient drift"; 1290.0 "The R squared values on these regressions are notoriously weak"; 1293.5 "a quiet Asian trading session will absolutely blow up your algorithm during a volatile US market open" (two clocks); 1301.4 "The coefficients literally drift day to day"; 1307.3 "a mathematical saving grace"; 1312.3 "kappa ... proportional to the square root of lambda times sigma squared over eta"; 1320.4 "even if you make a massive error in calculating your temporary impact, it gets dampened" (2x η error → √2 κ change; flat cost bowl).

## Slide 13: 11. Where the model breaks, and the papers that fix it. 1331.0 to 1447.4 (116.4 s)

**Content**
- Mono title "11. Where the model breaks, and the papers that fix it". Four rows (blue problem → paper → fix):
  - "Nonlinear Impact" → "Almgren (2003)" → "Square-root law (α ≈ 1/2) punishes bursts less. Trajectories become more front-loaded; sinh formula breaks."
  - "Instant Replenishment" → "Obizhaeva & Wang (2013)" → "Finite resilience/LOB. Drastic shape change: block trade at start, block at end, constant rate in middle."
  - "No-Dynamic-Arbitrage" → "Gatheral (2010)" → "Exponential decay is ONLY compatible with linear impact. Mixing decay kernels with concave impact creates false arbitrage opportunities."
  - "Linear-Gaussian Constraints" → "RL/Neural Sequels" → "Relaxes constraints for state-dependent routing, but always initialized and benchmarked against the AC baseline."

Article check: matches, with two nuances: Gatheral: exponential decay + square-root impact can be pumped by an oscillating trade sequence, nonlinear impact needs power-law decay (with an inequality linking the exponents); RL: "every serious RL execution agent is benchmarked against, and often initialized from, the AC solution" (slide says "always initialized", overstated). Article adds: if your child-order interval is comparable to the venue's replenishment time (seconds to a minute on crypto), you are in Obizhaeva-Wang territory; RL from Nevmyvaka, Feng and Kearns (2006, ICML). Papers: Almgren (2003) Applied Mathematical Finance 10(1) 1-18; Obizhaeva & Wang (2013) J. Financial Markets 16(1) 1-32; Gatheral (2010) Quantitative Finance 10(7) 749-759.

**Sub-scenes** (116 s, split)
- 13a 1331.0 to 1393.1, Almgren 2003 + Obizhaeva-Wang: 1331.5 "an incredibly elegant math model from over 20 years ago ... highly idealized assumptions"; 1341.5 "where does it totally break down? And what are the papers that actually fix it?"; 1346.2 "a lineage of foundational papers that act as sequels" (row scaffold); 1350.4 "Almgren's own follow up in 2003 ... nonlinear concave impact"; 1357.3 "even more front loaded ... even though that beautiful sinh formula no longer perfectly applies" (row 1; curve bends more); 1369.6 "the Obizhaeva and Wang paper"; 1373.6 "fixes the glaring instant replenishment flaw ... finite resilience"; 1380.4 "the book takes time to refill"; 1383.3 "firing off child orders ... only seconds apart, you aren't letting the book recover"; 1388.8 "You are living in an Obizhaeva-Wang world, not an Almgren-Chriss world" (row 2; block-constant-block schedule shape).
- 13b 1393.1 to 1447.4, Gatheral + RL: 1393.1 "Gatheral in 2010 established the no dynamic arbitrage rules"; 1399.3 "You cannot just arbitrarily mix and match whatever decay functions and impact functions fit your data best"; 1406.9 "combine exponential decay with square root impact ... a smart optimizer will find a way to pump your model for infinite money ... trading schedules that wildly alternate between buying and selling" (oscillating buy/sell zigzag, money pump); 1421.3 "an arbitrage machine instead of an execution algorithm"; 1426.7 "where the industry is heading today ... reinforcement learning and neural impact models" (row 4); 1439.2 "they almost always use Almgren-Chriss as their fundamental baseline".

## Slide 14: 12. What to take away & 13. References. 1447.4 to 1568.3 (120.9 s)

**Content**
- Title "12. What to take away & 13. References".
- Left "The Execution Blueprint":
  1. "**Three assumptions, one equation, one number.**" — "Linear impact keeps it arbitrage-free. The strategy collapses entirely into urgency kappa = \sqrt{λσ^2/η}."
  2. "**TWAP is a quantifiable risk claim.**" (amber highlight) — "\lambda \ → 0 yields TWAP. It is not an arbitrary habit; it mathematically asserts total risk-neutrality."
  3. "**Calibration is the real bottleneck.**" (amber highlight) — "\sigma is clean, \eta is a factor-of-2 estimate, \gamma is structural noise. Implement the math in an afternoon; spend the month on diagnostics."
  (Raw LaTeX leaks `\sqrt{...}`, `\lambda`, `\sigma`, `\eta`, `\gamma`: render as proper symbols, κ = √(λσ²/η).)
- Right "References": Almgren & Chriss (2001), Journal of Risk; Almgren (2003), Applied Mathematical Finance; Huberman & Stanzl (2004), Econometrica; Almgren et al. (2005), Risk; Nevmyvaka et al. (2006), ICML; Gatheral (2010), Quantitative Finance; Obizhaeva & Wang (2013), Journal of Financial Markets.
- Footer note (truncated boilerplate "Do not imply clea..."): drop.

Article check: matches the article's "What to take away" (article wording: "σ is easy, η is a factor-of-2 game, γ is a research project, and the trajectory forgives all three. Implement it in an afternoon; spend the rest of the month on the regression diagnostics").

**Sub-scenes** (121 s, split)
- 14a 1447.4 to 1487.6, takeaways: 1447.4 "three assumptions, one objective equation and one urgency parameter, kappa" (item 1); 1461.5 "running a standard TWAP is mathematically identical to saying you have zero fear of variance" (item 2); 1468.5 "the ultimate reality ... implement the Almgren-Chriss math in Python in a single afternoon, but you will spend the rest of the month ... running regression diagnostics" (item 3; afternoon clock vs month calendar).
- 14b 1487.6 to 1568.3, references + outro: 1487.6 "acknowledge the key citations"; 1495.9 "Almgren and Chriss, 2001. Huberman and Stanzl, 2004. Obizhaeva and Wang, 2013. Gatheral, 2010. And Nevmyvaka, Feng and Kearns, 2006" (references tick in as read; order differs from the slide list); 1514.5 "The math is public"; 1518.0 "The actual alpha, the real edge, is entirely in the application and calibration"; 1528.2 "If the exact parameters ... are constantly shifting ... at what point is finding the optimal mathematical trajectory ... just another form of market speculation?"; 1548.6 "math is supposed to be a clean, comforting x-ray" / 1553.7 "even the most beautifully derived x-ray is really just a shadow on the wall" (callback to the blueprint-in-mud opening); 1562.5 "Thanks for joining us"; 1566.8 "Keep questioning the models" (end card).

---

## Timing notes

`sync_slides.py` (default params) degenerated ("showed 10/14 slides, longest held 69%") and fell back to an even 112.0 s split (saved as `timeline_auto_evensplit.json`).

`slide_starts.json` is set by hand; the narration follows the deck order and the hosts name each section.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | cold open; title read at 52.5 | high |
| 2 Setup / assumptions | 120.7 | "So let's jump straight into the setup" | high |
| 3 Cost and variance | 416.4 | "taking those three physical realities ... the article derives the actual cost and variance" | high |
| 4 Closed form / urgency | 565.3 | "To formalize this tug of war, the Almgren-Chriss model creates an objective function" | high |
| 5 Risk-neutral limit | 709.0 | "Which beautifully sets up the extreme edges of this model" | high |
| 6 Efficient frontier | 798.5 | "the article maps out what it calls the efficient frontier of execution" | high |
| 7 Worked example | 876.9 | "The article provides a fantastic concrete worked example" | high |
| 8 Python | 972.2 | "the Python script to generate this trajectory is only about 10 lines of code" | high (short, 17 s) |
| 9 Calibration / σ | 988.8 | "that leads us directly into the hardest, messiest part ... Calibration" | high |
| 10 η routes | 1074.7 | "What about eta, the temporary impact" | high |
| 11 γ regression | 1132.1 | "And then we face the final boss. Gamma, permanent impact" | high |
| 12 Noisy calibration | 1213.6 | "The article lists four structural reasons why crypto calibration ... is a nightmare of noise" | high (1201.2 to 1213.6 OLS-not-causal line could sit on either slide) |
| 13 Model breaks / papers | 1331.0 | "So we have this incredibly elegant math model from over 20 years ago" | high |
| 14 Takeaways / references | 1447.4 | "So to summarize the core takeaways from the text" | high |

Slides longer than ~90 s are split into sub-scenes above: 1 (beats only, 121 s but one idea per beat), 2 (4), 3 (2), 4 (2), 12 (2), 13 (2), 14 (2). Slides 5 (90 s) and 7 (95 s) run as single scenes with dense beats.
