# complex-arbitrage-execution-rust (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts, H1 = curious host, H2 = expert host),
12-slide NotebookLM deck. Article: `marketmaker-cc-landing/src/content/blog/complex-arbitrage-execution-rust.en.md` ("Complex Arbitrage Execution in Rust: From Nanoseconds to Atomic Multi-Legs", Part 6, the last part, of "Complex Arbitrage Chains Between Futures and Spot", 2026-02-28, suenot). The article is short (~650 words); the hosts add their own analogies and caveats.

- Audio: `input/notebooklm-sources/complex-arbitrage-execution-rust/en/audio.m4a`, 915.84 s (15:15.8), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`). Timestamps below are segment or word starts in seconds, accurate to roughly 0.5 s.
- Timing: `slide_starts.json` + `timeline.json` (manual, see "Timing notes"). **Narration is not in deck order at the start:** the cold open narrates the conductor/orchestra framing of slide 2 before the title (slide 1) is read, then returns to slide 2 for the "bytes, cache lines, 2-6 ms" blueprint. `timeline.json` therefore has 13 segments, each with an explicit 0-based `slide`; `slide_starts.json` lists the segment starts (segment i shows `timeline[i].slide`).
- Slide PNGs: `slides/slide_001.png` ... `slide_012.png` (3823x2134, not committed, regenerate with `pdf_to_images.py --dpi 200`).

Shared visual language of the deck: cream/off-white blueprint paper with a light grid, navy (#13213F) text and diagrams, burnt orange (#E0622A) as the single accent (the "fast path", the Rust engine, highlighted code tokens), dark charcoal code windows. Bold grotesque headlines that state the slide's claim as a sentence; small mono section tags ("1. Latency Optimization: Beyond the Kernel"). Every slide from 4 on carries a "*Disclaimer: ..." footer: drop the footers, keep one short "claims from source, not benchmarked" tag where a number is shown. "Gemini Notebook" watermark (do not redraw).

The hosts' running metaphors: conductor of a five-exchange orchestra (0.0); OS kernel as a bureaucratic middle manager stamping paperwork (127.5); io_uring as two revolving doors (198.3); mutex as the single bathroom key in a busy coffee shop (364.8); LMAX Disruptor as a sushi conveyor belt (465.5); looking at a star whose light is old (525.1); Kyle's lambda as measuring your own splash before you jump (561.0); circuit breakers as the emergency brakes on a bullet train (695.6).

Transcript quirks (Whisper mis-hearings, do not caption verbatim): "Steep Dive" (52.8) = Deep Dive; "cashlines" / "cash line" / "fast local cash" = cache lines / cache; "IOU ring" = io_uring; "U ring reader" = `UringReader`; "VEC angle bracket VEC angle bracket U8" = `Vec<Vec<u8>>`; "SIMD JSON" = simd-json; "cross beam skip list" = crossbeam-skiplist; "log in" (382.6, 388.1) = log n; "atomic U64" = `AtomicU64`; "reverse U64" = `Reverse<u64>`; "Elmax Disruptor" = LMAX Disruptor; "Instant L.O.B" = Instant LOB; "AmiHood Ilicu" (566.7) = Amihud ILLIQ; "emergency breaks" / "tune your own breaks" = brakes; "AP-NORTHYS-1" (771.4) = ap-northeast-1; "I should know" (858.4) = I should note; "It's arithmetic" (820.3) = its arithmetic.

---

## Slide 1: Title. segment 52.8 to 61.1 (8.3 s)

**Content**
- Blueprint: five boxes "EXCHANGE ALPHA API: v3.2.1", "EXCHANGE BETA API: v4.0.0", "EXCHANGE GAMMA API: v2.1.5", "EXCHANGE DELTA API: v1.9.8", "EXCHANGE EPSILON API: v3.5.2", wired into a glowing orange chip "CENTRAL ARBITRAGE CORE / ENGINE: RUST v1.86.0 / PROCESSING: ATOMIC MULTI-LEG".
- Title "Complex Arbitrage Execution in Rust"; subtitle "From Nanoseconds to Atomic Multi-Legs (Part 6 of Complex Arbitrage Chains Between Futures and Spot)". Tag "suenot | 2026-02-28".

Article check: matches the article title, series, author and date. The API version numbers and "RUST v1.86.0" are decorative inventions; "ATOMIC MULTI-LEG" contradicts the article's own point that multi-leg execution is never atomic (see slide 9). Use "MULTI-LEG" only.

**Beats**
- 52.8 "welcome to the deep dive"; 54.0 "part six of a really fascinating series on complex arbitrage chains between futures and spot" (title reveal over the five-exchange blueprint)

## Slide 2: One false note turns an arbitrage opportunity into a vanished price. 0.0 to 52.8, then again 61.1 to 102.5 (52.8 s + 41.4 s)

**Content**
- Headline "One false note turns an arbitrage opportunity into a vanished price."
- Left: "The Orchestra: Managing five exchanges simultaneously requires absolute harmony." "The Reality: A filled leg on one exchange combined with a vanished price on another guarantees a loss." "The Blueprint: We must descend to the level of bytes, cache lines, and atomic operations to submit orders within 2-6 ms."
- Right: EXCHANGE 1 ... EXCHANGE 5 feeding a "RUST ENGINE" box that fans out to ORDER BOOK MANAGER → RISK CALCULATOR → EXECUTION ROUTER. Below, a three-segment log axis: 0 to 10 ms | 0 to 1000 μs | 0 to 500 ns, with a "2-6 ms Total Latency" bracket.

Article check: matches the article's opening (conductor of five exchanges; "a filled leg on one exchange and a vanished price on another"; "from market data reception to order submission in 2-6 ms").

**NotebookLM errors (flag):** the "2-6 ms Total Latency" bracket sits over the **nanosecond** segment (0 to 500 ns) of the axis. 2-6 ms belongs on the millisecond segment; the nanosecond segment is where nothing in this pipeline lives (the fastest stage is 2-10 μs). Redraw the axis with the bracket on 2 to 6 ms. "Guarantees a loss" is stronger than the article ("turns into a loss"); fine as rhetoric, soften to "turns into a loss".

**Host error (flag):** 85.5 to 96.5 "a blink of an eye takes about 300 milliseconds ... 50 to 100 times faster than that blink". 300 / 6 = 50 and 300 / 2 = 150, so 2-6 ms is 50 to 150 times faster. Caption "~50-150x faster than a blink".

**Beats, first visit (0.0 to 52.8)**
- 0.0 "Imagine ... you are a conductor"; 6.7 "five different cryptocurrency exchanges ... leading them all simultaneously" (conductor before five exchange boxes; "The Orchestra")
- 14.5 "every market data feed and every order ... has to play its part perfectly"; 24.4 "Not more than a few milliseconds ... between the very first note and the very last"
- 29.0 "One false note, say a filled leg on one exchange and a vanished price on another" (one leg turns green, the other price vanishes; "The Reality"); 34.6 "instantly turns into a financial loss"
- 42.1 "a binary outcome ... hit the timing perfectly across multiple venues, or ... exposed to ... massive market risk"

**Beats, second visit (61.1 to 102.5)**
- 61.1 "leaving the high-level trading theory behind"; 63.9 "descending into the absolute microscopic level"; 67.8 "bytes, cache lines, atomic operations" ("The Blueprint")
- 72.5 "the architecture of this ultra-low-latency execution system built in Rust" (Rust engine diagram); 78.7 "from market data reception all the way to order submission in a claimed two to six milliseconds" (axis, bracket on 2-6 ms)
- 85.5 "a blink of an eye takes about 300 milliseconds" (eye blink vs 2-6 ms bar, "~50-150x")

## Slide 3: 1. Latency Optimization: Beyond the Kernel. 102.5 to 175.3 (72.8 s)

**Content**
- Tag "1. Latency Optimization: Beyond the Kernel". Headline "Achieving sub-millisecond precision requires bypassing traditional OS bottlenecks entirely."
- Diagram: three bands USER SPACE / KERNEL SPACE / NIC / FPGA / RDMA HARDWARE. Five grey arrows drop from user space, each blocked with a red ✕ at the kernel boundary and routed down or sideways; one orange arrow goes around the side straight to the hardware.

Article check: the article says only "To achieve sub-millisecond precision, we need to bypass traditional bottlenecks." NIC / FPGA / RDMA are the slide's additions. Note the inconsistency with the article's own budget: the end-to-end target is 2-6 ms, sub-millisecond applies to the internal processing (2-25 μs), not the whole round trip.

**NotebookLM errors (flag):** the diagram is muddled: grey arrows that pass through the kernel get red ✕ marks and continue anyway, and one orange path loops inside kernel space. Redraw: the normal path (user → kernel network stack → NIC) in grey with a "context switch / copy" cost label, and the bypass path (user space → NIC directly) in orange. The tool the article actually uses next (io_uring, slide 4) is **not** kernel bypass, it still uses the kernel network stack (see slide 4).

**Beats**
- 102.5 "to execute across multiple venues that fast ... you can't rely on standard computing processes"; 108.0 "circumventing the operating system itself"; 111.7 "latency optimization, going beyond the kernel" (tag + headline)
- 117.2 "the operating system kernel is an absolute necessity ... manages memory, handles network traffic" (three bands)
- 127.5 "a bureaucratic middle manager ... stopping every single packet ..., checking its paperwork, stamping it" (clerk with a stamp on the kernel band; packets queue)
- 143.6 "those context switches take precious microseconds" (grey path with a timer)
- 147.5 "how do we actually bypass this manager"; 153.1 "going beyond the kernel"
- 160.0 to 172.2 reviewer caveat: "The zero or near zero syscall claims require primary technical review" (small tag)

## Slide 4: 1.1 io_uring and Network Bypassing. 175.3 to 246.9 (71.6 s)

**Content**
- Tag "1.1 io_uring and Network Bypassing". Text "Asynchronous I/O is achieved via shared-memory rings. Once initialized, reading from multiple WebSockets skips traditional system interrupts."
- Ring diagram "io_uring" straddling the USER SPACE / KERNEL SPACE line with orange circulating arrows.
- Code:
  ```rust
  use io_uring::IoUring;

  struct UringReader {
      ring: IoUring,
      buffers: Vec<Vec<u8>>, // Pre-allocated buffers: one per exchange
  }
  ```
- Footer disclaimer (drop).

Article check: code matches. Article: "Once initialized, operations like reading from multiple WebSockets require zero syscalls."

**Article / slide errors (flag):**
- "Zero syscalls" holds only in SQPOLL mode (a kernel thread polls the submission queue); in the default mode io_uring still needs `io_uring_enter` calls, just far fewer of them (batched). Caption "few or zero syscalls (SQPOLL)".
- "Network Bypassing" is misleading: io_uring removes syscall and copy overhead but packets still go through the kernel TCP stack. Real kernel bypass is DPDK, AF_XDP, or Solarflare Onload (the NIC / FPGA / RDMA idea on slide 3).
- The slide's "skips traditional system interrupts" is not the article's claim (syscalls ≠ interrupts); use "skips per-read syscalls".
- WebSockets over io_uring also need TLS and WebSocket framing on top; the snippet is only the buffer layout.
- Code window: the comment wraps onto a new line outside `//` ("buffers: one per exchange" looks like code); keep it on one line.

