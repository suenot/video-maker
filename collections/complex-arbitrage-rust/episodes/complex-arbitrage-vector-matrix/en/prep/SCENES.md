# complex-arbitrage-vector-matrix (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host who pushes back, H2 = expert host),
14-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/complex-arbitrage-vector-matrix.en.md` (Part 4 of the series, dated 2026-02-26).

- Audio: `input/notebooklm-sources/complex-arbitrage-vector-matrix/en/audio.m4a`, 1412.17 s (23:32.2), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, per-word start/end in `words[]`). Timestamps below are segment starts in seconds (word-level where marked), accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_014.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: blueprint / engineering-drawing look. Warm off-white paper (#F1EFE8) with a faint square grid and crosshair registration marks; navy ink (#1B2D4F) for frames, text and diagrams; sage green (#5E8C61) = "the profitable cycle / the real signal / the good thing"; brick red-orange (#C4563A) = caveats ("QUANT CHECK", "MATHEMATICAL REVIEW FLAG"), anomalies. Thin double-line frames, mono (IBM Plex Mono style) body, grotesk sans titles, a few heavy slab-mono headline blocks. "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper mis-hearings, do not caption verbatim): "Sue and not" (69.2), "pseudonaut" (89.2), "solanot" (1319.1) = suenot; "ON cubed" (436.5, 442.4) = O(n³); "that and algebra library" (226.0) = the nalgebra library; "s lambda" / "s k lambda" (766.4, 784.9) = exp(λ) / exp(kλ); "tropical matte mole" (822.8) = tropical_matmul; "f64 dot Nag infinity" (827.9) = f64::NEG_INFINITY; "marchenko pastor" = Marchenko-Pastur; "can comp parafac" (1137.4) = CANDECOMP/PARAFAC; "finance" (1070.5, 1113.3, 1181.8) = Binance, "crack(en)" = Kraken; "on the flag writ" (1142.1) = "on the flat grid"; "epi claims" (1247.5) = API claims; "spending" (1247.5) = pending; "infinite order booked up" (1360.8) = infinite order-book depth; "throughout the rulebook" (619.8) = threw out the rulebook.

---

## Slide 1: Title. 0.0 to 116.2 (116.2 s, two sub-scenes)

**Content**
- Blueprint frame with crosshair marks. Upper right inside a corner-bracketed box: an isometric wireframe drawing of a 3D lattice: a large cube made of a 5x5x5-ish node grid (small circles at the nodes), extruded to the right into two thinner vertical grid "slices", with dimension lines and dashed projection lines between the blocks. A thick green path runs along the cube's front face, bends down and across into the second slice, then loops clockwise around the third slice with arrowheads (one cycle through the 3D structure; a tiny stray letter near the loop is an artifact, ignore).
- Title (heavy navy sans, two lines, bottom left): "Matrices, Tensors, and Tropical Algebra: / Linear Algebra for Arbitrage Detection"
- Subtitle: "Part 4: Complex Arbitrage Chains Between Futures and Spot"
- Mono title-block table (bottom left, like a drawing stamp): "Author: suenot" / "Date: 2026-02-26"

Article check: title, part 4, author and date match the article.

**1a. The trading-hall hook, 0.0 to 64.4** (redraw from the article's opening image; slide 2's "Market Chaos" panel can be previewed here)
- 0.0 "Imagine you are standing in the center of this massive cavernous hall"; 8.4 "hundreds, maybe thousands of traders ... an old-school trading pit"; 14.9 "all just shouting out different exchange rates simultaneously" / 19.2 "complete chaos" (speech bubbles with rates)
- 19.2 "you're standing there with a notebook"; 25.8 "trade your dollars for euros, those euros for yen, and then that yen back to dollars" (USD -> EUR -> JPY -> USD loop drawn in the notebook); 31.2 "walk out with more money than you started with"
- 36.0 "the classic arbitrage problem"; 43.4 "You'd be lost in seconds"
- 46.5 "take all of that shouting ... and instantly snap it into this highly structured mathematical grid" (bubbles collapse into a grid, 51.1); 57.6 "hidden profit routes basically just light up" (green cycle lights in the grid)

**1b. Title and source, 64.4 to 116.2**
- 64.4 "Welcome to another deep dive"; 69.2 "by an author named suenot, published on February 26th, 2026" (title block stamps in)
- 75.8 title read aloud: "Matrices, Tensors and Tropical Algebra: Linear Algebra for Arbitrage Detection" (title reveal); 80.1 "part four of a broader series ... on complex arbitrage chains"
- 89.2 "using high-level linear algebra to build that exact mathematical grid"; 95.8 "finding the underlying structure" (wireframe lattice draws itself, green path runs)
- 102.7 "whether you are a math geek, a crypto enthusiast ..."; 108.9 "fundamentally rewire how you think about market data"

## Slide 2: 1. The Exchange Rate Matrix: The Foundation. 116.2 to 125.3 (9.1 s)

**Content**
- Title (mono): "1. The Exchange Rate Matrix: The Foundation"
- Left framed panel "Market Chaos": 4 circle nodes in a square (BTC top-left, USDT top-right, ETH bottom-left, USDT bottom-right, the second USDT is a NotebookLM duplicate) joined by a tangle of curved arrows in navy, red-orange and green. Hand-rotated rate labels around the edges: "1 BTC = 50,000 USDT", "1 ETH -> 0.05 BTC", "0.00235", "1 USDT = 0.0002 ETH", "33.0531", "0.0752", "1 -> 0.6011 52 BTH" (garbled), "1 BTC = 18 ETH (DELAYED)", "1.087", "-0.0001", "1 ETH = 2000 USDT (HIGH SPREAD)". Footer: "**Problem:** Hundreds of traders, asynchronous rates, and venue quirks create a labyrinth of exchange routes."
- Big navy arrow pointing right.
- Right framed panel "Structural Clarity": a 3x3 table with row and column headers BTC, ETH, USDT:
  | | BTC | ETH | USDT |
  |---|---|---|---|
  | BTC | 1.000 | 18.5000 | 51200.00 |
  | ETH | 0.0540 | 1.000 | 2767.00 |
  | USDT | 0.0000195 | 0.000361 | 1.000 |
  Caption: "**Model:** The Exchange Rate Matrix R"
- Red elbow arrow from the table down to a box: "**Definition:** R[i][j] / Units of asset j obtained per unit of asset i."

NotebookLM errors (fix when redrawing):
- The chaos graph has two "USDT" nodes; make the fourth node SOL (the hosts list Bitcoin, Ethereum, Tether and Solana at 138.0).
- Chaos labels are garbled or impossible: "-0.0001" (a negative rate contradicts the positivity property at 193.5), "1 -> 0.6011 52 BTH", and "1 USDT = 0.0002 ETH" does not match "1 ETH = 2000 USDT" (that would be 0.0005). Redraw with a few clean, mutually inconsistent-looking quotes, all positive.
- The table itself is internally consistent (each lower entry is the reciprocal: 1/18.5 = 0.0540, 1/51200 = 0.0000195, 1/2767 = 0.000361; the cycle BTC->ETH->USDT->BTC = 18.5 x 2767 / 51200 = 0.9998, i.e. no arbitrage). Keep these numbers. The hosts say "four by four grid" (141.0) while the table is 3x3; if adding SOL, make it 4x4 with a SOL row/column, or keep 3x3 and do not show the "4x4" caption.

**Beats**
- 116.2 "let's start by building that map ... turn chaos into a table" (chaos panel, then arrow)
- 120.3 "section one, the exchange rate matrix, the foundation" (table appears)

## Slide 3: 1.1 From Chaos to Table. 125.3 to 317.2 (191.9 s, two sub-scenes)

**Content**
- Title (mono): "1.1 From Chaos to Table"
- Left framed panel: a 3x3 grid. A thick translucent green diagonal band through the three diagonal cells, each showing "1.0". Off-diagonal cells: "R[i][j]" (top right), "R[j][i]" (middle right), "R[i][i]" (bottom left, a NotebookLM label error, should be "R[j][i]"). Two curved green double-headed arrows link the R[i][j] cell with the mirrored cell across the diagonal. Below, bold-label list:
  - "**Diagonal:** R[i][i] = 1.0"
  - "**Positivity:** R[i][j] > 0"
  - "**Reciprocity (Idealized):** R[i][j] * R[j][i] = 1"
- Center framed code panel (mono, keywords navy bold, types green):
```rust
fn build_exchange_rate_matrix(
    assets: &[&str],
    rates: &[(usize, usize), f64)],
) -> DMatrix<f64> {
    // ... [setup boilerplate omitted]

    for i in 0..n { matrix[(i, i)] = 1.0; }
    for &((i, j), rate) in rates {
        matrix[(i, j)] = rate;
        if matrix[(j, i)] == 0.0 {
            matrix[(j, i)] = 1.0 / rate;
        }
    }
    matrix
}
```
- Right red-framed box: "**QUANT CHECK: Execution Caveat**": "The reciprocal idealization is a theoretical construct. Initializing an unquoted rate edge to 0.0, or filling a missing missing reciprocal strictly with 1.0 / rate, assumes frictionless markets. These mathematically constructed values do not represent executable market quotes." ("missing missing" is a NotebookLM typo; write it once.)

Article check: the three properties match section 1.1. Code: the slide's `rates: &[(usize, usize), f64)]` has a bracket typo; the article has `rates: &[((usize, usize), f64)]`. Use the article's full version (it starts with `use nalgebra::DMatrix;`, `let n = assets.len();`, `let mut matrix = DMatrix::from_element(n, n, 0.0);`, then the loops above with the comments `// Diagonal: exchange for self = 1` and `// Reciprocal rate (if there is no direct one)`).

