/* ============================================================
   INTRO 30 CHART: "Every regime has its form". We dive through the board's
   gauge into a surf-report poster: the day-by-day wave heights (returns)
   paint left to right over calm / storm / calm bands, the sigma envelope
   swells with them (big waves follow big waves), and on "its form" the two
   regime distributions rise: a narrow calm hump and a wide, fat storm one.
   Language-free: regimes are shown by colour and the sun / storm medals.
   ============================================================ */
const CHART = { x: 730, y: 560, w: 1240, h: 700 };
const DIST = { x: 1600, y: 560, w: 500, h: 700 };

function drawPosterBack(t) {
  K.screen(ctx);
  ctx.fillStyle = P.cream; ctx.fillRect(0, 0, K.W, K.H);
  K.halftone(ctx, K.ellipsePts(1820, 120, 420, 420, 24), { color: P.sky2, cell: 16, density: 0.5, alpha: 0.35 });
  K.halftone(ctx, K.ellipsePts(80, 1000, 360, 300, 24), { color: P.calm, cell: 16, density: 0.45, alpha: 0.3 });
  K.bands(ctx, -10, -10, K.W + 20, 120, [P.sky0, P.sky1, P.sky2, P.sky3], { wave: 4, seed: 9 });
  K.line(ctx, [[-10, 110], [K.W + 10, 110]], { stroke: P.ink, w: 5, boil: 0.6, seed: 801 });
  /* poster foot: a strip of little waves */
  K.waveRow(ctx, 1040, 16, { len: 120, speed: 30, fill: P.sea, shade: P.seaMid, seed: 805, bottom: 120 });
}

function drawChart(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1, rot: 0 });
  drawPosterBack(t);
  const z = K.tw(t, T.chart - 0.3, T.roll[0], 1.0, 1.035, K.E.inOut);
  ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540);
  const draw = K.inv(T.dial[0], T.chart + 0.9, t); /* starts painting inside the dial iris */
  const series = [
    { kind: "zig", data: RET, colorAt: (i, v) => (v >= 0 ? P.up : P.down) },
    { kind: "line", data: SIG.map((s) => 2 * s), color: P.sigma, w: 7 },
    { kind: "line", data: SIG.map((s) => -2 * s), color: P.sigma, w: 7 },
  ];
  const ch = K.posterChart(ctx, CHART.x, CHART.y, CHART.w, CHART.h, series, { a: K.inv(T.dial[0], T.chart + 0.1, t), draw, bands: BANDS, yMin: -7.2, yMax: 7.2, zero: true, seed: 41 });
  /* regime medals stuck on the card's top edge, each pops when its band starts painting */
  if (ch) BANDS.forEach((b, i) => {
    const tb = T.dial[0] + (T.chart + 0.9 - T.dial[0]) * (b.from / RET.length) + 0.05;
    const mx = (ch.X(b.from) + ch.X(b.to)) / 2;
    K.medal(ctx, mx, CHART.y - CHART.h / 2 + 4, 46, { a: K.inv(tb, tb + 0.3, t), color: b.regime === "storm" ? P.storm : P.calm, icon: b.regime === "storm" ? K.ICON.storm : K.ICON.sun, seed: 640 + i * 5 });
  });
  /* "has its form": distribution card with the two humps */
  const dc = K.posterChart(ctx, DIST.x, DIST.y, DIST.w, DIST.h, [], { a: K.inv(T.forms - 0.15, T.forms + 0.2, t), seed: 47 });
  if (dc) {
    const base = dc.pb - 4, mid = (dc.pl + dc.pr) / 2;
    K.hump(ctx, mid, base, 215, 230, { a: K.inv(T.forms + BEAT, T.forms + BEAT + 0.4, t), color: P.storm, fat: 0.35, seed: 82 });
    K.hump(ctx, mid, base, 105, 470, { a: K.inv(T.forms, T.forms + 0.4, t), color: P.calm, seed: 81 });
    K.medal(ctx, mid - 150, DIST.y - DIST.h / 2 + 140, 40, { a: K.inv(T.forms + 0.1, T.forms + 0.4, t), color: P.calm, icon: K.ICON.sun, seed: 660 });
    K.medal(ctx, mid + 150, DIST.y - DIST.h / 2 + 140, 40, { a: K.inv(T.forms + BEAT + 0.1, T.forms + BEAT + 0.4, t), color: P.storm, icon: K.ICON.storm, seed: 665 });
  }
  ctx.restore();
  /* Siggy pops up from the bottom-left corner and points at the storm band */
  const up = K.E.back(K.inv(T.point, T.point + 0.4, t), 1.8);
  if (up > 0 && ch) {
    K.turtle(ctx, 170, 1230 - 190 * up, 1.25, {
      seed: 700, blink: K.blinkAt(t, 9), mouth: "grin", shades: 20, look: [1, -0.6], turn: 0.45, brow: 0.6,
      squash: 0.1 * K.pulse(t, 1, 6) - 0.2 * (1 - K.inv(T.point + 0.1, T.point + 0.4, t)),
      flipR: { x: 150, y: -280 + 8 * Math.sin(t * 6) }, flipL: { x: -90, y: -80 },
    });
  }
}
