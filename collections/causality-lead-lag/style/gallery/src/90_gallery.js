/* KIT GALLERY: every explainer primitive on a noir night, for visual QA of the kit.
   Page 1 (0-3 s): the evidence board (photos, strings, tags, pins) and two paw trails.
   Page 2 (3-6 s): placard, case file, chalkboard, screen chart, notepad, typewriter,
   clue card, marquee title, magnifying glass. Items pop in, then hold (boil keeps them alive). */
const K = CK, P = K.P, at = K.at, DUR = 6;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const pop = (t, t0) => K.inv(t0, t0 + 0.4, t);

function night() {
  const g = ctx.createLinearGradient(0, 0, 0, 1080);
  g.addColorStop(0, P.night); g.addColorStop(0.7, P.nightMid); g.addColorStop(1, P.street);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
}

function page1(t) {
  K.corkboard(ctx, 960, 400, 1680, 620, { a: pop(t, 0), seed: 5 });
  const pBTC = [330, 150], pETH = [790, 170], pZ = [1240, 150], pA = [1640, 180];
  K.node(ctx, pBTC[0], pBTC[1], 0.85, { label: "BTC", color: P.BTC, a: pop(t, 0.2), seed: 3, hot: K.inv(1.6, 2.2, t), tilt: -3 });
  K.node(ctx, pETH[0], pETH[1], 0.85, { label: "ETH", color: P.ETH, a: pop(t, 0.35), seed: 7, tilt: 2, hat: false });
  K.node(ctx, pZ[0], pZ[1], 0.85, { label: "Z", color: P.Z, a: pop(t, 0.5), seed: 11, tilt: -2, hidden: K.inv(0.9, 1.5, t) });
  K.node(ctx, pA[0], pA[1], 0.85, { label: "A", color: P.A, a: pop(t, 0.65), seed: 13, tilt: 3 });
  K.edge(ctx, pBTC, pETH, { p: K.inv(0.8, 1.5, t), state: t > 1.6 ? "hot" : "plain", sag: 50, label: "lag 2", seed: 21, pins: true, lu: 0.5 });
  K.edge(ctx, pETH, pZ, { p: K.inv(1.0, 1.6, t), state: t > 1.9 ? "cut" : "plain", sag: 40, seed: 23, pins: true });
  K.edge(ctx, pZ, pA, { p: K.inv(1.2, 1.8, t), state: "dim", sag: 45, label: "0.08", seed: 25, pins: true, lu: 0.55 });
  /* lower half of the board: plain string with a tag, loose tags, pins */
  K.edge(ctx, [260, 560], [760, 600], { p: K.inv(1.3, 2.0, t), sag: 30, label: "w = 0.42", seed: 27, pins: true, labelSize: 30 });
  K.tag(ctx, 1010, 560, "p = 0.003", { a: pop(t, 1.5), seed: 31, size: 30 });
  K.tag(ctx, 1010, 650, "LEAD", { a: pop(t, 1.6), seed: 33, size: 34, hot: true });
  [P.string, P.amber, P.B, P.greyLight, P.Z].forEach((c, i) => { if (t > 1.7 + i * 0.08) K.pin(ctx, 1290 + i * 90, 600 + (i % 2) * 40, c, 1.1); });
  K.paw(ctx, 1700, 520, 1.1, -0.4, P.amber, K.inv(1.8, 2.2, t));
  K.paw(ctx, 1730, 640, 0.9, 0.3, P.paper, K.inv(1.9, 2.3, t));
  /* street: leader trail (amber) and a lagged copy (cool) */
  const path = (y0) => { const out = []; for (let i = 0; i <= 12; i++) out.push([120 + i * 140, y0 + Math.sin(i * 0.8) * 26]); return out; };
  const sh = K.inv(0.3, 2.6, t) * 12;
  K.trail(ctx, path(810), { n: 12, shown: sh, color: P.amber, s: 0.68, seed: 4 });
  K.trail(ctx, path(960), { n: 12, shown: sh - 3, color: P.B, s: 0.68, seed: 8 });
  K.tag(ctx, 1840, 810, "A", { a: pop(t, 0.4), seed: 41, size: 30, hot: true });
  K.tag(ctx, 1840, 960, "B", { a: pop(t, 0.5), seed: 43, size: 30 });
}

