/* ============================================================
   GALLERY: every explainer primitive of the lab kit on one board.
   Rebuild and snapshot after any kit change to catch regressions.
   ============================================================ */
const K = LK, P = K.P, DUR = 4;
const ctx = document.getElementById("cv").getContext("2d");
function render(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 0.5, rot: 0 });
  K.applyCam(ctx, 1);
  K.labWall(ctx, -1000, 3000, { top: -700, bottom: 1700, dado: 1000, windows: [[180, -380, 300, 560]] });
  K.bench(ctx, -1000, 3000, 1500, { seed: 60 });
  const a = K.inv(0, 0.5, t);
  K.plate(ctx, 0, -160, 720, 440, [{ data: [0.2, 0.35, 0.3, 0.55, 0.5, 0.7, 0.66, 0.82], color: P.leaf, kind: "line" }, { data: [0.25, 0.3, 0.45, 0.5, 0.48, 0.62, 0.7, 0.75], kind: "scatter" }], { a, draw: K.inv(0.3, 1.5, t), title: "fit + band", xLabels: ["t0", "t1", "t2", "t3"], band: { lo: [0.1, 0.25, 0.2, 0.42, 0.38, 0.56, 0.5, 0.64], hi: [0.3, 0.45, 0.4, 0.68, 0.62, 0.84, 0.8, 0.98] } });
  K.plate(ctx, 900, -160, 640, 440, [{ data: [0.3, 0.6, 0.45, 0.8, 0.5], color: P.test, kind: "bar" }], { a, draw: K.inv(0.3, 1.2, t), title: "bars" });
  K.board(ctx, 1840, -200, 760, 300, ["p(y|x) = N(mu, s2)", { t: "q = 0.95", c: P.brassLight }], { a, write: K.inv(0.5, 2, t) });
  K.card(ctx, 0, 450, [200, 180, 180], [["model", "sharpe", "dd"], ["tree", "1.42", "-8 %"], ["net", "1.61", "-11 %"], ["bayes", "1.35", "-6 %"]], { a, hi: 2 });
  K.gauge(ctx, 720, 400, 150, 0.2 + 0.5 * K.inv(0.5, 2, t), { a, readout: "0.71" });
  K.packets(ctx, 1320, 430, 560, ["anomalies", "AutoML", "conformal"], { a, shown: K.inv(0.6, 2, t) * 3 });
  K.typewriter(ctx, 2140, 420, 640, ["def fit(X, y):", "    # walk-forward", "    return model.fit(X, y)"], { a, typed: K.inv(0.5, 2.5, t) });
  K.flask(ctx, -620, 1500, 1.2, { layers: [{ h: 0.4, color: P.train }, { h: 0.2, color: P.test }], bubbles: 3, label: "f1" });
  K.flask(ctx, -150, 1500, 1.2, { layers: [{ h: 0.5, color: P.glass }], bubbles: 2, glowA: 0.5 });
  K.tube(ctx, [-560, 1260], [-100, 1260], { state: "hot", bend: -50, label: "0.84" });
  K.pot(ctx, 450, 1500, 1); K.treePlant(ctx, 450, 1380, 0.8, { grow: K.inv(0, 2, t) * 3, leaves: ["0.2", "0.7", "0.4", "0.9", "0.1", "0.6", "0.3", "0.8"] });
  K.pot(ctx, 1350, 1500, 1, { color: P.glassDark, shadow: P.glassDeep }); K.netVine(ctx, 1350, 1100, 0.95, { grow: K.inv(0, 2, t) * 4, pulse: (t / 2) % 1, w: 420, h: 300 });
  K.owl(ctx, 2150, 1500, 1.2, { blink: K.blinkAt(t, 3), wingR: { x: 150, y: -330, hand: "thumb" }, wingL: { x: -150, y: -260, hand: "point" }, mouth: "smile" });
  K.screen(ctx);
  K.marquee(ctx, 960, 650, 900, 90, 1, { chase: Math.floor(t * 4) });
}
const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
