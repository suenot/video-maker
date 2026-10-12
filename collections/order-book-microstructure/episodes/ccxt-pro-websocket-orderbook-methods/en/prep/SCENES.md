# ccxt-pro-websocket-orderbook-methods (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
15-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/ccxt-pro-websocket-orderbook-methods.en.md` (date 2025-06-03, author suenot / Eugen Soloviov).

- Audio: `input/notebooklm-sources/ccxt-pro-websocket-orderbook-methods/en/audio.m4a`, 1548.89 s (25:48.9), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, per-word start/end in `words[]`). Timestamps below are segment starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` (manual, see "Timing notes" at the end) to `timeline.json`.
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: slide 1 is cream with a faint grey candlestick chart; slides 2 to 15 are white/light-grey engineering graph paper (fine grid), black heavy grotesk titles, pale grey tables with black rules, mid-grey code panels (mono, red keywords, green strings) and black terminal panels. Hero illustrations are isometric steel pipes (WebSocket connections) feeding stacked server racks (order books), blue data packets inside pipes. Warnings are tilted amber/brown rubber-stamp boxes. Many slides split into a white left half and a light-grey right half. Small "Gemini Notebook" watermark bottom right (do not redraw).

NotebookLM editorial boilerplate: the deck carries several "Editorial Flag" / "Notice" / "pending primary-source review" boxes, and the hosts read them aloud (they are part of the narration at 71.7 to 122.7, 540.5, 681.6, 765.5, 876.6, 1460.2). Keep the substance (these are dated June 2025 claims; method presence is not method support) as one recurring visual device (for example a "dated claim, June 2025" stamp), but do not redraw the long boilerplate paragraphs verbatim.

Transcript quirks (Whisper mis-hearings, do not put into captions verbatim): "gait.io" = Gate.io, "OneCat" (742.1) = 1CAT, "Eugene Soloviev" (66.8) / "Eugen Solovjoff" (1481.0) = Eugen Soloviov (suenot), "BitGit" (848.5) = Bitget, "DescribesGait.io" (774.0) = "describes Gate.io", "WebSock gets" (560.9) = WebSockets, "breath" (965.8, 984.1) = breadth, "safe traffic" (1082.5) = save traffic, "steep dive" (1542.3) = deep dive, "typeofexchange.watchorderbook" (826.7) = `typeof exchange.watchOrderBook === 'function'`. Method names are spoken as words ("watch order book for symbols", "watch bids asks", "fetch order book WS"); always render them in camelCase code style.

---

## Slide 1: Title / Introduction: Why This Matters. 0.0 to 198.9 (198.9 s)

**Content**
- Title (bold navy): "CCXT: How WebSocket Orderbook Methods Really Work"; subtitle (steel blue): "H2 — Introduction: Why This Matters".
- Background: cream with faint grey candlesticks and a thin rising price line.
- Three white cards with navy borders, icon on top, bold heading, question text:
  1. Icon: server rack with a magnifying glass. "**Support**: Which WebSocket methods for orderbooks are actually supported across exchanges?"
  2. Icon: thick steel pipes with solid arrows (left) vs a thin wire with a small dashed arrow (right). "**Physics**: How do methods differ in traffic volume and data structure?"
  3. Icon: big green check mark overlapped by a red question mark. "**Verification**: Why do automated tests show "✅" when methods fail in practice?"
- Bottom right: amber box with black/amber hazard stripes on its left edge: "**Notice:** Assertions regarding exchange counts, traffic multiplication, and API behavior are dated article claims pending human primary-source and runtime review. Pin CCXT Pro version, exchange, and market mode before treating any API claim as current."

Article check: the three questions match the article intro verbatim ("Which WebSocket methods ... actually supported", "How do methods differ in traffic volume and data structure", "Why can automated tests show ✓ while the method doesn't work"). The "Notice" box is NotebookLM boilerplate, not article content.

**Sub-scenes** (199 s, split)
- 1a 0.0 to 59.0, cold open "highway vs swamp": 0.0 "you drive to where the highway is supposed to be, and it's literally just a dirt path ending in a swamp"; 12.7 "the official API documentation promises this beautiful six-lane, fully paved data highway"; 18.8 "the actual WebSocket connection delivers a totally undocumented swamp"; 24.7 "today, we are mapping that swamp"; 43.2 "three days debugging ... the exchange just silently deprecated the endpoint". Visual: a paved 6-lane highway sign "API DOCS" that turns into a dirt track into a swamp labelled "LIVE WEBSOCKET".
- 1b 59.0 to 122.7, source + dated-claims rule: 60.3 title read aloud "CCXT, How WebSocket Order Book Methods Really Work" (title reveal); 66.8 "by the author Eugen Soloviov, dated June 3rd, 2025" (byline); 76.5 "pin down the exact CCXT Pro version, the specific exchange, and the market mode" / 84.9 "spot, future, or swap" (three pins drop: VERSION, EXCHANGE, MARKET MODE); 92.3 "a snapshot from June 2025 ... in crypto development, that's an eternity" (date stamp); 115.7 "your exchange might have just shipped a patch yesterday".
- 1c 122.7 to 198.9, why it matters: 124.2 "Starting with our introduction, like why this matters"; 127.2 "CCXT is basically ... the universal translator for crypto exchanges"; 134.6 "unify hundreds of messy, totally chaotic exchange APIs into one clean standardized syntax" (many plugs into one adapter); 150.3 "why do documented methods still just fail in practice?" (verification card); 156.1 "the wrapper can really only be as good as the underlying engine"; 180.3 "the literal data packets flowing through your socket in real time"; 184.4 "monitor over 100 trading pairs at once for an arbitrage strategy"; 192.7 "catastrophic latency or hitting rate limits or just outright system failure". Reveal the three cards Support (around 150.3), Physics (around 184.4, traffic) and Verification (150.3 to 160).

