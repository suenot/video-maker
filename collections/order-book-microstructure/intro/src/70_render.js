/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
   0.00 - 1.63  the kilim curtain rolls up on the bazaar tower (wide)
   1.63 - 3.40  awnings drop open on eighth notes, top to bottom
   3.23 - 4.83  Tikki swings in on a rope and lands on the balcony (camera follows in)
   4.83 - 6.43  fez tip, abacus flicks, a big breath
   6.43 - 9.62  "Hey! The spread is tight": shout, clap, the book slams shut, 0.05 -> 0.01
   9.62 - 11.22 "Depth and flow from left to right": wide, crates flow in, flow arrow
   11.22- 12.82 a market-order cart races through the alley, takes 2 crates; imbalance shout
   12.82- 15.19 "Every tick and every queue": plaques flash, close-up, our crate #4 -> #1
   15.19- 16.00 the kilim curtain drops and rolls up into the title banner
   16.00- 20.10 "Order Book and Market Microstructure!": stamped title, medallions, jump, bow
   ============================================================ */
const CAM = K.mkTrack([
  [0.0, { x: 0, y: -40, z: 0.5 }],
  [T.swing, { x: -80, y: -40, z: 0.55 }],
  [T.land, { x: -380, y: -90, z: 0.92 }],
  [T.hey, { x: -370, y: -80, z: 0.96 }],
  [T.tight, { x: -340, y: -60, z: 1.0 }],
  [T.depth, { x: -330, y: -50, z: 0.98 }],
  [T.depth + 0.8, { x: -150, y: 90, z: 0.6 }],
  [T.cart[0] - 0.1, { x: -150, y: 80, z: 0.62 }],
  [T.cart[0] + 0.5, { x: -260, y: -40, z: 0.82 }],
  [T.ticks, { x: -240, y: -30, z: 0.84 }],
  [T.queueCam, { x: -230, y: -10, z: 0.88 }],
  [T.queueCam + 0.4, { x: -170, y: 150, z: 1.22 }],
  [T.drop[1], { x: -150, y: 150, z: 1.26 }],
]);
/* accents: punch-in on "Hey!" and a shake on the slam */
function camAt(t) {
  const c = CAM(t);
  const hey = t > T.hey ? Math.exp(-5 * (t - T.hey)) * K.inv(T.hey, T.hey + 0.06, t) : 0;
  c.z *= 1 + 0.09 * hey;
  const sd = t - T.slam;
  if (sd > 0 && sd < 0.45) { const a = 14 * (1 - sd / 0.45); c.x += a * Math.sin(sd * 70); c.y += a * Math.cos(sd * 53); }
  c.rot = 0;
  return c;
}
const TITLE_CAM = { x: -520, y: 40, z: 0.44, rot: 0 };

/* ts = story time (what happens), t = clock (boil, sway). The title set shows the
   finished bazaar (story frozen after the queue scene) while the ink keeps boiling. */
function drawWorld(ts, cam, t, titleSet) {
  K.begin(ctx, t, cam);
  drawBackground(ts);
  K.applyCam(ctx, 1);
  drawGround();
  drawTower(ts);
  drawBalcony();
  if (titleSet) return;
  drawFlowArrow(ts);
  drawRope(ts);
  drawCart(ts);
  drawTikki(ts);
  drawFlying(ts);
  drawQueueTag(ts);
  drawShouts(ts);
}

function render(t) {
  try {
    titleEl.style.opacity = "0";
    const titleSet = t >= T.rise[0];
    if (!titleSet) drawWorld(t, camAt(t), t, false);
    else {
      /* title set: the bazaar seen wide behind the banner, Tikki in front */
      drawWorld(T.drop[0], TITLE_CAM, t, true);
      /* faded-print wash: the bazaar steps back so the title, medallions and Tikki read */
      K.screen(ctx); ctx.fillStyle = "rgba(243, 227, 195, 0.5)"; ctx.fillRect(0, 0, 1920, 1080);
      drawTitleCanvas(t);
    }
    /* opening curtain (screen space) */
    if (t < T.curtain[1] + 0.05) {
      K.screen(ctx);
      K.rug(ctx, -30, -40, 1980, 1160, { roll: K.E.inOut(K.inv(T.curtain[0], T.curtain[1], t)), seed: 91, base: P.terra, band: P.saffron, motif: P.teal });
    }
    /* closing curtain -> title banner */
    if (t >= T.drop[0]) {
      K.screen(ctx);
      K.kilimBanner(ctx, BAN.cx, BAN.top, BAN.w, BAN.h, bannerDrop(t), { seed: 71, field: 400 });
    }
    layoutTitleDom(t);
  } catch (err) {
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 140), 20, 50);
  }
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .32  0 0 0 0 .25  0 0 0 1.5 -.25'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
