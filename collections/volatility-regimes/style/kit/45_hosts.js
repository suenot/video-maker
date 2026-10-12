/* ============================================================
   KIT 45 HOSTS (Surf Turtle kit): the two hosts of an episode together.
   Siggy (turtle) = host A, the explainer. Gully (seagull lifeguard) = host B,
   the curious co-host. Everything here returns or draws poses from
   (time, loudness, gestures), so a scene only says who talks how loud and
   which reaction plays when.
     K.hostPose(who, t, o)        idle bob + blink + talking mouth/gestures + listening (look, nod) + a gesture
     K.turtleGesture(kind, u, o)  "point" "nod" "surprise" "think" "shaka" "thumbs" "shrug" "worry"
     K.gullGesture(kind, u, o)    "point" "nod" "surprise" "think" "whistle" "binos" "flap" "worry"
     K.duo(ctx, t, o)             both hosts big on a patch of sand (Gully on his lifeguard stand),
                                  pointing at screen targets and holding props; returns anchor points
   u = gesture progress 0..1 (use K.hold-like envelopes: 0 -> 1 -> 0).
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;
  const env = (u) => Math.sin(clamp(u, 0, 1) * Math.PI); /* 0 -> 1 -> 0 over a gesture */

  /* ---------- gestures: partial poses (local px, scale 1) ---------- */
  K.turtleGesture = function (kind, u, o) {
    o = o || {}; const e = env(u), p = {};
    if (u <= 0 || u >= 1) return p;
    if (kind === "point") { /* the flipper on the target's side reaches for it */
      const T = o.target || [260, -260], sd = T[0] < 0 ? -1 : 1, k = Math.min(1, e * 1.6);
      p[sd > 0 ? "flipR" : "flipL"] = { x: lerp(sd * 110, T[0], k), y: lerp(-80, T[1], k) }; p.mouth = "smile"; p.brow = 0.3 * e;
    }
    else if (kind === "nod") { p.nod = Math.sin(u * Math.PI * 4) * 0.9 * e; }
    else if (kind === "surprise") { p.shades = 22 * e; p.eyeUp = 3 * e; p.brow = 1.4 * e; p.mouth = "wow"; p.exclaim = Math.min(1, u * 3); p.squash = -0.22 * e; p.neck = 0.8 * e; p.blink = 0; }
    else if (kind === "think") { p.flipL = { x: lerp(-90, -14, e), y: lerp(-80, -188, e) }; p.headTilt = -10 * e; p.look = [-0.6, -1]; p.shades = 16 * e; p.mouth = "flat"; p.think = Math.min(1, u * 3) * (u < 0.9 ? 1 : 0); }
    else if (kind === "shaka") { p.flipR = { x: 112 + Math.sin(u * 30) * 22 * e, y: lerp(-90, -250, Math.min(1, e * 1.5)) }; p.mouth = "grin"; }
    else if (kind === "thumbs") { p.flipR = { x: 140, y: lerp(-90, -210, Math.min(1, e * 1.5)), rot: -80 }; p.mouth = "grin"; p.squash = 0.1 * e; }
    else if (kind === "shrug") { p.flipL = { x: -150, y: lerp(-80, -150, e) }; p.flipR = { x: 150, y: lerp(-80, -150, e) }; p.headTilt = 12 * e; p.mouth = "flat"; p.brow = 0.8 * e; }
    else if (kind === "worry") { p.brow = -0.8 * e; p.mouth = "o"; p.shades = 12 * e; p.squash = 0.12 * e; p.flipL = { x: -60, y: -120 }; p.flipR = { x: 60, y: -120 }; }
    return p;
  };
  K.gullGesture = function (kind, u, o) {
    o = o || {}; const e = env(u), p = {};
    if (u <= 0 || u >= 1) return p;
    const f = o.face || -1;
    if (kind === "point") {
      /* a "presenting" wing: aimed toward the target but kept near shoulder height, so it never crosses the beak */
      const T = o.target || [f * 220, -220], sh = [f * 40, -136], dx = T[0] - sh[0], el = clamp(Math.atan2(T[1] - sh[1], Math.abs(dx) || 1), -0.2, 0.35);
      const tip = { x: sh[0] + Math.sign(dx || f) * 74 * Math.cos(el), y: sh[1] + 74 * Math.sin(el) }, k = Math.min(1, e * 1.6);
      p[f > 0 ? "wingR" : "wingL"] = { x: lerp(f * 56, tip.x, k), y: lerp(-66, tip.y, k) }; p.brow = 0.4 * e; p.headTilt = -f * 6 * e;
    }
    else if (kind === "nod") { p.nod = Math.sin(u * Math.PI * 4) * 0.9 * e; }
    else if (kind === "surprise") { p.puff = e; p.brow = 1.4 * e; p.exclaim = Math.min(1, u * 3); p.hop = 26 * e; p.blink = 0; p.wingL = { x: -110, y: -150 * e - 40 }; p.wingR = { x: 110, y: -150 * e - 40 }; }
    else if (kind === "think") { p.wingL = { x: lerp(-58, f * 34, e), y: lerp(-40, -128, e) }; p.headTilt = 12 * e * -f; p.look = [-f * 0.4, -1]; p.think = Math.min(1, u * 3) * (u < 0.9 ? 1 : 0); }
    else if (kind === "whistle") { p.whistle = u > 0.08 && u < 0.85 ? 1 : 0; p.brow = -0.5 * e; p.wingR = { x: 80, y: -100 }; }
    else if (kind === "binos") { p.binos = u > 0.1 && u < 0.9 ? 1 : 0; p.headTilt = -6 * e; }
    else if (kind === "flap") { const w = Math.sin(u * 40) * 50 * e; p.wingL = { x: -100, y: -80 - w }; p.wingR = { x: 100, y: -80 - w }; p.hop = 18 * e; }
    else if (kind === "worry") { p.brow = -0.8 * e; p.squash = 0.14 * e; p.wingL = { x: -30, y: -70 }; p.wingR = { x: 30, y: -70 }; }
    return p;
  };

  /* ---------- a host's full pose at time t ----------
     o: { talk (own loudness 0..1), other (the other host's loudness), face (+1/-1 toward the partner),
          gesture: {kind, u, target}, seed } */
  K.hostPose = function (who, t, o) {
    o = o || {};
    const talk = clamp(o.talk || 0, 0, 1), other = clamp(o.other || 0, 0, 1), seed = o.seed || (who === "A" ? 3 : 7), face = o.face || 1;
    const p = { seed: who === "A" ? 700 : 900, blink: K.blinkAt(t, seed), squash: 0.05 * Math.sin(t * 2.3 + seed), talk };
    /* talking: the free limb rises with the loud syllables, the head bobs */
    const beatH = K.hash(Math.floor(t * 2.5), seed + 31), lift = talk > 0.15 ? talk * (0.4 + 0.6 * beatH) : 0;
    if (who === "A") {
      p.turn = 0.35 * face; p.look = [face * 0.6, 0];
      p.flipL = { x: -110, y: -80 - 70 * lift }; p.flipR = { x: 110, y: -80 };
      if (talk > 0.15) p.headTilt = 6 * Math.sin(t * 3.1) * talk;
      if (talk < 0.1 && other > 0.1) { p.look = [face, -0.2]; p.nod = 0.6 * other * Math.max(0, Math.sin(t * 6.5)); p.mouth = "smile"; }
    } else {
      p.face = face; p.look = [face * 0.7, 0];
      p.wingL = { x: -56, y: -66 - (face < 0 ? 90 * lift : 0) }; p.wingR = { x: 56, y: -66 - (face > 0 ? 90 * lift : 0) };
      if (talk > 0.15) p.headTilt = 5 * Math.sin(t * 3.7) * talk;
      if (talk < 0.1 && other > 0.1) { p.look = [face, 0.1]; p.nod = 0.6 * other * Math.max(0, Math.sin(t * 6.1 + 1)); }
    }
    if (o.gesture) Object.assign(p, (who === "A" ? K.turtleGesture : K.gullGesture)(o.gesture.kind, o.gesture.u, Object.assign({ face }, o.gesture)));
    return p;
  };

  /* ---------- both hosts on a patch of sand, screen space ----------
     o: { x: Siggy's feet x, y: ground y, s: scale (1.3 -> Siggy ~ 325 px tall), side: +1 = Gully to the right,
          gap: px between them, talkA, talkB (0..1), gestureA/B {kind, u}, pointA/B [sx, sy] screen targets,
          holdA (ctx, x, y) => draw a prop in Siggy's free flipper, stand: true (Gully on the stand), sand: true, a: 0..1 appear } */
  K.duo = function (ctx, t, o) {
    o = Object.assign({ x: 380, y: 1010, s: 1.3, side: 1, gap: 330, talkA: 0, talkB: 0, stand: true, sand: true, a: 1 }, o || {});
    const a = K.E.out3(clamp(o.a, 0, 1)); if (a <= 0) return null;
    K.screen(ctx); ctx.save(); ctx.globalAlpha *= a;
    const s = o.s, ax = o.x, ay = o.y + (1 - a) * 200, bx = o.x + o.side * o.gap * s / 1.3, by = ay;
    if (o.sand) K.shape(ctx, K.blobPts((ax + bx) / 2, ay + 18, Math.abs(bx - ax) / 2 + 260 * s / 1.3, 44, 16, 31, 0.12), { fill: P.sand, w: 5, boil: 0.8, seed: 960, dots: { color: P.sandDark, cell: 12, density: 0.32, alpha: 0.6 } });
    const seat = o.stand ? K.lifeguardStand(ctx, bx, by, 150 * s / 1.3, 950) : [bx, by];
    const local = (pt, x0, y0, sc) => (pt ? [(pt[0] - x0) / sc, (pt[1] - y0) / sc] : null);
    const gA = o.gestureA || (o.pointA ? { kind: "point", u: o.pointAmt == null ? 0.5 : o.pointAmt * 0.5 } : null);
    const gB = o.gestureB || (o.pointB ? { kind: "point", u: o.pointBmt == null ? 0.5 : o.pointBmt * 0.5 } : null);
    if (gA && o.pointA) gA.target = local(o.pointA, ax, ay, s);
    const gs = s * 0.92;
    if (gB && o.pointB) gB.target = local(o.pointB, seat[0], seat[1], gs);
    /* each host faces the partner, or the thing it points at */
    const faceA = o.pointA ? Math.sign(o.pointA[0] - ax) || o.side : o.side, faceB = o.pointB ? Math.sign(o.pointB[0] - seat[0]) || -o.side : -o.side;
    const pa = K.hostPose("A", t, { talk: o.talkA, other: o.talkB, face: faceA, gesture: gA });
    const pb = K.hostPose("B", t, { talk: o.talkB, other: o.talkA, face: faceB, gesture: gB });
    if (o.holdA) pa.flipL = { x: -120, y: -150 };
    K.gull(ctx, seat[0], seat[1], gs, pb);
    K.turtle(ctx, ax, ay, s, pa);
    if (o.holdA) o.holdA(ctx, ax - 120 * s, ay - 150 * s);
    ctx.restore();
    return { A: [ax, ay - 250 * s], B: [seat[0], seat[1] - 200 * gs], feetA: [ax, ay], feetB: seat };
  };
})(VK);
