/* ============================================================
   EPISODE 65 HOSTS: Captain Ferrous (crab, host A, the narrator) and
   Pip the parrot (first mate, host B). Their acting is driven by the
   narration sync data: mouths follow the loudness of their own voice,
   claws / wings gesture on stressed words, the listener looks at the
   talker and nods on the talker's accents.

   HOST.crabPose(g, o)    -> pose object for K.crab
   HOST.parrotPose(g, o)  -> pose object for K.parrot
   HOST.duo(ctx, g, o)    draws the raft stage with both hosts, in SCREEN space
                          (call after K.screen(ctx)). Returns { crab:[x,y], parrot:[x,y] }.
   o (all optional):
     x, y, s        crab feet position (screen px) and scale (default 300, 1010, 1.15)
     side           +1 parrot to the right of the crab, -1 to the left (default +1)
     point          [sx, sy] screen point the crab points at with the nearer claw
     pointAmt       0..1 blend of the point (use K.ss over a cue to raise/lower)
     ppoint, ppointAmt  the same for the parrot's wing
     reacts         [{ at, kind, dur }] crab reactions (global seconds):
                    surprise | grin | worry | shrug | thumbs | jump | spyglass | nod | think
     preacts        the same for the parrot: surprise | flap | worry | grin | think
     stage          "raft" (default) | "none" (draw your own ground)
     parrot         false to hide the parrot (crab alone)
     a              appear 0..1 (pops the duo in, e.g. after a transition)
   ============================================================ */
