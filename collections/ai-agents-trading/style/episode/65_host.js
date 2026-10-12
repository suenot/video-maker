/* ============================================================
   EPISODE 65 HOSTS: Beepo (host A, the explainer, lower voice) and Ping
   (host B, the curious co-host, higher voice), driven by the narration sync
   data (collections/_episode/lib/60_narration.js). Thin adapter: all drawing
   and acting lives in the kit (style/kit/45_cohost.js); this file only feeds
   it loudness, who talks and the stressed-word accents.

   HOST.duo(ctx, g, o)     both hosts in SCREEN space (call after K.screen(ctx)).
                           Returns K.duo's { A, B, free } (free = rect for props).
   HOST.beepoPose(g, o) / HOST.pingPose(g, o)   poses for a solo K.beepo / K.ping
   o (all optional), on top of every K.duo option (layout, s, x, y, holdA/B, beamA/B, a, b):
     reacts    [{ at, kind, dur }] Beepo acting (global seconds):
               point | nod | surprise | think | shrug | cheer | wave | worry | grin
     preacts   the same for Ping
     point / pointAmt     screen point Beepo points at (alias of pointA / pointAmtA)
     ppoint / ppointAmt   the same for Ping
   ============================================================ */
const HOST = (function () {
  const ACC = { a: NR.accents("a"), b: NR.accents("b") };
  /* index of the last accent at or before g: picks a different gesture per stressed word */
  function lastAccent(g, who) {
    const L = ACC[who]; let k = -1;
    for (let i = 0; i < L.length; i++) if (L[i] <= g + 0.1) k = i; else break;
    return k;
  }
  function drive(g, o) {
    o = o || {};
    return Object.assign({}, o, {
      who: NR.who(g), talkA: NR.talk(g, "a"), talkB: NR.talk(g, "b"),
      accentA: NR.accent(g, "a"), accentB: NR.accent(g, "b"),
      accentIdA: lastAccent(g, "a"), accentIdB: lastAccent(g, "b"),
      actsA: o.reacts || o.actsA, actsB: o.preacts || o.actsB,
      pointA: o.point || o.pointA, pointAmtA: o.pointAmt != null ? o.pointAmt : o.pointAmtA,
      pointB: o.ppoint || o.pointB, pointAmtB: o.ppointAmt != null ? o.ppointAmt : o.pointAmtB,
    });
  }
  const duo = (ctx, g, o) => K.duo(ctx, g, drive(g, o));
  function solo(g, o, me) {
    const d = drive(g, o), a = me === "a", who = d.who;
    return K.hostPose(g, {
      kind: a ? "lead" : "cohost", talk: a ? d.talkA : d.talkB, listen: who === (a ? "b" : "a") ? 1 : 0,
      toward: (o && o.toward) || (a ? 1 : -1), accent: a ? d.accentA : d.accentB, accentId: a ? d.accentIdA : d.accentIdB,
      otherAccent: a ? d.accentB : d.accentA, acts: a ? d.actsA : d.actsB, hold: o && o.hold,
      point: o && o.localPoint, pointAmt: o && o.localPointAmt,
    });
  }
  return { duo, drive, beepoPose: (g, o) => solo(g, o, "a"), pingPose: (g, o) => solo(g, o, "b") };
})();