## Slide 2: Overview of Key Methods / 1. watchOrderBook (Classic Approach). 198.9 to 302.1 (103.2 s)

**Content**
- Titles: "H2 — Overview of Key Methods" / "H3 — 1. `watchOrderBook` - Classic Approach".
- Left: isometric steel pipe loop (comes in from top left, bends down, loops around the bottom) entering the top of a tall stack of 8 server units with a glowing blue top; small blue data packets travel both ways inside the pipe; long arrow along the pipe labelled "Persistent Connection"; bracket along the stack "Deep Orderbook (100–1000 levels)".
- Right, table (Property | Value):
  - Purpose: | Subscribe to orderbook updates for one pair.
  - Connection type: | Persistent WebSocket connection.
  - Data: | Full orderbook (usually 100–1000 levels per side).
  - Traffic: | Medium to high (depends on update frequency and depth).
- Code panel:
  ```javascript
  const exchange = new ccxt.pro.binance();
  const orderbook = await exchange.watchOrderBook('BTC/USDT');
  console.log(orderbook);
  ```

Article check: matches section "1. watchOrderBook" exactly.

**Beats** (103 s, split)
- 2a 198.9 to 258.9, the method: 198.9 "our overview of key methods"; 206.5 "four distinct methods for pulling order book data" (optional: four method chips appear, then 1 is selected); 219.1 "the first one, watch order book ... the classic approach"; 223.7 "one single trading pair at a time"; 231.8 "persistent WebSocket connection, meaning it stays open" (pipe draws); 235.8 "full order book depth ... 100 to 1,000 levels per side" (stack grows); 247.0 "traffic ... medium to high"; 250.7 "every time a single limit order is placed or even canceled at any of those 100 price levels, the exchange fires an update" (packets fire).
- 2b 258.9 to 302.1, HD camera analogy: 258.9 "a high definition persistent security camera on a single door"; 268.7 "every single frame ... what shoes they have on"; 281.9 "what if your strategy requires you to watch 50 doors at once?"; 288.6 "50 separate persistent WebSocket connections"; 294.9 "the exchange's server is going to identify you as a threat" / 298.2 "rate limit you into oblivion" (50 cameras, server turns red, "429").

## Slide 3: 2. watchOrderBookForSymbols (Bulk Subscription). 302.1 to 414.9 (112.8 s)

**Content**
- Title: "H3 — 2. `watchOrderBookForSymbols` - Bulk Subscription".
- Left: a branching pipe manifold (one trunk splitting into several branches) feeding three server stacks of different heights; arrows show flow in several directions. Over it, a tilted amber rubber-stamp box: "**Important warning:** Method may exist in the API wrapper but remain unimplemented by the venue. Do not assume universal multi-symbol multiplexing support."
- Right table:
  - Purpose: | Subscribe to multiple pairs at once.
  - Connection type: | Persistent WebSocket (often one connection multiplexed).
  - Data: | Full orderbook for each pair.
  - Traffic: | Very high (100–1000 levels × 2 sides × number of pairs).
- Code panel (slide shows only the BTC/USDT entry):
  ```
  {
    'BTC/USDT': {
      'bids': [[50000.1, 1.5], [50000.0, 2.1]],
      'asks': [[50001.0, 1.2], [50001.1, 0.8]],
      'timestamp': 1717398000000,
      'datetime': '2025-06-03T12:00:00Z'
    }
  }
  ```
  The article's response also has `"ETH/USDT": { "bids": [[3000.5, 10.2], [3000.4, 5.7]], "asks": [[3001.0, 8.3], [3001.1, 12.1]], timestamp 1717398000000, datetime "2025-06-03T12:00:00Z" }` and uses double quotes (JSON). Use the article version (both pairs, double quotes) when redrawing.

Article check: table matches. Warning matches the article ("In reality, not supported on all exchanges. Sometimes the method exists in the API but isn't implemented").

**Beats** (113 s, split)
- 3a 302.1 to 345.7, the bulk method: 302.1 "watch order book for symbols. This is the bulk subscription"; 309.1 "persistent WebSocket connection ... full depth for multiple pairs simultaneously, ideally multiplexed through a single connection" (manifold draws); 318.2 "traffic here is just extraordinarily high" / 322.5 "an absolute fire hose"; 325.8 "a JSON example of the response shape" (code types in); 334.4 "groups the bids, the asks, a precise timestamp, and a human readable date time string, all paired to each specific symbol" (highlight keys in order).
- 3b 345.7 to 414.9, warnings: 345.7 "I need to wave a massive red flag"; 350.2 "This JSON shape ... is not a guaranteed contract" / 358.3 "not a universal schema across all venues"; 366.7 "If Binance formats their date time differently than, say, KuCoin"; 374.2 "a very stark warning" (stamp slams on at ~377); 379.9 "existing in the official API documentation, but not actually being implemented by the exchange backend"; 403.8 "they leave the lights on, but nobody's home"; 406.3 "You call the method and it just hangs" / 409.0 "waiting for a promise that will never resolve".

Host claims beyond the article: 392.4 "Exchanges will copy a competitor's API swagger docs" is host speculation, and "it just hangs ... a promise that will never resolve" contradicts the article's own Gate.io example, where the call throws `NotSupported` immediately. Do not visualize the swagger-copying claim as fact; for the failure, show an error, not an infinite spinner (or show both "hang or throw" generically).

## Slide 4: 3. watchBidsAsks (Optimized Monitoring). 414.9 to 511.8 (96.9 s)

