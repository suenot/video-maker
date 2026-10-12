/* ============================================================
   INTRO 40 TRAIN: "Choo choo, keep the slippage low" (10.9 - 14.6 s)
   The locomotive pulls the eight 1 250 wagons across a valley whose mesas
   are the day's volume profile (U-shaped: busy open and close).
   Mr. Tick rides in the cab and blows the whistle on both "choo"s; the
   slippage gauge by the line pops up, its needle swings and settles low,
   and he gives it a thumbs-up.
   ============================================================ */
const TRAIN = { rail: 880, v: 560, x0: 120, s: 1.2 };
const VOL = [430, 330, 250, 200, 190, 215, 270, 360, 470];
const locoX = (t) => TRAIN.x0 + TRAIN.v * (t - T.steam[0]);
const GAUGE = { x: locoX(T.gauge) + 640, y: 330, r: 130 };

function slipNeedle(t) {
  const base = 0.14 + 0.025 * Math.sin(t * 9) + 0.015 * Math.sin(t * 23);
  const p = K.inv(T.gauge, T.gauge + 0.3, t), s = K.inv(T.gauge + 0.3, T.low, t);
  /* jumps toward the tomato zone when it appears, then is reined back to low */
  return p <= 0 ? base : K.lerp(base + 0.42 * K.E.out3(p), base, K.E.back(s, 1.4));
}

