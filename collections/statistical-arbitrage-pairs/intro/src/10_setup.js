/* ============================================================
   INTRO 10 SETUP: variables, title DOM, timing (beat grid), the act's data.
   Song: song_20s.m4a, "The Spread Trade Shuffle", ragtime at 150 BPM
   (beat 0.40 s, bar 1.60 s), cut 0-6.57 + 12.97-26.6 of song_raw.mp4,
   spliced on a downbeat. Each sung line is 2 bars:
     0.12  "Two stocks walk into a chart, ha!"
     3.36  "Dancing close then drifting apart."
     6.56  "Trade the spread, trade the spread,"
     9.73  "Distance says these two should wed."
     12.91 "Cointegration rings the bell,"
     16.14 "Kalman's filter knows it well."   (title card)
   All story times are K.at(bar, beat) on the measured downbeats below.
   ============================================================ */
const K = VK, P = K.P, at = K.at;
K.G.BPM = 150;
K.G.BARS = [0.12, 1.74, 3.36, 4.97, 6.56, 8.13, 9.73, 11.33, 12.91, 14.55, 16.14, 17.74, 19.33];
const DUR = 20.1;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  irisIn: [0, 0.9],               /* iris opens on the closed curtain */
  curtain: [at(0, 0), at(1, 0)],  /* 0.12 - 1.74 curtain parts */
  enter: [at(0, 2), at(1, 2)],    /* penguins tap in from the wings */
  ha: at(1, 3),                   /* 2.94 "ha!": the cat winks at us, hat lift */
  close: at(2, 0),                /* 3.36 "dancing close" */
  drift: [at(3, 0), at(4, 0)],    /* 4.97 - 6.56 "drifting apart": the spring stretches, z -> +2 */
  spot: at(3, 3),                 /* 6.17 the cat spots z in the gold zone: "!" */
  trade: at(4, 0),                /* 6.56 "Trade the spread" */
  tagSell: at(4, 2),              /* tag -1 lands on the rich (top hat) penguin */
  tagBuy: at(4, 3),               /* tag +1 lands on the cheap (boater) penguin */
  flip: at(5, 0),                 /* 8.13 "trade the spread" #2: the cat flips a gold coin (bets) */
  catch: at(5, 3),                /* 9.33 coin back in the glove */
  snap: at(6, 0),                 /* 9.73 "Distance says": the spring snaps them back */
  hit: at(6, 1),                  /* 10.13 they meet: squash, heart */
  rain: at(7, 0),                 /* 11.33 "should wed": coins rain, the cat catches them in his hat */
  bell: [at(8, 0), at(8, 2), at(9, 0)], /* 12.91 "Cointegration rings the bell" */
  chart2: at(8, 0),               /* the screen shows the spread reverting inside +/-2 */
  bow: at(9, 2),                  /* 15.35 bows */
  irisOut: [at(9, 2.5), at(10, 0)], /* 15.55 - 16.14 iris closes on the cat */
  title: at(10, 0),               /* 16.14 "Kalman's filter knows it well": the marquee lights */
  letters: at(10, 0.5),
  hatTip: at(11, 0),              /* 17.74 "knows it well": hat tip + wink */
  irisEnd: [at(12, 0), DUR],      /* 19.33 - 20.1 closing iris (stops on the cat's face) */
};

/* ---------- variables (title text, language) ---------- */
const VARS = Object.assign({ title: "Statistical Arbitrage|& Pairs Trading", lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = VARS.lang || "en";
const TITLE_LINES = String(VARS.title || "Statistical Arbitrage|& Pairs Trading").split("|").map((s) => s.trim()).filter(Boolean);
const IS_CJK = LANG === "zh-CN" || LANG === "zh-TW";

/* ---------- title DOM: one span per character (letters drop in on the beat) ---------- */
const titleEl = document.getElementById("title");
if (LANG === "zh-CN") titleEl.classList.add("cjk-sc");
if (LANG === "zh-TW") titleEl.classList.add("cjk-tc");
const TITLE_CH = [];
TITLE_LINES.forEach((ln, li) => {
  const d = document.createElement("div");
  d.setAttribute("data-layout-allow-occlusion", "");
  d.className = "ln " + (li === TITLE_LINES.length - 1 && TITLE_LINES.length > 1 ? "l1" : "l0");
  const inner = document.createElement("span"); inner.className = "fit"; d.appendChild(inner);
  Array.from(ln).forEach((c) => {
    const s = document.createElement("span");
    s.className = "ch"; s.setAttribute("data-layout-allow-occlusion", ""); s.textContent = c === " " ? " " : c;
    inner.appendChild(s); TITLE_CH.push({ el: s, line: li, idx: TITLE_CH.length });
  });
  titleEl.appendChild(d);
});
const TITLE_LN = Array.from(titleEl.querySelectorAll(".ln"));

/* ---------- the act: stage layout (world px at z = 1) ---------- */
const FLOOR = K.FLOOR_Y;
const PIANO = { x: 300, y: 930, s: 0.66 };
const CAT = { x: 525, y: 990, s: 1.05 };
const BELL = { x: 680, y: 985, stoolS: 0.66, s: 0.72 };
const PEN = { y: 965, s: 0.9, A0: 1040, B0: 1250, A1: 830, B1: 1580 }; /* A = rich (top hat), B = cheap (boater) */
const GAUGE = { x: 1000, y: 200, r: 118 };
const SCREEN = { x: 1200, y: 425, w: 760, h: 270 };

/* the price history projected on the screen: one common walk + a spread that
   stays near 0, opens to +2 sigma and reverts (the act's story) */
const NPTS = 64;
const CHART = (function () {
  const rnd = K.mulberry(20261012), A = [], B = [], S = [];
  let c = 100;
  for (let i = 0; i < NPTS; i++) {
    c += (rnd() - 0.48) * 1.6;
    const u = i / (NPTS - 1);
    const open = K.ss(0.35, 0.62, u) * (1 - K.ss(0.72, 0.86, u));
    const sp = 2.15 * open + (rnd() - 0.5) * 0.5 * (1 - open) + Math.sin(i * 0.9) * 0.25;
    S.push(sp); A.push(c + sp * 2.2); B.push(c - sp * 2.2);
  }
  return { A, B, S };
})();
