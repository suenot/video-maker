/* ============================================================
   EPISODE 67 BEACH SET (Surf Turtle): the world backdrop for explainer scenes. Wave height is
   volatility, turquoise is calm, coral is storm. Draw in WORLD space (after K.applyCam), then
   put explainer objects on top, then K.screen + signs + HOST.duo.
   BEACH.world(ctx, g, o)   sky + far isle + lighthouse + ocean + wet sand (+ rain in a storm).
                            o: { storm 0..1, vol (wave height; default follows storm), horizon (default 540),
                                 lighthouse (default true), isle (default true), sunX, rain (default true),
                                 beach (default true), flash 0..1 (regime-flip flash) }
   BEACH.storm(g, keys)     smooth regime number from [[g0, v0], [g1, v1], ...] (monotone, no overshoot)
   BEACH.board(ctx, x, y, w, h, o)  a flat slate/cream carrier panel for text (a "message board" on posts)
   ============================================================ */
const BEACH = (function () {
  const P = K.P;
  function world(ctx, g, o) {
    o = Object.assign({ storm: 0, horizon: 540, lighthouse: true, isle: true, rain: true, beach: true, sunX: 1400, flash: 0 }, o || {});
    const h = o.horizon, st = o.storm;
    K.sky(ctx, h, { storm: st, sunX: o.sunX });
    if (o.isle) K.farIsle(ctx, 420, h, 300, st, 7);
    if (o.lighthouse) K.lighthouse(ctx, 1640, h + 24, 0.62, { beam: K.mix(P.beamCalm, P.beamStorm, st), ang: 0.12 * Math.sin(g * 0.5) - 0.05, flash: o.flash, seed: 120 });
    K.ocean(ctx, h, { storm: st, vol: o.vol });
    if (o.beach) K.beach(ctx, 930, { storm: st });
    if (o.rain && st > 0.05) K.rain(ctx, st, { x: -100, y: -100, w: 2100, h: 1300 });
    if (o.flash > 0) { ctx.save(); ctx.globalAlpha = 0.35 * o.flash; ctx.fillStyle = P.cream; ctx.fillRect(-200, -200, 2400, 1500); ctx.restore(); }
  }
  const storm = (g, keys) => K.mkSpline(keys)(g);
  function board(ctx, x, y, w, h, o) {
    o = Object.assign({ a: 1, seed: 21, fill: P.cream }, o || {});
    const a = K.popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    [-1, 1].forEach((sd, i) => K.limb(ctx, [[sd * (w / 2 - 50), h / 2 - 10], [sd * (w / 2 - 50), h / 2 + 170]], 16, P.woodDark, o.seed + 1 + i));
    K.shape(ctx, K.cardPts(-w / 2, -h / 2, w, h, 20), { fill: P.wood, w: 6, boil: 1, seed: o.seed, shade: { color: P.woodDark, dx: -10, dy: -12 } });
    K.shape(ctx, K.cardPts(-w / 2 + 20, -h / 2 + 20, w - 40, h - 40, 12), { fill: o.fill, w: 4, boil: 0.8, seed: o.seed + 3, shade: { color: P.creamShade, dx: 8, dy: 8 } });
    ctx.restore();
  }
  return { world, storm, board };
})();
