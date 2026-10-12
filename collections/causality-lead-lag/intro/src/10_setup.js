/* ============================================================
   INTRO 10 SETUP: variables, title DOM, timing (beat grid), story beats.
   Song: song_full.m4a (song_raw.mp4 minus 0.20 s of lead silence, 64.5 s,
   jazz-noir spy theme, 120 BPM: beat 0.5 s, bar 2.0 s). Downbeats were
   measured with librosa (bars 0-23) and extrapolate at 120 BPM after.
   Word timings (parakeet transcript, shifted -0.20 s):
     3.84 "Lead and lag," 5.84 "step by step," 7.83 "Follow the trail that
     the markets left," 11.85 "Find the cause and test it twice," 15.82
     "Causality and Lead-Lag in Markets!" 19.82 "A detective fox with a
     magnifying glass," 23.83 "Follows the footprints of prices that pass,"
     27.83 "Who moved first and who followed behind," 31.84 "Correlation's a
     clue but not proof, keep in mind!" 35.84 chorus again (lead and lag /
     step by step / follow the trail / find the cause), 47.84 "Causality and
     Lead-Lag in Markets", 51.84 break, 53.84 "find the cause and test it
     twice", 55.84 "Causality and Lead-Lag in Markets!", 59.84 outro.
   All story times are K.at(bar, beat) on these downbeats.
   ============================================================ */
const K = CK, P = K.P, at = K.at;
K.G.BPM = 120;
K.G.BARS = [1.82, 3.84, 5.84, 7.83, 9.83, 11.85, 13.82, 15.82, 17.82, 19.82, 21.84, 23.83,
  25.85, 27.83, 29.85, 31.84, 33.84, 35.84, 37.86, 39.85, 41.83, 43.85, 45.85, 47.84];
const DUR = 64.5;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();
/* pop helper: 0..1 over d seconds starting at t0 */
const ap = (t, t0, d) => K.inv(t0, t0 + (d || 0.4), t);

/* ---------- scene windows (on downbeats) ---------- */
const S = {
  street: [0, at(7)],            /* 0 - 15.82  rain, lamp, the two trails, magnifier on the lag */
  paper: [at(7), at(9)],         /* 15.82 - 19.82  spinning newspaper lands in the office */
  office: [at(7), at(11)],       /* the office set (newspaper pull-back, fox, magnifier eye) */
  map: [at(11) - 0.5, at(13)],   /* 23.33 - 27.83  iris through the lens: city map, footprints */
  lineup: [at(13), at(15)],      /* 27.83 - 31.84  who moved first */
  board: [at(15), at(26)],       /* 31.84 - 53.84  clue card, cork board, confounder */
  title: [at(25, 2), DUR],       /* 52.84 - 64.5   blinds wipe, street, title */
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
