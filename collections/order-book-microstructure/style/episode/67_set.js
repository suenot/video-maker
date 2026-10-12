/* ============================================================
   EPISODE 67 SETS: the bazaar backdrops for explainer scenes (screen space,
   call after K.screen(ctx) / before the explainer objects and the hosts).
   SET.bazaar(ctx, g, o)  the street: folk sky with the sun rosette, two city layers, cobbled
                          floor, bunting and a lantern string. o: { pan, horizon (default 640),
                          sunX, sunY, bunting (true), lanterns (true), seed }
                          pan = world px the camera has moved right; layers move pan * 0.3 (far
                          city), 0.5 (near city) and 1 (bunting, lanterns). Floor top is
                          SET.floorY (680); the hosts stand at y 1010.
   SET.plaster(ctx, g, o) the plain plastered wall of a counting room for boards, tables and code:
                          dotted plaster, a tiled dado and a terra floor. o: { floor (800), seed }
                          Objects hang on the wall above the floor; the hosts stand on the floor.
   SET.floorY             first screen y of the bazaar floor (the plaster floor starts at o.floor, 800)
   ============================================================ */
const SET = (function () {
  const P = K.P;
  function floor(ctx, y0, seed) {
    K.shape(ctx, K.rectPts(-20, y0, 1960, 1120 - y0, 4), { fill: P.terraLight, w: 5, boil: 1, seed, pattern: { kind: "diamonds", color: P.terra, gap: 60, w: 12, alpha: 0.5 }, shade: { color: P.terra, dx: 0, dy: 22 } });
    K.line(ctx, [[-20, y0], [1940, y0]], { stroke: P.ink, w: 6, boil: 1, seed: seed + 1 });
  }
  function bazaar(ctx, g, o) {
    o = Object.assign({ pan: 0, horizon: 640, sunX: 1560, sunY: 150, bunting: true, lanterns: true, seed: 4 }, o || {});
    K.screen(ctx);
    K.sky(ctx, -20, -20, 1940, o.horizon + 4, { sunX: o.sunX, sunY: o.sunY, sunR: 70, seed: o.seed });
    ctx.save(); ctx.translate(-o.pan * 0.3, 0); K.city(ctx, -700, 2700, o.horizon, { layer: 0, seed: o.seed, h: 170 }); ctx.restore();
    ctx.save(); ctx.translate(-o.pan * 0.5, 0); K.city(ctx, -700, 2700, o.horizon + 70, { layer: 1, seed: o.seed + 5, h: 120 }); ctx.restore();
    floor(ctx, o.horizon + 40, o.seed + 1);
    ctx.save(); ctx.translate(-o.pan, 0);
    if (o.bunting) for (let i = -1; i < 4; i++) K.bunting(ctx, [i * 760, 40 + (i & 1) * 20], [i * 760 + 760, 60 + ((i + 1) & 1) * 20], { n: 9, sag: 50, seed: 11 + i * 3 });
    if (o.lanterns) for (let i = -1; i < 3; i++) K.lanternString(ctx, [i * 960 + 40, o.horizon - 150], [i * 960 + 1000, o.horizon - 150], { n: 5, sag: 36, seed: 31 + i * 7, s: 0.9, glow: 0.4 });
    ctx.restore();
  }
  function plaster(ctx, g, o) {
    o = Object.assign({ floor: 800, seed: 2 }, o || {});
    K.screen(ctx);
    K.shape(ctx, K.rectPts(-20, -20, 1960, o.floor + 20, 4), { fill: P.plaster, w: 0, boil: 0, seed: o.seed, pattern: { kind: "dots", color: P.plasterShade, gap: 50, w: 8, alpha: 0.5 }, reg: false });
    /* tiled dado along the foot of the wall */
    K.shape(ctx, K.rectPts(-20, o.floor - 90, 1960, 90, 3), { fill: P.tile, w: 4, boil: 0.8, seed: o.seed + 1, pattern: { kind: "diamonds", color: P.cobalt, gap: 60, w: 12, alpha: 0.55 }, reg: false });
    floor(ctx, o.floor, o.seed + 3);
  }
  return { bazaar, plaster, floorY: 680 };
})();
