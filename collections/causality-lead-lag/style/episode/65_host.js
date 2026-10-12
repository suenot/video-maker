/* ============================================================
   EPISODE 65 HOSTS: Inspector Vulpes (fox, host A, the explainer, lower voice)
   and Sergeant Basset (hound, host B, the curious co-host, higher voice).
   Driven by the narration sync data (collections/_episode/lib/60_narration.js):
   mouths follow the loudness of their own voice, paws gesture on stressed
   words, the listener looks at the talker and nods on the talker's accents.
   All drawing and base acting lives in the kit (46_duo.js); this file feeds it
   the sync values and adds scene-level acting (reacts, carried props).

   HOST.foxPose(g, o)    -> pose for a solo K.fox   (the mascot)
   HOST.houndPose(g, o)  -> pose for a solo K.hound (the sidekick)
   HOST.duo(ctx, g, o)   draws both hosts in SCREEN space (call after K.screen(ctx)).
                         Returns { fox:[x,y], hound:[x,y], pawR, pawL, hpawR, hpawL } screen points
                         (pawR/pawL = the fox's paws, hpawR/hpawL = the hound's: start a thrown item there).
   o (all optional):
     x, y, s        fox feet (screen px) and scale (default 280, 1020, 0.95: fox ~360 px, hound
                    ~310 px, the pair about a third of the frame height)
     hs             hound scale (default s * 0.97)
     side           +1 hound to the right of the fox, -1 to the left (default +1)
     gap            feet distance (default 330 * s)
     point          [sx, sy] screen point the fox points at;  pointAmt 0..1 (hold(...))
     ppoint, ppointAmt   the same for the hound (he points with the pencil)
     reacts         [{ at, kind, dur }] fox acting (global seconds):
                    surprise | grin | worry | shrug | thumbs | jump | spyglass | nod | think | present | tip
     preacts        the same for the hound: surprise | flap | worry | grin | think | nod | shrug | tip |
                    write | jump | present
     carryR/carryL  fn(ctx, x, y, g): an item held in the fox's right / left paw (a tag, a plank,
                    a pin ...), drawn at the paw. carryPoseR/L {x, y, rot} moves the paw
     pcarryR/pcarryL   the same for the hound (his notebook / pencil are put away while carrying)
     holdA, holdB   kit props in the free paw: fox "magnifier" | "flashlight" | "pin" (right paw),
                    hound holdR "magnifier" | "flashlight" (holdBR), holdBL null = no notebook
     stage          "puddle" (default, one lamplight puddle under the hosts) | "none"
     sidekick       false = fox alone (also accepted: parrot:false, like the crab layer)
     a              appear 0..1 (pops the duo in, e.g. after a transition)
   ============================================================ */
