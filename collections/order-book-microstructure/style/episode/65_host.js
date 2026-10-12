/* ============================================================
   EPISODE 65 HOSTS: Tikki the raccoon (host A, the explainer, lower voice) and
   Gekko the gecko (host B, the curious apprentice, higher voice), driven by the
   narration sync data (collections/_episode/lib/60_narration.js). Same API as
   the crab layer. Drawing and base acting live in the kit (style/kit/45_hosts.js:
   K.duo / K.hostPose / K.GESTURE); this file feeds it loudness, who talks, the
   stressed-word gestures, timed reactions, pointing and carried props.

   HOST.duo(ctx, g, o)    both hosts in SCREEN space (call after K.screen(ctx)).
   HOST.tikkiPose(g, o) / HOST.gekkoPose(g, o)   poses for a solo K.raccoon / K.gecko
                          (aliases: mascotPose, sidekickPose)
   o (all optional):
     x, y, s        Tikki's feet (screen px) and scale. Default 300, 1010, 1.0: Tikki is
                    about 330 px (30 % of the frame) and Gekko about 285 px. NOTE the kit's
                    scale differs from the crab's (1.55 there): do not copy s from crab scenes
     side           +1 Gekko to the right of Tikki, -1 to the left (default +1). Bottom-right
                    corner: side -1 with x about 1590
     gap, gs        spacing (x 340 * s) and Gekko's scale factor (1.2) from K.duo
     point, pointAmt    [sx, sy] screen point Tikki points at, and the 0..1 blend (hold(...))
     ppoint, ppointAmt  the same for Gekko
     reacts         [{ at, kind, dur }] Tikki reactions (global seconds):
                    surprise | grin | worry | shrug | thumbs | cheer | jump | nod | think | explain
     preacts        the same for Gekko: surprise | flap | grin | worry | shrug | cheer | nod | think
     carryR/carryL  fn(ctx, x, y, g, s): draw a prop (s = the host's scale: multiply the prop by s) in Tikki's right / left paw. (x, y) is the paw:
                    draw the prop with its bottom centre there (scale it with s). Carrying the left paw replaces the
                    abacus. carryPoseR/L { x, y, pose } moves the paw (local px)
     carryBR/carryBL  the same for Gekko's paws
     carryB         Gekko hugs a prop at the belly: "crate" | "ledger" | fn(ctx, hx, hy) (kit)
     hold           Tikki's left-paw prop: "abacus" (default) | null
     sidekick:false (alias parrot:false)   Tikki alone (his floor kilim stays)
     rug:false (alias stage:"none")        no floor kilim
     a              appear 0..1 (pops the duo in, e.g. after a transition)
     A, B           raw pose overrides for K.raccoon / K.gecko (any field), applied last
   returns { A, B, clawR, clawL, bR, bL }: A / B = K.duo's { x, y, s, head } (head is a screen
   point for tags and speech bursts); clawR/clawL = Tikki's paw points, bR/bL = Gekko's (screen px)
   ============================================================ */
