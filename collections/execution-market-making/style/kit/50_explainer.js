/* ============================================================
   KIT 50 EXPLAINER: slide content as objects of the railway station.
   Never draw a flat slide. Each primitive is a physical thing:
     big number      -> split-flap display               K.flap
     table           -> departure board                  K.board
     formula         -> enamel sign with screws          K.plaque
     chart           -> framed travel poster             K.poster
     bullets         -> row of tickets                   K.tickets
     code            -> teletype paper tape              K.teletype
     graph node/edge -> rail-map stop / line             K.stop / K.route
     small number    -> luggage tag                      K.tag
     title           -> hanging enamel sign              K.sign
   All take `a` (appear 0..1) and pop with a back ease on a beat.
   Text never boils; frames, plates and paper edges do.
   ============================================================ */
var SK = window.SK || (window.SK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));
  K.popS = popS;
  /* scale around (x, y) for a pop */
  function popAt(ctx, x, y, a) { const s = popS(a); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); return s; }
  const screws = (ctx, x, y, w, h, inset, seed) => [[x + inset, y + inset], [x + w - inset, y + inset], [x + inset, y + h - inset], [x + w - inset, y + h - inset]].forEach((q, i) => {
    K.dot(ctx, q[0], q[1], 6, P.creamShade, P.ink, 2, seed + i);
    K.line(ctx, [[q[0] - 4, q[1] - 2], [q[0] + 4, q[1] + 2]], { w: 1.8, boil: 0.2, seed: seed + 10 + i });
  });

  /* ---------- split-flap tile: one character; flip 0..1 shows prev -> ch ---------- */
  K.flapChar = function (ctx, x, y, w, h, ch, opt) {
    const o = Object.assign({ flip: 1, prev: " ", size: h * 0.74, color: P.flapText, seed: 1 }, opt || {});
    const r = w * 0.14;
    K.shape(ctx, K.rrectPts(x, y, w, h, r, 3), { fill: P.flap, key: P.ink, w: 2.5, boil: 0.3, seed: o.seed, reg: 0 });
    const f = clamp(o.flip, 0, 1), cy = y + h / 2;
    const glyph = (c, clipTop) => {
      ctx.save(); ctx.beginPath(); ctx.rect(x, clipTop ? y : cy, w, h / 2); ctx.clip();
      K.text(ctx, c, x + w / 2, cy + o.size * 0.04, { size: o.size, weight: 700, font: K.FONT.mono, fill: o.color });
      ctx.restore();
    };
    /* static halves: top shows new char once the flap has fallen past the hinge */
    glyph(f < 1 ? o.prev : ch, true);
    glyph(f < 0.5 ? o.prev : ch, false);
    glyph(ch, true); /* new top is behind the falling flap */
    if (f < 1) {
      /* the falling flap: first half shows prev top squashing, second half new bottom growing */
      ctx.save();
      if (f < 0.5) {
        const k = Math.cos(f * Math.PI);
        ctx.beginPath(); ctx.rect(x, y, w, h / 2); ctx.clip();
        K.shape(ctx, K.rectPts(x, y, w, h / 2, 1), { fill: P.flap, key: null, boil: 0, reg: 0 });
        ctx.translate(0, cy); ctx.scale(1, k); ctx.translate(0, -cy);
        K.shape(ctx, K.rrectPts(x, y, w, h / 2 + r, r, 3), { fill: P.flap, key: null, boil: 0, reg: 0 });
        K.text(ctx, o.prev, x + w / 2, cy + o.size * 0.04, { size: o.size, weight: 700, font: K.FONT.mono, fill: o.color });
      } else {
        const k = Math.cos((1 - f) * Math.PI);
        ctx.beginPath(); ctx.rect(x, cy, w, h / 2); ctx.clip();
        ctx.translate(0, cy); ctx.scale(1, -k); ctx.scale(1, -1); ctx.translate(0, -cy);
        K.shape(ctx, K.rrectPts(x, cy - r, w, h / 2 + r, r, 3), { fill: P.flap, key: null, boil: 0, reg: 0 });
        K.text(ctx, ch, x + w / 2, cy + o.size * 0.04, { size: o.size, weight: 700, font: K.FONT.mono, fill: o.color });
      }
      ctx.restore();
    }
    ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = K.lw(ctx, 2.5); ctx.beginPath(); ctx.moveTo(x + 2, cy); ctx.lineTo(x + w - 2, cy); ctx.stroke(); ctx.restore();
  };
  /* split-flap display centred on (x, y). flip 0..1 runs the characters left to right */
  K.flap = function (ctx, x, y, str, opt) {
    const o = Object.assign({ h: 90, a: 1, flip: 1, prev: "", color: P.flapText, seed: 200, frame: true, colors: null }, opt || {});
    if (o.a <= 0) return;
    const n = str.length, w = o.h * 0.66, gap = o.h * 0.07, W = n * w + (n - 1) * gap;
    ctx.save(); popAt(ctx, x, y, o.a);
    if (o.frame) K.shape(ctx, K.rrectPts(x - W / 2 - 18, y - o.h / 2 - 16, W + 36, o.h + 32, 14, 3), { fill: P.ink, key: P.ink, w: 3, seed: o.seed, reg: 0, shade: { color: "#1c1c20", dx: 0, dy: 10 } });
    for (let i = 0; i < n; i++) {
      const fi = clamp(o.flip * (n + 2) - i, 0, 1);
      K.flapChar(ctx, x - W / 2 + i * (w + gap), y - o.h / 2, w, o.h, str[i], { flip: fi, prev: o.prev[i] || " ", seed: o.seed + 3 + i, color: o.colors ? o.colors[i] || o.color : o.color });
    }
    ctx.restore();
    return W + 36;
  };

  /* ---------- departure board (table): x, y = top-left ---------- */
  K.board = function (ctx, x, y, cols, rows, opt) {
    const o = Object.assign({ a: 1, hi: -1, size: 28, rowH: 50, seed: 220, shown: 99, headColor: P.mustard }, opt || {});
    if (o.a <= 0) return;
    const W = cols.reduce((a, b) => a + b, 0) + 40, H = rows.length * o.rowH + 40;
    ctx.save(); popAt(ctx, x + W / 2, y, o.a);
    K.shape(ctx, K.rrectPts(x, y, W, H, 16, 3), { fill: P.board, w: 3.5, seed: o.seed, reg: 0, shade: { color: "#1c1c20", dx: 0, dy: 12 } });
    K.shape(ctx, K.rrectPts(x + 10, y + 22, W - 20, o.rowH - 4, 8, 2), { fill: o.headColor, w: 2.5, seed: o.seed + 1 });
    rows.forEach((row, ri) => {
      if (ri > o.shown) return;
      const ry = y + 20 + ri * o.rowH + o.rowH / 2;
      if (ri === o.hi) K.shape(ctx, K.rrectPts(x + 12, ry - o.rowH / 2 + 4, W - 24, o.rowH - 8, 6, 2), { fill: P.tealDark, w: 2, seed: o.seed + 5 });
      let cx = x + 20;
      row.forEach((cell, ci) => {
        const head = ri === 0;
        K.text(ctx, String(cell), cx + 12, ry + 1, { size: o.size, weight: head ? 700 : 500, font: K.FONT.mono, align: "left", fill: head ? P.ink : ri === o.hi ? P.mustardLight : P.cream });
        cx += cols[ci];
      });
    });
    screws(ctx, x, y, W, H, -2, o.seed + 30);
    ctx.restore();
  };

  /* ---------- enamel sign (formula): lines written letter by letter ---------- */
  K.plaque = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, write: 1, size: 44, seed: 240, color: P.enamel, shade: P.tealDark }, opt || {});
    if (o.a <= 0) return;
    ctx.save(); popAt(ctx, x + w / 2, y + h / 2, o.a);
    K.shape(ctx, K.rrectPts(x, y, w, h, 26, 4), { fill: o.color, w: 3.5, seed: o.seed, shade: { color: o.shade, dx: 0, dy: 12 }, tone: { color: P.cream, gap: 12, r: 1.8, r2: 0, dir: Math.PI * 0.35, alpha: 0.18 } });
    K.shape(ctx, K.rrectPts(x + 14, y + 14, w - 28, h - 28, 16, 4), { fill: null, key: P.cream, w: 3.5, seed: o.seed + 1 });
    screws(ctx, x, y, w, h, 28, o.seed + 10);
    const total = lines.reduce((s, l) => s + (typeof l === "string" ? l : l.t).length, 0);
    let budget = Math.floor(o.write * total + 0.001);
    const lh = o.size * 1.3, y0 = y + h / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const str = typeof ln === "string" ? ln : ln.t, col = typeof ln === "string" ? P.cream : ln.c || P.mustardLight;
      const shown = str.slice(0, Math.max(0, budget)); budget -= str.length;
      if (shown) K.text(ctx, shown, x + 48, y0 + i * lh, { size: o.size, weight: 700, font: K.FONT.mono, align: "left", fill: col });
    });
    ctx.restore();
  };

  /* ---------- travel poster (chart): bars grow, lines draw left to right ----------
     series: [{data: [...], color, kind: "line" | "bars"}]; opt.draw 0..1 */
  K.poster = function (ctx, x, y, w, h, series, opt) {
    const o = Object.assign({ a: 1, draw: 1, seed: 260, title: "", xLabels: null, min: null, max: null, sun: true }, opt || {});
    if (o.a <= 0) return;
    ctx.save(); popAt(ctx, x + w / 2, y + h / 2, o.a);
    K.shape(ctx, K.rectPts(x - 16, y - 16, w + 32, h + 32, 3), { fill: P.mustard, w: 3.5, seed: o.seed, shade: { color: P.mustardDark, dx: 10, dy: 10 } });
    K.shape(ctx, K.rectPts(x, y, w, h, 3), { fill: P.cream, w: 2.5, seed: o.seed + 1, tone: { color: P.mustardLight, gap: 12, r: 0, r2: 3.6, dir: -Math.PI / 2, alpha: 0.6 } });
    const px = x + 70, py = y + (o.title ? 80 : 40), pw = w - 110, ph = h - (o.title ? 80 : 40) - (o.xLabels ? 70 : 40);
    if (o.title) K.text(ctx, o.title, x + w / 2, y + 44, { size: 36, weight: 800, fill: P.ink });
    let mn = o.min, mx = o.max;
    if (mn == null || mx == null) { const all = series.flatMap((s) => s.data); mn = mn == null ? Math.min(0, ...all) : mn; mx = mx == null ? Math.max(...all) * 1.1 : mx; }
    const X = (i, n) => px + (n > 1 ? (pw * i) / (n - 1) : pw / 2), Y = (v) => py + ph - ((v - mn) / (mx - mn)) * ph;
    K.line(ctx, [[px, py - 10], [px, py + ph], [px + pw + 10, py + ph]], { w: 3.5, seed: o.seed + 2 });
    series.forEach((s, si) => {
      const n = s.data.length;
      if (s.kind === "bars") {
        const bw = (pw / n) * 0.66;
        s.data.forEach((v, i) => {
          const g = K.E.back(clamp(o.draw * (n + 3) / 3 - i * 0.33, 0, 1), 1.6);
          if (g <= 0) return;
          const cx = px + (pw * (i + 0.5)) / n, top = lerp(py + ph, Y(v), g);
          K.shape(ctx, K.rectPts(cx - bw / 2, top, bw, py + ph - top, 1), { fill: s.color || P.teal, w: 2.5, seed: o.seed + 10 + si * 40 + i, shade: { color: P.tealDark, dx: -bw * 0.28, dy: 0 } });
        });
      } else {
        const m = o.draw * (n - 1); if (m <= 0) return;
        const pts = [];
        for (let i = 0; i <= Math.floor(m); i++) pts.push([X(i, n), Y(s.data[i])]);
        const f = m - Math.floor(m);
        if (f > 0 && Math.floor(m) < n - 1) { const i = Math.floor(m); pts.push([lerp(X(i, n), X(i + 1, n), f), lerp(Y(s.data[i]), Y(s.data[i + 1]), f)]); }
        if (pts.length > 1) {
          K.line(ctx, pts, { key: P.ink, w: (s.w || 6) + 5, seed: o.seed + 80 + si, smooth: !!s.smooth });
          K.line(ctx, pts, { key: s.color || P.tomato, w: s.w || 6, seed: o.seed + 80 + si, smooth: !!s.smooth });
        }
        const last = pts[pts.length - 1];
        if (s.dot !== false) K.dot(ctx, last[0], last[1], 9, s.color || P.tomato, P.ink, 2.5, o.seed + 90 + si);
      }
    });
    if (o.xLabels) o.xLabels.forEach((l, i, arr) => K.text(ctx, l, px + (pw * (i + 0.5)) / arr.length, py + ph + 34, { size: 26, weight: 500, font: K.FONT.mono, fill: P.inkSoft }));
    ctx.restore();
  };

  /* ---------- tickets (bullets): each ticket pops on its own beat ---------- */
  K.tickets = function (ctx, x, y, w, items, opt) {
    const o = Object.assign({ a: 1, shown: 99, size: 34, gap: 18, seed: 300, h: 76 }, opt || {});
    if (o.a <= 0) return;
    items.forEach((it, i) => {
      const a = clamp(o.shown - i, 0, 1) * clamp(o.a, 0, 1); if (a <= 0) return;
      const ty = y + i * (o.h + o.gap);
      ctx.save(); popAt(ctx, x, ty + o.h / 2, a); ctx.translate(x, ty); ctx.rotate((hash(i, o.seed) - 0.5) * 0.04); ctx.translate(-x, -ty);
      const pts = K.rrectPts(x, ty, w, o.h, 8, 2);
      K.shape(ctx, pts, { fill: i % 2 ? P.cream : P.mustardLight, w: 3, seed: o.seed + i * 5, shade: { color: P.creamShade, dx: 0, dy: -8 } });
      /* perforated stub */
      ctx.save(); ctx.setLineDash([6, 7]); K.line(ctx, [[x + 84, ty + 6], [x + 84, ty + o.h - 6]], { w: 2.5, boil: 0, seed: o.seed + i * 5 + 1 }); ctx.restore();
      K.text(ctx, String(i + 1), x + 42, ty + o.h / 2 + 1, { size: o.size * 1.05, weight: 800, font: K.FONT.mono, fill: P.teal });
      K.text(ctx, it, x + 108, ty + o.h / 2 + 1, { size: o.size, weight: 700, align: "left", fill: P.ink });
      ctx.restore();
    });
  };

  /* ---------- teletype tape (code): typed out character by character ---------- */
  const KW = /\b(fn|let|mut|for|in|if|else|return|def|import|from|while|struct|impl|pub|use|const|class|self)\b/;
  K.teletype = function (ctx, x, y, w, lines, opt) {
    const o = Object.assign({ a: 1, typed: 1, size: 26, seed: 320 }, opt || {});
    if (o.a <= 0) return;
    const lh = o.size * 1.5, h = lines.length * lh + 60;
    ctx.save(); popAt(ctx, x + w / 2, y, o.a);
    K.shape(ctx, K.rectPts(x, y, w, h, 4), { fill: P.cream, w: 3, seed: o.seed, shade: { color: P.creamShade, dx: -12, dy: 0 } });
    /* sprocket holes */
    ctx.save(); ctx.fillStyle = P.creamDeep;
    for (let yy = y + 16; yy < y + h - 8; yy += 22) { ctx.beginPath(); ctx.arc(x + 16, yy, 4.5, 0, K.TAU); ctx.arc(x + w - 16, yy, 4.5, 0, K.TAU); ctx.fill(); }
    ctx.restore();
    const total = lines.reduce((s, l) => s + l.length, 0);
    let budget = Math.floor(o.typed * total + 0.001);
    ctx.save(); ctx.font = `500 ${o.size}px ${K.FONT.mono}`; ctx.textBaseline = "middle";
    lines.forEach((ln, i) => {
      const str = ln.slice(0, Math.max(0, budget)); budget -= ln.length; if (!str) return;
      let cx = x + 44; const cy = y + 30 + lh / 2 + i * lh;
      const comment = str.indexOf("//") >= 0 ? str.indexOf("//") : str.indexOf("#");
      const toks = str.split(/(\s+|[(){}\[\],;:.<>=+\-*\/&|"]|"[^"]*")/).filter((q) => q !== "" && q != null);
      let pos = 0;
      toks.forEach((tk) => {
        let c = P.ink;
        if (comment >= 0 && pos >= comment) c = P.inkSoft;
        else if (KW.test(tk)) c = P.teal;
        else if (/^[0-9.]+$/.test(tk)) c = P.tomato;
        else if (/^".*"$/.test(tk)) c = P.mustardDark;
        ctx.fillStyle = c; ctx.font = `${KW.test(tk) ? 700 : 500} ${o.size}px ${K.FONT.mono}`;
        ctx.fillText(tk, cx, cy); cx += ctx.measureText(tk).width; pos += tk.length;
      });
      /* typing head */
      if (budget < 0 && budget > -ln.length) { ctx.fillStyle = P.tomato; ctx.fillRect(cx + 2, cy - o.size * 0.45, o.size * 0.55, o.size * 0.9); }
    });
    ctx.restore(); ctx.restore();
  };

  /* ---------- rail map (graph): stops and lines ---------- */
  K.routePoint = function (A, B, bend, u) {
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
    const C = [mx - (dy / L) * bend, my + (dx / L) * bend];
    const x = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0];
    const y = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1];
    const tx = 2 * (1 - u) * (C[0] - A[0]) + 2 * u * (B[0] - C[0]), ty = 2 * (1 - u) * (C[1] - A[1]) + 2 * u * (B[1] - C[1]);
    return [x, y, Math.atan2(ty, tx)];
  };
  K.route = function (ctx, A, B, opt) {
    const o = Object.assign({ p: 1, color: P.teal, bend: 0, w: 14, seed: 340, dim: false, label: "", lu: 0.5 }, opt || {});
    if (o.p <= 0) return;
    const pts = []; for (let i = 0; i <= 24; i++) pts.push(K.routePoint(A, B, o.bend, (i / 24) * o.p));
    const al = o.dim ? 0.35 : 1;
    K.line(ctx, pts, { key: P.ink, w: o.w + 6, seed: o.seed, boil: 0.5, alpha: al });
    K.line(ctx, pts, { key: o.color, w: o.w, seed: o.seed, boil: 0.5, alpha: al });
    if (o.label && o.p > 0.7) { const q = K.routePoint(A, B, o.bend, o.lu); K.tag(ctx, q[0], q[1] - 34, o.label, { a: (o.p - 0.7) / 0.3, seed: o.seed + 5 }); }
  };
  K.stop = function (ctx, x, y, r, opt) {
    const o = Object.assign({ a: 1, label: "", seed: 360, hot: 0, size: 30 }, opt || {});
    if (o.a <= 0) return;
    ctx.save(); popAt(ctx, x, y, o.a);
    if (o.hot > 0) K.rays(ctx, x, y, r * 1.4, r * 2.1, 12, { color: P.mustardDark, w: 3, alpha: o.hot, rot: K.now * 0.5 });
    K.dot(ctx, x, y, r, P.cream, P.ink, 5, o.seed);
    if (o.label) K.text(ctx, o.label, x, y + r + o.size * 0.9, { size: o.size, weight: 700, font: K.FONT.mono });
    ctx.restore();
  };
  /* luggage tag with a number */
  K.tag = function (ctx, x, y, str, opt) {
    const o = Object.assign({ a: 1, size: 30, seed: 380, color: P.cream, textColor: P.ink }, opt || {});
    if (o.a <= 0) return;
    ctx.save(); popAt(ctx, x, y, clamp(o.a, 0, 1));
    const w = K.textW(ctx, str, o.size, 700, K.FONT.mono) + 46, h = o.size * 1.5;
    K.shape(ctx, [[x - w / 2 + 16, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2 + 16, y + h / 2], [x - w / 2, y]], { fill: o.color, w: 2.5, seed: o.seed, boil: 0.4 });
    K.dot(ctx, x - w / 2 + 14, y, 4, P.ink, null, 0, o.seed + 1);
    K.text(ctx, str, x + 8, y + 1, { size: o.size, weight: 700, font: K.FONT.mono, fill: o.textColor });
    ctx.restore();
  };

  /* ---------- title sign: hangs from two chains, drops and swings in ----------
     u 0..1 entry; returns the sign box (screen space when drawn in screen space) */
  K.sign = function (ctx, cx, cy, w, h, u, opt) {
    const o = Object.assign({ seed: 400, color: P.enamel, shade: P.tealDark }, opt || {});
    if (u <= 0) return null;
    const drop = (1 - K.E.back(clamp(u, 0, 1), 1.6)) * -(cy + h);
    const sw = Math.sin(K.now * 1.7) * 0.6 * Math.PI / 180 + (1 - clamp(u * 1.3, 0, 1)) * 0.06 * Math.sin(u * 12);
    ctx.save(); ctx.translate(cx, cy + drop); ctx.rotate(sw);
    /* chains */
    [-w * 0.36, w * 0.36].forEach((xx, i) => {
      ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = K.lw(ctx, 3);
      for (let yy = -h / 2 - 8; yy > -cy - 400; yy -= 22) { ctx.beginPath(); ctx.ellipse(xx, yy, 5, 11, 0, 0, K.TAU); ctx.stroke(); }
      ctx.restore();
    });
    K.shape(ctx, K.rrectPts(-w / 2, -h / 2, w, h, 34, 5), { fill: o.color, w: 4, seed: o.seed, shade: { color: o.shade, dx: 0, dy: 16 }, tone: { color: P.cream, gap: 13, r: 2, r2: 0, dir: Math.PI * 0.3, alpha: 0.16 } });
    K.shape(ctx, K.rrectPts(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 22, 5), { fill: null, key: P.mustard, w: 5, seed: o.seed + 1 });
    screws(ctx, -w / 2, -h / 2, w, h, 34, o.seed + 10);
    ctx.restore();
    return { x: cx, y: cy + drop, w, h, rot: sw };
  };
})(SK);
