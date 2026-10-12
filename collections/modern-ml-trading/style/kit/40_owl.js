/* ============================================================
   LAB KIT 40 OWL: "Professor Strix", the lab owl.
   Rubber-hose 1930s rig: egg body in a lab coat, a big swivelling head,
   pie-cut eyes behind round brass glasses, ear tufts, noodle arms with
   white four-finger gloves (two-bone IK, drawn as one smooth hose).
   Local space: feet on y = 0, faces the viewer. Height about 420 at scale 1.
   Pose state (all optional):
     squash   -1..1  (+ squashed wide, - stretched tall), volume kept
     lean     deg    whole-body tilt around the feet
     hop      px     lift off the ground (legs dangle)
     yaw      deg    head swivel: 0 = facing us, +-180 = back of the head
     tilt     deg    head tilt (curious)
     look     [dx, dy] pupils, -1..1
     blink    0..1 (both eyes), wink "L" | "R" (one eye closed)
     eyeUp    0..1   eye pop (surprise), tufts 0..1 tufts perk up
     brow     -1..1.5 (+ raised, - frown)
     mouth    "closed" | "open" | "o" | "smile" | "grin"
     wingL/R  { x, y, hand: "open"|"point"|"fist"|"thumb"|"hold", rot (deg, optional), hold: fn(ctx) }
     walk     phase (radians) for walking feet; 0 = standing
     exclaim  0..1   pops a brass "!" over the head
   ============================================================ */
