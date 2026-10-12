/* ============================================================
   EPISODE 67 REEF SET: the Coral Exchange backdrop for explainer scenes
   (flat ocean bands, light rays, bubbles, a sandy floor with coral and kelp
   in parallax layers). The kit's own world pieces, arranged for a talking scene.

   REEF.draw(ctx, g, o)  paints the whole backdrop. Call first in draw(g), before K.applyCam.
     o.pan     world x offset (px) of the camera; far layers move less (parallax)
     o.depth   0..1 water darkness (0.35 sunlit .. 0.9 deep); default 0.4
     o.floor   screen y of the sand line (default 930)
     o.rays    0..1 light ray strength (default 1)
     o.bubbles 0..1 bubble density (default 1)
     o.dim     0..1 darkens the reef so boards on top read better (default 0)
     o.seed    changes the layout of the coral
   Leaves the context in screen space. Draw boards / the camera world after it.
   ============================================================ */
const REEF = (function () {
  const P = K.P;
  function draw(ctx, g, o) {
    o = Object.assign({ pan: 0, depth: 0.4, floor: 930, rays: 1, bubbles: 1, dim: 0, seed: 0 }, o || {});
    /* K.ocean's bands stop 40 px short of the right edge at the top: clear first, or old frames show through */
    K.screen(ctx); ctx.fillStyle = K.mix(P.surface, P.shallow, o.depth); ctx.fillRect(0, 0, K.W, K.H);
    K.ocean(ctx, { depth: o.depth });
    K.rays(ctx, { a: o.rays });
    const cam = (p) => { ctx.setTransform(1, 0, 0, 1, -o.pan * p, 0); K.zoom = 1; };
    /* far layer: rocks and fans, small and hazy */
    cam(0.25); ctx.save(); ctx.globalAlpha = 0.55;
    for (let i = 0; i < 9; i++) {
      const x = i * 310 - 200 + K.hs(i, 3 + o.seed) * 60, y = o.floor - 70 + 12 * K.hash(i, 4);
      if (i % 3 === 0) K.brainCoral(ctx, x, y, 0.6, { seed: 300 + i + o.seed });
      else K.coralFan(ctx, x, y, 0.7, { seed: 330 + i + o.seed });
    }
    ctx.restore();
    if (o.bubbles > 0) { cam(0.5); K.bubbles(ctx, { n: Math.round(18 * o.bubbles), x0: -200, x1: 2300, y0: 1100, h: 1300, seed: 31 + o.seed, a: 0.9 }); }
    /* mid layer: sand with kelp */
    cam(0.75);
    for (let i = 0; i < 7; i++) K.kelp(ctx, i * 360 - 120 + K.hs(i, 8) * 80, o.floor + 20, 280 + 120 * K.hash(i, 9), { seed: 360 + i + o.seed, sway: 1 });
    K.sand(ctx, o.floor + 40, { x0: -1000, x1: 4200, seed: 51 + o.seed });
    /* near layer: coral heads at the edges */
    cam(1);
    for (let i = 0; i < 6; i++) {
      const x = i * 560 - 300 + K.hs(i, 12) * 90, y = o.floor + 70 + 20 * K.hash(i, 13);
      if (i % 2) K.coralBranch(ctx, x, y, 0.9, { seed: 400 + i + o.seed }); else K.brainCoral(ctx, x, y, 0.8, { seed: 430 + i + o.seed });
    }
    K.screen(ctx);
    if (o.dim > 0) { ctx.fillStyle = "rgba(8,30,70," + (0.55 * o.dim) + ")"; ctx.fillRect(0, 0, K.W, K.H); }
  }
  return { draw };
})();
