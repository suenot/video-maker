/* ============================================================
   INTRO 10 SETUP: variables, title DOM, timing (beat grid)
   Song: song_full.m4a = the whole "The Sandwich Gambit" (30.8 s, uncut),
   vaudeville revival ~150 BPM (beat 0.40 s, bar 1.60 s). Sung lines
   (whisper + downbeats), each starts on a downbeat, 2 bars long:
     0.12 "Order book at level two"        3.41 "bids and asks in plain view"
     6.59 "MEV lurks in the mempool dark"  9.82 "sandwich attacks leave their mark"
    12.98 "Read the book, read the book"  16.21 "Microstructure off the hook"
    19.39 "... rings the matching bell"   22.62 "Latency knows it well"
    25.80 - 30.8 instrumental outro (title card)
   All story times are K.at(bar, beat) on the measured downbeats below.
   ============================================================ */
const K = DK, P = K.P, at = K.at;
K.G.BPM = 150;
K.G.BARS = [0.12, 1.81, 3.41, 5.02, 6.59, 8.20, 9.82, 11.40, 12.98, 14.61, 16.21, 17.81, 19.39, 21.01, 22.62, 24.22, 25.80, 27.38, 28.98, 30.58];
const DUR = 30.8;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  l2: at(0, 0),                        /* 0.12 "Order book at level two": menu card on the counter, rows pop */
  popUp: [at(1, 0) - 0.2, at(1, 0)],   /* 1.81 Nibbs pops up behind the counter */
  level2: at(1, 2),                    /* 2.61 the two level-2 rows get "L2" tags */
  plain: at(2, 0),                     /* 3.41 "bids and asks in plain view": depth bars grow, arms open */
  magUp: at(3, 2.5),                   /* 6.02 magnifier up, looks right */
  pan: [at(4, 0), at(5, 0)],           /* 6.59 - 8.20 "MEV lurks": camera dollies to the mempool corner */
  dim: [at(4, 1.5), at(4, 3.5)],       /* the corner lamp flickers off */
  eyes: at(4, 2),                      /* red visor eye glows in the dark */
  botUp: at(5, 0),                     /* 8.20 Slyce hops up onto the counter */
  frontClip: at(6, 0),                 /* 9.82 "sandwich attacks": front-run ticket jumps the queue */
  backClip: at(6, 2),                  /* back-run ticket right behind the victim */
  fly: at(7, 0),                       /* 11.40 the three tickets fly into the next tray: a sandwich */
  bite: at(7, 2),                      /* "leave their mark": bite + -1.2 % */
  gasp: at(7, 2.5),                    /* Nibbs: "!" */
  slap: [at(7, 3), at(8, 0)],          /* the menu slaps into the camera */
  rows: at(8, 0),                      /* 12.98 "Read the book": rows pop */
  read2: at(9, 0),                     /* 14.61 second "read the book": best bid / ask + spread */
  whip: [at(9, 3), at(10, 0)],         /* whip pan to the counter */
  amm: at(10, 0),                      /* 16.21 "Microstructure off the hook": scale + curve */
  trade: at(11, 0),                    /* 17.81 1 ETH drops in, the beam tips, USDC pops out */
  bellUp: at(11, 3),                   /* paw raised */
  ding: at(12, 0),                     /* 19.39 "rings the matching bell" */
  raceWhip: [at(13, 3), at(14, 0)],    /* whip pan to the two order rails */
  raceGo: at(14, 0),                   /* 22.62 "Latency knows it well": the race */
  slyArrive: at(14, 2),                /* Slyce's ticket arrives first: 4 ms */
  vicArrive: at(15, 1),                /* the victim's ticket arrives: 120 ms */
  doors: [at(15, 2), at(16, 0)],       /* 25.02 - 25.80 kitchen doors swing shut and open */
  sign: at(16, 0),                     /* 25.80 neon sign lights (outro) */
  letters: at(16, 0.5),
  plates: at(17, 0),                   /* 27.38 episode plates pop */
  tip: at(17, 2),
  peek: at(17, 3),                     /* Slyce peeks in from the left */
  caught: at(18, 0),                   /* 28.98 caught by the magnifier flash */
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
