# bill-williams (en): scene breakdown

Source: NotebookLM deep-dive podcast (two hosts: H1 = storyteller who opens with the 1959 anecdote, H2 = co-host/skeptic), 15-slide NotebookLM deck.
Article: `marketmaker-cc-landing/src/content/blog/bill-williams.en.md` ("Bill Williams: How a Maverick with a Psychology Degree Changed Trading Forever", 2025-05-29, 28 references).

- Audio: `input/notebooklm-sources/bill-williams/en/audio.m4a`, 1509.81 s (25:09.8), AAC 44.1 kHz stereo.
- Transcript: `subtitles.json` (Whisper `small`, `word_timestamps=True`, every segment has `words[]`). Timestamps below are segment starts, accurate to ~0.5 s.
- Timing: `slide_starts.json` (index = slide number - 1) and `timeline.json`. See "Timing notes".
- Slide PNGs: `slides/slide_001.png` ... `slide_015.png` (3823x2134, not committed; regenerate with `pdf_to_images.py --dpi 200`).

Deck visual language: off-white paper (#F2F1EC-ish) with a light grey square grid and thin charcoal frame lines; charcoal (#2B3038) heavy grotesk titles; cobalt blue (#2F6DB5) for frames, timeline dots and accents; indicator colours follow the Alligator convention: jaw blue, teeth red, lips green; green (#2E9B48) = buy/strong, red (#D23B3B) = sell/fake. Mostly flat boxed "card" layouts. "Gemini Notebook" watermark bottom right (do not redraw).

Transcript quirks (fix in captions): "Sunat" (131.2, 135.1) = suenot; "impacting" (117.2) = unpacking; "cell signal" (689.9) = sell signal; "in arrow range" (1213.3) = a narrow range; "which will impact fully" (496.2) = which we'll unpack fully; "to stocks" (1428.4) = 2stocks; "Smart Dash Lab" = smart-lab; "Ava trade" = AvaTrade; "the quote strength" (666.7) = the "strength".

General fact note: the article's quotes ("When the Alligator is full...", "AO is the market's ECG", "measure the ocean with a spoon", 2008 interview, 50% of profits to orphanages, 25,000 graduates) come from secondary/forum sources and are not verifiable; the hosts correctly frame them as attributed claims. Keep the "claims" framing on screen ("attributed", "article claims"), as the slides already do.

---

## Slide 1: Title. 0.0 to 181.3 (181.3 s), split

**Content**
- Background: full-bleed grid. Left half: chaotic scatter of black dots plus jagged black, red and dashed zigzag price lines that converge into a single point at the center of the frame (where the axes cross). Right half: from that point, smooth bundles of parallel green and black sine-like curves fan out and rise to the right; a small square-wave trace and horizontal dashed ticks near the right axis. (Chaos on the left becomes order on the right.)
- Lower-right white card: title "Bill Williams: How a Maverick with a Psychology Degree Changed Trading Forever"; subtitle "Biography, philosophy, and inventions of the man who framed market chaos as order."; blue bracketed strip "Subject: Bill Williams | Framework: Trading Chaos | Status: Historical Account."

### 1a Cold open: the 1959 story. 0.0 to 107.7
Draw this as a cartoon of the biography hook (content overlaps slide 2's timeline):
- 0.0 "stared at a financial chart ... jagged red and green lines" (chaotic left half of the slide)
- 18.9 "the traditional advice ... study the economics, read the company fundamentals ... forecast"; 28.8 "The classic linear approach" (straight ruler line on the chart)
- 32.8 "It's 1959"; 34.3 "a young economics lecturer"; 38.7 "starts copying a colleague's trades"; 43.5 "earning more than his entire university salary" (salary vs trading-profit bars)
- 61.8 "fast forward 20 years"; 68.9 "loses absolutely everything" (account bar drains to zero)
- 79.5 "throws his fundamental analysis textbooks in the trash" (books into a bin)
- 86.1 "starts looking at chaos theory and human psychology to understand those jagged lines" (chaos converges to the center point, order fans out)
### 1b Scope and title. 107.7 to 181.3
- 117.2 "we are unpacking a very specific snapshot"; 121.5 "an article published on May 29, 2025"; 125.2 title read aloud (title card slides in); 131.2 "by an author listed just as suenot"
- 142.5 "treating everything here ... as attributed claims"; 163.2 "We aren't your financial advisors"; 166.4 "no strategy we talk about today offers any kind of guarantee" (status strip)

Narration notes: 34.3 merges two separate article facts (runner on the exchange; copied a friend's trades) into "lecturer ... runner"; "sheer dumb luck" and "a fraction of the time" are host embellishments. Article: "a young economics lecturer copies a colleague's trades and earns more than his university salary".

## Slide 2: From Church College to the Trading Floor. 181.3 to 329.2 (147.9 s)

**Content**
- Title "From Church College to the Trading Floor"
- Left card "Timeline of Claims": vertical blue line with three ring nodes, each with a boxed text:
  - "**1932:** Born to a working-class family; parents intended for him to enter the priesthood."
  - "**1959:** As a young economics lecturer, reportedly copies a colleague's trades to earn more than his university salary."
  - "**1970s:** Enters professional trading, experiences severe losses."
- Right card "The Cocktail: Hard Science & Human Behavior": Venn diagram, grey circle "Engineering Physics (NYU Degree)", blue circle "Psychology (NYU Degree)", intersection "Listening to the Market"; leader line to a box "The turning point where Williams claims to have thrown away fundamental analysis textbooks to study nonlinear dynamics."

Article check: matches (born 1932, NYU, engineering physics + psychology, 1970s losses, quote "I lost money until I threw away all the textbooks and started listening to the market").

**Beats**
- 181.3 "his background, starting from his church college days to the trading floor"
- 187.5 "born in 1932 to a working class family" (node 1); 195.3 "They wanted him to become a priest"
- 201.9 "he heads to New York University"; 210.2 "degrees in engineering physics and psychology" (two Venn circles)
- 219.8 "It's like oil and water"; 222.5 "Engineering physics ... absolute deterministic laws" (gears/gravity icons in left circle); 235.3 "psychology ... the study of human irrationality" (messy scribbles in right circle)
- 242.8 "trying to build a structural bridge out of human feelings"
- 253.0 "the financial market is exactly that ... a collision of hard math and completely irrational human emotion" (intersection lights up)
- 261.9 "after that initial lucky streak ... in 1959" (node 2); 265.7 "he hit a massive wall in the 1970s" (node 3); 274.6 "he just bled money"
- 281.0 quote "I lost money until I threw away all the textbooks and started listening to the market" (turning-point box)
- 303.3 "nonlinear dynamics ... chaos theory"; 312.3 "the market isn't a puzzle to be solved ... It's a living, chaotic environment"
- 322.3 "can't predict the exact path of a river's rapids, but ... navigate it without drowning" (raft-in-rapids gag)

## Slide 3: Five-Step Revolution: Key Inventions. 329.2 to 367.4 (38.2 s)

**Content**
- Title "Five-Step Revolution: Key Inventions"; full-width header strip "System Architecture".
- Center: circle hub with gear/arrow icon, "Nonlinear Market Dynamics"; five spokes to boxes with icons:
  - "1. The Alligator (Market Phase Detection)" with alligator head icon whose mouth holds blue/red/green lines (top-left)
  - "2. Fractals (Reversal Beacons)" with diamond up/down arrows icon (top-right)
  - "3. Awesome Oscillator (Momentum / ECG)" with green/red histogram + heartbeat icon (middle-right)
  - "4. Market Facilitation Index (Volume vs. Price)" with bars + rising line icon (bottom-right)
  - "5. Five Dimensions (Comprehensive Depth)" with isometric cube-in-hexagon icon (bottom-left)
- Bottom blue box: "Moving away from linear forecasting, Williams engineered a five-part technical suite designed to analyze market psychology and chaos as structured, tradable patterns."

Article check: matches the five sections.

**Beats**
- 329.2 "his five step revolution"; 334.1 "translate it into actual visual tools on a trader's screen"
- 341.8 "you have to adapt rather than predict ... an instrument panel" (hub appears)
- 351.5 "five specific theoretical constructs" (five boxes pop in clockwise 1 to 5)
- 357.0 "not to gaze into a crystal ball, but to map the present reality"
- 363.0 "they actually build on each other in a very specific sequence"

## Slide 4: 1. Alligator — the Indicator that 'Sleeps' and 'Hunts'. 367.4 to 532.4 (165.0 s)

**Content**
- Title "1. Alligator — the Indicator that 'Sleeps' and 'Hunts'"
- Clockwise cycle: four corner cards with mini charts (blue, red, green lines), arrows between them, and a central circle split into four quadrants repeating each chart:
  - top-left "**Step 1: Sleep** Flat market consolidation." (three lines tangled/braided, flat)
  - top-right "**Step 2: Awakening** Trend initiates." (lines start rising and separating, arrowheads)
  - bottom-right "**Step 3: Hunting** Open positions" (three straight rising lines fanned apart: green top, red middle, blue bottom)
  - bottom-left "**Step 4: Sated (Full)** Closes mouth; take profit" (three lines arching over and crossing back down)
- Center quote card: "When the Alligator is full, it closes its mouth — that's the signal to take profit." — Attributed to Williams, 2008 interview

Article check: article lists 3 phases (Sleep, Awakening, Hunting) plus the "full, closes its mouth" quote; the 4th "Sated" card is NotebookLM's rendering of that quote, fine. For accurate redraw, the real indicator (not in article): Jaw = 13-period smoothed MA shifted 8 bars forward (blue), Teeth = 8-period shifted 5 (red), Lips = 5-period shifted 3 (green). In an uptrend the order top to bottom is lips, teeth, jaw, as on the slide.

**Beats**
- 367.4 "Let's start with the most famous one"; 369.2 "The alligator"; 370.9 "The indicator that sleeps and hunts"
- 379.0 "three moving averages on a price chart"; 383.4 moving average explained ("takes past prices, averages them ... smoothed out line")
- 393.6 "each with a different timeframe and shifted them slightly forward" (three lines draw, shift right)
- 400.3 "the jaw, the teeth and the lips" (labels; alligator head cartoon with three lines as jaws)
- 415.3 "the first phase is sleep"; 419.0 "when the market is flat"; 425.9 "converge and intertwine" (Step 1; alligator snoozes, "Zzz")
- 441.7 "the awakening phase"; 445.6 "the short term lips react way faster than the long term jaw"; 453.2 "lines start to unbraid and diverge"; 455.6 "the alligator is basically opening its mouth" (Step 2)
- 458.5 "the hunting phase"; 461.3 "spread wide apart ... pointing in a clear direction"; 467.7 "the exact moment traders are supposed to open their positions" (Step 3; mouth wide)
- 473.7 skeptic: 485.3 "Aren't they lagging behind what's actually happening?" (flag "LAG" sticky note, pay off at slide 11)
- 503.4 "isn't designed to catch the absolute bottom or top ... designed to confirm"
- 516.1 2008 interview quote "when the alligator is full, it closes its mouth ... signal to take profit" (Step 4 + center quote); 524.8 "lines cross back over each other, you just get out"

## Slide 5: 2. Fractals — the Market's "Fingerprints". 532.4 to 647.8 (115.4 s)

**Content**
- Title "2. Fractals — the Market's "Fingerprints""
- Left: five outlined candlesticks, middle one tallest with the highest high (black), the two either side blue and lower, outer two black and lower still; a green arrow points at the middle bar's high. Box "**The Mechanism**": "Identifies 5 bars up or down as structural reversal points."
- Right card "**Caveat Module**": padlock with a key in it; quotes: ""A fractal is not a signal, it's a beacon."" and ""Only trade when confirmed by the Alligator.""

Article check: matches ("at least 5 bars up/down", reversal points, the two quotes). Narration error at 567.3: the host's description ("two bars making higher highs than a third middle bar making the absolute highest high") is garbled. Correct rule: an up fractal is a bar whose high is higher than the highs of the two bars on each side of it (a down fractal mirrors this with lows). Draw the correct shape, which the slide already does.

**Beats**
- 532.4 "how do you know exactly where to actually enter the trade?"; 538.6 "the second invention, fractals ... the market's fingerprints"
- 544.2 "fractal usually comes from geometry ... repeating self-similar pattern"
- 551.6 "a very strict five bar price pattern"; 558.4 "a bar meaning like a single day ... or an hour"
- 567.3 to 578.7 peak described (candles appear one by one, middle tallest); 582.5 "Or inversely, it can form a valley" (mirror)
- 585.1 "plots a little arrow above or below these peaks and valleys ... reversal points" (green arrow)
- 598.3 quote "a fractal is not a signal, it's a beacon" (lighthouse beacon gag; padlock card)
- 605.8 "if you just bought or sold every single time you saw a five bar peak ... the market would chew you to pieces"
- 623.0 "You only trade a fractal if it's confirmed by the alligator" (key turns in padlock)
- 627.3 "If the alligator's sleeping ... ignore the fractal beacon"; 633.2 "only care ... when the alligator's mouth is wide open"
- 642.8 "The alligator provides the context and the fractal provides the trigger"

## Slide 6: 3. Awesome Oscillator (AO). 647.8 to 731.7 (83.9 s)

**Content**
- Title "3. Awesome Oscillator (AO)"
- Left "The Mechanics" card: "**Function:** Measures the strength of the trend." / green up-circle "**Green bars** (above previous) = Buy signal." / red down-circle "**Red bars** (below previous) = Sell signal." (slide has a doubled "= =" typo)
- Right "The Metaphor": histogram on a zero line (small green hump, deep red trough, tall rising green run) overlaid with a blue ECG heartbeat trace with three spikes; big quote ""AO is the market's ECG.""

Article check: matches. Accuracy note (not in article): AO = 5-period SMA of median price minus 34-period SMA of median price; bar colour is green when the bar is higher than the previous bar, red when lower. "Green = buy" is the article's simplification; Williams' actual AO signals are saucer, zero-line cross and twin peaks. Keep the article's wording but label it "per the article".

**Beats**
- 647.8 "price alone doesn't tell the whole story ... the third invention, the awesome oscillator"
- 657.9 "the histogram ... a bar chart at the bottom of your screen" (histogram grows under a price chart)
- 666.7 "measure the 'strength' of the trend"; 670.4 "essentially measuring momentum"; 673.5 "compares a very short term momentum average against a longer term one"
- 680.2 "green bars ... getting taller ... buy signal"; 689.9 "red bars diving lower ... a sell signal"
- 696.0 "the AO is the market's ECG" (ECG trace overlays, quote)
- 709.1 "slapping sticky pads on the market's chest" (cartoon: chart with ECG electrodes)
- 714.7 "sometimes the price is still inching up, but the ECG starts showing red bars"; 722.0 "the heart of the trend is failing before the price actually collapses"
- 727.5 "divergence between the surface price and the underlying momentum" (price up, AO down)

## Slide 7: 4. Market Facilitation Index (MFI). 731.7 to 808.1 (76.4 s)

**Content**
- Title "4. Market Facilitation Index (MFI)"
- 2x2 grid with axes: y "Price Movement / Volatility" (blue arrow), x "Volume". Left two cells empty. Top-right green cell: "Increasing Volume + Rising Price / **Strong Trend** / (System indicates valid momentum)". Bottom-right red cell: "Decreasing Volume + Rising Price / **'Fake'** / (System indicates reversal is near)".
- Bottom mono box: "MFI synthesizes volume and volatility to evaluate the structural integrity of a price movement, exposing weak participation behind seemingly strong price action."

Fixes: the grid is inconsistent: both filled cells sit in the high-volume column, yet one is labelled "decreasing volume". Redraw as two rows keyed on volume direction (volume up = Strong Trend, volume down = Fake) with price rising in both. Accuracy note (not in article): Williams' MFI = (High − Low) / Volume, and he classified bars into four types: Green (MFI up, volume up), Fade (both down), Fake (MFI up, volume down), Squat (MFI down, volume up). Optional richer redraw: that 4-cell matrix, highlighting Green and Fake.

**Beats**
- 731.7 "momentum is just force ... What about participation?"
- 739.3 "his fourth invention, the Market Facilitation Index"; 745.3 "we finally add volume to the mix"
- 749.0 "combines price volatility ... with trading volume"
- 763.6 "price is shooting up and the volume is also massively increasing ... strong, genuine trend" (green cell); 773.4 "the market is voting with its wallet"
- 779.0 "price is rising ... but the volume is just plummeting"; 783.9 "flags this as a fake out" (red cell)
- 786.7 dust-cloud gag: "a massive cloud of dust ... a stampede of cattle"; 792.5 "just two guys dragging a branch on a dirt road" (animate this)
- 796.8 "no actual herd behind this price move"; 803.4 "a reversal is near because the momentum is just hollow"

## Slide 8: 5. The 'Five Dimensions' Theory. 808.1 to 888.1 (80.0 s)

**Content**
- Title "5. The 'Five Dimensions' Theory"
- Big blue blueprint ocean cross-section (white line art), five horizontal layers with a sloping seabed cliff on the left; labels on the right with brackets:
  - "Layer 1 (Surface/Waves): Fractals (Price geometry)" (crashing waves)
  - "Layer 2 (Shallows/Currents): Impulse (Movement strength)" (swirls)
  - "Layer 3 (Mid-depth): Acceleration / Deceleration" (straight arrows; left label "Mid-water")
  - "Layer 4 (Deep): Zone (Supply / Demand balance)" (small bar glyphs with ⊥, ÷, = symbols)
  - "Layer 5 (Sea Floor/Tides): Balance line" (a straight white line along the floor)
- Right note card: ""The market is like an ocean: first you see the waves (fractals), then you feel the current (impulse), and real money is made by understanding the tides (balance).""
- Bottom note strip: "**Note:** Dimensions framework acts as an observational map, making no claims of guaranteed predictive validity."

Article check: matches the five dimensions and the ocean quote. Narration error at 833.9: "acceleration and deceleration, which is mapped by that awesome oscillator ECG": wrong. In Williams' system the AO measures impulse/momentum (dimension 2); acceleration/deceleration is measured by a separate indicator, the Accelerator/Decelerator Oscillator (AC). Do not tie layer 3 to the AO on screen.

**Beats**
- 808.1 "the fifth invention, the Five Dimensions Theory"; 813.0 "the synthesis of everything"
- 824.7 "number one, fractals ... price geometry" (layer 1 waves)
- 831.3 "number two, impulse ... movement strength" (layer 2)
- 833.9 "number three is acceleration and deceleration" (layer 3; see error note)
- 841.3 "number four, the zone ... the delicate balance of supply and demand" (layer 4)
- 846.5 "number five, the balance line ... the center of gravity for the price action" (layer 5)
- 857.8 ocean quote: 862.8 "fractals are the waves"; 865.8 "impulse is the current"; 868.4 "balance line represents the deep underlying tides" (camera dives down the layers)
- 872.3 "If you only look at the waves, you'll drown"
- 882.6 "every indicator is supposed to cover the blind spot of the previous one"

## Slide 9: Philosophy: Why 95% of Traders Lose Money. 888.1 to 1087.3 (199.2 s), split

**Content**
- Title "Philosophy: Why 95% of Traders Lose Money"
- Left "Methodology Comparison", three stacked rows with blue header bars and icons:
  - "Fundamental Analysis" (gear icon): ""It's like trying to measure the ocean with a spoon — too many factors.""
  - "Traditional Technical Analysis" (wave icon): ""Linear models don't work in a nonlinear world.""
  - "Williams' Approach" (arrow + chevrons): ""You can't predict the market, you must adapt to it.""
- Right "System Rulebook" (blue double frame): 1. (compass icon) "Trade the plan, not the forecast." 2. (% icon) "Risk only 2% of your deposit per trade." 3. (curved arrow) ""Don't teach a fish to swim" — follow the trend."
- Bottom blue box with head icon and crossed-out eye icon: "**Success is 80% psychology. Fear and greed are the worst advisors. You must become an 'observer' who sees the market without emotion.**"

Article check: matches.

### 9a Why 95% lose: critique. 888.1 to 961.4
- 888.1 "the underlying philosophy"; 894.1 "95% of traders, so 95 out of 100" (100 stick figures, 95 turn red)
- 912.4 "his harsh critique of fundamental analysis"; 916.5 "global news, earnings reports, interest rates, supply chains ... like measuring the ocean with a spoon" (spoon vs ocean gag)
- 936.0 "he hated traditional technical analysis too"; 941.1 "linear models don't work in a nonlinear world" (ruler line snaps)
- 946.6 "draw a straight diagonal line ... treating a wild animal like a predictable machine"
- 956.1 "you can't predict the market. You must adapt to it" (Williams' Approach row)
### 9b Three rules. 961.4 to 1037.9
- 961.4 skeptic push-back: 967.5 "waiting for three animal themed moving averages to cross ... aren't these indicators just predictions by another name?"
- 982.3 "the central paradox of technical trading"; 990.2 "his three cardinal rules" (rulebook)
- 993.3 "Rule one, trade the plan, not the forecast"; 1004.9 "If the alligator's mouth is closed, you do nothing"; 1009.5 "You are an observer, not a psychic"
- 1013.0 "rule two ... Risk only 2% of the deposit per trade"; 1019.5 "$10,000 ... only lose $200" (correct: 2% of 10,000 = 200; show the math)
- 1028.7 "rule three, don't teach a fish to swim ... just follow the trend" (fish gag)
### 9c 80% psychology. 1037.9 to 1087.3
- 1042.3 "trading success is 80% psychology"; 1047.0 "fear and greed were just toxic" (bottom box)
- 1051.0 "a sensory deprivation tank for a trader's emotions"
- 1062.7 "focused on whether the green bar is taller than the last one ... no mental bandwidth to panic about the news cycle"
- 1071.3 "an emotionless observer ... stick to that 2% risk rule"; 1079.5 "The complexity is almost a feature, not a bug"

## Slide 10: Profitunity School: A Family Business with 25,000 Graduates. 1087.3 to 1156.5 (69.2 s)

**Content**
- Title "Profitunity School: A Family Business with 25,000 Graduates"
- Left "Prospectus Fact Card" (2x2 with icons): calendar "**Founded:** 1984"; graduation-cap people "**Scale:** Claimed 25,000 graduates (including hedge fund and central bank managers)."; person "**Leadership:** Later headed by daughter, Justine Williams."; money "**Cost:** $6,000 tuition fee."
- Right "Curriculum Module" with checkmarks: "Recognizing chaotic patterns", "Creating market maps", "Managing risk through position sizing".
- Bottom quote with blue bar: ""We don't give you a fish — we teach you to catch it in any weather.""

Article check: matches (article says "his daughter Justine"; the slide's "Justine Williams" surname is NotebookLM's assumption, harmless).

**Beats**
- 1087.3 "a massive appetite for this kind of psychological discipline ... the Profitunity school"; 1094.2 "this wasn't just a guy trading in his basement. This became a whole empire"
- 1099.2 "in 1984 he founded a training center"; 1103.7 "later headed by his daughter, Justine"
- 1108.0 "unverified claims from the text"
- 1118.6 "25,000 graduates" (count-up); 1124.1 "$6,000 per student" (price tag)
- 1134.3 "recognize chaotic patterns, map the market and master position sizing" (checkmarks tick)
- 1142.2 quote "we don't give you a fish. We teach you to catch it in any weather" (fisherman in a storm gag)
- 1149.0 "hedge fund and central bank managers were among those 25,000 students"

## Slide 11: Controversy and Criticism. 1156.5 to 1272.0 (115.5 s)

**Content**
- Title "Controversy and Criticism"; balance-scale icon between two rounded cards.
- Left "Skeptics' Ledger" (red underline): "Lag: Indicators are mathematically prone to lagging in strong trends." / "Whipsaws: High frequency of false signals generated in sideways/flat markets." / "Steep Curve: High complexity for beginner traders to synthesize multiple nonlinear inputs."
- Right "Williams' Defense Ledger" (blue underline): ""It's not the Holy Grail."" / "Acknowledged as a specialized key specifically for those ready to adopt nonlinear market logic."
- Bottom box: "Reminder that no trading strategy or indicator set guarantees financial returns."

Article check: matches (three criticisms; quote "It's not the Holy Grail ... But for those ready to think nonlinearly, it's the key to understanding market logic").

**Beats**
- 1156.5 "claims of that magnitude ... heavy skepticism"; 1166.4 "a whole section to this, the controversy and criticism" (scale tips toward skeptics)
- 1175.9 "back to your deduction earlier about the alligator" (the "LAG" note from slide 4 returns)
- 1184.8 "these indicators lag severely during strong trends"; 1190.3 "by the time ... the alligator finally opens its mouth, a massive portion of the price movement has already happened" (show the missed first part of a move)
- 1199.8 "the second major criticism"; 1204.3 "frequent false signals in sideways markets"; 1213.3 "chopping violently ... in a narrow range"; 1218.0 "the awesome oscillator will just flip from green to red and back"; 1221.7 "death by a thousand cuts ... whipsawed"
- 1231.5 "the third criticism is ... overwhelming complexity"; 1246.5 "cognitive overload"
- 1248.9 "How did Williams allegedly defend his system?"; 1255.4 "it's not the Holy Grail, but for those ready to think nonlinearly, it's the key" (right card)
- 1263.4 "he conceded it wasn't a flawless money printing machine"

## Slide 12: Legacy: From Charity to Memes. 1272.0 to 1350.3 (78.3 s)

**Content**
- Title "Legacy: From Charity to Memes"
- Three blue-framed cards joined by thick blue connectors:
  - "Philanthropy": "Article claims 50% of his trading profits were donated to orphanages and environmental projects."
  - "Software Integration": "His custom indicators became native, standard tools in global platforms like MetaTrader 4 and 5." (a stem below leads to "Bill Williams died in 2019.")
  - "Internet Culture": ""Sleeping alligator" memes remain persistent in modern trading chats."
- Bottom large quote box: ""Chaos is order we don't yet understand. Learn to see structure in apparent disorder — and the market will become your ally.""

Article check: matches.

**Beats**
- 1272.0 "his legacy from charity to memes"
- 1282.5 "donated 50% of his trading profits to orphanages and environmental projects" (Philanthropy)
- 1294.5 "the alligator, the fractals, the awesome oscillator ... standard default features built directly into MetaTrader 4 and 5" (Software card; indicator menu cartoon)
- 1309.5 "Millions of traders have access to them right out of the box"
- 1314.9 "memes of the sleeping alligator are still actively circulating in trading chats" (sleeping alligator meme)
- 1328.4 "Bill Williams passed away in 2019"
- 1337.9 quote "Chaos is order we don't yet understand ... the market will become your ally" (callback to the title: chaos left, order right)

## Slide 13: Citation. 1350.3 to 1404.8 (54.5 s)

**Content**
- Title "Citation"; rounded grey code box with syntax colouring (keys blue, values dark red):
  `@article{williams2025biography,` / `author = {Williams, Bill},` / `title = {Bill Williams: How a Maverick with a Psychology Degree Changed Trading Forever},` / `year = {2025},` / `url = {https://marketmaker.cc/en/blog/post/bill-williams},` / `version = {0.1.0},` / `description = {Biography, philosophy, and inventions of Bill Williams — from engineering psychology to indicators that changed the market.}` / `}`

Fact note: the slide copies the article faithfully, and the article itself has a metadata bug: `author = {Williams, Bill}` and key `williams2025biography`. The real author is suenot (Eugen Soloviov). The hosts spot this correctly at 1384.0-1401.6. Two options: redraw with `author = {Soloviov, Eugen}` (key `soloviov2025billwilliams`), or keep the bug and turn the hosts' remark into a red-circle gag. Either way never present Bill Williams as the author.

**Beats**
- 1350.3 "formally document our source material"; 1359.9 "a formal bibtex citation" (code box types out)
- 1366.2 title read; 1369.8 "dated 2025"; 1372.8 URL "marketmaker.cc/en/blog/post/bill-williams"; 1379.7 "version 0.1.0"
- 1384.0 "a very bizarre oddity in the metadata"; 1388.0 "The author is literally listed as Williams Bill" (circle the author line in red); 1393.1 "a biography about his own death like six years after he passed away"; 1397.8 "a quirk or an error in the site's tagging system"

## Slide 14: References 1-14. 1404.8 to 1424.5 (19.7 s)

**Content**
- Title "References"; two-column numbered table 1-14: avatrade.com/education/technical-analysis-indicators-strategies/bill-williams-indicators; goodreads.com/en/book/show/621895.Trading_Chaos; tradingview.com/support/solutions/43000591663-williams-fractal/; investopedia.com/articles/trading/072115/exploring-williams-alligator-indicator.asp; fx-wiki.ru/wiki/Билл_Вильямс; admiralmarkets.com/ru/education/articles/forex-basics/bill-viliams-treider-analitik-i-psikholog; rbc.ru/quote/card/61279d1e9a79472b5d93b1c0; youtube.com/watch?v=rdTg2w1oDOw; livelib.ru/author/235607/quotes-bill-vilyams; en.wikipedia.org/wiki/Bill_Williams_(trader); rbc.ru/quote/news/article/5fe5cbe59a7947de774b0444; bookinstein.ua/ru/bill-williams; tradexperts.ru/trejdery/bill-vilyams; profitunity.com/bill-williams/

Article check: matches references 1-14.

**Beats**
- 1404.8 "the text relies on a pretty eclectic list of 28 specific links" (count-up 28)
- 1413.6 "broker education pages from places like AvaTrade and Admiral Markets" (highlight rows 1, 6)
- 1419.2 "standard Wikipedia entries, Goodreads pages for his book, Trading Chaos" (rows 10, 2)

## Slide 15: References 15-28 + outro. 1424.5 to 1509.81 (85.3 s)

**Content**
- Title "References"; table 15-28: masterforex-v.org/wiki/bill_williams.html; forex-ratings.com/forex-strategies/bill-williams-trading-system/; smart-lab.ru/finansoviy-slovar/Билл Вильямс; admiralmarkets.com/education/articles/forex-basics/bill-williams; tradinginfo.club/ru/билл-уильямс/; esmagis.com.br/torgovaja-strategija-billa-viljamsa/; equity.today/bill-m-uilyams.html; indigo.ca/en-ca/trading-chaos-maximize-profits-with-proven-technical-techniques/9780471463085.html; 2stocks.ru/articles/kak-investiruyut-legendy-uoll-strit/teoriya-khaosa-i-sistema-torgovli-b-vilyamsa; kniga.biz.ua/pdf/2686-Torgoviy-haos.pdf; calameo.com/books/00014027758cb5587021d; youtube.com/shorts/WEFfH_UhVf0; peopletalk.ru/article/stars/robbi-uilyams/; ru.scribd.com/document/523477894/Билл-Вильямс-Торговый-хаос-изд-2

Article check: matches references 15-28. Source-quality note for the team (not for screen): ref 27 (peopletalk.ru "robbi-uilyams") is about the singer Robbie Williams, an irrelevant source in the original article.

**Beats**
- 1424.5 "a heavy reliance on Russian financial forums ... smart-lab and 2stocks ... YouTube video links" (highlight rows 17, 23, 26)
- 1435.8 "treating this mixed bag of links as the author's claimed foundation rather than independently auditing"
- 1449.6 recap: "physics and psychology, the agonizing losses, the sleeping alligators, and a $6,000 course on chaos theory" (quick callback montage of earlier icons)
- 1462.7 final thought: 1465.8 "trading success is 80% psychology"; 1471.1 "are these complex indicators actually mathematically decoding the hidden chaos"; 1478.4 "or are they just elaborate psychological safety blankets ... sticking to a boring discipline, 2% risk plan?"
- 1492.7 "the real magic ... in successfully hacking the mind of the trader looking at them"
- 1504.8 "Thank you so much for joining us"; 1507.6 "Stay curious" (end)

---

## Timing notes

`sync_slides.py` not used; boundaries set by hand. The hosts follow the deck in order and name each section.

| Start | Slide | Cue | Confidence |
|---|---|---|---|
| 0.0 | 1 | cold open (1959 story) + title read at 125.2 | high (cold open content overlaps slide 2; draw it as its own cartoon) |
| 181.3 | 2 | "his background, starting from his church college days" | high |
| 329.2 | 3 | "his five step revolution" | high |
| 367.4 | 4 | "start with the most famous one. The alligator" | high |
| 532.4 | 5 | "where to actually enter the trade? ... fractals" | high |
| 647.8 | 6 | "the third invention, the awesome oscillator" (named 651.4) | high |
| 731.7 | 7 | "momentum is just force ... participation?" (MFI named 739.3) | high |
| 808.1 | 8 | "the fifth invention, the Five Dimensions Theory" | high |
| 888.1 | 9 | "the underlying philosophy ... 95%" | high |
| 1087.3 | 10 | "the profitunity school" (named 1091.5) | high |
| 1156.5 | 11 | "attract heavy skepticism ... controversy and criticism" | high |
| 1272.0 | 12 | "his legacy from charity to memes" | high |
| 1350.3 | 13 | "document our source material ... citation" | high |
| 1404.8 | 14 | "the references section ... 28 specific links" | medium |
| 1424.5 | 15 | "Russian financial forums" (refs 17, 23, 26 are on slide 15), then outro | medium |
