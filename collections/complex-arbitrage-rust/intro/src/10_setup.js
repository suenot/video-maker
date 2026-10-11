/* ============================================================
   INTRO 10 SETUP: variables, title DOM, world data, timing (beat grid)
   Song: sea shanty ~120 BPM. 1 bar = 4 beats = 2 s. 10 bars = 20 s.
   All story times are written as K.at(bar, beat) so a retime to the real
   song is K.G.BPM / K.G.OFFSET only.
   ============================================================ */
const K = CK, P = K.P, at = K.at;
const DUR = 20;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");

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
  USDT: { x: 300, y: 900, c: P.USDT, seed: 11, lighthouse: true, palms: 1, pop: at(2, 2) },
  BTC: { x: 1350, y: 380, c: P.BTC, seed: 23, palms: 2, pop: at(1, 3) },
  ETH: { x: 2300, y: 880, c: P.ETH, seed: 37, palms: 2, pop: at(2, 3) },
  SOL: { x: 1480, y: 1440, c: P.SOL, seed: 41, palms: 1, pop: at(3, 0) },
  EUR: { x: 520, y: 1620, c: P.EUR, seed: 53, palms: 2, pop: at(3, 1) },
};
const NODE_S = 0.9;
/* rate on each route: price of the second asset in the first */
const EDGES = [
  ["USDT", "BTC", "62 000", -70, at(3, 0)],
  ["BTC", "ETH", "0.0525", -70, at(3, 0.5)],
  ["ETH", "USDT", "3 270", -60, at(3, 1)],
  ["USDT", "SOL", "148.2", 60, at(3, 1.5)],
  ["SOL", "ETH", "0.0453", 60, at(3, 2)],
  ["BTC", "SOL", "418.6", 50, at(3, 2.5), 0.72],
  ["EUR", "USDT", "1.084", 40, at(3, 3)],
  ["EUR", "SOL", "136.9", -40, at(3, 3.5)],
];
const LOOP = [0, 1, 2]; /* indices of the profitable cycle in EDGES */
/* the cargo: 1 USDT -> BTC -> ETH -> USDT */
const HOLD = ["1.0000 USDT", "0.0000161 BTC", "0.000307 ETH", "1.0046 USDT", "0.0000162 BTC", "0.000310 ETH", "1.0092 USDT"];

/* ---------- story beats (seconds via the grid) ---------- */
const T = {
  shipIn: [0, at(0, 3.6)],
  spyUp: at(1, 0),          /* 2.0 crab raises the spyglass */
  spot: at(1, 2),           /* 3.0 eyes pop: "!" */
  iris: [at(1, 3.2), at(2, 1.2)], /* 3.6 - 4.6 spyglass iris into the chart */
  hot: at(4, 0),            /* 8.0 the triangle lights up */
  lap1: [at(4, 1), at(5, 3)],     /* 8.5 - 11.5 */
  lap2: [at(6, 0), at(6, 3.6)],   /* 12.0 - 13.8 */
  wipe: [at(7, 1.4), at(7, 3.4)], /* 14.7 - 15.7 wave wipe to the title set */
  banner: [at(7, 3.2), at(8, 0.8)],
  letters: at(8, 0),
  jump: at(8, 0),
  snap: [at(8, 2), at(8, 3)],
  medals: at(8, 2),
  hatTip: at(9, 0),
};
