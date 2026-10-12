/* ============================================================
   LAB KIT 44 HUMMINGBIRD: "Pico", the lab assistant (episode co-host, host B).
   A quick, curious hummingbird in brass goggles who hovers beside
   Professor Strix with a clipboard. Same rubber-hose line as the owl.
   Local space: (0, 0) = the hover point under the body (or the feet on a
   perch); faces dir (+1 = beak to the right). Height about 250 at scale 1.
   Proportions (scale 1): body 88 x 124 tilted forward, head r 42,
   needle beak 82, wings 100 long (two-bone IK when they gesture), forked tail.
   Pose state (all optional):
     dir      +1 | -1  facing (beak side)
     squash   -1..1    volume kept
     lean     deg      whole-body tilt (forward dash = + toward dir)
     hover    0..1     wing beat + bob amount (0 = perched still)
     look     [dx, dy] pupils, -1..1
     blink    0..1
     talk     0..1     voice loudness: opens the beak; viseme "a"|"o"|"e"|"m"
     nod      0..1     head dips (listening)
     crest    0..1     crest feathers perk up (surprise)
     goggles  0..1     0 = pushed up on the forehead, 1 = over the eyes
     eyeUp    0..1     eye pop
     think    0..1     beak up, eyes up, thought dots
     exclaim  0..1     brass "!" pop
     wingL/R  { mode: "flap" | "point" | "hold", x, y, hold: fn(ctx) }  x, y = target in local space
     clip     true     clipboard dangling from the feet (default true while hovering)
   ============================================================ */
