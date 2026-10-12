/* ============================================================
   EPISODE 65 HOSTS: Chef Nibbs (hamster, host A, the explainer, lower voice) and
   Bizzy (bee waitress on skates, host B, the curious co-host, higher voice).
   Same API as the crab layer (complex-arbitrage-rust/style/episode/65_host.js).
   Drawing lives in the kit (40_hamster.js, 46_bee.js, 55_hosts.js); this file feeds it
   the narration sync data (mouths, accents, who talks) and adds what an episode needs:
   a gesture per stressed word, carried props, the crab-style reaction names.

   HOST.nibbsPose(g, o) / HOST.bizzyPose(g, o)   poses for a solo K.hamster / K.bee
                                                  (aliases: mascotPose / sidekickPose)
   HOST.duo(ctx, g, o)   draws both hosts in SCREEN space (call after K.screen(ctx)).
   o (all optional):
     x, y, s        Nibbs feet position (screen px) and scale. Default 300, 1040, 0.9: the
                    hosts are about 33 % of the frame height (Nibbs ~385 px, Bizzy ~375 px).
                    s is the KIT scale (K.duo): 0.9 here is what s 1.55 is for the crab.
                    Never go below s 0.7 for more than a few seconds; close-ups are s 1.0+.
     side           +1 Bizzy to the right of Nibbs, -1 to the left (default +1). For the
                    bottom-right corner use side -1 and x about 1620.
     gap            px between the hosts (default 430 * s)
     point          [sx, sy] screen point Nibbs points at (free paw, or the glass)
     pointAmt       0..1 blend of the point (use hold(g, a, b))
     ppoint, ppointAmt   the same for Bizzy (she holds out her pencil)
     reacts         [{ at, kind, dur }] Nibbs reactions (global seconds):
                    surprise | grin | worry | think | nod | shrug | thumbs | jump | cheer |
                    spyglass (alias of magnify: raises the glass) | tip (toque tip)
     preacts        the same for Bizzy: surprise | grin | worry | think | nod | cheer |
                    flap | shrug | write | twirl
     carryR/carryL  fn(ctx, x, y, g): draw an item held in that paw, (x, y) = the paw tip.
                    Draw it ABOVE the tip: K.coin(c, x, y - 30, 34, ...). carryPoseR/L {x, y}
                    moves the paw (local space, default (+-88, -118)).
     pcarryR/pcarryL  the same for Bizzy's hands; pcarryL puts the order pad away.
     magnifier      true: Nibbs holds the glass in his right paw (pointing aims it)
     stage          "mat" (default: floor shadows) | "none"
     bizzy          false hides Bizzy (Nibbs alone, centred on x)
     a              appear 0..1 (the duo rises from below; use after a transition)
   returns { mascot:[x,y], sidekick:[x,y], clawR, clawL (Nibbs paw tips, screen px),
             handR, handL (Bizzy hand tips), head:[x,y] (Nibbs head), bhead:[x,y], A, B }
   ============================================================ */
