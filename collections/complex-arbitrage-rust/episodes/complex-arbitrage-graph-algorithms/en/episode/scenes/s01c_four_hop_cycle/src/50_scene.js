/* ============================================================
   s01c 103.2 - 141.9  "Not buy-low / sell-high: a four-hop cycle"
   Chart set (cut in from s01b's archipelago).
   103.2  two BTC islands, a simple buy-low / sell-high hop ... "No, not at all": red X
   108.8  "complex multi asset chains": camera glides to the K4 graph
          (BTC left, ETH top, SOL right, USDT bottom, all 6 routes)
   113.3  the ship sails BTC -> ETH -> SOL -> USDT -> BTC hop by hop on the parrot's words
   122.4  "more Bitcoin than you started with": the coin pile grows
   124.7  "magic" sparkles, 125.7 "math": slate R1 x R2 x R3 x R4 > 1
   126.3  "millions of possibilities": zoom out over a big archipelago, search routes flicker
   133.9  "hidden money": one cycle locks gold
   136.7  "set the stage ... for you listening": spotlight, hosts step forward to camera
   Ends with a wave.
   ============================================================ */
const TXT = {
  buy: "BUY 61 970",
  sell: "SELL 62 060",
};
const B = {
  buying: NR.cue("buying", 103),
  no: NR.cue("no", 107),
  complex: NR.cue("complex", 108.5),
  imagine: NR.cue("imagine", 111.5),
  btc: NR.cue("bitcoin", 112.5),
  eth: NR.cue("ethereum", 114),
  sol: NR.cue("solana", 115.5),
  usdt: NR.cue("usdt", 117),
  back: NR.cue("bitcoin", 119.5),
  more: NR.cue("more", 122),
  magic: NR.cue("magic", 124),
  math: NR.cue("math", 125),
  mind: NR.cue("mind", 127),
  millions: NR.cue("millions", 130.5),
  hidden: NR.cue("hidden", 133.5),
  but: NR.cue("but", 136.5),
  stage: NR.cue("stage", 138),
  listening: NR.cue("listening", 139.5),
  go: NR.cue("go", 140.5),
};

/* ---------- world layout ---------- */
const PAIR = { A: [700, 640], B: [1500, 640] };            /* buy-low / sell-high islands */
const N4 = { BTC: [2150, 720], ETH: [2650, 330], SOL: [3150, 720], USDT: [2650, 1110] };
const NC = { BTC: P.BTC, ETH: P.ETH, SOL: P.SOL, USDT: P.USDT };
const NSEED = { BTC: 23, ETH: 37, SOL: 41, USDT: 11 };
const PLAIN = [["BTC", "ETH"], ["ETH", "SOL"], ["SOL", "USDT"], ["USDT", "BTC"], ["BTC", "SOL"], ["ETH", "USDT"]];
const HOPS = [["BTC", "ETH", B.eth], ["ETH", "SOL", B.sol], ["SOL", "USDT", B.usdt], ["USDT", "BTC", B.back]];
const HOP_D = 1.0, HOT_BEND = -70;

/* the big archipelago for "millions of possibilities" (around the K4, deterministic) */
const ARCH = [];
(function () {
  const tick = ["BTC", "ETH", "USDT", "SOL", "EUR", "BNB", "USD"];
  for (let i = 0; i < 34; i++) {
    const ring = 1 + (i % 3), a = i * 2.399 + K.hash(i, 5) * 0.4;
    const r = 900 + ring * 520 + K.hash(i, 6) * 260;
    const q = { x: 2650 + Math.cos(a) * r * 1.35, y: 720 + Math.sin(a) * r * 0.85, t: tick[i % 7], seed: 100 + i * 7 };
    if (ARCH.every((o) => Math.hypot(o.x - q.x, o.y - q.y) > 520)) ARCH.push(q);
  }
})();
const ALLN = Object.keys(N4).map((k) => ({ x: N4[k][0], y: N4[k][1], t: k })).concat(ARCH);
const AEDGE = [];
ALLN.forEach((p, i) => {
  if (i < 4) return; /* the K4 is drawn on its own */
  const d = ALLN.map((q, j) => [Math.hypot(q.x - p.x, q.y - p.y), j]).filter((e) => e[1] !== i && e[1] >= 4).sort((a, b) => a[0] - b[0]);
  d.slice(0, 3).forEach((e) => { if (!AEDGE.some((f) => (f[0] === e[1] && f[1] === i) || (f[0] === i && f[1] === e[1]))) AEDGE.push([i, e[1]]); });
});
/* the cycle the search locks onto on "hidden money": a triangle, preferably up and to the right */
const LOCK = (function () {
  const has = (a, b) => AEDGE.some((f) => (f[0] === a && f[1] === b) || (f[0] === b && f[1] === a));
  let best = null, bs = -1e9;
  AEDGE.forEach((e) => ALLN.forEach((_, c) => {
    if (c < 4 || c === e[0] || c === e[1] || !has(e[0], c) || !has(e[1], c)) return;
    const cx = (ALLN[e[0]].x + ALLN[e[1]].x + ALLN[c].x) / 3, cy = (ALLN[e[0]].y + ALLN[e[1]].y + ALLN[c].y) / 3;
    const sc = cx - 2650 - Math.abs(cy - 300) * 0.8 - Math.max(0, Math.hypot(cx - 2650, cy - 720) - 2200) * 3;
    if (sc > bs) { bs = sc; best = [e[0], e[1], c]; }
  }));
  return best || [4, 5, 6];
})();
const inLock = (e) => LOCK.includes(e[0]) && LOCK.includes(e[1]);

