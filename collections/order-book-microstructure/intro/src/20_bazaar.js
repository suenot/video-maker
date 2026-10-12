/* ============================================================
   INTRO 20 BAZAAR SET: sky, city, the stall tower (the order book), the
   balcony at the alley, crates flowing in, the market-order cart, tags.
   World units; the camera lives in 70_render.js.
   ============================================================ */
const pulseB = (t) => K.pulse(t, 1, 6);          /* every beat */
const pulseA = (t) => K.pulse(t, 4, 5);          /* every bar */

/* alley height: wide, then slammed narrow on "spread" with a small rebound */
function gapAt(t) {
  const u = K.E.in3(K.inv(T.slam - 0.24, T.slam, t));
  const reb = t > T.slam ? 16 * Math.exp(-7 * (t - T.slam)) * Math.sin((t - T.slam) * 26) : 0;
  return K.lerp(GAP0, GAP1, u) + reb;
}
const alleyMid = (t) => YB0 - gapAt(t) / 2;
const towerX0 = -TW / 2;
const bidFloor = (i) => YB0 + (i + 1) * LH;
const askFloor = (i, t) => YB0 - gapAt(t) - i * LH;
const stallOpenAt = (side, i) => T.stalls + (side === "ask" ? 4 - i : 5 + i) * BEAT / 2;

/* queue slot of crate k at time t: it moves up as crates ahead of it leave */
function slotOf(arr, k, t) {
  let s = k;
  for (let j = 0; j < k; j++) if (arr[j].remove != null) s -= K.ss(arr[j].remove + 0.12, arr[j].remove + 0.42, t);
  return s;
}
function crateState(side, i, t) {
  const arr = CRATES[side][i];
  return arr.map((c) => {
    if (t < c.arrive || (c.remove != null && t >= c.remove)) return { gone: true };
    const slot = slotOf(arr, c.k, t);
    if (!c.flow) return { a: K.inv(c.arrive, c.arrive + 0.32, t), star: c.star, slot };
    /* flow-in: slide in from the left edge of the stall, a little hop on arrival */
    const u = K.inv(c.arrive, c.arrive + 0.5, t), e = K.E.out3(u);
    return { a: 1, star: c.star, slot, dx: -(slot * 63 + 330) * (1 - e), dy: -26 * Math.sin(u * Math.PI), tilt: -0.25 * (1 - e) * Math.sin(u * 9) };
  });
}

/* the market order cart: races through the alley left to right */
function cartX(t) { return K.lerp(-1320, 1260, K.inv(T.cart[0], T.cart[1], t)); }

function drawBackground(t) {
  /* screen-fixed folk sky, sun slightly parallaxed */
  K.screen(ctx);
  K.sky(ctx, -20, -20, 1940, 1100, { sunX: 1520 - (K.cam.x + 360) * 0.06, sunY: 200 - (K.cam.y) * 0.05, sunR: 78 });
  /* far city */
  K.applyCam(ctx, 0.3);
  K.city(ctx, -2600, 2600, 520, { layer: 0, seed: 4, h: 260 });
  K.applyCam(ctx, 0.5);
  K.city(ctx, -2800, 2800, 700, { layer: 1, seed: 9, h: 190 });
}

function drawGround() {
  K.shape(ctx, K.rectPts(-4200, 860, 8400, 2400, 6), { fill: P.terraLight, w: 6, boil: 1.2, seed: 5, k: 0.1, pattern: { kind: "diamonds", color: P.terra, gap: 90, w: 16, alpha: 0.45 }, specks: 40 });
}

