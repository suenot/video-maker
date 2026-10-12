/* ============================================================
   s01b 62.3 - 103.2  "Welcome aboard: the article, the title, risk-free?"
   Side set (opens on the spyglass iris from s01a):
     62.3  "Welcome to a brand new deep dive": calm sea again, hosts greet
     64.2  "decode a ... technical article": a message in a bottle bobs up, cork pops
     68.7  "published on February 23rd, 2026 by ... suenot": the scroll unrolls with the byline
     74.6  "The piece is titled ...": ribbon banner, the title words land as they are read
     80.0  subtitle parchment under the banner (held ~7 s)
     86.0  "living, breathing map": the camera tilts down onto the chart of the sea
   Chart set:
     87.6  "thousands of prices shifting every single second": islands with flickering quotes
     91.2  "temporary price discrepancies": the two BTC islands glow, 61 970 vs 62 060
     98.5  "quote, risk free profit": gold plank, then a red question stamp
    100.9  "the simple stuff": everything but the two BTC islands clears (cut into s01c)
   ============================================================ */
const TXT = {
  byline: ["suenot", "2026-02-23", "Part 1 of the series", "“Complex Arbitrage Chains Between Futures and Spot”"],
  bylineLabels: ["Author", "Date"],
  title1: ["Graph", "Algorithms", "for", "Arbitrage", "Detection:"],
  title2: ["From", "Bellman-Ford", "to", "RICH"],
  subtitle: "How negative cycles, multi-asset graphs, and the RICH algorithm identify arbitrage opportunities in the deep cryptocurrency market with sub-millisecond precision.",
  quoteRF: "“risk-free profit”",
  btcA: "61 970", btcB: "62 060",
};
const B = {
  welcome: NR.cue("welcome", 62),
  decode: NR.cue("decode", 65),
  article: NR.cue("article", 68),
  published: NR.cue("published", 68.5),
  february: NR.cue("february", 69),
  year: NR.cue("2026", 70),
  name: NR.cue(/suanaut/i, 72.5),
  titled: NR.cue("titled", 74.5),
  t1: [NR.cue("graph", 75), NR.cue("algorithms", 75.5), NR.cue("for", 76.5), NR.cue("arbitrage", 76.8), NR.cue("detection", 77.2)],
  t2: [NR.cue("from", 77.8), NR.cue(/belmond/i, 78.5), NR.cue("to", 79.5), NR.cue("rich", 79.8)],
  wild: NR.cue("wild", 82),
  imagine: NR.cue("imagine", 83),
  map: NR.cue("map", 86.5),
  thousands: NR.cue("thousands", 88),
  shifting: NR.cue("shifting", 89),
  chaos: NR.cue("chaos", 91.5),
  discrep: NR.cue("discrepancies", 93),
  claims: NR.cue("claims", 96.5),
  quote: NR.cue("quote", 98),
  risk: NR.cue("risk", 99),
  but: NR.cue("but", 100.5),
  simple: NR.cue("simple", 101.8),
};
const T_TILT = [B.map - 0.6, B.map + 1.0]; /* horizon tilt-down into the chart set */
const CHART_AT = T_TILT[1];

/* ---------- side set props ---------- */
function bottle(ctx, x, y, g, cork) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5 + 0.12 * Math.sin(g * 2.1));
  K.shape(ctx, [[-22, 40], [-22, -10], [-10, -30], [-10, -58], [10, -58], [10, -30], [22, -10], [22, 40]], { fill: "#9fd3c0", w: 4.5, boil: 1, seed: 2001, alpha: 0.95, shade: { color: "#6fb39c", dx: 8, dy: 0 } });
  K.shape(ctx, K.rectPts(-14, -10, 28, 40, 2), { fill: P.paper, w: 3, boil: 0.8, seed: 2002 }); /* the rolled letter inside */
  if (cork < 1) {
    const u = K.clamp(cork, 0, 1), cx = 40 * u, cy = -70 - 140 * u + 160 * u * u;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(u * 7);
    K.shape(ctx, K.rectPts(-9, -10, 18, 18, 2), { fill: P.wood, w: 3.5, boil: 0.8, seed: 2003 }); ctx.restore();
  }
  ctx.restore();
}
/* a parchment scroll that unrolls downward between two wooden rods; returns the inner box */
function scroll(ctx, cx, top, w, h, u, seed) {
  const hh = Math.max(16, h * K.E.out3(K.clamp(u, 0, 1)));
  K.shape(ctx, K.rectPts(-w / 2 + cx, top, w, hh, 4), { fill: P.paper, w: 4.5, boil: 1.2, seed, shade: { color: P.paperShade, dx: -12, dy: -10 } });
  [top, top + hh].forEach((yy, i) => {
    K.shape(ctx, K.rectPts(cx - w / 2 - 30, yy - 14, w + 60, 28, 3), { fill: P.wood, w: 4.5, boil: 1, seed: seed + 3 + i, shade: { color: P.woodDark, dx: 0, dy: -8 } });
    [-1, 1].forEach((sd, k) => K.dot(ctx, cx + sd * (w / 2 + 36), yy, 14, P.woodDark, P.ink, 3.5, seed + 6 + i * 2 + k));
  });
  return hh;
}

