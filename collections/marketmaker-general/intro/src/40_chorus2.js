/* ============================================================
   INTRO 40 CHORUS 2, BREAK, FINAL CHORUS (bars 20 - 38).
   Chorus 2 shows the trade mechanics (juggled candles, a school of
   takers, the steady balance, the hero shot). The break shows how wide
   the channel goes: Bill Williams Alligator + fractals + AO, a Lorenz
   attractor, a manifold. The final chorus is three explainer shots:
   surfing the price wave, the spread formula, the quote() code.
   ============================================================ */
const SIDE = { x: 1590, y: 1000, s: 0.74 }; /* Otto standing on the sand, right of a board */

/* a candlestick as a juggling prop */
function candleProp(x, y, s, up, rot, seed) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  K.line(ctx, [[0, -95], [0, 95]], { stroke: P.ink, w: 7, boil: 0.4, seed });
  K.shape(ctx, K.rrectPts(-26, -60, 52, 120, 10, 2), { fill: up ? P.up : P.down, w: 5, boil: 0.5, seed: seed + 1, shade: { color: up ? P.upDark : P.downDark, dx: -10, dy: 0 } });
  ctx.restore();
}

/* ---------- SC10 "Buy low, sell high" (bars 20 - 22): juggling candles, then a chart with buy/sell ---------- */
const cam10 = camTrack([[at(20), { x: 960, y: 520, z: 1.08 }], [at(20, 3.5), { x: 960, y: 500, z: 1.0 }], [at(21, 0.3), { x: 1200, y: 480, z: 0.9 }], [at(22), { x: 1220, y: 480, z: 0.92 }]]);
const CD10 = (() => { const out = []; let prev = 100; for (let i = 0; i < 24; i++) { const c = 100 - 1.5 * Math.cos((2 * Math.PI * (i - 6)) / 24) + 0.25 * K.hs(i, 5); out.push({ o: prev, c, h: Math.max(prev, c) + 0.15 + 0.2 * K.hash(i, 6), l: Math.min(prev, c) - 0.15 - 0.2 * K.hash(i, 7) }); prev = c; } return out; })();
const CH10 = { x: 1460, y: 440, w: 860, h: 600 };
function sc10(t) {
  const juggling = t < at(21, 0.5), L = [OCT.x - 250, OCT.y - 330], R = [OCT.x + 250, OCT.y - 330], T = 2 * K.beatLen();
  const cand = [];
  for (let j = 0; j < 4; j++) {
    const ph = (((t - at(20)) / T + j / 4) % 1 + 1) % 1, a = ph < 0.5 ? L : R, b = ph < 0.5 ? R : L, u = (ph % 0.5) * 2, hgt = ph < 0.5 ? 470 : 330;
    cand.push([K.lerp(a[0], b[0], u), K.lerp(a[1], b[1], u) - hgt * 4 * u * (1 - u), j % 2 === 0, (ph * 4 + j) * Math.PI]);
  }
  const fly = K.inv(at(21, 0), at(21, 0.5), t); /* candles fly off into the chart */
  const draw = K.inv(at(21, 0.2), at(21, 3.2), t);
  drawReef(t, cam10(t), {
    traffic: 4,
    mid: () => {
      if (t < at(21, 0)) return;
      K.applyCam(ctx, 1);
      const res = K.chart(ctx, CH10.x, CH10.y, CH10.w, CH10.h, { a: ap(t, at(21, 0), 0.35), candles: CD10, draw, tab: P.bid, marks: [{ i: 6, v: CD10[6].c, kind: "buy", text: "98.50" }, { i: 18, v: CD10[18].c, kind: "sell", text: "101.50" }] });
      sc10.res = res;
    },
    octo: () => {
      const hand = (p, k) => toLocal(p[0], p[1] + 30 + 24 * K.pulse(t, 1, 5));
      const lh = hand(L), rh = hand(R);
      const res = sc10.res, buyAt = at(21, 0.2 + 3 * 6.5 / 24), sellAt = at(21, 0.2 + 3 * 18.5 / 24);
      let point = null;
      if (!juggling && res) { const tgt = t < sellAt - 0.2 ? [res.X(6), res.Y(CD10[6].c) + 90] : [res.X(18), res.Y(CD10[18].c) - 110]; point = toLocal(tgt[0] - 60, tgt[1]); }
      otto(t, {
        mouth: juggling ? "open" : "grin", look: juggling ? [Math.cos(t * 4) * 0.8, -0.8] : [1, -0.2], wave: 0.6, glint: K.inv(sellAt, sellAt + 0.4, t),
        arms: [null, null, juggling ? { x: lh.x, y: lh.y, bend: -40 } : null, null, null, juggling ? { x: rh.x, y: rh.y, bend: 40 } : null, point ? armTrack(t, 6, [[at(21, 0.3), { x: Math.min(point.x, 760), y: point.y, bend: 70 }]]) : null, null],
      });
      void buyAt;
    },
    front: () => {
      K.applyCam(ctx, 1);
      cand.forEach((c, j) => {
        if (fly >= 1) return;
        const tx = CH10.x - 300 + j * 180, ty = CH10.y + 60, e = K.E.in3(fly);
        candleProp(K.lerp(c[0], tx, e), K.lerp(c[1], ty, e), 0.8 * (1 - 0.6 * e), c[2], c[3] * (1 - e), 170 + j * 3);
      });
      const pr = t - at(21, 3.3);
      if (pr > 0) K.badge(ctx, CH10.x + 200, CH10.y - 210, "+3.00", { a: K.inv(0, 0.35, pr), color: P.up, dark: P.upDark, textColor: "#ffffff", size: 54 });
    },
  });
}