const HOST = (function () {
  const P = K.P, { clamp, lerp, ss } = K;
  const ACC = { a: NR.accents("a"), b: NR.accents("b") };
  /* index of the last accent at or before g: a different beat gesture per stressed word */
  function lastAccent(g, who) {
    const L = ACC[who]; let k = -1;
    for (let i = 0; i < L.length; i++) if (L[i] <= g + 0.1) k = i; else break;
    return k;
  }
  /* envelope of a reaction: rises 0.18 s, holds, falls 0.3 s */
  const env = (g, r) => { const d = r.dur || 1.6; return ss(r.at - 0.18, r.at, g) * (1 - ss(r.at + d - 0.3, r.at + d, g)); };
  const toLocal = (pt, fx, fy, s) => [(pt[0] - fx) / s, (pt[1] - fy) / s];
  const mixPaw = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), rot: u > 0.5 && b.rot != null ? b.rot : a.rot });

  /* scene-level acting on top of the kit's talking / listening pose */
  function actFox(st, acts, g) {
    (acts || []).forEach((r) => {
      const e = env(g, r); if (e <= 0) return;
      const talking = st.talk > 0.06;
      if (r.kind === "surprise") K.gesturePose("fox", st, "surprise", e);
      else if (r.kind === "grin") { if (!talking) st.mouth = "grin"; st.brow = 0.8 * e; st.squash += 0.05 * e; }
      else if (r.kind === "worry") { st.brow = -1 * e; st.browTilt = 0.6 * e; if (!talking) st.mouth = "flat"; st.lean = (st.lean || 0) - 4 * e; }
      else if (r.kind === "shrug") K.gesturePose("fox", st, "shrug", e);
      else if (r.kind === "thumbs" || r.kind === "tip") { K.gesturePose("fox", st, "tip", e); if (!talking) st.mouth = "grin"; }
      else if (r.kind === "think") K.gesturePose("fox", st, "think", e);
      else if (r.kind === "present") K.gesturePose("fox", st, "present", e);
      else if (r.kind === "nod") st.nod = Math.max(st.nod || 0, e * Math.max(0, Math.sin((g - r.at) * 12)));
      else if (r.kind === "spyglass") {
        st.hold = "magnifier"; st.pawR = mixPaw(st.pawR, { x: 78, y: -300, rot: -28 }, e);
        st.look = [1, -0.6]; st.lean = (st.lean || 0) - 3 * e; st.lensEye = e > 0.7 ? 1 : 0;
      } else if (r.kind === "jump") {
        const j0 = r.at - 0.3, j1 = r.at + 0.55, air = K.inv(r.at, j1, g), h = Math.sin(air * Math.PI);
        st.squash += 0.3 * ss(j0, r.at, g) * (1 - ss(r.at, r.at + 0.05, g)) - 0.3 * h * (air < 1 ? 1 : 0);
        st.hop = (st.hop || 0) + 60 * h; if (!talking) st.mouth = "open";
        st.pawL = mixPaw(st.pawL, { x: -110, y: -280 }, h); st.pawR = mixPaw(st.pawR, { x: 110, y: -280 }, h);
      }
    });
  }
  function actHound(st, acts, g) {
    (acts || []).forEach((r) => {
      const e = env(g, r); if (e <= 0) return;
      const talking = st.talk > 0.06;
      if (r.kind === "surprise") K.gesturePose("hound", st, "surprise", e);
      else if (r.kind === "flap") { st.ears = (st.ears || 0) + e * (0.5 + 0.5 * Math.sin((g - r.at) * 22)); st.hop = (st.hop || 0) + 10 * e; st.eyeUp = e; }
      else if (r.kind === "worry") { st.brow = -1 * e; if (!talking) st.mouth = "frown"; st.head = (st.head || 0) - 8 * e; st.ears = (st.ears || 0) - 0.5 * e; }
      else if (r.kind === "grin") { if (!talking) st.mouth = "smile"; st.brow = 0.8 * e; st.tail = 1; }
      else if (r.kind === "think") K.gesturePose("hound", st, "think", e);
      else if (r.kind === "shrug") K.gesturePose("hound", st, "shrug", e);
      else if (r.kind === "tip") K.gesturePose("hound", st, "tip", e);
      else if (r.kind === "write") K.gesturePose("hound", st, "write", e);
      else if (r.kind === "present") K.gesturePose("hound", st, "present", e);
      else if (r.kind === "nod") st.nod = Math.max(st.nod || 0, e * Math.max(0, Math.sin((g - r.at) * 12)));
      else if (r.kind === "jump") {
        const air = K.inv(r.at, r.at + 0.5, g), h = Math.sin(air * Math.PI);
        st.hop = (st.hop || 0) + 44 * h; st.squash = (st.squash || 0) - 0.2 * h; if (!talking) st.mouth = "open";
      }
    });
  }

  /* shared option block for one host: loudness, accents, listening */
  function baseOpts(g, me, o) {
    const you = me === "a" ? "b" : "a", sd = o.side || 1;
    return {
      talk: NR.talk(g, me), listen: NR.talk(g, you),
      accent: NR.accent(g, me), accentIdx: lastAccent(g, me), otherAccent: NR.accent(g, you),
      toward: me === "a" ? sd : -sd,
    };
  }
  /* carried prop: put the paw on a hold target; the item is drawn there by duo() */
  function carry(st, kind, who, pose) {
    const hound = who === "hound", sd = kind === "R" ? 1 : -1;
    const p = Object.assign({ x: sd * (hound ? 80 : 112), y: hound ? -176 : -184, rot: hound ? -60 * sd : 0 }, pose || {});
    st["paw" + kind] = p;
    if (hound) st["hold" + kind] = null; else if (kind === "R") st.hold = null; else st.holdL = null;
  }

  function foxPose(g, o) {
    o = o || {};
    const s = o.s || 0.95, fx = o.x == null ? 280 : o.x, fy = o.y == null ? 1020 : o.y;
    const bo = baseOpts(g, "a", o);
    if (o.point) { bo.point = toLocal(o.point, fx, fy, s); bo.pointAmt = o.pointAmt; }
    const st = K.hostPose("fox", g, bo);
    if (o.holdA) st.hold = o.holdA;
    actFox(st, o.reacts, g);
    if (o.carryR) carry(st, "R", "fox", o.carryPoseR);
    if (o.carryL) carry(st, "L", "fox", o.carryPoseL);
    return st;
  }
  function houndPose(g, o) {
    o = o || {};
    const s = o.s || 0.95, hs = o.hs || s * 0.97, side = o.side || 1;
    const fx = o.x == null ? 280 : o.x, fy = o.y == null ? 1020 : o.y;
    const hx = fx + side * (o.gap || 330 * s), hy = fy + 6;
    const bo = baseOpts(g, "b", o);
    if (o.ppoint) { bo.point = toLocal(o.ppoint, hx, hy, hs); bo.pointAmt = o.ppointAmt; }
    const st = K.hostPose("hound", g, bo);
    if (o.holdBR) st.holdR = o.holdBR;
    if (o.holdBL !== undefined) st.holdL = o.holdBL;
    actHound(st, o.preacts, g);
    if (o.pcarryR) carry(st, "R", "hound", o.pcarryPoseR);
    if (o.pcarryL) carry(st, "L", "hound", o.pcarryPoseL);
    return st;
  }

  function duo(ctx, g, o) {
    o = o || {};
    const s = o.s || 0.95, hs = o.hs || s * 0.97, side = o.side || 1;
    const bob = 3 * Math.sin(g * 1.5), fx = o.x == null ? 280 : o.x, fy = (o.y == null ? 1020 : o.y) + bob;
    const alone = o.sidekick === false || o.parrot === false;
    const a = o.a == null ? 1 : clamp(o.a, 0, 1); if (a <= 0) return null;
    const oo = Object.assign({}, o, { s, hs, x: fx, y: fy });
    const fst = foxPose(g, oo), hst = houndPose(g, oo);
    const hx = fx + side * (o.gap || 330 * s), hy = fy + 6;
    const pa = a >= 1 ? 1 : K.E.back(a, 2);
    /* one lamplight puddle under both hosts */
    if (o.stage !== "none") {
      ctx.save(); ctx.globalAlpha *= 0.85 * a;
      const cx = alone ? fx : (fx + hx) / 2, rx = alone ? 200 * s : Math.abs(hx - fx) / 2 + 210 * s;
      K.shape(ctx, K.blobPts(cx, fy + 8, rx, 34 * s, 16, 31, 0.12), { fill: P.puddle, stroke: P.ink, w: 3, boil: 0.8, seed: 991, gap: 0.3, shade: { color: P.street, dx: 0, dy: 10 } });
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha *= Math.min(1, a * 2);
    const drawFox = () => K.fox(ctx, fx, fy, s * pa, fst), drawHound = () => { if (!alone) K.hound(ctx, hx, hy, hs * pa, hst); };
    /* the listener is drawn first, so the talker overlaps if they ever touch */
    if (NR.who(g) === "b") { drawFox(); drawHound(); } else { drawHound(); drawFox(); }
    ctx.restore();
    const at = (p, x, y, sc) => [x + p.x * sc, y + p.y * sc];
    const R = { fox: [fx, fy], hound: [hx, hy], pawR: at(fst.pawR, fx, fy, s), pawL: at(fst.pawL, fx, fy, s), hpawR: at(hst.pawR, hx, hy, hs), hpawL: at(hst.pawL, hx, hy, hs) };
    if (o.carryR) o.carryR(ctx, R.pawR[0], R.pawR[1], g);
    if (o.carryL) o.carryL(ctx, R.pawL[0], R.pawL[1], g);
    if (!alone && o.pcarryR) o.pcarryR(ctx, R.hpawR[0], R.hpawR[1], g);
    if (!alone && o.pcarryL) o.pcarryL(ctx, R.hpawL[0], R.hpawL[1], g);
    return R;
  }

  return { foxPose, houndPose, duo };
})();
