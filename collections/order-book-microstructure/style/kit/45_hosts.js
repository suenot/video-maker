/* ============================================================
   KIT 45 HOSTS: both storytellers together. Tikki (raccoon, host A, the
   explainer) and Gekko (gecko, host B, the curious apprentice).
     K.lookDir(target, from)          pupil direction -1..1 towards a local point
     K.visemeAt(t, talk, seed)        "a" | "e" | "o" | "m", deterministic per 1/10 s
     K.talkMouth(ctx, x, y, talk, vis, s, seed)   loudness-driven mouth (both rigs)
     K.GESTURE[kind](who, a, t, o)    partial pose for "raccoon" | "gecko":
                                      point, nod, surprise, think, cheer, shrug, explain
     K.hostPose(who, t, o)            idle + talk + listen + gestures merged into one pose
     K.floorRug(ctx, x0, x1, y, opt)  flat kilim the duo stands on
     K.duo(ctx, t, o)                 both hosts large in frame, screen space
   Everything is a pure function of t: no state between frames.
   ============================================================ */
var BK = window.BK || (window.BK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;

  K.lookDir = function (target, from) {
    const dx = target[0] - from[0], dy = target[1] - from[1], d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 140);
    return [(dx / d) * m, (dy / d) * m];
  };

  K.visemeAt = function (t, talk, seed) {
    if (talk < 0.06) return "m";
    if (talk > 0.8) return "a";
    const h = K.hash(Math.floor(t * 10), seed || 5);
    return h < 0.45 ? "a" : h < 0.75 ? "e" : "o";
  };

  /* open mouth: height follows loudness, width follows the viseme */
  K.talkMouth = function (ctx, x, y, talk, vis, s, seed) {
    const v = vis || "a", W = v === "o" ? 11 : v === "e" ? 22 : 17, H = v === "m" ? 0 : 5 + talk * (v === "e" ? 11 : v === "o" ? 17 : 22);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (v === "m") K.line(ctx, [[-14, 4], [0, 6], [14, 4]], { stroke: P.ink, w: 4, boil: 0.6, seed });
    else if (v === "o") K.shape(ctx, K.ellipsePts(0, H / 2 + 2, W, H / 2 + 3, 10), { fill: P.mouthIn, w: 4, boil: 0.6, seed, k: 1, nicks: 0 });
    else {
      K.shape(ctx, [[-W, 0], [W, 0], [W * 0.75, H * 0.8], [0, H], [-W * 0.75, H * 0.8]], { fill: P.mouthIn, w: 4, boil: 0.6, seed, k: 0.7, nicks: 0 });
      if (H > 12) K.shape(ctx, K.ellipsePts(0, H * 0.78, W * 0.45, H * 0.16, 8), { fill: P.cheek, stroke: null, w: 0, boil: 0.4, seed: seed + 1, reg: false });
    }
    ctx.restore();
  };

  /* rig constants the gestures need: rest hands, shoulder, arm reach, head */
  const RIG = {
    raccoon: { L: { x: -74, y: -70, pose: "open" }, R: { x: 74, y: -70, pose: "open" }, sh: [48, -134], reach: 64, head: [0, -212], chin: [16, -176] },
    gecko: { L: { x: -46, y: -80, pose: "open" }, R: { x: 46, y: -80, pose: "open" }, sh: [30, -132], reach: 54, head: [0, -212], chin: [12, -158] },
  };
  K.HOST_RIG = RIG;
  const mixHand = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), pose: u > 0.5 ? b.pose : a.pose, rot: u > 0.5 ? b.rot : a.rot });

  K.GESTURE = {
    /* o.target: local point; uses the hand on that side (raccoon keeps the abacus in its left) */
    point(who, a, t, o) {
      const R = RIG[who], tg = o.target || [300, -200];
      const left = tg[0] < 0 && !(who === "raccoon" && o.hold === "abacus"), sd = left ? -1 : 1;
      const S = [sd * R.sh[0], R.sh[1]], dx = tg[0] - S[0], dy = tg[1] - S[1], d = Math.hypot(dx, dy) || 1;
      const hand = { x: S[0] + (dx / d) * R.reach, y: S[1] + (dy / d) * R.reach, pose: "point" };
      const p = { lean: clamp(dx / d, -1, 1) * 5 * a, lookAt: tg };
      p["hand" + (left ? "L" : "R")] = mixHand(o["hand" + (left ? "L" : "R")] || R[left ? "L" : "R"], hand, K.E.out3(a));
      if (who === "gecko") p.brow = 0.3 * a;
      return p;
    },
    nod(who, a, t) { return { nod: a * (0.5 + 0.5 * Math.sin(t * 9)), headTilt: 3 * a }; },
    surprise(who, a, t, o) {
      const R = RIG[who], up = who === "raccoon" ? [92, -206] : [60, -176];
      const p = { brow: 1.3 * a, exclaim: a, squash: -0.18 * a, hop: 10 * Math.sin(Math.min(1, a) * Math.PI), mouth: a > 0.3 ? (who === "gecko" ? "wow" : "o") : undefined };
      p.handR = mixHand(o.handR || R.R, { x: up[0], y: up[1], pose: "open" }, a);
      if (!(who === "raccoon" && o.hold === "abacus")) p.handL = mixHand(o.handL || R.L, { x: -up[0], y: up[1], pose: "open" }, a);
      if (who === "gecko") { p.eyePop = a; p.tailUp = a; }
      else p.fezLift = 10 * a;
      return p;
    },
    think(who, a, t, o) {
      const R = RIG[who];
      const p = { look: [0.5 * a, -0.8 * a], headTilt: 8 * a, brow: -0.4 * a, mouth: a > 0.3 ? (who === "gecko" ? "flat" : "smirk") : undefined };
      p.handR = mixHand(o.handR || R.R, { x: R.chin[0], y: R.chin[1], pose: "fist" }, K.E.out3(a));
      if (who === "gecko") { p.question = a; p.handL = mixHand(o.handL || R.L, { x: 14, y: -100, pose: "fist" }, a); }
      return p;
    },
    cheer(who, a, t, o) {
      const R = RIG[who], up = who === "raccoon" ? [86, -230] : [56, -196];
      const p = { mouth: a > 0.3 ? "grin" : undefined, hop: 16 * Math.abs(Math.sin(t * 7)) * a, squash: 0.08 * a * Math.sin(t * 14) };
      p.handR = mixHand(o.handR || R.R, { x: up[0], y: up[1], pose: "fist" }, a);
      if (!(who === "raccoon" && o.hold === "abacus")) p.handL = mixHand(o.handL || R.L, { x: -up[0], y: up[1], pose: "fist" }, a);
      return p;
    },
    shrug(who, a, t, o) {
      const R = RIG[who], w = who === "raccoon" ? 96 : 66;
      const p = { brow: 1 * a, headTilt: -7 * a, squash: 0.1 * a };
      p.handR = mixHand(o.handR || R.R, { x: w, y: R.sh[1] + 30, pose: "open", rot: -30 }, a);
      if (!(who === "raccoon" && o.hold === "abacus")) p.handL = mixHand(o.handL || R.L, { x: -w, y: R.sh[1] + 30, pose: "open", rot: 210 }, a);
      return p;
    },
    /* talking beat: the free hand lifts open, palm out */
    explain(who, a, t, o) {
      const R = RIG[who];
      return { handR: mixHand(o.handR || R.R, { x: R.R.x + 26, y: R.sh[1] - 20, pose: "open" }, a), squash: -0.05 * a };
    },
  };

  /* one pose from idle + talk + listen + gestures.
     o: { seed, talk, listenTo: local point | null, acts: [{ kind, a, target }], base: pose overrides } */
  K.hostPose = function (who, t, o) {
    o = o || {};
    const seed = o.seed || (who === "raccoon" ? 11 : 23), talk = clamp(o.talk || 0, 0, 1);
    let p = Object.assign({ blink: K.blinkAt(t, seed), squash: 0.035 * Math.sin(t * 2.3 + seed) }, o.base || {});
    if (talk > 0.06) { p.talk = talk; p.vis = K.visemeAt(t, talk, seed); p.squash += talk * 0.05; }
    else if (o.listenTo) {
      p.lookAt = o.listenTo;
      p.nod = Math.pow(Math.max(0, Math.sin(t * 2.4 + seed)), 10) * 0.8;
      p.headTilt = (o.listenTo[0] < 0 ? -5 : 5) + (p.headTilt || 0);
    } else p.look = p.look || [0.18 * Math.sin(t * 0.7 + seed), -0.05];
    (o.acts || []).forEach((g) => {
      if (!(g.a > 0) || !K.GESTURE[g.kind]) return;
      const q = K.GESTURE[g.kind](who, clamp(g.a, 0, 1), t, Object.assign({}, p, g));
      Object.keys(q).forEach((k) => {
        if (q[k] === undefined) return;
        if (k === "squash" || k === "hop" || k === "headTilt" || k === "lean") p[k] = (p[k] || 0) + q[k];
        else p[k] = q[k];
      });
      if (q.lookAt) delete p.look; else if (q.look) delete p.lookAt;
    });
    if (p.talk) delete p.mouth;
    return p;
  };

  /* flat kilim under the hosts' feet */
  K.floorRug = function (ctx, x0, x1, y, opt) {
    const o = Object.assign({ h: 46, seed: 140, base: P.terra, band: P.saffron, motif: P.teal }, opt || {});
    const sk = o.h * 0.6, pts = [[x0 + sk, y - o.h / 2], [x1 + sk * 0.4, y - o.h / 2], [x1 - sk * 0.4, y + o.h / 2], [x0 - sk, y + o.h / 2]];
    K.shape(ctx, pts, { fill: o.base, w: 5, boil: 0.9, seed: o.seed, k: 0.1, pattern: { kind: "zigzag", color: o.band, gap: 18, w: 5, alpha: 0.9 }, shade: { color: P.terraDark, dx: 0, dy: 8 } });
    for (let x = x0 - sk + 14; x < x1 - sk * 0.4; x += 14) K.line(ctx, [[x, y + o.h / 2 + 2], [x - 2, y + o.h / 2 + 12]], { stroke: o.band, w: 3, boil: 0.5, seed: o.seed + x });
  };

  /* both hosts in screen space.
     o: { x, y, s, side (+1 = gecko right of Tikki), gap, gs (gecko scale / s), a, rug,
          talkA, talkB (0..1 loudness), A, B (pose overrides), actsA, actsB ([{ kind, a, target? }]),
          point: [sx, sy] screen, pointWho "A"|"B"|"both", pointAmt 0..1, carryB, hold ("abacus" default for A) }
     returns { A: { x, y, s, head }, B: { ... } } in screen px so props can be attached */
  K.duo = function (ctx, t, o) {
    o = Object.assign({ x: 380, y: 1010, s: 1.15, side: 1, gap: 340, gs: 1.2, a: 1, rug: true, talkA: 0, talkB: 0, pointWho: "A", pointAmt: 0, hold: "abacus" }, o || {});
    if (o.a <= 0) return null;
    const sA = o.s, sB = o.s * o.gs, xA = o.x, xB = o.x + o.side * o.gap * o.s, y = o.y;
    const headA = [xA, y - 212 * sA], headB = [xB, y - 212 * sB];
    const toA = (p) => [(p[0] - xA) / sA, (p[1] - y) / sA], toB = (p) => [(p[0] - xB) / sB, (p[1] - y) / sB];
    const speaking = (v) => v > 0.06;
    const actsA = (o.actsA || []).slice(), actsB = (o.actsB || []).slice();
    if (o.point && o.pointAmt > 0) {
      if (o.pointWho !== "B") actsA.push({ kind: "point", a: o.pointAmt, target: toA(o.point), hold: o.hold });
      if (o.pointWho !== "A") actsB.push({ kind: "point", a: o.pointAmt, target: toB(o.point) });
    }
    const poseA = K.hostPose("raccoon", t, { seed: 11, talk: o.talkA, listenTo: speaking(o.talkB) ? toA(headB) : null, acts: actsA.map((g) => Object.assign({ hold: o.hold }, g)), base: Object.assign({ hold: o.hold, beads: [0.4, 0.6, 0.2, 0.8], handL: o.hold === "abacus" ? { x: -76, y: -104, pose: "fist" } : undefined }, o.A || {}) });
    const poseB = K.hostPose("gecko", t, { seed: 23, talk: o.talkB, listenTo: speaking(o.talkA) ? toB(headA) : null, acts: actsB, base: Object.assign({ carry: o.carryB }, o.B || {}) });
    if (!poseA.handL && o.hold !== "abacus") delete poseA.handL;
    ctx.save(); ctx.globalAlpha *= clamp(o.a, 0, 1);
    if (o.rug) K.floorRug(ctx, Math.min(xA, xB) - 170 * o.s, Math.max(xA, xB) + 190 * o.s, y + 6, { h: 40 * o.s });
    if (o.side > 0) { K.raccoon(ctx, xA, y, sA, poseA); K.gecko(ctx, xB, y, sB, poseB); }
    else { K.gecko(ctx, xB, y, sB, poseB); K.raccoon(ctx, xA, y, sA, poseA); }
    ctx.restore();
    return { A: { x: xA, y, s: sA, head: headA }, B: { x: xB, y, s: sB, head: headB } };
  };
})(BK);
