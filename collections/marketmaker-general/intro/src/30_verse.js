/* ============================================================
   INTRO 30 CHORUS: intro + chorus (bars 0 - 12), all on the reef set.
   Scenes are pure functions of t. Arm poses come from armTrack():
   keys [[t0, target | null, dur]] blend from the previous pose with a
   small back-ease overshoot; null = back to the resting fan.
   ============================================================ */
const BID = "99.98", ASK = "100.02";
function restArm(i) { const r = K.OCTO_REST[i]; return { x: r[0], y: r[1], bend: (i < 4 ? 1 : -1) * 20, curl: (i < 4 ? -1 : 1) * 2.6 }; }
function mixArm(a, b, u) { return { x: K.lerp(a.x, b.x, u), y: K.lerp(a.y, b.y, u), bend: K.lerp(a.bend || 0, b.bend || 0, u), curl: K.lerp(a.curl || 0, b.curl || 0, u) }; }
function armTrack(t, i, keys) {
  let cur = null, card = null, prop = null;
  for (const k of keys) {
    const t0 = k[0], tg = k[1], d = k[2] || 0.3;
    if (t < t0) break;
    const from = cur || restArm(i), to = tg ? Object.assign({ bend: 0, curl: 0 }, tg) : restArm(i);
    const u = K.E.back(K.inv(t0, t0 + d, t), 1.2);
    cur = mixArm(from, to, u);
    card = tg && tg.card ? tg.card : null; prop = tg && tg.prop ? tg.prop : null;
  }
  if (!cur) return null;
  if (card) cur.card = card; if (prop) cur.prop = prop;
  return cur;
}
/* a fanned ladder of 8 quote cards (bids left, asks right) around the head */
function fanArms(t, t0, opt) {
  const o = Object.assign({ r: 470, ry: 400, cy: -300, s: 0.7, spread: 1, wob: 1 }, opt || {});
  const prices = ["99.92", "99.94", "99.96", "99.98", "100.02", "100.04", "100.06", "100.08"];
  return Array.from({ length: 8 }, (_, i) => {
    const th = Math.PI + ((i + 0.5) / 8) * Math.PI, w = 0.06 * Math.sin(t * 5 + i) * o.wob;
    const g = K.inv(t0 + i * 0.03, t0 + i * 0.03 + 0.3, t);
    const tg = { x: Math.cos(th + w) * o.r, y: o.cy + Math.sin(th + w) * o.ry, bend: (i < 4 ? -1 : 1) * 30, card: { kind: i < 4 ? "bid" : "ask", text: prices[i], s: o.s, a: g, dy: -30 } };
    if (g <= 0) return null;
    const r = mixArm(restArm(i), tg, K.E.back(g, 1.4)); r.card = tg.card;
    return r;
  });
}
function camTrack(keys) { const tr = K.mkTrack(keys); return (t) => Object.assign({ rot: 0 }, tr(t)); }

