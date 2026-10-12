/* ============================================================
   INTRO 30 TABLE: the booth table set (8.15 - 16.2 s).
   World strip: menu set at x 0..1920, AMM counter at x 2400..4320.
   8.15  "Read the book": the order book is the menu card; rows pop on
         half beats, the magnifier reads them (zoomed inside the lens).
   9.75  second "read the book": best ask, best bid, spread tag.
   10.95 whip pan to the AMM scale (x * y = k) and the placemat curve.
   12.96 1 ETH drops into the pool: beam tips, 1 818 USDC pop out, the
         price on the curve slides 2 000 -> 1 653.
   19.39 Nibbs slams the order bell ("rings the matching bell").
   22.22 whip pan to two order rails: "Latency knows it well" - Slyce zips his
         ticket to the finish in 4 ms, the victim's ticket crawls in at 120 ms.
   ============================================================ */
const TABLE_Y = 800, AMM_X = 2400, RACE_X = 4800;
const BOOK = [
  ["USDC", "ETH"],
  ["2 016", "1.2"], ["2 012", "4.1"], ["2 008", "2.5"],
  ["2 004", "3.0"], ["2 001", "6.2"], ["1 997", "2.2"],
];
const BOOK_COL = [null, P.ask, P.ask, P.ask, P.bid, P.bid, P.bid];
const BOOK_BAR = [0, 0.19, 0.66, 0.4, 0.48, 1, 0.35];
const BOOK_BARC = [null, P.cherryLight, P.cherryLight, P.cherryLight, P.mint, P.mint, P.mint];
const MENU = { x: 1260, y: 440, cols: [260, 190], size: 44, rowH: 68, head: 90 };

const camTable = K.mkTrack([
  [T.slap[1], { x: 960, y: 540, z: 1.04 }],
  [T.read2, { x: 960, y: 540, z: 1.0 }],
  [T.whip[0], { x: 990, y: 540, z: 1.02 }],
  [T.whip[1], { x: AMM_X + 960, y: 540, z: 1.0 }],
  [T.trade, { x: AMM_X + 960, y: 530, z: 1.03 }],
  [T.ding, { x: AMM_X + 1080, y: 560, z: 1.12 }],
  [T.raceWhip[0], { x: AMM_X + 1110, y: 560, z: 1.1 }],
  [T.raceWhip[1], { x: RACE_X + 960, y: 540, z: 1.0 }],
  [T.doors[1], { x: RACE_X + 1000, y: 530, z: 1.06 }],
]);

/* curve data (thousands): y = 200 / x, ETH 5..20 */
const CURVE = Array.from({ length: 31 }, (_, i) => { const x = 5 + i * 0.5; return [x, 200 / x]; });
const tradeU = (t) => E.inOut(inv(T.trade, T.trade + 0.55, t));

