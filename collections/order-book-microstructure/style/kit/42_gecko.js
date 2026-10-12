/* ============================================================
   KIT 42 GECKO: "Gekko", Tikki's apprentice (episode co-host, host B).
   A young electric-blue day gecko who runs between the stalls: saffron spots,
   huge eyes on top of a wide head, sticky round toe pads, a curled tail,
   a terra apron with a pocket ledger and a pencil tucked behind the head.
   Cool blue against the warm bazaar so it never melts into the sky.
   Local space: feet on y = 0, faces the viewer. Proportions (scale 1):
     legs 44, body 72 x 104 (centre y -92), head 132 x 96 (centre y -186),
     eyes r 19 in sockets at (+/-34, -214), arms 30 + 28 (two-bone IK) from
     shoulders (+/-30, -132), tail 150 long. About 0.72x Tikki's height.
   Pose state (all optional):
     squash   -1..1   volume kept       lean     deg    tilt around the feet
     hop      px      lift (legs tuck)  legWalk  phase  scurry cycle (radians)
     look     [dx, dy] -1..1            lookAt   [x, y] local point (overrides look)
     blink    0..1                      eyePop   0..1   eyes grow (surprise)
     talk     0..1    narration loudness (overrides mouth while > 0.06)
     vis      "a" | "e" | "o" | "m"     mouth shape while talking (K.visemeAt)
     mouth    "smile" | "grin" | "o" | "flat" | "wow"
     brow     -1..1.5                   headTilt deg    nod 0..1 (head dips)
     handL/R  { x, y, pose: "open"|"point"|"fist", rot }  hand target, local space
     tail     -1..1 sway                tailUp   0..1   tail stiff and up (surprise)
     exclaim  0..1 "!" pop              question 0..1   "?" pop (thinking)
     carry    "crate" | "ledger" | function (ctx, hx, hy) prop hugged in front of the belly
              (hands default to the prop's sides; arms are too short to lift it overhead)
   ============================================================ */
