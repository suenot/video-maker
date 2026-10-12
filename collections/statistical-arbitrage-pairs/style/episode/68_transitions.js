/* ============================================================
   ENGINE 68 TRANSITIONS, statistical-arbitrage-pairs override: the film IRIS.
   scenes.json "wave" and "iris" both close / open an iris (a plain wipe is not in this
   world), "cut" does nothing. The runtime calls TR.waveOut/waveIn/irisOut/irisIn(ctx, u, c);
   c = [x, y] centre of the hole (default the middle of the frame).
   Also neutralises the shell's crab-sea look: black frame, no warm vignette, grey grain.
   ============================================================ */
const TR = (function () {
  const DUR = 0.7;
  (function look() {
    const root = document.getElementById("root"), vig = document.getElementById("vig"), grain = document.getElementById("grain");
    document.documentElement.style.background = document.body.style.background = "#0c0b0a";
    if (root) root.style.background = "#0c0b0a";
    if (vig) vig.style.display = "none"; /* K.film paints the burnt corners */
    /* preload the kit fonts so a canvas first-use never falls back (the shell only preloads the crab fonts) */
    const pre = document.getElementById("preload");
    if (pre) [["Playfair Display", 900], ["Oswald", 500], ["Oswald", 700], ["IBM Plex Mono", 500], ["IBM Plex Mono", 700], ["CJK SC", 900], ["CJK TC", 900]].forEach(([f, w]) => {
      const sp = document.createElement("span"); sp.style.fontFamily = '"' + f + '"'; sp.style.fontWeight = w; sp.textContent = "Aa Бб 0 复 複"; pre.appendChild(sp);
      if (document.fonts && document.fonts.load) document.fonts.load(w + " 30px \"" + f + "\"").catch(() => {});
    });
    if (grain) { grain.style.opacity = "0.2"; grain.style.mixBlendMode = "overlay"; grain.style.filter = "grayscale(1)"; }
  })();
  function iris(ctx, r, c) {
    const cx = (c || [960, 540])[0], cy = (c || [960, 540])[1];
    K.screen(ctx); K.iris(ctx, cx, cy, r);
  }
  const closeR = (u) => K.lerp(1250, 0, K.E.inOut(u)), openR = (u) => K.lerp(0, 1250, K.E.inOut(u));
  const out = (ctx, u, c) => { if (u > 0) iris(ctx, closeR(Math.min(1, u)), c); };
  const into = (ctx, u, c) => { if (u < 1) iris(ctx, openR(Math.max(0, u)), c); };
  return { DUR, waveOut: out, waveIn: into, irisOut: out, irisIn: into, WALL: K.P.ink, EDGE: K.P.paper };
})();