const PY = ["def granger(x, y, lag=2):", "    # does x help predict y?", "    m = fit(y, lags(x, lag))", "    return m.pvalue < 0.05"];
function page2(t) {
  const u = t - 3;
  const bx = K.banner(ctx, 960, 82, 1040, 120, K.inv(0, 0.8, u), { seed: 71 });
  if (bx) {
    ctx.save(); ctx.beginPath(); ctx.rect(bx.x, bx.y, bx.w, bx.h); ctx.clip();
    K.text(ctx, "CAUSALITY & LEAD-LAG", 960, 84, { size: 64, weight: 700, fill: P.amberGlow, stroke: P.ink, w: 6, track: 3 });
    ctx.restore();
  }
  K.slate(ctx, 340, 330, 540, 190, ["x → y ?", { t: "F = 9.4  p < .01", c: P.amber }], { a: pop(u, 0.1), size: 46, write: K.inv(0.4, 1.6, u) });
  K.ledger(ctx, 955, 350, [140, 140, 150], [["pair", "lag", "p"], ["BTC→ETH", "2", "0.003"], ["ETH→BTC", "0", "0.41"], ["Z→A", "1", "0.08"]], { a: pop(u, 0.25), hi: 1, size: 28, rowH: 46, title: "CASE 07" });
  K.screenChart(ctx, 1560, 370, 560, 350, [{ data: [2, 2.4, 4.6, 4.2, 5.8, 5.2, 6.6, 6.1], color: P.amberDeep }, { data: [1.6, 1.8, 2.1, 2.5, 4.4, 4.1, 5.5, 5.0], color: P.nightLow }],
    { a: pop(u, 0.4), draw: K.inv(0.6, 2.0, u), title: "BTC leads ETH", xLabels: ["1", "2", "3", "4", "5", "6", "7", "8"], lagMark: { i0: 2, i1: 4 } });
  K.notice(ctx, 270, 800, 420, ["correlation", "causality", "confounder"], { a: pop(u, 0.55), size: 36, shown: K.inv(0.8, 2.0, u) * 3, title: "Clues" });
  K.logbook(ctx, 830, 740, 600, PY, { a: pop(u, 0.7), size: 25, typed: K.inv(0.9, 2.5, u) });
  K.scatter(ctx, 1390, 790, 420, 320, [[1, 1.4], [2, 1.9], [2.5, 3.1], [3, 2.6], [3.6, 3.9], [4.2, 3.5], [4.8, 4.9], [5.5, 4.6], [6, 6.1], [6.6, 5.6]],
    { a: pop(u, 0.85), title: "ice cream vs sharks", fit: K.inv(1.2, 1.8, u), stamp: K.inv(2.0, 2.4, u), color: P.B });
  K.plank(ctx, 1770, 650, 240, 120, ["Δt=2"], { a: pop(u, 1.0), size: 46 });
  K.magnify(ctx, 1745, 900, 105, (c) => { K.paw(c, 1720, 880, 0.75, -1.2, P.amber, 1); K.tag(c, 1760, 925, "3", { size: 26, seed: 5 }); }, { a: pop(u, 1.15), handle: 2.3 });
  if (K.fox) K.fox(ctx, 1165, 1075, 0.42, { blink: K.blinkAt(t, 2), squash: 0.07 * K.pulse(t, 1, 6), hold: "magnifier", pawR: { x: 120, y: -260, rot: -40 }, mouth: "smirk" });
}

function render(t) {
  try {
    K.begin(ctx, t, { x: 960, y: 540, z: 1 });
    K.applyCam(ctx, 1);
    night();
    if (t < 3) page1(t); else page2(t);
  } catch (e) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 120);
    ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(e && e.stack || e).slice(0, 160), 20, 60);
  }
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.4 -.2'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines = window.__timelines || {};
window.__timelines["main"] = TL;
