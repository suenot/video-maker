/* ============================================================
   EPISODE 69 RUNTIME: the one paused GSAP timeline per scene.
   A scene file ends with   RUN(draw);   where draw(g, t) paints one frame:
     g = episode-global seconds (SCENE.start + t), t = scene-local seconds.
   RUN adds: the in/out transitions from scenes.json, error-to-canvas (never a
   silent black frame), paper grain stepping at the boil rate, and the
   debug strip (time, speaker, word) when built with --debug.
   ============================================================ */
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const DUR = +(SCENE.end - SCENE.start).toFixed(3);
const grainEl = document.getElementById("grain");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .35  0 0 0 1.4 -.2'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";
/* shorthands every scene uses */
const pop = (g, g0, d) => K.inv(g0, g0 + (d || 0.4), g); /* appear 0..1 starting at g0 */
const span = (g, g0, g1) => K.inv(g0, g1, g);            /* progress 0..1 over [g0, g1] */
const hold = (g, g0, g1, fade) => K.ss(g0, g0 + (fade || 0.3), g) * (1 - K.ss(g1 - (fade || 0.3), g1, g)); /* 0 -> 1 -> 0 */

function RUN(draw) {
  function render(t) {
    const g = SCENE.start + t;
    try {
      K.begin(ctx, g, { x: 960, y: 540, z: 1 });
      draw(g, t);
      const td = TR.DUR;
      if (SCENE.in === "wave" && t < td) TR.waveIn(ctx, t / td);
      if (SCENE.in === "iris" && t < td) TR.irisIn(ctx, t / td, SCENE.inAt);
      if (SCENE.out === "wave" && t > DUR - td) TR.waveOut(ctx, (t - (DUR - td)) / td);
      if (SCENE.out === "iris" && t > DUR - td) TR.irisOut(ctx, (t - (DUR - td)) / td, SCENE.outAt);
    } catch (err) {
      K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "26px monospace";
      ctx.fillText(String((err && err.stack) || err).slice(0, 150), 20, 50);
    }
    if (SCENE.debug) {
      K.screen(ctx); ctx.fillStyle = "rgba(0,0,0,0.72)"; ctx.fillRect(0, 1040, 1920, 40);
      ctx.fillStyle = "#fff"; ctx.font = "26px monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
      ctx.fillText(SCENE.id + "  g=" + g.toFixed(2) + "  t=" + t.toFixed(2) + "  spk=" + NR.who(g) + "  env=" + NR.env(g).toFixed(2) + "  \"" + NR.word(g) + "\"", 16, 1060);
    }
    const f = K.boilFrame(g);
    grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
  }
  const TL = gsap.timeline({ paused: true });
  const drv = { _t: 0 };
  Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
  TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
  render(0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = TL;
  window.__render = render;
}
