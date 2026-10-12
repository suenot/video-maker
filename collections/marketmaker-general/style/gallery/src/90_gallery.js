/* KIT GALLERY: visual QA of the kit.
   0 - 6 s: every explainer primitive on one reef wall (camera: 3500 x 1960 world at zoom 0.55).
   6 - 12 s: the two hosts with K.duo: Otto talks and points at a chart while Puff listens,
   Puff puffs up (surprise), Puff talks while Otto listens and nods, Puff thinks while Otto grins,
   Puff points while Otto thinks. Loudness is synthetic here; episodes feed narration sync. */
const K = MK, P = K.P, at = K.at, DUR = 12;
K.G.BPM = 153.5;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const ap = (t, b) => K.inv(at(0, b), at(0, b) + 0.4, t);
const CD = K.genCandles(48, 7, 100, 1.6, 0.06), AL = K.alligator(CD), AO = K.ao(CD, 20), FR = K.fractals(CD).slice(0, 6);
function render(t) {
  if (t >= 6) return renderDuo(t);
  K.begin(ctx, t, { x: 1750, y: 980, z: 0.55 });
  K.ocean(ctx, { depth: 0.5 });
  K.rays(ctx, { a: 0.8 });
  K.applyCam(ctx, 1);
  K.sand(ctx, 1840, { x1: 4200 });
  K.chart(ctx, 560, 420, 980, 640, { a: ap(t, 0), candles: CD, lines: [{ data: AL.jaw, color: P.jaw }, { data: AL.teeth, color: P.teeth }, { data: AL.lips, color: P.lips }], hist: { data: AO, frac: 0.26 }, fractals: FR, draw: K.inv(0.2, 3, t), title: "Alligator + AO" });
  K.attractor(ctx, 1500, 420, 760, 640, { a: ap(t, 1), draw: K.inv(0.3, 3.5, t), yaw: 0.4 + t * 0.25, title: "Lorenz" });
  K.manifold(ctx, 2360, 420, 760, 640, { a: ap(t, 2), draw: K.inv(0.5, 2, t), yaw: 0.5 + t * 0.15, path: Array.from({ length: 30 }, (_, i) => [-0.9 + i * 0.06, 0.6 * Math.sin(i * 0.2)]), pathDraw: K.inv(1.5, 3.5, t), title: "manifold" });
  K.book(ctx, 3150, 520, 560, { asks: [["100.02", 6], ["100.04", 14], ["100.06", 9]], bids: [["99.98", 7], ["99.96", 12], ["99.94", 18]] }, { a: ap(t, 3), reveal: K.inv(0.6, 2, t), spreadText: "0.04", spreadGlow: K.pulse(t, 1), title: "book" });
  K.formula(ctx, 560, 1120, 980, 300, ["spread = ask - bid", { t: "mid = (ask + bid) / 2", c: P.sun }], { a: ap(t, 4), write: K.inv(1, 2.6, t), title: "formula" });
  K.table(ctx, 1460, 1180, [190, 170, 170], [["pair", "bid", "ask"], ["BTC", "61 990", "62 010"], ["ETH", "3 269", "3 271"], ["SOL", "148.1", "148.3"]], { a: ap(t, 5), hi: 2, title: "quotes" });
  K.bullets(ctx, 2240, 1180, 680, ["algo skills", "chaos & attractors", "Bill Williams", "manifolds"], { a: ap(t, 6), shown: K.inv(1.2, 3, t) * 4, title: "today" });
  K.code(ctx, 3080, 1200, 760, ["def quote(mid, s):", "    # both sides at once", "    return mid - s/2, mid + s/2", "bid, ask = quote(100, 0.04)"], { a: ap(t, 7), typed: K.inv(1.5, 3.5, t), title: "code" });
  K.badge(ctx, 1000, 1640, "+0.04", { a: ap(t, 8), bump: K.pulse(t, 2) });
  K.octo(ctx, 1750, 1800, 0.95, { blink: K.blinkAt(t, 2), mouth: "grin", squash: 0.06 * K.pulse(t, 1, 6), arms: [null, null, { x: -260, y: -360, card: { kind: "bid", text: "99.98" } }, null, null, { x: 260, y: -360, card: { kind: "ask", text: "100.02" } }, null, null] });
  K.fish(ctx, 2500, 1600, 0.9, { species: "T", dir: -1, card: { kind: "ask", text: "100.02" } });
  K.coralBranch(ctx, 2900, 1830, 1.1, {}); K.kelp(ctx, 200, 1850, 520, {}); K.kelp(ctx, 3300, 1850, 460, { seed: 9 });
  K.bubbles(ctx, { x0: 0, x1: 3500, y0: 1960, h: 2000, n: 30 });
}
const voice = (t, t0, t1) => (t >= t0 && t < t1 ? 0.25 + 0.6 * Math.abs(Math.sin(t * 10.5)) * (0.55 + 0.45 * Math.abs(Math.sin(t * 2.9))) : 0);
const hold = (t, t0, t1, f) => { f = f || 0.25; return Math.min(K.inv(t0, t0 + f, t), 1 - K.inv(t1 - f, t1, t)); };
const CDG = K.genCandles(30, 5, 100, 1.4, 0.1);
function renderDuo(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1 });
  K.ocean(ctx, { depth: 0.45 }); K.rays(ctx, {});
  K.applyCam(ctx, 1);
  K.tower(ctx, 120, 1010, 180, 560, { color: P.fan, dark: P.fanDark, ticker: ["42.10", "42.12"], seed: 7 });
  K.sand(ctx, 1010, { x1: 2400 });
  K.kelp(ctx, 1880, 1020, 420, { seed: 5 });
  const res = K.chart(ctx, 560, 420, 900, 600, { a: K.inv(6, 6.4, t), candles: CDG, lines: [{ data: K.sma(CDG.map((c) => c.c), 5), color: P.bid }], draw: K.inv(6.1, 7.4, t), title: "BTC 1h", tab: P.bid });
  const target = res ? [res.X(24), res.Y(CDG[24].h)] : [900, 400];
  K.screen(ctx);
  K.duo(ctx, t, {
    x: 1340, y: 1010, s: 0.95, side: 1,
    talkA: voice(t, 6.0, 7.6), talkB: voice(t, 8.6, 10.2) + voice(t, 11.2, 12),
    pointA: target, pointAmtA: hold(t, 6.4, 7.7),
    pointB: target, pointAmtB: hold(t, 11.2, 12.2),
    actA: t < 11.2 ? { kind: "grin", u: hold(t, 10.2, 11.2) } : { kind: "think", u: hold(t, 11.2, 12.2) },
    actB: t < 8.6 ? { kind: "surprise", u: hold(t, 7.6, 8.6, 0.2) } : { kind: "think", u: hold(t, 10.2, 11.2, 0.25) },
  });
  if (t >= 6 && t < 6.15) { ctx.fillStyle = "rgba(255,255,255," + (1 - (t - 6) / 0.15) + ")"; ctx.fillRect(0, 0, 1920, 1080); }
}
const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
