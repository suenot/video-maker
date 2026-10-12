/* ============================================================
   EPISODE 68 TRANSITIONS between scenes (each scene renders alone, so a
   transition is split in two halves that meet on a fully covered frame):
     "wave"  the station's steam wipe: scene N ends with a wall of steam puffs
             rolling in from the left until the frame is cream; scene N+1
             starts covered and the steam rolls off to the right.
     "iris"  the railway tunnel: scene N ends with the portal closing to ink
             (brick ring); scene N+1 opens it from ink.
     "cut"   nothing.
   scenes.json sets each scene's "out"; the next scene's "in" is the same kind.
   The runtime (69_runtime.js) applies them automatically over TR.DUR seconds.
   ============================================================ */
const TR = (function () {
  const P = K.P, DUR = 0.6;
  /* steam wall: cream body up to the front, big puffs along the leading edge. facing +1: body on the left */
  function wall(ctx, front, facing) {
    K.screen(ctx);
    const far = facing > 0 ? -400 : 2400, x0 = Math.min(far, front - facing * 150), x1 = Math.max(far, front - facing * 150);
    ctx.fillStyle = P.cream; ctx.fillRect(x0, -20, x1 - x0, 1120);
    for (let i = 0; i < 9; i++) {
      const y = -40 + i * 145, j = K.hash(i, 5);
      K.puff(ctx, front - facing * (120 + 140 * j), y + 30 * Math.sin(i + K.now * 4), 190 + 60 * j, 0.5, 2700 + i);
      K.puff(ctx, front - facing * (-30 + 90 * K.hash(i, 6)), y + 70, 120 + 40 * j, 0.45, 2720 + i);
    }
  }
  const cover = (ctx) => { K.screen(ctx); ctx.fillStyle = P.cream; ctx.fillRect(0, 0, K.W, K.H); };
  /* u: 0 = untouched, 1 = fully covered */
  function waveOut(ctx, u) { if (u <= 0) return; if (u >= 1) cover(ctx); wall(ctx, K.lerp(-300, 2420, K.E.inOut(u)), 1); }
  /* u: 0 = fully covered, 1 = clear */
  function waveIn(ctx, u) { if (u >= 1) return; if (u <= 0) cover(ctx); wall(ctx, K.lerp(-420, 2300, K.E.inOut(u)), -1); }
  function ring(ctx, cx, cy, r) {
    ctx.save();
    ctx.lineWidth = 26; ctx.strokeStyle = P.tomatoDark; ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r + 24, 0, K.TAU); ctx.stroke();
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
