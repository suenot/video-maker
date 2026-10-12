/* ============================================================
   INTRO 60 RIDE: volatility clustering on the water. A set of big storm
   waves rolls through one after another (big waves follow big waves) and
   Siggy rides them on the storm gun, the gauge pinned high; then calm
   returns on the downbeat, the beam turns turquoise and the camera tilts
   up into the sunset for the title.
   ============================================================ */
const RIDE_H = 540;
function drawRide(t) {
  const storm = 1 - K.E.inOut(K.inv(T.calmBack, T.calmBack + 0.7, t));
  const cam = { x: 960 + 20 * Math.sin(t * 0.8), y: K.tw(t, T.tilt2[0], T.tilt2[1], 560, -640, K.E.in3), z: K.tw(t, T.ride, T.ride + 1.5, 1.12, 1.02, K.E.out3), rot: 0 };
  K.begin(ctx, t, cam);
  K.applyCam(ctx, 1);
  K.sky(ctx, RIDE_H, { storm, sunX: 1250, sunY: 330, sunR: 120, top: -1500, drift: 700 });
  K.farIsle(ctx, 300, RIDE_H, 400, storm, 69);
  K.lighthouse(ctx, 1740, RIDE_H + 40, 0.7, { beam: K.mix(P.beamCalm, P.beamStorm, storm), ang: 0.25 + 0.15 * Math.sin(t * 1.3), flash: Math.exp(-4 * Math.max(0, t - T.calmBack)) * (t > T.calmBack ? 1 : 0) + 0.4 * K.pulse(t, 4, 5) * storm, seed: 170 });
  K.ocean(ctx, RIDE_H, { storm, vol: 0.15 + 0.85 * storm, bottom: 1300 });
  /* the set: three big waves on consecutive half bars march in from the right */
  for (let k = 2; k >= 0; k--) {
    const t0 = T.ride + k * 2 * BEAT, u = (t - t0) / (4.5 * BEAT);
    if (u < 0 || u > 1.4) continue;
    const h = 300 * storm * Math.sin(Math.min(1, u) * Math.PI * 0.9 + 0.15);
    if (h > 8) K.surfWave(ctx, 2100 - 1500 * u, 900, h, { storm, seed: 340 + k, width: 800 });
  }
  /* the hero wave under Siggy (shrinks when calm returns) */
  const h = (380 + 40 * Math.sin((t - T.ride) * 4.2)) * (0.25 + 0.75 * storm), cx = 300 + 30 * Math.sin(t * 0.9);
  K.surfWave(ctx, cx, 1110, h, { storm, seed: 300 });
  const x = 820 + 40 * Math.sin(t * 1.7), y = 1110 - h * 0.58 + 10 * Math.sin(t * 3.3), ang = 14 * (0.4 + 0.6 * storm) + 5 * Math.sin(t * 2.6);
  const relax = K.inv(T.calmBack, T.calmBack + 0.4, t);
  surfer(x, y, ang, 1.2, {
    seed: 700, blink: K.blinkAt(t, 19), squash: 0.16 * storm + 0.07 * K.pulse(t, 1, 6),
    mouth: relax > 0 ? "smile" : "grin", brow: 0.9 * storm, turn: -0.2 + 0.4 * relax, headTilt: -8 * storm + 6 * relax * Math.sin(t * 3),
    flipL: { x: -150, y: K.lerp(-170, -70, relax) + 10 * Math.sin(t * 6) }, flipR: { x: K.lerp(150, 120, relax), y: K.lerp(-80, -230, K.E.back(relax, 1.6)) + 8 * Math.sin(t * 5) },
    footL: { x: -72, y: 0 }, footR: { x: 64, y: 0 },
  }, 0.2 + 0.72 * storm + 0.05 * Math.sin(t * 17) * storm, "gun");
  if (storm > 0.5) for (let k = 0; k < 3; k++) K.spray(ctx, x + 170, y, t - (T.ride + k * 2 * BEAT + 0.5), 1.2, 530 + k);
  K.rain(ctx, storm, { x: cam.x - 1100, y: cam.y - 700, w: 2400, h: 1500 });
}