/* ---------- SC1 descent: surface -> reef, towers grow, the clam opens, Otto pops out (bars 0 - 4) ---------- */
const cam1 = camTrack([[0, { x: 960, y: -1180, z: 0.92 }], [at(1, 0), { x: 960, y: -900, z: 0.9 }], [at(2, 0), { x: 960, y: 300, z: 0.8 }], [at(2, 2), { x: 960, y: 500, z: 0.78 }], [at(3, 2), { x: 960, y: 600, z: 0.95 }], [at(4), { x: 960, y: 640, z: 1.28 }]]);
const OTTO_POP = at(3, 1);
function sc1(t) {
  const cam = cam1(t);
  drawReef(t, cam, {
    depth: K.tw(t, 0, at(2, 2), 0.05, 0.45), traffic: 8,
    pop: (i) => (i < 0 ? K.inv(at(1, 0 + (i + 20) * 0.25), at(1, 0 + (i + 20) * 0.25) + 0.45, t) : K.inv(at(1, 2 + i * 0.5), at(1, 2 + i * 0.5) + 0.45, t)),
    deskOpen: K.tw(t, at(3, 0), at(3, 0.8), 0.12, 1, K.E.back),
    octo: () => {
      if (t < OTTO_POP) return;
      const d = t - OTTO_POP, hopU = K.inv(0, 0.62, d), hop = Math.sin(hopU * Math.PI) * 190;
      const land = K.inv(0.55, 0.85, d), sq = d < 0.08 ? -0.35 : hopU < 1 ? -0.25 * (1 - hopU) : 0.38 * Math.sin(land * Math.PI) * (1 - land);
      const pop = K.E.back(K.inv(0, 0.3, d), 2);
      otto(t, { hop: hop - (1 - pop) * 200, squash: sq + 0.06 * K.pulse(t, 1, 6), mouth: d < 0.7 ? "o" : "grin", brow: d < 0.7 ? 1.2 : 0.3, look: [0, -0.4 * (1 - land)], exclaim: K.inv(at(3, 3), at(3, 3) + 0.3, t) * (t < at(4, 0.5) ? 1 : 0) }, { x: OCT.x, y: OCT.y, s: OCT.s * Math.max(0.2, pop) });
    },
    front: () => {
      /* a school of fish traders heads down to the exchange (they lead the eye into the reef) */
      K.applyCam(ctx, 1);
      for (let j = 0; j < 9; j++) {
        const u = K.inv(-0.2 + j * 0.06, at(2, 2) + j * 0.05, t); if (u <= 0 || u >= 1) continue;
        const x = K.lerp(-300 + 90 * (j % 3), 2300 - 60 * j, u), y = K.lerp(-1500 + 70 * j, 300 + 40 * (j % 4), K.E.inOut(u));
        K.fish(ctx, x, y + 30 * Math.sin(t * 3 + j), 1.15 + 0.3 * K.hash(j, 2), { species: ["Y", "T", "O", "B"][j % 4], dir: 1, seed: 700 + j * 5 });
      }
      K.bubbleBurst(ctx, DESK.x, DESK.y - 60, t - OTTO_POP, { n: 14, r: 280, size: 20 }); K.bubbleBurst(ctx, DESK.x, DESK.y - 30, t - at(3, 0), { n: 8, r: 200, size: 14, seed: 52 }); },
  });
}

/* ---------- SC2 "Buy low, sell high" (bars 4 - 6): bid card low, ask card high ---------- */
const cam2 = camTrack([[at(4), { x: 960, y: 640, z: 1.28 }], [at(6), { x: 960, y: 620, z: 1.32 }]]);
function sc2(t) {
  drawReef(t, cam2(t), {
    traffic: 4,
    octo: () => otto(t, {
      mouth: "grin", glint: K.inv(at(5, 2), at(5, 2) + 0.4, t), wink: t > at(5, 0) && t < at(5, 0.8) ? Math.sin(K.inv(at(5, 0), at(5, 0.8), t) * Math.PI) : 0,
      look: t < at(4, 2) ? [-0.8, 0.6] : [0.8, -0.6],
      arms: [null, armTrack(t, 1, [[at(4, 0), { x: -360, y: -90, bend: -30, card: { kind: "bid", text: BID, s: 1.05, a: ap(t, at(4, 0)), dy: -46 } }]]), null, null, null, null,
        armTrack(t, 6, [[at(4, 2), { x: 340, y: -440, bend: 40, card: { kind: "ask", text: ASK, s: 1.05, a: ap(t, at(4, 2)), dy: -46 } }]]), null],
    }),
    front: () => {
      /* "low" and "high": a beat-bouncing arrow next to each card */
      K.applyCam(ctx, 1);
      const a1 = K.popS(ap(t, at(4, 1))), a2 = K.popS(ap(t, at(4, 3)));
      if (a1 > 0) arrowBadge(OCT.x - 600, OCT.y - 150 + 12 * K.pulse(t, 1, 5), a1, false);
      if (a2 > 0) arrowBadge(OCT.x + 600, OCT.y - 500 - 12 * K.pulse(t, 1, 5), a2, true);
    },
  });
}
function arrowBadge(x, y, a, up) {
  ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
  K.shape(ctx, K.ellipsePts(0, 0, 54, 54, 16), { fill: up ? P.ask : P.bid, w: 5, boil: 0.6, seed: up ? 31 : 32, shade: { color: up ? P.askDark : P.bidDark, dx: 0, dy: -8 }, drop: { dx: 6, dy: 8 } });
  K.shape(ctx, up ? [[0, -30], [24, 2], [9, 2], [9, 28], [-9, 28], [-9, 2], [-24, 2]] : [[0, 30], [24, -2], [9, -2], [9, -28], [-9, -28], [-9, -2], [-24, -2]], { fill: "#ffffff", w: 4, boil: 0.4, seed: up ? 33 : 34, sharp: true });
  ctx.restore();
}

