/* ============================================================
   EPISODE 65 HOSTS: Mr. Tick (mouse stationmaster, host A, the explainer, lower
   voice) and Dash (pigeon telegraph clerk, host B, the curious co-host). Thin
   adapter over the kit's K.duo (style/kit/44_hosts.js): all drawing and acting
   lives in the kit, this file feeds it the narration sync data (loudness, who
   talks, stressed-word accents) and keeps the same options as the crab layer.

   HOST.duo(ctx, g, o)        both hosts in SCREEN space (call after K.screen(ctx)).
   HOST.tickPose(g, o)        pose for a solo K.mouse (alias mousePose); o needs x, y, s
   HOST.dashPose(g, o)        pose for a solo K.pigeon (alias pigeonPose); o needs x, y, s, face
   o (all optional):
     side           +1 hosts own the bottom-LEFT corner (default), -1 bottom-RIGHT
     x, y, s        Mr. Tick's feet (screen px) and scale. Defaults 470 / 1440 (by side), 1000, 1.2:
                    Mr. Tick 360 px tall, Dash ~300 px, about 30 % of the frame with the platform.
                    (K.duo units: s 1.15 is already ~30 %, so s here is NOT the crab's 1.55.)
     point          [sx, sy] screen point Mr. Tick points at with the hand nearer to it
     pointAmt       0..1 blend (use hold(...) / K.ss over a cue to raise and lower)
     ppoint, ppointAmt   the same for Dash (he points over Mr. Tick's head)
     reacts         [{ at, kind, dur }] Mr. Tick (global seconds):
                    surprise | grin | worry | shrug | thumbs | watch | whistle | wave | nod | think | point
                    (crab names accepted: jump -> surprise, spyglass -> watch)
     preacts        the same for Dash: surprise | flap | worry | grin | think | shrug | wave | nod |
                    tape | ticket (with label) | point
     carryR/carryL  fn(ctx, x, y, g): a prop held in Mr. Tick's right / left hand. (x, y) is the
                    palm in SCREEN px (the ctx is already unscaled), so crab-style props work:
                    (c, x, y) => K.tag(c, x, y - 30, "VWAP", { size: 30 }). One prop per host;
                    it is drawn under the glove. Do not carry and point with the same hand.
     pcarryR/pcarryL  the same for Dash;   carryAmt / pcarryAmt  0..1 raise to the chest (default 1)
     layout         "left" | "right" | "flank" (K.duo layouts; side picks left/right by default)
     stage          "platform" (default) | "none" (draw your own ground)
     pointUp        min arm elevation (rad) of Dash's wing so it clears Mr. Tick's ears (default 0.9)
     dash           false to hide Dash (Mr. Tick alone)
     a              appear 0..1 (pops the duo in, e.g. after a transition)
   returns { a, b, speaker, mouse:[x,y], pigeon:[x,y], handR, handL, head, free }
     a / b  K.duo anchors { x, y, s, head:[x,y], hand:[x,y], pose };  handR/handL = Mr. Tick's
     palms in screen px (start a thrown prop there);  free = { x, y, w, h } room for content.
   ============================================================ */
const HOST = (function () {
  const ACC = { a: NR.accents("a"), b: NR.accents("b") };
  const KIND = { jump: "surprise", spyglass: "watch" };
  const mapActs = (L) => (L || []).map((r) => (KIND[r.kind] ? Object.assign({}, r, { kind: KIND[r.kind] }) : r));

  /* a crab-style carry fn(ctx, x, y, g) -> kit carry { draw, side, amt }; the kit draws in rig space (scaled by
     the host's s), so undo that scale: the prop sees screen px with the palm at (x, y) */
  function mkCarry(fn, side, amt, s, g) {
    if (!fn) return null;
    return { side, amt: amt == null ? 1 : amt, draw: (c, x, y) => { c.save(); c.translate(x, y); c.scale(1 / s, 1 / s); fn(c, 0, 0, g); c.restore(); } };
  }
  function inputs(g, o, s, bs) {
    const side = o.side === -1 ? -1 : 1;
    const cA = o.carryR ? mkCarry(o.carryR, 1, o.carryAmt, s, g) : mkCarry(o.carryL, -1, o.carryAmt, s, g);
    const cB = o.pcarryR ? mkCarry(o.pcarryR, 1, o.pcarryAmt, bs, g) : mkCarry(o.pcarryL, -1, o.pcarryAmt, bs, g);
    const a = { talk: NR.talk(g, "a"), accents: ACC.a, nodAt: ACC.b, gest: mapActs(o.reacts), point: o.point, pointAmt: o.pointAmt, carry: cA, seed: o.seedA };
    const b = { talk: NR.talk(g, "b"), accents: ACC.b, nodAt: ACC.a, gest: mapActs(o.preacts), point: o.ppoint, pointAmt: o.ppointAmt, carry: cB, seed: o.seedB, pointUp: o.pointUp == null ? 0.9 : o.pointUp };
    if (o.b && typeof o.b === "object") Object.assign(b, o.b);      /* raw K.duo per-host overrides still work */
    if (o.aIn && typeof o.aIn === "object") Object.assign(a, o.aIn);
    return { a, b, side };
  }

  function duo(ctx, g, o) {
    o = o || {};
    const side = o.side === -1 ? -1 : 1, s = o.s || 1.2, bs = s * (o.bs || 1.05);
    const who = NR.who(g), I = inputs(g, o, s, bs);
    const d = {
      layout: o.layout || (side < 0 ? "right" : "left"), s, bs: o.bs, gap: o.gap, bx: o.bx,
      x: o.x == null ? (side < 0 ? 1440 : 470) : o.x, y: o.y == null ? 1000 : o.y,
      stage: o.stage, appear: o.a == null ? 1 : o.a,
      speaker: who === "a" || who === "b" ? who : null,
      a: I.a, b: o.dash === false ? false : I.b,
    };
    const H = K.duo(ctx, g, d);
    if (!H) return null;
    const ap = H.a.pose, hp = (k) => (ap[k] ? [H.a.x + ap[k].x * H.a.s, H.a.y + ap[k].y * H.a.s] : null);
    const right = d.layout === "right";
    const free = right ? { x: 64, y: 170, w: 1130, h: 770 } : { x: 700, y: 170, w: 1156, h: 770 };
    return Object.assign(H, { mouse: [H.a.x, H.a.y], pigeon: [H.b.x, H.b.y], handR: hp("handR"), handL: hp("handL"), clawR: hp("handR"), clawL: hp("handL"), head: H.a.head, free });
  }

  function solo(g, o, me) {
    o = o || {};
    const s = o.s || 1.2, I = inputs(g, o, s, s), who = NR.who(g), a = me === "a";
    const base = Object.assign({}, a ? I.a : I.b, { x: o.x == null ? 470 : o.x, y: o.y == null ? 1000 : o.y, s });
    base.listen = o.listen != null ? o.listen : who === (a ? "b" : "a") ? 1 : 0;
    if (a) { base.toward = o.toward || 1; return K.mousePose(g, base); }
    base.face = o.face || -1; return K.pigeonPose(g, base);
  }
  const tickPose = (g, o) => solo(g, o, "a"), dashPose = (g, o) => solo(g, o, "b");
  return { duo, tickPose, dashPose, mousePose: tickPose, pigeonPose: dashPose };
})();
