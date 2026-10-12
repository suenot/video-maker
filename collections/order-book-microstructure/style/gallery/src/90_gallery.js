/* KIT GALLERY: the bazaar world and every explainer primitive, for visual QA of the kit.
   0-3 s: the world (tower, raccoon, cart, strings); 3-6 s: explainer objects. */
const K = BK, P = K.P, at = K.at, DUR = 6;
K.G.BPM = 152;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const ap = (t, t0) => K.inv(t0, t0 + 0.4, t);
const ASKS = [{ p: "101.27", q: 4 }, { p: "101.28", q: 7 }, { p: "101.29", q: 5 }];
const BIDS = [{ p: "101.25", q: 6 }, { p: "101.24", q: 8 }, { p: "101.23", q: 3 }];

function world(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1 });
  K.applyCam(ctx, 1);
  K.sky(ctx, -20, -20, 1940, 760, { sunX: 1600, sunY: 170, sunR: 70 });
  K.city(ctx, -40, 1960, 700, { layer: 0, seed: 4, h: 170 });
  K.city(ctx, -80, 1960, 780, { layer: 1, seed: 9, h: 120 });
  K.shape(ctx, K.rectPts(-20, 770, 1960, 330, 4), { fill: P.terraLight, w: 5, boil: 1, seed: 5, pattern: { kind: "diamonds", color: P.terra, gap: 60, w: 12, alpha: 0.5 } });
  ctx.save(); ctx.translate(980, 0); ctx.scale(0.62, 0.62);
  K.tower(ctx, 0, 880, { asks: ASKS, bids: BIDS, gap: 200, lh: 150, w: 1100, crates: (i, side, q) => Array.from({ length: q }, (_, k) => ({ star: side === "bid" && i === 0 && k === 2 })) });
  K.lanternString(ctx, [-600, 790], [600, 790], { n: 6, sag: 30 });
  ctx.restore();
  K.bunting(ctx, [0, 40], [700, 90], { n: 9 });
  K.raccoon(ctx, 300, 1010, 1.25, { blink: K.blinkAt(t, 3), squash: 0.08 * K.pulse(t, 1, 6), hold: "abacus", beads: [0.4, 0.6, 0.2, 1], handL: { x: -80, y: -110, pose: "fist" }, handR: { x: 110, y: -190 - 20 * K.pulse(t, 1, 6), pose: "point" }, mouth: t > 1.5 ? "shout" : "smile", brow: t > 1.5 ? 1.2 : 0, exclaim: t > 1.5 ? 1 : 0 });
  K.cart(ctx, 1600 + (t % 3) * 30, 1040, 1, { roll: t * 6 });
  K.shout(ctx, 1600, 760, 300, 170, { text: "+0.62", arrow: 1, tail: [-1, 1] });
  K.tag(ctx, 980, 880 * 0.62 + 0, "0.02", { string: 0 });
}

function explain(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1 });
  K.applyCam(ctx, 1);
  K.shape(ctx, K.rectPts(-20, -20, 1960, 1120, 4), { fill: P.plaster, w: 0, boil: 0, seed: 2, pattern: { kind: "dots", color: P.plasterShade, gap: 50, w: 8, alpha: 0.5 }, reg: false });
  K.tileBoard(ctx, 400, 160, 640, 200, ["OFI = Δbid − Δask", { t: "ΔP ≈ β · OFI", c: P.terra }], { a: ap(t, 3.0), size: 44, write: K.inv(3.2, 4.5, t) });
  K.rugTable(ctx, 1420, 190, [150, 140, 140], [["price", "bid", "ask"], ["101.25", "6", "—"], ["101.26", "—", "4"], ["101.27", "—", "7"]], { a: ap(t, 3.15), hi: 1, size: 30, rowH: 50, colColors: [P.ink, P.bidDark, P.askDark] });
  K.scrollChart(ctx, 420, 650, 640, 400, [{ kind: "candle", data: [{ o: 3, h: 4, l: 2.5, c: 3.7 }, { o: 3.7, h: 4.4, l: 3.2, c: 3.4 }, { o: 3.4, h: 5, l: 3.3, c: 4.8 }, { o: 4.8, h: 5.4, l: 4.2, c: 4.4 }, { o: 4.4, h: 6, l: 4.3, c: 5.8 }] }], { a: ap(t, 3.3), draw: K.inv(3.5, 4.8, t), title: "volume bars" });
  K.priceList(ctx, 990, 520, 430, ["websockets", "queue", "imbalance"], { a: ap(t, 3.45), size: 36, shown: K.inv(3.6, 4.8, t) * 3, title: "today" });
  K.codeScroll(ctx, 1500, 600, 620, ["ob = await ex.watch_order_book('BTC/USDT')", "bid, ask = ob['bids'][0], ob['asks'][0]", "# spread in ticks", "spread = ask[0] - bid[0]"], { a: ap(t, 3.6), size: 21, typed: K.inv(3.8, 5.2, t) });
  K.signboard(ctx, 1000, 880, 360, 120, ["0.01"], { a: ap(t, 3.75), size: 60, colors: [P.terraDark], chains: 50 });
  K.depthHills(ctx, 1520, 1010, 640, 170, [6, 14, 17], [4, 11, 16], { a: ap(t, 3.9), grow: K.inv(3.9, 4.6, t) });
  K.arrow(ctx, [120, 1010], [700, 1010], { p: K.inv(4, 4.6, t), bend: -30 });
}

function render(t) { if (t < 3) world(t); else explain(t); const f = K.boilFrame(t); grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px"; }
const grainEl = document.getElementById("grain");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .32  0 0 0 0 .25  0 0 0 1.5 -.25'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";
const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
