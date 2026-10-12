/* ============================================================
   EPISODE 60 NARRATION: read the precomputed sync data (tools/build_sync.py).
   build_scene.py injects, before this file:
     SCENE = { id, start, end, slide, title }   (episode-global seconds)
     SYNC  = { fps, env, spk, f0, words, phrases }  sliced to the scene (+-2 s)
   All times in scene code are EPISODE-GLOBAL seconds (g), the same numbers
   as SCENES.md and subtitles.json. render() gets g = SCENE.start + local t.

   NR.env(g)            loudness 0..1 (30 fps, interpolated)
   NR.who(g)            "c" crab | "p" parrot | "." nobody
   NR.talk(g, who)      mouth opening 0..1 for that host (0 when the other talks)
   NR.cue(word, after)  global start time of the first word matching `word`
                        (string = case-insensitive whole word, or RegExp) at or
                        after `after`. Logs a warning and returns `after` if absent.
   NR.cueEnd(word, after) same, end time of the word
   NR.accent(g, who)    1 on stressed word onsets of that host, decaying (gestures)
   NR.accents(who)      list of accent times in the scene
   NR.since(g, who)     seconds since this host started the current turn (-1 if silent)
   NR.word(g)           the word being spoken at g (or "")
   ============================================================ */
const NR = (function () {
  const FPS = SYNC.fps, F0 = SYNC.f0, ENV = SYNC.env, SPK = SYNC.spk;
  const ALPH = "0123456789abcdefghijklmnopqrstuvwxyz";
  const lv = (i) => { const c = ENV.charAt(i - F0); return c ? ALPH.indexOf(c) / 35 : 0; };
  const env = (g) => { const x = g * FPS, i = Math.floor(x), f = x - i; return lv(i) * (1 - f) + lv(i + 1) * f; };
  const who = (g) => SPK.charAt(Math.floor(g * FPS) - F0) || ".";
  /* speaker gate with a soft 2-frame edge, so a mouth does not snap shut mid-word */
  function talk(g, w) {
    let on = 0;
    for (let k = -2; k <= 2; k++) if (who(g + k / FPS) === w) on += 0.2;
    const e = env(g);
    /* syllable flutter: the envelope already moves at speech rate; add a small seeded wobble */
    const fl = 0.85 + 0.15 * Math.sin(g * 23.0 + Math.sin(g * 7.1) * 2);
    return Math.max(0, Math.min(1, on * Math.pow(e, 0.8) * 1.15 * fl));
  }
  const W = SYNC.words; /* [start, end, text, who] */
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9.$%+-]/g, "").replace(/[.]+$/, "");
  function find(word, after) {
    const re = word instanceof RegExp ? word : null, key = re ? null : norm(String(word));
    for (let i = 0; i < W.length; i++) {
      if (W[i][0] < (after || 0) - 1e-6) continue;
      if (re ? re.test(W[i][2]) : norm(W[i][2]) === key) return W[i];
    }
    console.warn("[NR.cue] not found:", String(word), "after", after);
    return null;
  }
  const cue = (word, after) => { const w = find(word, after); return w ? w[0] : (after || SCENE.start); };
  const cueEnd = (word, after) => { const w = find(word, after); return w ? w[1] : (after || SCENE.start); };
  /* accents: onsets of content words (>= 4 letters) where the voice is loud */
  const ACC = { c: [], p: [] };
  W.forEach((w) => {
    if (w[3] !== "c" && w[3] !== "p") return;
    if (norm(w[2]).length < 4) return;
    let pk = 0; for (let k = 0; k < 8; k++) pk = Math.max(pk, env(w[0] + k / FPS));
    if (pk > 0.72) { const L = ACC[w[3]]; if (!L.length || w[0] - L[L.length - 1] > 0.9) L.push(w[0]); }
  });
  function accent(g, w) {
    const L = ACC[w] || []; let best = 0;
    for (let i = 0; i < L.length; i++) { const d = g - L[i]; if (d >= -0.12 && d < 0.9) best = Math.max(best, d < 0 ? 1 + d / 0.12 : Math.exp(-4 * d)); }
    return best;
  }
  function since(g, w) {
    if (who(g) !== w) return -1;
    let k = 0; while (k < 30 * 60 && who(g - (k + 1) / FPS) === w) k++;
    return k / FPS;
  }
  function word(g) { for (let i = 0; i < W.length; i++) if (g >= W[i][0] && g < W[i][1]) return W[i][2]; return ""; }
  return { env, who, talk, cue, cueEnd, accent, accents: (w) => ACC[w].slice(), since, word, words: W };
})();