function bookHi(t) {
  if (t < T.read2) return -1;
  return t < T.read2 + 2 * BEAT ? 3 : 4;
}
function drawMenu(t) {
  const shown = inv(T.rows - 0.05, T.rows + 6 * BEAT / 2, t);
  const bars = BOOK_BAR.map((b, i) => b * E.out3(inv(T.rows + i * BEAT / 2, T.rows + i * BEAT / 2 + 0.5, t)));
  K.menu(ctx, MENU.x, MENU.y, MENU.cols, BOOK, { a: 1, size: MENU.size, rowH: MENU.rowH, seed: 21, reveal: Math.max(1 / 7, shown), hi: bookHi(t), rowColors: BOOK_COL, bars, barColors: BOOK_BARC, title: "ETH · USDC" });
  /* spread tag between best ask and best bid */
  const sa = inv(T.read2 + BEAT, T.read2 + BEAT + 0.4, t);
  const rowY = (ri) => MENU.y - (7 * MENU.rowH + 60 + MENU.head) / 2 + 30 + MENU.head + ri * MENU.rowH + MENU.rowH / 2;
  if (sa > 0) {
    const y = (rowY(3) + rowY(4)) / 2, x0 = MENU.x + (MENU.cols[0] + MENU.cols[1] + 60) / 2;
    K.rule(ctx, [[x0 + 10, rowY(3)], [x0 + 26, rowY(3)], [x0 + 26, rowY(4)], [x0 + 10, rowY(4)]], { stroke: P.ink, w: 5, boil: 0.6, seed: 66, alpha: Math.min(1, sa * 2) });
    K.tag(ctx, x0 + 110, y, "Δ 4", { a: sa, seed: 67, size: 40, hot: true });
  }
  return rowY;
}
function nibbsTable(t, rowY) {
  const st = { blink: K.blinkAt(t, 5), mouth: "smile", cheeks: 0.3, hold: "magnifier", magS: 1.5, seed: 700 };
  const land = t - T.slap[1];
  st.squash = land < 0.4 ? 0.3 * Math.exp(-land * 8) * Math.cos(land * 20) : 0.07 * K.pulse(t, 1, 6);
  /* the lens walks down the rows, half a beat per row: solve paw height + angle so the
     glass sits on the row (arm length L = handle + ring, in world px) */
  const row = K.clamp((t - T.rows) / (BEAT / 2), 0, 6);
  let rowI = Math.min(6, Math.max(1, Math.round(row)));
  if (t > T.read2) rowI = bookHi(t);
  const x = 760, y = TABLE_Y + 10, s = 1.9, Lm = 100 * 1.6 * s;
  const ty = rowY(rowI) + Math.sin(t * 3) * 4, shoulderY = y + (-100 + 34) * s;
  const pawY = K.clamp(ty + 130, shoulderY - 110, shoulderY + 40), ang = Math.asin(K.clamp((ty - pawY) / Lm, -0.95, 0.95));
  st.hold = "magnifier"; st.magS = 1.6; st.magAng = (ang * 180) / Math.PI;
  st.pawR = { x: 100, y: (pawY - y) / s };
  st.pawL = { x: -80, y: -60 };
  st.look = [1, K.clamp((ty - shoulderY) / 300, -1, 1)];
  if (t > T.read2 && t < T.read2 + 0.5) { st.mouth = "open"; st.eyeUp = 4; st.brow = 1; }
  if (t > T.read2 + BEAT) { st.mouth = "grin"; st.pawL = { x: -90, y: -150 - 20 * K.pulse(t, 1, 6) }; }
  K.hamster(ctx, x, y, s, st);
}

