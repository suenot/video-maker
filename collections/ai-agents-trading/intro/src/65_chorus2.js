/* ============================================================
   INTRO 65 CHORUS 2: the same four lines, new pictures.
     bar 18 "Beep boop, the signals run"       the agent network: pods pop on beats, the hot path runs
     bar 20 "Agents trade till the day is done" end of day: desks, equity curve, the 16:00 bell
     bar 22 "Observe, decide, then act again"  the loop ring on the floor, a bot on each pad
   (bar 24, "AI Agents for Trading", is the final title card in 50_title.js.)
   ============================================================ */
const NET = [
  { p: [700, 300], icon: "eye", c: P.cyan, t: at(18, 0) },
  { p: [1080, 160], icon: "chat", c: P.violet, t: at(18, 1) },
  { p: [1280, 430], icon: "brain", c: P.pink, t: at(18, 2) },
  { p: [1660, 250], icon: "shield", c: P.orange, t: at(18, 3) },
  { p: [1640, 640], icon: "bolt", c: P.yellow, t: at(19, 0) },
  { p: [1010, 660], icon: "coin", c: P.green, t: at(19, 1) },
];
const NET_E = [[0, 2], [1, 2], [2, 3], [3, 4], [2, 4], [4, 5], [0, 5]];
const NET_HOT = [[0, 2], [2, 3], [3, 4], [4, 5]];
const HOT_T = at(19, 2);

function singer(t, x, y, s) {
  const b = pulseB(t);
  K.shape(ctx, K.ellipsePts(x, y + 6, 100 * s, 20, 14), { fill: P.ink, stroke: null, w: 0, boil: 0.3, seed: 66, alpha: 0.6 });
  K.beepo(ctx, x, y, s, { blink: K.blinkAt(t, 9), mouth: "talk", talk: 0.3 + 0.7 * b, eyes: b > 0.7 ? "happy" : "dot", look: [1, -0.6], squash: 0.1 * b - 0.04, bulb: b, chest: b,
    armL: { x: -120, y: -170 - 30 * b, open: 0.5 }, armR: { x: 180, y: -330 - 10 * b, open: 0.1 }, lean: -3 + 3 * Math.sin(t * 3) });
}

function drawNet(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: K.tw(t, at(18), at(20), 1.0, 1.06, K.E.inOut), rot: 0 });
  K.applyCam(ctx, 1);
  K.wall(ctx, -200, 2120, -200, 820, { seed: 23, panel: 200 });
  K.floorGrid(ctx, -200, 2120, 820, 500, { vx: 960, scroll: t * 0.7, rows: 10, cols: 30, spread: 220, color: P.cyan });
  /* the hologram field behind the graph */
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = K.rgba(P.cyan, 0.05);
  for (let y = 60; y < 800; y += 8) ctx.fillRect(560, y, 1260, 3); ctx.restore();
  const hot = t >= HOT_T;
  NET_E.forEach((e, i) => {
    const A = NET[e[0]], B = NET[e[1]], t0 = Math.max(A.t, B.t) + 0.15, p = K.E.out3(K.inv(t0, t0 + 0.4, t));
    const isHot = hot && NET_HOT.some((h) => h[0] === e[0] && h[1] === e[1]) && t > HOT_T + NET_HOT.findIndex((h) => h[0] === e[0] && h[1] === e[1]) * BEAT / 2;
    K.edge(ctx, A.p, B.p, { p, state: isHot ? "hot" : hot ? "dim" : "plain", bend: 30 * (i % 2 ? 1 : -1), seed: 500 + i * 7, color: A.c, trim: 85 });
  });
  NET.forEach((n, i) => {
    const lit = hot && NET_HOT.some((h, k) => (h[0] === i || h[1] === i) && t > HOT_T + k * BEAT / 2);
    K.node(ctx, n.p[0], n.p[1], 1, { icon: n.icon, color: n.c, r: 72, a: K.inv(n.t, n.t + 0.35, t), hot: lit ? 0.7 + 0.3 * pulseB(t) : 0, seed: 520 + i * 5 });
    K.sparks(ctx, n.p[0], n.p[1], n.t, { seed: 540 + i, r: 130, n: 8, color: n.c });
  });
  K.tag(ctx, NET[5].p[0] + 150, NET[5].p[1] + 90, "+1.2%", { a: K.inv(HOT_T + 4 * BEAT / 2, HOT_T + 4 * BEAT / 2 + 0.3, t), hot: true, size: 28, seed: 560 });
  singer(t, 330, 1060, 1.45);
}

