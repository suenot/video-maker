# ai-hedge-fund-review (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
14-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/ai-hedge-fund-review.en.md` (2026-04-19, review of github.com/virattt/ai-hedge-fund).

- Audio: `input/notebooklm-sources/ai-hedge-fund-review/en/audio.m4a`, 1397.89 s (23:17.9), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has `words[]` with per-word start/end; use it for frame-exact beats). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_014.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: two looks. Slides 1 and 12 are light (pale grey-blue paper, navy text, mustard-bordered cream callout). Slides 2 to 11, 13, 14 are a dark "sci-fi control room": deep navy background (#0E1A2E) with faint circuit traces, gunmetal riveted frames with chamfered corners, cool electric blue/indigo glow (#5B8CFF, #7C83E8) for normal components, hot amber/orange glow (#F2A33A) for risk, warnings and constraints. Condensed grotesk titles, monospace for agent cards and specs. The recurring semantic: **blue = ideas/analysts, amber = risk/constraint**. Keep that mapping in the redraw. "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "verat.ttt" (28.1) and "VIT AI-Hedge Fund" (1270.8) = virattt/ai-hedge-fund, "by order" (134.9) = buy order, "takes your portfolio" (134.9) = tanks your portfolio, "evaluation metrics" (192.8) = valuation metrics, "portfolio SKUs" (677.8) = portfolio skews, "dress tests" (872.3) = stress tests, "a rage in bull market" (857.5) = a raging bull market, "once they sell 5%" (596.1) = one says sell 5%.

---

## Slide 1: AI Hedge Fund: Hype vs. Architectural Reality. 0.0 to 109.6 (109.6 s)

**Content**
- Title (bold dark): "AI Hedge Fund: Hype vs. Architectural Reality".
- Left panel (lavender-grey, faint rising chart lines and candles in the background): header "The Hype (As Cited)", three stat rows with icons: star icon "**12,000+** GitHub Stars"; fork icon "**Hundreds** of Forks"; bird icon "**Viral** Twitter Momentum".
- Right panel (cream, mustard border), large bold text: "Disclaimer from the project author: This is not a system for real money — it's a sandbox for experiments." (the deck duplicates "This is / This is not a system / system"; render it once, cleanly).
- Bottom slate banner (white text): "The true value is an architectural pattern, not a neural network that makes money."

Article check: matches (article: "12,000+ GitHub stars, hundreds of forks, enthusiastic Twitter posts"). The 12,000+ figure is the article's snapshot and is dated; keep "(as cited)".

**Beats**
- 0.0 "Welcome to the deep dive" / 2.1 "this GitHub repository that just completely blew up like over 12,000 stars" (star counter spins up to 12,000+)
- 14.6 "promising something that ... sounds almost like science fiction" / 18.5 "an open source AI hedge fund"
- 23.5 "this article reviewing the project, which was originally created by a user named virattt" (see error 1 on the date the hosts give)
- 32.4 "the code notes, the operational claims, and the author's own warnings"
- 41.4 "look past that whole get rich quick artificial intelligence hype" / 47.6 "force AIs to actually think critically by making them argue with each other"
- 64.8 "The project's creator explicitly states this is not a system for real money" / 70.7 "It is purely an experimental sandbox" (disclaimer panel slams in)
- 78.6 "it's not some magical neural network that you can just plug into your brokerage account and print money" / 89.2 "It's a blueprint" (bottom banner)
- 99.9 "move away from asking a single AI oracle for answers" / 105.6 "a resilient system of checks and balances"

## Slide 2: The Paradigm Shift: From Single Guru to Committee. 109.6 to 174.9 (65.3 s)

**Content**
- Dark slide, two halves split by a thin vertical line.
- Left, amber header "THE FLAWED SINGLE GURU": vertical flow of three cracked gunmetal boxes "DATA INPUT" -> "SINGLE LLM (UNCONSTRAINED)" (amber glow) -> "TRADE EXECUTION". An amber warning callout points at the LLM box: warning triangle, "**Vulnerability:** Complete freedom to blow up the portfolio."
- Right, indigo header "THE MULTI-AGENT COMMITTEE": "DATA STREAMS" box at top; thick indigo arrows branch down into a frame "SPECIALIZED AGENTS" holding three cards: brain icon "Agent 1: Trend Analysis", gear icon "Agent 2: Volatility Assessment", magnifier icon "Agent 3: Correlation Check"; side callout "Each agent contributes specialized expertise sequentially." Arrows converge into a glowing "STRICT RISK FILTER" bar (shield-check icon), then down to "TRADE EXECUTION".

Article check: the single-guru vs committee contrast matches ("one LLM gets data, produces a signal, trade" vs "a team of agents with different thinking styles"). **The three agent names (Trend Analysis, Volatility Assessment, Correlation Check) are NotebookLM inventions**; the article's analysts are Value, Technical, Sentiment, Fundamentals (plus Risk Manager, Portfolio Manager). In the redraw use the article's analyst names (or generic "Analyst 1..4").

**Beats**
- 109.6 "the core idea of the article, which is not one guru, but a committee" (slide in, split screen)
- 117.2 "the classic flaw in most of these standard AI trading bots is just their fragile architecture" / 122.4 "you feed a single pipeline of data into one AI model" (left flow draws)
- 129.4 "maybe it hallucinates or it misinterprets a single news headline" / 134.9 "it issues this massive buy order that just completely tanks your portfolio" (single LLM box cracks, vulnerability callout)
- 139.9 "a massive single point of failure" / 142.6 "all your trust in one brain"
- 146.5 "the AI hedge fund architecture solves that by relying on a team of specialized agents" (right half lights)
- 153.0 "Instead of one massive prompt trying to do everything ... multiple distinct large language models" / 162.8 "its own specific prompt and ... its own specific data sources" (data streams branch to agent cards)
- 167.6 "mimicking the highly structured, departmentalized nature of a traditional financial firm"

## Slide 3: The 6-Node Decision Architecture. 174.9 to 453.6 (278.7 s)

**Content**
- Dark slide, 2x3 grid of glowing cards (mono text), connected by thin blue wiring that funnels toward the Portfolio Manager:
  - **Value Analyst**: "Focus: Valuation" / "Data Diet: P/E, P/B, DCF, margins"
  - **Technical Analyst**: "Focus: Technical analysis" / "Data Diet: RSI, MACD, moving averages, levels"
  - **Sentiment Analyst**: "Focus: Market sentiment" / "Data Diet: News, social media, tone"
  - **Fundamentals Analyst**: "Focus: Fundamental analysis" / "Data Diet: Revenue, profit, debt, growth"
  - **Risk Manager** (amber card with a warning-triangle tab): "Focus: Risk control" / "Data Diet: Volatility, correlations, limits"
  - **Portfolio Manager**: "Focus: Final decision" / "Action: Aggregates opinions, creates orders"
- Wiring: the four analyst cards join a horizontal bus; arrows lead right into Sentiment's row and from the Risk Manager into the Portfolio Manager.

Article check: matches the article's agent table exactly.

Sub-scenes (279 s, the longest slide):
- **3a The six roles intro + Value Analyst (174.9 to 210.6)**
- **3b Technical Analyst and "how does an LLM read a chart?" (210.6 to 299.2)**: show indicators computed in code, serialized to JSON, fed as text to the LLM.
- **3c Sentiment + Fundamentals vs Value (299.2 to 373.4)**
- **3d Risk Manager + Portfolio Manager (373.4 to 408.9)**
- **3e Courtroom analogy (408.9 to 453.6)**: analysts = lawyers, Portfolio Manager = judge, Risk Manager = bailiff.

**Beats**
- 174.9 "six distinct roles in this AI committee" (six empty cards)
- 186.2 "first you have the value analyst" / 189.4 "your traditional numbers cruncher" / 198.2 "price to earnings ratios, price to book" / 201.5 "Discounted cash flows, profit margins" / 207.0 "Is this asset fundamentally cheap or expensive?" (Value card fills: P/E, P/B, DCF, margins)
- 210.6 "the technical analyst, which ignores the fundamentals completely" / 218.1 "the relative strength index, the RSI, the MACD, moving averages ... support and resistance levels" (Technical card)
- 230.2 "something about that doesn't really make sense" / 242.6 "how is an AI ... staring at a stock chart" / 248.5 "it doesn't have eyeballs"
- 254.6 "The LLM is not looking at a JPEG of a stock chart" (crossed-out chart image)
- 259.0 "the system's underlying code actually calculates those technical indicators ... and translates them into structured text data" / 268.8 "like JSON" (chart -> numbers -> `{"rsi": 71.2, "macd": ...}` text block -> LLM)
- 278.1 "the AI is reading a highly organized text summary of the mathematical momentum" / 295.7 "It's reading the math as a language"
- 299.2 "the sentiment analyst" / 303.3 "scanning news headlines, social media chatter ... the general tone" / 312.0 "if fear or greed is driving the current narrative" (Sentiment card)
- 318.0 "the fundamentals analyst" / 322.1 "How does the fundamentals analyst differ from the value analyst?"
- 332.0 "The value analyst focuses on the price of the stock relative to its metrics" / 336.3 "is the stock a bargain at today's price tag?" (price tag)
- 339.5 "The fundamentals analyst ... evaluates the underlying business itself" / 347.1 "is the company's revenue actually growing? Are they turning a profit? How much debt" (Fundamentals card; factory building icon vs price tag)
- 366.0 "four distinct analysts ... value, technicals, sentiment, and business health"
- 373.4 "the fifth role changes the dynamic entirely ... the risk manager" (amber card glows) / 378.0 "isn't looking for things to buy ... how to protect the portfolio from ruin" / 384.6 "volatility ... how different assets correlate ... hard exposure limits"
- 392.3 "the portfolio manager, the boss" / 398.5 "doesn't generate initial ideas at all" / 401.9 "aggregates the opinions ... makes the final call on creating the actual orders"
- 408.9 "rather than ... a lone, impulsive gambler sitting at a casino table" / 413.7 "a lot more like a courtroom" (cards morph into courtroom seats)
- 421.9 "specialized lawyers, the analysts" / 428.1 "a judge, the portfolio manager" / 433.7 "the risk manager acting as the bailiff"
- 442.9 "structurally forbidden from stepping on each other's toes" / 446.4 "The charts lawyer only talks about charts. The news lawyer only talks about the news"

## Slide 4: Risk First, Action Second. 453.6 to 510.6 (57.0 s)

**Content**
- Dark blueprint slide; an illustrated steampunk machine: on the left a wide fan of blue light/data streams labelled "**100% Portfolio Allocation** (The Signal / Intelligence)" pours into a large bell-mouth intake; the machine body narrows to a glowing amber throat labelled "**5% Risk Limit** (The Constraint)"; a thin blue beam exits right. Gears, pressure gauges, steam puffs; label with arrow "Risk Budget Aperture" pointing at a gear; dimension line under the machine also labelled "Risk Budget Aperture".
- Text (upper right): "In investing, what matters isn't just the signal, but the right to **position size** (amber). The foundation-first approach dictates a solid constraint framework before intelligence."

Article check: matches the article's thesis ("what matters isn't just the signal, but the right to position size"; "foundation-first approach"; the 5% example). Redraw as a funnel/nozzle: 100% in, 5% out.

**Beats**
- 453.6 "if you have six different AI lawyers in a room, how do you prevent them from just talking over each other in an infinite loop?" / 462.0 "if I prompt ChatGPT to debate itself, it can spiral forever" (chat bubbles multiplying)
- 472.8 "the system prevents chaos by enforcing strict sequential decision making" / 477.2 "a hard-coded philosophy of risk first, action second" (title stamps in)
- 483.1 "it is not a free-for-all chat room"
- 485.1 "the analysts are prompted to issue their assessments ... not just ... a single word like buy or sell" / 493.2 "deep reasoned arguments"
- 498.1 "before the portfolio manager even looks at those arguments ... the risk manager steps in" / 505.1 "The analysts propose, but the risk manager disposes" (100% stream hits the 5% nozzle)

## Slide 5: The Decision-Making Sequence. 510.6 to 603.6 (93.0 s)

**Content**
- Dark slide, three stacked riveted metal bars joined by down-arrows (blue, amber center, blue):
  - "**Step 1: Risk Budget Assessment**" (blue): "Evaluates how much risk the portfolio can absorb prior to any trade proposal. System checks: volatility, current positions, and asset correlations."
  - "**Step 2: Size Filtering**" (amber, highlighted): "Hard constraints. An agent cannot fantasize a position size. If the limit allows only 5%, then only 5% is permitted, no matter how convincing the signal."
  - "**Step 3: Opinion Aggregation**" (blue): "The Portfolio Manager reviews detailed arguments from each analyst, not just binary outputs, forming the final order."

Article check: matches the article's three numbered steps.

**Beats**
- 510.6 "three pillars of constraint, starting with the risk budget assessment" (slide in, Step 1)
- 518.4 "before any agent's trade proposal is even entertained, the system evaluates how much risk the entire portfolio can handle"
- 528.3 "the current volatility of the broader market and the positions it already holds" / 533.2 "If the market is incredibly choppy or ... heavily exposed to, say, tech stocks, the overall risk budget shrinks automatically" (budget gauge shrinks)
- 542.8 "the second pillar, which is size filtering" (Step 2)
- 546.8 "the sentiment analyst is completely hyped about a stock because of a massive viral news event" / 554.3 "a brilliant, highly persuasive argument for ... allocating 50% of the portfolio" (agent waves a 50% sign)
- 562.6 "if the risk manager's limit says ... only handle a 5% allocation ... only gets 5% period" (50% bar clipped to 5%)
- 575.0 "It doesn't matter how convincing the signal is" / 580.1 "structurally prevents a single confident agent from overriding the safety parameters"
- 586.7 "The third pillar then is opinion aggregation" (Step 3) / 590.2 "I assume ... takes a mathematical average" / 596.1 "two AIs say buy 10%, one says sell 5%" / 602.4 "Not quite"

## Slide 6: Diverging Opinions as a Safety Feature. 603.6 to 670.2 (66.6 s)

**Content**
- Dark steampunk illustration: top-left blue panel "**Input A: Value Analyst** / Signal: Buy - Asset is Cheap"; top-right amber panel "**Input B: Technical Analyst** / Signal: Sell - Asset in Downtrend". Blue and amber pipes descend into a cluster of interlocking gears with a center plate "Position Size Reducer" ("Size Reducer" in amber); a single split blue/amber arrow drops into a bottom amber bar.
- Side labels (thin bracket lines): left "Fewer chances for impulsive portfolio skews."; right "Clear logic for why a trade size is what it is."
- Bottom bar: "Outcome: Instead of a system crash, detailed arguments are aggregated and position size mechanically decreases due to lack of consensus."

Article check: matches ("if the value analyst says 'cheap' but the technical analyst says 'downtrend', position size decreases"). The two side labels belong to the article's "What This Gives in Practice" list.

**Beats**
- 603.6 "this is actually where the LLM architecture really shines" / 609.1 "semantic reasoning engines" / 612.0 "They read the text" (slide in)
- 614.1 "The portfolio manager isn't just averaging numbers" / 616.9 "It is reading the underlying arguments"
- 619.2 "In most quantitative systems, conflicting data just causes errors" / 622.5 "here, differing opinions are a feature"
- 626.9 "the value AI argues this stock is incredibly cheap, we should buy" (Input A) / 631.5 "the technical AI argues the chart shows a massive downward trend. Do not buy" (Input B)
- 636.6 "uses that conflict to hedge its bets and reduce the proposed position size" (gears turn, size bar shrinks)
- 642.4 "It synthesizes the opposing text" / 644.9 "forcing the AI to read its own counter arguments"
- 650.3 the takeaway: 654.6 "what matters isn't generating a clever signal" / 658.6 "What matters is earning the right to a position size" (callback to slide 4's quote)
- 664.1 "First, you establish a solid framework of constraints. And only then do you apply the intelligence"

## Slide 7: The Practical Sandbox Advantage. 670.2 to 811.7 (141.5 s)

**Content**
- Dark slide, three tall riveted cards with green status bars on top, each with an illustration and caption:
  - **Iteration Safety** (isometric node network with a glowing purple core): "You can improve individual analysts without breaking the overarching risk framework."
  - **Explainability** (stack of floating translucent documents/logs): "The Portfolio Manager sees detailed arguments, providing clear logic for specific trade sizes."
  - **Adequate Backtesting** (line chart rising with a few dips, dots on points): "Provides more stable ground for backtesting experiments compared to unconstrained single-prompt models."

Article check: matches the article's "What This Gives in Practice" list (fewer impulsive skews, clear sizing logic, more adequate backtesting experiments, convenient ground for iterations). **NotebookLM-attributed claim (audio 761.4):** "The article addresses this by pointing out that this system is designed for strategic considered portfolio management, not millisecond scalping" is not in the article; it is the hosts' own (reasonable) inference. Do not caption it as an article claim.

Sub-scenes (141 s): **7a Fewer skews + explainability (670.2 to 731.3)**, **7b Speed objection (731.3 to 772.2)**, **7c Iteration safety / swappable analysts (772.2 to 811.7)**.

**Beats**
- 670.2 "several practical benefits that emerge when the system is actually running" (slide in)
- 677.8 "far fewer impulsive portfolio skews" / 684.1 "that risk manager gating every decision" / 687.4 "eliminate the risk of a rogue AI suddenly blowing up the entire account on a single misunderstood headline"
- 694.2 "crystal clear logic for why a trade size is what it is" / 701.5 "It forces explainability" (Explainability card)
- 705.9 "you don't just see a black box spinning out a number" / 710.4 "You can read the exact transcript of the debate" / 712.8 "which analyst argued for the trade, how the risk manager capped it ... the portfolio manager's written justification" (log scroll with three highlighted lines)
- 720.9 "more adequate backtesting environments" / 725.4 "trace the exact causality of your wins and losses" (Backtesting card)
- 731.3 "I do have to ask about speed though" / 733.4 "modern markets move in milliseconds" / 742.4 "this much bureaucracy ... doesn't that slow the AI down" (stopwatch vs committee)
- 754.7 "if the goal was high frequency arbitrage, yes, this would be entirely useless" / 761.4 "designed for strategic considered portfolio management, not millisecond scalping" / 769.7 "The friction is a deliberate safety feature"
- 772.2 "an incredibly convenient ground for iterations and upgrades" (Iteration Safety card) / 781.8 "like swapping out components in a custom PC"
- 785.2 "If a new ... language model comes out next year that is just vastly superior at reading social media sentiment" / 795.3 "You just swap out the sentiment analyst bot" (Sentiment card slides out, a new one slides in; risk core untouched)
- 798.9 "it won't break your underlying risk framework because the risk manager operates completely independently" / 806.8 "The structure protects the core while allowing the edges to evolve"

## Slide 8: Reading Results Without Self-Deception. 811.7 to 968.1 (156.4 s)

**Content**
- Steel-blue blueprint slide; background candlestick chart: a long sideways ranging section on the left, a steep rally, a sharp spike top, a vertical crash (amber highlighted gap down with a big arrow), then a choppy recovery and a decline in amber candles. Three riveted callout panels wired to parts of the chart:
  - top-left (check icon) "**Stability Across Markets**: Does it work in ranging markets as well as trending ones?" (wired to the ranging section)
  - center (amber, warning icon) "**Stress Tests**: What happens during panics, gaps, and sharp reversals?" (wired to the crash)
  - top-right (question icon) "**Overfitting**: Is the prompt logic suspiciously tuned to specific tickers and time periods?" (wired to the recovery section)

Article check: matches checklist items 1 to 3.

Sub-scenes (156 s): **8a Intro + stability (811.7 to 872.3)**, **8b Stress tests (872.3 to 895.2)**, **8c Overfitting via prompt tuning (895.2 to 968.1)**.

**Beats**
- 811.7 "run a pretty simulation, see a bunch of green numbers and trick yourself into thinking you built a flawless money printer" (slide in; green equity curve with a money-printer gag)
- 825.4 "self deception is the biggest danger in algorithmic trading" / 829.4 "easy to overhype an AI project if you only look at one successful run"
- 835.6 "this really honest evaluation checklist"
- 846.3 "the first check ... stability across market regimes" / 854.9 "Everyone's a genius in a bull market" / 857.5 "A system that only makes money in a raging bull market isn't a strategy. It is just leveraged optimism" (callout 1)
- 863.6 "ranging markets where prices are just chopping sideways for months ... if it bleeds capital through unnecessary trading" (ranging section highlights)
- 872.3 "The second check is stress tests" / 874.8 "How does this committee of AIs handle pure panic?" / 877.6 "Like a flash crash" (callout 2)
- 879.5 "a stock closes at $100 on Friday and opens at $50 on Monday" (gap animation $100 -> $50) / 888.6 "Do the analysts just freeze?" / 891.2 "Does the risk manager actually kick in fast enough"
- 895.2 "the massive issue of overfitting" (callout 3) / 907.6 "In a traditional math algorithm, overfitting means you tweak the formula so perfectly to match historical data"
- 920.3 "with an LLM, you are tweaking the prompts" / 923.1 "say you run a backtest on 2021 data. The AI loses money" / 927.3 "rewrite the prompt for the technical analyst to be slightly more aggressive on tech stocks" (prompt text edited, rerun, rerun)
- 936.2 "You keep iterating the text of the prompt until the simulation generates this massive, beautiful profit" / 942.1 "But the AI hasn't learned a universal market principle. It just learned 2021"
- 948.8 "tuned the prompt to memorize ... historical tickers during that specific time period" / 956.1 "given the AI the answer key to a historical test" / 960.2 "the live unpredictable market ... completely falls apart"

## Slide 9: Evaluating Data Integrity & Reproducibility. 968.1 to 1108.0 (139.9 s)

**Content**
- Dark slide, two halves:
  - Left: glowing spreadsheet window (columns of numbers and +, −, ×, $ symbols, an amber row line). Header "**Data Quality**", question "Are real-world frictions accounted for?", three checkbox pills: "Commissions", "Slippage", "Stock Splits".
  - Right: a single glowing node splitting into two branches (blue upper, amber lower) that each fan into ~8 terminal dots (diverging decision tree). Header "**Reproducibility**", question "Will the same prompts give the same result in a week?", amber warning panel: "LLMs are **non-deterministic**. Models with temperature > 0 inject randomness."

Article check: matches checklist items 4 and 5 ("commissions, slippage, and splits"; "LLMs are non-deterministic").

Sub-scenes (140 s): **9a Data quality / slippage (968.1 to 1004.7)**, **9b Reproducibility and temperature (1004.7 to 1108.0)**.

**Beats**
- 968.1 "the fourth check is data quality, specifically regarding real world frictions" (left half) / 972.2 "in a simulation, trading is free and instant"
- 976.6 "broker commissions" (pill 1) / 976.6 "slippage" (pill 2)
- 983.0 "the AI decides it wants to buy a stock at exactly $10" / 989.2 "by the time the order actually hits the exchange and fills, the price might have moved to 10.05" ($10.00 ticks to $10.05)
- 996.5 "If your historical data doesn't account for those fractional losses on every single trade, your simulated profits are completely meaningless"
- 1004.7 "the final point on the evaluation checklist" / 1015.7 "Reproducibility" (right half) / 1017.1 "LLMs are inherently non-deterministic"
- 1020.3 "a setting called temperature" / 1032.2 "controls how creative the model is" (temperature dial)
- 1038.4 "temperature to zero ... the single most mathematically likely next word every single time" / 1045.1 "highly robotic, repetitive and predictable" (dial at 0: one straight path)
- 1049.0 "turn the temperature up, the AI is allowed to pick less likely words" / 1053.7 "amazing for writing poetry" (dial up: tree branches)
- 1057.7 "asked ChatGPT the exact same complex question twice and gotten two totally different answers"
- 1068.9 "Now imagine your retirement account depends on that creativity" / 1079.7 "the exact same data on Tuesday ... the exact same data on Thursday" / 1089.6 "slightly different reasoning" / 1093.1 "a slightly different sizing decision" (Tuesday and Thursday branches end on different dots)
- 1098.2 "if you can't reproduce the decision making process reliably, can you actually trust the system in production?"

## Slide 10: Honest Assessment: What AI Hedge Fund Is Not. 1108.0 to 1142.6 (34.6 s)

**Content**
- Steel-blue slide, table with two column headers in riveted frames: "Sandbox Limit" (amber) | "Production Reality" (blue). Rows:
  - **Execution** | X "No real execution routing" | check "Live market connectivity"
  - **Liquidity** | X "No liquidity or depth modeling" | check "Volume and impact analysis"
  - **Backtesting** | X "No historical equity curve on 5 years of data" | check "Continuous historical validation"
- Bottom amber bar: "This is **strictly a prototyping environment**. You cannot run this on years of historical data to guarantee an equity curve."

Article check: the "Sandbox Limit" column matches the article ("No real execution, no liquidity modeling"; "You can't run the system on 5 years of data and get an equity curve"). The "Production Reality" column is NotebookLM's framing (fine). The Backtesting row is narrated later (1172.7 to 1232.4), inside slide 11's range; see sub-scene 11b.

**Beats**
- 1108.0 "when you hold this specific open source project up against that exact rigorous checklist, it hits a wall" (slide in)
- 1115.2 "a very honest assessment of the stark limitations of the repository as it existed back in April 2026"
- 1125.3 "simply not production ready" (bottom bar)
- 1130.7 "The code has no real execution engine built in" (row 1 X)
- 1134.0 "no liquidity modeling to tell you if there are even enough buyers and sellers in the market to fill the AI's orders" (row 2 X)
- 1140.4 "It is a theoretical framework"

## Slide 11: The LLM Dependency Risk. 1142.6 to 1260.6 (118.0 s)

**Content**
- Dark slide, a three-tier stepped pyramid of glowing frames (narrow top, wide base):
  - Top (amber, warning triangle with sparks): "**System Output**: Identical inputs will yield different answers over time. Strict determinism is impossible in this architecture."
  - Middle (blue): "**Temperature Controls**: LLMs with temperature > 0 inherently inject randomness into the evaluation pipeline."
  - Base (dark): "**Model Quality**: Decision quality is entirely determined by foundational model quality. GPT-4 and GPT-3.5 will give fundamentally different results."

Article check: matches the article's "LLM dependency" and "Determinism" limitations.

Sub-scenes (118 s):
- **11a Model dependency (1142.6 to 1172.7)**: pyramid base.
- **11b Backtesting cost, reprise of slide 10 row 3 (1172.7 to 1232.4)**: redraw the sequential prompt chain per historical day (value -> technical -> sentiment -> fundamentals -> risk -> PM) multiplied over thousands of days, API-call counter and dollar meter running; then the determinism callback (top tier).
- **11c Steering-wheel analogy (1232.4 to 1260.6)**

**Beats**
- 1142.6 "Another massive limitation is model dependency" (slide in, base tier)
- 1145.7 "the system's IQ is entirely tethered to the underlying LLM you choose to plug into it"
- 1154.2 "GPT-4 versus an older model like GPT-3.5 yields entirely different trading results" (swap a GPT-4 chip for GPT-3.5, output changes)
- 1164.2 "if the analyst role is being played by a weaker ... model, the resulting decisions will be weak"
- 1172.7 "the severe difficulty of historical backtesting" / 1177.1 "In traditional quantitative finance, you can run a strategy on five years of historical data in like a few minutes"
- 1183.5 "with this AI hedge fund, you cannot simply do that to get a clean equity curve" / 1188.4 "Is it just too much data for the AIs to read?"
- 1191.3 "the computational cost and the time required" / 1198.2 "For every single historical trading day, you have to prompt the value analyst, wait for the response, prompt the technical analyst ..." (sequential chain animates for one day, then a day counter speeds up)
- 1214.6 "for thousands of historical trading days requires a staggering amount of API calls, money and time" (API counter and cost meter)
- 1224.2 "that determinism issue ... your expensive backtest today might literally look different than your expensive backtest tomorrow" (top tier lights)
- 1233.2 analogy: "a brilliant state of the art race car steering wheel" / 1240.0 "It has all the buttons" / 1245.2 "But it isn't actually attached to a car, an engine or a physical track yet" (floating steering wheel, no car)
- 1252.7 "a beautiful interface waiting for the mechanics to build the rest of the vehicle" / 1256.6 "a control system, not the vehicle itself"

## Slide 12: System Repository Specs. 1260.6 to 1291.6 (31.0 s)

**Content**
- Light slide (pale blue paper with faint circuit lines), title "System Repository Specs", a rounded terminal-style panel (mono):
  - "> PROJECT_NAME: ai-hedge-fund"
  - "> REPOSITORY: virattt/ai-hedge-fund"
  - "> PLATFORM: GitHub"
  - "> LICENSE_TYPE: MIT"
  - "> STATUS: Open-Source Experimental"
- Footnote: "Note: Specs and metrics represent dated claims from the source article requiring primary-source review."

Article check: matches the Links section (GitHub virattt/ai-hedge-fund, MIT).

**Beats**
- 1260.6 "for those who love tinkering and want to see this code for themselves, the article does provide the breadcrumbs" (slide in, terminal types)
- 1266.3 "the repository was located on GitHub under virattt/ai-hedge-fund" (REPOSITORY line)
- 1274.6 "an open source MIT license, which is what allowed for all those forks" (LICENSE line; callback to the fork counter)
- 1282.0 "to reiterate the author's own disclaimer ... learning and prototyping, not for your life savings" (STATUS line)

## Slide 13: The Synthesis: A Thinking Framework, Not a Trading Bot. 1291.6 to 1314.2 (22.6 s)

**Content**
- Dark slide, two zones separated by a thick hatched black wall labelled vertically "Separation of Powers" (orange glow seeping through the cracks):
  - Left blue zone header "Idea Generation": 2x2 glowing cards "Value Analyst", "Technical Analyst", "Sentiment Analyst", "Fundamentals Analyst", wired together and into the wall.
  - Right amber zone header "Risk Control": "Risk Manager" (amber card) above "Portfolio Manager" (teal/amber card), wired from the wall.
- Bottom bar: "The true value of this architecture is how it makes decisions explainable. It forces consensus and physically separates idea generation from risk control."

Article check: matches the article's conclusion bullets ("Separate analyst roles. Separate idea generation from risk control. Make decisions explainable.").

**Beats**
- 1291.6 "Bringing it all together, the article succeeds in separating the hype from the utility" (slide in) / 1296.7 "What is the ultimate conclusion here?"
- 1299.7 "AI Hedge Fund is a highly effective thinking framework" (title)
- 1305.7 "It successfully separates idea generation from risk control" (wall drops between the zones) / 1310.5 "it forces a level of explainability that single prompt bots just do not have" (bottom bar)

## Slide 14: The Leap to Production. 1314.2 to 1397.64 (83.4 s)

**Content**
- Dark slide, a heavy riveted steel beam "PRODUCTION ENVIRONMENT" held up by four industrial pillars (three with blue light tubes, the rightmost with amber), each with a plate label and a caption:
  - **Realistic Execution**: "Moving beyond paper trading to actual live market routing."
  - **Data Validation**: "Ensuring real-time, tick-level data integrity and quality."
  - **Model Drift Control**: "Monitoring and mitigating LLM degradation and variance over time."
  - **Hard-Coded Risk** (amber): "Establishing a proper risk committee at the absolute rules/code level, not just via LLM prompts."
- Bottom indigo bar: "For learning and prototyping — solid work. For real money, prompts are not enough."

Article check: matches the article's final paragraph ("realistic execution, data validation, model drift control, and a proper risk committee at the rules level, not just prompts"). "Real-time, tick-level" in the Data Validation caption is NotebookLM's addition.

**Beats**
- 1314.2 "to actually take something like this into real world production, you need an entire next layer" / 1319.7 "The actual car" (callback: the steering wheel from 11c gets a car; slide in)
- 1321.4 "realistic execution engines" (pillar 1) / "stringent data validation" (pillar 2) / 1326.5 "systems to control model drift over time" (pillar 3) / "hard-coded risk committees at the absolute rules level" (pillar 4, amber)
- 1331.7 "You cannot just rely on polite prompt instructions asking the AI to manage risk" / 1336.6 "You have to build the walls so it structurally cannot break the rules" (bottom bar)
- 1341.3 closing thought: 1348.8 "If an artificial intelligence needs a highly structured committee of opposing viewpoints ... just to safely trade a mock portfolio" / 1360.5 "In what other high stakes areas of our lives ... are we currently relying on a single unchecked guru?" (callback to slide 2's single guru)
- 1369.9 "a single AI oracle, a single news source, or even just our own unchecked gut instinct" / 1374.8 "we probably need to be building our own multi-agent committees"
- 1381.2 "Maybe we never needed the lone genius" / 1385.5 "Maybe we just needed a better board of directors" (committee table)
- 1388.6 "Thank you for joining us" / 1396.6 "We will catch you next time" (end card)

---

## Timing notes

`sync_slides.py` (defaults) degenerated ("showed 9/14 slides, longest held 75%") and fell back to an even 99.8 s split (saved as `timeline_auto_evensplit.json`); wrong for most slides (slide 3 auto 199.7 s vs real 174.9 s but then slide 4 auto 299.5 s vs real 453.6 s).

`slide_starts.json` is set by hand from the transcript; the deck follows the article order. Two deliberate overlaps: slide 6's closing "right to a position size" quote calls back to slide 4, and slide 10's Backtesting row is narrated inside slide 11's range (sub-scene 11b). Confidence: high = topic sentence names the slide; medium = transition without a named heading.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Hype vs reality | 0.0 | intro | high |
| 2 Single guru vs committee | 109.6 | "the core idea of the article, which is not one guru, but a committee" | high |
| 3 6-node architecture | 174.9 | "six distinct roles in this AI committee" | high (146.5 to 174.9 could already show slide 3) |
| 4 Risk first, action second | 453.6 | "how do you prevent them from just talking over each other" (named 477.2) | medium (could be 472.8) |
| 5 Decision sequence | 510.6 | "three pillars of constraint, starting with the risk budget assessment" | high |
| 6 Diverging opinions | 603.6 | "this is actually where the LLM architecture really shines" (after "Not quite") | medium (586.7 to 603.6 is Step 3 on slide 5) |
| 7 Sandbox advantages | 670.2 | "several practical benefits that emerge" | high |
| 8 Self-deception checklist | 811.7 | "run a pretty simulation ... trick yourself" | high |
| 9 Data quality + reproducibility | 968.1 | "the fourth check is data quality" | high |
| 10 What it is not | 1108.0 | "hold this specific open source project up against that exact rigorous checklist, it hits a wall" | high |
| 11 LLM dependency | 1142.6 | "Another massive limitation is model dependency" | high (1172.7 to 1232.4 is slide 10's backtesting row) |
| 12 Repo specs | 1260.6 | "for those who love tinkering and want to see this code" | high |
| 13 Synthesis | 1291.6 | "Bringing it all together" | high |
| 14 Leap to production | 1314.2 | "to actually take something like this into real world production" | high |

## NotebookLM / source errors summary

1. **Audio 23.5 to 28.1:** "originally created by a user named virattt back in April 2026" is wrong. April 2026 (2026-04-19) is the date of the **review article**; the repository is older: GitHub API `created_at` = 2024-11-29. Do not caption "created April 2026"; if a date is shown, use "created Nov 2024, reviewed April 2026".
2. **Slide 2:** agent names "Trend Analysis / Volatility Assessment / Correlation Check" are invented; the article's analysts are Value, Technical, Sentiment, Fundamentals.
3. **Audio 761.4:** "the article addresses this by pointing out that this system is designed for strategic ... portfolio management, not millisecond scalping" attributes a claim the article does not make (the hosts' inference). Same for 1191.3 (computational cost as the reason backtesting is hard): the article only states there is no historical backtest.
4. **Slide 1 / audio 2.1:** 12,000+ stars is the article's dated snapshot; the GitHub API showed 63,942 stars on 2026-10-12 (MIT license confirmed). Keep "(as cited)" or update the number.
5. **Slide 1:** duplicated words in the disclaimer ("This is / This is not a system / system for real money"); render cleanly.
6. Slide 10's "Production Reality" column and slide 14's "real-time, tick-level" are NotebookLM framing, consistent with the article's spirit.
