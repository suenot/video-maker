/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
     0.00 - 6.35   SC1  descent from the surface, towers grow, Otto pops out of the clam
     6.35 - 9.48   SC2  "Buy low, sell high": bid card low, ask card high
     9.48 - 12.60  SC3  "Quote both sides as the fish swim by": fish take the quotes
    12.60 - 15.73  SC4  "Tight spread, steady hand": quotes squeeze 0.40 -> 0.04
    15.73 - 18.86  SC5  "Marketmaker!": the eight-card fan, sand puff
    18.86 - 21.20  SC14 break: Bill Williams Alligator + fractals + AO (bubble curtain in)
    21.20 - 23.16  SC15 break: Lorenz attractor (ink transition in)
    23.16 - 25.11  SC16 break: manifold with a path (panel flip in)
    25.11 - 29.60  title card "Marketmaker" + subtitle (bubble curtain in)
   ============================================================ */
const SCENES = [
  [0, sc1], [at(4), sc2], [at(6), sc3], [at(8), sc4], [at(10), sc5],
  [at(12), sc14], [at(13, 2), sc15], [at(14, 3), sc16], [at(16), scTitle],
];
const CURTAINS = [at(12), at(16)];

function render(t) {
  try {
    let fn = SCENES[0][1];
    for (const s of SCENES) if (t >= s[0]) fn = s[1];
    titleEl.style.opacity = "0";
    fn(t);
    CURTAINS.forEach((tc) => bubbleCurtain(t, tc));
    inkTransition(t, at(13, 2), 1500, 640);
    if (t >= at(16)) layoutTitleDom(t);
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String((err && err.stack) || err).slice(0, 150), 20, 50);
  }
  /* logo: one small hop on the first downbeat, static after */
  const lu = K.inv(at(0), at(0) + 0.45, t);
  logoEl.style.transform = `translateY(${(-14 * Math.sin(lu * Math.PI)).toFixed(1)}px)`;
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain"), logoEl = document.getElementById("logo");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.5 -.25'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