/* ---------- SC3 "Quote both sides as the fish swim by" (bars 6 - 8) ---------- */
const cam3 = camTrack([[at(6), { x: 960, y: 600, z: 1.36 }], [at(6, 2), { x: 960, y: 570, z: 0.98 }], [at(8), { x: 960, y: 560, z: 1.02 }]]);
const BID_POS = { x: -330, y: -330, bend: -30 }, ASK_POS = { x: 330, y: -330, bend: 30 };
/* fish take a card at tk; Otto's card on that side is gone for a beat, then pops back */
function quoteArms(t, takes, s) {
  const cardA = (side) => { let a = 1; takes.forEach((k) => { if (k.side === side && t >= k.t) a = Math.min(a, ap(t, k.t + bl(0.5), 0.3)); }); return a; };
  return [null, Object.assign({}, BID_POS, { card: { kind: "bid", text: BID, s: s || 0.95, a: cardA("bid"), dy: -44 } }), null, null, null, null, Object.assign({}, ASK_POS, { card: { kind: "ask", text: ASK, s: s || 0.95, a: cardA("ask"), dy: -44 } }), null];
}
/* a fish that swims through (x0 -> card at tk -> x1), carrying the card after tk */
function takerFish(t, tk, side, from, to, y, sp, seed, tipX, tipY) {
  const u0 = from.t, u1 = to.t;
  if (t < u0 || t > u1) return;
  const x = t < tk ? K.lerp(from.x, tipX, K.E.out3(K.inv(u0, tk, t))) : K.lerp(tipX, to.x, K.E.in3(K.inv(tk, u1, t)));
  const yy = t < tk ? K.lerp(y, tipY, K.E.out3(K.inv(u0, tk, t))) : K.lerp(tipY, to.y, K.E.in3(K.inv(tk, u1, t)));
  const dir = to.x < from.x ? -1 : 1;
  K.fish(ctx, x - dir * 160 * 0.8, yy, 0.8, { species: sp, dir, seed, mouth: t < tk ? "o" : "smile", card: t >= tk ? { kind: side, text: side === "bid" ? BID : ASK } : null });
}
function sc3(t) {
  const takes = [{ t: at(6, 2), side: "ask" }, { t: at(7, 0.5), side: "bid" }, { t: at(7, 2.5), side: "ask" }];
  const askX = OCT.x + 330, bidX = OCT.x - 330, cy = OCT.y - 380;
  drawReef(t, cam3(t), {
    traffic: 6,
    octo: () => otto(t, { mouth: "grin", arms: quoteArms(t, takes), look: t < at(7, 0) ? [0.9, -0.2] : t < at(7, 2) ? [-0.9, -0.2] : [0.9, -0.2] }),
    front: () => {
      K.applyCam(ctx, 1);
      takerFish(t, takes[0].t, "ask", { t: at(5, 3.5), x: 2300 }, { t: at(7, 2), x: -600, y: 260 }, 300, "Y", 501, askX + 120, cy);
      takerFish(t, takes[1].t, "bid", { t: at(6, 1.5), x: -500 }, { t: at(8, 0), x: 2400, y: 220 }, 260, "T", 502, bidX - 120, cy);
      takerFish(t, takes[2].t, "ask", { t: at(7, 1), x: 2300 }, { t: at(8, 2), x: -600, y: 300 }, 640, "O", 503, askX + 120, cy);
    },
  });
}

