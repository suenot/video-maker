/* ============================================================
   GALLERY: every explainer primitive of the vaudeville kit on the stage.
   Three 2-second pages. Rebuild + snapshot after kit changes:
     python3 ../kit/tools/build.py . && npx hyperframes snapshot . --at 1.6,3.6,5.6
   ============================================================ */
const K = VK, P = K.P, DUR = 6;
K.G.BPM = 150; K.G.BARS = null; K.G.OFFSET = 0;
const ctx = document.getElementById("cv").getContext("2d"), fx = document.getElementById("fx").getContext("2d");
const ap = (t, t0) => K.inv(t0, t0 + 0.4, t);

function stage(t) {
  K.backdrop(ctx, { light: 0.5 }); K.floor(ctx);
  K.valance(ctx, -60, { depth: 80, swags: 6 });
  K.curtain(ctx, -1, 1, { seed: 400 }); K.curtain(ctx, 1, 1, { seed: 460 });
}
function page0(t) {
  K.intertitle(ctx, 640, 330, 860, 300, ["z = (S − μ) / σ", { t: "enter at |z| > 2", c: P.gold }], { a: ap(t, 0.1), write: K.inv(0.3, 1.4, t), size: 50 });
  K.gauge(ctx, 1380, 320, 140, K.lerp(0, 2.3, K.ss(0.4, 1.6, t)), { a: ap(t, 0.2), glow: 0.4 });
  K.ticket(ctx, 1420, 680, 520, 200, [{ t: "+$1 240" }, "P&L"], { a: ap(t, 0.5), gold: true });
  K.spring(ctx, [360, 800], [K.lerp(560, 980, K.ss(0.4, 1.6, t)), 800], { strain: K.ss(0.4, 1.6, t), r: 22, coils: 9 });
  K.penguin(ctx, 290, 980, 0.8, { hat: "top", blink: K.blinkAt(t, 2) });
  K.penguin(ctx, K.lerp(630, 1050, K.ss(0.4, 1.6, t)), 980, 0.8, { hat: "boater", blink: K.blinkAt(t, 5) });
}
function page1(t) {
  const S = [], N = 48; for (let i = 0; i < N; i++) S.push(2.2 * Math.sin(i * 0.22) * Math.exp(-i * 0.01) + 0.4 * Math.sin(i * 1.3));
  K.screenChart(ctx, 620, 430, 880, 420, [{ data: S, color: P.ink, w: 6 }], { a: ap(t, 2.05), draw: K.inv(2.2, 3.6, t), yMin: -3, yMax: 3, title: "spread",
    bands: [{ v: 2, color: P.gold, label: "+2σ" }, { v: 0, color: P.g3, dash: [6, 10] }, { v: -2, color: P.gold, label: "−2σ" }], marks: [{ i: 6, s: 0, label: "−1 ▼" }, { i: 14, s: 0 }] });
  K.playbill(ctx, 1450, 460, [170, 150, 150], [["pair", "β", "p-value"], ["BTC/ETH", "1.42", "0.012"], ["SOL/AVAX", "0.87", "0.034"], ["LTC/BCH", "1.10", "0.210"]], { a: ap(t, 2.25), hi: 1, title: "Tonight", reveal: K.inv(2.4, 3.2, t) });
}
function page2(t) {
  K.easel(ctx, 520, 430, 700, ["distance", "cointegration", "copulas", { t: "funding-rate arbitrage", c: P.gold }], { a: ap(t, 4.05), shown: K.lerp(0, 4, K.inv(4.2, 5.4, t)), title: "Program" });
  K.typewriter(ctx, 1350, 330, 760, ["# hedge ratio by OLS", "beta = cov(a, b) / var(b)", "spread = a - beta * b", "z = (spread - mu) / sd"], { a: ap(t, 4.15), typed: K.inv(4.3, 5.5, t) });
  K.hangTag(ctx, 1080, 700, "62 410.5", { a: ap(t, 4.3), string: 40 });
  K.bell(ctx, 1560, 900, 0.9, Math.exp(-Math.max(0, t - 4.8) * 3) * (t > 4.8 ? 1 : 0), 690);
  K.coinRain(ctx, t, 4.5, { x0: 900, x1: 1800, n: 12 });
  K.cat(ctx, 1250, 1000, 0.8, { blink: K.blinkAt(t, 3), mouth: "grin", gloveR: { x: 120, y: -220, open: 1 }, gloveL: { x: -90, y: -140, open: 0.5 } });
}
function render(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1 }); K.applyCam(ctx, 1);
  ctx.fillStyle = P.ink; ctx.fillRect(-200, -200, 2400, 1500);
  stage(t);
  if (t < 2) page0(t); else if (t < 4) page1(t); else page2(t);
  K.begin(fx, t, K.cam); fx.clearRect(0, 0, K.W, K.H); K.film(fx, t);
}
const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
