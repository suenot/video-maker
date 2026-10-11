/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
   0.00 - 4.43  side set: ship sails in, crab spots something (spyglass)
   3.46 - 4.43  iris through the spyglass into the chart set
   4.43 - 8.24  "Heave ho, the cycle flows": routes draw, loop glows, one lap
   8.24 - 11.6  "Graph and matrix, the Rust-crab knows": rates fly into a matrix
   11.57- 12.05 iris closes on the ship, opens on the two-ship set
   12.05- 15.86 "Futures, spot and copula sea": spot + futures ships, basis rope, one swell
   15.10- 15.86 wave wipe to the title set
   15.86- 20.10 "Complex arbitrage, sail with me!": banner hit, letters, jump, snap, hat tip
   ============================================================ */
const SIDE_OPEN = (t) => ({
  horizon: 600, warm: 0, zoom: K.tw(t, 0, T.iris[1], 1, 1.18, K.E.inOut), fx: 900, fy: 640,
  shipX: K.tw(t, T.shipIn[0], T.shipIn[1], -520, 800, K.E.out3), shipY: 930, shipS: 1.6, crabS: 1.15, crab: crabOpening,
});
const SIDE_TITLE = (t) => ({
  horizon: 640, warm: 0.7, zoom: K.tw(t, T.wipe[0], DUR, 1.06, 1.0, K.E.out3), fx: 960, fy: 700, drift: 600,
  shipX: 960, shipY: 1000, shipS: 1.45, crabS: 1.22, crab: crabTitle, coins: 22,
});

function wipeFront(t) { return K.tw(t, T.wipe[0], T.wipe[1], -420, 2400, K.E.inOut); }
function drawWaveFront(x) {
  /* a tall curling wave sweeps right; left of it is already the next set */
  const crest = [];
  for (let i = 0; i <= 16; i++) { const y = -40 + (i / 16) * 1160; crest.push([x + 50 * Math.sin(y * 0.01 + K.now * 5) + 24 * Math.sin(y * 0.027 + 1), y]); }
  const body = crest.concat(crest.slice().reverse().map((p) => [p[0] - 260, p[1]]));
  K.shape(ctx, body, { fill: P.seaMid, w: 6, boil: 2, seed: 900, shade: { color: P.seaDeep, dx: -70, dy: 0 }, hatch: { ang: 1.35, gap: 26, alpha: 0.25, color: P.foam } });
  K.line(ctx, crest, { stroke: P.foam, w: 26, boil: 2.4, seed: 901, gap: 0.05 });
  K.line(ctx, crest.map((p) => [p[0] - 60, p[1]]), { stroke: "#bfe6ec", w: 8, boil: 2, seed: 902, gap: 0.3 });
  for (let i = 0; i < 26; i++) {
    const y = (i / 26) * 1100 + 10, c = crest[Math.min(16, Math.round(((y + 40) / 1160) * 16))];
    const bx = c[0] + 22 + 46 * K.hash(i, 7) + 30 * Math.sin(K.now * 7 + i);
    K.dot(ctx, bx, y + 10 * Math.sin(K.now * 5 + i), 9 + 14 * K.hash(i, 8), P.foam, P.ink, 3, 910 + i);
  }
}

function ring(cx, cy, r) {
  K.screen(ctx); ctx.save();
  ctx.lineWidth = 22; ctx.strokeStyle = P.goldDark; ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, K.TAU); ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r + 20, 0, K.TAU); ctx.stroke();
  ctx.restore();
}

function render(t) {
  try {
    K.begin(ctx, t, { x: 0, y: 0, z: 1 });
    titleEl.style.opacity = "0";
    /* 1. opening side set */
    if (t < T.iris[1]) drawSide(t, SIDE_OPEN(t));
    /* 2. chart set (through the spyglass iris at first) */
    if (t >= T.iris[0] && t < T.irisOut[1]) {
      if (t < T.iris[1]) {
        const u = K.E.inOut(K.inv(T.iris[0], T.iris[1], t)), lens = K.lens || { x: 1200, y: 400 };
        const cx = K.lerp(lens.x, 960, u), cy = K.lerp(lens.y, 540, u), r = K.lerp(10, 1250, u);
        K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, K.TAU); ctx.clip();
        drawChart(t); ctx.restore(); ring(cx, cy, r);
      } else if (t < T.irisOut[0]) drawChart(t);
    }
    /* 3. iris out on the ship, then the two-ship set */
    if (t >= T.irisOut[0] && t < T.wipe[1]) {
      if (t < T.irisOut[1]) {
        const u = K.E.inOut(K.inv(T.irisOut[0], T.irisOut[1], t)), r = K.lerp(1300, 0, u);
        K.cam = camChart(t); const sp = shipAt(t), c = K.toScreen(sp.x, sp.y - 80);
        K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.rect(-10, -10, 1940, 1100); ctx.arc(c[0], c[1], r, 0, K.TAU, true); ctx.clip("evenodd");
        drawSide(t, SIDE_TWO(t)); ctx.restore();
        K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, K.TAU); ctx.clip();
        drawChart(t); ctx.restore();
        if (r > 4) ring(c[0], c[1], r);
      } else drawSide(t, SIDE_TWO(t));
    }
    /* 4. wave wipe to the title set */
    if (t >= T.wipe[0]) {
      const x = wipeFront(t);
      K.screen(ctx); ctx.save();
      if (t < T.wipe[1]) { ctx.beginPath(); ctx.rect(-10, -10, x + 10, 1100); ctx.clip(); }
      drawSide(t, SIDE_TITLE(t));
      K.screen(ctx);
      if (t >= T.banner[0]) drawTitleCanvas(t);
      ctx.restore();
      if (t < T.wipe[1]) { K.screen(ctx); drawWaveFront(x); }
      layoutTitleDom(t);
    }
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 140), 20, 50);
  }
/* paper grain steps at the boil rate */
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .35  0 0 0 1.4 -.2'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
