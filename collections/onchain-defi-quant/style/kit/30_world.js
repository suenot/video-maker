/* ============================================================
   KIT 30 WORLD: "The Block Diner", a 1950s chain-diner kitchen.
   The blockchain is a conveyor chain of lunch trays (blocks); every
   transaction is an order ticket; the mempool is the ticket rail.
   Set pieces (world units, camera z 1 = 1920 x 1080 view):
     wall, window (night street), pendant lamp, checkerFloor (perspective),
     counter (cherry front + chrome trim), stool, conveyor (chain + rollers),
     block (lunch tray), ticket (order), ticketRail (mempool), bell,
     plate / burger / breadSlice / coffee / steam, coin, sparkle, burst, speedLines
   ============================================================ */
var DK = window.DK || (window.DK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;

  /* ---------- back wall: cream tiles, cherry stripe, teal wainscot, chrome rail ---------- */
  K.wall = function (ctx, x0, x1, y0, y1, opt) {
    const o = Object.assign({ stripeY: null, wainscot: 0.42, seed: 3, dark: 0 }, opt || {});
    const H = y1 - y0, wy = y1 - H * o.wainscot;
    ctx.save();
    ctx.fillStyle = P.wall; ctx.fillRect(x0, y0, x1 - x0, wy - y0);
    /* subway tiles: thin offset grid, printed */
    ctx.strokeStyle = P.wallShade; ctx.lineWidth = K.lw(ctx, 3);
    ctx.beginPath();
    for (let y = y0, r = 0; y < wy; y += 64, r++) {
      ctx.moveTo(x0, y); ctx.lineTo(x1, y);
      for (let x = x0 + ((r % 2) * 64) - ((x0 % 128) + 128) % 128; x < x1; x += 128) { ctx.moveTo(x, y); ctx.lineTo(x, Math.min(wy, y + 64)); }
    }
    ctx.stroke();
    /* wainscot (teal vinyl panels) */
    ctx.fillStyle = P.teal; ctx.fillRect(x0, wy, x1 - x0, y1 - wy);
    ctx.fillStyle = K.dotPattern(ctx, "rgba(10,40,40,0.35)", 2.4, 11); ctx.fillRect(x0, wy, x1 - x0, y1 - wy);
    ctx.restore();
    for (let x = Math.ceil(x0 / 240) * 240; x < x1; x += 240) K.rule(ctx, [[x, wy + 24], [x, y1 - 10]], { stroke: P.tealDark, w: 5, boil: 0.8, seed: o.seed + x });
    /* cherry stripe + chrome rail on top of the wainscot */
    K.shape(ctx, [[x0 - 20, wy - 26], [x1 + 20, wy - 26], [x1 + 20, wy], [x0 - 20, wy]], { fill: P.cherry, w: 4, boil: 1, seed: o.seed + 1, misreg: false });
    K.chromeBar(ctx, x0 - 20, wy - 2, x1 - x0 + 40, 16, o.seed + 2);
    if (o.dark > 0) { ctx.save(); ctx.globalAlpha = o.dark; ctx.fillStyle = P.nightDark; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.restore(); }
  };
  /* chrome: hard light/dark bands like a 50s airbrushed comic, not a soft gradient */
  K.chromeBar = function (ctx, x, y, w, h, seed) {
    K.shape(ctx, K.rectPts(x, y, w, h, 6), { fill: P.chrome, w: 3.5, boil: 0.8, seed, misreg: false, shade: { color: P.chromeDark, dx: 0, dy: -h * 0.45, dots: false } });
    ctx.save(); ctx.fillStyle = P.chromeLight; ctx.fillRect(x + 6, y + h * 0.18, w - 12, Math.max(2, h * 0.16)); ctx.restore();
  };

  /* ---------- booth wall: teal tufted vinyl (diamond tufting + buttons), cherry piping ---------- */
  K.booth = function (ctx, x0, x1, y0, y1, seed) {
    seed = seed || 5;
    ctx.save(); ctx.fillStyle = P.teal; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    const g = 120;
    ctx.strokeStyle = P.tealDark; ctx.lineWidth = K.lw(ctx, 4); ctx.beginPath();
    for (let d = x0 - (y1 - y0) - g; d < x1 + g; d += g) { ctx.moveTo(d, y0); ctx.lineTo(d + (y1 - y0), y1); ctx.moveTo(d + (y1 - y0), y0); ctx.lineTo(d, y1); }
    ctx.stroke();
    ctx.fillStyle = K.dotPattern(ctx, "rgba(8,40,40,0.3)", 2.4, 11); ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.restore();
    for (let x = Math.floor(x0 / g) * g; x < x1 + g; x += g) for (let y = y0 + g / 2, r = 0; y < y1; y += g / 2, r++) {
      const bx = x + (r % 2 ? g / 2 : 0); if (bx < x0 - 10 || bx > x1 + 10) continue;
      K.shape(ctx, K.ellipsePts(bx, y, 7, 7, 8), { fill: P.mintLight, w: 3, boil: 0.4, seed: seed + ((r * 7 + x) | 0) % 97, misreg: false });
    }
    K.shape(ctx, K.rectPts(x0 - 20, y0 - 30, x1 - x0 + 40, 40, 6), { fill: P.cherry, w: 5, boil: 1, seed: seed + 1, shade: { color: P.cherryDark, dx: 0, dy: -16 }, misreg: false });
  };
  /* ---------- formica table top: mint with 50s boomerang shapes, chrome edge ---------- */
  K.formica = function (ctx, x0, x1, y, h, seed) {
    seed = seed || 7;
    K.shape(ctx, K.rectPts(x0 - 20, y, x1 - x0 + 40, h, 8), { fill: P.mintLight, w: 5, boil: 1, seed, misreg: false });
    for (let i = 0, x = x0 + 40; x < x1; x += 170, i++) {
      const by = y + h * (0.3 + 0.4 * hash(i, seed)), r = hs(i, seed + 3) * 0.8;
      ctx.save(); ctx.translate(x + 60 * hash(i + 5, seed), by); ctx.rotate(r);
      K.shape(ctx, [[-34, 8], [-10, -10], [0, -4], [10, -10], [34, 8], [0, 2]], { fill: i % 3 === 0 ? P.cherryLight : i % 3 === 1 ? P.mustard : P.teal, stroke: null, w: 0, boil: 0.5, seed: seed + 10 + i, alpha: 0.75 });
      ctx.restore();
    }
    K.chromeBar(ctx, x0 - 24, y + h - 6, x1 - x0 + 48, 26, seed + 2);
  };

  /* ---------- pass window to the kitchen (the conveyor runs through it) ---------- */
  K.passWindow = function (ctx, x, y, w, h, seed) {
    K.shape(ctx, K.roundRectPts(x - 18, y - 18, w + 36, h + 36, 26), { fill: P.chrome, w: 6, boil: 1.2, seed, shade: { color: P.chromeDark, dx: 8, dy: 10, dots: false } });
    K.shape(ctx, K.roundRectPts(x, y, w, h, 16), { fill: "#3b2f35", w: 4.5, boil: 1, seed: seed + 1, misreg: false, shade: { color: "#2a2126", dx: 0, dy: -h * 0.35 } });
    /* kitchen glimpse: hanging pans */
    for (let i = 0; i < Math.floor(w / 220); i++) {
      const px = x + 110 + i * 220, py = y + 40 + 6 * Math.sin(K.now * 1.7 + i);
      K.rule(ctx, [[px, y + 4], [px, py]], { stroke: P.chromeDark, w: 3, boil: 0.5, seed: seed + 10 + i });
      K.shape(ctx, K.ellipsePts(px, py + 34, 34, 30, 12), { fill: P.chromeDark, w: 3.5, boil: 0.8, seed: seed + 20 + i, shade: { color: "#5d6970", dx: 6, dy: 6 } });
    }
  };

  /* ---------- window to the night street (neon glow outside) ---------- */
  K.window = function (ctx, x, y, w, h, seed) {
    K.shape(ctx, K.roundRectPts(x - 14, y - 14, w + 28, h + 28, 20), { fill: P.chrome, w: 5, boil: 1, seed, misreg: false });
    K.shape(ctx, K.roundRectPts(x, y, w, h, 12), { fill: P.night, w: 4, boil: 1, seed: seed + 1, misreg: false });
    ctx.save(); K.pathOf(ctx, K.roundRectPts(x, y, w, h, 12), true); ctx.clip();
    for (let i = 0; i < 5; i++) { const bx = x + (i / 5) * w, bh = h * (0.35 + 0.4 * hash(i, seed)); ctx.fillStyle = P.nightDark; ctx.fillRect(bx, y + h - bh, w / 5 - 8, bh); for (let j = 0; j < 4; j++) if (hash(i * 7 + j, seed + 3) > 0.45) { ctx.fillStyle = P.mustard; ctx.globalAlpha = 0.6; ctx.fillRect(bx + 12 + (j % 2) * 30, y + h - bh + 20 + Math.floor(j / 2) * 34, 14, 18); ctx.globalAlpha = 1; } }
    ctx.restore();
    /* blinds */
    for (let i = 1; i < 6; i++) K.rule(ctx, [[x + 6, y + (h * i) / 6], [x + w - 6, y + (h * i) / 6]], { stroke: P.chromeDark, w: 3, boil: 0.6, seed: seed + 30 + i, alpha: 0.7 });
  };

  /* ---------- pendant lamp (cherry cone) with a light pool; on = 0..1 ---------- */
  K.lamp = function (ctx, x, y, s, on, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const sway = Math.sin(K.now * 1.3 + seed) * 0.03; ctx.rotate(sway);
    K.rule(ctx, [[0, -400], [0, -40]], { stroke: P.ink, w: 4, boil: 0.6, seed: seed + 1 });
    if (on > 0) { ctx.save(); ctx.globalAlpha = 0.18 * on; ctx.fillStyle = "#fff4c4"; ctx.beginPath(); ctx.moveTo(-50, 30); ctx.lineTo(50, 30); ctx.lineTo(260, 620); ctx.lineTo(-260, 620); ctx.closePath(); ctx.fill(); ctx.restore(); K.glow(ctx, 0, 40, 120, "rgba(255,240,180,0.9)", on * 0.7); }
    K.shape(ctx, [[-22, -44], [22, -44], [74, 26], [-74, 26]], { fill: P.cherry, w: 5, boil: 1, seed: seed + 2, shade: { color: P.cherryDark, dx: 18, dy: 0 }, shine: true });
    K.shape(ctx, K.ellipsePts(0, 30, 26, 14, 10), { fill: on > 0.3 ? "#fff7d0" : "#8a8a7a", w: 3.5, boil: 0.6, seed: seed + 3 });
    ctx.restore();
  };

  /* ---------- checkerboard floor in perspective. Tiles converge to a vanishing point
     that follows the camera, so a pan reads as a dolly across the room. ---------- */
  K.checkerFloor = function (ctx, x0, x1, yTop, yBot, opt) {
    const o = Object.assign({ tile: 150, vpX: K.cam ? K.cam.x : 960, vpY: yTop - 700, rows: 7, seed: 9, dark: 0 }, opt || {});
    const rowY = []; /* perspective row lines: spacing grows toward the viewer */
    for (let r = 0; r <= o.rows; r++) { const u = r / o.rows; rowY.push(lerp(yTop, yBot, u * u * 0.55 + u * 0.45)); }
    const X = (xb, y) => o.vpX + (xb - o.vpX) * (y - o.vpY) / (yBot - o.vpY); /* column line x at height y */
    const c0 = Math.floor((x0 - 900) / o.tile), c1 = Math.ceil((x1 + 900) / o.tile);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, yTop, x1 - x0, yBot - yTop + 400); ctx.clip();
    ctx.fillStyle = P.checkA; ctx.fillRect(x0, yTop, x1 - x0, yBot - yTop + 400);
    ctx.fillStyle = P.checkB;
    for (let r = 0; r < o.rows; r++) for (let c = c0; c < c1; c++) {
      if ((r + c) % 2) continue;
      const ya = rowY[r], yb = rowY[r + 1], xa = c * o.tile, xb = (c + 1) * o.tile;
      ctx.beginPath(); ctx.moveTo(X(xa, ya), ya); ctx.lineTo(X(xb, ya), ya); ctx.lineTo(X(xb, yb), yb); ctx.lineTo(X(xa, yb), yb); ctx.closePath(); ctx.fill();
    }
    /* floor shine: a soft dot screen band near the back */
    ctx.fillStyle = K.dotPattern(ctx, "rgba(30,20,25,0.18)", 2.2, 10); ctx.fillRect(x0, yTop, x1 - x0, (yBot - yTop) * 0.3);
    if (o.dark > 0) { ctx.globalAlpha = o.dark; ctx.fillStyle = P.nightDark; ctx.fillRect(x0, yTop, x1 - x0, yBot - yTop + 400); }
    ctx.restore();
    K.rule(ctx, [[x0, yTop], [x1, yTop]], { stroke: P.ink, w: 6, boil: 1, seed: o.seed });
  };

  /* ---------- counter: mint top, cherry quilted front, chrome trim ---------- */
  K.counter = function (ctx, x0, x1, y, h, opt) {
    const o = Object.assign({ seed: 40, top: 46 }, opt || {});
    K.shape(ctx, K.rectPts(x0, y + o.top, x1 - x0, h - o.top, 8), { fill: P.cherry, w: 5, boil: 1.2, seed: o.seed, shade: { color: P.cherryDark, dx: 0, dy: -h * 0.5 } });
    /* quilted vinyl ribs */
    for (let x = Math.ceil(x0 / 90) * 90; x < x1; x += 90) K.rule(ctx, [[x, y + o.top + 30], [x, y + h - 30]], { stroke: P.cherryDark, w: 6, boil: 0.8, seed: o.seed + x });
    K.chromeBar(ctx, x0 - 10, y + h - 30, x1 - x0 + 20, 24, o.seed + 2);
    /* top slab */
    K.shape(ctx, K.rectPts(x0 - 26, y, x1 - x0 + 52, o.top, 8), { fill: P.mint, w: 5, boil: 1.2, seed: o.seed + 3, shade: { color: P.mintDark, dx: 0, dy: -o.top * 0.4 } });
    K.chromeBar(ctx, x0 - 30, y + o.top - 12, x1 - x0 + 60, 16, o.seed + 4);
  };
  /* ---------- stool: chrome post, cherry seat ---------- */
  K.stool = function (ctx, x, y, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shape(ctx, K.rectPts(-12, -170, 24, 170, 2), { fill: P.chrome, w: 4, boil: 0.8, seed, shade: { color: P.chromeDark, dx: 8, dy: 0, dots: false } });
    K.shape(ctx, K.ellipsePts(0, -4, 60, 14, 12), { fill: P.chromeDark, w: 4, boil: 0.8, seed: seed + 1 });
    K.shape(ctx, [[-78, -200], [78, -200], [72, -168], [-72, -168]], { fill: P.chrome, w: 4, boil: 0.8, seed: seed + 2, misreg: false });
    K.shape(ctx, K.ellipsePts(0, -206, 82, 30, 14), { fill: P.cherry, w: 5, boil: 1, seed: seed + 3, shade: { color: P.cherryDark, dx: 0, dy: 10 }, shine: { x: 0.35, y: 0.2 } });
    ctx.restore();
  };

  /* ---------- conveyor chain (the blockchain): a belt of chain links over rollers.
     phase = belt travel in px (links move with the trays) ---------- */
  K.conveyor = function (ctx, x0, x1, y, phase, opt) {
    const o = Object.assign({ seed: 60, link: 46 }, opt || {});
    K.shape(ctx, K.rectPts(x0, y, x1 - x0, 46, 10), { fill: P.chromeDark, w: 5, boil: 1, seed: o.seed, misreg: false, shade: { color: "#5d6970", dx: 0, dy: -20, dots: false } });
    /* chain links: interlocking oval rings (open) over solid side plates */
    const off = ((phase % (o.link * 2)) + o.link * 2) % (o.link * 2);
    for (let x = x0 - o.link * 2 + off, i = 0; x < x1 + o.link; x += o.link, i++) {
      if (x < x0 - o.link) continue;
      const odd = Math.round((x - off) / o.link) % 2 !== 0;
      if (odd) K.shape(ctx, K.roundRectPts(x - 4, y + 10, o.link + 8, 26, 13, 3), { fill: null, stroke: P.chromeLight, w: 7, boil: 0.6, seed: o.seed + 10 + (i % 9), taper: 0 });
      else K.shape(ctx, K.roundRectPts(x - 2, y + 14, o.link + 4, 18, 9, 3), { fill: P.chrome, w: 3.5, boil: 0.6, seed: o.seed + 10 + (i % 9), misreg: false });
    }
    /* rollers + legs */
    for (let x = x0 + 60; x < x1; x += 240) {
      K.rule(ctx, [[x, y + 46], [x - 20, y + 160]], { stroke: P.ink, w: 7, boil: 0.8, seed: o.seed + x });
      const a = -phase / 18;
      K.dot(ctx, x, y + 46, 18, P.chrome, P.ink, 3.5, o.seed + x + 1);
      K.rule(ctx, [[x + Math.cos(a) * 12, y + 46 + Math.sin(a) * 12], [x - Math.cos(a) * 12, y + 46 - Math.sin(a) * 12]], { stroke: P.ink, w: 3, boil: 0.4, seed: o.seed + x + 2 });
    }
  };

  /* ---------- block = lunch tray on the chain ----------
     opt: num (block number string), items ([{kind, color, label}] left to right),
          hot (0..1 mustard glow), a (pop 0..1), seal (0..1 a "sealed" stamp ring) */
  K.block = function (ctx, x, y, s, opt) {
    const o = Object.assign({ num: "", items: [], hot: 0, a: 1, seed: 100, w: 300, h: 120, seal: 0 }, opt || {});
    const a = o.a >= 1 ? 1 : o.a <= 0 ? 0 : K.E.back(o.a, 2.2); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * a, s * a);
    const w = o.w, h = o.h;
    if (o.hot > 0) K.glow(ctx, 0, -h / 2, w * 0.8, "rgba(255,210,90,0.9)", o.hot * 0.7);
    /* tray body (seen slightly from above): rim + floor */
    K.shape(ctx, K.roundRectPts(-w / 2, -h, w, h, 22), { fill: P.mint, w: 5, boil: 1.2, seed: o.seed, shade: { color: P.mintDark, dx: 0, dy: -h * 0.3 } });
    K.shape(ctx, K.roundRectPts(-w / 2 + 16, -h + 14, w - 32, h - 46, 14), { fill: P.mintLight, w: 3, boil: 1, seed: o.seed + 1, misreg: false });
    /* items sit on the tray */
    const n = o.items.length, span = w - 70;
    o.items.forEach((it, i) => {
      const ix = n === 1 ? 0 : -span / 2 + (span * i) / (n - 1), iy = -h + 40 + (it.dy || 0);
      K.trayItem(ctx, ix, iy, it, o.seed + 20 + i * 5);
    });
    /* front number plate */
    if (o.num) {
      const pw = Math.max(120, K.textW(ctx, o.num, 30, 700, K.FONT.mono) + 36);
      K.shape(ctx, K.roundRectPts(-pw / 2, -30, pw, 40, 10), { fill: P.cream, w: 3.5, boil: 0.8, seed: o.seed + 3, misreg: false });
      K.text(ctx, o.num, 0, -9, { size: 30, weight: 700, font: K.FONT.mono, fill: P.ink });
    }
    if (o.seal > 0) { /* sealed: mustard ring stamp, chain-link icon */
      const sa = K.E.back(clamp(o.seal, 0, 1), 3);
      ctx.save(); ctx.translate(w / 2 - 10, -h + 6); ctx.rotate(-0.2); ctx.scale(sa, sa);
      K.shape(ctx, K.ellipsePts(0, 0, 30, 30, 14), { fill: P.mustard, w: 4, boil: 0.8, seed: o.seed + 5 });
      K.chainIcon(ctx, 0, 0, 16, o.seed + 6);
      ctx.restore();
    }
    ctx.restore();
  };
  K.chainIcon = function (ctx, x, y, r, seed) {
    K.shape(ctx, K.roundRectPts(x - r, y - r * 0.4, r * 1.2, r * 0.8, r * 0.4, 3), { stroke: P.ink, w: 3.5, boil: 0.5, seed, fill: null });
    K.shape(ctx, K.roundRectPts(x - r * 0.2, y - r * 0.4, r * 1.2, r * 0.8, r * 0.4, 3), { stroke: P.ink, w: 3.5, boil: 0.5, seed: seed + 1, fill: null });
  };
  /* one item on a tray: "ticket" | "burger" | "bread" | "coin" | "plate" | "cup" */
  K.trayItem = function (ctx, x, y, it, seed) {
    const k = it.kind || "ticket";
    if (k === "ticket") K.ticket(ctx, x, y - 20, 0.62, { color: it.color || P.mint, label: it.label || "", amt: it.amt || "", seed, clip: false, tilt: it.tilt || hs(seed, 4) * 0.1 });
    else if (k === "burger") K.burger(ctx, x, y + 8, 0.7, seed, it.bite);
    else if (k === "bread") K.breadSlice(ctx, x, y + 8, 0.7, it.color || P.cherry, seed);
    else if (k === "coin") K.coin(ctx, x, y + 6, 30, { color: it.color || P.mustard, label: it.label || "", seed });
    else if (k === "cup") K.coffee(ctx, x, y + 10, 0.7, seed);
    else K.plate(ctx, x, y + 10, 0.8, seed);
  };

  /* ---------- order ticket (= a transaction) ----------
     opt: color (header band = who sent it), label (ticker), amt (amount), gas (tip
     as 0..3 mustard dots), arrow ("up" | "down" | null), clip (chrome clip on top),
     stamp ({text, color, a}): a rubber stamp across the ticket, tilt (radians) */
  K.ticket = function (ctx, x, y, s, opt) {
    const o = Object.assign({ color: P.mint, label: "", amt: "", gas: 0, arrow: null, clip: true, seed: 200, tilt: 0, stamp: null, a: 1 }, opt || {});
    const a = o.a >= 1 ? 1 : o.a <= 0 ? 0 : K.E.back(o.a, 2.4); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt); ctx.scale(s * a, s * a);
    const w = 120, h = 160;
    /* paper with serrated bottom */
    const pts = [[-w / 2, 0], [w / 2, 0], [w / 2, h]];
    for (let i = 0; i <= 8; i++) pts.push([w / 2 - (w * i) / 8, h + (i % 2 ? 9 : 0)]);
    K.shape(ctx, pts, { fill: P.cream, w: 4, boil: 1, seed: o.seed, shade: { color: P.creamShade, dx: -10, dy: 0 } });
    K.shape(ctx, [[-w / 2 + 4, 4], [w / 2 - 4, 4], [w / 2 - 4, 34], [-w / 2 + 4, 34]], { fill: o.color, stroke: null, w: 0, boil: 0.6, seed: o.seed + 1, misreg: true });
    if (o.label) K.text(ctx, o.label, 0, 62, { size: 30, weight: 700, font: K.FONT.mono, fill: P.ink });
    if (o.amt) K.text(ctx, o.amt, 0, 98, { size: 28, weight: 700, font: K.FONT.mono, fill: P.inkSoft });
    if (o.arrow) { const d = o.arrow === "up" ? -1 : 1; K.shape(ctx, [[-30, 122 - d * 10], [-30 + 14, 122 + d * 8], [-30 - 14, 122 + d * 8]], { fill: o.arrow === "up" ? P.bid : P.ask, w: 3, boil: 0.5, seed: o.seed + 2 }); }
    for (let i = 0; i < o.gas; i++) K.dot(ctx, 4 + i * 20, 124, 7, P.mustard, P.ink, 2.5, o.seed + 4 + i);
    if (o.clip) {
      K.shape(ctx, K.roundRectPts(-22, -16, 44, 28, 6, 2), { fill: P.chrome, w: 3.5, boil: 0.6, seed: o.seed + 8, misreg: false, shade: { color: P.chromeDark, dx: 0, dy: -10, dots: false } });
    }
    if (o.stamp && o.stamp.a > 0) {
      const sa = o.stamp.a >= 1 ? 1 : K.E.back(o.stamp.a, 3);
      ctx.save(); ctx.translate(0, 112); ctx.rotate(-0.28); ctx.scale(sa * (1 + 0.6 * (1 - Math.min(1, o.stamp.a * 1.5))), sa * (1 + 0.6 * (1 - Math.min(1, o.stamp.a * 1.5))));
      const tw = K.textW(ctx, o.stamp.text, 30, 700, K.FONT.mono) + 22;
      K.shape(ctx, K.roundRectPts(-tw / 2, -26, tw, 52, 8, 2), { fill: null, stroke: o.stamp.color || P.loss, w: 5, boil: 1, seed: o.seed + 9 });
      K.text(ctx, o.stamp.text, 0, 1, { size: 30, weight: 700, font: K.FONT.mono, fill: o.stamp.color || P.loss });
      ctx.restore();
    }
    ctx.restore();
  };
  /* the mempool: a chrome order rail where pending tickets hang */
  K.ticketRail = function (ctx, x0, x1, y, seed) {
    K.chromeBar(ctx, x0, y - 12, x1 - x0, 26, seed || 300);
    [x0 + 10, x1 - 10].forEach((x, i) => K.dot(ctx, x, y + 1, 10, P.chromeDark, P.ink, 3, (seed || 300) + 1 + i));
  };

  /* ---------- the order bell (chrome dome on a mustard base); ring 0..1 decays ---------- */
  K.bell = function (ctx, x, y, s, ring, seed) {
    seed = seed || 400;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const wob = ring > 0 ? Math.sin(K.now * 60) * 0.06 * ring : 0;
    K.shape(ctx, K.roundRectPts(-90, -10, 180, 34, 10), { fill: P.mustard, w: 5, boil: 1, seed, shade: { color: P.mustardDark, dx: 0, dy: -14 } });
    ctx.save(); ctx.rotate(wob); ctx.scale(1 + ring * 0.04, 1 - ring * 0.06);
    const dome = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; dome.push([Math.cos(a) * 76, -12 + Math.sin(a) * 66]); }
    K.shape(ctx, dome, { fill: P.chrome, w: 5, boil: 1, seed: seed + 1, shade: { color: P.chromeDark, dx: 22, dy: 0, dots: false }, shine: { x: 0.3, y: 0.3, alpha: 0.95 } });
    K.shape(ctx, K.rectPts(-8, -96, 16, 18, 1), { fill: P.chromeDark, w: 3.5, boil: 0.6, seed: seed + 2, misreg: false });
    K.shape(ctx, K.ellipsePts(0, -100 + ring * 12, 18, 9, 10), { fill: P.chrome, w: 3.5, boil: 0.6, seed: seed + 3, misreg: false });
    ctx.restore();
    if (ring > 0.05) { /* sound rings: language-free */
      for (let k = 0; k < 3; k++) {
        const r = 100 + k * 46 + (1 - ring) * 90, al = ring * (1 - k * 0.25);
        [-1, 1].forEach((sd) => K.line(ctx, [[sd * r * 0.82, -40 - r * 0.42], [sd * r * 0.98, -40], [sd * r * 0.82, -40 + r * 0.32]], { stroke: P.mustardDark, w: 7, boil: 1, seed: seed + 10 + k + (sd > 0 ? 5 : 0), alpha: al }));
      }
    }
    ctx.restore();
  };

  /* ---------- food props ---------- */
  K.plate = function (ctx, x, y, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shape(ctx, K.ellipsePts(0, 0, 90, 26, 16), { fill: P.cream, w: 4, boil: 1, seed, shade: { color: P.creamShade, dx: 0, dy: -10 } });
    K.shape(ctx, K.ellipsePts(0, -2, 60, 15, 14), { fill: null, stroke: P.cherry, w: 3, boil: 0.8, seed: seed + 1 });
    ctx.restore();
  };
  K.breadSlice = function (ctx, x, y, s, edge, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const pts = [[-70, 4], [-74, -20], [-66, -40], [-40, -52], [0, -50], [40, -52], [66, -40], [74, -20], [70, 4]];
    K.shape(ctx, pts, { fill: P.bread, w: 5, boil: 1.1, seed, shade: { color: P.breadDark, dx: 0, dy: -14 } });
    K.shape(ctx, [[-62, -6], [-60, -24], [-38, -40], [38, -40], [60, -24], [62, -6]], { fill: P.cream, stroke: null, w: 0, boil: 0.8, seed: seed + 1, alpha: 0.55 });
    if (edge) K.rule(ctx, [[-60, 8], [60, 8]], { stroke: edge, w: 8, boil: 0.8, seed: seed + 2 });
    ctx.restore();
  };
  /* the victim's order: a burger. bite 0..1 takes a scalloped bite out of the right side */
  K.burger = function (ctx, x, y, s, seed, bite) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (bite > 0) { /* bite mark: clip away three overlapping circles */
      ctx.beginPath(); ctx.rect(-200, -200, 400, 400);
      const r = 26 * bite; [[70, -58], [82, -30], [74, -2]].forEach((c) => { ctx.moveTo(c[0] + r, c[1]); ctx.arc(c[0], c[1], r, 0, K.TAU, true); });
      ctx.clip("evenodd");
    }
    K.shape(ctx, [[-76, -6], [76, -6], [70, 10], [-70, 10]], { fill: P.bread, w: 4.5, boil: 1, seed: seed + 1 });
    K.shape(ctx, [[-80, -20], [80, -20], [84, -6], [-84, -6]], { fill: "#6b3a1e", w: 4.5, boil: 1, seed: seed + 2 });
    K.line(ctx, [[-84, -24], [-60, -16], [-40, -26], [-16, -16], [8, -26], [32, -16], [56, -26], [84, -20]], { stroke: P.lettuce, w: 9, boil: 1, seed: seed + 3, taper: 0 });
    K.shape(ctx, [[-70, -30], [70, -30], [74, -24], [-74, -24]], { fill: P.cheese, w: 3.5, boil: 0.8, seed: seed + 4 });
    const bun = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; bun.push([Math.cos(a) * 80, -32 + Math.sin(a) * 50]); }
    K.shape(ctx, bun, { fill: P.bread, w: 5, boil: 1.1, seed: seed + 5, shade: { color: P.breadDark, dx: 14, dy: 8 }, shine: { x: 0.3, y: 0.25 } });
    [[-30, -60], [0, -70], [28, -58], [-8, -50]].forEach((d, i) => K.shape(ctx, K.ellipsePts(d[0], d[1], 5, 3, 6, 0.4), { fill: P.cream, stroke: null, w: 0, boil: 0.3, seed: seed + 6 + i, misreg: false }));
    ctx.restore();
  };
  K.coffee = function (ctx, x, y, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shape(ctx, K.ellipsePts(0, 0, 64, 16, 12), { fill: P.cream, w: 4, boil: 0.8, seed });
    K.shape(ctx, K.ellipsePts(52, -46, 18, 20, 10), { fill: null, stroke: P.ink, w: 9, boil: 0.8, seed: seed + 1 });
    K.shape(ctx, [[-44, -84], [44, -84], [36, -6], [-36, -6]], { fill: P.cream, w: 4.5, boil: 1, seed: seed + 2, shade: { color: P.creamShade, dx: 12, dy: 0 } });
    K.rule(ctx, [[-40, -64], [40, -64]], { stroke: P.cherry, w: 7, boil: 0.6, seed: seed + 3 });
    K.steam(ctx, 0, -96, 90, seed + 4);
    ctx.restore();
  };
  K.steam = function (ctx, x, y, h, seed) {
    for (let k = 0; k < 2; k++) {
      const pts = []; for (let i = 0; i <= 6; i++) { const u = i / 6; pts.push([x + (k - 0.5) * 24 + Math.sin(u * 6 + K.now * 3 + k) * 10, y - u * h]); }
      K.line(ctx, pts, { stroke: P.cream, w: 6, boil: 1, seed: seed + k, alpha: 0.85 });
    }
  };

  /* ---------- coin (token) with a ticker. opt: color, label, size, labelColor ---------- */
  K.coin = function (ctx, x, y, r, opt) {
    const o = Object.assign({ color: P.mustard, label: "", seed: 500, size: r * 0.62, labelColor: P.ink }, opt || {});
    K.shape(ctx, K.ellipsePts(x, y, r, r, 16), { fill: o.color, w: Math.max(3, r * 0.08), boil: 0.6 + r * 0.01, seed: o.seed, shade: { color: "rgba(0,0,0,0.18)", dx: r * 0.16, dy: r * 0.16 }, shine: r > 20 ? { x: 0.3, y: 0.25 } : null });
    K.shape(ctx, K.ellipsePts(x, y, r * 0.76, r * 0.76, 14), { fill: null, stroke: P.ink, w: Math.max(2, r * 0.045), boil: 0.4, seed: o.seed + 1, alpha: 0.5 });
    if (o.label) K.text(ctx, o.label, x, y + 1, { size: o.size, weight: 900, fill: o.labelColor });
  };
  K.sparkle = function (ctx, x, y, r, a, seed) {
    if (a <= 0 || r <= 0) return;
    const pts = []; for (let i = 0; i < 8; i++) { const ang = (i / 8) * K.TAU, rr = i % 2 ? r * 0.3 : r; pts.push([x + Math.cos(ang) * rr, y + Math.sin(ang) * rr]); }
    K.shape(ctx, pts, { fill: P.mustard, w: 3, boil: 0.6, seed, alpha: a, misreg: false });
  };
  /* comic impact burst (language-free "POW" shape); r, spikes, color */
  K.burst = function (ctx, x, y, r, opt) {
    const o = Object.assign({ spikes: 12, color: P.mustard, seed: 600, a: 1, rot: 0 }, opt || {});
    if (o.a <= 0) return;
    const pts = []; for (let i = 0; i < o.spikes * 2; i++) { const ang = o.rot + (i / (o.spikes * 2)) * K.TAU, rr = i % 2 ? r * (0.58 + 0.08 * hash(i, o.seed)) : r * (0.92 + 0.12 * hash(i + 9, o.seed)); pts.push([x + Math.cos(ang) * rr, y + Math.sin(ang) * rr]); }
    K.shape(ctx, pts, { fill: o.color, w: 5, boil: 1.2, seed: o.seed, alpha: o.a, dots: { color: "rgba(226,58,63,0.45)", r: 3, gap: 12 } });
  };
  /* speed / action lines radiating from a point (not boiled per vertex, but per frame) */
  K.speedLines = function (ctx, x, y, r0, r1, n, a, seed) {
    if (a <= 0) return;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * K.TAU + hs(i, seed + K.bf) * 0.06, l0 = r0 * (1 + 0.15 * hash(i, seed)), l1 = r1 * (0.8 + 0.25 * hash(i + 3, seed + K.bf));
      K.line(ctx, [[x + Math.cos(ang) * l0, y + Math.sin(ang) * l0], [x + Math.cos(ang) * l1, y + Math.sin(ang) * l1]], { stroke: P.ink, w: 6, boil: 0.5, seed: seed + i, alpha: a });
    }
  };
})(DK);
