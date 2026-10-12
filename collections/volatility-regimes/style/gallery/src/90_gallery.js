/* ============================================================
   GALLERY: every primitive of kit/50_explainer.js on the beach, 3 pages x 2 s.
   p1 forecastBoard + tikiSign + medal row (all K.ICON) + turtle
   p2 posterChart (zig returns, sigma line, calm/storm bands) + hump calm/storm
   p3 tideTable + menuBoard + postcard + buoys, currents, loop currents
   p4 K.duo: Siggy talks and points at the formula board, Gully listens (looks, nods)
   p5 K.duo bottom-right: Gully talks and points at a chart, Siggy listens
   p6 gesture sheet: turtle point / surprise / think / thumbs, gull surprise / think / whistle / binos
   ============================================================ */
const K = VK, P = K.P, DUR = 12, PAGE = 2;
const ctx = document.getElementById("cv").getContext("2d");

/* seeded returns: calm regime (sigma 0.8) then storm (sigma 2.6), plus a GARCH-ish sigma line */
const RET = [], SIG = [];
(function () {
  const r = K.mulberry(7), gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += r(); return (s - 3) * 1.4; };
  let s2 = 0.8;
  for (let i = 0; i < 48; i++) {
    const target = i < 24 ? 0.8 : 2.6;
    s2 = 0.7 * s2 + 0.3 * target + (i > 0 ? 0.15 * Math.abs(RET[i - 1]) : 0) * (i < 24 ? 0.3 : 1);
    SIG.push(s2); RET.push(gauss() * s2 * 0.8);
  }
})();
const BANDS = [{ from: 0, to: 23, regime: "calm" }, { from: 24, to: 47, regime: "storm" }];

function bg(storm, beachY) {
  K.sky(ctx, 330, { storm, sunX: 1650, sunR: 90 });
  K.ocean(ctx, 330, { storm, vol: 0.2 + storm * 0.5 });
  K.beach(ctx, beachY || 760, { storm });
}

function page1(t) {
  const F = "σ^2_t = ω + α·ε^2_{t-1} + β·σ^2_{t-1}";
  K.forecastBoard(ctx, 700, 380, 1140, 290, [F, { t: "ε_t = σ_t·z_t", size: 44, c: P.sigmaGlow }], { a: K.inv(0, 0.35, t), write: K.inv(0.2, 0.9, t), hi: /σ/ });
  K.tikiSign(ctx, 1560, 360, 470, 230, ["σ = 2.4 %"], { a: K.inv(0.3, 0.6, t), size: 66, colors: [P.storm] });
  const icons = ["garch", "leverage", "cluster", "regimes", "realized", "sun", "storm"];
  icons.forEach((k, i) => K.medal(ctx, 230 + i * 205, 900, 78, { a: K.inv(0.4 + i * 0.06, 0.7 + i * 0.06, t), icon: K.ICON[k], color: P.A[i % P.A.length], seed: 600 + i * 7 }));
  /* the turtle points up at the tiki sign */
  K.turtle(ctx, 1760, 1010, 0.8, { flipL: { x: -130, y: -170 }, mouth: "grin", look: [-0.6, -1], footL: { x: -60, y: 0 }, footR: { x: 50, y: 0 } });
}

function page2(t) {
  const ch = K.posterChart(ctx, 620, 560, 1080, 760, [
    { data: RET, kind: "zig", colorAt: (i, v) => (v >= 0 ? P.up : P.down) },
    { data: SIG, kind: "line", color: P.sigma, w: 7 },
  ], { a: K.inv(0, 0.3, t), draw: K.inv(0.2, 0.85, t), bands: BANDS, zero: true, yMin: -6, yMax: 6, xLabels: ["day 0", "", "day 24", "", "day 48"] });
  if (ch) {
    K.text(ctx, "returns + σ", ch.pl + 10, ch.pt - 52, { size: 34, weight: 900, fill: P.cream, align: "left", stroke: P.ink, w: 6 });
    K.tag(ctx, ch.X(11), ch.pt + 24, "calm", { a: K.inv(0.6, 0.8, t), seed: 3, fill: P.calm });
    K.tag(ctx, ch.X(35), ch.pt + 24, "storm", { a: K.inv(0.6, 0.8, t), seed: 4, fill: P.storm });
  }
  const hc = K.posterChart(ctx, 1530, 560, 600, 760, [], { a: K.inv(0.2, 0.5, t) });
  if (hc) {
    const base = hc.pb, mid = (hc.pl + hc.pr) / 2;
    K.hump(ctx, mid, base, 220, 220, { a: K.inv(0.4, 0.7, t), color: P.storm, fat: 0.3, seed: 82 });
    K.hump(ctx, mid, base, 110, 470, { a: K.inv(0.5, 0.8, t), color: P.calm, seed: 81 });
    K.text(ctx, "return distribution", mid, hc.pt - 52, { size: 32, weight: 900, fill: P.cream, stroke: P.ink, w: 6 });
    K.tag(ctx, mid, base - 520, "calm: narrow", { a: K.inv(0.7, 0.9, t), seed: 5, size: 26 });
    K.tag(ctx, hc.pr - 80, base - 170, "storm: fat", { a: K.inv(0.7, 0.9, t), seed: 6, size: 26, fill: P.storm });
  }
}