var LK = window.LK || (window.LK = {});
(function (K) {
  const P = K.P, { clamp } = K;

  /* clipboard with a brass clip and ruled paper (Pico's prop; also a kit prop) */
  K.clipboard = function (ctx, x, y, s, rot, seed) {
    seed = seed || 900;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s || 1, s || 1);
    K.shape(ctx, K.rrectPts(-34, -44, 68, 92, 8), { fill: P.woodLight, w: 3.5, boil: 0.6, seed, shade: { color: P.wood, dx: 6, dy: 0 } });
    K.shape(ctx, K.rectPts(-27, -34, 54, 76, 2), { fill: P.paper, w: 2.6, boil: 0.5, seed: seed + 1 });
    for (let i = 0; i < 4; i++) K.line(ctx, [[-20, -20 + i * 15], [12 - (i % 2) * 10, -20 + i * 15]], { stroke: P.inkSoft, w: 2.2, boil: 0.4, seed: seed + 3 + i, taper: false });
    K.check(ctx, 14, -22, 8, 1, seed + 9);
    K.shape(ctx, K.rrectPts(-14, -52, 28, 16, 5), { fill: P.brass, w: 3, boil: 0.5, seed: seed + 2 });
    ctx.restore();
  };

  /* one wing blade from the shoulder along angle a (radians), length L */
  function blade(ctx, sx, sy, a, L, w, seed, alpha) {
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(a); if (alpha != null) ctx.globalAlpha *= alpha;
    K.shape(ctx, [[0, -w * 0.45], [L * 0.45, -w * 0.62], [L * 0.85, -w * 0.38], [L, 0], [L * 0.8, w * 0.32], [L * 0.35, w * 0.5], [0, w * 0.4]],
      { fill: P.humLight, w: 3.2, boil: 0.6, seed, shade: { color: P.hum, dx: 0, dy: w * 0.3 } });
    for (let i = 1; i < 4; i++) K.line(ctx, [[L * (0.25 + i * 0.15), -w * 0.3], [L * (0.35 + i * 0.15), w * 0.28]], { stroke: P.hum, w: 2, boil: 0.4, seed: seed + i });
    ctx.restore();
  }

  K.hummingbird = function (ctx, x, y, s, st) {
    st = st || {};
    const dir = st.dir || 1, hv = st.hover == null ? 1 : clamp(st.hover, 0, 1);
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), talk = clamp(st.talk || 0, 0, 1);
    const think = clamp(st.think || 0, 0, 1), crest = clamp(st.crest || 0, 0, 1), up = clamp(st.eyeUp || 0, 0, 1);
    const seed = st.seed || 820, t = K.now;
    const bob = hv * (Math.sin(t * 5.2) * 7 + Math.sin(t * 1.7) * 4);
    ctx.save(); ctx.translate(x, y + bob); ctx.scale(s * dir, s);
    ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    ctx.save(); ctx.scale(sxk, syk);
    /* forked tail (behind) */
    [[-0.5, 0], [-0.9, 1]].forEach((f, i) => { ctx.save(); ctx.translate(-22, -40); ctx.rotate(2.3 + f[0] * 0.5 + Math.sin(t * 3 + i) * 0.05 * hv);
      K.shape(ctx, [[0, -9], [58, -12], [76, 0], [58, 10], [0, 9]], { fill: P.humDark, w: 3.4, boil: 0.6, seed: seed + i }); ctx.restore(); });
    /* the far wing (behind the body) */
    const wingAt = (w, side) => {
      const sh = [side > 0 ? 10 : -14, -128];
      if (w && w.mode && w.mode !== "flap") {
        const r = K.ik2(sh, [w.x * dir, w.y], 52, 52, side > 0 ? -1 : 1);
        K.hose(ctx, [sh, r.elbow, r.end], 16, P.hum, seed + 40 + side, 6);
        const a = Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
        if (w.mode === "point") { /* three primaries fanned into a pointing "finger" */
          [-0.28, 0, 0.28].forEach((d, i) => blade(ctx, r.end[0], r.end[1], a + d * (i === 1 ? 0 : 1), i === 1 ? 46 : 32, 12, seed + 50 + side * 5 + i));
        } else {
          blade(ctx, r.end[0], r.end[1], a - 0.3, 34, 14, seed + 60 + side);
          if (w.hold) { ctx.save(); ctx.translate(r.end[0], r.end[1]); ctx.scale(dir, 1); w.hold(ctx); ctx.restore(); }
        }
        return;
      }
      /* hovering: a fast figure-eight beat; a ghost trail stands in for motion blur */
      const ph = t * 2 * Math.PI * 7.5 + (side > 0 ? 0 : 0.6);
      for (let g = 2; g >= 0; g--) {
        const a = -Math.PI / 2 + side * (0.9 + 0.75 * Math.sin(ph - g * 0.55)) * (0.35 + 0.65 * hv) * -1;
        blade(ctx, sh[0], sh[1], a, 100, 30, seed + 70 + side * 3, g === 0 ? 1 : 0.28 - g * 0.06);
      }
    };
    wingAt(st.wingL, -1);
    /* body: a forward-tilted teardrop, iridescent green with a pale belly */
    const body = K.ellipsePts(0, -92, 44, 64, 18, -0.38);
    K.shape(ctx, body, { fill: P.hum, w: 5, boil: 1, seed: seed + 10, shade: { color: P.humDark, dx: -12, dy: 0 }, dots: { gap: 8, alpha: 0.2 }, rim: 2.5 });
    K.shape(ctx, K.ellipsePts(12, -76, 24, 40, 12, -0.38), { fill: P.pane, w: 3, boil: 0.7, seed: seed + 11 });
    /* tiny feet + clipboard dangling from them */
    [-6, 10].forEach((fx, i) => K.line(ctx, [[fx, -34], [fx + 2, -14]], { stroke: P.ink, w: 4, boil: 0.4, seed: seed + 12 + i, taper: false }));
    if (st.clip !== false && hv > 0.3 && !(st.wingR && st.wingR.hold) && !(st.wingL && st.wingL.hold)) K.clipboard(ctx, 6, 26, 0.7, 0.08 * Math.sin(t * 2.4), seed + 200);
    ctx.restore();
    /* head (does not squash with the body) */
    const hx = 22 * sxk, hy = -170 * syk + 12 * clamp(st.nod || 0, 0, 1) - think * 4;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-think * 0.35 + clamp(st.nod || 0, 0, 1) * 0.18);
    /* crest */
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(-14 + i * 10, -36); ctx.rotate(-1.9 + i * 0.32 - crest * 0.4);
      K.shape(ctx, [[0, -5], [26 + crest * 12, -3], [32 + crest * 14, 0], [26 + crest * 12, 3], [0, 5]], { fill: P.humDark, w: 2.8, boil: 0.5, seed: seed + 20 + i }); ctx.restore(); }
    K.shape(ctx, K.ellipsePts(0, 0, 44, 41, 16), { fill: P.hum, w: 5, boil: 0.9, seed: seed + 21, shade: { color: P.humDark, dx: -10, dy: -8 }, rim: 2.5 });
    /* ruby gorget (throat) */
    K.shape(ctx, [[-10, 26], [30, 22], [40, 34], [14, 46], [-8, 40]], { fill: P.gorget, w: 3, boil: 0.6, seed: seed + 22, shade: { color: "#7e2028", dx: 0, dy: 6 } });
    /* needle beak: talk splits the mandibles */
    const vis = st.viseme || "a", op = vis === "m" ? 0 : talk * (vis === "e" ? 0.16 : vis === "o" ? 0.22 : 0.3);
    ctx.save(); ctx.translate(38, 6);
    if (op > 0.01) { ctx.save(); ctx.rotate(op); K.shape(ctx, [[0, -3], [72, 1], [74, 4], [0, 6]], { fill: P.ink, w: 2.6, boil: 0.4, seed: seed + 23 }); ctx.restore(); }
    ctx.rotate(-op * 0.4 - think * 0.2);
    K.shape(ctx, [[0, -7], [84, -1], [86, 2], [0, 6]], { fill: "#2b2f28", w: 3, boil: 0.4, seed: seed + 24 });
    ctx.restore();
    /* eyes: big, slightly toward the beak; pie-cut like the owl */
    [[-6, 0.85], [26, 1]].forEach((e, i) => {
      const cx = e[0], cy = -6 - up * 5, r = 15 * e[1] * (1 + up * 0.2), ry = r * 1.15 * (1 - 0.94 * blink);
      K.shape(ctx, K.ellipsePts(cx, cy, r, Math.max(2, ry), 12), { fill: P.eye, w: 3.2, boil: 0.5, seed: seed + 30 + i });
      if (blink < 0.6) {
        const lx = (look[0] * dir) * 5 + think * 3, ly = (look[1] - think) * 5;
        K.shape(ctx, K.ellipsePts(cx + lx + 2, cy + ly + 2, r * 0.5, r * 0.62 * (1 - blink), 10), { fill: P.pupil, stroke: null, w: 0, boil: 0.3, seed: seed + 32 + i });
        ctx.save(); ctx.fillStyle = P.eye; ctx.beginPath(); ctx.moveTo(cx + lx + 3, cy + ly); ctx.arc(cx + lx + 3, cy + ly, r * 0.55, -1.25, -0.55); ctx.closePath(); ctx.fill(); ctx.restore();
      } else K.line(ctx, [[cx - r, cy], [cx, cy + 4], [cx + r, cy]], { stroke: P.ink, w: 3.5, boil: 0.4, seed: seed + 34 + i });
    });
    /* brass goggles: up on the forehead, or down over the eyes */
    const gg = clamp(st.goggles || 0, 0, 1), gy = K.lerp(-34, -6, gg);
    K.line(ctx, [[-42, gy + 4], [44, gy + 2]], { stroke: P.woodDark, w: 7, boil: 0.4, seed: seed + 36, taper: false });
    [[-6, 0.85], [26, 1]].forEach((e, i) => {
      K.shape(ctx, K.ellipsePts(e[0], gy, 17 * e[1], 15 * e[1], 12), { fill: gg > 0.5 ? "rgba(214,240,226,0.45)" : P.glass, stroke: P.ink, w: 3, boil: 0.5, seed: seed + 37 + i });
      K.shape(ctx, K.ellipsePts(e[0], gy, 17 * e[1], 15 * e[1], 12), { fill: null, stroke: P.brass, w: 4.5, boil: 0.5, seed: seed + 39 + i });
    });
    ctx.restore();
    /* the near wing (in front) */
    wingAt(st.wingR, 1);
    /* thought dots and "!" (language-free) */
    if (think > 0) for (let i = 0; i < 3; i++) { const a = clamp(think * 3 - i, 0, 1); if (a > 0) K.dot(ctx, hx - 30 + i * 4, hy - 70 - i * 26, (6 + i * 4) * K.E.back(a, 2), P.paper, P.ink, 2.5, seed + 90 + i); }
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(hx - 40, hy - 80); ctx.scale(a / dir, a); ctx.rotate(-0.2);
      K.shape(ctx, [[-8, -46], [8, -46], [4, -10], [-4, -10]], { fill: P.brassLight, w: 3.5, boil: 0.7, seed: seed + 95 });
      K.shape(ctx, K.ellipsePts(0, 3, 7, 7, 8), { fill: P.brassLight, w: 3.5, boil: 0.7, seed: seed + 96 });
      ctx.restore();
    }
    ctx.restore();
  };
})(LK);
