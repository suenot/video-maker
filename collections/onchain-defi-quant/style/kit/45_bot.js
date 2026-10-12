/* ============================================================
   KIT 45 BOT: "Slyce", the sandwich bot (the MEV villain).
   A club-sandwich wedge on rubber-hose chrome legs, an olive toothpick
   antenna, a visor with one red scanning eye and a crooked grin.
   He carries two bread slices: the front-run slice and the back-run slice.
   Local space: feet on y = 0, body centre (0, -120).
   Pose: squash, lean, hop, look (-1..1, the visor eye scans), grin 0..1,
         armL/armR {x, y} targets, sliceL/sliceR (bool: hold a bread slice),
         walk (phase, rad), glow 0..1 (eye in the dark), shock 0..1 (caught!)
   ============================================================ */
var DK = window.DK || (window.DK = {});
(function (K) {
  const P = K.P, { clamp } = K;

  K.sandwichBot = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, seed = st.seed || 900, shock = clamp(st.shock || 0, 0, 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    const bodyY = -130 * syk - hop - shock * 20;
    /* legs: rubber hose, knees bend with the walk */
    [-1, 1].forEach((sd, i) => {
      const ph = (st.walk || 0) + (sd > 0 ? Math.PI : 0), lift = st.walk ? Math.max(0, Math.sin(ph)) * 16 : 0;
      const hip = [sd * 26, bodyY + 60], foot = [sd * 34 + (st.walk ? Math.cos(ph) * 18 : 0), -lift - hop];
      const knee = [sd * 44, (hip[1] + foot[1]) / 2];
      K.limb(ctx, [hip, knee, foot], 9, P.botMetal, seed + i * 3);
      K.shape(ctx, K.roundRectPts(foot[0] - 22 + sd * 6, foot[1] - 14, 44, 18, 8, 2), { fill: P.cherry, w: 4, boil: 0.8, seed: seed + 8 + i });
    });
    ctx.save(); ctx.translate(0, bodyY); ctx.scale(sxk, syk);
    /* toothpick antenna with an olive */
    const sway = Math.sin(K.now * 4) * 6 + shock * 10;
    K.rule(ctx, [[0, -78], [sway, -150]], { stroke: P.breadDark, w: 5, boil: 0.5, seed: seed + 20 });
    K.dot(ctx, sway, -150, 14, "#5b7a2a", P.ink, 3.5, seed + 21);
    K.dot(ctx, sway + 2, -150, 5, P.tomato, null, 0, seed + 22);
    /* wedge body: crust triangle with sandwich layers on the cut face */
    const tri = [[-96, 64], [0, -86], [96, 64]];
    K.shape(ctx, tri, { fill: P.bread, w: 6, boil: 1.3, seed: seed + 30, shade: { color: P.breadDark, dx: 16, dy: 0 } });
    ctx.save(); K.pathOf(ctx, tri, true); ctx.clip();
    [[P.lettuce, 18], [P.tomato, 36], [P.cheese, 50]].forEach((l, i) => K.line(ctx, [[-110, l[1]], [-40, l[1] - 6], [30, l[1] + 4], [110, l[1] - 4]], { stroke: l[0], w: 11, boil: 1, seed: seed + 31 + i, taper: 0 }));
    ctx.restore();
    K.shape(ctx, tri, { fill: null, stroke: P.crust, w: 7, boil: 1.3, seed: seed + 34 });
    /* visor with a scanning red eye */
    const look = st.look || 0, glow = st.glow || 0;
    K.shape(ctx, K.roundRectPts(-52, -36, 104, 34, 14, 2), { fill: P.ink, w: 4, boil: 0.8, seed: seed + 40, misreg: false });
    const ex = look * 26;
    if (glow > 0) K.glow(ctx, ex, -19, 70, "rgba(255,70,70,0.95)", glow);
    if (shock > 0.2) { /* caught: eye goes wide */
      K.shape(ctx, K.ellipsePts(ex, -19, 15, 15, 10), { fill: P.botEye, w: 3, boil: 0.5, seed: seed + 41, misreg: false });
      K.dot(ctx, ex, -19, 5, "#ffffff", null, 0, seed + 42);
    } else K.shape(ctx, K.roundRectPts(ex - 20, -24, 40, 10, 5, 2), { fill: P.botEye, stroke: null, w: 0, boil: 0.4, seed: seed + 43, misreg: false });
    K.line(ctx, [[-50, -42], [-10, -48 + (st.brow || 0) * 6]], { stroke: P.ink, w: 5, boil: 0.5, seed: seed + 44 }); /* one sly brow */
    /* crooked grin with teeth */
    const g = st.grin == null ? 0.7 : st.grin;
    if (shock > 0.2) K.shape(ctx, K.ellipsePts(6, 22, 12, 14, 10), { fill: "#5a1a20", w: 4, boil: 0.6, seed: seed + 50 });
    else {
      K.shape(ctx, [[-30, 14], [34, 6], [26, 14 + 16 * g], [-20, 20 + 10 * g]], { fill: "#5a1a20", w: 4, boil: 0.6, seed: seed + 51 });
      K.shape(ctx, [[-24, 15], [30, 8], [28, 14], [-22, 21]], { fill: P.eye, stroke: null, w: 0, boil: 0.3, seed: seed + 52, misreg: false });
    }
    ctx.restore();
    /* arms: rubber hose to targets, slices in hand */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const tg = st["arm" + k] || { x: sd * 120, y: bodyY + 30 };
      const S = [sd * 60 * sxk, bodyY + 20 * syk];
      const r = K.ik2(S, [tg.x, tg.y], 44, 40, sd > 0 ? 1 : -1);
      K.limb(ctx, [S, r.elbow, r.end], 8, P.botMetal, seed + 60 + sd);
      if (st["slice" + k]) K.breadSlice(ctx, r.end[0], r.end[1] - 6, 0.62, P.cherry, seed + 70 + sd * 4);
      K.dot(ctx, r.end[0], r.end[1], 13, P.cream, P.ink, 3.5, seed + 80 + sd); /* white cartoon glove */
    });
    ctx.restore();
  };
})(DK);
