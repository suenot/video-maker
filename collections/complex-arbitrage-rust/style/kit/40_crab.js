/* ============================================================
   KIT 40 CRAB: "Captain Ferrous", the arbitrage crab.
   Local space: feet on y = 0, body centre (0, -62), faces the viewer.
   Proportions (scale 1): body 132 x 84, eye stalks 34, eyes r 18,
   arms 2 x 34 (two-bone IK), claw 30 long. 6 legs, 22 tall.
   Pose state (all optional):
     squash     -1..1  (+ = squashed wide, - = stretched tall), volume kept
     lean       deg    whole body tilt around the feet
     hop        px     lift off the ground (legs dangle)
     look       [dx, dy] pupils, -1..1
     blink      0..1   (1 = closed)
     mouth      "smile" | "open" | "grin" | "o"
     clawL/R    { x, y, open 0..1, rot }  target of the claw tip in local space
     hat        true | false,  hatTip deg, hatLift px
     hold       "spyglass" in right claw
     legWalk    phase (radians) for walking legs; 0 = standing
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  const P = K.P, { clamp } = K;

  /* two-bone IK: shoulder S, target T, lengths a,b, bend +1/-1 -> elbow, end */
  K.ik2 = function (S, T, a, b, bend) {
    let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy);
    const dm = clamp(d, Math.abs(a - b) + 0.01, a + b - 0.01);
    if (d < 1e-6) { dx = 1; dy = 0; d = 1; }
    const ux = dx / d, uy = dy / d;
    const ca = clamp((a * a + dm * dm - b * b) / (2 * a * dm), -1, 1), A = Math.acos(ca) * (bend || 1);
    const ex = S[0] + a * (ux * Math.cos(A) - uy * Math.sin(A)), ey = S[1] + a * (ux * Math.sin(A) + uy * Math.cos(A));
    const tx = S[0] + ux * dm, ty = S[1] + uy * dm;
    return { elbow: [ex, ey], end: [tx, ty] };
  };
  /* outlined limb: ink stroke then colour stroke on top */
  K.limb = function (ctx, pts, w, color, seed) {
    K.line(ctx, pts, { stroke: P.ink, w: w + 7, boil: 1, seed, gap: 0 });
    K.line(ctx, pts, { stroke: color, w, boil: 1, seed, gap: 0 });
  };
  /* claw: two pincers around the tip, pointing along angle ang */
  K.claw = function (ctx, x, y, ang, open, s, seed, flip) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s * (flip || 1));
    const o = 0.15 + 0.55 * clamp(open, 0, 1);
    /* palm */
    K.shape(ctx, K.ellipsePts(-6, 0, 22, 18, 12), { fill: P.rust, w: 4.5, boil: 1, seed, shade: { color: P.rustDark, dx: 0, dy: -6 } });
    /* upper pincer (big) */
    ctx.save(); ctx.translate(8, -6); ctx.rotate(-o);
    K.shape(ctx, [[0, 4], [10, -10], [30, -12], [44, -2], [30, -2], [14, 6]], { fill: P.rust, w: 4.5, boil: 1, seed: seed + 1, shade: { color: P.rustLight, dx: 0, dy: 5 } });
    ctx.restore();
    /* lower pincer */
    ctx.save(); ctx.translate(8, 6); ctx.rotate(o * 0.8);
    K.shape(ctx, [[0, -4], [12, 8], [30, 8], [38, 0], [24, 0], [12, -4]], { fill: P.rust, w: 4.5, boil: 1, seed: seed + 2 });
    ctx.restore();
    ctx.restore();
  };

  K.crab = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk; /* keep volume */
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1);
    const seed = st.seed || 500;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    /* legs: 3 per side, feet on the ground, hips under the body */
    const bodyY = -62 * syk - hop;
    for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 3; i++) {
      const ph = (st.legWalk || 0) + i * 2.1 + (side > 0 ? Math.PI : 0);
      const lift = st.legWalk ? Math.max(0, Math.sin(ph)) * 10 : 0;
      const hx = side * (34 + i * 14) * sxk, hy = bodyY + 24 * syk;
      const air = clamp(hop / 40, 0, 1); /* in the air the legs tuck in under the body */
      const fx = side * (60 + i * 17 - 22 * air) + (st.legWalk ? Math.cos(ph) * 6 : 0), fy = -lift - hop - 16 * air;
      const kx = side * (68 + i * 15) * (0.85 + 0.15 * sxk), ky = hy - 6 + i * 3; /* knee arches above the hip, like a real crab */
      K.limb(ctx, [[hx, hy], [kx, ky], [fx, fy]], 7, P.rustDark, seed + side * 10 + i);
    }
    ctx.save(); ctx.translate(0, bodyY); ctx.scale(sxk, syk);
    /* eye stalks + eyes (behind the hat, in front of nothing) */
    const eyeY = -82 - (st.eyeUp || 0), eyes = [-1, 1].map((sd) => [sd * 44 + sd * 2 * Math.sin(K.now * 3 + sd), eyeY]);
    eyes.forEach((e, i) => K.limb(ctx, [[e[0] * 0.66, -34], [e[0] * 0.9, -56], [e[0], e[1] + 12]], 8, P.rust, seed + 30 + i));
    /* body */
    const body = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * K.TAU, c = Math.cos(a), sn = Math.sin(a);
      const ry = sn > 0 ? 36 : 44; /* flatter belly, domed back */
      body.push([c * 66 * (1 - 0.06 * Math.abs(sn)), sn * ry + (sn > 0 ? 0 : -4)]);
    }
    K.shape(ctx, body, { fill: P.rust, w: 5.5, boil: 1.4, seed: seed + 1, shade: { color: P.rustDark, dx: -10, dy: -12 }, hatch: { ang: 0.9, gap: 11, alpha: 0.2, color: P.rustDark } });
    /* shell spots + belly */
    K.shape(ctx, K.ellipsePts(0, 18, 38, 14, 12), { fill: P.belly, w: 3, boil: 1, seed: seed + 2, gap: 0.2 });
    [[-36, -22, 7], [-22, -32, 5], [38, -18, 6]].forEach((d, i) => K.shape(ctx, K.ellipsePts(d[0], d[1], d[2], d[2] * 0.8, 8), { fill: P.rustLight, stroke: null, w: 0, boil: 0.6, seed: seed + 3 + i }));
    /* cheeks */
    [-1, 1].forEach((sd, i) => { ctx.save(); ctx.globalAlpha = 0.5; K.shape(ctx, K.ellipsePts(sd * 40, 4, 10, 6, 8), { fill: "#ff8f7a", stroke: null, w: 0, boil: 0.5, seed: seed + 8 + i }); ctx.restore(); });
    /* mouth */
    const m = st.mouth || "smile";
    if (m === "smile") K.line(ctx, [[-22, 4], [-10, 14], [10, 14], [22, 4]], { stroke: P.ink, w: 4.5, boil: 0.9, seed: seed + 11, gap: 0 });
    else if (m === "grin") K.shape(ctx, [[-26, 2], [26, 2], [14, 20], [0, 23], [-14, 20]], { fill: "#7a2a1a", w: 4, boil: 0.9, seed: seed + 12, gap: 0 });
    else if (m === "open") K.shape(ctx, K.ellipsePts(0, 12, 14, 12, 10), { fill: "#7a2a1a", w: 4, boil: 0.9, seed: seed + 13, gap: 0 });
    else if (m === "o") K.shape(ctx, K.ellipsePts(0, 12, 7, 8, 8), { fill: "#7a2a1a", w: 3.5, boil: 0.7, seed: seed + 14, gap: 0 });
    /* hat (captain's cap) */
    if (st.hat !== false) {
      ctx.save(); ctx.translate(0, -40 - (st.hatLift || 0)); ctx.rotate(((st.hatTip || 0) * Math.PI) / 180); ctx.scale(0.82, 0.9);
      K.shape(ctx, [[-34, 0], [-30, -24], [-12, -34], [16, -34], [32, -24], [36, 0]], { fill: P.capNavy, w: 4.5, boil: 1, seed: seed + 20, shade: { color: P.capNavyDark, dx: -8, dy: 0 } });
      K.shape(ctx, [[-38, -2], [38, -2], [40, 8], [-40, 8]], { fill: P.paper, w: 4, boil: 0.8, seed: seed + 21 });
      K.shape(ctx, [[8, 6], [50, 8], [44, 16], [6, 13]], { fill: P.ink, w: 3, boil: 0.8, seed: seed + 22 });
      K.cog(ctx, 0, -16, 9, P.gold, seed + 23);
      ctx.restore();
    }
    /* eyes */
    eyes.forEach((e, i) => {
      const r = 18, ry = r * (1 - 0.92 * blink);
      K.shape(ctx, K.ellipsePts(e[0], e[1], r, Math.max(1.5, ry), 14), { fill: P.eye, w: 4, boil: 0.8, seed: seed + 40 + i, gap: 0 });
      if (blink < 0.6) {
        const px = e[0] + look[0] * 6, py = e[1] + look[1] * 5 * (1 - blink);
        K.shape(ctx, K.ellipsePts(px, py, 8.5, 9.5 * (1 - blink), 10), { fill: P.pupil, stroke: null, w: 0, boil: 0.5, seed: seed + 44 + i });
        K.shape(ctx, K.ellipsePts(px + 3, py - 4, 3, 3, 6), { fill: "#ffffff", stroke: null, w: 0, boil: 0.3, seed: seed + 46 + i });
      } else K.line(ctx, [[e[0] - r, e[1]], [e[0], e[1] + 3], [e[0] + r, e[1]]], { stroke: P.ink, w: 4, boil: 0.6, seed: seed + 48 + i, gap: 0 });
      /* brow (expressive) */
      const br = st.brow || 0;
      K.line(ctx, [[e[0] - 14, e[1] - 26 - br * 6 + (i ? -br : br) * 2], [e[0] + 14, e[1] - 26 - br * 6 + (i ? br : -br) * 2]], { stroke: P.ink, w: 4.5, boil: 0.6, seed: seed + 50 + i, gap: 0 });
    });
    /* "!" surprise mark (language-neutral) */
    if (st.exclaim > 0) {
      const a = K.E.back(K.clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(92, -128); ctx.rotate(0.25); ctx.scale(a, a);
      K.shape(ctx, [[-9, -52], [9, -52], [5, -10], [-5, -10]], { fill: P.gold, w: 4, boil: 1, seed: seed + 90, gap: 0 });
      K.shape(ctx, K.ellipsePts(0, 4, 7, 7, 8), { fill: P.gold, w: 4, boil: 1, seed: seed + 91, gap: 0 });
      ctx.restore();
    }
    ctx.restore();
    /* arms: shoulders at body sides, IK to claw targets (unscaled space so claws do not squash) */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const c = st["claw" + k] || { x: sd * 104, y: -40, open: 0.2 };
      const S = [sd * 58 * sxk, bodyY + 4 * syk];
      const r = K.ik2(S, [c.x, c.y - hop], 36, 34, sd > 0 ? 1 : -1);
      K.limb(ctx, [S, r.elbow, r.end], 9, P.rust, seed + 60 + sd);
      const ang = c.rot != null ? (c.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      if (k === "R" && st.hold === "spyglass") K.spyglass(ctx, r.end[0], r.end[1], ang, seed + 70);
      K.claw(ctx, r.end[0], r.end[1], ang, c.open == null ? 0.2 : c.open, 1.05, seed + 80 + sd * 5, sd < 0 ? -1 : 1);
    });
    ctx.restore();
  };
  K.spyglass = function (ctx, x, y, ang, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    K.shape(ctx, K.rectPts(-6, -9, 48, 18, 2), { fill: P.goldDark, w: 4, boil: 0.8, seed });
    K.shape(ctx, K.rectPts(38, -12, 34, 24, 2), { fill: P.gold, w: 4, boil: 0.8, seed: seed + 1 });
    K.shape(ctx, K.ellipsePts(73, 0, 5, 12, 8), { fill: "#bfe6ec", w: 3, boil: 0.5, seed: seed + 2 });
    K.lens = ctx.getTransform().transformPoint(new DOMPoint(76, 0)); /* screen point of the lens (iris transitions) */
    ctx.restore();
  };

  /* convenience: blink curve with seeded random blink times, 0..1 */
  K.blinkAt = function (t, seed) {
    let b = 0;
    for (let i = 0; i < 12; i++) {
      const tb = 0.8 + i * 1.9 + K.hash(i, seed || 7) * 1.1, d = t - tb;
      if (d > 0 && d < 0.16) b = Math.max(b, Math.sin((d / 0.16) * Math.PI));
    }
    return b;
  };
})(CK);
