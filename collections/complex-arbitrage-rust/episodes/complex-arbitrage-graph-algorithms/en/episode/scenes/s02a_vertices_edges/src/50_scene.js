/* ============================================================
   s02a 181.5 - 244.5  "1. The Market as a Graph / 1.1 Vertices and Edges"
   Chart set. Opens (wave) on the ORDER BOOK CHAOS depth chart painted on a
   sail-cloth; the chapter board drops in. "Two main components" pops a small
   board (vertices / edges). A spyglass reticle locks on the mid-price and an
   amber arrow leads the camera right to the GRAPH THEORY MODEL: BTC, ETH, USDT
   islands pop on their names, routes BTC->USDT, USDT->ETH, ETH->BTC draw, two
   ships sail BTC->ETH and ETH->BTC on different routes ("direction matters"),
   arrowheads pop ("arrows only point one way"), the R(i, j) weight tags pop.
   Ends (cut to s02b) on the clean triangle: cam {1350, 600, 0.85}.
   ============================================================ */
const TXT = {
  book: "ORDER BOOK CHAOS",
  model: "GRAPH THEORY MODEL",
  chapter: ["1. The Market as a Graph", "1.1 Vertices and Edges", "Mapping millions of live market pairs into a measurable mathematical universe."],
  parts: ["Vertices (nodes)", "Edges (links)"],
  vTitle: "Vertices (Nodes):", vBody: "Assets (BTC, ETH, USDT)",
  eTitle: "Edges (Links):", eBody: "Trading pairs (BTC/USDT, ETH/BTC)",
  wTitle: "Weights:", wBody: "The exchange rate, R(i, j)",
  pair: "BTC/USDT",
  rBU: "R(BTC, USDT)", rUE: "R(USDT, ETH)", rEB: "R(ETH, BTC)", rBE: "R(BTC, ETH)",
  neq: "≠",
};
const B = {
  move: NR.cue("move", 181),
  two: NR.cue("two", 187),
  vertices0: NR.cue("vertices", 190),
  edges0: NR.cue("edges", 191.5),
  mapped: NR.cue("mapped", 195.5),
  directed: NR.cue("directed", 196.5),
  vertices: NR.cue("vertices", 198),
  btc: NR.cue("bitcoin", 203),
  eth: NR.cue("ethereum", 204),
  usdt: NR.cue("usdt", 205),
  edges: NR.cue("edges", 207),
  pairs: NR.cue("pairs", 211.5),
  connecting: NR.cue("connecting", 213),
  usdtE: NR.cue("usdt", 214.5),
  market: NR.cue("market", 217),
  buying: NR.cue("buying", 220.5),
  selling: NR.cue("selling", 227),
  matters: NR.cue("matters", 229),
  directed2: NR.cue("directed", 231.5),
  arrows: NR.cue("arrows", 233.5),
  weights: NR.cue("weights", 238),
  rates: NR.cue("rates", 241.5),
  visualize: NR.cue("visualize", 243),
};

/* ---------- world layout (the triangle must match s02b's first frame) ---------- */
const N = { BTC: [1350, 330], ETH: [1110, 830], USDT: [1700, 860] };
const NODE_S = 0.8, SEEDS = { BTC: 23, ETH: 37, USDT: 11 };
const EDGE = { bend: 60, trim: 120, w: 7 };
const BOOK = [-150, 690];  /* order book sail-cloth centre */
const END_CAM = { x: 1350, y: 600, z: 0.85 };
const BACK_BEND = 150; /* the BTC -> ETH route curves well clear of ETH -> BTC */

const CAM = K.mkTrack([
  [SCENE.start, { x: -110, y: 590, z: 0.9 }],
  [B.mapped, { x: -90, y: 600, z: 0.92 }],
  [B.directed + 0.4, { x: -40, y: 600, z: 0.95 }],
  [B.vertices + 0.6, { x: 1350, y: 600, z: 0.85 }],
  [B.buying - 0.6, { x: 1350, y: 600, z: 0.85 }],
  [B.buying + 1.2, { x: 1200, y: 610, z: 1.0 }],
  [B.matters + 0.6, { x: 1210, y: 610, z: 1.02 }],
  [B.arrows - 0.4, { x: 1350, y: 600, z: 0.85 }],
  [SCENE.end, END_CAM],
]);

