/* ============================================================
   EPISODE 67 HOUSE: the vaudeville house as a backdrop for explainer scenes.
   The sets are layered so a scene can put props between the back and the front:
     HOUSE.back(ctx, g, o)    world space (after K.applyCam): wallpaper, wainscot, floor boards,
                              pools of light. o: { light, lx, ly, spots: [[x, w], ...] }
     HOUSE.front(ctx, g, o)   world space, parallax 1: valance, curtains (open), proscenium
                              frame and footlights. o: { open (0..1, default 1), footlights }
     HOUSE.set(ctx, g, draw, o)  back, then draw() (your props), then front
   The floor line is K.FLOOR_Y (800); hosts stand at y 1045 in screen space, on the boards.
   Keep key content between x 420 and 1500 in the world at z 1; the curtains hang at the sides.
   ============================================================ */
const HOUSE = (function () {
  function back(ctx, g, o) {
    o = Object.assign({ light: 0.55, lx: 1000, ly: 420, spots: [] }, o || {});
    K.backdrop(ctx, { lx: o.lx, ly: o.ly, light: o.light });
    K.floor(ctx);
    (o.spots || []).forEach(([x, w], i) => K.spot(ctx, x, K.FLOOR_Y + 40, w || 420, 0.7, [i % 2 ? 1300 : 700, -260]));
  }
  function front(ctx, g, o) {
    o = Object.assign({ open: 1, footlights: true }, o || {});
    K.valance(ctx, -60, { x0: -300, x1: 2220, depth: 90, swags: 6 });
    K.curtain(ctx, -1, o.open, { seed: 400 }); K.curtain(ctx, 1, o.open, { seed: 460 });
    K.proscenium(ctx, { x: [-90, 2010] });
    if (o.footlights) K.footlights(ctx, 1110, 120, 1800, 9, 1);
  }
  function set(ctx, g, draw, o) { back(ctx, g, o); if (draw) draw(); front(ctx, g, o); }
  return { back, front, set };
})();
