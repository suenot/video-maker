/* ============================================================
   INTRO 50 TITLE: "Volatility Modeling and Regimes!". A sunset surf poster:
   striped sun on the horizon, DOM title letters drop in on the downbeat,
   five episode medals pop on eighth notes, Siggy rides a curl below while
   the lighthouse beam switches regime colour every bar.
   ============================================================ */
const TT = { horizon: 700, medalY: 486, medalR: 64 };
const MEDALS = ["garch", "leverage", "cluster", "regimes", "realized"];
const camTitle = K.mkTrack([[T.title - 0.01, { x: 960, y: -260, z: 1 }], [T.title + 0.7, { x: 960, y: 540, z: 1 }], [DUR, { x: 960, y: 548, z: 1.02 }]]);

function titlePose(t) {
  const p = { seed: 700, blink: K.blinkAt(t, 11), squash: 0.08 * K.pulse(t, 1, 6) + 0.12, mouth: "grin", turn: 0.2, brow: 0.4, footL: { x: -70, y: 0 }, footR: { x: 62, y: 0 } };
  p.flipL = { x: -150, y: -160 + 10 * Math.sin(t * 5) }; p.flipR = { x: 150, y: -90 + 10 * Math.sin(t * 6) };
  const hop = K.inv(T.hang, T.hang + 0.5, t);
  if (hop > 0 && hop < 1) { p.squash = -0.2 * Math.sin(hop * Math.PI); p.mouth = "open"; p.brow = 1; }
  const tip = K.inv(T.tip, T.tip + 0.25, t);
  if (tip > 0) { /* pushes the shades up onto the head: happy squint */
    const back = K.inv(T.tip + 0.25, T.tip + 0.6, t);
    p.flipR = { x: K.lerp(150, 46, tip * (1 - back)), y: K.lerp(-90, -330, tip * (1 - back)) };
    p.shades = -28 * tip; p.blink = K.inv(T.tip + 0.2, T.tip + 0.35, t) > 0 ? 0.88 : 0; p.mouth = "grin"; p.brow = 0.8;
  }
  return p;
}

function drawTitle(t) {
  K.begin(ctx, t, camTitle(t));
  K.applyCam(ctx, 1);
  K.sky(ctx, TT.horizon, { storm: 0, sunX: 960, sunY: TT.horizon - 100, sunR: 250, top: -1400, drift: 900 });
  K.farIsle(ctx, 300, TT.horizon, 360, 0, 65);
  for (let i = 0; i < 3; i++) K.gull(ctx, ((200 + i * 300 + t * 70) % 2200) - 100, 590 + i * 30 + 10 * Math.sin(t + i), 1, 60 + i);
  /* the beam switches regime every bar: calm, storm, calm ... */
  const bar = Math.max(0, K.barAt(t)), beam = bar % 2 ? P.beamStorm : P.beamCalm;
  K.lighthouse(ctx, 1730, TT.horizon + 70, 0.82, { beam, ang: 0.15 + 0.2 * Math.sin(t * 1.1), flash: K.pulse(t, 4, 4), seed: 150 });
  K.ocean(ctx, TT.horizon, { storm: 0, vol: 0.45, bottom: 1250, rows: 6 });
  /* Siggy on the curl */
  const wx = 300 + 20 * (t - T.title), h = 380;
  K.surfWave(ctx, wx, 1110, h, { storm: 0, seed: 310 });
  const hop = K.inv(T.hang, T.hang + 0.5, t), lift = Math.sin(hop * Math.PI) * 80 * (hop < 1 ? 1 : 0);
  const sx = 780 + 30 * Math.sin(t * 1.6), sy = 1110 - h * 0.55 + 12 * Math.sin(t * 3) - lift;
  surfer(sx, sy, 14 + 4 * Math.sin(t * 1.6) - 10 * Math.sin(hop * Math.PI), 1.15, titlePose(t), 0.5 + 0.4 * Math.sin(t * 2));
  if (t > T.hang + 0.4) K.spray(ctx, sx + 150, sy + 20, t - T.hang - 0.45, 1.3, 520);
  /* episode medals (screen space, under the title) */
  K.screen(ctx);
  MEDALS.forEach((k, i) => {
    const t0 = T.medals + i * BEAT / 2, x = 960 + (i - 2) * 186, y = TT.medalY + 6 * Math.sin(t * 2.4 + i) - 10 * K.pulse(t - i * 0.06, 1, 6);
    K.medal(ctx, x, y, TT.medalR, { a: K.inv(t0, t0 + 0.35, t), color: P.A[i], icon: K.ICON[k], seed: 600 + i * 7 });
  });
}

function layoutTitleDom(t) {
  const on = t >= T.title;
  titleEl.style.opacity = on ? "1" : "0";
  if (!on) return;
  const sizes = TITLE_LN.map((d) => +d.dataset.size || 120), gap = 28;
  let y = (TITLE_LN.length > 1 ? 92 : 150) + 6 * Math.sin(t * 1.5);
  TITLE_LN.forEach((d, i) => { d.style.top = y.toFixed(1) + "px"; y += sizes[i] * 1.1 + gap; });
  TITLE_CH.forEach((c) => {
    const t0 = (c.line === 0 ? T.title : T.line2) + (c.line === 0 ? c.idx : c.idx - TITLE_LINES[0].length) * 0.03;
    const a = K.inv(t0, t0 + 0.4, t), yy = (1 - K.E.back(a, 2.4)) * -160, land = K.inv(t0 + 0.28, t0 + 0.55, t);
    const sq = Math.sin(land * Math.PI) * 0.16 * (1 - land);
    const wave = c.line === 0 ? 5 * Math.sin(t * 3 - c.idx * 0.5) * K.inv(T.medals, T.medals + 0.5, t) : -6 * K.pulse(t, 4, 6) * K.inv(T.line2 + 1, T.line2 + 1.2, t);
    c.el.style.opacity = a > 0 ? Math.min(1, a * 3).toFixed(2) : "0";
    c.el.style.transform = `translateY(${(yy + wave).toFixed(1)}px) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
  });
}
