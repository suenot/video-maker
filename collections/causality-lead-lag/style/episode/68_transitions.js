/* ============================================================
   EPISODE 68 TRANSITIONS between scenes (each scene renders alone, so a
   transition is split in two halves that meet on a fully covered frame):
     "wave"  venetian blinds: scene N ends with the slats closing (top to bottom) until the frame
             is black; scene N+1 starts closed and the slats open. (Name kept for scenes.json.)
     "iris"  the brass magnifier iris closes to ink (end of N) / opens from ink (start of N+1).
     "cut"   nothing.
   The runtime (69_runtime.js) applies them automatically over TR.DUR seconds.
   ============================================================ */
const TR = (function () {
  const P = K.P, DUR = 0.6, N = 9, SH = 1080 / N;
  /* slat k covers [k*SH, (k+1)*SH]; `c` 0..1 is how closed it is (staggered from the top) */
  function slats(ctx, u, opening) {
    K.screen(ctx);
    for (let k = 0; k < N; k++) {
      const st = (opening ? N - 1 - k : k) * 0.05, c = K.E.inOut(K.clamp((u - st) / 0.6, 0, 1));
      const h = SH * (opening ? 1 - c : c); if (h <= 0.5) continue;
      const y0 = k * SH - 1, hh = Math.min(SH + 2, h + 2);
      ctx.fillStyle = P.ink; ctx.fillRect(-10, y0, K.W + 20, hh);
      if (h < SH - 1) {
        /* slat edge catches the moon / lamp light */
        ctx.fillStyle = P.amberDim; ctx.fillRect(-10, y0 + hh - 4, K.W + 20, 4);
        ctx.fillStyle = P.nightLow; ctx.fillRect(-10, y0, K.W + 20, 3);
      }
    }
  }
  const waveOut = (ctx, u) => { if (u > 0) slats(ctx, u, false); };
  const waveIn = (ctx, u) => { if (u < 1) slats(ctx, u, true); };
  function ring(ctx, cx, cy, r) {
    ctx.save();
    ctx.lineWidth = 22; ctx.strokeStyle = P.brassDark; ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = P.brass; ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r + 20, 0, K.TAU); ctx.stroke();
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
