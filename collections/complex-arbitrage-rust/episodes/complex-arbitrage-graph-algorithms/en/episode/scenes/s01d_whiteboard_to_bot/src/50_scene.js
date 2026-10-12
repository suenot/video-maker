/* ============================================================
   s01d 141.9 - 181.5  "From the whiteboard to a sub-ms bot: not risk-free; we need a model"
   Chart set (wave in from s01c).
   143.6  the source's claim "RISK-FREE" goes up on a plank
   145.7  the journey: a route leaves the whiteboard island (slate with the cycle formula) ...
   148.6  ... for the sub-millisecond trading bot island (an iron robot, "< 1 ms")
   151.5  "fraught with profound engineering challenges": zoom out, reefs, whirlpool, storm on the route
   155.9  "not exactly risk free" / 159.9 "anything but risk free": the plank is crossed out in red
   160.6  "deploy it into the real world": a ship tries the route and spins in the whirlpool
   162.3  "Challenge accepted"
   164.6  bots hunt for profit (robot scans), 167.0 "unleash them into the chaos": tangled prices
   170.5  "a structural language computers understand": the chaos straightens into a graph
   174.4  "We need a model": the crab unrolls a chart; 176.1 "map the market": the graph is drawn on it
   Ends with a wave.
   ============================================================ */
const TXT = {
  claim: "“RISK-FREE”",
  bot: "< 1 ms",
};
const B = {
  risk: NR.cue("risk", 143),
  journey: NR.cue("journey", 145),
  whiteboard: NR.cue("whiteboard", 147),
  functioning: NR.cue("functioning", 148),
  bot: NR.cue("bot", 150.5),
  fraught: NR.cue("fraught", 151),
  challenges: NR.cue("challenges", 153),
  notRisk: NR.cue("risk", 155.5),
  far: NR.cue("far", 156.8),
  anyRisk: NR.cue("risk", 159.5),
  deploy: NR.cue("deploy", 160),
  world: NR.cue("world", 161),
  challenge: NR.cue("challenge", 162),
  bots: NR.cue("bots", 164),
  hunt: NR.cue("hunt", 165.5),
  unleash: NR.cue("unleash", 166.5),
  chaos: NR.cue("chaos", 167.5),
  translate: NR.cue("translate", 168.5),
  structural: NR.cue("structural", 170),
  understand: NR.cue("understand", 172),
  model: NR.cue("model", 174),
  map: NR.cue("map", 175.8),
  navigate: NR.cue("navigate", 177.5),
  sets: NR.cue("sets", 179),
  foundational: NR.cue("foundational", 179.8),
};

/* ---------- world layout ---------- */
const WB = [700, 640], BOT = [3500, 640];
const ROUTE = [WB, [1400, 520], [2100, 720], [2800, 540], BOT];
const HAZ = { reef: [1400, 520], whirl: [2100, 720], storm: [2800, 540] };
const CH = [2100, 1750]; /* chaos zone centre */
const GN = [ /* the clean graph the chaos becomes (also drawn on the chart) */
  { t: "BTC", x: -430, y: -210 }, { t: "ETH", x: 0, y: -330 }, { t: "SOL", x: 430, y: -210 },
  { t: "USDT", x: 430, y: 210 }, { t: "EUR", x: 0, y: 330 }, { t: "BNB", x: -430, y: 210 },
];
const GE = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4]];

const CAM = K.mkTrack([
  [SCENE.start, { x: 980, y: 520, z: 0.8 }],
  [B.journey, { x: 1050, y: 520, z: 0.8 }],
  [B.functioning, { x: 1400, y: 560, z: 0.78 }],
  [B.bot + 0.3, { x: 3250, y: 520, z: 0.8 }],
  [B.fraught, { x: 3200, y: 540, z: 0.78 }],
  [B.challenges + 0.4, { x: 2120, y: 500, z: 0.52 }],
  [B.world, { x: 2120, y: 540, z: 0.54 }],
  [B.challenge + 0.6, { x: 2600, y: 560, z: 0.5 }],
  [B.bots, { x: 3300, y: 520, z: 0.82 }],
  [B.hunt + 0.6, { x: 3300, y: 530, z: 0.85 }],
  [B.unleash, { x: 3000, y: 900, z: 0.6 }],
  [B.chaos + 0.6, { x: 1820, y: 1700, z: 0.58 }],
  [B.understand, { x: 1800, y: 1700, z: 0.62 }],
  [B.model, { x: 1800, y: 1700, z: 0.6 }],
  [SCENE.end, { x: 1800, y: 1700, z: 0.64 }],
]);

