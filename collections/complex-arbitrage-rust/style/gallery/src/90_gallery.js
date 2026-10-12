/* KIT GALLERY: every explainer primitive in one harbour, for visual QA of the kit.
   0-3 s: things pop in on beats; 3-6 s: hold (boil keeps them alive). */
const K = CK, P = K.P, at = K.at, DUR = 6;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const ap = (t, b) => K.inv(at(0, b), at(0, b) + 0.4, t);
function render(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1 });
  K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 9 });
  K.slate(ctx, 420, 170, 640, 200, ["w = -ln(rate)", { t: "Σ w < 0  ⇒  profit", c: P.profit }], { a: ap(t, 0), size: 44, write: K.inv(0.3, 1.8, t) });
  K.ledger(ctx, 1420, 190, [150, 190, 170], [["pair", "bid", "ask"], ["BTC/USDT", "62 000", "62 010"], ["ETH/BTC", "0.0525", "0.0526"], ["ETH/USDT", "3 270", "3 271"]], { a: ap(t, 1), hi: 2, size: 28, rowH: 48 });
  K.sailChart(ctx, 400, 640, 620, 380, [{ data: [3, 4, 3.6, 5, 6.2, 5.8, 7.1], color: P.USDT }, { data: [2, 2.6, 3.1, 2.8, 3.9, 4.4, 4.1], color: P.rust }], { a: ap(t, 2), draw: K.inv(1.0, 3.0, t), title: "basis, %", xLabels: ["M", "T", "W", "T", "F", "S", "S"] });
  K.notice(ctx, 960, 520, 420, ["graph cycles", "basis", "copulas"], { a: ap(t, 3), size: 36, shown: K.inv(1.6, 3.2, t) * 3, title: "today" });
  K.logbook(ctx, 1520, 700, 600, ["fn profit(c: &[f64]) -> f64 {", "  // product of rates", "  c.iter().product::<f64>() - 1.0", "}"], { a: ap(t, 4), size: 24, typed: K.inv(2.2, 4.0, t) });
  K.plank(ctx, 980, 960, 420, 110, ["+0.46 %"], { a: ap(t, 5), size: 56, colors: ["#2f8a3e"], post: false });
  K.edge(ctx, [120, 960], [700, 960], { p: K.inv(2.5, 3.2, t), state: t > 3.5 ? "hot" : "plain", label: "3 270", labelSize: 34, bend: -50, trim: 40, seed: 7 });
  K.perch(ctx, 1440, 1060, 80, 731);
  K.parrot(ctx, 1440, 980, 0.8, { blink: K.blinkAt(t, 5), talk: 0.5 + 0.5 * Math.sin(t * 9), wingR: 0.4 * K.pulse(t, 1, 6), look: [0.8, -0.2] });
  K.crab(ctx, 1730, 1060, 0.9, { talk: 0.4 + 0.4 * Math.sin(t * 7), blink: K.blinkAt(t, 2), squash: 0.1 * K.pulse(t, 1, 6), clawR: { x: 100, y: -150 - 20 * K.pulse(t, 1, 6), open: 0.6 }, mouth: "grin" });
}
const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