const CAM = K.mkTrack([
  [SCENE.start, { x: 1100, y: 600, z: 0.8 }],
  [B.no + 0.2, { x: 1100, y: 600, z: 0.84 }],
  [B.complex - 0.1, { x: 1120, y: 600, z: 0.84 }],
  [B.btc - 0.3, { x: 2420, y: 700, z: 0.7 }],
  [B.back + 1.2, { x: 2470, y: 700, z: 0.72 }],
  [B.magic, { x: 2650, y: 720, z: 0.66 }],
  [B.math + 0.4, { x: 2780, y: 730, z: 0.62 }],
  [B.mind + 0.6, { x: 2780, y: 730, z: 0.62 }],
  [B.millions + 1.0, { x: 2650, y: 760, z: 0.27 }],
  [B.hidden + 1.6, { x: 2650, y: 760, z: 0.25 }],
  [B.stage, { x: 2650, y: 760, z: 0.3 }],
  [SCENE.end, { x: 2650, y: 760, z: 0.32 }],
]);

/* ---------- helpers ---------- */
/* formula with real subscripts (JetBrains Mono has no subscript glyphs in our subset) */
function formula(ctx, x, y, parts, size, upto, color) {
  let w = 0; const cw = K.textW(ctx, "M", size, 500, K.FONT.mono), sw = K.textW(ctx, "M", size * 0.62, 500, K.FONT.mono);
  parts.forEach((p) => (w += typeof p === "string" ? p.length * cw : p.sub.length * sw));
  let cx = x - w / 2, n = 0;
  parts.forEach((p) => {
    if (n >= upto) return;
    if (typeof p === "string") {
      const s = p.slice(0, Math.max(0, upto - n)); n += p.length;
      K.text(ctx, s, cx, y, { size, weight: 500, font: K.FONT.mono, fill: color || P.chalk, align: "left" }); cx += p.length * cw;
    } else {
      n += p.sub.length;
      K.text(ctx, p.sub, cx, y + size * 0.28, { size: size * 0.62, weight: 500, font: K.FONT.mono, fill: color || P.chalk, align: "left" }); cx += p.sub.length * sw;
    }
  });
}
const plen = (parts) => parts.reduce((s, p) => s + (typeof p === "string" ? p.length : p.sub.length), 0);
const F4 = ["R", { sub: "1" }, " × R", { sub: "2" }, " × R", { sub: "3" }, " × R", { sub: "4" }, " > 1"];

function hopPos(g) {
  /* where the mini ship is on the cycle at time g */
  if (g < HOPS[0][2]) return { x: N4.BTC[0] + 60, y: N4.BTC[1] + 90, h: 0 };
  for (let i = HOPS.length - 1; i >= 0; i--) {
    const h = HOPS[i]; if (g >= h[2]) {
      const u = K.E.inOut(K.clamp((g - h[2]) / (HOP_D + 0.4), 0, 1));
      const p = K.edgePoint(N4[h[0]], N4[h[1]], HOT_BEND, K.lerp(0.18, 0.82, u));
      return { x: p[0], y: p[1], h: p[2] };
    }
  }
}

function spotlight(ctx, a, cx, cy, r) {
  if (a <= 0) return;
  K.screen(ctx); ctx.save();
  ctx.globalAlpha = 0.55 * a; ctx.fillStyle = "#120b07";
  ctx.beginPath(); ctx.rect(0, 0, K.W, K.H); ctx.ellipse(cx, cy, r * 1.25, r, 0, 0, K.TAU, true); ctx.fill("evenodd");
  ctx.restore();
  K.glow(ctx, cx, cy - r * 0.2, r, "rgba(255,240,190,0.5)", 0.35 * a);
}

