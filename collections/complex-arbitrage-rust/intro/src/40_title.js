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
