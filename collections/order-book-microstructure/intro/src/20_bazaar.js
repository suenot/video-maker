/* ============================================================
   INTRO 20 BAZAAR SET: sky, city, depth hills, the stall tower (the order
   book), the balcony at the alley, crates flowing in, the two market-order
   carts, levels dropping from the sky, tags, explainer boards of the break.
   World units; the camera lives in 70_render.js.
   ============================================================ */
const pulseB = (t) => K.pulse(t, 1, 6);          /* every beat */
const pulseA = (t) => K.pulse(t, 4, 5);          /* every bar */
const win = (t, a, b, fi, fo) => K.inv(a, a + (fi || 0.35), t) * (1 - K.inv(b - (fo || 0.3), b, t)); /* appear inside [a, b] */

/* alley height: wide, then slammed narrow on "spread" with a small rebound */
function gapAt(t) {
  const u = K.E.in3(K.inv(T.slam - 0.24, T.slam, t));
  const reb = t > T.slam ? 16 * Math.exp(-7 * (t - T.slam)) * Math.sin((t - T.slam) * 26) : 0;
  return K.lerp(GAP0, GAP1, u) + reb;
}
const towerX0 = -TW / 2;
const bidFloor = (i) => YB0 + (i + 1) * LH;
const askFloor = (i, t) => YB0 - gapAt(t) - i * LH;
const stallOpenAt = (side, i) => T.stalls + (side === "ask" ? 4 - i : 5 + i) * BEAT / 2;
const askCount = (t) => 5 + ASKS.filter((L) => L.sky != null && t >= levelLand(ASKS.indexOf(L))).length;
/* dusk: chorus 2 and the break are at night, the final chorus at dawn */
const duskAt = (t) => K.ss(T.dusk[0], T.dusk[1], t) * (1 - K.ss(T.dawn[0], T.dawn[1], t));

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
/* resting size per level right now (for the depth hills: they follow the crates) */
function levelSize(side, i, t) {
  return CRATES[side][i].reduce((s, c) => s + (t >= c.arrive && !(c.remove != null && t >= c.remove) ? K.clamp((t - c.arrive) / 0.4, 0, 1) : 0), 0);
}
const cum = (arr) => arr.reduce((o, v) => (o.push((o.length ? o[o.length - 1] : 0) + v), o), []);

/* the market-order carts */
const cartX = (t) => K.lerp(-1320, 1260, K.inv(T.cart[0], T.cart[1], t));            /* buy: left to right */
const cart2X = (t) => K.lerp(1380, -1500, K.E.inOut(K.inv(T.cart2[0], T.cart2[1], t)) * 0.3 + K.inv(T.cart2[0], T.cart2[1], t) * 0.7); /* sell: right to left */

/* night palette for the background (sky, city, ground); the lantern-lit tower keeps its day colours */
const NIGHT = { skyTop: "#262b5a", skyMid: "#4f437c", skyLow: "#c8664e", sun: "#f3e3c3", saffronDark: "#3a3466", cityFar: "#5e4a6c", cityMid: "#1b4650", saffronLight: "#8c6a8a", saffron: "#b98a5a", terraLight: "#9a5a48", terraDark: "#5a2a2a", tealDark: "#0f3a3a" };
const mixHex = (a, b, u) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), ch = (s) => Math.round(((pa >> s) & 255) * (1 - u) + ((pb >> s) & 255) * u); return "#" + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1); };
function withNight(t, fn) {
  const d = duskAt(t); if (d <= 0) return fn();
  const saved = {}; Object.keys(NIGHT).forEach((k) => { saved[k] = P[k]; P[k] = mixHex(P[k], NIGHT[k], d); });
  try { fn(); } finally { Object.assign(P, saved); }
}
function drawBackground(t) { withNight(t, () => drawBackgroundDay(t)); }
function drawBackgroundDay(t) {
  K.screen(ctx);
  K.sky(ctx, -20, -20, 1940, 1100, { sunX: 1220 - (K.cam.x + 360) * 0.06, sunY: 250 - (K.cam.y) * 0.05 + 260 * duskAt(t), sunR: 78 });
  K.applyCam(ctx, 0.3);
  K.city(ctx, -2600, 2600, 520, { layer: 0, seed: 4, h: 260 });
  K.applyCam(ctx, 0.5);
  K.city(ctx, -2800, 2800, 700, { layer: 1, seed: 9, h: 190 });
  /* stars at night */
  const d = duskAt(t);
  if (d > 0) { K.screen(ctx); for (let i = 0; i < 40; i++) K.sparkle(ctx, 1920 * K.hash(i, 71), 420 * K.hash(i, 73), 7 + 6 * K.hash(i, 75) + 3 * Math.sin(t * 3 + i), d * (0.6 + 0.4 * K.hash(i, 77)), i); }
}

