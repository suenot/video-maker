/* ============================================================
   EPISODE 67 SETS: the noir city behind the explainer objects.
   SET.street(ctx, g, o)  rainy night street (side view): sky, moon, two skyline layers, wet road,
                          lamps with amber cones, rain. Uses the scene camera K.cam (set it before:
                          K.cam = Object.assign({ rot: 0 }, CAM(g))); parallax layers follow it.
     o.lamps   [[worldX, on 0..1], ...]  (default one lamp at x 430, plus a dim far one)
     o.mid     fn(ctx, g)  world-plane drawing (parallax 1) after the road, e.g. trails, suspects
     o.front   fn(ctx, g)  screen-space drawing after the rain
     o.rain    0..1 amount (default 1);  o.flash 0..1 lightning;  o.dim 0..1 darkens the whole set
                          (use 0.4 - 0.6 behind a busy board so text carriers read)
   SET.room(ctx, g, o)   dark precinct wall in SCREEN space (no camera): back wall, moonlight stripes
                          through blinds, a lamp pool on the floor. o: { lamp: 0..1, blinds: 0..1, dim }
   After SET.*, call K.screen(ctx) before screen-space signs / HOST.duo.
   ============================================================ */
const SET = (function () {
  const P = K.P, CURB = 760;
  function dimmer(ctx, d) { if (d > 0) { K.screen(ctx); ctx.fillStyle = K.rgba(P.night, 0.82 * d); ctx.fillRect(0, 0, K.W, K.H); } }
  function street(ctx, g, o) {
    o = o || {};
    const lamps = o.lamps || [[430, 1], [2700, 0.55]];
    K.screen(ctx);
    K.nightSky(ctx, 0, 0, K.W, K.H, { moon: null, clouds: 0 });
    K.applyCam(ctx, 0.15); K.moon(ctx, 1500, -300, 80, 7);
    K.applyCam(ctx, 0.25);
    for (let i = 0; i < 4; i++) {
      const cx = -600 + i * 900 + ((g * 14) % 900), cy = -180 + 90 * K.hash(i, 3);
      ctx.save(); ctx.globalAlpha = 0.8;
      K.shape(ctx, K.blobPts(cx, cy, 320, 44, 14, 5 + i * 7, 0.22), { fill: i % 2 ? P.cloud : P.cloudLight, stroke: P.ink, w: 3, boil: 1.4, seed: 40 + i, gap: 0.2, shade: { color: P.cloud, dx: 0, dy: -12 } });
      ctx.restore();
    }
    K.applyCam(ctx, 0.45);
    K.skyline(ctx, -1400, 4200, 620, { seed: 5, tone: "far", hMin: 260, hMax: 640, wMin: 120, wMax: 220, lit: 0.22 });
    K.fog(ctx, -1400, 600, 5600, 90, 1);
    K.applyCam(ctx, 0.8);
    K.skyline(ctx, -900, 5200, 700, { seed: 17, tone: "near", hMin: 330, hMax: 620, lit: 0.16 });
    K.applyCam(ctx, 1);
    K.street(ctx, -800, 5600, CURB, { lights: lamps.map((l) => [l[0] + 70, P.amber, l[1]]), depth: 900, walk: 90 });
    K.ripples(ctx, -400, 5000, CURB + 40, CURB + 520, g, { n: 26, alpha: 0.4 });
    lamps.forEach((l, i) => K.lamp(ctx, l[0], CURB - 20, 1, { on: l[1], seed: 31 + 6 * i }));
    if (o.mid) { K.applyCam(ctx, 1); o.mid(ctx, g); }
    K.screen(ctx);
    const r = o.rain == null ? 1 : o.rain;
    if (r > 0) {
      K.rain(ctx, g, { n: Math.round(200 * r), alpha: 0.32 });
      K.rain(ctx, g, { n: Math.round(70 * r), alpha: 0.5, speed: 2300, len: 110, width: 3, seed: 77 });
    }
    dimmer(ctx, o.dim || 0);
    if (o.flash > 0) { ctx.fillStyle = K.rgba(P.moon, 0.55 * o.flash); ctx.fillRect(0, 0, K.W, K.H); }
    if (o.front) o.front(ctx, g);
  }
  function room(ctx, g, o) {
    o = o || {};
    K.screen(ctx);
    const gr = ctx.createLinearGradient(0, 0, 0, K.H);
    gr.addColorStop(0, P.nightMid); gr.addColorStop(0.7, P.night); gr.addColorStop(1, P.ink);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, K.W, K.H);
    /* wainscot line and floor */
    ctx.fillStyle = P.bldgDark; ctx.fillRect(0, 800, K.W, 280);
    K.line(ctx, [[0, 800], [K.W, 800]], { stroke: P.ink, w: 6, boil: 1, seed: 301, gap: 0, taper: false });
    K.line(ctx, [[0, 640], [K.W, 640]], { stroke: P.inkSoft, w: 4, boil: 1, seed: 302, gap: 0.1, taper: false });
    const lamp = o.lamp == null ? 1 : o.lamp;
    K.cone(ctx, 960, -20, Math.PI / 2, 900, 1.5, P.amber, 0.7 * lamp);
    K.pool(ctx, 960, 940, 700, 120, P.amber, lamp);
    K.blindLight(ctx, 0, 0, K.W, 800, { a: o.blinds == null ? 0.8 : o.blinds, n: 8, color: P.moonGlow });
    K.rain(ctx, g, { n: 40, alpha: 0.1, w: 1920 }); /* rain on the window glass behind the light */
    dimmer(ctx, o.dim || 0);
  }
  return { street, room, CURB };
})();
