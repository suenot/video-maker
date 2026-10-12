/* ============================================================
   VAUDEVILLE KIT 47 HOSTS: the two storytellers of an episode.
     Host A = Dapper Dan, the cat (the explainer, the lower voice)
     Host B = Skip, the boater penguin (the curious co-host, the higher voice)
   Episodes re-animate a two-voice conversation, so both hosts:
     - talk:   mouth / beak opening from a 0..1 loudness value per frame,
               with viseme-ish shapes (K.talkMouth) that change at 8 Hz;
     - listen: look at the speaker and nod while the partner talks;
     - act:    timed gestures {at, kind, dur, target} on top (K.gesture);
     - idle:   breathe, blink, sway (never a frozen puppet).
   K.hostPose(who, t, opt) builds a pose; K.duo(ctx, t, opt) places both
   hosts LARGE in screen space (cat >= 330 px, penguin >= 320 px tall) on a
   spot pool, beside the explainer props, and returns hand / head points so
   a scene can point at things or hang a prop on a flipper.
   All pure functions of t (no state between frames).
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash } = K;

  /* ---------- talking mouth (cat): opening = talk, shape = viseme ---------- */
  const VIS = ["a", "e", "o", "a", "m", "e", "a", "o"];
  K.visemeAt = function (t, seed, talk) {
    if (talk < 0.12) return "m";
    return VIS[Math.floor(hash(Math.floor(t * 8), seed || 1) * VIS.length)];
  };
  K.talkMouth = function (ctx, x, y, talk, vis, seed, sc) {
    const v = vis || K.visemeAt(K.now, seed, talk), t = clamp(talk, 0, 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(sc || 1, sc || 1);
    if (v === "m") { K.line(ctx, [[-20, 2], [-6, 6], [6, 6], [20, 2]], { stroke: P.ink, w: 5, boil: 0.4, seed }); ctx.restore(); return; }
    const w = v === "e" ? 28 + 4 * t : v === "o" ? 11 + 6 * t : 22 + 6 * t;
    const h = v === "e" ? 3 + 10 * t : v === "o" ? 7 + 16 * t : 4 + 20 * t;
    const pts = K.ellipsePts(0, h * 0.6, w, h, 14);
    K.shape(ctx, pts, { fill: P.g1, w: 4, boil: 0.4, seed });
    ctx.save(); K.pathOf(ctx, pts, true); ctx.clip();
    if (v !== "o" && t > 0.3) { ctx.fillStyle = P.paper; ctx.fillRect(-w, -h * 0.5, w * 2, h * 0.45 + 2); } /* upper teeth */
    ctx.fillStyle = P.g3; ctx.beginPath(); ctx.ellipse(0, h * 1.5, w * 0.6, h * 0.55, 0, 0, K.TAU); ctx.fill(); /* tongue */
    ctx.restore(); ctx.restore();
  };

  /* ---------- thought bubble with a glyph ("?" for thinking) ---------- */
  K.thought = function (ctx, x, y, s, a, glyph, seed) {
    if (a <= 0) return;
    const k = K.E.back(clamp(a, 0, 1), 2.2);
    ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
    K.dot(ctx, -40, 58, 7, P.paper, P.ink, 3.5, seed + 1);
    K.dot(ctx, -24, 36, 11, P.paper, P.ink, 3.5, seed + 2);
    const cloud = []; for (let i = 0; i < 16; i++) { const an = (i / 16) * K.TAU, r = 40 + (i % 2 ? 6 : -2); cloud.push([Math.cos(an) * r * 1.15, -10 + Math.sin(an) * r * 0.9]); }
    K.shape(ctx, cloud, { fill: P.paper, w: 4.5, boil: 0.7, seed, shade: { color: P.g5, dx: -6, dy: -6 } });
    K.text(ctx, glyph || "?", 0, -8, { size: 54, weight: 900, font: K.FONT.display, fill: P.ink });
    ctx.restore();
  };

  /* ---------- gestures: patch a pose with gesture `kind` at strength u (0..1) ----------
     cat kinds:     point, nod, surprise, think, shrug, grin, wave, present
     penguin kinds: point, nod, surprise, think, shrug, flap, grin
     opt.target = [x, y] in the rig's local px (for point / present) */
  K.gesture = function (who, kind, u, st, opt) {
    if (u <= 0) return st;
    const o = opt || {}, tg = o.target || (who === "cat" ? [190, -200] : [190, -170]), side = tg[0] < 0 ? "L" : "R";
    const ph = o.phase || 0; /* 0..1 inside the gesture, for nods and waves */
    if (who === "cat") {
      if (kind === "point" || kind === "present") {
        const g = { x: lerp(st["glove" + side] ? st["glove" + side].x : (side === "R" ? 74 : -74), tg[0], u), y: lerp(st["glove" + side] ? st["glove" + side].y : -150, tg[1], u), open: kind === "present" ? 1 : -1 };
        st["glove" + side] = g; st.look = [side === "R" ? 1 : -1, clamp((tg[1] + 200) / 200, -1, 1)]; st.turn = (side === "R" ? 0.5 : -0.5) * u;
        if (kind === "present") { st.mouth = "grin"; st.lean = (side === "R" ? 4 : -4) * u; }
      } else if (kind === "nod") st.nod = Math.max(st.nod || 0, u * 0.5 * (1 - Math.cos(ph * K.TAU * 2)));
      else if (kind === "surprise") { st.eyeUp = 10 * u; st.brow = 1.4 * u; st.blink = 0; if (!(st.talk > 0.06)) st.mouth = "o"; st.exclaim = u; st.squash = (st.squash || 0) - 0.15 * u; st.gloveL = { x: -110, y: -230 * u - 120 * (1 - u), open: 1 }; st.gloveR = { x: 110, y: -230 * u - 120 * (1 - u), open: 1 }; }
      else if (kind === "think") { st.gloveR = { x: lerp(74, 44, u), y: lerp(-150, -222, u), open: 0.2, rot: -110 }; st.look = [0.6, -1]; st.think = u; st.brow = 0.6 * u; st.tilt = 8 * u; if (!(st.talk > 0.06)) st.mouth = "sly"; }
      else if (kind === "shrug") { st.gloveL = { x: -130, y: -170, open: 1, rot: 200 }; st.gloveR = { x: 130, y: -170, open: 1, rot: -20 }; st.brow = 1.1 * u; st.tilt = -8 * u; st.squash = (st.squash || 0) + 0.08 * u; if (!(st.talk > 0.06)) st.mouth = "sly"; }
      else if (kind === "grin") { st.mouth = "grin"; st.wink = u; st.hatTip = -14 * u; st.hatLift = 20 * u; }
      else if (kind === "wave") st.gloveR = { x: 120 + 18 * Math.sin(ph * K.TAU * 3), y: -250, open: 1, rot: -70 + 25 * Math.sin(ph * K.TAU * 3) };
    } else {
      if (kind === "point") { st["aim" + side] = [lerp(side === "R" ? 90 : -90, tg[0], u), lerp(-60, tg[1], u)]; st.look = [side === "R" ? 1 : -1, clamp((tg[1] + 190) / 200, -1, 1)]; }
      else if (kind === "nod") st.nod = Math.max(st.nod || 0, u * 0.5 * (1 - Math.cos(ph * K.TAU * 2)));
      else if (kind === "surprise") { st.flipL = st.flipR = 140 * u; st.exclaim = u; st.brow = 1.4 * u; st.blink = 0; if (!(st.talk > 0.06)) st.beak = "open"; st.hop = (st.hop || 0) + 22 * Math.sin(Math.min(1, ph * 3) * Math.PI); }
      else if (kind === "think") { st.aimR = [12, -150]; st.look = [0.5, -1]; st.think = u; st.tilt = 10 * u; st.brow = 0.5 * u; }
      else if (kind === "shrug") { st.flipL = st.flipR = 70 * u; st.brow = 1 * u; st.tilt = -8 * u; }
      else if (kind === "flap") { const f = 60 + 50 * Math.sin(ph * K.TAU * 4); st.flipL = st.flipR = f * u; st.hop = (st.hop || 0) + 10 * Math.abs(Math.sin(ph * K.TAU * 2)); }
      else if (kind === "grin") { st.hatTip = -20 * u; st.blink = 0; st.squash = (st.squash || 0) + 0.06 * u; }
    }
    return st;
  };

  /* ---------- a host's pose at time t ----------
     who "cat" | "penguin". opt:
       talk         0..1 (own loudness this frame), partnerTalk 0..1
       partnerDir   -1 | 1 (where the partner stands: look there while listening)
       acts         [{ at, kind, dur, target }]  timed gestures (dur default 1.2 s)
       point        [x, y] local target + pointAmt 0..1 (continuous pointing)
       base         pose fields to start from (hat, seed, ...) */
  K.hostPose = function (who, t, opt) {
    const o = Object.assign({ talk: 0, partnerTalk: 0, partnerDir: who === "cat" ? 1 : -1, acts: [], seed: who === "cat" ? 800 : 950 }, opt || {});
    const talk = clamp(o.talk, 0, 1), listen = clamp(o.partnerTalk, 0, 1) * (talk < 0.1 ? 1 : 0);
    const breathe = Math.sin(t * 2.4 + (who === "cat" ? 0 : 1.7));
    const st = Object.assign({ seed: o.seed, blink: K.blinkAt(t, o.seed % 97 + 3) }, o.base || {});
    st.squash = (st.squash || 0) + 0.035 * breathe + 0.06 * talk * Math.sin(t * 11);
    st.talk = talk;
    if (who === "cat") {
      st.turn = 0.3 * o.partnerDir; st.look = [0.5 * o.partnerDir, 0.1];
      /* talking hands: the right glove beats with the loudness, the left rests */
      const beat = Math.sin(t * 5.2) * 0.5 + 0.5;
      st.gloveR = st.gloveR || { x: 96 + 12 * talk, y: -150 - 60 * talk * beat, open: 0.3 + 0.6 * talk, rot: -30 - 30 * talk };
      st.gloveL = st.gloveL || { x: -80, y: -120 - 6 * breathe, open: 0.4 };
      if (talk > 0.06) { st.turn = 0.15 * o.partnerDir; st.look = [0.2 * o.partnerDir, 0]; }
      st.lean = (st.lean || 0) + 2 * Math.sin(t * 1.3);
    } else {
      st.hat = st.hat === undefined ? "boater" : st.hat;
      st.look = [0.6 * o.partnerDir, 0];
      st.flipL = st.flipL == null ? 12 + 6 * breathe : st.flipL; st.flipR = st.flipR == null ? 12 + 6 * breathe : st.flipR;
      if (talk > 0.06) { st.flipL = 20 + 50 * talk * (0.5 + 0.5 * Math.sin(t * 6)); st.look = [0.2 * o.partnerDir, -0.1]; st.hop = 4 * talk * Math.abs(Math.sin(t * 6)); }
      st.tapL = 0.25 * Math.max(0, Math.sin(t * 3.1)); st.tapR = 0.25 * Math.max(0, Math.sin(t * 3.1 + Math.PI));
    }
    /* listening: look at the speaker and nod slowly */
    if (listen > 0.15) { st.nod = 0.45 * listen * (0.5 - 0.5 * Math.cos(t * K.TAU * 0.9)); st.look = [o.partnerDir, 0]; if (who === "cat") st.turn = 0.45 * o.partnerDir; }
    if (o.point && (o.pointAmt == null || o.pointAmt > 0)) K.gesture(who, "point", o.pointAmt == null ? 1 : o.pointAmt, st, { target: o.point });
    o.acts.forEach((a) => {
      const d = a.dur || 1.2, u = K.ss(a.at, a.at + 0.25, t) * (1 - K.ss(a.at + d - 0.25, a.at + d, t));
      if (u > 0) K.gesture(who, a.kind, u, st, { target: a.target, phase: K.inv(a.at, a.at + d, t) });
    });
    return st;
  };

  /* ---------- the duo: both hosts large, in screen space ----------
     opt: side "left" (default) | "right", x, y (cat feet), gap (cat -> penguin),
          cs / ps (scales), a (0..1 appear: they slide in from the wing),
          cat / pen: hostPose() options, point targets in SCREEN px
          (pointCat / pointPen), spot (pool of light under them), floor (stage lip),
          carry { who: "pen" | "cat", hand: "R" | "L", draw(ctx, x, y) } a prop held out */
  K.duo = function (ctx, t, opt) {
    const o = Object.assign({ side: "left", y: 1045, cs: 1.05, ps: 1.2, gap: 300, a: 1, spot: true, floor: false }, opt || {});
    const right = o.side === "right";
    const cx = o.x != null ? o.x : right ? 1590 : 330;
    const px = cx + (right ? -o.gap : o.gap);
    const slide = (1 - K.E.out3(clamp(o.a, 0, 1))) * (right ? 700 : -700);
    K.screen(ctx);
    if (o.a <= 0) return null;
    ctx.save(); ctx.translate(slide, 0);
    if (o.floor) K.shape(ctx, K.rectPts(Math.min(cx, px) - 260, o.y - 6, Math.abs(px - cx) + 520, 60, 4), { fill: P.g2, w: 5, boil: 0.6, seed: 1900 });
    if (o.spot) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.translate((cx + px) / 2, o.y - 4); ctx.scale(1, 0.2); K.glow(ctx, 0, 0, Math.abs(px - cx) / 2 + 300, "rgba(255,250,236,0.55)", 1); ctx.restore(); }
    const toLocal = (p, x, s) => (p ? [(p[0] - x) / s, (p[1] - o.y) / s] : null);
    const copt = Object.assign({ partnerDir: right ? -1 : 1 }, o.cat || {});
    const popt = Object.assign({ partnerDir: right ? 1 : -1 }, o.pen || {});
    if (o.pointCat) copt.point = toLocal(o.pointCat, cx, o.cs);
    if (o.pointPen) popt.point = toLocal(o.pointPen, px, o.ps);
    if (o.carry && o.carry.who === "pen") { popt.base = Object.assign({}, popt.base); popt.base["aim" + (o.carry.hand || "R")] = o.carry.aim || [(o.carry.hand === "L" ? -1 : 1) * 120, -150]; }
    const cp = K.hostPose("cat", t, copt), pp = K.hostPose("penguin", t, popt);
    const rp = K.penguin(ctx, px, o.y, o.ps, pp);
    const rc = K.cat(ctx, cx, o.y, o.cs, cp);
    if (o.carry) {
      const pt = o.carry.who === "pen" ? rp["tip" + (o.carry.hand || "R")] : rc["glove" + (o.carry.hand || "R")];
      if (pt) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); o.carry.draw(ctx, pt[0], pt[1]); ctx.restore(); }
    }
    ctx.restore();
    return { cat: rc, pen: rp, catX: cx + slide, penX: px + slide };
  };
})(VK);
