/* ============================================================
   INTRO 10 SETUP: beat grid, story times, variables, title DOM.
   Song: song_short.m4a, cut from song_raw.mp4 on downbeats (29.6 s, -14 LUFS):
     raw  0.000 - 18.858  instrumental intro + full chorus (bars 0 - 12)
     raw 43.876 - 50.130  the instrumental break           (bars 12 - 16)
     raw 59.512 - 64.000  final "Marketmaker!" + ending     (bars 16 - 19, fade 28.4 s)
   Ska at ~153.5 BPM: beat 0.3909 s, bar 1.5636 s, first downbeat 0.095 s.
   Tempo: grid search of the percussive onset envelope (best period 0.3909 s)
   agrees with the sung phrase starts in the full song ("Marketmaker" 15.64 /
   40.72 / 59.52 s = 16 and 12 bars apart). Because every splice is on a
   downbeat of the same grid, the cut keeps one uniform grid:
     bar  0  0.10  instrumental intro (ska skank)
     bar  4  6.35  "Buy low, sell high"
     bar  6  9.48  "Quote both sides as the fish swim by"
     bar  8 12.60  "Tight spread, steady hand"
     bar 10 15.73  "Marketmaker! Marketmaker of the sand!"
     bar 12 18.86  instrumental break
     bar 16 25.11  "Marketmaker! Marketmaker of the sand!" -> title card
     bar 18 28.24  last note, fade to 29.6
   Story times are K.at(bar, beat).
   ============================================================ */
const K = MK, P = K.P, at = K.at;
K.G.BPM = 240 / 1.5636;
K.G.BARS = Array.from({ length: 20 }, (_, n) => Math.round((0.095 + n * 1.5636) * 1000) / 1000);
const DUR = 29.6;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const bl = (k) => k * K.beatLen();
const ap = (t, t0, d) => K.inv(t0, t0 + (d || 0.4), t);   /* appear 0..1 from t0 */
const since = (t, t0) => t - t0;

/* sung line windows: the octopus mouths along on 8th notes */
const LINES = [4, 6, 8, 10, 16];
function singAt(t) {
  for (const b of LINES) {
    const t0 = at(b, 0) - 0.1, t1 = at(b + 1, 3);
    if (t >= t0 && t < t1) { const ph = ((t - t0) / (K.beatLen() / 2)) % 1; return Math.max(0, Math.sin(ph * Math.PI)) * (0.55 + 0.35 * K.hash(Math.floor((t - t0) / (K.beatLen() / 2)), b)); }
  }
  return 0;
}

/* ---------- variables ---------- */
const VARS = Object.assign({ title: "Marketmaker", subtitle: "Algorithmic Trading Explained", lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = VARS.lang || "en";
const IS_CJK = LANG === "zh-CN" || LANG === "zh-TW";

/* ---------- title DOM: one span per character (letters pop in on the beat) ---------- */
const titleEl = document.getElementById("title");
if (LANG === "zh-CN") titleEl.classList.add("cjk-sc");
if (LANG === "zh-TW") titleEl.classList.add("cjk-tc");
const TITLE_LINES = [String(VARS.title || "Marketmaker"), String(VARS.subtitle || "")].filter(Boolean);
const TITLE_CH = [];
const TITLE_LN = TITLE_LINES.map((ln, li) => {
  const d = document.createElement("div");
  d.className = "ln l" + li;
  Array.from(ln).forEach((c) => {
    const s = document.createElement("span");
    s.className = "ch"; s.textContent = c === " " ? " " : c;
    d.appendChild(s); TITLE_CH.push({ el: s, line: li, idx: TITLE_CH.length, k: d.childNodes.length - 1 });
  });
  titleEl.appendChild(d);
  return d;
});
