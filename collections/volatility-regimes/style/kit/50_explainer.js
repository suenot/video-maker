/* ============================================================
   KIT 50 EXPLAINER (Surf Turtle kit): slide content as things on the beach.
   Never draw a flat slide. Each primitive is a physical object of this world:
     big number      -> carved tiki sign on a post            K.tikiSign
     formula         -> surf-report board, chalk paint        K.forecastBoard (+ K.formula markup)
     chart           -> surf-poster panel; regime bands       K.posterChart
     distribution    -> a sand dune / hump on the chart       K.hump
     table           -> tide table in a bamboo frame          K.tideTable
     bullets         -> surf-shop menu board, starfish dots   K.menuBoard
     code            -> wax-box label postcard                K.postcard
     graph node      -> bobbing buoy with an icon             K.buoy
     graph edge      -> ocean current (curved foam arrow)     K.current, K.tag
     episode icon    -> round buoy medal                      K.medal + K.ICON
     title frame     -> poster frame band                     K.posterFrame
   All take `a` (appear 0..1, pops with a back ease) so pops land on beats.
   Text never wobbles; frames, paint edges and ropes do.
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));
  K.popS = popS;

  /* ---------- evenly spaced outlines (K.evenPts / K.polyPts live in 10_print.js) ---------- */
  /* rounded card / sharp box with even spacing (box keeps exact corners: each edge split on its own) */
  const card = (x, y, w, h, r, step) => K.evenPts(K.roundPts(x, y, w, h, r, 8), step || clamp(Math.min(w, h) / 4, 5, 36));
  const box = (x, y, w, h, step) => {
    step = step || clamp(Math.min(Math.abs(w), Math.abs(h)) / 2, 3, 36);
    const nx = Math.max(1, Math.round(Math.abs(w) / step)), ny = Math.max(1, Math.round(Math.abs(h) / step)), out = [];
    for (let i = 0; i < nx; i++) out.push([x + (w * i) / nx, y]);
    for (let i = 0; i < ny; i++) out.push([x + w, y + (h * i) / ny]);
    for (let i = 0; i < nx; i++) out.push([x + w - (w * i) / nx, y + h]);
    for (let i = 0; i < ny; i++) out.push([x, y + h - (h * i) / ny]);
    return out;
  };
  K.cardPts = card; K.boxPts = box;
  /* header stripes clipped to the card and the header box */
  const header = (ctx, cd, x, y, w, h, colors, wave) => {
    ctx.save(); K.pathOf(ctx, cd, true); ctx.clip(); ctx.beginPath(); ctx.rect(x - 20, y - 20, w + 40, h + 20); ctx.clip();
    K.bands(ctx, x, y, w, h, colors, { wave }); ctx.restore();
  };

  /* ---------- formula markup: "σ^2_t = ω + α·ε^2_{t-1}" -> glyph runs with sub/sup ----------
     returns [{s, mode}] where mode "" | "sup" | "sub" */
  K.parseFormula = function (str) {
    const out = []; let i = 0;
    while (i < str.length) {
      const c = str[i];
      if ((c === "^" || c === "_") && i + 1 < str.length) {
        const mode = c === "^" ? "sup" : "sub";
        if (str[i + 1] === "{") { const j = str.indexOf("}", i + 2); out.push({ s: str.slice(i + 2, j), mode }); i = j + 1; }
        else { out.push({ s: str[i + 1], mode }); i += 2; }
      } else {
        const last = out[out.length - 1];
        if (last && last.mode === "") last.s += c; else out.push({ s: c, mode: "" });
        i++;
      }
    }
    return out;
  };
  /* draw formula markup; n = number of glyphs to show (written progressively). returns width */
  K.formula = function (ctx, str, x, y, opt) {
    const o = Object.assign({ size: 54, fill: P.chalk, font: K.FONT.mono, weight: 500, align: "left", n: 1e9, hi: null, hiColor: P.sigma, measure: false }, opt || {});
    const runs = K.parseFormula(str);
    const sz = (m) => (m ? o.size * 0.62 : o.size), dy = (m) => (m === "sup" ? -o.size * 0.36 : m === "sub" ? o.size * 0.26 : 0);
    /* layout: a sub right after a sup (or vice versa) stacks on the same x, like σ²ₜ */
    let W = 0; const xs = [];
    runs.forEach((r, i) => {
      const w = K.textW(ctx, r.s, sz(r.mode), o.weight, o.font), q = runs[i - 1];
      if (q && r.mode && q.mode && r.mode !== q.mode && !q.stk) { r.stk = true; xs.push(xs[i - 1]); W = Math.max(W, xs[i - 1] + w); }
      else { xs.push(W); W += w; }
    });
    if (o.measure) return W;
    const x0 = o.align === "center" ? x - W / 2 : o.align === "right" ? x - W : x, hi = o.hi && new RegExp(o.hi.source, o.hi.flags.replace("g", ""));
    let left = o.n;
    runs.forEach((r, i) => {
      if (left <= 0) return;
      const ch = Array.from(r.s).slice(0, left); left -= Array.from(r.s).length;
      /* highlight per glyph, not per run: "+ β·σ" only paints the σ */
      let cx = x0 + xs[i], seg = "", segC = null;
      const flush = () => { if (!seg) return; K.text(ctx, seg, cx, y + dy(r.mode), { size: sz(r.mode), weight: o.weight, font: o.font, fill: segC, align: "left" }); cx += K.textW(ctx, seg, sz(r.mode), o.weight, o.font); seg = ""; };
      ch.forEach((c) => { const col = hi && hi.test(c) ? o.hiColor : o.fill; if (col !== segC) { flush(); segC = col; } seg += c; });
      flush();
    });
    return W;
  };
  K.formulaLen = (str) => K.parseFormula(str).reduce((s, r) => s + Array.from(r.s).length, 0);

  /* ---------- carved tiki sign on a post (big numbers, 1-3 short lines) ---------- */
  K.tikiSign = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 60, seed: 11, post: true, colors: [], font: K.FONT.mono, weight: 700 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(K.now * 1.2 + o.seed) * 0.012);
    if (o.post) { K.limb(ctx, [[0, h / 2], [0, h / 2 + 150]], 18, P.woodDark, o.seed + 1); }
    const plank = card(-w / 2, -h / 2, w, h, 26);
    K.shape(ctx, plank, { fill: P.wood, w: 6, boil: 1, seed: o.seed, shade: { color: P.woodDark, dx: -10, dy: -12 } });
    K.woodgrain(ctx, plank, { seed: o.seed, gap: 16, alpha: 0.4 });
    /* carved notches top and bottom (tiki teeth) */
    for (let i = 0; i < Math.floor(w / 60); i++) {
      const xx = -w / 2 + 40 + i * 60;
      K.shape(ctx, [[xx - 12, -h / 2 + 4], [xx, -h / 2 + 22], [xx + 12, -h / 2 + 4]], { fill: P.woodNight, w: 3, boil: 0.6, seed: o.seed + 30 + i, reg: false });
    }
    const inner = card(-w / 2 + 26, -h / 2 + 34, w - 52, h - 60, 16);
    K.shape(ctx, inner, { fill: P.cream, w: 4, boil: 0.8, seed: o.seed + 2, shade: { color: P.creamShade, dx: 8, dy: 8 } });
    const lh = o.size * 1.15, top = -((lines.length - 1) * lh) / 2 + 12;
    lines.forEach((ln, i) => K.text(ctx, ln, 0, top + i * lh, { size: o.size, weight: o.weight, font: o.font, fill: o.colors[i] || P.ink }));
    ctx.restore();
  };

  /* ---------- surf-report board: dark painted board in a bamboo frame, chalk formulas ----------
     lines: formula markup strings or {t, c, size}; write 0..1 writes glyph by glyph; tiki = tiki face on top */
  K.forecastBoard = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 54, seed: 31, write: 1, tiki: true, hi: null, legs: true }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    if (o.legs) [-1, 1].forEach((sd, i) => K.limb(ctx, [[sd * (w / 2 - 50), h / 2], [sd * (w / 2 - 40), h / 2 + 170]], 16, P.woodDark, o.seed + 40 + i));
    /* bamboo frame: four poles with node rings */
    const pole = (pts, sd) => { K.limb(ctx, pts, 20, P.sigma, sd); const L = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]); for (let k = 1; k < L / 110; k++) { const u = (k * 110) / L, px = lerp(pts[0][0], pts[1][0], u), py = lerp(pts[0][1], pts[1][1], u), vert = Math.abs(pts[1][0] - pts[0][0]) < 1; K.line(ctx, vert ? [[px - 12, py], [px + 12, py]] : [[px, py - 12], [px, py + 12]], { stroke: P.woodDark, w: 4, boil: 0.4, seed: sd + k }); } };
    K.shape(ctx, box(-w / 2, -h / 2, w, h), { fill: P.slate, w: 5, boil: 1, seed: o.seed + 1, dots: { color: "#0f2a30", cell: 10, density: 0.45, alpha: 0.5 } });
    pole([[-w / 2 - 14, -h / 2], [w / 2 + 14, -h / 2]], o.seed + 2); pole([[-w / 2 - 14, h / 2], [w / 2 + 14, h / 2]], o.seed + 3);
    pole([[-w / 2, -h / 2 - 14], [-w / 2, h / 2 + 14]], o.seed + 4); pole([[w / 2, -h / 2 - 14], [w / 2, h / 2 + 14]], o.seed + 5);
    if (o.tiki) K.tikiFace(ctx, 0, -h / 2 - 50, 0.8, o.seed + 9);
    /* chalk smudges */
    for (let i = 0; i < 5; i++) { ctx.save(); ctx.globalAlpha = 0.07; K.pathOf(ctx, K.blobPts(hs(i, o.seed) * w * 0.35, hs(i + 9, o.seed) * h * 0.3, 100, 30, 9, i, 0.3), true); ctx.fillStyle = P.chalk; ctx.fill(); ctx.restore(); }
    const L = lines.map((ln) => (typeof ln === "string" ? { t: ln } : ln));
    const lens = L.map((l) => K.formulaLen(l.t)), total = lens.reduce((s, v) => s + v, 0);
    let budget = Math.floor(total * clamp(o.write, 0, 1));
    const lh = o.size * 1.55, top = -((L.length - 1) * lh) / 2;
    L.forEach((l, i) => {
      const n = Math.min(budget, lens[i]); budget -= lens[i];
      if (n > 0) K.formula(ctx, l.t, l.align === "left" ? -w / 2 + 50 : 0, top + i * lh, { size: l.size || o.size, fill: l.c || P.chalk, n, align: l.align || "center", hi: o.hi });
    });
    ctx.restore();
  };
  /* small carved tiki face (decor on boards and signs) */
  K.tikiFace = function (ctx, x, y, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const head = [[-56, 50], [-60, -30], [-40, -64], [40, -64], [60, -30], [56, 50]];
    K.shape(ctx, head, { fill: P.woodLight, w: 5, boil: 0.8, seed, shade: { color: P.wood, dx: -12, dy: 0 } });
    K.woodgrain(ctx, head, { seed, gap: 12, alpha: 0.3, ang: Math.PI / 2 });
    [-1, 1].forEach((sd, i) => { K.shape(ctx, K.ellipsePts(sd * 24, -20, 16, 12, 10), { fill: P.cream, w: 4, boil: 0.5, seed: seed + 1 + i, reg: false }); K.dot(ctx, sd * 24, -18, 6, P.ink, null, 0, seed + 3 + i); });
    K.shape(ctx, [[-30, 14], [30, 14], [24, 36], [-24, 36]], { fill: P.woodNight, w: 4, boil: 0.5, seed: seed + 5, reg: false });
    for (let i = 0; i < 4; i++) K.line(ctx, [[-18 + i * 12, 15], [-18 + i * 12, 34]], { stroke: P.cream, w: 3, boil: 0.3, seed: seed + 6 + i });
    ctx.restore();
  };

  /* ---------- surf-poster chart ----------
     series: [{ data:[..], color, kind:"line"|"bar"|"area"|"zig" }]
     bands:  [{ from, to, regime:"calm"|"storm" }] index ranges shaded behind the plot (regimes)
     draw 0..1 left-to-right; yMin/yMax; zero = draw a zero line; header = sunset band on top */
  K.posterChart = function (ctx, x, y, w, h, series, opt) {
    const o = Object.assign({ a: 1, draw: 1, seed: 41, yMin: null, yMax: null, xLabels: [], bands: [], zero: false, header: true, bandA: 1, frame: true }, opt || {});
    const a = popS(o.a); if (a <= 0) return null;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    if (o.frame) {
      const cd = card(-w / 2, -h / 2, w, h, 22);
      K.shape(ctx, cd, { fill: P.cream, w: 6, boil: 1, seed: o.seed, shade: { color: P.creamShade, dx: 12, dy: 12, dots: true, cell: 10, density: 0.7 } });
      if (o.header) { header(ctx, cd, -w / 2, -h / 2, w, 46, [P.sky0, P.sky1, P.sky2], 3); K.line(ctx, [[-w / 2 + 6, -h / 2 + 46], [w / 2 - 6, -h / 2 + 46]], { stroke: P.ink, w: 4, boil: 0.6, seed: o.seed + 1 }); }
    }
    const pl = -w / 2 + 60, pr = w / 2 - 40, pt = -h / 2 + (o.header ? 80 : 40), pb = h / 2 - (o.xLabels.length ? 64 : 40);
    let mn = o.yMin, mx = o.yMax;
    /* empty series = a bare poster panel (e.g. a backing card for K.hump): axes on 0..1 */
    if (mn == null || mx == null) { const all = series.flatMap((s) => s.data); mn = mn == null ? (all.length ? Math.min(...all) : 0) : mn; mx = mx == null ? (all.length ? Math.max(...all) : 1) : mx; }
    const N = Math.max(1, ...series.map((s) => s.data.length));
    const X = (i) => pl + 10 + ((pr - pl - 20) * i) / Math.max(1, N - 1), Y = (v) => pb - ((v - mn) / (mx - mn || 1)) * (pb - pt);
    /* regime bands */
    o.bands.forEach((b, bi) => {
      const g = clamp(o.draw * N - b.from, 0, b.to - b.from) / (b.to - b.from); if (g <= 0) return;
      const x0 = X(b.from) - (pr - pl) / N / 2, x1 = lerp(x0, X(b.to) + (pr - pl) / N / 2, g);
      ctx.save(); ctx.globalAlpha *= 0.3 * o.bandA;
      K.shape(ctx, box(Math.max(pl, x0), pt - 10, Math.min(pr, x1) - Math.max(pl, x0), pb - pt + 10), { fill: b.regime === "storm" ? P.storm : P.calm, stroke: null, w: 0, boil: 0.6, seed: o.seed + 60 + bi, reg: false });
      ctx.restore();
    });
    K.line(ctx, [[pl, pt - 10], [pl, pb]], { stroke: P.ink, w: 4.5, boil: 0.6, seed: o.seed + 9 });
    K.line(ctx, [[pl, pb], [pr, pb]], { stroke: P.ink, w: 4.5, boil: 0.6, seed: o.seed + 8 });
    if (o.zero && mn < 0 && mx > 0) K.line(ctx, [[pl, Y(0)], [pr, Y(0)]], { stroke: P.inkSoft, w: 2.5, boil: 0.5, seed: o.seed + 7, alpha: 0.6 });
    series.forEach((s, si) => {
      const n = s.data.length, k = o.draw * (n - 1);
      if (s.kind === "bar" || s.kind === "zig") {
        const bw = ((pr - pl) / n) * (s.kind === "zig" ? 0.5 : 0.62), base = s.kind === "zig" ? Y(clamp(0, mn, mx)) : pb;
        s.data.forEach((v, i) => {
          const g = clamp(o.draw * n - i, 0, 1); if (g <= 0) return;
          const top = lerp(base, Y(clamp(v, mn, mx)), K.E.back(g, 1.4)), col = s.colorAt ? s.colorAt(i, v) : s.color;
          K.shape(ctx, box(X(i) - bw / 2, Math.min(top, base), bw, Math.max(1, Math.abs(base - top))), { fill: col, w: 2.5, boil: 0.5, seed: o.seed + 20 + i, reg: false });
        });
      } else {
        const pts = [];
        const Yc = (v) => Y(clamp(v, mn, mx)); /* values past yMin/yMax stay inside the plot */
        for (let i = 0; i <= Math.floor(k); i++) pts.push([X(i), Yc(s.data[i])]);
        const fr = k - Math.floor(k), i0 = Math.floor(k);
        if (i0 < n - 1 && fr > 0) pts.push([lerp(X(i0), X(i0 + 1), fr), lerp(Yc(s.data[i0]), Yc(s.data[i0 + 1]), fr)]);
        if (s.kind === "area" && pts.length > 1) K.shape(ctx, pts.concat([[pts[pts.length - 1][0], pb], [pts[0][0], pb]]), { fill: s.color, stroke: null, w: 0, boil: 0.6, seed: o.seed + 50 + si, alpha: 0.45, dots: { color: P.ink, cell: 8, density: 0.4, alpha: 0.25 } });
        if (pts.length > 1) { K.line(ctx, pts, { stroke: P.ink, w: (s.w || 6) + 7, boil: 0.8, seed: o.seed + 30 + si, brush: { taper: 0.9, swell: 0.1 } }); K.line(ctx, pts, { stroke: s.color, w: s.w || 6, boil: 0.8, seed: o.seed + 30 + si, brush: { taper: 0.9, swell: 0.1 } }); }
        const head = pts[pts.length - 1]; if (head && o.draw < 1) K.dot(ctx, head[0], head[1], 9, s.color, P.ink, 3, o.seed + 40 + si);
      }
    });
    /* x labels: centred on their tick but clamped inside the card (the last one used to hang off the edge) */
    o.xLabels.forEach((lb, i) => { if (!lb) return; const hw = K.textW(ctx, lb, 28, 500, K.FONT.mono) / 2; K.text(ctx, lb, clamp(X((i * (N - 1)) / Math.max(1, o.xLabels.length - 1)), -w / 2 + 24 + hw, w / 2 - 24 - hw), pb + 34, { size: 28, weight: 500, font: K.FONT.mono, fill: P.inkSoft }); });
    ctx.restore();
    return { X: (i) => x + X(i) * a, Y: (v) => y + Y(v) * a, pl: x + pl, pr: x + pr, pt: y + pt, pb: y + pb };
  };
  /* distribution hump (sand dune) centred at x on baseline y: width = spread, height = peak */
  K.hump = function (ctx, x, y, spread, peak, opt) {
    const o = Object.assign({ a: 1, color: P.calm, seed: 81, fat: 0 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const pts = [];
    for (let i = 0; i <= 24; i++) { const u = (i / 24) * 2 - 1, z = u * 3; const d = Math.exp(-z * z / 2) * (1 - o.fat) + o.fat / (1 + z * z); pts.push([x + u * spread, y - peak * a * d]); }
    K.shape(ctx, pts.concat([[x + spread, y], [x - spread, y]]), { fill: o.color, w: 5, boil: 0.8, seed: o.seed, shade: { color: K.mix(o.color, P.ink, 0.3), dx: 10, dy: 0, dots: true, cell: 8, density: 0.7 } });
  };

  /* ---------- tide table (table) in a bamboo frame; row 0 = header ---------- */
  K.tideTable = function (ctx, x, y, cols, rows, opt) {
    const o = Object.assign({ a: 1, size: 32, rowH: 56, seed: 21, hi: -1, reveal: 1, hiColor: P.sigma }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = cols.reduce((s, c) => s + c, 0) + 48, h = rows.length * o.rowH + 44;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, card(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 18), { fill: P.wood, w: 6, boil: 1, seed: o.seed, shade: { color: P.woodDark, dx: -10, dy: -10 } });
    K.shape(ctx, box(-w / 2, -h / 2, w, h), { fill: P.cream, w: 4, boil: 0.8, seed: o.seed + 1 });
    const shown = Math.ceil(rows.length * o.reveal);
    rows.slice(0, shown).forEach((r, ri) => {
      const ry = -h / 2 + 22 + ri * o.rowH + o.rowH / 2;
      if (ri === 0) K.shape(ctx, box(-w / 2 + 6, ry - o.rowH / 2 + 2, w - 12, o.rowH - 4), { fill: P.calm, stroke: null, w: 0, boil: 0.5, seed: o.seed + 70, reg: false });
      else if (ri === o.hi) K.shape(ctx, box(-w / 2 + 10, ry - o.rowH / 2 + 4, w - 20, o.rowH - 8), { fill: o.hiColor, stroke: null, w: 0, boil: 0.6, seed: o.seed + ri, alpha: 0.75 });
      else if (ri % 2 === 0) K.halftone(ctx, box(-w / 2 + 6, ry - o.rowH / 2 + 2, w - 12, o.rowH - 4), { color: P.creamShade, cell: 8, density: 0.6, alpha: 0.9 });
      let cx = -w / 2 + 24;
      r.forEach((cell, ci) => {
        K.text(ctx, cell, cx + cols[ci] / 2, ry + 1, { size: o.size, weight: ri === 0 ? 900 : 500, font: ri === 0 ? K.FONT.display : K.FONT.mono, fill: ri === 0 ? P.cream : P.ink });
        cx += cols[ci];
      });
    });
    ctx.restore();
  };

  /* ---------- surf-shop menu board (bullets); each bullet is a starfish and pops on its own beat ---------- */
  K.starfish = function (ctx, x, y, r, color, seed) {
    const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * K.TAU, rr = i % 2 ? r * 0.48 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    K.shape(ctx, pts, { fill: color || P.boardStripe, w: 3.5, boil: 0.5, seed, reg: false, brush: { swell: 0.1 } });
    K.dot(ctx, x, y, r * 0.16, P.cream, null, 0, seed + 1);
  };
  K.menuBoard = function (ctx, x, y, w, items, opt) {
    const o = Object.assign({ a: 1, size: 42, seed: 51, shown: 99, title: "", lineH: null, colors: null }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.lineH || o.size * 1.7, h = items.length * lh + (o.title ? 120 : 70);
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    /* surfboard standing on its tail: pointed nose above the panel, square tail below */
    const top = -h / 2 - 150, bot = h / 2 + 46, hwAt = (yy) => { const u = clamp((yy - top) / (bot - top), 0, 1); return (w / 2) * Math.pow(1 - Math.pow(1 - Math.min(1, u / 0.5), 2.2), 0.6) * (u > 0.82 ? Math.sqrt(1 - Math.pow((u - 0.82) / 0.18, 2) * 0.45) : 1); };
    const sb = []; for (let i = 0; i <= 24; i++) { const yy = lerp(top, bot, i / 24); sb.push([hwAt(yy), yy]); }
    const board = K.evenPts(sb.concat(sb.slice().reverse().map((p) => [-p[0], p[1]])), 30);
    K.shape(ctx, board, { fill: P.woodLight, w: 6, boil: 1, seed: o.seed, shade: { color: P.wood, dx: -14, dy: 0 } });
    K.woodgrain(ctx, board, { seed: o.seed, ang: Math.PI / 2, gap: 15, alpha: 0.3 });
    K.line(ctx, [[0, top + 30], [0, bot - 14]], { stroke: P.boardStripe, w: 7, boil: 0.6, seed: o.seed + 2, brush: { taper: 0.3 } }); /* stringer */
    /* cream panel fits inside the board's outline (it used to poke out at the corners) */
    const pw = Math.min(hwAt(-h / 2 + 10), hwAt(h / 2 - 10)) - 26;
    K.shape(ctx, card(-pw, -h / 2 + 10, pw * 2, h - 20, 18), { fill: P.cream, w: 4, boil: 0.8, seed: o.seed + 3 });
    let yy = -h / 2 + 34 + lh / 2;
    if (o.title) { K.text(ctx, o.title, 0, -h / 2 + 62, { size: Math.min(o.size * 1.1, (o.size * 1.1 * (pw * 2 - 40)) / K.textW(ctx, o.title, o.size * 1.1, 900)), weight: 900, fill: P.storm }); yy += 56; }
    const sx = -pw + 46, tx = o.size * 0.85, room = pw - 22 - (sx + tx);
    items.forEach((it, i) => {
      const g = clamp(o.shown - i, 0, 1); if (g <= 0) return;
      const s = K.E.back(g, 2), tw = K.textW(ctx, it, o.size, 700), fs = tw > room ? o.size * (room / tw) : o.size; /* long bullets shrink to fit */
      ctx.save(); ctx.translate(sx, yy + i * lh); ctx.scale(s, s);
      K.starfish(ctx, 0, 0, o.size * 0.48, (o.colors && o.colors[i]) || P.A[i % P.A.length], o.seed + 10 + i);
      K.text(ctx, it, tx, 2, { size: fs, weight: 700, fill: P.ink, align: "left" });
      ctx.restore();
    });
    ctx.restore();
  };

  /* ---------- code: a surf-wax box label (postcard) with a typed snippet; long lines shrink the font to fit ---------- */
  const KW = /^(def|return|import|from|for|in|if|else|elif|while|class|lambda|fn|let|mut|pub|struct|impl|use|match|const|self|True|False|None|and|or|not)$/;
  K.postcard = function (ctx, x, y, w, lines, opt) {
    const o = Object.assign({ a: 1, size: 30, seed: 61, typed: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.font = `500 ${o.size}px ${K.FONT.mono}`; const cw0 = ctx.measureText("M").width; ctx.restore();
    const maxLen = Math.max(1, ...lines.map((l) => l.length)), size = Math.min(o.size, (o.size * (w - 68)) / (cw0 * maxLen));
    const lh = size * 1.45, h = lines.length * lh + 110;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(-0.012);
    const cd = card(-w / 2, -h / 2, w, h, 16);
    K.shape(ctx, cd, { fill: P.cream, w: 5, boil: 0.9, seed: o.seed, shade: { color: P.creamShade, dx: 12, dy: 12, dots: true, cell: 9, density: 0.6 } });
    /* sunset stripe header */
    header(ctx, cd, -w / 2, -h / 2, w, 52, [P.calm, P.sigma, P.storm], 2);
    K.line(ctx, [[-w / 2 + 6, -h / 2 + 52], [w / 2 - 6, -h / 2 + 52]], { stroke: P.ink, w: 3.5, boil: 0.5, seed: o.seed + 2 });
    const cw = (cw0 * size) / o.size;
    const total = lines.reduce((s, l) => s + l.length, 0); let budget = Math.floor(total * o.typed);
    lines.forEach((ln, i) => {
      if (budget <= 0) return; const vis = ln.slice(0, budget); budget -= ln.length;
      const yy = -h / 2 + 90 + lh / 2 + i * lh; let col = 0;
      const toks = vis.match(/#.*$|\/\/.*$|"[^"]*"?|'[^']*'?|[A-Za-z_][A-Za-z0-9_]*|[0-9][0-9_.]*|\s+|./g) || [];
      toks.forEach((tk) => {
        const c = tk.startsWith("#") || tk.startsWith("//") ? "#8a7a66" : KW.test(tk) ? P.storm : /^[0-9]/.test(tk) ? P.seaMid : /^["']/.test(tk) ? P.up : P.ink;
        K.text(ctx, tk, -w / 2 + 34 + col * cw, yy, { size, weight: KW.test(tk) ? 700 : 500, font: K.FONT.mono, fill: c, align: "left" });
        col += tk.length;
      });
    });
    ctx.restore();
  };

  /* ---------- graph node: a buoy bobbing on the water, with an icon or a short label ---------- */
  K.buoy = function (ctx, x, y, s, opt) {
    const o = Object.assign({ a: 1, color: P.calm, icon: null, label: "", seed: 91, hot: 0 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const bob = Math.sin(K.now * 2.4 + o.seed) * 6, tilt = Math.sin(K.now * 1.7 + o.seed) * 0.06;
    ctx.save(); ctx.translate(x, y + bob); ctx.rotate(tilt); ctx.scale(s * a, s * a);
    /* warm halo, painted over (K.glow adds light, which turns cyan on the sea) */
    if (o.hot > 0) { const g = ctx.createRadialGradient(0, -70, 20, 0, -70, 170); g.addColorStop(0, "rgba(255,231,163,0.85)"); g.addColorStop(1, "rgba(255,231,163,0)"); ctx.save(); ctx.globalAlpha *= o.hot; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -70, 170, 0, K.TAU); ctx.fill(); ctx.restore(); }
    K.shape(ctx, [[-44, 0], [-30, -96], [30, -96], [44, 0]], { fill: o.color, w: 5, boil: 0.8, seed: o.seed, shade: { color: K.mix(o.color, P.ink, 0.3), dx: -12, dy: 0 } });
    K.shape(ctx, box(-38, -62, 76, 22), { fill: P.cream, w: 3.5, boil: 0.5, seed: o.seed + 1, reg: false });
    K.shape(ctx, K.ellipsePts(0, 2, 62, 18, 14), { fill: K.mix(o.color, P.ink, 0.25), w: 5, boil: 0.8, seed: o.seed + 2 });
    K.shape(ctx, K.ellipsePts(0, -124, 46, 46, 16), { fill: P.cream, w: 5, boil: 0.8, seed: o.seed + 3 });
    if (o.icon) { ctx.save(); ctx.translate(0, -124); o.icon(ctx, 40); ctx.restore(); }
    else if (o.label) K.text(ctx, o.label, 0, -122, { size: o.label.length > 3 ? 26 : 34, weight: 900, fill: P.ink });
    /* water ring */
    K.line(ctx, [[-86, 10], [-40, 20], [40, 20], [86, 10]], { stroke: P.foam, w: 6, boil: 0.8, seed: o.seed + 4 });
    ctx.restore();
  };
  /* ocean current between two points: curved foam arrow. label = probability tag */
  K.curPoint = function (A, B, bend, u) {
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
    const C = [mx - (dy / L) * bend, my + (dx / L) * bend];
    const x = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0], y = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1];
    const tx = 2 * (1 - u) * (C[0] - A[0]) + 2 * u * (B[0] - C[0]), ty = 2 * (1 - u) * (C[1] - A[1]) + 2 * u * (B[1] - C[1]);
    return [x, y, Math.atan2(ty, tx)];
  };
  K.current = function (ctx, A, B, opt) {
    const o = Object.assign({ p: 1, bend: 80, label: "", seed: 1, trim: 90, color: P.foam, w: 10, lu: 0.5, labelSize: 30, hot: false }, opt || {});
    if (o.p <= 0) return;
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u0 = clamp(o.trim / L, 0, 0.45), u1 = 1 - u0;
    const pts = []; for (let i = 0; i <= 20; i++) pts.push(K.curPoint(A, B, o.bend, lerp(u0, u1, (i / 20) * o.p)));
    const xy = pts.map((q) => [q[0], q[1]]);
    K.line(ctx, xy, { stroke: P.ink, w: o.w + 8, boil: 0.9, seed: o.seed, brush: { taper: 0.6 } });
    K.line(ctx, xy, { stroke: o.hot ? P.sigma : o.color, w: o.w, boil: 0.9, seed: o.seed, brush: { taper: 0.6 } });
    /* travelling ripples along the current */
    for (let k = 0; k < 3; k++) {
      const u = ((K.now * 0.5 + k / 3) % 1) * o.p, q = K.curPoint(A, B, o.bend, lerp(u0, u1, u));
      K.dot(ctx, q[0], q[1], 5, P.cream, P.ink, 2, o.seed + 10 + k);
    }
    if (o.p >= 1) { const q = K.curPoint(A, B, o.bend, u1); ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(q[2]); K.shape(ctx, [[20, 0], [-14, -17], [-6, 0], [-14, 17]], { fill: o.hot ? P.sigma : o.color, w: 4.5, boil: 0.6, seed: o.seed + 7, reg: false }); ctx.restore(); }
    if (o.label && o.p > 0.6) { const q = K.curPoint(A, B, o.bend, o.lu); K.tag(ctx, q[0], q[1], o.label, { a: (o.p - 0.6) / 0.4, seed: o.seed + 9, size: o.labelSize, hot: o.hot }); }
  };
  /* self-loop current (a state that stays): circle of radius r*0.75 centred r away from A along ang;
     the gap faces A, so the current leaves the node and comes back to it (arrow head at the return) */
  K.loopCurrent = function (ctx, A, r, opt) {
    const o = Object.assign({ p: 1, label: "", seed: 3, ang: -Math.PI / 2, color: P.foam, w: 9, labelSize: 30, hot: false }, opt || {});
    if (o.p <= 0) return;
    const c = [A[0] + Math.cos(o.ang) * r, A[1] + Math.sin(o.ang) * r], rr = r * 0.75, a0 = o.ang + Math.PI * 1.3, pts = [];
    for (let i = 0; i <= 18; i++) { const a = a0 + (i / 18) * Math.PI * 1.4 * o.p; pts.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]); }
    const col = o.hot ? P.sigma : o.color;
    K.line(ctx, pts, { stroke: P.ink, w: o.w + 8, boil: 0.8, seed: o.seed, brush: { taper: 0.6 } });
    K.line(ctx, pts, { stroke: col, w: o.w, boil: 0.8, seed: o.seed, brush: { taper: 0.6 } });
    if (o.p >= 1) { const ae = a0 + Math.PI * 1.4; ctx.save(); ctx.translate(c[0] + Math.cos(ae) * rr, c[1] + Math.sin(ae) * rr); ctx.rotate(ae + Math.PI / 2); K.shape(ctx, [[18, 0], [-12, -15], [-5, 0], [-12, 15]], { fill: col, w: 4.5, boil: 0.6, seed: o.seed + 7, reg: false }); ctx.restore(); }
    if (o.label && o.p > 0.7) K.tag(ctx, c[0] + Math.cos(o.ang) * rr, c[1] + Math.sin(o.ang) * rr, o.label, { a: (o.p - 0.7) / 0.3, seed: o.seed + 9, size: o.labelSize, hot: o.hot });
  };
  /* small cream ticket with a number (probabilities, prices) */
  K.tag = function (ctx, x, y, str, opt) {
    const o = Object.assign({ a: 1, hot: false, size: 30, seed: 1, font: K.FONT.mono, weight: 700, fill: null }, opt || {});
    const a = popS(clamp(o.a, 0, 1)); if (a <= 0) return;
    const w = K.textW(ctx, str, o.size, o.weight, o.font) + 30, h = o.size + 20;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(hs(o.seed, 2) * 0.05);
    K.shape(ctx, card(-w / 2, -h / 2, w, h, h / 2), { fill: o.fill || (o.hot ? P.sigma : P.cream), w: 4, boil: 0.6, seed: o.seed, shade: { color: o.hot ? "#d8962a" : P.creamShade, dx: 0, dy: -6 } });
    K.text(ctx, str, 0, 2, { size: o.size, weight: o.weight, font: o.font, fill: P.ink });
    ctx.restore();
  };

  /* ---------- episode icons (language-free), drawn in a circle of radius r ---------- */
  const ln = (c, pts, col, w, sd) => K.line(c, pts, { stroke: col || P.ink, w: w || 4, boil: 0.4, seed: sd || 1 });
  K.ICON = {
    /* sigma: the GARCH forecast */
    garch: (c, r) => K.text(c, "σ²", 0, 4, { size: r * 1.05, weight: 700, font: K.FONT.mono, fill: P.ink }),
    /* leverage effect: a long arrow down, a short arrow up */
    leverage: (c, r) => { ln(c, [[-r * 0.28, -r * 0.5], [-r * 0.28, r * 0.42]], P.down, 6, 2); K.shape(c, [[-r * 0.46, r * 0.22], [-r * 0.1, r * 0.22], [-r * 0.28, r * 0.55]], { fill: P.down, w: 3, boil: 0.3, seed: 3, reg: false }); ln(c, [[r * 0.3, r * 0.4], [r * 0.3, 0]], P.up, 6, 4); K.shape(c, [[r * 0.14, r * 0.04], [r * 0.46, r * 0.04], [r * 0.3, -r * 0.26]], { fill: P.up, w: 3, boil: 0.3, seed: 5, reg: false }); },
    /* clustering: small, small, BIG, BIG, small bars */
    cluster: (c, r) => [0.2, 0.25, 0.8, 0.95, 0.7, 0.2].forEach((v, i) => K.shape(c, box(-r * 0.6 + i * r * 0.21, r * 0.45 - v * r * 0.9, r * 0.14, v * r * 0.9), { fill: v > 0.5 ? P.storm : P.calm, w: 2.5, boil: 0.3, seed: 10 + i, reg: false })),
    /* regime switching: two states and arrows */
    regimes: (c, r) => { K.dot(c, -r * 0.4, 0, r * 0.24, P.calm, P.ink, 3, 20); K.dot(c, r * 0.4, 0, r * 0.24, P.storm, P.ink, 3, 21); ln(c, [[-r * 0.15, -r * 0.18], [0, -r * 0.3], [r * 0.15, -r * 0.18]], P.ink, 3.5, 22); ln(c, [[r * 0.15, r * 0.18], [0, r * 0.3], [-r * 0.15, r * 0.18]], P.ink, 3.5, 23); },
    /* realized volatility: intraday ticks + a ruler */
    realized: (c, r) => { const z = [0, -0.3, 0.1, -0.5, 0.3, -0.1, 0.4, -0.2]; ln(c, z.map((v, i) => [-r * 0.6 + i * r * 0.17, v * r * 0.5 - r * 0.05]), P.seaMid, 3.5, 30); ln(c, [[-r * 0.6, r * 0.45], [r * 0.6, r * 0.45]], P.ink, 3.5, 31); for (let i = 0; i < 5; i++) ln(c, [[-r * 0.6 + i * r * 0.3, r * 0.45], [-r * 0.6 + i * r * 0.3, r * 0.3]], P.ink, 2.5, 32 + i); },
    sun: (c, r) => { for (let i = 0; i < 8; i++) { const a = (i / 8) * K.TAU; ln(c, [[Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42], [Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62]], P.sigma, 4, 40 + i); } K.dot(c, 0, 0, r * 0.3, P.sun, P.ink, 3, 49); },
    /* storm: a three-puff cloud (flat bottom) and a zig-zag bolt below it */
    storm: (c, r) => {
      const cl = [], puff = (cx, cy, rr, a0, a1) => { for (let i = 0; i <= 6; i++) { const a = lerp(a0, a1, i / 6); cl.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } };
      puff(-r * 0.36, -r * 0.08, r * 0.24, Math.PI * 0.5, Math.PI * 1.45); puff(r * 0.02, -r * 0.24, r * 0.32, Math.PI * 1.1, Math.PI * 1.95); puff(r * 0.38, -r * 0.06, r * 0.22, Math.PI * 1.55, Math.PI * 2.5);
      K.shape(c, K.evenPts(cl, r * 0.08), { fill: P.stormCloud, w: 3.5, boil: 0.4, seed: 50, reg: false, shade: { color: P.stormCloudShade, dx: 0, dy: -r * 0.12 } });
      K.shape(c, K.polyPts([[-r * 0.02, r * 0.18], [r * 0.2, r * 0.18], [r * 0.06, r * 0.36], [r * 0.2, r * 0.36], [-r * 0.14, r * 0.72], [-r * 0.02, r * 0.45], [-r * 0.16, r * 0.45]], r * 0.05), { fill: P.sigma, w: 3, boil: 0.3, seed: 51, reg: false });
    },
  };
  /* round buoy medal for an episode icon */
  K.medal = function (ctx, x, y, r, opt) {
    const o = Object.assign({ a: 1, color: P.calm, icon: null, seed: 600 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.ellipsePts(0, 0, r, r, 18), { fill: o.color, w: 5, boil: 0.7, seed: o.seed, shade: { color: K.mix(o.color, P.ink, 0.3), dx: -8, dy: -8 } });
    /* life-ring stripes */
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * 0.86, (i / 4) * K.TAU + 0.4, (i / 4) * K.TAU + 0.85); ctx.strokeStyle = P.cream; ctx.lineWidth = r * 0.22; ctx.lineCap = "butt"; ctx.stroke(); ctx.restore(); }
    K.shape(ctx, K.ellipsePts(0, 0, r * 0.68, r * 0.68, 16), { fill: P.cream, w: 4, boil: 0.5, seed: o.seed + 1, reg: false });
    if (o.icon) o.icon(ctx, r * 0.68);
    ctx.restore();
  };

  /* ---------- poster frame band (title backing): u = unfurl 0..1, returns box ---------- */
  K.posterFrame = function (ctx, cx, cy, w, h, u, opt) {
    const o = Object.assign({ seed: 71, fill: P.cream, edge: P.storm }, opt || {});
    if (u <= 0) return null;
    const ww = w * K.E.out3(clamp(u, 0, 1));
    const pts = card(cx - ww / 2, cy - h / 2, ww, h, h / 2);
    K.shape(ctx, pts, { fill: o.fill, w: 6, boil: 1, seed: o.seed, shade: { color: o.edge, dx: 12, dy: 14 } });
    return { x: cx - ww / 2, y: cy - h / 2, w: ww, h };
  };
})(VK);
