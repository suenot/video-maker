/* ============================================================
   KIT 50 EXPLAINER: slide content as objects of the diner world.
   Never draw a flat slide. Each primitive is a physical thing:
     graph node   -> token coin on a plate stand           K.node
     graph edge   -> sauce drizzle (ketchup / mustard)     K.edge, K.edgePoint, K.tag
     big number   -> cash register display                  K.register
     table / book -> diner menu card (bid/ask rows, depth)  K.menu
     formula      -> chalk menu board on an A-frame         K.chalkboard
     chart        -> paper placemat, scalloped edge         K.placemat
     bullets      -> felt letter board ("today's specials") K.letterBoard
     code         -> register receipt tape                  K.receipt
     AMM pool     -> two-pan balance scale, x * y = k       K.ammScale
     title        -> neon diner sign with marquee bulbs     K.neonSign
   All take an `a` (appear 0..1) so they can pop in on a beat.
   Text never boils; frames, sauce and paper edges do.
   ============================================================ */
var DK = window.DK || (window.DK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));
  K.popS = popS;

  /* ---------- graph node: token coin standing on a diner plate ---------- */
  K.node = function (ctx, x, y, s, opt) {
    const o = Object.assign({ label: "ETH", color: P.ETH, a: 1, seed: 1, hot: 0, r: 70 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * a, s * a);
    K.plate(ctx, 0, 0, 1.1, o.seed + 3);
    const bob = Math.sin(K.now * 2.2 + o.seed) * 4;
    if (o.hot > 0) K.glow(ctx, 0, -o.r - 20 + bob, o.r * 2.2, "rgba(255,210,90,0.95)", o.hot * 0.8);
    K.rule(ctx, [[0, -6], [0, -24 + bob]], { stroke: P.ink, w: 8, boil: 0.5, seed: o.seed + 4 });
    K.coin(ctx, 0, -o.r - 20 + bob, o.r, { color: o.color, label: o.label, labelColor: P.cream, seed: o.seed + 5, size: o.r * (o.label.length > 3 ? 0.44 : 0.56) });
    ctx.restore();
  };

  /* ---------- graph edge: a sauce drizzle between two points ----------
     p (draw progress), state "plain" | "hot" | "dim", bend (curvature, px),
     label (number on a ticket stub), arrow at 62 % when hot */
  K.edgePoint = function (A, B, bend, u) {
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
    const C = [mx - (dy / L) * bend, my + (dx / L) * bend];
    const x = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0];
    const y = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1];
    const tx = 2 * (1 - u) * (C[0] - A[0]) + 2 * u * (B[0] - C[0]), ty = 2 * (1 - u) * (C[1] - A[1]) + 2 * u * (B[1] - C[1]);
    return [x, y, Math.atan2(ty, tx)];
  };
  K.edge = function (ctx, A, B, opt) {
    const o = Object.assign({ p: 1, state: "plain", bend: 60, label: "", seed: 1, trim: 90, labelA: 1, w: 9, labelSize: 30, lu: 0.5, color: null }, opt || {});
    if (o.p <= 0) return;
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u0 = clamp(o.trim / L, 0, 0.45), u1 = 1 - u0;
    const N = 28, pts = [];
    for (let i = 0; i <= N; i++) { const u = lerp(u0, u1, (i / N) * o.p); const q = K.edgePoint(A, B, o.bend, u); pts.push([q[0], q[1]]); }
    const hot = o.state === "hot", dim = o.state === "dim", alpha = dim ? 0.35 : 1;
    const col = o.color || (hot ? P.mustard : P.cherry);
    if (hot) K.line(ctx, pts, { stroke: P.profitGlow, w: o.w * 3, boil: 1.4, seed: o.seed + 5, alpha: 0.6, taper: 0 });
    K.line(ctx, pts, { stroke: P.ink, w: o.w + 7, boil: 1.2, seed: o.seed, alpha, taper: 0 });
    K.line(ctx, pts, { stroke: col, w: o.w, boil: 1.0, seed: o.seed + 1, alpha, taper: 0 });
    /* sauce drips: little dots flow along the drizzle */
    const flow = K.now * (hot ? 0.5 : 0.15);
    for (let k = 0; k < 4; k++) {
      const u = ((k / 4 + flow) % 1) * o.p, q = K.edgePoint(A, B, o.bend, lerp(u0, u1, u));
      K.dot(ctx, q[0], q[1], o.w * 0.32, P.cream, null, 0, o.seed + 20 + k);
    }
    if (hot && o.p >= 1) {
      const q = K.edgePoint(A, B, o.bend, lerp(u0, u1, 0.62));
      ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(q[2]);
      K.shape(ctx, [[22, 0], [-14, -18], [-6, 0], [-14, 18]], { fill: P.mustard, w: 4, boil: 0.8, seed: o.seed + 7 });
      ctx.restore();
    }
    if (o.label && o.p > 0.6) {
      const la = clamp((o.p - 0.6) / 0.4, 0, 1) * o.labelA, q = K.edgePoint(A, B, o.bend, o.lu);
      K.tag(ctx, q[0], q[1] - 8, o.label, { a: la * (dim ? 0.5 : 1), hot, seed: o.seed + 9, size: o.labelSize });
    }
  };
  /* ticket stub with a number (edge weights, prices). A notch on each end. */
  K.tag = function (ctx, x, y, str, opt) {
    const o = Object.assign({ a: 1, hot: false, size: 30, seed: 1, font: K.FONT.mono, weight: 700, fill: null, color: null }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = K.textW(ctx, str, o.size, o.weight, o.font) + 34, h = o.size + 20;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(hs(o.seed, 2) * 0.05);
    const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, -6], [w / 2 - 8, 0], [w / 2, 6], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, 6], [-w / 2 + 8, 0], [-w / 2, -6]];
    K.shape(ctx, pts, { fill: o.fill || (o.hot ? P.mustard : P.cream), w: 3.5, boil: 0.9, seed: o.seed, shade: { color: o.hot ? P.mustardDark : P.creamShade, dx: 0, dy: -7 } });
    K.text(ctx, str, 0, 1, { size: o.size, weight: o.weight, font: o.font, fill: o.color || P.ink });
    ctx.restore();
  };

  /* ---------- cash register display (big numbers, 1-2 lines). bump 0..1 = number just changed ---------- */
  K.register = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 56, seed: 11, colors: [], bump: 0, keys: true }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    if (o.keys) { /* register body under the display */
      K.shape(ctx, [[-w / 2 - 30, h / 2], [w / 2 + 30, h / 2], [w / 2 + 60, h / 2 + 150], [-w / 2 - 60, h / 2 + 150]], { fill: P.cherry, w: 5, boil: 1.2, seed: o.seed + 1, shade: { color: P.cherryDark, dx: 0, dy: -50 }, shine: true });
      for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) K.dot(ctx, -w / 2 + 10 + c * (w - 20) / 5, h / 2 + 44 + r * 50, 15, c === 5 ? P.mustard : P.cream, P.ink, 3, o.seed + 10 + r * 6 + c);
    }
    K.shape(ctx, K.roundRectPts(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 20), { fill: P.chrome, w: 5, boil: 1.1, seed: o.seed, misreg: false, shade: { color: P.chromeDark, dx: 0, dy: -18, dots: false } });
    K.shape(ctx, K.roundRectPts(-w / 2, -h / 2, w, h, 12), { fill: P.board, w: 4, boil: 0.9, seed: o.seed + 2, misreg: false });
    const b = 1 + 0.12 * Math.sin(clamp(o.bump, 0, 1) * Math.PI);
    const lh = o.size * 1.15, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => { ctx.save(); ctx.translate(0, top + i * lh + 2); ctx.scale(b, b); K.text(ctx, ln, 0, 0, { size: o.size, weight: 700, font: K.FONT.mono, fill: o.colors[i] || P.neonMint }); ctx.restore(); });
    ctx.restore();
  };

  /* ---------- menu card = table / order book ----------
     rows: array of arrays of strings; row 0 = header. opt: hi (row index), rowColors
     (text colour per row), bars ([0..1] per row: depth bar behind the row), barColors, reveal 0..1, title */
  K.menu = function (ctx, x, y, cols, rows, opt) {
    const o = Object.assign({ a: 1, size: 32, rowH: 54, seed: 21, hi: -1, reveal: 1, rowColors: [], bars: [], barColors: [], title: "", tilt: 0 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = cols.reduce((s, c) => s + c, 0) + 60, head = o.title ? 90 : 0, h = rows.length * o.rowH + 60 + head;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt); ctx.scale(a, a);
    K.shape(ctx, K.roundRectPts(-w / 2, -h / 2, w, h, 26), { fill: P.cherry, w: 6, boil: 1.3, seed: o.seed, shade: { color: P.cherryDark, dx: 14, dy: 14 } });
    K.shape(ctx, K.roundRectPts(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36, 16), { fill: P.cream, w: 4, boil: 1, seed: o.seed + 1, misreg: false });
    if (o.title) K.text(ctx, o.title, 0, -h / 2 + 18 + head / 2 + 4, { size: o.size * 1.5, weight: 400, font: K.FONT.script, fill: P.cherry, drop: { color: P.ink, dx: 3, dy: 3 } });
    const shown = Math.ceil(rows.length * o.reveal);
    rows.slice(0, shown).forEach((r, ri) => {
      const ry = -h / 2 + 30 + head + ri * o.rowH + o.rowH / 2;
      if (o.bars[ri] > 0) { /* depth bar from the right edge */
        const bw = (w - 60) * clamp(o.bars[ri], 0, 1);
        ctx.save(); ctx.globalAlpha = 0.35; K.shape(ctx, K.rectPts(w / 2 - 30 - bw, ry - o.rowH / 2 + 6, bw, o.rowH - 12, 3), { fill: o.barColors[ri] || P.mint, stroke: null, w: 0, boil: 0.8, seed: o.seed + 40 + ri, misreg: false }); ctx.restore();
      }
      if (ri === o.hi) { ctx.save(); ctx.globalAlpha = 0.7; K.shape(ctx, K.roundRectPts(-w / 2 + 26, ry - o.rowH / 2 + 4, w - 52, o.rowH - 8, 10, 2), { fill: P.mustard, stroke: null, w: 0, boil: 1, seed: o.seed + ri, misreg: false }); ctx.restore(); }
      let cx = -w / 2 + 30;
      r.forEach((cell, ci) => {
        const head0 = ri === 0;
        K.text(ctx, cell, cx + cols[ci] / 2, ry, { size: o.size, weight: head0 ? 900 : 700, font: head0 ? K.FONT.display : K.FONT.mono, fill: head0 ? P.cherryDark : o.rowColors[ri] || P.ink });
        cx += cols[ci];
      });
      if (ri === 0) K.rule(ctx, [[-w / 2 + 30, ry + o.rowH / 2], [w / 2 - 30, ry + o.rowH / 2]], { stroke: P.ink, w: 3.5, boil: 0.8, seed: o.seed + 50 });
    });
    ctx.restore();
  };

  /* ---------- chalk menu board on an A-frame (formulas, 1-3 lines) ---------- */
  K.chalkboard = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 56, seed: 31, write: 1, font: K.FONT.mono, legs: true }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    if (o.legs) [-1, 1].forEach((sd, i) => K.limb(ctx, [[sd * (w / 2 - 30), h / 2], [sd * (w / 2 + 10), h / 2 + 150]], 14, P.mintDark, o.seed + 1 + i));
    K.shape(ctx, K.roundRectPts(-w / 2 - 22, -h / 2 - 22, w + 44, h + 44, 18), { fill: P.mint, w: 5, boil: 1.2, seed: o.seed, shade: { color: P.mintDark, dx: 10, dy: 10 } });
    K.shape(ctx, K.roundRectPts(-w / 2, -h / 2, w, h, 8), { fill: P.board, w: 4, boil: 1, seed: o.seed + 3, misreg: false });
    for (let i = 0; i < 5; i++) { ctx.save(); ctx.globalAlpha = 0.07; K.pathOf(ctx, K.blobPts(hs(i, o.seed) * w * 0.38, hs(i + 9, o.seed) * h * 0.3, 100, 30, 9, i, 0.3), true); ctx.fillStyle = P.chalk; ctx.fill(); ctx.restore(); }
    const lh = o.size * 1.3, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const str = typeof ln === "string" ? ln : ln.t, col = typeof ln === "string" ? P.chalk : ln.c || P.chalk;
      const n = Math.floor(str.length * clamp(o.write * lines.length - i, 0, 1));
      if (n > 0) K.text(ctx, str.slice(0, n), (typeof ln === "object" && ln.center) ? 0 : -w / 2 + 40, top + i * lh, { size: o.size, weight: 700, font: o.font, fill: col, align: (typeof ln === "object" && ln.center) ? "center" : "left" });
    });
    ctx.restore();
  };

  /* ---------- placemat chart: scalloped paper with a checker border ----------
     series: [{ data:[..], color, kind:"line"|"bar" } | { xy:[[x,y]..], color, kind:"xy" }]
     draw 0..1; yMin/yMax, xMin/xMax (xy); marker: {x, y} dot in data space; title */
  K.placemat = function (ctx, x, y, w, h, series, opt) {
    const o = Object.assign({ a: 1, draw: 1, seed: 41, yMin: null, yMax: null, xMin: 0, xMax: 1, xLabels: [], title: "", marker: null, markerColor: P.cherry }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    const sc = []; const N = Math.round((w + h) / 46);
    for (let i = 0; i < N * 2; i++) { /* scalloped outline: perimeter walk with bumps */
      const u = i / (N * 2), per = 2 * (w + h), d = u * per;
      let px, py; if (d < w) { px = -w / 2 + d; py = -h / 2; } else if (d < w + h) { px = w / 2; py = -h / 2 + d - w; } else if (d < 2 * w + h) { px = w / 2 - (d - w - h); py = h / 2; } else { px = -w / 2; py = h / 2 - (d - 2 * w - h); }
      const k = i % 2 ? 1 : 0, nx = Math.abs(px) >= w / 2 - 0.1 ? Math.sign(px) : 0, ny = nx ? 0 : Math.sign(py);
      sc.push([px + nx * k * 10, py + ny * k * 10]);
    }
    K.shape(ctx, sc, { fill: P.cream, w: 4.5, boil: 1.3, seed: o.seed, shade: { color: P.creamShade, dx: -12, dy: -12 } });
    /* checker border band */
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36); ctx.rect(-w / 2 + 40, -h / 2 + 40, w - 80, h - 80); ctx.clip("evenodd");
    ctx.fillStyle = P.cherry; for (let i = -w / 2 + 18, k = 0; i < w / 2; i += 22, k++) for (let j = -h / 2 + 18, m = 0; j < h / 2; j += 22, m++) if ((k + m) % 2) ctx.fillRect(i, j, 22, 22);
    ctx.restore();
    const pl = -w / 2 + 110, pr = w / 2 - 70, pt = -h / 2 + (o.title ? 130 : 80), pb = h / 2 - 90;
    if (o.title) K.text(ctx, o.title, 0, -h / 2 + 84, { size: 44, weight: 400, font: K.FONT.script, fill: P.cherryDark });
    K.rule(ctx, [[pl, pt], [pl, pb]], { stroke: P.ink, w: 4.5, boil: 0.9, seed: o.seed + 9 });
    K.rule(ctx, [[pl, pb], [pr, pb]], { stroke: P.ink, w: 4.5, boil: 0.9, seed: o.seed + 8 });
    let mn = o.yMin, mx = o.yMax;
    if (mn == null || mx == null) { const all = series.flatMap((s) => s.data || s.xy.map((q) => q[1])); mn = mn == null ? Math.min(...all) : mn; mx = mx == null ? Math.max(...all) : mx; }
    const X = (i, n) => pl + 24 + ((pr - pl - 48) * i) / Math.max(1, n - 1), Y = (v) => pb - ((v - mn) / (mx - mn || 1)) * (pb - pt);
    const XX = (v) => pl + ((v - o.xMin) / (o.xMax - o.xMin || 1)) * (pr - pl);
    series.forEach((s, si) => {
      if (s.kind === "bar") {
        const n = s.data.length, bw = ((pr - pl) / n) * 0.55;
        s.data.forEach((v, i) => { const g = clamp(o.draw * n - i, 0, 1); if (g <= 0) return; const top = lerp(pb, Y(v), K.E.back(g, 1.4)); K.shape(ctx, K.rectPts(X(i, n) - bw / 2, top, bw, pb - top, 2), { fill: s.color, w: 3.5, boil: 0.9, seed: o.seed + 20 + i, shade: { color: null, dx: bw * 0.35, dy: 0 } }); });
        return;
      }
      const src = s.kind === "xy" ? s.xy.map((q) => [XX(q[0]), Y(q[1])]) : s.data.map((v, i) => [X(i, s.data.length), Y(v)]);
      const n = src.length, k = o.draw * (n - 1), pts = [];
      for (let i = 0; i <= Math.floor(k); i++) pts.push(src[i]);
      const fr = k - Math.floor(k), i0 = Math.floor(k);
      if (i0 < n - 1 && fr > 0) pts.push([lerp(src[i0][0], src[i0 + 1][0], fr), lerp(src[i0][1], src[i0 + 1][1], fr)]);
      if (pts.length > 1) { K.line(ctx, pts, { stroke: P.ink, w: 12, boil: 1, seed: o.seed + 30 + si, taper: 0 }); K.line(ctx, pts, { stroke: s.color, w: 6.5, boil: 1, seed: o.seed + 30 + si, taper: 0 }); }
    });
    if (o.marker) { const mxp = XX(o.marker.x), myp = Y(o.marker.y); K.dot(ctx, mxp, myp, 16, o.markerColor, P.ink, 4, o.seed + 60); }
    o.xLabels.forEach((lb, i) => K.text(ctx, lb, X(i, o.xLabels.length), pb + 34, { size: 26, weight: 700, font: K.FONT.mono, fill: P.inkSoft }));
    ctx.restore();
    return { pl, pr, pt, pb, X: (v) => x + XX(v) * a, Y: (v) => y + Y(v) * a };
  };

  /* ---------- felt letter board (bullets; each pops on its own beat) ---------- */
  K.letterBoard = function (ctx, x, y, w, items, opt) {
    const o = Object.assign({ a: 1, size: 40, seed: 51, shown: 99, title: "", lineH: null }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.lineH || o.size * 1.7, h = items.length * lh + (o.title ? 130 : 70);
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(K.now * 1.1 + o.seed) * 0.01);
    K.rule(ctx, [[-w / 3, -h / 2], [0, -h / 2 - 80], [w / 3, -h / 2]], { stroke: P.ink, w: 4, boil: 0.6, seed: o.seed + 1 }); /* hanging wire */
    K.dot(ctx, 0, -h / 2 - 80, 10, P.chrome, P.ink, 3, o.seed + 2);
    K.shape(ctx, K.roundRectPts(-w / 2, -h / 2, w, h, 14), { fill: P.chrome, w: 5, boil: 1.1, seed: o.seed, misreg: false });
    K.shape(ctx, K.roundRectPts(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 8), { fill: "#2a2428", w: 3.5, boil: 0.9, seed: o.seed + 3, misreg: false });
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 2; for (let yy = -h / 2 + 24; yy < h / 2 - 20; yy += 12) { ctx.beginPath(); ctx.moveTo(-w / 2 + 20, yy); ctx.lineTo(w / 2 - 20, yy); ctx.stroke(); } ctx.restore(); /* felt grooves */
    let yy = -h / 2 + 40 + lh / 2;
    if (o.title) { K.text(ctx, o.title, 0, -h / 2 + 70, { size: o.size * 1.2, weight: 400, font: K.FONT.script, fill: P.neonPink }); yy += 60; }
    items.forEach((it, i) => {
      const g = clamp(o.shown - i, 0, 1); if (g <= 0) return;
      const s = K.E.back(g, 2);
      ctx.save(); ctx.translate(-w / 2 + 64, yy + i * lh); ctx.scale(s, s);
      K.dot(ctx, 0, 0, o.size * 0.3, P.cherry, P.ink, 3, o.seed + 10 + i);
      K.text(ctx, it, o.size * 0.75, 2, { size: o.size, weight: 800, font: K.FONT.display, fill: P.cream, align: "left", track: 1 });
      ctx.restore();
    });
    ctx.restore();
  };

  /* ---------- receipt tape (code snippet). Solidity / Python / Rust keywords ---------- */
  const KW = /^(function|contract|returns?|uint256|uint|int|address|mapping|public|external|view|require|emit|def|import|from|for|in|if|else|while|class|let|mut|fn|pub|struct|impl|use|match|const|async|await|self|None|True|False)$/;
  K.receipt = function (ctx, x, y, w, lines, opt) {
    const o = Object.assign({ a: 1, size: 28, seed: 61, typed: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.size * 1.45, h = lines.length * lh + 90;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(-0.012);
    const pts = []; const Z = Math.round(w / 26);
    for (let i = 0; i <= Z; i++) pts.push([-w / 2 + (w * i) / Z, -h / 2 + (i % 2 ? 10 : 0)]);
    for (let i = Z; i >= 0; i--) pts.push([-w / 2 + (w * i) / Z, h / 2 - (i % 2 ? 10 : 0)]);
    K.shape(ctx, pts, { fill: P.cream, w: 4, boil: 1, seed: o.seed, shade: { color: P.creamShade, dx: 14, dy: 0 } });
    ctx.save(); ctx.font = `400 ${o.size}px ${K.FONT.mono}`; const cw = ctx.measureText("M").width; ctx.restore();
    const total = lines.reduce((s, l) => s + l.length, 0); let budget = Math.floor(total * o.typed);
    lines.forEach((ln, i) => {
      if (budget <= 0) return; const vis = ln.slice(0, budget); budget -= ln.length;
      const yy = -h / 2 + 45 + lh / 2 + i * lh; let col = 0;
      const toks = vis.match(/\/\/.*$|#.*$|"[^"]*"?|[A-Za-z_][A-Za-z0-9_]*|[0-9][0-9_.]*|\s+|./g) || [];
      toks.forEach((tk) => {
        const c = tk.startsWith("//") || tk.startsWith("#") ? "#8a7a6e" : KW.test(tk) ? P.cherryDark : /^[0-9]/.test(tk) ? P.USDC : tk.startsWith('"') ? P.gain : P.ink;
        K.text(ctx, tk, -w / 2 + 34 + col * cw, yy, { size: o.size, weight: KW.test(tk) ? 700 : 400, font: K.FONT.mono, fill: c, align: "left" });
        col += tk.length;
      });
    });
    ctx.restore();
  };

  /* ---------- AMM pool = balance scale with two ingredient pans (x * y = k) ----------
     opt: rx, ry (reserves, any units), labelX/labelY (tickers), colorX/colorY,
          tilt (deg; default from the reserve ratio; negative = left pan down), coins (max stack per pan),
     nX/nY (explicit coin counts), plaque (text on the base, "" = none) */
  K.ammScale = function (ctx, x, y, s, opt) {
    const o = Object.assign({ a: 1, rx: 10, ry: 10, labelX: "ETH", labelY: "USDC", colorX: P.ETH, colorY: P.USDC, tilt: null, seed: 81, coins: 8, plaque: "x · y = k" }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * a, s * a);
    const tilt = ((o.tilt != null ? o.tilt : clamp((o.rx - o.ry) / (o.rx + o.ry), -1, 1) * 14) * Math.PI) / 180;
    /* base + post */
    K.shape(ctx, K.roundRectPts(-170, -10, 340, 50, 16), { fill: P.mustard, w: 5, boil: 1.1, seed: o.seed, shade: { color: P.mustardDark, dx: 0, dy: -18 } });
    if (o.plaque) K.text(ctx, o.plaque, 0, 16, { size: 30, weight: 700, font: K.FONT.mono, fill: P.ink });
    K.shape(ctx, K.rectPts(-14, -330, 28, 322, 3), { fill: P.chrome, w: 4.5, boil: 0.9, seed: o.seed + 1, misreg: false, shade: { color: P.chromeDark, dx: 10, dy: 0, dots: false } });
    /* beam */
    ctx.save(); ctx.translate(0, -330); ctx.rotate(tilt);
    K.shape(ctx, K.roundRectPts(-300, -12, 600, 24, 10), { fill: P.chrome, w: 5, boil: 1, seed: o.seed + 2, misreg: false, shade: { color: P.chromeDark, dx: 0, dy: -10, dots: false } });
    const ends = [[-280, 0], [280, 0]].map((p) => ctx.getTransform().transformPoint(new DOMPoint(p[0], p[1])));
    ctx.restore();
    K.dot(ctx, 0, -330, 20, P.cherry, P.ink, 4, o.seed + 3);
    /* pans hang straight down from the beam ends (convert back to local space) */
    const inv = ctx.getTransform().inverse();
    [[ends[0], o.rx, o.labelX, o.colorX], [ends[1], o.ry, o.labelY, o.colorY]].forEach(([e, r, lb, col], i) => {
      const q = inv.transformPoint(e), px = q.x, py = q.y;
      K.ammPans = K.ammPans || []; K.ammPans[i] = ctx.getTransform().transformPoint(new DOMPoint(px, py + 120)); /* screen point above the pan's coins */
      [-1, 1].forEach((sd, k) => K.rule(ctx, [[px, py], [px + sd * 90, py + 170]], { stroke: P.ink, w: 3.5, boil: 0.6, seed: o.seed + 10 + i * 2 + k }));
      const nn = i ? o.nY : o.nX, n = nn != null ? nn : Math.max(1, Math.round(clamp(r, 0, 1e9) / Math.max(o.rx, o.ry) * o.coins));
      for (let c = 0; c < n; c++) {
        const cx = px + ((c % 3) - 1) * 52, cy = py + 150 - Math.floor(c / 3) * 40 - (c % 3 === 1 ? 14 : 0);
        K.coin(ctx, cx, cy, 30, { color: col, label: lb.slice(0, 1), labelColor: P.cream, seed: o.seed + 30 + i * 20 + c, size: 26 });
      }
      const pan = []; for (let j = 0; j <= 10; j++) { const ang = (j / 10) * Math.PI; pan.push([px + Math.cos(ang) * 110, py + 180 + Math.sin(ang) * 40]); }
      K.shape(ctx, pan, { fill: P.chrome, w: 5, boil: 1, seed: o.seed + 20 + i, misreg: false, shade: { color: P.chromeDark, dx: 0, dy: -16, dots: false } });
      K.tag(ctx, px, py + 250, lb, { seed: o.seed + 40 + i, size: 30, fill: col, color: P.cream });
    });
    ctx.restore();
  };

  /* ---------- neon diner sign (titles). on 0..1 lights the tubes, returns the text box ---------- */
  K.neonSign = function (ctx, cx, cy, w, h, on, opt) {
    const o = Object.assign({ seed: 71, a: 1, bulbs: true, flick: 0 }, opt || {});
    const a = popS(o.a); if (a <= 0) return null;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(a, a);
    /* sign board: arched top, chrome rim, cherry face */
    const pts = [];
    for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push([-w / 2 + w * u, -h / 2 - Math.sin(u * Math.PI) * 46]); }
    pts.push([w / 2, h / 2 - 30], [w / 2 - 30, h / 2], [-w / 2 + 30, h / 2], [-w / 2, h / 2 - 30]);
    K.shape(ctx, pts.map((p) => [p[0] * 1.03, p[1] * 1.06 + (p[1] > 0 ? 4 : 0)]), { fill: P.chrome, w: 6, boil: 1.4, seed: o.seed, misreg: false, shade: { color: P.chromeDark, dx: 10, dy: 12, dots: false } });
    K.shape(ctx, pts, { fill: P.cherry, w: 5, boil: 1.2, seed: o.seed + 1, dots: { color: "rgba(120,10,25,0.35)", r: 3, gap: 13 } });
    /* neon tube outline inside the face; flickers on deterministically */
    const fl = on <= 0 ? 0 : on >= 1 ? 1 : (hash(Math.floor(on * 14), o.seed) > 0.4 ? on : 0.15);
    const tube = pts.map((p) => [p[0] * 0.94, p[1] * 0.88]);
    if (fl > 0) { ctx.save(); ctx.globalAlpha = 0.5 * fl; K.inkStroke(ctx, tube, true, 24, "rgba(255,93,143,0.45)", o.seed + 2); ctx.restore(); }
    K.inkStroke(ctx, tube, true, 7, fl > 0.3 ? "#ffd3e2" : "#9b5b6e", o.seed + 3);
    /* marquee bulbs chase along the rim */
    if (o.bulbs) {
      const n = 26, ph = Math.floor(K.now * 8);
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1), bx = -w / 2 * 1.03 + w * 1.03 * u, by = (-h / 2 - Math.sin(u * Math.PI) * 46) * 1.06 - 2;
        const lit = on > 0.5 && (i + ph) % 3 !== 0;
        if (lit) K.glow(ctx, bx, by, 26, "rgba(255,230,140,0.9)", 0.7);
        K.dot(ctx, bx, by, 9, lit ? "#fff2b8" : P.creamShade, P.ink, 2.5, o.seed + 10 + i);
      }
    }
    ctx.restore();
    return { x: cx - (w / 2) * a, y: cy - (h / 2) * a, w: w * a, h: h * a };
  };
})(DK);