**3a. Matrix and its three properties, 125.3 to 219.7**
- 125.3 "section 1.1, from chaos to table" (slide in)
- 133.9 "an n-by-n table"; 138.0 "four assets: Bitcoin, Ethereum, Tether and Solana ... a four by four grid. We call this matrix R"
- 147.5 "what number is actually in there?"; 155.2 "R[i][j] represents the units of asset j that you get per unit of asset i" (definition box)
- 162.5 "if asset i is a dollar and asset j is a euro, R[i][j] is how many euros I get for my one dollar"
- 174.4 "three mathematical properties"
- 181.4 "first is the diagonal: R[i][i] must equal one" (green diagonal band sweeps in); 185.7 "trading a dollar for a dollar ... does nothing"
- 193.5 "second is positivity: every R[i][j] must be greater than zero"; 202.6 "nobody is paying me to take their money"
- 207.4 "third is reciprocity: R[i][j] times R[j][i] equals one" (mirror arrows across the diagonal); 213.1 "if one dollar buys two euros then one euro must buy half a dollar, two times one half is one"

**3b. Code critique, 219.7 to 317.2**
- 219.7 "I have to pause here and push back a little on the source"
- 223.0 "the illustrative rust code ... using the nalgebra library and the build_exchange_rate_matrix function" (code types in, 226.0)
- 235.0 "they initialize an unknown reciprocal just by calculating one divided by the rate" (highlight `1.0 / rate`); 241.5 "if an edge is unquoted ... they literally set it to zero point zero" (highlight `0.0`, 246.8)
- 251.3 "You can't actually trade on a zero"; 256.9 "crash or ... do something terrible with my money"
- 259.8 "a really sharp catch"; 265.7 "initialized to zero and a reciprocal filled ... by simply taking one over the rate. Those are absolutely not executable market quotes" (QUANT CHECK box slides in, 270.5)
- 270.5 "a reciprocal idealization"; 277.9 "purely theoretical construct ... lacks real-world order book depth"
- 284.9 depth example: "a dollar buys two euros ... only ... for your first ten dollars"; 291.8 "trade a million dollars, that rate is gonna drop" (order-book depth staircase)
- 297.3 "ignores ... exchange fees"; 302.4 "can't just assume the reciprocal rate is perfectly available with infinite liquidity"
- 307.3 "the ideal version of the market"; 310.9 "the perfectly smooth map, not the messy pothole-filled reality you actually drive on" (map vs road gag; recurring "map vs territory" motif)

