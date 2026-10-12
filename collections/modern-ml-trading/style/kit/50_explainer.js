/* ============================================================
   LAB KIT 50 EXPLAINER: slide content as objects of the greenhouse lab.
   Never draw a flat slide. Each primitive is a physical thing:
     chart (line/bar/scatter/area + band) -> botanical plate on graph paper  K.plate (+ K.plateMap)
     graph node / edge   -> specimen flask + glass tube with bubbles         K.flask (30_world), K.tube
     label, small number -> paper tag on a string                            K.tag
     big number, metric  -> brass gauge with a needle and a readout          K.gauge
     table               -> catalogue index card                             K.card
     formula             -> green chalkboard in a brass deco frame           K.board
     bullets, agenda     -> seed-packet rack, one packet per item            K.packets
     code (Python)       -> typewriter page                                  K.typewriter
     decision tree       -> a potted tree whose branches are splits          K.treePlant
     neural network      -> a vine of bud-neurons joined by tendrils         K.netVine
     title               -> art-deco marquee with chasing bulbs              K.marquee
   All take an `a` (appear 0..1) and pop with a back ease, so they land on a beat.
   Text never boils; frames, glass and paper edges do.
   ============================================================ */
var LK = window.LK || (window.LK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));
  K.popS = popS;

  /* ---------- brass art-deco frame (stepped corners) used by plate/board/marquee ---------- */
  K.decoFrame = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ seed: 300, fill: P.paper, step: 22, frame: P.brass, frameDark: P.brassDark, bw: 20 }, opt || {});
    const st = o.step, b = o.bw;
    const outer = [[x - b, y - b + st], [x - b + st, y - b + st], [x - b + st, y - b], [x + w + b - st, y - b], [x + w + b - st, y - b + st], [x + w + b, y - b + st],
      [x + w + b, y + h + b - st], [x + w + b - st, y + h + b - st], [x + w + b - st, y + h + b], [x - b + st, y + h + b], [x - b + st, y + h + b - st], [x - b, y + h + b - st]];
    K.shape(ctx, outer, { fill: o.frame, w: 5, boil: 0.9, seed: o.seed, shade: { color: o.frameDark, dx: -10, dy: -10 }, rim: 2.5 });
    K.shape(ctx, K.rectPts(x, y, w, h, 4), { fill: o.fill, w: 4, boil: 0.8, seed: o.seed + 1 });
  };

  /* ---------- chart mapping for a plate: returns { X(u 0..1), Y(v), box } ---------- */
  K.plateMap = function (x, y, w, h, yMin, yMax, title) {
    const pl = x - w / 2 + 70, pr = x + w / 2 - 36, pt = y - h / 2 + (title ? 84 : 40), pb = y + h / 2 - 56;
    return { X: (u) => lerp(pl + 16, pr - 16, u), Y: (v) => pb - ((v - yMin) / (yMax - yMin || 1)) * (pb - pt), pl, pr, pt, pb };
  };
  /* ---------- botanical plate: graph paper in a brass frame, pinned ----------
     series: [{ data:[..], color, kind:"line"|"bar"|"scatter"|"area" }], band: { lo:[..], hi:[..], a }
     draw 0..1 (left to right), yMin/yMax, xLabels, title; after(ctx, map) draws custom ink on top */
  K.plate = function (ctx, x, y, w, h, series, opt) {
    const o = Object.assign({ a: 1, draw: 1, seed: 320, yMin: 0, yMax: 1, xLabels: [], title: "", band: null, after: null }, opt || {});
    const a = popS(o.a); if (a <= 0) return null;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.translate(-x, -y);
    K.decoFrame(ctx, x - w / 2, y - h / 2, w, h, { seed: o.seed, fill: P.paper, bw: 16, step: 18 });
    /* graph paper grid (static print) */
    ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2 + 6, y - h / 2 + 6, w - 12, h - 12); ctx.clip();
    ctx.strokeStyle = "rgba(79,154,122,0.22)"; ctx.lineWidth = 1.5;
    for (let gx = x - w / 2; gx < x + w / 2; gx += 30) { ctx.beginPath(); ctx.moveTo(gx, y - h / 2); ctx.lineTo(gx, y + h / 2); ctx.stroke(); }
    for (let gy = y - h / 2; gy < y + h / 2; gy += 30) { ctx.beginPath(); ctx.moveTo(x - w / 2, gy); ctx.lineTo(x + w / 2, gy); ctx.stroke(); }
    ctx.restore();
    /* brass pins */
    [[x - w / 2 + 4, y - h / 2 + 4], [x + w / 2 - 4, y - h / 2 + 4]].forEach((p, i) => K.dot(ctx, p[0], p[1], 9, P.brassLight, P.ink, 3, o.seed + 5 + i));
    const M = K.plateMap(x, y, w, h, o.yMin, o.yMax, o.title);
    if (o.title) K.text(ctx, o.title, x, y - h / 2 + 46, { size: 38, weight: 700, fill: P.ink });
    K.line(ctx, [[M.pl, M.pt], [M.pl, M.pb]], { stroke: P.ink, w: 4, boil: 0.8, seed: o.seed + 9, taper: false });
    K.line(ctx, [[M.pl, M.pb], [M.pr, M.pb]], { stroke: P.ink, w: 4, boil: 0.8, seed: o.seed + 8, taper: false });
    if (o.band && o.band.a !== 0) {
      const ba = o.band.a == null ? 1 : o.band.a, n = o.band.lo.length, k = Math.max(1, Math.floor(o.draw * (n - 1)));
      const top = [], bot = [];
      for (let i = 0; i <= k; i++) { top.push([M.X(i / (n - 1)), M.Y(o.band.hi[i])]); bot.push([M.X(i / (n - 1)), M.Y(o.band.lo[i])]); }
      ctx.save(); ctx.globalAlpha *= 0.55 * ba; ctx.fillStyle = P.band; ctx.beginPath(); top.concat(bot.reverse()).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); ctx.restore();
      K.line(ctx, top, { stroke: P.glassDark, w: 2.5, boil: 0.6, seed: o.seed + 12, alpha: ba });
      K.line(ctx, bot.reverse(), { stroke: P.glassDark, w: 2.5, boil: 0.6, seed: o.seed + 13, alpha: ba });
    }
    series.forEach((s, si) => {
      const n = s.data.length, kk = o.draw * (n - 1);
      if (s.kind === "bar") {
        const bw = ((M.pr - M.pl) / n) * 0.55;
        s.data.forEach((v, i) => { const g = clamp(o.draw * n - i, 0, 1); if (g <= 0) return; const tp = lerp(M.pb, M.Y(v), K.E.back(g, 1.4)); K.shape(ctx, K.rectPts(M.X(i / Math.max(1, n - 1)) - bw / 2, tp, bw, M.pb - tp, 2), { fill: s.color, w: 3.5, boil: 0.8, seed: o.seed + 20 + i, shade: { color: "rgba(0,0,0,0.15)", dx: bw * 0.35, dy: 0 } }); });
      } else if (s.kind === "scatter") {
        s.data.forEach((v, i) => { const g = clamp(o.draw * n - i, 0, 1); if (g <= 0) return; const r = 9 * K.E.back(g, 2.4); K.dot(ctx, M.X(i / Math.max(1, n - 1)), M.Y(v), r, s.color || P.data, P.ink, 2.5, o.seed + 40 + i); });
      } else {
        const pts = [];
        for (let i = 0; i <= Math.floor(kk); i++) pts.push([M.X(i / (n - 1)), M.Y(s.data[i])]);
        const fr = kk - Math.floor(kk), i0 = Math.floor(kk);
        if (i0 < n - 1 && fr > 0) pts.push([lerp(M.X(i0 / (n - 1)), M.X((i0 + 1) / (n - 1)), fr), lerp(M.Y(s.data[i0]), M.Y(s.data[i0 + 1]), fr)]);
        if (s.kind === "area" && pts.length > 1) { ctx.save(); ctx.globalAlpha *= 0.4; ctx.fillStyle = s.color; ctx.beginPath(); ctx.moveTo(pts[0][0], M.pb); pts.forEach((p) => ctx.lineTo(p[0], p[1])); ctx.lineTo(pts[pts.length - 1][0], M.pb); ctx.closePath(); ctx.fill(); ctx.restore(); }
        if (pts.length > 1) { K.line(ctx, pts, { stroke: P.ink, w: 10, boil: 0.9, seed: o.seed + 30 + si, taper: false }); K.line(ctx, pts, { stroke: s.color, w: 5, boil: 0.9, seed: o.seed + 31 + si, taper: false }); }
      }
    });
    o.xLabels.forEach((lb, i) => K.text(ctx, lb, M.X(i / Math.max(1, o.xLabels.length - 1)), M.pb + 28, { size: 24, weight: 500, font: K.FONT.mono, fill: P.inkSoft }));
    if (o.after) o.after(ctx, M);
    ctx.restore();
    return M;
  };

  /* ---------- glass tube between two points (graph edge), bubbles flow A -> B ---------- */
  K.tubePoint = function (A, B, bend, u) {
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
    const C = [mx - (dy / L) * bend, my + (dx / L) * bend];
    const x = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0], y = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1];
    return [x, y, Math.atan2(2 * (1 - u) * (C[1] - A[1]) + 2 * u * (B[1] - C[1]), 2 * (1 - u) * (C[0] - A[0]) + 2 * u * (B[0] - C[0]))];
  };
  K.tube = function (ctx, A, B, opt) {
    const o = Object.assign({ p: 1, state: "plain", bend: 40, label: "", seed: 340, trim: 70, w: 16 }, opt || {});
    if (o.p <= 0) return;
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u0 = clamp(o.trim / L, 0, 0.45), u1 = 1 - u0, N = 24, pts = [];
    for (let i = 0; i <= N; i++) pts.push(K.tubePoint(A, B, o.bend, lerp(u0, u1, (i / N) * o.p)));
    const hot = o.state === "hot", al = o.state === "dim" ? 0.35 : 1, xy = pts.map((q) => [q[0], q[1]]);
    if (hot) K.line(ctx, xy, { stroke: "rgba(190,255,200,0.6)", w: o.w * 2.6, boil: 1, seed: o.seed + 5, taper: false });
    K.line(ctx, xy, { stroke: P.ink, w: o.w + 7, boil: 0.9, seed: o.seed, alpha: al, taper: false });
    K.line(ctx, xy, { stroke: hot ? P.glass : P.pane, w: o.w, boil: 0.9, seed: o.seed + 1, alpha: al, taper: false });
    for (let i = 0; i < 5; i++) { /* bubbles */
      const u = ((K.now * (hot ? 0.5 : 0.18) + i / 5) % 1) * o.p, q = K.tubePoint(A, B, o.bend, lerp(u0, u1, u));
      K.dot(ctx, q[0], q[1], o.w * 0.28, "#ffffff", P.ink, 1.5, o.seed + 10 + i);
    }
    if (o.label && o.p > 0.6) { const q = K.tubePoint(A, B, o.bend, 0.5); K.tag(ctx, q[0], q[1] - 34, o.label, { a: (o.p - 0.6) / 0.4, seed: o.seed + 20 }); }
  };
  /* ---------- paper tag on a string ---------- */
  K.tag = function (ctx, x, y, str, opt) {
    const o = Object.assign({ a: 1, size: 30, seed: 360, font: K.FONT.mono, weight: 600, fill: P.paper, color: P.ink }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = K.textW(ctx, str, o.size, o.weight, o.font) + 40, h = o.size + 20;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(hs(o.seed, 2) * 0.06 + Math.sin(K.now * 1.7 + o.seed) * 0.02);
    K.shape(ctx, [[-w / 2 + 14, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2 + 14, h / 2], [-w / 2, 0]], { fill: o.fill, w: 3.2, boil: 0.8, seed: o.seed, shade: { color: P.paperShade, dx: 0, dy: -6 } });
    K.dot(ctx, -w / 2 + 12, 0, 4, P.wall, P.ink, 2, o.seed + 1);
    K.text(ctx, str, 7, 1, { size: o.size, weight: o.weight, font: o.font, fill: o.color });
    ctx.restore();
  };

  /* ---------- brass gauge: value 0..1 on a 240 deg dial, readout below ---------- */
  K.gauge = function (ctx, x, y, r, v, opt) {
    const o = Object.assign({ a: 1, seed: 380, readout: "", zones: true }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.ellipsePts(0, 0, r + 18, r + 18, 24), { fill: P.brass, w: 5, boil: 0.8, seed: o.seed, shade: { color: P.brassDark, dx: -12, dy: -12 }, rim: 3 });
    K.shape(ctx, K.ellipsePts(0, 0, r, r, 24), { fill: P.paper, w: 4, boil: 0.7, seed: o.seed + 1 });
    const A0 = Math.PI * 0.833, A1 = Math.PI * 2.167;
    if (o.zones) [[0, 0.6, P.good], [0.6, 0.85, P.test], [0.85, 1, P.bad]].forEach((z) => { ctx.save(); ctx.strokeStyle = z[2]; ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, lerp(A0, A1, z[0]), lerp(A0, A1, z[1])); ctx.stroke(); ctx.restore(); });
    for (let i = 0; i <= 10; i++) { const an = lerp(A0, A1, i / 10); K.line(ctx, [[Math.cos(an) * r * 0.66, Math.sin(an) * r * 0.66], [Math.cos(an) * r * (i % 5 ? 0.72 : 0.6), Math.sin(an) * r * (i % 5 ? 0.72 : 0.6)]], { stroke: P.ink, w: 3, boil: 0.4, seed: o.seed + 10 + i, taper: false }); }
    const an = lerp(A0, A1, clamp(v, 0, 1)) + Math.sin(K.now * 9) * 0.01;
    K.shape(ctx, [[Math.cos(an) * r * 0.78, Math.sin(an) * r * 0.78], [Math.cos(an + 1.57) * 7, Math.sin(an + 1.57) * 7], [Math.cos(an + 3.14) * 16, Math.sin(an + 3.14) * 16], [Math.cos(an - 1.57) * 7, Math.sin(an - 1.57) * 7]], { fill: P.bad, w: 3, boil: 0.5, seed: o.seed + 30 });
    K.dot(ctx, 0, 0, 9, P.brassDark, P.ink, 3, o.seed + 31);
    if (o.readout) { K.shape(ctx, K.rrectPts(-r * 0.5, r * 0.32, r, r * 0.34, 6), { fill: P.board, w: 3, boil: 0.5, seed: o.seed + 32 }); K.text(ctx, o.readout, 0, r * 0.49, { size: r * 0.22, weight: 600, font: K.FONT.mono, fill: P.chalk }); }
    ctx.restore();
  };

  /* ---------- catalogue index card (table). rows[0] = header; hi = highlighted row ---------- */
  K.card = function (ctx, x, y, cols, rows, opt) {
    const o = Object.assign({ a: 1, size: 30, rowH: 54, seed: 400, hi: -1, reveal: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = cols.reduce((s, c) => s + c, 0) + 48, h = rows.length * o.rowH + 44;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(-0.012);
    K.shape(ctx, K.rrectPts(-w / 2, -h / 2, w, h, 14), { fill: P.paper, w: 4.5, boil: 0.9, seed: o.seed, shade: { color: P.paperShade, dx: -12, dy: -12 } });
    K.line(ctx, [[-w / 2 + 70, -h / 2 + 8], [-w / 2 + 70, h / 2 - 8]], { stroke: P.bad, w: 2.5, boil: 0.5, seed: o.seed + 1, alpha: 0.6 }); /* index-card margin rule */
    const shown = Math.ceil(rows.length * o.reveal);
    rows.slice(0, shown).forEach((r, ri) => {
      const ry = -h / 2 + 22 + ri * o.rowH + o.rowH / 2;
      if (ri === o.hi) { ctx.save(); ctx.globalAlpha = 0.5; K.shape(ctx, K.rectPts(-w / 2 + 12, ry - o.rowH / 2 + 4, w - 24, o.rowH - 8, 3), { fill: P.glass, stroke: null, w: 0, boil: 0.8, seed: o.seed + ri }); ctx.restore(); }
      else if (ri) K.line(ctx, [[-w / 2 + 12, ry + o.rowH / 2], [w / 2 - 12, ry + o.rowH / 2]], { stroke: "rgba(79,154,122,0.35)", w: 2, boil: 0.4, seed: o.seed + 50 + ri });
      let cx = -w / 2 + 24;
      r.forEach((cell, ci) => { K.text(ctx, cell, cx + cols[ci] / 2, ry, { size: o.size, weight: ri === 0 ? 700 : 500, font: ri === 0 ? K.FONT.display : K.FONT.mono, fill: ri === 0 ? P.glassDeep : P.ink }); cx += cols[ci]; });
      if (ri === 0) K.line(ctx, [[-w / 2 + 12, ry + o.rowH / 2], [w / 2 - 12, ry + o.rowH / 2]], { stroke: P.ink, w: 3, boil: 0.6, seed: o.seed + 49, taper: false });
    });
    ctx.restore();
  };

  /* ---------- chalkboard in a brass deco frame (formula, written letter by letter) ---------- */
  K.board = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 52, seed: 420, write: 1, font: K.FONT.mono }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.decoFrame(ctx, -w / 2, -h / 2, w, h, { seed: o.seed, fill: P.board, bw: 18, step: 20 });
    for (let i = 0; i < 5; i++) { ctx.save(); ctx.globalAlpha = 0.07; K.pathOf(ctx, K.blobPts(hs(i, o.seed) * w * 0.4, hs(i + 9, o.seed) * h * 0.3, 90, 28, 9, i, 0.3), true); ctx.fillStyle = P.chalk; ctx.fill(); ctx.restore(); }
    const lh = o.size * 1.32, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const str = typeof ln === "string" ? ln : ln.t, col = typeof ln === "string" ? P.chalk : ln.c || P.chalk;
      const n = Math.floor(str.length * clamp(o.write * lines.length - i, 0, 1));
      if (n > 0) K.text(ctx, str.slice(0, n), -w / 2 + 40, top + i * lh, { size: o.size, weight: 500, font: o.font, fill: col, align: "left" });
    });
    ctx.restore();
  };

  /* ---------- seed-packet rack (bullets): each item pops on its own beat ---------- */
  K.packets = function (ctx, x, y, w, items, opt) {
    const o = Object.assign({ a: 1, size: 38, seed: 440, shown: 99, colors: [P.leaf, P.test, P.glassDark, P.bad, P.copper] }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.size * 1.9, h = items.length * lh + 50;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.woodLight, w: 5, boil: 0.9, seed: o.seed, shade: { color: P.wood, dx: 0, dy: -14 } });
    items.forEach((it, i) => {
      const g = clamp(o.shown - i, 0, 1); if (g <= 0) return;
      const s = K.E.back(g, 2), yy = -h / 2 + 25 + lh / 2 + i * lh;
      ctx.save(); ctx.translate(0, yy); ctx.scale(s, s);
      K.shape(ctx, K.rectPts(-w / 2 + 20, -lh / 2 + 6, w - 40, lh - 12, 4), { fill: P.paper, w: 3.5, boil: 0.7, seed: o.seed + 10 + i, shade: { color: P.paperShade, dx: 0, dy: -6 } });
      K.shape(ctx, K.rectPts(-w / 2 + 20, -lh / 2 + 6, 22, lh - 12, 2), { fill: o.colors[i % o.colors.length], w: 3, boil: 0.6, seed: o.seed + 20 + i });
      K.seed(ctx, -w / 2 + 80, 0, o.size * 0.38, { seed: o.seed + 30 + i });
      K.text(ctx, it, -w / 2 + 120, 2, { size: o.size, weight: 500, font: K.FONT.text, fill: P.ink, align: "left" });
      ctx.restore();
    });
    ctx.restore();
  };

  /* ---------- typewriter page (code). Python-ish highlighting, typed out ---------- */
  const KW = /^(def|return|import|from|as|for|in|if|else|elif|while|class|with|lambda|None|True|False|and|or|not|yield|try|except)$/;
  K.typewriter = function (ctx, x, y, w, lines, opt) {
    const o = Object.assign({ a: 1, size: 28, seed: 460, typed: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.size * 1.5, h = lines.length * lh + 90;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.paper, w: 4, boil: 0.9, seed: o.seed, shade: { color: P.paperShade, dx: 14, dy: 0 } });
    K.shape(ctx, K.rrectPts(-w / 2 - 50, h / 2 - 16, w + 100, 44, 20), { fill: "#2b3a31", w: 4.5, boil: 0.8, seed: o.seed + 1, rim: 2 }); /* platen */
    [-1, 1].forEach((sd, i) => K.dot(ctx, sd * (w / 2 + 50), h / 2 + 6, 20, P.brass, P.ink, 3.5, o.seed + 2 + i));
    ctx.save(); ctx.font = `500 ${o.size}px ${K.FONT.mono}`; const cw = ctx.measureText("M").width; ctx.restore();
    const total = lines.reduce((s, l) => s + l.length, 0); let budget = Math.floor(total * o.typed);
    lines.forEach((ln, i) => {
      if (budget <= 0) return; const vis = ln.slice(0, budget); budget -= ln.length;
      const yy = -h / 2 + 40 + lh / 2 + i * lh; let col = 0;
      const toks = vis.match(/#.*$|"[^"]*"?|'[^']*'?|[A-Za-z_][A-Za-z0-9_]*|[0-9][0-9_.]*|\s+|./g) || [];
      toks.forEach((tk) => {
        const c = tk.startsWith("#") ? "#7d8a76" : KW.test(tk) ? P.glassDeep : /^[0-9]/.test(tk) ? P.copper : /^["']/.test(tk) ? P.bad : P.ink;
        K.text(ctx, tk, -w / 2 + 40 + col * cw, yy, { size: o.size, weight: KW.test(tk) ? 600 : 500, font: K.FONT.mono, fill: c, align: "left" });
        col += tk.length;
      });
    });
    ctx.restore();
  };

  /* ---------- decision tree plant: binary splits grow level by level ----------
     grow 0..depth (fractional = the level in progress); leaves: values shown on fruit tags */
  K.treePlant = function (ctx, x, y, s, opt) {
    const o = Object.assign({ grow: 3, depth: 3, seed: 480, spread: 230, ratio: 2.1, levelH: 120, leaves: null, sway: 1, hot: -1 }, opt || {});
    if (o.grow <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const sw = Math.sin(K.now * 1.6 + o.seed) * 3 * o.sway;
    const trunkTop = [sw, -o.levelH * 0.9];
    const g0 = clamp(o.grow, 0, 1);
    K.hose(ctx, [[0, 0], [sw * 0.5, -o.levelH * 0.45 * g0], [trunkTop[0], trunkTop[1] * g0]], 18, P.wood, o.seed, 7);
    const nodes = [[trunkTop, 0, 0]];
    let leafI = 0;
    for (let d = 0; d < o.depth; d++) {
      const g = clamp(o.grow - 1 - d + 1, 0, 1) * clamp(o.grow - d, 0, 1);
      const next = [];
      nodes.filter((n) => n[1] === d).forEach((n) => {
        [-1, 1].forEach((sd) => {
          const span = o.spread / Math.pow(o.ratio, d), end = [n[0][0] + sd * span, n[0][1] - o.levelH];
          const cur = [lerp(n[0][0], end[0], K.E.out3(g)), lerp(n[0][1], end[1], K.E.out3(g))];
          if (g > 0) K.hose(ctx, [n[0], [lerp(n[0][0], cur[0], 0.5), lerp(n[0][1], cur[1], 0.5) + 10], cur], 13 - d * 2.5, P.wood, o.seed + d * 10 + (n[2] * 2 + (sd > 0 ? 1 : 0)), 6);
          next.push([cur, d + 1, n[2] * 2 + (sd > 0 ? 1 : 0), g]);
        });
        if (g > 0) K.dot(ctx, n[0][0], n[0][1], 12 - d * 2, P.brass, P.ink, 3, o.seed + 70 + d); /* split knot */
      });
      next.forEach((n) => nodes.push(n));
    }
    /* leaves at the tips */
    nodes.filter((n) => n[1] === o.depth).forEach((n) => {
      const g = n[3]; if (g <= 0) return;
      const sc = K.E.back(clamp((g - 0.4) / 0.6, 0, 1), 2.4);
      if (sc <= 0) return;
      ctx.save(); ctx.translate(n[0][0], n[0][1]); ctx.scale(sc, sc);
      K.shape(ctx, K.blobPts(0, -20, 50, 42, 11, o.seed + n[2], 0.2), { fill: leafI === o.hot ? P.leafLight : P.leaf, w: 4, boil: 0.9, seed: o.seed + 90 + n[2], shade: { color: P.leafDark, dx: -10, dy: -10 }, dots: { gap: 8, alpha: 0.2 } });
      if (o.leaves && o.leaves[leafI] != null) K.text(ctx, String(o.leaves[leafI]), 0, -18, { size: 36, weight: 600, font: K.FONT.mono, fill: P.paper, stroke: P.ink, w: 5 });
      ctx.restore(); leafI++;
    });
    ctx.restore();
  };

  /* ---------- neural-net vine: layers of bud-neurons joined by tendrils ----------
     grow 0..layers.length (fractional = layer in progress), pulse 0..1 travels input -> output */
  K.netVine = function (ctx, x, y, s, opt) {
    const o = Object.assign({ layers: [3, 4, 4, 2], grow: 4, seed: 520, w: 520, h: 380, pulse: -1 }, opt || {});
    if (o.grow <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const L = o.layers.length, pos = o.layers.map((n, li) => Array.from({ length: n }, (_, i) => [(-o.w / 2 + (o.w * li) / (L - 1)), -o.h / 2 + (o.h * (i + 0.5)) / n + Math.sin(K.now * 1.8 + li + i) * 4]));
    /* stem from the pot up to the input layer */
    K.hose(ctx, [[0, o.h / 2 + 150], [-o.w * 0.3, o.h / 2 + 60], [pos[0][Math.floor(pos[0].length / 2)][0], pos[0][Math.floor(pos[0].length / 2)][1]]], 12, P.stem, o.seed, 6);
    for (let li = 0; li < L - 1; li++) {
      const g = clamp(o.grow - li - 1 + 0.5, 0, 1); if (g <= 0) continue;
      pos[li].forEach((a, i) => pos[li + 1].forEach((b, j) => {
        const e = [lerp(a[0], b[0], g), lerp(a[1], b[1], g)], mid = [lerp(a[0], e[0], 0.5), lerp(a[1], e[1], 0.5) + hs(i * 7 + j, o.seed + li) * 18];
        K.line(ctx, [a, mid, e], { stroke: P.stem, w: 4.5, boil: 0.6, seed: o.seed + li * 50 + i * 7 + j, alpha: 0.85 });
      }));
    }
    pos.forEach((layer, li) => {
      const g = clamp(o.grow - li, 0, 1); if (g <= 0) return;
      const sc = K.E.back(g, 2.6), hot = o.pulse >= 0 && Math.abs(o.pulse * (L - 1) - li) < 0.5;
      layer.forEach((p, i) => {
        ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(sc, sc);
        if (hot) K.glow(ctx, 0, 0, 60, P.glow, 0.8);
        for (let k = 0; k < 5; k++) { const an = (k / 5) * K.TAU + li; K.shape(ctx, K.ellipsePts(Math.cos(an) * 16, Math.sin(an) * 16, 14, 10, 8, an), { fill: hot ? P.brassLight : P.test, w: 2.6, boil: 0.5, seed: o.seed + 200 + li * 20 + i * 5 + k }); }
        K.dot(ctx, 0, 0, 11, hot ? P.paper : P.brass, P.ink, 3, o.seed + 300 + li * 10 + i);
        ctx.restore();
      });
    });
    ctx.restore();
  };

  /* ---------- art-deco marquee (titles). u = drop-in 0..1, returns the inner text box ---------- */
  K.marquee = function (ctx, cx, cy, w, h, u, opt) {
    const o = Object.assign({ seed: 560, chase: 0, bulbs: 1 }, opt || {});
    if (u <= 0) return null;
    ctx.save();
    /* chains from the ceiling */
    [-1, 1].forEach((sd, i) => { for (let k = 0; k < 9; k++) { const yy = cy - h / 2 - 34 - k * 34; K.shape(ctx, K.ellipsePts(cx + sd * w * 0.36, yy, 9, 16, 8), { fill: null, stroke: P.brassDark, w: 4, boil: 0.5, seed: o.seed + i * 20 + k }); } });
    /* stepped ziggurat crest */
    const crest = [[cx - 220, cy - h / 2], [cx - 220, cy - h / 2 - 30], [cx - 130, cy - h / 2 - 30], [cx - 130, cy - h / 2 - 60], [cx + 130, cy - h / 2 - 60], [cx + 130, cy - h / 2 - 30], [cx + 220, cy - h / 2 - 30], [cx + 220, cy - h / 2]];
    K.shape(ctx, crest, { fill: P.brass, w: 5, boil: 0.9, seed: o.seed + 50, shade: { color: P.brassDark, dx: 0, dy: -12 }, rim: 2.5 });
    K.sunburst(ctx, cx, cy - h / 2 - 4, 54, { n: 14, c1: "rgba(138,99,34,0.65)", rot: Math.PI });
    K.decoFrame(ctx, cx - w / 2, cy - h / 2, w, h, { seed: o.seed, fill: P.glassDeep, bw: 30, step: 30 });
    /* inner pinstripe */
    K.shape(ctx, K.rectPts(cx - w / 2 + 16, cy - h / 2 + 16, w - 32, h - 32, 4), { fill: null, stroke: P.brassLight, w: 3, boil: 0.6, seed: o.seed + 60 });
    /* bulbs around the frame: every third one lit in a chasing pattern */
    if (o.bulbs) {
      const per = 2 * (w + h) + 120, n = Math.floor(per / 52);
      for (let i = 0; i < n; i++) {
        const d = (i / n) * per; let bx, by; const W2 = w + 60, H2 = h + 60;
        if (d < W2) { bx = cx - W2 / 2 + d; by = cy - H2 / 2; } else if (d < W2 + H2) { bx = cx + W2 / 2; by = cy - H2 / 2 + (d - W2); } else if (d < 2 * W2 + H2) { bx = cx + W2 / 2 - (d - W2 - H2); by = cy + H2 / 2; } else { bx = cx - W2 / 2; by = cy + H2 / 2 - (d - 2 * W2 - H2); }
        const lit = (i + Math.floor(o.chase)) % 3 === 0;
        if (lit) K.glow(ctx, bx, by, 34, "rgba(255,240,180,0.9)", 0.9);
        K.dot(ctx, bx, by, 9, lit ? "#fff6cf" : P.brassDark, P.ink, 2.5, o.seed + 100 + i);
      }
    }
    ctx.restore();
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  };
})(LK);