/* ---------- SC11 "Quote both sides as the fish swim by" (bars 22 - 24): a school of takers, the spread adds up ---------- */
const cam11 = camTrack([[at(22), { x: 960, y: 560, z: 0.96 }], [at(24), { x: 960, y: 540, z: 1.02 }]]);
function sc11(t) {
  const takes = Array.from({ length: 8 }, (_, j) => ({ t: at(22, j), side: j % 2 ? "bid" : "ask" }));
  const done = takes.filter((k) => t >= k.t).length, lastT = done ? takes[done - 1].t : 0;
  drawReef(t, cam11(t), {
    traffic: 3,
    octo: () => otto(t, { mouth: "grin", arms: quoteArms(t, takes, 0.9), look: [done % 2 ? -0.9 : 0.9, -0.3], brow: 0.4 }),
    front: () => {
      K.applyCam(ctx, 1);
      const cy = OCT.y - 330 - 44;
      takes.forEach((k, j) => {
        const sd = k.side === "ask" ? 1 : -1, tipX = OCT.x + sd * 330 + sd * 130, d = t - k.t;
        if (d < -1.3 || d > 1.6) return;
        const yy = cy + (j % 4 - 1.5) * 26;
        const x = d < 0 ? tipX - sd * 900 * d * 1.0 : tipX + sd * 700 * d, y = d < 0 ? yy + 60 * d : yy - 320 * d * d;
        K.fish(ctx, x, y, 0.62 + 0.12 * K.hash(j, 4), { species: ["Y", "T", "O", "B"][j % 4], dir: d < 0 ? -sd : sd, seed: 520 + j * 9, mouth: d < 0 ? "o" : "smile", card: d >= 0 ? { kind: k.side, text: k.side === "bid" ? BID : ASK } : null });
      });
      if (done) K.badge(ctx, OCT.x, OCT.y - 640, "+" + (done * 0.02).toFixed(2), { a: 1, bump: Math.exp(-7 * (t - lastT)), size: 56, color: P.up, dark: P.upDark, textColor: "#ffffff" });
    },
  });
}

