/* ============================================================
   INTRO 20 LAB: the long greenhouse lab and its three stations.
     A (x ~1000): the plate. Seed -> sprout -> overfit vine -> snip -> smooth fit + band
     B (x ~2420): five walk-forward flasks on the bench, fold strips, ticks
     C (x ~3400): decision-tree plant + neural-net vine; title set
   Camera: one monotone track, moves start and land on downbeats.
   ============================================================ */
const camTrack = K.mkTrack([
  [0, { x: 1060, y: 500, z: 1.12 }],
  [at(1, 0), { x: 1000, y: 520, z: 1.0 }],
  [T.truck1[0], { x: 1000, y: 520, z: 1.0 }],
  [T.truck1[1], { x: ST_B.cam.x, y: 520, z: 1.0 }],
  [T.jump[0] - 0.05, { x: ST_B.cam.x + 30, y: 520, z: 1.0 }],
  [T.jump[1], { x: ST_C.cam.x, y: 540, z: 1.0 }],
  [T.zoomOut[0], { x: ST_C.cam.x, y: 540, z: 1.0 }],
  [T.zoomOut[1], { x: ST_C.cam.x, y: 520, z: 0.9 }],
  [DUR, { x: ST_C.cam.x, y: 528, z: 0.93 }],
]);
const cam = (t) => Object.assign({ rot: 0 }, camTrack(t));

/* ---------- overfit curve: passes through every point and wiggles between them ---------- */
function interpPts(u) {
  const f = u * (NPTS - 1), i = Math.min(NPTS - 2, Math.floor(f)), r = f - i;
  const p0 = PTS[Math.max(0, i - 1)], p1 = PTS[i], p2 = PTS[i + 1], p3 = PTS[Math.min(NPTS - 1, i + 2)];
  return 0.5 * (2 * p1 + (-p0 + p2) * r + (2 * p0 - 5 * p1 + 4 * p2 - p3) * r * r + (-p0 + 3 * p1 - 3 * p2 + p3) * r * r * r);
}
const OVER = (u) => interpPts(u) + 0.07 * Math.sin(u * (NPTS - 1) * K.TAU);
const NS = 110;
const PLATE_M = K.plateMap(ST_A.plate.x, ST_A.plate.y, ST_A.plate.w, ST_A.plate.h, 0, 1, "");
const POT_TOP = [ST_A.pot, BENCH_Y - 122];
const STEM = [[POT_TOP[0], POT_TOP[1] + 6], [POT_TOP[0] - 4, POT_TOP[1] - 50], [PLATE_M.X(0) - 6, PLATE_M.Y(OVER(0)) + 40]];
const OVER_PTS = Array.from({ length: NS + 1 }, (_, i) => [PLATE_M.X(i / NS), PLATE_M.Y(OVER(i / NS))]);
const FIT_PTS = Array.from({ length: 41 }, (_, i) => [PLATE_M.X(i / 40), PLATE_M.Y(TRUE_F(i / 40))]);
const SNIP_U = 0.86;
const SNIP_PT = [PLATE_M.X(SNIP_U), PLATE_M.Y(OVER(SNIP_U))];

