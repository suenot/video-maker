/* ============================================================
   KIT 46 DUO: both hosts as storytellers (episodes).
   Inspector Vulpes (fox) = host A, the explainer (lower voice).
   Sergeant Basset (hound) = host B, the curious co-host (higher voice).

   K.hostPose(who, t, o) -> pose object for K.fox ("fox") or K.hound ("hound")
     o.talk       0..1  loudness of this host's own voice this frame (mouth, energy)
     o.listen     0..1  loudness of the other host (listening: look at him, small lean)
     o.accent     0..1  pulse on this host's stressed syllable (beat gesture, squash)
     o.accentIdx  int   index of that accent (picks the gesture variety)
     o.otherAccent 0..1 pulse on the other host's accent (listening nod)
     o.toward     -1|+1 which side the other host stands on
     o.point      [lx, ly] LOCAL target for the nearer paw; o.pointAmt 0..1
     o.gesture    { name, amt }: point | nod | surprise | think | present | shrug | tip | write
     o.seed, o.blinkSeed
   K.gesturePose(who, st, name, amt) mixes one named gesture into a pose.
   K.duo(ctx, o) draws both hosts LARGE in screen space (call after K.screen):
     o.x, o.y   fox feet (default 360, 1060); o.s fox scale (default 1.25: about 475 px tall)
     o.side     +1 hound to the right of the fox (default), -1 to the left
     o.gap      feet distance (default 330 * s);  o.hs hound scale (default o.s)
     o.talkA / talkB, accentA / accentB, accentIdxA / B  (narration sync values)
     o.point    [sx, sy] SCREEN point the fox points at; o.pointAmt
     o.hpoint   [sx, sy] screen point for the hound;     o.hpointAmt
     o.gestA / gestB  { name, amt } extra gestures;  o.foxPose / houndPose: overrides
     o.propA(ctx, x, y) / o.propB: draw a kit prop held up in the free paw (screen px)
     o.a        appear 0..1 (pop in);  o.ground false = no puddle under the hosts
   returns { fox: [x, y], hound: [x, y], pawA: [x, y], pawB: [x, y] } (screen px)
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;
  const mix = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), rot: u > 0.5 ? b.rot : a.rot });
  const REST = {
    fox: { L: { x: -86, y: -100 }, R: { x: 86, y: -100 } },
    hound: { L: { x: -46, y: -100, rot: -60 }, R: { x: 70, y: -112, rot: -140 } },
  };
  const SHOULDER = { fox: [56, -196], hound: [60, -188] }, REACH = { fox: 118, hound: 94 };
  /* beat gestures while talking (rest-relative paw targets) */
  const BEATS = {
    fox: [{ R: { x: 150, y: -250 } }, { L: { x: -150, y: -200 }, R: { x: 150, y: -200 } }, { L: { x: -150, y: -250 } }, { R: { x: 60, y: -230 } }],
    hound: [{ R: { x: 120, y: -230, rot: -60 } }, { R: { x: 70, y: -270, rot: -90 } }, { L: { x: -110, y: -180, rot: -100 } }],
  };

  K.gesturePose = function (who, st, name, amt) {
    if (!amt || amt <= 0) return st;
    const e = clamp(amt, 0, 1), fox = who === "fox";
    const L = st.pawL || REST[who].L, R = st.pawR || REST[who].R;
    if (name === "nod") st.nod = Math.max(st.nod || 0, e * Math.max(0, Math.sin(K.now * 9)));
    else if (name === "surprise") {
      st.eyeUp = Math.max(st.eyeUp || 0, e); st.exclaim = e; st.blink = 0;
      if (!(st.talk > 0.06)) st.mouth = "o";
      st.hop = (st.hop || 0) + 14 * e; st.squash = (st.squash || 0) - 0.15 * e;
      if (fox) { st.pawL = mix(L, { x: -120, y: -300 }, e); st.pawR = mix(R, { x: 120, y: -300 }, e); }
      else { st.ears = (st.ears || 0) + e; st.pawR = mix(R, { x: 110, y: -240, rot: -80 }, e); }
    } else if (name === "think") {
      st.look = [0.5, -0.9]; st.browTilt = 0.8 * e;
      if (fox) st.pawR = mix(R, { x: 40, y: -255, rot: -100 }, e); else { st.question = e; st.head = (st.head || 0) + 12 * e; st.pawR = mix(R, { x: 30, y: -230, rot: -120 }, e); }
    } else if (name === "present") {
      if (fox) { st.pawL = mix(L, { x: -160, y: -180 }, e); st.pawR = mix(R, { x: 160, y: -180 }, e); }
      else st.pawR = mix(R, { x: 130, y: -170, rot: -20 }, e);
      st.brow = (st.brow || 0) + 0.5 * e;
    } else if (name === "shrug") {
      if (fox) { st.pawL = mix(L, { x: -150, y: -230 }, e); st.pawR = mix(R, { x: 150, y: -230 }, e); } else { st.pawR = mix(R, { x: 120, y: -200, rot: -30 }, e); st.head = (st.head || 0) - 10 * e; }
      st.brow = (st.brow || 0) + 1 * e; st.squash = (st.squash || 0) + 0.08 * e;
    } else if (name === "tip") {
      if (fox) { st.hatTip = -18 * e; st.hatLift = 20 * e; st.pawL = mix(L, { x: -60, y: -390 }, e); }
      else { st.capTip = -14 * e; st.pawR = mix(R, { x: 40, y: -330, rot: -90 }, e); }
    } else if (name === "write") {
      if (!fox) { st.write = e; st.look = [-0.3, 0.8]; st.pawR = mix(R, { x: 10, y: -150, rot: -165 }, e); st.head = (st.head || 0) - 6 * e; }
    } else if (name === "point" && st._point) {
      const pt = st._point, sd = pt[0] >= 0 ? 1 : -1, sh = [sd * SHOULDER[who][0], SHOULDER[who][1]];
      const d = Math.hypot(pt[0] - sh[0], pt[1] - sh[1]) || 1, rch = REACH[who];
      const tgt = { x: sh[0] + ((pt[0] - sh[0]) / d) * rch, y: sh[1] + ((pt[1] - sh[1]) / d) * rch, rot: (Math.atan2(pt[1] - sh[1], pt[0] - sh[0]) * 180) / Math.PI };
      if (sd > 0) st.pawR = mix(R, tgt, e); else st.pawL = mix(L, tgt, e);
      if (fox) st[sd > 0 ? "fingerR" : "fingerL"] = e;
      st.look = [lerp((st.look || [0, 0])[0], sd * 0.9, e), lerp((st.look || [0, 0])[1], clamp((pt[1] + 260) / 300, -1, 1), e)];
      if (!fox && sd < 0) st.holdL = null; /* the notebook hand points: tuck the notebook away */
    }
    return st;
  };

  K.hostPose = function (who, t, o) {
    o = o || {};
    const fox = who === "fox", tw = o.toward || (fox ? 1 : -1), talk = clamp(o.talk || 0, 0, 1), listen = clamp(o.listen || 0, 0, 1);
    const st = { seed: o.seed || (fox ? 760 : 900), blink: K.blinkAt(t, o.blinkSeed || (fox ? 17 : 23)), talk, look: [0.15 * Math.sin(t * 0.7), -0.1] };
    st.squash = 0.035 * Math.sin(t * (fox ? 2.3 : 2.9)) + 0.12 * (o.accent || 0);
    st.pawL = Object.assign({}, REST[who].L); st.pawR = Object.assign({}, REST[who].R);
    st.pawL.y += 6 * Math.sin(t * 2.1); st.pawR.y += 6 * Math.sin(t * 2.4 + 1);
    if (fox) { st.lid = 0.3; st.tail = Math.sin(t * 2.4); st.mouth = "smirk"; }
    else { st.tail = Math.sin(t * 3) * 0.6; st.ears = 0.1 * Math.sin(t * 1.3); st.head = 3 * Math.sin(t * 0.8); }
    /* talking: beat gestures on accents, look ahead / at the audience */
    if (talk > 0.02 || (o.accent || 0) > 0) {
      st.look = [0.2 * Math.sin(t * 0.9), -0.05];
      const B = BEATS[who][Math.floor(K.hash(o.accentIdx || 0, fox ? 77 : 91) * BEATS[who].length)], w = clamp(o.accent || 0, 0, 1);
      if (B.L) st.pawL = mix(st.pawL, B.L, w);
      if (B.R) st.pawR = mix(st.pawR, B.R, w);
      st.brow = 0.5 * w;
    }
    /* listening: look at the talker, lean in, nod on his accents */
    if (listen > 0.02 || (o.otherAccent || 0) > 0) {
      st.look = [0.9 * tw, -0.3]; st.lean = 2.5 * tw;
      st.nod = 0.8 * (o.otherAccent || 0);
      if (fox) st.headTilt = 4 * tw; else st.head = (st.head || 0) + 8 * tw;
    }
    if (o.point && (o.pointAmt == null || o.pointAmt > 0)) { st._point = o.point; K.gesturePose(who, st, "point", o.pointAmt == null ? 1 : o.pointAmt); }
    if (o.gesture) K.gesturePose(who, st, o.gesture.name, o.gesture.amt == null ? 1 : o.gesture.amt);
    return st;
  };

  /* screen -> local point for a host standing at (fx, fy) with scale s */
  const toLocal = (pt, fx, fy, s) => [(pt[0] - fx) / s, (pt[1] - fy) / s];
  /* approximate screen position of a paw from its IK target (targets are kept reachable) */
  const pawScreen = (p, fx, fy, s) => [fx + p.x * s, fy + p.y * s];

  K.duo = function (ctx, o) {
    o = o || {};
    const t = K.now, s = o.s || 1.25, hs = o.hs || s, side = o.side || 1;
    const fx = o.x == null ? 360 : o.x, fy = o.y == null ? 1060 : o.y;
    const hx = fx + side * (o.gap || 330 * s), hy = fy + 6;
    const a = o.a == null ? 1 : o.a; if (a <= 0) return null;
    const pa = a >= 1 ? 1 : K.E.back(a, 2);
    const foxO = { talk: o.talkA, listen: o.talkB, accent: o.accentA, accentIdx: o.accentIdxA, otherAccent: o.accentB, toward: side, gesture: o.gestA };
    if (o.point) { foxO.point = toLocal(o.point, fx, fy, s); foxO.pointAmt = o.pointAmt; }
    const houndO = { talk: o.talkB, listen: o.talkA, accent: o.accentB, accentIdx: o.accentIdxB, otherAccent: o.accentA, toward: -side, gesture: o.gestB };
    if (o.hpoint) { houndO.point = toLocal(o.hpoint, hx, hy, hs); houndO.pointAmt = o.hpointAmt; }
    const fst = Object.assign(K.hostPose("fox", t, foxO), o.foxPose || {});
    const hst = Object.assign(K.hostPose("hound", t, houndO), o.houndPose || {});
    if (o.propA && !fst.hold) fst.hold = null;
    /* a shared wet-pavement puddle under both hosts */
    if (o.ground !== false) {
      ctx.save(); ctx.globalAlpha *= 0.85 * a;
      K.shape(ctx, K.blobPts((fx + hx) / 2, fy + 8, Math.abs(hx - fx) / 2 + 210 * s, 34 * s, 16, 31, 0.12), { fill: P.puddle, stroke: P.ink, w: 3, boil: 0.8, seed: 991, gap: 0.3, shade: { color: P.street, dx: 0, dy: 10 } });
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha *= Math.min(1, a * 2);
    const drawFox = () => K.fox(ctx, fx, fy, s * pa, fst), drawHound = () => K.hound(ctx, hx, hy, hs * pa, hst);
    /* the listener is drawn first, so the talker overlaps if they ever touch */
    if ((o.talkB || 0) > (o.talkA || 0)) { drawFox(); drawHound(); } else { drawHound(); drawFox(); }
    ctx.restore();
    const pawA = pawScreen(side > 0 ? fst.pawR : fst.pawL, fx, fy, s), pawB = pawScreen(side > 0 ? hst.pawL : hst.pawR, hx, hy, hs);
    if (o.propA) o.propA(ctx, pawA[0], pawA[1]);
    if (o.propB) o.propB(ctx, pawB[0], pawB[1]);
    return { fox: [fx, fy], hound: [hx, hy], pawA, pawB };
  };
})(CK);