## Slide 4: 1.2 The No-Arbitrage Condition. 317.2 to 423.8 (106.6 s)

**Content**
- Title (mono, large): "1.2 The No-Arbitrage Condition"
- Left panel "The Theorem": four navy circle nodes on a ring: i1 (top), i2 (right), i3 (bottom), ik (left); green curved arrows clockwise i1 -> i2 -> i3 -> ik -> i1. Center label: "Cycle Product = 1".
- Right top: "**Theorem:** A market is free of arbitrage if and only if for any cycle of assets, the product of exchange rates along the cycle is equal to one." Formula: `R[i1][i2] * R[i2][i3] * ... * R[ik][i1] = 1`
- Right middle, "Rank-One Factorization": `R = 1/p ·` [4x4 grid with a diagonal ellipsis] `=` [column vector p1, p2, ..., pn] `·` [row vector p1 p2 ... pn] with superscript "pᵀ".
- Right bottom box "Vector Convention Check": "Under the multiplicative rank-1 formulation **R[i][j] = pⱼ/pᵢ**, the vector **p** represents equilibrium prices. Verifying whether an eigenvector represents **standard prices** or a **reciprocal-price convention** is critical; silent relabeling will break the mathematical model."

Article check: theorem and `R[i][j] = pⱼ / pᵢ`, `R = (1/p) · pᵀ` match section 1.2. NotebookLM error: the factorization graphic shows the column vector as (p1 ... pn); with R[i][j] = pⱼ/pᵢ the column must be (1/p1 ... 1/pn) times the row (p1 ... pn). Redraw as `R = (1/p₁, ..., 1/pₙ)ᵀ · (p₁, ..., pₙ)`.

**Beats**
- 317.2 "assuming we are looking at this ideal map, how do we actually know when it's out of whack"; 320.1 "section 1.2, the no-arbitrage condition" (slide in)
- 325.4 "a core theorem about cycles"; 329.6 "free of arbitrage if and only if for any cycle of assets the cycle product is one" (ring draws, label "Cycle Product = 1")
- 337.4 "trade asset one for asset two, then for asset three and back to asset one" (token travels i1 -> i2 -> i3 -> ik -> i1); 345.0 "the product ... has to be exactly one" (formula types in)
- 352.9 "I multiply all those exchange rates together and I end up with the exact same amount"; 357.6 "no free lunch"
- 363.5 "a really specific matrix property, which is rank one factorization"
- 371.6 "an outer product written as R equals 1 over p, p transpose" (factorization graphic, 379.4)
- 379.4 "someone listening while they're walking their dog" (optional gag)
- 387.7 "every R[i][j] can be perfectly calculated just by dividing pⱼ by pᵢ"; 397.6 "p is just a single list ... of the true underlying prices" (row vector fills with prices)
- 409.4 "collapsed down into just one single agreed-upon price list"; 417.2 "if it deviates from being rank one, then someone is mispricing something and an arbitrage opportunity is hiding somewhere in that grid" (one cell flashes green)

## Slide 5: 2. The Eigenvalue Method: Arbitrage in O(n³). 423.8 to 457.1 (33.3 s)

**Content**
- Title (mono): "2. The Eigenvalue Method: Arbitrage in O(n³)"
- Huge slab-mono headline in a navy-bordered box with a clipped top-right corner (and a second offset outline behind it): "Arbitrage Detection in O(n³) Complexity"
- Three boxes below:
  - Left "The Computational Shift:": "Instead of checking infinite node-path combinations (cycles), we analyze the singular **spectral footprint** of the entire matrix simultaneously."
  - Center chart: a spectrum plot, x axis with a row of short dashes at zero (about 12 dashes, eigenvalues = 0) and one tall navy spike near the right labelled in red "Value = n".
  - Right "The O(n³) Advantage:": "Eigenvalue decomposition algorithms provide a deterministic, bounded timeframe to evaluate the global market state."

Article check: matches section 2 (O(n³) eigen-decomposition). Fine.

**Beats**
- 423.8 "how do algorithms actually find those hidden profits when the market is imperfect?"
- 432.2 "section two, the eigenvalue method, arbitrage in O(n³)" (headline slams in); 442.4 "the article claims this method finds arbitrage in O(n³) complexity"
- 449.2 "O(n³) refers to how the algorithm's running time scales as you add more assets" (cube growing as n grows); 455.3 "reasonably efficient"

## Slide 6: 2.1 Ming Ma's Theorem. 457.1 to 603.1 (146.0 s, two sub-scenes)

