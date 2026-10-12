/* ============================================================
   KIT 50 EXPLAINER: slide content as objects of the Coral Exchange.
   Every primitive is a reef "screen": a rounded card with a navy outline,
   a flat sticker shadow and a coloured header tab with three bubbles.
     panel      -> the base card (cream or dark glass)          K.panel
     chart      -> candles / lines / indicators / histogram     K.chart  (+ K.genCandles, K.sma, K.alligator, K.ao, K.fractals)
     attractor  -> phase-space plot of a chaotic system         K.attractor
     manifold   -> wireframe surface with a path on it          K.manifold
     formula    -> dark glass board, typed letter by letter     K.formula
     table      -> cream table, header strip, highlighted row   K.table
     bullets    -> card of bullets, each pops on its beat       K.bullets
     code       -> dark code card with syntax colours           K.code
     book       -> order book ladder, spread in sunshine        K.book
     badge      -> big number in a sunshine bubble              K.badge
     titlePlate -> wavy coral plate behind a DOM title          K.titlePlate
   All take `a` (appear 0..1, pops with a back ease) and draw progress
   parameters, so pops land on beats. Text never boils.
   ============================================================ */
var MK = window.MK || (window.MK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));
  K.popS = popS;

  /* ---------- base card. returns the inner content rect in local coords (centre 0,0) ---------- */
  K.panel = function (ctx, w, h, opt) {
    const o = Object.assign({ dark: false, tab: P.ask, title: "", seed: 201, titleSize: 30 }, opt || {});
    const fill = o.dark ? P.board : P.cream, shade = o.dark ? "#0a2048" : P.creamShade;
    K.shape(ctx, K.rrectPts(-w / 2, -h / 2, w, h, 28, 4), { fill, w: 6, boil: 0.7, seed: o.seed, shade: { color: shade, dx: 0, dy: -12 }, drop: { dx: 12, dy: 14 } });
    const th = 58;
    const tab = K.rrectPts(-w / 2, -h / 2, w, th, 28, 4).map((p) => [p[0], Math.min(p[1], -h / 2 + th)]); tab.sharp = true;
    K.shape(ctx, tab, { fill: o.tab, w: 6, boil: 0.6, seed: o.seed + 1 });
    [0, 1, 2].forEach((i) => K.dot(ctx, -w / 2 + 34 + i * 30, -h / 2 + th / 2, 9, i === 0 ? P.cream : i === 1 ? P.sun : P.kelpLight, P.ink, 3.5, o.seed + 2 + i));
    if (o.title) K.text(ctx, o.title, -w / 2 + 132, -h / 2 + th / 2 + 2, { size: o.titleSize, weight: 800, font: K.FONT.text, fill: "#ffffff", align: "left" });
    return { x0: -w / 2 + 28, y0: -h / 2 + th + 22, x1: w / 2 - 28, y1: h / 2 - 26 };
  };
  const enter = (ctx, x, y, a, rot) => { const s = popS(a); if (s <= 0) return false; ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s); return true; };

  /* ---------- data helpers (deterministic) ---------- */
  K.genCandles = function (n, seed, start, vol, drift) {
    const r = K.mulberry(seed || 1), out = []; let p = start || 100;
    for (let i = 0; i < n; i++) {
      const o = p, c = o + (r() - 0.5 + (drift || 0)) * (vol || 2) * 2;
      const hi = Math.max(o, c) + r() * (vol || 2) * 0.7, lo = Math.min(o, c) - r() * (vol || 2) * 0.7;
      out.push({ o, h: hi, l: lo, c }); p = c;
    }
    return out;
  };
  K.sma = function (v, n, shift) { const out = []; for (let i = 0; i < v.length; i++) { const j = i - (shift || 0); if (j < n - 1 || j >= v.length) { out.push(null); continue; } let s = 0; for (let k = 0; k < n; k++) s += v[j - k]; out.push(s / n); } return out; };
  /* Bill Williams Alligator on median price: jaw 13/8, teeth 8/5, lips 5/3 (SMA used as the smoothing) */
  K.alligator = function (cd) { const m = cd.map((c) => (c.h + c.l) / 2); return { jaw: K.sma(m, 13, 8), teeth: K.sma(m, 8, 5), lips: K.sma(m, 5, 3) }; };
  /* Awesome Oscillator: SMA5 - SMA34 of median price (n may be short: uses min(34, n)) */
  K.ao = function (cd, slow) { const m = cd.map((c) => (c.h + c.l) / 2), a = K.sma(m, 5), b = K.sma(m, slow || 34); return a.map((v, i) => (v == null || b[i] == null ? null : v - b[i])); };
  /* Bill Williams fractals: a high with two lower highs on each side (up), mirror for lows */
  K.fractals = function (cd) { const out = []; for (let i = 2; i < cd.length - 2; i++) { const h = cd[i].h, l = cd[i].l; if (h > cd[i - 1].h && h > cd[i - 2].h && h > cd[i + 1].h && h > cd[i + 2].h) out.push({ i, up: true }); if (l < cd[i - 1].l && l < cd[i - 2].l && l < cd[i + 1].l && l < cd[i + 2].l) out.push({ i, up: false }); } return out; };

  /* ---------- chart: candles + overlay lines + markers + optional histogram ----------
     opt: candles, lines [{data, color, w}], hist {data, frac}, fractals [{i, up}], marks [{i, v, kind: "buy"|"sell"}],
          draw 0..1 (left -> right), yMin, yMax, title, tab, a, band {lo, hi} (a horizontal spread band) */
  K.chart = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ a: 1, draw: 1, candles: null, lines: [], hist: null, fractals: [], marks: [], seed: 211, title: "", tab: P.bid, band: null, rot: 0, dark: false }, opt || {});
    if (!enter(ctx, x, y, o.a, o.rot)) return null;
    const r = K.panel(ctx, w, h, { tab: o.tab, title: o.title, seed: o.seed, dark: o.dark });
    const hf = o.hist ? (o.hist.frac || 0.28) : 0, gap = o.hist ? 18 : 0;
    const px0 = r.x0 + 12, px1 = r.x1 - 12, py0 = r.y0 + 8, py1 = r.y1 - (r.y1 - r.y0) * hf - gap;
    const n = o.candles ? o.candles.length : (o.lines[0] ? o.lines[0].data.length : 2);
    let mn = o.yMin, mx = o.yMax;
    if (mn == null || mx == null) {
      const all = [];
      if (o.candles) o.candles.forEach((c) => all.push(c.h, c.l));
      o.lines.forEach((l) => l.data.forEach((v) => v != null && all.push(v)));
      mn = mn == null ? Math.min(...all) : mn; mx = mx == null ? Math.max(...all) : mx; const pad = (mx - mn) * 0.08; mn -= pad; mx += pad;
    }
    const X = (i) => px0 + ((px1 - px0) * (i + 0.5)) / n, Y = (v) => py1 - ((v - mn) / (mx - mn || 1)) * (py1 - py0);
    /* grid */
    for (let k = 1; k < 4; k++) K.line(ctx, [[px0, lerp(py0, py1, k / 4)], [px1, lerp(py0, py1, k / 4)]], { stroke: o.dark ? P.grid : P.creamShade, w: 2.5, boil: 0.3, seed: o.seed + 10 + k });
    const shown = o.draw * n;
    if (o.band) { const b0 = Y(o.band.hi), b1 = Y(o.band.lo); ctx.save(); ctx.globalAlpha = 0.55; K.shape(ctx, K.rrectPts(px0, b0, px1 - px0, Math.max(6, b1 - b0), 6, 2), { fill: P.sun, stroke: null, w: 0, boil: 0.4, seed: o.seed + 19 }); ctx.restore(); }
    if (o.candles) {
      const bw = Math.max(6, ((px1 - px0) / n) * 0.56);
      o.candles.forEach((c, i) => {
        const g = clamp(shown - i, 0, 1); if (g <= 0) return;
        const upC = c.c >= c.o, col = upC ? P.up : P.down, cx = X(i), e = K.E.back(g, 1.6);
        const midV = (c.o + c.c) / 2, top = lerp(Y(midV), Y(Math.max(c.o, c.c)), e), bot = lerp(Y(midV), Y(Math.min(c.o, c.c)), e);
        K.line(ctx, [[cx, lerp(Y(midV), Y(c.h), e)], [cx, lerp(Y(midV), Y(c.l), e)]], { stroke: P.ink, w: 3.5, boil: 0.3, seed: o.seed + 20 + i });
        K.shape(ctx, K.rrectPts(cx - bw / 2, top, bw, Math.max(4, bot - top), 3, 1), { fill: col, w: 3.5, boil: 0.3, seed: o.seed + 60 + i });
      });
    }
    o.lines.forEach((l, li) => {
      const pts = [];
      l.data.forEach((v, i) => { if (v == null || i > shown - 0.5) return; pts.push([X(i), Y(v)]); });
      if (pts.length > 1) { K.line(ctx, pts, { stroke: P.ink, w: (l.w || 5) + 5, boil: 0.5, seed: o.seed + 120 + li }); K.line(ctx, pts, { stroke: l.color, w: l.w || 5, boil: 0.5, seed: o.seed + 120 + li }); }
    });
    o.fractals.forEach((f, k) => {
      if (f.i > shown - 2.5 || !o.candles) return; const c = o.candles[f.i], g = clamp(shown - f.i - 2.5, 0, 1), s = K.E.back(g, 2.5);
      const fx = X(f.i), fy = f.up ? Y(c.h) - 26 : Y(c.l) + 26;
      ctx.save(); ctx.translate(fx, fy); ctx.scale(s, s);
      K.shape(ctx, f.up ? [[0, -14], [12, 8], [-12, 8]] : [[0, 14], [12, -8], [-12, -8]], { fill: P.sun, w: 3.5, boil: 0.3, seed: o.seed + 200 + k, sharp: true });
      ctx.restore();
    });
    o.marks.forEach((m, k) => {
      if (m.i > shown - 0.5) return; const g = clamp(shown - m.i - 0.5, 0, 1);
      K.card(ctx, X(m.i), Y(m.v) + (m.kind === "buy" ? 64 : -64), 0.55, { kind: m.kind === "buy" ? "bid" : "ask", text: m.text || m.v.toFixed(1), a: g, seed: o.seed + 240 + k, rot: 0 });
      K.dot(ctx, X(m.i), Y(m.v), 10, m.kind === "buy" ? P.bid : P.ask, P.ink, 3.5, o.seed + 260 + k);
    });
    if (o.hist) {
      const hy0 = py1 + gap, hy1 = r.y1, d = o.hist.data, amax = Math.max(...d.filter((v) => v != null).map(Math.abs)) || 1, z = (hy0 + hy1) / 2;
      K.line(ctx, [[px0, z], [px1, z]], { stroke: o.dark ? P.grid : P.creamShade, w: 2.5, boil: 0.3, seed: o.seed + 300 });
      const bw = Math.max(5, ((px1 - px0) / n) * 0.6);
      d.forEach((v, i) => {
        if (v == null) return; const g = clamp(shown - i, 0, 1); if (g <= 0) return;
        const prev = d[i - 1], rising = prev == null || v >= prev, hh = (v / amax) * (hy1 - hy0) / 2 * K.E.back(g, 1.6);
        K.shape(ctx, K.rectPts(X(i) - bw / 2, Math.min(z, z - hh), bw, Math.max(3, Math.abs(hh)), 1), { fill: rising ? P.up : P.down, w: 3, boil: 0.3, seed: o.seed + 320 + i, sharp: true });
      });
    }
    ctx.restore();
    return { X: (i) => x + X(i), Y: (v) => y + Y(v) };
  };

  /* ---------- attractor: Lorenz system integrated once (RK4, fixed step), projected with a yaw ----------
     opt: draw 0..1, yaw (rad), a, title, color ramp from lilac to sunshine, head glow. Returns the head point. */
  let LORENZ = null;
  function lorenz() {
    if (LORENZ) return LORENZ;
    const s = 10, r = 28, b = 8 / 3, dt = 0.008, out = []; let p = [0.1, 0, 0];
    const f = (q) => [s * (q[1] - q[0]), q[0] * (r - q[2]) - q[1], q[0] * q[1] - b * q[2]];
    for (let i = 0; i < 4200; i++) {
      const k1 = f(p), k2 = f(p.map((v, j) => v + (dt / 2) * k1[j])), k3 = f(p.map((v, j) => v + (dt / 2) * k2[j])), k4 = f(p.map((v, j) => v + dt * k3[j]));
      p = p.map((v, j) => v + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
      if (i > 200 && i % 2 === 0) out.push([p[0], p[1], p[2] - 25]);
    }
    return (LORENZ = out);
  }
  K.attractor = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ a: 1, draw: 1, yaw: 0.5, pitch: 0.25, seed: 401, title: "", tab: P.lilac, rot: 0, scale: 1 }, opt || {});
    if (!enter(ctx, x, y, o.a, o.rot)) return;
    const r = K.panel(ctx, w, h, { dark: true, tab: o.tab, title: o.title, seed: o.seed });
    const cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2, sc = Math.min(r.x1 - r.x0, r.y1 - r.y0) / 58 * o.scale;
    const L = lorenz(), n = Math.floor(L.length * clamp(o.draw, 0, 1));
    const cyw = Math.cos(o.yaw), syw = Math.sin(o.yaw), cp = Math.cos(o.pitch), sp = Math.sin(o.pitch);
    const pr = (q) => { const X1 = q[0] * cyw - q[1] * syw, Y1 = q[0] * syw + q[1] * cyw; return [cx + X1 * sc, cy - (q[2] * cp - Y1 * sp) * sc]; };
    ctx.save(); ctx.beginPath(); ctx.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0); ctx.clip();
    ctx.lineWidth = K.lw(ctx, 3.2); ctx.lineCap = "round";
    const step = 6;
    for (let i = 1; i < n; i += step) {
      const u = i / L.length; ctx.strokeStyle = K.mix(P.lilac, P.sun, Math.pow(u, 1.4)); ctx.globalAlpha = 0.55 + 0.45 * (i / Math.max(1, n));
      ctx.beginPath(); const p0 = pr(L[i - 1]); ctx.moveTo(p0[0], p0[1]);
      for (let k = i; k < Math.min(n, i + step + 1); k++) { const q = pr(L[k]); ctx.lineTo(q[0], q[1]); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    let head = null;
    if (n > 1) { const hq = pr(L[n - 1]); K.glow(ctx, hq[0], hq[1], 50, "rgba(255,230,120,0.9)", 0.9); K.dot(ctx, hq[0], hq[1], 10, P.sun, P.ink, 3.5, o.seed + 5); head = [x + hq[0], y + hq[1]]; }
    ctx.restore();
    ctx.restore();
    return head; /* the moving point, in the caller's coordinates (no rotation / pop scale) */
  };

  /* ---------- manifold: wireframe surface z = f(u, v) with yaw; optional path on it ----------
     opt: f(u, v) in [-1, 1]^2 -> height, yaw, tilt, draw (grid reveal), path [[u, v], ...], pathDraw 0..1 */
  K.manifold = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ a: 1, draw: 1, yaw: 0.6, tilt: 0.55, seed: 451, title: "", tab: P.kelp, f: (u, v) => 0.55 * (u * u - v * v) + 0.18 * Math.sin(3 * u) * Math.cos(2 * v), path: null, pathDraw: 1, n: 16, rot: 0, dark: true }, opt || {});
    if (!enter(ctx, x, y, o.a, o.rot)) return;
    const r = K.panel(ctx, w, h, { dark: o.dark, tab: o.tab, title: o.title, seed: o.seed });
    const cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2 + 10, sc = Math.min(r.x1 - r.x0, (r.y1 - r.y0) * 1.3) * 0.36;
    const cyw = Math.cos(o.yaw), syw = Math.sin(o.yaw), ct = Math.cos(o.tilt), st = Math.sin(o.tilt);
    const pr = (u, v) => { const z = o.f(u, v), X1 = u * cyw - v * syw, Y1 = u * syw + v * cyw; return [cx + X1 * sc, cy + (Y1 * st - z * ct) * sc * 0.9, z]; };
    const N = o.n, rows = Math.ceil(N * clamp(o.draw, 0, 1) + 0.001);
    const lineCol = (z) => (z > 0 ? K.mix(P.sun, P.ask, clamp(z, 0, 1)) : K.mix(P.sun, P.bid, clamp(-z, 0, 1)));
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i <= N; i++) {
      if (i > rows) continue;
      const pts = []; for (let j = 0; j <= N; j++) { const a = -1 + (2 * i) / N, b = -1 + (2 * j) / N; pts.push(pass ? pr(b, a) : pr(a, b)); }
      const zAvg = pts.reduce((s, q) => s + q[2], 0) / pts.length;
      K.line(ctx, pts.map((q) => [q[0], q[1]]), { stroke: lineCol(zAvg), w: 3, boil: 0.4, seed: o.seed + pass * 50 + i });
    }
    if (o.path && o.pathDraw > 0) {
      const k = Math.max(2, Math.floor(o.path.length * clamp(o.pathDraw, 0, 1))), pts = o.path.slice(0, k).map((q) => pr(q[0], q[1]));
      K.line(ctx, pts.map((q) => [q[0], q[1]]), { stroke: P.ink, w: 13, boil: 0.5, seed: o.seed + 200 });
      K.line(ctx, pts.map((q) => [q[0], q[1]]), { stroke: "#ffffff", w: 7, boil: 0.5, seed: o.seed + 200 });
      const hq = pts[pts.length - 1]; K.glow(ctx, hq[0], hq[1], 40, "rgba(255,255,255,0.9)", 0.8); K.dot(ctx, hq[0], hq[1], 11, P.sun, P.ink, 3.5, o.seed + 201);
    }
    ctx.restore();
  };

  /* ---------- formula board: dark glass, lines typed letter by letter ----------
     lines: strings or {t, c} (c = colour of the key line) */
  K.formula = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 52, write: 1, seed: 501, title: "", tab: P.sun, font: K.FONT.mono, rot: 0, align: "left" }, opt || {});
    if (!enter(ctx, x, y, o.a, o.rot)) return;
    const r = K.panel(ctx, w, h, { dark: true, tab: o.tab, title: o.title, seed: o.seed });
    const lh = o.size * 1.35, cy = (r.y0 + r.y1) / 2, top = cy - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const str = typeof ln === "string" ? ln : ln.t, col = typeof ln === "string" ? P.chalk : ln.c || P.chalk;
      const k = Math.floor(str.length * clamp(o.write * lines.length - i, 0, 1));
      if (k <= 0) return;
      const tx = o.align === "center" ? 0 : r.x0 + 24;
      K.text(ctx, str.slice(0, k), tx, top + i * lh, { size: o.size, weight: 700, font: o.font, fill: col, align: o.align });
      if (k < str.length) { const cw = K.textW(ctx, str.slice(0, k), o.size, 700, o.font); K.shape(ctx, K.rectPts((o.align === "center" ? cw / 2 : r.x0 + 24 + cw) + 4, top + i * lh - o.size * 0.42, o.size * 0.12, o.size * 0.84, 1), { fill: P.sun, stroke: null, w: 0, boil: 0 }); }
    });
    ctx.restore();
  };

  /* ---------- table: header strip in the tab colour, highlighted row in sunshine ---------- */
  K.table = function (ctx, x, y, cols, rows, opt) {
    const o = Object.assign({ a: 1, size: 32, rowH: 58, seed: 551, hi: -1, reveal: 1, title: "", tab: P.bid, colColors: [], rot: 0 }, opt || {});
    const w = cols.reduce((s, c) => s + c, 0) + 56, h = rows.length * o.rowH + 58 + 48;
    if (!enter(ctx, x, y, o.a, o.rot)) return;
    const r = K.panel(ctx, w, h, { tab: o.tab, title: o.title, seed: o.seed });
    const shown = rows.length * clamp(o.reveal, 0, 1);
    rows.forEach((row, ri) => {
      const g = clamp(shown - ri, 0, 1); if (g <= 0) return;
      const ry = r.y0 + ri * o.rowH + o.rowH / 2 - 4;
      if (ri === o.hi) K.shape(ctx, K.rrectPts(r.x0 - 6, ry - o.rowH / 2 + 4, r.x1 - r.x0 + 12, o.rowH - 8, 14, 2), { fill: P.sun, w: 3.5, boil: 0.4, seed: o.seed + 10 + ri });
      let cx = r.x0;
      row.forEach((cell, ci) => {
        const head = ri === 0;
        K.text(ctx, cell, cx + cols[ci] / 2, ry, { size: head ? o.size * 0.82 : o.size, weight: head ? 800 : 700, font: head ? K.FONT.text : K.FONT.mono, fill: head ? P.inkSoft : (o.colColors[ci] || P.ink), alpha: g });
        cx += cols[ci];
      });
      if (ri === 0) K.line(ctx, [[r.x0, ry + o.rowH / 2], [r.x1, ry + o.rowH / 2]], { stroke: P.ink, w: 3.5, boil: 0.4, seed: o.seed + 50 });
    });
    ctx.restore();
  };

  /* ---------- bullet card: each bullet is a bubble that pops on its own beat ---------- */
  K.bullets = function (ctx, x, y, w, items, opt) {
    const o = Object.assign({ a: 1, size: 40, seed: 601, shown: 99, title: "", tab: P.kelp, lineH: null, rot: 0 }, opt || {});
    const lh = o.lineH || o.size * 1.7, h = items.length * lh + 58 + 60;
    if (!enter(ctx, x, y, o.a, o.rot)) return;
    const r = K.panel(ctx, w, h, { tab: o.tab, title: o.title, seed: o.seed });
    items.forEach((it, i) => {
      const g = clamp(o.shown - i, 0, 1); if (g <= 0) return;
      const s = K.E.back(g, 2.2), yy = r.y0 + lh / 2 + i * lh - 4;
      ctx.save(); ctx.translate(r.x0 + 26, yy); ctx.scale(s, s);
      K.dot(ctx, 0, 0, o.size * 0.3, [P.bid, P.ask, P.sun, P.kelp, P.lilac][i % 5], P.ink, 3.5, o.seed + 10 + i);
      K.text(ctx, it, o.size * 0.75, 2, { size: o.size, weight: 700, font: K.FONT.text, fill: P.ink, align: "left" });
      ctx.restore();
    });
    ctx.restore();
  };

  /* ---------- code card: dark glass, Python-ish highlighting, typed out ---------- */
  const KW = /^(def|return|if|else|elif|for|in|while|import|from|as|class|lambda|and|or|not|None|True|False|fn|let|mut|pub|struct|impl|use|match|const|async|await)$/;
  K.code = function (ctx, x, y, w, lines, opt) {
    const o = Object.assign({ a: 1, size: 30, seed: 651, typed: 1, title: "", tab: P.fan, rot: 0 }, opt || {});
    const lh = o.size * 1.5, h = lines.length * lh + 58 + 52;
    if (!enter(ctx, x, y, o.a, o.rot)) return;
    const r = K.panel(ctx, w, h, { dark: true, tab: o.tab, title: o.title, seed: o.seed });
    ctx.save(); ctx.font = `500 ${o.size}px ${K.FONT.mono}`; const cw = ctx.measureText("M").width; ctx.restore();
    const total = lines.reduce((s, l) => s + l.length, 0); let budget = Math.floor(total * clamp(o.typed, 0, 1));
    lines.forEach((ln, i) => {
      if (budget <= 0) return; const vis = ln.slice(0, budget); budget -= ln.length;
      const yy = r.y0 + lh / 2 + i * lh - 4; let col = 0;
      K.text(ctx, String(i + 1), r.x0 + 10, yy, { size: o.size * 0.8, weight: 500, font: K.FONT.mono, fill: P.grid, align: "left" });
      const toks = vis.match(/#.*$|\/\/.*$|"[^"]*"?|'[^']*'?|[A-Za-z_][A-Za-z0-9_]*|[0-9][0-9_.]*|\s+|./g) || [];
      toks.forEach((tk) => {
        const c = tk.startsWith("#") || tk.startsWith("//") ? "#7f9cc9" : KW.test(tk) ? P.ask : /^[0-9]/.test(tk) ? P.sun : /^["']/.test(tk) ? P.kelpLight : /^[A-Za-z_]/.test(tk) ? P.chalk : P.bid;
        K.text(ctx, tk, r.x0 + 56 + col * cw, yy, { size: o.size, weight: KW.test(tk) ? 700 : 500, font: K.FONT.mono, fill: c, align: "left" });
        col += tk.length;
      });
    });
    ctx.restore();
  };

  /* ---------- order book ladder: asks on top (coral), bids below (blue), the spread in sunshine ----------
     levels: { asks: [[price, size], ...] best first, bids: [[price, size], ...] best first }
     reveal 0..1 (levels pop from the middle out), spreadGlow 0..1 */
  K.book = function (ctx, x, y, w, levels, opt) {
    const o = Object.assign({ a: 1, reveal: 1, seed: 701, rowH: 62, size: 34, title: "", tab: P.ask, spreadGlow: 0, spreadText: "", rot: 0 }, opt || {});
    const na = levels.asks.length, nb = levels.bids.length, h = (na + nb) * o.rowH + 74 + 58 + 40;
    if (!enter(ctx, x, y, o.a, o.rot)) return null;
    const r = K.panel(ctx, w, h, { tab: o.tab, title: o.title, seed: o.seed });
    const maxS = Math.max(...levels.asks.concat(levels.bids).map((l) => l[1])), barW = (r.x1 - r.x0) * 0.5;
    const midY = r.y0 + na * o.rowH + 37;
    const row = (lv, k, side) => {
      const order = k, g = clamp(o.reveal * Math.max(na, nb) - order, 0, 1); if (g <= 0) return;
      const yy = side === "ask" ? midY - 37 - (k + 0.5) * o.rowH : midY + 37 + (k + 0.5) * o.rowH, e = K.E.back(g, 1.8);
      const bw = (lv[1] / maxS) * barW * e, col = side === "ask" ? P.ask : P.bid;
      K.shape(ctx, K.rrectPts(r.x1 - bw, yy - o.rowH * 0.36, Math.max(8, bw), o.rowH * 0.72, 10, 2), { fill: col, w: 3.5, boil: 0.4, seed: o.seed + (side === "ask" ? 10 : 40) + k, shade: { color: side === "ask" ? P.askDark : P.bidDark, dx: 0, dy: -6 } });
      K.text(ctx, lv[0], r.x0 + 10, yy + 1, { size: o.size, weight: 700, font: K.FONT.mono, fill: side === "ask" ? P.askDark : P.bidDark, align: "left", alpha: g });
      K.text(ctx, String(lv[1]), r.x1 - 14, yy + 1, { size: o.size * 0.8, weight: 700, font: K.FONT.mono, fill: "#ffffff", align: "right", alpha: g * (bw > 90 ? 1 : 0) });
    };
    levels.asks.forEach((lv, k) => row(lv, k, "ask"));
    levels.bids.forEach((lv, k) => row(lv, k, "bid"));
    /* spread band */
    if (o.spreadGlow > 0) K.glow(ctx, 0, midY, w * 0.45, "rgba(255,220,90,0.9)", 0.35 * o.spreadGlow);
    K.shape(ctx, K.rrectPts(r.x0 - 4, midY - 26, r.x1 - r.x0 + 8, 52, 18, 2), { fill: P.sun, w: 4, boil: 0.5, seed: o.seed + 90 });
    if (o.spreadText) K.text(ctx, o.spreadText, 0, midY + 1, { size: o.size * 0.82, weight: 700, font: K.FONT.mono, fill: P.ink });
    ctx.restore();
    return { midY: y + midY };
  };

  /* ---------- badge: a big number in a sunshine bubble (bumps when it changes) ---------- */
  K.badge = function (ctx, x, y, str, opt) {
    const o = Object.assign({ a: 1, size: 64, seed: 751, color: P.sun, dark: P.sunDark, textColor: P.ink, bump: 0, font: K.FONT.mono }, opt || {});
    const s = popS(o.a) * (1 + 0.12 * o.bump); if (s <= 0) return;
    const w = K.textW(ctx, str, o.size, 700, o.font) + o.size * 1.1, h = o.size * 1.7;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(hs(o.seed, 1) * 0.05);
    K.shape(ctx, K.rrectPts(-w / 2, -h / 2, w, h, h / 2, 4), { fill: o.color, w: 6, boil: 0.6, seed: o.seed, shade: { color: o.dark, dx: 0, dy: -12 }, drop: { dx: 8, dy: 10 } });
    K.text(ctx, str, 0, 3, { size: o.size, weight: 700, font: o.font, fill: o.textColor });
    ctx.restore();
  };

  /* ---------- title plate: a wavy-edged coral plate (u = grow 0..1). returns its box ---------- */
  K.titlePlate = function (ctx, cx, cy, w, h, u, opt) {
    const o = Object.assign({ seed: 801, fill: P.cream, shade: P.creamShade, rim: P.ask }, opt || {});
    if (u <= 0) return null;
    const e = K.E.back(clamp(u, 0, 1), 1.6), ww = w * e, hh = h * Math.min(1, e * 1.1);
    const ring = (ox, oy, pad) => { const pts = []; const N = 40; for (let i = 0; i < N; i++) { const a = (i / N) * K.TAU, c = Math.cos(a), s = Math.sin(a); const k = Math.pow(Math.abs(c) ** 6 + Math.abs(s) ** 6, -1 / 6); pts.push([cx + ox + c * k * (ww / 2 + pad) + 6 * Math.sin(i * 2.3 + K.now * 1.6), cy + oy + s * k * (hh / 2 + pad) + 5 * Math.sin(i * 1.7 + K.now * 1.3)]); } return pts; };
    K.shape(ctx, ring(0, 0, 26), { fill: o.rim, w: 6, boil: 0.8, seed: o.seed, drop: { dx: 14, dy: 18 }, shade: { color: P.askDark, dx: 0, dy: -14 } });
    K.shape(ctx, ring(0, 0, 0), { fill: o.fill, w: 6, boil: 0.8, seed: o.seed + 1, shade: { color: o.shade, dx: 0, dy: -14 }, dots: { color: P.ask, alpha: 0.16, gap: 16, r: 3.6, ang: Math.PI / 2, from: 0.55 } });
    return { x: cx - ww / 2, y: cy - hh / 2, w: ww, h: hh };
  };
})(MK);
