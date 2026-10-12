/* ============================================================
   KIT 42 PIGEON: "Dash", the telegraph clerk (host B, the curious co-host).
   A plump grey pigeon in a mustard waistcoat, a green celluloid eyeshade,
   tomato sleeve garters and a pencil behind the head. 3/4 view: the beak
   points to the `face` side, so place him facing Mr. Tick.
   Local space: feet on y = 0. Scale 1 = 260 px tall (eyeshade included).
   Head centre (face*peck, -204), r ~44; body -30..-170; shoulders y -142.
   Pose state (all optional):
     face     +1 beak to the right (default), -1 to the left
     squash   -1..1 (+ wide, - tall), volume kept     lean  deg around the feet
     hop      px lift (legs tuck)                     look  [dx, dy] pupils -1..1
     blink    0..1                                     brow  -1..1.5 (raised)
     talk     0..1 loudness: opens the beak            viseme "a" | "e" | "o" | "m" (auto when omitted)
     peck     px head thrust along `face` (the pigeon head bob)
     head     deg head tilt                            nod  px head dip
     exclaim  0..1 "!" pops                            ponder 0..1 "?" pops
     wingL/R  { x, y, open 0..1, hold: "point" | "ticket" | "tape" | null, draw(ctx, x, y, ang), rot }
              wing-hand targets in local space (IK, reach ~64 from the shoulder)
   ============================================================ */