const HOST = (function () {
  const { clamp, lerp, ss } = K;
  const ACC = { a: NR.accents("a"), b: NR.accents("b") };
  /* index of the last accent at or before g: picks a different gesture per stressed word */
  function lastAccent(g, who) {
    const L = ACC[who]; let k = -1;
    for (let i = 0; i < L.length; i++) if (L[i] <= g + 0.1) k = i; else break;
    return k;
  }
  /* envelope of a reaction: rises 0.18 s, holds, falls 0.3 s */
  const env = (g, r) => { const d = r.dur || 1.6; return ss(r.at - 0.18, r.at, g) * (1 - ss(r.at + d - 0.3, r.at + d, g)); };
  const mixH = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), pose: u > 0.5 ? b.pose : a.pose, rot: u > 0.5 ? b.rot : a.rot });

  /* talking gestures per stressed word: rest-relative paw targets (local space) */
  const REST = { a: { L: { x: -74, y: -70, pose: "open" }, R: { x: 74, y: -70, pose: "open" } }, b: { L: { x: -46, y: -80, pose: "open" }, R: { x: 46, y: -80, pose: "open" } } };
  const TALK = {
    a: [{ R: { x: 104, y: -178, pose: "open" } }, { L: { x: -104, y: -178, pose: "open" }, R: { x: 112, y: -120, pose: "open" } },
      { L: { x: -112, y: -120, pose: "open" }, R: { x: 112, y: -120, pose: "open" } }, { R: { x: 96, y: -150, pose: "fist" } }],
    b: [{ R: { x: 58, y: -170, pose: "open" } }, { L: { x: -58, y: -170, pose: "open" }, R: { x: 66, y: -130, pose: "open" } },
      { L: { x: -70, y: -130, pose: "open" }, R: { x: 70, y: -130, pose: "open" } }, { R: { x: 52, y: -160, pose: "fist" } }],
  };
  const CARRY = { a: { x: 104, y: -150, pose: "fist" }, b: { x: 70, y: -112, pose: "fist" } };

  /* one host's acting for time g: { base, acts } for K.hostPose */
  function acting(g, o, who) {
    const side = o.side || 1, mine = who === "a" ? "A" : "B", other = who === "a" ? "b" : "a";
    const reacts = (who === "a" ? o.reacts : o.preacts) || [];
    const seed = who === "a" ? 11 : 23, base = {}, acts = [];
    const carryL = who === "a" ? o.carryL : o.carryBL, carryR = who === "a" ? o.carryR : o.carryBR;
    const holdsAbacus = who === "a" && !carryL && o.hold !== null;
    base.squash = 0.035 * Math.sin(g * 2.3 + seed) + 0.07 * NR.accent(g, who);
    /* stressed words: a different paw gesture per accent */
    const k = lastAccent(g, who);
    if (k >= 0) {
      const ta = ACC[who][k], w = ss(ta - 0.1, ta + 0.14, g) * (1 - ss(ta + 0.75, ta + 1.25, g));
      const G = TALK[who][Math.floor(K.hash(k, 77 + seed) * TALK[who].length)];
      if (G.R && !carryR) base.handR = mixH(REST[who].R, G.R, w);
      if (G.L && !carryL && !holdsAbacus) base.handL = mixH(REST[who].L, G.L, w);
      if (G.L && holdsAbacus && !G.R) base.handR = mixH(REST[who].R, { x: 104, y: -178, pose: "open" }, w);
      if (K.hash(k, 78 + seed) > 0.5) base.brow = 0.6 * w;
      if (who === "b" && K.hash(k, 79) > 0.6) base.tailUp = 0.5 * w;
      if (who === "a" && holdsAbacus) {
        /* the abacus beads flick to new values on every accent of Tikki */
        const tk = ACC.a[k], u = ss(tk, tk + 0.25, g);
        base.beads = [0, 1, 2, 3].map((r) => lerp(K.hash(k - 1, r + 5), K.hash(k, r + 5), u));
      }
    }
    if (who === "a" && holdsAbacus && !base.beads) base.beads = [0.4, 0.6, 0.2, 0.8];
    /* carried props: the paw goes to a hold pose */
    if (carryR) base.handR = Object.assign({}, CARRY[who], o["carryPose" + (who === "a" ? "R" : "BR")] || {});
    if (carryL) base.handL = Object.assign({}, CARRY[who], { x: -CARRY[who].x }, o["carryPose" + (who === "a" ? "L" : "BL")] || {});
    if (who === "a") base.hold = carryL || o.hold === null ? "none" : o.hold || "abacus";
    /* listening: nod on the talker's stressed words */
    if (NR.who(g) === other && (who === "a" ? o.sidekick !== false && o.parrot !== false : true)) {
      const na = NR.accent(g, other); if (na > 0.05) acts.push({ kind: "nod", a: 0.9 * na });
    }
    /* timed reactions (crab-compatible names) */
    reacts.forEach((r) => {
      const e = env(g, r); if (e <= 0) return;
      const kd = r.kind;
      if (kd === "surprise") acts.push({ kind: "surprise", a: e });
      else if (kd === "shrug") acts.push({ kind: "shrug", a: e });
      else if (kd === "thumbs" || kd === "cheer" || kd === "flap") acts.push({ kind: "cheer", a: e });
      else if (kd === "nod") acts.push({ kind: "nod", a: e });
      else if (kd === "think") acts.push({ kind: "think", a: e });
      else if (kd === "explain" || kd === "spyglass" || kd === "wave") acts.push({ kind: "explain", a: e });
      else if (kd === "grin") { base.mouth = "grin"; base.brow = Math.max(base.brow || 0, 0.8 * e); }
      else if (kd === "worry") { base.mouth = "o"; base.brow = -0.9 * e; base.lean = (base.lean || 0) - 4 * side * e; }
      else if (kd === "jump") {
        const j1 = r.at + 0.55, air = K.inv(r.at, j1, g), h = Math.sin(air * Math.PI) * (air < 1 ? 1 : 0);
        base.hop = (base.hop || 0) + 60 * h; base.squash += 0.25 * ss(r.at - 0.3, r.at, g) * (1 - ss(r.at, r.at + 0.05, g)) - 0.2 * h;
        acts.push({ kind: "cheer", a: h });
      }
    });
    return { base, acts, mine };
  }

  /* Gekko's size relative to Tikki and the kit's duo geometry (for aiming points) */
  function geometry(o) {
    const s = o.s || 1.0, side = o.side || 1, gs = o.gs || 1.2, gap = o.gap || 340;
    const x = o.x == null ? 300 : o.x, y = o.y == null ? 1010 : o.y;
    return { s, side, gs, gap, x, y, xA: x, xB: x + side * gap * s, sA: s, sB: s * gs };
  }

  function duo(ctx, g, o) {
    o = o || {};
    const pa = o.a == null ? 1 : clamp(o.a, 0, 1);
    if (pa <= 0) return null;
    const G = geometry(o), hasB = o.sidekick !== false && o.parrot !== false;
    const useRug = o.rug !== false && o.stage !== "none";
    const A = acting(g, o, "a"), B = acting(g, o, "b");
    const actsA = A.acts.concat(o.actsA || []), actsB = B.acts.concat(o.actsB || []);
    const talkA = NR.talk(g, "a"), talkB = hasB ? NR.talk(g, "b") : 0;
    const toA = (p) => [(p[0] - G.xA) / G.sA, (p[1] - G.y) / G.sA], toB = (p) => [(p[0] - G.xB) / G.sB, (p[1] - G.y) / G.sB];
    if (o.point && (o.pointAmt == null || o.pointAmt > 0)) actsA.push({ kind: "point", a: o.pointAmt == null ? 1 : o.pointAmt, target: toA(o.point), hold: A.base.hold === "abacus" ? "abacus" : null });
    if (hasB && o.ppoint && (o.ppointAmt == null || o.ppointAmt > 0)) actsB.push({ kind: "point", a: o.ppointAmt == null ? 1 : o.ppointAmt, target: toB(o.ppoint) });
    /* a pop-in scales the whole group around Tikki's feet */
    const sc = pa < 1 ? Math.max(0.001, K.E.back(pa, 1.8)) : 1;
    ctx.save();
    if (pa < 1) { ctx.translate(G.xA, G.y); ctx.scale(sc, sc); ctx.translate(-G.xA, -G.y); ctx.globalAlpha *= clamp(pa * 3, 0, 1); }
    if (!hasB && useRug) K.floorRug(ctx, G.xA - 170 * G.s, G.xA + 190 * G.s, G.y + 6, { h: 40 * G.s });
    const r = K.duo(ctx, g, {
      x: G.x, y: G.y, s: G.s, side: G.side, gap: hasB ? G.gap : 6000, gs: G.gs, a: 1, rug: useRug && hasB,
      talkA, talkB, actsA, actsB, hold: A.base.hold === "none" ? null : A.base.hold, carryB: o.carryB,
      A: Object.assign({}, A.base, o.A || {}), B: Object.assign({}, B.base, o.B || {}),
    });
    const tip = (who, k, xx, ss_) => { const h = (who === "a" ? A : B).base["hand" + k]; return h ? [xx + ss_ * h.x, G.y + ss_ * h.y] : null; };
    const out = { A: r.A, B: hasB ? r.B : null, clawR: tip("a", "R", G.xA, G.sA), clawL: tip("a", "L", G.xA, G.sA), bR: tip("b", "R", G.xB, G.sB), bL: tip("b", "L", G.xB, G.sB) };
    /* carried props sit on top, bottom centre in the paw */
    if (o.carryR && out.clawR) o.carryR(ctx, out.clawR[0], out.clawR[1], g, G.sA);
    if (o.carryL && out.clawL) o.carryL(ctx, out.clawL[0], out.clawL[1], g, G.sA);
    if (hasB && o.carryBR && out.bR) o.carryBR(ctx, out.bR[0], out.bR[1], g, G.sB);
    if (hasB && o.carryBL && out.bL) o.carryBL(ctx, out.bL[0], out.bL[1], g, G.sB);
    ctx.restore();
    return out;
  }

  function solo(g, o, who) {
    o = o || {};
    const a = who === "a", ac = acting(g, o, who), other = a ? "b" : "a", listen = NR.who(g) === other;
    const dir = o.toward != null ? o.toward : a ? 1 : -1;
    const acts = ac.acts.concat((a ? o.actsA : o.actsB) || []);
    const pt = a ? o.localPoint : o.localPoint, amt = o.localPointAmt;
    if (pt && (amt == null || amt > 0)) acts.push({ kind: "point", a: amt == null ? 1 : amt, target: pt, hold: ac.base.hold === "abacus" ? "abacus" : null });
    return K.hostPose(a ? "raccoon" : "gecko", g, {
      seed: a ? 11 : 23, talk: NR.talk(g, who), listenTo: listen ? [dir * 400, -200] : null, acts,
      base: Object.assign({ hold: ac.base.hold }, ac.base, a ? o.A : o.B),
    });
  }

  return { duo, tikkiPose: (g, o) => solo(g, o, "a"), gekkoPose: (g, o) => solo(g, o, "b"), mascotPose: (g, o) => solo(g, o, "a"), sidekickPose: (g, o) => solo(g, o, "b"), acting, geometry };
})();
