/* ============================================================
   INTRO 10 SETUP: beat grid, story times, variables, title DOM, world data.
   Song: song_short.m4a (song_short_raw.mp4 0 - 31.5 s, fade from 30.3 s,
   -14 LUFS), sea shanty at 120 BPM: beat 0.5 s, bar 2.0 s, downbeats at
   0.35 + 2n s (onset grid search; sung lines start every 2.0 s).
     0.0  instrumental intro
     4.1  "Heave ho, the cycle flows" / 6.1 "Graph and matrix, the Rust-crab
          knows" / 8.0 "Futures, spot and copula sea" / 10.0 "Complex
          arbitrage, sail with me!"
    12.2  the chorus again (14.2 / 16.0 / 18.3 "sail with me!", ends 21.4)
    21.5  instrumental outro, fade 30.3 - 31.5
   Story times are K.at(bar, beat).
   ============================================================ */
const K = CK, P = K.P, at = K.at;
K.G.BPM = 120;
K.G.BARS = Array.from({ length: 17 }, (_, n) => Math.round((0.35 + n * 2.0) * 1000) / 1000);
const DUR = 31.5;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const bl = (k) => k * K.beatLen();

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  /* instrumental intro: the side set */
  shipIn: [0, at(0, 3.3)],        /* ship sails in */
  salute: at(0, 1),               /* cap tip + wink while sailing in */
  spyUp: at(1, 0),                /* 2.35 spyglass */
  spot: at(1, 1.5),               /* "!" */
  iris: [at(1, 2.5), at(2, 0)],   /* iris into the chart, lands on the first sung line */
  /* chorus 1 in the chart */
  loopDraw: at(2, 0),             /* "Heave ho, the cycle flows": loop routes draw... */
  hot: at(2, 1.5),                /* ...and glow */
  lap1: [at(2, 1.5), at(2, 4.5)], /* one lap, legs of 1 beat; +0.46 % */
  others: at(3, 0),               /* "Graph and matrix": the rest of the graph */
  matrix: at(3, 1),
  fly: at(3, 1.5),
  knows: at(3, 2.5),              /* "the Rust-crab knows" */
  irisOut: [at(3, 3.5), at(4, 0.5)],
  /* two ships */
  two1: at(4, 0),                 /* "Futures" */
  rope1: at(4, 2),                /* "spot" */
  swell1: at(4, 3),               /* "copula sea" */
  beckon: at(5, 0),               /* "Complex arbitrage, sail with me!" */
  wink: at(5, 3),                 /* "me!" */
  wipe1: [at(5, 3.2), at(6, 0)],  /* wave wipe back to the chart */
  /* chorus 2 */
  lap2: [at(6, 0), at(6, 3)],     /* fast lap: +0.92 % */
  tensor: at(7, 0),               /* "Graph and matrix": matrix -> tensor */
  knows2: at(7, 2.5),
  irisOut2: [at(7, 3.5), at(8, 0.5)],
  two2: at(8, 0),
  rope2: at(8, 1.5),
  swell2: at(8, 2.5),
  wipe2: [at(8, 3), at(9, 0)],
  /* title on the last "Complex arbitrage, sail with me!", held through the outro */
  banner: [at(9, 0), at(9, 1.2)],
  letters: at(9, 0.4),
  haul: [at(10, 0), at(12, 0)],   /* outro: the net comes up on every beat */
  dump: at(12, 0),
  jump: at(12, 2),
  snap: [at(13, 0), at(13, 1)],
  medals: at(13, 0),
  hatTip: at(14, 0),
  /* retired verse beats (full-length version): kept out of range */
  pushIn: [-9, -8], pullOut: [-7, -6], rivets: -99, markets: -99,
};

