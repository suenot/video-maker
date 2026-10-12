/* ============================================================
   INTRO 10 SETUP: variables, title DOM, the book data, timing (beat grid)
   Song: song_full.m4a = the whole song_raw.mp4 (raw 0.70 - 72.0, leading
   silence trimmed, 0.7 s fade, loudnorm), 71.3 s, Balkan brass at 152 BPM
   (beat 0.395 s, bar 1.60 s). Film time = raw time - 0.70.
   Sections (bars on the measured downbeats below):
     bars 0-3    instrumental intro
     bars 4-11   chorus 1: "Hey! The spread is tight / Depth and flow from left
                 to right / Every tick and every queue / Order Book and Market
                 Microstructure!" (6.47, 9.66, 12.86, 16.04)
     bars 12-19  verse: "Bids on the left and the asks up high / Stacked like a
                 tower reaching to the sky / Limit orders wait in a price-time
                 queue / Market orders come and they cross right through!"
                 (19.25, 22.43, 25.63, 28.84)
     bars 20-27  chorus 2 (32.04 ... 41.63)
     bars 28-35  instrumental break (44.83 - 57.63)
     bars 36-43  final chorus (57.63 ... "Order Book" 67.22), song ends 70.7
   Word timings: parakeet + whisper (lyrics.srt windows are coarse).
   ============================================================ */
const K = BK, P = K.P, at = K.at;
K.G.BPM = 152;
K.G.BARS = [0.04, 1.67, 3.27, 4.87, 6.47, 8.05, 9.66, 11.26, 12.86, 14.44, 16.04, 17.64, 19.25, 20.85, 22.43, 24.05,
  25.63, 27.23, 28.84, 30.44, 32.04, 33.64, 35.24, 36.85, 38.43, 40.03, 41.63, 43.23, 44.83, 46.44, 48.02, 49.64,
  51.22, 52.82, 54.42, 56.03, 57.63, 59.23, 60.81, 62.41, 64.01, 65.62, 67.22, 68.82];
const DUR = 71.3, BEAT = K.beatLen();
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  /* intro */
  curtain: [0.15, at(1, 0)],        /* the kilim curtain rolls up on the bazaar */
  stalls: at(1, 0),                 /* shutters roll up, awnings drop on eighth notes, top to bottom */
  swing: at(2, 0),                  /* Tikki swings in on a rope from the left */
  release: at(2, 0) + 1.22,         /* lets go of the rope */
  land: at(3, 0),                   /* lands on the balcony at the alley */
  fez: at(3, 1),                    /* tips the fez */
  beads: at(3, 2),                  /* flicks abacus beads on the beat */
  inhale: at(3, 3),                 /* a big breath */
  /* chorus 1 */
  hey: at(4, 0),                    /* "Hey!" */
  clap: at(4, 2),                   /* clap: the two halves of the book slide together */
  slam: at(4, 3),                   /* "spread": the alley slams narrow, ask prices flip */
  tight: at(5, 0),                  /* "tight": spread tag 0.05 -> 0.01, pinch gesture */
  depth: at(6, 0),                  /* "Depth and flow from left to right": crates flow in */
  arrow: at(6, 2),
  cart: [at(7, 0) + 0.03, at(7, 3.5)], /* a buy market order races through the alley */
  take: [at(7, 1.5), at(7, 2)],     /* it takes two crates from the best ask */
  shout: at(7, 2.5),                /* imbalance shout */
  ticks: at(8, 0.3),                /* "Every tick": plaques flash bottom to top */
  queueCam: at(8, 2),               /* close on the best bid queue */
  fills: [at(8, 3), at(9, 0), at(9, 1)], /* "every queue": our crate #4 -> #1 */
  tease: [at(9, 3), at(10, 0), at(11, 3), at(12, 0)], /* title banner drops, stamps "Order Book...", rolls back up */
  /* verse */
  hills: [at(12, 0), at(13, 0)],    /* "Bids on the left" / "and the asks up high": terraced depth hills */
  sky: [at(14, 1), at(14, 3), at(15, 0)], /* "Stacked like a tower reaching to the sky": two levels drop in, flag */
  prio: at(16, 0),                  /* "Limit orders wait in a price-time queue": arrival numbers */
  newbie: at(17, 0),                /* a newcomer joins the back */
  cart2: [at(18, 0), at(19, 3)],    /* "Market orders ... cross right through!": a sell cart, right to left */
  take2: [at(18, 2.5), at(18, 3)],  /* it fills our crate and the next one */
  coin: at(19, 0),                  /* our fill: a gold coin flies to Tikki */
  /* chorus 2 (dusk) */
  dusk: [at(19, 2), at(20, 2)],
  hey2: at(20, 0),                  /* "Hey!" */
  rope: at(21, 0),                  /* "tight": Tikki pulls the lantern rope tight */
  flow2: at(22, 0),                 /* second flow wave, the hills rise */
  tickChart: [at(24, 0), at(25, 2)],/* "Every tick": a tick chart scroll drops, draws tick by tick */
  fireworks: at(26, 0),             /* "Order Book and Market Microstructure!": every plaque pings, coins */
  /* break (night) */
  dance: [at(28, 0), at(30, 0)],
  ofi: [at(30, 0), at(32, 0)],      /* tile board: OFI */
  candles: [at(32, 0), at(34, 0)],  /* scroll: volume bars as candles */
  code: [at(34, 0), at(36, 0)],     /* code scroll: watch_order_book */
  dawn: [at(35, 0), at(36, 2)],
  /* final chorus */
  hey3: at(36, 0),
  flow3: at(38, 0),
  ticks3: at(40, 0.3),
  drop: [at(41, 2), at(41, 3)],     /* the kilim curtain drops over everything */
  rise: [at(41, 3), at(42, 0)],     /* it rolls up into the title banner */
  title: at(42, 0),                 /* "Order Book and Market Microstructure!" */
  line2: at(42, 2),
  medals: at(43, 0),
  jump: at(43, 2),
  bow: at(44, 0),
};

