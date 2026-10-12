/* ============================================================
   KIT 30 WORLD (Surf Turtle kit): the beach, the ocean and the weather.
   Wave height IS volatility. Every draw takes `storm` (0 calm .. 1 storm)
   so one call recolours and re-shapes the world when the regime flips.
   Draw functions work in the current transform and read K.now (smooth time)
   and K.bf (12 fps wobble frame).
     sky      banded sunset (calm) or bruised purple (storm), striped retro sun
     ocean    rows of scalloped waves from the horizon down; amp = volatility
     surfWave the hero wave the turtle rides (face + foam lip + curl)
     beach    sand foreground with a wet edge and foam lace
     lighthouse on a rock; beam colour = current regime
     surfboard (with the tiny volatility gauge), palm, gull, rain, spray
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const P = K.P, { hash, hs, clamp, lerp } = K;
  const M = (a, b, s) => K.mix(a, b, s);

  /* ---------------- SKY ---------------- */
  K.skyColors = (storm) => [M(P.sky0, P.storm0, storm), M(P.sky1, P.storm1, storm), M(P.sky2, P.storm2, storm), M(P.sky3, P.storm3, storm), M(P.sky4, P.storm4, storm)];
  /* striped retro sun: a disc with horizontal cuts in its lower half */
  K.retroSun = function (ctx, x, y, r, opt) {
    const o = Object.assign({ a: 1, stripes: 5, cut: null, seed: 31 }, opt || {});
    if (o.a <= 0) return;
    ctx.save(); ctx.globalAlpha *= o.a;
    K.glow(ctx, x, y, r * 2.1, "rgba(255,226,150,0.85)", 0.5);
    /* concentric rings behind (print rings, not a gradient) */
    [1.55, 1.3].forEach((k, i) => K.shape(ctx, K.ellipsePts(x, y, r * k, r * k, 28), { fill: i ? P.sunRing : P.sky3, stroke: null, w: 0, boil: 1.2, seed: o.seed + i, alpha: 0.55 }));
    ctx.save();
    K.pathOf(ctx, K.ellipsePts(x, y, r, r, 24), true); ctx.clip();
    ctx.fillStyle = P.sun; ctx.fillRect(x - r - 5, y - r - 5, 2 * r + 10, 2 * r + 10);
    ctx.fillStyle = o.cut || P.sky2;
    for (let i = 0; i < o.stripes; i++) { const yy = y + r * (0.1 + i * 0.19), h = r * (0.035 + i * 0.022); ctx.fillRect(x - r - 5, yy, 2 * r + 10, h); }
    ctx.restore();
    K.shape(ctx, K.ellipsePts(x, y, r, r, 24), { fill: null, w: 5, boil: 1.2, seed: o.seed + 5 });
    ctx.restore();
  };
  /* poster cloud: stacked lozenges (60s print clouds), back to front */
  K.cloud = function (ctx, x, y, s, seed, storm) {
    storm = storm || 0;
    const L = [[0.08, -0.62, 0.42, 0.2], [-0.16, -0.32, 0.62, 0.22], [0.12, 0, 1, 0.24]];
    L.forEach((l, i) => {
      const cx = x + l[0] * 300 * s, cy = y + l[1] * 120 * s, w = l[2] * 300 * s * (0.9 + 0.2 * hash(i, seed)), h = l[3] * 120 * s * 1.6;
      K.shape(ctx, K.roundPts(cx - w / 2, cy - h / 2, w, h, h / 2, 4), { fill: M(P.cloud, P.stormCloud, storm), w: 4, boil: 0.9, seed: 70 + seed * 5 + i, shade: { color: M(P.cloudShade, P.stormCloudShade, storm), dx: 0, dy: -h * 0.32, dots: storm < 0.5, cell: 8, density: 0.8 } });
    });
  };
  K.sky = function (ctx, horizon, opt) {
    const o = Object.assign({ storm: 0, sunX: 1400, sunY: horizon - 140, sunR: 120, drift: 0, clouds: true, w: K.W, x: 0, top: -400 }, opt || {});
    K.bands(ctx, o.x - 10, o.top, o.w + 20, horizon - o.top + 12, K.skyColors(o.storm), { wave: 9, seed: 3 });
    /* the sun sinks behind the storm */
    K.retroSun(ctx, o.sunX, o.sunY + 60 * o.storm, o.sunR, { a: 1 - 0.85 * o.storm, cut: M(P.sky2, P.storm2, o.storm) });
    if (o.clouds) {
      const C = [[260, 0.32, 0.9, 1], [820, 0.18, 0.7, 2], [1240, 0.38, 0.8, 3], [1780, 0.22, 0.65, 4]];
      C.forEach((c) => {
        const x = ((c[0] + (K.now * 10 + o.drift) * c[2]) % 2400) - 240 + o.x;
        K.cloud(ctx, x, horizon * c[1] + 40, c[2] * (1 + 0.5 * o.storm), c[3], o.storm);
      });
    }
  };
  /* rain: slanted brush dashes, density follows storm */
  K.rain = function (ctx, storm, opt) {
    const o = Object.assign({ x: 0, y: 0, w: K.W, h: K.H, seed: 5 }, opt || {});
    if (storm < 0.05) return;
    const n = Math.floor(90 * storm);
    ctx.save(); ctx.globalAlpha *= 0.55 * storm; ctx.strokeStyle = P.cream; ctx.lineWidth = K.lw(ctx, 3);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const sp = 900 + 300 * hash(i, o.seed), x0 = o.x + hash(i + 7, o.seed) * (o.w + 300), y0 = o.y + ((hash(i + 3, o.seed) * o.h + K.now * sp) % (o.h + 80)) - 40;
      ctx.moveTo(x0 - 0.3 * y0 * 0.2, y0); ctx.lineTo(x0 - 0.3 * y0 * 0.2 - 14, y0 + 40);
    }
    ctx.stroke(); ctx.restore();
  };

  /* ---------------- OCEAN ---------------- */
  /* one row of scalloped poster waves at screen/world y. amp = height (volatility) */
  K.waveRow = function (ctx, y, amp, opt) {
    const o = Object.assign({ x0: -100, x1: K.W + 100, len: 180, speed: 40, fill: P.sea, shade: P.seaMid, foam: true, seed: 1, w: 3.5, bottom: 400 }, opt || {});
    const top = [], off = (K.now * o.speed) % o.len;
    for (let x = o.x0 - o.len + off; x <= o.x1 + o.len; x += o.len / 6) {
      const ph = ((x - off) / o.len) * K.TAU, k = Math.floor((x - off) / o.len);
      const a = amp * (0.75 + 0.5 * hash(k, o.seed)); /* waves differ, a little */
      top.push([x, y - a * (0.5 + 0.5 * Math.cos(ph)) ** 2.2]);
    }
    const body = top.concat([[o.x1 + o.len, y + o.bottom], [o.x0 - o.len, y + o.bottom]]);
    K.shape(ctx, body, { fill: o.fill, w: o.w, boil: 0.8, seed: o.seed, shade: { color: o.shade, dx: 0, dy: Math.max(10, amp * 0.5), dots: true, cell: 8, density: 0.75 } });
    if (o.foam && amp > 4) { /* cream caps on the crests */
      for (let x = o.x0 - o.len + off, k = 0; x <= o.x1 + o.len; x += o.len, k++) {
        const kk = Math.floor((x - off) / o.len + 0.5), a = amp * (0.75 + 0.5 * hash(kk, o.seed));
        const cap = [[x - o.len * 0.16, y - a * 0.72], [x - o.len * 0.05, y - a * 0.98], [x + o.len * 0.06, y - a * 0.95], [x + o.len * 0.14, y - a * 0.7]];
        K.line(ctx, cap, { stroke: P.foam, w: Math.min(10, 3 + a * 0.12), boil: 0.6, seed: o.seed + k + 40, brush: { taper: 0.2 } });
      }
    }
  };
  /* the whole sea from horizon to bottom: far rows small, near rows big. vol scales all heights */
  K.ocean = function (ctx, horizon, opt) {
    const o = Object.assign({ storm: 0, vol: null, bottom: K.H + 60, x0: -100, x1: K.W + 100, rows: 6 }, opt || {});
    const vol = o.vol == null ? 0.15 + 0.85 * o.storm : o.vol;
    const H = o.bottom - horizon, s = o.storm;
    ctx.fillStyle = M(P.seaDeep, P.stormDeep, s); ctx.fillRect(o.x0, horizon, o.x1 - o.x0, H + 200);
    for (let i = 0; i < o.rows; i++) {
      const u = i / (o.rows - 1), y = horizon + 6 + H * Math.pow(u, 1.35) * 0.92;
      const amp = (4 + 70 * u) * vol, len = 90 + 260 * u;
      const fill = M(M(P.seaLight, P.sea, u), M(P.stormSea, P.stormDeep, u * 0.5), s), shade = M(M(P.sea, P.seaMid, u), P.stormDeep, s);
      K.waveRow(ctx, y, amp, { x0: o.x0, x1: o.x1, len, speed: (14 + 50 * u) * (1 + vol), fill, shade, seed: 11 + i * 13, w: 2.5 + 2 * u, bottom: H + 80 });
    }
  };
  /* sea surface height at x for the hero wave (used to place the board): a swell travelling right */
  K.swellY = function (x, base, amp, len, t) {
    const ph = ((x - t * 120) / len) * K.TAU;
    return base - amp * (0.5 + 0.5 * Math.cos(ph));
  };
  /* hero surf wave: a tall wave breaking to the LEFT, seen from the side.
     x = crest x, base = sea level y, h = height (volatility). Face bands are
     printed as parallel offset screens of the crest line (poster style). */
  K.surfWave = function (ctx, x, base, h, opt) {
    const o = Object.assign({ storm: 0, seed: 300, width: 1100, curl: 1 }, opt || {});
    if (h < 6) return;
    const s = o.storm, W = o.width, c = o.curl, wob = 6 * Math.sin(K.now * 2.2);
    /* back slope (right) up to the crest, lip thrown left and curling down */
    const crest = [[x + W, base], [x + W * 0.6, base - h * 0.2], [x + W * 0.3, base - h * 0.62], [x + h * 0.12, base - h * 0.95],
      [x - h * 0.12 * c, base - h * 1.02 + wob], [x - h * 0.4 * c, base - h * 0.92 + wob], [x - h * 0.55 * c, base - h * 0.7], [x - h * 0.5 * c, base - h * 0.52]];
    const inner = [[x - h * 0.36 * c, base - h * 0.6], [x - h * 0.2 * c, base - h * 0.66], [x - h * 0.05, base - h * 0.5], [x - h * 0.12, base - h * 0.2], [x - h * 0.5, base + 4], [x - W * 0.5, base + 8]];
    const outline = crest.concat(inner, [[x - W * 0.5, base + 500], [x + W, base + 500]]);
    const col = (a, b) => M(a, b, s);
    K.shape(ctx, outline, { fill: col(P.sea, P.stormSea), w: 5.5, boil: 1.2, seed: o.seed });
    /* face bands: offset copies of the crest, darker toward the trough */
    ctx.save(); K.pathOf(ctx, outline, true); ctx.clip();
    [[0.16, col(P.seaMid, P.stormDeep)], [0.34, col(P.seaDeep, P.seaNight)]].forEach((b, i) => {
      const band = crest.slice(0, 5).map((p) => [p[0] + h * b[0] * 0.5, p[1] + h * b[0] * 1.3]).concat([[x - h * 0.2, base + 600], [x + W + 100, base + 600]]);
      K.shape(ctx, band, { fill: b[1], stroke: null, w: 0, boil: 1, seed: o.seed + 5 + i, reg: false, dots: i ? { color: P.ink, cell: 9, density: 0.5, alpha: 0.3 } : null });
    });
    /* tube shadow under the lip */
    K.shape(ctx, [[x - h * 0.42 * c, base - h * 0.66], [x - h * 0.1, base - h * 0.82], [x + h * 0.02, base - h * 0.6], [x - h * 0.08, base - h * 0.4], [x - h * 0.3 * c, base - h * 0.52]], { fill: col(P.seaNight, "#0b2f3a"), stroke: null, w: 0, boil: 1, seed: o.seed + 1, reg: false });
    ctx.restore();
    K.shape(ctx, outline, { fill: null, w: 5.5, boil: 1.2, seed: o.seed });
    /* light streak along the face and the foam lip with fingers */
    K.line(ctx, [[x + W * 0.45, base - h * 0.42], [x + W * 0.2, base - h * 0.74], [x + h * 0.1, base - h * 0.88]], { stroke: col(P.seaLight, P.sea), w: 9, boil: 1, seed: o.seed + 3, alpha: 0.9 });
    K.line(ctx, crest.slice(2), { stroke: P.foam, w: 12 + h * 0.035, boil: 1.1, seed: o.seed + 2, brush: { taper: 0.3 } });
    for (let i = 0; i < 6; i++) {
      const u = i / 5, px = x - h * (0.1 + 0.42 * u) * c, py = base - h * (1.0 - 0.38 * u * u) + 4 * Math.sin(K.now * 6 + i);
      K.dot(ctx, px - 6 * Math.sin(u * 3), py, 6 + h * 0.018 * (1 + hash(i, o.seed)), P.foam, P.ink, 2.5, o.seed + 10 + i);
    }
    /* whitewater at the foot of the break */
    for (let i = 0; i < 7; i++) {
      const px = x - h * 0.5 - i * h * 0.12, py = base - 10 - 18 * hash(i, o.seed + 4) + 5 * Math.sin(K.now * 5 + i);
      K.dot(ctx, px, py, 14 + 16 * hash(i + 2, o.seed), P.foam, P.ink, 3, o.seed + 30 + i);
    }
  };
  /* point on the wave face at height fraction v (0 trough .. 1 lip) right of the crest:
     where the board sits. returns [x, y, slope angle deg] */
  K.wavePoint = function (x, base, h, v, opt) {
    const W = (opt && opt.width) || 1100;
    const px = x + h * 0.12 + (W * 0.6 - h * 0.12) * (1 - v), py = base - h * (0.2 + 0.75 * v);
    return [px, py, -30 * v - 8];
  };
  /* spray burst at (x,y), age d seconds (0..0.6) */
  K.spray = function (ctx, x, y, d, s, seed) {
    if (d < 0 || d > 0.7) return;
    const u = d / 0.7;
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * (0.15 + 0.7 * hash(i, seed)), sp = (140 + 160 * hash(i + 3, seed)) * (s || 1);
      const px = x + Math.cos(a) * sp * u, py = y + Math.sin(a) * sp * u + 400 * u * u;
      K.dot(ctx, px, py, (6 + 8 * hash(i + 5, seed)) * (1 - u * 0.6) * (s || 1), P.foam, P.ink, 2.5, seed + i);
    }
  };

  /* ---------------- LAND ---------------- */
  K.palm = function (ctx, x, y, s, seed, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const sway = Math.sin(K.now * 1.3 + seed) * 6;
    const trunk = [[0, 0], [8, -80], [24 + sway * 0.4, -170], [40 + sway, -250]];
    K.line(ctx, trunk, { stroke: P.ink, w: 26, boil: 0.8, seed: seed + 1, brush: { taper: 0.7 } });
    K.line(ctx, trunk, { stroke: P.trunk, w: 16, boil: 0.8, seed: seed + 1, brush: { taper: 0.7 } });
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI + (i / 5) * Math.PI + hs(i, seed) * 0.2, L = 120 + 30 * hash(i, seed);
      const tip = [40 + sway + Math.cos(a) * L, -250 + Math.sin(a) * L * 0.5 + 40];
      const mid = [40 + sway + Math.cos(a) * L * 0.5, -250 + Math.sin(a) * L * 0.5 - 18];
      K.shape(ctx, [[40 + sway, -250], mid, tip, [mid[0], mid[1] + 22]], { fill: color || P.palm, w: 4, boil: 1, seed: seed + 10 + i, shade: { color: P.palmDark, dx: 0, dy: -10 } });
    }
    ctx.restore();
  };
  /* sand foreground: top edge at y, wet edge + foam lace above it */
  K.beach = function (ctx, y, opt) {
    const o = Object.assign({ x0: -100, x1: K.W + 100, seed: 40, storm: 0, lace: true }, opt || {});
    const top = [];
    for (let x = o.x0; x <= o.x1; x += 80) top.push([x, y + 10 * Math.sin(x * 0.004 + o.seed) + 6 * K.fbm(x * 0.01, o.seed, 2)]);
    if (o.lace) {
      const wash = 14 * Math.sin(K.now * 1.6) + 10 * o.storm;
      K.shape(ctx, top.map((p) => [p[0], p[1] - 26 - wash]).concat(top.slice().reverse().map((p) => [p[0], p[1] + 10])), { fill: P.sandWet, w: 3, boil: 1, seed: o.seed + 1 });
      K.line(ctx, top.map((p, i) => [p[0], p[1] - 26 - wash + 6 * Math.sin(i * 1.3 + K.now * 3)]), { stroke: P.foam, w: 9, boil: 1, seed: o.seed + 2 });
    }
    K.shape(ctx, top.concat([[o.x1, y + 900], [o.x0, y + 900]]), { fill: M(P.sand, "#c9a988", o.storm * 0.5), w: 5, boil: 1, seed: o.seed, dots: { color: P.sandDark, cell: 12, density: 0.32, alpha: 0.6 } });
  };
  /* rocky headland + lighthouse. beam = regime colour, ang = sweep angle (rad, 0 = to the left) */
  K.lighthouse = function (ctx, x, y, s, opt) {
    const o = Object.assign({ beam: P.beamCalm, ang: 0, on: 1, seed: 120, flash: 0 }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    /* beam first (behind the tower) */
    if (o.on > 0) {
      const lx = 0, ly = -300, L = 1500, spread = 0.13 + 0.05 * o.flash, a = Math.PI + o.ang;
      ctx.save(); ctx.globalAlpha *= 0.42 * o.on + 0.3 * o.flash;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(a - spread) * L, ly + Math.sin(a - spread) * L); ctx.lineTo(lx + Math.cos(a + spread) * L, ly + Math.sin(a + spread) * L); ctx.closePath();
      ctx.fillStyle = o.beam; ctx.fill(); ctx.restore();
      K.glow(ctx, lx, ly, 120 + 80 * o.flash, o.beam, 0.8 * o.on);
    }
    /* rock */
    K.shape(ctx, [[-180, 30], [-150, -40], [-80, -70], [10, -80], [90, -60], [160, -20], [200, 30], [200, 80], [-180, 80]], { fill: P.rock, w: 5, boil: 1, seed: o.seed, shade: { color: P.rockDark, dx: -20, dy: -16, dots: true, cell: 9, density: 0.8 } });
    /* tower: tapered, red + cream stripes */
    const tower = [[-48, -70], [-30, -270], [30, -270], [48, -70]];
    K.shape(ctx, tower, { fill: P.light, w: 5, boil: 0.8, seed: o.seed + 1 });
    ctx.save(); K.pathOf(ctx, tower, true); ctx.clip();
    [-110, -190].forEach((yy, i) => { ctx.fillStyle = P.lightRed; ctx.fillRect(-60, yy - 20, 120, 38); });
    ctx.restore();
    K.shape(ctx, tower, { fill: null, w: 5, boil: 0.8, seed: o.seed + 1 });
    /* lamp room + roof */
    K.shape(ctx, K.rectPts(-34, -320, 68, 50, 2), { fill: o.on > 0 ? M(P.sun, o.beam, 0.5) : P.creamShade, w: 4.5, boil: 0.8, seed: o.seed + 2 });
    K.shape(ctx, [[-50, -320], [0, -372], [50, -320]], { fill: P.lightRoof, w: 4.5, boil: 0.8, seed: o.seed + 3 });
    K.shape(ctx, K.rectPts(-56, -276, 112, 12, 2), { fill: P.lightRoof, w: 3.5, boil: 0.6, seed: o.seed + 4 });
    ctx.restore();
  };
  /* far island on the horizon: a low muted hump with two palms */
  K.farIsle = function (ctx, x, y, w, storm, seed) {
    const col = M("#e9a86a", P.storm2, storm), pts = [[x - w / 2, y + 4]];
    for (let i = 1; i < 8; i++) { const u = i / 8; pts.push([x - w / 2 + w * u, y - w * 0.09 * Math.sin(u * Math.PI) * (0.8 + 0.4 * hash(i, seed))]); }
    pts.push([x + w / 2, y + 4]);
    K.shape(ctx, pts, { fill: col, stroke: M("#b5704a", P.storm0, storm), w: 3, boil: 0.6, seed });
    K.palm(ctx, x - w * 0.1, y - w * 0.07, 0.3, seed, M("#b5704a", P.storm0, storm));
    K.palm(ctx, x + w * 0.12, y - w * 0.06, 0.24, seed + 3, M("#b5704a", P.storm0, storm));
  };
  K.gull = function (ctx, x, y, s, seed) {
    const f = Math.sin(K.now * 8 + seed) * 10;
    K.line(ctx, [[x - 26 * s, y - f * s * 0.5], [x - 10 * s, y - 8 * s], [x, y], [x + 10 * s, y - 8 * s], [x + 26 * s, y - f * s * 0.5]], { stroke: P.ink, w: 4.5, boil: 0.6, seed });
  };

  /* ---------------- SURFBOARD ----------------
     drawn along +x from tail (0,0) to nose (len,0) in local space after rotation ang (deg).
     opt.kind "long" (cream, turquoise stripe: the calm board) | "gun" (coral, pointy: the storm board)
     opt.gauge 0..1 -> the tiny volatility gauge on the deck (null = none); after drawing,
     K.gaugePt = its screen point (+ .r screen radius), for dial transitions */
  K.surfboard = function (ctx, x, y, len, ang, opt) {
    const o = Object.assign({ kind: "long", gauge: null, seed: 200, wood: false, fin: true, deck: 0.22 }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.rotate((ang * Math.PI) / 180);
    const th = len * (o.kind === "gun" ? 0.12 : 0.15) * (o.deck / 0.22), nose = o.kind === "gun" ? 0.05 : 0.18;
    const pts = [];
    for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([len * u, -th * Math.sin(Math.PI * Math.pow(u, 0.8)) ** (u > 0.7 ? 1 - nose : 0.5) * 0.5 - 2]); }
    for (let i = 10; i >= 0; i--) { const u = i / 10; pts.push([len * u, th * Math.sin(Math.PI * Math.pow(u, 0.8)) ** (u > 0.7 ? 1 - nose : 0.5) * 0.5 + 2]); }
    if (o.fin) K.shape(ctx, [[len * 0.06, th * 0.3], [len * 0.12, th * 1.25], [len * 0.2, th * 0.3]], { fill: P.ink, w: 3, boil: 0.6, seed: o.seed + 9 });
    const fill = o.kind === "gun" ? P.storm : o.wood ? P.woodLight : P.board;
    K.shape(ctx, pts, { fill, w: 4.5, boil: 0.8, seed: o.seed, shade: { color: o.kind === "gun" ? "#b83b4c" : P.creamShade, dx: 0, dy: -th * 0.35 } });
    if (o.wood) K.woodgrain(ctx, pts, { ang: 0.02, gap: 10, seed: o.seed, alpha: 0.35 });
    /* racing stripe */
    ctx.save(); K.pathOf(ctx, pts, true); ctx.clip();
    ctx.fillStyle = o.kind === "gun" ? P.cream : P.boardStripe2; ctx.fillRect(0, -th * 0.12, len, th * 0.09);
    ctx.fillStyle = o.kind === "gun" ? P.sigma : P.boardStripe; ctx.fillRect(0, th * 0.03, len, th * 0.07);
    ctx.restore();
    if (o.gauge != null) { /* the tiny gauge stands on a stalk on the nose deck, readable from the side */
      const gr = th * 0.62, gx = len * 0.76, gy = -th * 0.45 - gr * 1.15;
      K.line(ctx, [[gx, -th * 0.3], [gx, gy]], { stroke: P.ink, w: Math.max(3, th * 0.1), boil: 0.3, seed: o.seed + 19 });
      K.gauge(ctx, gx, gy, gr, o.gauge, { seed: o.seed + 20 });
      K.gaugePt = ctx.getTransform().transformPoint(new DOMPoint(gx, gy)); K.gaugePt.r = gr * Math.hypot(ctx.getTransform().a, ctx.getTransform().b);
    }
    ctx.restore();
  };
  /* volatility gauge: half dial turquoise -> mustard -> coral, needle at v (0..1) */
  K.gauge = function (ctx, x, y, r, v, opt) {
    const o = Object.assign({ seed: 220, flat: false, ticks: true }, opt || {});
    ctx.save(); ctx.translate(x, y);
    const a0 = Math.PI, a1 = 2 * Math.PI, arc = (u) => a0 + (a1 - a0) * u;
    K.shape(ctx, K.ellipsePts(0, 0, r, r, 18), { fill: P.cream, w: Math.max(2.5, r * 0.09), boil: 0.4, seed: o.seed, reg: r > 30 });
    [[0, 0.4, P.calm], [0.4, 0.7, P.sigma], [0.7, 1, P.storm]].forEach((z) => {
      ctx.beginPath(); ctx.arc(0, 0, r * 0.72, arc(z[0]), arc(z[1])); ctx.strokeStyle = z[2]; ctx.lineWidth = r * 0.26; ctx.lineCap = "butt"; ctx.stroke();
    });
    ctx.lineCap = "round";
    if (o.ticks) for (let i = 0; i <= 4; i++) { const a = arc(i / 4); K.line(ctx, [[Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86], [Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98]], { stroke: P.ink, w: Math.max(1.5, r * 0.06), boil: 0, seed: o.seed + i }); }
    const a = arc(clamp(v, -0.05, 1.05));
    K.line(ctx, [[0, 0], [Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8]], { stroke: P.ink, w: Math.max(2, r * 0.12), boil: 0, seed: o.seed + 9, brush: { taper: 0.5 } });
    K.dot(ctx, 0, 0, Math.max(2.5, r * 0.14), P.storm, P.ink, Math.max(1.5, r * 0.05), o.seed + 10);
    ctx.restore();
  };
})(VK);
