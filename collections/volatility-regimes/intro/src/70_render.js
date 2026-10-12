/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
   0.00 - 9.38  sea set: surf in, shaka, gauge, storm bank, "ride the calm",
                "ride the storm" (regime flip, the wave stands up, a second set)
   9.15 - 9.38  dial iris: through the board's gauge into the poster
   9.38 - 12.4  "Every regime has its form": returns over regime bands, sigma, two humps
   12.03- 12.4  the poster rolls up onto the beach
   12.4 - 15.39 "Measure the swell and read the sea": GARCH on the surf-report board,
                the dial swings to storm, Siggy picks the storm gun; tilt up to the sky
   15.39- 20.1  "Volatility Modeling and Regimes!": title, medals, hop, shades up
   ============================================================ */
function dialRing(cx, cy, r) {
  K.screen(ctx); ctx.save(); ctx.lineCap = "butt";
  const w = Math.max(14, r * 0.07);
  [[0, 0.4, P.calm], [0.4, 0.7, P.sigma], [0.7, 1, P.storm]].forEach((z) => { ctx.beginPath(); ctx.arc(cx, cy, r + w / 2, Math.PI + Math.PI * 2 * z[0], Math.PI + Math.PI * 2 * z[1]); ctx.strokeStyle = z[2]; ctx.lineWidth = w; ctx.stroke(); });
  ctx.lineWidth = 6; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r, 0, K.TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, r + w, 0, K.TAU); ctx.stroke();
  ctx.restore();
}
function rollCylinder(y) {
  K.screen(ctx);
  const pts = K.rectPts(-20, y - 34, K.W + 40, 68, 6);
  K.shape(ctx, pts, { fill: P.cream, w: 6, boil: 1, seed: 830, shade: { color: P.creamShade, dx: 0, dy: -24, dots: true, cell: 9, density: 0.7 } });
  K.line(ctx, [[-20, y + 10], [K.W + 20, y + 10]], { stroke: P.sky1, w: 8, boil: 0.8, seed: 831 });
}

function render(t) {
  try {
    titleEl.style.opacity = "0";
    if (t < T.dial[1]) drawSea(t);
    if (t >= T.dial[0] && t < T.roll[0]) {
      if (t < T.dial[1]) { /* the gauge face grows into the poster */
        const g = K.gaugePt || { x: 960, y: 600, r: 30 }, u = K.E.in3(K.inv(T.dial[0], T.dial[1], t));
        const cx = K.lerp(g.x, 960, u), cy = K.lerp(g.y, 540, u), r = K.lerp(g.r || 30, 1250, u);
        K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, K.TAU); ctx.clip();
        drawChart(t); ctx.restore(); dialRing(cx, cy, r);
      } else drawChart(t);
    }
    if (t >= T.roll[0] && t < T.title) {
      drawForecast(t);
      if (t < T.roll[1]) { /* the poster rolls up like a blind */
        const y = K.lerp(K.H + 40, -60, K.E.in3(K.inv(T.roll[0], T.roll[1], t)));
        K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, K.W, y); ctx.clip(); drawChart(t); ctx.restore();
        rollCylinder(y);
      }
    }
    if (t >= T.title) drawTitle(t);
    layoutTitleDom(t);
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 160), 20, 50);
  }
  /* screen-print grain steps at the wobble rate */
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .25  0 0 0 1.6 -.35'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
fitTitle();
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitTitle(); render(drv._t); });
window.__timelines["main"] = TL;
window.__render = render;
