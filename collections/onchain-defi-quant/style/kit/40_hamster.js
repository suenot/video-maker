/* ============================================================
   KIT 40 HAMSTER: "Chef Nibbs", the hamster chef-detective.
   Local space: feet on y = 0, body centre (0, -100), faces the viewer.
   Proportions (scale 1): egg body 156 x 184 (head and body are one shape,
   like a real hamster), cheek pouches, round ears, tall pleated toque,
   mint apron with a cherry bow tie, arms 34 + 30 (two-bone IK), stub feet.
   Pose state (all optional):
     squash     -1..1  (+ = squashed wide, - = stretched tall), volume kept
     lean       deg    whole body tilt around the feet
     hop        px     lift off the ground (feet tuck)
     look       [dx, dy] pupils, -1..1
     blink      0..1   (1 = closed)
     wink       0..1   right eye only
     mouth      "smile" | "grin" | "open" | "o" | "smirk" | "frown"
     brow       -1..1.5  (negative = frown, slanted in; positive = raised)
     cheeks     0..1   pouch puff
     pawL/R     { x, y, rot }  target of the paw in local space
     hold       "magnifier" (right paw; magHand "L" = left paw); magAng (deg) lens direction, magS scale
     toqueTip   deg, toqueLift px
     exclaim    0..1  "!" pop;  sweat 0..1 one drop
   K.lens = { x, y, r } on screen (for iris transitions) after a magnifier draw.
   ============================================================ */