**Content**
- Title: "H3 — 3. `watchBidsAsks` - Optimized Monitoring".
- Left: one tall server stack (7 units); a thin translucent blue plane/beam cuts diagonally through only the top unit; curved arrow label "Top-of-book slice".
- Right table:
  - Purpose: | Subscribe only to best prices (top of book) for multiple pairs.
  - Connection type: | Persistent WebSocket (often one connection for all pairs).
  - Data: | Only one price per side (bid/ask). Usually via ticker endpoint.
  - Traffic: | Minimal, highly economical for bulk monitoring.
- Code panel:
  ```
  {
    'BTC/USDT': {
      'bids': [[50000.1, 1.5]],
      'asks': [[50001.0, 1.2]],
      'timestamp': 1717398000000
    },
    'ETH/USDT': {
      'bids': [[3000.5, 10.2]],
      'asks': [[3001.0, 8.3]],
      'timestamp': 1717398000000
    }
  }
  ```
  (Article version also carries `"datetime": "2025-06-03T12:00:00Z"` per pair.)

Article check: matches.

**Beats**
- 414.9 "the third tool. Watch Bids Asks ... optimized monitoring" (slide in)
- 421.3 "it only monitors the top of book" / 425.6 "just the absolute best bid and the absolute best ask" (slice plane cuts the top unit)
- 430.5 "the traffic is minimal"; 432.6 "implemented via an exchange's ticker endpoint rather than the full depth endpoint"
- 439.7 pushback: "is it really an order book method?" / 450.5 "like calling a thermometer a weather station" (gag: thermometer vs weather station); 454.7 "It is technically a ticker stream, yes"
- 466.9 "the most economical way to track the best prices across massive numbers of pairs"
- 477.7 "a simple motion sensor on 100 doors instead of those heavy HD cameras" (callback to slide 2 cameras: 100 small sensors light up)
- 493.7 "for an arbitrage bot, that motion sensor is really all you need"; 497.2 "if the top price on exchange A is higher than exchange B"; 502.3 "You don't care about the liquidity sitting 50 levels deep"
- 506.7 "saves tremendous processing resources for both your client machine and the exchange's servers"

## Slide 5: 4. fetchOrderBookWs (One-time Requests). 511.8 to 577.3 (65.5 s)

**Content**
- Title: "H3 — 4. `fetchOrderBookWs` - One-time Requests".
- Left: server stack; a dashed blue arrow passes diagonally through it and out the far side (label with curved arrow "Temporary Teardown"); a glowing blue cube pops out of the side of the stack (label "Orderbook Snapshot").
- Right table:
  - Purpose: | One-time orderbook request via WebSocket (REST-like).
  - Connection type: | Temporary WebSocket (connection closes after receiving data).
  - Data: | Orderbook snapshot.
  - Traffic: | Minimal.
- Amber stamp box: "⚠ **Editorial Flag:** Verify runtime behavior. The assertion that fetchOrderBookWs seamlessly uses and tears down a temporary connection requires live version-pinned testing."

Article check: table matches section 4. The flag is NotebookLM's.

**Beats**
- 511.8 "the fourth and final method ... Fetch Order Book WS"; 516.6 "one-time requests"
- 519.4 "much like a traditional REST API call ... it hands it to you and you're done" (cube pops out)
- 524.9 "it leverages the WebSocket protocol to do it much faster" (host claim, not in article; keep neutral)
- 528.7 "you have to be totally paranoid"; 533.1 "a temporary connection that closes immediately after receiving the data" (dashed line fades)
- 540.5 "verify whether Fetch Order Book WS really uses a temporary connection under the hood" (flag stamp)
- 552.4 "zombie connections"; 556.4 "a loop that fetches data every minute ... An hour later, you have 60 silent WebSockets open" (count up to 60 ghost pipes); 564.2 "silently eating your memory until your server crashes"
- 571.3 "Always verify the tear down."

## Slide 6: Important Differences and Method Comparison. 577.3 to 711.5 (134.2 s)

**Content**
- Title: "H2 — Important Differences and Method Comparison". Whole slide light grey with grid.
- Left column "H3 — Persistent vs Temporary Connections": two boxes with dark header strips:
  - "**Watch Methods**" / "Create persistent connection, receive streaming real-time updates."
  - "**Fetch Methods**" / "Use WebSocket only for one-time request, similar to REST API."
- Right column "H3 — Traffic Comparison", subhead "**The Traffic Math** (Article Assertion for 100 pairs):". Panel: a tiny isometric cube with arrow, label "`watchBidsAsks`: ~100 records (1 bid/ask per pair). **Minimal Traffic.**" vs a huge isometric gridded cube, label "`watchOrderBookForSymbols`: ~100,000–1,000,000 records (100–1000 levels × 2 sides × 100 pairs). **Heavy Traffic.**"
- Result line: "Result: The article claims `watchBidsAsks` is 100–1000 times more economical."

**NotebookLM / article arithmetic error (flag):** 100–1000 levels × 2 sides × 100 pairs = **20,000–200,000** price levels, not 100,000–1,000,000. The slide copies the article's own miscount, and the hosts read it aloud at 645.6. Top of book for 100 pairs is 100 records (one bid/ask pair each) or 200 levels. The ratio is still about 100–1000× (200 vs 20,000–200,000, or 100 vs 10,000–100,000 bid/ask rows), so keep "100–1000×" but redraw the big number as "~20,000–200,000 levels (100–1000 levels × 2 sides × 100 pairs)". If the redraw must stay on article wording, keep the formula visible and drop the bare 100,000–1,000,000 figure.

