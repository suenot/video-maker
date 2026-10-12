/* ============================================================
   INTRO 45 CAB: chorus 1, "Choo choo, keep the slippage low" (14.8 - 18.5 s)
   Inside the locomotive cab. Mr. Tick pulls the whistle cord on both "choo"s
   (steam bursts past the porthole, the cab shakes), turns to the slippage
   gauge on "keep the slippage", taps it until the needle settles low on
   "low", and gives it a thumbs-up.
   ============================================================ */
const CAB = { win: [500, 400, 250], gauge: [1470, 470, 150], cord: [1030, 650], mouse: [930, 1010], s: 1.75 };

function cabNeedle(t) {
  const base = 0.16 + 0.03 * Math.sin(t * 11) + 0.015 * Math.sin(t * 29);
  const up = K.inv(T.cabSlip - 0.05, T.cabSlip + 0.25, t), down = K.inv(T.cabSlip + 0.4, T.cabLow, t);
  return K.lerp(base + 0.4 * K.E.out3(up), base, K.E.back(down, 1.3));
}

function drawCab(c, t) {
  const pull = Math.max(...T.cabChoo.map((tc) => Math.sin(Math.PI * K.inv(tc - 0.08, tc + 0.32, t))));
  const shake = pull * 5 * Math.sin(t * 70);
  K.begin(c, t, { x: 960 + shake, y: 540 + shake * 0.5, z: K.tw(t, T.steam0[0], T.flapC[1], 1.0, 1.06, K.E.inOut), rot: 0 });
  K.applyCam(c, 1);
  /* the view through the porthole: hills and poles racing past */
  const [wx, wy, wr] = CAB.win;
  c.save(); K.pathOf(c, K.ellipsePts(wx, wy, wr, wr, 40), true, true); c.clip();
  c.fillStyle = P.sky; c.fillRect(wx - wr, wy - wr, wr * 2, wr * 2);
  K.halftone(c, K.rectPts(wx - wr, wy - wr, wr * 2, wr * 2, 1), { color: P.mustardLight, gap: 14, r: 0, r2: 4.4, dir: Math.PI / 2, alpha: 0.7 });
  const scroll = t * 520;
  K.hills(c, wx - wr - 600 - (scroll * 0.4) % 600, wx + wr + 600, wy + 90, { h: 120, color: P.hillMid, seed: 61, n: 8 });
  for (let k = -1; k < 4; k++) { const px = wx + wr - ((scroll + k * 260) % 1040) + 260; K.shape(c, K.rectPts(px, wy - 160, 14, 400, 2), { fill: P.woodDark, w: 2, seed: 3000 + k, reg: 0 }); }
  T.cabChoo.forEach((tc, k) => { const age = t - tc; if (age > 0 && age < 1.4) K.puff(c, wx + 160 - 420 * age, wy - 120 - 30 * age, 120, age / 1.4, 3010 + k); });
  c.restore();
  /* cab wall with the porthole cut out */
  const wall = [[-200, -200], [2200, -200], [2200, 1400], [-200, 1400]];
  c.save(); c.beginPath(); c.rect(-200, -200, 2400, 1600); c.moveTo(wx + wr, wy); c.arc(wx, wy, wr, 0, K.TAU, true); c.clip("evenodd");
  K.shape(c, wall, { fill: P.mustard, key: null, seed: 3020, boil: 0, tone: { color: P.mustardDark, gap: 12, r: 0.5, r2: 3, dir: Math.PI / 2, alpha: 0.5 } });
  /* rivet rows and a teal wainscot */
  K.shape(c, [[-200, 720], [2200, 720], [2200, 1400], [-200, 1400]], { fill: P.teal, w: 3, seed: 3021, shade: { color: P.tealDark, dx: 0, dy: 26 } });
  for (let x = 40; x < 1920; x += 80) { K.dot(c, x, 744, 6, P.mustardLight, P.ink, 2, 3030 + x); K.dot(c, x, 90, 6, P.mustardLight, P.ink, 2, 3031 + x); }
  c.restore();
  /* porthole rim */
  K.shape(c, K.ellipsePts(wx, wy, wr + 14, wr + 14, 44), { fill: null, key: P.ink, w: 30, seed: 3040, smooth: true });
  K.shape(c, K.ellipsePts(wx, wy, wr + 14, wr + 14, 44), { fill: null, key: P.steelLight, w: 14, seed: 3041, smooth: true });
  /* firebox: glowing coals behind a grate */
  K.shape(c, K.rrectPts(80, 800, 300, 220, 20, 4), { fill: P.ink, w: 3, seed: 3050, reg: 0 });
  K.shape(c, K.rrectPts(110, 830, 240, 160, 14, 4), { fill: P.tomato, w: 2.5, seed: 3051, tone: { color: P.mustardLight, gap: 10, r: 4.5 + 0.8 * Math.sin(t * 8), r2: 1, dir: Math.PI / 2, alpha: 0.9 } });
  for (let i = 0; i < 5; i++) K.line(c, [[130 + i * 50, 830], [130 + i * 50, 990]], { w: 6, seed: 3052 + i });
  /* dashboard: brass pipes, the big slippage gauge and a small pressure gauge */
  K.shape(c, K.rrectPts(1230, 220, 560, 520, 30, 5), { fill: P.tealDark, w: 3.5, seed: 3060, shade: { color: P.ink, dx: 0, dy: 16 } });
  K.line(c, [[1250, 760], [1250, 860], [1820, 860]], { key: P.mustardDark, w: 18, seed: 3061 });
  K.line(c, [[1250, 760], [1250, 860], [1820, 860]], { key: P.mustardLight, w: 8, seed: 3061 });
  const [gx, gy, gr] = CAB.gauge;
  K.gauge(c, gx, gy, gr, cabNeedle(t), { seed: 3070, label: "bps" });
  K.gauge(c, 1680, 650, 62, 0.55 + 0.05 * Math.sin(t * 5), { seed: 3080, lo: 0.3, hi: 0.85 });
  const ok = K.inv(T.cabLow, T.cabLow + 0.3, t);
  if (ok > 0) K.star(c, gx + gr * 0.95, gy - gr * 0.95, 44 * K.E.back(ok, 2.5), { seed: 3090, rot: t });
  /* whistle cord from the roof */
  const [cx0, cy0] = CAB.cord, cy = cy0 + 46 * pull;
  K.line(c, [[cx0, -40], [cx0, cy - 20]], { key: P.ink, w: 4, seed: 3100 });
  K.shape(c, K.rrectPts(cx0 - 36, cy - 22, 72, 22, 10, 2), { fill: P.mustard, w: 3, seed: 3101 });
  /* Mr. Tick */
  const [mx, my] = CAB.mouse, s = CAB.s, pulse = K.pulse(t, 1, 6);
  const st = { blink: K.blinkAt(t, 51), seed: 700, squash: 0.06 * pulse, mouth: "smile", look: [0.4, -0.6] };
  const lx = (cx0 - mx) / s, ly = (cy - my) / s + 12;
  st.handR = { x: lx, y: ly, hold: "point" }; /* hand on the cord handle */
  st.handL = { x: -66, y: -80 };
  if (pull > 0.05) { st.mouth = "grin"; st.squash = -0.18 * pull; st.look = [0.3, -1]; st.brow = 1; st.ear = pull; }
  const look = K.inv(T.cabSlip - 0.1, T.cabSlip + 0.15, t);
  if (look > 0) {
    st.look = [1, -0.8]; st.mouth = t < T.cabLow ? "o" : "grin"; st.brow = t < T.cabLow ? 1.3 : 0.7;
    /* taps the glass twice, then thumbs up */
    const tap = Math.max(0, Math.sin(((t - T.cabSlip - 0.35) / (BEAT * 0.5)) * Math.PI)) * (t > T.cabSlip + 0.35 && t < T.cabLow ? 1 : 0);
    st.handR = { x: 112 + 14 * tap, y: -232 + 16 * tap, hold: "point" };
    if (ok > 0) { st.handR = { x: 110, y: -170 - 40 * K.E.back(ok, 2), hold: "thumb" }; st.handL = { x: -70, y: -150, open: 1 }; }
  }
  K.mouse(c, mx, my, s, st);
}
