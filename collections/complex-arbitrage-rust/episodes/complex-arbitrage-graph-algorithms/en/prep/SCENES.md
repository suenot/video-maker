# complex-arbitrage-graph-algorithms (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
15-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/complex-arbitrage-graph-algorithms.en.md`.

- Audio: `input/notebooklm-sources/complex-arbitrage-graph-algorithms/en/audio.m4a`, 1385.88 s (23:05.9), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, so every segment has a `words[]` array with per-word start/end; use it for frame-exact beats). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: warm off-white paper background (#F2F0EA-ish), charcoal ink (#2B3038) for lines and text, mustard/amber accent (#C98B1C) for "the profitable path / the good thing", oxblood/brick red (#8B2A2A) for caveats, losses, hazards. Mix of grotesk sans titles and monospace labels. Small "Gemini Notebook" watermark bottom right on every slide (do not redraw).

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "Suanaut" = suenot, "Belmond Ford / Belman Ford" = Bellman-Ford, "PetGraph" = petgraph, "VEC deck" = VecDeque, "H.P.L.2.6" = "H2 6", "Ridge" (1344.1) = RICH, "cube based" (1291.9) = queue-based, "bare middle" (1228.7) = bare-metal, "traits" (561.3) = trades, "notes" (638.6) = nodes. The hosts read the article's markdown heading levels aloud ("H2 1.1", "H3 1.2"), which makes them reliable slide-change markers.

---

## Slide 1: Title. 0.0 to 181.5 (181.5 s)

**Content**
- Title (2 lines, large dark sans, "Arbitrage" in bold): "Graph Algorithms for **Arbitrage** Detection: / From Bellman-Ford to RICH"
- Subtitle: "How negative cycles, multi-asset graphs, and the RICH algorithm identify arbitrage opportunities in the deep cryptocurrency market with sub-millisecond precision."
- Mono byline: "Authors: suenot | Date: 2026-02-23 | Part 1 of the series 'Complex Arbitrage Chains Between Futures and Spot'"
- Diagram (lower center): 4 rectangular nodes with mono labels, layout like a diamond: BTC (left), ETH (top), SOL (right), USDT (bottom). Thin charcoal double-headed / two-way arrows connect every pair (complete graph K4: BTC-ETH, BTC-SOL, BTC-USDT, ETH-SOL, ETH-USDT, SOL-USDT). Overlaid thick amber arrows mark one directed cycle: BTC -> ETH -> SOL -> USDT -> BTC (clockwise around the outside).

**Beats**
- 0.0 "usually when you look at a market ... assumption of intense, unbreakable efficiency" (perfect "physics engine" market)
- 29.7 "But then you step into the world of cryptocurrency" / 33.4 "that perfect physics engine starts to glitch"
- 40.9 "fragmented across hundreds of different platforms"; 47.8 "a fragmented organism of pure volatility"
- 62.3 "Welcome to a brand new deep dive"; 68.7 article "published on February 23rd, 2026 by ... suenot"
- 74.6 title read aloud: "Graph Algorithms for Arbitrage Detection from Bellman-Ford to RICH" (reveal title)
- 83.5 "thousands of prices shifting every single second"; 91.2 "temporary price discrepancies constantly emerge"
- 95.8 article claims "risk free profit" (hosts later dispute this, plant a question mark)
- 103.2 not "buying Bitcoin low on one exchange and selling it high on another"
- 111.0 "starting with Bitcoin, trading it for Ethereum, then moving to Solana, converting that to USDT, and finally buying back into Bitcoin" (animate amber cycle BTC -> ETH -> SOL -> USDT -> BTC hop by hop: ETH 111.0+, SOL ~114, USDT 116.9, BTC ~120)
- 122.4 "more Bitcoin than you started with"; 124.1 "It sounds like magic, but it's math"
- 131.2 "millions of possibilities in real time"
- 141.9 "the journey from a mathematical theory on a whiteboard to a functioning submillisecond trading bot is fraught with profound engineering challenges"; 157.0 "anything but risk free"
- 168.3 "translate the crypto market into a structural language that computers actually understand. We need a model" (transition)

## Slide 2: 1. The Market as a Graph / 1.1 Vertices and Edges. 181.5 to 344.9 (163.4 s)

**Content**
- Title "1. The Market as a Graph"; subtitle "1.1 Vertices and Edges"; tagline "Mapping millions of live market pairs into a measurable mathematical universe."
- Left panel, mono header "ORDER BOOK CHAOS": a horizontal depth-chart: ~21 rows of bars; left side charcoal bars (bids) of varying length ending at a central vertical axis, right side oxblood/red bars (asks) and a few charcoal bars of varying length. A dashed amber square "zoom" box with a crosshair in its center straddles the mid-price area; an amber arrow leads right from the box to the graph panel.
- Thin vertical divider between panels.
- Right panel, mono header "GRAPH THEORY MODEL": a triangle of 3 large dark filled circles with white mono labels: BTC (top), USDT (bottom right), ETH (bottom left). Directed edges: BTC -> USDT labelled "R(BTC, USDT)" (rotated along edge), USDT -> ETH labelled "R(USDT, ETH)", ETH -> BTC labelled "R(ETH, BTC)" (rotated).
- Callouts with thin arrows:
  - "**Vertices (Nodes):** Assets (BTC, ETH, USDT)" with arrows pointing to BTC, to the ETH node and to an edge.
  - "**Edges (Links):** Trading pairs (BTC/USDT, ETH/BTC)" pointing at the BTC -> USDT edge.
  - "**Weights:** The exchange rate, R(i, j)" pointing at the R(BTC, USDT) label.
- Boxed formula (bottom right), header "MULTIPLICATIVE CYCLE CONDITION": `R(i₁, i₂) × R(i₂, i₃) × … × R(i_k, i₁) > 1`

Article check: matches section 1.1 exactly (vertices, edges, weights, formula). R(i, j) = amount of asset j received for 1 unit of asset i.

**Beats**
- 181.5 "Let's move into H2 1.1, the market as a graph" (slide in)
- 188.6 "H3 1.1 vertices and edges"
- 195.5 "The market is mapped as a directed graph"
- 198.3 "The vertices or nodes represent the actual assets" / 203.3 "Bitcoin, Ethereum, USDT" (nodes pop in)
- 207.3 "the edges ... represent the trading pairs"; 212.5 "an edge connecting Bitcoin to USDT represents the BTC USDT market" (draw BTC -> USDT)
- 220.4 "buying Ethereum with Bitcoin isn't always the exact same ... as selling Ethereum for Bitcoin, the direction matters"; 230.9 "That is why it is a directed graph"; 233.8 "The arrows only point one way" (arrowheads)
- 236.9 "the weights of these edges, which simply represent the exchange rates" (R labels)
- 244.5 flight-map analogy: "intricate international flight map ... every time you landed, the airline handed you slightly more money" (optional gag: plane hopping nodes, coins appear)
- 266.6 "a rate denoted as capital R with parameters i and j ... how much of asset j we get for one unit of asset i"
- 273.2 "multiplicative cycle condition"; 287.8 "multiply the exchange rates of a closed loop ... must be greater than one"
- 298.9 formula read aloud "R i1 i2 times R i2 i3 times ... R ik i1 greater than one" (type formula term by term, "> 1" lands ~310.1)
- 317.6 "You end up with more than you started with"
- 320.4 "a massive chain of multiplications across thousands of assets sounds incredibly heavy"; 332.7 "isn't multiplication an expensive operation for a CPU to do millions of times a second?"

## Slide 3: 1.2 From Multiplication to Addition. 344.9 to 481.5 (136.6 s)

**Content**
- Title "1.2 From Multiplication to Addition"; subtitle "Equation Transformation pipeline"; tagline "Converting multi-leg profit calculations from heavy multiplication to rapid addition."
- Vertical flowchart, center:
  1. Rectangle (thick charcoal border), mono "R > 1", side label "Multiplicative Condition".
  2. Down arrow to a diamond with "ln(a × b) = ln(a) + ln(b)", side label (left) "Function gate".
  3. Down arrow to an amber-bordered rectangle "w = -ln(R)", side label "Sign-Preserving Transformation (Additive Weight)".
  4. Amber down arrow into a wide double-framed box (segmented frame like a ruler): large mono `(-ln(R₁)) + (-ln(R₂)) + … + (-ln(R_k)) < 0`, caption under it "Additive Cycle Condition for Arbitrage (Negative Cycle Detection)".
- Right side rounded box connected to the diamond by a thin line: "**Transformation Rationale**: To find an arbitrage opportunity, every edge is assigned weight w = −ln(R). The task is now to find a cycle with a negative total weight."

Article check: matches section 1.2. Intermediate step not on slide but spoken and in article: `ln(R₁) + ln(R₂) + … + ln(R_k) > 0`.

**Beats**
- 344.9 "H three, one point two from multiplication to addition" (slide in)
- 357.7 "Computers can perform addition significantly faster than ... multiplication"
- 363.5 "shortest path algorithms ... designed to sum up distances, not multiply them"
- 377.6 "We use logarithms" (diamond)
- 379.0 / 388.1 "ln of a times b equals ln of a plus ln of b"
- 394.2 "heavy multiplicative condition becomes a much faster additive one"
- 402.1 "ln r one plus ln r two plus ... plus ln r k greater than zero" (show intermediate > 0 form)
- 418.9 "if these algorithms are designed to find the shortest path ... why are we looking for a sum greater than zero?"
- 434.8 "we convert this into a search for a negative cycle"; 440.2 "We multiply everything by minus one" (flip signs, > becomes <)
- 443.9 "minus ln r one plus minus ln r two ... less than zero" (final box)
- 456.2 "a highly profitable route ... appears to the computer as a deep negative distance"
- 461.9 "It is a sign preserving conversion"; 467.9 "w equals minus ln r" (amber box)
- 474.2 "flight paths weighted in negative numbers"; 476.6 "How do we actually tell a computer to search ..." (transition)

## Slide 4: 2. Classical Approach: Bellman-Ford / 2.1 The Algorithm in Rust. 481.5 to 592.0 (110.5 s)

**Content**
- Title "2. Classical Approach: Bellman-Ford"; subtitle "2.1 The Algorithm in Rust"; tagline: The "Hello World" of arbitrage detection relies on identifying negative cycles.
- Code panel (light box, mono), exactly:

```rust
use petgraph::graph::{DiGraph, NodeIndex};
use petgraph::algo::bellman_ford;