/* ---------- helpers ---------- */
function formula(ctx, x, y, parts, size, upto, color) {
  let w = 0; const cw = K.textW(ctx, "M", size, 500, K.FONT.mono), sw = K.textW(ctx, "M", size * 0.62, 500, K.FONT.mono);
  parts.forEach((p) => (w += typeof p === "string" ? p.length * cw : p.sub.length * sw));
  let cx = x - w / 2, n = 0;
  parts.forEach((p) => {
    if (n >= upto) return;
    if (typeof p === "string") { const s = p.slice(0, Math.max(0, upto - n)); n += p.length; K.text(ctx, s, cx, y, { size, weight: 500, font: K.FONT.mono, fill: color, align: "left" }); cx += p.length * cw; }
    else { n += p.sub.length; K.text(ctx, p.sub, cx, y + size * 0.28, { size: size * 0.62, weight: 500, font: K.FONT.mono, fill: color, align: "left" }); cx += p.sub.length * sw; }
  });
}
const FW = ["R", { sub: "1" }, " × R", { sub: "2" }, " × … > 1"];

/* a polyline route sampled 0..u */
function routePts(u, n) {
  const pts = [], N = n || 60;
  for (let i = 0; i <= N * u; i++) {
    const v = (i / N) * (ROUTE.length - 1), k = Math.min(ROUTE.length - 2, Math.floor(v)), f = v - k;
    const A = ROUTE[k], Bp = ROUTE[k + 1], ss = f * f * (3 - 2 * f);
    pts.push([K.lerp(A[0], Bp[0], f), K.lerp(A[1], Bp[1], ss) + Math.sin(v * 3.1) * 30]);
  }
  return pts;
}
function routeAt(u) { const p = routePts(u, 120); return p[p.length - 1]; }