**Sub-scenes** (134 s, split)
- 6a 577.3 to 615.8, persistent vs temporary: 577.3 "the important differences and method comparisons"; 584.5 "persistent versus temporary connections"; 590.5 "the three watch methods ... continuous pipeline" / 595 "a constant event stream" (Watch box); 599.8 "the rest-like one-time request of the fetch method ... grab-and-go" (Fetch box); 610.5 "Event-driven streams versus procedural requests are two different beasts".
- 6b 615.8 to 711.5, traffic math: 615.8 "the traffic comparison"; 629.3 "Let's say you want to monitor 100 pairs" (100 pairs grid); 631.7 "watch bids asks, you are getting about 100 records per update cycle" (tiny cube); 640.5 "the same 100 pairs with the full depth bulk method" / 645.6 "roughly 100,000 to 1 million records" (giant cube; see correction); 653.9 "multiplied by 100 to 1,000 levels deep, multiplied by two sides of the book, multiplied by 100 pairs" (build the formula factor by factor: 653.9 levels, 659.6 sides, 661.5 pairs); 663.3 "potentially updating multiple times a second"; 667.0 "100 to 1,000 times less traffic" (Result line); 675.0 "the hidden cost of data greed"; 681.6 "an illustrative assertion attributed to the article" / 689.9 "requires your own arithmetic and measurement review" (dated-claim stamp); 702.7 "Some exchanges batch their updates. Some send them tick by tick."

## Slide 7: Practical Case: Gate.io and Reality vs Documentation. 711.5 to 794.0 (82.5 s)

**Content**
- Titles: "H2 — Practical Case: Gate.io and Reality vs Documentation" / "H3 — Test: `watchOrderBookForSymbols` on Gate.io". Left half white grid, right half grey grid.
- Left, light code panel:
  ```javascript
  const symbols = [
    '1CAT/USDT:USDT',
    '1INCH/USDT:USDT',
    'A8/USDT:USDT',
    'AAVE/USDT:USDT'
  ];
  const orderbooks = await
  exchange.watchOrderBookForSymbols(symbols);
  ```
  Article has 10 symbols (all USDT-margined perpetuals): `'1CAT/USDT:USDT', '1INCH/USDT:USDT', 'A8/USDT:USDT', 'AAVE/USDT:USDT', 'ACE/USDT:USDT', 'ACH/USDT:USDT', 'ACT/USDT:USDT', 'ACX/USDT:USDT', 'ADA/USDT:USDT', 'ADX/USDT:USDT'`, created with `const exchange = new ccxt.pro.gateio();` and wrapped in `try { ... console.log('Success!', orderbooks); } catch (error) { console.error('Error:', error.message); }`.
- Right, black terminal panel with thin red border: "**NotSupported:** gateio watchOrderBookForSymbols() is not supported yet" ("NotSupported:" in red, rest white mono).
- Center bordered box: "**The Lesson:** Documentation declaration ≠ functionality."
- Bottom amber flag: "⚠ **Editorial Flag:** This Gate.io NotSupported failure must be treated strictly as a dated historical example of documentation gaps, not a declaration of Gate.io's current capabilities."

Article check: matches (article: "Attempting to subscribe to 10 popular trading pairs", actual result `NotSupported: gateio watchOrderBookForSymbols() is not supported yet`, lesson "Even if a method is declared in API documentation, this doesn't guarantee it works").

**Beats**
- 711.5 "from theory to a practical case. What happens when the documentation straight up lies to you?"
- 719.2 "The article highlights Gate.io to show this exact clash between reality and documentation"
- 730.8 "the author ran a live test"; 737.6 "a subscription to 10 popular pairs, things like 1CAT/USDT, AAVE/USDT, ADA/USDT" (symbols type in)
- 747.2 "They write the code perfectly to spec. They run it." (cursor hits enter ~751)
- 751.1 "the catch block immediately fires"; 755.1 "Not supported" / 756.5 "Gate.io watch order book for symbols is not supported yet" (terminal error prints, red flash)
- 760.5 "The official docs imply you can do it. The live web socket says absolutely not." (Lesson box)
- 765.5 "must remain a dated example from June 2025" (flag); 780.4 "They may have fully implemented it since"
- 787.4 "API documentation simply does not guarantee actual exchange behavior in production"

## Slide 8: Automated Audit: What's Actually Supported / Audit Results. 794.0 to 947.7 (153.7 s)

**Content**
- Left title "H2 — Automated Audit: What's Actually Supported"; right title "H3 — Audit Results (Fragment of Top Exchanges)".
- Left code panel:
  ```javascript
  // The Audit Script Logic:
  const hasWatchOrderBook = typeof
  exchange.watchOrderBook === 'function';
  const hasWatchBidsAsks = typeof
  exchange.watchBidsAsks === 'function';
  const hasWatchOrderBookForSymbols = typeof
  exchange.watchOrderBookForSymbols ===
  'function';
  ```
  Article's full script also loops `for (const exchangeId of ccxt.pro.exchanges)`, creates `new ccxt.pro[exchangeId]()`, records `hasSpot = exchange.has['spot']`, `hasFutures = exchange.has['future'] || exchange.has['swap']`, pushes results and `console.table(results)`.
- Right table "Exchange | Spot (OB/BA/OBS) | Futures (OB/BA/OBS)", 8 rows: binance, bybit, okx, gateio, mexc, kucoin, huobi, bitget, every cell "✓ / ✓ / ✓". (OB = watchOrderBook, BA = watchBidsAsks, OBS = watchOrderBookForSymbols.)
- A large tilted amber rubber stamp "VERIFICATION WARNING" across the table.
- Bottom amber flag: "⚠ **Crucial Editorial Flag:** The 75+ exchange audit establishes JavaScript method presence only. It does NOT verify successful subscription, market type routing, or survival under live load testing."

