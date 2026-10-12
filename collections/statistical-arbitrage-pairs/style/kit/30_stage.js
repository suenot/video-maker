/* ============================================================
   VAUDEVILLE KIT 30 STAGE: the world. A 1920s vaudeville house seen
   from the stalls. World units = 1080p pixels at camera z = 1, with the
   stage opening centred on (960, 540) and the floor line at FLOOR_Y.
     backdrop, floor, footlights, curtain, valance, proscenium, bulbs,
     spot, piano, stool, gauge (the z-meter), spring (the spread),
     coin, coinRain, bell, note, cane
   Only gold is a hue: coins, the z-meter's +/-2 zones, a stretched spring.
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  K.FLOOR_Y = 800;

  /* ---------- painted backdrop: striped wallpaper, wainscot, a soft light pool ---------- */
  K.backdrop = function (ctx, opt) {
    const o = Object.assign({ x0: -400, x1: 2320, y0: -300, y1: K.FLOOR_Y, light: 0.5, lx: 960, ly: 420 }, opt || {});
    ctx.save();
    ctx.fillStyle = P.g4; ctx.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
    /* damask stripes: wide pale band, thin dark pinstripe */
    for (let x = o.x0, i = 0; x < o.x1; x += 92, i++) {
      ctx.fillStyle = "rgba(200,195,184,0.35)"; ctx.fillRect(x, o.y0, 46, o.y1 - o.y0);
      K.line(ctx, [[x + 69, o.y0], [x + 69, o.y1 - 150]], { stroke: P.g3, w: 3, boil: 0.6, seed: 300 + i, taper: [1, 1], alpha: 0.5 });
      /* a little fleur stamp on each pale band */
      for (let y = o.y0 + 60 + (i % 2) * 70; y < o.y1 - 190; y += 140) {
        ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = P.g3; ctx.beginPath();
        ctx.moveTo(x + 23, y - 14); ctx.quadraticCurveTo(x + 36, y, x + 23, y + 14); ctx.quadraticCurveTo(x + 10, y, x + 23, y - 14); ctx.fill(); ctx.restore();
      }
    }
    /* wainscot + chair rail */
    K.shape(ctx, K.rectPts(o.x0, o.y1 - 150, o.x1 - o.x0, 150, 6), { fill: P.g3, w: 5, boil: 0.8, seed: 310, shade: { color: P.g2, dx: 0, dy: -18 } });
    for (let x = o.x0 + 40, i = 0; x < o.x1 - 120; x += 180, i++) K.shape(ctx, K.rectPts(x, o.y1 - 122, 140, 92, 2), { fill: null, w: 3, boil: 0.7, seed: 320 + i });
    K.line(ctx, [[o.x0, o.y1 - 150], [o.x1, o.y1 - 150]], { stroke: P.ink, w: 8, boil: 0.8, seed: 330, taper: [1, 1] });
    /* warm pool of stage light on the wall (white, additive) */
    if (o.light > 0) K.glow(ctx, o.lx, o.ly, 760, "rgba(255,250,235,0.55)", o.light);
    ctx.restore();
  };

  /* ---------- stage floor: boards converging to a vanishing point ---------- */
  K.floor = function (ctx, opt) {
    const o = Object.assign({ x0: -400, x1: 2320, y0: K.FLOOR_Y, y1: 1300, vx: 960, vy: -900 }, opt || {});
    ctx.save();
    const g = ctx.createLinearGradient(0, o.y0, 0, o.y1);
    g.addColorStop(0, P.g3); g.addColorStop(1, P.g2);
    ctx.fillStyle = g; ctx.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
    for (let i = -14; i <= 14; i++) {
      const xb = o.vx + i * 150, k = (o.y1 - o.vy) / (o.y0 - o.vy), xt = o.vx + (xb - o.vx) / k;
      K.line(ctx, [[xt, o.y0], [xb, o.y1]], { stroke: P.g1, w: 3, boil: 0.5, seed: 340 + i, taper: [0.6, 1], alpha: 0.55 });
    }
    [0.18, 0.45, 0.8].forEach((u, i) => K.line(ctx, [[o.x0, lerp(o.y0, o.y1, u * u)], [o.x1, lerp(o.y0, o.y1, u * u)]], { stroke: P.g1, w: 2.5, boil: 0.5, seed: 360 + i, alpha: 0.35, taper: [1, 1] }));
    K.line(ctx, [[o.x0, o.y0], [o.x1, o.y0]], { stroke: P.ink, w: 7, boil: 0.8, seed: 370, taper: [1, 1] });
    ctx.restore();
  };

  /* ---------- footlights: shell hoods with bulbs along the stage lip ---------- */
  K.footlights = function (ctx, y, x0, x1, n, on) {
    on = on == null ? 1 : on;
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, (i + 0.5) / n);
      if (on > 0) K.glow(ctx, x, y - 26, 120, "rgba(255,248,226,0.7)", on * (0.75 + 0.25 * hash(i, K.bf)));
      K.shape(ctx, [[x - 46, y], [x - 38, y - 30], [x, y - 44], [x + 38, y - 30], [x + 46, y]], { fill: P.g1, w: 4, boil: 0.7, seed: 380 + i, shine: { dx: 4, dy: 6, s: 0.7, a: 0.5 } });
    }
  };

  /* ---------- side curtain (side -1 left, +1 right). open 0 = closed to centre ---------- */
  K.curtain = function (ctx, side, open, opt) {
    const o = Object.assign({ top: -60, bottom: 1120, seed: 400, color: P.g2 }, opt || {});
    const xIn = side < 0 ? lerp(985, 150, open) : lerp(935, 1770, open), xOut = side < 0 ? -420 : 2340;
    const H = o.bottom - o.top, tieY = o.top + H * 0.62, bulge = 120 * open;
    const inner = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12, y = o.top + H * u;
      /* gathered at the tie-back: the inner edge swings toward the wing */
      const pull = Math.sin(Math.min(1, u / 0.62) * Math.PI / 2) * (u < 0.62 ? 1 : 1 - (u - 0.62) / 0.38 * 0.55);
      inner.push([xIn - side * bulge * pull + hs(i, o.seed + 1) * 2 + Math.sin(K.now * 1.3 + u * 3) * 3, y]);
    }
    const hem = [];
    for (let i = 0; i <= 8; i++) { const x = lerp(inner[12][0], xOut, i / 8); hem.push([x, o.bottom + 10 * Math.sin(i * 2.4)]); }
    const pts = [[xOut, o.top]].concat(inner, hem.slice(1));
    K.shape(ctx, pts, { fill: o.color, w: 6, boil: 1, seed: o.seed, shade: { color: P.g1, dx: side * 34, dy: 0 } });
    /* folds: deep shadow lines + pale ridge highlights */
    ctx.save(); K.pathOf(ctx, pts, true); ctx.clip();
    for (let k = 1; k <= 6; k++) {
      const u = k / 7, line = inner.map((p, i) => [lerp(p[0], xOut, u) + Math.sin(i * 0.9 + k) * 10, p[1]]);
      K.line(ctx, line, { stroke: P.g1, w: 16, boil: 1, seed: o.seed + 10 + k, alpha: 0.7, taper: [0.5, 1] });
      K.line(ctx, line.map((p) => [p[0] - side * 22, p[1]]), { stroke: P.g3, w: 7, boil: 1, seed: o.seed + 30 + k, alpha: 0.6, taper: [0.2, 0.8] });
    }
    ctx.restore();
    /* tie-back rope + tassel when open */
    if (open > 0.3) {
      const tp = inner[Math.round(0.62 * 12)];
      K.line(ctx, [[tp[0] - side * 4, tp[1] - 20], [tp[0] + side * 60, tp[1]], [tp[0] + side * 120, tp[1] + 6]], { stroke: P.g5, w: 10, boil: 0.8, seed: o.seed + 50 });
      K.shape(ctx, [[tp[0] - 10, tp[1] + 4], [tp[0] + 10, tp[1] + 4], [tp[0] + 18, tp[1] + 64], [tp[0] - 18, tp[1] + 64]], { fill: P.g5, w: 4, boil: 0.8, seed: o.seed + 51 });
    }
  };

  /* ---------- top valance: swagged drape with fringe across the opening ---------- */
  K.valance = function (ctx, y, opt) {
    const o = Object.assign({ x0: -300, x1: 2220, depth: 150, swags: 5, seed: 420 }, opt || {});
    const w = (o.x1 - o.x0) / o.swags;
    K.shape(ctx, K.rectPts(o.x0, y - 400, o.x1 - o.x0, 400 + 30, 6), { fill: P.g1, w: 6, boil: 0.8, seed: o.seed });
    for (let i = 0; i < o.swags; i++) {
      const a = o.x0 + i * w, pts = [];
      for (let k = 0; k <= 10; k++) { const u = k / 10; pts.push([a + w * u, y + 20 + Math.sin(u * Math.PI) * o.depth]); }
      const poly = [[a, y - 10]].concat(pts, [[a + w, y - 10]]);
      K.shape(ctx, poly, { fill: P.g2, w: 5, boil: 1, seed: o.seed + 1 + i, shade: { color: P.g1, dx: 0, dy: -24 } });
      K.line(ctx, pts.map((p) => [p[0], p[1] - 34]), { stroke: P.g3, w: 6, boil: 0.8, seed: o.seed + 20 + i, alpha: 0.7 });
      /* fringe */
      for (let k = 1; k < 10; k++) { const p = pts[k]; K.line(ctx, [[p[0], p[1]], [p[0] + hs(k, i) * 2, p[1] + 22]], { stroke: P.g5, w: 4, boil: 0.5, seed: o.seed + 40 + i * 10 + k, taper: [1, 0.3] }); }
      /* tassel where two swags meet */
      if (i > 0) { const tx = a, ty = y + 10; K.shape(ctx, [[tx - 9, ty], [tx + 9, ty], [tx + 16, ty + 58], [tx - 16, ty + 58]], { fill: P.g5, w: 4, boil: 0.8, seed: o.seed + 60 + i }); K.dot(ctx, tx, ty, 10, P.g5, P.ink, 3, o.seed + 70 + i); }
    }
  };

  /* ---------- proscenium pillars + bulb chase ---------- */
  K.proscenium = function (ctx, opt) {
    const o = Object.assign({ x: [40, 1880], top: -300, bottom: 1200, seed: 440 }, opt || {});
    o.x.forEach((x, i) => {
      const sd = i ? 1 : -1, w = 230, x0 = sd < 0 ? x - w : x;
      K.shape(ctx, K.rectPts(x0, o.top, w, o.bottom - o.top, 6), { fill: P.g1, w: 6, boil: 0.8, seed: o.seed + i, shade: { color: P.ink, dx: sd * 40, dy: 0 } });
      /* fluting */
      for (let k = 0; k < 4; k++) K.line(ctx, [[x0 + 50 + k * 42, o.top], [x0 + 50 + k * 42, o.bottom]], { stroke: P.g2, w: 10, boil: 0.6, seed: o.seed + 10 + k + i * 5, taper: [1, 1] });
    });
  };
  /* chasing marquee bulbs along a polyline; chase = phase (bulbs step every beat) */
  K.bulbs = function (ctx, pts, n, chase, opt) {
    const o = Object.assign({ r: 11, seed: 460, lit: 1, gold: false }, opt || {});
    const L = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    for (let k = 0; k < n; k++) {
      let d = (tot * k) / Math.max(1, n - 1), s = 0; while (s < L.length - 1 && d > L[s]) { d -= L[s]; s++; }
      const u = clamp(d / (L[s] || 1), 0, 1), x = lerp(pts[s][0], pts[s + 1][0], u), y = lerp(pts[s][1], pts[s + 1][1], u);
      const on = o.lit * (((k + Math.floor(chase)) % 3) === 0 ? 1 : 0.45);
      if (on > 0.5) K.glow(ctx, x, y, o.r * 4.2, o.gold ? "rgba(255,215,106,0.9)" : "rgba(255,250,232,0.85)", on);
      K.dot(ctx, x, y, o.r, on > 0.5 ? (o.gold ? P.goldLight : P.shine) : P.g4, P.ink, 3, o.seed + k);
    }
  };

  /* ---------- spotlight: cone from above to a pool on the floor ---------- */
  K.spot = function (ctx, x, yFloor, w, a, src) {
    if (a <= 0) return;
    const s = src || [x + 300, -200];
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(s[0], s[1], x, yFloor);
    g.addColorStop(0, "rgba(255,250,236,0.05)"); g.addColorStop(1, "rgba(255,250,236,0.22)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(s[0] - 30, s[1]); ctx.lineTo(s[0] + 30, s[1]); ctx.lineTo(x + w / 2, yFloor); ctx.lineTo(x - w / 2, yFloor); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a * 0.55;
    ctx.translate(x, yFloor); ctx.scale(1, 0.22); K.glow(ctx, 0, 0, w * 0.6, "rgba(255,250,236,0.9)", 1);
    ctx.restore();
  };

  /* ---------- upright piano. origin = floor centre. keys(t) gives pressed key indices ---------- */
  K.piano = function (ctx, x, y, s, opt) {
    const o = Object.assign({ seed: 480, pressed: [], jar: 0 }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const W = 440;
    /* feet + lower case */
    [-1, 1].forEach((sd, i) => K.shape(ctx, K.rectPts(sd * (W / 2 - 26) - 22, -40, 44, 40, 2), { fill: P.g1, w: 4, boil: 0.6, seed: o.seed + i }));
    K.shape(ctx, K.rectPts(-W / 2 + 10, -250, W - 20, 216, 3), { fill: P.g1, w: 5, boil: 0.8, seed: o.seed + 2, shine: { dx: 10, dy: 12, s: 0.86, a: 0.35 } });
    K.shape(ctx, K.roundPts(-W / 2 + 50, -220, W - 100, 150, 14), { fill: P.g2, w: 4, boil: 0.8, seed: o.seed + 3 });
    [-30, 0, 30].forEach((px, i) => K.shape(ctx, [[px - 8, -36], [px + 8, -36], [px + 12, -18], [px - 12, -18]], { fill: P.g5, w: 3, boil: 0.5, seed: o.seed + 4 + i })); /* pedals */
    /* keyboard shelf */
    K.shape(ctx, K.rectPts(-W / 2 - 16, -300, W + 32, 54, 3), { fill: P.g1, w: 5, boil: 0.8, seed: o.seed + 8 });
    const kx0 = -W / 2 + 6, kw = (W - 12) / 22;
    ctx.save(); ctx.fillStyle = P.paper; ctx.fillRect(kx0, -296, W - 12, 34); ctx.restore();
    for (let k = 0; k < 22; k++) {
      const down = o.pressed.indexOf(k) >= 0;
      if (down) { ctx.save(); ctx.fillStyle = P.g5; ctx.fillRect(kx0 + k * kw + 1, -293, kw - 2, 31); ctx.restore(); }
      K.line(ctx, [[kx0 + k * kw, -296], [kx0 + k * kw, -262]], { stroke: P.ink, w: 2.5, boil: 0.3, seed: o.seed + 10 + k, taper: [1, 1] });
      if ([0, 1, 3, 4, 5].indexOf(k % 7) >= 0 && k < 21) { ctx.save(); ctx.fillStyle = P.ink; ctx.fillRect(kx0 + (k + 0.62) * kw, -296, kw * 0.72, 20); ctx.restore(); }
    }
    /* upper case, fallboard and music stand with sheet music */
    K.shape(ctx, K.rectPts(-W / 2, -560, W, 262, 3), { fill: P.g1, w: 5, boil: 0.8, seed: o.seed + 40, shine: { dx: 12, dy: 14, s: 0.88, a: 0.3 } });
    K.shape(ctx, K.roundPts(-W / 2 + 34, -530, W - 68, 196, 16), { fill: P.g2, w: 4, boil: 0.8, seed: o.seed + 41 });
    K.shape(ctx, [[-120, -480], [120, -480], [126, -330], [-126, -330]], { fill: P.paper, w: 4, boil: 0.8, seed: o.seed + 42, shade: { color: P.g5, dx: 8, dy: 0 } });
    for (let r = 0; r < 3; r++) for (let l = 0; l < 5; l++) K.line(ctx, [[-104, -462 + r * 44 + l * 6], [104, -462 + r * 44 + l * 6]], { stroke: P.g3, w: 1.6, boil: 0.3, seed: o.seed + 50 + r * 5 + l, taper: [1, 1] });
    for (let n = 0; n < 9; n++) K.dot(ctx, -90 + n * 22, -458 + (n % 3) * 44 + hash(n, 3) * 18, 4.5, P.ink, P.ink, 1, o.seed + 70 + n);
    /* lid + candle sconces */
    K.shape(ctx, K.rectPts(-W / 2 - 22, -590, W + 44, 34, 2), { fill: P.g1, w: 5, boil: 0.8, seed: o.seed + 80 });
    /* tip jar on the lid: fills with gold as the act pays */
    const jx = W / 2 - 80, jy = -590;
    if (o.jar > 0) { const lvl = clamp(o.jar, 0, 1) * 70; for (let c = 0; c < Math.round(lvl / 9); c++) K.coin(ctx, jx - 18 + (c % 3) * 18, jy - 10 - Math.floor(c / 3) * 10 - (c % 2) * 3, 12, { seed: o.seed + 90 + c, flat: true }); }
    K.shape(ctx, [[jx - 42, jy - 96], [jx + 42, jy - 96], [jx + 38, jy], [jx - 38, jy]], { fill: "rgba(236,231,218,0.18)", w: 4, boil: 0.7, seed: o.seed + 85 });
    K.line(ctx, [[jx - 26, jy - 84], [jx - 22, jy - 18]], { stroke: P.shine, w: 6, boil: 0.5, seed: o.seed + 86, alpha: 0.7 });
    ctx.restore();
  };
  K.stool = function (ctx, x, y, s, seed) {
    seed = seed || 520;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.hose(ctx, [[-30, 0], [-16, -70], [-6, -130]], 8, P.g1, seed);
    K.hose(ctx, [[30, 0], [16, -70], [6, -130]], 8, P.g1, seed + 1);
    K.shape(ctx, K.ellipsePts(0, -140, 66, 20, 16), { fill: P.g2, w: 5, boil: 0.8, seed: seed + 2, shine: { dx: 0, dy: 6, s: 0.8, a: 0.4 } });
    ctx.restore();
  };

  /* ---------- the z-meter: semicircular gauge, scale -3..3, gold zones beyond +/-2 ---------- */
  K.gauge = function (ctx, x, y, r, z, opt) {
    const o = Object.assign({ seed: 540, a: 1, readout: true, label: "z", glow: 0 }, opt || {});
    if (o.a <= 0) return;
    const A = (v) => Math.PI + ((clamp(v, -3.3, 3.3) + 3) / 6) * Math.PI; /* -3 at left, +3 at right */
    ctx.save(); ctx.translate(x, y); ctx.scale(o.a, o.a);
    if (o.glow > 0) K.glow(ctx, 0, -r * 0.4, r * 2.1, "rgba(255,215,106,0.85)", o.glow);
    /* housing */
    const hous = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + (i / 16) * Math.PI; hous.push([Math.cos(a) * (r + 34), Math.sin(a) * (r + 34)]); }
    hous.push([r + 34, 40], [-r - 34, 40]);
    K.shape(ctx, hous, { fill: P.g1, w: 6, boil: 0.8, seed: o.seed, shine: { dx: 0, dy: 10, s: 0.9, a: 0.35 } });
    const face = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + (i / 16) * Math.PI; face.push([Math.cos(a) * r, Math.sin(a) * r]); }
    face.push([r, 14], [-r, 14]);
    K.shape(ctx, face, { fill: P.paper, w: 4, boil: 0.6, seed: o.seed + 1, shade: { color: P.g5, dx: 0, dy: 12 } });
    /* gold zones |z| >= 2 */
    ctx.save(); ctx.lineWidth = r * 0.16; ctx.lineCap = "butt";
    [[2, 3], [-3, -2]].forEach(([a0, a1]) => { ctx.strokeStyle = P.gold; ctx.beginPath(); ctx.arc(0, 0, r * 0.84, A(a0), A(a1)); ctx.stroke(); });
    ctx.restore();
    for (let v = -3; v <= 3; v += 0.5) {
      const a = A(v), big = v % 1 === 0, r0 = r * (big ? 0.72 : 0.78);
      K.line(ctx, [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93]], { stroke: P.ink, w: big ? 5 : 3, boil: 0.4, seed: o.seed + 10 + v * 4, taper: [1, 1] });
      if (big) K.text(ctx, (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v), Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55 + 4, { size: r * 0.2, weight: 700, font: K.FONT.mono, fill: Math.abs(v) >= 2 ? P.goldDark : P.ink });
    }
    /* needle */
    const na = A(z);
    ctx.save(); ctx.rotate(na);
    K.shape(ctx, [[-r * 0.14, -6], [r * 0.9, 0], [-r * 0.14, 6]], { fill: P.ink, w: 3, boil: 0.4, seed: o.seed + 30 });
    ctx.restore();
    K.dot(ctx, 0, 0, r * 0.09, P.gold, P.ink, 3, o.seed + 31);
    /* readout window */
    if (o.readout) {
      const str = o.label + " = " + (z >= 0 ? "+" : "−") + Math.abs(z).toFixed(2), tw = K.textW(ctx, str, r * 0.24, 700, K.FONT.mono) + 30;
      K.shape(ctx, K.roundPts(-tw / 2, 22, tw, r * 0.34, 8), { fill: Math.abs(z) >= 2 ? P.gold : P.g1, w: 4, boil: 0.5, seed: o.seed + 32 });
      K.text(ctx, str, 0, 22 + r * 0.17 + 1, { size: r * 0.24, weight: 700, font: K.FONT.mono, fill: Math.abs(z) >= 2 ? P.ink : P.paper });
    }
    ctx.restore();
  };

  /* ---------- the spread: a coil spring between two points ----------
     coils fixed, so stretching spaces them out. strain 0..1 tints it gold */
  K.spring = function (ctx, A, B, opt) {
    const o = Object.assign({ coils: 9, r: 22, w: 6, seed: 560, strain: 0, wob: 0 }, opt || {});
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const lead = Math.min(26, L * 0.15), N = o.coils * 10, pts = [[A[0], A[1]], [A[0] + ux * lead, A[1] + uy * lead]];
    for (let i = 0; i <= N; i++) {
      const u = i / N, along = lead + (L - 2 * lead) * u, ang = u * o.coils * K.TAU;
      const rr = o.r * (1 - 0.25 * clamp(o.strain, 0, 1)) + Math.sin(K.now * 18 + u * 9) * o.wob;
      pts.push([A[0] + ux * along + nx * Math.sin(ang) * rr + ux * Math.cos(ang) * rr * 0.32, A[1] + uy * along + ny * Math.sin(ang) * rr + uy * Math.cos(ang) * rr * 0.32]);
    }
    pts.push([B[0] - ux * lead, B[1] - uy * lead], [B[0], B[1]]);
    const col = o.strain > 0.05 ? (o.strain > 0.6 ? P.gold : P.g4) : P.g4;
    if (o.strain > 0.6) { ctx.save(); ctx.globalAlpha = (o.strain - 0.6) * 1.2; K.pathOf(ctx, pts, false); ctx.strokeStyle = P.goldGlow; ctx.lineWidth = o.w * 4; ctx.stroke(); ctx.restore(); }
    const bp = K.boil(pts, o.seed, 0.6);
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = P.ink; ctx.lineWidth = K.lw(ctx, o.w + 6); ctx.beginPath(); bp.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = o.w; ctx.stroke();
    ctx.strokeStyle = "rgba(251,248,240,0.7)"; ctx.lineWidth = Math.max(1.5, o.w * 0.3); ctx.stroke();
    ctx.restore();
  };

  /* ---------- gold coin ($ stamp). spin = angle (radians): the coin flips ---------- */
  K.coin = function (ctx, x, y, r, opt) {
    const o = Object.assign({ spin: 0, seed: 600, flat: false, a: 1 }, opt || {});
    if (o.a <= 0) return;
    const sx = o.flat ? 1 : Math.max(0.08, Math.abs(Math.cos(o.spin)));
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= o.a; ctx.scale(sx, 1);
    K.shape(ctx, K.ellipsePts(0, 0, r, r, 14), { fill: P.gold, w: Math.max(2.5, r * 0.13), boil: 0.4, seed: o.seed, shade: { color: P.goldDark, dx: -r * 0.18, dy: -r * 0.2 } });
    if (r > 10 && sx > 0.35) {
      K.shape(ctx, K.ellipsePts(0, 0, r * 0.7, r * 0.7, 12), { fill: null, stroke: P.goldDark, w: Math.max(1.5, r * 0.07), boil: 0.3, seed: o.seed + 1 });
      K.text(ctx, "$", 0, r * 0.06, { size: r * 1.05, weight: 900, font: K.FONT.display, fill: P.goldDark });
    }
    ctx.restore();
    if (r > 8 && sx > 0.5) K.twinkle(ctx, x + r * 0.45 * sx, y - r * 0.45, r * 0.35, 0.9 * ((K.bf + o.seed) % 4 === 0 ? 1 : 0), P.shine, o.seed + 2);
  };
  /* deterministic rain of coins: fall, bounce once, settle on the floor */
  K.coinRain = function (ctx, t, t0, opt) {
    const o = Object.assign({ x0: 300, x1: 1600, floorY: K.FLOOR_Y + 120, n: 26, seed: 640, r: 22, stagger: 1.4, g: 2600 }, opt || {});
    for (let i = 0; i < o.n; i++) {
      const d = t - (t0 + hash(i, o.seed) * o.stagger); if (d <= 0) continue;
      const x = lerp(o.x0, o.x1, hash(i, o.seed + 1)) + hs(i, o.seed + 2) * 30 * Math.min(d, 1);
      const fy = o.floorY + hs(i, o.seed + 3) * 40, y0 = -80 - hash(i, o.seed + 4) * 200;
      const tf = Math.sqrt((2 * (fy - y0)) / o.g); let y;
      if (d < tf) y = y0 + 0.5 * o.g * d * d;
      else { const v = o.g * tf * 0.32, db = d - tf, tb = (2 * v) / o.g; y = db < tb ? fy - (v * db - 0.5 * o.g * db * db) : fy; }
      const settled = d > tf * 1.7, spin = settled ? Math.PI / 2 * 0.75 : d * (8 + 6 * hash(i, o.seed + 5));
      const r = o.r * (0.8 + 0.4 * hash(i, o.seed + 6));
      if (settled) { ctx.save(); ctx.translate(x, y + r * 0.3); ctx.scale(1, 0.38); K.coin(ctx, 0, 0, r, { flat: true, seed: o.seed + 10 + i }); ctx.restore(); }
      else K.coin(ctx, x, y, r, { spin, seed: o.seed + 10 + i });
    }
  };

  /* ---------- desk bell (the "bell" of cointegration). ring 0..1 (decays) ---------- */
  K.bell = function (ctx, x, y, s, ring, seed) {
    seed = seed || 680;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const shake = ring > 0 ? Math.sin(K.now * 60) * 3 * ring : 0;
    K.shape(ctx, K.roundPts(-70, -22, 140, 22, 8), { fill: P.g1, w: 5, boil: 0.6, seed, shine: { dx: 0, dy: 5, s: 0.85, a: 0.4 } });
    ctx.save(); ctx.translate(shake, 0);
    const dome = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; dome.push([Math.cos(a) * 58, -22 + Math.sin(a) * 52]); }
    K.shape(ctx, dome, { fill: P.g4, w: 5, boil: 0.6, seed: seed + 1, shade: { color: P.g3, dx: -12, dy: -6 }, shine: { dx: 8, dy: 10, s: 0.75, a: 0.85 } });
    K.hose(ctx, [[0, -74], [0, -92]], 6, P.g3, seed + 2, 6);
    K.shape(ctx, K.ellipsePts(0, -96, 14, 6, 10), { fill: P.g4, w: 4, boil: 0.4, seed: seed + 3 });
    ctx.restore();
    if (ring > 0.02) for (let k = 0; k < 3; k++) {
      const rr = 90 + k * 34 + (1 - ring) * 50;
      [-1, 1].forEach((sd) => K.line(ctx, [[sd * rr * 0.86, -40 - rr * 0.5], [sd * rr, -40], [sd * rr * 0.86, -40 + rr * 0.42]], { stroke: k === 1 ? P.gold : P.paper, w: 7 - k, boil: 0.6, seed: seed + 10 + k + sd, alpha: ring }));
    }
    ctx.restore();
  };

  /* ---------- a music note (eighth note), floats up from the piano ---------- */
  K.note = function (ctx, x, y, s, a, seed) {
    if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.rotate(-0.2);
    K.shape(ctx, K.ellipsePts(0, 0, 14, 10, 10, -0.4), { fill: P.ink, w: 3, boil: 0.5, seed: seed || 700 });
    K.line(ctx, [[12, -2], [12, -52]], { stroke: P.ink, w: 5, boil: 0.5, seed: (seed || 700) + 1, taper: [1, 1] });
    K.line(ctx, [[12, -52], [30, -40], [28, -24]], { stroke: P.ink, w: 6, boil: 0.5, seed: (seed || 700) + 2 });
    ctx.restore();
  };
})(VK);
