/* ============================================================
   KIT 30 WORLD: the clockwork railway station.
   Side view, ground line usually at y = 860 (rail top). Everything is
   built from geometric shapes in four inks, with halftone shadow.
     sky / sun / cloud / hills / mesas      backgrounds (draw with parallax)
     clockTower / gear                      the clockwork
     platform / track / lampPost            the station
     wheel / wagon / crate / loco / puff    rolling stock (child orders)
     pond / ripple / splash                 the price pond (market impact)
     coin / booth / gauge                   money, quote windows, dials
   ============================================================ */
var SK = window.SK || (window.SK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;

  /* ---------- sky: flat cream, a halftone glow above the horizon, the sun ---------- */
  K.sky = function (ctx, opt) {
    const o = Object.assign({ horizon: 760, x0: -2000, x1: 6000, y0: -1600, sun: [1500, 300], sunR: 130, rays: true, warm: 0 }, opt || {});
    ctx.fillStyle = P.sky; ctx.fillRect(o.x0, o.y0, o.x1 - o.x0, o.horizon + 400 - o.y0);
    K.halftone(ctx, [[o.x0, o.y0], [o.x1, o.y0], [o.x1, o.horizon - 180], [o.x0, o.horizon - 180]], { color: P.skyHigh, gap: 16, r: 6, r2: 0, dir: Math.PI / 2, alpha: 0.9, ang: 0.26 });
    K.halftone(ctx, [[o.x0, o.horizon - 340], [o.x1, o.horizon - 340], [o.x1, o.horizon + 40], [o.x0, o.horizon + 40]], { color: P.mustardLight, gap: 14, r: 0.3, r2: 4.6 + o.warm * 2, dir: Math.PI / 2, alpha: 0.75, ang: 0.26 });
    if (o.sun) {
      const [sx, sy] = o.sun, R = o.sunR;
      if (o.rays) K.rays(ctx, sx, sy, R * 1.25, R * 1.85, 28, { color: P.mustardDark, w: 3, rot: K.now * 0.08, alpha: 0.55 });
      K.shape(ctx, K.ellipsePts(sx, sy, R, R, 40), { fill: P.sun, key: null, boil: 0.6, seed: 31, reg: 0 });
      K.shape(ctx, K.ellipsePts(sx, sy, R * 0.72, R * 0.72, 36), { fill: P.mustardLight, key: null, boil: 0.5, seed: 32, reg: 0 });
    }
  };
  /* mid-century cloud: three stacked pills */
  K.cloud = function (ctx, x, y, w, seed) {
    const h = w * 0.2;
    [[0, 0, 1], [w * 0.18, -h * 0.85, 0.62], [-w * 0.2, h * 0.75, 0.55]].forEach((c, i) => {
      const ww = w * c[2];
      K.shape(ctx, K.rrectPts(x + c[0] - ww / 2, y + c[1] - h / 2, ww, h, h / 2, 5), { fill: P.cream, key: P.ink, w: 2.5, boil: 0.6, seed: seed + i, reg: 2.5, shade: { color: P.creamShade, dx: 0, dy: -h * 0.3 } });
    });
  };
  /* rounded hills or angular mountains across [x0, x1] */
  K.hills = function (ctx, x0, x1, base, opt) {
    const o = Object.assign({ h: 160, color: P.hillMid, seed: 1, n: 6, kind: "round", tone: true, key: P.ink, w: 2.5 }, opt || {});
    const pts = [[x0, base + 400]];
    const N = o.n * 8;
    for (let i = 0; i <= N; i++) {
      const u = i / N, x = lerp(x0, x1, u), k = u * o.n;
      let y;
      if (o.kind === "tri") { const f = k - Math.floor(k), hh = o.h * (0.6 + 0.4 * hash(Math.floor(k), o.seed)); y = base - hh * (1 - Math.abs(f * 2 - 1)); }
      else y = base - o.h * (0.55 + 0.45 * K.fbm(k * 0.9, o.seed, 2)) * Math.pow(Math.sin(Math.PI * (k - Math.floor(k))), 0.6);
      pts.push([x, y]);
    }
    pts.push([x1, base + 400]);
    K.shape(ctx, pts, { fill: o.color, key: o.key, w: o.w, boil: 0.8, seed: o.seed, tone: o.tone ? { color: P.ink, gap: 12, r: 0, r2: 2.6, dir: Math.PI / 2, alpha: 0.18 } : null });
  };

  /* ---------- the clockwork ---------- */
  K.gear = function (ctx, x, y, r, teeth, rot, opt) {
    const o = Object.assign({ color: P.mustard, seed: 1, hole: 0.32, w: 2.5 }, opt || {});
    const pts = [], n = teeth * 4;
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * K.TAU, q = i % 4, rr = q === 1 || q === 2 ? r : r * 0.82;
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    K.shape(ctx, pts, { fill: o.color, w: o.w, boil: 0.5, seed: o.seed, shade: { color: P.mustardDark, dx: r * 0.08, dy: r * 0.1 } });
    K.shape(ctx, K.ellipsePts(x, y, r * o.hole, r * o.hole, 16), { fill: P.ink, key: null, boil: 0.3, seed: o.seed + 1, smooth: true, reg: 0 });
    for (let i = 0; i < 4; i++) { const a = rot + (i / 4) * K.TAU + 0.4; K.dot(ctx, x + Math.cos(a) * r * 0.58, y + Math.sin(a) * r * 0.58, r * 0.09, P.cream, P.ink, 1.8, o.seed + 3 + i); }
  };
  /* clock face; hour and minute in "clock hours" (minute hand = frac part) */
  K.clockFace = function (ctx, x, y, r, opt) {
    const o = Object.assign({ hour: 10, minute: 10, seed: 1, rim: P.mustard, face: P.cream }, opt || {});
    K.shape(ctx, K.ellipsePts(x, y, r * 1.12, r * 1.12, 40), { fill: o.rim, w: 3.5, boil: 0.6, seed: o.seed, smooth: true, shade: { color: P.mustardDark, dx: r * 0.06, dy: r * 0.08 } });
    K.shape(ctx, K.ellipsePts(x, y, r, r, 40), { fill: o.face, w: 3, boil: 0.5, seed: o.seed + 1, smooth: true, tone: { color: P.creamDeep, gap: 9, r: 0, r2: 3, dir: Math.PI * 0.3, alpha: 0.5 } });
    ctx.save(); ctx.strokeStyle = P.ink; ctx.lineCap = "butt";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * K.TAU, big = i % 3 === 0, r0 = r * (big ? 0.72 : 0.8);
      ctx.lineWidth = K.lw(ctx, big ? r * 0.09 : r * 0.04); ctx.beginPath();
      ctx.moveTo(x + Math.sin(a) * r0, y - Math.cos(a) * r0); ctx.lineTo(x + Math.sin(a) * r * 0.9, y - Math.cos(a) * r * 0.9); ctx.stroke();
    }
    ctx.restore();
    const ah = (o.hour / 12) * K.TAU, am = (o.minute / 60) * K.TAU;
    const hand = (a, L, w, c, s) => K.shape(ctx, [[x - Math.sin(a) * L * 0.15 - Math.cos(a) * w, y + Math.cos(a) * L * 0.15 - Math.sin(a) * w], [x + Math.sin(a) * L, y - Math.cos(a) * L], [x - Math.sin(a) * L * 0.15 + Math.cos(a) * w, y + Math.cos(a) * L * 0.15 + Math.sin(a) * w]], { fill: c, w: 2, boil: 0.3, seed: s, reg: 1 });
    hand(ah, r * 0.5, r * 0.07, P.ink, o.seed + 5);
    hand(am, r * 0.78, r * 0.05, P.tomato, o.seed + 6);
    K.dot(ctx, x, y, r * 0.07, P.mustard, P.ink, 2, o.seed + 7);
  };
  /* tower with a big clock and a gear window; y = ground */
  K.clockTower = function (ctx, x, y, s, opt) {
    const o = Object.assign({ hour: 10, minute: 10, gearRot: 0, seed: 40 }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const W = 260, H = 640;
    K.shape(ctx, K.rectPts(-W / 2, -H, W, H, 3), { fill: P.teal, w: 3.5, seed: o.seed, shade: { color: P.tealDark, dx: -46, dy: 0 }, tone: { color: P.ink, gap: 12, r: 0, r2: 2.4, dir: 0, alpha: 0.2 } });
    /* mustard trim bands */
    [-H + 40, -330].forEach((yy, i) => K.shape(ctx, K.rectPts(-W / 2 - 14, yy, W + 28, 26, 3), { fill: P.mustard, w: 3, seed: o.seed + 1 + i, shade: { color: P.mustardDark, dx: 0, dy: -9 } }));
    K.shape(ctx, K.rectPts(-W / 2 - 20, -24, W + 40, 24, 3), { fill: P.ink, w: 3, seed: o.seed + 4, reg: 0 });
    /* roof: tall triangle with a star finial */
    K.shape(ctx, [[-W / 2 - 30, -H + 40], [0, -H - 220], [W / 2 + 30, -H + 40]], { fill: P.tomato, w: 3.5, seed: o.seed + 5, shade: { color: P.tomatoDark, dx: -60, dy: 0 } });
    K.line(ctx, [[0, -H - 220], [0, -H - 270]], { w: 4, seed: o.seed + 6 });
    K.star(ctx, 0, -H - 290, 30, { rot: K.now * 0.6, seed: o.seed + 7 });
    /* clock */
    K.clockFace(ctx, 0, -H + 170, 104, { hour: o.hour, minute: o.minute, seed: o.seed + 10 });
    /* gear window (porthole into the clockwork) */
    const gy = -205;
    K.shape(ctx, K.ellipsePts(0, gy, 92, 92, 32), { fill: P.ink, w: 3.5, seed: o.seed + 20, reg: 0, smooth: true });
    ctx.save(); K.pathOf(ctx, K.ellipsePts(0, gy, 86, 86, 32), true, true); ctx.clip();
    K.gear(ctx, -24, gy - 18, 58, 10, o.gearRot, { seed: o.seed + 21 });
    K.gear(ctx, 50, gy + 46, 42, 8, -o.gearRot * 1.25 + 0.2, { seed: o.seed + 24, color: P.cream });
    K.gear(ctx, -46, gy + 66, 30, 6, -o.gearRot * 2 + 0.4, { seed: o.seed + 27, color: P.tealLight });
    ctx.restore();
    K.shape(ctx, K.ellipsePts(0, gy, 92, 92, 32), { fill: null, key: P.mustard, w: 8, seed: o.seed + 29, smooth: true });
    ctx.restore();
  };

  /* ---------- the station ---------- */
  K.platform = function (ctx, x0, x1, y, opt) {
    const o = Object.assign({ h: 70, seed: 60 }, opt || {});
    K.shape(ctx, K.rectPts(x0, y, x1 - x0, o.h, 6), { fill: P.creamShade, w: 3, seed: o.seed, tone: { color: P.ink, gap: 10, r: 0.5, r2: 2.8, dir: Math.PI / 2, alpha: 0.25 } });
    K.shape(ctx, K.rectPts(x0, y, x1 - x0, 14, 6), { fill: P.mustard, w: 2.5, seed: o.seed + 1 });
    /* safety stripes */
    ctx.save(); ctx.fillStyle = P.ink;
    for (let x = x0 + 10; x < x1 - 20; x += 36) { ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.lineTo(x + 16, y + 14); ctx.lineTo(x + 6, y); ctx.lineTo(x - 10, y); ctx.closePath(); ctx.globalAlpha = 0.85; ctx.fill(); }
    ctx.restore();
  };
  /* side-view track: sleepers + one rail; y = rail top */
  K.track = function (ctx, x0, x1, y, opt) {
    const o = Object.assign({ seed: 70, ballast: true }, opt || {});
    if (o.ballast) K.shape(ctx, [[x0, y + 26], [x1, y + 26], [x1, y + 60], [x0, y + 60]], { fill: P.creamDeep, w: 2.5, seed: o.seed, tone: { color: P.ink, gap: 8, r: 1.6, r2: 1.6, alpha: 0.35 } });
    ctx.save(); ctx.fillStyle = P.woodDark;
    for (let x = Math.ceil(x0 / 46) * 46; x < x1; x += 46) { const j = hs(x, o.seed + K.bf) * 0.6; ctx.fillRect(x - 12 + j, y + 8, 24, 20); }
    ctx.restore();
    K.shape(ctx, K.rectPts(x0, y, x1 - x0, 10, 12), { fill: P.steelLight, w: 2.5, seed: o.seed + 1, boil: 0.4 });
  };
  K.lampPost = function (ctx, x, y, h, seed) {
    K.shape(ctx, K.rectPts(x - 6, y - h, 12, h, 3), { fill: P.ink, w: 2, seed, reg: 0 });
    K.shape(ctx, [[x - 34, y - h], [x + 34, y - h], [x + 20, y - h - 30], [x - 20, y - h - 30]], { fill: P.teal, w: 2.5, seed: seed + 1 });
    K.dot(ctx, x, y - h + 12, 14, P.mustardLight, P.ink, 2.5, seed + 2);
  };

  /* ---------- rolling stock ---------- */
  K.wheel = function (ctx, x, y, r, rot, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, 20), { fill: P.steel, w: 3, seed, smooth: true, shade: { color: P.steelDark, dx: r * 0.15, dy: r * 0.2 } });
    ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = K.lw(ctx, Math.max(2, r * 0.1)); ctx.beginPath();
    for (let i = 0; i < 3; i++) { const a = rot + (i / 3) * Math.PI; ctx.moveTo(x - Math.cos(a) * r * 0.78, y - Math.sin(a) * r * 0.78); ctx.lineTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78); }
    ctx.stroke(); ctx.restore();
    K.dot(ctx, x, y, r * 0.24, P.mustard, P.ink, 2, seed + 1);
  };
  /* freight crate; (x, y) = bottom centre */
  K.crate = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ color: P.mustard, shade: P.mustardDark, label: "", labelSize: 0, seed: 80, slices: 0, sliceU: 0, a: 1, labelColor: P.ink }, opt || {});
    if (o.a <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(o.a, 0, 1);
    K.shape(ctx, K.rectPts(x - w / 2, y - h, w, h, 3), { fill: o.color, w: 3.5, seed: o.seed, shade: { color: o.shade, dx: -w * 0.08, dy: -h * 0.06 } });
    /* planks */
    ctx.save(); ctx.strokeStyle = P.ink; ctx.globalAlpha *= 0.55; ctx.lineWidth = K.lw(ctx, 2);
    const np = Math.max(2, Math.round(h / 34)); ctx.beginPath();
    for (let i = 1; i < np; i++) { const yy = y - h + (h * i) / np; ctx.moveTo(x - w / 2 + 6, yy); ctx.lineTo(x + w / 2 - 6, yy); }
    ctx.stroke(); ctx.restore();
    /* corner brackets */
    const b = Math.min(w, h) * 0.16;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy], i) => {
      const cx = x + sx * (w / 2), cy = y - h / 2 + sy * (h / 2);
      K.shape(ctx, [[cx, cy], [cx - sx * b, cy], [cx - sx * b, cy - sy * b * 0.35], [cx - sx * b * 0.35, cy - sy * b * 0.35], [cx - sx * b * 0.35, cy - sy * b], [cx, cy - sy * b]], { fill: P.ink, key: null, boil: 0.3, seed: o.seed + 10 + i, reg: 0 });
    });
    if (o.label) K.text(ctx, o.label, x, y - h / 2 + 2, { size: o.labelSize || Math.min(h * 0.36, w / (o.label.length * 0.62)), weight: 700, font: K.FONT.mono, fill: o.labelColor });
    /* slicing: dashed cut lines draw one after another (vertical cuts, then
       horizontal cuts when rows > 1), so a parent order splits into slices x rows pieces */
    const rows = o.rows || 1, cuts = [];
    for (let i = 1; i < o.slices; i++) cuts.push([x - w / 2 + (w * i) / o.slices, y - h - 14, 0, h + 28]);
    for (let j = 1; j < rows; j++) cuts.push([x - w / 2 - 14, y - h + (h * j) / rows, w + 28, 0]);
    if (cuts.length && o.sliceU > 0) cuts.forEach((q, i) => {
      const u = clamp(o.sliceU * cuts.length - i, 0, 1); if (u <= 0) return;
      K.line(ctx, [[q[0], q[1]], [q[0] + q[2] * u, q[1] + q[3] * u]], { key: P.ink, w: 4, boil: 0.4, seed: o.seed + 40 + i, dash: [16, 10], cap: "butt" });
    });
    ctx.restore();
  };
  /* flat wagon; (x, y) = rail top under the wagon centre. roll = distance travelled (wheel spin) */
  K.wagon = function (ctx, x, y, s, opt) {
    const o = Object.assign({ color: P.teal, shade: P.tealDark, roll: 0, seed: 90, load: null, bob: 0, coupler: true }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const r = 22, rot = o.roll / r;
    K.wheel(ctx, -50, -r, r, rot, o.seed);
    K.wheel(ctx, 50, -r, r, rot + 0.5, o.seed + 3);
    ctx.translate(0, o.bob);
    if (o.coupler) { K.line(ctx, [[-96, -40], [-80, -40]], { w: 6, seed: o.seed + 9 }); K.line(ctx, [[80, -40], [96, -40]], { w: 6, seed: o.seed + 10 }); }
    K.shape(ctx, K.rectPts(-82, -58, 164, 26, 4), { fill: o.color, w: 3, seed: o.seed + 6, shade: { color: o.shade, dx: 0, dy: -10 } });
    if (o.load) o.load(ctx); /* drawn in wagon space: deck top is y = -58 */
    ctx.restore();
  };
  /* steam locomotive facing right; (x, y) = rail top under the cab/boiler joint.
     cab(ctx) draws whoever rides in the cab window (wagon space, window centre (-92, -158)) */
  K.loco = function (ctx, x, y, s, opt) {
    const o = Object.assign({ roll: 0, seed: 120, cab: null, bob: 0 }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const rot = o.roll / 34;
    /* chassis */
    K.shape(ctx, K.rectPts(-150, -78, 330, 30, 4), { fill: P.ink, w: 3, seed: o.seed, reg: 0 });
    /* driving wheels + rod */
    const wx = [-110, -30, 50];
    wx.forEach((xx, i) => K.wheel(ctx, xx, -34, 34, rot + i * 0.3, o.seed + 2 + i * 3));
    K.wheel(ctx, 135, -22, 22, o.roll / 22, o.seed + 14);
    const rx = Math.cos(rot) * 16, ry = Math.sin(rot) * 16;
    K.shape(ctx, K.rrectPts(-118 + rx, -40 + ry, 176, 12, 6, 3), { fill: P.steelLight, w: 2.5, seed: o.seed + 16 });
    ctx.translate(0, o.bob);
    /* cowcatcher */
    K.shape(ctx, [[176, -78], [214, -10], [176, -10]], { fill: P.tomato, w: 3, seed: o.seed + 18 });
    /* boiler */
    K.shape(ctx, K.rrectPts(-40, -190, 220, 112, 40, 5), { fill: P.teal, w: 3.5, seed: o.seed + 20, shade: { color: P.tealDark, dx: 0, dy: -36 }, tone: { color: P.ink, gap: 11, r: 0, r2: 2.6, dir: Math.PI / 2, alpha: 0.22 } });
    [10, 80, 150].forEach((bx, i) => K.shape(ctx, K.rectPts(bx - 7, -192, 14, 116, 2), { fill: P.mustard, w: 2.5, seed: o.seed + 22 + i }));
    /* smoke box front */
    K.shape(ctx, K.rrectPts(168, -184, 30, 100, 12, 3), { fill: P.ink, w: 3, seed: o.seed + 26, reg: 0 });
    K.dot(ctx, 200, -160, 16, P.mustardLight, P.ink, 3, o.seed + 27);
    /* chimney + dome */
    K.shape(ctx, [[118, -188], [148, -188], [158, -262], [108, -262]], { fill: P.ink, w: 3, seed: o.seed + 28, reg: 0 });
    K.shape(ctx, K.rectPts(102, -274, 62, 16, 2), { fill: P.mustard, w: 3, seed: o.seed + 29 });
    K.shape(ctx, K.arcPts(50, -188, 30, Math.PI, K.TAU, 8), { fill: P.mustard, w: 3, seed: o.seed + 30 });
    /* cab */
    K.shape(ctx, K.rectPts(-160, -250, 130, 172, 3), { fill: P.mustard, w: 3.5, seed: o.seed + 32, shade: { color: P.mustardDark, dx: 34, dy: 0 } });
    K.shape(ctx, [[-176, -246], [-14, -246], [-24, -276], [-166, -276]], { fill: P.tomato, w: 3.5, seed: o.seed + 33, shade: { color: P.tomatoDark, dx: 0, dy: -10 } });
    K.shape(ctx, K.rrectPts(-138, -226, 86, 82, 16, 3), { fill: P.cream, w: 3, seed: o.seed + 34, tone: { color: P.creamDeep, gap: 8, r: 0, r2: 2.4, dir: Math.PI * 0.3, alpha: 0.7 } });
    if (o.cab) { ctx.save(); K.pathOf(ctx, K.rrectPts(-138, -226, 86, 160, 16, 3), true); ctx.clip(); o.cab(ctx); ctx.restore(); }
    ctx.restore();
  };
  /* smoke / steam puff: u 0..1 life (grows, rises is the caller's job, fades at the end) */
  K.puff = function (ctx, x, y, r, u, seed, color) {
    if (u <= 0 || u >= 1) return;
    const g = 0.35 + 0.65 * K.E.out3(clamp(u * 1.6, 0, 1)), a = 1 - K.ss(0.6, 1, u);
    ctx.save(); ctx.globalAlpha *= a;
    [[0, 0, 1], [-0.62, 0.22, 0.66], [0.6, 0.18, 0.7], [0.1, -0.5, 0.62]].forEach((c, i) => {
      const rr = r * g * c[2];
      K.shape(ctx, K.ellipsePts(x + c[0] * r * g, y + c[1] * r * g, rr, rr, 18), { fill: color || P.cream, key: P.ink, w: 2.5, smooth: true, boil: 1, seed: seed * 7 + i, shade: { color: P.creamShade, dx: rr * 0.2, dy: rr * 0.25 } });
    });
    ctx.restore();
  };

  /* ---------- the price pond (market impact) ---------- */
  K.pond = function (ctx, x, y, w, h, seed) {
    K.shape(ctx, K.ellipsePts(x, y, w / 2, h / 2, 36), { fill: P.water, w: 3, seed, smooth: true, shade: { color: P.waterDeep, dx: 0, dy: h * 0.18 }, tone: { color: P.cream, gap: 12, r: 2.4, r2: 0, dir: Math.PI / 2, alpha: 0.4 } });
  };
  /* one ripple ring; u 0..1 */
  K.ripple = function (ctx, x, y, size, u, seed) {
    if (u <= 0 || u >= 1) return;
    const r = size * K.E.out3(u);
    K.shape(ctx, K.ellipsePts(x, y, r, r * 0.32, 24), { fill: null, key: P.cream, w: 4 * (1 - u) + 1.5, smooth: true, boil: 0.5, seed, alpha: 1 - u });
  };
  /* crown splash: a column and drops; size = height in px; u 0..1 */
  K.splash = function (ctx, x, y, size, u, seed, color) {
    if (u <= 0 || u >= 1) return;
    const c = color || P.water, up = Math.sin(Math.PI * clamp(u * 1.3, 0, 1));
    ctx.save(); ctx.globalAlpha *= 1 - K.ss(0.75, 1, u);
    const hw = size * 0.22, hh = size * up;
    if (hh > 2) K.shape(ctx, [[x - hw, y], [x - hw * 0.5, y - hh * 0.7], [x - hw * 0.2, y - hh], [x + hw * 0.25, y - hh * 0.85], [x + hw * 0.55, y - hh * 0.6], [x + hw, y]], { fill: c, w: 3, smooth: true, seed, shade: { color: P.cream, dx: hw * 0.3, dy: 0 } });
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i / 8 - 0.5) * 2.4, sp = size * (0.6 + 0.6 * hash(i, seed));
      const px = x + Math.cos(a) * sp * u * 1.1, py = y + Math.sin(a) * sp * u * 1.3 + size * 1.6 * u * u;
      K.dot(ctx, px, py, size * 0.06 * (1 - u * 0.5), c, P.ink, 2, seed + 10 + i);
    }
    ctx.restore();
  };

  /* ---------- money, quote windows, dials ---------- */
  K.coin = function (ctx, x, y, r, opt) {
    const o = Object.assign({ color: P.mustard, label: "", seed: 1, labelColor: P.ink, size: 0 }, opt || {});
    K.shape(ctx, K.ellipsePts(x, y, r, r, 24), { fill: o.color, w: Math.max(2, r * 0.07), smooth: true, boil: 0.4, seed: o.seed, shade: { color: P.mustardDark, dx: r * 0.12, dy: r * 0.14 } });
    K.shape(ctx, K.ellipsePts(x - r * 0.04, y - r * 0.04, r * 0.7, r * 0.7, 20), { fill: null, key: P.ink, w: Math.max(1.6, r * 0.05), smooth: true, boil: 0.3, seed: o.seed + 1 });
    if (o.label) K.text(ctx, o.label, x - r * 0.04, y - r * 0.02, { size: o.size || r * 0.7, weight: 800, fill: o.labelColor, font: K.FONT.mono });
  };
  /* kiosk with a striped awning and an open window; (x, y) = ground centre */
  K.booth = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ color: P.teal, shade: P.tealDark, seed: 140, lit: 0 }, opt || {});
    K.shape(ctx, K.rectPts(x - w / 2, y - h, w, h, 3), { fill: o.color, w: 3.5, seed: o.seed, shade: { color: o.shade, dx: -w * 0.12, dy: 0 } });
    /* window */
    const wy = y - h * 0.78, wh = h * 0.42;
    K.shape(ctx, K.rectPts(x - w * 0.36, wy, w * 0.72, wh, 3), { fill: o.lit > 0 ? P.mustardLight : P.ink, w: 3, seed: o.seed + 1, reg: 0 });
    K.shape(ctx, K.rectPts(x - w * 0.44, wy + wh, w * 0.88, 16, 3), { fill: P.cream, w: 3, seed: o.seed + 2 });
    /* awning: alternating stripes with a scalloped edge */
    const ay = y - h - 10, n = 6, sw = (w + 40) / n;
    for (let i = 0; i < n; i++) {
      const x0 = x - w / 2 - 20 + i * sw;
      const pts = [[x0 + 8, ay - 40], [x0 + sw + 8, ay - 40], [x0 + sw, ay + 20]].concat(K.arcPts(x0 + sw / 2, ay + 20, sw / 2, 0, Math.PI, 5));
      K.shape(ctx, pts, { fill: i % 2 ? P.cream : o.color, w: 2.5, seed: o.seed + 5 + i, boil: 0.5 });
    }
  };
  /* dial gauge: v 0..1; green-ish (teal) low zone, tomato high zone */
  K.gauge = function (ctx, x, y, r, v, opt) {
    const o = Object.assign({ seed: 160, lo: 0.35, hi: 0.7, label: "" }, opt || {});
    K.shape(ctx, K.ellipsePts(x, y, r * 1.12, r * 1.12, 32), { fill: P.ink, w: 3, seed: o.seed, smooth: true, reg: 0 });
    K.shape(ctx, K.ellipsePts(x, y, r, r, 32), { fill: P.cream, w: 2.5, seed: o.seed + 1, smooth: true });
    const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, A = (u) => lerp(a0, a1, u);
    const band = (u0, u1, c, s) => K.shape(ctx, K.arcPts(x, y, r * 0.86, A(u0), A(u1), 10).concat(K.arcPts(x, y, r * 0.62, A(u1), A(u0), 10)), { fill: c, w: 2, seed: s, boil: 0.3 });
    band(0, o.lo, P.teal, o.seed + 2); band(o.lo, o.hi, P.mustard, o.seed + 3); band(o.hi, 1, P.tomato, o.seed + 4);
    const a = A(clamp(v, 0, 1));
    K.shape(ctx, [[x + Math.cos(a + Math.PI / 2) * r * 0.06, y + Math.sin(a + Math.PI / 2) * r * 0.06], [x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9], [x - Math.cos(a + Math.PI / 2) * r * 0.06, y - Math.sin(a + Math.PI / 2) * r * 0.06]], { fill: P.ink, w: 2, seed: o.seed + 6, boil: 0.3, reg: 0 });
    K.dot(ctx, x, y, r * 0.1, P.mustard, P.ink, 2, o.seed + 7);
    if (o.label) K.text(ctx, o.label, x, y + r * 0.5, { size: r * 0.22, font: K.FONT.mono, weight: 700 });
  };
})(SK);
