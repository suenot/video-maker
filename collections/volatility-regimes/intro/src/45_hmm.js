/* ============================================================
   INTRO 45 HMM: "hidden states switch". Two buoys on the water are the two
   hidden regimes (sun = calm, storm cloud = storm). Currents between them
   carry the transition probabilities, self-loops the "stay" odds. The
   active state glows and the whole world (sky, sea, beam) follows it;
   Siggy surfs over to whichever buoy is live.
   drawHmm(t, t0, switches): t0 = scene start, switches = times the state flips
   ============================================================ */
const HMM = { horizon: 520, calm: [600, 800], storm: [1330, 800] };

function hmmState(t, switches) {
  let s = 0, last = -1e9;
  switches.forEach((ts) => { if (t >= ts) { s = 1 - s; last = ts; } });
  return { s, last, u: K.E.inOut(K.inv(last, last + 0.45, t)) };
}

function drawHmm(t, t0, switches) {
  const st = hmmState(t, switches), storm = st.s ? st.u : 1 - st.u;
  K.begin(ctx, t, { x: 960, y: K.tw(t, t0, t0 + 0.4, 120, 540, K.E.out3), z: K.tw(t, t0, t0 + 2, 1.06, 1.0, K.E.out3), rot: 0 });
  K.applyCam(ctx, 1);
  K.sky(ctx, HMM.horizon, { storm, sunX: 1500, sunY: 280, sunR: 110, top: -1200, drift: 500 });
  K.farIsle(ctx, 240, HMM.horizon, 340, storm, 67);
  K.lighthouse(ctx, 1760, HMM.horizon + 40, 0.6, { beam: K.mix(P.beamCalm, P.beamStorm, storm), ang: 0.3 + 0.1 * Math.sin(t * 1.2), flash: Math.exp(-5 * Math.max(0, t - st.last)) * (st.last > t0 ? 1 : 0), seed: 160 });
  K.ocean(ctx, HMM.horizon, { storm, vol: 0.15 + 0.7 * storm, bottom: 1240 });
  const a = (k) => K.inv(t0 + 0.2 + k * BEAT / 2, t0 + 0.6 + k * BEAT / 2, t); /* pops start as the camera lands */
  const C = HMM.calm, S = HMM.storm, up = [0, -150];
  /* currents first (behind the buoys) */
  K.current(ctx, [C[0] + up[0], C[1] - 130], [S[0], S[1] - 130], { p: a(2), bend: -120, label: "0.03", seed: 171, hot: st.s === 1 && t - st.last < 0.8, labelSize: 34 });
  K.current(ctx, [S[0], S[1] - 40], [C[0], C[1] - 40], { p: a(3), bend: -70, label: "0.10", seed: 172, hot: st.s === 0 && st.last > t0 && t - st.last < 0.8, labelSize: 34 });
  K.loopCurrent(ctx, [C[0], C[1] - 230], 90, { p: a(4), label: "0.97", seed: 173, labelSize: 34 });
  K.loopCurrent(ctx, [S[0], S[1] - 230], 90, { p: a(5), label: "0.90", seed: 174, labelSize: 34 });
  K.buoy(ctx, C[0], C[1], 1.25, { a: a(0), color: P.calm, icon: K.ICON.sun, seed: 181, hot: st.s === 0 ? 1 : 0 });
  K.buoy(ctx, S[0], S[1], 1.25, { a: a(1), color: P.storm, icon: K.ICON.storm, seed: 182, hot: st.s === 1 ? 1 : 0 });
  /* Siggy surfs to the live buoy */
  const from = st.s ? C : S, to = st.s ? S : C, k = st.last > t0 ? st.u : 1;
  const side = (q) => q[0] + (q === C ? -330 : 330); /* rides on the outer side of the live buoy */
  const sx = K.lerp(side(from), side(to), k), sy = 985 - 40 * Math.sin(k * Math.PI) + 8 * Math.sin(t * 2.6);
  surfer(sx, sy, 6 * Math.sin(t * 2.2) - 10 * Math.sin(k * Math.PI), 0.95, {
    seed: 700, blink: K.blinkAt(t, 13), squash: 0.07 * K.pulse(t, 1, 6), mouth: storm > 0.5 ? "grin" : "smile", brow: storm > 0.5 ? 0.8 : 0,
    turn: st.s ? -0.5 : 0.5, flipL: { x: -130, y: -150 + 10 * Math.sin(t * 5) }, flipR: { x: 130, y: -120 }, footL: { x: -66, y: 0 }, footR: { x: 58, y: 0 },
  }, 0.15 + 0.75 * storm);
  K.rain(ctx, storm, {});
}
