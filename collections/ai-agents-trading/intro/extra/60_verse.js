/* ============================================================
   INTRO 60 VERSE: one continuous take along the night floor (bars 10-18).
   The team hops right in a line; the camera trucks to a new station every
   two bars, landing on the downbeat of each sung line:
     bar 10 "Robots on the floor where the neon glows"  neon wall signs ignite one per beat
     bar 12 "Reading every tick as the order flows"     analyst reads the tape + order book
     bar 14 "One agent plans and another one checks"    trader writes the plan, risk stamps it
     bar 16 "Tools and memory to place the next bets!"  Beepo's tools + memory, ticket to the tube
   ============================================================ */
const V = {
  signs: [["up", P.green], ["dollar", P.yellow], ["bolt", P.cyan], ["heart", P.pink], ["chart", P.green], ["coin", P.yellow], ["rocket", P.orange], ["eye", P.cyan]],
  tape: { x: 2900, y: 300, w: 1700, h: 96 },
  book: { x: 4060, y: 580 },
  board: { x: 5400, y: 520, w: 820 },
  term: { x: 7130, y: 400, w: 760 },
  tube: { x: 7650, y: 980, top: -260 },
  pnl: { x: 6420, y: 420 },
};
const S_TICK = at(12), S_PLAN = at(14), S_TOOLS = at(16);
/* bot tracks (x over time); while x changes the bot hop-walks one hop per beat */
const VBOTS = [
  { kind: "lead", s: 1.25, y: 1060, seed: 700, x: K.mkSpline([[at(10), 1200], [at(12), 3300], [at(12, 3), 6820]]) },
  { kind: "risk", s: 1.05, y: 1050, seed: 833, hold: { L: "shield" }, x: K.mkSpline([[at(10), 820], [at(12), 2920], [at(12, 3), 5880]]) },
  { kind: "trader", s: 1.05, y: 1050, seed: 857, x: K.mkSpline([[at(10), 440], [at(12), 2540], [at(12, 3), 4930]]) },
  { kind: "analyst", s: 1.12, y: 1055, seed: 811, hold: { L: "lens" }, x: K.mkSpline([[at(10), 60], [at(12), 2160], [at(12, 2), 3440]]) },
];
const camVerse = K.mkTrack([
  [at(10), { x: 640, y: 620, z: 1.0 }],
  [S_TICK - 0.35, { x: 2700, y: 620, z: 1.0 }],
  [S_TICK + 0.15, { x: 3720, y: 690, z: 1.3 }],
  [S_PLAN - 0.35, { x: 3740, y: 690, z: 1.3 }],
  [S_PLAN + 0.15, { x: 5400, y: 690, z: 1.3 }],
  [S_TOOLS - 0.35, { x: 5420, y: 690, z: 1.3 }],
  [S_TOOLS + 0.15, { x: 6960, y: 690, z: 1.3 }],
  [at(18), { x: 6990, y: 695, z: 1.36 }],
]);