function drawGround(t) { withNight(t, () => drawGroundDay()); }
function drawGroundDay() {
  K.shape(ctx, K.rectPts(-4200, 860, 8400, 2400, 6), { fill: P.terraLight, w: 6, boil: 1.2, seed: 5, k: 0.1, pattern: { kind: "diamonds", color: P.terra, gap: 90, w: 16, alpha: 0.45 }, specks: 40 });
}

/* "Bids on the left and the asks up high": the book's depth as terraced hills behind the tower */
function drawHills(t) {
  if (t < T.hills[0]) return;
  const nA = askCount(t), bids = cum(BIDS.map((L, i) => levelSize("bid", i, t))), asks = cum(ASKS.slice(0, nA).map((L, i) => levelSize("ask", i, t)));
  const pulse = 1 + 0.04 * (K.pulse(t, 4, 5) * (t > T.flow2 ? 1 : 0));
  K.depthHills(ctx, 0, 862, 4300, 900 * pulse, bids, asks, { a: 1, growBid: K.E.out3(K.inv(T.hills[0], T.hills[0] + 0.9, t)), growAsk: K.E.out3(K.inv(T.hills[1], T.hills[1] + 0.9, t)), max: 46, mid: TW / 2 + 70, seed: 13 });
}

/* tower + everything attached to it, in world space */
function drawTower(t) {
  const gap = gapAt(t), nA = askCount(t), topY = askFloor(nA - 1, t) - LH;
  /* bunting from the battlements out to the city */
  K.bunting(ctx, [-TW / 2 - 30, topY - 70], [-2100, topY + 310], { n: 12, sag: 90, seed: 11, size: 60 });
  K.bunting(ctx, [TW / 2 + 30, topY - 70], [2100, topY + 310], { n: 12, sag: 90, seed: 23, size: 60 });
  const pingAt = (tk0) => (i, side) => { const idx = side === "bid" ? 4 - i : 5 + i, tk = tk0 + idx * 0.068; return Math.max(0, 1 - Math.abs(t - tk) / 0.2); };
  const pings = [pingAt(T.ticks), pingAt(T.fireworks), pingAt(T.fireworks + 2 * BEAT), pingAt(T.ticks3)];
  K.tower(ctx, 0, YB0 - gap / 2, {
    asks: ASKS.slice(0, nA).map((L) => ({ p: L.p0, p2: L.p1, q: L.n2 })), bids: BIDS.map((L) => ({ p: L.p0, p2: L.p1, q: L.n2 })),
    gap, lh: LH, w: TW, seed: 300, hot: 0.35 + 0.35 * K.inv(T.tight, T.tight + 0.4, t) + 0.3 * duskAt(t),
    open: (i, side) => (side === "ask" && i > 4 ? 1 : K.inv(stallOpenAt(side, i), stallOpenAt(side, i) + 0.4, t)),
    priceA: (i, side) => (side === "ask" && i > 4 ? 1 : K.inv(stallOpenAt(side, i) + 0.1, stallOpenAt(side, i) + 0.45, t)),
    flip: (i, side) => (side === "ask" && i < 5 ? K.inv(T.slam + 0.05 + i * BEAT / 4, T.slam + 0.35 + i * BEAT / 4, t) : 0),
    ping: (i, side) => Math.max(...pings.map((f) => f(i, side))),
    crates: (i, side) => crateState(side, i, t),
  });
  /* the flag on top: "reaching to the sky" */
  const fl = K.inv(T.sky[2], T.sky[2] + 0.45, t);
  if (fl > 0) {
    const h = 260 * K.E.back(fl, 1.8), fx = 0, fy = topY - 100, wv = Math.sin(t * 6) * 10;
    K.line(ctx, [[fx, fy], [fx, fy - h]], { stroke: P.ink, w: 9, boil: 0.8, seed: 520 });
    if (fl > 0.5) K.shape(ctx, [[fx, fy - h], [fx + 190, fy - h + 20 + wv], [fx + 170, fy - h + 70 + wv], [fx, fy - h + 100]], { fill: P.teal, w: 5, boil: 1, seed: 521, k: 0.4, pattern: { kind: "zigzag", color: P.saffron, gap: 24, w: 5 } });
    K.dot(ctx, fx, fy - h, 12, P.brass, P.ink, 3, 522);
  }
  /* lanterns across the alley: sag at night, pulled tight on "tight" (with a twang) */
  const top = YB0 - gap, d = duskAt(t);
  const pull = K.ss(T.rope - 0.2, T.rope + 0.05, t), tw = t > T.rope ? 14 * Math.exp(-5 * (t - T.rope)) * Math.sin((t - T.rope) * 30) : 0;
  const sag = 10 + 34 * d * (1 - pull) + tw;
  K.lanternString(ctx, [-TW / 2 - 20, top + 4], [TW / 2 + 20, top + 4], { n: 6, sag, s: 0.5, glow: 0.4 + 0.5 * d, seed: 31 });
  /* spread tag hanging in the alley */
  const tagA = K.inv(T.stalls + 2.0, T.stalls + 2.35, t);
  if (t < T.tight) {
    const sq = t > T.slam - 0.1 ? 1 - 0.35 * Math.sin(K.inv(T.slam - 0.1, T.tight, t) * Math.PI) : 1;
    ctx.save(); ctx.translate(330, YB0 - gap / 2); ctx.scale(1 / sq, sq);
    K.tag(ctx, 0, 0, "0.05", { a: tagA * (1 - K.inv(T.tight - 0.08, T.tight, t)), size: 34, seed: 3 });
    ctx.restore();
  } else {
    const bump = [T.rope, T.hey3 + 2 * BEAT].reduce((m, tb) => Math.max(m, t > tb ? Math.exp(-6 * (t - tb)) : 0), 0);
    ctx.save(); ctx.translate(330, YB0 - gap / 2); ctx.scale(1 + 0.3 * bump, 1 + 0.3 * bump);
    K.tag(ctx, 0, 0, "0.01", { a: K.inv(T.tight, T.tight + 0.35, t), size: 34, seed: 4, fill: P.goldGlow });
    ctx.restore();
  }
  /* dust puffs: the slam, and each sky level landing */
  const puff = (t0, y, spread) => {
    const dd = t - t0; if (dd < 0 || dd > 0.6) return;
    for (let i = 0; i < 8; i++) {
      const sd = i % 2 ? 1 : -1, r = 18 + 70 * dd + 14 * K.hash(i, 3), x = sd * (TW / 2 + 30 + spread * dd * (1 + K.hash(i, 5))), yy = y + (K.hash(i, 7) - 0.5) * 80;
      ctx.save(); ctx.globalAlpha = 1 - dd / 0.6; K.shape(ctx, K.blobPts(x, yy, r, r * 0.8, 9, i, 0.25), { fill: P.paper, w: 4, boil: 1.2, seed: 700 + i, k: 0.9 }); ctx.restore();
    }
  };
  puff(T.slam, YB0 - gap / 2, 120);
  ASKS.forEach((L, i) => { if (L.sky != null) puff(levelLand(i), askFloor(i, t), 160); });
}

