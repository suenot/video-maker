/* ============================================================
   EPISODE 67 SIDE SET: the horizon view with a panning camera and weather,
   plus the hosts' ship. (The chart set is the kit's K.chartSea + K.applyCam.)

   SIDE.draw(ctx, g, o)  o:
     horizon   screen y of the horizon (560..640)
     pan       world x offset of the camera (parallax layers move pan * p)
     zoom, fx, fy   push-in around a focus point (zoom <= 1.2 over >= 4 s)
     storm     0..1  sky greys, sun fades, waves grow, storm clouds roll in
     murk      0..1  muddy water tint ("muddy waters")
     flash     0..1  lightning flash
     far       [[x, w, h, seed], ...] far islands (parallax 0.4)
     farLayer  fn(ctx, g)  extra drawing at parallax 0.7 (buoys, distant ships)
     mid       fn(ctx, g, swell)  world plane (parallax 1): ships, the hosts' ship
     front     fn(ctx, g)  after the front waves (screen space)
   SIDE.layer(ctx, p)  sets the camera for parallax p inside the callbacks (call it
                       before drawing in a callback that changes layers).
   HOST.ship(ctx, g, o)  the iron ship with the crab at the helm and the parrot on the
                       bow rail. o: { x, y, s, dir, rock, coins, crabS, reacts, preacts,
                       point, pointAmt, parrot } -> returns the crab's screen position.
   ============================================================ */
const SIDE = (function () {
  const P = K.P;
  let C = { pan: 0, zoom: 1, fx: 960, fy: 600 };
  function layer(ctx, p) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const z = 1 + (C.zoom - 1) * p;
    ctx.translate(C.fx, C.fy); ctx.scale(z, z); ctx.translate(-C.fx - C.pan * p, -C.fy);
    K.zoom = z;
  }
  function cloud(ctx, x, y, s, seed, fill, shadeC) {
    const Cc = [];
    for (let i = 0; i < 5; i++) { const u = i / 4 - 0.5; Cc.push([u * 190 * s, -(30 + 34 * Math.cos(u * 2.6) + 12 * K.hash(i, seed)) * s * 0.7, (40 + 26 * Math.cos(u * 2.4) + 10 * K.hash(i + 9, seed)) * s]); }
    const pts = [];
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * K.TAU, dx = Math.cos(a), dy = Math.sin(a); let r = 0;
      Cc.forEach((c) => { const b = dx * c[0] + dy * c[1], q = c[0] * c[0] + c[1] * c[1] - c[2] * c[2], disc = b * b - q; if (disc >= 0) r = Math.max(r, b + Math.sqrt(disc)); });
      pts.push([x + dx * r, Math.min(y + dy * r, y + 14 * s)]);
    }
    K.shape(ctx, pts, { fill, w: 3.5, boil: 1.6, seed: 70 + seed, shade: { color: shadeC, dx: 10 * s, dy: -16 * s }, gap: 0.06 });
  }
  function draw(ctx, g, o) {
    o = o || {};
    const hz = o.horizon || 600, st = K.clamp(o.storm || 0, 0, 1), mk = K.clamp(o.murk || 0, 0, 1);
    C = { pan: o.pan || 0, zoom: o.zoom || 1, fx: o.fx || 960, fy: o.fy || hz };
    /* sky (parallax 0.1) */
    layer(ctx, 0.1);
    const gr = ctx.createLinearGradient(0, -200, 0, hz);
    gr.addColorStop(0, K.mix(P.skyTop, "#56687a", st)); gr.addColorStop(0.55, K.mix(P.skyMid, "#8c9aa4", st)); gr.addColorStop(1, K.mix(P.skyLow, "#b8b4a4", st));
    ctx.fillStyle = gr; ctx.fillRect(-2000, -400, 8000, hz + 412);
    if (st < 0.95) {
      ctx.save(); ctx.globalAlpha *= 1 - st;
      K.glow(ctx, 1480, 250, 260, "rgba(255,240,190,0.9)", 0.55);
      ctx.save(); ctx.translate(1480, 250); ctx.rotate(g * 0.12);
      for (let i = 0; i < 12; i++) { const a = (i / 12) * K.TAU, r0 = 92, r1 = 130 + 14 * (i % 2); K.line(ctx, [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]], { stroke: P.gold, w: 6, boil: 1.5, seed: 40 + i, gap: 0 }); }
      ctx.restore();
      K.shape(ctx, K.ellipsePts(1480, 250, 72, 72, 18), { fill: P.sun, w: 4.5, boil: 1.6, seed: 31, shade: { color: "#f7b84a", dx: -10, dy: -10 } });
      ctx.restore();
    }
    const CL = [[220, 150, 1.0, 1], [760, 95, 0.75, 2], [1150, 210, 0.9, 3], [1760, 130, 0.7, 4], [2300, 180, 0.8, 5], [2900, 120, 0.9, 6]];
    CL.forEach((c) => cloud(ctx, c[0] + g * 10 * c[2], c[1] + 20 * st, c[2] * (1 + 0.4 * st), c[3], K.mix(P.cloud, "#9aa4ad", st), K.mix(P.cloudShade, "#6f7b86", st)));
    if (st > 0.05) for (let i = 0; i < 6; i++) {
      const x = 300 + i * 520 + g * 22, y = 60 + 40 * K.hash(i, 5);
      ctx.save(); ctx.globalAlpha *= K.clamp(st * 1.4 - i * 0.08, 0, 1); cloud(ctx, x, y, 1.3, 20 + i, "#7d8893", "#5b6670"); ctx.restore();
    }
    /* far islands (parallax 0.4) */
    layer(ctx, 0.4);
    (o.far || [[330, 320, 70, 1], [1240, 200, 44, 2], [2100, 260, 60, 3], [2900, 220, 50, 4]]).forEach((f) => K.farIsland(ctx, f[0], hz, f[1], f[2], f[3]));
    /* sea (screen) */
    K.screen(ctx);
    const sg = ctx.createLinearGradient(0, hz, 0, K.H);
    const deep = K.mix(K.mix(P.seaDeep, "#163f52", st * 0.6), "#5a5a34", mk * 0.7), mid = K.mix(K.mix(P.seaMid, "#2b6a7e", st * 0.5), "#7a7444", mk * 0.75), far = K.mix(K.mix(P.seaFar, "#5d8794", st * 0.6), "#8f8a5c", mk * 0.6);
    sg.addColorStop(0, far); sg.addColorStop(0.45, mid); sg.addColorStop(1, deep);
    ctx.fillStyle = sg; ctx.fillRect(-10, hz, K.W + 20, K.H - hz + 10);
    K.line(ctx, [[-20, hz], [K.W * 0.5, hz + 1], [K.W + 20, hz]], { stroke: P.ink, w: 3, boil: 0.8, seed: 12 });
    const amp = 1 + 2.2 * st, crest = K.mix(P.foam, "#d8d2b0", mk * 0.6);
    K.waveRow(ctx, hz + 70, { amp: 6 * amp, len: 90, speed: 18 + 20 * st, pan: (o.pan || 0) * 0.7, color: K.mix(K.mix("#4aa3b8", "#3c7f90", st * 0.5), "#86814e", mk * 0.7), w: 2.5, seed: 21, crest });
    if (o.farLayer) { layer(ctx, 0.7); o.farLayer(ctx, g); K.screen(ctx); }
    K.waveRow(ctx, hz + 190, { amp: 9 * amp, len: 140, speed: 32 + 30 * st, pan: o.pan || 0, color: mid, w: 3.2, seed: 22, crest });
    const swell = 7 * Math.sin(g * 2.2) * (1 + st * 2.5);
    if (o.mid) { layer(ctx, 1); o.mid(ctx, g, swell); K.screen(ctx); }
    K.waveRow(ctx, hz + 330, { amp: 12 * amp, len: 180, speed: 44 + 40 * st, pan: (o.pan || 0) * 1.2, color: K.mix(K.mix("#2a86a0", "#235f72", st * 0.5), "#6c6840", mk * 0.7), w: 4, seed: 23, crest });
    K.waveRow(ctx, hz + 410, { amp: 14 * amp, len: 220, speed: 60 + 50 * st, pan: (o.pan || 0) * 1.4, color: deep, w: 4.5, seed: 24, crest });
    if (o.front) { K.screen(ctx); o.front(ctx, g); }
    if (o.flash > 0) { K.screen(ctx); ctx.save(); ctx.globalAlpha = K.clamp(o.flash, 0, 1) * 0.55; ctx.fillStyle = "#fffbe8"; ctx.fillRect(0, 0, K.W, K.H); ctx.restore(); }
    K.screen(ctx);
  }
  /* a world point at parallax p -> screen (for pointing at things) */
  function toScreen(x, y, p) {
    const z = 1 + (C.zoom - 1) * (p == null ? 1 : p);
    return [C.fx + (x - C.fx - C.pan * (p == null ? 1 : p)) * z, C.fy + (y - C.fy) * z];
  }
  return { draw, layer, toScreen, cloud };
})();

