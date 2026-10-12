/* ============================================================
   EPISODE 67 STATION SET: the clockwork station as a backdrop for explainer
   scenes (sky, hills, clock tower, rails) with real parallax. It uses the
   kit camera: set K.cam = { x, y, z, rot } in the scene (a K.mkTrack keyed on
   beats, world coordinates) and STATION.draw does the rest.

   STATION.draw(ctx, g, o)   o (all optional):
     ground   world y of the rail top (default 860; the hosts' platform sits at 1000 in screen space)
     sun      [x, y] sun position (default [1500, 300]); false hides it
     tower    [x, scale] clock tower in the far layer (default [1650, 0.62]); false hides it
     clock    [hour, minute] tower clock (default [10, 10]); tick it with the narration if wanted
     track    false hides the rail (use your own)
     far      fn(ctx, g)  extra drawing at parallax 0.55 (distant trains, signal masts)
     mid      fn(ctx, g)  world plane (parallax 1, camera applied): wagons, the explainer set pieces
     front    fn(ctx, g)  after everything, in SCREEN space
   STATION.toScreen(x, y)   world point -> screen (for pointing the hosts at things in mid)
   The sky is plain cream with a halftone glow, so text must still sit on a carrier (plaque, poster,
   board, paper). Keep big signs out of the logo corner (x 1450-1872, y 48-160).
   ============================================================ */
const STATION = (function () {
  const P = K.P;
  /* teardrop poplar (mid-century tree) */
  function poplar(c, x, y, h, seed, col) {
    K.line(c, [[x, y], [x, y - h * 0.3]], { w: 4, seed: seed + 1, key: P.woodDark });
    const pts = [];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * K.TAU, sn = Math.sin(a), cs = Math.cos(a); pts.push([x + cs * h * 0.17 * (1 - 0.35 * Math.max(0, -sn)), y - h * 0.62 + sn * h * 0.42 - (sn < 0 ? -sn * h * 0.12 : 0)]); }
    K.shape(c, pts, { fill: col, w: 2.5, smooth: true, seed, shade: { color: P.ink, dx: h * 0.06, dy: 0 } });
  }
  function draw(ctx, g, o) {
    o = o || {};
    const gy = o.ground == null ? 860 : o.ground;
    K.cam = K.cam || { x: 960, y: 540, z: 1, rot: 0 };
    K.applyCam(ctx, 0.05);
    K.sky(ctx, { horizon: gy - 100, sun: o.sun === false ? null : o.sun || [1500, 300], sunR: 130 });
    K.applyCam(ctx, 0.15);
    [[380, 190, 300, 11], [1380, 120, 240, 14], [2300, 230, 280, 17], [3200, 150, 300, 19], [-500, 170, 260, 23]].forEach((c, i) => K.cloud(ctx, c[0] + g * (6 + i), c[1], c[2], c[3]));
    K.applyCam(ctx, 0.35);
    K.hills(ctx, -2600, 4400, gy - 70, { h: 230, color: P.hillFar, seed: 5, n: 10, kind: "tri", tone: false, w: 2 });
    K.applyCam(ctx, 0.55);
    if (o.tower !== false) { const t = o.tower || [1650, 0.62], ck = o.clock || [10, 10]; K.clockTower(ctx, t[0], gy - 30, t[1], { hour: ck[0], minute: ck[1], gearRot: g * 0.5 }); }
    if (o.far) o.far(ctx, g);
    K.applyCam(ctx, 0.75);
    K.hills(ctx, -2600, 5200, gy - 10, { h: 150, color: P.hillMid, seed: 8, n: 11 });
    for (let i = 0; i < 10; i++) poplar(ctx, -900 + i * 610 + 120 * K.hash(i, 3), gy - 10, 210 + 60 * K.hash(i, 4), 300 + i, i % 3 ? P.tealDark : P.teal);
    K.applyCam(ctx, 1);
    K.shape(ctx, K.rectPts(-2600, gy + 26, 7800, 1400, 2), { fill: P.hillNear, w: 3, seed: 90, tone: { color: P.ink, gap: 12, r: 0, r2: 2.6, dir: Math.PI / 2, alpha: 0.2 } });
    if (o.track !== false) K.track(ctx, -2600, 5200, gy);
    for (let i = 0; i < 6; i++) K.lampPost(ctx, -800 + i * 1300, gy - 30, 250, 700 + i * 5);
    if (o.mid) o.mid(ctx, g);
    K.screen(ctx);
    if (o.front) o.front(ctx, g);
  }
  return { draw, toScreen: (x, y) => K.toScreen(x, y) };
})();
