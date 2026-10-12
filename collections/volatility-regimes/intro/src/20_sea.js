/* ============================================================
   INTRO 20 SEA: the side set. Siggy surfs in on glassy calm water, checks
   the gauge on the board, spots a storm bank, rides the calm, and on
   "ride the storm" the regime flips: the lighthouse beam turns coral, the
   sky bruises, the wave stands up and a second big set follows (clustering).
   ============================================================ */
const SEA_H = 560;            /* horizon (world y) */
const BOARD_LEN = 400;

const camSea = K.mkTrack([
  [0, { x: 960, y: 140, z: 1 }],
  [T.tiltDown[1], { x: 960, y: 540, z: 1 }],
  [T.gauge, { x: 960, y: 540, z: 1 }],
  [T.gauge + 0.9, { x: 930, y: 700, z: 1.55 }],
  [T.horizon, { x: 980, y: 640, z: 1.3 }],
  [T.surprise + 0.5, { x: 1080, y: 610, z: 1.2 }],
  [T.calm, { x: 960, y: 545, z: 1.0 }],
  [T.storm, { x: 960, y: 540, z: 1.0 }],
  [T.storm + 0.6, { x: 900, y: 600, z: 1.07 }],
  [T.dial[1], { x: 900, y: 620, z: 1.16 }],
]);
/* regime: 0 calm -> 1 storm, flips on the "ride the storm" downbeat */
const stormAt = (t) => K.E.out3(K.inv(T.storm, T.storm + 0.42, t));
const waveH = (t) => 440 * K.E.back(K.inv(T.storm, T.storm + 0.6, t), 1.3);

/* the surfer: board under the feet, turtle on top. ang = board angle (deg) */
function surfer(x, y, ang, s, pose, gauge, kind) {
  const a = (ang * Math.PI) / 180, L = BOARD_LEN * s / 1.1;
  K.surfboard(ctx, x - Math.cos(a) * L * 0.5, y - Math.sin(a) * L * 0.5, L, ang, { gauge, kind: kind || "long", seed: 210 });
  K.turtle(ctx, x - Math.sin(a) * 4, y - 6, s, Object.assign({ lean: ang }, pose));
}

/* glint: a four-point print star */
function glint(x, y, r, a) {
  if (a <= 0) return;
  const pts = []; for (let i = 0; i < 8; i++) { const q = (i / 8) * K.TAU, rr = i % 2 ? r * 0.22 : r; pts.push([x + Math.cos(q) * rr, y + Math.sin(q) * rr]); }
  K.shape(ctx, pts, { fill: P.cream, w: 3, boil: 0.3, seed: 77, alpha: a, reg: false });
}