Article check: matches. Note the punchline the redraw should land: the article's own table shows gateio ✓/✓/✓ for OBS, the same method that threw NotSupported on slide 7. The article says so explicitly ("The script only checks for method presence in the JavaScript object, not actual support on the exchange side ... as we saw with the Gate.io example").

**Sub-scenes** (154 s, split)
- 8a 794.0 to 859.1, the audit: 794.0 "if the docs are untrustworthy, how did the author actually figure out what works"; 806.3 "Automated audits and discovering what's actually supported" (slide in); 814.5 "a massive script to audit over 75 CCXT integrated exchanges" (counter 0 to 75+); 821.3 "iterate through the exchanges and check for the presence of these method functions"; 826.7 "typeof exchange.watchOrderBook equals function" (code line highlights); 833.6 "it also checked market type support ... spot, future, or swap"; 840.5 "a fragment of these audit results"; 848.5 "Binance, Bybit, OKX, Gate.io, MEXC, KuCoin, Huobi, and Bitget" (rows fill, ticks pop in); 854.6 "Spot, check, futures, check, swap, check" (column ticks); 857.3 "It looks very reassuring".
- 8b 859.1 to 947.7, the catch: 861.8 "If the script is just doing a typeof check on the JavaScript object, that's just checking the CCXT wrapper"; 871.6 "You hit the nail on the head" / 873.2 "the most critical flag of this entire deep dive" (VERIFICATION WARNING stamp slams ~877); 883.7 "only establishes method presence in the JavaScript object"; 889.5 "It's like checking the menu, not the kitchen" (gag: menu vs kitchen); 900.8 "does not mean calling that function results in a successful subscription"; 912.7 "remember the Gate.io example" / 919.0 "That function probably had a check mark ... but it still threw a not supported error" (zoom on gateio OBS ✓, it cracks into the red NotSupported); 925.8 "Only a live, version-pinned subscription test with real data can establish actual support"; 936.7 "checking if a car has a steering wheel attached ... never turning the engine on".

Host wording to fix: 854.6 "spot, check, futures, check, swap, check" implies three market columns; the table has two (Spot, Futures; futures = future or swap) with three methods each. Draw two column groups.

## Slide 9: Practical Recommendations for Method Selection / For Different Use Cases. 947.7 to 1029.1 (81.4 s)

**Content**
- Titles: "H2 — Practical Recommendations for Method Selection" / "H3 — For Different Use Cases".
- Flowchart (light grey hexagons, black "Use ..." pills with white mono text):
  - Center rounded box "User Intent & Requirements".
  - Up: hexagon "Arbitrage / 100+ Pairs (Minimal traffic for best prices)" → pill "Use `watchBidsAsks`".
  - Right: hexagon "Market Making / Single Pair (Full market depth)" → pill "Use `watchOrderBook`".
  - Down: hexagon "Multi-Pair Full Depth" → pill "Try `watchOrderBookForSymbols`" → elbow arrow → pill "Fallback: multiple `watchOrderBook` streams (monitor limits)".
  - Left: hexagon "Initialization / Snapshots" → pill "Use `fetchOrderBookWs` or REST".
  - Slide also draws stray connectors from the Initialization hexagon up to Arbitrage and down to Multi-Pair: layout artifact, drop them (all four branches start from the center box).

Article check: matches "Practical Recommendations for Method Selection" cases 1 to 4 (100+ pairs, arbitrage bots: watchBidsAsks; one pair full depth, market making: watchOrderBook; several pairs full depth: try watchOrderBookForSymbols, fallback multiple watchOrderBook, consider exchange connection limits; one-time: fetchOrderBookWs or REST, for snapshots or initialization).

**Beats**
- 947.7 "how should you actually build your system?"; 951.7 "practical recommendations for method selection" (center box)
- 954.8 "ruthlessly matching the tool to your specific use case"
- 959.5 "an arbitrage bot across say 100 plus pairs"; 970.1 "The definitive recommendation here is watch bids asks" (up branch)
- 974.0 "a market maker ... providing liquidity on a single pair, maybe Ethereum to Tether"; 988.5 "the classic watch order book" / 990.8 "full market depth for that one pair" (right branch)
- 994.2 "full depth, but for several pairs, say 10 or 20"; 1000.5 "start by trying watch order book for symbols" (down branch); 1008.1 "If you get that not supported error, your fallback ... multiple individual watch order book calls" (fallback pill); 1015.4 "keep an eagle eye on your connection limits"
- 1019.6 "a one-time retrieval ... your system just booted up and needs a baseline snapshot" / 1026.8 "fetch order book WS" (left branch)

## Slide 10: Performance Optimization. 1029.1 to 1105.3 (76.2 s)

**Content**
- Title: "H3 — Performance Optimization".
- Left panel "**Bad: Chaotic Individual Connections**", red ✕ badge: circle "Client" on the left, box "Exchange Server" on the right, dozens of tangled curved arrow lines between them.
- Right panel "**Good: Multiplexed with Fallback Loop**", green ✓ badge: "Client" circle and "Exchange Server" box joined by one thick blue bar labelled "Multiplexed Connection"; a blue line loops over the top from Client to Server; below, a dashed blue line from Client to a broken-chain-link icon, then solid up to the server, label "Fallback Promise.all Loop".
- Bottom box: "**Depth Management Strategy:** Truncate data volume aggressively by limiting orderbook depth on the request." with mono `const orderbook = await exchange.watchOrderBook('BTC/USDT', 20); // only 20 levels`
- Article code for Bad/Good (not on slide, useful for a code overlay):
  ```javascript
  // Bad: creating multiple connections
  const symbols = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT'];
  const orderbooks = await Promise.all(
      symbols.map(symbol => exchange.watchOrderBook(symbol))
  );
  // Good: one connection for all pairs (if supported)
  try {
      const orderbooks = await exchange.watchOrderBookForSymbols(symbols);
  } catch (error) {
      // Fallback to individual subscriptions
      const orderbooks = await Promise.all(
          symbols.map(symbol => exchange.watchOrderBook(symbol))
      );
  }
  ```

