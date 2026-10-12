/* ============================================================
   INTRO 50 TITLE: "Execution and Market Making, on deck!" (14.58 - 19.8 s)
   An enamel station sign drops on the downbeat; the title (DOM text, per
   language) flips in letter by letter like a split-flap board. Four
   platform roundels pop on half beats: TWAP, VWAP, Almgren-Chriss, market
   making. Mr. Tick blows the whistle on "on deck!" and tips his cap.
   ============================================================ */
const SIGN = { cx: 960, cy: 228, w: 1480, h: 300 };
const ROUND = { y: 512, r: 64, xs: [600, 768, 1152, 1320] };
const ROUND_C = [P.teal, P.mustard, P.tomato, P.tealDark];

/* episode icons, language-free, drawn in a disc of radius r around (0, 0) */
const ICONS = [
  (c, r) => { for (let i = 0; i < 4; i++) K.shape(c, K.rectPts(-r * 0.5 + i * r * 0.27, -r * 0.05, r * 0.18, r * 0.42, 1), { fill: P.teal, w: 2.2, seed: 2000 + i, boil: 0.3 }); },
  (c, r) => { [0.5, 0.3, 0.2, 0.32, 0.55].forEach((h, i) => K.shape(c, K.rectPts(-r * 0.55 + i * r * 0.23, r * 0.38 - h * r, r * 0.16, h * r, 1), { fill: P.mustard, w: 2.2, seed: 2010 + i, boil: 0.3 })); },
  (c, r) => {
    /* Almgren-Chriss frontier: cost falls as risk rises (convex); the chosen point in tomato */
    K.line(c, [[-r * 0.55, -r * 0.55], [-r * 0.55, r * 0.5], [r * 0.6, r * 0.5]], { w: 3, seed: 2019 });
    const P0 = (u) => [-r * 0.4 + u * r * 0.92, -r * 0.42 + r * 0.78 * (1 - Math.pow(1 - u, 3))];
    const pts = []; for (let i = 0; i <= 12; i++) { const q = P0(i / 12); pts.push([q[0], -q[1] + r * 0.06]); }
    K.line(c, pts, { w: 4.5, seed: 2020, smooth: true });
    const d = P0(0.3); K.dot(c, d[0], -d[1] + r * 0.06, r * 0.13, P.tomato, P.ink, 2, 2021);
  },
  (c, r) => {
    K.shape(c, [[-r * 0.3, -r * 0.45], [-r * 0.02, -r * 0.1], [-r * 0.2, -r * 0.1], [-r * 0.2, r * 0.4], [-r * 0.4, r * 0.4], [-r * 0.4, -r * 0.1], [-r * 0.58, -r * 0.1]], { fill: P.teal, w: 2.2, seed: 2030, boil: 0.3 });
    K.shape(c, [[r * 0.3, r * 0.45], [r * 0.02, r * 0.1], [r * 0.2, r * 0.1], [r * 0.2, -r * 0.4], [r * 0.4, -r * 0.4], [r * 0.4, r * 0.1], [r * 0.58, r * 0.1]], { fill: P.tomato, w: 2.2, seed: 2031, boil: 0.3 });
  },
];

