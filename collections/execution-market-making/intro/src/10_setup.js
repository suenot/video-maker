/* ============================================================
   INTRO 10 SETUP: variables, title DOM, timing (beat grid), world layout
   Song: song_short.m4a (27.1 s), big-band swing ~129 BPM (beat 0.464 s,
   bar ~1.84 s), cut from song_raw.mp4 on downbeats: 11.19-14.81 intro
   turnaround + 29.49-53.0 verse and the whole second chorus, 1.2 s fade.
   Word times from `hyperframes transcribe` (lyrics.srt is ~11 s off):
     0.00 instrumental (2 bars)
     3.52 "Down at the station where the clockwork turns"
     6.08 "A big order splits into little wagons in turns"
     7.92 "Slice it with care so the price won't slide"
     9.68 "Quote both sides and let the spread provide"
    10.96 "Choo choo, keep the slippage low"
    14.80 "Buy the bid and sell the ask just so"
    18.24 "Mind your inventory, keep it all in check"
    22.32 "Execution and Market Making, on deck!"
    25.04 "All aboard the market train"   25.9-27.1 fade
   All story times are K.at(bar, beat) or sung-word times.
   ============================================================ */
const K = SK, P = K.P, at = K.at;
K.G.BPM = 129.2;
K.G.BARS = [0.0, 1.83, 3.60, 5.43, 7.24, 9.08, 10.91, 12.72, 14.61, 16.42, 18.25, 20.09, 21.94, 23.78, 25.61];
const DUR = 27.1, BEAT = 60 / K.G.BPM;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");

/* ---------- story beats (on the song's downbeats and sung words) ---------- */
const T = {
  /* instrumental (bars 0-1): the yard */
  walk: [-1, -0.5],                 /* (no walk-in in the short cut: he is already on the platform) */
  push: [-1, -0.5],
  lid: at(0, 1),                    /* 0.46 the pocket watch opens */
  lidShut: at(0, 3.2),
  lookUp: at(1, 0),                 /* 1.83 he looks up at the giant crate: "!" */
  pull: [at(1, 0.2), at(1, 2.6)],   /* pull back to show its size */
  board: 1e9, whistleIn: [1e9, 1e9], steam0: [1e9, 1e9],
  /* verse (bars 2-5) */
  verse: at(2, 0),
  camClock: [at(1, 3.2), at(2, 0.7)], /* 3.60 "Down at the station where the clockwork turns" */
  clock: at(2, 0),
  camWide: [at(2, 3.3), at(3, 0.6)],  /* 5.43 wide shot of the yard */
  slice: [at(3, 1), at(3, 2)],        /* "a big order SPLITS": cut lines */
  hops: at(3, 2),                     /* pieces hop onto wagons, a quarter beat apart */
  whip: [at(3, 3.55), at(4, 0.55)],   /* 7.24 whip pan to the bridge */
  depart: at(4, 0.3),
  priceFlip: at(4, 3.4),              /* "the price won't slide": 100.00 -> 100.01 */
  flap1: [at(5, 0) - 0.42, at(5, 0) + 0.3], /* board wipe to the quote booths */
  bid: at(5, 1),                      /* 9.54 "Quote both sides" */
  ask: at(5, 1.75),
  coins: at(5, 2.4),                  /* "let the spread provide" */
  spread: at(5, 3),
  /* chorus (bars 6-13) */
  steam: [at(6, 0) - 0.5, at(6, 0) + 0.32], /* steam wipe to the train */
  choo: [10.96, 11.36],               /* "Choo choo" */
  gauge: at(6, 3),                    /* "keep the slippage" */
  low: 13.60,                         /* "low" */
  thumbs: at(7, 2),
  tunnel3: [at(8, 0) - 0.45, at(8, 0) + 0.3],
  L2: { t0: at(8, 0), bid: 15.36, ask: 16.48, fill: 16.96, end: at(10, 0) },
  steam2: [at(10, 0) - 0.5, at(10, 0) + 0.32],
  B2: { t0: at(10, 0), drops: [18.3, 18.75, 19.2], sells: [20.08, 20.5], level: 20.88, end: at(12, 0) },
  flap2: [at(12, 0) - 0.42, at(12, 0) + 0.3], /* board wipe to the title */
  sign: [at(12, 0), at(12, 1.4)],     /* 21.94 "Execution and Market Making" */
  letters: at(12, 0.6),
  roundels: at(12, 2.5),
  whistle: 24.24,                     /* "on deck!" */
  aboard: [25.0, 26.35],              /* "All aboard the market train": the train pulls in */
  cleared: 26.2,                      /* the line signal turns teal as the train stops */
  hatTip: 26.45,                      /* cap tip as the song fades */
};

/* ---------- variables (title text, language) ---------- */
const VARS = Object.assign({ title: "Execution &|Market Making", lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = VARS.lang || "en";
const TITLE_LINES = String(VARS.title || "Execution &|Market Making").split("|").map((s) => s.trim()).filter(Boolean);
const IS_CJK = LANG === "zh-CN" || LANG === "zh-TW";

/* ---------- title DOM: one span per character (each flips in like a split-flap) ---------- */
const titleEl = document.getElementById("title");
if (LANG === "zh-CN") titleEl.classList.add("cjk-sc");
if (LANG === "zh-TW") titleEl.classList.add("cjk-tc");
const longest = Math.max(...TITLE_LINES.map((s) => s.length));
/* Jost 800 caps run ~0.72 em with the 0.04 em tracking; Cyrillic caps ~6 % wider. Fit inside the 1030 px sign face (the sign leaves the top-right corner to the logo). */
const EM = /[Ѐ-ӿ]/.test(VARS.title) ? 0.78 : 0.73;
const TITLE_SIZE = IS_CJK ? 140 : Math.min(108, Math.floor(1030 / (EM * Math.max(8, longest))));
const TITLE_CH = [];
TITLE_LINES.forEach((ln, li) => {
  const d = document.createElement("div");
  d.className = "ln " + (li === TITLE_LINES.length - 1 && TITLE_LINES.length > 1 ? "l1" : "l0");
  d.style.fontSize = TITLE_SIZE + "px";
  d.dataset.size = TITLE_SIZE;
  Array.from(ln).forEach((c) => {
    const s = document.createElement("span");
    s.className = "ch"; s.textContent = c === " " ? " " : c;
    d.appendChild(s); TITLE_CH.push({ el: s, line: li, idx: TITLE_CH.length });
  });
  titleEl.appendChild(d);
});
const TITLE_LN = Array.from(titleEl.querySelectorAll(".ln"));

/* ---------- station yard layout (world px, rail top y = RAIL) ---------- */
const RAIL = 900, PLAT_Y = 836;
const MOUSE_S = 1.45;
const CRATE = { x: 1080, w: 560, h: 380 };           /* the parent order on its long flatcar */
const WAG_S = 0.92, WAG_X0 = 1500, WAG_DX = 172, N_WAG = 8; /* the eight child orders */
const POND = { x: 3560, w: 700 };                     /* the price pond under the bridge */
const BRIDGE_MOUSE_X = 4330;
const ORDER = "10 000", CHILD = "1 250";