/* tower + everything attached to it, in world space */
function drawTower(t) {
  const gap = gapAt(t);
  /* bunting from the battlements out to the city */
  K.bunting(ctx, [-TW / 2 - 30, askFloor(4, t) - LH - 70], [-2100, askFloor(4, t) + 160], { n: 12, sag: 90, seed: 11, size: 60 });
  K.bunting(ctx, [TW / 2 + 30, askFloor(4, t) - LH - 70], [2100, askFloor(4, t) + 160], { n: 12, sag: 90, seed: 23, size: 60 });
  const ping = (i, side) => { const idx = side === "bid" ? 4 - i : 5 + i, tk = T.ticks + idx * 0.068; return Math.max(0, 1 - Math.abs(t - tk) / 0.2); };
  K.tower(ctx, 0, YB0 - gap / 2, {
    asks: ASKS.map((L) => ({ p: L.p0, p2: L.p1, q: L.n1 })), bids: BIDS.map((L) => ({ p: L.p0, p2: L.p1, q: L.n1 })),
    gap, lh: LH, w: TW, seed: 300, hot: 0.35 + 0.35 * K.inv(T.tight, T.tight + 0.4, t),
    open: (i, side) => K.inv(stallOpenAt(side, i), stallOpenAt(side, i) + 0.4, t),
    priceA: (i, side) => K.inv(stallOpenAt(side, i) + 0.1, stallOpenAt(side, i) + 0.45, t),
    flip: (i, side) => (side === "ask" ? K.inv(T.slam + 0.05 + i * BEAT / 4, T.slam + 0.35 + i * BEAT / 4, t) : 0),
    ping,
    crates: (i, side) => crateState(side, i, t),
  });
  /* lanterns across the alley */
  const top = YB0 - gap;
  K.lanternString(ctx, [-TW / 2 - 20, top + 4], [TW / 2 + 20, top + 4], { n: 6, sag: 10, s: 0.5, glow: 0.4, seed: 31 });
  /* spread tag hanging in the alley */
  const tagA = K.inv(T.stalls + 2.0, T.stalls + 2.35, t);
  if (t < T.tight) {
    const sq = t > T.slam - 0.1 ? 1 - 0.35 * Math.sin(K.inv(T.slam - 0.1, T.tight, t) * Math.PI) : 1;
    ctx.save(); ctx.translate(330, YB0 - gap / 2); ctx.scale(1 / sq, sq);
    K.tag(ctx, 0, 0, "0.05", { a: tagA * (1 - K.inv(T.tight - 0.08, T.tight, t)), size: 34, seed: 3 });
    ctx.restore();
  } else K.tag(ctx, 330, YB0 - gap / 2, "0.01", { a: K.inv(T.tight, T.tight + 0.35, t), size: 34, seed: 4, fill: P.goldGlow });
  /* dust puffs where the halves slam */
  const dd = t - T.slam;
  if (dd > 0 && dd < 0.6) for (let i = 0; i < 8; i++) {
    const sd = i % 2 ? 1 : -1, r = 18 + 70 * dd + 14 * K.hash(i, 3), x = sd * (TW / 2 + 30 + 120 * dd * (1 + K.hash(i, 5))), y = YB0 - gap / 2 + (K.hash(i, 7) - 0.5) * 80;
    ctx.save(); ctx.globalAlpha = 1 - dd / 0.6; K.shape(ctx, K.blobPts(x, y, r, r * 0.8, 9, i, 0.25), { fill: P.paper, w: 4, boil: 1.2, seed: 700 + i, k: 0.9 }); ctx.restore();
  }
}

/* wooden balcony at the alley mouth (Tikki's stand), rides the bid half */
function drawBalcony() {
  const y = YB0, x0 = -1010, x1 = -TW / 2 - 30;
  [x0 + 330, x1 - 10].forEach((bx, i) => K.shape(ctx, [[bx - 110, y + 20], [bx, y + 20], [bx, y + 120]], { fill: P.woodDark, w: 4.5, boil: 0.9, seed: 640 + i, k: 0, gouge: { alpha: 0.3, gap: 10, color: P.ink } }));
  K.shape(ctx, K.rectPts(x0, y - 4, x1 - x0, 30, 4), { fill: P.wood, w: 5, boil: 1, seed: 642, k: 0.1, shade: { color: P.woodDark, dx: 0, dy: -10 } });
  /* a small rug hangs over the front edge */
  K.shape(ctx, [[x0 + 60, y + 22], [x0 + 250, y + 22], [x0 + 240, y + 110], [x0 + 70, y + 112]], { fill: P.teal, w: 4, boil: 1, seed: 643, k: 0.1, pattern: [{ kind: "zigzag", color: P.saffron, gap: 26, w: 5 }] });
  for (let i = 0; i <= 8; i++) { const fx = x0 + 72 + (168 * i) / 8; K.line(ctx, [[fx, y + 111], [fx, y + 130]], { stroke: P.paper, w: 3.5, boil: 0.6, seed: 650 + i }); }
}

