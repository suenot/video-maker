/* ============================================================
   INTRO 30 CHART SET: the archipelago as a graph. Islands = currencies,
   routes = exchange rates. "Heave ho, the cycle flows": the loop glows and
   the crab sails it. "Graph and matrix": every route's rate flies into a
   rate matrix, and "the Rust-crab knows" which cells form the cycle.
   ============================================================ */
const EDGE_TRIM = 150, DOCK_TRIM = 175;
const legDur1 = (T.lap1[1] - T.lap1[0]) / 3;
const ARRIVALS = [1, 2, 3].map((k) => T.lap1[0] + k * legDur1);
const endsOf = (e) => [[NODES[e[0]].x, NODES[e[0]].y], [NODES[e[1]].x, NODES[e[1]].y]];

/* ship position on the loop: {x, y, heading} */
function shipAt(t) {
  let leg = 0, v = 0;
  if (t >= T.lap1[1]) { leg = 2; v = 1; }
  else if (t >= T.lap1[0]) { const k = (t - T.lap1[0]) / legDur1; leg = Math.min(2, Math.floor(k)); v = k - leg; }
  const e = EDGES[LOOP[leg]], [A, B] = endsOf(e), L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const u0 = DOCK_TRIM / L, u = K.lerp(u0, 1 - u0, K.E.inOut(K.clamp(v, 0, 1)));
  const p = K.edgePoint(A, B, e[3], u);
  return { x: p[0] + 30, y: p[1] + 50, heading: p[2] };
}
const arrivedCount = (t) => ARRIVALS.filter((a) => t >= a).length;

const camB = K.mkTrack([
  [T.iris[0], { x: 1350, y: 250, z: 1.45 }],
  [T.iris[1], { x: 1310, y: 760, z: 0.72 }],
  [T.lap1[1], { x: 1300, y: 740, z: 0.75 }],
  [at(4, 0.8), { x: 2157, y: 840, z: 0.42 }],
  [T.irisOut[1], { x: 2120, y: 850, z: 0.44 }],
]);
function camChart(t) { const c = camB(t); return { x: c.x, y: c.y, z: c.z, rot: 0 }; }

/* crab pose on the ship in the chart view */
function crabChart(t) {
  const b = pulseB(t), rich = K.ss(T.lap1[1], T.lap1[1] + 0.4, t);
  const st = { seed: 500, blink: K.blinkAt(t, 5), mouth: rich > 0.5 ? "grin" : "smile", look: [0.6, -0.2], squash: 0.12 * b - 0.04 };
  st.clawL = { x: -72, y: -44, open: 0.15 };
  st.clawR = { x: 92, y: -70 - 18 * b, open: 0.3 + 0.4 * b };
  if (rich > 0) {
    st.clawL = { x: -100, y: K.lerp(-44, -150 - 20 * b, rich), open: 0.3 + 0.6 * b };
    st.clawR = { x: 100, y: K.lerp(-70, -150 - 20 * K.pulse(t + 0.25, 1, 6), rich), open: 0.3 + 0.6 * b };
    st.hop = 14 * b * rich;
  }
  return st;
}

/* ---------- rate matrix (screen space) ---------- */
const MX = { order: ["USDT", "BTC", "ETH", "SOL", "EUR"], x: 1100, y: 150, head: 130, cw: 116, hh: 70, ch: 84, pad: 20 };
MX.w = MX.pad * 2 + MX.head + MX.cw * 5; MX.h = MX.pad * 2 + MX.hh + MX.ch * 5;
const cellXY = (r, c) => [MX.x + MX.pad + MX.head + MX.cw * (c + 0.5), MX.y + MX.pad + MX.hh + MX.ch * (r + 0.5)];
const FLY = EDGES.map((e, i) => ({ r: MX.order.indexOf(e[0]), c: MX.order.indexOf(e[1]), v: e[2], t0: T.fly + (i * K.beatLen()) / 3, loop: LOOP.indexOf(i) >= 0, i }));
const FLY_DUR = 0.42;