function drawAmm(t) {
  const u = tradeU(t), pop = inv(T.amm, T.amm + 0.45, t);
  const tilt = K.lerp(0, -9, E.back(inv(T.trade, T.trade + 0.5, t), 2.6)) + Math.sin(t * 2.4) * 0.6;
  const xr = K.lerp(10, 11, u), yr = 200 / xr;
  const plaque = inv(T.trade + 0.2, T.trade + 0.3, t) > 0 ? "11 · 18 182" : "10 · 20 000";
  K.ammScale(ctx, AMM_X + 560, TABLE_Y + 20, 1.0, { a: pop, nX: t > T.trade ? 7 : 6, nY: t > T.trade + 0.15 ? 4 : 6, tilt, seed: 81, plaque, labelX: "ETH", labelY: "USDC" });
  /* placemat with the constant-product curve */
  const pm = K.placemat(ctx, AMM_X + 1260, 390, 600, 470, [{ xy: CURVE, color: P.cherry, kind: "xy" }], {
    a: inv(T.amm + BEAT, T.amm + BEAT + 0.45, t), draw: E.inOut(inv(T.amm + 0.3, T.amm + 1.5, t)), title: "x · y = k",
    xMin: 4, xMax: 21, yMin: 0, yMax: 42, marker: t > T.amm + 1.3 ? { x: xr, y: yr } : null, seed: 41,
  });
  if (t > T.amm + 0.6) {
    const pa = inv(T.amm + 0.6, T.amm + 1.0, t);
    K.text(ctx, "ETH", AMM_X + 1260 + 300 - 80, 390 + 235 - 62, { size: 28, weight: 700, font: K.FONT.mono, fill: P.inkSoft, alpha: pa });
    K.text(ctx, "USDC", AMM_X + 1260 - 300 + 50, 390 - 235 + 100, { size: 28, weight: 700, font: K.FONT.mono, fill: P.inkSoft, alpha: pa, align: "left" });
  }
  if (t > T.amm + 1.3) { /* price tag follows the marker */
    const price = t > T.trade + 0.3 ? "1 653" : "2 000";
    const mx = pm.X(xr), my = pm.Y(yr);
    K.tag(ctx, mx + 110, my - 70, price, { a: inv(T.amm + 1.3, T.amm + 1.7, t), seed: 88, size: 36, hot: t > T.trade + 0.3, fill: t > T.trade + 0.3 ? P.cherry : null, color: t > T.trade + 0.3 ? P.cream : null });
  }
  /* the bell lives on the counter in front of the placemat */
  const ring = t > T.ding ? Math.max(0, 1 - (t - T.ding) / 1.2) : 0;
  K.bell(ctx, AMM_X + 1560, TABLE_Y + 70, 0.85, ring, 400);
}
function ammOverlay(t) {
  /* 1 ETH drops into the left pan; USDC coins hop out of the right pan (screen space) */
  const pans = K.ammPans; if (!pans) return;
  K.screen(ctx);
  const d = inv(T.trade - 0.4, T.trade, t);
  if (d > 0 && d < 1) K.coin(ctx, pans[0].x, K.lerp(-80, pans[0].y - 40, E.in3(d)), 34, { color: P.ETH, label: "E", labelColor: P.cream, seed: 777, size: 28 });
  if (d >= 1 && t < T.trade + 0.3) K.burst(ctx, pans[0].x, pans[0].y - 40, 80 * (1 - inv(T.trade, T.trade + 0.3, t)), { seed: 778, color: P.mustard, spikes: 9 });
  for (let i = 0; i < 2; i++) {
    const u = inv(T.trade + 0.15 + i * 0.12, T.trade + 0.75 + i * 0.12, t); if (u <= 0 || u >= 1) continue;
    K.coin(ctx, K.lerp(pans[1].x, pans[1].x + 380 + i * 60, u), K.lerp(pans[1].y - 30, pans[1].y + 100, u) - Math.sin(u * Math.PI) * 260, 30, { color: P.USDC, label: "U", labelColor: P.cream, seed: 790 + i, size: 26 });
  }
}
function nibbsAmm(t) {
  const st = { blink: K.blinkAt(t, 9), mouth: "smile", cheeks: 0.3, seed: 700 };
  const step = inv(T.bellUp - 0.5, T.bellUp - 0.1, t);
  const x = K.lerp(AMM_X + 1720, AMM_X + 1690, E.inOut(step)), y = TABLE_Y + 40 - Math.sin(step * Math.PI) * 50, s = 1.55;
  st.squash = 0.07 * K.pulse(t, 1, 6);
  st.hold = "magnifier"; st.magHand = "L"; st.magS = 1.3; st.magAng = 158 + Math.sin(t * 2.6) * 4; st.pawL = { x: -100, y: -90 };
  st.pawR = { x: 80, y: -50 };
  st.look = [-1, 0];
  if (t > T.trade && t < T.trade + 0.8) { st.mouth = "o"; st.eyeUp = 4; st.brow = 1; }
  if (t > T.trade + 0.8) { st.mouth = "grin"; }
  if (step > 0) { st.magAng = K.lerp(158, 120, step); st.pawL = { x: -60, y: -60 }; st.lean = -10 * Math.sin(step * Math.PI); }
  if (t > T.bellUp - 0.1) { /* raise, then slam the bell on the downbeat */
    const r = inv(T.bellUp - 0.1, T.ding - 0.08, t), sl = inv(T.ding - 0.08, T.ding, t);
    const bx = (AMM_X + 1560 - x) / s, by = (TABLE_Y + 70 - 120 * 0.85 - y) / s;
    st.pawR = { x: K.lerp(80, bx + 10, r), y: K.lerp(-60, by - 120, E.out3(r)) + 124 * E.in3(sl) };
    st.squash = r < 1 ? -0.15 * r : 0.35 * Math.exp(-(t - T.ding) * 7);
    st.mouth = sl > 0 ? "open" : "grin"; st.brow = 1.2 * sl; st.blink = sl > 0 && t < T.ding + 0.25 ? 1 : st.blink;
  }
  K.hamster(ctx, x, y, s, st);
}