/* ---------- chart set: islands with flickering quotes ---------- */
const ISL = [
  { t: "BTC", x: 700, y: 640, seed: 61, base: 61970, dec: 0, hero: 1 },
  { t: "BTC", x: 1500, y: 640, seed: 67, base: 62060, dec: 0, hero: 2 },
  { t: "ETH", x: 380, y: 230, seed: 37, base: 3270, dec: 1 },
  { t: "USDT", x: 1100, y: 160, seed: 11, base: 1.0, dec: 4 },
  { t: "SOL", x: 1830, y: 230, seed: 41, base: 148.2, dec: 1 },
  { t: "BNB", x: 2120, y: 690, seed: 47, base: 584, dec: 1 },
  { t: "USD", x: 1140, y: 1070, seed: 53, base: 1.0, dec: 4 },
  { t: "EUR", x: 1880, y: 1090, seed: 59, base: 1.084, dec: 4 },
];
function fmt(v, dec) {
  const s = v.toFixed(dec), parts = s.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
}
function quote(isl, g, i) {
  const step = Math.floor(g * 3 + i * 0.37); /* "shifting every single second" */
  const settle = K.ss(B.chaos - 0.2, B.discrep, g);
  if (isl.hero && settle > 0.5) return isl.hero === 1 ? TXT.btcA : TXT.btcB;
  return fmt(isl.base * (1 + 0.0012 * K.hs(step, isl.seed)), isl.dec);
}
const CAM = K.mkTrack([
  [CHART_AT, { x: 1100, y: 560, z: 0.6 }],
  [B.thousands, { x: 1100, y: 580, z: 0.64 }],
  [B.chaos, { x: 1100, y: 600, z: 0.7 }],
  [B.discrep + 0.6, { x: 1100, y: 600, z: 0.8 }],
  [SCENE.end, { x: 1100, y: 600, z: 0.8 }],
]);

