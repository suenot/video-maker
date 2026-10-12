/* ============================================================
   EPISODE 68 TRANSITIONS between scenes: the diner's kitchen swing doors.
   Each scene renders alone, so a transition is split in two halves that meet on a fully
   covered frame:
     "wave"  scene N ends with the two teal swing doors shutting from the edges (back ease,
             a small bounce on the seam); scene N+1 starts shut and the doors swing open.
     "iris"  scene N ends with a chrome-rimmed round window (porthole) closing to ink;
             scene N+1 opens it from ink.
     "cut"   nothing.
   The runtime (69_runtime.js) applies them automatically over TR.DUR seconds.
   ============================================================ */
const TR = (function () {
  const P = K.P, DUR = 0.6, W = 1920, H = 1080, MID = 960;
  /* one door leaf covering x from `edge` (screen edge) to `seam` (towards the middle) */
  function leaf(ctx, edge, seam, sd, seed) {
    const x0 = Math.min(edge, seam), x1 = Math.max(edge, seam), w = x1 - x0; if (w < 2) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, -10, w, H + 20); ctx.clip();
    ctx.fillStyle = P.teal; ctx.fillRect(x0, -10, w, H + 20);
    ctx.fillStyle = K.dotPattern(ctx, "rgba(8,40,40,0.35)", 2.4, 11); ctx.fillRect(x0, -10, w, H + 20);
    /* diamond tufting, anchored to the seam so it travels with the door */
    ctx.strokeStyle = P.tealDark; ctx.lineWidth = 5; ctx.beginPath();
    const g = 150, base = seam - sd * 40;
    for (let d = -H - g; d < MID + g; d += g) {
      const xa = base - sd * d;
      ctx.moveTo(xa, 0); ctx.lineTo(xa + sd * H * 0.5, H); ctx.moveTo(xa, 0); ctx.lineTo(xa - sd * H * 0.5, H);
    }
    ctx.stroke();
    ctx.restore();
    /* chrome kick plate and push plate */
    const kx0 = Math.max(x0, sd > 0 ? seam - 880 : seam - 0), kx1 = x1;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, -10, w, H + 20); ctx.clip();
    K.chromeBar(ctx, x0 - 20, 880, w + 40, 220, seed);
    K.rule(ctx, [[x0 - 20, 140], [x1 + 20, 140]], { stroke: P.cherry, w: 24, boil: 1, seed: seed + 1 });
    /* porthole near the seam */
    const px = seam - sd * 240;
    K.dot(ctx, px, 360, 118, P.chrome, P.ink, 7, seed + 2);
    K.dot(ctx, px, 360, 88, P.night, P.ink, 5, seed + 3);
    K.glow(ctx, px - 20, 330, 60, "rgba(255,120,150,0.6)", 0.6);
    /* push plate + seam edge */
    K.shape(ctx, K.roundRectPts(seam - sd * 110 - 28, 560, 56, 190, 12), { fill: P.chrome, w: 5, boil: 0.8, seed: seed + 4, misreg: false });
    ctx.restore();
    K.rule(ctx, [[seam, -10], [seam, H + 10]], { stroke: P.ink, w: 10, boil: 0.8, seed: seed + 5 });
    K.rule(ctx, [[seam - sd * 14, -10], [seam - sd * 14, H + 10]], { stroke: P.cherry, w: 10, boil: 0.8, seed: seed + 6 });
  }
  /* c: 0 = open, 1 = shut. Back ease so the doors bounce on the seam */
  function doors(ctx, c) {
    K.screen(ctx);
    if (c <= 0) return;
    const e = c >= 1 ? 1 : Math.min(1.03, K.E.back(c, 1.1)), reach = MID * e;
    if (c >= 1) { ctx.fillStyle = P.teal; ctx.fillRect(0, 0, W, H); }
    leaf(ctx, -14, -14 + reach + 14, 1, 900);
    leaf(ctx, W + 14, W + 14 - reach - 14, -1, 920);
  }
  const waveOut = (ctx, u) => { if (u > 0) doors(ctx, Math.min(1, u * 1.0)); };
  const waveIn = (ctx, u) => { if (u < 1) doors(ctx, 1 - K.E.inOut(u)); };
  function ring(ctx, cx, cy, r) {
    ctx.save();
    ctx.lineWidth = 24; ctx.strokeStyle = P.chromeDark; ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 10; ctx.strokeStyle = P.chromeLight; ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r + 24, 0, K.TAU); ctx.stroke();
    ctx.restore();
  }
  function irisMask(ctx, r, c) {
    const cx = (c || [960, 540])[0], cy = (c || [960, 540])[1];
    K.screen(ctx); ctx.save();
    ctx.beginPath(); ctx.rect(-10, -10, W + 20, H + 20); ctx.arc(cx, cy, Math.max(0, r), 0, K.TAU, true);
    ctx.fillStyle = P.ink; ctx.fill("evenodd"); ctx.restore();
    if (r > 2) ring(ctx, cx, cy, r);
  }
  const irisOut = (ctx, u, c) => { if (u > 0) irisMask(ctx, K.lerp(1250, 0, K.E.inOut(u)), c); };
  const irisIn = (ctx, u, c) => { if (u < 1) irisMask(ctx, K.lerp(0, 1250, K.E.inOut(u)), c); };
  return { DUR, waveOut, waveIn, irisOut, irisIn, ring, doors };
})();
