/* ============================================================
   LAB KIT 46 DUO: both hosts on stage, driven by their voices.
   Professor Strix (owl, host A, the explainer) and Pico (hummingbird,
   host B, the curious co-host). Mouths follow each voice's loudness, the
   talker gestures on accents, the listener looks at the talker and nods.
   Draw in SCREEN space (call after K.screen(ctx)); the hosts are big:
   owl about 430 px tall at s 1, Pico about 290 px.

   K.duo(ctx, t, o) -> { owl:[x,y], bird:[x,y], owlHead:[x,y], birdHead:[x,y] }
   o (all optional):
     x, y, s          owl feet (screen px) and scale (default 380, 1000, 1)
     side             +1 Pico to the owl's right, -1 to the left (default +1)
     talkA, talkB     0..1 voice loudness of each host this frame
     visA, visB       viseme "a" | "o" | "e" | "m" (optional)
     who              "a" | "b" | null: who is talking (default: the louder one)
     accA, accB       0..1 accent envelope (stressed word); defaults to loudness peaks
     gestA, gestB     gesture index for the current accent (default: changes every 1.6 s)
     pointA, pointAmtA   [sx, sy] screen point the owl points at, 0..1 blend
     pointB, pointAmtB   the same for Pico's wing
     reactA           { kind: surprise|nod|think|grin|thumbs|shrug, amt 0..1 }
     reactB           { kind: surprise|nod|think|write|flip, amt 0..1 }
     holdA            fn(ctx) prop in the owl's left glove (e.g. a flask), drawn in the hand frame
     stage            "bench" (default) | "none"
     a                appear 0..1 (pops the duo in)
   ============================================================ */