function drawSide(g, tilt) {
  const hz = K.lerp(600, -260, K.E.inOut(tilt));
  SIDE.draw(ctx, g, {
    horizon: hz, pan: 0, zoom: 1, fy: hz,
    mid: (cx, gg, swell) => {
      const greet = [
        { at: B.welcome + 0.1, kind: "grin", dur: 1.6 },
        { at: B.decode, kind: "think", dur: 1.5 },
        { at: B.name - 0.2, kind: "nod", dur: 1.0 },
        { at: B.titled, kind: "surprise", dur: 1.2 },
        { at: B.wild, kind: "jump", dur: 1.2 },
      ];
      const pre = [
        { at: B.welcome, kind: "flap", dur: 1.0 },
        { at: B.article - 0.3, kind: "surprise", dur: 1.0 },
        { at: B.wild, kind: "flap", dur: 1.3 },
      ];
      HOST.ship(cx, gg, {
        x: 380, y: 860 + swell + (hz - 600) * 1.3, s: 1.22, crabS: 1.15, reacts: greet, preacts: pre,
        point: [960, 380], pointAmt: hold(gg, B.published + 0.4, B.name + 0.8, 0.3) + hold(gg, B.t1[0], B.t2[3] + 0.6, 0.3),
      });
      /* message in a bottle */
      const rise = K.E.back(span(gg, B.decode - 0.6, B.decode + 0.4), 1.6);
      if (rise > 0 && gg < B.published + 0.4) bottle(cx, 1180, 880 + (1 - rise) * 120 + 6 * Math.sin(gg * 2.4), gg, span(gg, B.article - 0.2, B.article + 0.6));
    },
  });
  K.screen(ctx);
  /* the scroll with the byline */
  const su = span(g, B.published - 0.2, B.published + 0.7), sOut = span(g, B.titled - 0.5, B.titled + 0.1);
  if (su > 0 && sOut < 1) {
    const fly = K.E.in3(sOut);
    ctx.save(); ctx.translate(0, -700 * fly); ctx.translate(960, 330); ctx.scale(1 - 0.3 * fly, 1 - 0.3 * fly); ctx.translate(-960, -330);
    const hh = scroll(ctx, 960, 110, 1180, 420, su, 2010);
    ctx.save(); ctx.beginPath(); ctx.rect(300, 110, 1320, hh); ctx.clip();
    const lines = [
      [B.published + 0.2, TXT.bylineLabels[0], TXT.byline[0], 170],
      [B.february, TXT.bylineLabels[1], TXT.byline[1], 250],
    ];
    lines.forEach(([tt, lab, val, y], i) => {
      const a = pop(g, tt - 0.1, 0.35); if (a <= 0) return;
      K.text(ctx, lab, 640, y + 40, { size: 34, weight: 800, fill: P.rustDark, align: "right", alpha: a });
      K.text(ctx, val, 680, y + 40, { size: i === 0 ? 64 : 52, weight: i === 0 ? 900 : 700, font: i === 0 ? K.FONT.display : K.FONT.mono, fill: P.ink, align: "left", alpha: a });
      /* underline the name when it is said, the date when it is said */
      const ul = span(g, i === 0 ? B.name : B.february, (i === 0 ? B.name : B.february) + 0.5);
      if (ul > 0) K.line(ctx, [[680, y + 80], [680 + K.textW(ctx, val, i === 0 ? 64 : 52, i === 0 ? 900 : 700, i === 0 ? K.FONT.display : K.FONT.mono) * ul, y + 80]], { stroke: P.goldDark, w: 6, boil: 0.8, seed: 2020 + i, gap: 0 });
    });
    const pa = pop(g, B.year + 0.5, 0.4);
    if (pa > 0) {
      K.text(ctx, TXT.byline[2], 960, 410, { size: 34, weight: 500, fill: P.inkSoft, alpha: pa });
      K.text(ctx, TXT.byline[3], 960, 462, { size: 34, weight: 800, fill: P.ink, alpha: pa });
    }
    ctx.restore(); ctx.restore();
  }
  /* the title banner, words land as they are read */
  const bu = span(g, B.titled - 0.1, B.titled + 0.7), bOut = span(g, T_TILT[0], T_TILT[0] + 0.7);
  if (bu > 0 && bOut < 1) {
    ctx.save(); ctx.translate(0, -620 * K.E.in3(bOut));
    K.banner(ctx, 960, 230, 1660, 240, bu, { seed: 2030 });
    if (bu > 0.85) {
      const row = (words, times, y, size, rust) => {
        const sp = size * 0.28, ws = words.map((w) => K.textW(ctx, w, size, 900)), tot = ws.reduce((s, v) => s + v, 0) + sp * (words.length - 1);
        let x = 960 - tot / 2;
        words.forEach((w, i) => {
          const a = pop(g, times[i] - 0.05, 0.3), cx = x + ws[i] / 2;
          if (a > 0) {
            const s = K.E.back(a, 1.3); ctx.save(); ctx.translate(cx, y); ctx.scale(s, s);
            const accent = rust || w === "Arbitrage";
            K.text(ctx, w, 0, 0, { size, weight: 900, fill: accent ? P.rust : P.ink, stroke: accent ? P.ink : null, w: accent ? 7 : 0 });
            ctx.restore();
          }
          x += ws[i] + sp;
        });
      };
      row(TXT.title1, B.t1, 188, 64, false);
      row(TXT.title2, B.t2, 272, 56, true);
    }
    /* subtitle parchment */
    const sa = pop(g, B.t2[3] + 0.5, 0.5);
    if (sa > 0) SIGN.note(ctx, 1150, 520, { a: sa, lines: [TXT.subtitle], w: 1160, size: 34, seed: 2040 });
    ctx.restore();
  }
}

