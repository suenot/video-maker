/* ============================================================
   KIT 30 WORLD: the bazaar of the order book.
   The book is a tower of market stalls seen flat-on, like a folk print:
     asks  = stalls with red awnings stacked ABOVE the alley (best ask lowest)
     bids  = stalls with green awnings stacked BELOW the alley (best bid highest)
     alley = the spread, a narrow lane with a lantern string across it
     crates = resting limit orders queued on each stall counter (left = first in line)
   Parts: sky, sun rosette, city skyline, bunting, lanterns, crate, stall,
   tower (whole book from data), coin, sparkle, cart (a market order), rug.
   All draw functions take (ctx, ...) in the current transform and read
   K.now (continuous time) and K.bf (12 fps boil frame).
   ============================================================ */
var BK = window.BK || (window.BK = {});
(function (K) {
  const P = K.P, { hash, hs, clamp, lerp } = K;

  /* ---------------- SKY + CITY ---------------- */
  /* flat banded folk sky (no smooth gradient): bands with carved wavy borders */
  K.sky = function (ctx, x0, y0, x1, y1, opt) {
    const o = Object.assign({ sunX: 1500, sunY: 230, sunR: 95, seed: 3 }, opt || {});
    const bands = [P.skyTop, P.skyMid, P.skyLow], h = (y1 - y0) / bands.length;
    ctx.fillStyle = bands[0]; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    bands.forEach((c, i) => {
      if (!i) return;
      const yy = y0 + i * h, pts = [];
      for (let x = x0, j = 0; x <= x1 + 80; x += 80, j++) pts.push([x, yy + Math.sin(j * 1.3 + i) * 10 + hs(j, o.seed + i) * 4]);
      pts.push([x1 + 80, y1 + 10], [x0, y1 + 10]);
      K.shape(ctx, pts, { fill: c, stroke: null, w: 0, boil: 1.2, seed: o.seed + i * 10, reg: false });
      /* carved border line between bands */
      K.line(ctx, pts.slice(0, -2), { stroke: P.saffronDark, w: 3, boil: 1.2, seed: o.seed + i * 10, alpha: 0.5 });
    });
    K.sunRosette(ctx, o.sunX, o.sunY, o.sunR, o.seed);
  };
  /* the sun as a carved rosette: two rings of petals + face-less disc, turns slowly */
  K.sunRosette = function (ctx, x, y, r, seed) {
    K.glow(ctx, x, y, r * 2.6, "rgba(255,236,170,0.8)", 0.5);
    ctx.save(); ctx.translate(x, y); ctx.rotate(K.now * 0.15);
    for (let ring = 0; ring < 2; ring++) {
      const n = 12, rr = r * (ring ? 1.25 : 1.55);
      for (let i = 0; i < n; i++) {
        const a = ((i + ring * 0.5) / n) * K.TAU, ca = Math.cos(a), sa = Math.sin(a), wv = r * 0.22;
        const pts = [[ca * r * 0.8 - sa * wv, sa * r * 0.8 + ca * wv], [ca * rr, sa * rr], [ca * r * 0.8 + sa * wv, sa * r * 0.8 - ca * wv]];
        K.shape(ctx, pts, { fill: ring ? P.saffron : P.terra, w: 3.5, boil: 1, seed: seed + ring * 20 + i, k: 0.2 });
      }
    }
    ctx.restore();
    K.shape(ctx, K.ellipsePts(x, y, r, r, 18), { fill: P.sun, w: 5, boil: 1.3, seed: seed + 60, k: 1, pattern: { kind: "dots", color: P.saffron, gap: r * 0.42, w: r * 0.13 } });
  };
  /* skyline of domes, arches and towers along a base line. layer 0 far, 1 mid */
  K.city = function (ctx, x0, x1, baseY, opt) {
    const o = Object.assign({ layer: 0, seed: 7, h: 220 }, opt || {});
    const col = o.layer ? P.cityMid : P.cityFar, dark = o.layer ? P.tealDark : P.terra;
    let x = x0, i = 0;
    while (x < x1) {
      const kind = Math.floor(hash(i, o.seed) * 4), w = 120 + 150 * hash(i + 3, o.seed), h = o.h * (0.45 + 0.6 * hash(i + 5, o.seed));
      if (kind === 0) { /* dome house */
        K.shape(ctx, K.rectPts(x, baseY - h, w, h + 40, 2), { fill: col, w: 4, boil: 1, seed: o.seed + i, stroke: P.ink, gouge: { side: 1, alpha: 0.25, color: dark, gap: 16 } });
        const dome = [[x + w * 0.1, baseY - h + 2]];
        for (let k = 1; k < 10; k++) { const a = Math.PI + (k / 10) * Math.PI; dome.push([x + w / 2 + Math.cos(a) * w * 0.4, baseY - h + Math.sin(a) * w * 0.4 * (1 + 0.25 * Math.sin((k / 10) * Math.PI))]); }
        dome.push([x + w * 0.9, baseY - h + 2]);
        K.shape(ctx, dome, { fill: o.layer ? P.saffron : P.saffronLight, w: 4, boil: 1, seed: o.seed + i + 40, k: 0.9 });
        K.line(ctx, [[x + w / 2, baseY - h - w * 0.5], [x + w / 2, baseY - h - w * 0.62]], { stroke: P.ink, w: 4, boil: 0.6, seed: o.seed + i + 41 });
        K.dot(ctx, x + w / 2, baseY - h - w * 0.64, 6, P.saffron, P.ink, 2.5, o.seed + i + 42);
      } else if (kind === 1) { /* slim tower */
        const tw = w * 0.4;
        K.shape(ctx, K.rectPts(x + w * 0.3, baseY - h * 1.5, tw, h * 1.5 + 40, 3), { fill: col, w: 4, boil: 1, seed: o.seed + i, gouge: { side: 1, alpha: 0.25, color: dark, gap: 14 } });
        K.shape(ctx, [[x + w * 0.25, baseY - h * 1.5], [x + w * 0.5, baseY - h * 1.5 - 70], [x + w * 0.75, baseY - h * 1.5]], { fill: P.terra, w: 4, boil: 1, seed: o.seed + i + 40, k: 0.3 });
      } else { /* flat-roof house with an arched window row */
        K.shape(ctx, K.rectPts(x, baseY - h, w, h + 40, 2), { fill: col, w: 4, boil: 1, seed: o.seed + i, pattern: { kind: "zigzag", color: dark, gap: 26, w: 3, alpha: 0.35 } });
      }
      /* arched windows */
      const nwin = Math.max(1, Math.floor(w / 60));
      for (let k = 0; k < nwin; k++) {
        const wx = x + (w * (k + 0.5)) / nwin, wy = baseY - h * 0.35;
        if (kind === 1) continue;
        K.shape(ctx, K.archPts(wx, wy, 22, 40, 5), { fill: o.layer ? P.tealDark : P.terraDark, w: 3, boil: 0.8, seed: o.seed + i * 7 + k, nicks: 0, reg: false });
      }
      x += w + 10; i++;
    }
  };

  /* ---------------- STRINGS: bunting + lanterns ---------------- */
  const sagPts = (A, B, sag, n) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n; o.push([lerp(A[0], B[0], u), lerp(A[1], B[1], u) + Math.sin(u * Math.PI) * sag]); } return o; };
  K.bunting = function (ctx, A, B, opt) {
    const o = Object.assign({ n: 10, sag: 60, seed: 11, colors: [P.terra, P.saffron, P.teal, P.paper], size: 46 }, opt || {});
    const rope = sagPts(A, B, o.sag, 24);
    K.line(ctx, rope, { stroke: P.ink, w: 3.5, boil: 1, seed: o.seed });
    for (let i = 0; i < o.n; i++) {
      const u = (i + 0.5) / o.n, x = lerp(A[0], B[0], u), y = lerp(A[1], B[1], u) + Math.sin(u * Math.PI) * o.sag;
      const sw = Math.sin(K.now * 3 + i * 0.9) * 0.12, s = o.size;
      ctx.save(); ctx.translate(x, y); ctx.rotate(sw);
      K.shape(ctx, [[-s * 0.45, 0], [s * 0.45, 0], [0, s]], { fill: o.colors[i % o.colors.length], w: 3, boil: 0.9, seed: o.seed + i, k: 0.1, nicks: 0 });
      ctx.restore();
    }
  };
  K.lantern = function (ctx, x, y, s, opt) {
    const o = Object.assign({ color: P.saffron, glow: 0.6, seed: 21 }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(K.now * 2.2 + o.seed) * 0.08); ctx.scale(s, s);
    if (o.glow > 0) K.glow(ctx, 0, 34, 90, "rgba(255,210,120,0.9)", o.glow);
    K.line(ctx, [[0, 0], [0, 12]], { stroke: P.ink, w: 3, boil: 0.6, seed: o.seed });
    K.shape(ctx, [[-12, 12], [12, 12], [8, 20], [-8, 20]], { fill: P.brass, w: 3, boil: 0.6, seed: o.seed + 1, k: 0.1 });
    K.shape(ctx, [[-8, 20], [8, 20], [22, 36], [14, 56], [-14, 56], [-22, 36]], { fill: o.color, w: 3.5, boil: 0.9, seed: o.seed + 2, k: 0.6, pattern: { kind: "stripes", color: P.terraDark, gap: 7, alpha: 0.35 } });
    K.shape(ctx, [[-14, 56], [14, 56], [6, 64], [-6, 64]], { fill: P.brass, w: 3, boil: 0.6, seed: o.seed + 3, k: 0.1 });
    K.line(ctx, [[0, 64], [0, 76]], { stroke: P.ink, w: 3, boil: 0.6, seed: o.seed + 4 });
    ctx.restore();
  };
  K.lanternString = function (ctx, A, B, opt) {
    const o = Object.assign({ n: 5, sag: 40, seed: 31, s: 1, glow: 0.5, colors: [P.saffron, P.terra, P.teal] }, opt || {});
    K.line(ctx, sagPts(A, B, o.sag, 20), { stroke: P.ink, w: 3.5, boil: 1, seed: o.seed });
    for (let i = 0; i < o.n; i++) {
      const u = (i + 0.5) / o.n;
      K.lantern(ctx, lerp(A[0], B[0], u), lerp(A[1], B[1], u) + Math.sin(u * Math.PI) * o.sag, o.s, { color: o.colors[i % o.colors.length], glow: o.glow, seed: o.seed + i * 5 });
    }
  };

  /* ---------------- ORDERS: crates ---------------- */
  /* crate (one resting limit order). opt: side ("ask"|"bid") for the painted stamp,
     star (our own order, gold), label (size text), a (appear 0..1), squash */
  K.crate = function (ctx, x, y, s, opt) {
    const o = Object.assign({ side: "bid", star: false, label: "", a: 1, seed: 41, tilt: 0, fill: null }, opt || {});
    const a = o.a <= 0 ? 0 : o.a >= 1 ? 1 : K.E.back(o.a, 2.2); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt); ctx.scale(s * a, s * a);
    const c = o.fill || (o.star ? P.gold : P.crate);
    K.shape(ctx, K.rectPts(-30, -56, 60, 56, 2), { fill: c, w: 4, boil: 0.9, seed: o.seed, k: 0.15, shade: { color: o.star ? P.goldDark : P.crateDark, dx: 8, dy: -8 } });
    /* planks + cross brace */
    K.line(ctx, [[-27, -38], [27, -38]], { stroke: P.ink, w: 2.5, boil: 0.6, seed: o.seed + 1 });
    K.line(ctx, [[-27, -19], [27, -19]], { stroke: P.ink, w: 2.5, boil: 0.6, seed: o.seed + 2 });
    /* side stamp: a small triangle pointing to the side's direction (up = ask sells high, down = bid) */
    const st = o.side === "ask" ? P.ask : P.bid;
    if (o.star) {
      const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 16, an = -Math.PI / 2 + (i / 10) * K.TAU; pts.push([Math.cos(an) * r, -28 + Math.sin(an) * r]); }
      K.shape(ctx, pts, { fill: P.paper, w: 3, boil: 0.6, seed: o.seed + 3, k: 0, nicks: 0, reg: false });
    } else K.dot(ctx, 0, -28, 7, st, P.ink, 2.5, o.seed + 3);
    ctx.restore();
    if (o.label) K.text(ctx, o.label, x, y - 74 * s * a, { size: 26 * s, weight: 800, fill: P.ink });
  };

  /* ---------------- STALL: one price level ----------------
     x, y = left edge / floor of the stall; w, h = size. opt:
       side "ask" | "bid", price (string on the hanging plaque), open (awning drop 0..1),
       crates [{a, star, tilt, dx, dy, gone, slot}] drawn left to right on the counter (slot = fractional queue position),
       hot (0..1 lantern glow, e.g. best level), plaque (show sign), seed */
  /* x of crate slot k (0 = front of the queue) in a stall whose left edge is x */
  K.slotX = (x, k, cs) => x + 240 + 66 * (cs || 0.95) * (k + 0.5);
  K.stall = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ side: "bid", price: "", price2: null, open: 1, crates: [], hot: 0, plaque: true, seed: 51, crateS: 0.95, priceA: 1, flip: 0, ping: 0 }, opt || {});
    const isAsk = o.side === "ask", main = isAsk ? P.ask : P.bid, dark = isAsk ? P.askDark : P.bidDark;
    const sx = x + 200, sw = w - 220; /* stall box right of the plaque column */
    /* back wall: deep arch (shadowed interior) */
    K.shape(ctx, K.rectPts(sx, y - h, sw, h, 4), { fill: P.plaster, w: 4.5, boil: 1, seed: o.seed, k: 0.2, gouge: { side: 1, alpha: 0.18, color: P.plasterShade, gap: 18 } });
    K.shape(ctx, K.archPts(sx + sw / 2, y - 8, sw - 40, h - 40, 11), { fill: isAsk ? P.indigo : P.tealDark, w: 4, boil: 1, seed: o.seed + 1, k: 0.7, specks: 6 });
    if (o.hot > 0) K.glow(ctx, sx + sw * 0.3, y - h * 0.5, h * 1.1, "rgba(255,214,120,0.95)", o.hot * 0.55);
    /* roll-up wooden shutter: closed until the awning drops (open 0 = shut) */
    const shut = 1 - K.E.out3(clamp(o.open * 1.6, 0, 1));
    if (shut > 0.01) {
      const st = y - h + 8, sh = (h - 24) * shut;
      K.shape(ctx, K.rectPts(sx + 14, st, sw - 28, sh, 4), { fill: P.woodLight, w: 4.5, boil: 0.9, seed: o.seed + 11, k: 0.1, gouge: { ang: 0, alpha: 0.35, color: P.woodDark, gap: 13, len: 0.95 } });
      if (sh > 30) K.dot(ctx, sx + sw / 2, st + sh - 14, 8, P.brass, P.ink, 3, o.seed + 12);
    }
    /* counter */
    K.shape(ctx, K.rectPts(sx - 6, y - 16, sw + 12, 22, 4), { fill: P.wood, w: 4, boil: 0.9, seed: o.seed + 2, k: 0.1, shade: { color: P.woodDark, dx: 0, dy: -8 } });
    /* crates queue on the counter, left = front of the queue */
    const cs = o.crateS;
    o.crates.forEach((c, i) => {
      if (c.gone) return;
      K.crate(ctx, K.slotX(x, c.slot != null ? c.slot : i, cs) + (c.dx || 0), y - 16 + (c.dy || 0), cs, { side: o.side, star: c.star, a: c.a == null ? 1 : c.a, seed: o.seed + 100 + i * 3, tilt: c.tilt || 0 });
    });
    /* awning: scalloped, striped, drops down with `open` */
    const op = clamp(o.open, 0, 1); if (op > 0) {
      const ay = y - h + 4, ad = 26 + 34 * K.E.back(op, 1.6), N = Math.max(5, Math.round(sw / 70));
      const pts = [[sx - 18, ay - 14], [sx + sw + 18, ay - 14], [sx + sw + 18, ay + ad * 0.4]];
      for (let i = N; i >= 0; i--) { const xx = sx - 18 + ((sw + 36) * i) / N; pts.push([xx, ay + ad * 0.45]); if (i) pts.push([xx - (sw + 36) / N / 2, ay + ad]); }
      K.shape(ctx, pts, { fill: main, w: 5, boil: 1.1, seed: o.seed + 3, k: 0.35, pattern: { kind: "stripes", color: P.paper, gap: (sw + 36) / N / 2, alpha: 0.9 }, shade: { color: dark, dx: 0, dy: -10 } });
    }
    /* price plaque hanging from the column on the left */
    if (o.plaque && o.price) {
      const px = x + 96, py = y - h / 2 + 4, pa = (o.priceA <= 0 ? 0 : o.priceA >= 1 ? 1 : K.E.back(o.priceA, 2)) * (1 + 0.16 * o.ping);
      if (pa > 0) {
        if (o.ping > 0) K.glow(ctx, px, py - 10, 150, "rgba(255,214,120,0.95)", o.ping * 0.9);
        ctx.save(); ctx.translate(px, py - 46); ctx.rotate(Math.sin(K.now * 1.7 + o.seed) * 0.025); ctx.scale(pa, pa);
        K.line(ctx, [[-50, 0], [0, -26], [50, 0]], { stroke: P.ink, w: 3, boil: 0.7, seed: o.seed + 6 });
        const fl = o.flip > 0 && o.flip < 1 ? Math.abs(Math.cos(o.flip * Math.PI)) : 1; /* flip-card turn when the price ticks */
        ctx.scale(1, Math.max(0.05, fl));
        K.shape(ctx, K.rectPts(-86, 0, 172, 72, 3), { fill: P.paper, w: 4.5, boil: 0.9, seed: o.seed + 7, k: 0.2, shade: { color: P.paperShade, dx: 0, dy: -8 } });
        K.shape(ctx, K.rectPts(-86, 0, 12, 72, 1), { fill: main, stroke: null, w: 0, boil: 0.6, seed: o.seed + 8, reg: false });
        /* flip 0..1: the card turns over; the new price (price2) shows on the back half */
        K.text(ctx, o.price2 != null && o.flip >= 0.5 ? o.price2 : o.price, 6, 39, { size: 40, weight: 800, fill: isAsk ? P.askDark : P.bidDark });
        ctx.restore();
      }
    }
  };

  /* ---------------- TOWER: the whole book from data ----------------
     cx = centre x, alleyY = centre of the alley (spread), opt:
       asks [{p, q, p2}] best first, bids [{p, q, p2}] best first (p2 = price after a flip),
       gap (alley height), lh (level height), w (stall width), open(i, side) -> 0..1,
       crates(i, side, q) -> crate array (default q plain crates),
       hot (best levels glow), facade (draw the plaster tower body),
       priceA / flip / ping (i, side) -> 0..1 for the price plaques
     returns { askY: [floor y per level], bidY: [...], left: x0, top, bottom } */
  K.tower = function (ctx, cx, alleyY, opt) {
    const o = Object.assign({ asks: [], bids: [], gap: 220, lh: 150, w: 1100, open: () => 1, crates: null, hot: 1, facade: true, seed: 300, priceA: () => 1, flip: () => 0, ping: () => 0 }, opt || {});
    const x0 = cx - o.w / 2, nA = o.asks.length, nB = o.bids.length;
    const top = alleyY - o.gap / 2 - nA * o.lh, bottom = alleyY + o.gap / 2 + nB * o.lh;
    if (o.facade) {
      /* tower body: plaster with tile bands, a crenellated top */
      const body = K.rectPts(x0 - 40, top - 60, o.w + 80, bottom - top + 60, 6);
      K.shape(ctx, body, { fill: P.plaster, w: 6, boil: 1.4, seed: o.seed, k: 0.2, gouge: { side: 1, alpha: 0.2, color: P.plasterShade, gap: 22, len: 0.25 }, specks: 30 });
      const cren = [];
      for (let i = 0; i <= 12; i++) { const xx = x0 - 40 + ((o.w + 80) * i) / 12; cren.push([xx, top - 60], [xx, top - (i % 2 ? 60 : 100)]); }
      for (let i = 0; i < 12; i += 2) { const xa = x0 - 40 + ((o.w + 80) * i) / 12, xb = x0 - 40 + ((o.w + 80) * (i + 1)) / 12; K.shape(ctx, [[xa, top - 58], [xa, top - 100], [xb, top - 100], [xb, top - 58]], { fill: P.terra, w: 5, boil: 1.1, seed: o.seed + 70 + i, k: 0.1 }); }
      /* the alley: a dark lane through the tower */
      K.shape(ctx, K.rectPts(x0 - 44, alleyY - o.gap / 2, o.w + 88, o.gap, 6), { fill: P.indigoDark, w: 5, boil: 1.2, seed: o.seed + 2, k: 0.2, pattern: { kind: "diamonds", color: P.indigo, gap: 44, w: 10, alpha: 0.7 } });
    }
    const askY = [], bidY = [];
    /* asks: best (i = 0) sits right above the alley */
    for (let i = 0; i < nA; i++) {
      const fy = alleyY - o.gap / 2 - i * o.lh, L = o.asks[i];
      askY.push(fy);
      const cr = o.crates ? o.crates(i, "ask", L.q) : Array.from({ length: L.q }, () => ({}));
      K.stall(ctx, x0, fy, o.w, o.lh - 6, { side: "ask", price: L.p, price2: L.p2, open: o.open(i, "ask"), crates: cr, hot: i === 0 ? o.hot : 0, seed: o.seed + 10 + i * 13, priceA: o.priceA(i, "ask"), flip: o.flip(i, "ask"), ping: o.ping(i, "ask") });
    }
    for (let i = 0; i < nB; i++) {
      const fy = alleyY + o.gap / 2 + (i + 1) * o.lh, L = o.bids[i];
      bidY.push(fy);
      const cr = o.crates ? o.crates(i, "bid", L.q) : Array.from({ length: L.q }, () => ({}));
      K.stall(ctx, x0, fy, o.w, o.lh - 6, { side: "bid", price: L.p, price2: L.p2, open: o.open(i, "bid"), crates: cr, hot: i === 0 ? o.hot : 0, seed: o.seed + 200 + i * 13, priceA: o.priceA(i, "bid"), flip: o.flip(i, "bid"), ping: o.ping(i, "bid") });
    }
    return { askY, bidY, left: x0, right: x0 + o.w, top, bottom, alleyY, gap: o.gap };
  };

  /* ---------------- COINS, SPARKLES ---------------- */
  /* bazaar coin with a square hole and a punched rim */
  K.coin = function (ctx, x, y, r, opt) {
    const o = Object.assign({ color: P.gold, label: "", labelColor: P.ink, seed: 61, size: null, hole: true, spin: 0 }, opt || {});
    const sx = Math.max(0.08, Math.abs(Math.cos(o.spin)));
    ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
    K.shape(ctx, K.ellipsePts(0, 0, r, r, 16), { fill: o.color, w: Math.max(3, r * 0.09), boil: r * 0.02 + 0.5, seed: o.seed, k: 1, shade: { color: P.goldDark, dx: r * 0.12, dy: r * 0.12 } });
    K.shape(ctx, K.ellipsePts(0, 0, r * 0.74, r * 0.74, 14), { fill: null, w: Math.max(2.2, r * 0.05), boil: 0.6, seed: o.seed + 1, k: 1, nicks: 0 });
    if (o.label) K.text(ctx, o.label, 0, 2, { size: o.size || r * 0.6, weight: 800, fill: o.labelColor });
    else if (o.hole) K.shape(ctx, K.rectPts(-r * 0.2, -r * 0.2, r * 0.4, r * 0.4, 1), { fill: P.ink, stroke: P.ink, w: 2, boil: 0.4, seed: o.seed + 2, k: 0, reg: false });
    ctx.restore();
  };
  K.sparkle = function (ctx, x, y, r, a, seed) {
    if (a <= 0 || r <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(a, 0, 1); ctx.translate(x, y); ctx.rotate(hash(seed || 1, 9) * 0.6);
    K.shape(ctx, [[0, -r], [r * 0.22, -r * 0.22], [r, 0], [r * 0.22, r * 0.22], [0, r], [-r * 0.22, r * 0.22], [-r, 0], [-r * 0.22, -r * 0.22]], { fill: P.goldGlow, w: 2.5, boil: 0.6, seed: (seed || 1) + 80, k: 0, nicks: 0, reg: false });
    ctx.restore();
  };

  /* ---------------- MARKET ORDER: a hand cart that crosses the spread ----------------
     side "buy" (green up arrow, takes asks) | "sell" (red down arrow, takes bids); dir -1 faces left */
  K.cart = function (ctx, x, y, s, opt) {
    const o = Object.assign({ color: P.saffron, dir: 1, seed: 81, label: "", roll: 0, side: "buy" }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s * o.dir, s);
    const bump = Math.abs(Math.sin(o.roll * 2)) * 4;
    ctx.translate(0, -bump);
    K.line(ctx, [[-110, -70], [-170, -110]], { stroke: P.woodDark, w: 9, boil: 0.8, seed: o.seed });
    K.shape(ctx, [[-110, -110], [110, -110], [96, -36], [-96, -36]], { fill: o.color, w: 5, boil: 1, seed: o.seed + 1, k: 0.1, pattern: { kind: "zigzag", color: P.terra, gap: 26, w: 5, alpha: 0.8 }, shade: { color: P.saffronDark, dx: 0, dy: -10 } });
    /* flag with a big arrow (direction of the aggressive order) */
    K.line(ctx, [[70, -110], [70, -230]], { stroke: P.ink, w: 5, boil: 0.8, seed: o.seed + 2 });
    const fw = Math.sin(K.now * 8) * 6;
    K.shape(ctx, [[70, -230], [160, -222 + fw], [150, -190 + fw], [70, -182]], { fill: P.paper, w: 4, boil: 0.9, seed: o.seed + 3, k: 0.3 });
    const up = o.side !== "sell", ay = (v) => (up ? v : -412 - v + fw * 1.2); /* sell = arrow mirrored to point down */
    K.shape(ctx, [[96, ay(-192)], [122, ay(-220 + fw * 0.6)], [140, ay(-194 + fw * 0.6)], [128, ay(-194)], [128, ay(-186)], [108, ay(-186)], [108, ay(-192)]].map((p) => [p[0], p[1]]), { fill: up ? P.up : P.down, w: 3, boil: 0.6, seed: o.seed + 4, k: 0, nicks: 0 });
    /* wheels */
    [-60, 60].forEach((wx, i) => {
      K.shape(ctx, K.ellipsePts(wx, -24, 30, 30, 14), { fill: P.wood, w: 5, boil: 0.9, seed: o.seed + 5 + i, k: 1 });
      for (let k = 0; k < 4; k++) { const a = o.roll + (k / 4) * Math.PI; K.line(ctx, [[wx - Math.cos(a) * 26, -24 - Math.sin(a) * 26], [wx + Math.cos(a) * 26, -24 + Math.sin(a) * 26]], { stroke: P.ink, w: 3, boil: 0.5, seed: o.seed + 10 + k }); }
      K.dot(ctx, wx, -24, 6, P.brass, P.ink, 2.5, o.seed + 20 + i);
    });
    if (o.label) K.text(ctx, o.label, 0, -76, { size: 34, weight: 800, fill: P.ink });
    ctx.restore();
  };

  /* ---------------- RUG (kilim): curtain, title banner, table cloth ----------------
     x, y = top-left; w, h; roll = 0 flat .. 1 fully rolled up to the top edge;
     motifs (diamond grid), field = px kept plain at the top (a title sits there) */
  K.rug = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ roll: 0, seed: 91, base: P.terra, band: P.saffron, motif: P.teal, fringe: true, motifs: true, field: 0 }, opt || {});
    const hh = h * (1 - clamp(o.roll, 0, 1));
    if (hh > 2) {
      const sway = Math.sin(K.now * 1.3) * 4;
      const body = [[x, y], [x + w, y], [x + w + sway, y + hh], [x + sway, y + hh]];
      K.shape(ctx, body, { fill: o.base, w: 6, boil: 1.4, seed: o.seed, k: 0.1, specks: 40 });
      /* border bands + motif rows (stepped diamonds), clipped to the visible part */
      ctx.save(); K.pathOf(ctx, body, true, 0.1); ctx.clip();
      const yOff = y; /* the cloth winds into the roll at the bottom: the pattern stays put */
      [[24, P.ink], [44, o.band]].forEach(([inset, c], k) => K.line(ctx, K.rectPts(x + inset, yOff + inset, w - inset * 2, h - inset * 2, 6).concat([[x + inset, yOff + inset]]), { stroke: c, w: k ? 12 : 5, boil: 0.8, seed: o.seed + 3 + k }));
      if (!o.motifs || o.field) { /* plain field (a title sits on it): a stepped-triangle band top and bottom */
        [yOff + 62, o.field ? yOff + o.field : yOff + h - 62].forEach((by, k) => {
          const n = Math.round((w - 140) / 46);
          for (let i = 0; i < n; i++) { const bx = x + 70 + ((w - 140) * (i + 0.5)) / n, d = 15 * (k ? -1 : 1); K.shape(ctx, [[bx - 15, by - d], [bx + 15, by - d], [bx, by + d]], { fill: i % 2 ? o.motif : o.band, w: 3, boil: 0.6, seed: o.seed + 10 + i + k * 50, k: 0, nicks: 0 }); }
        });
      }
      const mTop = o.field ? o.field + 40 : 0, rows = o.motifs ? Math.max(1, Math.round((h - 140 - mTop) / 150)) : 0, cols = Math.max(2, Math.round((w - 140) / 170));
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const mx = x + 70 + ((w - 140) * (c + 0.5)) / cols, my = yOff + mTop + 70 + ((h - 140 - mTop) * (r + 0.5)) / rows, d = Math.min(56, (h - 140 - mTop) / rows / 2.4);
        K.shape(ctx, [[mx, my - d], [mx + d * 0.9, my], [mx, my + d], [mx - d * 0.9, my]], { fill: (r + c) % 2 ? o.motif : P.paper, w: 4, boil: 0.8, seed: o.seed + 10 + r * 7 + c, k: 0 });
        K.shape(ctx, [[mx, my - d * 0.4], [mx + d * 0.36, my], [mx, my + d * 0.4], [mx - d * 0.36, my]], { fill: P.ink, stroke: null, w: 0, boil: 0.5, seed: o.seed + 50 + r * 7 + c, k: 0, reg: false });
      }
      ctx.restore();
      if (o.fringe && o.roll < 0.98) for (let i = 0; i <= 24; i++) { const fx = x + sway + (w * i) / 24; K.line(ctx, [[fx, y + hh], [fx + Math.sin(K.now * 3 + i) * 3, y + hh + 26]], { stroke: P.paper, w: 4, boil: 0.8, seed: o.seed + 80 + i }); }
    }
    /* the roll (a fat cylinder at the bottom edge of what is still hanging) */
    if (o.roll > 0.02) {
      const rr = 24 + 46 * clamp(o.roll, 0, 1);
      K.shape(ctx, K.rectPts(x - 12, y + hh - rr, w + 24, rr * 2, 6), { fill: o.base, w: 6, boil: 1.2, seed: o.seed + 90, k: 0.6, pattern: { kind: "stripes", color: o.band, gap: 30, alpha: 0.6 }, shade: { color: P.terraDark, dx: 0, dy: -rr * 0.6 } });
    }
  };
})(BK);