Accuracy note: the article frames separate `watchOrderBook` calls as "multiple connections". In CCXT Pro, separate subscriptions on one exchange instance usually share one WebSocket per endpoint URL, so the "dozens of tangled sockets" picture is an illustration of the article's framing, not a literal CCXT behavior. The hosts hedge correctly at 1060.4 ("verify whether multi-symbol methods actually multiplex one connection on each specific venue"). Keep the visual, avoid a caption saying "each call opens a new socket".

**Beats**
- 1029.1 "let's talk performance optimization"; 1032.0 "the nightmare of chaotic individual connections" (left panel tangles) / 1036.3 "the elegance of multiplexing" (right panel)
- 1041.7 "one single underlying TCP connection to stream WebSocket data for multiple different pairs" / 1048.3 "shoving it all through one pipe" (thick bar)
- 1051.1 "vastly more efficient ... than opening 50 completely separate sockets"
- 1056.3 "earlier we talked about fallback code" (broken link + Promise.all loop); 1060.4 "verify whether multi-symbol methods actually multiplex one connection on each specific venue"; 1068.7 "Do not universalize the article's example"; 1076.6 "Some might fake multiplexing in the library, but actually open 50 sockets under the hood" (host speculation)
- 1082.5 "limiting depth to save traffic"; 1088.2 "pass depth equals 20 as an argument" (code line types in); 1097.9 "only get the top 20 levels of the book instead of a 1,000 level avalanche" (stack shrinks 1000 to 20)

## Slide 11: Error Handling and Connection Recovery. 1105.3 to 1163.0 (57.7 s)

**Content**
- Title: "H2 — Error Handling and Connection Recovery".
- Left: a huge black circular arrow loop. Inside, hexagons growing in size left to right with thick black arrows between them: "Retry 1" → "Retry 2" → "Retry 2" → (crossing into the right half) "Retry 3"; over the arrows the label "1000 * Math.pow(2, retries)" (twice).
- Right top dark box: "**Premise:** WebSockets drop inherently; resilient connection recovery with exponential backoff is mandatory."
- Right bottom black code panel:
  ```javascript
  async function robustWatchOrderBook(exchange, symbol, maxRetries = 3) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const orderbook = await exchange.watchOrderBook(symbol);
        retries = 0; return orderbook;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) throw new Error('Failed');
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }
  }
  ```

**NotebookLM errors (flag):**
- Hexagon labels are duplicated: "Retry 2" appears twice. Correct sequence: Retry 1 → Retry 2 → Retry 3 (maxRetries = 3).
- The slide shortens the throw message. Article: ``throw new Error(`Failed to subscribe after ${maxRetries} attempts`);`` and logs ``console.error(`Subscription error (attempt ${retries}):`, error.message);`` in the catch.
- The hosts (1154.7 to 1159.9) say "wait one second ... two seconds ... four seconds". From the code, `retries` is incremented before the wait, so the waits are 1000·2¹ = **2 s** after the first failure and 1000·2² = **4 s** after the second; the third failure throws, no third wait. Use "2 s, 4 s, give up" on screen.

**Beats**
- 1105.3 "even with the perfect multiplexed, depth limited method, connections are going to drop"; 1110.6 "The internet is messy. Servers reset."
- 1113.0 "error handling and connection recovery" (slide in); 1116.0 "exponential backoff retry logic"
- 1124.9 "giving a cranky overloaded system some breathing room instead of just violently hammering it"; 1134.8 "a machine gun of reconnect requests will just get your IP address permanently banned"
- 1145.5 "a maximum of three retries" (three hexagons); 1149.2 "multiplies the wait time by powers of two" (formula label); 1154.7 / 1156.6 / 1158.4 wait steps (animate 2 s then 4 s per correction, hexagons grow); 1159.9 "You are exponentially backing off"

## Slide 12: Data Quality Monitoring. 1163.0 to 1284.1 (121.1 s)

**Content**
- Title: "H2 — Data Quality Monitoring".
- A horizontal blue pipe runs across the slide through three grey steel gate machines (each with ✓ dial, gear, ✕ dial); white flow arrows inside the pipe. Gate 1 ejects a dark arrow (reject); gates 2 and 3 eject an arrow to a yellow ⚠ triangle.
  1. "**1. Structure**": "Reject if missing core components: `!orderbook.bids || !orderbook.asks`"
  2. "**2. Freshness**": "Alert on stale data. Code threshold: `dataAge > 10000` (10 seconds older than timestamp)"
  3. "**3. Spread Logic**": "Alert on impossible market states (crossed spread): `bestBid >= bestAsk`"
- Code panel (use the article version):
  ```javascript
  function validateOrderBook(orderbook) {
      // Check basic structure
      if (!orderbook.bids || !orderbook.asks) {
          throw new Error('Invalid orderbook structure');
      }
      // Check data freshness
      const now = Date.now();
      const dataAge = now - orderbook.timestamp;
      if (dataAge > 10000) { // older than 10 seconds
          console.warn('Stale orderbook data:', dataAge, 'ms');
      }
      // Check price logic
      const bestBid = orderbook.bids[0] ? orderbook.bids[0][0] : 0;
      const bestAsk = orderbook.asks[0] ? orderbook.asks[0][0] : 0;
      if (bestBid >= bestAsk && bestBid > 0 && bestAsk > 0) {
          console.warn('Crossed spread:', { bestBid, bestAsk });
      }
  }
  ```