function drawMatrix(t, cam) {
  const a = K.inv(T.matrix, T.matrix + 0.45, t); if (a <= 0) return;
  const s = K.E.back(a, 2), cx = MX.x + MX.w / 2, cy = MX.y + MX.h / 2;
  K.screen(ctx); ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  /* parchment */
  const edge = [];
  for (let i = 0; i <= 10; i++) edge.push([MX.x + (MX.w * i) / 10, MX.y + K.hs(i, 4) * 4]);
  for (let i = 0; i <= 7; i++) edge.push([MX.x + MX.w + K.hs(i + 20, 4) * 4, MX.y + (MX.h * i) / 7]);
  for (let i = 10; i >= 0; i--) edge.push([MX.x + (MX.w * i) / 10, MX.y + MX.h + K.hs(i + 40, 4) * 4]);
  for (let i = 7; i >= 0; i--) edge.push([MX.x + K.hs(i + 60, 4) * 4, MX.y + (MX.h * i) / 7]);
  K.shape(ctx, edge, { fill: P.paper, w: 5, boil: 1.4, seed: 820, shade: { color: P.paperShade, dx: -12, dy: -12 } });
  /* loop cells glow once the crab "knows" */
  const know = K.inv(T.knows + 0.2, T.knows + 0.5, t);
  if (know > 0) FLY.filter((f) => f.loop).forEach((f, k) => {
    const [x, y] = cellXY(f.r, f.c), pz = 1 + 0.08 * pulseB(t - k * 0.08);
    ctx.save(); ctx.globalAlpha = know * 0.9;
    K.shape(ctx, K.rectPts(x - (MX.cw / 2 - 6) * pz, y - (MX.ch / 2 - 8) * pz, (MX.cw - 12) * pz, (MX.ch - 16) * pz, 3), { fill: P.profit, w: 3.5, boil: 1, seed: 830 + k });
    ctx.restore();
  });
  /* headers */
  MX.order.forEach((k, i) => {
    const hx = MX.x + MX.pad + MX.head + MX.cw * (i + 0.5), hy = MX.y + MX.pad + MX.hh / 2;
    K.text(ctx, k, hx, hy, { size: 28, weight: 800, fill: K.shadeC(P[k], -0.25) });
    const vy = MX.y + MX.pad + MX.hh + MX.ch * (i + 0.5);
    K.text(ctx, k, MX.x + MX.pad + MX.head / 2, vy, { size: 28, weight: 800, fill: K.shadeC(P[k], -0.25) });
  });
  K.line(ctx, [[MX.x + 14, MX.y + MX.pad + MX.hh], [MX.x + MX.w - 14, MX.y + MX.pad + MX.hh]], { stroke: P.ink, w: 3.5, boil: 1, seed: 840 });
  K.line(ctx, [[MX.x + MX.pad + MX.head, MX.y + 14], [MX.x + MX.pad + MX.head, MX.y + MX.h - 14]], { stroke: P.ink, w: 3.5, boil: 1, seed: 841 });
  /* cells: diagonal 1, empty dots, landed rates */
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const [x, y] = cellXY(r, c), f = FLY.find((q) => q.r === r && q.c === c);
    if (f) { if (t >= f.t0 + FLY_DUR) K.text(ctx, f.v, x, y, { size: 26, weight: 700, font: K.FONT.mono, fill: P.ink }); }
    else K.text(ctx, r === c ? "1" : "·", x, y, { size: 26, weight: 500, font: K.FONT.mono, fill: P.inkSoft, alpha: 0.6 });
  }
  ctx.restore();
  /* rates in flight: from the route tag on the map to their cell */
  FLY.forEach((f) => {
    const u = K.inv(f.t0, f.t0 + FLY_DUR, t); if (u <= 0 || u >= 1) return;
    const e = EDGES[f.i], [A, B] = endsOf(e), q = K.edgePoint(A, B, e[3], e[5] || 0.5);
    const S = K.toScreen(q[0], q[1] - 6), D = cellXY(f.r, f.c), w = K.E.inOut(u);
    const x = K.lerp(S[0], D[0], w), y = K.lerp(S[1], D[1], w) - Math.sin(w * Math.PI) * 120;
    K.tag(ctx, x, y, f.v, { size: K.lerp(46 * cam.z, 28, w), hot: f.loop, seed: 850 + f.i });
  });
}

