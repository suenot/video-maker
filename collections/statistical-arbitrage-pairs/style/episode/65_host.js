/* ============================================================
   EPISODE 65 HOSTS: Dapper Dan (the ragtime cat, host A, the explainer, the
   lower voice) and Skip (the boater penguin, host B, the curious co-host, the
   higher voice). Their acting is driven by the narration sync data
   (collections/_episode/lib/60_narration.js): mouths follow the loudness of
   their own voice, the talker's gloves / flippers beat on stressed words, the
   listener looks at the talker and nods on the talker's accents, and every
   ~12 s each host does one small unprompted gesture so nobody is a frozen puppet.
   All drawing lives in the kit (47_hosts.js); this file feeds it and adds carry.

   HOST.duo(ctx, g, o)   both hosts in SCREEN space (it calls K.screen itself).
                         Returns { cat:[x,y], pen:[x,y], gloveR, gloveL, tipR, tipL,
                         catHead, penHead, free:[x0,y0,x1,y1] } (device px; free = the
                         rect left for props).
   HOST.catPose(g, o) / HOST.penguinPose(g, o)   poses for a solo K.cat / K.penguin
                         (aliases HOST.danPose / HOST.skipPose). o: reacts / preacts,
                         point + pointAmt in the rig's LOCAL px, base, toward (+1/-1).
   o (all optional):
     x, y, s        cat feet position (screen px) and scale. Defaults: bottom-left 330, 1045
                    and 1.1 (cat 363 px, penguin 356 px: about 33 % of the frame height)
     side           1 / "left" (default): hosts at the bottom-left, penguin right of the cat
                    -1 / "right": mirrored to the bottom-right (x defaults to 1590)
     ps, gap        penguin scale (default s * 1.2) and cat -> penguin distance (default 315 * s / 1.05)
     point          [sx, sy] screen point Dan points at with the nearer glove
     pointAmt       0..1 blend of the point (use hold(g, a, b))
     ppoint, ppointAmt   the same for Skip's flipper
     reacts         [{ at, kind, dur, target? }] Dan acting (global seconds):
                    point | present | nod | surprise | think | shrug | grin | wave
     preacts        the same for Skip: point | nod | surprise | think | shrug | flap | grin
     carryR/carryL  fn(ctx, x, y, g): draw an item held in Dan's glove at the glove (a coin,
                    a hang tag, a ticket, a scroll). The glove is raised to hold it.
     pcarryR/pcarryL  the same for Skip's flipper tip (a hang tag on a flipper)
     auto           false to switch off the unprompted gestures (default on)
     spot, floor    pool of light under the hosts (default on) / a stage lip (default off)
     cat, pen       false to hide a host (e.g. Dan alone)
     a              appear 0..1 (the hosts slide in from the wing)
   ============================================================ */
