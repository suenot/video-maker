/* ============================================================
   KIT 55 HOSTS: the two storytellers of an episode.
     host A = Chef Nibbs (hamster, the explainer, lower voice)
     host B = Bizzy (bee waitress, the curious co-host, higher voice)
   Episode code feeds each host a loudness value per frame (`talk` 0..1,
   0 while the other one speaks) and a list of acts; these helpers turn that
   into full poses: talking gestures, listening (look at the speaker + nods
   on a slow rhythm), idle breathing bob, and the acted gestures.

   acts: [{ kind, at, dur }]   at = start time (s), dur default 1.6 s
     both:   "point" (needs point target), "nod", "surprise", "think", "grin", "worry", "cheer"
     Nibbs:  "magnify" (raises the glass to his eye), "tip" (toque tip)
     Bizzy:  "write" (scribbles on the order pad), "twirl" (skate spin)

   K.nibbsPose(t, o) / K.bizzyPose(t, o) -> pose object for K.hamster / K.bee
     o: talk, listen (0..1), face (+1 = partner on the right, -1 left), acts,
        point [lx, ly] local target, pointAmt 0..1, seed, magnifier (bool)
   K.duo(ctx, t, o) draws both hosts large in screen space and returns anchors.
   ============================================================ */
var DK = window.DK || (window.DK = {});
(function (K) {
  const { clamp, ss, lerp } = K;
  /* envelope of an act: rises 0.18 s, holds, falls 0.3 s */
  const actEnv = (t, r) => { const d = r.dur || 1.6; return ss(r.at - 0.18, r.at, t) * (1 - ss(r.at + d - 0.3, r.at + d, t)); };
  K.actEnv = actEnv;
  const mixPt = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
  /* slow listening nods: two quick dips every ~2.4 s, phase seeded per host */
  const nodAt = (t, seed) => { const ph = (t + K.hash(seed, 3) * 2.4) % 2.4; return ph < 0.5 ? Math.sin((ph / 0.5) * Math.PI * 2) * Math.sin((ph / 0.5) * Math.PI) : 0; };

  K.nibbsPose = function (t, o) {
    o = o || {};
    const talk = clamp(o.talk || 0, 0, 1), listen = clamp(o.listen || 0, 0, 1), face = o.face || 1, seed = o.seed || 700;
    const st = { seed, blink: K.blinkAt(t, seed % 97), talk, mouth: "smile", cheeks: 0.25, look: [0.25 * face, -0.1] };
    st.squash = 0.04 * Math.sin(t * 2.6); /* breathing bob */
    st.pawL = { x: -78, y: -44 }; st.pawR = { x: 78, y: -44 };
    if (o.magnifier) { st.hold = "magnifier"; st.magS = 1.1; st.magAng = -60 + 4 * Math.sin(t * 1.9); st.pawR = { x: 88, y: -120 }; }
    /* talking: the free paw gesticulates with the voice */
    if (talk > 0.02) {
      const g = Math.sin(t * 3.1 + 1) * 0.5 + 0.5;
      st.pawL = { x: -90 - 20 * g * talk, y: -60 - 80 * talk - 20 * g };
      st.lean = 3 * talk * Math.sin(t * 2.3); st.look = [0.5 * face, 0];
      st.brow = 0.4 * talk;
    }
    if (listen > 0) { st.look = [face * listen, 0.1]; st.lean = (st.lean || 0) + 4 * nodAt(t, seed) * listen; st.squash += 0.04 * nodAt(t, seed) * listen; }
    (o.acts || []).forEach((r) => {
      const e = actEnv(t, r); if (e <= 0) return;
      const u = t - r.at;
      if (r.kind === "surprise") { st.exclaim = e; st.eyeUp = 6 * e; st.brow = 1.3 * e; if (talk < 0.1) st.mouth = "open"; st.squash -= 0.25 * Math.exp(-Math.max(0, u) * 6) * e; st.pawL = mixPt(st.pawL, { x: -110, y: -190 }, e); }
      else if (r.kind === "think") { st.pawL = mixPt(st.pawL, { x: -26, y: -96 }, e); st.look = [0.6 * face, -1]; st.brow = 0.7 * e; if (talk < 0.1) st.mouth = "smirk"; }
      else if (r.kind === "nod") { st.lean = (st.lean || 0) + 7 * Math.sin(Math.max(0, u) * 14) * e; }
      else if (r.kind === "grin") { if (talk < 0.1) st.mouth = "grin"; st.cheeks = 0.9; st.wink = e; }
      else if (r.kind === "worry") { st.brow = -0.9 * e; st.sweat = e; if (talk < 0.1) st.mouth = "frown"; }
      else if (r.kind === "cheer") { st.hop = 40 * Math.abs(Math.sin(Math.max(0, u) * 6)) * e; st.pawL = mixPt(st.pawL, { x: -100, y: -230 }, e); if (!o.magnifier) st.pawR = mixPt(st.pawR, { x: 100, y: -230 }, e); if (talk < 0.1) st.mouth = "grin"; }
      else if (r.kind === "magnify") { st.hold = "magnifier"; st.magS = 1.1; st.magAng = lerp(st.magAng || -60, -150, e); st.pawR = mixPt(st.pawR, { x: 20, y: -200 }, e); st.look = [0.3, -0.4]; }
      else if (r.kind === "tip") { st.pawL = mixPt(st.pawL, { x: -40, y: -250 }, e); st.toqueTip = -14 * e; st.toqueLift = 24 * e; st.wink = e; }
    });
    /* pointing: free paw (or the glass) goes to the target */
    const pa = clamp(o.pointAmt || 0, 0, 1);
    if (pa > 0 && o.point) {
      /* straight arm from the shoulder toward the target (shoulders at (+-60, -66)) */
      const sx = o.point[0] >= 0 ? 60 : -60, dx = o.point[0] - sx, dy = o.point[1] + 66, L = Math.hypot(dx, dy) || 1;
      const reach = { x: sx + (dx / L) * 64, y: -66 + (dy / L) * 64 };
      if (o.magnifier || st.hold === "magnifier") { st.pawR = mixPt(st.pawR, reach, pa); st.magAng = lerp(st.magAng, (Math.atan2(dy, dx) * 180) / Math.PI, pa); }
      else if (dx >= 0) st.pawR = mixPt(st.pawR, reach, pa);
      else st.pawL = mixPt(st.pawL, reach, pa);
      st.look = [clamp(dx / 200, -1, 1), clamp(dy / 300, -1, 1)];
    }
    return st;
  };

  K.bizzyPose = function (t, o) {
    o = o || {};
    const talk = clamp(o.talk || 0, 0, 1), listen = clamp(o.listen || 0, 0, 1), face = o.face || -1, seed = o.seed || 1200;
    const st = { seed, blink: K.blinkAt(t, seed % 89), talk, mouth: "smile", look: [0.3 * face, 0], pad: true, buzz: 0.35, head: 5 * Math.sin(t * 0.9), thinkSide: -face };
    st.squash = 0.05 * Math.sin(t * 3.1 + 1); st.roll = 6 * Math.sin(t * 1.3); st.hop = 6 + 4 * Math.sin(t * 2.2); /* hovering a bit on her wings */
    st.armL = { x: -70, y: -150 }; st.armR = { x: 66, y: -112 };
    if (talk > 0.02) {
      const g = Math.sin(t * 3.4) * 0.5 + 0.5;
      st.armR = { x: 84 + 20 * g * talk, y: -150 - 70 * talk };
      st.head += 6 * talk * Math.sin(t * 4); st.buzz = 0.35 + 0.4 * talk; st.brow = 0.5 * talk; st.look = [0.6 * face, -0.1];
    }
    if (listen > 0) { st.look = [face * listen, 0]; st.head += 8 * nodAt(t, seed) * listen; st.write = ((t * 0.4) % 1) * listen; st.armR = mixPt(st.armR, { x: -30, y: -160 }, listen * 0.8); }
    (o.acts || []).forEach((r) => {
      const e = actEnv(t, r); if (e <= 0) return;
      const u = t - r.at;
      if (r.kind === "surprise") { st.exclaim = e; st.eyeUp = 5 * e; st.brow = 1.3 * e; if (talk < 0.1) st.mouth = "open"; st.hop += 50 * Math.sin(Math.min(1, Math.max(0, u) / 0.45) * Math.PI) * e; st.buzz = 1; st.armR = mixPt(st.armR, { x: 100, y: -260 }, e); }
      else if (r.kind === "think") { st.think = e; st.armR = mixPt(st.armR, { x: 20, y: -205 }, e); st.look = [-0.6, -1]; st.head += 10 * e; if (talk < 0.1) st.mouth = "o"; }
      else if (r.kind === "nod") { st.head += 10 * Math.sin(Math.max(0, u) * 14) * e; }
      else if (r.kind === "grin") { if (talk < 0.1) st.mouth = "grin"; st.wink = e; }
      else if (r.kind === "worry") { st.brow = -0.8 * e; if (talk < 0.1) st.mouth = "worry"; st.buzz = 0.15; }
      else if (r.kind === "cheer") { st.hop += 60 * Math.abs(Math.sin(Math.max(0, u) * 6)) * e; st.armR = mixPt(st.armR, { x: 90, y: -280 }, e); st.armL = mixPt(st.armL, { x: -90, y: -280 }, e); st.buzz = 1; if (talk < 0.1) st.mouth = "grin"; }
      else if (r.kind === "write") { st.write = clamp(u / Math.max(0.3, (r.dur || 1.6) - 0.3), 0, 1); st.armR = mixPt(st.armR, { x: -30, y: -165 }, e); st.look = [-0.5, 0.6]; }
      else if (r.kind === "twirl") { st.lean = 14 * Math.sin(Math.max(0, u) * 9) * e; st.roll += 60 * u * e; st.squash += 0.1 * Math.sin(u * 18) * e; }
    });
    const pa = clamp(o.pointAmt || 0, 0, 1);
    if (pa > 0 && o.point) {
      const sx = o.point[0] >= 0 ? 50 : -50, dx = o.point[0] - sx, dy = o.point[1] + 186, L = Math.hypot(dx, dy) || 1;
      const reach = { x: sx + (dx / L) * 62, y: -186 + (dy / L) * 62 };
      if (o.point[0] >= 0) st.armR = mixPt(st.armR, reach, pa); else { st.armL = mixPt(st.armL, reach, pa); st.pad = pa < 0.5; }
      st.pointHand = o.point[0] >= 0 ? "R" : "L"; st.pointAng = Math.atan2(dy, dx); st.pointAmt = pa; /* pencil held out along the line */
      st.look = [clamp(dx / 200, -1, 1), clamp(dy / 300, -1, 1)];
    }
    return st;
  };

  /* both hosts, large, in screen space. o:
       x, y      centre between them on screen, floor line (default 960, 1040)
       s         overall scale (default 1: Nibbs ~430 px tall, Bizzy ~420 px)
       side      1 = Nibbs left of Bizzy, -1 = mirrored order
       gap       px between them (default 430 * s)
       talkA/B, actsA/B, pointA/B ([sx, sy] screen), pointAmtA/B, a (0..1 slide-in from below)
       magnifier (Nibbs holds the glass), propA(ctx, sx, sy) drawn at Nibbs's free paw,
       propB(ctx, sx, sy) drawn at Bizzy's pad hand instead of the pad, shadow (default true)
     returns { A: {x, y, s, head}, B: {...} } in screen px. */
  K.duo = function (ctx, t, o) {
    o = Object.assign({ x: 960, y: 1040, s: 1, side: 1, talkA: 0, talkB: 0, a: 1, shadow: true }, o || {});
    const a = clamp(o.a, 0, 1); if (a <= 0) return null;
    const gap = o.gap || 430 * o.s, sA = 1.45 * o.s, sB = 1.12 * o.s, drop = (1 - K.E.out3(a)) * 520;
    const ax = o.x - (gap / 2) * o.side, bx = o.x + (gap / 2) * o.side, y = o.y + drop;
    K.screen(ctx);
    if (o.shadow) [[ax, 150 * sA], [bx, 70 * sB]].forEach((q) => { ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = K.P.ink; ctx.beginPath(); ctx.ellipse(q[0], y + 4, q[1], 16 * o.s, 0, 0, K.TAU); ctx.fill(); ctx.restore(); });
    const listenA = o.talkB > 0.05 && o.talkA < 0.05 ? 1 : 0, listenB = o.talkA > 0.05 && o.talkB < 0.05 ? 1 : 0;
    const loc = (p, x0, s) => (p ? [(p[0] - x0) / s, (p[1] - y) / s] : null);
    const pa = K.nibbsPose(t, { talk: o.talkA, listen: listenA, face: o.side, acts: o.actsA, point: loc(o.pointA, ax, sA), pointAmt: o.pointAmtA, magnifier: o.magnifier });
    const pb = K.bizzyPose(t, { talk: o.talkB, listen: listenB, face: -o.side, acts: o.actsB, point: loc(o.pointB, bx, sB), pointAmt: o.pointAmtB });
    if (o.propB) pb.pad = false;
    K.hamster(ctx, ax, y, sA, pa);
    K.bee(ctx, bx, y, sB, pb);
    const pawA = [ax + pa.pawL.x * sA, y + pa.pawL.y * sA], handB = [bx + pb.armL.x * sB, y + (pb.armL.y - (pb.hop || 0)) * sB];
    if (o.propA) o.propA(ctx, pawA[0], pawA[1]);
    if (o.propB) o.propB(ctx, handB[0], handB[1]);
    return { A: { x: ax, y, s: sA, head: [ax, y - 150 * sA], paw: pawA }, B: { x: bx, y, s: sB, head: [bx, y - 262 * sB], hand: handB } };
  };
})(DK);
