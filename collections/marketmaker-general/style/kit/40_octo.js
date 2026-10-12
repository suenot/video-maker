/* ============================================================
   KIT 40 OCTO: "Otto", the octopus market maker (the narrator).
   Local space: arm tips rest on y = 0, head centre (0, -250), faces the viewer.
   Proportions (scale 1): head 260 x 250, eyes r 30 behind round sunshine
   glasses (rim r 42), arms 8 x ~300 long, 34 -> 7 wide, suckers on one side.
   Pose state (all optional):
     squash   -1..1  head squash (+ wide) / stretch (- tall), volume kept
     lean     deg    whole-body tilt around the arm base
     hop      px     lift (resting arms trail behind)
     look     [dx, dy] pupils, -1..1
     blink    0..1   wink 0..1 (viewer-left eye only)
     mouth    "smile" | "grin" | "open" | "o" | "flat";  talk 0..1 overrides (loudness),
              viseme "m" | "a" | "o" | "e" | "u" (default: K.viseme picks one per syllable)
     brow     -1..1.5  (+ = raised)
     glint    0..1   a light flash crosses the glasses
     exclaim  0..1   "!" pops above the head
     skin     { fill, dark, light }  colour shift (octopuses change colour)
     wave     0..2   idle arm sway amount (default 1)
     arms     [8] each null (rest pose) or { x, y, bend, curl, card: {kind, text, rot}, prop: fn(ctx, x, y, ang) }
              x, y = tip target in local space; bend = sideways bow (px); curl = tip curl (rad)
   Arms 0..7 go left to right. Arm bodies are drawn first, then the head
   (it hides the arm roots), then everything held at the tips.
   ============================================================ */