function vinePath(pts, p, seed, color, leafEvery) {
  const all = STEM.concat(pts), n = Math.max(2, Math.floor(all.length * p));
  const vis = all.slice(0, n);
  K.line(ctx, vis, { stroke: P.ink, w: 15, boil: 0.8, seed, taper: false });
  K.line(ctx, vis, { stroke: color, w: 8, boil: 0.8, seed: seed + 1, taper: false });
  for (let i = 4; i < n - 2; i += leafEvery) {
    const a = all[i], b = all[i + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + ((i / leafEvery) % 2 ? -1.1 : 1.1);
    const g = K.clamp((n - i) / 6, 0, 1);
    K.leaf(ctx, a[0], a[1], ang, 0.55 * K.E.back(g, 2), seed + i, color === P.bad ? "#7f9a3c" : P.leaf);
  }
}

function drawStationA(t) {
  const pl = ST_A.plate;
  /* easel legs behind the plate */
  K.line(ctx, [[pl.x - 240, pl.y + 150], [pl.x - 300, BENCH_Y]], { stroke: P.woodDark, w: 14, boil: 0.7, seed: 1201, taper: false });
  K.line(ctx, [[pl.x + 240, pl.y + 150], [pl.x + 300, BENCH_Y]], { stroke: P.woodDark, w: 14, boil: 0.7, seed: 1202, taper: false });
  const ptsShown = K.clamp((t - T.sprout) / (BEAT * 2), 0, 1); /* data points pop on sixteenths */
  const bandA = K.E.out3(K.inv(T.band, T.band + 0.5, t));
  K.plate(ctx, pl.x, pl.y, pl.w, pl.h, [{ data: PTS, kind: "scatter", color: P.data }], {
    a: K.inv(T.pour[0], T.pour[0] + 0.4, t), draw: ptsShown, seed: 330, yMin: 0, yMax: 1,
    band: bandA > 0 ? { lo: BAND.lo, hi: BAND.hi, a: bandA } : null,
  });
  /* the vine: overfit, then snipped, then the smooth fit */
  const vp = K.inv(T.vine[0], T.vine[1], t);
  if (t < T.snip && vp > 0) vinePath(OVER_PTS, K.E.inOut(vp), 1300, P.leafLight, 7);
  else if (t >= T.snip) {
    /* falling cuttings */
    const d = t - T.snip;
    if (d < 1.4) for (let c = 0; c < 6; c++) {
      const i0 = Math.floor((c / 6) * NS), i1 = Math.floor(((c + 1) / 6) * NS) + 1;
      const seg = OVER_PTS.slice(i0, i1), cx = seg[Math.floor(seg.length / 2)][0], cy = seg[Math.floor(seg.length / 2)][1];
      const dy = 900 * d * d + 60 * d * K.hash(c, 4), rot = (K.hash(c, 5) - 0.5) * 2.2 * d, dx = (K.hash(c, 6) - 0.5) * 120 * d;
      ctx.save(); ctx.globalAlpha = K.clamp(1 - d / 1.4, 0, 1); ctx.translate(cx + dx, cy + dy); ctx.rotate(rot); ctx.translate(-cx, -cy);
      K.line(ctx, seg, { stroke: P.ink, w: 15, boil: 0.8, seed: 1400 + c, taper: false });
      K.line(ctx, seg, { stroke: "#a3b45a", w: 8, boil: 0.8, seed: 1410 + c, taper: false });
      ctx.restore();
    }
    vinePath(FIT_PTS, K.E.out3(K.inv(T.snip + 0.05, T.snip + 0.6, t)), 1500, P.leaf, 6);
    /* snip flash */
    const f = K.inv(T.snip, T.snip + 0.45, t);
    if (f < 1) for (let i = 0; i < 6; i++) { const a = (i / 6) * K.TAU + 0.3, r = 30 + 110 * f; K.sparkle(ctx, SNIP_PT[0] + Math.cos(a) * r, SNIP_PT[1] + Math.sin(a) * r, 22 * (1 - f), 1 - f, 1600 + i); }
    if (f < 1) K.cross(ctx, SNIP_PT[0] + 40, SNIP_PT[1] - 70, 30, K.inv(T.snip, T.snip + 0.25, t) * (1 - f * f), 1620);
  }
  /* sprout leaves on the pot */
  const sp = K.inv(T.sprout, T.sprout + 0.35, t);
  if (sp > 0) { const s = K.E.back(sp, 2.6); K.leaf(ctx, POT_TOP[0], POT_TOP[1] + 2, -2.4, 0.9 * s, 1700); K.leaf(ctx, POT_TOP[0], POT_TOP[1] + 2, -0.75, 0.9 * s, 1701); }
  /* pot squashes when the seed lands */
  const ls = t > T.land ? Math.exp(-(t - T.land) * 9) * Math.sin((t - T.land) * 30) * 0.35 : 0;
  K.pot(ctx, ST_A.pot, BENCH_Y, 1, { seed: 1720, squash: ls });
  /* soil puff */
  for (let i = 0; i < 3; i++) K.puff(ctx, POT_TOP[0] + (i - 1) * 40, POT_TOP[1] - 6, 18, K.inv(T.land, T.land + 0.6, t) * (0.7 + 0.15 * i), 1730 + i);
  /* beakers on the bench (props) */
  K.beaker(ctx, 360, BENCH_Y, 0.9, P.test, 1740);
  K.beaker(ctx, 450, BENCH_Y, 0.7, P.glass, 1745);
}

/* walk-forward folds: train grows, test is the next slice */
const FOLD_N = 5;
function drawStationB(t) {
  K.lamp(ctx, 2470, 40, { seed: 2000, len: 260, sway: Math.sin(t * 1.3) * 8 });
  ST_B.flasks.forEach((fx, i) => {
    const a = K.inv(T.flasks + (i * BEAT) / 4, T.flasks + (i * BEAT) / 4 + 0.35, t);
    if (a <= 0) return;
    const s = 1.05 * K.E.back(a, 2.4), tick = T.ticks + (i * BEAT) / 2, tk = K.inv(tick, tick + 0.3, t);
    K.flask(ctx, fx, BENCH_Y, s, { seed: 2100 + i * 20, layers: [{ h: 0.24 + 0.1 * i, color: P.train }, { h: 0.16, color: P.test }], bubbles: 3, glowA: tk > 0 ? 0.6 * (1 - K.inv(tick + 0.3, tick + 1.2, t)) + 0.15 : 0 });
    /* fold strip on the bench edge: [train | test] along time */
    const sx = fx - 80, sy = BENCH_Y + 2, u = 160 / 7;
    ctx.save(); ctx.translate(fx, sy + 14); ctx.scale(K.E.back(a, 2.4), K.E.back(a, 2.4)); ctx.translate(-fx, -(sy + 14));
    K.shape(ctx, K.rectPts(sx - 6, sy, 172, 28, 4), { fill: P.paper, w: 3, boil: 0.5, seed: 2200 + i });
    K.shape(ctx, K.rectPts(sx, sy + 6, u * (2 + i), 16, 2), { fill: P.train, stroke: null, w: 0, boil: 0.4, seed: 2210 + i });
    K.shape(ctx, K.rectPts(sx + u * (2 + i), sy + 6, u, 16, 2), { fill: P.test, stroke: null, w: 0, boil: 0.4, seed: 2220 + i });
    ctx.restore();
    K.check(ctx, fx + 4, BENCH_Y - 330 - 6 * K.pulse(t, 1), 38, tk, 2300 + i * 3);
  });
}

function drawStationC(t) {
  const gT = K.inv(T.grow - 0.05, T.grow + BEAT * 3.2, t) * 3, gN = K.inv(T.grow + BEAT * 0.5, T.grow + BEAT * 3.6, t) * 4;
  const potA = K.inv(T.grow - 0.3, T.grow, t);
  if (potA > 0) {
    const s = K.E.back(potA, 2.2);
    K.treePlant(ctx, ST_C.tree, BENCH_Y - 118 * s, 0.8, { grow: gT, depth: 3, seed: 2500, spread: 270, ratio: 2.1, levelH: 86, leaves: ["0.2", "0.7", "0.4", "0.9", "0.1", "0.6", "0.3", "0.8"], hot: t > T.seedUp ? 3 : -1 });
    K.pot(ctx, ST_C.tree, BENCH_Y, 1.0 * s, { seed: 2560 });
    const pulse = t > T.show ? ((t - T.show) / (BEAT * 4)) % 1 : -1;
    K.netVine(ctx, ST_C.net, BENCH_Y - 400, 0.95, { layers: [3, 4, 4, 2], grow: gN, seed: 2600, w: 420, h: 300, pulse });
    K.pot(ctx, ST_C.net, BENCH_Y, 1.0 * s, { seed: 2660, color: P.glassDark, shadow: P.glassDeep });
  }
}

/* foreground ferns (parallax 1.25) for depth */
function drawForeground() {
  K.applyCam(ctx, 1.25);
  [[700, 1180, -0.4], [2050, 1200, 0.3]].forEach((f, i) => {
    for (let k = 0; k < 5; k++) K.leaf(ctx, f[0] + k * 14, f[1], -1.57 + f[2] + (k - 2) * 0.45 + Math.sin(K.now * 1.2 + i + k) * 0.04, 3.4 - Math.abs(k - 2) * 0.5, 2800 + i * 10 + k, P.leafDark);
  });
}

function drawLab(t) {
  K.applyCam(ctx, 0.9);
  K.labWall(ctx, -400, 5800, { top: -700, bottom: 1500, dado: 560, windows: WINDOWS, seed: 3 });
  K.pipe(ctx, [[-400, -90], [1300, -90], [1300, 20], [2200, 20], [2200, -90], [5800, -90]], { seed: 40, w: 20 });
  K.applyCam(ctx, 1);
  K.bench(ctx, -300, 5600, BENCH_Y, { seed: 60 });
  drawStationA(t);
  drawStationB(t);
  drawStationC(t);
}