const HOST = (function () {
  const { clamp, lerp, ss } = K;
  const mixPt = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), rot: b.rot != null && u > 0.5 ? b.rot : a.rot });
  /* envelope of a reaction: rises 0.18 s, holds, falls 0.3 s (same as the kit's actEnv) */
  const env = (g, r) => { const d = r.dur || 1.6; return ss(r.at - 0.18, r.at, g) * (1 - ss(r.at + d - 0.3, r.at + d, g)); };
  const ACC = { a: NR.accents("a"), b: NR.accents("b") };
  function lastAccent(g, who) {
    const L = ACC[who]; let k = -1;
    for (let i = 0; i < L.length; i++) if (L[i] <= g + 0.1) k = i; else break;
    return k;
  }
  /* the stressed-word envelope: rises with the word, falls after ~1 s */
  function accentEnv(g, who, a0, a1) {
    const k = lastAccent(g, who); if (k < 0) return { k, w: 0 };
    const ta = ACC[who][k];
    return { k, w: ss(ta - 0.1, ta + (a0 || 0.14), g) * (1 - ss(ta + (a1 || 0.75), ta + (a1 || 0.75) + 0.5, g)) };
  }

  /* Nibbs' gesture library on stressed words (paw targets, local space; the shoulders are at +-60, -66) */
  const GA = [
    { L: { x: -100, y: -122 } },                              /* left paw up */
    { L: { x: -122, y: -88 }, R: { x: 122, y: -88 } },        /* both out, palms up */
    { R: { x: 100, y: -122 } },                               /* right paw up */
    { R: { x: 30, y: -84 } },                                 /* paw to the chin */
    { R: { x: 124, y: -96 }, L: { x: -70, y: -40 } },         /* sweep out */
  ];
  /* Bizzy's right hand (the left holds the pad); shoulder at (50, -186) */
  const GB = [{ x: 104, y: -208 }, { x: 112, y: -170 }, { x: 90, y: -238 }, { x: 70, y: -140 }];

  const KIT_A = { surprise: 1, grin: 1, worry: 1, think: 1, nod: 1, cheer: 1, tip: 1, magnify: 1 };
  const KIT_B = { surprise: 1, grin: 1, worry: 1, think: 1, nod: 1, cheer: 1, write: 1, twirl: 1 };

  function nibbsPose(g, o) {
    o = o || {};
    const side = o.side || 1, ta = NR.talk(g, "a"), tb = NR.talk(g, "b");
    const rs = o.reacts || [];
    const acts = rs.filter((r) => KIT_A[r.kind] || r.kind === "spyglass").map((r) => (r.kind === "spyglass" ? Object.assign({}, r, { kind: "magnify" }) : r));
    const pa = o.pointAmt == null ? (o.point ? 1 : 0) : o.pointAmt;
    const st = K.nibbsPose(g, {
      talk: ta, listen: tb > 0.05 && ta < 0.05 ? 1 : 0, face: side, acts, seed: 700, magnifier: o.magnifier,
      point: o.localPoint || null, pointAmt: o.localPoint ? pa : 0,
    });
    let pl = st.pawL, pr = st.pawR;
    /* a different gesture per stressed word (not while pointing, carrying or holding the glass) */
    const ac = accentEnv(g, "a");
    if (ac.k >= 0 && ac.w > 0) {
      const G = GA[Math.floor(K.hash(ac.k, 77) * GA.length)], w = ac.w * (1 - pa);
      if (G.L && !o.carryL) pl = mixPt(pl, G.L, w);
      if (G.R && !o.carryR && !o.magnifier) pr = mixPt(pr, G.R, w);
      st.squash += 0.08 * NR.accent(g, "a");
      if (K.hash(ac.k, 78) > 0.5) st.brow = Math.max(st.brow || 0, 0.6 * w);
    }
    if (o.carryL) pl = Object.assign({ x: -88, y: -118 }, o.carryPoseL || {});
    if (o.carryR) pr = Object.assign({ x: 88, y: -118 }, o.carryPoseR || {});
    /* crab-style reactions the kit does not know */
    rs.forEach((r) => {
      const e = env(g, r); if (e <= 0) return;
      if (r.kind === "shrug") {
        if (!o.carryL) pl = mixPt(pl, { x: -118, y: -92 }, e);
        if (!o.carryR && !o.magnifier) pr = mixPt(pr, { x: 118, y: -92 }, e);
        st.brow = 1.1 * e; st.squash += 0.06 * e; if (ta < 0.1) st.mouth = "smirk";
      } else if (r.kind === "thumbs") {
        if (!o.carryR && !o.magnifier) pr = mixPt(pr, { x: 92, y: -124, rot: -90 }, e);
        if (ta < 0.1) st.mouth = "grin"; st.cheeks = Math.max(st.cheeks || 0, 0.9 * e);
      } else if (r.kind === "jump") {
        const j1 = r.at + 0.55, air = K.inv(r.at, j1, g), h = Math.sin(air * Math.PI);
        st.squash += 0.3 * ss(r.at - 0.3, r.at, g) * (1 - ss(r.at, r.at + 0.05, g)) - 0.3 * h * (air < 1 ? 1 : 0);
        st.hop = (st.hop || 0) + 60 * h; if (ta < 0.1) st.mouth = "open";
        const land = K.inv(j1, j1 + 0.35, g); if (land > 0 && land < 1) st.squash += 0.3 * Math.sin(land * Math.PI) * (1 - land);
        if (!o.carryL) pl = mixPt(pl, { x: -100, y: -170 }, h);
        if (!o.carryR && !o.magnifier) pr = mixPt(pr, { x: 100, y: -170 }, h);
      }
    });
    st.pawL = pl; st.pawR = pr;
    /* a pointing host leans into the point: the paw alone is short (68 px) and reads weakly */
    if (pa > 0 && o.localPoint) st.lean = (st.lean || 0) + 7 * pa * (o.localPoint[0] >= 0 ? 1 : -1);
    return st;
  }

  function bizzyPose(g, o) {
    o = o || {};
    const side = o.side || 1, ta = NR.talk(g, "a"), tb = NR.talk(g, "b");
    const rs = o.preacts || [];
    const acts = rs.filter((r) => KIT_B[r.kind]);
    const pa = o.ppointAmt == null ? (o.localPPoint ? 1 : 0) : o.ppointAmt;
    const st = K.bizzyPose(g, {
      talk: tb, listen: ta > 0.05 && tb < 0.05 ? 1 : 0, face: -side, acts, seed: 1200,
      point: o.localPPoint || null, pointAmt: o.localPPoint ? pa : 0,
    });
    let al = st.armL, ar = st.armR;
    const ac = accentEnv(g, "b", 0.12, 0.6);
    if (ac.k >= 0 && ac.w > 0 && !o.pcarryR) {
      ar = mixPt(ar, GB[Math.floor(K.hash(ac.k, 91) * GB.length)], ac.w * (1 - pa));
      st.buzz = Math.min(1, (st.buzz == null ? 0.35 : st.buzz) + 0.4 * ac.w);
      st.hop = (st.hop || 0) + 8 * NR.accent(g, "b");
    }
    if (o.pcarryR) ar = Object.assign({ x: 86, y: -210 }, o.pcarryPoseR || {});
    if (o.pcarryL) { al = Object.assign({ x: -86, y: -210 }, o.pcarryPoseL || {}); st.pad = false; }
    rs.forEach((r) => {
      const e = env(g, r); if (e <= 0) return;
      if (r.kind === "flap") {
        const f = 0.5 + 0.5 * Math.sin((g - r.at) * 26);
        st.buzz = 1; st.hop = (st.hop || 0) + 22 * e * (0.6 + 0.4 * f); ar = mixPt(ar, { x: 104, y: -250 }, e);
        if (!o.pcarryL) al = mixPt(al, { x: -104, y: -250 }, e);
      } else if (r.kind === "shrug") {
        if (!o.pcarryR) ar = mixPt(ar, { x: 112, y: -150 }, e);
        if (!o.pcarryL) al = mixPt(al, { x: -112, y: -150 }, e);
        st.brow = 1.1 * e; st.head = (st.head || 0) + 10 * e;
      }
    });
    st.armL = al; st.armR = ar;
    return st;
  }

  /* screen position of a hand tip (same maths as K.hamster / K.bee), for carried items */
  function ang(st) { return ((st.lean || 0) * Math.PI) / 180; }
  function tipNibbs(x, y, s, st, k) {
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk, hop = st.hop || 0, sd = k === "L" ? -1 : 1;
    const pw = st["paw" + k] || { x: sd * 70, y: -40 }, bodyY = -100 * syk - hop;
    const r = K.ik2([sd * 60 * sxk, bodyY + 34 * syk], [pw.x, pw.y - hop], 36, 32, sd > 0 ? -1 : 1);
    const a = ang(st), ex = r.end[0], ey = r.end[1];
    return [x + s * (ex * Math.cos(a) - ey * Math.sin(a)), y + s * (ex * Math.sin(a) + ey * Math.cos(a))];
  }
  function tipBizzy(x, y, s, st, k) {
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk, hop = st.hop || 0, sd = k === "L" ? -1 : 1;
    const tg = st["arm" + k] || { x: sd * 64, y: -120 }, bodyY = -160 * syk - hop;
    const r = K.ik2([sd * 50 * sxk, bodyY - 26 * syk], [tg.x, tg.y - hop], 34, 32, sd > 0 ? -1 : 1);
    const a = ang(st), ex = r.end[0], ey = r.end[1];
    return [x + s * (ex * Math.cos(a) - ey * Math.sin(a)), y + s * (ex * Math.sin(a) + ey * Math.cos(a))];
  }

  function duo(ctx, g, o) {
    o = o || {};
    const s = o.s || 0.9, side = o.side || 1, solo = o.bizzy === false;
    const a = clamp(o.a == null ? 1 : o.a, 0, 1); if (a <= 0) return null;
    const drop = (1 - K.E.out3(a)) * 520, y = (o.y == null ? 1040 : o.y) + drop;
    const x = o.x == null ? 300 : o.x, gap = o.gap || 430 * s, sA = 1.45 * s, sB = 1.12 * s, bx = x + side * gap;
    K.screen(ctx);
    if (o.stage !== "none") {
      [[x, 150 * sA, 1], [bx, 70 * sB, solo ? 0 : 1]].forEach((q) => {
        if (!q[2]) return;
        ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = K.P.ink; ctx.beginPath(); ctx.ellipse(q[0], y + 4, q[1], 16 * s, 0, 0, K.TAU); ctx.fill(); ctx.restore();
      });
    }
    const loc = (p, x0, sc) => (p ? [(p[0] - x0) / sc, (p[1] - y) / sc] : null);
    const oo = Object.assign({}, o, { side, localPoint: loc(o.point, x, sA), localPPoint: loc(o.ppoint, bx, sB) });
    const pn = nibbsPose(g, oo), pb = solo ? null : bizzyPose(g, oo);
    K.hamster(ctx, x, y, sA, pn);
    if (!solo) K.bee(ctx, bx, y, sB, pb);
    const clawR = tipNibbs(x, y, sA, pn, "R"), clawL = tipNibbs(x, y, sA, pn, "L");
    const handR = solo ? null : tipBizzy(bx, y, sB, pb, "R"), handL = solo ? null : tipBizzy(bx, y, sB, pb, "L");
    if (o.carryR) o.carryR(ctx, clawR[0], clawR[1], g);
    if (o.carryL) o.carryL(ctx, clawL[0], clawL[1], g);
    if (!solo && o.pcarryR) o.pcarryR(ctx, handR[0], handR[1], g);
    if (!solo && o.pcarryL) o.pcarryL(ctx, handL[0], handL[1], g);
    const head = [x, y - 150 * sA], bhead = [bx, y - 262 * sB];
    return {
      mascot: [x, y], sidekick: [bx, y], clawR, clawL, handR, handL, head, bhead,
      A: { x, y, s: sA, head }, B: { x: bx, y, s: sB, head: bhead },
    };
  }

  return { duo, nibbsPose, bizzyPose, mascotPose: nibbsPose, sidekickPose: bizzyPose, GA, GB };
})();