function drawTable(t) {
  K.cam = Object.assign({ rot: 0 }, camTable(t));
  if (t > T.ding && t < T.ding + 0.35) { const k = 1 - inv(T.ding, T.ding + 0.35, t); K.cam.x += K.hs(K.bf, 5) * 14 * k; K.cam.y += K.hs(K.bf, 6) * 10 * k; }
  K.applyCam(ctx, 1);
  drawTableWorld(t, true);
  /* magnifier lens on the menu: the book again at 1.6x inside the glass */
  if (t < T.whip[0] && K.lens) {
    const L = K.lens, c = K.cam, m = 1.6, z2 = c.z * m, wx = c.x + (L.x - 960) / c.z, wy = c.y + (L.y - 540) / c.z, saved = K.cam;
    K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.arc(L.x, L.y, L.r * 0.97, 0, K.TAU); ctx.clip();
    K.cam = { x: wx - (L.x - 960) / z2, y: wy - (L.y - 540) / z2, z: z2, rot: 0 };
    K.applyCam(ctx, 1); drawTableWorld(t, false);
    ctx.restore(); K.cam = saved;
    K.screen(ctx); ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = "#cdeff6"; ctx.beginPath(); ctx.arc(L.x, L.y, L.r * 0.97, 0, K.TAU); ctx.fill(); ctx.restore();
    K.line(ctx, [[L.x - L.r * 0.55, L.y - L.r * 0.2], [L.x - L.r * 0.35, L.y - L.r * 0.55], [L.x - L.r * 0.05, L.y - L.r * 0.7]], { stroke: "#ffffff", w: 8, boil: 0.5, seed: 77, alpha: 0.85 });
  }
  if (t > T.whip[0] - 0.1 && t < T.raceWhip[0]) ammOverlay(t);
  /* whip pan streaks */
  const wu = Math.max(inv(T.whip[0], T.whip[1], t) * (t < T.whip[1] ? 1 : 0), t > T.raceWhip[0] && t < T.raceWhip[1] ? inv(T.raceWhip[0], T.raceWhip[1], t) : 0);
  if (wu > 0 && wu < 1) {
    K.screen(ctx); const a = Math.sin(wu * Math.PI);
    for (let i = 0; i < 14; i++) { const y = 60 + i * 72 + K.hs(i, K.bf) * 20, l = 500 + 600 * K.hash(i + 3, K.bf); const x = 960 + K.hs(i + 9, K.bf) * 700; K.line(ctx, [[x - l / 2, y], [x + l / 2, y]], { stroke: i % 3 ? P.cream : P.ink, w: 10, boil: 0.4, seed: 500 + i, alpha: a * 0.85 }); }
  }
  /* the ding flash */
  if (t > T.ding && t < T.ding + 0.5) {
    const k = inv(T.ding, T.ding + 0.5, t), b = K.toScreen(AMM_X + 1560, TABLE_Y - 30);
    K.screen(ctx);
    K.speedLines(ctx, b[0], b[1], 170, 700, 22, 1 - k, 40);
    K.burst(ctx, b[0], b[1] - 40, 150 * E.back(Math.min(1, k * 4), 2) * (1 - k), { seed: 620, spikes: 14, color: P.mustard });
  }
}
function drawTableWorld(t, full) {
  K.booth(ctx, -400, RACE_X + 2400, -200, TABLE_Y - 40, 5);
  K.formica(ctx, -400, RACE_X + 2400, TABLE_Y - 40, 120, 7);
  K.counter(ctx, -400, RACE_X + 2400, TABLE_Y + 80, 300, { seed: 41, top: 18 });
  /* napkin dispenser + ketchup: diner clutter behind the menu */
  K.shape(ctx, K.roundRectPts(1700, TABLE_Y - 150, 120, 140, 14), { fill: P.chrome, w: 5, boil: 1, seed: 90, misreg: false, shade: { color: P.chromeDark, dx: 14, dy: 0, dots: false }, shine: true });
  K.shape(ctx, [[1850, TABLE_Y - 20], [1850, TABLE_Y - 150], [1870, TABLE_Y - 190], [1890, TABLE_Y - 190], [1910, TABLE_Y - 150], [1910, TABLE_Y - 20]], { fill: P.cherry, w: 5, boil: 1, seed: 91, shine: true });
  const rowY = drawMenu(t);
  if (full && t < T.whip[1]) nibbsTable(t, rowY);
  if (t > T.whip[0] - 0.1 && t < T.raceWhip[1] + 0.1) { drawAmm(t); if (full) nibbsAmm(t); }
  if (t > T.raceWhip[0] - 0.1) drawRace(t, full);
}

