/* ============================================================
   INTRO 10 SETUP: variables, title DOM, timing (beat grid), the act's data.
   Song: song_full.m4a = the whole song_raw.mp4 ("The Spread Trade Shuffle",
   ragtime at 150 BPM: beat 0.40 s, bar 1.60 s), loudnormed, 28.9 s.
   Each sung line is 2 bars (whisper word timings + librosa downbeats):
     0.12  "Two stocks walk into a chart, ha!"
     3.36  "Dancing close then drifting apart."
     6.57  "Buy the cheap one, short the rich,"
     9.78  "Spread's the tune we're trading with."
     12.97 "Trade the spread, trade the spread,"
     16.16 "Distance says these two should wed."
     19.34 "Cointegration rings the bell,"
     22.57 "Kalman's filter knows it well."   (title card; the band
           stops at 25.3, "well" is held to 28.5)
   All story times are K.at(bar, beat) on the measured downbeats below.
   ============================================================ */
const K = VK, P = K.P, at = K.at;
K.G.BPM = 150;
K.G.BARS = [0.12, 1.74, 3.36, 4.97, 6.57, 8.16, 9.78, 11.37, 12.97, 14.56, 16.16, 17.75, 19.34, 20.97, 22.57, 24.16];
const DUR = 28.9;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  irisIn: [0, 0.9],               /* iris opens on the closed curtain */
  curtain: [at(0, 0), at(1, 0)],  /* 0.12 - 1.74 curtain parts */
  enter: [at(0, 2), at(1, 2)],    /* penguins tap in from the wings */
  ha: at(1, 3),                   /* 2.94 "ha!": the cat winks at us, hat lift */
  close: at(2, 0),                /* 3.36 "dancing close" */
  drift: [at(3, 0), at(4, 0)],    /* 4.97 - 6.57 "drifting apart": the spring stretches, z -> +2 */
  spot: at(3, 3),                 /* 6.17 the cat spots z in the gold zone: "!" */
  trade: at(4, 0),                /* 6.57 "Buy the cheap one, short the rich" */
  tagBuy: at(4, 2),               /* 7.37 "buy the cheap one": +1 lands on the boater penguin */
  tagSell: at(5, 2),              /* 8.96 "short the rich": -1 lands on the top-hat penguin */
  tune: at(6, 0),                 /* 9.78 "Spread's the tune": back to the piano, the spring hums */
  chart2: at(6, 0),               /* the spread reel rolls down on the screen, +/-2 sigma bands */
  flips: [at(8, 0), at(9, 0)],    /* 12.97, 14.56 "Trade the spread" x2: a gold coin flip each (the bet) */
  catches: [at(8, 3), at(9, 3)],
  snap: at(10, 0),                /* 16.16 "Distance says": the spring snaps them back */
  hit: at(10, 1),                 /* 16.56 they meet: squash, heart */
  rain: at(11, 0),                /* 17.75 "should wed": coins rain, the cat holds out his hat */
  bell: [at(12, 0), at(12, 2), at(13, 0)], /* 19.34 "Cointegration rings the bell" */
  bow: at(13, 2),                 /* 21.77 bows */
  irisOut: [at(13, 2.5), at(14, 0)], /* 21.97 - 22.57 iris closes on the cat */
  title: at(14, 0),               /* 22.57 "Kalman's filter knows it well": the marquee lights */
  letters: at(14, 0.5),
  hatTip: at(15, 0),              /* 24.16 "knows it well": hat tip + wink */
  finale: at(16, 0),              /* 25.76 the held "well": ta-da, everybody hops */
  irisEnd: [at(17, 0), DUR],      /* 27.36 - 28.9 closing iris (stops on the cat's face) */
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
