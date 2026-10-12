/* ============================================================
   s02b 244.5 - 298.9  "The flight map, R(i, j), the multiplicative cycle condition"
   Chart set, continuing the s02a triangle by a CUT (same camera, islands, routes, tags).
   - 244.5 the parrot's flight-map analogy: dashed flight arcs over the routes; Pip takes
     off with 3 coins (the ticket), flies BTC -> USDT -> ETH -> BTC and is handed a coin at
     every landing.
   - 258.6 crab: "that flight path is what the algorithm hunts": the loop glows gold.
   - 262.2 camera slides left; slate "R(i, j)" (+ "= amount of j for 1 unit of i") with a
     demo: one BTC coin (i) sails the route and arrives as a pile of USDT (j).
   - 276.4 plank "MULTIPLICATIVE CYCLE CONDITION".
   - 287.8 loop relabelled i1, i2, i3; a x token rides every leg; 296.3 "> 1" in gold.
   Ends (cut) in the state s02c starts from.
   ============================================================ */
const TXT = {
  rBU: "R(BTC, USDT)", rUE: "R(USDT, ETH)", rEB: "R(ETH, BTC)",
  rij: "R(i, j)",
  rijBody: ["= amount of j", "for 1 unit of i"],
  product: ["R × R × R", "> 1"],
  header: "MULTIPLICATIVE CYCLE CONDITION",
  gt1: "> 1",
};
const B = {
  flightMap: NR.cue("flight", 245.5),
  layovers: NR.cue("layovers", 247.5),
  imagine: NR.cue("imagine", 249.5),
  sequence: NR.cue("sequence", 251),
  connecting: NR.cue("connecting", 252),
  landed: NR.cue("landed", 254),
  handed: NR.cue("handed", 255),
  money: NR.cue("money", 256.5),
  ticket: NR.cue("ticket", 257.5),
  that: NR.cue("that", 258.4),
  hunting: NR.cue("hunting", 260.5),
  math: NR.cue("mathematically", 261.5),
  formula: NR.cue("formula", 263.8),
  hear: NR.cue("hear", 265.5),
  rate: NR.cue("rate", 267),
  capital: NR.cue("capital", 268.5),
  j: NR.cue("j", 271),
  howMuch: NR.cue("how", 272.5),
  assetJ: NR.cue("j", 273.3),
  one: NR.cue("one", 274),
  assetI: NR.cue("i", 275.3),
  arbitrage: NR.cue("arbitrage", 276.5),
  mult: NR.cue("multiplicative", 278.5),
  met: NR.cue("met", 280.5),
  mult2: NR.cue("multiplicative", 282.5),
  practice: NR.cue("practice", 286.5),
  multiply: NR.cue("multiply", 288.3),
  closed: NR.cue("closed", 290),
  i1: NR.cue("one", 292),
  i2: NR.cue("two", 292.5),
  i3: NR.cue("three", 294),
  back: NR.cue("back", 295),
  product: NR.cue("product", 296.4),
  greater: NR.cue("greater", 297),
};

/* ---------- the s02a triangle (keep identical: the scene starts with a cut) ---------- */
const N = { BTC: [1350, 330], ETH: [1000, 860], USDT: [1700, 860] };
const NODE_S = 0.8, SEEDS = { BTC: 23, ETH: 37, USDT: 11 };
const EDGE = { bend: 60, trim: 120, w: 7 };
const LEGS = [["BTC", "USDT", TXT.rBU, 2400], ["USDT", "ETH", TXT.rUE, 2410], ["ETH", "BTC", TXT.rEB, 2420]];
const coinAt = (k) => [N[k][0] - 120 * NODE_S, N[k][1] - 170 * NODE_S];
const trimU = (A, Bp) => K.clamp(EDGE.trim / Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), 0, 0.45);

const CAM = K.mkTrack([
  [SCENE.start, { x: 1350, y: 600, z: 0.85 }],
  [B.flightMap, { x: 1350, y: 600, z: 0.85 }],
  [B.flightMap + 2.2, { x: 1350, y: 580, z: 0.8 }],
  [B.math, { x: 1350, y: 590, z: 0.8 }],
  [B.math + 1.8, { x: 1260, y: 720, z: 0.66 }],
  [B.met, { x: 1260, y: 720, z: 0.66 }],
  [B.multiply, { x: 1225, y: 700, z: 0.72 }],
  [SCENE.end, { x: 1230, y: 700, z: 0.72 }],
]);

