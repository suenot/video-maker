/* ============================================================
   INTRO 10 SETUP: variables, title DOM, the book data, timing (beat grid)
   Song: song_20s.m4a, Balkan brass band at 152 BPM (beat 0.395 s, bar 1.58 s),
   cut from song_raw.mp4: raw 0.74-19.95 (4 instrumental bars + the 8-bar chorus,
   one take, no splice) + raw bar 5.57-7.17 as an instrumental tail, 0.8 s fade.
   Sung lines (cut time, measured with parakeet):
     6.43  "Hey! The spread is tight"           (spread 7.58, tight 8.30)
     9.62  "Depth and flow from left to right"
     13.0  "Every tick and every queue"         (queue 14.70)
     16.0  "Order Book and Market Microstructure!"
   All story times are K.at(bar, beat) on the measured downbeats below.
   ============================================================ */
const K = BK, P = K.P, at = K.at;
K.G.BPM = 152;
K.G.BARS = [0.00, 1.63, 3.23, 4.83, 6.43, 8.01, 9.62, 11.22, 12.82, 14.40, 16.00, 17.60, 19.18];
const DUR = 20.1, BEAT = K.beatLen();
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  curtain: [0.15, at(1, 0)],        /* 0.15 - 1.63 the kilim curtain rolls up on the bazaar */
  stalls: at(1, 0),                 /* 1.63 awnings drop open on eighth notes, top to bottom */
  swing: at(2, 0),                  /* 3.23 Tikki swings in on a rope from the left */
  release: at(2, 0) + 1.22,         /* 4.45 lets go of the rope */
  land: at(3, 0),                   /* 4.83 lands on the balcony at the alley */
  fez: at(3, 1),                    /* 5.22 tips the fez */
  beads: at(3, 2),                  /* 5.62 flicks abacus beads on the beat */
  inhale: at(3, 3),                 /* 6.02 anticipation: big breath */
  hey: at(4, 0),                    /* 6.43 "Hey!" */
  clap: at(4, 2),                   /* 7.22 claps: the two halves of the book slide together */
  slam: at(4, 3),                   /* 7.61 "spread": the alley slams narrow, ask prices flip */
  tight: at(5, 0),                  /* 8.01 "tight": spread tag 0.05 -> 0.01, pinch gesture */
  depth: at(6, 0),                  /* 9.62 "Depth and flow from left to right": crates flow in */
  arrow: at(6, 2),                  /* 10.41 flow arrow */
  cart: [at(7, 0) + 0.03, at(7, 3.5)], /* 11.25 - 12.60 a market order cart races through the alley */
  take: [at(7, 1.5), at(7, 2)],     /* 11.81, 12.01 it takes two crates from the best ask */
  shout: at(7, 2.5),                /* 12.21 Tikki shouts the imbalance */
  ticks: at(8, 0.3),                /* 12.94 "Every tick": plaques flash bottom to top */
  queueCam: at(8, 2),               /* 13.61 close on the best bid queue */
  fills: [at(8, 3), at(9, 0), at(9, 1)], /* 14.0 / 14.4 / 14.8 "every queue": front crates fill, ours moves up */
  drop: [at(9, 2), at(9, 3)],       /* 15.19 - 15.58 kilim curtain drops over everything */
  rise: [at(9, 3), at(10, 0)],      /* 15.58 - 16.00 it rolls up into the title banner */
  title: at(10, 0),                 /* 16.00 "Order Book and Market Microstructure!" */
  line2: at(10, 2),                 /* 16.79 second title line stamps in */
  medals: at(11, 0),                /* 17.60 episode medallions pop on eighth notes */
  jump: at(11, 2),                  /* 18.39 jump */
  bow: at(12, 0),                   /* 19.18 tips the fez, end */
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
   (spread 0.05). On "spread" new sellers step in: the ask ladder becomes 101.26-101.30. */
const TW = 1100, LH = 150, YB0 = 115;          /* tower width, level height, top of the bid half */
const GAP0 = 230, GAP1 = 84;                   /* alley height before / after the slam */
const ASKS = [
  { p0: "101.30", p1: "101.26", n0: 1, n1: 4 },
  { p0: "101.31", p1: "101.27", n0: 2, n1: 6 },
  { p0: "101.32", p1: "101.28", n0: 1, n1: 5 },
  { p0: "101.33", p1: "101.29", n0: 2, n1: 7 },
  { p0: "101.34", p1: "101.30", n0: 1, n1: 6 },
];
const BIDS = [
  { p0: "101.25", p1: "101.25", n0: 2, n1: 5 },
  { p0: "101.24", p1: "101.24", n0: 1, n1: 7 },
  { p0: "101.23", p1: "101.23", n0: 2, n1: 6 },
  { p0: "101.22", p1: "101.22", n0: 1, n1: 8 },
  { p0: "101.21", p1: "101.21", n0: 2, n1: 6 },
];
const STAR = { side: "bid", level: 0, k: 3 };  /* our own resting order: 4th in the best-bid queue */
/* after the cart takes 2 of 4 crates at the best ask: best level 5 bids vs 2 asks,
   imbalance (5 - 2) / (5 + 2) = +0.43 */
const IMB = "+0.43";

/* every crate: arrival time (flow-in), removal time + kind, star */
const CRATES = { ask: [], bid: [] };
(function buildCrates() {
  const openAt = (side, i) => T.stalls + (side === "ask" ? 4 - i : 5 + i) * BEAT / 2;
  let flowIdx = [];
  ["ask", "bid"].forEach((side) => (side === "ask" ? ASKS : BIDS).forEach((L, i) => {
    const arr = [];
    for (let k = 0; k < L.n1; k++) {
      const c = { k, star: side === STAR.side && i === STAR.level && k === STAR.k, remove: null, kind: null };
      if (k < L.n0) c.arrive = openAt(side, i) + 0.12 + k * 0.06, c.flow = false;
      else { c.flow = true; flowIdx.push(c); c.order = (k - L.n0) * 10 + (side === "ask" ? i : 5 + i); }
      arr.push(c);
    }
    CRATES[side].push(arr);
  }));
  /* flow-in: all newcomers arrive during bar 6, sorted so every stall fills at once */
  flowIdx.sort((a, b) => a.order - b.order).forEach((c, j) => { c.arrive = T.depth + 0.05 + j * (1.25 / flowIdx.length); });
  /* the cart takes the first two crates of the best ask */
  CRATES.ask[0][0].remove = T.take[0]; CRATES.ask[0][0].kind = "cart";
  CRATES.ask[0][1].remove = T.take[1]; CRATES.ask[0][1].kind = "cart";
  /* market sells fill the first three crates of the best bid: our crate moves from #4 to #1 */
  T.fills.forEach((tf, j) => { CRATES.bid[0][j].remove = tf; CRATES.bid[0][j].kind = "fill"; });
})();