const HOST = (function () {
  const P = K.P, { clamp, lerp, ss } = K;
  const mixPt = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), open: lerp(a.open, b.open, u), rot: b.rot != null && u > 0.5 ? b.rot : a.rot });
  /* envelope of a reaction: rises 0.18 s, holds, falls 0.3 s */
  const env = (g, r) => { const d = r.dur || 1.6; return ss(r.at - 0.18, r.at, g) * (1 - ss(r.at + d - 0.3, r.at + d, g)); };

  /* gesture library: rest-relative claw targets (local crab space), chosen per accent */
  const GEST = [
    { R: { x: 96, y: -128, open: 0.75 } },                                  /* right claw up, open */
    { L: { x: -112, y: -78, open: 0.6 }, R: { x: 112, y: -78, open: 0.6 } }, /* both out, palms up */
    { L: { x: -96, y: -128, open: 0.75 } },                                 /* left claw up */
    { R: { x: 40, y: -96, open: 0.15 } },                                   /* claw to the chin */
    { R: { x: 118, y: -96, open: 0.9 }, L: { x: -70, y: -20, open: 0.2 } }, /* sweep out */
  ];
  function lastAccent(g, who) {
    const L = ACC[who]; let k = -1;
    for (let i = 0; i < L.length; i++) if (L[i] <= g + 0.1) k = i; else break;
    return k;
  }
  const ACC = { c: NR.accents("c"), p: NR.accents("p") };

  function crabPose(g, o) {
    o = o || {};
    const side = o.side || 1, s = o.s || 1.15, x = o.x == null ? 300 : o.x, y = o.y == null ? 1010 : o.y;
    const talk = NR.talk(g, "c"), who = NR.who(g);
    const st = { seed: 500, blink: K.blinkAt(g, 3), mouth: "smile", look: [0.15 * Math.sin(g * 0.7), -0.1], talk };
    st.squash = 0.035 * Math.sin(g * 2.3);
    const restL = { x: -104 + 5 * Math.sin(g * 1.9), y: -40 + 6 * Math.sin(g * 2.6), open: 0.2 };
    const restR = { x: 104 + 5 * Math.sin(g * 2.1 + 1), y: -40 + 6 * Math.sin(g * 2.4 + 2), open: 0.2 + 0.1 * Math.sin(g * 3) };
    let cl = restL, cr = restR;
    /* talking gestures on accents */
    const k = lastAccent(g, "c");
    if (k >= 0) {
      const ta = ACC.c[k], w = ss(ta - 0.1, ta + 0.14, g) * (1 - ss(ta + 0.75, ta + 1.25, g));
      const G = GEST[Math.floor(K.hash(k, 77) * GEST.length)];
      if (G.L) cl = mixPt(cl, G.L, w);
      if (G.R) cr = mixPt(cr, G.R, w);
      st.squash += 0.12 * NR.accent(g, "c");
      st.brow = 0.6 * w * (K.hash(k, 78) > 0.5 ? 1 : 0);
    }
    if (who === "c") st.look = [0.25 * Math.sin(g * 0.9), -0.05];
    /* listening: look at the parrot, nod on its accents, small lean */
    if (who === "p" && o.parrot !== false) {
      st.look = [0.9 * side, -0.35]; st.lean = 2.5 * side;
      st.squash += 0.07 * NR.accent(g, "p");
      st.brow = 0.4;
    }
    /* pointing at content */
    if (o.point && (o.pointAmt == null || o.pointAmt > 0)) {
      const amt = o.pointAmt == null ? 1 : o.pointAmt;
      const dx = o.point[0] - x, sdk = dx >= 0 ? 1 : -1;
      const sh = [x + sdk * 58 * s, y - 62 * s], d = Math.hypot(o.point[0] - sh[0], o.point[1] - sh[1]) || 1;
      const tgt = { x: sdk * 58 + ((o.point[0] - sh[0]) / d) * 68, y: -62 + ((o.point[1] - sh[1]) / d) * 68, open: 0.08 };
      if (sdk > 0) cr = mixPt(cr, tgt, amt); else cl = mixPt(cl, tgt, amt);
      st.look = [lerp(st.look[0], sdk * 0.9, amt), lerp(st.look[1], clamp((o.point[1] - (y - 160 * s)) / 400, -1, 1), amt)];
    }
    /* reactions */
    (o.reacts || []).forEach((r) => {
      const e = env(g, r); if (e <= 0) return;
      if (r.kind === "surprise") {
        st.blink = 0; st.eyeUp = 20 * e; st.brow = 1.5 * e; st.exclaim = e;
        if (talk < 0.1) st.mouth = "open";
        st.hop = 16 * Math.max(0, Math.sin(K.inv(r.at, r.at + 0.35, g) * Math.PI)); st.squash -= 0.2 * e;
      } else if (r.kind === "grin") { st.mouth = "grin"; st.brow = 0.8 * e; st.squash += 0.05 * e; }
      else if (r.kind === "worry") { st.brow = -1 * e; if (talk < 0.1) st.mouth = "o"; st.lean = (st.lean || 0) - 5 * side * e; cl = mixPt(cl, { x: -50, y: -70, open: 0.1 }, e); }
      else if (r.kind === "shrug") { cl = mixPt(cl, { x: -118, y: -96, open: 0.7 }, e); cr = mixPt(cr, { x: 118, y: -96, open: 0.7 }, e); st.brow = 1.1 * e; st.squash += 0.08 * e; }
      else if (r.kind === "thumbs") { cr = mixPt(cr, { x: 92, y: -138, open: 0.0, rot: -90 }, e); st.mouth = "grin"; }
      else if (r.kind === "think") { cr = mixPt(cr, { x: 34, y: -92, open: 0.1 }, e); st.look = [0.6, -0.9]; st.brow = 0.9 * e; }
      else if (r.kind === "nod") { st.squash += 0.12 * Math.max(0, Math.sin((g - r.at) * 12)) * e; }
      else if (r.kind === "spyglass") {
        st.hold = "spyglass"; cr = mixPt(cr, { x: 38, y: -150, open: 0.05, rot: -14 }, e); st.look = [1, -0.6]; st.lean = (st.lean || 0) - 4 * e;
      } else if (r.kind === "jump") {
        const j0 = r.at - 0.3, j1 = r.at + 0.55, air = K.inv(r.at, j1, g), h = Math.sin(air * Math.PI);
        st.squash += 0.3 * ss(j0, r.at, g) * (1 - ss(r.at, r.at + 0.05, g)) - 0.3 * h * (air < 1 ? 1 : 0);
        st.hop = 70 * h; if (talk < 0.1) st.mouth = "open";
        const land = K.inv(j1, j1 + 0.35, g); if (land > 0 && land < 1) st.squash += 0.35 * Math.sin(land * Math.PI) * (1 - land);
        cl = mixPt(cl, { x: -100, y: -150, open: 0.8 }, h); cr = mixPt(cr, { x: 100, y: -150, open: 0.8 }, h);
      }
    });
    st.clawL = cl; st.clawR = cr;
    return st;
  }

  function parrotPose(g, o) {
    o = o || {};
    const side = o.side || 1, talk = NR.talk(g, "p"), who = NR.who(g);
    const st = { seed: 700, blink: K.blinkAt(g, 11), talk, look: [0, 0], head: 4 * Math.sin(g * 0.8) };
    st.squash = 0.04 * Math.sin(g * 2.9 + 1);
    const k = lastAccent(g, "p");
    let wl = 0.04 * Math.sin(g * 2), wr = 0.04 * Math.sin(g * 2 + 1);
    if (k >= 0) {
      const ta = ACC.p[k], w = ss(ta - 0.08, ta + 0.12, g) * (1 - ss(ta + 0.5, ta + 0.95, g));
      const h = K.hash(k, 91);
      if (h < 0.4) wl += 0.42 * w; else if (h < 0.8) wr += 0.42 * w; else { wl += 0.3 * w; wr += 0.3 * w; }
      st.squash += 0.12 * NR.accent(g, "p");
      st.hop = 7 * NR.accent(g, "p") * (h > 0.7 ? 1 : 0);
    }
    if (who === "p") st.look = [-0.4 * side, -0.1];
    if (who === "c" && o.crab !== false) { st.look = [-0.9 * side, -0.2]; st.head = -12 * side + 3 * Math.sin(g * 1.1); st.squash += 0.06 * NR.accent(g, "c"); }
    if (o.ppoint && (o.ppointAmt == null || o.ppointAmt > 0)) {
      const amt = o.ppointAmt == null ? 1 : o.ppointAmt, px = o._px || 0;
      if (o.ppoint[0] >= px) wr = lerp(wr, 0.62, amt); else wl = lerp(wl, 0.62, amt);
      st.look = [lerp(st.look[0], o.ppoint[0] >= px ? 0.9 : -0.9, amt), st.look[1]];
    }
    (o.preacts || []).forEach((r) => {
      const e = env(g, r); if (e <= 0) return;
      if (r.kind === "surprise") { st.blink = 0; st.exclaim = e; st.brow = 1.4 * e; st.hop = 12 * Math.max(0, Math.sin(K.inv(r.at, r.at + 0.3, g) * Math.PI)); wl += 0.5 * e; wr += 0.5 * e; }
      else if (r.kind === "flap") { const f = 0.5 + 0.5 * Math.sin((g - r.at) * 26); wl += 0.7 * f * e; wr += 0.7 * f * e; st.hop = 18 * e; }
      else if (r.kind === "worry") { st.brow = -1 * e; st.head = -16 * e; }
      else if (r.kind === "grin") { st.brow = 0.9 * e; st.head = 10 * e; }
      else if (r.kind === "think") { st.head = 18 * e; st.look = [0.5, -0.9]; }
    });
    st.wingL = clamp(wl, 0, 1); st.wingR = clamp(wr, 0, 1);
    return st;
  }

  /* a small wooden raft riding the waves: the hosts' stage in chart and explainer shots */
  function raft(ctx, x, y, s, g) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(0.012 * Math.sin(g * 1.3));
    for (let i = 0; i < 6; i++) {
      const px = -230 + i * 76;
      K.shape(ctx, K.rectPts(px, -8, 72, 30, 2), { fill: i % 2 ? P.wood : "#a86c3d", w: 4.5, boil: 1, seed: 810 + i, shade: { color: P.woodDark, dx: 0, dy: -9 } });
    }
    K.line(ctx, [[-226, 6], [222, 6]], { stroke: P.woodDark, w: 4, boil: 1, seed: 820, gap: 0.2 });
    ctx.restore();
    /* water lapping in front of the raft */
    const pts = [];
    for (let i = 0; i <= 14; i++) { const u = i / 14, xx = x + (u - 0.5) * 560 * s; pts.push([xx, y + 24 * s + 6 * s * Math.sin(u * 9 + g * 3)]); }
    const poly = pts.concat([[x + 300 * s, y + 70 * s], [x - 300 * s, y + 70 * s]]);
    ctx.save(); ctx.globalAlpha = 0.9; K.pathOf(ctx, K.boil(poly, 830, 1.2), true); ctx.fillStyle = P.seaMid; ctx.fill(); ctx.restore();
    K.line(ctx, pts, { stroke: P.foam, w: 4, boil: 1.2, seed: 831, gap: 0.15 });
  }

  function duo(ctx, g, o) {
    o = o || {};
    const s = o.s || 1.15, x = o.x == null ? 300 : o.x, side = o.side || 1;
    const bob = 5 * Math.sin(g * 1.5), y = (o.y == null ? 1010 : o.y) + bob;
    const a = o.a == null ? 1 : K.E.back(clamp(o.a, 0, 1), 1.8);
    if (a <= 0) return null;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.translate(-x, -y);
    const px = x + side * 205 * s, py = y - 8 * s;
    if (o.stage !== "none") raft(ctx, x + side * 90 * s, y + 6 * s, s, g);
    if (o.parrot !== false) {
      K.perch(ctx, px, py, 92 * s, 731);
      K.parrot(ctx, px, py - 92 * s, s * 0.95, parrotPose(g, Object.assign({}, o, { _px: px })));
    }
    K.crab(ctx, x, y, s, crabPose(g, Object.assign({}, o, { y })));
    ctx.restore();
    return { crab: [x, y], parrot: [px, py - 92 * s] };
  }

  return { crabPose, parrotPose, duo, raft, GEST };
})();
