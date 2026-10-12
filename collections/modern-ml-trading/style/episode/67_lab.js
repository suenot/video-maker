/* ============================================================
   EPISODE 67 LAB SET: the long greenhouse lab as a backdrop for explainer scenes
   (the counterpart of the crab's SIDE set). Wall at parallax 0.9, bench and floor
   at 1.0, foreground ferns at 1.25. The hosts stand on the floor in front of the
   bench (HOST.duo with stage: "none"); the explainer objects sit on or above the
   bench top at LAB.BENCH_Y.

   LAB.draw(ctx, g, o)   call inside the world (after setting K.cam). Draws everything.
     o.x0, o.x1      world extent (default -400 .. 3800)
     o.lamps         0..1 lamp light (default 1); o.dim 0..1 darkens the room (a worry beat)
     o.props         false to leave the bench and shelves bare
     o.fern          false to skip the foreground ferns
     o.bench         fn(ctx, g)  extra drawing at parallax 1 right after the bench (plates, flasks)
   LAB.BENCH_Y = 720 (bench top), LAB.FLOOR_Y = 985 (hosts' feet, screen y ~1010 at camera y 540)
   LAB.floor(ctx, x0, x1)  floor only;  LAB.ferns(ctx)  foreground ferns only
   ============================================================ */
const LAB = (function () {
  const P = K.P;
  const BENCH_Y = 720, FLOOR_Y = 985;

  function floor(ctx, x0, x1) {
    K.shape(ctx, K.rectPts(x0, FLOOR_Y, x1 - x0, 700, 2), { fill: P.floor, w: 0, stroke: null, boil: 0, seed: 90 });
    for (let x = Math.floor(x0 / 300) * 300; x < x1; x += 300) K.line(ctx, [[x, FLOOR_Y], [x - 90 + (Math.abs(x / 300) % 2 ? 40 : -40), FLOOR_Y + 220]], { stroke: P.woodDark, w: 3, boil: 0.6, seed: 91 + Math.abs(x | 0), taper: false });
    K.line(ctx, [[x0, FLOOR_Y + 80], [x1, FLOOR_Y + 80]], { stroke: P.woodDark, w: 3, boil: 0.6, seed: 92, taper: false });
    K.shape(ctx, K.rectPts(x0, FLOOR_Y - 10, x1 - x0, 22, 4), { fill: P.woodLight, w: 4, boil: 0.9, seed: 93, shade: { color: P.wood, dx: 0, dy: -8 } }); /* skirting */
  }

  function ferns(ctx) {
    K.applyCam(ctx, 1.25);
    [[-120, 1220, 0.5], [1900, 1240, -0.3], [3300, 1230, 0.2]].forEach((f, i) => {
      for (let k = 0; k < 5; k++) K.leaf(ctx, f[0] + k * 14, f[1], -1.57 + f[2] + (k - 2) * 0.45 + Math.sin(K.now * 1.2 + i + k) * 0.04, 3.4 - Math.abs(k - 2) * 0.5, 2800 + i * 10 + k, P.leafDark);
    });
  }

  function draw(ctx, g, o) {
    o = o || {};
    const x0 = o.x0 == null ? -400 : o.x0, x1 = o.x1 == null ? 3800 : o.x1, lamps = o.lamps == null ? 1 : o.lamps;
    const wins = [];
    for (let x = x0 + 520; x < x1 - 200; x += 1100) wins.push([x, -300, 300, 640]);
    K.applyCam(ctx, 0.9);
    K.labWall(ctx, x0, x1, { top: -700, bottom: 1500, dado: 560, windows: wins, seed: 3 });
    K.pipe(ctx, [[x0, -90], [x0 + 1400, -90], [x0 + 1400, 20], [x0 + 2300, 20], [x0 + 2300, -90], [x1, -90]], { seed: 40, w: 20 });
    if (o.props !== false) {
      /* two shelves of flasks on the wall */
      for (let x = x0 + 1000; x < x1 - 300; x += 2200) {
        K.shelf(ctx, x, x + 520, 330, 80 + (x | 0));
        K.flask(ctx, x + 110, 308, 0.5, { seed: 3100 + (x | 0), layers: [{ h: 0.4, color: P.glass }], cork: true });
        K.beaker(ctx, x + 250, 308, 0.7, P.test, 3140 + (x | 0));
        K.flask(ctx, x + 400, 308, 0.45, { seed: 3180 + (x | 0), layers: [{ h: 0.3, color: P.train }], cork: true });
      }
    }
    K.applyCam(ctx, 1);
    K.bench(ctx, x0 + 100, x1 - 100, BENCH_Y, { seed: 60 });
    if (o.props !== false) {
      for (let x = x0 + 2150; x < x1 - 300; x += 1500) { /* clear of the hosts' corner at the start */
        K.pot(ctx, x, BENCH_Y - 6, 0.7, { seed: 3300 + (x | 0) });
        K.beaker(ctx, x + 140, BENCH_Y - 6, 0.8, P.glass, 3340 + (x | 0));
      }
    }
    floor(ctx, x0, x1);
    for (let x = x0 + 1100; x < x1; x += 1500) K.lamp(ctx, x, 40, { seed: 1190 + (x | 0), len: 260, on: lamps, sway: Math.sin(g * 1.1 + x) * 6 });
    if (o.bench) o.bench(ctx, g);
    if (o.fern !== false) ferns(ctx);
    if (o.dim > 0) { K.screen(ctx); ctx.save(); ctx.globalAlpha = 0.5 * o.dim; ctx.fillStyle = "#1a2a22"; ctx.fillRect(0, 0, K.W, K.H); ctx.restore(); }
  }
  return { draw, floor, ferns, BENCH_Y, FLOOR_Y };
})();
