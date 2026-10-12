/* ============================================================
   EPISODE 65 HOSTS: Siggy the surf turtle (host A, the explainer, lower voice) and
   Gully the seagull lifeguard (host B, the curious co-host, higher voice). Their acting is
   driven by the narration sync data: mouths follow the loudness of their own voice, flippers
   and wings gesture on stressed words, the listener looks at the talker and nods on the
   talker's accents. Same API as the crab layer (complex-arbitrage-rust/style/episode).

   HOST.siggyPose(g, o)   -> pose object for K.turtle
   HOST.gullyPose(g, o)   -> pose object for K.gully
   HOST.duo(ctx, g, o)    draws the beach patch with both hosts, in SCREEN space (it calls K.screen).
                          Returns { A, B, flipR, flipL, ... } (see below).
   o (all optional):
     x, y, s        Siggy's feet position (screen px) and scale (default 330, 1030, 1.55: the hosts are
                    the storytellers, about 30 % of the frame height; Siggy is ~390 px tall)
     side           +1 Gully to the right of Siggy, -1 to the left (default +1). For the bottom-right
                    corner use side -1 with x about 1590.
     gap            px between the hosts at s 1.3 (default 330; scales with s)
     point          [sx, sy] screen point Siggy points at with the nearer flipper (K.toScreen(...) in world)
     pointAmt       0..1 blend of the point (use hold(g, a, b) over a cue)
     ppoint, ppointAmt  the same for Gully's wing
     reacts         [{ at, kind, dur }] Siggy reactions (global seconds, dur default 1.6):
                    surprise | grin | worry | shrug | thumbs | shaka | jump | cheer | think | nod | spyglass
     preacts        the same for Gully: surprise | flap | worry | grin | think | nod | whistle | binos
     stage          "beach" (default: sand patch + lifeguard stand) | "none" (draw your own ground; Gully
                    then stands on the ground at his feet) | "stand" (stand without sand)
     gully          false to hide Gully (Siggy alone)
     a              appear 0..1 (pops the duo in, e.g. after a transition)
     carryR/carryL  fn(ctx, x, y, g): draw an item held in that flipper (a tag, a board, a postcard, a
                    medal) at the flipper tip; carryPoseR/L {x, y} moves the flipper (default up and out)
   returns { A, B, flipR, flipL, ... } screen points: A = Siggy's head, B = Gully's head,
           feetA / feetB, flipR / flipL (flipper tips, e.g. to start a thrown item).
           Also the crab-layer names: crab (= feetA), parrot (= B), clawR, clawL.
   ============================================================ */