var LK = window.LK || (window.LK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;
  const mix = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), hand: u > 0.5 ? b.hand : a.hand, hold: u > 0.5 ? b.hold : a.hold, mode: u > 0.5 ? b.mode : a.mode });
  /* owl talking gestures (owl-local glove targets) */
  const GEST_A = [
    { R: { x: 150, y: -340, hand: "open" } },                                          /* a hand up: "here's the thing" */
    { L: { x: -160, y: -250, hand: "open" }, R: { x: 160, y: -250, hand: "open" } },   /* both palms up */
    { R: { x: 70, y: -380, hand: "point" } },                                          /* finger up: "one rule" */
    { R: { x: 190, y: -190, hand: "open" }, L: { x: -110, y: -160, hand: "fist" } },   /* sweep out */
    { L: { x: -190, y: -330, hand: "point" } },                                        /* finger up beside the head */
  ];
  /* Pico's talking gestures (bird-local wing targets, beak side = +x) */
  const GEST_B = [
    { R: { mode: "point", x: 120, y: -230 } },     /* wing forward: "but what if" */
    { R: { mode: "point", x: 40, y: -300 } },      /* wing up: a question */
    { R: { mode: "point", x: 130, y: -120 } },     /* wing out low */
  ];
  const envAt = (talk, acc) => (acc == null ? clamp((talk - 0.45) * 2.2, 0, 1) : clamp(acc, 0, 1));

  K.duo = function (ctx, t, o) {
    o = o || {};
    const s = o.s || 1, x = o.x == null ? 380 : o.x, y = o.y == null ? 1000 : o.y, side = o.side || 1;
    const app = o.a == null ? 1 : clamp(o.a, 0, 1);
    if (app <= 0) return null;
    const tA = clamp(o.talkA || 0, 0, 1), tB = clamp(o.talkB || 0, 0, 1);
    const who = o.who !== undefined ? o.who : tA > tB + 0.04 ? "a" : tB > tA + 0.04 ? "b" : null;
    const accA = envAt(tA, o.accA), accB = envAt(tB, o.accB);
    /* Pico hovers clear of the owl's head (beak tip stays outside the head disc) */
    const pointing = o.pointA && (o.pointAmtA == null || o.pointAmtA > 0) ? (o.pointAmtA == null ? 1 : o.pointAmtA) : 0;
    const sB = s * 1.15, bx = x + side * 370 * s, by = y - (230 + 130 * pointing) * s; /* lifts so the owl's pointing arm passes under */
    const pop = app >= 1 ? 1 : K.E.back(app, 2.2);

    if (o.stage !== "none") { ctx.save(); ctx.translate(x + side * 140 * s, y); ctx.scale(s, s); K.bench(ctx, -420, 420, 0, { seed: 960 }); ctx.restore(); }

    /* ---------- the owl ---------- */
    const A = { seed: 700, blink: K.blinkAt(t, 3), mouth: "smile", talk: tA, viseme: o.visA, look: [0.15 * Math.sin(t * 0.7), 0], squash: 0.03 * Math.sin(t * 2.3), yaw: 0 };
    let wR = { x: 125 + 5 * Math.sin(t * 2.1), y: -140 + 6 * Math.sin(t * 2.4), hand: "open" }, wL = { x: -125 + 5 * Math.sin(t * 1.9 + 1), y: -140 + 6 * Math.sin(t * 2.6), hand: "open", hold: o.holdA };
    if (who === "a" && accA > 0) {
      const G = GEST_A[(o.gestA != null ? o.gestA : Math.floor(K.hash(Math.floor(t / 1.6), 77) * GEST_A.length)) % GEST_A.length];
      if (G.R) wR = mix(wR, G.R, accA);
      if (G.L && !o.holdA) wL = mix(wL, G.L, accA);
      A.squash += 0.1 * accA; A.brow = 0.5 * accA;
    }
    if (who === "b") { A.look = [0.9 * side, -0.4]; A.tilt = 6 * side; A.nod = 0.8 * accB; }
    if (o.pointA && (o.pointAmtA == null || o.pointAmtA > 0)) {
      const amt = o.pointAmtA == null ? 1 : o.pointAmtA, lx = (o.pointA[0] - x) / s, ly = (o.pointA[1] - y) / s, sd = lx >= 0 ? 1 : -1;
      const sh = [sd * 86, -215], d = Math.hypot(lx - sh[0], ly - sh[1]) || 1, r = Math.min(d, 185);
      const tgt = { x: sh[0] + ((lx - sh[0]) / d) * r, y: sh[1] + ((ly - sh[1]) / d) * r, hand: "point" };
      if (sd > 0) wR = mix(wR, tgt, amt); else wL = mix(wL, tgt, amt);
      A.look = [lerp(A.look[0], sd, amt), lerp(A.look[1], clamp(ly / 400 + 0.5, -1, 1), amt)];
    }
    const rA = o.reactA;
    if (rA && rA.amt > 0) {
      const u = clamp(rA.amt, 0, 1);
      if (rA.kind === "surprise") { A.eyeUp = u; A.tufts = u; A.exclaim = u; A.mouth = "o"; A.blink = 0; }
      if (rA.kind === "nod") A.nod = Math.max(A.nod || 0, u * (0.5 + 0.5 * Math.sin(t * 9)));
      if (rA.kind === "think") { wR = mix(wR, { x: 62, y: -215, hand: "fist" }, u); A.look = [0.4, -0.9]; A.tilt = -8 * u; A.brow = 0.8 * u; }
      if (rA.kind === "grin") A.mouth = "grin";
      if (rA.kind === "thumbs") wR = mix(wR, { x: 160, y: -300, hand: "thumb" }, u);
      if (rA.kind === "shrug") { wR = mix(wR, { x: 170, y: -240, hand: "open" }, u); wL = mix(wL, { x: -170, y: -240, hand: "open" }, u); A.tilt = 8 * u; }
    }
    A.wingR = wR; A.wingL = wL;

    /* ---------- Pico ---------- */
    const B = { seed: 820, dir: -side, blink: K.blinkAt(t + 0.9, 11), talk: tB, viseme: o.visB, look: [0.3, 0], squash: 0.04 * Math.sin(t * 3.1), hover: 1, goggles: 0 };
    if (who === "b" && accB > 0) {
      const G = GEST_B[(o.gestB != null ? o.gestB : Math.floor(K.hash(Math.floor(t / 1.6), 91) * GEST_B.length)) % GEST_B.length];
      B.wingR = mix({ mode: "flap", x: 0, y: 0 }, G.R, accB); if (accB < 0.5) B.wingR = { mode: "flap" };
      B.crest = 0.4 * accB; B.lean = 6 * accB; B.squash += 0.12 * accB;
    }
    if (who === "a") { B.look = [1, 0.1]; B.nod = 0.7 * accA; B.lean = 4; }
    if (who === "b") B.look = [0.3, 0];
    if (o.pointB && (o.pointAmtB == null || o.pointAmtB > 0)) {
      const amt = o.pointAmtB == null ? 1 : o.pointAmtB, pd = o.pointB[0] >= bx ? 1 : -1;
      B.dir = pd;
      const lx = ((o.pointB[0] - bx) / sB) * pd, ly = (o.pointB[1] - by) / sB, sh = [10, -128], d = Math.hypot(lx - sh[0], ly - sh[1]) || 1, r = Math.min(d, 98);
      if (amt > 0.5) B.wingR = { mode: "point", x: sh[0] + ((lx - sh[0]) / d) * r, y: sh[1] + ((ly - sh[1]) / d) * r };
      B.look = [lerp(B.look[0], 1, amt), lerp(0, clamp(ly / 300, -1, 1), amt)]; B.lean = 8 * amt;
    }
    const rB = o.reactB;
    if (rB && rB.amt > 0) {
      const u = clamp(rB.amt, 0, 1);
      if (rB.kind === "surprise") { B.crest = u; B.eyeUp = u; B.exclaim = u; B.lean = -10 * u; B.blink = 0; B.goggles = 0; }
      if (rB.kind === "nod") B.nod = u * (0.5 + 0.5 * Math.sin(t * 10));
      if (rB.kind === "think") { B.think = u; B.wingR = { mode: "point", x: 52, y: -150 }; }
      if (rB.kind === "write") {
        B.goggles = u; B.look = [0.2, 0.8];
        B.wingL = { mode: "hold", x: 60, y: -60, hold: (c) => K.clipboard(c, 10, 0, 0.8, -0.3, 905) };
        B.wingR = { mode: "point", x: 70 + 10 * Math.sin(t * 14), y: -70 + 6 * Math.cos(t * 11) };
      }
      if (rB.kind === "flip") B.lean = 360 * K.E.inOut(u);
    }

    /* draw: owl, then Pico (Pico hovers a little in front of the owl's shoulder line) */
    ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); ctx.translate(-x, -y);
    ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = P.woodDark; ctx.beginPath(); ctx.ellipse(x, y + 4, 120 * s, 14 * s, 0, 0, K.TAU); ctx.fill(); ctx.restore();
    K.owl(ctx, x, y, s, A);
    ctx.restore();
    ctx.save(); ctx.translate(bx, by); ctx.scale(pop, pop); ctx.translate(-bx, -by);
    K.hummingbird(ctx, bx, by, sB, B);
    ctx.restore();
    return { owl: [x, y], bird: [bx, by], owlHead: [x, y - 300 * s], birdHead: [bx + B.dir * 22 * sB, by - 170 * sB] };
  };
})(LK);
