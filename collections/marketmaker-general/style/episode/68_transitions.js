/* ============================================================
   EPISODE 68 TRANSITIONS between scenes (each scene renders alone, so a
   transition is split in two halves that meet on a fully covered frame):
     "wave"  scene N ends with a coral-pink tide wall with a foam crest and a bubble curtain
             sweeping in from the left until it covers the frame; scene N+1 starts covered and
             the wall sweeps off to the right.
     "iris"  scene N ends with a round porthole (brass-yellow rim) closing to deep navy;
             scene N+1 opens it from navy.
     "cut"   nothing (use inside one slide when the camera carries continuity).
   scenes.json sets each scene's "out"; the next scene's "in" is the same kind.
   The runtime (69_runtime.js) applies them automatically over TR.DUR seconds.
   ============================================================ */
const TR = (function () {
  const P = K.P, DUR = 0.6;
  function wall(ctx, x0, x1, front, facing) {
    /* tide wall body between x0 and x1; `front` = the moving crest edge, facing +1 (crest on right) / -1 */
    const crest = [];
    for (let i = 0; i <= 16; i++) { const y = -40 + (i / 16) * 1160; crest.push([front + facing * (46 * Math.sin(y * 0.011 + K.now * 5) + 22 * Math.sin(y * 0.029 + 1)), y]); }
    const far = facing > 0 ? x0 : x1;
    const body = crest.concat([[far, 1140], [far, -60]]);
    K.shape(ctx, body, { fill: P.ask, w: 6, boil: 1.6, seed: 900, shade: { color: P.askDark, dx: -facing * 80, dy: 0 }, dots: { color: P.octoLight, alpha: 0.4, gap: 24, r: 4, ang: 0.5, from: 0.2 } });
    K.line(ctx, crest, { stroke: P.foam, w: 26, boil: 2, seed: 901, gap: 0.05 });
    K.line(ctx, crest.map((p) => [p[0] - facing * 60, p[1]]), { stroke: P.sun, w: 9, boil: 1.6, seed: 902, gap: 0.3 });
    for (let i = 0; i < 22; i++) {
      const y = (i / 22) * 1100 + 10, c = crest[Math.min(16, Math.round(((y + 40) / 1160) * 16))];
      const bx = c[0] + facing * (22 + 50 * K.hash(i, 7) + 30 * Math.sin(K.now * 7 + i));
      K.bubble(ctx, bx, y + 10 * Math.sin(K.now * 5 + i), 10 + 16 * K.hash(i, 8), 910 + i);
    }
  }
  /* u: 0 = untouched, 1 = fully covered */
  function waveOut(ctx, u) {
    if (u <= 0) return; K.screen(ctx);
    const front = K.lerp(-260, 2260, K.E.inOut(u));
    if (u >= 1) { ctx.fillStyle = P.ask; ctx.fillRect(0, 0, K.W, K.H); }
    wall(ctx, -400, front, front, 1);
  }
  /* u: 0 = fully covered, 1 = clear */
  function waveIn(ctx, u) {
    if (u >= 1) return; K.screen(ctx);
    const front = K.lerp(-340, 2200, K.E.inOut(u));
    if (u <= 0) { ctx.fillStyle = P.ask; ctx.fillRect(0, 0, K.W, K.H); }
    wall(ctx, front, 2400, front, -1);
  }
  function ring(ctx, cx, cy, r) {
    ctx.save();
    ctx.lineWidth = 24; ctx.strokeStyle = P.sunDark; ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 8; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r + 22, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = P.sun; ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, K.TAU); ctx.stroke();
    ctx.restore();
  }
  function irisMask(ctx, r, cx, cy) {
    K.screen(ctx); ctx.save();
    ctx.beginPath(); ctx.rect(-10, -10, K.W + 20, K.H + 20); ctx.arc(cx, cy, Math.max(0, r), 0, K.TAU, true);
    ctx.fillStyle = P.deep; ctx.fill("evenodd"); ctx.restore();
    if (r > 2) ring(ctx, cx, cy, r);
  }
  const irisOut = (ctx, u, c) => { if (u > 0) irisMask(ctx, K.lerp(1250, 0, K.E.inOut(u)), (c || [960, 540])[0], (c || [960, 540])[1]); };
  const irisIn = (ctx, u, c) => { if (u < 1) irisMask(ctx, K.lerp(0, 1250, K.E.inOut(u)), (c || [960, 540])[0], (c || [960, 540])[1]); };
  return { DUR, waveOut, waveIn, irisOut, irisIn, ring };
})();
