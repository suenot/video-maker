# child-order-execution-tactics (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
14-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/child-order-execution-tactics.en.md` ("Inside the slice: child-order tactics between your scheduler and the exchange", 2026-07-24, suenot).

- Audio: `input/notebooklm-sources/child-order-execution-tactics/en/audio.m4a`, 1097.12 s (18:17.1), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, per-word start/end in `words[]`). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` + `timeline.json` (manual, see "Timing notes"). **Narration is not in deck order once:** the hosts open slide 6 (queue value), jump to the venue table (slide 7), then return to slide 6 for reprice hysteresis. `timeline.json` therefore has 15 segments, each with an explicit 0-based `slide`; `slide_starts.json` lists the segment starts (segment i shows `timeline[i].slide`).
- Slide PNGs: `slides/slide_001.png` ... `slide_014.png` (not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: off-white paper with a fine grey grid, near-black ink (#1C2430), steel blue (#3A6EA5) formulas, magenta (#C02FA0), amber (#F0A830), green (#3C9A5F). A blue to magenta to amber gradient encodes passive to aggressive. IBM Plex Mono headings prefixed "H2 —" / "H3 —" (markdown heading levels leaked into titles: drop the prefix). Yellow/black hazard-striped "review flag" boxes are NotebookLM boilerplate: drop them.

The hosts' running metaphors: the scheduler is the general in the command tent, the tactics layer is the squad leader in the trenches (80.2 to 103.8, 121.4); X-ray "diagnostic mirage" cold open (0.0 to 24.9); grocery-store line switching for queue position (640.1). Boilerplate disclaimers read aloud at 538.9 to 548.8, 674.6 to 682.6, 865.7 to 884.4, 931.8 to 971.6: one short tag on screen at most.

Transcript quirks (Whisper mis-hearings, do not caption verbatim): "LaHalle and Lerowell" (114.8) / "LaHel" (1040.7) = Lehalle and Laruelle / Lehalle; "QK" = q_k; "tau K" = τ_k; "FT" / "FM" = f_t / f_m; "C take" / "C post" = c_take / c_post; "threshold P" (504.4, 509.2) = p*; "Pi is the price" (516.1) = Π is the **prize**; "Frey and Sandos" / "Sandas" = Sandås; "Cetra" (812.5) = Xetra; "Bessembeinder" / "Besenbinder" = Bessembinder; "Moa Lemme Yuan" / "Mo Lemi and Yuan" = Moallemi and Yuan; "Vnew minus Vcur equals CMSG" = V_new − V_cur = c_msg; "a men key priority" (715.9) = amend keepPriority; "CXL on fail" = cxlOnFail; "S code" = sCode; "amend result" = amendResult; "adverse frat" (915.8) = adverse_frac; "Then you adapters" (959.9) = venue adapters; "Kant and Kukinoff" = Cont and Kukanov; "Then Carvel and Menkfeldt" = van Kervel and Menkveld; "OKEX" = OKX; "Eugene Solovyov" = Eugen Soloviov; "steep dive" (1069.3) = deep dive; "Redriving urgency" (388.4) = re-deriving urgency; "a by-order" (415.5) = a buy order.

---

## Slide 1: Title. 0.0 to 108.1 (108.1 s)

**Content**
- Blueprint chart with a descending blue trajectory curve and garbled math labels (`z = (x − b_y)`, `u = √...`, `ℓ = √(2+b²)`: decorative noise). A magnifying glass zooms on two isometric order-book stacks (blue bids labelled 10,250 / 19,250 / 18,256 / 10,250; green stack 19,230 / 529: noise numbers).
- Title "Inside the slice: child-order tactics between your scheduler and the exchange"; subtitle "Escalation timers, maker-taker break-even math, amend vs cancel-replace semantics, and the per-slice state machine."
- Mono strip: tags ["execution", "child orders", "microstructure", "python"] | date "2026-07-24" | authors ["suenot"].

**NotebookLM errors (flag):** chart labels and book numbers are meaningless. Redraw: an execution trajectory (schedule curve) with one slice magnified into a real-looking order book.

**Beats**
- 0.0 "a medical diagnosis ... absolute precision"; 6.6 "you break your arm, the X-ray shows that jagged white line ... broken or not" (X-ray gag)
- 17.1 "algorithmic trading from the outside ... works exactly the same way"; 22.7 "a diagnostic mirage"
- 35.7 "the algorithm decides to sell like 4.2 Bitcoin over five minutes ... boom, it just happens" (article's own example: "sell 4.2 BTC in the next five minutes"); 44.6 "a microscopic battlefield" (zoom into the slice)
- 55.0 title read "Inside the Slice, Child Order Tactics Between Your Scheduler and the Exchange" (title reveal)
- 64.3 "what happens after an algorithm decides to buy or sell"; 69.0 "the tactical state machine that fights for queue position and manages fees. Millisecond by millisecond"
- 77.1 army analogy: 84.9 scheduler "sell 4.2 Bitcoin over the next five minutes. That's the general. Safely in the command tent" (general icon); 98.1 "the tactics layer, that is the squad leader, right in the trenches" (squad leader icon)

## Slide 2: Two layers, one narrow interface. 108.1 to 320.4 (212.3 s)

**Content**
- Title "H2 — Two layers, one narrow interface" (drop "H2 —").
- Top box "Strategic Layer (Scheduler)" (speedometer + clock): "Runs on a minutes clock, consuming vol/volume forecasts." Bottom box "Tactical Layer (Microtrader)" (stopwatch + tick chart): "Runs on a ms/s clock, consuming L2 deltas." Glowing two-way pipe between them.
- Left "Downward Bridge (Inputs)": ↓ Budget q_k (quantity to execute this interval); ↓ Window τ_k (slice length); ↓ Urgency κ = √(λσ²/η) (compresses risk/vol/liquidity into one rate; VWAP uses band-distance).
- Right "Upward Bridge (Outputs)": ↑ Timestamped fills, fees, remainder, and slice shortfall versus interval arrival mid.
- Green box "Core Rule: The tactics layer must realize fills better than the η-implied cost without leaking intent. Do not assign urgency twice."
- Magenta box "Remainder Policy: Force-complete vs. re-amortize over remaining slices (which compounds into a massive final slice)."

Article check: matches. Lehalle and Laruelle, *Market Microstructure in Practice* (2nd ed., 2018). VWAP scheduler urgency example: "we are 1.8% behind the target curve". Re-amortizing is acceptable early in a low-κ schedule and poisonous near the deadline.

**Host error (minor):** 179.0 reads "Kappa equals the square root of lambda sigma squared eta" (drops "over"); 193.6 to 204.3 then states it correctly (λσ² divided by η). Show κ = √(λσ²/η) only.

**Sub-scenes** (212 s, split into 3)
- 2a 108.1 to 216.9, two layers + downward bridge: 108.1 "our first main topic. Two layers, one narrow interface"; 114.8 "the foundational work of Lehalle and Laruelle" (book cover chip); 121.4 "the strategic layer, your general, and the tactical layer, the squad leader" (two boxes with general / squad leader icons); 126.3 "they can't operate on the same clock" / 129.4 "minutes or hours ... milliseconds" (clock vs stopwatch); 138.7 "the downward interface ... has to be incredibly narrow" (pipe narrows); 148.7 "three specific instructions ... slice k"; 158.4 "the budget, q_k"; 169.6 "the window, τ_k"; 175.5 "the urgency represented by κ" (three arrows drop one by one); 185.7 "Kappa isn't just an arbitrary dial ... from 1 to 10"; 193.6 "risk aversion, lambda ... volatility squared ... divides ... by ... eta ... square root" (κ formula builds term by term); 207.7 "one single rate for the squad leader to follow".
- 2b 216.9 to 265.3, upward bridge + core rule: 216.9 "what flows back up the chain?"; 222.2 "Time stamped fills, the actual fees paid, the unfilled remainder ... and the slice level implementation shortfall" (four up arrows); 236.7 "measured ... against the interval arrival mid-price" (arrival mid line vs fills); 247.3 "if ... eta already prices what this should cost, the tactic layer's entire job is just to beat that implied cost without tipping our hand" (green Core Rule box).
- 2c 265.3 to 320.4, remainder policy: 267.2 "a massive point of friction"; 272.0 "The remainder policy"; 285.6 "force complete ... cross the spread" vs 291.9 "return that remainder to the scheduler to be re-amortized" (fork); 298.9 "a huge deadline risk with re-amortizing"; 302.5 "it silently compounds into a massive final slice" (slice bars grow toward the deadline); 314.4 "dump a huge aggressive order right at the buzzer".

## Slide 3: The escalation ladder: passive first, aggressive by deadline. 320.4 to 407.7 (87.3 s)

**Content**
- Title "H2 — The escalation ladder: passive first, aggressive by deadline".
- Four boxes with gradient borders: Post at the touch (blue) → Age out → Escalate → Cross (amber); gradient bar below "Slice Window τ_k".
- "The Harris (1998) Model: For a liquidity trader with a strict deadline, optimal execution is dynamic. Stand in the book with limit orders while time is cheap, reprice toward the market as the deadline approaches, and cross at the end."
- "Queue Dynamics: Limit-order sizing is driven by the distribution of queue outflow. Post aggressively when the queue ahead is small relative to expected outflow; cover tail risk risk with market orders (Cont & Kukanov)."

**NotebookLM errors (flag):** typo "tail risk risk" → "tail risk". Article refs: Harris (1998), *Financial Markets, Institutions & Instruments* 7(2); Cont and Kukanov (2017), *Quantitative Finance* 17(1) (newsvendor structure).

The "never assign urgency twice" rule (378.8 to 397.2) belongs to slide 2's green Core Rule box: re-show that box as an overlay.

**Beats**
- 320.4 "the escalation ladder. Passive first, aggressive by deadline"; 328.6 "a 1998 strategy by Lawrence Harris" (Harris box)
- 334.7 "post passively at the touch" / 339.4 "age out" / 341.6 "escalate" / 343.0 "cross the spread" (ladder steps light up in sequence along the τ_k bar); 345.4 "Every modern tactics engine is ... a descendant of this historical shape"
- 349.8 "Kappa dictates how fast we climb that ladder"; 355.7 "a high Kappa ... very short windows ... skip the passive posting phase entirely" (ladder collapses to Cross); 370.6 "a low Kappa stretches out that passive phase" (blue segment stretches)
- 374.0 "does the squad leader ... adjust Kappa on the fly? Never"; 382.8 "never assign urgency twice"; 394.7 "two completely disagreeing controllers fighting each other for the steering wheel" (two hands on one wheel gag)

## Slide 4: The break-even for crossing. 407.7 to 525.4 (117.7 s)

**Content**
- Title "H3 — The break-even for crossing".
- Formulas: Crossing cost `c_take = s/2 + f_t`; posting cost `c_post = p(−s/2 + f_m) + (1−p)(s/2 + f_t + δ)`; break-even: posting beats crossing iff `p > p* = δ/(Π + δ)`; prize `Π = s + f_t − f_m` ("the full round-trip captured by making instead of taking").
- Hazard flag "Production-code review flag: Preserve the maker-fee sign convention (negative = rebate) with consistent per-unit dollars and basis points. On tight crypto majors, \PI is purely the fee differential."

Article check: derivation verified: c_post < c_take ⇔ p(s + f_t − f_m + δ) > δ ⇔ p > δ/(Π + δ). δ(τ) = E[adverse mid move | no fill] > 0 (non-fill and adverse drift are the same event).

**NotebookLM errors (flag):** raw LaTeX "\PI" → Π. Keep the sign-convention point (f_m negative for a rebate) as a plain caption, drop the hazard stripe.

**Sub-scenes** (118 s, split)
- 4a 407.7 to 494.7, the two costs: 407.7 "the break-even for crossing"; 411.6 "hard arithmetic"; 415.5 "walk through it for a buy order"; 418.1 "the system weighs two expected costs" (two-pan scale); 422.4 "the cost of crossing right now ... c_take" / 429.0 "s over 2 plus f_t ... half the spread plus the taker fee" (c_take formula); 438.9 "the expected posting cost, c_post" (formula); 453.5 "That's a lot of variables"; 456.7 "a weighted coin flip based on your fill probability p" (coin: p / 1−p); 462.3 "If you get filled ... earn the half spread and ... pay the maker fee f_m" (p branch highlights); 468.7 "preserve the maker fee sign convention" / 473.0 "a rebate ... f_m is actually a negative number"; 484.0 "the one minus p part ... The market runs away from you" (price walks away from the resting bid); 488.2 "cross this spread later ... plus a new penalty ... Delta" (1−p branch highlights, δ chip).
- 4b 494.7 to 525.4, the threshold: 494.7 "Delta is the adverse price drift ... while you were waiting"; 499.3 "You only post passively when your fill probability p is greater than a critical threshold p*" (inequality); 509.2 "p* equals Delta divided by Pi plus Delta" (p* formula); 513.5 "Pi, like the Greek letter?"; 516.1 "the prize ... The total value you capture by making instead of taking" / 520.9 "Π equals s plus f_t minus f_m" (Π formula).

## Slide 5: Break-even in numbers: the age-out timer. 525.4 to 631.8 (106.4 s)

**Content**
- Same title as slide 4. Chart Probability (p) 0 to 1 vs Time (τ): magenta curve "1 Estimated p(τ)" starts at 1.0 and decreases to about 0.55; blue curve "2 p*(τ)" rises from 0, concave, to about 0.93; they cross near 0.65 with a dotted vertical "Physical age-out timer".
- Box "BTCUSDT Perp Examples": mid $100k, $0.10 spread, maker 2 bps / taker 5 bps, daily vol σ ≈ $3000; τ = 10 s: δ ≈ $19, p* ≈ 0.39; τ = 60 s: δ ≈ $47, p* ≈ 0.61; 1 bp maker rebate (f_m = −$10): τ = 10 s threshold drops to p* ≈ 0.24.
- Box "Urgency & Queue Dependencies: High-κ skips straight to crossing; low-κ stretches the passive phase. Fill probability depends heavily on queue-ahead/drain rate."
- Amber footer (boilerplate, drop).

**NotebookLM errors (flag):** the p(τ) curve is drawn wrong. In the article p(τ) is the cumulative probability of a fill within window τ, "concave, saturating as the queue ahead of you drains": it starts at 0 and rises, flattening below 1. p*(τ) = δ/(Π + δ) with δ ∝ √τ rises toward 1. The age-out timer is the point where the rising p* overtakes the saturating p (posting is worth it to the left, crossing to the right). Redraw p(τ) rising and saturating.

Numbers verified: δ(τ) ≈ 0.6 · $3,000 · √(τ/86400): 10 s → $19.4, p* = 19.4/(30.1 + 19.4) = 0.39; 60 s → $47.4, p* = 0.61. Π = $0.10 + $50 − $20 = $30.10 ≈ 3 bps (f_m = $20, f_t = $50 per BTC at $100k; the spread contributes almost nothing, the prize is the fee differential). With a 1 bp rebate Π = $60.10 → p* = 0.24. All correct.

**Sub-scenes** (106 s, split)
- 5a 525.4 to 583.3, the 10 s / 60 s example: 525.4 "put some real numbers to this"; 529.2 "a Bitcoin tether perpetual future" (BTCUSDT perp chip); 538.9 to 548.8 boilerplate (tiny tag "illustrative"); 552.9 "mid-price is $100,000 ... daily volatility at 3%" (σ ≈ $3,000/day); 557.8 "a 10-second time window ... p* is 39%" (point on p* curve at 10 s); 566.8 "only post if you expect at least a 39% chance of getting filled in those 10 seconds"; 572.2 "60 seconds ... jumps to 61%" (point slides up the curve); 579.0 "the longer you wait, the more likely the market moves against you" (δ ∝ √τ).
- 5b 583.3 to 631.8, rebate + age-out timer: 583.3 "introduce a maker rebate"; 589.7 "your prize, pi, jumps" (Π bar doubles $30.10 → $60.10); 592.1 "drops from 39% all the way down to just 24%" (p* curve drops); 598.5 "moving to a better fee tier physically alters your optimum tactics"; 607.6 "VIP upgrade, cutting taker fees, makes your optimal tactics more aggressive" (correct: smaller f_t → smaller Π → higher p* → cross sooner); 612.3 "fill probability ... how many orders are ahead of you in the queue" / 619.5 "queue ahead and the drain rate" (queue drain animation feeds p(τ)); 621.7 "age-out timers are not just random guesses. They are the literal crossing points of your fill probability curve ... against ... adverse selection, Delta" (two curves cross, timer drops at the intersection).

## Slide 6: Repricing without burning your queue position. 631.8 to 663.1, then again 751.6 to 787.8 (31.3 s + 36.2 s)

**Content**
- Title "H2 — Repricing without burning your queue position".
- Seesaw scale with dial readout "0.00": left heavy block "Queue Position Value" (down arrow), right raised block "Touch Drift / Price Improvement" (up arrow).
- "Queue Value: Queue position is an asset with measurable dollar value (Moallemi & Yuan, 2016). Every reprice is a trade: sell current queue position, buy back-of-queue."
- "Reprice Hysteresis: Reprice only when touch drifts more than band b ticks from resting price. Marginal reprice EV-neutral target: V_new − V_cur = c_msg. Pegging every tick consumes message budgets."
- "Asymmetric Chase: Repricing toward the market (aggressive/escalation): resets queue at a worse price. Repricing away (the market came to you): a gift. Use passive band, as current level is about to fill."

Article check: matches. Band b is 1 to 3 ticks, scaled by short-horizon vol; c_msg is the shadow price of the rate limit; amend quantity down, never cancel-repost down.

**Host error (flag):** 783.3 "Amending down is one thing, but chasing the market away is incredibly expensive." Garbled. Article: repricing **toward** the market (chasing) is the expensive move, it resets the queue at a worse price and should fire only from the escalation timer; repricing **away** (the market came to you) is a gift. Show the slide's asymmetric-chase wording.

**Beats, first visit (631.8 to 663.1)**
- 631.8 "the whole concept of queue position"; 635.0 "repricing without burning your queue position"
- 640.1 grocery-store line: 643.7 "You're in a slow lane ... jump out of your lane to switch"; 648.2 "you don't slide into the middle of the new line. You go straight to the very back" (shopper animation)
- 655.9 "every reprice sells your current queue position and buys one at the back of a new level" (Queue Value box; seesaw tips)

**Beats, second visit (751.6 to 787.8)**
- 751.6 "With all this API chaos, how do you manage repricing?"; 754.7 "reprice hysteresis"; 756.8 "You don't try to peg every single tick"; 759.3 "a band of b ticks before repricing" (dead band around the resting price; touch wiggles inside without reprice); 762.6 "tick and message budgets"
- 766.9 "the Moallemi-Yuan queue value trade-off. V_new minus V_cur equals c_msg" (formula); 774.4 "must equal or exceed the cost of the message"
- 780.1 "your chase should be asymmetric" (Asymmetric Chase box: toward = red, away = green)

## Slide 7: Venue amend semantics. 663.1 to 751.6 (88.5 s)

**Content**
- Same title as slide 6. Table Venue | API Semantics:
  - CME Globex (green row): Quantity-down priority kept. (The reference model.)
  - Binance Spot: cancelReplace: STOP_ON_FAILURE or ALLOW_FAILURE (accidental double exposure). Always starts a fresh queue. 2025 amend/keepPriority: reduces quantity in place, keeps time priority.
  - Binance USDT-M Futures: modify = queue reset. GTX crossing cancellation: modifying a GTX post-only order to a crossing price results in cancellation, not a rejected amend.
  - OKX: amendResult confirms asynchronously. Undocumented queue priority (assume worst case: requeue everywhere).
- Amber footer (boilerplate, drop).

Article check: matches. Details for captions: CME, increasing quantity or changing price sends the order to the back of the queue. Binance spot `POST /api/v3/order/cancelReplace`, STOP_ON_FAILURE is the default, partial success returns HTTP 409; `PUT /api/v3/order/amend/keepPriority` (2025, quantity-down only, no unfilled-order-count cost). Binance futures `PUT /fapi/v1/order`, LIMIT only, price and quantity both required, "modified orders will be reordered in the match queue". OKX `POST /api/v5/trade/amend-order` with newPx/newSz/cxlOnFail, sCode = 0 means accepted, outcome via amendResult on the orders channel; measure OKX priority with marker orders over a few hundred trials.

**Beats**
- 663.1 "the rules for changing lines depend entirely on which exchange you're trading on"; 674.6 to 682.6 boilerplate ("dated article claims", tiny tag)
- 686.6 "CME Globex ... quantity down priority is preserved. It's a clean rule" (green row)
- 694.4 "Binance Spot ... much messier"; 698.7 "only had cancel replace ... stop on failure and allow failure"; 705.1 "a 409 partial success error" / 708.0 "reconcile disconnected legs" (two legs split); 711.2 "it always reset your queue position"; 714.1 "until 2025 ... amend keepPriority for quantity reductions"
- 718.9 "Binance USDT-M futures"; 723.2 "modify endpoint forces a queue reset"; 725.7 "modifying a GTX, a post-only order that accidentally crosses the spread, results in an outright cancellation" / 733.2 "you completely lose the order" (order card vanishes)
- 735.1 "OKX"; 737.2 "an asynchronous amend order endpoint with a cxlOnFail parameter"; 743.0 "sCode equals zero, meaning accepted, and an eventual amendResult" (two-step ack); 748.5 "queue priority there is strictly undocumented" (question mark on the queue)

## Slide 8: Icebergs, display size, and what leaks your intent. 787.8 to 854.9 (67.1 s)

**Content**
- Title "H2 — Icebergs, display size, and what leaks your intent".
- Left "Latent Liquidity Search": isometric long queue (Front of Queue ... Back of Queue); small "peak refill" cubes loop from the front round to the back; magnifier on the back.
- "The Mechanism: Native icebergs (Binance `icebergQty`, OKX `iceberg algos`) are a sequence of small orders. Each visible `peak refill` enters the back of the queue. Deep queues punish small peaks twice (slower fills, adverse selection)."
- "The Tradeoff: Exposure buys fills but pays in impact (Bessembinder et al.)."
- Hatched "The 4 Leak Vectors (Adversarial Detection Engine inputs): 1. Constant or round display sizes. 2. Identical refill timestamps (instant, deterministic after full-peak execution). 3. Deterministic escalation timers (the `metronome` cross). 4. Fixed reprice latency and bands (`digital fingerprint`)."

Article check: matches. Frey and Sandås (Xetra): icebergs 9.3% of submitted and 15.9% of executed volume, 12 to 20x the size of ordinary limit orders; detected icebergs attract matching market orders. Bessembinder, Panayides, Venkataraman (2009, *JFE* 94(3), Euronext Paris): 44% of volume hidden; hiding lowers implementation shortfall but lowers full-execution probability and lengthens time to completion. Esser and Mönch (2007): optimal peak size is interior. Article leak examples: "0.5 BTC, every time"; "cross exactly 30 s into every slice".

**Beats**
- 787.8 "if sitting in the visible queue is this dangerous, why show our size at all?"; 793.1 "icebergs, display size, and what leaks your intent" (iceberg: small tip, big hidden body)
- 798.5 "the classic two-sided trade-off ... Exposing size buys you fills, but it attracts aggressive counterparties" (Tradeoff line)
- 807.3 empirical numbers: 812.5 "Frey and Sandås ... Xetra ... 9.3% of submitted volume, but 15.9% of executed volume" (two bars); 821.6 "Bessembinder ... Euronext Paris ... 44% hidden volume" (big stat)
- 831.7 "each refill of a visible peak enters the back of the queue at that price"; 838.3 "a sequence of back-of-queue orders" (refill cubes loop to the back)
- 844.9 "they can leak your intent"; 847.2 "constant peak sizes and same-time stamp refills ... screaming your presence" (leak vectors 1 and 2 flash)

## Slide 9: The metronome vs the jitter. 854.9 to 889.1 (34.2 s)

**Content**
- Same title as slide 8. "The Metronome": bar chart of alternating equal short/tall bars; "Readable lazy tactics. Constant sizes and fixed timers allow adversaries to reconstruct hidden size in a handful of refills."
- "The Jitter": irregular bar widths/heights; "Randomize display size (e.g., uniform 30-70% of a vol-scaled base). Jitter timers by ±20-30%. Never share size, timer phase, or latency profile between child orders."
- "Empirical Reality: Frey/Sandås (Xetra): Hidden size attracts flow when detected. Van Kervel/Menkveld: HFTs initially lean against metaorders, then flip to back-running once persistence reveals information."
- Amber footer (boilerplate, drop).

Article check: matches, one nuance: the article says "never let two child orders share a size, a timer phase, **and** a latency profile" (all three together); the slide says none of the three may be shared. The article adds "occasionally let a refill wait" and claims "None of this costs measurable fill quality" (the host flags this as unverified at 873.0). Van Kervel and Menkveld (2019), *Journal of Finance* 74(3).

**Beats**
- 854.9 "how do you obfuscate that?"; 857.2 "randomize your sizes and randomize your timers" (metronome bars morph into jitter bars)
- 862.9 "does this actually guarantee stealth?"; 865.7 to 884.4 boilerplate on the iceberg claims (tiny tag); 884.4 "not promising stealth or execution savings here" (Empirical Reality box: HFTs lean against, then back-run)

## Slide 10: A minimal tactics engine: the state machine. 889.1 to 913.7 (24.6 s)

**Content**
- Title "H2 — A minimal tactics engine".
- State diagram: IDLE —[p_fill ≥ p*] post→ POSTED; POSTED self-loop [touch drift > reprice_band] cancel_replace; POSTED —[elapsed time ≥ escalate_frac] cross→ CROSSING —slice_done→ DONE; IDLE —[p_fill < p*]→ CROSSING (bottom path).
- "Engine Context: Side-effect-free, event-driven engine intended for a rung-4 queue-aware simulator processing on_tick, on_fill, on_budget_cut."

**NotebookLM errors (flag):** the diagram misses POSTED → DONE on a full passive fill (in the article `slice_done` comes from `on_fill` in any state). The escalation guard is `elapsed ≥ escalate_frac · window` (default 0.7), not elapsed ≥ escalate_frac. `on_budget_cut` is an event (amend down or cancel), not a state. Add the POSTED → DONE edge.

**Beats**
- 889.1 "a minimal tactics engine"; 894.2 "The article actually gives us some code"; 898.2 "an illustrative Python state machine for a slice"
- 902.7 "idle, posted, crossing, and done" (four states light up); 907.7 "on tick, on fill, and on budget cut" (event arrows animate)

## Slide 11: SliceTactic code and calibration cliffs. 913.7 to 973.3 (59.6 s)

**Content**
- Same title as slide 10. Code `class SliceTactic:` with `p_star` and `on_tick`:
  ```python
  def p_star(self, spread: float, tau: float) -> float:
      delta = self.cfg.adverse_frac * self.cfg.sigma_1s * math.sqrt(tau)
      prize = spread + self.fees.taker - self.fees.maker
      return delta / (prize + delta)
  ```
  plus a broken `on_tick` fragment (see errors).
- Right "Calibration Cliffs: p_fill is a placeholder ratio; adverse_frac requires bucketed vol-regime calibration. Plot slice shortfall against \η-implied cost to find two parameter cliffs: escalating too late vs repricing too eagerly." (raw "\η" → η)
- Hazard flag "Production-code review flag: The Python state machine is illustrative and unvalidated ... Not deployment-ready." (drop the stripe; one caption "illustrative" is enough).

**NotebookLM errors (flag):** the slide's `on_tick` code is broken: the `p_star` comparison is duplicated (`>= self.p_star(...) >= self.p_star(...)`), the brackets are unbalanced (`[(("post", ...`), and the `post` return sits under `else:`, which inverts the logic (posts when p_fill < p*). Use the article code:
```python
if self.state == State.IDLE:
    if self.p_fill(queue_ahead, drain, remain) >= self.p_star(ask - bid, remain):
        self.state, self.px = State.POSTED, touch
        return [("post", touch, left)]    # GTX / post-only
    self.state = State.CROSSING           # posting is -EV here
    return [("cross", left)]
```
Config defaults from the article: `adverse_frac` 0.6, `reprice_band` 2.0 ticks, `escalate_frac` 0.7; `p_fill = min(1, drain·tau / (queue_ahead + qty))`.

**Beats**
- 913.7 "a placeholder p_fill ratio and an adverse_frac calibration for the price drift" (code highlights `p_fill`, `adverse_frac`)
- 920.6 "the simulator sweeps for two parameter cliffs, escalating too late versus repricing too eagerly" (shortfall vs parameter plot with two cliffs)
- 927.5 "anyone coding for a living is probably seeing red flags"; 934.8 "an illustrative, unvalidated Python state machine"
- 941.2 missing pieces list (checklist of red crosses): "Crossing and cancellation acknowledgments, outstanding order reconciliation, repeated cross emission, in-flight cancellation, double exposure"; 950.5 "budget gets cut below what's already filled ... negative residual handling"; 959.9 "venue adapters and message budget constraints"
- 963.4 "not deployment ready"; 971.6 "Consider yourselves warned"

## Slide 12: What to take away. 973.3 to 1023.8 (50.5 s)

**Content**
- Title "H2 — What to take away". Six icon cards:
  1. Layers icon: "Two layers, one contract. Budget, window, urgency down; fills and shortfall up. Attribute shortfall to tune."
  2. Formula icon `f δ/(Π+δ)`: "Post/cross is arithmetic. Post iff p > δ/(Π + δ). Fee tier sets tactics; retune after re-tier."
  3. Crossing-curves icon: "Age-out timers are curve intersections. Saturating fill probability vs. √τ-growing adverse selection."
  4. Queue icon: "Queue position is an asset. Know API semantics: CME (qty-down keeps priority), Binance (cancelReplace requeues), OKX (undocumented)."
  5. Iceberg icon: "Icebergs are back-of-queue sequences. Lazy ones are readable. Randomize sizes/timers or get back-run."
  6. Terminal icon: "Ship into the simulator first. The tactics layer diverges hardest between backtest and production."

Article check: matches (card 4 omits Binance futures "every modify re-queues" and the spot amend keepPriority; acceptable).

**Host error (flag):** 988.8 "You post only when P plus delta" is garbled; the rule is post iff p > δ/(Π + δ). Show the card formula.

**Beats**
- 973.3 "What to take away"; 977.9 "six core conclusions"
- 980.6 card 1 "the interface ... is narrow ... Budget window urgency down, fills fees remainder and shortfall up"
- 988.8 card 2 "the post versus cross gate is purely arithmetic ... highly dependent on fee tiers"
- 997.8 card 3 "age out timers are literal crossing points of curves"
- 1004.2 card 4 "queue position is an asset dependent on exact venue amend semantics"
- 1009.6 card 5 "icebergs are sequences of back of queue orders that can be detected if you don't randomize"
- 1016.1 card 6 "shipped into the fill simulator first to avoid production divergence"

## Slide 13: Useful links. 1023.8 to 1053.4 (29.6 s)

**Content**
- Title "H2 — Useful links": 1 Harris, L. (1998); 2 Cont, R., Kukanov, A. (2017); 3 Frey, S., Sandås, P. (2009); 4 Bessembinder, H. et al. (2009); 5 van Kervel, V., Menkveld, A. (2019); 6 Moallemi, C., Yuan, K. (2016); 7 Lehalle, C.-A. (2011); 8 Binance Spot API — Order Amend Keep Priority; 9 Binance Spot API — Trading endpoints (cancelReplace); 10 Binance USDT-M Futures API — Modify Order; 11 OKX API v5 — Amend order; 12 CME Group — Order Functionalities.

Article check: matches.

**Beats**
- 1023.8 "the useful links section"; 1029.0 "Harris, Cont and Kukanov" (1-2 tick); 1032.1 "Frey and Sandås and Bessembinder et al." (3-4); 1035.9 "van Kervel and Menkveld, the queue value formulas of Moallemi and Yuan, and Lehalle's work" (5-7); 1043.1 "API documentation pages from Binance Spot, Binance USDT-M Futures, OKX and CME Group" (8-12)

## Slide 14: Citation and outro. 1053.4 to 1097.1 (43.7 s)

**Content**
- Title "H2 — Citation". BibTeX: `@article{soloviov2026childordertactics, author = {Soloviov, Eugen}, title = {Inside the slice: child-order tactics between your scheduler and the exchange}, year = {2026}, url = {https://marketmaker.cc/blog/child-order-execution-tactics}, description = {...}}`.
- Hazard boilerplate box (mentions Chinese terminology, irrelevant for EN): drop.

**Beats**
- 1053.4 "our citation section"; 1058.5 "Eugen Soloviov, Inside the Slice ... published in 2026" (BibTeX card)
- 1069.3 "Thank you for joining us on this deep dive"; 1071.7 "a provocative thought"; 1075.5 "fighting for your place in the line completely dominates the outcome"; 1080.8 "does the price of an asset even exist independently of the millisecond by millisecond battle to stand at the front of the line?" (queue front glows); 1092.9 "Keep questioning the hidden mechanics" (end card)

---

## Timing notes

`sync_slides.py` (default params) degenerated ("showed 8/14 slides, longest held 81%") and fell back to an even 78.4 s split (saved as `timeline_auto_evensplit.json`).

`slide_starts.json` / `timeline.json` are set by hand from transcript cues. Segment order in `timeline.json` (0-based slide index): `[0, 1, 2, 3, 4, 5, 6, 5, 7, 8, 9, 10, 11, 12, 13]`, i.e. slides 1 to 7 in order, back to slide 6 for reprice hysteresis, then slides 8 to 14.

| Seg | Slide | Start | Cue | Confidence |
|---|---|---|---|---|
| 0 | 1 Title | 0.0 | cold open; title read at 55.0 | high |
| 1 | 2 Two layers | 108.1 | "this brings us to our first main topic. Two layers, one narrow interface" | high |
| 2 | 3 Escalation ladder | 320.4 | "we move to the next section, the escalation ladder" | high |
| 3 | 4 Break-even | 407.7 | "that takes us to the math, the break-even for crossing" | high |
| 4 | 5 Numbers / age-out | 525.4 | "let's put some real numbers to this" | high |
| 5 | 6 Repricing / queue value | 631.8 | "Which brings up the whole concept of queue position" | high |
| 6 | 7 Venue table | 663.1 | "the rules for changing lines depend entirely on which exchange" | high |
| 7 | 6 Repricing (return) | 751.6 | "With all this API chaos, how do you manage repricing? ... reprice hysteresis" | high |
| 8 | 8 Icebergs | 787.8 | "why show our size at all? Which brings us to icebergs" | high |
| 9 | 9 Metronome vs jitter | 854.9 | "So how do you obfuscate that? ... randomize your sizes" | medium-high (leak talk 844.9 to 854.9 could stay on slide 8's leak list or move here) |
| 10 | 10 State machine | 889.1 | "moving on to our next section, a minimal tactics engine" | high |
| 11 | 11 Code / cliffs | 913.7 | "it uses a placeholder p_fill ratio and an adverse_frac calibration" | medium-high (slide 10 is short; 913.7 could move to 907.7) |
| 12 | 12 Takeaways | 973.3 | "let's hit our next section. What to take away" | high |
| 13 | 13 Useful links | 1023.8 | "Which brings us to the useful links section" | high |
| 14 | 14 Citation / outro | 1053.4 | "And finally, our citation section" | high |

Slides longer than ~90 s are split into sub-scenes above: 1 (beats only, 108 s), 2 (3), 4 (2), 5 (2). Slide 7 (89 s) runs as one scene with dense beats.