**Content**
- Title (mono): "2.1 Ming Ma's Theorem"
- Center: a semicircular navy gauge (thick arc, tick marks) with "n" at the top center tick. The needle (navy, pivot at the bottom center) points into the right-hand segment, which is filled sage green and labelled "Arbitrage / Exists". Above, a curved dimension arrow from the "n" tick to the needle tip labelled "δ = λmax - n". "λmax" label near the pivot.
- Left box "The Rules":
  1. "If arbitrage-free, largest eigenvalue λmax = n, and all other eigenvalues = 0."
  2. "Vector v represents equilibrium prices."
  3. "Arbitrage exists if and only if λmax > n."
  4. "Spread δ estimates opportunity scale."
- Right red-framed box "QUANT CHECK: Foundational Assumptions": "The λmax > n criterion is mathematically pristine but strictly assumes a completely positive rate matrix and a frictionless execution environment. It fundamentally does not account for executable bid/ask spreads."

Article check: rules match section 2.1 (Ming Ma, 2007; λmax = n; others 0; λmax > n iff arbitrage; δ = λmax − n). Math correction raised by the hosts (and correct): with R[i][j] = pⱼ/pᵢ the **right** eigenvector for λ = n is (1/p₁, ..., 1/pₙ) (reciprocal prices), since Σⱼ (pⱼ/pᵢ)(1/pⱼ) = n/pᵢ; the left eigenvector is p. Rule 2 "Vector v represents equilibrium prices" should read "the eigenvector gives equilibrium prices up to the reciprocal convention (right eigenvector = 1/p)". The "if and only if" in rule 3 holds for reciprocal positive matrices (R[j][i] = 1/R[i][j]); keep that qualifier if space allows.

**6a. The theorem and the reciprocal quirk, 457.1 to 541.2**
- 457.1 "Ming Ma's theorem from 2007 is built on three pillars" (rules box)
- 463.7 "the largest eigenvalue, lambda max, equals n, the total number of assets"; 469.2 "all the other eigenvalues equal zero" (reuse slide 5 spike: one at n, rest at 0); 476.8 "the corresponding eigenvector represents the equilibrium prices"
- 484.0 H1: "if R[i][j] = pⱼ / pᵢ ... how does the eigenvector actually represent the prices?"; 495.1 "it felt backwards"
- 499.1 "a critical mathematical quirk"; 510.8 "multiplying that matrix by the actual price vector does not yield lambda max equal to n" (R·p, red ✕)
- 516.0 "the stated right eigenvector actually represents the reciprocal price convention" (R·(1/p) = n·(1/p), green ✓, 524.0); 526.3 "it represents one divided by the price"
- 532.6 "We cannot silently relabel this"

**6b. Delta and the frictionless caveat, 541.2 to 603.1**
- 541.2 "arbitrage exists if and only if lambda max is strictly greater than n" (needle swings past n into green)
- 548.3 "the difference ... they call delta"; 553.9 "delta equals lambda max minus n, that estimates the scale" (δ arc label)
- 559.5 "The bigger the delta, the bigger the profit. That is the source claim."
- 563.7 "a massive frictionless matrix caveat flag" (red flag; QUANT CHECK box)
- 570.0 "relies on those completely positive reciprocal idealizations"; 575.6 "completely frictionless trades ... no fees"; 581.8 "ignores whether there are actually executable bid and ask quotes"
- 591.2 GPS analogy: "finding a shortcut on a GPS but the map doesn't show that there's a brick wall blocking the alleyway" (gag, 593.3); 598.8 "But reality has friction"

## Slide 7: 3. Tropical (Max-Plus) Algebra: The Most Elegant Method. 603.1 to 619.8 (16.7 s)

**Content**
- Title (mono): "3. Tropical (Max-Plus) Algebra: The Most Elegant Method"
- Center band: two outlined squares with "+" and "×" on the left; a big navy chevron arrow with hatch stripes at its tail, white slab text "From Detection to Optimization"; two outlined squares with circled "⊕" and "⊗" on the right.
- Two boxes:
  - "The Paradigm Shift:": "Linear algebra tells us an arbitrage opportunity exists." / "Tropical algebra identifies the precise mathematical path required to optimally execute it."
  - "The Transformation:": "By redefining the fundamental rules of arithmetic, standard matrix multiplication automatically routes the most profitable path through the market graph."

Article check: consistent with section 3. Fine.

**Beats**
- 603.1 (word-level) "it transitions beautifully into the next approach"; 606.3 "section three ... tropical or max-plus algebra" (slide in); 611.1 "The most elegant method"
- 614.7 "completely redefine the rules of math we learned in grade school" (+ × morph into ⊕ ⊗ along the arrow)

## Slide 8: 3.1 When Addition Becomes Maximum. 619.8 to 694.8 (75.0 s)

**Content**
- Title (sans, large): "3.1 When Addition Becomes Maximum"
- Table (navy borders, bold headers, math in italic serif, ⊕ ⊗ in red-orange):
  | Operation | Classical Algebra | Tropical (Max-Plus) Algebra |
  |---|---|---|
  | Addition | a + b (Sum) | a ⊕ b = max(a, b) (Maximum) |
  | Multiplication | a × b (Product) | a ⊗ b = a + b (Path Weight Addition) |
- Callout box with a pointer notch at the "Multiplication" row: "**The Core Mechanism:** Under these redefined rules, executing a matrix multiplication operation inherently calculates the maximum sum of logarithmic weights across all possible structural routes."

Article check: matches section 3.1.

