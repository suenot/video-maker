/* ============================================================
   INTRO 20 FLOOR SET: the neon trading floor, one continuous world.
   Used for the boot close-up, the pull-back, the team's ticket line and the
   dive into Beepo's face. Camera: monotone Hermite keys (never overshoot),
   moves start and land on beats.
   ============================================================ */
const FACE_W = [BEEPO_B[0], BEEPO_B[1] - BEEPO_S * 221]; /* world centre of Beepo's screen at rest */
const camKeys = K.mkTrack([
  [0, { x: BEEPO_A[0] + 20, y: BEEPO_A[1] - 285, z: 2.15 }],
  [T.hop, { x: BEEPO_A[0] + 30, y: BEEPO_A[1] - 300, z: 2.0 }],
  [T.hop + 0.45, { x: BEEPO_A[0] + 60, y: BEEPO_A[1] - 380, z: 1.5 }],
  [T.pullBack[1], { x: 1180, y: 600, z: 0.95 }],
  [T.follow[0], { x: 1300, y: 605, z: 0.95 }],
  [T.trade + 0.3, { x: 2360, y: 620, z: 0.9 }],
  [T.dive[0], { x: 2340, y: 625, z: 0.92 }],
]);
function camFloor(t) {
  if (t < T.dive[0]) return Object.assign({ rot: 0 }, camKeys(t));
  /* dive: zoom in log space so the rush feels even, centre slides onto the face */
  const u = K.E.in3(K.inv(T.dive[0], T.dive[1], t)), c0 = camKeys(T.dive[0]);
  const z = Math.exp(K.lerp(Math.log(c0.z), Math.log(DIVE_Z), u));
  const k = K.E.out3(K.inv(T.dive[0], T.dive[1] - 0.15, t));
  return { x: K.lerp(c0.x, FACE_W[0], k), y: K.lerp(c0.y, FACE_W[1], k), z, rot: 0 };
}
/* zoom at which the face screen is wider than the frame (132 px screen x scale) */
const DIVE_Z = 2060 / (132 * BEEPO_S);

const CABLES = [
  [[380, 590], [380, 780], [1100, 870], [1640, 900], [HAND(0)[0] - 120, 1040]],
  [[470, 590], [470, 760], [1300, 830], [2050, 880], [HAND(1)[0] - 120, 1045]],
  [[560, 590], [560, 740], [1500, 800], [2500, 850], [HAND(2)[0] - 120, 1050]],
];