HOST.ship = function (ctx, g, o) {
  o = o || {};
  const s = o.s || 1.4, crabS = o.crabS || 1.1, x = o.x || 600, y = o.y || 900, dir = o.dir || 1;
  const rock = o.rock == null ? 2.2 * Math.sin(g * 1.6 + 0.4) : o.rock;
  /* the crab's screen position (ignores the small rock) for pointing math */
  const cx = x + dir * K.SHIP.crabX * s, cy = y + K.SHIP.deckY * s, cs = s * crabS;
  const crabFn = (c) => K.crab(c, 0, 0, crabS, HOST.crabPose(g, Object.assign({}, o, { x: cx, y: cy, s: cs, side: dir })));
  K.ship(ctx, x, y, s, { dir, rock, coins: o.coins || 0, crab: crabFn, sail: 1, flagColor: o.flagColor });
  if (o.parrot !== false) {
    /* parrot on the bow rail, drawn in the ship's frame so it rocks with it */
    ctx.save(); ctx.translate(x, y); ctx.rotate((rock * Math.PI) / 180); ctx.scale(s * dir, s);
    ctx.scale(dir, 1); /* keep the parrot facing the viewer */
    K.parrot(ctx, 132 * dir, -86, 0.62, HOST.parrotPose(g, Object.assign({}, o, { side: dir, _px: x + 132 * s * dir })));
    ctx.restore();
  }
  return [cx, cy];
};
