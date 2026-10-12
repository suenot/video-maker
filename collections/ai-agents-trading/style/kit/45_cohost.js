/* ============================================================
   KIT 45 CO-HOSTS: Beepo (host A, the explainer) and Ping (host B, the
   curious co-host) as a talking duo for episodes. Everything here is a pure
   function of time and of per-frame inputs (loudness, who talks), so it works
   with any narration source: the episode lib feeds it NR.talk / NR.accent.

   K.ping(ctx, x, y, s, st)   Ping = K.robot with kind "cohost" (hovers, round
                              eyes, bow tie, ice-cyan face). About 0.82 of Beepo.
   K.hostPose(t, o)           -> pose for K.robot. o (all optional):
     kind        "lead" (Beepo, default) | "cohost" (Ping)
     talk        0..1 loudness of THIS host's voice this frame (0 = silent)
     listen      0..1 the other host is talking: look at them, nod on otherAccent
     toward      +1 / -1 side where the other host stands (default +1)
     accent      0..1 own stressed-word pulse; accentId (int) picks the gesture
     otherAccent 0..1 the other host's stressed-word pulse (listener nods)
     acts        [{ at, kind, dur }] acting on top (seconds, same clock as t):
                 point | nod | surprise | think | shrug | cheer | wave | worry | grin
     point       [lx, ly] target in the host's LOCAL space (feet = 0, units of s=1);
                 pointAmt 0..1. The nearer arm reaches, the eyes follow.
     lookAt      [lx, ly] local look target (overrides talk / listen looks)
     hold        { R | L: "ticket" | "lens" | "shield" | "baton" | fn(ctx, ang, st) }
     seed        pose seed (default 900 Beepo, 950 Ping)
   K.toLocal(sx, sy, x, y, s) screen point -> host local point
   K.stage(ctx, x, y, w, t, color)   neon floor pad the hosts stand on
   K.duo(ctx, t, o)           draws both hosts big, in SCREEN space (call after
                              K.screen(ctx)). Returns { A, B, free } where A/B =
                              { x, y, s, head:[sx,sy], hand:{L,R} } and free = the
                              content rect { x, y, w, h } left for explainer props.
     layout      "left" (default: duo bottom-left, Beepo inner next to the props,
                 Ping outer) | "right" (mirror) | "split"
                 (Beepo left edge, Ping right edge, props centre) | "center"
     s           Beepo scale (default 1.25: about 370 px to the head top)
     x, y        Beepo feet override (screen px); gap = Beepo->Ping distance
     who         "a" | "b" | "." who talks (default: the louder of talkA / talkB)
     talkA/B, accentA/B, accentIdA/B, actsA/B, holdA/B
     pointA/B    [sx, sy] screen point to point at; pointAmtA/B 0..1
     beamA/B     true: a neon laser line from the pointing hand to the target
     lookA/B     [sx, sy] screen look target
     stage       false hides the pads;  b false hides Ping;  a appear 0..1
   ============================================================ */
