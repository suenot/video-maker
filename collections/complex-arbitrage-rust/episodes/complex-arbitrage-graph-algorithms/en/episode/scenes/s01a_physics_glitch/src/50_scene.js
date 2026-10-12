/* ============================================================
   s01a 0.0 - 62.3  "The perfect physics engine glitches"
   Side set. Our ship sails from a glassy, clockwork-perfect lagoon (traditional
   market: one price everywhere, iron institutions keep the buoys aligned) into
   a crypto storm: the clockwork glitches, prices fragment across hundreds of
   platforms, fog hides blind spots, the water turns muddy, and the crab's
   spyglass finds a gold glint in the mud ("where the opportunity hides").
   Ends with the spyglass iris closing on the glint.
   ============================================================ */
const TXT = {
  calmPrice: "100.00",
  /* one BTC, many platforms, many prices (illustrative quotes, labelled as BTC) */
  quotes: ["62 010", "61 985", "62 040", "61 970", "62 025", "61 995", "62 060"],
};
const HZ = 600;
const B = {
  market: NR.cue("market", 0.5),
  physics: NR.cue("physics", 8),
  stock: NR.cue("stock", 11),
  reflects: NR.cue("reflects", 12),
  institutions: NR.cue("institutions", 15),
  aligned: NR.cue("aligned", 18),
  comfort: NR.cue("comfort", 20),
  machines: NR.cue("machines", 24),
  priced: NR.cue("priced", 27),
  crypto: NR.cue("cryptocurrency", 30),
  but: NR.cue("but", 30),
  glitch: NR.cue("suddenly", 33),
  glitchWord: NR.cue("glitch", 36),
  chaotic: NR.cue("chaotic", 39),
  fragmented: NR.cue("fragmented", 41),
  platforms: NR.cue("platforms", 43),
  blind: NR.cue("blind", 45),
  organism: NR.cue("organism", 48),
  volatility: NR.cue("volatility", 50),
  muddy: NR.cue("muddy", 54),
  frequency: NR.cue("frequency", 56),
  muddy2: NR.cue("muddy", 59),
  opportunity: NR.cue("opportunity", 60),
};
const IRIS_AT = [1360, 846];
SCENE.outAt = IRIS_AT;

/* camera / weather tracks (pan = world x offset) */
const CAMT = K.mkTrack([
  [0, { pan: 0, zoom: 1.0, storm: 0, murk: 0 }],
  [B.physics - 0.3, { pan: 0, zoom: 1.0, storm: 0, murk: 0 }],
  [B.physics + 0.9, { pan: 330, zoom: 1.13, storm: 0, murk: 0 }],
  [B.stock - 0.3, { pan: 300, zoom: 1.13, storm: 0, murk: 0 }],
  [B.stock + 0.6, { pan: 120, zoom: 1.14, storm: 0, murk: 0 }],
  [B.institutions - 0.2, { pan: 120, zoom: 1.14, storm: 0, murk: 0 }],
  [B.institutions + 1.0, { pan: 40, zoom: 1.0, storm: 0, murk: 0 }],
  [B.but, { pan: 40, zoom: 1.0, storm: 0, murk: 0 }],
  [B.glitch, { pan: 260, zoom: 1.02, storm: 0.45, murk: 0 }],
  [B.chaotic - 0.6, { pan: 300, zoom: 1.02, storm: 0.55, murk: 0 }],
  [B.fragmented + 1.4, { pan: 1900, zoom: 0.98, storm: 0.62, murk: 0 }],
  [B.organism, { pan: 2000, zoom: 1.0, storm: 0.7, murk: 0 }],
  [B.volatility + 0.4, { pan: 2060, zoom: 1.05, storm: 0.95, murk: 0.1 }],
  [B.muddy, { pan: 2100, zoom: 1.05, storm: 0.9, murk: 0.4 }],
  [B.muddy + 1.4, { pan: 2140, zoom: 1.05, storm: 0.75, murk: 1 }],
  [B.muddy2, { pan: 2180, zoom: 1.08, storm: 0.75, murk: 1 }],
  [SCENE.end, { pan: 2220, zoom: 1.14, storm: 0.72, murk: 1 }],
]);

