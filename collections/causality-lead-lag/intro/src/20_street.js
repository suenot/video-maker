/* ============================================================
   INTRO 20 STREET: the rainy street set (opening and title).
   World: curb at y 760, wet road below, lamp at x 900.
   Opening (0 - 15.82):
     0     camera cranes down from the moon through the rain
     1.82  the lamp flickers on: the fox is under it
     2.82  he lifts his hat brim, eyes open (sly)
     3.84  "Lead and lag": two paw trails stamp across the road, one print a
           beat; A (amber, upper lane) leads, B (blue, lower lane) follows
     5.84  "step by step": the fox walks after them, magnifier out
     7.83  "follow the trail": camera trucks right with him
     11.85 "find the cause": push in on the two jumps; Δt bracket
     14.82 / 15.77 "test it twice": two stamps
   ============================================================ */
const CURB = 760, LAMP_X = 900;
/* paw trails: same path shape, B's jump is two prints after A's (the lag) */
const TR = { x0: 1250, dx: 150, n: 15, laneA: 880, laneB: 1010, jumpA: 6, lag: 2 };
const jumpY = (i, j) => (i === j ? -150 : i === j - 1 || i === j + 1 ? -55 : 0) + (i === j + 4 ? -50 : 0);
const trailPts = (lane, j) => { const p = []; for (let i = 0; i < TR.n; i++) p.push([TR.x0 + i * TR.dx, lane + jumpY(i, j)]); return p; };
const PRINT_T = (k, lagBeats) => at(1) + (k + (lagBeats || 0)) * BEAT; /* one print per beat */

const camStreet = K.mkTrack([
  [0, { x: 960, y: -420, z: 1 }],
  [at(0), { x: 1000, y: 520, z: 1 }],
  [at(2), { x: 1150, y: 560, z: 1 }],
  [at(4), { x: 1650, y: 680, z: 1.18 }],
  [at(5), { x: 2250, y: 660, z: 1.08 }],
  [at(5, 2), { x: 2290, y: 780, z: 1.32 }],
  [at(7), { x: 2300, y: 790, z: 1.38 }],
]);
const foxStreetX = K.mkSpline([[0, 1030], [at(2), 1030], [at(5), 1930], [at(7), 1960]]);

function lampOn(t) {
  if (t < at(0)) return 0;
  const d = t - at(0);
  if (d < 0.5) return [1, 0, 0.7, 0, 1, 0.2, 1][Math.floor(d * 14) % 7]; /* flicker on */
  return 1;
}

/* the side street: sky, skyline layers, buildings, lamp, road. extra(t) draws on the road plane */
function drawStreetSet(t, cam, opt) {
  const o = Object.assign({ lamp: lampOn(t), lights: [], extra: null, fg: null, flash: 0 }, opt || {});
  K.begin(ctx, t, cam);
  /* sky in screen space with a slow parallax moon */
  K.screen(ctx);
  K.nightSky(ctx, 0, 0, 1920, 1080, { moon: null, clouds: 0 });
  K.applyCam(ctx, 0.15);
  K.moon(ctx, 560, -300, 80, 7);
  K.applyCam(ctx, 0.25);
  for (let i = 0; i < 4; i++) {
    const cx = -600 + i * 900 + ((t * 14) % 900), cy = -180 + 90 * K.hash(i, 3);
    ctx.save(); ctx.globalAlpha = 0.8;
    K.shape(ctx, K.blobPts(cx, cy, 320, 44, 14, 5 + i * 7, 0.22), { fill: i % 2 ? P.cloud : P.cloudLight, stroke: P.ink, w: 3, boil: 1.4, seed: 40 + i, gap: 0.2, shade: { color: P.cloud, dx: 0, dy: -12 } });
    ctx.restore();
  }
  /* far skyline */
  K.applyCam(ctx, 0.45);
  K.skyline(ctx, -1400, 4200, 620, { seed: 5, tone: "far", hMin: 260, hMax: 640, wMin: 120, wMax: 220, lit: 0.22 });
  K.fog(ctx, -1400, 600, 5600, 90, 1);
  /* near buildings */
  K.applyCam(ctx, 0.8);
  K.skyline(ctx, -900, 5200, 700, { seed: 17, tone: "near", hMin: 330, hMax: 620, lit: 0.16 });
  /* street plane */
  K.applyCam(ctx, 1);
  const lights = [[LAMP_X + 70, P.amber, o.lamp]].concat(o.lights);
  K.street(ctx, -800, 5600, CURB, { lights, depth: 900, walk: 90 });
  K.ripples(ctx, -400, 5000, CURB + 40, CURB + 520, t, { n: 26, alpha: 0.4 });
  K.lamp(ctx, LAMP_X, CURB - 20, 1, { on: o.lamp });
  K.lamp(ctx, LAMP_X + 2300, CURB - 20, 1, { on: 0.55, seed: 37 });
  if (o.extra) o.extra(t);
  if (o.fg) o.fg(t);
  /* rain on top, in screen space */
  K.screen(ctx);
  K.rain(ctx, t, { n: 200, alpha: 0.32 });
  K.rain(ctx, t, { n: 70, alpha: 0.5, speed: 2300, len: 110, width: 3, seed: 77 });
  if (o.flash > 0) { ctx.fillStyle = K.rgba(P.moon, 0.55 * o.flash); ctx.fillRect(0, 0, 1920, 1080); }
}