/* ---------- end of the trading day ---------- */
const EQUITY = [100, 101.2, 100.7, 102.4, 103.1, 102.6, 104.8, 105.5, 105.1, 107.3, 108.9, 109.8];
const EOD_BOTS = [
  { kind: "analyst", x: 330, s: 0.95, seed: 811 },
  { kind: "risk", x: 750, s: 0.95, seed: 833 },
  { kind: "lead", x: 1170, s: 1.05, seed: 700 },
  { kind: "trader", x: 1590, s: 0.95, seed: 857 },
];
const BELL = at(21, 2);
function drawEOD(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: K.tw(t, at(20), at(22), 1.05, 1.0, K.E.out3), rot: 0 });
  K.applyCam(ctx, 1);
  K.wall(ctx, -200, 2120, -200, 780, { seed: 33 });
  K.floorGrid(ctx, -200, 2120, 780, 500, { vx: 960, scroll: t * 0.5, rows: 10, cols: 30, spread: 220 });
  K.skyWindow(ctx, -40, 60, 420, 420, { dusk: K.lerp(0.75, 1, K.inv(at(20), BELL, t)), seed: 37 });
  K.monitorChart(ctx, 900, 300, 940, 400, [{ data: EQUITY, color: P.green }], { draw: K.inv(at(20), BELL, t), title: "EQUITY", seed: 610, yMin: 99, yMax: 111 });
  const mins = Math.round(K.lerp(14 * 60, 16 * 60, K.inv(at(20), BELL, t))), clk = String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  const ring = t > BELL ? (Math.floor((t - BELL) * 6) % 2 ? 0.35 : 1) : 1;
  K.scoreboard(ctx, 1660, 170, 330, 120, [{ v: clk, c: t > BELL ? P.yellow : P.cyan }], { seed: 611, bump: K.inv(BELL, BELL + 0.35, t) });
  if (t > BELL) K.glow(ctx, 1660, 170, 260, K.rgba(P.yellow, 0.6), ring * (1 - K.inv(BELL + 1.2, BELL + 2, t)));
  K.sparks(ctx, 1660, 170, BELL, { seed: 612, r: 240, n: 16, color: P.yellow, size: 16 });
  K.scoreboard(ctx, 1660, 420, 330, 170, [{ v: t > BELL ? "+9.8%" : "+" + (3.4 + 6.4 * K.inv(at(20), BELL, t)).toFixed(1) + "%", c: P.green }], { label: "PNL", seed: 613, bump: K.inv(BELL, BELL + 0.35, t) });
  /* bots behind their desks: typing on every beat, cheering on the bell */
  EOD_BOTS.forEach((m, i) => {
    const b = K.pulse(t - i * 0.07, 1, 6), cheer = K.ss(BELL - 0.15, BELL + 0.1, t);
    const st = { kind: m.kind, seed: m.seed, blink: K.blinkAt(t, 41 + i * 5), look: [0, 0.6], eyes: "dot", mouth: m.kind === "lead" ? "talk" : "smile", talk: b, squash: 0.08 * b - 0.03, bulb: b, chest: b };
    const tap = Math.sin((t / BEAT) * Math.PI * 2 + i);
    st.armL = { x: -80, y: -110 + 18 * Math.max(0, tap), open: 0.2 }; st.armR = { x: 80, y: -110 + 18 * Math.max(0, -tap), open: 0.2 };
    if (cheer > 0) {
      st.armL = { x: -150, y: -320, open: 0.9 }; st.armR = { x: 150, y: -320, open: 0.9 }; st.eyes = i % 2 ? "dollar" : "happy"; st.mouth = "open"; st.look = [0, -0.6];
      st.hop = hopArc(t, BELL + i * 0.08, BELL + 0.5 + i * 0.08, 90); st.squash += land(t, BELL + 0.5 + i * 0.08, 0.35);
      if (st.hop > 0) st.squash = -0.15;
    }
    K.robot(ctx, m.x, 960, m.s, st);
    K.desk(ctx, m.x, 930, 300, { crt: false, seed: 620 + i * 9, accent: [P.cyan, P.orange, P.pink, P.trader][i] });
  });
  K.confetti(ctx, 0, 1920, -60, BELL, { n: 40, fall: 520, seed: 630 });
}

