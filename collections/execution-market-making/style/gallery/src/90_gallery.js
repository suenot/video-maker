/* KIT GALLERY: visual QA of the kit.
   0-6 s   the station world and every explainer primitive (pop in on beats, then hold)
   6-10 s  the hosts as a duo: Mr. Tick talks + points at a poster while Dash listens,
           then Dash talks + points while Mr. Tick listens (synthetic loudness)
   10-14 s the host sheet: mouths, listening and every gesture at ~190 px tall */
const K = SK, P = K.P, at = K.at, DUR = 14;
K.G.BPM = 129.2;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const ap = (t, b) => K.inv(at(0, b), at(0, b) + 0.4, t);
function render(t) {
  try { if (t < 6) draw(t); else if (t < 10) drawDuo(t); else drawSheet(t); } catch (err) { K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "26px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 150), 20, 50); }
}
function draw(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1 });
  K.applyCam(ctx, 1);
  K.sky(ctx, { horizon: 900, sun: [1780, 140], sunR: 70 });
  K.hills(ctx, -100, 2100, 900, { h: 120, color: P.hillFar, seed: 3, n: 5, tone: false });
  K.plaque(ctx, 40, 40, 560, 170, ["x(t) = X·(1 - t/T)", { t: "min E + λ·Var" }], { a: ap(t, 0), size: 36, write: K.inv(0.3, 1.8, t) });
  K.board(ctx, 640, 40, [130, 150, 170], [["time", "qty", "price"], ["10:00", "1 250", "100.01"], ["10:15", "1 250", "100.02"], ["10:30", "1 250", "100.02"]], { a: ap(t, 1), hi: 2, size: 26, rowH: 46 });
  K.flap(ctx, 1500, 110, "10 000", { a: ap(t, 2), h: 80, flip: K.inv(0.9, 1.8, t), prev: "000000" });
  K.poster(ctx, 50, 300, 560, 380, [{ data: [9, 6, 4, 3, 3, 4, 6, 10], kind: "bars", color: P.teal }, { data: [2, 3, 3.5, 4, 4.2, 4.6, 5, 5.2], color: P.tomato }], { a: ap(t, 3), draw: K.inv(1.0, 3.0, t), title: "VWAP", xLabels: ["9", "10", "11", "12", "13", "14", "15", "16"] });
  K.tickets(ctx, 660, 300, 420, ["TWAP", "VWAP", "POV"], { a: ap(t, 3), shown: K.inv(1.4, 3.0, t) * 3 });
  K.teletype(ctx, 1130, 260, 620, ["def twap(q, n):", "  # equal slices", "  return [q / n] * n"], { a: ap(t, 4), typed: K.inv(2.0, 3.6, t) });
  K.stop(ctx, 1200, 560, 22, { a: ap(t, 5), label: "BID", hot: 1 });
  K.route(ctx, [1200, 560], [1500, 600], { p: K.inv(2.4, 3.0, t), color: P.mustard, bend: -40, label: "0.04" });
  K.stop(ctx, 1500, 600, 22, { a: ap(t, 5), label: "ASK" });
  K.gauge(ctx, 1730, 560, 80, 0.2 + 0.05 * Math.sin(t * 3));
  K.track(ctx, -100, 2100, 960);
  K.wagon(ctx, 1140, 960, 1, { roll: t * 120, load: (c) => K.crate(c, 0, -58, 120, 70, { label: "1 250", seed: 81 }) });
  K.loco(ctx, 1520, 960, 1, { roll: t * 120 });
  K.puff(ctx, 1652, 640 - t * 30, 50, (t % 2) / 2, 3);
  K.clockTower(ctx, 260, 960, 0.4, { hour: 10 + t / 12, minute: t * 10, gearRot: t });
  K.coin(ctx, 450, 900, 30, { label: "¢" });
  K.mouse(ctx, 720, 960, 1, { blink: K.blinkAt(t, 2), squash: 0.08 * K.pulse(t, 1, 6), handR: { x: 70, y: -120, hold: "watch", lid: K.inv(1, 1.4, t) }, handL: { x: -78, y: -110 - 20 * K.pulse(t, 1, 6), hold: "thumb" }, mouth: "grin" });
  K.mouse(ctx, 920, 960, 0.8, { blink: K.blinkAt(t, 5), handR: { x: 22, y: -196, hold: "whistle" }, handL: { x: -60, y: -60 }, mouth: "whistle", puff: 0.8, look: [0.6, -0.2], exclaim: K.inv(1, 1.3, t) });
}
/* fake narration loudness: syllables (~6/s) inside phrases, deterministic */
function loud(t, t0, t1, seed) {
  if (t < t0 || t > t1) return 0;
  const syl = Math.max(0, Math.sin(t * 38 + seed)) * 0.6 + 0.4 * K.hash(Math.floor(t * 6), seed);
  const phrase = K.ss(t0, t0 + 0.12, t) * (1 - K.ss(t1 - 0.15, t1, t)) * (K.hash(Math.floor(t * 1.5), seed + 3) > 0.15 ? 1 : 0.15);
  return K.clamp(syl * phrase, 0, 1);
}
function stage(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1 });
  K.applyCam(ctx, 1);
  K.sky(ctx, { horizon: 860, sun: [1500, 150], sunR: 60 });
  K.hills(ctx, -100, 2100, 860, { h: 110, color: P.hillFar, seed: 3, n: 5, tone: false });
  K.screen(ctx);
}
function drawDuo(t) {
  stage(t);
  const POST = [880, 150, 860, 520], bar = [1290, 470], peak = [1660, 300];
  K.poster(ctx, POST[0], POST[1], POST[2], POST[3], [{ data: [9, 6, 4, 3, 3, 4, 6, 10], kind: "bars", color: P.teal }, { data: [2, 3, 3.5, 4, 4.2, 4.6, 5, 5.2], color: P.tomato }], { a: 1, draw: 1, title: "VWAP", xLabels: ["9", "10", "11", "12", "13", "14", "15", "16"] });
  const aT = loud(t, 6.2, 7.9, 1), bT = loud(t, 8.1, 9.9, 7);
  K.duo(ctx, t, {
    layout: "left", s: 1.15, appear: K.inv(6, 6.35, t),
    a: { talk: aT, accents: [6.35, 7.1], point: bar, pointAmt: K.ss(6.6, 6.9, t) * (1 - K.ss(7.7, 8.0, t)), nodAt: [8.3, 8.8, 9.3], gest: [{ at: 9.45, kind: "surprise", dur: 0.6 }] },
    b: { talk: bT, accents: [8.3, 9.0], nodAt: [6.5, 7.0, 7.5], point: peak, pointAmt: K.ss(8.6, 8.9, t), gest: [{ at: 6.0, kind: "tape", dur: 2.0 }] },
  });
  K.text(ctx, t < 8 ? "Mr. Tick talks + points · Dash listens" : "Dash talks + points · Mr. Tick listens", 1310, 720, { size: 30, fill: P.ink, font: K.FONT.display });
}
function drawSheet(t) {
  stage(t);
  const A = [
    ["talk a", { talk: 0.9, viseme: "a" }], ["talk e", { talk: 0.7, viseme: "e" }], ["talk o", { talk: 0.7, viseme: "o" }],
    ["listen", { listen: 1, toward: 1 }], ["point", { point: [2000, 200] }], ["think", { gest: [{ at: 10, kind: "think", dur: 9 }] }],
    ["surprise", { gest: [{ at: 10.4, kind: "surprise", dur: 9 }] }], ["shrug", { gest: [{ at: 10, kind: "shrug", dur: 9 }] }], ["watch", { gest: [{ at: 10, kind: "watch", dur: 9 }] }],
  ];
  const B = [
    ["talk a", { talk: 0.9, viseme: "a" }], ["talk e", { talk: 0.7, viseme: "e" }], ["listen", { listen: 1 }],
    ["point", { point: [-200, 300] }], ["nod", { gest: [{ at: 10, kind: "nod", dur: 9 }] }], ["think", { gest: [{ at: 10, kind: "think", dur: 9 }] }],
    ["surprise", { gest: [{ at: 10.4, kind: "surprise", dur: 9 }] }], ["flap", { gest: [{ at: 10, kind: "flap", dur: 9 }] }], ["ticket", { gest: [{ at: 10, kind: "ticket", dur: 9, label: "No 7" }] }],
  ];
  const cw = 1920 / 9;
  K.platform(ctx, -20, 1940, 470, { h: 40, seed: 64 });
  K.platform(ctx, -20, 1940, 980, { h: 60, seed: 65 });
  A.forEach(([lab, o], i) => {
    const x = cw * (i + 0.5), y = 470;
    K.mouse(ctx, x, y, 0.62, K.mousePose(t, Object.assign({ x, y, s: 0.62, seed: 2 + i }, o)));
    K.text(ctx, lab, x, 30, { size: 26, fill: P.ink, font: K.FONT.mono });
  });
  B.forEach(([lab, o], i) => {
    const x = cw * (i + 0.5), y = 980;
    K.pigeon(ctx, x, y, 0.72, K.pigeonPose(t, Object.assign({ x, y, s: 0.72, seed: 21 + i, face: i % 2 ? -1 : 1 }, o)));
    K.text(ctx, lab, x, 560, { size: 26, fill: P.ink, font: K.FONT.mono });
  });
}
const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
