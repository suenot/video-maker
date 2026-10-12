/* ============================================================
   GALLERY: every explainer primitive of the neon-floor kit, for regression
   snapshots after kit changes. Board A (0 - 3 s): graph, scoreboard + LED
   digits, terminal table, hologram formula, monitor chart. Board B (3 - 6 s):
   terminal code, task board, loop ring, the whole cast, ticket, icons.
   ============================================================ */
const K = AK, P = K.P, DUR = 6;
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
function render(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1, rot: 0 }); K.applyCam(ctx, 1);
  if (t < 3) boardA(t); else boardB(t);
}
const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
