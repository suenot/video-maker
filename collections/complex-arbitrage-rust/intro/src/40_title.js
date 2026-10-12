/* ============================================================
   INTRO 40 TITLE: banner + DOM title letters + six episode medallions.
   The title text lives in the DOM (crisp type, variable per language);
   the banner it sits on is canvas ink and follows the same wave.
   ============================================================ */
const BANNER = { cx: 960, cy: 215, w: 1520, h: 250 };
const MEDAL_Y = 440, MEDAL_R = 48;

/* six episode icons, language-free: graph, basis, matrix, copula, ML, execution */
const ICONS = [
  (c, r) => { const p = [[0, -r * 0.5], [r * 0.5, r * 0.35], [-r * 0.5, r * 0.35]]; K.line(c, p.concat([p[0]]), { stroke: P.ink, w: 3.5, boil: 0.6, seed: 1, gap: 0 }); p.forEach((q, i) => K.dot(c, q[0], q[1], r * 0.14, P.paper, P.ink, 2, 2 + i)); },
  (c, r) => { K.shape(c, K.rectPts(-r * 0.45, -r * 0.1, r * 0.35, r * 0.5, 1), { fill: P.paper, w: 3, boil: 0.5, seed: 3 }); K.shape(c, K.rectPts(r * 0.1, -r * 0.45, r * 0.35, r * 0.85, 1), { fill: P.paper, w: 3, boil: 0.5, seed: 4 }); },
  (c, r) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) K.dot(c, (i - 1) * r * 0.32, (j - 1) * r * 0.32, r * 0.1, (i + j) % 2 ? P.paper : P.ink, P.ink, 2, 10 + i * 3 + j); },
  (c, r) => { K.line(c, [[-r * 0.5, r * 0.4], [-r * 0.15, r * 0.25], [0, 0], [r * 0.15, -r * 0.25], [r * 0.5, -r * 0.4]], { stroke: P.ink, w: 3.5, boil: 0.6, seed: 20, gap: 0 }); K.line(c, [[-r * 0.5, -r * 0.4], [-r * 0.1, -r * 0.1], [r * 0.1, r * 0.1], [r * 0.5, r * 0.4]], { stroke: P.paper, w: 3.5, boil: 0.6, seed: 21, gap: 0 }); },
  (c, r) => { const L = [[-r * 0.45, -r * 0.3], [-r * 0.45, r * 0.3]], M = [[0, -r * 0.42], [0, 0], [0, r * 0.42]], R = [[r * 0.45, 0]]; L.forEach((a) => M.forEach((b) => K.line(c, [a, b], { stroke: P.ink, w: 2, boil: 0.4, seed: 30, gap: 0 }))); M.forEach((a) => R.forEach((b) => K.line(c, [a, b], { stroke: P.ink, w: 2, boil: 0.4, seed: 31, gap: 0 }))); L.concat(M, R).forEach((q, i) => K.dot(c, q[0], q[1], r * 0.11, P.paper, P.ink, 2, 40 + i)); },
  (c, r) => K.cog(c, 0, 0, r * 0.52, P.paper, 50),
];
const MEDAL_COLORS = [P.BTC, P.USDT, P.ETH, P.SOL, P.EUR, P.rust];

function drawTitleCanvas(t) {
  const u = K.inv(T.banner[0], T.banner[1], t);
  K.screen(ctx);
  const box = K.banner(ctx, BANNER.cx, BANNER.cy, BANNER.w, BANNER.h, u, { seed: 71 });
  /* medallions pop on eighth notes after the snap */
  for (let i = 0; i < 6; i++) {
    const t0 = T.medals + i * K.beatLen() / 2, a = K.inv(t0, t0 + 0.35, t);
    if (a <= 0) continue;
    const s = K.E.back(a, 2.6), x = 960 + (i - 2.5) * 132, y = MEDAL_Y + 6 * Math.sin(t * 2.4 + i) - 10 * K.pulse(t - i * 0.08, 1, 6);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.coin(ctx, 0, 0, MEDAL_R, { color: MEDAL_COLORS[i], seed: 600 + i * 7 });
    ICONS[i](ctx, MEDAL_R);
    ctx.restore();
  }
  /* snap sparkles near the raised claw */
  [T.snap[0], T.snap[1]].forEach((ts, k) => {
    const d = t - ts; if (d < 0 || d > 0.5) return;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * K.TAU + k, r = 40 + 160 * d;
      K.sparkle(ctx, SNAP_PT[0] + Math.cos(a) * r, SNAP_PT[1] + Math.sin(a) * r, 26 * (1 - d / 0.5), 1 - d / 0.5, i + k * 5);
    }
  });
  return box;
}
/* screen point near the snapping claw (set by the title scene layout) */
const SNAP_PT = [1000, 600];

