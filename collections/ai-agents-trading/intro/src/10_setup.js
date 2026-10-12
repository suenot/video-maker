/* ============================================================
   INTRO 10 SETUP: variables, title DOM, world layout, timing (beat grid)
   Song: song_20s.m4a, 80s synth-funk with vocoder, ~113 BPM (beat 0.531 s,
   bar 2.12 s). Cut: one intro bar (raw 3.58-5.83) + the second chorus with
   its natural ending (raw 40.08-58.3), crossfade 30 ms, loudnorm -14 LUFS.
     0.08  instrumental bar: Beepo boots up
     2.24  "Beep boop, the signals run"
     6.46  "Agents trade till the day is done"
    10.70  "Observe, decide, then act again"
    14.95  "AI Agents for Trading, here they come!"  (title hit)
    17.09  "AI Agents for Trading!" (tag), ring-out to 20.5
   All story times are K.at(bar, beat) on the measured downbeats below.
   ============================================================ */
const K = AK, P = K.P, at = K.at;
K.G.BPM = 113;
K.G.BARS = [0.08, 2.24, 4.34, 6.46, 8.59, 10.70, 12.84, 14.95, 17.09, 19.21];
const DUR = 20.5;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  powerOn: [at(0), at(0) + 0.32],   /* CRT power-on line opens the film */
  noise: [at(0) + 0.2, at(0, 2)],   /* face screen boots: static */
  eyesOn: at(0, 2),                 /* 1.14 pixel eyes appear */
  crouch: at(0, 3.2),               /* anticipation before the hop */
  hop: at(1),                       /* 2.24 "Beep boop": hop + pull back */
  pullBack: [at(1), at(1, 2.5)],
  chart: at(1, 1),                  /* wall chart candles draw */
  signals: at(2),                   /* 4.34 "the signals run": cables light, pulses run */
  follow: [at(2, 2), at(3)],        /* camera follows the pulses to the team */
  trade: at(3),                     /* 6.46 "Agents trade": ticket pipeline starts */
  hopOver: [at(3) - 0.25, at(3) + 0.35],
  dayEnd: [at(3), at(5) - 0.4],     /* "till the day is done": dusk, clock runs */
  dive: [at(5) - 0.55, at(5)],      /* camera dives into Beepo's face screen */
  observe: at(5),                   /* 10.70 */
  decide: at(5, 2),                 /* 11.76 */
  act: at(6),                       /* 12.84 */
  again: at(6, 2),                  /* 13.90 loop returns to observe, counter 02 */
  crtOff: [at(7) - 0.42, at(7) - 0.04],  /* power-off squeeze into a line */
  title: at(7),                     /* 14.95 sign buzzes on */
  letters: at(7) + 0.25,
  jump: at(7, 2),
  medals: at(8),                    /* 17.09 tag line: medallions + confetti */
  final: at(9),
};

/* ---------- variables (title text, language) ---------- */
const VARS = Object.assign({ title: "AI Agents|for Trading", lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = VARS.lang || "en";
const TITLE_LINES = String(VARS.title || "AI Agents|for Trading").split("|").map((s) => s.trim()).filter(Boolean);
const IS_CJK = LANG === "zh-CN" || LANG === "zh-TW";

/* ---------- title DOM: one span per character (letters flicker on like neon) ---------- */
const titleEl = document.getElementById("title");
if (LANG === "zh-CN") titleEl.classList.add("cjk-sc");
if (LANG === "zh-TW") titleEl.classList.add("cjk-tc");
/* sizes chosen so the longest line fits the 1400 px inside of the neon sign (STYLE.md, type) */
const longest = Math.max(...TITLE_LINES.map((s) => s.length));
const WIDE = /[Ѐ-ӿ]/.test(VARS.title) ? 1500 : 1600; /* Cyrillic runs wider in Russo One */
const TITLE_SIZE = IS_CJK ? 128 : Math.min(128, Math.floor(WIDE / Math.max(9, longest)));
const TITLE_CH = [];
TITLE_LINES.forEach((ln, li) => {
  const d = document.createElement("div");
  d.className = "ln " + (li === TITLE_LINES.length - 1 && TITLE_LINES.length > 1 ? "l1" : "l0");
  const size = li === 0 || TITLE_LINES.length === 1 ? TITLE_SIZE : Math.round(TITLE_SIZE * 0.86);
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

/* ---------- world layout (world units; horizon = 700) ---------- */
const HORIZON = 700;
const WORLD = { x0: -600, x1: 4200 };
const SCREEN_BIG = { x: 260, y: 150, w: 860, h: 420 };   /* wall chart */
const WINDOW = { x: 1560, y: 110, w: 980, h: 460 };      /* synthwave window behind the team */
const CLOCK = { x: 2600, y: 170, w: 330, h: 120 };      /* 7-seg wall clock */
const PNL = { x: 2600, y: 400, w: 330, h: 170 };        /* PnL scoreboard */
const TUBE = { x: 3200, top: -200, y: 980 };            /* pneumatic tube to the exchange */
const BEEPO_A = [1000, 1060], BEEPO_B = [1600, 1070], BEEPO_S = 1.2;
const TEAM = [
  { kind: "analyst", x: 1950, y: 1030, s: 0.95, seed: 811 },
  { kind: "risk", x: 2375, y: 1030, s: 0.95, seed: 833 },
  { kind: "trader", x: 2800, y: 1030, s: 0.95, seed: 857 },
];
/* hands where tickets are handed over (world) */
const HAND = (i) => [TEAM[i].x + 95, TEAM[i].y - 150];
/* candles on the wall chart (language-free data) */
const CANDLES = [[40, 44, 38, 43], [43, 47, 42, 46], [46, 47, 41, 42], [42, 45, 40, 44], [44, 50, 43, 49], [49, 52, 47, 48], [48, 49, 44, 45], [45, 51, 45, 50], [50, 56, 49, 55], [55, 58, 52, 57], [57, 58, 53, 54], [54, 61, 54, 60]];
const TAPE = [{ sym: "NVDA", chg: "+3.2%" }, { sym: "AAPL", chg: "-0.4%" }, { sym: "BTC", chg: "+1.8%" }, { sym: "TSLA", chg: "-2.1%" }, { sym: "SPY", chg: "+0.6%" }, { sym: "MSFT", chg: "+0.9%" }];
/* tickets in the pipeline: one every two beats from the "Agents trade" downbeat */
const TICKETS = [
  { t: at(3), sym: "NVDA", dir: "up", qty: "100", pnl: "+0.4" },
  { t: at(3, 2), sym: "AAPL", dir: "down", qty: "50", pnl: "+1.1" },
  { t: at(4), sym: "BTC", dir: "up", qty: "2", pnl: "+1.9" },
  { t: at(4, 2), sym: "SPY", dir: "up", qty: "300", pnl: "+2.6" },
];