**Beats**
- 619.8 "section 3.1 is literally called 'when addition becomes maximum'"; 627.0 "the operation we normally call addition becomes finding the maximum of two numbers" (row 1)
- 633.7 worked example: "three plus five no longer equals eight, it equals five" (3 ⊕ 5 = 5)
- 641.1 "the operation we normally call multiplication becomes standard addition"; 646.8 "three times five becomes eight" (3 ⊗ 5 = 8, row 2)
- 652.1 "Why would anyone do that?"; 656.5 "standard matrix multiplication ... looking at all the possible combinations, summing them up"
- 660.5 "when addition is finding the maximum, the matrix multiplication automatically filters out all the lesser paths"; 669.2 "hunts down the single path with a maximum sum of weights, like a GPS rerouting itself" (many paths dim, one green path survives)
- 677.6 "the absolute most profitable route"
- 684.2 "how does that work with exchange rates? ... normally you multiply the rates" (transition question)

## Slide 9: 3.2 Tropical Eigenvalue and Arbitrage. 694.8 to 853.4 (158.6 s, three sub-scenes)

**Content**
- Title (sans): "3.2 Tropical Eigenvalue and Arbitrage"
- Left framed code panel (mono, the slide wraps lines awkwardly; redraw with clean formatting):
```rust
fn tropical_matmul(a: &DMatrix<f64>, b: &DMatrix<f64>) -> DMatrix<f64> {
    // ...
    for i in 0..n { for j in 0..m { for l in 0..k {
        let val = a[(i, l)] + b[(l, j)]; // Tropical multiplication (+)
        if val > result[(i, j)] {
            result[(i, j)] = val; // Tropical addition (max)
        }
    }}}
    result
}
```
- Right top box "Log Matrix Transformation:": `L[i][j] = ln(R[i][j])` / "Rates are transformed into logarithms to convert multiplicative paths into additive weights." / "**Signal:** A tropical eigenvalue λ > 0 strictly indicates an arbitrage cycle." ("Signal:" in green)
- Right bottom red-framed box "MATHEMATICAL REVIEW FLAG": "The source's unqualified claim that exp(λ) is the "profit multiplier of the best cycle" requires precision. Technically, tropical λ is the maximum max-plus cycle mean. Thus, exp(λ) represents a per-edge geometric-mean factor. A specific k-edge cycle will multiply by exp(kλ)."

Article check: the code matches the article's loop (the article also shows the setup: `let n = a.nrows(); let m = b.ncols(); let k = a.ncols(); let mut result = DMatrix::from_element(n, m, f64::NEG_INFINITY);`; show `f64::NEG_INFINITY` since it is narrated at 827.9). **Article error, correctly flagged by the deck and hosts:** the article says "exp(λ) is the profit multiplier of the best cycle". The tropical eigenvalue is the maximum cycle mean, so exp(λ) is the per-trade (per-edge) geometric-mean factor of the best-mean cycle, and that k-edge cycle multiplies capital by exp(kλ). Use the corrected version.

