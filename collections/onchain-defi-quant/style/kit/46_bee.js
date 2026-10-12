/* ============================================================
   KIT 46 BEE: "Bizzy", the bee waitress on roller skates (co-host, host B).
   The curious one: she takes the questions down on her order pad.
   Local space: skate wheels on y = 0, faces the viewer.
   Proportions (scale 1): big round head r 62 at (0, -262), striped body
   112 x 100 at (0, -160), cream apron, cherry waitress cap, antennae with
   bobbles (tip about y -372), two flutter wings, arms 32 + 30 (two-bone IK),
   thin legs to cherry roller skates. About 380 px tall at s = 1.
   Pose state (all optional):
     squash   -1..1   (+ = squashed wide), volume kept
     lean     deg     tilt around the wheels
     hop      px      lift (wings buzz harder in the air)
     roll     px      skate glide offset (wheels spin with it)
     look     [dx, dy] pupils, -1..1;  head  deg  head tilt (curious)
     blink    0..1;   wink 0..1
     talk     0..1    talking mouth (K.talkMouth)
     mouth    "smile" | "grin" | "open" | "o" | "worry"
     brow     -1..1.5
     armL/R   { x, y }  hand targets in local space
     pad      true: order pad in the left hand;  write 0..1: pencil scribbles on it
     pointHand "L" | "R", pointAng (rad), pointAmt 0..1: pencil held out toward a target
     buzz     0..1    wing flutter amount (idle 0.35)
     exclaim  0..1    "!" pop;  think 0..1 "?" bubble (thinkSide -1 left / +1 right)
   ============================================================ */
