/* ============================================================
   KIT 40 TURTLE (Surf Turtle kit): "Siggy", the laid-back surfer sea turtle.
   Local space: feet on y = 0, faces the viewer, stands upright like a
   cartoon surfer. Scale 1: about 250 px tall, shell 150 px wide.
   Parts: stubby back flippers (two-bone IK legs), brown shell rim behind a
   cream plastron with segment lines, green head on a stretchy neck,
   coral-framed sunglasses, front flippers on two-bone IK (pose = where the
   flipper tip goes, never rotate segments by hand).
   Pose state (all optional):
     squash   -1..1  (+ wide, - tall), volume kept; feet stay planted
     lean     deg    whole-body tilt around the feet (surf stance)
     hop      px     lift off the ground (legs tuck)
     turn     -1..1  head/face turns left/right (features slide)
     headTilt deg    head roll;  neck 0..1 stretch (curious / surprised)
     look     [dx, dy] pupils -1..1 (seen only when the shades are off the eyes)
     blink    0..1
     shades   0 = on the eyes, >0 = slid down the snout (px, eyes peek over), <0 = up on the head
     mouth    "smile" | "grin" | "open" | "o" | "flat" | "wow"
     brow     -1..1.5 (raised = surprise, negative = focus)
     flipL/R  { x, y, rot? } flipper tip target (local px)
     footL/R  { x, y } foot target (local px); default stance
     exclaim  0..1 a "!" pops above the head
   ============================================================ */
