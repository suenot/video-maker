/* ============================================================
   GALLERY: every explainer primitive of the neon-floor kit, for regression
   snapshots after kit changes. Board A (0 - 3 s): graph, scoreboard + LED
   digits, terminal table, hologram formula, monitor chart. Board B (3 - 6 s):
   terminal code, task board, loop ring, the whole cast, ticket, icons.
   Hosts (45_cohost): C (6 - 9 s) Beepo talks + laser-points at a chart, Ping
   listens and nods; D (9 - 12 s) Ping talks, thinks, gets surprised, points,
   Beepo listens holding a ticket; E (12 - 15 s) Ping gestures; F (15 - 18 s)
   Beepo gestures + viseme mouths + Ping size ladder (180 / 260 / 400 px).
   ============================================================ */
const K = AK, P = K.P, DUR = 18;
const ctx = document.getElementById("cv").getContext("2d");
function room() {
  K.wall(ctx, -10, 1930, -10, 760, { seed: 3, strip: 1 });
  K.floorGrid(ctx, -10, 1930, 760, 330, { vx: 960, scroll: K.now * 0.5 });
}
function boardA(t) {
  room();
  /* graph: pods + cables */
  const N = { A: [180, 300], B: [520, 160], C: [560, 470] };
  K.edge(ctx, N.A, N.B, { state: "hot", label: "0.82", seed: 3, bend: -30 });
  K.edge(ctx, N.B, N.C, { state: "plain", label: "1.4", seed: 5, color: P.pink });
  K.edge(ctx, N.C, N.A, { state: "dim", label: "-0.3", seed: 7 });
  K.node(ctx, N.A[0], N.A[1], 0.8, { icon: "eye", label: "DATA", color: P.cyan, hot: 0.6, seed: 11 });
  K.node(ctx, N.B[0], N.B[1], 0.8, { icon: "brain", label: "LLM", color: P.pink, seed: 12 });
  K.node(ctx, N.C[0], N.C[1], 0.8, { icon: "bolt", label: "EXEC", color: P.yellow, seed: 13 });
  K.scoreboard(ctx, 1000, 170, 360, 180, [{ v: "+12.4%", c: P.green }], { label: "PNL", seed: 14 });
  K.seg7(ctx, "0123456789", 1000, 330, 56, P.cyan);
  K.seg7(ctx, "-3.14 $ 09:30", 1000, 410, 46, P.pink);
  K.termTable(ctx, 1560, 280, [150, 150, 140], [["SYM", "SIG", "P&L"], ["NVDA", "BUY", "+2.1"], ["AAPL", "HOLD", "0.0"], ["TSLA", "SELL", "-0.7"]], { hi: 1, title: "signals.csv", size: 24, rowH: 46, seed: 15 });
  K.holo(ctx, 430, 760, 640, 170, ["R = Σ w·r", { t: "a* = argmax Q", c: P.yellow }], { size: 44, seed: 16 });
  K.monitorChart(ctx, 1320, 760, 760, 360, [{ kind: "bar", data: [3, 5, 4, 7, 6], color: P.violet }, { data: [2, 4, 3.4, 6, 7.5], color: P.cyan }], { title: "EQUITY", xLabels: ["M", "T", "W", "T", "F"], seed: 17 });
}
function boardB(t) {
  room();
  K.terminal(ctx, 470, 260, 820, ["def act(obs):", "    sig = llm.decide(obs)  # plan", "    if risk.ok(sig):", "        return broker.send(sig, 100)"], { title: "agent.py", size: 24, seed: 21 });
  K.taskBoard(ctx, 1420, 240, 760, ["Observe the market", { t: "Decide with tools", icon: "brain", c: P.pink }, { t: "Act, then log", icon: "bolt", c: P.yellow }], { title: "LOOP", done: 1, size: 32, seed: 22 });
  K.loopRing(ctx, 300, 760, 150, [{ icon: "eye", color: P.cyan }, { icon: "fork", color: P.pink }, { icon: "bolt", color: P.yellow }], { active: (t * 1.2) % 3, nodeR: 56, seed: 23 });
  const eyes = ["dot", "happy", "wide", "heart"];
  [["lead", 640], ["analyst", 900], ["risk", 1160], ["trader", 1420]].forEach(([k, x], i) => {
    K.robot(ctx, x, 1060, 0.78, { kind: k, eyes: eyes[i], mouth: i === 3 ? "talk" : "smile", bulb: 1, chest: 1, hold: k === "analyst" ? { L: "lens" } : k === "risk" ? { L: "shield" } : k === "trader" ? { R: "ticket" } : { R: "baton" } });
  });
  K.ticket(ctx, 1700, 640, 1.2, { sym: "BTC", dir: "up", qty: "2", stamp: 1, seed: 24 });
  Object.keys(K.ICONS).forEach((nm, i) => K.pix(ctx, nm, 1640 + (i % 6) * 46, 880 + Math.floor(i / 6) * 50, 4, [P.cyan, P.pink, P.yellow, P.green][i % 4], { glow: 0.5 }));
}
/* fake narration: words of 0.2 - 0.5 s with short gaps, syllable flutter (stands in for NR.talk) */
function fakeTalk(t, t0, t1, seed) {
  if (t < t0 || t > t1) return 0;
  let w = t0, i = 0;
  while (w < t1 && i < 60) {
    const len = 0.2 + 0.3 * K.hash(i, seed), gap = 0.06 + 0.12 * K.hash(i, seed + 1);
    if (t >= w && t < w + len) { const u = (t - w) / len; return Math.sin(u * Math.PI) * (0.55 + 0.45 * Math.abs(Math.sin(t * 19 + i))); }
    w += len + gap; i++;
  }
  return 0;
}
/* accent pulses at fixed times -> { a: 0..1, id } like NR.accent */
function accentAt(t, times) {
  let a = 0, id = 0;
  times.forEach((ta, i) => { const d = t - ta; if (d >= -0.1 && d < 1.2) { const v = d < 0 ? 1 + d / 0.1 : Math.exp(-2.5 * d); if (v > a) { a = v; id = i; } } });
  return { a, id };
}
function caption(str, x, y) { K.text(ctx, str, x, y, { size: 30, font: K.FONT.pixel, fill: P.yellow, glow: P.yellow, glowR: 8, align: "left" }); }
function boardC(t) {
  room(); K.screen(ctx);
  const tA = fakeTalk(t, 6.1, 8.9, 5), acc = accentAt(t, [6.3, 7.6]), acB = accentAt(t, [6.5, 7.3, 8.1]);
  K.monitorChart(ctx, 1340, 440, 860, 440, [{ data: [2, 3, 2.6, 4.2, 6.4, 5.1], color: P.cyan }], { title: "EQUITY", xLabels: ["M", "T", "W", "T", "F", "S"], seed: 71 });
  K.duo(ctx, t, { layout: "left", who: "a", talkA: tA, accentA: acc.a, accentIdA: acc.id, accentB: acB.a,
    pointA: [1530, 330], pointAmtA: K.ss(7.0, 7.5, t), beamA: true });
  caption("A TALKS + POINTS  B LISTENS", 900, 990);
}
function boardD(t) {
  room(); K.screen(ctx);
  const tB = fakeTalk(t, 9.1, 11.9, 9), acc = accentAt(t, [9.2, 11.3]);
  const actsB = [{ at: 9.6, kind: "think", dur: 1.1 }, { at: 10.7, kind: "surprise", dur: 0.9 }];
  K.taskBoard(ctx, 960, 170, 640, ["Observe the market", { t: "Decide with tools", icon: "brain", c: P.pink }, { t: "Act, then log", icon: "bolt", c: P.yellow }], { title: "LOOP", done: 1, size: 32, seed: 72 });
  K.duo(ctx, t, { layout: "split", who: "b", talkB: tB, accentB: acc.a, accentIdB: acc.id + 1, actsB,
    pointB: [1180, 420], pointAmtB: K.ss(11.4, 11.8, t), beamB: true, holdA: { R: "ticket" }, accentA: 0 });
  caption("B TALKS  THINKS  SURPRISE  POINTS", 520, 1010);
}
function boardE(t) {
  room(); K.screen(ctx);
  const kinds = ["point", "nod", "surprise", "think", "shrug"];
  kinds.forEach((k, i) => {
    const x = 220 + i * 370, y = 880, s = 0.95;
    K.stage(ctx, x, y + 4, 200, t, P.cyan);
    const acts = [{ at: 12.3, kind: k, dur: 40, to: [260, -330] }];
    K.ping(ctx, x, y, s, K.hostPose(t, { kind: "cohost", acts, talk: k === "nod" ? 0 : 0, listen: k === "nod" ? 1 : 0, otherAccent: k === "nod" ? accentAt(t, [12.5, 13.3, 14.1, 14.9]).a : 0 }));
    caption(k.toUpperCase(), x - 60, 990);
  });
  caption("PING (HOST B) GESTURES", 64, 90);
}
function boardF(t) {
  room(); K.screen(ctx);
  ["wave", "cheer", "worry", "grin"].forEach((k, i) => {
    const x = 200 + i * 300, y = 640, s = 0.78;
    K.beepo(ctx, x, y, s, K.hostPose(t, { kind: "lead", acts: [{ at: 15.3, kind: k, dur: 40 }] }));
    caption(k.toUpperCase(), x - 50, 690);
  });
  /* viseme strip: the same frame at five loudness levels, both faces */
  [0, 0.25, 0.5, 0.75, 1].forEach((v, i) => {
    const x = 160 + i * 190;
    const vis = ["m", "e", "u", "o", "a"].map((k) => K.VISEMES[k])[i];
    (i % 2 ? K.ping : K.beepo)(ctx, x, 1010, 0.62, { mouth: "speak", vis: { open: vis.open * (0.4 + 0.6 * v), wide: vis.wide, round: vis.round }, bulb: v });
  });
  ["M 0", "E .25", "U .5", "O .75", "A 1"].forEach((v, i) => K.text(ctx, v, 160 + i * 190, 1052, { size: 24, font: K.FONT.pixel, fill: P.cyan }));
  /* Ping at 180 / 260 / 400 px tall */
  [[1340, 0.5], [1530, 0.72], [1760, 1.1]].forEach(([x, s], i) => {
    K.ping(ctx, x, 1010, s, K.hostPose(t, { kind: "cohost", talk: fakeTalk(t, 15.1, 18, 20 + i) }));
  });
  caption("BEEPO GESTURES", 64, 90); caption("SIZES 180-400 PX", 1300, 90);
}
function render(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1, rot: 0 }); K.applyCam(ctx, 1);
  if (t < 3) boardA(t); else if (t < 6) boardB(t); else if (t < 9) boardC(t); else if (t < 12) boardD(t); else if (t < 15) boardE(t); else boardF(t);
}
const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