var DK = window.DK || (window.DK = {});
(function (K) {
  const P = K.P, { clamp } = K;

  K.bee = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), wink = clamp(st.wink || 0, 0, 1);
    const seed = st.seed || 1200, talk = clamp(st.talk || 0, 0, 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    /* legs + roller skates */
    const roll = st.roll || 0;
    [-1, 1].forEach((sd, i) => {
      const fx = sd * 30, fy = -30 - hop;
      K.limb(ctx, [[sd * 22, -118 * syk - hop], [sd * 30, -74 - hop], [fx, fy]], 9, P.beeDark, seed + i * 3);
      K.shape(ctx, K.roundRectPts(fx - 30 + sd * 6, fy - 22, 54, 30, 12, 2), { fill: P.cherry, w: 4, boil: 0.8, seed: seed + 10 + i, shine: { x: 0.3, y: 0.25 } });
      [-16, 14].forEach((wx, k) => {
        const cx = fx + wx + sd * 6, cy = fy + 18, a = roll / 10 + k;
        K.dot(ctx, cx, cy, 11, P.chrome, P.ink, 3.5, seed + 14 + i * 2 + k);
        K.rule(ctx, [[cx + Math.cos(a) * 6, cy + Math.sin(a) * 6], [cx - Math.cos(a) * 6, cy - Math.sin(a) * 6]], { stroke: P.ink, w: 2.5, boil: 0.3, seed: seed + 18 + k });
      });
    });
    const bodyY = -160 * syk - hop;
    ctx.save(); ctx.translate(0, bodyY); ctx.scale(sxk, syk);
    /* wings (behind): flutter at 40 Hz-ish, sampled per frame so it reads as a buzz blur */
    const buzz = st.buzz == null ? 0.35 : st.buzz, fl = Math.sin(K.now * 52) * 0.5 * buzz + 0.15 * Math.sin(K.now * 3);
    [-1, 1].forEach((sd, i) => {
      ctx.save(); ctx.translate(sd * 34, -40); ctx.rotate(sd * (-0.5 - fl));
      K.shape(ctx, K.ellipsePts(sd * 46, -30, 50, 30, 14, sd * -0.5), { fill: P.wing, stroke: P.wingEdge, w: 3.5, boil: 0.9, seed: seed + 20 + i, misreg: false });
      K.shape(ctx, K.ellipsePts(sd * 34, 6, 32, 18, 12, sd * 0.3), { fill: P.wing, stroke: P.wingEdge, w: 3, boil: 0.8, seed: seed + 22 + i, misreg: false });
      ctx.restore();
    });
    /* striped body + apron */
    const body = K.ellipsePts(0, 0, 56, 52, 18);
    K.shape(ctx, body, { fill: P.bee, w: 5.5, boil: 1.2, seed: seed + 30, shade: { color: P.beeDark, dx: 10, dy: 8 } });
    ctx.save(); K.pathOf(ctx, body, true); ctx.clip();
    [-22, 4, 30].forEach((sy, i) => K.line(ctx, [[-70, sy], [-20, sy + 5], [20, sy + 5], [70, sy]], { stroke: P.ink, w: 13, boil: 0.8, seed: seed + 31 + i, taper: 0 }));
    ctx.restore();
    K.shape(ctx, [[-30, -6], [30, -6], [38, 42], [0, 50], [-38, 42]], { fill: P.cream, w: 4, boil: 0.9, seed: seed + 34, shade: { color: P.creamShade, dx: 8, dy: 0 } });
    K.rule(ctx, [[-30, -6], [30, -6]], { stroke: P.cherry, w: 6, boil: 0.5, seed: seed + 35 });
    K.shape(ctx, K.roundRectPts(-14, 12, 28, 18, 5, 2), { fill: P.mintLight, w: 3, boil: 0.5, seed: seed + 36, misreg: false });
    /* stinger */
    K.shape(ctx, [[-8, 48], [8, 48], [0, 64]], { fill: P.ink, stroke: null, w: 0, boil: 0.4, seed: seed + 37, misreg: false });
    /* head (tilts) */
    ctx.save(); ctx.translate(0, -100); ctx.rotate(((st.head || 0) * Math.PI) / 180);
    /* antennae */
    const sw = Math.sin(K.now * 3.3) * 4;
    [-1, 1].forEach((sd, i) => {
      K.line(ctx, [[sd * 20, -50], [sd * 34 + sw, -86], [sd * 46 + sw * 1.4, -104]], { stroke: P.ink, w: 4.5, boil: 0.6, seed: seed + 40 + i, taper: 0 });
      K.dot(ctx, sd * 46 + sw * 1.4, -108, 10, P.cherry, P.ink, 3, seed + 42 + i);
    });
    K.shape(ctx, K.ellipsePts(0, 0, 64, 60, 18), { fill: P.bee, w: 5.5, boil: 1.2, seed: seed + 44, shade: { color: P.beeDark, dx: 12, dy: 10 }, shine: { x: 0.28, y: 0.2 } });
    /* waitress cap */
    K.shape(ctx, [[-36, -46], [-24, -70], [24, -70], [36, -46], [20, -40], [-20, -40]], { fill: P.cherry, w: 4.5, boil: 0.9, seed: seed + 46, shade: { color: P.cherryDark, dx: 0, dy: 8 } });
    K.rule(ctx, [[-30, -48], [30, -48]], { stroke: P.cream, w: 5, boil: 0.5, seed: seed + 47 });
    /* cheeks */
    [-1, 1].forEach((sd, i) => { ctx.save(); ctx.globalAlpha = 0.55; K.shape(ctx, K.ellipsePts(sd * 40, 18, 12, 8, 8), { fill: P.cheek, stroke: null, w: 0, boil: 0.5, seed: seed + 48 + i, misreg: false }); ctx.restore(); });
    /* eyes with lashes */
    [-1, 1].forEach((sd, i) => {
      const ex = sd * 23, ey = -8 - (st.eyeUp || 0), bl = i === 1 ? Math.max(blink, wink) : blink;
      if (bl < 0.6) {
        K.shape(ctx, K.ellipsePts(ex, ey, 15, 19 * (1 - bl), 12), { fill: P.eye, w: 3.5, boil: 0.5, seed: seed + 50 + i, misreg: false });
        const px = ex + look[0] * 6, py = ey + 3 + look[1] * 6;
        K.shape(ctx, K.ellipsePts(px, py, 8.5, 10, 10), { fill: P.pupil, stroke: null, w: 0, boil: 0.3, seed: seed + 52 + i, misreg: false });
        K.dot(ctx, px - 3, py - 4, 3, "#ffffff", null, 0, seed + 54 + i);
        [-0.6, 0, 0.6].forEach((a, k) => K.rule(ctx, [[ex + sd * 10 + a * 8, ey - 17], [ex + sd * 16 + a * 12, ey - 26]], { stroke: P.ink, w: 3, boil: 0.3, seed: seed + 56 + k + i * 3 })); /* lashes */
      } else K.line(ctx, [[ex - 14, ey], [ex, ey + 6], [ex + 14, ey]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 60 + i });
      const br = st.brow || 0, inner = br < 0 ? -br * 7 : 0;
      K.line(ctx, [[ex - sd * 10, ey - 30 - br * 6 + inner], [ex + sd * 12, ey - 33 - br * 6 - inner * 0.5]], { stroke: P.ink, w: 4.5, boil: 0.4, seed: seed + 62 + i });
    });
    /* mouth */
    const m = st.mouth || "smile";
    if (talk > 0.04) K.talkMouth(ctx, 0, 26, talk, 0.9, seed + 70, "#6a2028", false);
    else if (m === "smile") K.line(ctx, [[-14, 26], [0, 34], [14, 26]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 71 });
    else if (m === "worry") K.line(ctx, [[-12, 34], [-4, 28], [4, 32], [12, 28]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 72 });
    else if (m === "grin") K.shape(ctx, [[-18, 24], [18, 24], [10, 38], [-10, 38]], { fill: "#6a2028", w: 3.5, boil: 0.5, seed: seed + 73 });
    else K.shape(ctx, K.ellipsePts(0, 32, m === "o" ? 7 : 11, m === "o" ? 8 : 12, 10), { fill: "#6a2028", w: 3.5, boil: 0.5, seed: seed + 74 });
    ctx.restore();
    /* "!" and "?" */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(-96, -200); ctx.rotate(-0.22); ctx.scale(a, a);
      K.shape(ctx, [[-9, -50], [9, -50], [5, -12], [-5, -12]], { fill: P.mustard, w: 4, boil: 0.8, seed: seed + 90 });
      K.shape(ctx, K.ellipsePts(0, 4, 7, 7, 8), { fill: P.mustard, w: 4, boil: 0.8, seed: seed + 91 });
      ctx.restore();
    }
    if (st.think > 0) {
      const a = K.E.back(clamp(st.think, 0, 1), 2);
      ctx.save(); ctx.translate((st.thinkSide || -1) * 100, -210); ctx.scale(a, a);
      K.dot(ctx, 40, 40, 7, P.cream, P.ink, 3, seed + 93); K.dot(ctx, 22, 20, 10, P.cream, P.ink, 3, seed + 94);
      K.shape(ctx, K.blobPts(-6, -18, 40, 32, 10, seed, 0.12), { fill: P.cream, w: 4, boil: 0.8, seed: seed + 95 });
      K.text(ctx, "?", -6, -16, { size: 44, weight: 900, fill: P.cherry });
      ctx.restore();
    }
    ctx.restore();
    /* arms: IK to hand targets, white gloves; pad in the left hand, pencil in the right */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const tg = st["arm" + k] || { x: sd * 64, y: -120 };
      const S = [sd * 50 * sxk, bodyY - 26 * syk];
      const r = K.ik2(S, [tg.x, tg.y - hop], 34, 32, sd > 0 ? -1 : 1);
      K.limb(ctx, [S, r.elbow, r.end], 10, P.bee, seed + 80 + sd);
      if (k === "L" && st.pad) K.orderPad(ctx, r.end[0] - 10, r.end[1] - 30, 0.7, st.write || 0, seed + 84);
      if (k === "R" && st.pad && st.write > 0) K.rule(ctx, [[r.end[0], r.end[1]], [r.end[0] - 26, r.end[1] - 22]], { stroke: P.mustardDark, w: 7, boil: 0.4, seed: seed + 86 });
      if (st.pointHand === k && st.pointAmt > 0.3) { /* pointing: the pencil sticks out along the line to the target */
        const pl = 58 * Math.min(1, (st.pointAmt - 0.3) / 0.4), ca = Math.cos(st.pointAng), sa = Math.sin(st.pointAng);
        K.rule(ctx, [[r.end[0], r.end[1]], [r.end[0] + ca * pl, r.end[1] + sa * pl]], { stroke: P.mustardDark, w: 9, boil: 0.4, seed: seed + 87 });
        K.shape(ctx, [[r.end[0] + ca * (pl + 16), r.end[1] + sa * (pl + 16)], [r.end[0] + ca * pl - sa * 5, r.end[1] + sa * pl + ca * 5], [r.end[0] + ca * pl + sa * 5, r.end[1] + sa * pl - ca * 5]], { fill: P.ink, stroke: null, w: 0, boil: 0.3, seed: seed + 89, misreg: false });
      }
      K.dot(ctx, r.end[0], r.end[1], 13, P.cream, P.ink, 3.5, seed + 88 + sd);
    });
    ctx.restore();
  };
  /* order pad: cream sheets, cherry header, scribble lines grow with write 0..1 */
  K.orderPad = function (ctx, x, y, s, write, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.12);
    K.shape(ctx, K.roundRectPts(-46, -60, 92, 120, 8, 2), { fill: P.cream, w: 4, boil: 0.8, seed, shade: { color: P.creamShade, dx: 8, dy: 8 } });
    K.shape(ctx, K.rectPts(-46, -60, 92, 22, 2), { fill: P.cherry, w: 4, boil: 0.6, seed: seed + 1 });
    for (let i = 0; i < 4; i++) {
      const u = clamp(write * 4 - i, 0, 1); if (u <= 0) continue;
      const pts = []; for (let j = 0; j <= 6; j++) pts.push([-32 + j * 10 * u, -20 + i * 20 + Math.sin(j * 2.1 + i) * 4]);
      K.line(ctx, pts, { stroke: P.inkSoft, w: 3, boil: 0.5, seed: seed + 3 + i });
    }
    ctx.restore();
  };
})(DK);
