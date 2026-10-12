# algo-investor-skills (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts: H1 = curious/skeptical host, H2 = explainer host), 15-slide NotebookLM deck.
Article: `marketmaker-cc-landing/src/content/blog/algo-investor-skills.en.md` (2026-06-24, repo github.com/suenot/algo-investor-skills).

- Audio: `input/notebooklm-sources/algo-investor-skills/en/audio.m4a`, 1499.64 s (24:59.6), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has `words[]`). Timestamps below are segment starts, accurate to ~0.5 s.
- Timing: `slide_starts.json` (index = slide number - 1) and `timeline.json` (ordered by time). See "Timing notes".
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed; regenerate with `pdf_to_images.py --dpi 200`).

**Order quirk:** the hosts open with the paste-test hook (slide 2 content) BEFORE introducing the project (slide 1 title). The timeline therefore plays slide 2 at 0.0 and slide 1 at 81.7; everything after is in deck order.

Deck visual language: cool light-grey "blueprint" paper (#EEF0F2-ish) with faint grid and crop/registration marks, charcoal (#2A2F36) rounded terminal panels with white monospace text, grotesk sans titles in near-black. Accents: green (#4E9A5B) = verified / safe / rewards, amber (#E2B246) = assumptions / caution, brick red (#C0392B) = TODO / fail / risk. Many slides use translucent glass-tube / glass-box 3D props (redraw as flat outlined shapes). "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (Whisper mis-hearings, fix in captions): "Sunat" (89.9) and "Solonado-investor-skills" (1410.9) = suenot / suenot/algo-investor-skills; "cloud code" (232.9) = Claude Code; ".clod skills" (236.1) = `.claude/skills`; "nodemodels.mjs" (258.0) = `node .claude/skills/algo-financial-models/models.mjs`; "LLM-PACE test" (58.9) / "LLM-paced test" (1286.8) = LLM paste-test; "sharp ratio" = Sharpe ratio; "ALGO financial models" = algo-financial-models; "agente AI" (1307.9) = agentic AI; "single maintain of the" (1345.5) = single-maintainer; "set back" (1271.2) = sit back; "hyper-sceptical" fine.

---

## Scene A (slide 2): The modern due diligence wall / The LLM Paste-Test. 0.0 to 81.7 (81.7 s), cold open

**Content (slide 2)**
- Title (2 lines, bold sans): "The modern due diligence wall: / The LLM Paste-Test"
- Left column header "The Flawed Approach": a blurry curled paper document titled "Marketing-heavy Pitch Deck" (bar chart with 5 rising bars, a line chart with an up arrow, lorem ipsum text) being sucked/funneled into a tall dark terminal card with prompt `>_` and 4 grey text lines. Corner brackets around the terminal.
- A hatched vertical divider bar in the center.
- Right column header "The Rigorous System Test": a wide dark terminal window (3 dots top-left, grid lines) with large mono text: `is this real, or` / `is this a fraud?` followed by a block cursor.
- Bottom full-width framed mono callout (chamfered "HUD" frame): "Having a clean equity curve is not enough. Skeptical allocators will drop your proposal into an AI with zero context. If your document relies on marketing adjectives instead of verifiable mechanics, it fails the test."

Article check: matches the article intro ("paste your commercial offer into an LLM with no other context and ask: is this real, or is this a fraud?").

**Beats**
- 0.0 "imagine you've built like this incredible money making machine"; 4.4 "profits are just sitting right there on your screen" (draw clean rising equity curve)
- 12.5 "you ask someone to actually invest ... they don't look at your returns at all"; 19.0 "don't even care about your charts"
- 22.5 "copy and paste your entire pitch into an AI and ask it one brutal question" (pitch deck gets sucked into terminal)
- 30.1 "is this person trying to scam me?" (type `is this real, or is this a fraud?` in right terminal)
- 36.7 "the art of the traditional pitch is just dead"; 39.8 "Allocators have been burned way too many times"
- 45.8 "automated binary verification of trust"
- 54.4 "how an honest trader actually survives ... the hostile LLM paste test"
- 65.2 "craziest part ... isn't even building a profitable strategy anymore"
- 75.7 "a good-looking chart is just incredibly easy to fake"; 79.4 "Anyone can make a line go up in Photoshop" (bottom callout lands)

## Scene B (slide 1): Title. 81.7 to 164.0 (82.3 s)

**Content**
- Title (2 lines, large dark sans, centered): "Claude Code Skills That Build a / Scam-Proof Investor Proposal"
- Subtitle: "Bridging the trust gap between algotrading strategies and institutional capital through mathematical rigor, verifiable pipelines, and architectural honesty."
- Background: wireframe line drawing of a hexagonal glass vault room with a round vault door (wheel handle) on the right; crosshair registration marks left and right; thin vertical guide lines.
- Dark terminal bar: `> load .claude/skills/algo-investor-skills`
- Footer (small): "All methodologies, capabilities, and anonymized examples detailed herein are unverified claims attributed to the source article 'MM article algo-investor-skills EN c5f7b84a0090'." (internal source id: do NOT redraw the id.)

Fixes: the `> load ...` command is a NotebookLM invention; the skills auto-load when the repo is opened in Claude Code. Redraw the terminal as `$ claude   # open repo, skills auto-load from .claude/skills/` or simply `github.com/suenot/algo-investor-skills`.

**Beats**
- 81.7 "Which brings us to the tool designed to solve this"
- 85.3 "an article and an open source GitHub repository by a developer named suenot"
- 91.3 "the project is called Algo Investor Skills" (title reveal); 94.7 "a toolkit of Claude Code skills"
- 97.5 "from just raw facts to a fully audited transparency first proposal"
- 107.3 "one non-negotiable rule"; 112.2 "The fabrication rule"; 115.1 "This toolkit never, ever fabricates a single number" (stamp "NEVER FABRICATE")
- 130.5 disclaimer: "all the financial metrics, numerical examples ... are unverified claims originating straight from this specific source article" (footer note fades in)
- 143.2 "scam proof ... is entirely their framing"; 150.7 "never a promise of legal protection"; 156.0 "not an assurance of future returns"; 159.0 "nothing in our discussion constitutes investment advice"

## Slide 3: Why an AI skill set survives where static templates fail. 164.0 to 267.8 (103.8 s)

**Content**
- Title: "Why an AI skill set survives where static templates fail"
- Two-column table split by a vertical arrow axis and a horizontal double-arrow under the headers.
  - Left header box (pale red, red corner flags, faint technical drawing behind): "Static Word Template". Three rows with small chevron icons:
    1. "Cannot recompute Sharpe when 40 trades are added."
    2. "Cannot stress-test edges with top winners removed."
    3. "Cannot impersonate a hostile allocator to probe for weaknesses."
  - Right header box (pale green, green corner flags): "Dynamic Claude Code Skills". Glowing green frame containing:
    1. Plain text "Recomputes and stress-tests dynamically."
    2. Dark mono panel: "Embedded directly in the local .claude/skills/ or user-global ~/.claude/skills/ environment."
    3. Dark mono panel: "Runs a standalone financial-models engine (models.mjs) as an objective sanity check."

Article check: matches. Optional code to show (from article): `cp -r .claude/skills/* ~/.claude/skills/` and `node .claude/skills/algo-financial-models/models.mjs   # prints a worked demo`.

**Beats**
- 164.0 "what was your initial reaction"; 172.2 "why do we need an active AI skillset for investor relations?"
- 177.0 "download a standard Word document template, fill in the blanks, and just email it out as a PDF" (left header)
- 189.6 "A template is completely inert. It can't defend itself"
- 195.0 "add, say, 40 new trades ... cannot recalculate your Sharpe ratio" (row 1)
- 201.9 "stress test your edge if you remove your three biggest winning trades" (row 2; article says "top winners", no count)
- 207.1 "cannot actively impersonate a highly skeptical allocator" (row 3)
- 216.8 "a static template is basically like a mannequin ... seams are going to rip" (gag: mannequin vs tailor)
- 226.2 "these skills act like a master tailor" (right column lights up)
- 232.9 "plain Claude Code skills"; 236.1 "live locally inside a .claude/skills directory" (panel 2)
- 241.9 "auto-load them for a single specific project, or ... copy them into a global directory"
- 251.3 "financial models engine so it can run entirely independently"; 258.0 "node models.mjs ... as a standalone sanity check" (panel 3)

## Slide 4: The Architecture: Six composable skills. 267.8 to 316.4 (48.6 s)

**Content**
- Title: "The Architecture: Six composable skills orchestrating a rigorous pipeline"
- Center: large dark hexagon (double outline, bracket accents) with mono `investor-docs` and text "The Orchestrator / Front Door. Sequences pipeline and enforces honesty rules."
- Five outlined elongated hexagons around it, each with an arrow pointing INTO the center hexagon:
  - top-left `algo-financial-models` "(Computes honest numbers)"
  - bottom-left `investor-proof-pack` "(Transparency and verification layer)"
  - top-right `investor-proposal-build` "(Assembles the 14-section Markdown document)"
  - bottom-right `investor-doc-localize` "(Faithful, drift-free translation)"
  - bottom-center `investor-proposal-audit` "(The mandatory skeptical-investor gate)"

Article check: matches the six-skill table. Arrow direction (into the hub) is a stylistic choice; the orchestrator calls the others, so arrows out of the hub are equally valid.

**Beats**
- 275.9 "composed of six distinct pieces"
- 279.4 "First, there's investor-docs" / 282.7 "the orchestrator ... the front door that manages the sequence" (hub)
- 285.9 "Second is algo-financial-models, the mathematical engine"
- 291.5 "Third is the investor-proof-pack ... transparency and verification"
- 297.9 "Fourth is investor-proposal-build"; 300.3 "a really rigid 14-section markdown document"
- 304.8 "Fifth is investor-doc-localize for translation"
- 308.1 "the sixth skill is investor-proposal-audit"; 313.5 "the mandatory skeptical gatekeeper"

## Slide 5: The Assembly Line. 316.4 to 331.1 (14.7 s)

**Content**
- Title: "The Assembly Line: From measured facts to audited proposal"
- One long horizontal glass tube split by 6 ring flanges into 5 chambers, chevron arrows between chambers. Each chamber: stage label above, small dark terminal card (3 dots) with mono skill name, caption below:
  1. "Intake" / `intake-template.md` (green top bar, green text) / "Raw facts in"
  2. "Engine" / `algo-financial-models` / "Honest tables out"
  3. "Verification" / `investor-proof-pack` / "Proof layer attached"
  4. "Assembly & Translation" / `investor-proposal-build` + `investor-doc-localize` / "Document rendered"
  5. "The Gate" / `investor-proposal-audit` (red top bar, red text) / "Required AI-skeptic review loop"

Article check: matches the pipeline diagram. Article marks localize as "(optional)" and audit as "(REQUIRED)"; add those tags when redrawing.

**Beats**
- 316.4 "these are not just random scripts you pick and choose from"; 320.9 "literal gears in a highly structured machine"
- 324.3 "a strict sequential pipeline" (tube fills left to right)
- 326.7 "you can't just skip straight to printing the final pitch"

## Slide 6: Stage 1 Intake. 331.1 to 416.9 (85.8 s)

**Content**
- Title: "Stage 1 Intake: The strict boundary between measured facts and assumptions"
- Center: a document card (dog-eared, dark frame, corner brackets) with mono text:
  - `---` / `intake-template.md`
  - Green-highlighted block `# Measured Facts`: `- win rate [real]: 0.55`, `- average trade [real]: 15000 USD`, `- max drawdown [real]: 0.12`, `- sample size [real]: 5000`; arrow label at right "Verified Data"
  - Amber block `# Forward Assumptions`: `- leverage: 2.0x`, `- alpha decay: 0.001 daily`, `- slippage: 0.05%`; arrow label "Input Variables"
  - `# Missing Data`: `- required capital:`, `- benchmark:`, `- audit firm:` each followed by an empty red-outlined box; the three boxes merge into a thick red arrow pointing to big red "[TODO]".
- Bottom dark bar: "**The unbreakable rule:** Anything left blank becomes an explicit TODO slot in the final draft. The system flatly refuses to invent or paper over missing numbers."

Fixes: all values on the card are NotebookLM placeholders, not from the article (the article publishes no numbers; its reference examples are anonymized). Label the card "example" or use obviously generic values. "average trade 15000 USD" also clashes with the kit's rule that dollar amounts are withheld in disclosures; prefer a % value. Article's measured fields: sample size, win rate, average trade, Sharpe, Sortino, max drawdown, date range; forward assumptions: leverage, tranche count, assumed depth, slippage, alpha decay.

**Beats**
- 331.1 "starting at the intake phase"; 335.7 "the single source of truth"
- 340.7 "a plain text file called intake-template.md" (card appears)
- 345.8 "strategy thesis and their measured facts"; 348.9 "sample size, win rate, average trade size" (green block)
- 354.1 "forced categorization"; 357.8 "measured historical fact versus ... forward-looking assumption like expected slippage or assumed market depth" (amber block)
- 367.5 "what if the trader just doesn't have the data?"
- 377.6 "If you leave a field blank, the AI does not attempt to guess"
- 386.5 "A blank field in the intake becomes an explicit, glaring TODO slot" (red boxes, arrow, [TODO])
- 392.9 "point blank refuses to invent data"
- 406.0 "it just stops and points a big red arrow at your missing homework" (red arrow pulse)
- 413.0 "If you cannot provide the proof, the toolkit will simply not allow you to make the claim" (bottom rule bar)

## Slide 7: Stage 2 Models. 416.9 to 742.4 (325.5 s), split into sub-scenes

**Content (whole slide)**
- Title: "Stage 2 Models: Computing realizable returns, not theoretical edges"
- 2x3 grid of glass-cylinder panels, each with a dark header tab:
  1. **Sizing**: "Kelly / L÷N exposure sweep table"; a 3x3 heatmap titled "Kelly Exposure Sweep" with cells "≤ 1/2 Kelly" (green), "Full Kelly" (amber), "> Full Kelly" (red), mixed colors; footer "Optimal Fraction: 0.45x".
  2. **Bridge**: "Capacity-adjusted return bridge"; waterfall chart: tall dark bar "Raw Edge", floating steps "Slippage", "Impact", "Fees", final dark bar "Realized Edge", a bracket arrow from Raw to Realized; footer "Capacity Drag: -120bps".
  3. **Fees**: "High-water mark performance fee schedule"; line chart (Value vs Time) of "Net Asset Value" crossing a dashed red "High-Water Mark"; shaded "Fee Accrual Zone" above it; footer "HWM Threshold: $1.0M".
  4. **Metrics**: "Pass-through, un-flattered metrics"; mono list `Sharpe Ratio: 1.85`, `Sortino Ratio: 2.45`, `Calmar Ratio: 1.20`, `Win Rate: 54.5%`.
  5. **Risk**: "GBM Monte-Carlo paths and ruin probability"; fan of grey paths with bold median, labels P95 / P50 / P5, red horizontal "Ruin Threshold"; footer "Ruin Prob: <0.5%".
  6. **Decay**: "Alpha decay durability and Wilson small-sample confidence intervals"; decaying curve with shaded band and error bars, x-axis "Holding Period", legend "Alpha Decay" / "Wilson CI".

**NotebookLM errors / fixes**
- Every number on this slide (0.45x, -120bps, $1.0M, 1.85, 2.45, 1.20, 54.5%, <0.5%) is invented; the article gives none. For a kit whose core rule is "never fabricate a number" this is the worst possible slide to hallucinate on. Redraw panels without numbers, or with values clearly stamped "illustrative".
- Bridge: the article's return bridge has **four rungs**: raw per-event edge, capacity-adjusted edge, after-fee, after-decay; it always shows both raw and capacity-adjusted. Use those labels instead of Slippage/Impact/Fees.
- Sizing: the 3x3 heatmap with "Kelly" on both axes is nonsense. Article: exposure = `L / N` (leverage / tranches); a 1-D sweep table colored green at or below half-Kelly, amber up to full Kelly, red above full Kelly.
- Decay x-axis "Holding Period" is wrong; alpha decay is over calendar time (decaying-edge schedule). The Wilson CI is for the win rate, a separate element.
- Article also lists Expectancy (EV, per-trade sigma, payoff ratio, capacity, net edge, Kelly fraction) and Calmar; metrics are "pass-throughs": sigma and downside deviation are back-solved so measured Sharpe/Sortino reproduce exactly.

### 7a Sizing / Kelly. 416.9 to 532.1
- 416.9 "assume the trader does actually have the raw data"; 422.7 "hands those measured inputs over to ... the financial models engine" (grid appears)
- 436.6 "expectancy and sizing ... L divided by N sizing and the Kelly criterion" (Sizing panel zooms)
- 454.5 Kelly explained: "a famous mathematical formula originally used by gamblers"; 465.3 "what percentage of your bankroll you should bet"
- 474.8 "bet too little, you don't grow"; 477.5 "bet too much, a single string of bad luck bankrupts you"
- 487.1 "L divided by N ... leverage divided by the number of tranches ... effective exposure per event" (show `exposure = L / N`)
- 497.4 "sweep the trader's exposure and color-code it against that Kelly formula"
- 504.6 "at or below half Kelly, it colors it green"; 508.3 "up to full Kelly, it's amber"; 510.3 "above ... it flags it red" (three rows light up in sequence)
- 515.1 "transforms risk from a vague feeling into a highly defensible visual boundary"
### 7b Return bridge. 532.1 to 601.3
- 532.1 "capacity-adjusted return bridge"; 536.4 "raw per event edge ... after-fee capacity-adjusted figure"
- 548.2 "a theoretical return is not a realizable return"
- 552.1 "buy an asset for a dollar and sell it a millisecond later for a dollar and one cent"; 561.6 "my raw edge is one percent" (correct: 0.01/1.00)
- 565.7 "an allocator gives me $10 million"; 576.4 "You eat into the order book"; 582.3 "slippage and your edge decays rapidly" (order-book eating animation, bridge steps down)
- 588.0 "the return bridge forces the trader to show both numbers side by side"; 592.2 "a physical ceiling in the real world"
### 7c Fees + pass-through metrics. 601.3 to 643.8
- 601.3 "high watermark fee schedule"; 604.5 "only charge performance fees on new equity highs"; 608.3 "not just for recovering from past losses" (NAV dips under HWM: no fee; crosses above: fee zone)
- 612.2 "pass-through ratios for things like the Sharpe and Sortino"
- 622.8 "It back-solves the math"; 624.5 "exact measured Sharpe and Sortino ... reproduced perfectly"
- 636.2 "It will not flatter them"; 638.8 "will not round a 1.8 up to a 2.0" (gag: 1.8 tries to become 2.0, gets locked)
### 7d Monte-Carlo. 643.8 to 697.6
- 647.1 "GBM Monte Carlo simulation with ruin probability"; 656.0 "GBM stands for Geometric Brownian Motion"
- 659.3 "generates thousands of alternate hypothetical futures" (paths fan out)
- 669.2 "fifth percentile worst case ..., fiftieth percentile median, and the 95th percentile best case" (P5/P50/P95 labels)
- 678.1 "folds alpha decay ... and the actual mathematical probability of total ruin right into those simulations" (ruin line, red)
- 689.8 "forcing the trader to visualize their own destruction"
### 7e Wilson CI. 697.6 to 742.4
- 699.3 "win 62% of the time over, say, 80 trades" (big "62% / 80 trades"; this example IS in the article)
- 712.0 "80 trades is a microscopically small sample size"; 716.6 "flipped a coin and gotten ahead"
- 721.5 "A Wilson confidence interval acts as a statistical reality check"
- 734.9 "true win rate is somewhere between 50 and 70%" (draw interval bar; exact 95% Wilson CI for 62%, n=80 is about 51% to 72%; use "~51-72%")

## Slide 8: Stage 3 Proof Pack. 742.4 to 939.5 (197.1 s)

**Content**
- Title: "Stage 3 Proof Pack: Honesty made mathematically checkable"
- Top-left dark box: "**REST API order-ID reconciliation**" / "Recomputing P&L exactly from fills". Top-right dark box: "**Statement transaction-history export**" / "Matched on symbol + time + sign". Each feeds a thick bent pipe-arrow down to the center, both converging on a table.
- Center card "Disclosed-Trades Table" with columns Date | Symbol | Side | Size | Price | P&L %; 7 rows: 2024-05-15 BTC/USD Buy +2.3%; 2024-05-15 ETH/USD Sell -1.5%; 2024-05-16 BTC/USD Buy +4.1%; 2024-05-16 ETH/USD Buy +2.3%; 2024-05-16 BTC/USD Buy +2.3%; 2024-05-16 ETH/USD Sell -1.5%; 2024-05-16 ETH/USD Sell +4.1%. Size and Price cells are "$" followed by grey redaction bars.
- Seal badge (dark, serrated edge) overlapping the table's top-right corner: "Step 0" / "Key: Investor-reconciled read-only API".
- Right callout with dot leader: "All winners AND losers. Dollar amounts deliberately withheld."
- Bottom dark bar: "Charts differentiate synthetic mechanical illustrations from real candle charts with verified fill markers."

Fixes: the article's fixed columns are `# | Venue | Pair | Date | Side | PnL % | Hold time | Status`; Size/Price columns are NotebookLM inventions. Trade rows/dates are placeholders. Redraw with the article's columns and generic rows. Also add the proof-pack boundary from the article: proves authenticity and magnitude of past live trades; does NOT prove future returns, edge at scale, nor is it a complete audit; strongest proof = forward pilot on the investor's own account.

**Beats**
- 751.5 "Numbers in a markdown table are incredibly easy to fake"; 758.1 "Photoshop an exchange export" (skeptic gag)
- 771.9 "the third skill, the investor proof pack"; 777.0 "the layer where honesty is made checkable"
- 781.1 "a disclosed trades table listing every single trade in the window, winners and losers" (table rows drop in, losers in red)
- 787.3 "Cherry picking your best trades is explicitly forbidden"
- 790.6 "shows the percentages ... but deliberately hides the actual dollar amounts"; 802.4 "can expose a trader's current bankroll or leak proprietary secrets" (redaction bars slide over $ cells)
- 822.9 "forcing two completely independent digital trails to agree"; 827.5 "two independent reconciliation paths"
- 832.4 "pulling raw, individual order fills directly via the exchange's REST API" (left pipe flows)
- 846.5 "official downloadable transaction statement ... matches the symbols, times, and financial signs" (right pipe flows)
- 857.1 "making two entirely distinct data structures ... agree without a single error is astronomically difficult" (both pipes meet: green check)
- 868.1 "a step zero key"; 878.3 "offers the investor a read-only script"; 881.6 "generates their own read-only API key and runs that script ... on their own machine" (Step 0 seal stamps)
- 889.5 "before they ever grant permission for the trader to touch a single dime"
- 897.8 "the proof pack includes charts"; 901.4 "synthetic charts ... mechanics"; 908.0 "real candle by candle charts with entry and exit markers tied directly to those reconciled API fills" (bottom bar)
- 926.7 "it only proves the authenticity of past trades"; 933.1 "does not prove future returns ... larger scale" (boundary note)

## Slide 9: Stage 4 Proposal Build: The Inverted Pitch 14-section arc. 939.5 to 1042.2 (102.7 s)

**Content**
- Title: "Stage 4 Proposal Build: The Inverted Pitch 14-section arc"
- A seesaw/balance (glass beam on a trapezoid gear-box fulcrum). Left (heavier, lower) pan holds 3 stacked dark glass blocks: "Structural Custody (trade-only API, one-click revocation)", "Capital across N separate top-level accounts", "Quantified failure-scenarios downside table"; hanging tag "**Risk & Custody** (Sections 1-2, 4, 8-11)". Right (lighter, raised) pan holds 3 smaller blocks: "Leverage-invariant ratios", "High-Water Mark fee model", "Explicit roadmap (not promises)"; tag "**Returns & Mechanics** (Sections 3, 6-7, 12-14)".
- Bottom dark bar: "Trust is built by balancing every brag with an immediate, unhedged disclosure of the corresponding risk."

Article check: the 14 sections are: 1 Thesis (custody anchor in first paragraph), 2 Where the edge comes from, 3 Headline metrics, 4 Custody and operating model, 5 Real-trades transparency, 6 Capital stages (pilot ~$50k, fee in escrow, 0% until HWM recovers), 7 Fee model (% of net profit, HWM, no management fee), 8 Two named risks, 9 Failure-scenarios table, 10 Liability and risk allocation, 11 Capital split across N separate top-level accounts with per-venue cap, 12 Alpha durability, 13 Operator, 14 Roadmap ("not promises"). The two-pan grouping is NotebookLM's own and omits section 5. If redrawing, list all 14 with risk/custody sections highlighted.

Narration error: at 967.9 the host says section 1 "immediately anchors" on custody AND then discusses separate top-level accounts as if that were the opening; separate top-level accounts is section 11. Section 1 carries only the custody one-liner (trade-only keys on investor-owned accounts).

**Beats**
- 945.5 "assembles a 14-section markdown document"
- 955.2 "a normal pitch deck leads with a massive graph showing how rich everyone is going to get"; 961.4 "But this document leads with the custody model" (seesaw tips toward Risk)
- 973.3 "separate top-level accounts versus sub-accounts"
- 982.6 sub-account cascade story: 985.7 "single master account with dozens of sub-accounts"; 992.2 "one sub-account gets flagged"; 999.1 "that freeze can cascade up to the master account and lock up everyone's capital" (animate red freeze spreading up a tree)
- 1007.1 "separate top-level investor custody" (independent boxes, freeze stays local)
- 1014.1 "only ever given a trade-only API key"; 1018.4 "revoke that key with one click"; 1020.7 "a panic button" (big emergency-brake button)
- 1027.9 "highly defensive"; 1032.1 "downside table ... what the investor stands to lose"
- 1038.9 "low hype" (bottom bar)

## Slide 10: Stage 5 & 6: Faithful localization and the mandatory AI-Skeptic Gate. 1042.2 to 1186.2 (144.0 s)

**Content**
- Title: "Stage 5 & 6: Faithful localization and the mandatory AI-Skeptic Gate"
- Left text with incoming arrows: "Exact translation of caveats, fees, and custody terms into en / ru / zh / ko without softening language." Arrows feed a stack of document pages into a tall metal-and-glass gate frame (scanner portal).
- Right: tilted glass panel "Audit Loop Rubric" (mono): `satisfaction (0-100): 62 [INSUFFICIENT]` (red tag, warning triangle), `wouldInvest: NO` with red rubber stamp "FAIL" and warning triangle, `scamRisk: HIGH [CRITICAL]` with glowing red warning triangle. Feedback arrows loop from the panel back to the gate.
- Bottom-left red frame "**Penalizes:**" bullet "Marketing adjectives, hidden numbers, unverifiable claims, internal contradictions."
- Bottom-right green frame "**Rewards:**" bullet "Concrete verification, explicit fee terms, quantified downside."
- Bottom text: "**The Gate:** Fails until satisfaction >= 88 and scam risk is nullified by adding offerable proof, not overclaiming."

Fixes: "scam risk is nullified" is wrong; the article's exit condition is `satisfaction >= 88` AND `scamRisk` is not `high`, after at least two iterations. The verdict also has top concerns, missing info, red flags, strengths. The 62 score is illustrative. Narration says "88%" (1178.9, 1275.7): it is a 0-100 score, not a percent. Narration (1062.9) says localization works by "prompting ... cross-referencing against the original English definitions": the article says a back-translation spot-check on custody, fee and liability sections; minor, use the article's wording.

**Beats**
- 1042.2 "the fifth skill, localization"; 1046.0 "into languages like Russian, Chinese, or Korean" (en/ru/zh/ko tags)
- 1052.6 "translation without drift" (numbers stay pinned while words change language)
- 1070.8 "no number, no legal term, and no warning is softened"
- 1093.5 "the sixth skill, the proposal audit, literally attacks its own work"; 1098.5 "mandatory skeptical gatekeeper" (doc enters gate)
- 1105.0 "scores it on a rubric from 0 to 100"; 1110.3 "a satisfaction score of at least 88 to pass" (gauge with 88 notch)
- 1116.9 "scam risk metric must be rated as not high"
- 1124.9 "It's an AI grading its own homework" (skeptic)
- 1132.2 "an adversarial fix loop"; 1136.7 "hunts for marketing adjectives, hidden numbers, internal contradictions, or vague claims about money" (Penalizes box)
- 1145.0 "If the document scores a 75, the agent attempts to revise"
- 1152.1 "fix weaknesses by adding verifiable proof"; 1157.5 "paid forward pilot program or ... read-only API access" (Rewards box)
- 1163.7 "strictly forbidden from fixing a bad score by inflating the projected returns or deleting risk caveats"
- 1171.6 "more transparency, not better adjectives"
- 1178.9 "if it doesn't pass that 88 threshold ... It remains a draft forever" (loop runs: 62 to 75 to 88+, FAIL becomes PASS)

## Slide 11: The Manifesto: Four uncompromising rules for allocator trust. 1186.2 to 1248.1 (61.9 s)

**Content**
- Title: "**The Manifesto:** Four uncompromising rules for allocator trust"
- Four glass-and-steel pillars/towers under a shared glass beam (blueprint dimension lines). Each has a white label band and a dark screen:
  1. "1. Never Fabricate": "Missing facts are TODOs. Every number traces to measured data or labeled assumptions."
  2. "2. Honesty-Forward, Low-Hype": "Lead with risk and custody. Offer verification, don't ask for trust."
  3. "3. Custody is Structural": "Trade-only API keys on investor-owned accounts. Zero withdrawal rights. Revocable in one click."
  4. "4. Mandatory Audit Gate": "A proposal is a draft—not a deliverable—until it passes the skeptical AI loop."

Article check: matches the four principles.

**Beats**
- 1186.2 "the underlying design principles"; 1191.2 "four main rules"
- 1195.1 "First, never fabricate. Missing facts are just TODOs" (pillar 1)
- 1198.9 "Second, honesty forward and low hype" (pillar 2)
- 1201.9 "Third, custody is structural, offering one-click revocation" (pillar 3)
- 1206.2 "fourth, the audit gate is mandatory" (pillar 4)
- 1213.1 "an era of pure information overload"; 1217.4 "In 2026, allocators are drowning in hyper-optimized generative AI pitches"
- 1227.0 "Trust is no longer built by using the best superlatives"; 1230.0 "handing the reader the exact tools they need to disprove you"
- 1238.0 "highlighting your capacity limits and quantifying your ruin probability ... you operate in reality"

## Slide 12: Practical Operation: From terminal to validated document. 1248.1 to 1292.0 (43.9 s)

**Content**
- Title (light sans): "Practical Operation: From terminal to validated document"
- Four dark terminal windows cascading diagonally top-left to bottom-right, connected by elbow arrows:
  1. `open .claude/skills` / "(Auto-load repo)"
  2. `fill intake-template.md` / "(Input measured track, label assumptions, leave blanks empty)"
  3. `> Prepare an investor document for my strategy.` / "(Triggers investor-docs orchestrator pipeline)"
  4. `[AUDIT COMPLETE] output.md` / "(Audit loops run automatically, outputting a single self-contained Markdown file built for LLM due diligence)"

Fixes: step 1 is "open the repo in Claude Code (skills auto-load)", not `open .claude/skills`. `[AUDIT COMPLETE] output.md` is illustrative. Prompt text in window 3 matches the article exactly.

**Beats**
- 1250.5 "an algorithmic trader sitting at your desk"; 1257.9 "surprisingly streamlined"
- 1260.8 "open your project folder in Claude Code" (window 1)
- 1263.1 "fill out that single intake template" (window 2)
- 1268.1 "ask the AI to prepare the investor document" (window 3 types the prompt)
- 1271.2 "sit back, let the orchestrator run the models, generate the proof pack, build the document"; 1275.7 "wait for the audit gate to loop until it beats that 88 score" (window 4)
- 1283.2 "a single, highly portable markdown file"; 1286.8 "engineered to survive that initial LLM paste test"

## Slide 13: Ecosystem Fit. 1292.0 to 1331.2 (39.2 s)

**Content**
- Title: "Ecosystem Fit: Agentic AI applied to due diligence, not signal generation"
- Dumbbell: two glass spheres joined by a glass tube labelled `algo-investor-skills`.
  - Left sphere header "**AI for Order Books** (Crowded Space)": densely packed with chart cards and cables; labels "LLM analyst committees", "Multi-agent funds", "Reinforcement learning".
  - Right sphere header "**AI for Capital Communication** (The Whitespace)": clean, sparse panels; labels "Investor Relations", "Due Diligence", "Verification".
- Bottom dark bar: "While the market obsesses over using AI to make trades, this architecture uses a composable-agent orchestrator to credibly communicate a working edge to capital without compromising operator integrity."

Article check: matches.

**Beats**
- 1292.0 "connect this to the bigger picture"; 1298.8 "the vast majority of AI trading tools are focused purely on signal generation" (left sphere fills, crowded)
- 1307.9 "applies agentic AI to investor relations and due diligence" (right sphere)
- 1315.2 "an orchestrator plus specialists architecture"
- 1318.4 "instead of pointing those agents at an order book to squeeze out pennies, it points them at documentation"
- 1325.9 "using AI to manufacture trust rather than just generate alpha"

## Slide 14: Uncompromising Boundary Conditions. 1331.2 to 1407.0 (75.8 s)

**Content**
- Title (light sans): "Uncompromising Boundary Conditions"
- Dark terminal panel with amber double border, header "Cautionary Terminal Warning", mono lines:
  - `[STATE] Early-stage, single-maintainer project.`
  - `[DATA] Reference proposals and models are anonymized illustrative examples. The value is the process, not the shipped numbers.`
  - `[LIMIT] The audit loop is model-limited; a passing paper score is still just a paper score.`
  - `[REALITY] The strongest proof is, and always will be, a forward pilot on the investor's own account.`

Article check: matches "Honest caveats". Narration at 1390.4 ("any figures generated by this repository require primary review by the trader ... intense human editorial oversight") is not in the article; it is reasonable but unsourced, so do not put it on screen as a claim of the kit. The article also says the kit gives no financial, legal or tax advice.

**Beats**
- 1336.1 "the vital limitations laid out in the source article"
- 1345.5 "early stage single maintainer open source project" ([STATE])
- 1350.5 "examples ... are completely anonymized placeholders"; 1354.8 "real value ... in the methodological discipline ... not in the dummy numbers" ([DATA])
- 1366.6 "model limited"; 1368.8 "a passing score on paper from an AI is still just a paper score" ([LIMIT])
- 1379.1 "the strongest proof ... will always be a forward pilot"; 1384.7 "Run on the investor's own account" ([REALITY])
- 1390.4 human oversight remark (see note)

## Slide 15: Closing. 1407.0 to 1499.64 (92.6 s)

**Content**
- Big centered sans, 3 lines: "Verification over trust. / Risk before returns. / Checkably honest."
- Glass card: "A strategy is an edge. An audited, honesty-forward proposal is the infrastructure that allows that edge to attract capital." (the slide has a typo "that edge / edge": write "edge" once)
- Dark terminal bar: `github.com/suenot/algo-investor-skills`
- Bottom pill: "Do not pitch harder. Hand the reader the tools to confirm the math."
- Background: wireframe corridor with receding glass panels.

**Beats**
- 1407.0 "look under the hood"; 1410.9 "search for suenot/algo-investor-skills on GitHub" (repo bar)
- 1418.5 "see the 14-section framework, and examine those anonymized examples"
- 1424.8 "a profound shift in capital raising strategy"; 1429.9 "isn't to pitch harder or market louder"; 1434.9 "It is to be checkably honest" (headline lines appear 1 by 1)
- 1449.9 "Normal pitches are all about hiding the flaws"; 1454.1 "put your mathematical flaws on the very first page"; 1458.6 "hands the allocator a magnifying glass"
- 1464.1 "that chemical analyzer from our opening scenario": HALLUCINATED callback, there was no chemical analyzer in the opening. Do not visualize; reuse the magnifying-glass motif.
- 1478.6 final thought: "AI can simulate a radically skeptical auditor ... what other industries desperately need their own AI gatekeeper"
- 1497.1 "Until next time, keep diving deep" (end)

---

## Timing notes

`sync_slides.py` was not usable here (cold open is out of deck order); boundaries set by hand from the transcript. Confidence per boundary:

| Start | Slide | Cue | Confidence |
|---|---|---|---|
| 0.0 | 2 | paste-test hook opens the episode | high |
| 81.7 | 1 | "Which brings us to the tool designed to solve this" | high |
| 164.0 | 3 | "what was your initial reaction" / Word template | high |
| 267.8 | 4 | "what are the specific tools in this kit?" | high |
| 316.4 | 5 | "not just random scripts ... strict sequential pipeline" | medium (short, could merge into 4) |
| 331.1 | 6 | "starting at the intake phase" | high |
| 416.9 | 7 | "trader does actually have the raw data ... financial models engine" | high |
| 742.4 | 8 | "I have to play the role of the skeptical listener" (proof pack named 771.9) | medium-high |
| 939.5 | 9 | "how does it all come together? ... 14-section" | high |
| 1042.2 | 10 | "the fifth skill, localization" | high |
| 1186.2 | 11 | "the underlying design principles" | high |
| 1248.1 | 12 | "let's bring this down to earth" | high |
| 1292.0 | 13 | "connect this to the bigger picture" | high |
| 1331.2 | 14 | "address the vital limitations" | high |
| 1407.0 | 15 | "look under the hood ... GitHub" | high |