var VK = window.VK || (window.VK = {});
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
    return { elbow: [ex, ey], end: [S[0] + ux * dm, S[1] + uy * dm] };
  };
  /* limb: ink brush underlay + colour brush on top (a soft rubbery tube) */
  K.limb = function (ctx, pts, w, color, seed) {
    K.line(ctx, pts, { stroke: P.ink, w: w + 8, boil: 0.7, seed, brush: { taper: 0.85, swell: 0.12 } });
    K.line(ctx, pts, { stroke: color, w, boil: 0.7, seed, brush: { taper: 0.85, swell: 0.12 } });
  };
  /* front flipper paddle at (x,y) pointing along ang */
  K.flipper = function (ctx, x, y, ang, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    const pts = [[-6, -10], [14, -16], [40, -12], [58, -2], [44, 8], [16, 13], [-6, 10]];
    K.shape(ctx, pts, { fill: P.skin, w: 4.5, boil: 0.8, seed, shade: { color: P.skinDark, dx: 0, dy: -6 } });
    [[18, -3, 4], [32, -2, 3]].forEach((d, i) => K.shape(ctx, K.ellipsePts(d[0], d[1], d[2], d[2] * 0.8, 6), { fill: P.skinDark, stroke: null, w: 0, boil: 0.3, seed: seed + i + 1, reg: false }));
    ctx.restore();
  };

  K.turtle = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), turn = clamp(st.turn || 0, -1, 1);
    const seed = st.seed || 700;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    const air = clamp(hop / 40, 0, 1);
    const hipY = -64 * syk - hop;
    /* back flippers (legs): stubby two-bone IK to the feet */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const f = st["foot" + k] || { x: sd * 46, y: 0 };
      const H = [sd * 26 * sxk, hipY + 6];
      const T = [lerp(f.x, sd * 30, air), lerp(f.y, -hop - 6, air)];
      const r = K.ik2(H, T, 34, 34, sd > 0 ? -1 : 1);
      K.limb(ctx, [H, r.elbow, r.end], 22, P.skin, seed + 2 + sd);
      ctx.save(); ctx.translate(r.end[0], r.end[1]); ctx.scale(sd, 1);
      K.shape(ctx, [[-10, -8], [14, -10], [34, -2], [30, 6], [-8, 6]], { fill: P.skin, w: 4.5, boil: 0.7, seed: seed + 5 + sd, shade: { color: P.skinDark, dx: 0, dy: -5 } });
      ctx.restore();
    });
    /* body group (squash + stretch about the hips) */
    ctx.save(); ctx.translate(0, hipY); ctx.scale(sxk, syk);
    /* shell rim behind the body */
    const shell = K.ellipsePts(0, -54, 78, 74, 22);
    K.shape(ctx, shell, { fill: P.shell, w: 6, boil: 1.1, seed: seed + 10, shade: { color: P.shellDark, dx: -14, dy: -12, dots: true, cell: 9, density: 0.8 } });
    /* scute ticks along the rim */
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.92 + i * 0.145), c = Math.cos(a), sn = Math.sin(a);
      K.line(ctx, [[c * 62, -54 + sn * 58], [c * 78, -54 + sn * 74]], { stroke: P.shellDark, w: 4, boil: 0.5, seed: seed + 20 + i });
      K.dot(ctx, Math.cos(a + 0.07) * 70, -54 + Math.sin(a + 0.07) * 66, 5, P.shellLight, null, 0, seed + 30 + i);
    }
    /* plastron (belly plates) */
    const pl = K.ellipsePts(0, -48, 54, 62, 20);
    K.shape(ctx, pl, { fill: P.belly, w: 5, boil: 1, seed: seed + 40, shade: { color: P.creamShade, dx: -10, dy: -8 }, shine: { color: "#fff7e4", a0: 3.7, a1: 4.4 } });
    [-74, -50, -26].forEach((yy, i) => K.line(ctx, [[-44 + i * 2, yy], [0, yy + 6], [44 - i * 2, yy]], { stroke: P.sandDark, w: 3.5, boil: 0.6, seed: seed + 41 + i }));
    K.line(ctx, [[0, -104], [0, 8]], { stroke: P.sandDark, w: 3.5, boil: 0.6, seed: seed + 45 });
    /* neck + head */
    const neck = 1 + 0.6 * (st.neck || 0), headY = -132 - 22 * neck, tx = turn * 10;
    K.limb(ctx, [[0, -96], [tx * 0.5, -112 - 6 * neck], [tx, headY + 26]], 34, P.skin, seed + 50);
    ctx.save(); ctx.translate(tx, headY); ctx.rotate(((st.headTilt || 0) * Math.PI) / 180);
    const head = K.ellipsePts(0, 0, 50, 42, 18);
    K.shape(ctx, head, { fill: P.skin, w: 5.5, boil: 1, seed: seed + 60, shade: { color: P.skinDark, dx: -8, dy: -10 }, shine: { color: P.skinLight, a0: 3.6, a1: 4.3, w: 6 } });
    /* sea-turtle head plates */
    [[-26, -26, 9], [-8, -32, 7], [12, -30, 8], [30, -20, 6]].forEach((d, i) => K.shape(ctx, K.ellipsePts(d[0] + turn * 6, d[1], d[2], d[2] * 0.7, 7), { fill: P.skinDark, stroke: null, w: 0, boil: 0.4, seed: seed + 61 + i, reg: false, alpha: 0.85 }));
    const fx = turn * 14; /* features slide with the turn */
    /* cheeks */
    [-1, 1].forEach((sd, i) => K.shape(ctx, K.ellipsePts(fx + sd * 34, 14, 9, 6, 8), { fill: P.cheek, stroke: null, w: 0, boil: 0.3, seed: seed + 66 + i, alpha: 0.65, reg: false }));
    /* mouth: a beak-ish wide smile */
    const m = st.mouth || "smile";
    if (m === "smile") K.line(ctx, [[fx - 24, 14], [fx - 10, 24], [fx + 10, 24], [fx + 26, 12]], { stroke: P.ink, w: 4.5, boil: 0.6, seed: seed + 70 });
    else if (m === "flat") K.line(ctx, [[fx - 16, 20], [fx + 16, 19]], { stroke: P.ink, w: 4.5, boil: 0.5, seed: seed + 71 });
    else if (m === "grin") { K.shape(ctx, [[fx - 28, 12], [fx + 28, 12], [fx + 16, 30], [fx, 33], [fx - 16, 30]], { fill: "#7a2f2a", w: 4, boil: 0.6, seed: seed + 72, reg: false }); K.shape(ctx, [[fx - 22, 13], [fx + 22, 13], [fx + 18, 19], [fx - 18, 19]], { fill: P.cream, stroke: null, w: 0, boil: 0.3, seed: seed + 73, reg: false }); }
    else if (m === "open") K.shape(ctx, K.ellipsePts(fx, 22, 15, 12, 10), { fill: "#7a2f2a", w: 4, boil: 0.6, seed: seed + 74, reg: false });
    else if (m === "o") K.shape(ctx, K.ellipsePts(fx, 22, 7, 8, 8), { fill: "#7a2f2a", w: 3.5, boil: 0.5, seed: seed + 75, reg: false });
    else if (m === "wow") K.shape(ctx, [[fx - 18, 12], [fx + 18, 12], [fx + 12, 34], [fx - 12, 34]], { fill: "#7a2f2a", w: 4, boil: 0.6, seed: seed + 76, reg: false });
    /* eyes (only visible when the shades move) */
    const shades = st.shades || 0, eyeY = -10, eyes = [-1, 1].map((sd) => [fx + sd * 20, eyeY]);
    if (Math.abs(shades) > 2) eyes.forEach((e, i) => {
      const r = 13 + (st.eyeUp || 0), ry = r * (1 - 0.92 * blink);
      K.shape(ctx, K.ellipsePts(e[0], e[1], r, Math.max(1.5, ry), 12), { fill: P.eye, w: 4, boil: 0.5, seed: seed + 80 + i, reg: false });
      if (blink < 0.6) {
        const px = e[0] + look[0] * 5, py = e[1] + look[1] * 4;
        K.shape(ctx, K.ellipsePts(px, py, 6.5, 7.5 * (1 - blink), 9), { fill: P.pupil, stroke: null, w: 0, boil: 0.3, seed: seed + 84 + i, reg: false });
        K.shape(ctx, K.ellipsePts(px + 2.5, py - 3, 2.4, 2.4, 6), { fill: "#ffffff", stroke: null, w: 0, boil: 0.2, seed: seed + 86 + i, reg: false });
      }
    });
    /* sunglasses: coral frame, dark teal lenses with a turquoise shine stripe */
    ctx.save(); ctx.translate(0, shades > 0 ? Math.min(shades, 22) : shades);
    if (shades < 0) ctx.scale(1, 0.92);
    const lens = (sd) => [[fx + sd * 4, -22], [fx + sd * 38, -24], [fx + sd * 40, -10], [fx + sd * 32, 2], [fx + sd * 10, 2], [fx + sd * 4, -10]];
    [-1, 1].forEach((sd, i) => {
      K.shape(ctx, lens(sd), { fill: P.shades, stroke: P.shadesFrame, w: 6, boil: 0.5, seed: seed + 90 + i, reg: false });
      K.line(ctx, [[fx + sd * 14, -4], [fx + sd * 26, -18]], { stroke: P.shadesShine, w: 4, boil: 0.4, seed: seed + 92 + i });
    });
    K.line(ctx, [[fx - 5, -16], [fx, -19], [fx + 5, -16]], { stroke: P.shadesFrame, w: 5, boil: 0.3, seed: seed + 94 });
    [-1, 1].forEach((sd, i) => K.line(ctx, [[fx + sd * 39, -20], [sd * 50, -14]], { stroke: P.shadesFrame, w: 4.5, boil: 0.3, seed: seed + 95 + i }));
    ctx.restore();
    /* brows above the shades (expressive even with the shades on) */
    const br = st.brow || 0;
    eyes.forEach((e, i) => {
      const yy = -30 - Math.max(0, shades < 0 ? -shades * 0.2 : 0) - br * 7;
      K.line(ctx, [[e[0] - 12, yy + (i ? -br : br) * 2], [e[0] + 12, yy + (i ? br : -br) * 2]], { stroke: P.ink, w: 5, boil: 0.4, seed: seed + 98 + i });
    });
    /* "!" pops above the head */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(60, -78); ctx.rotate(0.25); ctx.scale(a, a);
      K.shape(ctx, [[-9, -54], [9, -54], [5, -12], [-5, -12]], { fill: P.sigma, w: 4, boil: 0.6, seed: seed + 110 });
      K.shape(ctx, K.ellipsePts(0, 2, 7, 7, 8), { fill: P.sigma, w: 4, boil: 0.6, seed: seed + 111 });
      ctx.restore();
    }
    ctx.restore(); /* head */
    ctx.restore(); /* body group */
    /* front flippers (arms) in front, unsquashed space */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const c = st["flip" + k] || { x: sd * 92, y: -70 };
      const S = [sd * 46 * sxk, hipY - 74 * syk];
      const r = K.ik2(S, [c.x, c.y - hop], 40, 38, sd > 0 ? 1 : -1);
      K.limb(ctx, [S, r.elbow, r.end], 20, P.skin, seed + 120 + sd);
      const ang = c.rot != null ? (c.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      K.flipper(ctx, r.end[0] - Math.cos(ang) * 8, r.end[1] - Math.sin(ang) * 8, ang, 1, seed + 130 + sd * 5);
    });
    ctx.restore();
  };
  function lerp(a, b, u) { return a + (b - a) * u; }

  /* seeded blink curve, about one blink per 2.1 s */
  K.blinkAt = function (t, seed) {
    let b = 0;
    for (let i = 0; i < 14; i++) {
      const tb = 0.7 + i * 2.1 + K.hash(i, seed || 7) * 1.2, d = t - tb;
      if (d > 0 && d < 0.16) b = Math.max(b, Math.sin((d / 0.16) * Math.PI));
    }
    return b;
  };
  /* where the board goes under a surfing turtle: feet span, so call surfboard at (x - len*0.5, y) */
  K.surfStance = { footL: { x: -58, y: 0 }, footR: { x: 52, y: 0 }, lean: 0 };
})(VK);
