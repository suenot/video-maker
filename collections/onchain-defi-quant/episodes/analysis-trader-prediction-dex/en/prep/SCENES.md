# analysis-trader-prediction-dex (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host, they swap roles often),
13-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/analysis-trader-prediction-dex.en.md` (date 2025-05-18, author suenot = Eugen Soloviov).

- Audio: `input/notebooklm-sources/analysis-trader-prediction-dex/en/audio.m4a`, 779.24 s (12:59.2), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has a `words[]` array with per-word start/end; use it for frame-exact beats). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_013.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: warm off-white blueprint paper (#F2F0EA-ish) with a faint grid, ruler ticks along the frame edges and crosshair registration marks in the corners; slate/charcoal ink (#2B3038 / #3A4556) for lines and text; muted amber/ochre accent (#C98B1C, softer #D9A55A fills) for "the proposal / the signal"; oxblood/brick red (#8B2A2A) and pale red fills for caveats and hazards. Grotesk sans titles, serif for caveat text on some slides, monospace for the citation. Small "Gemini Notebook" watermark bottom right on every slide (do not redraw).

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "Eugene Solovyev / Solovyov" = Eugen Soloviov (suenot), "walking gate / digital gate" (165.0, 232.7, 236.4) = gait, "mean coins" (304.6) = meme coins, "Sibyl" (385.8, 389.1) = Sybil, "DeFi Ranger" (447.3) = DEFIRANGER, "Hording" (551.4) = hoarding, "drop-backs" (640.2) = drawbacks, "Blacks want events" (696.5) = black swan events, "Prediction Capabilities Index" (730.2) = "Capabilities in DEX", "thought-presoking" (739.3) = thought-provoking, "external notebook LM sources" (97.6) = external NotebookLM sources. The hosts do NOT read heading levels aloud in this episode; boundaries come from topic transitions (usually a rhetorical bridge question).

---

## Slide 1: Title. 0.0 to 104.5 (104.5 s)

**Content**
- Title (right column, 6 lines, large bold dark sans): "Analysis of Trader Behavior Prediction Capabilities in DEX Based on Identification and Modeling"
- Subtitle (regular weight): "Synthesizing the Desire Orderbook, Trader Embeddings, and Manipulation Detection Models"
- Illustration (left two thirds, isometric line art on a faint grid): a chaotic pile of ~40 scattered boxes and slabs (navy, slate grey, amber) at bottom left; dashed and solid charcoal arrows lead from the pile up and right into a tall steel scaffold tower (cross-braced frame, ~4 bays wide, 5 storeys). Inside the scaffold: amber and glass panels, a dark cube on top with a translucent amber pyramid inside, a document/list panel (checkbox lines) hanging to its right, server-rack slabs stacked on the right side. Red dashed arrows loop around the right side of the tower (feedback / review loops). Metaphor: raw unstructured onchain data -> structured analytical model.
- Bottom banner (amber hatched rope border, pale amber fill, serif): "**DRAFT PROPOSAL** - Requires Human Editorial & Primary-Source Review. *External NotebookLM source and target-channel duplicates remain unverified. Does not constitute investment advice.* (Source: MM article analysis-trader-prediction-dex EN ee6f054e932c)" (the "Source ... ee6f054e932c" fragment is internal metadata; drop it when redrawing).

**Sub-scene 1a: footprints in the snow. 0.0 to 26.4**
- 0.0 "when you walk through fresh snow, you leave a trail" (footprints appear one by one in white snow)
- 3.9 "even if you're wearing a disguise or no one ever sees your face"
- 10.2 "running or ... dragging your feet or pacing in circles" (trail changes rhythm: long strides, scuffs, a circle)
- 15.8 "They don't know your name, but they know exactly how you move"; 19.4 "behavior itself basically becomes this unique signature"
- 23.4 "entirely anonymous, but ... completely trackable"

**Sub-scene 1b: title reveal and mission. 26.4 to 70.0**
- 26.4 "what we're exploring today on this deep dive"; 30.8 "digital footprints left in the snow of decentralized finance" (footprints morph into a trail of transaction hashes / wallet dots)
- 39.3 "a dense but super fascinating article by Eugene Solovyev from 2025" (byline: suenot, 2025)
- 45.2 title read aloud "Analysis of Trader Behavior Prediction Capabilities in DEX based on identification and modeling" (reveal title, data pile assembles into tower)
- 54.3 "unpack the article's unverified hypotheses"; 58.1 "total transparency of decentralized exchanges"
- 63.0 three goals ticked off: "predict trader behavior" (63.0), "build something called a Desire Order Book" (65.5), "detect market manipulation" (~67.5)

**Sub-scene 1c: disclaimers. 70.0 to 104.5**
- 70.0 "lay our cards on the table right away"
- 74.7 "numerical, financial, and research claims ... attributed entirely to the source article ... totally unverified" (DRAFT PROPOSAL banner slides up)
- 82.5 "a theoretical framework here"; 85.8 "Not a verified trading system"
- 88.5 "nothing we discuss constitutes guaranteed returns or investment advice"
- 93.2 "requires human editorial and primary source review"; 97.6 "external NotebookLM sources have verified clearance" (hosts garble this: the slide says they remain unverified; keep the slide wording)

## Slide 2: Machine Learning-Driven Wallet Tracking and Vector Embeddings. 104.5 to 236.4 (131.9 s)

**Content**
- Title (2 lines, large slate sans): "Machine Learning-Driven Wallet Tracking and Vector Embeddings"
- Two framed panels side by side with corner brackets:
  - Left panel (navy border), header "The Proposal":
    - Diagram: an isometric 3D scatter plot inside a hexagonal wireframe cube (3 axes with arrowheads, grid on the floor and back walls). ~80 navy and grey dots; a dense navy cluster (~40 dots) upper right wrapped in a thin wireframe convex hull; several vectors radiate from a central origin point (to the cluster, to the lower left, to the left, to the right).
    - Text column:
      - "DEX participants operate via unique wallet addresses, allowing detailed onchain tracking."
      - "Analyzing approximately 100 transactions is sufficient to create dense vector representations (embeddings) of a participant's unique trading style."
      - "**Attributed Claim:** Up to 84% recognition accuracy among a candidate pool of 100,000."
  - Right panel (oxblood border), header "Evidence & Critical Caveats" with a warning-triangle-plus-pencil icon. Serif text, terms in oxblood:
    - "Identity Distinction: Wallet identification is not verified real-person identity."
    - "Independence Assumption: One address cannot be asserted as one independent, singular trader."
    - "Pending Verification: Source study, sampling methods, metrics, and generalization capabilities require independent primary-source review."

Article check: about 100 transactions, embeddings, up to 84% accuracy among 100,000 candidates, footnote [^1] (Lennart August bachelor thesis, RUG): matches. The article also lists "scalability of the identification method with an increase in the candidate pool" (not on the slide; optional). The right-panel caveats are NotebookLM's critique, not in the article.

**Sub-scene 2a: identification and embeddings. 104.5 to 178.9**
- 104.5 "Okay, let's unpack this"; 105.9 "the very first concept Solovyev tackles is just trader identification" (slide in)
- 111.5 "sounds impossible on a DEX"; 115.8 "no names, no emails, no centralized databases" (three crossed-out icons)
- 119.2 "relies heavily on machine learning"; 122.9 "creating what are called vector embeddings"
- 128.5 "DEXes use unique wallet addresses, which makes activity highly trackable" (wallet address chips appear)
- 137.1 "not as a ledger of balances, but as a massive data set of behavioral habits"
- 149.3 raw variables: "what specific tokens a wallet buys" (149.3), "average holding time" (~153), "gas fees they pay" (154.7), "typical slippage tolerance" (158.1) (four feature chips fly into the 3D plot)
- 161.1 "maps all that into a high dimensional mathematical space" (dots populate scatter plot)
- 165.0 "recognizing a friend's walking gait from afar" (callback to footprints: silhouette with gait rhythm)
- 174.6 "condenses the behavior into a distinct trading style" (cluster hull wraps the navy cluster)

**Sub-scene 2b: the 84% claim and caveats. 178.9 to 236.4**
- 178.9 "cites research claiming ... a relatively small sample"; 184.1 "just about 100 transactions" (counter 100)
- 186.6 "up to 84% recognition accuracy among 100,000 candidates" (big numbers: 84%, 100,000; "Attributed Claim" label)
- 192.4 "Wait, really?"; 197.1 "That's the attributed claim"
- 203.8 "view that specific metric as an unverified claim requiring serious primary source scrutiny" (right panel slides in)
- 211.3 "The source study, its sample size, the metric itself, and its overall generalization require major review" (Pending Verification)
- 218.6 "wallet identification does not equate to a verified real person identity" (Identity Distinction)
- 225.4 "I could have 10 wallets"; 228.3 "We cannot assert that one address equals one independent trader" (one figure behind 10 wallets; Independence Assumption)
- 232.7 "identifying the digital gait, not the person in the shoes"

## Slide 3: Behavior Prediction and the Desire Orderbook Concept. 236.4 to 278.5 (42.1 s)

**Content**
- Title "Behavior Prediction and the Desire Orderbook Concept"
- Framed panel. Top text: "**Conceptual Framework:** The author proposes aggregating individual behavioral patterns to assess the probability of future trader actions."
- Left: label "Standard Orderbook"; an isometric block of solid slate-grey slabs (about 4x4 columns, 8 to 12 thin layers stacked, two height tiers), dimension crosshairs at the corners. Caption: "**What it is NOT**: It is not a live order book. It does not represent demonstrated liquidity, guaranteed orders, or verifiable onchain capital."
- Right: label "Desire Orderbook"; a low base of solid slate slabs (one or two layers) with a city of tall translucent orange wireframe prisms rising above it (~15 columns of varying height), soft orange glow streaks rising from the base. Caption: "**What it is proposed to be**: A probabilistic projection of potential future orders overlaid with current market data."

Article check: "an order book that reflects not only current but also potential future orders" and "assesses the probability of certain actions": matches. The "What it is NOT" list is NotebookLM's caveat, consistent with the article's framing.

**Beats**
- 236.4 "But if we can recognize those digital gaits, what happens when we try to guess where they're walking next?" (bridge; footprints continue ahead as ghost prints)
- 242.0 "Which brings us to the desire order book" (slide in)
- 246.5 "it sounds like a crystal ball"
- 252.9 "a probabilistic projection of possible future orders" (orange wireframe columns grow over the base)
- 260.0 "It is a probabilistic projection"; 262.3 "It is not a live order book" (left caption); 264.0 "does not represent demonstrated actual liquidity"
- 268.6 restaurant analogy: "a restaurant trying to project what you might order based on your past visits, rather than looking at the actual ticket you just sent to the kitchen" (optional gag: ghost order ticket vs real ticket)
- 277.5 "It's predictive"

## Slide 4: Sequential Components of the Prediction Model. 278.5 to 356.8 (78.3 s)

**Content**
- Title "Sequential Components of the Prediction Model"
- Two columns, 2x2 grid of cards, two amber hatched block arrows pointing left -> right between the columns:
  - Left header bar (slate fill, white text): "Observable Onchain State (Data-Driven)". Cards with solid navy borders and corner crosshairs:
    - Line chart with rising arrow icon. "**1. Historical Patterns.** Studying a trader's typical behavior across varying past market conditions."
    - Pie chart icon (one slice pulled out). "**2. Current Portfolio State.** Analyzing live asset balances and token distribution within the target wallet."
  - Right header bar (amber fill, white text): "Inferred Intentions (Probabilistic)". Cards with dashed amber borders:
    - Clock-plus-calendar-with-chart icon (amber). "**3. Temporal & Market Context.** Factoring in time of day, day of the week, and broader macro market trends."
    - Lightning bolt with radiating rays icon (amber). "**4. Behavioral Triggers.** Identifying specific, inferred events hypothesized to precede a decision to sell or transact."

Article check: four components in this order match. **Discrepancy**: the slide places #3 (context) under "Inferred Intentions", but the narration (correctly) says the first three are observable and only #4 is inferred. Redraw with 1 to 3 on the observable side and only 4 (Behavioral Triggers) on the inferred side. Also the article says triggers precede "a decision to sell" (slide: "sell or transact"; narration: "sell or buy"); use "a decision to sell".

**Beats**
- 278.5 "to make that prediction, the expert model relies on four specific inputs. Strictly in this order" (slide in, empty grid)
- 285.7 "First is the analysis of historical patterns"; 288.1 "typical behavior in various market conditions" (card 1)
- 291.4 "establishing the baseline gait"
- 293.7 "second is the assessment of the current portfolio state"; 297.3 "asset balances and distribution" (card 2)
- 300.7 "if a wallet is 90% stablecoins, their next move is different than if they're holding 90% volatile meme coins" (pie chart flips between 90% stable and 90% meme)
- 309.4 "Third, we have contextual factors"; 311.9 "time of day, day of the week, and broader market trends" (card 3)
- 318.0 "those first three ... are all observable onchain states" (bracket around cards 1 to 3)
- 331.6 "the difference between those first three inputs and the fourth input"; 334.4 "behavioral triggers" (card 4, lightning)
- 338.6 "specific events that usually precede a decision to sell or buy"
- 344.1 "relies on inferred intentions, not just observable state" (dashed amber border)
- 349.9 "from hard math to guessing the psychological why"; 354.5 "the most vulnerable point in the model" (card 4 gets a red crack)

## Slide 5: Number of Active Traders as a Market Asset. 356.8 to 404.8 (48.0 s)

**Content**
- Title "Number of Active Traders as a Market Asset"
- Section header "Proposed Signals (The Hypothesis)". Three semicircular gauges (cream to amber to orange bands, navy needle, dimension arrows on the right side):
  - Gauge 1 (upward zigzag arrow icon, needle high), label "PARTICIPATION". "**Market Health Indicator:** High independent participation suggests a healthy ecosystem."
  - Gauge 2 (padlock icon, scale text "LOW" left, "HIGH RESISTANCE" on the arc and at the right end, amber needle high), label "MANIPULATION DIFFICULTY". "**Manipulation Resistance:** Greater participation theoretically increases manipulation difficulty."
  - Gauge 3 (clock icon plus 3 rising amber bars, needle high), label "FUTURE VOLUME GROWTH". "**Future Liquidity Predictor:** Participant growth is hypothesized to precede volume growth."
  - Tiny gauge corner labels ("CAPTOR", "EANTOR", "GOFPOR", "TRADER") are garbled AI text; do not redraw.
- Bottom red box (pale red fill, oxblood border) "Critical Unresolved Assumptions (The Reality)" with warning triangle; three columns each with a red warning triangle:
  - "**Address Clustering:** Extreme difficulty in proving multiple active addresses are not controlled by a single entity."
  - "**Sybil Vulnerability:** Active user metrics are highly susceptible to automated generation and spoofing."
  - "**Causality Gap:** The link between raw participant count and actual market resistance remains an unvalidated assumption, not a verified conclusion."

Article check: three advantages (market health, manipulation resistance, future liquidity predictor), alternative to trading volume: matches. The red "Reality" box is NotebookLM's critique, not in the article.

**Beats**
- 356.8 "what happens when we zoom out and look at the sheer number of these individuals as a metric itself?" (bridge, individuals zoom out into a crowd)
- 364.9 "using the number of unique active traders as a market asset" (slide in)
- 369.7 "an alternative metric to traditional trading volume" (volume bar vs people counter)
- 375.2 "a signal for market health" (gauge 1), "manipulation resistance" (~377, gauge 2), "and future liquidity" (~379, gauge 3)
- 380.9 "couldn't one person just control thousands of addresses to look like a crowd, like a Sybil attack?" (one puppeteer, crowd of wallet puppets)
- 389.1 "address clustering" (card 1), "Sybil attacks where you fake users" (~391, card 2), 392.1 "the actual causality of these metrics" (card 3)
- 395.1 "totally unresolved assumptions"; 398.0 "aren't validated conclusions"
- 400.7 "hasn't solved the fake user problem" (gauge needles wobble)

## Slide 6: Detection of Manipulations on DEX via Onchain Transparency. 404.8 to 440.7 (35.9 s)

**Content**
- Title "Detection of Manipulations on DEX via Onchain Transparency"
- Serif subheading: "**The Transparency Premise:** The article posits that public blockchain ledgers create unique opportunities to isolate manipulation patterns buried in chaotic transaction streams."
- Left: a cloud of ~300 navy dots and short dashed streaks exploding outward (raw data chaos), labels "RAW TRANSACTIONS", "CHAOS", "UNSTRUCTURED DATA" (x3), fake hash strings ("hash3trl...") and "RAWIC TRANSACTIONS" (garbled; redraw as plain "RAW TRANSACTIONS" and generic hex hashes). Arrows converge right into:
- Center: a tall framed box with heavy corner brackets, circuit-gate (logic AND/OR gate) symbols top and bottom, big bold text "Anomaly Detection Lens".
- Right: three outputs on small time-series axes, each with an elbow arrow from the lens:
  - "**Vector 1:** Order-Book Manipulation" (dotted line with step down and back up, amber dots at transitions)
  - "**Vector 2:** Curve Analysis Exploits" (dotted sine wave with amber arrows riding it)
  - "**Vector 3:** Order Placement & Front-Running" (dotted staircase with amber step arrows)
- Bottom framed box: "**Architectural Limitation Caveat (CRITICAL):** The proposed models regarding order placement, curve analysis, and order-book manipulation apply **strictly to order-book DEXs**. These dynamics cannot be assumed for, or directly mapped to, every liquidity-pool (AMM) DEX architecture."
- Footer italic: "**Note:** Proposed detection signals require independent corroboration. This framework provides neither accusations against specific users nor actionable instructions for manipulation."

Article check: transparency premise matches. **Discrepancy**: the three vector names on the slide ("Order-Book Manipulation", "Curve Analysis Exploits", "Order Placement & Front-Running") are NotebookLM inventions; "front-running" does not appear in the article. The article's three manipulation types (and the next three slides) are: 1. Self-Trading, 2. Price-Setting, 3. Pump-and-Dump. Redraw the three outputs as those. The "strictly order-book DEXs" caveat is NotebookLM's own and partly contradicts the article, which says price-setting "occurs through interaction with the orderbook or liquidity pools"; soften to "some signals (order curves) assume an order-book DEX; do not map them blindly onto AMM pools".

**Beats**
- 404.8 "here's where it gets really interesting"; 406.6 "Because everything is transparent" (slide in, chaos cloud)
- 408.6 "this massive data set can be used defensively to detect manipulation" (data flows into lens)
- 414.4 "a crucial caveat"; 417.8 "apply specifically to order book DEXes"; 422.5 "not your typical automated market maker liquidity pool" (caveat box)
- 431.4 "absolutely avoiding actionable manipulation instructions"; 435.7 "no accusations against specific users"; 438.3 "All these signals require intense corroboration" (footer note)

## Slide 7: Detection Vector 1: Self-Trading and Wash-Trading Cycles. 440.7 to 489.4 (48.7 s)

**Content**
- Title "Detection Vector 1: Self-Trading and Wash-Trading Cycles"
- Subtitle: "The Concept: Identifying artificial volume by tracing onchain transaction trails. The article cites the DEFIRANGER system and the analysis of Cash Flow Trees (CFT) to isolate these characteristics."
- Left: a ring of 5 circular nodes, each containing an isometric building/cube icon: Node 1 (top), Node 2 (right), Node 3 (bottom right), Node 4 (bottom left), Node 5 (left). Double concentric arrow rails run clockwise Node 1 -> 2 -> 3 -> 4 -> 5 -> 1, labelled "TRANSACTION TRAIL" (outer) and "ASSET TRANSFER" (inner) on segments. Center label "Cash Flow Tree (CFT)". Nodes 2, 3, 5 have amber crosshair rings. Amber callouts: "ANOMALY DETECTED" (Node 5, Node 2, Node 4), "CROSS-REFERENCE FAIL" (Node 5, Node 3).
- Right box "Hypothesized Signals of Self-Trading", with leader lines from the ring:
  1. "Related Addresses: High-frequency transactions occurring exclusively between closely linked or correlated wallets."
  2. "Overlapping Orders: Unusually large buy/sell orders placed at almost identical prices."
  3. "Cycle Anomalies: Repetitive transaction loops that exhibit no logical economic sense, profit motive, or external utility."

Article check: DEFIRANGER, CFT, three signs (related addresses, overlapping large orders at almost identical prices, repetitive cycles without economic sense): matches. The slide's "high-frequency ... exclusively" wording is NotebookLM embellishment; the article only says "transactions between related addresses". Note: the drawing is a ring, but a cash flow tree is a tree; for the redraw a funding root that branches to wallets which then trade in a loop reads better.

**Beats**
- 440.7 "let's look at the three types of manipulation outlined, starting with faking your own volume" (slide in; three type icons, first highlighted)
- 446.0 "Self-trading"; 447.3 "cites the DEFIRANGER system"; 449.8 "a cash flow tree or CFT" (center label)
- 455.3 "maps the branches of token transfers"
- 458.8 "three specific signals in order"
- 463.2 "First, transactions between related addresses"; 466.2 "wallets that all share a root funding source" (root node feeds 5 wallets; signal 1)
- 470.3 "Second ... unusually large overlapping buy and sell orders at almost identical prices" (signal 2; buy and sell blocks collide at same price)
- 476.1 "you're just playing ping pong with yourself" (optional gag: ping pong ball between two wallets of the same owner)
- 480.7 "third, repetitive transaction cycles that make no economic sense" (signal 3; loop spins, ANOMALY DETECTED flags)
- 485.3 "Paying gas fees just to generate the illusion of activity" (gas coins burn per loop)

## Slide 8: Detection Vector 2: Price-Setting and Order Curve Anomalies. 489.4 to 529.5 (40.1 s)

**Content**
- Title "Detection Vector 2: Price-Setting and Order Curve Anomalies"
- Subtitle: "The Concept: Attempts to influence asset prices via the strategic placement of large orders in the orderbook that the initiator does not intend to fully execute."
- Left chart: plain axes (no labels). Smooth navy bell curve labelled "Fair Market Simulation". Jagged amber line labelled "Anomalous Order Curve" roughly tracks the bell but with tall spikes on the left shoulder and right shoulder (above the bell), a deep rectangular notch dropping to near zero just left of center, and noise around the peak. A dashed vertical line at the bell peak; a small arrow left along the peak level and a vertical arrow up beside the notch (measurement marks).
- Right box "Proposed Detection Methods", leader lines to the chart:
  1. "Order Curve Analysis: Comparing real-time order curves against established baseline simulations of fair markets."
  2. "Irregularity Spotting: Identifying symmetry violations or recurring irregular behaviors in order placement."
  3. "Standardization: Mapping standard order patterns to compare against reference models to continuously spot deviations."

Article check: large orders not intended to be fully executed; three detection methods; footnote [^3] (dirittoue.info, fair market simulation): matches. The bell-curve shape is illustrative, not data.

**Beats**
- 489.4 "that's fake volume. The second type is price setting" (slide in)
- 493.4 "more about psychological warfare"
- 496.1 "Placing massive orders with zero intention of executing them"; 499.3 "trying to scare or bait the market" (giant order wall appears, then vanishes)
- 501.6 "Spoofing"
- 505.7 "analyzing anomalies in order curves by comparing them against fair market simulations" (bell curve draws, then amber curve overlays; method 1)
- 510.8 "a digital twin of a healthy market"
- 513.9 "look for symmetry violations"; 516.1 "the natural spread is broken by a massive artificial wall" (spikes and notch highlighted; method 2)
- 519.8 "compared to standardized reference models" (method 3)
- 523.9 "a perfectly geometric square crater on a map of natural mountains" (the rectangular notch zooms in as a square crater)

## Slide 9: Detection Vector 3: Phased Pump-and-Dump Schemes. 529.5 to 572.4 (42.9 s)

**Content**
- Title "Detection Vector 3: Phased Pump-and-Dump Schemes"
- Serif subtitle: "The Concept: Multi-phase schemes artificially inflating and crashing asset prices, hypothesized to be highly visible due to absolute DEX transaction transparency."
- Wide price chart split into 4 equal vertical bands by solid lines, double-headed width arrows over each band:
  1. "1. Pre-launch & Accumulation": flat line near zero; caption "Quiet, gradual purchasing of large token quantities prior to broad market awareness."
  2. "2. Launch": gentle rise with small bumps; caption "Initial coordinated market activity designed to trigger momentum."
  3. "3. Pump Phase": steep jagged rise with spikes, a smooth moving-average curve under it, peak at the band 3/4 boundary; caption "Artificial price inflation driven by self-trading or aggressive, coordinated orders."
  4. "4. Dump Phase": sharp collapse back to near zero, then flat; caption "Mass selling of the accumulated asset into the inflated liquidity pool."
- Price line navy with an amber glow outline; dense vertical hatch lines under the curve in bands 3 and 4; annotation arrows (trend arrows per phase, a long down arrow in band 4).

Article check: four phases pre-launch, launch, pump, dump; signs: accumulation (quiet purchase), pump (self-trading or aggressive orders), dump (mass selling at artificially inflated prices): matches. The slide merges "accumulation" into phase 1; the article lists accumulation as a sign, and the narration says it spans pre-launch and launch. "into the inflated liquidity pool" is NotebookLM wording; the article says "at artificially inflated prices".

**Beats**
- 529.5 "the classic, the third tactic, the pump and dump" (slide in)
- 533.5 "four phases"; 536.3 "Pre-launch, launch, pump and dump" (four band labels pop in one per word, ~536.3 to 539.0)
- 539.6 "the on-chain footprints are very distinct"
- 544.5 "starts with the accumulation phase"; 546.9 "quietly buying up tokens across multiple wallets during the pre-launch and launch" (several wallets quietly fill; flat line in bands 1 to 2)
- 551.4 "Hoarding the supply silently"
- 553.8 "Then comes the pump phase"; 555.7 "artificial price increases via that self-trading ... or highly aggressive orders to trigger retail FOMO" (line rockets up in band 3)
- 562.8 "once the public jumps in providing the exit liquidity" (crowd icons pile in near the peak)
- 565.6 "Then you hit the dump phase"; 567.5 "Mass selling from those original accumulation wallets crashing the price" (same wallets dump; line collapses in band 4)
- 571.3 "It's brutal"

## Slide 10: Technical Solutions for Proposed Implementation. 572.4 to 622.8 (50.4 s)

**Content**
- Title "Technical Solutions for Proposed Implementation"
- Top center: a long framed beam/sign "Desire Orderbook Engine".
- Four isometric classical pillars (cream with amber bands at capital and base), each with a thick curved double-line arrow (pipe) rising from its top into the beam; dimension lines and measurement ticks around the pillars. Captions under each pillar:
  - "**Component 1: ML Embeddings & Prediction** Machine learning systems dedicated to generating trader vector representations and probabilistic forecasts."
  - "**Component 2: Transaction Graphs** Network analysis tools for mapping relationships, identifying linked addresses, and isolating self-trading clusters."
  - "**Component 3: Market Simulation Baselines** Systems running continuous fair-market reference models to establish comparative baseline behaviors."
  - "**Component 4: Real-Time Monitoring** Live-data ingestion systems designed for the prompt, continuous detection of anomalous or suspicious onchain activity."

Article check: four components in this order match section "Technical Solutions for Implementation". **Discrepancy**: the article does not say these components feed a single "Desire Orderbook Engine"; they implement all the described concepts (identification, prediction and manipulation detection). Label the beam "Proposed system" or "Identification + prediction + detection" instead.

**Beats**
- 572.4 "knowing these manipulations exist is one thing. How does the article propose we actually build a system to stop them?" (bridge)
- 579.0 "if we connect this to the bigger picture"; 581.3 "four proposed technical components strictly in this order" (slide in, empty beam)
- 587.3 "First, machine learning systems"; 589.5 "trader embeddings and predict the behavior" (pillar 1 rises)
- 596.8 "Second is transaction graph analysis"; 599.7 "identify related addresses and map the self-trading"; 603.9 "Building the cash flow trees" (pillar 2)
- 606.6 "Third, you need market simulation models"; 609.5 "baseline reference patterns, the digital twins" (pillar 3)
- 616.4 "And fourth, real-time monitoring systems"; 619.4 "catch suspicious activity as it actually happens" (pillar 4, beam lights up)

## Slide 11: System Limitations and Ethical Considerations. 622.8 to 699.1 (76.3 s)

**Content**
- Title "System Limitations and Ethical Considerations"
- 2x2 grid of cards (white with a thick navy left/top edge and a thin oxblood stripe under the top edge, stacked-paper shadow), each with a line icon in a crop-mark square:
  - Eye with a target crosshair at top right: "**Privacy Expectations** Blockchain pseudonymity does not grant absolute consent; highly detailed behavioral profiling may violate user privacy expectations."
  - Bell with an oxblood slash: "**False Positives** Legitimate, complex, or institutional trading strategies may easily be erroneously flagged as malicious market manipulations."
  - Forked road arrows (straight up, left turn, right turn with oxblood inner line): "**Adversarial Adaptation** Public awareness of ML detection models will likely trigger manipulators to develop more sophisticated, evasive schemes."
  - Zigzag line chart with oxblood double outline and an up arrow: "**High Volatility & Uncertainty** Even the most sophisticated algorithms possess severe limitations when operating within the extreme volatility native to cryptocurrency markets."

Article check: the article's "Limitations" section lists three items (privacy, false positives, adaptation of manipulators); the fourth (volatility and uncertainty) comes from the article's Conclusion. Content matches. "institutional" and "pseudonymity does not grant absolute consent" are NotebookLM embellishments, harmless.

**Beats**
- 622.8 "Which sounds like an all seeing eye" (eye icon opens); 624.8 "what could possibly go wrong with a system that tracks your every digital move in real time?"
- 631.3 "A lot, actually"; 633.7 "ground this conversation in the severe limitations" (slide in, grid)
- 642.1 "The first is privacy expectations" (card 1); 644.8 "pseudonymous, sure"; 647.2 "deep behavioral profiling borders on violating user privacy"
- 652.6 "If they know what I'm going to buy before I buy it, I have zero privacy"
- 657.9 "the huge risk of false positives" (card 2); 660.4 "perfectly legitimate trading strategies might get erroneously flagged as manipulation" (alarm bell rings on an innocent wallet, then slashed)
- 668.5 "third is adversarial adaptation" (card 3); 671.3 "The arms race"; 673.2 "Manipulators will just build better, more sophisticated schemes" (path forks around the detector)
- 679.6 "They'll train their bots to fake the digital twin"
- 682.7 "the environment we're in. Crypto is chaos"; 686.8 "the fourth major limitation. High volatility and uncertainty" (card 4)
- 691.5 "Prediction algorithms struggle inherently in the chaotic environment"; 696.5 "Black swan events shatter these models" (zigzag chart cracks; black swan silhouette)

## Slide 12: The Author's Hypothesis. 699.1 to 725.3 (26.2 s)

**Content**
- Top half: title "The Author's Hypothesis"; text: "Integration of ML embeddings, transaction graphs, and simulation models to construct a probabilistic desire orderbook will result in greater fairness, transparency, efficiency, and enhanced prediction capabilities on DEXs."
- Top right: a big isometric zigzag up arrow (navy outline, hatched faces) with dimension lines and arrows around it.
- Bottom half (solid medium grey band): serif heading "Editorial Summary & Reality Check" (white); three numbered points (dark text):
  1. "The proposed system demands a fragile balance between effective anomaly detection and the protection of user privacy."
  2. "Claims regarding guaranteed market fairness, manipulation-resistance, and prediction capability remain unverified hypotheses pending rigorous primary-source review."
  3. "No guaranteed returns or investment advice are implied by this analysis."

Article check: Conclusion: careful balance between detection and privacy; ML + graph analysis + simulation "can significantly increase the transparency and efficiency of DEX, creating a fairer and more manipulation-resistant trading environment". The slide's "will result in" overstates the article's "can"; use "could". "enhanced prediction capabilities" is not in the conclusion (the hosts also add it). The "Reality Check" box is NotebookLM's framing.

**Beats**
- 699.1 "summarizing the article's conclusion here" (slide in)
- 701.6 "Solovyov hypothesizes that combining these ML models, graph analysis, and simulations" (three pillars merge into the arrow)
- 705.2 "could theoretically increase transparency, efficiency, and fairness on DEXs" (three words light up on the arrow)
- 712.0 "That is the core hypothesis"
- 713.6 "I want to reiterate our final caveat"; 716.4 "claims about greater fairness and predictive capability remain the author's hypotheses" (grey band slides up, point 2)
- 721.7 "pending editorial and primary source review"

## Slide 13: Citations and Source Material. 725.3 to 779.24 (53.9 s)

**Content**
- Title "Citations and Source Material"
- Code card (dark navy header bar, mono text), exactly:

```bibtex
@software{soloviov2025analysistraderpredictiondex,
  author = {Soloviov, Eugen},
  title = {Analysis of Trader Behavior Prediction Capabilities in DEX Based on Identification and Modeling},
  year = {2025},
  url = {https://marketmaker.cc/en/blog/post/analysis-trader-prediction-dex},
  version = {0.1.0},
  description = {How DEX transparency and modern identification methods allow predicting trader behavior, detecting manipulations, and building a desire orderbook.}
}
```
- "Footnoted References (from Source):"
  - "[^1] BP-Lennart-August-s4800036.pdf (Trader Identification / 84% accuracy claim)"
  - "[^2] DEFIRANGER / malgenomeproject.org (Self-Trading / Cash Flow Tree analysis)"
  - "[^3] dirittoue.info (Market Manipulation / Fair market simulation)"
- Italic footnote: "Footnote: Draft requires human editorial and primary-source review. Target-channel duplicates remain unverified; do not imply clearance." (internal production note; drop it when redrawing)

Article check: BibTeX matches the article's Citation block exactly; footnote sources match [^1] to [^3].

**Beats**
- 725.3 "if you want to read the source material yourself" (slide in)
- 727.1 "the article is Analysis of Trader Behavior Prediction Capabilities in DEX Based on Identification and Modeling by Eugene Solovyov" (BibTeX types in: title, author)
- 736.2 "published in 2025 on MarketMaker.cc" (year, url lines)
- 742.5 "a final thought for you to mull over" (fade code card back; final-thought scene)
- 745.9 "if machine learning can perfectly predict human trading intentions through a fully realized desire order book" (orange desire columns fill the whole book)
- 756.1 "does the market just cease to be a human marketplace entirely?"
- 762.7 "a pure battle of algorithms trying to out-simulate each other in the dark"; 768.2 "A market of machines" (robots facing each other across an order book)
- 770.1 "the next time you leave your digital footprints out there" (callback: footprints in snow, opening image)
- 773.8 "Thank you so much for joining us"; 775.8 "keep questioning the information you encounter and we'll catch you next time" (end card)

---

## NotebookLM errors and deviations (use the corrected version)

1. Slide 4: "3. Temporal & Market Context" is grouped under "Inferred Intentions (Probabilistic)". Narration and logic say components 1 to 3 are observable onchain state; only "4. Behavioral Triggers" is inferred. Redraw with 1 to 3 on the observable side.
2. Slide 4 / narration: triggers precede "a decision to sell or transact" (slide) / "to sell or buy" (narration). Article: "a decision to sell".
3. Slide 6: vector names "Order-Book Manipulation", "Curve Analysis Exploits", "Order Placement & Front-Running" are invented; front-running is not in the article. Use the article's three types: Self-Trading, Price-Setting, Pump-and-Dump.
4. Slide 6 / narration (417.8): manipulation signals apply "strictly to order-book DEXs". Not in the article; the article says price-setting happens through "the orderbook or liquidity pools", and DEFIRANGER analyzes DeFi cash flows generally. Present as an editorial caution at most, not as an article claim.
5. Slide 10: four components feeding a "Desire Orderbook Engine". The article presents them as the stack for all described concepts (identification, prediction, manipulation detection), not one desire-orderbook engine.
6. Slide 12: "will result in greater fairness ... and enhanced prediction capabilities". Article: "can significantly increase the transparency and efficiency of DEX, creating a fairer and more manipulation-resistant trading environment"; prediction capability is not part of that sentence. Use "could".
7. Slide 9: dump phase "into the inflated liquidity pool"; article: "mass selling at artificially inflated prices". Accumulation is a sign spanning pre-launch and launch, not a renamed phase 1.
8. Slide 7: "High-frequency transactions occurring exclusively between closely linked wallets" overstates the article's "transactions between related addresses".
9. Narration: author name "Eugene Solovyev / Solovyov" is a mis-rendering; the article byline is suenot, BibTeX "Soloviov, Eugen". Do not caption the misspelling.
10. Narration (97.6 to 101.6): "the external NotebookLM sources have verified clearance" inverts the slide 1 banner, which says they "remain unverified". Keep the slide meaning.
11. Garbled AI text to drop: gauge corner labels on slide 5 ("CAPTOR", "EANTOR", "GOFPOR"), fake hashes and "RAWIC TRANSACTIONS" on slide 6, internal source hash on slide 1 and production footnote on slide 13.
12. Caveat panels on slides 2, 5, 6, 12 (Identity Distinction, Sybil Vulnerability, Causality Gap, Reality Check) are NotebookLM's critique, not article content; fine to keep as hosts' commentary but do not attribute to the author.

---

## Timing notes

`sync_slides.py` was not rerun for this episode (step 1 outputs were reused); the deck order is 1:1 with the narration order, so boundaries are set by hand from the transcript. The hosts do not read heading levels aloud here; each topic change is announced by a bridge sentence, which is used as the slide start (the rhetorical question belongs to the incoming topic).

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | intro (footprints in snow) | high |
| 2 Wallet tracking / embeddings | 104.5 | "Okay, let's unpack this. ... the very first concept ... trader identification" | high |
| 3 Desire Orderbook concept | 236.4 | "But if we can recognize those digital gaits, what happens when we try to guess where they're walking next?" (heading-like line at 242.0 "brings us to the desire order book") | high (5.6 s window: 236.4 to 242.0) |
| 4 Prediction components | 278.5 | "And to make that prediction, the expert model relies on four specific inputs" | medium-high (could be 280.0; the restaurant analogy ends at 277.5) |
| 5 Active traders | 356.8 | "what happens when we zoom out and look at the sheer number of these individuals" (topic named at 364.9) | high |
| 6 Detection overview | 404.8 | "Okay, but here's where it gets really interesting. Because everything is transparent ... detect manipulation" | high |
| 7 Vector 1 self-trading | 440.7 | "But let's look at the three types of manipulation outlined, starting with faking your own volume" | medium (the slide 6 caveat talk ends at 440.7; alternative 446.0 "Self-trading") |
| 8 Vector 2 price-setting | 489.4 | "Okay, so that's fake volume. The second type is price setting" | high |
| 9 Vector 3 pump-and-dump | 529.5 | "Which brings us to the classic, the third tactic, the pump and dump" | high |
| 10 Technical solutions | 572.4 | "But knowing these manipulations exist is one thing. How does the article propose we actually build a system" | high |
| 11 Limitations | 622.8 | "Which sounds like an all seeing eye ... what could possibly go wrong" | medium (the limitations themselves start at 633.7; 622.8 to 633.7 is a bridge, could also stay on slide 10) |
| 12 Author's hypothesis | 699.1 | "So summarizing the article's conclusion here" | high |
| 13 Citations | 725.3 | "And for you listening, if you want to read the source material yourself" | high |

Weakest boundaries: 7 (440.7 vs 446.0) and 11 (622.8 vs 633.7); both are bridge-sentence choices, not content ambiguity. Long holds that need sub-scenes: slide 1 (104.5 s: snow footprints, title reveal, disclaimers) and slide 2 (131.9 s: embeddings, then the 84% claim and caveats), both split above. Slide 13 carries about 35 s of closing reflection (742.5 to 779.24) that should be its own "market of machines" scene rather than the citation card.