**NotebookLM errors (flag):** slide code has a typo `console.warn('Crossed spread:'', ...)` (stray quote) and shortened messages ('Invalid structure', 'Stale data:'); use the article code above. The caption "10 seconds older than timestamp" is garbled: it means `Date.now() - orderbook.timestamp > 10000 ms`, i.e. the book is more than 10 s old.

**Sub-scenes** (121 s, split)
- 12a 1163.0 to 1226.8, structure + freshness: 1163.0 "let's assume the backoff works ... data is flowing again"; 1171.5 "data quality monitoring" (pipe + gates draw); 1174.5 "receiving JSON packets doesn't mean the data inside them is actually reflecting reality"; 1184.4 "mandatory validation checkpoints"; 1187.6 "First, you check the fundamental structure ... arrays labeled bids and asks" (gate 1); 1194.0 "if the exchange changed their schema overnight and renamed it buyers and sellers, your code will silently fail" (a packet labelled buyers/sellers gets rejected); 1202.9 "Second is data freshness" (gate 2); 1207.9 "flags any data older than 10,000 milliseconds" / 1213.4 "Or 10 seconds" (clock); 1214.9 "a 10 second old order book ... ghost liquidity that vanished nine seconds ago".
- 12b 1226.8 to 1284.1, crossed spread: 1226.8 "finally, price logic. The dreaded crossed spread check" (gate 3); 1237.4 "if your local system shows the best bid is greater than or equal to the best ask"; 1249.9 "If a buyer is willing to pay $101 and a seller is sitting right there asking for $100" (draw bid 101 above ask 100); 1256.1 "the matching engine would have matched them instantly"; 1264.3 "if your local order book state shows that crossed spread, it implies that you dropped a packet"; 1271.8 "You received the new bid, but your socket dropped the message saying the ask was executed"; 1276.8 "your local state is now corrupted"; 1280.9 "dump the book and fetch a fresh snapshot" (book clears, fetchOrderBookWs cube refills it).

Host claim beyond the article: the article's check only `console.warn`s on a crossed spread; the "dump the book and resync" advice (1280.9) and "hard stop" (1237.4) are the hosts' (sound practice, fine to show as a recommendation).

## Slide 13: Conclusions and Best Practices. 1284.1 to 1375.2 (91.1 s)

**Content**
- Title: "H2 — Conclusions and Best Practices". Five rows, grey icon left, bold H3 heading, one-line body:
  1. Icon: document with red slash. "H3 — 1. Don't Rely Only on Documentation" / "Test real data; method presence in an API wrapper ≠ functionality."
  2. Icon: wrench and screwdriver with gear. "H3 — 2. Choose Method for the Task" / "Match task to method (`watchBidsAsks` for bulk, `watchOrderBook` for detail)."
  3. Icon: one small square → arrow → big 3×5 grid. "H3 — 3. Optimize Traffic" / "1000x efficiency gains are geometrically possible by selecting the correct endpoint."
  4. Icon: shield. "H3 — 4. Prepare for Failures" / "Exponential backoff and structure/freshness quality checks are non-negotiable."
  5. Icon: weight bending a beam. "H3 — 5. Test at Production Loads" / "API behavior differs dramatically under live load versus singular test requests."

Article check: matches the article's 5 conclusions (article item 2 also lists `fetchOrderBookWs` for one-time requests; item 3 says watchBidsAsks "can be 1000x more efficient"). "Geometrically possible" is NotebookLM wording; prefer the article's "up to 1000x".

**Beats**
- 1284.1 "the homestretch"; 1286.2 "our conclusions and best practices" (slide in)
- 1297.0 rule 1 "don't rely only on documentation"; 1304.3 "a dedicated paper trading environment that actually mirrors the live API endpoints" (host addition)
- 1314.4 rule 2 "choosing the right method for the task"; 1317.4 "so many developers just use watch order book for everything"
- 1333.9 rule 3 "optimizing traffic"; 1339.2 "watch bids asks can be up to a thousand times more efficient"; 1345.5 "If you don't need the depth, don't pay the bandwidth tax"
- 1349.4 rule 4 "preparing for failures"; 1358.6 "exponential backoff and crossed spread checks isn't optional"
- 1365.8 rule 5 "testing at production loads"; 1368.5 "under heavy load versus ... pinging it from your laptop in a coffee shop"

## Slide 14: Future of WebSocket APIs for Orderbooks / Conclusion. 1375.2 to 1443.6 (68.4 s)

**Content**
- Titles: "H2 — Future of WebSocket APIs for Orderbooks" / "H2 — Conclusion".
- Left: a cloud of scattered blue/grey square tiles funnels into a glowing glass prism and exits as an ordered segmented blue arrow with white chevrons (chaos → standardized stream).
- Right box "H3 – Industry Vectors": "Moving toward:" ➢ Method unification between venues ➢ Accurate living documentation ➢ Efficient data compression protocols ➢ Improved debugging tools.
- Right box "H3 – Final Synthesis": "CCXT significantly simplifies integration by unifying interfaces, but the underlying reality remains vastly more complex than the documentation suggests. Reliable data infrastructure requires localized testing, rigorous monitoring, and right-sizing the subscription method to the exact venue limit."

Article check: Industry vectors match the article's four bullets (method unification, improved documentation with real examples, more efficient compression protocols, better debugging tools). Synthesis matches the article conclusion ("CCXT significantly simplifies the work by unifying interfaces, but reality is still more complex than documentation"; "A successful trading system is not just correct algorithms, but also reliable data infrastructure").