**9a. Log matrix and the tropical eigenvalue, 694.8 to 746.4**
- 694.8 "that is exactly where the log matrix comes in ... section 3.2, tropical eigenvalue and arbitrage" (slide in)
- 699.9 "take the natural log of all your exchange rates"; 707.4 "your new matrix L is the natural log of R" (`L[i][j] = ln(R[i][j])` types in)
- 713.7 "multiplying rates is mathematically identical to adding their logs" (ln(a·b) = ln a + ln b); 719.2 "tropical multiplication is standard addition. It aligns perfectly"
- 724.8 "calculate the tropical eigenvalue, which is lambda"; 731.6 "lambda greater than zero means arbitrage exists" (Signal line, green)
- 738.2 "the exponent of lambda, exp(lambda), is the best cycle profit multiplier" (show the article's claim in quotes, then...)

**9b. The review flag, 746.4 to 822.8**
- 746.4 "a very serious mathematical flag" (red flag box slams in; the "best cycle profit multiplier" quote gets a red asterisk)
- 760.0 "the tropical lambda is actually the maximum log cycle mean"; 766.4 "it's an average ... exp(lambda) is a per-edge geometric mean factor"; 774.1 "the average profit you make per step"
- 780.2 "if you have a k-edge cycle, say you make three trades in your loop"; 784.9 "the total profit multiplier of that cycle is actually exp(k lambda)" (3 hops: exp(λ) × exp(λ) × exp(λ) = exp(3λ))
- 793.9 "The article's unqualified wording ... needs a giant technical asterisk"
- 801.7 "if you think lambda gives you the total profit, but it's only giving you the average per step"; 810.7 "you might bet the farm"; 813.8 "barely made enough to cover the exchange fees"

**9c. The code, 822.8 to 853.4**
- 822.8 "an illustrative rust function for this called tropical_matmul" (code panel)
- 827.9 "nested loops that utilize f64::NEG_INFINITY to represent zero in this new math system"; 833.1 "negative infinity acts as the zero element"; 839.5 "taking the max of any number and negative infinity is just that number" (max(x, −∞) = x)
- 843.2 "replaces sum with max and multiplication with addition" (highlight the `+` and the `if val >` lines)

## Slide 10: 4. PCA and Factor Models: Statistical Arbitrage. 853.4 to 966.8 (113.4 s)

**Content**
- Title (sans): "4. PCA and Factor Models: Statistical Arbitrage"
- Big centered formula (mono): `rᵢ(t) = αᵢ + Σₖ (βᵢₖ * Fₖ(t)) + εᵢ(t)`
- Three callouts attached with thin lines and small circles:
  - Above, to Fₖ(t): "**Systematic Factor** / The general market drift (e.g., broad crypto index)."
  - Below, to βᵢₖ: "**Asset Loading** / The specific sensitivity of the asset to the systematic factor."
  - Below right, green thick border, to εᵢ(t): "**The Factor Residual** / The isolated variable that represents the raw statistical arbitrage signal."
- Bottom box (mono): "Moving from deterministic discrepancies (direct price lags) to statistical arbitrage by decomposing asset returns into systematic factors and idiosyncratic residuals."

Article check: formula matches section 4 (`ri(t) = αi + Σk βik * Fk(t) + εi(t)`; residual = arbitrage signal).

**Beats**
- 853.4 "everything we've talked about so far is deterministic arbitrage"; 857.0 "direct exact price discrepancies"
- 861.1 "a massive pivot here into statistical arbitrage"; 865.9 "section four, PCA and factor models, statistical arbitrage" (slide in)
- 873.0 "asset A is definitively cheaper than asset B right now" vs 878.8 "asset A is usually priced at 10% of asset B and right now that historical relationship is broken"
- 885.2 "principal component analysis or PCA"; 889.4 "break down asset returns into systematic factors and idiosyncratic residuals"
- 898.9 formula read aloud: "r_i of t equals alpha_i plus the sum of the factor loadings beta_ik multiplied by the factors F_k of t plus a residual epsilon_i of t" (type term by term; 906.2 Fₖ(t), 909.2 εᵢ(t))
- 909.2 ocean analogy: 916.3 "the systematic factor is the tide ... all the boats go up"; 922.1 "Bitcoin going on a bull run is a massive tide" (Systematic Factor callout)
- 922.1 "the loading, the beta, is how sensitive your specific boat is to that tide"; 930.3 "your boat is super light so it bounces higher" (Asset Loading callout)
- 930.3 "the residual, the epsilon"; 936.2 "someone doing a massive cannonball right next to your boat" (splash gag; Factor Residual callout lights green)
- 947.4 "the actual factor residual arbitrage signal"; 952.9 "cannot be explained by broad market factors"
- 958.6 "if that residual gets unusually big, it means the asset is temporarily mispriced relative to its peers"

## Slide 11: 4.1 Random Matrix Theory (RMT). 966.8 to 1064.7 (97.9 s)

**Content**
- Title (mono): "4.1 Random Matrix Theory (RMT)"
- Chart: y axis "Density" 0.00 to 0.45 (step 0.05); x axis "Eigenvalue Magnitude". Light grey filled bell-like density starting at about 0.25 at x = 0, peaking about 0.47 at x ≈ 0.65, decaying toward 2.0 and beyond. A heavy navy vertical line at x = 2.0 labelled "λ+". To the right of it, seven green dots (decreasing heights, about 0.26, 0.15, 0.10, 0.06, 0.05, 0.035, 0.025) = eigenvalues above the bound.
- Two boxes:
  - "Idiosyncratic Noise": "Eigenvalues inside the Marchenko-Pastur bound are mathematically indistinguishable from random covariance. These are discarded."
  - "Systematic Structure (The Arbitrage Zone)": "How many factors are actually real? Only eigenvalues exceeding the λ+ upper bound carry genuine structural market reality."

NotebookLM errors (fix when redrawing):
- x-axis tick labels are wrong: "0.0, 0.5, 1.0, 1.5, 2.0, 2.0, 2.5" (2.0 printed twice). Use evenly spaced 0.0 to 3.0 with λ+ wherever the curve ends.
- A Marchenko-Pastur density has hard edges: it is zero below λ− and above λ+. The drawn curve has a tail past λ+ and a non-zero value at 0. Redraw as a proper MP bulk between λ− and λ+ with the "signal" eigenvalues as separate spikes/dots to the right (in real markets the top one, the market mode, sits far to the right).
- "The Arbitrage Zone" label on the above-λ+ eigenvalues is misleading: per the article and slide 10, the eigenvalues above λ+ are the real **factors** (the tide) to keep in the model; the arbitrage signal is the **residual** εᵢ after removing them. Label the right side "Real factors (keep)" and the bulk "Noise (discard)".

**Beats**
- 966.8 (word-level) "But in a market with thousands of crypto assets, you have an ocean full of waves, tides and people doing cannonballs. How do you separate the true systematic market factors from just random market noise?"
- 974.8 "section 4.1 ... random matrix theory, or RMT" (slide in); 983.9 "the Marchenko-Pastur distribution"
- 987.9 "sounds like an incredibly intimidating math hurdle"; 994.7 "a brilliant filtering tool"
- 997.3 monkey gag: "a thousand monkeys ... at trading terminals, just mashing buttons and buying assets randomly" (monkeys at terminals)
- 1004.8 "analyze the eigenvalues of their covariance matrix"; 1014.1 "a very specific, predictable mathematical shape" (grey bulk draws); 1017.9 "That shape is the Marchenko-Pastur distribution"; 1021.8 "the exact mathematical fingerprint of pure randomness"
- 1029.5 "a strict upper mathematical boundary, which we call lambda plus" (λ+ line drops in)
- 1034.0 "lay your real world market data over this monkey trader randomness curve"; 1040.4 "any eigenvalues that stick out above that upper bound lambda plus are real systematic market signals" (green dots pop past λ+); 1047.0 "They are the true tides"
- 1049.2 "anything inside the boundary is just monkeys mashing keyboards ... filter it entirely out" (bulk fades)
- 1056.5 "like putting noise canceling headphones on your algorithm"

## Slide 12: 5. Tensor Methods: The Third Dimension of Arbitrage. 1064.7 to 1196.5 (131.8 s, two sub-scenes)

**Content**
- Title (sans): "5. Tensor Methods: The Third Dimension of Arbitrage"
- Formula box (mono): "T(asset, exchange, instrument) = price/rate"
- Isometric 3x3x3 cube of navy blocks with axes: Y (up) "Mode 2: Exchanges (Binance, Kraken)"; X (down-right) "Mode 1: Assets (BTC, ETH, SOL)"; Z (right) "Mode 3: Instruments (Spot, Perpetual, Futures)". Three blocks are red-orange (anomalies: one on the top-right edge, one front-center, one bottom-front); one top-right block is pulled out with dashed lines to a green cube floating outside; one block on the right face is green.
- Big navy arrow right to a box with a green inner frame and a green bracket line from the formula box: "**Arbitrage signal**" / "**The 3D Market Reality:** A 2D exchange matrix is only a single slice. CP-Decomposition factorizes the entire 3D tensor into a sum of rank-1 tensors." / "**Isolating Anomalies:** The residuals (T - T_approx) reveal highly localized mispricing anomalies where specific price/exchange/instrument combinations deviate from the overall market factor structure."

Article check: matches section 5 (modes, CP-Decomposition / CANDECOMP/PARAFAC, residuals T − T_approx). The article's Mode 2 list is "Binance, Kraken, Coinbase"; fine to add Coinbase.

**12a. The cube, 1064.7 to 1131.5**
- 1064.7 "crypto isn't just one big flat ocean"; 1067.9 "spot markets ... perpetual swaps ... futures contracts ... across dozens of different exchanges like Binance or Kraken"; 1078.3 "a 2D matrix feels way too flat"
- 1082.6 "the final and most complex analytical leap ... section 5, tensor methods, the third dimension of arbitrage" (slide in; the slide 2 matrix becomes one slice and the cube extrudes)
- 1092.0 "the market is really a 3D tensor ... T parameterized by asset, exchange and instrument" (formula box)
- 1100.8 "a tensor is just the generalization of a matrix into higher dimensions"
- 1106.2 "mode one is the assets, your bitcoin, your ethereum" (X axis); 1113.3 "mode two is the exchanges like Binance, Kraken" (Y axis); 1113.3 "mode three is the instruments, so spot, perpetual, futures" (Z axis, 1119.0)
- 1122.3 "a giant floating data cube"; 1128.1 "how do you find a mispricing inside a cube?"

**12b. CP decomposition and residuals, 1131.5 to 1196.5**
- 1131.5 "CP decomposition"; 1137.4 "also known as CANDECOMP/PARAFAC"
- 1142.1 "very similar to what we just did with PCA on the flat grid, but scaled up"
- 1147.8 "factorizes it into a sum of simple rank one tensors" (cube splits into a sum of outer-product "rods": a ∘ b ∘ c + ...)
- 1157.3 "the basic fundamental building blocks that cast its shadow"
- 1167.5 "looking for the residuals, the difference between the actual messy market cube and our perfectly smooth mathematical ideal cube" (T − T_approx; most blocks go grey, three stay red)
- 1181.8 "the price of an Ethereum perpetual future on Binance is mispriced relative to the entire 3D market factor structure" (one red block labelled ETH / Binance / Perp pops out)
- 1191.4 "the ultimate map of the market"

## Slide 13: The Execution Reality Gap. 1196.5 to 1280.2 (83.7 s)

**Content**
- Title (sans): "The Execution Reality Gap"
- Top box: "**Pristine Mathematical Signals:** Eigenvalues, Factor Residuals, Tropical λ, Spread δ" with a big navy down arrow into a 3-tier funnel (navy outlines, thin red-orange bands between tiers):
  1. "**Order-Book Depth:** Is there sufficient volume at the theoretical price to absorb the trade?" (icons: order-ticket sheet with up/down arrows on the left; stacked red/green depth bars with arrows on the right)
  2. "**Transaction Costs:** Do maker/taker exchange fees entirely erase the δ margin?" (coin stacks with % badges on both sides)
  3. "**Slippage & Venue Risk:** Can execution bridge the latency between calculating the tropical path and routing across" (text truncated on the slide; icons: clock on the left; a 4-node graph and two bank buildings linked through two exchange hexagons on the right)
- Funnel output: green box "Realized Executable Profit".
- Bottom red-framed box: "**Engineering Reality:** Factor residuals and eigenvalue thresholds alone do not establish executable profit. The provided Rust models require massive concurrency, latency optimization, and liquidity parsing for production HFT implementation."

Article check: not a section of the article (NotebookLM caveat slide), consistent with the article's frictionless math. Tier 3 text is cut off; complete it as "... routing across venues?".

**Beats**
- 1196.5 "I feel a reality check coming"; 1200.2 "CP decomposition residual anomalies and eigenvalue thresholds look absolutely brilliant on paper" (signals box) / 1208.9 "They do not establish executable profit on their own"
- 1211.5 "back to the map versus the territory" (callback to 310.9)
- 1214.7 "when you actually try to execute that incredibly complex 3D arbitrage"
- Funnel tiers fill as named (each shrinks the signal): 1219.4 "exchange fees that eat your margin" (tier 2); 1223.5 "liquidity limits" (tier 1) and "slippage, where the price moves against you" (tier 3); 1229.6 "timing delays between exchanges and ... venue risk"; 1234.2 "one exchange suddenly freezes your withdrawals ... in the middle of a multi-leg trade"
- 1241.2 "broad claims about using Rust for high frequency trading speed"; 1247.5 "those software and API claims about Rust's HFT speed remain attributed claims pending primary source checking" (Engineering Reality box)
- 1256.0 "the Rust code ... is purely illustrative"; 1264.0 "not plug-and-play production code ... to become a millionaire overnight"
- 1270.1 "a massive gap between identifying a mathematical anomaly in a tensor and actually capturing that value before ... some other algorithm does" (tiny trickle reaches "Realized Executable Profit")

## Slide 14: Conclusion. 1280.2 to 1412.17 (132.0 s, two sub-scenes)

**Content**
- Title (heavy slab mono): "Conclusion"
- 2x2 grid of boxes:
  - "2D Matrices": "Structuring the labyrinth of exchange chaos into a rigorous foundational baseline."
  - "Eigenvalues & Spectra": "Deterministic detection of arbitrage cycles bounded within O(n³) complexity." ("arbitrage cycles" in green, "O(n³) complexity" in red-orange)
  - "Tropical Algebra": "Redefining arithmetic logic to map and optimize the maximum log cycle mean."
  - "PCA & Tensors": "Isolating localized statistical residual anomalies across multi-venue, multi-instrument dimensions."
- Bottom strip left "Synthesis & Next Steps:": "Linear algebra provides the formal language required to map, filter, and conquer market chaos, whille Rust provides the theoretical speed engine. Next, the series explores neural network trading applications via GNN, Transformers, and RL for Arbitrage." ("whille" typo; GNN, Transformers, RL in green)
- Bottom strip right "Open Source Reference:": "Crunching high-dimensional signals? Check the Tensor-Based Trading Engine on GitHub (marketmaker.cc/tensor-trade-rust)."

NotebookLM errors: the repo URL is wrong on the slide. Article footer: **https://github.com/marketmaker-cc/tensor-trade-rust** (the hosts read it correctly at 1333.4). Fix "whille" to "while".

**14a. Recap and next part, 1280.2 to 1346.5**
- 1280.2 "we have gone on quite a journey today"; recap boxes light one by one: 1283.2 "simple tables of exchange rates" (2D Matrices); 1285.5 "O(n³) eigenvalue analysis and the quirks of reciprocal prices" (Eigenvalues & Spectra); 1292.1 "max-plus tropical algebra" (Tropical Algebra); 1297.6 "random monkey trader math to filter out market noise" and 1301.8 "multi-dimensional tensors" (PCA & Tensors)
- 1305.8 "linear algebra provides this incredibly formal powerful language"; 1313.8 "the shouting traders in that cavernous hall" (callback to 1a)
- 1319.1 "the next part of suenot's series"; 1323.5 "graph neural networks, transformers and reinforcement learning for arbitrage"
- 1333.4 "the tensor-based trading engine on GitHub at github.com/marketmaker-cc/tensor-trade-rust" (URL types in, 1340.8 to 1346.5)

**14b. Closing question, 1346.5 to 1412.17**
- 1346.5 "connect all of this mathematical theory to the bigger picture"; 1354.9 "mathematical models ... can perfectly map out market inefficiencies, but only in an ideal frictionless environment"; 1360.8 "no fees, zero latency and infinite order-book depth"
- 1370.4 "does the future of trading lie in ... faster, more mathematically complex algorithms to spot these matrix anomalies a microsecond before anyone else" (1374.7 to 1382.0)
- 1384.2 "or does the real edge lie in building the physical market infrastructure that eliminates the friction ..." (1389.0)
- 1399.4 "Are we trying to build a more complex map, or do we need to focus on paving the roads?" (map vs road callback)
- 1404.6 "the next time you're staring at a chaotic flashing wall of green and red numbers"; 1409.1 "Thanks for joining us ... see you next time" (end card)

---

## Timing notes

`sync_slides.py` (defaults) degenerated ("showed 7/14 slides, longest held 91%") and fell back to an even split, saved as `timeline_auto_evensplit.json`; do not use it.

`slide_starts.json` is set by hand from the hosts reading the section titles aloud; the deck follows the article's section order 1:1, plus one NotebookLM-only caveat slide (13).

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | intro (trading-hall hook; title read at 75.8) | high |
| 2 Exchange Rate Matrix | 116.2 | "let's start by building that map" / 120.3 "section one, the exchange rate matrix" | high (short, 9 s) |
| 3 From Chaos to Table | 125.3 | "they dive right into the section 1.1 from chaos to table" | high |
| 4 No-Arbitrage Condition | 317.2 | "assuming we are looking at this ideal map" / 320.1 "section 1.2 the no arbitrage condition" | high |
| 5 Eigenvalue Method O(n³) | 423.8 | "how do algorithms actually find those hidden profits" / 432.2 "section two, the eigenvalue method" | high |
| 6 Ming Ma's Theorem | 457.1 | "Ming Ma's theorem from 2007 is built on three pillars" (2.1 is named together with 2 at 436 to 442) | medium |
| 7 Tropical algebra | 603.1 | word-level "it transitions beautifully into the next approach" / 606.3 "section three ... tropical" | high |
| 8 Addition becomes max | 619.8 | "Section 3.1 is literally called when addition becomes maximum" | high |
| 9 Tropical eigenvalue | 694.8 | "that is exactly where the log matrix comes in, so looking at section 3.2" | high |
| 10 PCA / factor models | 853.4 | "everything we've talked about so far is deterministic arbitrage" / 865.9 "section four" | high |
| 11 RMT | 966.8 | word-level "But in a market with thousands of crypto assets" / 974.8 "section 4.1" | high |
| 12 Tensor methods | 1064.7 | "But wait, crypto isn't just one big flat ocean" / 1082.6 "section 5, tensor methods" | high |
| 13 Execution reality gap | 1196.5 | "I feel a reality check coming on" (not a numbered section) | medium |
| 14 Conclusion | 1280.2 | "Man, we have gone on quite a journey today" | high |
