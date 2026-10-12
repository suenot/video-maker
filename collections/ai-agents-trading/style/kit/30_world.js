/* ============================================================
   KIT 30 WORLD: the neon trading floor.
   Room (world units, horizon = where the back wall meets the floor):
     K.wall       back wall: panel seams, neon strips top and bottom
     K.floorGrid  synthwave perspective grid that scrolls toward camera
     K.skyWindow  big window: striped retro sun + skyline; dusk 0..1
     K.wallScreen bezel monitor; content drawn by a callback, clipped
     K.desk       trading console with a small CRT and blinking keys
     K.cable      floor cable; neon signal pulses travel along it
     K.ticket     paper order slip (ticker, arrow, qty, stamp)
     K.ledTape    scrolling LED ticker tape (pixel font, tickers only)
     K.sparks     pixel spark burst; K.confetti falling pixel squares
   ============================================================ */
var AK = window.AK || (window.AK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;

  /* ---------- back wall ---------- */
  K.wall = function (ctx, x0, x1, top, horizon, opt) {
    const o = Object.assign({ seed: 3, strip: 1, panel: 240 }, opt || {});
    ctx.save();
    const g = ctx.createLinearGradient(0, top, 0, horizon);
    g.addColorStop(0, P.night); g.addColorStop(0.55, P.wallDark); g.addColorStop(1, P.wall);
    ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, horizon - top);
    /* panel seams (static, not boiled: architecture stays still) */
    ctx.strokeStyle = P.inkSoft; ctx.lineWidth = K.lw(ctx, 3); ctx.beginPath();
    for (let x = Math.ceil(x0 / o.panel) * o.panel; x < x1; x += o.panel) { ctx.moveTo(x, top); ctx.lineTo(x, horizon - 40); }
    ctx.stroke();
    /* baseboard */
    ctx.fillStyle = P.ink; ctx.fillRect(x0, horizon - 40, x1 - x0, 40);
    ctx.restore();
    if (o.strip) {
      K.neon(ctx, [[x0, horizon - 44], [x1, horizon - 44]], { color: P.cyan, w: 6, on: o.strip * K.flick(K.now, o.seed, 0.2), seed: o.seed, boil: 0 });
    }
  };

  /* ---------- perspective floor grid (the 80s horizon) ----------
     vx: vanishing x, horizon y, depth: how far down the floor goes, scroll: z offset */
  K.floorGrid = function (ctx, x0, x1, horizon, depth, opt) {
    const o = Object.assign({ vx: 960, scroll: 0, color: P.pink, rows: 14, cols: 26, spread: 260, a: 1 }, opt || {});
    ctx.save();
    const g = ctx.createLinearGradient(0, horizon, 0, horizon + depth);
    g.addColorStop(0, P.floorFar); g.addColorStop(1, P.floor);
    ctx.fillStyle = g; ctx.fillRect(x0, horizon, x1 - x0, depth);
    ctx.globalAlpha *= o.a; ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = K.rgba(o.color, 0.55); ctx.lineWidth = K.lw(ctx, 2.5);
    ctx.beginPath();
    for (let i = -o.cols; i <= o.cols; i++) { /* radiating lines */
      ctx.moveTo(o.vx + i * 40, horizon); ctx.lineTo(o.vx + i * o.spread * 6, horizon + depth * 1.6);
    }
    for (let j = 0; j < o.rows; j++) { /* receding rows: y = horizon + depth * f(z) */
      const z = j + 1 - (o.scroll % 1), y = horizon + depth / Math.pow(o.rows / z, 1.6);
      if (y > horizon + 2) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
    }
    ctx.stroke();
    /* horizon haze */
    const h = ctx.createLinearGradient(0, horizon - 2, 0, horizon + 70);
    h.addColorStop(0, K.rgba(o.color, 0.45)); h.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = h; ctx.fillRect(x0, horizon - 2, x1 - x0, 72);
    ctx.restore();
  };

  /* ---------- the big window: synthwave sun + skyline ----------
     dusk 0 = late afternoon (sun high), 1 = night (sun gone, stars) */
  K.skyWindow = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ dusk: 0.3, seed: 7 }, opt || {});
    const d = clamp(o.dusk, 0, 1);
    ctx.save();
    K.pathOf(ctx, K.rrPts(x, y, w, h, 26, 3), true); ctx.save(); ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, P.skyTop); g.addColorStop(lerp(0.55, 0.85, d), P.skyMid); g.addColorStop(1, d < 0.85 ? P.skyLow : P.skyMid);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    /* stars fade in at night */
    for (let i = 0; i < 40; i++) {
      const sx = x + hash(i, o.seed) * w, sy = y + hash(i + 50, o.seed) * h * 0.55, tw = 0.5 + 0.5 * Math.sin(K.now * 3 + i);
      ctx.fillStyle = K.rgba("#ffffff", clamp(d * 1.4 - 0.4, 0, 1) * (0.4 + 0.6 * tw)); ctx.fillRect(sx, sy, 3, 3);
    }
    /* striped sun, sinks with dusk */
    const sr = h * 0.36, sx = x + w * 0.5, sy = y + h * lerp(0.5, 1.12, d);
    const sg = ctx.createLinearGradient(0, sy - sr, 0, sy + sr);
    sg.addColorStop(0, P.sunTop); sg.addColorStop(1, P.sunLow);
    ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, K.TAU); ctx.clip();
    ctx.fillStyle = sg; ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
    ctx.fillStyle = P.skyMid;
    for (let i = 0; i < 6; i++) { const yy = sy + sr * (0.05 + i * 0.16), hh = 3 + i * 3.2; ctx.fillRect(sx - sr, yy, sr * 2, hh); }
    ctx.restore();
    K.glow(ctx, sx, sy, sr * 1.8, K.rgba(P.sunLow, 0.5), 1 - d * 0.7);
    /* skyline: flat silhouettes with lit windows */
    let bx = x - 10, i = 0;
    while (bx < x + w) {
      const bw = 50 + hash(i, o.seed + 3) * 90, bh = h * (0.18 + hash(i, o.seed + 4) * 0.34), top = y + h - bh;
      ctx.fillStyle = P.night; ctx.fillRect(bx, top, bw - 6, bh);
      for (let wy = top + 14; wy < y + h - 10; wy += 22) for (let wx = bx + 10; wx < bx + bw - 18; wx += 18) {
        const k = hash(Math.floor(wx) * 7 + Math.floor(wy), o.seed + 9);
        if (k < 0.18 + d * 0.4) { ctx.fillStyle = k < 0.09 ? P.cyan : P.yellow; ctx.globalAlpha = 0.75; ctx.fillRect(wx, wy, 8, 10); ctx.globalAlpha = 1; }
      }
      bx += bw; i++;
    }
    ctx.restore();
    /* frame: chunky navy mullions with a pink rim */
    K.shape(ctx, K.rrPts(x, y, w, h, 26, 3), { fill: null, w: 14, boil: 0.5, seed: o.seed + 20 });
    K.line(ctx, [[x + w / 2, y + 4], [x + w / 2, y + h - 4]], { w: 10, boil: 0.4, seed: o.seed + 21 });
    K.line(ctx, [[x + 4, y + h * 0.42], [x + w - 4, y + h * 0.42]], { w: 10, boil: 0.4, seed: o.seed + 22 });
    K.neon(ctx, K.rrPts(x - 14, y - 14, w + 28, h + 28, 36, 3), { color: P.pink, w: 5, closed: true, on: K.flick(K.now, o.seed + 1, 0.3), seed: o.seed + 23, boil: 0.3 });
    ctx.restore();
  };

  /* ---------- bezel monitor on the wall (content via callback, clipped to the glass) ----------
     draw(ctx, w, h) is called with the origin at the glass's top-left */
  K.wallScreen = function (ctx, x, y, w, h, draw, opt) {
    const o = Object.assign({ a: 1, seed: 11, frame: P.metalDark, on: 1, glow: P.cyan }, opt || {});
    const a = o.a <= 0 ? 0 : o.a >= 1 ? 1 : K.E.back(o.a, 2); if (a <= 0) return;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(a, a); ctx.translate(-w / 2, -h / 2);
    K.glow(ctx, w / 2, h / 2, Math.max(w, h) * 0.75, K.rgba(o.glow, 0.22), o.on);
    K.shape(ctx, K.rrPts(-22, -22, w + 44, h + 44, 30, 3), { fill: o.frame, w: 6, boil: 0.8, seed: o.seed, shade: { color: P.ink, dx: -8, dy: -8, a: 0.6 }, rim: { color: P.violet, dx: 4, dy: 4, a: 0.8 } });
    K.pathOf(ctx, K.rrPts(0, 0, w, h, 18, 3), true);
    ctx.fillStyle = P.screen; ctx.fill();
    ctx.save(); K.pathOf(ctx, K.rrPts(0, 0, w, h, 18, 3), true); ctx.clip();
    ctx.globalAlpha *= o.on;
    if (draw) draw(ctx, w, h);
    ctx.globalAlpha = 1;
    /* glass: scanlines + a soft diagonal reflection */
    ctx.fillStyle = "rgba(0,0,0,0.22)"; for (let yy = 0; yy < h; yy += 6) ctx.fillRect(0, yy, w, 2);
    const rg = ctx.createLinearGradient(0, 0, w, h); rg.addColorStop(0, "rgba(255,255,255,0.10)"); rg.addColorStop(0.4, "rgba(255,255,255,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    ctx.restore();
    K.shape(ctx, K.rrPts(0, 0, w, h, 18, 3), { fill: null, w: 5, boil: 0.6, seed: o.seed + 1 });
    /* power LED */
    K.dot(ctx, w - 8, h + 12, 5, P.green, P.ink, 2, o.seed + 2);
    ctx.restore();
  };

  /* ---------- trading desk: console slab with keys and a small CRT ---------- */
  K.desk = function (ctx, x, y, w, opt) {
    const o = Object.assign({ seed: 31, color: P.metalDark, accent: P.cyan, crt: true, crtDraw: null }, opt || {});
    if (o.crt) {
      const cw = w * 0.42, ch = cw * 0.74, cx = x - cw / 2, cy = y - ch - 70;
      K.shape(ctx, K.rrPts(cx - 16, cy - 16, cw + 32, ch + 40, 22, 3), { fill: P.shellShade, w: 5, boil: 0.8, seed: o.seed + 5, shade: { color: P.shellDark, dx: -8, dy: -8 }, rim: { color: o.accent, a: 0.7 } });
      ctx.save(); K.pathOf(ctx, K.rrPts(cx, cy, cw, ch, 14, 3), true); ctx.fillStyle = P.screen; ctx.fill(); ctx.clip();
      if (o.crtDraw) { ctx.save(); ctx.translate(cx, cy); o.crtDraw(ctx, cw, ch); ctx.restore(); }
      ctx.fillStyle = "rgba(0,0,0,0.25)"; for (let yy = cy; yy < cy + ch; yy += 5) ctx.fillRect(cx, yy, cw, 2);
      ctx.restore();
      K.shape(ctx, K.rrPts(cx, cy, cw, ch, 14, 3), { fill: null, w: 4, boil: 0.5, seed: o.seed + 6 });
      K.shape(ctx, K.rrPts(x - 26, cy + ch + 24, 52, 34, 6, 2), { fill: P.shellDark, w: 4, boil: 0.5, seed: o.seed + 7 });
    }
    /* slab */
    const top = [[x - w / 2, y - 40], [x + w / 2, y - 40], [x + w / 2 + 30, y + 10], [x - w / 2 - 30, y + 10]];
    K.shape(ctx, top, { fill: P.metal, w: 5, boil: 0.8, seed: o.seed, rim: { color: o.accent, dx: 0, dy: 5, a: 0.8 } });
    K.shape(ctx, K.rrPts(x - w / 2 - 30, y + 10, w + 60, 110, 10, 2), { fill: o.color, w: 5, boil: 0.8, seed: o.seed + 1, shade: { color: P.ink, dx: 0, dy: -18, a: 0.5 }, dots: { gap: 11, r: 2.4, alpha: 0.35, color: P.ink } });
    /* keys blink in a seeded pattern at the boil rate */
    for (let i = 0; i < 9; i++) {
      const kx = x - w / 2 + 20 + (i * (w - 40)) / 8, lit = hash(i, o.seed + Math.floor(K.now * 4)) < 0.35;
      K.shape(ctx, K.rrPts(kx - 14, y - 32, 28, 16, 5, 1), { fill: lit ? (i % 3 ? o.accent : P.pink) : P.metalDark, w: 3, boil: 0.4, seed: o.seed + 10 + i, glow: lit ? (i % 3 ? o.accent : P.pink) : null, glowR: 14 });
    }
  };

  /* ---------- floor cable with signal pulses ----------
     pts: polyline; p: draw-in 0..1; pulses: array of u positions 0..1 */
  K.polyAt = function (pts, u) {
    let L = 0; const seg = [];
    for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(l); L += l; }
    let d = clamp(u, 0, 1) * L;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? d / seg[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k), Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0])]; }
      d -= seg[i];
    }
    return [pts[0][0], pts[0][1], 0];
  };
  K.cable = function (ctx, pts, opt) {
    const o = Object.assign({ p: 1, color: P.cyan, w: 10, pulses: [], seed: 41, lit: 0 }, opt || {});
    if (o.p <= 0) return;
    const N = 40, sp = [];
    for (let i = 0; i <= N; i++) { const q = K.polyAt(pts, (i / N) * o.p); sp.push([q[0], q[1]]); }
    K.line(ctx, sp, { stroke: P.ink, w: o.w + 8, boil: 0.6, seed: o.seed });
    K.line(ctx, sp, { stroke: P.rubber, w: o.w, boil: 0.6, seed: o.seed });
    if (o.lit > 0) K.neon(ctx, sp, { color: o.color, w: o.w * 0.35, on: o.lit, seed: o.seed + 3, boil: 0 });
    o.pulses.forEach((u, i) => {
      if (u < 0 || u > o.p) return;
      const q = K.polyAt(pts, u);
      K.glow(ctx, q[0], q[1], o.w * 4.5, K.rgba(o.color, 0.9), 1);
      K.dot(ctx, q[0], q[1], o.w * 0.75, "#ffffff", null, 0, o.seed + 10 + i);
    });
  };

  /* ---------- order ticket (paper slip) ----------
     sym ticker, dir "up" | "down", qty string, stamp 0..1 (check stamp slams on) */
  K.ticket = function (ctx, x, y, s, opt) {
    const o = Object.assign({ sym: "NVDA", dir: "up", qty: "100", stamp: 0, seed: 51, rot: 0, a: 1, stampIcon: "check" }, opt || {});
    const a = o.a <= 0 ? 0 : o.a >= 1 ? 1 : K.E.back(o.a, 2.2); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(s * a, s * a);
    const w = 150, h = 96;
    const edge = [];
    for (let i = 0; i <= 6; i++) edge.push([-w / 2 + (w * i) / 6, -h / 2]);
    edge.push([w / 2, h / 2]);
    for (let i = 6; i >= 0; i--) edge.push([-w / 2 + (w * i) / 6, h / 2 + (i % 2 ? 6 : 0)]); /* torn zigzag bottom */
    K.shape(ctx, edge, { fill: P.paper, w: 4.5, boil: 0.7, seed: o.seed, shade: { color: P.paperShade, dx: -8, dy: -8 } });
    const col = o.dir === "up" ? "#13a35a" : "#d4294d";
    K.text(ctx, o.sym, -w / 2 + 14, -16, { size: 26, font: K.FONT.display, fill: P.ink, align: "left" });
    K.pix(ctx, o.dir, w / 2 - 26, -16, 4.2, col);
    K.text(ctx, "x" + o.qty, -w / 2 + 14, 22, { size: 22, weight: 700, font: K.FONT.mono, fill: P.inkSoft, align: "left" });
    if (o.stamp > 0) {
      const k = K.E.back(clamp(o.stamp, 0, 1), 3), sc = lerp(2.2, 1, k);
      ctx.save(); ctx.translate(36, 14); ctx.rotate(-0.25); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(o.stamp * 3, 0, 1);
      ctx.strokeStyle = o.stampIcon === "cross" ? "#d4294d" : "#13a35a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 24, 0, K.TAU); ctx.stroke();
      K.pix(ctx, o.stampIcon, 0, 0, 5, o.stampIcon === "cross" ? "#d4294d" : "#13a35a");
      ctx.restore();
    }
    ctx.restore();
  };

  /* ---------- LED ticker tape (tickers + numbers only) ---------- */
  K.ledTape = function (ctx, x, y, w, h, items, opt) {
    const o = Object.assign({ speed: 120, seed: 61, size: null }, opt || {});
    const size = o.size || h * 0.42;
    K.shape(ctx, K.rrPts(x, y, w, h, h * 0.3, 2), { fill: "#05060f", w: 5, boil: 0.5, seed: o.seed });
    ctx.save(); K.pathOf(ctx, K.rrPts(x + 6, y + 6, w - 12, h - 12, h * 0.25, 2), true); ctx.clip();
    const parts = items.map((it) => ({ s: it.sym + " " + it.chg, up: it.chg[0] !== "-" }));
    const widths = parts.map((p) => K.textW(ctx, p.s, size, 400, K.FONT.pixel) + size * 2.6);
    const total = widths.reduce((a, b) => a + b, 0);
    let off = -((K.now * o.speed) % total);
    for (let rep = 0; rep < 3; rep++) parts.forEach((p, i) => {
      const xx = x + 20 + off;
      if (xx > x - widths[i] && xx < x + w) {
        K.text(ctx, p.s, xx, y + h / 2 + 2, { size, font: K.FONT.pixel, fill: p.up ? P.gain : P.loss, align: "left", glow: p.up ? P.gain : P.loss, glowR: 10 });
        K.pix(ctx, p.up ? "up" : "down", xx + widths[i] - size * 1.6, y + h / 2, size * 0.16, p.up ? P.gain : P.loss);
      }
      off += widths[i];
    });
    /* LED dot mask */
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    for (let yy = y; yy < y + h; yy += 5) ctx.fillRect(x, yy, w, 1.5);
    ctx.restore();
  };

  /* ---------- pixel spark burst (t0 = start time) ---------- */
  K.sparks = function (ctx, x, y, t0, opt) {
    const o = Object.assign({ n: 10, r: 160, dur: 0.55, color: P.yellow, size: 12, seed: 71 }, opt || {});
    const d = (K.now - t0) / o.dur; if (d < 0 || d > 1) return;
    for (let i = 0; i < o.n; i++) {
      const a = (i / o.n) * K.TAU + hs(i, o.seed) * 0.3, rr = o.r * K.E.out3(d) * (0.7 + 0.3 * hash(i, o.seed + 1));
      const s = o.size * (1 - d) * (i % 2 ? 1 : 0.7), px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr + d * d * 40;
      ctx.save(); ctx.fillStyle = i % 3 === 0 ? P.cyan : i % 3 === 1 ? o.color : P.pink; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
      ctx.fillRect(px - s / 2, py - s / 2, s, s); ctx.restore();
    }
  };
  /* falling pixel confetti in a box, from time t0 */
  K.confetti = function (ctx, x0, x1, y0, t0, opt) {
    const o = Object.assign({ n: 60, fall: 520, seed: 81, size: 14 }, opt || {});
    const d = K.now - t0; if (d < 0) return;
    const cols = [P.pink, P.cyan, P.yellow, P.green, P.violet];
    for (let i = 0; i < o.n; i++) {
      const st = hash(i, o.seed) * 1.2, dd = d - st; if (dd < 0) continue;
      const x = lerp(x0, x1, hash(i, o.seed + 1)) + Math.sin(dd * 3 + i) * 24, y = y0 + dd * o.fall * (0.7 + 0.5 * hash(i, o.seed + 2));
      const s = o.size * (0.6 + 0.6 * hash(i, o.seed + 3)), flip = Math.abs(Math.cos(dd * 6 + i));
      ctx.save(); ctx.translate(x, y); ctx.rotate(dd * 2 + i); ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-s / 2, (-s / 2) * flip, s, s * flip); ctx.restore();
    }
  };
})(AK);
