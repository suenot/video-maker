/* ============================================================
   KIT 40 RACCOON: "Tikki", the quick-witted raccoon merchant who reads the
   stacks. Grey fur, bandit mask, crimson fez with a swinging tassel, teal
   vest with saffron embroidery, ringed tail, an abacus.
   Local space: feet on y = 0, faces the viewer. Proportions (scale 1):
     body 112 x 124 (centre y -96), head 156 x 124 (centre y -210),
     ears at x +/-54, eyes in the mask at x +/-30, r 15,
     arms 2 x 34 (two-bone IK) from shoulders at (+/-50, -134), hands r 13,
     legs 46 tall, fez 70 tall, tail 150 long.
   Pose state (all optional):
     squash     -1..1  (+ = squashed wide, - = stretched tall), volume kept
     lean       deg    whole body tilt around the feet
     headTilt   deg    extra head tilt (follow-through)
     hop        px     lift off the ground (legs tuck)
     look       [dx, dy] pupils, -1..1
     blink      0..1   (1 = closed)
     mouth      "smile" | "open" | "shout" | "grin" | "o" | "smirk"
     brow       -1..1.5 (raised = surprise, negative = sly)
     handL/R    { x, y, pose: "open"|"fist"|"point"|"pinch", rot }  hand target, local space
     hold       "abacus" (left hand), beads [0..1 x 4] (bead rows slid left->right)
     fez, fezTip deg, fezLift px, tassel deg (secondary motion; default follows lean)
     tail       -1..1 sway, ear [-1..1] flick, exclaim 0..1 ("!")
     legWalk    phase (radians)
   ============================================================ */