var LK = window.LK || (window.LK = {});
(function (K) {
  const P = K.P, { clamp } = K;

  K.ik2 = function (S, T, a, b, bend) {
    let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy);
    const dm = clamp(d, Math.abs(a - b) + 0.01, a + b - 0.01);
    if (d < 1e-6) { dx = 1; dy = 0; d = 1; }
    const ux = dx / d, uy = dy / d;
    const ca = clamp((a * a + dm * dm - b * b) / (2 * a * dm), -1, 1), A = Math.acos(ca) * (bend || 1);
    const ex = S[0] + a * (ux * Math.cos(A) - uy * Math.sin(A)), ey = S[1] + a * (ux * Math.sin(A) + uy * Math.cos(A));
    return { elbow: [ex, ey], end: [S[0] + ux * dm, S[1] + uy * dm] };
  };

  /* ---------- white cartoon glove; origin at the wrist, +x along the forearm ---------- */
  K.glove = function (ctx, x, y, ang, hand, s, seed, flip) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s * (flip || 1));
    const G = { fill: P.glove, w: 3.6, boil: 0.6, shade: { color: P.gloveShade, dx: 0, dy: -5 } };
    const finger = (x0, y0, len, a, sd) => { ctx.save(); ctx.translate(x0, y0); ctx.rotate(a); K.shape(ctx, K.rrectPts(0, -7, len, 14, 7), Object.assign({}, G, { seed: sd })); ctx.restore(); };
    if (hand === "open") { [-0.75, -0.25, 0.25].forEach((a, i) => finger(26, (i - 1) * 9, 30, a, seed + i)); finger(16, 14, 22, 1.2, seed + 4); }
    if (hand === "point") finger(28, -6, 36, -0.05, seed + 1);
    if (hand === "thumb") finger(20, -10, 26, -1.45, seed + 2);
    K.shape(ctx, K.ellipsePts(24, 0, 20, 18, 12), Object.assign({}, G, { seed: seed + 5 })); /* palm */
    if (hand === "fist" || hand === "point" || hand === "thumb" || hand === "hold")
      for (let i = 0; i < 3; i++) K.line(ctx, [[34 + i * 1, -10 + i * 9], [42, -8 + i * 9]], { stroke: P.ink, w: 2.4, boil: 0.4, seed: seed + 10 + i });
    /* rolled cuff */
    K.shape(ctx, K.rrectPts(-6, -15, 14, 30, 6), Object.assign({}, G, { seed: seed + 8 }));
    ctx.restore();
  };

  K.owl = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], seed = st.seed || 700;
    const blink = clamp(st.blink || 0, 0, 1), up = clamp(st.eyeUp || 0, 0, 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    /* ---- legs + feet ---- */
    const hipY = -40 * syk - hop;
    [-1, 1].forEach((sd, i) => {
      const ph = (st.walk || 0) + (sd > 0 ? Math.PI : 0), lift = st.walk ? Math.max(0, Math.sin(ph)) * 16 : 0;
      const fx = sd * 40 + (st.walk ? Math.cos(ph) * 14 : 0), fy = -lift - hop * 0.6;
      K.hose(ctx, [[sd * 32, hipY], [sd * 38, (hipY + fy) / 2], [fx, fy]], 10, P.feet, seed + i * 3, 6);
      [-0.5, 0, 0.5].forEach((a, k) => K.line(ctx, [[fx, fy], [fx + Math.sin(a + sd * 0.35) * 24, fy + 4]], { stroke: P.ink, w: 13, boil: 0.5, seed: seed + 6 + k * 2 + i, taper: false }));
      [-0.5, 0, 0.5].forEach((a, k) => K.line(ctx, [[fx, fy], [fx + Math.sin(a + sd * 0.35) * 24, fy + 4]], { stroke: P.feet, w: 7, boil: 0.5, seed: seed + 7 + k * 2 + i, taper: false }));
    });
    /* ---- body (squash around the hips) ---- */
    ctx.save(); ctx.translate(0, hipY); ctx.scale(sxk, syk); ctx.translate(0, -hipY);
    const by = hipY - 95;
    /* feathered egg under the coat */
    K.shape(ctx, K.ellipsePts(0, by, 100, 112, 20), { fill: P.owl, w: 5.5, boil: 1.1, seed: seed + 20, shade: { color: P.owlDark, dx: -16, dy: -10 } });
    /* lab coat: a bell from the shoulders to the hem, open V on the chest */
    const coat = [[-74, by - 80], [-30, by - 92], [0, by - 30], [30, by - 92], [74, by - 80], [100, by - 10], [112, by + 98], [60, by + 112], [0, by + 104], [-60, by + 112], [-112, by + 98], [-100, by - 10]];
    K.shape(ctx, coat, { fill: P.coat, w: 5, boil: 1, seed: seed + 21, shade: { color: P.coatShade, dx: -18, dy: -6 }, dots: { gap: 9, alpha: 0.22 } });
    /* chest feathers in the V */
    K.shape(ctx, [[-28, by - 88], [28, by - 88], [0, by - 34]], { fill: P.disc, w: 3.5, boil: 0.7, seed: seed + 22 });
    for (let i = 0; i < 3; i++) K.line(ctx, [[-10 + i * 10 - 6, by - 72 + (i % 2) * 10], [-10 + i * 10, by - 66 + (i % 2) * 10], [-10 + i * 10 + 6, by - 72 + (i % 2) * 10]], { stroke: P.discDark, w: 2.5, boil: 0.4, seed: seed + 23 + i });
    /* lapels, buttons, pocket with pencils */
    K.line(ctx, [[-30, by - 92], [-10, by - 50], [-2, by - 32]], { stroke: P.ink, w: 3.5, boil: 0.6, seed: seed + 26 });
    K.line(ctx, [[30, by - 92], [10, by - 50], [2, by - 32]], { stroke: P.ink, w: 3.5, boil: 0.6, seed: seed + 27 });
    [by - 4, by + 40].forEach((yy, i) => K.dot(ctx, 4, yy, 6, P.brass, P.ink, 2.5, seed + 28 + i));
    K.line(ctx, [[-40, by - 46], [-38, by - 70]], { stroke: P.bad, w: 6, boil: 0.4, seed: seed + 30, taper: false });
    K.line(ctx, [[-52, by - 46], [-56, by - 66]], { stroke: P.glassDark, w: 6, boil: 0.4, seed: seed + 31, taper: false });
    K.shape(ctx, K.rectPts(-72, by - 50, 46, 34, 3), { fill: P.coat, w: 3.5, boil: 0.6, seed: seed + 32 });
    K.line(ctx, [[0, by - 30], [0, by + 104]], { stroke: P.ink, w: 3, boil: 0.5, seed: seed + 33 });
    ctx.restore();
    const shoulderY = hipY + (by - 70 - hipY) * syk, shoulderX = 86 * sxk;

    /* ---- head (swivels) ---- */
    const hx = 0, hy = hipY + (by - 168 - hipY) * syk;
    const yaw = ((st.yaw || 0) * Math.PI) / 180, cy = Math.cos(yaw), sy = Math.sin(yaw);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(((st.tilt || 0) * Math.PI) / 180); ctx.scale(sxk * 0.96 + 0.04, 1);
    /* tufts (behind the head outline) */
    const perk = clamp(st.tufts || 0, 0, 1);
    [-1, 1].forEach((sd, i) => {
      const bx = sd * 66 + sy * 22;
      const tip = [bx + sd * (40 + perk * 12), -112 - perk * 26];
      K.shape(ctx, [[bx - sd * 34, -74], [tip[0] - sd * 16, tip[1] + 10], tip, [tip[0] + sd * 2, tip[1] + 22], [bx + sd * 30, -60]], { fill: P.owl, w: 4.5, boil: 0.9, seed: seed + 40 + i, shade: { color: P.owlDark, dx: sd * 10, dy: 0 } });
    });
    K.shape(ctx, K.ellipsePts(0, 0, 128, 104, 22), { fill: P.owl, w: 5.5, boil: 1.1, seed: seed + 42, shade: { color: P.owlDark, dx: -14 + sy * 20, dy: -12 }, rim: 3 });
    const face = cy > 0.05;
    if (!face) { /* back of the head: feather chevrons */
      for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c++) {
        const fx = c * 34 - sy * 20, fy = -30 + r * 26;
        K.line(ctx, [[fx - 12, fy - 6], [fx, fy + 4], [fx + 12, fy - 6]], { stroke: P.owlDark, w: 3, boil: 0.5, seed: seed + 50 + r * 3 + c });
      }
    } else {
      const ex = (x0) => x0 * cy + sy * 74, ew = Math.max(0.15, cy);
      /* facial disc: two lobes + chin */
      /* heart-shaped disc: two lobes meeting in a feathered V between the eyes */
      const disc = [];
      for (let k = 0; k <= 24; k++) { const a = (k / 24) * K.TAU, c = Math.cos(a), n = Math.sin(a); disc.push([ex(c * 104 * (0.78 + 0.22 * Math.abs(c))), 10 + n * 82 + (n < 0 ? Math.pow(1 - Math.abs(c), 3) * 45 : 0)]); }
      K.shape(ctx, disc, { fill: P.disc, w: 3.8, boil: 0.8, seed: seed + 60, shade: { color: P.discDark, dx: 0, dy: -10 } });
      K.shape(ctx, [[ex(-30), -66], [ex(0), -30], [ex(30), -66], [ex(0), -48]], { fill: P.owl, w: 3.5, boil: 0.6, seed: seed + 61 });
      /* blush */
      [-1, 1].forEach((sd, i) => { ctx.save(); ctx.globalAlpha = 0.45; K.shape(ctx, K.ellipsePts(ex(sd * 78), 42, 14 * ew, 8, 8), { fill: P.blush, stroke: null, w: 0, boil: 0.4, seed: seed + 64 + i }); ctx.restore(); });
      /* eyes: pie-cut pupils */
      [-1, 1].forEach((sd, i) => {
        const cx = ex(sd * 40), eyY = -2 - up * 8, er = 33 * (1 + up * 0.22);
        const closed = Math.max(blink, (st.wink === "L" && sd < 0) || (st.wink === "R" && sd > 0) ? 1 : 0);
        const ry = er * 1.12 * (1 - 0.94 * closed);
        K.shape(ctx, K.ellipsePts(cx, eyY, er * ew, Math.max(2, ry), 16), { fill: P.eye, w: 4, boil: 0.6, seed: seed + 70 + i });
        if (closed < 0.6) {
          const px = cx + look[0] * 11 * ew, py = eyY + look[1] * 10 * (1 - closed), pr = 15 * (1 - up * 0.25);
          K.shape(ctx, K.ellipsePts(px, py + 4, pr * ew, pr * 1.35 * (1 - closed), 12), { fill: P.pupil, stroke: null, w: 0, boil: 0.4, seed: seed + 72 + i });
          /* the pie cut: an eye-white wedge, the 1930s highlight */
          ctx.save(); ctx.fillStyle = P.eye; ctx.beginPath(); ctx.moveTo(px + 2 * ew, py); ctx.arc(px + 2 * ew, py, pr * 1.2, -1.25, -0.55); ctx.closePath(); ctx.fill(); ctx.restore();
        } else K.line(ctx, [[cx - er * ew, eyY], [cx, eyY + 6], [cx + er * ew, eyY]], { stroke: P.ink, w: 4.5, boil: 0.5, seed: seed + 74 + i });
        /* brass spectacles */
        K.shape(ctx, K.ellipsePts(cx, eyY, (er + 9) * ew, er + 11, 16), { fill: null, stroke: P.brass, w: 7, boil: 0.6, seed: seed + 76 + i });
        K.shape(ctx, K.ellipsePts(cx, eyY, (er + 13) * ew, er + 15, 16), { fill: null, stroke: P.ink, w: 2.6, boil: 0.6, seed: seed + 78 + i });
        /* brows (feather tufts above the rims) */
        const br = st.brow || 0, byb = eyY - er - 22 - br * 9;
        const inner = br < 0 ? -br * 10 : 0;
        K.line(ctx, [[cx - 20 * ew, byb + (sd > 0 ? inner : 0)], [cx + 20 * ew, byb + (sd < 0 ? inner : 0)]], { stroke: P.owlDark, w: 9, boil: 0.5, seed: seed + 80 + i });
      });
      K.line(ctx, [[ex(-7), -6], [ex(7), -6]], { stroke: P.brass, w: 6, boil: 0.4, seed: seed + 84, taper: false }); /* bridge */
      /* beak */
      const m = st.mouth || "closed", bx = ex(0), open = m === "open" ? 18 : m === "o" ? 10 : m === "grin" ? 6 : 0;
      if (open > 0) K.shape(ctx, [[bx - 13 * ew, 40], [bx + 13 * ew, 40], [bx, 50 + open]], { fill: "#6b2a1c", w: 3, boil: 0.5, seed: seed + 85 });
      K.shape(ctx, [[bx - 15 * ew, 30], [bx, 16], [bx + 15 * ew, 30], [bx, 46 - open * 0.2]], { fill: P.beak, w: 3.8, boil: 0.5, seed: seed + 86, shade: { color: P.beakDark, dx: 0, dy: -6 } });
      if (open > 0) K.shape(ctx, [[bx - 11 * ew, 42 + open * 0.6], [bx + 11 * ew, 42 + open * 0.6], [bx, 54 + open]], { fill: P.beak, w: 3.4, boil: 0.5, seed: seed + 87 });
      if (m === "smile" || m === "grin") K.line(ctx, [[bx - 30 * ew, 50], [bx, 60], [bx + 30 * ew, 50]], { stroke: P.ink, w: 3.5, boil: 0.5, seed: seed + 88 });
    }
    ctx.restore();
    /* "!" (language neutral) */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(120, hy - 140); ctx.rotate(0.22); ctx.scale(a, a);
      K.shape(ctx, [[-10, -56], [10, -56], [5, -12], [-5, -12]], { fill: P.brassLight, w: 4, boil: 0.8, seed: seed + 90 });
      K.shape(ctx, K.ellipsePts(0, 4, 8, 8, 8), { fill: P.brassLight, w: 4, boil: 0.8, seed: seed + 91 });
      ctx.restore();
    }
    /* ---- noodle arms with gloves ---- */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const c = st["wing" + k] || { x: sd * 120, y: -70, hand: "open" };
      const S = [sd * shoulderX, shoulderY];
      /* rubber hose: past full reach the arm stretches instead of stopping short */
      const reach = Math.hypot(c.x - S[0], c.y - hop - S[1]), str = Math.max(1, reach / (144 * 0.97));
      const r = K.ik2(S, [c.x, c.y - hop], 74 * str, 70 * str, sd > 0 ? -1 : 1);
      K.hose(ctx, [S, r.elbow, r.end], 24 / Math.sqrt(str), P.coat, seed + 100 + sd * 4, 8);
      const ang = c.rot != null ? (c.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      if (c.hold) { ctx.save(); ctx.translate(r.end[0], r.end[1]); ctx.rotate(ang); ctx.translate(24, 0); c.hold(ctx); ctx.restore(); }
      K.glove(ctx, r.end[0], r.end[1], ang, c.hand || "open", 1.15, seed + 120 + sd * 10, sd < 0 ? -1 : 1);
    });
    ctx.restore();
  };

  /* blink curve with seeded blink times, 0..1 */
  K.blinkAt = function (t, seed) {
    let b = 0;
    for (let i = 0; i < 14; i++) {
      const tb = 0.9 + i * 2.1 + K.hash(i, seed || 7) * 1.0, d = t - tb;
      if (d > 0 && d < 0.18) b = Math.max(b, Math.sin((d / 0.18) * Math.PI));
    }
    return b;
  };
})(LK);