function layoutTitleDom(t) {
  const u = K.inv(T.banner[0], T.banner[1], t);
  titleEl.style.opacity = u > 0 ? "1" : "0";
  if (u <= 0) return;
  const n = TITLE_LN.length, sizes = TITLE_LN.map((d) => +d.dataset.size), gap = 10;
  const total = sizes.reduce((a, b) => a + b, 0) + gap * (n - 1);
  let y = BANNER.cy - total / 2 - 8 + Math.sin(BANNER.cx * 0.006 + t * 1.4) * 8;
  TITLE_LN.forEach((d, i) => { d.style.top = y.toFixed(1) + "px"; y += sizes[i] + gap; });
  TITLE_CH.forEach((c) => {
    const t0 = T.letters + c.idx * 0.035, a = K.inv(t0, t0 + 0.42, t);
    const yy = (1 - K.E.back(a, 2.4)) * -140, land = K.inv(t0 + 0.3, t0 + 0.55, t);
    const sq = Math.sin(land * Math.PI) * 0.16 * (1 - land);
    const beatHop = c.line === n - 1 ? -6 * K.pulse(t, 4, 6) * K.inv(T.letters + 1, T.letters + 1.2, t) : 0; /* whole line hops on the accent */
    c.el.style.opacity = a > 0 ? Math.min(1, a * 3).toFixed(2) : "0";
    c.el.style.transform = `translateY(${(yy + beatHop).toFixed(1)}px) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
  });
}

/* ---------- "Haul in the spread": a net of coins comes up, one pull per beat ---------- */
const TITLE_SHIP = { x: 960, y: 1000, s: 1.45, crabS: 1.22 };
function netState(t) {
  const steps = (T.haul[1] - T.haul[0]) / K.beatLen(); /* 8 pulls */
  const k = K.clamp((t - T.haul[0]) / K.beatLen(), 0, steps), whole = Math.floor(k), fr = k - whole;
  const rise = (whole + K.E.back(Math.min(1, fr * 2.2), 1.6)) / steps; /* jerk up on each beat */
  const dump = K.inv(T.dump, T.dump + 0.5, t);
  return { x: K.lerp(1330, 1170, dump), y: K.lerp(1180, 800, K.clamp(rise, 0, 1)) - 60 * dump, open: dump, gone: K.inv(T.dump + 0.5, T.dump + 0.9, t) };
}
function drawNet(t, bob) {
  if (t < T.haul[0] - 0.3 || t > T.dump + 1.0) return;
  const n = netState(t), hand = [TITLE_SHIP.x - 95 * TITLE_SHIP.s + 110 * TITLE_SHIP.crabS * TITLE_SHIP.s, TITLE_SHIP.y + bob - 60 * TITLE_SHIP.s - 75 * TITLE_SHIP.crabS * TITLE_SHIP.s];
  const top = [n.x, n.y - 100 + bob * 0.5];
  if (n.gone < 1) {
    K.line(ctx, [hand, [K.lerp(hand[0], top[0], 0.5), Math.max(hand[1], top[1]) + 20], top], { stroke: P.ink, w: 9, boil: 1, seed: 1400, gap: 0 });
    K.line(ctx, [hand, [K.lerp(hand[0], top[0], 0.5), Math.max(hand[1], top[1]) + 20], top], { stroke: P.sailShade, w: 5, boil: 1, seed: 1400, gap: 0 });
  }
  ctx.save(); ctx.globalAlpha *= 1 - n.gone; ctx.translate(n.x, n.y + bob * 0.5); ctx.rotate(-0.5 * n.open); ctx.scale(1.4, 1.4);
  const bag = K.blobPts(0, 0, 80, 70, 14, 1401, 0.12);
  ctx.save(); K.pathOf(ctx, bag, true); ctx.clip();
  for (let i = 0; i < 16; i++) if (K.hash(i, 1402) > n.open * 0.9) K.goldBit(ctx, K.hs(i, 1403) * 60, 20 - (i % 5) * 16 + K.hs(i, 1404) * 6, 15, 1405 + i, K.hs(i, 1406) * 0.4);
  ctx.restore();
  for (let i = -3; i <= 3; i++) { K.line(ctx, [[i * 22, -72], [i * 26, 72]], { stroke: P.inkSoft, w: 2.5, boil: 0.8, seed: 1410 + i, gap: 0.1 }); K.line(ctx, [[-82, i * 20], [82, i * 20]], { stroke: P.inkSoft, w: 2.5, boil: 0.8, seed: 1420 + i, gap: 0.1 }); }
  K.shape(ctx, bag, { fill: null, w: 5, boil: 1.2, seed: 1430 });
  ctx.restore();
  /* coins pour onto the pile when the net opens */
  const d = t - T.dump; if (d > 0 && d < 0.9) for (let i = 0; i < 10; i++) {
    const u = K.clamp(d * 1.6 - i * 0.05, 0, 1); if (u <= 0 || u >= 1) continue;
    K.goldBit(ctx, K.lerp(n.x - 40, TITLE_SHIP.x + 95 * TITLE_SHIP.s + K.hs(i, 1440) * 60, u), K.lerp(n.y + 30, TITLE_SHIP.y + bob - 80 * TITLE_SHIP.s, u * u), 14, 1450 + i, u * 6 + i);
  }
}
