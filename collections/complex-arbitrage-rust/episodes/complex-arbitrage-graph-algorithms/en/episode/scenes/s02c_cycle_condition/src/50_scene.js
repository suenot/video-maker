/* ============================================================
   s02c 298.9 - 344.9  "R(i1, i2) x R(i2, i3) x ... x R(ik, i1) > 1, and why it is heavy"
   Chart set, continuing s02b by a CUT (same camera, triangle, tags and boards).
   - 298.9 the side boards fly off; the formula slate drops in under the header plank and
     the formula is chalked term by term as the crab reads it; each term lights its leg.
   - 310.3 "> 1" in gold; 317.6 "more than you started with": the coin pile grows.
   - 322.3 "logistically ... a massive chain of multiplications across thousands of assets":
     the camera pulls far back over a huge archipelago, x tokens light up on every route,
     then turn into iron weights that make the routes sag ("heavy").
   - 332.7 the camera flies to the CPU: a clockwork engine swallowing x weights, gauge in
     the red, sweating and smoking; 343.0 "highly inefficient": steam burst, the crab
     shakes his head. Ends with a wave.
   ============================================================ */
const TXT = {
  rBU: "R(BTC, USDT)", rUE: "R(USDT, ETH)", rEB: "R(ETH, BTC)",
  rij: "R(i, j)", rijBody: ["= amount of j", "for 1 unit of i"],
  product: ["R × R × R", "> 1"],
  header: "MULTIPLICATIVE CYCLE CONDITION",
  /* the formula, as tokens: [text, start cue, end cue, leg to light (-1 none), gold] */
  cpu: "CPU",
};
const W = (w, after) => NR.cue(w, after), WE = (w, after) => NR.cueEnd(w, after);
const B = {
  formula: W("formula", 299),
  r1: W("R", 300), two1: WE("two", 302), times1: W("times", 302.4),
  r2: W("R", 303), three: WE("three", 304.7), times2: W("times", 305),
  dot1: W("dot", 306), dot3: WE("dot", 306.8),
  rk: W("R", 307), one: WE("one", 309.2), greater: W("greater", 309.6), oneEnd: WE("one.", 310.2),
  okay: W("okay", 310.5),
  multiplying: W("multiplying", 311.5),
  larger: W("larger", 314.2),
  magical: W("magical", 316.4),
  more: W("more", 318),
  started: W("started", 318.5),
  exactly: W("exactly", 319),
  tracking: W("tracking", 320.5),
  logistically: W("logistically", 322.2),
  massive: W("massive", 324),
  chain: W("chain", 324.6),
  thousands: W("thousands", 326.2),
  heavy: W("heavy", 329.4),
  incredibly: W("incredibly", 328.3),
  itIs: W("it", 331.9),
  frequency: W("frequency", 333.9),
  microsecond: W("microsecond", 335.5),
  multiplication: W("multiplication", 337.3),
  expensive: W("expensive", 338.8),
  cpu: W("CPU", 340.3),
  millions: W("millions", 341),
  inefficient: W("inefficient", 343.5),
  highly: W("highly", 343.3),
};
const FORM = [
  ["R(i_1, i_2)", B.r1, B.two1, 0, false],
  [" × ", B.times1, B.times1 + 0.3, -1, false],
  ["R(i_2, i_3)", B.r2, B.three, 1, false],
  [" × ", B.times2, B.times2 + 0.3, -1, false],
  ["…", B.dot1, B.dot3, -1, false],
  [" × ", B.dot3, B.dot3 + 0.25, -1, false],
  ["R(i_k, i_1)", B.rk, B.one, 2, false],
  [" > 1", B.greater, B.oneEnd, -1, true],
];

/* ---------- the s02b end state (keep identical: the scene starts with a cut) ---------- */
const N = { BTC: [1350, 330], ETH: [1000, 860], USDT: [1700, 860] };
const NODE_S = 0.8, SEEDS = { BTC: 23, ETH: 37, USDT: 11 };
const EDGE = { bend: 60, trim: 120, w: 7 };
const LEGS = [["BTC", "USDT", TXT.rBU, 2400], ["USDT", "ETH", TXT.rUE, 2410], ["ETH", "BTC", TXT.rEB, 2420]];
const LU = [0.5, 0.5, 0.37];
const coinAt = (k) => [N[k][0] - 120 * NODE_S, N[k][1] - 170 * NODE_S];
const CPU = [3000, 1650];