/* trails + fox + magnifier for the opening */
function streetOpening(t) {
  const fx = foxStreetX(t), walking = t > at(2) && t < at(5);
  /* trails: A prints on the beat, B half a beat behind */
  const shownA = (t - PRINT_T(0)) / BEAT + 1, shownB = (t - PRINT_T(0) - BEAT / 2) / BEAT + 1;
  [[TR.laneA, TR.jumpA, P.A, shownA, 3], [TR.laneB, TR.jumpA + TR.lag, P.B, shownB, 9]].forEach(([lane, j, col, sh, seed]) => {
    if (sh <= 0) return;
    ctx.save(); ctx.translate(0, lane); ctx.scale(1, 0.62); ctx.translate(0, -lane);
    /* the path the prints trace: a faint price line through them */
    const tp = trailPts(lane, j).slice(0, Math.max(0, Math.min(TR.n, Math.floor(sh))));
    if (tp.length > 1) K.line(ctx, tp, { stroke: col, w: 5, boil: 1, seed: seed + 50, gap: 0.25, taper: false, alpha: 0.45 });
    trailPts(lane, j).forEach((q, i) => {
      const g = K.clamp(sh - i, 0, 1); if (g <= 0) return;
      const side = i % 2 ? 1 : -1, nxt = trailPts(lane, j)[Math.min(TR.n - 1, i + 1)], prv = trailPts(lane, j)[Math.max(0, i - 1)];
      K.paw(ctx, q[0], q[1] + side * 22, 0.95, Math.atan2(nxt[1] - prv[1], nxt[0] - prv[0]) * 0.6, col, g);
    });
    ctx.restore();
  });
  /* lane letters on tags at the start of each trail */
  K.tag(ctx, TR.x0 - 120, TR.laneA - 10, "A", { a: ap(t, at(1)), hot: true, size: 34, seed: 4, anchor: [TR.x0 - 170, TR.laneA - 50] });
  K.tag(ctx, TR.x0 - 120, TR.laneB - 10, "B", { a: ap(t, at(1, 0.5)), size: 34, seed: 6, anchor: [TR.x0 - 170, TR.laneB - 50] });
  /* Δt bracket over the two jumps */
  const xa = TR.x0 + TR.jumpA * TR.dx, xb = xa + TR.lag * TR.dx, bu = K.E.out3(ap(t, at(5, 1), 0.6));
  if (bu > 0) {
    const yA = TR.laneA - 150 * 0.62 - 40, yB = TR.laneB - 150 * 0.62 - 30;
    K.line(ctx, [[xa, yA], [xa, yA - 60]], { stroke: P.amberGlow, w: 5, boil: 0.8, seed: 61, alpha: bu, taper: false });
    K.line(ctx, [[xb, yB], [xb, yA - 60]], { stroke: P.amberGlow, w: 5, boil: 0.8, seed: 62, alpha: bu, taper: false });
    K.line(ctx, [[xa, yA - 60], [K.lerp(xa, xb, bu), yA - 60]], { stroke: P.amberGlow, w: 6, boil: 0.8, seed: 63, taper: false });
    K.tag(ctx, (xa + xb) / 2 + 30, yA - 130, "Δt = 2", { a: ap(t, at(5, 2)), hot: true, size: 40, seed: 12, anchor: [(xa + xb) / 2, yA - 62] });
  }
  /* the fox */
  const crouch = ap(t, at(5) - 0.3, 0.3) - ap(t, at(5) + 0.15, 0.3) * 0.6;
  const lifted = ap(t, at(0, 2), 0.4);
  const spotted = ap(t, at(1, 2), 0.3);
  const magOut = ap(t, at(2) - 0.2, 0.4);
  const lean = walking ? 6 : 4 * spotted * (1 - magOut);
  K.fox(ctx, fx, CURB + 40, 1.0, {
    seed: 700, light: lampOn(t) * (fx < 1400 ? 1 : 0.4),
    squash: 0.08 * K.pulse(t, 1, 6) + 0.25 * crouch, lean,
    legWalk: walking ? (fx - 1030) / 28 : 0, hop: walking ? Math.abs(Math.sin((fx - 1030) / 28)) * 5 : 0,
    lid: K.lerp(0.75, 0.32, lifted), blink: lifted > 0 ? K.blinkAt(t, 3) : 0,
    eyeUp: spotted * (1 - magOut) * 0.9, exclaim: spotted * (1 - ap(t, at(2), 0.3)),
    look: magOut > 0 ? [0.9, 0.7] : [spotted * 0.6, spotted * 0.9],
    mouth: spotted > 0 && magOut < 1 ? "o" : t > at(6) ? "grin" : "smirk",
    hatLift: 14 * lifted * (1 - spotted), hatTip: -10 * lifted * (1 - spotted),
    pawL: lifted > 0 && spotted < 1 ? { x: -40, y: -360 + 30 * spotted } : { x: -86, y: -100 },
    pawR: { x: K.lerp(86, 150, magOut) + 20 * crouch, y: K.lerp(-100, -170, magOut) + 60 * crouch },
    hold: magOut > 0 ? "magnifier" : null, tail: Math.sin(t * 3),
  });
}

