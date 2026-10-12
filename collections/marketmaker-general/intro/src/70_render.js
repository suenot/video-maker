/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
     0.00 - 6.35   SC1  descent from the surface, towers grow, Otto pops out of the clam
     6.35 - 9.48   SC2  "Buy low, sell high": bid card low, ask card high
     9.48 - 12.60  SC3  "Quote both sides as the fish swim by": fish take the quotes
    12.60 - 15.73  SC4  "Tight spread, steady hand": quotes squeeze 0.40 -> 0.04
    15.73 - 18.86  SC5  "Marketmaker!": the eight-card fan, sand puff
    18.86 - 21.99  SC6  "Down on the reef...": exchange panorama (bubble curtain in)
    21.99 - 25.11  SC7  "...quotes through the market's changes": chart, Otto changes colour
    25.11 - 28.24  SC8  "Bid with one arm and an ask with another": close-ups, whip pan
    28.24 - 31.37  SC9  "Eight arms on the book, one spread to cover!"
    31.37 - 34.49  SC10 "Buy low, sell high": juggled candles -> chart with buy/sell
    34.49 - 37.62  SC11 "Quote both sides": a school of takers, spread adds up
    37.62 - 40.75  SC12 "Tight spread, steady hand": the balance on Otto's head
    40.75 - 43.88  SC13 "Marketmaker!": hero shot with orbiting fish
    43.88 - 46.22  SC14 break: Bill Williams Alligator + fractals + AO
    46.22 - 48.18  SC15 break: Lorenz attractor (ink transition in)
    48.18 - 50.13  SC16 break: manifold with a path (panel flip in)
    50.13 - 53.26  SC17 "Buy low, sell high": surfing the price wave (ink out)
    53.26 - 56.38  SC18 "Quote both sides": the spread formula
    56.38 - 59.51  SC19 "Tight spread, steady hand": quote() in code
    59.51 - 64.00  title card "Marketmaker" + subtitle (bubble curtain in)
   ============================================================ */
const SCENES = [
  [0, sc1], [at(4), sc2], [at(6), sc3], [at(8), sc4], [at(10), sc5], [at(12), sc6], [at(14), sc7], [at(16), sc8], [at(18), sc9],
  [at(20), sc10], [at(22), sc11], [at(24), sc12], [at(26), sc13], [at(28), sc14], [at(29, 2), sc15], [at(30, 3), sc16],
  [at(32), sc17], [at(34), sc18], [at(36), sc19], [at(38), scTitle],
];
const CURTAINS = [at(12), at(20), at(28), at(38)];

function render(t) {
  try {
    let fn = SCENES[0][1];
    for (const s of SCENES) if (t >= s[0]) fn = s[1];
    titleEl.style.opacity = "0";
    fn(t);
    CURTAINS.forEach((tc) => bubbleCurtain(t, tc));
    inkTransition(t, at(29, 2), 1500, 640);
    inkTransition(t, at(32), 1500, 640);
    if (t >= at(38)) layoutTitleDom(t);
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String((err && err.stack) || err).slice(0, 150), 20, 50);
  }
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.5 -.25'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