/* ---------- small rich text with subscripts: "R(i_1, i_2)" (_x = subscript x) ---------- */
function rich(ctx, str, x, y, o) {
  o = Object.assign({ size: 40, weight: 700, font: K.FONT.mono, fill: P.ink, align: "center", n: 1e9 }, o || {});
  const segs = []; for (let i = 0; i < str.length; i++) { if (str[i] === "_" && i + 1 < str.length) { segs.push([str[i + 1], 1]); i++; } else segs.push([str[i], 0]); }
  const wOf = (s) => K.textW(ctx, s[0], s[1] ? o.size * 0.62 : o.size, o.weight, o.font);
  const W = segs.reduce((a, s) => a + wOf(s), 0);
  let cx = o.align === "center" ? x - W / 2 : o.align === "right" ? x - W : x;
  segs.slice(0, o.n).forEach((s) => { K.text(ctx, s[0], cx, y + (s[1] ? o.size * 0.28 : 0), { size: s[1] ? o.size * 0.62 : o.size, weight: o.weight, font: o.font, fill: o.fill, align: "left" }); cx += wOf(s); });
  return W;
}
function richTag(ctx, x, y, str, o) {
  o = Object.assign({ a: 1, size: 40, hot: false, seed: 2700 }, o || {});
  const a = o.a <= 0 ? 0 : o.a >= 1 ? 1 : K.E.back(o.a, 2.2); if (a <= 0) return;
  const w = rich(ctx, str, -9999, -9999, { size: o.size }) + 30, h = o.size + 22;
  ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
  K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 3), { fill: o.hot ? P.profit : P.paper, w: 3.5, boil: 1, seed: o.seed, shade: { color: o.hot ? P.goldDark : P.paperShade, dx: 0, dy: -5 } });
  rich(ctx, str, 0, 0, { size: o.size, fill: P.ink });
  ctx.restore();
}

