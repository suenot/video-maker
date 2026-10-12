/* ============================================================
   INTRO 10 SETUP: beat grid, story times, variables, title DOM.
   Song: song_full.m4a = song_raw.mp4 0 - 64.0 s (fade 62.8 s, -14 LUFS),
   a ska song at ~153.5 BPM: beat 0.3909 s, bar 1.5636 s, first downbeat 0.095 s.
   Tempo: grid search of the percussive onset envelope (best period 0.3909 s)
   agrees with the sung phrase starts ("Marketmaker" 15.64 / 40.72 / 59.52 s =
   16 and 12 bars apart). Every sung line starts on an even bar:
     bar  0  instrumental intro (ska skank)
     bar  4  6.35  "Buy low, sell high"
     bar  6  9.48  "Quote both sides as the fish swim by"
     bar  8 12.60  "Tight spread, steady hand"
     bar 10 15.73  "Marketmaker! Marketmaker of the sand!"
     bar 12 18.86  "Down on the reef where the coral exchange is"
     bar 14 21.99  "An octopus quotes through the market's changes"
     bar 16 25.11  "Bid with one arm and an ask with another"
     bar 18 28.24  "Eight arms on the book, one spread to cover!"
     bar 20 31.37  chorus 2: "Buy low, sell high" / 22 "Quote both sides" /
            24 "Tight spread, steady hand" / 26 "Marketmaker!"
     bar 28 43.88  instrumental break (to bar 32)
     bar 32 50.13  final chorus: "Buy low" / 34 "Quote both sides" /
            36 "Tight spread" / 38 59.51 "Marketmaker!" -> title card
     bar 40 62.64  last note, fade to 64.0
   Story times are K.at(bar, beat).
   ============================================================ */
const K = MK, P = K.P, at = K.at;
K.G.BPM = 240 / 1.5636;
K.G.BARS = Array.from({ length: 42 }, (_, n) => Math.round((0.095 + n * 1.5636) * 1000) / 1000);
const DUR = 64.0;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const bl = (k) => k * K.beatLen();
const ap = (t, t0, d) => K.inv(t0, t0 + (d || 0.4), t);   /* appear 0..1 from t0 */
const since = (t, t0) => t - t0;

/* sung line windows: the octopus mouths along on 8th notes */
const LINES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 32, 34, 36, 38];
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
