/* ============================================================
   VAUDEVILLE KIT 50 EXPLAINER: slide content as props of the show.
   Never a flat slide. Each primitive is a thing on a 1920s stage:
     formula / statement -> silent-film intertitle card     K.intertitle
     bullets, agenda     -> act card on an easel            K.easel
     table               -> theatre playbill               K.playbill
     chart, time series  -> picture on the cinema screen    K.screenChart
     big number          -> admission ticket               K.ticket
     small number, price -> hang tag on a string           K.hangTag
     code                -> typewriter page                K.typewriter
     z-score             -> the proscenium z-meter         K.gauge (30_stage)
     spread              -> the spring between partners    K.spring (30_stage)
     title               -> marquee with chasing bulbs     K.marquee
   All take `a` (appear 0..1) and pop with a back ease, so they land on
   a beat. Text never boils; frames, strings and paper edges do.
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));
  const lineStr = (ln) => (typeof ln === "string" ? ln : ln.t);
  const lineCol = (ln, d) => (typeof ln === "string" ? d : ln.c || d);

  /* corner flourish (art-nouveau curl) */
  function curl(ctx, x, y, sx, sy, col, seed) {
    K.line(ctx, [[x, y + sy * 46], [x, y + sy * 10], [x + sx * 10, y], [x + sx * 46, y]], { stroke: col, w: 4, boil: 0.4, seed, taper: [0.2, 0.2] });
    K.line(ctx, [[x + sx * 14, y + sy * 30], [x + sx * 16, y + sy * 16], [x + sx * 30, y + sy * 14]], { stroke: col, w: 3, boil: 0.4, seed: seed + 1, taper: [0.2, 0.2] });
    K.dot(ctx, x + sx * 22, y + sy * 22, 4, col, null, 0, seed + 2);
  }

  /* ---------- silent-film intertitle (formula, statement; 1-4 lines) ---------- */
  K.intertitle = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 52, seed: 1100, write: 1, font: K.FONT.mono, weight: 500, align: "center" }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.ink, w: 6, boil: 0.8, seed: o.seed });
    K.shape(ctx, K.rectPts(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36, 4), { fill: null, stroke: P.paper, w: 4, boil: 0.6, seed: o.seed + 1 });
    K.shape(ctx, K.rectPts(-w / 2 + 30, -h / 2 + 30, w - 60, h - 60, 4), { fill: null, stroke: P.paper, w: 2, boil: 0.6, seed: o.seed + 2 });
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy], i) => curl(ctx, sx * (w / 2 - 44), sy * (h / 2 - 44), -sx, -sy, P.paper, o.seed + 10 + i * 3));
    const lh = o.size * 1.32, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const str = lineStr(ln), n = Math.floor(str.length * clamp(o.write * lines.length - i, 0, 1));
      if (n > 0) K.text(ctx, str.slice(0, n), o.align === "left" ? -w / 2 + 70 : 0, top + i * lh, { size: o.size, weight: o.weight, font: o.font, fill: lineCol(ln, P.paper), align: o.align });
    });
    ctx.restore();
  };

  /* ---------- act card on an easel (bullets; each pops on its own beat) ---------- */
  K.easel = function (ctx, x, y, w, items, opt) {
    const o = Object.assign({ a: 1, size: 40, seed: 1200, shown: 99, title: "", lineH: null }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.lineH || o.size * 1.6, h = items.length * lh + (o.title ? 130 : 70);
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(K.now * 1.1 + o.seed) * 0.006);
    /* tripod legs */
    K.hose(ctx, [[-w * 0.32, -h / 2 + 20], [-w * 0.42, h / 2 + 200]], 10, P.g2, o.seed + 1);
    K.hose(ctx, [[w * 0.32, -h / 2 + 20], [w * 0.42, h / 2 + 200]], 10, P.g2, o.seed + 2);
    K.hose(ctx, [[0, -h / 2 - 30], [0, h / 2 + 180]], 9, P.g1, o.seed + 3);
    K.shape(ctx, K.rectPts(-w / 2 - 10, h / 2 - 4, w + 20, 20, 3), { fill: P.g2, w: 4, boil: 0.6, seed: o.seed + 4 });
    /* the card with a double rule */
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.paper, w: 5, boil: 0.8, seed: o.seed + 5, shade: { color: P.g5, dx: -12, dy: -12 } });
    K.shape(ctx, K.rectPts(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 4), { fill: null, w: 2.5, boil: 0.6, seed: o.seed + 6 });
    let yy = -h / 2 + 36 + lh / 2;
    if (o.title) { K.text(ctx, o.title, 0, -h / 2 + 64, { size: o.size * 1.15, weight: 900, font: K.FONT.display, fill: P.ink }); K.line(ctx, [[-w * 0.3, -h / 2 + 100], [w * 0.3, -h / 2 + 100]], { stroke: P.ink, w: 4, boil: 0.5, seed: o.seed + 7 }); yy += 60; }
    items.forEach((it, i) => {
      const g = clamp(o.shown - i, 0, 1); if (g <= 0) return;
      const s = K.E.back(g, 2);
      ctx.save(); ctx.translate(-w / 2 + 64, yy + i * lh); ctx.scale(s, s);
      K.twinkle(ctx, 0, 0, o.size * 0.4, 1, lineCol(it, P.ink) === P.gold ? P.gold : P.ink, o.seed + 10 + i);
      K.text(ctx, lineStr(it), o.size * 0.8, 2, { size: o.size, weight: 500, font: K.FONT.label, fill: P.ink, align: "left" });
      ctx.restore();
    });
    ctx.restore();
  };

  /* ---------- theatre playbill (table). rows[0] = header, hi = gold row ---------- */
  K.playbill = function (ctx, x, y, cols, rows, opt) {
    const o = Object.assign({ a: 1, size: 30, rowH: 54, seed: 1300, hi: -1, reveal: 1, title: "" }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = cols.reduce((s, c) => s + c, 0) + 60, head = o.title ? 90 : 30, h = rows.length * o.rowH + head + 40;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 5), { fill: P.paper, w: 5, boil: 0.8, seed: o.seed, shade: { color: P.g5, dx: -10, dy: -10 } });
    K.shape(ctx, K.rectPts(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 5), { fill: null, w: 4, boil: 0.6, seed: o.seed + 1 });
    K.shape(ctx, K.rectPts(-w / 2 + 22, -h / 2 + 22, w - 44, h - 44, 5), { fill: null, w: 1.8, boil: 0.6, seed: o.seed + 2 });
    if (o.title) K.text(ctx, o.title, 0, -h / 2 + 62, { size: o.size * 1.25, weight: 900, font: K.FONT.display, fill: P.ink });
    const shown = Math.ceil(rows.length * o.reveal);
    rows.slice(0, shown).forEach((r, ri) => {
      const ry = -h / 2 + head + 20 + ri * o.rowH + o.rowH / 2;
      if (ri === o.hi) K.shape(ctx, K.rectPts(-w / 2 + 30, ry - o.rowH / 2 + 5, w - 60, o.rowH - 10, 3), { fill: P.gold, stroke: null, w: 0, boil: 0.6, seed: o.seed + 10 + ri });
      let cx = -w / 2 + 30;
      r.forEach((cell, ci) => {
        K.text(ctx, lineStr(cell), cx + cols[ci] / 2, ry, { size: o.size, weight: ri === 0 ? 700 : 500, font: ri === 0 ? K.FONT.label : K.FONT.mono, fill: lineCol(cell, P.ink) });
        cx += cols[ci];
      });
      if (ri === 0) { K.line(ctx, [[-w / 2 + 34, ry + o.rowH / 2], [w / 2 - 34, ry + o.rowH / 2]], { stroke: P.ink, w: 4, boil: 0.5, seed: o.seed + 30 }); K.line(ctx, [[-w / 2 + 34, ry + o.rowH / 2 + 7], [w / 2 - 34, ry + o.rowH / 2 + 7]], { stroke: P.ink, w: 2, boil: 0.5, seed: o.seed + 31 }); }
    });
    ctx.restore();
  };

  /* ---------- cinema screen with a chart (projected picture) ----------
     series: [{ data, color, w, dash }], bands: [{ v, color, dash }] horizontal
     lines (mean, +/-2 sigma), spread: [i0, i1] shades between series 0 and 1,
     marks: [{ i, s, label }] dots on series s, draw 0..1 left-to-right */
  K.screenChart = function (ctx, x, y, w, h, series, opt) {
    const o = Object.assign({ a: 1, draw: 1, seed: 1400, yMin: null, yMax: null, bands: [], spread: null, marks: [], title: "", roller: true, beam: 0 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    if (o.roller) { K.shape(ctx, K.roundPts(-w / 2 - 30, -h / 2 - 34, w + 60, 26, 12), { fill: P.g1, w: 5, boil: 0.6, seed: o.seed, shine: { dx: 0, dy: 5, s: 0.8, a: 0.5 } }); }
    K.shape(ctx, K.rectPts(-w / 2, -h / 2 - 10, w, h + 10, 4), { fill: P.shine, w: 5, boil: 0.8, seed: o.seed + 1, shade: { color: P.g5, dx: 0, dy: -14 } });
    K.shape(ctx, K.rectPts(-w / 2 + 2, h / 2 - 4, w - 4, 16, 2), { fill: P.g1, w: 4, boil: 0.5, seed: o.seed + 2 });
    if (o.beam > 0) K.glow(ctx, 0, 0, w * 0.6, "rgba(255,252,240,0.6)", o.beam);
    const pl = -w / 2 + 50, pr = w / 2 - 36, pt = -h / 2 + (o.title ? 70 : 34), pb = h / 2 - 40;
    if (o.title) K.text(ctx, o.title, 0, -h / 2 + 34, { size: 32, weight: 700, font: K.FONT.label, fill: P.ink });
    let mn = o.yMin, mx = o.yMax;
    if (mn == null || mx == null) { const all = series.flatMap((s) => s.data); mn = mn == null ? Math.min(...all) : mn; mx = mx == null ? Math.max(...all) : mx; }
    const n0 = series.length ? series[0].data.length : 2;
    const X = (i, n) => pl + ((pr - pl) * i) / Math.max(1, (n || n0) - 1), Y = (v) => pb - ((v - mn) / (mx - mn || 1)) * (pb - pt);
    K.line(ctx, [[pl, pt], [pl, pb]], { stroke: P.ink, w: 4, boil: 0.5, seed: o.seed + 9, taper: [1, 1] });
    K.line(ctx, [[pl, pb], [pr, pb]], { stroke: P.ink, w: 4, boil: 0.5, seed: o.seed + 8, taper: [1, 1] });
    o.bands.forEach((b, bi) => {
      const yy = Y(b.v); ctx.save(); ctx.setLineDash(b.dash || [16, 12]); ctx.strokeStyle = b.color || P.g3; ctx.lineWidth = b.w || 4;
      ctx.beginPath(); ctx.moveTo(pl, yy); ctx.lineTo(pr, yy); ctx.stroke(); ctx.restore();
      if (b.label) K.text(ctx, b.label, pr - 6, yy - 18, { size: 24, weight: 700, font: K.FONT.mono, fill: b.color === P.gold ? P.goldDark : P.g2, align: "right" });
    });
    const head = (s) => { const n = s.data.length, k = o.draw * (n - 1), pts = []; for (let i = 0; i <= Math.floor(k); i++) pts.push([X(i, n), Y(s.data[i])]); const fr = k - Math.floor(k), i0 = Math.floor(k); if (i0 < n - 1 && fr > 0) pts.push([lerp(X(i0, n), X(i0 + 1, n), fr), lerp(Y(s.data[i0]), Y(s.data[i0 + 1]), fr)]); return pts; };
    if (o.spread && series.length > 1) {
      const A = head(series[0]), B = head(series[1]); if (A.length > 1) { ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = P.gold; ctx.beginPath(); A.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); for (let i = B.length - 1; i >= 0; i--) ctx.lineTo(B[i][0], B[i][1]); ctx.closePath(); ctx.fill(); ctx.restore(); }
    }
    series.forEach((s, si) => {
      const pts = head(s); if (pts.length < 2) return;
      ctx.save(); if (s.dash) ctx.setLineDash(s.dash); ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = s.color || P.ink; ctx.lineWidth = s.w || 6; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
      const hp = pts[pts.length - 1]; K.dot(ctx, hp[0], hp[1], 8, s.color || P.ink, P.ink, 3, o.seed + 40 + si);
    });
    o.marks.forEach((m, mi) => { const s = series[m.s || 0], n = s.data.length; if (o.draw * (n - 1) < m.i) return; K.dot(ctx, X(m.i, n), Y(s.data[m.i]), 12, P.gold, P.ink, 3.5, o.seed + 60 + mi); if (m.label) K.hangTag(ctx, X(m.i, n), Y(s.data[m.i]) - 60, m.label, { seed: o.seed + 70 + mi, gold: true, size: 26, string: 30 }); });
    ctx.restore();
  };

  /* ---------- admission ticket (big number, 1-2 lines) ---------- */
  K.ticket = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 60, seed: 1500, gold: false, font: K.FONT.mono, weight: 700, rot: -0.04 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(o.rot + Math.sin(K.now * 1.5 + o.seed) * 0.01);
    const r = 18, pts = []; /* notched corners */
    [[-w / 2, -h / 2, 0], [w / 2, -h / 2, Math.PI / 2], [w / 2, h / 2, Math.PI], [-w / 2, h / 2, -Math.PI / 2]].forEach(([cx, cy, a0]) => { for (let i = 0; i <= 4; i++) { const an = a0 + (i / 4) * (Math.PI / 2); pts.push([cx + Math.cos(an) * r, cy + Math.sin(an) * r]); } });
    K.shape(ctx, pts, { fill: o.gold ? P.gold : P.paper, w: 5, boil: 0.7, seed: o.seed, shade: { color: o.gold ? P.goldDark : P.g5, dx: -10, dy: -10 } });
    ctx.save(); ctx.setLineDash([10, 9]); ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w / 2 - 70, -h / 2 + 14); ctx.lineTo(w / 2 - 70, h / 2 - 14); ctx.stroke(); ctx.restore();
    K.twinkle(ctx, w / 2 - 35, 0, 20, 1, P.ink, o.seed + 3);
    const lh = o.size * 1.15, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => K.text(ctx, lineStr(ln), -35, top + i * lh + 2, { size: i ? o.size * 0.6 : o.size, weight: o.weight, font: i ? K.FONT.label : o.font, fill: lineCol(ln, P.ink) }));
    ctx.restore();
  };

  /* ---------- hang tag on a string (prices, short numbers) ---------- */
  K.hangTag = function (ctx, x, y, str, opt) {
    const o = Object.assign({ a: 1, size: 30, seed: 1600, gold: false, string: 0, font: K.FONT.mono, weight: 700 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = K.textW(ctx, str, o.size, o.weight, o.font) + 40, h = o.size + 20;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(K.now * 2.2 + o.seed) * 0.05);
    if (o.string) K.line(ctx, [[0, h / 2], [0, h / 2 + o.string]], { stroke: P.ink, w: 3, boil: 0.5, seed: o.seed + 1, taper: [1, 1] });
    K.shape(ctx, [[-w / 2 + 14, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2 + 14, h / 2], [-w / 2, 0]], { fill: o.gold ? P.gold : P.paper, w: 4, boil: 0.6, seed: o.seed, shade: { color: o.gold ? P.goldDark : P.g5, dx: 0, dy: -6 } });
    K.dot(ctx, -w / 2 + 14, 0, 4, P.ink, P.ink, 1, o.seed + 2);
    K.text(ctx, str, 7, 1, { size: o.size, weight: o.weight, font: o.font, fill: P.ink });
    ctx.restore();
  };

  /* ---------- typewriter page (code). Python-ish highlighting in greys + gold numbers ---------- */
  const KW = /^(def|return|import|from|for|in|if|else|elif|while|class|lambda|with|as|and|or|not|None|True|False|fn|let|mut|pub|struct|impl|use|match)$/;
  K.typewriter = function (ctx, x, y, w, lines, opt) {
    const o = Object.assign({ a: 1, size: 28, seed: 1700, typed: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.size * 1.5, h = lines.length * lh + 90;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    /* the machine's platen roller behind the page top */
    K.shape(ctx, K.roundPts(-w / 2 - 50, -h / 2 - 30, w + 100, 44, 20), { fill: P.g1, w: 5, boil: 0.6, seed: o.seed, shine: { dx: 0, dy: 8, s: 0.8, a: 0.5 } });
    [-1, 1].forEach((sd, i) => K.dot(ctx, sd * (w / 2 + 64), -h / 2 - 8, 20, P.g2, P.ink, 4, o.seed + 1 + i));
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.paper, w: 4.5, boil: 0.7, seed: o.seed + 3, shade: { color: P.g5, dx: 12, dy: 0 } });
    ctx.save(); ctx.font = `500 ${o.size}px ${K.FONT.mono}`; const cw = ctx.measureText("M").width; ctx.restore();
    const total = lines.reduce((s, l) => s + l.length, 0); let budget = Math.floor(total * o.typed);
    lines.forEach((ln, i) => {
      if (budget <= 0) return; const vis = ln.slice(0, budget); budget -= ln.length;
      const yy = -h / 2 + 46 + lh / 2 + i * lh; let col = 0;
      const toks = vis.match(/#.*$|\/\/.*$|"[^"]*"?|'[^']*'?|[A-Za-z_][A-Za-z0-9_]*|[0-9][0-9_.]*|\s+|./g) || [];
      toks.forEach((tk) => {
        const c = tk.startsWith("#") || tk.startsWith("//") ? P.g3 : KW.test(tk) ? P.ink : /^[0-9]/.test(tk) ? P.goldDark : /^["']/.test(tk) ? P.g2 : P.g1;
        K.text(ctx, tk, -w / 2 + 40 + col * cw, yy, { size: o.size, weight: KW.test(tk) ? 700 : 500, font: K.FONT.mono, fill: c, align: "left" });
        col += tk.length;
      });
    });
    ctx.restore();
  };

  /* ---------- marquee (titles). u = light-up 0..1. returns the text box ---------- */
  K.marquee = function (ctx, cx, cy, w, h, u, opt) {
    const o = Object.assign({ seed: 1800, chase: 0 }, opt || {});
    if (u <= 0) return null;
    const a = K.E.back(clamp(u, 0, 1), 1.6), ww = w * a, hh = h * a;
    ctx.save(); ctx.translate(cx, cy);
    /* hanging chains */
    [-1, 1].forEach((sd, i) => K.line(ctx, [[sd * ww * 0.36, -hh / 2 - 400], [sd * ww * 0.36, -hh / 2]], { stroke: P.g1, w: 6, boil: 0.5, seed: o.seed + i, taper: [1, 1] }));
    K.shape(ctx, K.roundPts(-ww / 2, -hh / 2, ww, hh, 28), { fill: P.ink, w: 7, boil: 0.8, seed: o.seed + 2, shine: { dx: 0, dy: 10, s: 0.96, a: 0.25 } });
    K.shape(ctx, K.roundPts(-ww / 2 + 46, -hh / 2 + 46, ww - 92, hh - 92, 14), { fill: P.g1, stroke: P.paper, w: 3, boil: 0.6, seed: o.seed + 3 });
    /* bulbs around the frame (chase on the beat) */
    const m = 23, path = [[-ww / 2 + m, -hh / 2 + m], [ww / 2 - m, -hh / 2 + m], [ww / 2 - m, hh / 2 - m], [-ww / 2 + m, hh / 2 - m], [-ww / 2 + m, -hh / 2 + m]];
    K.bulbs(ctx, path, Math.round((ww + hh) / 44), o.chase, { r: 9, lit: clamp(u * 1.5 - 0.3, 0, 1), seed: o.seed + 10 });
    ctx.restore();
    return { x: cx - ww / 2, y: cy - hh / 2, w: ww, h: hh };
  };
})(VK);