function drawTitleSet(c, t) {
  const z = K.tw(t, T.flap2[0], DUR, 1.05, 1.0, K.E.out3);
  K.begin(c, t, { x: 960, y: 560, z, rot: 0 });
  K.applyCam(c, 0.3);
  K.sky(c, { horizon: 800, sun: [960, 250], sunR: 190, warm: 0.6 });
  K.cloud(c, 170, 470, 240, 41); K.cloud(c, 1760, 430, 260, 44);
  K.applyCam(c, 0.6);
  K.hills(c, -500, 2500, 830, { h: 150, color: P.hillMid, seed: 47, n: 6 });
  for (let i = 0; i < 6; i++) poplar(c, -60 + i * 400 + 90 * K.hash(i, 8), 840, 200 + 50 * K.hash(i, 9), 2100 + i, i % 2 ? P.tealDark : P.teal);
  K.applyCam(c, 1);
  K.shape(c, [[-400, 930], [2400, 930], [2400, 1500], [-400, 1500]], { fill: P.hillNear, w: 3, seed: 2150, tone: { color: P.ink, gap: 12, r: 0.6, r2: 2.6, dir: Math.PI / 2, alpha: 0.2 } });
  K.clockTower(c, 1660, 870, 0.62, { hour: 10 + 3 / 60, minute: 3 + (t - T.sign[0]) * 0.5, gearRot: t * 0.7, seed: 2160 });
  K.platform(c, 420, 1500, 870, { h: 80, seed: 2170 });
  K.lampPost(c, 520, 870, 230, 2180); K.lampPost(c, 1400, 870, 230, 2184);
  K.track(c, -400, 2400, 960, { seed: 2190 });
  /* parked train, steaming on every beat */
  for (let k = 0; k < 12; k++) {
    const ts = T.flap2[0] + k * BEAT, age = t - ts; if (age < 0 || age > 1.8) continue;
    K.puff(c, 200 * 0.86 + 133 * 0.86 - 30 * age, 960 - 280 * 0.86 - 150 * age, 40 + 8 * (k % 3), age / 1.8, 2200 + k);
  }
  for (let j = 0; j < 2; j++) K.wagon(c, 200 * 0.86 - 260 - j * 170, 960, WAG_S * 0.86, { seed: 2300 + j * 20, color: j % 2 ? P.teal : P.tealLight, shade: P.tealDark, load: (cc) => K.crate(cc, 0, -58, 140, 84, { label: CHILD, labelSize: 40, seed: 2310 + j * 3 }) });
  K.loco(c, 200 * 0.86, 960, 0.86, { seed: 2350, bob: Math.sin(t * 3) * 1 });
  /* Mr. Tick on the platform */
  const bl = K.blinkAt(t, 41), pulse = K.pulse(t, 1, 6);
  const st = { blink: bl, squash: 0.07 * pulse, seed: 700, mouth: "smile", look: [0, -0.4] };
  const land = t - T.sign[1] + 0.5;
  st.handL = { x: -66, y: -124 + 6 * pulse, hold: "watch", lid: K.inv(T.roundels, T.roundels + 0.3, t) };
  st.handR = { x: 64, y: -72 };
  if (t < T.sign[1]) { st.look = [0, -1]; st.brow = 1.2; st.mouth = "o"; st.eyeUp = 4 * K.inv(T.sign[0], T.sign[0] + 0.3, t); }
  if (land > 0 && land < 0.6) st.squash = 0.3 * Math.exp(-land * 6) * Math.cos(land * 18);
  const wh = Math.sin(Math.PI * K.inv(T.whistle - 0.1, T.whistle + 0.7, t));
  if (wh > 0) { st.handR = { x: 30, y: -172, hold: "whistle", wAng: Math.PI * 1.04 }; st.mouth = "whistle"; st.puff = wh; st.blink = 0; st.look = [0.3, -0.2]; }
  const tip = K.inv(T.hatTip, T.hatTip + 0.3, t);
  if (tip > 0) {
    const k = Math.sin(Math.PI * K.inv(T.hatTip, T.hatTip + 1.1, t));
    st.handR = { x: 112, y: -236 - 24 * k, open: 1 }; st.hatTip = 16 * k; st.hatLift = 22 * k; st.mouth = "grin"; st.look = [0.2, 0.1]; st.brow = 0.6;
  }
  K.mouse(c, 960, 870, 1.15, st);
  if (wh > 0.1) { const age = K.inv(T.whistle, T.whistle + 0.8, t); K.puff(c, 960 - 40 - 50 * age, 870 - 1.15 * 230 - 140 * age, 40, age, 2400); }
  /* screen-space: sign + roundels */
  K.screen(c);
  const box = K.sign(c, SIGN.cx, SIGN.cy, SIGN.w, SIGN.h, K.inv(T.sign[0], T.sign[1], t), { seed: 2500 });
  for (let i = 0; i < 4; i++) {
    const t0 = T.roundels + i * BEAT * 0.5, a = K.inv(t0, t0 + 0.38, t);
    if (a <= 0) continue;
    const s = K.popS(a), x = ROUND.xs[i], y = ROUND.y + 5 * Math.sin(t * 2.2 + i) - 8 * K.pulse(t - i * 0.06, 1, 6);
    c.save(); c.translate(x, y); c.scale(s, s);
    K.shape(c, K.ellipsePts(0, 0, ROUND.r, ROUND.r, 30), { fill: ROUND_C[i], w: 3.5, smooth: true, seed: 2600 + i * 5 });
    K.shape(c, K.ellipsePts(0, 0, ROUND.r * 0.74, ROUND.r * 0.74, 26), { fill: P.cream, w: 3, smooth: true, seed: 2601 + i * 5 });
    ICONS[i](c, ROUND.r * 0.74);
    c.restore();
  }
  return box;
}

function layoutTitleDom(t, box) {
  titleEl.style.opacity = box ? "1" : "0";
  if (!box) return;
  const n = TITLE_LN.length, sizes = TITLE_LN.map((d) => +d.dataset.size), gap = 14;
  const total = sizes.reduce((a, b) => a + b, 0) + gap * (n - 1);
  let y = box.y - total / 2 - 4;
  TITLE_LN.forEach((d, i) => {
    d.style.top = y.toFixed(1) + "px";
    d.style.transform = `rotate(${(box.rot * 180 / Math.PI).toFixed(3)}deg)`;
    d.style.transformOrigin = `${SIGN.cx}px ${(box.y - y).toFixed(1)}px`;
    y += sizes[i] + gap;
  });
  TITLE_CH.forEach((ch) => {
    const t0 = T.letters + ch.idx * 0.04, a = K.inv(t0, t0 + 0.32, t);
    /* split-flap flip: the letter swings down from the hinge above it */
    const rx = (1 - K.E.back(a, 1.8)) * -100;
    ch.el.style.opacity = a > 0 ? "1" : "0";
    ch.el.style.transform = `rotateX(${rx.toFixed(1)}deg)`;
  });
}
