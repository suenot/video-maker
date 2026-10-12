/* ============================================================
   EPISODE 67 DINER SET: the explainer backdrop, in WORLD coordinates (call K.applyCam(ctx, 1)
   first; at camera {x: 960, y: 540, z: 1} world = screen).
   SET.diner(ctx, g, o)   back wall (tiles, teal wainscot, chrome rail), repeating windows and
                          pass windows, pendant lamps, the counter and the checker floor.
   o (all optional):
     x0, x1       world extent to paint (default -700 .. 4000; widen for long pans)
     dark         0..1 night wash over the room (the mempool corner, "danger" beats)
     belt         y of a chain conveyor running along the wall (e.g. 420), or null
     beltV        belt speed in px/s (default 90)
     lamps        false to hide the pendant lamps
     wall         false: skip the wall (paint your own backdrop, keep counter + floor)
   Layout constants (SET.COUNTER_Y etc.): wall down to y 640, counter top y 620, counter front
   to 860, checker floor 860..1080+. Hosts stand on the floor (feet y 1040), the explainer
   objects sit on the counter (y ~ 600) or float in the wall area (y 80 .. 560).
   SET.counterTop(x) -> y where objects stand.
   ============================================================ */
const SET = (function () {
  const P = K.P, COUNTER_Y = 620, FRONT_Y = 860;
  /* wall clock: chrome ring, cream face, hands from g (one turn of the minute hand per 60 s) */
  function clock(ctx, g, x, y, r, seed) {
    K.dot(ctx, x, y, r + 12, P.chrome, P.ink, 5, seed);
    K.dot(ctx, x, y, r, P.cream, P.ink, 4, seed + 1);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * K.TAU; K.rule(ctx, [[x + Math.sin(a) * (r - 14), y - Math.cos(a) * (r - 14)], [x + Math.sin(a) * (r - 4), y - Math.cos(a) * (r - 4)]], { stroke: P.ink, w: 4, boil: 0.3, seed: seed + 2 + i }); }
    const am = (g / 60) * K.TAU, ah = (g / 720) * K.TAU;
    K.rule(ctx, [[x, y], [x + Math.sin(am) * (r - 16), y - Math.cos(am) * (r - 16)]], { stroke: P.ink, w: 5, boil: 0.3, seed: seed + 20 });
    K.rule(ctx, [[x, y], [x + Math.sin(ah) * (r * 0.55), y - Math.cos(ah) * (r * 0.55)]], { stroke: P.cherry, w: 7, boil: 0.3, seed: seed + 21 });
    K.dot(ctx, x, y, 6, P.ink, null, 0, seed + 22);
  }
  function diner(ctx, g, o) {
    o = Object.assign({ x0: -700, x1: 4000, dark: 0, belt: null, beltV: 90, lamps: true, wall: true }, o || {});
    if (o.wall) {
      K.wall(ctx, o.x0, o.x1, -300, COUNTER_Y + 20, { seed: 3, wainscot: 0.12 });
      /* windows: every 1600 px alternate a night window and a kitchen pass window */
      const k0 = Math.floor(o.x0 / 1600), k1 = Math.ceil(o.x1 / 1600);
      for (let k = k0; k < k1; k++) {
        const bx = k * 1600;
        if (k % 2 === 0) K.window(ctx, bx + 760, 60, 420, 220, 35 + (k & 7));
        else K.passWindow(ctx, bx + 620, 50, 720, 210, 30 + (k & 7));
        clock(ctx, g, bx + 1340, 170, 68, 80 + (k & 7));
      }
      if (o.lamps) for (let k = Math.floor(o.x0 / 800); k < Math.ceil(o.x1 / 800); k++) K.lamp(ctx, k * 800 + 400, -40, 0.9, 1, 50 + (k & 7));
      if (o.belt != null) K.conveyor(ctx, o.x0, o.x1, o.belt, o.beltV * g, { seed: 60 });
    }
    if (o.dark > 0) { ctx.save(); ctx.globalAlpha = o.dark * 0.8; ctx.fillStyle = P.nightDark; ctx.fillRect(o.x0, -300, o.x1 - o.x0, COUNTER_Y + 340); ctx.restore(); }
    K.counter(ctx, o.x0, o.x1, COUNTER_Y, FRONT_Y - COUNTER_Y, { seed: 40 });
    K.checkerFloor(ctx, o.x0, o.x1, FRONT_Y, FRONT_Y + 220, { seed: 9, rows: 4, vpX: K.cam ? K.cam.x : 960, dark: o.dark * 0.5 });
  }
  return { diner, COUNTER_Y, FRONT_Y, counterTop: () => COUNTER_Y + 6 };
})();
