/* ============================================================
   KIT 42 PUFFER: "Puff", the eager pufferfish intern (host B, the co-host).
   Puff floats: local origin = body centre. Scale 1: body 216 x 200,
   eyes r 27, pectoral fins on two-bone "arms", tail fan behind,
   an intern lanyard badge (a star, no words). Puffs up when surprised:
   the body grows 1.45x and the spines stand out.
   Pose state (all optional):
     puff     0..1   inflate (surprise, big news)
     squash   -1..1  volume kept;  lean deg;  bob px (vertical float offset)
     look     [dx, dy] pupils -1..1;  lookAt [x, y] local point (overrides look)
     blink    0..1;  wide 0..1 (eyes pop open)
     talk     0..1 loudness -> K.talkMouth;  viseme ("m" | "a" | "o" | "e" | "u");  mouth "smile" | "grin" | "o" | "flat" | "worry"
     brow     -1..1.5;  browTilt -1..1 (thinking: one brow up)
     finL/finR { x, y } fin tip target in local space (point, wave, chin); default: idle flap
     exclaim 0..1 "!";  think 0..1 thought bubbles with "?"
     skin     { fill, dark, light } colour override
   ============================================================ */
var MK = window.MK || (window.MK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash } = K;
  K.PUFF_SKIN = { fill: "#ffcf4a", dark: "#e09a12", light: "#ffe79a", belly: "#fff6e6", spot: "#ff9442" };

  K.puffer = function (ctx, x, y, s, st) {
    st = st || {};
    const sk = Object.assign({}, K.PUFF_SKIN, st.skin || {});
    const pf = clamp(st.puff || 0, 0, 1), grow = 1 + 0.45 * K.E.out3(pf);
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = (1 + sq * 0.5) * grow, syk = grow / (1 + sq * 0.5);
    const seed = st.seed || 900, R = 100, now = K.now;
    const blink = clamp(st.blink || 0, 0, 1) * (1 - clamp(st.wide || 0, 0, 1));
    ctx.save(); ctx.translate(x, y + (st.bob || 0)); ctx.scale(s, s); ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    /* tail fan behind the body (lower right), wagging */
    ctx.save(); ctx.translate(R * 0.82 * sxk, R * 0.42 * syk); ctx.rotate(0.6 + Math.sin(now * 6 + seed) * 0.18);
    K.shape(ctx, [[0, 0], [70, -40], [84, 0], [70, 40]], { fill: sk.dark, w: 5, boil: 0.6, seed: seed + 1 });
    K.line(ctx, [[8, 0], [70, -20]], { stroke: sk.fill, w: 3, boil: 0.4, seed: seed + 2 }); K.line(ctx, [[8, 0], [72, 18]], { stroke: sk.fill, w: 3, boil: 0.4, seed: seed + 3 });
    ctx.restore();
    /* dorsal fin on top */
    ctx.save(); ctx.translate(-10, -R * 0.96 * syk); ctx.rotate(-0.15 + Math.sin(now * 4 + seed) * 0.08);
    K.shape(ctx, [[-30, 8], [-8, -40], [26, -28], [30, 8]], { fill: sk.dark, w: 5, boil: 0.6, seed: seed + 4 });
    ctx.restore();
    /* spines around the outline: stubs at rest, long when puffed */
    const spineL = 10 + 30 * pf;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * K.TAU + 0.17, ca = Math.cos(a), sa = Math.sin(a), rx = R * 1.08 * sxk, ry = R * syk;
      const bx = ca * rx * 0.96, by = sa * ry * 0.96, ex = ca * (rx + spineL), ey = sa * (ry + spineL);
      K.shape(ctx, [[bx - sa * 9, by + ca * 9], [ex, ey], [bx + sa * 9, by - ca * 9]], { fill: P.cream, w: 4, boil: 0.4, seed: seed + 10 + i, sharp: true });
    }
    /* body */
    const body = K.ellipsePts(0, 0, R * 1.08 * sxk, R * syk, 24);
    K.shape(ctx, body, { fill: sk.fill, w: 6, boil: 0.8, seed: seed + 30, shade: { color: sk.dark, dx: -18, dy: -16 }, hi: { color: sk.light, dx: 14, dy: 18 }, dots: { color: sk.dark, alpha: 0.3, gap: 14, r: 3.4, ang: 0.9, from: 0.55 } });
    /* belly and spots */
    ctx.save(); K.pathOf(ctx, body, true); ctx.clip();
    K.shape(ctx, K.ellipsePts(0, R * 0.62 * syk, R * 0.82 * sxk, R * 0.55 * syk, 18), { fill: sk.belly, w: 4, boil: 0.5, seed: seed + 31 });
    [[-70, -40, 9], [62, -52, 7], [-40, -78, 6], [80, -10, 6], [-86, 10, 5]].forEach((d, i) => K.shape(ctx, K.ellipsePts(d[0] * sxk, d[1] * syk, d[2], d[2], 8), { fill: sk.spot, stroke: null, w: 0, boil: 0.3, seed: seed + 32 + i }));
    ctx.restore();
    K.shape(ctx, K.ellipsePts(-46 * sxk, -62 * syk, 22, 11, 10, -0.5), { fill: "#ffffff", stroke: null, w: 0, boil: 0.3, seed: seed + 38, alpha: 0.75 });
    /* lanyard + intern badge (a star, language-free) */
    const by = R * 0.74 * syk;
    K.line(ctx, [[-52 * sxk, R * 0.42 * syk], [0, by - 18], [52 * sxk, R * 0.42 * syk]], { stroke: P.bid, w: 4, boil: 0.4, seed: seed + 40 });
    ctx.save(); ctx.translate(0, by + 4); ctx.rotate(Math.sin(now * 2.2 + seed) * 0.12);
    K.shape(ctx, K.rrectPts(-18, -20, 36, 40, 8, 2), { fill: P.cream, w: 4, boil: 0.4, seed: seed + 41 });
    K.starfish(ctx, 0, 1, 11, { color: P.ask, seed: seed + 42 });
    ctx.restore();
    /* cheeks */
    [-1, 1].forEach((sd, k) => K.shape(ctx, K.ellipsePts(sd * 62 * sxk, 14 * syk, 15, 9, 10), { fill: P.blush, stroke: null, w: 0, boil: 0.3, seed: seed + 44 + k, alpha: 0.45 }));
    /* eyes */
    const EY = -24 * syk, EX = 40 * sxk, er = 27 * (1 + 0.15 * clamp(st.wide || 0, 0, 1) + 0.12 * pf);
    let look = st.look || [0, 0];
    if (st.lookAt) { const dx = st.lookAt[0], dy = st.lookAt[1] - EY, d = Math.hypot(dx, dy) || 1; look = [dx / d, dy / d]; }
    [-1, 1].forEach((sd, k) => {
      const ex = sd * EX;
      K.shape(ctx, K.ellipsePts(ex, EY, er, er * 1.08, 14), { fill: P.eye, w: 4.5, boil: 0.4, seed: seed + 50 + k });
      if (blink < 0.95) {
        ctx.save(); K.pathOf(ctx, K.ellipsePts(ex, EY, er, er * 1.08, 14), true); ctx.clip();
        const px = ex + look[0] * er * 0.42, py = EY + look[1] * er * 0.38 + blink * 6, pr = er * (0.48 - 0.12 * clamp(st.wide || 0, 0, 1));
        K.shape(ctx, K.ellipsePts(px, py, pr, pr * 1.05, 12), { fill: P.pupil, stroke: null, w: 0, boil: 0.3, seed: seed + 52 + k });
        K.shape(ctx, K.ellipsePts(px + pr * 0.35, py - pr * 0.4, pr * 0.32, pr * 0.32, 8), { fill: "#ffffff", stroke: null, w: 0, boil: 0.2, seed: seed + 54 + k });
        if (blink > 0.02) K.shape(ctx, [[ex - er - 4, EY - er - 6], [ex + er + 4, EY - er - 6], [ex + er + 4, EY - er + 2 * er * blink], [ex - er - 4, EY - er + 2 * er * blink]], { fill: sk.fill, stroke: P.ink, w: 4, boil: 0.3, seed: seed + 56 + k });
        ctx.restore();
      } else K.line(ctx, [[ex - er * 0.8, EY + 2], [ex, EY + 9], [ex + er * 0.8, EY + 2]], { stroke: P.ink, w: 5, boil: 0.4, seed: seed + 58 + k });
      const br = st.brow || 0, tilt = (st.browTilt || 0) * (sd < 0 ? 1 : -0.4);
      K.line(ctx, [[ex - 18, EY - er - 14 - (br + tilt) * 11 + sd * br * 3], [ex + 18, EY - er - 14 - (br + tilt) * 11 - sd * br * 3]], { stroke: P.ink, w: 6, boil: 0.4, seed: seed + 60 + k });
    });
    /* mouth */
    const my = 26 * syk, talk = clamp(st.talk || 0, 0, 1), m = st.mouth || "smile";
    if (talk > 0.06) K.talkMouth(ctx, 0, my, 18, talk, st.viseme || K.viseme(now, talk, seed + 7), seed + 70);
    else if (pf > 0.4 || m === "o") K.shape(ctx, K.ellipsePts(0, my + 6, 9 + 4 * pf, 11 + 4 * pf, 10), { fill: "#7a1f3d", w: 4, boil: 0.4, seed: seed + 71 });
    else if (m === "grin") K.shape(ctx, [[-22, my - 2], [22, my - 2], [12, my + 14], [0, my + 17], [-12, my + 14]], { fill: "#7a1f3d", w: 4.5, boil: 0.4, seed: seed + 72 });
    else if (m === "flat") K.line(ctx, [[-14, my + 4], [14, my + 2]], { stroke: P.ink, w: 5, boil: 0.4, seed: seed + 73 });
    else if (m === "worry") K.line(ctx, [[-16, my + 8], [-6, my + 2], [6, my + 6], [16, my + 1]], { stroke: P.ink, w: 5, boil: 0.4, seed: seed + 74 });
    else K.line(ctx, [[-18, my], [-8, my + 9], [8, my + 9], [18, my]], { stroke: P.ink, w: 5, boil: 0.4, seed: seed + 75 });
    /* pectoral fins: two-bone arm (outlined tube) ending in a fan blade */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const S = [sd * R * 0.98 * sxk, R * 0.18 * syk];
      const flap = Math.sin(now * 5.5 + seed + (sd > 0 ? 1.4 : 0));
      const tg = st["fin" + k] || { x: sd * (R * 1.32 * sxk + 18), y: R * 0.32 * syk + 16 * flap };
      const r = K.ik2(S, [tg.x, tg.y], 40, 38, sd > 0 ? -1 : 1);
      K.tube(ctx, [S, r.elbow, r.end], 12, sk.dark, seed + 80 + sd, { ow: 9 });
      const ang = Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      ctx.save(); ctx.translate(r.end[0], r.end[1]); ctx.rotate(ang);
      K.shape(ctx, [[-4, 0], [26, -22], [40, -6], [40, 8], [26, 22]], { fill: sk.fill, w: 4.5, boil: 0.5, seed: seed + 84 + sd, shade: { color: sk.dark, dx: 0, dy: -6 } });
      ctx.restore();
    });
    /* "!" and thought bubbles */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(R * 1.2 * sxk, -R * 1.25 * syk); ctx.rotate(0.25); ctx.scale(a, a);
      K.shape(ctx, [[-10, -56], [10, -56], [5, -12], [-5, -12]], { fill: P.sun, w: 5, boil: 0.5, seed: seed + 90, sharp: true });
      K.dot(ctx, 0, 6, 8, P.sun, P.ink, 5, seed + 91);
      ctx.restore();
    }
    if (st.think > 0) {
      const a = clamp(st.think, 0, 1);
      [[R * 0.9, -R * 1.15, 9], [R * 1.15, -R * 1.45, 14]].forEach((b, i) => { if (a > i * 0.25) K.dot(ctx, b[0] * sxk, b[1] * syk + 4 * Math.sin(now * 3 + i), b[2], P.cream, P.ink, 4, seed + 92 + i); });
      if (a > 0.5) {
        const g = K.E.back(K.inv(0.5, 1, a), 2), cx = R * 1.55 * sxk, cy = -R * 1.95 * syk + 5 * Math.sin(now * 2.4);
        ctx.save(); ctx.translate(cx, cy); ctx.scale(g, g);
        K.shape(ctx, K.blobPts(0, 0, 54, 44, 12, seed + 95, 0.12), { fill: P.cream, w: 4.5, boil: 0.6, seed: seed + 95 });
        K.text(ctx, "?", 0, 4, { size: 54, weight: 900, font: K.FONT.display, fill: P.ask });
        ctx.restore();
      }
    }
    ctx.restore();
    K.pufferEyes = [x, y + (st.bob || 0) + EY * s]; /* point between the eyes, in the caller's space (look-at targets) */
  };
})(MK);
