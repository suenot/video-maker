/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film (31.5 s). One paused GSAP
   timeline drives a proxy whose setter calls render(t).
    0.0 - 3.6   side set: ship sails in, cap tip + wink, spyglass "!"
    3.6 - 4.35  spyglass iris into the chart (first sung line)
    4.35- 8.6   "cycle flows": loop draws, glows, one lap (+0.46 %);
                "graph and matrix": full graph, rates fly into a matrix
    8.1 - 8.6   iris closes on the ship -> two ships (futures/spot, rope, swell)
   10.35-12.35  "sail with me!": push-in, the crab beckons and winks
   11.95-12.35  wave wipe -> chart: fast lap (+0.92 %), matrix -> tensor
   16.1 - 16.6  iris out -> two ships at sunset
   17.85-18.35  wave wipe -> title on the last "sail with me!"; outro: net
                haul, jump, snap + medallions, cap tip, wave
   The marketmaker.cc logo plate (DOM, top-right) stays for the whole film.
   ============================================================ */
const OPEN_CAM = K.mkTrack([
  [0, { z: 1.0, fx: 900, fy: 640, toX: 900 }],
  [T.spyUp, { z: 1.05, fx: 800, fy: 660, toX: 820 }],
  [T.iris[1], { z: 1.18, fx: 800, fy: 660, toX: 820 }],
]);
const SIDE_OPEN = (t) => {
  const c = OPEN_CAM(t);
  return {
    horizon: 600, warm: 0, zoom: c.z, fx: c.fx, fy: c.fy, toX: c.toX,
    shipX: K.tw(t, T.shipIn[0], T.shipIn[1], -520, 800, K.E.out3), shipY: 930, shipS: 1.6, crabS: 1.15, crab: crabOpening,
  };
};
const SIDE_TITLE = (t) => ({
  horizon: 640, warm: 0.7, fx: 960, fy: 760,
  /* settle after the wipe, then a slow push-in through the instrumental outro */
  zoom: t < T.pipIn[0] ? K.tw(t, T.wipe2[0], T.wipe2[1] + 2, 1.06, 1.0, K.E.out3) : K.tw(t, T.pipIn[0], DUR, 1.0, 1.1, K.E.inOut),
  drift: 600 + 50 * Math.max(0, t - T.sail), scroll: 70 * Math.max(0, t - T.sail), wake: true,
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
    else if (t < T.wipe1[1]) waveWipe(t, T.wipe1, two1, () => drawChart(t));
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

const grainEl = document.getElementById("grain"), logoEl = document.getElementById("logo");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .35  0 0 0 1.4 -.2'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
