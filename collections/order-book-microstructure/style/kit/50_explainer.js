/* ============================================================
   KIT 50 EXPLAINER: slide content as objects of the bazaar.
   Never draw a flat slide. Each primitive is a physical thing:
     order book      -> the stall tower (K.tower, kit 30)
     resting order   -> crate on a counter (K.crate); our order = gold crate with a star
     market order    -> hand cart crossing the alley (K.cart)
     depth chart     -> two terraced hills, green bids / red asks     K.depthHills
     big number      -> carved wooden sign on two chains              K.signboard
     table           -> table woven into a kilim                      K.rugTable
     formula         -> glazed tile panel, cobalt letters             K.tileBoard
     chart, candles  -> painted on a hanging textile scroll           K.scrollChart
     bullets         -> merchant's price board, coin bullets          K.priceList
     code            -> paper scroll with wooden handles              K.codeScroll
     shout, signal   -> jagged speech burst with an arrow + number    K.shout
     flow            -> carved arrow ribbon                           K.arrow
     small label     -> paper tag on a string                         K.tag
     title           -> kilim banner dropping from a beam             K.kilimBanner
   All take an `a` (appear 0..1) so they can pop in on a beat.
   Text never boils; frames, cloth and paper edges do.
   ============================================================ */
var BK = window.BK || (window.BK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));
  K.popS = popS;

  /* ---------- small paper tag (spread, prices) ---------- */
  K.tag = function (ctx, x, y, str, opt) {
    const o = Object.assign({ a: 1, size: 34, seed: 1, fill: P.paper, color: P.ink, font: K.FONT.label, weight: 800, string: 0 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = K.textW(ctx, str, o.size, o.weight, o.font) + 34, h = o.size + 22;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(hs(o.seed, 2) * 0.05 + Math.sin(K.now * 2 + o.seed) * 0.02);
    if (o.string) K.line(ctx, [[0, -h / 2], [0, -h / 2 - o.string]], { stroke: P.ink, w: 3, boil: 0.6, seed: o.seed + 3 });
    K.shape(ctx, [[-w / 2, -h / 2], [w / 2 - 12, -h / 2], [w / 2, 0], [w / 2 - 12, h / 2], [-w / 2, h / 2]], { fill: o.fill, w: 4, boil: 0.9, seed: o.seed, k: 0.1, shade: { color: P.paperShade, dx: 0, dy: -6 } });
    K.text(ctx, str, -6, 2, { size: o.size, weight: o.weight, font: o.font, fill: o.color });
    ctx.restore();
  };

  /* ---------- speech burst: jagged woodcut balloon; content = arrow (up/down) + text ---------- */
  K.shout = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ a: 1, seed: 7, text: "", arrow: 0, color: P.paper, tail: [-1, 1], size: 56, textColor: P.ink }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(K.now * 9) * 0.015);
    const pts = [], n = 18;
    for (let i = 0; i < n; i++) { const an = (i / n) * K.TAU, r = i % 2 ? 0.78 : 1.0; pts.push([Math.cos(an) * w / 2 * r, Math.sin(an) * h / 2 * r]); }
    /* tail spike toward the speaker */
    const ti = Math.round(((Math.atan2(o.tail[1], o.tail[0]) + K.TAU) % K.TAU) / K.TAU * n) % n;
    pts.splice(ti, 1, [o.tail[0] * w * 0.75, o.tail[1] * h * 0.85]);
    K.shape(ctx, pts, { fill: o.color, w: 5.5, boil: 1.3, seed: o.seed, k: 0.05, shade: { color: P.saffronLight, dx: 0, dy: -10 } });
    let tx = 0;
    if (o.arrow) {
      const s = o.size * 0.9, dx = o.text ? -K.textW(ctx, o.text, o.size, 800) / 2 - s * 0.3 : 0, up = o.arrow > 0;
      const ar = up ? [[0, -s * 0.6], [s * 0.55, 0], [s * 0.2, 0], [s * 0.2, s * 0.55], [-s * 0.2, s * 0.55], [-s * 0.2, 0], [-s * 0.55, 0]] : [[0, s * 0.6], [s * 0.55, 0], [s * 0.2, 0], [s * 0.2, -s * 0.55], [-s * 0.2, -s * 0.55], [-s * 0.2, 0], [-s * 0.55, 0]];
      K.shape(ctx, ar.map((p) => [p[0] + dx, p[1]]), { fill: up ? P.up : P.down, w: 4, boil: 0.8, seed: o.seed + 3, k: 0, nicks: 0 });
      tx = s * 0.45;
    }
    if (o.text) K.text(ctx, o.text, tx, 4, { size: o.size, weight: 800, fill: o.textColor });
    ctx.restore();
  };

  /* ---------- carved arrow ribbon (order flow, direction) ---------- */
  K.arrow = function (ctx, A, B, opt) {
    const o = Object.assign({ p: 1, w: 34, color: P.teal, seed: 9, bend: 0 }, opt || {});
    if (o.p <= 0) return;
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, nx = -(B[1] - A[1]) / L, ny = (B[0] - A[0]) / L;
    const pt = (u) => [lerp(A[0], B[0], u) + nx * Math.sin(u * Math.PI) * o.bend, lerp(A[1], B[1], u) + ny * Math.sin(u * Math.PI) * o.bend];
    const N = 12, e = clamp(o.p, 0, 1), left = [], right = [];
    for (let i = 0; i <= N; i++) { const u = (i / N) * e * 0.86, p = pt(u), q = pt(Math.min(1, u + 0.01)); const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1; left.push([p[0] - (ty / tl) * o.w / 2, p[1] + (tx / tl) * o.w / 2]); right.push([p[0] + (ty / tl) * o.w / 2, p[1] - (tx / tl) * o.w / 2]); }
    const tip = pt(e), base = pt(e * 0.86), bx = tip[0] - base[0], by = tip[1] - base[1], bl = Math.hypot(bx, by) || 1;
    const hx = (-by / bl) * o.w * 1.1, hy = (bx / bl) * o.w * 1.1;
    const poly = left.concat([[base[0] + hx, base[1] + hy], tip, [base[0] - hx, base[1] - hy]], right.reverse());
    K.shape(ctx, poly, { fill: o.color, w: 5, boil: 1.1, seed: o.seed, k: 0.1, pattern: { kind: "zigzag", color: P.paper, gap: o.w * 0.9, w: 3, alpha: 0.55 } });
  };

  /* ---------- depth chart as two terraced hills ----------
     bids / asks: cumulative sizes per level (best first); mid = half-width of the valley; growBid / growAsk raise each side separately. Bids grow to the left,
     asks to the right, the spread is the valley between them. */
  K.depthHills = function (ctx, x, y, w, h, bids, asks, opt) {
    const o = Object.assign({ a: 1, grow: 1, growBid: null, growAsk: null, seed: 13, max: null, mid: 30 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const mx = o.max || Math.max(bids[bids.length - 1] || 1, asks[asks.length - 1] || 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    const m = o.mid, half = w / 2 - m, side = (arr, sd, fill, dark, seed, g) => {
      g = clamp(g, 0, 1); if (g <= 0) return;
      const n = arr.length, step = half / n, pts = [[sd * m, 0]];
      arr.forEach((v, i) => { const hh = (v / mx) * h * g; pts.push([sd * (m + step * i), -hh], [sd * (m + step * (i + 1)), -hh]); });
      pts.push([sd * (m + half), 0]);
      K.shape(ctx, pts, { fill, w: 5, boil: 1.1, seed, k: 0, shade: { color: dark, dx: sd * -12, dy: 0 }, gouge: { ang: sd * 0.9, alpha: 0.3, color: dark, gap: 16 } });
    };
    side(bids, -1, P.bid, P.bidDark, o.seed, o.growBid == null ? o.grow : o.growBid);
    side(asks, 1, P.ask, P.askDark, o.seed + 40, o.growAsk == null ? o.grow : o.growAsk);
    K.line(ctx, [[-w / 2, 0], [w / 2, 0]], { stroke: P.ink, w: 5, boil: 1, seed: o.seed + 80 });
    ctx.restore();
  };

  /* ---------- carved wooden sign on two chains (big numbers, 1-3 short lines) ---------- */
  K.signboard = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 60, seed: 17, colors: [], font: K.FONT.label, weight: 800, chains: 90 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(K.now * 1.4 + o.seed) * 0.02);
    [-1, 1].forEach((sd, i) => { for (let k = 0; k < 5; k++) { const cy = -h / 2 - o.chains + (k * o.chains) / 5; K.shape(ctx, K.ellipsePts(sd * (w / 2 - 40), cy + 9, 6, 10, 8), { fill: null, stroke: P.ink, w: 3, boil: 0.5, seed: o.seed + i * 10 + k, k: 1, nicks: 0 }); } });
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.wood, w: 6, boil: 1.2, seed: o.seed, k: 0.15, shade: { color: P.woodDark, dx: 0, dy: -12 }, gouge: { ang: 0.02, alpha: 0.3, color: P.woodDark, gap: 16, len: 0.8 } });
    K.shape(ctx, K.rectPts(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 4), { fill: P.paper, w: 3.5, boil: 0.9, seed: o.seed + 2, k: 0.15 });
    const lh = o.size * 1.15, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => K.text(ctx, ln, 0, top + i * lh + 3, { size: o.size, weight: o.weight, font: o.font, fill: o.colors[i] || P.ink }));
    ctx.restore();
  };

  /* ---------- table woven into a kilim ----------
     rows: arrays of strings; row 0 = header (saffron band). hi = highlighted row */
  K.rugTable = function (ctx, x, y, cols, rows, opt) {
    const o = Object.assign({ a: 1, size: 32, rowH: 56, seed: 21, hi: -1, reveal: 1, colColors: [] }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = cols.reduce((s, c) => s + c, 0) + 60, h = rows.length * o.rowH + 60;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 5), { fill: P.paper, w: 6, boil: 1.1, seed: o.seed, k: 0.1, specks: 20 });
    K.line(ctx, K.rectPts(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 5).concat([[-w / 2 + 12, -h / 2 + 12]]), { stroke: P.terra, w: 8, boil: 0.8, seed: o.seed + 1 });
    /* fringes */
    [-1, 1].forEach((sd) => { for (let i = 0; i <= 14; i++) { const fy = -h / 2 + 10 + ((h - 20) * i) / 14; K.line(ctx, [[sd * w / 2, fy], [sd * (w / 2 + 22), fy + Math.sin(K.now * 3 + i) * 2]], { stroke: P.paperShade, w: 4, boil: 0.6, seed: o.seed + 30 + i }); } });
    const shown = Math.ceil(rows.length * o.reveal);
    rows.slice(0, shown).forEach((r, ri) => {
      const ry = -h / 2 + 30 + ri * o.rowH + o.rowH / 2;
      if (ri === 0) K.shape(ctx, K.rectPts(-w / 2 + 22, ry - o.rowH / 2 + 4, w - 44, o.rowH - 8, 4), { fill: P.saffron, stroke: null, w: 0, boil: 0.8, seed: o.seed + 40, reg: false, pattern: { kind: "dots", color: P.saffronDark, gap: 14, w: 3, alpha: 0.4 } });
      if (ri === o.hi) K.shape(ctx, K.rectPts(-w / 2 + 22, ry - o.rowH / 2 + 4, w - 44, o.rowH - 8, 4), { fill: P.goldGlow, stroke: P.gold, w: 4, boil: 0.8, seed: o.seed + ri, reg: false });
      let cx = -w / 2 + 30;
      r.forEach((cell, ci) => {
        K.text(ctx, cell, cx + cols[ci] / 2, ry, { size: o.size, weight: ri === 0 ? 800 : 400, font: ri === 0 ? K.FONT.label : K.FONT.mono, fill: ri === 0 ? P.ink : o.colColors[ci] || P.ink });
        cx += cols[ci];
      });
    });
    ctx.restore();
  };

  /* ---------- glazed tile panel (formulas, 1-3 lines, cobalt letters written in) ---------- */
  K.tileBoard = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 54, seed: 31, write: 1, font: K.FONT.mono, tile: 90 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rectPts(-w / 2 - 22, -h / 2 - 22, w + 44, h + 44, 4), { fill: P.cobalt, w: 6, boil: 1.1, seed: o.seed, k: 0.1, pattern: { kind: "diamonds", color: P.cobaltLight, gap: 22, w: 5, alpha: 0.6 } });
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.tile, w: 4, boil: 0.9, seed: o.seed + 1, k: 0.1 });
    /* grout lines */
    ctx.save(); ctx.globalAlpha = 0.35;
    for (let gx = -w / 2 + o.tile; gx < w / 2 - 4; gx += o.tile) K.line(ctx, [[gx, -h / 2 + 4], [gx, h / 2 - 4]], { stroke: P.cobaltLight, w: 2.5, boil: 0.5, seed: o.seed + 10 + gx });
    for (let gy = -h / 2 + o.tile; gy < h / 2 - 4; gy += o.tile) K.line(ctx, [[-w / 2 + 4, gy], [w / 2 - 4, gy]], { stroke: P.cobaltLight, w: 2.5, boil: 0.5, seed: o.seed + 50 + gy });
    ctx.restore();
    const lh = o.size * 1.32, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const str = typeof ln === "string" ? ln : ln.t, col = typeof ln === "string" ? P.cobalt : ln.c || P.cobalt;
      const n = Math.floor(str.length * clamp(o.write * lines.length - i, 0, 1));
      if (n > 0) K.text(ctx, str.slice(0, n), -w / 2 + 40, top + i * lh, { size: o.size, weight: 400, font: o.font, fill: col, align: "left" });
    });
    ctx.restore();
  };

  /* ---------- chart painted on a hanging textile scroll ----------
     series: [{ data, color, kind: "line" | "bar" | "candle" }]; candle data = [{o, h, l, c}] */
  K.scrollChart = function (ctx, x, y, w, h, series, opt) {
    const o = Object.assign({ a: 1, draw: 1, seed: 41, yMin: null, yMax: null, xLabels: [], title: "" }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    const sway = Math.sin(K.now * 1.3) * 6;
    const cloth = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2 + sway, h / 2], [-w / 2 + sway, h / 2]];
    K.shape(ctx, cloth, { fill: P.paper, w: 5, boil: 1.3, seed: o.seed, k: 0.1, specks: 24 });
    K.line(ctx, [[-w / 2 + 14, -h / 2 + 30], [w / 2 - 14, -h / 2 + 30]], { stroke: P.terra, w: 8, boil: 0.8, seed: o.seed + 1 });
    K.line(ctx, [[-w / 2 + 14 + sway, h / 2 - 22], [w / 2 - 14 + sway, h / 2 - 22]], { stroke: P.terra, w: 8, boil: 0.8, seed: o.seed + 2 });
    /* rods */
    [[-h / 2, 0], [h / 2, sway]].forEach(([ry, dx], i) => {
      K.shape(ctx, K.rectPts(-w / 2 - 30 + dx, ry - 12, w + 60, 24, 3), { fill: P.wood, w: 5, boil: 0.9, seed: o.seed + 5 + i, k: 0.6 });
      [-1, 1].forEach((sd, k) => K.dot(ctx, sd * (w / 2 + 34) + dx, ry, 15, P.brass, P.ink, 4, o.seed + 8 + i * 2 + k));
    });
    const pl = -w / 2 + 70, pr = w / 2 - 40, pt = -h / 2 + (o.title ? 100 : 60), pb = h / 2 - 70;
    if (o.title) K.text(ctx, o.title, 0, -h / 2 + 64, { size: 36, weight: 800, fill: P.ink });
    K.line(ctx, [[pl, pt], [pl, pb]], { stroke: P.ink, w: 4.5, boil: 0.9, seed: o.seed + 9 });
    K.line(ctx, [[pl, pb], [pr, pb]], { stroke: P.ink, w: 4.5, boil: 0.9, seed: o.seed + 10 });
    let mn = o.yMin, mx = o.yMax;
    if (mn == null || mx == null) {
      const all = series.flatMap((s) => (s.kind === "candle" ? s.data.flatMap((c) => [c.l, c.h]) : s.data));
      mn = mn == null ? Math.min(...all) : mn; mx = mx == null ? Math.max(...all) : mx;
    }
    const X = (i, n) => pl + 30 + ((pr - pl - 60) * i) / Math.max(1, n - 1), Y = (v) => pb - ((v - mn) / (mx - mn || 1)) * (pb - pt);
    series.forEach((s, si) => {
      const n = s.data.length, k = o.draw * (n - 1);
      if (s.kind === "bar") {
        const bw = ((pr - pl) / n) * 0.55;
        s.data.forEach((v, i) => { const g = clamp(o.draw * n - i, 0, 1); if (g <= 0) return; const top = lerp(pb, Y(v), K.E.back(g, 1.4)); K.shape(ctx, K.rectPts(X(i, n) - bw / 2, top, bw, pb - top, 2), { fill: s.color, w: 4, boil: 0.9, seed: o.seed + 20 + i, k: 0, gouge: { alpha: 0.25, gap: 10, color: P.ink } }); });
      } else if (s.kind === "candle") {
        const bw = ((pr - pl) / n) * 0.5;
        s.data.forEach((c, i) => {
          const g = clamp(o.draw * n - i, 0, 1); if (g <= 0) return;
          const up = c.c >= c.o, col = up ? P.up : P.down, e = K.E.back(g, 1.6), mid = (Y(c.o) + Y(c.c)) / 2;
          K.line(ctx, [[X(i, n), lerp(mid, Y(c.h), e)], [X(i, n), lerp(mid, Y(c.l), e)]], { stroke: P.ink, w: 4, boil: 0.7, seed: o.seed + 60 + i });
          const t0 = lerp(mid, Math.min(Y(c.o), Y(c.c)), e), t1 = lerp(mid, Math.max(Y(c.o), Y(c.c)), e);
          K.shape(ctx, K.rectPts(X(i, n) - bw / 2, t0, bw, Math.max(4, t1 - t0), 2), { fill: col, w: 4, boil: 0.8, seed: o.seed + 80 + i, k: 0 });
        });
      } else {
        const pts = [];
        for (let i = 0; i <= Math.floor(k); i++) pts.push([X(i, n), Y(s.data[i])]);
        const fr = k - Math.floor(k), i0 = Math.floor(k);
        if (i0 < n - 1 && fr > 0) pts.push([lerp(X(i0, n), X(i0 + 1, n), fr), lerp(Y(s.data[i0]), Y(s.data[i0 + 1]), fr)]);
        if (pts.length > 1) { K.line(ctx, pts, { stroke: P.ink, w: 11, boil: 1, seed: o.seed + 30 + si, k: 0.3 }); K.line(ctx, pts, { stroke: s.color, w: 6, boil: 1, seed: o.seed + 30 + si, k: 0.3 }); }
        const head = pts[pts.length - 1]; if (head) K.dot(ctx, head[0], head[1], 9, s.color, P.ink, 3, o.seed + 40 + si);
      }
    });
    o.xLabels.forEach((lb, i) => K.text(ctx, lb, X(i, o.xLabels.length), pb + 32, { size: 26, weight: 600, font: K.FONT.label, fill: P.inkSoft }));
    ctx.restore();
  };

  /* ---------- merchant's price board (bullets; each bullet pops on its own beat) ---------- */
  K.priceList = function (ctx, x, y, w, items, opt) {
    const o = Object.assign({ a: 1, size: 40, seed: 51, shown: 99, title: "", lineH: null }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.lineH || o.size * 1.6, h = items.length * lh + (o.title ? 120 : 70);
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    /* arched top board */
    const top = -h / 2, board = [[-w / 2, h / 2], [-w / 2, top + 40], [-w / 4, top + 8], [0, top - 14], [w / 4, top + 8], [w / 2, top + 40], [w / 2, h / 2]];
    K.shape(ctx, board, { fill: P.board, w: 6, boil: 1.2, seed: o.seed, k: 0.5, shade: { color: "#16222a", dx: 0, dy: -14 } });
    K.line(ctx, board.concat([board[0]]).map((p) => [p[0] * 0.95, p[1] * 0.95]), { stroke: P.saffron, w: 4, boil: 0.8, seed: o.seed + 2 });
    let yy = top + 50 + lh / 2;
    if (o.title) { K.text(ctx, o.title, 0, top + 62, { size: o.size * 1.1, weight: 400, font: K.FONT.display, fill: P.saffron }); yy += 54; }
    items.forEach((it, i) => {
      const g = clamp(o.shown - i, 0, 1); if (g <= 0) return;
      const s = K.E.back(g, 2);
      ctx.save(); ctx.translate(-w / 2 + 60, yy + i * lh); ctx.scale(s, s);
      K.coin(ctx, 0, 0, o.size * 0.42, { seed: o.seed + 10 + i });
      K.text(ctx, it, o.size * 0.85, 2, { size: o.size, weight: 600, fill: P.chalk, align: "left" });
      ctx.restore();
    });
    ctx.restore();
  };

  /* ---------- paper scroll with wooden handles (code; Python / JS highlighting) ---------- */
  const KW = /^(def|async|await|import|from|as|for|in|if|elif|else|return|while|with|class|try|except|None|True|False|const|let|function|new|of)$/;
  K.codeScroll = function (ctx, x, y, w, lines, opt) {
    const o = Object.assign({ a: 1, size: 28, seed: 61, typed: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.size * 1.45, h = lines.length * lh + 70;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 5), { fill: P.paper, w: 5, boil: 1.1, seed: o.seed, k: 0.15, shade: { color: P.paperShade, dx: 0, dy: -10 }, specks: 16 });
    [-1, 1].forEach((sd, i) => {
      K.shape(ctx, K.rectPts(-w / 2 - 26, sd * h / 2 - 16, w + 52, 32, 3), { fill: P.wood, w: 5, boil: 0.9, seed: o.seed + 2 + i, k: 0.8, shade: { color: P.woodDark, dx: 0, dy: -8 } });
      [-1, 1].forEach((sx, k) => K.dot(ctx, sx * (w / 2 + 34), sd * h / 2, 14, P.terra, P.ink, 4, o.seed + 5 + i * 2 + k));
    });
    ctx.save(); ctx.font = `400 ${o.size}px ${K.FONT.mono}`; const cw = ctx.measureText("M").width; ctx.restore();
    const total = lines.reduce((s, l) => s + l.length, 0); let budget = Math.floor(total * o.typed);
    lines.forEach((ln, i) => {
      if (budget <= 0) return; const vis = ln.slice(0, budget); budget -= ln.length;
      const yy = -h / 2 + 36 + lh / 2 + i * lh; let col = 0;
      const toks = vis.match(/#.*$|\/\/.*$|"[^"]*"?|'[^']*'?|[A-Za-z_][A-Za-z0-9_]*|[0-9][0-9_.]*|\s+|./g) || [];
      toks.forEach((tk) => {
        const c = tk.startsWith("#") || tk.startsWith("//") ? "#8a7a66" : KW.test(tk) ? P.terraDark : /^[0-9]/.test(tk) ? P.cobalt : /^["']/.test(tk) ? P.bidDark : P.ink;
        K.text(ctx, tk, -w / 2 + 40 + col * cw, yy, { size: o.size, weight: 400, font: K.FONT.mono, fill: c, align: "left" });
        col += tk.length;
      });
    });
    ctx.restore();
  };

  /* ---------- kilim title banner hanging from a carved beam. drop 0..1 = unrolled fraction (linear; callers ease) ---------- */
  K.kilimBanner = function (ctx, cx, top, w, h, drop, opt) {
    const o = Object.assign({ seed: 71, field: 0 }, opt || {}); /* field > 0: motifs below a plain title field */
    if (drop <= 0) return null;
    const d = clamp(drop, 0, 1); /* callers ease */
    /* beam + ropes */
    K.line(ctx, [[cx - w / 2 + 40, top - 70], [cx - w / 2 + 60, top]], { stroke: P.ink, w: 4, boil: 0.7, seed: o.seed + 1 });
    K.line(ctx, [[cx + w / 2 - 40, top - 70], [cx + w / 2 - 60, top]], { stroke: P.ink, w: 4, boil: 0.7, seed: o.seed + 2 });
    K.rug(ctx, cx - w / 2, top, w, h, { roll: 1 - d, seed: o.seed, base: P.paper, band: P.terra, motif: P.teal, motifs: o.field > 0, field: o.field });
    K.shape(ctx, K.rectPts(cx - w / 2 - 50, top - 22, w + 100, 34, 4), { fill: P.wood, w: 6, boil: 1, seed: o.seed + 3, k: 0.4, shade: { color: P.woodDark, dx: 0, dy: -10 }, gouge: { ang: 0, alpha: 0.3, color: P.woodDark, gap: 10, len: 0.9 } });
    [-1, 1].forEach((sd, i) => K.dot(ctx, cx + sd * (w / 2 + 50), top - 5, 22, P.terra, P.ink, 5, o.seed + 5 + i));
    return { x: cx - w / 2, y: top, w, h: h * d };
  };
})(BK);
