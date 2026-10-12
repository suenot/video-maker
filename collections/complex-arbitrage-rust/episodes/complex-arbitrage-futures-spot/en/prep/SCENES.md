# complex-arbitrage-futures-spot (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host who pushes back, H2 = expert host),
15-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/complex-arbitrage-futures-spot.en.md` (Part 2 of the series, dated 2026-02-24).

- Audio: `input/notebooklm-sources/complex-arbitrage-futures-spot/en/audio.m4a`, 931.68 s (15:31.7), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, per-word start/end in `words[]`). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: near-black charcoal background (#1E2024-ish) with a faint dot grid; off-white text (#ECE8DC); slate blue-grey (#5E7F8C) = SPOT / CeFi / "long" side; magenta-crimson (#9B2F5C) = FUTURES / DeFi / "short" side; small brick red (#B03A3A) for risk accents; amber/khaki hazard-stripe boxes (#B49A4A diagonal stripes) for disclaimers. Titles mix grotesk sans and monospace; most body text is monospace. Small "Gemini Notebook" watermark bottom right on every slide (do not redraw). The deck consistently maps spot = blue on the left and futures/perp = magenta on the right; keep that.

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "Sunat" (68.0) = suenot; "C-Fi" = CeFi; "decks" / "deck short perp" (748.0, 773.7, 784.8) = DEX; "Vyn Coppola's" (842.4, 849.9, 908.4) = Vine Copulas; "purpose trading above spot" (384.8) = "perp is trading above spot"; "funding signs" (526.9) is what the hosts say and also what slide 9 prints, but the meaning is "funding discrepancies / spreads". The hosts read the internal source id aloud at 78.2 to 84.3 ("MM article complex-arbitrage-futures-spot EN 1cce761ff956"); do not caption or redraw it.

---

## Slide 1: Title. 0.0 to 30.0 (30.0 s)

**Content**
- Title (one line, large off-white sans): "Futures-Spot Arbitrage: From Cash-and-Carry to DeFi-CeFi"
- Subtitle (grey sans): "Complex Arbitrage Chains Between Futures and Spot (Part 2)"
- Hero diagram: a suspension bridge across the full width. Left half (slate blue): mono header "SPOT MARKET" / "CEFI CAPITAL"; a candlestick chart (about 15 tall blue candles) with a rising zig-zag line ending in an up-right arrow, under the left tower. Right half (magenta): mono headers "ORDER BOOK" / "MARKET DEPTH" and "FUTURES MARKET" / "DEFI LIQUIDITY"; a horizontal depth-bar ladder (about 14 magenta bars with small prices like 2335.636, 2423.500, values decorative/garbled, do not copy) and a semicircular gauge labelled "FUNDING RATE" with needle near "+10%" (tick labels 0, 10%, 15%, 20%, 25%, 50%, 100%; decorative). The deck halves meet in the middle: blue roadway on the left, magenta on the right.
- Between the towers, five horizontal mono "data lanes" with arrows (top to bottom):
  - `DATA_STREAM::BID_ASK_SPREAD` arrow pointing right (spot to futures)
  - `SYNC::CEFI_SPOT_PX` arrow right
  - `TRANSFER::FUNDING_PAYMENT` arrow left (futures to spot)
  - `BASIS_ARB::EXECUTE_TRADE` arrow right
  - `CROSS_CHAIN::DEFI_BRIDGE` arrow left
- Dashed-corner mono metadata box bottom left: `AUTHORS: ["suenot"]` / `DATE: "2026-02-24"` / `TAGS: ["arbitrage", "futures", "spot", "cash-and-carry", "funding rate", "basis", "DeFi", "CeFi", "rust", "deltaneutral"]`

NotebookLM issue: the bridge labels "FUTURES MARKET = DEFI LIQUIDITY" and "SPOT = CEFI CAPITAL" are misleading; futures and perps also trade on CeFi (Binance), and the DeFi-CeFi chain is only section 3. When redrawing, label the left side "SPOT" and the right side "FUTURES / PERPS" without the CeFi/DeFi pairing (or put CeFi/DeFi only on the section-3 scene).

**Beats**
- 0.0 "what if someone ... promised an 11% yield on your crypto" (big "11%" pops); 5.1 "completely immune to market crashes ... virtually risk-free" (stamp "risk-free?" with a question mark)
- 10.1 "I'd probably walk away" (gag: character turns to leave)
- 13.8 "It sounds like a total scam"; 19.4 "one of the most sophisticated institutional traps"
- 25.2 "fascinating, but incredibly dangerous" (title reveal can land here or at 0.0; title is never read aloud in this episode)

## Slide 2: The Delta-Neutral Paradigm. 30.0 to 130.3 (100.3 s, two sub-scenes)

**Content**
- No title bar. Top center: a grey metal balance scale (beam with central pivot). Left pan holds a green up arrow with label "Market / Goes Up"; right pan holds a red down arrow with label "Market / Goes Down". Beam is level.
- Three boxed columns under the scale (thin grey borders; the right box has a split top accent bar, blue left half / magenta right half):
  1. "**The Delta-Neutral Paradigm**": "Profit dimensions in cryptocurrency extend beyond simple graph-based asset swaps."
  2. "**Market Independence**": "Delta-neutral strategies decouple profit generation from directional market movement."
  3. "**The Mechanism**": "These strategies exploit structural price differences between Spot and Futures markets for the exact same asset, anchoring returns to market mechanics rather than price speculation."

Article check: matches the article intro ("delta-neutral strategies, where the trader's profit does not depend on whether the market goes up or down").

**2a. Delta-neutral, 30.0 to 63.6**
- 30.0 umbrella/sunglasses analogy: "imagine you're selling umbrellas and sunglasses ... make money no matter what the weather is doing" (gag: shop with umbrella and sunglasses, rain then sun)
- 38.0 "You're hedging"
- 39.4 "a position where your profit doesn't depend on the market weather ... that's called a delta neutral strategy" (scale appears; up/down arrows in pans; beam stays level, 43.1)
- 49.1 "take market direction completely out of the equation"
- 52.2 "you're just trading it for a complete labyrinth of operational and technical risks" (labyrinth icon behind the scale; plant for slides 12 and 13)

**2b. Source card and disclaimer, 63.6 to 130.3** (redraw as a source card, reuse slide 1's metadata box: author suenot, 2026-02-24, Part 2)
- 63.6 "a very specific, deeply technical snapshot"; 68.0 "an article by the author, suenot"; 70.4 "From February 24th, 2026"; 72.8 "part two of their series on complex arbitrage chains"
- 78.2 to 84.3 hosts read the internal source id (do not show it)
- 89.2 "set a baseline"; 98.4 "how institutional money moves" / 100.7 "the actual plumbing"
- 102.3 "we are absolutely not endorsing any of the current funding rates or yield projections, exchange support or investment results"; 111.2 "Definitely not financial advice" (stamp "NOT FINANCIAL ADVICE")
- 113.3 "just a simplified source example ... pure illustrative math"; 119.5 "not ... a forecast or guaranteed income"
- 123.4 "as this engineering gets more advanced, the margin for operational error just shrinks to zero"

## Slide 3: H2 1. The Core Concept: Basis and Convergence. 130.3 to 208.7 (78.4 s)

**Content**
- Title (sans): "H2 — 1. The Core Concept: Basis and Convergence"
- Line chart, axes with arrowheads, faint vertical gridlines at 4 equal intervals. Magenta jagged line "Futures Price (F)" starts high on the left; blue-grey jagged line "Spot Price (S)" starts lower. A left bracket spanning the gap between the two starting points labelled "Basis = F - S". Lines wander roughly in parallel, then the magenta line falls in the last third; a straight magenta trend line also slopes down from about 60% across. Both lines meet at a single point on a vertical dotted line labelled (mono, top right) "Delivery / Settlement (Expiration Date)". After the meeting point the lines diverge slightly again (decorative).
- Three header boxes with body text under them (mono body):
  1. "The Basis": "The mathematical difference between the futures price (F) and the spot price (S)."
  2. "Theoretical Relation": "At the exact delivery/settlement date of a contract, a theoretical relation dictates that the futures price MUST equal the spot price (F = S)."
  3. "Convergence": "The inevitable, contract-dependent closing of the Basis gap."

Article check: Basis = F − S and F = S at expiry match section 1. Chart detail to fix: after the convergence point the lines should end (the contract has expired), not keep going; redraw them stopping at the dotted line.

**Beats**
- 130.3 "section one of the source, the core concept, basis and convergence" (slide in)
- 142.0 "The basis"; 146.0 "The formula is just F minus S" / 149.2 "the futures price minus the spot price" (type `Basis = F − S`, bracket grows between the lines)
- 152.7 "this concept called convergence"; 157.9 "contract dependent theoretical relation"; 161.3 "on the exact expiration date ... the futures price must equal the spot price" (lines draw to the dotted line and meet; `F = S`)
- 169.2 H1 pushes back on "must"; 176.3 "Does this theoretical convergence ever actually happen before that final delivery bell"
- 184.4 "prior to settlement ... wildly unpredictable"; 187.2 "The basis fluctuates violently" (bracket jitters); 189.9 "futures price at a huge premium ... betting on a bull run"; 196.1 "the next day it plunges below spot" (magenta dips below blue briefly)
- 198.1 "It does not converge until delivery"; 204.3 "That gap opening and closing is the lifeblood of the arbitrage"

## Slide 4: H3 1.1 Cash-and-Carry. 208.7 to 295.7 (87.0 s)

**Content**
- Title (mono): "H3 — 1.1 Cash-and-Carry"
- Subtitle (sans): "The classic long spot plus short dated future strategy. By executing both legs, the trader locks in the spread, waiting for mandatory convergence at expiration."
- Horizontal grey arrow track left to right through three large circles, joined by thin bracket lines above and below:
  1. Blue circle, white plus-in-circle icon: "Buy Spot" / "Buy 1 BTC at $50,000"
  2. Magenta circle, white minus-in-circle icon: "Sell Futures" / "Short 1 BTC December Futures at $52,000"
  3. Grey circle, padlock icon: "Wait & Deliver" / "Hold to expiration"
- Hazard-stripe box (khaki diagonal stripes on the left edge), mono: "**Simplified Source Example:** The article's exact $2,000 theoretical profit relies on perfect convergence. This is a simplified educational example and NEVER guaranteed income. Quoted "risk-free" wording explicitly ignores fees, borrowing costs, funding, settlement rules, basis changes, collateral requirements, tax, execution slippage, and counterparty risk."

Article check: $50,000 spot, $52,000 December futures, profit exactly $2,000 match section 1.1. The article does not use the words "risk-free" in 1.1 (it says "regardless of the BTC price"); the hosts' "risk-free income" at 245.5 is their paraphrase. Keep the hazard box; it is a correct caveat.

**Beats**
- 208.7 "section 1.1, cash and carry"; 213.1 "the oldest playbook in finance"
- 218.3 "Long spot plus short dated future"
- 224.7 "you buy one bitcoin on the spot market for $50,000" (circle 1)
- 230.1 "in the exact same breath ... you sell one bitcoin on a December futures contract for $52,000" (circle 2, 233.8)
- 239.6 "You just wait for delivery" (circle 3, padlock closes)
- 240.8 "the profit is exactly $2,000" (counter +$2,000); 245.5 "calling it risk-free income" (stamp, then crack it)
- 253.2 "strictly a simplified source example"; 257.5 "never guaranteed income"
- Friction list, tick in one by one (each as a chip that bites into the $2,000): 263.0 trading fees on both legs; 266.6 borrowing costs; 271.4 settlement rules; 274.8 collateral lockups / 277.5 "capital trapped doing nothing for months"; 280.4 tax, execution, counterparty risk
- 286.0 "if the exchange holding your December futures contract goes bankrupt in November" / 290.3 "your locked-in profit is just gone" (gag: exchange building collapses, $2,000 vanishes)

## Slide 5: H3 1.1 Cash-and-Carry (code). 295.7 to 332.0 (36.3 s)

**Content**
- Framed panel with title "H3 — 1.1 Cash-and-Carry" and a rule under it.
- "**Algorithmic Tracking:** Bots track these spreads across exchanges to compute annualized basis-yield arithmetic, scanning for optimal capital deployment."
- Code window (macOS-style red/yellow/green dots), syntax colored (keywords purple, fn name blue, types f64 purple, numbers orange):
```rust
fn calculate_annualized_yield(basis: f64, spot_price: f64, days_to_expiry: f64) -> f64 {
    let yield_pct = basis / spot_price;
    (yield_pct / days_to_expiry) * 365.0 * 100.0
}
```
- Hazard-stripe box: "Technical Note: Rust snippets represent highly simplified pseudocode. They contain missing definitions, lack error controls, and are not validated trading systems."

Article check: code matches the article exactly. Optional worked example for the redraw: basis 2,000 / spot 50,000 = 4%; if 90 days to expiry, (0.04 / 90) × 365 × 100 ≈ 16.2% annualized (days-to-expiry is not given in the article, so label it as an assumption if shown).

**Beats**
- 295.7 "the article shows this piece of rust pseudo code"; 299.2 "Calculate_Annualized_Yield" (code types in)
- 302.5 "It tracks three variables"; 304.4 "the basis, the spot_price, and days_to_expiry" (highlight the three params)
- 310.1 "annualized basis yield arithmetic"; 314.4 "divides the basis by the spot price" (line 2), "divides that by the days to expiry" (line 3), 318.7 "spits out an annualized percentage" (`* 365.0 * 100.0`)
- 320.5 "raw simplified arithmetic"; 323.0 "it completely ignores all the real world friction" (hazard box slides in)
- 327.3 "that's cash and carry ... relies on an expiration date to force that convergence" (transition)

## Slide 6: H2 2. Perpetual Futures and Funding Rates. 332.0 to 405.1 (73.1 s)

**Content**
- Title (mono): "H2 — 2. Perpetual Futures and Funding Rates"
- Subtitle: "The **Anchor**: Because Perpetual Futures lack a dated delivery to force convergence, exchanges utilize a continuous Funding Rate to tether the Perp price to the Spot price based on the ongoing positive/negative funding direction."
- Two-column comparison table (mono, boxed rows). Left column has a blue top bar, right column a magenta top bar:
  | Dated Futures | Perpetual Futures (Perps) |
  |---|---|
  | Has Expiry Date | Never Expire |
  | Anchored by Mandatory Convergence | Anchored by Ongoing Funding Rate |
- Bottom row diagram: central grey box "Funding Rate Mechanism". Thick blue arrow pointing left, labelled above in blue "Negative Funding" / "(Bear Market)", into a blue-topped box "Shorts pay Longs". Thick magenta arrow pointing right, labelled "Positive Funding" / "(Bull Market)", into a magenta-topped box "Longs pay Shorts".

Article check: matches section 2 (positive funding: longs pay shorts, usually bull market; negative: shorts pay longs, bear market). The "every eight hours" at 401.4 is from the article's 2.1 example ("0.01% every 8 hours"); "on most major exchanges" is the hosts' generalization (fine as a typical value, some venues use 1 h or 4 h).

**Beats**
- 332.0 "section two ... Perpetual futures and funding rates" (slide in)
- 337.4 "the most popular instrument in crypto doesn't even have an expiration date"; 342.5 "the perpetual future, or perp"; 345.5 "hold ... forever" / 348.9 "no dated expiry" (table row 2)
- 351.2 "no delivery day to force the F and the S together ... what stops the perp price from just completely detaching"
- 360.9 "an ongoing variable payment system called the funding rate" (center box); 365.9 "to keep it tethered" (rope between Perp and Spot)
- 371.3 "financially penalize traders pushing the perp away from spot, and reward the ones pushing it back"
- 377.2 "exchanged directly between the longs and the shorts"
- 384.8 "big bull market ... perp trading above spot ... positive funding, the longs are forced to pay the shorts" (magenta arrow, coins flow long to short)
- 392.5 "bear market ... perp drops below spot ... negative funding. The shorts have to pay the longs" (blue arrow, coins flow back)
- 399.2 "How often?"; 401.4 "every eight hours" (clock icon, 3 ticks per day)

## Slide 7: H3 2.1 Funding Arbitrage. 405.1 to 493.4 (88.3 s)

**Content**
- Framed panel. Title: "H3 — 2.1 Funding Arbitrage" ("H3 —" in amber, rest off-white).
- "**The Strategy:** Maintain a Long Spot position while holding a Short Perp position to continuously harvest positive funding payments without waiting for a dated expiry."
- Center: a ring split in two halves. Top half blue labelled "Long Spot", bottom half magenta labelled "Short Perp"; thin circular arrows inside each half run clockwise. Ring center: database/coins stack icon with a down arrow, label "Ongoing Funding / Payments".
- Hazard-stripe box (full width): "**Illustrative Arithmetic:** An example variable funding rate of 0.01% per eight hours translates to about 11% simple annualization. This is illustrative article arithmetic, NOT a forecast. It highlights the difference between an annualized nominal rate and a realized net return. "Risk-free" framing is theoretical; it ignores liquidation exposure and fluctuating variable funding."

Article check: 0.01% × 3 per day × 365 = 10.95% ≈ 11% APR; matches the article ("about 11% APR"). Article calls it "virtually risk-free income, provided you can manage the liquidation risk"; the deck and hosts correctly soften this.

**Beats**
- 405.1 "section 2.1, funding arbitrage"; 408.8 "payments happening three times a day ... harvest them"
- 416.7 "you buy one Bitcoin spot, and you short one Bitcoin perp" (ring halves fill: blue then magenta)
- 422.3 "positive funding rate ... collect payments from the longs every eight hours" (coins drop into the center every beat)
- 432.2 "0.01% per eight hours"; 437.1 "about an 11% simple annualization" (calc: 0.01% × 3 × 365 ≈ 11%); 441.2 "11%" / 442.4 callback to the opening "virtually risk-free yield" (reuse the slide 1 "11%" prop)
- 447.1 "just illustrative article arithmetic"; 450.0 "It is not a forecast"; 451.8 "alarm bells should be ringing" (alarm bell gag)
- 457.1 "annualized nominal rate ... today's snapshot blindly multiplied out for a year" vs 464.0 "the actual realized net return"
- 467.5 "funding rates are variable"; 469.5 "could flip to a negative funding direction tomorrow"; 477.4 "you are paying the longs every eight hours"; 480.5 "your yield just turns into a drain" (coins reverse and drain out of the ring)
- 482.2 "Delta neutral does not mean no risk" (plant for slide 12's "Delta-Neutral ≠ No-Risk"); 488.1 "exposed to the volatility of the funding rate itself"

## Slide 8: H2 3. DeFi-CeFi Arbitrage: The New Frontier. 493.4 to 545.4 (52.0 s)

**Content**
- Title (sans): "H2 — 3. DeFi-CeFi Arbitrage: The New Frontier"
- Left panel, blue tint, header "Centralized Finance (CeFi)": mono label "Centralized Exchange" over a "Limit Order Book" widget (columns "Price (USDT)", "Amount (BTC)", "Depth Chart"; 7 red ask rows above, a mid row "0.820323 (USDT)  1.69" in green, 8 green bid rows below with growing green depth bars; numbers are garbled filler, redraw with clean plausible values); mono label "Centralized REST APIs" over an isometric server rack with callouts "REST API Endpoint" and "Database Node", cables connecting rack to order book.
- Right panel, magenta tint, header "Decentralized Finance (DeFi)": a mesh of isometric cube nodes fully connected by thin arrows. Labels: "Uniswap (AMM)" (top), "Uniswap (AMM)" (left), "Uniswap (AMM)" (bottom), "AMMxs (AMM)" (center), "dYdX (Pezp)" (lower left), "Hyperliquid (DEX)" (right, hexagon with an "H" logo), "Decentcalized (DEX)" (lower right), a hexagon with an "X" logo (upper right) and a wireframe icosahedron (upper left) unlabeled. Legend top right: arrow "Liquidity Pool", double arrow "Smart Contract", arrow "Transaction Route".
- Bottom box (mono): "**The Shift:** The rise of AMMs and DEXs creates an entirely new structural landscape." / "**The Opportunity:** Capturing price and funding discrepancies by routing arbitrage chains across fundamentally different market architectures, bridging traditional CeFi order books with on-chain DeFi liquidity pools."

NotebookLM errors in the DeFi panel (fix when redrawing): labels are garbled. Use exactly the venues the article names: **dYdX** (perp DEX), **Hyperliquid** (perp DEX), **Uniswap** (AMM, spot only). "dYdX (Pezp)" means "dYdX (Perp)"; "AMMxs" and "Decentcalized" are typos; Uniswap should appear once, not three times. Note Uniswap has no perps or funding rate, so the funding leg of the chain only applies to dYdX / Hyperliquid.

**Beats**
- 493.4 "it gets even crazier. Section three. DeFi-CeFi arbitrage, the new frontier" (slide in)
- 499.8 "up until now ... harvesting funding on one single exchange"
- 505.1 "capturing the discrepancy between entirely different ecosystems"
- 509.3 "a centralized exchange or CeFi platform like Binance" (CeFi panel builds); 512.9 "against decentralized exchanges, DEXs like dYdX or Hyperliquid" (those nodes light up); 518.9 "or even automated market makers like Uniswap"
- 521.9 "these environments are totally fragmented"; 524.6 "different users, different liquidity"; 526.9 "massive cross-platform funding signs"
- 533.5 "Binance might have a slightly negative funding rate for a coin, but a DEX on some Ethereum layer two might have a highly positive funding rate ... at the exact same time" (two funding gauges: CeFi slightly negative, DEX strongly positive)

## Slide 9: H3 3.1 The Chain. 545.4 to 620.9 (75.5 s)

**Content**
- Title (mono): "H3 — 3.1 The Chain"
- Subtitle (mono): "Executing the chain requires seamless interaction between centralized exchange logic and decentralized smart contract protocols."
- Three numbered cards in a row on a band whose background fades blue (left) to magenta (right); arrows "→" between cards:
  1. "Detect Discrepancy": "BTC Spot on Binance (CeFi) is $50,000" / "BTC Perp on DEX (DeFi) is $50,500 with massive funding rate." ("CeFi" in blue, "DeFi" in magenta)
  2. "Execute": "Buy Spot on CeFi, simultaneously Short Perp on DeFi." / "Preserve cross-platform funding signs."
  3. "Optimize Inventory": "Manage collateral." / "Choose between pre-funded inventory on both venues OR rely on a 'Bridge' to move assets across chains." ("'Bridge'" and "chains" in magenta)

Article check: $50,000 / $50,500 and the three steps match section 3.1. "Preserve cross-platform funding signs" is NotebookLM filler not in the article; replace with "Stay delta-neutral across venues" or drop it.

**Beats**
- 545.4 "section 3.1, the chain"; 551.0 "Step one is detecting that discrepancy"
- 553.4 "Spot BTC on Binance is 50,000"; 557.5 "the DEX perp is 50,500 with a huge funding rate" (card 1, gap $500 highlighted)
- 562.0 "Step two is execute"; 564.4 "buy Spot on the CeFi side, short the perp on the DeFi side" (card 2)
- 569.2 "step three is where it gets really hard"; 571.5 "optimize your collateral" (card 3)
- 576.9 "pre-funded inventory versus using a bridge"; 581.2 "idle capital sitting on Binance and ... on the DEX"; 592.0 "cuts your capital efficiency in half" (capital bar splits 50/50), 595.6 "But it's fast"
- 597.1 "using a blockchain bridge to move your collateral"; 604.8 "massive delay and finality risks"; 608.9 "lock your assets on one chain and mint them on another"; 613.4 "can take minutes" (hourglass on the bridge)
- 615.2 "a minute is an eternity"; 618.6 "The spread will be gone before your money even shows up" (the $500 gap closes while the coin is still on the bridge)

## Slide 10: H3 3.2 Cross-Chain Complexity (diagram). 620.9 to 629.4 (8.5 s)

**Content**
- Title (sans): "H3 — 3.2 Cross-Chain Complexity"
- Flow diagram left to right on a dot grid: box "CeFi REST/Websocket API" → a thick blue-grey trident/fork (three blue lanes merging into one) → box "Rust Arbitrage Engine" → thick magenta zig-zag path weaving through three stacked diamonds "Gas Fees" (top), "MEV" (middle), "L1/L2 Latency" (bottom) → box "DEX Smart Contract via RPC Nodes".
- Two text columns under the diagram:
  - "Infrastructure Friction": "Operating across this divide introduces profound complexities compared to single-exchange arbitrage. Bots must handle Ethereum/Solana RPC nodes and centralized APIs simultaneously."
  - "Execution Bottlenecks": "Profitability depends on managing Gas costs, MEV (Maximal Extractable Value) threats, and latency discrepancies between venues."

Article check: matches section 3.2 (gas fees, L1/L2 latency, Ethereum/Solana RPC + Binance API). MEV is not in the article but is a correct addition. This slide is only on screen briefly by narration order; its friction diamonds are narrated at 658 to 708 (see slide 11, sub-scene 11b), so reuse them there.

**Beats**
- 620.9 "section 3.2. Cross-chain complexity"; 626.4 "Making this work technically is a nightmare" (diagram draws CeFi → engine → DEX; diamonds can appear dimmed, to be activated in 11b)

## Slide 11: H3 3.2 Cross-Chain Complexity (code). 629.4 to 708.6 (79.2 s, two sub-scenes)

**Content**
- Title (bold sans): "H3 — 3.2 Cross-Chain Complexity"
- Subtitle: "Polling logic requires simultaneous asynchronous state monitoring across distinct market protocols to detect actionable spreads."
- Code window (red/yellow/green dots), mono, light grey with string literals dimmer:
```rust
async fn monitor_funding(dex_client: &DexClient, cefi_client: &CefiClient) {
    let dex_funding = dex_client.get_funding_rate("BTC-USD").await;
    let cefi_funding = cefi_client.get_funding_rate("BTC-USDT").await;

    let spread = dex_funding - cefi_funding;
    if spread > THRESHOLD {
        execute_trade().await;
    }
}
```
- Hazard-stripe box (mono): "Technical Note: Rust snippets are pseudocode with missing definitions and error controls; they are not validated trading systems. Do not endorse any current exchange API support, funding, or yield."

Article check: code matches the article exactly. Note the two `.await`s run sequentially, not "simultaneously"; a real bot would use `tokio::join!`. Not worth showing, but do not caption it as "simultaneous".

**11a. Code, 629.4 to 658.4**
- 629.4 "another Rust snippet"; 631.5 "monitor_funding" (code types in)
- 635.0 "a get_funding_rate function"; 639.1 "pings Ethereum and Solana RPC nodes for the DEX side" (line 2, DEX icon) / 642.6 "while simultaneously hitting the Binance API" (line 3, CeFi icon)
- 646.0 "Just reading the pseudocode makes it look easy" (spread > THRESHOLD → execute_trade flashes green)
- 650.3 "pseudocode with missing definitions and controls"; 654.5 "not validated trading systems" (hazard box)

**11b. Friction gauntlet, 658.4 to 708.6** (reuse slide 10's CeFi → Rust engine → diamonds → DEX diagram; the trade packet runs the magenta zig-zag)
- 658.4 "in a live market, you'd be crushed by network friction"
- 663.3 "basic RPC and API failures ... connections drop" (cable snaps)
- 667.7 "gas fees on the blockchain eating your spread" (Gas Fees diamond lights, spread bar shrinks)
- 670.9 "And slippage ... the price probably moved" (L1/L2 Latency diamond)
- 677.6 "the worst part is MEV, maximal extractable value bots" (MEV diamond); 684.1 "apex predators of the blockchain" (shark/robot gag)
- 687.3 "watching pending transactions" in the mempool; 690.8 "front run you by paying a slightly higher gas fee"; 696.7 "steal your spread before your transaction even processes"
- 700.0 "chain reorgs where the blockchain briefly forks"; 704.9 "smart contract bugs, general venue risks"; 707.6 "It's endless"

## Slide 12: H2 4. Execution Risk (Delta-Neutral ≠ No-Risk). 708.6 to 816.6 (108.0 s, two sub-scenes)

**Content**
- Small title (sans): "H2 — 4. Execution Risk: Leg Risk and Liquidation"
- Huge mono headline: "Delta-Neutral ≠ No-Risk"
- Two cards with brick-red top bars:
  - "Leg Risk (One-Leg Execution Failure)": "You successfully buy the spot, but due to slippage, RPC latency, or DEX liquidity shifts, the short future execution fails. The spread vanishes, leaving you holding naked directional risk." Icon: broken chain link with spark lines.
  - "Liquidation Risk (Collateral Exposure)": "If the asset price suddenly doubles, your short position requires massive margin. Even if the spot leg is equally profitable, the short position may face forced liquidation if sufficient collateral is unavailable on that specific venue." Icon: bar chart with a falling arrow and a speedometer with the needle in a red zone.

Article check: matches section 4 (leg risk, liquidation risk if price doubles). Correct.

**12a. Leg risk, 708.6 to 763.7**
- 708.6 "section four. Execution risk, leg risk, and liquidation" (headline slams in: "Delta-Neutral ≠ No-Risk")
- 715.0 "all this tech complexity turns into severe financial risk"
- 719.4 "leg risk first"; 721.9 "one leg execution failure"
- 724.2 analogy: "hand a briefcase of cash to someone in a moving car while simultaneously grabbing a car key from someone in a different car going the other way" (gag: two cars, one handoff misses); 740.4 "You have the cash, but no keys"
- 744.0 "your code successfully buys the spot Bitcoin on Binance"; 748.0 "when it hits the DEX to short the perp, the API fails or an MEV bot front runs you" (chain link breaks)
- 754.3 "you just own millions of dollars of unhedged Bitcoin"; 758.4 "You are no longer delta neutral"; 761.3 "totally exposed to the market" (the slide 2 scale tips over)

**12b. Liquidation, 763.7 to 816.6**
- 763.7 "what if I execute both legs perfectly?"; 768.0 "then you face liquidation risk ... collateral and liquidation exposure"
- 773.7 "perfectly hedged, spot on Binance, short perp on the DEX"; 778.9 "Globally, yes"
- 780.5 "Bitcoin's price doubles" (price ×2); 782.6 "Binance spot is in huge profit"; 784.8 "cancels out the massive loss on your DEX short perp"
- 790.6 "the DEX's liquidation engine doesn't care about your Binance account"; 794.9 "isolated margin on its specific smart contract" (two separate margin wallets, the DEX one drains)
- 800.8 "bleeding out locally"; 803.5 "if you don't bridge more collateral ... in time"; 806.0 "they will automatically liquidate" (speedometer needle into red, LIQUIDATED stamp)
- 808.3 "technically profitable globally, but you still get wiped out locally"; 812.7 "fragmentation of the margin systems is a huge danger"

## Slide 13: H2 4. Execution Risk (venue and DeFi risks). 816.6 to 824.9 (8.3 s)

**Content**
- Title: "H2 — **4. Execution Risk:** Leg Risk and Liquidation"
- Isometric diagram center: a blue-grey platform "CENTRALIZED SERVER" (server racks with a warning triangle and red ✕ markers) and a magenta platform "BLOCKCHAIN NETWORK" (smart-contract document icons and cubes with ✕ and warning markers), linked via two smaller platforms "BRIDGE" and "BRIDGE PROTOCOL" with many red ✕ and ⚠ markers on the links.
- Three callout boxes with arrows to the diagram:
  - top left "**Venue & Exchange Risk**": "Centralized exchanges suffering downtime, API rate limits, or catastrophic hacks during execution windows."
  - top right "**DeFi Systemic Risks**": "Smart-contract vulnerabilities, RPC/API total failures, gas and slippage spikes, and blockchain reorganizations (reorgs)."
  - bottom "**The Inventory Dilemma**": "To avoid bridge delay/finality risks during a trade, traders maintain pre-funded inventory on all platforms. However, this dramatically multiplies exposure to the venue and smart-contract risks listed above."

Article check: "Exchange Risk: What if the exchange goes down or gets hacked?" matches; the DeFi and inventory points are NotebookLM elaborations consistent with the article and narration (inventory was narrated at 576 to 620, reorgs at 700.0).

**Beats**
- 816.6 "not even mentioning exchange risk, like if Binance just halts withdrawals or the DEX gets hacked" (CENTRALIZED SERVER ✕ markers flash, then BLOCKCHAIN NETWORK ✕)
- 822.9 "Right. Game over."

## Slide 14: H2 5. Conclusion. 824.9 to 904.2 (79.3 s)

**Content**
- Title (mono): "H2 — 5. Conclusion"
- Left: vertical up arrow with label "Capital Efficiency & Risk Management".
- Center: 3-tier isometric pyramid: bottom dark grey tier "Asset Swaps", middle blue-grey tier "Cash-and-Carry", top magenta tip "Cross-Chain DeFi/CeFi Arbitrage".
- Right, two mono boxes:
  - "The Institutional Reality": "Futures-spot arbitrage represents the institutional side of crypto. It demands vastly superior capital efficiency and robust risk management compared to simple graph-based asset swaps, but offers superior scalability."
  - "Coming Next (Part 3)": "An exploration of Vine Copulas—advanced mathematical tools used to model complex dependencies between dozens of different assets and their derivatives simultaneously."

Article check: the article says it "requires **more capital** and better risk management than simple asset swaps, but it scales much better". The slide's "demands vastly superior capital efficiency" inverts that; use "requires more capital and better risk management" and label the pyramid axis "Capital & Risk-Management Requirements". "Part 3 = Vine Copulas" matches the article.

**Beats**
- 824.9 "section 5. The conclusion" (pyramid builds bottom up)
- 828.4 "the institutional side of crypto"; 833.3 "scales much better than the simple asset swaps, assuming the liquidity is there"; 837.3 "capital requirements are massive and you need elite risk management"
- 842.4 "Vine Copulas" teaser (Coming Next box); 849.9 "model complex dependencies between dozens of different assets and derivatives all at once"
- 859.2 "They're mapping the whole galaxy"; 862.1 "how Ethereum yields interact with Solana volatility and Bitcoin funding across 20 different venues" (constellation of asset nodes; the "20 venues" figure is the hosts' illustration, not from the article)
- 871.4 "for you listening ... understanding this is so important"; 880.4 "these institutional bots are the hidden gears of the market" (gears behind the pyramid)
- 884.5 "their delta neutral strategies dictate the funding rates we all see"; 888.2 "when their cross chain collateral systems fail, their liquidations cause the flash crashes the rest of us feel"
- 894.1 "The theory is elegant, but the real world friction is just relentless"; 899.0 "Replacing market risk with execution risk requires flawless engineering"

## Slide 15: Source reference and audit note. 904.2 to 931.68 (27.5 s)

**Content**
- Almost empty dark slide; mono text block at the bottom:
  - "Source Reference: MM article complex-arbitrage-futures-spot EN 1cce761ff956" (internal id, drop when redrawing)
  - "Project Repository: Maximizing carry? Explore the Delta Neutral Strategy Engine on GitHub (marketmaker-cc/delta-neutral-core)."
  - "Editorial Audit Note: Historical, numerical, research, financial, exchange/API, performance, and mutable assertions remain attributed source claims pending human editorial, formula, and primary-source review. External target-channel and NotebookLM artifact duplicates are not checked for clearance. Endorsement of any investment results is expressly disclaimed. Chinese regional terminology and Mandarin pronunciation await final human review." (internal; drop the last sentence for EN)

Article check: repo URL matches the article footer: https://github.com/marketmaker-cc/delta-neutral-core

Not narrated. Redraw as the closing card: the bridge from slide 1 with the open question, repo link, end card.

**Beats**
- 904.2 "a final somewhat provocative thought"; 908.4 "as these tools like Vine Copulas become standard and bots monitor every network with zero latency"
- 915.2 "will these CeFi-DeFi discrepancies just eventually be arbitraged out of existence entirely?" (the gap on the bridge closes)
- 921.4 "Or will the sheer chaos of blockchain fragmentation guarantee that these high-risk fleeting gaps just exist forever?" (gap reopens, question mark)
- 929.8 "Until next time, keep diving deep" (end card)

---

## Timing notes

`sync_slides.py` (defaults) degenerated ("showed 8/15 slides, longest held 86%") and fell back to an even split, saved as `timeline_auto_evensplit.json`; do not use it.

`slide_starts.json` is set by hand from the hosts reading the section numbers aloud. The deck order is followed 1:1, so in two places the narration order and the slide order differ; those are handled as sub-scenes inside a monotonic timeline instead of jumping back:
- Slide 1 metadata (author/date/part) is narrated at 63.6 to 130.3, after the delta-neutral explanation (slide 2). It is sub-scene 2b.
- Slide 10's friction diamonds (gas, MEV, latency) are narrated after the slide 11 code. They are sub-scene 11b.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title | 0.0 | intro hook ("11% yield ... risk-free") | high |
| 2 Delta-neutral | 30.0 | "imagine you're selling umbrellas and sunglasses" (delta neutral named at 39.4) | high |
| 3 Basis and convergence | 130.3 | "section one of the source, the core concept, basis and convergence" | high |
| 4 Cash-and-carry | 208.7 | "section 1.1, cash and carry" | high |
| 5 Cash-and-carry code | 295.7 | "the article shows this piece of rust pseudo code" | high |
| 6 Perps and funding | 332.0 | "let's move to section two of the deep dive. Perpetual futures and funding rates" | high |
| 7 Funding arbitrage | 405.1 | "Okay, so section 2.1, funding arbitrage" | high |
| 8 DeFi-CeFi | 493.4 | "But it gets even crazier. Section three" | high |
| 9 The chain | 545.4 | "section 3.1, the chain" | high |
| 10 Cross-chain diagram | 620.9 | "section 3.2. Cross-chain complexity" | high (but only 8.5 s, see above) |
| 11 Cross-chain code | 629.4 | "The source has another Rust snippet here" | high |
| 12 Delta-Neutral ≠ No-Risk | 708.6 | "Which flows right into section four. Execution risk, leg risk, and liquidation" | high |
| 13 Venue/DeFi risks | 816.6 | "not even mentioning exchange risk" | medium (no heading read; short) |
| 14 Conclusion | 824.9 | "Which brings us to section 5. The conclusion" | high |
| 15 Source/audit | 904.2 | not narrated; placed on the closing "final provocative thought" | low (choice of placement) |