/* ---------- calm lagoon props (parallax 0.7 layer, world x) ---------- */
const BUOYS = [880, 1060, 1240, 1420, 1600, 1780];
function buoy(ctx, x, y, g, i, tag, tagHot, scramble, tagA) {
  const sync = Math.sin(g * 2.0) * 6; /* all buoys bob in perfect sync */
  const wob = scramble > 0 ? Math.sin(g * 9 + i * 2.3) * 10 * scramble : 0;
  const yy = y + sync + wob;
  K.line(ctx, [[x, yy - 40], [x, yy - 112]], { stroke: P.ink, w: 5, boil: 0.8, seed: 1200 + i, gap: 0 });
  K.shape(ctx, [[x - 30, yy], [x - 22, yy - 44], [x + 22, yy - 44], [x + 30, yy]], { fill: i % 2 ? P.loss : P.paper, w: 4, boil: 1, seed: 1210 + i, shade: { color: i % 2 ? "#a83434" : P.paperShade, dx: -8, dy: 0 } });
  K.shape(ctx, K.ellipsePts(x, yy, 36, 10, 12), { fill: P.ironDark, w: 3.5, boil: 0.8, seed: 1220 + i });
  K.tag(ctx, x, yy - 140, tag, { size: 30, seed: 1230 + i, hot: tagHot, a: tagA == null ? 1 : tagA });
}
/* the clockwork "physics engine" on a far rock (parallax 0.7) */
function engine(ctx, x, y, g, glitch, lost, eye) {
  if (eye > 0) { /* "omniscient machines": a lamp on the engine sweeps the whole lagoon */
    const a = Math.PI + 0.5 + 0.9 * Math.sin((g - B.machines) * 1.3);
    ctx.save(); ctx.globalAlpha *= 0.35 * eye; ctx.fillStyle = P.profitGlow; ctx.beginPath(); ctx.moveTo(x - 10, y - 230);
    ctx.lineTo(x - 10 + Math.cos(a) * 1500, y - 230 + Math.sin(a) * 300 - 90); ctx.lineTo(x - 10 + Math.cos(a) * 1500, y - 230 + Math.sin(a) * 300 + 90); ctx.fill(); ctx.restore();
    K.shape(ctx, K.rectPts(x - 22, y - 252, 44, 34, 2), { fill: P.gold, w: 4, boil: 1, seed: 1350 });
    K.line(ctx, [[x, y - 218], [x, y - 190]], { stroke: P.ink, w: 6, boil: 0.8, seed: 1351, gap: 0 });
  }
  K.shape(ctx, K.blobPts(x, y + 6, 190, 40, 14, 31, 0.15), { fill: P.rock, w: 4, boil: 1.2, seed: 1300, shade: { color: "#7d6f61", dx: 0, dy: -12 } });
  K.shape(ctx, K.rectPts(x - 120, y - 70, 240, 74, 3), { fill: P.ironDark, w: 4.5, boil: 1, seed: 1301, hatch: { ang: -0.8, gap: 12, alpha: 0.2, color: P.ink } });
  for (let i = 0; i < 9; i++) K.dot(ctx, x - 104 + i * 26, y - 58, 3.5, P.rivet, P.ink, 1.5, 1310 + i);
  const jit = glitch > 0 ? (K.hash(K.bf, 3) - 0.5) * 0.9 * glitch : 0;
  const rot = g * 0.9 + jit;
  const gear = (gx, gy, r, dir, col, seed) => { ctx.save(); ctx.translate(gx, gy); ctx.rotate(rot * dir * (60 / r)); K.cog(ctx, 0, 0, r, col, seed); ctx.restore(); };
  gear(x - 62, y - 128, 60, 1, P.ironLight, 1320);
  gear(x + 40, y - 150, 44, -1, P.iron, 1322);
  if (lost <= 0) gear(x + 92, y - 96, 30, 1, P.ironLight, 1324);
  else { /* the small gear pops off and tumbles into the sea */
    const u = K.clamp(lost, 0, 1.4), lx = x + 92 + 220 * u, ly = y - 96 - 260 * u + 420 * u * u;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(u * 9); K.cog(ctx, 0, 0, 30, P.ironLight, 1324); ctx.restore();
  }
  /* pendulum */
  const sw = Math.sin(g * 2.0) * 0.35 + jit * 1.5;
  const px = x - 140, py = y - 70;
  K.line(ctx, [[px, py - 120], [px + Math.sin(sw) * 100, py - 120 + Math.cos(sw) * 100]], { stroke: P.ink, w: 5, boil: 0.8, seed: 1330, gap: 0 });
  K.dot(ctx, px + Math.sin(sw) * 100, py - 120 + Math.cos(sw) * 100, 16, P.ironLight, P.ink, 4, 1331);
  K.line(ctx, [[px, py], [px, py - 126]], { stroke: P.ink, w: 7, boil: 0.8, seed: 1332, gap: 0 });
  if (glitch > 0.2) for (let i = 0; i < 5; i++) { /* sparks */
    const a = K.hash(i + K.bf * 5, 9) * K.TAU, r = 40 + 60 * K.hash(i + K.bf * 3, 10);
    K.sparkle(ctx, x + 20 + Math.cos(a) * r, y - 130 + Math.sin(a) * r, 16, glitch, 1340 + i);
  }
}
/* an iron institution ship with a searchlight that keeps the buoys in line */
function bigShip(ctx, x, y, g, beam, seed) {
  if (beam > 0) {
    const a = -2.75 + 0.35 * Math.sin(g * 0.8 + seed);
    ctx.save(); ctx.globalAlpha *= 0.4 * beam; ctx.fillStyle = P.profitGlow; ctx.beginPath(); ctx.moveTo(x - 30, y - 150);
    ctx.lineTo(x - 30 + Math.cos(a) * 700, y - 150 + Math.sin(a) * 140 + 210); ctx.lineTo(x - 30 + Math.cos(a) * 700, y - 150 + Math.sin(a) * 140 + 330); ctx.fill(); ctx.restore();
  }
  K.ship(ctx, x, y, 0.62, { dir: -1, rock: Math.sin(g * 1.1 + seed) * 1.2, flagColor: P.capNavy, seed, emblem: (c, ex, ey) => K.cog(c, ex, ey, 30, P.ironDark, seed + 9) });
}
/* a crypto trading platform: a pontoon with a hut, flag and a BTC quote */
function platform(ctx, x, y, g, i, a, fog) {
  const pa = K.E.back(K.clamp(a, 0, 1), 2); if (pa <= 0) return;
  const bob = Math.sin(g * (2.4 + 0.37 * i) + i) * (8 + 10 * CAMT(g).storm);
  ctx.save(); ctx.translate(x, y + bob); ctx.rotate(Math.sin(g * 1.7 + i) * 0.05); ctx.scale(pa, pa);
  K.shape(ctx, K.rectPts(-80, -6, 160, 26, 3), { fill: P.wood, w: 4, boil: 1, seed: 1400 + i, shade: { color: P.woodDark, dx: 0, dy: -8 } });
  K.shape(ctx, [[-44, -6], [-44, -66], [0, -96], [44, -66], [44, -6]], { fill: [P.paper, P.ironLight, P.sand, P.belly][i % 4], w: 4, boil: 1, seed: 1410 + i, shade: { color: P.paperShade, dx: -10, dy: 0 } });
  K.shape(ctx, K.rectPts(-12, -46, 24, 40, 2), { fill: P.ink, stroke: null, w: 0, boil: 0.5, seed: 1420 + i });
  K.line(ctx, [[30, -80], [30, -150]], { stroke: P.ink, w: 4, boil: 0.8, seed: 1430 + i, gap: 0 });
  const fl = [[30, -150], [70, -142 + Math.sin(g * 8 + i) * 4], [30, -132]];
  K.shape(ctx, fl, { fill: [P.ETH, P.USDT, P.SOL, P.EUR, P.BNB, P.rust, P.USD][i % 7], w: 3, boil: 1, seed: 1440 + i });
  ctx.restore();
  if (fog < 0.95) {
    /* quote: tiny BTC coin + tag; numbers flicker during the volatility beat */
    const vol = K.clamp((g - B.organism) / 1.5, 0, 1) * (1 - K.clamp((g - B.muddy - 2) / 2, 0, 1));
    const k = vol > 0 ? Math.floor(g * 3 + i) % TXT.quotes.length : i;
    const qa = K.clamp(a * 1.3 - 0.3, 0, 1) * (1 - fog);
    ctx.save(); ctx.globalAlpha *= qa;
    K.tag(ctx, x + 10, y + bob - 190, "BTC " + TXT.quotes[(k + i) % TXT.quotes.length], { size: 30, seed: 1450 + i, a: Math.min(1, a) });
    ctx.restore();
  }
}
const PLAT = [[2560, 760], [2800, 690], [3020, 790], [3240, 700], [3460, 770], [3700, 690], [3900, 780]];

