/* ============================================================
   KIT 40 MOUSE: "Mr. Tick", the stationmaster mouse.
   Local space: feet on y = 0, faces the viewer. Scale 1 = 300 px tall
   (ears included). Head centre (0, -212), r ~64; body (coat) -48..-150.
   Pose state (all optional):
     squash   -1..1 (+ wide, - tall), volume kept     lean  deg around the feet
     hop      px lift (legs tuck)                     look  [dx, dy] pupils -1..1
     blink    0..1                                     brow  -1..1.5 (raised)
     mouth    "smile" | "grin" | "open" | "o" | "whistle"
     puff     0..1 cheeks puffed (blowing the whistle)
     eyeUp    px eye pop                               exclaim 0..1 ("!" pops)
     ear      -1..1 extra ear flick                    tail  phase (radians)
     handL/R  { x, y, open, hold: "watch" | "whistle" | "flag" | "thumb" | null, lid 0..1 }
     hatTip   deg, hatLift px                          legWalk phase (radians)
   ============================================================ */
var SK = window.SK || (window.SK = {});
(function (K) {
  const P = K.P, { clamp } = K;

  /* two-bone IK: shoulder S, target T, lengths a, b, bend +1/-1 -> elbow, end */
  K.ik2 = function (S, T, a, b, bend) {
    let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy);
    const dm = clamp(d, Math.abs(a - b) + 0.01, a + b - 0.01);
    if (d < 1e-6) { dx = 1; dy = 0; d = 1; }
    const ux = dx / d, uy = dy / d;
    const ca = clamp((a * a + dm * dm - b * b) / (2 * a * dm), -1, 1), A = Math.acos(ca) * (bend || 1);
    const ex = S[0] + a * (ux * Math.cos(A) - uy * Math.sin(A)), ey = S[1] + a * (ux * Math.sin(A) + uy * Math.cos(A));
    return { elbow: [ex, ey], end: [S[0] + ux * dm, S[1] + uy * dm] };
  };
  /* outlined tube: key line underlay then the colour on top */
  K.tube = function (ctx, pts, w, color, seed, smooth) {
    K.line(ctx, pts, { key: P.ink, w: w + 6, boil: 0.6, seed, smooth: smooth !== false });
    K.line(ctx, pts, { key: color, w, boil: 0.6, seed, smooth: smooth !== false });
  };

  /* small props, drawn in hand space (origin = palm centre) */
  K.pocketWatch = function (ctx, x, y, r, lid, t, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, 20), { fill: P.mustard, w: 2.5, smooth: true, boil: 0.4, seed, shade: { color: P.mustardDark, dx: r * 0.15, dy: r * 0.18 } });
    K.shape(ctx, K.ellipsePts(x, y, r * 0.74, r * 0.74, 18), { fill: P.cream, w: 2, smooth: true, boil: 0.3, seed: seed + 1 });
    const a = t * 2.2; /* the seconds hand sweeps */
    K.line(ctx, [[x, y], [x + Math.sin(a) * r * 0.6, y - Math.cos(a) * r * 0.6]], { w: 2.2, boil: 0, key: P.tomato });
    K.line(ctx, [[x, y], [x + r * 0.35, y - r * 0.2]], { w: 2.6, boil: 0 });
    K.dot(ctx, x, y - r - 5, 5, P.mustard, P.ink, 2, seed + 2);
    if (lid < 1) { /* lid swings open around the top hinge */
      const k = Math.cos(clamp(lid, 0, 1) * Math.PI * 0.5);
      if (k > 0.04) K.shape(ctx, K.ellipsePts(x, y - r * (1 - k), r, r * k, 18), { fill: P.mustardLight, w: 2.5, smooth: true, boil: 0.4, seed: seed + 3 });
    }
  };
  K.whistle = function (ctx, x, y, ang, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    K.shape(ctx, K.rrectPts(-6, -9, 40, 18, 6, 2), { fill: P.mustard, w: 2.5, seed, boil: 0.3, shade: { color: P.mustardDark, dx: 0, dy: 5 } });
    K.shape(ctx, K.ellipsePts(-6, 6, 14, 14, 14), { fill: P.mustard, w: 2.5, smooth: true, seed: seed + 1, boil: 0.3 });
    K.shape(ctx, K.rectPts(8, -9, 8, 6, 1), { fill: P.ink, key: null, seed: seed + 2, boil: 0.2, reg: 0 });
    ctx.restore();
  };

  K.glove = function (ctx, x, y, ang, s, opt, seed) {
    const o = opt || {};
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    /* cuff */
    K.shape(ctx, K.rrectPts(-16, -11, 10, 22, 3, 1), { fill: P.glove, w: 2.5, seed: seed + 1, boil: 0.4 });
    /* palm (a mitten with a thumb) */
    K.shape(ctx, K.ellipsePts(6, 0, 15, 13, 14), { fill: P.glove, w: 3, smooth: true, boil: 0.5, seed, shade: { color: P.gloveShade, dx: -3, dy: 4 } });
    if (o.hold === "thumb") K.shape(ctx, K.rrectPts(0, -30, 11, 24, 5, 2), { fill: P.glove, w: 3, seed: seed + 2, boil: 0.4 });
    else if (o.hold === "point") K.shape(ctx, K.rrectPts(12, -5, 26, 10, 5, 2), { fill: P.glove, w: 3, seed: seed + 2, boil: 0.4 });
    else K.shape(ctx, K.ellipsePts(4, -12, 6, 5, 8), { fill: P.glove, w: 2.5, smooth: true, seed: seed + 2, boil: 0.3 });
    ctx.restore();
  };

  K.mouse = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), seed = st.seed || 700;
    const t = K.now;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    const air = clamp(hop / 30, 0, 1), bodyBase = -44 * syk - hop;
    /* shadow */
    ctx.save(); ctx.globalAlpha *= 0.25 * (1 - air * 0.5);
    ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(0, 2, 62 * (1 - air * 0.3), 9, 0, 0, K.TAU); ctx.fill(); ctx.restore();
    /* tail: a long curl that sways */
    const tp = st.tail == null ? t * 2.2 : st.tail;
    const tail = [];
    for (let i = 0; i <= 10; i++) { const u = i / 10; tail.push([30 + u * 80 + Math.sin(tp + u * 3) * 10 * u, bodyBase - 12 - u * 70 + Math.cos(tp * 0.8 + u * 4) * 12 * u - Math.sin(u * Math.PI) * 26]); }
    K.tube(ctx, tail, 6, P.furDark, seed + 1);
    /* legs + shoes */
    [-1, 1].forEach((sd, i) => {
      const ph = (st.legWalk || 0) + (sd > 0 ? Math.PI : 0), lift = st.legWalk ? Math.max(0, Math.sin(ph)) * 12 : 0;
      const fx = sd * (24 - 8 * air) + (st.legWalk ? Math.cos(ph) * 8 : 0), fy = -lift - hop * 0.9 - 6 * air;
      K.tube(ctx, [[sd * 18 * sxk, bodyBase + 6], [fx, fy - 10]], 13, P.furDark, seed + 5 + i, false);
      K.shape(ctx, K.ellipsePts(fx + sd * 8, fy - 6, 20, 10, 14), { fill: P.ink, w: 2.5, smooth: true, boil: 0.4, seed: seed + 8 + i, reg: 0 });
    });
    /* ---- body (coat), squashes around its base ---- */
    ctx.save(); ctx.translate(0, bodyBase); ctx.scale(sxk, syk);
    const coat = [[-32, -106], [-44, -70], [-54, -18], [-58, 6], [-22, 2], [0, -6], [22, 2], [58, 6], [54, -18], [44, -70], [32, -106], [0, -112]];
    K.shape(ctx, coat, { fill: P.teal, w: 3.5, smooth: true, boil: 0.8, seed: seed + 10, shade: { color: P.tealDark, dx: 14, dy: 0 }, tone: { color: P.ink, gap: 9, r: 0, r2: 2.2, dir: 0, alpha: 0.22 } });
    /* shirt V + bow tie */
    K.shape(ctx, [[-20, -108], [0, -66], [20, -108]], { fill: P.cream, w: 2.5, seed: seed + 11, boil: 0.5 });
    K.shape(ctx, [[0, -100], [-16, -110], [-16, -90]], { fill: P.tomato, w: 2.2, seed: seed + 12, boil: 0.3 });
    K.shape(ctx, [[0, -100], [16, -110], [16, -90]], { fill: P.tomato, w: 2.2, seed: seed + 13, boil: 0.3 });
    /* buttons + pocket with the watch chain */
    [-56, -36, -16].forEach((yy, i) => K.dot(ctx, 0, yy, 5.5, P.mustard, P.ink, 2, seed + 14 + i));
    K.shape(ctx, K.rectPts(-40, -50, 22, 6, 1), { fill: P.tealDark, w: 2, seed: seed + 18, boil: 0.3 });
    ctx.restore();
    /* ---- head ---- */
    const headY = bodyBase - 112 * syk - 50;
    ctx.save(); ctx.translate(0, headY); ctx.scale(1 + sq * 0.12, 1 - sq * 0.12);
    const earA = Math.sin(t * 3.1) * 0.05 + (st.ear || 0) * 0.3;
    [-1, 1].forEach((sd, i) => {
      ctx.save(); ctx.translate(sd * 50, -46); ctx.rotate(sd * (0.25 + earA * (i ? 1 : -1)));
      K.shape(ctx, K.ellipsePts(0, -12, 44, 42, 22), { fill: P.fur, w: 3.5, smooth: true, boil: 0.7, seed: seed + 20 + i, shade: { color: P.furDark, dx: sd * 10, dy: 8 } });
      K.shape(ctx, K.ellipsePts(0, -10, 28, 27, 18), { fill: P.earPink, w: 2, smooth: true, boil: 0.5, seed: seed + 22 + i, tone: { color: P.tomatoDark, gap: 7, r: 0, r2: 2, dir: Math.PI / 2, alpha: 0.35 } });
      ctx.restore();
    });
    /* skull: slightly pear-shaped, wider at the cheeks */
    const head = [];
    for (let i = 0; i < 24; i++) { const a = (i / 24) * K.TAU, c = Math.cos(a), sn = Math.sin(a); head.push([c * (60 + 6 * Math.max(0, sn)), sn * (sn > 0 ? 54 : 58)]); }
    K.shape(ctx, head, { fill: P.fur, w: 3.5, smooth: true, boil: 0.8, seed: seed + 25, shade: { color: P.furDark, dx: 12, dy: 8 }, tone: { color: P.ink, gap: 8, r: 0, r2: 2, dir: Math.PI * 0.2, alpha: 0.2 } });
    /* muzzle */
    const pf = clamp(st.puff || 0, 0, 1);
    K.shape(ctx, K.ellipsePts(0, 24, 36 + pf * 10, 25 + pf * 4, 18), { fill: P.furLight, w: 2.5, smooth: true, boil: 0.5, seed: seed + 26 });
    /* cheeks */
    [-1, 1].forEach((sd, i) => { ctx.save(); ctx.globalAlpha *= 0.55 + pf * 0.3; K.shape(ctx, K.ellipsePts(sd * (40 + pf * 6), 18, 11 + pf * 7, 7 + pf * 5, 10), { fill: P.earPink, key: null, smooth: true, boil: 0.4, seed: seed + 27 + i, reg: 0 }); ctx.restore(); });
    /* whiskers */
    [-1, 1].forEach((sd) => [-6, 2, 10].forEach((dy, k) => K.line(ctx, [[sd * 26, 16 + dy * 0.3], [sd * (66 + k * 4), 8 + dy * 1.2 + Math.sin(t * 4 + k + sd) * 1.5]], { w: 1.8, boil: 0.5, seed: seed + 30 + k + (sd > 0 ? 5 : 0) })));
    /* mouth */
    const m = st.mouth || "smile";
    if (m === "smile") K.line(ctx, [[-14, 30], [-6, 37], [0, 33], [6, 37], [14, 30]], { w: 3, boil: 0.4, seed: seed + 40, smooth: true });
    else if (m === "grin") {
      K.shape(ctx, [[-20, 28], [20, 28], [12, 44], [0, 47], [-12, 44]], { fill: "#6e2a1c", w: 2.5, boil: 0.4, seed: seed + 41, smooth: true });
      K.shape(ctx, K.rectPts(-7, 28, 14, 9, 1), { fill: P.cream, w: 2, boil: 0.2, seed: seed + 42 });
    } else if (m === "open") K.shape(ctx, K.ellipsePts(0, 38, 11, 11, 12), { fill: "#6e2a1c", w: 2.5, smooth: true, boil: 0.4, seed: seed + 43 });
    else if (m === "o" || m === "whistle") K.shape(ctx, K.ellipsePts(0, 36, 5.5, 6.5, 10), { fill: "#6e2a1c", w: 2.2, smooth: true, boil: 0.3, seed: seed + 44 });
    /* nose */
    K.dot(ctx, 0, 14, 9, P.nose, P.ink, 2, seed + 45);
    K.dot(ctx, -3, 11, 2.6, P.cream, null, 0, seed + 46);
    /* eyes */
    [-1, 1].forEach((sd, i) => {
      const ex = sd * 23, ey = -12 - (st.eyeUp || 0), rx = 13 + (st.eyeUp ? 2 : 0), ry = 17 * (1 - 0.92 * blink) + (st.eyeUp ? 3 : 0);
      K.shape(ctx, K.ellipsePts(ex, ey, rx, Math.max(1.4, ry), 16), { fill: P.eye, w: 3, smooth: true, boil: 0.4, seed: seed + 50 + i, reg: 1.2 });
      if (blink < 0.6) {
        const px = ex + look[0] * 5, py = ey + 2 + look[1] * 6 * (1 - blink);
        K.shape(ctx, K.ellipsePts(px, py, 7, 9 * (1 - blink), 12), { fill: P.pupil, key: null, smooth: true, boil: 0.3, seed: seed + 52 + i, reg: 0 });
        K.shape(ctx, K.ellipsePts(px + 2.5, py - 3.5, 2.6, 2.6, 6), { fill: "#ffffff", key: null, smooth: true, boil: 0.2, seed: seed + 54 + i, reg: 0 });
      } else K.line(ctx, [[ex - rx, ey], [ex, ey + 4], [ex + rx, ey]], { w: 3, boil: 0.3, seed: seed + 56 + i, smooth: true });
      const br = st.brow || 0;
      K.line(ctx, [[ex - 12, ey - 24 - br * 7 + sd * br * 2], [ex + 12, ey - 24 - br * 7 - sd * br * 2]], { w: 3.5, boil: 0.3, seed: seed + 58 + i });
    });
    /* stationmaster cap */
    ctx.save(); ctx.translate(0, -52 - (st.hatLift || 0)); ctx.rotate(((st.hatTip || 0) * Math.PI) / 180);
    K.shape(ctx, [[-50, -2], [-56, -34], [-30, -46], [30, -46], [56, -34], [50, -2]], { fill: P.teal, w: 3.5, seed: seed + 60, boil: 0.6, shade: { color: P.tealDark, dx: 12, dy: 0 } });
    K.shape(ctx, K.rectPts(-50, -14, 100, 14, 3), { fill: P.mustard, w: 2.5, seed: seed + 61, boil: 0.4 });
    K.shape(ctx, [[-52, -2], [52, -2], [44, 12], [-44, 12]], { fill: P.ink, w: 2.5, seed: seed + 62, boil: 0.4, reg: 0 });
    K.star(ctx, 0, -30, 11, { seed: seed + 63, color: P.mustard, w: 1.8 });
    ctx.restore();
    /* "!" (language-neutral surprise) */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(96, -96); ctx.rotate(0.22); ctx.scale(a, a);
      K.shape(ctx, [[-9, -54], [9, -54], [5, -12], [-5, -12]], { fill: P.tomato, w: 3, seed: seed + 64 });
      K.shape(ctx, K.ellipsePts(0, 2, 7, 7, 10), { fill: P.tomato, w: 3, smooth: true, seed: seed + 65 });
      ctx.restore();
    }
    ctx.restore();
    /* ---- arms: shoulders at the coat's top corners, IK to hand targets ---- */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const h = st["hand" + k] || { x: sd * 62, y: -66 };
      const S = [sd * 34 * sxk, bodyBase - 100 * syk];
      const r = K.ik2(S, [h.x, h.y - hop], 36, 34, sd > 0 ? -1 : 1);
      K.tube(ctx, [S, r.elbow, r.end], 14, P.teal, seed + 70 + (sd > 0 ? 1 : 0), false);
      const ang = h.rot != null ? (h.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      if (h.hold === "watch") {
        /* chain from the coat pocket to the watch */
        const px = -29 * sxk, py = bodyBase - 48 * syk;
        const wx = r.end[0] + Math.cos(ang) * 12, wy = r.end[1] + Math.sin(ang) * 12 - 22;
        K.line(ctx, [[px, py], [(px + wx) / 2, Math.max(py, wy) + 18], [wx, wy + 18]], { key: P.mustardDark, w: 2.5, smooth: true, boil: 0.5, seed: seed + 80 });
        K.glove(ctx, r.end[0], r.end[1], ang, 1, h, seed + 84);
        K.pocketWatch(ctx, wx, wy, 20, h.lid == null ? 1 : h.lid, t, seed + 86);
      } else if (h.hold === "whistle") {
        K.whistle(ctx, r.end[0] + Math.cos(ang) * 8, r.end[1] + Math.sin(ang) * 8 - 6, h.wAng == null ? Math.PI : h.wAng, 1, seed + 90);
        K.glove(ctx, r.end[0], r.end[1], ang, 1, h, seed + 94);
      } else if (h.hold === "flag") {
        const fx = r.end[0], fy = r.end[1];
        K.line(ctx, [[fx, fy + 20], [fx, fy - 110]], { w: 4, seed: seed + 96, key: P.woodDark });
        const wv = Math.sin(t * 6) * 6;
        K.shape(ctx, [[fx, fy - 110], [fx + 70, fy - 96 + wv], [fx, fy - 70]], { fill: P.mustard, w: 3, seed: seed + 97, boil: 0.5 });
        K.glove(ctx, fx, fy, ang, 1, h, seed + 98);
      } else K.glove(ctx, r.end[0], r.end[1], ang, 1, h, seed + 100 + (sd > 0 ? 3 : 0));
    });
    ctx.restore();
  };

  /* seeded blink curve, about one blink per 1.9 s, 0..1 */
  K.blinkAt = function (t, seed) {
    let b = 0;
    for (let i = 0; i < 14; i++) {
      const tb = 0.8 + i * 1.9 + K.hash(i, seed || 7) * 1.1, d = t - tb;
      if (d > 0 && d < 0.16) b = Math.max(b, Math.sin((d / 0.16) * Math.PI));
    }
    return b;
  };
})(SK);