/* ---------- the loop ring on the floor ---------- */
const RING = { cx: 960, cy: 800, rx: 640, ry: 190 };
const RSTEP = [at(22, 0), at(22, 2), at(23, 0), at(23, 2), at(23, 3)];
const RPAD = (i) => { const a = ((-90 + 120 * i) * Math.PI) / 180; return [RING.cx + Math.cos(a) * RING.rx, RING.cy + Math.sin(a) * RING.ry]; };
const RBOTS = [
  { kind: "analyst", pad: 0, s: 0.82, seed: 811, icon: "eye", c: P.cyan, hold: { L: "lens" } },
  { kind: "lead", pad: 1, s: 1.05, seed: 700, icon: "fork", c: P.pink },
  { kind: "trader", pad: 2, s: 1.05, seed: 857, icon: "bolt", c: P.yellow },
];
function ringActive(t) { let v = 0; for (let i = 1; i < RSTEP.length; i++) v += K.E.inOut(K.inv(RSTEP[i] - 0.35, RSTEP[i], t)); return v; }
function drawRing(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: K.tw(t, at(22), at(24), 1.0, 1.07, K.E.inOut), rot: 0 });
  K.applyCam(ctx, 1);
  K.wall(ctx, -200, 2120, -200, 560, { seed: 43 });
  K.skyWindow(ctx, 560, 40, 800, 400, { dusk: 1, seed: 47 });
  K.floorGrid(ctx, -200, 2120, 560, 700, { vx: 960, scroll: t * 0.5, rows: 12, cols: 30, spread: 230, color: P.violet });
  const act = ringActive(t), on = K.inv(at(22) - 0.3, at(22), t);
  /* the ring itself, lying on the floor */
  const ell = K.ellipsePts(RING.cx, RING.cy, RING.rx, RING.ry, 64);
  K.shape(ctx, ell, { fill: null, w: 26, boil: 0.4, seed: 701 });
  K.neon(ctx, ell, { color: P.violet, w: 9, closed: true, on: 0.4 + 0.6 * on, seed: 702, boil: 0 });
  /* running light */
  const la = ((-90 + 120 * act) * Math.PI) / 180, lx = RING.cx + Math.cos(la) * RING.rx, ly = RING.cy + Math.sin(la) * RING.ry;
  if (on > 0) { K.glow(ctx, lx, ly, 120, K.rgba(P.yellow, 0.95), on); K.dot(ctx, lx, ly, 14, "#ffffff", null, 0, 703); }
  /* pads */
  for (let i = 0; i < 3; i++) {
    const p = RPAD(i), d = Math.abs(((act - i) % 3 + 3 + 1.5) % 3 - 1.5), hot = K.clamp(1 - d * 1.6, 0, 1), c = RBOTS[i].c;
    K.shape(ctx, K.ellipsePts(p[0], p[1], 150, 44, 20), { fill: P.metalDark, w: 6, boil: 0.4, seed: 710 + i, rim: { color: c, dx: 0, dy: 5, a: 0.8 } });
    K.neon(ctx, K.ellipsePts(p[0], p[1], 120, 34, 20), { color: c, w: 5, closed: true, on: 0.35 + 0.65 * hot, seed: 715 + i, boil: 0 });
    if (hot > 0) K.glow(ctx, p[0], p[1] - 40, 220, K.rgba(c, 0.6), hot);
  }
  const lookX = K.clamp((lx - RING.cx) / RING.rx, -1, 1);
  /* bots on their pads (back first), each hops when the light lands on it;
     the risk bot supervises from the centre (drawn after the back pad) */
  [0, 1, 2].forEach((i) => {
    if (i === 1) K.robot(ctx, 960, 1050, 0.82, { kind: "risk", seed: 833, hold: { L: "shield" }, look: [lookX, -0.2], blink: K.blinkAt(t, 51), squash: 0.08 * pulseB(t) - 0.03, bulb: pulseB(t), eyes: "dot", armR: { x: 104, y: -160, open: 0.2 } });
    const m = RBOTS[i], p = RPAD(m.pad), b = pulseB(t);
    const st = { kind: m.kind, seed: m.seed, hold: m.hold, blink: K.blinkAt(t, 61 + i * 3), look: [lookX * 0.8, -0.3], eyes: "dot", mouth: "smile", squash: 0.07 * b - 0.03, bulb: b, chest: b };
    st.armL = { x: -104, y: -150, open: 0.2 }; st.armR = { x: 104, y: -150, open: 0.2 };
    if (m.kind === "analyst") st.armL = { x: -120, y: -230, open: 0.1, rot: 200 };
    RSTEP.forEach((ts, k) => {
      if (k % 3 !== i) return;
      st.squash += 0.28 * K.ss(ts - 0.2, ts, t) * (1 - K.ss(ts, ts + 0.04, t));
      const h = hopArc(t, ts, ts + 0.42, 80); if (h > 0) { st.hop = h; st.squash = -0.15; st.eyes = "happy"; st.mouth = "open"; st.armR = { x: 140, y: -320, open: 0.8 }; }
      st.squash += land(t, ts + 0.42, 0.32);
    });
    K.robot(ctx, p[0], p[1] + 10, m.s, st);
    /* the step's icon floats above its bot */
    const d = Math.abs(((act - i) % 3 + 3 + 1.5) % 3 - 1.5), hot = K.clamp(1 - d * 1.6, 0, 1), hy = p[1] - m.s * 430 - 20 * hot;
    ctx.save(); ctx.translate(p[0], hy); const s = 1.15 + 0.35 * hot; ctx.scale(s, s);
    K.shape(ctx, K.rrPts(-46, -46, 92, 92, 18, 2), { fill: P.screen, w: 5, boil: 0.4, seed: 720 + i, rim: { color: m.c, dx: 3, dy: 3, a: 0.9 }, glow: hot > 0.3 ? m.c : null, glowR: 30 * hot });
    K.pix(ctx, m.icon, 0, 0, 8, m.c, { glow: 0.5 + 0.5 * hot }); ctx.restore();
  });
  RSTEP.forEach((ts, k) => { const p = RPAD(k % 3); K.sparks(ctx, p[0], p[1] - 20, ts, { seed: 730 + k, r: 170, n: 12, color: RBOTS[k % 3].c }); });
  /* loop counter on the wall continues from the face loop (02 -> 03 -> 04) */
  const n = t >= RSTEP[3] ? 4 : 3;
  K.scoreboard(ctx, 1640, 230, 280, 150, [{ v: "0" + n, c: P.phosphor }], { seed: 740, bump: K.inv(RSTEP[3], RSTEP[3] + 0.35, t) });
  K.pix(ctx, "clock", 1640, 120, 5, P.violet, { glow: 0.6 });
}