function drawTrain(c, t) {
  const lx = locoX(t);
  K.begin(c, t, { x: lx - 160, y: 610, z: 0.98, rot: 0 });
  K.applyCam(c, 0.2);
  K.sky(c, { horizon: 790, sun: [1450, 260], sunR: 110 });
  K.cloud(c, 200, 150, 260, 31); K.cloud(c, 1100, 230, 220, 34); K.cloud(c, 1900, 120, 250, 37);
  K.applyCam(c, 0.3);
  /* volume-profile mesas: the whole U stays in view (low parallax) */
  VOL.forEach((h0, i) => {
    const h = h0 * 0.95;
    const x = 230 + i * 215, w = 168;
    K.shape(c, [[x - w / 2, 820], [x - w / 2 + 18, 820 - h], [x + w / 2 - 18, 820 - h], [x + w / 2, 820]], { fill: i % 2 ? P.hillMid : P.tealLight, w: 3, seed: 1600 + i * 3, shade: { color: P.tealDark, dx: w * 0.3, dy: 0 }, tone: { color: P.ink, gap: 11, r: 0, r2: 2.4, dir: Math.PI / 2, alpha: 0.2 } });
    K.shape(c, K.rectPts(x - w / 2 + 18, 820 - h, w - 36, 16, 3), { fill: P.mustard, w: 2.5, seed: 1601 + i * 3 });
  });
  K.applyCam(c, 0.8);
  K.hills(c, -800, 4200, 860, { h: 90, color: P.hillMid, seed: 41, n: 12 });
  K.applyCam(c, 1);
  K.shape(c, [[-1200, TRAIN.rail + 20], [5200, TRAIN.rail + 20], [5200, 1800], [-1200, 1800]], { fill: P.hillNear, w: 3, seed: 1650, tone: { color: P.ink, gap: 12, r: 0.6, r2: 2.6, dir: Math.PI / 2, alpha: 0.2 } });
  K.track(c, -1200, 5200, TRAIN.rail, { seed: 1660 });
  /* telegraph poles for speed reference */
  for (let x = -1000; x < 5200; x += 520) {
    K.shape(c, K.rectPts(x - 6, TRAIN.rail - 330, 12, 330, 2), { fill: P.woodDark, w: 2, seed: 1670 + x, reg: 0 });
    K.shape(c, K.rectPts(x - 40, TRAIN.rail - 320, 80, 10, 2), { fill: P.woodDark, w: 2, seed: 1671 + x, reg: 0 });
  }
  /* smoke: steady puffs every half beat, big ones on each "choo" */
  const chimney = (ts) => [locoX(ts) + 133 * TRAIN.s, TRAIN.rail - 280 * TRAIN.s];
  for (let k = 0; k < 14; k++) {
    const ts = T.steam[0] + k * BEAT * 0.5, age = t - ts; if (age < 0 || age > 1.6) continue;
    const p = chimney(ts);
    K.puff(c, p[0] - 40 * age, p[1] - 170 * age, 46 + 10 * (k % 3), age / 1.6, 1700 + k);
  }
  T.choo.forEach((tc, k) => {
    const age = t - tc; if (age < 0 || age > 1.5) return;
    const p = chimney(tc);
    K.puff(c, p[0] - 60 * age, p[1] - 60 - 200 * age, 110, age / 1.5, 1720 + k);
  });
  /* wagons then the locomotive (the train runs right) */
  for (let j = N_WAG - 1; j >= 0; j--) {
    const x = lx - 330 * TRAIN.s - j * 186 * TRAIN.s;
    K.wagon(c, x, TRAIN.rail, WAG_S * TRAIN.s, { roll: lx, seed: 1800 + j * 20, color: j % 2 ? P.teal : P.tealLight, shade: P.tealDark, bob: Math.sin(t * 20 + j) * 1.4,
      load: (cc) => K.crate(cc, 0, -58, 140, 84, { label: CHILD, labelSize: 40, seed: 1810 + j * 3 }) });
  }
  const chooP = Math.max(...T.choo.map((tc) => Math.sin(Math.PI * K.inv(tc - 0.05, tc + 0.4, t))));
  const thumbs = K.inv(T.thumbs, T.thumbs + 0.25, t);
  K.loco(c, lx, TRAIN.rail, TRAIN.s, { roll: lx, seed: 1900, bob: Math.sin(t * 18) * 1.5,
    cab: (cc) => {
      const st = { blink: K.blinkAt(t, 31), seed: 700, look: [0.8, -0.2], squash: 0.05 * K.pulse(t, 1, 6), mouth: "smile", handL: { x: -60, y: -60 } };
      if (chooP > 0) { st.handR = { x: 30, y: -172, hold: "whistle", wAng: Math.PI * 1.04 }; st.mouth = "whistle"; st.puff = chooP; st.blink = 0; st.squash = -0.1 * chooP; }
      else if (thumbs > 0) { st.handR = { x: 80, y: -170 - 30 * K.E.back(thumbs, 2), hold: "thumb" }; st.mouth = "grin"; st.look = [1, -0.6]; st.brow = 0.8; }
      else st.handR = { x: 64, y: -80 };
      if (t > T.gauge && t < T.thumbs) { st.look = [1, -1]; st.brow = 1; st.mouth = t < T.gauge + 0.6 ? "o" : "smile"; }
      K.mouse(cc, -95, -58, 0.56, st);
    } });
  /* whistle steam above the cab */
  T.choo.forEach((tc, k) => { const age = t - tc - 0.05; if (age > 0 && age < 0.7) K.puff(c, lx - 80 * TRAIN.s - 30 * age, TRAIN.rail - 290 * TRAIN.s - 120 * age, 34, age / 0.7, 1950 + k); });
  /* the slippage gauge on its signal post */
  const ga = K.inv(T.gauge - 0.05, T.gauge + 0.35, t);
  if (ga > 0) {
    K.shape(c, K.rectPts(GAUGE.x - 10, GAUGE.y, 20, TRAIN.rail + 20 - GAUGE.y, 2), { fill: P.ink, w: 2, seed: 1990, reg: 0 });
    c.save(); const s = K.popS(ga); c.translate(GAUGE.x, GAUGE.y); c.scale(s, s); c.translate(-GAUGE.x, -GAUGE.y);
    K.gauge(c, GAUGE.x, GAUGE.y, GAUGE.r, slipNeedle(t), { seed: 1995, label: "bps" });
    c.restore();
    const ok = K.inv(T.low, T.low + 0.3, t);
    if (ok > 0) K.star(c, GAUGE.x - GAUGE.r * 0.9, GAUGE.y - GAUGE.r * 0.9, 36 * K.E.back(ok, 2.5), { seed: 1999, rot: t });
  }
}