**Beats**
- 1375.2 "the future of WebSocket APIs for order books"; 1386.4 "method unification"; 1390.4 "better data compression protocols"; 1395.3 "improved real world documentation"; 1401.1 "significantly better debugging tools" (bullets tick in on each)
- 1406.5 "the core conclusion of our deep dive"; 1409.6 "a powerful wrapper like CCXT brilliantly simplifies how you write your code" / 1416.3 "the reality of the network is always more complex than the documentation"
- 1421.9 "rock solid, resilient data infrastructure. Not just a clever trading algorithm"
- 1429.3 "If your data pipeline is broken ... the smartest AI trading model in the world will still hemorrhage money"; 1437.0 "A brilliant algorithm fed garbage data will only make incredibly precise, terrible decisions"

## Slide 15: Useful Links / Citation. 1443.6 to 1548.9 (105.3 s)

**Content**
- Left "H2 — Useful Links": "- CCXT Documentation (github.com/ccxt/ccxt)"; "- WebSocket API Best Practices (docs.ccxt.com/#/ccxt.pro.manual)"; "- Demo Script Sources (github.com/suenot/ccxt-orderbooks-example/)".
- Right "H2 — Citation", mono box:
  ```bibtex
  @software{soloviov2025ccxtprowebsocketorderbook,
    author = {Soloviov, Eugen},
    title = {CCXT: How WebSocket Orderbook Methods Really Work},
    year = {2025},
    url = {https://marketmaker.cc/en/blog/post/ccxt-pro-websocket-orderbook-methods},
    version = {0.1.0},
    description = {Detailed breakdown of CCXT WebSocket methods for orderbooks: watchOrderBook, watchBidsAsks, watchOrderBookForSymbols. Real tests on 75+ exchanges.}
  }
  ```
- Bottom grey box (NotebookLM boilerplate, drop when redrawing): "Historical, numerical, research, and mutable assertions (including the 75+ exchange count and specific traffic ratios) are dated article claims pending primary-source review. Formula and software risk reviews are pending. Target-channel duplicates have not been checked."

Article check: links and bibtex match the article. The full docs URL in the article is `https://docs.ccxt.com/#/ccxt.pro.manual?id=public-methods`.

**Sub-scenes** (105 s, split)
- 15a 1443.6 to 1493.8, links + attribution: 1443.6 "here are the useful links cited in the article"; 1449.7 "The official CCXT documentation, the WebSocket API best practices guide" / 1455.7 "and the demo script sources" (three links tick in); 1460.2 "manually review method signatures, fee structures, subscription limits, and version behavior"; 1476.5 "from author Eugen Soloviov in the published article CCXT, How WebSocket Order Book Methods Really Work, published in 2025, version 0.1.0 on marketmaker.cc" (citation box types).
- 15b 1493.8 to 1548.9, outro: 1493.8 "quite the journey mapping this swamp" (callback to the swamp); 1506.9 "that automated 75 exchange audit"; 1510.9 "a single checkmark in an automated script can hide a completely non-functional API endpoint" (one ✓ cracks); 1520.1 "how much of global algorithmic trading is built on foundational assumptions that have never actually been stress tested"; 1533.7 "highly tuned sports cars straight onto that dirt path in the swamp" (sports car into the swamp); 1542.3 "Thank you for joining us"; 1544.2 "Keep questioning the documentation, keep testing your live connections, and we'll see you next time" (end card).

---

## Timing notes

`sync_slides.py` (default params) degenerated ("showed 7/15 slides, longest held 89%") and fell back to an even 103.3 s split (saved as `timeline_auto_evensplit.json`). Wrong for most slides (for example slide 8 audit: auto 722.7 s vs real 794.0 s; slide 13: auto 1238.9 vs 1284.1).

`slide_starts.json` is set by hand from the hosts announcing each section; the deck follows the article section order 1:1.

| Slide | Start | Cue | Confidence |
|---|---|---|---|
| 1 Title / Intro | 0.0 | cold open | high |
| 2 watchOrderBook | 198.9 | "moves us perfectly into our overview of key methods" | high (method 1 itself named at 219.1; 198.9 to 219.1 is the "four methods" overview, which fits the slide's H2) |
| 3 watchOrderBookForSymbols | 302.1 | "our second method, which is watch order book for symbols" | high |
| 4 watchBidsAsks | 414.9 | "let's look at the third tool. Watch Bids Asks" | high |
| 5 fetchOrderBookWs | 511.8 | "the fourth and final method in the toolkit is Fetch Order Book WS" | high |
| 6 Differences / traffic | 577.3 | "Now we get to the important differences and method comparisons" | high (574.5 "we have our four distinct tools" is the bridge) |
| 7 Gate.io case | 711.5 | "let's move from theory to a practical case" | high |
| 8 Automated audit | 794.0 | "if the docs are untrustworthy, how did the author actually figure out what works" | medium-high (section named at 806.3; 794.0 is the bridge question) |
| 9 Recommendations | 947.7 | "So given all these pitfalls, how should you actually build your system?" | high (section named at 951.7) |
| 10 Performance | 1029.1 | "Okay, let's talk performance optimization" | high |
| 11 Error handling | 1105.3 | "even with the perfect multiplexed depth limited method, connections are going to drop" | medium-high (section named at 1113.0; 1105.3 is the bridge) |
| 12 Data quality | 1163.0 | "let's assume the backoff works ... data is flowing again" | medium-high (section named at 1171.5) |
| 13 Conclusions | 1284.1 | "We are coming into the homestretch ... conclusions and best practices" | high |
| 14 Future / Conclusion | 1375.2 | "Which naturally leads us to look at the future of WebSocket APIs" | high |
| 15 Links / Citation | 1443.6 | "here are the useful links cited in the article" | high |

Slides longer than ~90 s are split into sub-scenes above: 1 (3), 2 (2), 3 (2), 6 (2), 8 (2), 12 (2), 15 (2). Slide 4 (97 s) and slide 13 (91 s) run as single scenes with dense beats.