var BK = window.BK || (window.BK = {});
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
  /* outlined limb: thick ink stroke, then the fur colour on top */
  K.limb = function (ctx, pts, w, color, seed) {
    K.line(ctx, pts, { stroke: P.ink, w: w + 8, boil: 0.9, seed, k: 0.8 });
    K.line(ctx, pts, { stroke: color, w, boil: 0.9, seed, k: 0.8 });
  };
  /* small black paw. pose: open (4 fingers fanned), fist, point (index out), pinch */
  K.paw = function (ctx, x, y, ang, pose, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    const fingers = pose === "fist" ? [] : pose === "point" ? [[0, 20]] : pose === "pinch" ? [[-0.25, 15], [0.25, 15]] : [[-0.75, 13], [-0.25, 16], [0.25, 16], [0.75, 13]];
    fingers.forEach((f, i) => { const a = f[0]; K.limb(ctx, [[6, 0], [6 + Math.cos(a) * f[1], Math.sin(a) * f[1]]], 6, P.mask, seed + 5 + i); });
    K.shape(ctx, K.ellipsePts(0, 0, 14, 12, 10), { fill: P.mask, w: 4, boil: 0.7, seed, k: 1, nicks: 0 });
    ctx.restore();
  };
  /* abacus prop: wooden frame, 4 rods, 5 beads per rod split by beads[r] (0..1) */
  K.abacus = function (ctx, x, y, ang, beads, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    const w = 150, h = 108;
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 3), { fill: null, stroke: P.ink, w: 16, boil: 0.8, seed, k: 0.1, nicks: 0 });
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 3), { fill: null, stroke: P.wood, w: 9, boil: 0.8, seed, k: 0.1, nicks: 0 });
    for (let r = 0; r < 4; r++) {
      const ry = -h / 2 + 20 + r * ((h - 40) / 3);
      K.line(ctx, [[-w / 2 + 6, ry], [w / 2 - 6, ry]], { stroke: P.ink, w: 2.5, boil: 0.5, seed: seed + 10 + r });
      const split = clamp((beads && beads[r]) || 0, 0, 1), n = 5, bw = 15;
      for (let b = 0; b < n; b++) {
        const moved = b < Math.round(split * n), lx = -w / 2 + 16 + b * bw, rx = w / 2 - 16 - (n - 1 - b) * bw;
        const bx = moved ? rx : lx;
        K.shape(ctx, K.ellipsePts(bx, ry, 8, 10, 8), { fill: r % 2 ? P.bid : P.ask, w: 2.5, boil: 0.5, seed: seed + 20 + r * 5 + b, k: 1, nicks: 0, reg: false });
      }
    }
    ctx.restore();
  };

  K.raccoon = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), seed = st.seed || 700;
    const lean = st.lean || 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate((lean * Math.PI) / 180);
    const air = clamp(hop / 40, 0, 1);
    /* tail (behind everything): ringed, curls up on the right */
    const tw = st.tail != null ? st.tail : Math.sin(K.now * 2.4) * 0.5;
    const tailPts = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8; tailPts.push([40 + u * 110 + Math.sin(u * 2.4 + tw) * 14 * u, (-56 - hop) * syk - u * 96 - Math.sin(u * 3) * 20 + tw * 30 * u * u]); }
    K.line(ctx, tailPts, { stroke: P.ink, w: 44, boil: 1, seed: seed + 1, k: 0.9 });
    K.line(ctx, tailPts, { stroke: P.fur, w: 34, boil: 1, seed: seed + 1, k: 0.9 });
    /* dark rings: short bands across the tail */
    for (let i = 1; i < 9; i += 2) {
      const a = tailPts[i], b = tailPts[i + 1] || tailPts[i], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, hw = 17 - i * 0.6;
      const mx = a[0] + dx * 0.5, my = a[1] + dy * 0.5, nx = -dy / L * hw, ny = dx / L * hw, tx = dx / L * 6, ty = dy / L * 6;
      K.shape(ctx, [[mx + nx - tx, my + ny - ty], [mx + nx + tx, my + ny + ty], [mx - nx + tx, my - ny + ty], [mx - nx - tx, my - ny - ty]], { fill: P.mask, stroke: null, w: 0, boil: 0.6, seed: seed + 2 + i, k: 0.2, reg: false });
    }
    K.shape(ctx, K.ellipsePts(tailPts[8][0], tailPts[8][1], 14, 14, 8), { fill: P.mask, stroke: null, w: 0, boil: 0.6, seed: seed + 12, k: 1, reg: false });
    /* legs */
    const hipY = (-48 - hop) * syk;
    [-1, 1].forEach((sd, i) => {
      const ph = (st.legWalk || 0) + (sd > 0 ? Math.PI : 0), lift = st.legWalk ? Math.max(0, Math.sin(ph)) * 12 : 0;
      const fx = sd * (28 - 8 * air) + (st.legWalk ? Math.cos(ph) * 8 : 0), fy = -lift - hop + 10 * air;
      K.limb(ctx, [[sd * 24 * sxk, hipY], [sd * 30 * sxk, (hipY + fy) / 2], [fx, fy - 8]], 14, P.furDark, seed + 10 + i);
      K.shape(ctx, K.ellipsePts(fx + sd * 6, fy - 6, 17, 9, 10), { fill: P.mask, w: 4, boil: 0.7, seed: seed + 12 + i, k: 1, nicks: 0 });
    });
    /* body (squash about the hip) */
    ctx.save(); ctx.translate(0, -hop); ctx.scale(sxk, syk);
    const body = [];
    for (let i = 0; i < 18; i++) { const a = (i / 18) * K.TAU, c = Math.cos(a), sn = Math.sin(a); body.push([c * (sn > 0 ? 58 : 48 + 8 * sn), -96 + sn * 64]); }
    K.shape(ctx, body, { fill: P.fur, w: 6, boil: 1.3, seed: seed + 20, k: 0.8, shade: { color: P.furDark, dx: 12, dy: -6 }, gouge: { ang: -1.2, side: 1, alpha: 0.35, color: P.furDark, gap: 12, len: 0.3 } });
    K.shape(ctx, K.ellipsePts(0, -84, 30, 44, 12), { fill: P.muzzle, w: 4, boil: 1, seed: seed + 21, k: 1 });
    /* vest: two embroidered panels */
    [-1, 1].forEach((sd, i) => {
      const v = [[sd * 20, -150], [sd * 52, -140], [sd * 58, -70], [sd * 40, -40], [sd * 22, -56], [sd * 30, -110]];
      K.shape(ctx, v, { fill: P.vest, w: 5, boil: 1, seed: seed + 22 + i, k: 0.35, pattern: { kind: "dots", color: P.vestTrim, gap: 18, w: 5 }, shade: { color: P.tealDark, dx: sd * -8, dy: 0 } });
      K.line(ctx, [v[0], v[5], v[4]], { stroke: P.vestTrim, w: 4, boil: 0.8, seed: seed + 24 + i });
    });
    ctx.restore();
    /* head (rides the squash with a little lag) */
    const headY = (-212 - hop) * syk + (st.headDrop || 0);
    ctx.save(); ctx.translate(0, headY); ctx.rotate(((st.headTilt || 0) * Math.PI) / 180); ctx.scale(sxk * 0.98 + 0.02, syk * 0.98 + 0.02);
    /* ears (flick) */
    const ef = st.ear || 0;
    [-1, 1].forEach((sd, i) => {
      ctx.save(); ctx.translate(sd * 52, -44); ctx.rotate(sd * (0.25 + 0.2 * (sd > 0 ? ef : -ef)));
      K.shape(ctx, [[-22, 6], [0, -44], [22, 6]], { fill: P.fur, w: 5, boil: 1, seed: seed + 30 + i, k: 0.5 });
      K.shape(ctx, [[-11, 2], [0, -26], [11, 2]], { fill: P.mask, stroke: null, w: 0, boil: 0.7, seed: seed + 32 + i, k: 0.5 });
      ctx.restore();
    });
    /* head shape with jagged cheek ruff (woodcut tufts) */
    const head = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * K.TAU, c = Math.cos(a), sn = Math.sin(a), tuft = sn > -0.2 && Math.abs(c) > 0.55 ? (i % 2 ? 14 : 0) : 0;
      head.push([c * (78 + tuft), sn * (sn > 0 ? 58 : 64) + (sn > 0 ? 6 : 0)]);
    }
    K.shape(ctx, head, { fill: P.fur, w: 6, boil: 1.3, seed: seed + 34, k: 0.45, shade: { color: P.furDark, dx: 10, dy: -8 } });
    /* light brow patches above the mask */
    [-1, 1].forEach((sd, i) => K.shape(ctx, K.ellipsePts(sd * 30, -30 - (st.brow || 0) * 5, 24, 10, 10, sd * -0.25), { fill: P.furLight, stroke: null, w: 0, boil: 0.6, seed: seed + 36 + i, reg: false }));
    /* bandit mask */
    const br = st.brow || 0;
    const mask = [[-74, 4], [-60, -18], [-34, -16 - br * 4], [-8, -8], [0, -2], [8, -8], [34, -16 - br * 4], [60, -18], [74, 4], [50, 20], [24, 18], [0, 10], [-24, 18], [-50, 20]];
    K.shape(ctx, mask, { fill: P.mask, w: 4, boil: 1, seed: seed + 38, k: 0.5, nicks: 0 });
    /* muzzle + nose */
    K.shape(ctx, K.ellipsePts(0, 30, 36, 26, 12), { fill: P.muzzle, w: 4.5, boil: 1, seed: seed + 40, k: 1 });
    K.shape(ctx, [[-12, 12], [12, 12], [0, 24]], { fill: P.nose, w: 3.5, boil: 0.6, seed: seed + 41, k: 0.9, nicks: 0, reg: false });
    /* cheeks */
    [-1, 1].forEach((sd, i) => { ctx.save(); ctx.globalAlpha = 0.55; K.shape(ctx, K.ellipsePts(sd * 46, 30, 10, 6, 8), { fill: P.cheek, stroke: null, w: 0, boil: 0.5, seed: seed + 42 + i, reg: false }); ctx.restore(); });
    /* mouth */
    const m = st.mouth || "smile";
    if (m === "smile") K.line(ctx, [[-14, 34], [-6, 42], [0, 38], [6, 42], [14, 34]], { stroke: P.ink, w: 4, boil: 0.7, seed: seed + 44 });
    else if (m === "smirk") K.line(ctx, [[-10, 38], [4, 40], [16, 31]], { stroke: P.ink, w: 4, boil: 0.7, seed: seed + 44 });
    else if (m === "grin") K.shape(ctx, [[-20, 32], [20, 32], [12, 48], [0, 51], [-12, 48]], { fill: P.mouthIn, w: 4, boil: 0.7, seed: seed + 45, k: 0.6, nicks: 0 });
    else if (m === "open") K.shape(ctx, K.ellipsePts(0, 42, 12, 11, 10), { fill: P.mouthIn, w: 4, boil: 0.7, seed: seed + 46, k: 1, nicks: 0 });
    else if (m === "shout") { K.shape(ctx, [[-22, 30], [22, 30], [18, 58], [0, 70], [-18, 58]], { fill: P.mouthIn, w: 4.5, boil: 0.9, seed: seed + 47, k: 0.7, nicks: 0 }); K.shape(ctx, K.ellipsePts(0, 60, 10, 6, 8), { fill: P.cheek, stroke: null, w: 0, boil: 0.5, seed: seed + 48, reg: false }); }
    else if (m === "o") K.shape(ctx, K.ellipsePts(0, 42, 7, 8, 8), { fill: P.mouthIn, w: 3.5, boil: 0.6, seed: seed + 49, k: 1, nicks: 0 });
    /* eyes inside the mask */
    [-1, 1].forEach((sd, i) => {
      const ex = sd * 30, ey = -2 - (st.eyeUp || 0) * 0.4, r = 15 * (1 + (st.eyeUp || 0) * 0.012), ry = r * (1 - 0.92 * blink);
      K.shape(ctx, K.ellipsePts(ex, ey, r, Math.max(1.5, ry), 12), { fill: P.eye, w: 3.5, boil: 0.6, seed: seed + 50 + i, k: 1, nicks: 0, reg: false });
      if (blink < 0.6) {
        const px = ex + look[0] * 5, py = ey + look[1] * 5 * (1 - blink);
        K.shape(ctx, K.ellipsePts(px, py, 7.5, 8.5 * (1 - blink), 10), { fill: P.pupil, stroke: null, w: 0, boil: 0.4, seed: seed + 52 + i, reg: false });
        K.shape(ctx, K.ellipsePts(px + 2.5, py - 3.5, 2.6, 2.6, 6), { fill: "#ffffff", stroke: null, w: 0, boil: 0.3, seed: seed + 54 + i, reg: false });
      } else K.line(ctx, [[ex - r, ey], [ex, ey + 4], [ex + r, ey]], { stroke: P.eye, w: 4, boil: 0.5, seed: seed + 56 + i });
    });
    /* fez + tassel */
    if (st.fez !== false) {
      ctx.save(); ctx.translate(4, -56 - (st.fezLift || 0)); ctx.rotate(((st.fezTip || 0) * Math.PI) / 180 + 0.08);
      const fez = [[-34, 4], [-26, -58], [26, -58], [34, 4]];
      K.shape(ctx, fez, { fill: P.fez, w: 5, boil: 1, seed: seed + 60, k: 0.15, shade: { color: P.fezDark, dx: 10, dy: 0 } });
      K.line(ctx, [[-32, -6], [32, -6]], { stroke: P.saffron, w: 6, boil: 0.7, seed: seed + 61 });
      K.shape(ctx, K.ellipsePts(0, -58, 26, 6, 10), { fill: P.fezDark, w: 4, boil: 0.7, seed: seed + 62, k: 1, nicks: 0 });
      /* tassel: secondary motion (lags the body, swings past) */
      const ta = st.tassel != null ? st.tassel : Math.sin(K.now * 3.1) * 14 - lean * 1.6;
      const tr = (ta * Math.PI) / 180, L = 46;
      const tx = 6 + Math.sin(tr) * L, ty = -62 + Math.cos(tr) * L;
      K.line(ctx, [[0, -62], [3 + Math.sin(tr) * L * 0.5, -62 + Math.cos(tr) * L * 0.5 - 4], [tx, ty]], { stroke: P.tassel, w: 4, boil: 0.6, seed: seed + 63 });
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(-tr);
      K.shape(ctx, [[-5, -2], [5, -2], [11, 22], [-11, 22]], { fill: P.tassel, w: 3, boil: 0.6, seed: seed + 64, k: 0.2, nicks: 0, reg: false });
      ctx.restore();
      ctx.restore();
    }
    /* "!" surprise mark (language-neutral) */
    if (st.exclaim > 0) {
      const a = K.E.back(K.clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(-112, -96); ctx.rotate(-0.25); ctx.scale(a, a);
      K.shape(ctx, [[-10, -56], [10, -56], [5, -12], [-5, -12]], { fill: P.saffron, w: 4.5, boil: 0.9, seed: seed + 90, k: 0.1 });
      K.shape(ctx, K.ellipsePts(0, 4, 8, 8, 8), { fill: P.saffron, w: 4.5, boil: 0.9, seed: seed + 91, k: 1 });
      ctx.restore();
    }
    ctx.restore();
    /* arms: IK to hand targets (unscaled space so hands keep their size) */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const h = st["hand" + k] || { x: sd * 74, y: -70, pose: "open" };
      const S = [sd * 48 * sxk, (-134 - hop) * syk];
      const r = K.ik2(S, [h.x, h.y - hop], 36, 34, sd > 0 ? -1 : 1);
      const ang = h.rot != null ? (h.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      if (k === "L" && st.hold === "abacus") K.abacus(ctx, r.end[0] - 36, r.end[1] - 10, -0.12 + (h.rot != null ? 0 : 0), st.beads, 0.9, seed + 100);
      K.limb(ctx, [S, r.elbow, r.end], 13, P.fur, seed + 70 + sd);
      K.paw(ctx, r.end[0], r.end[1], ang, h.pose || "open", 1, seed + 80 + sd * 5);
    });
    ctx.restore();
  };

  /* convenience: blink curve with seeded blink times (about 1 per 2 s), 0..1 */
  K.blinkAt = function (t, seed) {
    let b = 0;
    for (let i = 0; i < 14; i++) {
      const tb = 0.9 + i * 1.8 + K.hash(i, seed || 7) * 1.0, d = t - tb;
      if (d > 0 && d < 0.15) b = Math.max(b, Math.sin((d / 0.15) * Math.PI));
    }
    return b;
  };
})(BK);
