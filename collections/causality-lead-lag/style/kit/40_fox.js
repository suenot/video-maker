/* ============================================================
   KIT 40 FOX: "Inspector Vulpes", the detective fox.
   Local space: feet on y = 0, faces the viewer; about 380 px to the hat
   crown at scale 1. Trench coat with popped collar and belt, fedora, big
   bushy tail, amber eyes. Arms are two-bone IK (62 + 58), so a pose is
   "where the paw goes".
   Pose state (all optional):
     squash   -1..1  (+ squashed wide, - stretched tall), volume kept
     lean     deg    whole-body tilt around the feet
     hop      px     lift off the ground (legs tuck)
     turn     -1..1  head turn (pseudo 3/4: face features slide sideways)
     look     [dx, dy] pupils, -1..1
     blink    0..1   lid     0..1 (sly half-lidded = 0.35)
     eyeUp    0..1   surprise: eyes widen, brows jump
     brow     -1..1.5   browTilt -1..1 (one brow up = skeptical)
     mouth    "smirk" | "smile" | "open" | "o" | "grin" | "flat"
     pawL/R   { x, y, rot }  target of the paw in local space
     hold     "magnifier" | "flashlight" | "pin"  (right paw);  holdL same for left
     lensEye  0..1   magnifier raised to the eye: the eye is drawn huge in the lens
     hatTip   deg,  hatLift px,  hat false = no hat
     tail     -1..1  sway;  legWalk phase (radians), 0 = standing
     exclaim  0..1   "!" pops over the head
     light    0..1   amber rim light on the left edge (lamp / clue light)
   Returns nothing; writes K.lensPt (screen point of the lens centre) when
   the magnifier is held, for iris transitions.
   ============================================================ */
