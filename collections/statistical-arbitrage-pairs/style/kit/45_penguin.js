/* ============================================================
   VAUDEVILLE KIT 45 PENGUIN: the act. Two tap-dancing partners (a pair
   of assets) tied waist to waist by a spring (the spread).
     "top"    penguin wears a top hat   = the RICH leg (sell it)
     "boater" penguin wears a boater    = the CHEAP leg (buy it)
   Local space: feet on y = 0, faces the viewer. Scale 1 = 270 px tall.
   Pose (all optional):
     squash, lean (deg), hop (px), look [dx, dy], blink, beak "shut" | "open"
     flipL/flipR  deg: 0 = hanging at the side, 90 = straight out, 160 = up
     tapL/tapR    0..1 foot lift (toe-tap), hat "top" | "boater" | null,
     hatTip deg, heart 0..1 (a gold heart pops above), seed
   Waist anchor for the spring: K.penguinWaist(x, y, s, side).
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;

  K.penguinWaist = function (x, y, s, side, st) {
    const sq = clamp((st && st.squash) || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk, hop = (st && st.hop) || 0;
    return [x + side * 70 * sxk * s, y + (-20 - hop - 100 * syk) * s];
  };

  K.penguin = function (ctx, x, y, s, st) {
    st = st || {};
    const seed = st.seed || 900;
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0];
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    /* tap shoes (behind the body) */
    [["L", -1], ["R", 1]].forEach(([k, sd], i) => {
      const lift = clamp(st["tap" + k] || 0, 0, 1);
      ctx.save(); ctx.translate(sd * 30, -6 - lift * 26 - hop * 0.6); ctx.rotate(sd * (-0.1 - lift * 0.5));
      K.hose(ctx, [[0, -26], [0, -4]], 10, P.ink, seed + i, 6);
      K.shape(ctx, K.ellipsePts(sd * 14, 2, 30, 12, 14), { fill: P.ink, w: 4.5, boil: 0.6, seed: seed + 2 + i, shine: { dx: 3, dy: 4, s: 0.7, a: 0.9 } });
      K.shape(ctx, K.roundPts(-13, -16, 26, 12, 4), { fill: P.paper, w: 3.5, boil: 0.4, seed: seed + 4 + i });
      ctx.restore();
    });
    ctx.save(); ctx.translate(0, -hop - 20); ctx.scale(sxk, syk);
    /* flippers behind the body edge */
    [["L", -1], ["R", 1]].forEach(([k, sd], i) => {
      const a = ((st["flip" + k] == null ? 8 : st["flip" + k]) * Math.PI) / 180;
      ctx.save(); ctx.translate(sd * 58, -150); ctx.rotate(-sd * a);
      K.shape(ctx, [[sd * -4, -6], [sd * 16, 0], [sd * 20, 60], [sd * 10, 104], [sd * 2, 60]], { fill: P.ink, w: 5, boil: 0.7, seed: seed + 10 + i, shine: { dx: 0, dy: 6, s: 0.7, a: 0.45 } });
      ctx.restore();
    });
    /* body: egg, black; white belly + face */
    const body = []; for (let i = 0; i < 20; i++) { const a = (i / 20) * K.TAU, sn = Math.sin(a); body.push([Math.cos(a) * (sn > 0 ? 76 : 64 - 10 * Math.max(0, -sn)), -112 + sn * (sn > 0 ? 96 : 128)]); }
    K.shape(ctx, body, { fill: P.ink, w: 5.5, boil: 1, seed: seed + 20, shine: { dx: 10, dy: 12, s: 0.84, a: 0.55 } });
    const belly = []; for (let i = 0; i < 18; i++) { const a = (i / 18) * K.TAU, sn = Math.sin(a); belly.push([Math.cos(a) * (sn > 0 ? 56 : 46), -82 + sn * (sn > 0 ? 70 : 84)]); }
    K.shape(ctx, belly, { fill: P.paper, w: 4, boil: 0.8, seed: seed + 21, shade: { color: P.g5, dx: 8, dy: -6 } });
    /* face mask (white spectacles patch) */
    K.shape(ctx, [[-46, -196], [-20, -214], [0, -204], [20, -214], [46, -196], [40, -170], [0, -160], [-40, -170]], { fill: P.paper, w: 4, boil: 0.7, seed: seed + 22 });
    K.pieEye(ctx, -17, -190, 11, 17, look, st.blink, seed + 30);
    K.pieEye(ctx, 17, -190, 11, 17, look, st.blink, seed + 40);
    /* beak */
    if (st.beak === "open") {
      K.shape(ctx, [[-14, -168], [14, -168], [0, -150]], { fill: P.g4, w: 4, boil: 0.5, seed: seed + 50 });
      K.shape(ctx, [[-11, -150], [11, -150], [0, -136]], { fill: P.g4, w: 4, boil: 0.5, seed: seed + 51 });
    } else K.shape(ctx, [[-15, -168], [15, -168], [0, -142]], { fill: P.g4, w: 4, boil: 0.5, seed: seed + 52, shade: { color: P.g3, dx: 0, dy: -6 } });
    /* bow tie */
    K.shape(ctx, [[0, -128], [-20, -140], [-22, -116]], { fill: P.paper, w: 3.5, boil: 0.4, seed: seed + 55 });
    K.shape(ctx, [[0, -128], [20, -140], [22, -116]], { fill: P.paper, w: 3.5, boil: 0.4, seed: seed + 56 });
    K.dot(ctx, 0, -128, 6, P.paper, P.ink, 3, seed + 57);
    /* hat */
    if (st.hat) {
      ctx.save(); ctx.translate(4, -232); ctx.rotate(((st.hatTip || 0) + 8) * Math.PI / 180);
      if (st.hat === "top") {
        K.shape(ctx, [[-30, 0], [-26, -78], [26, -78], [30, 0]], { fill: P.ink, w: 5, boil: 0.6, seed: seed + 60, shine: { dx: 6, dy: 0, s: 0.8, a: 0.7 } });
        K.shape(ctx, K.roundPts(-29, -20, 58, 14, 3), { fill: P.g3, w: 3.5, boil: 0.4, seed: seed + 61 });
        K.shape(ctx, K.roundPts(-48, -4, 96, 12, 6), { fill: P.ink, w: 4.5, boil: 0.5, seed: seed + 62 });
      } else {
        K.shape(ctx, K.roundPts(-34, -30, 68, 30, 6), { fill: P.g5, w: 4.5, boil: 0.6, seed: seed + 63, shade: { color: P.g4, dx: -8, dy: 0 } });
        K.shape(ctx, K.roundPts(-35, -18, 70, 11, 3), { fill: P.ink, w: 3, boil: 0.4, seed: seed + 64 });
        K.shape(ctx, K.ellipsePts(0, 0, 60, 9, 16), { fill: P.g5, w: 4.5, boil: 0.5, seed: seed + 65 });
      }
      ctx.restore();
    }
    ctx.restore();
    /* gold heart (the pair reunites) */
    if (st.heart > 0) {
      const a = K.E.back(clamp(st.heart, 0, 1), 2.6), hy = -320 - 30 * clamp(st.heart, 0, 1);
      ctx.save(); ctx.translate(st.heartX || 0, hy); ctx.scale(a, a);
      const hp = []; for (let i = 0; i < 24; i++) { const u = (i / 24) * K.TAU; hp.push([16 * Math.pow(Math.sin(u), 3) * 2.2, -(13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u)) * 2.2]); }
      K.shape(ctx, hp, { fill: P.gold, w: 5, boil: 0.6, seed: seed + 70, shade: { color: P.goldDark, dx: -6, dy: -6 } });
      ctx.restore();
    }
    ctx.restore();
  };
})(VK);