/* a level falling from the sky onto the tower ("stacked like a tower") */
function drawFallingLevels(t) {
  ASKS.forEach((L, i) => {
    if (L.sky == null) return;
    const tl = levelLand(i), u = K.inv(tl - 0.55, tl, t);
    if (u <= 0 || u >= 1) return;
    const dy = -(1 - K.E.in3(u)) * 1500, fy = askFloor(i, t) + dy;
    K.shape(ctx, K.rectPts(-TW / 2 - 40, fy - LH, TW + 80, LH, 4), { fill: P.plaster, w: 6, boil: 1.2, seed: 530 + i, k: 0.2 });
    K.stall(ctx, towerX0, fy, TW, LH - 6, { side: "ask", price: L.p1, crates: crateState("ask", i, t), seed: 300 + 10 + i * 13 });
    for (let k = 0; k < 3; k++) K.line(ctx, [[-300 + k * 300, fy - LH - 40], [-300 + k * 300, fy - LH - 200]], { stroke: P.paper, w: 6, boil: 1, seed: 540 + k + i * 3 });
  });
}

/* wooden balcony at the alley mouth (Tikki's stand), rides the bid half */
function drawBalcony() {
  const y = YB0, x0 = -1010, x1 = -TW / 2 - 30;
  [x0 + 330, x1 - 10].forEach((bx, i) => K.shape(ctx, [[bx - 110, y + 20], [bx, y + 20], [bx, y + 120]], { fill: P.woodDark, w: 4.5, boil: 0.9, seed: 640 + i, k: 0, gouge: { alpha: 0.3, gap: 10, color: P.ink } }));
  K.shape(ctx, K.rectPts(x0, y - 4, x1 - x0, 30, 4), { fill: P.wood, w: 5, boil: 1, seed: 642, k: 0.1, shade: { color: P.woodDark, dx: 0, dy: -10 } });
  K.shape(ctx, [[x0 + 60, y + 22], [x0 + 250, y + 22], [x0 + 240, y + 110], [x0 + 70, y + 112]], { fill: P.teal, w: 4, boil: 1, seed: 643, k: 0.1, pattern: [{ kind: "zigzag", color: P.saffron, gap: 26, w: 5 }] });
  for (let i = 0; i <= 8; i++) { const fx = x0 + 72 + (168 * i) / 8; K.line(ctx, [[fx, y + 111], [fx, y + 130]], { stroke: P.paper, w: 3.5, boil: 0.6, seed: 650 + i }); }
}

