/* ============================================================
   INTRO 40 TITLE: the kilim curtain becomes the title banner; DOM title
   letters are block-stamped in; five episode medallions; Tikki in front.
   The title text lives in the DOM (crisp type, variable per language).
   ============================================================ */
const BAN = { cx: 960, top: 0, w: 1980, h: 1110, stop: 0.62 }; /* full curtain, rolls up to 38 % */
const MEDAL_Y = 660, MEDAL_R = 62, MEDAL_X0 = 860, MEDAL_DX = 205;

/* five episode icons, language-free: websocket stream, candles, imbalance, queue, spread */
const ICONS = [
  (c, r) => { [-1, 1].forEach((sd, i) => K.shape(c, sd > 0 ? [[-r * 0.5, -r * 0.2], [r * 0.2, -r * 0.2], [r * 0.2, -r * 0.38], [r * 0.52, -r * 0.12], [r * 0.2, r * 0.14], [r * 0.2, -r * 0.02], [-r * 0.5, -r * 0.02]] : [[r * 0.5, r * 0.06], [-r * 0.2, r * 0.06], [-r * 0.2, -r * 0.12], [-r * 0.52, r * 0.14], [-r * 0.2, r * 0.4], [-r * 0.2, r * 0.24], [r * 0.5, r * 0.24]], { fill: P.paper, w: 3, boil: 0.5, seed: 1 + i, k: 0, nicks: 0, reg: false })); },
  (c, r) => { [[-0.25, -0.35, 0.3, P.up], [0.25, -0.1, 0.36, P.down]].forEach(([x, y, h, col], i) => { K.line(c, [[x * r, (y - 0.15) * r], [x * r, (y + h + 0.2) * r]], { stroke: P.ink, w: 3, boil: 0.4, seed: 5 + i }); K.shape(c, K.rectPts((x - 0.13) * r, y * r, 0.26 * r, h * r, 1), { fill: col, w: 3, boil: 0.4, seed: 7 + i, k: 0, nicks: 0, reg: false }); }); },
  (c, r) => { K.line(c, [[-r * 0.5, r * 0.1], [r * 0.5, -r * 0.15]], { stroke: P.ink, w: 4, boil: 0.4, seed: 10 }); K.line(c, [[0, -r * 0.05], [0, r * 0.45]], { stroke: P.ink, w: 4, boil: 0.4, seed: 11 }); K.dot(c, -r * 0.5, r * 0.18, r * 0.16, P.up, P.ink, 2.5, 12); K.dot(c, r * 0.5, -r * 0.08, r * 0.1, P.down, P.ink, 2.5, 13); },
  (c, r) => { for (let i = 0; i < 3; i++) K.shape(c, K.rectPts(-r * 0.55 + i * r * 0.38, -r * 0.14, r * 0.3, r * 0.3, 1), { fill: i === 1 ? P.gold : P.crate, w: 2.5, boil: 0.4, seed: 20 + i, k: 0, nicks: 0, reg: false }); },
  (c, r) => { K.shape(c, K.rectPts(-r * 0.5, -r * 0.5, r, r * 0.3, 1), { fill: P.ask, w: 2.5, boil: 0.4, seed: 30, k: 0, nicks: 0, reg: false }); K.shape(c, K.rectPts(-r * 0.5, r * 0.2, r, r * 0.3, 1), { fill: P.bid, w: 2.5, boil: 0.4, seed: 31, k: 0, nicks: 0, reg: false }); K.line(c, [[0, -r * 0.16], [0, r * 0.16]], { stroke: P.paper, w: 3, boil: 0.3, seed: 32 }); },
];
const MEDAL_COLORS = [P.teal, P.saffron, P.terra, P.indigo, P.tealDark];

/* banner unroll. Chorus 1 (tease): it drops over the world to the banner height,
   stays for the sung title, then rolls back up. Ending: down over everything,
   then up into the title card. */
function bannerDrop(t) {
  if (t < T.drop[0] - 0.5) {
    const up = K.E.out3(K.inv(T.tease[0], T.tease[1], t)) * (1 - K.E.in3(K.inv(T.tease[2], T.tease[3], t)));
    return up * (1 - BAN.stop);
  }
  if (t < T.drop[0]) return 0;
  if (t < T.rise[0]) return K.E.in3(K.inv(T.drop[0], T.drop[1], t)) * 0.999 + 0.001;
  return K.lerp(1, 1 - BAN.stop, K.E.out3(K.inv(T.rise[0], T.rise[1], t)));
}