/* ---------- SC12 "Tight spread, steady hand" (bars 24 - 26): a balance on Otto's head stays level ---------- */
const cam12 = camTrack([[at(24), { x: 960, y: 470, z: 0.98 }], [at(26), { x: 960, y: 480, z: 1.06 }]]);
const DROPS = [[at(24, 0), 1, 1], [at(24, 1), -1, 1], [at(24, 2), 1, 1], [at(24, 3), -1, 1], [at(25, 0), 1, 1], [at(25, 1), -1, 1], [at(25, 2), 1, 3], [at(25, 3), -1, 3]];
function sc12(t) {
  let ang = 0; const cnt = { "1": 0, "-1": 0 };
  DROPS.forEach(([td, sd, n]) => { const d = t - td - 0.22; if (d > 0) { ang += sd * n * 0.05 * Math.exp(-d * 4.5) * Math.cos(d * 13); cnt[sd] += n; } });
  const piv = [OCT.x, OCT.y - 420 + 6 * K.pulse(t, 1, 6)], half = 380;
  const end = (sd) => [piv[0] + sd * half * Math.cos(ang), piv[1] + sd * half * Math.sin(ang)];
  drawReef(t, cam12(t), {
    traffic: 4,
    octo: () => {
      const eL = end(-1), eR = end(1), lL = toLocal(eL[0], eL[1] + 230), lR = toLocal(eR[0], eR[1] + 230);
      otto(t, { wave: 0.1, mouth: Math.abs(ang) > 0.04 ? "o" : "smile", brow: Math.abs(ang) > 0.04 ? 1 : -0.2, look: [ang * 8, -1], glint: K.inv(at(25, 3.5), at(26), t), squash: 0,
        arms: [null, { x: lL.x, y: lL.y, bend: -30 }, null, null, null, null, { x: lR.x, y: lR.y, bend: 30 }, null] });
    },
    front: () => {
      K.applyCam(ctx, 1);
      /* beam on a small post on the head */
      K.tube(ctx, [[piv[0], piv[1] + 40], [piv[0], piv[1]]], 16, P.kelpDark, 180);
      const eL = end(-1), eR = end(1);
      K.tube(ctx, [eL, piv, eR], 18, P.brain, 181);
      K.dot(ctx, piv[0], piv[1], 16, P.sun, P.ink, 4, 182);
      [[-1, eL, P.bid], [1, eR, P.ask]].forEach(([sd, e, c]) => {
        const py = e[1] + 160;
        K.line(ctx, [[e[0], e[1]], [e[0] - 90, py]], { stroke: P.ink, w: 4, boil: 0.5, seed: 183 + sd }); K.line(ctx, [[e[0], e[1]], [e[0] + 90, py]], { stroke: P.ink, w: 4, boil: 0.5, seed: 185 + sd });
        /* coins stacked in the pan */
        const n = cnt[sd];
        for (let k = 0; k < n; k++) K.coin(ctx, e[0] + ((k % 3) - 1) * 44, py - 16 - Math.floor(k / 3) * 30, 26, { color: c, dark: sd < 0 ? P.bidDark : P.askDark, seed: 190 + k + (sd > 0 ? 20 : 0), spin: 0.6 });
        const pan = []; for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; pan.push([e[0] + Math.cos(a) * 120, py + Math.sin(a) * 46]); }
        K.shape(ctx, pan, { fill: P.shell, w: 5, boil: 0.5, seed: 187 + sd, shade: { color: P.shellDark, dx: 0, dy: -12 } });
      });
      /* falling coins */
      DROPS.forEach(([td, sd, n], j) => {
        const d = t - td; if (d < -0.05 || d > 0.22) return;
        const e = end(sd);
        for (let k = 0; k < n; k++) K.coin(ctx, e[0] + (k - (n - 1) / 2) * 50, K.lerp(e[1] - 420, e[1] + 120, K.E.in3(K.inv(0, 0.22, d))), 26, { color: sd < 0 ? P.bid : P.ask, dark: sd < 0 ? P.bidDark : P.askDark, seed: 230 + j * 5 + k, spin: t * 9 });
      });
      /* level bubble: a spirit level on the beam turns sunshine when level */
      const lv = Math.abs(ang) < 0.015;
      ctx.save(); ctx.translate(piv[0], piv[1] - 46); ctx.rotate(ang);
      K.shape(ctx, K.rrectPts(-80, -18, 160, 36, 18, 2), { fill: lv ? P.sun : P.cream, w: 4.5, boil: 0.4, seed: 240 });
      K.dot(ctx, K.clamp(-ang * 900, -60, 60), 0, 11, "#ffffff", P.ink, 3, 241);
      ctx.restore();
    },
  });
}