var SK = window.SK || (window.SK = {});
(function (K) {
  const P = K.P, { clamp } = K;

  /* a railway ticket card held in a wing or lying on a counter (hand space) */
  K.ticket = function (ctx, x, y, ang, s, opt, seed) {
    const o = Object.assign({ label: "No 7", color: P.tomato }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    K.shape(ctx, K.rrectPts(-30, -19, 60, 38, 4, 1), { fill: P.cream, w: 2.5, seed, boil: 0.3, shade: { color: P.creamShade, dx: 0, dy: 6 } });
    K.shape(ctx, K.rectPts(-30, -19, 13, 38, 1), { fill: o.color, w: 2, seed: seed + 1, boil: 0.2 });
    K.dot(ctx, 18, -8, 3.5, P.ink, null, 0, seed + 2);
    K.text(ctx, o.label, 6, 6, { size: 13, font: K.FONT.mono, fill: P.ink });
    ctx.restore();
  };

  /* telegraph tape: a cream strip with dots and dashes that hangs from (x, y)
     and curls on the floor at y0 (local px). `u` 0..1 unrolls it. */
  K.tape = function (ctx, x, y, y0, u, seed) {
    const pts = [], n = 16, len = clamp(u == null ? 1 : u, 0, 1);
    for (let i = 0; i <= n; i++) {
      const k = (i / n) * len, yy = y + (y0 - y) * Math.min(1, k * 1.3), curl = Math.max(0, k * 1.3 - 1) / 0.3;
      pts.push([x + Math.sin(k * 5 + seed) * 8 + curl * 40, yy - Math.sin(curl * Math.PI) * 14]);
    }
    if (len <= 0.02) return;
    K.line(ctx, pts, { key: P.ink, w: 15, boil: 0.5, seed, smooth: true });
    K.line(ctx, pts, { key: P.cream, w: 10, boil: 0.5, seed, smooth: true });
    for (let i = 1; i < pts.length - 1; i++) {
      const dash = K.hash(i, seed) > 0.5, [px, py] = pts[i];
      if (dash) K.line(ctx, [[px - 3, py], [px + 3, py]], { w: 2.6, boil: 0, key: P.ink });
      else K.dot(ctx, px, py, 1.8, P.ink, null, 0, seed + i);
    }
  };

  /* wing-hand: three primary feathers fanned around `ang`, drawn at the IK end */
  K.wingHand = function (ctx, x, y, ang, h, seed) {
    const op = clamp(h.open == null ? 0.35 : h.open, 0, 1), pt = h.hold === "point";
    const spread = pt ? 0.32 : 0.22 + 0.55 * op;
    const fe = pt ? [[-1, 24], [0, 50], [1, 24]] : [[-1, 32], [0, 37], [1, 32]];
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    fe.forEach(([k, len], i) => {
      ctx.save(); ctx.rotate(k * spread);
      K.shape(ctx, K.rrectPts(-4, -7, len, 14, 7, 2), { fill: i === 1 ? P.pigeonLight : P.pigeon, w: 2.5, seed: seed + i, boil: 0.4, shade: { color: P.pigeonDark, dx: 0, dy: 4 } });
      ctx.restore();
    });
    K.shape(ctx, K.ellipsePts(-2, 0, 13, 12, 12), { fill: P.pigeon, w: 2.5, smooth: true, seed: seed + 4, boil: 0.4 });
    ctx.restore();
  };

  K.pigeon = function (ctx, x, y, s, st) {
    st = st || {};
    const f = st.face === -1 ? -1 : 1;
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), seed = st.seed || 900;
    const t = K.now;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    const air = clamp(hop / 30, 0, 1), bodyBase = -30 * syk - hop;
    /* shadow */
    ctx.save(); ctx.globalAlpha *= 0.25 * (1 - air * 0.5);
    ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(0, 2, 58 * (1 - air * 0.3), 8, 0, 0, K.TAU); ctx.fill(); ctx.restore();
    /* legs + three-toed feet (toes point to the face side) */
    [-1, 1].forEach((sd, i) => {
      const fx = sd * (16 - 6 * air), fy = -hop * 0.9 - 4 * air;
      K.tube(ctx, [[sd * 14 * sxk, bodyBase + 4], [fx, fy - 4]], 8, P.leg, seed + 1 + i, false);
      [-0.5, 0, 0.5].forEach((a, k) => K.line(ctx, [[fx, fy - 2], [fx + f * Math.cos(a) * 16 - (k === 0 ? 0 : 0), fy - 2 + Math.sin(a) * 6 + 2]], { key: P.ink, w: 7, boil: 0.3, seed: seed + 3 + k }));
      [-0.5, 0, 0.5].forEach((a, k) => K.line(ctx, [[fx, fy - 2], [fx + f * Math.cos(a) * 15, fy - 2 + Math.sin(a) * 6 + 2]], { key: P.leg, w: 3.5, boil: 0.3, seed: seed + 3 + k }));
    });
    /* ---- body: tail fan behind, plump egg, waistcoat front ---- */
    ctx.save(); ctx.translate(0, bodyBase); ctx.scale(sxk, syk);
    /* tail: three rounded feathers fanned behind, dark tips */
    [0.42, 0.18, -0.06].forEach((a, i) => {
      ctx.save(); ctx.translate(-f * 22, -30); ctx.scale(-f, 1); ctx.rotate(a);
      K.shape(ctx, K.rrectPts(0, -11, 66, 22, 11, 2), { fill: i === 1 ? P.pigeonLight : P.pigeon, w: 3, seed: seed + 8 + i, boil: 0.5 });
      K.shape(ctx, K.rrectPts(50, -11, 16, 22, 10, 2), { fill: P.ink, key: null, seed: seed + 5 + i, boil: 0.3, reg: 0 });
      ctx.restore();
    });
    const body = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * K.TAU, c = Math.cos(a), sn = Math.sin(a);
      const bulge = 1 + 0.14 * Math.max(0, c * f) * Math.max(0, -sn + 0.4);
      body.push([c * 62 * bulge, -72 + sn * (sn > 0 ? 70 : 76)]);
    }
    K.shape(ctx, body, { fill: P.pigeon, w: 3.5, smooth: true, boil: 0.8, seed: seed + 10, shade: { color: P.pigeonDark, dx: -f * 14, dy: 0 }, tone: { color: P.ink, gap: 9, r: 0, r2: 2.2, dir: 0, alpha: 0.2 } });
    /* waistcoat: two mustard panels over a cream shirt V, a string tie */
    K.shape(ctx, [[-34, -132], [34, -132], [44, -60], [36, -18], [0, -6], [-36, -18], [-44, -60]], { fill: P.mustard, w: 3, smooth: true, boil: 0.6, seed: seed + 11, shade: { color: P.mustardDark, dx: -f * 10, dy: 0 } });
    K.shape(ctx, [[-18, -134], [0, -92], [18, -134]], { fill: P.cream, w: 2.5, seed: seed + 12, boil: 0.4 });
    K.line(ctx, [[0, -122], [-6, -98]], { w: 3, boil: 0.3, seed: seed + 13 });
    K.line(ctx, [[0, -122], [6, -100]], { w: 3, boil: 0.3, seed: seed + 14 });
    [-70, -46].forEach((yy, i) => K.dot(ctx, 0, yy, 5, P.ink, P.ink, 1.5, seed + 15 + i));
    K.shape(ctx, K.rectPts(16, -64, 20, 6, 1), { fill: P.mustardDark, w: 2, seed: seed + 17, boil: 0.3 });
    /* iridescent neck ring (teal sheen) */
    K.shape(ctx, K.ellipsePts(f * 4, -140, 42, 17, 18), { fill: P.tealLight, w: 3, smooth: true, boil: 0.5, seed: seed + 18, tone: { color: P.teal, gap: 6, r: 0.6, r2: 2.4, dir: Math.PI / 2, alpha: 0.7 } });
    ctx.restore();
    /* ---- head ---- */
    const peck = st.peck || 0, headY = bodyBase - 140 * syk - 34 + (st.nod || 0);
    ctx.save(); ctx.translate(f * peck, headY); ctx.rotate(((st.head || 0) * Math.PI) / 180 * f); ctx.scale(1 + sq * 0.1, 1 - sq * 0.1);
    /* pencil tucked behind the head */
    ctx.save(); ctx.translate(-f * 28, -34); ctx.rotate(-f * 0.75);
    K.shape(ctx, K.rectPts(-7, -46, 14, 52, 1), { fill: P.mustardLight, w: 2.5, seed: seed + 19, boil: 0.3 });
    K.shape(ctx, K.rectPts(-7, -56, 14, 12, 3), { fill: P.tomatoLight, w: 2.5, seed: seed + 20, boil: 0.3 });
    ctx.restore();
    const head = [];
    for (let i = 0; i < 22; i++) { const a = (i / 22) * K.TAU, c = Math.cos(a), sn = Math.sin(a); head.push([c * (44 + 4 * Math.max(0, c * f)), sn * (sn > 0 ? 40 : 44)]); }
    K.shape(ctx, head, { fill: P.pigeon, w: 3.5, smooth: true, boil: 0.7, seed: seed + 21, shade: { color: P.pigeonDark, dx: -f * 10, dy: 6 }, tone: { color: P.ink, gap: 8, r: 0, r2: 2, dir: Math.PI * 0.2, alpha: 0.18 } });
    /* eyes: near eye on the face side, far eye smaller (3/4 view) */
    [[f * 17, 14, 16, 0], [-f * 18, 11, 14, 1]].forEach(([ex, rx, ry0, i]) => {
      const ey = -1, ry = ry0 * (1 - 0.92 * blink);
      K.shape(ctx, K.ellipsePts(ex, ey, rx, Math.max(1.4, ry), 14), { fill: P.eye, w: 3, smooth: true, boil: 0.4, seed: seed + 22 + i, reg: 1 });
      if (blink < 0.6) {
        const px = ex + look[0] * rx * 0.35, py = ey + 1 + look[1] * ry * 0.35;
        K.shape(ctx, K.ellipsePts(px, py, rx * 0.62, ry * 0.62, 12), { fill: P.iris, key: null, smooth: true, boil: 0.3, seed: seed + 24 + i, reg: 0 });
        K.shape(ctx, K.ellipsePts(px, py, rx * 0.33, ry * 0.36, 10), { fill: P.pupil, key: null, smooth: true, boil: 0.2, seed: seed + 26 + i, reg: 0 });
        K.shape(ctx, K.ellipsePts(px + 2, py - 3, 2.2, 2.2, 6), { fill: "#ffffff", key: null, smooth: true, boil: 0.2, seed: seed + 28 + i, reg: 0 });
      } else K.line(ctx, [[ex - rx, ey], [ex, ey + 3], [ex + rx, ey]], { w: 3, boil: 0.3, seed: seed + 30 + i, smooth: true });
      const br = st.brow || 0;
      K.line(ctx, [[ex - rx + 1, ey - ry0 - 7 - br * 6 + br * 2], [ex + rx - 1, ey - ry0 - 7 - br * 6 - br * 2]], { w: 4, boil: 0.3, seed: seed + 32 + i });
    });
    /* beak: upper mandible fixed, lower one hinges open with `talk` */
    const tk = clamp(st.talk || 0, 0, 1), vis = st.viseme || K.viseme(t, tk, seed);
    const opn = tk < 0.04 || vis === "m" ? 0 : tk * (vis === "e" ? 0.4 : vis === "o" ? 0.55 : 0.78);
    const bx = f * 36, by = 14, bl = vis === "o" ? 30 : 36;
    ctx.save(); ctx.translate(bx, by); ctx.scale(f, 1);
    if (opn > 0.01) {
      const lx = Math.cos(opn) * (bl - 2), ly = Math.sin(opn) * (bl - 2);
      K.shape(ctx, [[-2, -2], [bl, 0], [lx, ly + 4], [-2, 8]], { fill: P.mouthIn, key: null, seed: seed + 34, boil: 0.3, reg: 0 });
      if (opn > 0.22) K.shape(ctx, K.ellipsePts(lx * 0.45, ly * 0.45 + 3, 8, 3.5, 8, opn * 0.5), { fill: P.tomatoLight, key: null, smooth: true, seed: seed + 35, boil: 0.2, reg: 0 });
    }
    ctx.save(); ctx.rotate(opn);
    K.shape(ctx, [[-4, 2], [bl - 4, 3], [-4, 11]], { fill: P.mustardDark, w: 2.5, seed: seed + 36, boil: 0.3 });
    ctx.restore();
    K.shape(ctx, [[-6, -12], [bl * 0.55, -8], [bl + 4, 1], [bl - 4, 4], [-6, 4]], { fill: P.beak, w: 2.8, smooth: true, seed: seed + 37, boil: 0.4 });
    K.shape(ctx, K.ellipsePts(2, -10, 9, 5, 8), { fill: P.cream, w: 2, smooth: true, seed: seed + 38, boil: 0.3 });
    if (vis === "e" && tk > 0.04) K.line(ctx, [[-6, 6], [-12, 0]], { w: 2.5, boil: 0.2, seed: seed + 39 });
    ctx.restore();
    /* eyeshade: band round the crown + a translucent teal visor over the eyes */
    K.shape(ctx, [[-42, -30], [-34, -44], [34, -44], [42, -30], [0, -34]], { fill: P.ink, w: 2, smooth: true, seed: seed + 40, boil: 0.4, reg: 0 });
    K.shape(ctx, [[-f * 34, -38], [f * 40, -38], [f * 84, -26], [f * 28, -27], [-f * 30, -31]], { fill: P.teal, w: 3, seed: seed + 41, boil: 0.4, alpha: 0.86, tone: { color: P.tealLight, gap: 6, r: 0.6, r2: 2, dir: 0, alpha: 0.6 } });
    ctx.restore();
    /* "!" surprise and "?" thinking (language-neutral) */
    const pop = (v, x0, y0, q) => {
      if (!(v > 0)) return;
      const a = K.E.back(clamp(v, 0, 1), 2.5);
      ctx.save(); ctx.translate(x0, y0); ctx.rotate(0.22 * f); ctx.scale(a, a);
      if (q) {
        K.line(ctx, [[-14, -40], [-6, -54], [10, -54], [16, -40], [2, -28], [0, -16]], { key: P.ink, w: 15, smooth: true, boil: 0.3, seed: seed + 42 });
        K.line(ctx, [[-14, -40], [-6, -54], [10, -54], [16, -40], [2, -28], [0, -16]], { key: P.mustard, w: 8, smooth: true, boil: 0.3, seed: seed + 42 });
        K.shape(ctx, K.ellipsePts(0, 0, 7, 7, 10), { fill: P.mustard, w: 3, smooth: true, seed: seed + 43 });
      } else {
        K.shape(ctx, [[-9, -54], [9, -54], [5, -12], [-5, -12]], { fill: P.tomato, w: 3, seed: seed + 44 });
        K.shape(ctx, K.ellipsePts(0, 2, 7, 7, 10), { fill: P.tomato, w: 3, smooth: true, seed: seed + 45 });
      }
      ctx.restore();
    };
    pop(st.exclaim, f * 74 + f * peck, headY - 52, false);
    pop(st.ponder, -f * 70 + f * peck, headY - 56, true);
    /* ---- wings: shoulders at the waistcoat's top, IK to wing-hand targets ---- */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const h = st["wing" + k] || { x: sd * 64, y: -70 };
      const S = [sd * 46 * sxk, bodyBase - 112 * syk];
      const r = K.ik2(S, [h.x, h.y - hop], 34, 32, sd > 0 ? -1 : 1);
      K.tube(ctx, [S, r.elbow, r.end], 19, P.pigeon, seed + 50 + (sd > 0 ? 1 : 0), false);
      /* sleeve garter on the upper wing */
      const gx = (S[0] + r.elbow[0]) / 2, gy = (S[1] + r.elbow[1]) / 2, ga = Math.atan2(r.elbow[1] - S[1], r.elbow[0] - S[0]) + Math.PI / 2;
      K.line(ctx, [[gx - Math.cos(ga) * 11, gy - Math.sin(ga) * 11], [gx + Math.cos(ga) * 11, gy + Math.sin(ga) * 11]], { key: P.tomato, w: 7, boil: 0.3, seed: seed + 52 + (sd > 0 ? 1 : 0), cap: "butt" });
      const ang = h.rot != null ? (h.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      if (h.hold === "tape") K.tape(ctx, r.end[0], r.end[1] + 6, -6 + hop, h.unroll == null ? 1 : h.unroll, seed + 56);
      if (h.hold === "ticket") K.ticket(ctx, r.end[0] + Math.cos(ang) * 26, r.end[1] + Math.sin(ang) * 26 - 8, ang * 0.3, 1, { label: h.label || "No 7" }, seed + 60);
      if (h.draw) h.draw(ctx, r.end[0] + Math.cos(ang) * 22, r.end[1] + Math.sin(ang) * 22, ang);
      K.wingHand(ctx, r.end[0], r.end[1], ang, h, seed + 64 + (sd > 0 ? 6 : 0));
    });
    ctx.restore();
  };

  /* rig landmarks (local px at rest, scale 1) for pose helpers and prop placement */
  K.pigeon.HEAD = [0, -204]; K.pigeon.SHOULDER = [46, -142]; K.pigeon.REACH = 64; K.pigeon.H = 260;
})(SK);
