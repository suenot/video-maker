/* ============================================================
   EPISODE 68 TRANSITIONS between scenes (greenhouse): each scene renders alone, so a
   transition is split in two halves that meet on a fully covered frame.
     "wave"  a curtain of leaves sweeps in from the left until it covers the frame (end of
             scene N); scene N+1 starts covered and the curtain sweeps off to the right.
             Covered colour = TR.WALL (dark leaf green).
     "iris"  the brass deco iris closes to ink (end of N) / opens from ink (start of N+1).
     "cut"   nothing.
   Replaces the engine's lib/68_transitions.js by file name. The runtime (69_runtime.js)
   calls TR.waveOut / waveIn / irisOut / irisIn over TR.DUR seconds.
   ============================================================ */
const TR = (function () {
  const P = K.P, DUR = 0.6;
  const WALL = P.leafDark;
  function wall(ctx, front, facing) {
    const crest = [];
    for (let i = 0; i <= 16; i++) { const y = -40 + (i / 16) * 1160; crest.push([front + facing * (46 * Math.sin(y * 0.01 + K.now * 5) + 22 * Math.sin(y * 0.027 + 1)), y]); }
    const far = facing > 0 ? -400 : 2400;
    K.shape(ctx, crest.concat([[far, 1140], [far, -60]]), { fill: WALL, w: 6, boil: 2, seed: 900, shade: { color: "#2a5220", dx: -facing * 70, dy: 0 }, dots: { gap: 12, alpha: 0.25 } });
    /* big leaves along the crest, pointing in the travel direction */
    for (let i = 0; i < 12; i++) {
      const c = crest[Math.min(16, Math.round(((i * 95 + 20 + 40) / 1160) * 16))], y = i * 95 + 20;
      K.leaf(ctx, c[0] - facing * 20, y, (facing > 0 ? 0 : Math.PI) + 0.5 * Math.sin(K.now * 3 + i * 1.7) + (i % 2 ? 0.35 : -0.35), 3.2, 910 + i, i % 3 ? P.leaf : P.leafLight);
    }
    K.line(ctx, crest, { stroke: P.brass, w: 12, boil: 2, seed: 901, taper: false });
  }
  function fill(ctx) { ctx.fillStyle = WALL; ctx.fillRect(0, 0, K.W, K.H); }
  function waveOut(ctx, u) { if (u <= 0) return; K.screen(ctx); if (u >= 1) fill(ctx); wall(ctx, K.lerp(-260, 2260, K.E.inOut(u)), 1); }
  function waveIn(ctx, u) { if (u >= 1) return; K.screen(ctx); if (u <= 0) fill(ctx); wall(ctx, K.lerp(-340, 2200, K.E.inOut(u)), -1); }
  function ring(ctx, cx, cy, r) {
    ctx.save();
    ctx.lineWidth = 24; ctx.strokeStyle = P.brassDark; ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 14; ctx.strokeStyle = P.brass; ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r + 22, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = P.brassLight;
    for (let i = 0; i < 24; i++) { const a = (i / 24) * K.TAU; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r + 2), cy + Math.sin(a) * (r + 2)); ctx.lineTo(cx + Math.cos(a) * (r + 14), cy + Math.sin(a) * (r + 14)); ctx.stroke(); }
    ctx.restore();
  }
  function irisMask(ctx, r, c) {
    const cx = (c || [960, 540])[0], cy = (c || [960, 540])[1];
    K.screen(ctx); ctx.save();
    ctx.beginPath(); ctx.rect(-10, -10, K.W + 20, K.H + 20); ctx.arc(cx, cy, Math.max(0, r), 0, K.TAU, true);
    ctx.fillStyle = P.ink; ctx.fill("evenodd"); ctx.restore();
    if (r > 2) ring(ctx, cx, cy, r);
  }
  const irisOut = (ctx, u, c) => { if (u > 0) irisMask(ctx, K.lerp(1250, 0, K.E.inOut(u)), c); };
  const irisIn = (ctx, u, c) => { if (u < 1) irisMask(ctx, K.lerp(0, 1250, K.E.inOut(u)), c); };
  return { DUR, waveOut, waveIn, irisOut, irisIn, WALL, ring };
})();