fn find_arbitrage_bellman_ford(
    graph: &DiGraph<&str, f64>,
    start_node: NodeIndex
) -> Option<Vec<NodeIndex>> {
    match bellman_ford(graph, start_node) {
        Ok(_) => None,
        Err(error) => {
            println!("Arbitrage detected!");
            None
        }
    }
}
```
  (The article version also has comments: `// Bellman-Ford returns distances or an error if a negative cycle is found`, `// No negative cycles` after `Ok(_) => None,`, and `// In a real implementation, we would reconstruct the cycle // using the predecessor map from the error`. The slide omits them.)
- Three red caveat boxes (pale red fill, oxblood border, "CAVEAT:" in bold oxblood), connected by dashed red arrows:
  - Top: "CAVEAT: This petgraph snippet is illustrative, incomplete, and uncompiled." arrow into the `fn` line (left side of code).
  - Right middle: "CAVEAT: Prints detection but explicitly returns None even on the error path." arrow to the `Err(error) => {` line.
  - Right bottom: "CAVEAT: It does not reconstruct the actual arbitrage cycle." arrow to the `-> Option<Vec<NodeIndex>> {` line.

**Beats**
- 481.5 "We move to H2, 2 ... Classical approach. Bellman-Ford" (slide in; note hosts say "2.2" by mistake)
- 486.1 "the Hello World of Arbitrage Detection"
- 497.5 "implementing this in ... Rust"; 501.8 "H3, 2.1, the algorithm in Rust"
- 506.6 "a popular Rust crate called petgraph" (use lines)
- 511.6 "sets up a DiGraph ... uses a node index ... calls a Bellman-Ford function" (highlight fn signature, then match line)
- 527.5 "strictly illustrative"; 531.3 "incomplete and as written is uncompiled" (caveat 1)
- 538.5 "Look at the error handling"; 539.8 "error path, which ironically is exactly what happens when it successfully finds the negative cycle" (highlight Err arm)
- 545.9 "prints Arbitrage Detected"; 554.0 "it returns none even on that error path" (caveat 2)
- 557.9 "the bot basically yells, hey, I found free money"; 561.3 "completely fails to reconstruct the actual cycle" (caveat 3)
- 568.5 "reconstruct the cycle using the predecessor map"
- 583.9 "We have not independently verified any production readiness here"