**Beats**
- 175.3 "the io_uring and network bypassing section"; 181.0 "uses io_uring to handle asynchronous IO" (ring appears); 185.0 "they don't have to wait in line for the manager to stamp the paperwork" (clerk callback, bypassed)
- 188.7 "shared memory rings between your user space program and the kernel"; 198.3 "two revolving doors, a submission queue and a completion queue" (ring splits into SQ and CQ, labelled)
- 203.9 "once this is initialized, operations like reading from multiple web sockets require zero syscalls" (counter "syscalls: 0", tag "SQPOLL mode")
- 213.2 "UringReader struct" (code types in); 223.1 "a vector of byte vectors ... Vec<Vec<u8>> ... one allocated per exchange" (five buffers, one per exchange)
- 232.8 "the system never wastes time asking the computer for new memory on the fly. It just reuses the buckets" (buckets refill in place)
- 240.0 "Getting the raw data past the kernel ... only half the battle"

## Slide 5: 1.2 simd-json and Zero-Copy Deserialization. 246.9 to 340.1 (93.2 s)

**Content**
- Tag "1.2 simd-json and Zero-Copy Deserialization". Headline "Vectorized instructions process incoming exchange JSON in parallel." Side text "Most exchanges rely heavily on JSON. Utilizing simd-json parallel parsing is designed to bypass the traditional sequential drag of data deserialization."
- Pipe "Standard Sequential Parsing": tokens `{ "d at a" : [ , 3` passing one at a time. Pipe "simd-json Parallel Parsing": four parallel rows of the same tokens `{ "d at a" : [ 1 2 , , , 3 ] }`.
- Footer disclaimer (drop).