/* Tikki on the title card (screen space, bottom left) */
function tikkiTitle(t) {
  const b = pulseB(t), st = { seed: 700, blink: K.blinkAt(t, 9), mouth: "grin", look: [0.6, -0.5], hold: "abacus", beads: [1, 0.2, 0.6, 0.4], squash: 0.08 * b - 0.03 };
  st.handL = { x: -100, y: -120 - 14 * b, pose: "fist" };
  st.handR = { x: 120, y: -230 - 20 * b, pose: "open" };
  /* opening cheer on the title hit */
  const ch = K.inv(T.title, T.title + 0.4, t);
  if (ch < 1) { st.mouth = "shout"; st.hop = 30 * Math.sin(ch * Math.PI); st.handR = { x: 130, y: -270, pose: "open" }; st.handL = { x: -130, y: -250, pose: "fist" }; st.brow = 1.2; }
  /* jump: crouch, stretch up, land squash */
  const j0 = T.jump - 0.3, j1 = T.jump + 0.5;
  if (t > j0 && t < j1 + 0.4) {
    const crouch = K.ss(j0, T.jump, t) * (1 - K.ss(T.jump, T.jump + 0.05, t));
    const air = K.inv(T.jump, j1, t), h = Math.sin(air * Math.PI);
    st.squash += 0.35 * crouch - 0.35 * h * (air < 1 ? 1 : 0); st.hop = 100 * h;
    const land = K.inv(j1, j1 + 0.35, t); if (land > 0 && land < 1) st.squash += 0.4 * Math.sin(land * Math.PI) * (1 - land);
    st.handL = { x: -120, y: -240 - 40 * h, pose: "fist" }; st.handR = { x: 130, y: -260 - 40 * h, pose: "open" };
    st.mouth = "open"; st.fezLift = 30 * h; st.tassel = 60 * h; st.look = [0, -1]; st.tail = 1.2 * h;
  }
  /* bow: tips the fez on the last downbeat */
  const bw = K.ss(T.bow - 0.2, T.bow + 0.1, t);
  if (bw > 0) { st.handR = { x: K.lerp(120, 44, bw), y: K.lerp(-230, -268, bw), pose: "pinch" }; st.fezTip = -22 * bw; st.fezLift = 18 * bw; st.headTilt = 8 * bw; st.mouth = "grin"; st.blink = bw > 0.6 ? 0.9 : st.blink; st.lean = -6 * bw; }
  return st;
}

function drawTitleCanvas(t) {
  K.screen(ctx);
  /* medallions pop on eighth notes from the bar after the title */
  for (let i = 0; i < 5; i++) {
    const t0 = T.medals + i * BEAT / 2, a = K.inv(t0, t0 + 0.35, t);
    if (a <= 0) continue;
    const s = K.E.back(a, 2.6), x = MEDAL_X0 + i * MEDAL_DX, y = MEDAL_Y + 6 * Math.sin(t * 2.4 + i) - 10 * K.pulse(t - i * 0.08, 1, 6);
    const sw = 0.08 * Math.sin(t * 2.2 + i * 1.3), top = BAN.h * (1 - BAN.stop) + 40;
    K.line(ctx, [[x, top], [x + Math.sin(sw) * (y - top), y - MEDAL_R]], { stroke: P.ink, w: 3.5, boil: 0.6, seed: 610 + i });
    ctx.save(); ctx.translate(x + Math.sin(sw) * (y - top), y); ctx.rotate(-sw); ctx.scale(s, s);
    K.coin(ctx, 0, 0, MEDAL_R, { color: MEDAL_COLORS[i], seed: 600 + i * 7, hole: false });
    ICONS[i](ctx, MEDAL_R);
    ctx.restore();
  }
  K.raccoon(ctx, 470, 1050, 1.5, tikkiTitle(t));
}

/* the title is stamped twice: on chorus 1 (tease) and on the final chorus */
function layoutTitleDom(t) {
  const d = bannerDrop(t), fin = t >= T.title - 0.05, tease = t >= T.tease[1] - 0.05 && t < T.tease[3];
  const t0 = fin ? T.title : T.tease[1], t1 = fin ? T.line2 : T.tease[1] + 2 * BEAT;
  titleEl.style.opacity = fin ? "1" : tease ? (1 - K.inv(T.tease[2], T.tease[2] + 0.25, t)).toFixed(2) : "0";
  if (!fin && !tease) return;
  const bh = BAN.h * d, n = TITLE_LN.length, sizes = TITLE_LN.map((x) => +x.dataset.size), gap = 14;
  const total = sizes.reduce((a, b) => a + b, 0) + gap * (n - 1);
  let y = Math.max(90, (bh + 30) / 2 - total / 2); /* below the triangle band, above the roll */
  TITLE_LN.forEach((x, i) => { x.style.top = y.toFixed(1) + "px"; y += sizes[i] + gap; });
  /* block-stamp: each letter drops from 1.7x, slams down with a squash, staggered */
  TITLE_CH.forEach((c) => {
    const base = c.line === 0 ? t0 : t1, tc = base + c.li * 0.03;
    const a = K.inv(tc, tc + 0.16, t), land = K.inv(tc + 0.16, tc + 0.4, t);
    const sc = a < 1 ? K.lerp(1.7, 1, K.E.in3(a)) : 1 + 0.1 * Math.sin(land * Math.PI) * (1 - land);
    const sq = a >= 1 ? Math.sin(land * Math.PI) * 0.14 * (1 - land) : 0;
    const hop = c.line === n - 1 ? -5 * K.pulse(t, 4, 6) * K.inv(t1 + 1, t1 + 1.2, t) : 0;
    c.el.style.opacity = a > 0 ? Math.min(1, a * 2.5).toFixed(2) : "0";
    c.el.style.transform = `translateY(${hop.toFixed(1)}px) scale(${(sc * (1 + sq)).toFixed(3)}, ${(sc * (1 - sq)).toFixed(3)}) rotate(${(K.hs(c.idx, 3) * 3 * (1 - land)).toFixed(2)}deg)`;
  });
}