const CAM = K.mkTrack([
  [SCENE.start, { x: 1230, y: 700, z: 0.72 }],
  [B.formula, { x: 1230, y: 700, z: 0.72 }],
  [B.formula + 1.4, { x: 1350, y: 400, z: 0.6 }],
  [B.logistically, { x: 1350, y: 410, z: 0.6 }],
  [B.thousands + 0.6, { x: 1650, y: 900, z: 0.27 }],
  [B.itIs, { x: 1700, y: 950, z: 0.26 }],
  [B.microsecond + 0.3, { x: 2930, y: 1580, z: 0.78 }],
  [SCENE.end, { x: 2960, y: 1600, z: 0.84 }],
]);

/* ---------- rich text with subscripts: "R(i_1, i_2)" (_x = subscript x) ---------- */
function richW(ctx, str, size) {
  let w = 0; for (let i = 0; i < str.length; i++) { if (str[i] === "_" && i + 1 < str.length) { w += K.textW(ctx, str[i + 1], size * 0.62, 700, K.FONT.mono); i++; } else w += K.textW(ctx, str[i], size, 700, K.FONT.mono); }
  return w;
}
function rich(ctx, str, x, y, o) {
  o = Object.assign({ size: 40, fill: P.ink, n: 1e9 }, o || {});
  let cx = x, shown = 0;
  for (let i = 0; i < str.length && shown < o.n; i++) {
    const sub = str[i] === "_" && i + 1 < str.length, ch = sub ? str[++i] : str[i], sz = sub ? o.size * 0.62 : o.size;
    K.text(ctx, ch, cx, y + (sub ? o.size * 0.28 : 0), { size: sz, weight: 700, font: K.FONT.mono, fill: o.fill, align: "left" });
    cx += K.textW(ctx, ch, sz, 700, K.FONT.mono); shown++;
  }
  return cx - x;
}
const glyphs = (str) => str.replace(/_/g, "").length;
function richTag(ctx, x, y, str, o) {
  o = Object.assign({ a: 1, size: 40, hot: false, seed: 2700 }, o || {});
  const a = o.a <= 0 ? 0 : o.a >= 1 ? 1 : K.E.back(o.a, 2.2); if (a <= 0) return;
  const w = richW(ctx, str, o.size) + 30, h = o.size + 22;
  ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
  K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 3), { fill: o.hot ? P.profit : P.paper, w: 3.5, boil: 1, seed: o.seed, shade: { color: o.hot ? P.goldDark : P.paperShade, dx: 0, dy: -5 } });
  rich(ctx, str, -w / 2 + 15, 0, { size: o.size });
  ctx.restore();
}

/* ---------- the far archipelago ("thousands of assets"), fixed by seed ---------- */
const ARCH = (function () {
  const nodes = [], cols = [P.BTC, P.ETH, P.USDT, P.SOL, P.EUR, P.BNB, P.USD];
  for (let i = -3; i <= 9; i++) for (let j = -3; j <= 6; j++) {
    const x = i * 520 + K.hs(i * 31 + j, 5) * 170, y = j * 470 + K.hs(i + j * 17, 6) * 150;
    if (x > 700 && x < 2050 && y > -100 && y < 1200) continue;        /* the main triangle */
    if (Math.hypot(x - CPU[0], y - CPU[1]) < 820) continue;           /* room for the CPU */
    nodes.push({ x, y, c: cols[(((i * 7 + j * 3) % 7) + 7) % 7], s: 0.75 + 0.4 * K.hash(i * 9 + j, 8), seed: 3000 + nodes.length });
  }
  const edges = [], seen = {};
  nodes.forEach((a, ai) => {
    const near = nodes.map((b, bi) => [bi, Math.hypot(b.x - a.x, b.y - a.y)]).filter((q) => q[0] !== ai).sort((p, q) => p[1] - q[1]).slice(0, 3);
    near.forEach(([bi, d]) => { const k = Math.min(ai, bi) + "_" + Math.max(ai, bi); if (!seen[k] && d < 900) { seen[k] = 1; edges.push([ai, bi]); } });
  });
  /* add the routes from the main triangle out into the archipelago */
  ["BTC", "ETH", "USDT"].forEach((k) => {
    const near = nodes.map((b, bi) => [bi, Math.hypot(b.x - N[k][0], b.y - N[k][1])]).sort((p, q) => p[1] - q[1]).slice(0, 2);
    near.forEach(([bi]) => edges.push([k, bi]));
  });
  return { nodes, edges };
})();
const ptOf = (e) => (typeof e === "string" ? N[e] : [ARCH.nodes[e].x, ARCH.nodes[e].y]);
const distC = (p) => Math.hypot(p[0] - 1350, p[1] - 680);