function page3(t) {
  K.tideTable(ctx, 430, 270, [150, 170, 170], [["regime", "σ", "days"], ["calm", "0.8 %", "212"], ["storm", "2.6 %", "41"], ["crash", "5.1 %", "6"], ["all", "1.2 %", "259"]], { a: K.inv(0, 0.3, t), reveal: K.inv(0.1, 0.6, t), hi: 2 });
  K.menuBoard(ctx, 400, 790, 600, ["vol clusters", "regimes persist", "storms are short"], { a: K.inv(0.2, 0.5, t), shown: K.inv(0.4, 1.0, t) * 3, title: "Surf report" });
  K.postcard(ctx, 1360, 200, 900, ["from arch import arch_model", "am = arch_model(r, vol=\"GARCH\")", "res = am.fit(disp=\"off\")", "sigma = res.conditional_volatility  # σ"], { a: K.inv(0.1, 0.4, t), typed: K.inv(0.3, 1.1, t) });
  const A = [1110, 820], B = [1630, 820];
  K.buoy(ctx, A[0], A[1], 0.95, { a: K.inv(0.3, 0.6, t), icon: K.ICON.sun, color: P.calm, seed: 91 });
  K.buoy(ctx, B[0], B[1], 0.95, { a: K.inv(0.4, 0.7, t), icon: K.ICON.storm, color: P.storm, seed: 92, hot: 0.6 });
  const At = [A[0], A[1] - 120], Bt = [B[0], B[1] - 120];
  K.current(ctx, At, Bt, { p: K.inv(0.6, 1.0, t), bend: -90, label: "0.03", seed: 11 });
  K.current(ctx, Bt, At, { p: K.inv(0.8, 1.2, t), bend: -90, label: "0.10", seed: 12, hot: true });
  K.loopCurrent(ctx, [A[0], A[1] - 165], 90, { p: K.inv(0.9, 1.3, t), label: "0.97", seed: 13 });
  K.loopCurrent(ctx, [B[0], B[1] - 165], 90, { p: K.inv(1.0, 1.4, t), label: "0.90", seed: 14 });
}

/* fake narration loudness: syllables at ~5 Hz with pauses (seeded, seek-safe) */
const loud = (t, seed) => { const k = Math.floor(t * 5), on = K.hash(Math.floor(t * 1.2), seed) > 0.25 ? 1 : 0; return on * (0.35 + 0.65 * K.hash(k, seed)) * Math.abs(Math.sin(t * 5 * Math.PI)); };

function page4(t) {
  K.forecastBoard(ctx, 1220, 360, 1060, 290, [{ t: "σ^2_t = ω + α·ε^2_{t-1} + β·σ^2_{t-1}", size: 54 }], { a: 1, write: 1, hi: /σ/, seed: 31 });
  K.duo(ctx, t, { x: 360, y: 1020, s: 1.3, side: 1, talkA: loud(t, 3), talkB: 0, pointA: [880, 380], pointAmt: K.inv(0.2, 0.6, t) });
}
function page5(t) {
  K.posterChart(ctx, 640, 430, 1060, 620, [{ kind: "zig", data: RET, colorAt: (i, v) => (v >= 0 ? P.up : P.down) }, { kind: "line", data: SIG.map((x) => 2 * x), color: P.sigma }], { bands: BANDS, zero: true, seed: 44 });
  K.duo(ctx, t, { x: 1600, y: 1020, s: 1.3, side: -1, talkA: 0, talkB: loud(t, 9), pointB: [960, 400], pointBmt: K.inv(0.2, 0.6, t) });
}
function page6(t) {
  const u = 0.5;
  ["point", "surprise", "think", "thumbs"].forEach((k, i) => K.turtle(ctx, 300 + i * 440, 560, 0.85, Object.assign({ seed: 700, mouth: "smile" }, K.turtleGesture(k, u, { target: [220, -260] }))));
  ["surprise", "think", "whistle", "binos"].forEach((k, i) => K.gull(ctx, 300 + i * 440, 1030, 0.95, Object.assign({ seed: 900, face: 1 }, K.gullGesture(k, u, { face: 1 }))));
}

function render(t) {
  try {
    const pg = Math.min(5, Math.floor(t / PAGE)), lt = t - pg * PAGE;
    K.begin(ctx, t, { x: 960, y: 540, z: 1 });
    K.applyCam(ctx, 1);
    bg(pg === 1 ? 0.6 : 0, pg === 2 ? 900 : pg === 5 ? 640 : 760);
    [page1, page2, page3, page4, page5, page6][pg](lt);
  } catch (e) { K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(e && e.stack || e).slice(0, 160), 20, 50); }
}
const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
window.__timelines["main"] = TL;
