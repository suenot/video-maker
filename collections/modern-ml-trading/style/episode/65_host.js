/* ============================================================
   EPISODE 65 HOSTS: Professor Strix (owl, host A, the explainer, lower voice) and
   Pico (hummingbird, host B, the curious co-host, higher voice). Their acting is
   driven by the narration sync data (collections/_episode/lib/60_narration.js):
   mouths follow the loudness of their own voice, the talker gestures on stressed
   words, the listener looks at the talker and nods on the talker's accents.
   Thin adapter: all drawing and acting lives in the kit (style/kit/46_duo.js).
   Same API as the crab layer (complex-arbitrage-rust/style/episode/65_host.js).

   HOST.duo(ctx, g, o)   both hosts on the lab bench in SCREEN space (call after K.screen(ctx)).
                         Returns { owl, bird, owlHead, birdHead, handR, handL, free } (screen points;
                         handR/handL = the owl's gloves, to start a thrown item; free = rect {x0,x1,y0,y1}
                         left for content).
   HOST.owlPose(g, o) / HOST.picoPose(g, o)   the pose objects (for K.owl / K.hummingbird drawn yourself)
   o (all optional):
     x, y, s        owl feet (screen px) and scale (default 380, 1010, 0.95: the owl is 410 px tall and
                    Pico about 310 px, together about 30 % of the frame height; close-ups s 1.2 - 1.6)
     side           +1 Pico to the owl's right, -1 to the left (default +1; bottom-right: side -1, x about 1540)
     point          [sx, sy] screen point the owl points at with the nearer free glove
     pointAmt       0..1 blend of the point (use hold(g, a, b) or K.ss)
     ppoint, ppointAmt   the same for Pico's wing
     reacts         [{ at, kind, dur }] owl reactions (global seconds):
                    surprise | grin | worry | shrug | thumbs | jump | magnifier | nod | think
     preacts        the same for Pico: surprise | nod | think | write | flip | worry | flap | grin
     carryR/carryL  fn(ctx, x, y, g): draw an item held in that glove (x, y = the fist, screen px, the
                    item stays upright: a flask, a tag, a seed, a scroll); carryPoseR/L {x, y, hand}
                    move the glove (owl-local px); carryAmt 0..1 raises it from rest (default 1)
     stage          "bench" (default) | "none" (draw your own ground)
     hideB          true: the owl alone
     birdDx, birdDy  offset Pico (e.g. to hover over a plate)
     a              appear 0..1 (pops the duo in, e.g. after a transition)
   ============================================================ */
const HOST = (function () {
  const { clamp, ss } = K;
  const ACC = { a: NR.accents("a"), b: NR.accents("b") };
  /* index of the last accent at or before g: picks a different gesture per stressed word */
  function lastAccent(g, who) {
    const L = ACC[who]; let k = -1;
    for (let i = 0; i < L.length; i++) if (L[i] <= g + 0.1) k = i; else break;
    return k;
  }
  /* envelope of a reaction: rises 0.18 s, holds, falls 0.3 s */
  const env = (g, r) => { const d = r.dur || 1.6; return ss(r.at - 0.18, r.at, g) * (1 - ss(r.at + d - 0.3, r.at + d, g)); };
  /* the strongest active reaction -> K.duo's { kind, amt } */
  function pick(g, list) {
    let best = null;
    (list || []).forEach((r) => { const e = env(g, r); if (e > 0 && (!best || e > best.amt)) best = { kind: r.kind, amt: e, r }; });
    return best;
  }
  /* wrap a screen-space carry fn as a glove-frame callback: undo the forearm rotation and the owl scale,
     so the item is drawn upright in screen px at the fist (under the fingers) */
  function carry(fn, g) {
    if (!fn) return null;
    return (c) => {
      const m = c.getTransform(), sc = Math.hypot(m.a, m.b) || 1;
      c.save(); c.rotate(-Math.atan2(m.b, m.a)); c.scale(1 / sc, 1 / sc);
      fn(c, 0, 0, g);
      c.restore();
    };
  }
  function drive(g, o) {
    o = o || {};
    const who = NR.who(g), ka = lastAccent(g, "a"), kb = lastAccent(g, "b");
    const rA = pick(g, o.reacts), rB = pick(g, o.preacts), d = Object.assign({}, o);
    d.s = o.s || 0.95; d.y = o.y == null ? 1010 : o.y;
    d.who = who === "a" || who === "b" ? who : null;
    d.talkA = NR.talk(g, "a"); d.talkB = NR.talk(g, "b");
    d.accA = NR.accent(g, "a"); d.accB = NR.accent(g, "b");
    d.gestA = ka < 0 ? 0 : Math.floor(K.hash(ka, 77) * 97); d.gestB = kb < 0 ? 0 : Math.floor(K.hash(kb, 91) * 97);
    d.pointA = o.point || o.pointA; d.pointAmtA = o.pointAmt != null ? o.pointAmt : o.pointAmtA;
    d.pointB = o.ppoint || o.pointB; d.pointAmtB = o.ppointAmt != null ? o.ppointAmt : o.pointAmtB;
    d.reactA = rA && { kind: rA.kind === "jump" ? "jump" : rA.kind, amt: rA.amt };
    d.reactB = rB && { kind: rB.kind, amt: rB.amt };
    if (rA && rA.kind === "jump") { /* hop with anticipation and landing squash */
      const r = rA.r, j1 = r.at + 0.55, air = K.inv(r.at, j1, g), h = Math.sin(air * Math.PI);
      d.hopA = 70 * h;
      const land = K.inv(j1, j1 + 0.35, g);
      d.squashA = 0.3 * ss(r.at - 0.3, r.at, g) * (1 - ss(r.at, r.at + 0.05, g)) - 0.25 * h + (land > 0 && land < 1 ? 0.3 * Math.sin(land * Math.PI) * (1 - land) : 0);
    }
    if (o.carryR) d.holdAR = carry(o.carryR, g);
    if (o.carryL) d.holdA = carry(o.carryL, g);
    return d;
  }
  const duo = (ctx, g, o) => K.duo(ctx, g, drive(g, o));
  const pose = (g, o) => K.duo(null, g, Object.assign(drive(g, o), { poseOnly: true }));
  return { duo, drive, owlPose: (g, o) => pose(g, o).A, picoPose: (g, o) => pose(g, o).B };
})();
