/* ============================================================
   KIT 50 EXPLAINER: slide content as objects of the sea world.
   Never draw a flat slide. Each primitive is a physical thing:
     graph node  -> island with a currency coin flag      K.node
     graph edge  -> sea route (rope of light) + rate flag K.edge
     number sign -> wooden plank on a post               K.plank
     table       -> parchment ledger                     K.ledger
     formula     -> dark slate board in a wooden frame   K.slate
     chart       -> chart painted on a sail-cloth        K.sailChart
     bullets     -> harbour notice board                 K.notice
     code        -> the captain's logbook                K.logbook
     title       -> unrolling ribbon banner              K.banner
   All take an `a` (appear 0..1) so they can pop in on a beat.
   Text never boils; frames, ropes and paper edges do.
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));

  /* ---------- graph node: island + coin flag ---------- */
  K.node = function (ctx, x, y, s, opt) {
    const o = Object.assign({ label: "BTC", color: P.BTC, a: 1, seed: 1, palms: 2, lighthouse: false, hot: 0, coinY: -170, coinR: 88 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    K.island(ctx, x, y, s, { seed: o.seed, palms: o.palms, pop: a, lighthouse: o.lighthouse });
    /* coin on a pole */
    ctx.save(); ctx.translate(x, y); ctx.scale(s * a, s * a);
    const bob = Math.sin(K.now * 2 + o.seed) * 5;
    K.line(ctx, [[-120, 10], [-120, o.coinY + o.coinR * 0.6 + bob]], { stroke: P.ink, w: 7, boil: 0.8, seed: o.seed + 90, gap: 0 });
    if (o.hot > 0) K.glow(ctx, -120, o.coinY + bob, 150, "rgba(255,220,120,0.95)", o.hot * 0.8);
    K.coin(ctx, -120, o.coinY + bob, o.coinR, { color: o.color, label: o.label, seed: o.seed + 91, labelColor: P.paper, size: o.coinR * (o.label.length > 3 ? 0.42 : 0.52) });
    ctx.restore();
  };

  /* ---------- graph edge: a sea route between two points ----------
     p (draw progress), state "plain" | "hot" | "dim", bend (curvature, px),
     label (rate text on a little flag), dir arrow at 60 % when hot */
  K.edgePoint = function (A, B, bend, u) {
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
    const C = [mx - (dy / L) * bend, my + (dx / L) * bend];
    const x = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0];
    const y = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1];
    const tx = 2 * (1 - u) * (C[0] - A[0]) + 2 * u * (B[0] - C[0]), ty = 2 * (1 - u) * (C[1] - A[1]) + 2 * u * (B[1] - C[1]);
    return [x, y, Math.atan2(ty, tx)];
  };
  K.edge = function (ctx, A, B, opt) {
    const o = Object.assign({ p: 1, state: "plain", bend: 60, label: "", seed: 1, trim: 120, labelA: 1, w: 7, labelSize: 30, lu: 0.5 }, opt || {});
    if (o.p <= 0) return;
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u0 = clamp(o.trim / L, 0, 0.45), u1 = 1 - u0;
    const N = 28, pts = [];
    for (let i = 0; i <= N; i++) { const u = lerp(u0, u1, (i / N) * o.p); pts.push(K.edgePoint(A, B, o.bend, u)); }
    const hot = o.state === "hot", dim = o.state === "dim";
    const col = hot ? P.profit : P.route, alpha = dim ? 0.35 : 1;
    if (hot) { ctx.save(); ctx.globalAlpha = 0.5; K.line(ctx, pts.map((q) => [q[0], q[1]]), { stroke: P.profitGlow, w: o.w * 3.2, boil: 1.5, seed: o.seed + 5, gap: 0 }); ctx.restore(); }
    /* rope: ink underlay + dashed light on top, dashes flow along the route */
    K.line(ctx, pts.map((q) => [q[0], q[1]]), { stroke: P.ink, w: o.w + 5, boil: 1.3, seed: o.seed, gap: 0, alpha });
    const flow = K.now * (hot ? 3.2 : 0.8);
    for (let i = 0; i < N * o.p; i++) {
      if ((Math.floor(i - flow) % 2 + 2) % 2) continue;
      const a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)];
      K.line(ctx, [[a[0], a[1]], [b[0], b[1]]], { stroke: col, w: o.w, boil: 1.0, seed: o.seed + i, gap: 0, alpha });
    }
    /* arrow head */
    if (hot && o.p >= 1) {
      const q = K.edgePoint(A, B, o.bend, lerp(u0, u1, 0.62));
      ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(q[2]);
      K.shape(ctx, [[18, 0], [-12, -14], [-6, 0], [-12, 14]], { fill: P.profit, w: 4, boil: 0.8, seed: o.seed + 7, gap: 0 });
      ctx.restore();
    }
    /* rate flag at the middle */
    if (o.label && o.p > 0.6) {
      const la = clamp((o.p - 0.6) / 0.4, 0, 1) * o.labelA;
      const q = K.edgePoint(A, B, o.bend, o.lu);
      K.tag(ctx, q[0], q[1] - 6, o.label, { a: la * (dim ? 0.5 : 1), hot, seed: o.seed + 9, size: o.labelSize });
    }
  };
  /* small paper tag with a number (edge weights, prices) */
  K.tag = function (ctx, x, y, str, opt) {
    const o = Object.assign({ a: 1, hot: false, size: 30, seed: 1, font: K.FONT.mono, weight: 700 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = K.textW(ctx, str, o.size, o.weight, o.font) + 26, h = o.size + 18;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(hs(o.seed, 2) * 0.05);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 3), { fill: o.hot ? P.profit : P.paper, w: 3.5, boil: 1, seed: o.seed, shade: { color: o.hot ? P.goldDark : P.paperShade, dx: 0, dy: -5 } });
    K.text(ctx, str, 0, 1, { size: o.size, weight: o.weight, font: o.font, fill: P.ink });
    ctx.restore();
  };

  /* ---------- wooden plank sign on a post (big numbers, 1-3 short lines) ---------- */
  K.plank = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 54, seed: 11, post: true, colors: [], font: K.FONT.mono, weight: 700 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(K.now * 1.3 + o.seed) * 0.015);
    if (o.post) K.limb(ctx, [[0, h / 2], [0, h / 2 + 120]], 12, P.woodDark, o.seed + 1);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.wood, w: 5, boil: 1.4, seed: o.seed, shade: { color: P.woodDark, dx: 0, dy: -10 }, hatch: { ang: 0.02, gap: 18, alpha: 0.25, color: P.woodDark } });
    K.shape(ctx, K.rectPts(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 4), { fill: P.paper, w: 3, boil: 1, seed: o.seed + 2 });
    [[-w / 2 + 8, -h / 2 + 8], [w / 2 - 8, -h / 2 + 8], [-w / 2 + 8, h / 2 - 8], [w / 2 - 8, h / 2 - 8]].forEach((n, i) => K.dot(ctx, n[0], n[1], 4, P.rivet, P.ink, 1.5, o.seed + 5 + i));
    const lh = o.size * 1.18, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => K.text(ctx, ln, 0, top + i * lh + 2, { size: o.size, weight: o.weight, font: o.font, fill: o.colors[i] || P.ink }));
    ctx.restore();
  };

  /* ---------- parchment ledger (table) ----------
     rows: array of arrays of strings; row 0 = header. hi = highlighted row index */
  K.ledger = function (ctx, x, y, cols, rows, opt) {
    const o = Object.assign({ a: 1, size: 30, rowH: 52, seed: 21, hi: -1, reveal: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = cols.reduce((s, c) => s + c, 0) + 40, h = rows.length * o.rowH + 40;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    const edge = []; /* torn paper edge */
    for (let i = 0; i <= 10; i++) edge.push([-w / 2 + (w * i) / 10, -h / 2 + hs(i, o.seed) * 4]);
    for (let i = 0; i <= 6; i++) edge.push([w / 2 + hs(i + 20, o.seed) * 4, -h / 2 + (h * i) / 6]);
    for (let i = 10; i >= 0; i--) edge.push([-w / 2 + (w * i) / 10, h / 2 + hs(i + 40, o.seed) * 4]);
    for (let i = 6; i >= 0; i--) edge.push([-w / 2 + hs(i + 60, o.seed) * 4, -h / 2 + (h * i) / 6]);
    K.shape(ctx, edge, { fill: P.paper, w: 4, boil: 1.2, seed: o.seed, shade: { color: P.paperShade, dx: -10, dy: -10 } });
    const shown = Math.ceil(rows.length * o.reveal);
    rows.slice(0, shown).forEach((r, ri) => {
      const ry = -h / 2 + 20 + ri * o.rowH + o.rowH / 2;
      if (ri === o.hi) { ctx.save(); ctx.globalAlpha = 0.55; K.shape(ctx, K.rectPts(-w / 2 + 12, ry - o.rowH / 2 + 4, w - 24, o.rowH - 8, 3), { fill: P.profit, stroke: null, w: 0, boil: 1, seed: o.seed + ri }); ctx.restore(); }
      let cx = -w / 2 + 20;
      r.forEach((cell, ci) => {
        K.text(ctx, cell, cx + cols[ci] / 2, ry, { size: o.size, weight: ri === 0 ? 800 : 500, font: ri === 0 ? K.FONT.display : K.FONT.mono, fill: ri === 0 ? P.rustDark : P.ink });
        cx += cols[ci];
      });
      if (ri === 0) K.line(ctx, [[-w / 2 + 16, ry + o.rowH / 2], [w / 2 - 16, ry + o.rowH / 2]], { stroke: P.ink, w: 3, boil: 1, seed: o.seed + 50 });
    });
    ctx.restore();
  };

  /* ---------- slate board (formulas, 1-3 lines, chalk type) ---------- */
  K.slate = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 56, seed: 31, write: 1, font: K.FONT.mono }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rectPts(-w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 4), { fill: P.wood, w: 5, boil: 1.3, seed: o.seed, shade: { color: P.woodDark, dx: -8, dy: -8 } });
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.board, w: 4, boil: 1.1, seed: o.seed + 1 });
    /* chalk smudges */
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha = 0.06; K.pathOf(ctx, K.blobPts(hs(i, o.seed) * w * 0.4, hs(i + 9, o.seed) * h * 0.3, 90, 30, 9, i, 0.3), true); ctx.fillStyle = P.chalk; ctx.fill(); ctx.restore(); }
    const lh = o.size * 1.3, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const str = typeof ln === "string" ? ln : ln.t, col = typeof ln === "string" ? P.chalk : ln.c || P.chalk;
      const n = Math.floor(str.length * clamp(o.write * lines.length - i, 0, 1)); /* written letter by letter */
      if (n > 0) K.text(ctx, str.slice(0, n), -w / 2 + 40, top + i * lh, { size: o.size, weight: 500, font: o.font, fill: col, align: "left" });
    });
    ctx.restore();
  };

  /* ---------- chart painted on a sail-cloth ----------
     series: [{ data:[..], color, kind:"line"|"bar" }], draw = 0..1 progress, yMin/yMax */
  K.sailChart = function (ctx, x, y, w, h, series, opt) {
    const o = Object.assign({ a: 1, draw: 1, seed: 41, yMin: null, yMax: null, xLabels: [], title: "" }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    const billow = 10 * Math.sin(K.now * 1.6);
    const cloth = [[-w / 2, -h / 2], [0, -h / 2 + 6], [w / 2, -h / 2], [w / 2 + billow, 0], [w / 2, h / 2], [0, h / 2 - 6], [-w / 2, h / 2], [-w / 2 + billow * 0.5, 0]];
    K.shape(ctx, cloth, { fill: P.sail, w: 5, boil: 1.6, seed: o.seed, shade: { color: P.sailShade, dx: -18, dy: 0 } });
    /* rings on the top edge */
    for (let i = 0; i < 6; i++) K.dot(ctx, -w / 2 + 30 + (i * (w - 60)) / 5, -h / 2 + 2, 7, P.goldDark, P.ink, 2, o.seed + i);
    const pl = -w / 2 + 70, pr = w / 2 - 40, pt = -h / 2 + (o.title ? 80 : 40), pb = h / 2 - 60;
    if (o.title) K.text(ctx, o.title, 0, -h / 2 + 42, { size: 34, weight: 800, fill: P.ink });
    K.line(ctx, [[pl, pt], [pl, pb]], { stroke: P.ink, w: 4, boil: 1, seed: o.seed + 9 }); /* two strokes: a smooth path would round the corner */
    K.line(ctx, [[pl, pb], [pr, pb]], { stroke: P.ink, w: 4, boil: 1, seed: o.seed + 8 });
    let mn = o.yMin, mx = o.yMax;
    if (mn == null || mx == null) { const all = series.flatMap((s) => s.data); mn = mn == null ? Math.min(...all) : mn; mx = mx == null ? Math.max(...all) : mx; }
    const X = (i, n) => pl + 20 + ((pr - pl - 40) * i) / Math.max(1, n - 1), Y = (v) => pb - ((v - mn) / (mx - mn || 1)) * (pb - pt);
    series.forEach((s, si) => {
      const n = s.data.length, k = o.draw * (n - 1);
      if (s.kind === "bar") {
        const bw = ((pr - pl) / n) * 0.55;
        s.data.forEach((v, i) => { const g = clamp(o.draw * n - i, 0, 1); if (g <= 0) return; const top = lerp(pb, Y(v), K.E.back(g, 1.4)); K.shape(ctx, K.rectPts(X(i, n) - bw / 2, top, bw, pb - top, 2), { fill: s.color, w: 3.5, boil: 1, seed: o.seed + 20 + i, hatch: { ang: 0.8, gap: 9, alpha: 0.25 } }); });
      } else {
        const pts = [];
        for (let i = 0; i <= Math.floor(k); i++) pts.push([X(i, n), Y(s.data[i])]);
        const fr = k - Math.floor(k), i0 = Math.floor(k);
        if (i0 < n - 1 && fr > 0) pts.push([lerp(X(i0, n), X(i0 + 1, n), fr), lerp(Y(s.data[i0]), Y(s.data[i0 + 1]), fr)]);
        if (pts.length > 1) { K.line(ctx, pts, { stroke: P.ink, w: 10, boil: 1.2, seed: o.seed + 30 + si, gap: 0 }); K.line(ctx, pts, { stroke: s.color, w: 5.5, boil: 1.2, seed: o.seed + 30 + si, gap: 0 }); }
        const head = pts[pts.length - 1]; if (head) K.dot(ctx, head[0], head[1], 8, s.color, P.ink, 3, o.seed + 40 + si);
      }
    });
    o.xLabels.forEach((lb, i) => K.text(ctx, lb, X(i, o.xLabels.length), pb + 30, { size: 24, weight: 500, font: K.FONT.mono, fill: P.inkSoft }));
    ctx.restore();
  };

  /* ---------- harbour notice board (bullets; each bullet pops on its own beat) ----------
     items: strings; shown: number of items visible (fractional = popping) */
  K.notice = function (ctx, x, y, w, items, opt) {
    const o = Object.assign({ a: 1, size: 40, seed: 51, shown: 99, title: "", lineH: null }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.lineH || o.size * 1.65, h = items.length * lh + (o.title ? 110 : 60);
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.limb(ctx, [[-w / 2 + 40, h / 2], [-w / 2 + 40, h / 2 + 140]], 14, P.woodDark, o.seed + 1);
    K.limb(ctx, [[w / 2 - 40, h / 2], [w / 2 - 40, h / 2 + 140]], 14, P.woodDark, o.seed + 2);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.wood, w: 5, boil: 1.3, seed: o.seed, shade: { color: P.woodDark, dx: 0, dy: -12 } });
    K.shape(ctx, K.rectPts(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 4), { fill: P.paper, w: 3, boil: 1, seed: o.seed + 3 });
    let yy = -h / 2 + 30 + lh / 2;
    if (o.title) { K.text(ctx, o.title, 0, -h / 2 + 58, { size: o.size * 1.05, weight: 900, fill: P.rustDark }); yy += 50; }
    items.forEach((it, i) => {
      const g = clamp(o.shown - i, 0, 1); if (g <= 0) return;
      const s = K.E.back(g, 2);
      ctx.save(); ctx.translate(-w / 2 + 60, yy + i * lh); ctx.scale(s, s);
      K.coin(ctx, 0, 0, o.size * 0.42, { color: P.gold, seed: o.seed + 10 + i });
      K.text(ctx, it, o.size * 0.8, 2, { size: o.size, weight: 500, fill: P.ink, align: "left" });
      ctx.restore();
    });
    ctx.restore();
  };

  /* ---------- captain's logbook (code snippet), Rust-ish highlighting ---------- */
  const KW = /^(fn|let|mut|for|in|if|else|return|pub|struct|impl|use|match|while|loop|const|async|await|self|Self|where|break|continue)$/;
  K.logbook = function (ctx, x, y, w, lines, opt) {
    const o = Object.assign({ a: 1, size: 28, seed: 61, typed: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.size * 1.45, h = lines.length * lh + 80;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rectPts(-w / 2 - 14, -h / 2 - 10, w + 28, h + 24, 4), { fill: P.rustDark, w: 5, boil: 1.2, seed: o.seed }); /* leather cover */
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.paper, w: 4, boil: 1.1, seed: o.seed + 1, shade: { color: P.paperShade, dx: 14, dy: 0 } });
    K.line(ctx, [[0, -h / 2 + 6], [0, h / 2 - 6]], { stroke: P.paperShade, w: 3, boil: 1, seed: o.seed + 2, alpha: 0.4 });
    ctx.save(); ctx.font = `500 ${o.size}px ${K.FONT.mono}`; const cw = ctx.measureText("M").width; ctx.restore();
    const total = lines.reduce((s, l) => s + l.length, 0); let budget = Math.floor(total * o.typed);
    lines.forEach((ln, i) => {
      if (budget <= 0) return; const vis = ln.slice(0, budget); budget -= ln.length;
      const yy = -h / 2 + 40 + lh / 2 + i * lh; let col = 0;
      K.text(ctx, String(i + 1), -w / 2 + 28, yy, { size: o.size * 0.8, weight: 500, font: K.FONT.mono, fill: P.paperShade });
      const toks = vis.match(/\/\/.*$|"[^"]*"?|[A-Za-z_][A-Za-z0-9_]*|[0-9][0-9_.]*|\s+|./g) || [];
      toks.forEach((tk) => {
        const c = tk.startsWith("//") ? "#8a7a66" : KW.test(tk) ? P.rustDark : /^[0-9]/.test(tk) ? P.EUR : tk.startsWith('"') ? P.USDT : P.ink;
        K.text(ctx, tk, -w / 2 + 60 + col * cw, yy, { size: o.size, weight: KW.test(tk) ? 700 : 500, font: K.FONT.mono, fill: c, align: "left" });
        col += tk.length;
      });
    });
    ctx.restore();
  };

  /* ---------- ribbon banner (titles). u = unroll 0..1. returns the text box ---------- */
  K.banner = function (ctx, cx, cy, w, h, u, opt) {
    const o = Object.assign({ seed: 71, fill: P.paper, shade: P.paperShade, tail: P.rust, tailDark: P.rustDark }, opt || {});
    if (u <= 0) return null;
    const ww = w * K.E.out3(clamp(u, 0, 1)), wave = (xx) => Math.sin(xx * 0.006 + K.now * 1.4) * 8;
    /* tails (behind) */
    [-1, 1].forEach((sd, i) => {
      const ex = cx + sd * ww / 2, tl = [[ex - sd * 40, cy - h / 2 + 30], [ex + sd * 90, cy - h / 2 + 34], [ex + sd * 50, cy + 10], [ex + sd * 100, cy + h / 2 + 44], [ex - sd * 40, cy + h / 2 + 30]];
      K.shape(ctx, tl, { fill: o.tail, w: 5, boil: 1.4, seed: o.seed + 10 + i, shade: { color: o.tailDark, dx: 0, dy: -14 } });
    });
    /* main band with gentle wave */
    const top = [], bot = [], N = 12;
    for (let i = 0; i <= N; i++) { const xx = cx - ww / 2 + (ww * i) / N; top.push([xx, cy - h / 2 + wave(xx)]); bot.push([xx, cy + h / 2 + wave(xx)]); }
    K.shape(ctx, top.concat(bot.reverse()), { fill: o.fill, w: 6, boil: 1.6, seed: o.seed, shade: { color: o.shade, dx: 0, dy: -16 } });
    /* rolled ends */
    [-1, 1].forEach((sd, i) => K.shape(ctx, K.ellipsePts(cx + sd * ww / 2, cy + wave(cx + sd * ww / 2), 26, h / 2 + 12, 14), { fill: o.shade, w: 5, boil: 1.2, seed: o.seed + 20 + i }));
    return { x: cx - ww / 2, y: cy - h / 2, w: ww, h };
  };
})(CK);