/* ---------- order book depth chart on a sail-cloth ---------- */
const ROWS = 21;
function orderBook(ctx, x, y, g, reticle, arrow) {
  const w = 640, h = 640;
  ctx.save(); ctx.translate(x, y);
  const billow = 8 * Math.sin(g * 1.6);
  const cloth = [[-w / 2, -h / 2], [0, -h / 2 + 6], [w / 2, -h / 2], [w / 2 + billow, 0], [w / 2, h / 2], [0, h / 2 - 6], [-w / 2, h / 2], [-w / 2 + billow * 0.5, 0]];
  K.shape(ctx, cloth, { fill: P.sail, w: 5, boil: 1.6, seed: 2100, shade: { color: P.sailShade, dx: -18, dy: 0 } });
  for (let i = 0; i < 6; i++) K.dot(ctx, -w / 2 + 30 + (i * (w - 60)) / 5, -h / 2 + 2, 7, P.goldDark, P.ink, 2, 2101 + i);
  /* header plank */
  K.plank(ctx, 0, -h / 2 - 34, 470, 70, [TXT.book], { size: 38, seed: 2110, post: false });
  /* bars: bids (ink) left of the axis, asks (red, some ink) right; lengths jitter = chaos */
  const top = -h / 2 + 50, rh = (h - 90) / ROWS;
  for (let i = 0; i < ROWS; i++) {
    const yy = top + i * rh + rh / 2;
    const jb = 1 + 0.16 * Math.sin(g * (3.1 + K.hash(i, 3)) + i * 1.7), ja = 1 + 0.18 * Math.sin(g * (2.7 + K.hash(i, 4)) + i * 2.3);
    const bl = (90 + 170 * K.hash(i, 2101)) * jb, al = (30 + 230 * K.hash(i, 2102)) * ja;
    K.shape(ctx, K.rectPts(-8 - bl, yy - rh * 0.36, bl, rh * 0.72, 2), { fill: P.ironDark, w: 2.5, boil: 0.6, seed: 2120 + i, gap: 0 });
    K.shape(ctx, K.rectPts(8, yy - rh * 0.36, al, rh * 0.72, 2), { fill: K.hash(i, 2103) < 0.7 ? P.loss : P.ironDark, w: 2.5, boil: 0.6, seed: 2150 + i, gap: 0 });
  }
  K.line(ctx, [[0, top - 6], [0, top + ROWS * rh + 6]], { stroke: P.ink, w: 4, boil: 0.8, seed: 2190, gap: 0 });
  /* spyglass reticle on the mid-price */
  if (reticle > 0) {
    const r = K.E.back(K.clamp(reticle, 0, 1), 1.8), s = 150 * r, pulse = 1 + 0.05 * Math.sin(g * 6);
    const cy = top + 10.5 * rh;
    ctx.save(); ctx.translate(0, cy); ctx.scale(pulse, pulse);
    for (let k = 0; k < 4; k++) { /* dashed square: 3 dashes per side */
      ctx.save(); ctx.rotate((k * Math.PI) / 2);
      for (let d = 0; d < 3; d++) K.line(ctx, [[-s + d * (2 * s / 3) + 8, -s], [-s + (d + 1) * (2 * s / 3) - 8, -s]], { stroke: P.goldDark, w: 8, boil: 0.8, seed: 2200 + k * 3 + d, gap: 0 });
      ctx.restore();
    }
    K.line(ctx, [[-28, 0], [28, 0]], { stroke: P.goldDark, w: 6, boil: 0.6, seed: 2215, gap: 0 });
    K.line(ctx, [[0, -28], [0, 28]], { stroke: P.goldDark, w: 6, boil: 0.6, seed: 2216, gap: 0 });
    ctx.restore();
    if (arrow > 0) { /* amber arrow from the reticle toward the graph */
      const x0 = 160, x1 = K.lerp(x0, 1000, K.E.out3(arrow));
      K.line(ctx, [[x0, cy], [x1, cy]], { stroke: P.ink, w: 14, boil: 1, seed: 2220, gap: 0 });
      K.line(ctx, [[x0, cy], [x1, cy]], { stroke: P.profit, w: 8, boil: 1, seed: 2221, gap: 0 });
      ctx.save(); ctx.translate(x1, cy);
      K.shape(ctx, [[26, 0], [-14, -22], [-6, 0], [-14, 22]], { fill: P.profit, w: 4, boil: 0.8, seed: 2222, gap: 0 });
      ctx.restore();
    }
  }
  ctx.restore();
}