## Slide 5: 2.2 Complexity and Limitations. 592.0 to 673.9 (81.9 s)

**Content**
- Title (mono) "2.2 Complexity and Limitations"; tagline "Mathematical certainty bottlenecked by scale and execution speed."
- Center: a funnel. Bracket header "Thousands of Assets" spans the wide top. Inside the mouth: a dense tangle of ~50 small dark squares and triangles linked by many tiny arrows. The funnel narrows to a vertical pipe; red flow lines run down the inside of the neck; small squares pass in single file down the pipe; an arrow exits at the bottom.
- Left of the pipe, large serif math: `O(V × E)` with a leader line to the pipe; under it mono "(where V = assets, E = pairs)".
- Bottom left: check-circle icon "**Pros:** Guarantees finding a cycle if it exists."
- Bottom middle: x-circle icon "**Cons:** Too slow for High-Frequency Trading (HFT) when asset counts grow."
- Bottom right framed inset: an x/y axis chart with small amber triangle-cycles in a row (left to right); a magnifying glass is over the middle ones; a red vertical bar/gate cuts through the lens, passing only one cycle. Caption: "**The One-Source Limitation:** Algorithm only outputs a single cycle at a time."

Article check: O(V × E) with V = assets, E = trading pairs; pros/cons match. "500 assets and 10,000 trading pairs" is the hosts' own example, not in the article.

**Beats**
- 592.0 "H3, 2.2 complexity and limitations" (slide in)
- 598.6 "Bellman-Ford runs in O of V times E ... V being the number of vertices or assets and E ... trading pairs" (formula)
- 614.0 "looping through every single edge in the entire graph V minus one times"
- 621.1 "assumes the absolute worst case ... checks everything"
- 628.7 "if it rigorously guarantees finding a negative cycle, why not just use it?" (Pros)
- 636.5 "Because of the single source limitation"; 638.6 "from one single starting node"; 643.2 "It only finds one cycle at a time" (inset)
- 646.9 "500 different crypto assets and 10,000 trading pairs"; 651.3 "millions of checks" (funnel clogs)
- 656.2 "over and over as prices update every millisecond is simply too slow for high frequency trading" (Cons)
- 662.4 "how do we tell the computer to stop checking dead ends?" (transition)

## Slide 6: 3. SPFA: A Faster Alternative. 673.9 to 781.2 (107.3 s)