function seaPose(t) {
  const p = { seed: 700, blink: K.blinkAt(t, 3), squash: 0.07 * K.pulse(t, 1, 6), footL: { x: -66, y: 0 }, footR: { x: 58, y: 0 } };
  const bal = Math.sin(t * 2.2);
  p.flipL = { x: -120, y: -118 + 10 * bal }; p.flipR = { x: 118, y: -112 - 10 * bal };
  if (t < T.shaka) { p.squash += 0.12; p.mouth = "smile"; }
  else if (t < T.gauge) {
    /* shaka: right flipper up and waving, grin to camera, a glint on the shades */
    const u = K.inv(T.shaka, T.shaka + 0.25, t), wv = Math.sin((t - T.shaka) * K.TAU * 2.7) * 26 * K.inv(T.shaka + 0.2, T.shaka + 0.4, t);
    p.flipR = { x: K.lerp(118, 110 + wv, u), y: K.lerp(-112, -250, K.E.back(u, 1.6)) };
    p.mouth = "grin"; p.turn = 0.25; p.headTilt = -6 + 4 * Math.sin(t * 5);
  } else if (t < T.horizon) {
    /* looks down at the gauge on the nose of the board, taps it on beat 2 */
    p.turn = 0.75; p.headTilt = 14; p.mouth = "o"; p.shades = 16; p.look = [0.8, 0.9]; p.brow = 0.3;
    const tap = Math.exp(-14 * Math.max(0, t - T.tap)) * (t > T.tap ? 1 : 0);
    p.flipR = { x: 150, y: -60 + 50 * tap - 20 * K.inv(T.gauge, T.gauge + 0.3, t) };
    p.squash = 0.05 + 0.1 * tap;
    if (t > T.tap + 0.25) p.mouth = "smile";
  } else if (t < T.calm) {
    /* turns to the horizon; the storm bank: shades slide, eyes pop, "!" ; crouch */
    p.turn = 0.9; p.headTilt = -4;
    const sp = K.inv(T.surprise, T.surprise + 0.18, t);
    p.shades = 22 * sp; p.eyeUp = 3 * sp; p.brow = 1.4 * sp; p.mouth = sp > 0 ? "wow" : "smile"; p.look = [1, -0.3];
    p.exclaim = K.inv(T.surprise, T.surprise + 0.35, t) * (1 - K.inv(T.crouch + 0.2, T.calm, t));
    p.neck = 0.8 * sp * (1 - K.inv(T.crouch, T.crouch + 0.2, t));
    p.squash = -0.22 * sp * (1 - K.inv(T.crouch, T.crouch + 0.15, t)) + 0.32 * K.inv(T.crouch, T.crouch + 0.2, t);
    if (t > T.crouch) { p.mouth = "flat"; p.brow = -0.5; p.shades = 22 * (1 - K.inv(T.crouch, T.crouch + 0.2, t)); }
    p.blink = sp > 0 ? 0 : p.blink;
    p.flipL = { x: -100, y: -100 + 30 * sp }; p.flipR = { x: 110, y: -150 - 40 * sp };
  } else if (t < T.storm) {
    /* "Ride the calm": hop up, carve lazily, one flipper on the hip */
    const hopU = K.inv(T.calm, T.calm + 0.36, t);
    p.hop = Math.sin(hopU * Math.PI) * 34; p.squash = hopU < 1 ? -0.15 * Math.sin(hopU * Math.PI) : 0.06 * K.pulse(t, 1, 6);
    p.mouth = "smile"; p.turn = -0.15; p.headTilt = 6 * Math.sin(t * 2.4);
    p.flipL = { x: -64, y: -60 }; p.flipR = { x: 140, y: -150 + 12 * Math.sin(t * 4) };
  } else {
    /* "ride the storm": crouched, flippers out, big grin */
    const k = K.inv(T.storm, T.storm + 0.3, t);
    p.squash = 0.18 * k + 0.08 * K.pulse(t, 1, 6); p.mouth = "grin"; p.brow = 0.9; p.turn = -0.2; p.headTilt = -8;
    p.flipL = { x: -150, y: -170 + 12 * Math.sin(t * 7) }; p.flipR = { x: 150, y: -70 + 10 * Math.sin(t * 6) };
    p.footL = { x: -72, y: 0 }; p.footR = { x: 64, y: 0 };
  }
  return p;
}