/* ---------- SC13 "Marketmaker! Marketmaker of the sand!" (bars 26 - 28): hero shot 2, fish orbit ---------- */
const cam13 = camTrack([[at(26), { x: 960, y: 540, z: 0.94, rot: -3 }], [at(26, 0.4), { x: 960, y: 530, z: 1.04, rot: -2 }], [at(27), { x: 960, y: 520, z: 1.06, rot: 2 }], [at(27, 0.4), { x: 960, y: 540, z: 1.16, rot: 3 }], [at(28), { x: 960, y: 540, z: 1.18, rot: 1 }]]);
function sc13(t) {
  const land = t - at(27, 2), d = t - at(26), hop = Math.max(0, Math.sin(K.inv(0, 0.7, d) * Math.PI)) * 110;
  const ring = (front) => {
    K.applyCam(ctx, 1);
    for (let j = 0; j < 8; j++) {
      const a = t * 1.6 + (j / 8) * K.TAU, s = Math.sin(a); if ((s > 0) !== front) continue;
      K.fish(ctx, OCT.x + Math.cos(a) * 720, OCT.y - 330 + s * 300, 0.55 + 0.15 * s, { species: ["Y", "T", "O", "B"][j % 4], dir: -Math.sign(Math.sin(a)) || 1, seed: 560 + j * 7 });
    }
  };
  drawReef(t, cam13(t), {
    traffic: 0, rays: 1.4,
    mid: () => { K.applyCam(ctx, 1); K.glow(ctx, OCT.x, OCT.y - 300, 700, "rgba(255,240,170,0.9)", 0.35 + 0.15 * K.pulse(t, 1)); ring(false); },
    octo: () => otto(t, { hop, mouth: "grin", brow: 1, arms: fanArms(t, at(26), { r: 500, ry: 430, s: 0.68 }), glint: K.inv(at(27), at(27) + 0.4, t), squash: land > 0 && land < 0.3 ? 0.3 * Math.sin((land / 0.3) * Math.PI) : 0.06 * K.pulse(t, 1, 6) }),
    front: () => {
      ring(true);
      if (land > 0 && land < 1) K.bubbleBurst(ctx, OCT.x, OCT.y - 200, land, { n: 18, r: 640, size: 26, dur: 1, seed: 77 });
    },
  });
}

/* ---------- SC14 break: Bill Williams Alligator + fractals + Awesome Oscillator (bars 28 - 29.5) ---------- */
const CD14 = K.genCandles(44, 23, 100, 1.2, 0.09), AL14 = K.alligator(CD14), AO14 = K.ao(CD14, 20), FR14 = K.fractals(CD14).filter((f) => f.i > 6);
const BOARD = { x: 800, y: 480, w: 1200, h: 780 };
function sc14(t) {
  const draw = K.inv(at(28, 0), at(28, 3.6), t);
  drawReef(t, { x: 960, y: 540, z: 1 }, {
    desk: false, traffic: 3, depth: 0.55,
    mid: () => {
      K.applyCam(ctx, 1);
      const res = K.chart(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { a: ap(t, at(28, 0), 0.35), candles: CD14, lines: [{ data: AL14.jaw, color: P.jaw, w: 6 }, { data: AL14.teeth, color: P.teeth, w: 6 }, { data: AL14.lips, color: P.lips, w: 6 }], fractals: FR14, hist: { data: AO14, frac: 0.25 }, draw, tab: P.kelp, rot: -0.01 });
      sc14.res = res;
    },
    octo: () => {
      const r = sc14.res, i = Math.max(0, Math.min(CD14.length - 1, Math.floor(draw * CD14.length) - 1));
      /* point at the chart from its right edge, at the height of the newest candle */
      const tip = r ? toLocal(BOARD.x + BOARD.w / 2 + 40, K.clamp(r.Y(CD14[i].h), BOARD.y - 40, BOARD.y + 220), SIDE) : { x: -600, y: -500 };
      /* two arms snap like alligator jaws on every beat */
      const snap = K.pulse(t, 1, 5);
      otto(t, { mouth: "grin", look: [-1, -0.3], brow: 0.5,
        arms: [null, null, { x: tip.x, y: tip.y, bend: -40, curl: 0.6 }, null, null, { x: 330, y: -470 - 60 * snap, bend: 40, curl: 1.2 }, { x: 360, y: -330 + 50 * snap, bend: 40, curl: -1.2 }, null] }, SIDE);
    },
  });
}

/* ---------- SC15 break: a Lorenz attractor (chaos) traced by Otto (bars 29.5 - 30.75) ---------- */
function flipWrap(cx, sx, fn) { ctx.save(); ctx.translate(cx, 0); ctx.scale(Math.max(0.001, sx), 1); ctx.translate(-cx, 0); const r = fn(); ctx.restore(); return r; }
function sc15(t) {
  const out = K.inv(at(30, 2.6), at(30, 3), t);
  drawReef(t, { x: 960, y: 540, z: 1 }, {
    desk: false, traffic: 2, depth: 0.85, rays: 0.5,
    mid: () => {
      K.applyCam(ctx, 1);
      sc15.head = flipWrap(BOARD.x, 1 - out, () => K.attractor(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { a: ap(t, at(29, 2), 0.3), draw: K.tw(t, at(29, 2), at(30, 2.6), 0.08, 1, K.E.out3), yaw: -0.25 + (t - at(29, 2)) * 0.3, pitch: 0.15, scale: 1.3, tab: P.lilac }));
    },
    octo: () => {
      const hd = sc15.head || [BOARD.x, BOARD.y], tl = toLocal(hd[0] + 30, hd[1] + 30, SIDE);
      otto(t, { skin: K.SKIN.chaos, mouth: "o", brow: 1.2, look: [-1, -0.4], arms: [null, null, { x: K.clamp(tl.x, -1300, -200), y: tl.y, bend: -80 }, null, null, null, null, null] }, SIDE);
    },
  });
}