function drawArch(g, a) {
  if (a <= 0) return;
  const heavy = K.ss(B.incredibly, B.heavy + 0.6, g);
  ctx.save(); ctx.globalAlpha *= a;
  ARCH.edges.forEach((e, i) => {
    const A = ptOf(e[0]), Bp = ptOf(e[1]), m = [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2 + 150 * heavy * (0.7 + 0.3 * K.hash(i, 4))];
    K.line(ctx, [A, m, Bp], { stroke: P.ink, w: 16, boil: 1.4, seed: 3400 + i, gap: 0, alpha: 0.85 });
    K.line(ctx, [A, m, Bp], { stroke: P.route, w: 7, boil: 1.4, seed: 3400 + i, gap: 0.1 });
  });
  ARCH.nodes.forEach((n) => {
    ctx.save(); ctx.translate(n.x, n.y); ctx.scale(n.s, n.s);
    K.shape(ctx, K.blobPts(0, 10, 150, 72, 12, n.seed, 0.16), { fill: P.sand, w: 7, boil: 1.6, seed: n.seed, shade: { color: P.sandDark, dx: 0, dy: -16 } });
    K.shape(ctx, K.blobPts(-8, -6, 100, 46, 10, n.seed + 1, 0.18), { fill: P.grass, w: 6, boil: 1.6, seed: n.seed + 2 });
    K.coin(ctx, -40, -100, 70, { color: n.c, seed: n.seed + 3 });
    ctx.restore();
  });
  /* x tokens light up route by route, outward from the triangle; then become iron weights */
  ARCH.edges.forEach((e, i) => {
    const A = ptOf(e[0]), Bp = ptOf(e[1]);
    const t0 = K.lerp(B.chain, B.incredibly - 0.4, K.clamp(distC([(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2]) / 3600, 0, 1)) + 0.15 * K.hash(i, 9);
    if (K.hash(i, 23) > 0.55) return; /* about half the routes carry a token: dense, still readable */
    const u = pop(g, t0, 0.35); if (u <= 0) return;
    const m = [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2 + 150 * heavy * (0.7 + 0.3 * K.hash(i, 4))];
    if (heavy < 0.5) K.tag(ctx, m[0], m[1] - 40, "×", { a: u, size: 120, seed: 3600 + i, font: K.FONT.mono, hot: true });
    else ironWeight(ctx, m[0], m[1] + 20 * (heavy - 0.5) * 2, 1.25, 3600 + i);
  });
  ctx.restore();
}
/* an iron weight with an x on it (multiplication = heavy) */
function ironWeight(ctx, x, y, s, seed) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.line(ctx, K.ellipsePts(0, -78, 22, 18, 10).concat([[22, -78]]), { stroke: P.ink, w: 9, boil: 0.8, seed, gap: 0 });
  K.shape(ctx, [[-44, -60], [44, -60], [62, 40], [-62, 40]], { fill: P.ironDark, w: 6, boil: 1, seed: seed + 1, shade: { color: P.ink, dx: -14, dy: 0 } });
  K.text(ctx, "×", 0, -6, { size: 80, weight: 700, font: K.FONT.mono, fill: P.paper });
  ctx.restore();
}