const HOST = (function () {
  const { clamp, lerp, ss } = K;
  const mixPt = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
  const ACC = { a: NR.accents("a"), b: NR.accents("b") };
  function lastAccent(g, who) {
    const L = ACC[who]; let k = -1;
    for (let i = 0; i < L.length; i++) if (L[i] <= g + 0.1) k = i; else break;
    return k;
  }
  /* weight of the accent gesture k: rises on the word, holds, relaxes */
  const accW = (g, who, k, rise, fall) => { const ta = ACC[who][k]; return ss(ta - 0.1, ta + 0.14, g) * (1 - ss(ta + rise, ta + fall, g)); };
  /* the latest reaction that is playing at g: { r, u } with u = 0..1 progress */
  function playing(acts, g) {
    let best = null;
    (acts || []).forEach((r) => {
      const u = (g - r.at) / (r.dur || 1.6);
      if (u > 0 && u < 1 && (!best || r.at >= best.r.at)) best = { r, u };
    });
    return best;
  }

  /* Siggy's accent gestures: rest-relative flipper tips (local px, shoulders at about (+-46, -138)) */
  const GEST_A = [
    { R: { x: 126, y: -200 } },                          /* right flipper up */
    { L: { x: -140, y: -118 }, R: { x: 140, y: -118 } }, /* both out, palms up */
    { L: { x: -126, y: -200 } },                         /* left flipper up */
    { R: { x: 64, y: -176 } },                           /* flipper to the chin */
    { R: { x: 150, y: -150 }, L: { x: -70, y: -70 } },   /* sweep out */
  ];
  const TURTLE_MAP = { grin: "thumbs", cheer: "shaka", spyglass: "think" };
  const GULL_MAP = { grin: "nod", thumbs: "nod", shaka: "flap", shrug: "think", spyglass: "binos", cheer: "flap", jump: "flap" };

  function siggyPose(g, o) {
    o = o || {};
    const side = o.side || 1, x = o.x == null ? 330 : o.x, y = o.y == null ? 1030 : o.y, s = o.s || 1.55;
    const talk = NR.talk(g, "a"), other = o.gully === false ? 0 : NR.talk(g, "b");
    const act = playing(o.reacts, g);
    const pAmt = o.point ? (o.pointAmt == null ? 1 : o.pointAmt) : 0;
    const face = pAmt > 0.05 ? Math.sign(o.point[0] - x) || side : side;
    let gest = null, jump = null;
    if (act) {
      const kind = TURTLE_MAP[act.r.kind] || act.r.kind;
      if (kind === "jump") jump = act; else gest = { kind, u: act.u };
    }
    const p = K.hostPose("A", g, { talk, other, face, gesture: gest, seed: 3 });
    /* accent gestures while talking (not over an explicit reaction or a point) */
    const k = lastAccent(g, "a");
    if (k >= 0 && !gest && !jump) {
      const w = accW(g, "a", k, 0.75, 1.25), G = GEST_A[Math.floor(K.hash(k, 77) * GEST_A.length)];
      if (G.L) p.flipL = mixPt(p.flipL, G.L, w);
      if (G.R) p.flipR = mixPt(p.flipR, G.R, w);
      p.squash += 0.12 * NR.accent(g, "a");
      if (K.hash(k, 78) > 0.6) p.brow = 0.6 * w;
    }
    if (talk < 0.1 && other > 0.1) p.squash += 0.07 * NR.accent(g, "b");
    if (jump) {
      const u = jump.u, h = Math.sin(clamp(u, 0, 1) * Math.PI), pre = ss(0, 0.12, u) * (1 - ss(0.12, 0.22, u));
      p.squash = (p.squash || 0) + 0.28 * pre - 0.22 * h; p.hop = 70 * h; p.mouth = "grin"; p.brow = 1 * h;
      p.flipL = { x: -120, y: -210 * h - 60 }; p.flipR = { x: 120, y: -210 * h - 60 };
    }
    if (pAmt > 0.001) {
      /* the nearer flipper reaches along the line shoulder -> target, fully stretched */
      const sd = face >= 0 ? 1 : -1, sh = [x + sd * 46 * s, y - 138 * s];
      const dx = o.point[0] - sh[0], dy = o.point[1] - sh[1], d = Math.hypot(dx, dy) || 1;
      const tip = { x: sd * 46 + (dx / d) * 76, y: -138 + (dy / d) * 76 }, key = sd > 0 ? "flipR" : "flipL";
      p[key] = mixPt(p[key], tip, pAmt);
      p.turn = lerp(p.turn || 0, sd * 0.8, pAmt);
      p.look = [lerp(p.look ? p.look[0] : 0, sd * 0.9, pAmt), lerp(p.look ? p.look[1] : 0, clamp(dy / 500, -1, 1), pAmt)];
    }
    return p;
  }

  function gullyPose(g, o) {
    o = o || {};
    const side = o.side || 1, talk = NR.talk(g, "b"), other = NR.talk(g, "a"), seatX = o._bx == null ? 0 : o._bx;
    const act = playing(o.preacts, g);
    const pAmt = o.ppoint ? (o.ppointAmt == null ? 1 : o.ppointAmt) : 0;
    const face = pAmt > 0.05 ? Math.sign(o.ppoint[0] - seatX) || -side : -side;
    let gest = null;
    if (act) gest = { kind: GULL_MAP[act.r.kind] || act.r.kind, u: act.u };
    else if (pAmt > 0.001 && o._local) gest = { kind: "point", u: 0.5 * pAmt, target: o._local };
    const p = K.hostPose("B", g, { talk, other, face, gesture: gest, seed: 7 });
    const k = lastAccent(g, "b");
    if (k >= 0 && !act && pAmt < 0.01) {
      const w = accW(g, "b", k, 0.5, 0.95), h = K.hash(k, 91);
      if (h < 0.4) p.wingL = mixPt(p.wingL, { x: -96, y: -110 }, w);
      else if (h < 0.8) p.wingR = mixPt(p.wingR, { x: 96, y: -110 }, w);
      else { p.wingL = mixPt(p.wingL, { x: -88, y: -96 }, 0.8 * w); p.wingR = mixPt(p.wingR, { x: 88, y: -96 }, 0.8 * w); }
      p.squash += 0.12 * NR.accent(g, "b");
      p.hop = (p.hop || 0) + 7 * NR.accent(g, "b") * (h > 0.75 ? 1 : 0);
    }
    if (talk < 0.1 && other > 0.1) p.squash += 0.06 * NR.accent(g, "a");
    return p;
  }

  /* screen position of a Siggy flipper tip (same math as K.turtle) and the direction it points */
  function flipTip(x, y, s, st, k) {
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk, hop = st.hop || 0, sd = k === "L" ? -1 : 1;
    const hipY = -64 * syk - hop, c = st["flip" + k] || { x: sd * 92, y: -70 };
    const S = [sd * 46 * sxk, hipY - 74 * syk], r = K.ik2(S, [c.x, c.y - hop], 40, 38, sd > 0 ? 1 : -1);
    const dx = r.end[0] - r.elbow[0], dy = r.end[1] - r.elbow[1], d = Math.hypot(dx, dy) || 1;
    const ex = r.end[0] + (dx / d) * 24, ey = r.end[1] + (dy / d) * 24; /* the paddle's middle */
    const a = ((st.lean || 0) * Math.PI) / 180;
    return [x + s * (ex * Math.cos(a) - ey * Math.sin(a)), y + s * (ex * Math.sin(a) + ey * Math.cos(a))];
  }

  function duo(ctx, g, o) {
    o = o || {};
    const s = o.s || 1.55, x = o.x == null ? 330 : o.x, y = o.y == null ? 1030 : o.y, side = o.side || 1;
    const a = o.a == null ? 1 : K.E.back(clamp(o.a, 0, 1), 1.8);
    if (a <= 0) return null;
    const stage = o.stage || "beach", k = s / 1.3, gap = (o.gap == null ? 330 : o.gap) * k;
    const bx = x + side * gap, gs = s * 0.92;
    K.screen(ctx);
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.translate(-x, -y);
    if (stage === "beach" && o.gully !== false) {
      K.shape(ctx, K.blobPts((x + bx) / 2, y + 18, Math.abs(bx - x) / 2 + 230 * k, 44, 16, 31, 0.12), { fill: K.P.sand, stroke: null, w: 0, boil: 0.8, seed: 960, dots: { color: K.P.sandDark, cell: 12, density: 0.32, alpha: 0.6 } });
    } else if (stage === "beach") {
      K.shape(ctx, K.blobPts(x, y + 18, 230 * k, 44, 16, 31, 0.12), { fill: K.P.sand, stroke: null, w: 0, boil: 0.8, seed: 960, dots: { color: K.P.sandDark, cell: 12, density: 0.32, alpha: 0.6 } });
    }
    let seat = [bx, y], B = null;
    if (o.gully !== false) {
      seat = stage === "none" ? [bx, y] : K.lifeguardStand(ctx, bx, y, 150 * k, 950);
      const local = o.ppoint ? [(o.ppoint[0] - seat[0]) / gs, (o.ppoint[1] - seat[1]) / gs] : null;
      K.gully(ctx, seat[0], seat[1], gs, gullyPose(g, Object.assign({}, o, { _bx: seat[0], _local: local })));
      B = [seat[0], seat[1] - 200 * gs];
    }
    const sp = siggyPose(g, Object.assign({}, o, { x, y, s }));
    /* carrying: the flipper goes to a "hold" pose and the item is drawn at its tip, on top */
    if (o.carryR) sp.flipR = Object.assign({ x: 112, y: -168 }, o.carryPoseR || {});
    if (o.carryL) sp.flipL = Object.assign({ x: -112, y: -168 }, o.carryPoseL || {});
    K.turtle(ctx, x, y, s, sp);
    const tR = flipTip(x, y, s, sp, "R"), tL = flipTip(x, y, s, sp, "L");
    if (o.carryR) o.carryR(ctx, tR[0], tR[1], g);
    if (o.carryL) o.carryL(ctx, tL[0], tL[1], g);
    ctx.restore();
    const A = [x, y - 250 * s];
    return { A, B, feetA: [x, y], feetB: seat, flipR: tR, flipL: tL, crab: [x, y], parrot: B, clawR: tR, clawL: tL };
  }

  return { duo, siggyPose, gullyPose, flipTip, GEST_A };
})();
