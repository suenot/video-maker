/* ============================================================
   INTRO 50 TITLE SET: the neon sign over the whole team. Used twice:
   k = TITLE_A (chorus 1): the sign buzzes on and the team hops in from the
   sides ("here they come!"); k = TITLE_B (final card): the team is there,
   the tag "AI Agents for Trading!" makes everyone jump, five episode
   medallions pop on eighth notes, pixel confetti falls.
   Letters flicker on one by one (DOM text, per language).
   ============================================================ */
const SIGN = { cx: 960, cy: 256, w: 1500, h: 360 };
const MEDAL_Y = 514, MEDAL_R = 48;
/* five episodes, language-free: agentic revolution, open-source hedge fund team,
   AI4Finance foundation, daily stock-analysis agent, agent harness */
const MEDALS = [["rocket", P.orange], ["team", P.pink], ["globe", P.cyan], ["chart", P.green], ["harness", P.violet]];
const TITLE_BOTS = [
  { kind: "analyst", x: 300, y: 1050, s: 1.0, seed: 811, hold: { L: "lens" } },
  { kind: "trader", x: 620, y: 1055, s: 1.0, seed: 857 },
  { kind: "risk", x: 1310, y: 1055, s: 1.0, seed: 833, hold: { L: "shield" } },
];
/* neon sign brightness: stuttering ignition, then a buzz pulse on every bar */
function signOn(t, k) {
  if (t < k.start) return 0;
  const d = t - k.start, f = Math.floor(d * 24);
  if (d < 0.42) return [1, 0.2, 0.9, 0, 0, 1, 0.3, 1, 1, 0.1, 1][f % 11];
  return K.flick(t, 9, 0.35) * (1 + 0.25 * pulseA(t));
}
function titlePose(i, t, k) {
  const m = TITLE_BOTS[i], b = K.pulse(t - i * 0.07, 1, 6);
  const st = { kind: m.kind, seed: m.seed, blink: K.blinkAt(t, 21 + i * 5), mouth: "smile", eyes: "happy", look: [i === 2 ? -0.6 : 0.6, -0.4], squash: 0.1 * b - 0.04, bulb: b, chest: b, hold: m.hold };
  st.armL = { x: -104, y: -150, open: 0.2 }; st.armR = { x: 104, y: -150 - 20 * b, open: 0.3 };
  if (m.kind === "analyst") st.armL = { x: -120, y: -230, open: 0.1, rot: 200 };
  /* staggered jump on the beat before the tag, and again on the tag */
  [k.jump + i * BEAT / 2].concat(k.medals ? [k.medals + i * BEAT / 4] : []).forEach((tj) => {
    st.squash += 0.3 * K.ss(tj - 0.22, tj, t) * (1 - K.ss(tj, tj + 0.05, t));
    const h = hopArc(t, tj, tj + 0.46, 90); if (h > 0) { st.hop = h; st.squash = -0.16; st.armR = { x: 120, y: -330, open: 0.9 }; st.mouth = "open"; }
    st.squash += land(t, tj + 0.46, 0.35);
  });
  if (k.medals && t > k.medals) st.eyes = i === 1 ? "dollar" : "heart";
  /* set A: hop in from the sides, one hop per beat */
  const inU = k.medals ? 1 : K.inv(k.start, k.start + 4 * BEAT, t);
  if (inU < 1) { st.hop = Math.max(st.hop || 0, 46 * Math.abs(Math.sin((t - k.start) / BEAT * Math.PI))); st.look = [m.x < 960 ? 1 : -1, 0]; st.eyes = "wide"; st.mouth = "open"; }
  return st;
}
function titleBeepo(t, k) {
  const b = pulseB(t);
  const st = { kind: "lead", seed: 700, blink: K.blinkAt(t, 3), eyes: "happy", mouth: "talk", talk: 0.4 + 0.6 * b, squash: 0.1 * b - 0.04, bulb: b, chest: b, look: [0, -0.5] };
  st.armL = { x: -150, y: -300 - 20 * b, open: 0.8 }; st.armR = { x: 150, y: -300 - 20 * b, open: 0.8 }; /* "here they come!" arms up */
  /* entrance: drops in from above on the title downbeat with a big squash */
  const drop = K.inv(k.start, k.start + 0.36, t);
  st.hop = drop < 1 ? 520 * (1 - K.E.in3(drop)) : 0;
  st.squash += land(t, k.start + 0.36, 0.5);
  if (st.hop > 0) { st.squash = -0.25; st.eyes = "wide"; st.mouth = "o"; }
  /* tag: big jump, hearts */
  const tj = k.medals || k.jump;
  st.squash += 0.34 * K.ss(tj - 0.25, tj, t) * (1 - K.ss(tj, tj + 0.05, t));
  const h = hopArc(t, tj, tj + 0.55, 130); if (h > 0) { st.hop = h; st.squash = -0.2; }
  st.squash += land(t, tj + 0.55, 0.45);
  if (t > tj) { st.eyes = "heart"; st.heartPop = ((t - tj) % 0.9) / 0.9; }
  /* final bar: wave goodbye with the right arm */
  if (k.final && t > k.final) {
    const r = K.ss(k.final, k.final + 0.3, t), w = Math.sin((t - k.final) * 9);
    st.armR = { x: 150 + 30 * w * r, y: K.lerp(-300, -320, r), open: 0.6 }; st.armL = { x: -110, y: -160, open: 0.3 };
    st.eyes = "happy"; st.mouth = "smile"; st.heartPop = 0;
  }
  return st;
}