/* ---------- latency race: two order rails, a stopwatch, a finish post ---------- */
const RAIL_A = 430, RAIL_B = 640, R0 = RACE_X + 560, R1 = RACE_X + 1480;
function drawRace(t, full) {
  K.stopwatch(ctx, RACE_X + 300, 330, 125, Math.max(0, t - T.raceGo) / 1.6, 450);
  [RAIL_A, RAIL_B].forEach((y, i) => K.ticketRail(ctx, R0 - 40, R1 + 60, y, 310 + i * 3));
  /* finish post: checker strip */
  K.shape(ctx, K.rectPts(R1 + 30, RAIL_A - 90, 40, RAIL_B - RAIL_A + 260, 4), { fill: P.cream, w: 5, boil: 0.9, seed: 330, misreg: false });
  ctx.save(); ctx.fillStyle = P.ink; for (let j = 0; j < 14; j++) ctx.fillRect(R1 + 30 + (j % 2) * 20, RAIL_A - 90 + j * 25, 20, 25); ctx.restore();
  /* the victim's ticket crawls along the lower rail */
  const vu = E.inOut(inv(T.raceGo, T.vicArrive, t));
  K.ticket(ctx, K.lerp(R0, R1 - 40, vu), RAIL_B + 6, 0.9, { color: P.mint, label: "ETH", amt: "2.0", arrow: "up", gas: 1, seed: 230, tilt: Math.sin(t * 5) * 0.05 });
  /* Slyce zips his ticket along the upper rail (anticipation crouch, then a dash) */
  const su = E.in3(inv(T.raceGo, T.slyArrive, t)), land = t - T.slyArrive;
  const sx = K.lerp(R0, R1 - 40, su) + (land > 0 ? Math.sin(Math.min(1, land * 4) * Math.PI) * 18 : 0);
  K.ticket(ctx, sx, RAIL_A + 6, 0.9, { color: P.cherry, label: "ETH", amt: "9.5", arrow: "up", gas: 3, seed: 240, tilt: su > 0 && su < 1 ? 0.25 : Math.sin(t * 6) * 0.04 });
  const bst = { glow: 0.8, grin: 1, seed: 900, armL: { x: -90, y: -120 }, armR: { x: 90, y: -120 }, look: 1 };
  if (t < T.raceGo) { bst.squash = 0.3 * inv(T.raceGo - 0.3, T.raceGo, t); bst.look = Math.sin(t * 3); }
  if (su > 0 && su < 1) { bst.lean = -22; bst.squash = -0.15; bst.armL = { x: -130, y: -200 }; for (let i = 0; i < 4; i++) K.line(ctx, [[sx - 120 - 260 * K.hash(i, K.bf), RAIL_A - 140 + i * 30], [sx - 110, RAIL_A - 140 + i * 30]], { stroke: P.ink, w: 6, boil: 0.5, seed: 340 + i }); }
  if (land > 0) { bst.squash = 0.3 * Math.exp(-land * 8); bst.armR = { x: 110, y: -230 }; bst.look = -1; }
  K.sandwichBot(ctx, sx, RAIL_A - 14, 0.72, bst);
  if (land > 0) {
    K.burst(ctx, R1 + 50, RAIL_A - 40, 90 * E.back(Math.min(1, land * 4), 2) * (1 - inv(0.3, 0.6, land)), { seed: 350, spikes: 11 });
    K.tag(ctx, R1 - 230, RAIL_A + 90, "4 ms", { a: inv(T.slyArrive + 0.05, T.slyArrive + 0.4, t), seed: 351, size: 44, fill: P.cherry, color: P.cream });
  }
  if (t > T.vicArrive) K.tag(ctx, R1 - 250, RAIL_B + 90, "120 ms", { a: inv(T.vicArrive, T.vicArrive + 0.35, t), seed: 352, size: 44, fill: P.mint });
  if (!full) return;
  /* Nibbs judges at the finish */
  const st = { blink: K.blinkAt(t, 13), mouth: "smile", cheeks: 0.3, seed: 700, hold: "magnifier", magS: 1.2, magAng: -72 + Math.sin(t * 2.4) * 4, pawR: { x: 90, y: -170 }, pawL: { x: -90, y: -60 }, look: [-1, -0.3] };
  st.squash = 0.07 * K.pulse(t, 1, 6);
  if (t > T.slyArrive) { const k = inv(T.slyArrive, T.slyArrive + 0.3, t); st.mouth = "o"; st.eyeUp = 5 * k; st.brow = 1.2 * k; st.squash = -0.2 * Math.exp(-(t - T.slyArrive) * 5); }
  if (t > T.vicArrive) { st.mouth = "frown"; st.brow = -1; st.eyeUp = 0; st.look = [-1, 0.5]; st.pawL = { x: -60, y: -40 }; }
  K.hamster(ctx, RACE_X + 1730, TABLE_Y + 40, 1.5, st);
}