function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 7 });

  /* --- 1. buy low here, sell high there (and why that is not what we mean) --- */
  const pairA = 1 - K.ss(B.btc - 0.6, B.btc + 0.4, g);
  if (pairA > 0) {
    ctx.save(); ctx.globalAlpha *= pairA;
    K.node(ctx, PAIR.A[0], PAIR.A[1], 0.8, { label: "BTC", color: P.BTC, seed: 61, a: pop(g, SCENE.start - 1) });
    K.node(ctx, PAIR.B[0], PAIR.B[1], 0.8, { label: "BTC", color: P.BTC, seed: 67, a: pop(g, SCENE.start - 1) });
    K.edge(ctx, PAIR.A, PAIR.B, { p: K.E.out3(span(g, B.buying, B.buying + 1.6)), bend: -80, seed: 70, trim: 160, arrow: pop(g, B.buying + 1.6), arrowS: 1.6 });
    K.tag(ctx, PAIR.A[0] - 20, PAIR.A[1] - 300, TXT.buy, { size: 40, seed: 71, a: pop(g, B.buying + 0.3) });
    K.tag(ctx, PAIR.B[0] - 20, PAIR.B[1] - 300, TXT.sell, { size: 40, seed: 72, a: pop(g, B.buying + 2.4) });
    const x = span(g, B.no + 0.1, B.no + 0.6);
    if (x > 0) {
      const c = [1100, 520], r = 120;
      K.line(ctx, [[c[0] - r, c[1] - r], [K.lerp(c[0] - r, c[0] + r, Math.min(1, x * 2)), K.lerp(c[1] - r, c[1] + r, Math.min(1, x * 2))]], { stroke: P.loss, w: 26, boil: 1.2, seed: 73, gap: 0 });
      if (x > 0.5) K.line(ctx, [[c[0] + r, c[1] - r], [K.lerp(c[0] + r, c[0] - r, (x - 0.5) * 2), K.lerp(c[1] - r, c[1] + r, (x - 0.5) * 2)]], { stroke: P.loss, w: 26, boil: 1.2, seed: 74, gap: 0 });
    }
    ctx.restore();
  }

  /* --- 2. the archipelago (only visible when zoomed out) --- */
  const archA = K.ss(B.mind, B.millions + 0.4, g);
  if (archA > 0) {
    ctx.save(); ctx.globalAlpha *= archA;
    const step = Math.floor(g * 7);
    AEDGE.forEach((e, i) => {
      const A = ALLN[e[0]], Bn = ALLN[e[1]];
      const lock = g > B.hidden && inLock(e);
      const lit = lock || (g < B.hidden && K.hash(i, step) < 0.12);
      K.edge(ctx, [A.x, A.y], [Bn.x, Bn.y], { state: lit ? "hot" : "dim", bend: 0, trim: 150, w: 14, seed: 200 + i });
    });
    ARCH.forEach((n, i) => K.node(ctx, n.x, n.y, 0.75, { label: n.t, color: P[n.t], seed: n.seed, palms: 1, a: pop(g, B.mind + (i % 12) * 0.12, 0.5), hot: g > B.hidden && LOCK.includes(i + 4) ? pop(g, B.hidden, 0.4) : 0 }));
    if (g > B.hidden) {
      const la = pop(g, B.hidden, 0.4);
      LOCK.forEach((n, i) => {
        const A = ALLN[n];
        K.glow(ctx, A.x, A.y - 100, 420, "rgba(255,220,120,0.9)", 0.7 * la);
        K.sparkle(ctx, A.x + 60, A.y - 300, 110 * Math.abs(Math.sin(g * 4 + i)), la, 300 + i);
      });
    }
    ctx.restore();
  }

  /* --- 3. the K4 graph and the hot four-hop cycle --- */
  const k4a = pop(g, B.complex + 0.2, 0.5);
  if (k4a > 0) {
    PLAIN.forEach((e, i) => {
      const bend = 0;
      K.edge(ctx, N4[e[0]], N4[e[1]], { p: K.E.out3(span(g, B.complex + 0.3 + i * 0.25, B.complex + 1.0 + i * 0.25)), bend, seed: 400 + i, trim: 150, state: g > B.back + HOP_D ? "dim" : "plain" });
    });
    HOPS.forEach((h, i) => {
      const p = K.E.inOut(span(g, h[2], h[2] + HOP_D));
      if (p > 0) K.edge(ctx, N4[h[0]], N4[h[1]], { p, state: "hot", bend: HOT_BEND, seed: 420 + i, trim: 150, w: 9 });
    });
    Object.keys(N4).forEach((k, i) => {
      const visit = k === "BTC" ? B.btc : HOPS.find((h) => h[1] === k)[2] + HOP_D + 0.3;
      const hot = hold(g, visit, visit + 1.6, 0.2) + (k === "BTC" ? hold(g, B.back + HOP_D * 0.8, B.math, 0.3) : 0);
      K.node(ctx, N4[k][0], N4[k][1], 0.85, { label: k, color: NC[k], seed: NSEED[k], hot: Math.min(1, hot), a: pop(g, B.complex + i * 0.18, 0.45) });
    });
    /* the cargo: a coin pile on the BTC pier that grows on "more Bitcoin" */
    const base = 7, extra = Math.round(9 * K.E.out3(span(g, B.more, B.more + 1.2)));
    if (g > B.btc - 0.2) {
      K.coinPile(ctx, N4.BTC[0] + 60, N4.BTC[1] + 40, base + extra, 120, 450);
      if (g > B.more) K.sparkle(ctx, N4.BTC[0] + 80, N4.BTC[1] + 90, 34 * Math.abs(Math.sin(g * 5)), hold(g, B.more, B.more + 2.5), 451);
    }
    /* the ship sails the loop */
    if (g > B.btc - 0.3 && g < B.mind + 1) {
      const s = hopPos(g);
      K.miniShip(ctx, s.x, s.y, 0.68 * pop(g, B.btc - 0.3, 0.4), { heading: s.h, coins: g > B.more ? 6 : 2 });
    }
    /* "magic": sparkles around the loop */
    const mg = hold(g, B.magic - 0.1, B.math + 0.3, 0.2);
    if (mg > 0) for (let i = 0; i < 10; i++) {
      const a = (i / 10) * K.TAU + g * 0.8, r = 560 + 40 * Math.sin(g * 6 + i);
      K.sparkle(ctx, 2650 + Math.cos(a) * r * 1.05, 720 + Math.sin(a) * r * 0.8, 40 + 20 * Math.sin(g * 9 + i), mg, 470 + i);
    }
  }

  /* --- screen space: formula slate, hosts, spotlight --- */
  K.screen(ctx);
  const fa = hold(g, B.math - 0.15, B.millions + 0.4, 0.3);
  if (fa > 0) {
    const sx = 1500, sy = 250;
    K.slate(ctx, sx, sy, 640, 130, [], { a: fa, seed: 480 });
    ctx.save(); ctx.globalAlpha *= K.clamp(fa * 1.4 - 0.4, 0, 1);
    formula(ctx, sx, sy, F4, 56, Math.floor(plen(F4) * K.E.out3(span(g, B.math, B.math + 1.3))), P.chalk);
    ctx.restore();
  }
  const step = K.E.inOut(span(g, B.but, B.stage));
  spotlight(ctx, step, K.lerp(420, 860, step), 820, 420);
  const shipSc = K.toScreen(hopPos(g).x, hopPos(g).y);
  HOST.duo(ctx, g, {
    x: K.lerp(300, 760, step), y: K.lerp(1010, 1000, step), s: K.lerp(1.15, 1.45, step),
    point: g < B.magic ? K.toScreen(PAIR.B[0], PAIR.B[1] - 120) : [1250, 250],
    pointAmt: g < B.magic ? hold(g, B.buying + 2.2, B.no + 0.4, 0.3) : hold(g, B.math + 1.6, B.mind + 0.5, 0.3),
    ppoint: shipSc, ppointAmt: hold(g, B.btc - 0.2, B.back + HOP_D, 0.4),
    reacts: [
      { at: B.no, kind: "shrug", dur: 1.4 },
      { at: B.complex + 0.2, kind: "think", dur: 1.8 },
      { at: B.more + 0.2, kind: "surprise", dur: 1.4 },
      { at: B.magic, kind: "grin", dur: 1.2 },
      { at: B.math - 0.1, kind: "thumbs", dur: 1.4 },
      { at: B.millions, kind: "spyglass", dur: 3.4 },
      { at: B.hidden + 0.2, kind: "surprise", dur: 1.2 },
      { at: B.go, kind: "nod", dur: 0.9 },
    ],
    preacts: [
      { at: B.more, kind: "flap", dur: 1.4 },
      { at: B.mind, kind: "surprise", dur: 1.2 },
      { at: B.hidden + 0.3, kind: "grin", dur: 1.4 },
      { at: B.stage, kind: "think", dur: 1.4 },
    ],
  });
  /* the formula pointer: while the slate is up, the crab points at it */
}

RUN(draw);