var CK = window.CK || (window.CK = {});
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
  const limb = (ctx, pts, w, color, seed) => K.limb2(ctx, pts, w, color, seed);

  /* ---------- props held in a paw (local space of the paw, x along the forearm) ---------- */
  K.magnifier = function (ctx, x, y, ang, s, seed, inside) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    K.shape(ctx, K.rectPts(-10, -7, 56, 14, 2), { fill: "#3a2418", w: 4, boil: 0.6, seed });
    const cx = 92, r = 44;
    K.lensPt = ctx.getTransform().transformPoint(new DOMPoint(cx, 0));
    K.lensR = r * Math.hypot(ctx.getTransform().a, ctx.getTransform().b);
    ctx.save(); K.pathOf(ctx, K.ellipsePts(cx, 0, r, r, 18), true); ctx.clip();
    ctx.fillStyle = K.rgba(P.glass, 0.28); ctx.fillRect(cx - r, -r, r * 2, r * 2);
    if (inside) { ctx.save(); ctx.translate(cx, 0); ctx.rotate(-ang); inside(ctx, r); ctx.restore(); }
    ctx.restore();
    K.shape(ctx, K.ellipsePts(cx, 0, r, r, 18), { fill: null, stroke: P.brass, w: 11, boil: 0.6, seed: seed + 1, gap: 0 });
    K.shape(ctx, K.ellipsePts(cx, 0, r + 7, r + 7, 18), { fill: null, stroke: P.ink, w: 3, boil: 0.6, seed: seed + 2, gap: 0 });
    K.line(ctx, [[cx - r * 0.55, -r * 0.35], [cx - r * 0.2, -r * 0.65]], { stroke: "#ffffff", w: 5, boil: 0.4, seed: seed + 3, alpha: 0.75 });
    ctx.restore();
  };
  K.flashlight = function (ctx, x, y, ang, s, seed, on) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    if (on > 0) { K.cone(ctx, 60, 0, 0, 900, 0.55, P.amberGlow, on); K.glow(ctx, 62, 0, 50, K.rgba(P.amberGlow, 0.9), on); }
    K.shape(ctx, K.rectPts(-14, -9, 56, 18, 2), { fill: P.greyDark, w: 4, boil: 0.6, seed });
    K.shape(ctx, [[40, -12], [62, -18], [62, 18], [40, 12]], { fill: P.grey, w: 4, boil: 0.6, seed: seed + 1 });
    ctx.restore();
  };

  K.fox = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), turn = clamp(st.turn || 0, -1, 1);
    const seed = st.seed || 700, light = st.light == null ? 0 : st.light;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    /* ground shadow (stays on the floor while hopping) */
    K.shape(ctx, K.ellipsePts(0, 2, 96 - hop * 0.3, 15, 14), { fill: P.ink, stroke: null, w: 0, boil: 0.6, seed: seed + 1, alpha: 0.7 });
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    ctx.translate(0, -hop);
    const air = clamp(hop / 40, 0, 1);

    /* ---- tail: from under the coat (right side), bushy, sways ---- */
    const tw = (st.tail || 0) * 26 + Math.sin(K.now * 2.2) * 8;
    const tailPath = [[30, -96], [96, -84], [150 + tw * 0.4, -130], [158 + tw, -200], [130 + tw * 1.2, -250]];
    const tailPts = [];
    for (let i = 0; i < tailPath.length; i++) { const r = [14, 30, 42, 40, 22][i]; tailPts.push([tailPath[i][0] + r * 0.4, tailPath[i][1] + r]); }
    const outline = tailPath.map((p, i) => { const r = [14, 30, 42, 40, 22][i]; return [p[0] - r * 0.6, p[1] - r * 0.8]; });
    const tailShape = outline.concat([[tailPath[4][0] + 6, tailPath[4][1] - 30]], tailPts.slice().reverse());
    K.shape(ctx, tailShape, { fill: P.fur, w: 5, boil: 1.2, seed: seed + 2, shade: { color: P.furDark, dx: -16, dy: 4 } });
    K.shape(ctx, [[tailPath[3][0] - 34, tailPath[3][1] - 6], [tailPath[4][0] - 18, tailPath[4][1] - 34], [tailPath[4][0] + 12, tailPath[4][1] - 30], [tailPath[3][0] + 34, tailPath[3][1] + 4]], { fill: P.cream, w: 4, boil: 1, seed: seed + 3, shade: { color: P.creamShade, dx: -8, dy: 0 } });

    /* ---- legs + shoes ---- */
    for (let sd = -1; sd <= 1; sd += 2) {
      const ph = (st.legWalk || 0) + (sd > 0 ? Math.PI : 0);
      const lift = st.legWalk ? Math.max(0, Math.sin(ph)) * 14 : 0, fx = sd * 26 + (st.legWalk ? Math.cos(ph) * 14 : 0);
      const hip = [sd * 24 * sxk, -72 * syk], foot = [fx - sd * 8 * air, -lift - 12 * air];
      limb(ctx, [hip, [K.lerp(hip[0], foot[0], 0.5), K.lerp(hip[1], foot[1], 0.5)], foot], 20, P.trousers, seed + 10 + sd);
      K.shape(ctx, [[foot[0] - 18, foot[1] - 2], [foot[0] + sd * 34, foot[1] - 4], [foot[0] + sd * 36, foot[1] + 6], [foot[0] - 20, foot[1] + 6]], { fill: P.shoe, w: 4, boil: 0.6, seed: seed + 14 + sd });
    }

    /* ---- body (coat) in squash space ---- */
    ctx.save(); ctx.translate(0, -60); ctx.scale(sxk, syk); ctx.translate(0, 60);
    const coat = [[-56, -206], [-30, -214], [30, -214], [56, -206], [70, -150], [80, -64], [40, -58], [0, -62], [-40, -58], [-80, -64], [-70, -150]];
    K.shape(ctx, coat, { fill: P.coat, w: 6, boil: 1.3, seed: seed + 20, shade: { color: P.coatDark, dx: -24, dy: -6 }, hatch: { ang: 0.9, gap: 12, alpha: 0.18, color: P.coatDark } });
    if (light > 0) K.line(ctx, [[-54, -200], [-68, -150], [-78, -70]], { stroke: P.amber, w: 6, boil: 0.8, seed: seed + 21, alpha: light });
    /* belt + buckle */
    K.shape(ctx, [[-74, -134], [74, -134], [76, -116], [-76, -116]], { fill: P.belt, w: 4, boil: 0.8, seed: seed + 22 });
    K.shape(ctx, K.rectPts(-14, -138, 28, 26, 1), { fill: null, stroke: P.brass, w: 5, boil: 0.5, seed: seed + 23 });
    /* coat split + buttons */
    K.line(ctx, [[6, -112], [2, -62]], { stroke: P.ink, w: 4, boil: 0.8, seed: seed + 24 });
    [[-24, -176], [24, -176], [-24, -150], [24, -150]].forEach((b, i) => K.dot(ctx, b[0], b[1], 5, P.coatDark, P.ink, 2, seed + 25 + i));
    /* lapels: a V opening showing a dark shirt + tie */
    K.shape(ctx, [[-30, -214], [30, -214], [0, -160]], { fill: P.greyLight, w: 4, boil: 0.8, seed: seed + 30 });
    K.shape(ctx, [[-6, -206], [6, -206], [9, -172], [0, -162], [-9, -172]], { fill: P.string, w: 3, boil: 0.6, seed: seed + 31 });
    K.shape(ctx, [[-30, -214], [-50, -200], [-8, -150]], { fill: P.coatLight, w: 4, boil: 0.8, seed: seed + 32 });
    K.shape(ctx, [[30, -214], [50, -200], [8, -150]], { fill: P.coatLight, w: 4, boil: 0.8, seed: seed + 33, shade: { color: P.coat, dx: -6, dy: 0 } });
    /* popped collar */
    K.shape(ctx, [[-58, -204], [-62, -244], [-26, -222]], { fill: P.coat, w: 4.5, boil: 0.8, seed: seed + 34, shade: { color: P.coatDark, dx: 6, dy: 0 } });
    K.shape(ctx, [[58, -204], [62, -244], [26, -222]], { fill: P.coat, w: 4.5, boil: 0.8, seed: seed + 35, shade: { color: P.coatDark, dx: -6, dy: 0 } });

    /* ---- head ---- */
    const hx = turn * 6, hy = -276;
    ctx.save(); ctx.translate(hx, hy);
    const ft = turn * 14; /* face features slide with the turn */
    /* ears (behind the hat brim) */
    [-1, 1].forEach((sd, i) => {
      const tip = [sd * 80 + ft * 0.3, -96 + (sd === Math.sign(turn) ? 6 * Math.abs(turn) : 0)];
      K.shape(ctx, [[sd * 30, -36], tip, [sd * 62, -22]], { fill: P.fur, w: 5, boil: 1, seed: seed + 40 + i, shade: { color: P.furDark, dx: -sd * 8, dy: 0 } });
      K.shape(ctx, [[sd * 38, -38], [tip[0] - sd * 10, tip[1] + 18], [sd * 58, -28]], { fill: P.ink, stroke: null, w: 0, boil: 0.8, seed: seed + 42 + i });
    });
    /* skull: wide cheeks with fluff points, narrowing to the chin */
    const head = [[-48, -54], [0, -62], [48, -54], [66, -18], [84, 14], [60, 22], [34, 40], [ft, 54], [-34, 40], [-60, 22], [-84, 14], [-66, -18]];
    K.shape(ctx, head, { fill: P.fur, w: 5.5, boil: 1.2, seed: seed + 44, shade: { color: P.furDark, dx: -14, dy: -10 } });
    if (light > 0) K.line(ctx, [[-50, -48], [-66, -16], [-82, 12]], { stroke: P.amber, w: 6, boil: 0.8, seed: seed + 45, alpha: light });
    /* cream mask: cheeks + muzzle (heart shape) */
    K.shape(ctx, [[-78, 14], [-40, -2], [ft - 8, 6], [ft + 8, 6], [40, -2], [78, 14], [56, 22], [30, 38], [ft, 50], [-30, 38], [-56, 22]], { fill: P.cream, w: 3.5, boil: 1, seed: seed + 46, gap: 0.15, shade: { color: P.creamShade, dx: 0, dy: -8 } });
    /* nose */
    K.shape(ctx, K.ellipsePts(ft * 1.4, 14, 12, 8, 10), { fill: P.nose, w: 3, boil: 0.6, seed: seed + 47, gap: 0 });
    K.dot(ctx, ft * 1.4 - 4, 11, 2.5, "#ffffff", null, 0, seed + 48);
    /* mouth */
    const m = st.mouth || "smirk", mx = ft * 1.3;
    if (m === "smirk") K.line(ctx, [[mx - 16, 28], [mx - 2, 32], [mx + 12, 28], [mx + 22, 20]], { stroke: P.ink, w: 4, boil: 0.6, seed: seed + 50, gap: 0 });
    else if (m === "smile") K.line(ctx, [[mx - 20, 24], [mx - 8, 33], [mx + 8, 33], [mx + 20, 24]], { stroke: P.ink, w: 4, boil: 0.6, seed: seed + 51, gap: 0 });
    else if (m === "flat") K.line(ctx, [[mx - 14, 30], [mx + 14, 30]], { stroke: P.ink, w: 4, boil: 0.6, seed: seed + 52, gap: 0 });
    else if (m === "grin") K.shape(ctx, [[mx - 24, 22], [mx + 24, 22], [mx + 12, 38], [mx, 41], [mx - 12, 38]], { fill: "#5a1a1a", w: 4, boil: 0.6, seed: seed + 53, gap: 0 });
    else if (m === "open") K.shape(ctx, K.ellipsePts(mx, 32, 12, 11, 10), { fill: "#5a1a1a", w: 4, boil: 0.6, seed: seed + 54, gap: 0 });
    else if (m === "o") K.shape(ctx, K.ellipsePts(mx, 32, 6, 7, 8), { fill: "#5a1a1a", w: 3.5, boil: 0.5, seed: seed + 55, gap: 0 });
    /* eyes: almond, amber iris; lids for sly look; brows */
    const lid = clamp(st.lid == null ? 0.25 : st.lid, 0, 1), up = clamp(st.eyeUp || 0, 0, 1);
    [-1, 1].forEach((sd, i) => {
      const ex = sd * 28 + ft, ey = -16, rx = 17 + 3 * up, ry = (12 + 6 * up) * (1 - 0.92 * blink);
      const dl = st.lensEye > 0.5 && sd > 0 ? 0 : 1; /* the lens eye is drawn inside the magnifier */
      if (!dl) return;
      const eyePts = [[ex - rx, ey + 2], [ex - rx * 0.5, ey - ry], [ex + rx * 0.5, ey - ry], [ex + rx, ey - 2], [ex + rx * 0.4, ey + ry * 0.9], [ex - rx * 0.4, ey + ry * 0.9]];
      if (blink < 0.75) {
        K.shape(ctx, eyePts, { fill: P.eye, w: 3.5, boil: 0.6, seed: seed + 60 + i, gap: 0 });
        ctx.save(); K.pathOf(ctx, eyePts, true); ctx.clip();
        const px = ex + look[0] * 6, py = ey + look[1] * 4;
        K.shape(ctx, K.ellipsePts(px, py, 9, 10, 10), { fill: P.iris, stroke: null, w: 0, boil: 0.4, seed: seed + 62 + i });
        K.shape(ctx, K.ellipsePts(px, py, 3.6, 8, 8), { fill: P.pupil, stroke: null, w: 0, boil: 0.3, seed: seed + 64 + i });
        K.dot(ctx, px + 3, py - 4, 2.4, "#ffffff", null, 0, seed + 66 + i);
        /* upper lid (fur) */
        const ld = lid * (1 - up);
        if (ld > 0.02) { ctx.fillStyle = P.fur; ctx.fillRect(ex - rx - 2, ey - ry - 4, rx * 2 + 4, (ry * 2 + 4) * ld); }
        ctx.restore();
        if (ld > 0.02) K.line(ctx, [[ex - rx, ey - ry + (ry * 2) * ld - 2], [ex + rx, ey - ry + (ry * 2) * ld - 2]], { stroke: P.ink, w: 3.5, boil: 0.5, seed: seed + 68 + i, gap: 0 });
      } else K.line(ctx, [[ex - rx, ey], [ex, ey + 4], [ex + rx, ey]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 70 + i, gap: 0 });
      const br = (st.brow || 0) + up * 1.2 + (st.browTilt || 0) * sd * 0.8;
      K.line(ctx, [[ex - 16, ey - 22 - br * 7 + sd * 3], [ex + 14, ey - 24 - br * 7 - sd * 2]], { stroke: P.ink, w: 5, boil: 0.5, seed: seed + 72 + i, gap: 0 });
    });
    /* whisker dots */
    [-1, 1].forEach((sd) => [0, 1].forEach((k) => K.dot(ctx, ft * 1.3 + sd * (22 + k * 7), 22 + k * 4, 1.8, P.furDark, null, 0, seed + 80 + k)));
    /* fedora */
    if (st.hat !== false) {
      ctx.save(); ctx.translate(0, -50 - (st.hatLift || 0)); ctx.rotate(((st.hatTip || 0) * Math.PI) / 180);
      K.shape(ctx, [[-50, -2], [-46, -52], [-18, -62], [0, -50], [18, -62], [46, -52], [50, -2]], { fill: P.hat, w: 5, boil: 1, seed: seed + 90, shade: { color: P.hatDark, dx: -14, dy: 0 } });
      K.shape(ctx, [[-50, -16], [50, -16], [50, -2], [-50, -2]], { fill: P.hatBand, w: 3, boil: 0.6, seed: seed + 91 });
      K.shape(ctx, K.ellipsePts(0, 0, 96, 15, 16), { fill: P.hat, w: 5, boil: 1, seed: seed + 92, shade: { color: P.hatDark, dx: 0, dy: 8 } });
      ctx.restore();
    }
    /* "!" */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(110, -110); ctx.rotate(0.2); ctx.scale(a, a);
      K.shape(ctx, [[-10, -56], [10, -56], [5, -12], [-5, -12]], { fill: P.amber, w: 4, boil: 0.8, seed: seed + 95, gap: 0 });
      K.shape(ctx, K.ellipsePts(0, 4, 8, 8, 8), { fill: P.amber, w: 4, boil: 0.8, seed: seed + 96, gap: 0 });
      ctx.restore();
    }
    ctx.restore(); /* head */
    ctx.restore(); /* squash space */

    /* ---- arms (unsquashed so paws keep their size) ---- */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const def = { x: sd * 86, y: -96, rot: null };
      const c = st["paw" + k] || def;
      const S = [sd * 56 * sxk, -196 * syk + 60 * (1 - syk)];
      const r = K.ik2(S, [c.x, c.y], 62, 58, sd > 0 ? -1 : 1);
      limb(ctx, [S, r.elbow, r.end], 26, P.coat, seed + 100 + sd);
      const ang = c.rot != null ? (c.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      /* cuff + paw */
      const cuff = [r.end[0] - Math.cos(ang) * 8, r.end[1] - Math.sin(ang) * 8];
      K.shape(ctx, K.ellipsePts(cuff[0], cuff[1], 17, 17, 10), { fill: P.coatLight, w: 4, boil: 0.6, seed: seed + 104 + sd });
      const hold = k === "R" ? st.hold : st.holdL;
      if (hold === "magnifier") K.magnifier(ctx, r.end[0], r.end[1], ang, 1, seed + 110 + sd, st.lensEye > 0.5 && k === "R" ? bigEye(st, seed) : st.lensInside);
      else if (hold === "flashlight") K.flashlight(ctx, r.end[0], r.end[1], ang, 1, seed + 120 + sd, st.flashOn == null ? 1 : st.flashOn);
      else if (hold === "pin") K.pin && K.pin(ctx, r.end[0] + Math.cos(ang) * 22, r.end[1] + Math.sin(ang) * 22, P.string, 1.1);
      K.shape(ctx, K.ellipsePts(r.end[0], r.end[1], 15, 13, 10, ang), { fill: P.paw, w: 4, boil: 0.6, seed: seed + 106 + sd });
    });
    ctx.restore();
  };
  /* the giant eye seen through the lens (gag) */
  function bigEye(st, seed) {
    return function (ctx, r) {
      const b = clamp(st.blink || 0, 0, 1);
      ctx.fillStyle = P.fur; ctx.fillRect(-r, -r, r * 2, r * 2);
      const ry = 26 * (1 - 0.92 * b);
      K.shape(ctx, [[-36, 2], [-18, -ry], [18, -ry], [36, -2], [14, ry * 0.9], [-14, ry * 0.9]], { fill: P.eye, w: 4, boil: 0.6, seed: seed + 130, gap: 0 });
      if (b < 0.75) {
        K.shape(ctx, K.ellipsePts(2, 0, 18, 20, 12), { fill: P.iris, stroke: null, w: 0, boil: 0.5, seed: seed + 131 });
        K.shape(ctx, K.ellipsePts(2, 0, 7, 16, 10), { fill: P.pupil, stroke: null, w: 0, boil: 0.4, seed: seed + 132 });
        K.dot(ctx, 8, -8, 4, "#ffffff", null, 0, seed + 133);
      }
      K.line(ctx, [[-30, -36], [26, -42]], { stroke: P.ink, w: 7, boil: 0.5, seed: seed + 134, gap: 0 });
    };
  }

  /* seeded blink curve, about one blink per 2.1 s */
  K.blinkAt = function (t, seed) {
    let b = 0;
    const i0 = Math.max(0, Math.floor((t - 2) / 2.1));
    for (let i = i0; i < i0 + 3; i++) {
      const tb = 0.8 + i * 2.1 + K.hash(i, seed || 7) * 1.2, d = t - tb;
      if (d > 0 && d < 0.16) b = Math.max(b, Math.sin((d / 0.16) * Math.PI));
    }
    return b;
  };
})(CK);