function robot(ctx, x, y, s, g, a) {
  const pa = K.E.back(K.clamp(a, 0, 1), 2); if (pa <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * pa, s * pa);
  const bob = Math.sin(g * 3) * 4;
  /* legs + body */
  K.limb(ctx, [[-36, 0], [-40, 60]], 12, P.ironDark, 1801); K.limb(ctx, [[36, 0], [40, 60]], 12, P.ironDark, 1802);
  K.shape(ctx, K.rectPts(-80, -120 + bob, 160, 130, 3), { fill: P.iron, w: 5, boil: 1.1, seed: 1803, shade: { color: P.ironDark, dx: -14, dy: 0 }, hatch: { ang: -0.8, gap: 12, alpha: 0.18, color: P.ink } });
  for (let i = 0; i < 6; i++) K.dot(ctx, -64 + i * 26, -106 + bob, 4, P.rivet, P.ink, 1.5, 1810 + i);
  ctx.save(); ctx.translate(0, -52 + bob); ctx.rotate(g * 2.2); K.cog(ctx, 0, 0, 34, P.rust, 1820); ctx.restore();
  /* arms with little pincers */
  const sw = Math.sin(g * 4) * 10;
  K.limb(ctx, [[-80, -90 + bob], [-120, -60 + sw], [-130, -20]], 10, P.ironDark, 1830);
  K.limb(ctx, [[80, -90 + bob], [120, -60 - sw], [130, -20]], 10, P.ironDark, 1831);
  /* head */
  K.shape(ctx, K.rectPts(-62, -220 + bob, 124, 92, 3), { fill: P.ironLight, w: 5, boil: 1.1, seed: 1840, shade: { color: P.iron, dx: -10, dy: 0 } });
  K.line(ctx, [[0, -220 + bob], [0, -262 + bob]], { stroke: P.ink, w: 5, boil: 0.8, seed: 1841, gap: 0 });
  K.dot(ctx, 0, -268 + bob, 10, P.loss, P.ink, 3, 1842);
  const scan = Math.sin(g * 5) * 10;
  [-1, 1].forEach((sd, i) => {
    K.shape(ctx, K.ellipsePts(sd * 28 + scan * 0.6, -178 + bob, 18, 18, 12), { fill: "#1b2a33", w: 4, boil: 0.7, seed: 1843 + i });
    K.glow(ctx, sd * 28 + scan * 0.6, -178 + bob, 30, "rgba(160,240,255,0.9)", 0.8);
    K.dot(ctx, sd * 28 + scan, -178 + bob, 7, "#bff4ff", null, 0, 1845 + i);
  });
  K.line(ctx, [[-30, -146 + bob], [30, -146 + bob]], { stroke: P.ink, w: 4, boil: 0.8, seed: 1847, gap: 0.3 });
  ctx.restore();
}
function stopwatch(ctx, x, y, r, g) {
  K.shape(ctx, K.ellipsePts(x, y, r, r, 16), { fill: P.paper, w: 5, boil: 1, seed: 1850, shade: { color: P.paperShade, dx: -8, dy: -8 } });
  K.shape(ctx, K.rectPts(x - 10, y - r - 18, 20, 16, 2), { fill: P.ironDark, w: 3, boil: 0.8, seed: 1851 });
  const a = g * 9;
  K.line(ctx, [[x, y], [x + Math.sin(a) * r * 0.75, y - Math.cos(a) * r * 0.75]], { stroke: P.loss, w: 5, boil: 0.6, seed: 1852, gap: 0 });
}
function reef(ctx, x, y, a) {
  const pa = K.E.back(K.clamp(a, 0, 1), 2); if (pa <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(pa, pa);
  [[-90, 20, 60], [10, -30, 80], [100, 30, 50], [-20, 70, 40]].forEach((r, i) => {
    K.line(ctx, K.ellipsePts(r[0], r[1] + 10, r[2] * 1.5, r[2] * 0.7, 12).concat([[r[0] + r[2] * 1.5, r[1] + 10]]), { stroke: P.foam, w: 6, boil: 2, seed: 1860 + i, gap: 0.25 });
    K.shape(ctx, K.blobPts(r[0], r[1], r[2], r[2] * 0.7, 9, 1870 + i, 0.3), { fill: P.rock, w: 5, boil: 1.3, seed: 1870 + i, shade: { color: "#7a6c5c", dx: 8, dy: 10 } });
  });
  ctx.restore();
}
function whirl(ctx, x, y, a, g) {
  const pa = K.E.back(K.clamp(a, 0, 1), 2); if (pa <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(pa, pa * 0.62);
  K.shape(ctx, K.ellipsePts(0, 0, 240, 240, 20), { fill: P.seaDeep, stroke: null, w: 0, boil: 1.4, seed: 1880 });
  for (let k = 0; k < 3; k++) {
    const pts = [];
    for (let i = 0; i < 40; i++) { const u = i / 40, ang = u * 9 + k * 2.1 - g * 3, r = 230 * (1 - u); pts.push([Math.cos(ang) * r, Math.sin(ang) * r]); }
    K.line(ctx, pts, { stroke: P.foam, w: 7, boil: 1.4, seed: 1881 + k, gap: 0.1 });
  }
  ctx.restore();
}
function storm(ctx, x, y, a, g) {
  const pa = K.E.back(K.clamp(a, 0, 1), 2); if (pa <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(pa, pa);
  /* rain streaks on the water */
  for (let i = 0; i < 14; i++) { const rx = -200 + i * 30, ry = ((g * 500 + i * 70) % 260) - 40; K.line(ctx, [[rx, ry], [rx - 14, ry + 40]], { stroke: "#cfe3ea", w: 4, boil: 0.6, seed: 1890 + i, gap: 0, alpha: 0.7 }); }
  SIDE.cloud(ctx, 0, -120, 1.6, 31, "#7d8893", "#5b6670");
  const fl = Math.floor(g * 3) % 4 === 0 ? 1 : 0;
  if (fl) K.shape(ctx, [[10, -100], [-30, -10], [0, -14], [-26, 80], [40, -30], [8, -26], [30, -100]], { fill: "#fff6c8", w: 4, boil: 1, seed: 1899 });
  ctx.restore();
}

/* the chart the crab unrolls (screen space) */
function chartScroll(ctx, cx, cy, w, h, u, draw, g) {
  if (u <= 0) return;
  const ww = w * K.E.out3(K.clamp(u, 0, 1));
  K.shape(ctx, K.rectPts(cx - ww / 2, cy - h / 2, ww, h, 4), { fill: P.paper, w: 5, boil: 1.3, seed: 1900, shade: { color: P.paperShade, dx: -14, dy: -14 } });
  [-1, 1].forEach((sd, i) => K.shape(ctx, K.ellipsePts(cx + sd * ww / 2, cy, 24, h / 2 + 14, 14), { fill: P.paperShade, w: 5, boil: 1.1, seed: 1901 + i }));
  if (u < 0.95) return;
  ctx.save(); ctx.beginPath(); ctx.rect(cx - ww / 2 + 20, cy - h / 2 + 10, ww - 40, h - 20); ctx.clip();
  /* faint grid + compass rose */
  for (let i = 1; i < 8; i++) K.line(ctx, [[cx - w / 2 + i * w / 8, cy - h / 2 + 20], [cx - w / 2 + i * w / 8, cy + h / 2 - 20]], { stroke: P.paperShade, w: 2, boil: 0.6, seed: 1910 + i, gap: 0.2 });
  for (let i = 1; i < 5; i++) K.line(ctx, [[cx - w / 2 + 30, cy - h / 2 + i * h / 5], [cx + w / 2 - 30, cy - h / 2 + i * h / 5]], { stroke: P.paperShade, w: 2, boil: 0.6, seed: 1920 + i, gap: 0.2 });
  const rx = cx + w / 2 - 110, ry = cy - h / 2 + 110;
  K.shape(ctx, [[rx, ry - 70], [rx + 14, ry], [rx, ry + 70], [rx - 14, ry]], { fill: P.rust, w: 3, boil: 0.8, seed: 1930 });
  K.shape(ctx, [[rx - 70, ry], [rx, ry - 14], [rx + 70, ry], [rx, ry + 14]], { fill: P.paperShade, w: 3, boil: 0.8, seed: 1931 });
  K.text(ctx, "N", rx, ry - 92, { size: 30, weight: 900, fill: P.ink });
  /* the graph, drawn edge by edge */
  const sx = 0.62, gx = cx - 90, gy = cy + 10;
  GE.forEach((e, i) => {
    const p = K.clamp(draw * GE.length - i, 0, 1); if (p <= 0) return;
    const A = [gx + GN[e[0]].x * sx, gy + GN[e[0]].y * sx * 0.95], Bp = [gx + GN[e[1]].x * sx, gy + GN[e[1]].y * sx * 0.95];
    const L = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), ux = (Bp[0] - A[0]) / L, uy = (Bp[1] - A[1]) / L;
    const a0 = [A[0] + ux * 52, A[1] + uy * 52], b1 = [K.lerp(a0[0], Bp[0] - ux * 58, p), K.lerp(a0[1], Bp[1] - uy * 58, p)];
    K.line(ctx, [a0, b1], { stroke: P.ink, w: 5, boil: 1, seed: 1940 + i, gap: 0 });
    if (p >= 1) { ctx.save(); ctx.translate(b1[0], b1[1]); ctx.rotate(Math.atan2(uy, ux)); K.shape(ctx, [[6, 0], [-16, -10], [-16, 10]], { fill: P.ink, w: 2, boil: 0.5, seed: 1950 + i, gap: 0 }); ctx.restore(); }
  });
  GN.forEach((n, i) => {
    const a = K.clamp(draw * 3 - i * 0.3, 0, 1); if (a <= 0) return;
    const s = K.E.back(a, 2), x = gx + n.x * sx, y = gy + n.y * sx * 0.95;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shape(ctx, K.ellipsePts(0, 0, 50, 50, 14), { fill: P[n.t], w: 4, boil: 0.9, seed: 1960 + i, shade: { color: K.shadeC(P[n.t], -0.2), dx: -6, dy: -6 } });
    K.text(ctx, n.t, 0, 2, { size: n.t.length > 3 ? 26 : 30, weight: 900, fill: P.paper });
    ctx.restore();
  });
  /* a little ship navigating the drawn map */
  if (g > B.navigate) {
    const u2 = K.clamp((g - B.navigate) / 2.6, 0, 1), e = GE[0], f = GE[1];
    const path = u2 < 0.5 ? [GN[e[0]], GN[e[1]], u2 * 2] : [GN[f[0]], GN[f[1]], (u2 - 0.5) * 2];
    const x = gx + K.lerp(path[0].x, path[1].x, path[2]) * sx, y = gy + K.lerp(path[0].y, path[1].y, path[2]) * sx * 0.95 - 74;
    K.ship(ctx, x, y, 0.26, { dir: 1, rock: Math.sin(g * 3) * 4, sail: 1 });
  }
  ctx.restore();
}

function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 9 });

  /* hazards under the route */
  reef(ctx, HAZ.reef[0], HAZ.reef[1] + 170, pop(g, B.fraught, 0.5));
  whirl(ctx, HAZ.whirl[0], HAZ.whirl[1] + 40, pop(g, B.fraught + 0.9, 0.5), g);
  /* the route: dashed rope from whiteboard to bot */
  const ru = K.E.inOut(span(g, B.journey, B.bot + 0.4));
  if (ru > 0) {
    const pts = routePts(ru);
    K.line(ctx, pts, { stroke: P.ink, w: 14, boil: 1.2, seed: 1700, gap: 0 });
    for (let i = 0; i < pts.length - 1; i += 2) K.line(ctx, [pts[i], pts[i + 1]], { stroke: P.route, w: 7, boil: 0.8, seed: 1701 + i, gap: 0 });
  }
  /* whiteboard island + slate */
  K.island(ctx, WB[0], WB[1], 0.9, { seed: 51, palms: 1 });
  K.slate(ctx, WB[0] + 60, WB[1] - 290, 560, 140, [], { seed: 1710 });
  const wbHot = hold(g, B.whiteboard - 0.1, B.whiteboard + 1.6, 0.25);
  if (wbHot > 0) K.glow(ctx, WB[0] + 60, WB[1] - 290, 400, "rgba(255,240,170,0.8)", 0.5 * wbHot);
  formula(ctx, WB[0] + 60, WB[1] - 290, FW, 56, 99, P.chalk);
  /* bot island */
  K.island(ctx, BOT[0], BOT[1], 0.95, { seed: 57, palms: 1 });
  robot(ctx, BOT[0] - 20, BOT[1] - 30, 1.0, g, pop(g, B.bot - 0.6, 0.5));
  if (g > B.bot - 0.2) { stopwatch(ctx, BOT[0] + 210, BOT[1] - 280, 56, g); K.tag(ctx, BOT[0] + 210, BOT[1] - 150, TXT.bot, { size: 46, seed: 1720, a: pop(g, B.bot) }); }
  /* scanning beam while the bot hunts */
  const hunt = hold(g, B.bots, B.unleash + 0.6, 0.4);
  if (hunt > 0) { const a = Math.PI * 0.9 + Math.sin((g - B.bots) * 1.6) * 0.5; ctx.save(); ctx.globalAlpha *= 0.3 * hunt; ctx.fillStyle = "#bff4ff"; ctx.beginPath(); ctx.moveTo(BOT[0] - 20, BOT[1] - 210); ctx.lineTo(BOT[0] - 20 + Math.cos(a) * 1200, BOT[1] - 210 + Math.sin(a) * 1200 - 140); ctx.lineTo(BOT[0] - 20 + Math.cos(a) * 1200, BOT[1] - 210 + Math.sin(a) * 1200 + 140); ctx.fill(); ctx.restore(); }
  storm(ctx, HAZ.storm[0], HAZ.storm[1] - 40, pop(g, B.fraught + 1.8, 0.5), g);

  /* the test ship: deployed into the real world, spins in the whirlpool */
  if (g > B.deploy - 0.6 && g < B.bots) {
    const u = K.E.inOut(span(g, B.deploy - 0.6, B.world + 0.4)) * 0.5;
    let p = routeAt(Math.max(0.02, u)), spin = 0;
    const sp = span(g, B.world + 0.4, B.challenge + 1.6);
    if (sp > 0) { const ang = sp * 14, r = 160 * (1 - sp); p = [HAZ.whirl[0] + Math.cos(ang) * r, HAZ.whirl[1] + 40 + Math.sin(ang) * r * 0.62]; spin = ang; }
    K.miniShip(ctx, p[0], p[1], 0.75 * (1 - 0.6 * sp), { heading: spin || 0, coins: 0 });
    if (sp > 0) for (let i = 0; i < 4; i++) { const a = i * 1.6 + sp * 6; K.goldBit(ctx, p[0] + Math.cos(a) * 140 * sp, p[1] - 80 - 200 * sp + 300 * sp * sp + i * 10, 18, 1730 + i, a); }
  }

  /* chaos -> structural graph */
  const chA = pop(g, B.unleash - 0.4, 0.6) * (1 - K.ss(B.model - 0.2, B.model + 0.5, g));
  if (chA > 0) {
    const m = K.E.inOut(span(g, B.structural, B.understand + 0.2));
    /* tangled routes straighten into edges */
    GE.forEach((e, i) => {
      const A = [CH[0] + GN[e[0]].x, CH[1] + GN[e[0]].y], Bp = [CH[0] + GN[e[1]].x, CH[1] + GN[e[1]].y];
      if (m < 1) {
        const pts = [];
        for (let k = 0; k <= 10; k++) {
          const u = k / 10, w = Math.sin(u * Math.PI) * (1 - m);
          pts.push([K.lerp(A[0], Bp[0], u) + w * (K.hs(i * 11 + k, 3) * 260 + Math.sin(g * 3 + k + i) * 40), K.lerp(A[1], Bp[1], u) + w * (K.hs(i * 13 + k, 4) * 260 + Math.cos(g * 2.6 + k) * 40)]);
        }
        K.line(ctx, pts, { stroke: m > 0.5 ? P.ink : P.loss, w: 8, boil: 2, seed: 1740 + i, gap: 0.05, alpha: chA * (0.55 + 0.45 * m) });
      } else { ctx.save(); ctx.globalAlpha *= chA; K.edge(ctx, A, Bp, { bend: 0, trim: 150, seed: 1750 + i, arrow: 1, arrowS: 1.4 }); ctx.restore(); }
    });
    /* nodes: jumbled price coins fly into place, islands pop under them */
    GN.forEach((n, i) => {
      const home = [CH[0] + n.x, CH[1] + n.y], wild = [CH[0] + K.hs(i, 8) * 700 + Math.sin(g * 2 + i) * 50, CH[1] + K.hs(i, 9) * 450 + Math.cos(g * 1.7 + i) * 50];
      const x = K.lerp(wild[0], home[0], m), y = K.lerp(wild[1], home[1], m);
      if (m >= 0.98) { ctx.save(); ctx.globalAlpha *= chA; K.node(ctx, home[0], home[1], 0.75, { label: n.t, color: P[n.t], seed: 80 + i * 7, palms: 1, a: pop(g, B.understand - 0.2 + i * 0.1, 0.4) }); ctx.restore(); }
      else { ctx.save(); ctx.globalAlpha *= chA; ctx.translate(x, y); ctx.rotate((1 - m) * Math.sin(g * 2 + i) * 0.8); K.coin(ctx, 0, 0, 72, { color: P[n.t], label: n.t, seed: 1760 + i, labelColor: P.paper, size: n.t.length > 3 ? 30 : 36, spin: (1 - m) * 0.25 * Math.sin(g * 3 + i) }); ctx.restore(); }
    });
    /* loose price tags tumbling in the chaos (they settle as weights later in the series) */
    if (m < 1) for (let i = 0; i < 7; i++) {
      const x = CH[0] + K.hs(i + 20, 8) * 900 + Math.sin(g * 1.3 + i) * 80, y = CH[1] + K.hs(i + 20, 9) * 520 + Math.cos(g * 1.1 + i) * 60;
      ctx.save(); ctx.globalAlpha *= chA * (1 - m); ctx.translate(x, y); ctx.rotate(Math.sin(g * 2 + i) * 0.5);
      K.tag(ctx, 0, 0, ["62 010", "3 270", "0.0525", "148.2", "1.084", "61 985", "0.0453"][i], { size: 40, seed: 1770 + i });
      ctx.restore();
    }
  }

  /* ---------- screen space ---------- */
  K.screen(ctx);
  /* the source's claim, then crossed out */
  const pa = pop(g, B.risk, 0.45) * (1 - K.ss(B.bots - 0.6, B.bots, g));
  if (pa > 0) {
    const shake = (g > B.notRisk && g < B.notRisk + 0.4) || (g > B.anyRisk && g < B.anyRisk + 0.4) ? Math.sin(g * 60) * 6 : 0;
    const px = 1480 + shake, py = 140;
    K.plank(ctx, px, py, 520, 120, [TXT.claim], { a: pa, size: 58, post: false, colors: ["#2f8a3e"], seed: 1780, font: K.FONT.display, weight: 900 });
    const c1 = span(g, B.notRisk, B.notRisk + 0.35), c2 = span(g, B.anyRisk, B.anyRisk + 0.35);
    if (c1 > 0) K.line(ctx, [[px - 250, py - 52], [K.lerp(px - 250, px + 250, c1), K.lerp(py - 52, py + 52, c1)]], { stroke: P.loss, w: 16, boil: 1.2, seed: 1781, gap: 0 });
    if (c2 > 0) K.line(ctx, [[px + 250, py - 52], [K.lerp(px + 250, px - 250, c2), K.lerp(py - 52, py + 52, c2)]], { stroke: P.loss, w: 16, boil: 1.2, seed: 1782, gap: 0 });
  }
  /* "We need a model": the crab unrolls a chart */
  const sc = span(g, B.model - 0.2, B.model + 0.7);
  chartScroll(ctx, 1200, 470, 1080, 600, sc, span(g, B.map, B.navigate + 0.6), g);

  let point = null, pointAmt = 0;
  if (g < B.bot + 2) { point = K.toScreen(WB[0] + 60, WB[1] - 290); pointAmt = hold(g, B.whiteboard - 0.2, B.functioning + 0.6, 0.3); }
  else if (g < B.challenge) { point = K.toScreen(HAZ.whirl[0], HAZ.whirl[1]); pointAmt = hold(g, B.fraught + 0.2, B.challenges + 1.8, 0.3); }
  else if (g < B.model) { point = K.toScreen(CH[0], CH[1]); pointAmt = hold(g, B.translate, B.understand + 0.8, 0.3); }
  else { point = [900, 470]; pointAmt = hold(g, B.map - 0.2, B.navigate + 1.2, 0.3); }
  HOST.duo(ctx, g, {
    point, pointAmt,
    ppoint: [1480, 140], ppointAmt: hold(g, B.notRisk - 0.3, B.far, 0.3),
    reacts: [
      { at: B.risk + 0.2, kind: "think", dur: 1.6 },
      { at: B.fraught, kind: "worry", dur: 2.2 },
      { at: B.anyRisk - 0.2, kind: "shrug", dur: 1.4 },
      { at: B.world + 0.5, kind: "surprise", dur: 1.3 },
      { at: B.challenge, kind: "grin", dur: 1.6 },
      { at: B.chaos, kind: "worry", dur: 1.6 },
      { at: B.model - 0.3, kind: "jump", dur: 1.2 },
      { at: B.sets, kind: "thumbs", dur: 1.8 },
    ],
    preacts: [
      { at: B.notRisk - 0.4, kind: "worry", dur: 1.6 },
      { at: B.world + 0.6, kind: "surprise", dur: 1.0 },
      { at: B.challenge, kind: "flap", dur: 1.4 },
      { at: B.structural, kind: "think", dur: 1.8 },
      { at: B.foundational, kind: "grin", dur: 1.4 },
    ],
  });
}

RUN(draw);