/* ---------- SC16 break: a manifold with a path on it (bars 30.75 - 32) ---------- */
const PATH16 = Array.from({ length: 40 }, (_, i) => [-0.85 + i * 0.044, 0.55 * Math.sin(i * 0.16) - 0.2]);
function sc16(t) {
  const inn = K.inv(at(30, 3), at(30, 3.5), t);
  drawReef(t, { x: 960, y: 540, z: 1 }, {
    desk: false, traffic: 2, depth: 0.7, rays: 0.7,
    mid: () => {
      K.applyCam(ctx, 1);
      flipWrap(BOARD.x, K.E.back(inn, 1.5), () => K.manifold(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { a: 1, draw: K.inv(at(30, 3), at(31, 1), t), yaw: 0.4 + (t - at(30, 3)) * 0.35, tilt: 0.6, path: PATH16, pathDraw: K.inv(at(31, 0.5), at(31, 3.4), t), tab: P.kelp }));
    },
    octo: () => otto(t, { skin: K.SKIN.bull, mouth: "grin", brow: 0.6, look: [-1, -0.2], glint: K.inv(at(31, 3), at(31, 3.6), t),
      arms: [null, null, armTrack(t, 2, [[at(31, 0), { x: -520, y: -420, bend: -50, curl: 1.4 }]]), null, null, null, null, null] }, SIDE),
  });
}

/* ---------- SC17 "Buy low, sell high" (bars 32 - 34): Otto surfs the price wave ---------- */
const WAVE = (x) => 600 + 230 * Math.cos((2 * Math.PI * (x - 625)) / 1700);
function sc17(t) {
  const sx = K.lerp(200, 1900, K.inv(at(32), at(34), t)), sy = WAVE(sx), slope = (WAVE(sx + 5) - WAVE(sx - 5)) / 10;
  const buy = at(32, 2), sell = at(33, 2);
  drawReef(t, { x: K.clamp(sx + 80, 760, 1700), y: 520, z: 0.98 }, {
    desk: false, traffic: 5,
    mid: () => {
      K.applyCam(ctx, 1);
      const pts = []; for (let x = -700; x <= 2700; x += 60) pts.push([x, WAVE(x)]);
      ctx.save(); ctx.globalAlpha = 0.28; K.pathOf(ctx, pts.concat([[2700, 1100], [-700, 1100]]), true, true); ctx.fillStyle = P.foam; ctx.fill(); ctx.restore();
      K.line(ctx, pts, { stroke: P.ink, w: 26, boil: 0.6, seed: 260 }); K.line(ctx, pts, { stroke: P.bid, w: 16, boil: 0.6, seed: 260 });
      K.line(ctx, pts.map((p) => [p[0], p[1] - 4]), { stroke: "#9fe0ff", w: 4, boil: 0.5, seed: 261 });
      [[625, buy, "bid", "98.50"], [1475, sell, "ask", "101.50"]].forEach(([x, tt, kind, txt], k) => {
        const a = ap(t, tt, 0.35); if (a <= 0) return;
        K.dot(ctx, x, WAVE(x), 18, kind === "bid" ? P.bid : P.ask, P.ink, 5, 262 + k);
        K.card(ctx, x, WAVE(x) + (kind === "bid" ? 110 : -120), 0.9, { kind, text: txt, a, seed: 264 + k });
      });
    },
    octo: () => {
      /* clam-shell surfboard + Otto riding the line */
      const lean = Math.atan(slope) * 180 / Math.PI;
      ctx.save(); K.applyCam(ctx, 1); ctx.translate(sx, sy - 14); ctx.rotate(Math.atan(slope));
      K.shape(ctx, [[-170, 0], [-130, -34], [130, -34], [180, -8], [140, 16], [-140, 16]], { fill: P.shell, w: 5, boil: 0.6, seed: 270, shade: { color: P.shellDark, dx: 0, dy: -10 } });
      ctx.restore();
      const pl = { x: sx, y: sy - 34, s: 0.66 };
      otto(t, { lean: lean * 0.8, mouth: "grin", brow: 0.7, look: [1, slope], hop: 10 * K.pulse(t, 1, 5),
        arms: [null, armTrack(t, 1, [[buy, { x: -330, y: -420, bend: -40, card: { kind: "bid", text: "98.50", s: 0.9, a: ap(t, buy) } }]]), null, null, null, null,
          armTrack(t, 6, [[sell, { x: 340, y: -460, bend: 40, card: { kind: "ask", text: "101.50", s: 0.9, a: ap(t, sell) } }]]), null] }, pl);
      if (t > at(33, 3)) K.badge(ctx, sx, sy - 420, "+3.00", { a: ap(t, at(33, 3), 0.35), color: P.up, dark: P.upDark, textColor: "#ffffff", size: 54 });
    },
  });
}