var MK = window.MK || (window.MK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash } = K;
  const ROOT_Y = -128;
  const ROOT_X = [-100, -72, -44, -15, 15, 44, 72, 100];
  /* rest tips: a relaxed fan on the sea floor, outer arms curl outward */
  const REST = [[-300, -10], [-232, 0], [-150, 4], [-58, 6], [58, 6], [150, 4], [232, 0], [300, -10]];
  K.OCTO_REST = REST;

  /* sample a cubic Bezier */
  const cub = (a, b, c, d, u) => { const v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]; };

  /* centre line of one arm: root -> tip, with bow and a curled tip */
  function armLine(i, tip, bend, curl, wave, seed) {
    const R = [ROOT_X[i], ROOT_Y], side = i < 4 ? -1 : 1;
    const dx = tip[0] - R[0], dy = tip[1] - R[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const w1 = Math.sin(K.now * 2.1 + i * 0.9 + seed) * 18 * wave, w2 = Math.sin(K.now * 2.6 + i * 1.3 + seed + 1) * 26 * wave;
    const c1 = [R[0] + side * 26 + nx * w1 * 0.3, R[1] + 70];                 /* arms leave the head going down */
    const c2 = [lerp(R[0], tip[0], 0.62) + nx * (bend + w2), lerp(R[1], tip[1], 0.62) + ny * (bend + w2)];
    const pts = [];
    for (let k = 0; k <= 16; k++) pts.push(cub(R, c1, c2, tip, k / 16));
    /* tip curl: a short spiral continuing from the last direction */
    if (Math.abs(curl) > 0.02) {
      const a = pts[pts.length - 2], b = pts[pts.length - 1];
      let ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r = 26, x = b[0], y = b[1];
      for (let k = 0; k < 6; k++) { ang += curl / 6 * 2.2; r *= 0.86; x += Math.cos(ang) * r * 0.55; y += Math.sin(ang) * r * 0.55; pts.push([x, y]); }
    }
    return pts;
  }
  /* tapered ribbon around a centre line; returns the outline and the per-point normals */
  function ribbon(pts, w0, w1) {
    const L = [], Rr = [], N = [], n = pts.length;
    for (let k = 0; k < n; k++) {
      const a = pts[Math.max(0, k - 1)], b = pts[Math.min(n - 1, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      const nx = -dy / d, ny = dx / d, w = lerp(w0, w1, Math.pow(k / (n - 1), 0.8)) / 2;
      L.push([pts[k][0] + nx * w, pts[k][1] + ny * w]); Rr.push([pts[k][0] - nx * w, pts[k][1] - ny * w]); N.push([nx, ny, w]);
    }
    const tipP = pts[n - 1], tipR = N[n - 1][2];
    const cap = [[tipP[0] + (tipP[0] - pts[n - 2][0]) * 0.4, tipP[1] + (tipP[1] - pts[n - 2][1]) * 0.4]];
    return { outline: L.concat(cap, Rr.reverse()), N, tipR };
  }

  K.octo = function (ctx, x, y, s, st) {
    st = st || {};
    const sk = Object.assign({ fill: P.octo, dark: P.octoDark, light: P.octoLight }, st.skin || {});
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0, wave = st.wave == null ? 1 : st.wave, seed = st.seed || 700;
    const look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1);
    ctx.save(); ctx.translate(x, y - hop); ctx.scale(s, s); ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    const tips = [];
    /* ---- arms ---- */
    const arms = st.arms || [];
    const lines = [];
    for (let i = 0; i < 8; i++) {
      const a = arms[i];
      let tip, bend, curl;
      if (a) { tip = [a.x, a.y]; bend = a.bend || 0; curl = a.curl || 0; }
      else {
        const air = clamp(hop / 120, 0, 1); /* in the air resting arms trail down and in */
        tip = [REST[i][0] * (1 - 0.35 * air), REST[i][1] + hop * 0.55 + 40 * air];
        bend = (i < 4 ? 1 : -1) * 20; curl = (i < 4 ? -1 : 1) * 2.6;
      }
      lines.push({ i, pts: armLine(i, tip, bend, curl, a ? wave * 0.35 : wave, seed), held: a });
    }
    /* draw outer (back) arms first */
    [0, 7, 1, 6, 2, 5, 3, 4].forEach((i) => {
      const ln = lines[i], rb = ribbon(ln.pts, 56, 13);
      K.shape(ctx, rb.outline, { fill: sk.fill, w: 5.5, boil: 0.7, seed: seed + 10 + i * 7, shade: { color: sk.dark, dx: (i < 4 ? 8 : -8), dy: -8 } });
      /* suckers along the inner side */
      const side = i < 4 ? -1 : 1;
      for (let k = 4; k < ln.pts.length - 2; k += 2) {
        const n = rb.N[k], r = Math.max(3, n[2] * 0.42), px = ln.pts[k][0] + n[0] * n[2] * 0.55 * side, py = ln.pts[k][1] + n[1] * n[2] * 0.55 * side;
        K.shape(ctx, K.ellipsePts(px, py, r, r, 8), { fill: P.sucker, stroke: sk.dark, w: 2.4, boil: 0.3, seed: seed + 100 + i * 20 + k });
      }
      const p = ln.pts, q = p[p.length - 1], q0 = p[p.length - 2];
      tips[i] = { x: q[0], y: q[1], ang: Math.atan2(q[1] - q0[1], q[0] - q0[0]), held: ln.held };
    });
    /* ---- head (with squash around the arm base) ---- */
    ctx.save(); ctx.translate(0, ROOT_Y + 18); ctx.scale(sxk, syk); ctx.translate(0, -(ROOT_Y + 18));
    const head = [];
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * K.TAU, c = Math.cos(a), sn = Math.sin(a);
      const ry = sn < 0 ? 152 : 112, rx = sn < 0 ? 136 : 124 - 18 * sn; /* tall dome, slightly narrower base */
      head.push([c * rx, -250 + sn * ry + (sn > 0 ? -18 * sn * sn : 0)]);
    }
    K.shape(ctx, head, { fill: sk.fill, w: 6, boil: 0.9, seed: seed + 1, shade: { color: sk.dark, dx: -22, dy: -18 }, hi: { color: sk.light, dx: 18, dy: 22 }, dots: { color: sk.dark, alpha: 0.35, gap: 15, r: 3.6, ang: 0.9, from: 0.55 } });
    /* spots */
    [[-70, -330, 13], [-40, -365, 8], [74, -320, 10], [46, -360, 6], [-92, -270, 7]].forEach((d, k) => K.shape(ctx, K.ellipsePts(d[0], d[1], d[2], d[2] * 0.85, 10), { fill: sk.light, stroke: null, w: 0, boil: 0.3, seed: seed + 20 + k }));
    /* top highlight */
    K.shape(ctx, K.ellipsePts(-52, -352, 30, 16, 10, -0.5), { fill: "#ffffff", stroke: null, w: 0, boil: 0.3, seed: seed + 26, alpha: 0.7 });
    /* cheeks */
    [-1, 1].forEach((sd, k) => K.shape(ctx, K.ellipsePts(sd * 92, -186, 20, 12, 10), { fill: P.blush, stroke: null, w: 0, boil: 0.3, seed: seed + 30 + k, alpha: 0.45 }));
    /* mouth */
    const m = st.mouth || "smile", talk = clamp(st.talk || 0, 0, 1), my = -168;
    if (talk > 0.06) K.talkMouth(ctx, 0, my - 2, 24, talk, st.viseme || K.viseme(K.now, talk, seed), seed + 40);
    else if (m === "smile") K.line(ctx, [[-26, my - 4], [-12, my + 9], [12, my + 9], [26, my - 4]], { stroke: P.ink, w: 5, boil: 0.5, seed: seed + 42 });
    else if (m === "grin") { K.shape(ctx, [[-32, my - 6], [32, my - 6], [18, my + 18], [0, my + 22], [-18, my + 18]], { fill: "#7a1f3d", w: 4.5, boil: 0.5, seed: seed + 43 }); K.shape(ctx, [[-24, my - 4], [24, my - 4], [20, my + 3], [-20, my + 3]], { fill: "#ffffff", stroke: null, w: 0, boil: 0.3, seed: seed + 44 }); }
    else if (m === "open") K.shape(ctx, K.ellipsePts(0, my + 6, 18, 16, 12), { fill: "#7a1f3d", w: 4.5, boil: 0.5, seed: seed + 45 });
    else if (m === "o") K.shape(ctx, K.ellipsePts(0, my + 4, 9, 11, 10), { fill: "#7a1f3d", w: 4, boil: 0.4, seed: seed + 46 });
    else K.line(ctx, [[-18, my + 2], [18, my + 2]], { stroke: P.ink, w: 5, boil: 0.4, seed: seed + 47 });
    /* eyes behind round glasses */
    const EY = -236, EX = 52;
    [-1, 1].forEach((sd, k) => {
      const ex = sd * EX, b = k === 0 ? Math.max(blink, clamp(st.wink || 0, 0, 1)) : blink;
      K.shape(ctx, K.ellipsePts(ex, EY, 31, 33, 16), { fill: P.eye, w: 4, boil: 0.4, seed: seed + 50 + k });
      if (b < 0.95) {
        const px = ex + look[0] * 11, py = EY + look[1] * 10 + b * 8;
        ctx.save(); K.pathOf(ctx, K.ellipsePts(ex, EY, 31, 33, 16), true); ctx.clip();
        K.shape(ctx, K.ellipsePts(px, py, 14, 15, 12), { fill: P.pupil, stroke: null, w: 0, boil: 0.3, seed: seed + 52 + k });
        K.shape(ctx, K.ellipsePts(px + 5, py - 6, 5, 5, 8), { fill: "#ffffff", stroke: null, w: 0, boil: 0.2, seed: seed + 54 + k });
        /* eyelid from the top */
        if (b > 0.02) K.shape(ctx, [[ex - 40, EY - 40], [ex + 40, EY - 40], [ex + 40, EY - 33 + 66 * b], [ex - 40, EY - 33 + 66 * b]], { fill: sk.fill, stroke: P.ink, w: 4, boil: 0.3, seed: seed + 56 + k });
        ctx.restore();
      } else K.line(ctx, [[ex - 24, EY + 4], [ex, EY + 12], [ex + 24, EY + 4]], { stroke: P.ink, w: 5, boil: 0.4, seed: seed + 58 + k });
      /* brow */
      const br = st.brow || 0;
      K.line(ctx, [[ex - 22, EY - 62 - br * 12 + sd * br * 3], [ex + 22, EY - 62 - br * 12 - sd * br * 3]], { stroke: P.ink, w: 6, boil: 0.4, seed: seed + 60 + k });
    });
    /* glasses: two rims + bridge + temples */
    [-1, 1].forEach((sd, k) => {
      const rim = K.ellipsePts(sd * EX, EY, 42, 42, 20);
      ctx.save(); ctx.globalAlpha = 0.18; K.pathOf(ctx, rim, true); ctx.fillStyle = P.lens; ctx.fill(); ctx.restore();
      K.line(ctx, rim.concat([rim[0]]), { stroke: P.ink, w: 15, boil: 0.4, seed: seed + 70 + k });
      K.line(ctx, rim.concat([rim[0]]), { stroke: P.glasses, w: 8, boil: 0.4, seed: seed + 70 + k });
      K.line(ctx, [[sd * (EX + 42), EY - 6], [sd * 128, EY - 16]], { stroke: P.ink, w: 7, boil: 0.4, seed: seed + 74 + k });
    });
    K.line(ctx, [[-12, EY - 6], [0, EY - 14], [12, EY - 6]], { stroke: P.ink, w: 12, boil: 0.3, seed: seed + 76 });
    K.line(ctx, [[-12, EY - 6], [0, EY - 14], [12, EY - 6]], { stroke: P.glasses, w: 6, boil: 0.3, seed: seed + 76 });
    if (st.glint > 0) { /* diagonal flash crossing both lenses */
      const g = clamp(st.glint, 0, 1), gx = lerp(-120, 120, g);
      [-1, 1].forEach((sd) => { ctx.save(); K.pathOf(ctx, K.ellipsePts(sd * EX, EY, 40, 40, 16), true); ctx.clip(); ctx.globalAlpha = 0.85 * Math.sin(g * Math.PI); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(gx - 20, EY - 60); ctx.lineTo(gx + 2, EY - 60); ctx.lineTo(gx - 40, EY + 60); ctx.lineTo(gx - 62, EY + 60); ctx.fill(); ctx.restore(); });
    }
    /* bow tie (the market maker dresses for work) */
    K.shape(ctx, [[-4, -128], [-40, -146], [-44, -100], [-4, -114]], { fill: P.bid, w: 4.5, boil: 0.4, seed: seed + 80, shade: { color: P.bidDark, dx: 6, dy: 0 } });
    K.shape(ctx, [[4, -128], [40, -146], [44, -100], [4, -114]], { fill: P.bid, w: 4.5, boil: 0.4, seed: seed + 81, shade: { color: P.bidDark, dx: -6, dy: 0 } });
    K.dot(ctx, 0, -121, 10, P.sun, P.ink, 4, seed + 82);
    /* "!" */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(150, -430); ctx.rotate(0.22); ctx.scale(a, a);
      K.shape(ctx, [[-11, -64], [11, -64], [6, -14], [-6, -14]], { fill: P.sun, w: 5, boil: 0.5, seed: seed + 90, sharp: true });
      K.dot(ctx, 0, 6, 9, P.sun, P.ink, 5, seed + 91);
      ctx.restore();
    }
    ctx.restore();
    /* ---- held things on top ---- */
    tips.forEach((tp, i) => {
      const h = tp.held; if (!h) return;
      if (h.card) K.card(ctx, tp.x + (h.card.dx || 0), tp.y + (h.card.dy == null ? -40 : h.card.dy), h.card.s || 0.9, Object.assign({ seed: seed + 200 + i * 3, rot: (h.card.rot == null ? (i < 4 ? -0.1 : 0.1) : h.card.rot) }, h.card));
      if (h.prop) h.prop(ctx, tp.x, tp.y, tp.ang);
      /* the arm tip wraps over the held thing */
      if (h.card || h.wrap) K.tube(ctx, [[tp.x - Math.cos(tp.ang) * 22, tp.y - Math.sin(tp.ang) * 22], [tp.x, tp.y], [tp.x + 12 * (i < 4 ? -1 : 1), tp.y - 14]], 10, sk.fill, seed + 300 + i, { ow: 9 });
    });
    ctx.restore();
    /* world-space tip positions for the scene (cards, contacts) */
    K.octoTips = tips.map((tp) => tp && { x: x + (tp.x * s), y: y - hop + tp.y * s });
  };

  /* blink curve with seeded blink times, 0..1 (works for any t) */
  K.blinkAt = function (t, seed) {
    let b = 0;
    const i0 = Math.max(0, Math.floor((t - 0.8) / 2.1) - 1);
    for (let i = i0; i < i0 + 3; i++) {
      const tb = 0.8 + i * 2.1 + K.hash(i, seed || 7) * 1.2, d = t - tb;
      if (d > 0 && d < 0.18) b = Math.max(b, Math.sin((d / 0.18) * Math.PI));
    }
    return b;
  };
  /* skin presets: calm coral (default), volatile lilac, bullish mint, bearish red */
  K.SKIN = {
    calm: { fill: P.octo, dark: P.octoDark, light: P.octoLight },
    chaos: { fill: "#a98bff", dark: "#7a5ce0", light: "#cdbcff" },
    bull: { fill: "#4fd6a5", dark: "#22a67a", light: "#9ff0d0" },
    bear: { fill: "#ff7272", dark: "#d94848", light: "#ffb0b0" },
  };
  K.skinMix = function (a, b, u) { return { fill: K.mix(a.fill, b.fill, u), dark: K.mix(a.dark, b.dark, u), light: K.mix(a.light, b.light, u) }; };
})(MK);
