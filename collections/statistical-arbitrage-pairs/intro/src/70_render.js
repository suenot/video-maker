/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
   0.00 - 0.90  iris opens on the closed curtain
   0.12 - 3.36  "Two stocks walk into a chart, ha!": curtain parts, penguins tap in
   3.36 - 6.57  "Dancing close then drifting apart": spring stretches, z -> +2
   6.57 - 9.78  "Buy the cheap one, short the rich": tags +1 / -1 thrown at the partners
   9.78 - 12.97 "Spread's the tune we're trading with": spread reel, the spring hums
   12.97- 16.16 "Trade the spread, trade the spread": two coin flips (the bet)
   16.16- 19.34 "Distance says these two should wed": snap back, heart, coins rain
   19.34- 22.57 "Cointegration rings the bell": bell, the spread reverts, bow, iris out
   22.57- 28.9  "Kalman's filter knows it well": marquee title, hat tip, finale, iris
   The scene draws on #cv; the projector (flicker, scratches, dust,
   vignette, iris) draws on #fx above the DOM title.
   ============================================================ */
const fx = document.getElementById("fx").getContext("2d");
const grainEl = document.getElementById("grain"), logoEl = document.getElementById("logo");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.6 -.3'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>\")";

function render(t) {
  try {
    K.begin(ctx, t, { x: 960, y: 540, z: 1 });
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = P.ink; ctx.fillRect(0, 0, K.W, K.H);
    let box = null;
    if (t < T.title) drawAct(t);
    else box = drawTitleSet(t);
    layoutTitleDom(t, box);
    /* projector layer */
    K.begin(fx, t, K.cam);
    fx.setTransform(1, 0, 0, 1, 0, 0); fx.clearRect(0, 0, K.W, K.H);
    K.film(fx, t, { flicker: 0.05, scratches: 1, dust: 1, vignette: 0.6 });
    if (t < T.irisIn[1]) K.iris(fx, 960, 560, K.irisT(t, T.irisIn[0], T.irisIn[1], false, 1150));
    if (t >= T.irisOut[0] && t < T.title) {
      K.cam = camAct(t); const c = K.toScreen(CAT.x, CAT.y - 250 * CAT.s);
      K.iris(fx, c[0], c[1], K.lerp(1500, 60, K.E.inOut(K.inv(T.irisOut[0], T.irisOut[1], t)))); /* never fully black: the title iris opens from the same 60 px */
    }
    if (t >= T.title && t < T.title + 0.6) K.iris(fx, TCAT.x, TCAT.y - 250 * TCAT.s, K.lerp(60, 1500, K.E.inOut(K.inv(T.title, T.title + 0.6, t))));
    if (t >= T.irisEnd[0]) K.iris(fx, CAT_HEAD[0], CAT_HEAD[1], K.lerp(1500, 190, K.E.inOut(K.inv(T.irisEnd[0] + 0.1, DUR - 0.05, t))));
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 140), 20, 50);
  }
  /* logo: one small hop when the curtain is open, otherwise static */
  const lh = K.inv(T.curtain[1], T.curtain[1] + 0.4, t);
  logoEl.style.transform = lh > 0 && lh < 1 ? `translateY(${(-14 * Math.sin(lh * Math.PI)).toFixed(1)}px)` : "none";
  /* film grain steps at the boil rate */
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 41) + "px " + ((f % 5) * 59) + "px";
}

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
