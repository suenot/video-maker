# complex-arbitrage-ml-approaches (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
10-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/complex-arbitrage-ml-approaches.en.md` ("GNN, Transformers, and RL for Arbitrage: When Neural Networks Learn to Trade", Part 5 of "Complex Arbitrage Chains Between Futures and Spot", 2026-02-27, suenot). The article is short (~750 words); most of the podcast's critical commentary is the hosts' own.

- Audio: `input/notebooklm-sources/complex-arbitrage-ml-approaches/en/audio.m4a`, 1199.73 s (19:59.7), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` + `timeline.json` (manual, see "Timing notes"). Narration follows the deck order.
- Slide PNGs: `slides/slide_001.png` ... `slide_010.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: slate blue-grey background (#4E5D6C) with a faint blueprint grid, white/light-grey text, IBM Plex Mono headings prefixed "H2 —" / "H3 —" (markdown heading levels leaked into titles: drop the prefix). Per-section accent colors that the architecture slide reuses: blue (#3A8FD8) = GNN / detection, purple (#5B2A6E) = Transformers / signal fusion, green (#1FBF7A) = RL / execution, amber (#F2B035) = Bayesian / risk. Dark terminal boxes (three-dot title bar) for captions and code. "Gemini Notebook" watermark (do not redraw).

The hosts' running metaphors: chess grandmaster facing ten exchanges (0.0, slide 1); delivery driver with a paper map vs a seasoned driver's intuition (202.6, slide 2); "canary in the coal mine" for attention surges (505.7); BOCPD λ as a "paranoia dial" (827.8); "GNN provides the map, transformer the timing" (526.6).

The hosts repeatedly read review disclaimers (304.0 to 313.0 "illustrative, uncompiled"; 510.1 to 524.8; 666.2 to 724.5; 970.2 to 1067.8; 1113.7 to 1120.9). Unlike in other episodes, much of this is substantive critique (F1 vs precision, missing hardware attribution, 78 ms vs 7.5 ms): keep it as on-screen "review notes", not boilerplate tags.

Transcript quirks (Whisper mis-hearings, do not caption verbatim): "change between futures and spot" (48.3) = chains between; "the assets of themselves" (125.1) = the assets themselves; "Graph Sage" = GraphSAGE; "the burn crate" = `burn`; "FC1, FC2 ... FC out" = `fc1`, `fc2`, `fc_out`; "RELU" = ReLU; "a single send" (534.7) = a single cent; "sex-to-dex" / "a sex agent" (614.4, 628.0) = CEX-to-DEX / a CEX agent; "order bookstates" (690.8) = order book states; "depagged" (733.8) = depegged; "every set in volume spike" (843.2) = every sudden volume spike; "run length probes" (851.6) = `run_length_probs`; "Exponentially-Away-to-Moving Averages" (915.2) = Exponentially Weighted Moving Averages; "is an over-leveraging" (965.8) = isn't over-leveraging; "7.8 milliseconds" (1015.0) = 78 ms (host slip).

---

## Slide 1: Title. 0.0 to 101.7 (101.7 s)

**Content**
- Title "GNN, Transformers, and RL for Arbitrage: When Neural Networks Learn to Trade"; subtitle "Part 5: Complex Arbitrage Chains Between Futures and Spot".
- Left panel "CLASSICAL PARADIGM": faded chess board with pieces; caption "Imagine a chess grandmaster who, instead of a board, sees ten exchanges with hundreds of trading pairs..."
- Right panel "MODERN PARADIGM": dense graph of exchange hubs (labelled EXCHANGE 01, 02, 02, 03, 03, 06, 06, 07, 07: duplicated numbers) with fans of garbled pair labels and timestamps; caption "...and instead of 32 pieces, sees thousands of orders updated every millisecond."
- Footer "Arbitrage must be learned, not just calculated."

Article check: matches the article's opening paragraph.

**NotebookLM errors (flag):** exchange hub labels repeat (02, 03, 06, 07 appear twice; 04, 05 missing) and the pair labels are gibberish ("BTE/USD", "ADA/EDR"). Redraw with ten distinct exchanges and real pairs (BTC/USDT, ETH/USDT, SOL/USDT, ...).

**Host note:** 16.7 "thousands of trading pairs": the article says hundreds of pairs and thousands of orders.

**Beats**
- 0.0 "imagine a chess grandmaster" / 2.2 "a neat little board with 64 squares ... 32 pieces" (chess board)
- 9.5 "10 different cryptocurrency exchanges simultaneously"; 14.9 "thousands of trading pairs ... order books updating every single millisecond" (board dissolves into the exchange graph)
- 22.5 "shatters human cognitive limits"; 27.7 "Every blink is a missed move"
- 39.5 "welcome to the deep dive"; 45.2 "part five of a series exploring complex arbitrage chains between futures and spot"; 51.5 title read "GNN, Transformers and RL for Arbitrage" (title reveal)
- 59.2 "turn it into a structured, solvable task"
- 75.2 "classical algorithms ... traverse the numbers"; 82.5 "by the time they actually find a profitable arbitrage cycle, calculate the exchange fees, send the order. That tiny window ... has already slammed shut" (window closing animation)
- 95.1 "a system that doesn't just calculate ... but actually learns" (footer "learned, not just calculated")

## Slide 2: 1. Graph Neural Networks: When the Market is a Graph. 101.7 to 241.1 (139.4 s)

**Content**
- Title "H2 — 1. Graph Neural Networks: When the Market is a Graph".
- Left "Classical Traversal": chain N_0 → N_1 → N_2 → N_3 → ... → N_k. Box "ALGORITHM: Bellman-Ford": `for i from 1 to V-1: for each edge (u, v) in E: if dist[u] + weight(u, v) < dist[v]: dist[v] = dist[u] + weight(u, v)`; red "COMPLEXITY: O(V × E)". Caption "Classical algorithms honestly traverse the graph. By the time a cycle is found, the window closes."
- Right "Learned Intuition": blue directed graph with nodes BTC, BTC, BTC/USD, ETH, ETH/BTC, GNN, SOL, SOL/USDT, BNB, BNB, BNB, XRP/ETH, ADA/BTC. "LEGEND: Nodes = Assets / Exchanges. Edges = Weighted by spreads, volumes, fees, latencies." Caption "Neural networks learn to recognize patterns preceding arbitrage opportunities—like a driver anticipating traffic."

Article check: matches. Article: nodes are assets (BTC, ETH, SOL) or "asset-exchange" pairs; edges weighted by spreads, volumes, fees, latencies; GNN intuition compared to a taxi driver's feel for where a jam will be. Bellman-Ford finds negative-weight cycles on −log(rate) edge weights (covered in Part 1 of the series); the pseudocode shows only the relaxation loop, not the cycle check (one extra pass: any further relaxation means a negative cycle).

**NotebookLM errors (flag):** the right graph has a node labelled "GNN" (the model is not a market node), duplicated BTC and BNB nodes, and mixes assets with pairs. Redraw nodes as asset@exchange (BTC@Binance, BTC@Coinbase, ETH@Binance, ...) with weighted edges. Legend says "Assets / Exchanges"; the article says assets or asset-exchange pairs. Bellman-Ford box: add the final "if any edge still relaxes → negative cycle = arbitrage" line, otherwise the snippet is just shortest paths.

**Beats**
- 101.7 "how they map that structure"; 103.9 "graph neural networks ... when the market is a graph"
- 110.2 "you can't just look at the ... market as a flat list of prices" (price list folds into a graph)
- 123.0 nodes: 127.2 "the asset exchange pairs, like Bitcoin on Binance versus Bitcoin on Coinbase" (two nodes)
- 137.7 edges: 144.6 "not just static lines"; 148.9 "throbbing with constantly shifting weights ... bid-ask spreads ... volumes ... maker-taker fees ... network latencies" (edge weights pulse, four labels)
- 159.1 "Bellman-Ford"; 170.7 "It looks for negative weight cycles"; 173.1 "an arbitrage loop ... end up with more money than you started with" (cycle lights up)
- 181.7 "a time complexity of big O of V times E" (red complexity line); 195.2 "multiply the number of vertices by the number of edges"
- 202.6 delivery driver gag: "physically pull out a map and calculate ... every single possible side street" (driver with paper map); 214.5 "by the time they finally calculate the optimal route ... The traffic jam has already moved"
- 225.3 "GNNs function more like a seasoned driver's intuition"; 234.7 "learn to recognize the structural patterns ... that precede those arbitrage opportunities" (right panel)

## Slide 3: 1.1 GraphSAGE with Edge Fusion. 241.1 to 436.1 (195.0 s)

**Content**
- Title "H3 — 1.1 GraphSAGE with Edge Fusion".
- Left "EdgeFusionModule" code window:
  ```rust
  use burn::prelude::*;
  use burn::nn::{Linear, LinearConfig, Relu};
  use burn::nn.:{Linear, LinearConfig;

  #[derive(Module, Debug)]
  pub struct EdgeFusionModule<B: Backend> {
      fc1: Linear<B>,
      fc2: Linear<B>,
      fc_out: Linear<B>,
      relu: Relu,
  }
  ```
- Right "Isolated Model Benchmark": gauge, "78 ms CPU Inference. Fast enough for many arbitrage windows."
- Box "Source Literature Claim: F1-score: 0.90 — 9 out of 10 predicted opportunities are real." Inner box "Editorial Review: F1 is a harmonic mean of precision and recall. Treating this as absolute precision requires primary-source validation, dataset review, and backtest leakage controls."

Article check: code matches the article except the third import line. Article claims "F1-score: 0.90—9 out of 10 predicted opportunities are real" and "Inference: 78 ms on CPU"; no paper, dataset, or hardware is cited.

**NotebookLM errors (flag):** the third line `use burn::nn.:{Linear, LinearConfig;` is a broken duplicate (wrong `.:` path separator, unclosed brace) of line 2: delete it. The struct has no `forward` method, so it shows only the layer layout; caption it "layer layout, not a full module".

**Article error (flag, the slide already hints at it):** "F1 = 0.90 → 9 out of 10 predicted opportunities are real" confuses F1 with precision. 9 of 10 predictions being real is precision = 0.90; F1 = 2PR/(P + R) can be 0.90 with precision anywhere from about 0.82 up to 1.0.

**Host error (flag):** 358.6 to 367.6 "you could have a 0.90 F1 ... while your precision sits at, say, 75%. Meaning 25% of your executions would be false positives." Impossible: even with recall = 1.0, F1 = 0.90 needs precision = 0.90 / (2 − 0.90) ≈ 0.818. The floor is about 82% precision, i.e. at most ~18% false positives. Show the correct bound on screen (P ≥ 0.818); keep the point that F1 ≠ precision. The 375.4 "90% hit rate, but it's actually 75%" inherits the same wrong number.

**Sub-scenes** (195 s, split into 3)
- 3a 241.1 to 315.6, architecture + code: 241.1 "the specific architecture"; 244.6 "GraphSAGE with Edge Fusion"; 246.6 "good at generating embeddings for nodes in large, dynamic graphs" / 252.6 "sampling and aggregating features from a node's local neighborhood" (neighbor sampling animation: node pulls features from sampled neighbors); 256.8 "the dynamic costs of moving between exchanges ... a custom Edge Fusion module"; 265.9 "the Rust code ... uses the burn crate ... a struct called EdgeFusionModule" (code types in); 273.7 "fc1, fc2, and an output layer, fc_out ... a ReLU activation" (layers highlight); 286.3 "what is this module actually doing?"; 289.1 "high-dimensional edge data ... the spread, the volume, the fees ... compressing it down into a dense latent vector" (edge features funnel into a short vector); 298.2 "a mathematical scent of an opportunity"; 304.0 "the code snippet ... is purely illustrative. It's uncompiled" (small "illustrative" tag).
- 3b 315.6 to 390.3, F1 critique: 315.6 "performance claims ... require some serious scrutiny"; 325.3 "a 78 millisecond CPU inference time" (gauge); 328.9 "an F1 score of 0.90" / 332.8 "nine out of 10 predicted opportunities are real" (claim box); 339.7 "pump the brakes"; 347.0 "conflating an F1 score with precision"; 354.7 "F1 is the harmonic mean of precision and recall" (formula F1 = 2PR/(P+R)); 358.6 host's 75% example (show corrected bound P ≥ 0.82 instead); 373.0 "false positives will just eat your capital alive ... exchange fees and slippage".
- 3c 390.3 to 436.1, latency critique: 390.3 "what about that 78 millisecond CPU inference claim?"; 394.4 "zero hardware attribution"; 398.5 "what exact CPU ... controlled offline back test or ... live production" (question marks on the gauge); 407.9 "a 78 millisecond benchmark is just floating in a vacuum"; 415.7 "assume ... the GNN successfully maps the spatial structure"; 425.5 "Crypto isn't just spatial. It's temporal ... prices decay in milliseconds" (bridge to Transformers).

## Slide 4: 2. Transformers: Attention is All You Need. 436.1 to 476.0 (39.9 s)

**Content**
- Title "H2 — 2. Transformers: Attention is All You Need".
- Purple plane "Multi-Head Self-Attention Layer" above four horizontal stream bars "Exchange 1 Data" ... "Exchange 4 Data" (segments labelled MARKET DATA, PRICE, VOLUME, ORDER BOOK, TIME STAMPS); purple arrows drop from the plane and cross between streams.
- Caption "If GNNs map the market's structure, Transformers master its data streams. Multi-head self-attention captures cross-asset and cross-exchange dependencies without explicit pre-definitions of who influences whom."

Article check: matches. "Attention Is All You Need" is the Vaswani et al. (2017) paper title.

**Beats**
- 436.1 "the next phase of the architecture. Transformers. Attention is all you need" (title)
- 441.4 "if GNNs map the space, transformers map the time" (graph fades, four streams flow in)
- 447.0 "ingest massive complex data streams"; 451.3 "multi-head self-attention" (attention plane lowers)
- 455.5 "we aren't trying to predict the next word in a sentence like ChatGPT" (word tokens crossed out, replaced with ticks)
- 464.6 "capturing dependencies across different assets and exchanges"; 468.6 "without the programmer needing to explicitly define who influences whom" (cross-stream arrows draw themselves)

## Slide 5: 2.1 Multi-Head Attention for Multi-Exchange Fusion. 476.0 to 542.8 (66.8 s)

**Content**
- Title "H3 — 2.1 Multi-Head Attention for Multi-Exchange Fusion".
- "Attention Heatmap" 4x4 (rows and columns: Exchange A, Exchange B, Exchange C, Target Exchange), purple shades; magnifier on the (Exchange B, Target Exchange) cell, which is white. Label "Signal Indicator: Surge in Attention Weight".
- Box "Attention weights reveal which exchanges are most informative for price prediction. A surge in attention between two exchanges acts as a leading indicator of an impending arbitrage window."
- Box "Theoretical Source Claim: Attention weight surges between informative exchanges are presented as predictive signals for target exchange price movements, pending empirical live-market validation."

Article check: matches ("A surge in attention weight between two exchanges is often a signal of an impending arbitrage opportunity"). No source or measurement given.

**Beats**
- 476.0 "how it actually uses those attention weights"; 481.1 "which exchanges are most informative for predicting the price on a target exchange" (heatmap fills in)
- 490.2 "if Binance suddenly starts tracking a massive volume spike on Kraken, the attention weight between those two nodes surges" (one cell flashes white; relabel rows Binance / Kraken / ... for the example)
- 499.4 "a leading signal of an impending arbitrage opportunity"; 505.7 "a canary in the coal mine" (canary icon)
- 510.1 "treat this attention weight signal as an entirely unverified source claim" (claim box); 517.3 "we really don't know how noisy that signal is in live conditions"
- 526.6 "the GNN provides the map. The transformer provides the timing signal" (map + clock icons); 532.3 "knowing a path exists ... doesn't actually make you a single cent"; 537.8 "You still have to execute the trade"

## Slide 6: 3. Reinforcement Learning: The Agent that Learns to Trade. 542.8 to 637.6 (94.8 s)

**Content**
- Title "H2 — 3. Reinforcement Learning: The Agent that Learns to Trade".
- Green cycle: State (Order books, positions, balances) → Agent (Multi-agent coordinator mapping states to actions) → Action (What to trade, where, and in what volume) → Reward (Profit or loss generated) → State.
- Caption "Reinforcement Learning naturally fits the execution constraints of arbitrage, shifting logic from rigid if/then rules to continuous profit/loss optimization."

Article check: matches (state = order books, positions, balances; action = what to trade, where, what volume; reward = P&L).

**Host error (flag):** 598.3 to 607.8 "some are focused on decentralized to decentralized exchange arbitrage, some on cross-chain ... and others on triangular". The article and slide 7 say CEX-DEX (centralized to decentralized), not DEX-to-DEX; the host then says "CEX-to-DEX" correctly at 614.4. Caption CEX-DEX.

**Beats**
- 542.8 "from observation to action"; 545.8 "reinforcement learning, the agent that learns to trade"
- 549.7 "the entire market as an environment where an agent takes actions to maximize a reward" (loop draws)
- 562.8 State: "order book depth across all the exchanges, your current open positions, and your available capital balances" (State box)
- 575.1 Action: "what asset to buy, on which exchange, and in what exact volume, factoring in latency estimates" (Action box)
- 584.1 Reward: "the realized profit or loss" (Reward box; loop completes)
- 589.4 "a multi-agent RL setup for competitive arbitrage ... decentralized exchanges" (Agent box splits into three)
- 598.3 specialized agents: CEX-DEX, cross-chain, triangular (three agent chips)
- 619.5 "a cross-chain agent has to account for ... smart contract execution times, gas fee volatility, bridge liquidity" vs 628.0 "a CEX agent is optimizing for API rate limits and centralized order matching" (two columns)
- 634.1 "Specialization prevents the agent from diluting its policy"

## Slide 7: 3.1 142% Annual Returns. 637.6 to 726.6 (89.0 s)

**Content**
- Title "H3 — 3.1 142% Annual Returns".
- Bar chart: "Rule-Based Bots" 12% (grey), "Multi-Agent RL" 142% (green). Callout "Coordinates specialized bots (CEX-DEX, Cross-Chain, Triangular) for competitive arbitrage."
- Footer ⚠ "Unverified Literature Claim / Backtest Data: These figures lack live-production validation. Subject to primary-source review for execution costs, statistical uncertainty, and leakage controls. Not an endorsement of performance or investment advice."

Article check: matches the article's claim ("researchers achieved 142% annual returns against 12% for rule-based bots"). The article cites no paper, period, or cost model. Bar heights are to scale (12 vs 142).

**Beats**
- 637.6 "the most eye-catching number in the entire source"; 643.8 "Oh boy, here we go"
- 645.5 "142% annual returns"; 649.2 "142% against just 12% for traditional rule-based bots" (bars grow: 12% first, then 142%)
- 657.3 "the kind of number that looks fantastic on a GitHub readme"; 666.2 "a completely unattributed source claim" (stamp "UNATTRIBUTED")
- 672.0 "historical back-test or a live forward-facing trading ... the back-test has the ultimate luxury of hindsight"
- 679.6 checklist (items tick in): 681.9 "request the underlying data set"; 685.0 "data leakage controls ... exposed to future order book states during training"; 696.1 "slippage, the gas fees, and the maker-taker costs"; 714.5 "no statistical uncertainty provided"
- 705.2 "if an RL agent is hyperactive ... grinding your actual account to zero through micro fees" (142% bar erodes under fee ticks)
- 717.4 "no guaranteed returns or risk-free claims"

## Slide 8: 4. Bayesian Methods: Uncertainty as an Advantage. 726.6 to 862.1 (135.5 s)

**Content**
- Title "H2 — 4. Bayesian Methods: Uncertainty as an Advantage".
- Chart Market Volatility vs Time: flat noisy line, then a jump; amber vertical line with tag "Regime Change Detected: Pause & Recalibrate". Callout "Bayesian Online Changepoint Detection (BOCPD) detects shifting market rules in real-time."
- Code:
  ```rust
  /// Regime change detector based on BOCPD
  pub struct BocpdDetector {
      lambda: f64,                  // P(changepoint) = 1/lambda
      run_length_probs: Vec<f64>,   // run length distribution
  }
  ```

Article check: matches the article code and text. BOCPD = Adams and MacKay (2007): a constant hazard H = 1/λ, where λ is the expected run length between changepoints; the posterior over run length r_t is updated online each tick.

**Host error (flag):** 834.0 to 846.2 inverts the λ dial: "If you set lambda low, the system assumes the market is generally stable ... if you set it high, the system is hypersensitive." Since P(changepoint) = 1/λ, a **low** λ means a **high** prior changepoint rate (hypersensitive), and a **high** λ means long expected regimes (calm). Draw the dial with the correct direction: λ small = jumpy, λ large = calm. Also 858.4 "when that distribution collapses, the system halts" is a loose paraphrase: a changepoint shows up as posterior mass jumping to run length 0.

**Sub-scenes** (136 s, split)
- 8a 726.6 to 810.8, regime risk + BOCPD: 726.6 "assume the RL agent is properly trained and highly profitable"; 731.8 "a flash crash or a major stablecoin depeg"; 739.1 "trained on yesterday's calm, low-volatility market ... today's absolute chaos" (calm line then jump); 750.9 "regime overfitting"; 758.3 "an RL agent will confidently execute terrible trades. Because it doesn't realize the game has changed"; 765.1 "Bayesian methods. Uncertainty as an advantage" (title); 772.8 "Bayesian online change point detection, BOCPD" (callout); 778.7 "online ... happens in real time"; 785.5 "evaluates the incoming stream ... volatility, the volume gradients ... the probability that the market regime has fundamentally shifted" (probability meter rises at the jump); 800.8 "a circuit breaker" / 804.4 "pause, stop risking capital, and recalibrate" (amber line + tag drop in).
- 8b 810.8 to 862.1, code: 810.8 "an illustrative BOCPD detector struct" (code); 819.5 "a parameter called lambda"; 823.1 "the probability of a change point is one divided by lambda" (comment highlights); 827.8 "a paranoia dial" (dial; draw it correctly: small λ = paranoid); 834.0 to 846.2 host's inverted explanation (on screen show the corrected direction); 849.1 "run_length_probs ... a probability distribution of how long the current market state has existed" (run-length histogram; at the jump mass snaps to r = 0).

## Slide 9: 5. Integrated Architecture: Putting It All Together. 862.1 to 1070.0 (207.9 s)

**Content**
- Title "H2 — 5. Integrated Architecture: Putting It All Together".
- Five connected boxes: Feature Eng. (white) "Order book features, spreads, CUSUM/EWMA" → Detection (blue) "GNNs & Autoencoders finding anomalies" → Signal Fusion (purple) "Transformers merging cross-exchange/spot-futures data" → Execution (green) "RL agents determining optimal size/timing" → Risk (amber) "Bayesian sizing and Gaussian Process boundaries".
- Brace: "Total Latency Budget: < 7.5 ms (Powered by Rust and ONNX Runtime)".
- Caption "True power comes from synthesis. An integrated Rust pipeline merges detection, fusion, execution, and risk. Note: The < 7.5 ms total pipeline target is an engineered latency budget, distinct from the isolated 78 ms CPU GNN inference benchmark."

Article check: five stages match the article verbatim. Article: "With Rust and ONNX Runtime, a total pipeline latency of < 7.5 ms is achievable."

**Article inconsistency (flag):** the article gives 78 ms CPU inference for the GNN alone and < 7.5 ms for the whole pipeline that includes that GNN, and never reconciles them. The slide's footnote and the hosts (987.9 to 1038.2) point this out correctly. The hosts' explanation (GPU or FPGA acceleration, 1021.1 to 1031.0) is their speculation; the article names no hardware. "Multi-leg atomic execution" (1039.4) is mentioned in the article only as a teaser for Part 6.

**Host slip:** 1015.0 "the 7.8 milliseconds was explicitly stated as CPU inference" = 78 ms.

**Sub-scenes** (208 s, split into 3)
- 9a 862.1 to 970.2, the five stages: 862.1 recap "GNNs finding the structural paths, transformers tracking the attention signals ..., RL agents executing ..., Bayesian detectors managing the risk" (four colored icons from slides 2 to 8 fly in); 877.8 "having a bunch of smart components doesn't guarantee a smart system"; 881.3 "the integrated architecture, putting it all together" (title); 885.1 "wire all these massive AI brains together without the entire system lagging"; 898.6 "a specific five-stage integrated architecture built in Rust"; 905.2 stage 1 "feature engineering ... spreads ... CUSUM, Cumulative Sum Control Charts, or EWMA, Exponentially Weighted Moving Averages" (white box); 926.4 stage 2 "detection ... graph neural networks and autoencoders ... structural anomalies" (blue); 934.8 stage 3 "signal fusion ... merge the cross-exchange data and the spot versus futures data ... surges in attention weights to validate the paths the GNNs just found" (purple); 949.1 stage 4 "execution ... optimal trade size, routing, and the exact timing" (green); 958.0 stage 5 "risk ... Bayesian sizing and Gaussian process boundaries act as the governor" (amber).
- 9b 970.2 to 1039.4, latency contradiction: 970.2 "strict editorial scrutiny again"; 974.5 "the latency cost of running this entire five-step AI heavy pipeline?"; 979.4 "with Rust and the ONNX runtime ... less than 7.5 milliseconds" (brace + budget); 987.9 "Wait, wait, wait"; 988.8 "78-millisecond CPU inference ... for just the GNN" (78 ms bar dwarfs the 7.5 ms budget bar); 994.7 "How can the total pipeline take less than 7.5 ms if just one fraction of it takes 78 ms? It can't" (red "≠"); 1005.5 "different hardware, different pipeline stages ... the source simply does not reconcile"; 1021.1 host speculation GPU / FPGA (tag "speculation"); 1033.4 "you absolutely cannot combine these two numbers into a single verified end-to-end benchmark".
- 9c 1039.4 to 1070.0, atomic multi-leg: 1039.4 "future multi-leg atomic execution"; 1048.1 "all parts of the trade succeed, or none of them do, across different centralized and decentralized exchanges" (three legs, all-or-nothing); 1057.7 "an engineering nightmare"; 1062.0 "treat it as a theoretical aspiration, not a live capability".

## Slide 10: 6. Conclusion. 1070.0 to 1199.7 (129.7 s)

**Content**
- Title "H2 — 6. Conclusion". Four boxes: Structure (blue) "GNNs see the graph." | Data (purple) "Transformers merge the streams." | Execution (green) "RL agents act." | Uncertainty (amber) "Bayesian methods manage risk."
- Quote "ML in arbitrage is not a silver bullet, but an arsenal of tools."
- "Next Steps & Reference": "Next Steps: Explore Rust implementation details, nanosecond precision, and atomic multi-leg execution (claims pending verification)." "Source Reference: Check the Rust ML Trading Framework on GitHub: burn-trade-core (marketmaker-cc)."

Article check: matches the article's conclusion and footer link (`https://github.com/marketmaker-cc/burn-trade-core`). Part 6 of the series is `complex-arbitrage-execution-rust`.

**Sub-scenes** (130 s, split)
- 10a 1070.0 to 1123.8, conclusion: 1070.0 "Which brings us to the conclusion"; 1071.9 "not some magical silver bullet that just prints money" (quote); 1078.9 "a highly specialized arsenal of tools ... structural, temporal, and execution complexity"; 1086.4 "replacing static, rule-based algorithms with dynamic learning systems"; 1091.2 "The GNNs see the structure" / 1093.0 "The transformers merge the data streams" / 1095.7 "The RL agents execute" / 1098.6 "the Bayesian methods manage the inherent risk" (four boxes one per beat); 1102.4 "teasing the final part ... Rust implementation details, nanosecond precision, and atomic multi-leg execution" (Next Steps box; link card burn-trade-core).
- 10b 1123.8 to 1199.7, outro: 1128.6 "an absolute arms race in financial technology"; 1134.0 "not just about who can lay the fastest fiber optic cable from Chicago to New Jersey" (fiber line on a map); 1139.9 "learning agents that develop a statistical feel for market data"; 1152.7 "if the future of arbitrage is entirely dictated by these interacting RL agents, transformers, and GNNs"; 1167.7 "simply trying to out predict the attention weights of other AI agents?"; 1173.4 "Does the market graph eventually optimize itself into total mathematically perfect gridlock?" (graph freezes, all edges balanced); 1179.6 "all predicting each other's moves a thousand steps ahead ... halting their own trades based on identical Bayesian parameters"; 1192.9 "thank you for joining us"; 1195.4 "Keep questioning the data, keep looking for the edge" (end card).

---

## Timing notes

`sync_slides.py` (default params) degenerated ("showed 6/10 slides, longest held 85%") and fell back to an even 120.0 s split (saved as `timeline_auto_evensplit.json`).

`slide_starts.json` is set by hand; the narration follows the deck order and the hosts name each section.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | cold open; title read at 51.5 | high |
| 2 GNN / market as graph | 101.7 | "So let's look at how they map that structure ... graph neural networks" | high |
| 3 GraphSAGE + edge fusion | 241.1 | "Which brings us to the specific architecture they deployed ... GraphSAGE with Edge Fusion" | high |
| 4 Transformers | 436.1 | "Which brings us to the next phase of the architecture. Transformers" | high |
| 5 Attention heatmap | 476.0 | "What's really fascinating ... is how it actually uses those attention weights" | medium-high (no section name; content boundary) |
| 6 RL loop | 542.8 | "that's where we move from observation to action. Let's look at reinforcement learning" | high |
| 7 142% returns | 637.6 | "the most eye-catching number in the entire source" | high |
| 8 Bayesian / BOCPD | 726.6 | "let's assume the RL agent is properly trained ... flash crash" (section named at 765.1) | high (lead-in could start at 765.1 instead) |
| 9 Integrated architecture | 862.1 | "Okay, so we have all these incredibly sophisticated pieces" (section named at 881.3) | high |
| 10 Conclusion | 1070.0 | "Which brings us to the conclusion" | high |

Slides longer than ~90 s are split into sub-scenes above: 3 (3), 8 (2), 9 (3), 10 (2). Slides 1 (102 s), 2 (139 s) and 6 (95 s) run as single scenes with dense beats; slide 2 may also be split at 159.1 (Bellman-Ford) if needed.