var DK = window.DK || (window.DK = {});
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
  /* outlined limb: ink ribbon then colour on top (constant width, rounded) */
  K.limb = function (ctx, pts, w, color, seed) {
    K.rule(ctx, pts, { stroke: P.ink, w: w + 8, boil: 0.9, seed });
    K.rule(ctx, pts, { stroke: color, w, boil: 0.9, seed: seed + 1 });
  };
  K.paw = function (ctx, x, y, ang, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    K.shape(ctx, K.ellipsePts(4, 0, 17, 14, 10), { fill: P.furLight, w: 4, boil: 0.8, seed });
    [-7, 1, 9].forEach((fy, i) => K.rule(ctx, [[12, fy * 0.9], [19, fy]], { stroke: P.ink, w: 3, boil: 0.4, seed: seed + 2 + i }));
    ctx.restore();
  };

  K.hamster = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), wink = clamp(st.wink || 0, 0, 1);
    const seed = st.seed || 700, cheeks = clamp(st.cheeks || 0, 0, 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    const air = clamp(hop / 40, 0, 1);
    /* feet (behind the body) */
    [-1, 1].forEach((sd, i) => K.shape(ctx, K.ellipsePts(sd * 38, -10 - hop + air * 14, 30, 15 - air * 3, 12, sd * air * 0.3), { fill: P.furLight, w: 4.5, boil: 0.9, seed: seed + 1 + i }));
    const bodyY = -100 * syk - hop;
    ctx.save(); ctx.translate(0, bodyY); ctx.scale(sxk, syk);
    /* ears */
    const ew = st.earWiggle || 0;
    [-1, 1].forEach((sd, i) => {
      const ex = sd * 56, ey = -74, rot = sd * (0.3 + ew * 0.25 * Math.sin(K.now * 14));
      K.shape(ctx, K.ellipsePts(ex, ey, 24, 22, 12, rot), { fill: P.fur, w: 5, boil: 1, seed: seed + 5 + i });
      K.shape(ctx, K.ellipsePts(ex, ey + 3, 13, 11, 10, rot), { fill: P.cheek, stroke: null, w: 0, boil: 0.6, seed: seed + 7 + i });
    });
    /* body: egg with cheek bulges */
    const body = [];
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * K.TAU, c = Math.cos(a), sn = Math.sin(a);
      const rx = 78 * (sn > 0 ? 1.06 : 0.94), ry = sn > 0 ? 92 : 96;
      const cheekB = Math.exp(-Math.pow((sn + 0.05) / 0.32, 2)) * (8 + 16 * cheeks); /* pouches on the sides, just below eye level */
      body.push([c * (rx + cheekB), sn * ry]);
    }
    K.shape(ctx, body, { fill: P.fur, w: 6, boil: 1.4, seed: seed + 10, shade: { color: P.furDark, dx: 14, dy: 10 } });
    /* face mask (lighter muzzle) + belly */
    K.shape(ctx, K.ellipsePts(0, -4, 52, 38, 14), { fill: P.belly, stroke: null, w: 0, boil: 0.8, seed: seed + 11, misreg: false });
    /* apron: mint bib with cherry pocket */
    K.shape(ctx, [[-46, 36], [46, 36], [60, 90], [-60, 90]], { fill: P.mint, w: 4.5, boil: 1, seed: seed + 12, shade: { color: P.mintDark, dx: 10, dy: 0 } });
    K.shape(ctx, K.roundRectPts(-20, 52, 40, 24, 6, 2), { fill: P.cherry, w: 3.5, boil: 0.7, seed: seed + 13 });
    /* bow tie */
    K.shape(ctx, [[0, 28], [-26, 16], [-26, 42], [0, 30], [26, 42], [26, 16]], { fill: P.cherry, w: 4, boil: 0.8, seed: seed + 14, shade: { color: P.cherryDark, dx: 0, dy: 8 } });
    K.dot(ctx, 0, 29, 6, P.cherryDark, P.ink, 3, seed + 15);
    /* cheeks blush */
    [-1, 1].forEach((sd, i) => { ctx.save(); ctx.globalAlpha = 0.55; K.shape(ctx, K.ellipsePts(sd * 52, -6, 14, 9, 8), { fill: P.cheek, stroke: null, w: 0, boil: 0.5, seed: seed + 16 + i, misreg: false }); ctx.restore(); });
    /* nose + whiskers */
    K.shape(ctx, [[-9, -22], [9, -22], [0, -12]], { fill: P.nose, w: 3.5, boil: 0.5, seed: seed + 18 });
    const tw = Math.sin(K.now * 9) * 2 * (st.whisk == null ? 1 : st.whisk);
    [-1, 1].forEach((sd) => [0, 1, 2].forEach((k) => K.line(ctx, [[sd * 26, -12 + k * 7], [sd * 60, -20 + k * 12 + tw]], { stroke: P.ink, w: 2.5, boil: 0.5, seed: seed + 20 + k + (sd > 0 ? 4 : 0) })));
    /* mouth + buck teeth */
    const m = st.mouth || "smile";
    if (m === "smile") K.line(ctx, [[-16, -6], [-6, 2], [0, -4], [6, 2], [16, -6]], { stroke: P.ink, w: 4, boil: 0.6, seed: seed + 30 });
    else if (m === "smirk") K.line(ctx, [[-14, -2], [2, 0], [18, -10]], { stroke: P.ink, w: 4, boil: 0.6, seed: seed + 31 });
    else if (m === "frown") K.line(ctx, [[-14, 2], [0, -4], [14, 2]], { stroke: P.ink, w: 4, boil: 0.6, seed: seed + 32 });
    else {
      const big = m === "open" ? 1 : m === "grin" ? 0.8 : 0.5, wd = m === "o" ? 9 : m === "grin" ? 22 : 14;
      K.shape(ctx, m === "grin" ? [[-22, -8], [22, -8], [12, 10], [-12, 10]] : K.ellipsePts(0, 2, wd, 12 * big + 2, 10), { fill: "#6a2028", w: 4, boil: 0.6, seed: seed + 33 });
    }
    if (m !== "frown") K.shape(ctx, K.roundRectPts(-7, -7, 14, 11, 3, 1), { fill: P.eye, w: 2.5, boil: 0.3, seed: seed + 34, misreg: false });
    /* eyes: big, glossy */
    const eyeY = -46 - (st.eyeUp || 0);
    [-1, 1].forEach((sd, i) => {
      const ex = sd * 30, r = 15 + (st.eyeUp ? 2 : 0), bl = i === 1 ? Math.max(blink, wink) : blink;
      if (bl < 0.6) {
        K.shape(ctx, K.ellipsePts(ex, eyeY, r, r * 1.12 * (1 - bl), 12), { fill: P.pupil, w: 3, boil: 0.5, seed: seed + 40 + i, misreg: false });
        const px = ex + look[0] * 4, py = eyeY + look[1] * 4;
        K.shape(ctx, K.ellipsePts(px - 4, py - 6, 5.5, 6.5, 8), { fill: "#ffffff", stroke: null, w: 0, boil: 0.3, seed: seed + 42 + i, misreg: false });
        K.shape(ctx, K.ellipsePts(px + 5, py + 5, 2.5, 2.5, 6), { fill: "#ffffff", stroke: null, w: 0, boil: 0.2, seed: seed + 44 + i, misreg: false });
      } else K.line(ctx, [[ex - r, eyeY], [ex, eyeY + 6], [ex + r, eyeY]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 46 + i });
      const br = st.brow || 0, inner = br < 0 ? -br * 9 : 0;
      K.line(ctx, [[ex - sd * 14, eyeY - 26 - br * 7 + inner], [ex + sd * 12, eyeY - 30 - br * 7 - inner * 0.6]], { stroke: P.ink, w: 5, boil: 0.5, seed: seed + 48 + i });
    });
    /* toque (chef hat): band + puffy top with pleats */
    ctx.save(); ctx.translate(0, -90 - (st.toqueLift || 0)); ctx.rotate(((st.toqueTip || 0) * Math.PI) / 180); ctx.scale(0.86, 0.86);
    const puff = [[-40, -10], [-58, -46], [-50, -84], [-24, -100], [0, -94], [24, -104], [52, -88], [60, -50], [42, -10]];
    K.shape(ctx, puff, { fill: P.toque, w: 5, boil: 1.2, seed: seed + 60, shade: { color: P.toqueShade, dx: 14, dy: 0 } });
    [-20, 0, 20].forEach((px, i) => K.line(ctx, [[px, -14], [px * 1.2, -60]], { stroke: P.toqueShade, w: 4, boil: 0.6, seed: seed + 62 + i }));
    K.shape(ctx, K.roundRectPts(-44, -16, 88, 26, 8, 2), { fill: P.toque, w: 4.5, boil: 0.9, seed: seed + 61, shade: { color: P.toqueShade, dx: 0, dy: -10 } });
    ctx.restore();
    /* "!" and sweat */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(108, -150); ctx.rotate(0.22); ctx.scale(a, a);
      K.shape(ctx, [[-10, -56], [10, -56], [6, -12], [-6, -12]], { fill: P.mustard, w: 4.5, boil: 0.8, seed: seed + 90 });
      K.shape(ctx, K.ellipsePts(0, 4, 8, 8, 8), { fill: P.mustard, w: 4, boil: 0.8, seed: seed + 91 });
      ctx.restore();
    }
    if (st.sweat > 0) K.shape(ctx, [[-70, -70], [-62, -52], [-70, -44], [-78, -52]], { fill: "#bfe8f2", w: 3, boil: 0.5, seed: seed + 92, alpha: st.sweat });
    ctx.restore();
    /* arms (outside the squash so paws stay round) */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const pw = st["paw" + k] || { x: sd * 70, y: -40 };
      const S = [sd * 60 * sxk, bodyY + 34 * syk];
      const r = K.ik2(S, [pw.x, pw.y - hop], 36, 32, sd > 0 ? -1 : 1);
      K.limb(ctx, [S, r.elbow, r.end], 14, P.fur, seed + 70 + sd * 3);
      const ang = pw.rot != null ? (pw.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      if (k === (st.magHand || "R") && st.hold === "magnifier") K.magnifier(ctx, r.end[0], r.end[1], st.magAng != null ? (st.magAng * Math.PI) / 180 : ang, st.magS || 1, seed + 80, st.lensGlint);
      K.paw(ctx, r.end[0], r.end[1], ang, 1, seed + 84 + sd * 3);
    });
    ctx.restore();
  };

  /* magnifying glass: wooden handle along ang, chrome ring, glass. Writes K.lens (screen). */
  K.magnifier = function (ctx, x, y, ang, s, seed, glint) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    K.shape(ctx, K.roundRectPts(-14, -9, 66, 18, 8, 2), { fill: P.cherryDark, w: 4, boil: 0.7, seed, shine: { x: 0.3, y: 0.2 } });
    const cx = 100;
    K.shape(ctx, K.ellipsePts(cx, 0, 52, 52, 18), { fill: P.chrome, w: 5, boil: 0.9, seed: seed + 1, misreg: false, shade: { color: P.chromeDark, dx: 6, dy: 6, dots: false } });
    K.shape(ctx, K.ellipsePts(cx, 0, 41, 41, 16), { fill: "rgba(205,240,248,0.55)", w: 3.5, boil: 0.6, seed: seed + 2, misreg: false });
    const g = glint == null ? 0.8 : glint;
    if (g > 0) K.line(ctx, [[cx - 24, -12], [cx - 14, -26], [cx + 2, -32]], { stroke: "#ffffff", w: 7, boil: 0.5, seed: seed + 3, alpha: g });
    const m = ctx.getTransform(), c = m.transformPoint(new DOMPoint(cx, 0));
    K.lens = { x: c.x, y: c.y, r: 41 * Math.sqrt(m.a * m.a + m.b * m.b) };
    ctx.restore();
  };

  /* blink curve with seeded blink times, 0..1 (about one blink per 2.1 s) */
  K.blinkAt = function (t, seed) {
    let b = 0;
    for (let i = 0; i < 14; i++) {
      const tb = 0.9 + i * 2.1 + K.hash(i, seed || 7) * 1.2, d = t - tb;
      if (d > 0 && d < 0.15) b = Math.max(b, Math.sin((d / 0.15) * Math.PI));
    }
    return b;
  };
})(DK);