Article check: article says simd-json "uses SIMD instructions for parallel parsing, providing a 2-4x speedup over standard parsers". The section title mentions zero-copy but the article body does not explain it.

**NotebookLM errors (flag):** the picture suggests four separate JSON messages parsed side by side. SIMD parallelism is **within one message**: 32 or 64 bytes of a single document are classified per instruction (finding quotes, braces, commas at once), then a second stage builds the tape. Redraw: one byte stream with 32-byte blocks highlighted per step vs one byte per step. The tokens split the key "data" into `"d`, `at`, `a"` (nonsense); use real Binance-style fields (`{"e":"depthUpdate","b":[["100.1","2"]]}`). Zero-copy in simd-json means parsing **in place** in a mutable buffer and borrowing strings from it (`&mut [u8]` input), not copying them out.

**Beats**
- 246.9 "once it's in the system, it's just raw text"; 251.3 "simd-json and zero copy deserialization" (tag)
- 256.2 "Most exchanges send data in JSON, which is famously slow to parse"; 261.1 "look at every single curly brace, every comma" / 269.5 "character by character takes an absolute eternity in HFT time" (sequential pipe crawls)
- 275.3 "a shortcut for translating that raw text into usable numbers"; 284.9 "single instruction, multiple data ... for parallel parsing" / 289.1 "reads a bunch of characters at once" (block of 32 bytes lights up per step)
- 293.8 "specialized hardware registers on modern CPUs to swallow massive chunks of the JSON text" (wide SIMD register icon)
- 299.8 "a two to four times speed up over standard parsers" (2-4x bar, tag "source claim")
- 310.1 "zero copy deserialization"; 315.1 "translates the JSON into usable data while it's still sitting in that original network buffer" (fields point back into the buffer, no copy arrows)
- 326.7 "the two to four times speed up and the zero copy claims ... need rigorous benchmarking" (small tag)