function drawChart(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 7 });
  const clear = K.ss(B.simple - 0.6, SCENE.end - 0.2, g);
  const focus = K.ss(B.chaos, B.discrep, g);
  ISL.forEach((n, i) => {
    const a = pop(g, CHART_AT - 0.2 + i * 0.16, 0.45);
    const dim = n.hero ? 1 : (1 - 0.55 * focus) * (1 - clear);
    if (dim <= 0.01) return;
    ctx.save(); ctx.globalAlpha *= dim;
    K.node(ctx, n.x, n.y, 0.8, { label: n.t, color: P[n.t], seed: n.seed, a, palms: n.hero ? 2 : 1, hot: n.hero ? hold(g, B.discrep, B.quote, 0.4) : 0 });
    const qa = pop(g, CHART_AT + 0.3 + i * 0.16, 0.4) * (n.hero ? 1 - K.ss(B.simple - 0.3, B.simple + 0.4, g) : 1);
    if (qa > 0) K.tag(ctx, n.hero ? n.x + 70 : n.x + 190, n.hero ? n.y - 290 : n.y + 150, quote(n, g, i), { size: n.hero ? 50 : 44, seed: 2100 + i, a: qa, hot: n.hero ? focus > 0.5 : false });
    ctx.restore();
  });
  /* the gap between the two BTC quotes */
  const gap = hold(g, B.discrep, B.quote, 0.4);
  if (gap > 0) {
    K.line(ctx, [[860, 330], [1440, 330]], { stroke: P.goldDark, w: 6, boil: 1, seed: 2150, alpha: gap });
    [860, 1440].forEach((x, i) => K.line(ctx, [[x, 300], [x, 360]], { stroke: P.goldDark, w: 6, boil: 1, seed: 2151 + i, alpha: gap }));
    K.tag(ctx, 1150, 330, "≠", { size: 52, seed: 2155, a: gap, hot: true });
  }
  /* "risk-free profit", in quotes, with a question stamp */
  K.screen(ctx);
  const rf = hold(g, B.quote - 0.1, B.simple, 0.35);
  if (rf > 0) {
    K.plank(ctx, 1180, 230, 660, 120, [TXT.quoteRF], { a: rf, size: 54, font: K.FONT.display, weight: 900, colors: [P.goldDark], seed: 2160 });
    const q = pop(g, B.risk + 0.9, 0.35);
    if (q > 0) SIGN.stamp(ctx, 1590, 300, { a: q * rf, text: "?", size: 110, rot: 0.15 });
  }
  HOST.duo(ctx, g, {
    x: 300, y: 1010, s: 1.15, a: pop(g, CHART_AT - 0.1, 0.5),
    point: K.toScreen(1100, 330), pointAmt: hold(g, B.discrep, B.claims, 0.3),
    reacts: [
      { at: B.thousands, kind: "spyglass", dur: 2.6 },
      { at: B.discrep, kind: "surprise", dur: 1.3 },
      { at: B.risk, kind: "think", dur: 2.0 },
      { at: B.risk + 1.0, kind: "shrug", dur: 1.4 },
    ],
    preacts: [
      { at: B.shifting, kind: "flap", dur: 1.0 },
      { at: B.risk + 0.6, kind: "worry", dur: 1.6 },
      { at: B.simple, kind: "think", dur: 1.4 },
    ],
  });
}

function draw(g) {
  if (g < CHART_AT) drawSide(g, span(g, T_TILT[0], T_TILT[1]));
  else drawChart(g);
  /* the tilt: the last moment of the side set is all sea, the chart set fades up from the same blue */
  const blend = hold(g, CHART_AT - 0.15, CHART_AT + 0.35, 0.15);
  if (blend > 0 && g >= CHART_AT) { K.screen(ctx); ctx.save(); ctx.globalAlpha = (1 - span(g, CHART_AT, CHART_AT + 0.35)) * 0.9; ctx.fillStyle = P.seaMid; ctx.fillRect(0, 0, K.W, K.H); ctx.restore(); }
}

RUN(draw);
