/* ============================================================
   INTRO 10 SETUP: variables, title DOM, world data, timing (beat grid)
   Song: song_20s.m4a, sea shanty ~126 BPM (beat 0.476 s, bar 1.906 s).
   0.00-4.43 instrumental; 4.43 chorus: "Heave ho, the cycle flows" /
   8.2 "Graph and matrix, the Rust-crab knows" / 11.9 "Futures, spot and
   copula sea" / 15.7 "Complex arbitrage, sail with me!"; 19.3-20.1 fade.
   All story times are K.at(bar, beat) on the measured downbeats below.
   ============================================================ */
const K = CK, P = K.P, at = K.at;
K.G.BPM = 126;
K.G.BARS = [0.60, 2.51, 4.43, 6.33, 8.24, 10.14, 12.05, 13.96, 15.86, 17.77, 19.68];
const DUR = 20.1;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  shipIn: [0, at(0, 3)],          /* 0 - 2.03 ship sails in (instrumental) */
  spyUp: at(1, 0),                /* 2.51 crab raises the spyglass */
  spot: at(1, 1.5),               /* 3.22 eyes pop: "!" */
  iris: [at(1, 2), at(2, 0)],     /* 3.46 - 4.43 iris into the chart, lands on the chorus */
  loopDraw: at(2, 0),             /* 4.43 "Heave ho, the cycle flows": the loop routes draw */
  hot: at(2, 2),                  /* 5.38 loop glows */
  others: at(2, 2.5),             /* the other routes draw, dimmed */
  lap1: [at(2, 3), at(3, 3.5)],   /* 5.86 - 7.99, legs of 1.5 beats */
  matrix: at(4, 0),               /* 8.24 "Graph and matrix": the rates fly into a matrix */
  fly: at(4, 1),                  /* first tag leaves the map */
  knows: at(5, 0.5),              /* 10.38 "the Rust-crab knows": crab points at the loop cells */
  irisOut: [at(5, 3), at(6, 0)],  /* 11.57 - 12.05 iris closes on the ship */
  twoShips: at(6, 0),             /* 12.05 "Futures, spot": a second ship alongside */
  basis: at(6, 2),                /* 13.0 rope + basis tag between the ships */
  swell: at(7, 0),                /* 13.96 "copula sea": both ships ride one swell */
  wipe: [at(7, 2.4), at(8, 0)],   /* 15.10 - 15.86 wave wipe to the title set */
  banner: [at(8, 0), at(8, 1.2)], /* 15.86 title hit: "Complex arbitrage, sail with me!" */
  letters: at(8, 0.4),
  jump: at(8, 2),
  snap: [at(9, 0), at(9, 1)],
  medals: at(9, 0),
  hatTip: at(9, 2),
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
  BTC: { x: 1350, y: 380, c: P.BTC, seed: 23, palms: 2, pop: at(1, 1.5) },
  ETH: { x: 2300, y: 880, c: P.ETH, seed: 37, palms: 2, pop: at(1, 3.5) },
  SOL: { x: 1480, y: 1440, c: P.SOL, seed: 41, palms: 1, pop: at(2, 1) },
  EUR: { x: 520, y: 1620, c: P.EUR, seed: 53, palms: 2, pop: at(2, 1.5) },
};
const NODE_S = 0.9;
/* rate on each route: price of the second asset in the first */
const EB = (k) => T.loopDraw + k * K.beatLen() / 2;
const EDGES = [
  ["USDT", "BTC", "62 000", -70, EB(0)],
  ["BTC", "ETH", "0.0525", -70, EB(1)],
  ["ETH", "USDT", "3 270", -60, EB(2)],
  ["USDT", "SOL", "148.2", 60, EB(5)],
  ["SOL", "ETH", "0.0453", 60, EB(6)],
  ["BTC", "SOL", "418.6", 50, EB(7), 0.72],
  ["EUR", "USDT", "1.084", 40, EB(8)],
  ["EUR", "SOL", "136.9", -40, EB(9)],
];
const LOOP = [0, 1, 2]; /* indices of the profitable cycle in EDGES */
/* the cargo: 1 USDT -> BTC -> ETH -> USDT */
const HOLD = ["1.0000 USDT", "0.0000161 BTC", "0.000307 ETH", "1.0046 USDT"];