function vbotPose(i, t) {
  const m = VBOTS[i], b = K.pulse(t - i * 0.05, 1, 6);
  const st = { kind: m.kind, seed: m.seed, blink: K.blinkAt(t, 31 + i * 7), mouth: "smile", look: [0.8, 0], squash: 0.07 * b - 0.03, bulb: b, chest: 0.4 + 0.6 * b, hold: m.hold };
  st.armL = { x: -104, y: -150, open: 0.2 }; st.armR = { x: 104, y: -150, open: 0.2 };
  if (m.kind === "analyst") st.armL = { x: -120, y: -230, open: 0.1, rot: 200 };
  /* hop-walk: one hop per beat while moving, squash on each landing */
  const sp = Math.abs(m.x(t + 0.03) - m.x(t - 0.03)) / 0.06, mv = K.clamp(sp / 250, 0, 1);
  if (mv > 0) {
    const u = (((t - at(10)) / BEAT) % 1 + 1) % 1;
    st.hop = mv * (40 + 0.05 * Math.min(sp, 1600)) * Math.sin(Math.PI * u);
    st.squash += mv * (u < 0.15 ? 0.3 * (1 - u / 0.15) : -0.12 * Math.sin(Math.PI * u));
    st.armL = { x: -120, y: -230 - 30 * Math.sin(Math.PI * u), open: 0.5 }; st.armR = { x: 120, y: -230 - 30 * Math.sin(Math.PI * u), open: 0.5 };
    if (m.kind === "analyst") st.armL = { x: -120, y: -230, open: 0.1, rot: 200 };
    st.eyes = "happy"; st.mouth = m.kind === "lead" ? "talk" : "open"; st.talk = b; st.look = [1, -0.2];
  }
  /* "Reading every tick": the analyst raises the lens to the tape and reads it */
  if (m.kind === "analyst" && t > at(12, 2) - 0.2) {
    const r = K.ss(at(12, 2) - 0.2, at(12, 2) + 0.1, t);
    st.armL = { x: K.lerp(-120, -150, r), y: K.lerp(-230, -400, r), open: 0.1, rot: K.lerp(200, 250, r) };
    st.look = [Math.sin((t - at(12)) * 3), -1]; st.eyes = b > 0.6 ? "wide" : "dot"; st.mouth = "o";
    st.armR = { x: 110, y: -150 - 30 * b, open: 0.2 };
  }
  /* "One agent plans": the trader points at the board as each line appears */
  if (m.kind === "trader" && t > S_PLAN - 0.3) {
    const r = K.ss(S_PLAN - 0.3, S_PLAN, t);
    st.armR = { x: K.lerp(104, 170, r), y: K.lerp(-150, -330 - 20 * b, r), open: 0.1 }; st.look = [1, -0.6];
    st.mouth = t < at(15) ? "talk" : "smile"; st.talk = b;
    if (t > at(15, 2) && t < at(15, 3.4)) { st.eyes = "wide"; st.mouth = "o"; st.squash -= 0.1; }
  }
  /* "another one checks": risk stamps each line on the beat (the third gets a cross) */
  if (m.kind === "risk" && t > S_PLAN - 0.3) {
    st.look = [-1, -0.5]; st.armR = { x: 60, y: -180, open: 0.2 };
    [0, 1, 2].forEach((k) => {
      const ts = at(15, k), r = K.ss(ts - 0.22, ts, t) * (1 - K.ss(ts + 0.05, ts + 0.3, t));
      if (r > 0) { st.armR = { x: K.lerp(60, -170, r), y: K.lerp(-180, -330 + k * 40, r), open: 0.1 }; st.squash += 0.12 * r; }
    });
    if (t > at(15, 2)) { st.exclaim = K.inv(at(15, 2), at(15, 2) + 0.3, t) * (1 - K.inv(at(16) - 0.4, at(16), t)); st.eyes = "x"; }
    else if (t > at(15)) st.eyes = "happy";
  }
  /* "Tools and memory to place the next bets": Beepo gathers, then throws */
  if (m.kind === "lead" && t > S_TOOLS - 0.3) {
    st.look = [0.3, -0.8]; st.mouth = "talk"; st.talk = 0.3 + 0.7 * b; st.eyes = "dot";
    st.armL = { x: -150, y: -280 - 20 * b, open: 0.6 }; st.armR = { x: 150, y: -280 - 20 * b, open: 0.6 };
    st.chest = K.clamp(K.inv(at(17) - 0.1, at(17) + 0.4, t) + 0.3 * b, 0, 1);
    if (t > at(17) - 0.1 && t < at(17) + 0.5) { st.eyes = "wide"; st.squash += 0.15; }
    const tt = at(17, 2), r = K.ss(tt - 0.4, tt - 0.05, t) * (1 - K.ss(tt + 0.1, tt + 0.5, t));
    if (r > 0) { st.hold = { R: t < tt ? "ticket" : null }; st.holdSym = "NVDA"; st.armR = { x: K.lerp(80, 190, r), y: K.lerp(-150, -320, r), open: t > tt ? 0.9 : 0.1 }; st.armL = { x: -110, y: -160, open: 0.3 }; st.lean = 6 * r; st.look = [1, -0.6]; }
    if (t > at(17, 3)) { st.eyes = "dollar"; st.mouth = "open"; }
  }
  return st;
}

