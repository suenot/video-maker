/* ============================================================
   INTRO 30 CHART SET: the archipelago as a graph. Islands = currencies,
   routes = exchange rates. The crab sails the profitable triangle twice.
   ============================================================ */
const EDGE_TRIM = 150, DOCK_TRIM = 175;
const legDur1 = (T.lap1[1] - T.lap1[0]) / 3, legDur2 = (T.lap2[1] - T.lap2[0]) / 3;
const ARRIVALS = [1, 2, 3].map((k) => T.lap1[0] + k * legDur1).concat([1, 2, 3].map((k) => T.lap2[0] + k * legDur2));
const endsOf = (e) => [[NODES[e[0]].x, NODES[e[0]].y], [NODES[e[1]].x, NODES[e[1]].y]];

/* ship position on the loop: {x, y, heading} */
function shipAt(t) {
  let leg = 0, v = 0;
  if (t < T.lap1[0]) { leg = 0; v = 0; }
  else if (t < T.lap1[1]) { const k = (t - T.lap1[0]) / legDur1; leg = Math.floor(k); v = k - leg; }
  else if (t < T.lap2[0]) { leg = 2; v = 1; }
  else if (t < T.lap2[1]) { const k = (t - T.lap2[0]) / legDur2; leg = Math.floor(k); v = k - leg; }
  else { leg = 2; v = 1; }
  leg = Math.min(leg, 2);
  const e = EDGES[LOOP[leg]], [A, B] = endsOf(e), L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const u0 = DOCK_TRIM / L, u = K.lerp(u0, 1 - u0, K.E.inOut(K.clamp(v, 0, 1)));
  const p = K.edgePoint(A, B, e[3], u);
  return { x: p[0] + 30, y: p[1] + 50, heading: p[2], moving: v > 0 && v < 1 };
}
const arrivedCount = (t) => ARRIVALS.filter((a) => t >= a).length;

const camB = K.mkTrack([
  [T.iris[0], { x: 1350, y: 250, z: 1.45 }],
  [T.iris[1], { x: 1350, y: 330, z: 1.25 }],
  [at(3, 0.4), { x: 1310, y: 930, z: 0.6 }],
  [T.hot, { x: 1310, y: 900, z: 0.63 }],
  [T.lap1[0] + 0.1, { x: 1300, y: 700, z: 0.74 }],
  [T.lap2[0], { x: 1300, y: 690, z: 0.8 }],
]);
function camChart(t) {
  const c = camB(t), s = shipAt(t), k = K.ss(T.lap2[1] - 0.6, T.lap2[1] + 0.5, t);
  return { x: K.lerp(c.x, s.x - 10, k), y: K.lerp(c.y, s.y - 120, k), z: K.lerp(c.z, 2.3, k), rot: 0 };
}

/* crab pose in the chart view: at the helm, dancing once the money comes in */
function crabChart(t) {
  const b = pulseB(t), rich = K.ss(T.lap2[0], T.lap2[0] + 0.5, t);
  const st = { seed: 500, blink: K.blinkAt(t, 5), mouth: rich > 0.5 ? "grin" : "smile", look: [0.6, -0.2], squash: 0.12 * b - 0.04 };
  st.clawL = { x: -62, y: -44, open: 0.15 };
  st.clawR = { x: 92, y: -70 - 18 * b, open: 0.3 + 0.4 * b };
  if (rich > 0) {
    st.clawL = { x: -100, y: K.lerp(-44, -150 - 20 * b, rich), open: 0.3 + 0.6 * b };
    st.clawR = { x: 100, y: K.lerp(-70, -150 - 20 * K.pulse(t + 0.25, 1, 6), rich), open: 0.3 + 0.6 * b };
    st.hop = 14 * b * rich; st.lean = 6 * Math.sin(t * Math.PI * 2) * rich;
  }
  return st;
}

function drawChart(t) {
  const cam = camChart(t);
  K.cam = cam; K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 5 });
  const hotK = K.ss(T.hot - 0.1, T.hot + 0.3, t);
  /* routes under islands */
  EDGES.forEach((e, i) => {
    const [A, B] = endsOf(e), inLoop = LOOP.indexOf(i) >= 0;
    const p = K.E.out3(K.inv(e[4], e[4] + 0.7, t));
    const state = hotK > 0.5 ? (inLoop ? "hot" : "dim") : "plain";
    K.edge(ctx, A, B, { p, bend: e[3], label: e[2], seed: 100 + i * 13, trim: EDGE_TRIM, state, w: 10, labelSize: 46, lu: e[5] || 0.5 });
  });
  /* islands */
  Object.keys(NODES).forEach((k, i) => {
    const n = NODES[k], a = K.inv(n.pop - 0.05, n.pop + 0.45, t);
    const hot = (k === "USDT" || k === "BTC" || k === "ETH") ? hotK * (0.7 + 0.3 * pulseB(t)) : 0;
    const dim = (k === "SOL" || k === "EUR") ? 1 - 0.35 * hotK : 1;
    ctx.save(); ctx.globalAlpha = dim;
    K.node(ctx, n.x, n.y, NODE_S, { label: k, color: n.c, a, seed: n.seed, palms: n.palms, lighthouse: n.lighthouse, hot });
    ctx.restore();
  });
  /* the ship */
  const s = shipAt(t), n = arrivedCount(t);
  K.miniShip(ctx, s.x, s.y, 0.6, { heading: s.heading, coins: Math.min(26, 3 + n * 4), crab: (c) => K.crab(c, 0, 0, 1, crabChart(t)) });
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
  const plankA = K.inv(T.hot + 0.25, T.hot + 0.75, t);
  if (plankA > 0) {
    const bumpT = ARRIVALS.filter((a) => t >= a).pop(), bump = bumpT ? Math.exp(-8 * (t - bumpT)) : 0;
    const gain = n >= 6 ? "+0.92 %" : n >= 3 ? "+0.46 %" : "";
    ctx.save(); ctx.translate(1320, 640); ctx.scale(1 + 0.12 * bump, 1 + 0.12 * bump);
    K.plank(ctx, 0, 0, 640, gain ? 190 : 130, gain ? [HOLD[n], gain] : [HOLD[n]], { a: plankA, size: 56, seed: 11, colors: [P.ink, "#2f8a3e"] });
    ctx.restore();
  }
}