function drawTitleSet(t, k) {
  K.begin(ctx, t, { x: 960, y: 540, z: K.tw(t, k.start, k.end, 1.04, 1.0, K.E.out3), rot: 0 });
  K.applyCam(ctx, 1);
  const hz = 760;
  K.wall(ctx, -200, 2120, -200, hz, { seed: 5 });
  K.floorGrid(ctx, -200, 2120, hz, 600, { vx: 960, scroll: t * 0.8, rows: 12, cols: 30, spread: 220, color: P.violet });
  K.neon(ctx, [[-200, 30], [2120, 30]], { color: P.pink, w: 7, on: signOn(t, k) * 0.7, seed: 6, boil: 0 });
  /* PnL board on a stand (right) */
  K.line(ctx, [[1640, 960], [1640, 760]], { w: 14, stroke: P.ink, boil: 0.4, seed: 7 });
  K.line(ctx, [[1640, 960], [1640, 760]], { w: 6, stroke: P.metal, boil: 0.4, seed: 7 });
  K.scoreboard(ctx, 1640, 700, 330, 170, [{ v: !k.medals ? "+2.6%" : t > k.medals ? "+12.4%" : "+9.8%", c: P.green }], { seed: 16, label: "PNL", bump: k.medals ? K.inv(k.medals, k.medals + 0.35, t) : 0, a: K.inv(k.start + 0.3, k.start + 0.6, t) });
  /* bots */
  TITLE_BOTS.forEach((m, i) => {
    const a = k.medals ? K.inv(k.start + 0.1 + i * 0.12, k.start + 0.4 + i * 0.12, t) : 1; if (a <= 0) return;
    /* set A: they hop in from off-screen */
    const x = k.medals ? m.x : K.lerp(m.x < 960 ? m.x - 900 : m.x + 900, m.x, K.E.out3(K.inv(k.start, k.start + 4 * BEAT, t)));
    K.shape(ctx, K.ellipsePts(x, m.y + 6, 80, 16, 14), { fill: P.ink, stroke: null, w: 0, boil: 0.3, seed: 60 + i, alpha: 0.6 });
    ctx.save(); ctx.translate(x, m.y); const s = K.E.back(a, 2.4); ctx.scale(s, s); ctx.translate(-x, -m.y);
    K.robot(ctx, x, m.y, m.s, titlePose(i, t, k)); ctx.restore();
  });
  K.shape(ctx, K.ellipsePts(960, 1056, 100, 20, 14), { fill: P.ink, stroke: null, w: 0, boil: 0.3, seed: 66, alpha: 0.6 });
  K.beepo(ctx, 960, 1062, 1.24, titleBeepo(t, k));
  K.sparks(ctx, 960, 1040, k.start + 0.36, { seed: 170, r: 220, n: 14, color: P.yellow });
  /* sign */
  const on = signOn(t, k);
  const box = K.neonSign(ctx, SIGN.cx, SIGN.cy, SIGN.w, SIGN.h, { on, a: K.inv(k.start - 0.05, k.start + 0.25, t), seed: 91 });
  if (on > 0.5) K.glow(ctx, SIGN.cx, SIGN.cy, 900, K.rgba(P.pink, 0.16), on);
  /* medallions: tiny CRT tiles, eighth notes after the tag */
  if (k.medals) MEDALS.forEach((md, i) => {
    const t0 = k.medals + i * BEAT / 2, a = K.inv(t0, t0 + 0.35, t); if (a <= 0) return;
    const s = K.E.back(a, 2.6), x = 960 + (i - 2) * 150, y = MEDAL_Y + 5 * Math.sin(t * 2.6 + i) - 8 * K.pulse(t - i * 0.08, 1, 6);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.glow(ctx, 0, 0, 90, K.rgba(md[1], 0.5), 1);
    K.shape(ctx, K.rrPts(-MEDAL_R, -MEDAL_R, MEDAL_R * 2, MEDAL_R * 2, 16, 2), { fill: P.screen, w: 5, boil: 0.5, seed: 600 + i * 7, rim: { color: md[1], dx: 4, dy: 4, a: 0.9 } });
    K.pix(ctx, md[0], 0, 0, 8.6, md[1], { glow: 0.7 });
    ctx.restore();
  });
  K.confetti(ctx, 0, 1920, -60, k.medals || k.jump, { n: k.medals ? 70 : 30, fall: 480, seed: 81 });
  return box;
}

function layoutTitleDom(t, k) {
  const on = signOn(t, k);
  titleEl.style.opacity = t >= k.letters ? "1" : "0";
  if (t < k.letters) return;
  const n = TITLE_LN.length, sizes = TITLE_LN.map((d) => +d.dataset.size), gap = 14;
  const total = sizes.reduce((a, b) => a + b, 0) + gap * (n - 1);
  let y = SIGN.cy - total / 2 - 8;
  TITLE_LN.forEach((d, i) => { d.style.top = y.toFixed(1) + "px"; y += sizes[i] + gap; });
  TITLE_CH.forEach((c) => {
    /* each letter ignites with its own short stutter (neon), then follows the sign's buzz */
    const t0 = k.letters + c.idx * 0.05, d = t - t0;
    let o = 0;
    if (d >= 0) { const f = Math.floor(d * 24); o = f < 6 ? [1, 0.15, 0.8, 0, 1, 0.6][f] : 1; }
    o *= Math.min(1, 0.55 + 0.45 * on);
    const pop = d >= 0 && d < 0.25 ? 1 + 0.12 * Math.sin((d / 0.25) * Math.PI) : 1;
    const hopY = c.line === n - 1 && t > (k.medals || k.jump) ? -8 * K.pulse(t, 2, 6) : 0; /* second line bounces on half notes after the tag */
    c.el.style.opacity = o.toFixed(2);
    c.el.style.transform = `translateY(${hopY.toFixed(1)}px) scale(${pop.toFixed(3)})`;
  });
}
