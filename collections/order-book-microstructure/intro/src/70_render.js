/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
   intro      0 - 6.5   curtain rolls up, shutters open, Tikki swings in, lands, fez, abacus
   chorus 1   6.5 - 19  "Hey!" shout, clap slams the book (0.05 -> 0.01), depth flow, buy cart
              + imbalance shout, ticks, our queue #4 -> #1, title tease banner
   verse      19 - 32   depth hills, two levels drop from the sky + flag, price-time
              numbers, a sell cart fills our crate and pays Tikki a coin
   chorus 2   32 - 45   dusk: shout, lantern rope pulled tight, second flow wave,
              tick chart scroll, plaque ripple + coin fountain
   break      45 - 58   night: dance, OFI tile board, candle scroll, CCXT code scroll
   final      58 - 71.3 dawn: shout + clap + pinch, flow, ticks, curtain -> title card,
              medallions, jump, fez tip
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
  [T.tease[0], { x: -170, y: 150, z: 1.24 }],
  [T.tease[1], { x: -330, y: 40, z: 0.8 }],
  [T.tease[3], { x: -320, y: 20, z: 0.78 }],
  /* verse */
  [T.hills[0] + 0.8, { x: 0, y: -200, z: 0.36 }],
  [T.hills[1] + 0.9, { x: 0, y: -260, z: 0.37 }],
  [T.sky[0] - 0.4, { x: 0, y: -560, z: 0.46 }],
  [T.sky[2] + 0.3, { x: -60, y: -700, z: 0.5 }],
  [T.prio - 0.25, { x: -80, y: -620, z: 0.5 }],
  [T.prio + 0.35, { x: -300, y: -180, z: 1.1 }],
  [T.cart2[0] - 0.1, { x: -280, y: -170, z: 1.1 }],
  [T.cart2[0] + 0.5, { x: -300, y: -20, z: 0.86 }],
  [T.coin, { x: -330, y: -40, z: 0.88 }],
  [T.coin + 1.2, { x: -460, y: -90, z: 1.02 }],
  /* chorus 2 */
  [T.hey2, { x: -380, y: -80, z: 0.98 }],
  [T.rope, { x: -330, y: -60, z: 1.0 }],
  [T.flow2, { x: -320, y: -50, z: 0.98 }],
  [T.flow2 + 0.8, { x: -100, y: 40, z: 0.55 }],
  [T.tickChart[0] - 0.1, { x: -60, y: 20, z: 0.57 }],
  [T.tickChart[0] + 0.5, { x: 150, y: -200, z: 0.72 }],
  [T.fireworks - 0.1, { x: 150, y: -200, z: 0.74 }],
  [T.fireworks + 0.6, { x: 0, y: -260, z: 0.45 }],
  [T.dance[0] - 0.1, { x: 0, y: -260, z: 0.46 }],
  /* break */
  [T.dance[0] + 0.5, { x: -700, y: -100, z: 1.3 }],
  [T.ofi[0] - 0.1, { x: -690, y: -100, z: 1.32 }],
  [T.ofi[0] + 0.5, { x: -430, y: -170, z: 0.95 }],
  [T.candles[0] + 0.4, { x: -420, y: -150, z: 0.95 }],
  [T.code[0] + 0.4, { x: -360, y: -170, z: 0.98 }],
  [T.hey3 - 0.4, { x: -390, y: -100, z: 0.95 }],
  /* final chorus */
  [T.hey3, { x: -380, y: -80, z: 0.98 }],
  [T.flow3, { x: -330, y: -50, z: 0.98 }],
  [T.flow3 + 0.8, { x: -150, y: 90, z: 0.6 }],
  [T.ticks3, { x: -200, y: -120, z: 0.68 }],
  [T.drop[1], { x: -220, y: -140, z: 0.72 }],
]);
/* accents: punch-in on each "Hey!", a shake on the slam and on each level landing from the sky */
function camAt(t) {
  const c = CAM(t);
  const punch = [T.hey, T.hey2, T.hey3].reduce((m, th) => Math.max(m, t > th ? Math.exp(-5 * (t - th)) * K.inv(th, th + 0.06, t) : 0), 0);
  c.z *= 1 + 0.09 * punch;
  [[T.slam, 14], [T.sky[0], 10], [T.sky[1], 10]].forEach(([t0, amp]) => {
    const sd = t - t0;
    if (sd > 0 && sd < 0.45) { const a = amp * (1 - sd / 0.45); c.x += a * Math.sin(sd * 70); c.y += a * Math.cos(sd * 53); }
  });
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
  drawGround(ts);
  drawHills(ts);
  drawTower(ts);
  drawFallingLevels(ts);
  drawBalcony();
  if (titleSet) return;
  drawFlowArrow(ts);
  drawFireworks(ts);
  drawBoards(ts);
  drawRope(ts);
  drawCarts(ts);
  drawTikki(ts);
  drawFlying(ts);
  drawOurCoin(ts);
  drawQueueTags(ts);
  drawShouts(ts);
}

function render(t) {
  try {
    titleEl.style.opacity = "0";
    const titleSet = t >= T.rise[0];
    if (!titleSet) drawWorld(t, camAt(t), t, false);
    else {
      /* title set: the bazaar seen wide behind the banner, Tikki in front */
      drawWorld(T.drop[1], TITLE_CAM, t, true);
      /* faded-print wash: the bazaar steps back so the title, medallions and Tikki read */
      K.screen(ctx); ctx.fillStyle = "rgba(243, 227, 195, 0.5)"; ctx.fillRect(0, 0, 1920, 1080);
      drawTitleCanvas(t);
    }
    /* opening curtain (screen space) */
    if (t < T.curtain[1] + 0.05) {
      K.screen(ctx);
      K.rug(ctx, -30, -40, 1980, 1160, { roll: K.E.inOut(K.inv(T.curtain[0], T.curtain[1], t)), seed: 91, base: P.terra, band: P.saffron, motif: P.teal });
    }
    /* title banner: the tease in chorus 1, then the closing curtain -> title card */
    if (bannerDrop(t) > 0) {
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