**Content**
- Title (mono, large) "3. SPFA: A Faster Alternative", thin rule under it; tagline "Bypassing redundant calculations through active queue management."
- Faded mono code, top: `use petgraph::algo::spfa_negative_cycle;` and `fn find_arbitrage_spfa(graph: &DiGraph<...>, start: ...) -> Option<Vec<...>> {` (partly overlapped by the "VecDeque" label).
- Center: a conveyor belt labelled "**VecDeque**" (a rounded loop track with a hatched belt and two rollers, a curved return arrow at the top running right-to-left back to the front). On the belt, 8 amber shapes linked by amber arrows left to right: square "Node A", triangle "Node C", square "Node G", circle, triangle, square, circle "Node E", square.
- Left (entry side): grey dashed shapes feeding into a grey circle at the belt entry: dashed square "Node B (Stagnant)", grey triangle, grey circle "Node D (Redundant)", dashed arrows between them.
- Right (exit side): grey arrows fan out to a dashed triangle "Node D (Redundant)", grey circle "Node F (Inactive)", and another grey circle.
- Faded mono code, lower right: `while let Some(node) = queue.pop_front() {` / `if new_dist < dist[neighbor] {` / `dist[neighbor] = new_dist;` / `queue.push_back(neighbor);` / `}`
- Center box (amber outer frame, black inner frame): "**Source practical runtime claim:** O(k × E) where k ≪ V, highly efficient for sparse market graphs."
- Bottom full-width red caveat bar: "CAVEAT: Source-claimed practical speed is observed behavior; it does not represent a worst-case mathematical bound."

Article check: O(k × E), k ≪ V, sparse market graphs: matches. **Discrepancy**: the article's SPFA code is a hand-written `fn spfa_negative_cycle(n: usize, adj: &Vec<Vec<(usize, f64)>>) -> bool` using `std::collections::VecDeque` with `dist`, `count`, `in_queue` arrays and `if count[v] >= n { return true; }`. The slide's `use petgraph::algo::spfa_negative_cycle;` and `fn find_arbitrage_spfa(...)` are NotebookLM inventions. When redrawing, prefer the article's code (key lines: `while let Some(u) = queue.pop_front()`, `if dist[v] > dist[u] + weight`, `count[v] = count[u] + 1`, `if count[v] >= n { return true; // Negative cycle detected }`, `queue.push_back(v)`).

**Beats**
- 673.9 "This brings us to H2, 3. SPFA, a faster alternative" (slide in, ~677.6)
- 681.4 "shortest path, faster algorithm"; 685.0 "a highly optimized variant of Bellman-Ford designed specifically to skip unnecessary work"
- 696.5 "Did the distance to this specific node actually change in the last round?" (grey stagnant nodes stay out)
- 702.1 "It uses a queue system"; 705.0 "uses a VecDeque" (belt label)
- 709.0 "if a node's distance hasn't changed ... doesn't waste time reevaluating them"
- 719.5 "pulls from the front of the queue, updates neighbors"; 723.5 "that neighbor goes to the back of the queue" (pop_front / push_back animation)
- 727.9 "That queue behavior is the secret to its speed"
- 733.2 "SPFA runs in practice at O of K times E, where K is ... much smaller than V" (claim box)
- 746.6 "a practical speed claim based on typical sparse market graphs"; 754.5 "not a mathematically guaranteed worst case bound" (caveat bar)
- 760.5 "In the absolute worst case ... SPFA can perform just as poorly as the original Bellman-Ford"
- 771.1 "even SPFA is just a general purpose computer science tool ... wasn't purpose built specifically for finance" (transition)

## Slide 7: 4. Modern Research: The RICH Algorithm. 781.2 to 812.9 (31.7 s)

**Content**
- Title "4. Modern Research: The RICH Algorithm"; tagline "Transitioning from generic pathfinding to high-profitability cyclic targeting."
- Left: a vertical timeline line with one tick "2024", then "**RICH** (Rapid Identification of Cyclic High-profitability)".
- Two framed panels with corner brackets (like a scope/viewfinder), each containing a big circle with crosshair axes:
  - "Bellman-Ford": ~16 nodes (triangles and squares) with charcoal and red curved arrows forming several loops (an inner ring, a small loop on the right). Bottom-left a small triangle cycle is highlighted amber with a glowing ring and target ticks. Caption: "Targets the first available cycle."
  - "RICH": a much denser graph (~80 small nodes) with many tiny percentage labels on edges (e.g. +0.5%, +8.1%, -0.1%, +1.2%, -8.3%, +0.01%, -0.25 ... charcoal ones positive, red ones negative). On the right a large glowing amber ring (cycle of ~8 triangles with arrowheads) with a black crosshair reticle locking on its left edge. Caption: "Optimized for millisecond updates to lock onto the most profitable cycle."

Article check: 2024, "Rapid Identification of Cyclic High-profitability", most profitable not any cycle, weights change every millisecond, small to medium graphs ("hundreds of assets"): matches. The edge percentages are decorative, not data.

**Beats**
- 781.2 "H2 4, modern research, the RICH algorithm" (slide in)
- 786.5 "RICH stands for rapid identification of cyclic high profitability" (expand acronym letter by letter)
- 791.6 "introduced in 2024" (timeline tick)
- 800.8 "tailored to the quirks of financial markets, small graphs, constant updates, and ... find the best cycle, not just any cycle" (left panel locks first cycle, right panel reticle locks on biggest ring)

