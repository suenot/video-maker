# Distance Approach Pairs Trading — Ink Theater slide prompts (v3)

Generation path: higgsfield MCP `gpt_image_2` (image-to-image).

References per slide:

- semantic source: `video_maker/temp/distance-approach-pairs-trading_en/slides/slide_###.png` (original NotebookLM slide; styling and watermark must NOT be retained)
- style source: `youtube_styles/style-library/buzz-hook-slide/samples/05-ink-theater.png`
- style contract: `higgsfield-auto/cmdop-video-flow/vendor/openmontage/skills/creative/ink-theater.md`
- verified manifest prompt: `youtube_styles/style-library/buzz-hook-slide/manifest.json` -> `05-ink-theater`

## Common prompt contract

Create one 16:9 technical video slide on pure white tactile paper. Preserve at least 35% untouched
negative space and 8-10% safe margins. Use confident variable-width black ink with subtle
hand-drawn wobble. Include exactly one deadpan solid-black mascot with tiny white-dot eyes; the
mascot must physically perform the metaphor on an absurd low-tech contraption. Strict color
grammar: black = structure, mascot, and type; orange = flow or arrows only; red = problem or
warning only; blue = successful end state only. Use crisp handwritten display lettering; the
exact required text must remain correct and readable at video size. Minimal, dry, intelligent,
never cute. No shading, hatching, 3D, gradients, UI cards, browser chrome, logos, random code,
decorative machinery, watermark, or "Gemini Notebook". Render only the listed text, verbatim and
exactly once.

## Slide-specific prompts

1. **Title.** Mascot at a drafting table measures two converging price paths with a divider
   compass; an orange arrow feeds both into one blue junction. Text: "The Architecture of
   Convergence: Distance Approach in Pairs Trading" and "Mathematical formulation and Rust
   implementation for relative value statistical arbitrage." Red warning box, verbatim:
   "EDUCATIONAL ARTIFACT. The models, formulas, and code structures detailed herein are for
   educational analysis of statistical arbitrage mechanisms. They do not constitute investment
   advice. Trading real capital involves transaction costs, execution latency, and regime risks
   not captured in theoretical models."

2. **Stage 1: Pair Formation Window.** Mascot holds a caliper measuring the gap between two
   hand-drawn normalized curves on a white board; a blue bracket marks the formation window.
   Labels: "Stage 1: Pair Formation Window", "Normalized Scale [0.0-1.0]", "Asset A", "Asset B".
   Text: "Historical co-movement does not prove cointegration, but establishes a baseline
   geometry."

3. **Distance & normalization.** Mascot cranks a mechanical adding machine that squares each gap
   between two zipped slices. Formula: "distance(X, Y) = sqrt(sum((x_i - y_i)^2))" with caption
   "Iterate over zipped slices, square the difference at each timestamp, and sum."
   Second panel: "Min-Max Normalization" with "norm_price = (price - min) / (max - min)" and red
   warning verbatim: "Calculate minimum and maximum using FORMATION WINDOW ONLY. Using future
   observations introduces look-ahead bias."

4. **Universe Sorting & The Bounded Heap.** Mascot shovels pair-tokens into a hopper feeding a
   bounded heap box; orange sorting arrows descend into it. Labels: "Universe Sorting & The
   Bounded Heap", "Universe size N", "O(N^2) pairwise combinations". Caption: "Keep only the
   closest pairs; the heap bounds memory."

5. **Collapsing Geometry into Spread.** Mascot feeds two paths through a mangle press that flattens
   them into one spread line with a zero-line. Formula: "spread_t = norm_price_A_t -
   norm_price_B_t". Labels: "Formation Window", "Zero-Line". Captions: "Asset A is relatively
   expensive", "Asset A is relatively cheap".

6. **Volatility-Based Signal Generation.** Mascot winds a gauge with red upper/lower threshold
   marks and a blue zero-line; orange long/short arrows leave it. Formula: "Spread Volatility
   (sigma) = sqrt(average squared deviation from historical mean)" and "Threshold = sigma x
   Multiplier". Labels: "Upper Threshold", "Lower Threshold", "SHORT A / LONG B", "LONG A / SHORT
   B". Caption: "Validate thresholds via walk-forward testing. Do not select from reporting data."

7. **Filters.** Mascot pours candidate tokens through two stacked sieve funnels: the first
   separates industry codes (Tech, Energy, Finance), the second counts zero crossings. Labels:
   "Filter 1: Industry Codes", "Filter 2: Zero Crossings", "Tech", "Energy", "Finance". Text:
   "Restrict candidates to economically related assets to improve logical plausibility. Require
   minimum sign changes to favor visible convergence/divergence history."

8. **The Volatility Tradeoff.** Mascot balances on a seesaw between a red high-volatility end and
   a red low-movement end, with a blue "Goldilocks Zone" in the middle. Axes: "Y-Axis:
   Opportunity (Spread Variability / Std Dev)", "X-Axis: Relationship Stability (Historical
   Distance)". Captions: "Higher opportunity, but raises risk and weakens the assumption of
   relationship stability." and "Too little spread movement to cover trading costs (fees, bid-ask,
   borrow)." Caption: "Filter candidates by minimum spread-volatility, then rank by distance."

9. **Distance vs. Pearson Approach Diagnostic.** Mascot at a comparison table holds two placards;
   a blue check marks the Distance column. Two-column table, rows: "Input Data" (Distance:
   "Normalized Price Paths"; Pearson: "Correlation of returns"), "Core Math" (Distance:
   "Min-Max & Euclidean squared distance"; Pearson: "Pearson correlation"), "Implementation"
   (Distance: "Direct geometric comparison"; Pearson: "Statistic over paired series"), "Execution"
   (Distance: "Relative spread"; Pearson: "Spread > Z-score").

10. **Rust implementation.** Mascot operates a steam-driven sorting engine: a SIMD gear block
    turning a bounded-heap hopper, with async belts feeding it. Labels: "TradingSignal Enum:
    Long, Short, Neutral states", "Bounded Heap", "SIMD Hot Loop", "Asynchronous Tasks",
    "Numerical Slices & Explicit Ownership". Captions: "Joining async results and sorting combined
    candidates." and "Processes multiple floating-point differences in one CPU operation for
    Euclidean distances." and "Processes independent ranges of the universe concurrently."
    Caption: "Optimization follows profiling: data loading and synchronization matter as much as
    arithmetic speed."

11. **Execution Reality & System Validation.** Mascot walks a path through five red barrier gates:
    "Look-Ahead Bias", "Cost Friction", "Regime Shift", "Exogenous Shocks", "Risk Limits"; a blue
    exit gate at the end. Captions verbatim: "Must enforce strict barriers between formation and
    trading windows." "Backtests must deduct fees, bid-ask spread, market impact, and borrow
    costs." "Distance and past zero-crossings are not guarantees. Recalibrate or retire pairs when
    relationships break." "Monitor earnings, corporate actions, delistings, and sector-wide
    structural breaks." "Enforce maximum holding periods and position/pair/sector limits."
12. **End screen with contacts.** Closing slide: mascot gives a final bow next to a hand-cranked
    letterpress that stamps out a web address. Text: "Thank you for watching.", "Contacts:
    https://marketmaker.cc", "MORE QUANT RESEARCH". Right 46% reserved as an empty blue-outlined
    16:9 zone labeled "NEXT VIDEO" for the clickable YouTube Studio element. Job:
    ba533909-8f9c-42c0-be05-c6fbc1a7ebb2.
