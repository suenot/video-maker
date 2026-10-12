/* ============================================================
   VAUDEVILLE KIT 40 CAT: "Dapper Dan", the ragtime cat who MCs the show.
   A 1920s rubber-hose cartoon: black fur with a white shine, white
   muzzle, pie-cut eyes, bowler hat, white bow tie and shirt front,
   white four-finger gloves, black shoes with white spats, an S tail.
   Local space: feet on y = 0, faces the viewer. Scale 1 = 330 px tall.
   Pose (all optional):
     squash   -1..1 (+ wide, - tall), volume kept     lean   deg around the feet
     hop      px off the ground                       turn   -1..1 face shifts (3/4 feel)
     look     [dx, dy] pupils -1..1                   blink  0..1   wink 0..1 (right eye)
     mouth    "smile" | "grin" | "open" | "o" | "sly" brow   -1..1.5
     gloveL/R {x, y, open 0..1, rot deg}  IK target of each glove (local px)
     footL/R  {x, y}  shoe targets (defaults: standing)
     hatTip deg, hatLift px, hatInHand true (hat rides on the right glove)
     tail     phase offset, exclaim 0..1 ("!" card), seed
     talk     0..1 loudness: talking mouth (overrides mouth while > 0.06)
     viseme   "a" | "o" | "e" | "m" (optional; default cycles from the boil clock)
     nod      0..1 head dips (listening), tilt deg head tilt, think 0..1 ("?" bubble)
   Returns { head, gloveL, gloveR } in canvas device px (for props and pointing).
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;

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

  /* white cartoon glove at (x, y) pointing along ang; open 0 = fist, 1 = spread palm,
     open < 0 = pointing (index finger out, the others curled) */
  K.glove = function (ctx, x, y, ang, open, s, seed, flip) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s * (flip || 1));
    const pointing = open != null && open < 0;
    const o = clamp(open == null ? 0.5 : open, 0, 1);
    if (pointing) K.shape(ctx, K.roundPts(10, -16, 44, 14, 7), { fill: P.paper, w: 4, boil: 0.6, seed: seed + 8 });
    /* fingers (3 + thumb) */
    for (let f = 0; f < 3 && !pointing; f++) {
      const fa = (f - 1) * (0.18 + 0.32 * o), len = 14 + 20 * o;
      const bx = 14, by = (f - 1) * 9;
      K.shape(ctx, K.ellipsePts(bx + Math.cos(fa) * len * 0.6, by + Math.sin(fa) * len * 0.6, len * 0.62 + 6, 8, 10, fa), { fill: P.paper, w: 4, boil: 0.6, seed: seed + f });
    }
    K.shape(ctx, K.ellipsePts(4, -16 - 8 * o, 8, 13, 10, -0.6 - 0.5 * o), { fill: P.paper, w: 4, boil: 0.6, seed: seed + 4 });
    K.shape(ctx, K.ellipsePts(2, 0, 20, 18, 12), { fill: P.paper, w: 4.5, boil: 0.7, seed: seed + 5, shade: { color: P.g5, dx: -5, dy: -6 } });
    /* cuff + back stitches */
    K.shape(ctx, K.roundPts(-26, -15, 12, 30, 5), { fill: P.paper, w: 4, boil: 0.6, seed: seed + 6 });
    [-6, 0, 6].forEach((dy, i) => K.line(ctx, [[-4, dy], [8, dy * 1.2]], { stroke: P.ink, w: 2.6, boil: 0.3, seed: seed + 7 + i }));
    ctx.restore();
  };

  /* pie-cut eye: white oval, black pupil with a wedge cut out (the 1920s eye) */
  K.pieEye = function (ctx, x, y, rx, ry, look, blink, seed, wink) {
    const b = clamp(Math.max(blink || 0, wink || 0), 0, 1);
    if (b > 0.75) { K.line(ctx, [[x - rx, y + 2], [x, y + ry * 0.25], [x + rx, y + 2]], { stroke: P.ink, w: 5, boil: 0.4, seed: seed + 9 }); return; }
    const ryb = ry * (1 - 0.9 * b);
    K.shape(ctx, K.ellipsePts(x, y, rx, ryb, 16), { fill: P.paper, w: 4, boil: 0.5, seed });
    ctx.save(); K.pathOf(ctx, K.ellipsePts(x, y, rx, ryb, 16), true); ctx.clip();
    const px = x + (look ? look[0] : 0) * rx * 0.4, py = y + (look ? look[1] : 0) * ry * 0.35 + ry * 0.12;
    ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(px, py, rx * 0.55, ry * 0.6, 0, 0, K.TAU); ctx.fill();
    /* the pie cut: a wedge of white toward the upper right */
    ctx.fillStyle = P.paper; ctx.beginPath(); ctx.moveTo(px + rx * 0.08, py - ry * 0.08); ctx.arc(px, py, ry * 0.7, -1.25, -0.55); ctx.closePath(); ctx.fill();
    ctx.restore();
    /* lid on half-blink */
    if (b > 0.05) { ctx.save(); K.pathOf(ctx, K.ellipsePts(x, y, rx, ryb, 16), true); ctx.clip(); ctx.fillStyle = P.ink; ctx.fillRect(x - rx - 2, y - ryb - 2, rx * 2 + 4, ryb * 2 * b + 2); ctx.restore(); }
  };

  /* bowler hat (local: brim centre at 0,0) */
  K.bowler = function (ctx, seed) {
    const dome = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; dome.push([Math.cos(a) * 54, -6 + Math.sin(a) * 58]); }
    K.shape(ctx, dome, { fill: P.ink, w: 5, boil: 0.7, seed, shine: { dx: 9, dy: 12, s: 0.78, a: 0.9 } });
    K.shape(ctx, K.roundPts(-54, -20, 108, 15, 4), { fill: P.g2, w: 3.5, boil: 0.5, seed: seed + 1 });
    K.shape(ctx, [[-82, 0], [-60, -10], [60, -10], [82, 0], [74, 8], [-74, 8]], { fill: P.ink, w: 5, boil: 0.6, seed: seed + 2, shine: { dx: 0, dy: 4, s: 0.85, a: 0.5 } });
  };

  K.cat = function (ctx, x, y, s, st) {
    st = st || {};
    const seed = st.seed || 800;
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], turn = clamp(st.turn || 0, -1, 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    const hipY = -78 * syk - hop;
    /* tail: an S curve that sways */
    const tp = K.now * 2.4 + (st.tail || 0);
    K.hose(ctx, [[30 * sxk, hipY + 14], [78, hipY - 10 + 8 * Math.sin(tp)], [96 + 10 * Math.sin(tp + 1), hipY - 80], [74 + 14 * Math.sin(tp + 2), hipY - 140], [92 + 10 * Math.sin(tp + 2.6), hipY - 166]], 9, P.ink, seed + 1);
    /* legs (rubber hose) + spats shoes */
    [["L", -1], ["R", 1]].forEach(([k, sd], i) => {
      const f = st["foot" + k] || { x: sd * 34, y: 0 };
      const H = [sd * 22 * sxk, hipY + 6], F = [f.x, f.y - hop * 0.15 - (hop > 0 ? hop * 0.85 * 0.3 : 0)];
      const r = K.ik2(H, F, 44, 44, sd < 0 ? 1 : -1);
      K.hose(ctx, [H, r.elbow, r.end], 12, P.ink, seed + 10 + i);
      ctx.save(); ctx.translate(r.end[0], r.end[1]);
      K.shape(ctx, K.ellipsePts(sd * 16, 2, 30, 14, 14), { fill: P.ink, w: 4.5, boil: 0.6, seed: seed + 12 + i, shine: { dx: 4, dy: 5, s: 0.7, a: 0.85 } });
      K.shape(ctx, K.roundPts(-14, -16, 28, 15, 5), { fill: P.paper, w: 4, boil: 0.5, seed: seed + 14 + i });
      ctx.restore();
    });
    ctx.save(); ctx.translate(0, hipY); ctx.scale(sxk, syk);
    /* body: pear, black with shine; white shirt front + bow tie */
    const body = [[-38, 6], [-54, -40], [-46, -86], [-26, -104], [26, -104], [46, -86], [54, -40], [38, 6], [0, 14]];
    K.shape(ctx, body, { fill: P.ink, w: 5.5, boil: 1, seed: seed + 20, shine: { dx: -8, dy: 9, s: 0.82, a: 0.6 } });
    K.shape(ctx, [[-22, -100], [22, -100], [10, -40], [0, -28], [-10, -40]], { fill: P.paper, w: 4, boil: 0.6, seed: seed + 21 });
    [-74, -58].forEach((by, i) => K.dot(ctx, 0, by, 3.5, P.ink, P.ink, 1, seed + 22 + i));
    ctx.restore();
    /* head */
    const nod = clamp(st.nod || 0, 0, 1);
    const hx = turn * 6, hy = hipY - 104 * syk - 70 * (1 + (syk - 1) * 0.6) + 10 * nod;
    ctx.save(); ctx.translate(hx, hy); ctx.scale(lerp(1, sxk, 0.6), lerp(1, syk, 0.6));
    ctx.rotate((turn * 4 + Math.sin(K.now * 2.1) * 1.5 + (st.tilt || 0) + 7 * nod) * Math.PI / 180);
    /* ears (behind the hat) */
    [-1, 1].forEach((sd, i) => {
      const tw = sd === 1 && st.earTwitch ? st.earTwitch * 8 : 0;
      K.shape(ctx, [[sd * 30, -50], [sd * (66 + tw), -96 - tw], [sd * 70, -36]], { fill: P.ink, w: 5, boil: 0.7, seed: seed + 30 + i });
      K.shape(ctx, [[sd * 42, -54], [sd * (62 + tw), -82 - tw], [sd * 62, -46]], { fill: P.g2, stroke: null, w: 0, boil: 0.5, seed: seed + 32 + i });
    });
    const skull = []; for (let i = 0; i < 18; i++) { const a = (i / 18) * K.TAU; skull.push([Math.cos(a) * 74, Math.sin(a) * (Math.sin(a) > 0 ? 62 : 70)]); }
    K.shape(ctx, skull, { fill: P.ink, w: 5.5, boil: 1, seed: seed + 34, shine: { dx: 10, dy: 12, s: 0.8, a: 0.55 } });
    /* muzzle: white peanut */
    const fx = turn * 16;
    const muz = [[fx - 52, 14], [fx - 46, -6], [fx - 22, -4], [fx, 4], [fx + 22, -4], [fx + 46, -6], [fx + 52, 14], [fx + 36, 46], [fx, 56], [fx - 36, 46]];
    K.shape(ctx, muz, { fill: P.paper, w: 4.5, boil: 0.8, seed: seed + 36, shade: { color: P.g5, dx: 0, dy: -8 } });
    /* eyes (tall, close together) */
    const brow = st.brow || 0, eyeY = -22 - (st.eyeUp || 0);
    K.pieEye(ctx, fx - 20, eyeY, 17, 27 + (st.eyeUp ? 4 : 0), look, st.blink, seed + 40);
    K.pieEye(ctx, fx + 20, eyeY, 17, 27 + (st.eyeUp ? 4 : 0), look, st.blink, seed + 50, st.wink);
    [-1, 1].forEach((sd, i) => K.line(ctx, [[fx + sd * 8, eyeY - 34 - brow * 8 + (i ? -brow : brow) * 3], [fx + sd * 34, eyeY - 40 - brow * 10]], { stroke: P.paper, w: 5, boil: 0.4, seed: seed + 60 + i }));
    /* nose + mouth */
    K.shape(ctx, K.ellipsePts(fx, 14, 11, 7, 10), { fill: P.ink, w: 3, boil: 0.4, seed: seed + 62, shine: { dx: 2, dy: 3, s: 0.6, a: 0.8 } });
    const m = st.mouth || "smile", talk = clamp(st.talk || 0, 0, 1);
    if (talk > 0.06) K.talkMouth(ctx, fx, 26, talk, st.viseme, seed + 130, 1);
    else if (m === "smile") K.line(ctx, [[fx - 26, 26], [fx - 12, 38], [fx, 30], [fx + 12, 38], [fx + 26, 26]], { stroke: P.ink, w: 4.5, boil: 0.5, seed: seed + 63 });
    else if (m === "sly") K.line(ctx, [[fx - 22, 32], [fx, 34], [fx + 18, 30], [fx + 30, 22]], { stroke: P.ink, w: 4.5, boil: 0.5, seed: seed + 64 });
    else if (m === "grin") { K.shape(ctx, [[fx - 32, 24], [fx + 32, 24], [fx + 18, 46], [fx, 50], [fx - 18, 46]], { fill: P.g1, w: 4, boil: 0.5, seed: seed + 65 }); K.shape(ctx, [[fx - 26, 26], [fx + 26, 26], [fx + 20, 32], [fx - 20, 32]], { fill: P.paper, stroke: null, w: 0, boil: 0.3, seed: seed + 66 }); }
    else if (m === "open") { K.shape(ctx, K.ellipsePts(fx, 38, 18, 15, 12), { fill: P.g1, w: 4, boil: 0.5, seed: seed + 67 }); K.shape(ctx, K.ellipsePts(fx, 46, 10, 5, 8), { fill: P.g3, stroke: null, w: 0, boil: 0.3, seed: seed + 68 }); }
    else if (m === "o") K.shape(ctx, K.ellipsePts(fx, 36, 8, 9, 10), { fill: P.g1, w: 3.5, boil: 0.4, seed: seed + 69 });
    /* whiskers */
    [-1, 1].forEach((sd, i) => [0, 1].forEach((k) => K.line(ctx, [[fx + sd * 44, 20 + k * 10], [fx + sd * 70, 14 + k * 16], [fx + sd * 92, 12 + k * 24]], { stroke: P.paper, w: 3, boil: 0.5, seed: seed + 70 + i * 2 + k, taper: [0.9, 0.05] })));
    /* hat */
    if (!st.hatInHand) {
      ctx.save(); ctx.translate(turn * 4, -58 - (st.hatLift || 0)); ctx.rotate(((st.hatTip || 0) - 6) * Math.PI / 180);
      K.bowler(ctx, seed + 80); ctx.restore();
    }
    ctx.restore();
    /* bow tie at the collar */
    ctx.save(); ctx.translate(0, hipY - 104 * syk + 2); ctx.rotate(Math.sin(K.now * 3) * 0.06);
    K.shape(ctx, [[0, 0], [-28, -16], [-30, 16]], { fill: P.paper, w: 4, boil: 0.5, seed: seed + 90 });
    K.shape(ctx, [[0, 0], [28, -16], [30, 16]], { fill: P.paper, w: 4, boil: 0.5, seed: seed + 91 });
    K.dot(ctx, 0, 0, 8, P.paper, P.ink, 4, seed + 92);
    ctx.restore();
    /* arms: rubber hose with IK elbows, gloves in front */
    const out = {};
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const g = st["glove" + k] || { x: sd * 74, y: -150, open: 0.4 };
      const S = [sd * 42 * sxk, hipY - 86 * syk];
      const r = K.ik2(S, [g.x, g.y - hop], 52, 50, sd > 0 ? -1 : 1);
      K.hose(ctx, [S, r.elbow, r.end], 10, P.ink, seed + 100 + sd);
      const ang = g.rot != null ? (g.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      if (k === "R" && st.hatInHand) { ctx.save(); ctx.translate(r.end[0] + 6, r.end[1] - 34); ctx.rotate((st.hatTip || -10) * Math.PI / 180); K.bowler(ctx, seed + 80); ctx.restore(); }
      K.glove(ctx, r.end[0], r.end[1], ang, g.open, 1.05, seed + 110 + sd * 10, sd < 0 ? -1 : 1);
      const gp = ctx.getTransform().transformPoint(new DOMPoint(r.end[0] + Math.cos(ang) * 30, r.end[1] + Math.sin(ang) * 30));
      out["glove" + k] = [gp.x, gp.y];
    });
    if (st.think > 0) K.thought(ctx, 120, hy - 150, 1, st.think, "?", seed + 140);
    /* "!" on a little card (language-neutral) */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.4);
      ctx.save(); ctx.translate(110, hy - 120); ctx.rotate(0.2); ctx.scale(a, a);
      K.shape(ctx, [[-10, -56], [10, -56], [6, -12], [-6, -12]], { fill: P.gold, w: 4.5, boil: 0.6, seed: seed + 120 });
      K.dot(ctx, 0, 4, 8, P.gold, P.ink, 4.5, seed + 121);
      ctx.restore();
    }
    const hp = ctx.getTransform().transformPoint(new DOMPoint(hx, hy));
    ctx.restore();
    out.head = [x + hx * s, y + hy * s]; out.headPx = [hp.x, hp.y];
    return out;
  };

  /* blink curve with seeded blink times, 0..1 */
  K.blinkAt = function (t, seed) {
    let b = 0;
    for (let i = 0; i < 20; i++) {
      const tb = 0.7 + i * 1.8 + K.hash(i, seed || 7) * 1.1, d = t - tb;
      if (d > 0 && d < 0.16) b = Math.max(b, Math.sin((d / 0.16) * Math.PI));
    }
    return b;
  };
})(VK);
