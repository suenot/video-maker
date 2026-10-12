/* ============================================================
   EPISODE 65 HOSTS: Otto the octopus (host A, the explainer, lower voice) and
   Puff the pufferfish intern (host B, the curious co-host, higher voice),
   driven by the narration sync data (collections/_episode/lib/60_narration.js).
   Thin adapter: all drawing and acting lives in the kit (style/kit/45_duo.js);
   this file feeds it loudness, who talks and the reactions, with the same API
   as the crab layer (complex-arbitrage-rust/style/episode/65_host.js).

   HOST.duo(ctx, g, o)   both hosts in SCREEN space (call after K.screen(ctx)).
                         Returns { otto:[x,y], puff:[x,y], head:[x,y], handR, handL, tips }
                         (screen points: Otto's feet, Puff's centre, Otto's head, the tips of
                         his outer / inner arm, all 8 arm tips).
   o (all optional):
     x, y, s        Otto's base point and scale (default 700, 1040, 0.9: Otto ~380 px tall, the
                    duo ~35 % of the frame height, in the bottom-left corner). Keep s >= 0.75.
     corner         "left" (default) | "right": Puff always stands on the screen-edge side, so
                    Otto's pointing arm never crosses Puff. "right" = side 1, x 1220.
     side           -1 Puff to Otto's left (default), +1 to his right (differs from the crab layer,
                    where Puff's default is the right)
     point          [sx, sy] screen point Otto points at with the nearer arm
     pointAmt       0..1 blend of the point (hold(g, t0, t1))
     ppoint, ppointAmt   the same for Puff's fin
     reacts         [{ at, kind, dur }] Otto reactions (global seconds):
                    surprise | grin | worry | shrug | thumbs | jump | spyglass | nod | think | wave | cheer
     preacts        the same for Puff: surprise | flap | worry | grin | think | nod | shrug | wave
     carryR/carryL  fn(ctx, x, y, g): an item held in Otto's outer arm (carryL when side is +1,
                    carryR when side is -1; the other name is accepted too), drawn at the arm tip.
                    The prop is drawn for the K.octo prop signature, x/y = tip, so draw centred.
     stage          false to hide the sand mound (draw your own ground)
     puff           false to hide Puff (Otto alone, no listening glance)
     skin           K.SKIN.* colour shift for Otto (calm | chaos | bull | bear)
     a              appear 0..1 (pops the duo in after a transition)
   Any other K.duo option (actA, actB, propA, seed...) is passed through.
   HOST.ottoPose(g, o) / HOST.puffPose(g, o): the acting inputs for a solo K.octo / K.puffer.
   ============================================================ */
const HOST = (function () {
  const { clamp, ss } = K;
  /* envelope of a reaction: rises 0.18 s, holds, falls 0.3 s */
  const env = (g, r) => { const d = r.dur || 1.6; return ss(r.at - 0.18, r.at, g) * (1 - ss(r.at + d - 0.3, r.at + d, g)); };
  const MAP_A = { surprise: "surprise", jump: "surprise", grin: "grin", thumbs: "grin", worry: "shrug", shrug: "shrug", spyglass: "think", think: "think", nod: "nod", wave: "wave", cheer: "wave", point: "point" };
  const MAP_B = { surprise: "surprise", jump: "surprise", flap: "wave", wave: "wave", cheer: "wave", worry: "worry", grin: "grin", thumbs: "grin", think: "think", spyglass: "think", nod: "nod", shrug: "shrug" };
  /* the strongest active reaction wins (the kit plays one act per host at a time) */
  function pick(g, list, map) {
    let best = null, bu = 0.001;
    (list || []).forEach((r) => { const u = env(g, r), k = map[r.kind]; if (k && u > bu) { bu = u; best = { kind: k, u }; } });
    return best;
  }
  function drive(g, o) {
    o = o || {};
    const tA = NR.talk(g, "a"), tB = NR.talk(g, "b"), who = NR.who(g);
    const right = o.corner === "right";
    const d = Object.assign({ side: right ? 1 : -1, x: right ? 1220 : 700 }, o, {
      talkA: tA, talkB: tB, speaker: who === "a" ? "A" : who === "b" ? "B" : null,
      pointA: o.point || o.pointA, pointAmtA: o.pointAmt != null ? o.pointAmt : o.pointAmtA || 0,
      pointB: o.ppoint || o.pointB, pointAmtB: o.ppointAmt != null ? o.ppointAmt : o.pointAmtB || 0,
      actA: o.actA || pick(g, o.reacts, MAP_A), actB: o.actB || pick(g, o.preacts, MAP_B),
      skinA: o.skin || o.skinA,
    });
    /* a pointing arm and a reaction are separate: pointing wins while it is raised */
    if (d.pointA && d.pointAmtA > 0.02 && d.actA && d.actA.kind !== "think" && d.actA.kind !== "surprise") d.actA = null;
    /* carried item: the outer arm holds it (K.duo draws it through propA) */
    const sd = d.side, carry = sd > 0 ? o.carryL || o.carryR : o.carryR || o.carryL;
    if (carry && !o.propA) d.propA = (c, x, y, ang) => carry(c, x, y, g);
    if (o.puff === false) { d.talkB = 0; d.speaker = who === "a" ? "A" : null; }
    return d;
  }
  /* screen position of the arm tips Otto's outer / inner arm after a duo draw */
  function duo(ctx, g, o) {
    const d = drive(g, o), r = K.duo(ctx, g, d);
    if (!r) return null;
    const sd = d.side, tips = (r.tips || []).map((t) => t && [t.x, t.y]);
    if (d.puff === false) return { otto: [r.A.x, r.A.y], head: r.A.head, tips, handR: tips[6], handL: tips[1] };
    return { otto: [r.A.x, r.A.y], puff: [r.B.x, r.B.y], head: r.A.head, tips, handR: tips[6], handL: tips[1], outer: tips[sd > 0 ? 1 : 6], inner: tips[sd > 0 ? 6 : 1] };
  }
  function ottoPose(g, o) {
    const d = drive(g, o), tA = d.talkA;
    return { blink: K.blinkAt(g, 11), talk: tA, squash: 0.05 * K.pulse(g, 1, 6) + 0.06 * tA + 0.1 * NR.accent(g, "a"), look: [0.1 * Math.sin(g * 0.8), -0.1], seed: 700 };
  }
  function puffPose(g, o) {
    const d = drive(g, o), tB = d.talkB;
    return { blink: K.blinkAt(g, 23), talk: tB, bob: 9 * Math.sin(g * 2.1 + 0.7), squash: 0.05 * K.pulse(g, 1, 6) + 0.08 * tB + 0.1 * NR.accent(g, "b"), seed: 900 };
  }
  return { duo, drive, ottoPose, puffPose };
})();
