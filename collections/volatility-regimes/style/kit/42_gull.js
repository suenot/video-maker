/* ============================================================
   KIT 42 GULL (Surf Turtle kit): K.gully, "Gully" the seagull lifeguard, Siggy's
   co-host (episode host B, the curious higher voice).
   Local space: feet on y = 0, 3/4 view facing `face` (+1 right, -1 left).
   Scale 1: about 230 px tall (0.9 of Siggy). Plump white body, grey back,
   coral lifeguard cap with a cream cross, a whistle on a turquoise cord,
   binoculars on a strap. Wings are two-bone IK arms with a feather fan,
   legs are two-bone IK to webbed feet.
   Pose state (all optional):
     squash   -1..1   volume kept;  lean deg;  hop px (legs tuck)
     face     +1 | -1 which way the beak points
     look     [dx, dy] pupils -1..1;  blink 0..1;  brow -1..1.5
     talk     0..1    beak opening (narration loudness);  viseme as K.viseme
     nod      -1..1   head pitch;  headTilt deg
     wingL/R  { x, y } wing-tip target (local px); default folded at the sides
     footL/R  { x, y } foot target
     whistle  0..1    whistle in the beak, cheeks puffed (a call to attention)
     binos    0..1    binoculars raised to the eyes (spotting a wave)
     exclaim  0..1    "!";  think 0..1 "?" bubble;  puff 0..1 surprise feather puff
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;

  /* feathered wing: limb + a fan of three primaries pointing along the forearm */
  function wing(ctx, S, T, sd, seed) {
    const r = K.ik2(S, T, 36, 32, sd > 0 ? 1 : -1);
    K.limb(ctx, [S, r.elbow, r.end], 26, P.gullGrey, seed);
    const a = Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
    ctx.save(); ctx.translate(r.end[0], r.end[1]); ctx.rotate(a);
    [-0.42, 0, 0.42].forEach((o, i) => { /* three broad, round-tipped primaries */
      ctx.save(); ctx.rotate(o * sd);
      const fz = i === 1 ? 1.12 : 0.95;
      K.shape(ctx, [[-4, -12], [20 * fz, -13], [38 * fz, -8], [46 * fz, 0], [38 * fz, 8], [20 * fz, 13], [-4, 12]], { fill: i === 1 ? P.gullGreyDark : P.gullGrey, w: 3.5, boil: 0.5, seed: seed + 3 + i, reg: false });
      K.shape(ctx, [[30 * fz, -9], [42 * fz, -5], [46 * fz, 0], [42 * fz, 5], [30 * fz, 9]], { fill: P.gullTip, stroke: null, w: 0, boil: 0.3, seed: seed + 6 + i, reg: false });
      ctx.restore();
    });
    ctx.restore();
    return r.end;
  }

  K.gully = function (ctx, x, y, s, st) {
    st = st || {};
    const sq = clamp((st.squash || 0) - 0.12 * (st.puff || 0), -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), face = st.face == null ? 1 : st.face;
    const talk = clamp(st.talk || 0, 0, 1), seed = st.seed || 900, puff = clamp(st.puff || 0, 0, 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    const air = clamp(hop / 40, 0, 1), hipY = -44 * syk - hop;
    /* legs: thin orange two-bone IK, webbed feet */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const f = st["foot" + k] || { x: sd * 22, y: 0 };
      const H = [sd * 16, hipY], T = [lerp(f.x, sd * 12, air), lerp(f.y, -hop - 4, air)];
      const r = K.ik2(H, T, 24, 24, sd > 0 ? 1 : -1);
      K.line(ctx, [H, r.elbow, r.end], { stroke: P.ink, w: 11, boil: 0.5, seed: seed + sd });
      K.line(ctx, [H, r.elbow, r.end], { stroke: P.gullLeg, w: 6, boil: 0.5, seed: seed + sd });
      K.shape(ctx, [[r.end[0] - 4, r.end[1] - 3], [r.end[0] + face * 26, r.end[1] - 2], [r.end[0] + face * 30, r.end[1] + 5], [r.end[0] - 10, r.end[1] + 5]], { fill: P.gullLeg, w: 3.5, boil: 0.4, seed: seed + 3 + sd, reg: false });
    });
    ctx.save(); ctx.translate(0, hipY); ctx.scale(sxk * (1 + 0.08 * puff), syk * (1 + 0.08 * puff));
    /* body: plump teardrop, grey back mantle, white belly */
    const body = K.ellipsePts(0, -52, 50, 60, 20);
    K.shape(ctx, body, { fill: P.gull, w: 5.5, boil: 0.9, seed: seed + 10, shade: { color: P.gullShade, dx: -face * 12, dy: -10, dots: true, cell: 8, density: 0.6 }, shine: { color: "#ffffff", a0: 3.6, a1: 4.3 } });
    K.shape(ctx, [[-face * 50, -60], [-face * 44, -96], [-face * 16, -110], [-face * 4, -80], [-face * 20, -30], [-face * 44, -24]], { fill: P.gullGrey, w: 4.5, boil: 0.7, seed: seed + 11 });
    /* tail feathers peeking out */
    K.shape(ctx, [[-face * 40, -14], [-face * 70, -4], [-face * 66, 8], [-face * 38, 2]], { fill: P.gullGreyDark, w: 4, boil: 0.6, seed: seed + 12 });
    /* whistle cord + whistle (on the chest unless it is being blown) */
    const wh = clamp(st.whistle || 0, 0, 1);
    K.line(ctx, [[-22, -100], [-8, -70], [6, -64], [22, -100]], { stroke: P.cord, w: 4, boil: 0.4, seed: seed + 13 });
    if (wh < 0.5) K.shape(ctx, K.roundPts(-4, -70, 26, 14, 6), { fill: P.whistle, w: 3.5, boil: 0.4, seed: seed + 14, reg: false });
    /* binocular strap + binoculars resting on the belly (unless raised) */
    const bn = clamp(st.binos || 0, 0, 1);
    if (bn < 0.5) { K.line(ctx, [[-30, -96], [-26, -40]], { stroke: P.ink, w: 3, boil: 0.3, seed: seed + 15 }); [-1, 1].forEach((k, i) => K.shape(ctx, K.roundPts(-36 + k * 11, -44, 18, 24, 7), { fill: P.binocular, w: 3, boil: 0.3, seed: seed + 16 + i, reg: false })); }
    /* neck + head */
    const nod = clamp(st.nod || 0, -1, 1), hx = face * 10, hy = -134 - 6 * puff + 7 * nod;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(((st.headTilt || 0) * Math.PI) / 180); ctx.scale(1, 1 - 0.06 * nod);
    ctx.scale(1.15, 1.15);
    K.shape(ctx, K.ellipsePts(0, 0, 40, 36, 18), { fill: P.gull, w: 5, boil: 0.8, seed: seed + 20, shade: { color: P.gullShade, dx: -face * 8, dy: -8 } });
    if (puff > 0) for (let i = 0; i < 3; i++) K.line(ctx, [[-14 + i * 12, -34], [-18 + i * 14, -50 - 8 * puff]], { stroke: P.ink, w: 3.5, boil: 0.4, seed: seed + 21 + i, alpha: puff });
    /* eyes (3/4: both toward the face side) */
    const ex = (i) => face * (6 + i * 22) - face * 4;
    [0, 1].forEach((i) => {
      const cx = ex(i), r = 11 + 3 * puff, ry = r * (1 - 0.92 * blink);
      K.shape(ctx, K.ellipsePts(cx, -6, r, Math.max(1.5, ry), 12), { fill: P.gullEye, w: 3.5, boil: 0.4, seed: seed + 24 + i, reg: false });
      if (blink < 0.6) K.dot(ctx, cx + look[0] * 4 + face * 1.5, -6 + look[1] * 4, 5.5, P.pupil, null, 0, seed + 26 + i);
      const br = st.brow || 0;
      K.line(ctx, [[cx - 10, -22 - br * 6 + (i ? -br : br) * 2], [cx + 10, -22 - br * 6 + (i ? br : -br) * 2]], { stroke: P.ink, w: 4, boil: 0.3, seed: seed + 28 + i });
    });
    /* beak: upper + lower mandible, opening with talk; red spot on the lower */
    const open = wh > 0.5 ? 0.15 : talk > 0.06 ? (0.2 + 0.8 * talk) * ({ a: 1, o: 0.8, e: 0.55, m: 0.15 }[st.viseme || K.viseme(K.now, talk, seed)] || 1) : 0;
    const bx = face * 30, by = 6;
    K.shape(ctx, [[bx - face * 8, by + 2], [bx + face * 46, by + 8 + 12 * open], [bx + face * 40, by + 16 + 22 * open], [bx - face * 6, by + 14 + 14 * open]], { fill: P.beakDark, w: 4, boil: 0.4, seed: seed + 31, reg: false });
    K.dot(ctx, bx + face * 30, by + 14 + 18 * open, 4, P.beakSpot, null, 0, seed + 32);
    K.shape(ctx, [[bx - face * 10, by - 8], [bx + face * 30, by - 4], [bx + face * 52, by + 6 - 6 * open], [bx + face * 30, by + 6], [bx - face * 8, by + 6]], { fill: P.beak, w: 4, boil: 0.4, seed: seed + 33, reg: false });
    if (wh > 0.5) { /* blowing the whistle: whistle at the beak tip, cheek puffed, sound lines */
      K.shape(ctx, K.roundPts(bx + face * 40 - 13, by - 2, 26, 14, 6), { fill: P.whistle, w: 3.5, boil: 0.4, seed: seed + 34, reg: false });
      K.dot(ctx, -face * 6, 14, 12, P.cheek, null, 0, seed + 35);
      for (let i = 0; i < 3; i++) K.line(ctx, [[bx + face * 74, by - 14 + i * 12], [bx + face * (90 + 6 * Math.sin(K.now * 20 + i)), by - 20 + i * 14]], { stroke: P.ink, w: 3.5, boil: 0.5, seed: seed + 36 + i });
    }
    /* lifeguard cap: coral dome, cream cross, brim toward the face */
    K.shape(ctx, [[-36, -18], [-30, -42], [-8, -54], [16, -52], [34, -38], [38, -18]], { fill: P.capRed, w: 4.5, boil: 0.6, seed: seed + 40, shade: { color: P.capRedDark, dx: -face * 8, dy: 0 } });
    K.shape(ctx, [[face * 10, -20], [face * 60, -16], [face * 56, -8], [face * 8, -12]], { fill: P.capRedDark, w: 3.5, boil: 0.4, seed: seed + 41, reg: false });
    K.shape(ctx, [[-5, -48], [5, -48], [5, -40], [13, -40], [13, -30], [5, -30], [5, -22], [-5, -22], [-5, -30], [-13, -30], [-13, -40], [-5, -40]], { fill: P.cream, stroke: null, w: 0, boil: 0.3, seed: seed + 42, reg: false });
    if (st.exclaim > 0) { const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5); ctx.save(); ctx.translate(-face * 50, -60); ctx.scale(a, a); K.shape(ctx, [[-8, -48], [8, -48], [5, -10], [-5, -10]], { fill: P.sigma, w: 4, boil: 0.6, seed: seed + 50 }); K.shape(ctx, K.ellipsePts(0, 4, 6.5, 6.5, 8), { fill: P.sigma, w: 4, boil: 0.6, seed: seed + 51 }); ctx.restore(); }
    if (st.think > 0) K.thinkMark(ctx, -face * 62, -70, st.think, seed + 55);
    ctx.restore(); /* head */
    ctx.restore(); /* body */
    /* wings in front (unsquashed space). binos / whistle pull the tips to the head */
    const headP = [hx, hipY + hy * syk];
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      let T = st["wing" + k] || { x: sd * 56, y: -66 }; /* folded at the sides */
      if (bn > 0) T = { x: lerp(T.x, headP[0] + face * 20 + sd * 14, bn), y: lerp(T.y, headP[1] + 10, bn) };
      wing(ctx, [sd * 40 * sxk, hipY - 92 * syk], [T.x, T.y - hop], sd, seed + 60 + sd * 10);
    });
    /* binoculars raised: in front of the wings that hold them */
    if (bn >= 0.5) {
      ctx.save(); ctx.translate(0, hipY); ctx.scale(sxk, syk); ctx.translate(hx, hy); ctx.scale(1.15, 1.15);
      [0, 1].forEach((i) => K.shape(ctx, K.roundPts(face * (2 + i * 22) - 13, -24, 26, 34, 10), { fill: P.binocular, w: 4, boil: 0.4, seed: seed + 44 + i, reg: false, shine: { color: P.shadesShine, w: 3 } }));
      K.line(ctx, [[face * 2, -8], [face * 24, -8]], { stroke: P.ink, w: 4, boil: 0.3, seed: seed + 46 });
      ctx.restore();
    }
    ctx.restore();
  };

  /* lifeguard stand: a small wooden tower Gully sits on (lifts the co-host to the mascot's height) */
  K.lifeguardStand = function (ctx, x, y, h, seed) {
    seed = seed || 950;
    [-1, 1].forEach((sd, i) => K.limb(ctx, [[x + sd * 60, y], [x + sd * 36, y - h]], 14, P.wood, seed + i));
    K.line(ctx, [[x - 52, y - h * 0.4], [x + 52, y - h * 0.4]], { stroke: P.woodDark, w: 8, boil: 0.5, seed: seed + 3 });
    K.shape(ctx, K.roundPts(x - 70, y - h - 16, 140, 22, 8), { fill: P.woodLight, w: 4.5, boil: 0.6, seed: seed + 4, shade: { color: P.wood, dx: 0, dy: -8 } });
    K.shape(ctx, K.roundPts(x - 64, y - h - 10 - 46, 128, 30, 8), { fill: P.capRed, w: 4, boil: 0.5, seed: seed + 5 }); /* backrest sign (red, no words) */
    K.shape(ctx, [[x - 6, y - h - 52], [x + 6, y - h - 52], [x + 6, y - h - 46], [x + 14, y - h - 46], [x + 14, y - h - 36], [x + 6, y - h - 36], [x + 6, y - h - 30], [x - 6, y - h - 30], [x - 6, y - h - 36], [x - 14, y - h - 36], [x - 14, y - h - 46], [x - 6, y - h - 46]], { fill: P.cream, stroke: null, w: 0, boil: 0.2, seed: seed + 6, reg: false });
    return [x, y - h - 16];
  };
})(VK);