## Slide 6: 2. Lock-Free Order Books: No Mutexes. 340.1 to 448.3 (108.2 s)

**Content**
- Tag "2. Lock-Free Order Books: No Mutexes". Headline "Mutexes create massive bottlenecks in HFT environments."
- Text "We utilize crossbeam-skiplist for lock-free order books. Bids use Reverse<u64> ordering, asks use u64, and fields rely on AtomicU64."
- Skip list diagram, levels L1 to L5, with an orange search path.
- Code:
  ```rust
  use std::sync::atomic::{AtomicU64, Ordering};
  use crossbeam_skiplist::SkipMap;

  struct PriceLevel {
      price: AtomicU64,
      total_qty: AtomicU64,
  }

  struct LockFreeOrderBook {
      bids: SkipMap<Reverse<u64>, PriceLevel>,
      asks: SkipMap<u64, PriceLevel>,
  }
  ```

Article check: code matches the article verbatim, including its gaps.

**Article code notes (flag, minor):** `Reverse` needs `use std::cmp::Reverse;` (missing in the article too); `Ordering` is imported but unused in the snippet. Prices as `u64` imply fixed-point ticks (price × 10^k), worth a caption. Skip list search is **expected** O(log n) (probabilistic), not worst case.

**Host errors (flag):**
- 388.1 "O(log n) ... basically means every time you check a value, you cut the search space in half": that is binary search; a skip list gets expected O(log n) by skipping along express lanes (the slide's L1 to L5). Animate the skip list search, not halving.
- 403.1 "Atomic, meaning the hardware itself guarantees it happens in one cycle": wrong. Atomic means indivisible (no other thread sees a half-done write), not single-cycle; atomic read-modify-write ops often cost tens of cycles under contention.
- 346.7 "standard databases are way too slow": nobody uses a database here; the comparison is with a mutex-protected in-memory map.

**Sub-scenes** (108 s, split)
- 6a 340.1 to 413.7, no mutexes + skip list: 340.1 "organized into an order book so the strategy can look at it"; 350.4 "lock free order books, specifically no mutexes" (tag + headline); 354.3 "mutexes or mutual exclusions to stop two threads from writing over the same data"; 364.8 "a single bathroom key in a busy coffee shop ... everyone has to wait in line" (threads queue for one key); 377.8 "a lock free order book ... the crossbeam skiplist crate" (skip list draws); 382.6 "O(log n) search times without mutexes" (orange search path hops down levels); 396.4 "a PriceLevel struct, which uses AtomicU64 types for the price and total quantity fields" (code highlight); 408.2 "Atomic allows safe concurrent access" (two threads update without a key).
- 6b 413.7 to 448.3, Reverse bids + caveat: 413.7 "a skip map structure ... reverse u64 bid ordering"; 418.5 "Why reverse it?" / 424.2 "you want the best bids, the highest prices at the top. Reversing the logic forces the best bids right to the front" (bid ladder flips so the highest bid is first; asks ascending, lowest first); 429.3 "The strategy engine never even has to search for it" (front() pointer); 434.1 "back pressure and crate versions require serious reviewer checks" (small tag).

## Slide 7: 3. LMAX Disruptor: A Lock-Free Ring Buffer. 448.3 to 514.2 (65.9 s)

**Content**
- Tag "3. LMAX Disruptor: A Lock-Free Ring Buffer". Headline "The execution pipeline's heart allows parallel processing with zero copies."
- Text "The structure is pre-allocated and perfectly aligned to 64-byte cache lines, preventing memory fragmentation and eliminating structural delays."
- Isometric ring with orange slots; three modules inside: "OrderBook Updater", "Strategy Engine", "Risk Monitor"; bracket "64 bytes (Cache-Line Alignment)" spanning a large arc of the ring.
- Footer disclaimer (drop).

Article check: matches ("A pre-allocated ring buffer with cache-line alignment (64 bytes) ... OrderBook Updater, Strategy Engine, and Risk Monitor in parallel with zero copies"). LMAX Disruptor: Thompson, Farley et al. (2011), originally Java.

**NotebookLM errors (flag):**
- The "64 bytes" bracket spans about a third of the ring; a cache line is one slot (or the padding around one sequence counter). Put the bracket on a single slot.
- "Preventing memory fragmentation" is not why the Disruptor aligns to cache lines. Alignment and padding prevent **false sharing**: producer and consumer sequence counters on the same 64-byte line would bounce that line between cores. Pre-allocation is what avoids allocation and fragmentation. Caption: "pre-allocated slots: no allocation; padded sequence counters: no false sharing".

**Host note:** 490.5 "Modern CPUs pull data into their fast local cache in exactly 64 byte chunks": true for x86 and most ARM servers; Apple M-series uses 128-byte lines. Fine for the video.

**Beats**
- 448.3 "an unlocked order book, but this is a complex system"; 454.2 "Market data has to feed into strategy and risk algorithms simultaneously ... without just crashing into each other"
- 461.8 "the LMAX Disruptor ... a lock free ring buffer" (ring appears)
- 465.5 "a sushi conveyor belt, where chefs, or in this case, modules, can inspect the plates without actually stopping the belt" (sushi plates on the ring; three modules as chefs)
- 475.8 "the heart of the execution pipeline ... a pre allocated ring buffer"; 486.3 "cache line alignment"; 490.5 "Specifically, 64 bytes" (one slot bracketed)
- 498.0 "forcing the data into perfectly aligned 64 byte chunks, the CPU just scoops it up in one effortless motion"
- 507.7 "through the order book updater, the strategy engine, and the risk monitor in parallel with zero copies" (three modules read the same slot, no copy arrows)

## Slide 8: 4. Slippage Modeling: Layers of Certainty. 514.2 to 584.6 (70.4 s)

**Content**
- Tag "4. Slippage Modeling: Layers of Certainty". Headline "Slippage risk is modeled across three distinct time horizons."
- Table Time Horizon | Mathematical Model | Application: Microseconds | Instant LOB Analysis | Real-time analysis of the Limit Order Book. / Milliseconds | Kyle's Lambda | Price impact per unit of order flow. / Days | Amihud ILLIQ | Long-term liquidity monitoring.
- Footer disclaimer (drop).

Article check: matches. Kyle (1985), λ = ΔP / signed order flow; Amihud (2002), ILLIQ = average of |r_d| / dollar volume_d over days. "Instant LOB analysis" is a description, not a named model.

**Beats**
- 514.2 "speed means nothing if you misjudge the reality of the market"; 520.2 "the moment you decide to trade, the price might have already moved"; 525.1 "like looking at a star ... by the time the light reaches you, it's moved" (star gag)
- 529.3 "slippage modeling using three layers of certainty ... from microseconds all the way out to days" (table frame, horizon column)
- 539.4 "layer one ... Instant LOB analysis ... at the microsecond level" (row 1)
- 549.6 "layer two is Kyle's Lambda ... price impact per unit of order flow at the millisecond level"; 555.9 "how much your own order will bend the market against you" / 561.0 "it measures its own splash before it jumps in" (row 2; splash gag)
- 566.7 "Amihud ILLIQ ... long term liquidity measured over days" (row 3); 572.8 "Why look at days when you're trading in microseconds?" / 575.7 "if the overall macro market is thin and illiquid, your microsecond strategy needs to know that to widen its safety margins"

## Slide 9: 5. Atomic Multi-Leg Execution: The Type-State Pattern. 584.6 to 685.1 (100.5 s)

**Content**
- Tag "5. Atomic Multi-Leg Execution: The Type-State Pattern". Headline "Invalid state transitions are forced into compile-time errors."
- Orange box "Warning: Type-state checks govern local program transitions, but exchanges cannot provide atomic cross-venue fills. Leg risk, partial fills, confirmations, cancellation, recovery, compensation, and exposure remain real operational risks."
- State graph: Idle → Validating → ExecutingLeg → FullyFilled / RollingBack; dashed Idle → FullyFilled path blocked by a padlock.
- Code:
  ```rust
  // States as types. Invalid transitions won't compile.
  struct Idle;
  struct Validating;
  struct ExecutingLeg;
  struct FullyFilled;
  struct RollingBack;

  struct Execution<State> {
      trade_id: u64,
      legs: Vec<TradeLeg>,
      _state: PhantomData<State>,
  }
  ```

Article check: code matches the article. The article itself says "A multi-leg arbitrage strategy is never atomic. One leg might fill while others fail", which contradicts its own subtitle ("Atomic Multi-Legs") and slide 1's "ATOMIC MULTI-LEG" label. The slide's Warning box is correct and the hosts make the same point. Code note: `PhantomData` needs `use std::marker::PhantomData;`; the snippet shows the states but not the `impl Execution<Idle> { fn validate(self) -> Execution<Validating> }` transition methods that actually enforce the order; add one example transition on screen.

**Sub-scenes** (100 s, split)
- 9a 584.6 to 633.9, the pushback: 584.6 "the system calculates the slippage, decides it's profitable and strikes"; 588.7 "a multi leg arbitrage ... multiple exchanges at once, which introduces massive risk"; 594.8 "atomic multi leg execution and the type state pattern" (tag); 599.3 "I have to push back hard here"; 604.4 "exchanges are entirely independent. You absolutely cannot guarantee atomic cross venue fills"; 610.1 "If Binance fills and Kraken rejects, you're left holding the bag" (two legs: one green fill, one red reject, exposure bag); 615.7 "The exchanges themselves cannot provide atomic cross venue fills. Leg risk, partial fills, cancellations, and just sudden exposure" (Warning box).
- 9b 633.9 to 685.1, type-state: 633.9 "making the local program transitions atomic using Rust's type state pattern"; 639.1 "states are encoded as literal data types. So invalid transitions literally won't even compile" (headline; code state structs); 651.4 "an execution struct ... a trade ID, a vector of trade legs, and a PhantomData marker for the state" (struct highlight); 656.6 "idle to validating to executing leg ending in either fully filled or rolling back" (state graph draws); 669.9 "the compiler itself will error out if you try to jump from idle straight to fully filled" (dashed path hits padlock; compiler error toast); 674.5 "It completely eliminates local software bugs regarding trade state, but ... it doesn't solve Kraken's server going down" (server down icon on one leg).

## Slide 10: 6. Risk Management: Kill Switches and Circuit Breakers. 685.1 to 755.3 (70.2 s)

**Content**
- Tag "6. Risk Management: Kill Switches and Circuit Breakers". Headline "Catastrophic market movements trigger automated, tiered circuit breakers."
- Staircase: Paused (yellow) "5-minute pause for local volatility spikes." → Halted (orange) "15-minute halt for large 1-hour drops." → Shutdown (red) "Full system shutdown if BTC drops 20% in 24 hours."
- Footer disclaimer (drop; keep "illustrative thresholds").

Article check: matches the article's three levels and thresholds. "Large 1-hour drops" has no number in the article.

**Host embellishment (flag, minor):** 729.7 "the engine just flattens its positions and terminates": the article says only "full system shutdown". Flattening on shutdown is a design choice (and itself risky in a crash); do not caption it as the article's rule.

**Beats**
- 685.1 "even with perfect compile time safety, sometimes the entire crypto market just falls out of bed"; 690.6 "The system needs a panic button"
- 692.9 "risk management, kill switches, and circuit breakers" (tag); 695.6 "like the emergency brakes on a bullet train" (train gag)
- 699.8 "a three level circuit breaker"; 705.2 "Level one is paused ... a five minute pause for local volatility spikes ... stops initiating new trades" (step 1)
- 717.2 "Level two is halted ... a 15 minute halt triggered by large one hour drops" (step 2)
- 723.1 "Shutdown. A full system shutdown. If ... BTC drops 20% in 24 hours" (step 3, red)
- 736.6 "these thresholds, the five minutes, 15 minutes, 20%, these are illustrative policies ... tune your own brakes" (tag "illustrative")

## Slide 11: 7. Performance Budget. 755.3 to 834.4 (79.1 s)

**Content**
- Tag "7. Performance Budget". Headline "Internal processing logic accounts for only a fraction of total execution latency."
- Bar: Network In (AWS ap-northeast-1) 0.5 - 2 ms | Parsing/OrderBook 2 - 10 μs | Strategy/Risk 5 - 15 μs | Network Out 0.5 - 2 ms. "TOTAL: 2 - 6 ms".
- Footer disclaimer: "The 0.5-2 ms network legs, microsecond processing times, and stated 2-6 ms total represent an unmeasured, environment-specific budget whose arithmetic requires review."

Article check: the four components and the total match the article.

**Article error (flag):** the total does not add up. Sum of the stages: (0.5 + 0.002 + 0.005 + 0.5) = 1.007 ms to (2 + 0.010 + 0.015 + 2) = 4.025 ms, i.e. **~1-4 ms**, not 2-6 ms. Either the network legs are larger than stated or the total includes unlisted costs (TLS, exchange matching, multi-leg sequencing). Show the components with the computed sum ~1-4 ms and note "article states 2-6 ms". The slide's footnote already hints the arithmetic needs review. Also the bar's internal segments (2-25 μs) are drawn far wider than their true share (~1%); fine as a zoom, but label it "not to scale".

**Beats**
- 755.3 recap "the bypassed kernels, the lock free order books, the type states, the circuit breakers"; 760.4 "the final receipt, the performance budget" (receipt motif)
- 765.3 "How fast does this actually run?"; 771.4 "a server located in AWS ap-northeast-1, which is in Tokyo" / 778.4 "physically close to the exchanges" (map pin Tokyo)
- 781.8 "network in ... 0.5 to two milliseconds" (segment 1); 788.7 "Parsing and the order book takes two to 10 microseconds" (segment 2, zoom); 795.6 "strategy and risk takes five to 15 microseconds" (segment 3); "network out is another 0.5 to two milliseconds" (segment 4)
- 802.5 "the physical transit takes milliseconds, but the actual thinking takes practically zero time" (internal slivers glow)
- 808.7 "The stated total is two to six milliseconds" (total; show computed ~1-4 ms beside it)
- 815.0 "an unmeasured environment specific budget ... its arithmetic requires review" (tag)

## Slide 12: Conclusion. 834.4 to 915.8 (81.4 s)

**Content**
- Tag "Conclusion". Headline "Rust provides the blueprint for building professional-grade execution systems."
- Highlighted text "Completing the complex arbitrage chain—from graph algorithms and copulas to machine learning and nanosecond execution—Rust acts as the definitive bridge between low-level control and memory safety."
- Balance scale: "C++ Control" vs "Financial System Safety". Terminal "> Clone the HFT Execution Engine: github.com/marketmaker-cc/hft-engine-rust".
- Footer disclaimer: repository availability not verified (drop the footer; the hosts say it aloud).

Article check: matches the article's conclusion and footer link (`https://github.com/marketmaker-cc/hft-engine-rust`, not verified to exist). "Nanosecond execution" in the series wrap-up is the article's wording; nothing in the budget is nanosecond-scale (fastest stage 2-10 μs).

**Beats**
- 834.4 "to wrap this up in our conclusion"; 840.0 "Rust is ... the perfect language for this"; 843.5 "the low level memory control of C++, but pairs it with safety guarantees like the type state pattern" (scale balances)
- 854.2 "wraps up their wider series on complex arbitrage chains" (series strip: Parts 1 to 6, graph algorithms → copulas → ML → execution)
- 858.4 "the article does point to an HFT execution engine on GitHub" (terminal); 862.9 "repository's availability and actual behavior have absolutely not been verified" (tag "unverified")
- 873.2 "thank you for joining us on this deep dive"
- 884.1 final thought: "if software can be engineered to execute decisions this fast with perfect safety, what happens to the market when every participant is running an engine exactly like this?" (five identical engines); 905.8 "does the arbitrage opportunity disappear entirely or does it just evolve into something even more complex?" (end card)

---

## Timing notes

`sync_slides.py` (default params) degenerated ("showed 7/12 slides, longest held 79%") and fell back to an even 76.3 s split (saved as `timeline_auto_evensplit.json`).

`slide_starts.json` / `timeline.json` are set by hand from transcript cues (word timestamps used where a segment straddles a boundary). Segment order in `timeline.json` (0-based slide index): `[1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]`, i.e. slide 2 (orchestra cold open), slide 1 (title read), slide 2 again (blueprint, 2-6 ms), then slides 3 to 12 in order. If a strictly title-first video is preferred, slide 1 can instead run 0.0 to 52.8 with the orchestra beats drawn over the title blueprint, and slide 2 from 52.8.

| Seg | Slide | Start | Cue | Confidence |
|---|---|---|---|---|
| 0 | 2 Orchestra | 0.0 | "Imagine for a second that you are a conductor" (slide 2's "The Orchestra" / "The Reality") | high |
| 1 | 1 Title | 52.8 | "So welcome to the deep dive. Today, we are breaking down part six" | high (8 s) |
| 2 | 2 Blueprint | 61.1 | "We're leaving the high-level trading theory behind ... bytes, cache lines, atomic operations" | high |
| 3 | 3 Beyond the kernel | 102.5 | "And to execute across multiple venues that fast ... circumventing the operating system" (section named 111.7) | high |
| 4 | 4 io_uring | 175.3 | "for the io_uring and network bypassing section" | high |
| 5 | 5 simd-json | 246.9 | "once it's in the system, it's just raw text ... simd-json" | high |
| 6 | 6 Lock-free order book | 340.1 | "So now that the system has this lightning fast parsed data" (word time; section named 350.4) | high |
| 7 | 7 LMAX Disruptor | 448.3 | "So we have an unlocked order book, but this is a complex system" (Disruptor named 461.8) | high |
| 8 | 8 Slippage | 514.2 | "speed means nothing if you misjudge the reality of the market" | high |
| 9 | 9 Type-state | 584.6 | "So the system calculates the slippage, decides it's profitable and strikes" (word time) | high |
| 10 | 10 Circuit breakers | 685.1 | "And even with perfect compile time safety ... the system needs a panic button" (word time) | high |
| 11 | 11 Performance budget | 755.3 | "So we've reviewed ... It is time to look at the final receipt, the performance budget" | high |
| 12 | 12 Conclusion | 834.4 | "So to wrap this up in our conclusion" (word time) | high |

Slides longer than ~90 s are split into sub-scenes above: 6 (2), 9 (2). Slide 5 (93 s) runs as one scene with dense beats.
