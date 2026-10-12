/* ============================================================
   INTRO 10 SETUP: variables, title DOM, timing (beat grid), story beats.
   Song: song_short.m4a (song_short_raw.mp4 cut at 33.2 s with a 0.9 s fade,
   -14 LUFS), jazz-noir spy theme at about 123.8 BPM (bar 1.94 s).
   Downbeats measured with librosa. Word timings (whisper small.en + parakeet):
     0 - 7.9   instrumental (4 bars)
     7.92  "Lead and lag,"            9.87  "step by step,"
     11.80 "Follow the trail that the markets left,"
     15.67 "Find the cause and test it twice,"
     19.53 "Causality and Lead-" 23.38 "-Lag in Markets!" (held to 27.9)
     27.26 - 33.2 outro
   All story times are K.at(bar, beat) on these downbeats.
   ============================================================ */
const K = CK, P = K.P, at = K.at;
K.G.BPM = 123.8;
K.G.BARS = [0.16, 2.09, 4.04, 5.97, 7.92, 9.87, 11.80, 13.72, 15.67, 17.58, 19.53, 21.46,
  23.38, 25.33, 27.26, 29.21, 31.15];
const DUR = 33.2;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();
/* pop helper: 0..1 over d seconds starting at t0 */
const ap = (t, t0, d) => K.inv(t0, t0 + (d || 0.4), t);

/* ---------- scene windows (on downbeats) ---------- */
const S = {
  open: [0, at(2)],              /* 0 - 4.04     moon, rain, the lamp comes on: the fox */
  office: [at(2), at(4)],        /* 4.04 - 7.92  spinning newspaper "A → B", hat tip, lens eye */
  street: [at(4) - 0.5, at(6)],  /* 7.42 - 11.80 iris onto the street: "Lead and lag, step by step" */
  map: [at(6), at(8)],           /* 11.80 - 15.67 lightning cut: "Follow the trail" from above */
  board: [at(8), at(12)],        /* 15.67 - 23.38 "Find the cause, test it twice", "Causality": confounder */
  title: [at(11, 3), DUR],       /* 22.9 - 33.2  blinds wipe: "Lead-Lag in Markets!", title, outro */
};

/* ---------- variables (title text, language) ---------- */
const VARS = Object.assign({ title: "Causality & Lead-Lag|in Markets", lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = VARS.lang || "en";
const TITLE_LINES = String(VARS.title || "Causality & Lead-Lag|in Markets").split("|").map((s) => s.trim()).filter(Boolean);
const IS_CJK = LANG === "zh-CN" || LANG === "zh-TW";

/* ---------- title DOM: one span per character (letters drop in on the beat) ---------- */
const titleEl = document.getElementById("title");
if (LANG === "zh-CN") titleEl.classList.add("cjk-sc");
if (LANG === "zh-TW") titleEl.classList.add("cjk-tc");
/* Yanone Kaffeesatz 700 is condensed: about 0.42 em per Latin glyph, 0.47 em Cyrillic, 1 em CJK */
const longest = Math.max(...TITLE_LINES.map((s) => s.length));
const PER = IS_CJK ? 1.0 : /[Ѐ-ӿ]/.test(VARS.title) ? 0.47 : 0.43;
const TITLE_SIZE = Math.min(IS_CJK ? 108 : 124, Math.floor(1380 / (PER * Math.max(6, longest))));
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
