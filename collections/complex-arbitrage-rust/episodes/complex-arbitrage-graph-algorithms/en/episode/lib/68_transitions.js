/* ============================================================
   EPISODE 68 TRANSITIONS between scenes (each scene renders alone, so a
   transition is split in two halves that meet on a fully covered frame):
     "wave"  scene N ends with a sea wall sweeping in from the left until it
             covers the frame; scene N+1 starts covered and the wall sweeps
             off to the right (one big swell passing the camera).
     "iris"  scene N ends with the brass spyglass iris closing to ink;
             scene N+1 opens the iris from ink.
     "cut"   nothing (use inside one slide when the camera carries continuity).
   scenes.json sets each scene's "out"; the next scene's "in" is the same kind.
   The runtime (69_runtime.js) applies them automatically over TR.DUR seconds.
   ============================================================ */
const TR = (function () {
  const P = K.P, DUR = 0.6;
  function wall(ctx, x0, x1, front, facing) {
    /* sea wall body between x0 and x1; `front` = the moving crest edge, facing +1 (crest on right) / -1 */
    const crest = [];
    for (let i = 0; i <= 16; i++) { const y = -40 + (i / 16) * 1160; crest.push([front + facing * (50 * Math.sin(y * 0.01 + K.now * 5) + 24 * Math.sin(y * 0.027 + 1)), y]); }
    const far = facing > 0 ? x0 : x1;
    const body = crest.concat([[far, 1140], [far, -60]]);
    K.shape(ctx, body, { fill: P.seaMid, w: 6, boil: 2, seed: 900, shade: { color: P.seaDeep, dx: -facing * 70, dy: 0 }, hatch: { ang: 1.35, gap: 26, alpha: 0.25, color: P.foam } });
    K.line(ctx, crest, { stroke: P.foam, w: 26, boil: 2.4, seed: 901, gap: 0.05 });
    K.line(ctx, crest.map((p) => [p[0] - facing * 60, p[1]]), { stroke: "#bfe6ec", w: 8, boil: 2, seed: 902, gap: 0.3 });
    for (let i = 0; i < 22; i++) {
      const y = (i / 22) * 1100 + 10, c = crest[Math.min(16, Math.round(((y + 40) / 1160) * 16))];
      const bx = c[0] + facing * (22 + 46 * K.hash(i, 7) + 30 * Math.sin(K.now * 7 + i));
      K.dot(ctx, bx, y + 10 * Math.sin(K.now * 5 + i), 9 + 14 * K.hash(i, 8), P.foam, P.ink, 3, 910 + i);
    }
  }
  /* u: 0 = untouched, 1 = fully covered */
  function waveOut(ctx, u) {
    if (u <= 0) return; K.screen(ctx);
    const front = K.lerp(-260, 2260, K.E.inOut(u));
    if (u >= 1) { ctx.fillStyle = P.seaMid; ctx.fillRect(0, 0, K.W, K.H); }
    wall(ctx, -400, front, front, 1);
  }
  /* u: 0 = fully covered, 1 = clear */
  function waveIn(ctx, u) {
    if (u >= 1) return; K.screen(ctx);
    const front = K.lerp(-340, 2200, K.E.inOut(u));
    if (u <= 0) { ctx.fillStyle = P.seaMid; ctx.fillRect(0, 0, K.W, K.H); }
    wall(ctx, front, 2400, front, -1);
  }
  function ring(ctx, cx, cy, r) {
    ctx.save();
    ctx.lineWidth = 22; ctx.strokeStyle = P.goldDark; ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r + 20, 0, K.TAU); ctx.stroke();
    ctx.restore();
  }
  function irisMask(ctx, r, cx, cy) {
    K.screen(ctx); ctx.save();
    ctx.beginPath(); ctx.rect(-10, -10, K.W + 20, K.H + 20); ctx.arc(cx, cy, Math.max(0, r), 0, K.TAU, true);
    ctx.fillStyle = P.ink; ctx.fill("evenodd"); ctx.restore();
    if (r > 2) ring(ctx, cx, cy, r);
  }
  const irisOut = (ctx, u, c) => { if (u > 0) irisMask(ctx, K.lerp(1250, 0, K.E.inOut(u)), (c || [960, 540])[0], (c || [960, 540])[1]); };
  const irisIn = (ctx, u, c) => { if (u < 1) irisMask(ctx, K.lerp(0, 1250, K.E.inOut(u)), (c || [960, 540])[0], (c || [960, 540])[1]); };
  return { DUR, waveOut, waveIn, irisOut, irisIn, ring };
})();