const HOST = (function () {
  const ACC = { a: NR.accents("a"), b: NR.accents("b") };
  /* index of the last accent at or before g: picks a different gesture per stressed word */
  function lastAccent(g, who) {
    const L = ACC[who]; let k = -1;
    for (let i = 0; i < L.length; i++) if (L[i] <= g + 0.1) k = i; else break;
    return k;
  }
  /* unprompted gestures: from a host's accent list keep one every >= gap seconds,
     so the layer always acts a little even when a scene gives no reacts */
  function thin(list, gap) { const out = []; list.forEach((t) => { if (!out.length || t - out[out.length - 1] >= gap) out.push(t); }); return out; }
  const AUTO = { a: thin(ACC.a, 12.5), b: thin(ACC.b, 11.5) };
  const SELF_CAT = ["grin", "present", "nod", "present"], LISTEN_CAT = ["nod", "think", "grin", "surprise", "shrug"];
  const SELF_PEN = ["flap", "grin", "nod"], LISTEN_PEN = ["nod", "surprise", "think", "shrug", "grin", "flap"];
  function autoActs(me, g, busy, inward, o) {
    const cat = me === "cat", mine = AUTO[cat ? "a" : "b"], other = AUTO[cat ? "b" : "a"];
    const out = [];
    mine.forEach((t, i) => { if (Math.abs(t - g) < 3) out.push({ at: t + 0.1, kind: (cat ? SELF_CAT : SELF_PEN)[i % (cat ? SELF_CAT : SELF_PEN).length], dur: 1.1, target: [inward * 190, -200], auto: 1 }); });
    other.forEach((t, i) => { if (Math.abs(t - g) < 3) out.push({ at: t + 0.35, kind: (cat ? LISTEN_CAT : LISTEN_PEN)[(i + (cat ? 1 : 3)) % (cat ? LISTEN_CAT : LISTEN_PEN).length], dur: 1.3, target: [inward * 190, -200], auto: 1 }); });
    /* a busy host (pointing or carrying) only nods or grins; and never overlap an explicit act */
    return out.filter((a) => !(busy && !(a.kind === "nod" || a.kind === "grin" || a.kind === "flap")) && !(o.explicit || []).some((e) => Math.abs(e.at - a.at) < (e.dur || 1.2) + 0.5));
  }

  function drive(g, o) {
    o = o || {};
    return {
      who: NR.who(g), talkA: NR.talk(g, "a"), talkB: NR.talk(g, "b"),
      accentA: NR.accent(g, "a"), accentB: NR.accent(g, "b"),
      accentIdA: lastAccent(g, "a"), accentIdB: lastAccent(g, "b"),
    };
  }

  /* one host's pose: kit hostPose + accent juice + listener nods */
  function pose(who, g, d, o) {
    const cat = who === "cat", dir = o.dir, acts = (cat ? o.reacts : o.preacts) || [];
    const pt = cat ? o.localPoint : o.localPPoint, pa = cat ? o.pointAmt : o.ppointAmt;
    const busy = (pt && (pa == null || pa > 0.05)) || !!(cat ? o.carryR || o.carryL : o.pcarryR || o.pcarryL);
    const all = acts.concat(o.auto === false ? [] : autoActs(who, g, busy, o.inward, { explicit: acts }));
    const myTalk = cat ? d.talkA : d.talkB, otherTalk = cat ? d.talkB : d.talkA, myAcc = cat ? d.accentA : d.accentB, otherAcc = cat ? d.accentB : d.accentA;
    const st = K.hostPose(who, g, {
      talk: myTalk, partnerTalk: otherTalk, partnerDir: dir, acts: all, point: pt, pointAmt: pa, base: o.base && o.base[cat ? "cat" : "pen"] ? Object.assign({}, o.base[cat ? "cat" : "pen"]) : undefined,
    });
    /* stressed word: the talker's hand / flippers flick, the body squashes; the listener nods */
    if (cat) {
      st.squash = (st.squash || 0) + 0.07 * myAcc; st.lean = (st.lean || 0) + 3 * myAcc * dir;
      if (!busy && st.gloveR && !o.carryR && myTalk > 0.06) st.gloveR = Object.assign({}, st.gloveR, { y: st.gloveR.y - 45 * myAcc });
    } else {
      st.squash = (st.squash || 0) + 0.08 * myAcc; st.hop = (st.hop || 0) + 10 * myAcc;
      if (myTalk > 0.06 && st.flipR != null) st.flipR += 35 * myAcc;
    }
    if (otherAcc > 0.05 && myTalk < 0.1) st.nod = Math.max(st.nod || 0, 0.6 * otherAcc);
    return st;
  }

  function opts(o) {
    o = o || {};
    const right = o.side === -1 || o.side === "right";
    return Object.assign({}, o, { right, dir: right ? -1 : 1, inward: right ? -1 : 1, base: o.base || {} });
  }

  function duo(ctx, g, o0) {
    const o = opts(o0), d = drive(g, o), right = o.right, P_ = K.P;
    const s = o.s || 1.1, ps = o.ps || s * 1.2, y = o.y || 1045, gap = o.gap || (315 * s) / 1.05;
    const cx = o.x != null ? o.x : right ? 1590 : 330, px = cx + (right ? -gap : gap);
    const a = o.a == null ? 1 : o.a;
    K.screen(ctx);
    if (a <= 0) return null;
    const toLocal = (p, x, sc) => (p ? [(p[0] - x) / sc, (p[1] - y) / sc] : null);
    o.localPoint = toLocal(o.point || o.pointA, cx, s); o.pointAmt = o.pointAmt != null ? o.pointAmt : o.pointAmtA;
    o.localPPoint = toLocal(o.ppoint || o.pointB, px, ps); o.ppointAmt = o.ppointAmt != null ? o.ppointAmt : o.pointAmtB;
    /* carry: raise the holding glove / flipper so the prop hangs in front of the body */
    const base = { cat: Object.assign({}, o.base.cat), pen: Object.assign({}, o.base.pen) };
    if (o.carryR) base.cat.gloveR = { x: 112, y: -178, open: 0.35, rot: -20 };
    if (o.carryL) base.cat.gloveL = { x: -112, y: -178, open: 0.35, rot: 20 };
    if (o.pcarryR) base.pen.aimR = [130, -150];
    if (o.pcarryL) base.pen.aimL = [-130, -150];
    o.base = base;
    const slide = (1 - K.E.out3(K.clamp(a, 0, 1))) * (right ? 700 : -700);
    ctx.save(); ctx.translate(slide, 0);
    if (o.floor) K.shape(ctx, K.rectPts(Math.min(cx, px) - 260, y - 6, Math.abs(px - cx) + 520, 60, 4), { fill: P_.g2, w: 5, boil: 0.6, seed: 1900 });
    if (o.spot !== false) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.translate((cx + px) / 2, y - 4); ctx.scale(1, 0.2); K.glow(ctx, 0, 0, Math.abs(px - cx) / 2 + 320 * s, "rgba(255,250,236,0.55)", 1); ctx.restore(); }
    const ret = { cat: [cx + slide, y], pen: [px + slide, y] };
    let rp = null, rc = null;
    if (o.pen !== false) rp = K.penguin(ctx, px, y, ps, pose("penguin", g, d, o));
    if (o.cat !== false) rc = K.cat(ctx, cx, y, s, pose("cat", g, d, o));
    const carry = (fn, pt) => { if (fn && pt) { ctx.save(); ctx.setTransform(1, 0, 0, 1, K.weave[0], K.weave[1]); fn(ctx, pt[0] - slide, pt[1], g); ctx.restore(); } };
    if (rc) { carry(o.carryR, rc.gloveR); carry(o.carryL, rc.gloveL); }
    if (rp) { carry(o.pcarryR, rp.tipR); carry(o.pcarryL, rp.tipL); }
    ctx.restore();
    const sh = (p) => (p ? [p[0] + slide, p[1]] : null);
    if (rc) Object.assign(ret, { gloveR: sh(rc.gloveR), gloveL: sh(rc.gloveL), catHead: sh(rc.head) });
    if (rp) Object.assign(ret, { tipR: sh(rp.tipR), tipL: sh(rp.tipL), penHead: sh(rp.head) });
    ret.free = right ? [64, 64, px - 190 * ps, 1016] : [px + 190 * ps, 64, 1856, 1016];
    return ret;
  }

  function solo(g, o, me) {
    o = opts(o); const d = drive(g, o), cat = me === "cat";
    const oo = Object.assign({}, o, { localPoint: cat ? o.point : null, localPPoint: cat ? null : o.point, pointAmt: o.pointAmt, ppointAmt: o.pointAmt, dir: o.toward || o.dir });
    return pose(cat ? "cat" : "penguin", g, d, oo);
  }
  return { duo, drive, catPose: (g, o) => solo(g, o, "cat"), penguinPose: (g, o) => solo(g, o, "penguin"), danPose: (g, o) => solo(g, o, "cat"), skipPose: (g, o) => solo(g, o, "penguin") };
})();
