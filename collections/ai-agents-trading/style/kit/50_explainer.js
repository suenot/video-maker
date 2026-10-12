/* ============================================================
   KIT 50 EXPLAINER: slide content as objects on the neon trading floor.
   Never draw a flat slide. Each primitive is a physical thing:
     graph node   -> agent pod: round server with a ticker/icon     K.node
     graph edge   -> neon cable with travelling signal + LED tag    K.edge, K.edgePoint, K.tag
     big number   -> seven-segment scoreboard in a bezel           K.scoreboard
     table        -> green-screen terminal window, rows typed in    K.termTable
     formula      -> hologram panel projected from a floor emitter  K.holo
     chart        -> CRT monitor: line / bar / candle series        K.monitorChart
     bullets      -> task board; each bullet a lit pixel-icon LED   K.taskBoard
     code         -> retro terminal (Python highlight), typed out   K.terminal
     cycle/loop   -> ring of icon nodes with a running light        K.loopRing
     title        -> neon tube sign (text is DOM or K.text)         K.neonSign
   All take `a` (appear 0..1) and pop with a back ease on the beat.
   Text never boils; frames and tubes do (gently).
   ============================================================ */
var AK = window.AK || (window.AK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));
  K.popS = popS;

  /* ---------- agent pod (graph node) ---------- */
  K.node = function (ctx, x, y, s, opt) {
    const o = Object.assign({ label: "", icon: null, color: P.cyan, a: 1, seed: 1, hot: 0, r: 70 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * a, s * a);
    if (o.hot > 0) K.glow(ctx, 0, 0, o.r * 2.4, K.rgba(o.color, 0.9), o.hot);
    K.shape(ctx, K.ellipsePts(0, o.r * 0.9, o.r * 0.95, o.r * 0.3, 16), { fill: P.ink, stroke: null, w: 0, boil: 0.4, seed: o.seed + 1, alpha: 0.5 });
    K.shape(ctx, K.ellipsePts(0, 0, o.r, o.r, 20), { fill: P.metalDark, w: 6, boil: 0.7, seed: o.seed, shade: { color: P.ink, dx: -10, dy: -10, a: 0.6 }, rim: { color: o.color, dx: 6, dy: 6 } });
    K.shape(ctx, K.ellipsePts(0, 0, o.r * 0.72, o.r * 0.72, 18), { fill: P.screen, w: 4, boil: 0.5, seed: o.seed + 2 });
    K.neon(ctx, K.ellipsePts(0, 0, o.r * 0.86, o.r * 0.86, 20), { color: o.color, w: 4, closed: true, on: 0.6 + 0.4 * o.hot, seed: o.seed + 3, boil: 0.3 });
    if (o.icon) K.pix(ctx, o.icon, 0, o.label ? -o.r * 0.18 : 0, o.r * (o.label ? 0.09 : 0.12), o.color, { glow: 0.45 });
    if (o.label) K.text(ctx, o.label, 0, o.icon ? o.r * 0.36 : 2, { size: o.r * (o.icon ? 0.26 : o.label.length > 3 ? 0.34 : 0.42), font: K.FONT.pixel, fill: "#ffffff", glow: o.color, glowR: 10 });
    ctx.restore();
  };

  /* ---------- cable edge between two points ---------- */
  K.edgePoint = function (A, B, bend, u) {
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
    const C = [mx - (dy / L) * bend, my + (dx / L) * bend];
    const x = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0];
    const y = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1];
    const tx = 2 * (1 - u) * (C[0] - A[0]) + 2 * u * (B[0] - C[0]), ty = 2 * (1 - u) * (C[1] - A[1]) + 2 * u * (B[1] - C[1]);
    return [x, y, Math.atan2(ty, tx)];
  };
  /* p draw progress; state "plain" | "hot" | "dim"; pulses travel A->B when hot */
  K.edge = function (ctx, A, B, opt) {
    const o = Object.assign({ p: 1, state: "plain", bend: 40, label: "", seed: 1, trim: 80, color: P.cyan, w: 8, lu: 0.5, labelSize: 22 }, opt || {});
    if (o.p <= 0) return;
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u0 = clamp(o.trim / L, 0, 0.45), u1 = 1 - u0, N = 26, pts = [];
    for (let i = 0; i <= N; i++) { const q = K.edgePoint(A, B, o.bend, lerp(u0, u1, (i / N) * o.p)); pts.push([q[0], q[1]]); }
    const hot = o.state === "hot", dim = o.state === "dim", col = hot ? P.yellow : o.color;
    ctx.save(); if (dim) ctx.globalAlpha *= 0.35;
    K.line(ctx, pts, { stroke: P.ink, w: o.w + 8, boil: 0.6, seed: o.seed });
    K.neon(ctx, pts, { color: col, w: o.w * 0.6, on: hot ? 1 : 0.55, seed: o.seed + 1, boil: 0 });
    if (o.p >= 1) for (let k = 0; k < (hot ? 3 : 1); k++) {
      const u = (K.now * (hot ? 0.9 : 0.4) + k / 3 + hash(o.seed, 3)) % 1, q = K.edgePoint(A, B, o.bend, lerp(u0, u1, u));
      K.glow(ctx, q[0], q[1], o.w * 3.5, K.rgba(col, 0.9), 1); K.dot(ctx, q[0], q[1], o.w * 0.55, "#ffffff", null, 0, o.seed + 5 + k);
    }
    ctx.restore();
    if (o.label && o.p > 0.6) { const q = K.edgePoint(A, B, o.bend, o.lu); K.tag(ctx, q[0], q[1] - 4, o.label, { a: clamp((o.p - 0.6) / 0.4, 0, 1) * (dim ? 0.5 : 1), hot, seed: o.seed + 9, size: o.labelSize }); }
  };
  /* LED chip label (numbers, tickers) */
  K.tag = function (ctx, x, y, str, opt) {
    const o = Object.assign({ a: 1, hot: false, size: 22, seed: 1, color: P.cyan, font: K.FONT.pixel }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = K.textW(ctx, str, o.size, 400, o.font) + 28, h = o.size + 22, col = o.hot ? P.yellow : o.color;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rrPts(-w / 2, -h / 2, w, h, 10, 2), { fill: "#070a1e", w: 4.5, boil: 0.5, seed: o.seed, rim: { color: col, dx: 0, dy: 3, a: 0.7 } });
    K.text(ctx, str, 0, 2, { size: o.size, font: o.font, fill: col, glow: col, glowR: 8 });
    ctx.restore();
  };

  /* ---------- scoreboard: big number in seven-segment LEDs ----------
     lines: [{ v: "+12.4%", c: colour }] or strings; label: small pixel caption (ticker) */
  K.scoreboard = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, seed: 11, label: "", bump: 0, color: P.yellow }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const bump = 1 + 0.12 * Math.sin(clamp(o.bump, 0, 1) * Math.PI);
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rrPts(-w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 22, 3), { fill: P.metalDark, w: 6, boil: 0.8, seed: o.seed, shade: { color: P.ink, dx: -8, dy: -8, a: 0.6 }, rim: { color: P.violet, a: 0.8 } });
    K.shape(ctx, K.rrPts(-w / 2, -h / 2, w, h, 12, 3), { fill: "#05060f", w: 4.5, boil: 0.5, seed: o.seed + 1 });
    /* bolts */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((c, i) => K.dot(ctx, c[0] * (w / 2 + 6), c[1] * (h / 2 + 6), 4.5, P.metal, P.ink, 2, o.seed + 3 + i));
    const top = o.label ? 22 : 0, n = lines.length, lh = (h - 40 - top) / n;
    if (o.label) K.text(ctx, o.label, 0, -h / 2 + 26, { size: 20, font: K.FONT.pixel, fill: P.cyan, glow: P.cyan, glowR: 8 });
    lines.forEach((ln, i) => {
      const v = typeof ln === "string" ? ln : ln.v, c = typeof ln === "string" ? o.color : ln.c || o.color;
      const dh = Math.min(lh * 0.78, (w - 50) / Math.max(1, K.seg7W(v, 1)));
      ctx.save(); ctx.translate(0, -h / 2 + 20 + top + lh * (i + 0.5)); ctx.scale(bump, bump);
      K.seg7(ctx, v, 0, 0, dh, c);
      ctx.restore();
    });
    ctx.restore();
  };

  /* ---------- terminal table (green screen) ----------
     cols: widths; rows: arrays (row 0 = header); hi: highlighted row; reveal 0..1 */
  K.termTable = function (ctx, x, y, cols, rows, opt) {
    const o = Object.assign({ a: 1, size: 26, rowH: 50, seed: 21, hi: -1, reveal: 1, title: "" }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = cols.reduce((s, c) => s + c, 0) + 40, h = rows.length * o.rowH + 76;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    termWindow(ctx, w, h, o.seed, o.title);
    const shown = rows.length * o.reveal;
    rows.forEach((r, ri) => {
      const g = clamp(shown - ri, 0, 1); if (g <= 0) return;
      const ry = -h / 2 + 56 + ri * o.rowH + o.rowH / 2;
      if (ri === o.hi) { ctx.save(); ctx.fillStyle = K.rgba(P.green, 0.85); ctx.shadowColor = P.green; ctx.shadowBlur = 14; ctx.fillRect(-w / 2 + 14, ry - o.rowH / 2 + 4, w - 28, o.rowH - 8); ctx.restore(); }
      let cx = -w / 2 + 20;
      r.forEach((cell, ci) => {
        const str = String(cell), nCh = Math.ceil(str.length * clamp(g * 1.5, 0, 1));
        const col = ri === o.hi ? P.term : ri === 0 ? P.pink : P.green;
        K.text(ctx, str.slice(0, nCh), cx + cols[ci] / 2, ry, { size: o.size, weight: ri === 0 ? 700 : 500, font: K.FONT.mono, fill: col, glow: ri === o.hi ? null : col, glowR: 6 });
        cx += cols[ci];
      });
      if (ri === 0) K.line(ctx, [[-w / 2 + 16, ry + o.rowH / 2], [w / 2 - 16, ry + o.rowH / 2]], { stroke: P.pink, w: 2.5, boil: 0.3, seed: o.seed + 50, alpha: 0.7 });
    });
    ctx.restore();
  };
  function termWindow(ctx, w, h, seed, title) {
    K.shape(ctx, K.rrPts(-w / 2, -h / 2, w, h, 16, 3), { fill: P.term, w: 6, boil: 0.7, seed, rim: { color: P.cyan, dx: 4, dy: 4, a: 0.6 }, glow: K.rgba(P.cyan, 0.35), glowR: 30 });
    K.shape(ctx, K.rrPts(-w / 2, -h / 2, w, 36, 16, 2).map((p) => [p[0], Math.min(p[1], -h / 2 + 36)]), { fill: P.termEdge, w: 4, boil: 0.5, seed: seed + 1 });
    [P.loss, P.yellow, P.green].forEach((c, i) => K.dot(ctx, -w / 2 + 24 + i * 24, -h / 2 + 18, 7, c, P.ink, 2.5, seed + 2 + i));
    if (title) K.text(ctx, title, 0, -h / 2 + 19, { size: 16, font: K.FONT.pixel, fill: P.cyan });
    ctx.save(); ctx.fillStyle = "rgba(0,0,0,0.25)"; for (let yy = -h / 2 + 38; yy < h / 2 - 4; yy += 5) ctx.fillRect(-w / 2 + 6, yy, w - 12, 1.5); ctx.restore();
  }
  K.termWindow = termWindow;

  /* ---------- hologram formula panel (projected from a floor emitter) ----------
     lines: strings or {t, c}; write 0..1 types them letter by letter */
  K.holo = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 54, seed: 31, write: 1, font: K.FONT.mono, emitter: true }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y);
    if (o.emitter) {
      K.shape(ctx, K.rrPts(-90, h / 2 + 70, 180, 34, 14, 2), { fill: P.metalDark, w: 5, boil: 0.5, seed: o.seed + 9, rim: { color: P.cyan, a: 0.7 } });
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha *= 0.18 * a; ctx.fillStyle = P.cyan;
      ctx.beginPath(); ctx.moveTo(-70, h / 2 + 72); ctx.lineTo(70, h / 2 + 72); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.scale(1, a);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = K.rgba(P.cyan, 0.12); K.pathOf(ctx, K.rrPts(-w / 2, -h / 2, w, h, 14, 3), true); ctx.fill();
    ctx.fillStyle = K.rgba(P.cyan, 0.08); for (let yy = -h / 2; yy < h / 2; yy += 7) ctx.fillRect(-w / 2, yy, w, 2.5);
    ctx.restore();
    K.neon(ctx, K.rrPts(-w / 2, -h / 2, w, h, 14, 3), { color: P.cyan, w: 4, closed: true, on: K.flick(K.now, o.seed, 0.3), seed: o.seed, boil: 0.4 });
    const lh = o.size * 1.3, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const str = typeof ln === "string" ? ln : ln.t, col = typeof ln === "string" ? "#dffaff" : ln.c || "#dffaff";
      const n = Math.floor(str.length * clamp(o.write * lines.length - i, 0, 1));
      if (n > 0) K.text(ctx, str.slice(0, n), -w / 2 + 40, top + i * lh, { size: o.size, weight: 500, font: o.font, fill: col, align: "left", glow: col === "#dffaff" ? P.cyan : col, glowR: 14 });
    });
    ctx.restore();
  };

  /* ---------- chart on a CRT monitor ----------
     series: [{ data, color, kind: "line" | "bar" | "candle" }]; candle data = [[o,h,l,c], ...] */
  K.monitorChart = function (ctx, x, y, w, h, series, opt) {
    const o = Object.assign({ a: 1, draw: 1, seed: 41, yMin: null, yMax: null, xLabels: [], title: "", grid: true }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    K.wallScreen(ctx, x - w / 2, y - h / 2, w, h, (c, W, H) => K.plot(c, W, H, series, o), { a, seed: o.seed });
  };
  /* chart body, reusable inside any screen (origin top-left of the glass) */
  K.plot = function (ctx, W, H, series, o) {
    o = Object.assign({ draw: 1, yMin: null, yMax: null, xLabels: [], title: "", grid: true, seed: 41 }, o || {});
    const pl = 56, pr = W - 30, pt = o.title ? 64 : 28, pb = H - (o.xLabels.length ? 52 : 28);
    if (o.title) K.text(ctx, o.title, W / 2, 32, { size: 24, font: K.FONT.pixel, fill: P.cyan, glow: P.cyan, glowR: 8 });
    if (o.grid) { ctx.save(); ctx.strokeStyle = K.rgba(P.violet, 0.35); ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= 4; i++) { const yy = lerp(pt, pb, i / 4); ctx.moveTo(pl, yy); ctx.lineTo(pr, yy); } ctx.stroke(); ctx.restore(); }
    let mn = o.yMin, mx = o.yMax;
    if (mn == null || mx == null) { const all = series.flatMap((s) => (s.kind === "candle" ? s.data.flat() : s.data)); mn = mn == null ? Math.min(...all) : mn; mx = mx == null ? Math.max(...all) : mx; }
    const X = (i, n) => pl + 16 + ((pr - pl - 32) * i) / Math.max(1, n - 1), Y = (v) => pb - ((v - mn) / (mx - mn || 1)) * (pb - pt);
    series.forEach((s, si) => {
      const n = s.data.length, col = s.color || P.cyan;
      if (s.kind === "bar" || s.kind === "candle") {
        const bw = ((pr - pl) / n) * (s.kind === "bar" ? 0.55 : 0.5);
        s.data.forEach((v, i) => {
          const g = clamp(o.draw * n - i, 0, 1); if (g <= 0) return;
          ctx.save();
          if (s.kind === "bar") {
            const top = lerp(pb, Y(v), K.E.back(g, 1.4)), c = s.colors ? s.colors[i] : col;
            ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 12; ctx.fillRect(X(i, n) - bw / 2, top, bw, pb - top);
          } else {
            const [op, hi, lo, cl] = v, up = cl >= op, c = up ? P.gain : P.loss, k = K.E.out3(g), mid = (Y(op) + Y(cl)) / 2;
            ctx.strokeStyle = c; ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 10; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(X(i, n), lerp(mid, Y(hi), k)); ctx.lineTo(X(i, n), lerp(mid, Y(lo), k)); ctx.stroke();
            const t1 = lerp(mid, Math.min(Y(op), Y(cl)), k), t2 = lerp(mid, Math.max(Y(op), Y(cl)), k);
            ctx.fillRect(X(i, n) - bw / 2, t1, bw, Math.max(3, t2 - t1));
          }
          ctx.restore();
        });
      } else {
        const k = o.draw * (n - 1), pts = [];
        for (let i = 0; i <= Math.floor(k); i++) pts.push([X(i, n), Y(s.data[i])]);
        const fr = k - Math.floor(k), i0 = Math.floor(k);
        if (i0 < n - 1 && fr > 0) pts.push([lerp(X(i0, n), X(i0 + 1, n), fr), lerp(Y(s.data[i0]), Y(s.data[i0 + 1]), fr)]);
        if (pts.length > 1) {
          ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0][0], pb); pts.forEach((p) => ctx.lineTo(p[0], p[1])); ctx.lineTo(pts[pts.length - 1][0], pb); ctx.closePath();
          const gr = ctx.createLinearGradient(0, pt, 0, pb); gr.addColorStop(0, K.rgba(col, 0.35)); gr.addColorStop(1, K.rgba(col, 0)); ctx.fillStyle = gr; ctx.fill(); ctx.restore();
          K.neon(ctx, pts, { color: col, w: 5, seed: o.seed + 30 + si, boil: 0 });
          const hd = pts[pts.length - 1]; K.glow(ctx, hd[0], hd[1], 26, K.rgba(col, 0.9), 1); K.dot(ctx, hd[0], hd[1], 6, "#ffffff", null, 0, o.seed + 40 + si);
        }
      }
    });
    o.xLabels.forEach((lb, i) => K.text(ctx, lb, X(i, o.xLabels.length), pb + 28, { size: 18, font: K.FONT.pixel, fill: P.shellShade }));
  };

  /* ---------- task board (bullets): each bullet pops with a lit pixel icon ----------
     items: strings or {t, icon, c}; shown: number visible (fractional = popping); done: items checked */
  K.taskBoard = function (ctx, x, y, w, items, opt) {
    const o = Object.assign({ a: 1, size: 38, seed: 51, shown: 99, title: "", lineH: null, done: 0 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.lineH || o.size * 1.7, h = items.length * lh + (o.title ? 116 : 56);
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rrPts(-w / 2, -h / 2, w, h, 24, 3), { fill: P.wallLight, w: 6, boil: 0.8, seed: o.seed, shade: { color: P.ink, dx: -10, dy: -10, a: 0.5 }, rim: { color: P.pink, dx: 5, dy: 5, a: 0.8 } });
    K.shape(ctx, K.rrPts(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 14, 3), { fill: "#0a0d26", w: 4, boil: 0.5, seed: o.seed + 3 });
    let yy = -h / 2 + 28 + lh / 2;
    if (o.title) { K.text(ctx, o.title, 0, -h / 2 + 62, { size: o.size * 1.05, font: K.FONT.display, fill: P.pink, glow: P.pink, glowR: 12 }); yy += 56; }
    items.forEach((it, i) => {
      const g = clamp(o.shown - i, 0, 1); if (g <= 0) return;
      const s = K.E.back(g, 2), str = typeof it === "string" ? it : it.t, done = i < o.done;
      const icon = done ? "check" : (typeof it === "string" ? null : it.icon) || "play", col = done ? P.green : (typeof it === "string" ? null : it.c) || P.cyan;
      ctx.save(); ctx.translate(-w / 2 + 64, yy + i * lh); ctx.scale(s, s);
      K.shape(ctx, K.rrPts(-24, -24, 48, 48, 10, 2), { fill: P.screen, w: 4, boil: 0.4, seed: o.seed + 10 + i });
      K.pix(ctx, icon, 0, 0, 5, col, { glow: 1 });
      K.text(ctx, str, 46, 2, { size: o.size, weight: 500, font: K.FONT.text, fill: "#eef0ff", align: "left" });
      ctx.restore();
    });
    ctx.restore();
  };

  /* ---------- retro terminal: code typed out (Python highlight) ---------- */
  const KW = /^(def|class|return|import|from|for|in|if|elif|else|while|with|as|async|await|yield|lambda|not|and|or|is|None|True|False|try|except|pass|break|continue|self)$/;
  K.terminal = function (ctx, x, y, w, lines, opt) {
    const o = Object.assign({ a: 1, size: 26, seed: 61, typed: 1, title: "agent.py" }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.size * 1.5, h = lines.length * lh + 80;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    termWindow(ctx, w, h, o.seed, o.title);
    ctx.save(); ctx.font = `500 ${o.size}px ${K.FONT.mono}`; const cw = ctx.measureText("M").width; ctx.restore();
    const total = lines.reduce((s, l) => s + l.length, 0); let budget = Math.floor(total * o.typed), cur = null;
    lines.forEach((ln, i) => {
      const yy = -h / 2 + 62 + lh / 2 + i * lh;
      K.text(ctx, String(i + 1), -w / 2 + 30, yy, { size: o.size * 0.8, weight: 500, font: K.FONT.mono, fill: P.termEdge });
      if (budget <= 0) return;
      const vis = ln.slice(0, budget); budget -= ln.length; let col = 0;
      const toks = vis.match(/#.*$|"[^"]*"?|'[^']*'?|[A-Za-z_][A-Za-z0-9_]*|[0-9][0-9_.]*|\s+|./g) || [];
      toks.forEach((tk) => {
        const c = tk.startsWith("#") ? "#5f6b9e" : KW.test(tk) ? P.pink : /^[0-9]/.test(tk) ? P.yellow : /^["']/.test(tk) ? P.green : P.cyan;
        K.text(ctx, tk, -w / 2 + 62 + col * cw, yy, { size: o.size, weight: KW.test(tk) ? 700 : 500, font: K.FONT.mono, fill: c, align: "left" });
        col += tk.length;
      });
      cur = [-w / 2 + 62 + col * cw, yy];
    });
    if (cur && Math.floor(K.now * 2.5) % 2 === 0) { ctx.fillStyle = P.green; ctx.fillRect(cur[0] + 2, cur[1] - o.size * 0.5, o.size * 0.55, o.size); }
    ctx.restore();
  };

  /* ---------- loop ring: N icon nodes on a circle with a running light ----------
     steps: [{ icon, color }], active: fractional index of the light (0..N), a appear */
  K.loopRing = function (ctx, x, y, R, steps, opt) {
    const o = Object.assign({ a: 1, active: 0, seed: 81, nodeR: 74, start: -Math.PI / 2, lit: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const n = steps.length, ang = (i) => o.start + (i / n) * K.TAU;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    const ring = []; for (let i = 0; i < 64; i++) ring.push([Math.cos((i / 64) * K.TAU) * R, Math.sin((i / 64) * K.TAU) * R]);
    K.shape(ctx, ring, { fill: null, w: 22, stroke: P.ink, boil: 0.4, seed: o.seed });
    K.neon(ctx, ring, { color: P.violet, w: 6, closed: true, on: 0.55, seed: o.seed + 1, boil: 0 });
    /* arrow heads between nodes (direction of the loop) */
    for (let i = 0; i < n; i++) {
      const am = ang(i + 0.5), px = Math.cos(am) * R, py = Math.sin(am) * R;
      ctx.save(); ctx.translate(px, py); ctx.rotate(am + Math.PI / 2);
      K.shape(ctx, [[16, 0], [-10, -14], [-4, 0], [-10, 14]], { fill: P.violet, w: 4, boil: 0.4, seed: o.seed + 10 + i });
      ctx.restore();
    }
    /* running light */
    if (o.lit > 0) {
      const al = ang(o.active), lx = Math.cos(al) * R, ly = Math.sin(al) * R;
      K.glow(ctx, lx, ly, 70, K.rgba(P.yellow, 0.95), o.lit); K.dot(ctx, lx, ly, 11, "#ffffff", null, 0, o.seed + 20);
    }
    steps.forEach((s, i) => {
      const ax = Math.cos(ang(i)) * R, ay = Math.sin(ang(i)) * R, d = Math.abs(((o.active - i) % n + n + n / 2) % n - n / 2), hot = clamp(1 - d * 1.6, 0, 1);
      K.node(ctx, ax, ay, 1 + 0.15 * hot, { icon: s.icon, color: s.color || P.cyan, r: o.nodeR, hot, seed: o.seed + 30 + i * 5 });
    });
    ctx.restore();
  };

  /* ---------- neon tube sign frame (returns the inner box for DOM text) ---------- */
  K.neonSign = function (ctx, cx, cy, w, h, opt) {
    const o = Object.assign({ on: 1, seed: 91, color: P.pink, color2: P.cyan, a: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return null;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(a, a);
    /* backing plate with hanging chains */
    [-1, 1].forEach((sd, i) => K.line(ctx, [[sd * (w / 2 - 80), -h / 2 - 220], [sd * (w / 2 - 80), -h / 2]], { stroke: P.metal, w: 5, boil: 0.4, seed: o.seed + 20 + i }));
    K.shape(ctx, K.rrPts(-w / 2, -h / 2, w, h, 40, 4), { fill: "#0b0c2a", w: 7, boil: 0.7, seed: o.seed, shade: { color: P.ink, dx: -10, dy: -12, a: 0.6 }, dots: { gap: 12, r: 2.2, alpha: 0.35, color: P.inkSoft } });
    K.neon(ctx, K.rrPts(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36, 28, 4), { color: o.color, w: 7, closed: true, on: o.on, seed: o.seed + 1, boil: 0.3 });
    K.neon(ctx, K.rrPts(-w / 2 + 38, -h / 2 + 38, w - 76, h - 76, 18, 4), { color: o.color2, w: 4, closed: true, on: o.on * 0.8, seed: o.seed + 2, boil: 0.3 });
    ctx.restore();
    return { x: cx - (w * a) / 2, y: cy - (h * a) / 2, w: w * a, h: h * a };
  };
  void hs;
})(AK);
