/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film (64.2 s). One paused GSAP
   timeline drives a proxy whose setter calls render(t).
    0.0 - 15.4  side set: ship sails in, cap tip, rivets, horizon markets, spyglass "!"
   15.4 - 16.3  iris through the spyglass into the chart
   16.3 - 25.2  chart: three ports, loop lap (+0.46 %), cycle glows, rates -> matrix
   25.2 - 25.6  iris closes on the ship -> two ships (futures/spot, basis rope, swell)
   29.2 - 33.0  "sail with me!": push-in, the crab beckons and winks
   32.3 - 33.0  wave wipe -> break: accordion jig, sail chart, logbook (dusk)
   44.0 - 44.5  spyglass iris -> chart: fast lap (+0.92 %), matrix -> tensor
   48.0 - 48.5  iris out -> two ships at sunset
   51.3 - 52.1  wave wipe -> title: banner, net haul, jump, snap, medallions, cap tip
   ============================================================ */
const OPEN_CAM = K.mkTrack([
  [0, { z: 1.0, fx: 900, fy: 640, toX: 900 }],
  [T.pushIn[0], { z: 1.08, fx: 900, fy: 640, toX: 900 }],
  [T.pushIn[1], { z: 1.55, fx: 650, fy: 720, toX: 860 }],
  [T.pullOut[0], { z: 1.55, fx: 650, fy: 720, toX: 860 }],
  [T.pullOut[1], { z: 1.0, fx: 960, fy: 600, toX: 960 }],
  [T.spyUp, { z: 1.0, fx: 900, fy: 640, toX: 900 }],
  [T.iris[1], { z: 1.15, fx: 800, fy: 660, toX: 820 }],
]);
const MARKETS = [
  { x: 270, label: "BTC", color: P.BTC, t0: T.markets },
  { x: 1240, label: "ETH", color: P.ETH, t0: T.markets + bl(1) },
  { x: 1700, label: "USDT", color: P.USDT, t0: T.markets + bl(2) },
  { x: 410, label: "SOL", color: P.SOL, t0: T.markets + bl(3) },
];
const SIDE_OPEN = (t) => {
  const c = OPEN_CAM(t);
  return {
    horizon: 600, warm: 0, zoom: c.z, fx: c.fx, fy: c.fy, toX: c.toX, markets: MARKETS, rivets: T.rivets,
    shipX: K.tw(t, T.shipIn[0], T.shipIn[1], -520, 800, K.E.out3), shipY: 930, shipS: 1.6, crabS: 1.15, crab: crabOpening,
  };
};
const SIDE_TITLE = (t) => ({
  horizon: 640, warm: 0.7, zoom: K.tw(t, T.wipe2[0], T.wipe2[1] + 2, 1.06, 1.0, K.E.out3), fx: 960, fy: 700, drift: 600,
  shipX: TITLE_SHIP.x, shipY: TITLE_SHIP.y, shipS: TITLE_SHIP.s, crabS: TITLE_SHIP.crabS, crab: crabTitle,
  coins: Math.round(22 + 12 * K.inv(T.dump + 0.2, T.dump + 0.9, t)), front: (tt, bob) => drawNet(tt, bob),
});

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

function irisIn(t, win, drawA, drawB) {
  /* drawA full, drawB inside a circle growing from the spyglass lens (K.lens, set while drawA draws) */
  drawA(); const from = K.lens || { x: 1200, y: 400 };
  const u = K.E.inOut(K.inv(win[0], win[1], t));
  const cx = K.lerp(from.x, 960, u), cy = K.lerp(from.y, 540, u), r = K.lerp(10, 1250, u);
  K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, K.TAU); ctx.clip(); drawB(); ctx.restore(); ring(cx, cy, r);
}
function irisOutOnShip(t, win, drawNext) {
  const u = K.E.inOut(K.inv(win[0], win[1], t)), r = K.lerp(1300, 0, u);
  K.cam = camChart(t); const sp = shipAt(t), c = K.toScreen(sp.x, sp.y - 80);
  K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.rect(-10, -10, 1940, 1100); ctx.arc(c[0], c[1], r, 0, K.TAU, true); ctx.clip("evenodd"); drawNext(); ctx.restore();
  K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, K.TAU); ctx.clip(); drawChart(t); ctx.restore();
  if (r > 4) ring(c[0], c[1], r);
}
function waveWipe(t, win, drawOld, drawNew) {
  const x = K.tw(t, win[0], win[1], -420, 2400, K.E.inOut);
  drawOld(); K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.rect(-10, -10, x + 10, 1100); ctx.clip(); drawNew(); ctx.restore();
  K.screen(ctx); drawWaveFront(x);
}
const drawBreak = (t) => { drawSide(t, SIDE_BREAK(t)); drawSailChart(t); drawLogbook(t); };
const drawTitleSet = (t) => { drawSide(t, SIDE_TITLE(t)); K.screen(ctx); if (t >= T.banner[0]) drawTitleCanvas(t); };

function render(t) {
  try {
    K.begin(ctx, t, { x: 0, y: 0, z: 1 });
    titleEl.style.opacity = "0";
    const two1 = () => drawSide(t, SIDE_TWO(t, TWO[0])), two2 = () => drawSide(t, SIDE_TWO(t, TWO[1]));
    if (t < T.iris[0]) drawSide(t, SIDE_OPEN(t));
    else if (t < T.iris[1]) irisIn(t, T.iris, () => drawSide(t, SIDE_OPEN(t)), () => drawChart(t));
    else if (t < T.irisOut[0]) drawChart(t);
    else if (t < T.irisOut[1]) irisOutOnShip(t, T.irisOut, two1);
    else if (t < T.wipe1[0]) two1();
    else if (t < T.wipe1[1]) waveWipe(t, T.wipe1, two1, () => drawBreak(t));
    else if (t < T.iris2[0]) drawBreak(t);
    else if (t < T.iris2[1]) irisIn(t, T.iris2, () => drawBreak(t), () => drawChart(t));
    else if (t < T.irisOut2[0]) drawChart(t);
    else if (t < T.irisOut2[1]) irisOutOnShip(t, T.irisOut2, two2);
    else if (t < T.wipe2[0]) two2();
    else if (t < T.wipe2[1]) waveWipe(t, T.wipe2, two2, () => drawTitleSet(t));
    else drawTitleSet(t);
    if (t >= T.banner[0]) layoutTitleDom(t);
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
