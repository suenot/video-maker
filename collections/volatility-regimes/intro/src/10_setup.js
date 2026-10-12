/* ============================================================
   INTRO 10 SETUP: beat grid, story beats, variables, title DOM, data.
   Song: song_short.m4a = song_short_raw.mp4 trimmed to 31.0 s (silence cut,
   0.8 s fade, loudnorm -14). 60s surf rock at 161.5 BPM (beat 0.372 s,
   bar 1.486 s). Sung lines (whisper word times):
     3.37 "Ride the calm,"   4.85 "ride the storm,"
     6.34 "Every regime has its form,"
     9.29 "Measure the swell and read the sea,"
    12.24 "Volatility Modeling and Regimes!"
   15.16 - 31.0 is instrumental: hidden states switch (HMM), the leverage
   effect, a cluster of big sets, then the title card on the ending.
   Every story time below is K.at(bar, beat) on the measured downbeats.
   ============================================================ */
const K = VK, P = K.P, at = K.at;
K.G.BPM = 161.5;
K.G.BARS = [0.44, 1.93, 3.37, 4.85, 6.34, 7.80, 9.29, 10.75, 12.24, 13.70, 15.16, 16.65, 18.09, 19.57, 21.06, 22.52, 23.99, 25.47, 26.94, 28.42, 29.90];
const DUR = 31.0;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();

/* ---------- story beats (on the song's downbeats) ---------- */
const T = {
  tiltDown: [0, at(1)],            /* 0 - 1.93 camera tilts down from the striped sun to the sea */
  surfIn: [0.1, at(1)],            /* Siggy glides in on glassy little waves, lands on the downbeat */
  shaka: at(1),                    /* 1.93 waves hello (shaka), shades glint on beat 2 */
  gauge: at(1, 2),                 /* 2.67 looks down at the tiny gauge on the board, taps it */
  tap: at(1, 3),
  calm: at(2),                     /* 3.37 "Ride the calm": hop, carving small waves, turquoise beam */
  horizon: at(2, 1),               /* a storm bank rolls up on the horizon */
  surprise: at(2, 2),              /* shades slide down, eyes pop, "!" */
  crouch: at(2, 3.3),              /* anticipation before the drop */
  storm: at(3),                    /* 4.85 "ride the storm": REGIME FLIP, beam turns coral, the wave stands up */
  cluster: at(3, 2),               /* big waves follow big waves (a second set rolls in) */
  dial: [at(3, 3.4), at(4)],       /* dive into the board's gauge (dial iris) */
  chart: at(4),                    /* 6.34 "Every regime has its form": wave heights become a chart */
  forms: at(5),                    /* 7.80 "...has its form": the two distributions */
  point: at(5, 2),                 /* Siggy pops up and points at the storm band */
  roll: [at(6, -1), at(6)],        /* the poster rolls up onto the beach */
  board: at(6),                    /* 9.29 "Measure the swell": the surf-report board, GARCH in chalk */
  forecast: at(7),                 /* 10.75 "read the sea": the forecast dial swings to storm */
  grab: at(7, 2),                  /* Siggy picks the storm gun board */
  tilt: [at(8, -0.9), at(8)],      /* camera tilts up into the sky, cut on the downbeat */
  hmm: at(8),                      /* 12.24 "Volatility Modeling and Regimes!": two hidden states (buoys) */
  hmmSw: [at(9, 2), at(10, 2), at(11), at(11, 2)], /* instrumental: hidden states switch */
  unroll: [at(12, -1), at(12)],    /* a poster unrolls down over the sea */
  lev: at(12),                     /* 18.09 leverage effect: drops raise volatility more than rises */
  levPoint: at(13),                /* 19.57 Siggy points at the drop's spike */
  roll2: [at(14, -1), at(14)],     /* the poster rolls up onto the sea again */
  ride: at(14),                    /* 21.06 a cluster of big sets, then calm comes back */
  calmBack: at(16),                /* 23.99 the beam turns turquoise again */
  tilt2: [at(17, -0.9), at(17)],   /* tilt up into the sunset */
  title: at(17),                   /* 25.47 title card on the ending */
  line2: at(17, 2),
  medals: at(18),                  /* 26.94 five episode medals pop on eighth notes */
  hang: at(19),                    /* 28.42 hop on the wave, spray */
  tip: at(19, 2),                  /* shades up on the head, happy squint */
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