function drawFloor(t, cam) {
  K.begin(ctx, t, cam);
  K.applyCam(ctx, 1);
  const dusk = K.lerp(0.12, 1, K.ss(T.dayEnd[0], T.dayEnd[1], t));
  K.wall(ctx, WORLD.x0, WORLD.x1, -900, HORIZON, { seed: 3 });
  K.floorGrid(ctx, WORLD.x0, WORLD.x1, HORIZON, 1400, { vx: 1600, scroll: t * 0.5, rows: 16, cols: 40, spread: 300 });
  /* ceiling neon strip */
  K.neon(ctx, [[WORLD.x0, -60], [WORLD.x1, -60]], { color: P.pink, w: 8, on: K.flick(t, 4, 0.25), seed: 4, boil: 0 });
  /* LED tape over the wall chart */
  K.ledTape(ctx, SCREEN_BIG.x - 10, SCREEN_BIG.y - 116, SCREEN_BIG.w + 20, 64, TAPE, { speed: 150 });
  /* wall chart: candles draw on "Beep boop", a green line runs when the signals run */
  const draw = K.inv(T.chart, T.chart + 2.2 * BEAT * 2, t);
  K.wallScreen(ctx, SCREEN_BIG.x, SCREEN_BIG.y, SCREEN_BIG.w, SCREEN_BIG.h, (c, w, h) => {
    K.plot(c, w, h, [{ kind: "candle", data: CANDLES }], { draw: 0.25 + 0.75 * draw, yMin: 36, yMax: 62, title: "NVDA  1H", seed: 41 });
  }, { seed: 12, glow: P.green });
  /* the window: dusk falls during the trading day */
  K.skyWindow(ctx, WINDOW.x, WINDOW.y, WINDOW.w, WINDOW.h, { dusk, seed: 7 });
  /* wall clock runs 09:30 -> 16:00 */
  const mins = Math.round(K.lerp(9 * 60 + 30, 16 * 60, K.inv(T.dayEnd[0], T.dayEnd[1], t)));
  const hh = String(Math.floor(mins / 60)).padStart(2, "0"), mm = String(mins % 60).padStart(2, "0");
  K.scoreboard(ctx, CLOCK.x + CLOCK.w / 2, CLOCK.y + CLOCK.h / 2, CLOCK.w, CLOCK.h, [{ v: hh + ":" + mm, c: P.cyan }], { seed: 14 });
  const pnl = pnlAt(t);
  K.scoreboard(ctx, PNL.x + PNL.w / 2, PNL.y + PNL.h / 2, PNL.w, PNL.h, [{ v: pnl.v, c: P.green }], { seed: 15, label: "PNL", bump: pnl.bump });
  /* pneumatic tube to the exchange */
  K.shape(ctx, K.rrPts(TUBE.x - 46, TUBE.top, 92, TUBE.y - TUBE.top - 220, 40, 3), { fill: K.rgba(P.cyan, 0.12), w: 7, boil: 0.6, seed: 21, rim: { color: P.cyan, dx: 6, dy: 0, a: 0.5 }, gloss: 0.4 });
  K.shape(ctx, K.rrPts(TUBE.x - 80, TUBE.y - 260, 160, 120, 30, 3), { fill: P.metalDark, w: 6, boil: 0.6, seed: 22, rim: { color: P.violet, a: 0.8 }, dots: { gap: 11, r: 2.4, alpha: 0.3 } });
  K.shape(ctx, K.ellipsePts(TUBE.x, TUBE.y - 200, 50, 26, 16), { fill: P.ink, w: 5, boil: 0.4, seed: 23 });
  TICKETS.forEach((tk, i) => { /* whoosh up the tube */
    const t0 = tk.t + 4.6 * BEAT, u = K.inv(t0, t0 + 0.5, t);
    if (u > 0 && u < 1) { const y = K.lerp(TUBE.y - 260, TUBE.top - 40, K.E.in3(u)); K.glow(ctx, TUBE.x, y, 60, K.rgba(P.yellow, 0.9), 1); K.dot(ctx, TUBE.x, y, 16, P.paper, P.ink, 4, 30 + i); }
    K.sparks(ctx, TUBE.x, TUBE.y - 210, t0, { seed: 90 + i, r: 120 });
  });
  /* cables: dark until the signals run, then lit with travelling pulses */
  CABLES.forEach((pts, i) => {
    const lit = K.inv(T.signals, T.signals + 0.3, t);
    const pulses = [];
    if (t >= T.signals) for (let k = 0; k < 3; k++) pulses.push(((t - T.signals) * 0.42 - k * 0.33 - i * 0.07));
    K.cable(ctx, pts, { color: [P.cyan, P.pink, P.yellow][i], lit: lit * 0.7, pulses: pulses.filter((u) => u >= 0 && u <= 1), seed: 41 + i * 9 });
  });
  /* team (behind Beepo) and their stations */
  TEAM.forEach((m, i) => {
    K.shape(ctx, K.ellipsePts(m.x, m.y + 6, 90, 18, 14), { fill: P.ink, stroke: null, w: 0, boil: 0.3, seed: 60 + i, alpha: 0.6 });
    K.robot(ctx, m.x, m.y, m.s, teamPose(i, t));
  });
  /* tickets in flight */
  TICKETS.forEach((tk, i) => {
    const s = ticketState(tk, t); if (!s) return;
    K.ticket(ctx, s.x, s.y, 1.0, { sym: tk.sym, dir: tk.dir, qty: tk.qty, stamp: s.stamp, rot: s.rot, a: s.a, seed: 70 + i });
    if (s.stamp > 0 && s.stamp < 1) K.sparks(ctx, s.x + 30, s.y, tk.t + 2 * BEAT, { seed: 120 + i, r: 90, n: 8, color: P.green });
  });
  /* Beepo */
  const bp = beepoPos(t);
  K.shape(ctx, K.ellipsePts(bp[0], bp[1] + 6, 100, 20, 14), { fill: P.ink, stroke: null, w: 0, boil: 0.3, seed: 66, alpha: 0.6 });
  K.beepo(ctx, bp[0], bp[1], BEEPO_S, beepoPose(t));
  /* landing dust: pixel sparks */
  K.sparks(ctx, bp[0], bp[1] - 10, T.hop + 0.5, { seed: 140, r: 150, n: 12, color: P.cyan });
  K.sparks(ctx, bp[0], bp[1] - 10, T.hopOver[1], { seed: 150, r: 150, n: 12, color: P.pink });
}
