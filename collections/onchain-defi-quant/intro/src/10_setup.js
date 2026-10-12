/* ============================================================
   INTRO 10 SETUP: variables, title DOM, timing (beat grid)
   Song: song_20s.m4a, "The Sandwich Gambit", vaudeville revival ~150 BPM
   (beat 0.40 s, bar 1.60 s). Cut = 1 instrumental bar from the outro +
   raw 6.39-25.75 s. Sung lines in the cut (whisper + downbeats):
     1.76 "MEV lurks in the mempool dark"
     4.97 "sandwich attacks leave their mark"
     8.15 "Read the book, read the book"
    11.35 "Microstructure off the hook"
    14.56 "... rings the matching bell"
    17.79 "Latency knows it well"          20.3-20.9 fade
   All story times are K.at(bar, beat) on the measured downbeats below.
   ============================================================ */
const K = DK, P = K.P, at = K.at;
K.G.BPM = 150;
K.G.BARS = [0.16, 1.76, 3.37, 4.97, 6.52, 8.15, 9.75, 11.35, 12.96, 14.56, 16.18, 17.79, 19.37, 20.97];
const DUR = 20.9;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  popUp: [at(0, 1) - 0.2, at(0, 1)],   /* 0.36 crouch, 0.56 Nibbs pops up behind the counter */
  magUp: at(0, 2.5),                   /* 1.16 magnifier up, looks right */
  pan: [at(1, 0), at(2, 0)],           /* 1.76 - 3.37 "MEV lurks": camera dollies to the mempool corner */
  dim: [at(1, 1.5), at(1, 3.5)],       /* the corner lamp flickers off */
  eyes: at(1, 2),                      /* 2.56 red visor eye glows in the dark */
  botUp: at(2, 0),                     /* 3.37 Slyce hops up onto the counter */
  frontClip: at(3, 0),                 /* 4.97 "sandwich attacks": front-run ticket jumps the queue */
  backClip: at(3, 2),                  /* 5.77 back-run ticket right behind the victim */
  fly: at(4, 0),                       /* 6.52 the three tickets fly into the next tray: a sandwich */
  bite: at(4, 2),                      /* 7.32 "leave their mark": bite + -1.2 % */
  gasp: at(4, 2.5),                    /* Nibbs: "!" */
  slap: [at(4, 3), at(5, 0)],          /* 7.75 - 8.15 the menu slaps into the camera */
  rows: at(5, 0),                      /* 8.15 "Read the book": rows pop */
  read2: at(6, 0),                     /* 9.75 second "read the book": best bid / ask + spread */
  whip: [at(6, 3), at(7, 0)],          /* 10.95 - 11.35 whip pan to the counter */
  amm: at(7, 0),                       /* 11.35 "Microstructure off the hook": scale + curve */
  trade: at(8, 0),                     /* 12.96 1 ETH drops in, the beam tips, USDC pops out */
  bellUp: at(8, 3),                    /* 14.16 paw raised */
  ding: at(9, 0),                      /* 14.56 "rings the matching bell" */
  doors: [at(9, 2), at(10, 0)],        /* 15.36 - 16.18 kitchen doors swing shut and open */
  sign: at(10, 0),                     /* 16.18 neon sign lights */
  letters: at(10, 0.5),
  plates: at(11, 0),                   /* 17.79 "Latency knows it well": episode plates pop */
  tip: at(11, 2),
  peek: at(11, 3),                     /* Slyce peeks in from the left */
  caught: at(12, 0),                   /* 19.37 caught by the magnifier flash */
};

/* ---------- variables (title text, language) ---------- */
const VARS = Object.assign({ title: "Onchain & DeFi|Quant", lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = VARS.lang || "en";
const TITLE_LINES = String(VARS.title || "Onchain & DeFi|Quant").split("|").map((s) => s.trim()).filter(Boolean);
const IS_CJK = LANG === "zh-CN" || LANG === "zh-TW";

/* ---------- title DOM: one span per character (letters drop in on the beat) ---------- */
const titleEl = document.getElementById("title");
if (LANG === "zh-CN") titleEl.classList.add("cjk-sc");
if (LANG === "zh-TW") titleEl.classList.add("cjk-tc");
const TITLE_CH = [];
TITLE_LINES.forEach((ln, li) => {
  const d = document.createElement("div");
  d.className = "ln " + (li === TITLE_LINES.length - 1 && TITLE_LINES.length > 1 ? "l1" : "l0");
  Array.from(ln).forEach((c) => {
    const s = document.createElement("span");
    s.className = "ch"; s.textContent = c === " " ? "\u00a0" : c;
    d.appendChild(s); TITLE_CH.push({ el: s, line: li, idx: TITLE_CH.length });
  });
  titleEl.appendChild(d);
});
const TITLE_LN = Array.from(titleEl.querySelectorAll(".ln"));
