/* KIT GALLERY: every explainer primitive in one diner, for visual QA of the kit.
   0-3 s: things pop in on beats; 3-4.8 s: hold (boil keeps them alive);
   4.8-6 s: character + set sheet (hamster poses, sandwich bot, conveyor, props). */
const K = DK, P = K.P, at = K.at, DUR = 6;
K.G.BPM = 150;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const ap = (t, b) => K.inv(at(0, b), at(0, b) + 0.4, t);
function sheet(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1 });
  K.applyCam(ctx, 1);
  K.wall(ctx, -50, 1970, -50, 760, { seed: 3 });
  K.checkerFloor(ctx, -50, 1970, 760, 1130, { seed: 9 });
  K.passWindow(ctx, 80, 40, 1100, 300, 30);
  K.conveyor(ctx, 40, 1240, 330, t * 120, { seed: 60 });
  K.block(ctx, 300, 330, 0.9, { num: "#19 204 117", items: [{ kind: "ticket", color: P.mint, label: "ETH" }, { kind: "coin" }, { kind: "ticket", color: P.cherry, label: "ETH" }], seal: 1 });
  K.block(ctx, 820, 330, 0.9, { num: "#19 204 118", items: [{ kind: "bread" }, { kind: "burger", bite: 1 }, { kind: "bread" }], hot: 1 });
  K.ticketRail(ctx, 1300, 1880, 120, 300);
  [[1370, P.mint, "ETH", "2.0", "up", 1], [1500, P.cherry, "ETH", "9.5", "up", 3], [1630, P.mint, "USDC", "500", "down", 0], [1760, P.cherry, "ETH", "9.5", "down", 3]].forEach((q, i) => K.ticket(ctx, q[0], 128, 0.8, { color: q[1], label: q[2], amt: q[3], arrow: q[4], gas: q[5], seed: 210 + i * 7, tilt: Math.sin(t * 2 + i) * 0.05, stamp: i === 0 ? { text: "-1.2%", a: 1 } : null }));
  K.lamp(ctx, 1450, 0, 0.8, 1, 50);
  K.bell(ctx, 1600, 480, 0.8, K.inv(5.0, 5.6, t) > 0 ? 1 - K.inv(5.0, 5.8, t) : 0, 400);
  K.coffee(ctx, 1800, 520, 0.8, 410);
  K.hamster(ctx, 240, 1040, 1.25, { blink: 0, pawR: { x: 100, y: -190 }, hold: "magnifier", magAng: -35, mouth: "smile" });
  K.hamster(ctx, 580, 1040, 1.25, { exclaim: 1, eyeUp: 6, mouth: "open", brow: 1.2, pawL: { x: -90, y: -150 }, pawR: { x: 90, y: -150 }, cheeks: 0.2 });
  K.hamster(ctx, 920, 1040, 1.25, { brow: -1, mouth: "frown", squash: 0.25, pawL: { x: -40, y: -80 }, pawR: { x: 110, y: -110 }, hold: "magnifier", magAng: 10, look: [1, 0] });
  K.hamster(ctx, 1260, 1000, 1.25, { hop: 40, squash: -0.3, mouth: "grin", wink: 1, toqueTip: -14, pawL: { x: -60, y: -230 }, cheeks: 1 });
  K.sandwichBot(ctx, 1620, 1040, 1.1, { grin: 0.9, glow: 1, look: Math.sin(t * 3), sliceL: true, sliceR: true, armL: { x: -150, y: -200 }, armR: { x: 150, y: -200 }, walk: t * 8 });
  K.sandwichBot(ctx, 1850, 1040, 0.8, { shock: 1, lean: -10, armL: { x: -110, y: -280 }, armR: { x: 110, y: -280 } });
}
function render(t) {
  try {
    if (t >= 4.8) { sheet(t); return; }
    K.begin(ctx, t, { x: 960, y: 540, z: 1 });
    K.applyCam(ctx, 1);
    K.wall(ctx, -50, 1970, -50, 860, { seed: 3 });
    K.checkerFloor(ctx, -50, 1970, 860, 1130, { seed: 9 });
    K.chalkboard(ctx, 330, 190, 560, 190, ["x · y = k", { t: "Δy = y·Δx/(x+Δx)", c: P.mustard }], { a: ap(t, 0), size: 40, write: K.inv(0.3, 1.8, t), legs: false });
    K.menu(ctx, 1010, 300, [130, 150, 150], [["side", "price", "size"], ["ask", "2 012", "4.1"], ["ask", "2 008", "2.5"], ["bid", "2 004", "3.0"], ["bid", "2 001", "6.2"]], { a: ap(t, 1), hi: 3, size: 28, rowH: 46, rowColors: [null, P.ask, P.ask, P.bid, P.bid], bars: [0, 0.6, 0.35, 0.45, 0.9], barColors: [null, P.cherryLight, P.cherryLight, P.mint, P.mint] });
    K.placemat(ctx, 1620, 300, 520, 400, [{ xy: Array.from({ length: 30 }, (_, i) => { const x = 0.6 + i * 0.12; return [x, 4 / x]; }), color: P.cherry, kind: "xy" }], { a: ap(t, 2), draw: K.inv(1.0, 3.0, t), title: "x·y=k", xMin: 0.5, xMax: 4.3, yMin: 0, yMax: 7, marker: { x: 2, y: 2 } });
    K.letterBoard(ctx, 330, 690, 520, ["DEX", "AMM", "MEV"], { a: ap(t, 3), size: 40, shown: K.inv(1.6, 3.2, t) * 3, title: "specials" });
    K.receipt(ctx, 960, 760, 560, ["def price(x, y):", "  # constant product", "  return y / x", "k = 1_000 * 2_000_000"], { a: ap(t, 4), size: 26, typed: K.inv(2.2, 4.0, t) });
    K.register(ctx, 1620, 690, 380, 100, ["-1.2 %"], { a: ap(t, 5), size: 60, colors: [P.cherryLight], bump: K.inv(3.5, 3.9, t) });
    K.edge(ctx, [1380, 980], [1880, 980], { p: K.inv(2.5, 3.2, t), state: t > 3.5 ? "hot" : "plain", label: "2 004", labelSize: 30, bend: -40, trim: 30, seed: 7 });
    K.node(ctx, 1320, 1010, 0.6, { label: "ETH", color: P.ETH, a: ap(t, 6), hot: t > 3.5 ? 1 : 0, seed: 4 });
    K.hamster(ctx, 120, 1060, 0.9, { blink: K.blinkAt(t, 2), squash: 0.1 * K.pulse(t, 1, 6), pawR: { x: 90, y: -170 - 20 * K.pulse(t, 1, 6) }, hold: "magnifier", magAng: -40, mouth: "grin", cheeks: 0.4 });
  } catch (err) {
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 140), 20, 50);
  }
}
const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