/* crates in the air: carried off by a cart, or filled and flying up */
function drawFlying(t) {
  [["ask", 0], ["bid", 0]].forEach(([side, i]) => {
    const arr = CRATES[side][i], floor = side === "ask" ? askFloor(i, t) : bidFloor(i);
    arr.forEach((c) => {
      if (c.remove == null) return;
      const d = t - c.remove; if (d < 0 || d > 0.7) return;
      const sx = K.slotX(towerX0, slotOf(arr, c.k, c.remove), 0.95), sy = floor - 16;
      if (c.kind === "cart" || c.kind === "cart2") {
        if (d > 0.36) return;
        const cx = c.kind === "cart" ? cartX(c.remove + 0.36) : cart2X(c.remove + 0.36);
        const u = K.inv(0, 0.36, d), tx = cx + (c.k % 2 ? 12 : -30), ty = YB0 - 60;
        const x = K.lerp(sx, tx, u), y = K.lerp(sy, ty, u) - 120 * Math.sin(u * Math.PI);
        K.crate(ctx, x, y, 0.95 * (1 - 0.45 * u), { side, star: c.star, seed: 900 + c.k, tilt: u * 5 });
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

function drawCarts(t) {
  const one = (x, side, dir, taken, starIn) => {
    for (let i = 0; i < 3; i++) K.line(ctx, [[x - dir * (150 + i * 26), YB0 - 40 - i * 20], [x - dir * (330 + i * 40), YB0 - 40 - i * 20]], { stroke: P.paper, w: 5, boil: 1, seed: 960 + i });
    K.cart(ctx, x, YB0 + 2, 0.6, { roll: x / 18, seed: side === "buy" ? 81 : 85, side, dir, color: side === "buy" ? P.saffron : P.tealLight });
    for (let k = 0; k < taken; k++) K.crate(ctx, x - 30 + k * 42, YB0 - 58 - k * 8, 0.7, { side: side === "buy" ? "ask" : "bid", star: starIn && k === 0, seed: 970 + k, tilt: 0.1 * (k ? 1 : -1) });
  };
  if (t > T.cart[0] && t < T.cart[1]) one(cartX(t), "buy", 1, CRATES.ask[0].filter((c) => c.kind === "cart" && t > c.remove + 0.36).length, false);
  if (t > T.cart2[0] && t < T.cart2[1]) one(cart2X(t), "sell", -1, CRATES.bid[0].filter((c) => c.kind === "cart2" && t > c.remove + 0.36).length, true);
}

/* tags over crates: queue position of ours (#4 -> #1), then price-time arrival numbers */
function drawQueueTags(t) {
  if (t > T.queueCam - 0.3 && t < Math.min(T.tease[1], T.fireworks + 0.3)) {
    const arr = CRATES.bid[0], c = arr[STAR.k], left = arr.filter((q) => q.kind === "fill" && t >= q.remove + 0.3).length;
    const x = K.slotX(towerX0, slotOf(arr, c.k, t), 0.95), y = bidFloor(0) - 16 - 104;
    const bump = T.fills.reduce((m, tf) => Math.max(m, t > tf + 0.3 ? Math.exp(-8 * (t - tf - 0.3)) : 0), 0);
    ctx.save(); ctx.translate(x, y); ctx.scale(1 + 0.18 * bump, 1 + 0.18 * bump);
    K.tag(ctx, 0, 0, "#" + (STAR.k + 1 - left), { a: K.inv(T.queueCam - 0.3, T.queueCam, t) * (1 - K.inv(Math.min(T.tease[1], T.fireworks + 0.3) - 0.25, Math.min(T.tease[1], T.fireworks + 0.3), t)), size: 30, seed: 6, fill: left >= 3 ? P.goldGlow : P.paper, string: 30 });
    ctx.restore();
  }
  if (t > T.prio - 0.1 && t < T.cart2[0]) {
    const arr = CRATES[PRIO.side][PRIO.level], y = askFloor(PRIO.level, t) - 16 - 100;
    arr.forEach((c, k) => {
      const t0 = k < ASKS[PRIO.level].n1 ? T.prio + k * BEAT / 2 : T.newbie + 0.5;
      const a = K.inv(t0, t0 + 0.3, t) * (1 - K.inv(T.cart2[0] - 0.3, T.cart2[0], t));
      if (a <= 0 || t < c.arrive) return;
      K.tag(ctx, K.slotX(towerX0, slotOf(arr, k, t), 0.95), y, String(k + 1), { a, size: 22, seed: 40 + k, fill: k === arr.length - 1 && t > T.newbie ? P.goldGlow : P.paper, string: 26 });
    });
  }
}

/* flow arrow across the street ("from left to right"): chorus 1 and the final chorus */
function drawFlowArrow(t) {
  const a = Math.max(K.inv(T.arrow, T.arrow + 0.5, t) * (1 - K.inv(T.cart[0] - 0.2, T.cart[0] + 0.2, t)),
    K.inv(T.flow3 + 2 * BEAT, T.flow3 + 2 * BEAT + 0.5, t) * (1 - K.inv(T.ticks3 - 0.2, T.ticks3 + 0.1, t)),
    K.inv(T.flow2 + 2 * BEAT, T.flow2 + 2 * BEAT + 0.5, t) * (1 - K.inv(T.tickChart[0] - 0.2, T.tickChart[0] + 0.1, t)));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, a * 2);
  K.arrow(ctx, [-1150, 930], [1150, 930], { p: a, w: 64, bend: -30, color: P.teal, seed: 980 });
  ctx.restore();
}

/* jagged speech bursts near Tikki's head */
function drawShouts(t) {
  const hx = -1040, hy = -330;
  [[T.hey, T.clap], [T.hey2, T.hey2 + 3 * BEAT], [T.hey3, T.hey3 + 3 * BEAT]].forEach(([a, b], i) => {
    const h = K.inv(a - 0.02, a + 0.3, t) * (1 - K.inv(b - 0.2, b, t));
    if (h > 0) K.shout(ctx, hx, hy, 230, 190, { a: h, text: "!", size: 120, tail: [0.9, 0.8], seed: 990 + i, color: P.paper });
  });
  const h2 = K.inv(T.shout, T.shout + 0.28, t) * (1 - K.inv(T.ticks + 0.4, T.ticks + 0.6, t));
  if (h2 > 0) K.shout(ctx, hx - 20, hy - 40, 380, 210, { a: h2, text: IMB, arrow: 1, size: 66, tail: [0.9, 0.8], seed: 995 });
}

/* coin fountain from the alley ("Order Book and Market Microstructure!" in chorus 2) */
function drawFireworks(t) {
  const d = t - T.fireworks; if (d < 0 || d > 3.2) return;
  for (let i = 0; i < 36; i++) {
    const t0 = (i % 18) * BEAT / 6 + (i < 18 ? 0 : 1.6), u = (d - t0) / 1.3; if (u < 0 || u > 1) continue;
    const ang = -Math.PI / 2 + (K.hash(i, 3) - 0.5) * 2.2, v = 1400 + 500 * K.hash(i, 5);
    const x = 330 * (K.hash(i, 9) - 0.5) + Math.cos(ang) * v * u, y = YB0 - 40 + Math.sin(ang) * v * u + 1500 * u * u;
    K.coin(ctx, x, y, 52, { spin: t * 10 + i, seed: 930 + i });
    if (u < 0.3) K.sparkle(ctx, x, y, 70 * (1 - u / 0.3), 1 - u / 0.3, i);
  }
}

/* the coin from our filled order flies to Tikki's paw */
function drawOurCoin(t) {
  const d = t - T.take2[0]; if (d < 0 || t > T.cart2[1] + 1.2) return;
  const sx = K.slotX(towerX0, 0, 0.95), sy = bidFloor(0) - 60, u = K.inv(0, T.coin - T.take2[0] + 0.1, d);
  const paw = tikkiPaw(t);
  const x = u < 1 ? K.lerp(sx, paw[0], u) : paw[0], y = u < 1 ? K.lerp(sy, paw[1], u) - 260 * Math.sin(u * Math.PI) : paw[1] - 30;
  K.coin(ctx, x, y, 34, { spin: u < 1 ? d * 16 : 0, seed: 950 });
  if (u >= 1) for (let k = 0; k < 4; k++) { const ph = (t * 1.6 + k / 4) % 1; K.sparkle(ctx, x + Math.cos(k * 1.7) * 60 * ph, y + Math.sin(k * 1.7) * 60 * ph, 22 * Math.sin(ph * Math.PI), 1, k); }
}

/* explainer boards: the tick chart (chorus 2) and the three boards of the break */
const TICKS = [101.25, 101.26, 101.26, 101.25, 101.26, 101.27, 101.26, 101.27, 101.28, 101.27, 101.27, 101.28, 101.29, 101.28, 101.29, 101.30];
const CANDLES = [{ o: 101.25, h: 101.27, l: 101.24, c: 101.27 }, { o: 101.27, h: 101.28, l: 101.25, c: 101.26 }, { o: 101.26, h: 101.29, l: 101.26, c: 101.29 }, { o: 101.29, h: 101.30, l: 101.27, c: 101.28 },
  { o: 101.28, h: 101.31, l: 101.28, c: 101.31 }, { o: 101.31, h: 101.32, l: 101.29, c: 101.30 }, { o: 101.30, h: 101.33, l: 101.30, c: 101.33 }, { o: 101.33, h: 101.34, l: 101.31, c: 101.32 }];
const CODE = ["import ccxt.pro as ccxtpro", "ex = ccxtpro.binance()", "while True:", "    ob = await ex.watch_order_book('BTC/USDT')", "    bid, ask = ob['bids'][0], ob['asks'][0]", "    spread = ask[0] - bid[0]"];
function drawBoards(t) {
  const hang = (t0, t1) => { const a = win(t, t0, t1, 0.4, 0.3); return { a, dy: -700 * (1 - K.E.out3(K.inv(t0, t0 + 0.45, t))) }; };
  let h = hang(T.tickChart[0], T.tickChart[1] + 2 * BEAT);
  if (h.a > 0) K.scrollChart(ctx, 640, -380 + h.dy, 760, 470, [{ data: TICKS, color: P.teal }], { a: Math.min(1, h.a * 3), draw: K.inv(T.tickChart[0] + 0.3, T.tickChart[0] + 0.3 + 12 * BEAT / 2, t), seed: 41, yMin: 101.24, yMax: 101.31 });
  h = hang(T.ofi[0], T.ofi[1]);
  if (h.a > 0) K.tileBoard(ctx, -160, -400 + h.dy, 760, 230, ["OFI = Δbid − Δask", { t: "(5 − 2) / (5 + 2) = " + IMB, c: P.terraDark }], { a: Math.min(1, h.a * 3), size: 46, write: K.inv(T.ofi[0] + 0.35, T.ofi[0] + 0.35 + 5.5 * BEAT, t), seed: 31 });
  h = hang(T.candles[0], T.candles[1]);
  if (h.a > 0) K.scrollChart(ctx, -120, -360 + h.dy, 760, 480, [{ kind: "candle", data: CANDLES }], { a: Math.min(1, h.a * 3), draw: K.inv(T.candles[0] + 0.3, T.candles[0] + 0.3 + 8 * BEAT * 0.9, t), seed: 45, yMin: 101.23, yMax: 101.35 });
  h = hang(T.code[0], T.code[1]);
  if (h.a > 0) K.codeScroll(ctx, -60, -330 + h.dy, 1000, CODE, { a: Math.min(1, h.a * 3), size: 30, typed: K.inv(T.code[0] + 0.35, T.code[0] + 0.35 + 6.5 * BEAT, t), seed: 61 });
}
