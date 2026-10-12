/* ============================================================
   INTRO 40 LOOP SET: inside Beepo's face screen.
   "Observe, decide, then act again": the agent loop as a ring of three
   pods (eye, brain, bolt). A running light lands on each pod on the beat,
   each pod pops a readout, and "again" ticks the loop counter to 02.
   Drawn in a virtual 1920 x 1080 frame; the caller sets the transform, so
   the same drawing sits inside the face during the dive and fills the frame
   afterwards.
   ============================================================ */
const LOOP_STEPS = [{ icon: "eye", color: P.cyan }, { icon: "fork", color: P.pink }, { icon: "bolt", color: P.yellow }];
const LOOP_C = [960, 590], LOOP_R = 350;
const ARRIVE = [T.observe, T.decide, T.act, T.again, T.again + 2 * BEAT];
function loopActive(t) {
  /* light index: travels 0.4 s before each arrival, rests on the pod */
  let v = 0;
  for (let i = 1; i < ARRIVE.length; i++) v += K.E.inOut(K.inv(ARRIVE[i] - 0.4, ARRIVE[i], t));
  return v;
}
function drawLoopScene(c, t) {
  /* phosphor background + grid */
  c.fillStyle = P.screen; c.fillRect(-200, -200, 2320, 1480);
  const g = c.createRadialGradient(960, 540, 60, 960, 540, 1100); g.addColorStop(0, "#0b3440"); g.addColorStop(1, P.screen);
  c.fillStyle = g; c.fillRect(-200, -200, 2320, 1480);
  c.save(); c.strokeStyle = K.rgba(P.phosphor, 0.08); c.lineWidth = 2; c.beginPath();
  for (let x = -40; x <= 1960; x += 80) { c.moveTo(x, -200); c.lineTo(x, 1280); }
  for (let y = 20; y <= 1100; y += 80) { c.moveTo(-200, y); c.lineTo(2120, y); }
  c.stroke(); c.restore();
  const act = loopActive(t), app = K.inv(T.dive[0] - 0.3, T.dive[0] + 0.1, t);
  K.loopRing(c, LOOP_C[0], LOOP_C[1], LOOP_R, LOOP_STEPS, { a: app, active: act, nodeR: 108, seed: 81, lit: K.inv(T.observe - 0.1, T.observe + 0.1, t) });
  /* centre: loop counter on a seven-segment display, ticks on "again" */
  const n = t >= T.again ? 2 : 1, bump = t >= T.again ? K.inv(T.again, T.again + 0.35, t) : K.inv(T.observe, T.observe + 0.35, t);
  const s = 1 + 0.18 * Math.sin(bump * Math.PI);
  c.save(); c.translate(LOOP_C[0], LOOP_C[1]); c.scale(s * K.popS(app), s * K.popS(app));
  K.pix(c, "clock", 0, -62, 6, P.violet, { glow: 0.8 });
  K.seg7(c, "0" + n, 0, 26, 92, P.phosphor);
  c.restore();
  /* readouts pop beside each pod as the light lands */
  const pod = (i) => { const a = -Math.PI / 2 + (i / 3) * K.TAU; return [LOOP_C[0] + Math.cos(a) * LOOP_R, LOOP_C[1] + Math.sin(a) * LOOP_R]; };
  const pop = (t0) => K.inv(t0, t0 + 0.35, t) * (1 - K.inv(t0 + 3.2, t0 + 3.5, t));
  /* observe: a tiny live chart next to the eye */
  const o0 = pod(0), oa = Math.max(pop(T.observe), pop(T.again));
  if (oa > 0) K.wallScreen(c, o0[0] + 150, o0[1] - 80, 300, 170, (cc, w, h) => K.plot(cc, w, h, [{ data: [3, 4, 3.6, 5, 4.6, 6, 5.7, 7.2], color: P.green }], { draw: K.inv(T.observe, T.observe + 1, t), grid: false }), { a: oa, seed: 83, glow: P.green });
  /* decide: an up arrow with a confidence number */
  const o1 = pod(1), da = pop(T.decide);
  if (da > 0) { K.tag(c, o1[0] + 30, o1[1] + 150, "0.82", { a: da, size: 34, color: P.pink, seed: 84 }); K.pix(c, "up", o1[0] + 150, o1[1] + 150, 8, P.green, { glow: 1, a: Math.min(1, da * 2) }); }
  /* act: a ticket flies out of the bolt pod */
  const o2 = pod(2), aa = K.inv(T.act, T.act + 0.6, t);
  if (aa > 0 && aa < 1) K.ticket(c, K.lerp(o2[0], o2[0] - 330, K.E.out3(aa)), K.lerp(o2[1], o2[1] + 110, K.E.out3(aa)) - 120 * Math.sin(aa * Math.PI), 1.3, { sym: "NVDA", dir: "up", qty: "100", rot: -0.3 * aa, a: Math.min(1, aa * 4) * (1 - K.inv(0.8, 1, aa)), seed: 85 });
  if (t >= T.act + 0.6 && t < T.again + 1.5) K.ticket(c, o2[0] - 330, o2[1] + 110, 1.3, { sym: "NVDA", dir: "up", qty: "100", rot: -0.3, stamp: K.inv(T.act + 0.6, T.act + 0.85, t), seed: 85 });
  [T.observe, T.decide, T.act, T.again].forEach((ta, i) => { const p = pod(i % 3); K.sparks(c, p[0], p[1], ta, { seed: 160 + i, r: 190, n: 12, color: LOOP_STEPS[i % 3].color, size: 16 }); });
  /* phosphor scanlines */
  c.fillStyle = "rgba(0,0,0,0.22)"; for (let y = -200; y < 1280; y += 6) c.fillRect(-200, y, 2320, 2);
}