/* the crab pops up beside the matrix and points at the cycle */
function drawKnowingCrab(t) {
  const a = K.inv(T.knows - 0.35, T.knows + 0.1, t); if (a <= 0) return;
  const out = K.inv(T.irisOut[0] - 0.1, T.irisOut[0] + 0.25, t);
  const y = K.lerp(1330, 1010, K.E.back(a, 1.8)) + 300 * K.E.in3(out), x = 990, s = 1.35;
  const target = cellXY(0, 1), b = pulseB(t);
  K.screen(ctx);
  K.crab(ctx, x, y, s, {
    seed: 500, blink: K.blinkAt(t, 13), mouth: "grin", look: [1, -1], squash: 0.1 * b - 0.03, brow: 0.8,
    clawR: { x: (target[0] - x) / s, y: (target[1] - y) / s, open: 0.1 },
    clawL: { x: -100, y: -60 - 20 * b, open: 0.3 + 0.5 * b },
  });
}

function drawChart(t) {
  const cam = camChart(t);
  K.cam = cam; K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 5 });
  const hotK = K.ss(T.hot - 0.1, T.hot + 0.3, t);
  /* routes under islands */
  EDGES.forEach((e, i) => {
    const [A, B] = endsOf(e), inLoop = LOOP.indexOf(i) >= 0;
    const p = K.E.out3(K.inv(e[4], e[4] + 0.55, t));
    const state = inLoop ? (hotK > 0.5 ? "hot" : "plain") : (hotK > 0.5 ? "dim" : "plain");
    K.edge(ctx, A, B, { p, bend: e[3], label: e[2], seed: 100 + i * 13, trim: EDGE_TRIM, state, w: 10, labelSize: 46, lu: e[5] || 0.5 });
  });
  /* islands */
  Object.keys(NODES).forEach((k) => {
    const n = NODES[k], a = K.inv(n.pop - 0.05, n.pop + 0.45, t);
    const hot = (k === "USDT" || k === "BTC" || k === "ETH") ? hotK * (0.7 + 0.3 * pulseB(t)) : 0;
    ctx.save(); ctx.globalAlpha = (k === "SOL" || k === "EUR") ? 1 - 0.35 * hotK : 1;
    K.node(ctx, n.x, n.y, NODE_S, { label: k, color: n.c, a, seed: n.seed, palms: n.palms, lighthouse: n.lighthouse, hot });
    ctx.restore();
  });
  /* the ship */
  const s = shipAt(t), n = arrivedCount(t);
  K.miniShip(ctx, s.x, s.y, 0.6, { heading: s.heading, coins: 3 + n * 4, crab: (c) => K.crab(c, 0, 0, 1, crabChart(t)) });
  K.shipScreen = K.toScreen(s.x, s.y - 80);
  /* coin splash on every arrival */
  ARRIVALS.forEach((ta, ai) => {
    const d = t - ta; if (d < 0 || d > 0.9) return;
    const sp = shipAt(ta);
    for (let i = 0; i < 9; i++) {
      const vx = K.hs(i, ai + 3) * 260, vy = -420 - 220 * K.hash(i, ai + 4);
      K.goldBit(ctx, sp.x + vx * d, sp.y - 120 + vy * d + 700 * d * d, 16, ai * 20 + i, d * 9 + i);
    }
    K.sparkle(ctx, sp.x + 40, sp.y - 190, 40 * Math.sin(K.inv(0, 0.5, d) * Math.PI), 1, ai);
  });
  /* cargo plank: what we hold right now */
  const plankA = K.inv(T.lap1[0] - 0.2, T.lap1[0] + 0.3, t);
  if (plankA > 0) {
    const bumpT = ARRIVALS.filter((a) => t >= a).pop(), bump = bumpT ? Math.exp(-8 * (t - bumpT)) : 0;
    const gain = n >= 3 ? "+0.46 %" : "";
    ctx.save(); ctx.translate(1320, 640); ctx.scale(1 + 0.12 * bump, 1 + 0.12 * bump);
    K.plank(ctx, 0, 0, 640, gain ? 190 : 130, gain ? [HOLD[n], gain] : [HOLD[n]], { a: plankA, size: 56, seed: 11, colors: [P.ink, "#2f8a3e"] });
    ctx.restore();
  }
  drawMatrix(t, cam);
  drawKnowingCrab(t);
}