/* ---------- SC18 "Quote both sides as the fish swim by" (bars 34 - 36): the spread formula ---------- */
function sc18(t) {
  const write = K.inv(at(34, 0.2), at(35, 2.5), t), line = Math.min(2, Math.floor(write * 3));
  drawReef(t, { x: 960, y: 540, z: 1 }, {
    desk: false, traffic: 3,
    mid: () => {
      K.applyCam(ctx, 1);
      K.formula(ctx, 790, 430, 1180, 520, ["spread = ask - bid", "  0.04 = 100.02 - 99.98", { t: "mid = (ask + bid) / 2", c: P.sun }], { a: ap(t, at(34, 0), 0.35), write, size: 58, tab: P.sun });
    },
    octo: () => otto(t, { mouth: "smile", look: [-1, -0.3], brow: 0.3,
      arms: [null, null, { x: -620, y: -520 + line * 105 + 60 * K.pulse(t, 1, 6) * 0, bend: -60, curl: 0.8 }, null, null, null, null, null] }, SIDE),
    front: () => {
      K.applyCam(ctx, 1);
      [[0, "bid", 1], [1, "ask", -1], [2, "bid", 1]].forEach(([j, side, dir]) => {
        const t0 = at(34, 0.5 + j * 1.6), d = t - t0; if (d < 0 || d > 2.6) return;
        const x = dir > 0 ? -300 + 1000 * d : 2200 - 1000 * d;
        K.fish(ctx, x, 940 - j * 40 + 20 * Math.sin(d * 5), 0.8, { species: ["O", "Y", "T"][j], dir, seed: 600 + j, card: { kind: side, text: side === "bid" ? BID : ASK } });
      });
    },
  });
}

/* ---------- SC19 "Tight spread, steady hand" (bars 36 - 38): quote() in code, the two cards pop out ---------- */
const CODE19 = ["def quote(mid, spread):", "    bid = mid - spread / 2", "    ask = mid + spread / 2", "    return bid, ask", "", "quote(100.00, 0.04)  # 99.98, 100.02"];
function sc19(t) {
  const typed = K.inv(at(36, 0.2), at(37, 1.5), t), out = at(37, 2);
  drawReef(t, { x: 960, y: 540, z: 1 }, {
    desk: false, traffic: 2,
    mid: () => { K.applyCam(ctx, 1); K.code(ctx, 790, 450, 1180, CODE19, { a: ap(t, at(36, 0), 0.35), typed, size: 40, tab: P.fan }); },
    octo: () => {
      const tap = K.pulse(t, 0.5, 8) * (t < at(37, 1.5) ? 1 : 0);
      otto(t, { mouth: t > out ? "grin" : "smile", brow: t > out ? 0.8 : 0, look: t > out ? [0, -0.8] : [-1, 0.2], glint: K.inv(at(37, 3), at(37, 3.6), t), wave: 0.3,
        arms: [null, armTrack(t, 1, [[out, { x: -330, y: -470, bend: -40, card: { kind: "bid", text: BID, s: 1, a: ap(t, out, 0.35) } }]]),
          t < out ? { x: -620, y: -260 - 40 * tap, bend: -40 } : null, null, null, null,
          armTrack(t, 6, [[out, { x: 330, y: -470, bend: 40, card: { kind: "ask", text: ASK, s: 1, a: ap(t, out, 0.35) } }]]), null] }, SIDE);
    },
    front: () => { K.applyCam(ctx, 1); K.bubbleBurst(ctx, SIDE.x, SIDE.y - 420, t - out, { n: 12, r: 300, size: 18, seed: 61 }); },
  });
}