/* ---------- variables (title text, language) ---------- */
const VARS = Object.assign({ title: "Complex Arbitrage|in Rust", lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = VARS.lang || "en";
const TITLE_LINES = String(VARS.title || "Complex Arbitrage|in Rust").split("|").map((s) => s.trim()).filter(Boolean);
const IS_CJK = LANG === "zh-CN" || LANG === "zh-TW";

/* ---------- title DOM: one span per character (letters drop in on the beat) ---------- */
const titleEl = document.getElementById("title");
if (LANG === "zh-CN") titleEl.classList.add("cjk-sc");
if (LANG === "zh-TW") titleEl.classList.add("cjk-tc");
/* font sizes chosen so the longest line fits the 1500 px banner (see STYLE.md, type table) */
const longest = Math.max(...TITLE_LINES.map((s) => s.length));
const WIDE = /[\u0400-\u04ff]/.test(VARS.title) ? 1840 : 1980; /* Cyrillic glyphs run ~7 % wider in Rubik 900 */
const TITLE_SIZE = IS_CJK ? 150 : TITLE_LINES.length > 1 ? Math.min(124, Math.floor(WIDE / Math.max(10, longest))) : Math.min(110, Math.floor((WIDE + 320) / longest));
const TITLE_CH = [];
TITLE_LINES.forEach((ln, li) => {
  const d = document.createElement("div");
  d.className = "ln " + (li === TITLE_LINES.length - 1 && TITLE_LINES.length > 1 ? "l1" : "l0");
  const size = li === 0 || TITLE_LINES.length === 1 ? TITLE_SIZE : Math.round(TITLE_SIZE * 0.82);
  d.style.fontSize = size + "px";
  d.dataset.size = size;
  Array.from(ln).forEach((c) => {
    const s = document.createElement("span");
    s.className = "ch"; s.textContent = c === " " ? " " : c;
    d.appendChild(s); TITLE_CH.push({ el: s, line: li, idx: TITLE_CH.length });
  });
  titleEl.appendChild(d);
});
const TITLE_LN = Array.from(titleEl.querySelectorAll(".ln"));

/* ---------- chart-view world: currency islands (graph nodes) and routes (edges) ---------- */
const NODES = {
  USDT: { x: 300, y: 900, c: P.USDT, seed: 11, lighthouse: true, palms: 1, pop: at(1, 3) },
  BTC: { x: 1350, y: 380, c: P.BTC, seed: 23, palms: 2, pop: at(1, 2) },
  ETH: { x: 2300, y: 880, c: P.ETH, seed: 37, palms: 2, pop: at(1, 3.5) },
  SOL: { x: 1480, y: 1440, c: P.SOL, seed: 41, palms: 1, pop: at(3, 0) },
  EUR: { x: 520, y: 1620, c: P.EUR, seed: 53, palms: 2, pop: at(3, 0.5) },
};
const NODE_S = 0.9;
/* rate on each route: price of the second asset in the first. [from, to, rate, bend, drawAt, labelPos] */
const EB = (k) => T.loopDraw + bl(k / 2);
const OB = (k) => T.others + bl(k / 4);
const EDGES = [
  ["USDT", "BTC", "62 000", -70, EB(0)],
  ["BTC", "ETH", "0.0525", -70, EB(1)],
  ["ETH", "USDT", "3 270", -60, EB(2)],
  ["USDT", "SOL", "148.2", 60, OB(0)],
  ["SOL", "ETH", "0.0453", 60, OB(1)],
  ["BTC", "SOL", "418.6", 50, OB(2), 0.72],
  ["EUR", "USDT", "1.084", 40, OB(3)],
  ["EUR", "SOL", "136.9", -40, OB(4)],
];
const LOOP = [0, 1, 2]; /* indices of the profitable cycle in EDGES */
/* the cargo: 1 USDT -> BTC -> ETH -> USDT, twice */
const HOLD = ["1.0000 USDT", "0.0000161 BTC", "0.000307 ETH", "1.0046 USDT", "0.0000162 BTC", "0.000310 ETH", "1.0092 USDT"];
