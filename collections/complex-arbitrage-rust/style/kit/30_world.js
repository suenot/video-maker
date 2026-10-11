/* ============================================================
   KIT 30 WORLD: sky, sea, clouds, islands, ship, coins, smoke, gulls.
   All draw functions take (ctx, ...) in the current transform and read
   K.now (continuous time) and K.bf (12 fps boil frame).
   Two sets share these parts:
     side view  (sideSky / sideSea: horizon, big ship, the crab close up)
     chart view (chartSea: the sea seen from above, islands = graph nodes)
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  const P = K.P, { hash, hs, clamp, lerp } = K;

  /* ---------------- SIDE VIEW ---------------- */
  /* sky gradient + sun + drifting clouds. horizon = screen y of the horizon */
  K.sideSky = function (ctx, horizon, opt) {
    const o = Object.assign({ sunX: 1480, sunY: 250, warm: 0, drift: 0 }, opt || {});
    const g = ctx.createLinearGradient(0, 0, 0, horizon);
    /* warm = golden hour: keep the top blue, warm only the lower sky (mixing blue into orange goes grey) */
    g.addColorStop(0, mix(P.skyTop, "#8fd0dc", o.warm * 0.4));
    g.addColorStop(0.55, mix(P.skyMid, "#fff0c8", o.warm * 0.8));
    g.addColorStop(1, mix(P.skyLow, "#ffcf86", o.warm));
    ctx.fillStyle = g; ctx.fillRect(-10, -10, K.W + 20, horizon + 12);
    /* sun: glow + boiled disc + slow rays */
    K.glow(ctx, o.sunX, o.sunY, 260, "rgba(255,240,190,0.9)", 0.55);
    ctx.save(); ctx.translate(o.sunX, o.sunY); ctx.rotate(K.now * 0.12);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * K.TAU, r0 = 92, r1 = 130 + 14 * (i % 2);
      K.line(ctx, [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]], { stroke: P.gold, w: 6, boil: 1.5, seed: 40 + i, gap: 0 });
    }
    ctx.restore();
    K.shape(ctx, K.ellipsePts(o.sunX, o.sunY, 72, 72, 18), { fill: P.sun, w: 4.5, boil: 1.6, seed: 31, shade: { color: "#f7b84a", dx: -10, dy: -10 } });
    /* clouds */
    const C = [[220, 150, 1.0, 1], [760, 95, 0.75, 2], [1150, 210, 0.9, 3], [1760, 130, 0.7, 4], [-200, 230, 0.8, 5]];
    C.forEach((c) => {
      const x = ((c[0] + (K.now * 14 + o.drift) * c[2]) % 2300) - 150;
      K.cloud(ctx, x, c[1], c[2], c[3]);
    });
  };
  K.cloud = function (ctx, x, y, s, seed) {
    /* cumulus = outline of a union of 5 circles (polar ray cast), flat bottom */
    const C = [];
    for (let i = 0; i < 5; i++) { const u = i / 4 - 0.5; C.push([u * 190 * s, -(30 + 34 * Math.cos(u * 2.6) + 12 * hash(i, seed)) * s * 0.7, (40 + 26 * Math.cos(u * 2.4) + 10 * hash(i + 9, seed)) * s]); }
    const pts = [];
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * K.TAU, dx = Math.cos(a), dy = Math.sin(a);
      let r = 0;
      C.forEach((c) => { const b = dx * c[0] + dy * c[1], q = c[0] * c[0] + c[1] * c[1] - c[2] * c[2], disc = b * b - q; if (disc >= 0) r = Math.max(r, b + Math.sqrt(disc)); });
      pts.push([x + dx * r, Math.min(y + dy * r, y + 14 * s)]);
    }
    K.shape(ctx, pts, { fill: P.cloud, w: 3.5, boil: 1.6, seed: 70 + seed, shade: { color: P.cloudShade, dx: 10 * s, dy: -16 * s }, gap: 0.06 });
  };
  /* horizon islands far away (silhouettes) */
  K.farIsland = function (ctx, x, y, w, h, seed) {
    const pts = [[x - w / 2, y]];
    for (let i = 1; i < 8; i++) { const u = i / 8; pts.push([x - w / 2 + w * u, y - h * Math.sin(u * Math.PI) * (0.75 + 0.35 * hash(i, seed))]); }
    pts.push([x + w / 2, y]);
    K.shape(ctx, pts, { fill: "#7fb6a8", stroke: "#4f7f78", w: 3, boil: 1.2, seed: 90 + seed });
    K.palm(ctx, x - w * 0.12, y - h * 0.8, 0.45, seed, "#4f8f7c");
  };
  /* sea from horizon down; layered wave rows (layer speed = parallax) */
  K.sideSea = function (ctx, horizon, opt) {
    const o = Object.assign({ pan: 0, warm: 0 }, opt || {});
    const g = ctx.createLinearGradient(0, horizon, 0, K.H);
    g.addColorStop(0, mix(P.seaFar, "#e0a46e", o.warm * 0.35)); g.addColorStop(0.45, P.seaMid); g.addColorStop(1, P.seaDeep);
    ctx.fillStyle = g; ctx.fillRect(-10, horizon, K.W + 20, K.H - horizon + 10);
    K.line(ctx, [[-20, horizon], [K.W * 0.5, horizon + 1], [K.W + 20, horizon]], { stroke: P.ink, w: 3, boil: 0.8, seed: 12 });
    /* sun glitter on far water */
    for (let i = 0; i < 14; i++) {
      const x = 1480 + hs(i, 4) * 160 * (1 + i / 10), y = horizon + 14 + i * 9, l = 26 - i;
      if (hash(i + K.bf, 9) < 0.7) K.line(ctx, [[x - l, y], [x + l, y]], { stroke: P.sunGlow, w: 3, boil: 1, seed: i, gap: 0, alpha: 0.85 });
    }
  };
  /* one row of cartoon wave crests (draw in front-to-back order for depth) */
  K.waveRow = function (ctx, y, opt) {
    const o = Object.assign({ amp: 10, len: 120, speed: 30, pan: 0, color: P.seaMid, crest: P.foam, w: 3.5, seed: 1, fill: true, bottom: K.H + 20 }, opt || {});
    const off = (K.now * o.speed + o.pan) % o.len, pts = [];
    for (let x = -o.len - off; x <= K.W + o.len; x += o.len / 6) {
      const u = ((x + off) / o.len) * K.TAU;
      pts.push([x, y - o.amp * (0.6 * Math.sin(u) + 0.4 * Math.sin(u * 2 + 1.3))]);
    }
    if (o.fill) {
      const poly = pts.concat([[K.W + o.len, o.bottom], [-o.len, o.bottom]]);
      K.pathOf(ctx, K.boil(poly, o.seed, 1.2), true); ctx.fillStyle = o.color; ctx.fill();
    }
    K.line(ctx, pts, { stroke: o.crest, w: o.w, boil: 1.4, seed: o.seed + 3, gap: 0.12 });
    /* little foam ticks on crests */
    for (let i = 0; i < pts.length; i += 6) {
      const p = pts[i]; K.line(ctx, [[p[0] - 12, p[1] + 9], [p[0] + 2, p[1] + 3], [p[0] + 14, p[1] + 8]], { stroke: o.crest, w: o.w * 0.7, boil: 1.2, seed: o.seed + i, gap: 0, alpha: 0.8 });
    }
  };

  /* ---------------- CHART VIEW (sea seen from above) ---------------- */
  /* fills the visible world rect with sea + scattered wave marks. call after K.applyCam */
  K.chartSea = function (ctx, opt) {
    const o = Object.assign({ seed: 5, cell: 170, color: P.seaMid }, opt || {});
    const c = K.cam, hw = K.W / 2 / c.z + 300, hh = K.H / 2 / c.z + 300;
    const x0 = c.x - hw, x1 = c.x + hw, y0 = c.y - hh, y1 = c.y + hh;
    ctx.fillStyle = o.color; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    /* soft depth patches */
    for (let i = 0; i < 9; i++) {
      const px = hash(i, 77) * 3600 - 600, py = hash(i, 78) * 2400 - 300;
      ctx.save(); ctx.globalAlpha = 0.18; K.pathOf(ctx, K.blobPts(px, py, 380, 260, 12, i, 0.3), true); ctx.fillStyle = P.seaDeep; ctx.fill(); ctx.restore();
    }
    /* wave marks on a jittered grid, only inside the view */
    const g = o.cell, i0 = Math.floor(x0 / g), i1 = Math.ceil(x1 / g), j0 = Math.floor(y0 / g), j1 = Math.ceil(y1 / g);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const h = hash(i * 131 + j, o.seed); if (h < 0.45) continue;
      const x = i * g + hs(i + j * 7, 3) * g * 0.4 + Math.sin(K.now * 0.9 + i) * 10, y = j * g + hs(i * 5 + j, 4) * g * 0.35;
      const l = 26 + 18 * hash(i + j, 6), bob = Math.sin(K.now * 2.2 + i * 1.7 + j) * 4;
      K.line(ctx, [[x - l, y + bob], [x - l / 2, y - 7 + bob], [x, y + bob], [x + l / 2, y - 7 + bob], [x + l, y + bob]], { stroke: P.foam, w: 3, boil: 1.4, seed: i * 17 + j, gap: 0, alpha: 0.55 });
    }
  };

  /* ---------------- ISLAND (chart view): also the graph node ---------------- */
  /* s = scale, pop = appear 0..1 (overshoot allowed) */
  K.island = function (ctx, x, y, s, opt) {
    const o = Object.assign({ seed: 1, palms: 2, pop: 1, lighthouse: false }, opt || {});
    if (o.pop <= 0.001) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * o.pop, s * o.pop);
    /* foam ring + shallow water */
    const ring = K.blobPts(0, 18, 250, 120, 22, o.seed, 0.12);
    ctx.save(); ctx.globalAlpha = 0.45; K.pathOf(ctx, ring, true); ctx.fillStyle = "#7fd0d3"; ctx.fill(); ctx.restore();
    const r2 = ring.map((p, i) => [p[0] * (1 + 0.03 * Math.sin(K.now * 2 + i)), p[1] * (1 + 0.03 * Math.sin(K.now * 2 + i))]);
    K.line(ctx, r2.concat([r2[0]]), { stroke: P.foam, w: 4, boil: 2, seed: o.seed + 4, gap: 0.2, alpha: 0.9 });
    /* sand + grass dome */
    K.shape(ctx, K.blobPts(0, 10, 200, 92, 18, o.seed + 1, 0.14), { fill: P.sand, w: 5, boil: 1.8, seed: o.seed + 2, shade: { color: P.sandDark, dx: 0, dy: -18 } });
    K.shape(ctx, K.blobPts(-10, -14, 140, 62, 16, o.seed + 3, 0.16), { fill: P.grass, w: 4.5, boil: 1.8, seed: o.seed + 5, shade: { color: P.grassDark, dx: 10, dy: -16 }, hatch: { ang: -0.6, gap: 14, alpha: 0.25, color: P.grassDark } });
    /* rocks */
    K.shape(ctx, K.blobPts(120, 30, 26, 18, 9, o.seed + 6, 0.2), { fill: P.rock, w: 3.5, boil: 1.2, seed: o.seed + 7 });
    if (o.lighthouse) K.lighthouse(ctx, 70, -30, 0.9);
    for (let i = 0; i < o.palms; i++) K.palm(ctx, -70 + i * 70, -30 - 10 * (i % 2), 0.85 + 0.15 * (i % 2), o.seed + i * 3, P.palm);
    /* pier */
    K.shape(ctx, K.rectPts(-200, 30, 70, 14, 2), { fill: P.wood, w: 3, boil: 1, seed: o.seed + 8 });
    ctx.restore();
  };
  K.palm = function (ctx, x, y, s, seed, leaf) {
    const sway = Math.sin(K.now * 1.5 + seed) * 4;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const trunk = [[0, 0], [4 + sway * 0.2, -30], [10 + sway * 0.5, -60], [16 + sway, -88]];
    K.line(ctx, trunk, { stroke: P.ink, w: 13, boil: 1, seed, gap: 0 });
    K.line(ctx, trunk, { stroke: P.trunk, w: 7, boil: 1, seed, gap: 0 });
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.75 + Math.sin(K.now * 1.7 + i + seed) * 0.06, L = 48;
      const tx = 16 + sway, ty = -88, ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.6 + 18;
      const mx = tx + Math.cos(a) * L * 0.5, my = ty + Math.sin(a) * L * 0.5 - 6;
      K.shape(ctx, [[tx, ty], [mx - Math.sin(a) * 9, my + Math.cos(a) * 9 * 0.4], [ex, ey], [mx + Math.sin(a) * 4, my - 6]], { fill: leaf || P.palm, w: 3, boil: 1.2, seed: seed * 7 + i, gap: 0 });
    }
    ctx.restore();
  };
  K.lighthouse = function (ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shape(ctx, [[-22, 0], [-14, -110], [14, -110], [22, 0]], { fill: P.paper, w: 4, boil: 1.2, seed: 61 });
    K.shape(ctx, [[-19, -30], [-17, -52], [17, -52], [19, -30]], { fill: P.loss, w: 3, boil: 1, seed: 62 });
    K.shape(ctx, [[-17, -74], [-15, -94], [15, -94], [17, -74]], { fill: P.loss, w: 3, boil: 1, seed: 63 });
    K.shape(ctx, K.rectPts(-14, -132, 28, 22, 2), { fill: P.gold, w: 3.5, boil: 1, seed: 64 });
    K.shape(ctx, [[-20, -132], [0, -152], [20, -132]], { fill: P.ink, w: 3, boil: 1, seed: 65 });
    const a = K.now * 2.4;
    ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = P.profitGlow; ctx.beginPath(); ctx.moveTo(0, -121);
    ctx.lineTo(Math.cos(a) * 260, -121 + Math.sin(a) * 40 - 30); ctx.lineTo(Math.cos(a) * 260, -121 + Math.sin(a) * 40 + 30); ctx.fill(); ctx.restore();
    ctx.restore();
  };

  /* ---------------- COINS ---------------- */
  /* a coin seen at 3/4: face ellipse + rim. label optional. spin 0..1 squashes the face */
  K.coin = function (ctx, x, y, r, opt) {
    const o = Object.assign({ color: P.gold, label: "", spin: 0, seed: 1, labelColor: P.ink, size: null }, opt || {});
    const sx = Math.max(0.08, Math.abs(Math.cos(o.spin * Math.PI)));
    ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
    K.shape(ctx, K.ellipsePts(0, 4, r, r * 0.92, 16), { fill: shade(o.color, -0.28), w: 3.5, boil: 0.9, seed: o.seed });
    K.shape(ctx, K.ellipsePts(0, 0, r, r * 0.92, 16), { fill: o.color, w: 3.5, boil: 0.9, seed: o.seed + 1, shade: { color: shade(o.color, -0.14), dx: -r * 0.16, dy: -r * 0.16 } });
    K.line(ctx, K.ellipsePts(0, 0, r * 0.74, r * 0.68, 14).concat([[r * 0.74, 0]]), { stroke: shade(o.color, -0.3), w: 2.5, boil: 0.8, seed: o.seed + 2, gap: 0.25 });
    if (o.label && sx > 0.4) K.text(ctx, o.label, 0, 2, { size: o.size || r * 0.56, weight: 900, fill: o.labelColor });
    ctx.restore();
  };
  /* small plain gold coin for piles and splashes */
  K.goldBit = function (ctx, x, y, r, seed, tilt) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt || 0);
    K.shape(ctx, K.ellipsePts(0, 0, r, r * 0.42, 12), { fill: P.gold, w: 2.5, boil: 0.6, seed, gap: 0, shade: { color: P.goldDark, dx: 0, dy: -r * 0.18 } });
    ctx.restore();
  };
  /* a heap of n coins inside a w-wide footprint, deterministic layout */
  K.coinPile = function (ctx, x, y, n, w, seed) {
    for (let i = 0; i < n; i++) {
      const row = Math.floor(Math.sqrt(i * 1.6)), across = Math.max(1, 6 - row);
      const cx = x + (hs(i, seed) * 0.5) * (w * across / 6), cy = y - row * 9 - hash(i, seed + 1) * 4;
      K.goldBit(ctx, cx, cy, 14, seed + i, hs(i, seed + 2) * 0.25);
    }
  };
  /* sparkle star */
  K.sparkle = function (ctx, x, y, r, a, seed) {
    if (a <= 0) return;
    const pts = [];
    for (let i = 0; i < 8; i++) { const ang = (i / 8) * K.TAU - Math.PI / 2, rr = i % 2 ? r * 0.32 : r; pts.push([x + Math.cos(ang) * rr, y + Math.sin(ang) * rr]); }
    K.shape(ctx, pts, { fill: P.profitGlow, w: 3, boil: 0.8, seed: seed || 3, alpha: a, gap: 0 });
  };

  /* ---------------- SHIP (side view) ----------------
     local units: waterline y = 0, deck y = -60, hull 360 long, faces +x.
     opt: dir (+1/-1), rock (deg), coins (pile count), sail (billow 0..1), emblem (callback(ctx, x, y) for the sail mark),
          crab (callback(ctx) drawing the crab at deck origin [-95, -60]) */
  K.SHIP = { deckY: -60, crabX: -95, pileX: 95, funnelX: -20, mastX: 40 };
  K.ship = function (ctx, x, y, s, opt) {
    const o = Object.assign({ dir: 1, rock: 0, coins: 0, sail: 1, crab: null, smoke: 0, flagColor: P.rust, seed: 200 }, opt || {});
    const S = o.seed;
    ctx.save(); ctx.translate(x, y); ctx.rotate((o.rock * Math.PI) / 180); ctx.scale(s * o.dir, s);
    /* funnel + smoke puffs (puff born on each beat) */
    K.shape(ctx, K.rectPts(-38, -150, 36, 92, 2), { fill: P.ironDark, w: 4, boil: 1, seed: S + 1 });
    K.shape(ctx, K.rectPts(-42, -150, 44, 16, 2), { fill: P.rust, w: 4, boil: 1, seed: S + 2 });
    for (let k = 0; k < 4; k++) {
      const age = ((K.now - K.G.OFFSET) % (K.beatLen() * 2)) / (K.beatLen() * 2) + k; /* 0..4 beats-pairs old */
      const sx = -20 + age * 46 + Math.sin(age * 2 + k) * 6, sy = -168 - age * 34, r = 10 + age * 9;
      K.shape(ctx, K.blobPts(sx, sy, r, r * 0.8, 9, S + 10 + k, 0.2), { fill: "#e9e4da", stroke: P.inkSoft, w: 3, boil: 1.2, seed: S + 20 + k, alpha: clamp(1 - age / 4, 0, 1) * 0.95 });
    }
    /* mast + sail */
    K.line(ctx, [[40, -60], [40, -330]], { stroke: P.ink, w: 12, boil: 0.8, seed: S + 3, gap: 0 });
    K.line(ctx, [[40, -60], [40, -330]], { stroke: P.woodDark, w: 6, boil: 0.8, seed: S + 3, gap: 0 });
    const b = 26 * o.sail + 4 * Math.sin(K.now * 2.1);
    const sail = [[46, -312], [100, -308 - 2], [160, -300], [160 + b * 0.6, -220], [158 + b * 0.2, -136], [100, -132], [46, -136], [46 + b * 0.25, -224]];
    K.shape(ctx, sail, { fill: P.sail, w: 4.5, boil: 1.6, seed: S + 4, shade: { color: P.sailShade, dx: -16, dy: 0 } });
    if (o.emblem) o.emblem(ctx, 104 + b * 0.25, -222); else K.cog(ctx, 104 + b * 0.25, -222, 30, P.rust, S + 5);
    /* flag on top */
    const fl = []; for (let i = 0; i <= 5; i++) { const u = i / 5; fl.push([40 + u * 60, -330 + Math.sin(K.now * 7 + u * 4) * 6 * u]); }
    for (let i = 5; i >= 0; i--) { const u = i / 5; fl.push([40 + u * 60, -300 + Math.sin(K.now * 7 + u * 4 + 0.4) * 6 * u]); }
    K.shape(ctx, fl, { fill: o.flagColor, w: 3.5, boil: 1, seed: S + 6 });
    /* deck rail */
    K.line(ctx, [[-175, -84], [150, -84]], { stroke: P.ink, w: 5, boil: 1, seed: S + 7 });
    for (let i = 0; i < 12; i++) K.line(ctx, [[-170 + i * 28, -60], [-170 + i * 28, -84]], { stroke: P.ink, w: 3.5, boil: 0.8, seed: S + 30 + i, gap: 0 });
    /* coins on deck (behind hull edge) */
    if (o.coins > 0) K.coinPile(ctx, 95, -64, Math.round(o.coins), 110, S + 40);
    /* crab stands behind the hull top edge */
    /* helm wheel (behind the crab) */
    K.wheel(ctx, -168, -100, 26, S + 8);
    if (o.crab) { ctx.save(); ctx.translate(-95, -60); o.crab(ctx); ctx.restore(); }
    /* hull */
    const hull = [[-182, -66], [-150, -60], [100, -60], [178, -78], [160, -30], [120, 10], [60, 24], [-120, 24], [-165, 0]];
    K.shape(ctx, hull, { fill: P.iron, w: 6, boil: 1.4, seed: S + 9, shade: { color: P.ironDark, dx: 0, dy: -22 }, hatch: { ang: -0.8, gap: 13, alpha: 0.18, color: P.ink } });
    /* waterline band */
    K.line(ctx, [[-160, -6], [-100, 2], [60, 4], [134, -2]], { stroke: P.waterline, w: 9, boil: 1, seed: S + 11, gap: 0 });
    /* plate seams + rivets */
    for (let i = 0; i < 6; i++) K.line(ctx, [[-110 + i * 48, -58], [-112 + i * 48, 18]], { stroke: P.ironDark, w: 2.5, boil: 1, seed: S + 50 + i, gap: 0.3 });
    for (let i = 0; i < 15; i++) K.dot(ctx, -150 + i * 21, -46, 3.2, P.rivet, P.ink, 1.6, S + 60 + i);
    /* portholes */
    [-60, 10, 80].forEach((px, i) => {
      K.shape(ctx, K.ellipsePts(px, -24, 13, 13, 12), { fill: "#bfe6ec", w: 4, boil: 0.8, seed: S + 70 + i, shade: { color: "#8cc6d2", dx: 4, dy: 4 } });
      K.line(ctx, K.ellipsePts(px, -24, 17, 17, 12).concat([[px + 17, -24]]), { stroke: P.rivet, w: 2.5, boil: 0.6, seed: S + 80 + i, gap: 0.3 });
    });
    ctx.restore();
  };
  K.wheel = function (ctx, x, y, r, seed) {
    const a = Math.sin(K.now * 0.9) * 0.4;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    for (let i = 0; i < 8; i++) { const ang = (i / 8) * K.TAU; K.line(ctx, [[0, 0], [Math.cos(ang) * r * 1.35, Math.sin(ang) * r * 1.35]], { stroke: P.woodDark, w: 5, boil: 0.6, seed: seed + i, gap: 0 }); }
    K.line(ctx, K.ellipsePts(0, 0, r, r, 14).concat([[r, 0]]), { stroke: P.ink, w: 9, boil: 0.8, seed, gap: 0 });
    K.line(ctx, K.ellipsePts(0, 0, r, r, 14).concat([[r, 0]]), { stroke: P.wood, w: 5, boil: 0.8, seed, gap: 0 });
    ctx.restore();
    K.line(ctx, [[x, y], [x + 8, y + 40]], { stroke: P.woodDark, w: 7, boil: 0.6, seed: seed + 20, gap: 0 });
  };
  /* gear emblem (Rust-y cog), r = outer radius */
  K.cog = function (ctx, x, y, r, color, seed) {
    const pts = [], n = 10;
    for (let i = 0; i < n * 4; i++) {
      const a = (i / (n * 4)) * K.TAU, tooth = i % 4 < 2 ? 1 : 0.78;
      pts.push([x + Math.cos(a) * r * tooth, y + Math.sin(a) * r * tooth]);
    }
    K.shape(ctx, pts, { fill: color, w: 3.5, boil: 0.9, seed, gap: 0.05 });
    K.shape(ctx, K.ellipsePts(x, y, r * 0.38, r * 0.38, 10), { fill: P.sail, w: 3, boil: 0.8, seed: seed + 1, gap: 0 });
  };

  /* small ship for the chart view (top-down-ish 3/4), heading = radians */
  K.miniShip = function (ctx, x, y, s, opt) {
    const o = Object.assign({ heading: 0, coins: 0, crab: null }, opt || {});
    const flip = Math.cos(o.heading) < 0 ? -1 : 1;
    /* wake */
    ctx.save(); ctx.translate(x, y);
    const back = o.heading + Math.PI;
    for (let i = 1; i <= 4; i++) {
      const d = i * 34 * s, sp = (10 + i * 7) * s;
      const cx = Math.cos(back) * d, cy = Math.sin(back) * d, nx = -Math.sin(back) * sp, ny = Math.cos(back) * sp;
      K.line(ctx, [[cx + nx, cy + ny], [cx + nx * 0.4 + Math.cos(back) * 8, cy + ny * 0.4]], { stroke: P.foam, w: 3, boil: 1, seed: 300 + i, gap: 0, alpha: 1 - i / 5 });
      K.line(ctx, [[cx - nx, cy - ny], [cx - nx * 0.4 + Math.cos(back) * 8, cy - ny * 0.4]], { stroke: P.foam, w: 3, boil: 1, seed: 310 + i, gap: 0, alpha: 1 - i / 5 });
    }
    ctx.restore();
    K.ship(ctx, x, y + 6 * s, s, { dir: flip, rock: Math.sin(K.now * 2.4) * 3, coins: o.coins, crab: o.crab, sail: 0.8 });
  };

  /* ---------------- GULL ---------------- */
  K.gull = function (ctx, x, y, s, phase) {
    const f = Math.sin(K.now * 9 + phase) * 0.5 + 0.5;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.line(ctx, [[-30, -6 - 14 * f], [-14, -2 - 4 * f], [0, 4], [14, -2 - 4 * f], [30, -6 - 14 * f]], { stroke: P.ink, w: 4.5, boil: 1, seed: 400 + phase, gap: 0 });
    ctx.restore();
  };

  /* ---------------- colour helpers ---------------- */
  function hexRgb(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgbHex(c) { return "#" + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join(""); }
  function mix(a, b, u) { const A = hexRgb(a), B = hexRgb(b); return rgbHex([lerp(A[0], B[0], u), lerp(A[1], B[1], u), lerp(A[2], B[2], u)]); }
  function shade(a, k) { return k < 0 ? mix(a, "#000000", -k) : mix(a, "#ffffff", k); }
  K.mix = mix; K.shadeC = shade;
})(CK);