function drawVerse(t) {
  K.begin(ctx, t, Object.assign({ rot: 0 }, camVerse(t)));
  K.applyCam(ctx, 1);
  K.wall(ctx, -1200, 8800, -900, HORIZON, { seed: 13 });
  K.floorGrid(ctx, -1200, 8800, HORIZON, 1400, { vx: camVerse(t).x, scroll: t * 0.6, rows: 16, cols: 60, spread: 300 });
  K.neon(ctx, [[-1200, -60], [8800, -60]], { color: P.pink, w: 8, on: K.flick(t, 14, 0.25), seed: 14, boil: 0 });
  /* bar 10: neon signs ignite along the wall, one per beat ("where the neon glows") */
  V.signs.forEach((sg, k) => {
    const x = 330 + k * 330, t0 = at(10, k), on = t < t0 ? 0.08 : (t - t0 < 0.3 ? [1, 0.2, 1, 0.1, 1, 1, 0.5, 1, 1][Math.floor((t - t0) * 30) % 9] : K.flick(t, 40 + k, 0.4));
    K.neonSign(ctx, x, 360, 240, 200, { on, color: sg[1], color2: k % 2 ? P.violet : P.pink, seed: 300 + k });
    K.pix(ctx, sg[0], x, 360, 10, sg[1], { glow: on, a: 0.15 + 0.85 * on });
    if (on > 0.5) K.glow(ctx, x, 470, 260, K.rgba(sg[1], 0.25), on);
  });
  /* bar 12: the tape and the order book; orders flow in along a cable */
  K.ledTape(ctx, V.tape.x, V.tape.y, V.tape.w, V.tape.h, TAPE, { speed: 260, size: 34 });
  const bk = Math.max(0, Math.floor((t - S_TICK) / BEAT)), px = (i, s) => (912.4 + (i - 2) * 0.05 + 0.01 * Math.floor(K.hash(i + bk, s) * 5)).toFixed(2);
  const rows = [["BID", "SIZE", "ASK", "SIZE"]].concat([0, 1, 2, 3].map((i) => [px(-i, 3), String(100 + Math.floor(K.hash(i + bk, 5) * 900)), px(i + 5, 4), String(100 + Math.floor(K.hash(i + bk, 6) * 900))]));
  K.termTable(ctx, V.book.x, V.book.y, [130, 110, 130, 110], rows, { title: "NVDA", size: 26, rowH: 48, hi: 1 + (bk % 4), seed: 401, reveal: K.inv(S_TICK - 0.3, S_TICK + 0.6, t) });
  K.cable(ctx, [[3000, 1100], [3300, 960], [3700, 900], [V.book.x - 180, V.book.y + 150]], { color: P.green, lit: 0.6, seed: 402, pulses: [0, 1, 2, 3].map((k) => ((t * 0.7 + k / 4) % 1)) });
  /* bar 14: the plan board; lines appear on beats, risk stamps them on bar 15 */
  const shown = t < S_PLAN ? 0 : K.clamp((t - S_PLAN) / BEAT + 1, 0, 3);
  const marks = [at(15, 0), at(15, 1), at(15, 2)].map((ts, k) => (t >= ts ? (k === 2 ? "cross" : "check") : null));
  K.taskBoard(ctx, V.board.x, V.board.y, V.board.w, [{ t: "NVDA  x100", icon: "up", c: P.green }, { t: "BTC  x2", icon: "up", c: P.green }, { t: "TSLA  x50", icon: "down", c: P.loss }], { shown, marks, size: 46, seed: 403, a: K.inv(S_PLAN - 0.5, S_PLAN - 0.1, t) });
  [0, 1, 2].forEach((k) => K.sparks(ctx, V.board.x - V.board.w / 2 + 64, V.board.y - 75 + k * 78, at(15, k), { seed: 410 + k, r: 120, n: 10, color: k === 2 ? P.loss : P.green }));
  /* bar 16: Beepo's terminal, tools orbit, memory cartridges, the tube and PnL */
  K.terminal(ctx, V.term.x, V.term.y, V.term.w, ["tools = [chart, news, risk]", "mem = memory.recall('NVDA')", "bet = agent.plan(tools, mem)", "broker.send(bet)  # x100"], { typed: K.inv(S_TOOLS, at(17, 2), t), size: 26, seed: 404, a: K.inv(S_TOOLS - 0.5, S_TOOLS - 0.1, t), title: "agent.py" });
  const tb = V.tube;
  K.shape(ctx, K.rrPts(tb.x - 46, tb.top, 92, tb.y - tb.top - 220, 40, 3), { fill: K.rgba(P.cyan, 0.12), w: 7, boil: 0.6, seed: 421, rim: { color: P.cyan, dx: 6, dy: 0, a: 0.5 }, gloss: 0.4 });
  K.shape(ctx, K.rrPts(tb.x - 80, tb.y - 260, 160, 120, 30, 3), { fill: P.metalDark, w: 6, boil: 0.6, seed: 422, rim: { color: P.violet, a: 0.8 }, dots: { gap: 11, r: 2.4, alpha: 0.3 } });
  K.shape(ctx, K.ellipsePts(tb.x, tb.y - 200, 50, 26, 16), { fill: P.ink, w: 5, boil: 0.4, seed: 423 });
  const paid = at(17, 3);
  K.scoreboard(ctx, V.pnl.x, V.pnl.y, 300, 150, [{ v: t >= paid ? "+3.4%" : "+2.6%", c: P.green }], { label: "PNL", seed: 424, bump: K.inv(paid, paid + 0.35, t) });
  /* bots (back to front: the line order) */
  for (let i = VBOTS.length - 1; i >= 0; i--) {
    const m = VBOTS[i], x = m.x(t);
    K.shape(ctx, K.ellipsePts(x, m.y + 6, 90 * m.s, 18, 14), { fill: P.ink, stroke: null, w: 0, boil: 0.3, seed: 430 + i, alpha: 0.6 });
    K.robot(ctx, x, m.y, m.s, vbotPose(i, t));
  }
  /* tools orbit Beepo's head (bar 16, one per beat), memory cartridges drop into his chest (bar 17) */
  const bx = VBOTS[0].x(t), by = VBOTS[0].y - VBOTS[0].s * 290;
  [["gear", P.cyan], ["lens", P.pink], ["chart", P.green]].forEach((ic, k) => {
    const t0 = at(16, k), a = K.inv(t0, t0 + 0.3, t) * (1 - K.inv(at(18) - 0.3, at(18), t)); if (a <= 0) return;
    const ang = (t - S_TOOLS) * 2.2 + (k * K.TAU) / 3, x = bx + Math.cos(ang) * 230, y = by + Math.sin(ang) * 70 - 40;
    ctx.save(); ctx.translate(x, y); const s = K.E.back(Math.min(1, a), 2.4); ctx.scale(s, s);
    K.shape(ctx, K.rrPts(-40, -40, 80, 80, 16, 2), { fill: P.screen, w: 5, boil: 0.5, seed: 440 + k, rim: { color: ic[1], dx: 3, dy: 3, a: 0.9 } });
    K.pix(ctx, ic[0], 0, 0, 7, ic[1], { glow: 0.7 }); ctx.restore();
  });
  [0, 1, 2].forEach((k) => {
    const t0 = at(16, 3) + k * 0.12, u = K.inv(t0, t0 + 0.45, t); if (u <= 0 || u >= 1) return;
    const x = K.lerp(bx - 260 + k * 110, bx, K.E.in3(u)), y = K.lerp(by - 220, VBOTS[0].y - VBOTS[0].s * 150, K.E.in3(u));
    K.shape(ctx, K.rrPts(x - 26, y - 34, 52, 68, 8, 2), { fill: P.violet, w: 4.5, boil: 0.4, seed: 450 + k, gloss: 0.5 });
    K.pix(ctx, "clock", x, y - 6, 4, "#ffffff", { glow: 0.5 });
  });
  K.sparks(ctx, bx, VBOTS[0].y - VBOTS[0].s * 150, at(17), { seed: 460, r: 160, n: 12, color: P.violet });
  /* the bet flies into the tube and whooshes up */
  const tf = at(17, 2), uf = K.inv(tf, tf + 0.5, t);
  if (uf > 0 && uf < 1) K.ticket(ctx, K.lerp(bx + 200, tb.x, uf), K.lerp(by + 40, tb.y - 230, uf) - 200 * Math.sin(Math.PI * uf), 1.1, { sym: "NVDA", dir: "up", qty: "100", rot: uf * 4, seed: 470 });
  const uw = K.inv(tf + 0.5, tf + 0.95, t);
  if (uw > 0 && uw < 1) { const y = K.lerp(tb.y - 260, tb.top - 40, K.E.in3(uw)); K.glow(ctx, tb.x, y, 60, K.rgba(P.yellow, 0.9), 1); K.dot(ctx, tb.x, y, 16, P.paper, P.ink, 4, 471); }
  K.sparks(ctx, tb.x, tb.y - 210, tf + 0.5, { seed: 472, r: 140 });
  /* landing dust while hopping */
  VBOTS.forEach((m, i) => { const sp = Math.abs(m.x(t + 0.03) - m.x(t - 0.03)); if (sp > 1) K.sparks(ctx, m.x(t), m.y - 6, at(10) + Math.floor((t - at(10)) / BEAT) * BEAT, { seed: 480 + i, r: 70, n: 6, size: 8, dur: 0.3, color: P.cyan }); });
}