/* ---------- SC4 "Tight spread, steady hand" (bars 8 - 10): the two quotes squeeze together ---------- */
const cam4 = camTrack([[at(8), { x: 960, y: 560, z: 1.02 }], [at(9, 2), { x: 960, y: 520, z: 1.22 }], [at(10), { x: 960, y: 530, z: 1.18 }]]);
const SQUEEZE = [["0.40", "99.80", "100.20", 430], ["0.20", "99.90", "100.10", 330], ["0.10", "99.95", "100.05", 230], ["0.04", BID, ASK, 140]];
function sc4(t) {
  let k = 0; for (let j = 0; j < 4; j++) if (t >= at(8, j * 2)) k = j;
  const tk = at(8, k * 2), u = K.E.back(K.inv(tk, tk + 0.3, t), 1.4), prevX = k > 0 ? SQUEEZE[k - 1][3] : SQUEEZE[0][3], X = K.lerp(prevX, SQUEEZE[k][3], k ? u : 1);
  const tight = t >= at(9, 2), cy = -470;
  drawReef(t, cam4(t), {
    traffic: 3,
    octo: () => otto(t, {
      wave: 0.15, mouth: tight ? "grin" : "flat", brow: tight ? 0.5 : -0.6, glint: K.inv(at(9, 2.5), at(9, 3.3), t), look: [0, -0.7],
      arms: [null, { x: -X, y: cy, bend: -40, card: { kind: "bid", text: SQUEEZE[k][1], s: 0.95, dy: -40 } }, null, null, null, null, { x: X, y: cy, bend: 40, card: { kind: "ask", text: SQUEEZE[k][2], s: 0.95, dy: -40 } }, null],
    }),
    front: () => {
      K.applyCam(ctx, 1);
      const bx = OCT.x, by = OCT.y + cy - 175;
      /* spread bracket between the cards */
      const half = Math.max(30, X - 110);
      K.line(ctx, [[bx - half, by + 26], [bx - half, by], [bx + half, by], [bx + half, by + 26]], { stroke: P.ink, w: 12, boil: 0.5, seed: 41, sharp: true });
      K.line(ctx, [[bx - half, by + 26], [bx - half, by], [bx + half, by], [bx + half, by + 26]], { stroke: P.sun, w: 6, boil: 0.5, seed: 41, sharp: true });
      K.badge(ctx, bx, by - 62, SQUEEZE[k][0], { a: ap(t, at(8, 0)), bump: k ? Math.exp(-6 * (t - tk)) : 0, size: 54 });
      if (tight) for (let i = 0; i < 6; i++) { const d = t - at(9, 2), a = (i / 6) * K.TAU; if (d < 0.6) K.sparkle(ctx, bx + Math.cos(a) * (90 + 260 * d), by - 62 + Math.sin(a) * (60 + 160 * d), 24 * (1 - d / 0.6), 1 - d / 0.6, 60 + i); }
    },
  });
}

/* ---------- SC5 "Marketmaker! Marketmaker of the sand!" (bars 10 - 12): the eight-card fan ---------- */
const cam5 = camTrack([[at(10), { x: 960, y: 520, z: 1.0 }], [at(10, 0.4), { x: 960, y: 520, z: 1.08 }], [at(11), { x: 960, y: 510, z: 1.1 }], [at(11, 0.4), { x: 960, y: 540, z: 1.2 }], [at(12), { x: 960, y: 540, z: 1.22 }]]);
function sc5(t) {
  const d = t - at(10), hop = Math.max(0, Math.sin(K.inv(0, 0.7, d) * Math.PI)) * 120, land = t - at(11, 2);
  const shake = land > 0 && land < 0.35 ? Math.sin(land * 60) * 10 * (1 - land / 0.35) : 0;
  const cam = cam5(t); cam.y += shake;
  drawReef(t, cam, {
    traffic: 8,
    octo: () => otto(t, { hop, squash: land > 0 && land < 0.3 ? 0.3 * Math.sin((land / 0.3) * Math.PI) : -0.15 * Math.sin(K.inv(0, 0.7, d) * Math.PI), mouth: "grin", brow: 0.8, arms: fanArms(t, at(10)), glint: K.inv(at(11), at(11) + 0.4, t) }),
    front: () => {
      K.applyCam(ctx, 1);
      /* sand puff on "sand" */
      if (land > 0 && land < 0.9) for (let i = 0; i < 16; i++) {
        const a = Math.PI + (i / 15) * Math.PI, r = 120 + 420 * K.E.out3(land / 0.9) * (0.6 + 0.4 * K.hash(i, 9));
        K.dot(ctx, DESK.x + Math.cos(a) * r * 1.3, DESK.y + 60 + Math.sin(a) * r * 0.35, (16 + 14 * K.hash(i, 8)) * (1 - land / 0.9), P.sand, P.ink, 3, 70 + i);
      }
      [at(10), at(11)].forEach((ts, k) => { const dd = t - ts; if (dd > 0 && dd < 0.5) for (let i = 0; i < 8; i++) { const a = (i / 8) * K.TAU + k; K.sparkle(ctx, OCT.x + Math.cos(a) * (300 + 500 * dd), OCT.y - 300 + Math.sin(a) * (200 + 300 * dd), 30 * (1 - dd / 0.5), 1 - dd / 0.5, 80 + i); } });
    },
  });
}
