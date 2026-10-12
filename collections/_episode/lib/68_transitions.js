/* ============================================================
   ENGINE 68 TRANSITIONS (generic fallback). A collection overrides this file
   by shipping its own <collection>/style/episode/68_transitions.js (same name
   wins), e.g. the crab's sea wall. Each scene renders alone, so a transition
   is split in two halves that meet on a fully covered frame:
     "wave"  a wavy wall sweeps in from the left until it covers the frame (end of
             scene N); scene N+1 starts covered and the wall sweeps off to the right.
     "iris"  a circle closes to ink (end of N) / opens from ink (start of N+1).
     "cut"   nothing.
   Uses only the shared ink API (K.shape, K.line, K.screen) and K.P.ink.
   Colours: TR.WALL (default P.seaMid || P.accent || P.ink), TR.EDGE (default P.paper || "#ffffff").
   ============================================================ */
const TR = (function () {
  const P = K.P, DUR = 0.6;
  const WALL = P.seaMid || P.accent || P.ink, EDGE = P.paper || P.cream || "#ffffff", INK = P.ink || "#1b1b1b";
  function wall(ctx, front, facing) {
    const crest = [];
    for (let i = 0; i <= 16; i++) { const y = -40 + (i / 16) * 1160; crest.push([front + facing * (46 * Math.sin(y * 0.01 + K.now * 5) + 22 * Math.sin(y * 0.027 + 1)), y]); }
    const far = facing > 0 ? -400 : 2400;
    K.shape(ctx, crest.concat([[far, 1140], [far, -60]]), { fill: WALL, stroke: INK, w: 6, boil: 2, seed: 900 });
    K.line(ctx, crest, { stroke: EDGE, w: 22, boil: 2.2, seed: 901, gap: 0.05 });
  }
  function fill(ctx) { ctx.fillStyle = WALL; ctx.fillRect(0, 0, K.W || 1920, K.H || 1080); }
  function waveOut(ctx, u) { if (u <= 0) return; K.screen(ctx); if (u >= 1) fill(ctx); wall(ctx, K.lerp(-260, 2260, K.E.inOut(u)), 1); }
  function waveIn(ctx, u) { if (u >= 1) return; K.screen(ctx); if (u <= 0) fill(ctx); wall(ctx, K.lerp(-340, 2200, K.E.inOut(u)), -1); }
  function irisMask(ctx, r, c) {
    const cx = (c || [960, 540])[0], cy = (c || [960, 540])[1];
    K.screen(ctx); ctx.save();
    ctx.beginPath(); ctx.rect(-10, -10, 1940, 1100); ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2, true);
    ctx.fillStyle = INK; ctx.fill("evenodd"); ctx.restore();
    if (r > 2) { ctx.save(); ctx.lineWidth = 14; ctx.strokeStyle = EDGE; ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  }
  const irisOut = (ctx, u, c) => { if (u > 0) irisMask(ctx, K.lerp(1250, 0, K.E.inOut(u)), c); };
  const irisIn = (ctx, u, c) => { if (u < 1) irisMask(ctx, K.lerp(0, 1250, K.E.inOut(u)), c); };
  return { DUR, waveOut, waveIn, irisOut, irisIn, WALL, EDGE };
})();
