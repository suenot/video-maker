/* ============================================================
   INTRO 10 SETUP: beat grid, story beats, variables, title DOM, data.
   Song: song_20s.m4a, 60s surf rock at 161.5 BPM (beat 0.372 s, bar 1.486 s).
   Cut = raw 0.45-18.50 (4 instrumental bars + the whole chorus) spliced on
   the downbeat into raw 2.02-4.03 (instrumental tail, 0.85 s fade).
   Sung lines (whisper word times, shifted to the cut):
     6.41 "Ride the calm,"   7.89 "ride the storm,"
     9.38 "Every regime has its form,"
    12.40 "Measure the swell and read the sea,"
    15.39 "Volatility Modeling and Regimes!"
   Every story time below is K.at(bar, beat) on the measured downbeats.
   ============================================================ */
const K = VK, P = K.P, at = K.at;
K.G.BPM = 161.5;
K.G.BARS = [0.35, 1.88, 3.39, 4.90, 6.41, 7.89, 9.38, 10.89, 12.40, 13.89, 15.39, 16.86, 18.35, 19.84];
const DUR = 20.1;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  tiltDown: [0, at(1)],            /* 0 - 1.88 camera tilts down from the striped sun to the sea */
  surfIn: [0.2, at(1)],            /* Siggy glides in on glassy little waves, lands on the downbeat */
  shaka: at(1),                    /* 1.88 waves hello (shaka), shades glint on beat 2 */
  gauge: at(2),                    /* 3.39 looks down at the tiny gauge on the board, taps it */
  tap: at(2, 2),
  horizon: at(3),                  /* 4.90 turns to the horizon: a storm bank rolls up */
  surprise: at(3, 1.5),            /* shades slide down, eyes pop, "!" */
  crouch: at(3, 3),                /* anticipation before the ride */
  calm: at(4),                     /* 6.41 "Ride the calm": carving small waves, turquoise beam */
  storm: at(5),                    /* 7.89 "ride the storm": REGIME FLIP, beam turns coral, the wave stands up */
  cluster: at(5, 2),               /* big waves follow big waves (a second set rolls in) */
  dial: [at(5, 3.4), at(6)],       /* 9.15 - 9.38 dive into the board's gauge (dial iris) */
  chart: at(6),                    /* 9.38 "Every regime has its form": wave heights become a chart */
  forms: at(7),                    /* 10.89 the two distributions (narrow calm, fat storm) */
  point: at(7, 2),                 /* Siggy pops up and points at the storm band */
  roll: [at(8, -1), at(8)],        /* 12.03 - 12.40 the poster rolls up onto the beach */
  board: at(8),                    /* 12.40 "Measure the swell": the surf-report board, GARCH written in chalk */
  forecast: at(9),                 /* 13.89 "read the sea": the forecast gauge swings to storm */
  grab: at(9, 2),                  /* Siggy picks the storm gun board */
  tilt: [at(10, -1.5), at(10)],    /* 14.83 - 15.39 camera tilts up into the clearing sky */
  title: at(10),                   /* 15.39 "Volatility Modeling and Regimes!" title hit */
  line2: at(10, 2),
  medals: at(11),                  /* 16.86 five episode medals pop on eighth notes */
  hang: at(12),                    /* 18.35 hop on the wave, spray */
  tip: at(12, 2),                  /* shades up on the head, happy squint */
};

/* ---------- variables (title text, language) ---------- */
const VARS = Object.assign({ title: "Volatility Modeling|& Regimes", lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = VARS.lang || "en";
const TITLE_LINES = String(VARS.title || "Volatility Modeling|& Regimes").split("|").map((s) => s.trim()).filter(Boolean);
const IS_CJK = LANG === "zh-CN" || LANG === "zh-TW";

/* ---------- title DOM: one span per character (letters drop in on the beat) ---------- */
const titleEl = document.getElementById("title");
if (LANG === "zh-CN") titleEl.classList.add("cjk-sc");
if (LANG === "zh-TW") titleEl.classList.add("cjk-tc");
const TITLE_CH = [];
TITLE_LINES.forEach((ln, li) => {
  const d = document.createElement("div");
  d.className = "ln " + (li === 0 ? "l0" : "l1");
  Array.from(ln).forEach((c) => {
    const s = document.createElement("span");
    s.className = "ch"; s.textContent = c === " " ? " " : c;
    d.appendChild(s); TITLE_CH.push({ el: s, line: li, idx: TITLE_CH.length });
  });
  titleEl.appendChild(d);
});
const TITLE_LN = Array.from(titleEl.querySelectorAll(".ln"));
/* fit: line 1 at most 150 px (Lobster) / 140 px (CJK), line 2 at most 74 px, both inside 1700 px */
function fitTitle() {
  const fam = (li) => (IS_CJK ? (LANG === "zh-CN" ? '"CJK SC"' : '"CJK TC"') : li === 0 ? '"Lobster"' : '"Nunito"');
  TITLE_LN.forEach((d, li) => {
    const max = li === 0 ? (IS_CJK ? 140 : 150) : 74, wt = li === 0 && !IS_CJK ? 400 : 900;
    const txt = li === 0 ? TITLE_LINES[li] : TITLE_LINES[li].toUpperCase();
    ctx.save(); ctx.font = `${wt} 100px ${fam(li)}`; if (li > 0 && !IS_CJK) ctx.letterSpacing = "9px";
    const w100 = ctx.measureText(txt).width; ctx.restore();
    const size = Math.max(40, Math.min(max, Math.floor((1700 / Math.max(1, w100)) * 100)));
    d.style.fontSize = size + "px"; d.dataset.size = size;
  });
}

/* ---------- data: daily returns with a calm / storm / calm regime path (seeded) ---------- */
const RET = [], SIG = [], REG = [];
(function () {
  const rnd = K.mulberry(20261012), gauss = () => { let u = 0, v = 0; while (u === 0) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(K.TAU * v); };
  /* GARCH(1,1): sigma2 = omega + alpha * r^2 + beta * sigma2 (alpha 0.15); the regime sets omega and beta (storms persist, calm forgets fast) */
  let s2 = 0.33;
  for (let i = 0; i < 60; i++) {
    const storm = i >= 26 && i < 44, om = storm ? 0.9 : 0.12;
    s2 = om + 0.15 * (i ? RET[i - 1] * RET[i - 1] : 0) + (storm ? 0.7 : 0.5) * s2;
    const s = Math.sqrt(s2), r = s * gauss();
    RET.push(Math.max(-6.5, Math.min(6.5, r))); SIG.push(s); REG.push(storm ? 1 : 0);
  }
})();
const BANDS = [{ from: 0, to: 25, regime: "calm" }, { from: 26, to: 43, regime: "storm" }, { from: 44, to: 59, regime: "calm" }];