var AK = window.AK || (window.AK = {});
(function (K) {
  const P = K.P, { clamp, lerp, ss } = K;

  K.ping = (ctx, x, y, s, st) => K.robot(ctx, x, y, s, Object.assign({ kind: "cohost", seed: 950 }, st || {}));
  K.PING_SCALE = 0.82; /* Ping's size relative to Beepo in K.duo */

  /* local geometry shared with K.robot (scale 1): hip, shoulder, head centre */
  const hipOf = (kind, t, seed) => (kind === "cohost" ? -K.hoverLift(t, seed) : -44);
  const HEAD = 183; /* head centre above the hip */
  K.toLocal = (sx, sy, x, y, s) => [(sx - x) / s, (sy - y) / s];

  /* reaction envelope: rises 0.18 s, holds, falls 0.3 s */
  const actEnv = (t, r) => { const d = r.dur || 1.6; return ss(r.at - 0.18, r.at, t) * (1 - ss(r.at + d - 0.3, r.at + d, t)); };
  const mixArm = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), open: lerp(a.open, b.open, u) });

  /* talking gestures, shoulder-relative for the RIGHT arm (dx mirrors for the left) */
  const GEST = [
    { R: { dx: 40, dy: -62, open: 0.8 } },                                      /* hand up, open */
    { R: { dx: 58, dy: -8, open: 0.75 }, L: { dx: 58, dy: -8, open: 0.75 } },   /* both out, palms up */
    { L: { dx: 40, dy: -62, open: 0.8 } },                                      /* other hand up */
    { R: { dx: -26, dy: -22, open: 0.1 } },                                     /* hand to the chest */
    { R: { dx: 74, dy: -40, open: 0.9 }, L: { dx: 30, dy: 50, open: 0.2 } },    /* sweep out */
  ];
  K.HOST_GEST = GEST;

  K.hostPose = function (t, o) {
    o = o || {};
    const kind = o.kind || "lead", lead = kind === "lead", seed = o.seed || (lead ? 900 : 950);
    const talk = clamp(o.talk || 0, 0, 1), listen = clamp(o.listen || 0, 0, 1), tw = o.toward || 1;
    const hip = hipOf(kind, t, seed), headY = hip - HEAD;
    const sh = (sd) => [sd * 60, hip - 78];
    const arm = (sd, a) => { const S = sh(sd); return { x: S[0] + sd * a.dx, y: S[1] + a.dy, open: a.open }; };
    const st = { kind, seed, blink: K.blinkAt(t, lead ? 3 : 11), mouth: talk > 0.02 ? "speak" : "smile", talk, brow: 0 };
    /* idle: breathing squash, slow sway, a look that drifts */
    st.squash = 0.035 * Math.sin(t * 2.3 + (lead ? 0 : 1.3));
    st.lean = 1.5 * Math.sin(t * 0.9 + (lead ? 0 : 2));
    st.look = [0.25 * Math.sin(t * 0.7 + seed), -0.1 + 0.1 * Math.sin(t * 0.5)];
    st.headTilt = (lead ? 2 : 4) * Math.sin(t * 0.8 + seed);
    st.bulb = 0.15 + 0.85 * talk; st.chest = 0.3 + 0.7 * talk;
    let aL = { x: -108 + 5 * Math.sin(t * 1.9), y: hip - 30 + 6 * Math.sin(t * 2.6), open: 0.2 };
    let aR = { x: 108 + 5 * Math.sin(t * 2.1 + 1), y: hip - 30 + 6 * Math.sin(t * 2.4 + 2), open: 0.2 };
    /* talking: look at the viewer, gesture on stressed words */
    if (talk > 0.02 || (o.accent || 0) > 0) {
      st.look = [0.2 * Math.sin(t * 0.9 + seed), -0.05];
      const id = o.accentId == null ? 0 : o.accentId, w = clamp(o.accent || 0, 0, 1);
      const G = GEST[Math.abs(id) % GEST.length];
      if (G.L) aL = mixArm(aL, arm(-1, G.L), w);
      if (G.R) aR = mixArm(aR, arm(1, G.R), w);
      st.squash += 0.1 * w; st.brow = 0.6 * w * (K.hash(id, 78) > 0.5 ? 1 : 0.3);
    }
    /* listening: look at the talker, lean in, nod on their stressed words */
    if (listen > 0) {
      st.look = [lerp(st.look[0], 0.9 * tw, listen), lerp(st.look[1], -0.2, listen)];
      st.lean += 3 * tw * listen; st.headTilt += 6 * tw * listen; st.brow = lerp(st.brow, 0.35, listen);
      const n = clamp(o.otherAccent || 0, 0, 1);
      st.headDip = 9 * n * listen; st.squash += 0.05 * n * listen;
    }
    if (o.lookAt) {
      const dx = o.lookAt[0], dy = o.lookAt[1] - headY;
      st.look = [clamp(dx / 260, -1, 1), clamp(dy / 260, -1, 1)];
    }
    /* pointing at content: the nearer arm extends toward the target, eyes follow */
    const pointTo = (tgt, amt) => {
      const sd = tgt[0] >= 0 ? 1 : -1, S = sh(sd), dx = tgt[0] - S[0], dy = tgt[1] - S[1], d = Math.hypot(dx, dy) || 1;
      const reach = { x: S[0] + (dx / d) * 86, y: S[1] + (dy / d) * 86, open: 0.05 };
      if (sd > 0) aR = mixArm(aR, reach, amt); else aL = mixArm(aL, reach, amt);
      st.look = [lerp(st.look[0], clamp(tgt[0] / 200, -1, 1), amt), lerp(st.look[1], clamp((tgt[1] - headY) / 300, -1, 1), amt)];
      st.lean += 3 * sd * amt;
      return sd;
    };
    if (o.point && (o.pointAmt == null || o.pointAmt > 0)) pointTo(o.point, o.pointAmt == null ? 1 : o.pointAmt);
    /* acting */
    (o.acts || []).forEach((r) => {
      const e = actEnv(t, r); if (e <= 0) return;
      const k = r.kind;
      if (k === "point" && r.to) pointTo(r.to, e);
      else if (k === "nod") { st.headDip = (st.headDip || 0) + 10 * Math.max(0, Math.sin((t - r.at) * 11)) * e; st.look[1] = lerp(st.look[1], 0.3, e); }
      else if (k === "surprise") {
        st.blink = 0; st.eyes = "wide"; st.brow = 1.4 * e; st.exclaim = e; if (talk < 0.1) { st.mouth = "o"; }
        st.hop = 16 * Math.max(0, Math.sin(K.inv(r.at, r.at + 0.35, t) * Math.PI)); st.squash -= 0.18 * e;
        aL = mixArm(aL, arm(-1, { dx: 46, dy: -70, open: 0.95 }), e); aR = mixArm(aR, arm(1, { dx: 46, dy: -70, open: 0.95 }), e);
      } else if (k === "think") {
        aR = mixArm(aR, { x: 30, y: headY + 70, open: 0.1 }, e); /* mitt to the chin */
        aL = mixArm(aL, arm(-1, { dx: -10, dy: 30, open: 0.2 }), e);
        st.look = [lerp(st.look[0], 0.6, e), lerp(st.look[1], -0.85, e)]; st.brow = lerp(st.brow, 0.9, e); st.headTilt += 8 * e;
        st.think = K.inv(r.at, r.at + 0.6, t) * e; if (talk < 0.05) st.mouth = "flat";
      } else if (k === "shrug") {
        aL = mixArm(aL, arm(-1, { dx: 64, dy: -26, open: 0.85 }), e); aR = mixArm(aR, arm(1, { dx: 64, dy: -26, open: 0.85 }), e);
        st.brow = 1.1 * e; st.squash += 0.08 * e; st.headTilt += 7 * e;
      } else if (k === "cheer") {
        const j = Math.max(0, Math.sin(K.inv(r.at, r.at + 0.5, t) * Math.PI));
        aL = mixArm(aL, arm(-1, { dx: 46, dy: -92, open: 1 }), e); aR = mixArm(aR, arm(1, { dx: 46, dy: -92, open: 1 }), e);
        st.eyes = "happy"; st.hop = 40 * j; if (talk < 0.1) st.mouth = "open"; st.bulb = 1;
      } else if (k === "wave") {
        aR = mixArm(aR, arm(1, { dx: 42 + 18 * Math.sin((t - r.at) * 12), dy: -84, open: 1 }), e); st.eyes = st.eyes || "happy";
      } else if (k === "worry") {
        st.brow = -1 * e; if (talk < 0.1) st.mouth = "o"; st.lean -= 4 * tw * e;
        aL = mixArm(aL, arm(-1, { dx: -22, dy: 34, open: 0.15 }), e); aR = mixArm(aR, arm(1, { dx: -22, dy: 34, open: 0.15 }), e); /* hands wrung low */
      } else if (k === "grin") { st.eyes = "happy"; st.brow = 0.8 * e; st.squash += 0.05 * e; }
    });
    st.armL = aL; st.armR = aR;
    if (o.hold) st.hold = o.hold;
    return st;
  };

  /* neon floor pad: an elliptical light ring with tick marks */
  K.stage = function (ctx, x, y, w, t, color) {
    const c = color || P.cyan, h = w * 0.16;
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 4, x, y, w * 0.6); g.addColorStop(0, K.rgba(c, 0.28)); g.addColorStop(1, K.rgba(c, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, w * 0.6, h * 1.4, 0, 0, K.TAU); ctx.fill();
    ctx.restore();
    const pts = K.ellipsePts(x, y, w / 2, h, 32);
    K.neon(ctx, pts, { color: c, w: 5, closed: true, seed: 960 + (x | 0) % 97 });
    ctx.save(); ctx.strokeStyle = K.rgba(c, 0.6); ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * K.TAU + t * 0.4, cx = x + Math.cos(a) * w * 0.42, cy = y + Math.sin(a) * h * 0.84;
      if (Math.sin(a) < 0) continue; /* only the front half (the hosts cover the back) */
      ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.stroke();
    }
    ctx.restore();
  };

  /* neon laser pointer from a hand to a target, with a pulsing dot */
  function beam(ctx, from, to, a, color, t) {
    if (a <= 0) return;
    const c = color || P.pink, u = clamp(a, 0, 1), end = [lerp(from[0], to[0], u), lerp(from[1], to[1], u)];
    ctx.save(); ctx.globalAlpha = 0.9 * u; ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 120;
    ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.shadowColor = c; ctx.shadowBlur = 12; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(end[0], end[1]); ctx.stroke(); ctx.restore();
    if (u > 0.95) { K.glow(ctx, to[0], to[1], 40, K.rgba(c, 0.9), 0.6 + 0.3 * Math.sin(t * 9)); K.dot(ctx, to[0], to[1], 8, "#ffffff", c, 3, 970); }
  }

  const LAYOUT = {
    left: { ax: 600, bx0: 250, dir: 1 }, right: { ax: 1320, bx0: 1670, dir: -1 }, /* Beepo inner (next to the props), Ping outer */
    split: { ax: 250, bx: 1670, dir: 1 }, center: { ax: 760, bx: 1160, dir: 1 },
  };

  K.duo = function (ctx, t, o) {
    o = o || {};
    const L = LAYOUT[o.layout || "left"] || LAYOUT.left, s = o.s || 1.25, sb = s * K.PING_SCALE;
    const bob = 4 * Math.sin(t * 1.5);
    const ax = o.x == null ? L.ax : o.x, ay = (o.y == null ? 1000 : o.y);
    const gap = o.gap || 300 * s, by = ay + 8;
    const bx = o.x == null ? (L.bx != null ? L.bx : L.bx0) : L.bx0 != null ? ax - L.dir * gap : ax + gap;
    const a = o.a == null ? 1 : K.E.back(clamp(o.a, 0, 1), 1.8);
    const showB = o.b !== false;
    const who = o.who || ((o.talkB || 0) > (o.talkA || 0) + 0.05 ? "b" : (o.talkA || 0) > 0.05 ? "a" : ".");
    const twA = bx >= ax ? 1 : -1;
    const res = { A: { x: ax, y: ay, s, head: [ax, ay + (-44 - HEAD) * s], hand: {} }, B: { x: bx, y: by, s: sb, head: [bx, by + (-K.hoverLift(t, 950) - HEAD) * sb], hand: {} } };
    /* free content rect: the frame minus the hosts' column(s), 64 px safe margins */
    const hostW = 210 * s;
    if (o.layout === "split") res.free = { x: ax + hostW, y: 64, w: bx - ax - 2 * hostW, h: 1080 - 128 };
    else if (o.layout === "center") res.free = { x: 64, y: 64, w: 1792, h: ay - 380 * s - 64 };
    else {
      const x0 = Math.min(ax, bx) - hostW, x1 = Math.max(ax, bx) + hostW;
      res.free = L.dir > 0 ? { x: x1, y: 64, w: 1856 - x1, h: 952 } : { x: 64, y: 64, w: x0 - 64, h: 952 };
    }
    if (a <= 0) return res;
    ctx.save(); const cx = (ax + bx) / 2; ctx.translate(cx, ay); ctx.scale(a, a); ctx.translate(-cx, -ay);
    if (o.stage !== false) { K.stage(ctx, ax, ay + 4, 250 * s, t, P.pink); if (showB) K.stage(ctx, bx, by + 4, 220 * sb, t + 3, P.cyan); }
    const local = (pt, x, y, sc) => (pt ? K.toLocal(pt[0], pt[1], x, y, sc) : null);
    const poseA = K.hostPose(t, {
      kind: "lead", talk: o.talkA || 0, listen: who === "b" && showB ? 1 : 0, toward: twA,
      accent: o.accentA, accentId: o.accentIdA, otherAccent: o.accentB, acts: o.actsA, hold: o.holdA,
      point: local(o.pointA, ax, ay + bob, s), pointAmt: o.pointAmtA, lookAt: local(o.lookA, ax, ay + bob, s),
    });
    const poseB = K.hostPose(t, {
      kind: "cohost", talk: o.talkB || 0, listen: who === "a" ? 1 : 0, toward: -twA,
      accent: o.accentB, accentId: o.accentIdB, otherAccent: o.accentA, acts: o.actsB, hold: o.holdB,
      point: local(o.pointB, bx, by, sb), pointAmt: o.pointAmtB, lookAt: local(o.lookB, bx, by, sb),
    });
    /* the farther host first, so the one in front overlaps correctly */
    const drawA = () => { K.beepo(ctx, ax, ay + bob, s, poseA); res.A.hand = { L: K.hands.L.slice(), R: K.hands.R.slice() }; };
    const drawB = () => { K.ping(ctx, bx, by, sb, poseB); res.B.hand = { L: K.hands.L.slice(), R: K.hands.R.slice() }; };
    if (showB) drawB(); drawA();
    ctx.restore();
    /* laser pointers (screen space, after both hosts) */
    const handFor = (R, pt) => (pt[0] >= R.x ? R.hand.R : R.hand.L);
    if (o.pointA && o.beamA) beam(ctx, handFor(res.A, o.pointA), o.pointA, (o.pointAmtA == null ? 1 : o.pointAmtA) * 1.6 - 0.6, P.pink, t);
    if (showB && o.pointB && o.beamB) beam(ctx, handFor(res.B, o.pointB), o.pointB, (o.pointAmtB == null ? 1 : o.pointAmtB) * 1.6 - 0.6, P.cyan, t);
    return res;
  };
})(AK);