/* crates in the air: carried off to the cart, or filled and flying up */
function drawFlying(t) {
  [["ask", 0], ["bid", 0]].forEach(([side, i]) => {
    const arr = CRATES[side][i], floor = side === "ask" ? askFloor(i, t) : bidFloor(i);
    arr.forEach((c) => {
      if (c.remove == null) return;
      const d = t - c.remove; if (d < 0 || d > 0.7) return;
      const sx = K.slotX(towerX0, slotOf(arr, c.k, c.remove), 0.95), sy = floor - 16;
      if (c.kind === "cart") {
        const u = K.inv(0, 0.36, d), tx = cartX(c.remove + 0.36) + (c.k ? 12 : -30), ty = YB0 - 60;
        if (d > 0.36) return;
        const x = K.lerp(sx, tx, u), y = K.lerp(sy, ty, u) - 120 * Math.sin(u * Math.PI);
        K.crate(ctx, x, y, 0.95 * (1 - 0.45 * u), { side, seed: 900 + c.k, tilt: u * 5 });
      } else {
        const u = K.inv(0, 0.7, d), x = sx + 520 * u, y = sy - 300 * K.E.out3(u);
        ctx.save(); ctx.globalAlpha = 1 - K.inv(0.3, 0.55, d);
        K.crate(ctx, x, y, 0.95, { side, seed: 910 + c.k, tilt: u * 3 });
        ctx.restore();
        K.coin(ctx, sx + 40 * u, sy - 80 - 200 * u, 22, { spin: d * 14, seed: 920 + c.k });
        for (let k = 0; k < 4; k++) K.sparkle(ctx, sx + Math.cos(k * 1.6) * 90 * u, sy - 40 + Math.sin(k * 1.6) * 90 * u, 20 * (1 - u), 1 - u, k);
      }
    });
  });
}

function drawCart(t) {
  if (t < T.cart[0] || t > T.cart[1]) return;
  const x = cartX(t), taken = CRATES.ask[0].filter((c) => t > c.remove + 0.36).length;
  /* speed lines behind the cart */
  for (let i = 0; i < 3; i++) K.line(ctx, [[x - 150 - i * 26, YB0 - 40 - i * 20], [x - 330 - i * 40, YB0 - 40 - i * 20]], { stroke: P.paper, w: 5, boil: 1, seed: 960 + i });
  K.cart(ctx, x, YB0 + 2, 0.6, { roll: x / 18, seed: 81 });
  for (let k = 0; k < taken; k++) K.crate(ctx, x - 30 + k * 42, YB0 - 58 - k * 8, 0.7, { side: "ask", seed: 970 + k, tilt: 0.1 * (k ? 1 : -1) });
}

/* queue position tag over our crate ("#4" -> "#1") */
function drawQueueTag(t) {
  if (t < T.queueCam - 0.3 || t > T.drop[1]) return;
  const arr = CRATES.bid[0], c = arr[STAR.k], left = arr.filter((q) => q.remove != null && t >= q.remove + 0.3).length;
  const x = K.slotX(towerX0, slotOf(arr, c.k, t), 0.95), y = bidFloor(0) - 16 - 104;
  const bump = arr.reduce((m, q) => (q.remove != null ? Math.max(m, Math.exp(-8 * Math.max(0, t - q.remove - 0.3)) * (t > q.remove + 0.3 ? 1 : 0)) : m), 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(1 + 0.18 * bump, 1 + 0.18 * bump);
  K.tag(ctx, 0, 0, "#" + (STAR.k + 1 - left), { a: K.inv(T.queueCam - 0.3, T.queueCam, t), size: 30, seed: 6, fill: left >= 3 ? P.goldGlow : P.paper, string: 30 });
  ctx.restore();
}

/* flow arrow across the street ("from left to right") */
function drawFlowArrow(t) {
  const a = K.inv(T.arrow, T.arrow + 0.5, t) * (1 - K.inv(T.cart[0] - 0.2, T.cart[0] + 0.2, t));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, a * 2);
  K.arrow(ctx, [-1150, 930], [1150, 930], { p: a, w: 64, bend: -30, color: P.teal, seed: 980 });
  ctx.restore();
}

/* jagged speech bursts: "!" on "Hey!", the imbalance shout at the cart */
function drawShouts(t) {
  const hx = -1040, hy = -330;
  const h1 = K.inv(T.hey - 0.02, T.hey + 0.3, t) * (1 - K.inv(T.clap - 0.1, T.clap + 0.1, t));
  if (h1 > 0) K.shout(ctx, hx, hy, 230, 190, { a: h1, text: "!", size: 120, tail: [0.9, 0.8], seed: 990, color: P.paper });
  const h2 = K.inv(T.shout, T.shout + 0.28, t) * (1 - K.inv(T.ticks + 0.4, T.ticks + 0.6, t));
  if (h2 > 0) K.shout(ctx, hx - 20, hy - 40, 380, 210, { a: h2, text: IMB, arrow: 1, size: 66, tail: [0.9, 0.8], seed: 995 });
}