/* the island positions where a node coin sits (for pointing / leaders) */
const coinAt = (k) => [N[k][0] - 120 * NODE_S, N[k][1] - 170 * NODE_S];
/* arrow-tipped leader line (extra leaders for a note that points at two things) */
function leader(ctx, a, b, u, seed) {
  if (u <= 0) return;
  const tx = K.lerp(a[0], b[0], u), ty = K.lerp(a[1], b[1], u);
  K.line(ctx, [a, [tx, ty]], { stroke: P.ink, w: 5, boil: 1, seed, gap: 0 });
  if (u > 0.9) { const ang = Math.atan2(ty - a[1], tx - a[0]); ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang); K.shape(ctx, [[4, 0], [-18, -11], [-18, 11]], { fill: P.ink, w: 3, boil: 0.6, seed: seed + 1, gap: 0 }); ctx.restore(); }
}

function draw(g) {
  const cam = CAM(g);
  K.cam = Object.assign({ rot: 0 }, cam);
  K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 5 });

  /* ---- left: order book chaos ---- */
  if (g < B.vertices + 2) {
    orderBook(ctx, BOOK[0], BOOK[1], g, pop(g, B.mapped, 0.5), span(g, B.directed, B.directed + 0.9));
    /* "two main components" board */
    const parts = pop(g, B.two, 0.45) * (1 - K.ss(B.directed + 0.2, B.directed + 0.8, g));
    if (parts > 0) K.notice(ctx, 560, 520, 520, TXT.parts, { a: parts, size: 40, shown: span(g, B.vertices0 - 0.1, B.vertices0 + 0.3) + span(g, B.edges0 - 0.1, B.edges0 + 0.3), title: "1.1", seed: 2300 });
  }

  /* ---- right: graph theory model ---- */
  const modelA = pop(g, B.directed + 0.6, 0.5) * (1 - K.ss(B.btc - 0.4, B.btc, g));
  if (modelA > 0) K.plank(ctx, 1350, 640, 600, 96, [TXT.model], { a: modelA, size: 44, seed: 2310, post: false });
  const nodeA = { BTC: pop(g, B.btc, 0.45), ETH: pop(g, B.eth, 0.45), USDT: pop(g, B.usdt, 0.45) };
  /* edges under the islands' coins: draw before the nodes */
  const pBU = span(g, B.connecting, B.usdtE + 0.4), pUE = span(g, B.market, B.market + 0.8), pEB = span(g, B.market + 0.5, B.market + 1.3);
  const arrowA = (k) => pop(g, B.arrows + 0.2 + k * 0.35, 0.4);
  const tagA = (k) => pop(g, B.weights + 0.3 + k * 0.45, 0.4);
  const dirFocus = hold(g, B.buying - 0.3, B.directed2 + 1.2, 0.5); /* BTC<->ETH is the focus: others dim */
  const st = (k) => (dirFocus > 0.5 && k !== "EB" ? "dim" : "plain");
  K.edge(ctx, N.BTC, N.USDT, Object.assign({ p: pBU, seed: 2400, arrow: arrowA(0), arrowS: 1.4, label: TXT.rBU, labelA: tagA(0), labelSize: 36, state: st("BU") }, EDGE));
  K.edge(ctx, N.USDT, N.ETH, Object.assign({ p: pUE, seed: 2410, arrow: arrowA(1), arrowS: 1.4, label: TXT.rUE, labelA: tagA(1), labelSize: 36, state: st("UE") }, EDGE));
  K.edge(ctx, N.ETH, N.BTC, Object.assign({ p: pEB, seed: 2420, arrow: arrowA(2), arrowS: 1.4, label: TXT.rEB, labelA: tagA(2), labelSize: 36, state: st("EB") }, EDGE));
  /* "direction matters": a second route BTC -> ETH curving the other way */
  const backP = span(g, B.buying - 0.2, B.buying + 0.8) * (1 - K.ss(B.arrows - 0.4, B.arrows + 0.3, g));
  if (backP > 0) K.edge(ctx, N.BTC, N.ETH, { p: backP, seed: 2430, bend: BACK_BEND, trim: 120, w: 7, arrow: 1, arrowS: 1.4 });
  /* BTC/USDT pair tag while the parrot names the market */
  const pairA = hold(g, B.market - 1.4, B.buying, 0.3);
  if (pairA > 0) { const q = K.edgePoint(N.BTC, N.USDT, 60, 0.5); K.tag(ctx, q[0] + 150, q[1] - 70, TXT.pair, { a: pairA, size: 36, seed: 2440 }); }
  ["ETH", "USDT", "BTC"].forEach((k) => K.node(ctx, N[k][0], N[k][1], NODE_S, { label: k, color: P[k], a: nodeA[k], seed: SEEDS[k], palms: k === "ETH" ? 2 : 1, lighthouse: k === "USDT" }));
  /* ships sailing each direction + their rate tags, and the "not equal" plank */
  if (dirFocus > 0) {
    const u1 = span(g, B.buying + 0.3, B.buying + 3.0), u2 = span(g, B.selling - 0.3, B.selling + 2.2);
    const trim = (A, Bp) => 120 / Math.hypot(Bp[0] - A[0], Bp[1] - A[1]);
    if (u1 > 0 && u1 < 1) { const t0 = trim(N.BTC, N.ETH), q = K.edgePoint(N.BTC, N.ETH, BACK_BEND, K.lerp(t0, 1 - t0, u1)); K.miniShip(ctx, q[0], q[1], 0.42, { heading: q[2] }); }
    if (u2 > 0 && u2 < 1) { const t0 = trim(N.ETH, N.BTC), q = K.edgePoint(N.ETH, N.BTC, 60, K.lerp(t0, 1 - t0, u2)); K.miniShip(ctx, q[0], q[1], 0.42, { heading: q[2] }); }
    const qa = K.edgePoint(N.BTC, N.ETH, BACK_BEND, 0.5), qb = K.edgePoint(N.ETH, N.BTC, 60, 0.5);
    K.tag(ctx, qa[0] - 170, qa[1] + 20, TXT.rBE, { a: pop(g, B.buying + 0.8, 0.4) * dirFocus, size: 36, seed: 2450 });
    K.tag(ctx, qb[0] + 110, qb[1] + 40, TXT.rEB, { a: pop(g, B.selling + 0.6, 0.4) * dirFocus, size: 36, seed: 2451 });
    const nq = pop(g, B.matters - 0.3, 0.45) * dirFocus;
    if (nq > 0) K.plank(ctx, (qa[0] + qb[0]) / 2 - 10, (qa[1] + qb[1]) / 2 - 150, 120, 100, [TXT.neq], { a: nq, size: 72, seed: 2460, post: false, colors: [P.loss] });
  }
  /* callouts (world space, size 36 = about 31 px on screen at z 0.85) */
  const calloutsOut = (1 - K.ss(B.visualize - 0.6, B.visualize + 0.2, g)) * (1 - dirFocus); /* duck while the camera pushes in on BTC/ETH */
  const vA = pop(g, B.vertices, 0.5) * calloutsOut;
  if (vA > 0) {
    const nx = 620, ny = 400;
    SIGN.note(ctx, nx, ny, { a: vA, title: TXT.vTitle, lines: [TXT.vBody], w: 560, size: 36, seed: 2500, to: nodeA.BTC > 0.5 ? [coinAt("BTC")[0] - 80, coinAt("BTC")[1]] : null });
    leader(ctx, [nx + 40, ny + 80], [N.ETH[0] - 150, N.ETH[1] - 140], span(g, B.eth + 0.2, B.eth + 0.7) * calloutsOut, 2510);
  }
  const eA = pop(g, B.edges, 0.5) * calloutsOut;
  if (eA > 0) { const q = K.edgePoint(N.BTC, N.USDT, 60, 0.3); SIGN.note(ctx, 2080, 300, { a: eA, title: TXT.eTitle, lines: [TXT.eBody], w: 560, size: 36, seed: 2520, to: pBU > 0.3 ? [q[0] + 20, q[1]] : null }); }
  const wA = pop(g, B.weights, 0.5) * calloutsOut;
  if (wA > 0) { const q = K.edgePoint(N.BTC, N.USDT, 60, 0.5); SIGN.note(ctx, 2110, 830, { a: wA, title: TXT.wTitle, lines: [TXT.wBody], w: 520, size: 36, seed: 2530, to: [q[0] + 150, q[1] + 4] }); }

  /* ---- chapter board + hosts (screen space) ---- */
  K.screen(ctx);
  SIGN.chapter(ctx, g, { at: B.move, until: B.two + 2.6, lines: TXT.chapter, y: 180 });
  const sp = (x, y) => K.toScreen(x, y);
  const qBU = K.edgePoint(N.BTC, N.USDT, 60, 0.5);
  /* crab: pointing order through the scene */
  let point = null, pointAmt = 0;
  const P1 = hold(g, B.mapped - 0.2, B.directed + 1.0, 0.3), P2 = hold(g, B.btc - 0.3, B.usdt + 1.0, 0.3), P3 = hold(g, B.buying, B.matters + 0.8, 0.4), P4 = hold(g, B.weights + 0.2, B.rates + 0.6, 0.3);
  if (P1 > 0) { point = sp(BOOK[0], BOOK[1] - 25); pointAmt = P1; }
  else if (P2 > 0) { const k = g < B.eth ? "BTC" : g < B.usdt ? "ETH" : "USDT"; point = sp(coinAt(k)[0], coinAt(k)[1]); pointAmt = P2; }
  else if (P3 > 0) { const q = K.edgePoint(N.BTC, N.ETH, 60, 0.5); point = sp(q[0], q[1]); pointAmt = P3; }
  else if (P4 > 0) { point = sp(qBU[0], qBU[1]); pointAmt = P4; }
  const reacts = [
    { at: B.move + 0.2, kind: "grin", dur: 1.6 },
    { at: B.two, kind: "shrug", dur: 1.4 },
    { at: B.btc - 0.1, kind: "nod", dur: 0.8 },
    { at: B.matters - 0.2, kind: "nod", dur: 1.0 },
    { at: B.arrows + 0.3, kind: "thumbs", dur: 1.6 },
    { at: B.visualize, kind: "think", dur: 1.6 },
  ];
  const preacts = [
    { at: B.move - 0.2, kind: "flap", dur: 1.0 },
    { at: B.edges - 0.1, kind: "think", dur: 1.4 },
    { at: B.directed2, kind: "grin", dur: 1.4 },
    { at: B.arrows, kind: "surprise", dur: 1.2 },
    { at: B.visualize - 0.4, kind: "think", dur: 1.6 },
  ];
  HOST.duo(ctx, g, {
    x: 300, y: 1010, s: 1.15, point, pointAmt, reacts, preacts,
    ppoint: sp(qBU[0], qBU[1]), ppointAmt: hold(g, B.connecting - 0.2, B.market + 0.6, 0.3),
  });
}

RUN(draw);
