/* ============================================================
   KIT 42 PARROT: "Pip", the first mate (episode co-host, host B).
   Local space: feet grip a perch at y = 0, faces the viewer (3/4 body).
   Proportions (scale 1): body 76 x 104, head r 36 at (0, -138),
   beak 26 long, wings 34 x 84, tail 70. About 0.8x the crab's height.
   Pose state (all optional):
     squash   -1..1   volume kept (like the crab)
     lean     deg     tilt around the feet
     hop      px      lift off the perch
     look     [dx, dy] pupils, -1..1
     blink    0..1
     talk     0..1    beak opening (narration sync)
     wingL/R  0..1    wing raise (1 = straight up, a "point" or a flap)
     brow     -1..1.5
     exclaim  0..1    "!" pop
     head     deg     head tilt (curious cock of the head)
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  const P = K.P, { clamp } = K;

  K.parrot = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), talk = clamp(st.talk || 0, 0, 1);
    const seed = st.seed || 700;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    /* tail: two long feathers hanging behind the perch */
    [[-10, 1], [8, -1]].forEach((f, i) => {
      const sw = Math.sin(K.now * 1.7 + i) * 4;
      K.shape(ctx, [[f[0] - 9, -40 - hop], [f[0] + 9, -40 - hop], [f[0] + 8 + sw, 36], [f[0] + sw, 58], [f[0] - 8 + sw, 36]], { fill: i ? P.parrotWing : P.crest, w: 4, boil: 1, seed: seed + i, shade: { color: i ? P.parrotWingDark : P.rustDark, dx: 5, dy: 0 } });
    });
    /* feet on the perch */
    [-1, 1].forEach((sd, i) => K.line(ctx, [[sd * 14, -14 - hop], [sd * 12, -2], [sd * 6, 4], [sd * 20, 4]], { stroke: P.inkSoft, w: 5, boil: 0.8, seed: seed + 5 + i, gap: 0 }));
    ctx.save(); ctx.translate(0, -16 - hop); ctx.scale(sxk, syk);
    /* wings (behind the body edge, raise around the shoulder) */
    const wing = (sd, up, ws) => {
      ctx.save(); ctx.translate(sd * 30, -78); ctx.rotate(-sd * up * 2.3);
      const pts = [[0, -10], [sd * 14, -6], [sd * 20, 24], [sd * 16, 56], [sd * 6, 76], [-sd * 4, 58], [-sd * 6, 18]];
      K.shape(ctx, pts, { fill: P.parrotDark, w: 4.5, boil: 1.1, seed: ws, shade: { color: P.parrotWing, dx: 0, dy: -24 } });
      K.line(ctx, [[sd * 2, 40], [sd * 10, 50], [sd * 14, 40]], { stroke: P.ink, w: 2.5, boil: 0.8, seed: ws + 1, gap: 0 });
      ctx.restore();
    };
    /* body */
    K.shape(ctx, K.ellipsePts(0, -54, 38, 54, 16), { fill: P.parrot, w: 5, boil: 1.3, seed: seed + 10, shade: { color: P.parrotDark, dx: -9, dy: -8 }, hatch: { ang: 0.9, gap: 11, alpha: 0.18, color: P.parrotDark } });
    K.shape(ctx, K.ellipsePts(3, -42, 24, 34, 12), { fill: P.parrotBelly, w: 3, boil: 1, seed: seed + 11, gap: 0.2 });
    wing(-1, clamp(st.wingL || 0, 0, 1), seed + 20);
    wing(1, clamp(st.wingR || 0, 0, 1), seed + 30);
    /* navy neckerchief (matches the captain's cap) */
    K.shape(ctx, [[-24, -100], [24, -100], [6, -80], [0, -70], [-6, -80]], { fill: P.capNavy, w: 3.5, boil: 0.9, seed: seed + 12, shade: { color: P.capNavyDark, dx: -5, dy: 0 } });
    /* head */
    ctx.save(); ctx.translate(0, -128); ctx.rotate(((st.head || 0) * Math.PI) / 180);
    /* crest: three feathers that wobble */
    for (let i = 0; i < 3; i++) {
      const a = -0.5 + i * 0.4 + Math.sin(K.now * 2.3 + i) * 0.06, L = 34 + i * 4;
      const bx = -6 + i * 6, by = -30;
      K.shape(ctx, [[bx - 5, by], [bx + Math.sin(a) * L - 3, by - Math.cos(a) * L], [bx + Math.sin(a) * L + 6, by - Math.cos(a) * L + 4], [bx + 6, by]], { fill: P.crest, w: 3.5, boil: 0.9, seed: seed + 40 + i });
    }
    K.shape(ctx, K.ellipsePts(0, -8, 38, 35, 16), { fill: P.parrot, w: 5, boil: 1.1, seed: seed + 13, shade: { color: P.parrotDark, dx: -7, dy: -7 } });
    /* face patch (pale, macaw-like) */
    [-1, 1].forEach((sd, i) => K.shape(ctx, K.ellipsePts(sd * 14, -12, 15, 14, 10), { fill: "#f5f2e6", stroke: null, w: 0, boil: 0.6, seed: seed + 50 + i }));
    /* eyes */
    [-1, 1].forEach((sd, i) => {
      const ex = sd * 14, ey = -14, r = 11, ry = r * (1 - 0.92 * blink);
      K.shape(ctx, K.ellipsePts(ex, ey, r, Math.max(1.5, ry), 12), { fill: P.eye, w: 3.5, boil: 0.7, seed: seed + 60 + i, gap: 0 });
      if (blink < 0.6) {
        const px = ex + look[0] * 4, py = ey + look[1] * 4 * (1 - blink);
        K.shape(ctx, K.ellipsePts(px, py, 5.5, 6.2 * (1 - blink), 8), { fill: P.pupil, stroke: null, w: 0, boil: 0.4, seed: seed + 62 + i });
        K.shape(ctx, K.ellipsePts(px + 2, py - 3, 2, 2, 6), { fill: "#ffffff", stroke: null, w: 0, boil: 0.2, seed: seed + 64 + i });
      } else K.line(ctx, [[ex - r, ey], [ex, ey + 2], [ex + r, ey]], { stroke: P.ink, w: 3.5, boil: 0.5, seed: seed + 66 + i, gap: 0 });
      const br = st.brow || 0;
      K.line(ctx, [[ex - 10, ey - 17 - br * 4 + sd * br * 2], [ex + 10, ey - 17 - br * 4 - sd * br * 2]], { stroke: P.ink, w: 3.5, boil: 0.5, seed: seed + 68 + i, gap: 0 });
    });
    /* beak: lower mandible drops with talk, hooked upper beak on top */
    ctx.save(); ctx.translate(0, 2); ctx.rotate(0.05 + talk * 0.32);
    K.shape(ctx, [[-9, 0], [9, 0], [6, 12 + talk * 4], [0, 15 + talk * 5], [-6, 12 + talk * 4]], { fill: P.beakDark, w: 3.5, boil: 0.7, seed: seed + 70, gap: 0 });
    ctx.restore();
    if (talk > 0.1) K.shape(ctx, K.ellipsePts(0, 8 + talk * 6, 6, 3 + talk * 4, 8), { fill: "#7a2a1a", stroke: null, w: 0, boil: 0.4, seed: seed + 71 });
    K.shape(ctx, [[-13, -4], [0, -10], [13, -4], [10, 10], [2, 24 - talk * 4], [-2, 14], [-10, 6]], { fill: P.beak, w: 4, boil: 0.8, seed: seed + 72, gap: 0, shade: { color: P.beakDark, dx: 4, dy: 0 } });
    /* "!" */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(52, -60); ctx.rotate(0.25); ctx.scale(a * 0.8, a * 0.8);
      K.shape(ctx, [[-9, -52], [9, -52], [5, -10], [-5, -10]], { fill: P.gold, w: 4, boil: 1, seed: seed + 90, gap: 0 });
      K.shape(ctx, K.ellipsePts(0, 4, 7, 7, 8), { fill: P.gold, w: 4, boil: 1, seed: seed + 91, gap: 0 });
      ctx.restore();
    }
    ctx.restore(); /* head */
    ctx.restore(); /* body */
    ctx.restore();
  };

  /* a wooden perch post (the parrot stands at its top, y - h) */
  K.perch = function (ctx, x, y, h, seed) {
    K.limb(ctx, [[x, y], [x, y - h]], 12, P.woodDark, seed || 730);
    K.limb(ctx, [[x - 44, y - h], [x + 44, y - h]], 10, P.wood, (seed || 730) + 1);
  };
})(CK);
