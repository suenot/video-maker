/* ============================================================
   KIT 42 HOUND: "Sergeant Basset", the co-host (host B, the curious one).
   A stocky basset hound in a navy police coat with brass buttons and a
   peaked cap; long ears, heavy jowls, droopy eyes, a spiral notebook and
   a pencil. Watson to Inspector Vulpes: he writes things down and asks.
   Local space: feet on y = 0, faces the viewer; about 330 px to the cap
   crown at scale 1 (0.87x the fox). Arms are two-bone IK (50 + 48).
   Pose state (all optional):
     squash   -1..1  volume kept;  lean deg;  hop px
     look     [dx, dy] pupils -1..1;  blink 0..1;  lid 0..1 (droopy default 0.42)
     eyeUp    0..1   surprise (eyes round, lids up, ears lift)
     brow     -1..1.5;  browTilt -1..1 (one brow up: puzzled)
     talk     0..1   loudness of his voice: viseme-ish mouth (K.speech); viseme forces a shape
     mouth    "smile" | "frown" | "open" | "o" | "flat"   (when not talking)
     head     deg    head tilt (curious);  nod 0..1 head dip
     ears     -1..1  ear swing (+ flap outwards);  tail -1..1 wag
     pawL/R   { x, y, rot }  IK targets in local space
     holdL    "notebook" (default) | null;  holdR "pencil" (default) | "magnifier" | "flashlight" | null
     write    0..1   pencil scribbles on the notebook (animated by K.now)
     exclaim  0..1   "!" ;  question 0..1  "?" (thinking)
     cap      false = no cap;  capTip deg
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  const P = K.P, { clamp } = K;
  const limb = (ctx, pts, w, color, seed) => K.limb2(ctx, pts, w, color, seed);

  /* spiral notebook held upright in a paw; open 0..1, lines = scribbles written so far */
  K.notebook = function (ctx, x, y, ang, s, seed, write) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    K.shape(ctx, K.rectPts(-34, -78, 68, 92, 2), { fill: P.paper, w: 4, boil: 0.8, seed, shade: { color: P.paperShade, dx: -6, dy: -6 } });
    for (let i = 0; i < 5; i++) K.dot(ctx, -24 + i * 12, -78, 4.5, P.greyLight, P.ink, 2, seed + 1 + i);
    const n = Math.floor(2 + (write || 0) * 4);
    for (let i = 0; i < 5; i++) {
      const yy = -58 + i * 15;
      K.line(ctx, [[-24, yy], [24, yy]], { stroke: K.rgba(P.B, 0.5), w: 1.6, boil: 0.4, seed: seed + 10 + i, gap: 0, taper: false });
      if (i < n) K.line(ctx, [[-22, yy - 4], [-8, yy - 7], [4, yy - 3], [16 - 8 * K.hash(i, seed), yy - 6]], { stroke: P.ink, w: 2.4, boil: 0.6, seed: seed + 20 + i, gap: 0.1 });
    }
    ctx.restore();
  };
  K.pencil = function (ctx, x, y, ang, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    K.shape(ctx, K.rectPts(-6, -5, 46, 10, 2), { fill: P.amber, w: 3, boil: 0.5, seed });
    K.shape(ctx, [[40, -5], [54, 0], [40, 5]], { fill: P.houndLight, w: 3, boil: 0.4, seed: seed + 1 });
    K.dot(ctx, 53, 0, 2.2, P.ink, null, 0, seed + 2);
    K.shape(ctx, K.rectPts(-12, -5, 7, 10, 1), { fill: P.string, w: 2.5, boil: 0.4, seed: seed + 3 });
    ctx.restore();
  };

  K.hound = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1);
    const up = clamp(st.eyeUp || 0, 0, 1), seed = st.seed || 900, now = K.now;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shape(ctx, K.ellipsePts(0, 2, 112 - hop * 0.3, 16, 14), { fill: P.ink, stroke: null, w: 0, boil: 0.6, seed: seed + 1, alpha: 0.7 });
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    ctx.translate(0, -hop);

    /* tail: thin, wagging, white tip, behind the coat on his left */
    const wag = (st.tail || 0) * 0.5 + Math.sin(now * 5.5) * 0.15;
    ctx.save(); ctx.translate(58, -78); ctx.rotate(-0.9 + wag);
    K.shape(ctx, [[0, -9], [56, -14], [86, -8], [88, 4], [56, 2], [0, 9]], { fill: P.hound, w: 4.5, boil: 0.9, seed: seed + 2, shade: { color: P.houndDark, dx: 0, dy: -5 } });
    K.shape(ctx, [[70, -12], [90, -7], [90, 5], [70, 3]], { fill: P.cream, w: 3.5, boil: 0.6, seed: seed + 3 });
    ctx.restore();

    /* stubby legs + big paws */
    for (let sd = -1; sd <= 1; sd += 2) {
      const hip = [sd * 34 * sxk, -50 * syk], foot = [sd * 40, -2];
      limb(ctx, [hip, [sd * 38, -26], foot], 28, P.uniformDark, seed + 10 + sd);
      K.shape(ctx, K.ellipsePts(foot[0] + sd * 8, foot[1] - 4, 30, 15, 12), { fill: P.hound, w: 4.5, boil: 0.7, seed: seed + 12 + sd, shade: { color: P.houndDark, dx: 0, dy: -5 } });
      [-1, 0, 1].forEach((k) => K.line(ctx, [[foot[0] + sd * 8 + k * 11, foot[1] - 12], [foot[0] + sd * 8 + k * 11, foot[1] - 4]], { stroke: P.ink, w: 2.5, boil: 0.4, seed: seed + 14 + k, gap: 0 }));
    }

    /* coat (squash space): pear shaped, brass buttons, belt */
    ctx.save(); ctx.translate(0, -50); ctx.scale(sxk, syk); ctx.translate(0, 50);
    const coat = [[-62, -196], [-30, -206], [30, -206], [62, -196], [86, -140], [96, -92], [88, -48], [40, -40], [0, -44], [-40, -40], [-88, -48], [-96, -92], [-86, -140]];
    K.shape(ctx, coat, { fill: P.uniform, w: 6, boil: 1.2, seed: seed + 20, shade: { color: P.uniformDark, dx: -26, dy: -8 }, hatch: { ang: 0.9, gap: 13, alpha: 0.16, color: P.uniformDark } });
    K.shape(ctx, [[-90, -100], [90, -100], [92, -84], [-92, -84]], { fill: P.ink, w: 3.5, boil: 0.7, seed: seed + 21 });
    K.shape(ctx, K.rectPts(-14, -104, 28, 24, 1), { fill: null, stroke: P.brass, w: 5, boil: 0.5, seed: seed + 22 });
    [[-22, -176], [22, -176], [-24, -144], [24, -144], [-22, -66], [22, -66]].forEach((b, i) => K.dot(ctx, b[0], b[1], 6, P.brass, P.ink, 2, seed + 23 + i));
    /* white chest blaze in the collar V */
    K.shape(ctx, [[-30, -206], [30, -206], [0, -158]], { fill: P.cream, w: 4, boil: 0.7, seed: seed + 30 });
    K.shape(ctx, [[-30, -206], [-54, -196], [-8, -150]], { fill: P.uniformLight, w: 4, boil: 0.7, seed: seed + 31 });
    K.shape(ctx, [[30, -206], [54, -196], [8, -150]], { fill: P.uniformLight, w: 4, boil: 0.7, seed: seed + 32 });
    /* shoulder badge */
    K.shape(ctx, [[54, -186], [70, -180], [72, -160], [62, -152], [52, -160]], { fill: P.brass, w: 3, boil: 0.5, seed: seed + 33 });

    /* ---- head ---- */
    ctx.save(); ctx.translate(0, -254 + (st.nod || 0) * 12); ctx.rotate(((st.head || 0) * Math.PI) / 180);
    const ew = (st.ears || 0) * 0.35 + up * 0.35 + Math.sin(now * 2.1) * 0.04;
    /* ears: long, droopy, behind the jowls; they swing from the skull sides */
    [-1, 1].forEach((sd, i) => {
      ctx.save(); ctx.translate(sd * 48, -40); ctx.rotate(sd * (0.12 + ew) + Math.sin(now * 1.6 + i) * 0.03);
      const ear = [[-sd * 4, -6], [sd * 22, -2], [sd * 34, 40], [sd * 36, 92], [sd * 22, 118], [sd * 4, 112], [-sd * 6, 70], [-sd * 10, 20]];
      K.shape(ctx, ear, { fill: P.houndEar, w: 5, boil: 1, seed: seed + 40 + i, shade: { color: P.houndEarDark, dx: sd * 8, dy: -6 } });
      ctx.restore();
    });
    /* skull */
    const skull = [[-46, -64], [0, -76], [46, -64], [60, -30], [56, 6], [40, 26], [-40, 26], [-56, 6], [-60, -30]];
    K.shape(ctx, skull, { fill: P.hound, w: 5.5, boil: 1.1, seed: seed + 44, shade: { color: P.houndDark, dx: -12, dy: -10 } });
    /* white blaze up the nose */
    K.shape(ctx, [[-8, -72], [8, -72], [14, -10], [-14, -10]], { fill: P.cream, stroke: null, w: 0, boil: 0.6, seed: seed + 45 });
    /* muzzle + jowls (heavy, hanging past the chin) */
    const jl = 6 * Math.sin(now * 3.2) * (st.talk || 0);
    const muzzle = [[-40, -8], [-16, -14], [16, -14], [40, -8], [50, 26], [42, 54 + jl], [22, 60], [0, 52], [-22, 60], [-42, 54 + jl], [-50, 26]];
    K.shape(ctx, muzzle, { fill: P.houndLight, w: 5, boil: 1, seed: seed + 46, shade: { color: P.hound, dx: 0, dy: -10 } });
    K.line(ctx, [[0, 14], [0, 36]], { stroke: P.ink, w: 3.5, boil: 0.5, seed: seed + 47, gap: 0 });
    /* mouth under the nose */
    const sp = (st.talk || 0) > 0.06 || st.viseme ? K.speech(st.talk, now, seed, st.viseme) : null;
    if (sp) K.talkMouth(ctx, 0, 40, 40, sp, seed + 48);
    else {
      const m = st.mouth || "smile";
      if (m === "smile") K.line(ctx, [[-26, 34], [-12, 42], [0, 37], [12, 42], [26, 34]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 49, gap: 0 });
      else if (m === "frown") K.line(ctx, [[-24, 44], [-12, 37], [0, 40], [12, 37], [24, 44]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 50, gap: 0 });
      else if (m === "flat") K.line(ctx, [[-20, 40], [20, 40]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 51, gap: 0 });
      else K.talkMouth(ctx, 0, 40, 36, m === "o" ? { open: 0.45, wide: 0.3, round: 1 } : { open: 0.85, wide: 0.8, round: 0 }, seed + 52);
    }
    /* big nose */
    K.shape(ctx, K.ellipsePts(0, 4, 20, 13, 12), { fill: P.nose, w: 3.5, boil: 0.6, seed: seed + 53, gap: 0 });
    K.dot(ctx, -6, 0, 3.4, "#ffffff", null, 0, seed + 54);
    /* droopy eyes with bags */
    const lid = clamp(st.lid == null ? 0.42 : st.lid, 0, 1) * (1 - up);
    [-1, 1].forEach((sd, i) => {
      const ex = sd * 26, ey = -32, r = 15 + 4 * up, ry = r * (1 - 0.92 * blink);
      K.line(ctx, [[ex - 14, ey + 18], [ex, ey + 23], [ex + 14, ey + 18]], { stroke: P.houndDark, w: 3, boil: 0.5, seed: seed + 60 + i, gap: 0 });
      if (blink < 0.75) {
        const eye = K.ellipsePts(ex, ey, r, Math.max(2, ry), 14);
        K.shape(ctx, eye, { fill: P.eye, w: 3.5, boil: 0.5, seed: seed + 62 + i, gap: 0 });
        ctx.save(); K.pathOf(ctx, eye, true); ctx.clip();
        const px = ex + look[0] * 6, py = ey + 3 + look[1] * 5;
        K.shape(ctx, K.ellipsePts(px, py, 9, 9.5, 10), { fill: P.houndDark, stroke: null, w: 0, boil: 0.4, seed: seed + 64 + i });
        K.shape(ctx, K.ellipsePts(px, py, 5, 5.5, 8), { fill: P.pupil, stroke: null, w: 0, boil: 0.3, seed: seed + 66 + i });
        K.dot(ctx, px + 3, py - 3, 2.4, "#ffffff", null, 0, seed + 68 + i);
        if (lid > 0.02) { ctx.fillStyle = P.hound; ctx.fillRect(ex - r - 2, ey - r - 4, r * 2 + 4, (r * 2 + 4) * lid); }
        ctx.restore();
        if (lid > 0.02) K.line(ctx, [[ex - r, ey - r + 2 * r * lid - 1], [ex + r, ey - r + 2 * r * lid - 1]], { stroke: P.ink, w: 3.5, boil: 0.4, seed: seed + 70 + i, gap: 0 });
      } else K.line(ctx, [[ex - r, ey], [ex, ey + 4], [ex + r, ey]], { stroke: P.ink, w: 4, boil: 0.5, seed: seed + 72 + i, gap: 0 });
      /* brows: sad slant by default, lift with surprise */
      const br = (st.brow || 0) + up * 1.3 + (st.browTilt || 0) * sd * 0.9;
      K.line(ctx, [[ex - sd * 16, ey - 20 - br * 6], [ex + sd * 12, ey - 26 - br * 7]], { stroke: P.houndDark, w: 6, boil: 0.5, seed: seed + 74 + i, gap: 0 });
    });
    /* police cap */
    if (st.cap !== false) {
      ctx.save(); ctx.translate(0, -66); ctx.rotate(((st.capTip || 0) * Math.PI) / 180);
      K.shape(ctx, [[-50, -8], [-56, -34], [-30, -46], [30, -46], [56, -34], [50, -8]], { fill: P.uniform, w: 5, boil: 0.9, seed: seed + 80, shade: { color: P.uniformDark, dx: -10, dy: 0 } });
      K.shape(ctx, K.rectPts(-50, -14, 100, 14, 2), { fill: P.ink, w: 3.5, boil: 0.6, seed: seed + 81 });
      K.shape(ctx, [[-44, 0], [44, 0], [34, 14], [-34, 14]], { fill: P.ink, w: 3.5, boil: 0.6, seed: seed + 82 });
      K.shape(ctx, [[0, -40], [7, -30], [0, -20], [-7, -30]], { fill: P.brass, w: 2.5, boil: 0.4, seed: seed + 83 });
      ctx.restore();
    }
    /* "!" and "?" */
    const mark = (ch, a, sd) => {
      if (a <= 0) return;
      const sc = K.E.back(clamp(a, 0, 1), 2.5);
      ctx.save(); ctx.translate(96, -120); ctx.rotate(0.2); ctx.scale(sc, sc);
      K.text(ctx, ch, 0, 0, { size: 84, weight: 700, fill: P.amber, stroke: P.ink, w: 7 });
      ctx.restore();
    };
    mark("!", st.exclaim || 0); if (!(st.exclaim > 0)) mark("?", st.question || 0);
    ctx.restore(); /* head */
    ctx.restore(); /* squash space */

    /* ---- arms (unsquashed) ---- */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const def = k === "L" ? { x: -46, y: -100, rot: -60 } : { x: 70, y: -112, rot: -140 }; /* notebook at the belly, pencil ready */
      const c = st["paw" + k] || def;
      const S = [sd * 60 * sxk, -188 * syk + 50 * (1 - syk)];
      const r = K.ik2(S, [c.x, c.y], 50, 48, sd > 0 ? -1 : 1);
      limb(ctx, [S, r.elbow, r.end], 28, P.uniform, seed + 100 + sd);
      const ang = c.rot != null ? (c.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      const hold = k === "L" ? (st.holdL === undefined ? "notebook" : st.holdL) : (st.holdR === undefined ? "pencil" : st.holdR);
      if (hold === "notebook") K.notebook(ctx, r.end[0] + 14, r.end[1] - 12, -0.14, 0.95, seed + 110, st.write); /* held by its bottom edge, upright */
      const wr = st.write > 0 && k === "R" ? [Math.sin(K.now * 22) * 5, Math.cos(K.now * 17) * 3] : [0, 0];
      const px = r.end[0] + wr[0], py = r.end[1] + wr[1];
      if (hold === "pencil") K.pencil(ctx, px, py, ang, 1, seed + 120);
      else if (hold === "magnifier") K.magnifier(ctx, px, py, ang, 0.85, seed + 125, st.lensInside);
      else if (hold === "flashlight") K.flashlight(ctx, px, py, ang, 1, seed + 128, st.flashOn == null ? 1 : st.flashOn);
      K.shape(ctx, K.ellipsePts(r.end[0] - Math.cos(ang) * 8, r.end[1] - Math.sin(ang) * 8, 18, 18, 10), { fill: P.uniformLight, w: 4, boil: 0.5, seed: seed + 130 + sd });
      K.shape(ctx, K.ellipsePts(px, py, 17, 15, 10, ang), { fill: P.hound, w: 4, boil: 0.5, seed: seed + 132 + sd, shade: { color: P.houndDark, dx: 0, dy: -4 } });
    });
    ctx.restore();
  };
})(CK);