/* fog banks (blind spots) */
function fogBank(ctx, x, y, a, seed) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a * 0.85;
  K.shape(ctx, K.blobPts(x, y, 230, 70, 14, seed, 0.25), { fill: "#e8ebe6", stroke: "#b9c2c4", w: 3, boil: 1.6, seed });
  ctx.restore();
}

function draw(g) {
  const c = CAMT(g);
  const glitch = hold(g, B.glitch, B.glitchWord + 0.8, 0.2);
  const scramble = K.clamp((g - B.glitch) / 0.6, 0, 1);
  const lost = (g - (B.glitch + 1.2)) / 1.4;
  const beams = hold(g, B.institutions - 0.3, B.comfort, 0.6);
  const aligned = hold(g, B.priced - 0.2, B.priced + 1.6, 0.25);
  const flash = (B.organism < g ? Math.max(0, 1 - Math.abs(g - B.organism - 0.2) * 6) : 0) + (B.volatility < g ? Math.max(0, 1 - Math.abs(g - B.volatility - 0.15) * 6) : 0);
  SIDE.draw(ctx, g, {
    horizon: HZ, pan: c.pan, zoom: c.zoom, fx: 1100, fy: 640, storm: c.storm, murk: c.murk, flash,
    far: [[330, 320, 70, 1], [1240, 200, 44, 2], [2300, 260, 60, 3], [3100, 220, 50, 4], [3800, 300, 66, 5]],
    farLayer: (cx, gg) => {
      /* the efficient-market lagoon: clockwork engine, institutions, perfectly aligned buoys */
      const lagoon = 1 - K.ss(B.chaotic, B.fragmented + 1.2, gg);
      cx.save(); cx.globalAlpha *= lagoon;
      if (lagoon > 0) engine(cx, 1540, HZ - 6, gg, glitch, lost, hold(gg, B.machines - 1.4, B.priced + 0.4, 0.4));
      if (lagoon > 0) { bigShip(cx, 1180, HZ + 70, gg, beams, 1500); bigShip(cx, 1990, HZ + 60, gg, beams, 1520); }
      BUOYS.forEach((bx, i) => {
        const sc = scramble * (1 - K.clamp((gg - B.chaotic) / 2, 0, 1));
        const tag = scramble > 0 && Math.floor(gg * 6 + i * 3) % 3 !== 0 ? TXT.quotes[(Math.floor(gg * 4) + i) % TXT.quotes.length].replace(" ", "") .slice(0, 5) : TXT.calmPrice;
        if (lagoon > 0) buoy(cx, bx, HZ + 150 + (i % 2) * 18, gg, i, tag, aligned > 0.5, sc, pop(gg, B.market + 0.3 + i * 0.28, 0.45));
      });
      /* "keep everything perfectly aligned": a ruler line runs through every price tag */
      const al = hold(gg, B.aligned - 0.5, B.comfort + 1.0, 0.3);
      if (al > 0) {
        const ty = HZ + 150 - 140 + Math.sin(gg * 2.0) * 6 + 9, x0 = BUOYS[0] - 90, x1 = K.lerp(x0, BUOYS[5] + 90, K.E.out3(al));
        K.glow(cx, (x0 + x1) / 2, ty, 300, "rgba(255,240,170,0.6)", 0.5 * al);
        K.line(cx, [[x0, ty], [x1, ty]], { stroke: P.goldDark, w: 6, boil: 0.6, seed: 1260, gap: 0 });
      }
      cx.restore();
      /* the reflection pun: "the order book reflects that price" */
      const refl = hold(gg, B.reflects - 0.1, B.institutions + 0.4, 0.3);
      if (refl > 0) { ctx.save(); ctx.globalAlpha *= 0.45 * refl; ctx.translate(0, 2 * (HZ + 150) + 40); ctx.scale(1, -1); K.tag(ctx, BUOYS[2], HZ + 150 - 140, TXT.calmPrice, { size: 30, seed: 1232 }); ctx.restore(); }
      /* crypto platforms */
      PLAT.forEach((p, i) => {
        const a = pop(gg, B.fragmented + i * 0.32, 0.45);
        const fogA = hold(gg, B.blind - 0.4 + (i % 3) * 0.3, B.organism + 0.4, 0.6) * (i % 2 ? 1 : 0.15);
        platform(cx, p[0], p[1] - 40, gg, i, a, fogA);
      });
      PLAT.forEach((p, i) => fogBank(cx, p[0] + 40 + 30 * Math.sin(gg * 0.5 + i), p[1] - 160, hold(gg, B.blind - 0.4 + (i % 3) * 0.3, B.organism + 0.4, 0.6) * (i % 2 ? 1 : 0), 1600 + i));
    },
    mid: (cx, gg, swell) => {
      /* our ship stays in frame: it sails with the camera */
      /* screen-anchored: the ship keeps its place in frame whatever the pan / zoom */
      const sailIn = -900 * (1 - K.E.out3(K.clamp(gg / 3.2, 0, 1)));
      const shipX = 1100 + c.pan + (500 + sailIn + 30 * Math.sin(gg * 0.3) - 1100) / c.zoom;
      const shipY = 640 + (885 - 640) / c.zoom;
      const reacts = [
        { at: B.physics, kind: "think", dur: 1.6 },
        { at: B.aligned - 0.2, kind: "grin", dur: 1.4 },
        { at: B.priced, kind: "thumbs", dur: 1.8 },
        { at: B.glitch + 0.2, kind: "surprise", dur: 1.4 },
        { at: B.glitchWord, kind: "worry", dur: 2.2 },
        { at: B.organism, kind: "worry", dur: 2.6 },
        { at: B.muddy2 - 0.4, kind: "spyglass", dur: 3.5 },
        { at: B.opportunity, kind: "surprise", dur: 1.3 },
      ];
      const preacts = [
        { at: B.crypto - 0.2, kind: "surprise", dur: 1.2 },
        { at: B.platforms, kind: "think", dur: 1.6 },
        { at: B.volatility, kind: "worry", dur: 2 },
        { at: B.frequency, kind: "flap", dur: 1.2 },
        { at: B.opportunity + 0.2, kind: "surprise", dur: 1.2 },
      ];
      HOST.ship(cx, gg, {
        x: shipX, y: shipY + swell, s: 1.45 / c.zoom, crabS: 1.15, rock: (2 + 5 * c.storm) * Math.sin(gg * 1.6 + 0.4),
        reacts, preacts,
        point: [1300, 700], pointAmt: hold(gg, B.stock - 0.1, B.reflects + 1.0, 0.3),
      });
    },
    front: (cx, gg) => {
      const glint = hold(gg, B.muddy2 - 0.3, SCENE.end + 1, 0.4);
      if (glint > 0) {
        const p = 0.6 + 0.4 * Math.sin(gg * 7);
        K.glow(cx, IRIS_AT[0], IRIS_AT[1], 120 * p, "rgba(255,220,110,0.95)", glint);
        K.goldBit(cx, IRIS_AT[0], IRIS_AT[1] + 4 * Math.sin(gg * 3), 22, 1700, 0.2 * Math.sin(gg * 2));
        K.sparkle(cx, IRIS_AT[0] + 26, IRIS_AT[1] - 24, 26 * p, glint, 1701);
        K.sparkle(cx, IRIS_AT[0] - 34, IRIS_AT[1] - 6, 16 * (1 - p + 0.4), glint, 1702);
      }
    },
  });
  /* glitch: horizontal slices of the frame slip sideways for a few boil frames */
  if (glitch > 0.15 && K.hash(K.bf, 41) < 0.55) {
    K.screen(ctx);
    for (let i = 0; i < 6; i++) {
      const y = Math.floor(K.hash(i, K.bf * 7) * 1000), h = 20 + Math.floor(K.hash(i + 9, K.bf * 7) * 70), dx = Math.round((K.hash(i + 19, K.bf * 7) - 0.5) * 90 * glitch);
      ctx.drawImage(cv, 0, y, 1920, h, dx, y, 1920, h);
    }
  }
}

RUN(draw);