/* ---------- the CPU: a clockwork engine swallowing x weights ---------- */
function cpuEngine(g, a) {
  if (a <= 0) return;
  const load = K.ss(B.multiplication, B.millions + 0.8, g), burst = K.ss(B.highly, B.highly + 0.3, g);
  const shake = (K.hash(K.bf, 61) - 0.5) * 14 * load;
  const [x, y] = CPU;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x + shake, y);
  /* chute from the upper left carrying x weights into the hopper */
  K.line(ctx, [[-760, -520], [-300, -260]], { stroke: P.ink, w: 30, boil: 1, seed: 3801, gap: 0 });
  K.line(ctx, [[-760, -520], [-300, -260]], { stroke: P.wood, w: 18, boil: 1, seed: 3801, gap: 0 });
  const rate = 0.5 + 3.5 * load;
  for (let i = 0; i < 6; i++) {
    const ph = ((g - B.multiplication + 6) * rate * 0.25 + i / 6) % 1;
    if (g < B.multiplication - 0.5) break;
    const px = K.lerp(-760, -260, ph), py = K.lerp(-560, -250, ph) + (ph > 0.85 ? (ph - 0.85) * 900 : 0);
    ironWeight(ctx, px, py, 0.55, 3810 + i);
  }
  /* hopper */
  K.shape(ctx, [[-330, -250], [-180, -250], [-210, -150], [-300, -150]], { fill: P.iron, w: 6, boil: 1, seed: 3820, shade: { color: P.ironDark, dx: 10, dy: 0 } });
  /* body */
  K.shape(ctx, K.rectPts(-260, -160, 520, 360, 4), { fill: P.iron, w: 7, boil: 1.2, seed: 3830, shade: { color: P.ironDark, dx: -22, dy: -18 }, hatch: { ang: -0.8, gap: 16, alpha: 0.18, color: P.ink } });
  for (let i = 0; i < 12; i++) K.dot(ctx, -236 + i * 43, -138, 5, P.rivet, P.ink, 2, 3840 + i);
  for (let i = 0; i < 12; i++) K.dot(ctx, -236 + i * 43, 178, 5, P.rivet, P.ink, 2, 3860 + i);
  /* gears on top, spinning faster with load, juddering */
  const spin = (g - SCENE.start) * (0.8 + 9 * load) + shake * 0.02;
  [[-120, -230, 80, 1], [10, -270, 60, -1], [120, -220, 50, 1]].forEach((c, i) => {
    ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(spin * c[3] * (60 / c[2])); K.cog(ctx, 0, 0, c[2], i === 1 ? P.ironLight : P.rust, 3880 + i); ctx.restore();
  });
  /* chimney + smoke */
  K.shape(ctx, K.rectPts(170, -330, 60, 170, 2), { fill: P.ironDark, w: 6, boil: 1, seed: 3890 });
  for (let k = 0; k < 5; k++) {
    const age = ((g * (0.6 + 1.4 * load)) % 1) + k;
    const sx = 200 + age * 50 + Math.sin(age * 2 + k) * 14, sy = -360 - age * 70, r = 24 + age * 18 + 30 * burst;
    K.shape(ctx, K.blobPts(sx, sy, r, r * 0.8, 9, 3900 + k, 0.2), { fill: load > 0.6 ? "#b9b2a8" : "#e9e4da", stroke: P.inkSoft, w: 5, boil: 1.2, seed: 3910 + k, alpha: K.clamp(1 - age / 5, 0, 1) * (0.4 + 0.6 * K.ss(B.multiplication - 1, B.multiplication, g)) });
  }
  /* label plate */
  K.shape(ctx, K.rectPts(-120, -110, 240, 100, 3), { fill: P.paper, w: 5, boil: 1, seed: 3920 });
  const flash = K.ss(B.cpu - 0.1, B.cpu + 0.1, g) * (1 - K.ss(B.cpu + 0.7, B.cpu + 1.1, g));
  if (flash > 0) K.glow(ctx, 0, -60, 200, "rgba(255,200,120,0.9)", flash);
  K.text(ctx, TXT.cpu, 0, -56, { size: 76, weight: 900, fill: P.ink });
  /* pressure gauge: needle runs into the red */
  const gx = 140, gy = 90;
  K.shape(ctx, K.ellipsePts(gx, gy, 72, 72, 18), { fill: P.paper, w: 6, boil: 1, seed: 3930 });
  ctx.save(); ctx.beginPath(); ctx.moveTo(gx, gy); ctx.arc(gx, gy, 62, -0.6, 0.6); ctx.closePath(); ctx.fillStyle = P.loss; ctx.globalAlpha *= 0.85; ctx.fill(); ctx.restore();
  const ang = K.lerp(-2.6, 0.35, load) + 0.08 * Math.sin(g * 25) * load;
  K.line(ctx, [[gx, gy], [gx + Math.cos(ang) * 58, gy + Math.sin(ang) * 58]], { stroke: P.ink, w: 7, boil: 0.6, seed: 3931, gap: 0 });
  K.dot(ctx, gx, gy, 9, P.ink, P.ink, 2, 3932);
  /* furnace mouth glowing with load */
  K.shape(ctx, K.rectPts(-200, 40, 200, 110, 3), { fill: K.mix("#3a2a22", "#ff8a3d", load), w: 6, boil: 1, seed: 3940 });
  if (load > 0) K.glow(ctx, -100, 95, 200, "rgba(255,150,60,0.9)", 0.6 * load);
  /* sweat drops flying off */
  if (load > 0.2) for (let i = 0; i < 8; i++) {
    const ph = (g * 1.6 + i * 0.37) % 1, sd = i % 2 ? 1 : -1;
    const dx = sd * (280 + ph * 220), dy = -120 - 160 * Math.sin(ph * Math.PI) + ph * 200;
    K.shape(ctx, [[dx, dy - 22], [dx + 12, dy + 4], [dx, dy + 14], [dx - 12, dy + 4]], { fill: "#bfe6ec", w: 4, boil: 0.6, seed: 3950 + i, gap: 0, alpha: (1 - ph) * load });
  }
  /* steam burst at "highly inefficient" */
  if (burst > 0) for (let i = 0; i < 7; i++) {
    const r = 60 + 120 * K.ss(B.highly, B.highly + 0.9, g) + 20 * i, an = -1.5 + (i - 3) * 0.32;
    K.shape(ctx, K.blobPts(Math.cos(an) * (180 + r), -160 + Math.sin(an) * (160 + r * 0.6), 50 + 10 * i, 40, 9, 3960 + i, 0.25), { fill: "#f4f1ea", stroke: P.inkSoft, w: 5, boil: 1.4, seed: 3970 + i, alpha: burst * (1 - K.ss(SCENE.end - 0.8, SCENE.end, g) * 0.3) });
  }
  ctx.restore();
}

