/* ============================================================
   GALLERY: every explainer primitive of the vaudeville kit on the stage.
   Five 2-second pages: props (3 pages), then the two hosts (talk, listen,
   point, gestures, a carried prop). Rebuild + snapshot after kit changes:
     python3 ../kit/tools/build.py . && npx hyperframes snapshot . --at 1.7,3.7,5.7,6.6,7.6,8.6,9.6
   ============================================================ */
const K = VK, P = K.P, DUR = 10;
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
/* synthetic loudness: a syllable flutter under a phrase envelope (episodes use the real envelope) */
const voice = (t, t0, t1, f) => (t < t0 || t > t1 ? 0 : K.ss(t0, t0 + 0.15, t) * (1 - K.ss(t1 - 0.15, t1, t)) * (0.35 + 0.65 * Math.abs(Math.sin(t * (f || 9)))) * (0.75 + 0.25 * Math.sin(t * 2.3)));
function page3(t) { /* 6-8: Dan explains, Skip listens, then Skip asks and points at the screen */
  const S = [0.2, 0.8, 1.6, 2.3, 1.9, 1.1, 0.4, -0.3, -0.1, 0.3, 0.1];
  K.screenChart(ctx, 1260, 380, 860, 400, [{ data: S, color: P.ink, w: 6 }], { a: ap(t, 6.05), yMin: -3, yMax: 3, title: "z-score", bands: [{ v: 2, color: P.gold, label: "+2\u03c3" }, { v: -2, color: P.gold, label: "\u22122\u03c3" }], marks: [{ i: 3, s: 0, label: "\u22121 \u25bc" }] });
  const ct = voice(t, 6.0, 6.95, 9), pt = voice(t, 7.05, 8.0, 12);
  K.duo(ctx, t, { side: "left", a: K.inv(6, 6.4, t), cat: { talk: ct, partnerTalk: pt }, pen: { talk: pt, partnerTalk: ct, acts: [{ at: 7.1, kind: "surprise", dur: 0.9 }] },
    pointCat: t < 7 ? [1000, 330] : null, pointPen: t > 7.45 ? [1100, 250] : null });
}
function page4(t) { /* 8-10: gestures: Dan thinks, Skip carries a ticket, then a shrug and a grin */
  K.intertitle(ctx, 1300, 320, 820, 260, ["half-life = ln 2 / \u03b8"], { a: ap(t, 8.05), write: K.inv(8.2, 9, t), size: 46 });
  const ct = voice(t, 9.0, 9.95, 9), pt = voice(t, 8.05, 8.9, 12);
  K.duo(ctx, t, { side: "left", cat: { talk: ct, partnerTalk: pt, acts: [{ at: 8.0, kind: "think", dur: 1.0 }, { at: 9.1, kind: "grin", dur: 0.9 }] },
    pen: { talk: pt, partnerTalk: ct, acts: [{ at: 9.05, kind: "nod", dur: 0.95 }] },
    carry: { who: "pen", hand: "R", aim: [150, -170], draw: (c, x, y) => K.ticket(c, x + 120, y - 40, 300, 130, [{ t: "+$310" }], { gold: true, size: 44 }) } });
}
function render(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1 }); K.applyCam(ctx, 1);
  ctx.fillStyle = P.ink; ctx.fillRect(-200, -200, 2400, 1500);
  stage(t);
  if (t < 2) page0(t); else if (t < 4) page1(t); else if (t < 6) page2(t); else if (t < 8) page3(t); else page4(t);
  K.begin(fx, t, K.cam); fx.clearRect(0, 0, K.W, K.H); K.film(fx, t);
}
const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