/* two "test passed" stamps in screen space (amber ring + check) */
function drawStamps(t, times, pts) {
  K.screen(ctx);
  times.forEach((t0, i) => {
    const u = ap(t, t0, 0.3); if (u <= 0) return;
    const sc = 1 + 0.6 * (1 - K.E.out3(u)), [x, y] = pts[i];
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.2 + i * 0.12); ctx.scale(sc, sc); ctx.globalAlpha *= Math.min(1, u * 3) * 0.92;
    K.shape(ctx, K.ellipsePts(0, 0, 74, 74, 22), { fill: K.rgba(P.ink, 0.35), stroke: P.good, w: 10, boil: 1, seed: 300 + i, gap: 0.08 });
    K.line(ctx, [[-34, 0], [-8, 26], [38, -30]], { stroke: P.good, w: 16, boil: 0.8, seed: 310 + i, gap: 0, taper: false });
    ctx.restore();
  });
}

function drawStreetOpening(t) {
  const cam = Object.assign({ rot: 0 }, camStreet(t));
  drawStreetSet(t, cam, { extra: streetOpening, flash: K.flash(t, 1.0) * 0.35 + K.flash(t, at(4)) * 0.45 });
  drawStamps(t, [at(6, 2), at(6, 3.9)], [[1380, 250], [1600, 300]]);
}