var BK = window.BK || (window.BK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;

  /* tapered ribbon along a centre line: w0 at the start, w1 at the end */
  K.taper = function (pts, w0, w1) {
    const L = [], R = [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, hw = lerp(w0, w1, i / (n - 1)) / 2;
      L.push([pts[i][0] - (dy / d) * hw, pts[i][1] + (dx / d) * hw]);
      R.push([pts[i][0] + (dy / d) * hw, pts[i][1] - (dx / d) * hw]);
    }
    return L.concat(R.reverse());
  };

  /* gecko toes: n fingers fanned around ang, each with a round sticky pad */
  K.geckoToes = function (ctx, x, y, ang, pose, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    const toes = pose === "point" ? [[-0.9, 8], [-0.3, 9], [0.05, 26], [0.8, 8]]
      : pose === "fist" ? [[-0.6, 8], [-0.2, 9], [0.2, 9], [0.6, 8]]
        : [[-0.8, 17], [-0.27, 21], [0.27, 21], [0.8, 17]];
    K.shape(ctx, K.ellipsePts(0, 0, 11, 10, 10), { fill: P.gecko, w: 4, boil: 0.7, seed, k: 1, nicks: 0, reg: false });
    toes.forEach((f, i) => {
      const tx = Math.cos(f[0]) * f[1], ty = Math.sin(f[0]) * f[1];
      K.limb(ctx, [[4, 0], [4 + tx, ty]], 5, P.gecko, seed + 3 + i);
      K.shape(ctx, K.ellipsePts(4 + tx, ty, 6.5, 6.5, 8), { fill: P.geckoLight, w: 3.5, boil: 0.5, seed: seed + 9 + i, k: 1, nicks: 0, reg: false });
    });
    ctx.restore();
  };

  K.gecko = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, blink = clamp(st.blink || 0, 0, 1), seed = st.seed || 900;
    const nod = clamp(st.nod || 0, 0, 1), pop = clamp(st.eyePop || 0, 0, 1), tUp = clamp(st.tailUp || 0, 0, 1);
    const look = st.lookAt ? K.lookDir(st.lookAt, [0, -212 - hop]) : (st.look || [0, 0]).slice();
    if (nod) look[1] = clamp(look[1] + nod * 0.5, -1, 1);
    const air = clamp(hop / 40, 0, 1), walk = st.legWalk;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);

    /* tail: curls out to the right; tailUp straightens it towards the sky */
    const tw = st.tail != null ? st.tail : Math.sin(K.now * 2.1 + 1) * 0.5;
    const curl = [[16, -46], [58, -26], [104, -24], [140, -48], [146, -86], [124, -104], [106, -92], [110, -74]];
    const stiff = [[16, -46], [40, -62], [60, -96], [74, -132], [84, -170], [90, -204], [94, -230], [96, -244]];
    const tc = curl.map((p, i) => {
      const u = i / (curl.length - 1);
      return [lerp(p[0], stiff[i][0], tUp) + Math.sin(u * 2.2 + tw) * 10 * u, lerp(p[1] - hop * (1 - u * 0.5), stiff[i][1] - hop, tUp) + tw * 14 * u * u];
    });
    const tailPoly = K.taper(tc, 30, 7);
    K.shape(ctx, tailPoly, { fill: P.gecko, w: 5, boil: 1.1, seed: seed + 1, k: 0.85, shade: { color: P.geckoDark, dx: 0, dy: 7 } });
    [1, 3, 5].forEach((i, j) => K.shape(ctx, K.blobPts(tc[i][0], tc[i][1], 7 - j, 6 - j, 7, seed + 2 + j, 0.25), { fill: P.geckoSpot, stroke: null, w: 0, boil: 0.5, seed: seed + 2 + j, reg: false }));

    /* legs: wide squat, splayed feet with pads */
    const hipY = (-46 - hop) * syk;
    [-1, 1].forEach((sd, i) => {
      const ph = (walk || 0) + (sd > 0 ? Math.PI : 0), lift = walk != null ? Math.max(0, Math.sin(ph)) * 14 : 0;
      const fx = sd * (40 - 12 * air) + (walk != null ? Math.cos(ph) * 10 : 0), fy = -lift - hop + 12 * air;
      K.limb(ctx, [[sd * 18 * sxk, hipY], [sd * 42 * sxk, (hipY + fy) / 2 - 6], [fx, fy - 6]], 12, P.gecko, seed + 10 + i);
      K.geckoToes(ctx, fx + sd * 2, fy - 4, sd > 0 ? -0.35 : Math.PI + 0.35, "open", 0.85, seed + 14 + i * 20);
    });

    /* body (squash about the hip) */
    ctx.save(); ctx.translate(0, -hop); ctx.scale(sxk, syk);
    K.shape(ctx, K.ellipsePts(0, -92, 36, 54, 16), { fill: P.gecko, w: 5.5, boil: 1.2, seed: seed + 20, k: 0.7, shade: { color: P.geckoDark, dx: 9, dy: -5 }, gouge: { ang: -1.2, side: 1, alpha: 0.3, color: P.geckoDark, gap: 11, len: 0.28 } });
    K.shape(ctx, K.ellipsePts(0, -80, 22, 38, 12), { fill: P.geckoBelly, w: 3.5, boil: 1, seed: seed + 21, k: 1, pattern: { kind: "stripes", color: P.geckoLight, gap: 10, w: 2.5, alpha: 0.7 } });
    /* apron: bib + skirt, saffron zigzag hem, pocket with a ledger stub */
    const apron = [[-20, -128], [20, -128], [24, -100], [36, -86], [34, -46], [-34, -46], [-36, -86], [-24, -100]];
    K.shape(ctx, apron, { fill: P.apron, w: 4.5, boil: 1, seed: seed + 22, k: 0.3, shade: { color: P.apronDark, dx: 7, dy: 0 } });
    K.line(ctx, [[-34, -54], [-24, -60], [-12, -54], [0, -60], [12, -54], [24, -60], [34, -54]], { stroke: P.saffron, w: 4, boil: 0.6, seed: seed + 23 });
    K.line(ctx, [[-20, -128], [-30, -142]], { stroke: P.apronDark, w: 4, boil: 0.5, seed: seed + 24 });
    K.line(ctx, [[20, -128], [30, -142]], { stroke: P.apronDark, w: 4, boil: 0.5, seed: seed + 25 });
    K.shape(ctx, K.rectPts(4, -78, 22, 6, 2), { fill: P.paper, w: 3, boil: 0.5, seed: seed + 26, k: 0.1, nicks: 0, reg: false });
    K.shape(ctx, K.rectPts(-2, -74, 30, 22, 2), { fill: P.apronDark, w: 3.5, boil: 0.6, seed: seed + 27, k: 0.2, nicks: 0 });
    /* back spots peeking past the apron */
    [[-30, -118], [31, -112], [-33, -70], [33, -62]].forEach((p, i) => K.shape(ctx, K.blobPts(p[0], p[1], 5, 4.5, 7, seed + 28 + i, 0.3), { fill: P.geckoSpot, stroke: null, w: 0, boil: 0.5, seed: seed + 28 + i, reg: false }));
    ctx.restore();

    /* head (rides the squash; nod dips it) */
    const headY = (-186 - hop) * syk + nod * 10;
    ctx.save(); ctx.translate(0, headY); ctx.rotate(((st.headTilt || 0) * Math.PI) / 180);
    /* pencil tucked behind the head */
    K.line(ctx, [[22, -40], [92, -12]], { stroke: P.ink, w: 14, boil: 0.6, seed: seed + 30, k: 0.1 });
    K.line(ctx, [[22, -40], [84, -15]], { stroke: P.saffron, w: 8, boil: 0.6, seed: seed + 30, k: 0.1 });
    K.shape(ctx, [[84, -20], [98, -10], [83, -9]], { fill: P.woodLight, w: 3, boil: 0.4, seed: seed + 31, k: 0, nicks: 0, reg: false });
    /* wide flat head */
    const head = [];
    for (let i = 0; i < 20; i++) { const a = (i / 20) * K.TAU, c = Math.cos(a), sn = Math.sin(a); head.push([c * 66, sn * (sn > 0 ? 40 : 50) + (sn > 0 ? 4 : 0)]); }
    K.shape(ctx, head, { fill: P.gecko, w: 5.5, boil: 1.2, seed: seed + 32, k: 0.6, shade: { color: P.geckoDark, dx: 8, dy: -6 } });
    /* chin + throat */
    K.shape(ctx, K.ellipsePts(0, 26, 44, 16, 12), { fill: P.geckoBelly, stroke: null, w: 0, boil: 0.8, seed: seed + 33, reg: false });
    /* head spots */
    [[-40, -18], [-14, -38], [18, -36], [44, -14], [0, -22]].forEach((p, i) => K.shape(ctx, K.blobPts(p[0], p[1], 6, 5, 7, seed + 34 + i, 0.3), { fill: P.geckoSpot, stroke: null, w: 0, boil: 0.5, seed: seed + 34 + i, reg: false }));
    /* nostrils + cheeks */
    [-1, 1].forEach((sd, i) => {
      K.dot(ctx, sd * 10, -2, 2.6, P.ink, null, 0, seed + 40 + i);
      ctx.save(); ctx.globalAlpha = 0.55; K.shape(ctx, K.ellipsePts(sd * 48, 14, 11, 6, 8), { fill: P.cheek, stroke: null, w: 0, boil: 0.5, seed: seed + 42 + i, reg: false }); ctx.restore();
    });
    /* mouth: a wide gecko grin across the face */
    const m = st.mouth || "smile", talk = clamp(st.talk || 0, 0, 1);
    if (talk > 0.06) K.talkMouth(ctx, 0, 12, talk, st.vis, 1.25, seed + 44);
    else if (m === "smile") K.line(ctx, [[-46, 6], [-40, 13], [-20, 20], [0, 21], [20, 20], [40, 13], [46, 6]], { stroke: P.ink, w: 4, boil: 0.7, seed: seed + 44, k: 0.9 });
    else if (m === "flat") K.line(ctx, [[-26, 16], [0, 18], [26, 14]], { stroke: P.ink, w: 4, boil: 0.7, seed: seed + 44 });
    else if (m === "grin") K.shape(ctx, [[-44, 8], [44, 8], [30, 26], [0, 32], [-30, 26]], { fill: P.mouthIn, w: 4, boil: 0.7, seed: seed + 45, k: 0.6, nicks: 0 });
    else if (m === "o") K.shape(ctx, K.ellipsePts(0, 18, 8, 9, 8), { fill: P.mouthIn, w: 3.5, boil: 0.6, seed: seed + 46, k: 1, nicks: 0 });
    else if (m === "wow") K.shape(ctx, K.ellipsePts(0, 20, 16, 15, 10), { fill: P.mouthIn, w: 4, boil: 0.7, seed: seed + 47, k: 1, nicks: 0 });
    /* bulging eyes on top: socket, white, big pupil, lids for the blink */
    const br = st.brow || 0, er = 19 * (1 + pop * 0.3);
    [-1, 1].forEach((sd, i) => {
      const ex = sd * 34, ey = -30 - pop * 4;
      K.shape(ctx, K.ellipsePts(ex, ey, er + 9, er + 8, 14), { fill: P.gecko, w: 5, boil: 0.9, seed: seed + 50 + i, k: 1, nicks: 0, shade: { color: P.geckoDark, dx: sd * 4, dy: -4 } });
      const ry = er * (1 - 0.94 * blink);
      K.shape(ctx, K.ellipsePts(ex, ey, er, Math.max(1.5, ry), 14), { fill: P.eye, w: 3.5, boil: 0.6, seed: seed + 52 + i, k: 1, nicks: 0, reg: false });
      if (blink < 0.6) {
        const pr = er * 0.58, px = ex + look[0] * er * 0.38, py = ey + look[1] * er * 0.36 * (1 - blink);
        K.shape(ctx, K.ellipsePts(px, py, pr, pr * (1 - blink), 12), { fill: P.pupil, stroke: null, w: 0, boil: 0.4, seed: seed + 54 + i, reg: false });
        K.shape(ctx, K.ellipsePts(px + pr * 0.35, py - pr * 0.4, pr * 0.3, pr * 0.3, 6), { fill: "#ffffff", stroke: null, w: 0, boil: 0.3, seed: seed + 56 + i, reg: false });
      } else K.line(ctx, [[ex - er, ey], [ex, ey + 5], [ex + er, ey]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 58 + i });
      /* brow ridge: raised = surprise, negative = puzzled */
      K.line(ctx, [[ex - 16, ey - er - 12 - br * 6 + sd * br * 3], [ex + 16, ey - er - 12 - br * 6 - sd * br * 3]], { stroke: P.ink, w: 5, boil: 0.5, seed: seed + 60 + i });
    });
    /* "!" (surprise) and "?" (thinking) marks, language-neutral */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(96, -64); ctx.rotate(0.25); ctx.scale(a, a);
      K.shape(ctx, [[-10, -56], [10, -56], [5, -12], [-5, -12]], { fill: P.saffron, w: 4.5, boil: 0.9, seed: seed + 90, k: 0.1 });
      K.shape(ctx, K.ellipsePts(0, 4, 8, 8, 8), { fill: P.saffron, w: 4.5, boil: 0.9, seed: seed + 91, k: 1 });
      ctx.restore();
    }
    if (st.question > 0) {
      const a = K.E.back(clamp(st.question, 0, 1), 2.5), bob = Math.sin(K.now * 3) * 4;
      ctx.save(); ctx.translate(-96, -70 + bob); ctx.rotate(-0.2); ctx.scale(a, a);
      K.line(ctx, [[-14, -40], [-10, -54], [4, -58], [16, -48], [14, -34], [2, -26], [0, -12]], { stroke: P.ink, w: 15, boil: 0.8, seed: seed + 92, k: 0.9 });
      K.line(ctx, [[-14, -40], [-10, -54], [4, -58], [16, -48], [14, -34], [2, -26], [0, -12]], { stroke: P.saffron, w: 8, boil: 0.8, seed: seed + 92, k: 0.9 });
      K.shape(ctx, K.ellipsePts(0, 4, 7, 7, 8), { fill: P.saffron, w: 4.5, boil: 0.9, seed: seed + 93, k: 1 });
      ctx.restore();
    }
    ctx.restore(); /* head */

    /* arms: IK to hand targets, props in hand */
    const hands = {};
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const h = st["hand" + k] || (st.carry ? { x: sd * 40, y: -72, pose: "open" } : { x: sd * 46, y: -80, pose: "open" });
      const S = [sd * 30 * sxk, (-132 - hop) * syk];
      const r = K.ik2(S, [h.x, h.y - hop], 30, 28, sd > 0 ? -1 : 1);
      hands[k] = { S, r, h, ang: h.rot != null ? (h.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]) };
    });
    const carry = st.carry;
    if (carry) {
      const hx = 0, hy = (-72 - hop) * syk; /* pinned to the belly, so a pointing hand never lifts it */
      if (carry === "crate") K.crate(ctx, hx, hy + 30, 1.25, { seed: seed + 95 });
      else if (carry === "ledger") {
        K.shape(ctx, K.rectPts(hx - 40, hy - 30, 80, 58, 2), { fill: P.paper, w: 4.5, boil: 0.8, seed: seed + 96, k: 0.1, pattern: { kind: "stripes", color: P.paperShade, gap: 10, w: 3, alpha: 0.9 } });
        K.line(ctx, [[hx, hy - 30], [hx, hy + 28]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 97 });
      } else if (typeof carry === "function") carry(ctx, hx, hy);
    }
    ["L", "R"].forEach((k) => {
      const H = hands[k], sd = k === "L" ? -1 : 1;
      K.limb(ctx, [H.S, H.r.elbow, H.r.end], 11, P.gecko, seed + 70 + sd);
      K.geckoToes(ctx, H.r.end[0], H.r.end[1], H.ang, H.h.pose || "open", 1, seed + 80 + sd * 10);
    });
    ctx.restore();
  };
})(BK);
