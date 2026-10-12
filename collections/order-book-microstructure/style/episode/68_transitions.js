/* ============================================================
   EPISODE 68 TRANSITIONS between scenes (each scene renders alone, so a
   transition is split in two halves that meet on a fully covered frame).
   Diegetic, as STYLE.md asks (never a crossfade):
     "wave"  the kilim curtain: scene N ends with the curtain dropping from a carved beam
             until it covers the frame; scene N+1 starts covered and the curtain rolls up.
     "iris"  the arched doorway: scene N ends with a round window of the bazaar closing to ink,
             ringed with a terra and saffron frame; scene N+1 opens it again.
     "cut"   nothing (use inside one slide when the camera carries continuity).
   scenes.json sets each scene's "out"; the next scene's "in" is the same kind.
   The runtime (69_runtime.js) applies them automatically over TR.DUR seconds.
   Same API as the engine's TR: DUR, waveOut, waveIn, irisOut, irisIn, ring.
   ============================================================ */
const TR = (function () {
  const P = K.P, DUR = 0.6;
  /* u: 0 = untouched, 1 = fully covered: the curtain unrolls downwards */
  function waveOut(ctx, u) {
    if (u <= 0) return; K.screen(ctx);
    const e = K.E.inOut(u);
    K.rug(ctx, -30, -120, 1980, 1260, { roll: 1 - e, seed: 91 });
  }
  /* u: 0 = fully covered, 1 = clear: the curtain rolls up out of the frame */
  function waveIn(ctx, u) {
    if (u >= 1) return; K.screen(ctx);
    if (u <= 0) { ctx.fillStyle = P.terra; ctx.fillRect(-20, -20, 1960, 1120); }
    K.rug(ctx, -30, -120, 1980, 1260, { roll: K.E.inOut(u), seed: 91 });
  }
  function ring(ctx, cx, cy, r) {
    ctx.save();
    ctx.lineWidth = 26; ctx.strokeStyle = P.terra; ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 10; ctx.strokeStyle = P.saffron; ctx.setLineDash([22, 18]); ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, K.TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.lineWidth = 6; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r + 25, 0, K.TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r - 3, 0, K.TAU); ctx.stroke();
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
