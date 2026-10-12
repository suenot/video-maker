# ai4finance-foundation-guide (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
12-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/ai4finance-foundation-guide.en.md` (2026-04-13; short guide, ~330 words, so most of the hosts' explanations go beyond the article; see "Source coverage" at the end).

- Audio: `input/notebooklm-sources/ai4finance-foundation-guide/en/audio.m4a`, 1340.37 s (22:20.4), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has `words[]` with per-word start/end; use it for frame-exact beats). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_012.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: warm off-white paper (#F1F0EB) with a light grey square grid, technical-drawing linework (isometric server racks, chips, slabs) in slate (#3A4556), monospace (IBM Plex Mono-like) titles and labels. **Each pillar has its own color, used consistently:** FinGPT = navy (#24365E), FinRL = green (#2F6E3E), FinRobot = plum/burgundy (#6B2A4F). Accent amber (#E3A436) for the LoRA adapters; brick red (#A3283A) for danger (cash mode, expensive retraining, warnings). Keep the three pillar colors as the episode's color code. "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "AI for Finance Foundation" = AI4Finance Foundation, "FINGPT / fin GPT" = FinGPT, "FINRL / FINRAWL" = FinRL, "FINNNLP" = FinNLP, "FINRAG" = FinRAG, "LORA / Laura" = LoRA, "Vibroctic cables" (16.6) = fiber-optic cables, "orbit FinGPT-defeated data" (386.1) = orbit FinGPT to feed it data, "elegant RL, RL lib and stable baseline three" = ElegantRL, RLlib, Stable-Baselines3, "FINRL DeepSeq" = FinRL_DeepSeek, "abides" = ABIDES, "T-WAP" = TWAP, "Sneaking the men" (959.2) = sneaking them in, "auto gen" = AutoGen, "AIforfinance.org" = ai4finance.org, "The Wald Garden" (1319.5) = the walled garden.

---

## Slide 1: Title. 0.0 to 142.6 (142.6 s)

**Content**
- Left: huge bold charcoal title "The AI4Finance / Foundation Ecosystem"; navy subtitle "Architectural Map of FinGPT, FinRL, and FinRobot".
- Right background: faint grey PCB/circuit drawing (central chip with traces, smaller ICs).
- Bottom mono box with a heavy offset shadow:
  - "[SYSTEM STATUS]: Open Research Code Base"
  - "[VERIFICATION PENDING]: Project capabilities are based on dated article descriptions pending primary-source review. All facts are presented as unverified claims sourced from the article."
  - "[LEGAL]: This documentation does not constitute personal investment advice."

Sub-scenes (143 s): **1a Walled garden (0.0 to 62.0)**, **1b Mission + title (62.0 to 103.8)**, **1c Disclaimer (103.8 to 142.6)**.

**Beats**
- 0.0 "a massive, high-performing algorithmic trading firm" / 8.1 "glass towers in Manhattan" / 11.5 "supercomputers humming in some subzero basement" / 16.6 "fiber-optic cables drilling straight into the stock exchange" / 19.7 "armies of quants in ... tailored suits" (glass tower, server basement, cables, quants)
- 24.3 "the ultimate walled garden" (wall rises around the tower) / 31.2 "The barrier to entry isn't just capital ... an absolute monopoly on data processing and execution speed"
- 37.9 "if you didn't have a billion dollars to build that machine, you just couldn't play the game"
- 44.8 "the open-source software community has a really funny habit of looking at walled gardens and deciding to just ... tear them down" (wall cracks)
- 63.6 "democratize the entire concept of algorithmic trading" / 68.5 "putting the power of a massive hedge fund onto a local machine" (tower shrinks into a laptop)
- 77.3 "unpack this incredibly fascinating open-source ecosystem" / 82.2 "built by ... the AI4Finance Foundation" (title in) / 85.7 "a really detailed research article from April 2026"
- 103.8 reality check: 109.1 "experimental open-source GitHub code" / 113.3 "unverified claims from that April 2026 article" / 118.3 "This isn't some magical money printing machine" / 121.6 "definitely not personal investment advice" (status box lines type in)
- 128.9 "do not hand your retirement fund over to a GitHub repository" (gag)
- 136.0 "analyzing a research architecture, not endorsing a financial strategy"

## Slide 2: The Three-Pillar Framework for Algo-Trading. 142.6 to 225.8 (83.2 s)

**Content**
- Mono title (2 lines) top-left.
- Three isometric server racks, each a different color, joined at the top by a thick "Data Backbone" bus; elbow arrows run from pillar 1's info cards into pillar 2, and from pillar 2 into pillar 3; a return arrow along the floor from pillar 2 back to pillar 1.
  - Navy rack, header plate "Pillar 1: FinGPT"; cards "Purpose: Financial Large Language Models (LLMs)" / "Key Technology: LoRA, Fine-tuning, Sentiment Analysis".
  - Green rack "Pillar 2: FinRL"; "Purpose: Reinforcement Learning for Trading" / "Key Technology: Gymnasium, Deep Reinforcement Learning (DRL) Agents".
  - Plum rack (chip and node drawing on its side) "Pillar 3: FinRobot"; "Purpose: Multi-Agent Orchestration" / "Key Technology: AutoGen, System Roles, Toolkits".

Article check: matches the article's pillar table (FinGPT: LoRA, fine-tuning, sentiment; FinRL: Gymnasium, DRL agents; FinRobot: AutoGen, roles, toolkits).

**Beats**
- 142.6 "it rests on three very distinct, very logical pillars" (slide in, empty racks)
- 152.4 "FinGPT, which handles the financial large language models" (rack 1 lights navy) / 157.1 "FinRL, which handles reinforcement learning for trading" (rack 2 green) / 160.6 "FinRobot, which manages the multi-agent orchestration" (rack 3 plum)
- 164.6 "building a high-tech robotic financial firm from scratch" (racks morph into a robot anatomy: head, hands, conductor)
- 175.6 "you need three human-like components"
- 181.4 "First, you need a brain. That's FinGPT" / 184.2 "It reads the news, analyzes the sentiment" (brain icon over rack 1)
- 191.6 "Second, you need reflexes. That's FinRL" / 194.5 "make the trades, manage the timing, and pull the trigger" (reflex hand over rack 2)
- 203.5 "finally, you need a manager. That's FinRobot" / 206.6 "orchestrate the whole team and make sure the brain and the reflexes aren't just fighting each other" (conductor over rack 3)
- 215.2 "a brain in a jar can't buy stock" / 218.0 "a trigger-happy reflex system without any intelligence is basically just a gambling machine" / 222.9 "They have to work in concert" (Data Backbone bus lights, linking all three)

## Slide 3: Pillar I: FinGPT (section divider). 225.8 to 258.1 (32.3 s)

**Content**
- Left: big navy bold "Pillar I: FinGPT"; mono grey subtitle "Deploying Financial LLMs via Low-Rank Adaptation"; an elbow arrow from the subtitle to the stack.
- Right: isometric stack of three slabs; bottom slab solid navy outline labelled "FinGPT" (active), above it a dashed ghost slab "FinRL" and a translucent top slab "FinRobot".

**Beats**
- 225.8 "let's start with the brain" / 228.1 "The first pillar is FinGPT, focused on financial large language models" (slide in, bottom slab lights)
- 232.7 "the foundation's architecture leans heavily on this technology called LoRA" (subtitle types)
- 239.2 challenge: 242.1 "Wall Street firms spend millions, sometimes billions of dollars, training massive AI models from the ground up" / 252.9 "how can an open-source project possibly compete with that level of brute force computing?" (giant server farm vs a tiny laptop)

## Slide 4: The LoRA Advantage in Financial Contexts. 258.1 to 374.2 (116.1 s)

**Content**
- Split by a vertical rule.
- Left: a big isometric cube made of hundreds of small blocks, all glowing red; label with arrow "Retraining all billions of parameters."; red bracket tag "[Computationally expensive]".
- Right: the same cube in neutral grey (frozen), with three small amber plate-like modules plugged into slots on its right face via short pegs; label with arrow "Adding small trainable matrices to selected layers."; under the cube three linked boxes feeding an arrow up into it: "Cheaper execution", "More comparable models", "Compact storage".

Article check: matches the article ("adds small trainable matrices to selected layers instead of retraining all billions of parameters. Cheaper, more comparable, compact storage"). Wording nit: the deck's "Cheaper execution" should be "cheaper training" (LoRA cuts fine-tuning cost; inference cost is about the same).

Optional formula for the redraw (standard LoRA): W' = W + ΔW = W + B·A, with W frozen (d×k), B (d×r), A (r×k), rank r ≪ min(d, k).

**Beats**
- 258.1 "they compete through agility" / 261.1 "that is exactly what LoRA provides" (slide in)
- 265.0 "LoRA stands for low-rank adaptation"
- 268.5 "a standard large language model ... billions of mathematical weights or parameters" (cube assembles block by block)
- 279.3 "if you want to teach that massive general model about ... an SEC filing, the old way was to retrain all those billions of parameters" (left cube glows red) / 292.9 "it costs an absolute fortune in cloud computing" ("[Computationally expensive]" tag; money meter)
- 300.8 "They don't have a billion-dollar server farm"
- 303.1 "LoRA bypasses that completely" / 307.0 "LoRA freezes the original model" (right cube turns grey, ice/lock icon) / 312.8 "injects tiny, highly specialized, trainable matrices into specific layers" (amber modules plug in)
- 323.4 analogy: "a massive, heavy, general knowledge textbook completely intact" / 329.7 "slipping a few highly specific, easily swappable sticky notes into the chapters you care about" / 337.6 "slap in the finance sticky notes and suddenly the book has a new specialty" (amber modules redrawn as sticky notes on a thick book)
- 344.4 "You preserve the core intelligence" / 351.9 "attach a lightweight module for, say, financial sentiment analysis"
- 358.0 "because these sticky notes are so small, they take a fraction of the time and money to train" ("Cheaper" box)
- 365.1 "store dozens of different LoRA modules on a standard hard drive and literally swap them out" ("Compact storage" box; adapters swap in and out of the cube)

## Slide 5: FinGPT Satellites: Data & Context Pipelines. 374.2 to 572.3 (198.1 s)

**Content**
- Two pipelines, each under a navy pill header:
  - "FinNLP (Data Extraction)": three source boxes "News Feeds", "Social Media", "SEC Filings" merge via a thick bracket arrow into a diamond "ETL for Financial NLP", arrow right to a box "Cleaned Text Corpus".
  - "FinRAG (Retrieval-Augmented Generation Pipeline)": document icon "PDF/Word Documents" -> jigsaw-piece document "Chunks" -> database cylinder "Vector Store" -> app window with a speech bubble "LLM Answers".

Article check: matches ("FinNLP — ETL for financial NLP: news, social media, SEC filings"; "FinRAG — RAG pipeline: PDF/Word → chunks → vector store → LLM answers").

Sub-scenes (198 s): **5a FinNLP / ETL (374.2 to 459.1)**, **5b FinRAG / vector store (459.1 to 572.3)**.

**Beats**
- 374.2 "a brain still needs a constant diet of information" / 379.9 "It can't just hallucinate stock picks in a vacuum"
- 386.1 "two specific satellites that orbit FinGPT to feed it data" / 392.3 "FinNLP and FinRAG" (slide in, two pill headers; satellites orbiting a navy core)
- 397.3 "FinNLP" / 399.8 "the ETL process for financial natural language processing" / 405.1 "extract, transform, load" (diamond: E, T, L light in sequence)
- 408.5 "the plumbing of the entire system" / 412.0 "the internet is an insanely messy place"
- 415.2 "dense, hundred page corporate 10-K filings" (SEC box) / 423.3 "a cryptic tweet from a tech CEO filled with rocket emojis" (Social Media box, rocket emojis)
- 433.8 "the system's eyes and ears ... scrubbing and standardizing all that noise"
- 442.9 "Financial markets run entirely on information asymmetry ... the entity that digests the raw information fastest is the one who wins"
- 452.1 "scrubs out the formatting issues, standardizes the text, and feeds a clean, readable stream" (Cleaned Text Corpus box fills)
- 459.1 "clean data doesn't solve the biggest problem with AI, which is hallucination" / 465.5 "the model just confidently guessing an answer"
- 469.3 "the second satellite ... FinRAG" / 473.8 "Retrieval augmented generation" (lower pipeline)
- 480.2 "takes these heavy PDF and Word documents, breaks them into chunks, and puts them in ... a vector store" (doc -> jigsaw chunks -> cylinder)
- 492.8 "a massive, multi-dimensional map of meaning" / 504.4 "translates the actual text into mathematical coordinates based on the concepts"
- 510.4 "inflation is placed mathematically very close to interest rates, but ... very, very far away from ... agricultural subsidies" (2D map: three labelled dots, distances)
- 521.5 "not just doing a Control-F keyword search" / 526.8 "throwing a dart at that conceptual map"
- 531.0 "calculates the coordinates of your specific question, goes to that exact mathematical neighborhood ... pulls the literal chunk of text" (query dot lands, nearest chunk lifts out)
- 544.0 "forces the AI model to read only that chunk to generate its answer" (LLM Answers bubble)
- 550.5 "anchors the AI's reasoning in concrete facts rather than ... potentially outdated training data"
- 561.7 recap: "reading clean data via FinNLP ... mapping concepts with FinRAG ... generating insights without hallucinating"

## Slide 6: Pillar II: FinRL (section divider). 572.3 to 590.2 (17.9 s)

**Content**
- Left: big green bold "Pillar II: FinRL"; mono grey subtitle "Deep Reinforcement Learning for Algorithmic Trading"; a thin arrow to the stack.
- Right: isometric stack of three slabs; middle slab solid green (active), top and bottom translucent grey with dashed outlines.

**Beats**
- 572.3 "a brain in a jar can't buy Apple stock" / 576.7 "To cross the gap from analyzing to actually acting, it needs a nervous system" / 581.4 "It has to put real money on the line"
- 583.3 "the second pillar of the ecosystem, FinRL" (slide in, middle slab lights green) / 588.0 "FinRL, the reflexes"

## Slide 7: The FinRL Convergence Architecture. 590.2 to 655.5 (65.3 s)

**Content**
- Left: three stacked boxes with green elbow arrows converging into a large chip:
  - "Market Data (Raw financial time-series streams)" with a small multi-line price chart icon.
  - "Gymnasium Environments (Standardized RL frameworks)" with a small grid/table icon.
  - "DRL Libraries" containing three pills: "ElegantRL", "RLlib", "Stable-Baselines3".
- Right: big detailed CPU/chip drawing (pins on all sides, traces); its navy core reads "Deep Reinforcement Learning Agent executing trades".

Article check: matches ("FinRL connects market data, Gymnasium environments, and DRL libraries (ElegantRL, RLlib, Stable-Baselines3)").

**Beats**
- 590.2 "FinRL stands for financial reinforcement learning" / 593.4 "This is where theory meets execution" (slide in)
- 596.0 "connects market data with ... gymnasium environments and deep reinforcement learning or DRL libraries" (three boxes in, green arrows flow into the chip)
- 606.1 "ElegantRL, RLlib and Stable-Baselines3" (three pills pop)
- 611.9 "reinforcement learning is essentially training by reward and punishment" / 619.7 "Like training a dog but using complex calculus" (dog-treat gag)
- 623.7 "if the AI makes a profitable trade, it gets a digital treat. If it loses money, it gets mathematically penalized" (+reward / −penalty)
- 630.7 "performs this loop millions and millions of times"
- 638.3 "It needs a simulator, which is what the gymnasium environment is" / 642.8 "You feed historical market data into this digital gym and the AI agent practices buying, selling and holding" / 649.7 "grinding out reps" (agent lifting weights in a gym of candles)

## Slide 8: Built-in Risk Management: The Circuit Breaker. 655.5 to 740.2 (84.7 s)

**Content**
- Left: framed line chart of a jagged index series, with a red horizontal line labelled "turbulence_threshold"; the series pokes above the line twice near the left-middle peaks.
- Middle: pipe-valve junction from the chart, splitting into two pipes:
  - Upper green pipe labelled "Volatility < turbulence_threshold" -> green box "Trading Mode (Agent active)".
  - Lower red pipe labelled "Volatility > turbulence_threshold" -> red box "Cash Mode (Forced liquidation/safety state)".
- Bottom box with a red warning triangle: "The DRL agent automatically halts trading and switches entirely to cash when the turbulence index exceeds the predefined safety threshold."

Article check: matches ("built-in risk management via `turbulence_threshold` — the agent switches to 'cash mode' when volatility is too high"). Precision note: in FinRL the turbulence index is a Mahalanobis-distance measure of how unusual current asset returns are versus their history, not plain volatility; keep the label `turbulence` rather than "volatility" if space allows.

**Beats**
- 655.5 "I have a massive problem with this" / 658.8 "Training in a simulator using past data is fine, but the real market is a total bloodbath" (slide in)
- 665.3 "Simulators don't account for unprecedented black swan events or ... a sudden flash crash caused by a geopolitical crisis"
- 674.1 "how does it not wipe out your entire account the second the real market goes completely off the rails?"
- 684.6 "the developers built a specific panic button for that exact scenario"
- 690.3 "a risk management feature called the turbulence threshold" (red line draws across the chart)
- 698.2 "the moment the seatbelt sign flashes on an airplane" (seatbelt sign icon)
- 702.8 "calculates a real-time index of market volatility" (series draws)
- 706.4 "if the turbulence ... crosses a predefined threshold, the agent's normal trading logic is completely overridden" (series crosses the line; valve flips from green to red pipe)
- 716.5 "It automatically switches to what the architecture calls cash mode" (Cash Mode box glows) / 721.7 "halts new positions and potentially liquidates existing ones"
- 725.2 "pulling its hand away from the stove until the volatility drops back below the threshold" (valve flips back to green)
- 732.5 "it's not just taught how to trade. It's specifically taught when not to trade" / 737.0 "arguably more important"

## Slide 9: FinRL Modular Satellites. 740.2 to 1020.7 (280.5 s)

**Content**
- 2x2 grid of mono cards with icons:
  - **FinRL-Meta** (cloud + database + magnifier): "Extended environments and datasets."
  - **FinRL_Crypto** (Bitcoin coin in a circuit ring): "24/7 cryptocurrency trading integration via CCXT."
  - **FinRL_DeepSeek** (circuit brain with an "NLP" tag): "Ingests NLP features directly into PPO/CPPO reinforcement learning models."
  - **FinRL_Market_Simulator** (gears + green order-book window): "High-fidelity simulation environments (Limit Order Book (LOB) simulation, ABIDES, TWAP)."

Article check: matches the article's FinRL satellites table. Narration order differs from the grid: Crypto -> DeepSeek -> Market Simulator -> Meta; reveal cards in narration order. The hosts frame it as one hypothetical trade lifecycle (3 a.m. Saturday crypto -> bearish headline -> 10,000-share order -> where training data comes from).

Sub-scenes (280 s, the longest slide):
- **9a FinRL_Crypto (740.2 to 784.6)**: 3 a.m. Saturday, CCXT, markets that never close.
- **9b FinRL_DeepSeek (784.6 to 861.9)**: headline -> sentiment -> PPO.
- **9c FinRL_Market_Simulator (861.9 to 981.2)**: market impact, LOB ladder (farmer's-market apples), TWAP slicing, ABIDES crowd.
- **9d FinRL-Meta (981.2 to 1020.7)**: varied regimes (bull, bear, sideways).

**Beats**
- 740.2 "four specific satellites orbiting FinRL" (slide in, four empty cards) / 749.0 "walk through a hypothetical trade life cycle"
- 752.7 "it's 3 a.m. on a Saturday" (clock) / 757.5 "traditional markets are closed. So we must be talking about cryptocurrency"
- 762.3 "FinRL Crypto" (card) / 766.7 "opening bells, closing bells, and weekends off. Crypto never sleeps"
- 772.8 "integrates with CCXT ... the continuous 24/7 nonstop flow of data and execution required for crypto exchanges"
- 784.6 "suddenly a massive piece of breaking news drops on Twitter" / 792.3 "How does the system translate a text headline into a physical trade?"
- 796.4 "FinRL_DeepSeek" (card) / 800.2 "takes NLP features and runs them through PPO algorithms"
- 812.1 "the literal bridge between the brain and the reflexes" (navy FinGPT block wired into the green FinRL block)
- 816.7 "PPO stands for Proximal Policy Optimization" / 823.6 "favors taking small, safe, incremental steps to improve its strategy ... rather than ... wild, unpredictable sweeping changes" (small clipped steps vs a wild jump)
- 834.9 "takes the real-time sentiment analysis from the FinGPT brain ... a news headline is extremely bearish ... feeds it directly into that PPO algorithm" (headline -> red sentiment meter -> PPO box)
- 848.3 "calculates the reward for stepping into the market at that exact split second" / 854.9 "reading a headline and flinching"
- 861.9 "it wants to sell or buy 10,000 shares of an asset immediately" / 869.4 "everyone sees you coming ... The sellers are going to raise their prices instantly" / 875.4 "that's called market impact"
- 877.9 "In a basic simulator, you pretend you can buy unlimited shares at the current ticker price"
- 885.1 "FinRL Market Simulator" (card) / 893.4 "It doesn't just simulate prices. It simulates the limit order book ... ABIDES and ... TWAP"
- 908.3 "a farmer's market to buy a thousand apples" / 912.9 "The first vendor only has a hundred apples at $1" / 916.4 "the next vendor ... charge a dollar ten and so on" (apple stalls = price levels $1.00, $1.10, ...)
- 924.8 "The limit order book is basically that queue of buyers and sellers at different price levels" (stalls become an LOB ladder)
- 930.3 "its own massive trade will eat through the queue and artificially spike the price against itself" (one big order eats levels, price climbs)
- 940.8 "So it learns to hide its footsteps"
- 946.1 "TWAP ... time-weighted average price" / 949.7 "Instead of just buying 10,000 shares at once ... slice that massive order into ... chunks over a period of time" (one block -> equal slices on a time axis; see error 2: equal, evenly timed slices, not "randomized")
- 961.7 "ABIDES, which stands for agent-based interactive discrete event simulation" / 968.6 "thousands of other simulated traders are actively reacting to your moves" (crowd of tiny agents turning toward the order)
- 976.8 "the AI is truly learning stealth execution"
- 981.2 "what about the training environment itself? ... where does it get its weather data" / 991.0 "FinRL-Meta" (card) / 993.5 "essentially the gym manager" / 997.6 "extended environments and diverse data sets"
- 1001.7 "if you only train an AI on a massive bull market, it will panic and break during a recession" / 1011.1 "practices in varied market conditions. Bull, bear, sideways" (three mini charts)

## Slide 10: Pillar III: FinRobot (section divider). 1020.7 to 1061.0 (40.3 s)

**Content**
- Left: big plum bold "Pillar III: FinRobot"; mono grey subtitle "Multi-Agent Orchestration and User Experience"; a small robotic-arm-like elbow connector to the stack.
- Right: isometric stack; top slab solid plum (active), two dashed translucent slabs below.

**Beats**
- 1020.7 "Let's step back for a second and look at what we've actually built here" (recap: three slabs)
- 1025.0 "a genius LLM brain, FinGPT, mapping concepts and reading SEC filings without hallucinating" (bottom slab navy flashes)
- 1031.2 "a ninja reflex system, FinRL, practicing in a hyper realistic market simulator, hiding its footsteps and watching a turbulence threshold panic button" (middle slab green flashes)
- 1040.8 "if you just turn both of those on and walk away, it's going to be absolute chaos" / 1044.6 "the brain and the reflexes might have entirely different priorities" (the two slabs jitter and clash)
- 1049.7 "You can't just have a brain and a nervous system. You need a manager"
- 1053.3 "the third and final pillar ... FinRobot" (top slab drops in plum, title)
- 1058.9 "This is the orchestrator"

## Slide 11: Orchestrating the Ecosystem. 1061.0 to 1234.9 (173.9 s)

**Content**
- Top wide plum bar: "FinRobot UX & Scenarios" / "Powered by AutoGen and internal Toolkits."
- Three piston-like connectors down to three white mono boxes: "Equity Research Agent", "Risk Analysis Agent", "Portfolio Management Agent".
- Down-arrows from each box into a bottom bar split in two: navy "FinGPT (Language Context)" (left half) and green "FinRL (Execution Policy)" (right half).

Article check: matches ("FinRobot is UX and scenarios on top of FinGPT/FinRL. Agent roles include equity research, risk analysis, portfolio management"; AutoGen). The debate example (1167.1 to 1189.8: research proposes a volatile tech buy, risk analyst rejects it and suggests a smaller size, they iterate to consensus) is the hosts' illustration, not described in the article.

Sub-scenes (174 s): **11a Orchestrator + roles (1061.0 to 1120.3)**, **11b Boardroom debate (1120.3 to 1193.9)**, **11c Human as CEO + walled-garden callback (1193.9 to 1234.9)**.

**Beats**
- 1061.0 "FinRobot sits above the brain and the reflexes" (slide in, plum bar over the navy/green bar) / 1063.8 "the user experience and manages complex scenarios"
- 1068.2 "an orchestration framework called AutoGen, along with designated roles and toolkits"
- 1078.6 "it sounds like we are giving the AI multiple personalities" / 1088.7 "No ... it's much more structured than that"
- 1092.0 "spinning up a digital board of directors"
- 1098.7 "very specific agent roles" / 1102.1 "equity research, risk analysis and portfolio management" (three boxes drop in)
- 1110.3 "Each of these agents is powered by the brain and the reflexes" (arrows to the bottom bar) / 1115.1 "distinct, sometimes heavily conflicting, directives"
- 1120.3 "let's visualize this boardroom" (boxes become three characters at a table)
- 1123.0 "the equity research agent ... the aggressive optimist" / 1127.2 "find alpha, read the news using FinGPT and propose aggressive growth trades"
- 1134.5 "the risk analysis agent ... the pessimist ... obsessively staring at the turbulence threshold" (tiny turbulence chart in its hand)
- 1148.0 "the portfolio management agent" / 1152.2 "The boss" / 1153.3 "the tiebreaker, looking at the user's overall goals and capital allocation"
- 1159.5 "do they argue with each other?" / 1163.6 "They literally collaborate and debate"
- 1167.1 "the equity researcher will draft a proposal to buy a volatile tech stock based on a positive earnings call" / 1173.5 "pass that ... over to the risk analyst" / 1176.2 "realizes the market volatility is currently spiking and rejects the proposal, suggesting a much smaller position" (proposal card stamped "REJECTED", resized)
- 1185.7 "They iterate back and forth automatically until they reach a consensus that aligns with the parameters you, the human user, set" (speech bubbles ping-pong, then a green check)
- 1193.9 "the user isn't writing code to execute a trade" / 1199.5 "sitting back, like a CEO, managing a customized workforce of AI agents"
- 1209.8 "It's the democratization of alpha"
- 1215.8 callback: "We started this deep dive talking about the walled gardens of Wall Street" / 1219.2 "from the LoRA sticky notes of the FinGPT brain, down to the simulated order books of FinRL and up to the boardroom of FinRobot" (three quick flashbacks) / 1231.1 "those walls are looking incredibly fragile" (wall from slide 1 crumbles)

## Slide 12: Accessing the Foundation. 1234.9 to 1339.98 (105.1 s)

**Content**
- Mono title "Accessing the Foundation" in a thin bracketed frame.
- Two navy panels with offset shadows, joined by thin connector lines: "Website: ai4finance.org" and "GitHub Repository: github.com/AI4Finance-Foundation".
- Bottom grey terminal box:
  - "> [ALERT]: All components discussed constitute open research code."
  - "> [WARNING]: This is explicitly not personal investment advice." (red)
  - "> [STATUS]: Project capabilities remain dated article descriptions pending primary-source review. Mutable facts are attributed to the article as unverified claims."

Article check: matches the Links section and the article's closing note ("All above is open research code; this is not personal investment advice").

**Beats**
- 1234.9 "for listeners who want to see the actual mechanics of this, the article provides direct avenues" (slide in)
- 1241.4 "explore the overarching project at ai4finance.org" (panel 1) / 1246.3 "the AI4Finance Foundation on GitHub" (panel 2)
- 1252.8 caveat: 1258.0 "open research code from an April 2026 document" / 1267.3 "heavily reliant on unverified claims" / 1272.0 "strictly not personal investment advice" (terminal lines type; WARNING in red)
- 1279.5 closing question: 1289.7 "The sophisticated LLM analysis, the stealthy reinforcement learning execution, the multi-agent debate, all of that used to cost billions of dollars to build"
- 1303.4 "what happens to global financial markets when literally any curious coder with a laptop and a Wi-Fi connection can download and launch their own customized AI driven hedge fund?" (laptop in a suburban room, three pillar colors on screen)
- 1319.5 "The walled garden suddenly has a million invisible gates" (wall with countless doors)
- 1324.0 "might not be in a glass tower in Manhattan after all, it might be running quietly in a basement in the suburbs" (callback to slide 1's tower)
- 1335.4 "Thank you so much for joining us" / 1339.0 "we will catch you on the next one" (end card)

---

## Timing notes

`sync_slides.py` (defaults) degenerated ("showed 5/12 slides, longest held 87%") and fell back to an even 111.7 s split (saved as `timeline_auto_evensplit.json`); wrong for most slides (slide 2 auto 111.7 s vs real 142.6 s, slide 9 auto 893.3 s vs real 740.2 s, slide 11 auto 1116.7 s vs real 1061.0 s).

`slide_starts.json` is set by hand from the transcript; the deck and the audio follow the same order. The three section dividers (slides 3, 6, 10) are short by design; each starts on the hosts' "pillar" cue. Confidence: high = topic sentence names the slide; medium = transition without a named heading.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | intro | high |
| 2 Three pillars | 142.6 | "it rests on three very distinct, very logical pillars" | high |
| 3 Pillar I divider | 225.8 | "So, let's start with the brain" (FinGPT named 228.1) | high |
| 4 LoRA advantage | 258.1 | "they compete through agility ... that is exactly what LoRA provides" | medium (232.7 to 258.1 also mentions LoRA; could start at 265.0) |
| 5 FinNLP / FinRAG | 374.2 | "a brain still needs a constant diet of information" | high |
| 6 Pillar II divider | 572.3 | "a brain in a jar can't buy Apple stock" (FinRL named 583.3) | high |
| 7 FinRL architecture | 590.2 | "FinRL stands for financial reinforcement learning" | medium (could be 596.0) |
| 8 Circuit breaker | 655.5 | "I have a massive problem with this" (turbulence named 690.3) | high |
| 9 FinRL satellites | 740.2 | "four specific satellites orbiting FinRL" | high |
| 10 Pillar III divider | 1020.7 | "Let's step back for a second" (FinRobot named 1053.3) | medium (could start at 1049.7) |
| 11 Orchestration | 1061.0 | "FinRobot sits above the brain and the reflexes" | high |
| 12 Accessing | 1234.9 | "for listeners who want to see the actual mechanics" | high |

## Source coverage and NotebookLM errors

The article is a ~330-word overview; most explanations in the audio (LoRA mechanics, vector-store geometry, PPO, LOB, TWAP, ABIDES, the boardroom debate) are the hosts' elaborations. They are broadly correct, with these issues:

1. **TWAP (audio 949.7):** "slice that massive order into tiny randomized chunks" is imprecise. TWAP splits the order into equal-sized slices executed at evenly spaced time intervals (the average price is time-weighted); randomizing sizes/timing is a separate anti-detection tweak. Draw equal slices on a regular time grid.
2. **FinRL_DeepSeek (audio 800.2, 834.9):** the article says NLP features go into **PPO/CPPO** (the slide has it right); the hosts mention only PPO. CPPO is the risk-constrained (CVaR) variant; show both labels.
3. **Turbulence threshold (slide 8 labels, audio 702.8):** the deck says "Volatility < / > turbulence_threshold". FinRL's turbulence index is a Mahalanobis-distance measure of how abnormal current returns are, not raw volatility. The article itself simplifies it to "when volatility is too high"; acceptable for the cartoon, but prefer the label "turbulence index".
4. **Slide 4 "Cheaper execution":** LoRA makes **training/fine-tuning** cheaper; inference cost is essentially unchanged. Use "cheaper training".
5. **Boardroom debate (1167.1 to 1189.8)** and "risk analyst runs the simulation" are illustrative, not described in the article; fine as a scene, not as a factual claim.
