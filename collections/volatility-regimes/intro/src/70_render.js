/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
   0.00 - 6.34  sea set: surf in, shaka, gauge; "Ride the calm" (3.37), storm bank "!",
                "ride the storm" (4.85): regime flip, the wave stands up, a second set
   6.1  - 6.34  dial iris: through the board's gauge into the poster
   6.34 - 9.29  "Every regime has its form": returns over regime bands, sigma, two humps
   8.92 - 9.29  the poster rolls up onto the beach
   9.29 - 12.24 "Measure the swell and read the sea": GARCH on the surf-report board,
                the dial swings to storm, Siggy picks the storm gun; tilt up to the sky
   12.24- 18.09 "Volatility Modeling and Regimes!" + instrumental: two hidden states
                (buoys, transition currents), the state switches, the world follows
   17.72- 18.09 a poster unrolls down over the sea
   18.09- 21.06 the leverage effect: same-size drop and rise, very different sigma
   20.69- 21.06 the poster rolls up onto the sea
   21.06- 25.47 a cluster of big sets, then calm returns (23.99); tilt up
   25.47- 31.0  title card, medals, hop, shades up
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

/* a poster blind at screen y: draw `under` full, then `over` clipped above y, then the roll */
function blind(t, y, under, over) {
  under(t);
  K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, K.W, y); ctx.clip(); over(t); ctx.restore();
  rollCylinder(y);
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
    const hmm = (tt) => drawHmm(tt, T.hmm, T.hmmSw);
    if (t >= T.roll[0] && t < T.hmm) {
      if (t < T.roll[1]) blind(t, K.lerp(K.H + 40, -60, K.E.in3(K.inv(T.roll[0], T.roll[1], t))), drawForecast, drawChart);
      else drawForecast(t);
    }
    if (t >= T.hmm && t < T.lev) {
      if (t >= T.unroll[0]) blind(t, K.lerp(-60, K.H + 40, K.E.out3(K.inv(T.unroll[0], T.unroll[1], t))), hmm, drawLeverage);
      else hmm(t);
    }
    if (t >= T.lev && t < T.roll2[0]) drawLeverage(t);
    if (t >= T.roll2[0] && t < T.title) {
      if (t < T.roll2[1]) blind(t, K.lerp(K.H + 40, -60, K.E.in3(K.inv(T.roll2[0], T.roll2[1], t))), drawRide, drawLeverage);
      else drawRide(t);
    }
    if (t >= T.title) drawTitle(t);
    layoutTitleDom(t);
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 160), 20, 50);
  }
  /* the marketmaker.cc sticker: one small hop on the first downbeat, then static */
  const lb = K.inv(K.at(0), K.at(0) + 0.45, t);
  logoEl.style.transform = lb > 0 && lb < 1 ? `translateY(${(-16 * Math.sin(lb * Math.PI)).toFixed(1)}px)` : "none";
  /* screen-print grain steps at the wobble rate */
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain"), logoEl = document.getElementById("logo");
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