/* ---------- flying parrot (screen space) ---------- */
function flyer(ctx, x, y, s, g, o) {
  o = o || {};
  const st = HOST.parrotPose(g, { side: 1 });
  const flap = 0.5 + 0.5 * Math.sin(g * 22);
  st.wingL = 0.25 + 0.7 * flap; st.wingR = 0.25 + 0.7 * flap; st.hop = 0; st.lean = o.lean || 0;
  st.look = o.look || [0.6, 0.2]; st.squash = -0.06 * flap;
  /* coins held in the feet: the ticket money, growing at every landing */
  if (o.coins > 0) { ctx.save(); ctx.translate(x, y + 30 * s); ctx.scale(1.7 * s, 1.7 * s); K.coinPile(ctx, 0, 0, Math.round(o.coins), 50, 2750); ctx.restore(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(((o.lean || 0) * Math.PI) / 180); ctx.translate(-x, -y);
  K.parrot(ctx, x, y, s, st);
  ctx.restore();
}

/* the duo, with the parrot optionally away from its perch (math kept identical to HOST.duo) */
function duo(ctx, g, o) {
  const s = 1.15, x = 300, y = 1010 + 5 * Math.sin(g * 1.5);
  const px = x + 205 * s, py = y - 8 * s;
  HOST.raft(ctx, x + 90 * s, y + 6 * s, s, g);
  K.perch(ctx, px, py, 92 * s, 731);
  if (!o.away) K.parrot(ctx, px, py - 92 * s, s * 0.95, HOST.parrotPose(g, Object.assign({}, o, { _px: px })));
  K.crab(ctx, x, y, s, HOST.crabPose(g, Object.assign({}, o, { x, y, s, parrot: o.away ? false : undefined })));
  return [px, py - 92 * s];
}

/* flight plan: perch -> BTC, then the three legs of the loop, then home */
const HOME = () => [300 + 205 * 1.15, 1010 + 5 * Math.sin(K.now * 1.5) - 8 * 1.15 - 92 * 1.15];
const FL = [
  { from: "home", to: "BTC", t0: B.imagine, t1: B.sequence + 0.3 },
  { from: "BTC", to: "USDT", t0: B.connecting, t1: B.landed + 0.15 },
  { from: "USDT", to: "ETH", t0: B.landed + 0.3, t1: B.handed + 0.25 },
  { from: "ETH", to: "BTC", t0: B.handed + 0.4, t1: B.money + 0.1 },
  { from: "BTC", to: "home", t0: B.that + 0.4, t1: B.hunting + 0.5 },
];
const LAND = [FL[1].t1, FL[2].t1, FL[3].t1];
/* landing spot: hovering just above the island's coin flag (world) */
const SPOT = { BTC: [175, -10], USDT: [190, -10], ETH: [-270, -20] }; /* beside the coin flag, outside the loop */
const spot = (k) => [N[k][0] + SPOT[k][0], N[k][1] + SPOT[k][1]];
function flightPos(g) {
  for (let i = 0; i < FL.length; i++) {
    const f = FL[i];
    if (g < f.t0) {
      if (i === 0) return null;
      const p = K.toScreen(...spot(FL[i - 1].to)); return { x: p[0], y: p[1] + 6 * Math.sin(g * 4), lean: 0, i };
    }
    if (g <= f.t1) {
      const u = K.E.inOut(K.inv(f.t0, f.t1, g));
      const A = f.from === "home" ? HOME() : K.toScreen(...spot(f.from)), Bp = f.to === "home" ? HOME() : K.toScreen(...spot(f.to));
      const q = K.edgePoint(A, Bp, f.to === "home" || f.from === "home" ? -120 : -150 * K.zoom, u);
      return { x: q[0], y: q[1], lean: K.clamp(Math.cos(q[2]) * 14, -14, 14), i };
    }
  }
  return null; /* back on the perch */
}

function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 5 });

  /* flight-map arcs (dashed, paper) over the routes */
  const arcs = hold(g, B.flightMap - 0.2, B.that + 1.5, 0.5);
  if (arcs > 0) LEGS.forEach((L, li) => {
    const A = spot(L[0]), Bp = spot(L[1]);
    for (let k = 0; k < 22; k++) {
      const u = k / 22; if (u > arcs * 1.05) break;
      const p = K.edgePoint(A, Bp, -150, u), q = K.edgePoint(A, Bp, -150, u + 0.024);
      K.line(ctx, [[p[0], p[1]], [q[0], q[1]]], { stroke: P.ink, w: 11, boil: 0.8, seed: 2600 + li * 30 + k, gap: 0, alpha: 0.6 });
      K.line(ctx, [[p[0], p[1]], [q[0], q[1]]], { stroke: P.paper, w: 6, boil: 0.8, seed: 2600 + li * 30 + k, gap: 0 });
    }
  });

  /* the loop: plain routes, gold when the algorithm "hunts" it, then leg by leg with x tokens */
  const hotLoop = hold(g, B.that, B.math + 1.2, 0.3);
  const legHot = [B.i1 + 0.9, B.i3 - 0.1, B.back + 0.6].map((t) => g > t);
  LEGS.forEach((L, li) => {
    const hot = hotLoop > 0.5 || legHot[li];
    /* as the camera pulls back: tags grow to stay >= 28 px and slide apart so they do not touch */
    const k = K.ss(B.math, B.math + 1.8, g), ls = K.lerp(36, 39, k), lu = K.lerp(0.5, [0.5, 0.5, 0.37][li], k);
    K.edge(ctx, N[L[0]], N[L[1]], Object.assign({ seed: L[3], arrow: 1, arrowS: 1.4, label: L[2], labelSize: ls, lu, au: lu < 0.5 ? 0.66 : 0.4, state: hot ? "hot" : "plain" }, EDGE));
  });
  ["ETH", "USDT", "BTC"].forEach((k) => K.node(ctx, N[k][0], N[k][1], NODE_S, { label: k, color: P[k], seed: SEEDS[k], palms: k === "ETH" ? 2 : 1, lighthouse: k === "USDT", hot: hotLoop > 0 ? hotLoop * 0.8 : 0 }));

  /* landing coins: each landing hands the parrot a coin (coin pops up out of the island) */
  LAND.forEach((t, i) => {
    const u = K.inv(t - 0.05, t + 0.6, g); if (u <= 0 || u >= 1) return;
    const k = FL[i + 1].to, c = coinAt(k);
    const x = c[0] + 70 * u + 30, y = c[1] + 40 - 180 * Math.sin(u * Math.PI) * 0.6 - 30 * u;
    K.goldBit(ctx, x, y, 26, 2780 + i, u * 6);
    K.sparkle(ctx, c[0] + 40, c[1] - 20, 40 * Math.sin(u * Math.PI), 1, 2790 + i);
  });

  /* R(i, j) demo on the BTC -> USDT route: i and j labels, one BTC coin sails, arrives as a USDT pile */
  const ijA = hold(g, B.assetJ - 0.2, B.multiply - 0.3, 0.3);
  if (ijA > 0) {
    const cb = coinAt("BTC");
    const u = K.inv(B.one, B.assetI + 0.6, g);
    if (u > 0 && u < 1) {
      const t0 = trimU(N.BTC, N.USDT), q = K.edgePoint(N.BTC, N.USDT, EDGE.bend, K.lerp(t0, 1 - t0, K.E.inOut(u)));
      K.coin(ctx, q[0], q[1] - 50, 46, { color: P.BTC, label: "1", seed: 2810, labelColor: P.paper, size: 44 });
    }
    const pa = K.ss(B.assetI + 0.4, B.assetI + 0.9, g);
    if (pa > 0) for (let i = 0; i < 5; i++) K.coin(ctx, N.USDT[0] + 250 + (i % 3) * 44 - 22 * Math.floor(i / 3), N.USDT[1] + 70 - Math.floor(i / 3) * 36 - 8 * K.E.back(K.clamp(pa * 5 - i, 0, 1), 2), 32 * Math.min(1, K.clamp(pa * 5 - i, 0, 1)), { color: P.USDT, seed: 2820 + i });
    richTag(ctx, cb[0] - 150, cb[1], "i", { a: Math.min(ijA, pop(g, B.assetI - 0.6)), size: 56, seed: 2800 });
    richTag(ctx, N.USDT[0] + 290, N.USDT[1] - 50, "j", { a: Math.min(ijA, pop(g, B.assetJ)), size: 56, seed: 2801 });
  }

  /* loop indices i1, i2, i3 */
  const idxA = (t) => pop(g, t, 0.4) * (1 - K.ss(SCENE.end + 5, SCENE.end + 6, g));
  [["BTC", "i_1", B.i1], ["USDT", "i_2", B.i2], ["ETH", "i_3", B.i3]].forEach(([k, s, t], i) => {
    const c = N[k]; richTag(ctx, c[0] + (k === "BTC" ? 190 : k === "USDT" ? 40 : -260), c[1] + (k === "BTC" ? -40 : k === "USDT" ? 175 : -60), s, { a: idxA(t), size: 52, seed: 2830 + i, hot: g > t + 0.6 });
  });
  /* x tokens riding each leg as the crab names it */
  [[0, B.i1, B.i2 + 0.7], [1, B.i3 - 0.3, B.i3 + 0.5], [2, B.back - 0.1, B.back + 0.7]].forEach(([li, t0, t1]) => {
    const u = K.inv(t0, t1, g); if (u <= 0 || u >= 1) return;
    const L = LEGS[li], A = N[L[0]], Bp = N[L[1]], tt = trimU(A, Bp), q = K.edgePoint(A, Bp, EDGE.bend, K.lerp(tt, 1 - tt, K.E.inOut(u)));
    K.tag(ctx, q[0], q[1] - 46, "×", { size: 64, seed: 2840 + li, hot: true, font: K.FONT.mono });
  });

  /* ---------- screen-space boards (right side) ---------- */
  K.screen(ctx);
  const sx = 1590, sy = 340;
  const slA = pop(g, B.rate - 0.3, 0.45);
  if (slA > 0) {
    K.slate(ctx, sx, sy, 500, 270, [], { a: slA, seed: 2860 });
    const sc = slA >= 1 ? 1 : K.E.back(slA, 2.2);
    ctx.save(); ctx.translate(sx, sy); ctx.scale(sc, sc);
    const n1 = Math.floor(TXT.rij.length * K.inv(B.capital + 0.1, B.j + 0.3, g));
    if (n1 > 0) K.text(ctx, TXT.rij.slice(0, n1), -210, -62, { size: 76, weight: 700, font: K.FONT.mono, fill: P.chalk, align: "left" });
    const body = TXT.rijBody.join("\n"), n2 = Math.floor(body.length * K.inv(B.howMuch, B.assetI + 0.3, g));
    body.slice(0, n2).split("\n").forEach((ln, i) => K.text(ctx, ln, -210, 30 + i * 48, { size: 36, weight: 500, font: K.FONT.mono, fill: P.chalk, align: "left" }));
    ctx.restore();
  }
  const hdA = pop(g, B.mult, 0.45);
  if (hdA > 0) {
    const bump = 1 + 0.1 * Math.max(0, Math.sin(K.inv(B.mult2, B.mult2 + 0.5, g) * Math.PI));
    ctx.save(); ctx.translate(1440, 112); ctx.scale(bump, bump);
    K.plank(ctx, 0, 0, 700, 88, [TXT.header], { a: hdA, size: 34, post: false, seed: 2870, colors: [P.rustDark] });
    ctx.restore();
  }
  /* the product of the loop's rates must be > 1 */
  const gtA = pop(g, B.multiply, 0.45);
  if (gtA > 0) {
    const gl = K.ss(B.greater, B.greater + 0.4, g);
    if (gl > 0) K.glow(ctx, 1640, 650, 200, "rgba(255,220,120,0.9)", 0.6 * gl);
    K.plank(ctx, 1640, 650, 380, 150, gl > 0 ? TXT.product : [TXT.product[0]], { a: gtA, size: 52, post: false, seed: 2850, colors: [P.ink, P.goldDark] });
  }

  /* ---------- hosts ---------- */
  const fp = flightPos(g), away = !!fp;
  const nCoins = 3 + LAND.filter((t) => g > t + 0.45).length;
  const reacts = [
    { at: B.flightMap, kind: "think", dur: 1.6 },
    { at: B.landed + 0.2, kind: "grin", dur: 1.2 },
    { at: B.money + 0.3, kind: "surprise", dur: 1.3 },
    { at: B.hunting - 0.3, kind: "thumbs", dur: 1.6 },
    { at: B.mult2, kind: "nod", dur: 1.2 },
    { at: B.greater, kind: "grin", dur: 1.6 },
  ];
  const preacts = [{ at: B.hear - 0.1, kind: "grin", dur: 1.4 }, { at: B.mult2 - 0.2, kind: "think", dur: 2.4 }, { at: B.practice - 1.4, kind: "think", dur: 2.0 }, { at: B.greater + 0.2, kind: "flap", dur: 1 }];
  const pt = g < B.hunting ? K.toScreen(...coinAt("BTC")) : g < B.arbitrage ? [sx - 250, sy - 60] : g < B.multiply ? [1100, 112] : K.toScreen(N.BTC[0] + 120, N.BTC[1]);
  const pointAmt = Math.max(hold(g, B.that - 0.1, B.hunting + 0.6), hold(g, B.capital - 0.2, B.j + 0.8), hold(g, B.mult - 0.1, B.met + 0.4), hold(g, B.i1 - 0.4, B.back + 0.6));
  duo(ctx, g, { away, reacts, preacts, point: pt, pointAmt });
  /* the parrot's question: "what does that actually look like in practice?" */
  const qA = hold(g, B.practice - 1.6, B.multiply + 0.2, 0.25);
  if (qA > 0 && !fp) K.tag(ctx, 640, 640 - 10 * Math.sin(g * 3), "?", { a: qA, size: 64, seed: 2890, font: K.FONT.display, weight: 900 });
  if (fp) {
    flyer(ctx, fp.x, fp.y, 0.85, g, { coins: nCoins, lean: fp.lean });
  }
}

RUN(draw);