/* ---------- variables (title text, language) ---------- */
const VARS = Object.assign({ title: "Order Book &|Market Microstructure", lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = VARS.lang || "en";
const TITLE_LINES = String(VARS.title || "Order Book &|Market Microstructure").split("|").map((s) => s.trim()).filter(Boolean);
const IS_CJK = LANG === "zh-CN" || LANG === "zh-TW";

/* ---------- title DOM: one span per character (letters are stamped in on the beat) ---------- */
const titleEl = document.getElementById("title");
if (LANG === "zh-CN") titleEl.classList.add("cjk-sc");
if (LANG === "zh-TW") titleEl.classList.add("cjk-tc");
/* Yeseva One is wide: the longest line must fit 1640 px (STYLE.md, type table) */
const longest = Math.max(...TITLE_LINES.map((s) => s.length));
const WIDE = /[Ѐ-ӿ]/.test(VARS.title) ? 2580 : 2760; /* Cyrillic glyphs run wider */
const TITLE_SIZE = IS_CJK ? 124 : Math.min(106, Math.floor(WIDE / Math.max(12, longest)));
const TITLE_CH = [];
TITLE_LINES.forEach((ln, li) => {
  const d = document.createElement("div");
  d.className = "ln " + (li === TITLE_LINES.length - 1 && TITLE_LINES.length > 1 ? "l1" : "l0");
  const size = TITLE_LINES.length > 1 && li === 0 ? Math.round(TITLE_SIZE * 1.08) : TITLE_SIZE;
  d.style.fontSize = size + "px";
  d.dataset.size = size;
  Array.from(ln).forEach((c) => {
    const s = document.createElement("span");
    s.className = "ch"; s.textContent = c === " " ? "\u00a0" : c;
    d.appendChild(s); TITLE_CH.push({ el: s, line: li, idx: TITLE_CH.length, li: d.childNodes.length - 1 });
  });
  titleEl.appendChild(d);
});
const TITLE_LN = Array.from(titleEl.querySelectorAll(".ln"));

/* ---------- the book (world units; the tower stands on its bid half) ----------
   asks best first (bottom of the upper half), bids best first (top of the lower half).
   Before the slam the inside of the spread is empty: best ask 101.30, best bid 101.25
   (spread 0.05). On "spread" new sellers step in: the ask ladder becomes 101.26-101.30.
   Levels 5 and 6 (101.31, 101.32) drop in from the sky in the verse. */
const TW = 1100, LH = 150, YB0 = 115;          /* tower width, level height, top of the bid half */
const GAP0 = 230, GAP1 = 84;                   /* alley height before / after the slam */
const ASKS = [
  { p0: "101.30", p1: "101.26", n0: 1, n1: 4, n2: 6 },
  { p0: "101.31", p1: "101.27", n0: 2, n1: 6, n2: 7 },
  { p0: "101.32", p1: "101.28", n0: 1, n1: 5, n2: 6 },
  { p0: "101.33", p1: "101.29", n0: 2, n1: 7, n2: 7 },
  { p0: "101.34", p1: "101.30", n0: 1, n1: 6, n2: 7 },
  { p0: "101.31", p1: "101.31", n0: 5, n1: 5, n2: 6, sky: 0 },  /* dropped in from the sky */
  { p0: "101.32", p1: "101.32", n0: 4, n1: 4, n2: 5, sky: 1 },
];
const BIDS = [
  { p0: "101.25", p1: "101.25", n0: 2, n1: 5, n2: 8 },
  { p0: "101.24", p1: "101.24", n0: 1, n1: 7, n2: 8 },
  { p0: "101.23", p1: "101.23", n0: 2, n1: 6, n2: 7 },
  { p0: "101.22", p1: "101.22", n0: 1, n1: 8, n2: 8 },
  { p0: "101.21", p1: "101.21", n0: 2, n1: 6, n2: 7 },
];
const STAR = { side: "bid", level: 0, k: 3 };  /* our own resting order: 4th in the best-bid queue */
/* after the buy cart takes 2 of 4 crates at the best ask: best level 5 bids vs 2 asks,
   imbalance (5 - 2) / (5 + 2) = +0.43 */
const IMB = "+0.43";
const PRIO = { side: "ask", level: 1 };        /* the queue that gets arrival numbers in the verse */

/* every crate: arrival time (flow-in), removal time + kind, star */
const CRATES = { ask: [], bid: [] };
const levelLand = (i) => T.sky[ASKS[i].sky];   /* when a sky level lands */
(function buildCrates() {
  const openAt = (side, i) => T.stalls + (side === "ask" ? 4 - Math.min(i, 4) : 5 + i) * BEAT / 2;
  const flow1 = [], flow2 = [];
  ["ask", "bid"].forEach((side) => (side === "ask" ? ASKS : BIDS).forEach((L, i) => {
    const arr = [];
    for (let k = 0; k < L.n2; k++) {
      const c = { k, star: side === STAR.side && i === STAR.level && k === STAR.k, remove: null, kind: null };
      if (L.sky != null && k < L.n1) { c.arrive = levelLand(i) - 1; c.flow = false; }
      else if (k < L.n0) { c.arrive = openAt(side, i) + 0.12 + k * 0.06; c.flow = false; }
      else if (k < L.n1) { c.flow = true; flow1.push(c); c.order = (k - L.n0) * 10 + (side === "ask" ? i : 5 + i); }
      else { c.flow = true; flow2.push(c); c.order = (k - L.n1) * 12 + (side === "ask" ? i : 7 + i); }
      arr.push(c);
    }
    CRATES[side].push(arr);
  }));
  /* flow-ins: every stall fills at once, crates slide in from the left */
  flow1.sort((a, b) => a.order - b.order).forEach((c, j) => { c.arrive = T.depth + 0.05 + j * (1.25 / flow1.length); });
  flow2.sort((a, b) => a.order - b.order).forEach((c, j) => { c.arrive = T.flow2 + 0.05 + j * (2.6 / flow2.length); });
  /* the newcomer at the back of the price-time queue is the first of the second wave on that level */
  /* the buy cart takes the first two crates of the best ask */
  CRATES.ask[0][0].remove = T.take[0]; CRATES.ask[0][0].kind = "cart";
  CRATES.ask[0][1].remove = T.take[1]; CRATES.ask[0][1].kind = "cart";
  /* market sells fill the first three crates of the best bid: our crate moves from #4 to #1 */
  T.fills.forEach((tf, j) => { CRATES.bid[0][j].remove = tf; CRATES.bid[0][j].kind = "fill"; });
  /* the sell cart fills our crate and the one behind it */
  CRATES.bid[0][3].remove = T.take2[0]; CRATES.bid[0][3].kind = "cart2";
  CRATES.bid[0][4].remove = T.take2[1]; CRATES.bid[0][4].kind = "cart2";
  /* the price-time newcomer arrives on its own beat */
  const nb = CRATES[PRIO.side][PRIO.level][ASKS[PRIO.level].n1]; nb.arrive = T.newbie; nb.flow = true;
})();
