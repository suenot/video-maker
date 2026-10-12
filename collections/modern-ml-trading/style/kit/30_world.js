/* ============================================================
   LAB KIT 30 WORLD: the greenhouse laboratory (one long set, the camera
   trucks along it) and its props.
     set:    labWall (deco wallpaper, arched greenhouse windows, pipes),
             bench, shelf, lamp, floor
     props:  pot, leaf, seed (the "data seed"), flask, beaker, shears,
             magnifier, wateringCan, sparkle, medal, sunburst, puff, check
   World units: bench top at y = BENCH_Y (780) in the intro; 1 unit = 1 px at z 1.
   ============================================================ */
var LK = window.LK || (window.LK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;

  /* ---------- back wall: sepia wallpaper with an art-deco fan motif ---------- */
  K.labWall = function (ctx, x0, x1, opt) {
    const o = Object.assign({ top: -600, bottom: 1300, dado: 600, windows: [], seed: 3 }, opt || {});
    ctx.save();
    ctx.fillStyle = P.wall; ctx.fillRect(x0, o.top, x1 - x0, o.bottom - o.top);
    /* fan motif rows (static paper print: no boil) */
    ctx.strokeStyle = P.wallLine; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.55;
    const S = 150;
    for (let row = 0; row * S * 0.6 + o.top < o.dado; row++) {
      const y = o.top + 60 + row * S * 0.6, off = (row % 2) * S * 0.5;
      for (let x = x0 - S + off; x < x1 + S; x += S) {
        ctx.beginPath(); ctx.arc(x, y, S * 0.42, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, S * 0.28, Math.PI, 0); ctx.stroke();
        for (let k = 1; k < 6; k++) { const a = Math.PI + (k / 6) * Math.PI; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * S * 0.1, y + Math.sin(a) * S * 0.1); ctx.lineTo(x + Math.cos(a) * S * 0.28, y + Math.sin(a) * S * 0.28); ctx.stroke(); }
      }
    }
    ctx.restore();
    /* wainscot below the dado rail */
    ctx.save(); ctx.fillStyle = P.wallDark; ctx.fillRect(x0, o.dado, x1 - x0, o.bottom - o.dado); ctx.restore();
    for (let x = x0 + 40; x < x1; x += 260) K.shape(ctx, K.rrectPts(x, o.dado + 40, 220, 400, 18), { fill: null, stroke: P.wallLine, w: 3, boil: 0.8, seed: o.seed + x });
    K.shape(ctx, K.rectPts(x0 - 20, o.dado - 12, x1 - x0 + 40, 24, 24), { fill: P.woodLight, w: 3.5, boil: 0.9, seed: o.seed + 1, shade: { color: P.wood, dx: 0, dy: -9 } });
    o.windows.forEach((w, i) => K.archWindow(ctx, w[0], w[1], w[2], w[3], o.seed + 20 + i));
  };

  /* ---------- tall arched greenhouse window with green panes ---------- */
  K.archWindow = function (ctx, cx, top, w, h, seed) {
    const arch = [], r = w / 2;
    for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; arch.push([cx + Math.cos(a) * r, top + r + Math.sin(a) * r]); }
    const pts = arch.concat([[cx + r, top + h], [cx - r, top + h]]);
    K.shape(ctx, pts.map((p) => [p[0] + (p[0] - cx) * 0.08, p[1] - 14]), { fill: P.brassDark, w: 4, boil: 0.9, seed }); /* frame */
    K.shape(ctx, pts, { fill: P.pane, w: 4, boil: 0.9, seed: seed + 1, shade: { color: P.paneDark, dx: 24, dy: 30 } });
    /* plant silhouettes behind the glass */
    ctx.save(); K.pathOf(ctx, pts, true); ctx.clip();
    ctx.globalAlpha = 0.35; ctx.fillStyle = P.leafDark;
    for (let i = 0; i < 5; i++) { const lx = cx - r + (i + 0.5) * (w / 5), ly = top + h - 30 - hash(i, seed) * h * 0.35; K.pathOf(ctx, K.blobPts(lx, ly, 46, 70, 9, seed + i, 0.35), true); ctx.fill(); }
    ctx.globalAlpha = 0.5; ctx.strokeStyle = P.glassHi; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(cx - r * 0.6, top + h * 0.7); ctx.lineTo(cx - r * 0.1, top + h * 0.3); ctx.stroke();
    ctx.restore();
    /* mullions: deco sunrise in the arch + a grid below */
    for (let k = 1; k < 4; k++) { const a = Math.PI + (k / 4) * Math.PI; K.line(ctx, [[cx, top + r], [cx + Math.cos(a) * r, top + r + Math.sin(a) * r]], { stroke: P.brassDark, w: 5, boil: 0.6, seed: seed + 5 + k, taper: false }); }
    K.line(ctx, [[cx - r, top + r], [cx + r, top + r]], { stroke: P.brassDark, w: 6, boil: 0.6, seed: seed + 9, taper: false });
    K.line(ctx, [[cx, top + r], [cx, top + h]], { stroke: P.brassDark, w: 6, boil: 0.6, seed: seed + 10, taper: false });
    for (let y = top + r + (h - r) / 3; y < top + h - 10; y += (h - r) / 3) K.line(ctx, [[cx - r, y], [cx + r, y]], { stroke: P.brassDark, w: 5, boil: 0.6, seed: seed + y, taper: false });
  };

  /* ---------- brass pipe along the wall (pts), with joints ---------- */
  K.pipe = function (ctx, pts, opt) {
    const o = Object.assign({ w: 22, seed: 40 }, opt || {});
    K.line(ctx, pts, { stroke: P.ink, w: o.w + 8, boil: 0.7, seed: o.seed, taper: false });
    K.line(ctx, pts, { stroke: P.brass, w: o.w, boil: 0.7, seed: o.seed + 1, taper: false });
    K.line(ctx, pts.map((p) => [p[0] - 3, p[1] - 4]), { stroke: P.brassLight, w: o.w * 0.25, boil: 0.7, seed: o.seed + 2 });
    pts.forEach((p, i) => { if (i && i < pts.length - 1) K.shape(ctx, K.ellipsePts(p[0], p[1], o.w * 0.9, o.w * 0.9, 10), { fill: P.brassDark, w: 3.5, boil: 0.6, seed: o.seed + 10 + i }); });
  };

  /* ---------- workbench: top at y, legs and a drawer apron below ---------- */
  K.bench = function (ctx, x0, x1, y, opt) {
    const o = Object.assign({ seed: 60, drawers: 3 }, opt || {});
    const w = x1 - x0;
    for (let x = x0 + 60; x < x1; x += Math.max(400, w / 4)) K.shape(ctx, K.rectPts(x, y + 30, 34, 420, 2), { fill: P.woodDark, w: 4, boil: 0.8, seed: o.seed + x });
    K.shape(ctx, K.rectPts(x0 + 30, y + 30, w - 60, 150, 6), { fill: P.wood, w: 4.5, boil: 1, seed: o.seed + 1, shade: { color: P.woodDark, dx: 0, dy: -36 }, dots: { gap: 10, alpha: 0.25 } });
    for (let i = 0; i < Math.floor(w / 360); i++) {
      const dx = x0 + 80 + i * 360;
      K.shape(ctx, K.rrectPts(dx, y + 54, 300, 96, 10), { fill: P.woodLight, w: 3.5, boil: 0.8, seed: o.seed + 10 + i, shade: { color: P.wood, dx: 0, dy: -12 } });
      K.shape(ctx, K.rrectPts(dx + 120, y + 90, 60, 18, 9), { fill: P.brass, w: 3, boil: 0.5, seed: o.seed + 30 + i });
    }
    K.shape(ctx, K.rectPts(x0, y - 6, w, 40, 8), { fill: P.woodLight, w: 5, boil: 1.1, seed: o.seed + 2, shade: { color: P.wood, dx: 0, dy: -14 }, rim: 3 });
  };
  /* wall shelf with two brackets */
  K.shelf = function (ctx, x0, x1, y, seed) {
    seed = seed || 80;
    [x0 + 60, x1 - 60].forEach((bx, i) => K.shape(ctx, [[bx - 14, y], [bx + 14, y], [bx + 14, y + 90], [bx - 14, y + 40]], { fill: P.brassDark, w: 3.5, boil: 0.7, seed: seed + i }));
    K.shape(ctx, K.rectPts(x0, y - 22, x1 - x0, 26, 8), { fill: P.woodLight, w: 4.5, boil: 1, seed: seed + 3, shade: { color: P.wood, dx: 0, dy: -9 } });
  };
  /* hanging art-deco lamp with a warm light cone */
  K.lamp = function (ctx, x, y, opt) {
    const o = Object.assign({ seed: 90, len: 260, on: 1, sway: 0 }, opt || {});
    const sx = x + o.sway;
    K.line(ctx, [[x, y - o.len], [sx, y - 40]], { stroke: P.ink, w: 4, boil: 0.6, seed: o.seed, taper: false });
    if (o.on > 0) { K.glow(ctx, sx, y + 30, 420, "rgba(255,226,150,0.55)", o.on); }
    K.shape(ctx, [[sx - 26, y - 40], [sx + 26, y - 40], [sx + 90, y + 34], [sx - 90, y + 34]], { fill: P.glassDark, w: 4.5, boil: 0.9, seed: o.seed + 1, shade: { color: P.glassDeep, dx: 18, dy: 0 } });
    K.shape(ctx, K.rectPts(sx - 92, y + 30, 184, 12, 6), { fill: P.brass, w: 3.5, boil: 0.6, seed: o.seed + 2 });
    K.dot(ctx, sx, y + 50, 20, "#fff4c8", P.ink, 3, o.seed + 3);
  };

  /* ---------- terracotta pot with soil ---------- */
  K.pot = function (ctx, x, y, s, opt) {
    const o = Object.assign({ seed: 100, color: P.pot, shadow: P.potDark, squash: 0 }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + o.squash * 0.5), s / (1 + o.squash * 0.5));
    K.shape(ctx, [[-70, -96], [70, -96], [56, 0], [-56, 0]], { fill: o.color, w: 5, boil: 1, seed: o.seed, shade: { color: o.shadow, dx: -22, dy: 0 }, dots: { gap: 8, alpha: 0.25 } });
    K.shape(ctx, K.rectPts(-82, -120, 164, 34, 6), { fill: o.color, w: 5, boil: 1, seed: o.seed + 1, shade: { color: o.shadow, dx: 0, dy: -10 }, rim: 2.5 });
    K.shape(ctx, K.ellipsePts(0, -120, 70, 10, 12), { fill: P.soil, w: 3, boil: 0.6, seed: o.seed + 2 });
    ctx.restore();
  };
  /* single leaf, base at (x,y) pointing along ang */
  K.leaf = function (ctx, x, y, ang, s, seed, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    K.shape(ctx, [[0, 0], [16, -12], [38, -10], [56, 0], [38, 10], [16, 12]], { fill: color || P.leaf, w: 3.2, boil: 0.7, seed, shade: { color: P.leafDark, dx: 0, dy: -7 } });
    K.line(ctx, [[4, 0], [46, 0]], { stroke: P.leafDark, w: 2.2, boil: 0.4, seed: seed + 1 });
    ctx.restore();
  };

  /* ---------- the data seed: a brass-green capsule engraved with a tiny chart ---------- */
  K.seed = function (ctx, x, y, r, opt) {
    const o = Object.assign({ seed: 120, rot: 0, glow: 0 }, opt || {});
    if (o.glow > 0) K.glow(ctx, x, y, r * 4, P.glow, o.glow);
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot);
    const pts = [[0, -r * 1.25], [r * 0.7, -r * 0.6], [r * 0.85, r * 0.3], [0, r * 1.05], [-r * 0.85, r * 0.3], [-r * 0.7, -r * 0.6]];
    K.shape(ctx, pts, { fill: P.glassDark, w: Math.max(2.5, r * 0.13), boil: 0.5, seed: o.seed, shade: { color: P.glassDeep, dx: -r * 0.3, dy: -r * 0.25 }, rim: Math.max(1.5, r * 0.08) });
    /* engraved candles */
    for (let i = 0; i < 3; i++) {
      const cx = (i - 1) * r * 0.36, h = r * (0.3 + 0.25 * i), cy = r * 0.2 - h * 0.4 - i * r * 0.1;
      K.line(ctx, [[cx, cy - h * 0.8], [cx, cy + h * 0.8]], { stroke: P.brassLight, w: Math.max(1.4, r * 0.06), boil: 0.2, seed: o.seed + 5 + i, taper: false });
      K.shape(ctx, K.rectPts(cx - r * 0.1, cy - h * 0.45, r * 0.2, h * 0.9, 1), { fill: P.brassLight, stroke: null, w: 0, boil: 0.2, seed: o.seed + 9 + i });
    }
    ctx.restore();
  };

  /* ---------- round-bottom flask ----------
     layers: [{ h: 0..1 of the bowl, color }] stacked from the bottom; bubbles; tag */
  K.flask = function (ctx, x, y, s, opt) {
    const o = Object.assign({ seed: 140, layers: [{ h: 0.55, color: P.glass }], bubbles: 0, cork: true, glowA: 0, label: "", rot: 0 }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(s, s);
    if (o.glowA > 0) K.glow(ctx, 0, -70, 190, "rgba(190,255,200,0.9)", o.glowA);
    const R = 62, cy = -R - 4;
    const bowl = [];
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + 0.38 + (i / 16) * (K.TAU - 0.76); bowl.push([Math.cos(a) * R, cy - Math.sin(a) * R]); }
    const outline = [[-17, cy - R - 76]].concat(bowl.slice().reverse().map((p) => p), [[17, cy - R - 76]]);
    const neck = [[-17, cy - R - 76], [17, cy - R - 76], [17, cy - R + 6], [-17, cy - R + 6]];
    /* glass body */
    K.shape(ctx, K.ellipsePts(0, cy, R, R, 18), { fill: "rgba(214,240,226,0.55)", stroke: null, w: 0, boil: 0.6, seed: o.seed });
    K.shape(ctx, neck, { fill: "rgba(214,240,226,0.55)", stroke: null, w: 0, boil: 0.6, seed: o.seed + 1 });
    /* liquid layers: clip to the bowl */
    ctx.save(); K.pathOf(ctx, K.ellipsePts(0, cy, R - 5, R - 5, 18), true); ctx.clip();
    let base = cy + R;
    o.layers.forEach((L, i) => {
      const hh = L.h * 2 * R, wob = Math.sin(K.now * 3 + i + o.seed) * 3;
      ctx.fillStyle = L.color; ctx.beginPath(); ctx.moveTo(-R, base); ctx.lineTo(-R, base - hh + wob); ctx.quadraticCurveTo(0, base - hh - wob, R, base - hh + wob); ctx.lineTo(R, base); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-R, base - hh + wob); ctx.quadraticCurveTo(0, base - hh - wob, R, base - hh + wob); ctx.stroke();
      base -= hh;
    });
    for (let i = 0; i < o.bubbles; i++) {
      const ph = (K.now * 0.9 + hash(i, o.seed)) % 1, bx = hs(i, o.seed + 3) * R * 0.5, by = cy + R - 10 - ph * (cy + R - base);
      K.dot(ctx, bx + Math.sin(K.now * 4 + i) * 3, by, 4 + 3 * hash(i, 5), "rgba(255,255,255,0.7)", P.ink, 1.6, o.seed + 30 + i);
    }
    ctx.restore();
    /* outline + highlight */
    K.shape(ctx, outline, { fill: null, w: 5, boil: 0.9, seed: o.seed + 2, closed: true });
    K.line(ctx, [[-R * 0.62, cy - R * 0.2], [-R * 0.45, cy - R * 0.55], [-R * 0.18, cy - R * 0.72]], { stroke: P.glassHi, w: 6, boil: 0.5, seed: o.seed + 3 });
    K.shape(ctx, K.rectPts(-23, cy - R - 82, 46, 12, 4), { fill: P.glassHi, w: 3.5, boil: 0.5, seed: o.seed + 4 }); /* lip */
    if (o.cork) K.shape(ctx, K.rectPts(-15, cy - R - 104, 30, 26, 3), { fill: P.woodLight, w: 3.5, boil: 0.6, seed: o.seed + 5, shade: { color: P.wood, dx: 8, dy: 0 } });
    if (o.label) {
      K.shape(ctx, K.rrectPts(-34, cy - 8, 68, 40, 8), { fill: P.paper, w: 3, boil: 0.5, seed: o.seed + 6 });
      K.text(ctx, o.label, 0, cy + 13, { size: 28, weight: 600, font: K.FONT.mono, fill: P.ink });
    }
    ctx.restore();
  };
  /* simple straight beaker (props on the bench) */
  K.beaker = function (ctx, x, y, s, color, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const body = [[-40, -120], [40, -120], [36, 0], [-36, 0]];
    K.shape(ctx, body, { fill: "rgba(214,240,226,0.5)", stroke: null, w: 0, boil: 0.5, seed });
    K.shape(ctx, [[-38, -60], [38, -60], [36, 0], [-36, 0]], { fill: color || P.glass, stroke: null, w: 0, boil: 0.5, seed: seed + 1 });
    K.shape(ctx, body.concat([[-48, -126]]), { fill: null, w: 4.5, boil: 0.8, seed: seed + 2 });
    for (let i = 1; i < 4; i++) K.line(ctx, [[-36, -i * 28], [-18, -i * 28]], { stroke: P.ink, w: 2.5, boil: 0.4, seed: seed + 5 + i });
    ctx.restore();
  };

  /* ---------- tools ---------- */
  K.shears = function (ctx, x, y, ang, open, s, seed) {
    seed = seed || 160;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s || 1, s || 1);
    const o = 0.08 + 0.5 * clamp(open, 0, 1);
    [-1, 1].forEach((sd, i) => {
      ctx.save(); ctx.rotate(sd * o);
      K.shape(ctx, [[0, -5 * sd], [70, -9 * sd], [96, -2 * sd], [70, 4 * sd], [0, 4 * sd]], { fill: "#d8dcd2", w: 3.5, boil: 0.6, seed: seed + i, rim: 1.5 });
      K.shape(ctx, K.ellipsePts(-34, 0, 30, 11, 10, -sd * 0.25), { fill: P.bad, w: 3.5, boil: 0.6, seed: seed + 3 + i, shade: { color: "#7a2420", dx: 0, dy: 5 } });
      ctx.restore();
    });
    K.dot(ctx, 0, 0, 6, P.brass, P.ink, 2.5, seed + 9);
    ctx.restore();
  };
  K.magnifier = function (ctx, x, y, ang, s, seed) {
    seed = seed || 170;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s || 1, s || 1);
    K.shape(ctx, K.rrectPts(-4, -9, 70, 18, 8), { fill: P.wood, w: 3.5, boil: 0.6, seed });
    K.shape(ctx, K.ellipsePts(108, 0, 44, 44, 16), { fill: "rgba(220,250,236,0.45)", w: 9, stroke: P.brass, boil: 0.6, seed: seed + 1 });
    K.shape(ctx, K.ellipsePts(108, 0, 50, 50, 16), { fill: null, w: 3.5, boil: 0.6, seed: seed + 2 });
    K.line(ctx, [[84, -18], [96, -30]], { stroke: "#ffffff", w: 5, boil: 0.4, seed: seed + 3 });
    ctx.restore();
  };
  K.wateringCan = function (ctx, x, y, ang, s, seed) {
    seed = seed || 180;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s || 1, s || 1);
    K.shape(ctx, [[-10, -20], [60, -32], [118, -64], [126, -54], [64, -14]], { fill: P.copper, w: 3.5, boil: 0.7, seed });
    K.shape(ctx, K.rrectPts(-80, -60, 90, 80, 14), { fill: P.copper, w: 4.5, boil: 0.8, seed: seed + 1, shade: { color: "#844524", dx: -16, dy: 0 }, rim: 2 });
    K.line(ctx, [[-70, -60], [-36, -96], [0, -60]], { stroke: P.ink, w: 7, boil: 0.6, seed: seed + 2, taper: false });
    ctx.restore();
  };

  /* ---------- effects ---------- */
  K.sparkle = function (ctx, x, y, r, a, seed) {
    if (a <= 0 || r <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(hs(seed || 1, 3) * 0.4); ctx.globalAlpha *= clamp(a, 0, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.3 : r; const ang = (i / 8) * K.TAU; pts.push([Math.cos(ang) * rr, Math.sin(ang) * rr]); }
    K.shape(ctx, pts, { fill: P.brassLight, w: 3, boil: 0.5, seed: seed || 1 });
    ctx.restore();
  };
  /* scalloped brass medal (episode badges); icon(ctx, r) draws inside */
  K.medal = function (ctx, x, y, r, opt) {
    const o = Object.assign({ seed: 200, color: P.glassDark, icon: null }, opt || {});
    const sc = [];
    for (let i = 0; i < 24; i++) { const a = (i / 24) * K.TAU, rr = r * (i % 2 ? 0.93 : 1.04); sc.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    K.shape(ctx, sc, { fill: P.brass, w: 4, boil: 0.7, seed: o.seed, shade: { color: P.brassDark, dx: -r * 0.12, dy: -r * 0.12 } });
    K.shape(ctx, K.ellipsePts(x, y, r * 0.74, r * 0.74, 16), { fill: o.color, w: 3.5, boil: 0.6, seed: o.seed + 1, rim: 2 });
    if (o.icon) { ctx.save(); ctx.translate(x, y); o.icon(ctx, r * 0.74); ctx.restore(); }
  };
  /* art-deco sunburst: alternating rays behind a title or a reveal */
  K.sunburst = function (ctx, x, y, r, opt) {
    const o = Object.assign({ n: 24, a: 1, c1: "rgba(255,236,170,0.35)", c2: "rgba(255,236,170,0.0)", rot: 0 }, opt || {});
    if (o.a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.globalAlpha *= o.a;
    for (let i = 0; i < o.n; i++) {
      const a0 = (i / o.n) * K.TAU, a1 = ((i + 0.5) / o.n) * K.TAU;
      ctx.fillStyle = o.c1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0, a1); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };
  /* steam / dust puff, life u 0..1 */
  K.puff = function (ctx, x, y, r, u, seed) {
    if (u <= 0 || u >= 1) return;
    K.shape(ctx, K.blobPts(x, y - u * 60, r * (0.5 + u), r * (0.45 + u * 0.9), 9, seed, 0.25), { fill: P.paper, w: 3, boil: 0.8, seed, alpha: 1 - u * u });
  };
  /* validation tick on a round green stamp */
  K.check = function (ctx, x, y, r, a, seed) {
    if (a <= 0) return;
    const s = K.E.back(clamp(a, 0, 1), 2.6);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.12);
    K.shape(ctx, K.ellipsePts(0, 0, r, r, 14), { fill: P.good, w: 4, boil: 0.6, seed: seed || 210, rim: 2 });
    K.line(ctx, [[-r * 0.45, 0], [-r * 0.1, r * 0.35], [r * 0.5, -r * 0.4]], { stroke: P.paper, w: r * 0.22, boil: 0.4, seed: (seed || 210) + 1, taper: false });
    ctx.restore();
  };
  /* oxblood cross (rejected, overfit) */
  K.cross = function (ctx, x, y, r, a, seed) {
    if (a <= 0) return;
    const s = K.E.back(clamp(a, 0, 1), 2.6);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(0.1);
    K.shape(ctx, K.ellipsePts(0, 0, r, r, 14), { fill: P.bad, w: 4, boil: 0.6, seed: seed || 220 });
    K.line(ctx, [[-r * 0.4, -r * 0.4], [r * 0.4, r * 0.4]], { stroke: P.paper, w: r * 0.2, boil: 0.4, seed: (seed || 220) + 1, taper: false });
    K.line(ctx, [[r * 0.4, -r * 0.4], [-r * 0.4, r * 0.4]], { stroke: P.paper, w: r * 0.2, boil: 0.4, seed: (seed || 220) + 2, taper: false });
    ctx.restore();
  };
  /* ---------- feature pellet: a round seed-cake with a language-free feature icon ----------
     kind 0 candles (price), 1 bars (volume), 2 wave (cycle), 3 dot cloud (alt data) */
  K.pellet = function (ctx, x, y, r, kind, seed) {
    seed = seed || 240;
    K.shape(ctx, K.ellipsePts(x, y, r, r, 12), { fill: [P.brass, P.leafLight, P.glass, P.test][kind % 4], w: Math.max(2.5, r * 0.12), boil: 0.4, seed, rim: 1.5 });
    const c = P.ink, w = Math.max(1.6, r * 0.11);
    if (kind % 4 === 0) [-0.4, 0, 0.4].forEach((dx, i) => { K.line(ctx, [[x + dx * r, y - r * 0.5 + i * 3], [x + dx * r, y + r * 0.45 - i * 3]], { stroke: c, w, boil: 0.2, seed: seed + i, taper: false }); });
    else if (kind % 4 === 1) [0.3, 0.7, 0.5].forEach((h, i) => K.line(ctx, [[x + (i - 1) * r * 0.42, y + r * 0.5], [x + (i - 1) * r * 0.42, y + r * 0.5 - h * r]], { stroke: c, w: w * 1.4, boil: 0.2, seed: seed + i, taper: false }));
    else if (kind % 4 === 2) K.line(ctx, [[x - r * 0.6, y], [x - r * 0.3, y - r * 0.4], [x, y], [x + r * 0.3, y + r * 0.4], [x + r * 0.6, y]], { stroke: c, w, boil: 0.2, seed });
    else for (let i = 0; i < 5; i++) K.dot(ctx, x + hs(i, seed) * r * 0.5, y + hs(i + 9, seed) * r * 0.5, r * 0.1, c, null, 0, seed + i);
  };
  /* glass jar of feature pellets (held by the owl when feeding) */
  K.jar = function (ctx, x, y, s, seed) {
    seed = seed || 250;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shape(ctx, K.rrectPts(-42, -100, 84, 100, 18), { fill: "rgba(214,240,226,0.6)", w: 4.5, boil: 0.7, seed });
    for (let i = 0; i < 6; i++) K.pellet(ctx, -22 + (i % 3) * 22, -22 - Math.floor(i / 3) * 22, 10, i, seed + 10 + i * 3);
    K.shape(ctx, K.rectPts(-46, -114, 92, 18, 3), { fill: P.brass, w: 3.5, boil: 0.5, seed: seed + 2 });
    ctx.restore();
  };
  /* feather duster (keeping the backtest clean) */
  K.duster = function (ctx, x, y, ang, s, seed) {
    seed = seed || 260;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s || 1, s || 1);
    K.shape(ctx, K.rrectPts(-6, -7, 90, 14, 7), { fill: P.wood, w: 3.5, boil: 0.5, seed });
    for (let i = 0; i < 7; i++) { const a = -0.9 + (i / 6) * 1.8 + Math.sin(K.now * 14 + i) * 0.08; ctx.save(); ctx.translate(86, 0); ctx.rotate(a); K.shape(ctx, [[0, 0], [30, -12], [70, -6], [84, 0], [70, 6], [30, 12]], { fill: i % 2 ? P.bad : P.test, w: 3, boil: 0.8, seed: seed + 3 + i }); ctx.restore(); }
    ctx.restore();
  };
})(LK);
