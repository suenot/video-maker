/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
   0.00 - 1.76  diner: Nibbs pops up behind the counter, magnifier up
   1.76 - 4.97  "MEV lurks in the mempool dark": dolly to the dark corner,
                Slyce's red eye, he hops onto the counter
   4.97 - 8.15  "sandwich attacks leave their mark": front + back tickets
                around the victim, they fly into a tray as a sandwich, bite, -1.2 %
   7.75 - 8.15  menu-card slap transition
   8.15 - 11.35 "Read the book, read the book": order-book menu, the lens reads it
   10.95- 11.35 whip pan
   11.35- 14.56 "Microstructure off the hook": AMM scale + x*y=k placemat, 1 ETH trade
   14.56        the order bell DING
   15.36- 16.40 swing doors shut and open on the title set
   16.18- 20.90 neon sign title, episode plates, Slyce caught
   ============================================================ */
function slapCard(t, nb) {
  const u = inv(T.slap[0], T.slap[1], t), e = u * u;
  if (u <= 0) return;
  const paw = K.toScreen(nb.x - 30, nb.y - 330);
  const cx = K.lerp(paw[0], 960, e), cy = K.lerp(paw[1], 540, e), w = K.lerp(150, 2050, e), h = K.lerp(200, 1200, e), r = K.lerp(-0.6, 0, e);
  const rect = K.roundRectPts(-w / 2, -h / 2, w, h, 30).map((p) => [cx + p[0] * Math.cos(r) - p[1] * Math.sin(r), cy + p[0] * Math.sin(r) + p[1] * Math.cos(r)]);
  K.screen(ctx); ctx.save(); K.pathOf(ctx, rect, true); ctx.clip();
  drawTable(t);
  ctx.restore();
  K.screen(ctx); K.shape(ctx, rect, { fill: null, stroke: P.cherry, w: 34, boil: 1.2, seed: 940, taper: 0 });
  K.shape(ctx, rect, { fill: null, stroke: P.ink, w: 7, boil: 1.2, seed: 941 });
  for (let i = 0; i < 6; i++) { const a = r + Math.PI + (i - 2.5) * 0.18, l = 140 + 80 * K.hash(i, K.bf); K.line(ctx, [[cx + Math.cos(a) * (w * 0.5 + 20), cy + Math.sin(a) * (h * 0.4)], [cx + Math.cos(a) * (w * 0.5 + 20 + l), cy + Math.sin(a) * (h * 0.4 + l * 0.3)]], { stroke: P.ink, w: 7, boil: 0.5, seed: 945 + i, alpha: 1 - e }); }
}

function render(t) {
  let box = null;
  try {
    K.begin(ctx, t, { x: 960, y: 540, z: 1 });
    if (t < T.slap[1]) {
      const nb = drawDiner(t);
      if (t >= T.slap[0]) slapCard(t, nb);
    } else if (t < T.doors[1] - 0.12) {
      drawTable(t);
    } else {
      box = drawTitleSet(t);
    }
    if (t >= T.doors[0]) drawDoors(t);
    layoutTitleDom(t, box);
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 140), 20, 50);
  }
  /* paper grain steps at the boil rate */
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .4  0 0 0 1.4 -.2'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
