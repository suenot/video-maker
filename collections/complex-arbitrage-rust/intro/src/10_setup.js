/* ============================================================
   INTRO 10 SETUP: beat grid, story times, variables, title DOM, world data.
   Song: song_full.m4a (song_raw.mp4 0 - 64.2 s, end fade 62.4 s, -14 LUFS),
   a sea shanty at ~125.9 BPM: beat 0.4767 s, bar 1.9067 s, first downbeat 0.60 s
   (tempo from line starts 23 bars apart; whisper word times in REVIEW.md).
     0.0  instrumental intro
     5.9  verse: "A crab sails out in a Rust-iron ship" / 9.9 "Through markets wide
          on a currency trip" / 13.7 "Three ports in a loop and the prices don't
          match" / 17.6 "Haul in the spread before the gap's too late to catch!"
    21.4  chorus: "Heave ho, the cycle flows" / 23.3 "Graph and matrix, the
          Rust-crab knows" / 25.3 "Futures, spot and copula sea" / 29.1
          "Complex arbitrage, sail with me!"
    33.0  instrumental break (accordion + fiddle)
    44.3  chorus again / 51.9 "sail with me!" / 53.9 "Haul in the spread..."
    58.8  "Heave ho..." / 60.2 "Graph and matrix..." / 62.3 "Futures!" (fade)
   Story times are K.at(bar, beat); bar n starts at 0.60 + n * 1.9067 s.
   ============================================================ */
const K = CK, P = K.P, at = K.at;
K.G.BPM = 240 / 1.9067;
K.G.BARS = Array.from({ length: 35 }, (_, n) => Math.round((0.60 + n * 1.9067) * 1000) / 1000);
const DUR = 64.2;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const bl = (k) => k * K.beatLen();

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  /* intro + verse 1: the side set */
  shipIn: [0, at(1, 2)],          /* ship sails in */
  pushIn: [at(2, 2), at(3, 2)],   /* camera closes on the crab for "A crab sails out" */
  salute: at(3, 1),               /* cap tip */
  rivets: at(4, 0),               /* "Rust-iron ship": sparks run along the rivets */
  pullOut: [at(4, 3), at(5, 1)],  /* "Through markets wide": wide again */
  markets: at(5, 1),              /* coin flags pop on the horizon islands, one per beat */
  spyUp: at(7, 0),                /* "Three ports in a loop" */
  spot: at(7, 2),
  iris: [at(7, 3), at(8, 1)],     /* spyglass iris into the chart */
  /* chart set, chorus 1 */
  loopDraw: at(8, 0.5),           /* "the prices don't match": the three loop routes */
  lap1: [at(9, 0), at(10, 2)],    /* "Haul in the spread": legs of 2 beats; gain on "catch!" */
  hot: at(11, 0),                 /* "Heave ho, the cycle flows" */
  others: at(11, 0.5),
  matrix: at(12, 0),              /* "Graph and matrix" */
  fly: at(12, 0.5),
  knows: at(12, 2),               /* "the Rust-crab knows" */
  irisOut: [at(12, 3.5), at(13, 0.5)],
  /* two ships, chorus 1 */
  two1: at(13, 0),                /* "Futures" */
  rope1: at(14, 0),               /* "spot" */
  swell1: at(14, 2),              /* "copula sea" */
  beckon: at(15, 0),              /* "Complex arbitrage, sail with me!" */
  wink: at(16, 1.5),
  wipe1: [at(16, 2.4), at(17, 0)],
  /* instrumental break */
  jig: [at(17, 0), at(19, 0)],    /* accordion jig at sunset */
  sail: [at(19, 0), at(21, 0)],   /* the sail becomes a chart */
  log: [at(21, 0), at(23, 0)],    /* the captain's logbook: Rust */
  spyUp2: at(22, 2),
  iris2: [at(22, 3), at(23, 0)],
  /* chart set, chorus 2 */
  lap2: [at(23, 0), at(23, 3)],   /* fast lap, legs of 1 beat */
  tensor: at(24, 0),              /* "Graph and matrix": matrix -> stacked tensor */
  knows2: at(24, 2.5),
  irisOut2: [at(24, 3.5), at(25, 0.5)],
  /* two ships at sunset, chorus 2 */
  two2: at(25, 0),
  rope2: at(26, 0),
  swell2: at(26, 2),
  wipe2: [at(26, 2.4), at(27, 0)],
  /* title: "Complex arbitrage, sail with me!" and the ending */
  banner: [at(27, 0), at(27, 1.2)],
  letters: at(27, 0.4),
  haul: [at(28, 0), at(30, 0)],   /* "Haul in the spread": the net comes up on every beat */
  dump: at(30, 0),
  jump: at(30, 2),                /* "Heave ho" */
  snap: [at(31, 0), at(31, 1)],   /* "Graph and matrix": snap + episode medallions */
  medals: at(31, 0),
  hatTip: at(32, 0),              /* "Futures!" */
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
  USDT: { x: 300, y: 900, c: P.USDT, seed: 11, lighthouse: true, palms: 1, pop: at(8, 0) },
  BTC: { x: 1350, y: 380, c: P.BTC, seed: 23, palms: 2, pop: at(7, 2.5) },
  ETH: { x: 2300, y: 880, c: P.ETH, seed: 37, palms: 2, pop: at(8, 0.5) },
  SOL: { x: 1480, y: 1440, c: P.SOL, seed: 41, palms: 1, pop: at(11, 0.5) },
  EUR: { x: 520, y: 1620, c: P.EUR, seed: 53, palms: 2, pop: at(11, 1) },
};
const NODE_S = 0.9;
/* rate on each route: price of the second asset in the first. [from, to, rate, bend, drawAt, labelPos] */
const EB = (k) => T.loopDraw + bl(k / 2);
const OB = (k) => T.others + bl(k / 2);
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
