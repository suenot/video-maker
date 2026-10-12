/* ============================================================
   INTRO 40 FORECAST: "Measure the swell and read the sea". On the beach the
   surf-report board writes the GARCH(1,1) recursion in chalk; on "read the
   sea" its dial swings to storm and Siggy swaps the calm longboard for the
   coral storm gun. Then the camera tilts up into a clearing sky (title).
   ============================================================ */
const FC = { horizon: 450, sand: 700, board: { x: 690, y: 330, w: 1120, h: 290 } };
const FORMULA = ["σ^2_t = ω + α·ε^2_{t-1} + β·σ^2_{t-1}", "ω = 0.02   α = 0.10   β = 0.88"];
const RACK = { long: [1530, 905], gun: [1700, 905] };

const camFc = (t) => ({ x: 960 + 14 * Math.sin(t * 0.7), y: K.tw(t, T.tilt[0], T.tilt[1], 540, -200, K.E.in3), z: K.tw(t, T.board - 0.4, T.forecast + 1, 1.04, 1.0, K.E.out3), rot: 0 });

function fcPose(t) {
  const p = { seed: 700, blink: K.blinkAt(t, 5), squash: 0.07 * K.pulse(t, 1, 6), footL: { x: -44, y: 0 }, footR: { x: 44, y: 0 } };
  if (t < T.forecast) {
    /* reads the board, pointing with the left flipper, nods on the beat */
    p.turn = -0.75; p.shades = 18; p.look = [-1, -0.7]; p.mouth = "o"; p.brow = -0.3; p.headTilt = -6 + 5 * K.pulse(t, 1, 5);
    const r = K.inv(T.board, T.board + 0.35, t);
    p.flipL = { x: K.lerp(-90, -170, r), y: K.lerp(-80, -290, K.E.back(r, 1.6)) }; p.flipR = { x: 70, y: -40 };
  } else if (t < T.grab) {
    /* the dial swings: eyebrows up, then turns to the boards and hovers over the longboard */
    const k = K.inv(T.forecast, T.forecast + 0.25, t);
    p.turn = K.lerp(-0.6, 0.8, K.inv(T.forecast + BEAT, T.forecast + 1.4 * BEAT, t)); p.shades = 20 * (1 - K.inv(T.grab - 0.2, T.grab, t));
    p.look = [p.turn > 0 ? 1 : -1, -0.4]; p.eyeUp = 3 * k; p.brow = 1.2 * k; p.mouth = "open"; p.neck = 0.5 * k;
    p.flipL = { x: -100, y: -90 }; p.flipR = { x: K.lerp(90, 200, K.inv(T.forecast + BEAT, T.grab - 0.1, t)), y: -180 };
    if (t > T.forecast + 1.5 * BEAT) { p.mouth = "flat"; p.headTilt = 10 * Math.sin((t - T.forecast) * 14) * (1 - K.inv(T.grab - 0.2, T.grab, t)); } /* "nah" head shake */
  } else {
    /* holds the storm gun, grin, shaka with the other flipper */
    const k = K.inv(T.grab, T.grab + 0.3, t);
    p.turn = 0.2; p.mouth = "grin"; p.brow = 0.8; p.squash = 0.06 * K.pulse(t, 1, 6) - 0.12 * Math.sin(Math.min(1, k) * Math.PI);
    p.flipR = { x: 130, y: -140 }; p.flipL = { x: -130, y: K.lerp(-90, -250, K.E.back(K.inv(T.grab + BEAT, T.grab + BEAT + 0.3, t), 1.8)) };
  }
  return p;
}

function drawForecast(t) {
  const cam = camFc(t);
  K.begin(ctx, t, cam);
  K.applyCam(ctx, 1);
  /* the storm is clearing; during the tilt the sky goes back to sunset */
  const storm = 0.55 * (1 - K.inv(T.tilt[0], T.tilt[1], t));
  K.sky(ctx, FC.horizon, { storm, sunX: 1250, sunY: 300, sunR: 120, top: -1700, drift: 300 });
  K.farIsle(ctx, 260, FC.horizon, 380, storm, 63);
  K.lighthouse(ctx, 1800, FC.horizon + 30, 0.5, { beam: P.beamStorm, ang: 0.3 + 0.12 * Math.sin(t * 1.2), flash: 0.4 * K.pulse(t, 4, 5), seed: 140 });
  K.ocean(ctx, FC.horizon, { storm, vol: 0.7, bottom: FC.sand + 30, rows: 5 });
  K.beach(ctx, FC.sand, { seed: 44, storm });
  for (let i = 0; i < 2; i++) K.palm(ctx, i ? 1900 : 40, FC.sand + 60, 1.25 - i * 0.2, 90 + i * 7);
  /* the surf-report board */
  const b = FC.board, wr = K.inv(T.board + 0.1, T.forecast - 0.1, t);
  K.forecastBoard(ctx, b.x, b.y, b.w, b.h, [{ t: FORMULA[0], size: 58 }, { t: FORMULA[1], size: 42, c: P.creamShade }], { a: K.inv(T.board - 0.2, T.board + 0.15, t), write: wr, hi: /σ/, seed: 31 });
  /* the board's dial: swings to storm on "read the sea" */
  const da = K.inv(T.forecast - 0.1, T.forecast + 0.2, t);
  if (da > 0) {
    const s = K.popS(da), v = K.lerp(0.2, 0.9, K.E.back(K.inv(T.forecast, T.forecast + 0.5, t), 2.4)) + 0.02 * Math.sin(t * 19);
    ctx.save(); ctx.translate(b.x + b.w / 2 + 10, b.y - b.h / 2 + 10); ctx.scale(s, s);
    K.gauge(ctx, 0, 0, 92, v, { seed: 260 });
    ctx.restore();
  }
  /* the board rack: calm longboard, storm gun (stuck in the sand, nose up) */
  const g = K.E.inOut(K.inv(T.grab, T.grab + 0.28, t));
  const SX = 1240, SY = 1010, S = 1.15;
  K.surfboard(ctx, RACK.long[0], RACK.long[1], 560, -86 + 1.5 * Math.sin(t * 1.3), { kind: "long", seed: 230 });
  if (g < 1) K.surfboard(ctx, K.lerp(RACK.gun[0], SX + 160, g), K.lerp(RACK.gun[1], SY - 10, g), 520, K.lerp(-92, -80, g) + 1.5 * Math.sin(t * 1.5), { kind: "gun", seed: 240 });
  const pose = fcPose(t);
  if (g >= 1) { /* gun held upright on the right, behind the flipper */
    K.surfboard(ctx, SX + 160, SY - 10 - 20 * K.pulse(t, 1, 6), 520, -80, { kind: "gun", seed: 240 });
  }
  K.turtle(ctx, SX, SY, S, pose);
}