/* the duo with an optional crab pose tweak (math identical to HOST.duo defaults) */
function duo(ctx, g, o, mod) {
  const s = 1.15, x = 300, y = 1010 + 5 * Math.sin(g * 1.5);
  const px = x + 205 * s, py = y - 8 * s;
  HOST.raft(ctx, x + 90 * s, y + 6 * s, s, g);
  K.perch(ctx, px, py, 92 * s, 731);
  K.parrot(ctx, px, py - 92 * s, s * 0.95, HOST.parrotPose(g, Object.assign({}, o, { _px: px })));
  const st = HOST.crabPose(g, Object.assign({}, o, { x, y, s }));
  if (mod) mod(st);
  K.crab(ctx, x, y, s, st);
}

function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 5 });

  /* the far archipelago fades in as the camera pulls back */
  drawArch(g, K.ss(B.logistically, B.massive + 0.6, g));
  /* keep the original triangle findable in the crowd */
  const tg = hold(g, B.massive, B.frequency, 0.6);
  if (tg > 0) K.glow(ctx, 1350, 680, 900, "rgba(255,225,130,0.9)", 0.55 * tg);

  /* the triangle: each formula term lights its leg; the loop stays gold */
  const fz = K.ss(B.formula, B.formula + 1.4, g);
  LEGS.forEach((L, li) => {
    const lu = LU[li];
    K.edge(ctx, N[L[0]], N[L[1]], Object.assign({ seed: L[3], arrow: 1, arrowS: 1.4, label: L[2], labelSize: K.lerp(39, 46, fz), lu, au: lu < 0.5 ? 0.66 : 0.4, state: "hot" }, EDGE));
    const term = FORM.find((f) => f[3] === li), pulse = term ? hold(g, term[1] - 0.1, term[2] + 0.6, 0.2) : 0;
    if (pulse > 0) { const q = K.edgePoint(N[L[0]], N[L[1]], EDGE.bend, 0.5); K.glow(ctx, q[0], q[1], 260, "rgba(255,230,140,0.95)", 0.8 * pulse); }
  });
  ["ETH", "USDT", "BTC"].forEach((k) => K.node(ctx, N[k][0], N[k][1], NODE_S, { label: k, color: P[k], seed: SEEDS[k], palms: k === "ETH" ? 2 : 1, lighthouse: k === "USDT" }));
  /* loop indices (i3 slides below ETH, away from the parrot) */
  const i3 = [K.lerp(-260, -40, fz), K.lerp(-60, 200, fz)];
  [["BTC", "i_1", [190, -40]], ["USDT", "i_2", [40, 175]], ["ETH", "i_3", i3]].forEach(([k, s, off], i) => {
    richTag(ctx, N[k][0] + off[0], N[k][1] + off[1], s, { a: 1, size: K.lerp(52, 60, fz), seed: 2830 + i, hot: true });
  });
  /* "more than you started with": the BTC pile grows */
  const pileA = hold(g, B.multiplying, B.logistically + 0.6, 0.4);
  if (pileA > 0) {
    /* a tower of BTC-gold coins beside the BTC island: 3 coins in, 12 coins out */
    const grow = 9 * K.ss(B.more, B.started + 0.5, g), n = 3 + Math.floor(grow), fr = grow - Math.floor(grow);
    const c = coinAt("BTC"), tx = c[0] - 190, ty = N.BTC[1] + 30;
    ctx.save(); ctx.globalAlpha *= pileA;
    for (let i = 0; i < n + (fr > 0 ? 1 : 0); i++) {
      const drop = i === n ? (1 - fr) * 160 : 0;
      K.goldBit(ctx, tx + 4 * K.hs(i, 31), ty - i * 17 - drop, 46, 2900 + i, 0.04 * K.hs(i, 32));
    }
    ctx.restore();
    if (g > B.more) for (let i = 0; i < 3; i++) { const ph = (g * 1.3 + i * 0.33) % 1; K.sparkle(ctx, tx - 60 + i * 60, ty - n * 17 - 30 - ph * 40, 30 * Math.sin(ph * Math.PI), pileA, 2910 + i); }
  }

  cpuEngine(g, K.ss(B.itIs, B.frequency, g));
  /* "your magical flight path": a gold mini ship sails the loop, leg by leg */
  const sailU = K.inv(B.multiplying, B.magical + 0.8, g);
  if (sailU > 0 && sailU < 1) {
    const li = Math.min(2, Math.floor(sailU * 3)), u = sailU * 3 - li, L = LEGS[li], A = N[L[0]], Bp = N[L[1]];
    const tt = K.clamp(EDGE.trim / Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), 0, 0.45), q = K.edgePoint(A, Bp, EDGE.bend, K.lerp(tt, 1 - tt, K.E.inOut(u)));
    K.miniShip(ctx, q[0], q[1], 0.5, { heading: q[2], coins: 6 });
  }

  /* ---------- screen-space boards ---------- */
  K.screen(ctx);
  /* s02b boards leave: the R(i, j) slate and the product plank fly right */
  const off = K.E.in3(K.clamp((g - B.formula) / 0.8, 0, 1)) * 900;
  if (off < 899) {
    K.slate(ctx, 1590 + off, 340, 500, 270, [], { seed: 2860 });
    ctx.save(); ctx.translate(1590 + off, 340);
    K.text(ctx, TXT.rij, -210, -62, { size: 76, weight: 700, font: K.FONT.mono, fill: P.chalk, align: "left" });
    TXT.rijBody.forEach((ln, i) => K.text(ctx, ln, -210, 30 + i * 48, { size: 36, weight: 500, font: K.FONT.mono, fill: P.chalk, align: "left" }));
    ctx.restore();
    K.glow(ctx, 1640 + off, 650, 200, "rgba(255,220,120,0.9)", 0.6 * (1 - off / 900));
    K.plank(ctx, 1640 + off, 650, 380, 150, TXT.product, { size: 52, post: false, seed: 2850, colors: [P.ink, P.goldDark] });
  }
  /* header plank glides to the centre top, the formula slate drops in under it, both lift away at "logistically" */
  const lift = K.E.in3(K.clamp((g - B.logistically) / 0.9, 0, 1)) * 520;
  const hx = K.lerp(1440, 1010, K.E.inOut(K.clamp((g - B.formula) / 1.0, 0, 1))), hy = K.lerp(112, 104, fz) - lift;
  if (hy > -80) K.plank(ctx, hx, hy, 700, 88, [TXT.header], { size: 34, post: false, seed: 2870, colors: [P.rustDark] });
  const fa = pop(g, B.formula + 0.5, 0.45);
  if (fa > 0 && lift < 519) {
    const fy = 262 - lift;
    K.slate(ctx, 1010, fy, 1560, 150, [], { a: fa, seed: 2880 });
    const size = 56;
    const total = FORM.reduce((s, f) => s + richW(ctx, f[0], size), 0);
    let x = 1010 - total / 2;
    FORM.forEach((f) => {
      const n = Math.floor(glyphs(f[0]) * K.inv(f[1], f[2], g));
      const w = richW(ctx, f[0], size);
      if (n > 0 && fa >= 1) {
        const gl = f[4] ? K.ss(f[2], f[2] + 0.3, g) : 0;
        if (gl > 0) K.glow(ctx, x + w / 2, fy, 140, "rgba(255,210,90,0.9)", 0.5 * gl);
        rich(ctx, f[0], x, fy + 2, { size, n, fill: f[4] ? P.profit : P.chalk });
      }
      x += w;
    });
  }

  /* ---------- hosts ---------- */
  const reacts = [
    { at: B.r1 - 0.2, kind: "nod", dur: 1.0 },
    { at: B.oneEnd - 0.1, kind: "grin", dur: 1.6 },
    { at: B.exactly, kind: "thumbs", dur: 1.4 },
    { at: B.tracking, kind: "think", dur: 1.8 },
    { at: B.heavy - 0.3, kind: "worry", dur: 2.2 },
    { at: B.cpu - 0.2, kind: "surprise", dur: 1.2 },
    { at: B.highly - 0.1, kind: "worry", dur: 2.0 },
  ];
  const preacts = [
    { at: B.oneEnd, kind: "grin", dur: 1.2 },
    { at: B.magical - 0.2, kind: "flap", dur: 1.1 },
    { at: B.heavy - 0.2, kind: "worry", dur: 2.0 },
    { at: B.millions, kind: "surprise", dur: 1.2 },
  ];
  /* point at the term being read, then at the CPU */
  let pt = [600, 262], amt = 0;
  FORM.forEach((f, i) => { if (g > f[1] - 0.2 && g < f[2] + 0.4 && f[3] >= 0) { amt = hold(g, f[1] - 0.2, f[2] + 0.4, 0.2); pt = [380 + i * 170, 262]; } });
  const cpuPt = hold(g, B.multiplication, B.cpu + 1.2, 0.3);
  if (cpuPt > 0) { amt = cpuPt; pt = K.toScreen(CPU[0], CPU[1]); }
  duo(ctx, g, { reacts, preacts, point: pt, pointAmt: amt }, (st) => {
    /* head shake: "it is highly inefficient" */
    const sh = hold(g, B.highly, B.inefficient + 0.8, 0.15);
    if (sh > 0) { st.lean = (st.lean || 0) + 8 * Math.sin((g - B.highly) * 16) * sh; st.look = [Math.sin((g - B.highly) * 16) * 0.9, 0.1]; }
  });
}

RUN(draw);
