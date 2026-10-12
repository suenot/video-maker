/* ============================================================
   EPISODE 68 TRANSITIONS (Surf Turtle). Each scene renders alone, so a transition is split in
   two halves that meet on a fully covered frame (turquoise sea):
     "wave"  surf-poster wipe: five printed colour screens (coral, orange, yellow, cream, sea) sweep
             across with wavy edges and brush outlines. End of scene N: they sweep in from the left
             until the sea screen covers the frame. Start of scene N+1: the covered frame is swept
             off to the right.
     "iris"  dial iris: the frame closes to deep teal inside a gauge ring (turquoise / mustard /
             coral arcs); the next scene opens it.
     "cut"   nothing.
   The runtime (69_runtime.js) applies them automatically over TR.DUR seconds.
   ============================================================ */
const TR = (function () {
  const P = K.P, DUR = 0.6;
  const COLS = [P.sea, P.cream, P.sun, P.sky1, P.sky0]; /* k = 0 is the top screen (sea) */
  const LAG = 0.07;
  const crestPts = (front, facing, k) => {
    const pts = [];
    for (let i = 0; i <= 16; i++) { const y = -40 + (i / 16) * 1160; pts.push([front + facing * (34 * Math.sin(y * 0.011 + K.now * 5 + k) + 18 * Math.sin(y * 0.029 + 1 + k)), y]); }
    return pts;
  };
  /* mode "out": screens cover [-400, front]; "in": they cover [front, 2400] */
  function screens(ctx, u, mode) {
    K.screen(ctx);
    const facing = mode === "out" ? 1 : -1, a0 = mode === "out" ? -260 : -340, a1 = mode === "out" ? 2260 : 2200;
    for (let k = 4; k >= 0; k--) {
      /* out: the coral screen leads and sea lags; in: sea leads and coral lags */
      const lag = (mode === "out" ? 4 - k : k) * LAG;
      const v = K.E.inOut(K.clamp((u - lag) / (1 - 4 * LAG), 0, 1));
      const front = K.lerp(a0, a1, v), crest = crestPts(front, facing, k);
      const far = facing > 0 ? -400 : 2400;
      K.shape(ctx, crest.concat([[far, 1140], [far, -60]]), { fill: COLS[k], w: k === 0 ? 0 : 5, stroke: P.ink, boil: 1.4, seed: 900 + k * 7, reg: false,
        shade: k === 1 ? { color: P.creamShade, dx: -facing * 40, dy: 0 } : undefined });
      if (k > 0) K.line(ctx, crest, { stroke: P.ink, w: 5, boil: 1.4, seed: 903 + k });
    }
  }
  function waveOut(ctx, u) { if (u <= 0) return; if (u >= 1) { K.screen(ctx); ctx.fillStyle = P.sea; ctx.fillRect(0, 0, K.W, K.H); return; } screens(ctx, u, "out"); }
  function waveIn(ctx, u) { if (u >= 1) return; if (u <= 0) { K.screen(ctx); ctx.fillStyle = P.sea; ctx.fillRect(0, 0, K.W, K.H); return; } screens(ctx, u, "in"); }
  function ring(ctx, cx, cy, r) {
    ctx.save(); ctx.lineWidth = 26; ctx.lineCap = "butt";
    [[P.calm, 0, 0.34], [P.sigma, 0.34, 0.67], [P.storm, 0.67, 1]].forEach((s) => {
      ctx.strokeStyle = s[0]; ctx.beginPath(); ctx.arc(cx, cy, r + 14, Math.PI * (0.75 + 1.5 * s[1]), Math.PI * (0.75 + 1.5 * s[2])); ctx.stroke();
    });
    ctx.lineWidth = 6; ctx.strokeStyle = P.cream; ctx.beginPath(); ctx.arc(cx, cy, r + 32, 0, K.TAU); ctx.stroke();
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
  return { DUR, waveOut, waveIn, irisOut, irisIn, ring };
})();