## Slide 8: 4.1 Key Innovations of RICH. 812.9 to 905.5 (92.6 s)

**Content**
- Title "4.1 Key Innovations of RICH"; tagline "Three architectural shifts designed to outpace millisecond market movements."
- Three framed columns:
  1. "**Pruning**": a graph of ~15 white circles and 3 dark squares with grey arrows; a few amber arrows mark a surviving path; a big pair of scissors cuts through the lower middle edges. Caption: "Discards paths that cannot possibly lead to a profitable cycle based on the current best-known path."
  2. "**Layered Search**": three stacked isometric planes. Top: a 5-node cycle (circles). Middle: a 4-node cycle (faint) / 3 visible circles. Bottom (amber edge): a glowing amber triangle cycle (3 triangle nodes). Each plane has a bracket to a bitmask block "01001 / 00110 / 10101" with "110" in "00110" highlighted amber. Caption: "Searches for cycles of increasing length using bitmask state tracking optimizations."
  3. "**Incremental Updates**": a faded grey network (~20 nodes, outer ring); a central glowing amber node radiates amber arrows to ~8 neighbors (circles and squares, amber outlined), the rest stays grey. Caption: "Only updates the localized graph areas affected by a price change, bypassing full re-runs."

Article check: matches section 4.1. Article specifies cycle lengths "3-legs, 4-legs, 5-legs" (the slide's planes: 5, 4, 3 nodes).

**Beats**
- 812.9 "Let's look at H3 4.1. Key innovations of RICH" (slide in)
- 821.6 "three major innovations"; 824.3 "The first is pruning" (column 1)
- 826.3 "maintaining a threshold ... discards any paths that mathematically cannot beat the current best known profitable cycle" (scissors snip)
- 834.9 maze analogy: "a certain corridor is a dead end before it even walks down it"
- 847.4 "The second innovation is layered search" (column 2)
- 852.4 "long, meandering cycles with 10 different trades are usually terrible ideas"
- 858.6 "short cycle chains, like three legs, four legs or five legs" (planes light up 3, 4, 5)
- 863.9 "bit mask operations directly at the CPU level" (bitmasks flip)
- 870.7 "pruning cuts the dead ends and layered search keeps the hops short"
- 877.7 "If the price of Bitcoin drops by 10 bucks on Binance, does the algorithm have to ... remap the entire board?"
- 885.4 "the third and perhaps most crucial innovation. Incremental updates" (column 3, ~889.1)
- 890.8 "If one price changes, RICH does not start over"; 895.3 "it isolates the change ... only updates the specific parts of the graph" (amber ripple from center node)
- 901.0 "The rest of the market map stays intact"

## Slide 9: Algorithm Synthesis Matrix. 905.5 to 926.1 (20.6 s)

**Content**
- Small kicker "Premium Financial Research Dossier"; title "Algorithm Synthesis Matrix"; tagline "Evolutionary overview of arbitrage detection architectures."
- 4-column table, thin black rules; the RICH column has a pale amber gradient fill:

| Dimension | Bellman-Ford | SPFA | RICH |
|---|---|---|---|
| **Core Mechanic** | Full relaxation | Queue-based relaxation | Pruning & Layered Search |
| **Cycle Target** | First detected cycle | First detected cycle | Most profitable cycle |
| **Speed / Complexity** | O(V × E) | Practical O(k × E) | Optimized for millisecond incremental updates on small/medium graphs |
| **Primary Bottleneck** | One-source limitation | Worst-case edge redundancy | Complexity of bitmask state tracking |

Article check: entries are consistent with the article; the "Primary Bottleneck" for RICH is a NotebookLM inference, not stated in the article.

Narration does not discuss the table; this is a short recap bridge.

**Beats**
- 905.5 "So we have this state of the art RICH algorithm finding the absolute most mathematically profitable cycles in fractions of a millisecond" (build table column by column, RICH column last)
- 913.9 "this is where the pristine math collides with the messy reality of the actual market"
- 919.6 "Identifying a negative cycle in a Rust program does not magically put dollars in your bank account"

## Slide 10: 5. Implementation Challenges: Fees and Liquidity / 5.1 Incorporating Fees. 926.1 to 988.3 (62.2 s)

**Content**
- Title "5. Implementation Challenges: Fees and Liquidity"; subtitle "5.1 Incorporating Fees"; tagline "Execution costs severely prune theoretical mathematical loops."
- Big framed box, header "Reality vs. Theory", split in two:
  - Left "Theory": triangle of circled nodes A (top), B (bottom left), C (bottom right); arrows A -> C (down right), C -> B (left), B -> A (up left); soft amber glow along the edges; amber label "Theoretical Profit".
  - Right "Reality": the same triangle A, B, C; red kettlebell-style weights hang on edge A-B and on edge B-C; edge A-C is cracked with red fracture lines and a red X; red label "Pruned / Unprofitable". Below, double-framed formula: `w = −ln(R × (1 − fee))` with "(1 − fee)" in amber.

Article check: `w = -ln(R × (1 - fee))`, three fees for A -> B -> C -> A: matches. Note: the Theory triangle on the slide runs A -> C -> B -> A, while the narration says "A to B, B to C and C back to A". Pick one direction and keep it.

**Beats**
- 926.1 "H2 5 implementation challenges, fees and liquidity" (slide in)
- 932.0 "This is where we leave the theoretical sandbox"; 935.5 "Every single hop in a cycle costs money"
- 940.8 "H3 5.1, incorporating fees"
- 944.3 "from asset A to B, B to C and C back to A, you are incurring three separate exchange fees" (three fee weights drop onto edges, one per leg)
- 954.8 "an adjusted formula"; 957.7 "W equals negative log R times one minus fee" (formula types in, "(1 − fee)" amber)
- 967.3 "deduct the fee percentage from the exchange rate before taking the logarithm"
- 975.5 "it drastically prunes the graph"; 978.4 "wipes out countless theoretical arbitrage cycles" (edge cracks, red X, "Pruned / Unprofitable")
- 982.4 "would simply bleed your account dry in trading fees"

## Slide 11: 5.2 Liquidity and Slippage. 988.3 to 1069.1 (80.8 s)

**Content**
- Kicker "Premium Financial Research Dossier"; title "5.2 Liquidity and Slippage"; tagline "Scaling volume bends the edges of the arbitrage graph."
- Left chart, title "Slippage Curve: Execution Price vs. Volume", inside a thick dark frame:
  - Y axis "Execution Price (Relative to Mid-Market)", ticks top to bottom "+", "+", "0", "-2", "-4" (the top two ticks are just "+", unlabelled numbers).
  - X axis "Trade Volume ($USD)", ticks "$100", "$2,500", "$5,000", "$7,500", "$10,000".
  - Horizontal line at 0 labelled "Zero-Profit Baseline".
  - Curve: starts high at $100 (amber), decays convexly, crosses zero at about $4,800 to $5,000, turns oxblood, and drops steeply to -4 at $10,000. Area above 0 hatched amber with an up arrow "Net Profit"; area below 0 hatched red with a down arrow "Net Loss (Depleted Order-Book Depth)".
- Right top box, header "Parametric Weights": "Edge weight 'w' becomes a **function** of volume 'V', turning shortest-path search into **Convex Optimization** on a graph."
- Right bottom red box, header with warning triangle "Explicit Caveat:", body (mono): "**Explicit Caveat:** Volume-dependent weights alone do not mathematically prove the optimization problem on a graph is convex."

Article check: "A cycle that looks profitable for $100 might be a loss for $10,000": matches the x-axis ends. Parametric weights / convex optimization: matches. The caveat is NotebookLM's critique (not in the article). The curve shape and y values are illustrative, not data. Narration also says "$10" and "$10 million" (1000.1) as the hosts' own exaggeration; on-screen numbers should stay $100 / $10,000.

**Beats**
- 988.3 "H3 5.2, liquidity and slippage" (slide in)
- 996.5 "If you buy $10 of an asset, you get the quoted price"
- 1000.1 "if a bot tries to buy $10 million ... its own massive buying pressure eats through the order book liquidity and pushes the price up" (draw curve falling)
- 1011.5 "slippage is the silent killer of arbitrage"
- 1015.7 "A cycle that works beautifully with a hundred dollar test trade might trigger massive losses if you push $10,000 through it" (dot at $100 in profit, slide dot to $10,000 deep red)
- 1022.7 "edge weights can't just be static numbers anymore"; 1027.7 "They must become parametric"; 1029.7 "functions of volume, denoted as a variable V" (Parametric Weights box)
- 1033.5 "evolves from a simple shortest path route into a highly complex convex optimization problem"
- 1040.0 "a massive reality check regarding the article's earlier claim about this being risk free profit"
- 1056.1 "volume dependent weights alone do not strictly prove that the optimization problem is convex" (Explicit Caveat box)
- 1064.2 "a false sense of security?"

## Slide 12: Real-World Execution Risks. 1069.1 to 1137.5 (68.4 s)

**Content**
- Title (mono) "Real-World Execution Risks"; tagline "A negative mathematical cycle does not guarantee net executable profit."
- Center panel "Hazard Dashboard" (light grey header, dashed inner border): triangle of circled nodes A (top), B (bottom left), C (bottom right). Edges with arrows: A -> B, C -> A (double/parallel arrows), B -> C; small amber arrows alongside each edge; labels "Edge Weight < 0" on left edge, right edge, bottom edge; center amber glow text "Theoretical Negative Cycle". Top right: a crossed-out red rubber stamp "Risk-Free".
- Five hazard cards (dark header bar with amber warning triangle, white body with oxblood icon), each with a dark wedge pointer into the dashboard:
  - Top left "Stale Quotes": stopwatch icon labelled "5μs"; "Microsecond latency in data feeds." -> points at left edge.
  - Bottom left "Order Sequencing": gears with arrows icon; "Delays between multi-leg jumps." -> node B.
  - Bottom center "Fees": coin stack with minus badge; "Dynamic or tier-based execution costs." -> bottom edge.
  - Top right "Market Depth & Slippage": descending order-book bars icon; "Depletion of volume during execution." -> right edge.
  - Right "Venue/Counterparty Risks": radio tower icon + server stack with red x; "Exchange downtime or API limits." -> node C.
- Bottom full-width banner with big red warning triangle: "Arbitrage is not practically 'risk-free'. Executing a theoretical negative cycle is subject to extreme friction."

Article check: this slide is NotebookLM's critique; the article only says "risk-free profit" in the intro. No numbers to verify (the "5μs" on the stopwatch icon is decorative).

**Beats**
- 1069.1 "finding a negative mathematical cycle is definitely not guaranteed executable net profit" (slide in, stamp "Risk-Free" crossed out)
- 1075.7 "completely ignores severe real world risks"
- 1084.5 "Stale quotes ... by the time your order physically travels over the internet to the exchange, the price might have moved" (card 1)
- 1091.5 "market depth limits where the liquidity just isn't there" (card Market Depth)
- 1097.1 "Worst of all are order sequencing failures" (card Order Sequencing)
- 1102.2 "your cycle has three legs. Leg one and leg two execute perfectly, but leg three gets rejected" (animate legs: A->B ok, B->C ok, C->A red X ~1104.3)
- 1109.5 "you are left holding a highly volatile asset you never actually wanted"
- 1117.9 "venue risks, counterparty risks and general operational risks" (card Venue/Counterparty)
- 1123.2 "far from a guaranteed money printer" (bottom banner)
- 1127.2 "the infrastructure ... must be absolutely bulletproof. It cannot crash and it cannot stall" (transition)

## Slide 13: 6. Why Rust? 1137.5 to 1269.3 (131.8 s)

**Content**
- Blueprint background (faint grid, dimension arrows on the edges). Title (mono, centered) "6. Why Rust?"; tagline "Engineering an execution engine that operates beneath the latency boundary."
- Big quote plaque (thick dark octagonal frame, mono): "“100 microseconds is the difference between profit and a skipped opportunity.”" with a pointer down to the structure.
- Isometric line drawing: three square pillars (back center, front left, front right) joined by diagonal struts into a tripod/triangle; two struts are amber (back-right diagonal and the front horizontal double-arrow between left and right pillars).
- Three labels with leader lines:
  - Top right "Zero-Cost Abstractions": "High-level graph structures with raw pointer performance."
  - Bottom left "Memory Safety": "No garbage collector (GC) pauses that freeze the bot."
  - Bottom right "Fearless Concurrency": "Parallel WebSocket parsing from 10+ exchanges."

Article check: "100 microseconds is the difference between profit and a 'skipped' opportunity": matches. **Discrepancy**: the article says WebSocket feeds "from 10 exchanges" and narration says "10 different exchanges"; the slide says "10+". Use "10" when redrawing.

**Beats**
- 1137.5 "that brings us to H2 6. Why Rust?" (slide in ~1140.7)
- 1141.8 "latency is everything"; 1145.7 "100 microseconds is the latency boundary" (quote plaque)
- 1151.9 "Cross that boundary and your guaranteed profit becomes a skipped opportunity or a loss"
- 1161.7 "100 microseconds is the source's dated claim ... we have not independently verified that benchmark"
- 1179.9 "three main rationales"; 1182.3 "memory safety with no garbage collector" (pillar 1)
- 1186.3 janitor analogy: "the janitor occasionally yells freeze and stops all the chefs" (good gag scene); 1197.8 "a garbage collector pause of even one single millisecond could freeze the trading bot"
- 1206.8 "Rust doesn't have that janitor"; 1212.3 "It cleans as it cooks. No sudden freezes"
- 1216.8 "zero cost abstractions" (pillar 2); 1224.3 "nodes, edges, layered searches, without sacrificing the raw bare-metal speed of low level memory pointers"
- 1235.3 "fearless concurrency" (pillar 3); 1238.6 "parse WebSocket data feeds from 10 different exchanges in parallel" (10 feeds stream into graph)
- 1244.1 "update the shared market graph simultaneously without causing data races"
- 1252.6 "Graph theory provides the intelligence ... systems programming provides the relentless muscle" (struts glow, structure complete)
- 1263.0 "treating these performance claims as attributed to the source"

## Slide 14: Conclusion. 1269.3 to 1324.3 (55.0 s)

**Content**
- Title (mono) "Conclusion"; tagline "Graph algorithms form the engine of modern crypto arbitrage."
- Large frame with concentric dashed rings (ripples) expanding from the center.
- Center: dashed circle containing 5 isometric cubes as a complete-ish directed graph (pentagon with star diagonals, black arrows). Label "Asset Swaps" to its left.
- Amber dashed arrows lead outward through the rings, via small hexagon waypoints, to two cube clusters on the right: upper cluster (4 cubes, one amber) labelled "Funding Rates"; lower cluster (6 cubes, one amber) labelled "Cash-and-Carry". Two more amber dashed paths go to hexagons on the left and bottom.
- Top-left text box: "Bellman-Ford provides the mathematical foundation, while modern systems survive via SPFA optimizations and RICH logic."
- Bottom-left text box: "The ecosystem is evolving beyond simple swaps to complex Futures-Spot Arbitrage chains."

Article check: matches the Conclusion and the next-part teaser (funding rates, cash-and-carry).

**Beats**
- 1269.3 "Bringing all these threads together"; 1274.1 "Moving to H2 conclusion" (slide in)
- 1276.4 "mapping a chaotic fragmented market as a directed graph" (center graph)
- 1285.6 "We started with the foundational Bellman-Ford"; 1291.9 "the practical queue-based speed of SPFA"; 1297.1 "the highly specialized 2024 RICH algorithm" (three quick callbacks)
- 1302.1 "Graph algorithms truly are the engines driving modern crypto arbitrage"
- 1311.0 "The next part of this series will expand the graph beyond simple asset swaps" (ripples expand)
- 1315.0 "futures spot arbitrage, dealing with funding rates and cash and carry strategies" (clusters light up: Funding Rates ~1317, Cash-and-Carry ~1320)

## Slide 15: Source, Resources & Disclaimers. 1324.3 to 1385.88 (61.6 s)

**Content**
- Title (amber mono, centered) "Source, Resources & Disclaimers"; tagline "Explore the open-source implementation."
- Plaque (dark octagonal frame, mono):
  - "**Resource Link:** Open Source Rust HFT Template"
  - "**URL:** https://github.com/marketmaker-cc/hft-rust-core"
  - "**Metadata:**"
  - "Source: 'MM article complex-arbitrage-graph-algorithms EN e8c18d495609'"
  - "Date: 2026-02-23."
- Bottom bullet list (mono):
  - "- Research, benchmarks, performance claims, and source code have not been independently verified."
  - "- Arbitrage is not practically 'risk-free'; subject to operational, venue, and liquidity risks."
  - "- Chinese regional terminology and Mandarin pronunciation await human editorial and listening review." (irrelevant for the EN episode; drop it when redrawing)

Article check: URL matches the article footer. The "Source ... e8c18d495609" line is internal metadata; consider dropping it.

**Beats**
- 1324.3 "For you listening who are technically inclined" (slide in)
- 1331.3 "check out the referenced open source resource"; 1334.2 "the Open Source Rust HFT template ... marketmaker-hft-rust-core on GitHub" (URL types in)
- 1344.1 "algorithms like RICH become faster as they use bit masks and incremental updates"
- 1350.0 "inches closer ... to the physical limits of network latency, that hundred microsecond boundary"
- 1360.4 "Do these inefficiencies eventually disappear ... into a true physics engine? Or does the market simply evolve, creating entirely new invisible dimensions of arbitrage" (callback to the opening "physics engine")
- 1374.7 "the market always finds a new dimension to hide its inefficiencies"
- 1382.1 "Thank you for joining us"; 1384.9 "We'll catch you next time" (end card)

---

## Timing notes

`sync_slides.py --min-duration 5.0 --advance-ratio 1.3 --look-ahead 3` degenerated ("showed 10/15 slides, longest held 65%") and fell back to an even 92.4 s split (saved as `timeline_auto_evensplit.json`). That split is wrong for every slide: slide 2 would start at 92 s instead of 181.5 s, and the error reaches almost 4 min mid-episode (slide 7 RICH: auto 554 s vs real 781 s).

`slide_starts.json` is set by hand from the hosts reading section headings aloud, which matches the deck's 1:1 section order:

| Slide | Start | Cue |
|---|---|---|
| 1 Title | 0.0 | intro |
| 2 Market as a Graph | 181.5 | "Let's move into H2 1.1, the market as a graph" |
| 3 Mult to Addition | 344.9 | "the next section, H three, one point two" |
| 4 Bellman-Ford code | 481.5 | "We move to H2 ... Classical approach. Bellman-Ford" |
| 5 Complexity | 592.0 | "H3, 2.2 complexity and limitations" |
| 6 SPFA | 673.9 | "This brings us to H2, 3. SPFA" |
| 7 RICH | 781.2 | "Which leads us to H2 4 modern research, the RICH algorithm" |
| 8 RICH innovations | 812.9 | "Let's look at H3 4.1" |
| 9 Synthesis matrix | 905.5 | not narrated; placed on the RICH recap sentence before section 5 |
| 10 Fees | 926.1 | "H2 5 implementation challenges, fees and liquidity" |
| 11 Slippage | 988.3 | "H3 5.2, liquidity and slippage" |
| 12 Execution risks | 1069.1 | "finding a negative mathematical cycle is definitely not guaranteed executable net profit" (after the convexity caveat, which belongs on slide 11) |
| 13 Why Rust | 1137.5 | "that brings us to H2 6. Why Rust?" |
| 14 Conclusion | 1269.3 | "Bringing all these threads together ... H2 conclusion" |
| 15 Resources | 1324.3 | "For you listening who are technically inclined ... citation" |

Slide 1 holds three minutes of intro; a redraw will want sub-scenes there (efficient market, crypto chaos, title reveal, BTC-ETH-SOL-USDT cycle at 111 to 122 s, "not risk free" at 141 to 162 s).