function drawSea(t) {
  const cam = Object.assign({ rot: 0 }, camSea(t));
  if (t > T.storm) { const sh = Math.exp(-5 * (t - T.storm)); cam.x += 7 * sh * Math.sin(t * 61); cam.y += 6 * sh * Math.sin(t * 47); }
  K.begin(ctx, t, cam);
  K.applyCam(ctx, 1);
  const storm = stormAt(t);
  K.sky(ctx, SEA_H, { storm, sunX: 1180, sunY: 300, sunR: 130, top: -720 });
  /* storm bank rolling up on the horizon (from "horizon" until it takes the sky) */
  const bank = K.inv(T.horizon, T.storm, t);
  if (bank > 0 && storm < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - storm;
    [[0, 1.3, 0], [260, 1.0, 1], [-200, 0.9, 2]].forEach((c, i) => K.cloud(ctx, K.lerp(2500, 1480, K.E.out3(bank)) + c[0], 470 - i * 40 - 40 * bank, c[1] * (0.6 + 0.6 * bank), 20 + c[2], 1));
    ctx.restore();
  }
  K.farIsle(ctx, 380, SEA_H, 420, storm, 61);
  for (let i = 0; i < 3; i++) K.gull(ctx, ((300 + i * 260 + t * 60) % 2200) - 100, 160 + i * 50 + 10 * Math.sin(t + i), 0.9, 50 + i);
  /* lighthouse: beam colour = regime; it blinks on downbeats while calm, flashes on the flip */
  const flash = t > T.storm ? Math.exp(-4 * (t - T.storm)) : 0.5 * K.pulse(t, 4, 5) * K.inv(T.calm - 0.5, T.calm, t);
  K.lighthouse(ctx, 1730, SEA_H + 40, 0.72, { beam: K.mix(P.beamCalm, P.beamStorm, storm), ang: 0.22 + 0.16 * Math.sin(t * 1.1), flash, seed: 120 });
  K.ocean(ctx, SEA_H, { storm, vol: 0.12 + 0.88 * storm, bottom: 1240 });
  /* clustering: a second big set stands up behind */
  const h2 = 280 * K.E.back(K.inv(T.cluster, T.cluster + 0.5, t), 1.2);
  if (h2 > 6) K.surfWave(ctx, 1500 - 60 * (t - T.cluster), 860, h2, { storm, seed: 330, width: 900 });
  /* the hero wave under Siggy */
  const h = waveH(t), cx = 330 + 50 * Math.max(0, t - T.storm);
  if (h > 6) K.surfWave(ctx, cx, 1080, h, { storm, seed: 300 });
  /* Siggy's path: glide in, drift, then lifted onto the wave face */
  const bob = 8 * Math.sin(t * 2.6);
  let x = K.tw(t, T.surfIn[0], T.surfIn[1], -300, 820, K.E.out3) + 26 * Math.sin(t * 0.9) * K.inv(T.shaka, T.shaka + 1, t), y = 890 + bob, ang = -3 + 3 * Math.sin(t * 2.6 + 1);
  if (t > T.calm && t < T.storm + 0.5) { x += 60 * Math.sin((t - T.calm) * 2.2); ang += 6 * Math.sin((t - T.calm) * 2.2); }
  const k = K.E.inOut(K.inv(T.storm, T.storm + 0.5, t));
  if (k > 0) {
    const v = 0.5, wx = cx + 60 + (600 - 60) * (1 - v), wy = 1080 - h * (0.2 + 0.72 * v);
    x = K.lerp(x, wx + 30 * Math.sin(t * 3), k); y = K.lerp(y, wy + 10 * Math.sin(t * 4), k); ang = K.lerp(ang, 16 + 4 * Math.sin(t * 3), k);
  }
  const gauge = storm > 0 ? K.lerp(0.18, 0.92, K.E.back(K.inv(T.storm, T.storm + 0.5, t), 2)) + 0.03 * Math.sin(t * 23) * storm : 0.16 + 0.05 * K.pulse(t, 1, 5) + 0.06 * Math.exp(-8 * Math.max(0, t - T.tap)) * (t > T.tap ? 1 : 0);
  surfer(x, y, ang, 1.3, seaPose(t), gauge);
  if (t > T.storm) K.spray(ctx, x + 160, y - 10, t - T.storm - 0.1, 1.4, 501);
  /* glint on the shades */
  const ga = Math.max(0, 1 - Math.abs(t - T.shaka - 2 * BEAT) / 0.15);
  glint(x + 50, y - 345, 34, ga);
  K.rain(ctx, storm * K.inv(T.storm, T.storm + 0.3, t), { x: cam.x - 1100, y: cam.y - 700, w: 2400, h: 1500 });
}
